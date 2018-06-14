import { CommonHelpers } from './../../../../shared/helpers/common-helpers';
import {
  Component
  , OnInit
  , ChangeDetectionStrategy
  , OnDestroy
  , ChangeDetectorRef
  , Input,
  EventEmitter,
  Output
} from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import {
  LocaleService
  , TranslationService
} from 'angular-l10n';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { ActivatedRoute } from '@angular/router';
import {
  BehaviorSubject
  , Subscription
  , Observable
  , Subject
} from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { MethodStatement, MSProcedure, ProcedureCode } from '../../../models/method-statement';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';
import { LoadProcedureGroupAction } from './../../../../shared/actions/lookup.actions';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import {
  DeleteMSProcedureAction
  , AddMSProcedureAction
  , UpdateMSProcedureAction
  , UpdateMSProcedureOrderAction
} from '../../actions/manage-methodstatement.actions';
import { ProcedureGroup } from './../../../../shared/models/proceduregroup';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';

@Component({
  selector: 'ms-procedure-container',
  templateUrl: './ms-procedure-container.component.html',
  styleUrls: ['./ms-procedure-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MsProcedureContainerComponent extends BaseComponent implements OnInit, OnDestroy {
  // private fields start
  private _procedureCode: ProcedureCode;
  private _addTrigger: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private _addTriggerSubscription: Subscription;
  private _viewMSProcedureCommand = new Subject();
  private _updateMSProcedureCommand = new Subject();
  private _removeMSProcedureCommand = new Subject();

  private _actions: Immutable.List<AeDataTableAction>;
  private _msProcedureData: BehaviorSubject<Array<MSProcedure>> = new BehaviorSubject([]);
  private _msProcedureGridData: BehaviorSubject<Immutable.List<MSProcedure>>
  = new BehaviorSubject(null);
  private _dataTableOptions$: BehaviorSubject<DataTableOptions> =
  new BehaviorSubject<DataTableOptions>(new DataTableOptions(1, 10));
  private _keys = Immutable.List(['Name', 'OrderIndex']);
  private _totalRecords$: BehaviorSubject<number> = new BehaviorSubject(0);
  private _pagingParams: Map<string, string> = new Map<string, string>();
  private _sortParams: Map<string, string> = new Map<string, string>();
  private _procedureGroupDataLoadStatus: BehaviorSubject<boolean>
  = new BehaviorSubject<boolean>(null);
  private _procedureGroups: Array<ProcedureGroup> = [];
  private _addMSProcSlideoutStatus: boolean;
  private _editMSProcSlideoutStatus: boolean;
  private _viewMSProcSlideoutStatus: boolean;
  private _showMSProcDeleteConfirmation: boolean;
  private _currentProcedure: MSProcedure;
  private _methodStatement: MethodStatement;
  private _lastIndex: number;

  private _procGroupDataSubscription: Subscription;
  private _procListSubscription: Subscription;
  private _removeSubscription: Subscription;
  private _updateSubscription: Subscription;
  private _viewSubscription: Subscription;
  private _dragRows: boolean = true;
  // end of private fields

  // getters start
  get showMSProcDeleteConfirmation() {
    return this._showMSProcDeleteConfirmation;
  }

  get msProcedureData() {
    return this._msProcedureData;
  }

  get actions() {
    return this._actions;
  }

  get dataTableOptions() {
    return this._dataTableOptions$.getValue();
  }

  get totalRecords() {
    return this._totalRecords$;
  }

  get methodStatementId() {
    if (!isNullOrUndefined(this._methodStatement)) {
      return this._methodStatement.Id;
    }
    return null;
  }

  get keys() {
    return this._keys;
  }

  get procedureGroupId() {
    if (!isNullOrUndefined(this._procedureGroups)) {
      let procedureGroup = this._procedureGroups.filter(c => c.Code === this._procedureCode);
      if (!isNullOrUndefined(procedureGroup) && procedureGroup.length > 0) {
        return procedureGroup[0].Id;
      }
    }
    return null;
  }

  get lastIndex() {
    return this._lastIndex;
  }

  get editMSProcSlideoutStatus() {
    return this._editMSProcSlideoutStatus;
  }

  get currentProcedure() {
    return this._currentProcedure;
  }

  get viewMSProcSlideoutStatus() {
    return this._viewMSProcSlideoutStatus;
  }

  get defaultButtonStyle() {
    return AeClassStyle.Default;
  }

  get lightButtonStyle() {
    return AeClassStyle.Light;
  }

  get procedureGroupName() {
    if (this._procedureCode == ProcedureCode.SafetyProcedures) {
      return 'safety procedures';
    } else if (this._procedureCode == ProcedureCode.SequenceOfEvents) {
      return 'sequence of events';
    }
  }

  get procedureToRemoveName() {
    if (!isNullOrUndefined(this._currentProcedure)) {
      return this._currentProcedure.Name;
    }
    return '';
  }

  get dragRows() {
    return this._dragRows;
  }
  set dragRows(val: boolean) {
    this._dragRows = val;
  }
  // getters end

  // public fields start
  @Input('procedureCode')
  get procedureCode() {
    return this._procedureCode;
  }
  set procedureCode(val: ProcedureCode) {
    this._procedureCode = val;
  }

  @Input('triggerAdd')
  get triggerAdd() {
    return this._addTrigger.getValue();
  }
  set triggerAdd(val: boolean) {
    this._addTrigger.next(val);
  }

  @Input('methodStatement')
  get methodStatement() {
    return this._methodStatement;
  }
  set methodStatement(val: MethodStatement) {
    this._methodStatement = val;
    if (!isNullOrUndefined(val)) {
      this._msProcedureData.next(val.MSProcedures);
    }
  }
  // end of public fields

  // outbut bindings start
  @Output()
  resetTiggerStatus: EventEmitter<boolean> = new EventEmitter<boolean>();
  // end of output bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _router: ActivatedRoute
  ) {
    super(_localeService, _translationService, _changeDetectordRef);

    this.id = 'msprocedurecontainer';
    this.name = 'msprocedurecontainer';
  }
  // End of constructor

  // private methods start

  private _loadMSProcGridData(source: Array<MSProcedure>) {
    let dataSource: Array<MSProcedure> = [];

    source = source || [];
    let procGroup = this._procedureGroups.find(c => c.Code == this._procedureCode);
    if (!isNullOrUndefined(procGroup)) {
      source = source.filter(c => c.ProcedureGroupId.toLowerCase() === procGroup.Id.toLowerCase())
        .filter(c => isNullOrUndefined(c['IsDeleted']) || c['IsDeleted'] != true);
    }

    if (source.length > 0) {
      this._lastIndex = source.map(c => c.OrderIndex).sort((a, b) => b - a)[0];
    } else {
      this._lastIndex = 0;
    }

    let sortField = this._sortParams.get('sortField');
    let direction = this._sortParams.get('direction') == SortDirection.Ascending.toString()
      ? SortDirection.Ascending
      : SortDirection.Descending;

    dataSource = CommonHelpers.sortArrayByIndex(source, sortField, direction);

    let pageNumber = parseInt(this._pagingParams.get('pageNumber'), 10);
    let pageSize = parseInt(this._pagingParams.get('pageSize'), 10);
    dataSource = this._getPaginatedSource(dataSource, pageSize, pageNumber);
    let count = (!isNullOrUndefined(source)
      ? source.length
      : 0);

    let datatableOptions = new DataTableOptions(pageNumber, pageSize, sortField, direction);

    this._dataTableOptions$.next(datatableOptions);
    if (pageNumber === 1) {
      this._totalRecords$.next(count);
    }
    this._msProcedureGridData.next(Immutable.List(dataSource));
  }

  private _getPaginatedSource(source: Array<MSProcedure>
    , pageSize: number
    , pageNumber: number) {
    if (isNullOrUndefined(source) ||
      source.length < 1) {
      return source;
    }
    let currentPageNumber = pageNumber - 1;
    return source.slice(currentPageNumber * pageSize, (pageNumber) * pageSize);
  }

  onPageChange($event) {
    this._pagingParams.set('pageNumber', $event.pageNumber);
    this._pagingParams.set('pageSize', $event.noOfRows);
    this._loadMSProcGridData(this._msProcedureData.getValue());
  }

  onSort($event) {
    this._sortParams.set('sortField', $event.SortField);
    this._sortParams.set('direction', $event.Direction);
    this._pagingParams.set('pageNumber', '1');
    this._loadMSProcGridData(this._msProcedureData.getValue());
  }
  // end of private methods

  // public methods start
  public closeAddMSProcSlideout(e) {
    this._addMSProcSlideoutStatus = false;
  }

  public getAddMSProcSlideoutClass() {
    return this._addMSProcSlideoutStatus ? 'expanded' : 'collapsed';
  }

  get addMSProcSlideoutStatus() {
    return this._addMSProcSlideoutStatus;
  }

  get msProcedureGridData() {
    return this._msProcedureGridData;
  }

  public closeEditMSProcSlideout(e) {
    this._editMSProcSlideoutStatus = false;
    this._currentProcedure = null;
  }

  public getEditMSProcSlideoutClass() {
    return this._editMSProcSlideoutStatus ? 'expanded' : 'collapsed';
  }

  public getViewMSProcSlideoutClass() {
    return this._viewMSProcSlideoutStatus ? 'expanded' : 'collapsed';
  }

  public onMSProcedureUpdate(dataToSave: MSProcedure) {
    this._store.dispatch(new UpdateMSProcedureAction(dataToSave));
    this._editMSProcSlideoutStatus = false;
  }

  public closeViewMSProcSlideout(e) {
    this._viewMSProcSlideoutStatus = false;
    this._currentProcedure = null;
  }

  public onDeleteConfirmationClosed(status: string) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(status)) {
      if (status === 'No') {
        this._currentProcedure = null;
        this._showMSProcDeleteConfirmation = false;
      } else if (status === 'Yes') {
        this._showMSProcDeleteConfirmation = false;
        this._pagingParams.set('pageNumber', '1');
        this._store.dispatch(new DeleteMSProcedureAction(this._currentProcedure.Id));
        this._currentProcedure = null;
      }
    }
  }

  public onMSProcedureAdd(msProcedures: Array<MSProcedure>) {
    let proceduresToSave = msProcedures.slice(0).sort((a, b) => { return a.OrderIndex - b.OrderIndex; });
    let sequenceId = (this._lastIndex || 0);
    proceduresToSave.forEach((item) => {
      sequenceId = sequenceId + 1;
      item.OrderIndex = sequenceId;
      item.MethodStatementId = this._methodStatement.Id;
      item.CompanyId = this._methodStatement.CompanyId;
      item.Code = this._procedureCode;
    });
    this._store.dispatch(new AddMSProcedureAction(proceduresToSave));
    this._addMSProcSlideoutStatus = false;
  }

  public dropCompleted(currentDataSet: Immutable.List<MSProcedure>) {
    if (!isNullOrUndefined(currentDataSet) &&
      currentDataSet.count() > 0) {

      currentDataSet.forEach(c => {
        if (!isNullOrUndefined(c['Author'])) {
          c['Author'] = null;
        }

        if (!isNullOrUndefined(c['Modifier'])) {
          c['Modifier'] = null;
        }

        if (!isNullOrUndefined(c['MethodStatement'])) {
          c['MethodStatement'] = null;
        }

        if (!isNullOrUndefined(c['ProcedureGroup'])) {
          c['ProcedureGroup'] = null;
        }

        if (!isNullOrUndefined(c['Prototype'])) {
          c['Prototype'] = null;
        }
      });
      let allItems: MSProcedure[] = currentDataSet.toJS();
      this._store.dispatch(new UpdateMSProcedureOrderAction(allItems));
    }
  }

  ngOnInit() {
    this._actions = Immutable.List([
      new AeDataTableAction('View', this._viewMSProcedureCommand, false),
      new AeDataTableAction('Update', this._updateMSProcedureCommand, false),
      new AeDataTableAction('Remove', this._removeMSProcedureCommand, false)
    ]);

    this._addTriggerSubscription = this._addTrigger.subscribe((status) => {
      if (!isNullOrUndefined(status) && status) {
        this._addMSProcSlideoutStatus = true;
        this.resetTiggerStatus.emit(null);
      }
    });

    this._procGroupDataSubscription = Observable.combineLatest(this._procedureGroupDataLoadStatus,
      this._msProcedureData).subscribe((vals) => {
        if (StringHelper.coerceBooleanProperty(vals[0]) &&
          !isNullOrUndefined(vals[1])) {

          if (this._pagingParams.size <= 0) {
            this._pagingParams.set('pageNumber', '1');
            this._pagingParams.set('pageSize', '10');
          }

          if (this._sortParams.size <= 0) {
            this._sortParams.set('sortField', 'OrderIndex');
            this._sortParams.set('direction', SortDirection.Ascending.toString());
          }

          this._loadMSProcGridData(this._msProcedureData.getValue());
        }
      });

    this._procListSubscription = this._store.let(fromRoot.getProcedureGroupListData).subscribe((groups) => {
      if (!isNullOrUndefined(groups) && groups.length > 0) {
        this._procedureGroups = groups;
        this._procedureGroupDataLoadStatus.next(true);
      } else {
        this._store.dispatch(new LoadProcedureGroupAction());
      }
    });

    this._removeSubscription = this._removeMSProcedureCommand.subscribe((rowData: MSProcedure) => {
      this._currentProcedure = rowData;
      this._showMSProcDeleteConfirmation = true;
    });

    this._updateSubscription = this._updateMSProcedureCommand.subscribe((rowData: MSProcedure) => {
      this._currentProcedure = rowData;
      this._editMSProcSlideoutStatus = true;
    });

    this._viewSubscription = this._viewMSProcedureCommand.subscribe((rowData: MSProcedure) => {
      this._currentProcedure = rowData;
      this._viewMSProcSlideoutStatus = true;
    });
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._addTriggerSubscription)) {
      this._addTriggerSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._procGroupDataSubscription)) {
      this._procGroupDataSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._procListSubscription)) {
      this._procListSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._removeSubscription)) {
      this._removeSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._updateSubscription)) {
      this._updateSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._viewSubscription)) {
      this._viewSubscription.unsubscribe();
    }
  }
  // End of public methods
}
