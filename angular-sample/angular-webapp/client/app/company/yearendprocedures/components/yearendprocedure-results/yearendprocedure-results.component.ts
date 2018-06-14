import {
  Component
  , OnInit
  , ChangeDetectorRef
  , OnDestroy
  , ChangeDetectionStrategy
  , ViewEncapsulation
  , Input
  , EventEmitter
  , Output
  , ViewChild
} from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { BaseComponent } from './../../../../shared/base-component';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { YearEndProcedureModel, YearEndProcedureStatus, YearEndProcedureResultModel } from './../../models/yearendprocedure-model';
import { ModalDialogSize } from './../../../../atlas-elements/common/modal-dialog-size.enum';
import { isNullOrUndefined, isNumber } from 'util';
import { Subscription, Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import {
  LoadYearEndProcedureStatusAction
  , LoadYearEndProcedureDataCompleteAction
  , LoadYearEndProcedureResultsAction,
  LoadEmployeesWithZeroEntitlementAction,
  UpdateYearEndProcedureReviewConfirmAction,
  UpdateYearEndProcedureAction
} from './../../actions/yearendprocedure-actions';
import { YearendprocedureServiceService } from './../../services/yearendprocedure-service.service';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { AeDataTableAction } from './../../../../atlas-elements/common/models/ae-data-table-action';
import { HolidayUnitType } from './../../../../shared/models/company.models';
import { AeInputType } from './../../../../atlas-elements/common/ae-input-type.enum';
import { AeDatatableComponent } from './../../../../atlas-elements/ae-datatable/ae-datatable.component';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { AeIconSize } from './../../../../atlas-elements/common/ae-icon-size.enum';
import { AeLoaderType } from './../../../../atlas-elements/common/ae-loader-type.enum';

@Component({
  selector: 'yearendprocedure-results',
  templateUrl: './yearendprocedure-results.component.html',
  styleUrls: ['./yearendprocedure-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class YearendprocedureResultsComponent extends BaseComponent implements OnInit, OnDestroy {
  // private field declarations start
  private _yearEndProcedureData: YearEndProcedureModel;
  private _context: any;
  private _showConfirmProcess: boolean = false;
  private _yearEndProcedureSubscription: Subscription;
  private _yearEndProcedureResultsSubscription: Subscription;
  private _yepResults: Array<any>;
  private _yearendprocedureResults$: Observable<Immutable.List<YearEndProcedureResultModel>>;
  private _totalRowsCount$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _yepResultsLoading$: Observable<boolean>;
  private _yepApiRequest: AtlasApiRequestWithParams;
  private _keys = Immutable.List(['Id', 'CompanyId', 'FullName', 'DepartmentName', 'StartDate',
    'YearEndProcedureId', 'UtilizedHolidayUnits', 'UtilizedHolidayUnitType', 'ReviewedHolidayEntitlement', 'ReviewedHolidayUnitType',
    'ReviewedCarryForwardedUnits', 'CarryForwardedUnitType', 'CarryForwardedUnits', 'HolidayEntitlement', 'HolidayUnitType',
    'LengthOfService', 'LastYearHolidayEntitlement', 'HolidaysTaken', 'ThisYearTotalHolidays', 'AvailableToCarryForwardUnitType'
    , 'ThisYearHolidayEntitlementUnitType']);
  private _actions: Immutable.List<AeDataTableAction>;
  private _resultsToSave: Array<YearEndProcedureResultModel> = [];
  private _resultsToSaveSubject: Subject<Array<YearEndProcedureResultModel>> =
  new Subject<Array<YearEndProcedureResultModel>>();
  private _onDemandLoaderCommand: BehaviorSubject<boolean> =
  new BehaviorSubject<boolean>(null);
  private _zeroEntitlementSubscription: Subscription;
  private _autoSaveResultSubscription: Subscription;
  private _yepStatusSubscription: Subscription;
  private _resultsToSaveSubjectSubscription: Subscription;
  private _canShowStatusLoader: boolean;
  private _isAutoSaveInProgress: boolean;
  private _isZeroEntitlementLoaded: boolean;
  private _employeeList: Array<string> = [];
  // end of private fields

  // getters start
  public get employeeList() {
    return this._employeeList;
  }

  public get isZeroEntitlementLoaded() {
    return this._isZeroEntitlementLoaded;
  }

  public get hasValidationErrors() {
    let status = false;
    if (!isNullOrUndefined(this._yepResults)) {
      let filtered = this._yepResults.filter((item, i) => {
        if (this.fieldHasRequiredError(i, 'ReviewedCarryForwardedUnits') ||
          this.fieldHasRequiredError(i, 'ReviewedHolidayEntitlement') ||
          !this.isValidNumber(i, 'ReviewedCarryForwardedUnits') ||
          !this.isValidNumber(i, 'ReviewedCarryForwardedUnits')) {
          return true;
        }
        return false;
      });

      if (!isNullOrUndefined(filtered) &&
        filtered.length > 0) {
        status = true;
      }
    }
    return (status || this._isAutoSaveInProgress || !this.showYEPResults);
  }

  public get showConfirmProcess() {
    return this._showConfirmProcess;
  }

  public get largeSize() {
    return ModalDialogSize.large;
  }

  public get showYEPResults() {
    if (!isNullOrUndefined(this._yearEndProcedureData) &&
      (this._yearEndProcedureData.Status === YearEndProcedureStatus.AwaitingReview ||
        this._yearEndProcedureData.Status === YearEndProcedureStatus.ReviewConfirmed)) {
      return true;
    }
    return false;
  }

  public get showInprogressMessage() {
    if (!isNullOrUndefined(this._yearEndProcedureData) &&
      this._yearEndProcedureData.Status === YearEndProcedureStatus.InProgress) {
      return true;
    }
    return false;
  }

  public get linkStyle() {
    return AeClassStyle.NavLink;
  }

  public get keys() {
    return this._keys;
  }

  public get totalRowsCount$() {
    return this._totalRowsCount$;
  }

  public get yearendprocedureResults$() {
    return this._yearendprocedureResults$;
  }

  public get dataTableOptions$() {
    return this._dataTableOptions$;
  }

  public get yepResultsLoading$() {
    return this._yepResultsLoading$;
  }

  public get inputTypeNumber() {
    return AeInputType.number;
  }

  public get yearEndProcedure() {
    return this._yearEndProcedureData;
  }

  public get iconSmall() {
    return AeIconSize.small;
  }

  public get canShowStatusLoader() {
    return this._canShowStatusLoader;
  }

  public get loaderType() {
    return AeLoaderType.Bars;
  }
  // end of getters

  // Input properties start
  @Input('context')
  public get context() {
    return this._context;
  }
  public set context(val: any) {
    this._context = val;
  }
  // end of input properties

  // output properties start
  @Output()
  continueEvent: EventEmitter<any> = new EventEmitter<any>();
  // end of output properties

  // viewchild bindings start
  @ViewChild(AeDatatableComponent)
  dataTable: AeDatatableComponent<any>;
  // end of view child bindings  

  // constrcutor starts
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _yepService: YearendprocedureServiceService) {
    super(_localeService, _translationService, _changeDetector);
    this._actions = Immutable.List([]);
    this._isAutoSaveInProgress = false;
    this._isZeroEntitlementLoaded = true;
  }
  // end of constructor

  // private methods start
  private _getYEPResults(): Array<any> {
    if (isNullOrUndefined(this._yepResults) &&
      !isNullOrUndefined(this.dataTable)) {
      let context = this.dataTable.getContext();
      if (!isNullOrUndefined(context)) {
        this._yepResults = context.toArray();
      }
    }
    return this._yepResults;
  }

  private _getYEPResultByIndex(index: number) {
    if (!isNullOrUndefined(this._yepResults) &&
      this._yepResults.length > 0) {
      return this._yepResults[index];
    } else {
      return null;
    }
  }

  private _updateContextValue(context, property, value) {
    let yepResult = this._getYEPResultByIndex(context.Row);
    if (!isNullOrUndefined(yepResult)) {
      yepResult[property] = value;
      yepResult['ThisYearTotalHolidays'] = this.getThisYearTotalHolidays(yepResult['ReviewedHolidayEntitlement']
        , yepResult['ReviewedCarryForwardedUnits']
        , yepResult['ReviewedHolidayUnitType']);
      yepResult.Changed = true;
    }
  }

  private _hasValue(rowIndex, property): boolean {
    let fieldValue = this._getFieldValue(rowIndex, property);
    return !isNullOrUndefined(fieldValue) && !StringHelper.isNullOrUndefinedOrEmpty(String(fieldValue));
  }

  private _getFieldValue(rowIndex, property) {
    let fieldValue;
    let yepResult = this._getYEPResultByIndex(rowIndex);
    if (!isNullOrUndefined(yepResult)) {
      fieldValue = yepResult[property];
    }
    return fieldValue;
  }

  private _isNumber(val: string) {
    let res = parseFloat(val);
    return isNaN(res) ? false : true;
  }
  // end of private methods

  // public methods
  public fieldHasRequiredError(rowIndex, property): boolean {
    return !(this._hasValue(rowIndex, property));
  }

  public isValidNumber(rowIndex, property): boolean {
    let fieldValue = this._getFieldValue(rowIndex, property);
    return StringHelper.isNullOrUndefinedOrEmpty(String(fieldValue)) ||
      (this._isNumber(fieldValue) && parseFloat(fieldValue) >= 0);
  }

  public setInputPropertyValue($event, context, property) {
    if (!isNullOrUndefined($event) && !isNullOrUndefined($event.event)) {
      if (!isNullOrUndefined($event.event.target)) {
        this._updateContextValue(context, property, $event.event.target.value);
      }
    }
  }

  public onSort($event) {
    // this._holidayAbsenceRequest has the current state of request object.
    this._yepApiRequest.SortBy.SortField = $event.SortField;
    this._yepApiRequest.SortBy.Direction = $event.Direction;
    this._yepApiRequest.PageNumber = 1;
    this._store.dispatch(new LoadYearEndProcedureResultsAction(this._yepApiRequest));
  }

  public onPageChange($event) {
    // this._holidayAbsenceRequest has the current state of request object.
    this._yepApiRequest.PageNumber = $event.pageNumber;
    this._yepApiRequest.PageSize = $event.noOfRows;
    this._store.dispatch(new LoadYearEndProcedureResultsAction(this._yepApiRequest));
  }

  public getThisYearTotalHolidaysValue(context): string {
    let yepResult = this._getYEPResultByIndex(context.Row);
    if (!isNullOrUndefined(yepResult)) {
      yepResult['ThisYearTotalHolidays'] = this.getThisYearTotalHolidays(yepResult['ReviewedHolidayEntitlement']
        , yepResult['ReviewedCarryForwardedUnits']
        , yepResult['ReviewedHolidayUnitType']);
      return yepResult['ThisYearTotalHolidays'];
    }

    return null;
  }

  public runYearEndProcedure() {
    this._isZeroEntitlementLoaded = false;
    this._onDemandLoaderCommand.next(true);
  }

  public onConfirmProcess(status) {
    this._showConfirmProcess = false;
    if (status == 'yes') {
      this.continueEvent.emit(this._context);
      this._store.dispatch(new UpdateYearEndProcedureReviewConfirmAction(this._yearEndProcedureData.Id));
    }
  }

  public autoSave(rowIndex: number) {
    this._isAutoSaveInProgress = true;
    let yepResult = this._getYEPResultByIndex(rowIndex);
    if (!isNullOrUndefined(yepResult) && yepResult.Changed === true) {
      if (this._resultsToSave.findIndex(c => c.Id.toLowerCase() ===
        yepResult.Id.toLowerCase()) === -1) {
        this._resultsToSave.push(yepResult);
      } else {
        this._resultsToSave = this._resultsToSave.filter(c => c.Id.toLowerCase() !==
          yepResult.Id.toLowerCase());
        this._resultsToSave.push(yepResult);
      }
    }
    this._resultsToSaveSubject.next(this._resultsToSave);
  }

  public getThisYearTotalHolidays(entitlement, cfUnits, unitType) {
    if (!this._isNumber(entitlement)) {
      entitlement = 0;
    }

    if (!this._isNumber(cfUnits)) {
      cfUnits = 0;
    }

    let total = parseFloat(entitlement) + parseFloat(cfUnits);
    return `${total} ${HolidayUnitType[unitType].toLowerCase()}`;
  }

  public reloadResults() {
    this._canShowStatusLoader = true;
    this._yepStatusSubscription = this._yepService.getYearEndProcedureStatus(this._yearEndProcedureData.Id).subscribe(data => {
      this._canShowStatusLoader = false;
      if (data.Status === YearEndProcedureStatus.AwaitingReview) {
        let result = Object.assign({}, this._yearEndProcedureData, { Status: parseInt(data.Status, 10) });
        this._store.dispatch(new LoadYearEndProcedureDataCompleteAction(result));
      }
      this._cdRef.markForCheck();
    });
  }

  public reRunYearEndProcedure() {
    this._store.dispatch(new UpdateYearEndProcedureAction(this._yearEndProcedureData));
  }

  ngOnInit() {
    this._yearendprocedureResults$ = this._store.let(fromRoot.getYearEndProcedureResultsData);
    this._totalRowsCount$ = this._store.let(fromRoot.getYEPResultsTotalCountData);
    this._dataTableOptions$ = this._store.let(fromRoot.getYEPResultDataTableOptionsData);
    this._yepResultsLoading$ = this._store.let(fromRoot.getYearEndProcedureResultsLoadedState);

    this._yearEndProcedureResultsSubscription =
      this._store.let(fromRoot.getYearEndProcedureResultsData).subscribe((results) => {
        if (!isNullOrUndefined(results)) {
          this._yepResults = results.toArray();
          this._cdRef.markForCheck();
        }
      });

    this._yearEndProcedureSubscription = this._store.let(fromRoot.getYearEndProcedureData).subscribe((data) => {
      if (!isNullOrUndefined(data)) {
        this._yearEndProcedureData = data;
        if (data.Status === YearEndProcedureStatus.AwaitingReview) {
          let params: AtlasParams = new AtlasParams('YearEndResultsByProcedureId', this._yearEndProcedureData.Id);
          this._yepApiRequest = new AtlasApiRequestWithParams(1, 10, 'ModifiedOn', SortDirection.Descending, []);
          this._yepApiRequest.Params = Array.of(params);
          this._store.dispatch(new LoadYearEndProcedureResultsAction(this._yepApiRequest));
        }
      }
      this._cdRef.markForCheck();
    });

    this._resultsToSaveSubjectSubscription = this._resultsToSaveSubject
      .debounceTime(5000)
      .subscribe((data: Array<YearEndProcedureResultModel>) => {
        if (!isNullOrUndefined(data) &&
          data.length > 0) {
          this._isAutoSaveInProgress = true;
          this._autoSaveResultSubscription = this._yepService.autoSaveYearEndProcedureResults(data).subscribe((resp) => {
            this._isAutoSaveInProgress = false;
            if (!isNullOrUndefined(resp) && resp.length > 0) {
              this._resultsToSave = this._resultsToSave.filter((c) => {
                return Array.from(resp)
                  .map(d => d['Id'].toLowerCase())
                  .indexOf(c.Id.toLowerCase()) === -1;
              });

              this._yepResults = this._yepResults.map(d => {
                if (Array.from(resp)
                  .map(e => e['Id'].toLowerCase())
                  .indexOf(d.Id.toLowerCase()) !== -1) {
                  d.Changed = false;
                }
                return d;
              });
            }
            this._cdRef.markForCheck();
          });
        }
      });

    this._zeroEntitlementSubscription = Observable.combineLatest(this._onDemandLoaderCommand,
      this._store.let(fromRoot.getZeroEntitlementEmployeesData)).subscribe((vals) => {
        if (StringHelper.coerceBooleanProperty(vals[0])) {
          if (isNullOrUndefined(vals[1])) {
            this._store.dispatch(new LoadEmployeesWithZeroEntitlementAction(this._yearEndProcedureData.Id));
          } else {
            this._employeeList = vals[1];
            if (this._employeeList.length > 0) {
              this._showConfirmProcess = true;
            } else {
              this._showConfirmProcess = false;
              this.continueEvent.emit(this._context);
              this._store.dispatch(new UpdateYearEndProcedureReviewConfirmAction(this._yearEndProcedureData.Id));
            }
            this._onDemandLoaderCommand.next(false);
            this._isZeroEntitlementLoaded = true;
          }
          this._cdRef.markForCheck();
        }
      });
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._yearEndProcedureSubscription)) {
      this._yearEndProcedureSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._zeroEntitlementSubscription)) {
      this._zeroEntitlementSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._autoSaveResultSubscription)) {
      this._autoSaveResultSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._yepStatusSubscription)) {
      this._yepStatusSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._resultsToSaveSubjectSubscription)) {
      this._resultsToSaveSubjectSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._yearEndProcedureResultsSubscription)) {
      this._yearEndProcedureResultsSubscription.unsubscribe();
    }
  }
  // end of public methods
}
