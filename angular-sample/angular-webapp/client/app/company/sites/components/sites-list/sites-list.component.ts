import { SiteLoadByIdAction } from './../../actions/sites.actions';
import { AePageChangeEventModel } from '../../../../atlas-elements/common/models/ae-page-change-event-model';
import { SiteAssignment } from '../../models/site-assignments.model';
import { getAeSelectItemsFromEnum } from '../../../../employee/common/extract-helpers';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { SiteViews } from '../../common/sites-view.enum';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../../shared/models/atlas-api-response';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { isNullOrUndefined } from 'util';
import { AeSortModel } from '../../../../atlas-elements/common/models/ae-sort-model';
import { PagingInfo } from '../../../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { Site } from '../../models/site.model';
import { siteDataLoadStatus } from '../../../../shared/reducers/company.reducer';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import { MessengerService } from '../../../../shared/services/messenger.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { SitesService } from '../../services/sites.service';
import { EmployeeManageService } from '../../../../employee/services/employee-manage.service';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import * as fromRoot from '../../../../shared/reducers';
import * as Immutable from 'immutable';

@Component({
  selector: 'sites-list',
  templateUrl: './sites-list.component.html',
  styleUrls: ['./sites-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SitesListComponent extends BaseComponent implements OnInit, OnDestroy {
  private _sitesList$: BehaviorSubject<Immutable.List<Site>>;
  private _totalCount$: Observable<number>;
  private _sitesDataTableOptions$: Observable<DataTableOptions>;
  private _sitesLoading$: Observable<boolean>;
  private _siteAssignmentsData: Array<SiteAssignment>;
  private _siteAssignmentsSubscription$: Subscription;
  private _statusTypes: Immutable.List<AeSelectItem<number>>;
  private _actions: Immutable.List<AeDataTableAction>;
  private _detailsActionCommand = new Subject();
  private _associateEmployeeActionCommand = new Subject();
  private _detailsActionCommandSubscription$: Subscription;
  private _sitesApiRequestParams: AtlasApiRequestWithParams;
  private _associateEmployeeActionSubscription$: Subscription;
  private _siteListForm: FormGroup;
  private _keys = ['Id', 'Name', 'Address', 'Postcode', 'IsHeadOffice', 'IsActive'];
  private _filters: Map<string, string>;
  private _selectedSiteSub$: Subscription;
  private _routeParamsSub$: Subscription;

  @Output('aeAction')
  _aeAction: EventEmitter<Site> = new EventEmitter<Site>();
  @Output('aesAction')
  _aesAction: EventEmitter<Site> = new EventEmitter<Site>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilder
    , private _sitesService: SitesService
    , private _router: Router
    , private _messenger: MessengerService    
    , private _activatedRoute: ActivatedRoute
  ) {
    super(_localeService, _translationService, _cdRef);
    //Action buttons
    this._actions = Immutable.List([
      new AeDataTableAction("View", this._detailsActionCommand, false),
      new AeDataTableAction("Associate Employees", this._associateEmployeeActionCommand, false)
    ]);
    //End of action buittons
    this._sitesList$ = new BehaviorSubject(Immutable.List([]));
  }

  private _initialLoadSites() {
    if (isNullOrUndefined(this._sitesApiRequestParams))
      this._sitesApiRequestParams = <AtlasApiRequestWithParams>{};
    this._sitesApiRequestParams.PageNumber = 1;
    this._sitesApiRequestParams.PageSize = 10;
    this._sitesApiRequestParams.SortBy = <AeSortModel>{};
    this._sitesApiRequestParams.SortBy.Direction = SortDirection.Ascending;
    this._sitesApiRequestParams.SortBy.SortField = 'Name';
    this._sitesApiRequestParams.Params = [];
    this._sitesApiRequestParams.Params.push(new AtlasParams('filterSiteView', SiteViews.All));
    this._sitesService.LoadSites(this._sitesApiRequestParams);
  }

  private _initForm(_status: number) {
    this._siteListForm = this._fb.group({
      _statusType: [_status],
    })
  }

  onPageChange(pagingInfo: AePageChangeEventModel) {
    this._sitesApiRequestParams.PageNumber = pagingInfo.pageNumber;
    this._sitesApiRequestParams.PageSize = pagingInfo.noOfRows;
    this._sitesService.LoadSites(this._sitesApiRequestParams);
  }

  onSort(sortModel: AeSortModel) {
    this._sitesApiRequestParams.SortBy = sortModel;
    this._sitesService.LoadSites(this._sitesApiRequestParams);
  }

  getConsultants(siteId: string): string {
    let _consultantName = '';
    if (isNullOrUndefined(this._siteAssignmentsData)) return _consultantName;
    this._siteAssignmentsData.filter(x => x.Site.Id === siteId).map(consultant => {
      if (_consultantName == '') {
        _consultantName += consultant.User.FullName;
      } else {
        _consultantName += ',' + consultant.User.FullName;
      }
    });
    return _consultantName;
  }

  getPostCode(site: Site): string {
    return isNullOrUndefined(site.Address) ? "" : site.Address.Postcode;
  }

  get keys() {
    return this._keys;
  }

  get sitesList$() {
    return this._sitesList$;
  }

  get statusTypes() {
    return this._statusTypes;
  }

  get totalCount$() {
    return this._totalCount$;
  }

  get actions() {
    return this._actions;
  }

  get sitesDataTableOptions$() {
    return this._sitesDataTableOptions$;
  }

  get sitesLoading$() {
    return this._sitesLoading$;
  }

  get siteListForm() {
    return this._siteListForm;
  }


  ngOnInit() {
    this._statusTypes = getAeSelectItemsFromEnum(SiteViews)
    this._initForm(SiteViews.All);
    this._sitesService.LoadSiteAssignments();
    this._store.let(fromRoot.getSitesListData).takeUntil(this._destructor$).subscribe(res => {
      if (isNullOrUndefined(res)) {
        this._initialLoadSites();
      }
      else {
        this._sitesList$.next(Immutable.List<Site>(res));
      }
    });
    this._totalCount$ = this._store.let(fromRoot.getSitesTotalCount);
    this._sitesDataTableOptions$ = this._store.let(fromRoot.getSitesPageInformation);
    this._sitesLoading$ = this._store.let(fromRoot.getSitesLoadingStatus);
    this._siteAssignmentsSubscription$ = this._store.let(fromRoot.getSiteAssignmentsData).takeUntil(this._destructor$).subscribe((siteAssignments) => {
      if (!isNullOrUndefined(siteAssignments)) {
        this._siteAssignmentsData = siteAssignments;
      }
    });

    this._detailsActionCommandSubscription$ = this._detailsActionCommand.takeUntil(this._destructor$).subscribe(_site => {
      this._aeAction.emit(_site as Site);
    });

    this._associateEmployeeActionSubscription$ = this._associateEmployeeActionCommand.takeUntil(this._destructor$).subscribe(_site => {
      this._aesAction.emit(_site as Site);
    });

    this._store.let(fromRoot.getCompanyEmployeesData).takeUntil(this._destructor$).subscribe(status => {
      if (!status) {
        this._sitesService.LoadAllEmployees();
      }
    });

    this._routeParamsSub$ = this._activatedRoute.params.takeUntil(this._destructor$).subscribe((params) => {
      if (!isNullOrUndefined(params['id'])) {
        //when query string of id existing then load the details of this site ...
        this._store.dispatch(new SiteLoadByIdAction(params['id']));
      }
    });  

    this._selectedSiteSub$ = this._store.let(fromRoot.getSelectedSiteData).takeUntil(this._destructor$).subscribe(siteSelected => {
      if (!isNullOrUndefined(siteSelected)) {
        this._aeAction.emit(siteSelected as Site);
      }
    });
    this._siteListForm.valueChanges.subscribe(data => {
      //clear all parameters and then assign from the form values    
      //only when the form is Valid
      if (this._siteListForm.valid) {
        this._sitesApiRequestParams.Params = [];
        this._sitesApiRequestParams.Params.push(new AtlasParams('filterSiteView', data._statusType));
        this._sitesService.LoadSites(this._sitesApiRequestParams);
      }
    });

  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
