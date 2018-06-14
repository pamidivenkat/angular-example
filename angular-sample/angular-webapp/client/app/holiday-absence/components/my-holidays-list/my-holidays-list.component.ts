import { AePageChangeEventModel } from './../../../atlas-elements/common/models/ae-page-change-event-model';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { StringHelper } from './../../../shared/helpers/string-helper';
import { AeTemplateComponent } from '../../../atlas-elements/ae-template/ae-template.component';
import { createPopOverVm } from '../../../atlas-elements/common/models/popover-vm';
import { Tristate } from '../../../atlas-elements/common/tristate.enum';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { HolidayAbsenceDataService } from '../../services/holiday-absence-data.service';
import { extractAbsenceStatus } from '../../../shared/helpers/extract-helpers';
import { AbsenceStatusLoadAction } from '../../../shared/actions/lookup.actions';
import {
    ClearCurrentAbsence,
    LoadCurrentAbsence,
    LoadEmployeeConfigAction,
    LoadEmployeeAbsencesAction,
    UpdateEmployeeAbsenceAction,
    LoadEmployeeAbsenceAction
} from '../../actions/holiday-absence.actions';
import { AbsenceStatus, AbsenceStatusCode } from '../../../shared/models/lookup.models';
import { MyAbsence } from '../../models/holiday-absence.model';
import { EmployeeSettings } from '../../../shared/models/company.models';
import { ResubmitOptions } from '../../common/resubmit-options.enum';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { extractFiscalYears, prepareModelForUpdate } from '../../common/extract-helpers';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { isNullOrUndefined } from 'util';
import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import * as Immutable from 'immutable';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../shared/reducers/index';
import { MyDelegateInfo, EmployeeConfig, OperationModes } from '../../models/holiday-absence.model';
import { AeSelectEvent } from '../../../atlas-elements/common/ae-select.event';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
    selector: 'my-holidays-list',
    templateUrl: './my-holidays-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HolidaysListComponent extends BaseComponent implements OnInit, OnDestroy {
    // Private Fields
    private _loadingStatus$: Observable<boolean>;
    private _myHolidays$: Observable<Immutable.List<MyAbsence>>;
    private _absenceStatuses: AbsenceStatus[];
    private _absenceStatusItems: Immutable.List<AeSelectItem<string>>;
    private _totalRecords$: Observable<number>;
    private _dataTableOptions$: Observable<DataTableOptions>;
    private _visibility$ = new Subject<boolean>();
    private absencePopOverVisible: boolean = false;
    private _leaveCancelReason: string;
    private _reasonHeaderMessage: string;
    private _showReasonDialog: boolean;
    private _showCancelDialog: boolean;
    private _showResubmitDialog: boolean;
    private _cancelHeaderMessage: string;
    private _cancelConfirmationText: string;
    private _employeeId: string;
    private _pagingInfo: PagingInfo;
    private _holidaySettings: EmployeeSettings;
    private _currentHoliday: MyAbsence;
    private _cancel: boolean = false;
    private _reason: boolean = false;
    private _resubmit: boolean = false;
    private _resubmitOptionSelected: ResubmitOptions;
    private _employeeConfig: EmployeeConfig;
    private _myDelegateData: MyDelegateInfo[];
    private _lightClass: AeClassStyle = AeClassStyle.Light;
    private _darkClass: AeClassStyle = AeClassStyle.Dark;
    private _iconSmall: AeIconSize = AeIconSize.small;
    private _selectedHolidaySubscription$: Subscription;
    private _userInfoSubscription$: Subscription;
    private _absenceTypeSubscription$: Subscription;
    private _unitsInFractionSusbscription$: Subscription;
    private _keys = Immutable.List(['Id', 'StartDate', 'EndDate', 'NoOfDays', 'CreatedOn', 'SubmittedToUser', 'Status', 'Comment', 'IsHour', 'Reason', 'MyAbsenceDetails']);
    private _legendOptions = [{ Text: "New", Class: "indicator--green" }, { Text: "Approved", Class: "indicator--yellow" }, { Text: "Cancelled", Class: "indicator--red" }, { Text: "Declined", Class: "indicator--purple" }, { Text: "Cancellation request", Class: "indicator--teal" }, { Text: "Change request", Class: "indicator--grey" }];
    private _delegateInfoSubscription$: Subscription;
    private _actions: Immutable.List<AeDataTableAction>;

    private _updateMyAbsenceRequest: Subject<MyAbsence> = new Subject();
    private _reSubmitRequest: Subject<MyAbsence> = new Subject();
    private _reasonRequest: Subject<MyAbsence> = new Subject();
    private _cancelRequest: Subject<MyAbsence> = new Subject();

    private _updateMyAbsenceRequestSubscription$ = new Subscription();
    private _reSubmitRequestSubscription$ = new Subscription();
    private _reasonRequestSubscription$ = new Subscription();
    private _cancelRequestSubscription$ = new Subscription();
    private _selectedStatus: string = '';
    private _iconTiny: AeIconSize = AeIconSize.tiny;
    private _showEsclateNotUpdateDialog: boolean = false;
    private _routeSubscription: Subscription;
    private _currentPageNumber: number = 1;
    private _currentPageSize: number = 10;
    private _currentSortField: string = 'StartDate';
    private _currentSortDirection: SortDirection = SortDirection.Descending;
    // End of Private Fields

    // Public properties
    @Input('absenceStatuses')
    set absenceStatuses(val: AbsenceStatus[]) {
        this._absenceStatuses = val;
        this._processAbsenceStatuses();
    }
    get absenceStatuses() {
        return this._absenceStatuses;
    }
   

    @Input('employeeSettings')
    set employeeSettings(val: EmployeeSettings) {
        this._holidaySettings = val;
    }
    get employeeSettings() {
        return this._holidaySettings;
    }
    

    @Input('employeeConfig')
    set employeeConfig(val: EmployeeConfig) {
        this._employeeConfig = val;
    }
    get employeeConfig() {
        return this._employeeConfig;
    }
    
    get absenceStatusItems() {
        return this._absenceStatusItems;
    }
    get selectedStatus() {
        return this._selectedStatus;
    }
    get myHolidays$() {
        return this._myHolidays$;
    }
    get totalRecords$() {
        return this._totalRecords$;
    }
    get loadingStatus$() {
        return this._loadingStatus$;
    }
    get dataTableOptions$() {
        return this._dataTableOptions$;
    }
    get actions() {
        return this._actions;
    }
    get keys() {
        return this._keys;
    }
    get iconTiny() {
        return this._iconTiny;
    }
    get myDelegateData() {
        return this._myDelegateData;
    }
    get showReasonDialog() {
        return this._showReasonDialog;
    }
    get reasonHeaderMessage() {
        return this._reasonHeaderMessage;
    }
    get leaveCancelReason() {
        return this._leaveCancelReason;
    }
    get showCancelDialog() {
        return this._showCancelDialog;
    }
    get cancelHeaderMessage() {
        return this._cancelHeaderMessage;
    }
    get cancelConfirmationText() {
        return this._cancelConfirmationText;
    }
    get lightClass() {
        return this._lightClass;
    }
    get showResubmitDialog() {
        return this._showResubmitDialog;
    }
    get showEsclateNotUpdateDialog() {
        return this._showEsclateNotUpdateDialog;
    }
    // End of Public properties
    // ViewChild Properties
    @ViewChild('popOverTemplate')
    _popOverTemplate: AeTemplateComponent<any>;

    // Public Output bindings
    @Output()
    updateMyAbsence: EventEmitter<string> = new EventEmitter<string>();

    @Output()
    statusFilterChange: EventEmitter<string> = new EventEmitter<string>();
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    // End of Public ViewContent bidnings

    // constructor
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _holidayAbsenceDataService: HolidayAbsenceDataService
        , private _store: Store<fromRoot.State>
        , protected _router: Router
        , private _activatedRoute: ActivatedRoute
        , private _claimsHelper: ClaimsHelperService) {
        super(_localeService, _translationService, _cdRef);
        this._employeeId = this._claimsHelper.getEmpId();
        this._myDelegateData = [];
        this._loadingStatus$ = new BehaviorSubject(true);
    }
    // End of constructor

    // Private methods






    /**
     *  to show/hide update button for absence request
     * @private
     * @param {MyAbsence} item 
     * @returns 
     * 
     * @memberOf HolidaysListComponent
     */
    private _showUpdateRequestAction(item: MyAbsence): Tristate {
        if (item.Status.Code == AbsenceStatusCode.Declined || item.Status.Code == AbsenceStatusCode.Cancelled || item.Status.Code == AbsenceStatusCode.Requestforcancellation)
            return Tristate.False;
        return Tristate.True;
    }
    private _showRequestAction(item: MyAbsence): Tristate {
        if (item.Status.Code == AbsenceStatusCode.Declined || item.Status.Code == AbsenceStatusCode.Cancelled || item.Status.Code == AbsenceStatusCode.Requestforcancellation)
            return Tristate.True;
        return Tristate.False;
    }

    /**
     * to show/hide reason button for absence request
     * 
     * @private
     * @param {MyAbsence} item 
     * @returns 
     * 
     * @memberOf HolidaysListComponent
     */
    private _showReasonAction(item: MyAbsence): Tristate {
        if ((item.Status.Code == AbsenceStatusCode.Requested
            || (item.Status.Code == AbsenceStatusCode.Escalated && item.EscaltionCount < this._holidaySettings.NoOfTimesEscalate)
            || item.Status.Code == AbsenceStatusCode.Resubmitted
        ))
            return Tristate.True;
        return Tristate.False;
    }

    /**
     * to show/hide update button for cancel request
     * 
     * @private
     * @param {MyAbsence} item 
     * @returns 
     * 
     * @memberOf HolidaysListComponent
     */
    private _showCancelRequestAction(item: MyAbsence): Tristate {
        if (item.Status.Code == AbsenceStatusCode.Requested || item.Status.Code == AbsenceStatusCode.Escalated || item.Status.Code == AbsenceStatusCode.Resubmitted || item.Status.Code == AbsenceStatusCode.Approved)
            return Tristate.True;
        return Tristate.False;
    }

    /**
     * to show/hide escalate option for absence request
     * @private
     * @returns 
     * 
     * @memberOf HolidaysListComponent
     */
    private _showEscalateRequest() {
        let _showEscalateRequest = false;
        if (this._currentHoliday)
            _showEscalateRequest = this._currentHoliday.EscaltionCount < this._holidaySettings.NoOfTimesEscalate;
        return _showEscalateRequest;
    }


    /**
     * to show cancel popup dialog
     * @private
     * @param {MyAbsence} holiday 
     * 
     * @memberOf HolidaysListComponent
     */
    private _showCancelPopup(holiday: MyAbsence) {
        if (holiday.Status.Code == AbsenceStatusCode.Approved) {
            this._cancelHeaderMessage = "Dialog.Holidays.Heading_Self_Cancel_Approved";
            this._cancelConfirmationText = "Dialog.Holidays.Info_Self_Cancel_Approved";
        } else {
            this._cancelHeaderMessage = "Dialog.Holidays.Heading_Self_Cancel";
            this._cancelConfirmationText = "Dialog.Holidays.Info_Self_Cancel";
        }
        this._showCancelDialog = true;
    }

    /**
     * fires on absence request current item selection
     * @private
     * @param {*} holiday 
     * 
     * @memberOf HolidaysListComponent
     */
    private _showResubmitPopup(holiday: MyAbsence) {
        this._showResubmitDialog = true;
        let esclatedStatus = this._absenceStatuses.find(status => status.Code === AbsenceStatusCode.Escalated);
        const IsRequestToEscalate = holiday.ResubmittedCount >= this._holidaySettings.NoOfTimesResubmit || holiday.StatusId == esclatedStatus.Id;
        if (IsRequestToEscalate) {
            this._resubmitOptionSelected = ResubmitOptions.Escalate;
        } else {
            this._resubmitOptionSelected = ResubmitOptions.Resubmit;
        }
    }

    private _showReasonPopup(holiday: MyAbsence) {
        if (this._currentHoliday.DeclinedBy != null && this._currentHoliday.DeclinedBy != this._employeeConfig.UserId) {
            if (isNullOrUndefined(this._currentHoliday.Comment) || this._currentHoliday.Comment.length == 0) {
                this._leaveCancelReason = "Dialog.Holidays.Info_Manager_Reason_Decline";
            }
            else {
                this._leaveCancelReason = this._currentHoliday.Comment;
            }
            this._reasonHeaderMessage = "Dialog.Heading_Reason_Decline";
        } else {
            this._leaveCancelReason = 'Dialog.Holidays.Info_Self_Reason';
            this._reasonHeaderMessage = "Dialog.Heading_Self_Reason";
        }
        this._showReasonDialog = true;
    }


    /**
     * returns the legend color
     * @private
     * @param {number} status 
     * @returns 
     * 
     * @memberOf HolidaysListComponent
     */
    private getLegendColor(status: number) {
        return this._holidayAbsenceDataService.getLegendColor(status);
    }

    private _updateMyAbsence(context) {
        if (!isNullOrUndefined(context)) {
            this.updateMyAbsence.emit(context.Id);
        }
    }


    /**
     * returns the submitted user info 
     * @private
     * @param {string} myHolidayId 
     * @returns 
     * 
     * @memberOf HolidaysListComponent
     */
    private getUserInfo(myHolidayId: string) {
        let userName = "";
        if (isNullOrUndefined(myHolidayId)) return userName;
        this._userInfoSubscription$ = this._myHolidays$.map(x => x.find(x => x.Id === myHolidayId)).subscribe(myHoliday => userName = this._holidayAbsenceDataService.getSubmittedUserName(myHoliday, this._myDelegateData));
        return userName;
    }


    /**
      * 
      * 
      * 
      * @memberOf AbsenceListComponent
      */
    _setVisibility() {
        this.absencePopOverVisible = !this.absencePopOverVisible;
        this._visibility$.next(this.absencePopOverVisible);
    }


    /**
     * 
     * 
     * 
     * @memberOf AbsenceListComponent
     */
    _hidePopover() {
        this.absencePopOverVisible = false;
        this._visibility$.next(this.absencePopOverVisible);
    }

    commentStatus(contextObj: MyAbsence): boolean {
        if (StringHelper.isNullOrUndefinedOrEmpty(contextObj.Reason) && StringHelper.isNullOrUndefinedOrEmpty(contextObj.Comment)) {
            return false;
        } else {
            return true;
        }
    }

    getComment(contextObj: MyAbsence): string {
        return 'Employee comment' + ":" + (StringHelper.isNullOrUndefinedOrEmpty(contextObj.Reason) ? 'N/A' : contextObj.Reason) + '\n' + 'Manager comment' + " :" + (StringHelper.isNullOrUndefinedOrEmpty(contextObj.Comment) ? 'N/A' : contextObj.Comment);
    }



    private _processAbsenceStatuses() {
        if (!isNullOrUndefined(this.absenceStatuses)) {
            this._absenceStatusItems = extractAbsenceStatus(this.absenceStatuses);
            this._routeSubscription = this._activatedRoute.url.takeUntil(this._destructor$).subscribe((path) => {
                if (path.find(obj => !isNullOrUndefined(obj.path) && obj.path.indexOf('all') >= 0)) {
                    this._selectedStatus = '';
                } else if (path.find(obj => !isNullOrUndefined(obj.path) && obj.path.toLowerCase().indexOf('approved') >= 0)) {
                    this._selectedStatus = this.absenceStatuses.filter(c => c.Code === AbsenceStatusCode.Approved)[0].Id;
                } else {
                    this._selectedStatus = this.absenceStatuses.filter(c => c.Code === AbsenceStatusCode.Requested)[0].Id;
                }
            });

        }
    }

    // End of private methods

    // Public methods
    /**
      * 
      * 
      * @param {number} lunchDuration 
      * @returns 
      * 
      * @memberOf AbsenceListComponent
      */
    public getLunchDuration(lunchDuration: number) {
        return Number(Math.round(lunchDuration * 100) / 100).toFixed(2)
    }



    /**
    * fires on resumbit confirmation
    * @private
    * 
    * @memberOf HolidaysListComponent
    */
    public onResubmit() {
        if (this._resubmitOptionSelected == ResubmitOptions.Resubmit) {
            this._currentHoliday.SubmittedToUserId = this._employeeConfig.ManagerUserId;
            const absenceStatus = this._absenceStatuses.find(status => status.Code === AbsenceStatusCode.Resubmitted)
            if (!isNullOrUndefined(absenceStatus)) {
                this._currentHoliday.StatusId = absenceStatus.Id;
            }
            if (isNullOrUndefined(this._currentHoliday.ResubmittedCount))
                this._currentHoliday.ResubmittedCount = 0;
            else {
                this._currentHoliday.ResubmittedCount += 1;
            }
        }
        else if (this._resubmitOptionSelected == ResubmitOptions.Escalate) {
            this._currentHoliday.EscalatedToUserId = this._employeeConfig.NextLevelManagerUserId;
            const absenceStatus = this._absenceStatuses.find(status => status.Code === AbsenceStatusCode.Escalated)
            if (!isNullOrUndefined(absenceStatus)) {
                this._currentHoliday.StatusId = absenceStatus.Id;
            }
            if (isNullOrUndefined(this._currentHoliday.EscaltionCount))
                this._currentHoliday.EscaltionCount = 0;
            else
                this._currentHoliday.EscaltionCount += 1;
        }

        this._store.dispatch(new UpdateEmployeeAbsenceAction(this._currentHoliday));
        this._showResubmitDialog = false;
        this._resubmit = false;
    }


    public selectResubmitRequest(selectedOption: ResubmitOptions) {
        this._resubmitOptionSelected = selectedOption;
    }




    /**
     * to default option for resubmit or escalate
     * 
     * @private
     * @returns 
     * 
     * @memberOf HolidaysListComponent
     */
    public checkEscalateRequest() {
        let esclatedStatus = this._absenceStatuses.find(status => status.Code === AbsenceStatusCode.Escalated);
        const IsRequestToEscalate = this._currentHoliday.ResubmittedCount === this._holidaySettings.NoOfTimesResubmit || this._currentHoliday.StatusId == esclatedStatus.Id;

        if (IsRequestToEscalate) {
            return true;
        }
        return false;
    }

    public esclateNotUpdateModallClosed(e) {
        this._showEsclateNotUpdateDialog = false;
    }


    /**
     * to show/hide resubmit option for absence request
     * @private
     * @returns 
     * 
     * @memberOf HolidaysListComponent
     */
    public showResubmitToManager() {
        let esclatedStatus = this._absenceStatuses.find(status => status.Code === AbsenceStatusCode.Escalated);
        let _showResubmitToManager = false;
        //show resubmit option until resubmit count < settings count and the statusid is not in esclated 
        if (this._currentHoliday)
            _showResubmitToManager = this._currentHoliday.ResubmittedCount < this._holidaySettings.NoOfTimesResubmit && this._currentHoliday.StatusId != esclatedStatus.Id;
        return _showResubmitToManager;
    }


    /**
     * fires on my absence resubmit popup close
     * 
     * @private
     * @param {*} event 
     * 
     * @memberOf HolidaysListComponent
     */
    public resubmitModallClosed(event: any) {
        this._showResubmitDialog = false;
        this._resubmit = false;
        this._store.dispatch(new ClearCurrentAbsence());
    }
    /**
     * cancel holiday
     * @private
     * @param {any} e 
     * 
     * @memberOf HolidaysListComponent
     */
    public cancelHoliday(e) {
        if (this._absenceStatuses.length === 0) return;
        let cancelStatus: AbsenceStatus;
        if (this._currentHoliday.Status.Code == AbsenceStatusCode.Approved) {
            if (this._absenceStatuses.length > 0) {
                cancelStatus = this._absenceStatuses.find(status => status.Code === AbsenceStatusCode.Requestforcancellation);
            }
        } else {
            if (this._absenceStatuses.length > 0) {
                cancelStatus = this._absenceStatuses.find(status => status.Code === AbsenceStatusCode.Cancelled);
            }
        }
        this._currentHoliday.StatusId = cancelStatus.Id;
        if (!isNullOrUndefined(this._employeeConfig)) {
            this._currentHoliday.CancelledBy = this._employeeConfig.UserId;
        }
        this._currentHoliday = prepareModelForUpdate(this._currentHoliday);
        this._store.dispatch(new UpdateEmployeeAbsenceAction(this._currentHoliday));
        this._cancel = false;
        this._showCancelDialog = false;
        this._currentHoliday = null;
    }




    /**
       * 
       * fires on my absence cancel popup close
       * @private
       * @param {*} event 
       * 
       * @memberOf HolidaysListComponent
       */
    public cancelModalClosed(event: any) {
        this._showCancelDialog = false;
        this._cancel = false;
        this._store.dispatch(new ClearCurrentAbsence());
    }

    /**
     * fires on my absence reason popup close
     * @private
     * @param {*} event 
     * 
     * @memberOf HolidaysListComponent
     */
    public reasonModalClosed(event: any) {
        this._reason = false;
        this._showReasonDialog = false;
        this._store.dispatch(new ClearCurrentAbsence());
    }


    /**
     * displays the delegates list
     * @private
     * @returns 
     * 
     * @memberOf HolidaysListComponent
     */
    public showDelegatesData() {
        return this._myDelegateData.length > 0;
    }

    public getPopOverVm(rowContext: any) {
        return createPopOverVm<any>(this._popOverTemplate, rowContext);
    }

    /**
  * 
  * 
  * @private
  * @param {string} myabsenceId 
  * @returns 
  * 
  * @memberOf AbsenceListComponent
  */
    public showMyAbsenceDetailsInfoIcon(myHolidayId: string) {
        let _showAbsenceDetailsInfo: boolean = false;
        if (isNullOrUndefined(myHolidayId)) return _showAbsenceDetailsInfo;
        this._absenceTypeSubscription$ = this._myHolidays$.map(x => x.find(x => x.Id === myHolidayId)).subscribe(myHoliday => _showAbsenceDetailsInfo = this._holidayAbsenceDataService.showMyAbsenceDetailsInfo(myHoliday));
        return _showAbsenceDetailsInfo;
    }

    public noOfUnitsInFraction(myHolidayId: string) {
        let fraction: string = '00:00';
        if (isNullOrUndefined(myHolidayId)) return fraction;
        this._unitsInFractionSusbscription$ = this._myHolidays$.map(x => x.find(x => x.Id === myHolidayId))
            .subscribe(myHoliday => fraction = this._holidayAbsenceDataService.noOfUnitsInFraction(myHoliday));
        return fraction;
    };

    /**
        * fires on data table page chnage 
        * @private
        * @param {*} $event 
        * 
        * @memberOf HolidaysListComponent
        */
    public onPageChange($event: AePageChangeEventModel) {
        this._currentPageNumber = $event.pageNumber;
        this._currentPageSize = $event.noOfRows;
        this._store.dispatch(new LoadEmployeeAbsencesAction({ 'pageNumber': $event.pageNumber, 'pageSize': $event.noOfRows, 'sortField': this._currentSortField, 'direction': this._currentSortDirection}));
    }

    public onSort($event: AeSortModel) {
        this._currentSortField = $event.SortField;
        this._currentSortDirection = $event.Direction;
        this._store.dispatch(new LoadEmployeeAbsencesAction({ 'sortField': $event.SortField, 'direction': $event.Direction,'pageNumber': this._currentPageNumber, 'pageSize': this._currentPageSize }));
    }

    /**
     * fires on status change
     * @param {any} event 
     * 
     * @memberOf HolidaysListComponent
     */
    public absenceStatusChange(event: AeSelectEvent<string>) {
        this.statusFilterChange.emit(event.SelectedValue);
    }



    ngOnInit() {
        //Action buttons
        this._actions = Immutable.List([
            new AeDataTableAction("Update", this._updateMyAbsenceRequest, false, (item) => { return this._showUpdateRequestAction(item) }),
            new AeDataTableAction("Resubmit", this._reSubmitRequest, false, (item) => { return this._showReasonAction(item) }),
            new AeDataTableAction("Reason", this._reasonRequest, false, (item) => { return this._showRequestAction(item) }),
            new AeDataTableAction("Cancel", this._cancelRequest, false, (item) => { return this._showCancelRequestAction(item) })

        ]);
        this._loadingStatus$ = this._store.let(fromRoot.getEmployeeAbsencesListLoadStatus);

        this._selectedHolidaySubscription$ = this._store.let(fromRoot.getCurrentSelectedAbsence).subscribe(holiday => {
            if (!isNullOrUndefined(holiday)) {
                this._currentHoliday = holiday;
                if (this._cancel) {
                    this._showCancelPopup(holiday)
                };
                if (this._resubmit) {
                    this._showResubmitPopup(holiday);
                }
                if (this._reason) {
                    this._showReasonPopup(holiday);
                }
            }
        });

        this._myHolidays$ = this._store.let(fromRoot.getEmployeeAbsencesList);
        this._totalRecords$ = this._store.let(fromRoot.getEmployeeAbsencesTotalCount);
        this._dataTableOptions$ = this._store.let(fromRoot.getEmployeeAbsencesDataTAbleOption);
        this._delegateInfoSubscription$ = this._store.let(fromRoot.getAbsencesDelegateInfo).subscribe(delegateInfo => {
            if (!isNullOrUndefined(delegateInfo)) {
                this._myDelegateData = delegateInfo;
            }
        });

        this._updateMyAbsenceRequestSubscription$ = this._updateMyAbsenceRequest.subscribe((item) => {
            if (!isNullOrUndefined(item)) {
                if ((item.Status.Code == AbsenceStatusCode.Requested ||
                    item.Status.Code == AbsenceStatusCode.Resubmitted ||
                    item.Status.Code == AbsenceStatusCode.Approved ||
                    item.Status.Code == AbsenceStatusCode.Requestforchange)) {
                    this.updateMyAbsence.emit(item.Id);
                } else if (item.Status.Code == AbsenceStatusCode.Escalated) {
                    this._showEsclateNotUpdateDialog = true;
                    this._cdRef.markForCheck();
                }
            }
        });
        this._reSubmitRequestSubscription$ = this._reSubmitRequest.subscribe((item) => {
            this._resubmit = true;
            this._store.dispatch(new LoadCurrentAbsence(item.Id));
        });
        this._reasonRequestSubscription$ = this._reasonRequest.subscribe((item) => {
            if (item.Status.Code == AbsenceStatusCode.Cancelled ||
                item.Status.Code == AbsenceStatusCode.Declined ||
                item.Status.Code == AbsenceStatusCode.Requestforcancellation) {
                this._reason = true;
                this._store.dispatch(new LoadCurrentAbsence(item.Id));
            }
        });
        this._cancelRequestSubscription$ = this._cancelRequest.subscribe((item) => {
            if (item.Status.Code != AbsenceStatusCode.Cancelled &&
                item.Status.Code != AbsenceStatusCode.Declined &&
                item.Status.Code != AbsenceStatusCode.Requestforcancellation) {
                this._cancel = true;
                this._store.dispatch(new LoadCurrentAbsence(item.Id));
                this._showCancelDialog = true;
            }
        });

    }

    ngOnDestroy(): void {
        if (!isNullOrUndefined(this._selectedHolidaySubscription$)) {
            this._selectedHolidaySubscription$.unsubscribe();
        }
        if (!isNullOrUndefined(this._userInfoSubscription$)) {
            this._userInfoSubscription$.unsubscribe();
        }
        if (!isNullOrUndefined(this._absenceTypeSubscription$)) {
            this._absenceTypeSubscription$.unsubscribe();
        }
        if (!isNullOrUndefined(this._unitsInFractionSusbscription$)) {
            this._unitsInFractionSusbscription$.unsubscribe();
        }

        if (!isNullOrUndefined(this._delegateInfoSubscription$)) {
            this._delegateInfoSubscription$.unsubscribe();
        }
        super.ngOnDestroy();
    }
    // End of public methods
}
