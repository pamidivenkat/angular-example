import { BaseElement } from '../common/base-element';
import { NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { AeClassStyle } from '../common/ae-class-style.enum';
import { AeNav } from '../common/ae-nav.enum';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { AeAnchorTarget } from "../common/ae-anchor-target.enum";
import { StringHelper } from "../../shared/helpers/string-helper";
import { isNullOrUndefined } from "util";


/**
 * Anchor component with link type, button type and page navigation buttons
 * @export
 * @class AeAnchorComponent
 * @extends {BaseElement}
 * @implements {OnInit}
 */
@Component({
  selector: 'ae-anchor',
  templateUrl: './ae-anchor.component.html',
  styleUrls: ['./ae-anchor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeAnchorComponent extends BaseElement implements OnInit {

  // Private Fields
  private _anchorText: string = "";
  private _class: string = '';
  private _type: string = "";
  private _classStyle: AeClassStyle = AeClassStyle.Default;
  private _navType: AeNav = AeNav.Default;
  private _disabled: boolean = false;
  private _target: AeAnchorTarget = AeAnchorTarget.Self;
  private _href: string = "";
  // End of Private Fields

  // Public properties

  /**
   * Member to add label text for the anchor component
   * @type {string}
   * @memberOf AeAnchorComponent
   */
  @Input('text')
  get anchorText() {
    return this._anchorText;
  }
  set anchorText(value: string) {
    this._anchorText = value;
  }

  @Input('target')
  get target() {
    return this._target;
  }
  set target(value: AeAnchorTarget) {
    this._target = value;
  }

  /**
   * Member to add class for the anchor component
   * @type {string}
   * @memberOf AeAnchorComponent
   */
  @Input('class')
  get class() {
    return this._class;
  }
  set class(val: string) {
    this._class = val;
  }


  /**
   * Member to add optonal type whether it is link or button
   * @type {string}
   * @memberOf AeAnchorComponent
   */
  @Input('anchorType')
  get anchorType() {
    return this._type;
  }
  set anchorType(value: string) {
    this._type = value;
  }


  /**
   * Member to add optional class to button to add css
   * @type {AeClassStyle}
   * @memberOf AeAnchorComponent
   */
  @Input()
  get anchorClass() {
    return this._classStyle;
  }
  set anchorClass(value: AeClassStyle) {
    this._classStyle = value;
  }


  /**
   * Member to add optional navigation buttons for forward or backward
   * @type {AeNav}
   * @memberOf AeAnchorComponent
   */
  @Input('anchorNav')
  get navType() {
    return this._navType;
  }
  set navType(value: AeNav) {
    this._navType = value;
  }



  /**
   * Member to disable anchor component
   * 
   * @readonly
   * 
   * @memberOf AeAnchorComponent
   */
  @Input('disabled')
  get disabledAnc() {
    return this._disabled;
  }
  set disabledAnc(value: boolean) {
    this._disabled = value;
  }

  @Input('href')
  get href(): string {
    return this._href;
  }
  set href(value: string) {
    this._href = value;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  // End of constructor

  // Private methods
  onClick(event) {
    event.preventDefault();
    if (!this._disabled) {
      this.aeClick.emit(event);
    }
  }


  /**
   * Returns boolean value to display button or link
   * @returns {boolean} 
   * 
   * @memberOf AeAnchorComponent
   */
  isButton(): boolean {
    return this._type == "button";
  }

  isDisabled(): boolean {
    return this._disabled == true;
  }
  /**
   * Returns boolean value to add light--button class to button
   * @returns {boolean} 
   * 
   * @memberOf AeAnchorComponent
   */
  isLight(): boolean {
    return this._classStyle == AeClassStyle.Light;
  }


  /**
   * To add nav-link class
   * 
   * @private
   * @returns {boolean} 
   * 
   * @memberOf AeAnchorComponent
   */
  isNavLink(): boolean {
    return this._classStyle == AeClassStyle.NavLink;
  }

  /**
   * Returns boolean value to add dark--button class to button
   * 
   * @returns {boolean} 
   * 
   * @memberOf AeAnchorComponent
   */
  isDark(): boolean {
    return this._classStyle == AeClassStyle.Dark;
  }

  getAnchorTarget() {
    if (!isNullOrUndefined(AeAnchorTarget[this.target])) {
      return `_${AeAnchorTarget[this.target].toLowerCase()}`;
    } else {
      return '_self';
    }
  }


  /**
   * Returns boolean value to add forward button class
   * 
   * @returns {boolean} 
   * 
   * @memberOf AeAnchorComponent
   */
  isForward(): boolean {
    return this._navType == AeNav.Forward;
  }

  isBreadcrumb(): boolean {
    return this._classStyle == AeClassStyle.Breadcrumb;
  }


  /**
   * Returns boolean value to add backward button class
   * 
   * @returns {boolean} 
   * 
   * @memberOf AeAnchorComponent
   */
  isBack(): boolean {
    return this._navType == AeNav.Backward;
  }

  isCurrentAction(): boolean {
    return this._classStyle === AeClassStyle.Active;
  }
  // End of private methods

  // Public methods
  /**
  * Event to trigger click event at ae-anchor level
  * @type {EventEmitter<any>}
  * @memberOf AeAnchorComponent
  */
  @Output()
  aeClick: EventEmitter<any> = new EventEmitter<any>()

  ngOnInit() {
    super.ngOnInit();
  }
  // End of public methods
}
