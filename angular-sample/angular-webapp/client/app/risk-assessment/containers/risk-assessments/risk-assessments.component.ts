import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeDatasourceType } from '../../../atlas-elements/common/ae-datasource-type';
import { AeInformationBarItemType } from '../../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { AeAutoCompleteModel } from '../../../atlas-elements/common/models/ae-autocomplete-model';
import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { Workspace } from '../../../checklist/models/workspace.model';
import { createSelectOptionFromArrayList } from '../../../employee/common/extract-helpers';
import { LoadSitesAction } from '../../../shared/actions/company.actions';
import {
    LoadRiskAssessmentTypesAction,
    LoadSectorsAction,
    WorkSpaceTypeLoadAction,
} from '../../../shared/actions/lookup.actions';
import * as fromConstants from '../../../shared/app.constants';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { CommonHelpers } from '../../../shared/helpers/common-helpers';
import { Sector } from '../../../shared/models/sector';
import * as fromRoot from '../../../shared/reducers';
import { LoadRiskAssessmentsCount } from '../../actions/risk-assessment-actions';
import { RiskAssessmentStatus } from '../../common/risk-assessment-status.enum';
import { RiskAssessmentConstants } from '../../risk-assessment-constants';
import { RiskAssessmentSecurityService } from '../../services/risk-assessment-security.service';
import { RiskAssessmentService } from '../../services/risk-assessment-service';
import { RouteParams } from '../../../shared/services/route-params';
import { CompanyLoadAction } from '../../../company/actions/company.actions';

@Component(
    {
        selector: 'risk-assessments',
        templateUrl: './risk-assessments.component.html',
        changeDetection: ChangeDetectionStrategy.OnPush
    }
)
export class RiskAssessmentsContainer extends BaseComponent implements OnInit, OnDestroy {

    private _overdueUrl = RiskAssessmentConstants.Routes.OverDue;
    private _pendingUrl = RiskAssessmentConstants.Routes.Pending;
    private _liveUrl = RiskAssessmentConstants.Routes.Live;
    private _examplesUrl = RiskAssessmentConstants.Routes.Examples;
    private _archivedUrl = RiskAssessmentConstants.Routes.Archived;
    private _siteOptionsSubscription: Subscription;
    private _siteOptionList: Immutable.List<AeSelectItem<string>>;
    private _defaultSiteOptions: Immutable.List<AeSelectItem<string>>;
    private _defaultSelectedAssessmentTypes: Array<AeSelectItem<string>>;
    private _workspaceListDataSubscription: Subscription;
    private _sectorSubscription: Subscription;
    private _selectedSectorSubscription: Subscription;
    private _assessmentTypeSubscription: Subscription;
    private _workSpaceItems: Array<Workspace>;
    private _dataSourceType: AeDatasourceType = AeDatasourceType.Local;
    private _sectorItems: Array<Sector>;
    private _selectedSectorId: string;
    private _defaultSelectedSectorItems: Array<Sector>;
    private _assessmentTypeItems: any;
    private _riskAssessmentInformationBarItems$: Observable<AeInformationBarItem[]>;
    private _initialSelectedAssessmentTypeOptions: Array<any>;
    private _riskAssessmentsCountByStatus: Map<string, number>;
    private _riskAssessmentSubscription: Subscription;
    private _riskAssessmentCountLoaded: boolean = false;;

    get defaultSelectedAssessmentTypes(): Array<AeSelectItem<string>> {
        return this._defaultSelectedAssessmentTypes;
    }

    get riskAssessmentCountLoaded(): boolean {
        return this._riskAssessmentCountLoaded;
    }
    get riskAssessmentInformationBarItems(): Observable<AeInformationBarItem[]> {
        return this._riskAssessmentInformationBarItems$;
    }
    get siteOptionList(): Immutable.List<AeSelectItem<string>> {
        return this._siteOptionList;
    }
    get dataSourceType(): AeDatasourceType {
        return this._dataSourceType;
    }
    get defaultSelectedSectorItems(): Array<Sector> {
        return this._defaultSelectedSectorItems;
    }
    get sectorItems(): Array<Sector> {
        return this._sectorItems;
    }
    get workSpaceItems(): Array<Workspace> {
        return this._workSpaceItems;
    }
    get assessmentTypeItems(): any {
        return this._assessmentTypeItems;
    }
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _router: Router
        , private _riskAssessmentSecurityService: RiskAssessmentSecurityService
        , private _routeParams: RouteParams
        , private _riskAssessmentService: RiskAssessmentService) {
        super(_localeService, _translationService, _cdRef);
        this._initialSelectedAssessmentTypeOptions = [];
        this._selectedSectorId = this._claimsHelper.getSectorId();
        this._defaultSiteOptions = Immutable.List([
            new AeSelectItem<string>('All Sites', '00000000-0000-0000-0000-000000000000', false)
        ]);
        this.id = "risk-assessment"
        this.name = "risk-assessment"
    }

    private _changeFilters() {
        this._store.dispatch(new LoadRiskAssessmentsCount({
            companyId: this._claimsHelper.getCompanyIdOrCid(),
            optional: 'optional'
        }));
        this._riskAssessmentService.reloadRAListEvent.emit(true);
    }

    ngOnInit() {
        this._workspaceListDataSubscription = this._store.let(fromRoot.getWorkSpaceTypeOptionListData).subscribe((res) => {
            if (!isNullOrUndefined(res)) {
                this._workSpaceItems = res;
            } else {
                this._store.dispatch(new WorkSpaceTypeLoadAction(true));
            }
        });
        let cid: string = this._routeParams.Cid;
        //when person who has example permission is viewing this list without cid option then we should not set any selectedSectorid
        if (!isNullOrUndefined(cid)) {
            this._selectedSectorSubscription = this._store.let(fromRoot.getCurrentCompanyDetails).subscribe(companyDetails => {
                if (!isNullOrUndefined(companyDetails)) {
                    this._selectedSectorId = companyDetails.SectorId ? companyDetails.SectorId : '';
                    this.loadInitialRiskAssessments();
                }
                else {
                    this._store.dispatch(new CompanyLoadAction(cid));
                }
            });
        } else {
            if (this._claimsHelper.canCreateExampleRiskAssessments() && isNullOrUndefined(cid)) {
                this._selectedSectorId = '';
            } else {
                this._selectedSectorId = this._claimsHelper.getSectorId() ? this._claimsHelper.getSectorId() : '';
            }
            this.loadInitialRiskAssessments();
        }

        this._assessmentTypeSubscription = this._store.let(fromRoot.getRiskAssessmentTypesData).subscribe((res) => {
            if (!isNullOrUndefined(res)) {
                this._assessmentTypeItems = res.toArray();
            } else {
                this._store.dispatch(new LoadRiskAssessmentTypesAction(false));
            }
        });

        this._riskAssessmentSubscription = this._store.let(fromRoot.getRiskAssessmentCountByStatus).subscribe((riskAssessmentsCount) => {
            if (!isNullOrUndefined(riskAssessmentsCount)) {
                this._riskAssessmentsCountByStatus = riskAssessmentsCount;
                this._riskAssessmentCountLoaded = true;
                this._cdRef.markForCheck();
            }
        })
        //Subscription to get Site Location Option Data, using existing effect
        this._siteOptionsSubscription = this._store.let(fromRoot.getSiteData).subscribe((res) => {
            if (!isNullOrUndefined(res)) {
                this._siteOptionList = Immutable.List<AeSelectItem<string>>(createSelectOptionFromArrayList(res, "Id", "SiteNameAndPostcode")); // from api
                this._siteOptionList = Immutable.List(this._defaultSiteOptions.toArray().concat(this._siteOptionList.toArray()));
                this._cdRef.markForCheck();
            } else {
                this._store.dispatch(new LoadSitesAction(false));
            }
        });
        // this._store.let(fromRoot.)
        let employeeId = this._claimsHelper.getEmpIdOrDefault();
        this._riskAssessmentService._loadRiskAssessmentInformationComponent(employeeId);
        this._riskAssessmentInformationBarItems$ = this._store.let(fromRoot.getRiskAssessmentInformationItems);
        // load count if any change
        this._store.let(fromRoot.geRiskAssessmentReviewStatus).takeUntil(this._destructor$).subscribe((val) => {
            if (val) {
                this._store.dispatch(new LoadRiskAssessmentsCount({ companyId: this._claimsHelper.getCompanyIdOrCid(), optional: "optional" }));
            }
        });
    }

    private loadInitialRiskAssessments() {
        this._sectorSubscription = this._store.let(fromRoot.getsectorsData).subscribe((res) => {
            if (!isNullOrUndefined(res)) {
                this._sectorItems = CommonHelpers.sortArray(res, 'Name', SortDirection.Ascending);
                this._defaultSelectedSectorItems = this._sectorItems.filter(item => item.Id === this._selectedSectorId.toLowerCase());
                let sectorid: string = '';
                if (this._defaultSelectedSectorItems && this._defaultSelectedSectorItems.length > 0) {
                    sectorid = this._defaultSelectedSectorItems[0].Id;
                }
                this._riskAssessmentService._filterByRiskAssessmentSector(sectorid);
                CommonHelpers.forceValueChange(() => {
                    this._riskAssessmentService._loadRiskAssessmentCounts();
                });
            } else {
                this._store.dispatch(new LoadSectorsAction(false));
            }
        });
    }

    private _setAssessmentTypeFilterInitialValues(Options): void {
        let selectedId = [];
        Options.forEach((item) => {
            this._initialSelectedAssessmentTypeOptions.push({ Text: item.Text, Value: item.Value });
            selectedId.push(item.Value);
        });
        this._riskAssessmentService._filterByRiskAssessmentType(selectedId.join());
    }

    private _getAssessmentTypeIds(assessmentTypes: AeSelectItem<any>[]): string {
        let assessmentTypeIds: string[] = [];
        assessmentTypes.forEach(element => {
            assessmentTypeIds.push(element.Value)
        });
        return assessmentTypeIds.join();
    }

    //public methods
    getOverdueUrl(): string {
        return this._overdueUrl;
    }
    getPendingUrl(): string {
        return this._pendingUrl;
    }
    getLiveUrl(): string {
        return this._liveUrl;
    }
    getExampleUrl(): string {
        return this._examplesUrl;
    }
    getArchivedUrl(): string {
        return this._archivedUrl;
    }

    canView(tabName: string) {
        return this._riskAssessmentSecurityService.canView(tabName);
    }

    getRiskAssessmentsCountByStatus(status: RiskAssessmentStatus): number {
        let zeroCount = 0;
        if (isNullOrUndefined(this._riskAssessmentsCountByStatus)) return zeroCount;
        let item = this._riskAssessmentsCountByStatus.get(status.toString());
        if (!isNullOrUndefined(item)) {
            return item;
        }
        return zeroCount;
    }


    riskAssessmentComponentItemClick(informationItem: AeInformationBarItem) {
        let assessmentTypes = '';
        let navigateUrl = ''
        let navigationExtras: NavigationExtras = {
            queryParamsHandling: 'merge',
        };
        switch (informationItem.Type) {
            case AeInformationBarItemType.ActiveRiskAssessments:
                this._defaultSelectedAssessmentTypes = [
                    this._assessmentTypeItems.find(x => x.Value.toLowerCase() === fromConstants.generalRiskAssessmentTypeId.toLowerCase())
                    , this._assessmentTypeItems.find(x => x.Value.toLowerCase() === fromConstants.generalMigratedRiskAssessmentTypeId.toLowerCase())
                ];
                navigateUrl = 'risk-assessment/live';
                break;
            case AeInformationBarItemType.ActiveCOSHHRiskAssessments:
                this._defaultSelectedAssessmentTypes = [
                    this._assessmentTypeItems.find(x => x.Value.toLowerCase() === fromConstants.coshhRiskAssessmentTypeId.toLowerCase())
                    , this._assessmentTypeItems.find(x => x.Value.toLowerCase() === fromConstants.coshhMigratedRiskAssessmentTypeId.toLowerCase())
                ];
                navigateUrl = 'risk-assessment/live';
                break;
            case AeInformationBarItemType.OverdueRiskAssessments:
                this._defaultSelectedAssessmentTypes = [];
                navigateUrl = 'risk-assessment/overdue';
                break;
            case AeInformationBarItemType.OutstandingAssessmentsActions:
                this._defaultSelectedAssessmentTypes = [
                    this._assessmentTypeItems.find(x => x.Value.toLowerCase() === fromConstants.generalRiskAssessmentTypeId.toLowerCase() || x.Value.toLowerCase() === fromConstants.coshhRiskAssessmentTypeId.toLowerCase())
                ];
                navigateUrl = 'risk-assessment/live';
                break;
            case AeInformationBarItemType.ExampleRiskAssessments:
                this._defaultSelectedAssessmentTypes = [];
                navigateUrl = 'risk-assessment/examples';
                break;
            default:
                break;
        }
        assessmentTypes = this._getAssessmentTypeIds(this._defaultSelectedAssessmentTypes);
        this._riskAssessmentService._filterByRiskAssessmentType(assessmentTypes);
        this._changeFilters();
        this._router.navigate([navigateUrl], navigationExtras);
    }
    onSiteFilterChange($event: any) {
        this._riskAssessmentService._filterByRiskAssessmentSite($event.SelectedValue.toString());
        this._changeFilters();
    }
    onWorkSpaceSelected(selected: Array<AeAutoCompleteModel<Workspace>>) {
        let workspaceId: string = '';
        if (!isNullOrUndefined(selected)) {
            selected.forEach((workspace, index) => {
                workspaceId += workspace.Value;
                if (index !== (selected.length - 1)) {
                    workspaceId += ',';
                }
            });
        }
        this._riskAssessmentService._filterByRiskAssessmentWorkSpace(workspaceId);
        this._changeFilters();
    }
    onClearWorkSpaceFilter($event: any) {
        this._riskAssessmentService._filterByRiskAssessmentWorkSpace('');
        this._changeFilters();
    }
    onRiskAssessmentNameFilterChange($event: any) {
        this._riskAssessmentService._filterByRiskAssessmentName($event.event.target.value);
        this._changeFilters();
    }

    onAssessmentTypeSelected(selected: Array<AeAutoCompleteModel<any>>) {
        let assessmentTypeId: string = '';
        if (!isNullOrUndefined(selected)) {
            selected.forEach((assessmentType, index) => {
                assessmentTypeId += assessmentType.Value;
                if (index !== (selected.length - 1)) {
                    assessmentTypeId += ',';
                }
            });
        }
        this._riskAssessmentService._filterByRiskAssessmentType(assessmentTypeId);
        this._changeFilters();
    }

    onClearAssessmentTypeFilter($event: any) {
        this._riskAssessmentService._filterByRiskAssessmentType('');
        this._changeFilters();
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
        this._riskAssessmentService._filterByRiskAssessmentSector(sectorId);
        this._changeFilters();
    }
    onClearSectorFilter($event: any) {
        this._riskAssessmentService._filterByRiskAssessmentSector('');
        this._changeFilters();
    }
    //public methods ends
    ngOnDestroy() {
        super.ngOnDestroy();
        if (this._siteOptionsSubscription)
            this._siteOptionsSubscription.unsubscribe();
        if (this._workspaceListDataSubscription)
            this._workspaceListDataSubscription.unsubscribe();
        if (this._sectorSubscription)
            this._sectorSubscription.unsubscribe();
        if (this._assessmentTypeSubscription)
            this._assessmentTypeSubscription.unsubscribe();
        if (this._riskAssessmentSubscription) {
            this._riskAssessmentSubscription.unsubscribe();
        }
        if (this._selectedSectorSubscription) {
            this._selectedSectorSubscription.unsubscribe();
        }
    }
}