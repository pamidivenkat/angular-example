import { isNullOrUndefined } from 'util';
import { AeIconSize } from '../common/ae-icon-size.enum';
import { BaseElement } from '../common/base-element';
import { AeIndicatorStyle } from '../common/ae-indicator-style.enum';
import { Component, Input, OnChanges, OnInit, ViewEncapsulation } from '@angular/core';
import { AeLegendItem } from '../common/models/ae-legend-item';
import * as Immutable from 'immutable';

@Component({
  selector: 'ae-legend',
  templateUrl: './ae-legend.component.html',
  styleUrls: ['./ae-legend.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AeLegendComponent extends BaseElement implements OnInit, OnChanges {

  // Private Fields
  private _options: Immutable.List<AeLegendItem>;
  private _legendText: string;
  private _indicatorStyle: AeIndicatorStyle;
  private _legendType: AeIndicatorStyle;
  // End of Private Fields


  /**
     * Member to add color class for the indicator component
     * @type {string}
     * @memberOf AeLegendComponent
     */
  @Input()
  get shape() {
    return this._indicatorStyle;
  }
  set shape(val: AeIndicatorStyle) {
    this._indicatorStyle = val;
  }

  /**
     * Returns boolean value to add legend--vertical class to legend
     * @returns {boolean} 
     * 
     * @memberOf AeLegendComponent
     */
  legendVertical(): boolean {
    return this._legendType == AeIndicatorStyle.Vertical;
  }

  /**
     * Member to add class for legend
     * @type {string}
     * @memberOf AeLegendComponent
     */
  @Input()
  get legendType() {
    return this._legendType;
  }
  set legendType(val: AeIndicatorStyle) {
    this._legendType = val;
  }

  // Public properties
  /**
   * Member to add legend type text for the legend component
   * @type {string}
   * @memberOf AeLegendComponent
   */
  @Input('headText')
  get legendText() {
    return this._legendText;
  }
  set legendText(value: string) {
    this._legendText = value;
  }

  /**
   * Array of options to generate legend 
   *
   * @readonly
   *
   * @memberOf AeLegendComponent
   */
  @Input('options')
  get options() {
    return this._options;
  }
  set options(value: Immutable.List<AeLegendItem>) {
    this._options = value;
  }

  /**
       * Returns boolean value to show icon in legend
       * @returns {boolean} 
       * 
       * @memberOf AeLegendComponent
       */
  showLegendIcon(iconName: string): boolean {
    if (!isNullOrUndefined(iconName))
      return true;
    return false;
  }
  /**
       * Returns boolean value to show stamp with value in legend
       * @returns {boolean} 
       * 
       * @memberOf AeLegendComponent
       */
  showLegendValue(legendCount: number): boolean {
    if (!isNullOrUndefined(legendCount))
      return true;
    return false;
  }
  // icon size icon--tiny
  iconTiny: AeIconSize = AeIconSize.tiny;

  ngOnInit() {
  }
  ngOnChanges() {
  }
}
