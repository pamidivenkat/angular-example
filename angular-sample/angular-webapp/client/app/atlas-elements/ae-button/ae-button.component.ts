import { isNullOrUndefined } from 'util';
import { BaseElement } from '../common/base-element';
import { AeClassStyle } from '../common/ae-class-style.enum';
import { AePosition } from '../common/ae-position.enum';
import { AeIconSize } from '../common/ae-icon-size.enum';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';

/**
 * Button component with and without icons
 * 
 * @export
 * @class AeButtonComponent
 * @extends {BaseElement}
 * @implements {OnInit}
 */
@Component({
  selector: 'ae-button',
  templateUrl: './ae-button.component.html',
  styleUrls: ['./ae-button.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeButtonComponent extends BaseElement implements OnInit {
  // Private Fields
  private _buttonText: string = '';
  private _class: AeClassStyle = AeClassStyle.Default;
  private _type: string = "button";
  private _btnIcon: string = "";
  private _iconSize: AeIconSize = AeIconSize.big;
  private _iconColor: string = "";
  private _iconPosition: AePosition = AePosition.Right;
  private _disabled: boolean = false;
  private _btnClass: string;
  private _buttonTitle: string;
  // End of Private Fields

  // Public properties
  /**
 * Member to add title text to button
 * 
 * 
 * @memberOf AeButtonComponent
 */
  @Input('title')
  get buttonTitle() { return this._buttonTitle; };
  set buttonTitle(value: string) { this._buttonTitle = value; };

  /**
   * Member to add lable text to button
   * 
   * 
   * @memberOf AeButtonComponent
   */
  @Input('text')
  get buttonText() { return this._buttonText };
  set buttonText(value: string) { this._buttonText = value; };

  /**
   * Member to add dark or light class to button
   * 
   * @type {AeClassStyle}
   * @memberOf AeButtonComponent
   */
  @Input("class")
  get buttonClass() { return this._class; }
  set buttonClass(value: AeClassStyle) { this._class = value; }

  /**
    * Member to add custom class for the button component
    * @type {string}
    * @memberOf AeButtonComponent
    */
  @Input('customClass')
  get class() {
    return this._btnClass;
  }
  set class(val: string) {
    this._btnClass = val;
  }
  /**
   * Member to add button type whether submit type or button type
   * 
   * @type {string}
   * @memberOf AeButtonComponent
   */
  @Input('type')
  get buttonType() { return this._type; };
  set buttonType(value: string) { this._type = value; };

  /**
   * Member to add icon on button
   * 
   * @type {string}
   * @memberOf AeButtonComponent
   */
  @Input('btnIcon')
  get iconType() { return this._btnIcon; };
  set iconType(value: string) { this._btnIcon = value; };

  /**
   * Member to add size of the icon on button
   * 
   * @type {AeIconSize}
   * @memberOf AeButtonComponent
   */
  @Input('iconSize')
  get btnIconSize() { return this._iconSize; };
  set btnIconSize(value: AeIconSize) { this._iconSize = value; };

  /**
   * Member to add color of the icon on button
   * 
   * @type {string}
   * @memberOf AeButtonComponent
   */
  @Input('iconColor')
  get btnIconColor() { return this._iconColor; };
  set btnIconColor(value: string) { this._iconColor = value; };

  /**
   * Member to add position of the icon on button whether left or right
   * 
   * @type {AePosition}
   * @memberOf AeButtonComponent
   */
  @Input("iconPosition")
  get btnIconPosition() { return this._iconPosition; }
  set btnIconPosition(value: AePosition) { this._iconPosition = value; }

  /**
   * Member to add disable feature to button
   * 
   * @type {boolean}
   * @memberOf AeButtonComponent
   */
  @Input('disabled')
  get disabled() { return this._disabled; }
  set disabled(val: boolean) { this._disabled = val; }
  // End of Public properties

  // Public Output bindings
  /**
   * Member to trigger click event
   * 
   * @type {EventEmitter<any>}
   * @memberOf AeButtonComponent
   */
  @Output()
  aeClick: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  aeMouseDown: EventEmitter<any> = new EventEmitter<any>();


  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ViewContent bindings
  // End of Public ViewContent bidnings

  // constructor
  constructor(public cdRef: ChangeDetectorRef) {
    super();
  }
  // End of constructor

  // Private methods
  /**
   * member to  emit event on click
   * @private
   * @param {any} event 
   * 
   * @memberOf AeButtonComponent
   */
  onClick(event) {
    this.aeClick.emit(event);
  }


  /**
   * Mouse down event
   *  
   * @param {any} event 
   * @memberof AeButtonComponent
   */
  onMouseDownEvent(event) {
    this.aeMouseDown.emit(event);
  }
  // End of private methods

  // Public methods
  /**
   * Member to add light class to button 
   * @returns {boolean} 
   * 
   * @memberOf AeButtonComponent
   */
  isLight(): boolean {
    return this._class == AeClassStyle.Light;
  }

  /**
   * Member to add dark class to button style 
   * @returns {boolean} 
   * 
   * @memberOf AeButtonComponent
   */
  isDark(): boolean {
    return this._class == AeClassStyle.Dark;
  }

  /**
   * Member to add default class to button style 
   * @returns {boolean} 
   * 
   * @memberOf AeButtonComponent
   */
  _isDefault(): boolean {
    return this._class == AeClassStyle.Default;
  }

  /**
   * member to check modal is closed 
   * @returns {boolean} 
   * 
   * @memberOf AeButtonComponent
   */
  _isClose(): boolean {
    return this._class == AeClassStyle.ModalClose;
  }

  /**
   * Member to display button with icon or not
   * 
   * @returns {boolean} 
   * 
   * @memberOf AeButtonComponent
   */
  viewIcon(): boolean {
    return this._btnIcon !== "";
  }

  /**
   * If button has icon on it, it tells the position of the icon whether left or right
   * 
   * @returns {boolean} 
   * 
   * @memberOf AeButtonComponent
   */
  isIconRight(): boolean {
    return this._iconPosition == AePosition.Right;
  }
  isIconLeft(): boolean {
    return this._iconPosition == AePosition.Left;
  }
  // End of public methods
  ngOnInit() {
    if (isNullOrUndefined(this._buttonTitle) && !isNullOrUndefined(this._buttonText)) {
      this._buttonTitle = this._buttonText;
    }
  }
}