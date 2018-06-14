import { AtlasApiRequest, AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Rx';
import { Action, ActionReducer, combineReducers } from '@ngrx/store';
import * as incidentActions from '../actions/incident.actions';
import { compose } from '@ngrx/core';
import * as Immutable from 'immutable';
import { EmployeeFullEntity } from './../../../employee/models/employee-full.model';
import { InjuredPerson, InjuredParty, SelectedEmployeeDetails } from '../models/incident-injured-person.model';
import * as incidentInjuredPersonActions from '../actions/incident-injured-person.actions';
import * as incidentRIDDORActions from '../actions/incident-riddor.actions';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { IncidentReportedBy } from './../models/incident-reported-by.model';
import { Incident } from './../models/incident.model';
import * as incidentFormalInvestigationActions from '../actions/incident-formal-investigation.actions';
import { AboutInjury } from './../models/incident-about-injury.model';
import * as incidentAboutInjuryActions from '../actions/incident-about-injury.actions';
import { IncidentRIDDOR } from './../models/incident-riddor.model';
import { Site } from './../../../shared/models/site.model';
import { Address } from '../../../employee/models/employee.model';
import { InvSection } from "./../models/incident-inv-section";
import { RiskAssessment } from "./../../../risk-assessment/models/risk-assessment";
import { ConstructionPhasePlan } from "./../../../construction-phase-plans/models/construction-phase-plans";
import { AboutIncident } from "./../models/incident-about-incident";

export interface IncidentState {
    IncidentId: string,
    IsIncidentAboutYouDetailsAddUpdateStatus: boolean,
    HeadOfficeSite: Site,
    IsIncidentCompanyAddressDetailsGetInProgress: boolean,
    SelectedUserEmployeeDetails: Address,
    IsIncidentEmployeeDetailsByUserIdGetInProgress: boolean,
    IsInjuredPartyDataLoaded: boolean,
    InjuredPersonData: InjuredPerson,
    InjuredParty: InjuredParty[],
    IsInjurePersonDetailsAddUpdateStatus: boolean,
    SelectedInjuredPersonUserEmployeeDetails: SelectedEmployeeDetails,
    SelectedIncidentReportedByDetails: IncidentReportedBy,
    IsIncidentAboutYouDetailsGetInProgress: boolean,
    SelectedIncidentDetails: Incident,
    IsIncidentDetailsGetInProgress: boolean,
    IsIncidentDetailsAddUpdateInProgress: boolean,
    SelectedIncidentAboutIncidentDetails: AboutIncident,
    IsIncidentAboutIncidentDetailsGetInProgress: boolean,
    IsIncidentAboutIncidentDetailsAddUpdateStatus: boolean,
    IncidentReportedTo: IncidentRIDDOR;
    IncidentInvSection: Array<InvSection>;
    IsIncidentRiddorDetailsSaved: boolean;
    RiskAssessments: Array<RiskAssessment>;
    MethodStatements: Array<ConstructionPhasePlan>;
    IncidentUpdateStatus: boolean;
}

const initialState: IncidentState = {
    IncidentId: null,
    IsIncidentAboutYouDetailsAddUpdateStatus: false,
    HeadOfficeSite: null,
    IsIncidentCompanyAddressDetailsGetInProgress: false,
    SelectedUserEmployeeDetails: null,
    IsIncidentEmployeeDetailsByUserIdGetInProgress: false,
    IsInjuredPartyDataLoaded: false,
    InjuredPersonData: null,
    InjuredParty: null,
    IsInjurePersonDetailsAddUpdateStatus: false,
    SelectedInjuredPersonUserEmployeeDetails: null,
    SelectedIncidentReportedByDetails: null,
    IsIncidentAboutYouDetailsGetInProgress: false,
    SelectedIncidentDetails: null,
    IsIncidentDetailsGetInProgress: false,
    IsIncidentDetailsAddUpdateInProgress: false,
    SelectedIncidentAboutIncidentDetails: null,
    IsIncidentAboutIncidentDetailsGetInProgress: false,
    IsIncidentAboutIncidentDetailsAddUpdateStatus: false,
    IncidentReportedTo: null,
    IsIncidentRiddorDetailsSaved: null,
    IncidentInvSection: null,
    RiskAssessments: null,
    MethodStatements: null,
    IncidentUpdateStatus: false
}

export function incidentReducer(state = initialState, action: Action): IncidentState {
    switch (action.type) {
        case incidentActions.ActionTypes.INCIDENT_ABOUT_YOU_DETAILS_ADD:
            {
                return Object.assign({}, state, { IsIncidentAboutYouDetailsAddUpdateStatus: false });
            }
        case incidentActions.ActionTypes.INCIDENT_ABOUT_YOU_DETAILS_ADD_COMPLETE:
            {
                return Object.assign({}, state, { IsIncidentAboutYouDetailsAddUpdateStatus: true, IncidentId: action.payload });
            }
        case incidentActions.ActionTypes.INCIDENT_ABOUT_YOU_DETAILS_UPDATE:
            {
                return Object.assign({}, state, { IsIncidentAboutYouDetailsAddUpdateStatus: false });
            }
        case incidentActions.ActionTypes.INCIDENT_ABOUT_YOU_DETAILS_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { IsIncidentAboutYouDetailsAddUpdateStatus: true, IncidentId: action.payload, SelectedIncidentReportedByDetails: null });
            }
        case incidentActions.ActionTypes.INCIDENT_COMPANY_ADDRESS_DETAILS_GET:
            {
                return Object.assign({}, state, { IsIncidentCompanyAddressDetailsGetInProgress: true, HeadOfficeSite: null });
            }
        case incidentActions.ActionTypes.INCIDENT_COMPANY_ADDRESS_DETAILS_GET_COMPLETE:
            {
                return Object.assign({}, state, { IsIncidentCompanyAddressDetailsGetInProgress: false, HeadOfficeSite: action.payload });
            }
        case incidentActions.ActionTypes.INCIDENT_EMPLOYEE_DETAILS_BY_USER_ID_GET:
            {
                return Object.assign({}, state, { IsIncidentEmployeeDetailsByUserIdGetInProgress: true, SelectedUserEmployeeDetails: null });
            }
        case incidentActions.ActionTypes.INCIDENT_EMPLOYEE_DETAILS_BY_USER_ID_GET_COMPLETE:
            {
                return Object.assign({}, state, { IsIncidentEmployeeDetailsByUserIdGetInProgress: false, SelectedUserEmployeeDetails: action.payload });
            }
        case incidentInjuredPersonActions.ActionTypes.LOAD_INJURED_PARTY:
            {
                return Object.assign({}, state, { IsInjuredPartyDataLoaded: false });
            }
        case incidentInjuredPersonActions.ActionTypes.LOAD_INJURED_PARTY_COMPLETE:
            {
                if (action.payload) {
                    action.payload.push({ Id: '0', Name: 'Other' });
                }
                return Object.assign({}, state, { IsInjuredPartyDataLoaded: true, InjuredParty: action.payload });
            }
        case incidentInjuredPersonActions.ActionTypes.LOAD_INJURED_PERSON_DETAILS:
            {
                return Object.assign({}, state);
            }
        case incidentInjuredPersonActions.ActionTypes.LOAD_INJURED_PERSON_DETAILS_COMPLETE:
            {
                if (action.payload == null) {
                    action.payload = new InjuredPerson();
                }
                return Object.assign({}, state, { InjuredPersonData: action.payload });
            }
        case incidentInjuredPersonActions.ActionTypes.ADD_OR_UPDATE_INJURED_PERSON_DETAILS:
            {
                return Object.assign({}, state, { IsInjurePersonDetailsAddUpdateStatus: false });
            }
        case incidentInjuredPersonActions.ActionTypes.ADD_OR_UPDATE_INJURED_PERSON_DETAILS_COMPLETE:
            {
                return Object.assign({}, state, { IsInjurePersonDetailsAddUpdateStatus: true, InjuredPersonData: null, SelectedInjuredPersonUserEmployeeDetails: null, InjuredParty: null });
            }
        case incidentInjuredPersonActions.ActionTypes.INJURED_PERSON_EMPLOYEE_DETAILS_BY_USER_ID_GET:
            {
                return Object.assign({}, state, { SelectedInjuredPersonUserEmployeeDetails: null });
            }
        case incidentInjuredPersonActions.ActionTypes.INJURED_PERSON_EMPLOYEE_DETAILS_BY_USER_ID_GET_COMPLETE:
            {
                return Object.assign({}, state, { SelectedInjuredPersonUserEmployeeDetails: action.payload });
            }
        case incidentActions.ActionTypes.INCIDENT_ABOUT_YOU_DETAILS_GET:
            {
                return Object.assign({}, state, { IsIncidentAboutYouDetailsGetInProgress: true, SelectedIncidentReportedByDetails: null });
            }
        case incidentActions.ActionTypes.INCIDENT_ABOUT_YOU_DETAILS_GET_COMPLETE:
            {
                return Object.assign({}, state, { IsIncidentAboutYouDetailsGetInProgress: false, SelectedIncidentReportedByDetails: action.payload });
            }

        /* Formal Investigation - start */
        case incidentFormalInvestigationActions.ActionTypes.INCIDENT_DETAILS_UPDATE:
            {
                return Object.assign({}, state, { IncidentUpdateStatus: false });
            }
        case incidentFormalInvestigationActions.ActionTypes.INCIDENT_DETAILS_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { IncidentUpdateStatus: true });
            }
        case incidentFormalInvestigationActions.ActionTypes.INCIDENT_FORMAL_INV_DETAILS_GET:
            {
                return Object.assign({}, state, { SelectedIncidentDetails: null });
            }
        case incidentFormalInvestigationActions.ActionTypes.INCIDENT_FORMAL_INV_DETAILS_GET_COMPLETE:
            {
                return Object.assign({}, state, { SelectedIncidentDetails: action.payload });
            }
        case incidentFormalInvestigationActions.ActionTypes.INCIDENT_DETAILS_CLEAR_UPDATE_STATUS:
            {
                return Object.assign({}, state, { IncidentUpdateStatus: false });
            }
        /* Formal Investigation - end */

        /* About Injury - start */
        case incidentAboutInjuryActions.ActionTypes.INCIDENT_ABOUT_INCIDENT_DETAILS_ADD:
            {
                return Object.assign({}, state, { IsIncidentAboutIncidentDetailsAddUpdateStatus: false });
            }
        case incidentAboutInjuryActions.ActionTypes.INCIDENT_ABOUT_INCIDENT_DETAILS_ADD_COMPLETE:
            {
                return Object.assign({}, state, { IsIncidentAboutIncidentDetailsAddUpdateStatus: true, IncidentId: action.payload, SelectedIncidentAboutIncidentDetails : action.payload  });
            }
        case incidentAboutInjuryActions.ActionTypes.INCIDENT_ABOUT_INCIDENT_DETAILS_UPDATE:
            {
                return Object.assign({}, state, { IsIncidentAboutIncidentDetailsAddUpdateStatus: false });
            }
        case incidentAboutInjuryActions.ActionTypes.INCIDENT_ABOUT_INCIDENT_DETAILS_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { IsIncidentAboutIncidentDetailsAddUpdateStatus: true, IncidentId: action.payload.Id, SelectedIncidentAboutIncidentDetails : action.payload });
            }
        case incidentAboutInjuryActions.ActionTypes.INCIDENT_ABOUT_INCIDENT_DETAILS_GET:
            {
                return Object.assign({}, state, { IsIncidentAboutInjuryDetailsGetInProgress: true, SelectedIncidentAboutIncidentDetails: null });
            }
        case incidentAboutInjuryActions.ActionTypes.INCIDENT_ABOUT_INCIDENT_DETAILS_GET_COMPLETE:
            {
                return Object.assign({}, state, { IsIncidentAboutInjuryDetailsGetInProgress: false, SelectedIncidentAboutIncidentDetails: (action.payload == null ? new AboutInjury() : action.payload) });
            }
        /* About Injury - end */

        case incidentRIDDORActions.ActionTypes.LOAD_RIDDOR_COMPLETE:
            {
                return Object.assign({}, state, { IncidentReportedTo: action.payload });
            }
        case incidentRIDDORActions.ActionTypes.SAVE_RIDDOR:
            {
                return Object.assign({}, state, { IsIncidentRiddorDetailsSaved: false });
            }
        case incidentRIDDORActions.ActionTypes.SAVE_RIDDOR_COMPLETE:
            {
                return Object.assign({}, state, { IsIncidentRiddorDetailsSaved: true });
            }

        case incidentActions.ActionTypes.CLEAR_INCIDENT:
            {
                let modifiedState: IncidentState;
                let pl = action.payload;
                if (isNullOrUndefined(pl)) {
                    //clear is requestd in add mode so we need to clear straight away...
                    modifiedState = Object.assign({}, initialState, {});
                } else {
                    //payload is requested with one incident id
                    if (pl != state.IncidentId) {
                        //when requested id is not matching with that of state id then clear it off..
                        modifiedState = Object.assign({}, initialState, {});
                    } else {
                        //assign existing state  
                        modifiedState = Object.assign({}, state, {});
                    }
                }
                return modifiedState;
            }
        case incidentFormalInvestigationActions.ActionTypes.INCIDENT_FORMAL_INV_LOAD_APPLICABLE_SECTIONS: {
            return Object.assign({}, state, { IncidentInvSection: null });
        }
        case incidentFormalInvestigationActions.ActionTypes.INCIDENT_FORMAL_INV_LOAD_APPLICABLE_SECTIONS_COMPLETE: {
            return Object.assign({}, state, { IncidentInvSection: action.payload });
        }

        case incidentFormalInvestigationActions.ActionTypes.LOAD_RISK_ASSESSMENTS: {
            return Object.assign({}, state, { RiskAssessments: null });
        }
        case incidentFormalInvestigationActions.ActionTypes.LOAD_RISK_ASSESSMENTS_COMPLETE: {
            return Object.assign({}, state, { RiskAssessments: action.payload });
        }
        case incidentFormalInvestigationActions.ActionTypes.LOAD_METHOD_STATEMENTS: {
            return Object.assign({}, state, { MethodStatements: null });
        }
        case incidentFormalInvestigationActions.ActionTypes.LOAD_METHOD_STATEMENTS_COMPLETE: {
            return Object.assign({}, state, { MethodStatements: action.payload });
        }


        default:
            return state;
    }
}


export function getIncidentId(state$: Observable<IncidentState>): Observable<string> {
    return state$.select(s => s.IncidentId);
}
export function getIncidentCompanyAddress(state$: Observable<IncidentState>): Observable<Site> {
    return state$.select(s => s.HeadOfficeSite);
}
export function getIncidentSelectedUserEmployeeDetails(state$: Observable<IncidentState>): Observable<Address> {
    return state$.select(s => s.SelectedUserEmployeeDetails);
}
export function getIncidentReportedByDetails(state$: Observable<IncidentState>): Observable<IncidentReportedBy> {
    return state$.select(s => s.SelectedIncidentReportedByDetails);
}
export function getIncidentAboutYouDetailsAddUpdateProgressStatus(state$: Observable<IncidentState>): Observable<boolean> {
    return state$.select(s => s.IsIncidentAboutYouDetailsAddUpdateStatus);
}
export function getIncidentCompanyAddressDetailsGetProgressStatus(state$: Observable<IncidentState>): Observable<boolean> {
    return state$.select(s => s.IsIncidentCompanyAddressDetailsGetInProgress);
}
export function getIncidentSelectedUserEmployeeDetailsGetProgressStatus(state$: Observable<IncidentState>): Observable<boolean> {
    return state$.select(s => s.IsIncidentEmployeeDetailsByUserIdGetInProgress);
}
export function getIncidentUpdateStatus(state$: Observable<IncidentState>): Observable<boolean> {
    return state$.select(s => s.IncidentUpdateStatus);
}

// Start of selectors

export function getInjuredPartyData(state$: Observable<IncidentState>): Observable<InjuredParty[]> {
    return state$.select(s => s.InjuredParty)
}
export function getInjuredPersondata(state$: Observable<IncidentState>): Observable<InjuredPerson> {
    return state$.select(s => s.InjuredPersonData);
}
export function getInjuredPartyLoadedStatus(state$: Observable<IncidentState>): Observable<boolean> {
    return state$.select(s => s.IsInjuredPartyDataLoaded);
}

export function getInjuredPersonSelectedUserEmpDetails(state$: Observable<IncidentState>): Observable<SelectedEmployeeDetails> {
    return state$.select(s => s.SelectedInjuredPersonUserEmployeeDetails);

}
export function getIncidentAboutYouDetailsGetProgressStatus(state$: Observable<IncidentState>): Observable<boolean> {
    return state$.select(s => s.IsIncidentAboutYouDetailsGetInProgress);
}
export function getIncidentInjurePersonDetailsAddUpdateStatus(state$: Observable<IncidentState>): Observable<boolean> {
    return state$.select(s => s.IsInjurePersonDetailsAddUpdateStatus);
}


// Incident - Formal Investigation - Functions - start 
export function getIncidentDetails(state$: Observable<IncidentState>): Observable<Incident> {
    return state$.select(s => s.SelectedIncidentDetails);
}
// Incident - Formal Investigation - Functions - end 

// Incident - About Injury - Functions - start 
export function getIncidentAboutIncidentDetails(state$: Observable<IncidentState>): Observable<AboutIncident> {
    return state$.select(s => s.SelectedIncidentAboutIncidentDetails);
}
export function getIncidentAboutIncidentDetailsAddUpdateProgressStatus(state$: Observable<IncidentState>): Observable<boolean> {
    return state$.select(s => s.IsIncidentAboutIncidentDetailsAddUpdateStatus);
}
export function getIncidentAboutIncidentDetailsGetProgressStatus(state$: Observable<IncidentState>): Observable<boolean> {
    return state$.select(s => s.IsIncidentAboutIncidentDetailsGetInProgress);
}
// Incident - About Injury - Functions - end 

// RIDDOR selectors
export function getIncidentReportedTo(state$: Observable<IncidentState>): Observable<IncidentRIDDOR> {
    return state$.select(s => s.IncidentReportedTo);
}
export function getIncidentRiddorSaveStatus(state$: Observable<IncidentState>): Observable<boolean> {
    return state$.select(s => s.IsIncidentRiddorDetailsSaved);
}

export function getIncidentInvSections(state$: Observable<IncidentState>): Observable<Array<InvSection>> {
    return state$.select(s => s.IncidentInvSection);
}

export function getRiskAssessments(state$: Observable<IncidentState>): Observable<Array<RiskAssessment>> {
    return state$.select(s => s.RiskAssessments);
}

export function getMethodStatements(state$: Observable<IncidentState>): Observable<Array<ConstructionPhasePlan>> {
    return state$.select(s => s.MethodStatements);
}