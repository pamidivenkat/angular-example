import { IncidentPreviewVM } from '../../incident/models/incident-preview.model';
import { IncidentLogService } from '../../services/incident-log-service';
import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from '../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../shared/reducers';
import { Subscription } from 'rxjs/Subscription';
import { IncidentCategory } from '../../../shared/models/lookup.models';
import { FiscalYear } from '../../../shared/models/company.models';
import { isNullOrUndefined } from 'util';
import { LoadSitesAction, LoadFiscalYearsAction } from '../../../shared/actions/company.actions';
import { LoadIncidentCategories } from '../../../shared/actions/lookup.actions';
import { LoadIncidentLogFiltersAction, LoadIncidentsAction, LoadIncidentLogStatsAction } from '../../actions/incident-log.actions';
import { mapSiteLookupTableToAeSelectItems, mapIncidentCategoriesToAeSelectItems } from '../../../shared/helpers/extract-helpers';
import * as Immutable from 'immutable';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { IncidentStatus } from '../../models/incident-status.enum';
import { Router, NavigationExtras } from '@angular/router';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { LoadApplicableSitesAction } from '../../../shared/actions/user.actions';
import { Site } from '../../../shared/models/site.model';
@Component({
  selector: 'incident-log-container',
  templateUrl: './incident-log-container.component.html',
  styleUrls: ['./incident-log-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class IncidentLogContainerComponent extends BaseComponent implements OnInit, OnDestroy {
  private _sites: Immutable.List<AeSelectItem<string>>;
  private _categories: Immutable.List<AeSelectItem<string>>;

  private _sitesSubscription: Subscription;
  private _incidentCategoriesSubscription: Subscription;
  private _slideOut: boolean = false;
  private _incidentPreviewVM: IncidentPreviewVM;

  public get slideOut(): boolean {
    return this._slideOut;
  }
  public get sites() {
    return this._sites;
  }

  get incidentPreviewVM(): IncidentPreviewVM {
    return this._incidentPreviewVM;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _router: Router
    , private _breadcrumbService: BreadcrumbService
    , private _incidentLogService: IncidentLogService
  ) {
    super(_localeService, _translationService, _cdRef);
    // const bcItem: IBreadcrumb = { label: 'Incident log', url: '/incident' };
    // this._breadcrumbService.add(bcItem);
  }

  private _loadIncidentLogStats() {
    this._store.dispatch(new LoadIncidentLogStatsAction(true));
  }

  public onAddIncident() {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    }
    let navigateUrl = '/incident/add';
    this._router.navigate([navigateUrl], navigationExtras);
  }

  public onStatusChange(e) {

  }

  public onCategoryChange(e) {

  }

  public canShowIncidentList() {
    return this.canViewIncident() || this.canViewAllCompanyIncidents();
  }
  
  public canViewIncident() {
    return this._claimsHelper.canViewIncident();
  }

  public canViewAllCompanyIncidents() {
    return this._claimsHelper.canViewAllCompanyIncidents();
  }

  public canShowIncidentsInformation() {
    return this._claimsHelper.canViewAllCompanyIncidents() || this._claimsHelper.canHSConsultantViewIncidents();
  }

  public getSlideoutState(): string {
    return this._slideOut ? 'expanded' : 'collapsed';
  }

  public closeSlideOut(slideout) {
    this._slideOut = false;
  }

  public onSlideOutClose(slideout: boolean) {
    this._slideOut = slideout;
  }

  public onIncidentViewClick(incidentId: string) {
    this._incidentLogService.getIncidentDetails(incidentId).takeUntil(this._destructor$).subscribe((previewData) => {
      this._incidentPreviewVM = previewData;
      this._slideOut = true;
      this._cdRef.markForCheck();
    });
  }
  ngOnInit() {
    this._sitesSubscription = this._store.let(fromRoot.getSiteData).subscribe(sites => {
      if (isNullOrUndefined(sites)) {
        this._store.dispatch(new LoadSitesAction(true));
      } else {
        let sites1 = Immutable.List(sites);
        this._sites = mapSiteLookupTableToAeSelectItems(sites);
        this._cdRef.markForCheck();
      }
    });

    this._incidentCategoriesSubscription = this._store.let(fromRoot.getIncidentCategories).subscribe(categories => {
      if (isNullOrUndefined(categories)) {
        this._store.dispatch(new LoadIncidentCategories(true));
      } else {
        this._loadIncidentLogStats();
      }
    });
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._sitesSubscription)) {
      this._sitesSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._incidentCategoriesSubscription)) {
      this._incidentCategoriesSubscription.unsubscribe();
    }
  }
}
