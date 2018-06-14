import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Tristate } from '../../../atlas-elements/common/tristate.enum';
import {
  Component
  , OnInit
  , ChangeDetectorRef
  , Input
  , OnDestroy
  , EventEmitter
  , Output
  , ChangeDetectionStrategy
  , ViewEncapsulation
} from '@angular/core';
import { BaseComponent } from '../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { generateLastTenYears } from '../../common/extract-helpers';
import { EnumHelper } from '../../../shared/helpers/enum-helper';
import { IncidentStatus } from '../../models/incident-status.enum';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';
import * as fromRoot from '../../../shared/reducers';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IncidentListModel } from '../../models/incident-list-model';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AeSortModel, SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { Subject } from 'rxjs/Subject';
import { AeSelectEvent } from '../../../atlas-elements/common/ae-select.event';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IncidentFilterModel } from '../../models/incident-filter-model';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { LoadIncidentLogFiltersAction, LoadIncidentsAction, LoadIncidentLogStatsFiltersAction } from '../../actions/incident-log.actions';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'incident-log-list',
  templateUrl: './incident-log-list.component.html',
  styleUrls: ['./incident-log-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class IncidentLogListComponent extends BaseComponent implements OnInit, OnDestroy {
  private _sites: Immutable.List<AeSelectItem<string>> = Immutable.List([]);
  private _incidentCategories: Immutable.List<AeSelectItem<string>> = Immutable.List([]);
  private _years: Immutable.List<AeSelectItem<number>> = Immutable.List([]);
  private _statusList: Immutable.List<AeSelectItem<number>> = Immutable.List([]);

  private _keys = Immutable.List(['Id', 'ReferenceNumber', 'WhenHappened','WhenReported', 'CategoryName', 'ReportedUser', 'CreatedUser', 'CreatedBy', 'InjuredPersonName', 'StatusName']);
  private _loadingStatus$: Observable<boolean>;
  private _incidentsData$: Observable<Immutable.List<IncidentListModel>>;
  private _totalRecords$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _actions: Immutable.List<AeDataTableAction>;
  private _viewIncident: Subject<IncidentListModel> = new Subject();
  private _updateIncident: Subject<IncidentListModel> = new Subject();

  private _viewIncidentSubscription: Subscription;
  private _updateIncidentSubscription: Subscription;
  private _statsFilterSubscription: Subscription;
  private _incidentCategories$: Observable<Immutable.List<AeSelectItem<string>>>;

  private _filterParams: Map<string, string>;
  private _pagingParams: Map<string, string>;
  private _sortingParams: Map<string, string>;

  private _incidentsFilterForm: FormGroup;
  private _incidentFilterVM: IncidentFilterModel;
  private _isRiddorCheckedValue: boolean = false;

  @Input('sites')
  get sites() {
    return this._sites;
  }
  set sites(val: Immutable.List<AeSelectItem<string>>) {
    this._sites = val;
  }


  @Output('onIncidentViewClick')
  onIncidentViewClick: EventEmitter<string> = new EventEmitter<string>();

  public get keys() {
    return this._keys;
  }

  public get incidentCategories$() {
    return this._incidentCategories$;
  }

  public get years() {
    return this._years;
  }

  public get statusList() {
    return this._statusList;
  }

  public get isRiddorCheckedValue() {
    return this._isRiddorCheckedValue;
  }

  public get actions() {
    return this._actions;
  }

  public get dataTableOptions$() {
    return this._dataTableOptions$;
  }

  public get incidentsData$() {
    return this._incidentsData$;
  }

  public get totalRecords$() {
    return this._totalRecords$;
  }

  public get loadingStatus$() {
    return this._loadingStatus$;
  }

  public get incidentsFilterForm() {
    return this._incidentsFilterForm;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilder
    , private _router: Router
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _cdRef);
    this._loadingStatus$ = Observable.of(true);
  }

  private _initIncidentsFilterForm() {
    this._incidentFilterVM = new IncidentFilterModel();
    this._incidentFilterVM.Year = (new Date()).getFullYear();

    this._incidentsFilterForm = this._fb.group({
      Site: [{ value: this._incidentFilterVM.Site, disabled: false }],
      Category: [{ value: this._incidentFilterVM.Category, disabled: false }],
      Year: [{ value: this._incidentFilterVM.Year, disabled: false }],
      Status: [{ value: this._incidentFilterVM.Status, disabled: false }],
      IsRIDDOR: [{ value: this._incidentFilterVM.IsRIDDOR, disabled: false }]
    });
  }

  public onFiltersChange() {
    this._initPagingSortingParams();

    if (!StringHelper.isNullOrUndefinedOrEmpty(this._incidentFilterVM.Site)) {
      this._sortingParams.set('sortField', 'WhenReported');
      this._sortingParams.set('direction', 'ASC');
      this._pagingParams.set('pageNumber', '1');
      this._pagingParams.set('pageSize', '10');
      this._filterParams.set('IncidentViewBySiteIdFilter', this._incidentFilterVM.Site);
    }

    if (!StringHelper.isNullOrUndefinedOrEmpty(this._incidentFilterVM.Category)) {
      this._sortingParams.set('sortField', 'WhenReported');
      this._sortingParams.set('direction', 'ASC');
      this._pagingParams.set('pageNumber', '1');
      this._pagingParams.set('pageSize', '10');
      this._filterParams.set('IncidentViewByCategoryIdFilter', this._incidentFilterVM.Category);
    }

    if (!isNullOrUndefined(this._incidentFilterVM.Year)) {
      this._sortingParams.set('sortField', 'WhenReported');
      this._sortingParams.set('direction', 'ASC');
      this._pagingParams.set('pageNumber', '1');
      this._pagingParams.set('pageSize', '10');
      this._filterParams.set('IncidentViewByYearFilter', this._incidentFilterVM.Year.toString());
    }

    if (!isNullOrUndefined(this._incidentFilterVM.Status)) {
      this._sortingParams.set('sortField', 'WhenReported');
      this._sortingParams.set('direction', 'ASC');
      this._pagingParams.set('pageNumber', '1');
      this._pagingParams.set('pageSize', '10');
      this._filterParams.set('IncidentViewByStatusFilter', this._incidentFilterVM.Status.toString());
    }

    if (!isNullOrUndefined(this._incidentFilterVM.IsRIDDOR)) {
      this._sortingParams.set('sortField', 'WhenReported');
      this._sortingParams.set('direction', 'ASC');
      this._pagingParams.set('pageNumber', '1');
      this._pagingParams.set('pageSize', '10');
      this._filterParams.set('IncidentViewByIsRIDDORFilter', `${this._incidentFilterVM.IsRIDDOR}`);
    }

    this._loadIncidents();
  }

  public onPageChange($event: any) {
    this._pagingParams.set('pageNumber', $event.pageNumber);
    this._pagingParams.set('pageSize', $event.noOfRows);

    this._loadIncidents();
  }

  public onSort($event: AeSortModel) {
    this._sortingParams.set('sortField', $event.SortField);
    this._sortingParams.set('direction', $event.Direction === 1 ? 'ASC' : 'DESC');
    this._pagingParams.set('pageNumber', '1');

    this._loadIncidents();
  }

  private _loadIncidents() {
    let params = {
      Filters: this._filterParams,
      PagingInfo: this._pagingParams,
      SortingInfo: this._sortingParams
    };
    this._store.dispatch(new LoadIncidentLogFiltersAction(params));
    this._store.dispatch(new LoadIncidentsAction(params));
  }

  private _initPagingSortingParams() {
    this._pagingParams = new Map<string, string>();
    this._pagingParams.set('pageNumber', '1');
    this._pagingParams.set('pageSize', '10');
    this._pagingParams.set('TotalCount', '0');

    this._sortingParams = new Map<string, string>();
    this._sortingParams.set('sortField', 'WhenReported');
    this._sortingParams.set('direction', 'DESC');

    this._filterParams = new Map<string, string>();
  }

  ngOnInit() {
    this._years = generateLastTenYears();
    this._statusList = Immutable.List(EnumHelper.getAeSelectItems(IncidentStatus)
      .filter(item => item.Value === 1 || item.Value === 2));


    this._actions = Immutable.List([
      new AeDataTableAction('View', this._viewIncident, false, (item) => { return this._showViewAction() }),
      new AeDataTableAction('Update', this._updateIncident, false, (item) => { return this._showUpdateAction(item) }),
    ]);

    this._incidentCategories$ = this._store.let(fromRoot.getIncidentCategories);

    this._viewIncidentSubscription = this._viewIncident.subscribe((item) => {
      this.onIncidentViewClick.emit(item.Id);
    });

    this._updateIncidentSubscription = this._updateIncident.subscribe((item) => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      }
      let navigateUrl = "/incident/edit/" + item.Id;
      this._router.navigate([navigateUrl], navigationExtras);
    });


    this._statsFilterSubscription = this._store.let(fromRoot.getIncidentLogStatsFilters).subscribe((filters: Map<string, string>) => {
      if (!isNullOrUndefined(this._incidentsFilterForm) &&
        !isNullOrUndefined(filters) &&
        filters.size > 0) {
        let categoryInState = filters.get('IncidentsByCategoryIdFilter');
        if (!isNullOrUndefined(categoryInState)) {
          this._incidentsFilterForm.setValue({
            'Site': '',
            'Category': categoryInState,
            'Year': null,
            'Status': null,
            'IsRIDDOR': false
          });
          this.onFiltersChange();

          let filterParam = new Map<string, string>();
          this._store.dispatch(new LoadIncidentLogStatsFiltersAction(filterParam));
        }

        let statusInState = parseInt(filters.get('IncidentsByStatusFilter'), 10);
        if (!isNullOrUndefined(statusInState) &&
          !isNaN(statusInState)) {
          this._incidentsFilterForm.setValue({
            'Site': '',
            'Category': '',
            'Year': null,
            'Status': statusInState,
            'IsRIDDOR': false
          });
          this.onFiltersChange();

          let filterParam = new Map<string, string>();
          this._store.dispatch(new LoadIncidentLogStatsFiltersAction(filterParam));
        }
      }
      this._cdRef.markForCheck();
    });

    this._loadingStatus$ = this._store.let(fromRoot.getIncidentsDataLoad);
    this._incidentsData$ = this._store.let(fromRoot.getIncidentsData);
    this._totalRecords$ = this._store.let(fromRoot.getIncidentsTotalCount);
    this._dataTableOptions$ = this._store.let(fromRoot.getincidentsDataTableOptions);

    this._initIncidentsFilterForm();

    for (let name in this._incidentsFilterForm.controls) {
      if (this._incidentsFilterForm.controls.hasOwnProperty(name)) {
        let control = this._incidentsFilterForm.controls[name];
        control.valueChanges.subscribe(v => {
          if (name === 'IsRIDDOR' && isNullOrUndefined(v)) {
            this._isRiddorCheckedValue = false;
          } else if (name === 'IsRIDDOR') {
            this._isRiddorCheckedValue = StringHelper.coerceBooleanProperty(v);
          }

          this._incidentFilterVM[name] = v;
        });
      }
    }

    this.onFiltersChange();
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._viewIncidentSubscription)) {
      this._viewIncidentSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._updateIncidentSubscription)) {
      this._updateIncidentSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._statsFilterSubscription)) {
      this._statsFilterSubscription.unsubscribe();
    }
  }

  public _showUpdateAction(incident: IncidentListModel): Tristate {
    let userId = this._claimsHelper.getUserId();
    if (this._claimsHelper.canUpdateAllCompanyIncidents() || this._claimsHelper.canManageIncidents() || (this._claimsHelper.canUpdateIncident() && userId == incident.CreatedBy)) {
      return Tristate.True
    }
    else {
      Tristate.False;
    }
  }

  public _showViewAction(): Tristate {
    if (this._claimsHelper.canViewIncident() || this._claimsHelper.canViewAllCompanyIncidents())
      return Tristate.True;
    else
      Tristate.False;
  }
}
