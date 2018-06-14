import { BaseComponent } from '../../../../shared/base-component';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { HolidayAbsenceDataService } from './../../../services/holiday-absence-data.service';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';

@Component({
  selector: 'holiday-status-indicator',
  templateUrl: './holiday-status-indicator.component.html',
  styleUrls: ['./holiday-status-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HolidayStatusIndicatorComponent extends BaseComponent implements OnInit {
  // Private field declarations
  private _code: number;
  // End of private field declarations

  // Public field declarations
  @Input('code')
  get Code(): number {
    return this._code;
  }
  set Code(val: number) {
    this._code = val;
  }
  // End of public field declarations

  // Output property declarations

  // End of output propery declarations
  // constructor starts
  constructor(private _holidayAbsenceDataService: HolidayAbsenceDataService
    , protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);

  }
  //start of private functions

  //End of private functions
  //End of constructor starts
  //public functions
  public getLegendColor() {
    return this._holidayAbsenceDataService.getLegendColor(this._code);
  }
  ngOnInit() {
  }
  //end of public functions

}
