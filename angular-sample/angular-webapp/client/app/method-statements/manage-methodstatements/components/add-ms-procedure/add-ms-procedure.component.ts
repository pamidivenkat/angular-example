import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { MethodStatement, MSProcedure } from '../../../models/method-statement';
import { Procedure } from '../../../procedures/models/procedure';
import {
  AddProcedureForMSAction,
  ClearAddProceduresSlideState,
  LoadProceduresForMSAction,
} from '../../actions/manage-methodstatement.actions';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';
import { BaseComponent } from './../../../../shared/base-component';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import * as fromRoot from './../../../../shared/reducers';
import { ProcedureService } from './../../../procedures/services/procedure.service';

@Component({
  selector: 'add-ms-procedure',
  templateUrl: './add-ms-procedure.component.html',
  styleUrls: ['./add-ms-procedure.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AddMsProcedureComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _procedureTypes: Immutable.List<AeSelectItem<string>> = Immutable.List<AeSelectItem<string>>([]);
  private _filterType: string = 'All';

  private _procedureLoading$: Observable<boolean>;
  private _procedureStore$: BehaviorSubject<Immutable.List<Procedure>> = new BehaviorSubject<Immutable.List<Procedure>>(null);
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _totalRecords$: Observable<number> = Observable.of(0);
  private _pagingParams: Map<string, string> = new Map<string, string>();
  private _sortingParams: Map<string, string> = new Map<string, string>();
  private _filterParams: Map<string, string> = new Map<string, string>();
  private _procedureGroupDataLoadStatus: BehaviorSubject<boolean>
  = new BehaviorSubject<boolean>(null);
  private _keys = Immutable.List(['Name', 'IsSelected']);
  private _selectedProcCount: number = 0;
  private _selectedProcedures: Array<MSProcedure> = [];
  private _lastIndex: number;
  private _methodStatementId: string;
  private _methodStatement: MethodStatement;
  private _procedureGroupId: string;
  private _showNewProcedurePanel: boolean;
  private _viewProcSlideoutStatus: boolean = false;
  private _procedureForView: Procedure;
  private _procedureListSubscription: Subscription;
  private _addBtnText: string = 'MANAGE_METHOD_STM.SEQUENCE_OF_EVENTS.ADD_PROCEDURES';
  private _isExampleMS: boolean = false;
  // End of Private Fields

  // getters start
  get procedureForView() {
    return this._procedureForView;
  }

  get viewProcSlideoutStatus() {
    return this._viewProcSlideoutStatus;
  }

  get procedureTypes() {
    return this._procedureTypes;
  }

  get filterType() {
    return this._filterType;
  }
  set filterType(val: string) {
    this._filterType = val;
  }

  get selectedProcCount() {
    return this._selectedProcCount;
  }

  get showNewProcedurePanel() {
    return this._showNewProcedurePanel;
  }

  get defaultButtonStyle() {
    return AeClassStyle.Default;
  }

  get addBtnText() {
    return this._addBtnText;
  }

  get isExampleMS() {
    return this._isExampleMS;
  }

  get keys(): any {
    return this._keys;
  }

  get procedureStore$(): BehaviorSubject<Immutable.List<Procedure>> {
    return this._procedureStore$;
  }

  get totalRecords$(): Observable<number> {
    return this._totalRecords$;
  }

  get dataTableOptions$(): Observable<DataTableOptions> {
    return this._dataTableOptions$;
  }

  get procedureLoading$(): Observable<boolean> {
    return this._procedureLoading$;
  }
  // end of getters

  // Public properties
  @Input('methodStatement')
  get methodStatementId() {
    return this._methodStatement;
  }
  set methodStatementId(val: MethodStatement) {
    this._methodStatement = val;

    if (!isNullOrUndefined(val)) {
      this._isExampleMS = val.IsExample;
    }
  }

  @Input('procedureGroupId')
  get procedureGroupId() {
    return this._procedureGroupId;
  }
  set procedureGroupId(val: string) {
    this._procedureGroupId = val;
  }
  // End of Public properties

  // Public Output bindings
  @Output()
  closeAddMSProcPanel: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  addSelectedProcedures: EventEmitter<Array<MSProcedure>> = new EventEmitter<Array<MSProcedure>>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectorRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _procedureService: ProcedureService
  ) {
    super(_localeService, _translationService, _changeDetectorRef);
    this.id = 'AddMSProcedure';
    this.name = 'AddMSProcedure';
  }
  // End of constructor


  // Private methods 
  private _setProcedureType() {
    this._procedureTypes = Immutable.List([
      new AeSelectItem('All', 'All', false),
      new AeSelectItem('Examples', 'Examples', false),
      new AeSelectItem('Own', 'Owned', false)
    ]);
    this._filterType = 'All';
  }

  private _setDefaultParams() {
    this._pagingParams = new Map<string, string>();
    this._pagingParams.set('pageNumber', '1');
    this._pagingParams.set('pageSize', '10');
    this._pagingParams.set('TotalCount', '0');

    this._sortingParams = new Map<string, string>();
    this._sortingParams.set('sortField', 'Name');
    this._sortingParams.set('direction', SortDirection[SortDirection.Ascending]);

    this._filterParams = new Map<string, string>();
    this._filterParams.set('ProcedureGroup', this.procedureGroupId);
    this._filterParams.set('MethodStatementId', this._methodStatement && this._methodStatement.Id);

    if (this.isExampleMS) {
      this._filterType = 'Examples';
      this._filterParams.set('exampleType', 'Examples');
      this._filterParams.set('example', 'true');
    } else {
      this._filterType = 'All';
      this._filterParams.set('exampleType', 'All');
      this._filterParams.set('example', 'true');
    }

    this._loadProcedureGridData();
  }

  private _loadProcedureGridData() {
    let params: Array<AtlasParams> = [];
    this._filterParams.forEach((v, k) => {
      params.push(new AtlasParams(k, v));
    });

    let apiParams: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(
      parseInt(this._pagingParams.get('pageNumber'), 10),
      parseInt(this._pagingParams.get('pageSize'), 10),
      this._sortingParams.get('sortField'),
      SortDirection[this._sortingParams.get('direction')],
      params
    );
    this._store.dispatch(new LoadProceduresForMSAction(apiParams));
  }
  // End of private methods

  // Public methods
  public onPageChange($event) {
    this._pagingParams.set('pageNumber', $event.pageNumber);
    this._pagingParams.set('pageSize', $event.noOfRows);

    this._loadProcedureGridData();
  }

  public onSort($event) {
    this._sortingParams.set('sortField', $event.SortField);
    this._sortingParams.set('direction', SortDirection[$event.Direction]);
    this._pagingParams.set('pageNumber', '1');

    this._loadProcedureGridData();
  }

  closeViewProcSlideout(e) {
    this._viewProcSlideoutStatus = false;
  }

  public changeFilterType(e) {
    this._filterType = e.SelectedItem.Value;
    this._filterParams.set('exampleType', this._filterType);
    if (this._filterType === 'All' || this._filterType === 'Examples') {
      this._filterParams.set('example', 'true');
    } else {
      this._filterParams.set('example', 'false');
    }

    this._selectedProcCount = this._selectedProcedures.length;
    this._pagingParams.set('pageNumber', '1');
    this._sortingParams.set('direction', SortDirection[SortDirection.Ascending]);

    this._loadProcedureGridData();
  }

  public getFieldValue(rowIndex, property) {
    let fieldValue;
    let procedures = this._procedureStore$.getValue();
    if (!isNullOrUndefined(procedures) &&
      procedures.count() > 0) {
      let procedure = procedures.get(rowIndex);
      let props = property.split('.');
      if (!isNullOrUndefined(procedure)) {
        fieldValue = procedure[property];
      }
    }
    return fieldValue;
  }

  public onProcSelectionChanged(value, context, property) {
    let procedures = this._procedureStore$.getValue();
    let selProc = procedures.get(context.Row);
    if (!isNullOrUndefined(selProc)) {
      if (StringHelper.coerceBooleanProperty(value)) {
        // this._selectedProcCount = this._selectedProcCount + 1;

        let msProc = new MSProcedure();
        msProc.Name = selProc.Name;
        msProc.Description = selProc.Description;
        msProc.PrototypeId = selProc.Id;
        msProc.ProcedureGroupId = selProc.ProcedureGroupId;
        msProc.OrderIndex = (this._lastIndex || 0) + 1;
        msProc.IsExample = selProc.IsExample;

        this._selectedProcedures.push(msProc);
      } else {
        // this._selectedProcCount = this._selectedProcCount - 1;
        this._selectedProcedures = this._selectedProcedures.filter(c => c.PrototypeId.toLowerCase() !== selProc.Id.toLowerCase());
      }

      if (!isNullOrUndefined(this._selectedProcedures)) {
        this._selectedProcCount = this._selectedProcedures.length;
      } else {
        this._selectedProcCount = 0;
      }

      if (this._selectedProcCount > 0) {
        this._addBtnText = 'MANAGE_METHOD_STM.SEQUENCE_OF_EVENTS.ADD_SELECTED_PROCEDURES';
      } else {
        this._addBtnText = 'MANAGE_METHOD_STM.SEQUENCE_OF_EVENTS.ADD_PROCEDURES';
      }
    }
  }

  public closeAddMSProcSlideOut(e) {
    this._store.dispatch(new ClearAddProceduresSlideState(true));
    this.closeAddMSProcPanel.emit(true);
  }

  public getNewProcedureSlideoutState() {
    return this._showNewProcedurePanel ? 'expanded' : 'collapsed';
  }

  public closeNewProcedurePanel(e) {
    this._showNewProcedurePanel = false;
  }

  public addNewProcedure(e) {
    this._showNewProcedurePanel = true;
  }

  public getViewProcSlideoutClass() {
    return this._viewProcSlideoutStatus ? 'expanded' : 'collapsed';
  }

  public onProcedureAdd(dataToSave) {
    let procedureToSave: Procedure = new Procedure();
    procedureToSave.Description = dataToSave.Description;
    procedureToSave.Name = dataToSave.Name;
    procedureToSave.CompanyId = this._methodStatement.CompanyId;
    procedureToSave.IsExample = this._methodStatement.IsExample;
    procedureToSave.ProcedureGroupId = this.procedureGroupId;
    this._store.dispatch(new AddProcedureForMSAction(procedureToSave));
    this._showNewProcedurePanel = false;
  }

  public onAddSelectedMSProcs(e) {
    if (!isNullOrUndefined(this._selectedProcedures) &&
      this._selectedProcedures.length > 0) {
      this.addSelectedProcedures.emit(this._selectedProcedures);
    }
  }

  public showProcQuickInfo(ctx) {
    let procedures = this._procedureStore$.getValue();
    let selProc = procedures.get(ctx.Row);
    if (!isNullOrUndefined(selProc)) {
      this._procedureForView = selProc;
      this._viewProcSlideoutStatus = true;
    }
  }

  ngOnInit() {
    this._setProcedureType();

    this._procedureLoading$ = this._store.let(fromRoot.getProceduresForMSLoadStatusValue);
    this._procedureListSubscription = this._store.let(fromRoot.getProceduresForMSData).subscribe((data) => {
      if (!isNullOrUndefined(data)) {
        data = data.map((item) => {
          if (this._selectedProcedures.findIndex(c => c.PrototypeId.toLowerCase() ===
            item.Id.toLowerCase()) !== -1) {
            item.IsSelected = true;
          } else {
            item.IsSelected = false;
          }
          return item;
        }).toList();
        this._procedureStore$.next(data);
        this._cdRef.markForCheck();
      }
    });
    this._totalRecords$ = this._store.let(fromRoot.getProcedureForMSTotalCountNumber);
    this._dataTableOptions$ = this._store.let(fromRoot.getProcedureForMSDataTableOptionsData);
    this._setDefaultParams();
  }
  ngOnDestroy() {
    if (!isNullOrUndefined(this._procedureListSubscription)) {
      this._procedureListSubscription.unsubscribe();
    }
  }
  // End of public methods
}
