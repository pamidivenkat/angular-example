import { async } from 'rxjs/scheduler/async';
import { Country, County, EmployeeRelations } from '../../../../shared/models/lookup.models';
import {
  getBlankEmployeeEmergencyContactObject,
  mapLookupTableToAeSelectItems
} from '../../../common/extract-helpers';
import {
  emailFieldValidator,
  mobileNumberFieldValidator,
  nameFieldValidator,
  telephoneNumberFieldValidator
} from '../../../common/employee-validators';
import { isNullOrUndefined } from 'util';
import {
  EmployeeEmergencyContactsCreateAction,
  EmployeeEmergencyContactsUpdateAction
} from '../../../actions/employee.actions';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { BehaviorSubject } from 'rxjs/Rx';
import {
  Employee,
  EmployeeContacts,
  EmployeeEmergencyContacts
} from '../../../models/employee.model';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
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
import * as fromRoot from '../../../../shared/reducers/index';
import * as Immutable from 'immutable';

@Component({
  selector: 'employee-emergency-contacts',
  templateUrl: './employee-emergancy-contacts.component.html',
  styleUrls: ['./employee-emergancy-contacts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeEmergancyContactsComponent extends BaseComponent implements OnInit {

  // Private Fields
  private _employeeEmergencyContacts: EmployeeEmergencyContacts;
  private _updateEmpEmergencyContactsForm: FormGroup;
  private _countySelectList: Immutable.List<AeSelectItem<string>>;
  private _countrySelectList: Immutable.List<AeSelectItem<string>>;
  private _employeeRelationsSelectList: Immutable.List<AeSelectItem<string>>;
  private _saveBtnClass: AeClassStyle;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _employeeContacts: EmployeeContacts;
  private _county: County[];
  private _country: Country[];
  private _employeeRelations: EmployeeRelations[];
  private _submitted: boolean = false;
  private _toggleUpdateEmergencyContactForm: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private _flag: boolean = true;
  // End of private Fields

  // Output properties declarations
  @Output('aeCloseEC')
  private _aeCloseEC: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('aeSaveEC')
  private _aeSaveEC: EventEmitter<any> = new EventEmitter<any>();
  // End of Output properties declarations

  //Public properties

  get lightClass(): AeClassStyle{
    return this._lightClass;
  }
  get  updateEmpEmergencyContactsForm(): FormGroup{
    return this. _updateEmpEmergencyContactsForm;
  }

  get employeeRelationsSelectList(): Immutable.List<AeSelectItem<string>>{
    return this._employeeRelationsSelectList;
  }

 get countySelectList(): Immutable.List<AeSelectItem<string>>{
    return this._countySelectList;
  }

  get countrySelectList(): Immutable.List<AeSelectItem<string>>{
    return this._countrySelectList;
  }

  @Input('toggleEC')
  get toggleUpdateEmergencyContactForm() {
    return this._toggleUpdateEmergencyContactForm.getValue();
  }
  set toggleUpdateEmergencyContactForm(val: string) {
    this._toggleUpdateEmergencyContactForm.next(val);
  }

  @Input('County')
  get County(): County[] {
    return this._county;
  }
  set County(value: County[]) {
    this._county = value;
  }

  @Input('Country')
  get Country(): Country[] {
    return this._country;
  }
  set Country(value: Country[]) {
    this._country = value;
  }

  @Input('EmployeeRelations')
  get EmployeeRelations(): EmployeeRelations[] {
    return this._employeeRelations;
  }
  set EmployeeRelations(value: EmployeeRelations[]) {
    this._employeeRelations = value;
  }
  @Input('EmployeeEmergancyContactDetails')
  get EmployeeEmergancyContactDetails(): EmployeeEmergencyContacts {
    return this._employeeEmergencyContacts;
  }
  set EmployeeEmergancyContactDetails(value: EmployeeEmergencyContacts) {
    this._employeeEmergencyContacts = value;
    this._cdRef.markForCheck();
  }
  @Input('Flag')
  get Flag(): boolean {
    return this._flag;
  }
  set Flag(value: boolean) {
    this._flag = value;
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

  ngOnInit() {
    this._saveBtnClass = AeClassStyle.Light;
    if(!this._flag){
    this._store.select(c => c.employeeState.Data).subscribe((employeeContact: EmployeeContacts) => {
      this._employeeContacts = Object.assign({}, employeeContact);
    });
     this._toggleUpdateEmergencyContactForm.subscribe(status => {
      if (status == "update") {
        this._store.select(c => c.employeeState.EmergencyContactData).subscribe(c => {
          if (!isNullOrUndefined(c)) {
            this._employeeEmergencyContacts = c;
            this._initForm();
          }
        });
      } else if (status == "add") {
        this._employeeEmergencyContacts = getBlankEmployeeEmergencyContactObject();
        this._initForm();
      }
    });
  }
  else{
    this._initForm();
  }
  
  }
  ngOnChanges() {
    if (this._county) {
      this._countySelectList = mapLookupTableToAeSelectItems(this._county);
    }
    if (this._country) {
      this._countrySelectList = mapLookupTableToAeSelectItems(this._country);
    }
    if (this._employeeRelations) {
      this._employeeRelationsSelectList = mapLookupTableToAeSelectItems(this._employeeRelations);
    }
  }
  //End of public methods
  // Private methods start
  onUpdateFormClosed(e) {
    this._aeCloseEC.emit(false);
  }

  onUpdateFormSubmit(e) {
    this._submitted = true;
   if (this._updateEmpEmergencyContactsForm.valid && !this._flag) {
      let _empEmergencyContactsToSave: EmployeeEmergencyContacts = Object.assign({}, this._employeeEmergencyContacts, <EmployeeEmergencyContacts>this._updateEmpEmergencyContactsForm.value);
      _empEmergencyContactsToSave.EmployeeId = this._employeeContacts.Id;
      _empEmergencyContactsToSave.CompanyId = this._employeeContacts.CompanyId;
      if (!isNullOrUndefined(_empEmergencyContactsToSave.Id)) {
        this._store.dispatch(new EmployeeEmergencyContactsUpdateAction(_empEmergencyContactsToSave));
      }
      else {
        this._store.dispatch(new EmployeeEmergencyContactsCreateAction(_empEmergencyContactsToSave));
      }
    }
    else if (this._updateEmpEmergencyContactsForm.valid && this._flag) {
      let _empEmergencyContactsToSave: EmployeeEmergencyContacts = Object.assign({}, this._employeeEmergencyContacts, <EmployeeEmergencyContacts>this._updateEmpEmergencyContactsForm.value);
      this._aeSaveEC.emit({_empEmergencyContactsToSave});
    }
  }

  private _initForm() {
    this._updateEmpEmergencyContactsForm = this._fb.group({
      Name: [{ value: isNullOrUndefined(this._employeeEmergencyContacts.Name)?"":this._employeeEmergencyContacts.Name, disabled: false }, [Validators.required, nameFieldValidator]],
      EmployeeRelationId: [{ value: isNullOrUndefined(this._employeeEmergencyContacts.EmployeeRelationId)?"":this._employeeEmergencyContacts.EmployeeRelationId, disabled: false }, Validators.required],
      AddressLine1: [{ value: isNullOrUndefined(this._employeeEmergencyContacts.AddressLine1)?"":this._employeeEmergencyContacts.AddressLine1, disabled: false }],
      AddressLine2: [{ value: isNullOrUndefined(this._employeeEmergencyContacts.AddressLine2)?"":this._employeeEmergencyContacts.AddressLine2, disabled: false }],
      Town: [{ value: isNullOrUndefined(this._employeeEmergencyContacts.Town)?"":this._employeeEmergencyContacts.Town, disabled: false }],
      CountyId: [{ value: isNullOrUndefined(this._employeeEmergencyContacts.CountyId)?"":this._employeeEmergencyContacts.CountyId || '', disabled: false }],
      CountryId: [{ value: isNullOrUndefined(this._employeeEmergencyContacts.CountryId)?"":this._employeeEmergencyContacts.CountryId || '', disabled: false }],
      Postcode: [{ value: isNullOrUndefined(this._employeeEmergencyContacts.Postcode)?"":this._employeeEmergencyContacts.Postcode, disabled: false }],
      HomePhone: [{ value: isNullOrUndefined(this._employeeEmergencyContacts.HomePhone)?"":this._employeeEmergencyContacts.HomePhone, disabled: false }, [telephoneNumberFieldValidator]],
      MobilePhone: [{ value: isNullOrUndefined(this._employeeEmergencyContacts.MobilePhone)?"":this._employeeEmergencyContacts.MobilePhone, disabled: false }, [Validators.required, mobileNumberFieldValidator]],
      Email: [{ value: isNullOrUndefined(this._employeeEmergencyContacts.Email)?"":this._employeeEmergencyContacts.Email, disabled: false }, [emailFieldValidator]],
      Notes: [{ value: isNullOrUndefined(this._employeeEmergencyContacts.Notes)?"":this._employeeEmergencyContacts.Notes, disabled: false }],
      IsPrimary: [{ value: isNullOrUndefined(this._employeeEmergencyContacts.IsPrimary)?"":this._employeeEmergencyContacts.IsPrimary, disabled: false }],
    });
  }
  
  isUpdateMode() {
    return this.toggleUpdateEmergencyContactForm == "update";
  }
  
  fieldHasRequiredError(fieldName: string): boolean {
    return (this._updateEmpEmergencyContactsForm.get(fieldName).hasError('required') && (!this._updateEmpEmergencyContactsForm.get(fieldName).pristine || this._submitted));
  }

  private _isFieldValid(fieldName: string): boolean {
    return this._updateEmpEmergencyContactsForm.get(fieldName).valid;
  }

  fieldHasInvalidName(fieldName: string): boolean {
    return this._updateEmpEmergencyContactsForm.get(fieldName).getError('validName') == false;
  }

  fieldHasInvalidEmail(fieldName: string): boolean {
    return this._updateEmpEmergencyContactsForm.get(fieldName).getError('validEmail') == false;
  }

  fieldHasInvalidMobileNumber(fieldName: string): boolean {
    return this._updateEmpEmergencyContactsForm.get(fieldName).getError('validMobileNumber') == false;
  }

  fieldHasInvalidTelephoneNumber(fieldName: string): boolean {
    return this._updateEmpEmergencyContactsForm.get(fieldName).getError('validTelephoneNumber') == false;
  }
  // End of Private methods

}
