import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { EmployeePayrollDetails } from '../../../models/employee.model';
import { Subscription } from 'rxjs/Rx';
import { AeInputType } from '../../../../atlas-elements/common/ae-input-type.enum';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import * as fromRoot from './../../../../shared/reducers';
import { Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from "util";

@Component({
  selector: 'employee-benefits-update',
  templateUrl: './employee-benefits-update.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeBenefitsUpdateComponent extends BaseComponent implements OnInit {

  private _updateEmpForm: FormGroup;
  private _showSlide: boolean;
  private _inputType: AeInputType = AeInputType.text;
  private _employeePayroll: EmployeePayrollDetails;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _submitted: boolean = false;

  @Input('employeePayrollDetails')
  get employeePayrollDetails() {
    return this._employeePayroll;
  }
  set employeePayrollDetails(val: EmployeePayrollDetails) {
    this._employeePayroll = val;
  }

  @Output('benefitsSliderClose')
  private _benefitsSliderClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output('benefitsSave')
  private _benefitsSave: EventEmitter<EmployeePayrollDetails> = new EventEmitter<EmployeePayrollDetails>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _cdRef);
  }

  onCancel(e) {
    this._benefitsSliderClose.emit(false);
  }

  fieldHasError(fieldName: string): boolean {
    return (this._updateEmpForm.get(fieldName).hasError('required') && (!this._updateEmpForm.get(fieldName).pristine || this._submitted));
  }

  private _initForm() {
    this._updateEmpForm = this._fb.group({
      PensionScheme: [{ value: this._employeePayroll.PensionScheme, disabled: false },[Validators.required]]
    });
  }
  
  private _mapToDataModel() {
    this._employeePayroll.PensionScheme = this._updateEmpForm.controls['PensionScheme'].value;
  }

  onUpdateFormSubmit(e) {
    this._submitted = true; 
    if(this._updateEmpForm.valid && !this._updateEmpForm.pristine) {
      this._mapToDataModel();
      this._benefitsSave.emit(this._employeePayroll);
    }else{
      this._benefitsSliderClose.emit(false);
    }
  }

  get updateEmpForm(){
    return this._updateEmpForm;
  }
  
  get lightClass(){
    return this._lightClass;
  }
  
  get inputType(){
    return this._inputType;
  }

  ngOnInit() {
    if (isNullOrUndefined(this._employeePayroll))
      this._employeePayroll = new EmployeePayrollDetails();
    this._initForm();
  }
}
