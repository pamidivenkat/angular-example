import { BaseComponent } from '../../shared/base-component';
import { AeIndicatorStyle } from '../common/ae-indicator-style.enum';
import { Component, Input, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';

@Component({
  selector: 'ae-indicator',
  templateUrl: './ae-indicator.component.html',
  styleUrls: ['./ae-indicator.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeIndicatorComponent extends BaseComponent implements OnInit {

  // Private Fields
  private _indicatorText: string = '';
  private _classColor: string;
  private _indicatorStyle: AeIndicatorStyle;
  // End of Private Fields

  // Public properties

  /**
   * Member to add text for the indicator component
   * @type {string}
   * @memberOf AeIndicatorComponent
   */
  @Input('text')
  get indicatorText() {
    return this._indicatorText;
  }
  set indicatorText(value: string) {
    this._indicatorText = value;
  }

  /**
   * Returns boolean value to add indicator--square class to indicator
   * @returns {boolean} 
   * 
   * @memberOf AeIndicatorComponent
   */
  square(): boolean {
    return this._indicatorStyle == AeIndicatorStyle.Square;
  }

  /**
     * Returns boolean value to add indicator
     * @type {string}
     * @memberOf AeIndicatorComponent
     */
  @Input()
  get shape() {
    return this._indicatorStyle;
  }
  set shape(val: AeIndicatorStyle) {
    this._indicatorStyle = val;
  }

  /**
   * Member to add color class for the indicator component
   * @type {string}
   * @memberOf AeIndicatorComponent
   */
  @Input('class')
  get classColor() {
    return this._classColor;
  }
  set classColor(val: string) {
    this._classColor = val;
  }
  //constructor
  constructor(protected _localeService: LocaleService, protected _translationService: TranslationService, protected _cdRef: ChangeDetectorRef) {
    super(_localeService, _translationService, _cdRef);
  }
  //end of constructor
  ngOnInit() {
  }


}
