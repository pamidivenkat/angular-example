import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeSecurityService } from './../../services/employee-security-service';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequest } from './../../../shared/models/atlas-api-response';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import {
  EmployeeEducationHistoryDeleteAction,
  EmployeeEducationHistoryGetAction,
  EmployeeEducationHistoryLoadAction
} from '../../actions/employee.actions';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import * as Immutable from 'immutable';
import * as fromRoot from './../../../shared/reducers';
import { EducationDetails } from '../../models/education-history.model';

@Component({
  selector: 'education-history',
  templateUrl: './education-history.component.html',
  styleUrls: ['./education-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EducationHistoryComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _btnStyle: AeClassStyle = AeClassStyle.Light;
  private _educationHistoryList: Observable<Immutable.List<EducationDetails>>;
  private _dataSource = new BehaviorSubject<Immutable.List<EducationDetails>>(Immutable.List([]));
  private _updateAction = new Subject();
  private _removeAction = new Subject();
  private _totalRecords: Observable<number>;
  private _dataTableOptions: Observable<DataTableOptions>;
  private _educationHistoryListLoaded$: Observable<boolean>;
  private _educationHistoryListLoadedSubscription: Subscription;
  private _showRemoveDialog: boolean = false;
  private _educationDetailsToBeDeleted: EducationDetails = null;
  private _keys = Immutable.List(['Institution', 'Qualification', 'StartDate', 'EndDate']);
  private _showEmpEducationHistoryAddUpdateForm: boolean = false;
  private _operationMode: string = "add";
  private _employeeEducationHistoryProgressStatusSubscription: Subscription;
  private _employeeEducationHistoryGetStatusSubscription: Subscription;
  private _employeeEducationHistoryListSubscription: Subscription;
  private _employeeUpdateActionSubscription: Subscription;
  private _employeeDeleteActionSubscription: Subscription;
  private _needToOpenSlideOut: boolean = false;
  private _preferredSortfield: string = "Institution"
  private _preferredSortDirection: SortDirection = SortDirection.Ascending;
  private _isFirstTimeLoaded: boolean = true;
  private _preferredPageNumber: number = 1;
  private _preferredPageSize: number = 10;
  private _actions: Immutable.List<AeDataTableAction>;
  private _canUpdate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _employeePersonalStateSub: Subscription;
  private _actionsUpdated: boolean = false;
  // End of private Fields

  // Constructor 
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _employeeSecurityService: EmployeeSecurityService
    , private _activatedRoute: ActivatedRoute
    , private _router: Router
  ) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Public methods
  get keys() {
    return this._keys;
  }

  get btnStyle() {
    return this._btnStyle;
  }

  get actions() {
    return this._actions;
  }

  get showRemoveDialog() {
    return this._showRemoveDialog;
  }

  get educationHistoryListLoaded$(): Observable<boolean> {
    return this._educationHistoryListLoaded$;
  }

  get canUpdate$() {
    return this._canUpdate$;
  }

  get dataTableOptions() {
    return this._dataTableOptions;
  }

  get showEmpEducationHistoryAddUpdateForm() {
    return this._showEmpEducationHistoryAddUpdateForm;
  }

  get educationHistoryList() {
    return this._educationHistoryList;
  }

  get totalRecords() {
    return this._totalRecords;
  }

  get operationMode() {
    return this._operationMode;
  }


  ngOnInit() {
    this._canUpdate();
    this._btnStyle = AeClassStyle.Light;

    this._educationHistoryListLoaded$ = this._store.let(fromRoot.getEmployeeEducationHistoryListLoadingState);

    this._educationHistoryListLoadedSubscription = this._educationHistoryListLoaded$.subscribe(educationHistoryListLoaded => {
      if (!educationHistoryListLoaded && this._isFirstTimeLoaded) {
        this._isFirstTimeLoaded = false;
        this._store.dispatch(new EmployeeEducationHistoryLoadAction(new AtlasApiRequest(this._preferredPageNumber, this._preferredPageSize, this._preferredSortfield, this._preferredSortDirection)));
      }

    });

    this._employeeEducationHistoryProgressStatusSubscription = this._store.let(fromRoot.getEmployeeEducationHistoryProgressStatus).subscribe(status => {
      if (!status) {
        this._showEmpEducationHistoryAddUpdateForm = false;
        this._cdRef.markForCheck();
      }
    });

    this._educationHistoryList = this._store.let(fromRoot.getEmployeeEducationHistoryList);
    this._totalRecords = this._store.let(fromRoot.getEmployeeEducationHistoryListTotalCount);
    this._dataTableOptions = this._store.let(fromRoot.getEmployeeEducationHistoryListDataTableOptions);

    this._employeeEducationHistoryGetStatusSubscription = this._store.let(fromRoot.getEmployeeEducationHistoryGetStatus).subscribe(status => {
      if (status) {
        if (this._needToOpenSlideOut) {
          this._showEmpEducationHistoryAddUpdateForm = true;
          this._operationMode = "update";
          this._cdRef.markForCheck();
        }
      }
    });

    this._employeeUpdateActionSubscription = this._updateAction.subscribe(ed => {
      this._needToOpenSlideOut = true;
      let edToBeUpdated: EducationDetails = <EducationDetails>ed;
      this._store.dispatch(new EmployeeEducationHistoryGetAction({ EmployeeEducationDetailsId: edToBeUpdated.Id }));//TODO
    });

    this._employeeDeleteActionSubscription = this._removeAction.subscribe(ed => {
      this._showRemoveDialog = true;
      this._educationDetailsToBeDeleted = <EducationDetails>ed;
    });

  }

  ngOnDestroy() {
    if (this._educationHistoryListLoadedSubscription)
      this._educationHistoryListLoadedSubscription.unsubscribe();
    if (this._employeeEducationHistoryProgressStatusSubscription)
      this._employeeEducationHistoryProgressStatusSubscription.unsubscribe();
    if (this._employeeEducationHistoryGetStatusSubscription)
      this._employeeEducationHistoryGetStatusSubscription.unsubscribe();
    if (this._employeeEducationHistoryListSubscription)
      this._employeeEducationHistoryListSubscription.unsubscribe();
    if (this._employeeUpdateActionSubscription)
      this._employeeUpdateActionSubscription.unsubscribe();
    if (this._employeeDeleteActionSubscription)
      this._employeeDeleteActionSubscription.unsubscribe();
    if (this._employeePersonalStateSub) {
      this._employeePersonalStateSub.unsubscribe();
    }
  }
  // End of public methods

  // Private methods
  private _canUpdate() {
    const statePersonal = this._store.let(fromRoot.getEmployeePersonalData);
    this._employeePersonalStateSub = statePersonal.subscribe((val) => {
      if (val && !this._actionsUpdated) {
        this._canUpdate$.next(this._employeeSecurityService.CanUpdateHistory(val.Id));
        this._setActions();
        this._actionsUpdated = true;
      }
    });
  }

  onGridPageChange($event) {
    this._preferredPageNumber = $event.pageNumber;
    this._preferredPageSize = $event.noOfRows;
    this._store.dispatch(new EmployeeEducationHistoryLoadAction(new AtlasApiRequest(this._preferredPageNumber, this._preferredPageSize, this._preferredSortfield, this._preferredSortDirection)));
  }
  onSortChange($event) {
    this._preferredPageNumber = 1;
    this._preferredSortfield = $event.SortField;
    this._preferredSortDirection = $event.Direction;
    this._store.dispatch(new EmployeeEducationHistoryLoadAction(new AtlasApiRequest(this._preferredPageNumber, this._preferredPageSize, this._preferredSortfield, this._preferredSortDirection)));
  }
  private _setActions() {
    if (this._canUpdate$.value)
      this._actions = Immutable.List([
        new AeDataTableAction("Update", this._updateAction, false),
        new AeDataTableAction("Remove", this._removeAction, false)
      ]);
  }
  openEmpEducationHistoryAddUpdateForm(e) {
    this._showEmpEducationHistoryAddUpdateForm = true;
    this._needToOpenSlideOut = true;
    this._operationMode = "add";
  }

  closeEmpEducationHistoryAddUpdateForm(e) {
    this._showEmpEducationHistoryAddUpdateForm = false;
  }

  getEducationHistorySlideoutState(): string {
    return this._showEmpEducationHistoryAddUpdateForm ? 'expanded' : 'collapsed';
  }

  modalClosed(option) {
    if (option == 'yes') {
      this._store.dispatch(new EmployeeEducationHistoryDeleteAction({ Id: this._educationDetailsToBeDeleted.Id }));//TODO
    }
    this._showRemoveDialog = false;
    this._educationDetailsToBeDeleted = null;
  }
  // End of private methods

}
