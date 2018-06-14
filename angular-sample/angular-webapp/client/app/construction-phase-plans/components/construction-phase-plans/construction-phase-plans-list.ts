import { getAtlasParamValueByKey, addOrUpdateAtlasParamValue } from '../../../root-module/common/extract-helpers';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { getAeSelectItemsFromEnum } from '../../../employee/common/extract-helpers';
import { ConstructionPhasePlanStatus } from '../../common/construction-phase-plans-view.enum';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { AePageChangeEventModel } from '../../../atlas-elements/common/models/ae-page-change-event-model';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { AeInputType } from '../../../atlas-elements/common/ae-input-type.enum';
import { isNullOrUndefined } from 'util';
import { BehaviorSubject, Observable, Subscription, Subject } from 'rxjs/Rx';
import { ConstructionPhasePlan } from '../../models/construction-phase-plans';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import {
    ConstructionPhasePlansLoadAction,
    CPPCopyAction,
    RemoveCPPAction
} from '../../actions/construction-phase-plans.actions';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { ConstructionPhasePlanService } from '../../services/construction-phase-plans.service';
import { RiskAssessmentStatus } from '../../../risk-assessment/common/risk-assessment-status.enum';
import { Tristate } from '../../../atlas-elements/common/tristate.enum';

@Component({
    selector: 'construction-phase-plans-list',
    templateUrl: './construction-phase-plans-list.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ConstructionPhasePlanListComponent extends BaseComponent implements OnInit, OnDestroy {
    // Private Fields
    private _constructionPhasePlansList$: Observable<Immutable.List<ConstructionPhasePlan>>;
    private _totalCount$: Observable<number>;
    private _constructionPhasePlansDataTableOptions$: Observable<DataTableOptions>;
    private _constructionPhasePlansLoading$: Observable<boolean>;
    private _actions: Immutable.List<AeDataTableAction>;
    private constructionPhasePlansApiRequestParams: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, []);
    private _statusTypes: Immutable.List<AeSelectItem<number>>;

    private _keys = ['Id', 'Name', 'ReferenceNumber', 'StartDate', 'ReviewDate', 'StatusId'];

    private _viewAction = new Subject();
    private _updateAction = new Subject();
    private _viewActionSub: Subscription;
    private _updateActionSub: Subscription;
    private _copyAction = new Subject();
    private _deleteAction = new Subject();
    private _copyActionSub: Subscription;
    private _deleteActionSub: Subscription;
    private _routeSubscription: Subscription;

    private _selectedCPP: ConstructionPhasePlan;
    private _showDeleteConfirm: boolean;
    private _showCopySlideout: boolean;
    private _lightClass: AeClassStyle = AeClassStyle.Light;
    private _showCPPCopySlideOut: boolean;
    private _copyCompletedSub: Subscription;
    // End of Private Fields

    // Public properties
    // End of Public properties


    get selectedCPP() {
        return this._selectedCPP;
    }
    get showDeleteConfirm() {
        return this._showDeleteConfirm;
    }
    get showCopySlideout() {
        return this._showCopySlideout;
    }
    get lightClass() {
        return this._lightClass;
    }
    get showCPPCopySlideOut() {
        return this._showCPPCopySlideOut;
    }
    get statusTypes() {
        return this._statusTypes;
    }
    get constructionPhasePlansList$() {
        return this._constructionPhasePlansList$;
    }
    get totalCount$() {
        return this._totalCount$;
    }
    get actions() {
        return this._actions;
    }
    get constructionPhasePlansDataTableOptions$() {
        return this._constructionPhasePlansDataTableOptions$;
    }
    get constructionPhasePlansLoading$() {
        return this._constructionPhasePlansLoading$;
    }
    get keys() {
        return this._keys;
    }
    // Public Output bindings
    /* @Output('Action')
     _Action: EventEmitter<ConstructionPhasePlan> = new EventEmitter<ConstructionPhasePlan>();
 
     @Output('Copy')
     _Copy: EventEmitter<ConstructionPhasePlan> = new EventEmitter<ConstructionPhasePlan>();
 
     @Output('Delete')
     _Delete: EventEmitter<ConstructionPhasePlan> = new EventEmitter<ConstructionPhasePlan>();*/
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    // End of Public ViewContent bidnings

    // constructor
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _ConstructionPhasePlanService: ConstructionPhasePlanService
        , private _store: Store<fromRoot.State>
        , private _fb: FormBuilder
        , private _activatedRoute: ActivatedRoute
        , private _router: Router
    ) {
        super(_localeService, _translationService, _cdRef);
        //Action buttons
        this._actions = Immutable.List([
            new AeDataTableAction("View", this._viewAction, false),
            new AeDataTableAction("Update", this._updateAction, false),
            new AeDataTableAction("Copy", this._copyAction, false),
            new AeDataTableAction("Remove", this._deleteAction, false, (item) => { return this._showDeleteDocumentAction(item) })
        ]);
        //End of action buittons


    }
    // End of constructor
    ngOnInit() {

        //  this._statusTypes = getAeSelectItemsFromEnum(ConstructionPhasePlanStatus)
        this._routeSubscription = this._activatedRoute.url.takeUntil(this._destructor$).subscribe((path) => {
            if (path.find(obj => obj.path.indexOf('live') >= 0)) {
                this._initialLoadConstructionPhasePlans(2);
            } else if (path.find(obj => obj.path.indexOf('pending') >= 0)) {
                this._initialLoadConstructionPhasePlans(1);
            } else {
                this._initialLoadConstructionPhasePlans(3);
            }
        });
        this._constructionPhasePlansList$ = this._store.let(fromRoot.getConstructionPhasePlansListData);
        this._totalCount$ = this._store.let(fromRoot.getConstructionPhasePlansTotalCount);
        this._constructionPhasePlansDataTableOptions$ = this._store.let(fromRoot.getConstructionPhasePlansPageInformation);
        this._constructionPhasePlansLoading$ = this._store.let(fromRoot.getConstructionPhasePlansLoadingStatus);

        this._copyCompletedSub = this._store.let(fromRoot.getCopiedConstructionPhasePlanId).subscribe(Id => {
            if (!isNullOrUndefined(Id)) {
                let navigationExtras: NavigationExtras = {
                    queryParamsHandling: 'merge'
                };
                this._router.navigate(['/construction-phase-plan/edit/' + Id], navigationExtras);
            }
        });



        this._viewActionSub = this._viewAction.subscribe(cpp => {
            let selectedItem: ConstructionPhasePlan = <ConstructionPhasePlan>cpp;
            let url: string = 'construction-phase-plan/preview/' + selectedItem.Id;
            this._router.navigate([url]);
        });
        this._updateActionSub = this._updateAction.subscribe(cpp => {
            let selectedItem: ConstructionPhasePlan = <ConstructionPhasePlan>cpp;
            //TODO:need to integrate view slide out here...
            let url: string = 'construction-phase-plan/edit/' + selectedItem.Id;
            let navigationExtras: NavigationExtras = {
                queryParamsHandling: 'merge'
            };
            this._router.navigate([url], navigationExtras);
        });

        this._deleteActionSub = this._deleteAction.subscribe(cpp => {
            let selectedItem: ConstructionPhasePlan = <ConstructionPhasePlan>cpp;
            this._selectedCPP = selectedItem;
            this._showDeleteConfirm = true;
        });

        this._copyActionSub = this._copyAction.subscribe(cpp => {
            let selectedItem: ConstructionPhasePlan = <ConstructionPhasePlan>cpp;
            this._selectedCPP = selectedItem;
            this._showCPPCopySlideOut = true;
        });
    }
    // Private methods
    private _showDeleteDocumentAction(item: ConstructionPhasePlan): Tristate {
        return item.StatusId == RiskAssessmentStatus.Pending ? Tristate.True : Tristate.False;
    }
    private _initialLoadConstructionPhasePlans(ConstructionPhasePlanStatus) {
        if (isNullOrUndefined(this.constructionPhasePlansApiRequestParams))
            this.constructionPhasePlansApiRequestParams = <AtlasApiRequestWithParams>{};
        this._store.let(fromRoot.getConstructionPhasePlansApiRequest).takeUntil(this._destructor$).subscribe((values) => {
            if (!isNullOrUndefined(values) && !isNullOrUndefined(values.Params)) {
                if (getAtlasParamValueByKey(values.Params, 'searchCPPFilter')) {
                    this.constructionPhasePlansApiRequestParams.Params = addOrUpdateAtlasParamValue(this.constructionPhasePlansApiRequestParams.Params, 'searchCPPFilter', getAtlasParamValueByKey(values.Params, 'searchCPPFilter'));
                }
            }
        });
        this.constructionPhasePlansApiRequestParams.Params = addOrUpdateAtlasParamValue(this.constructionPhasePlansApiRequestParams.Params, 'statusCPPFilter', ConstructionPhasePlanStatus);
        this._ConstructionPhasePlanService.loadConstructionPhasePlans(this.constructionPhasePlansApiRequestParams);
    }

    private _deleteCPP(item: ConstructionPhasePlan) {
        this._store.dispatch(new RemoveCPPAction(item));
    }



    // End of private methods

    // Public methods

    public onPageChange(pagingInfo: AePageChangeEventModel) {
        this.constructionPhasePlansApiRequestParams.PageNumber = pagingInfo.pageNumber;
        this.constructionPhasePlansApiRequestParams.PageSize = pagingInfo.noOfRows;
        this._ConstructionPhasePlanService.loadConstructionPhasePlans(this.constructionPhasePlansApiRequestParams);
    }

    public onSort(sortModel: AeSortModel) {
        this.constructionPhasePlansApiRequestParams.PageNumber = 1;
        this.constructionPhasePlansApiRequestParams.SortBy = sortModel;
        this._ConstructionPhasePlanService.loadConstructionPhasePlans(this.constructionPhasePlansApiRequestParams);
    }

    public onCopied(data: ConstructionPhasePlan) {
        // here need to raise on copied...      
        this._store.dispatch(new CPPCopyAction(data));
        this._showCPPCopySlideOut = false;
    }
    public closeCPPSlidOut($event) {
        this._showCPPCopySlideOut = false;
    }
    public getCPPCopySlideoutState() {
        return this._showCPPCopySlideOut ? 'expanded' : 'collapsed';
    }

    public deleteConfirmModalClosed($event) {
        if ($event == 'yes') {
            this._deleteCPP(this._selectedCPP);
        }
        this._showDeleteConfirm = false;
    }
    public getDocUploadSlideoutState(): string {
        return this._showDeleteConfirm ? 'expanded' : 'collapsed';
    }



    ngOnDestroy() {
        if (this._viewActionSub) {
            this._viewActionSub.unsubscribe();
        }
        if (this._updateActionSub) {
            this._updateActionSub.unsubscribe();
        }
        if (this._copyActionSub) {
            this._copyActionSub.unsubscribe();
        }
        if (this._deleteActionSub) {
            this._deleteActionSub.unsubscribe();
        }
        if (this._copyCompletedSub) {
            this._copyCompletedSub.unsubscribe();
        }

    }
    // End of public methods
}