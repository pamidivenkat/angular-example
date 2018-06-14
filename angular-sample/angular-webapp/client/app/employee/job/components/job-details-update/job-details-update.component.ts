import { CommonValidators } from './../../../../shared/validators/common-validators';
import { AeInputType } from '../../../../atlas-elements/common/ae-input-type.enum';
import {
  Component
  , OnInit
  , OnDestroy
  , ChangeDetectionStrategy
  , ViewEncapsulation
  , ChangeDetectorRef
  , Input
  , Output
  , EventEmitter
} from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { Observable, Subscription, BehaviorSubject } from 'rxjs/Rx';
import { EmployeeJobDetails } from './../../models/job-details.model';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { isNullOrUndefined, error } from 'util';
import { Department } from './../../../../calendar/model/calendar-models';
import { Site } from './../../../../shared/models/site.model';
import * as Immutable from 'immutable';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { mapLookupTableToAeSelectItems, getAeSelectItemsFromEnum } from './../../../../employee/common/extract-helpers';
import { HolidayUnitType, EmployeeSettings } from './../../../../shared/models/company.models';
import { EmployeeHolidayWorkingProfile } from './../../../../holiday-absence/models/holiday-absence.model';
import { AeDatasourceType } from './../../../../atlas-elements/common/ae-datasource-type';
import {
  mapSiteLookupTableToAeSelectItems
  , mapEmploymentTypeLookupTableToAeSelectItems
} from './../../../../shared/helpers/extract-helpers';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { AddJobTitleAction, ClearJobTitleAction } from './../../../../shared/actions/company.actions';
@Component({
  selector: 'job-details-update',
  templateUrl: './job-details-update.component.html',
  styleUrls: ['./job-details-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class JobDetailsUpdateComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _employeeJobDetails: EmployeeJobDetails;
  private _employeeJobDetailsUpdateForm: FormGroup;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _switchTextClass: AeClassStyle = AeClassStyle.TextRight;
  private _siteData: Site[];
  private _departmentData: Department[];
  private _employmentTypeData: AeSelectItem<string>[];
  private _employmentTypeDataSelectList: Immutable.List<AeSelectItem<string>>;
  private _siteDataSelectList: Immutable.List<AeSelectItem<string>>;
  private _departmentDataSelectList: Immutable.List<AeSelectItem<string>>;
  private _holidayUnitTypeDataSelectList: Immutable.List<AeSelectItem<number>>;
  private _visibleOther: boolean = true;
  private _jobTitlesData: AeSelectItem<string>[];
  private _currentJobTitle: AeSelectItem<string>[];
  private _dsType: AeDatasourceType = AeDatasourceType.Local;
  private _submitted: boolean = false;
  private _jobTitleSubscription: Subscription;
  private _employeeSettings: EmployeeSettings;
  private _showEmpHWPUpdatePanel: boolean;
  private _selectedHWPId: string;
  private _showJobTitleAddForm: boolean = false;
  private _jobTitleAddSubscription: Subscription;
  private _datasourceSelectedJobTitle: any[] = [{ Value: '', Text: '' }];
  private _hwpFromModel: {
    Id: string,
    Name: string
  } = {
    Id: null,
    Name: ''
  };
  private _numberType: AeInputType;
  // End of private Fields

  // Public properties
  // Input properties declarations
  @Input('EmployeeJobDetails')
  get EmployeeJobDetails(): EmployeeJobDetails {
    return this._employeeJobDetails;
  }
  set EmployeeJobDetails(value: EmployeeJobDetails) {
    this._employeeJobDetails = Object.assign({}, value);

    if (!isNullOrUndefined(this._employeeJobDetails)) {
      this._hwpFromModel = {
        Id: this._employeeJobDetails.HolidayWorkingProfileId,
        Name: this._employeeJobDetails.HolidayWorkingProfileName
      };
    }
  }
  @Input('Sites')
  get Sites(): Site[] {
    return this._siteData;
  }
  set Sites(value: Site[]) {
    this._siteData = value;
  }
  @Input('Departments')
  get Departments(): Department[] {
    return this._departmentData;
  }
  set Departments(value: Department[]) {
    this._departmentData = value;
  }
  @Input('EmploymentTypes')
  get EmploymentTypes(): AeSelectItem<string>[] {
    return this._employmentTypeData;
  }
  set EmploymentTypes(value: AeSelectItem<string>[]) {
    this._employmentTypeData = value;
  }
  @Input('JobTitles')
  get JobTitles(): AeSelectItem<string>[] {
    return this._jobTitlesData;
  }
  set JobTitles(value: AeSelectItem<string>[]) {
    this._jobTitlesData = value;
  }
  @Input('EmployeeSettings')
  get EmployeeSettings(): EmployeeSettings {
    return this._employeeSettings;
  }
  set EmployeeSettings(value: EmployeeSettings) {
    this._employeeSettings = value;
  }

  public get lightClass() {
    return this._lightClass;
  }
  public get showEmpHWPUpdatePanel() {
    return this._showEmpHWPUpdatePanel;
  }
  public get selectedHWPId() {
    return this._selectedHWPId;
  }


  get employeeJobDetailsUpdateForm(): FormGroup {
    return this._employeeJobDetailsUpdateForm;
  }
  get dsType(): AeDatasourceType {
    return this._dsType;
  }
  get departmentDataSelectList(): Immutable.List<AeSelectItem<string>> {
    return this._departmentDataSelectList;
  }
  get employmentTypeDataSelectList(): Immutable.List<AeSelectItem<string>> {
    return this._employmentTypeDataSelectList;
  }
  get siteDataSelectList(): Immutable.List<AeSelectItem<string>> {
    return this._siteDataSelectList;
  }
  get visibleOther(): boolean {
    return this._visibleOther;
  }
  get switchTextClass(): AeClassStyle {
    return this._switchTextClass;
  }
  get employeeJobDetails(): EmployeeJobDetails {
    return this._employeeJobDetails;
  }
  get holidayUnitTypeDataSelectList(): Immutable.List<AeSelectItem<number>> {
    return this._holidayUnitTypeDataSelectList;
  }
  get datasourceSelectedJobTitle() {
    return this._datasourceSelectedJobTitle;
  }
  get numberType() {
    return this._numberType;
  }
  // Output properties declarations
  @Output('aeClose')
  private _aeClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('aeSubmit')
  private _submitJobDetails: EventEmitter<EmployeeJobDetails> = new EventEmitter<EmployeeJobDetails>();

  @Output()
  expandParentContainer: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output()
  collapseParentContainer: EventEmitter<boolean> = new EventEmitter<boolean>();
  //End of Public properties

  //constructor start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
  }
  //end of constructor

  //public method start
  ngOnInit() {
    this._numberType = AeInputType.number;
    if (this._siteData) {
      this._siteDataSelectList = mapSiteLookupTableToAeSelectItems(this._siteData);
    }
    if (this._departmentData) {
      this._departmentDataSelectList = mapLookupTableToAeSelectItems(this._departmentData);
    }
    if (this._employmentTypeData) {
      this._employmentTypeDataSelectList = mapEmploymentTypeLookupTableToAeSelectItems(this._employmentTypeData);
      let otheremployementTypeId = this._employmentTypeData.find(obj => obj.Text.toLowerCase() == 'other');
      if (!isNullOrUndefined(otheremployementTypeId) && otheremployementTypeId.Value == this._employeeJobDetails.EmploymentTypeId) {
        this._visibleOther = true;
      }
      else {
        this._visibleOther = false;
      }
    }
    this._holidayUnitTypeDataSelectList = getAeSelectItemsFromEnum(HolidayUnitType);
    if (!StringHelper.isNullOrUndefinedOrEmpty(this._employeeJobDetails.JobTitleId)) {
      this._currentJobTitle = [];
      this._currentJobTitle.push(new AeSelectItem(this._employeeJobDetails.JobTitleName, this._employeeJobDetails.JobTitleId, false));
    }
    else {
      this._currentJobTitle = [];
      this._currentJobTitle.push(new AeSelectItem('', '', false));
    }

    if (!isNullOrUndefined(this._employeeJobDetails) &&
      !isNullOrUndefined(this.EmployeeSettings) &&
      isNullOrUndefined(this._employeeJobDetails.Days)) {
      this._employeeJobDetails.Days = this.EmployeeSettings.DaysPerWeek;
    }

    this._initForm();
    this._jobTitleAddSubscription = this._store.let(fromRoot.jobTitleData).subscribe(title => {
      if (!isNullOrUndefined(title)) {
        let jtVal: any[] = [];
        jtVal.push(title.Id)
        this._datasourceSelectedJobTitle = [{ Value: title.Id, Text: title.Name }];
        this._employeeJobDetailsUpdateForm.patchValue({ JobTitle: jtVal });
        this._cdRef.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    if (this._jobTitleSubscription)
      this._jobTitleSubscription.unsubscribe();
    if (!isNullOrUndefined(this._jobTitleAddSubscription)) {
      this._jobTitleAddSubscription.unsubscribe();
    }
  }

  public getUpdateHWPSlideoutState() {
    return this._showEmpHWPUpdatePanel ? 'expanded' : 'collapsed';
  }

  public closeUpdateHWPPanel() {
    this.collapseParentContainer.emit(true);
    this._showEmpHWPUpdatePanel = false;
  }

  public openUpdateEmpHWPPanel() {
    this.expandParentContainer.emit(true);
    this._selectedHWPId = this._employeeJobDetails.HolidayWorkingProfileId;
    this._showEmpHWPUpdatePanel = true;
  }

  public updateEmployeeHWP(e) {
    this.collapseParentContainer.emit(true);
    this._showEmpHWPUpdatePanel = false;
    if (!StringHelper.isNullOrUndefinedOrEmpty(e.Id)) {
      this._employeeJobDetails.HolidayWorkingProfileName = e.Name;
      this._employeeJobDetails.HolidayWorkingProfileId = e.Id;
    } else {
      this._employeeJobDetails.HolidayWorkingProfileName = this._hwpFromModel.Name;
      this._employeeJobDetails.HolidayWorkingProfileId = this._hwpFromModel.Id;
    }
  }
  onJobTitleSearchChange(text: string) {
    this._employeeJobDetailsUpdateForm.get('JobTitle').setValue('');
  }
  fieldHasRequiredError(fieldName: string): boolean {
    return (this._employeeJobDetailsUpdateForm.get(fieldName).hasError('required') && (!this._employeeJobDetailsUpdateForm.get(fieldName).pristine || this._submitted));
  }

  fieldValidHoursAWeek(fieldName: string): boolean {
    let hoursPerWeek = this._employeeJobDetailsUpdateForm.get(fieldName).value;
    let daysValue = this._employeeJobDetailsUpdateForm.get('Days').value;
    let hoursValue = 120;
    if (!isNullOrUndefined(daysValue) && daysValue != 0) {
      hoursValue = daysValue * 24;
    }
    if (hoursPerWeek >= 1 && hoursPerWeek <= hoursValue) {
      return false;
    } else {
      this._employeeJobDetailsUpdateForm.setErrors({ 'HoursAWeekRange': true });
      return true;
    }
  }

  onEmploymentTypeChange(e) {
    if (e.SelectedItem != null && e.SelectedItem.Text == 'Other') {
      this._visibleOther = true;
    }
    else {
      this._employeeJobDetailsUpdateForm.get('OtherEmployeeType').setValue('');
      this._visibleOther = false;
    }
    this._cdRef.markForCheck();
  }
  onUpdateFormSubmit(e) {
    this._submitted = true;
    if (this._employeeJobDetailsUpdateForm.valid) {
      let _empJobDetailsToSave: EmployeeJobDetails = <EmployeeJobDetails>this._employeeJobDetailsUpdateForm.value;
      _empJobDetailsToSave = Object.assign({}, this._employeeJobDetails, _empJobDetailsToSave);
      this._submitJobDetails.emit(_empJobDetailsToSave);
    }
  }
  onUpdateFormClosed(e) {
    this._aeClose.emit(false);
    this._store.dispatch(new ClearJobTitleAction(true));
  }
  //End of public methods

  // Private methods start
  private _initForm() {
    this._employeeJobDetailsUpdateForm = this._fb.group({
      JobTitle: [{ value: this._currentJobTitle, disabled: false }, [Validators.required]],
      DepartmentId: [{ value: this._employeeJobDetails.DepartmentId || '', disabled: false }],
      SiteId: [{ value: this._employeeJobDetails.SiteId || '', disabled: false }],
      EmploymentTypeId: [{ value: this._employeeJobDetails.EmploymentTypeId || '', disabled: false }],
      OtherEmployeeType: [{ value: this._employeeJobDetails.OtherEmployeeType, disabled: false }],
      Days: [{ value: this._employeeJobDetails.Days, disabled: false }, [CommonValidators.min(1), CommonValidators.max(7)]],
      HoursAWeek: [{ value: this._employeeJobDetails.HoursAWeek, disabled: false }, [Validators.required]],
      StartDate: [{ value: this._employeeJobDetails.StartDate ? new Date(this._employeeJobDetails.StartDate) : null, disabled: false }, [Validators.required]],
      EmployeeNumber: [{ value: this._employeeJobDetails.EmployeeNumber, disabled: false }],
      HolidayUnitType: [{ value: this._employeeJobDetails.HolidayUnitType, disabled: false }, [Validators.required]],
      HolidayEntitlement: [{ value: isNullOrUndefined(this._employeeJobDetails.HolidayEntitlement) && !isNullOrUndefined(this._employeeSettings) ? this._employeeSettings.HolidayEntitlement : this._employeeJobDetails.HolidayEntitlement, disabled: false },[CommonValidators.min(0), CommonValidators.max(300)]], CarryForwardedUnits: [{ value: this._employeeJobDetails.CarryForwardedUnits, disabled: true }],
      ExpiredCarryForwardedUnits: [{ value: this._employeeJobDetails.ExpiredCarryForwardedUnits, disabled: true }],
      CarryForwardedUnitType: [{ value: this._employeeJobDetails.CarryForwardedUnitType, disabled: true }],
      ProbationaryPeriod: [{ value: this._employeeJobDetails.ProbationaryPeriod, disabled: false }, [CommonValidators.min(0), CommonValidators.max(24)]],
      HomeBased: [{ value: this._employeeJobDetails.HomeBased, disabled: false }],
      HolidayWorkingProfileName: [{ value: this._employeeJobDetails.HolidayWorkingProfileName, disabled: true }],
    });

    this._jobTitleSubscription = this._employeeJobDetailsUpdateForm.get('JobTitle').valueChanges.subscribe((selectedItems) => {
      if (selectedItems.length > 0)
        this._employeeJobDetails.JobTitleId = selectedItems[0];
      else
        this._employeeJobDetails.JobTitleId = '';
    });
  }

  private _onClearJobTitle(e) {

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
  // End of private methods
}
