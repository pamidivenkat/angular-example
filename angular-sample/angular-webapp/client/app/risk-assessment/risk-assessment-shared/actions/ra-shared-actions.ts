import { RiskAssessment } from './../../models/risk-assessment';
import { AtlasApiRequestWithParams, AtlasParams, AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';
import * as Immutable from 'immutable';

export const ActionTypes = {
    LOAD_LIVE_RISKASSESSMENTS: type('[RISKASSESSMENTSHARED] Load live risk assessment list'),
    LOAD_LIVE_RISKASSESSMENTS_COMPLETE: type('[RISKASSESSMENTSHARED] Load live risk assessment list complete')

}


export class LoadLiveRiskAssessmentsAction implements Action {
    type = ActionTypes.LOAD_LIVE_RISKASSESSMENTS;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}

export class LoadLiveRiskAssessmentsCompleteAction implements Action {
    type = ActionTypes.LOAD_LIVE_RISKASSESSMENTS_COMPLETE;
    constructor(public payload: AtlasApiResponse<RiskAssessment>) {

    }
}



export type Actions = LoadLiveRiskAssessmentsAction
    | LoadLiveRiskAssessmentsCompleteAction;
