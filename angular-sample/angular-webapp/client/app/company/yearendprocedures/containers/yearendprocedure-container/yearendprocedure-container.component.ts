import {
  Component
  , OnInit
  , ChangeDetectorRef
  , OnDestroy
  , ChangeDetectionStrategy
  , ViewEncapsulation,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { BaseComponent } from './../../../../shared/base-component';
import { IBreadcrumb } from './../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from 'util';
import {
  LoadEmployeeSettingsAction
  , LoadAbsenceTypeAction
  , LoadFiscalYearsAction
} from './../../../../shared/actions/company.actions';
import { EmployeeSettings, HolidayUnitType, AbsenceType, FiscalYear } from './../../../../shared/models/company.models';
import { BehaviorSubject, Subscription, Observable } from 'rxjs/Rx';
import { AeWizardStep } from './../../../../atlas-elements/common/models/ae-wizard-step';
import { ActivatedRoute, Router } from '@angular/router';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { SystemTenantId, requestedAbsenceStatusId } from './../../../../shared/app.constants';
import { YearEndProcedureModel, YearEndProcedureStatus } from '../../models/yearendprocedure-model';
import {
  LoadYearEndProcedureDataAction
  , LoadHolidayAbsenceRequestsAction
  , UpdateYearEndProcedureAction,
  UpdatePendingHolidayAbsenceRequestAction
} from '../../actions/yearendprocedure-actions';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { OperationModes, AbsenceStatus } from './../../../../shared/models/lookup.models';
import { WeekModel } from './../../../../shared/models/weekmodel';
import { TeamRoster } from './../../../../holiday-absence/models/team-roster.model';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import {
  MyAbsence
  , MyAbsenceVM
  , EmployeeConfig
  , FiscalYearSummary
} from './../../../../holiday-absence/models/holiday-absence.model';
import { DateTimeHelper } from './../../../../shared/helpers/datetime-helper';
import { SetTeamCalendarAction } from './../../../../calendar/actions/calendar.actions';
import {
  LoadSelectedEmployeeAbsenceAction
  , LoadHoliayAbsenceRequestTeamRosterAction,
  LoadSelectedEmployeeConfigAction,
  LoadSelectedEmployeeSummaryAction
} from './../../../../holiday-absence/actions/holiday-absence-requests.actions';
import { HolidayAbsenceDataService } from './../../../../holiday-absence/services/holiday-absence-data.service';
import { CommonHelpers } from './../../../../shared/helpers/common-helpers';
import { extractMyAbsenceVM, prepareUpdateModel } from './../../../../holiday-absence/common/extract-helpers';
import { AeWizardComponent } from './../../../../atlas-elements/ae-wizard/ae-wizard.component';
import { AeIconSize } from './../../../../atlas-elements/common/ae-icon-size.enum';
import { BreadcrumbGroup } from './../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { getRequestParamsList } from '../../common/extract-helpers';
import { AbsenceStatusLoadAction } from './../../../../shared/actions/lookup.actions';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'yearendprocedure-container',
  templateUrl: './yearendprocedure-container.component.html',
  styleUrls: ['./yearendprocedure-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class YearendprocedureContainerComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {

  // private fields declarations start
  private _employeeSettings: EmployeeSettings;
  private _yepWizardSteps$: BehaviorSubject<Immutable.List<AeWizardStep>>;
  private _employeeSettingsSubscription: Subscription;
  private _canHaveAccessToYEP: boolean = false;
  private _routeSubscription: Subscription;
  private _yearEndProcedure: YearEndProcedureModel;
  private _yearEndProcedureSubscription: Subscription;
  private _holidayAbsenceRequest: AtlasApiRequestWithParams;

  private _isApproveMode: boolean = false;
  private _employeeAbsence: MyAbsence;
  private _showTeamRoaster: boolean = false;
  private _userId: string;

  private _selectedEmployeeRequestWeekModel: WeekModel;
  private _rosterLoaded$: Observable<boolean>;
  private _rosterData$: Observable<Immutable.List<TeamRoster>>;
  private _rosterTotalCount$: Observable<number>;
  private _rosterDataTableOptions$: Observable<DataTableOptions>;
  private _operationMode: OperationModes;
  private _showMyAbsenceManageForm: boolean;
  private _showTeamCalendar: boolean;
  private _showTeamCalendar$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private _selectedEmployeeDepartmentId: string;
  private _selectedEmployeeDepartmentName: string;
  private _showMyAbsenceDeclineForm: boolean = false;
  private _myHolidayAbsenceVM: MyAbsenceVM;
  private _selectedEmployeeId: string;
  private _employeeAbsenceSubscription: Subscription;
  private _showHolidaySettings: boolean = false;
  private _onDemandDataloader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private _workingDaysSubscription: Subscription;
  private _teamCalendarRouterSubscription: Subscription;
  private _pendingHolidayRequestsCount: number = 0;
  private _pendingEmployeesCountSubscription: Subscription;
  private _employeeConfigSubscription: Subscription;
  private _absenceStatusSubScription: Subscription;
  private _absenceStatusList: Array<AbsenceStatus>;
  private _onRequestSelectDataloader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private _absenceStatusDataloader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private _absenceTypesDataloader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private _yepCurrentStatusSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private _employeeConfig: EmployeeConfig;
  private _absenceTypesSubscription: Subscription;
  private _absenceTypes: Array<AbsenceType>;
  private _fiscalyearDataSubscription: Subscription;
  private _fiscalYearData: Array<FiscalYear>;
  private _fiscalYearSummary: FiscalYearSummary;
  private _fiscalyearSummarySubscription: Subscription;
  private _loadingPendingRequests: boolean = true;
  private _pendingRequestsDataSubscription: Subscription;
  private _translationSubscription: Subscription;
  private _startMonth: string = '-';
  private _endMonth: string = '-';
  private _nextEndDate: string = '-';
  private _yepStatusMessage: string;
  // end of private declarations

  // getters start
  public get yepStatusMessage() {
    if (!StringHelper.isNullOrUndefinedOrEmpty(this._yepStatusMessage)) {
      return this._yepStatusMessage;
    }
    return null;
  }

  public get startMonth() {
    return this._startMonth;
  }

  public get endMonth() {
    return this._endMonth;
  }

  public get nextEndDate() {
    return this._nextEndDate;
  }

  public get loadingPendingRequests() {
    return this._loadingPendingRequests;
  }

  public get fiscalYearData() {
    return this._fiscalYearData;
  }

  public get fiscalYearSummary() {
    return this._fiscalYearSummary;
  }

  public get showHolidaySettings() {
    return this._showHolidaySettings;
  }

  public get yepWizardSteps$() {
    return this._yepWizardSteps$;
  }

  public get employeeSettings() {
    return this._employeeSettings;
  }

  public get lightClass() {
    return AeClassStyle.Light;
  }

  public get canManageYEP() {
    return this._claimsHelper.canManageYearEndProcedure();
  }

  public get canHaveCid() {
    return this._claimsHelper.canAccessGroupCompanies() ||
      this._claimsHelper.canAccessGroupFranchiseCompanies();
  }

  public get canHaveAccessToYEP() {
    return this._canHaveAccessToYEP;
  }

  public get yearEndProcedure() {
    return this._yearEndProcedure;
  }

  public get showTeamCalendar() {
    return this._showTeamCalendar;
  }
  public get selectedEmployeeDepartmentName() {
    return this._selectedEmployeeDepartmentName;
  }
  public set selectedEmployeeDepartmentName(val: string) {
    this._selectedEmployeeDepartmentName = val;
  }
  public get showTeamCalendar$() {
    return this._showTeamCalendar$;
  }
  public get showTeamRoaster() {
    return this._showTeamRoaster;
  }
  public get rosterLoaded$() {
    return this._rosterLoaded$;
  }
  public get rosterData$() {
    return this._rosterData$;
  }
  public get rosterTotalCount$() {
    return this._rosterTotalCount$;
  }
  public get rosterDataTableOptions$() {
    return this._rosterDataTableOptions$;
  }
  public get selectedEmployeeDepartmentId() {
    return this._selectedEmployeeDepartmentId;
  }
  public set selectedEmployeeDepartmentId(val: string) {
    this._selectedEmployeeDepartmentId = val;
  }
  public get selectedEmployeeRequestWeekModel() {
    return this._selectedEmployeeRequestWeekModel;
  }
  public get showMyAbsenceDeclineForm() {
    return this._showMyAbsenceDeclineForm;
  }
  public get employeeAbsence() {
    return this._employeeAbsence;
  }
  public get showMyAbsenceManageForm() {
    return this._showMyAbsenceManageForm;
  }
  public get operationMode() {
    return OperationModes.Update;
  }
  public get isApproveMode() {
    return this._isApproveMode;
  }
  public get myHolidayAbsenceVM() {
    return this._myHolidayAbsenceVM;
  }
  public get bigIconSize() {
    return AeIconSize.big;
  }
  public get employeeConfig() {
    return this._employeeConfig;
  }
  public get userId() {
    return this._userId;
  }

  public get canProcessYEP() {
    if (!isNullOrUndefined(this._yearEndProcedure) &&
      (this._yearEndProcedure.Status === YearEndProcedureStatus.Completed ||
        this._yearEndProcedure.Status === YearEndProcedureStatus.NotReachedYearEnd ||
        this._yearEndProcedure.Status === YearEndProcedureStatus.Error)) {
      return false;
    }
    return true;
  }

  public get isYEPCompleted() {
    if (!isNullOrUndefined(this._yearEndProcedure) &&
      (this._yearEndProcedure.Status === YearEndProcedureStatus.Completed)) {
      return true;
    }
    return false;
  }

  public get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Company;
  }

  public get absenceStatusList() {
    return this._absenceStatusList;
  }

  public get absenceTypes() {
    return this._absenceTypes;
  }
  // end of getters

  // viewchild bindings starts
  @ViewChild('wizard')
  wizard: AeWizardComponent;
  // end of view child bindings

  // constructor starts
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _breadcrumbService: BreadcrumbService
    , private _store: Store<fromRoot.State>
    , private _route: ActivatedRoute
    , private _router: Router
    , private _dataService: HolidayAbsenceDataService
    , private _datePipe: DatePipe) {
    super(_localeService, _translationService, _changeDetector);
    let bcItem: IBreadcrumb = new IBreadcrumb('Year end procedures',
      'company/yearendprocedure', BreadcrumbGroup.Company);
    this._breadcrumbService.clear(BreadcrumbGroup.Company);
    this._breadcrumbService.add(bcItem);
  }
  // end of constructor

  // private methods start
  private _loadPendingRequests() {
    let params: Map<string, string> = new Map<string, string>();
    params.set('StatusId', requestedAbsenceStatusId);
    params.set('StartDate', this._yearEndProcedure.FiscalYearData.StartDate.toDateString());
    params.set('EndDate', this._yearEndProcedure.FiscalYearData.EndDate.toDateString());
    this._holidayAbsenceRequest = new AtlasApiRequestWithParams(1, 10, 'StartDate', SortDirection.Descending, []);
    this._holidayAbsenceRequest.Params = getRequestParamsList(params);
    this._store.dispatch(new LoadHolidayAbsenceRequestsAction(this._holidayAbsenceRequest));
    this._cdRef.markForCheck();
  }

  private _prepareApprovalFormData() {
    this._isApproveMode = true;
    this._myHolidayAbsenceVM = new MyAbsenceVM();
    this._operationMode = OperationModes.Update;
  }

  private _onViewTeamCalendar(): void {
    // this._router.navigate([('calendar')], { relativeTo: this._route, skipLocationChange: true });
    this._router.navigate([('teamcalendar')], { relativeTo: this._route, skipLocationChange: true });

    this._teamCalendarRouterSubscription = this._router.events.subscribe((e) => {
    });
  }

  private _doAllTranslations() {
    this._yepStatusMessage = this.getYEPStatusMessage();
    this._cdRef.markForCheck();
  }

  private _getEmployeeAbsenceVM(empAbsence: MyAbsence) {
    if (isNullOrUndefined(empAbsence)) {
      return;
    }

    let startDate = DateTimeHelper.getDatePartfromString(empAbsence.StartDate);
    let endDate = DateTimeHelper.getDatePartfromString(empAbsence.EndDate);

    this._workingDaysSubscription = this._dataService.getWorkingDays(startDate
      , endDate
      , empAbsence.EmployeeId)
      .first().subscribe((workingDays) => {
        this._myHolidayAbsenceVM = new MyAbsenceVM();
        this._myHolidayAbsenceVM = Object.assign(this._myHolidayAbsenceVM, extractMyAbsenceVM(empAbsence, workingDays));

        this._cdRef.markForCheck();
      });
  }

  // end of private methods

  // public methods start
  public onPullFiscalYearSummary(fyYearValue) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(fyYearValue)) {
      let dateBounds = CommonHelpers.processFSYearValue(fyYearValue, this._datePipe);
      this._store.dispatch(new LoadSelectedEmployeeSummaryAction({
        refreshSummary: false,
        forceRefresh: false,
        startDate: dateBounds.StartDate,
        endDate: dateBounds.EndDate,
        employeeId: this._employeeAbsence.EmployeeId
      }));
    }
  }

  public closeMyAbsenceDeclineForm() {
    this._isApproveMode = false;
    this._showMyAbsenceDeclineForm = false;
    this._employeeAbsence = null;
    this._myHolidayAbsenceVM = null;

    this._onRequestSelectDataloader.next(false);
    this._onDemandDataloader.next(false);
    this._absenceTypesDataloader.next(false);
    this._absenceStatusDataloader.next(false);
  }

  public closeMyAbsenceManageForm() {
    this._isApproveMode = false;
    this._showMyAbsenceManageForm = false;
    this._employeeAbsence = null;
    this._myHolidayAbsenceVM = null;

    this._onRequestSelectDataloader.next(false);
    this._onDemandDataloader.next(false);
    this._absenceTypesDataloader.next(false);
    this._absenceStatusDataloader.next(false);
  }

  public closeViewTeamCalendar() {
    this._showTeamCalendar = false;
    this._showTeamCalendar$.next(false);
    this._selectedEmployeeDepartmentId = '';
    this._selectedEmployeeDepartmentName = '';

    this._onRequestSelectDataloader.next(false);
    this._onDemandDataloader.next(false);
    this._absenceTypesDataloader.next(false);
    this._absenceStatusDataloader.next(false);
  }

  public closeTeamRoaster($event) {
    this._showTeamRoaster = false;
  }

  public getMyAbsenceDeclineSlideoutState() {
    return this._showMyAbsenceDeclineForm ? 'expanded' : 'collapsed';
  }

  public getMyAbsenceManageSlideoutState() {
    return this._showMyAbsenceManageForm ? 'expanded' : 'collapsed';
  }

  public getViewTeamCalendarSlideoutState() {
    return this._showTeamCalendar ? 'expanded' : 'collapsed';
  }

  public getTeamRoasterSlideoutState() {
    return this._showTeamRoaster ? 'expanded' : 'collapsed';
  }

  public onWeekChange(data: WeekModel) {
    // here the changed deparmentid, start date, end date will be emiited 
    // and need to raise fresh API here to get the modified team roster data
    let apiRequestWithParams: AtlasApiRequestWithParams;
    let params: AtlasParams[] = []
    params.push(new AtlasParams('departmentId', this._selectedEmployeeDepartmentId));
    params.push(new AtlasParams('managerId', this._selectedEmployeeDepartmentId));
    params.push(new AtlasParams('startDate', data.StartDate.toDateString()));
    params.push(new AtlasParams('endDate', data.EndDate.toDateString()));
    apiRequestWithParams = new AtlasApiRequestWithParams(0, 0, 'StartDate', SortDirection.Descending, params);
    this._store.dispatch(new LoadHoliayAbsenceRequestTeamRosterAction(apiRequestWithParams));
  }

  public onSelectTeamRoaster(data: MyAbsence) {
    // here prepare the request to raise the team roaster api and subscribe to the response 
    // and pass this as input to the team roaster component
    this._showTeamRoaster = true;
    this._selectedEmployeeDepartmentId = data.DepartmentId;
    this._selectedEmployeeDepartmentName = data.DepartmentName;
    let apiRequestWithParams: AtlasApiRequestWithParams;
    let params: AtlasParams[] = [];
    // Here the start data and end date will be evaluted from the selected absence start date.
    this._selectedEmployeeRequestWeekModel = DateTimeHelper.getWeek(new Date(data.StartDate));
    params.push(new AtlasParams('departmentId', data.DepartmentId));
    params.push(new AtlasParams('managerId', data.DepartmentId));
    params.push(new AtlasParams('startDate', this._selectedEmployeeRequestWeekModel.StartDate.toDateString()));
    params.push(new AtlasParams('endDate', this._selectedEmployeeRequestWeekModel.EndDate.toDateString()));
    apiRequestWithParams = new AtlasApiRequestWithParams(0, 0, 'StartDate', SortDirection.Descending, params);
    this._store.dispatch(new LoadHoliayAbsenceRequestTeamRosterAction(apiRequestWithParams));
  }


  public onApproveRequest(myAbsence: MyAbsence) {
    if (!isNullOrUndefined(myAbsence)) {
      this._store.dispatch(new LoadSelectedEmployeeAbsenceAction(myAbsence.Id));
      this._selectedEmployeeId = myAbsence.EmployeeId;
      this._prepareApprovalFormData();
      this._showMyAbsenceManageForm = true;

      this._onRequestSelectDataloader.next(true);
      this._onDemandDataloader.next(true);
      this._absenceTypesDataloader.next(true);
      this._absenceStatusDataloader.next(true);
      this._cdRef.markForCheck();
    }
  }

  public onViewTeamCalendarRequest(myAbsence: MyAbsence) {
    if (!isNullOrUndefined(myAbsence)) {
      this._store.dispatch(new SetTeamCalendarAction(true));
      this._store.dispatch(new LoadSelectedEmployeeAbsenceAction(myAbsence.Id));
      this._selectedEmployeeDepartmentId = myAbsence.Employee.Job.DepartmentId;
      this._selectedEmployeeDepartmentName = myAbsence.DepartmentName;
      this._selectedEmployeeId = myAbsence.EmployeeId;
      this._showTeamCalendar = true;
      this._showTeamCalendar$.next(true);

      this._onRequestSelectDataloader.next(false);
      this._onDemandDataloader.next(false);
      this._absenceTypesDataloader.next(false);
      this._absenceStatusDataloader.next(false);
      // render calendar throught router outlet
      // this._onViewTeamCalendar();
    }
  }

  public onDeclineRequest(myAbsenceId: string) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(myAbsenceId)) {
      this._store.dispatch(new LoadSelectedEmployeeAbsenceAction(myAbsenceId));
      this._showMyAbsenceDeclineForm = true;

      this._onRequestSelectDataloader.next(false);
      this._onDemandDataloader.next(false);
      this._absenceTypesDataloader.next(false);
      this._absenceStatusDataloader.next(true);
    }
  }

  public closeHolidaySettingsSlideout(e) {
    this._showHolidaySettings = false;
  }

  public getHolidaySettingsSlideoutState() {
    return this._showHolidaySettings ? 'expanded' : 'collapsed';
  }

  public openHolidaySettingsPanel(e) {
    this._onDemandDataloader.next(true);
    this._showHolidaySettings = true;
  }

  public submitStepData(e) {
    if (!isNullOrUndefined(this.wizard)) {
      let activeStep = this.wizard.activeStep();
      switch (activeStep.templateType) {
        case 'requestsStep': {
          // this.wizard.next();
        }
          break;
        case 'yepreadyStep': {
          this._store.dispatch(new UpdateYearEndProcedureAction(this._yearEndProcedure));
        }
          break;
        case 'yepConfirmedStep': {
          this._yearEndProcedure.Status = YearEndProcedureStatus.Completed;
          this._cdRef.markForCheck();
        }
          break;
      }
      this.wizard.next();
    }
  }

  public getYEPStatusMessage() {
    if (!isNullOrUndefined(this._yearEndProcedure)) {
      let startDateText = DateTimeHelper.formatDate(this._yearEndProcedure.FiscalYearData.StartDate, false);
      let endDateText = DateTimeHelper.formatDate(this._yearEndProcedure.FiscalYearData.EndDate, false);
      if (this._yearEndProcedure.Status !== YearEndProcedureStatus.NotReachedYearEnd) {
        if (this._yearEndProcedure.Status === YearEndProcedureStatus.Completed) {
          return this._translationService.translate('YEAR_END_PROCEDURE.YEP_SUCCESS'
            , { startDate: startDateText, endDate: endDateText }
            , this.lang);
        } else {
          return this._translationService.translate('YEAR_END_PROCEDURE.YEP_INPROGRESS'
            , { startDate: startDateText, endDate: endDateText }
            , this.lang);
        }
      } else {
        return this._translationService.translate('YEAR_END_PROCEDURE.YEP_NOT_REACHED', { endDate: endDateText }, this.lang);
      }
    }
    return null;
  }

  public canNavigate() {
    return (stepToNavigate: AeWizardStep) => {
      let canAllow: boolean = false;
      let currentStep = this.wizard.activeStep();
      if (!isNullOrUndefined(this._yearEndProcedure) &&
        !isNullOrUndefined(currentStep) &&
        !isNullOrUndefined(stepToNavigate)) {
        let stepType = stepToNavigate.templateType;
        switch (stepType) {
          case 'requestsStep': {
            canAllow = (this._pendingHolidayRequestsCount > 0 && this._yearEndProcedure.Status === YearEndProcedureStatus.NotStarted);
          }
            break;
          case 'yepreadyStep': {
            canAllow = (this._pendingHolidayRequestsCount === 0 && this._yearEndProcedure.Status === YearEndProcedureStatus.NotStarted);
          }
            break;
          case 'yepReviewStep': {
            canAllow = (this._pendingHolidayRequestsCount === 0 &&
              (this._yearEndProcedure.Status === YearEndProcedureStatus.InProgress ||
                this._yearEndProcedure.Status === YearEndProcedureStatus.AwaitingReview ||
                this._yearEndProcedure.Status === YearEndProcedureStatus.ErrorWhileApplyingConfirmedChanges));
          }
            break;
          case 'yepConfirmedStep': {
            canAllow = (this._pendingHolidayRequestsCount === 0 &&
              this._yearEndProcedure.Status === YearEndProcedureStatus.ReviewConfirmed);
          }
            break;
        }
      }
      return canAllow;
    };
  }

  public onDeclineComplete(empAbsence) {
    this._store.dispatch(new UpdatePendingHolidayAbsenceRequestAction(empAbsence));
    this._showMyAbsenceDeclineForm = false;
    this._cdRef.markForCheck();
    this._employeeAbsence = null;

    this._onRequestSelectDataloader.next(false);
    this._onDemandDataloader.next(false);
    this._absenceTypesDataloader.next(false);
    this._absenceStatusDataloader.next(false);
  }


  public saveEmployeeHoliday(employeeAbsenceVM: MyAbsenceVM) {
    if (!isNullOrUndefined(employeeAbsenceVM)) {
      let empAbsence: MyAbsence;
      empAbsence = prepareUpdateModel(this._employeeAbsence
        , employeeAbsenceVM
        , this._employeeConfig
        , this._employeeSettings
        , this._absenceStatusList
        , this._isApproveMode
        , this._userId);
      this._store.dispatch(new UpdatePendingHolidayAbsenceRequestAction(empAbsence));
      this._showMyAbsenceManageForm = false;
      this._myHolidayAbsenceVM = null;
      this._employeeAbsence = null;
      this._operationMode = null;
      this._cdRef.markForCheck();
    }
  }

  public gotoRequiredStep(stepName: string) {
    let steps = this._yepWizardSteps$.getValue();
    if (!isNullOrUndefined(steps) && steps.count() > 0) {
      let currentStep = steps.filter(c => c.isActive).first();
      if (isNullOrUndefined(currentStep) ||
        (!isNullOrUndefined(currentStep) && currentStep.templateType !== stepName)) {
        this.wizard.goToStep(steps.filter(c => c.templateType === stepName).first());
      }
    }
  }

  public handleWizardNavigation() {
    if (!isNullOrUndefined(this.wizard)) {
      let steps = this._yepWizardSteps$.getValue();
      if (this._pendingHolidayRequestsCount > 0) {
        this.gotoRequiredStep('requestsStep');
      } else {
        switch (this._yearEndProcedure.Status) {
          case YearEndProcedureStatus.NotReachedYearEnd: {            
          }
            break;
          case YearEndProcedureStatus.Error: {            
          }
            break;
          case YearEndProcedureStatus.NotStarted: {
            this.gotoRequiredStep('requestsStep');
          }
            break;
          case YearEndProcedureStatus.InProgress:
          case YearEndProcedureStatus.AwaitingReview:
          case YearEndProcedureStatus.ErrorWhileApplyingConfirmedChanges: {
            this.gotoRequiredStep('yepReviewStep');
          }
            break;
          case YearEndProcedureStatus.ReviewConfirmed: {
            this.gotoRequiredStep('yepConfirmedStep');
          }
            break;
          case YearEndProcedureStatus.Completed: {            
          }
            break;
        }
      }
      this._cdRef.markForCheck();
    }
  }

  ngOnInit() {
    this._userId = this._claimsHelper.getUserId();

    this._routeSubscription = this._route.params.subscribe(params => {
      if (!StringHelper.isNullOrUndefinedOrEmpty(params['cid'])) {
        let cid = params['cid'];
        this._canHaveAccessToYEP = (this.canHaveCid && this.canManageYEP) ||
          (this._claimsHelper.getCompanyId().toLowerCase() === SystemTenantId.toLowerCase() &&
            ((cid.toLowerCase() === SystemTenantId.toLowerCase() && this.canManageYEP) ||
              cid.toLowerCase() !== SystemTenantId.toLowerCase()));
      } else {
        this._canHaveAccessToYEP = this.canManageYEP;
      }
      this._cdRef.markForCheck();
    });

    this._absenceTypesSubscription =
      Observable.combineLatest(this._absenceTypesDataloader,
        this._store.let(fromRoot.absenceTypesWithoutDuplicatesData)).subscribe((vals) => {
          let canLoadData = vals[0];
          let absenceTypes = vals[1];
          if (StringHelper.coerceBooleanProperty(canLoadData)) {
            if (isNullOrUndefined(absenceTypes)) {
              this._store.dispatch(new LoadAbsenceTypeAction(true));
            } else {
              this._absenceTypes = absenceTypes;
              this._cdRef.markForCheck();
              this._absenceTypesDataloader.next(false);
            }
          }
        });

    this._fiscalyearDataSubscription =
      Observable.combineLatest(this._store.let(fromRoot.getEmployeeSettingsData),
        this._store.let(fromRoot.getFiscalYearsData))
        .subscribe((val) => {
          let result = { settings: val[0], years: val[1] };
          if (!isNullOrUndefined(result.settings)
            && isNullOrUndefined(result.years)) {
            this._store.dispatch(new LoadFiscalYearsAction({
              startDate: result.settings.FiscalStartDate,
              endDate: result.settings.FiscalEndDate
            }));
          } else if (!isNullOrUndefined(result.settings)
            && !isNullOrUndefined(result.years)) {
            this._fiscalYearData = result.years;
            this._cdRef.markForCheck();
          }
        });

    this._fiscalyearSummarySubscription = this._store.let(fromRoot.getSelectedEmployeeHolidaySummaryData)
      .subscribe((summary) => {
        this._fiscalYearSummary = summary;
        this._cdRef.markForCheck();
      });

    this._employeeConfigSubscription = Observable.combineLatest(this._onRequestSelectDataloader
      , this._store.let(fromRoot.getSelectedEmployeeConfig))
      .subscribe((result) => {
        let canLoadData = result[0];
        let employeeConfig = result[1];
        if (canLoadData) {
          if ((isNullOrUndefined(employeeConfig) ||
            (!isNullOrUndefined(employeeConfig) &&
              !StringHelper.isNullOrUndefinedOrEmpty(this._selectedEmployeeId) &&
              employeeConfig.Id.toLowerCase() !== this._selectedEmployeeId.toLowerCase()))) {
            this._store.dispatch(new LoadSelectedEmployeeConfigAction(this._selectedEmployeeId));
          } else {
            this._employeeConfig = employeeConfig;
            this._cdRef.markForCheck();
            this._onRequestSelectDataloader.next(false);
          }
        }
      });

    this._yepWizardSteps$ = new BehaviorSubject<Immutable.List<AeWizardStep>>(Immutable.List([
      new AeWizardStep('Pending holiday/absence requests', '', 'requestsStep', true),
      new AeWizardStep('Ready', '', 'yepreadyStep', true),
      new AeWizardStep('Review', '', 'yepReviewStep', true),
      new AeWizardStep('Confirmed', '', 'yepConfirmedStep', true)
    ]));

    this._employeeSettingsSubscription = Observable.combineLatest(
      this._onDemandDataloader,
      this._store.let(fromRoot.getEmployeeSettingsData)).subscribe((values) => {
        if (StringHelper.coerceBooleanProperty(values[0])) {
          let data = values[1];
          if (!isNullOrUndefined(data)) {
            this._employeeSettings = data;
            this._cdRef.markForCheck();
            this._onDemandDataloader.next(false);
          } else {
            this._store.dispatch(new LoadEmployeeSettingsAction(true));
          }
        }
      });

    this._yearEndProcedureSubscription = this._store.let(fromRoot.getYearEndProcedureData).subscribe((data) => {
      if (!isNullOrUndefined(data)) {
        this._yearEndProcedure = data;
        this._yepStatusMessage = this.getYEPStatusMessage();
        let endDate = new Date(this._yearEndProcedure.FiscalYearData.EndDate);
        let startdDate = new Date(this._yearEndProcedure.FiscalYearData.StartDate);

        this._startMonth = this._datePipe.transform(startdDate, 'MMMM');
        this._endMonth = this._datePipe.transform(endDate, 'MMMM');

        endDate.setFullYear(endDate.getFullYear() + 1);
        this._nextEndDate = DateTimeHelper.formatDate(endDate, false);

        this._yepCurrentStatusSubject.next(true);
        if (this._yearEndProcedure.Status === YearEndProcedureStatus.NotStarted) {
          this._loadPendingRequests();
        }
        this._cdRef.markForCheck();
      } else {
        this._store.dispatch(new LoadYearEndProcedureDataAction(true));
      }
    });

    this._employeeAbsenceSubscription = this._store.let(fromRoot.getSelectedEmployeeAbsence)
      .subscribe((empAbsence) => {
        if (!isNullOrUndefined(empAbsence)) {
          this._employeeAbsence = empAbsence;
          this._cdRef.markForCheck();
          if (this._showMyAbsenceManageForm) {
            this._getEmployeeAbsenceVM(empAbsence);
          }
        }
      });

    // start of team roster
    this._rosterLoaded$ = this._store.let(fromRoot.getTeamRosterLoadedData);
    this._rosterData$ = this._store.let(fromRoot.getTeamRosterData);
    this._rosterTotalCount$ = this._store.let(fromRoot.getTeamRosterTotalCountData);
    this._rosterDataTableOptions$ = this._store.let(fromRoot.getTeamRosterDataTableOptionsData);
    // end of team roster

    this._pendingRequestsDataSubscription =
      this._store.let(fromRoot.getPendingHolidayAbsenceRequestsData).subscribe((data) => {
        if (!isNullOrUndefined(data)) {
          this._loadingPendingRequests = false;
          this._cdRef.markForCheck();
        }
      });

    this._pendingEmployeesCountSubscription =
      Observable.combineLatest(this._yepCurrentStatusSubject,
        this._store.let(fromRoot.getPendingRequestsTotalCountData))
        .subscribe((vals) => {
          let yepDataLoadCompleted = vals[0];
          let count = vals[1];
          if (!isNullOrUndefined(count) ||
            StringHelper.coerceBooleanProperty(yepDataLoadCompleted)) {

            count = isNullOrUndefined(count) ? 0 : count;
            this._pendingHolidayRequestsCount = count;
            this.handleWizardNavigation();
          } else {
            this._pendingHolidayRequestsCount = 0;
            this._cdRef.markForCheck();
          }
        });

    this._absenceStatusSubScription =
      Observable.combineLatest(this._absenceStatusDataloader,
        this._store.let(fromRoot.getAbsenceStatusData))
        .subscribe((vals) => {
          let canLoadData = vals[0];
          let absenceStatuses = vals[1];
          if (StringHelper.coerceBooleanProperty(canLoadData)) {
            if (isNullOrUndefined(absenceStatuses)) {
              this._store.dispatch(new AbsenceStatusLoadAction(true));
            } else {
              this._absenceStatusList = absenceStatuses;
              this._cdRef.markForCheck();
              this._absenceStatusDataloader.next(false);
            }
          }
        });

    this._doAllTranslations();
    this._translationSubscription =
      this._translationService.translationChanged.subscribe(
        () => {
          this._doAllTranslations();
        }
      );
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._employeeSettingsSubscription)) {
      this._employeeSettingsSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._routeSubscription)) {
      this._routeSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._yearEndProcedureSubscription)) {
      this._yearEndProcedureSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._employeeAbsenceSubscription)) {
      this._employeeAbsenceSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._workingDaysSubscription)) {
      this._workingDaysSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._teamCalendarRouterSubscription)) {
      this._teamCalendarRouterSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._pendingEmployeesCountSubscription)) {
      this._pendingEmployeesCountSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._employeeConfigSubscription)) {
      this._employeeConfigSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._absenceStatusSubScription)) {
      this._absenceStatusSubScription.unsubscribe();
    }

    if (!isNullOrUndefined(this._pendingRequestsDataSubscription)) {
      this._pendingRequestsDataSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._workingDaysSubscription)) {
      this._workingDaysSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._fiscalyearDataSubscription)) {
      this._fiscalyearDataSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._fiscalyearSummarySubscription)) {
      this._fiscalyearSummarySubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._translationSubscription)) {
      this._translationSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    if (StringHelper.coerceBooleanProperty(this._yepCurrentStatusSubject.getValue())) {
      this.handleWizardNavigation();
    }
  }
  // end of public methods
}
