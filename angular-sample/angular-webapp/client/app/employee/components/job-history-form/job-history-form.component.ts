import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { extractWorkspaceSelectOptionListData } from '../../common/extract-helpers';
import {
  createSelectOptionFromArrayList,
  extractEmployeeSalarySelectOptionListData,
  extractWorkspaceTypesSelectOptionsList
} from '../../common/extract-helpers';
import {
  LoadPeriodOptionAction,
  UserLoadAction,
  WorkSpaceTypeLoadAction,
  EmploymentStatusLoadAction,
  EmploymentTypeLoadAction
} from '../../../shared/actions/lookup.actions';
import {
  LoadJobTitleOptioAction,
  LoadSitesAction,
  LoadAllDepartmentsAction
} from '../../../shared/actions/company.actions';
import { CommonValidators } from '../../../shared/validators/common-validators';
import { subscribeOn } from 'rxjs/operator/subscribeOn';
import { Subscribable } from 'rxjs/Observable';
import { AeInputType } from '../../../atlas-elements/common/ae-input-type.enum';
import { JobHistoryService } from '../../services/job-history-service';
import { Period } from '../../models/period';
import { JobHistory } from '../../models/job-history';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { emailFieldValidator } from '../../common/employee-validators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
  OnChanges
} from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocaleService, TranslationService } from 'angular-l10n';

@Component({
  selector: 'job-history-form',
  templateUrl: './job-history-form.component.html',
  styleUrls: ['./job-history-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class JobHistoryFormComponent extends BaseComponent implements OnInit {
  //private field 
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _jobHistory: JobHistory;
  private _jobHistoryForm: FormGroup;
  private _salaryJobTitleSubscription: Subscription;
  private _departmentSubscription: Subscription;
  private _siteSubscription: Subscription;
  private _userSubscription: Subscription;
  private _getJobHistoryAddUpdateInProgressStatusSubscription: Subscription;
  private _populateUpdateFormData: Subscription;
  private _jobTitleStatusSubscription: Subscription;
  private _departmentStatusSubscription: Subscription;
  private _siteStatusSubscription: Subscription;
  private _userStatusSubscription: Subscription;
  private _workSpaceTypeLoadingSubscription: Subscription;
  private _employmentStatusLoadingSubscription: Subscription;
  private _employmentTypeLoadingSubscription: Subscription;
  private _employmentStatusSubscription: Subscription;
  private _employmentTypeSubscription: Subscription;
  private _workSpaceTypeSubscription: Subscription;
  private _populateJobHistoryDateForUpdateStatus: Subscription;
  private _jobTitleOptionList: Immutable.List<AeSelectItem<string>>;
  private _departmentOptionList: Immutable.List<AeSelectItem<string>>;
  private _userOptionList: Immutable.List<AeSelectItem<string>>;
  private _siteOptionList: Immutable.List<AeSelectItem<string>>;
  private _employmentStatusOptionList: Immutable.List<AeSelectItem<string>>;
  private _employmentTypeOptionList: Immutable.List<AeSelectItem<string>>;
  private _workSpaceTypeOptionList: Immutable.List<AeSelectItem<string>>;
  private _isOtherJobType: boolean;


  private _employeePeriodOptionList: Immutable.List<AeSelectItem<string>>;
  private _submitted: boolean = false;
  private _toggleJobHistoryForm: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private _addOrUpdateActionType: string = "";
  private _hasDateComparisionError: boolean = false;
  private _isFormContentLoaded: boolean = false;
  private _titleText: string;
  private _buttonText: string;
  private _isFinishDateRequired: boolean = false;

  public get isFinishDateRequired(): boolean {
    return this._isFinishDateRequired;
  }

  /**
 *Member to specify whether to show/hide icon for checkbox
 * default value is false
 * @type {boolean}
 * @memberOf AeCheckboxComponent
 */
  @Input('addOrUpdateActionType')
  get addOrUpdateActionType() {
    return this._addOrUpdateActionType;
  }
  set addOrUpdateActionType(val: string) {
    this._addOrUpdateActionType = val;
  }

  @Input('toggleForm')
  get toggleSalaryHistoryForm() {
    return this._toggleJobHistoryForm.getValue();
  }
  set toggleSalaryHistoryForm(val: string) {
    this._toggleJobHistoryForm.next(val);
  }

  @Output('onCancel') _onCancel: EventEmitter<string>;
  @Output('OnSaveComplete') _OnSaveComplete: EventEmitter<boolean>;

  /**
   * 
   * 
   * @private
   * @type {AeInputType}
   * @memberOf SalaryHistoryFormComponent
   */
  private _ctrlType: AeInputType = AeInputType.number;
  private _currentJobCheckboxText: string;
  //public propertes start
  get isFormContentLoaded(): boolean {
    return this._isFormContentLoaded;
  }
  get jobHistoryForm(): FormGroup {
    return this._jobHistoryForm;
  }
  get currentJobCheckboxText(): string {
    return this._currentJobCheckboxText;
  }
  get jobTitleOptionList(): Immutable.List<AeSelectItem<string>> {
    return this._jobTitleOptionList;
  }
  get departmentOptionList(): Immutable.List<AeSelectItem<string>> {
    return this._departmentOptionList;
  }
  get siteOptionList(): Immutable.List<AeSelectItem<string>> {
    return this._siteOptionList;
  }
  get userOptionList(): Immutable.List<AeSelectItem<string>> {
    return this._userOptionList;
  }
  get employmentStatusOptionList(): Immutable.List<AeSelectItem<string>> {
    return this._employmentStatusOptionList;
  }
  get employmentTypeOptionList(): Immutable.List<AeSelectItem<string>> {
    return this._employmentTypeOptionList;
  }
  get workSpaceTypeOptionList(): Immutable.List<AeSelectItem<string>> {
    return this._workSpaceTypeOptionList;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  //public properties end
  //constructor start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _jobHistoryService: JobHistoryService
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
    this._isOtherJobType = false;
    this._onCancel = new EventEmitter<string>();
    this._OnSaveComplete = new EventEmitter<boolean>();
    this._jobHistory = new JobHistory();
    this._currentJobCheckboxText = this._translationService.translate('EMPLOYEE_JOB_HISTORY.is_current_job');

  }
  //end of constructor
  // Private methods start
  private _initForm() {
    this._jobHistoryForm = this._fb.group({
      JobTitleId: [{ value: this._jobHistory.JobTitleId, disabled: false }, [Validators.required]],
      DepartmentId: [{ value: this._jobHistory.DepartmentId, disabled: false }, [Validators.required]],
      SiteId: [{ value: this._jobHistory.SiteId, disabled: false }, [Validators.required]],
      ReportTo: [{ value: this._jobHistory.ReportTo, disabled: false }],
      JobStartDate: [{ value: this._jobHistory.JobStartDate ? new Date(this._jobHistory.JobStartDate) : null, disabled: false }, [Validators.required]],
      JobFinishDate: [{ value: this._jobHistory.JobFinishDate ? new Date(this._jobHistory.JobFinishDate) : null, disabled: false }, [Validators.required]],
      EmployeeStatusId: [{ value: this._jobHistory.EmployeeStatusId, disabled: false }, [Validators.required, CommonValidators.max(168)]],
      EmploymentTypeId: [{ value: this._jobHistory.EmploymentTypeId, disabled: false }, [Validators.required]],
      EmploymentGroup: [{ value: this._jobHistory.EmploymentGroup, disabled: false }],
      WorkSpaceId: [{ value: this._jobHistory.WorkSpaceId, disabled: false }],
      IsCurrentJob: [{ value: this._jobHistory.IsCurrentJob, disabled: false }],
      OtherEmployeeType: [{ value: this._jobHistory.OtherEmployeeType, disabled: false }]
    });

    //conditional validation in case of update form
    this._conditionalFinishDateValidation(this._jobHistory.IsCurrentJob);

    this._jobHistoryForm.get('IsCurrentJob').valueChanges.subscribe((val) => {
      this._conditionalFinishDateValidation(val);
    });

    this._setOtherJobType(this._jobHistoryForm.get('EmploymentTypeId').value);
    this._jobHistoryForm.get('EmploymentTypeId').valueChanges.subscribe((val) => {
      this._setOtherJobType(val);
    });

  }

  private _conditionalFinishDateValidation(IsCurrentJob: boolean): void {
    let FinishDateControl = this._jobHistoryForm.get('JobFinishDate');
    if (IsCurrentJob) {
      FinishDateControl.setValidators(null);
      this._isFinishDateRequired = false;
    } else {
      FinishDateControl.setValidators([Validators.required]);
      this._isFinishDateRequired = true;
    }
    FinishDateControl.updateValueAndValidity();
  }

  private _setOtherJobType(val: string): void {
    if (this._employmentTypeOptionList) {
      if (val === this._employmentTypeOptionList.find((obj) => obj.Text == 'Other').Value) {
        this._isOtherJobType = true;
      } else {
        this._jobHistoryForm.controls['OtherEmployeeType'].setValue(null);
        this._isOtherJobType = false;
      }
    }
    this._cdRef.markForCheck();
  }
  private _fieldHasMaxError(fieldName: string): boolean {
    return this._jobHistoryForm.get(fieldName).hasError('max');
  }
  //private methods end
  //public methods start
  ngOnInit() {

    //Dispatch action to load Job Title Option status.
    this._jobTitleStatusSubscription = this._store.let(fromRoot.getJobTitleOptionListDataStatus).subscribe((res) => {
      if (!res) {
        this._store.dispatch(new LoadJobTitleOptioAction(true));
      }
    });

    //Dispatch action to load Department Option status.
    this._departmentSubscription = this._store.let(fromRoot.getAllDepartmentsData).subscribe((res) => {
      if (isNullOrUndefined(res)) {
        this._store.dispatch(new LoadAllDepartmentsAction());
      }
      else {
        this._departmentOptionList = Immutable.List<AeSelectItem<string>>(createSelectOptionFromArrayList(res, "Id", "Name"));
        this._cdRef.markForCheck();
      }
    });

    //Dispatch action to load site Location Option status.
    this._siteStatusSubscription = this._store.let(fromRoot.getSiteLoadingState).subscribe((res) => {
      if (!res) {
        this._store.dispatch(new LoadSitesAction(false));
      }
    });

    //Dispatch action to load userList.
    this._userStatusSubscription = this._store.let(fromRoot.userListDataLoadStatus).subscribe((res) => {
      if (!res) {
        this._store.dispatch(new UserLoadAction(true));
      }
    });

    //Dispatch action to load employmentStatus option
    this._employmentStatusLoadingSubscription = this._store.let(fromRoot.getEmploymentStatusListLoadingStatus).subscribe((res) => {
      if (!res) {
        this._store.dispatch(new EmploymentStatusLoadAction(true));
      }
    });

    //Dispatch action to load employmentType option
    this._employmentTypeLoadingSubscription = this._store.let(fromRoot.getEmploymentTypeListLoadingStatus).subscribe((res) => {
      if (!res) {
        this._store.dispatch(new EmploymentTypeLoadAction(true));
      }
    });

    //Dispatch action to load WorkSpace Type option
    this._workSpaceTypeLoadingSubscription = this._store.let(fromRoot.getWorkSpaceTypeListLoadingStatus).subscribe((res) => {
      if (!res) {
        this._store.dispatch(new WorkSpaceTypeLoadAction(true));
      }
    });


    this._initForm();

    //Subscription to get Job Title Option Data
    this._salaryJobTitleSubscription = this._store.let(fromRoot.getJobTitleOptionListData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._jobTitleOptionList = Immutable.List<AeSelectItem<string>>(res);
        this._cdRef.markForCheck();
      }
    });


    //Subscription to get Job Title Option Data, using existing effect
    this._userSubscription = this._store.let(fromRoot.getUserListData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._userOptionList = Immutable.List<AeSelectItem<string>>(res);
        this._cdRef.markForCheck();
      }
    });

    //Subscription to get Site Location Option Data, using existing effect
    this._siteSubscription = this._store.let(fromRoot.getSiteData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._siteOptionList = Immutable.List<AeSelectItem<string>>(createSelectOptionFromArrayList(res, "Id", "SiteNameAndPostcode"));
        this._cdRef.markForCheck();
      }
    });

    //Subscription to get employmentStatus List
    this._employmentStatusSubscription = this._store.let(fromRoot.getEmploymentStatusOptionListData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._employmentStatusOptionList = Immutable.List<AeSelectItem<string>>(res);
        this._cdRef.markForCheck();
      }
    });


    //Subscription to get employmentStatus List
    this._employmentTypeSubscription = this._store.let(fromRoot.getEmploymentTypeOptionListData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._employmentTypeOptionList = Immutable.List<AeSelectItem<string>>(res);
        this._setOtherJobType(this._jobHistoryForm.get('EmploymentTypeId').value);
        this._cdRef.markForCheck();
      }
    });

    //Subscription to get employmentStatus List
    this._workSpaceTypeSubscription = this._store.let(fromRoot.getWorkSpaceTypeOptionListData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._workSpaceTypeOptionList = extractWorkspaceSelectOptionListData(res);
        this._cdRef.markForCheck();
      }
    });

    //Subscription to load add and update form, and complete action.
    this._getJobHistoryAddUpdateInProgressStatusSubscription = this._store.let(fromRoot.getJobHistoryAddUpdateInProgressStatus).subscribe((IsJobHistoryAddUpdateInProgress) => {
      if (!isNullOrUndefined(IsJobHistoryAddUpdateInProgress)) {
        if (IsJobHistoryAddUpdateInProgress) {
          this._OnSaveComplete.emit(true); //emit to parent component
          this._jobHistoryForm.reset(); //clear form.
          this._cdRef.markForCheck();
        } else {
          this._isFormContentLoaded = false;
          //IsSalaryHistoryAddUpdateInProgress loading form
        }
      }
    });

    //Subscription status for fetching update data loading.
    this._populateJobHistoryDateForUpdateStatus = this._store.let(fromRoot.populateJobHistoryDateForUpdateStatus).subscribe((fetchJobHistoryDataLoading) => {
      if (!isNullOrUndefined(fetchJobHistoryDataLoading)) {
        if (fetchJobHistoryDataLoading) {
          //loading 
          this._isFormContentLoaded = false;
        } else {
          //loaded
          this._isFormContentLoaded = true;
        }
        this._cdRef.markForCheck();
      }
    });

    this._toggleJobHistoryForm.subscribe(status => {
      if (status == 'UPDATE') {
        this._populateUpdateFormData = this._store.let(fromRoot.getEmployeeJobHistoryForSelectedId).subscribe((res) => {
          if (!isNullOrUndefined(res)) {
            this._jobHistory = res;
          } else {
            this._jobHistory = new JobHistory(); //assign empty form object
          }
          this._initForm();
        });
      } else {
        this._jobHistory = new JobHistory(); //assign empty form object
        this._initForm();
      }
    });
  }

  fieldHasRequiredError(fieldName: string): boolean {
    if (this._jobHistoryForm.get(fieldName).hasError('required') && (!this._jobHistoryForm.get(fieldName).pristine || this._submitted)) {
      return true;
    }
    return false;
  }

  private _titleTextReturn(): string {
    if (this._addOrUpdateActionType === "ADD") {
      return this._titleText = "EMPLOYEE_JOB_HISTORY.add_form_title";
    } else {
      return this._titleText = "EMPLOYEE_JOB_HISTORY.update_form_title";
    }
  }

  public buttonTextReturn(): string {
    if (this._addOrUpdateActionType === "ADD") {
      return this._buttonText = "BUTTONS.ADD";
    } else {
      return this._buttonText = "BUTTONS.UPDATE";
    }
  }
  /**
   * validate StartDate, FinishDate
   * 
   * @private
   * @returns {boolean}
   * 
   * @memberOf SalaryHistoryFormComponent
   */
  fieldHasDateComparisonError(): boolean {
    //check for empty value 
    if (!!!this._jobHistoryForm.get('JobStartDate').value || !!!this._jobHistoryForm.get('JobFinishDate').value) {
      this._hasDateComparisionError = false;
      return false;
    }
    let StartDate = new Date(this._jobHistoryForm.get('JobStartDate').value);
    let FinishDate = new Date(this._jobHistoryForm.get('JobFinishDate').value);
    if (StartDate > FinishDate) {
      this._hasDateComparisionError = true;
      return true;
    }
    else {
      this._hasDateComparisionError = false;
      return false
    }

  }


  /**
   * Submit form(add/update)
   * 
   * @private
   * @param {any} e
   * 
   * @memberOf SalaryHistoryFormComponent
   */
  onJobHistoryFormSubmit(e) {
    this._submitted = true;
    if (this._jobHistoryForm.valid) {
      //dispatch an action to save form
      let _formDataToSave: JobHistory = Object.assign({}, this._jobHistory, <JobHistory>this._jobHistoryForm.value);
      if (this._addOrUpdateActionType === 'ADD') {
        this._jobHistoryService._createJobHistory(_formDataToSave); //save action
      } else {
        this._jobHistoryService._updateJobHistory(_formDataToSave); //save action
      }
    }
  }


  /**
  * on slide-out pop cancel
  * @private
  * @param {any} e 
  * 
  * @memberOf SalaryHistoryFormComponent
  */
  onJobFormClosed(e) {
    this._jobHistoryForm.reset(); //clear form.
    this._onCancel.emit('add');
  }

  /**
   * Max validation
   * 
   * @private
   * @param {string} fieldName 
   * @returns {boolean} 
   * 
   * @memberOf TaskUpdateComponent
   */

  ngOnDestroy() {
    this._salaryJobTitleSubscription.unsubscribe();
    this._departmentSubscription.unsubscribe();
    this._siteSubscription.unsubscribe();
    this._userSubscription.unsubscribe();
    this._getJobHistoryAddUpdateInProgressStatusSubscription.unsubscribe();
    this._jobTitleStatusSubscription.unsubscribe();
    this._siteStatusSubscription.unsubscribe();
    this._userStatusSubscription.unsubscribe();
    this._workSpaceTypeLoadingSubscription.unsubscribe();
    this._employmentStatusLoadingSubscription.unsubscribe();
    this._employmentTypeLoadingSubscription.unsubscribe();
    this._employmentStatusSubscription.unsubscribe();
    this._employmentTypeSubscription.unsubscribe();
    this._workSpaceTypeSubscription.unsubscribe();
    this._populateJobHistoryDateForUpdateStatus.unsubscribe();
  }
  //public methods end
}
