import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { TranslationService, LocaleService } from 'angular-l10n';
import { BaseComponent } from './../../../../shared/base-component';
import {
  Component
  , OnInit
  , ChangeDetectionStrategy
  , OnDestroy
  , ChangeDetectorRef
  , ViewEncapsulation
  , Input
} from '@angular/core';
import { Location } from '@angular/common';
import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NonWorkingdaysModel, PublicHoliday, WorkingProfile } from '../../../nonworkingdaysandbankholidays/models/nonworkingdays-model';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { EmployeeSettings } from '../../../../shared/models/company.models';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';
import { generatePublicHolidayYears } from '../../../nonworkingdaysandbankholidays/common/extract-helpers';
import { Observable } from 'rxjs/Observable';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { Subject } from 'rxjs/Subject';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { OperationModes } from '../../../../holiday-absence/models/holiday-absence.model';
import { StringHelper } from '../../../../shared/helpers/string-helper';
import { DateTimeHelper } from '../../../../shared/helpers/datetime-helper';
import { workingDaysCountValidator, whiteSpaceFieldValidator } from '../../../nonworkingdaysandbankholidays/common/nonworkingdays-validators';
import {
  AddNonWorkingDayProfileAction
  , UpdateNonWorkingDayProfileAction
  , ClearNonWorkingDayProfileAction
} from '../../../nonworkingdaysandbankholidays/actions/nonworkingdays-actions';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import {
  NonWorkingDaysAndPublicHolidayService
} from '../../../nonworkingdaysandbankholidays/services/nonworkingdaysandbankholiday.service';

@Component({
  selector: 'add-update-workingdayprofile',
  templateUrl: './add-update-workingdayprofile.component.html',
  styleUrls: ['./add-update-workingdayprofile.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddUpdateWorkingdayprofileComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private switchTextLeft: AeClassStyle = AeClassStyle.TextLeft;
  private switchTextRight: AeClassStyle = AeClassStyle.TextRight;
  private _workingDayProfileForm: FormGroup;
  private _workingDayProfileVM: NonWorkingdaysModel;
  private _countries: Immutable.List<AeSelectItem<string>>;
  private _employeeSettings: EmployeeSettings;
  private _publicHolidayYears: Immutable.List<AeSelectItem<number>> = Immutable.List([]);
  private _workingDayProfileSubscription: Subscription;
  private _canCreateStandardWorkingdayProfile: boolean;

  private _keys = Immutable.List(['Id', 'HolidayDate', 'DayOfTheWeek', 'Name']);
  private _publicHolidayData$: Observable<Immutable.List<PublicHoliday>> = Observable.of(Immutable.List([]));
  private _totalRecords$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _actions: Immutable.List<AeDataTableAction>;
  private _removePublicHoliday: Subject<PublicHoliday> = new Subject();

  private _publicHolidayListSubject: BehaviorSubject<Immutable.List<PublicHoliday>> = new BehaviorSubject(Immutable.List([]));
  private _totalHolidaysSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _dataTableOptionSubject: BehaviorSubject<DataTableOptions> = new BehaviorSubject<DataTableOptions>(null);
  private _pagingParams: Map<string, string>;
  private _sortParams: Map<string, string>;
  private _publicHolidayOperationMode: OperationModes = OperationModes.Add;
  private _publicHolidayVM: PublicHoliday;
  private _showRemoveConfirmationDialog: boolean = false;
  private _removedPublicHoliday: PublicHoliday;
  private _daysInWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  private _companyEndTimeHours: string = '00:00';
  private _companyStartTimeHours: string = '00:00';
  private _operationMode: OperationModes = OperationModes.Add;
  private _selectedYear: number;
  private _saveOperationStarted: boolean = false;

  private _routeParamSubscription: Subscription;
  private _profileKeyValuePairSubscription: Subscription;
  private _profileSaveStatusSubscription: Subscription;
  private _profileDataSubscription: Subscription;
  private _employeeSettingsSubscription: Subscription;
  private _profileType: string;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  // End of Private Fields

  // Public properties
  @Input('operationMode')
  get operationMode() {
    return this._operationMode;
  }
  set operationMode(val: OperationModes) {
    this._operationMode = val;
  }

  @Input('countries')
  get countries() {
    return this._countries;
  }
  set countries(val: Immutable.List<AeSelectItem<string>>) {
    this._countries = val;
    this._setDefaultCountry();
  }

  get workingDayProfileForm() {
    return this._workingDayProfileForm;
  }

  get saveOperationStarted() {
    return this._saveOperationStarted;
  }

  get countriesOptions() {
    return this._countries;
  }

  get workingDayProfileList() {
    return this._workingDayProfileVM.WorkingProfileList;
  }

  get companyStartTimeHours() {
    return this._companyStartTimeHours;
  }

  get companyEndTimeHours() {
    return this._companyEndTimeHours;
  }

  get publicHolidayOperationMode() {
    return this._publicHolidayOperationMode;
  }

  get publicHolidayVM() {
    return this._publicHolidayVM;
  }

  get publicHolidayData$() {
    return this._publicHolidayData$;
  }

  get totalRecords$() {
    return this._totalRecords$;
  }

  get dataTableOptionSubject() {
    return this._dataTableOptionSubject;
  }

  get keys() {
    return this._keys;
  }

  get showRemoveConfirmationDialog() {
    return this._showRemoveConfirmationDialog;
  }

  get actions() {
    return this._actions;
  }

  get lightClass() {
    return this._lightClass;
  }

  // End of Public properties

  // Public Output bindings

  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _route: ActivatedRoute
    , private _router: Router
    , private _location: Location
    , private _publicHolidayService: NonWorkingDaysAndPublicHolidayService
  ) {
    super(_localeService, _translationService, _changeDetector);

  }
  // End of constructor

  // Private methods
  private _setDefaultCountry() {
    if (this._operationMode == OperationModes.Add &&
      !isNullOrUndefined(this._countries) &&
      this._countries.count() > 0 &&
      !isNullOrUndefined(this._workingDayProfileVM) &&
      StringHelper.isNullOrUndefinedOrEmpty(this._workingDayProfileVM.CountryId)) {
      let englandCountryId = this._countries.filter((country) => {
        return country.Text.toLowerCase() === 'england';
      }).first().Value.toLowerCase();
      if (!isNullOrUndefined(this._workingDayProfileForm)) {
        this._workingDayProfileForm.get('CountryId').setValue(englandCountryId);
      } else {
        this._workingDayProfileVM.CountryId = englandCountryId;
      }
    }
  }

  private _isStandardType() {
    return this._profileType.toLowerCase() === 'standard';
  }

  private _isCustomType() {
    return this._profileType.toLowerCase() === 'custom';
  }

  canShowNotes() {
    return this._profileType.toLowerCase() === 'standard' &&
      this._operationMode == OperationModes.Update;
  }

  private _initForm() {
    this._workingDayProfileForm = this._fb.group({
      Name: [{ value: this._workingDayProfileVM.Name, disabled: false }
        , Validators.compose([Validators.required, whiteSpaceFieldValidator])],
      Description: [{ value: this._workingDayProfileVM.Description, disabled: false }],
      CountryId: [{ value: this._workingDayProfileVM.CountryId, disabled: false }, Validators.required],
      IsExample: [{ value: this._workingDayProfileVM.IsExample, disabled: false }],
      Notes: [{ value: this._workingDayProfileVM.Notes, disabled: false }],
      WorkingProfileList: this._fb.array([])
    });

    if (this.hasWorkingDays()) {
      this._initWorkingDaysFormGroup();
    }

    for (let name in this._workingDayProfileForm.controls) {
      if (this._workingDayProfileForm.controls.hasOwnProperty(name)) {
        let control = this._workingDayProfileForm.controls[name];
        control.valueChanges.subscribe(v => {
          this._saveOperationStarted = false;
          this._workingDayProfileVM[name] = v;
        });
      }
    }
  }

  private _initWorkingDays(workingDay: WorkingProfile) {
    return this._fb.group({
      Id: [{ value: workingDay.Id, disabled: false }],
      DayIndex: [{ value: workingDay.DayIndex, disabled: false }],
      DayName: [{ value: workingDay.DayName, disabled: false }],
      HolidayWorkingProfileId: [{ value: workingDay.HolidayWorkingProfileId, disabled: false }],
      StartTimeHours: [{ value: workingDay.StartTimeHours, disabled: false }],
      EndTimeHours: [{ value: workingDay.EndTimeHours, disabled: false }],
      IsWorkingDay: [{ value: workingDay.IsWorkingDay, disabled: false }],
      CreatedOn: [{ value: workingDay.CreatedOn, disabled: false }],
      CreatedBy: [{ value: workingDay.CreatedBy, disabled: false }],
      ModifiedOn: [{ value: workingDay.ModifiedOn, disabled: false }],
      ModifiedBy: [{ value: workingDay.ModifiedBy, disabled: false }],
      IsDeleted: [{ value: workingDay.IsDeleted, disabled: false }],
      LCid: [{ value: workingDay.LCid, disabled: false }],
      Version: [{ value: workingDay.Version, disabled: false }],
      CompanyId: [{ value: workingDay.CompanyId, disabled: false }],
    });
  }

  private _initWorkingDaysFormGroup() {
    this._workingDayProfileForm.controls['WorkingProfileList'] = this._fb.array([]);
    let formArray = <FormArray>this._workingDayProfileForm.controls['WorkingProfileList'];
    this._workingDayProfileVM.WorkingProfileList.forEach(c => {
      formArray.push(this._initWorkingDays(c));
    });
    for (let formGroupIndex in formArray.controls) {
      let formGroup = <FormGroup>formArray.controls[formGroupIndex];
      for (let name in formGroup.controls) {
        let element = formGroup.controls[name];
        element.valueChanges.subscribe((value) => {
          this._saveOperationStarted = false;
          this._workingDayProfileVM.WorkingProfileList[formGroupIndex][name] = value;
        });
      }
    }
  }
  getHolidayDateConverted(dt: string) {
    return new Date(dt);
  }
  onYearChange(year: number) {
    this._selectedYear = year;
    this._loadPublicHolidays();
  }

  private _getPublicHolidays() {
    if (!isNullOrUndefined(this._workingDayProfileVM) &&
      !isNullOrUndefined(this._workingDayProfileVM.PublicHolidayList)) {
      return this._workingDayProfileVM.PublicHolidayList;
    }
    return [];
  }

  private _loadPublicHolidays() {
    let dataSource: Array<PublicHoliday> = [];
    if (!isNullOrUndefined(this._workingDayProfileVM.PublicHolidayList) &&
      this._workingDayProfileVM.PublicHolidayList.length > 0) {
      if (!isNullOrUndefined(this._selectedYear)) {
        dataSource = this._workingDayProfileVM.PublicHolidayList.filter((holiday) => {
          return holiday.Year === this._selectedYear && holiday.IsDeleted == false;
        });
      } else {
        dataSource = this._workingDayProfileVM.PublicHolidayList.filter((holiday) => {
          return isNullOrUndefined(holiday.IsDeleted) ||
            (!isNullOrUndefined(holiday.IsDeleted) && holiday.IsDeleted == false);
        });
      }
    }

    let count = (!isNullOrUndefined(dataSource)
      ? dataSource.length
      : 0);

    let sortField = this._sortParams.get('sortField');
    let direction = this._sortParams.get('direction') == SortDirection.Ascending.toString()
      ? SortDirection.Ascending
      : SortDirection.Descending;
    dataSource = this._getSortedSource(dataSource, sortField, direction);

    let pageNumber = parseInt(this._pagingParams.get('pageNumber'), 10);
    let pageSize = parseInt(this._pagingParams.get('pageSize'), 10);
    dataSource = this._getPaginatedSource(dataSource, pageSize, pageNumber);
    let datatableOptions = new DataTableOptions(pageNumber, pageSize);

    this._publicHolidayListSubject.next(Immutable.List(dataSource));
    this._totalHolidaysSubject.next(count);
    this._dataTableOptionSubject.next(datatableOptions);
  }

  hasWorkingDays() {
    return !isNullOrUndefined(this._workingDayProfileVM) &&
      !isNullOrUndefined(this._workingDayProfileVM.WorkingProfileList) &&
      this._workingDayProfileVM.WorkingProfileList.length > 0;
  }

  private _resolveFieldData(data, field: string) {
    if (!isNullOrUndefined(data) &&
      !isNullOrUndefined(field)) {
      if (field === 'HolidayDate') {
        return new Date(data[field]).getTime();
      } else {
        let value = data[field];
        return StringHelper.isNullOrUndefinedOrEmpty(value) ? '' : (<string>value).toUpperCase();
      }
    } else {
      return null;
    }
  }

  private _getSortedSource(source: Array<PublicHoliday>
    , sortFied: string
    , direction: SortDirection) {
    if (isNullOrUndefined(source) ||
      source.length < 1) {
      return source;
    }

    return source.splice(0).sort((a, b) => {
      let result = null;
      let value1 = this._resolveFieldData(a, sortFied);
      let value2 = this._resolveFieldData(b, sortFied);
      if (value1 == null && value2 != null) {
        result = -1;
      } else if (value1 != null && value2 == null) {
        result = 1;
      } else if (value1 == null && value2 == null) {
        result = 0;
      } else if (typeof value1 === 'string' && typeof value2 === 'string') {
        result = value1.localeCompare(value2);
      } else {
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
      }
      let sortOrder = direction === SortDirection.Descending ? 1 : -1;
      return (sortOrder * result);
    });
  }

  modalClosed(confirm: string) {
    this._showRemoveConfirmationDialog = false;
    if (confirm === 'yes' && !isNullOrUndefined(this._removedPublicHoliday)) {
      let holidayDate: Date = DateTimeHelper.getDatePart(new Date(this._removedPublicHoliday.HolidayDate));
      if (StringHelper.isNullOrUndefinedOrEmpty(this._removedPublicHoliday.Id)) {
        this._workingDayProfileVM.PublicHolidayList =
          this._workingDayProfileVM.PublicHolidayList.filter((holiday) => {
            return DateTimeHelper.getDatePart(new Date(holiday.HolidayDate)).getTime() !== holidayDate.getTime();
          });
      } else {
        this._workingDayProfileVM.PublicHolidayList =
          this._workingDayProfileVM.PublicHolidayList.map((holiday) => {
            if (holiday.Id.toLowerCase() === this._removedPublicHoliday.Id.toLowerCase()) {
              holiday.IsDeleted = true;
            }
            return holiday;
          });
      }
      this._publicHolidayService.setPublicHolidays(this._workingDayProfileVM.PublicHolidayList);
      this._loadPublicHolidays();
      this._removePublicHoliday = null;
    }
  }

  private _getPaginatedSource(source: Array<PublicHoliday>
    , pageSize: number
    , pageNumber: number) {
    if (isNullOrUndefined(source) ||
      source.length < 1) {
      return source;
    }
    let currentPageNumber = pageNumber - 1;
    return source.slice(currentPageNumber * pageSize, (pageNumber) * pageSize);
  }

  onPageChange($event) {
    this._pagingParams.set('pageNumber', $event.pageNumber);
    this._pagingParams.set('pageSize', $event.noOfRows);
    this._loadPublicHolidays();
  }

  onSort($event) {
    this._sortParams.set('sortField', $event.SortField);
    this._sortParams.set('direction', $event.Direction);
    this._pagingParams.set('pageNumber', '1');
    this._loadPublicHolidays();
  }

  savePublicHoliday(publicHoliday: PublicHoliday) {
    this._saveOperationStarted = false;
    if (isNullOrUndefined(this._workingDayProfileVM.PublicHolidayList)) {
      this._workingDayProfileVM.PublicHolidayList = [];
    }
    if (!isNullOrUndefined(publicHoliday)) {
      let holidayDate: Date = DateTimeHelper.getDatePart(new Date(publicHoliday.HolidayDate));
      let selectedHoliday = this._workingDayProfileVM.PublicHolidayList.filter((holiday) => {
        return DateTimeHelper.getDatePart(new Date(holiday.HolidayDate)).getTime() === holidayDate.getTime();
      });

      if (!isNullOrUndefined(selectedHoliday) && selectedHoliday.length > 0) {
        this._workingDayProfileVM.PublicHolidayList = this._workingDayProfileVM.PublicHolidayList.filter((holiday) => {
          return DateTimeHelper.getDatePart(new Date(holiday.HolidayDate)).getTime() !== holidayDate.getTime();
        });
      }
      this._workingDayProfileVM.PublicHolidayList = this._workingDayProfileVM.PublicHolidayList.concat([publicHoliday]);
      this._publicHolidayService.setPublicHolidays(this._workingDayProfileVM.PublicHolidayList);
      this._resetPublicHolidayVM(publicHoliday);
      this._loadPublicHolidays();
    }
  }

  private _resetPublicHolidayVM(publicHoliday: PublicHoliday) {
    if (!isNullOrUndefined(publicHoliday)) {
      this._publicHolidayOperationMode = OperationModes.Add;
      this._publicHolidayVM = Object.assign({}, publicHoliday);
      this._publicHolidayVM.Year = publicHoliday.Year;
      this._publicHolidayVM.Name = '';
      if (publicHoliday.Year === (new Date()).getFullYear()) {
        this._publicHolidayVM.HolidayDate = new Date().toDateString();
      } else {
        this._publicHolidayVM.HolidayDate = new Date(publicHoliday.Year, 0, 1).toDateString();
      }
    }
  }

  clearPublicHoliday() {
    this._publicHolidayOperationMode = OperationModes.Add;
    this._publicHolidayVM = new PublicHoliday();
    this._publicHolidayVM.Year = this._selectedYear = (new Date()).getFullYear();
    this._publicHolidayVM.Name = '';
    this._publicHolidayVM.HolidayDate = new Date().toDateString();

    this._loadPublicHolidays();
  }

  private _initPublicHolidayVM() {
    this._publicHolidayOperationMode = OperationModes.Add;
    this._publicHolidayVM = new PublicHoliday();
    this._publicHolidayVM.Year = (new Date()).getFullYear();
    this._publicHolidayVM.HolidayDate = new Date().toDateString();
  }

  private _canCreateStandard() {
    return this._canCreateStandardWorkingdayProfile;
  }

  getRemoveHolidayText() {
    if (!isNullOrUndefined(this._removedPublicHoliday)) {
      return this._removedPublicHoliday.Name;
    }
    return '';
  }

  private _prepareWorkingProfileList() {
    this._workingDayProfileVM.WorkingProfileList = [];
    this._daysInWeek.forEach((day, index) => {
      let workingProfile = new WorkingProfile;
      workingProfile.DayIndex = index;
      workingProfile.DayName = day;
      workingProfile.IsWorkingDay = false;
      workingProfile.Id = '';
      workingProfile.HolidayWorkingProfileId = '';
      workingProfile.EndTimeHours = this._companyEndTimeHours;
      workingProfile.StartTimeHours = this._companyStartTimeHours;
      this._workingDayProfileVM.WorkingProfileList.push(workingProfile);
    });
  }

  private _hasValidNoOfWorkingDays() {
    let isValid: boolean = false;
    if (!isNullOrUndefined(this._workingDayProfileVM) &&
      !isNullOrUndefined(this._workingDayProfileVM.WorkingProfileList)) {
      let selectedGroups = this._workingDayProfileVM.WorkingProfileList.filter((workingDay: WorkingProfile) => {
        return workingDay.IsWorkingDay === true;
      });

      if (!isNullOrUndefined(selectedGroups) &&
        selectedGroups.length > 0) {
        isValid = true;
      }
    }
    return isValid;
  }

  fieldHasValidWorkingDaysCountError(fieldName: string) {
    return !isNullOrUndefined(this._workingDayProfileForm) &&
      !isNullOrUndefined(this._workingDayProfileForm.get(fieldName)) &&
      !this._hasValidNoOfWorkingDays() &&
      !this._workingDayProfileForm.get(fieldName).pristine;
  }

  private _fieldHasRequiredError(fieldName: string) {
    return !isNullOrUndefined(this._workingDayProfileForm) &&
      !isNullOrUndefined(this._workingDayProfileForm.get(fieldName)) &&
      this._workingDayProfileForm.get(fieldName).hasError('required') &&
      !this._workingDayProfileForm.get(fieldName).pristine;
  }

  private _fieldHasDuplicateProfileNameError(fieldName: string) {
    return !isNullOrUndefined(this._workingDayProfileForm) &&
      !isNullOrUndefined(this._workingDayProfileForm.get(fieldName)) &&
      this._workingDayProfileForm.get(fieldName).getError('duplicateProfileName') === true &&
      !this._workingDayProfileForm.get(fieldName).pristine;
  }

  isFieldInvalid(fieldName: string): boolean {
    return !isNullOrUndefined(this._workingDayProfileForm) &&
      !isNullOrUndefined(this._workingDayProfileForm.get(fieldName)) &&
      !this._workingDayProfileForm.get(fieldName).valid &&
      !this._workingDayProfileForm.get(fieldName).pristine;
  }

  private _fieldHasWhitespaceError(fieldName: string) {
    return !isNullOrUndefined(this._workingDayProfileForm.get(fieldName)) &&
      this._workingDayProfileForm.get(fieldName).getError('hasWhiteSpace') &&
      !this._workingDayProfileForm.get(fieldName).pristine;
  }

  saveWorkingProfile() {
    if (!this._workingDayProfileForm.valid ||
      !this._hasValidNoOfWorkingDays()) {
      for (let name in this._workingDayProfileForm.controls) {
        if (this._workingDayProfileForm.controls.hasOwnProperty(name)) {
          let control = this._workingDayProfileForm.controls[name];
          control.markAsDirty();
        }
      }
      return;
    }

    this._workingDayProfileVM.PublicHolidayList =
      this._workingDayProfileVM.PublicHolidayList.map((holiday) => {
        if (StringHelper.isNullOrUndefinedOrEmpty(holiday.Id)) {
          holiday.CountryId = this._workingDayProfileVM.CountryId;
        }
        return holiday;
      });
    this._saveOperationStarted = true;

    if (this._operationMode == OperationModes.Add) {
      this._store.dispatch(new AddNonWorkingDayProfileAction(this._workingDayProfileVM));
    } else if (this._operationMode == OperationModes.Update) {
      this._store.dispatch(new UpdateNonWorkingDayProfileAction(this._workingDayProfileVM))
    }
  }

  hasError(fieldName: string): string {
    let message = '';
    switch (fieldName) {
      case 'CountryId': {
        if (this._fieldHasRequiredError(fieldName)) {
          message = 'Please select country.';
        }
      }
        break;
      case 'Name': {
        if (this._fieldHasRequiredError(fieldName) ||
          this._fieldHasWhitespaceError(fieldName)) {
          message = 'Name is required.';
        } else if (this._fieldHasDuplicateProfileNameError(fieldName)) {
          message = 'Non-working days and bank holiday profile with same name already exists.';
        }
      }
        break;
    }
    return message;
  }

  onPreviousClick() {
    this._location.back();
  }

  canShowExampleField() {
    return this._profileType === 'standard' &&
      this._canCreateStandardWorkingdayProfile;
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this._selectedYear = (new Date()).getFullYear();
    this._canCreateStandardWorkingdayProfile = this._claimsHelper.canManagePredefinedWorkingdayProfile();

    this._pagingParams = new Map<string, string>();
    this._pagingParams.set('pageNumber', '1');
    this._pagingParams.set('pageSize', '10');

    this._sortParams = new Map<string, string>();
    this._sortParams.set('sortField', 'HolidayDate');
    this._sortParams.set('direction', SortDirection.Ascending.toString());

    this._publicHolidayData$ = this._publicHolidayListSubject;
    this._totalRecords$ = this._totalHolidaysSubject;
    this._dataTableOptions$ = this._dataTableOptionSubject;

    this._actions = Immutable.List([
      new AeDataTableAction('Remove', this._removePublicHoliday, false)
    ]);

    this._removePublicHoliday.subscribe((item) => {
      if (!isNullOrUndefined(item)) {
        this._saveOperationStarted = false;
        this._removedPublicHoliday = item;
        this._showRemoveConfirmationDialog = true;
      }
    });

    this._employeeSettingsSubscription = this._store.let(fromRoot.getEmployeeSettingsData).subscribe((settings) => {
      if (!isNullOrUndefined(settings)) {
        this._employeeSettings = settings;
        this._companyStartTimeHours = settings.StartTimeHours;
        this._companyEndTimeHours = settings.EndTimeHours;
        if (this.operationMode == OperationModes.Add) {
          this._workingDayProfileVM = new NonWorkingdaysModel();
          this._publicHolidayService.setProfileToExclude('');
          this._publicHolidayService.setPublicHolidays(this._workingDayProfileVM.PublicHolidayList);
          if (isNullOrUndefined(this._workingDayProfileVM.WorkingProfileList) ||
            this._workingDayProfileVM.WorkingProfileList.length < 1) {
            this._prepareWorkingProfileList();
          }
          this._setDefaultCountry();
          this._initForm();
          this._loadPublicHolidays();
          this._initPublicHolidayVM();
          this._cdRef.markForCheck();
        }
      }
    });

    this._profileDataSubscription = Observable.combineLatest(this._store.let(fromRoot.getEmployeeSettingsData),
      this._store.let(fromRoot.getNonWorkingdayProfileData)).subscribe((values) => {
        if (!isNullOrUndefined(values) &&
          !isNullOrUndefined(values[0]) &&
          !isNullOrUndefined(values[1])) {
          this._employeeSettings = <EmployeeSettings>values[0];
          this._companyStartTimeHours = this._employeeSettings.StartTimeHours;
          this._companyEndTimeHours = this._employeeSettings.EndTimeHours;
          this._workingDayProfileVM = <NonWorkingdaysModel>values[1];
          if (this._operationMode == OperationModes.Add) {
            this._workingDayProfileVM.PublicHolidayList = [];
          }
          this._publicHolidayService.setPublicHolidays(this._workingDayProfileVM.PublicHolidayList);
          if (this._operationMode == OperationModes.Update) {
            this._publicHolidayService.setProfileToExclude(this._workingDayProfileVM.Id);
          }
          if (isNullOrUndefined(this._workingDayProfileVM.WorkingProfileList) ||
            this._workingDayProfileVM.WorkingProfileList.length < 1 || this._operationMode == OperationModes.Add) {
            this._prepareWorkingProfileList();
          } else {
            this._workingDayProfileVM.WorkingProfileList =
              this._workingDayProfileVM.WorkingProfileList
                .sort((a, b) => this._daysInWeek.indexOf(a.DayName) - this._daysInWeek.indexOf(b.DayName));
          }
          if (this._operationMode == OperationModes.Update) {
            this._saveOperationStarted = true;
            this._initForm();
            this._loadPublicHolidays();
            this._initPublicHolidayVM();
          }
          this._cdRef.markForCheck();
        }
      });

    this._profileSaveStatusSubscription = Observable.combineLatest(this._store.let(fromRoot.getAddNonWorkingdayProfileStatus),
      this._store.let(fromRoot.getUpdateNonWorkingdayProfileStatus)).subscribe((values) => {
        if (!isNullOrUndefined(values) &&
          (values[0] == true ||
            values[1] == true)) {
          this._saveOperationStarted = false;
          let navigationExtras: NavigationExtras = {
            queryParamsHandling: 'merge'
          };
          this._router.navigate(['/company/non-working-days-and-bank-holidays/' + this._profileType], navigationExtras);
          this._store.dispatch(new ClearNonWorkingDayProfileAction(true));
          this._cdRef.markForCheck();
        }
      });

    this._profileKeyValuePairSubscription = this._store.let(fromRoot.getCustonNonWorkingDaysValidationData)
      .subscribe((profileNames) => {
        if (!isNullOrUndefined(profileNames)) {
          this._publicHolidayService.setNonWorkingdayProfiles(profileNames);
        }
      });

    this._routeParamSubscription = this._route.params.subscribe(params => {
      this._profileType = params['type'];
    });
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._workingDayProfileSubscription)) {
      this._workingDayProfileSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._routeParamSubscription)) {
      this._routeParamSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._profileKeyValuePairSubscription)) {
      this._profileKeyValuePairSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._profileSaveStatusSubscription)) {
      this._profileSaveStatusSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._profileDataSubscription)) {
      this._profileDataSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._employeeSettingsSubscription)) {
      this._employeeSettingsSubscription.unsubscribe();
    }
  }
  // End of public methods
}
