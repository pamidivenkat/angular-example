import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { of } from 'rxjs/observable/of';
import { LoadSearchResultsAction, SearchResultsFiltersChangedAction } from './../actions/search.actions';
import { AeSelectItem } from './../../atlas-elements/common/models/ae-select-item';
import { AeSortModel, SortDirection } from './../../atlas-elements/common/models/ae-sort-model';
import { AePageChangeEventModel } from './../../atlas-elements/common/models/ae-page-change-event-model';
import { Store } from '@ngrx/store';
import { getSearchRequestData } from './../../shared/reducers/index';
import { AtlasApiRequestWithParams, AtlasParams } from './../../shared/models/atlas-api-response';
import { DataTableOptions } from './../../atlas-elements/common/models/ae-datatable-options';
import { SearchResult } from './../models/searchresult';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Observable , Subscription } from 'rxjs/Rx';
import { IBreadcrumb } from './../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../atlas-elements/common/services/breadcrumb-service';
import { AeIconSize } from './../../atlas-elements/common/ae-icon-size.enum';
import { BaseComponent } from './../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import * as Immutable from 'immutable';
import * as fromRoot from './../../shared/reducers';
import { filterSearchResults, addOrUpdateAtlasParamValue, getAtlasParamValueByKey } from './../common/extract-helpers';
import { BreadcrumbGroup } from '../../atlas-elements/common/models/ae-breadcrumb-group';
import { isNullOrUndefined } from "util";
import { FormGroup, FormBuilder } from "@angular/forms";

@Component({
  selector: 'at-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SearchResultComponent extends BaseComponent implements OnInit, OnDestroy {
  private _iconSmall: AeIconSize = AeIconSize.small;
  private _routeParamsSub: Subscription;
  private _searchTerm$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private _totalCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _searchResults$: BehaviorSubject<Immutable.List<SearchResult>> = new BehaviorSubject<Immutable.List<SearchResult>>(Immutable.List<SearchResult>([]));
  private _allSearchResults: SearchResult[] = [];
  private _searchResultDataTableOpts$: BehaviorSubject<DataTableOptions> = new BehaviorSubject<DataTableOptions>(null);
  private _loading$: Observable<boolean>;
  private _currentRequest: AtlasApiRequestWithParams;
  private _currentRequestSub: Subscription;
  private _keys: Immutable.List<string> = Immutable.List(['Id', 'Title', 'Description', 'EntityName', 'V2Link']);
  private _searchForOptions$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _sortByOptions$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _searchForValue$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private _sortValue:string = '4';
  private _isFirstTimeLoad: boolean = true;
  private _searchFormGroup: FormGroup;
  //public properties
  get iconSmall(): AeIconSize {
    return this._iconSmall;
  }
  get searchTerm$(): BehaviorSubject<string> {
    return this._searchTerm$;
  }
  get totalCount$(): BehaviorSubject<number> {
    return this._totalCount$;
  }
  get searchResults$(): BehaviorSubject<Immutable.List<SearchResult>> {
    return this._searchResults$;
  }
  get sortValue(): string {
    return this._sortValue;
  }
  get searchResultDataTableOpts$(): BehaviorSubject<DataTableOptions> {
    return this._searchResultDataTableOpts$;
  }
  get loading$(): Observable<boolean> {
    return this._loading$;
  }
  get keys(): Immutable.List<string> {
    return this._keys;
  }
  get searchForOptions$(): Observable<Immutable.List<AeSelectItem<string>>> {
    return this._searchForOptions$;
  }
  get searchForValue$(): BehaviorSubject<string> {
    return this._searchForValue$;
  }
  get sortByOptions$(): Observable<Immutable.List<AeSelectItem<string>>> {
    return this._sortByOptions$;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Search;
  }
  get searchFormGroup(): FormGroup {
    return this._searchFormGroup;
  }
  //end of public properties
  //view child bindings
  @ViewChild('searchFor') searchFor;
  //end of view child bindings
  constructor(protected _localeService: LocaleService, protected _translationService: TranslationService,
    protected _cdRef: ChangeDetectorRef, private _breadcrumbService: BreadcrumbService
    , private _route: ActivatedRoute
    , private _router: Router
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilder
  ) {
    super(_localeService, _translationService, _cdRef);
    const bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.Search, label: 'Search results', url: this._router.url};
    this._breadcrumbService.add(bcItem);
  }
  //private functions
  private _setSortByField(sortBy: string): string {
    let sortField: string;
    switch (sortBy) {
      case '2':
      case '3':
        sortField = 'CreatedOn'
        break;
      case '4':
      case '5':
        sortField = 'Title'
        break;
      default:
        sortField = 'Title'
        break;
    }
    return sortField;
  }
  private _setSortByDirection(sortBy: string): SortDirection {
    let sortDirection: SortDirection;
    switch (sortBy) {
      case '3':
      case '4':
        sortDirection = SortDirection.Ascending;
        break;
      case '2':
      case '5':
        sortDirection = SortDirection.Descending;
        break;
      default:
        sortDirection = SortDirection.Ascending;
        break;
    }
    return sortDirection;
  }
  private _sliceSearchResults(totalRecordsChanged: boolean) {
    let data = filterSearchResults(this._allSearchResults, this._currentRequest);
    let pagedData = Immutable.List<SearchResult>(data.list);
    data.totalCount = isNullOrUndefined(data.totalCount) ? 0 : data.totalCount;
    if (totalRecordsChanged) {
      this._totalCount$.next(data.totalCount);
    }
    this._searchResults$.next(pagedData);
    this._searchResultDataTableOpts$.next(new DataTableOptions(this._currentRequest.PageNumber, this._currentRequest.PageSize));  
  }

  private _sliceSearchResultsWithDataTableOptions() {
    this._sliceSearchResults(true);
    this._searchResultDataTableOpts$.next(new DataTableOptions(this._currentRequest.PageNumber, this._currentRequest.PageSize));
  }
  //end of private functions
  //public methods
  public submitOnSearch($event) {
    let text = this._searchFormGroup.controls['searchText'].value;
    if (!isNullOrUndefined(text)) {
      if (text != this._searchTerm$.value) {
        this.search($event);
      }
    }
  }
  public submitWhenEnter($event) {
    if ($event.which == 13 || $event.keyCode == 13) {
      if ($event.target.value != this._searchTerm$.value) {
        this.search($event);
      }
    }
  }

  public search($event) {
    let searchText = this._searchFormGroup.controls['searchText'].value;
    this._searchTerm$.next(searchText);
    this._currentRequest.PageNumber = 1;
    this._sortValue ='4';
    this._searchForValue$.next('');
    this._cdRef.markForCheck();
    this._store.dispatch(new LoadSearchResultsAction(new AtlasApiRequestWithParams(1, 10, 'Title', SortDirection.Ascending, [new AtlasParams('SearchTerm', searchText), new AtlasParams('SortBy', '4')])));
    //reset the client side filter of entity to null or get the data again to slice
  }
  public soryByChange($event) {
    this._sortValue =$event.SelectedValue;
    this._cdRef.markForCheck();
    this._currentRequest.SortBy.SortField = this._setSortByField($event.SelectedValue);
    this._currentRequest.SortBy.Direction = this._setSortByDirection($event.SelectedValue);
    this._store.dispatch(new SearchResultsFiltersChangedAction(this._currentRequest));
    this._sliceSearchResults(false);
  }
  public filterByEntity($event) {
    this._searchForValue$.next($event.SelectedValue);
    this._currentRequest.Params = addOrUpdateAtlasParamValue(this._currentRequest.Params, 'Entity', $event.SelectedValue);
    this._currentRequest.PageNumber = 1;
    this._store.dispatch(new SearchResultsFiltersChangedAction(this._currentRequest));
    this._sliceSearchResults(true);
  }

  public onPageChange($event: AePageChangeEventModel) {
    this._currentRequest.PageNumber = $event.pageNumber;
    this._currentRequest.PageSize = $event.noOfRows;
    this._sliceSearchResults(false);
  }

  public onSort($event: AeSortModel) {
    this._currentRequest.PageNumber =1;
    this._currentRequest.SortBy.SortField = $event.SortField;
    this._currentRequest.SortBy.Direction = $event.Direction;
    this._sliceSearchResults(false);
  }

  public onSearchItemClick($event, item: SearchResult) {
    let navigationExt: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    this._router.navigate([item.V2Link], navigationExt);
  }
  public getEntityIconTitle(item: SearchResult) {
    let iconName: string = '';
    switch (item.EntityName.toLowerCase()) {
      case 'shareddocument':
        iconName = 'Shared Document';
        break;
      case 'document':
        iconName = 'Document';
        break;
      case 'riskassessment':
        iconName = 'Risk Assessment';
        break;
      case 'constructionphaseplan':
        iconName = 'Construction Phase Plan';
        break;
      case 'methodstatement':
        iconName = 'Method Statement';
        break;
      case 'employee':
        iconName = 'Employee';
        break;
      case 'user':
        iconName = 'User';
        break;
      case 'site':
        iconName = 'Site';
        break;
    }
    return iconName;
  }
  public getEntityIcon(item: SearchResult) {
    let iconName: string = 'icon-bell';
    switch (item.EntityName.toLowerCase()) {
      case 'shareddocument':
        iconName = 'icon-document-shared';
        break;
      case 'document':
        iconName = 'icon-document';
        break;
      case 'riskassessment':
        iconName = 'icon-alert-triangle';
        break;
      case 'constructionphaseplan':
        iconName = 'icon-construction';
        break;
      case 'methodstatement':
        iconName = 'icon-processing';
        break;
      case 'employee':
        iconName = 'icon-people';
        break;
      case 'user':
        iconName = 'icon-users';
        break;
      case 'site':
        iconName = 'icon-building';
        break;
    }
    return iconName;
  }
  ngOnInit() {
    //this._totalCount$ = this._store.let(fromRoot.getSearchResultsTotalCountData);
    this._loading$ = this._store.let(fromRoot.getSearchResultsLoadedData);
    this._searchForOptions$ = this._store.let(fromRoot.getSearchEntitiesData);
    this._sortByOptions$ = this._store.let(fromRoot.getSortByData);
    this._routeParamsSub = this._route.params.subscribe((params) => {
      this._searchTerm$.next(params['term']);
      this._searchFormGroup = this._fb.group(
        { searchText: [{ value: params['term'], disabled: false }, null] }
      );
      this._store.dispatch(new LoadSearchResultsAction(new AtlasApiRequestWithParams(1, 10, 'Title', SortDirection.Ascending, [new AtlasParams('SearchTerm', this._searchTerm$.value), new AtlasParams('SortBy', '4')])));
    });

    this._currentRequestSub = Observable.combineLatest(this._store.let(fromRoot.getSearchRequestData), this._store.let(fromRoot.getSearchResultsData)).subscribe((vl) => {
      if (vl[0]) {
        this._currentRequest = vl[0];
        this._searchForValue$.next(getAtlasParamValueByKey(this._currentRequest.Params, 'Entity'));
      }
      if (vl[1]) {
        this._allSearchResults = vl[1];
      }
      if (vl[0] && vl[1] && vl[1].length > 0 && this._isFirstTimeLoad) {
        //when request and response values are set then we have to slice the data based on request
        this._sliceSearchResultsWithDataTableOptions();
        this._isFirstTimeLoad = false;
      }
      else if (vl[0] && vl[1] && vl[1].length > 0 && !this._isFirstTimeLoad) {
        this._sliceSearchResults(true);
      }
    });
  }
  ngOnDestroy() {
    if (this._routeParamsSub) {
      this._routeParamsSub.unsubscribe();
    }
    if (this._currentRequestSub) {
      this._currentRequestSub.unsubscribe();
    }
  }
}
