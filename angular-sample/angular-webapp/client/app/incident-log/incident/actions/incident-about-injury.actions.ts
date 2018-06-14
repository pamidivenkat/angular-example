import { Action } from '@ngrx/store';
import { type } from './../../../shared/util';
import { Incident } from './../models/incident.model';
import { AboutInjury } from './../models/incident-about-injury.model';
import { AboutIncident } from "./../models/incident-about-incident";


export const ActionTypes = {
    INCIDENT_ABOUT_INCIDENT_DETAILS_ADD: type('[AboutIncident] incident - about incident details - add'),
    INCIDENT_ABOUT_INCIDENT_DETAILS_ADD_COMPLETE: type('[AboutIncident] incident - about incident details - add complete'),
    INCIDENT_ABOUT_INCIDENT_DETAILS_UPDATE: type('[AboutIncident] incident - about incident details - update'),
    INCIDENT_ABOUT_INCIDENT_DETAILS_UPDATE_COMPLETE: type('[AboutIncident] incident - about incident details - update complete'),
    INCIDENT_ABOUT_INCIDENT_DETAILS_GET: type('[AboutIncident] incident - about incident details - get'),
    INCIDENT_ABOUT_INCIDENT_DETAILS_GET_COMPLETE: type('[AboutIncident] incident - about incident details - get complete'),
}

/* Incident - About Injury Actions - Start */
export class IncidentAboutIncidentDetailsAddAction implements Action {
    type = ActionTypes.INCIDENT_ABOUT_INCIDENT_DETAILS_ADD;
    constructor(public payload: AboutIncident) {

    }
}
export class IncidentAboutIncidentDetailsAddCompleteAction implements Action {
    type = ActionTypes.INCIDENT_ABOUT_INCIDENT_DETAILS_ADD_COMPLETE;
    constructor(public payload: AboutIncident) {

    }
}
export class IncidentAboutIncidentDetailsUpdateAction implements Action {
    type = ActionTypes.INCIDENT_ABOUT_INCIDENT_DETAILS_UPDATE;
    constructor(public payload: AboutIncident) {

    }
}
export class IncidentAboutIncidentDetailsUpdateCompleteAction implements Action {
    type = ActionTypes.INCIDENT_ABOUT_INCIDENT_DETAILS_UPDATE_COMPLETE;
    constructor(public payload: AboutIncident) {

    }
}
export class IncidentAboutIncidentDetailsGetAction implements Action {
    type = ActionTypes.INCIDENT_ABOUT_INCIDENT_DETAILS_GET;
    constructor(public payload: string) {

    }
}
export class IncidentAboutIncidentDetailsGetCompleteAction implements Action {
    type = ActionTypes.INCIDENT_ABOUT_INCIDENT_DETAILS_GET_COMPLETE;
    constructor(public payload: AboutIncident) {

    }
}
/* Incident - About Injury Details Actions - End */

export type Actions = IncidentAboutIncidentDetailsAddAction
    | IncidentAboutIncidentDetailsAddCompleteAction
    | IncidentAboutIncidentDetailsUpdateAction
    | IncidentAboutIncidentDetailsUpdateCompleteAction
    | IncidentAboutIncidentDetailsGetAction
    | IncidentAboutIncidentDetailsGetCompleteAction;



