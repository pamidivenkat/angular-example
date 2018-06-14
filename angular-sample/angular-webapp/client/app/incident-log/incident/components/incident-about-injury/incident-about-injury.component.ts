import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, ViewEncapsulation, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { IFormBuilderVM, IFormFieldWrapper, FormFieldType } from './../../../../shared/models/iform-builder-vm';
import { Subscription, BehaviorSubject, Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from "util";
import { AboutInjury } from './../../models/incident-about-injury.model';
import { IncidentAboutIncidentForm } from './../../models/incident-about-injury.form';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from "@angular/forms";
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { IncidentAboutIncidentDetailsGetAction, IncidentAboutIncidentDetailsUpdateAction, IncidentAboutIncidentDetailsAddAction } from './../../actions/incident-about-injury.actions';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { IncidentTypeLoadAction, InjuryTypeLoadAction, InjuredPartLoadAction, WorkProcessLoadAction, MainFactorLoadAction } from './../../../../shared/actions/lookup.actions';
import { IncidentType, InjuryType, InjuredPart } from './../../../../shared/models/lookup.models';
import {
  createSelectOptionFromArrayList, mapLookupTableToAeSelectItems
} from './../../../../employee/common/extract-helpers';
import { mapIncidentTypeToAeSelectItems, extractValuesInAlphabeticOrder } from './../../common/extract-helpers';
import { LoadSitesWithAddressAction } from './../../../../shared/actions/company.actions';
import { Site } from './../../../../shared/models/site.model';
import { Address } from './../../../../employee/models/employee.model';
import { CommonValidators } from './../../../../shared/validators/common-validators';
import { AeClassStyle } from "./../../../../atlas-elements/common/ae-class-style.enum";
import { IncidentFormField, DependsUIField, EqualityType, OptionType } from "../../models/incident-form-field";
import { Witness, AboutIncident, IncidentDetailsVM } from "../../models/incident-about-incident";
import { isObject } from "rxjs/util/isObject";
import { AeLoaderType } from "./../../../../atlas-elements/common/ae-loader-type.enum";

@Component({
  selector: 'incident-about-injury',
  templateUrl: './incident-about-injury.component.html',
  styleUrls: ['./incident-about-injury.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class IncidentAboutInjuryComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private variables - start
  private _isNew: boolean = true;
  private _formName: string;
  private _formFields: Array<IFormFieldWrapper<any>>;
  private _incidentAboutIncidentFormVM: IFormBuilderVM;
  private _incidentAboutInjuryForm: FormGroup = new FormGroup({});
  private _context: any;
  private _routeParamsSubscription: Subscription;
  private _incidentIdSubscription: Subscription;
  private _submitEventSubscription: Subscription;
  private _incidentId: string;
  private _incidentAboutIncidentDetails: AboutIncident;
  private _incidentDetails: AboutIncident;
  private _counties$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _countySubscription: Subscription;
  private _incidentTypeAndDetailsSubscription: Subscription;
  private _incidentTypeData: Array<IncidentType>;
  private _incidentTypeSelectData: Immutable.List<AeSelectItem<string>>;
  private _injuryTypeSubscription: Subscription;
  private _injuryTypeData: InjuryType[];
  private _injuredPartSubscription: Subscription;
  private _injuredPartData: InjuredPart[];
  private _siteSubscription: Subscription;
  private _siteData: Immutable.List<AeSelectItem<string>>;
  private _siteList: Site[];
  private _siteChangeSubscription: Subscription;
  private _formKeyFields: Array<string> = [];
  private _showNotification: boolean = false;;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _incidentTypeId: string;
  private _incidentTypeFields: Array<IncidentFormField>;
  private _subscriptionsArray: Subscription[] = [];
  private _aboutIncidentForm: FormGroup;
  private _witnesses: Array<any>;
  private _hasWitness: boolean = false;
  private _diseaseCategories: any;
  private _incidentTypeIdValueChangeSub: Subscription;
  private _hasWitnessChangeSub: Subscription;
  private _isIncidentTypeChanged: boolean;
  private _loaderType: AeLoaderType = AeLoaderType.Bars;
  private _countiesData: Immutable.List<AeSelectItem<string>>;
  private _aboutIncidentAddUpdateProgressSubscription: Subscription;
  private _submitted: boolean = false;
  private _incidentDetailsLoaded: boolean = false;
  private _formInitComplete: boolean = false;
  private _saveAboutIncident: boolean;

  // Private variables - end

  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: any) {
    this._context = val;
  }

  @Input('counties')
  get counties() {
    return this._counties$;
  }
  set counties(val: Observable<Immutable.List<AeSelectItem<string>>>) {
    this._counties$ = val;
  }
  get aboutIncidentForm(): FormGroup {
    return this._aboutIncidentForm;
  }

  get hasWitness() {
    return this._hasWitness;
  }
  public get witnessesArray() {
    return this._witnesses;
  }

  get showPopUp() {
    return this._showNotification;
  }

  get lightClass() {
    return this._lightClass;
  }
  isIncidentTypeChanged() {
    return this._isIncidentTypeChanged;
  }
  get loaderType() {
    return this._loaderType;
  }
  // Input properties - end

  public get incidentAboutFormVM() {
    return this._incidentAboutIncidentFormVM;
  }

  private _initWitnessForm() {
    if (isNullOrUndefined(this._witnesses) || (this._witnesses.length == 0)) {
      this._getWitnessess();
    }
    this._aboutIncidentForm = this._fb.group({
      witnesses: this._fb.array([]),
    });
    let formArray = <FormArray>this._aboutIncidentForm.controls['witnesses'];
    this._witnesses.forEach(witness => {
      formArray.push(this._initIndividualWitness(witness));
    });
  }

  _initIndividualWitness(witness: Witness) {
    return this._fb.group({
      FullName: [{ value: witness.FullName, disabled: false }],
      Telephone: [{ value: witness.Telephone, disabled: false }],
      JobRole: [{ value: witness.JobRole, disabled: false }]
    })
  }
  modalClosed() {
    this._context.clearEvent.next(true);
    return this._showNotification = false;
  }
  onConfirmation() {
    this._showNotification = false;
    this._saveAboutIncidentData();
  }

  private _getWitnessess(): Array<Witness> {
    this._witnesses = new Array<Witness>();
    let i: number;
    for (i = 0; i < 5; i++) {
      this._witnesses.push(new Witness("", "", ""));
    }
    return this._witnesses;
  }

  // constructor - start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _claimsHelper: ClaimsHelperService
    , private _router: ActivatedRoute
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilder) {
    super(_localeService, _translationService, _cdRef);
    this._isIncidentTypeChanged = true;
    this._incidentAboutIncidentDetails = new AboutIncident();
    this._formFields = new Array<IFormFieldWrapper<any>>();
  }
  // constructor - end

  // Public methods - start
  ngOnInit() {
    let incidentTypeSubscription = this._store.let(fromRoot.getIncidentTypeData);
    let incidentDetailsSubscription = this._store.let(fromRoot.getIncidentAboutIncidentDetails);
    let incidentTypeAndDetailsSubscription = Observable.combineLatest(incidentTypeSubscription, incidentDetailsSubscription, (incidentTypeData, incidentAboutInjuryDetails) => {
      if (isNullOrUndefined(incidentTypeData)) {
        this._store.dispatch(new IncidentTypeLoadAction());
      }
      else {
        this._incidentTypeData = incidentTypeData;
        this._incidentTypeSelectData = mapIncidentTypeToAeSelectItems(incidentTypeData);
        this._diseaseCategories = mapLookupTableToAeSelectItems(incidentTypeData.filter(c => c.IncidentCategory.Code === 3));
        if (!this._formInitComplete) {
          this._formInitComplete = true;
          this._refreshForm();
        }

      }
      if (!isNullOrUndefined(incidentAboutInjuryDetails)) {
        if (incidentAboutInjuryDetails.Id == null) {
          this._isNew = true;
        }
        else {
          this._isNew = false;
          if (!isNullOrUndefined(incidentAboutInjuryDetails))
            this._incidentAboutIncidentDetails = incidentAboutInjuryDetails;
          this._incidentDetails = incidentAboutInjuryDetails;
        }
      }
      if (!this._incidentDetailsLoaded
        && !isNullOrUndefined(this._incidentTypeData)
        && !isNullOrUndefined(this._incidentAboutIncidentDetails)
        && !isNullOrUndefined(this._incidentAboutIncidentDetails.IncidentTypeId)) {
        this._incidentDetailsLoaded = true;
        this._incidentTypeId = this._incidentAboutIncidentDetails.IncidentTypeId;
        this._refreshForm();
      }
    });
    this._incidentTypeAndDetailsSubscription = incidentTypeAndDetailsSubscription.subscribe();

    this._injuryTypeSubscription = this._store.let(fromRoot.getInjuryTypeData).subscribe(injuryTypeData => {
      if (isNullOrUndefined(injuryTypeData)) {
        this._store.dispatch(new InjuryTypeLoadAction());
      }
      else {
        this._injuryTypeData = extractValuesInAlphabeticOrder(injuryTypeData);
        this._bindInjuryTypes();
      }
    });

    this._injuredPartSubscription = this._store.let(fromRoot.getInjuredPartData).subscribe(injuredPartData => {
      if (isNullOrUndefined(injuredPartData)) {
        this._store.dispatch(new InjuredPartLoadAction());
      }
      else {
        this._injuredPartData = extractValuesInAlphabeticOrder(injuredPartData);
        this._bindInjuredParts();
      }
    });

    this._siteSubscription = this._store.let(fromRoot.getSiteWithAddressData).subscribe(siteData => {
      if (isNullOrUndefined(siteData)) {
        this._store.dispatch(new LoadSitesWithAddressAction());
      }
      else {
        this._siteList = siteData;
        this._siteData = mapLookupTableToAeSelectItems(siteData);
        this._siteData = this._siteData.push(new AeSelectItem<string>('Other', 'other', false));
        this._bindSites();
      }
    });

    this._routeParamsSubscription = this._router.params.subscribe(params => {
      if (isNullOrUndefined(params['id'])) {
        this._incidentId = '';
      }
      else {
        this._incidentId = params['id'];
        this._store.dispatch(new IncidentAboutIncidentDetailsGetAction(this._incidentId));
      }
    });

    if (this._incidentId === '') {
      this._incidentIdSubscription = this._store.let(fromRoot.getIncidentId).subscribe(incidentId => {
        if (!isNullOrUndefined(incidentId)) {
          this._incidentId = incidentId;
          this._store.dispatch(new IncidentAboutIncidentDetailsGetAction(this._incidentId));
        }
      });
    }

    this._countySubscription = this._counties$.subscribe(val => {
      if (!isNullOrUndefined(val)) {
        this._countiesData = val;
        this._bindCounties();
      }
    });

    this._submitEventSubscription = this._context.submitEvent.subscribe((value) => {
      if (value) {
        this._onAboutInjuryFormSubmit();
      }
    });

    this._aboutIncidentAddUpdateProgressSubscription = this._store.let(fromRoot.getIncidentAboutIncidentDetailsAddUpdateProgressStatus).subscribe(status => {
      if (status && this._saveAboutIncident) {
        this._context.waitEvent.next(true);
      }
    });
  }

  private _bindDropDownData() {
    this._bindIncidentTypesAndDiseaseCategories();
    this._bindInjuryTypes();
    this._bindInjuredParts();
    this._bindSites();
    this._bindCounties();
  }

  private _bindIncidentTypesAndDiseaseCategories() {
    if (!isNullOrUndefined(this._incidentTypeSelectData)) {
      let IncidentTypeIdField = this._formFields.filter(f => f.field.name === 'IncidentTypeId')[0];
      if (!isNullOrUndefined(IncidentTypeIdField)) {
        (<BehaviorSubject<Immutable.List<AeSelectItem<string>>>>IncidentTypeIdField.context.getContextData().get('options')).next(this._incidentTypeSelectData);
      }
    }

    if (!isNullOrUndefined(this._diseaseCategories)) {
      let dignosedDiseaseCategoryField = this._formFields.filter(f => f.field.name === 'DiagnosedDiseaseCategory')[0];
      if (!isNullOrUndefined(dignosedDiseaseCategoryField)) {
        (<BehaviorSubject<Immutable.List<AeSelectItem<string>>>>dignosedDiseaseCategoryField.context.getContextData().get('options')).next(this._diseaseCategories);
      }
    }
  }

  private _bindInjuryTypes() {
    if (!isNullOrUndefined(this._injuryTypeData)) {
      let injuryTypesField = this._formFields.filter(f => f.field.name === 'InjuryTypes')[0];
      if (!isNullOrUndefined(injuryTypesField))
        (<BehaviorSubject<InjuryType[]>>injuryTypesField.context.getContextData().get('items')).next(this._injuryTypeData);
    }
  }

  private _bindInjuredParts() {
    if (!isNullOrUndefined(this._injuredPartData)) {
      let injuredPartsField = this._formFields.filter(f => f.field.name === 'InjuredParts')[0];
      if (!isNullOrUndefined(injuredPartsField))
        (<BehaviorSubject<InjuredPart[]>>injuredPartsField.context.getContextData().get('items')).next(this._injuredPartData);
    }
  }

  private _bindSites() {
    if (!isNullOrUndefined(this._siteData)) {
      let siteIdField = this._formFields.filter(f => f.field.name === 'SiteId')[0];
      if (!isNullOrUndefined(siteIdField))
        (<BehaviorSubject<Immutable.List<AeSelectItem<string>>>>siteIdField.context.getContextData().get('options')).next(this._siteData);
    }
  }

  private _bindCounties() {
    if (!isNullOrUndefined(this._countiesData)) {
      let countyIdField = this._formFields.filter(f => f.field.name === 'County')[0];
      if (!isNullOrUndefined(countyIdField))
        (<BehaviorSubject<Immutable.List<AeSelectItem<string>>>>countyIdField.context.getContextData().get('options')).next(this._countiesData);
    }

  }

  private _clearFormData() {
    if (this._incidentDetailsLoaded
      && !StringHelper.isNullOrUndefinedOrEmpty(this._incidentAboutIncidentDetails.IncidentTypeId)
      && !StringHelper.isNullOrUndefinedOrEmpty(this._incidentTypeId)
      && (this._incidentTypeId !== this._incidentAboutIncidentDetails.IncidentTypeId)
    ) {
      this._incidentAboutIncidentDetails = new AboutIncident();
    }
  }
  private _refreshForm() {
    this._isIncidentTypeChanged = true;
    this._hasWitness = false;
    this._clearFormData();
    this._formName = 'IncidentAboutInjuryForm';
    this._incidentAboutIncidentFormVM = new IncidentAboutIncidentForm(this._formName, this._getIncidentTypeFields(), this._incidentTypeId);
    this._formFields = this._incidentAboutIncidentFormVM.init();
    this._cdRef.markForCheck();
    setTimeout(() => {
      this._isIncidentTypeChanged = false;
      this._cdRef.markForCheck();
    }, 500);
  }

  ngOnDestroy() {
    this._unsubscribeSubscriptions();
    super.ngOnDestroy();
  }


  private _unsubscribeSubscriptions() {
    if (this._routeParamsSubscription)
      this._routeParamsSubscription.unsubscribe();
    if (this._incidentIdSubscription)
      this._incidentIdSubscription.unsubscribe();
    if (this._submitEventSubscription)
      this._submitEventSubscription.unsubscribe();
    if (this._incidentTypeAndDetailsSubscription)
      this._incidentTypeAndDetailsSubscription.unsubscribe();
    if (this._injuryTypeSubscription)
      this._injuryTypeSubscription.unsubscribe();
    if (this._injuredPartSubscription)
      this._injuredPartSubscription.unsubscribe();
    if (this._siteSubscription)
      this._siteSubscription.unsubscribe();
    if (this._countySubscription)
      this._countySubscription.unsubscribe();
    if (this._siteChangeSubscription)
      this._siteChangeSubscription.unsubscribe();
    if (this._incidentTypeIdValueChangeSub)
      this._incidentTypeIdValueChangeSub.unsubscribe();
    if (this._hasWitnessChangeSub)
      this._hasWitnessChangeSub.unsubscribe();
    if (!isNullOrUndefined(this._subscriptionsArray) && this._subscriptionsArray.length > 0) {
      this._subscriptionsArray.forEach(sub => {
        if (sub)
          sub.unsubscribe();
      });
    }
    if (this._aboutIncidentAddUpdateProgressSubscription) {
      this._aboutIncidentAddUpdateProgressSubscription.unsubscribe();
    }
  }
  // Public methods - end

  // Private methods - start
  public onFormInit(fg: FormGroup) {
    this._incidentAboutInjuryForm = fg;
    this._bindDropDownData();
    if (!isNullOrUndefined(this._incidentTypeFields) && (this._incidentTypeFields.length > 0)) {
      this.toggleFields();
    }
    this._incidentTypeIdValueChangeSub = this._incidentAboutInjuryForm.get('IncidentTypeId').valueChanges.subscribe(val => {
      if (!isNullOrUndefined(this._incidentTypeData) && (this._incidentTypeId !== val)) {
        this._incidentTypeId = val;
        this._refreshForm();
      }
    });
    if (!isNullOrUndefined(this._incidentTypeFields) && this._incidentTypeFields.length > 0) {
      let hasWitnessField = this._incidentAboutInjuryForm.get('HasWitness');
      if (!isNullOrUndefined(hasWitnessField)) {
        this._hasWitnessChangeSub = hasWitnessField.valueChanges.subscribe(val => {
          this._hasWitness = (isNullOrUndefined(val) || Number(val) === 1) ? false : true;
          if (this._hasWitness) {
            this._initWitnessForm();
          }
        });
      }
      this._siteChangeSubscription = this._incidentAboutInjuryForm.get('SiteId').valueChanges.subscribe(val => {
        this._bindSiteDetails(val);
      });
      let whenReportedField = this._incidentAboutInjuryForm.get('WhenReported');
      let whenHappenedField = this._incidentAboutInjuryForm.get('WhenHappened');
      if (!isNullOrUndefined(whenReportedField) && !isNullOrUndefined(whenHappenedField)) {
        let whenReportedvalChangeSub = whenReportedField.valueChanges.subscribe(whenReported => {
          let whenHappened = whenHappenedField.value;
          if (!isNullOrUndefined(whenReported) && !isNullOrUndefined(whenHappened)) {
            this._setDateCompareValidator(whenReportedField, whenHappenedField);
          } else {
            whenReportedField.clearValidators();
          }
        });
        this._subscriptionsArray.push(whenReportedvalChangeSub);
        let whenHappenedValChangeSub = whenHappenedField.valueChanges.subscribe(whenHappened => {
          let whenReported = whenReportedField.value;
          if (!isNullOrUndefined(whenReported) && !isNullOrUndefined(whenHappened)) {
            this._setDateCompareValidator(whenReportedField, whenHappenedField);
          } else {
            whenReportedField.clearValidators();
          }
        });
        this._subscriptionsArray.push(whenHappenedValChangeSub);
      }

    }
    this._bindAboutIncidentForm();
  }

  private _setDateCompareValidator(baseField: AbstractControl, targetField: AbstractControl) {
    baseField.setValidators(CommonValidators.dateCompare(targetField, (base, target) => {
      if (target >= base) {
        return false;
      } else {
        return true;
      }
    }));
  }
  private _bindSiteDetails(siteId?: string) {
    if (StringHelper.isNullOrUndefinedOrEmpty(siteId) || siteId === 'other') {
      this._setValue('AddressLine1', '');
      this._setValue('AddressLine2', '');
      this._setValue('Town', '');
      this._setValue('County', '');
      this._setValue('Postcode', '');
    } else {
      this._setValue('OtherSite', '');
      if (!isNullOrUndefined(this._siteList)) {
        let selectedSite = this._siteList.find(s => s.Id === siteId);
        if (!isNullOrUndefined(selectedSite)) {
          this._setValue('AddressLine1', selectedSite.Address ? selectedSite.Address.AddressLine1 : '');
          this._setValue('AddressLine2', selectedSite.Address ? selectedSite.Address.AddressLine2 : '');
          this._setValue('Town', selectedSite.Address ? selectedSite.Address.Town : '');
          this._setValue('County', selectedSite.Address ? selectedSite.Address.CountyId : '');
          this._setValue('Postcode', selectedSite.Address ? selectedSite.Address.Postcode : '');
        }
      }
    }
  }

  private _bindAboutIncidentForm() {
    if (!isNullOrUndefined(this._incidentAboutIncidentDetails.IncidentDetails)) {
      let details = <IncidentDetailsVM>JSON.parse(this._incidentAboutIncidentDetails.IncidentDetails);
      this._witnesses = <Array<Witness>>details.Witnesses;
      if (!isNullOrUndefined(this._incidentTypeFields)) {
        this._incidentTypeFields.forEach(incidentField => {
          if (incidentField.FieldType == FormFieldType.AutoComplete) {
            let autoCompleteData = details[incidentField.Name];
            if (!isNullOrUndefined(autoCompleteData) && (autoCompleteData.length > 0)) {
              let dataToAssignToField: Array<any>;
              let filteredData: Array<any>;
              autoCompleteData.forEach(data => {
                if (incidentField.Name == "InjuredParts" && !isNullOrUndefined(this._injuredPartData)) {
                  filteredData = this._injuredPartData.filter(f => f.Id.toLowerCase() === data.Id.toLowerCase());
                }
                if (incidentField.Name == "InjuryTypes" && !isNullOrUndefined(this._injuryTypeData)) {
                  filteredData = this._injuryTypeData.filter(f => f.Id.toLowerCase() === data.Id.toLowerCase());
                }
                if (filteredData) {
                  if (isNullOrUndefined(dataToAssignToField))
                    dataToAssignToField = filteredData;
                  else
                    dataToAssignToField.push(filteredData[0]);
                }
              });
              if (!isNullOrUndefined(dataToAssignToField))
                this._setValue(incidentField.Name, dataToAssignToField);
            }
          }
          else if (incidentField.FieldType == FormFieldType.DateWithTime || incidentField.FieldType == FormFieldType.Date) {
            if (!isNullOrUndefined(details[incidentField.Name]) && !StringHelper.isNullOrUndefinedOrEmpty(details[incidentField.Name])) {
              this._setValue(incidentField.Name, new Date(details[incidentField.Name]));
            }
            else {
              this._setValue(incidentField.Name, null);
            }
          }
          else if (incidentField.FieldType == FormFieldType.Select) {
            if (incidentField.Name == "DiagnosedDiseaseCategory") {
              if (!isNullOrUndefined(details[incidentField.Name]) && details[incidentField.Name].length > 0) {
                if (isObject(details[incidentField.Name])) {
                  let assignValue: any = details[incidentField.Name][0];
                  this._setValue(incidentField.Name, assignValue.Id.toLowerCase());
                }
                else {
                  this._setValue(incidentField.Name, details[incidentField.Name]);
                }
              }
              else {
                this._setValue(incidentField.Name, "");
              }
            }
            else if (incidentField.Name == "IsMedicalAssistanceRequired") {
              if (!isNullOrUndefined(details[incidentField.Name])) {
                this._setValue(incidentField.Name, details[incidentField.Name]);
              }
              else {
                this._setValue(incidentField.Name, "");
              }
            }
            else if (incidentField.Name == "County") {
              if (!isNullOrUndefined(details[incidentField.Name])) {
                if (isObject(details[incidentField.Name])) {
                  let assignValue: any = details[incidentField.Name];
                  if (!isNullOrUndefined(assignValue.Id)) {
                    this._setValue(incidentField.Name, assignValue.Id.toLowerCase());
                  }
                  else {
                    this._setValue(incidentField.Name, "");
                  }
                }
                else {
                  if (!StringHelper.isNullOrUndefinedOrEmpty(details[incidentField.Name])) {
                    this._setValue(incidentField.Name, details[incidentField.Name].toLowerCase());
                  }
                  else {
                    this._setValue(incidentField.Name, "");
                  }
                }
              }
              else {
                this._setValue(incidentField.Name, "");
              }
            }
            else if (!isNullOrUndefined(details[incidentField.Name])) {
              this._setValue(incidentField.Name, details[incidentField.Name].toLowerCase());
            }
            else {
              this._setValue(incidentField.Name, "");
            }
          }
          else {
            let fValue = details[incidentField.Name];
            if (incidentField.Name === "HasWitness") {
              if (isNullOrUndefined(fValue)) {
                fValue = "1";
              }
            }
            this._setValue(incidentField.Name, fValue);
          }
        });
      }
    }
  }

  private toggleFields() {
    this._incidentTypeFields.forEach(formField => {
      if (!isNullOrUndefined(formField.Depends)) {
        for (let key in formField.Depends) {
          let dependsOnField = <DependsUIField>formField.Depends[key][0];
          if (!isNullOrUndefined(dependsOnField)) {
            if (key === 'Visibility') {
              let sub = this._incidentAboutInjuryForm.get(dependsOnField.Field).valueChanges.subscribe((newVal) => {
                this._toggleVisibility(newVal, formField);
              });
              this._subscriptionsArray.push(sub);
            }
          }
        }
      }
    });

  }

  private _setValue(fieldName: string, value: any) {
    if (!isNullOrUndefined(this._incidentAboutInjuryForm)) {
      let field = this._incidentAboutInjuryForm.get(fieldName);
      if (!isNullOrUndefined(field)) {
        this._incidentAboutInjuryForm.get(fieldName).setValue(value);
      }
    }
  }

  private _evaluateCondition(equality: EqualityType, val: any, propertyValue: any, compareType: OptionType = OptionType.string) {
    if (compareType === OptionType.number) {
      val = Number(val);
    }

    switch (equality) {
      case EqualityType.equal:
        return (val === propertyValue);
      case EqualityType.notEqual:
        return (val !== propertyValue);
      case EqualityType.greater:
        return (val > propertyValue);
      case EqualityType.lesser:
        return (val < propertyValue);
      case EqualityType.greaterOrEqual:
        return (val >= propertyValue);
      case EqualityType.lesserOrEqual:
        return (val <= propertyValue);
      default:
        return false;
    }
  }

  private _evaluateMultipleConditions(val: boolean, operation: string, newVal: boolean): boolean {
    switch (operation) {
      case 'or':
        return val || newVal;
      case 'and':
        return val && newVal
    }
    return val;
  }

  private _toggleVisibility(val: any, field: IncidentFormField) {
    let contextPropertyValue = <BehaviorSubject<any>>this._formFields.filter(f => f.field.name === field.Name)[0].context.getContextData().get('propertyValue');
    if (!isNullOrUndefined(contextPropertyValue)) {
      this._setValue(field.Name, (field.FieldType === FormFieldType.Select) ? '' : null);
      let dependsUIField = field.Depends['Visibility'][0];
      if (!isNullOrUndefined(dependsUIField)) {
        let visibility = false;
        let props = dependsUIField['Properties'];
        if (props.length > 1) {
          let condition = dependsUIField['Condition'];
          if (!StringHelper.isNullOrUndefinedOrEmpty(condition)) {
            for (let prop of props) {
              let equality = <EqualityType>prop['Equality'];
              let propVal = prop['PropertyValue'];
              let comapareType = OptionType.string;
              if (!isNullOrUndefined(field.OptionType)) {
                comapareType = field.OptionType;
              }
              visibility = this._evaluateMultipleConditions(visibility, condition, this._evaluateCondition(equality, val, propVal, comapareType))
            }
          }
          contextPropertyValue.next(visibility);
        } else {
          let prop = props[0];
          if (!isNullOrUndefined(prop)) {
            let equality = <EqualityType>prop['Equality'];
            let propVal = prop['PropertyValue'];
            let comapareType = OptionType.string;
            if (!isNullOrUndefined(field.OptionType)) {
              comapareType = field.OptionType;
            }
            visibility = this._evaluateCondition(equality, val, propVal, comapareType);
            if (dependsUIField['Field'] === 'SiteId' && StringHelper.isNullOrUndefinedOrEmpty(val)) {
              visibility = false;
            }
          }
        }
        contextPropertyValue.next(visibility);
      }
    }
  }


  private _getIncidentTypeFields() {
    this._incidentTypeFields = new Array<IncidentFormField>();
    if (!StringHelper.isNullOrUndefinedOrEmpty(this._incidentTypeId)
      && !isNullOrUndefined(this._incidentTypeData)) {
      let selectedIncidentType = this._incidentTypeData.find(i => i.Id === this._incidentTypeId);
      if (!isNullOrUndefined(selectedIncidentType)) {
        this._incidentTypeFields = <Array<IncidentFormField>>JSON.parse(selectedIncidentType.IncidentCategory.Fields);
      }
    }
    return this._incidentTypeFields;
  }

  public onFormValidityChange(status: boolean) {
    this._context.isValidEvent.emit(status);
  }

  private _onAboutInjuryFormSubmit() {
    if (!this._submitted) {
      this._submitted = true;
      if (!isNullOrUndefined(this._incidentAboutInjuryForm) && this._incidentAboutInjuryForm.valid && !this._incidentAboutInjuryForm.pristine) {
        if (!this._validateFormKeyFields()) {
          this._saveAboutIncidentData();
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
    }
    this._cdRef.markForCheck();
  }

  private _saveAboutIncidentData() {
    this._saveAboutIncident = true;
    this._prepareIncidentAboutIncidentDetailsForSaveUpdate(this._incidentAboutInjuryForm.value);
    if (this._isNew) {
      this._store.dispatch(new IncidentAboutIncidentDetailsAddAction(this._incidentAboutIncidentDetails));
    }
    else {
      this._store.dispatch(new IncidentAboutIncidentDetailsUpdateAction(this._incidentAboutIncidentDetails));
    }
  }

  private _validateFormKeyFields() {
    this._formKeyFields = [];
    this._formFields.filter(f => f.context.getContextData().get('required') && (isNullOrUndefined(f.context.getContextData().get('propertyValue')) || f.context.getContextData().get('propertyValue').getValue() == true)).forEach(x => {
      this._formKeyFields.push(x.field.name);
    });
    for (var item of this._formKeyFields) {
      if (isNullOrUndefined(this._incidentAboutInjuryForm.get(item).value) || this._incidentAboutInjuryForm.get(item).value == "") {
        this._showNotification = true;
      }
    }
    return this._showNotification;
  }

  private _prepareIncidentAboutIncidentDetailsForSaveUpdate(incidentAboutIncidentFormModel) {
    this._incidentAboutIncidentDetails.IncidentTypeId = incidentAboutIncidentFormModel.IncidentTypeId;
    if (StringHelper.isNullOrUndefinedOrEmpty(this._incidentAboutIncidentDetails.IncidentTypeId)) {
      this._incidentAboutIncidentDetails.IncidentTypeId = null;
    }
    this._incidentAboutIncidentDetails.SiteId = incidentAboutIncidentFormModel.SiteId === 'other' ? '' : incidentAboutIncidentFormModel.SiteId;
    let incidentDetails = <IncidentDetailsVM>incidentAboutIncidentFormModel;
    if (!this._isNew) {
      this._incidentAboutIncidentDetails.Modifier = null;
      this._incidentAboutIncidentDetails.Author = null;
      this._incidentAboutIncidentDetails.IncidentType = null;
      this._incidentAboutIncidentDetails.Site = null;
      this._incidentAboutIncidentDetails.ModifiedOn = new Date();
      this._incidentAboutIncidentDetails.CreatedOn = new Date();
      if (!isNullOrUndefined(this._incidentDetails)) {
        this._incidentAboutIncidentDetails.CreatedOn = this._incidentDetails.CreatedOn || new Date();
      }
    } else {
      this._incidentAboutIncidentDetails.CreatedOn = new Date();
      this._incidentAboutIncidentDetails.ModifiedOn = new Date();
    }
    if (!isNullOrUndefined(incidentDetails)) {
      if (!isNullOrUndefined(this._incidentTypeFields)) {
        //Binding data for auto complete fileds
        let multiSeclectFields = this._incidentTypeFields.filter(f => f.FieldType === FormFieldType.AutoComplete);
        if (!isNullOrUndefined(multiSeclectFields) && multiSeclectFields.length > 0) {
          if (isObject(multiSeclectFields)) {
            multiSeclectFields.forEach(field => {
              let selectedValues = incidentDetails[field.Name];
              if (!isNullOrUndefined(selectedValues) && selectedValues.length > 0) {
                let newValues = new Array<any>();
                selectedValues.forEach(val => {
                  if (!isNullOrUndefined(val)) {
                    let autoCompleteDataToSave = <{ Id: string, Name: string }>new Object();
                    if (isObject(val)) {
                      autoCompleteDataToSave.Id = val["Id"];
                      autoCompleteDataToSave.Name = val["Name"];
                      newValues.push(autoCompleteDataToSave);
                    }
                    else {
                      let filteredData: any;
                      if (field.Name == "InjuredParts" && !isNullOrUndefined(this._injuredPartData)) {
                        filteredData = this._injuredPartData.filter(f => f.Id === val);
                      }
                      if (field.Name == "InjuryTypes" && !isNullOrUndefined(this._injuryTypeData)) {
                        filteredData = this._injuryTypeData.filter(f => f.Id === val);
                      }
                      if (filteredData) {
                        autoCompleteDataToSave.Id = filteredData[0].Id;
                        autoCompleteDataToSave.Name = filteredData[0].Name;
                        newValues.push(autoCompleteDataToSave);
                      }
                    }
                  }
                });
                incidentDetails[field.Name] = newValues;
              }
            });
          }
        }
        //binding data for DiagnosedDiseaseCategory field
        let diagnosedDiseaseCategoryFieldValue = incidentDetails["DiagnosedDiseaseCategory"]
        if (!isNullOrUndefined(diagnosedDiseaseCategoryFieldValue) && !StringHelper.isNullOrUndefinedOrEmpty(diagnosedDiseaseCategoryFieldValue)) {
          let diagnosedData = this._diseaseCategories.find(selectedFieldData => selectedFieldData.Value == diagnosedDiseaseCategoryFieldValue)
          if (diagnosedData) {
            let diagnosedDiseaseArray = <any>new Array();
            let diagnosedDiseaseData = <{ Id: string, Name: string }>new Object();
            diagnosedDiseaseData.Id = diagnosedData.Value;
            diagnosedDiseaseData.Name = diagnosedData.Text;
            diagnosedDiseaseArray.push(diagnosedDiseaseData);
            incidentDetails["DiagnosedDiseaseCategory"] = diagnosedDiseaseArray;
          }
        }
        //binding data for County field
        let countyFieldValue = incidentDetails["County"]
        if (!isNullOrUndefined(countyFieldValue) && !StringHelper.isNullOrUndefinedOrEmpty(countyFieldValue)) {
          let countyData = this._countiesData.find(selectedFieldData => selectedFieldData.Value == countyFieldValue)
          if (countyData) {
            let countiesData = <{ Id: string, Name: string }>new Object();
            countiesData.Id = countyData.Value;
            countiesData.Name = countyData.Text;
            incidentDetails["County"] = countiesData;
          }
        }
      }
      incidentDetails.Witnesses = new Array<Witness>();
      if (!isNullOrUndefined(incidentDetails.HasWitness) && (Number(incidentDetails.HasWitness) === 0)) {
        let witnesses = <Array<Witness>>this._aboutIncidentForm.value["witnesses"];
        incidentDetails.Witnesses = witnesses;
      }
      this._incidentAboutIncidentDetails.IncidentDetails = JSON.stringify(incidentDetails);
    }
    this._incidentAboutIncidentDetails.Id = this._incidentId;
  }
  // Private methods - end
}
