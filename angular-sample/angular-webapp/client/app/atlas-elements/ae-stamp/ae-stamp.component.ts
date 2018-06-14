import { BaseComponent } from '../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ae-stamp',
  templateUrl: './ae-stamp.component.html',
  styleUrls: ['./ae-stamp.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeStampComponent extends BaseComponent implements OnInit {

  // Private Fields
  private _text: string = '';
  private _classColor: string;

  //constructor
  constructor(protected _localeService: LocaleService, protected _translationService: TranslationService, protected _cdRef: ChangeDetectorRef) {
    super(_localeService, _translationService, _cdRef);
  }
  // Public properties

  /**
   * Member to add text for the stamp component
   * @type {string}
   * @memberOf AeStampComponent
   */
  @Input('text')
  get stampText() {
    return this._text;
  }
  set stampText(value: string) {
    this._text = value;
  }

  /**
   * Member to add color class for the stamp component
   * @type {string}
   * @memberOf AeStampComponent
   */
  @Input('class')
  get classColor() {
    return this._classColor;
  }
  set classColor(val: string) {
    this._classColor = val;
  }
  ngOnInit() {
  }

}
