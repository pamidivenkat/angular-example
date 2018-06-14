import { ConstructionPhasePlanStatus } from '../../common/construction-phase-plans-view.enum';
import { LoadCPPStatsAction, ClearConstructionPhasePlansLoadAction } from './../../actions/construction-phase-plans.actions';
import { subscriptionLogsToBeFn } from 'rxjs/testing/TestScheduler';
import { getAtlasParamValueByKey } from '../../../root-module/common/extract-helpers';
import { AeInputType } from '../../../atlas-elements/common/ae-input-type.enum';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasParams, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ConstructionPhasePlan } from './../../models/construction-phase-plans';
import { Router, NavigationExtras } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs/Rx';

import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import * as fromRoot from '../../../shared/reducers';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import * as Immutable from 'immutable';
import * as fromConstants from '../../../shared/app.constants';
import { ConstructionPhasePlanService } from '../../services/construction-phase-plans.service';
import { isNullOrUndefined } from "util";

@Component({
    selector: 'construction-phase-plans',
    templateUrl: './construction-phase-plans.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConstructionPhasePlansComponent extends BaseComponent implements OnInit, OnDestroy {
    //private variables
    private _constructionPhasePlanListForm: FormGroup;
    private constructionPhasePlansApiRequestParams: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, []);
    private _inputType: AeInputType = AeInputType.text;
    private _searchDebounce: number;
    private _status: number;
    private _statsSubscription: Subscription;
    private _cppApiSubscription: Subscription;
    private _cppStatsCount: Array<any>;

    //end of private variables
    //Public properties
    get inputType() {
        return this._inputType;
    }

    get constructionPhasePlanListForm() {
        return this._constructionPhasePlanListForm
    }
    get searchDebounce() {
        return this._searchDebounce;
    }

    //End of public properties
    //constructor
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _fb: FormBuilder
        , private _store: Store<fromRoot.State>
        , private _ConstructionPhasePlanService: ConstructionPhasePlanService
        , private _router: Router
    ) {
        super(_localeService, _translationService, _cdRef);
        this._searchDebounce = 400;
    }

    //end of constructor


    // Public methods
    onAdd($event) {
        let navigationExtras: NavigationExtras = {
            queryParamsHandling: 'merge'
        };
        this._router.navigate(['construction-phase-plan/add'], navigationExtras);
    }
    getLiveUrl() {
        return 'live';
    }
    getPendingUrl() {
        return 'pending';
    }
    getOverdueUrl() {
        return 'overdue';
    }
    getCPPStatsCount(status: ConstructionPhasePlanStatus): number {
        let folderdata = 0;
        if (isNullOrUndefined(this._cppStatsCount)) return folderdata;
        let item = this._cppStatsCount.find(field => field.StatusId === status);
        if (!isNullOrUndefined(item)) {
            folderdata = this._cppStatsCount.find(field => field.StatusId === status).Count;
            this._cdRef.markForCheck();
        }
        return folderdata;
    }



    private _initForm() {
        this._constructionPhasePlanListForm = this._fb.group({
            searchCPPFilter: [""]
        })
    }

    ngOnInit() {
        this._initForm();

        if (isNullOrUndefined(this.constructionPhasePlansApiRequestParams))
            this.constructionPhasePlansApiRequestParams = <AtlasApiRequestWithParams>{};

        this._store.dispatch(new LoadCPPStatsAction(this.constructionPhasePlansApiRequestParams));
        this._statsSubscription = this._store.let(fromRoot.getConstructionPhasePlansStats).takeUntil(this._destructor$).subscribe(stats => {
            if (!isNullOrUndefined(stats)) {
                this._cppStatsCount = stats;
                this._cdRef.markForCheck();
                let navigationExtras: NavigationExtras = {
                    queryParamsHandling: 'merge'
                };
                if (this._router.url == '/construction-phase-plan' || (this._router.url.indexOf('/construction-phase-plan?cid') != -1)) {
                    this._router.navigate(['/construction-phase-plan/live'], navigationExtras);
                }
            }
        });

        this._cppApiSubscription = this._store.let(fromRoot.getConstructionPhasePlansApiRequest).takeUntil(this._destructor$).subscribe((values) => {
            if (!isNullOrUndefined(values) && !isNullOrUndefined(values.Params)) {
                if (getAtlasParamValueByKey(values.Params, 'statusCPPFilter')) {
                    this._status = getAtlasParamValueByKey(values.Params, 'statusCPPFilter');
                }
            }
        });

        this._constructionPhasePlanListForm.valueChanges.subscribe(data => {
            //clear all parameters and then assign from the form values    
            //only when the form is Valid
            if (this._constructionPhasePlanListForm.valid) {
                this.constructionPhasePlansApiRequestParams.PageNumber = 1;
                this.constructionPhasePlansApiRequestParams.Params = [];
                this.constructionPhasePlansApiRequestParams.Params.push(new AtlasParams('searchCPPFilter', data.searchCPPFilter));
                this.constructionPhasePlansApiRequestParams.Params.push(new AtlasParams('statusCPPFilter', this._status));
                this._ConstructionPhasePlanService.loadConstructionPhasePlans(this.constructionPhasePlansApiRequestParams);
                this._store.dispatch(new LoadCPPStatsAction(this.constructionPhasePlansApiRequestParams));
            }
        });
    }

    ngOnDestroy(): void {
        this._store.dispatch(new ClearConstructionPhasePlansLoadAction()); 
    }
    // End of public methods

}