import { Action } from '@ngrx/store';
import { type } from './../../../shared/util';
import { Incident } from './../models/incident.model';
import { InvSection } from "./../models/incident-inv-section";
import { InvAnswer } from "./../models/incident-inv-answer";
import { RiskAssessment } from "./../../../risk-assessment/models/risk-assessment";
import { ConstructionPhasePlan } from "./../../../construction-phase-plans/models/construction-phase-plans";


export const ActionTypes = {
    INCIDENT_DETAILS_UPDATE: type('[INCIDENT] incident details - update'),
    INCIDENT_DETAILS_UPDATE_COMPLETE: type('[INCIDENT] incident details - update complete'),
    INCIDENT_FORMAL_INV_DETAILS_GET: type('[INCIDENT] incident formal investigation details get'),
    INCIDENT_FORMAL_INV_DETAILS_GET_COMPLETE: type('[INCIDENT] incident details get complete'),
    INCIDENT_FORMAL_INV_LOAD_APPLICABLE_SECTIONS: type('[INCIDENT] get incident sections'),
    INCIDENT_FORMAL_INV_LOAD_APPLICABLE_SECTIONS_COMPLETE: type('[INCIDENT] get incident sections complete'),
    INCIDENT_FORMAL_INV_UPDATE_SECTIONS: type('[INCIDENT] update incident sections'),
    LOAD_RISK_ASSESSMENTS: type('[RISKASSESSMENT] Load risk assessments'),
    LOAD_RISK_ASSESSMENTS_COMPLETE: type('[RISKASSESSMENT] Load risk assessments complete'),
    LOAD_METHOD_STATEMENTS: type('[METHODSTATEMENT] Load method statements'),
    LOAD_METHOD_STATEMENTS_COMPLETE: type('[METHODSTATEMENT] Load method statements complete'),
    INCIDENT_DETAILS_CLEAR_UPDATE_STATUS : type('[INCIDENT] clear incident update details status'),
}

/* Incident - Investigation Details Actions - Start */
export class IncidentDetailsUpdateAction implements Action {
    type = ActionTypes.INCIDENT_DETAILS_UPDATE;
    constructor(public payload: any) {

    }
}
export class IncidentDetailsUpdateCompleteAction implements Action {
    type = ActionTypes.INCIDENT_DETAILS_UPDATE_COMPLETE;
    constructor(public payload: string) {

    }
}
export class IncidentDetailsGetAction implements Action {
    type = ActionTypes.INCIDENT_FORMAL_INV_DETAILS_GET;
    constructor(public payload: string) {

    }
}
export class IncidentDetailsGetCompleteAction implements Action {
    type = ActionTypes.INCIDENT_FORMAL_INV_DETAILS_GET_COMPLETE;
    constructor(public payload: Incident) {

    }
}

export class IncidentLoadApplicableSectionsAction implements Action {
    type = ActionTypes.INCIDENT_FORMAL_INV_LOAD_APPLICABLE_SECTIONS;
    constructor(public payload: string) {
    }
}

export class IncidentLoadApplicableSectionsCompleteAction implements Action {
    type = ActionTypes.INCIDENT_FORMAL_INV_LOAD_APPLICABLE_SECTIONS_COMPLETE;
    constructor(public payload: Array<InvSection>) {
    }
}

export class IncidentUpdateSections implements Action {
    type = ActionTypes.INCIDENT_FORMAL_INV_UPDATE_SECTIONS;
    constructor(public payload: { data: Array<InvAnswer>, incidentId: string }) {
    }
}

export class LoadRiskAssessmentsAction implements Action {
    type = ActionTypes.LOAD_RISK_ASSESSMENTS;
    constructor(public payload: boolean) {
    }
}


export class LoadRiskAssessmentsCompleteAction implements Action {
    type = ActionTypes.LOAD_RISK_ASSESSMENTS_COMPLETE;
    constructor(public payload: Array<RiskAssessment>) {
    }
}


export class LoadMethodStatementsAction implements Action {
    type = ActionTypes.LOAD_METHOD_STATEMENTS;
    constructor(public payload: boolean) {
    }
}


export class LoadMethodStatementsCompleteAction implements Action {
    type = ActionTypes.LOAD_METHOD_STATEMENTS_COMPLETE;
    constructor(public payload: Array<ConstructionPhasePlan>) {
    }
}

export class ClearIncidentDetailsUpdateStatusAction implements Action {
    type = ActionTypes.INCIDENT_DETAILS_CLEAR_UPDATE_STATUS;
    constructor() {
    }
}

/* Incident - Investigation Details Actions - End */

export type Actions = IncidentDetailsUpdateAction
    | IncidentDetailsUpdateCompleteAction
    | IncidentDetailsGetAction
    | IncidentDetailsGetCompleteAction
    | IncidentLoadApplicableSectionsAction
    | IncidentLoadApplicableSectionsCompleteAction
    | IncidentUpdateSections
    | LoadRiskAssessmentsAction | LoadRiskAssessmentsCompleteAction
    | LoadMethodStatementsAction | LoadMethodStatementsCompleteAction;



