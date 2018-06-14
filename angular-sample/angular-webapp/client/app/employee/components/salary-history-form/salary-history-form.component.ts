import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { LoadPeriodOptionAction } from '../../../shared/actions/lookup.actions';
import { LoadJobTitleOptioAction } from '../../../shared/actions/company.actions';
import { CommonValidators } from '../../../shared/validators/common-validators';
import { subscribeOn } from 'rxjs/operator/subscribeOn';
import { Subscribable } from 'rxjs/Observable';
import { AeInputType } from '../../../atlas-elements/common/ae-input-type.enum';
import { SalaryHistoryService } from '../../services/salary-history-service';
import { Period } from '../../models/period';
import { SalaryHistory } from '../../models/salary-history';
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
  selector: 'salary-history-form',
  templateUrl: './salary-history-form.component.html',
  styleUrls: ['./salary-history-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SalaryHistoryFormComponent extends BaseComponent implements OnInit {
  //private field 
  private _salaryHistory: SalaryHistory;
  private _salaryHistoryForm: FormGroup;
  private salaryJobTitleSubscription: Subscription;
  private salaryEmployeePeriodSubscription: Subscription;
  private _getSalaryHistoryAddUpdateInProgressStatusSubscription: Subscription;
  private populateUpdateFormData: Subscription;
  private _jobTitleStatusSubscription: Subscription;
  private _periodOptionListtatusSubscription: Subscription;
  private _populateSalaryHistoryDateForUpdateStatus: Subscription;
  private _jobTitleOptionList: Immutable.List<AeSelectItem<string>>;

  private _employeePeriodOptionList: Immutable.List<AeSelectItem<string>>;
  private _submitted: boolean = false;
  private _toggleSalaryHistoryForm: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private _addOrUpdateActionType: string = "";
  private _hasDateComparisionError: boolean = false;
  private _isFormContentLoaded: boolean = false;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _titleText: string;
  private _buttonText: string;
  private _isFinishDateRequired: boolean =false;

  public get isFormContentLoaded() {
    return this._isFormContentLoaded;
  }

  public get isFinishDateRequired() {
    return this._isFinishDateRequired;
  }

  public get lightClass() {
    return this._lightClass;
  }

  public get salaryHistoryForm() {
    return this._salaryHistoryForm;
  }

  public get jobTitleOptionList() {
    return this._jobTitleOptionList;
  }

  public get ctrlType() {
    return this._ctrlType;
  }

  public get employeePeriodOptionList() {
    return this._employeePeriodOptionList;
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
    return this._toggleSalaryHistoryForm.getValue();
  }
  set toggleSalaryHistoryForm(val: string) {
    this._toggleSalaryHistoryForm.next(val);
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

  //constructor start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _salaryHistoryService: SalaryHistoryService
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
    this._onCancel = new EventEmitter<string>();
    this._OnSaveComplete = new EventEmitter<boolean>();
    this._salaryHistory = new SalaryHistory();

  }
  //end of constructor

  ngOnInit() {

    //Subscription to get Job Title Option.
    this._jobTitleStatusSubscription = this._store.let(fromRoot.getJobTitleOptionListDataStatus).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        if (!res) {
          this._store.dispatch(new LoadJobTitleOptioAction(true));
        }
      }
    });

    //Subscription to get salary Period Option.
    this._periodOptionListtatusSubscription = this._store.let(fromRoot.getPeriodOptionListLoadingStatus).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        if (!res) {
          this._store.dispatch(new LoadPeriodOptionAction(true));
        }
      }
    });



    this._initForm();

    //Subscription to Employee Period
    this.salaryEmployeePeriodSubscription = this._store.let(fromRoot.getPeriodOptionListData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._employeePeriodOptionList = Immutable.List<AeSelectItem<string>>(res);
        this._cdRef.markForCheck();
      }
    });

    //Subscription to get Job Title Option.
    this.salaryJobTitleSubscription = this._store.let(fromRoot.getJobTitleOptionListData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._jobTitleOptionList = Immutable.List<AeSelectItem<string>>(res);
        this._cdRef.markForCheck();
      }
    });

    //Subscription to load add and update form, and complete action.
    this._getSalaryHistoryAddUpdateInProgressStatusSubscription = this._store.let(fromRoot.getSalaryHistoryAddUpdateInProgressStatus).subscribe((IsSalaryHistoryAddUpdateInProgress) => {
      if (!isNullOrUndefined(IsSalaryHistoryAddUpdateInProgress)) {
        if (IsSalaryHistoryAddUpdateInProgress) {
          this._OnSaveComplete.emit(true); //emit to parent component
          this._salaryHistoryForm.reset(); //clear form.
          this._cdRef.markForCheck();
        } else {
          this._isFormContentLoaded = false;
          //IsSalaryHistoryAddUpdateInProgress loading form
        }
      }
    });

    //Subscription status for fetching update data loading.
    this._populateSalaryHistoryDateForUpdateStatus = this._store.let(fromRoot.populateSalaryHistoryDateForUpdateStatus).subscribe((fetchSalaryHistoryDataLoading) => {
      if (!isNullOrUndefined(fetchSalaryHistoryDataLoading)) {
        if (fetchSalaryHistoryDataLoading) {
          //loading 
          this._isFormContentLoaded = false;
        } else {
          //loaded
          this._isFormContentLoaded = true;
        }
        this._cdRef.markForCheck();
      }
    });

    this._toggleSalaryHistoryForm.subscribe(status => {
      if (status == 'UPDATE') {
        this.populateUpdateFormData = this._store.let(fromRoot.getEmployeeSalaryHistoryForSelectedId).subscribe((res) => {
          if (!isNullOrUndefined(res)) {
            this._salaryHistory = res;
          } else {
            this._salaryHistory = new SalaryHistory(); //assign empty form object
          }
          this._initForm();
        });
      } else {
        this._salaryHistory = new SalaryHistory(); //assign empty form object
        this._initForm();
      }
    });
  }

  /**
  * on slide-out pop cancel
  * @private
  * @param {any} e 
  * 
  * @memberOf SalaryHistoryFormComponent
  */
  public onSalaryFormClosed(e) {
    this._salaryHistoryForm.reset(); //clear form.
    this._onCancel.emit('add');
  }

  /**
  * Submit form(add/update)
  * 
  * @private
  * @param {any} e
  * 
  * @memberOf SalaryHistoryFormComponent
  */
  public onSalaryHistoryFormSubmit(e) {
    this._submitted = true;
    if (this._salaryHistoryForm.valid && !this._hasDateComparisionError) {
      //dispatch an action to save form
      let _formDataToSave: SalaryHistory = Object.assign({}, this._salaryHistory, <SalaryHistory>this._salaryHistoryForm.value);
      if (this._addOrUpdateActionType === 'ADD') {
        this._salaryHistoryService._createSalaryHistory(_formDataToSave); //save action
      } else {
        this._salaryHistoryService._updateSalaryHistory(_formDataToSave); //save action
      }
    }
  }

  public fieldHasRequiredError(fieldName: string): boolean {
    if (this._salaryHistoryForm.get(fieldName).hasError('required') && (!this._salaryHistoryForm.get(fieldName).pristine || this._submitted)) {
      return true;
    }
    return false;
  }


  /**
   * validate StartDate, FinishDate
   * 
   * @private
   * @returns {boolean}
   * 
   * @memberOf SalaryHistoryFormComponent
   */
  public fieldHasDateComparisonError(): boolean {
    //check for empty value 
    if (!!!this._salaryHistoryForm.get('StartDate').value || !!!this._salaryHistoryForm.get('FinishDate').value) {
      this._hasDateComparisionError = false;
      return false;
    }
    let StartDate = new Date(this._salaryHistoryForm.get('StartDate').value);
    let FinishDate = new Date(this._salaryHistoryForm.get('FinishDate').value);
    if (StartDate > FinishDate) {
      this._hasDateComparisionError = true;
      return true;
    }
    else {
      this._hasDateComparisionError = false;
      return false
    }

  }

  public titleTextReturn(): string {
    if (this._addOrUpdateActionType === "ADD") {
      return this._titleText = "EMPLOYEE_SALARY_HISTORY.ADD_SALARY";
    } else {
      return this._titleText = "EMPLOYEE_SALARY_HISTORY.UPDATE_SALARY";
    }
  }
    public buttonTextReturn(): string {
    if (this._addOrUpdateActionType === "ADD") {
      return this._buttonText = "BUTTONS.ADD";
    } else {
      return this._buttonText = "BUTTONS.UPDATE";
    }
  }
  

  private _conditionalFinishDateValidation(isCurrentJob: boolean) {
    let FinishDateControl = this._salaryHistoryForm.get('FinishDate');
    if (isCurrentJob) {
      FinishDateControl.setValidators(null);
      this._isFinishDateRequired = false;
    } else {
      FinishDateControl.setValidators([Validators.required]);
      this._isFinishDateRequired = true;
    }
    FinishDateControl.updateValueAndValidity();
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
  public fieldHasMaxError(fieldName: string): boolean {
    return this._salaryHistoryForm.get(fieldName).hasError('max');
  }


  // Private methods start
  private _initForm() {
    this._salaryHistoryForm = this._fb.group({
      JobTitleId: [{ value: this._salaryHistory.JobTitleId, disabled: false }, [Validators.required]],
      Pay: [{ value: this._salaryHistory.Pay, disabled: false }],
      EmployeePeriodId: [{ value: this._salaryHistory.EmployeePeriodId, disabled: false }],
      ReasonForChange: [{ value: this._salaryHistory.ReasonForChange, disabled: false }],
      StartDate: [{ value: this._salaryHistory.StartDate ? new Date(this._salaryHistory.StartDate) : null, disabled: false }, [Validators.required]],
      FinishDate: [{ value: this._salaryHistory.FinishDate ? new Date(this._salaryHistory.FinishDate) : null, disabled: false }, [Validators.required]],
      HoursAWeek: [{ value: this._salaryHistory.HoursAWeek, disabled: false }, [Validators.required, CommonValidators.max(168)]],      
      IsCurrentSalary: [{ value: this._salaryHistory.IsCurrentSalary, disabled: false }]
    });
    //conditional validation in case of update form
    this._conditionalFinishDateValidation(this._salaryHistory.IsCurrentSalary);
    this._salaryHistoryForm.get('IsCurrentSalary').valueChanges.subscribe((val) => {
      this._conditionalFinishDateValidation(val);
    });

  }

  ngOnDestroy() {
    this.salaryJobTitleSubscription.unsubscribe();
    this.salaryEmployeePeriodSubscription.unsubscribe();
    this._populateSalaryHistoryDateForUpdateStatus.unsubscribe();
    this._getSalaryHistoryAddUpdateInProgressStatusSubscription.unsubscribe();
    this._jobTitleStatusSubscription.unsubscribe();
    this._periodOptionListtatusSubscription.unsubscribe()
  }


}
