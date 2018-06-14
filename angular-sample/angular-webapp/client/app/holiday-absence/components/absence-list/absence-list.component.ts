import { AePageChangeEventModel } from './../../../atlas-elements/common/models/ae-page-change-event-model';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { StringHelper } from './../../../shared/helpers/string-helper';
import { createPopOverVm } from '../../../atlas-elements/common/models/popover-vm';
import { AeTemplateComponent } from '../../../atlas-elements/ae-template/ae-template.component';
import { Tristate } from '../../../atlas-elements/common/tristate.enum';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { mapFiscalYearsToAeSelectItems, extractAbsenceStatus } from '../../../shared/helpers/extract-helpers';
import { AbsenceStatusLoadAction } from '../../../shared/actions/lookup.actions';
import { EmployeeSettings } from '../../../shared/models/company.models';
import { AbsenceStatus, AbsenceStatusCode } from '../../../shared/models/lookup.models';
import { HolidayAbsenceDataService } from '../../services/holiday-absence-data.service';
import { AbsenceType } from '../../common/absence-type.enum';
import {
  ClearCurrentAbsence,
  LoadCurrentAbsence,
  LoadEmployeeConfigAction,
  LoadEmployeeAbsencesAction,
  UpdateEmployeeAbsenceAction,
  LoadEmployeeAbsenceAction
} from '../../actions/holiday-absence.actions';
import { DatePipe } from '@angular/common';
import { isNullOrUndefined } from 'util';
import { LoadEmployeeSettingsAction, LoadFiscalYearsAction } from '../../../shared/actions/company.actions';
import {
  EmployeeConfig
  , MyAbsence
  , MyDelegateInfo
  , OperationModes,
  HolidayUnitType
} from '../../models/holiday-absence.model';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { BaseComponent } from '../../../shared/base-component';
import * as fromRoot from '../../../shared/reducers';
import * as Immutable from 'immutable';
import { DateTimeHelper } from "../../../shared/helpers/datetime-helper";
import { prepareModelForUpdate } from "../../common/extract-helpers";
@Component({
  selector: 'absence-list',
  templateUrl: './absence-list.component.html',
  styleUrls: ['./absence-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbsenceListComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private field declarations
  private _absencesList$: Observable<Immutable.List<MyAbsence>>;
  private _totalRecords$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _visibility$ = new Subject<boolean>();
  private absencePopOverVisible: boolean = false;
  private _loadingStatus$: Observable<boolean>;
  private _canViewAbsenceHistory: boolean;
  private _fiscalYears: Immutable.List<AeSelectItem<string>>;
  private _absenceStatuses: AbsenceStatus[];
  private _myDelegateInfo: MyDelegateInfo[];
  private _employeeConfig: EmployeeConfig;
  private _currentAbsence: MyAbsence;
  private _employeeSettings: EmployeeSettings;
  private _selectedFiscalYear: string;
  private _employeeId: string;
  private _leaveCancelReason: string;
  private _reasonHeaderMessage: string;
  private _cancelHeaderMessage: string;
  private _cancelConfirmationText: string;
  private _update: boolean;
  private _reason: boolean;
  private _cancel: boolean;
  private _showReasonDialog: boolean;
  private _showCancelDialog: boolean;
  private _employeeSettingsLoadSubscription$: Subscription;
  private _selectedHolidaySubscription$: Subscription;
  private _myHolidaysDataSubscription$: Subscription;
  private _fiscalsYearsSubscription$: Subscription;
  private _fistcalYearsEmpSettingsCombineSubscription$: Subscription;
  private _userInfoSubscription: Subscription;
  private _absenceTypeSubscription: Subscription;
  private _employeeConfig$: Subscription;
  private _absenceStatus$: Subscription;
  private _delegateInfoSubscription: Subscription;
  private _unitsInFractionSusbscription$: Subscription;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _darkClass: AeClassStyle = AeClassStyle.Dark;
  private _iconSmall: AeIconSize = AeIconSize.small;
  private _iconTiny: AeIconSize = AeIconSize.tiny;

  private _absenceStatusItems: Immutable.List<AeSelectItem<string>>;
  // private _updateAbsenceChannel: BehaviorSubject<OperationModes>;
  private _actions: Immutable.List<AeDataTableAction>;
  private _updateMyAbsenceRequest: Subject<MyAbsence> = new Subject();
  private _reasonRequest: Subject<MyAbsence> = new Subject();
  private _cancelRequest: Subject<MyAbsence> = new Subject();

  private _updateMyAbsenceRequestSubscription$ = new Subscription();
  private _reasonRequestSubscription$ = new Subscription();
  private _cancelRequestSubscription$ = new Subscription();

  private _keys = Immutable.List(['Id', 'StartDate', 'EndDate', 'NoOfDays', 'CreatedOn', 'SubmittedToUser', 'Status', 'Comment', 'IsHour', 'Reason', 'MyAbsenceDetails']);
  private _legendOptions = [{ Text: "New", Class: "indicator--green" }, { Text: "Approved", Class: "indicator--yellow" }, { Text: "Cancelled", Class: "indicator--red" }, { Text: "Declined", Class: "indicator--purple" }, { Text: "Cancellation request", Class: "indicator--teal" }, { Text: "Change request", Class: "indicator--grey" }];

  private _currentPageNumber: number = 1;
  private _currentPageSize: number = 10;
  private _currentSortField: string = 'StartDate';
  private _currentSortDirection: SortDirection = SortDirection.Descending;

  // End of private field declarations

  // Public field declarations
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
    this._employeeSettings = val;
  }
  get employeeSettings() {
    return this._employeeSettings;
  }
 

  @Input('employeeConfig')
  set employeeConfig(val: EmployeeConfig) {
    this._employeeConfig = val;
  }
  get employeeConfig() {
    return this._employeeConfig;
  }
  
  get canViewAbsenceHistory() {
    return this._employeeSettings && this._employeeSettings.CanEmployeeViewAbsenceHistory;
  }
  get fiscalYears() {
    return this._fiscalYears;
  }
  get selectedFiscalYear() {
    return this._selectedFiscalYear;
  }
  get absencesList$() {
    return this._absencesList$;
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
  get iconSmall() {
    return this._iconSmall;
  }
  get legendOptions() {
    return this._legendOptions;
  }
  get showDelegatesData() {
    return this._showDelegatesData;
  }
  get myDelegateInfo() {
    return this._myDelegateInfo;
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
  get showReasonDialog() {
    return this._showReasonDialog;
  }
  get reasonHeaderMessage() {
    return this._reasonHeaderMessage;
  }
  get leaveCancelReason() {
    return this._leaveCancelReason;
  }
  // End of public field declarations

  // ViewChild Properties
  @ViewChild('popOverTemplate')
  _popOverTemplate: AeTemplateComponent<any>;
  // End of ViewChild Properties

  // Output property declarations
  @Output()
  updateMyAbsence: EventEmitter<string> = new EventEmitter<string>();
  // End of output propery declarations
  // constructor starts
  /**
   * Creates an instance of AbsenceListComponent.
   * @param {LocaleService} _localeService
   * @param {TranslationService} _translationService
   * @param {ChangeDetectorRef} _cdRef
   * @param {Store<fromRoot.State>} _store
   * @param {ClaimsHelperService} _claimsHelper
   *
   * @memberOf AbsenceListComponent
   */
  constructor(
    protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _holidayAbsenceDataService: HolidayAbsenceDataService
    , private _datePipe: DatePipe) {
    super(_localeService, _translationService, _cdRef);
    this._employeeId = this._claimsHelper.getEmpId();
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
  private _showReasonAction(item: MyAbsence): Tristate {
    if (item.Status.Code == AbsenceStatusCode.Declined
      || item.Status.Code == AbsenceStatusCode.Cancelled
      || item.Status.Code == AbsenceStatusCode.Requestforcancellation)
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
  private _showEditableAction(item: MyAbsence): Tristate {
    let resubmittedCount = 0;
    if (!isNullOrUndefined(item.ResubmittedCount))
      resubmittedCount = item.ResubmittedCount;
    if ((item.Status.Code == AbsenceStatusCode.Requested
      || item.Status.Code == AbsenceStatusCode.Approved
      || item.Status.Code == AbsenceStatusCode.Requestforchange)
      && (resubmittedCount <= this._employeeSettings.NoOfTimesResubmit))
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
    if (item.Status.Code == AbsenceStatusCode.Requested || item.Status.Code == AbsenceStatusCode.Approved)
      return Tristate.True;
    return Tristate.False;
  }

  private _processAbsenceStatuses() {
    if (!isNullOrUndefined(this.absenceStatuses)) {
      this._absenceStatusItems = extractAbsenceStatus(this.absenceStatuses);
    }
  }




  /**
   * 
   * 
   * @private
   * 
   * @memberOf AbsenceListComponent
   */
  private _showReasonModal() {
    if (this._currentAbsence.DeclinedBy != null && this._currentAbsence.DeclinedBy != this._employeeConfig.UserId) {
      if (isNullOrUndefined(this._currentAbsence.Comment) || this._currentAbsence.Comment.length == 0) {
        this._leaveCancelReason = "Dialog.Absences.Info_Manager_Reason_Decline";
      }
      else {
        this._leaveCancelReason = this._currentAbsence.Comment;
      }
      this._reasonHeaderMessage = "Dialog.Heading_Reason_Decline";
    } else {
      this._leaveCancelReason = 'Dialog.Absences.Info_Self_Reason';
      this._reasonHeaderMessage = "Dialog.Heading_Self_Reason";
    }
    this._showReasonDialog = true;
  }


  /**
   * 
   * @private
   * 
   * @memberOf AbsenceListComponent
   */
  private _showCanceModal() {
    if (this._currentAbsence.Status.Code === AbsenceStatusCode.Approved) {
      this._cancelHeaderMessage = "Dialog.Absences.Heading_Self_Cancel_Approved";
      this._cancelConfirmationText = "Dialog.Absences.Info_Self_Cancel_Approved";
    } else {
      this._cancelHeaderMessage = "Dialog.Absences.Heading_Self_Cancel";
      this._cancelConfirmationText = "Dialog.Absences.Info_Self_Cancel";
    }
    this._showCancelDialog = true;
  }




  private _updateMyabsence(context) {
    if (!isNullOrUndefined(context)) {
      this.updateMyAbsence.emit(context.Id);
    }
  }



  /**
   * to load the absences list
   * 
   * @private
   * @param {string} startYear 
   * @param {string} endYear 
   * 
   * @memberOf AbsenceListComponent
   */
  private _absencesListOnLoad(startYear: string, endYear: string) {
    this._store.dispatch(new LoadEmployeeAbsencesAction({
      typeId: AbsenceType.Absence.toString(),
      startDate: startYear,
      endDate: endYear, employeeId: this._claimsHelper.getEmpId(), pageNumber: 1, pageSize: 10, sortField: 'StartDate', direction: 'desc'
    }));
  }



  /**
       * displays the delegates list
       * @private
       * @returns 
       * 
       * @memberOf HolidaysListComponent
       */
  private _showDelegatesData() {
    if (isNullOrUndefined(this._myDelegateInfo)) return false;
    return this._myDelegateInfo.length > 0;
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
     * 
     * 
     * @private
     * @param {*} event 
     * 
     * @memberOf AbsenceListComponent
     */
  public reasonModalClosed(event: any) {
    this._reason = false;
    this._showReasonDialog = false;
    this._store.dispatch(new ClearCurrentAbsence());
  }


  /**
     * 
     * @private
     * 
     * @memberOf AbsenceListComponent
     */
  public showCancelModalConfirm() {
    if (this._absenceStatuses.length > 0) {
      let cancelStatus: AbsenceStatus;
      if (this._currentAbsence.Status.Code === AbsenceStatusCode.Approved) {
        cancelStatus = this._absenceStatuses.find(status => status.Code === AbsenceStatusCode.Requestforcancellation);
        this._currentAbsence.StatusId = cancelStatus.Id;
      } else {
        cancelStatus = this._absenceStatuses.find(status => status.Code === AbsenceStatusCode.Cancelled);
        this._currentAbsence.StatusId = cancelStatus.Id;
        this._currentAbsence.CancelledBy = this._employeeConfig.UserId;
        if (this._currentAbsence.IsHour) {
          this._currentAbsence.StartDate =
            this._holidayAbsenceDataService._setStartDateHourMinutes(this._currentAbsence.StartDate, this._employeeSettings.StartTimeHours).toDateString();
          this._currentAbsence.EndDate =
            this._holidayAbsenceDataService._setEndDateHourMinutes(this._currentAbsence.EndDate, this._employeeSettings.EndTimeHours).toDateString();
        } else {
          this._currentAbsence.StartDate =
            this._holidayAbsenceDataService._setStartDate(this._currentAbsence.StartDate, this._employeeSettings.StartTimeHours);
          if (!isNullOrUndefined(this._currentAbsence.EndDate)) {
            if (this._currentAbsence.Isongoing) {
              this._currentAbsence.EndDate = null;
            } else {
              this._currentAbsence.EndDate =
                this._holidayAbsenceDataService._setEndDate(this._currentAbsence.EndDate, this._employeeSettings.EndTimeHours);
            }
          }
        }
      }
    }

    this._currentAbsence = prepareModelForUpdate(this._currentAbsence);

    this._store.dispatch(new UpdateEmployeeAbsenceAction(this._currentAbsence));
    this._cancel = false;
    this._showCancelDialog = false;
  }




  /**
   * 
   * 
   * @private
   * @param {*} event 
   * 
   * @memberOf AbsenceListComponent
   */
  public cancelRequestModaClosed(event: any) {
    this._cancel = false;
    this._showCancelDialog = false;
    this._store.dispatch(new ClearCurrentAbsence());
  }




  /**
     * returns the submitted user info 
     * @private
     * @param {string} myHolidayId 
     * @returns 
     * 
     * @memberOf HolidaysListComponent
     */
  public getUserInfo(myHolidayId: string) {
    let userName = "";
    if (isNullOrUndefined(myHolidayId)) return userName;
    this._userInfoSubscription = this._absencesList$.map(x => x.find(x => x.Id === myHolidayId)).subscribe(myHoliday => userName = this._holidayAbsenceDataService.getSubmittedUserName(myHoliday, this._myDelegateInfo));
    return userName;
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
  public showMyAbsenceDetailsInfoIcon(myabsenceId: string) {
    let _showAbsenceDetailsInfo: boolean = false;
    if (isNullOrUndefined(myabsenceId)) return _showAbsenceDetailsInfo;
    this._absenceTypeSubscription = this._absencesList$.map(x => x.find(x => x.Id === myabsenceId)).subscribe(myHoliday => _showAbsenceDetailsInfo = this._holidayAbsenceDataService.showMyAbsenceDetailsInfo(myHoliday));
    return _showAbsenceDetailsInfo;
  }

  /**
    * to show units in fraction for absences
    * @private
    * @param {string} myHolidayId 
    * @returns 
    * 
    * @memberOf AbsenceListComponent
    */
  public noOfUnitsInFraction(myHolidayId: string) {
    let fraction: string = '00:00';
    if (isNullOrUndefined(myHolidayId)) return fraction;
    this._unitsInFractionSusbscription$ = this._absencesList$.map(x => x.find(x => x.Id === myHolidayId))
      .subscribe(myHoliday => fraction = this._holidayAbsenceDataService.noOfUnitsInFraction(myHoliday));
    return fraction;
  };

  /**
     * 
     * 
     * @private
     * @param {string} myHolidayId 
     * @returns 
     * 
     * @memberOf AbsenceListComponent
     */
  public getAbsenceType(myHolidayId: string) {
    let absenceTypeName = "";
    if (isNullOrUndefined(myHolidayId)) return absenceTypeName;
    this._absencesList$.map(x => x.find(x => x.Id === myHolidayId)).subscribe(myHoliday => absenceTypeName = this._holidayAbsenceDataService.getAbsenceType(myHoliday));
    return absenceTypeName;
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


  /**
        * returns the legend color
        * @private
        * @param {number} status 
        * @returns 
        * 
        * @memberOf HolidaysListComponent
        */
  public getLegendColor(status: number) {
    return this._holidayAbsenceDataService.getLegendColor(status);
  }

  public getPopOverVm(rowContext: any) {
    return createPopOverVm<any>(this._popOverTemplate, rowContext);
  }

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
    this._store.dispatch(new LoadEmployeeAbsencesAction({ 'pageNumber': $event.pageNumber, 'pageSize': $event.noOfRows, 'sortField': this._currentSortField, 'direction': this._currentSortDirection }));
  }

  public onSort($event: AeSortModel) {
    this._currentSortField = $event.SortField;
    this._currentSortDirection = $event.Direction;
    this._store.dispatch(new LoadEmployeeAbsencesAction({ 'sortField': $event.SortField, 'direction': $event.Direction, 'pageNumber': this._currentPageNumber, 'pageSize': this._currentPageSize }));
  }
  public canEmployeeAddAbsences(): boolean {
    return this._employeeSettings && this._employeeSettings.CanEmployeeViewAbsenceHistory;
  }
  /**
  * on fiscal year changes
  * @param {any} event 
  * 
  * @memberOf HolidaysHeader
  */
  public onFiscalYearChange(event) {
    let selectedYear = event.target.value;
    let _years = selectedYear.split('dt');
    const absenceStartYear = this._datePipe.transform(_years[0], 'yyyy-MM-dd');
    const absenceEndYear = this._datePipe.transform(_years[1], 'yyyy-MM-dd');
    this._absencesListOnLoad(absenceStartYear, absenceEndYear);;
  }

  ngOnInit() {
    //Action buttons
    this._actions = Immutable.List([
      new AeDataTableAction("Update", this._updateMyAbsenceRequest, false, (item) => { return this._showEditableAction(item) }),
      new AeDataTableAction("Reason", this._reasonRequest, false, (item) => { return this._showReasonAction(item) }),
      new AeDataTableAction("Cancel", this._cancelRequest, false, (item) => { return this._showCancelRequestAction(item) })

    ]);
    this._loadingStatus$ = this._store.let(fromRoot.getEmployeeAbsencesListLoadStatus);

    this._delegateInfoSubscription = this._store.let(fromRoot.getAbsencesDelegateInfo).subscribe(delegateInfo => {
      if (!isNullOrUndefined(delegateInfo)) {
        this._myDelegateInfo = delegateInfo;
      }
    });
    this._absencesList$ = this._store.let(fromRoot.getEmployeeAbsencesList);
    this._totalRecords$ = this._store.let(fromRoot.getEmployeeAbsencesTotalCount);
    this._dataTableOptions$ = this._store.let(fromRoot.getEmployeeAbsencesDataTAbleOption);

    this._selectedHolidaySubscription$ = this._store.let(fromRoot.getCurrentSelectedAbsence).subscribe(absence => {
      if (!isNullOrUndefined(absence)) {
        this._currentAbsence = absence;
        if (this._reason) {
          this._showReasonModal();
        }
        if (this._cancel) {
          this._showCanceModal();
        }
      }
    });

    this._employeeConfig$ = this._store.let(fromRoot.getEmployeeConfigData).subscribe((employeeConfig) => {
      if (!isNullOrUndefined(employeeConfig)) {
        this._employeeConfig = employeeConfig;
      }
    });
    this._updateMyAbsenceRequestSubscription$ = this._updateMyAbsenceRequest.subscribe((item) => {
      if (!isNullOrUndefined(item)) {
        this.updateMyAbsence.emit(item.Id);
      }
    })
    this._reasonRequestSubscription$ = this._reasonRequest.subscribe((item) => {
      this._reason = true;
      this._store.dispatch(new LoadCurrentAbsence(item.Id));
    })
    this._cancelRequestSubscription$ = this._cancelRequest.subscribe((item) => {
      this._cancel = true;
      this._store.dispatch(new LoadCurrentAbsence(item.Id));
    })
  }

  ngOnDestroy(): void {
    if (!isNullOrUndefined(this._selectedHolidaySubscription$)) {
      this._selectedHolidaySubscription$.unsubscribe();
    }
    if (!isNullOrUndefined(this._myHolidaysDataSubscription$)) {
      this._myHolidaysDataSubscription$.unsubscribe();
    }

    if (!isNullOrUndefined(this._absenceTypeSubscription)) {
      this._absenceTypeSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._unitsInFractionSusbscription$)) {
      this._unitsInFractionSusbscription$.unsubscribe();
    }

    if (!isNullOrUndefined(this._employeeSettingsLoadSubscription$))
      this._employeeSettingsLoadSubscription$.unsubscribe();

    if (!isNullOrUndefined(this._fiscalsYearsSubscription$))
      this._fiscalsYearsSubscription$.unsubscribe();
    if (!isNullOrUndefined(this._employeeConfig$))
      this._employeeConfig$.unsubscribe();
    if (!isNullOrUndefined(this._absenceStatus$))
      this._absenceStatus$.unsubscribe();
    if (!isNullOrUndefined(this._fistcalYearsEmpSettingsCombineSubscription$))
      this._fistcalYearsEmpSettingsCombineSubscription$.unsubscribe();
    if (!isNullOrUndefined(this._userInfoSubscription))
      this._userInfoSubscription.unsubscribe();

    if (!isNullOrUndefined(this._delegateInfoSubscription))
      this._delegateInfoSubscription.unsubscribe();
  }
  // End of public methods
}
