import { RouteParams } from './../../../shared/services/route-params';
import { ActivatedRoute } from '@angular/router';
import { EmployeeSecurityService } from './../../services/employee-security-service';
import {
  EmployeeTrainingHistoryLoadAction,
  EmployeeTrainingHistoryDeleteAction,
  EmployeeTrainingHistoryGetAction
} from '../../actions/employee.actions';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import * as Immutable from 'immutable';
import * as fromRoot from './../../../shared/reducers';
import { TrainingUserCourseModule } from '../../models/training-history.model';
import * as EmployeeActions from '../../actions/employee.actions';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { AeSortModel, SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { isNullOrUndefined } from "util";
import { CustomClaims } from '../../../shared/helpers/custom-claims';
import { Tristate } from "../../../atlas-elements/common/tristate.enum";

@Component({
  selector: 'training-history',
  templateUrl: './training-history.component.html',
  styleUrls: ['./training-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TrainingHistoryComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _btnStyle: AeClassStyle;
  private _trainingHistoryList: Observable<Immutable.List<TrainingUserCourseModule>>;
  private _dataSource = new BehaviorSubject<Immutable.List<TrainingUserCourseModule>>(Immutable.List([]));
  private _totalRecords: Observable<number>;
  private _dataTableOptions: Observable<DataTableOptions>
  private _trainingHistoryListLoaded$: Observable<boolean>
  private _trainingHistoryListLoadedSubscription: Subscription;
  private _showRemoveDialog: boolean = false;
  private _trainingDetailsToBeDeleted: TrainingUserCourseModule = null;
  private _keys = Immutable.List(['Id', 'IsAtlasTraining', 'ModuleTitle', 'CourseTitle', 'StartDate', 'PassDate', 'Certificates']);
  private _showEmpTrainingHistoryAddUpdateForm: boolean = false;
  private _operationMode: string = "add";
  private _employeeTrainingHistoryProgressStatusSubscription: Subscription;
  private _employeeTrainingHistoryGetStatusSubscription: Subscription;
  private _employeeTrainingHistoryListSubscription: Subscription;
  private _trainingUpdateActionSubscription: Subscription;
  private _trainingDeleteActionSubscription: Subscription;
  private _trainingRecordTypeSelectList: Immutable.List<AeSelectItem<string>>;
  private _trainigHistoryLoading: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private _selectedTrainingRecordType: string = '';
  private _preferredSortField: string = 'StartDate';
  private _preferredSortDirection: SortDirection = SortDirection.Ascending;
  private _preferredPageNumber: number = 1;
  private _preferredPageSize: number = 10;
  private _actions: Immutable.List<AeDataTableAction>;
  private _updateTraningHistory: Subject<TrainingUserCourseModule> = new Subject();
  private _removeTraningHistory: Subject<TrainingUserCourseModule> = new Subject();
  private _updateTraningHistorySubscription: Subscription;
  private _removeTraningHistorySubscription: Subscription;
  private _canUpdate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _employeeStateSub: Subscription;
  private _actionsUpdated: boolean = false;
  private _needToOpenSlideOut: boolean = false;
  // End of private Fields

  public get trainingRecordTypeSelectList() {
    return this._trainingRecordTypeSelectList;
  }

  public get canUpdate$() {
    return this._canUpdate$;
  }

  public get selectedTrainingRecordType() {
    return this._selectedTrainingRecordType;
  }

  public get btnStyle() {
    return this._btnStyle;
  }

  public get showRemoveDialog() {
    return this._showRemoveDialog;
  }

  public get showEmpTrainingHistoryAddUpdateForm() {
    return this._showEmpTrainingHistoryAddUpdateForm;
  }

  public get operationMode() {
    return this._operationMode;
  }

  public get keys() {
    return this._keys;
  }

  public get trainingHistoryList() {
    return this._trainingHistoryList;
  }

  public get actions() {
    return this._actions;
  }

  public get totalRecords() {
    return this._totalRecords;
  }

  public get dataTableOptions() {
    return this._dataTableOptions;
  }

  public get trainingHistoryListLoaded$() {
    return this._trainingHistoryListLoaded$;
  }

  public get trainingDetailsToBeDeleted() {
    return this._trainingDetailsToBeDeleted;
  }

  // Constructor  
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _employeeSecurityService: EmployeeSecurityService
    , private _activatedRoute: ActivatedRoute
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Public methods
  ngOnInit() {
    this._canUpdate();
    this._btnStyle = AeClassStyle.Light;
    this.initializeTrainingRecordTypeList();

    this._trainingHistoryListLoaded$ = this._store.let(fromRoot.getEmployeeTrainingHistoryListLoadingState);

    this._trainingHistoryListLoadedSubscription = this._trainingHistoryListLoaded$.subscribe(trainingHistoryListLoaded => {
      if (!trainingHistoryListLoaded) {
        let atlasParams: AtlasParams[] = new Array();
        this._store.dispatch(new EmployeeTrainingHistoryLoadAction(new AtlasApiRequestWithParams(this._preferredPageNumber, this._preferredPageSize, this._preferredSortField, this._preferredSortDirection, atlasParams)));
      }
    });


    this._trainingHistoryList = this._store.let(fromRoot.getEmployeeTrainingHistoryList);
    this._totalRecords = this._store.let(fromRoot.getEmployeeTrainingHistoryListTotalCount);
    this._dataTableOptions = this._store.let(fromRoot.getEmployeeTrainingHistoryListDataTableOptions);

    this._employeeTrainingHistoryProgressStatusSubscription = this._store.let(fromRoot.getEmployeeTrainingHistoryProgressStatus).subscribe(status => {
      if (!status) {
        this._showEmpTrainingHistoryAddUpdateForm = false;
      }
    });

    this._employeeTrainingHistoryGetStatusSubscription = this._store.let(fromRoot.getEmployeeTrainingHistoryGetStatus).subscribe(status => {
      if (status) {
        if (this._needToOpenSlideOut) {
          this._showEmpTrainingHistoryAddUpdateForm = true;
          this._operationMode = "update";
          this._cdRef.markForCheck();
        }
      }
    });

    this._updateTraningHistorySubscription = this._updateTraningHistory.subscribe(item => {
      this._needToOpenSlideOut = true;
      this._store.dispatch(new EmployeeTrainingHistoryGetAction({ EmployeeTrainingDetailsId: item.Id }));
    });

    this._removeTraningHistorySubscription = this._removeTraningHistory.subscribe(item => {
      this._showRemoveDialog = true;
      this._trainingDetailsToBeDeleted = item;
    });
  }
  ngOnDestroy() {
    if (this._employeeStateSub) {
      this._employeeStateSub.unsubscribe();
    }
    if (this._trainingHistoryListLoadedSubscription)
      this._trainingHistoryListLoadedSubscription.unsubscribe();
    if (this._employeeTrainingHistoryListSubscription)
      this._employeeTrainingHistoryListSubscription.unsubscribe();
    if (this._employeeTrainingHistoryProgressStatusSubscription)
      this._employeeTrainingHistoryProgressStatusSubscription.unsubscribe();
    if (this._employeeTrainingHistoryGetStatusSubscription)
      this._employeeTrainingHistoryGetStatusSubscription.unsubscribe();
    if (this._trainingUpdateActionSubscription)
      this._trainingUpdateActionSubscription.unsubscribe();
    if (this._trainingDeleteActionSubscription)
      this._trainingDeleteActionSubscription.unsubscribe();
    if (this._updateTraningHistorySubscription) {
      this._updateTraningHistorySubscription.unsubscribe();
    }
    if (this._removeTraningHistorySubscription) {
      this._removeTraningHistorySubscription.unsubscribe();
    }
  }
  public openEmpTrainingHistoryAddUpdateForm(e) {
    this._showEmpTrainingHistoryAddUpdateForm = true;
    this._operationMode = "add";
  }
  public onTrainingRecordTypeChange(e) {
    let atlasParams: AtlasParams[] = new Array();
    this._selectedTrainingRecordType = e.SelectedValue;
    if (e.SelectedValue != '') {
      atlasParams.push(new AtlasParams("IsAtlasTrainingUserCourseModule", e.SelectedValue));
    }
    this._store.dispatch(new EmployeeTrainingHistoryLoadAction(new AtlasApiRequestWithParams(1, this._preferredPageSize, this._preferredSortField, this._preferredSortDirection, atlasParams)));
  }
  public modalClosed(option) {
    if (option == 'yes') {
      this._store.dispatch(new EmployeeTrainingHistoryDeleteAction({ Id: this._trainingDetailsToBeDeleted.Id }));
    }
    this._showRemoveDialog = false;
    this._trainingDetailsToBeDeleted = null;
  }
  public closeEmpTrainingHistoryAddUpdateForm(e) {
    this._showEmpTrainingHistoryAddUpdateForm = false;
  }
  public getTrainingHistorySlideoutState(): string {
    return this._showEmpTrainingHistoryAddUpdateForm ? 'expanded' : 'collapsed';
  }

  public onGridPageChange($event) {
    this._preferredPageNumber = $event.pageNumber;
    this._preferredPageSize = $event.noOfRows;
    this._trainigHistoryLoading.next(true);
    let atlasParams: AtlasParams[] = new Array();
    if (this._selectedTrainingRecordType != '') {
      atlasParams.push(new AtlasParams("IsAtlasTrainingUserCourseModule", this._selectedTrainingRecordType));
    }
    this._store.dispatch(new EmployeeTrainingHistoryLoadAction(new AtlasApiRequestWithParams(this._preferredPageNumber, this._preferredPageSize, this._preferredSortField, this._preferredSortDirection, atlasParams)));
  }
  public onGridSort($event: AeSortModel) {
    this._trainigHistoryLoading.next(true);
    this._preferredPageNumber = 1;
    this._preferredSortField = $event.SortField;
    this._preferredSortDirection = $event.Direction;
    let atlasParams: AtlasParams[] = new Array();
    if (this._selectedTrainingRecordType != '') {
      atlasParams.push(new AtlasParams("IsAtlasTrainingUserCourseModule", this._selectedTrainingRecordType));
    }
    this._store.dispatch(new EmployeeTrainingHistoryLoadAction(new AtlasApiRequestWithParams(this._preferredPageNumber, this._preferredPageSize, this._preferredSortField, this._preferredSortDirection, atlasParams)));
  }
  public onCertificateDownLoad(docId: string) {
    window.open(this._getDownloadUrl(docId));
  }
  // End of public methods

  // Private methods 
  private _commandSelector(item: TrainingUserCourseModule) {
    if (!item.IsAtlasTraining) {
      return Tristate.True;
    } else {
      return Tristate.False;
    }
  }

  private initializeTrainingRecordTypeList() {
    this._trainingRecordTypeSelectList = Immutable.List(
      [
        new AeSelectItem<string>('All', '', false),
        new AeSelectItem<string>('Atlas Training', 'true', false),
        new AeSelectItem<string>('Non Atlas Training', 'false', false)
      ]
    );
  }
  private _setActions() {
    //Action buttons
    this._actions = Immutable.List([
      new AeDataTableAction("Update", this._updateTraningHistory, false, (item) => { return this._commandSelector(item) }),
      new AeDataTableAction("Remove", this._removeTraningHistory, false, (item) => { return this._commandSelector(item) })
    ]);
  }
  private _canUpdate() {
    const statePersonal = this._store.let(fromRoot.getEmployeePersonalData);
    this._employeeStateSub = statePersonal.subscribe((val) => {
      if (val) {
        this._canUpdate$.next(this._employeeSecurityService.CanUpdateHistory(val.Id));
        if (this._canUpdate$.value && !this._actionsUpdated) {
          this._setActions();
          this._actionsUpdated = true;
        }
      }
    });
  }

  private _getDownloadUrl(docId: string) {
    if (isNullOrUndefined(docId))
      return null;
    return this._routeParamsService.Cid ? `/filedownload?documentId=${docId}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${docId}`;
  }
  private _canShowUpdateAction(context: TrainingUserCourseModule) {
    return !context.IsAtlasTraining;
  }
  private _canShowRemoveAction(context: TrainingUserCourseModule) {
    return !context.IsAtlasTraining;
  }
  // End of private methods

}
