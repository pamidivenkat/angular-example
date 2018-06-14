import { BaseComponent } from '../../..//shared/base-component';
import { AeDataActionTypes } from '../../models/action-types.enum';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { Store } from '@ngrx/store';
import { EmployeeVehicleService } from '../../services/employee-vehicle.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehicleDetails } from '../../models/vehicle-details';
import { BaseElement } from '../../../atlas-elements/common/base-element';
import * as fromRoot from '../../../shared/reducers';
import * as Immutable from 'immutable';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';

@Component({
  selector: 'employee-vehicle-add-update',
  templateUrl: './employee-vehicle-add-update.component.html',
  styleUrls: ['./employee-vehicle-add-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeVehicleAddUpdateComponent extends BaseComponent implements OnInit, OnDestroy {
  private _updateVehicleDetails: VehicleDetails;
  private _updateVehicleDetailsForm: FormGroup;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _toggleUpdateForm: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _engineCCTypes: Observable<Immutable.List<AeSelectItem<string>>>;
  private _fuelTypes: Observable<Immutable.List<AeSelectItem<string>>>;
  private _action: string;
  private _headerText: string;
  private _submitButtonText: string;
  private _getVehicleInfoSubscription$: Subscription;
  private _hasInsuranceDateComparisionError: boolean;
  private _hasMOTDateComparisionError: boolean;
  private _isFormSubmitted: boolean;

  @Input('toggle')
  get toggleUpdateForm() {
    return this._toggleUpdateForm.getValue();
  }
  set toggleUpdateForm(val: boolean) {
    this._toggleUpdateForm.next(val);
  }

  @Input('action')
  get action() {
    return this._action;
  }
  set action(val: string) {
    this._action = val;
  }

  @Output('aeClose')
  private _aeClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  //public properties start
  get updateVehicleDetailsForm(): FormGroup {
    return this._updateVehicleDetailsForm;
  }
  get fuelTypes(): Observable<Immutable.List<AeSelectItem<string>>> {
    return this._fuelTypes;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get engineCCTypes(): Observable<Immutable.List<AeSelectItem<string>>> {
    return this._engineCCTypes;
  }
  //public properties end
  constructor(
    protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _employeeVehicleService: EmployeeVehicleService
    , private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _cdRef);
  }
  //private methods start

  private _initUpdateForm() {
    this._updateVehicleDetailsForm = this._fb.group({
      Make: [{ value: this._updateVehicleDetails.Make ? this._updateVehicleDetails.Make : null, disabled: false }, Validators.required],
      Model: [{ value: this._updateVehicleDetails.Model ? this._updateVehicleDetails.Model : null, disabled: false }],
      Color: [{ value: this._updateVehicleDetails.Color ? this._updateVehicleDetails.Color : null, disabled: false }],
      Details: [{ value: this._updateVehicleDetails.Details ? this._updateVehicleDetails.Details : null, disabled: false }],
      MOTStartDate: [{ value: this._updateVehicleDetails.MOTStartDate ? new Date(this._updateVehicleDetails.MOTStartDate) : null, disabled: false }],
      MOTEndDate: [{ value: this._updateVehicleDetails.MOTEndDate ? new Date(this._updateVehicleDetails.MOTEndDate) : null, disabled: false }],
      DateIssued: [{ value: this._updateVehicleDetails.DateIssued ? new Date(this._updateVehicleDetails.DateIssued) : null, disabled: false }],
      ReturnDate: [{ value: this._updateVehicleDetails.ReturnDate ? new Date(this._updateVehicleDetails.ReturnDate) : null, disabled: false }],
      FirstRegistered: [{ value: this._updateVehicleDetails.FirstRegistered ? new Date(this._updateVehicleDetails.FirstRegistered) : null, disabled: false }],
      Registration: [{ value: this._updateVehicleDetails.Registration ? this._updateVehicleDetails.Registration : null, disabled: false }],
      EngineCc: [{ value: this._updateVehicleDetails.EngineCc ? this._updateVehicleDetails.EngineCc : null, disabled: false }],
      ApprovedCO2: [{ value: this._updateVehicleDetails.ApprovedCO2 ? this._updateVehicleDetails.ApprovedCO2 : null, disabled: false }],
      FuelType: [{ value: this._updateVehicleDetails.FuelType ? this._updateVehicleDetails.FuelType : null, disabled: false }],
      InsuranceStartDate: [{ value: this._updateVehicleDetails.InsuranceStartDate ? new Date(this._updateVehicleDetails.InsuranceStartDate) : null, disabled: false }],
      InsuranceEndDate: [{ value: this._updateVehicleDetails.InsuranceEndDate ? new Date(this._updateVehicleDetails.InsuranceEndDate) : null, disabled: false }],
      InsuranceCompany: [{ value: this._updateVehicleDetails.InsuranceCompany ? this._updateVehicleDetails.InsuranceCompany : null, disabled: false }],
      PolicyNumber: [{ value: this._updateVehicleDetails.PolicyNumber ? this._updateVehicleDetails.PolicyNumber : null, disabled: false }],
      InsuranceValue: [{ value: this._updateVehicleDetails.InsuranceValue ? this._updateVehicleDetails.InsuranceValue : null, disabled: false }],
      Allowance: [{ value: this._updateVehicleDetails.Allowance ? this._updateVehicleDetails.Allowance : null, disabled: false }]
    });
  }

  private _initAddForm() {
    this._updateVehicleDetailsForm = this._fb.group({
      Make: [{ value: null, disabled: false }, Validators.required],
      Model: [{ value: null, disabled: false }],
      Color: [{ value: null, disabled: false }],
      Details: [{ value: null, disabled: false }],
      MOTStartDate: [{ value: null, disabled: false }],
      MOTEndDate: [{ value: null, disabled: false }],
      DateIssued: [{ value: null, disabled: false }],
      ReturnDate: [{ value: null, disabled: false }],
      FirstRegistered: [{ value: null, disabled: false }],
      Registration: [{ value: null, disabled: false }],
      EngineCc: [{ value: null, disabled: false }],
      ApprovedCO2: [{ value: null, disabled: false }],
      FuelType: [{ value: null, disabled: false }],
      InsuranceStartDate: [{ value: null, disabled: false }],
      InsuranceEndDate: [{ value: null, disabled: false }],
      InsuranceCompany: [{ value: null, disabled: false }],
      PolicyNumber: [{ value: null, disabled: false }],
      InsuranceValue: [{ value: null, disabled: false }],
      Allowance: [{ value: null, disabled: false }]
    });
    this._cdRef.markForCheck();
  }

  //private methods end
  //public methods start
  ngOnInit() {
    if (this._action == AeDataActionTypes.Add) {
      this._initAddForm();
      this._submitButtonText = 'Add';
    } else if (this._action == AeDataActionTypes.Update) {
      this._submitButtonText = 'Update';
      this._getVehicleInfoSubscription$ = this._store.let(fromRoot.getEmployeeVehicleInfoGetById).subscribe(res => {
        if (res) {
          this._updateVehicleDetails = res;
          this._initUpdateForm();
          this._cdRef.markForCheck();
        }
      });
    }
    this._engineCCTypes = this._store.let(fromRoot.getVehicleEngineCCTypes);
    this._fuelTypes = this._store.let(fromRoot.getVehicleFuelTypes);
  }

  ngOnDestroy() {
    this._getVehicleInfoSubscription$ && this._getVehicleInfoSubscription$.unsubscribe();
  }

  fieldHasRequiredError(fieldName: string): boolean {
    if (this._updateVehicleDetailsForm.get(fieldName).hasError('required') && (!this._updateVehicleDetailsForm.get(fieldName).pristine || this._isFormSubmitted)) {
      return true;
    }
    return false;
  }

  fieldHasValidDateError(fieldName: string): boolean {
    if (this._updateVehicleDetailsForm.dirty && this._updateVehicleDetailsForm.get(fieldName).dirty) {
      let _dateToValidate = this._updateVehicleDetailsForm.get(fieldName).value;
      return _dateToValidate ? false : true;
    }
  }

  fieldHasMOTDateComparisonError(): boolean {
    if (!this._updateVehicleDetailsForm.get('MOTStartDate').value || !this._updateVehicleDetailsForm.get('MOTEndDate').value) {
      this._hasMOTDateComparisionError = false;
      return this._hasMOTDateComparisionError;
    }
    let motStartDate = new Date(this._updateVehicleDetailsForm.get('MOTStartDate').value);
    let motEndDate = new Date(this._updateVehicleDetailsForm.get('MOTEndDate').value);
    this._hasMOTDateComparisionError = motStartDate > motEndDate;
    return this._hasMOTDateComparisionError;
  }

  fieldHasInsuranceDateComparisonError(): boolean {
    if (!this._updateVehicleDetailsForm.get('InsuranceStartDate').value || !this._updateVehicleDetailsForm.get('InsuranceEndDate').value) {
      this._hasInsuranceDateComparisionError = false;
      return this._hasInsuranceDateComparisionError;
    }
    let insuranceStartDate = new Date(this._updateVehicleDetailsForm.get('InsuranceStartDate').value);
    let insuranceEndDate = new Date(this._updateVehicleDetailsForm.get('InsuranceEndDate').value);
    this._hasInsuranceDateComparisionError = insuranceStartDate > insuranceEndDate;
    return this._hasInsuranceDateComparisionError;
  }

  onUpdateFormSubmit(e) {
    this._isFormSubmitted = true;
    if (this._updateVehicleDetailsForm.valid && !this._hasMOTDateComparisionError && !this._hasInsuranceDateComparisionError) {
      let _vehicleDetails: VehicleDetails = Object.assign({}, this._updateVehicleDetails, <VehicleDetails>this._updateVehicleDetailsForm.value);
      if (this._action == AeDataActionTypes.Add) {
        _vehicleDetails.Id = null;
        this._employeeVehicleService.AddVehicleInfo(_vehicleDetails);
      } else if (this._action == AeDataActionTypes.Update) {
        this._employeeVehicleService.UpdateVehicleInfo(_vehicleDetails);
      }
    }
  }

  onUpdateFormClosed(e) {
    this._aeClose.emit(false);
  }

  isAddForm() {
    return this._action == AeDataActionTypes.Add;
  }

  isUpdateForm() {
    return this._action == AeDataActionTypes.Update;
  }
  //public methods end
}
