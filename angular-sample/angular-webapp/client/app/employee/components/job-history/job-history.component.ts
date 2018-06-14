import { ActivatedRoute } from '@angular/router';
import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { EmployeeSecurityService } from './../../services/employee-security-service';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import {
  LoadEmployeeJobHistoryOnPageChangeAction,
  LoadEmployeeJobHistoryOnSortAction
} from '../../actions/employee.actions';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { AeDatasourceType } from '../../../atlas-elements/common/ae-datasource-type';
import { isNullOrUndefined } from 'util';

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
import { JobHistory } from '../../models/job-history';
import { JobHistoryService } from '../../services/job-history-service';

@Component({
  selector: 'job-history',
  templateUrl: './job-history.component.html',
  styleUrls: ['./job-history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class JobHistoryComponent extends BaseComponent implements OnInit {
  //start of private properties
  private _actions: Immutable.List<AeDataTableAction>;
  private _updateJobCommand = new Subject();
  private _removeJobCommand = new Subject();
  private _jobHistory: Observable<Immutable.List<JobHistory>>;
  private _currentPage: Observable<number>;
  private _totalRecords: Observable<number>;
  private _selectedRows: Observable<number>;
  private _dataTableOptions: Observable<DataTableOptions>;
  private _selectedJobHistory: JobHistory;
  private _keys = Immutable.List(['JobTitleName', 'DepartmentName', 'SiteName', 'JobStartDate', 'JobFinishDate', 'IsCurrentJob']);
  private _dataSouceType: AeDatasourceType;
  private _jobHistoryListSubscription: Subscription;
  private _updateJobHistorySubscription: Subscription;
  private _removeJobHistorySubscription: Subscription;
  private _deleteJobHistorySubscription: Subscription;
  private isAdd: boolean = false;
  private isUpdate: boolean = false;
  private addOrUpdateActionType: String = "";
  private _showDeleteConfirmDialog: boolean;
  private lightClass: AeClassStyle = AeClassStyle.Light;
  private _iconSize: AeIconSize = AeIconSize.tiny;
  private _jobHistoryLoaded$: Observable<boolean>;
  private _canUpdate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _employeeStateSub: Subscription;
  private _actionsUpdated: boolean = false;
  //end private property

  //public properties
  get canUpdate$(): BehaviorSubject<boolean> {
    return this._canUpdate$;
  }
  get jobHistory(): Observable<Immutable.List<JobHistory>> {
    return this._jobHistory;
  }
  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }
  get totalRecords(): Observable<number> {
    return this._totalRecords;
  }
  get dataTableOptions(): Observable<DataTableOptions> {
    return this._dataTableOptions;
  }
  get jobHistoryLoaded$(): Observable<boolean> {
    return this._jobHistoryLoaded$;
  }
  get keys() {
    return this._keys;
  }
  get iconSize(): AeIconSize {
    return this._iconSize;
  }
  get showDeleteConfirmDialog(): boolean {
    return this._showDeleteConfirmDialog;
  }
  //public properties ends

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _jobHistoryService: JobHistoryService
    , private _employeeSecurityService: EmployeeSecurityService
    , private _activatedRoute: ActivatedRoute
  ) {
    super(_localeService, _translationService, _cdRef);

  }
  //private methods start
  private _setActions() {
    //Action buttons
    this._actions = Immutable.List([
      new AeDataTableAction("Update", this._updateJobCommand, false),
      new AeDataTableAction("Remove", this._removeJobCommand, false)
    ]);
    //End of action buittons  
  }
  /**
   * Method to selected job
   * @param {string} jobId 
   * 
   * @memberOf SalaryHistoryComponent
   */
  private _onJobSelect(jobId: string) {
    this._jobHistoryService._onJobHistorySelect(jobId);
  }
  private _canUpdate() {
    const statePersonal = this._store.let(fromRoot.getEmployeePersonalData);
    this._employeeStateSub = statePersonal.subscribe((val) => {
      if (val) {
        this._canUpdate$.next(this._employeeSecurityService.CanUpdateJobHistory(val.Id));
        if (this._canUpdate$.value && !this._actionsUpdated) {
          this._setActions();
          this._actionsUpdated = true;
        }
      }
    });
  }
  private _showUpdateSlideOut(): boolean {
    return this.isUpdate;
  }
  //private methods end
  //public methods start
  ngOnInit() {
    //this._setActions();    
    this._jobHistoryService._loadJobHistory();
    this._jobHistory = this._store.let(fromRoot.getEmployeeJobHistoryData);
    this._totalRecords = this._store.let(fromRoot.getEmployeeJobHistoryTotalCount);
    this._dataTableOptions = this._store.let(fromRoot.getEmployeeJobHistoryDataTableOptions);
    this._jobHistoryLoaded$ = this._store.let(fromRoot.getEmployeeJobHistoryLoadedData);
    //Subscription for delete completed
    this._deleteJobHistorySubscription = this._store.let(fromRoot.getDeleteEmployeeJobHistoryStatus).subscribe(res => {
      if (res) {
        this._showDeleteConfirmDialog = false;
        this._jobHistoryService._loadJobHistory(); //refresh the grid list
      }
    });

    //Subscription for update Item
    this._updateJobHistorySubscription = this._updateJobCommand.subscribe(job => {
      this.isUpdate = true;
      this.addOrUpdateActionType = 'UPDATE';
      this._selectedJobHistory = job as JobHistory;
      this._onJobSelect(this._selectedJobHistory.Id);
    });
    //Subscription for delete Item
    this._removeJobHistorySubscription = this._removeJobCommand.subscribe(job => {
      if (!isNullOrUndefined(job)) {
        this._selectedJobHistory = job as JobHistory;
        this._showDeleteConfirmDialog = true;
      }
    });
    this._canUpdate();
  }
  /**
     * Slide out animation
     * 
     * @private
     * @returns {boolean} 
     * 
     * @memberOf SalaryHistoryComponent
     */
  getSlideoutAnimateState(): boolean {
    return this.isAdd || this.isUpdate ? true : false;
  }

  jobAddClick($event) {
    this.isAdd = true;
    this.addOrUpdateActionType = 'ADD';
  }

  /**
     * State of slide out
     * 
     * @private
     * @returns {string} 
     * 
     * @memberOf SalaryHistoryComponent
     */
  getSlideoutState(): string {
    return this.isAdd || this.isUpdate ? 'expanded' : 'collapsed';
  }

  /**
   * Event on cancel click
   * 
   * @private
   * @param {any} e 
   * 
   * @memberOf SalaryHistoryComponent
   */
  onJobFormCancel(event: any) {
    this.isAdd = false;
    this.isUpdate = false;
    this.addOrUpdateActionType = "";
    //this._slideoutState = false;
  }

  onJobFormSaveComplete($event: boolean) {
    if ($event === true) {
      this._jobHistoryService._loadJobHistory()
    }
    this.isAdd = false;
    this.isUpdate = false;
    this.addOrUpdateActionType = "";
  }

  /**
 * to show update form slide out
 * @returns {boolean} 
 * 
 * @memberOf SalaryHistoryComponent
 */
  /**
  * to show add form slide out
  * @returns {boolean} 
  * 
  * @memberOf SalaryHistoryComponent
  */
  showSlideOut(): boolean {
    return this.isAdd || this.isUpdate;
  }

  onPageChange($event: any) {
    this._store.dispatch(new LoadEmployeeJobHistoryOnPageChangeAction({ pageNumber: $event.pageNumber, noOfRows: $event.noOfRows }));
  }

  onSort($event: AeSortModel) {
    this._store.dispatch(new LoadEmployeeJobHistoryOnSortAction({ SortField: $event.SortField, Direction: $event.Direction }));
  }

  /**
   * Delete pop-up close event
   * 
   * @private
   * @param {*} event
   * 
   * @memberOf SalaryHistoryComponent
   */
  deleteConfirmModalClosed(event: any) {
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
  deleteSalaryHistory(event: any) {
    this._jobHistoryService._onJobHistoryDelete(this._selectedJobHistory.Id); //dispatch an event to delete
  }
  highLightRow = (context: any) => context.IsCurrentJob;
  ngOnDestroy() {
    if (this._employeeStateSub) {
      this._employeeStateSub.unsubscribe();
    }
    if (this._jobHistoryListSubscription)
      this._jobHistoryListSubscription.unsubscribe();
    if (this._updateJobHistorySubscription)
      this._updateJobHistorySubscription.unsubscribe();
    if (this._removeJobHistorySubscription)
      this._removeJobHistorySubscription.unsubscribe();
    if (this._deleteJobHistorySubscription)
      this._deleteJobHistorySubscription.unsubscribe();
  }
  //public methods end
}
