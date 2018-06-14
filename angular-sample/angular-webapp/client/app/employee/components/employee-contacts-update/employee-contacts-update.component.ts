import { StringHelper } from './../../../shared/helpers/string-helper';
import { County, Country, EmployeeRelations } from './../../../shared/models/lookup.models';
import { getFullAddress, mapLookupTableToAeSelectItems } from '../../common/extract-helpers';
import { emailFieldValidator, telephoneNumberFieldValidator, mobileNumberFieldValidator } from '../../common/employee-validators';
import {
  EmployeeContactsUpdateAction
} from '../../actions/employee.actions';
import { EmployeeFullEntityService } from '../../services/employee-fullentity.service';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { SalutationCode } from '../../common/salutationcode.enum';
import { BehaviorSubject } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { Employee, EmployeeContacts } from '../../models/employee.model';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
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

@Component({
  selector: 'employee-contacts-update',
  templateUrl: './employee-contacts-update.component.html',
  styleUrls: ['./employee-contacts-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeContactsUpdateComponent extends BaseComponent implements OnInit, OnChanges {
  // Private Fields
  private _employeeContacts: EmployeeContacts;
  private _updateEmpContactsForm: FormGroup;
  private _countySelectList: Immutable.List<AeSelectItem<string>>;
  private _countrySelectList: Immutable.List<AeSelectItem<string>>;
  private _saveBtnClass: AeClassStyle;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _toggleUpdateContactForm: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _county: County[];
  private _country: Country[];
  // End of private Fields

  // Input properties declarations
  @Input('toggle')
  get toggleUpdateForm() {
    return this._toggleUpdateContactForm.getValue();
  }
  set toggleUpdateForm(val: boolean) {
    this._toggleUpdateContactForm.next(val);
  }

  // Output properties declarations
  @Output('aeClose')
  private _aeClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input('County')
  set County(value: County[]) {
    this._county = value;
  }
  get County(): County[] {
    return this._county;
  }
 

  @Input('Country')
  set Country(value: Country[]) {
    this._country = value;
  }
  get Country(): Country[] {
    return this._country;
  }
  

  //End of public properties


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
  get updateEmpContactsForm() {
    return this._updateEmpContactsForm;
  }

  get lightClass() {
    return this._lightClass;
  }

  get countySelectList() {
    return this._countySelectList;
  }

  get countrySelectList(): Immutable.List<AeSelectItem<string>> {
    return this._countrySelectList;
  }

  ngOnInit() {
    this._saveBtnClass = AeClassStyle.Light;

    this._toggleUpdateContactForm.subscribe(status => {
      if (status) {
        this._store.let(fromRoot.getEmployeeContactsData).subscribe(empContactsToUpdate => {
          if (!isNullOrUndefined(empContactsToUpdate)) {
            this._employeeContacts = Object.assign({}, empContactsToUpdate);
            this._cdRef.markForCheck();
            this._initForm();
          }
        });
      }
    });

  }
  ngOnChanges() {
    if (this._county) {
      this._countySelectList = mapLookupTableToAeSelectItems(this._county);
    }
    if (this._country) {
      this._countrySelectList = mapLookupTableToAeSelectItems(this._country);
    }
  }
  //End of public methods

  // Private methods start
  private _initForm() {
    this._updateEmpContactsForm = this._fb.group({
      AddressLine1: [{ value: this._employeeContacts.AddressLine1, disabled: false }],
      AddressLine2: [{ value: this._employeeContacts.AddressLine2, disabled: false }],
      AddressLine3: [{ value: this._employeeContacts.AddressLine3, disabled: false }],
      Town: [{ value: this._employeeContacts.Town, disabled: false }],
      CountyId: [{ value: this._employeeContacts.CountyId, disabled: false }],
      Postcode: [{ value: this._employeeContacts.Postcode, disabled: false }],
      CountryId: [{ value: this._employeeContacts.CountryId, disabled: false }],
      HomePhone: [{ value: this._employeeContacts.HomePhone, disabled: false }, [telephoneNumberFieldValidator]],
      MobilePhone: [{ value: this._employeeContacts.MobilePhone, disabled: false }, [mobileNumberFieldValidator]],
      PersonalEmail: [{ value: this._employeeContacts.PersonalEmail, disabled: false }, [emailFieldValidator]],
      Email: [{ value: this._employeeContacts.Email, disabled: false }, [Validators.required, emailFieldValidator]],
    });
  }

  onUpdateFormClosed(e) {
    this._aeClose.emit(false);
  }

  onUpdateFormSubmit(e) {
    if (this._updateEmpContactsForm.valid) {
      let _empContactsToSave: EmployeeContacts = <EmployeeContacts>this._updateEmpContactsForm.value;
      _empContactsToSave.CountryName = (!isNullOrUndefined(this._country) && !StringHelper.isNullOrUndefinedOrEmpty(_empContactsToSave.CountryId) && this._country.length > 0) ? this._country.find(p => p.Id === _empContactsToSave.CountryId).Name : '';
      _empContactsToSave.CountyName = (!isNullOrUndefined(this._county) && !StringHelper.isNullOrUndefinedOrEmpty(_empContactsToSave.CountyId) && this._county.length > 0) ? this._county.find(p => p.Id === _empContactsToSave.CountyId).Name : '';
      _empContactsToSave.FullAddress = getFullAddress(_empContactsToSave);
      _empContactsToSave = Object.assign({}, this._employeeContacts, _empContactsToSave);
      this._store.dispatch(new EmployeeContactsUpdateAction(_empContactsToSave));

    }
  }

  fieldHasRequiredError(fieldName: string): boolean {
    return this._updateEmpContactsForm.get(fieldName).hasError('required');
  }

  private _isFieldValid(fieldName: string): boolean {
    return this._updateEmpContactsForm.get(fieldName).valid;
  }

  private _fieldHasInvalidName(fieldName: string): boolean {
    return this._updateEmpContactsForm.get(fieldName).getError('validName') == false;
  }

  fieldHasInvalidEmail(fieldName: string): boolean {
    return this._updateEmpContactsForm.get(fieldName).getError('validEmail') == false;
  }

  fieldHasInvalidMobileNumber(fieldName: string): boolean {
    return this._updateEmpContactsForm.get(fieldName).getError('validMobileNumber') == false;
  }

  fieldHasInvalidTelephoneNumber(fieldName: string): boolean {
    return this._updateEmpContactsForm.get(fieldName).getError('validTelephoneNumber') == false;
  }
  // End of Private methods

}
