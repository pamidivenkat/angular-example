import { EmployeeLoadAction } from './../../../employee/actions/employee.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { IBreadcrumb } from './../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { AeDatasourceType } from '../../../atlas-elements/common/ae-datasource-type';
import { AePosition } from '../../../atlas-elements/common/ae-position.enum';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { CalendarEvent } from '../../../atlas-elements/common/models/calendar-models/calendarEvent';
import { LoadSitesAction } from '../../../shared/actions/company.actions';
import { LoadApplicableDepartmentsAction, LoadApplicableSitesAction } from '../../../shared/actions/user.actions';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { StringHelper } from '../../../shared/helpers/string-helper';
import * as fromRoot from '../../../shared/reducers/index';
import { RouteParams } from '../../../shared/services/route-params';
import { ActionTypes, SearchEmployeesAction, SearchEventsAction } from '../../actions/calendar.actions';
import {
  extractCalendarInformation,
  mapDepartmentsToAeSelect,
  mapEmployeesToAeSelect,
  mapSitesToAeSelect,
} from '../../common/calendar-extract-helper';
import { CalendarFilterModel, TeamCalendarLoadType } from '../../model/calendar-filter.model';
import { DateRangeFilter, Department, Employee, Site } from '../../model/calendar-models';
import { isNullOrUndefined } from 'util';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { addDays, addMonths, addWeeks, subDays, subMonths, subWeeks } from 'date-fns';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';

@Component({
  selector: 'calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CalendarComponent extends BaseComponent implements OnInit, OnDestroy {


  // Private fields

  private _sites: AeSelectItem<string>[];
  private _events: CalendarEvent[];
  private _departments: Department[];
  private _employees: BehaviorSubject<AeSelectItem<string>[]> = new BehaviorSubject<AeSelectItem<string>[]>([]);
  private modelSwitch: boolean = false;
  private _isEmployee: boolean = false;
  private _isServiceOwnerOrHRManager: boolean = false;
  private _isManager: boolean = false;
  private _canViewPage: boolean = true;
  private _sitesSubscription: Subscription;
  private _employeesSubscription: Subscription;
  private _departmentsSubscription: Subscription;
  private _eventsSubscription: Subscription;
  private _calendarTitle: string;
  private _dateRangeSubscription: Subscription;
  private _eventStatusSubscription: Subscription;
  private _loadStatus: Observable<boolean>;
  private _adminView: boolean = false;
  private _canViewOthersCalendar: boolean = false;
  private _selectedEmployeeDeptId: string;
  private _employeeAbsenceSubscription: Subscription;
  private _selectedEmployeeSubscription: Subscription;
  private _selectedEmployee: string;  // currently only using from emaployee-manage page
  private _initialSingleEmployee: AeSelectItem<string>;
  // Input private fields
  private _isTeamCalendar: boolean;
  // End of input private fields


  // switch
  switchTextLeft: AeClassStyle = AeClassStyle.TextLeft;
  private _calendarFilterForm: FormGroup;
  private _calendarFilterModel: CalendarFilterModel;
  private _btnLeft: AePosition = AePosition.Left;
  private _filterDsType: AeDatasourceType = AeDatasourceType.Local;
  private _remoteDsType: AeDatasourceType = AeDatasourceType.Remote;
  protected _controlChangesSub: Subscription[] = [];
  private _empAbsenceLoaded: boolean = false;
  private _sitesLoaded: boolean = false;
  private _deptLoaded: boolean = false;
  private _empLoaded: boolean = false;
  private _calendarFilterDataLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _loadType: TeamCalendarLoadType = TeamCalendarLoadType.ChildComponent;
  // End of private fields
  get calendarFilterDataLoaded$(): BehaviorSubject<boolean> {
    return this._calendarFilterDataLoaded$;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Calendar;
  }

  get canViewPage() {
    return this._canViewPage;
  }

  get events() {
    return this._events;
  }

  get departments() {
    return this._departments;
  }

  get employees(): BehaviorSubject<AeSelectItem<string>[]> {
    return this._employees;
  }

  get isEmployee() {
    return this._isEmployee;
  }

  get isServiceOwnerOrHRManager() {
    return this._isServiceOwnerOrHRManager;
  }

  get isManager() {
    return this._isManager;
  }

  get calendarTitle() {
    return this._calendarTitle;
  }

  get loadStatus() {
    return this._loadStatus;
  }

  get adminView() {
    return this._adminView;
  }

  get sites() {
    return this._sites;
  }

  get canViewOthersCalendar() {
    return this._canViewOthersCalendar;
  }

  get calendarFilterForm() {
    return this._calendarFilterForm;
  }

  get filterDsType() {
    return this._filterDsType;
  }

  get calendarFilterModel() {
    return this._calendarFilterModel;
  }

  get remoteDsType() {
    return this._remoteDsType;
  }

  get siteName() {
    if (isNullOrUndefined(this._calendarFilterModel) || isNullOrUndefined(this._calendarFilterModel.Site[0])) return "";
    return this._calendarFilterModel.Site[0].Text
  }

  get departmentName() {
    if (isNullOrUndefined(this._calendarFilterModel) || isNullOrUndefined(this._calendarFilterModel.Department[0])) return "";
    return this._calendarFilterModel.Department[0].Name
  }


  @Input('loadType')
  get loadType(): TeamCalendarLoadType {
    return this._loadType;
  }
  set loadType(val: TeamCalendarLoadType) {
    this._loadType = val;
  }
  /**
  * Creates an instance for CalendarComponent
  * @param {LocaleService} _localeService 
  * @param {TranslationService} _translationService 
  * @param {ChangeDetectorRef} _changeDetector 
  * @param {Store<fromRoot.State>} _store 
  * @param {ClaimsHelperService} _claimsHelper 
  * 
  *  CalendarComponent
  */

  // constructor
  constructor(protected _changeDetector: ChangeDetectorRef
    , protected _store: Store<fromRoot.State>
    , _localeService: LocaleService
    , protected _fb: FormBuilder
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , protected _routeParams: RouteParams
    , protected _router: Router
    , _breadcrumbService: BreadcrumbService
    , private _activateRoute: ActivatedRoute
  ) {
    super(_localeService, _translationService, _changeDetector);

    let bcItem = new IBreadcrumb('Calendar', '/calendar', BreadcrumbGroup.Calendar);
    _breadcrumbService.add(bcItem);

    // Check the calendar visibility
    this._setCalendarVisibilityToUsers();
  }

  ngOnInit() {
    // Load search block fields lookup data
    let siteItem: AeSelectItem<string> = new AeSelectItem<string>();
    siteItem.Value = this._claimsHelper.getSiteId().toLowerCase();
    siteItem.Childrens = null;
    siteItem.Disabled = false;
    let deptItem: Department = new Department();
    deptItem.Id = this._claimsHelper.getDepartmentId().toLowerCase();
    let empItem: AeSelectItem<string> = new AeSelectItem<string>();

    this._sitesSubscription = this._store.select(c => c.userState.SitesData)
      .combineLatest(this._store.select(c => c.userState.DepartmentData)
      , this._store.select(p => p.calendarState.isTeamCalendar)
      , this._store.let(fromRoot.getSelectedEmployeeAbsence)
      , this._store.let(fromRoot.getEmployeePersonalData)
      )
      .subscribe((val) => {
        let sites: Site[] = val[0];
        let depts: Department[] = val[1];
        let isTeamCalendar = val[2];
        let employeeAbsence: any = val[3];
        let emp = val[4];
        if (isNullOrUndefined(sites)) {
          if (!this._sitesLoaded) {
            this._sitesLoaded = true;
            this._store.dispatch(new LoadApplicableSitesAction(true));
          }
        } else {
          this._sites = mapSitesToAeSelect(sites).toArray();
        }

        if (isNullOrUndefined(depts)) {
          if (!this._deptLoaded) {
            this._deptLoaded = true;
            this._store.dispatch(new LoadApplicableDepartmentsAction());
          }
        } else {
          this._departments = depts;
        }

        if (!isNullOrUndefined(emp)) {
          if (!this._empLoaded && emp.Id.toLowerCase() != this._claimsHelper.getEmpIdOrDefault().toLocaleLowerCase()) {
            this._store.dispatch(new EmployeeLoadAction({ EmployeeId: this._claimsHelper.getEmpIdOrDefault() }));
            this._empLoaded = true;
          } else {
            this._selectedEmployee = emp.Id.toLowerCase();
            empItem.Value = this._selectedEmployee;
            empItem.Text = emp.FullName;
            empItem.Childrens = null;
            empItem.Disabled = false;
          }
        } else {
          //despatch action to load selected employee..
          if (!this._empLoaded) {
            this._store.dispatch(new EmployeeLoadAction({ EmployeeId: this._claimsHelper.getEmpIdOrDefault() }));
            this._empLoaded = true;
          }
        }
        if (!isNullOrUndefined(isTeamCalendar) && isTeamCalendar == false && sites && depts && !isNullOrUndefined(emp)) {
          //employee acessing the calendar through menu item
          let filteredSites = this._sites.filter(c => c.Value == siteItem.Value);
          if (!isNullOrUndefined(filteredSites) && filteredSites.length > 0) {
            siteItem = filteredSites[0];
            let siteItems: AeSelectItem<string>[] = [];
            siteItems.push(siteItem);
          }

          let filteredDepartments = this._departments.filter(c => c.Id == deptItem.Id);
          if (!isNullOrUndefined(filteredDepartments) && filteredDepartments.length > 0) {
            let departments: Department[] = [];
            deptItem = filteredDepartments[0]
            departments.push(deptItem);
          }
          let employees: AeSelectItem<string>[] = [];
          employees.push(empItem);
          empItem.Text = emp.FullName;
          this._calendarFilterDataLoaded$.next(true);
          this._initForm(siteItem, deptItem, empItem); //init form and calendar model..
          this._store.dispatch(new SearchEventsAction(this._calendarFilterModel));
          // set calendar default title
          this._setCalendarTitle();
          this._changeDetector.markForCheck();
        }
        if (!isNullOrUndefined(isTeamCalendar) && !isNullOrUndefined(this._loadType) && isTeamCalendar == true && sites && depts && this._loadType == TeamCalendarLoadType.ChildComponent) {
          // for  team calendar mode loaded from my holidays page
          let filteredSites = this._sites.filter(c => c.Value == siteItem.Value);
          if (!isNullOrUndefined(filteredSites) && filteredSites.length > 0) {
            siteItem = filteredSites[0];
            let siteItems: AeSelectItem<string>[] = [];
            siteItems.push(siteItem);
          }

          let filteredDepartments = this._departments.filter(c => c.Id == deptItem.Id);
          if (!isNullOrUndefined(filteredDepartments) && filteredDepartments.length > 0) {
            let departments: Department[] = [];
            deptItem = filteredDepartments[0]
            departments.push(deptItem);
          }
          let employees: AeSelectItem<string>[] = [];
          employees.push(empItem);
          this._calendarFilterDataLoaded$.next(true);
          this._initForm(siteItem, deptItem, null); //initi form and calendar model..
          this._store.dispatch(new SearchEventsAction(this._calendarFilterModel));
          // set calendar default title
          this._setCalendarTitle();
          this._changeDetector.markForCheck();
        }
        if (!isNullOrUndefined(isTeamCalendar) && isTeamCalendar == true && sites && depts && !isNullOrUndefined(employeeAbsence)) {
          //for team calendar mode when employee is selected from the holidays requests screen by manager
          deptItem.Id = (employeeAbsence.EmployeeView) ? employeeAbsence.EmployeeView.DepartmentId : '00000000-0000-0000-0000-000000000000';
          deptItem.Name = (employeeAbsence.EmployeeView) ? employeeAbsence.EmployeeView.DepartmentName : '';
          siteItem.Value = (employeeAbsence.EmployeeView) ? employeeAbsence.EmployeeView.SiteId : '00000000-0000-0000-0000-000000000000';
          siteItem.Text = (employeeAbsence.EmployeeView) ? employeeAbsence.EmployeeView.EmployeeSiteName : '';
          siteItem.Childrens = null;
          siteItem.Disabled = false;
          //in team calendar mode there will not be any employee selected..
          //empItem = null;
          if (isNullOrUndefined(deptItem.Id)) {
            deptItem = null;
          }
          if (isNullOrUndefined(siteItem.Value)) {
            siteItem = null;
          }
          this._empAbsenceLoaded = true;
          let selectedEmpDepts: Department[] = [];

          if (!isNullOrUndefined(deptItem))
            selectedEmpDepts.push(deptItem);

          let selectedEmployeeSites: AeSelectItem<string>[] = [];
          if (!isNullOrUndefined(siteItem))
            selectedEmployeeSites.push(siteItem);

          this._calendarFilterDataLoaded$.next(true);
          this._initForm(siteItem, deptItem, null); //initi form and calendar model..
          this._store.dispatch(new SearchEventsAction(this._calendarFilterModel));
          // set calendar default title
          this._setCalendarTitle();
          this._changeDetector.markForCheck();
        }

      });


    this._employeesSubscription = this._store.select(c => c.calendarState.employees).subscribe(empList => {
      if (!isNullOrUndefined(empList) && !isNullOrUndefined(this._calendarFilterModel)) {
        let employees = mapEmployeesToAeSelect(empList).toArray();
        this._employees.next(employees);       
      }
    });

    this._eventsSubscription = this._store.let(fromRoot.getCalendarEventsData).subscribe(events => {
      if (!isNullOrUndefined(events) && events.length > 0) {
        this._events = events;
        this._changeDetector.markForCheck();
      }
    });
    this._loadStatus = this._store.select(p => !p.calendarState.calendarStatus)
  }

  /*
  * Method to set the form data
  */
  private _initForm(site?: AeSelectItem<string>, department?: Department, employee?: AeSelectItem<string>) {
    this._calendarFilterModel = new CalendarFilterModel();
    if (!isNullOrUndefined(site) && !isNullOrUndefined(site.Value) && site.Value != '00000000-0000-0000-0000-000000000000') {
      this._calendarFilterModel.Site.push(site);
    } else {
      this._calendarFilterModel.Site = [];
    }
    if (!isNullOrUndefined(department) && !isNullOrUndefined(department.Id) && department.Id != '00000000-0000-0000-0000-000000000000') {
      this._calendarFilterModel.Department = [];
      this._calendarFilterModel.Department.push(department);
    } else {
      this._calendarFilterModel.Department = [];
    }

    if (this._router.url != '/calendar/teamholidays') {
      if (!isNullOrUndefined(employee) && employee.Value != '00000000-0000-0000-0000-000000000000' && !this._isTeamCalendar) {
        if (isNullOrUndefined(employee.Text) || employee.Text === '') {
          employee.Text = this._claimsHelper.getUserFullName();
        }
        this._calendarFilterModel.Employee.push(employee);
      }
    }


    this._calendarFilterForm = this._fb.group({
      Site: [{ value: this._calendarFilterModel.Site, disabled: false }],
      Department: [{ value: this._calendarFilterModel.Department, disabled: false }],
      Employee: [{ value: this._calendarFilterModel.Employee, disabled: false }],
      ShowPending: [{ value: this._calendarFilterModel.ShowPending, disabled: false }]
    });

    for (let name in this._calendarFilterForm.controls) {
      let control = this._calendarFilterForm.controls[name];
      let sub = control.valueChanges.subscribe(v => {
        this._calendarFilterModel[name] = v;
        this._setCalendarTitle();
        this.refreshCalendar('');
      });
      this._controlChangesSub.push(sub);
    }
    this.dateChanged(new Date()); // currentdate
  }

  /*
  * Method to refresh the calendar events upon search action
  */
  refreshCalendar(e): void {
    this._store.dispatch(new SearchEventsAction(this._calendarFilterModel));
  }

  /*
  * Set calendar title
  */
  _setCalendarTitle(): void {
    if (!isNullOrUndefined(this._calendarFilterModel) && this._calendarFilterModel.Employee.length === 1) {
      this._calendarTitle = this._calendarFilterModel.Employee[0].Text;
      if (StringHelper.isNullOrUndefinedOrEmpty(this._calendarTitle)) {
        //if empty then try to find frm  this._employees
        let empid: any = this._calendarFilterModel.Employee[0].Value ? this._calendarFilterModel.Employee[0].Value : this._calendarFilterModel.Employee[0];
        let selectedEmployee = this._employees.value.find(obj => obj.Value == empid);
        if (!isNullOrUndefined(selectedEmployee)) {
          this._calendarTitle = selectedEmployee.Text;
        }
        if (!isNullOrUndefined(this._initialSingleEmployee) && isNullOrUndefined(this._calendarTitle)) {
          this._calendarTitle = this._initialSingleEmployee.Text;
        }
        //now try to get from the already binded form value..
        let bindedValue = this._calendarFilterForm.controls['Employee'];
      }
    }
    else {
      this._calendarTitle = "Calendar"
    }
    this._changeDetector.markForCheck();
  }

  /*
  * Reset the events upon clear button click
  */
  resetFilterForm(e): void {
    //we need to keep the old date filters as is
    let existingDateRange = this._calendarFilterModel.dateRange;
    if (this._isEmployee) {
      this._calendarFilterModel.Employee = [];
    }
    else {
      this._calendarFilterModel = new CalendarFilterModel();
      this._calendarFilterModel.dateRange = existingDateRange;
    }
    this._events = [];
    this._setCalendarTitle();
    this._changeDetector.markForCheck();
    this._store.dispatch(new SearchEventsAction(this._calendarFilterModel));
  }

  /*
 * Update filters in state while search data changed
 */
  onChangeEmployee(e) {
    if (e.length == 1) {
      this._initialSingleEmployee = e[0];
    } else {
      this._initialSingleEmployee = null;
    }
  }
  /*
   * Update filters in state while search data changed
   */
  onChangeDept(e) {
    this._employees.next([]);
    this._selectedEmployee = '';
    if (e.length === 0) {
      this._calendarFilterModel.Employee = [];
      this._cdRef.markForCheck();
    } else {
      this._cdRef.markForCheck();
      this._refreshEmployees();
    }

  }
  /*
   * Update filters in state while search data changed
   */
  onChangeSite(e) {
  }



  _setCalendarVisibilityToUsers(): void {
    if (this._claimsHelper.isAdministrator() && !this._routeParams.Cid) {
      this._adminView = true;
      if (this._claimsHelper.canViewOthersCalendar()) {
        this._canViewOthersCalendar = true;
      }
    } else {
      if (this._claimsHelper.isHRManagerOrServiceOwner()) {
        this._isServiceOwnerOrHRManager = true;
      }
      else if (this._claimsHelper.isHolidayAuthorizerOrManager()) {
        this._isManager = true;
      } else if (this._claimsHelper.isEmployee()) {
        this._isEmployee = true;
      } else {
        this._canViewPage = false;
      }
    }

  }

  private _getEmpId(): string {
    if (!isNullOrUndefined(this._routeParams.Id) && this._routeParams.Id !== '00000000-0000-0000-0000-000000000000') {
      return this._routeParams.Id.toLowerCase();
    }
    else {
      return this._claimsHelper.getEmpId() ? this._claimsHelper.getEmpId().toLowerCase() : '00000000-0000-0000-0000-000000000000';
    }
  }
  /*
  * To get department id and default the department autocomplete on first load
  */
  private _getDepartmentId(): string {
    if (this._isTeamCalendar) {
      this._employeeAbsenceSubscription = this._store.let(fromRoot.getSelectedEmployeeAbsence)
        .subscribe((employeeAbsence: any) => {
          if (!isNullOrUndefined(employeeAbsence)) {
            this._selectedEmployeeDeptId = (employeeAbsence.EmployeeView) ? employeeAbsence.EmployeeView.DepartmentId : '00000000-0000-0000-0000-000000000000';
          }
        });
    } else {
      this._selectedEmployeeDeptId = this._claimsHelper.getDepartmentId().toLowerCase();
    }
    return this._selectedEmployeeDeptId;
  }
  /*
  *  Filter employees by department
  * */
  _getEmployeesByDept(deptIds: AeSelectItem<string>[], employees: Employee[]): Employee[] {
    let emps: Employee[] = [];
    if (!isNullOrUndefined(deptIds) && deptIds.length > 0) {
      let selectedDepts = deptIds.length > 1 ? deptIds.join(',') : deptIds.map(res => res.Value).join(',');
      emps = employees.filter(emp => {
        return selectedDepts.includes(emp.DepartmentId);
      });
    }
    else {
      this._employees.next([]);
      this._calendarFilterModel.Employee = [];
    }
    return emps;
  }
  _refreshEmployees(): void {
    this._store.dispatch(new SearchEmployeesAction({
      employeeId: this._claimsHelper.getEmpIdOrDefault(),
      deptIds: (this._calendarFilterModel.Department.length > 0) ? this._calendarFilterModel.Department.map(c => c.Id ? c.Id : c).join(",") : '',
      query: null,
      siteIds: (this._calendarFilterModel.Site.length > 0) ? this._calendarFilterModel.Site.map(c => c.Value ? c.Value : c).join(",") : '',
    }));
  }

  aeOnClearSelectedDept(e): any {
    this._employees.next([]);
  }
  aeOnUnselectDept(e): any {
    //  this._refreshEmployees();
    this._employees.next([]);
  }
  aeOnClearSelectedSite(e): any {
  }
  aeOnUnselectSite(e): any {
    // this._refreshEmployees();
  }
  aeOnClearSelectedEmp(e): any {
    this._employees.next([]);
  }
  aeOnUnselectEmp(e): any {
    if (e.length == 1) {
      this._initialSingleEmployee = e[0];
    } else {
      this._initialSingleEmployee = null;
    }
  }

  searchEmployees(e) {
    this._store.dispatch(new SearchEmployeesAction({
      employeeId: this._claimsHelper.getEmpIdOrDefault(),
      deptIds: (this._calendarFilterModel.Department.length > 0) ? this._calendarFilterModel.Department.map(c => c.Id ? c.Id : c).join(",") : '',
      query: e.query,
      siteIds: (this._calendarFilterModel.Site.length > 0) ? this._calendarFilterModel.Site.map(c => c.Value ? c.Value : c).join(",") : '',
    }));
  }

  ngOnDestroy(): void {
    if (this._controlChangesSub) {
      this._controlChangesSub.forEach(csub => {
        if (csub) {
          csub.unsubscribe();
        }
      });
    }
    if (!isNullOrUndefined(this._employeesSubscription)) {
      this._employeesSubscription.unsubscribe();

    }
    if (!isNullOrUndefined(this._sitesSubscription)) {
      this._sitesSubscription.unsubscribe();

    }
    if (!isNullOrUndefined(this._departmentsSubscription)) {
      this._departmentsSubscription.unsubscribe();

    }
    if (!isNullOrUndefined(this._eventsSubscription)) {
      this._eventsSubscription.unsubscribe();

    }
    if (!isNullOrUndefined(this._dateRangeSubscription)) {
      this._dateRangeSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._eventStatusSubscription)) {
      this._eventStatusSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._employeeAbsenceSubscription)) {
      this._employeeAbsenceSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._selectedEmployeeSubscription)) {
      this._selectedEmployeeSubscription.unsubscribe();
    }

  }
  dateChanged(eventDate: Date) {
    /**
    The event fetching logic has been taken from Atlas 1.x.
    Currently it's fetching prior 1 month and after 2 months events against current date.

    However we identified data inconsistency when event dates not fall under this duration but still be on that month.
    So we are now fixing this by considering fetching events from starting of the month to ending instead on considering particular date.

    Eg : Earlier ( current date : August 16 - It fetches data from july 16 2017 to october 16 2017)
    due to that we are loosing few events in respective months
    Now (current date : August 16 - It will fetch events from july 01 2017 to october 31 2017)
    **/
    let startDate = new Date(eventDate);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0);
    startDate = new Date(startDate.getTime() - (7 * 24 * 60 * 60 * 1000));

    let endDate = new Date(eventDate);
    let lastDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
    endDate.setDate(lastDate);
    endDate.setHours(0, 0, 0);
    endDate = new Date(endDate.getTime() + (7 * 24 * 60 * 60 * 1000));

    let dateRange: DateRangeFilter = new DateRangeFilter();
    const subFn: any = {
      day: subDays,
      week: subWeeks,
      month: subMonths
    }['month'];
    const addFn: any = {
      day: addDays,
      week: addWeeks,
      month: addMonths
    }['month'];
    dateRange.start = subFn(new Date(startDate), 1);
    dateRange.end = addFn(new Date(endDate), 2);
    if (isNullOrUndefined(this._calendarFilterModel.dateRange)) {
      this._calendarFilterModel.dateRange = dateRange;
    }
    else if (!isNullOrUndefined(this._calendarFilterModel.dateRange) && !isNullOrUndefined(dateRange)
      && !(eventDate >= this._calendarFilterModel.dateRange.start
        && eventDate <= this._calendarFilterModel.dateRange.end)) {
      this._calendarFilterModel.dateRange = dateRange;
      this._store.dispatch(new SearchEventsAction(this._calendarFilterModel));
    }

  }


}
