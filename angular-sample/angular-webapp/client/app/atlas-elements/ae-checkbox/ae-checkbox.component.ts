import { AeIconSize } from '../common/ae-icon-size.enum';
import { BaseElementGeneric } from '../common/base-element-generic';
import { NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnInit,
  Output,
  EventEmitter
} from '@angular/core';
import { StringHelper } from '../../shared/helpers/string-helper';

/**
 * Checkbox component with optional icon
 * @export
 * @class AeCheckboxComponent
 * @extends {BaseElementGeneric<boolean>}
 * @implements {OnInit}
 */
@Component({
  selector: 'ae-checkbox',
  templateUrl: './ae-checkbox.component.html',
  styleUrls: ['./ae-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AeCheckboxComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeCheckboxComponent extends BaseElementGeneric<boolean> implements OnInit {

  // Private Fields

  // Private Fields
  /**
   * Member to specify the icon size
   * @private
   * @type {AeIconSize}
   * @memberOf AeCheckboxComponent
   */
  private _iconSize: AeIconSize = AeIconSize.none;
  /**
   * Member to specify the icon name
   * @private
   * @type {string}
   * @memberOf AeCheckboxComponent
   */
  private _iconName: string;

  /**
   * Member to specify the icon color
   * @private
   * @type {string}
   * @memberOf AeCheckboxComponent
   */
  private _color: string;

  /**
   * Member to specify either to enable/disable checkbox
   * default value is false
   * returns true or false
   * @type {boolean}
   * @memberOf AeCheckboxComponent
   */
  _disabled: boolean = false;

  /**
   * Member to specify the checkbox label textVisible
   * @type {string}
   * @memberOf AeCheckboxComponent
   */
  private _textVisible: boolean = true;
  private _iconVisible: boolean = false;
  private _isChecked: boolean = false;
  private _imgVisible: boolean = false;
  private _imgSrc: string;
  private _title: string = '';
  // End of Private Fields

  // Public properties
  // Public properties
  /**
  *Member to hold value for display text for checkbox
  * default value is 'Checkbox Text'
  * @type {string}
  * @memberOf AeCheckboxComponent
  */
  @Input('checkText')
  checkboxText: string = "Checkbox Text";
  get checkboxValue() {
    return this.checkboxText;
  }
  set checkboxValue(val: string) {
    this.checkboxText = val;
  }


  /**
   * Disabled attr for checkbox
   * Default value is false
   * @type {boolean}
   * @memberOf AeCheckboxComponent
   */
  @Input('disabled')
  get disabled() {
    return this._disabled;
  }
  set disabled(val: boolean) {
    this._disabled = val;
  }

  // Public properties
  /**
   * Member to specify for attribute to label
   * 
   * @readonly
   * 
   * @memberOf AeCheckboxComponent
   */
  @Input('for')

  /**
   * Member to specify for attribute to label
   * 
   * @readonly
   * 
   * @memberOf AeCheckboxComponent
   */
  @Input('for')

  get for() {
    return this.id;
  }

  /**
   *Member to specify whether to show/hide icon for checkbox
   * default value is false
   * @type {boolean}
   * @memberOf AeCheckboxComponent
   */
  @Input('iconVisible')
  get iconVisible() {
    return this._iconVisible;
  }
  set iconVisible(val: boolean) {
    this._iconVisible = val;
  }

  /**
   * Member to specify whether to show/hide label text
   * default value is true
   * @type {boolean}
   * @memberOf AeCheckboxComponent
   */
  @Input('imgVisible')
  get imgVisible() {
    return this._imgVisible;
  }
  set imgVisible(val: boolean) {
    this._imgVisible = val;
  }


  /**
   * Member to specify whether to show/hide image
   * default value is true
   * @type {boolean}
   * @memberOf AeCheckboxComponent
   */
  @Input('textVisible')
  get textVisible() {
    return this._textVisible;
  }
  set textVisible(val: boolean) {
    this._textVisible = val;
  }

  /**
   *Member to add url for image
   * 
   * @type {string}
   * @memberOf AeCheckboxComponent
   */
  @Input('src')
  get imgSrc() {
    return this._imgSrc;
  }
  set imgSrc(val: string) {
    this._imgSrc = val;
  }


  /**
   * Member to specify icon name
   * @readonly
   * @memberOf AeCheckboxComponent
   */
  @Input('icon')
  get iconName() {
    return `#${this._iconName}`;
  }
  set iconName(value: string) {
    this._iconName = value;
  }

  /**
   * Member to specify icon size eg:'small,medium,big'
   * @readonly
   *
   * @memberOf AeCheckboxComponent
   */
  @Input('size')
  get iconSize() {
    return this._iconSize;
  }
  set iconSize(value: AeIconSize) {
    this._iconSize = value;
  }

  /**
   * Member to specify icon color eg:'blue,red'
   * @readonly
   * @memberOf AeCheckboxComponent
   */
  @Input('color')
  get color() {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }

  @Input('checked')
  get checked(): boolean {
    return this._isChecked;
  }
  set checked(val: boolean) {
    this._isChecked = val;
  }

  @Input('title')
  get title(): string {
    return this._title;
  }
  set title(val: string) {
    this._title = val;
  }
  // End of Public properties

  // Public Output bindings
  @Output()
  onAeChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  // End of Public Output bindings

  // End of Public properties
  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public Output bindings
  // End of Public Output bindings
  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings
  // Constructor

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor

  constructor(protected cdr: ChangeDetectorRef) {
    super(cdr);
  }

  // End of constructor

  // Private methods
  get checkBoxId(): string {
    return `${this.id}_iChkBox`;
  }
  get checkBoxName(): string {
    return `${this.name}_nChkBox`;
  }
  get aeiconId(): string {
    return `${this.id}_aeIcon`;
  }
  get aeiconName(): string {
    return `${this.name}_aeIconName`;
  }

  private _isDisabled() {
    return StringHelper.coerceBooleanProperty(this._disabled) ? true : null;
  }

  // End of private methods

  // Public methods
  ngOnInit() {
    super.ngOnInit();
    this._controlValueChange.subscribe(data => {
      this._isChecked = data;
    });
  }

  onChange(event) {
    this.writeValue(event.target.checked);
    this._propagateChange(event.target.checked);
    this.onAeChange.emit(event.target.checked);
  }
  // End of public methods 

}