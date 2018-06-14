import { AeIconComponent } from '../ae-icon/ae-icon.component';
import { Orientation } from '../common/orientation.enum';
import { AeLabelStyle } from '../common/ae-label-style.enum';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseElement } from '../common/base-element';
import { ChangeDetectionStrategy, Component, forwardRef, Input, OnInit } from '@angular/core';
import { AeIconSize } from "../common/ae-icon-size.enum";

/**
 * Label component has with Icon and without Icon functionality with different styles like Action, Medium ex..
 * Have option to mention Icon orientation as well.
 * 
 * @export
 * @class AeLabelComponent
 * @extends {BaseElement}
 */
@Component({
  selector: 'ae-label',
  templateUrl: './ae-label.component.html',
  styleUrls: ['./ae-label.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AeLabelComponent),
      multi: true,
    }],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AeLabelComponent extends BaseElement implements OnInit {

  // Private Fields
  private _text: string;
  private _style: AeLabelStyle = AeLabelStyle.Default;
  private _orientation: Orientation = Orientation.Horizontal;
  private _icon: string;
  private _imgSrc: string;
  private _imgVisible: boolean = false;
  // End of Private Fields

  // Public properties


  /**
  * Lable text type (Default, Medium, Action and Bold ) we are defining
  * 
  * @type string from enum
  * get/set property
  * 
  * @memberOf AeLabelComponent
  */
  @Input('style')
  get style() {
    return this._style;
  }
  set style(val: AeLabelStyle) {
    this._style = val;
  }

  @Input('icon')
  get icon() {
    return this._icon;
  }
  set icon(val: string) {
    this._icon = val;
  }
/**
   *Member to add url for image
   * 
   * @type {string}
   * @memberOf AeLabelComponent
   */
  @Input('src')
  get imgSrc() {
    return this._imgSrc;
  }
  set imgSrc(val: string) {
    this._imgSrc = val;
  }
  /**
     * Member to specify whether to show/hide image
     * default value is true
     * @type {boolean}
     * @memberOf AeLabelComponent
     */
  @Input('imgVisible')
  get imgVisible() {
    return this._imgVisible;
  }
  set imgVisible(val: boolean) {
    this._imgVisible = val;
  }

  /**
  * To represent the postion of the icon. Orientation can be "Vertiacal" and "Horizontal"
  * 
  * @type orientation
  * get/set property
  * 
  * @memberOf AeIconComponent
  */
  @Input("orientation")
  get orientation() {
    return this._orientation;
  }
  set orientation(val: Orientation) {
    this._orientation = val;
  }


  /**
   * Displays the label text.
   * 
   * @type: string
   * get/set property
   * 
   * @memberOf AeLabelComponent
   */
  @Input()
  get text() {
    return this._text;
  }
  set text(val: string) {
    this._text = val;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor() {
    super();
  }
  // End of constructor

  // Private methods
  isMedium(): boolean {
    return this._style == AeLabelStyle.Medium;
  }

  isAction(): boolean {
    return this._style == AeLabelStyle.Action;
  }

  isBlod(): boolean {
    return this._style == AeLabelStyle.Bold
  }

  isVertical(): boolean {
    return this._orientation == Orientation.Vertiacal;
  }
  isHorizontal(): boolean {
    return this._orientation == Orientation.Horizontal;
  }

  isIcon(): boolean {
    return this._icon != null && this._icon != undefined;
  }

  getIconSize() {
    return this.isMedium() ? AeIconSize.medium : null;
  }

  get aeiconId(): string {
    return `${this.id}_aeIcon`;
  }
  get aeiconName(): string {
    return `${this.name}_aeIconName`;
  }
  get txtDivId(): string {
    return `${this.id}_div`;
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    super.ngOnInit();
  }
  // End of publprivateic methods


}
