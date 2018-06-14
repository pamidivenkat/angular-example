import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { BaseElementGeneric } from "../common/base-element-generic";
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { LocaleService, TranslationService } from "angular-l10n";
import * as Immutable from 'immutable';
import { AeSelectItem } from '../common/models/ae-select-item';
import { isNullOrUndefined } from "util";
import { StringHelper } from "../../shared/helpers/string-helper";
@Component({
  selector: 'ae-group-checkbox',
  templateUrl: './ae-group-checkbox.component.html',
  styleUrls: ['./ae-group-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AeGroupCheckboxComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeGroupCheckboxComponent extends BaseElementGeneric<string> implements OnInit {
  private _options: Immutable.List<AeSelectItem<string>>;
  private _defaultValue: number;
  constructor(cdr: ChangeDetectorRef, protected _localeService: LocaleService
    , protected _translationService: TranslationService) {
    super(cdr);
  }

  @Input('options')
  get options() {
    return this._options;
  }
  set options(value: Immutable.List<AeSelectItem<string>>) {
    this._options = Immutable.List(value);
  }

  @Output()
  aeChange: EventEmitter<string> = new EventEmitter<string>();

  getSeqId(index: number) {
    return `${this.getChildId('AeCheckbox', index)}_${index}`
  }

  getTranslationText(inputVal) {
    return this._translationService.translate(inputVal)
  }
  valueChanged(value: boolean, index: number) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(this.value)) {
      let selectedItems = this.value.split(',');
      if (!isNullOrUndefined(selectedItems) && selectedItems.length > 0) {
        let optionIndex = selectedItems.findIndex(i => i === index.toString());
        if (optionIndex !== -1) {
          selectedItems.splice(optionIndex, 1);
          this.value = selectedItems.toString();
        }
        else {
          selectedItems.push(index.toString());
          this.value = selectedItems.toString();
        }
      }
    }
    else {
      if (value) {
        this.value = index.toString();
      }
    }
    this._propagateChange(this.value);
    this.aeChange.emit(this.value);
  }

  isChecked(index: number) {
    if (!isNullOrUndefined(this.value)) {
     let selectedItems = this.value.split(',');
      if (!isNullOrUndefined(selectedItems) && selectedItems.length > 0) {
        let optionIndex = selectedItems.findIndex(i => i === index.toString());
        return (optionIndex !== -1);
      }
    }
    return false;
  }
  ngOnInit(): void {
    super.ngOnInit();
  }

}
