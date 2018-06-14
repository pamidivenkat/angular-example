import { ActivatedRoute } from '@angular/router';
import { EmployeeSecurityService } from './../../services/employee-security-service';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { ExtensionActionTypes } from '@ngrx/store-devtools/src/extension';
import { AeDataActionTypes } from '../../models/action-types.enum';
import { isNullOrUndefined } from 'util';
import { EmployeePreviousEmploymentHistoryService } from '../../services/employee-previous-employment-history.service';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { PreviousEmployment } from '../../models/previous-employment';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import * as fromRoot from './../../../shared/reducers';
import * as Immutable from 'immutable';

@Component({
  selector: 'previous-employment',
  templateUrl: './previous-employment.component.html',
  styleUrls: ['./previous-employment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PreviousEmploymentComponent extends BaseComponent implements OnInit, OnDestroy {

  private _previousEmploymentsHistory: Observable<Immutable.List<PreviousEmployment>>;
  private _recordsCount: Observable<number>;
  private _dataTableOptions: Observable<DataTableOptions>;
  private _currentPage: Observable<number>;
  private _actions: Immutable.List<AeDataTableAction>;
  private _updateActionCommand = new Subject();
  private _deleteActionCommand = new Subject();
  private _slideoutState: boolean;
  private _actionType: string;
  private _selectedEmployment: PreviousEmployment;
  private _showRemoveConfirmDialog: boolean;
  private _lightClass: AeClassStyle = AeClassStyle.Light;

  private _getPreviousEmploymentsHistorySubscription$: Subscription;
  private _getPreviousEmploymentsHistoryCountSubscription$: Subscription;
  private _updateEmployeePreviousEmploymentSubscription$: Subscription;
  private _removeEmployeePreviousEmploymentSubscription$: Subscription;
  private _updatePreviousEmploymentHistorySubscription$: Subscription;
  private _removeEmployeePreviousEmploymentHistorySubscription$: Subscription;
  private _hasPreviousEmploymentLoaded$: Observable<boolean>;

  private _keys = Immutable.List(['EmployerNameAndAddress', 'JobTitleAndRoles', 'StartDate', 'EndDate', 'ReasonForLeaving']);
  private _canUpdate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _employeeStateSub: Subscription;
  private _actionsUpdated:boolean = false;

  public get canUpdate$() {
    return this._canUpdate$;
  }

  public get lightClass() {
    return this._lightClass;
  }

  public get recordsCount() {
    return this._recordsCount;
  }

  public get actions() {
    return this._actions;
  }

  public get previousEmploymentsHistory() {
    return this._previousEmploymentsHistory;
  }

  public get dataTableOptions() {
    return this._dataTableOptions;
  }

  public get hasPreviousEmploymentLoaded$() {
    return this._hasPreviousEmploymentLoaded$;
  }

  public get keys() {
    return this._keys;
  }

  public get slideoutState() {
    return this._slideoutState;
  }

  public get actionType() {
    return this._actionType;
  }

  public get selectedEmployment() {
    return this._selectedEmployment;
  }

  public get showRemoveConfirmDialog() {
    return this._showRemoveConfirmDialog;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _employeePrevEmploymentService: EmployeePreviousEmploymentHistoryService
    , private _employeeSecurityService: EmployeeSecurityService
    , private _activatedRoute: ActivatedRoute
  ) {
    super(_localeService, _translationService, _cdRef);
  }


  ngOnInit() {
    this._canUpdate();
    this._previousEmploymentsHistory = this._store.let(fromRoot.getEmployeePreviousEmploymentHistory);
    this._recordsCount = this._store.let(fromRoot.getEmployeePreviousEmploymentHistoryTotalCount);
    this._dataTableOptions = this._store.let(fromRoot.getEmployeePreviousEmploymentHistoryDataTableOptions);
    this._hasPreviousEmploymentLoaded$ = this._store.let(fromRoot.getEmployeePreviousEmploymentLoadedData);

    this._updateEmployeePreviousEmploymentSubscription$ = this._updateActionCommand.subscribe(_prevEmployer => {
      this._selectedEmployment = _prevEmployer as PreviousEmployment;
      this._slideoutState = true;
      this._actionType = AeDataActionTypes.Update;
    });

    this._updatePreviousEmploymentHistorySubscription$ = this._store.let(fromRoot.addOrUpdateEmployeePreviousEmploymentHistory).subscribe(res => {
      if (!res) {
        this._slideoutState = false;
        this._employeePrevEmploymentService.LoadPreviousEmploymentHistory();
        this._cdRef.markForCheck();
      }
    });

    this._removeEmployeePreviousEmploymentSubscription$ = this._deleteActionCommand.subscribe(_prevEmployer => {
      this._selectedEmployment = _prevEmployer as PreviousEmployment;
      this._showRemoveConfirmDialog = true;
    });

    this._removeEmployeePreviousEmploymentHistorySubscription$ = this._store.let(fromRoot.removeEmployeePreviousEmploymentHistory).subscribe(res => {
      if (!res) {
        this._showRemoveConfirmDialog = false;
        this._employeePrevEmploymentService.LoadPreviousEmploymentHistory();
        this._cdRef.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    if (this._employeeStateSub) {
      this._employeeStateSub.unsubscribe();
    }
    if (!isNullOrUndefined(this._getPreviousEmploymentsHistorySubscription$)) {
      this._getPreviousEmploymentsHistorySubscription$.unsubscribe();
    }
    if (!isNullOrUndefined(this._getPreviousEmploymentsHistoryCountSubscription$)) {
      this._getPreviousEmploymentsHistoryCountSubscription$.unsubscribe();
    }
    if (!isNullOrUndefined(this._updateEmployeePreviousEmploymentSubscription$)) {
      this._updateEmployeePreviousEmploymentSubscription$.unsubscribe();
    }
    if (!isNullOrUndefined(this._updatePreviousEmploymentHistorySubscription$)) {
      this._updatePreviousEmploymentHistorySubscription$.unsubscribe();
    }
    if (!isNullOrUndefined(this._removeEmployeePreviousEmploymentSubscription$)) {
      this._removeEmployeePreviousEmploymentSubscription$.unsubscribe();
    }
    if (!isNullOrUndefined(this._removeEmployeePreviousEmploymentHistorySubscription$)) {
      this._removeEmployeePreviousEmploymentHistorySubscription$.unsubscribe();
    }
  }

  private _setActions() {
    //actions 
    this._actions = Immutable.List([
      new AeDataTableAction("Update", this._updateActionCommand, false),
      new AeDataTableAction("Remove", this._deleteActionCommand, false)
    ]);
    //End of action buittons    
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
  public openPreviousEmploymentAddForm() {
    this._actionType = AeDataActionTypes.Add;
    this._slideoutState = true;
  }

  public onPageChange($event: any) {
    this._employeePrevEmploymentService.LoadPreviousEmploymentHistoryOnPageChange($event);
  }

  public onSort($event: AeSortModel) {
    this._employeePrevEmploymentService.LoadPreviousEmploymentHistoryOnSort($event);
  }

  public getSlideoutState(): string {
    return this._slideoutState ? 'expanded' : 'collapsed';
  }

  public closeUpdateForm(e) {
    this._slideoutState = false;
  }

  public removeConfirmModalClosed(e) {
    this._showRemoveConfirmDialog = false;
  }

  public removePreviousEmployerDetails(e) {
    this._employeePrevEmploymentService.RemovePreviousEmploymentHistory(this._selectedEmployment);
  }

}
