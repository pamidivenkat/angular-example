import { Actions, toPayload } from '@ngrx/effects';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { Action } from '@ngrx/store';
import { type } from './../../../shared/util';
import * as Immutable from 'immutable';
import { IncidentReportedBy } from './../models/incident-reported-by.model';
import { Incident } from './../models/incident.model';
import { Address } from './../../../employee/models/employee.model';
import { Site } from './../../../company/sites/models/site.model';
import { EmployeeFullEntity } from './../../../employee/models/employee-full.model';

export const ActionTypes = {
    INCIDENT_ABOUT_YOU_DETAILS_ADD: type('[INCIDENT] incident - about you details - add'),
    INCIDENT_ABOUT_YOU_DETAILS_ADD_COMPLETE: type('[INCIDENT] incident - about you details - add complete'),
    INCIDENT_ABOUT_YOU_DETAILS_UPDATE: type('[INCIDENT] incident - about you details - update'),
    INCIDENT_ABOUT_YOU_DETAILS_UPDATE_COMPLETE: type('[INCIDENT] incident - about you details - update complete'),
    INCIDENT_COMPANY_ADDRESS_DETAILS_GET: type('[INCIDENT] incident - company address details - get'),
    INCIDENT_COMPANY_ADDRESS_DETAILS_GET_COMPLETE: type('[INCIDENT] incident - company address details - get complete'),
    INCIDENT_EMPLOYEE_DETAILS_BY_USER_ID_GET: type('[INCIDENT] incident - employee details by user id - get'),
    INCIDENT_EMPLOYEE_DETAILS_BY_USER_ID_GET_COMPLETE: type('[INCIDENT] incident - employee details by user id - get complete'),
    INCIDENT_ABOUT_YOU_DETAILS_GET: type('[INCIDENT] incident - about you details - get'),
    INCIDENT_ABOUT_YOU_DETAILS_GET_COMPLETE: type('[INCIDENT] incident - about you details - get complete'),
    CLEAR_INCIDENT: type('[INCIDENT] clear incident state info'),
}

/* Incident - About You Details Actions - Start */
export class IncidentAboutYouDetailsAddAction implements Action {
    type = ActionTypes.INCIDENT_ABOUT_YOU_DETAILS_ADD;
    constructor(public payload: IncidentReportedBy) {

    }
}
export class IncidentAboutYouDetailsAddCompleteAction implements Action {
    type = ActionTypes.INCIDENT_ABOUT_YOU_DETAILS_ADD_COMPLETE;
    constructor(public payload: string) {

    }
}
export class IncidentAboutYouDetailsUpdateAction implements Action {
    type = ActionTypes.INCIDENT_ABOUT_YOU_DETAILS_UPDATE;
    constructor(public payload: IncidentReportedBy) {

    }
}
export class IncidentAboutYouDetailsUpdateCompleteAction implements Action {
    type = ActionTypes.INCIDENT_ABOUT_YOU_DETAILS_UPDATE_COMPLETE;
    constructor(public payload: string) {

    }
}
export class IncidentAboutYouDetailsGetAction implements Action {
    type = ActionTypes.INCIDENT_ABOUT_YOU_DETAILS_GET;
    constructor(public payload: string) {

    }
}
export class IncidentAboutYouDetailsGetCompleteAction implements Action {
    type = ActionTypes.INCIDENT_ABOUT_YOU_DETAILS_GET_COMPLETE;
    constructor(public payload: IncidentReportedBy) {

    }
}
/* Incident - About You Details Actions - End */

/* Incident - Company Address Details Actions - Start */
export class IncidentCompanyAddressDetailsGetAction implements Action {
    type = ActionTypes.INCIDENT_COMPANY_ADDRESS_DETAILS_GET;
    constructor() {

    }
}
export class IncidentCompanyAddressDetailsGetCompleteAction implements Action {
    type = ActionTypes.INCIDENT_COMPANY_ADDRESS_DETAILS_GET_COMPLETE;
    constructor(public payload: Site) {

    }
}
/* Incident - Company Address Details Actions - End */

/* Incident - Employee Details By User ID - Actions - Start */
export class IncidentEmployeeDetailsByUserIdGetAction implements Action {
    type = ActionTypes.INCIDENT_EMPLOYEE_DETAILS_BY_USER_ID_GET;
    constructor(public payload: string) {

    }
}
export class IncidentEmployeeDetailsByUserIdGetCompleteAction implements Action {
    type = ActionTypes.INCIDENT_EMPLOYEE_DETAILS_BY_USER_ID_GET_COMPLETE;
    constructor(public payload: Address) {

    }
}
/* Incident - Employee Details By User ID - Actions - End */

/* Incident - clear state info. - Actions - Start */
export class ClearIncidentStateAction implements Action {
    type = ActionTypes.CLEAR_INCIDENT;
    constructor(public payload: string) {

    }
}
/* Incident - clear state info. - Actions - End */

 export type Actions = IncidentAboutYouDetailsAddAction
    | IncidentAboutYouDetailsAddCompleteAction
    | IncidentAboutYouDetailsUpdateAction
    | IncidentAboutYouDetailsUpdateCompleteAction
    | IncidentAboutYouDetailsGetAction
    | IncidentAboutYouDetailsGetCompleteAction
    | IncidentCompanyAddressDetailsGetAction
    | IncidentCompanyAddressDetailsGetCompleteAction
    | IncidentEmployeeDetailsByUserIdGetAction
    | IncidentEmployeeDetailsByUserIdGetCompleteAction
    | ClearIncidentStateAction;



