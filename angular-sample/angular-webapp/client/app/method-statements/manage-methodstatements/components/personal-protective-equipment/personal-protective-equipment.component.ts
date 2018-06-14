import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { Observable } from "rxjs/Observable";
import { PPECategoryGroup, PPECategory } from './../../../../shared/models/lookup.models';
import { LoadPPECategoryGroupsAction } from './../../../../shared/actions/lookup.actions';
import { IFormBuilderVM, IFormFieldWrapper, IFormField, FormFieldType } from './../../../../shared/models/iform-builder-vm';
import { PersonalProtectveEquipmentForm } from './../../../../method-statements/models/personal-protective-equipment.form';
import { Subscription, BehaviorSubject } from "rxjs/Rx";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { isNullOrUndefined } from "util";
import { MSPPE, MSPPEOther, MethodStatement } from './../../../../method-statements/models/method-statement';
import { getSortedData } from '../../../../method-statements/common/extract-helper';



@Component({
  selector: 'personal-protective-equipment',
  templateUrl: './personal-protective-equipment.component.html',
  styleUrls: ['./personal-protective-equipment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalProtectiveEquipmentComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _ppeCategoryGroups: PPECategoryGroup[];
  private _ppeFormVM: PersonalProtectveEquipmentForm;
  private _formName: string;
  private _formFields: Array<IFormFieldWrapper<any>>;
  private _context: any;
  private _ppeCategoryGroupsSubscription: Subscription;
  private _submitEventSubscription: Subscription;
  private _ppeForm: FormGroup;
  private _submitted: boolean = false;
  private _isNew: boolean = true;
  private _isFormLoaded: boolean = false;
  private _allSelectedCategories: PPECategory[] = [];
  private _savePPECategoryData: MSPPE[] = [];
  private _mSPPEOtherCategory: MSPPEOther[] = [];
  private _methodstatement: MethodStatement;
  private _valueChangesSubscription: Subscription[] = [];
  private _isPPEModified: boolean = false;
  private _methodStatementSubscription: Subscription;

  // End of Private Fields

  // Public properties

  get ppeFormVM() {
    return this._ppeFormVM;
  }
  get isFormLoaded() {
    return this._isFormLoaded;
  }

  // Private Fields
  @Input('context')
  set context(val: any) {
    this._context = val;
  }
  get context() {
    return this._context;
  }

  @Input('methodstatement')
  set methodstatement(val: MethodStatement) {
    this._methodstatement = val;
  }
  get methodstatement() {
    return this._methodstatement;
  }

  get ppeCategoryGroups() :Observable<PPECategoryGroup[]> {
    return Observable.of(this._ppeCategoryGroups);
  }

  get methodStatementData() {
    return Observable.of(this._methodstatement);
  }
  // End of Public properties

  // Public Output bindings
  @Output('onPPESubmit') onPPEFormSubmit: EventEmitter<MSPPE[]> = new EventEmitter<MSPPE[]>();

  @Output('onPPEChange') onPPEFormChange: EventEmitter<MSPPE[]> = new EventEmitter<MSPPE[]>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor


  // Public methods
  ngOnInit() {

    this._formName = 'PersonalProtectiveEquipmentForm';
    // init form

    this._methodStatementSubscription = this._store.let(fromRoot.getManageMethodStatementData).combineLatest(this._store.let(fromRoot.getPPECategoryGroups))
      .subscribe(res => {
        if (res[0] && res[0].Id && !isNullOrUndefined(res[1]) && !this._isFormLoaded) {
          this._methodstatement = res[0];
          this._ppeCategoryGroups = res[1];
          this._ppeFormVM = new PersonalProtectveEquipmentForm(this._formName);      
          this._formFields = this._ppeFormVM.initFrom(getSortedData(this._ppeCategoryGroups), this._methodstatement);
          this._isFormLoaded = true;
          this._cdRef.markForCheck();
        }
        if (isNullOrUndefined(res[1])) {
          this._store.dispatch(new LoadPPECategoryGroupsAction());
        }
      })

  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._ppeCategoryGroupsSubscription)) {
      this._ppeCategoryGroupsSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._submitEventSubscription)) {
      this._submitEventSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._valueChangesSubscription)) {
      this._valueChangesSubscription.forEach(sub => {
        if (sub) {
          sub.unsubscribe();
        }
      });
    }
    if (!isNullOrUndefined(this._methodStatementSubscription)) {
      this._methodStatementSubscription.unsubscribe();
    }
  }



  // End of public methods


  // Private methods 
  onFormValidityChange(status: boolean) {
    this._context.isValidEvent.emit(status);
  }

  onFormInit(fg: FormGroup) {
    this._ppeForm = fg;
    if (this._formFields) {
      this._formFields.forEach(field => {
        if ((<IFormField<any>>field.field).type === FormFieldType.AutoComplete) {
          let sub = this._ppeForm.get(field.field.name).valueChanges.subscribe((val) => {
            this._isPPEModified = true;
            let otherFiled = this._formFields.find((fw) => fw.field.name === field.field.name + 'Other');
            let group = this._ppeCategoryGroups.find(group => group.Code.toString() === field.field.name)
            let otherCategory = group.PPECategories.find(category => category.Name.toLowerCase() === 'other');

            if (!isNullOrUndefined(otherFiled)) {
              let visibilitySubject = (<BehaviorSubject<boolean>>otherFiled.context.getContextData().get('propertyValue'));
              if (val.find(p => p == otherCategory.Id)) {
                visibilitySubject.next(true);
              } else {
                visibilitySubject.next(false);
              }
            }
            this.onPPEFormSubmitted(null, true);

          });
          this._valueChangesSubscription.push(sub);
        }
        if ((<IFormField<any>>field.field).type === FormFieldType.InputString) {
          let sub = this._ppeForm.get(field.field.name).valueChanges.subscribe((val) => {
            this._isPPEModified = true;
            if (!this._mSPPEOtherCategory.find(p => p.name === field.field.name)) {
              this._mSPPEOtherCategory.push({ name: field.field.name, OtherValue: val });
            } else {
              this._mSPPEOtherCategory.find(p => p.name === field.field.name).OtherValue = val;
            }
            this.onPPEFormSubmitted(null, true);

          });
          this._valueChangesSubscription.push(sub);
        }
      })
      if (!isNullOrUndefined(this._methodstatement.MSPPE)) {
        this._formFields.forEach(field => {
          let otherFiled = this._formFields.find((fw) => fw.field.name === field.field.name + 'Other');
          let group = this._ppeCategoryGroups.find(group => group.Code.toString() === field.field.name)
          if (!isNullOrUndefined(group)) {
            let otherCategory = group.PPECategories.find(category => category.Name.toLowerCase() === 'other');
            let visibilitySubject = (<BehaviorSubject<boolean>>otherFiled.context.getContextData().get('propertyValue'));
            if (this._methodstatement.MSPPE.find(msppe => msppe.PPECategory.Id == otherCategory.Id)) {
              visibilitySubject.next(true);
              this._ppeForm.get(otherFiled.field.name).setValue(this._methodstatement.MSPPE.find(msppe => msppe.PPECategory.Id == otherCategory.Id).PPEOtherCategoryValue)
              this._isPPEModified = false;// Due to above set value form is going to ismodified state which is not expected , It should be false when no changes
            } else {
              visibilitySubject.next(false);
            }
          }
        })
      }
    }
    this._cdRef.markForCheck();
  }

  private _fieldHasRequiredError(fieldName: string): boolean {
    return (!isNullOrUndefined(this._ppeForm) && this._ppeForm.get(fieldName).hasError('required') && (!this._ppeForm.get(fieldName).pristine || this._submitted));
  }

  onPPEFormSubmitted($event, isforFutureUpdate?: boolean) {
    if (this._ppeForm && this._ppeForm.valid && this._isPPEModified === true) {
      this._submitted = true;
      let savePPECategoryData: MSPPE[] = [];
      if (this._ppeForm.valid) {
        let data = this._ppeForm.value;

        this._formFields.forEach(field => {
          let formData = data[field.field.name];
          if (!isNullOrUndefined(formData) && formData != '') {
            if (!isNullOrUndefined(formData[0].Id)) {
              formData[0] = formData[0].Id;
            }
            let group = this._ppeCategoryGroups.find(group => group.Code.toString() === field.field.name);
            if (!isNullOrUndefined(group)) {
              //    let selectedCategories = group.PPECategories.filter(p => formData.includes(p.Id));
              let selectedCategories = [];
              formData.forEach(ele => {
                if (!isNullOrUndefined(ele.Id)) {
                  selectedCategories = selectedCategories.concat(group.PPECategories.filter(p => p.Id === ele.Id));
                }
                else {
                  selectedCategories = selectedCategories.concat(group.PPECategories.filter(p => p.Id === ele));
                }
              });
              selectedCategories.forEach(category => {
                savePPECategoryData.push({
                  Id: '',
                  CompanyId: this._methodstatement.CompanyId,
                  MethodStatementId: this._methodstatement.Id,
                  PPECategory: category,
                  PPECategoryId: category.Id,
                  PPEOtherCategoryValue: category.Name.toLowerCase().includes('other') && !isNullOrUndefined(this._mSPPEOtherCategory.find(p => p.name == (field.field.name + 'Other'))) ? this._mSPPEOtherCategory.find(p => p.name == (field.field.name + 'Other')).OtherValue : null,
                  LogoUrl: "",
                  PPECategoryName: category.Name
                });
              });

            }
          }
        });
        if (!isforFutureUpdate) {
          this.onPPEFormSubmit.emit(savePPECategoryData);
        } else {
          this.onPPEFormChange.emit(savePPECategoryData);
        }
      }
    }
  }

  // End of private methods

}
