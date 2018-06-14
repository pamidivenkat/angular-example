import { Input } from '@angular/core';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BaseComponent } from "../../shared/base-component";
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { MessengerService } from "../../shared/services/messenger.service";
import * as fromRoot from '../../shared/reducers';
import { IFormBuilderVM, IFormFieldWrapper } from "../../shared/models/iform-builder-vm";
import { FormGroup } from "@angular/forms";
import { AddressForm } from "../common/address-form";
import { Observable } from "rxjs/Observable";
import * as Immutable from 'immutable';
import { AeSelectItem } from "../common/models/ae-select-item";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { isNullOrUndefined } from "util";
import { Subscription } from "rxjs/Subscription";
import { CountyLoadAction, CountryLoadAction } from "../../shared/actions/lookup.actions";
import { mapLookupTableToAeSelectItems } from "../../employee/common/extract-helpers";
import { Address } from "../common/adress";
@Component({
  selector: 'ae-address',
  templateUrl: './ae-address.component.html',
  styleUrls: ['./ae-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None

})
export class AeAddressComponent extends BaseComponent implements OnInit, OnDestroy {
  private _addressFormVM: IFormBuilderVM;
  private _addressForm: FormGroup;
  private _submitted: boolean = false;
  private _formName: string;
  private _fields: Array<IFormFieldWrapper<any>>;
  private _county$: BehaviorSubject<any>;
  private _country$: BehaviorSubject<any>;
  private _countyLoadedSubscription: Subscription;
  private _countryLoadedSubscription: Subscription;
  private _countyDataSubscription: Subscription;
  private _countryDataSubscription: Subscription;
  private _addressFormVMData: Address;

  get addressFormVM(): IFormBuilderVM {
    return this._addressFormVM;
  }


  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _messenger: MessengerService) {
    super(_localeService, _translationService, _cdRef);
    this._formName = "addressForm";
  }

  //Output Variables
  @Output('onCancel') _onAddressFormCancel: EventEmitter<string> = new EventEmitter<string>();
  @Output('onSubmit') _onAddressFormSubmit: EventEmitter<Address> = new EventEmitter<Address>();
  
  @Input('AddressFormVMData')
  set AddressFormVM(val: Address) {
    this._addressFormVMData = val;
    if (!isNullOrUndefined(this._addressFormVMData)) {
      this._addressFormVM = new AddressForm(this._formName, this._addressFormVMData);
      this._fields = this._addressFormVM.init();
    }
  }
  get AddressFormVM() {
    return this._addressFormVMData;
  }
  

  ngOnInit() {
  }

  ngAfterViewInit(): void {
   
  }
  ngOnDestroy() {
    if (!isNullOrUndefined(this._countyLoadedSubscription)) {
      this._countyLoadedSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._countryLoadedSubscription)) {
      this._countryLoadedSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._countyDataSubscription)) {
      this._countyDataSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._countryDataSubscription)) {
      this._countryDataSubscription.unsubscribe();
    }
  }


  onCancel() {
    this._onAddressFormCancel.emit('Cancel');
  }

  onSubmit($event) {
    this._submitted = true;
    if (this._addressForm.valid) {
      let address = this._addressForm.value;
      this._onAddressFormSubmit.emit(address);
    }
  }

  onFormInit(fg: FormGroup) {
    this._addressForm = fg;
    let countyField = this._fields.find(field => field.field.name === 'CountyId');
    if (!isNullOrUndefined(countyField)) {
      this._county$ = countyField.context.getContextData().get('options');
    }

    let countryField = this._fields.find(field => field.field.name === 'CountryId');
    if (!isNullOrUndefined(countryField)) {
      this._country$ = countryField.context.getContextData().get('options');
    }

    this._countyLoadedSubscription = this._store.let(fromRoot.getCountyLoadingState).subscribe((loaded) => {
      if (!loaded) {
        this._store.dispatch(new CountyLoadAction(true));
      }
    });

    this._countryLoadedSubscription = this._store.let(fromRoot.getCountryLoadingState).subscribe((loaded) => {
      if (!loaded) {
        this._store.dispatch(new CountryLoadAction(true));
      }
    });

    this._countyDataSubscription = this._store.let(fromRoot.getCountyData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._county$.next(mapLookupTableToAeSelectItems(res));
      }
    });

    this._countryDataSubscription = this._store.let(fromRoot.getCountryData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._country$.next(mapLookupTableToAeSelectItems(res));
      }
    });
  }

}
