import { mapEmployeKeyValuesToAeSelectItems } from '../../../employee/common/extract-helpers';
import { EmployeeSearchService } from './../../../employee/services/employee-search.service';
import { AeTemplateComponent } from './../../../atlas-elements/ae-template/ae-template.component';
import { AeAutoCompleteModel } from './../../../atlas-elements/common/models/ae-autocomplete-model';
import { DatePipe } from '@angular/common';
import { CommonHelpers } from './../../../shared/helpers/common-helpers';
import { extractDonutChartData, noOfUnitsInFraction } from '../../common/extract-helpers';
import { ChartData } from './../../../atlas-elements/common/ae-chart-data';
import { AeSelectEvent } from './../../../atlas-elements/common/ae-select.event';
import { StringHelper } from './../../../shared/helpers/string-helper';
import { getAtlasParamValueByKey } from '../../../root-module/common/extract-helpers';
import { SortDirection } from './../../../atlas-elements/common/models/ae-sort-model';
import {
  LoadHolidayAbsenceRequestsEmployeesAction
  , LoadHolidayAbsenceRequestsAction
  , LoadSelectedEmployeeSummaryAction,
  ClearOneStepApprovalAction
} from './../../actions/holiday-absence-requests.actions';
import { AeDatasourceType } from './../../../atlas-elements/common/ae-datasource-type';
import { AbsenceType, FiscalYear, EmployeeSettings } from './../../../shared/models/company.models';
import { LoadAbsenceTypeAction } from './../../../shared/actions/company.actions';
import { AbsenceStatusLoadAction } from './../../../shared/actions/lookup.actions';
import { AbsenceStatus } from './../../../shared/models/lookup.models';
import { extractAbsenceStatus } from '../../../shared/helpers/extract-helpers';
import { concatenateSelectItemValues, mapFiscalYearsToAeSelectItems } from './../../../shared/helpers/extract-helpers';
import { isNullOrUndefined } from 'util';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { FormGroup, FormBuilder, Validator } from '@angular/forms';
import { HolidayAbsenceDataService } from './../../services/holiday-absence-data.service';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../shared/models/atlas-api-response';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import {
  MyAbsence
  , HolidayUnitType
  , HalfDayType
  , MyAbsenceDetail
  , FiscalYearSummary
  , EmployeeConfig
} from './../../models/holiday-absence.model';
import { Observable, Subject, Subscription, BehaviorSubject } from 'rxjs/Rx';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  EventEmitter,
  Output,
  Input,
  OnChanges,
  ViewChild
} from '@angular/core';
import { BaseComponent } from '../../../shared/base-component';
import * as fromRoot from '../../../shared/reducers';
import * as Immutable from 'immutable';
import { AeDataTableAction } from './../../../atlas-elements/common/models/ae-data-table-action';
import { properEndDateValidator } from './../../common/holiday-absence.validators';
import { createPopOverVm } from './../../../atlas-elements/common/models/popover-vm';
import { Tristate } from './../../../atlas-elements/common/tristate.enum';

@Component({
  selector: 'holiday-absence-requests',
  templateUrl: './holiday-absence-requests.component.html',
  styleUrls: ['./holiday-absence-requests.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HolidayAbsenceRequestsComponent extends BaseComponent implements OnInit, OnDestroy {


  // Private Fields
  private _holidayAbsenceRequests$: Observable<Immutable.List<MyAbsence>>;
  private _recordsCount$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _holidayAbsencesLoading$: Observable<boolean>
  private _keys = Immutable.List(['Id', 'EmployeeId', 'EmployeeName', 'DepartmentId', 'DepartmentName', 'StartDate', 'EndDate', 'CreatedOn', 'HolidayUnitType', 'NoOfUnits', 'Reason', 'Comment', 'StatusId', 'ApprovedByName', 'HalfDayType', 'TypeId', 'Status', 'IsHour', 'NoOfUnitsInFraction', 'NeedToShowAbsencesInPopOver', 'IsSelfLeaveRequestOfDelegatedUser', 'RequestTypeTitle']);
  private _actions: Immutable.List<AeDataTableAction>;
  private _approveHolidayAbsenceRequestCommand = new Subject();
  private _declineHolidayAbsenceRequestCommand = new Subject();
  private _viewHolidayAbsenceRequestRosterCommand = new Subject();
  private _viewHolidayAbsenceRequestTeamCalendarCommand = new Subject();
  private _holidayRequestsForm: FormGroup;
  private _absenceStatusItems$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _types: Immutable.List<AeSelectItem<string>>;

  private _localDataSouceType: AeDatasourceType;
  private _remoteDataSourceType: AeDatasourceType;
  private _employees$: BehaviorSubject<AeSelectItem<string>[]> = new BehaviorSubject<AeSelectItem<string>[]>([]);
  private _employeesSubscription: Subscription;
  private _holidayAbsenceRequest: AtlasApiRequestWithParams;
  private _holidayAbsenceRequestSubScription: Subscription;
  private _initialLoad: boolean = true;
  private _managerCommentLabel: string;
  private _employeeCommentLabel: string;
  private _selectedEmployee: Array<AeSelectItem<string>>;
  private _fiscalYearList: Array<FiscalYear>;
  private _fiscalYears: Immutable.List<AeSelectItem<string>>;
  private _selectedFiscalYear: string;
  private _selectedFiscalYearDateBounds: { StartDate: string, EndDate: string };
  private _selectedEmployeeHolidaySummarySubscription: Subscription;
  private _chartData: BehaviorSubject<Immutable.List<ChartData>>;
  private fiscalYearSummary$: Observable<FiscalYearSummary>;
  private employeeSettings$: Observable<EmployeeSettings>;
  private _absenceStatusItems: Immutable.List<AeSelectItem<string>>;
  private _absenceTypes: Array<AbsenceType>;
  private _initialEmployeeText: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private _fiscalYearSummary: FiscalYearSummary;
  private _employeeSettings: EmployeeSettings;
  private _filterEmployee: AeSelectItem<string>;
  private _onDemandDataLoad: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _visibility$ = new Subject<boolean>();
  private _holidayUnitsPopOverVisible: boolean = false;
  private _holidayUnitsPopOverSub: Subscription;
  private _translationChnageSub: Subscription;
  private _declineSub: Subscription;
  private _approveSub: Subscription;
  private _viewSub: Subscription;
  private _onestepProcessSub: Subscription;
  private _formValueChangesSub: Subscription;
  private _viewRosterSub: Subscription;
  // End of Private Fields

  // Public properties
  @Input('fiscalYearList')
  set fiscalYearList(val: Array<FiscalYear>) {
    this._fiscalYearList = val;
    this._processFiscalyears();
  }
  get fiscalYearList() {
    return this._fiscalYearList;
  }
 

  @Input('absenceStatusItems')
  set AbsenceStatusItems(val: Immutable.List<AeSelectItem<string>>) {
    this._absenceStatusItems = val;
    if (!isNullOrUndefined(val)) {
      this._onDemandDataLoad.next(true);
      // let statusId = this._holidayRequestsForm.get('absenceStatus').value.value;
      // this._holidayRequestsForm.get('absenceStatus').setValue(statusId);
    }
  }
  get AbsenceStatusItems() {
    return this._absenceStatusItems;
  }
 

  @Input('absenceTypes')
  set AbsenceTypes(val: Array<AbsenceType>) {
    this._absenceTypes = val;
  }
  get AbsenceTypes() {
    return this._absenceTypes;
  }
 

  @Input('fiscalYearSummary')
  set fiscalYearSummary(val: FiscalYearSummary) {
    this._fiscalYearSummary = val;
    if (!isNullOrUndefined(val)) {
      let donoutChartData = Immutable.List(extractDonutChartData(this.fiscalYearSummary, this.employeeSettings));
      this._chartData.next(donoutChartData);
      this._cdRef.markForCheck();
    }
  }
  get fiscalYearSummary() {
    return this._fiscalYearSummary;
  }
  

  @Input('employeeSettings')
  set employeeSettings(val: EmployeeSettings) {
    this._employeeSettings = val;
  }
  get employeeSettings() {
    return this._employeeSettings;
  }
 

  @Input('filterEmployee')
  set filterEmployee(val: AeSelectItem<string>) {
    this._filterEmployee = val;
    this._initialEmployeeText.next(null);
    if (!isNullOrUndefined(val)) {
      this._initialEmployeeText.next(val.Text);
      this._selectedEmployee = Array.of(val);
      if (!isNullOrUndefined(this._fiscalYears) &&
        this._fiscalYears.count() > 0) {
        this._selectedFiscalYear = this._fiscalYears.get(1).Value;
        this.changeFiscalYear.emit(this._selectedFiscalYear);
      }
    }
  }
  get filterEmployee() {
    return this._filterEmployee;
  }
 
  get holidayRequestsForm() {
    return this._holidayRequestsForm;
  }
  get employees$() {
    return this._employees$;
  }
  get remoteDataSourceType() {
    return this._remoteDataSourceType;
  }
  get initialEmployeeText() {
    return this._initialEmployeeText;
  }
  get absenceStatusItems() {
    return this._absenceStatusItems
  }
  get types() {
    return this._types;
  }
  get localDataSouceType() {
    return this._localDataSouceType;
  }
  get fiscalYears() {
    return this._fiscalYears;
  }
  get selectedEmployee() {
    return this._selectedEmployee;
  }
  get chartData() {
    return this._chartData;
  }
  get holidayAbsenceRequests$() {
    return this._holidayAbsenceRequests$;
  }
  get recordsCount$() {
    return this._recordsCount$;
  }
  get dataTableOptions$() {
    return this._dataTableOptions$;
  }
  get holidayAbsencesLoading$() {
    return this._holidayAbsencesLoading$;
  }
  get actions() {
    return this._actions;
  }
  get keys() {
    return this._keys;
  }
  // End of Public properties

  // Public Output bindings
  @Output()
  declineRequest: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  approveRequest: EventEmitter<MyAbsence> = new EventEmitter<MyAbsence>();

  @Output()
  viewTeamCalendarRequest: EventEmitter<MyAbsence> = new EventEmitter<MyAbsence>();


  @Output()
  employeeSelect: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  selectTeamRoaster: EventEmitter<MyAbsence> = new EventEmitter<MyAbsence>();

  @Output()
  changeFiscalYear: EventEmitter<string> = new EventEmitter<string>();


  // End of Public Output bindings

  // Public ViewChild bindings
  @ViewChild('popOverTemplate')
  _popOverTemplate: AeTemplateComponent<any>;
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(
    protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _holidayAbsenceDataService: HolidayAbsenceDataService
    , private _fb: FormBuilder
    , private _datePipe: DatePipe
    , private _employeeSearchService: EmployeeSearchService
  ) {
    super(_localeService, _translationService, _cdRef);
    // Action buttons
    this._actions = Immutable.List([
      new AeDataTableAction('Approve', this._approveHolidayAbsenceRequestCommand, false, (item) => { return this._showApproveOrDeclineAction(item) }),
      new AeDataTableAction('Decline', this._declineHolidayAbsenceRequestCommand, false, (item) => { return this._showApproveOrDeclineAction(item) }),
      new AeDataTableAction('View Roster', this._viewHolidayAbsenceRequestRosterCommand, false),
      new AeDataTableAction('View Team Calendar', this._viewHolidayAbsenceRequestTeamCalendarCommand, false)
    ]);
    // End of action buittons

    this._localDataSouceType = AeDatasourceType.Local;
    this._remoteDataSourceType = AeDatasourceType.Remote;
    this._chartData = new BehaviorSubject(Immutable.List<ChartData>());
  }
  // End of constructor

  // Private methods

  private _showApproveOrDeclineAction(item: MyAbsence): Tristate {
    if (!item.IsSelfLeaveRequestOfDelegatedUser) {
      return Tristate.True;
    }
    else {
      return Tristate.False;
    }
  }

  /**
       * 
       * 
       * 
       * @memberOf AbsenceListComponent
       */
  _setVisibility() {
    this._holidayUnitsPopOverVisible = !this._holidayUnitsPopOverVisible;
    this._visibility$.next(this._holidayUnitsPopOverVisible);
  }


  /**
   * 
   * 
   * 
   * @memberOf AbsenceListComponent
   */
  _hidePopover() {
    this._holidayUnitsPopOverVisible = false;
    this._visibility$.next(this._holidayUnitsPopOverVisible);
  }

  private _getNoOfUnits(contextObj: MyAbsence) {
    let noOfUnits: string = (contextObj.HolidayUnitType == HolidayUnitType.Days)
      ? contextObj.NoOfUnits + ' Days'
      : contextObj.NoOfUnits + ' Hours';
    if (contextObj.HalfDayType) {
      noOfUnits = noOfUnits + (contextObj.HalfDayType == HalfDayType.AM ? ' AM' : ' PM');
    }
    return noOfUnits;
  }

  private _doAllTranslations() {
    this._managerCommentLabel = this._translationService.translate('Manager_comment');
    this._employeeCommentLabel = this._translationService.translate('Employee_comment');
  }


  private _processFiscalyears() {
    if (!isNullOrUndefined(this._fiscalYearList)) {
      this._fiscalYears = mapFiscalYearsToAeSelectItems(this._fiscalYearList);
      this._selectedFiscalYear = this._fiscalYears.get(1).Value;
      // this._refreshMyAbsence(); we need to load hte selected employee summary probably
    } else {
      this._fiscalYears = Immutable.List([]);
    }
    this._setFiscalYearBounds(this._selectedFiscalYear);
  }

  private _setFiscalYearBounds(selectedYear: string) {
    this._selectedFiscalYear = selectedYear;
    this._selectedFiscalYearDateBounds = CommonHelpers.processFSYearValue(selectedYear, this._datePipe)
  }

  private _initForm(employee, startDate, endDate, absenceStatus, myabsenceType, absenceType) {
    this._holidayRequestsForm = this._fb.group({
      employee: [{ value: employee ? employee : [], disabled: false }],
      startDate: [{ value: startDate, disabled: false }],
      endDate: [{ value: endDate, disabled: false }],
      absenceStatus: [{ value: absenceStatus, disabled: false }],
      type: [{ value: myabsenceType, disabled: false }],
      absenceType: [{ value: absenceType, disabled: false }],
    },
      { validator: properEndDateValidator }
    );

    this._formValueChangesSub = this._holidayRequestsForm.valueChanges.subscribe(data => {
      //this._holidayAbsenceRequest represents the current request object, now modify the request object with form changed parameters and raise api rquest to fetch  the data again
      //clear all parameters and then assign from the form values    
      //only when the form is Valid
      if (this._holidayRequestsForm.valid) {
        //if ((!isNullOrUndefined(data.startDate) && !isNullOrUndefined(data.endDate)) || isNullOrUndefined(data.startDate) && isNullOrUndefined(data.endDate)) {
        this._holidayAbsenceRequest.Params = [];
        if (!isNullOrUndefined(data.absenceStatus)) {
          if (data.absenceStatus.hasOwnProperty('Value')) {
            this._holidayAbsenceRequest.Params.push(new AtlasParams('StatusId', data.absenceStatus.Value));
          } else {
            this._holidayAbsenceRequest.Params.push(new AtlasParams('StatusId', data.absenceStatus));
          }
        } else {
          this._holidayAbsenceRequest.Params.push(new AtlasParams('StatusId', null));
        }
        if (!isNullOrUndefined(this._selectedEmployee)) {
          this._holidayAbsenceRequest.Params.push(new AtlasParams('EmployeeId', this._selectedEmployee[0].Value));
        }
        else {
          this._holidayAbsenceRequest.Params.push(new AtlasParams('EmployeeId', !isNullOrUndefined(data.employee) && data.employee.length > 0 && !StringHelper.isNullOrUndefinedOrEmpty(data.employee[0]) ? data.employee[0] : null));
        }
        this._holidayAbsenceRequest.Params.push(new AtlasParams('StartDate', (data.startDate ? data.startDate.toDateString() : null)));
        this._holidayAbsenceRequest.Params.push(new AtlasParams('EndDate', (data.endDate ? data.endDate.toDateString() : null)));
        this._holidayAbsenceRequest.Params.push(new AtlasParams('AbsenceType', data.type));
        this._holidayAbsenceRequest.Params.push(new AtlasParams('AbsenceTypeId', data.absenceType ? concatenateSelectItemValues(data.absenceType) : null));
        this._store.dispatch(new LoadHolidayAbsenceRequestsAction(this._holidayAbsenceRequest));
      }
      //}
    });

  }


  // End of private methods
  // Public methods
  commentStatus(contextObj: MyAbsence): boolean {
    if (StringHelper.isNullOrUndefinedOrEmpty(contextObj.Reason) && StringHelper.isNullOrUndefinedOrEmpty(contextObj.Comment)) {
      return false;
    } else {
      return true;
    }
  }
  public getComment(contextObj: MyAbsence): string {
    return this._employeeCommentLabel + ":" + (StringHelper.isNullOrUndefinedOrEmpty(contextObj.Reason) ? 'N/A' : contextObj.Reason) + '\n' + this._managerCommentLabel + " :" + (StringHelper.isNullOrUndefinedOrEmpty(contextObj.Comment) ? 'N/A' : contextObj.Comment);
  }

  public getLunchDuration(lunchDuration: number) {
    return Number(Math.round(lunchDuration * 100) / 100).toFixed(2)
  }
  public getPopOverVm(rowContext: any) {
    let newContextObject: any;
    this._holidayUnitsPopOverSub = this._holidayAbsenceRequests$.map(x => x.find(x => x.Id === rowContext.Id)).subscribe(myHoliday => newContextObject = myHoliday);
    return createPopOverVm<any>(this._popOverTemplate, newContextObject);
  }

  public getType(typeId: number): string {
    return typeId == 1 ? 'Holiday' : 'Absence';
  }

  getUnitsData(fraction) {
    return fraction;
  }

  public onSort($event) {
    // this._holidayAbsenceRequest has the current state of request object.
    this._holidayAbsenceRequest.SortBy.SortField = $event.SortField;
    this._holidayAbsenceRequest.SortBy.Direction = $event.Direction;
    this._holidayAbsenceRequest.PageNumber = 1;
    this._store.dispatch(new LoadHolidayAbsenceRequestsAction(this._holidayAbsenceRequest));
  }

  public onPageChange($event) {
    // this._holidayAbsenceRequest has the current state of request object.
    this._holidayAbsenceRequest.PageNumber = $event.pageNumber;
    this._holidayAbsenceRequest.PageSize = $event.noOfRows;
    this._store.dispatch(new LoadHolidayAbsenceRequestsAction(this._holidayAbsenceRequest));
  }

  public onFiscalYearChange(event: AeSelectEvent<string>) {
    this.changeFiscalYear.emit(event.SelectedValue);
  }


  public canEmployeeSummaryShown(): boolean {
    return this._selectedEmployee != null;
  }

  public clearFilters($event) {
    //AeSelectItem<string>[]
    this._employees$.next([]);
    let pendingStatusId = this._absenceStatusItems.filter(c => c.Text.toLowerCase() === 'pending').first().Value;
    this._selectedEmployee = null;
    this._initialEmployeeText.next(null);
    this._holidayRequestsForm.patchValue(
      {
        employee: [],
        startDate: null,
        endDate: null,
        absenceStatus: pendingStatusId,
        type: '',
        absenceType: ''
      }
    );
    this.employeeSelect.emit(null);
    this._cdRef.markForCheck();
  }


  public canAbsenceTypesBeShown(): boolean {
    return this._holidayRequestsForm.controls['type'].value == 2;
  }


  public formHasEndDateError(): boolean {
    return !StringHelper.isNullOrUndefined(this._holidayRequestsForm.get('startDate').value)
      && !StringHelper.isNullOrUndefined(this._holidayRequestsForm.get('endDate').value)
      && this._holidayRequestsForm.errors && !this._holidayRequestsForm.errors['endDateLessThanStartDate']
  }


  public formHasEndDateOrphanedError(): boolean {
    return StringHelper.isNullOrUndefined(this._holidayRequestsForm.get('startDate').value)
      && !StringHelper.isNullOrUndefined(this._holidayRequestsForm.get('endDate').value)
      && (this._holidayRequestsForm.errors && !this._holidayRequestsForm.errors['orphanedEndDate'])
  }

  public aeOnUnselectEmployee($event) {
    this._selectedEmployee = null;
    this.employeeSelect.emit(null);
  }

  public aeOnClearEmployee($event) {
    this._selectedEmployee = null;
    this.employeeSelect.emit(null);
  }

  public onEmployeeSearchChange(text: string) {
    this._holidayRequestsForm.get('employee').setValue('');
    if (StringHelper.isNullOrUndefinedOrEmpty(text)) {
      this._selectedEmployee = null;
      this.employeeSelect.emit(null);
    }
  }

  public onSelectEmployee($event) {
    if (!isNullOrUndefined($event)) {
      this._selectedEmployee = $event;
      this.employeeSelect.emit(this._selectedEmployee[0].Value);
      // this._holidayRequestsForm.get('employee').setValue(this._selectedEmployee.map(c => c.Value));
      if (!isNullOrUndefined(this._fiscalYears) &&
        this._fiscalYears.count() > 0) {
        this._selectedFiscalYear = this._fiscalYears.get(1).Value;
        this.changeFiscalYear.emit(this._selectedFiscalYear);
      }
    }
  }

  public searchEmployees(e) {
    this._selectedEmployee = null;
    this.employeeSelect.emit(null);
    let apiRequestWithParams: AtlasApiRequestWithParams;
    let apiParams: AtlasParams[] = [];
    apiParams.push(new AtlasParams("SearchedQuery", e.query));
    apiRequestWithParams = new AtlasApiRequestWithParams(0, 0, 'FirstName', SortDirection.Ascending, apiParams);
    //this._store.dispatch(new LoadHolidayAbsenceRequestsEmployeesAction(apiRequestWithParams));
    this._employeeSearchService.getEmployeesKeyValuePair(e.query).first().subscribe((empData) => {
      let filteredEmployees = mapEmployeKeyValuesToAeSelectItems(empData);
      if (!isNullOrUndefined(filteredEmployees)) {
        let loggedinEmpId = this._claimsHelper.getEmpId();
        if (!StringHelper.isNullOrUndefinedOrEmpty(loggedinEmpId)) {
          loggedinEmpId = loggedinEmpId.toLowerCase();
        } else {
          loggedinEmpId = '';
        }
        filteredEmployees = filteredEmployees.filter(c => c.Value.toLowerCase() !== loggedinEmpId);
      }
      this._employees$.next(filteredEmployees);
    });
  }

  ngOnInit() {
    this._doAllTranslations();
    this._translationChnageSub = this._translationService.translationChanged.subscribe(
      () => {
        this._doAllTranslations();
      }
    );
    this._holidayAbsenceRequests$ = this._store.let(fromRoot.getHolidayAbsenceRequestsData);
    this._recordsCount$ = this._store.let(fromRoot.getHolidayAbsenceRequestsTotalCountData);
    this._dataTableOptions$ = this._store.let(fromRoot.getHolidayRequestsDataTableOptionsData);
    this._holidayAbsencesLoading$ = this._store.let(fromRoot.getHolidayAbsenceRequestsLoadedData);

    // this._employees$ = this._store.let(fromRoot.getHolidayAbsenceRequestsEmployeesData);
    this._types = this._holidayAbsenceDataService.getHolidayTypes();

    this._holidayAbsenceRequestSubScription =
      Observable.combineLatest(this._onDemandDataLoad,
        this._store.let(fromRoot.getHolidayAbsenceApiRequestData)).subscribe((values) => {
          if (!isNullOrUndefined(values[0]) && values[0]) {
            // let initialRequest = values[1];
            this._holidayAbsenceRequest = values[1];
            if (this._initialLoad && this._holidayAbsenceRequest) {
              this._initialLoad = false;
              let absenceStatusId: string = getAtlasParamValueByKey(this._holidayAbsenceRequest.Params, 'StatusId');
              let absenceStatusItem = this._absenceStatusItems.find(obj => obj.Value.toLowerCase() == absenceStatusId.toLowerCase());
              let startDate: Date = null;
              if (getAtlasParamValueByKey(this._holidayAbsenceRequest.Params, 'StartDate')) {
                startDate = new Date(getAtlasParamValueByKey(this._holidayAbsenceRequest.Params, 'StartDate'));
              }
              let endDate: Date = null;
              if (getAtlasParamValueByKey(this._holidayAbsenceRequest.Params, 'EndDate')) {
                endDate = new Date(getAtlasParamValueByKey(this._holidayAbsenceRequest.Params, 'EndDate'));
              }
              // this._cdRef.markForCheck();
              this._initForm(this._selectedEmployee ? this._selectedEmployee : [], startDate, endDate, absenceStatusItem, '', '');
              this._onDemandDataLoad.next(false);
            }
          }
        });



    this._declineSub = this._declineHolidayAbsenceRequestCommand.subscribe((item: MyAbsence) => {
      this.declineRequest.emit(item.Id);
    });

    this._approveSub = this._approveHolidayAbsenceRequestCommand.subscribe((item: MyAbsence) => {
      this.approveRequest.emit(item);
    });

    this._viewSub = this._viewHolidayAbsenceRequestTeamCalendarCommand.subscribe((item: MyAbsence) => {

      this.viewTeamCalendarRequest.emit(item);
    });
    this._viewRosterSub = this._viewHolidayAbsenceRequestRosterCommand.subscribe((item: MyAbsence) => {
      this.selectTeamRoaster.emit(item);
    });

    this._onestepProcessSub = this._store.let(fromRoot.getOneStepApprovalStatus).subscribe((status) => {
      if (StringHelper.coerceBooleanProperty(status)) {

        let approveStatusId = this._absenceStatusItems.filter(c => c.Text.toLowerCase() === 'approved').first().Value;
        this._holidayRequestsForm.get('absenceStatus').setValue(approveStatusId);
        this._store.dispatch(new ClearOneStepApprovalAction(true));
        this._cdRef.markForCheck();
        this._cdRef.detectChanges();
      }
    });
  }

  ngOnChanges() {
  }
  ngOnDestroy() {
    if (this._translationChnageSub) {
      this._translationChnageSub.unsubscribe();
    }
    if (this._holidayAbsenceRequestSubScription) {
      this._holidayAbsenceRequestSubScription.unsubscribe();
    }

    if (this._holidayAbsenceRequestSubScription) {
      this._holidayAbsenceRequestSubScription.unsubscribe();
    }

    if (this._selectedEmployeeHolidaySummarySubscription) {
      this._selectedEmployeeHolidaySummarySubscription.unsubscribe();
    }
    if (this._holidayUnitsPopOverSub) {
      this._holidayUnitsPopOverSub.unsubscribe();
    }
    if (this._declineSub) {
      this._declineSub.unsubscribe();
    }
    if (this._approveSub) {
      this._approveSub.unsubscribe();
    }
    if (this._viewSub) {
      this._viewSub.unsubscribe();
    }
    if (this._onestepProcessSub) {
      this._onestepProcessSub.unsubscribe();
    }
    if (this._formValueChangesSub) {
      this._formValueChangesSub.unsubscribe();
    }
    if (this._viewRosterSub) {
      this._viewRosterSub.unsubscribe();
    }
  }
  // End of public methods
}
