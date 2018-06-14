import { addOrUpdateAtlasParamValue } from '../../../root-module/common/extract-helpers';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import { IBreadcrumb } from '../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { AbsenceStatusLoadAction } from './../../../shared/actions/lookup.actions';
import { DateTimeHelper } from './../../../shared/helpers/datetime-helper';
import { FiscalYear, AbsenceType } from './../../../shared/models/company.models';
import { LoadFiscalYearsAction, LoadEmployeeSettingsAction, LoadAbsenceTypeAction } from './../../../shared/actions/company.actions';
import { isNullOrUndefined } from 'util';
import { AeSplitButtonOption } from './../../../atlas-elements/common/models/ae-split-button-options';
import { Subject, Subscription, Observable, BehaviorSubject } from 'rxjs/Rx';
import { Orientation } from './../../../atlas-elements/common/orientation.enum';
import { AeLabelStyle } from './../../../atlas-elements/common/ae-label-style.enum';
import { SortDirection } from './../../../atlas-elements/common/models/ae-sort-model';
import {
  LoadHolidayAbsenceRequestsAction
  , LoadSelectedEmployeeConfigAction
  , UpdateSelectedEmployeeAbsenceAction
  , AddSelectedEmployeeAbsenceAction
  , LoadSelectedEmployeeSummaryAction
  , LoadSelectedEmployeeAbsenceAction
  , LoadHoliayAbsenceRequestTeamRosterAction
} from './../../actions/holiday-absence-requests.actions';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../shared/models/atlas-api-response';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from './../../../shared/base-component';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  Output,
  EventEmitter

} from '@angular/core';
import * as fromRoot from './../../../shared/reducers';
import * as Immutable from 'immutable';
import { AbsenceStatus, AbsenceStatusCode } from '../../../shared/models/lookup.models';
import {
  ClearCurrentAbsence
  , LoadEmployeeAbsenceAction
  , LoadEmployeeConfigAction
} from '../../actions/holiday-absence.actions';
import { StringHelper } from '../../../shared/helpers/string-helper';
import {
  EmployeeConfig
  , OperationModes
  , MyAbsenceVM
  , MyAbsence
  , FiscalYearSummaryModel
  , MyAbsenceType
  , FiscalYearSummary
} from '../../models/holiday-absence.model';
import { EmployeeSettings } from '../../../shared/models/company.models';
import { MessengerService } from './../../../shared/services/messenger.service';
import { MessageType } from '../../../atlas-elements/common/ae-message.enum';
import { requestedAbsenceStatusId, approvedAbsenceStatusId } from './../../../shared/app.constants';
import { getFiscalYear, extractMyAbsenceVM, prepareModel, prepareUpdateModel } from '../../common/extract-helpers';
import { HolidayAbsenceDataService } from '../../services/holiday-absence-data.service';
import { CommonHelpers } from '../../../shared/helpers/common-helpers';
import { DatePipe } from '@angular/common';
import { SetTeamCalendarAction } from "../../../calendar/actions/calendar.actions";
import { TeamRoster } from './../../models/team-roster.model';
import { WeekModel } from './../../../shared/models/weekmodel';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
  selector: 'app-holiday-absences-requests-container',
  templateUrl: './holiday-absences-requests-container.component.html',
  styleUrls: ['./holiday-absences-requests-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HolidayAbsencesRequestsContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _addHolidayCommand = new Subject<boolean>();
  private _addAbsenceCommand = new Subject<boolean>();
  private _aelStyle = AeLabelStyle.Medium;
  private _imgOrientation = Orientation.Horizontal;
  private _splitButtonOptions: any[] = [
    new AeSplitButtonOption<boolean>('Holiday', this._addHolidayCommand, false),
    new AeSplitButtonOption<boolean>('Absence', this._addAbsenceCommand, false),
  ];
  private _showMyAbsenceDeclineForm: boolean = false;
  private _absenceStatusSubScription: Subscription;
  private _userId: string;
  private _selectedEmployeeId: string;
  private _selectedEmployeeDepartmentId: string;
  private _selectedEmployeeDepartmentName: string;
  private _hasOneStepError: boolean;
  private _messageType: MessageType = MessageType.Alert;

  private _operationMode: OperationModes;
  private _showMyAbsenceManageForm: boolean;
  private _showTeamCalendar: boolean;
  private _showTeamCalendar$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _myHolidayAbsenceVM: MyAbsenceVM;
  private _employeeConfig: EmployeeConfig;
  private _absenceStatusList: Array<AbsenceStatus>;
  private _adjustedAbsenceStatusList: Immutable.List<AeSelectItem<string>>;
  private _absenceTypes: Array<AbsenceType>;
  private _employeeSettings: EmployeeSettings;
  private _fiscalYearData: Array<FiscalYear>;
  private _fiscalYearSummary: FiscalYearSummary;
  private _fiscalYearSummaryForChart: FiscalYearSummary;
  private _selectedFYYear: string;

  private _employeeSettingsSubscription: Subscription;
  private _employeeConfigSubscription: Subscription;
  private _fiscalyearDataSubscription: Subscription;
  private _fiscalyearSummarySubscription: Subscription;
  private _fiscalyearSummaryForChartSubscription: Subscription;
  private _employeeAbsenceSubscription: Subscription;
  private _absenceTypesSubscription: Subscription;
  private _employeeAbsenceSubmitSubscription: Subscription;

  private _onDemandDataLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private _isApproveMode: boolean = false;
  private _isOneStepProcess: boolean = false;
  private _employeeAbsence: MyAbsence;
  private _showTeamRoaster: boolean = false;


  private _selectedEmployeeRequestWeekModel: WeekModel;
  private _rosterLoaded$: Observable<boolean>;
  private _rosterData$: Observable<Immutable.List<TeamRoster>>;
  private _rosterTotalCount$: Observable<number>;
  private _rosterDataTableOptions$: Observable<DataTableOptions>;

  private _employeeIdFromRoute: string;
  private _filterEmployee: AeSelectItem<string>;
  private _isRequestsAlreadyLoaded: boolean = false;
  private _selectedEmployeeIdInFilter: string;
  // End of Private Fields

  // Public properties
  get splitButtonOptions() {
    return this._splitButtonOptions;
  }
  get hasOneStepError() {
    return this._hasOneStepError;
  }
  get messageType() {
    return this._messageType;
  }
  get fiscalYearData() {
    return this._fiscalYearData;
  }
  get fiscalYearSummaryForChart() {
    return this._fiscalYearSummaryForChart;
  }
  get adjustedAbsenceStatusList() {
    return this._adjustedAbsenceStatusList;
  }
  get employeeSettings() {
    return this._employeeSettings;
  }
  get absenceTypes() {
    return this._absenceTypes;
  }
  get filterEmployee() {
    return this._filterEmployee;
  }
  get showMyAbsenceDeclineForm() {
    return this._showMyAbsenceDeclineForm;
  }
  get absenceStatusList() {
    return this._absenceStatusList;
  }
  get employeeAbsence() {
    return this._employeeAbsence;
  }
  get showMyAbsenceManageForm() {
    return this._showMyAbsenceManageForm;
  }
  get operationMode() {
    return this._operationMode;
  }
  get isApproveMode() {
    return this._isApproveMode;
  }
  get isOneStepProcess() {
    return this._isOneStepProcess;
  }
  get userId() {
    return this._userId;
  }
  get myHolidayAbsenceVM() {
    return this._myHolidayAbsenceVM;
  }
  get fiscalYearSummary() {
    return this._fiscalYearSummary;
  }
  get showTeamCalendar() {
    return this._showTeamCalendar;
  }
  get selectedEmployeeDepartmentName() {
    return this._selectedEmployeeDepartmentName
  }
  set selectedEmployeeDepartmentName(val: string) {
    this._selectedEmployeeDepartmentName = val;
  }
  get showTeamCalendar$() {
    return this._showTeamCalendar$;
  }
  get showTeamRoaster() {
    return this._showTeamRoaster;
  }
  get rosterLoaded$() {
    return this._rosterLoaded$;
  }
  get rosterData$() {
    return this._rosterData$;
  }
  get rosterTotalCount$() {
    return this._rosterTotalCount$;
  }
  get rosterDataTableOptions$() {
    return this._rosterDataTableOptions$;
  }
  get selectedEmployeeDepartmentId() {
    return this._selectedEmployeeDepartmentId;
  }
  set selectedEmployeeDepartmentId(val: string) {
    this._selectedEmployeeDepartmentId = val;
  }
  get selectedEmployeeRequestWeekModel() {
    return this._selectedEmployeeRequestWeekModel;
  }
  get employeeConfig() {
    return this._employeeConfig;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Employees;
  }

  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _messenger: MessengerService
    , private _route: ActivatedRoute
    , private _router: Router
    , private _dataService: HolidayAbsenceDataService
    , private _datePipe: DatePipe
    , private _breadcrumbService: BreadcrumbService) {
    super(_localeService, _translationService, _cdRef);
    let bcItem1: IBreadcrumb = {
      isGroupRoot: true, group: BreadcrumbGroup.Employees,
      label: 'Employees', url: '/employee/manage'
    };
    this._breadcrumbService.add(bcItem1);

    let bcItem: IBreadcrumb = new IBreadcrumb('Holiday & absence requests', '/absence-management/requests', BreadcrumbGroup.Employees);
    this._breadcrumbService.add(bcItem);
  }

  // End of constructor

  // Private methods


  private _prepareApprovalFormData() {
    this._isApproveMode = true;
    this._isOneStepProcess = false;
    this._myHolidayAbsenceVM = new MyAbsenceVM();
    this._operationMode = OperationModes.Update;
  }

  private _isSameAsLoggedinEmpId(empId) {
    let loggedinEmpId = this._claimsHelper.getEmpId();
    if (!StringHelper.isNullOrUndefinedOrEmpty(loggedinEmpId)) {
      loggedinEmpId = loggedinEmpId.toLowerCase();
    } else {
      loggedinEmpId = '';
    }

    return loggedinEmpId === empId;
  }



  private _loadHolidayAbsenceRequests(params, queryParams) {
    //let params$ = this._route.params;
    let iniParamsArray: AtlasParams[] = [];

    let newReq: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'StartDate', SortDirection.Descending, iniParamsArray);
    // avive us tge 
    //params$.combineLatest(this._route.queryParams).subscribe(val => {
    //let params = val[0];
    //let queryParams = val[1];
    if (params['id']) {
      this._employeeIdFromRoute = params['id'].toLowerCase();
      if (!this._isSameAsLoggedinEmpId(this._employeeIdFromRoute)) {
        iniParamsArray.push(new AtlasParams('EmployeeId', params['id']));
      }
    }
    if (params['filter']) {
      switch (params['filter']) {
        case 'absenttoday':
          iniParamsArray.push(new AtlasParams('StatusId', approvedAbsenceStatusId.toLowerCase()));
          iniParamsArray.push(new AtlasParams('StartDate', (new Date()).toDateString()));
          iniParamsArray.push(new AtlasParams('EndDate', (new Date()).toDateString()));
          break;
        default:
          iniParamsArray.push(new AtlasParams('StatusId', requestedAbsenceStatusId.toLowerCase()));
          break;
      }
    } else if (queryParams['statusId']) {
      // apply status filter by from query string if exists
      iniParamsArray.push(new AtlasParams('StatusId', queryParams['statusId']));
    }
    else {
      // apply status filter by default
      iniParamsArray.push(new AtlasParams('StatusId', requestedAbsenceStatusId.toLowerCase()));
    }
    //addOrUpdateAtlasParamValue
    if (queryParams['range']) {
      if (queryParams['range'].toLowerCase() == 'thisweek') {
        let week = DateTimeHelper.getWeek(new Date());
        iniParamsArray = addOrUpdateAtlasParamValue(iniParamsArray, 'StartDate', week.StartDate.toDateString());
        iniParamsArray = addOrUpdateAtlasParamValue(iniParamsArray, 'EndDate', week.EndDate.toDateString());
      }
    }
    this._store.dispatch(new LoadHolidayAbsenceRequestsAction(newReq));
    //});
  }


  private _configOneStepRequestModel() {
    this._hasOneStepError = false;
    this._isApproveMode = false;
    this._isOneStepProcess = true;
    this._operationMode = OperationModes.Add;
    this._showMyAbsenceManageForm = true;
    this._employeeAbsence = null;
    this._myHolidayAbsenceVM = new MyAbsenceVM();
    if (!isNullOrUndefined(this._employeeConfig) &&
      !isNullOrUndefined(this._employeeConfig.HolidayUnitType)) {
      this._myHolidayAbsenceVM.UnitType = this._employeeConfig.HolidayUnitType;
    } else if (!isNullOrUndefined(this._employeeSettings) &&
      !isNullOrUndefined(this._employeeSettings.HolidayUnitType)) {
      this._myHolidayAbsenceVM.UnitType = this._employeeSettings.HolidayUnitType;
    }
  }



  private _getEmployeeAbsenceVM(employeeAbsence: MyAbsence) {
    if (isNullOrUndefined(employeeAbsence)) {
      return;
    }

    let startDate = DateTimeHelper.getDatePartfromString(employeeAbsence.StartDate);
    let endDate = DateTimeHelper.getDatePartfromString(employeeAbsence.EndDate);

    let selectedYear = getFiscalYear(startDate, endDate, this._fiscalYearData);
    if (!isNullOrUndefined(selectedYear)) {
      let value = selectedYear.StartDate + 'dt' + selectedYear.EndDate;
      this.onPullFiscalYearSummary(value);
    }

    this._dataService.getWorkingDays(startDate
      , endDate
      , employeeAbsence.EmployeeId)
      .first().subscribe((workingDays) => {
        this._myHolidayAbsenceVM = new MyAbsenceVM();
        this._myHolidayAbsenceVM = Object.assign(this._myHolidayAbsenceVM, extractMyAbsenceVM(employeeAbsence, workingDays));

        this._cdRef.markForCheck();
      });
  }


  //region roster code


  //end region
  // End of private methods

  // Public methods


  public onWeekChange(data: WeekModel) {
    //here the changed deparmentid, start date, end date will be emiited and need to raise fresh API here to get the modified team roster data
    let apiRequestWithParams: AtlasApiRequestWithParams;
    let params: AtlasParams[] = []
    params.push(new AtlasParams('departmentId', this._selectedEmployeeDepartmentId));
    params.push(new AtlasParams('managerId', this._selectedEmployeeDepartmentId));
    params.push(new AtlasParams('startDate', data.StartDate.toDateString()));
    params.push(new AtlasParams('endDate', data.EndDate.toDateString()));
    apiRequestWithParams = new AtlasApiRequestWithParams(0, 0, 'StartDate', SortDirection.Descending, params);
    this._store.dispatch(new LoadHoliayAbsenceRequestTeamRosterAction(apiRequestWithParams));
  }


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

  public saveEmployeeHoliday(employeeAbsenceVM: MyAbsenceVM) {
    if (!isNullOrUndefined(employeeAbsenceVM)) {
      let employeeAbsence: MyAbsence;
      if (this._operationMode === OperationModes.Add) {
        employeeAbsence = prepareModel(employeeAbsenceVM
          , this._employeeConfig
          , this._absenceStatusList
          , false
          , null);
        this._store.dispatch(new AddSelectedEmployeeAbsenceAction(employeeAbsence));
      } else if (this._operationMode === OperationModes.Update) {
        employeeAbsence = prepareUpdateModel(this._employeeAbsence
          , employeeAbsenceVM
          , this._employeeConfig
          , this._employeeSettings
          , this._absenceStatusList
          , this._isApproveMode
          , this._userId);
        this._store.dispatch(new UpdateSelectedEmployeeAbsenceAction(employeeAbsence));
      }
      this._showMyAbsenceManageForm = false;
      this._myHolidayAbsenceVM = null;
      this._employeeAbsence = null;
      this._operationMode = null;
      this._cdRef.markForCheck();
    }
  }

  public onSummaryChange(fySummaryModel: FiscalYearSummaryModel) {

  }
  public closeMyAbsenceDeclineForm() {
    this._isApproveMode = false;
    this._isOneStepProcess = false;
    this._showMyAbsenceDeclineForm = false;
    this._onDemandDataLoader.next(false);
    this._employeeAbsence = null;
    this._myHolidayAbsenceVM = null;
  }

  public closeMyAbsenceManageForm() {
    this._isApproveMode = false;
    this._isOneStepProcess = false;
    this._showMyAbsenceManageForm = false;
    this._onDemandDataLoader.next(false);
    this._employeeAbsence = null;
    this._myHolidayAbsenceVM = null;
  }

  public closeViewTeamCalendar() {
    this._showTeamCalendar = false;
    this._showTeamCalendar$.next(false);
    this._selectedEmployeeDepartmentId = '';
    this._selectedEmployeeDepartmentName = '';
    this._onDemandDataLoader.next(false);
  }

  public closeTeamRoaster($event) {
    this._showTeamRoaster = false;
  }


  public onDeclineComplete(employeeAbsence) {
    this._store.dispatch(new UpdateSelectedEmployeeAbsenceAction(employeeAbsence));
    this._showMyAbsenceDeclineForm = false;
    this._onDemandDataLoader.next(false);
    this._cdRef.markForCheck();
    this._employeeAbsence = null;
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
  public onChangeFiscalYear(value) {
    this._selectedFYYear = value;
    if (!StringHelper.isNullOrUndefinedOrEmpty(value)) {
      let dateBounds = CommonHelpers.processFSYearValue(value, this._datePipe);
      this._store.dispatch(new LoadSelectedEmployeeSummaryAction({
        refreshSummary: true,
        forceRefresh: false,
        startDate: dateBounds.StartDate,
        endDate: dateBounds.EndDate,
        employeeId: this._selectedEmployeeId
      }));
    }
  }


  public onSelectTeamRoaster(data: MyAbsence) {
    //here prepare the request to raise the team roaster api and subscribe to the response and pass this as input to the team roaster component
    this._showTeamRoaster = true;
    this._selectedEmployeeDepartmentId = data.DepartmentId;
    this._selectedEmployeeDepartmentName = data.DepartmentName;
    let apiRequestWithParams: AtlasApiRequestWithParams;
    let params: AtlasParams[] = []
    //Here the start data and end date will be evaluted from the selected absence start date.
    this._selectedEmployeeRequestWeekModel = DateTimeHelper.getWeek(new Date(data.StartDate));
    params.push(new AtlasParams('departmentId', data.DepartmentId));
    params.push(new AtlasParams('managerId', data.DepartmentId));
    params.push(new AtlasParams('startDate', this._selectedEmployeeRequestWeekModel.StartDate.toDateString()));
    params.push(new AtlasParams('endDate', this._selectedEmployeeRequestWeekModel.EndDate.toDateString()));
    apiRequestWithParams = new AtlasApiRequestWithParams(0, 0, 'StartDate', SortDirection.Descending, params);
    this._store.dispatch(new LoadHoliayAbsenceRequestTeamRosterAction(apiRequestWithParams));


  }


  public onEmployeeSelect(employeeId) {
    this._selectedEmployeeId = employeeId;
    this._selectedEmployeeIdInFilter = employeeId;
    if (!StringHelper.isNullOrUndefinedOrEmpty(employeeId)) {
      this._onDemandDataLoader.next(true);
    }
  }


  public onApproveRequest(myAbsence: MyAbsence) {
    if (!isNullOrUndefined(myAbsence)) {
      this._store.dispatch(new LoadSelectedEmployeeAbsenceAction(myAbsence.Id));
      this._selectedEmployeeId = myAbsence.EmployeeId;
      this._prepareApprovalFormData();
      this._onDemandDataLoader.next(true);
      this._showMyAbsenceManageForm = true;
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
      this._onDemandDataLoader.next(true);
      this._showTeamCalendar = true;
      this._showTeamCalendar$.next(true);

      // render calendar throught router outlet
      // this._onViewTeamCalendar();
    }
  }


  public onDeclineRequest(myAbsenceId: string) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(myAbsenceId)) {
      this._store.dispatch(new LoadSelectedEmployeeAbsenceAction(myAbsenceId));
      this._showMyAbsenceDeclineForm = true;
      this._onDemandDataLoader.next(false);
    }
  }

  public clearErrorMsg() {
    this._hasOneStepError = false;
  }

  public onSplitBtnClick(event: any) {
  }

  ngOnInit() {
    this._userId = this._claimsHelper.getUserId();

    this._addHolidayCommand.subscribe(() => {
      if (!StringHelper.isNullOrUndefinedOrEmpty(this._selectedEmployeeIdInFilter)) {
        this._configOneStepRequestModel();
        this._myHolidayAbsenceVM.Type = MyAbsenceType.Holiday;
      } else {
        this._hasOneStepError = true;
      }
      this._cdRef.markForCheck();
    });

    this._addAbsenceCommand.subscribe(() => {
      if (!StringHelper.isNullOrUndefinedOrEmpty(this._selectedEmployeeIdInFilter)) {
        this._configOneStepRequestModel();
        this._myHolidayAbsenceVM.Type = MyAbsenceType.Absence;
      } else {
        this._hasOneStepError = true;
      }
      this._cdRef.markForCheck();
    });

    // on each load of the container despatch event to get the requests, 
    // here we might need to read employeeid property from route params and send in the payload if needed
    // constructor(pageNumber: number, pageSize: number, sortBy: string, sortDirection: SortDirection, paramArray: AtlasParams[]) {
    // if absence status data is not loaded then we need to despatch the event to load the absence status,
    // similarly company level state absence subtype


    let params$ = this._route.params
    let queryParams$ = this._route.queryParams;
    this._employeeConfigSubscription = Observable.combineLatest(params$, queryParams$, this._onDemandDataLoader
      , this._store.let(fromRoot.getSelectedEmployeeConfig))
      .subscribe((result) => {
        let params = result[0];
        let queryParams = result[1];
        let canLoadData = result[2];
        let employeeConfig = result[3];

        if (!this._isRequestsAlreadyLoaded) {
          this._isRequestsAlreadyLoaded = true;
          this._loadHolidayAbsenceRequests(params, queryParams);
        }

        if (canLoadData &&
          (isNullOrUndefined(employeeConfig) ||
            (!isNullOrUndefined(employeeConfig) &&
              !StringHelper.isNullOrUndefinedOrEmpty(this._selectedEmployeeId) &&
              employeeConfig.Id.toLowerCase() != this._selectedEmployeeId.toLowerCase()))) {
          this._store.dispatch(new LoadSelectedEmployeeConfigAction(this._selectedEmployeeId));
        } else {
          this._employeeConfig = employeeConfig;
          if (!isNullOrUndefined(this._employeeIdFromRoute) &&
            !isNullOrUndefined(employeeConfig) &&
            !this._isSameAsLoggedinEmpId(this._employeeIdFromRoute) &&
            employeeConfig.Id.toLowerCase() == this._employeeIdFromRoute.toLowerCase()) {
            this._selectedEmployeeId = employeeConfig.Id;
            this._filterEmployee = new AeSelectItem<string>(employeeConfig.FirstName + ' ' + employeeConfig.Surname
              , employeeConfig.Id
              , false);
            this._employeeIdFromRoute = null;
          }
          this._cdRef.markForCheck();
        }
      });

    this._employeeSettingsSubscription = this._store.let(fromRoot.getEmployeeSettingsData)
      .subscribe((result) => {
        if (isNullOrUndefined(result)) {
          this._store.dispatch(new LoadEmployeeSettingsAction(true));
        } else {
          this._employeeSettings = result;
          this._cdRef.markForCheck();
        }
      });

    this._absenceStatusSubScription = this._store.let(fromRoot.getAbsenceStatusData)
      .subscribe((absenceStatuses) => {
        if (isNullOrUndefined(absenceStatuses)) {
          this._store.dispatch(new AbsenceStatusLoadAction(true));
        } else {
          this._absenceStatusList = absenceStatuses;
          this._adjustedAbsenceStatusList = Immutable.List(absenceStatuses.filter(
            keyValuePair => keyValuePair.Code !== AbsenceStatusCode.Resubmitted &&
              keyValuePair.Code !== AbsenceStatusCode.Requestforchange &&
              keyValuePair.Code !== AbsenceStatusCode.Requestforcancellation).map((keyValuePair) => {
                let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
                aeSelectItem.Childrens = null;
                if (keyValuePair.Code === AbsenceStatusCode.Requested) {
                  aeSelectItem.Text = 'Pending';
                } else {
                  aeSelectItem.Text = keyValuePair.Name;
                }
                aeSelectItem.Value = keyValuePair.Id;
                return aeSelectItem;
              }));
          this._cdRef.markForCheck();
        }
      });

    this._absenceTypesSubscription = this._store.let(fromRoot.absenceTypesWithoutDuplicatesData).subscribe((absenceTypes) => {
      if (!isNullOrUndefined(absenceTypes)) {
        this._absenceTypes = absenceTypes;
        this._cdRef.markForCheck();
      } else {
        this._store.dispatch(new LoadAbsenceTypeAction(true));
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
            if (!StringHelper.isNullOrUndefinedOrEmpty(this._employeeIdFromRoute)
              && !this._isSameAsLoggedinEmpId(this._employeeIdFromRoute)) {
              this.onEmployeeSelect(this._employeeIdFromRoute);
            }
            this._cdRef.markForCheck();
          }
        });

    this._fiscalyearSummarySubscription = this._store.let(fromRoot.getSelectedEmployeeHolidaySummaryData)
      .subscribe((summary) => {
        this._fiscalYearSummary = summary;
        this._cdRef.markForCheck();
      });

    this._fiscalyearSummaryForChartSubscription = this._store.let(fromRoot.getSelectedEmployeeHolidaySummaryForChart)
      .subscribe((summary) => {
        this._fiscalYearSummaryForChart = summary;
        this._cdRef.markForCheck();
      });

    this._employeeAbsenceSubscription = this._store.let(fromRoot.getSelectedEmployeeAbsence)
      .subscribe((employeeAbsence) => {
        if (!isNullOrUndefined(employeeAbsence)) {
          this._employeeAbsence = employeeAbsence;
          this._cdRef.markForCheck();
          if (this._showMyAbsenceManageForm) {
            this._getEmployeeAbsenceVM(employeeAbsence);
          }
        }
      });


    //start of team roster
    this._rosterLoaded$ = this._store.let(fromRoot.getTeamRosterLoadedData);
    this._rosterData$ = this._store.let(fromRoot.getTeamRosterData);
    this._rosterTotalCount$ = this._store.let(fromRoot.getTeamRosterTotalCountData);
    this._rosterDataTableOptions$ = this._store.let(fromRoot.getTeamRosterDataTableOptionsData);
    //end of team roster

    this._employeeAbsenceSubmitSubscription = Observable.combineLatest(this._store.let(fromRoot.getSelectedEmployeeAbsenceAdded),
      this._store.let(fromRoot.getSelectedEmployeeAbsenceUpdated))
      .subscribe((val) => {
        let result = { add: val[0], update: val[1] };
        if (result.add || result.update) {
          this.onChangeFiscalYear(this._selectedFYYear);
          this._cdRef.markForCheck();
        }
      });

  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._fiscalyearDataSubscription)) {
      this._fiscalyearDataSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._absenceStatusSubScription)) {
      this._absenceStatusSubScription.unsubscribe();
    }

    if (!isNullOrUndefined(this._employeeConfigSubscription)) {
      this._employeeConfigSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._employeeSettingsSubscription)) {
      this._employeeSettingsSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._fiscalyearSummaryForChartSubscription)) {
      this._fiscalyearSummaryForChartSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._fiscalyearSummarySubscription)) {
      this._fiscalyearSummarySubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._absenceTypesSubscription)) {
      this._absenceTypesSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._employeeAbsenceSubmitSubscription)) {
      this._employeeAbsenceSubmitSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._employeeAbsenceSubscription)) {
      this._employeeAbsenceSubscription.unsubscribe();
    }
    // End of public methods
  }

  private _onViewTeamCalendar(): void {
    // this._router.navigate([('calendar')], { relativeTo: this._route, skipLocationChange: true });
    this._router.navigate([('teamcalendar')], { relativeTo: this._route, skipLocationChange: true });

    this._router.events.subscribe((e) => {
    })
  }
}
