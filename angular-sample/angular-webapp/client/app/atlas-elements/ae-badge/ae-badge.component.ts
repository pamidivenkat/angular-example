import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { AeBadgeSize } from '../common/ae-badge-size.enum';
@Component({
  selector: 'ae-badge',
  templateUrl: './ae-badge.component.html',
  styleUrls: ['./ae-badge.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AeBadgeComponent implements OnInit {
  // Private Fields
  private _badgeText: string;
  private _class: string;
  private _badgeSize: AeBadgeSize = AeBadgeSize.none;

  /**
    * Member to add badge text for the badge component
    * @type {string}
    * @memberOf AeBadgeComponent
    */
  @Input('text')
  get text() {
    return this._badgeText;
  }
  set text(value: string) {
    this._badgeText = value;
  }

  /**
    * Member to add class for the badge component. badge--teal, badge--gery, badge--yellow, badge--grey-pale, badge--red
    * @type {string}
    * @memberOf AeBadgeComponent
    */
  @Input('class')
  get class() {
    return this._class;
  }
  set class(val: string) {
    this._class = val;
  }

  /**
   * To represent the size of the badge. Size can be medium','large'
   * 
   * @type AeBadgeSize
   * get/set property
   * 
   * @memberOf AeBadgeComponent
   */
  @Input('size')
  get badgeSize() {
    return this._badgeSize;
  }
  set badgeSize(value: AeBadgeSize) {
    this._badgeSize = value;
  }

  /**
   * By default shadow not displayed to badge
   * 
   * @private
   * @type {boolean}
   * @memberOf AeBadgeComponent
   */
  private _isShadow: boolean = false;

  /**
   * Member to pass input vale true/false
   * 
   * @readonly
   * 
   * @memberOf AeBadgeComponent
   */
  @Input('isShadow')
  get isShadow() { return this._isShadow; }
  set isShadow(val: boolean) { this._isShadow = val; }

  ngOnInit() {
  }

  /**
   * Member to return value 
   * 
   * @private
   * @returns 
   * 
   * @memberOf AeBadgeComponent
   */
  shadowClass() {
    return this._isShadow;
  }

  // Private methods
  isMedium(): boolean {
    return this._badgeSize == AeBadgeSize.medium;
  }

  isLarge(): boolean {
    return this._badgeSize == AeBadgeSize.large;
  }
  // end Private methods
}
