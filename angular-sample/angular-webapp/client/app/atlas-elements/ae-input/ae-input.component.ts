import { Subscription } from 'rxjs';
import { AtlasError } from '../../shared/error-handling/atlas-error';
import { StringHelper } from '../../shared/helpers/string-helper';
import { AeInputType } from '../common/ae-input-type.enum';

import { ControlValueAccessor } from '@angular/forms/src/directives';
import { BaseElement } from '../common/base-element';
import { BaseElementGeneric } from '../common/base-element-generic';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnInit,
  Output,
  Renderer,
  ViewChild,
  ViewEncapsulation,
  OnDestroy
} from '@angular/core';
import { isNullOrUndefined } from 'util';
/**
 * Atlas Input Component that represents a text input. Supports all of the functionality of an HTML5 input with type
 * [text,email,password,number,hidden,url,tel,search] and exposes a similar API.
 * 
 * @export
 * @class AeInputComponent
 * @extends {BaseElementGeneric<string>}
 */
@Component({
  selector: 'ae-input',
  templateUrl: './ae-input.component.html',
  styleUrls: ['./ae-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AeInputComponent),
      multi: true,
    }
  ],
  host: {
    '[class.ae-input-wrapper]': 'true'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AeInputComponent<T> extends BaseElementGeneric<T> implements OnInit, OnDestroy {
  private _type: AeInputType = AeInputType.text;
  private _placeholder: string = "Type here";
  private _readOnly: boolean = false;
  private _step: number = 1;
  private _min: number = -9999;
  private _max: number = 9999;
  private _autocomplete: string = 'off';
  private _timeout: any;
  private _delay: number = 500;
  private _hasError: boolean = false;
  private _maxlength: number;
  private _minlength: number;
  private _size: number;
  private _cssClass: string;
  private _showRemainingCount: boolean;
  private _remainingCharaterCount: number;
  private _controlValueChangeSub: Subscription;
  private _allowPropagateChange: boolean = true;
  public isFocused: boolean = false;

  @ViewChild('inputRef') inputRef: ElementRef;

  constructor( @Inject(ElementRef) public _elementRef: ElementRef,
    public _renderer: Renderer, protected cdr: ChangeDetectorRef) { super(cdr); }


  /**
   * Input type of the element. ex. type="number" etc.
   * 
   * get/setter property
   * 
   * @memberOf AeInputComponent
   */
  @Input('type')
  get type() {
    return this._type;
  }

  set type(val: AeInputType) {
    if (!AeInputType[val]) {
      throw new AtlasError("Invalid type attribute");
    }
    this._type = val;
  }

  get controlType() {
    return AeInputType[this._type] || null;
  }

  @Input()
  get hasError() {
    return this._hasError;
  }
  set hasError(val: boolean) {
    this._hasError = val;
  }

  /**
   * Placeholder attribute of the element.
   * 
   * get/setter property
   * 
   * @memberOf AeInputComponent
   */
  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
  }


  /**
   * Whether the element is disabled.
   * 
   * get/setter property
   * 
   * @memberOf AeInputComponent
   */
  // @Input()
  // get disabled() {
  //   return this._disabled;
  // }
  // set disabled(value: boolean) {
  //   this._disabled = value != null && `${value}` !== 'false';
  // }


  /**
   * Whether the element is readonly.
   * 
   * get/setter property
   * 
   * @memberOf AeInputComponent
   */
  @Input('readonly')
  get readOnly() {
    return this._readOnly || null;
  }
  set readOnly(value: boolean) {
    this._readOnly = StringHelper.coerceBooleanProperty(value);
  }


  /**
   * step attribute of the element.
   * 
   * get/setter property
   * 
   * @memberOf AeInputComponent
   */
  @Input('step')
  get step() {
    return this.isNumber ? this._step : null;
  }
  set step(value: any) {
    this._step = value;
  }

  /**
   * min attribute of the element.
   * 
   * get/setter property
   * 
   * @memberOf AeInputComponent
   */
  @Input('min')
  get min() {
    return this.isNumber ? this._min : null;
  }
  set min(value: any) {
    this._min = value;
  }

  /**
   * max attribute of the element.
   * 
   * get/setter property
   * 
   * @memberOf AeInputComponent
   */
  @Input('max')
  get max() {
    return this.isNumber ? this._max : null;
  }
  set max(value: any) {
    this._max = value;
  }

  /**
   * To turn on/off the autocomplete attribute of element.
   * 
   * get/setter property
   * 
   * @memberOf AeInputComponent
   */
  @Input()
  get autocomplete() {
    return this._autocomplete;
  }
  set autocomplete(value: any) {
    this._autocomplete = value || 'off';
  }

  /**
   * To apply debounce time 
   * 
   * @type number
   * get/set property
   * 
   * @memberOf AeInputComponent
   */
  @Input()
  get delay() {
    return this._delay;
  }
  set delay(val: number) {
    this._delay = val;
  }

  @Input()
  get cssClass() {
    return !StringHelper.isNullOrUndefinedOrEmpty(this._cssClass) ? this._cssClass : null;
  }
  set cssClass(val: string) {
    this._cssClass = val;
  }

  @Input()
  get size() {
    return this._size;
  }
  set size(val: number) {
    this._size = val;
  }

  @Input('maxlength')
  get maxlength() {
    return this._maxlength;
  }
  set maxlength(val: number) {
    this._maxlength = val;
  }

  @Input('minlength')
  get minlength() {
    return this._minlength;
  }
  set minlength(val: number) {
    this._minlength = val;
  }

  @Input('showRemainingCharacterCount')
  //private _bar:boolean = false;
  get ShowRemainingCharacterCount(): boolean {
    return this._showRemainingCount;
  }
  set ShowRemainingCharacterCount(val: boolean) {
    this._showRemainingCount = val;
  }

  @Input('allowPropagateChange')
  get allowPropagateChange(): boolean {
    return this._allowPropagateChange;
  }

  set allowPropagateChange(val: boolean) {
    this._allowPropagateChange = val;
  }

  //receivedBool: boolean = false;

  /**
   * Informs the component when the input has focus so that we can style accordingly
   * 
   * @type {EventEmitter<any>}
   * @memberOf AeInputComponent
   */
  @Output('aeFocus') aeFocusEvent: EventEmitter<any> = new EventEmitter<any>();

  onFocus(e) {
    this.isFocused = true;
    this._setCharactersRemaining(<string>e.target.value)   
    this.aeFocusEvent.emit({ event: e });
  }


  /**
   * Informs the component when we lose focus in order to style accordingly.
   * 
   * @type {EventEmitter<any>}
   * @memberOf AeInputComponent
   */
  @Output('aeBlur') aeBlurEvent: EventEmitter<any> = new EventEmitter<any>();

  onBlur(e) {
    this.isFocused = false;
    this.aeBlurEvent.emit({ event: e });
  }

  /**
  * Event emitted when keydown event occurred in input. 
  * 
  * @type {EventEmitter<any>}
  * @memberOf AeInputComponent
  */
  @Output('aeKeydown') aeKeydownEvent: EventEmitter<any> = new EventEmitter<any>();
  onKeyDown(event) {
    this.aeKeydownEvent.emit(event);
  }


  /**
   * Event emitted when the input's `value` value changes. 
   * 
   * @type {EventEmitter<any>}
   * @memberOf AeInputComponent
   */
  @Output('aeChange') aeChangeEvent: EventEmitter<any> = new EventEmitter<any>();

  onKeyUp(event) {
    this._setCharactersRemaining(<string>event.target.value)
  }

  onPaste(event) {
    let content = event.clipboardData.getData('text/plain');
    //this._stripContentIfNeeded();
  }

  getMaxLength(): number {
    if (this._maxlength && this._maxlength > 0) return this._maxlength;
    return 524288;// alarge number 
  }
  getMinLength(): number {
    if (this._minlength && this._minlength > 0) return this._minlength;
    return 0;
  }
  private _setCharactersRemaining(typedString: string) {
    if (this.needToShowRemainingCharacterCount()) {
      let typedCount: number = StringHelper.isNullOrUndefined((typedString)) ? 0 : (typedString).length
      this._remainingCharaterCount = this._maxlength - typedCount;
    }
  }
  // View Child Properties
  @ViewChild('inputField')
  inputHtmlElement: ElementRef;
  // End of View Child Properies

  public setfoucs() {
    this.inputHtmlElement.nativeElement.focus();
  }

  hasFormError(): boolean {
    return this.hasError;
  }


  onChangeEvent(e) {
    if (this._allowPropagateChange) {
      super._onChange(e);
    }
  }

  onInput(e) {
    super._onChange(e);
    if (this.isSeachInput) {
      //Cancel the search request if user types within the timeout
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      this._timeout = setTimeout(() => {
        this.aeChangeEvent.emit({ event: e });
      }, this.delay);
    } else {
      this.aeChangeEvent.emit({ event: e });
    }
  }

  /**
 * Event emitted when keydown event occurred in input. 
 * 
 * @type {EventEmitter<any>}
 * @memberOf AeInputComponent
 */
  /* @Output('aeKeydown') aeKeydownEvent: EventEmitter<any> = new EventEmitter<any>();
 
   _onKeydown(e) {
     this.aeKeydownEvent.emit({ event: e });
   }*/


  /**
   * Whether the input is of type "number".
   * 
   * @readonly
   * 
   * @memberOf AeInputComponent
   */
  get isNumber() {
    return this.type == AeInputType.number;
  }


  /**
   * Whether the input is of type "search".  
   * 
   * @readonly
   * 
   * @memberOf AeInputComponent
   */
  get isSeachInput() {
    return this.type == AeInputType.search;
  }

  setFocus() {
    (<HTMLInputElement>this.inputRef.nativeElement).dispatchEvent(new Event('focus', { bubbles: true, cancelable: false }));
  }

  needToShowRemainingCharacterCount(): boolean {
    return this._showRemainingCount && this._maxlength >= 0 && this.isFocused;
  }

  getRemainingCharaterCount(): number {
    if (isNullOrUndefined(this._remainingCharaterCount)) {
      return this._maxlength;
    } else {
      return this._remainingCharaterCount;
    }

  }

  ngOnInit(): void {
    super.ngOnInit();
    this._controlValueChangeSub = this._controlValueChange.subscribe(() => {
      if (this._type == AeInputType.text && this.value)
        this._setCharactersRemaining(this.value.toString());
      //fix to update the value in UI to empty when value is empty
      if (this._type == AeInputType.text) {
        let value = this.value ? this.value.toString() : '';
        if (StringHelper.isNullOrUndefinedOrEmpty(value))
          this.inputHtmlElement.nativeElement.value = null;
      }
    });
  }
  ngOnDestroy(): void {
    if (this._controlValueChangeSub) {
      this._controlValueChangeSub.unsubscribe();
    }
  }
}
