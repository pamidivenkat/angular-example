import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { Site } from './../../../../company/sites/models/site.model';
import { EmployeeFullEntity } from './../../../../employee/models/employee-full.model';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { Subscription, BehaviorSubject } from 'rxjs/Rx';
import { Address } from './../../../../employee/models/employee.model';
import { isNullOrUndefined } from "util";
import { IFormBuilderVM, IFormFieldWrapper } from './../../../../shared/models/iform-builder-vm';
import { Observable } from "rxjs/Observable";
import { IncidentReportedBySearchService } from './../../services/incident-reported-by-search.service';
import { InjuredPerson } from "./../../models/incident-injured-person.model";
import { IncidentInjuredPersonForm } from "./../../models/incident-injured-person.form";
import { getAeSelectItemsFromEnum } from "../../../../employee/common/extract-helpers";
import { Gender } from "../../../../employee/common/gender.enum";
import { LoadInjuredPartyAction, LoadInjuredPersonDataAction, InjuredPersonAddorUpdateAction, InjuredPersonEmpDetailsByUserIdAction } from "../../actions/incident-injured-person.actions";
import { ActivatedRoute } from "@angular/router";
import { mapInjuredPartyData } from "../../../common/extract-helpers";
import { AeLoaderType } from "../../../../atlas-elements/common/ae-loader-type.enum";

@Component({
  selector: "injured-person-add-update",
  templateUrl: "./incident-injured-person.component.html",
  styleUrls: ["./incident-injured-person.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class IncidentInjuredPersonComponent extends BaseComponent implements OnInit, OnDestroy {

  /** Private variable declarations - start. */
  private _counties$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _injuredPartyList: Immutable.List<AeSelectItem<string>>;
  private _injuredPersonDetails: InjuredPerson;
  private _submitted: boolean = false;
  private _isNew: boolean;
  private _injuredPersonAddUpdateFormVM: IFormBuilderVM;
  private _formName: string;
  private _formFields: Array<IFormFieldWrapper<any>>;
  private _genderList: Immutable.List<AeSelectItem<number>>;
  private _context: any;
  private _injuredPartySubscription: Subscription;
  private _injuredPersonAddUpdateForm: FormGroup;
  private _incidentId: string;
  private _incidentIdSubscription: Subscription;
  private _injuredPersonSubscription: Subscription;
  private _contextUserPropertyValue: BehaviorSubject<boolean>;
  private _contextNamePropertyValue: BehaviorSubject<boolean>;
  private _contextPreganantFieldPropertyValue: BehaviorSubject<boolean>;
  private _contextStartDatePropertyValue: BehaviorSubject<boolean>;
  private _contextOtherPropertyValue: BehaviorSubject<boolean>;
  private _injuredPartyEmpTypeId: string;
  private _selectedUser: AeSelectItem<string>[];
  private _employeeDetailsSubscription: Subscription;
  private _filteredUsers: AeSelectItem<string>[] = [];
  private _routeParamSubscription: Subscription;
  private _formKeyFields: Array<string> = [];
  private _showNotification: boolean = false;;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _incidentInjuredPersonUpdateStatusSubscription: Subscription;
  private _saveInjuredPerson: boolean = false;
  private _isDataLoading: boolean = false;
  private _loaderType: AeLoaderType = AeLoaderType.Bars;
  /** Private variable declarations - end. */

  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: any) {
    this._context = val;
  }

  @Input('counties')
  set counties(val: Observable<Immutable.List<AeSelectItem<string>>>) {
    this._counties$ = val;
  }
  get counties() {
    return this._counties$;
  }
  

  get showPopUp() {
    return this._showNotification;
  }

  get lightClass() {
    return this._lightClass;
  }

  get isDataLoading() {
    return this._isDataLoading;
  }

  get loaderType() {
    return this._loaderType;
  }

  public get injuredPersonAddUpdateFormVM() {
    return this._injuredPersonAddUpdateFormVM;
  }

  modalClosed() {
    this._context.clearEvent.next(true);
    return this._showNotification = false;
  }
  onConfirmation() {
    this._showNotification = false;
    this._saveInjuredPersonData();
  }


  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _claimsHelper: ClaimsHelperService
    , private _router: ActivatedRoute
    , private _incidentReportedBySearchService: IncidentReportedBySearchService
    , private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _cdRef);
  }

  public onFormValidityChange(status: boolean) {
    this._context.isValidEvent.emit(status);
  }

  public onFormInit(fg: FormGroup) {

    this._injuredPersonAddUpdateForm = fg;
    this._injuredPersonAddUpdateForm.get('SelectedUser').valueChanges.subscribe((val) => {
      if (this._filteredUsers != null && this._filteredUsers.length > 0 && typeof (val[0]) === 'string') {
        this._injuredPersonDetails.UserId = val[0];
        this._filteredUsers.filter(x => x.Value === val[0]).map(user => {
          this._injuredPersonDetails.Name = user.Text;
        });
        this._store.dispatch(new InjuredPersonEmpDetailsByUserIdAction(val[0]));
      }
    });

    this._injuredPersonSubscription = this._store.let(fromRoot.getInjuredPersondata).subscribe(data => {
      if (!isNullOrUndefined(data)) {
        this._injuredPersonDetails = data;
        if (data.Id == null) {
          this._injuredPersonDetails.Id = this._incidentId;
          this._isNew = true;
        }
        else {
          this._isNew = false;
          this._injuredPersonDetails.InjuredPartyId = this._injuredPersonDetails.InjuredPartyId == null ? "0" : this._injuredPersonDetails.InjuredPartyId;
          this._prepareIncidentInjuredPersonDetails(this._injuredPersonDetails);
          if (this._injuredPersonDetails.UserId) {
            this._selectedUser = [];
            this._selectedUser.push(new AeSelectItem(this._injuredPersonDetails.Name, this._injuredPersonDetails.UserId, false));
          }
          else {
            this._selectedUser = [];
            this._selectedUser.push(new AeSelectItem('', '', false));
          }
          this._injuredPersonAddUpdateForm.patchValue({
            AddressLine1: this._injuredPersonDetails.Address == null ? "" : this._injuredPersonDetails.Address.AddressLine1,
            AddressLine2: this._injuredPersonDetails.Address == null ? "" : this._injuredPersonDetails.Address.AddressLine2,
            Town: this._injuredPersonDetails.Address == null ? "" : this._injuredPersonDetails.Address.Town,
            CountyId: this._injuredPersonDetails.Address == null ? "" : this._injuredPersonDetails.Address.CountyId,
            Postcode: this._injuredPersonDetails.Address == null ? "" : this._injuredPersonDetails.Address.Postcode,
            JobRole: this._injuredPersonDetails.Occupation,
            MobilePhone: this._injuredPersonDetails.Address == null ? "" : this._injuredPersonDetails.Address.MobilePhone,
            Gender: this._injuredPersonDetails.Gender,
            InjuredPartyId: this._injuredPersonDetails.InjuredPartyId,
            SelectedUser: this._selectedUser,
            IsPregnant: this._injuredPersonDetails.IsPregnant,
            Name: this._injuredPersonDetails.Name,
            DateOfBirth: this._injuredPersonDetails.DateOfBirth == null ? null : new Date(this._injuredPersonDetails.DateOfBirth),
            StartDate: this._injuredPersonDetails.StartDate == null ? null : new Date(this._injuredPersonDetails.StartDate),
            OtherInjuryParty: this._injuredPersonDetails.OtherInjuredParty
          });
        }
        this._isDataLoading = false;
        this._cdRef.markForCheck();
      }

    });

    this._injuredPersonAddUpdateForm.get('InjuredPartyId').valueChanges.subscribe((val) => {
      if (val != this._injuredPersonDetails.InjuredPartyId) {
        this._injuredPersonDetails.InjuredPartyId = val;
        this._prepareIncidentInjuredPersonDetails(this._injuredPersonDetails);
        this._selectedUser = [];
        this._selectedUser.push(new AeSelectItem('', '', false))

        this._injuredPersonAddUpdateForm.patchValue({
          AddressLine1: '',
          AddressLine2: '',
          Town: '',
          CountyId: '',
          Postcode: '',
          JobRole: '',
          StartDate: null,
          DateOfBirth: null,
          MobilePhone: '',
          Gender: '',
          Name: '',
          SelectedUser: this._selectedUser
        });
      }

    });
    this._injuredPersonAddUpdateForm.get('Gender').valueChanges.subscribe((val) => {
      if (val == '2') {
        this._contextPreganantFieldPropertyValue.next(true);
      }
      else {
        this._contextPreganantFieldPropertyValue.next(false);
      }
    });
  }

  private _prepareIncidentInjuredPersonDetails(details) {
    this._injuredPersonDetails.CompanyId = this._claimsHelper.getCompanyId();

    if (details.InjuredPartyId == this._injuredPartyEmpTypeId) {
      this._contextUserPropertyValue.next(true);
      this._contextNamePropertyValue.next(false);
      this._contextStartDatePropertyValue.next(true);
      this._contextOtherPropertyValue.next(false);
    }
    else if (details.InjuredPartyId == '0') {
      this._contextUserPropertyValue.next(false);
      this._contextNamePropertyValue.next(true);
      this._contextStartDatePropertyValue.next(false);
      this._contextOtherPropertyValue.next(true);
    }
    else {
      this._contextUserPropertyValue.next(false);
      this._contextNamePropertyValue.next(true);
      this._contextStartDatePropertyValue.next(false);
      this._contextOtherPropertyValue.next(false);
    }
  }

  private _onInjuredPersonFormSubmit() {
    if (!this._submitted) {
      this._submitted = true;
      if (this._injuredPersonAddUpdateForm.valid && !this._injuredPersonAddUpdateForm.pristine) {
        if (!this._validateFormKeyFields()) {
          this._saveInjuredPersonData();
        }
        else {
          this._submitted = false;
        }
      }
      else {
        if (!this._validateFormKeyFields()) {
          this._context.waitEvent.next(true);
        }
        else {
          this._submitted = false;
        }
      }
      this._cdRef.markForCheck();
    }
  }

  private _validateFormKeyFields() {
    this._formFields.filter(f => f.context.getContextData().get('required') && (isNullOrUndefined(f.context.getContextData().get('propertyValue')) || f.context.getContextData().get('propertyValue').getValue() == true)).forEach(x => {
      this._formKeyFields.push(x.field.name);
    });
    for (var item of this._formKeyFields) {
      if (isNullOrUndefined(this._injuredPersonAddUpdateForm.get(item).value) || this._injuredPersonAddUpdateForm.get(item).value == "") {
        this._showNotification = true;
      }
    }
    return this._showNotification;
  }


  private _saveInjuredPersonData() {
    this._saveInjuredPerson = true;
    var _injuredPersonDetailsToSave = this._injuredPersonAddUpdateForm.value;
    var isAddressChanged = this._isAddressChanged(_injuredPersonDetailsToSave);
    if (isAddressChanged) {
      this._injuredPersonDetails.AddressId = null;
      var newAddress = new Address()
      newAddress.AddressLine1 = _injuredPersonDetailsToSave.AddressLine1;
      newAddress.AddressLine2 = _injuredPersonDetailsToSave.AddressLine2;
      newAddress.Town = _injuredPersonDetailsToSave.Town;
      newAddress.CountyId = _injuredPersonDetailsToSave.CountyId;
      newAddress.Postcode = _injuredPersonDetailsToSave.Postcode;
      newAddress.MobilePhone = _injuredPersonDetailsToSave.MobilePhone;
      this._injuredPersonDetails.Address = newAddress;
    }

    this._injuredPersonDetails.DateOfBirth = _injuredPersonDetailsToSave.DateOfBirth;
    this._injuredPersonDetails.StartDate = (this._injuredPersonDetails.InjuredPartyId == this._injuredPartyEmpTypeId) ? _injuredPersonDetailsToSave.StartDate : null;
    this._injuredPersonDetails.OtherInjuredParty = (this._injuredPersonDetails.InjuredPartyId == '0') ? _injuredPersonDetailsToSave.OtherInjuryParty : null;
    this._injuredPersonDetails.IsPregnant = _injuredPersonDetailsToSave.Gender == "2" ? _injuredPersonDetailsToSave.IsPregnant : 0;
    this._injuredPersonDetails.Occupation = _injuredPersonDetailsToSave.JobRole;
    this._injuredPersonDetails.Gender = _injuredPersonDetailsToSave.Gender;
    this._injuredPersonDetails.Name = (this._injuredPersonDetails.InjuredPartyId == this._injuredPartyEmpTypeId) ? this._injuredPersonDetails.Name : _injuredPersonDetailsToSave.Name;
    this._store.dispatch(new InjuredPersonAddorUpdateAction({ isEdit: this._isNew, injuredPersonDet: this._injuredPersonDetails }));

  }

  private _isAddressChanged(detailsToSave) {
    if (this._injuredPersonDetails.Address == null) return true;
    return (this._injuredPersonDetails.Address.AddressLine1 != detailsToSave.AddressLine1
      || this._injuredPersonDetails.Address.AddressLine2 != detailsToSave.AddressLine2
      || this._injuredPersonDetails.Address.Town != detailsToSave.Town
      || this._injuredPersonDetails.Address.CountyId != detailsToSave.CountyId
      || this._injuredPersonDetails.Address.Postcode != detailsToSave.Postcode
      || this._injuredPersonDetails.Address.MobilePhone != detailsToSave.MobilePhone
    );
  }

  ngOnInit() {
    this._formName = 'IncidentInjuredPersonForm';
    this._injuredPersonAddUpdateFormVM = new IncidentInjuredPersonForm(this._formName);
    this._formFields = this._injuredPersonAddUpdateFormVM.init();

    this._routeParamSubscription = this._router.params.subscribe(params => {
      if (!isNullOrUndefined(params['id'])) {
        this._incidentId = params['id'];
        this._isDataLoading = true;
        this._store.dispatch(new LoadInjuredPersonDataAction(this._incidentId));
      }
    });

    this._store.dispatch(new LoadInjuredPartyAction(false));

    this._context.submitEvent.subscribe((value) => {
      if (value) {
        this._onInjuredPersonFormSubmit();
      }
    });

    this._incidentIdSubscription = this._store.let(fromRoot.getIncidentId).subscribe(incidentId => {
      if (!isNullOrUndefined(incidentId)) {
        this._incidentId = incidentId;
        this._isDataLoading = true;
        this._store.dispatch(new LoadInjuredPersonDataAction(incidentId));
      }
    });

    this._employeeDetailsSubscription = this._store.let(fromRoot.getInjuredPersonSelectedUserEmpDetails).subscribe(emp => {
      if (!isNullOrUndefined(emp)) {
        this._injuredPersonDetails.Address = emp.Address;
        this._injuredPersonDetails.AddressId = emp.Address ? emp.Address.Id : null;
        this._injuredPersonAddUpdateForm.patchValue({
          AddressLine1: emp.Address ? emp.Address.AddressLine1 : '',
          AddressLine2: emp.Address ? emp.Address.AddressLine2 : '',
          Town: emp.Address ? emp.Address.Town : '',
          CountyId: emp.Address ? emp.Address.CountyId : '',
          Postcode: emp.Address ? emp.Address.Postcode : '',
          JobRole: emp.Occupation ? emp.Occupation : '',
          StartDate: emp.StartDate ? new Date(emp.StartDate) : null,
          DateOfBirth: emp.DateOfBirth ? new Date(emp.DateOfBirth) : null,
          MobilePhone: emp.Address ? emp.Address.MobilePhone : '',
          Gender: emp.Gender
        });
      }
    });
    let injuredpartyField = this._formFields.filter(f => f.field.name === 'InjuredPartyId')[0];
    this._injuredPartySubscription = this._store.let(fromRoot.getInjuredPartyData).subscribe(data => {
      if (!isNullOrUndefined(data)) {
        this._injuredPartyList = mapInjuredPartyData(data);
        this._injuredPartyEmpTypeId = this._injuredPartyList.filter(x => x.Text == 'Employee').first().Value;
        if (injuredpartyField)
          (<BehaviorSubject<Immutable.List<AeSelectItem<string>>>>injuredpartyField.context.getContextData().get('options')).next(this._injuredPartyList);
      }
    });

    this._contextUserPropertyValue = <BehaviorSubject<boolean>>this._formFields.filter(f => f.field.name === 'SelectedUser')[0].context.getContextData().get('propertyValue');
    this._contextPreganantFieldPropertyValue = <BehaviorSubject<boolean>>this._formFields.filter(f => f.field.name === 'IsPregnant')[0].context.getContextData().get('propertyValue');
    this._contextNamePropertyValue = <BehaviorSubject<boolean>>this._formFields.filter(f => f.field.name === 'Name')[0].context.getContextData().get('propertyValue');
    this._contextStartDatePropertyValue = <BehaviorSubject<boolean>>this._formFields.filter(f => f.field.name === 'StartDate')[0].context.getContextData().get('propertyValue');
    this._contextOtherPropertyValue = <BehaviorSubject<boolean>>this._formFields.filter(f => f.field.name === 'OtherInjuryParty')[0].context.getContextData().get('propertyValue');


    let countyField = this._formFields.filter(f => f.field.name === 'CountyId')[0];
    this._counties$.subscribe(<BehaviorSubject<Immutable.List<AeSelectItem<string>>>>countyField.context.getContextData().get('options'));

    this._genderList = getAeSelectItemsFromEnum(Gender);
    let genderField = this._formFields.filter(f => f.field.name === 'Gender')[0];
    (<BehaviorSubject<Immutable.List<AeSelectItem<number>>>>genderField.context.getContextData().get('options')).next(this._genderList);

    let selectedUserField = this._formFields.filter(f => f.field.name === 'SelectedUser')[0];
    (<EventEmitter<any>>selectedUserField.context.getContextData().get('searchEvent')).subscribe((event) => {
      this._incidentReportedBySearchService.getFilteredUserData(event.query).subscribe((data) => {
        (<BehaviorSubject<AeSelectItem<string>[]>>selectedUserField.context.getContextData().get('items')).next(data);
        this._filteredUsers = data;
      });
    });

    this._incidentInjuredPersonUpdateStatusSubscription = this._store.let(fromRoot.getIncidentInjurePersonDetailsAddUpdateStatus).subscribe(status => {
      if (status && this._saveInjuredPerson) {
        this._context.waitEvent.next(true);
      }
    });
  }

  ngOnDestroy() {
    if (this._employeeDetailsSubscription)
      this._employeeDetailsSubscription.unsubscribe();
    if (this._incidentIdSubscription)
      this._incidentIdSubscription.unsubscribe();
    if (this._injuredPersonSubscription)
      this._injuredPersonSubscription.unsubscribe();
    if (this._injuredPartySubscription)
      this._injuredPartySubscription.unsubscribe();
    if (this._routeParamSubscription)
      this._routeParamSubscription.unsubscribe();
    if (this._incidentInjuredPersonUpdateStatusSubscription)
      this._incidentInjuredPersonUpdateStatusSubscription.unsubscribe();
  }
}
