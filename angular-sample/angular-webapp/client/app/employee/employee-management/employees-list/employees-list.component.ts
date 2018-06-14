import { NavigationExtras } from '@angular/router';
import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { MessengerService } from '../../../shared/services/messenger.service';
import { AeTemplateComponent } from '../../../atlas-elements/ae-template/ae-template.component';
import { createPopOverVm, PopoverVm } from '../../../atlas-elements/common/models/popover-vm';
import { IMessageVM } from '../../../shared/models/imessage-vm';
import { Router } from '@angular/router';
import { LoadApplicableDepartmentsAction } from '../../../shared/actions/user.actions';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { AeDatasourceType } from '../../../atlas-elements/common/ae-datasource-type';
import { LoadSitesAction, LoadSitesCompleteAction } from '../../../shared/actions/company.actions';
import { isNullOrUndefined } from 'util';
import { AeInputType } from '../../../atlas-elements/common/ae-input-type.enum';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { EmployeeManageService } from '../../services/employee-manage.service';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Department, Employee, Site } from '../../../calendar/model/calendar-models';
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as Immutable from 'immutable';
import * as fromRoot from './../../../shared/reducers';
import { LoadApplicableSitesAction } from '../../../shared/actions/user.actions';

@Component({
  selector: 'employees-list',
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeesListComponent extends BaseComponent implements OnInit, OnDestroy, AfterContentInit {

  private _keys = ['Id', 'FullName', 'JobTitle', 'DepartmentName', 'Location', 'StartDate', 'IsManager', 'HasEmail', 'IsLeaver', 'IsUser'];
  private _employeesData$: Observable<Immutable.List<Employee>>;
  private _totalCount$: Observable<number>;
  private _statusTypes: Immutable.List<AeSelectItem<string>>;
  private _employeeTypes: Immutable.List<AeSelectItem<string>>;
  private _userTypes: Immutable.List<AeSelectItem<string>>;
  private _searchDebounce: number;
  private _inputType: AeInputType;
  private _filters: Map<string, string>;
  private _departments: Department[];
  private _locations: Site[];
  private _dataSourceType: AeDatasourceType;
  private _defaultOptions$: Observable<DataTableOptions>;
  private _employeesLoading$: Observable<boolean>;
  private _getApplicableDeptSubscription$: Subscription;
  private _getSiteDataSubscription$: Subscription;
  private _popOverVm: PopoverVm<any>;
  private _popOverVisibilityChange: Subject<PopoverVm<any>>;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _legendOptions = [{ Text: "Holiday approver", IconName: "icon-org-chart" }, { Text: "Email login", IconName: "icon-alert-envelope" }, { Text: "User login", IconName: "icon-employee" }, { Text: "Leaver", IconName: "icon-alert-cancel" }];
  private _iconSize: AeIconSize = AeIconSize.tiny;

  @Input('dataSource')
  get dataSource(): Observable<Immutable.List<Employee>> {
    return this._employeesData$;
  }
  set dataSource(list: Observable<Immutable.List<Employee>>) {
    this._employeesData$ = list;
  }

  @Input('totalCount')
  get totalCount(): Observable<number> {
    return this._totalCount$;
  }
  set totalCount(num: Observable<number>) {
    this._totalCount$ = num;
  }

  @Input('defaultOptions')
  get defaultOptions(): Observable<DataTableOptions> {
    return this._defaultOptions$;
  }
  set defaultOptions(defaultOptions: Observable<DataTableOptions>) {
    this._defaultOptions$ = defaultOptions;
  }

  @Input('loadingStatus')
  get loadingStatus(): Observable<boolean> {
    return this._employeesLoading$;
  }
  set loadingStatus(employeesLoading: Observable<boolean>) {
    this._employeesLoading$ = employeesLoading;
  }


  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _employeeManageService: EmployeeManageService
    , private _router: Router, private _messenger: MessengerService) {
    super(_localeService, _translationService, _cdRef);
    this._searchDebounce = 400;
    this._inputType = AeInputType.search;
    this._popOverVisibilityChange = new Subject();
    this._messenger.subscribe('popOver', (message) => {
      this._onPopOverRequested(message);
    });
  }
  get UserTypes() {
    return this._userTypes;
  }
  get Locations() {
    return this._locations;
  }
  get Departments() {
    return this._departments;
  }
  get TotalCount$() {
    return this._totalCount$;
  }
  get DataSourceType() {
    return this._dataSourceType;
  }
  get InputType() {
    return this._inputType;
  }
  get SearchDebounce() {
    return this._searchDebounce;
  }
  get StatusTypes() {
    return this._statusTypes;
  }
  get EmployeeTypes() {
    return this._employeeTypes;
  }
  get EmployeesLoading$() {
    return this._employeesLoading$;
  }
  get Keys() {
    return this._keys;
  }
  get IconSize() {
    return this._iconSize;
  }
  get LightClass() {
    return this._lightClass;
  }
  get popOverVisibilityChange() {
    return this._popOverVisibilityChange;
  }

  get EmployeesData$() {
    return this._employeesData$;
  }
  get DefaultOptions$() {
    return this._defaultOptions$;
  }
  get LegendOptions() {
    return this._legendOptions;
  }
  ngOnInit() {


    this._filters = new Map<string, string>();
    this._filters.set('employeesByNameOrEmailFilter', '');
    this._filters.set('employeesByLeaverFilter', '0');
    this._filters.set('employeesByNoEmailFilter', '');
    this._filters.set('employeesByHasUserFilter', '');
    this._filters.set('employeesByDepartmentFilter', '');
    this._filters.set('employeesByLocationFilter', '');
    this._dataSourceType = AeDatasourceType.Local;

    this._employeeTypes = Immutable.List([new AeSelectItem<string>('All employees', ''),
    new AeSelectItem<string>('Employees with email', 'true'), new AeSelectItem<string>('Employees without email', 'false')]);
    this._userTypes = Immutable.List([new AeSelectItem<string>('All login types', ''),
    new AeSelectItem<string>('Employees with user accounts', 'true'),
    new AeSelectItem<string>('Employees without user accounts', 'false')]);
    this._statusTypes = Immutable.List([new AeSelectItem<string>('All status', 'null'),
    new AeSelectItem<string>('Active', '0'), new AeSelectItem<string>('Leaver', '1')]);

    this._getApplicableDeptSubscription$ = this._store.let(fromRoot.getApplicableDepartmentsData).subscribe(departments => {
      if (isNullOrUndefined(departments)) {
        this._store.dispatch(new LoadApplicableDepartmentsAction());
      }
      else {
        this._departments = departments;
      }
    });
    this._getSiteDataSubscription$ = this._store.let(fromRoot.getApplicableSitesData).subscribe(locations => {
      if (isNullOrUndefined(locations)) {
        this._store.dispatch(new LoadApplicableSitesAction(true));
      }
      else {
        this._locations = locations;
      }
    });
  }

  ngOnDestroy(): void {
    this._getApplicableDeptSubscription$.unsubscribe();
    this._getSiteDataSubscription$.unsubscribe();
  }

  onPageChange($event: PagingInfo) {
    this._employeeManageService.LoadEmployeesOnPageChange($event);
  }

  onSort($event: AeSortModel) {
    this._employeeManageService.LoadEmployeesOnSort($event);
  }

  private _setFilters(key: string, value: string) {
    if (this._filters === null) {
      this._filters = new Map<string, string>();
    }
    if (this._filters.has(key)) {
      this._filters.delete(key);
    }
    this._filters.set(key, value);
    this._employeeManageService.LoadEmployeesOnFilterChange(this._filters);
  }

  onSearchTextChange($event: any) {
    if (!isNullOrUndefined($event.event.target.value && $event.event.target.value !== "")) {
      this._setFilters('employeesByNameOrEmailFilter', $event.event.target.value);
    }
    else {
      this._filters.delete('employeesByNameOrEmailFilter');
      this._employeeManageService.LoadEmployeesOnFilterChange(this._filters);
    }
  }

  onStatusTypeChange($event: any) {
    if (!isNullOrUndefined($event.SelectedValue) && $event.SelectedValue !== "") {
      this._setFilters('employeesByLeaverFilter', $event.SelectedValue.toString());
    }

    else {
      this._filters.delete('employeesByLeaverFilter');
      this._employeeManageService.LoadEmployeesOnFilterChange(this._filters);
    }
  }

  onEmployeeTypeChange($event: any) {
    if (!isNullOrUndefined($event.SelectedValue) && $event.SelectedValue !== "") {
      this._setFilters('employeesByNoEmailFilter', $event.SelectedValue.toString());
    }

    else {
      this._filters.delete('employeesByNoEmailFilter');
      this._employeeManageService.LoadEmployeesOnFilterChange(this._filters);
    }
  }

  onUserTypeChange($event: any) {
    if (!isNullOrUndefined($event.SelectedValue) && $event.SelectedValue !== "") {
      this._setFilters('employeesByHasUserFilter', $event.SelectedValue.toString());
    }

    else {
      this._filters.delete('employeesByHasUserFilter');
      this._employeeManageService.LoadEmployeesOnFilterChange(this._filters);
    }
  }


  onDepartmentFilterChanged($event: any) {

    const statusFilterValues = $event.map((selectItem => selectItem.Value));
    if (!isNullOrUndefined(statusFilterValues)) {
      this._setFilters('employeesByDepartmentFilter', statusFilterValues.toString());
    }
    else {
      this._setFilters('employeesByDepartmentFilter', '');
    }
  }



  onDepartmentFilterCleared($event: any) {
    this._setFilters('employeesByDepartmentFilter', '');

  }


  onLocationFilterChanged($event: any) {
    const statusFilterValues = $event.map((selectItem => selectItem.Value));
    if (!isNullOrUndefined(statusFilterValues)) {
      this._setFilters('employeesByLocationFilter', statusFilterValues.toString());
    }
    else {
      this._setFilters('employeesByLocationFilter', '');
    }
  }



  onLocationFilterCleared($event: any) {
    this._setFilters('employeesByLocationFilter', '');

  }

  onViewEmployeeDetails(employee: Employee) {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    }
    let navigateUrl = "/employee/edit/" + employee.Id + "/personal";
    this._router.navigate([navigateUrl], navigationExtras);
    window.scrollTo(0, 0);
  }

  /**
 * Method to navigate on clicking logo
 * 
 * @private
 * 
 * @memberOf BaseLayoutComponent
 */
  private redirectTo(): void {
    this._router.navigateByUrl("");
  }

  private _onPopOverRequested(message: IMessageVM) {
    if (!isNullOrUndefined(message)) {
      this._popOverVm = message.getDataObject()['vm'];
    } else {
      this._popOverVm = null;
    }
    this._popOverVisibilityChange.next(this._popOverVm);
  }
  // End of private methods

  // Public methods
  // End of public methods
  // For Reference
  @ViewChild(AeTemplateComponent)
  popOverTemplate: AeTemplateComponent<any>;
  private _pvm: PopoverVm<any>;

  ngAfterContentInit(): void {
    this._pvm = createPopOverVm<any>(this.popOverTemplate, {});
  }
  // Reference Over
  _getViewModelForPopUp(rowData: any) {
    this._pvm = createPopOverVm<any>(this.popOverTemplate, { rowData });
  }
}
