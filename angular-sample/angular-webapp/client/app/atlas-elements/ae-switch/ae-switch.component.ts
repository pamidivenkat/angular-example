import { BaseElementGeneric } from '../common/base-element-generic';
import { AeClassStyle } from '../common/ae-class-style.enum';
import { NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, OnInit, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
/**
 * Switch component with optional icon
 * @export
 * @class AeSwitchComponent
 * @extends {BaseElementGeneric<boolean>}
 * @implements {OnInit}
 */
@Component({
  selector: 'ae-switch',
  templateUrl: './ae-switch.component.html',
  styleUrls: ['./ae-switch.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AeSwitchComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeSwitchComponent<T> extends BaseElementGeneric<boolean> implements OnInit {

  // Private Fields
  /**
      * Member to specify either to enable/disable checkbox
      * default value is false
      * returns true or false
      * @type {boolean}
      * @memberOf AeCheckboxComponent
      */
  private _labelText: string = "label text";
  // End of Private Fields

  // Public properties
  /**
    * Member to specify the switch label textVisible
    * @type {string}
    * @memberOf AeCheckboxComponent
    */
  _disabled: boolean = false;
  @Input('switchText')
  get switchLabel() { return this._labelText; }
  set switchLabel(val: string) { this._labelText = val; }

  /**
   * Member to specify whether to show/hide label text
   * default value is true
   * @type {boolean}
   * @memberOf AeCheckboxComponent
   */
  @Input('textVisible')
  showText: boolean = true;

  get textVisible() { return this.textVisible; }
  set textVisible(val: boolean) { this.textVisible = val; }

  /**
   * Member to specify class to display text position
   * default value is true
    * default text position is top
   * @type {AeClassStyle}
   * @memberOf AeCheckboxComponent
   */
  @Input("class")
  _class: AeClassStyle = AeClassStyle.Default;
  get buttonClass() { return this._class; }
  set buttonClass(value: AeClassStyle) { this._class = value; }

  private _isChecked: boolean = false;
  @Input('checked')
  get checked(): boolean {
    return this._isChecked;
  }
  set checked(val: boolean) {
    this._isChecked = val;
    this.value = val;
  }

  private _title: string = '';
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
  aeChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor 
  constructor(protected cdr: ChangeDetectorRef) {
    super(cdr);
  }
  // End of constructor

  // Private methods
  /**
    * Member to specify class to display text left
    * class name text--left
    * @type {boolean}
    * @memberOf AeCheckboxComponent
    */
  isLeft(): boolean {
    return this._class === AeClassStyle.TextLeft;
  }
  /**
 * Member to specify class to display text right
 * class name text--right
 * @type {boolean}
 * @memberOf AeCheckboxComponent
 */
  isRight(): boolean {
    return this._class === AeClassStyle.TextRight;
  }
  /**
* Member to specify class to display text right
* @type {boolean}
* @memberOf AeCheckboxComponent
*/
  private _isDefault(): boolean {
    return this._class === AeClassStyle.Default;
  }

  // End of private methods

  // Public methods
  ngOnInit() {
    super.ngOnInit();
  }

  onChange(event) {
    this._propagateChange(event.target.checked);
    this.aeChange.emit(event.target.checked);
  }
  // End of public methods
}
