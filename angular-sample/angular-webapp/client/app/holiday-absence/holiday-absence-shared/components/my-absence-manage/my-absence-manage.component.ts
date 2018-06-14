import { AeLoaderType } from '../../../../atlas-elements/common/ae-loader-type.enum';
import { MessageType } from '../../../../atlas-elements/common/ae-message.enum';
import { HolidayAbsenceDataService } from '../../../services/holiday-absence-data.service';
import { AeSelectEvent } from '../../../../atlas-elements/common/ae-select.event';
import { LoadAbsenceTypeAction } from '../../../../shared/actions/company.actions';
import { StringHelper } from '../../../../shared/helpers/string-helper';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { Subscription } from 'rxjs/Rx';
import { AeInputType, MinMaxUsage } from '../../../../atlas-elements/common/ae-input-type.enum';
import { isNullOrUndefined } from 'util';
import { EnumHelper } from '../../../../shared/helpers/enum-helper';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { AbsenceType, EmployeeSettings, HolidayUnitType, FiscalYear } from '../../../../shared/models/company.models';
import {
  MyAbsenceDetailVM
  , MyAbsenceType
  , MyAbsenceVM
  , OperationModes
  , EmployeeConfig
  , FiscalYearSummary
  , MyAbsence
  , MyAbsenceDetail
  , HalfDayType
  , WorkingDayValidationModel
  , FiscalYearSummaryModel
} from '../../../models/holiday-absence.model';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { BaseComponent } from '../../../../shared/base-component';
import * as fromRoot from '../../../../shared/reducers';
import * as Immutable from 'immutable';
import {
  extractHolidayUnitTypes
  , mapAbsenceTypesToAeSelectItems
  , mapAbsenceSubtypesToAeSelectItems
  , extractWorkingDays
  , mapWorkingDaysToAbsenceDetails
  , getAbsenceSubtypes
  , validateSelectedDates
  , getFYSummary
  , getAbsenceStatusIdByName
  , extractMyAbsenceVM
  , extractMyAbsencefromVM
  , mergeMyAbsenceEntity
  , extractDaysToValidate
  , extractSummary
  , showCompleteSnackbarMessage
  , showInProgressSnackbarMessage
} from '../../../common/extract-helpers';
import { HolidayAbsenceValidationService } from '../../../services/holiday-absence-validation.service';
import {
  LoadFiscalYearDataAction
  , AddEmployeeAbsenceAction
  , UpdateEmployeeAbsenceAction
  , LoadFiscalYearDataCompleteAction
} from '../../../actions/holiday-absence.actions';
import { emptyGuid } from '../../../../shared/app.constants';
import { AbsenceStatus, AbsenceStatusCode } from '../../../../shared/models/lookup.models';
import { AbsenceStatusLoadAction } from '../../../../shared/actions/lookup.actions';
import {
  minValueValidator
  , dateRangeValidator
  , maxDurationValueValidator
  , toggleRequiredValidator
} from '../../../common/holiday-absence.validators';
import { Observable } from 'rxjs/Observable';
import { ObjectHelper } from '../../../../shared/helpers/object-helper';
import { MessengerService } from '../../../../shared/services/messenger.service';
import { isInteger } from '../../../../shared/util';
import { DateTimeHelper } from '../../../../shared/helpers/datetime-helper';
import { LoadSelectedEmployeeSummaryAction } from '../../../actions/holiday-absence-requests.actions';

type ValidationModel = { HasError: boolean, Message: string; };

@Component({
  selector: 'my-absence-manage',
  templateUrl: './my-absence-manage.component.html',
  styleUrls: ['./my-absence-manage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class MyAbsenceManageComponent extends BaseComponent implements OnInit {
  // Private field declarations
  private _myAbsenceForm: FormGroup;
  private _myAbsenceVM: MyAbsenceVM;
  private _unitTypes: Immutable.List<AeSelectItem<number>>;
  private _numberType: AeInputType;
  private _operationMode: OperationModes = OperationModes.Add;
  private _absenceTypeList: Array<AbsenceType> = [];
  private _absenceTypes: Immutable.List<AeSelectItem<string>> = Immutable.List([]);
  private _absenceSubtypes: Immutable.List<AeSelectItem<string>>;
  private _showAMPM: boolean = false;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _employeeSettings: EmployeeSettings;
  private _messageType: MessageType;
  private _switchTextRight: AeClassStyle = AeClassStyle.TextLeft;
  private _fiscalYears: Array<FiscalYear> = [];
  private _employeeConfig: EmployeeConfig;
  private _holidaySummaryList: Array<FiscalYearSummary> = [];
  private _isApprove: boolean = false;
  private _fiscalYearSummary: FiscalYearSummary;
  private _validationVM: ValidationModel;
  private _isExeededHoliday: boolean = false;
  private _absenceStatuses: AbsenceStatus[] = [];
  private _myAbsence: MyAbsence;
  private _minDate: Date = null;
  private _isOngoingEdit: boolean = false;
  private _loading: boolean;
  private _loaderType: AeLoaderType = AeLoaderType.Bars;
  private _selectedFYear: FiscalYear;
  private _isOneStepProcess: boolean = false;
  private _approvedBy: string;
  private _fullName: string;
  private _saveBtnText: string;
  private _lunchDuration: number = 0;
  private _isFromDateValid: boolean = false;
  private _isToDateValid: boolean = false;

  // End of private field declarations

  // Public field declarations


  @Input('loading')
  get loading() {
    return this._loading;
  }
  set loading(val: boolean) {
    this._loading = val;
  }

  @Input('operationMode')
  set operationMode(val: OperationModes) {
    this._operationMode = val;
  }
  get operationMode() {
    return this._operationMode;
  }
  

  @Input('myabsenceVM')
  set myAbsenceVM(val: MyAbsenceVM) {
    this._myAbsenceVM = val;
    this._processVM();
  }
  get myAbsenceVM() {
    return this._myAbsenceVM;
  }
  

  @Input('employeeConfig')
  set employeeConfig(val: EmployeeConfig) {
    this._employeeConfig = val;
    if (!isNullOrUndefined(this._employeeConfig)) {
      this._fullName = `${this._employeeConfig.FirstName} ${this._employeeConfig.Surname}`;
    }
  }
  get employeeConfig() {
    return this._employeeConfig;
  }
 

  @Input('fiscalYears')
  set fiscalYears(val: Array<FiscalYear>) {
    this._fiscalYears = val;
    if (!isNullOrUndefined(val)) {
      this._processFiscalYears();
    }
  }
  get fiscalYears() {
    return this._fiscalYears;
  }
  

  @Input('employeeSettings')
  set employeeSettings(val: EmployeeSettings) {
    this._employeeSettings = val;
    if (!isNullOrUndefined(this._employeeSettings)) {
      this._lunchDuration = this._employeeSettings.LunchDuration;
    }
  }
  get employeeSettings() {
    return this._employeeSettings;
  }
  

  @Input('absenceStatuses')
  set absenceStatuses(val: AbsenceStatus[]) {
    this._absenceStatuses = val;
  }
  get absenceStatuses() {
    return this._absenceStatuses;
  }
  
  @Input('approve')
  get IsApprove() {
    return this._isApprove;
  }
  set IsApprove(val: boolean) {
    this._isApprove = val;
  }

  @Input('onestep')
  get IsOneStepProcess() {
    return this._isOneStepProcess;
  }
  set IsOneStepProcess(val: boolean) {
    this._isOneStepProcess = val;
  }

  @Input('approvedBy')
  get ApprovedBy() {
    return this._approvedBy;
  }
  set ApprovedBy(val: string) {
    this._approvedBy = val;
  }

  @Input('absenceTypes')
  set absenceTypes(val: AbsenceType[]) {
    this._absenceTypeList = val;

    if (!isNullOrUndefined(val)) {
      this._absenceTypes = mapAbsenceTypesToAeSelectItems(val);
    }
  }
  get absenceTypes() {
    return this._absenceTypeList;
  }
 

  @Input('fiscalYearSummary')
  set fiscalYearSummary(val: FiscalYearSummary) {
    this._fiscalYearSummary = val;
    if (!isNullOrUndefined(val) &&
      !isNullOrUndefined(this._myAbsenceVM) &&
      this._myAbsenceForm) {
      this._validateExcessHolidays();
    }
  }
  get fiscalYearSummary() {
    return this._fiscalYearSummary;
  }
  

  @Input('myAbsence')
  set myAbsence(val: MyAbsence) {
    this._myAbsence = val;
    this._processVM();
  }
  get myAbsence() {
    return this._myAbsence;
  }
  
  get isOngoingEdit() {
    return this._isOngoingEdit;
  }
  get fullName() {
    return this._fullName;
  }
  get myAbsenceForm() {
    return this._myAbsenceForm;
  }
  get absenceSubtypes() {
    return this._absenceSubtypes;
  }
  get unitTypes() {
    return this._unitTypes;
  }
  get messageType() {
    return this._messageType;
  }
  get lunchDuration() {
    return this._lunchDuration;
  }
  get isExeededHoliday() {
    return this._isExeededHoliday;
  }
  get switchTextRight() {
    return this._switchTextRight;
  }
  get lightClass() {
    return this._lightClass;
  }
  get saveBtnText() {
    return this._saveBtnText;
  }
  get loaderType() {
    return this._loaderType;
  }
  get absenceTypesImm() {
    return this._absenceTypes;
  }
  // End of public field declarations

  // Output property declarations
  @Output()
  aeOnClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  summaryChange: EventEmitter<FiscalYearSummaryModel> = new EventEmitter<FiscalYearSummaryModel>();

  @Output()
  pullFiscalYearSummary: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  formSubmit: EventEmitter<MyAbsenceVM> = new EventEmitter<MyAbsenceVM>();
  // End of output propery declarations
  // constructor starts
  /**
   * Creates an instance of MyAbsenceManageComponent.
   * @param {LocaleService} _localeService
   * @param {TranslationService} _translationService
   * @param {ChangeDetectorRef} _cdRef
   * @param {Store<fromRoot.State>} _store
   * @param {ClaimsHelperService} _claimsHelper
   *
   * @memberOf MyAbsenceManageComponent
   */
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _fb: FormBuilder
    , private _dataService: HolidayAbsenceDataService
    , private _validationService: HolidayAbsenceValidationService
    , private _messenger: MessengerService) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Private methods
  private _processVM() {
    if (!isNullOrUndefined(this._myAbsenceVM) &&
      this._operationMode === OperationModes.Update &&
      StringHelper.isNullOrUndefinedOrEmpty(this._myAbsenceVM.Id) &&
      !this.loading) {
      this.loading = true;
    } else if (!isNullOrUndefined(this._myAbsenceVM) &&
      this._operationMode === OperationModes.Update &&
      !StringHelper.isNullOrUndefinedOrEmpty(this._myAbsenceVM.Id) &&
      !isNullOrUndefined(this._myAbsence) &&
      !StringHelper.isNullOrUndefinedOrEmpty(this._myAbsence.Id) &&
      this.loading) {
      if (this.isAbsenceMode()) {
        this._handleAbsenceUpdate();
      }
      this._myAbsenceForm = null;
      this._initForm();
      this.loading = false;
    } else if (!isNullOrUndefined(this._myAbsenceVM) &&
      this._operationMode === OperationModes.Add) {
      this._myAbsenceForm = null;
      this._initForm();
    }
  }

  private _processFiscalYears() {
    if (!isNullOrUndefined(this.fiscalYears) && this.fiscalYears.length > 0) {
      this._selectedFYear = this.fiscalYears.filter(c => c.Order === 2)[0];
    }
  }

  private _getSubmitBtnText() {
    if (this.isEditMode() && this.IsApprove) {
      return 'BUTTONS.APPROVE';
    } else if (this.isEditMode()) {
      return 'BUTTONS.RESUBMIT';
    } else {
      return 'BUTTONS.SUBMIT';
    }
  }

  private _onMyAbsenceFormClosed() {
    this.aeOnClose.emit(true);
  }

  private _isStartDateValid(status) {
    this._isFromDateValid = status;
  }

  private _onStartDateSelect(e) {
    if (this._isFromDateValid) {
      if (this._isSickLeave() &&
        this._myAbsenceVM.Isongoing) {
        this._myAbsenceForm.get('EndDate').setValue(null);
      } else if (isNullOrUndefined(this._myAbsenceVM.EndDate)
        || (this._myAbsenceVM.EndDate < this._myAbsenceVM.StartDate)) {
        this._myAbsenceForm.get('EndDate').setValue(DateTimeHelper.getDatePart(this._myAbsenceVM.StartDate));
      }

      this._handleDateChange();
    }
  }

  private _handleDateChange() {
    this._clearValidations();

    let startDate = DateTimeHelper.getDatePart(this._myAbsenceVM.StartDate);
    let endDate = DateTimeHelper.getDatePart(this._myAbsenceVM.EndDate);

    if (isNullOrUndefined(startDate)) {
      return;
    }

    if (this._isSickLeave() &&
      this._myAbsenceVM.Isongoing &&
      (isNullOrUndefined(endDate))) {
      endDate = startDate;
      this._myAbsenceForm.get('Duration').setValue(0);
      this._myAbsenceForm.get('NoOfUnits').setValue(0);
      this._myAbsenceForm.get('HalfDayType').setValue(null);
      this._isExeededHoliday = false;
    } else if (this._isSickLeave() &&
      !isNullOrUndefined(startDate) &&
      !isNullOrUndefined(endDate)) {
      this._myAbsenceForm.get('Isongoing').setValue(false);
    }

    let selectionValidation = validateSelectedDates(startDate
      , endDate
      , this._fiscalYears
      , this.isHolidayMode());

    if (selectionValidation.IsValid) {
      this._isExeededHoliday = false;
      this._selectedFYear = JSON.parse(JSON.stringify(selectionValidation.Year)) as FiscalYear;
      if (this.isHolidayMode()) {
        if (this._employeeConfig.Id.toLowerCase() === this._claimsHelper.getEmpIdOrDefault().toLowerCase()) {
          this._store.dispatch(new LoadFiscalYearDataAction({
            refreshSummary: false,
            forceRefresh: false,
            startDate: this._selectedFYear.StartDate,
            endDate: this._selectedFYear.EndDate,
            employeeId: this._employeeConfig.Id
          }));
        } else {
          this._store.dispatch(new LoadSelectedEmployeeSummaryAction({
            refreshSummary: false,
            forceRefresh: false,
            startDate: this._selectedFYear.StartDate,
            endDate: this._selectedFYear.EndDate,
            employeeId: this._employeeConfig.Id
          }));
        }
      }
      this._processWorkingDays(startDate, endDate);
    } else {
      this._myAbsenceForm.get('Duration').setValue(0);
      this._myAbsenceForm.get('NoOfUnits').setValue(0);
      this._myAbsenceForm.get('HalfDayType').setValue(null);
      this._validationVM = { HasError: true, Message: selectionValidation.Message };
      this._cdRef.markForCheck();
    }
  }

  private _handleAbsenceUpdate() {
    let startDate = DateTimeHelper.getDatePartfromString(this._myAbsence.StartDate);
    let endDate = DateTimeHelper.getDatePartfromString(this._myAbsence.EndDate);

    if (isNullOrUndefined(endDate) && this._myAbsence.Isongoing) {
      if (!this._myAbsence.IsHour) {
        let todayDate = DateTimeHelper.getDatePart(new Date());
        if (startDate <= todayDate) {
          this._myAbsenceVM.EndDate = new Date();
          this._minDate = new Date();
        } else {
          this._myAbsenceVM.EndDate = this._myAbsenceVM.StartDate;
          this._minDate = startDate;
        }
      }
    }

    //added null check for this._myAbsence.AbsencesType because suddenly null exception thrown while debugging
    this._myAbsenceVM.Isongoing = (this.isEditMode() && (isNullOrUndefined(this._myAbsenceVM.EndDate))) ?
      true :
      this._myAbsenceVM.Isongoing;
    if (this.isDayMode() &&
      this.isAbsenceMode() &&
      !isNullOrUndefined(this._myAbsence.AbsencesType) &&
      this._myAbsence.AbsencesType.TypeName === 'Sick' &&
      this._myAbsenceVM.Isongoing) {
      this._isOngoingEdit = true;
    } else {
      this._isOngoingEdit = false;
    }
    if (this.isAbsenceMode() &&
      !StringHelper.isNullOrUndefinedOrEmpty(this._myAbsence.AbsenTypeId)) {
      let subtypes = getAbsenceSubtypes(this._absenceTypeList, this._myAbsence.AbsenTypeId);
      this._absenceSubtypes = mapAbsenceSubtypesToAeSelectItems(subtypes);
    }
  }

  private _processWorkingDays(startDate, endDate) {
    this._loading = true;
    this._dataService.getWorkingDays(startDate
      , endDate
      , this._employeeConfig.Id)
      .subscribe((workingDays) => {
        this._loading = false;

        if (isNullOrUndefined(workingDays) || workingDays.length <= 0) {
          this._validationVM = {
            HasError: true,
            Message: 'The selected date range is either public holiday, non working day or both.'
          };
          this._myAbsenceForm.get('Duration').setValue(0);
          this._myAbsenceForm.get('NoOfUnits').setValue(0);
          this._myAbsenceForm.get('HalfDayType').setValue(null);
          this._cdRef.markForCheck();
          return;
        }

        if (this.isDayMode()) {
          this._myAbsenceForm.get('Duration').setValue(workingDays.length);
          this._myAbsenceForm.get('NoOfUnits').setValue(workingDays.length);
          this._myAbsenceForm.get('HalfDayType').setValue(null);
        }

        if (this.isHourMode()) {
          let myabsenceDetails: Array<MyAbsenceDetail>;
          if (this._operationMode == OperationModes.Update &&
            this._myAbsence.HolidayUnitType == HolidayUnitType.Hours &&
            !isNullOrUndefined(this._myAbsence) &&
            !isNullOrUndefined(this._myAbsence.MyAbsenceDetails)) {
            myabsenceDetails = this._myAbsence.MyAbsenceDetails
              .filter(c => isNullOrUndefined(c['IsDeleted']) ||
                (!isNullOrUndefined(c['IsDeleted']) && c['IsDeleted'] == false));
          }
          this._myAbsenceVM.MyAbsenceDetails = mapWorkingDaysToAbsenceDetails(workingDays, myabsenceDetails);
          this._myAbsenceVM.MyAbsenceDetails = this._myAbsenceVM.MyAbsenceDetails.map((detail) => {
            if (this.isApproveMode()) {
              detail.LunchDuration = this._employeeSettings.LunchDuration;
            }
            return detail;
          });
          this._myAbsenceVM.MyAbsenceDetails = this._myAbsenceVM.MyAbsenceDetails.sort(function (a, b) {
            let c: any = new Date(a.Date);
            let d: any = new Date(b.Date);
            return c - d;
          });
          let totalDuration = this._getTotalDuration();
          this._myAbsenceForm.get('Duration').setValue(totalDuration);
          this._myAbsenceForm.get('NoOfUnits').setValue(totalDuration);
          this._myAbsenceForm.get('HalfDayType').setValue(null);
          this._initMyAbsenceDetailsFormGroup();
        }

        if (this._hasExtraHolidayValidation()) {
          this._validationVM = {
            HasError: true,
            Message: `Duration should not be greater than 1 day when absence type is "Extra Holiday" and sub type is "Birthday"`
          };
          this._cdRef.markForCheck();
          return;
        }


        if (this.isHolidayMode()) {
          this._validateExcessHolidays();
        }

        this._cdRef.markForCheck();
      });
  }

  private _showValidationMessage(message: string) {
    return message;
  }

  private _validateExcessHolidays() {
    if (isNullOrUndefined(this._fiscalYearSummary) ||
      isNullOrUndefined(this._myAbsenceVM) ||
      this._myAbsenceVM.Type == MyAbsenceType.Absence) {
      return;
    }
    let unitsToApply: number = this._myAbsenceVM.NoOfUnits;
    let availableUnits = 0;
    let availableHolidayUnitType = HolidayUnitType.Days;
    if (this.isDayMode()) {
      availableUnits = this._fiscalYearSummary.TotalAvailableHolidaysDays;
      availableHolidayUnitType = HolidayUnitType.Days;
    }

    if (this.isHourMode()) {
      availableUnits = this._fiscalYearSummary.TotalAvailableHolidaysInHours;
      availableHolidayUnitType = HolidayUnitType.Hours;
    }

    if (this.operationMode == OperationModes.Update && this._hasNoofUnits()) {
      availableUnits = this._modifyAvailableUnits(availableUnits, availableHolidayUnitType);
    }
    this._validationVM = {
      HasError: false,
      Message: ''
    };
    if (this.isExcessHolidaysAllowed()) {
      if (this._getOverbookedHoliday() > 0 || (availableUnits < unitsToApply)) {
        this._isExeededHoliday = true;
        this._myAbsenceForm.get('AllowExcessHolidays').setValue(false);
      } else if (this._getOverbookedHoliday() === 0 && (availableUnits >= unitsToApply)) {
        this._isExeededHoliday = false;
        this._myAbsenceForm.get('AllowExcessHolidays').setValue(true);
      }
    } else if (availableUnits < unitsToApply) {
      this._isExeededHoliday = true;
      this._validationVM = { HasError: true, Message: 'You are exceeding the entitlement limit.' };
    }
    this._configureValidations();
  }

  private _hasExtraHolidayValidation() {
    if (!isNullOrUndefined(this._myAbsenceVM) &&
      this._myAbsenceVM.Type == MyAbsenceType.Absence &&
      ((this._myAbsenceVM.UnitType == HolidayUnitType.Days && this._myAbsenceVM.Duration > 1) ||
        (this._myAbsenceVM.UnitType == HolidayUnitType.Hours &&
          !isNullOrUndefined(this._myAbsenceVM.MyAbsenceDetails) &&
          this._myAbsenceVM.MyAbsenceDetails.length > 1)) &&
      !StringHelper.isNullOrUndefinedOrEmpty(this._myAbsenceVM.AbsenceTypeId) &&
      !StringHelper.isNullOrUndefinedOrEmpty(this._myAbsenceVM.AbsenceSubtypeId)) {
      let absenceType = this._absenceTypeList.filter((type) => type.Id === this._myAbsenceVM.AbsenceTypeId)[0];
      let absenceSubtype = this._absenceSubtypes.filter((type) => type.Value === this._myAbsenceVM.AbsenceSubtypeId).toArray()[0];
      if (!isNullOrUndefined(absenceType) &&
        !isNullOrUndefined(absenceSubtype) &&
        absenceType.TypeName.toLowerCase() === 'extra holiday' &&
        absenceSubtype.Text.toLowerCase() === 'birthday') {
        return true;
      }
    }
    return false;
  }

  private _modifyAvailableUnits(availableUnits: number, availableUnitType: HolidayUnitType) {
    let total = 0;
    if (this.isEditMode() && this._hasNoofUnits()) {
      if (this._myAbsenceVM.UnitType === availableUnitType) {
        total = availableUnits + this._myAbsence.NoOfUnits;
      } else if (this._myAbsenceVM.UnitType !== availableUnitType) {
        if (this._myAbsenceVM.UnitType === HolidayUnitType.Days &&
          availableUnitType === HolidayUnitType.Hours) {
          total = availableUnits + (+ this._myAbsence.NoOfUnits * this._getMaxHoursPerDay());
        } else if (this._myAbsenceVM.UnitType === HolidayUnitType.Hours &&
          availableUnitType === HolidayUnitType.Days) {
          total = availableUnits + (((+ this._myAbsence.NoOfUnits / this._getMaxHoursPerDay()) * 100) / 100);
        }
      }
    }
    return total;
  }

  private _hasNoofUnits() {
    return !isNullOrUndefined(this._myAbsenceVM) &&
      !isNullOrUndefined(this._myAbsenceVM.NoOfUnits) &&
      this._myAbsenceVM.NoOfUnits > 0;
  }

  private _getTotalNoOfUnits() {
    let totalCount: number;
    this._myAbsenceVM.MyAbsenceDetails.reduce((prev, curr, index, source) => {
      if (isNullOrUndefined(prev)) {
        totalCount = 0;
      }
      totalCount = totalCount + (Math.round((curr.Hours - curr.RemainingHours) * 100) / 100);
      return curr;
    }, null);
    return totalCount;
  }


  private _getTotalDuration() {
    let totalCount: number;
    this._myAbsenceVM.MyAbsenceDetails.reduce((prev, curr, index, source) => {
      if (isNullOrUndefined(prev)) {
        totalCount = 0;
      }
      let availableHours = (Math.round((curr.Hours) * 100) / 100); // - curr.RemainingHours
      totalCount = totalCount + (availableHours > 0 ? availableHours : 0);
      return curr;
    }, null);
    return totalCount;
  }

  private _checkExceedingDay() {
    if (this.isHolidayMode()) {
      let availableUnits = this._fiscalYearSummary.TotalAvailableHolidaysDays;
      if (this.isEditMode() && !isNullOrUndefined(this._myAbsenceVM.NoOfUnits) && this._myAbsenceVM.NoOfUnits > 0) {
        availableUnits = availableUnits + this._myAbsenceVM.NoOfUnits;
      }

      if (!isNullOrUndefined(this._myAbsenceVM) &&
        !isNullOrUndefined(this._myAbsenceVM.NoOfUnits) &&
        this._myAbsenceVM.NoOfUnits > 0 &&
        !isInteger(this._myAbsenceVM.NoOfUnits)) {
        if (isNullOrUndefined(this._myAbsenceVM.HalfDayType)) {
          this._myAbsenceVM.HalfDayType = HalfDayType.AM;
        }
      } else {
        this._myAbsenceVM.HalfDayType = null;
      }

      if (this._employeeSettings.IsExcessHolidayAllowed) {
        if (this._getOverbookedHoliday() > 0 ||
          availableUnits < this._myAbsenceVM.NoOfUnits) {
          this._isExeededHoliday = true;
          this._cdRef.markForCheck();
        } else {
          this._isExeededHoliday = false;
          this._clearValidations();
        }
      } else if (availableUnits < this._myAbsenceVM.NoOfUnits) {
        this._isExeededHoliday = false;
        this._validationVM = {
          HasError: true,
          Message: 'You are exceeding the entitlement limit.'
        };
        this._cdRef.markForCheck();
      }
    }
  }

  private _isSickLeave(): boolean {
    if (!isNullOrUndefined(this._myAbsenceVM) &&
      this._myAbsenceVM.Type === MyAbsenceType.Absence &&
      !StringHelper.isNullOrUndefinedOrEmpty(this._myAbsenceVM.AbsenceTypeId)) {
      let filteredTypes = this._absenceTypeList.filter((type) => type.TypeName.toLocaleLowerCase() === 'sick');
      if (!isNullOrUndefined(filteredTypes) && filteredTypes.length > 0) {
        return filteredTypes[0].Id === this._myAbsenceVM.AbsenceTypeId;
      }
    }
    return false;
  }


  private _initMyAbsenceDetailsFormGroup() {
    this._myAbsenceForm.controls['MyAbsenceDetails'] = this._fb.array([]);
    let formArray = <FormArray>this._myAbsenceForm.controls['MyAbsenceDetails'];
    this._myAbsenceVM.MyAbsenceDetails.forEach(c => {
      formArray.push(this._initMyAbsenceDetails(c));
    });
    for (let formGroupIndex in formArray.controls) {
      let formGroup = <FormGroup>formArray.controls[formGroupIndex];
      for (let name in formGroup.controls) {
        let element = formGroup.controls[name];
        element.valueChanges.subscribe((value) => {
          this._myAbsenceVM.MyAbsenceDetails[formGroupIndex][name] = value;
          if (name == 'CanExcludeLunchDuration') {
            if (StringHelper.coerceBooleanProperty(value)) {
              (<FormArray>this._myAbsenceForm.controls['MyAbsenceDetails'])
                .at(parseInt(formGroupIndex))
                .get('LunchDuration').setValue(this._employeeSettings.LunchDuration);
            } else {
              (<FormArray>this._myAbsenceForm.controls['MyAbsenceDetails'])
                .at(parseInt(formGroupIndex))
                .get('LunchDuration').setValue(0);
            }
          }
          let total = this._getTotalDuration();
          this._myAbsenceForm.get('NoOfUnits').setValue(total);
          this._myAbsenceForm.get('Duration').setValue(total);
        });
      }
    }
  }


  private _getMyAbsenceTitleText(): string {
    if (!isNullOrUndefined(this._myAbsenceVM) && !isNullOrUndefined(this._myAbsenceVM.Type)) {
      return `${MyAbsenceType[this._myAbsenceVM.Type].toString().toLowerCase()}`;
    } else {
      return '';
    }
  }


  private _getMaxHoursPerDay() {
    let count = 0;
    if (!isNullOrUndefined(this._employeeSettings)) {
      count = DateTimeHelper.getDurationInHours(this._employeeSettings.StartTimeHours, this._employeeSettings.EndTimeHours);
    }
    return count;
  }



  private _getOverbookedHoliday(): number {
    if (!isNullOrUndefined(this._fiscalYearSummary)) {
      return this._fiscalYearSummary.OverBookedHoliday;
    }
    return 0;
  }

  private _hasStatus() {
    return !isNullOrUndefined(this._myAbsence) && !isNullOrUndefined(this._myAbsence.StatusId);
  }

  private _isRequestforChange() {
    if (this._hasStatus()) {
      let absenceStatus = this._absenceStatuses.filter(c => c.Id == this._myAbsence.StatusId)[0];
      return absenceStatus.Code == AbsenceStatusCode.Approved || absenceStatus.Code == AbsenceStatusCode.Requestforchange;
    }
  }

  private _isAddOperationMode(): boolean {
    return this.operationMode == OperationModes.Add;
  }


  private _canShowNoWorkingDaysMessage() {
    return !isNullOrUndefined(this._myAbsenceVM)
      && !isNullOrUndefined(this._myAbsenceVM.MyAbsenceDetails)
      && this._myAbsenceVM.MyAbsenceDetails.length === 0;
  }



  private _initMyAbsenceDetails(myAbsenceDetail: MyAbsenceDetailVM) {
    return this._fb.group({
      Id: [{ value: myAbsenceDetail.Id, disabled: false }],
      Date: [{ value: myAbsenceDetail.Date, disabled: false }],
      FromHour: [{ value: myAbsenceDetail.FromHour, disabled: false }],
      ToHour: [{ value: myAbsenceDetail.ToHour, disabled: false }],
      Hours: [{ value: myAbsenceDetail.Hours, disabled: false }],
      RemainingHours: [{ value: myAbsenceDetail.RemainingHours, disabled: false }],
      StartTimeHours: [{ value: myAbsenceDetail.StartTimeHours, disabled: false }],
      EndTimeHours: [{ value: myAbsenceDetail.EndTimeHours, disabled: false }],
      HasError: [{ value: myAbsenceDetail.HasError, disabled: false }],
      Message: [{ value: myAbsenceDetail.Message, disabled: false }],
      IsAllApplied: [{ value: myAbsenceDetail.IsAllApplied, disabled: false }],
      CanExcludeLunchDuration: [{ value: myAbsenceDetail.CanExcludeLunchDuration, disabled: false }],
      LunchDuration: [{
        value: myAbsenceDetail.LunchDuration
        , disabled: false
      }]
    });
  }

  private _initForm(): void {
    this._myAbsenceForm = this._fb.group({
      UnitType: [{ value: this._myAbsenceVM.UnitType, disabled: false }],
      StartDate: [{ value: this._myAbsenceVM.StartDate, disabled: false }],
      EndDate: [{ value: this._myAbsenceVM.EndDate, disabled: false }],
      Duration: [{ value: this._myAbsenceVM.Duration, disabled: true }],
      NoOfUnits: [{ value: this._myAbsenceVM.NoOfUnits, disabled: false }],
      Reason: [{ value: this._myAbsenceVM.Reason, disabled: false }],
      Comment: [{ value: this._myAbsenceVM.Comment, disabled: false }],
      AbsenceTypeId: [{ value: this._myAbsenceVM.AbsenceTypeId, disabled: false }],
      AbsenceSubtypeId: [{ value: this._myAbsenceVM.AbsenceSubtypeId, disabled: false }],
      HalfDayType: [{ value: this._myAbsenceVM.HalfDayType, disabled: false }],
      AllowExcessHolidays: [{ value: this._myAbsenceVM.AllowExcessHolidays, disabled: false }],
      MyAbsenceDetails: this._fb.array([]),
      Isongoing: [{ value: this._myAbsenceVM.Isongoing, disabled: this.isEditMode() }]
    });

    this._configureValidations();

    if (!isNullOrUndefined(this._myAbsenceVM.MyAbsenceDetails) && this._myAbsenceVM.MyAbsenceDetails.length > 0) {
      this._initMyAbsenceDetailsFormGroup();
    }

    for (let name in this._myAbsenceForm.controls) {
      if (this._myAbsenceForm.controls.hasOwnProperty(name)) {

        let control = this._myAbsenceForm.controls[name];
        control.valueChanges.subscribe(v => {
          if (name === 'StartDate') {
            this._myAbsenceVM.StartDate = DateTimeHelper.getDatePart(v);
          } else if (name === 'EndDate') {
            this._myAbsenceVM.EndDate = DateTimeHelper.getDatePart(v);
          } else if (name === 'AllowExcessHolidays') {
            this._myAbsenceVM.AllowExcessHolidays = StringHelper.coerceBooleanProperty(v);
          } else if (name === 'NoOfUnits') {
            this._myAbsenceVM.NoOfUnits = parseFloat(v);
          } else if (name === 'Isongoing' && StringHelper.coerceBooleanProperty(v)) {
            this._myAbsenceVM[name] = StringHelper.coerceBooleanProperty(v);
            this._myAbsenceForm.get('EndDate').setValue(null);
            this._myAbsenceForm.get('NoOfUnits').setValue(0);
            this._myAbsenceForm.get('Duration').setValue(0);
            this._myAbsenceForm.get('HalfDayType').setValue(null);
          } else {
            this._myAbsenceVM[name] = v;
          }
        });
      }
    }
  }

  private _checkIsOngoing(): boolean {
    return (this.isEditMode() && (isNullOrUndefined(this._myAbsenceVM.EndDate))) ? true : this._myAbsenceVM.Isongoing;
  }


  private _clearValidations() {
    this._validationVM = { HasError: false, Message: '' };
    this._isExeededHoliday = false;
    this._cdRef.markForCheck();
  }

  private _handleUpdateMode() {
    if (!isNullOrUndefined(this._myAbsenceVM)) {
      this._myAbsenceForm = null;
      this._initForm();
    }

    let selectionValidation = validateSelectedDates(this._myAbsenceVM.StartDate
      , this._myAbsenceVM.EndDate
      , this._fiscalYears
      , this.isHolidayMode());

    if (selectionValidation.IsValid) {
      this._isExeededHoliday = false;
      this._selectedFYear = JSON.parse(JSON.stringify(selectionValidation.Year)) as FiscalYear;
    }
  }


  private _fieldHasRequiredError(fieldName: string): boolean {
    return !isNullOrUndefined(this._myAbsenceForm.get(fieldName)) &&
      this._myAbsenceForm.get(fieldName).hasError('required') &&
      !this._myAbsenceForm.get(fieldName).pristine;
  }

  private _fieldHasRangeError(): boolean {
    return this._myAbsenceForm.getError('validRange') === false &&
      !this._myAbsenceForm.pristine;
  }

  private _fieldHasMaxDurationError(): boolean {
    return this._myAbsenceForm.getError('validmaxDuration') === false &&
      !this._myAbsenceForm.pristine;
  }


  private _fieldHasMinValue(fieldName: string): boolean {
    return !isNullOrUndefined(this._myAbsenceForm.get(fieldName)) &&
      this._myAbsenceForm.get(fieldName).getError('validMinValue') === false &&
      !this._myAbsenceForm.get(fieldName).pristine;
  }

  private _getAbsencetypeText() {
    return `${this.isHolidayMode() ? 'Holiday' : 'Absence'}`;
  }

  private _configureValidations() {
    this._myAbsenceForm.clearValidators();
    let fieldsHasValidations = ['AbsenceTypeId', 'StartDate', 'EndDate', 'NoOfUnits', 'IsExcessHolidayAllowed'];
    fieldsHasValidations.forEach((name) => {
      let control = this._myAbsenceForm.get(name);
      if (!isNullOrUndefined(control)) {
        control.clearValidators();
      }
    });

    if (this.isHolidayMode()) {
      this._myAbsenceForm.get('StartDate').setValidators(Validators.required);
      this._myAbsenceForm.get('EndDate').setValidators(Validators.required);
      this._myAbsenceForm.get('NoOfUnits').setValidators([Validators.required, minValueValidator]);
      this._myAbsenceForm.setValidators([dateRangeValidator, maxDurationValueValidator]);

      if (this._isExeededHoliday) {
        this._myAbsenceForm.get('AllowExcessHolidays').setValidators(toggleRequiredValidator);
      }
    }

    if (this.isAbsenceMode()) {
      this._myAbsenceForm.get('StartDate').setValidators(Validators.required);
      if (!this._myAbsenceVM.Isongoing) {
        this._myAbsenceForm.get('AbsenceTypeId').setValidators(Validators.required);
        this._myAbsenceForm.get('EndDate').setValidators(Validators.required);
        this._myAbsenceForm.get('NoOfUnits').setValidators([Validators.required, minValueValidator]);
        this._myAbsenceForm.setValidators([dateRangeValidator, maxDurationValueValidator]);
      }

      if ((this._isOngoingEdit && this.isDayMode()) ||
        this.isHourMode() && this.isEditMode()) {
        this._myAbsenceForm.get('EndDate').setValidators(Validators.required);
        this._myAbsenceForm.setValidators(dateRangeValidator);
      }
    }
  }


  private _handleEditMode() {

  }
  // End of private methods

  // Public methods
  public saveMyAbsence() {
    if (!isNullOrUndefined(this._validationVM) &&
      this._validationVM.HasError) {
      return;
    }

    // If sick leave and selected end date same as applied date
    if (this._myAbsenceVM.Isongoing &&
      !isNullOrUndefined(this._myAbsenceVM.EndDate) &&
      this._myAbsenceVM.StartDate === this._myAbsenceVM.EndDate &&
      this._isSickLeave()) {
      this._myAbsenceVM.NoOfUnits = 1;
      this._myAbsenceVM.Duration = 1;
      this._myAbsenceVM.Isongoing = false;
      this._cdRef.markForCheck();
    }

    if (!this._myAbsenceForm.valid) {
      for (let name in this._myAbsenceForm.controls) {
        if (this._myAbsenceForm.controls.hasOwnProperty(name)) {
          let control = this._myAbsenceForm.controls[name];
          control.markAsDirty();
        }
      }
      return;
    }
    this._clearValidations();

    if (this.isHourMode()) {
      let invalidItems = this._myAbsenceVM.MyAbsenceDetails.filter(c => {
        let hourCount = Math.round(c.Hours * 100) / 100;
        if (hourCount <= 0) {
          return c;
        }
      });
      if (!isNullOrUndefined(invalidItems) &&
        invalidItems.length > 0) {
        return;
      }
    }

    let dateSelectionValidation = validateSelectedDates(this._myAbsenceVM.StartDate
      , this._myAbsenceVM.EndDate
      , this._fiscalYears
      , this.isHolidayMode());

    if (!dateSelectionValidation.IsValid) {
      this._validationVM = { HasError: true, Message: dateSelectionValidation.Message };
      this._cdRef.markForCheck();
      return;
    } else if (this._hasExtraHolidayValidation()) {
      this._validationVM = {
        HasError: true,
        Message: `Duration should not be greater than 1 day when absence type is "Extra Holiday" and sub type is "Birthday"`
      };
      this._cdRef.markForCheck();
      return;
    }

    let itemsToValidate: Array<WorkingDayValidationModel> = [];
    itemsToValidate = extractDaysToValidate(this._myAbsenceVM, (this.isEditMode() ? this._myAbsence : null));
    this._loading = true;
    this._dataService.validateMyAbsence(itemsToValidate, this._employeeConfig.Id, this._myAbsenceVM.Type).subscribe((result) => {
      if (!isNullOrUndefined(result) && result.length > 0) {
        if (this.isDayMode() || (this.isHourMode() && this._myAbsenceVM.Isongoing)) {
          this._validationVM = { HasError: result[0].HasError, Message: result[0].Message };
          this._cdRef.markForCheck();
        }

        if (this._validationVM.HasError) {
          this._loading = false;
          return;
        }

        if (this.isHourMode()) {
          this._validationVM = { HasError: false, Message: '' };
          this._myAbsenceVM.MyAbsenceDetails.forEach((item) => {
            let itemStartDate = DateTimeHelper.getDatePart(item.Date);
            let filteredMatches = result.filter((respItem) => {
              let respStartDate = DateTimeHelper.getDatePartfromString(respItem.StartDate);
              return itemStartDate.valueOf() === respStartDate.valueOf();
            });

            if (!isNullOrUndefined(filteredMatches) && filteredMatches.length > 0) {
              item.HasError = filteredMatches[0].HasError;
              item.Message = filteredMatches[0].Message;
            } else {
              item.HasError = false;
              item.Message = '';
            }
          });
          this._cdRef.markForCheck();
          // let rowsWithError = this._myAbsenceVM.MyAbsenceDetails.filter((item) => item.HasError);
          // if (!isNullOrUndefined(rowsWithError) && rowsWithError.length > 0) {
          //   this._loading = false;
          //   return;
          // }
        }
        this._loading = false;
        this.formSubmit.emit(this.myAbsenceVM);
      }
    });
  }


  public onMyAbsenceFormClosed() {
    this.aeOnClose.emit(true);
  }

  public isExcessHolidaysAllowed() {
    return !isNullOrUndefined(this._employeeSettings) && this._employeeSettings.IsExcessHolidayAllowed;
  }

  public toggleLunchDuration(e) {
    this.changeHour(null);
  }


  public showExcludedLunchDuration() {
    return this._isRequestforChange() && !this.IsApprove && !this.IsOneStepProcess;
  }

  public changeHour(e) {
    let totalCount: number = 0;
    this._myAbsenceVM.MyAbsenceDetails.forEach((absenceDetail, index) => {

      let maxHoursPerDay = DateTimeHelper.getDurationInHours(absenceDetail.StartTimeHours, absenceDetail.EndTimeHours);
      let durationInHours = DateTimeHelper.getDurationInHours(absenceDetail.FromHour, absenceDetail.ToHour);
      let hours = 0;
      if (durationInHours > maxHoursPerDay) {
        hours = 0;
      } else {
        hours = durationInHours;
      }
      if (absenceDetail.CanExcludeLunchDuration) {
        hours = hours - absenceDetail.LunchDuration;
      }
      absenceDetail.Hours = (Math.round(hours * 100) / 100);
      (<FormArray>this._myAbsenceForm.get('MyAbsenceDetails')).at(index).get('Hours').setValue(absenceDetail.Hours);

      let availableHours = (Math.round(absenceDetail.Hours * 100) / 100);
      availableHours = (availableHours > 0 ? availableHours : 0);

      absenceDetail.HasError = (StringHelper.isNullOrUndefinedOrEmpty(absenceDetail.Id) && absenceDetail.IsAllApplied) ||
        (!absenceDetail.IsAllApplied && absenceDetail.Hours > (absenceDetail.RemainingHours));
      if (absenceDetail.HasError) {
        absenceDetail.Message = 'Leave already applied for some or full portion of the day.';
      } else if (availableHours <= 0) {
        absenceDetail.HasError = true;
        absenceDetail.Message = 'No. of units should be greater than zero.';
      } else {
        absenceDetail.HasError = false;
        absenceDetail.Message = '';
      }

      (<FormArray>this._myAbsenceForm.get('MyAbsenceDetails')).at(index).get('HasError').setValue(absenceDetail.HasError);
      (<FormArray>this._myAbsenceForm.get('MyAbsenceDetails')).at(index).get('Message').setValue(absenceDetail.Message);

      totalCount = totalCount + availableHours;
      totalCount = (Math.round(totalCount * 100) / 100);
    });
    this._myAbsenceVM.NoOfUnits = totalCount;
    this._validateExcessHolidays();
  }

  public getLunchDurationColText() {
    if (this._isRequestforChange() && !this.IsApprove && !this.IsOneStepProcess) {
      return 'Excluded lunch duration';
    } else {
      return 'Exclude lunch duration?';
    }
  }


  public canShowLunchDurationCol() {
    return this.IsApprove || this._isRequestforChange() || this.IsOneStepProcess;
  }

  public canShowWorkingDays() {
    return !isNullOrUndefined(this._myAbsenceVM)
      && !this._myAbsenceVM.Isongoing
      && this._myAbsenceVM.UnitType == HolidayUnitType.Hours
      && !isNullOrUndefined(this._myAbsenceVM.MyAbsenceDetails)
      && this._myAbsenceVM.MyAbsenceDetails.length > 0;
  }


  public isHourMode(): boolean {
    return !isNullOrUndefined(this._myAbsenceVM) && this._myAbsenceVM.UnitType == HolidayUnitType.Hours;
  }

  public onUnitsChange(e) {
    if (this.isHolidayMode()) {
      this._validateExcessHolidays();
    }
  }

  public canShowAMPM() {
    let canShow = !isNullOrUndefined(this._myAbsenceVM) &&
      !isNullOrUndefined(this._myAbsenceVM.NoOfUnits) &&
      this._myAbsenceVM.NoOfUnits > 0 &&
      !isInteger(this._myAbsenceVM.NoOfUnits);

    if (canShow &&
      isNullOrUndefined(this._myAbsenceVM.HalfDayType)) {
      this._myAbsenceVM.HalfDayType = HalfDayType.AM;
    }

    if (!canShow) {
      this._myAbsenceVM.HalfDayType = null;
    }

    return canShow;
  }

  public isDayMode(): boolean {
    return !isNullOrUndefined(this._myAbsenceVM) && this._myAbsenceVM.UnitType == HolidayUnitType.Days;
  }

  public getValidationMessage() {
    if (!isNullOrUndefined(this._validationVM) &&
      !StringHelper.isNullOrUndefinedOrEmpty(this._validationVM.Message)) {
      return this._validationVM.Message;
    }
    return '';
  }


  public hasValidationError() {
    return !isNullOrUndefined(this._validationVM) && this._validationVM.HasError;
  }

  public isEndDateValid(e) {
    //if the end date is valid then we need to handle the date change, here e will be valid only end date is valid
    // if (e) {
    //   this._handleDateChange();
    // }
    this._isToDateValid = e;
  }
  public onEndDateSelect(e) {
    if (this._isToDateValid) {
      this._handleDateChange();
    }
  }

  public showOrHideEndDate(): boolean {
    return this._myAbsenceVM.Isongoing === false || this.isEditMode();
  }


  public getUnitTypeText(): string {
    if (!isNullOrUndefined(this._myAbsenceVM) && !isNullOrUndefined(this._myAbsenceVM.UnitType)) {
      return `In ${HolidayUnitType[this._myAbsenceVM.UnitType].toString().toLowerCase()}`;
    } else {
      return '';
    }
  }


  public isHolidayMode(): boolean {
    return !isNullOrUndefined(this._myAbsenceVM) && this._myAbsenceVM.Type == MyAbsenceType.Holiday;
  }

  public changeUnitType(e) {
    this._myAbsenceForm.get('StartDate').setValue(null);
    this._myAbsenceForm.get('EndDate').setValue(null);
    this._myAbsenceForm.get('NoOfUnits').setValue(0);
    this._myAbsenceForm.get('Duration').setValue(0);
    this._myAbsenceForm.get('HalfDayType').setValue(null);
    this._clearValidations();
    this._configureValidations();
  }

  public isEditMode(): boolean {
    return this._operationMode === OperationModes.Update;
  }


  public onAbsenceSubtypeChange(e) {
    this._clearValidations();
    if (this._hasExtraHolidayValidation()) {
      this._validationVM = {
        HasError: true,
        Message: `Duration should not be greater than 1 day when absence type is "Extra Holiday" and sub type is "Birthday"`
      };
    }
    this._cdRef.markForCheck();
  }

  public hasError(fieldName: string): Array<string> {
    let messages: Array<string> = [];
    switch (fieldName) {
      case 'AbsenceTypeId': {
        if (this._fieldHasRequiredError(fieldName)) {
          messages.push('Please select absence type.');
        }
      }
        break;
      case 'StartDate': {
        if (this._fieldHasRequiredError(fieldName)) {
          messages.push('Start date is required.');
        }
      }
        break;
      case 'EndDate': {
        if (this._fieldHasRequiredError(fieldName)) {
          messages.push('End date is required.');
        }

        if (this._fieldHasRangeError()) {
          messages.push('End date must be greater than or equal to start date.');
        }
      }
        break;
      case 'NoOfUnits': {
        if (this._fieldHasRequiredError(fieldName)) {
          messages.push('No of days required.');
        }

        if (this._fieldHasMinValue(fieldName)) {
          messages.push('No of days should be greater than 0.');
        }

        if (this._fieldHasMaxDurationError()) {
          messages.push('No of days should not be greater than duration.');
        }
      }
        break;
      case 'IsExcessHolidayAllowed': {
        if (this._fieldHasRequiredError(fieldName)) {
          messages.push('Please confirm.');
        }
      }
        break;
    }
    return messages;
  }

  public isFieldInvalid(fieldName: string): boolean {
    return !this._myAbsenceForm.get(fieldName).valid &&
      !this._myAbsenceForm.get(fieldName).pristine;
  }

  public onAbsenceTypeChange(e: AeSelectEvent<string>) {
    this._absenceSubtypes = Immutable.List([]);
    this._myAbsenceForm.get('AbsenceSubtypeId').setValue(null);
    this._myAbsenceVM.Isongoing = false;
    if (!StringHelper.isNullOrUndefinedOrEmpty(e.SelectedValue)) {
      let subtypes = getAbsenceSubtypes(this._absenceTypeList, e.SelectedValue);
      this._absenceSubtypes = mapAbsenceSubtypesToAeSelectItems(subtypes);
      if (e.SelectedItem.Text.toLowerCase() === 'sick') {
        this._myAbsenceForm.get('Isongoing').setValue(true);
        this._myAbsenceForm.get('EndDate').setValue(null);

        this._myAbsenceForm.get('NoOfUnits').setValue(0);
        this._myAbsenceForm.get('HalfDayType').setValue(null);
      } else {
        this._myAbsenceForm.get('Isongoing').setValue(false);
      }
      this._configureValidations();
      this._clearValidations();
      if (this._hasExtraHolidayValidation()) {
        this._validationVM = {
          HasError: true,
          Message: `Duration should not be greater than 1 day when absence type is "Extra Holiday" and sub type is "Birthday"`
        };
      }
      this._cdRef.markForCheck();
    }
  }

  private isAbsenceMode(): boolean {
    return !isNullOrUndefined(this._myAbsenceVM) && this._myAbsenceVM.Type == MyAbsenceType.Absence;
  }

  public getMyAbsenceTypeText(): string {
    if (!isNullOrUndefined(this._myAbsenceVM) && !isNullOrUndefined(this._myAbsenceVM.Type)) {
      return `${MyAbsenceType[this._myAbsenceVM.Type].toString().toLowerCase()}`;
    } else {
      return '';
    }
  }

  public getTitleForOneStepProcess(): string {
    if (!isNullOrUndefined(this._myAbsenceVM) && !isNullOrUndefined(this._myAbsenceVM.Type)) {
      return `${this._myAbsenceVM.Type === MyAbsenceType.Holiday ? 'a' : 'an'} ${MyAbsenceType[this._myAbsenceVM.Type].toString().toLowerCase()}`;
    } else {
      return '';
    }
  }

  public getMyAbsenceTypePlural(): string {
    if (!isNullOrUndefined(this._myAbsenceVM) && !isNullOrUndefined(this._myAbsenceVM.Type)) {
      return `${MyAbsenceType[this._myAbsenceVM.Type].toString().toLowerCase()}s`;
    } else {
      return '';
    }
  }


  public isApproveMode(): boolean {
    return this.isEditMode() && this.IsApprove;
  }

  ngOnInit() {
    this._messageType = MessageType.Alert;
    this._numberType = AeInputType.number;
    this._unitTypes = extractHolidayUnitTypes();
    this._saveBtnText = this._getSubmitBtnText();
  }
  public getNoOfUnitsTitle(): string {
    let absenceType = this._absenceTypeList.filter((type) => type.Id === this._myAbsenceVM.AbsenceTypeId)[0];
    let resultText = this._translationService.translate('ABSENCES.NO_OF_DAYS_INFO');
    return resultText.replace('{{absenceType}}', this._getMyAbsenceTitleText());

  }
  // End of public methods

  /*
  * Method to get given absence is holiday or absence : 
  * Returns string eg: holiday
  */

}
