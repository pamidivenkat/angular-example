import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { MyAbsenceType, MyAbsenceVM, OperationModes, EmployeeConfig, MyAbsence } from '../../models/holiday-absence.model';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { Router } from '@angular/router';
import { AbsenceType, EmployeeSettings, FiscalYear } from '../../../shared/models/company.models';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { mapToAeSelectItems, prepareModel, prepareUpdateModel, extractMyAbsenceVM } from '../../common/extract-helpers';
import {
  LoadAbsenceTypeAction,
  LoadEmployeeSettingsAction,
  LoadFiscalYearsAction
} from '../../../shared/actions/company.actions';
import { Subscription, BehaviorSubject, Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { BaseComponent } from '../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../shared/reducers';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import * as Immutable from 'immutable';
import {
  LoadEmployeeConfigAction
  , ClearCurrentAbsence
  , LoadEmployeeAbsencesAction
  , LoadEmployeeAbsenceAction,
  AddEmployeeAbsenceAction,
  UpdateEmployeeAbsenceAction
} from '../../actions/holiday-absence.actions';
import { AbsenceStatusLoadAction } from '../../../shared/actions/lookup.actions';
import { AbsenceStatus } from '../../../shared/models/lookup.models';
import { CommonHelpers } from '../../../shared/helpers/common-helpers';
import { DatePipe } from '@angular/common';
import { HolidayAbsenceDataService } from '../../services/holiday-absence-data.service';
import { DateTimeHelper } from '../../../shared/helpers/datetime-helper';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
  selector: 'absence-container',
  templateUrl: './absence-container.component.html',
  styleUrls: ['./absence-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AbsenceContainerComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private field declarations
  private _employeeSettingsSubscription: Subscription;
  private _employeeConfigSubscription: Subscription;
  private _fiscalyearDataSubscription: Subscription;
  private _employeeAbsenceSubscription: Subscription;
  private _absenceStatusSubscription$: Subscription;
  private _absenceTypesSubscription: Subscription;
  private _fiscalYears: Immutable.List<AeSelectItem<string>> = Immutable.List([]);
  private _selectedYear: string = null;
  private _showMyAbsenceForm: boolean = false;
  private _operationMode: OperationModes = OperationModes.Add;
  private _absenceVM: MyAbsenceVM;
  private _employeeSettings: EmployeeSettings;
  private _initialDataLoaded: boolean = false;
  private _absenceTypes: Array<AbsenceType> = [];
  private _employeeId: string;
  private _employeeConfig: EmployeeConfig;
  private _absenceStatusList: Array<AbsenceStatus>;
  private _fiscalYearData: Array<FiscalYear>;

  private _employeeAbsence: MyAbsence;
  private _headerType: MyAbsenceType = MyAbsenceType.Absence;
  // End of private field declarations

  // Public field declarations
  get headerType() {
    return this._headerType;
  }
  set headerType(val: MyAbsenceType) {
    this._headerType = val;
  }
  get employeeSettings() {
    return this._employeeSettings;
  }
  set employeeSettings(val: EmployeeSettings) {
    this._employeeSettings = val;
  }
  get employeeConfig() {
    return this._employeeConfig;
  }
  get fiscalYearData() {
    return this._fiscalYearData;
  }
  set fiscalYearData(val: Array<FiscalYear>) {
    this._fiscalYearData = val;
  }
  get absenceStatusList() {
    return this._absenceStatusList;
  }
  set absenceStatusList(val: Array<AbsenceStatus>) {
    this._absenceStatusList = val
  }
  get showMyAbsenceForm() {
    return this._showMyAbsenceForm;
  }
  set showMyAbsenceForm(val: boolean) {
    this._showMyAbsenceForm = val;
  }
  get operationMode() {
    return this._operationMode;
  }
  set operationMode(val: OperationModes) {
    this._operationMode = val;
  }
  get employeeAbsence() {
    return this._employeeAbsence;
  }
  set employeeAbsence(val: MyAbsence) {
    this._employeeAbsence = val;
  }
  get absenceTypes() {
    return this._absenceTypes;
  }
  set absenceTypes(val: Array<AbsenceType>) {
    this._absenceTypes = val;
  }
  get absenceVM() {
    return this._absenceVM;
  }
  set absenceVM(val: MyAbsenceVM) {
    this._absenceVM = val
  }
  // End of public field declarations

  // Output property declarations

  // End of output propery declarations
  // constructor starts
  /**
   * Creates an instance of HolidayContainerComponent.
   * @param {LocaleService} _localeService
   * @param {TranslationService} _translationService
   * @param {ChangeDetectorRef} _cdRef
   * @param {Store<fromRoot.State>} _store
   * @param {ClaimsHelperService} _claimsHelper
   *
   * @memberOf HolidayContainerComponent
   */
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _datePipe: DatePipe
    , private _dataService: HolidayAbsenceDataService
    , private _breadcrumbService: BreadcrumbService) {
    super(_localeService, _translationService, _cdRef);
    // let bcItem: IBreadcrumb = { label: 'Absences', url: '/absence-management/absence' };
    // this._breadcrumbService.add(bcItem);
    let bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.Absences, label: 'Absences', url: '/absence-management/absence' };
    this._breadcrumbService.clear(BreadcrumbGroup.Absences);
    this._breadcrumbService.add(bcItem);
  }
  // End of constructor

  // Private methods

  private _reloadMyAbsencesTable(dateBounds) {
    if (!isNullOrUndefined(dateBounds)) {
      this._store.dispatch(new LoadEmployeeAbsencesAction({
        typeId: MyAbsenceType.Absence.toString(),
        startDate: dateBounds.StartDate,
        endDate: dateBounds.EndDate,
        employeeId: this._claimsHelper.getEmpIdOrDefault(),
        pageNumber: 1,
        pageSize: 10,
        sortField: 'StartDate',
        direction: SortDirection.Descending
      }));
    }
  }

  private _getEmployeeAbsenceVM(employeeAbsence: MyAbsence) {
    if (isNullOrUndefined(employeeAbsence)) {
      return;
    }

    let startDate = DateTimeHelper.getDatePartfromString(employeeAbsence.StartDate);
    let endDate = DateTimeHelper.getDatePartfromString(employeeAbsence.EndDate);

    if (isNullOrUndefined(endDate) && employeeAbsence.Isongoing) {
      if (employeeAbsence.IsHour) {
        endDate = startDate;
      }
    }

    this._dataService.getWorkingDays(startDate
      , endDate
      , employeeAbsence.EmployeeId)
      .subscribe((workingDays) => {
        this._absenceVM = new MyAbsenceVM();
        this._absenceVM = Object.assign(this._absenceVM, extractMyAbsenceVM(employeeAbsence, workingDays));

        this._cdRef.markForCheck();
      });
  }


  // End of private methods

  // Public methods
  public saveEmployeeHoliday(employeeAbsenceVM: MyAbsenceVM) {
    if (!isNullOrUndefined(employeeAbsenceVM)) {
      let employeeAbsence: MyAbsence;
      if (this._operationMode === OperationModes.Add) {
        employeeAbsence = prepareModel(employeeAbsenceVM
          , this._employeeConfig
          , this._absenceStatusList
          , false
          , null);
        this._store.dispatch(new AddEmployeeAbsenceAction(employeeAbsence));
      } else if (this._operationMode === OperationModes.Update) {
        employeeAbsence = prepareUpdateModel(this._employeeAbsence
          , employeeAbsenceVM
          , this._employeeConfig
          , this._employeeSettings
          , this._absenceStatusList
          , false
          , null);
        this._store.dispatch(new UpdateEmployeeAbsenceAction(employeeAbsence));
      }
      this._showMyAbsenceForm = false;
      this._absenceVM = null;
      this._operationMode = null;
      this._cdRef.markForCheck();
    }
  }

  public closeMyAbsenceForm(e) {
    this._operationMode = null;
    this._absenceVM = null;
    this._showMyAbsenceForm = false;
  }

  public getMyAbsenceSlideoutState() {
    return this._showMyAbsenceForm ? 'expanded' : 'collapsed';
  }


  public updateAbsence(myAbsenceId) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(myAbsenceId)) {
      this._absenceVM = new MyAbsenceVM();
      this._absenceVM.Type = MyAbsenceType.Absence;
      this._operationMode = OperationModes.Update;
      this._showMyAbsenceForm = true;
      this._cdRef.markForCheck();

      this._store.dispatch(new ClearCurrentAbsence());
      this._store.dispatch(new LoadEmployeeAbsenceAction(myAbsenceId));
    }
  }

  public onFiscalYearChange(fyYearValue) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(fyYearValue)) {
      let dateBounds = CommonHelpers.processFSYearValue(fyYearValue, this._datePipe);
      if (this._employeeSettings && this._employeeSettings.CanEmployeeViewAbsenceHistory) {
        this._reloadMyAbsencesTable(dateBounds);
        this._cdRef.markForCheck();
      }
    }
  }


  public addAbsence(e) {
    this._operationMode = OperationModes.Add;
    this._absenceVM = new MyAbsenceVM();
    this._absenceVM.Type = MyAbsenceType.Absence;
    this._absenceVM.UnitType = this._employeeSettings.HolidayUnitType;
    if (!isNullOrUndefined(this._employeeConfig) &&
      !isNullOrUndefined(this._employeeConfig.HolidayUnitType)) {
      this._absenceVM.UnitType = this._employeeConfig.HolidayUnitType;
    } else if (!isNullOrUndefined(this._employeeSettings) &&
      !isNullOrUndefined(this._employeeSettings.HolidayUnitType)) {
      this._absenceVM.UnitType = this._employeeSettings.HolidayUnitType;
    }
    this._showMyAbsenceForm = true;
    this._cdRef.markForCheck();
  }


  ngOnInit() {
    this._employeeId = this._claimsHelper.getEmpIdOrDefault();

    this._employeeConfigSubscription = this._store.let(fromRoot.getEmployeeConfigData).subscribe((employeeConfig) => {
      if (!isNullOrUndefined(employeeConfig)) {
        this._employeeConfig = employeeConfig;
        this._cdRef.markForCheck();
      } else {
        this._store.dispatch(new LoadEmployeeConfigAction(this._employeeId));
      }
    });

    this._employeeSettingsSubscription = this._store.let(fromRoot.getEmployeeSettingsData).subscribe((employeeSettings) => {
      if (!isNullOrUndefined(employeeSettings)) {
        this._employeeSettings = employeeSettings;
        this._cdRef.markForCheck();
      } else {
        this._store.dispatch(new LoadEmployeeSettingsAction(true));
      }
    });

    this._absenceStatusSubscription$ = this._store.let(fromRoot.getAbsenceStatusData).subscribe((absenceStatuses) => {
      if (!isNullOrUndefined(absenceStatuses)) {
        this._absenceStatusList = absenceStatuses;
        this._cdRef.markForCheck();
      } else {
        this._store.dispatch(new AbsenceStatusLoadAction(true));
      }
    });

    this._absenceTypesSubscription = this._store.let(fromRoot.absenceTypesWithoutDuplicatesData).subscribe((absenceTypes) => {
      if (!isNullOrUndefined(absenceTypes)) {
        this._absenceTypes = absenceTypes;
        this._cdRef.markForCheck();
      } else {
        this._store.dispatch(new LoadAbsenceTypeAction(true));
      }
    });

    this._fiscalyearDataSubscription =
      Observable.combineLatest(this._store.let(fromRoot.getEmployeeSettingsData),
        this._store.let(fromRoot.getFiscalYearsData))
        .subscribe((val) => {
          let result = { settings: val[0], years: val[1] };
          if (!isNullOrUndefined(result.settings)
            && isNullOrUndefined(result.years)) {
            this._store.dispatch(new LoadFiscalYearsAction({
              startDate: result.settings.FiscalStartDate,
              endDate: result.settings.FiscalEndDate
            }));
          } else if (!isNullOrUndefined(result.settings)
            && !isNullOrUndefined(result.years)) {
            this._fiscalYearData = result.years;
            this._cdRef.markForCheck();
          }
        });

    this._employeeAbsenceSubscription = this._store.let(fromRoot.getEmployeeAbsence).subscribe((employeeAbsence) => {
      if (!isNullOrUndefined(employeeAbsence)) {
        this._employeeAbsence = employeeAbsence;
        this._cdRef.markForCheck();
        if (this._showMyAbsenceForm) {
          this._getEmployeeAbsenceVM(employeeAbsence);
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (!isNullOrUndefined(this._employeeSettingsSubscription)) {
      this._employeeSettingsSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._employeeConfigSubscription)) {
      this._employeeConfigSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._fiscalyearDataSubscription)) {
      this._fiscalyearDataSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._employeeAbsenceSubscription)) {
      this._employeeAbsenceSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._absenceTypesSubscription)) {
      this._absenceTypesSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._absenceStatusSubscription$)) {
      this._absenceStatusSubscription$.unsubscribe();
    }
  }
  // end of public methods
}
