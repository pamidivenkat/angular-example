import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { isNullOrUndefined } from 'util';
import { Subscription } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NonWorkingdaysModel } from './../../models/nonworkingdays-model';
import { NonworkingdaysOperationmode } from '../../models/nonworkingdays-operationmode-enum';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { LoadCustomNonWorkingProfileValidationDataAction } from './../../actions/nonworkingdays-actions';
import {  duplicateNameValidator } from './../../common/nonworkingdays-validators';

@Component({
  selector: 'nonworkingdays-copy',
  templateUrl: './nonworkingdays-copy.component.html',
  styleUrls: ['./nonworkingdays-copy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NonworkingdaysCopyComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _sourceNonWorkingdaysModel: NonWorkingdaysModel;
  private _copyNonWorkingdaysModel: NonWorkingdaysModel;
  private _sourceNonWorkingdaysProfileName: string;
  private _operationMode: NonworkingdaysOperationmode;
  private _nonWorkingDayCopyForm: FormGroup;
  private _validationDataSub: Subscription;
  private _validationData: NonWorkingdaysModel[];
  private _duplicateFound:boolean;
  private _isSubmitted: boolean = false;
  // End of Private Fields

  // Public properties

  get lightClass(): AeClassStyle{
    return this._lightClass;
  }

  @Input('sourceNonWorkingdaysModel')
  set SourceNonWorkingdaysModel(val: NonWorkingdaysModel) {
    this._sourceNonWorkingdaysModel = val;
    if (this._sourceNonWorkingdaysModel) {
      //clean the name and description
      this._sourceNonWorkingdaysProfileName = this._sourceNonWorkingdaysModel.Name;
      this._copyNonWorkingdaysModel = Object.assign({}, val);
      this._copyNonWorkingdaysModel.Name = "";
      this._copyNonWorkingdaysModel.Description = "";
    }
  }
  get SourceNonWorkingdaysModel() {
    return this._sourceNonWorkingdaysModel;
  }
  

  @Input('operationMode')
  set OperationMode(val: NonworkingdaysOperationmode) {
    this._operationMode = val;
  }
  get OperationMode() {
    return this._operationMode;
  }  

  get sourceNonWorkingdaysProfileName(){
    return this._sourceNonWorkingdaysProfileName;
  }

  get nonWorkingDayCopyForm(){
    return this._nonWorkingDayCopyForm;
  }

  // End of Public properties

  // Public Output bindings
  @Output()
  aeOnClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  aeOnCopy: EventEmitter<NonWorkingdaysModel> = new EventEmitter<NonWorkingdaysModel>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
  ) {
    super(_localeService, _translationService, _changeDetector);

  }
  // End of constructor

  // Private methods
  slideClose($event) {
    this.aeOnClose.emit(true);
  }
  onAddOrUpdateFormSubmit($event) {
    //first check for duplicates 
    this._isSubmitted = true;
    this._duplicateFound = duplicateNameValidator(this._nonWorkingDayCopyForm.controls['Name'].value,this._validationData);
     
    if (this._nonWorkingDayCopyForm.valid && !this._duplicateFound) {
      this._sourceNonWorkingdaysModel = Object.assign(this._sourceNonWorkingdaysModel, this._nonWorkingDayCopyForm.value);
      this.aeOnCopy.emit(this._sourceNonWorkingdaysModel);
    }
  }

  private _initForm(model: NonWorkingdaysModel) {
    this._nonWorkingDayCopyForm = this._fb.group({
      Name: [{ value: model.Name, disabled: false }, Validators.required],
      Description: [{ value: model.Description, disabled: false }]
    }
    );
  }
  fieldHasRequiredError(fieldName: string): boolean {
    return this._nonWorkingDayCopyForm.get(fieldName).hasError('required') && (!this._nonWorkingDayCopyForm.get(fieldName).pristine || this._isSubmitted);
  }

  isFieldValid(fieldName: string): boolean {
    return this._nonWorkingDayCopyForm.get(fieldName).valid;
  }
  isGivenNameAlreadyExists(): boolean {
    return this._duplicateFound;
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    // if validation data is not loaded then despatch action to load,, only not loaded   
    this._validationDataSub = this._store.let(fromRoot.getCustonNonWorkingDaysValidationData).subscribe((validationData) => {
      this._validationData = validationData;
      this._initForm(this._copyNonWorkingdaysModel);
      if (isNullOrUndefined(validationData)) {
        //here despatch action to load the validation data
        this._store.dispatch(new LoadCustomNonWorkingProfileValidationDataAction());
      }
    });
  }

  ngOnDestroy() {
    if (this._validationDataSub)
      this._validationDataSub.unsubscribe();
  }
  // End of public methods

}
