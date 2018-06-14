import { BaseComponent } from '../../../shared/base-component';
import { AeDataActionTypes } from '../../models/action-types.enum';
import { EmployeePreviousEmploymentHistoryService } from '../../services/employee-previous-employment-history.service';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs/Rx';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PreviousEmployment } from '../../models/previous-employment';
import { BaseElement } from '../../../atlas-elements/common/base-element';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import * as fromRoot from '../../../shared/reducers';
import { DatePipe } from "@angular/common";
import { TranslationService, LocaleService } from 'angular-l10n';

@Component({
  selector: 'previous-employment-add-update',
  templateUrl: './previous-employment-add-update.component.html',
  //styleUrls: ['./previous-employment-add-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviousEmploymentAddUpdateComponent extends BaseComponent implements OnInit {
  private _updatePreviousEmploymentDetails: PreviousEmployment;
  private _updatePreviousEmploymentHistoryForm: FormGroup;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _toggleUpdateForm: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _action: string;
  private _hasDateComparisionError: boolean = false;
  private _isFormSubmitted: boolean;

  public get lightClass() {
    return this._lightClass;
  }

  public get updatePreviousEmploymentHistoryForm() {
    return this._updatePreviousEmploymentHistoryForm;
  }

  @Input('toggle')
  set toggleUpdateForm(val: boolean) {
    this._toggleUpdateForm.next(val);
  }
  get toggleUpdateForm() {
    return this._toggleUpdateForm.getValue();
  }
  
  @Input('action')
  set action(val: string) {
    this._action = val;
  }
  get action() {
    return this._action;
  }
  
  @Input('data')
  set data(val: PreviousEmployment) {
    this._updatePreviousEmploymentDetails = val;
  }
  get data() {
    return this._updatePreviousEmploymentDetails;
  }
  
  @Output('aeClose')
  private _aeClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _employeePrevEmploymentService: EmployeePreviousEmploymentHistoryService
    , private _datePipe: DatePipe) {
    super(_localeService, _translationService, _cdRef);
  }

  ngOnInit() {
    if (this._action == AeDataActionTypes.Add) {
      this._initAddForm();
    } else if (this._action == AeDataActionTypes.Update) {
      this._initUpdateForm();
    }
  }

  private _initUpdateForm() {
    this._updatePreviousEmploymentHistoryForm = this._fb.group({
      EmployerNameAndAddress: [{ value: this._updatePreviousEmploymentDetails.EmployerNameAndAddress ? this._updatePreviousEmploymentDetails.EmployerNameAndAddress : null, disabled: false }, Validators.required],
      JobTitleAndRoles: [{ value: this._updatePreviousEmploymentDetails.JobTitleAndRoles ? this._updatePreviousEmploymentDetails.JobTitleAndRoles : null, disabled: false }],
      StartDate: [{ value: this._updatePreviousEmploymentDetails.StartDate ? new Date(this._updatePreviousEmploymentDetails.StartDate) : null, disabled: false }],
      EndDate: [{ value: this._updatePreviousEmploymentDetails.EndDate ? new Date(this._updatePreviousEmploymentDetails.EndDate) : null, disabled: false }],
      ReasonForLeaving: [{ value: this._updatePreviousEmploymentDetails.ReasonForLeaving ? this._updatePreviousEmploymentDetails.ReasonForLeaving : null, disabled: false }]
    });
  }

  private _initAddForm() {
    this._updatePreviousEmploymentHistoryForm = this._fb.group({
      EmployerNameAndAddress: [{ value: null, disabled: false }, Validators.required],
      JobTitleAndRoles: [{ value: null, disabled: false }],
      StartDate: [{ value: null, disabled: false }],
      EndDate: [{ value: null, disabled: false }],
      ReasonForLeaving: [{ value: null, disabled: false }]
    });
  }

  public fieldHasRequiredError(fieldName: string): boolean {
    if (this._updatePreviousEmploymentHistoryForm.get(fieldName).hasError('required') && (!this._updatePreviousEmploymentHistoryForm.get(fieldName).pristine || this._isFormSubmitted)) {
      return true;
    }
    return false;
  }

  public fieldHasValidDateError(fieldName: string): boolean {
    if (this._updatePreviousEmploymentHistoryForm.dirty && this._updatePreviousEmploymentHistoryForm.get(fieldName).dirty) {
      let _dateToValidate = this._updatePreviousEmploymentHistoryForm.get(fieldName).value;
      return _dateToValidate ? false : true;
    }
  }

  public fieldHasDateComparisonError(): boolean {
    if (!this._updatePreviousEmploymentHistoryForm.get('StartDate').value || !this._updatePreviousEmploymentHistoryForm.get('EndDate').value) {
      this._hasDateComparisionError = false;
      return this._hasDateComparisionError;
    }
    let StartDate = new Date(this._updatePreviousEmploymentHistoryForm.get('StartDate').value);
    let EndDate = new Date(this._updatePreviousEmploymentHistoryForm.get('EndDate').value);
    this._hasDateComparisionError = StartDate > EndDate;
    return this._hasDateComparisionError;
  }

  public onUpdateFormSubmit(e) {
    this._isFormSubmitted = true;
    if (this._updatePreviousEmploymentHistoryForm.valid && !this._hasDateComparisionError) {
      let _prevEmployerDetails: PreviousEmployment = Object.assign({}, this._updatePreviousEmploymentDetails, <PreviousEmployment>this._updatePreviousEmploymentHistoryForm.value);
      if (this._action == AeDataActionTypes.Add) {
        _prevEmployerDetails.Id = null;
        _prevEmployerDetails.StartDate = this._datePipe.transform(_prevEmployerDetails.StartDate, 'yyyy-MM-dd');
        _prevEmployerDetails.EndDate = this._datePipe.transform(_prevEmployerDetails.EndDate, 'yyyy-MM-dd');
        this._employeePrevEmploymentService.AddPreviousEmploymentHistory(_prevEmployerDetails);
      } else if (this._action == AeDataActionTypes.Update) {
        this._employeePrevEmploymentService.UpdatePreviousEmploymentHistory(_prevEmployerDetails);
      }
    }
  }

  public onUpdateFormClosed() {
    this._aeClose.emit(false);
  }

  public isAddForm() {
    return this._action == AeDataActionTypes.Add;
  }

  public isUpdateForm() {
    return this._action == AeDataActionTypes.Update;
  }

}
