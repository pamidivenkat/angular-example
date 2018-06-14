import { extractDataTableOptions } from '../../shared/helpers/extract-helpers';
import { isNullOrUndefined } from 'util';
import { Action } from '@ngrx/store';
import { AeSortModel } from '../../atlas-elements/common/models/ae-sort-model';
import { ConstructionPhasePlan } from '../models/construction-phase-plans';
import * as ConstructionPhasePlanActions from '../actions/construction-phase-plans.actions';
import { Observable } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { AtlasApiResponse, AtlasApiRequestWithParams } from '../../shared/models/atlas-api-response';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from '../../atlas-elements/common/models/ae-datatable-options';

export interface ConstructionPhasePlanState {
    constructionPhasePlanList: Immutable.List<ConstructionPhasePlan>;
    apiRequestWithParams: AtlasApiRequestWithParams,
    constructionPhasePlanListTotalCount: number;
    loading: boolean,
    isCopyCompleted: boolean,
    isApproveCompleted: boolean,
    copiedCPPId: string,
    haCPPStatsloaded: boolean;
    cppStats: any[];
}


const initialState: ConstructionPhasePlanState = {
    constructionPhasePlanList: null,
    apiRequestWithParams: null,
    constructionPhasePlanListTotalCount: null,
    loading: false,
    isCopyCompleted: false,
    isApproveCompleted: false,
    copiedCPPId: null,
    haCPPStatsloaded: false,
    cppStats: null
}

export function ConstructionPhasePlanreducer(state = initialState, action: Action): ConstructionPhasePlanState {
    switch (action.type) {
        case ConstructionPhasePlanActions.ActionTypes.CONSTRUCTION_PHASE_PLANS_LOAD:
            {
                let modifiedState: ConstructionPhasePlanState = Object.assign({}, state, { loading: true, apiRequestWithParams: action.payload });
                modifiedState.apiRequestWithParams = Object.assign({}, <AtlasApiRequestWithParams>action.payload);
                modifiedState.apiRequestWithParams.Params = (<AtlasApiRequestWithParams>action.payload).Params;
                return modifiedState;
            }
        case ConstructionPhasePlanActions.ActionTypes.CONSTRUCTION_PHASE_PLANS_LOAD_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.apiRequestWithParams)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.constructionPhasePlanListTotalCount = action.payload.PagingInfo.TotalCount;
                    }
                }

                return Object.assign({}, modifiedState, { constructionPhasePlanList: action.payload.ConstructionPhasePlansList, loading: false });
            }
        case ConstructionPhasePlanActions.ActionTypes.COPY_CONSTRUCTION_PHASE_PLAN:
            {
                return Object.assign({}, state, { isCopyCompleted: false });
            }
        case ConstructionPhasePlanActions.ActionTypes.COPY_CONSTRUCTION_PHASE_PLAN_COMPLETE:
            {
                return Object.assign({}, state, { isCopyCompleted: true, copiedCPPId: action.payload });
            }
        case ConstructionPhasePlanActions.ActionTypes.APPROVE_CONSTRUCTION_PHASE_PLAN_COMPLETE:
            {
                return Object.assign({}, state, { isApproveCompleted: true });
            }
        case ConstructionPhasePlanActions.ActionTypes.LOAD_CONSTRUCTION_PHASE_PLAN_STATS: {
            let modifiedState = Object.assign({}, state, { haCPPStatsloaded: false });
            return modifiedState;
        }
        case ConstructionPhasePlanActions.ActionTypes.LOAD_CONSTRUCTION_PHASE_PLAN_STATS_COMPLETE: {
            let modifiedState = Object.assign({}, state, { haCPPStatsloaded: true, cppStats: action.payload });
            return modifiedState;
        }
        case ConstructionPhasePlanActions.ActionTypes.CLEAR_CPP_PHASE_PLANS_LOAD: {
            let modifiedState = Object.assign({}, state, { loading: false, apiRequestWithParams: null });
            return modifiedState;
        }
        default:
            return state;
    }
}

export function getConstructionPhasePlansListData(state$: Observable<ConstructionPhasePlanState>): Observable<Immutable.List<ConstructionPhasePlan>> {
    return state$.select(s => s && s.constructionPhasePlanList);
}

export function getConstructionPhasePlansTotalCount(state$: Observable<ConstructionPhasePlanState>): Observable<number> {
    return state$.select(s => s && s.constructionPhasePlanListTotalCount);
}

export function getCPPApiRequest(state$: Observable<ConstructionPhasePlanState>): Observable<AtlasApiRequestWithParams> {
    return state$.select(s => s.apiRequestWithParams);
};

export function getCPPStats(state$: Observable<ConstructionPhasePlanState>): Observable<any> {
    return state$.select(s => s.cppStats);
};



export function getConstructionPhasePlansPageInformation(state$: Observable<ConstructionPhasePlanState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.apiRequestWithParams && new DataTableOptions(state.apiRequestWithParams.PageNumber, state.apiRequestWithParams.PageSize, state.apiRequestWithParams.SortBy.SortField, state.apiRequestWithParams.SortBy.Direction));
}

export function getConstructionPhasePlansLoadingStatus(state$: Observable<ConstructionPhasePlanState>): Observable<boolean> {
    return state$.select(s => s && s.loading);
}

export function getConstructionPhasePlanCopyStatus(state$: Observable<ConstructionPhasePlanState>): Observable<boolean> {
    return state$.select(s => s && s.isCopyCompleted);
}

export function getConstructionPhasePlanApproveStatus(state$: Observable<ConstructionPhasePlanState>): Observable<boolean> {
    return state$.select(s => s && s.isApproveCompleted);
}

export function getCopiedConstructionPhasePlanId(state$: Observable<ConstructionPhasePlanState>): Observable<string> {
    return state$.select(s => s && s.copiedCPPId);
}