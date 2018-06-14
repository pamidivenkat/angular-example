import { AtlasApiResponse, AtlasApiRequestWithParams } from '../../shared/models/atlas-api-response';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';
import { ConstructionPhasePlan } from '../models/construction-phase-plans';
import { AeSortModel } from "../../atlas-elements/common/models/ae-sort-model";
export const ActionTypes = {
    CONSTRUCTION_PHASE_PLANS_LOAD: type('[CONSTRUCTIONPHASEPLANS] load contruction phase plans'),
    CONSTRUCTION_PHASE_PLANS_LOAD_COMPLETE: type('[CONSTRUCTIONPHASEPLANS] load contruction phase plans complete'),
    REMOVE_CONSTRUCTION_PHASE_PLAN: type('[CONSTRUCTIONPHASEPLANS] remove cpp'),
    COPY_CONSTRUCTION_PHASE_PLAN: type('[CONSTRUCTIONPHASEPLANS] copy cpp'),
    COPY_CONSTRUCTION_PHASE_PLAN_COMPLETE: type('[CONSTRUCTIONPHASEPLANS] copy cpp complete'),
    APPROVE_CONSTRUCTION_PHASE_PLAN: type('[CONSTRUCTIONPHASEPLANS] approve cpp'),
    APPROVE_CONSTRUCTION_PHASE_PLAN_COMPLETE: type('[CONSTRUCTIONPHASEPLANS] approve cpp complete'),
    LOAD_CONSTRUCTION_PHASE_PLAN_STATS: type('[CONSTRUCTIONPHASEPLANS] Load Stats Count'),
    LOAD_CONSTRUCTION_PHASE_PLAN_STATS_COMPLETE: type('[CONSTRUCTIONPHASEPLANS] Load Stats Count Complete'),
    CLEAR_CPP_PHASE_PLANS_LOAD: type('[CONSTRUCTIONPHASEPLANS] clear contruction phase plans load')
}

export class ClearConstructionPhasePlansLoadAction implements Action {
    type = ActionTypes.CLEAR_CPP_PHASE_PLANS_LOAD;
    constructor() {

    }
}

export class ConstructionPhasePlansLoadAction implements Action {
    type = ActionTypes.CONSTRUCTION_PHASE_PLANS_LOAD;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}

export class ConstructionPhasePlansLoadCompleteAction implements Action {
    type = ActionTypes.CONSTRUCTION_PHASE_PLANS_LOAD_COMPLETE;
    constructor(public payload: any) {

    }
}


export class RemoveCPPAction implements Action {
    type = ActionTypes.REMOVE_CONSTRUCTION_PHASE_PLAN;
    constructor(public payload: ConstructionPhasePlan) {

    }
}


export class CPPCopyAction implements Action {
    type = ActionTypes.COPY_CONSTRUCTION_PHASE_PLAN;
    constructor(public payload: ConstructionPhasePlan) {

    }
}

export class CPPCopyCompleteAction implements Action {
    type = ActionTypes.COPY_CONSTRUCTION_PHASE_PLAN_COMPLETE;
    constructor(public payload: string) {

    }
}

export class CPPApproveAction implements Action {
    type = ActionTypes.APPROVE_CONSTRUCTION_PHASE_PLAN;
    constructor(public payload: { IsExample: boolean, Id: string }) {

    }
}

export class CPPApproveCompleteAction implements Action {
    type = ActionTypes.APPROVE_CONSTRUCTION_PHASE_PLAN_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class LoadCPPStatsAction implements Action {
    type = ActionTypes.LOAD_CONSTRUCTION_PHASE_PLAN_STATS;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadCPPStatsCompleteAction implements Action {
    type = ActionTypes.LOAD_CONSTRUCTION_PHASE_PLAN_STATS_COMPLETE;
    constructor(public payload: AtlasApiResponse<any>) {
    }
}

export type Actions = ConstructionPhasePlansLoadAction
    | ConstructionPhasePlansLoadCompleteAction
    | RemoveCPPAction
    | CPPCopyAction
    | CPPCopyCompleteAction
    | LoadCPPStatsAction
    | LoadCPPStatsCompleteAction
