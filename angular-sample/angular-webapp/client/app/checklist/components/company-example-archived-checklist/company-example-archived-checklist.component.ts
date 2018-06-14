import { CompanyLoadAction } from './../../../company/actions/company.actions';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeTemplateComponent } from '../../../atlas-elements/ae-template/ae-template.component';
import { AeAutoCompleteModel } from '../../../atlas-elements/common/models/ae-autocomplete-model';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { AePageChangeEventModel } from '../../../atlas-elements/common/models/ae-page-change-event-model';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { createSelectOptionFromArrayList } from '../../../employee/common/extract-helpers';
import { LoadSitesAction } from '../../../shared/actions/company.actions';
import { LoadSectorsAction } from '../../../shared/actions/lookup.actions';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { Sector } from '../../../shared/models/sector';
import * as fromRoot from '../../../shared/reducers';
import { MessengerService } from '../../../shared/services/messenger.service';
import { RouteParams } from '../../../shared/services/route-params';
import { ChecklistConstants } from '../../checklist-constants';
import { Checklist } from '../../models/checklist.model';
import { CompanyOrExampleOrArchivedChecklist } from '../../models/company-example-archived.model';
import { ChecklistService } from '../../services/checklist.service';

@Component({
  selector: 'company-example-archived-checklist',
  templateUrl: './company-example-archived-checklist.component.html',
  styleUrls: ['./company-example-archived-checklist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CompanyExampleArchivedChecklistComponent extends BaseComponent implements OnInit, OnDestroy {
  private _companyOrExampleOrArchivedList$: BehaviorSubject<Immutable.List<CompanyOrExampleOrArchivedChecklist>>;
  private _totalCount$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _loading$: Observable<boolean>;
  private _actions: Immutable.List<AeDataTableAction>;
  private _companyOrExampleOrArchivedListApiRequestParams: AtlasApiRequestWithParams;
  private _mandatoryApiRequestParams: AtlasApiRequestWithParams;
  private _keys = ['Id', 'Name', 'SiteName', 'SiteId', 'SiteLocation', 'WorkspaceTypes', 'Sectors'];
  private _isCompanyChecklistActive: boolean = false;
  private _isExampleChecklistActive: boolean = false;
  private _isArchivedChecklistActive: boolean = false;
  private _companyOrExampleOrArchivedListSubscription: Subscription;
  private _siteOptionList: Immutable.List<AeSelectItem<string>>;
  private _siteOptionsSubscription: Subscription;
  private _viewActionCommand: Subject<Checklist> = new Subject();
  private _defaultSiteOptions: Immutable.List<AeSelectItem<string>>;
  private _viewActionSubscription: Subscription;
  private _selectedChecklist: Checklist;
  private _sectorSubscription: Subscription;
  private _globalFilterNameChangeSubscription: Subscription;
  private _globalFilterWorkSpaceChangeSubscription: Subscription;
  private _isArchivedExampleChecklistActive: boolean = false;
  private _sectorItems: Array<Sector>;
  private _selectedSite: string;
  private _viewRequestSubscription: Subscription;
  private _selectedSectorId: string;
  private _defaultSelectedSectorItems: Array<Sector> = [];
  private _selectedSectorSubscription: Subscription;
  private _firstTimeNameLoad: boolean = true;
  private _firstTimeWorkSpaceLoad: boolean = true;
  private _loadTriggered: boolean = false;
  //bindings
  @ViewChild('popOverTemplate')
  _popOverTemplate: AeTemplateComponent<any>;
  //bindings

  get isCompanyChecklistActive() {
    return this._isCompanyChecklistActive;
  }

  get isArchivedChecklistActive() {
    return this._isArchivedChecklistActive;
  }

  get isExampleChecklistActive() {
    return this._isExampleChecklistActive;
  }

  get siteOptionList() {
    return this._siteOptionList;
  }

  get selectedSite() {
    return this._selectedSite;
  }

  get sectorItems() {
    return this._sectorItems;
  }

  get companyOrExampleOrArchivedList$() {
    return this._companyOrExampleOrArchivedList$;
  }

  get dataTableOptions$() {
    return this._dataTableOptions$;
  }

  get totalCount$() {
    return this._totalCount$;
  }

  get actions() {
    return this._actions;
  }

  get loading$() {
    return this._loading$;
  }

  get keys() {
    return this._keys;
  }
  get defaultSelectedSectorItems(): Array<Sector> {
    return this._defaultSelectedSectorItems;
  }

  getHelpText() {
    if (this.isCompanyChecklistActive) {
      return 'CHECKLIST_HELP_TEXT.COMPANY_CHECKLIST'
    } else if (this.isExampleChecklistActive) {
      return 'CHECKLIST_HELP_TEXT.EXAMPLE'
    } else if (this.isArchivedChecklistActive) {
      return 'CHECKLIST_HELP_TEXT.ARCHIVE'
    }
  }
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _checklistService: ChecklistService
    , private _router: Router, private _messenger: MessengerService
    , private _routeParams: RouteParams
    , private _claims: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
    this._companyOrExampleOrArchivedList$ = new BehaviorSubject(Immutable.List([]));

  }

  ngOnInit() {

    if (!this._claims.canCreateExampleChecklist()) {
      this._selectedSectorId = this._claims.getSectorId();
    } else if (this._claims.HasCid) {
      this._selectedSectorSubscription = this._store.let(fromRoot.getCurrentCompanyDetails).subscribe(companyDetails => {
        if (!isNullOrUndefined(companyDetails)) {
          this._selectedSectorId = companyDetails.SectorId;
          this._cdRef.markForCheck();
        }
        else {
          this._store.dispatch(new CompanyLoadAction(this._routeParams.Cid));
        }
      });
    }
    //Subscription to get Data, using existing effect
    this._actions = Immutable.List([
      new AeDataTableAction("View", this._viewActionCommand, false)
    ]);
    this._viewRequestSubscription = this._viewActionCommand.subscribe((item) => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      };
      if (!isNullOrUndefined(item)) {
        if (item.IsArchived) {
          if (item.IsExample) {
            this._router.navigate(["/checklist/example/archive", item.Id], navigationExtras);
          } else {
            this._router.navigate(["/checklist/archive", item.Id], navigationExtras);
          }
        }
        else if (item.IsExample) {
          if (this._claims.canCreateExampleChecklist() && !this._routeParams.Cid) {
            this._router.navigate(["/checklist/edit/example", item.Id], navigationExtras);
          }
          else {
            this._router.navigate(["/checklist/example", item.Id], navigationExtras);
          }
        }
        else {
          if (this._claims.canCreateChecklist() || this._routeParams.Cid) {
            this._router.navigate(["/checklist/edit/", item.Id], navigationExtras);
          }
          else {
            this._router.navigate(["/checklist/preview", item.Id], navigationExtras);
          }
        }
      }
    });
    this._defaultSiteOptions = Immutable.List([
      new AeSelectItem<string>('Any', '', false),
      new AeSelectItem<string>('All Sites', '00000000-0000-0000-0000-000000000000', false)
    ]);

    this._setActiveTabStatus();
    //this._loadCompanyChecklist();
    this._siteOptionsSubscription = this._store.let(fromRoot.getSiteData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._siteOptionList = Immutable.List<AeSelectItem<string>>(createSelectOptionFromArrayList(res, "Id", "SiteNameAndPostcode")); // from api
        this._siteOptionList = Immutable.List(this._defaultSiteOptions.toArray().concat(this._siteOptionList.toArray()));
        this._cdRef.markForCheck();
      } else {
        this._store.dispatch(new LoadSitesAction(false));
      }
    });
    this._sectorSubscription = this._store.let(fromRoot.getsectorsData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._sectorItems = res;
        if (!isNullOrUndefined(this._selectedSectorId) && (!this._claims.canCreateExampleChecklist() || (this._claims.HasCid && this._claims.CanCreateExampleChecklist)))
          this._defaultSelectedSectorItems = this._sectorItems.filter(item => item.Id === this._selectedSectorId.toLowerCase());
      } else {
        this._store.dispatch(new LoadSectorsAction(false));
      }
    });
    if (this._isCompanyChecklistActive) {
      this._loadCompanyChecklist();
      this._loadTriggered = true;
      this._companyOrExampleOrArchivedListSubscription = this._store.let(fromRoot.getCompanyChecklistData).subscribe(res => {
        if (!isNullOrUndefined(res)) {
          this._companyOrExampleOrArchivedList$.next(Immutable.List<CompanyOrExampleOrArchivedChecklist>(res));
        }
      });
      this._totalCount$ = this._store.let(fromRoot.getCompanyChecklistTotalCount);
      this._dataTableOptions$ = this._store.let(fromRoot.getCompanyChecklistPageInformation);
      this._loading$ = this._store.let(fromRoot.getCompanyChecklistLoadingStatus);
    }
    if (this._isExampleChecklistActive) {
      this._loadCompanyChecklist();
      this._loadTriggered = true;
      this._companyOrExampleOrArchivedListSubscription = this._store.let(fromRoot.getExampleChecklistData).subscribe(res => {
        if (!isNullOrUndefined(res)) {
          this._companyOrExampleOrArchivedList$.next(Immutable.List<CompanyOrExampleOrArchivedChecklist>(res));
        }
      });
      this._totalCount$ = this._store.let(fromRoot.getExampleChecklistTotalCount);
      this._dataTableOptions$ = this._store.let(fromRoot.getExampleChecklistPageInformation);
      this._loading$ = this._store.let(fromRoot.getExampleChecklistLoadingStatus);
    }
    if (this._isArchivedChecklistActive) {
      this._loadCompanyChecklist();
      this._loadTriggered = true;
      this._companyOrExampleOrArchivedListSubscription = this._store.let(fromRoot.getArchivedChecklistData).subscribe(res => {
        if (!isNullOrUndefined(res)) {
          this._companyOrExampleOrArchivedList$.next(Immutable.List<CompanyOrExampleOrArchivedChecklist>(res));
        }
      });
      this._totalCount$ = this._store.let(fromRoot.getArchivedChecklistTotalCount);
      this._dataTableOptions$ = this._store.let(fromRoot.getArchivedChecklistPageInformation);
      this._loading$ = this._store.let(fromRoot.getArchivedChecklistLoadingStatus);
    }
    //Duplicate code removed   
    if (this._isArchivedExampleChecklistActive) {
      this._loadCompanyChecklist();
      this._loadTriggered = true;
      this._companyOrExampleOrArchivedListSubscription = this._store.let(fromRoot.getArchivedChecklistData).subscribe(res => {
        if (!isNullOrUndefined(res)) {
          this._companyOrExampleOrArchivedList$.next(Immutable.List<CompanyOrExampleOrArchivedChecklist>(res));
        }
      });
      this._totalCount$ = this._store.let(fromRoot.getArchivedChecklistTotalCount);
      this._dataTableOptions$ = this._store.let(fromRoot.getArchivedChecklistPageInformation);
      this._loading$ = this._store.let(fromRoot.getArchivedChecklistLoadingStatus);
    }
    this._globalFilterNameChangeSubscription = this._store.let(fromRoot.getChecklistNameChange).subscribe(res => {
      if (!isNullOrUndefined(res) && !this._firstTimeNameLoad) {
        this._loadCompanyChecklist();
      }
      if (this._firstTimeNameLoad) {
        this._firstTimeNameLoad = false;
      }
    });
    this._globalFilterWorkSpaceChangeSubscription = this._store.let(fromRoot.getWorkSpaceChange).subscribe(res => {
      if (!isNullOrUndefined(res) && !this._firstTimeWorkSpaceLoad) {
        this._loadCompanyChecklist();
      }
      if (this._firstTimeWorkSpaceLoad) {
        this._firstTimeWorkSpaceLoad = false;
      }
    });
    if (!this._loadTriggered) {
      this._loadCompanyChecklist();
      this._loadTriggered = true;
    }
  }

  private _loadCompanyChecklist() {
    if (isNullOrUndefined(this._companyOrExampleOrArchivedListApiRequestParams))
      this._companyOrExampleOrArchivedListApiRequestParams = <AtlasApiRequestWithParams>{};
    this._companyOrExampleOrArchivedListApiRequestParams.PageNumber = 1;
    this._companyOrExampleOrArchivedListApiRequestParams.PageSize = 10;
    this._companyOrExampleOrArchivedListApiRequestParams.SortBy = <AeSortModel>{};
    this._companyOrExampleOrArchivedListApiRequestParams.SortBy.Direction = SortDirection.Ascending;
    this._companyOrExampleOrArchivedListApiRequestParams.SortBy.SortField = 'Name';
    this._companyOrExampleOrArchivedListApiRequestParams.Params = [];
    if (this._isCompanyChecklistActive) {
      this._companyOrExampleOrArchivedListApiRequestParams.Params.push(new AtlasParams('checklistSiteIdFilter', null));
      this._companyOrExampleOrArchivedListApiRequestParams.Params.push(new AtlasParams('isArchivedChecklistFilter', false));
      this._companyOrExampleOrArchivedListApiRequestParams.Params.push(new AtlasParams('isExample', false));
    }
    if (this._isExampleChecklistActive) {
      this._companyOrExampleOrArchivedListApiRequestParams.Params.push(new AtlasParams('sectorChecklistFilter', this._selectedSectorId ? this._selectedSectorId : null));
      this._companyOrExampleOrArchivedListApiRequestParams.Params.push(new AtlasParams('isArchivedChecklistFilter', false));
      this._companyOrExampleOrArchivedListApiRequestParams.Params.push(new AtlasParams('isExample', true));
    }
    if (this._isArchivedChecklistActive) {
      this._companyOrExampleOrArchivedListApiRequestParams.Params.push(new AtlasParams('isArchivedChecklistFilter', true));
      this._companyOrExampleOrArchivedListApiRequestParams.Params.push(new AtlasParams('isExample', false));
    }
    if (this._isArchivedExampleChecklistActive) {
      this._companyOrExampleOrArchivedListApiRequestParams.Params.push(new AtlasParams('isArchivedChecklistFilter', true));
      this._companyOrExampleOrArchivedListApiRequestParams.Params.push(new AtlasParams('isExample', true));
    }

    this._checklistService.LoadCompanyOrExampleChecklist(this._companyOrExampleOrArchivedListApiRequestParams);
  }

  onPageChange(pagingInfo: AePageChangeEventModel) {
    this._companyOrExampleOrArchivedListApiRequestParams.PageNumber = pagingInfo.pageNumber;
    this._companyOrExampleOrArchivedListApiRequestParams.PageSize = pagingInfo.noOfRows;
    this._checklistService.LoadCompanyOrExampleChecklist(this._companyOrExampleOrArchivedListApiRequestParams);
  }

  onSort(sortModel: AeSortModel) {
    this._companyOrExampleOrArchivedListApiRequestParams.SortBy = sortModel;
    this._checklistService.LoadCompanyOrExampleChecklist(this._companyOrExampleOrArchivedListApiRequestParams);
  }
  private _setActiveTabStatus(): void {
    let currentUrl = this._router.url;
    if (currentUrl.indexOf(ChecklistConstants.Routes.CompanyChecklists) !== -1) {
      this._isCompanyChecklistActive = true;
      this._isExampleChecklistActive = false;
      this._isArchivedChecklistActive = false;
      this._isArchivedExampleChecklistActive = false;
    }
    if (currentUrl.indexOf(ChecklistConstants.Routes.Examples) !== -1) {
      this._isExampleChecklistActive = true;
      this._isCompanyChecklistActive = false;
      this._isArchivedChecklistActive = false;
      this._isArchivedExampleChecklistActive = false;
    }
    if (currentUrl.indexOf(ChecklistConstants.Routes.Archived) !== -1) {
      this._isArchivedChecklistActive = true;
      this._isExampleChecklistActive = false;
      this._isCompanyChecklistActive = false;
      this._isArchivedExampleChecklistActive = false;
    }
    if (currentUrl.indexOf(ChecklistConstants.Routes.ArchivedExample) !== -1) {
      this._isArchivedExampleChecklistActive = true;
      this._isArchivedChecklistActive = false;
      this._isExampleChecklistActive = false;
      this._isCompanyChecklistActive = false;
    }
  }
  onSectorSelected(selected: Array<AeAutoCompleteModel<Sector>>) {
    let sectorId: string = '';
    if (!isNullOrUndefined(selected)) {
      selected.forEach((sector, index) => {
        sectorId += sector.Value;
        if (index !== (selected.length - 1)) {
          sectorId += ',';
        }
      });
    }
    this._companyOrExampleOrArchivedListApiRequestParams.Params.forEach((element) => {
      if (element.Key == 'sectorChecklistFilter') {
        element.Value = sectorId;
      }
    });

    this._companyOrExampleOrArchivedListApiRequestParams.PageNumber = 1;
    this._companyOrExampleOrArchivedListApiRequestParams.PageSize = 10;
    this._companyOrExampleOrArchivedListApiRequestParams.SortBy = <AeSortModel>{};
    this._companyOrExampleOrArchivedListApiRequestParams.SortBy.Direction = SortDirection.Ascending;
    this._companyOrExampleOrArchivedListApiRequestParams.SortBy.SortField = 'Name';
    this._checklistService.LoadCompanyOrExampleChecklist(this._companyOrExampleOrArchivedListApiRequestParams);
  }
  onClearSelected($event: any) {
    this._companyOrExampleOrArchivedListApiRequestParams.Params.forEach((element) => {
      if (element.Key == 'sectorChecklistFilter') {
        element.Value = null;
      }
    });
    this._companyOrExampleOrArchivedListApiRequestParams.PageNumber = 1;
    this._companyOrExampleOrArchivedListApiRequestParams.PageSize = 10;
    this._companyOrExampleOrArchivedListApiRequestParams.SortBy = <AeSortModel>{};
    this._companyOrExampleOrArchivedListApiRequestParams.SortBy.Direction = SortDirection.Ascending;
    this._companyOrExampleOrArchivedListApiRequestParams.SortBy.SortField = 'Name';
    this._checklistService.LoadCompanyOrExampleChecklist(this._companyOrExampleOrArchivedListApiRequestParams);
  }
  onChangeSite($event: any) {
    this._selectedSite = $event.SelectedValue;
    this._companyOrExampleOrArchivedListApiRequestParams.Params.forEach((element) => {
      if (element.Key == 'checklistSiteIdFilter') {
        element.Value = this._selectedSite;
      }
      this._companyOrExampleOrArchivedListApiRequestParams.PageNumber = 1;
      this._companyOrExampleOrArchivedListApiRequestParams.PageSize = 10;
      this._companyOrExampleOrArchivedListApiRequestParams.SortBy = <AeSortModel>{};
      this._companyOrExampleOrArchivedListApiRequestParams.SortBy.Direction = SortDirection.Ascending;
      this._companyOrExampleOrArchivedListApiRequestParams.SortBy.SortField = 'Name';
      this._checklistService.LoadCompanyOrExampleChecklist(this._companyOrExampleOrArchivedListApiRequestParams);
    })
  }

  getSiteName(siteName: string, location: string) {
    return this._checklistService.getSiteName(siteName, location);
  }

  ngOnDestroy() {
    if (this._companyOrExampleOrArchivedListSubscription)
      this._companyOrExampleOrArchivedListSubscription.unsubscribe();
    if (this._siteOptionsSubscription)
      this._siteOptionsSubscription.unsubscribe();
    if (this._globalFilterNameChangeSubscription)
      this._globalFilterNameChangeSubscription.unsubscribe();
    if (this._globalFilterWorkSpaceChangeSubscription)
      this._globalFilterWorkSpaceChangeSubscription.unsubscribe();
    if (this._sectorSubscription)
      this._sectorSubscription.unsubscribe();
    if (this._selectedSectorSubscription)
      this._selectedSectorSubscription.unsubscribe();

    this._viewRequestSubscription.unsubscribe();
  }
}