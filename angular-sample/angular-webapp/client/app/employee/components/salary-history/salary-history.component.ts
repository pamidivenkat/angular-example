import { ActivatedRoute } from '@angular/router';
import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { EmployeeSecurityService } from './../../services/employee-security-service';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { AeDatasourceType } from '../../../atlas-elements/common/ae-datasource-type';
import { isNullOrUndefined } from 'util';

import {
  LoadEmployeeSalaryHistoryOnPageChangeAction,
  LoadEmployeeSalaryHistoryOnSortAction
} from '../../actions/employee.actions';


import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import * as fromRoot from './../../../shared/reducers';


import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { AeDatatableComponent } from '../../../atlas-elements/ae-datatable/ae-datatable.component';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { SalaryHistory } from '../../models/salary-history';
import { SalaryHistoryService } from '../../services/salary-history-service';


@Component({
  selector: 'salary-history',
  templateUrl: './salary-history.component.html',
  styleUrls: ['./salary-history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SalaryHistoryComponent extends BaseComponent implements OnInit {

  //start of delete operation properties
  private _actions: Immutable.List<AeDataTableAction>;
  private _updateSalaryCommand = new Subject();
  private _removeSalaryCommand = new Subject();
  private _salaryHistory$: Observable<Immutable.List<SalaryHistory>>;
  private _salaryHistoryPagingOptions$: Observable<DataTableOptions>;
  private _totalRecords$: Observable<number>;
  private _selectedSalaryHistory: SalaryHistory;
  private _keys = Immutable.List(['JobTitleName', 'Pay', 'ReasonForChange', 'StartDate', 'FinishDate', 'IsCurrentSalary']);
  private _dataSouceType: AeDatasourceType;
  private _updateSalaryHistorySubscription: Subscription;
  private _removeSalaryHistorySubscription: Subscription;
  private _deleteSalaryHistorySubscription: Subscription;
  private _isAdd: boolean = false;
  private _isUpdate: boolean = false;
  private _addOrUpdateActionType: String = "";
  private _showDeleteConfirmDialog: boolean;
  private _deleteConfirmHeaderMessage: string;
  private _deleteConfirmationText: string;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _iconSize: AeIconSize = AeIconSize.tiny;
  private _salaryHistoryLoaded$: Observable<boolean>;
  private _canUpdate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _employeeStateSub: Subscription;
  private _actionsUpdated: boolean = false;
  //end delete properties

  public get canUpdate$() {
    return this._canUpdate$;
  }

  public get salaryHistory$() {
    return this._salaryHistory$;
  }

  public get actions() {
    return this._actions;
  }

  public get totalRecords$() {
    return this._totalRecords$;
  }

  public get salaryHistoryPagingOptions$() {
    return this._salaryHistoryPagingOptions$;
  }

  public get salaryHistoryLoaded$() {
    return this._salaryHistoryLoaded$;
  }

  public get keys() {
    return this._keys;
  }

  public get addOrUpdateActionType() {
    return this._addOrUpdateActionType;
  }

  public get showDeleteConfirmDialog() {
    return this._showDeleteConfirmDialog;
  }

  public get lightClass() {
    return this._lightClass;
  }

  public get selectedSalaryHistory() {
    return this._selectedSalaryHistory;
  }

  public get iconSize() {
    return this._iconSize;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _salaryHistoryService: SalaryHistoryService
    , private _employeeSecurityService: EmployeeSecurityService
    , private _activatedRoute: ActivatedRoute
  ) {
    super(_localeService, _translationService, _cdRef);
    this._deleteConfirmHeaderMessage = 'Remove Salary History';
    this._deleteConfirmationText = 'Do you really want to remove?';


  }

  ngOnInit() {
    this._canUpdate();
    this._salaryHistoryService._loadSalaryHistory();
    this._salaryHistory$ = this._store.let(fromRoot.getEmployeeSalaryHistoryData);
    this._salaryHistoryPagingOptions$ = this._store.let(fromRoot.getEmployeeSalaryHistoryDataTableOptions);
    this._totalRecords$ = this._store.let(fromRoot.getEmployeeSalaryHistoryTotalCount);
    this._salaryHistoryLoaded$ = this._store.let(fromRoot.getEmployeeSalaryHistoryLoadedData);

    //Subscription for delete completed
    this._deleteSalaryHistorySubscription = this._store.let(fromRoot.getDeleteEmployeeSalaryHistoryStatus).subscribe(res => {
      if (res) {
        this._showDeleteConfirmDialog = false;
        this._salaryHistoryService._loadSalaryHistory(); //refresh the grid list
      }
    });

    //Subscription for update Item
    this._updateSalaryHistorySubscription = this._updateSalaryCommand.subscribe(salary => {
      this._isUpdate = true;
      this._addOrUpdateActionType = 'UPDATE';
      this._selectedSalaryHistory = salary as SalaryHistory;
      this._onSalarySelect(this._selectedSalaryHistory.Id);
    });
    //Subscription for delete Item
    this._removeSalaryHistorySubscription = this._removeSalaryCommand.subscribe(salary => {
      if (!isNullOrUndefined(salary)) {
        this._selectedSalaryHistory = salary as SalaryHistory;
        this._showDeleteConfirmDialog = true;
      }
    });

  }

  public salaryAddClick($event) {
    this._isAdd = true;
    this._addOrUpdateActionType = 'ADD';
  }

  /**
   * Method to selected salary
   * @param {string} salaryId 
   * 
   * @memberOf SalaryHistoryComponent
   */
  _onSalarySelect(salaryId: string) {
    this._salaryHistoryService._onSalaryHistorySelect(salaryId);
  }

  /**
   * Event on cancel click
   * 
   * @private
   * @param {any} e 
   * 
   * @memberOf SalaryHistoryComponent
   */
  public onSalaryFormCancel(event: any) {
    this._isAdd = false;
    this._isUpdate = false;
    this._addOrUpdateActionType = "";
    //this._slideoutState = false;
  }
  private _setActions() {
    //Action buttons
    this._actions = Immutable.List([
      new AeDataTableAction("Update", this._updateSalaryCommand, false),
      new AeDataTableAction("Remove", this._removeSalaryCommand, false)
    ]);
    //End of action buittons
  }
  private _canUpdate() {
    const statePersonal = this._store.let(fromRoot.getEmployeePersonalData);
    this._employeeStateSub = statePersonal.subscribe((val) => {
      if (val) {
        this._canUpdate$.next(this._employeeSecurityService.CanUpdateSalaryHistory(val.Id));
        if (this._canUpdate$.value && !this._actionsUpdated) {
          this._setActions();
          this._actionsUpdated = true;
        }
      }
    });
  }

  public onSalaryFormSaveComplete($event: boolean) {
    if ($event === true) {
      this._salaryHistoryService._loadSalaryHistory()
    }
    this._isAdd = false;
    this._isUpdate = false;
    this._addOrUpdateActionType = "";
  }
  /**
     * Slide out animation
     * 
     * @private
     * @returns {boolean} 
     * 
     * @memberOf SalaryHistoryComponent
     */
  public getSlideoutAnimateState(): boolean {
    return this._isAdd || this._isUpdate ? true : false;
  }

  /**
     * State of slide out
     * 
     * @private
     * @returns {string} 
     * 
     * @memberOf SalaryHistoryComponent
     */
  public getSlideoutState(): string {
    return this._isAdd || this._isUpdate ? 'expanded' : 'collapsed';
  }

  /**
 * to show update form slide out
 * @returns {boolean} 
 * 
 * @memberOf SalaryHistoryComponent
 */
  _showUpdateSlideOut(): boolean {
    return this._isUpdate;
  }

  /**
   * to show add form slide out
   * @returns {boolean} 
   * 
   * @memberOf SalaryHistoryComponent
   */
  public showSlideOut(): boolean {
    return this._isAdd || this._isUpdate;
  }

  public onPageChange($event: any) {
    this._store.dispatch(new LoadEmployeeSalaryHistoryOnPageChangeAction({ pageNumber: $event.pageNumber, noOfRows: $event.noOfRows }));
  }

  public onSort($event: AeSortModel) {
    this._store.dispatch(new LoadEmployeeSalaryHistoryOnSortAction({ SortField: $event.SortField, Direction: $event.Direction }));
  }


  /**
   * Delete pop-up close event
   * 
   * @private
   * @param {*} event
   * 
   * @memberOf SalaryHistoryComponent
   */
  public deleteConfirmModalClosed(event: any) {
    this._showDeleteConfirmDialog = false;
  }


  /**
   * Delete pop-up confirm event
   * 
   * @private
   * @param {*} event
   * 
   * @memberOf SalaryHistoryComponent
   */
  public deleteSalaryHistory(event: any) {
    this._salaryHistoryService._onSalaryHistoryDelete(this._selectedSalaryHistory.Id); //dispatch an event to delete
  }

  highLightRow = (context: any) => context.IsCurrentSalary;

  ngOnDestroy() {
    if (this._employeeStateSub) {
      this._employeeStateSub.unsubscribe();
    }
    this._deleteSalaryHistorySubscription.unsubscribe();
    this._updateSalaryHistorySubscription.unsubscribe();
    this._removeSalaryHistorySubscription.unsubscribe();
  }

}
