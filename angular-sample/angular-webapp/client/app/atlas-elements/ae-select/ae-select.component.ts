import { isObject } from 'rxjs/util/isObject';
import { isNullOrUndefined } from 'util';
import { AeSelectEvent } from '../common/ae-select.event';
import { StringHelper } from '../../shared/helpers/string-helper';
import { BaseElementGeneric } from '../common/base-element-generic';
import { BaseElement } from '../common/base-element';
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { eventNames } from 'cluster';
import { AeSelectItem } from '../common/models/ae-select-item';
import { Subscription } from 'rxjs/Rx';
import { NgControl } from '@angular/forms/src/directives';
import * as Immutable from 'immutable';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
  ValueProvider,
  ViewEncapsulation
} from '@angular/core';


/**
 * Atlas Select Component that represents a select.
 * 
 * @export
 * @class AeSelectComponent
 * @extends {BaseElementGeneric<string>}
 */
@Component({
  selector: 'ae-select',
  templateUrl: './ae-select.component.html',
  styleUrls: ['./ae-select.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AeSelectComponent), multi: true, },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => AeSelectComponent), multi: true }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AeSelectComponent<T> extends BaseElementGeneric<string> implements OnInit, OnDestroy {

  private _placeholder: string = '';
  private _options: Immutable.List<AeSelectItem<T>>;
  private _modelValue: any;
  private _isOptGroup: boolean;
  private _hasError: boolean = false;
  private _valueChangeSubscription: Subscription;
  defaultItem: AeSelectItem<T> = new AeSelectItem('', null, false);
  inputValue: AeSelectItem<T>;
  /**
   * Represents first option's text.
   * 
   * @type string
   * get/set property
   * 
   * @memberOf AeSelectComponent
   */
  @Input()
  get placeholder() {
    return !StringHelper.isNullOrUndefinedOrEmpty(this._placeholder) ? this._placeholder : null;
  }
  set placeholder(value: string) {
    this._placeholder = value;
  }


  /**
   * Whether the element is disabled.
   * 
   * @type boolean
   * get/set property
   * 
   * @memberOf AeSelectComponent
   */
  @Input()
  get disabled() {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value != null && `${value}` !== 'false';
  }


  /**
   * bind select items with provided options.  
   * 
   * @type AeSelectItem<string>[]
   * 
   * @memberOf AeSelectComponent
   */
  @Input()
  get isOptGroup() {
    return this._isOptGroup;
  }
  set isOptGroup(val: boolean) {
    this._isOptGroup = val;
  }

  @Input()
  get options() {
    return this._options && this._options.count() > 0 ? this._options : Immutable.List([]);
  }
  set options(value: Immutable.List<AeSelectItem<T>>) {
    this._options = value;
    this._setInputValue(this.value);
    this.cdr.markForCheck();
  }

  @Input()
  get hasError() {
    return this._hasError;
  }
  set hasError(val: boolean) {
    this._hasError = val;
  }

  @Output()
  aeSelectChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(protected _cdr: ChangeDetectorRef) {
    super(_cdr);
  }

  private _getSelectedValue(val) {
    if (!this.isOptGroup && !isNullOrUndefined(val)) {
      return this.options.filter(c => c.Value == val).first();
    } else {
      let childrens = this.options.reduce((accumulator: Immutable.List<AeSelectItem<string>>, currentValue, currentIndex, array) => {
        return !isNullOrUndefined(currentValue.Childrens) ? accumulator.concat(currentValue.Childrens).toList() : accumulator;
      }, Immutable.List([]));
      return childrens.filter(c => c.Value == val).first();
    }
  }

  hasFormError(): boolean {
    return this.hasError;
  }

  private _setInputValue(val) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(val)) {
      if (isObject(val)) {
        this.inputValue = <any>val;
      }
      else {
        let givenOption = null;
        if (this._isOptGroup) {
          for (let index = 0; index < this.options.count(); index++) {
            let opt = this.options.get(index);
            givenOption = opt.Childrens.find((child) => {
              return child.Value == <any>val;
            });
            if (!isNullOrUndefined(givenOption)) {
              break;
            }
          }
        } else {
          givenOption = this.options.find((opt) => {
            return opt.Value == <any>val;
          });
        }
        if (isNullOrUndefined(givenOption)) {
          if (!this.hasPlaceholderText()) {
            this.inputValue = this.options.get(0);
          }
          else {
            this.inputValue = this.defaultItem;
          }
        }
        else {
          this.inputValue = givenOption;
        }
      }
    }
    else {
      if (!this.hasPlaceholderText()) {
        this.inputValue = this.options.get(0);
      }
      else {
        this.inputValue = this.defaultItem;
      }
    }
  }

  onChange(e) {
    if (!isNullOrUndefined(this.inputValue.Value)) {
      this.value = this.inputValue.Value.toString();
    }
    else {
      this.value = '';
    }

    this._propagateChange(this.value);

    // emitting aeselectevent
    let aeSelectEvent: AeSelectEvent<T> = {
      Event: e,
      SelectedValue: this.value,
      SelectedItem: this.inputValue
    };
    this.aeSelectChange.emit(aeSelectEvent);
  }

  hasPlaceholderText(): boolean {
    return !StringHelper.isNullOrUndefinedOrEmpty(this._placeholder);
  }

  ngOnInit() {
    super.ngOnInit();

    this._valueChangeSubscription = this._controlValueChange.subscribe((val) => {
      if (!isNullOrUndefined(this.options) && this.options.count() > 0) {
        this._setInputValue(val);
      }
    });
  }

  ngOnDestroy(): void {
    if (!isNullOrUndefined(this._valueChangeSubscription)) {
      this._valueChangeSubscription.unsubscribe();
    }
  }
}
