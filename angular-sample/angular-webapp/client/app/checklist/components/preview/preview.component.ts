import { RouteParams } from './../../../shared/services/route-params';
import { Input } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { Observable, Subject } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { AeLoaderType } from '../../../atlas-elements/common/ae-loader-type.enum';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { AeSortModel, SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { Tristate } from '../../../atlas-elements/common/tristate.enum';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { Sector } from '../../../shared/models/sector';
import * as fromRoot from '../../../shared/reducers/index';
import { ChecklistLoadAction, DeleteAssignmentAction } from '../../actions/checklist.actions';
import { Periodicity } from '../../common/periodicity.enum';
import { CheckItem } from '../../models/checkitem.model';
import { CheckListAssignment } from '../../models/checklist-assignment.model';
import { Checklist, Site } from '../../models/checklist.model';
import { Workspace } from '../../models/workspace.model';
import { ChecklistService } from '../../services/checklist.service';
import { AePageChangeEventModel } from './../../../atlas-elements/common/Models/ae-page-change-event-model';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';

@Component({
    selector: 'checklist-preview',
    styleUrls: ['./preview.component.scss'],
    templateUrl: './preview.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})

export class PreviewComponent extends BaseComponent implements OnInit, OnDestroy {

    // Private Fields
    private _checklist: Checklist;
    private _workspaces: Array<Workspace>;
    private _sectors: Array<Sector>;
    private _checkItems$: Observable<Immutable.List<CheckItem>>;
    private _checkItemOptions: DataTableOptions;
    private _totalRecords$: Observable<number>;
    private _keys = Immutable.List(['Id', 'ItemText', 'YesNoAnswer', 'CorrectiveActionText']);
    private _assignmentsList$: Observable<Immutable.List<CheckListAssignment>>;
    private _assignmentsTotalCount$: Observable<number>;
    private _assignmentsDataTableOptions$: Observable<DataTableOptions>;
    private _assignmentsLoading$: Observable<boolean>;
    private _assignmentsListApiRequestParams: AtlasApiRequestWithParams;
    private _assignmentsKeys = ['Id', 'AssignedToId', 'IsReccuring', 'Site', 'ScheduledDate', 'Periodicity', 'AssignedTo', 'SiteId', 'SiteLocation'];
    private _isExample: boolean;
    private _isSlideoutOpen: boolean
    private _actions: Immutable.List<AeDataTableAction>;
    private _updateActionCommand = new Subject();
    private _deleteActionCommand = new Subject();
    private _selectedAssignment: CheckListAssignment;
    private _actionType: string;
    private _checklistId: string;
    private _showRemoveConfirmation: boolean;
    private _lightClass: AeClassStyle;
    private _reinstateConfirmation: boolean = false;
    private _apiParams: AtlasApiRequestWithParams;
    private _checklistCopyModel: Checklist;
    private _copySlideOut: boolean;
    private _loaderType: AeLoaderType = AeLoaderType.Bars;
    private _loadingStatus: boolean = false;
    private _navigationExtras: NavigationExtras;
    // End of Private Fields

    // Public properties
    @Input() context: any;

    get loaderType(): AeLoaderType {
        return this._loaderType;
    }

    get loadingStatus(): boolean {
        return this._loadingStatus
    }

    get bcGroup(): BreadcrumbGroup {
        return BreadcrumbGroup.Checklist;
    }

    get workspaces() {
        return this._workspaces;
    }

    get assignmentsList$(): Observable<Immutable.List<CheckListAssignment>> {
        return this._assignmentsList$;
    }

    get actionType(): string {
        return this._actionType;
    }

    get sectors() {
        return this._sectors;
    }

    get assignmentsTotalCount$(): Observable<number> {
        return this._assignmentsTotalCount$;
    }

    get checkItems$() {
        return this._checkItems$;
    }

    get assignmentsDataTableOptions$(): Observable<DataTableOptions> {
        return this._assignmentsDataTableOptions$;
    }

    get checkItemOptions() {
        return this._checkItemOptions;
    }

    get assignmentsKeys() {
        return this._assignmentsKeys;
    }

    get totalRecords$() {
        return this._totalRecords$;
    }
    get assignmentsLoading$(): Observable<boolean> {
        return this._assignmentsLoading$;
    }
    get showRemoveConfirmation(): boolean {
        return this._showRemoveConfirmation;
    }
    get keys() {
        return this._keys;
    }
    get actions(): Immutable.List<AeDataTableAction> {
        return this._actions;
    }
    get lightClass() {
        return this._lightClass;
    }

    get reinstateConfirmation() {
        return this._reinstateConfirmation;
    }

    get checklistName() {
        return this._checklist.Name;
    }

    get checklist() {
        return this._checklist;
    }

    get selectedAssignment(): CheckListAssignment {
        return this._selectedAssignment;
    }
    get assignedUser() {
        return this._selectedAssignment.AssignedTo.FullName;
    }
    get copySlideOut() {
        return this._copySlideOut;
    }
    get checklistCopyModel(): Checklist {
        return this._checklistCopyModel;
    }
    // End of Public properties

    // Constructor
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _store: Store<fromRoot.State>
        , private _route: ActivatedRoute
        , private _claims: ClaimsHelperService
        , private _checklistService: ChecklistService
        , private _router: Router
        , private _breadcrumbService: BreadcrumbService
        , private _routeParamsService: RouteParams
    ) {
        super(_localeService, _translationService, _cdRef);
        this._checkItemOptions = new DataTableOptions(1, 10);
        this._workspaces = [];
        this._isExample = false;
        this._isSlideoutOpen = false;
        this._lightClass = AeClassStyle.Light;
        this._navigationExtras = { queryParamsHandling: 'merge' }
    }
    // End of constructor

    // Private methods
    private _frequencyLabel(frequency): string {
        return Periodicity[frequency];
    }

    private _isArchivedChecklist(): boolean {
        return this._checklist && this._checklist.IsArchived;
    }

    private _showActions(): Tristate {
        return this._isArchivedChecklist() ? Tristate.False : Tristate.True;
    }

    private _isClientViewingExample(): boolean {
        return this._isExample && this._claims.IsCitationUser;
    }

    private _initialLoad(id: string) {
        this._apiParams = <AtlasApiRequestWithParams>{};

        if (!isNullOrUndefined(id)) {
            this._apiParams.Params = new Array(new AtlasParams('ChecklistAssignmentsByChecklistId', id));
            this._apiParams.PageNumber = 1;
            this._apiParams.PageSize = 10;
            this._apiParams.SortBy = <AeSortModel>{};
            this._apiParams.SortBy.Direction = SortDirection.Ascending;
            this._apiParams.SortBy.SortField = 'Name';
            this._checklistService.LoadChecklistAssignments(this._apiParams);
        }

        this._updateActionCommand.takeUntil(this._destructor$).subscribe((assignment) => {
            this._isSlideoutOpen = true;
            this._selectedAssignment = assignment as CheckListAssignment;
            this._actionType = 'update';
        })

        this._deleteActionCommand.takeUntil(this._destructor$).subscribe((assignment) => {
            this._selectedAssignment = assignment as CheckListAssignment;
            this._actionType = 'delete';
            this._showRemoveConfirmation = true;
        });
    }

    private getFrequency(periodicity: Periodicity) {
        let frequency = "";
        switch (periodicity) {
            case Periodicity.Annual:
                frequency = "Annual";
                break;
            case Periodicity.SemiAnnual:
                frequency = "Semi annual";
                break;
            case Periodicity.Quarterly:
                frequency = "Quartely";
                break;
            case Periodicity.Monthly:
                frequency = "Monthly";
                break;
            case Periodicity.Weekly:
                frequency = "Weekly";
                break;
            case Periodicity.Daily:
                frequency = "Daily";
                break;
            default:
                break;
        }
        return frequency;
    }

    private _isUsingCidAndConsultant(): boolean {
        return this._claims.getCompanyId() !== this._claims.getCompanyIdOrCid() && this._claims.canCreateExampleChecklist();
    }

    private _isArchivedExampleChecklist(): boolean {
        return this._claims.CanCreateExampleChecklist() && !this._claims.HasCid;
    }

    public isExampleChecklist(): boolean {
        return this._checklist && this._checklist.IsExample;
    }
    // End of private methods

    // Public methods
    canCopyToLibraryChecklist(): boolean {
        //return this._isClientViewingExample() && (this._claims.canCreateChecklist() || (!isNullOrUndefined(this._routeParamsService.Cid) || this._claims.isHSConsultant()));
        return this._isClientViewingExample() && this._claims.canCreateChecklist() && !this._isUsingCidAndConsultant() && !this._isArchivedExampleChecklist();
    }
    copyCheckList(_copyCLInfo) {
        this._checklistCopyModel.Name = _copyCLInfo.Name;
        this._checklistCopyModel.IsExample = _copyCLInfo.IsExample ? _copyCLInfo.IsExample : this._checklistCopyModel.IsExample;
        if (!isNullOrUndefined(_copyCLInfo.Site))
            this._checklistCopyModel.SiteId = _copyCLInfo.Site;
        if (!isNullOrUndefined(_copyCLInfo.SiteLocation))
            this._checklistCopyModel.SiteLocation = _copyCLInfo.SiteLocation;
        if (this._routeParamsService.Cid && this._checklistCopyModel.IsExample) {
            this._checklistCopyModel.IsExample = false;
        }
        this._checklistService.CopyChecklist({ checklist: this._checklistCopyModel, isExample: this._checklist.IsExample });

        this._copySlideOut = false;
        this._router.navigate(["/checklist"], this._navigationExtras);
    }
    onSort($event: AeSortModel) {
        this._apiParams.SortBy = $event;
        this._checklistService.LoadChecklistAssignments(this._apiParams)
    }

    canReinstateChecklist(): boolean {
        if (this._isArchivedChecklist()) {
            if (this._isExample) {
                return this._claims.canCreateExampleChecklist();
            } else {
                return (this._claims.canCreateChecklist() || (!isNullOrUndefined(this._routeParamsService.Cid) || this._claims.isHSConsultant()));
            }
        } else {
            return false;
        }
    }

    canCopyChecklist(): boolean {
        return this._isExample || this.canReinstateChecklist();
    }

    openReinstateCheckListModal(_checkList) {
        this._reinstateConfirmation = true;
    }

    reinstateConfirmModalClosed(event: any) {
        this._reinstateConfirmation = false;
    }

    reinstateChecklist(event: any) {
        this._checklist.IsArchived = false;
        this._checklistService.ArchiveOrReinstateChecklist(this._checklist);
        this._reinstateConfirmation = false;
        this._router.navigate(["/checklist"], this._navigationExtras);
    }

    removeModalClosed(): boolean {
        return this._showRemoveConfirmation = false;
    }

    removeAssignment() {
        this._store.dispatch(new DeleteAssignmentAction(this._selectedAssignment));
        this._showRemoveConfirmation = false;
    }

    getPictureUrl(pictureId: string): string {
        return "/filedownload?documentId=" + pictureId + "&isSystem=true"
    }

    hasOnlyPreviewTab(): boolean {
        if (this._isArchivedChecklist()) {
            return true;
        }
        if (this.isExampleChecklist() && this._claims.canCreateExampleChecklist() && !this._routeParamsService.Cid) {
            return false;
        }
        if (!this.isExampleChecklist() && this._claims.canCreateChecklist()) {
            return false;
        }
        return true;

    }
    getName(): string {
        return this._checklist ? this._checklist.Name : '';
    }

    showCheckItems(): boolean {
        return this._checklist && this._checklist.CheckItems && this._checklist.CheckItems.length > 0;
    }

    showSectors(): boolean {
        return this._isExample && this._sectors && this._sectors.length > 0;
    }

    showAssignments(): boolean {
        return (this._claims.canCreateChecklist() || (!isNullOrUndefined(this._routeParamsService.Cid) && this._claims.isHSConsultant())) || this._claims.canCreateExampleChecklist();
    }

    assignedToFullName(item: CheckListAssignment): string {
        return item ? (item.AssignedTo ? item.AssignedTo.FullName : '') : '';
    }

    showSiteName(item: CheckListAssignment): string {
        return item && item.SiteId !== '00000000-0000-0000-0000-000000000000' ? (item.SiteId && !isNullOrUndefined(item.Site) ? item.Site.Name : item.SiteLocation) : 'All sites';
    }

    onAdd() {
        this._isSlideoutOpen = true;
        this._actionType = 'add';
    }

    _getSlideoutState(): string {
        return this._isSlideoutOpen ? 'expanded' : 'collapsed';
    }

    getSlideoutAnimateState(): boolean {
        return this._isSlideoutOpen;
    }

    onAssignmentCancel() {
        this._isSlideoutOpen = false;
    }

    onAssignmentSubmit() {
        this._isSlideoutOpen = false;
    }

    getSlideoutState(): string {
        return this._copySlideOut ? 'expanded' : 'collapsed';
    }

    closeSlideOut(e) {
        this._copySlideOut = false;
    }

    openCopyCheckListSlide(isExample: boolean) {
        this._checklistCopyModel = Object.assign({}, this._checklist);
        this._checklistCopyModel.Name = null;
        this._checklistCopyModel.IsExample = this._isClientViewingExample() ? isExample : false;;
        this._checklistCopyModel.CompanyId = this._claims.getCompanyId();
        this._checklistCopyModel.IsArchived = false;
        if (isExample) {
            this._checklistCopyModel.SiteId = null;
            this._checklistCopyModel.Site = null;
        } else {

            this._checklistCopyModel.SiteId = "00000000-0000-0000-0000-000000000000";
            this._checklistCopyModel.Site = { Id: "00000000-0000-0000-0000-000000000000", Name: "All sites" } as Site;
        }
        this._checklistCopyModel.SiteLocation = null;
        this._copySlideOut = true;
    }

    ngOnInit() {
        this._actions = Immutable.List([
            new AeDataTableAction("Update", this._updateActionCommand, false, () => { return this._showActions() }),
            new AeDataTableAction("Remove", this._deleteActionCommand, false, () => { return this._showActions() })
        ]);
        this._checkItemOptions = new DataTableOptions(1, 10);
        this._workspaces = [];
        this._checkItems$ = this._store.let(fromRoot.getCurrentChecklistCheckItems);
        this._totalRecords$ = this._store.let(fromRoot.getCurrentChecklistCheckItemsLength);
        this._assignmentsList$ = this._store.let(fromRoot.getAssignmentsList);
        this._assignmentsTotalCount$ = this._store.let(fromRoot.getAssignmentsTotalCount);
        this._assignmentsDataTableOptions$ = this._store.let(fromRoot.getAssignmentsPageInformation);
        this._assignmentsLoading$ = this._store.let(fromRoot.getAssignmentsLoadingStatus);
        this._route.url.takeUntil(this._destructor$).subscribe((url) => {
            if (url.find(segment => segment.path === 'example')) {
                this._isExample = true;
            }
        })
        this._route.params.takeUntil(this._destructor$).subscribe((params) => {
            if (!isNullOrUndefined(params['id'])) {
                this._checklistId = params['id'];
                let apiParams = { id: this._checklistId, example: this._isExample }
                this._store.dispatch(new ChecklistLoadAction(apiParams));
            }
        });

        this._store.let(fromRoot.getCurrentChecklistData).takeUntil(this._destructor$).subscribe((checklist: Checklist) => {
            if (!isNullOrUndefined(checklist)) {
                this._checklist = checklist;
                this._workspaces = checklist.WorkspaceTypes;
                this._sectors = checklist.Sectors;
                this._initialLoad(this._checklist.Id);
                this._cdRef.markForCheck();
            }
        });

        this._store.let(fromRoot.getChecklistLoadingStatus).takeUntil(this._destructor$).subscribe((loading) => {
            this._loadingStatus = loading;
        })

    }
    onPageChange(pagingInfo: AePageChangeEventModel) {
        this._apiParams.PageNumber = pagingInfo.pageNumber;
        this._apiParams.PageSize = pagingInfo.noOfRows;
        this._checklistService.LoadChecklistAssignments(this._apiParams);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }
    // End of public methods
}