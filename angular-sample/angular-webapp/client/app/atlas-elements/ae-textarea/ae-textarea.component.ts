import { StringHelper } from '../../shared/helpers/string-helper';
import { BaseElementGeneric } from '../common/base-element-generic';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  OnDestroy
} from '@angular/core';
import { AeTextareaResize } from '../common/ae-textarea-resize.enum';
import { Subscription } from "rxjs/Rx";
import { isNullOrUndefined } from "util";


/**
 * Atlas Textarea Component that represents a textarea. Supports all of the functionality of an HTML5 Textarea.
 * We can disable or make readonly the textarea. We can control the textarea's resize handle. 
 * 
 * @export
 * @class AeTextareaComponent
 * @extends {BaseElementGeneric<string>}
 */
@Component({
  selector: 'ae-textarea',
  templateUrl: './ae-textarea.component.html',
  styleUrls: ['./ae-textarea.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AeTextareaComponent), multi: true, },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => AeTextareaComponent), multi: true }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeTextareaComponent extends BaseElementGeneric<string> implements OnInit, OnDestroy {
  private _rows: number = 2;
  private _cols: number = 20;
  private _readOnly: boolean = false;
  private _placeholder: string = "Type here";
  private _maxlength: number;
  private _allowResize: AeTextareaResize = AeTextareaResize.Both;
  private _showCharLeft: boolean = true;
  private _showOnFocus: boolean = true;
  private _controlValueChangeSub: Subscription;
  private _previousValue: string;
  public isFocused: boolean = false;
  public charLeftMessage: string = "";


  /**
   * Represents rows attribute of element.
   * The number of visible text lines for the control.
   * 
   * get/set property
   * @type number
   * 
   * @memberOf AeTextareaComponent
   */
  @Input()
  get rows() { return this._rows; }
  set rows(value: number) { this._rows = StringHelper.coerceNumberProperty(value, 2); }



  /**
   * Represents cols attribute of element
   * The visible width of the text control, in average character widths.
   * 
   * get/set property
   * @type number
   * 
   * @memberOf AeTextareaComponent
   */
  @Input()
  get cols() { return this._cols; }
  set cols(value: number) { this._cols = StringHelper.coerceNumberProperty(value, 20); }


  /**
   * Represents placeholder attribute of element.
   * A hint to the user of what can be entered in the control.
   * 
   * get/set property
   * @type string
   * 
   * @memberOf AeTextareaComponent
   */
  @Input()
  get placeholder() { return this._placeholder; }
  set placeholder(value: string) { this._placeholder = value; }


  /**
   * Whether the element is readonly.
   * 
   *  get/set property
   *  @type string
   * 
   * @memberOf AeTextareaComponent
   */
  @Input()
  get readOnly() { return this._readOnly || null; }
  set readOnly(value: boolean) {
    this._readOnly = StringHelper.coerceBooleanProperty(value);
  }


  /**
   * Represnts maxlength attribute of element. 
   * The maximum number of characters (Unicode code points) that the user can enter.
   * 
   *  get/set property
   * @type string
   * 
   * @memberOf AeTextareaComponent
   */
  @Input()
  get maxlength() { return this._maxlength && this._maxlength > 0 ? this._maxlength : null; }
  set maxlength(value: number) {
    this._maxlength = StringHelper.coerceNumberProperty(value);
  }


  /**
   * To explicitly disable the resizing of textarea element.
   * 
   * get/set property
   * @type boolean
   * 
   * @memberOf AeTextareaComponent
   */
  @Input('resize')
  get allowResize() { return this._allowResize; }
  set allowResize(value: AeTextareaResize) { this._allowResize = value; }

  get resizeStyle() {
    return AeTextareaResize[this._allowResize] || null;
  }


  /**
   * Whether to show no. of characters left message, it will be based maxlength attribute.
   * 
   * get/set property
   * @type boolean
   * 
   * @memberOf AeTextareaComponent
   */
  @Input('showcharleft')
  get showCharLeft() {
    return this._showCharLeft;
  }
  set showCharLeft(value: boolean) {
    this._showCharLeft = StringHelper.coerceBooleanProperty(value);
  }


  @Input('showOnFocus')
  get showOnFocus() {
    return this._showOnFocus;
  }
  set showOnFocus(value: boolean) {
    this._showOnFocus = value;
  }

  /**
   * Whether element has maxlength attribute value.
   * 
   * get property
   * @type boolean
   * 
   * @memberOf AeTextareaComponent
   */
  get hasMaxlength() {
    return this._maxlength && this._maxlength > 0;
  }


  /**
   * Informs the component when the input has focus so that we can style accordingly
   * 
   * @type {EventEmitter<any>}
   * @memberOf AeTextareaComponent
   */
  @Output('aeFocus') focusEvent: EventEmitter<any> = new EventEmitter<any>();

  onFocus(e) {
    this.isFocused = true;

    if (this.showCharLeft && this.hasMaxlength) {
      this.charLeftMessage = `${this._maxlength - e.target.value.length} character(s) remaining`;
    }

    this.focusEvent.emit({ event: e });
  }


  /**
   * Informs the component when we lose focus in order to style accordingly.
   * 
   * @type {EventEmitter<any>}
   * @memberOf AeTextareaComponent
   */
  @Output('aeBlur') blurEvent: EventEmitter<any> = new EventEmitter<any>();

  onBlur(e) {
    this.isFocused = false;
    this.blurEvent.emit({ event: e });
  }

  @Output('aeChange') changeEvent: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Event emitted when the textarea's `value` value changes. 
   * 
   * @param {any} e 
   * 
   * @memberOf AeTextareaComponent
   */
  onInput(e) {
    //This event is getting fired for placeholder for IE browser,
    //because of this form field is getting pristine true and firing validation
    if (e.target.value != this._previousValue) {
      this._previousValue = e.target.value;
      super._onChange(e);
      this.charLeftMessage = `${this.maxlength - e.target.value.length} character(s) remaining`;
      this.changeEvent.emit({ event: e });
    } else {
      // This is to prevent IE from setting pristine to false when placeholder is set to text area.
      e.preventDefault();
    }

  }
  getValue() {
    if (!isNullOrUndefined(this.value))
      return this.value;
    return '';
  }
  canShowCharactersRemaining() {
    return this._showCharLeft && this.hasMaxlength &&
      ((this.showOnFocus && this.isFocused) || !this.showOnFocus);
  }

  constructor(protected cdr: ChangeDetectorRef) {
    super(cdr);
  }

  ngOnInit() {
    this._previousValue = this.value || "";
    super.ngOnInit();
    if (this.canShowCharactersRemaining()) {
      this.charLeftMessage = `${this._maxlength} character(s) remaining`;
    }

    this._controlValueChangeSub = this._controlValueChange.subscribe((val) => {
      if (this.canShowCharactersRemaining()) {
        let length = 0;
        if (!StringHelper.isNullOrUndefinedOrEmpty(val)) {
          length = val.length;
        }
        this.charLeftMessage = `${this.maxlength - length} character(s) remaining`;
      }
    });
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._controlValueChangeSub)) {
      this._controlValueChangeSub.unsubscribe();
    }
  }
}
