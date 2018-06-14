import { isNullOrUndefined } from 'util';
import { NonworkingdaysValidationService } from './../../services/nonworkingdays-validation-service';
import { BehaviorSubject } from 'rxjs/Rx';
import { mapEmployeesToAeSelectItems, mapEmployeKeyValuesToAeSelectItems } from '../../../../employee/common/extract-helpers';
import { EmployeeSearchService } from './../../../../employee/services/employee-search.service';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { CommonHelpers } from './../../../../shared/helpers/common-helpers';
import { Department } from './../../../../calendar/model/calendar-models';
import { LoadSitesAction, LoadAllDepartmentsAction } from './../../../../shared/actions/company.actions';
import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { Store } from '@ngrx/store';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { Observable, Subscription } from 'rxjs/Rx';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NonWorkingdaysModel, HWPAssignToModel } from './../../models/nonworkingdays-model';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { NonworkingdaysOperationmode } from './../../models/nonworkingdays-operationmode-enum';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { mapFormToNonWorkingDayAssignModel, mapFromNonWorkingDaysFullEntity, getValuesToBind, getAssignedToMetaString, mapFromAssignmentModelToHolidayWorkingModel, getFlatValues } from './../../common/extract-helpers';

@Component({
  selector: 'nonworkingdays-assign',
  templateUrl: './nonworkingdays-assign.component.html',
  styleUrls: ['./nonworkingdays-assign.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class NonworkingdaysAssignComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _nonWorkingDaysModel: NonWorkingdaysModel;
  private _nonWorkingDayAssignmentModel: HWPAssignToModel;
  private _nonWorkingDaysAssignForm: FormGroup;
  private _assignedTo: Immutable.List<AeSelectItem<string>> = CommonHelpers.getAssignToMeta();
  private _remoteDataSourceType: AeDatasourceType = AeDatasourceType.Remote;
  private _localDataSourceType: AeDatasourceType = AeDatasourceType.Local;
  private _sites: AeSelectItem<string>[];
  private _departments: AeSelectItem<string>[];
  private _employees: AeSelectItem<string>[];
  private _excludedemployees: AeSelectItem<string>[];
  private _departments$: Observable<AeSelectItem<string>[]>;
  private _sites$: Observable<AeSelectItem<string>[]>;
  private _departmentsSubscription: Subscription;
  private _sitesSubscription: Subscription;
  private _alreadyAssigned: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _searchedEmployeesSub: BehaviorSubject<AeSelectItem<string>[]> = new BehaviorSubject<AeSelectItem<string>[]>(null);
  private _searchedEmployees: AeSelectItem<string>[];
  private _searchedExclemployees: AeSelectItem<string>[];
  private _employeeFilters: Map<string, string> = new Map<string, string>();
  private _selectedAssignedTo: string;
  private _isSubmitted: boolean = false;
  private _originalFormGroup: any;
  // End of Private Fields

  // Public properties
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }

  @Input('nonWorkingdaysModel')
  set NonWorkingdaysModel(val: NonWorkingdaysModel) {
    this._nonWorkingDaysModel = val;
    if (val) {
      this._setFormModel();
      this._cdRef.markForCheck();
    }
  }
  get NonWorkingdaysModel() {
    return this._nonWorkingDaysModel;
  }
  

  get assignedTo() {
    return this._assignedTo;
  }

  get departments$() {
    return this._departments$;
  }

  get localDataSourceType() {
    return this._localDataSourceType;
  }

  get sites() {
    return this._sites;
  }

  get sites$() {
    return this._sites$;
  }

  get searchedEmployeesSub() {
    return this._searchedEmployeesSub;
  }

  get remoteDataSourceType() {
    return this._remoteDataSourceType;
  }

  get alreadyAssigned() {
    return this._alreadyAssigned;
  }

  get nonWorkingDayAssignmentModelAssignedTo() {
    return this._nonWorkingDayAssignmentModel.AssignedTo.AssignTo;
  }

  get nonWorkingDaysAssignForm() {
    return this._nonWorkingDaysAssignForm;
  }
  // End of Public properties

  // Public Output bindings
  @Output()
  aeOnClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  aeOnAssign: EventEmitter<HWPAssignToModel> = new EventEmitter<HWPAssignToModel>();
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
    , private _employeeSearchService: EmployeeSearchService
    , private _nonworkingdaysValidationService: NonworkingdaysValidationService
  ) {
    super(_localeService, _translationService, _changeDetector);

  }
  // End of constructor

  // Private methods
  onAssignedToChange($event) {
    this._selectedAssignedTo = $event.SelectedValue
    //here we need to reset the earlier set values
    this._resetFormValues();
  }
  canCompanyShown(): boolean {
    return this._nonWorkingDaysAssignForm.controls['assignedTo'].value && this._nonWorkingDaysAssignForm.controls['assignedTo'].value == '1';
  }
  canDepartmentShown(): boolean {
    return this._nonWorkingDaysAssignForm.controls['assignedTo'].value && this._nonWorkingDaysAssignForm.controls['assignedTo'].value == '4';
  }
  canSiteShown(): boolean {
    return this._nonWorkingDaysAssignForm.controls['assignedTo'].value && this._nonWorkingDaysAssignForm.controls['assignedTo'].value == '3';
  }
  canEmployeeShown(): boolean {
    return this._nonWorkingDaysAssignForm.controls['assignedTo'].value && this._nonWorkingDaysAssignForm.controls['assignedTo'].value == '17';
  }
  canExcludedEmployeesShown(): boolean {
    return this._nonWorkingDaysAssignForm.controls['assignedTo'].value && (this._nonWorkingDaysAssignForm.controls['assignedTo'].value == '4' || this._nonWorkingDaysAssignForm.controls['assignedTo'].value == '3');
  }
  canAlreadyAssignedMsgShown(): boolean {
    return this._alreadyAssigned.value;
  }
  onSelectSite($event) {
    let initialVal: AeSelectItem<string>[] = [];
    this._nonWorkingDaysAssignForm.patchValue(
      {
        excludedEmployee: initialVal
      }
    );
  }
  onSelectDepartment($event) {
    let selectedDepartments = $event;
    let initialVal: AeSelectItem<string>[] = [];
    this._nonWorkingDaysAssignForm.patchValue(
      {
        excludedEmployee: initialVal
      }
    );
  }

  searchEmployees($event, addFilters: boolean) {
    if (addFilters) {
      //only while searching for excluded employees we are using the site, dept fitlers..
      if (this._selectedAssignedTo == '4') {
        // add department filter      
        this._employeeFilters.set('employeesByDepartmentFilter', getFlatValues(this._nonWorkingDaysAssignForm.controls['department'].value));
      }
      if (this._selectedAssignedTo == '3') {
        //add site filer
        this._employeeFilters.set('employeesByLocationFilter', getFlatValues(this._nonWorkingDaysAssignForm.controls['site'].value))
      }
    }
    this._employeeSearchService.getEmployeesKeyValuePair($event.query, this._employeeFilters).first().subscribe((empData) => {
      this._searchedEmployeesSub.next(mapEmployeKeyValuesToAeSelectItems(empData));
    });
  }
  private _setFormModel() {
    this._nonWorkingDayAssignmentModel = mapFromNonWorkingDaysFullEntity(this._nonWorkingDaysModel);
    this._sites = getValuesToBind(this._nonWorkingDayAssignmentModel, '3');
    this._departments = getValuesToBind(this._nonWorkingDayAssignmentModel, '4');
    this._employees = getValuesToBind(this._nonWorkingDayAssignmentModel, '17');
    this._excludedemployees = getValuesToBind(this._nonWorkingDayAssignmentModel, '-1');
  }
  private _getValues(code: string) {
    return getValuesToBind(this._nonWorkingDayAssignmentModel, code);
  }

  private _getMeta(): string {
    if (this._nonWorkingDayAssignmentModel && this._nonWorkingDayAssignmentModel.AssignedTo)
      return this._nonWorkingDayAssignmentModel.AssignedTo.AssignedToMeta;
    return '';
  }

  getIsDefault(): boolean {
    if (this._nonWorkingDayAssignmentModel && this._nonWorkingDayAssignmentModel.AssignedTo)
      return this._nonWorkingDayAssignmentModel.AssignedTo.IsDefault
    return false;
  }
  private _removeNotRequiredControls(depts: AeSelectItem<string>[], sites: AeSelectItem<string>[], employees: AeSelectItem<string>[], exClemployees: AeSelectItem<string>[]) {
    this._nonWorkingDaysAssignForm.removeControl('site');
    this._nonWorkingDaysAssignForm.removeControl('department');
    this._nonWorkingDaysAssignForm.removeControl('employee');
    switch (this._selectedAssignedTo) {
      case '3':
        this._nonWorkingDaysAssignForm.addControl('site', this._originalFormGroup['site']);
        this._nonWorkingDaysAssignForm.patchValue(
          {
            site: sites,
            excludedEmployee: exClemployees,
            IsDefault: false,
            overrideConfirm: false
          }
        );
        break;
      case '4':
        this._nonWorkingDaysAssignForm.addControl('department', this._originalFormGroup['department']);
        this._nonWorkingDaysAssignForm.patchValue(
          {
            department: depts,
            excludedEmployee: exClemployees,
            IsDefault: false,
            overrideConfirm: false
          }
        );
        break;
      case '17':
        this._nonWorkingDaysAssignForm.addControl('employee', this._originalFormGroup['employee']);
        this._nonWorkingDaysAssignForm.patchValue(
          {
            employee: employees,
            excludedEmployee: exClemployees,
            IsDefault: false,
            overrideConfirm: false
          }
        );
        break;
      default:
        break;
    }
  }
  private _resetFormValues() {
    let initialVal: AeSelectItem<string>[] = [];
    this._removeNotRequiredControls(initialVal, initialVal, initialVal, initialVal);
  }
  private _initForm() {
    this._nonWorkingDaysAssignForm = this._fb.group({
      //assignedTo: [{ value: this._nonWorkingDayAssignmentModel.AssignedTo.AssignedToMeta }, [Validators.required]],
      assignedTo: [{ value: this._getMeta() || '', disabled: false }, [Validators.required]],
      department: [{ value: this._getValues('4'), disabled: false }, [Validators.required]],
      site: [{ value: this._getValues('3'), disabled: false }, [Validators.required]],
      employee: [{ value: this._getValues('17'), disabled: false }, [Validators.required]],
      excludedEmployee: [{ value: this._getValues('-1'), disabled: false }],
      IsDefault: [{ value: this.getIsDefault(), disabled: false }],
      overrideConfirm: [{ value: false, disabled: false }]
    }
    );
    this._originalFormGroup = Object.freeze(Object.assign({}, this._nonWorkingDaysAssignForm.controls));
    this._selectedAssignedTo = this._getMeta() || '';
    this._removeNotRequiredControls(this._getValues('4'), this._getValues('3'), this._getValues('17'), this._getValues('-1'));
  }
  fieldHasRequiredError(fieldName: string): boolean {
    if (isNullOrUndefined(this._nonWorkingDaysAssignForm.get(fieldName)))
      return false;
    else {
      return this._nonWorkingDaysAssignForm.get(fieldName).hasError('required') && (!this._nonWorkingDaysAssignForm.get(fieldName).pristine || this._isSubmitted);
    }
  }

  slideClose($event) {
    this.aeOnClose.emit(true);
  }
  onAddOrUpdateFormSubmit($event) {
    this._isSubmitted = true;
    if (this._nonWorkingDaysAssignForm.valid) {
      // here we need to check for duplicates validation
      this._nonWorkingDayAssignmentModel = mapFormToNonWorkingDayAssignModel(this._nonWorkingDaysModel, this._nonWorkingDayAssignmentModel, this._nonWorkingDaysAssignForm)
      let modifiedNonWorkingDaysModel = mapFromAssignmentModelToHolidayWorkingModel(this._nonWorkingDayAssignmentModel);

      this._nonworkingdaysValidationService.checkForDuplicates(modifiedNonWorkingDaysModel, getAssignedToMetaString(this._nonWorkingDayAssignmentModel.AssignedTo.AssignedToMeta)).first().subscribe((validationData) => {
        if (validationData && validationData.ExistingProfiles && validationData.ExistingProfiles.length > 0 && (this._nonWorkingDaysAssignForm.controls['overrideConfirm'].value != true)) {
          this._alreadyAssigned.next(true);
        }
        else {
          // no duplicates found so emit value to container to save the data..
          this.aeOnAssign.emit(this._nonWorkingDayAssignmentModel);
        }
      });

    }

  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this._initForm();
    this._departments$ = this._store.let(fromRoot.getAllDepartmentsForMultiSelectData);
    this._sites$ = this._store.let(fromRoot.getsitesClientsForMultiSelectData);
    this._departmentsSubscription = this._store.let(fromRoot.getAllDepartmentsData).subscribe(departmentsLoaded => {
      if (!departmentsLoaded)
        this._store.dispatch(new LoadAllDepartmentsAction());
    });

    this._sitesSubscription = this._store.let(fromRoot.getSiteData).subscribe(sites => {
      if (!sites)
        this._store.dispatch(new LoadSitesAction(false));
    });
  }

  ngOnDestroy() {
    if (this._departmentsSubscription)
      this._departmentsSubscription.unsubscribe();
    if (this._sitesSubscription)
      this._sitesSubscription.unsubscribe();
  }
  // End of public methods

}
