import { BaseComponent } from '../../../../shared/base-component';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { HolidayAbsenceDataService } from './../../../services/holiday-absence-data.service';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';

@Component({
  selector: 'holiday-status-legend',
  templateUrl: './holiday-status-legend.component.html',
  styleUrls: ['./holiday-status-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HolidayStatusLegendComponent extends BaseComponent implements OnInit {

  // Private field declarations  
   private _legendOptions = [{ Text: "New", Class: "indicator--green" }, { Text: "Approved", Class: "indicator--yellow" }, { Text: "Cancelled", Class: "indicator--red" }, { Text: "Declined", Class: "indicator--purple" }, { Text: "Cancellation request", Class: "indicator--teal" }, { Text: "Change request", Class: "indicator--grey" }];
  // End of private field declarations

  // Public field declarations
  get legendOptions(){
    return this._legendOptions;
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
  ngOnInit() {
  }
}
