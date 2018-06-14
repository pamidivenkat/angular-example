import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { IBreadcrumb } from '../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import {
  MyAbsenceType
  , MyAbsenceVM
  , OperationModes
  , EmployeeConfig
  , FiscalYearSummary
  , MyAbsence,
  FiscalYearSummaryModel
} from '../../models/holiday-absence.model';
import {
  mapToAeSelectItems
  , getFiscalYear
  , extractMyAbsenceVM,
  prepareModel,
  prepareUpdateModel
} from '../../common/extract-helpers';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { isNullOrUndefined } from 'util';
import {
  LoadEmployeeSettingsAction
  , LoadFiscalYearsAction
} from '../../../shared/actions/company.actions';
import {
  Subscription
  , BehaviorSubject
  , Observable
} from 'rxjs/Rx';
import {
  ChangeDetectionStrategy
  , ChangeDetectorRef
  , Component
  , OnDestroy
  , OnInit
  , ViewEncapsulation
} from '@angular/core';
import {
  LocaleService
  , TranslationService
} from 'angular-l10n';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { BaseComponent } from '../../../shared/base-component';
import * as fromRoot from '../../../shared/reducers';
import * as Immutable from 'immutable';
import {
  EmployeeSettings
  , FiscalYear
} from '../../../shared/models/company.models';
import {
  LoadEmployeeConfigAction
  , LoadFiscalYearDataAction
  , LoadEmployeeAbsenceAction
  , ClearCurrentAbsence
  , LoadEmployeeAbsencesAction,
  LoadFiscalYearDataCompleteAction,
  AddEmployeeAbsenceAction,
  UpdateEmployeeAbsenceAction
} from '../../actions/holiday-absence.actions';
import { AbsenceStatusLoadAction } from '../../../shared/actions/lookup.actions';
import { AbsenceStatus, AbsenceStatusCode } from '../../../shared/models/lookup.models';
import { DateTimeHelper } from '../../../shared/helpers/datetime-helper';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { DatePipe } from '@angular/common';
import { CommonHelpers } from '../../../shared/helpers/common-helpers';
import { HolidayAbsenceDataService } from '../../services/holiday-absence-data.service';
import { mapFiscalYearsToAeSelectItems } from '../../../shared/helpers/extract-helpers';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { ActivatedRoute } from '@angular/router';

type DateBound = { StartDate: string, EndDate: string };

@Component({
  selector: 'holiday-container',
  templateUrl: './holiday-container.component.html',
  styleUrls: ['./holiday-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HolidayContainerComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private field declarations
  private _employeeSettingsSubscription: Subscription;
  private _employeeConfigSubscription: Subscription;
  private _employeeAbsenceSubscription: Subscription;
  private _fiscalyearsSubscription: Subscription;
  private _fiscalyearSummarySubscription: Subscription;
  private _fiscalyearSummaryForChartSubscription: Subscription;
  private _fiscalYearData: Array<FiscalYear>;
  private _selectedYear: DateBound = null;
  private _statusFilterValue: string = '';
  private _showMyAbsenceForm: boolean = false;
  private _operationMode: OperationModes;
  private _holidayVM: MyAbsenceVM;
  private _employeeAbsence: MyAbsence;
  private _employeeSettings: EmployeeSettings;
  private _initialDataLoaded: boolean = false;
  private _employeeId: string;
  private _employeeConfig: EmployeeConfig;
  private _holidaySummaryList: Array<FiscalYearSummary>;
  private _fiscalYearSummary: FiscalYearSummary;
  private _fiscalYearSummaryForChart: FiscalYearSummary;
  private _absenceStatusSubscription$: Subscription;
  private _absenceStatusList: Array<AbsenceStatus>;
  private _headerType: MyAbsenceType = MyAbsenceType.Holiday;
  private _loadingStatus: boolean;
  private _loadingSubscription: Subscription;
  // End of private field declarations

  // Public field declarations
  get loadingStatus(): boolean {
    return this._loadingStatus;
  }
  get headerType() {
    return this._headerType;
  }
  get employeeSettings() {
    return this._employeeSettings;
  }
  get employeeConfig() {
    return this._employeeConfig;
  }
  get fiscalYearData() {
    return this._fiscalYearData;
  }
  get fiscalYearSummaryForChart() {
    return this._fiscalYearSummaryForChart;
  }
  get absenceStatusList() {
    return this._absenceStatusList;
  }
  get showMyAbsenceForm() {
    return this._showMyAbsenceForm;
  }
  get operationMode() {
    return this._operationMode;
  }
  get employeeAbsence() {
    return this._employeeAbsence;
  }
  get holidayVM() {
    return this._holidayVM;
  }
  get fiscalYearSummary() {
    return this._fiscalYearSummary;
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
    , private _breadcrumbService: BreadcrumbService
  , private _activatedRoute: ActivatedRoute) {
    super(_localeService, _translationService, _cdRef);
    // let bcItem: IBreadcrumb = { label: 'Holidays', url: '/absence-management/holiday' };
    // this._breadcrumbService.add(bcItem);
    let bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.Holidays, label: 'Holidays', url: '/absence-management/holiday' };
    this._breadcrumbService.clear(BreadcrumbGroup.Holidays);
    this._breadcrumbService.add(bcItem);
    this._headerType = MyAbsenceType.Holiday;
    this.id = 'holiday-container';
    this.name = 'holiday-container';
  }
  // End of constructor

  // Private methods


  private _reloadMyHolidaysTable() {
    //DO NOT CHANGE default page and sort settings if changed then local variables in myholiday list and my absence list also should be changed
    if (!isNullOrUndefined(this._selectedYear)) {
      this._store.dispatch(new LoadEmployeeAbsencesAction({
        typeId: MyAbsenceType.Holiday.toString(),
        myHolidayStatusFilter: !StringHelper.isNullOrUndefinedOrEmpty(this._statusFilterValue) ? this._statusFilterValue : null,
        startDate: this._selectedYear.StartDate,
        endDate: this._selectedYear.EndDate,
        employeeId: this._claimsHelper.getEmpIdOrDefault(),
        pageNumber: 1,
        pageSize: 10,
        sortField: 'StartDate',
        direction: SortDirection.Descending
      }));
    }
  }

  private _reloadChartSummary() {
    if (!isNullOrUndefined(this._selectedYear)) {
      this._store.dispatch(new LoadFiscalYearDataAction({
        refreshSummary: true,
        forceRefresh: false,
        startDate: this._selectedYear.StartDate,
        endDate: this._selectedYear.EndDate,
        employeeId: this._claimsHelper.getEmpIdOrDefault()
      }));
    }
  }




  private _getEmployeeAbsenceVM(employeeAbsence: MyAbsence) {
    if (isNullOrUndefined(employeeAbsence)) {
      return;
    }

    let startDate = DateTimeHelper.getDatePartfromString(employeeAbsence.StartDate);
    let endDate = DateTimeHelper.getDatePartfromString(employeeAbsence.EndDate);

    let selectedYear = getFiscalYear(startDate, endDate, this._fiscalYearData);
    if (!isNullOrUndefined(selectedYear)) {
      let value = selectedYear.StartDate + 'dt' + selectedYear.EndDate;
      this.onPullFiscalYearSummary(value);
    }

    this._dataService.getWorkingDays(startDate
      , endDate
      , employeeAbsence.EmployeeId)
      .first().subscribe((workingDays) => {
        this._holidayVM = new MyAbsenceVM();
        this._holidayVM = Object.assign(this._holidayVM, extractMyAbsenceVM(employeeAbsence, workingDays));

        this._cdRef.markForCheck();
      });
  }

  private _getPendingStatusId() {
    if (!isNullOrUndefined(this._absenceStatusList)) {
      return this._absenceStatusList
        .filter(status => status.Code === AbsenceStatusCode.Requested)[0].Id;
    }
    return '';
  }
  // End of private methods

  // Public methods

  public onPullFiscalYearSummary(fyYearValue) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(fyYearValue)) {
      let dateBounds = CommonHelpers.processFSYearValue(fyYearValue, this._datePipe);
      this._store.dispatch(new LoadFiscalYearDataAction({
        refreshSummary: false,
        forceRefresh: false,
        startDate: dateBounds.StartDate,
        endDate: dateBounds.EndDate,
        employeeId: this._claimsHelper.getEmpIdOrDefault()
      }));
    }
  }


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
      this._holidayVM = null;
      this._operationMode = null;
      this._cdRef.markForCheck();
    }
  }


  public onSummaryChange(fySummaryModel: FiscalYearSummaryModel) {
    if (!isNullOrUndefined(fySummaryModel)) {
      this._store.dispatch(new LoadFiscalYearDataCompleteAction(fySummaryModel));
    }
  }

  public hasSlideAnimate() {
    return this._showMyAbsenceForm ? true : null;
  }

  public closeMyAbsenceForm(e) {
    this._operationMode = null;
    this._holidayVM = null;
    this._showMyAbsenceForm = false;
  }

  public getMyAbsenceSlideoutState() {
    return this._showMyAbsenceForm ? 'expanded' : 'collapsed';
  }

  public onStatusChange(statusId) {
    this._statusFilterValue = statusId;
    this._reloadMyHolidaysTable();
    this._cdRef.markForCheck();
  }

  public updateHoliday(myAbsenceId: string) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(myAbsenceId)) {
      this._holidayVM = new MyAbsenceVM();
      this._holidayVM.Type = MyAbsenceType.Holiday;
      this._operationMode = OperationModes.Update;
      this._showMyAbsenceForm = true;
      this._cdRef.markForCheck();

      this._store.dispatch(new ClearCurrentAbsence());
      this._store.dispatch(new LoadEmployeeAbsenceAction(myAbsenceId));
    }
  }

  public onFiscalYearChange(fyYearValue) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(fyYearValue)) {
      this._selectedYear = CommonHelpers.processFSYearValue(fyYearValue, this._datePipe);
      this._reloadMyHolidaysTable();
      this._reloadChartSummary();
      this._cdRef.markForCheck();
    }
  }

  public addHoliday(e) {
    if (!isNullOrUndefined(this._fiscalYearData) &&
      this._fiscalYearData.length > 0) {
      let currentFyYear = this._fiscalYearData.filter(c => c.Order === 2)[0];
      if (!isNullOrUndefined(currentFyYear)) {
        let value = currentFyYear.StartDate + 'dt' + currentFyYear.EndDate;
        this.onPullFiscalYearSummary(value);
      }
    }


    this._operationMode = OperationModes.Add;
    this._holidayVM = new MyAbsenceVM();
    this._holidayVM.Type = MyAbsenceType.Holiday;
    if (!isNullOrUndefined(this._employeeConfig) &&
      !isNullOrUndefined(this._employeeConfig.HolidayUnitType)) {
      this._holidayVM.UnitType = this._employeeConfig.HolidayUnitType;
    } else if (!isNullOrUndefined(this._employeeSettings) &&
      !isNullOrUndefined(this._employeeSettings.HolidayUnitType)) {
      this._holidayVM.UnitType = this._employeeSettings.HolidayUnitType;
    }
    this._showMyAbsenceForm = true;
    this._cdRef.markForCheck();
  }

  private _processAbsenceStatuses() {
    if (!isNullOrUndefined(this._absenceStatusList)) {
      this._activatedRoute.url.takeUntil(this._destructor$).subscribe((path) => {
        if (path.find(obj => !isNullOrUndefined(obj.path) && obj.path.indexOf('all') >= 0)) {
          this._statusFilterValue = '';
        } else if (path.find(obj => !isNullOrUndefined(obj.path) && obj.path.toLowerCase().indexOf('approved') >= 0)) {
          this._statusFilterValue = this._absenceStatusList.filter(c => c.Code === AbsenceStatusCode.Approved)[0].Id;
        } else {
          this._statusFilterValue = this._absenceStatusList.filter(c => c.Code === AbsenceStatusCode.Requested)[0].Id;
        }
      });
    }
  }

  ngOnInit() {
    this._employeeId = this._claimsHelper.getEmpIdOrDefault();

    this._loadingSubscription = this._store.let(fromRoot.getLoadingStatus).subscribe((loading) => {
      if (!isNullOrUndefined(loading)) {
        this._loadingStatus = loading;
      }
    });

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
        this._processAbsenceStatuses();
        this._cdRef.markForCheck();
      } else {
        this._store.dispatch(new AbsenceStatusLoadAction(true));
      }
    });

    this._fiscalyearsSubscription =
      Observable.combineLatest(this._store.let(fromRoot.getEmployeeSettingsData),
        this._store.let(fromRoot.getFiscalYearsData))
        .subscribe((data) => {
          let result = { settings: data[0], years: data[1] };
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

    this._fiscalyearSummarySubscription = this._store.let(fromRoot.getFiscalYearSummary).subscribe((summary) => {
      if (!isNullOrUndefined(summary)) {
        this._fiscalYearSummary = summary;
        this._cdRef.markForCheck();
      }
    });

    this._fiscalyearSummaryForChartSubscription = this._store.let(fromRoot.getFiscalYearSummaryforChart).subscribe((summary) => {
      if (!isNullOrUndefined(summary)) {
        this._fiscalYearSummaryForChart = summary;
        this._cdRef.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    if (!isNullOrUndefined(this._employeeConfigSubscription)) {
      this._employeeConfigSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._employeeSettingsSubscription)) {
      this._employeeSettingsSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._fiscalyearsSubscription)) {
      this._fiscalyearsSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._fiscalyearSummarySubscription)) {
      this._fiscalyearSummarySubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._fiscalyearSummaryForChartSubscription)) {
      this._fiscalyearSummaryForChartSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._absenceStatusSubscription$)) {
      this._absenceStatusSubscription$.unsubscribe();
    }
    super.ngOnDestroy();
  }
  // End of public methods
}
