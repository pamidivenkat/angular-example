import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { BankDetails } from "../../../employee/models/bank-details";
import * as fromRoot from './../../../shared/reducers';
import { Observable, Subject, BehaviorSubject, Subscription } from "rxjs/Rx";
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { isNullOrUndefined } from "util";
import { telephoneNumberFieldValidator } from "../../../employee/common/employee-validators";
import * as Immutable from 'immutable';
import { AeSelectItem } from "../../..//atlas-elements/common/models/ae-select-item";
import { County, Country } from "../../../shared/models/lookup.models";
import { mapLookupTableToAeSelectItems } from "../../../employee/common/extract-helpers";
import { StringHelper } from "../../../shared/helpers/string-helper";
import { EmployeeBankDetailsUpdateAction, EmployeeBankDetailsAddAction } from "../../../employee/actions/employee.actions";

@Component({
  selector: 'employee-bank-add-update',
  templateUrl: './employee-bank-add-update.component.html',
  styleUrls: ['./employee-bank-add-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeBankAddUpdateComponent extends BaseComponent implements OnInit, OnDestroy {
  // private fields
  private _employeeBankDetails: BankDetails;
  private _employeeBankDetailsAddUpdateForm: FormGroup;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _submitted: boolean = false;
  private _toggleBankDetailsAddUpdateForm: string;
  private _countySelectList: Immutable.List<AeSelectItem<string>>;
  private _countrySelectList: Immutable.List<AeSelectItem<string>>;
  private _county: County[];
  private _country: Country[];
  // End of private Fields

  // Input

  @Input('County')
  set County(value: County[]) {
    this._county = value;
    if (value) {
      let counties = value.sort((a, b) => a.Name.localeCompare(b.Name));
      this._countySelectList = mapLookupTableToAeSelectItems(counties);
    }

  }
  get County(): County[] {
    return this._county;
  }
 

  @Input('Country')
  set Country(value: Country[]) {
    this._country = value;
    if (value) {
      let countries = value.sort((a, b) => a.Name.localeCompare(b.Name));
      this._countrySelectList = mapLookupTableToAeSelectItems(countries);
    }
  }
  get Country(): Country[] {
    return this._country;
  }
 
  @Input('toggleOption')
  get toggleBankDetailsAddUpdateForm() {
    return this._toggleBankDetailsAddUpdateForm;
  }
  set toggleBankDetailsAddUpdateForm(val: string) {
    this._toggleBankDetailsAddUpdateForm = val;
  }
  @Input('data')
  set data(val: BankDetails) {
    this._employeeBankDetails = val;
    this._cdRef.markForCheck();
  }
  get data() {
    return this._employeeBankDetails;
  }
  
  // Output properties declarations
  @Output('onCancel')
  _onCancel: EventEmitter<string> = new EventEmitter<string>();
  @Output('onUpdate')
  _onUpdate: EventEmitter<BankDetails> = new EventEmitter<BankDetails>();
  @Output('onAdd')
  _onAdd: EventEmitter<BankDetails> = new EventEmitter<BankDetails>();

  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);

  }

  //public method start
  get employeeBankDetailsAddUpdateForm() {
    return this._employeeBankDetailsAddUpdateForm;
  }

  get countrySelectList() {
    return this._countrySelectList;
  }

  get countySelectList() {
    return this._countySelectList;
  }

  get lightClass() {
    return this._lightClass;
  }

  ngOnInit() {
    this._initForm();



  }

  ngOnDestroy() {

  }

  // Private methods start
  isUpdateMode() {
    return this.toggleBankDetailsAddUpdateForm == "update";
  }

  /**
   * On add/updte bank details cancle  
   * 
   * @memberOf EmployeeBankAddUpdateComponent
   */
  onAddOrUpdateBankDetailsCancel(e) {
    this._onCancel.emit('add');
  }

  /**
   * add form submission
   * @private
   * @param {any} e 
   * 
   * @memberOf EmployeeBankAddUpdateComponent
   */
  onAddOrUpdateFormSubmit(e) {
    this._submitted = true;
    if (this._employeeBankDetailsAddUpdateForm.valid) {
      let _detailsToSave: BankDetails = Object.assign({}, this._employeeBankDetails, <BankDetails>this._employeeBankDetailsAddUpdateForm.value);
      
      if (!StringHelper.isNullOrUndefinedOrEmpty(_detailsToSave.Id)) {
        this._onUpdate.emit(_detailsToSave);
      }
      else {
        this._onAdd.emit(_detailsToSave);
      }
    }
  }


  private _initForm() {
    this._employeeBankDetailsAddUpdateForm = this._fb.group({
      Name: [{ value: this._employeeBankDetails.Name, disabled: false }, [Validators.required]],
      AccountName: [{ value: this._employeeBankDetails.AccountName, disabled: false }, [Validators.required]],
      AccountNumber: [{ value: this._employeeBankDetails.AccountNumber, disabled: false }, [Validators.required]],
      BankCode: [{ value: this._employeeBankDetails.BankCode, disabled: false }, [Validators.required]],
      IsSalaryAccount: [{ value: this._employeeBankDetails.IsSalaryAccount, disabled: false }],
      AddressLine1: [{ value: this._employeeBankDetails.AddressLine1, disabled: false }],
      AddressLine2: [{ value: this._employeeBankDetails.AddressLine2, disabled: false }],
      CountyId: [{ value: this._employeeBankDetails.CountyId || '', disabled: false }],
      CountryId: [{ value: this._employeeBankDetails.CountryId || '', disabled: false }],
      Postcode: [{ value: this._employeeBankDetails.Postcode, disabled: false }],
      PhoneNumber: [{ value: this._employeeBankDetails.PhoneNumber, disabled: false }, [telephoneNumberFieldValidator]],
      Town: [{ value: this._employeeBankDetails.Town, disabled: false }],
    }
    );
  }
  fieldHasRequiredError(fieldName: string): boolean {
    return (this._employeeBankDetailsAddUpdateForm.get(fieldName).hasError('required') && (!this._employeeBankDetailsAddUpdateForm.get(fieldName).pristine || this._submitted));
  }

  fieldHasInvalidTelephoneNumber(fieldName: string): boolean {
    return this._employeeBankDetailsAddUpdateForm.get(fieldName).getError('validTelephoneNumber') == false;
  }

}
