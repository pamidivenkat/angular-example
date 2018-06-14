import { UnExpectedAnswerEnum } from '../../common/unexpected-answer.enum';
import { getAeSelectItemsFromEnum } from '../../../employee/common/extract-helpers';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { CheckItem } from '../../models/checkitem.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { AeDataActionTypes } from '../../../employee/models/action-types.enum';
import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import * as Immutable from 'immutable';

@Component({
  selector: 'checkitems-add-update',
  templateUrl: './checkitems-add-update.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CheckitemsAddUpdateComponent extends BaseComponent implements OnInit {
  private _action: string;
  private _checkItemData: CheckItem
  private _updateCheckItemsForm: FormGroup;
  private _submitButtonText: string;
  private _isFormSubmitted: boolean;
  private _answerTypes: Immutable.List<AeSelectItem<number>>;
  private _lightClass: AeClassStyle = AeClassStyle.Light;

  @Input('checkItem')
  get checkItem() {
    return this._checkItemData;
  }
  set checkItem(val: CheckItem) {
    this._checkItemData = val;
  }

  @Input('action')
  get action() {
    return this._action;
  }
  set action(val: string) {
    this._action = val;
  }

  @Output('slideOutClose')
  private _slideOutClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output('checkItemFormSubmit')
  private _checkItemFormSubmit: EventEmitter<CheckItem> = new EventEmitter<CheckItem>();

  get updateCheckItemsForm() {
    return this._updateCheckItemsForm;
  }

  get answerTypes() {
    return this._answerTypes;
  }

  get lightClass() {
    return this._lightClass;
  }


  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder) {
    super(_localeService, _translationService, _cdRef)
  }

  ngOnInit() {
    this._answerTypes = getAeSelectItemsFromEnum(UnExpectedAnswerEnum)
    if (this._action == AeDataActionTypes.Add) {
      this._initAddForm();
      this._submitButtonText = 'Add';
    } else if (this._action == AeDataActionTypes.Update) {
      this._initUpdateForm();
      this._submitButtonText = 'Update';
    }
  }

  private _initUpdateForm() {
    this._updateCheckItemsForm = this._fb.group({
      ItemText: [{ value: this._checkItemData.ItemText ? this._checkItemData.ItemText : null, disabled: false }, Validators.required],
      UnExpectedAnswer: [{ value: (this._checkItemData.UnExpectedAnswer == 0 || this._checkItemData.UnExpectedAnswer == 1) ? this._checkItemData.UnExpectedAnswer : null, disabled: false }, Validators.required],
      CorrectiveActionText: [{ value: this._checkItemData.CorrectiveActionText ? this._checkItemData.CorrectiveActionText : null, disabled: false }, Validators.required],
    });
  }

  private _initAddForm() {
    this._updateCheckItemsForm = this._fb.group({
      ItemText: [{ value: null, disabled: false }, Validators.required],
      UnExpectedAnswer: [{ value: null, disabled: false }, Validators.required],
      CorrectiveActionText: [{ value: null, disabled: false }, Validators.required]
    });
  }

  fieldHasRequiredError(fieldName: string): boolean {
    if (this._updateCheckItemsForm.get(fieldName).hasError('required') && (!this._updateCheckItemsForm.get(fieldName).pristine || this._isFormSubmitted)) {
      return true;
    }
    return false;
  }

  onUpdateFormSubmit(e) {
    this._isFormSubmitted = true;
    if (this._updateCheckItemsForm.valid) {
      let _checkItemDetails: CheckItem = Object.assign({}, this._checkItemData, <CheckItem>this._updateCheckItemsForm.value);
      this._checkItemFormSubmit.emit(_checkItemDetails);
    }
  }

  onUpdateFormClosed(e) {
    this._slideOutClose.emit(false);
  }

  isAddForm() {
    return this._action == AeDataActionTypes.Add;
  }

  isUpdateForm() {
    return this._action == AeDataActionTypes.Update;
  }

}
