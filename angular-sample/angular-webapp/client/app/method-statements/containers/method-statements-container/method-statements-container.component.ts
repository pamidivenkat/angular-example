import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../../shared/localization-config';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute, NavigationExtras } from "@angular/router";
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../shared/reducers';
import * as Immutable from 'immutable';
import { Subscription, Observable, Subject } from 'rxjs/Rx';
import { LoadMethodStatementsFiltersChangedAction, LoadMethodStatementsStatsAction, ClearMethodStatementStateAction } from './../../actions/methodstatements.actions';
import { FormGroup, FormBuilder, Validator } from '@angular/forms';
import { addOrUpdateAtlasParamValue } from '../../../root-module/common/extract-helpers';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../shared/models/atlas-api-response';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { SortDirection } from './../../../atlas-elements/common/models/ae-sort-model';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from './../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { LoadSitesAction } from './../../../shared/actions/company.actions';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { RouteParams } from "./../../../shared/services/route-params";
import { isNullOrUndefined } from "util";
import { StringHelper } from './../../../shared/helpers/string-helper';

@Component({
  selector: 'app-method-statements-container',
  templateUrl: './method-statements-container.component.html',
  styleUrls: ['./method-statements-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MethodStatementsContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _sites$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _methodStatementsFilterForm: FormGroup;
  private _sitesSubscription: Subscription;
  private _statsSubscription: Subscription;
  private _exampleStatsCount: number = 0;
  private _liveStatsCount: number = 0;
  private _pendingStatsCount: number = 0;
  private _completedStatsCount: number = 0;
  private _archivedStatsCount: number = 0;
  private _methodStatementsApiRequest: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, []);
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _routeSubscription: Subscription;
  private _initFlag: Number = 0;
  private _cidExists: boolean;
  private _initialRequest: boolean = true;
  // End of Private Fields

  // Public properties
  get methodStatementsApiRequest(): AtlasApiRequestWithParams {
    return this._methodStatementsApiRequest;
  }
  get cidExists(): boolean {
    return this._cidExists;
  }
  get methodStatementsFilterForm(): FormGroup {
    return this._methodStatementsFilterForm;
  }
  get liveStatsCount() {
    return this._liveStatsCount;
  }
  get pendingStatsCount() {
    return this._pendingStatsCount;
  }
  get completedStatsCount() {
    return this._completedStatsCount;
  }
  get exampleStatsCount() {
    return this._exampleStatsCount;
  }
  get sites$(): Observable<Immutable.List<AeSelectItem<string>>> {
    return this._sites$;
  }
  get archivedStatsCount() {
    return this._archivedStatsCount;
  }
  get getLiveUrl() {
    return this._getLiveUrl;
  }
  get getPendingUrl() {
    return this._getPendingUrl;
  }
  get getCompleteUrl() {
    return this._getCompleteUrl;
  }
  get getExamplesUrl() {
    return this._getExamplesUrl;
  }
  get getArchivedUrl() {
    return this._getArchivedUrl;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.MethodStatements;
  }

  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(private _localizationConfig: LocalizationConfig
    , protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectorRef: ChangeDetectorRef
    , private _activatedRoute: ActivatedRoute
    , private _router: Router
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _breadcrumbService: BreadcrumbService
    , private _routeParams: RouteParams

  ) {
    super(_localeService, _translationService, _changeDetectorRef);
    this.id = 'msList';
    this.name = 'msList';
    initLocalizationWithAdditionProviders(_localizationConfig, ['method-statements'])();
    // let bcItem: IBreadcrumb = { label: 'Method statements', url: '/method-statement' };
    // this._breadcrumbService.add(bcItem);
  }
  // End of constructor

  // Private methods
  private _getLiveUrl(): string {
    return 'live';
  }
  private _getPendingUrl(): string {
    return 'pending';
  }
  private _getCompleteUrl(): string {
    return 'completed';
  }
  private _getExamplesUrl(): string {
    return 'examples';
  }
  private _getArchivedUrl(): string {
    return 'archived';
  }
  // End of private methods

  // Public methods
  canCreateMethodStatements(): boolean {
    return (this._claimsHelper.canManageMethodStatements() || (!(isNullOrUndefined(this._routeParams.Cid)) && (this._claimsHelper.isHSConsultant() || this._claimsHelper.isAdministrator())))
  }
  canCreateExampleMethodStatements(): boolean {
    return this._claimsHelper.canCreateExampleMS()
  }
  ngOnInit() {
    this._cidExists = !(isNullOrUndefined(this._routeParams.Cid));
    //Un used code is removed
    this._sites$ = this._store.let(fromRoot.getsitesImmutableData);
    this._sitesSubscription = this._store.let(fromRoot.getSiteData).subscribe(sites => {
      if (!sites)
        this._store.dispatch(new LoadSitesAction(false));
    });
    this._statsSubscription = this._store.let(fromRoot.getMethodStatementsStats).subscribe(stats => {
      if (!stats)
        this._store.dispatch(new LoadMethodStatementsStatsAction(false));
      else {
        let exampleStatsCount = stats.filter(stats => stats.StatusId === -1);
        this._exampleStatsCount = exampleStatsCount[0].Count;
        if (this.canCreateMethodStatements()) {
          let pendingStatsCount = stats.filter(stats => stats.StatusId === 0);
          if (pendingStatsCount.length > 0)
            this._pendingStatsCount = pendingStatsCount[0].Count;
          else
            this._pendingStatsCount = 0;
          let liveStatsCount = stats.filter(stats => stats.StatusId === 1);
          if (liveStatsCount.length > 0)
            this._liveStatsCount = liveStatsCount[0].Count;
          else
            this._liveStatsCount = 0;
          let completedStatsCount = stats.filter(stats => stats.StatusId === 3);
          if (completedStatsCount.length > 0)
            this._completedStatsCount = completedStatsCount[0].Count;
          else
            this._completedStatsCount = 0;
          let archivedStatsCount = stats.filter(stats => stats.StatusId === 4);
          if (archivedStatsCount.length > 0)
            this._archivedStatsCount = archivedStatsCount[0].Count;
          else
            this._archivedStatsCount = 0;
        }

      }
    });

    this._methodStatementsFilterForm = this._fb.group({
      search: [{ value: '', disabled: false }],
      sites: [{ value: '', disabled: false }],
    });

    if (this._initialRequest) {
      this._store.dispatch(new ClearMethodStatementStateAction(true));
    }
  }

  onNameFilterChange($event: any) {
    this._initialRequest = false;
    this._methodStatementsApiRequest.Params = addOrUpdateAtlasParamValue(this._methodStatementsApiRequest.Params, 'ByNameOrReference', $event.event.target.value);
    this._store.dispatch(new LoadMethodStatementsFiltersChangedAction(this._methodStatementsApiRequest));
  }

  onSiteFilterChange($event: any) {
    this._initialRequest = false;
    this._methodStatementsApiRequest.Params = addOrUpdateAtlasParamValue(this._methodStatementsApiRequest.Params, 'MSBySiteId', $event.SelectedItem.Value);
    this._store.dispatch(new LoadMethodStatementsFiltersChangedAction(this._methodStatementsApiRequest));
  }

  navigateToAdd() {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    if (!StringHelper.isNullOrUndefinedOrEmpty(this._routeParams.Cid)) {
      navigationExtras.queryParams = { cid: this._routeParams.Cid };
    }
    this._router.navigate(['/method-statement/add'], navigationExtras);
  }

  navigateMenuUrl() {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    if (this._router.url == '/method-statement' || (this._router.url.indexOf('/method-statement?cid') != -1)) {
      if (this._claimsHelper.canCreateExampleMS()) {
        this._router.navigate(['/method-statement/examples'], navigationExtras);
      } else {
        this._router.navigate(['/method-statement/live'], navigationExtras);
      }
      return true;
    } else {
      return true;
    }
  }
  ngOnDestroy() {
    if (this._statsSubscription)
      this._statsSubscription.unsubscribe();
    if (this._sitesSubscription)
      this._sitesSubscription.unsubscribe();
  }
  // End of public methods
}
