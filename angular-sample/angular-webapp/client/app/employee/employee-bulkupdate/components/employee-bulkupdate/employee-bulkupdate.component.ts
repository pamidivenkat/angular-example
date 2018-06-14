import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { BaseComponent } from "../../../../shared/base-component";
import { LocaleService, TranslationService } from "angular-l10n";
import { ClaimsHelperService } from "../../../../shared/helpers/claims-helper";
import { Router, NavigationExtras } from "@angular/router";
import { MessengerService } from "../../../../shared/services/messenger.service";
import * as fromRoot from '../../../../shared/reducers';
import { Store } from "@ngrx/store";
import { AtlasApiRequestWithParams, AtlasParams } from "../../../../shared/models/atlas-api-response";
import { Observable } from "rxjs/Observable";
import * as Immutable from 'immutable';
import { DataTableOptions } from "../../../../atlas-elements/common/models/ae-datatable-options";
import { SortDirection, AeSortModel } from "../../../../atlas-elements/common/models/ae-sort-model";
import { isNullOrUndefined } from "util";
import { EmployeeBulkUpdateLoadEmployeesAction, EmployeeBulkUpdateCompleteAction, EmployeeBulkUpdateAction, EmployeeBulkUpdateAutoSaveAction } from "../../actions/employee-bulkupdate.actions";
import { AePageChangeEventModel } from "../../../../atlas-elements/common/models/ae-page-change-event-model";
import { UserProfile, EthnicGroup } from "../../../../shared/models/lookup.models";
import { AeSelectItem } from "../../../../atlas-elements/common/models/ae-select-item";
import { Subscription } from "rxjs/Subscription";
import { AeInputType } from "../../../../atlas-elements/common/ae-input-type.enum";
import { StringHelper } from "../../../../shared/helpers/string-helper";
import { isNiNumberValid, isUserNameHasValidPattern, isValidEmail, isValidName } from "../../../employee-import/common/employee-import-validators";
import { AeSelectEvent } from "../../../../atlas-elements/common/ae-select.event";
import { AeDatatableComponent } from "../../../../atlas-elements/ae-datatable/ae-datatable.component";
import { getAeSelectItemsFromEnum, mapEthnicgroupsToAeSelectItems, mapLookupTableToAeSelectItems } from "../../../common/extract-helpers";
import { Gender } from "../../../common/gender.enum";
import { SalutationCode } from "../../../common/salutationcode.enum";
import { LoadJobTitleOptioAction, LoadSitesAction, LoadAllDepartmentsAction, LoadUserProfilesAction, LoadEmployeeGroupAction } from "../../../../shared/actions/company.actions";
import { EmployeeEthinicGroupLoadAction, EmploymentTypeLoadAction, LoadPeriodOptionAction } from "../../../../shared/actions/lookup.actions";
import { HolidayUnitType, EmployeeGroup } from "../../../../shared/models/company.models";
import { mapSiteLookupTableToAeSelectItems } from "../../../../shared/helpers/extract-helpers";
import { Department, Site } from "../../../../calendar/model/calendar-models";
import { AeDatasourceType } from "../../../../atlas-elements/common/ae-datasource-type";
import { MessageType } from "../../../../atlas-elements/common/ae-message.enum";
import * as fromConstants from '../../../../shared/app.constants';
import { AeIconSize } from "../../../../atlas-elements/common/ae-icon-size.enum";
import { LoadApplicableSitesAction, LoadApplicableDepartmentsAction } from '../../../../shared/actions/user.actions';
import { JobHistory } from '../../../models/job-history';
import { EmployeePayrollDetails } from '../../../models/employee.model';
import { BehaviorSubject } from 'rxjs/Rx';
@Component({
  selector: 'employee-bulkupdate',
  templateUrl: './employee-bulkupdate.component.html',
  styleUrls: ['./employee-bulkupdate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeBulkupdateComponent extends BaseComponent implements OnInit, OnDestroy {
  private _apiRequestParams: AtlasApiRequestWithParams;
  private _bulkUpdateEmployeesData$: Observable<Immutable.List<any>>;
  private _totalEmployeesCount$: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  private _totalCount: number; // to reset value on auto save so that icon gets updated in first column
  private _totalEmployeesCountSub: Subscription;
  private _defaultDataTableOptions$: Observable<DataTableOptions>;
  private _loadingStatus$: Observable<boolean>;
  private _employeeTitles: Immutable.List<AeSelectItem<number>>;
  private _genderList: Immutable.List<AeSelectItem<number>>;
  private _jobTitleOptionList: AeSelectItem<string>[];
  private _jobTitleSubscription$: Subscription;
  private _jobTitleStatusSubscription$: Subscription;
  private _inputTypeNumber: AeInputType = AeInputType.number;
  private _ethnicGroupData: Immutable.List<AeSelectItem<string>>;
  private _ethnicGroups: Array<EthnicGroup>;
  private _ethnicGroupSubscription$: Subscription;
  private _holidayUnitTypeDataSelectList: Immutable.List<AeSelectItem<number>>;
  private _departmentDataSelectList: Immutable.List<AeSelectItem<string>>;
  private _departmentSubscription$: Subscription;
  private _siteDataSelectList: Immutable.List<AeSelectItem<string>>;
  private _siteSubscription$: Subscription;
  private _sitesLoadedSubscription$: Subscription;
  private _departmentsLoadedSubscription$: Subscription;
  private _employmentTypesLoadedSubscription$: Subscription;
  private _employmentTypeDataSelectList: Immutable.List<AeSelectItem<string>>;
  private _employmenttypeSubscription$: Subscription;
  private _employeePeriodOptionList: Immutable.List<AeSelectItem<string>>;
  private _employeePeriodOptionsSubscription$: Subscription;
  private _employeePeriodLoaded$: Subscription;
  private _userProfilesLoadedSubscription$: Subscription;
  private _userProfilesOptionsList$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _userProfilesList$: Subscription;
  private _userProfiles: Array<UserProfile>;
  private _employees: Array<any>;
  private _dataSubscription: Subscription;
  private _dataLoadingSubscription: Subscription;
  private _inputType: AeInputType;
  private _searchDebounce: number;
  private _filters: Map<string, string>;
  private _employeeTypes: Immutable.List<AeSelectItem<string>>;
  private _departments: Department[];
  private _locations: Site[];
  private _dataSourceType: AeDatasourceType;
  private _employeeGroupSubscription$: Subscription;
  private _employeeGroups: EmployeeGroup[];
  private _bulkUpdateStatusSubscription: Subscription;
  private _bulkUpdateStatusMessageSubscription: Subscription;
  private _updateStatus: boolean;
  private _message: string;
  private _messagetType = MessageType.Error;
  private autoSaveCompleteSubscription: Subscription;
  private _showAll: boolean = true;
  private _isOpen: boolean = false;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _isSubmitted: boolean;
  private _dsType: AeDatasourceType = AeDatasourceType.Local;
  private _employeewithoutEmailPopup: boolean = false;
  private _showErrorMessage: boolean;
  private _addressIconSize: AeIconSize = AeIconSize.tiny;
  private _keys = Immutable.List([
    'Title', 'FirstName', 'Surname', 'MiddleName', 'KnownAs', 'DOB', 'PersonalEmail',
    'HasEmail', 'CreateUser', 'Email', 'UserName', 'UserProfileId', 'UserProfiles',
    'Gender', 'Job', 'EmployeeNumber', 'Nationality',
    'EmployeePayrollDetails', 'PreviousName', 'EthnicGroups',
    'EthnicGroup', 'EmploymentTypeId', 'Errors', 'HasUser', 'SelectedUserProfiles'
  ]);
  private _optionalColumns = Immutable.List([
    { Name: 'Middle name(s)', Key: 4, Show: true },
    { Name: 'Known as', Key: 5, Show: true },
    { Name: 'Create User', Key: 9, Show: true },
    { Name: 'Gender', Key: 14, Show: true },
    { Name: 'Department', Key: 28, Show: true },
    { Name: 'Location / site', Key: 30, Show: true },
    { Name: 'Employment Type', Key: 29, Show: true },
    { Name: 'Employee Number', Key: 17, Show: true },
    { Name: 'Holiday Entitlement', Key: 25, Show: true },
    { Name: 'Probationary Period', Key: 26, Show: true },
    { Name: 'Tax Code', Key: 22, Show: true },
    { Name: 'Home Based', Key: 27, Show: true },
    { Name: 'Ethnicity', Key: 23, Show: true }
  ]);

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Employees;
  }
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _router: Router
    , private _messenger: MessengerService
    , private _breadcrumbService: BreadcrumbService
  ) {
    super(_localeService, _translationService, _cdRef);
    this._searchDebounce = 400;
    this._inputType = AeInputType.search;
    this._isSubmitted = false;
  }


  @ViewChild(AeDatatableComponent)
  dataTable: AeDatatableComponent<any>;

  //Private methods
  private _setEhnicityValue(ethnicGroup: any, rowIndex: number) {
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee)) {
      if (!isNullOrUndefined(employee.EthnicGroup)) {
        employee.EthnicGroup = Object.assign({}, employee.EthnicGroup, {
          EthnicGroupValueId: '',
          EthnicGroupTypeId: '',
          EthnicGroupValueType: '',
          Name: '',
          Id: employee.EthnicGroup.Id,
          CreatedBy: employee.EthnicGroup.CreatedBy,
          ModifiedBy: employee.EthnicGroup.ModifiedBy,
          CreatedOn: employee.EthnicGroup.CreatedOn,
          ModifiedOn: employee.EthnicGroup.ModifiedOn,
          CompanyId: employee.EthnicGroup.CompanyId,
          EmployeeId: employee.EthnicGroup.EmployeeId,
        });
      }
      else {
        employee.EthnicGroup = {};
      }
      if (!isNullOrUndefined(ethnicGroup)) {
        employee.EthnicGroup = Object.assign({}, employee.EthnicGroup, {
          EthnicGroupValueId: ethnicGroup.Id,
          EthnicGroupTypeId: ethnicGroup.EthnicGroupTypeId,
          EthnicGroupValueType: ethnicGroup.EthnicGroupValueType,
          Name: ethnicGroup.Name
        });
      }

    }
  }

  private _updateContextValue(context, property, value) {
    let props = property.split('.');
    let employee = this._getEmployeesByIndex(context.Row);
    if (props.length > 1) {
      let nestedObj = props[0];
      let prop = props[1];
      if (!isNullOrUndefined(employee[nestedObj])) {
        employee[nestedObj][prop] = value;
      }
    }
    else {

      employee[property] = value;
    }
    employee.Changed = true;
  }

  public inputPropertyAutoSave($event, context, property) {
    if (!isNullOrUndefined($event) && !isNullOrUndefined($event.event)) {
      if (!isNullOrUndefined($event.event.target)) {
        let value = $event.event.target.value;
        let props = property.split('.');
        let employee = this._getEmployeesByIndex(context.Row);
        if (props.length > 1) {
          let nestedObj = props[0];
          let prop = props[1];
          if (!isNullOrUndefined(employee[nestedObj])) {
            employee[nestedObj][prop] = value;
          }
        } else {
          employee[property] = value;
        }
        this.autoSave(context.Row);
      }
    }
  }

  private _hasValue(rowIndex, property): boolean {
    let fieldValue = this.getFieldValue(rowIndex, property);
    return !isNullOrUndefined(fieldValue) && !StringHelper.isNullOrUndefinedOrEmpty(String(fieldValue));
  }



  //Validator Functions
  fieldHasRequiredError(rowIndex, property): boolean {
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee))
      return !(this._hasValue(rowIndex, property)) && (employee.Changed === true || this._isSubmitted === true);
  }

  hasInvalidNameError(rowIndex, property): boolean {
    let fieldValue = this.getFieldValue(rowIndex, property);
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee))
      return !isValidName(fieldValue) && (employee.Changed === true || this._isSubmitted === true);
  }

  fieldHasInvalidEmail(rowIndex, property): boolean {
    let fieldValue = this.getFieldValue(rowIndex, property);
    let isValid = isValidEmail(fieldValue);
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee)) {
      if (property === 'Email') {
        let hasEmail = this.getFieldValue(rowIndex, 'HasEmail');
        return !isValidEmail(fieldValue) && hasEmail && (employee.Changed === true || this._isSubmitted === true);
      }

      return !isValidEmail(fieldValue) && (employee.Changed === true || this._isSubmitted === true);
    }
  }

  fieldHasRequiredEmailError(rowIndex, property): boolean {
    let fieldValue = this.getFieldValue(rowIndex, property);
    let hasEmail = this.getFieldValue(rowIndex, 'HasEmail');
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee))
      return this.fieldHasRequiredError(rowIndex, property) && hasEmail && (employee.Changed === true || this._isSubmitted === true);
  }

  fieldHasRequiredUserName(rowIndex, property): boolean {
    let fieldValue = this.getFieldValue(rowIndex, property);
    let hasEmail = this.getFieldValue(rowIndex, 'HasEmail');
    let createUser = this.getFieldValue(rowIndex, 'CreateUser');
    if ((this._isSubmitted === false) || hasEmail || !createUser) return false;
    return this.fieldHasRequiredError(rowIndex, property);
  }

  isUserNameHasInValidPattern(rowIndex, property): boolean {
    let fieldValue = this.getFieldValue(rowIndex, property);
    let employee = this._getEmployeesByIndex(rowIndex);
    return !isUserNameHasValidPattern(fieldValue) && (employee.Changed === true || this._isSubmitted === true);
  }


  isNiNumberInValid(rowIndex, property): boolean {
    let fieldValue = this.getFieldValue(rowIndex, property);
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee))
      return !isNiNumberValid(fieldValue) && (employee.Changed === true || this._isSubmitted === true);
  }

  fieldHasRequiredUserProfileError(rowIndex, property) {
    let fieldValue = this.getFieldValue(rowIndex, property);
    let createUser = this.getFieldValue(rowIndex, 'CreateUser');
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee))
      return this.fieldHasRequiredError(rowIndex, property) && createUser && (employee.Changed === true || this._isSubmitted === true);
  }

  isOtherEmploymentRequired(rowIndex) {
    let employmentTypeId = this.getFieldValue(rowIndex, 'EmploymentTypeId');
    let otherEmploymentTypeValue = this.getFieldValue(rowIndex, 'Job.OtherEmployeeType');
    if (!StringHelper.isNullOrUndefinedOrEmpty(otherEmploymentTypeValue)) return false;
    if (!isNullOrUndefined(employmentTypeId) && employmentTypeId === fromConstants.otherEmploymentTypeId) {
      return this.fieldHasRequiredError(rowIndex, 'Job.OtherEmployeeType');
    }
    return false;
  }

  isOtherEmploymentReadOnly(rowIndex) {
    let employmentTypeId = this.getFieldValue(rowIndex, 'EmploymentTypeId');
    if (!isNullOrUndefined(employmentTypeId) && employmentTypeId === fromConstants.otherEmploymentTypeId) {
      return false;
    }
    return true;
  }

  fieldHasInvalidWeekDays(rowIndex: number) {
    let employee = this._getEmployeesByIndex(rowIndex);
    let isValid = true;
    if (!isNullOrUndefined(employee) && !isNullOrUndefined(employee.Job)) {
      let fieldValue = employee.Job.Days;
      if (isNullOrUndefined(fieldValue)) return false;
      let days = Number(fieldValue);
      isValid = (days >= 0 && days <= 7) ? true : false;
    }

    return !isValid && (this._isSubmitted === true);
  }

  fieldHasInvalidHours(rowIndex: number) {
    let employee = this._getEmployeesByIndex(rowIndex);
    let isValid = true;
    if (!isNullOrUndefined(employee) && !isNullOrUndefined(employee.Job)) {
      let fieldValue = employee.Job.HoursAWeek;
      if (isNullOrUndefined(fieldValue)) return false;
      let days = Number(fieldValue);
      isValid = (days >= 1 && days <= 168) ? true : false;
    }
    if (!isNullOrUndefined(employee))
      return !isValid && (employee.Changed === true || this._isSubmitted === true);
  }

  fieldHasInvalidProbationaryPeriod(rowIndex: number) {
    let employee = this._getEmployeesByIndex(rowIndex);
    let isValid = true;
    if (!isNullOrUndefined(employee) && !isNullOrUndefined(employee.Job)) {
      let fieldValue = employee.Job.ProbationaryPeriod;
      if (isNullOrUndefined(fieldValue)) return false;
      let days = Number(fieldValue);
      isValid = (days >= 0 && days <= 24) ? true : false;
    }
    if (!isNullOrUndefined(employee))
      return !isValid && (employee.Changed === true || this._isSubmitted === true);
  }

  fieldHasInvalidEntitlementPeriod(rowIndex: number) {
    let employee = this._getEmployeesByIndex(rowIndex);
    let isValid = true;
    if (!isNullOrUndefined(employee) && !isNullOrUndefined(employee.Job)) {
      let fieldValue = employee.Job.HolidayEntitlement;
      if (isNullOrUndefined(fieldValue)) return false;
      let days = Number(fieldValue);
      isValid = (days >= 0 && days <= 300) ? true : false;
    }
    if (!isNullOrUndefined(employee))
      return !isValid && (employee.Changed === true || this._isSubmitted === true);
  }


  private _validateEmployee(rowIndex: number): boolean {
    let isEmployeeValid = true;
    this._keys.forEach((key) => {
      switch (key) {
        case 'Title':
        case 'DOB':
          isEmployeeValid = isEmployeeValid && !this.fieldHasRequiredError(rowIndex, key);
          if (!isEmployeeValid) return isEmployeeValid;
          break;

        case 'FirstName':
        case 'Surname':
        case 'Nationality':
          isEmployeeValid = isEmployeeValid
            && !this.fieldHasRequiredError(rowIndex, key)
            && !this.hasInvalidNameError(rowIndex, key);
          if (!isEmployeeValid) return isEmployeeValid;
          break;

        case 'Email':
          isEmployeeValid = isEmployeeValid
            && !this.fieldHasRequiredEmailError(rowIndex, key)
            && !this.fieldHasInvalidEmail(rowIndex, key);
          if (!isEmployeeValid) return isEmployeeValid;
          break;

        case 'UserName':
          isEmployeeValid = isEmployeeValid
            && !this.fieldHasRequiredUserName(rowIndex, key);
          if (!isEmployeeValid) return isEmployeeValid;
          break;

        case 'UserProfiles':
          isEmployeeValid = isEmployeeValid
            && !this.fieldHasRequiredUserProfileError(rowIndex, key);
          if (!isEmployeeValid) return isEmployeeValid;
          break;

        case 'EmployeePayrollDetails': {
          isEmployeeValid = isEmployeeValid
            && !this.isNiNumberInValid(rowIndex, 'EmployeePayrollDetails.NINumber');
          if (!isEmployeeValid) return isEmployeeValid;
        }
          break;

        case 'EmploymentTypeId': {
          isEmployeeValid = isEmployeeValid
            && !this.isOtherEmploymentRequired(rowIndex);
          if (!isEmployeeValid) return isEmployeeValid;
        }
          break;

        case 'Job': {
          isEmployeeValid = isEmployeeValid
            && !this.fieldHasInvalidHours(rowIndex)
            && !this.fieldHasInvalidWeekDays(rowIndex)
            && !this.fieldHasInvalidProbationaryPeriod(rowIndex)
            && !this.fieldHasInvalidEntitlementPeriod(rowIndex);
          if (!isEmployeeValid) return isEmployeeValid;
        }
          break;
      }

    });

    if (this.showOtherEthinicty(rowIndex)) {
      let fieldValue = this.getFieldValue(rowIndex, 'EthnicGroup.Name')
      isEmployeeValid = isEmployeeValid
        && !isNullOrUndefined(fieldValue)
        && !StringHelper.isNullOrUndefinedOrEmpty(String(fieldValue));
    }
    return isEmployeeValid;
  }

  _isRowHasErrors = (context: any) => !this._validateEmployee(context.Row);
  highLightErrorRow = (context: any) => this._isRowHasErrors(context);

  getDate(rowIndex, property) {
    let value = this.getFieldValue(rowIndex, property);
    if (!isNullOrUndefined(value) && !StringHelper.isNullOrUndefinedOrEmpty(String(value))) {
      return new Date(value);
    }
    return value;
  }

  getOtherEmploymentDetails(rowIndex: number) {
    let value = this.getFieldValue(rowIndex, 'Job.OtherEmployeeType');
    if (!isNullOrUndefined(value)) {
      return value;
    }
    return '';
  }

  //End of Validator Functions

  private _getEmployees(): Array<any> {
    if (isNullOrUndefined(this._employees)) {
      let context = this.dataTable.getContext();
      if (!isNullOrUndefined(context)) {
        this._employees = context.toArray();
      }
    }
    return this._employees;
  }

  private _getEmployeesByIndex(index: number) {
    let employees = this._getEmployees();
    let employee = employees[index];
    return employee;
  }

  employeeHasErrors(rowIndex: number): boolean {
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee)) {
      return !isNullOrUndefined(employee.Errors) && (employee.Errors.length > 0);
    }

    return false;
  }

  getEmployeeErrorMessage(rowIndex: number): string {
    let displayErrorString = '';
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee)) {
      if (!isNullOrUndefined(employee.Errors) && (employee.Errors.length > 0)) {
        for (var index = 0; index < employee.Errors.length; index++) {
          if (index > 0) {
            displayErrorString += '</br>';
          }
          displayErrorString += employee.Errors[index];
        }
      }
    }
    if (employee.Changed == true)
      return (displayErrorString.length == 0) ? "Unsaved changes" : displayErrorString;
    if (employee.Changed == false)
      return displayErrorString.length == 0 ? "" : displayErrorString;
    else
      return (displayErrorString.length == 0) ? "No changes made" : displayErrorString;

  }

  bulkUpdate() {
    let employees = this._getEmployees();
    if (!isNullOrUndefined(employees)) {
      this._isSubmitted = true;
      let valid = true;
      let noEmailUsers = employees.filter(function (item) {
        return !item.HasUser && item.CreateUser && !item.HasEmail;
      })
      if (noEmailUsers && noEmailUsers.length > 0) {
        this._employeewithoutEmailPopup = true;
      }
      else {
        employees.forEach((emp, index) => {
          valid = valid && this._validateEmployee(index);
        });
        if (valid) {
          this._store.dispatch(new EmployeeBulkUpdateAction(employees));
        }
      }
    }
  }


  autoSave(rowIndex: number) {
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee) && employee.Changed === true) {
      let isValid = true;
      employee.Errors = [];
      isValid = this._validateEmployee(rowIndex);
      if (isValid) {
        if (!isNullOrUndefined(employee)) {
          this._store.dispatch(new EmployeeBulkUpdateAutoSaveAction(employee));
        }
      }
    }

  }

  private _viewImportHistory() {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    this._router.navigate(['employee/import/history'], navigationExtras);
  }



  private _loadEmployees() {
    if (isNullOrUndefined(this._apiRequestParams))
      this._apiRequestParams = <AtlasApiRequestWithParams>{};
    this._apiRequestParams.PageNumber = 1;
    this._apiRequestParams.PageSize = 10;
    this._store.dispatch(new EmployeeBulkUpdateLoadEmployeesAction(this._apiRequestParams));
  }
  onPageChange(pagingInfo: AePageChangeEventModel) {
    this._apiRequestParams.PageNumber = pagingInfo.pageNumber;
    this._apiRequestParams.PageSize = pagingInfo.noOfRows;
    this._store.dispatch(new EmployeeBulkUpdateLoadEmployeesAction(this._apiRequestParams));
  }
  private _onFilterChange(key: string, value: string) {
    let param = new AtlasParams(key, value);
    if (this._apiRequestParams.Params.findIndex(k => k.Key === key) != -1) {
      this._apiRequestParams.Params.splice(this._apiRequestParams.Params.findIndex(k => k.Key === key), 1);
    }
    if (!StringHelper.isNullOrUndefinedOrEmpty(value)) {
      this._apiRequestParams.Params.push(param);
    }
    this._apiRequestParams.PageNumber = 1;
    this._apiRequestParams.PageSize = 10;
    this._store.dispatch(new EmployeeBulkUpdateLoadEmployeesAction(this._apiRequestParams));

  }


  // all filter functions
  onSearchTextChange($event: any) {
    if (!isNullOrUndefined($event.event.target.value && $event.event.target.value !== "")) {
      this._onFilterChange('employeesByNameOrEmailFilter', $event.event.target.value);
    } else {
      this._onFilterChange('employeesByNameOrEmailFilter', '');
    }
  }

  onEmployeeTypeChange($event: any) {
    if (!isNullOrUndefined($event.SelectedValue) && $event.SelectedValue !== "") {
      this._onFilterChange('employeesByNoEmailFilter', $event.SelectedValue.toString());
    } else {
      this._onFilterChange('employeesByNoEmailFilter', '');
    }
  }
  onDepartmentFilterChanged($event: any) {
    const statusFilterValues = $event.map((selectItem => selectItem.Value));
    if (!isNullOrUndefined(statusFilterValues)) {
      this._onFilterChange('employeesByDepartmentFilter', statusFilterValues.toString());
    }
    else {
      this._onFilterChange('employeesByDepartmentFilter', '');
    }
  }
  onDepartmentFilterCleared($event: any) {
    this._onFilterChange('employeesByDepartmentFilter', '');
  }
  onLocationFilterChanged($event: any) {
    const statusFilterValues = $event.map((selectItem => selectItem.Value));
    if (!isNullOrUndefined(statusFilterValues)) {
      this._onFilterChange('employeesByLocationFilter', statusFilterValues.toString());
    }
    else {
      this._onFilterChange('employeesByLocationFilter', '');
    }
  }
  onLocationFilterCleared($event: any) {
    this._onFilterChange('employeesByLocationFilter', '');
  }
  onEmployeeGroupFilterChanged($event: any) {
    const statusFilterValues = $event.map((selectItem => selectItem.Value));
    if (!isNullOrUndefined(statusFilterValues)) {
      this._onFilterChange('employeeByGroupFilter', statusFilterValues.toString());
    }
    else {
      this._onFilterChange('employeeByGroupFilter', '');
    }
  }
  onEmployeeGroupFilterCleared($event: any) {
    this._onFilterChange('employeeByGroupFilter', '');
  }

  showMessage(): boolean {
    if (!isNullOrUndefined(this._message)) {
      return this._showErrorMessage;
    }

    return false;

  }

  hideMessage() {
    this._showErrorMessage = false;
  }

  showAutoSaveStatusIcon(rowIndex: number): boolean {
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee)) {
      return employee.Changed === false || employee.Changed === true;
    }
    return false;
  }

  getAutoSaveIcon(rowIndex: number): string {
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee)) {
      return employee.Changed === false ? 'icon-alert-circle-tick' : 'icon-alert-triangle';
    }

    return '';
  }

  getAutoSaveStatusMessage(rowIndex: number): string {
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee)) {
      return employee.Changed === false ? 'Saved successfully' : 'Not yet saved';
    }

    return '';
  }

  getAutoSaveIconColour(rowIndex: number): string {
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee)) {
      return employee.Changed === false ? 'green' : 'red';
    }

    return '';
  }

  showColumns() {
    let arr;
    if (this._showAll) {
      arr = this._optionalColumns.map(m => m.Key).toArray();
    }
    else {
      arr = this._optionalColumns.filter(function (obj) {
        return obj.Show == false;
      }).map(function (obj) { return obj.Key; }).toArray();
    }

    this.dataTable.visibleColumns.next(arr);
    this._optionalColumns.forEach(element => {
      element.Show = !this._showAll;
    });
    this._showAll = !this._showAll;
  }
  setHideShowColumn(key) {
    this.dataTable.visibleColumns.next([key]);
    this._optionalColumns.forEach(element => {
      if (element.Key == key) {
        element.Show = !element.Show;
      }
    });
    let items = this._optionalColumns.filter(function (item) {
      return item.Show == true;
    });
    if (items && items.count() == this._optionalColumns.count()) {
      this._showAll = true;
    }
    else {
      this._showAll = false;
    }
  }
  getOpen(): boolean {
    return this._isOpen;
  }
  getOptionalColumnOpen(event) {
    this._isOpen = this._isOpen ? false : true;
  }
  getEmployeewithoutEmailPopup() {
    return this._employeewithoutEmailPopup;
  }

  modalClosed() {
    this._employeewithoutEmailPopup = false;
  }
  onEmployeewithoutEmail(e) {
    this._employeewithoutEmailPopup = false;
    this._isSubmitted = true;
    let isValid = true;
    let employees = this._getEmployees();
    employees.forEach((emp, index) => {
      isValid = isValid && this._validateEmployee(index);
    });
    if (isValid) {
      this._store.dispatch(new EmployeeBulkUpdateAction(employees));
    }
  }
  //Public properties
  get message(): string {
    return this._message;
  }
  get messagetType() {
    return this._messagetType;
  }
  get searchDebounce() {
    return this._searchDebounce;
  }
  get inputType() {
    return this._inputType;
  }

  get employeeTypes() {
    return this._employeeTypes;
  }

  get departmentsData() {
    return this._departments;
  }

  get dataSourceType() {
    return this._dataSourceType;
  }

  get locations() {
    return this._locations;
  }

  get employeeGroups() {
    return this._employeeGroups;
  }

  get showAll() {
    return this._showAll;
  }

  get optionalColumns() {
    return this._optionalColumns;
  }

  get bulkUpdateEmployeesData$() {
    return this._bulkUpdateEmployeesData$;
  }

  get totalEmployeesCount$() {
    return this._totalEmployeesCount$;
  }

  get defaultDataTableOptions$() {
    return this._defaultDataTableOptions$;
  }

  get loadingStatus$() {
    return this._loadingStatus$;
  }

  get keys() {
    return this._keys;
  }

  get addressIconSize() {
    return this._addressIconSize;
  }
  get employeeTitles() {
    return this._employeeTitles;
  }

  get departmentDataSelectList() {
    return this._departmentDataSelectList;
  }

  get employmentTypeDataSelectList() {
    return this._employmentTypeDataSelectList;
  }
  get siteDataSelectList() {
    return this._siteDataSelectList;
  }

  get inputTypeNumber() {
    return this._inputTypeNumber;
  }

  get userProfilesOptionsList$() {
    return this._userProfilesOptionsList$;
  }

  get userProfiles() {
    return this._userProfiles;
  }
  get ethnicGroupData() {
    return this._ethnicGroupData;
  }

  get holidayUnitTypeDataSelectList() {
    return this._holidayUnitTypeDataSelectList;
  }

  get jobTitleOptionList() {
    return this._jobTitleOptionList;
  }
  get dsType() {
    return this._dsType;
  }
  get userProfileDatasourceType() {
    return AeDatasourceType.Local;
  }
  //End of public properties

  //Public methods
  setInputPropertyValue($event, context, property) {
    if (!isNullOrUndefined($event) && !isNullOrUndefined($event.event)) {
      if (!isNullOrUndefined($event.event.target)) {
        // this._updateContextValue(context, property, $event.event.target.value);
        let employee = this._getEmployeesByIndex(context.Row);
        employee.Changed = true;
      }
    }
  }

  setSelectPropertyValue($event: AeSelectEvent<any>, context, property) {
    if (!isNullOrUndefined($event)) {
      this._updateContextValue(context, property, $event.SelectedValue);
      let employee = this._getEmployeesByIndex(context.Row);
      if (!isNullOrUndefined(employee.Job.SiteId)) {
        let changedSite = this._locations.find(site => site.Id === employee.Job.SiteId)
        if (changedSite)
          context.Job.Site = changedSite;
      }
      if (!isNullOrUndefined(employee.Job.DepartmentId)) {
        let changedDepartment = this._departments.find(department => department.Id === employee.Job.DepartmentId)
        if (changedDepartment)
          context.Job.Department = changedDepartment;
      }
      this.autoSave(context.Row);
    }
  }

  setInputSwitchPropertyValue(value, context, property) {
    this._updateContextValue(context, property, value);
    this.autoSave(context.Row);
  }

  setInputSwitchPropertyValueToAll(value) {
    this._employees.forEach(obj => {
      if (obj.HasUser === false) {
        obj.CreateUser = value;
        obj.Changed = true;
      }
    });
  }

  setEmploymentTypeValue($event: AeSelectEvent<any>, context, property) {
    if (!isNullOrUndefined($event)) {
      this._updateContextValue(context, property, $event.SelectedValue);
      this._updateContextValue(context, 'Job.OtherEmployeeType', '');
    }
  }
  setDateValue(value, context, property) {
    this._updateContextValue(context, property, value);
    this.autoSave(context.Row);
  }

  getCreateUserAllStatus(): boolean {
    if (!isNullOrUndefined(this._employees)) {
      let _createUserEmployees = this._employees.filter(obj => obj.CreateUser == true || obj.HasUser == true);
      return _createUserEmployees.length == this._employees.length;
    }
    return false;
  }

  onEthnicityChange(e: AeSelectEvent<string>, context, property) {
    this.setSelectPropertyValue(e, context, property);
    if (!isNullOrUndefined(e.SelectedItem)) {
      let ethnicGroup = this._ethnicGroups.filter(c => c.Id == e.SelectedValue)[0];
      let employee = this._getEmployeesByIndex(context.Row);
      this._setEhnicityValue(ethnicGroup, context.Row);
      employee.Changed = true;
      this.autoSave(context.Row);
    }
  }

  onProfileChanged($event: any, rowNumber: number) {
    let employee = this._getEmployeesByIndex(rowNumber);
    if (isNullOrUndefined(employee)) return;
    if (!isNullOrUndefined($event)) {
      employee.UserProfiles = [];
      $event.map((selectItem => {
        let profile = this._userProfiles.find(p => p.Id === selectItem.Value);
        if (!isNullOrUndefined(profile)) {
          employee.UserProfiles.push(profile);
        }
      }));

    }
    else {
      employee.UserProfiles = null;
    }
    employee.Changed = true;
    //trigger auto save
    this.autoSave(rowNumber);
  }
  onClearSelectedProfile($event: any, rowNumber: number) {
    let employee = this._getEmployeesByIndex(rowNumber);
    if (!isNullOrUndefined(employee)) {
      employee.UserProfiles = null;
      employee.Changed = true;
    }
    //trigger auto save
    this.autoSave(rowNumber);
  }
  onHasEmailChanged(value, context, property) {
    let employee = this._getEmployeesByIndex(context.Row);
    if (!isNullOrUndefined(employee)) {
      employee.HasEmail = value;
      if (employee.HasEmail === false) {
        employee.Email = '';
      }
      employee.Changed = true;
    }
  }

  onJobTitleChanged($event: any, rowNumber: number) {
    if (!isNullOrUndefined($event) && !isNullOrUndefined($event[0])) {
      let employee = this._getEmployeesByIndex(rowNumber);
      if (!isNullOrUndefined(employee.Job)) {
        employee.Job.JobTitle = Object.assign({}, employee.Job.JobTitle, {
          Id: $event[0].Value,
          Name: $event[0].Text
        });
      }
    }
    this.autoSave(rowNumber);
  }

  onJobTitleBlur($event: any, rowNumber: number) {
       this.autoSave(rowNumber);
  }

  onJobTitleSearchChange(title: string, rowIndex: number) {
    let employee = this._getEmployeesByIndex(rowIndex);
    if (StringHelper.isNullOrUndefinedOrEmpty(title)) {
      if (!isNullOrUndefined(employee.Job)) {
        employee.Job.JobTitle = {};
      }
    } else {
      let jobTitle = this._jobTitleOptionList.find(t => t.Text === title);
      if (!isNullOrUndefined(jobTitle)) {
        employee.Job.JobTitle = Object.assign({}, employee.Job.JobTitle, {
          Id: jobTitle.Value,
          Name: jobTitle.Text
        });
      } else {
        if (!isNullOrUndefined(employee.Job)) {
          employee.Job.JobTitle = { Name: title };
        }
      }

    }
    employee.Changed = true;
  }


  isHasEmailDisable(rowIndex: number): boolean {
    let hasEmail = this.getFieldValue(rowIndex, 'HasEmail');
    let email = this.getFieldValue(rowIndex, 'Email');
    return hasEmail && email;
  }

  isUserNameDisabled(rowIndex: number): boolean {
    let hasEmail = this.getFieldValue(rowIndex, 'HasEmail');
    let createUser = this.getFieldValue(rowIndex, 'CreateUser');
    return !hasEmail && createUser;
  }

  getJobTitle(rowIndex: number) {
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee)) {
      if (!isNullOrUndefined(employee.Job) && !isNullOrUndefined(employee.Job.JobTitle)) {
        return !isNullOrUndefined(employee.Job.JobTitle.Name) ? employee.Job.JobTitle.Name : '';
      } else if (!isNullOrUndefined(employee.Job) && !isNullOrUndefined(employee.Job.JobTitleId)) {
        let jobTitle = this._jobTitleOptionList.find(t => t.Value === employee.Job.JobTitleId);
        if (!isNullOrUndefined(jobTitle)) {
          employee.Job.JobTitle = Object.assign({}, employee.Job.JobTitle, {
            Id: jobTitle.Value,
            Name: jobTitle.Text
          });
          return jobTitle.Text;
        } else {
          employee.Job.JobTitle = {};
        }
      }
    }
    return '';

  }


  showOtherEthinicty(rowIndex): boolean {
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee)) {
      let ethnicGroup = employee.EthnicGroup;
      if (!isNullOrUndefined(ethnicGroup)) {
        if (ethnicGroup.EthnicGroupValueType == 2) {
          return true;
        }
        else {
          employee.EthnicGroup.Name = '';
          return false;
        }
      }
    }

    return false;
  }

  getJobDetails(rowIndex, property) {
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee)) {
      if (isNullOrUndefined(employee.Job))
        employee.Job = new JobHistory();
      return employee.Job[property];
    }
    return '';
  }
  isEmailDisabled(rowIndex: number): boolean {
    let hasEmail = this.getFieldValue(rowIndex, 'HasEmail');
    return !hasEmail;
  }

  getFieldValue(rowIndex, property) {
    let fieldValue;
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee)) {
      if (isNullOrUndefined(employee.EmployeePayrollDetails))
        employee.EmployeePayrollDetails = new EmployeePayrollDetails();
      let props = property.split('.');
      if (props.length > 1) {
        let nestedObj = props[0];
        let prop = props[1];
        if (!isNullOrUndefined(employee[nestedObj])) {
          fieldValue = employee[nestedObj][prop];
        }
      }
      else {
        fieldValue = employee[property];
      }

    }
    else {
      fieldValue = '';
    }
    return fieldValue;
  }


  getEthnicGroupValueId(context) {
    let employee = this._getEmployeesByIndex(context.Row);
    if (!isNullOrUndefined(employee)) {
      let ethnicGroup = employee.EthnicGroup;
      if (!isNullOrUndefined(ethnicGroup)) {
        return ethnicGroup.EthnicGroupValueId;
      }

    }
    return '';
  }

  getSelectedProfiles(rowNumber: number): Array<any> {
    let employee = this._getEmployeesByIndex(rowNumber);
    if (isNullOrUndefined(employee) || isNullOrUndefined(employee.UserProfiles) || isNullOrUndefined(this._userProfiles))
      return [];
    return employee.UserProfiles.map(userProfile => {
      return { Name: userProfile['Name'], Id: userProfile['Id'] };
    });
  }

  //End of public methods

  ngOnInit() {
    this._apiRequestParams = <AtlasApiRequestWithParams>{};
    this._apiRequestParams.Params = [];
    this._dataSourceType = AeDatasourceType.Local;

    this._employeeTypes = Immutable.List([new AeSelectItem<string>('All employees', ''),
    new AeSelectItem<string>('Employees with email', 'true'), new AeSelectItem<string>('Employees without email', 'false')]);

    this._loadEmployees();
    this._bulkUpdateEmployeesData$ = this._store.let(fromRoot.getBulkUpdateEmployeesData);
    this._totalEmployeesCountSub = this._store.let(fromRoot.getBulkUpdateEmployeesCount).subscribe((val) => {
      if (!isNullOrUndefined(val)) {
        this._totalEmployeesCount$.next(val);
        this._totalCount = val;
      }
    });
    this._defaultDataTableOptions$ = this._store.let(fromRoot.getBulkUpdateEmployeesDataTableOptions);
    this._loadingStatus$ = this._store.let(fromRoot.getBulkUpdateEmployeesLoading);
    this._dataSubscription = this._bulkUpdateEmployeesData$.subscribe((employees) => {
      if (!isNullOrUndefined(employees)) {
        let empList = [].splice(0, 0).concat(employees.toArray());
        empList.map(e => {
          if (!isNullOrUndefined(e.UserProfiles)) {
            e.SelectedUserProfiles = e.UserProfiles.map(userProfile => {
              return { Name: userProfile['Name'], Id: userProfile['Id'] };
            });
          } else {
            e.SelectedUserProfiles = [];
          }
          return e;
        })
        this._employees = empList;
        this.dataTable.updatePositions();
      }
    });
    //Dropdown data
    this._employeeTitles = getAeSelectItemsFromEnum(SalutationCode);
    this._genderList = getAeSelectItemsFromEnum(Gender);
    //Dispatch action to load Job Title Option status.
    this._jobTitleStatusSubscription$ = this._store.let(fromRoot.getJobTitleOptionListDataStatus).subscribe((res) => {
      if (!res) {
        this._store.dispatch(new LoadJobTitleOptioAction(true));
      }
    });


    this._jobTitleSubscription$ = this._store.let(fromRoot.getJobTitleOptionListData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._jobTitleOptionList = res;
      }
    });


    this._ethnicGroupSubscription$ = this._store.select(c => c.lookupState.EthnicGroupData).subscribe((ethnicGroupData) => {
      if (!isNullOrUndefined(ethnicGroupData)) {
        this._ethnicGroups = ethnicGroupData;
        this._ethnicGroupData = mapEthnicgroupsToAeSelectItems(this._ethnicGroups);
      } else {
        this._store.dispatch(new EmployeeEthinicGroupLoadAction(true));
      }
    });

    this._holidayUnitTypeDataSelectList = getAeSelectItemsFromEnum(HolidayUnitType);

    this._sitesLoadedSubscription$ = this._store.let(fromRoot.getApplicableSitesLoadingState).subscribe(sitesLoaded => {
      if (!sitesLoaded)
        this._store.dispatch(new LoadApplicableSitesAction(true));
    });

    this._departmentsLoadedSubscription$ = this._store.let(fromRoot.getDepartmentLoadingState).subscribe(departmentsLoaded => {
      if (!departmentsLoaded)
        this._store.dispatch(new LoadApplicableDepartmentsAction());
    });


    this._departmentSubscription$ = this._store.let(fromRoot.getApplicableDepartmentsData).subscribe((departments) => {
      if (!isNullOrUndefined(departments)) {
        this._departmentDataSelectList = mapLookupTableToAeSelectItems(departments);
        this._departments = departments;
      }
    });

    this._siteSubscription$ = this._store.let(fromRoot.getApplicableSitesData).subscribe((sites) => {
      if (!isNullOrUndefined(sites)) {
        this._siteDataSelectList = mapSiteLookupTableToAeSelectItems(sites);
        this._locations = sites;
      }
    });
    this._store.dispatch(new LoadEmployeeGroupAction());
    this._employeeGroupSubscription$ = this._store.let(fromRoot.getAllEmployeeGroupsData).subscribe((employeeGroups) => {
      if (!isNullOrUndefined(employeeGroups)) {
        this._employeeGroups = employeeGroups
      }
    });



    this._employmentTypesLoadedSubscription$ = this._store.let(fromRoot.getEmploymentTypeListLoadingStatus).subscribe(employmentTypesLoaded => {
      if (!employmentTypesLoaded)
        this._store.dispatch(new EmploymentTypeLoadAction(true));
    });

    this._employmenttypeSubscription$ = this._store.let(fromRoot.getEmploymentTypeOptionListData).subscribe((_employmentTypeData) => {
      if (!isNullOrUndefined(_employmentTypeData)) {
        this._employmentTypeDataSelectList = Immutable.List<AeSelectItem<string>>(_employmentTypeData);
      }
    });

    this._employeePeriodLoaded$ = this._store.let(fromRoot.getPeriodOptionListLoadingStatus).subscribe(res => {
      if (!isNullOrUndefined(res)) {
        if (!res) {
          this._store.dispatch(new LoadPeriodOptionAction(true));
        }
      }
    });

    this._employeePeriodOptionsSubscription$ = this._store.let(fromRoot.getPeriodOptionListData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._employeePeriodOptionList = Immutable.List<AeSelectItem<string>>(res);
      }
    });

    this._userProfilesLoadedSubscription$ = this._store.let(fromRoot.getUserProfilesLoadedStatus).subscribe((loaded) => {
      if (!loaded) {
        this._store.dispatch(new LoadUserProfilesAction(true));
      }

    });
    this._userProfilesOptionsList$ = this._store.let(fromRoot.getUserProfilesptionsData);
    this._userProfilesList$ = this._store.let(fromRoot.getUserProfilesData).subscribe((profiles) => {
      if (!isNullOrUndefined(profiles)) {
        this._userProfiles = profiles;
        this._cdRef.markForCheck();
      }
    });
    //Dropdown data

    this._bulkUpdateStatusSubscription = this._store.let(fromRoot.getEmployeeBulkUpdateStatus).subscribe(status => {
      this._updateStatus = status;
      if (status === true) {
        let navigationExtras: NavigationExtras = {
          queryParamsHandling: 'merge'
        };
        this._messagetType = MessageType.Success;
        this._router.navigate(['employee/manage'], navigationExtras);
      }
      else {
        // this._showColumns();
      }
    });

    this._bulkUpdateStatusMessageSubscription = this._store.let(fromRoot.getEmployeeBulkUpdateStatusMessage).subscribe(message => {
      this._message = message;
      this._showErrorMessage = true;
    });

    this.autoSaveCompleteSubscription = this._store.let(fromRoot.getBulkUpdateAutoSaveStatus).subscribe(val => {
      if (!isNullOrUndefined(val)) {
        let empId = val.Id;
        let employee = this._employees.find(emp => emp.Id === empId);
        if (!isNullOrUndefined(employee)) {
          let jobTitle = this._jobTitleOptionList.find(t => t.Value === employee.Job.JobTitleId);
          if (!isNullOrUndefined(jobTitle)) {
            this._store.dispatch(new LoadJobTitleOptioAction(true));
          }
          employee.Changed = false;
          employee.HasUser = employee.CreateUser && !isNullOrUndefined(employee.UserProfiles);
          let successMessage: string = "Auto updated employee -'" + employee.FirstName + " " + employee.Surname + "' " + "successfully" + " " + "at-" + (new Date()).toLocaleString();
          employee.Errors = new Array<string>(successMessage);
        }
        this._totalEmployeesCount$.next(this._totalCount);
        this._cdRef.markForCheck();
      }
    });

  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._jobTitleStatusSubscription$))
      this._jobTitleStatusSubscription$.unsubscribe();

    if (!isNullOrUndefined(this._jobTitleSubscription$))
      this._jobTitleSubscription$.unsubscribe();

    if (!isNullOrUndefined(this._ethnicGroupSubscription$))
      this._ethnicGroupSubscription$.unsubscribe();

    if (!isNullOrUndefined(this._sitesLoadedSubscription$))
      this._sitesLoadedSubscription$.unsubscribe();

    if (!isNullOrUndefined(this._departmentsLoadedSubscription$))
      this._departmentsLoadedSubscription$.unsubscribe();

    if (!isNullOrUndefined(this._departmentSubscription$))
      this._departmentSubscription$.unsubscribe();

    if (!isNullOrUndefined(this._siteSubscription$))
      this._siteSubscription$.unsubscribe();

    if (!isNullOrUndefined(this._employmentTypesLoadedSubscription$))
      this._employmentTypesLoadedSubscription$.unsubscribe();

    if (!isNullOrUndefined(this._employmenttypeSubscription$))
      this._employmenttypeSubscription$.unsubscribe();

    if (!isNullOrUndefined(this._employeePeriodLoaded$))
      this._employeePeriodLoaded$.unsubscribe();

    if (!isNullOrUndefined(this._employeePeriodOptionsSubscription$))
      this._employeePeriodOptionsSubscription$.unsubscribe();

    if (!isNullOrUndefined(this._userProfilesLoadedSubscription$))
      this._userProfilesLoadedSubscription$.unsubscribe();

    if (!isNullOrUndefined(this._userProfilesList$))
      this._userProfilesList$.unsubscribe();
    if (!isNullOrUndefined(this._dataSubscription)) {
      this._dataSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._employeeGroupSubscription$))
      this._employeeGroupSubscription$.unsubscribe();

    if (!isNullOrUndefined(this._bulkUpdateStatusSubscription)) {
      this._bulkUpdateStatusSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._bulkUpdateStatusMessageSubscription)) {
      this._bulkUpdateStatusMessageSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this.autoSaveCompleteSubscription)) {
      this.autoSaveCompleteSubscription.unsubscribe();
    }
    this._totalEmployeesCountSub.unsubscribe();
  }

}
