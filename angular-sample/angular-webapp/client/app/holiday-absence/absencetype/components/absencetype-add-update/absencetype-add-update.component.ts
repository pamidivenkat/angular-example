import { MessageType } from '../../../../atlas-elements/common/ae-message.enum';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { AeIconSize } from '../../../../atlas-elements/common/ae-icon-size.enum';
import { AbsencetypeService } from './../../services/absencetype.service';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { EventEmitter, ViewEncapsulation } from '@angular/core';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Input, Output } from '@angular/core';
import { LocaleService, Localization, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers/index';
import { BaseComponent } from './../../../../shared/base-component';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AbsenceType, AbsenceSubType } from './../../../../shared/models/company.models';
import { AbsenceCode } from './../../../../shared/models/lookup.models';
import * as Immutable from 'immutable';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { isNullOrUndefined } from 'util';
import { mapAbsenceCodeToAeSelectItems } from "./../../../common/extract-helpers";

@Component({
  selector: 'absencetype-add-update',
  templateUrl: './absencetype-add-update.component.html',
  styleUrls: ['./absencetype-add-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AbsencetypeAddUpdateComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _action: string;
  private _headerTitle: string;
  private _absenceCodeList: AbsenceCode[];
  private _absenceCodes: Immutable.List<AeSelectItem<string>> = Immutable.List([]);
  private _absenceTypeDetails: AbsenceType;
  private _typeOfAbsencetypeForm: string;
  private _absenceTypeAddUpdateForm: FormGroup;
  private _absenceSubTypeForm: FormGroup;
  private _submitted: boolean = false;
  private _absenceSubTypeFormsubmitted: boolean = false;
  private _duplicateSubType: boolean = false;
  private _absenceSubType: AbsenceSubType[] = [];
  private _validateTypeNameSubscription: Subscription;
  private _errorAbsenceTypeMessage: string;
  private _customValid: boolean = false;
  private _aceesLevel: boolean = false;
  private _lightClass: AeClassStyle = AeClassStyle.Light;

  iconOneSize: AeIconSize = AeIconSize.big;
  iconSmall: AeIconSize = AeIconSize.small;
  iconMedium: AeIconSize = AeIconSize.medium;
  // End of Private Fields

  // Public properties
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ViewContent bindings
  // End of Public ViewContent bidnings

  //Input Bindings
  @Input('absenceCodes')
  set AbsenceCodes(val: AbsenceCode[]) {
    this._absenceCodeList = val;
    if (!isNullOrUndefined(val)) {
      this._absenceCodes = mapAbsenceCodeToAeSelectItems(val);
    }
  }
  get AbsenceCodes() {
    return this._absenceCodeList;
  }
  

  @Input('data')
  set data(val: AbsenceType) {
    this._absenceTypeDetails = val;
  }
  get data() {
    return this._absenceTypeDetails;
  }
 

  @Input('typeOfAbsencetypeForm')
  get typeOfAbsencetypeForm() {
    return this._typeOfAbsencetypeForm;
  }
  set typeOfAbsencetypeForm(val: string) {
    this._typeOfAbsencetypeForm = val;
  }

  get absenceTypeAddUpdateForm() {
    return this._absenceTypeAddUpdateForm;
  }
  get errorAbsenceTypeMessage() {
    return this._errorAbsenceTypeMessage;
  }
  get messagetType() {
    return MessageType.Error;
  }
  get absenceCodes() {
    return this._absenceCodes;
  }
  get aceesLevel() {
    return this._aceesLevel;
  }
  get absenceSubType() {
    return this._absenceSubType;
  }
  get absenceSubTypeFormsubmitted() {
    return this._absenceSubTypeFormsubmitted;
  }
  get lightClass(){
    return this._lightClass;
  }
  //End of Input Bindings

  // Output properties declarations
  @Output('onCancel')
  _onCancel: EventEmitter<string> = new EventEmitter<string>();
  @Output('onAdd')
  _onAdd: EventEmitter<AbsenceType> = new EventEmitter<AbsenceType>();
  @Output('onUpdate')
  _onUpdate: EventEmitter<AbsenceType> = new EventEmitter<AbsenceType>();

  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilder
    , private _absencetypeService: AbsencetypeService
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Public methods
  ngOnInit() {
    this._initForm();
    this.initAbsenceSubType();
    if (this._claimsHelper.isAdministrator() && this.typeOfAbsencetypeForm === 'add') {
      this._aceesLevel = true;
    }
  }

  ngOnDestroy() {

  }
  // End of public methods

  // Private methods
  private _initForm() {
    this._absenceSubType = this._absenceTypeDetails.AbsenceSubType;
    this._absenceTypeAddUpdateForm = this._fb.group({
      TypeName: [{ value: this._absenceTypeDetails.TypeName, disabled: false }, [Validators.required]],
      AbsenceCodeId: [{ value: this._absenceTypeDetails.AbsenceCodeId, disabled: false }, [Validators.required]],
      AbsenceSubType: [{ value: this._absenceSubType, disabled: false }],
      IsExample: [{ value: this._absenceTypeDetails.IsExample, disabled: false }],
      Id: [{ value: this._absenceTypeDetails.Id, disabled: false }],
      subName: [{ value: '', disabled: false }],
    });
  }

  private initAbsenceSubType() {
    this._absenceSubTypeForm = this._fb.group({
      Name: [{ value: '', disabled: false }, [Validators.required]],
    });
  }

  /** Showing Custom Error **/

  /** Know the Operation Type **/


  /** Adsencetype Cancel Button Clicked **/

  /** Subtypes Submit Button Clicked**/

  /** Subtypes Delete Button Clicked**/


  /** AbsenceType Submit Button Clicked**/
  
  // End of Private methods
  //public methods
  public onAddOrUpdateFormSubmit(e) {
    this._submitted = true;
    this._customValid = false;
    this._validateTypeNameSubscription = this._store.let(fromRoot.getAbsenceTypesData).subscribe(result => {
      if (!isNullOrUndefined(result) && result.length > 0) {
        for (var i = 0; i < result.length; i++) {
          if (this._typeOfAbsencetypeForm == 'update') {
            if (result[i].TypeName === this._absenceTypeAddUpdateForm.value.TypeName && result[i].CompanyId === this._claimsHelper.getCompanyIdOrCid().toLowerCase() && result[i].Id != this._absenceTypeAddUpdateForm.value.Id) {
              this._customValid = true;
            }
          } else {
            if (result[i].TypeName === this._absenceTypeAddUpdateForm.value.TypeName && result[i].CompanyId === this._claimsHelper.getCompanyIdOrCid().toLowerCase()) {
              this._customValid = true;
            }

          }

        }

        if (this._customValid) {
          this._absenceTypeAddUpdateForm.reset();
          this._submitted = false;
          this._errorAbsenceTypeMessage = null;
          this._errorAbsenceTypeMessage = 'ABSENCETYPE.ABSENCE_TYPENAME_ERROR';
          this._cdRef.markForCheck();
        } else {
          if (this._absenceTypeAddUpdateForm.valid && !this._customValid) {
            if (this._typeOfAbsencetypeForm == 'update') {
              this._absenceTypeDetails.AbsenceCode = null;
            }
            let _detailsToSave: AbsenceType = Object.assign({}, this._absenceTypeDetails, <AbsenceType>this._absenceTypeAddUpdateForm.value);
            if (!StringHelper.isNullOrUndefinedOrEmpty(_detailsToSave.Id)) {
              this._onUpdate.emit(_detailsToSave);
            }
            else {
              this._onAdd.emit(_detailsToSave);
            }

          }
        }

      }
    });

  }

  public onAddOrUpdateAbsenceTypeCancel(e) {
    this._onCancel.emit('add');
  }

  public onSubtypeSubmit(e) {
    this._absenceSubTypeFormsubmitted = false;
    this._duplicateSubType = false;
    if (this._absenceTypeAddUpdateForm.get('subName').value === '') {
      this._absenceSubTypeFormsubmitted = true;
    } else {
      let subTypeArray = this._absenceSubType;
      let enterSubType = { 'Id': '', 'Name': this._absenceTypeAddUpdateForm.get('subName').value, 'CompanyId': '' };;
      for (let i = 0; i < subTypeArray.length; i++) {
        if (subTypeArray[i].Name == enterSubType.Name) {
          this._duplicateSubType = true;
        }
      }
      if (this._duplicateSubType) {
        this._errorAbsenceTypeMessage = null;
        this._errorAbsenceTypeMessage = 'ABSENCETYPE.ABSENCE_SUBTYPE_ERROR';
        this._absenceSubTypeFormsubmitted = false;
        this._absenceTypeAddUpdateForm.get('subName').setValue("");
      } else {
        this._absenceSubType.push(enterSubType);
        this._errorAbsenceTypeMessage = null;
        this._absenceSubTypeFormsubmitted = false;
        this._absenceTypeAddUpdateForm.get('subName').setValue("");
      }
    }
  }


  public deleteSubType(ele) {
    this._absenceSubType.splice(ele, 1);
  }

  public fieldHasRequiredError(fieldName: string): boolean {
    return (this._absenceTypeAddUpdateForm.get(fieldName).hasError('required') && (!this._absenceTypeAddUpdateForm.get(fieldName).pristine || this._submitted));
  }


  public showMessage(): boolean {
    return !isNullOrUndefined(this._errorAbsenceTypeMessage);
  }


  public hideMessage() {
    this._errorAbsenceTypeMessage = null;
  }


  public isUpdateMode() {
    return this.typeOfAbsencetypeForm == "update";
  }
  //end of public methods
}
