import { AeLoaderType } from '../../../../atlas-elements/common/ae-loader-type.enum';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { BaseComponent } from "../../../../shared/base-component";
import { TranslationService, LocaleService } from "angular-l10n";
import { Router, NavigationExtras } from "@angular/router";
import { MessengerService } from "../../../../shared/services/messenger.service";
import { Store } from "@ngrx/store";
import { ClaimsHelperService } from "../../../../shared/helpers/claims-helper";
import * as fromRoot from '../../../../shared/reducers';
import { EmployeeImportParams } from "../../models/employee-import-params";
import { Subscription } from "rxjs/Subscription";
import { isNullOrUndefined } from "util";
import { Observable } from "rxjs/Observable";
import * as Immutable from 'immutable';
import { DataTableOptions } from "../../../../atlas-elements/common/models/ae-datatable-options";
import { AeSelectItem } from "../../../../atlas-elements/common/models/ae-select-item";
import { getAeSelectItemsFromEnum, mapEthnicgroupsToAeSelectItems, mapLookupTableToAeSelectItems } from "../../../common/extract-helpers";
import { SalutationCode } from "../../../common/salutationcode.enum";
import { Gender } from "../../../common/gender.enum";
import { LoadJobTitleOptioAction, LoadSitesAction, LoadAllDepartmentsAction, LoadUserProfilesAction } from "../../../../shared/actions/company.actions";
import { AeInputType } from "../../../../atlas-elements/common/ae-input-type.enum";
import { EthnicGroup, UserProfile, County, Country, EmployeeRelations } from "../../../../shared/models/lookup.models";
import { EmployeeEthinicGroupLoadAction, EmploymentTypeLoadAction, LoadPeriodOptionAction, CountyLoadAction, CountryLoadAction, EmployeeRelationsLoadAction } from "../../../../shared/actions/lookup.actions";
import { HolidayUnitType } from "../../../../shared/models/company.models";
import { Department } from "../../../../calendar/model/calendar-models";
import { mapSiteLookupTableToAeSelectItems, mapEmploymentTypeLookupTableToAeSelectItems } from "../../../../shared/helpers/extract-helpers";
import { AeDatatableComponent } from "../../../../atlas-elements/ae-datatable/ae-datatable.component";
import { AeSelectEvent } from "../../../../atlas-elements/common/ae-select.event";
import { StringHelper } from '../../../../shared/helpers/string-helper';
import { isValidName, isValidEmail, isUserNameHasValidPattern, isNiNumberValid } from '../../common/employee-import-validators';
import { Address } from '../../../../atlas-elements/common/adress';
import { AeIconSize } from '../../../../atlas-elements/common/ae-icon-size.enum';
import {
  EmployeeBulkInsertAction,
  EmployeeImportAction,
  EmployeeImportCheckUncheckCreateUsereAction,
  EmployeeImportDeleteAction
} from '../../actions/employee-import.actions';
import { MessageType } from '../../../../atlas-elements/common/ae-message.enum';
import * as fromConstants from '../../../../shared/app.constants';
import { EmployeeEmergencyContacts } from '../../../models/employee.model';
import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { LoadApplicableSitesAction, LoadApplicableDepartmentsAction } from '../../../../shared/actions/user.actions';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
  selector: 'employee-import-preview',
  templateUrl: './employee-import-preview.component.html',
  styleUrls: ['./employee-import-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeImportPreviewComponent extends BaseComponent implements OnInit, OnDestroy {

  private _importEmployeeList$: BehaviorSubject<Immutable.List<any>> = new BehaviorSubject<Immutable.List<any>>(Immutable.List<any>([]));
  private _totalRecords$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _defaultDataTableOptions$: BehaviorSubject<DataTableOptions> = new BehaviorSubject<DataTableOptions>(new DataTableOptions(1, 10));
  private _loadingStatus$: Observable<boolean> = Observable.of(false);
  private _onDemandDataLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private _initialDataLoaded: boolean = false;
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
  private _showAddressSlider: boolean;
  addressIconSize: AeIconSize = AeIconSize.tiny;
  private _userProfiles: Array<UserProfile>;
  private _importedEmployees: Array<any>;
  private _importStatusSubscription: Subscription;
  private _importStatusMessageSubscription: Subscription;
  private _importStatus: boolean;
  private _importMessage: string;
  private _messagetType = MessageType.Info;
  private _dataSubscription: Subscription;
  private _showAll: boolean = true;
  private _isOpen: boolean = false;
  private _isSubmitted: boolean;
  private _employeewithoutEmailPopup: boolean = false;
  private _dsType: AeDatasourceType = AeDatasourceType.Local;
  private _showDeleteConfirmDialog: boolean;
  private _rowIndex: number = undefined;
  private _showMessage: boolean;
  private _AddressFormVM: Address;
  private _addressRowIndex;
  private _showUpdateEmpEmergencyContactsForm: boolean = false;
  private _operationMode: string = 'add';
  private _county$: Observable<County[]>;
  private _country$: Observable<Country[]>;
  private _employeeRelation$: Observable<EmployeeRelations[]>;
  private _employeeRelationDataLoadedSubscription: Subscription;
  private _countyDataLoadedSubscription: Subscription;
  private _countryDataLoaded$: Observable<boolean>;
  private _countryDataLoadedSubscription: Subscription;
  private _optionsDataSubscription: Subscription;
  private _employeeRelationDataLoaded$: Observable<boolean>;
  private _countyDataLoaded$: Observable<boolean>;
  private _contactsDataLoaded$: Observable<boolean>;
  private _emergencyContactDataLoaded$: Observable<boolean>;
  private _emergencyContactSubscription: Subscription;
  private _employeeEmergancyContactDetails: EmployeeEmergencyContacts;
  private _contextRow: any;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _keys = Immutable.List([
    'Title', 'FirstName', 'Surname', 'MiddleName', 'DOB',
    'HasEmail', 'CreateUser', 'Email', 'UserName', 'UserProfileId', 'UserProfiles',
    'Gender', 'Job', 'EmployeeNumber', 'Nationality',
    'EmployeePayrollDetails', 'PreviousName', 'EthnicGroups',
    'EthnicGroup', 'Address', 'EmploymentTypeId', 'SalaryHistoryDetails',
    'EmergencyContacts', 'Errors'
  ]);
  private _optionalColumns = Immutable.List([
    { Name: 'Middle name(s)', Key: 4, Show: true },
    { Name: 'Create User', Key: 7, Show: true },
    { Name: 'Gender', Key: 11, Show: true },
    { Name: 'Department', Key: 28, Show: true },
    { Name: 'Location / site', Key: 29, Show: true },
    { Name: 'Employment Type', Key: 27, Show: true },
    { Name: 'Employee Number', Key: 14, Show: true },
    { Name: 'Holiday Entitlement', Key: 23, Show: true },
    { Name: 'Probationary Period', Key: 24, Show: true },
    { Name: 'Tax Code', Key: 19, Show: true },
    { Name: 'Home Based', Key: 25, Show: true },
    { Name: 'Ethnicity', Key: 21, Show: true },
    { Name: 'Emergency Contact', Key: 33, Show: true },
    { Name: 'Previous Name', Key: 20, Show: true },
    { Name: 'Pay', Key: 30, Show: true },
    { Name: 'Current Salary', Key: 31, Show: true },
    { Name: 'Employee Period', Key: 32, Show: true },
    { Name: 'Nationality', Key: 15, Show: true },
    { Name: 'Holiday unit type', Key: 22, Show: true }
  ]);
  private _totalRecordsSub: Subscription;
  private _totalRecords: number;
  private _failedImportedEmployeeSub: Subscription;
  private _canShowDataGrid: boolean = false;
  private _loaderBars: AeLoaderType = AeLoaderType.Spinner;
  private _departmentsLoadSubscription: Subscription;
  get loaderBars(): AeLoaderType {
    return this._loaderBars;
  }
  get canShowDataGrid(): boolean {
    return this._canShowDataGrid;
  }
  get County$(): Observable<County[]> {
    return this._county$;
  }
  set County$(value: Observable<County[]>) {
    this._county$ = value;
  }

  get Country$(): Observable<Country[]> {
    return this._country$;
  }
  set Country$(value: Observable<Country[]>) {
    this._country$ = value;
  }

  get rowIndex(): number {
    return this._rowIndex;
  }

  get EmployeeRelation$(): Observable<EmployeeRelations[]> {
    return this._employeeRelation$;
  }
  set EmployeeRelation$(value: Observable<EmployeeRelations[]>) {
    this._employeeRelation$ = value;
  }

  //Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _router: Router
    , private _messenger: MessengerService
    , private _breadcrumbService: BreadcrumbService) {
    super(_localeService, _translationService, _cdRef);
    this._isSubmitted = false;
    //  const bcItem: IBreadcrumb = { label: 'Import employees - Preview data', url: '/employee/import/preview' };
    // this._breadcrumbService.add(bcItem);
  }

  @ViewChild(AeDatatableComponent)
  dataTable: AeDatatableComponent<any>;



  //Public properties
  get importMessage() {
    return this._importMessage;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Employees;
  }

  get messagetType() {
    return this._messagetType;
  }

  get showAll() {
    return this._showAll;
  }

  get importEmployeeList$() {
    if (!isNullOrUndefined(this._importEmployeeList$)) {
      return this._importEmployeeList$;
    }
    return null;
  }

  get totalRecords$(): BehaviorSubject<number> {
    return this._totalRecords$;
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

  get employeeTitles() {
    return this._employeeTitles;
  }

  get userProfilesOptionsList$() {
    return this._userProfilesOptionsList$;
  }

  get genderList() {
    return this._genderList;
  }
  get dsType() {
    return this._dsType;
  }
  get jobTitleOptionList() {
    return this._jobTitleOptionList
  }

  get inputTypeNumber() {
    return this._inputTypeNumber;
  }

  get ethnicGroupData() {
    return this._ethnicGroupData;
  }
  get holidayUnitTypeDataSelectList() {
    return this._holidayUnitTypeDataSelectList;
  }
  get employmentTypeDataSelectList() {
    return this._employmentTypeDataSelectList;
  }

  get departmentDataSelectList() {
    return this._departmentDataSelectList;
  }
  get siteDataSelectList() {
    return this._siteDataSelectList;
  }

  get employeePeriodOptionList() {
    return this._employeePeriodOptionList;
  }

  get AddressFormVM() {
    return this._AddressFormVM;
  }
  get showUpdateEmpEmergencyContactsForm() {
    return this._showUpdateEmpEmergencyContactsForm;
  }
  get employeeEmergancyContactDetails() {
    return this._employeeEmergancyContactDetails;
  }
  get operationMode() {
    return this._operationMode;
  }
  get showDeleteConfirmDialog(): boolean {
    return this._showDeleteConfirmDialog;
  }
  get lightClass() {
    return this._lightClass;
  }
  get optionalColumns() {
    return this._optionalColumns;
  }
  //End of public properties

  //Private methods

  private _setInputSwitchPropertyValueForHeader(value, item) {
    this._store.dispatch(new EmployeeImportCheckUncheckCreateUsereAction(value));
  }

  private _setEhnicityValue(ethnicGroup: any, rowIndex: number) {
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee)) {
      if (!isNullOrUndefined(employee.EthnicGroup)) {
        employee.EthnicGroup = Object.assign({}, employee.EthnicGroup, {
          EthnicGroupValueId: '',
          EthnicGroupTypeId: '',
          EthnicGroupValueType: '',
          Name: ''
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


  private _getSuggestedUserName(employee: any): string {
    let suggestUsername = '';
    if (employee.FirstName && employee.FirstName != '')
      suggestUsername += employee.FirstName.replace(/[\s]/g, '');
    if (employee.Surname && employee.Surname != '')
      suggestUsername += employee.Surname.replace(/[\s]/g, '');
    return suggestUsername;
  }


  private _updateContextValue(context, property, value) {
    let props = property.split('.');
    let employee = this._getEmployeesByIndex(context.Row);
    //if (!isNullOrUndefined(employee)) {
    if (props.length > 1) {
      let nestedObj = props[0];
      let prop = props[1];
      context[nestedObj][prop] = value;
      employee[nestedObj][prop] = value;
    }
    else {
      context[property] = value;
      employee[property] = value;
    }
    //}
  }


  private _hasValue(rowIndex, property): boolean {
    let fieldValue = this.getFieldValue(rowIndex, property);
    return !isNullOrUndefined(fieldValue) && !StringHelper.isNullOrUndefinedOrEmpty(String(fieldValue));
  }


  private _setSalaryInfo(context, property, value) {
    let employee = this._getEmployeesByIndex(context.Row);
    if (!isNullOrUndefined(employee)) {
      if (isNullOrUndefined(context.SalaryHistoryDetails)) {
        context.SalaryHistoryDetails = new Array<any>();
        context.SalaryHistoryDetails[0] = {};
        employee.SalaryHistoryDetails[0] = context.SalaryHistoryDetails[0];
      }
      context.SalaryHistoryDetails[0][property] = value;
      employee.SalaryHistoryDetails[0][property] = value;
    }
  }

  _isRowHasErrors = (context: any) => !this._validateEmployee(context.Row);
  highLightErrorRow = (context: any) => this._isRowHasErrors(context);


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

        case 'UserProfileId':
          isEmployeeValid = isEmployeeValid
            && !this.fieldHasRequiredUserProfileError(rowIndex, key);
          if (!isEmployeeValid) return isEmployeeValid;
          break;

        case 'Job':
          {
            isEmployeeValid = isEmployeeValid
              && !this.fieldHasRequiredJobTitleError(rowIndex)
              && !this.fieldHasRequiredError(rowIndex, 'Job.HoursAWeek')
              && !this.fieldHasInvalidHours(rowIndex)
              && !this.fieldHasInvalidWeekDays(rowIndex)
              && !this.fieldHasInvalidProbationaryPeriod(rowIndex)
              && !this.fieldHasInvalidEntitlementPeriod(rowIndex);
            if (!isEmployeeValid) return isEmployeeValid;
          }
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



  private _getImportedEmployees(): Array<any> {
    if (isNullOrUndefined(this._importedEmployees) &&
      !isNullOrUndefined(this.dataTable)) {
      let context = this.dataTable.getContext();
      if (!isNullOrUndefined(context)) {
        this._importedEmployees = context.toArray();
      }
    }
    return this._importedEmployees;
  }

  _getEmployeesByIndex(index: number) {
    let employees = this._getImportedEmployees();
    let employee = employees[index];
    return employee;
  }

  private _employeeHasErrors(rowIndex: number): boolean {
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee)) {
      return !isNullOrUndefined(employee.Errors) && (employee.Errors.length > 0);
    }

    return false;
  }

  //End of private methods

  //Public methods

  setInputPropertyValue($event, context, property) {
    if (!isNullOrUndefined($event) && !isNullOrUndefined($event.event)) {
      if (!isNullOrUndefined($event.event.target)) {
        this._updateContextValue(context, property, $event.event.target.value);
      }
    }
  }

  setSelectPropertyValue($event: AeSelectEvent<any>, context, property) {
    if (!isNullOrUndefined($event)) {
      this._updateContextValue(context, property, $event.SelectedValue);
    }
  }

  setInputSwitchPropertyValue(value, context, property) {
    this._updateContextValue(context, property, value);
  }

  setEmploymentTypeValue($event: AeSelectEvent<any>, context, property) {
    if (!isNullOrUndefined($event)) {
      this._updateContextValue(context, property, $event.SelectedValue);
      this._updateContextValue(context, 'Job.OtherEmployeeType', '');
    }
  }

  onEthnicityChange(e: AeSelectEvent<string>, context, property) {
    this.setSelectPropertyValue(e, context, property);
    if (!isNullOrUndefined(e.SelectedItem)) {
      let ethnicGroup = this._ethnicGroups.filter(c => c.Id == e.SelectedValue)[0];
      if (!isNullOrUndefined(ethnicGroup)) {
        this._setEhnicityValue(ethnicGroup, context.Row);
      }
    }
  }

  onProfileChanged(value, context, property) {
    if (!isNullOrUndefined(value) && !isNullOrUndefined(value.SelectedValue)) {
      context[property] = value.SelectedValue;
      let employee = this._getEmployeesByIndex(context.Row);
      if (!isNullOrUndefined(employee)) {
        employee[property] = value.SelectedValue;
        if (!isNullOrUndefined(this._userProfiles)) {
          let selectedProfile = this._userProfiles.find(p => p.Id === value.SelectedValue);
          if (!isNullOrUndefined(selectedProfile)) {
            context['UserProfiles'] = new Array<UserProfile>(selectedProfile);
            employee['UserProfiles'] = new Array<UserProfile>(selectedProfile);;
          }
        }

      }

    }

  }

  onCreateUserChanged(value, context, property) {
    let employee = this._getEmployeesByIndex(context.Row);
    if (!isNullOrUndefined(employee)) {
      employee.CreateUser = value;
      if (employee.CreateUser === true && employee.HasEmail === false) {
        employee.UserName = this._getSuggestedUserName(employee);
      } else {
        employee.UserName = '';
      }
      employee.Changed = true;
    }

  }

  onCreateUserChangedToAll(value) {
    this._importedEmployees.forEach(obj => {
      obj.CreateUser = value;
      if (obj.CreateUser === true && obj.HasEmail === false) {
        obj.UserName = this._getSuggestedUserName(obj);
      } else {
        obj.UserName = '';
      }
    });
  }

  getCreateUserAllStatus(): boolean {
    if (!isNullOrUndefined(this._importedEmployees)) {
      let _createUserEmployees = this._importedEmployees.filter(obj => obj.CreateUser == true || obj.HasUser == true);
      return _createUserEmployees.length == this._importedEmployees.length;
    }
    return false;
  }

  onHasEmailChanged(value, context, property) {
    let employee = this._getEmployeesByIndex(context.Row);
    if (!isNullOrUndefined(employee)) {
      employee.HasEmail = value;
      if (employee.HasEmail === true && !StringHelper.isNullOrUndefinedOrEmpty(employee.UserName)) {
        employee.UserName = '';
      } else if (employee.HasEmail === false && !StringHelper.isNullOrUndefinedOrEmpty(employee.Email)) {
        employee.Email = '';
      }


      if (employee.HasEmail === false && employee.CreateUser === true) {
        employee.UserName = this._getSuggestedUserName(employee);
      }
    }

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
  }

  isEmailDisabled(rowIndex: number): boolean {
    let hasEmail = this.getFieldValue(rowIndex, 'HasEmail');
    return !hasEmail;
  }

  isUserNameDisabled(rowIndex: number): boolean {
    let hasEmail = this.getFieldValue(rowIndex, 'HasEmail');
    let createUser = this.getFieldValue(rowIndex, 'CreateUser');
    return hasEmail || !createUser;
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

  getProfiles(userProfiles, rowIndex) {
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee) && !employee.HasEmail && !isNullOrUndefined(userProfiles)) {
      let employeeProfile = "Employee";
      let publicUserProfile = "PublicUserProfile";
      var profiles = userProfiles.toArray().filter(x => x.Text.toLowerCase() == employeeProfile.toLowerCase() || x.Text.toLowerCase() == publicUserProfile.toLowerCase());
      return Immutable.List<AeSelectItem<string>>(profiles);
    }
    return userProfiles;
  }

  getJobDetails(rowIndex, property) {
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee)) {
      return employee.Job[property];
    }
    return '';
  }
  getFieldValue(rowIndex, property) {
    let fieldValue;
    let employee = this._getEmployeesByIndex(rowIndex);
    if (!isNullOrUndefined(employee)) {
      let props = property.split('.');
      if (props.length > 1) {
        let nestedObj = props[0];
        let prop = props[1];
        fieldValue = employee[nestedObj][prop];
      }
      else {
        fieldValue = employee[property];
      }

    }
    return fieldValue;
  }


  getEthnicGroupValueId(context) {
    let employee = this._getEmployeesByIndex(context.Row);
    if (isNullOrUndefined(employee.EthnicGroup)) return '';
    if (!isNullOrUndefined(employee)) {
      let ethnicgrp = this._ethnicGroups.find(grp => grp.Id === employee.EthnicGroup.EthnicGroupValueId);
      this._setEhnicityValue(ethnicgrp, context.Row);
      let ethnicGroup = employee.EthnicGroup;
      if (!isNullOrUndefined(ethnicGroup)) {
        return !isNullOrUndefined(ethnicGroup.EthnicGroupValueId) ? ethnicGroup.EthnicGroupValueId : '';
      }
    }
    return '';
  }

  getSalaryInfo(context, property) {
    let employee = this._getEmployeesByIndex(context.Row);
    if (!isNullOrUndefined(employee) && !isNullOrUndefined(employee.SalaryHistoryDetails)) {
      if (!isNullOrUndefined(employee.SalaryHistoryDetails[0]))
        return employee.SalaryHistoryDetails[0][property];
    }
  }

  getEmergencyContactName(context, index) {
    let employee = this._getEmployeesByIndex(context.Row);
    if (!isNullOrUndefined(employee)) {
      if (!isNullOrUndefined(employee.EmergencyContacts) && employee.EmergencyContacts.length > 0) {
        let contact = employee.EmergencyContacts[index];
        if (!isNullOrUndefined(contact)) {
          return !isNullOrUndefined(contact.Name) ? contact.Name : '';
        }
      }
    }
    return '';
  }

  updateSalaryInfo($event, context, property) {
    switch (property) {
      case 'Pay':
        if (!isNullOrUndefined($event) && !isNullOrUndefined($event.event)) {
          if (!isNullOrUndefined($event.event.target)) {
            this._setSalaryInfo(context, property, $event.event.target.value);
          }
        }
        break;

      case 'IsCurrentSalary':
        if (!isNullOrUndefined($event)) {
          this._setSalaryInfo(context, property, $event);
        }
      case 'EmployeePeriodId':
        if (!isNullOrUndefined($event)) {
          this._setSalaryInfo(context, property, $event.SelectedValue);
        }
        break;
    }
  }
  getDate(rowIndex, property) {
    let value = this.getFieldValue(rowIndex, property);
    if (!isNullOrUndefined(value)) {
      return new Date(value);
    }
    return value;
  }
  setDateValue(value, context, property) {
    this._updateContextValue(context, property, value);
  }

  getOtherEmploymentDetails(rowIndex: number) {
    let value = this.getFieldValue(rowIndex, 'Job.OtherEmployeeType');
    if (!isNullOrUndefined(value)) {
      return value;
    }
    return '';
  }

  fieldHasRequiredError(rowIndex, property): boolean {
    return !(this._hasValue(rowIndex, property)) && (this._isSubmitted === true);
  }

  hasInvalidNameError(rowIndex, property): boolean {
    let fieldValue = this.getFieldValue(rowIndex, property);
    return !isValidName(fieldValue) && (this._isSubmitted === true);
  }

  fieldHasInvalidEmail(rowIndex, property): boolean {
    let fieldValue = this.getFieldValue(rowIndex, property);
    let hasEmail = this.getFieldValue(rowIndex, 'HasEmail');
    return !isValidEmail(fieldValue) && hasEmail && (this._isSubmitted === true);
  }

  fieldHasRequiredEmailError(rowIndex, property): boolean {
    let fieldValue = this.getFieldValue(rowIndex, property);
    let hasEmail = this.getFieldValue(rowIndex, 'HasEmail');
    return this.fieldHasRequiredError(rowIndex, property) && hasEmail && (this._isSubmitted === true);
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
    return !isUserNameHasValidPattern(fieldValue) && (this._isSubmitted === true);
  }


  isNiNumberInValid(rowIndex, property): boolean {
    let fieldValue = this.getFieldValue(rowIndex, property);
    return !isNiNumberValid(fieldValue) && (this._isSubmitted === true);
  }

  fieldHasRequiredUserProfileError(rowIndex, property) {
    let fieldValue = this.getFieldValue(rowIndex, property);
    let createUser = this.getFieldValue(rowIndex, 'CreateUser');
    return this.fieldHasRequiredError(rowIndex, property) && createUser && (this._isSubmitted === true);
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

  fieldHasRequiredJobTitleError(rowIndex: number) {
    let jobTitle = this.getJobTitle(rowIndex);
    return StringHelper.isNullOrUndefinedOrEmpty(jobTitle) && (this._isSubmitted === true);
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

    return !isValid && (this._isSubmitted === true);
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

    return !isValid && (this._isSubmitted === true);
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
  showImportMessage(): boolean {
    if (!isNullOrUndefined(this._importMessage)) {
      return this._showMessage;
    }

    return false;
  }

  hideMessage() {
    this._showMessage = false;
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
    return displayErrorString;
  }

  bulkInsert() {
    this._isSubmitted = true;
    let isValid = true;
    let employees = this._getImportedEmployees();
    employees.forEach((emp, index) => { isValid = isValid && this._validateEmployee(index); });
    let noEmailUsers = employees.filter(function (item) {
      return !item.HasUser && item.CreateUser && !item.HasEmail;
    })
    if (noEmailUsers && noEmailUsers.length > 0 && isValid) {
      this._employeewithoutEmailPopup = true;
    }
    else {
      if (isValid) {
        //before posting updated employees we should make errors clear so that only freshly got errors willbe displayed 
        employees.forEach((emp, index) => { emp.Errors = [] });
        this._store.dispatch(new EmployeeBulkInsertAction(employees));
      } else {
        this._cdRef.markForCheck();
      }
    }
    //Below is the hot fix to trigger the change detection in the datatable to so that validations will be shown    
    this._totalRecords$.next(this._totalRecords);
  }

  viewImportHistory() {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    this._router.navigate(['employee/import/history'], navigationExtras);
  }
  getAddressSlideoutState(): string {
    return this._showAddressSlider === true ? 'expanded' : 'collapsed';
  }

  getAddressSlideoutAnimateState(): boolean {
    return this._showAddressSlider === true;
  }
  getEmergencyContactsSlideoutState(): string {
    return this._showUpdateEmpEmergencyContactsForm ? 'expanded' : 'collapsed';
  }
  closeEmpEmergencyContactsUpdateForm(e) {
    this._showUpdateEmpEmergencyContactsForm = false;
  }
  openEmpEmergencyContactsUpdateForm(context) {
    let employee = this._getEmployeesByIndex(context.Row);
    this._contextRow = context.Row;
    if (!isNullOrUndefined(employee)) {
      this._employeeEmergancyContactDetails = employee.EmergencyContacts[0];
      this._showUpdateEmpEmergencyContactsForm = true;
      this._operationMode = 'update';
    }

  }
  saveEmpEmergencyContactsUpdateForm(empEmergencyContactsToSave: any) {
    if (!isNullOrUndefined(this._contextRow)) {
      let employee = this._getEmployeesByIndex(this._contextRow);
      employee.EmergencyContacts[0] = empEmergencyContactsToSave._empEmergencyContactsToSave;
      this._importedEmployees[this._contextRow] = employee;
      this._showUpdateEmpEmergencyContactsForm = false;
    }

  }


  addorUpdateAddress(context) {
    this._addressRowIndex = context.Row;
    this._showAddressSlider = true;
    let employee = this._getEmployeesByIndex(context.Row);
    this._AddressFormVM = employee.Address;

  }

  onAddressCancel(event: string) {
    this._showAddressSlider = false;
  }
  onAddressSubmit(data: any) {
    this._showAddressSlider = false;
    let employee = this._getEmployeesByIndex(this._addressRowIndex);
    if (isNullOrUndefined(employee.Address)) {
      employee.Address = new Address();
    }
    employee.Address.AddressLine1 = data.AddressLine1;
    employee.Address.AddressLine2 = data.AddressLine2;
    employee.Address.AddressLine3 = data.AddressLine3
    employee.Address.Town = data.Town;
    employee.Address.CountyId = data.CountyId;
    employee.Address.Postcode = data.Postcode;
    employee.Address.CountryId = data.CountryId;
    employee.Address.HomePhone = data.HomePhone;
    employee.Address.MobilePhone = data.MobilePhone;
    this._importedEmployees[this._addressRowIndex] = employee;

  }
  DisplayAddress(address) {
    let addressParts = [];
    let result = '';
    if (address) {
      if (address.AddressLine1 && address.AddressLine1.trim() !== '') {
        addressParts.push(address.AddressLine1);
      }
      if (address.AddressLine2 && address.AddressLine2.trim() !== '') {
        addressParts.push(address.AddressLine2);
      }
      if (address.AddressLine3 && address.AddressLine3.trim() !== '') {
        addressParts.push(address.AddressLine3);
      }
      if (address.Town && address.Town.trim() !== '') {
        addressParts.push(address.Town);
      }
      if (address.County && address.County.Name.trim() !== '') {
        addressParts.push(address.County.Name);
      }
      if (address.Postcode && address.Postcode.trim() !== '') {
        addressParts.push(address.Postcode);
      }
      if (address.Country && address.Country.Name !== '') {
        addressParts.push(address.Country.Name);
      }
    }
    if (addressParts.length > 0) {
      result = addressParts.join(', ');
    }
    return result;
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
    if (!isNullOrUndefined(this.dataTable)) {
      this.dataTable.visibleColumns.next(arr);
    }
    this._optionalColumns.forEach(element => {
      element.Show = !this._showAll;
    });
    this._showAll = !this._showAll;
  }

  onPreviewCancel(cancel: string) {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    this._router.navigate(['employee/import'], navigationExtras);
  }

  setHideShowColumn(key) {
    if (!isNullOrUndefined(this.dataTable)) {
      this.dataTable.visibleColumns.next([key]);
    }
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
  deleteImportedEmployee(rowIndex) {
    this._rowIndex = rowIndex;
    this._showDeleteConfirmDialog = true;

  }
  deleteImportedEmployeeClosed(event: any) {
    this._showDeleteConfirmDialog = false;
  }
  deleteImportedEmployeeConfirmed(event: any) {
    this._showDeleteConfirmDialog = false;
    this._store.dispatch(new EmployeeImportDeleteAction(this._rowIndex)); //dispatch an event to delete
    if (this._rowIndex != -1) {
      this._importedEmployees.splice(this._rowIndex, 1);
    } else {
      this._importedEmployees = [];
    }
    this._totalRecords = this._importedEmployees.length;
    this._totalRecords$.next(this._totalRecords);
    this._defaultDataTableOptions$.next(new DataTableOptions(1, this._totalRecords));
    this._importEmployeeList$.next(Immutable.List<any>(this._importedEmployees));
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
    let employees = this._getImportedEmployees();
    employees.forEach((emp, index) => { isValid = isValid && this._validateEmployee(index); });
    if (isValid) {
      //before posting updated employees we should make errors clear so that only freshly got errors willbe displayed 
      employees.forEach((emp, index) => { emp.Errors = [] });
      this._store.dispatch(new EmployeeBulkInsertAction(employees));
    }
  }



  //End of public methods

  ngOnInit() {
    this._AddressFormVM = new Address();
    this._store.dispatch(new EmployeeImportAction(true));
    this._employeeTitles = getAeSelectItemsFromEnum(SalutationCode);
    this._genderList = getAeSelectItemsFromEnum(Gender);

    //this._importEmployeeList$ = this._store.let(fromRoot.getEmployeeImportEmployees);
    //this._defaultDataTableOptions$ = this._store.let(fromRoot.getEmployeeImportEmployeesDataTableOptions);
    this._loadingStatus$ = this._store.let(fromRoot.getEmployeeImportEmployeesLoadingStatus);

    this._dataSubscription =
      this._store.let(fromRoot.getEmployeeImportEmployees).subscribe((data) => {
        if (!isNullOrUndefined(data) && data.count() > 0 &&
          !StringHelper.coerceBooleanProperty(this._initialDataLoaded)) {
          this._initialDataLoaded = true;
          this._store.dispatch(new LoadJobTitleOptioAction(true));
          this._store.dispatch(new LoadApplicableDepartmentsAction());
          this._store.dispatch(new LoadApplicableSitesAction(true));
          this._onDemandDataLoader.next(true);
          this._importedEmployees = data.toArray();
          this._importEmployeeList$.next(Immutable.List<any>(this._importedEmployees));
          this._defaultDataTableOptions$.next(new DataTableOptions(1, this._importedEmployees.length));
          this._totalRecords$.next(this._importedEmployees.length);
          this._totalRecords = this._importedEmployees.length;
        }
      });
    this._failedImportedEmployeeSub = this._store.let(fromRoot.getFailedImportedEmployeesData).subscribe((data) => {
      if (!isNullOrUndefined(data) && data.count() > 0) {
        //after any of the imported employees are failed then the state is updated with failed employees list returned from the API
        // we are setting this response to the grid again and total records are already subscribed below and passed so no need to update that
        this._importedEmployees = data.toArray();
        this._importEmployeeList$.next(Immutable.List<any>(this._importedEmployees));
        this._defaultDataTableOptions$.next(new DataTableOptions(1, this._importedEmployees.length));
        this._totalRecords$.next(this._importedEmployees.length);
        this._totalRecords = this._importedEmployees.length;
        this._cdRef.markForCheck();
      }
    });
    this._optionsDataSubscription =
      Observable.combineLatest(
        this._store.let(fromRoot.getJobTitleOptionListData),
        this._store.let(fromRoot.getApplicableDepartmentsData),
        this._store.let(fromRoot.getApplicableSitesData),
        this._onDemandDataLoader
      ).subscribe((data) => {
        if (!isNullOrUndefined(data) &&
          StringHelper.coerceBooleanProperty(data[3]) &&
          !isNullOrUndefined(data[0]) &&
          !isNullOrUndefined(data[1]) &&
          !isNullOrUndefined(data[2])) {
          this._onDemandDataLoader.next(null);
          this._jobTitleOptionList = data[0];
          this._departmentDataSelectList = mapLookupTableToAeSelectItems(data[1]);
          this._siteDataSelectList = mapLookupTableToAeSelectItems(data[2]);
          this._canShowDataGrid = true;
          this._cdRef.markForCheck();
        }
      });


    this._ethnicGroupSubscription$ = this._store.let(fromRoot.getEthnicGroupData).subscribe((ethnicGroupData) => {
      if (!isNullOrUndefined(ethnicGroupData)) {
        this._ethnicGroups = ethnicGroupData;
        this._ethnicGroupData = mapEthnicgroupsToAeSelectItems(this._ethnicGroups);
      } else {
        this._store.dispatch(new EmployeeEthinicGroupLoadAction(true));
      }
    });

    this._holidayUnitTypeDataSelectList = getAeSelectItemsFromEnum(HolidayUnitType);



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
    this._importStatusSubscription = this._store.let(fromRoot.getEmployeeImportStatus).subscribe(status => {
      this._importStatus = status;
      if (status === true) {
        let navigationExtras: NavigationExtras = {
          queryParamsHandling: 'merge'
        };
        this._router.navigate(['employee/manage'], navigationExtras);
      }
    });

    this._importStatusMessageSubscription = this._store.let(fromRoot.getEmployeeImportStatusMessage).subscribe(message => {
      this._importMessage = message;
      this._showMessage = true;
    });

    //Emergancy contact details
    this._county$ = this._store.let(fromRoot.getCountyData);
    this._country$ = this._store.let(fromRoot.getCountryData);
    this._employeeRelation$ = this._store.let(fromRoot.getEmployeeRelationsData);
    this._countyDataLoaded$ = this._store.let(fromRoot.getCountyLoadingState);
    this._countryDataLoaded$ = this._store.let(fromRoot.getCountryLoadingState);
    this._employeeRelationDataLoaded$ = this._store.let(fromRoot.getEmployeeRelationsLoadingState);

    this._countyDataLoadedSubscription = this._countyDataLoaded$.subscribe(countyLoaded => {
      if (!countyLoaded)
        this._store.dispatch(new CountyLoadAction(null));
    });

    this._countryDataLoadedSubscription = this._countyDataLoaded$.subscribe(countryLoaded => {
      if (!countryLoaded)
        this._store.dispatch(new CountryLoadAction(null));
    });

    this._employeeRelationDataLoadedSubscription = this._countyDataLoaded$.subscribe(empRelationLoaded => {
      if (!empRelationLoaded)
        this._store.dispatch(new EmployeeRelationsLoadAction(null));
    });
    this._departmentsLoadSubscription = this._store.let(fromRoot.getDepartmentLoadingState).subscribe(loaded => {
      if (loaded) {
        this._onDemandDataLoader.next(true);
      }
    });
  }

  ngOnDestroy() {
    if (this._failedImportedEmployeeSub) {
      this._failedImportedEmployeeSub.unsubscribe();
    }
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

    if (!isNullOrUndefined(this._importStatusSubscription))
      this._importStatusSubscription.unsubscribe();

    if (!isNullOrUndefined(this._importStatusMessageSubscription))
      this._importStatusMessageSubscription.unsubscribe();

    if (!isNullOrUndefined(this._dataSubscription)) {
      this._dataSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._countyDataLoadedSubscription))
      this._countyDataLoadedSubscription.unsubscribe();
    if (!isNullOrUndefined(this._countryDataLoadedSubscription))
      this._countryDataLoadedSubscription.unsubscribe();
    if (!isNullOrUndefined(this._employeeRelationDataLoadedSubscription))
      this._employeeRelationDataLoadedSubscription.unsubscribe();

    if (this._totalRecordsSub) {
      this._totalRecordsSub.unsubscribe();
    }

    if (!isNullOrUndefined(this._optionsDataSubscription)) {
      this._optionsDataSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._departmentsLoadSubscription)) {
      this._departmentsLoadSubscription.unsubscribe();
    }
  }

}
