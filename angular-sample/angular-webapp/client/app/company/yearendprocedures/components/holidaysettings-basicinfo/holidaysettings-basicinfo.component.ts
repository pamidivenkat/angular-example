import {
  Component
  , OnInit
  , ChangeDetectorRef
  , OnDestroy
  , ChangeDetectionStrategy
  , ViewEncapsulation
  , Input
  , Output
  , EventEmitter,
  ViewChild
} from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { BaseComponent } from './../../../../shared/base-component';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { EmployeeSettings, HolidayUnitType } from './../../../../shared/models/company.models';
import { isNullOrUndefined } from 'util';
import { Router, NavigationExtras } from '@angular/router';
import { AeLoaderType } from './../../../../atlas-elements/common/ae-loader-type.enum';
import { AeTemplateComponent } from './../../../../atlas-elements/ae-template/ae-template.component';
import { createPopOverVm } from './../../../../atlas-elements/common/models/popover-vm';

@Component({
  selector: 'holidaysettings-basicinfo',
  templateUrl: './holidaysettings-basicinfo.component.html',
  styleUrls: ['./holidaysettings-basicinfo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HolidaysettingsBasicinfoComponent extends BaseComponent implements OnInit, OnDestroy {
  // private field declarations start
  private _employeeSettings: EmployeeSettings;
  private _loading: boolean = false;
  // end of private fields

  // getters start
  public get holidayEntitlement() {
    if (!isNullOrUndefined(this._employeeSettings)) {
      return `${this._employeeSettings.HolidayEntitlement} ${HolidayUnitType[this._employeeSettings.HolidayUnitType].toLowerCase()}`;
    }
    return null;
  }

  public get holidayUnitType() {
    if (!isNullOrUndefined(this._employeeSettings)) {
      return `${HolidayUnitType[this._employeeSettings.HolidayUnitType]}`;
    }
    return null;
  }

  public get canAllowCarryForwardDays() {
    if (!isNullOrUndefined(this._employeeSettings)) {
      return this._employeeSettings.AllowCarryForwardHolidays ? 'Yes' : 'No';
    }
    return null;
  }

  public get hasCarryForwardExpDays() {
    if (!isNullOrUndefined(this._employeeSettings)) {
      return this._employeeSettings.CarryForwardExpDays > 0;
    }
    return false;
  }

  public get getMaxCarryForwardDays() {
    if (!isNullOrUndefined(this._employeeSettings) &&
      this._employeeSettings.MaxCarryForwardDays > 0) {
      return this._employeeSettings.MaxCarryForwardDays;
    }
    return null;
  }

  public get getMaxCarryForwardHours() {
    if (!isNullOrUndefined(this._employeeSettings) &&
      this._employeeSettings.MaxCarryForwardHours > 0) {
      return this._employeeSettings.MaxCarryForwardHours;
    }
    return null;
  }

  public get lightClass() {
    return AeClassStyle.Light;
  }

  public get loaderType() {
    return AeLoaderType.Bars;
  }

  public get loading() {
    return this._loading;
  }
  // end of getters

  // public properties
  @Input('employeeSettings')
  public set employeeSettings(val: EmployeeSettings) {
    this._employeeSettings = val;

    if (!isNullOrUndefined(val)) {
      this._loading = false;
    }
  }
  public get employeeSettings() {
    return this._employeeSettings;
  }
  
  // end of public properties

  // output bindings start
  @Output()
  closePanel: EventEmitter<boolean> = new EventEmitter<boolean>();
  // end of output bindings

  // Public ViewChild bindings
  @ViewChild('popOverTemplate')
  _popOverTemplate: AeTemplateComponent<any>;
  // End of Public ViewChild bindings

  // constrcutor starts
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _router: Router) {
    super(_localeService, _translationService, _changeDetector);
    this._loading = true;
  }
  // end of constructor

  // public methods
  getPopOverVm(text) {
    return createPopOverVm<any>(null, { Text: text }, null, true);
  }

  public onPanelClosed(e) {
    this.closePanel.emit(true);
  }

  public gotoEmpSettings(e) {
    this.closePanel.emit(true);
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    this._router.navigate(['/employee/settings'], navigationExtras);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }
  // end of public methods
}
