import { CommonValidators } from './../../../../shared/validators/common-validators';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { TranslationService, LocaleService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import * as Immutable from 'immutable';
import * as fromRoot from './../../../../shared/reducers/index';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EmployeeSettings } from './../../../../shared/models/company.models';
import { AeInputType } from './../../../../atlas-elements/common/ae-input-type.enum';
import { Location } from '@angular/common';


@Component({
  selector: 'employee-holidaysettings',
  templateUrl: './holidaysettings.component.html',
  styleUrls: ['./holidaysettings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HolidaysettingsComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _holidaySettingsData: EmployeeSettings;
  private _holidaySettingsForm: FormGroup;
  private _holidayUnitTypeSelectList: Immutable.List<AeSelectItem<string>>;
  private _fiscalDataSelectList: Immutable.List<AeSelectItem<string>>;
  private _numberType: AeInputType;
  private _lunchDuration: number;
  private _formStatus: boolean = false;
  // End of private Fields

  //Public Properties 
  // Input properties declarations
  @Input('holidaySettingsData')
  get holidaySettingsData(): EmployeeSettings {
    return this._holidaySettingsData;
  }
  set holidaySettingsData(value: EmployeeSettings) {
    this._holidaySettingsData = value;
    if (this._holidaySettingsData) {
      this._initForm();
    }
  }

  // Output properties declarations
  @Output('aeSubmit')
  private _submitHolidaySettings: EventEmitter<EmployeeSettings> = new EventEmitter<EmployeeSettings>();
  //End of Public properties

  //get 
  get numberType() {
    return this._numberType;
  }

  get holidaySettingsForm() {
    return this._holidaySettingsForm;
  }

  get holidayUnitTypeSelectList() {
    return this._holidayUnitTypeSelectList;
  }

  get fiscalDataSelectList() {
    return this._fiscalDataSelectList;
  }
  get lightClass() {
    return this._lightClass;
  }



  // Constructor
  constructor(protected _changeDetector: ChangeDetectorRef
    , protected _store: Store<fromRoot.State>
    , _localeService: LocaleService
    , _translationService: TranslationService
    , private _fb: FormBuilder
    , protected _claimsHelper: ClaimsHelperService
    , private _location: Location) {
    super(_localeService, _translationService, _changeDetector);
  }
  // End of Constructor


  // Public methods
  ngOnInit() {
    this._holidayUnitTypeSelectList = Immutable.List([
      new AeSelectItem<string>('Days', '1', false),
      new AeSelectItem<string>('Hours', '2', false)
    ]);
    this._fiscalDataSelectList = Immutable.List([
      new AeSelectItem<string>('January', '1', false),
      new AeSelectItem<string>('February', '2', false),
      new AeSelectItem<string>('March', '3', false),
      new AeSelectItem<string>('April', '4', false),
      new AeSelectItem<string>('May', '5', false),
      new AeSelectItem<string>('June', '6', false),
      new AeSelectItem<string>('July', '7', false),
      new AeSelectItem<string>('August', '8', false),
      new AeSelectItem<string>('September', '9', false),
      new AeSelectItem<string>('October', '10', false),
      new AeSelectItem<string>('November', '11', false),
      new AeSelectItem<string>('December', '12', false)
    ]);
    this._numberType = AeInputType.number;

  }
  ngOnDestroy() {
  }

  onYearChanged($event) {
    if ($event.SelectedValue == 1) {
      this._holidaySettingsForm.get('FiscalEndDate').setValue(12);
    } else {
      this._holidaySettingsForm.get('FiscalEndDate').setValue($event.SelectedValue - 1);
    }
  }
  // End of public methods

  // Private methods start
  private _initForm() {
    let currentDate = new Date();
    let fiscalStartDate = new Date(this._holidaySettingsData.FiscalStartDate);
    let fStartDate = fiscalStartDate.getMonth() + 1;
    let fiscalEndDate = new Date(this._holidaySettingsData.FiscalEndDate);
    let fEndDate = fiscalEndDate.getMonth() + 1;
    if (fStartDate === fEndDate) {
      fEndDate = fiscalEndDate.getMonth();
    }


    if (this._holidaySettingsData.MaxCarryForwardDays != null) {
      this._holidaySettingsData.AllowMaxCarryForwardDays = true;
    }
    if (this._holidaySettingsData.MaxCarryForwardHours != null) {
      this._holidaySettingsData.AllowMaxCarryForwardHours = true;
    }
    if (this._holidaySettingsData.CarryForwardExpDays != null) {
      this._holidaySettingsData.AllowCarryForwardExpDays = true;
    }
    this._lunchDuration = this._holidaySettingsData.LunchDuration * 60;

    this._holidaySettingsForm = this._fb.group({
      StartTimeHours: [{ value: this._holidaySettingsData.StartTimeHours, disabled: false }, [Validators.required]],
      EndTimeHours: [{ value: this._holidaySettingsData.EndTimeHours, disabled: false }, [Validators.required]],
      HolidayUnitType: [{ value: this._holidaySettingsData.HolidayUnitType, disabled: false }, [Validators.required]],
      HolidayEntitlement: [{ value: this._holidaySettingsData.HolidayEntitlement, disabled: false }, [Validators.required, CommonValidators.min(1), CommonValidators.max(300)]],
      NoOfTimesResubmit: [{ value: this._holidaySettingsData.NoOfTimesResubmit, disabled: false }, [Validators.required, CommonValidators.min(0), CommonValidators.max(20)]],
      NoOfTimesEscalate: [{ value: this._holidaySettingsData.NoOfTimesEscalate, disabled: false }, [Validators.required, CommonValidators.min(0), CommonValidators.max(20)]],
      DaysPerWeek: [{ value: this._holidaySettingsData.DaysPerWeek, disabled: false }, [Validators.required, CommonValidators.min(1), CommonValidators.max(7)]],
      LunchDuration: [{ value: this._holidaySettingsData.LunchDuration, disabled: false }],
      CanEmployeeAddAbsences: [{ value: this._holidaySettingsData.CanEmployeeAddAbsences, disabled: false }],
      CanEmployeeViewAbsenceHistory: [{ value: this._holidaySettingsData.CanEmployeeViewAbsenceHistory, disabled: false }],
      CanEmployeeAddHolidays: [{ value: this._holidaySettingsData.CanEmployeeAddHolidays, disabled: false }],
      IsExcessHolidayAllowed: [{ value: this._holidaySettingsData.IsExcessHolidayAllowed, disabled: false }],
      FiscalStartDate: [{ value: fStartDate, disabled: false }, [Validators.required]],
      FiscalEndDate: [{ value: fEndDate, disabled: true }, [Validators.required]],
      AllowCarryForwardHolidays: [{ value: this._holidaySettingsData.AllowCarryForwardHolidays, disabled: false }],

      AllowCarryForwardExpDays: [{ value: this._holidaySettingsData.AllowCarryForwardExpDays, disabled: false }],
      AllowMaxCarryForwardDays: [{ value: this._holidaySettingsData.AllowMaxCarryForwardDays, disabled: false }],
      AllowMaxCarryForwardHours: [{ value: this._holidaySettingsData.AllowMaxCarryForwardHours, disabled: false }],

      MaxCarryForwardDays: [{ value: this._holidaySettingsData.MaxCarryForwardDays, disabled: false }],
      MaxCarryForwardHours: [{ value: this._holidaySettingsData.MaxCarryForwardHours, disabled: false }],
      CarryForwardExpDays: [{ value: this._holidaySettingsData.CarryForwardExpDays, disabled: false }],

    });
  }

  checkLengthMaxCarryForwardDays() {
    if (this._holidaySettingsForm.value.AllowMaxCarryForwardDays && (this._holidaySettingsForm.get('MaxCarryForwardDays').value > 365 || this._holidaySettingsForm.get('MaxCarryForwardDays').value == '' || this._holidaySettingsForm.get('MaxCarryForwardDays').value == null || this._holidaySettingsForm.get('MaxCarryForwardDays').value < 0)) {
        return true;
      } else {
        return false;
      }
  }
  checkLengthMaxCarryForwardHours() {
    if (this._holidaySettingsForm.value.AllowMaxCarryForwardHours && (this._holidaySettingsForm.get('MaxCarryForwardHours').value > 3650 || this._holidaySettingsForm.get('MaxCarryForwardHours').value == '' || this._holidaySettingsForm.get('MaxCarryForwardHours').value == null || this._holidaySettingsForm.get('MaxCarryForwardHours').value < 0)) {
        return true;
      } else {
        return false;
      }
  }
  checkLengthMaxCarryForwardExpDays() {
    if (this._holidaySettingsForm.value.AllowCarryForwardExpDays && (this._holidaySettingsForm.get('CarryForwardExpDays').value > 365 || this._holidaySettingsForm.get('CarryForwardExpDays').value == '' || this._holidaySettingsForm.get('CarryForwardExpDays').value == null || this._holidaySettingsForm.get('CarryForwardExpDays').value < 0)) {
        return true;
      } else {
        return false;
      }
  }
  checkCriteria() {
    if (this._holidaySettingsForm.value.AllowCarryForwardExpDays) {
      if (this._holidaySettingsForm.value.AllowMaxCarryForwardDays || this._holidaySettingsForm.value.AllowMaxCarryForwardHours) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  onHolidaySettingsFormSubmit(e) {
    this._formStatus = true;
    this._changeDetector.markForCheck();
    if (this._holidaySettingsForm.valid && !this.checkLengthMaxCarryForwardDays() && !this.checkLengthMaxCarryForwardHours() && !this.checkLengthMaxCarryForwardExpDays() && !this.checkCriteria()) {
      let startcurrent = new Date();
      startcurrent.setDate(1);
      startcurrent.setMonth(this._holidaySettingsForm.value.FiscalStartDate - 1);
      let fStart = startcurrent;

      let endcurrent = new Date();
      let fEnd = new Date(startcurrent.getFullYear() + 1, startcurrent.getMonth(), 0, 23, 59, 59);
      this._holidaySettingsForm.value.FiscalStartDate = fStart.toISOString();
      this._holidaySettingsForm.value.FiscalEndDate = fEnd.toISOString();

      if (!this._holidaySettingsForm.value.AllowCarryForwardExpDays) {
        this._holidaySettingsForm.value.CarryForwardExpDays = null;
      }
      if (!this._holidaySettingsForm.value.AllowMaxCarryForwardDays) {
        this._holidaySettingsForm.value.MaxCarryForwardDays = null;
      }
      if (!this._holidaySettingsForm.value.AllowMaxCarryForwardHours) {
        this._holidaySettingsForm.value.MaxCarryForwardHours = null;
      }

      let _holidaySettingsToSave: EmployeeSettings = <EmployeeSettings>this._holidaySettingsForm.value;
      _holidaySettingsToSave = Object.assign({}, this._holidaySettingsData, _holidaySettingsToSave);

      this._submitHolidaySettings.emit(_holidaySettingsToSave);
    }
  }
  changeHour(e) {
    this._lunchDuration = e * 60;
  }

  onChangeCarryForwardHolidays(status) {
    this._holidaySettingsData.AllowCarryForwardHolidays = status;
    if (!status) {
      this._holidaySettingsForm.value.AllowCarryForwardExpDays = status;
      this._holidaySettingsForm.value.AllowMaxCarryForwardDays = status;
      this._holidaySettingsForm.value.AllowMaxCarryForwardHours = status;
      this._changeDetector.markForCheck();
    }

  }
  onChangeCarryForwardDays(status) {
    this._holidaySettingsData.AllowMaxCarryForwardDays = status;
    this._formStatus = false;
    this._changeDetector.markForCheck();

  }
  onChangeCarryForwardHours(status) {
    this._holidaySettingsData.AllowMaxCarryForwardHours = status;
    this._formStatus = false;
    this._changeDetector.markForCheck();
  }
  onChangeCarryForwardExpDays(status) {
    this._holidaySettingsData.AllowCarryForwardExpDays = status;
    this._formStatus = false;
    this._changeDetector.markForCheck();
  }


  public gotoBack(e) {
    this._location.back();
  }
  // End of Private Methods

}
