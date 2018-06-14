import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import { Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { RiskAssessment } from './../../models/risk-assessment';
import { Action } from '@ngrx/store';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import * as Immutable from 'immutable';
import * as raSharedActions from '../actions/ra-shared-actions';
import { extractDataTableOptions } from './../../../shared/helpers/extract-helpers';

export interface RASharedState {
    liveRiskAssessmentsLoaded: boolean;
    liveRiskAssessmentList: Immutable.List<RiskAssessment>;
    liveRiskAssessmentsPagingInfo: PagingInfo;
    liveRaApiRequestWithParams: AtlasApiRequestWithParams;
}

const initialState: RASharedState = {
    liveRiskAssessmentsLoaded: false,
    liveRiskAssessmentList: null,
    liveRiskAssessmentsPagingInfo: null,
    liveRaApiRequestWithParams: null
}

export function reducer(state = initialState, action: Action): RASharedState {
    switch (action.type) {
        case raSharedActions.ActionTypes.LOAD_LIVE_RISKASSESSMENTS:
            {
                return Object.assign({}, state, { liveRiskAssessmentsLoaded: false, liveRaApiRequestWithParams: action.payload });
            }

        case raSharedActions.ActionTypes.LOAD_LIVE_RISKASSESSMENTS_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, { liveRiskAssessmentsLoaded: true });


                if (!isNullOrUndefined(state.liveRiskAssessmentsPagingInfo)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.liveRiskAssessmentsPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                    }
                    modifiedState.liveRiskAssessmentsPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                    modifiedState.liveRiskAssessmentsPagingInfo.Count = action.payload.PagingInfo.Count;
                }
                else {
                    modifiedState.liveRiskAssessmentsPagingInfo = action.payload.PagingInfo;
                }
                modifiedState.liveRiskAssessmentList = Immutable.List<RiskAssessment>(action.payload.Entities);
                return modifiedState;

            }
        default:
            return state;
    }
}

export function getLiveRALoaded(state$: Observable<RASharedState>): Observable<boolean> {
    return state$.select(s => s && s.liveRiskAssessmentsLoaded);
}


export function getLiveRiskAssesmentsList(state$: Observable<RASharedState>): Observable<Immutable.List<RiskAssessment>> {
    return state$.select(s => s.liveRiskAssessmentList);
}

export function getLiveRiskAssesmentsTotalCount(state$: Observable<RASharedState>): Observable<number> {
    return state$.select(s => s && s.liveRiskAssessmentsPagingInfo && s.liveRiskAssessmentsPagingInfo.TotalCount);
}

export function getLiveRiskAssessmentsDataTableOptions(state$: Observable<RASharedState>): Observable<DataTableOptions> {
    return state$.select(s => s.liveRiskAssessmentList && s.liveRiskAssessmentsPagingInfo && extractDataTableOptions(s.liveRiskAssessmentsPagingInfo,s.liveRaApiRequestWithParams.SortBy));
}