import { isNullOrUndefined } from 'util';
import { FiscalYearSummary } from './../../models/holiday-absence.model';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { HolidayAbsenceDataService } from './../../services/holiday-absence-data.service';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';

@Component({
  selector: 'holiday-entitlement-summary',
  templateUrl: './holiday-entitlement-summary.component.html',
  styleUrls: ['./holiday-entitlement-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HolidayEntitlementSummaryComponent extends BaseComponent implements OnInit {

  // Private field declarations
  private _fiscalYearSummary: FiscalYearSummary;
  private _selectedEmployee: string;
  // End of private field declarations
  @Input('fiscalYearSummary')
  set FiscalYearSummary(val: FiscalYearSummary) {
    this._fiscalYearSummary = val;
  }
  get FiscalYearSummary(): FiscalYearSummary {
    return this._fiscalYearSummary;
  }
 

  @Input('selectedEmployee')
  get selectedEmployee(): string {
    return this._selectedEmployee;
  }
  set selectedEmployee(val: string) {
    this._selectedEmployee = val;
  }
  // Public field declarations

  // End of public field declarations

  // Output property declarations

  // End of output propery declarations
  // constructor starts
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);

  }
  //start of private functions


  //End of private functions
  //End of constructor starts
  //public methods

  public getYourTitle(): string {
    return this.isSelectedEmployeeMode() ? this._selectedEmployee : 'You'
  }

  public isSelectedEmployeeMode() {
    return !isNullOrUndefined(this._selectedEmployee);
  }

  public hasHolidayResubmitted() {
    return this.hasFiscalYearSummary() && this._fiscalYearSummary.Status === 2;
  }

  public hasRemainingHolidays() {
    return this.hasFiscalYearSummary() && this._fiscalYearSummary.RemainingHoliDays < 0;
  }

  public hasCarryForwardedUnitsExpired() {
    return this.hasFiscalYearSummary() && this._fiscalYearSummary.HasCarryForwardedUnitsExpired;
  }


  public hasCarryForwardedUnitsExpiredExists() {
    return this.hasFiscalYearSummary() && this._fiscalYearSummary.HasCarryForwardedUnitsExpired && this._fiscalYearSummary.ExpiredCarryForwardedUnitsToDisplay > 0;
  }

  public isRequestedForCurrentFY() {
    return this.hasFiscalYearSummary() && this._fiscalYearSummary.IsRequestedForRunningFYYear;
  }

  public getYoursTitle(): string {
    return this.isSelectedEmployeeMode() ? this._selectedEmployee + '\'s' : 'Your'
  }

  public hasFiscalYearSummary() {
    return !isNullOrUndefined(this._fiscalYearSummary);
  }


  public isHolidayRequested() {
    return this.hasFiscalYearSummary() && this._fiscalYearSummary.Status === 1;
  }

  public selectedEmployeeSummary(): boolean {
    if (!isNullOrUndefined(this._selectedEmployee)) {
      return true;
    }

    return false;
  }
  ngOnInit() {
  }
  //end of public methods

}
