import { ActivatedRoute } from '@angular/router';
import { EmployeeSecurityService } from './../../services/employee-security-service';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequest } from './../../../shared/models/atlas-api-response';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import {
  EmployeeQualificationHistoryDeleteAction,
  EmployeeQualificationHistoryGetAction,
  EmployeeQualificationHistoryLoadAction
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
import { TrainingDetails } from '../../models/qualification-history.model';

@Component({
  selector: 'qualification-history',
  templateUrl: './qualification-history.component.html',
  styleUrls: ['./qualification-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class QualificationHistoryComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _btnStyle: AeClassStyle;
  private _qualificationHistoryList: Observable<Immutable.List<TrainingDetails>>;
  private _dataSource = new BehaviorSubject<Immutable.List<TrainingDetails>>(Immutable.List([]));
  private _updateAction = new Subject();
  private _removeAction = new Subject();
  private _totalRecords: Observable<number>;
  private _dataTableOptions: Observable<DataTableOptions>;
  private _qualificationHistoryListLoaded$: Observable<boolean>
  private _qualificationHistoryListLoadedSubscription: Subscription;
  private _showRemoveDialog: boolean = false;
  private _qualificationDetailsToBeDeleted: TrainingDetails = null;
  private _keys = Immutable.List(['Course', 'CourseCode', 'Qualification', 'ExpiryDate', 'DateStarted', 'DateCompleted']);
  private _showEmpQualificationHistoryAddUpdateForm: boolean = false;
  private _operationMode: string = "add";
  private _employeeQualificationHistoryProgressStatusSubscription: Subscription;
  private _employeeQualificationHistoryGetStatusSubscription: Subscription;
  private _employeeQualificationHistoryListSubscription: Subscription;
  private _qualificationUpdateActionSubscription: Subscription;
  private _qualificationDeleteActionSubscription: Subscription;
  private _qualificationHistoryListSubScription: Subscription;
  private _needToOpenSlideOut: boolean = false;

  private _preferredSortfield: string = "Course"
  private _preferredSortDirection: SortDirection = SortDirection.Ascending;
  private _isFirstTimeLoaded: boolean = true;
  private _preferredPageNumber: number = 1;
  private _preferredPageSize: number = 10;
  private _actions: Immutable.List<AeDataTableAction>;
  private _canUpdate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _employeeStateSub: Subscription;
  private _actionsUpdated: boolean = false;
  // End of private Fields

  public get canUpdate$() {
    return this._canUpdate$;
  }

  public get btnStyle() {
    return this._btnStyle;
  }

  public get actions() {
    return this._actions;
  }

  public get totalRecords() {
    return this._totalRecords;
  }

  public get qualificationHistoryList() {
    return this._qualificationHistoryList;
  }

  public get dataTableOptions() {
    return this._dataTableOptions;
  }

  public get qualificationHistoryListLoaded$() {
    return this._qualificationHistoryListLoaded$;
  }

  public get keys() {
    return this._keys;
  }

  public get showEmpQualificationHistoryAddUpdateForm() {
    return this._showEmpQualificationHistoryAddUpdateForm;
  }

  public get operationMode() {
    return this._operationMode;
  }

  public get showRemoveDialog() {
    return this._showRemoveDialog;
  }

  public get qualificationDetailsToBeDeleted() {
    return this._qualificationDetailsToBeDeleted;
  }

  // Constructor  
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _employeeSecurityService: EmployeeSecurityService
    , private _activatedRoute: ActivatedRoute
  ) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Public methods
  ngOnInit() {
    this._canUpdate();
    this._btnStyle = AeClassStyle.Light;

    this._qualificationHistoryListLoaded$ = this._store.let(fromRoot.getEmployeeQualificationHistoryListLoadingState);

    this._qualificationHistoryListLoadedSubscription = this._qualificationHistoryListLoaded$.subscribe(qualificationHistoryListLoaded => {
      if (!qualificationHistoryListLoaded && this._isFirstTimeLoaded) {
        this._isFirstTimeLoaded = false;
        this._store.dispatch(new EmployeeQualificationHistoryLoadAction(new AtlasApiRequest(this._preferredPageNumber, this._preferredPageSize, this._preferredSortfield, this._preferredSortDirection)));
      }
    });

    this._employeeQualificationHistoryProgressStatusSubscription = this._store.let(fromRoot.getEmployeeQualificationHistoryProgressStatus).subscribe(status => {
      if (!status) {
        this._showEmpQualificationHistoryAddUpdateForm = false;
      }
    });

    this._qualificationHistoryList = this._store.let(fromRoot.getEmployeeQualificationHistoryList);
    this._totalRecords = this._store.let(fromRoot.getEmployeeQualificationHistoryListTotalCount);
    this._dataTableOptions = this._store.let(fromRoot.getEmployeeQualificationHistoryListDataTableOptions);

    this._employeeQualificationHistoryGetStatusSubscription = this._store.let(fromRoot.getEmployeeQualificationHistoryGetStatus).subscribe(status => {
      if (status) {
        if (this._needToOpenSlideOut) {
          this._showEmpQualificationHistoryAddUpdateForm = true;
          this._operationMode = "update";
          this._cdRef.markForCheck();
        }
      }
    });

    this._qualificationUpdateActionSubscription = this._updateAction.subscribe(eq => {
      this._needToOpenSlideOut = true;
      let eqToBeUpdated: TrainingDetails = <TrainingDetails>eq;
      this._store.dispatch(new EmployeeQualificationHistoryGetAction({ EmployeeQualificationDetailsId: eqToBeUpdated.Id }));
    });

    this._qualificationDeleteActionSubscription = this._removeAction.subscribe(eq => {
      this._showRemoveDialog = true;
      this._qualificationDetailsToBeDeleted = <TrainingDetails>eq;
    });

  }

  ngOnDestroy() {
    if (this._qualificationHistoryListLoadedSubscription)
      this._qualificationHistoryListLoadedSubscription.unsubscribe();
    if (this._employeeQualificationHistoryProgressStatusSubscription)
      this._employeeQualificationHistoryProgressStatusSubscription.unsubscribe();
    if (this._employeeQualificationHistoryGetStatusSubscription)
      this._employeeQualificationHistoryGetStatusSubscription.unsubscribe();
    if (this._employeeQualificationHistoryListSubscription)
      this._employeeQualificationHistoryListSubscription.unsubscribe();
    if (this._qualificationUpdateActionSubscription)
      this._qualificationUpdateActionSubscription.unsubscribe();
    if (this._qualificationDeleteActionSubscription)
      this._qualificationDeleteActionSubscription.unsubscribe();
    if (this._qualificationHistoryListSubScription)
      this._qualificationHistoryListSubScription.unsubscribe();
    if (this._employeeStateSub) {
      this._employeeStateSub.unsubscribe();
    }
  }
  // End of public methods

  // Private methods
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

  public onGridPageChange($event) {
    this._preferredPageNumber = $event.pageNumber;
    this._preferredPageSize = $event.noOfRows;
    this._store.dispatch(new EmployeeQualificationHistoryLoadAction(new AtlasApiRequest(this._preferredPageNumber, this._preferredPageSize, this._preferredSortfield, this._preferredSortDirection)));
  }
  public onSortChange($event) {
    this._preferredPageNumber = 1;
    this._preferredSortfield = $event.SortField;
    this._preferredSortDirection = $event.Direction;
    this._store.dispatch(new EmployeeQualificationHistoryLoadAction(new AtlasApiRequest(this._preferredPageNumber, this._preferredPageSize, this._preferredSortfield, this._preferredSortDirection)));
  }

  private _setActions() {
    this._actions = Immutable.List([
      new AeDataTableAction("Update", this._updateAction, false),
      new AeDataTableAction("Remove", this._removeAction, false)
    ]);
  }

  public openEmpQualificationHistoryAddUpdateForm(e) {
    this._needToOpenSlideOut = true;
    this._showEmpQualificationHistoryAddUpdateForm = true;
    this._operationMode = "add";
  }

  public closeEmpQualificationHistoryAddUpdateForm(e) {
    this._showEmpQualificationHistoryAddUpdateForm = false;
  }

  public getQualificationHistorySlideoutState(): string {
    return this._showEmpQualificationHistoryAddUpdateForm ? 'expanded' : 'collapsed';
  }

  public modalClosed(option) {
    if (option == 'yes') {
      this._store.dispatch(new EmployeeQualificationHistoryDeleteAction({ Id: this._qualificationDetailsToBeDeleted.Id }));//TODO
    }
    this._showRemoveDialog = false;
    this._qualificationDetailsToBeDeleted = null;
  }
  // End of private methods

}
