import { Site } from '../../../../shared/models/site.model';
import { CommonValidators } from './../../../../shared/validators/common-validators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { AeInputType } from '../../../../atlas-elements/common/ae-input-type.enum';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { AdminOptions } from '../../../../employee/administration/models/user-admin-details.model';
import { SetEmployeeFirstNameAndSurName } from '../../../../employee/employee-add/actions/employee-add.actions';
import { BaseComponent } from '../../../../shared/base-component';
import { AdminOptionsComponent } from '../../../employee-shared/components/admin-options/admin-options.component';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { AeSelectEvent } from './../../../../atlas-elements/common/ae-select.event';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import {
  dateOfBirthValidator,
  hoursPerWeekFieldValidator,
  nameFieldValidator,
  niNumberValidator,
} from './../../../../employee/common/employee-validators';
import {
  calculateYearsAndMonthsFromToday,
  getAeSelectItemsFromEnum,
  mapEthnicgroupsToAeSelectItems,
  mergeEmployeeOptionsDetails,
} from './../../../../employee/common/extract-helpers';
import { Gender } from './../../../../employee/common/gender.enum';
import { SalutationCode } from './../../../../employee/common/salutationcode.enum';
import { prepareEmployeeFullEntityForAddEmployee } from './../../../../employee/employee-add/common/extract-helpers';
import { EmployeeFullEntity } from './../../../../employee/models/employee-full.model';
import { AddJobTitleAction } from './../../../../shared/actions/company.actions';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { EmployeeSettings, HolidayUnitType, JobTitle } from './../../../../shared/models/company.models';
import { EthnicGroup } from './../../../../shared/models/lookup.models';
import * as fromRoot from './../../../../shared/reducers';
import { mapSiteLookupTableToAeSelectItems } from './../../../../shared/helpers/extract-helpers';

@Component({
  selector: 'employee-add',
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeAddComponent extends BaseComponent implements OnInit, OnDestroy {
  private _adminOptionsModel: AdminOptions;
  private _employeeDetails: EmployeeFullEntity;
  private _employeeDetailsAddFormPersonal: FormGroup;
  private _employeeDetailsAddFormJob: FormGroup;
  private _employeeDetailsAddFormOptions: FormGroup;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _switchTextClass: AeClassStyle = AeClassStyle.TextRight;
  private _visibleOther: boolean = true;
  private _jobTitleSubscription: Subscription;
  private _employeeSettings: EmployeeSettings;
  private _submittedPersonal: boolean = false;
  private _submittedJob: boolean = false;
  private _submittedOptions: boolean = false;
  private _currentTabName: string = 'personal';
  private _employeeTitles: Immutable.List<AeSelectItem<number>>;
  private _genderList: Immutable.List<AeSelectItem<number>>;
  private _ethnicGroupData: Immutable.List<AeSelectItem<string>>;
  private _ethnicGroups: Array<EthnicGroup>;
  private _ethnicGroupSubscription: Subscription;
  private _showOtherEthnicity: boolean = false;
  private _siteDataSelectList$: Observable<Site[]>;
  private _departmentDataSelectList$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _employmentTypeDataSelectList: Immutable.List<AeSelectItem<string>>;
  private _holidayUnitTypeDataSelectList: Immutable.List<AeSelectItem<number>>;
  private _jobTitlesData$: Observable<AeSelectItem<string>[]>;
  private _employmentTypeListSubscription: Subscription;
  private _employeeSettingsSubscription: Subscription;
  private _showJobTitleAddForm: boolean = false;
  private _jobTitleAddSubscription: Subscription;
  private _datasourceSelectedJobTitle: any[] = [{ Value: '', Text: '' }];

  private _numberType: AeInputType;

  private _localDataSourceType: AeDatasourceType = AeDatasourceType.Local;
  private _siteImmSelectList: Immutable.List<AeSelectItem<string>>;

  get siteImmSelectList(): Immutable.List<AeSelectItem<string>> {
    return this._siteImmSelectList;
  }

  get datasourceSelectedJobTitle() {
    return this._datasourceSelectedJobTitle;
  }

  get employeeSettings(): EmployeeSettings {
    return this._employeeSettings;
  }

  get localDataSourceType(): AeDatasourceType {
    return this._localDataSourceType;
  }

  @ViewChild(AdminOptionsComponent) _optionsForm: AdminOptionsComponent;
  @Output('aeSubmit')
  private _submitEmployeeDetails: EventEmitter<EmployeeFullEntity> = new EventEmitter<EmployeeFullEntity>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _breadcrumbService: BreadcrumbService) {
    super(_localeService, _translationService, _cdRef);

    //   const bcItem: IBreadcrumb = { label: 'Employee', url: '/employee/manage' };
    //   this._breadcrumbService.add(bcItem);
    this._numberType = AeInputType.number;


  }

  ngOnInit() {
    this._employeeTitles = getAeSelectItemsFromEnum(SalutationCode);
    this._genderList = getAeSelectItemsFromEnum(Gender);
    this._holidayUnitTypeDataSelectList = getAeSelectItemsFromEnum(HolidayUnitType);

     this._store.let(fromRoot.getSiteData).takeUntil(this._destructor$).subscribe((val) => {
      if (!isNullOrUndefined(val)) {
        this._siteImmSelectList =  mapSiteLookupTableToAeSelectItems(val);
      }
    });
    this._departmentDataSelectList$ = this._store.let(fromRoot.getAllDepartmentsImmutableData);
    this._jobTitlesData$ = this._store.let(fromRoot.getJobTitleOptionListData);

    this._ethnicGroupSubscription = this._store.select(c => c.lookupState.EthnicGroupData).subscribe((ethnicGroupData) => {
      if (!isNullOrUndefined(ethnicGroupData)) {
        this._ethnicGroups = ethnicGroupData;
        this._ethnicGroupData = mapEthnicgroupsToAeSelectItems(this._ethnicGroups);
      }
      this._cdRef.markForCheck();
    });

    this._employmentTypeListSubscription = this._store.select(c => c.lookupState.EmploymentTypeOptionList).subscribe((employmentTypeOptionList) => {
      if (!isNullOrUndefined(employmentTypeOptionList)) {
        this._employmentTypeDataSelectList = Immutable.List<AeSelectItem<string>>(employmentTypeOptionList);
      }
      this._cdRef.markForCheck();
    });

    this._employeeSettingsSubscription = this._store.select(c => c.commonState.EmployeeSettings).subscribe((employeeSettingsData) => {
      if (!isNullOrUndefined(employeeSettingsData)) {
        this._employeeSettings = employeeSettingsData;
      }
      this._cdRef.markForCheck();
    });

    if (!this._employeeDetails) {
      this._employeeDetails = new EmployeeFullEntity();
    }
    if (!this._employeeSettings) {
      this._employeeSettings = new EmployeeSettings();
    }
    this._initForm();

    this._jobTitleAddSubscription = this._store.let(fromRoot.jobTitleData).subscribe(title => {
      if (!isNullOrUndefined(title)) {
        let jtVal: any[] = [];
        jtVal.push(title.Id)
        this._datasourceSelectedJobTitle = [{ Value: title.Id, Text: title.Name }];
        this._employeeDetailsAddFormJob.patchValue({ JobTitle: jtVal });
        this._cdRef.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    if (this._ethnicGroupSubscription)
      this._ethnicGroupSubscription.unsubscribe();
    if (this._employmentTypeListSubscription)
      this._employmentTypeListSubscription.unsubscribe();
    if (this._employeeSettingsSubscription)
      this._employeeSettingsSubscription.unsubscribe();
    if (this._optionsForm._doSubmitForm) {
      this._optionsForm._doSubmitForm.unsubscribe();
    }
    if (!isNullOrUndefined(this._jobTitleAddSubscription)) {
      this._jobTitleAddSubscription.unsubscribe();
    }
  }

  private _initForm() {
    if (StringHelper.isNullOrUndefinedOrEmpty(this._employeeDetails.Job.OtherEmployeeType)) {
      this._visibleOther = false;
    }
    else {
      this._visibleOther = true;
    }
    this._employeeDetailsAddFormPersonal = this._fb.group({
      Title: [{ value: this._employeeDetails.Title || '', disabled: false }, Validators.required],
      FirstName: [{ value: this._employeeDetails.FirstName, disabled: false },
      Validators.compose([Validators.required, nameFieldValidator])],
      MiddleName: [{ value: this._employeeDetails.MiddleName, disabled: false }, nameFieldValidator],
      Surname: [{ value: this._employeeDetails.Surname, disabled: false }, [Validators.required, nameFieldValidator]],
      KnownAs: [{ value: this._employeeDetails.KnownAs, disabled: false }],
      PreviousName: [{ value: this._employeeDetails.PreviousName, disabled: false }],
      Gender: [{ value: this._employeeDetails.Gender || '', disabled: false }],
      DOB: [{ value: this._employeeDetails.DOB ? new Date(this._employeeDetails.DOB) : null, disabled: false }, Validators.required],
      Age: [{ value: this._employeeDetails.Age, disabled: true }],
      EthnicGroupValueId: [{ value: this._employeeDetails.EthnicGroup.EthnicGroupValueId, disabled: false }],
      Name: [{ value: (this._employeeDetails.EthnicGroup.Name || ''), disabled: false }],
      Nationality: [{ value: this._employeeDetails.Nationality, disabled: false }, [Validators.required, nameFieldValidator]],
      NINumber: [{ value: this._employeeDetails.EmployeePayrollDetails.NINumber, disabled: false }, niNumberValidator],
      TaxCode: [{ value: this._employeeDetails.EmployeePayrollDetails.TaxCode, disabled: false }],
    },
      {
        validator: dateOfBirthValidator
      }
    );

    this._employeeDetailsAddFormJob = this._fb.group({
      JobTitle: [{ value: [], disabled: false }, [Validators.required]],
      DepartmentId: [{ value: this._employeeDetails.Job.DepartmentId || '', disabled: false }],
      SiteId: [{ value: this._employeeDetails.Job.SiteId || '', disabled: false }],
      EmploymentTypeId: [{ value: this._employeeDetails.Job.EmploymentTypeId || '', disabled: false }],
      OtherEmployeeType: [{ value: this._employeeDetails.Job.OtherEmployeeType, disabled: false }],
      Days: [{ value: this._employeeDetails.Job.Days, disabled: false }, [CommonValidators.min(1), CommonValidators.max(7)]],
      HoursAWeek: [{ value: this._employeeDetails.Job.HoursAWeek, disabled: false }, [Validators.required, hoursPerWeekFieldValidator]],
      StartDate: [{ value: this._employeeDetails.Job.StartDate ? new Date(this._employeeDetails.Job.StartDate) : null, disabled: false }, [Validators.required]],
      EmployeeNumber: [{ value: this._employeeDetails.Job.EmployeeNumber, disabled: false }],
      HolidayUnitType: [{ value: this._employeeDetails.Job.HolidayUnitType, disabled: false }, [Validators.required]],
      HolidayEntitlement: [{ value: this._employeeDetails.Job.HolidayEntitlement, disabled: false }, [CommonValidators.min(0), CommonValidators.max(300)]],
      ProbationaryPeriod: [{ value: this._employeeDetails.Job.ProbationaryPeriod, disabled: false }, [CommonValidators.min(0), CommonValidators.max(24)]],
      HomeBased: [{ value: this._employeeDetails.Job.HomeBased, disabled: false }]
    }
    );

    this._employeeDetailsAddFormOptions = this._fb.group({

    }
    );

    this._jobTitleSubscription = this._employeeDetailsAddFormJob.get('JobTitle').valueChanges.subscribe((selectedItems) => {
      if (selectedItems.length > 0)
        this._employeeDetails.Job.JobTitleId = selectedItems[0];
      else
        this._employeeDetails.Job.JobTitleId = '';
    });

  }

  private _toggleOtherEthnicity() {
    if (!isNullOrUndefined(this._employeeDetails) &&
      !isNullOrUndefined(this._employeeDetails.EthnicGroup) &&
      this._employeeDetails.EthnicGroup.EthnicGroupValueType === 2) {
      this._showOtherEthnicity = true;
      this._employeeDetailsAddFormPersonal.get('Name').setValidators(Validators.required);
    } else {
      this._showOtherEthnicity = false;
      this._employeeDetailsAddFormPersonal.get('Name').clearValidators();
      this._employeeDetailsAddFormPersonal.get('Name').reset();
    }
  }

  private _calculateAge(dob: Date) {
    return calculateYearsAndMonthsFromToday(dob);
  }

  private _fieldHasRequiredErrorOptions(fieldName: string): boolean {
    return (this._employeeDetailsAddFormOptions.get(fieldName).hasError('required') && (!this._employeeDetailsAddFormOptions.get(fieldName).pristine || this._submittedOptions));
  }

  // public methods

  onFormSubmit(e) {
    this._submittedPersonal = true;
    this._submittedJob = true;
    this._submittedOptions = true;
    this._optionsForm._isFormSubmitFromOutside.next(true);
    this._cdRef.markForCheck();
    let _empDetailsToSave: EmployeeFullEntity = null;
    let _empDetailsToSavePersonal: EmployeeFullEntity = null;
    let _empDetailsToSaveJob: EmployeeFullEntity = null;
    let _empDetailsToSaveOptions: EmployeeFullEntity = null;
    if (this._employeeDetailsAddFormPersonal.valid && this._employeeDetailsAddFormJob.valid && this._optionsForm._isFormValid) {
      this._optionsForm.saveForm();
      _empDetailsToSavePersonal = <EmployeeFullEntity>this._employeeDetailsAddFormPersonal.value;
      _empDetailsToSaveJob = <EmployeeFullEntity>this._employeeDetailsAddFormJob.value;

      let personalAndJob = Object.assign({}, _empDetailsToSavePersonal, _empDetailsToSaveJob);
      _empDetailsToSaveOptions = Object.assign({}, personalAndJob, mergeEmployeeOptionsDetails(personalAndJob, this._adminOptionsModel));

      _empDetailsToSave = Object.assign({}, this._employeeDetails, _empDetailsToSavePersonal, _empDetailsToSaveJob, _empDetailsToSaveOptions);
      var _ethnicGroupValueId = this._employeeDetailsAddFormPersonal.get('EthnicGroupValueId').value;
      if (_ethnicGroupValueId) {
        let ethnicGroup = this._ethnicGroups.filter(c => c.Id === _ethnicGroupValueId)[0];
        _empDetailsToSave.EthnicGroup.EthnicGroupTypeId = ethnicGroup.EthnicGroupTypeId;
        _empDetailsToSave.EthnicGroup.EthnicGroupValueType = ethnicGroup.EthnicGroupValueType;
        _empDetailsToSave.EthnicGroup.EthnicGroupValueId = ethnicGroup.Id;
        _empDetailsToSave.EthnicGroup.Name = ethnicGroup.Name;
      }

      _empDetailsToSave.EmployeePayrollDetails.NINumber = this._employeeDetailsAddFormPersonal.get('NINumber').value;
      _empDetailsToSave.EmployeePayrollDetails.TaxCode = this._employeeDetailsAddFormPersonal.get('TaxCode').value;

      let _employeeDetailsToSave = prepareEmployeeFullEntityForAddEmployee(_empDetailsToSave);
      if (isNullOrUndefined(_employeeDetailsToSave.Job.HolidayEntitlement)) {
        _employeeDetailsToSave.Job.HolidayEntitlement = this._employeeSettings.HolidayEntitlement;
      }
      this._optionsForm._doSubmitForm.subscribe(res => {
        if (res === true) {
          if (!isNullOrUndefined(this._optionsForm._latestEmail)) {
            _employeeDetailsToSave.Email = this._optionsForm._latestEmail;
            _employeeDetailsToSave.EmpEmailUser = this._optionsForm._latestEmail;
            _employeeDetailsToSave.UserName = this._optionsForm._latestEmail;
          }
          this._submitEmployeeDetails.emit(_employeeDetailsToSave);
        }
      });
    }
  }

  onTabClick(tabName: string) {
    if (this._currentTabName != tabName) {
      if (this._currentTabName == 'personal') {
        this._submittedPersonal = true;
        if (this._employeeDetailsAddFormPersonal.valid) {
          this._currentTabName = tabName;
        }
      }
      else if (this._currentTabName == 'job') {
        this._submittedJob = true;
        this._store.dispatch(new SetEmployeeFirstNameAndSurName(this._employeeDetailsAddFormPersonal.controls['FirstName'].value + this._employeeDetailsAddFormPersonal.controls['Surname'].value)); // will be used to suggest the user name in options tab
        if (this._employeeDetailsAddFormJob.valid) {
          this._currentTabName = tabName;
        }
      }
      else if (this._currentTabName == 'admin') {
        this._submittedOptions = true;
        if (this._employeeDetailsAddFormOptions.valid) {
          this._currentTabName = tabName;
        }
      }
      window.scrollTo(0, 0);
    }
  }

  onDateSelect(val: Date) {
    let dob = val;
    if (!isNullOrUndefined(this._employeeDetailsAddFormPersonal) && this._employeeDetailsAddFormPersonal.get('DOB')) {
      dob = this._employeeDetailsAddFormPersonal.get('DOB').value || val;
    }
    var age = (typeof dob == 'boolean') ? null : this._calculateAge(dob);
    this._employeeDetailsAddFormPersonal.get('Age').setValue(age);
  }

  onEthnicityChange(e: AeSelectEvent<string>) {
    if (!isNullOrUndefined(e.SelectedItem)) {
      let ethnicGroup = this._ethnicGroups.filter(c => c.Id == e.SelectedValue)[0];
      if (!isNullOrUndefined(ethnicGroup)) {
        if (ethnicGroup.EthnicGroupValueType == 2) {
          this._showOtherEthnicity = true;
          this._employeeDetailsAddFormPersonal.get('Name').setValue('');
          this._employeeDetailsAddFormPersonal.get('Name').setValidators(Validators.required);
        } else {
          this._showOtherEthnicity = false;
          this._employeeDetailsAddFormPersonal.get('Name').clearValidators();
          this._employeeDetailsAddFormPersonal.get('Name').reset();
        }
      }
    }
  }

  onEmploymentTypeChange(e) {
    if (e.SelectedItem != null && e.SelectedItem.Text == 'Other') {
      this._visibleOther = true;
    }
    else {
      this._employeeDetailsAddFormJob.get('OtherEmployeeType').setValue('');
      this._visibleOther = false;
    }
    this._cdRef.markForCheck();
  }

  isInActiveTab(tabName: string): boolean {
    return !(this._currentTabName == tabName);
  }

  fieldHasRequiredErrorPersonal(fieldName: string): boolean {
    return (this._employeeDetailsAddFormPersonal.get(fieldName).hasError('required') && (!this._employeeDetailsAddFormPersonal.get(fieldName).pristine || this._submittedPersonal));
  }

  fieldHasInvalidName(fieldName: string): boolean {
    return this._employeeDetailsAddFormPersonal.get(fieldName).getError('validName') == false;
  }

  fieldHasInvalidDOBError(errorName: string): boolean {
    return !StringHelper.isNullOrUndefined(this._employeeDetailsAddFormPersonal.get('DOB').value)
      && this._employeeDetailsAddFormPersonal.errors && (!StringHelper.isNullOrUndefined(this._employeeDetailsAddFormPersonal.errors["validDOB"]) && !this._employeeDetailsAddFormPersonal.errors["validDOB"])
  }

  isFieldValid(fieldName: string): boolean {
    return this._employeeDetailsAddFormPersonal.get(fieldName).valid;
  }

  fieldHasDaysPerWeekRangeError(fieldName: string): boolean {
    return ( (this._employeeDetailsAddFormJob.get(fieldName).hasError('min') || this._employeeDetailsAddFormJob.get(fieldName).hasError('max')) && (!this._employeeDetailsAddFormJob.get(fieldName).pristine || this._submittedJob));
  }

  fieldHasRequiredErrorJob(fieldName: string): boolean {
    return (this._employeeDetailsAddFormJob.get(fieldName).hasError('required') && (!this._employeeDetailsAddFormJob.get(fieldName).pristine || this._submittedJob));
  }

  fieldHasMinValueErrorJob(fieldName: string): boolean {
    return (this._employeeDetailsAddFormJob.get(fieldName).hasError('min') && (!this._employeeDetailsAddFormJob.get(fieldName).pristine || this._submittedJob));
  }
  fieldHasMaxValueErrorJob(fieldName: string): boolean {
    return (this._employeeDetailsAddFormJob.get(fieldName).hasError('max') && (!this._employeeDetailsAddFormJob.get(fieldName).pristine || this._submittedJob));
  }
  fieldHasInvalidHoursPerWeek(fieldName: string): boolean {
    return this._employeeDetailsAddFormJob.get(fieldName).getError('validHoursPerWeek') == false;
  }

  optionsModalToSave(e: AdminOptions) {
    this._adminOptionsModel = e;
  }

  get employeeDetailsAddFormPersonal(): FormGroup {
    return this._employeeDetailsAddFormPersonal;
  }

  get employeeDetailsAddFormJob(): FormGroup {
    return this._employeeDetailsAddFormJob;
  };

  get employeeTitles(): Immutable.List<AeSelectItem<number>> {
    return this._employeeTitles;
  }

  get genderList(): Immutable.List<AeSelectItem<number>> {
    return this._genderList;
  }

  get ethnicGroupData(): Immutable.List<AeSelectItem<string>> {
    return this._ethnicGroupData;
  }

  get showOtherEthnicity(): boolean {
    return this._showOtherEthnicity;
  }

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }

  get jobTitlesData(): Observable<AeSelectItem<string>[]> {
    return this._jobTitlesData$;
  }

  get departmentDataSelectList(): Observable<Immutable.List<AeSelectItem<string>>> {
    return this._departmentDataSelectList$;
  }

  get siteDataSelectList(): Observable<Site[]> {
    return this._siteDataSelectList$;
  }

  get employmentTypeDataSelectList(): Immutable.List<AeSelectItem<string>> {
    return this._employmentTypeDataSelectList;
  }

  get visibleOther(): boolean {
    return this._visibleOther;
  }

  get holidayUnitTypeDataSelectList(): Immutable.List<AeSelectItem<number>> {
    return this._holidayUnitTypeDataSelectList;
  }

  get switchTextClass(): AeClassStyle {
    return this._switchTextClass;
  }

  get employeeDetails(): EmployeeFullEntity {
    return this._employeeDetails;
  }
  get numberType() {
    return this._numberType;
  }

  public getJobTitleSlideoutState(): string {
    return this._showJobTitleAddForm ? 'expanded' : 'collapsed';
  }

  public closeJobTitleAddForm(e) {
    this._showJobTitleAddForm = false;
  }
  public jobTitleSave(e) {
    this._showJobTitleAddForm = false;
    if (!isNullOrUndefined(e)) {
      // dispatch job title save here
      this._store.dispatch(new AddJobTitleAction(e));
    }
  }
  public get showJobTitleAddForm() {
    return this._showJobTitleAddForm;
  }
  public openJobTitleAddForm(e) {
    this._showJobTitleAddForm = true;
  }

  // end of public methods

}