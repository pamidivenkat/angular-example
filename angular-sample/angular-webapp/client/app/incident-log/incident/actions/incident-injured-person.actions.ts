import { type } from '../../../shared/util';
import { InjuredParty, InjuredPerson, SelectedEmployeeDetails } from "./../models/incident-injured-person.model";
import { Address } from "../../../employee/models/employee.model";

export const ActionTypes = {
    LOAD_INJURED_PARTY: type('[INJURED_PARTY] Load incident injured party'),
    LOAD_INJURED_PARTY_COMPLETE: type('[INJURED_PARTY] Load incident injured party complete'),
    LOAD_INJURED_PERSON_DETAILS: type('[INJURED_PERSON] Load injured person data'),
    LOAD_INJURED_PERSON_DETAILS_COMPLETE: type('[INJURED_PERSON] Load injured person data complete'),
    ADD_OR_UPDATE_INJURED_PERSON_DETAILS : type('[INJURED_PERSON] add or update injured person details'),
    ADD_OR_UPDATE_INJURED_PERSON_DETAILS_COMPLETE : type('[INJURED_PERSON] add or update injured person details complete'),
    INJURED_PERSON_EMPLOYEE_DETAILS_BY_USER_ID_GET: type('[INJURED_PERSON] injured person - employee details by user id- get'),
    INJURED_PERSON_EMPLOYEE_DETAILS_BY_USER_ID_GET_COMPLETE: type('[INJURED_PERSON] injured person - employee details by user id - get complete'),
};


/* Injured person - Employee Details By User ID - Actions - Start */
export class InjuredPersonEmpDetailsByUserIdAction {
    type = ActionTypes.INJURED_PERSON_EMPLOYEE_DETAILS_BY_USER_ID_GET;
    constructor(public payload: string) {

    }
}
export class InjuredPersonEmpDetailsByUserIdCompleteAction {
    type = ActionTypes.INJURED_PERSON_EMPLOYEE_DETAILS_BY_USER_ID_GET_COMPLETE;
    constructor(public payload: SelectedEmployeeDetails) {

    }
}
/* Injured person - Employee Details By User ID - Actions - End */

export class LoadInjuredPartyAction {
    type = ActionTypes.LOAD_INJURED_PARTY;
    constructor(public payload: boolean) {
    }
}

export class LoadInjuredPartyCompleteAction {
    type = ActionTypes.LOAD_INJURED_PARTY_COMPLETE;
    constructor(public payload: InjuredParty[]) {
    }
}

export class LoadInjuredPersonDataAction {
    type = ActionTypes.LOAD_INJURED_PERSON_DETAILS;
    constructor(public payload: string) {
    }
}

export class LoadInjuredPersonDataCompleteAction {
    type = ActionTypes.LOAD_INJURED_PERSON_DETAILS_COMPLETE;
    constructor(public payload: InjuredPerson) {
    }
}

export class InjuredPersonAddorUpdateAction {
    type = ActionTypes.ADD_OR_UPDATE_INJURED_PERSON_DETAILS;
    constructor(public payload: { injuredPersonDet: InjuredPerson, isEdit: boolean }) {
    }
}

export class InjuredPersonAddorUpdateCompleteAction {
    type = ActionTypes.ADD_OR_UPDATE_INJURED_PERSON_DETAILS_COMPLETE;
    constructor(public payload: boolean) {
    }
}

export type Actions = LoadInjuredPartyAction | LoadInjuredPartyCompleteAction |
    LoadInjuredPersonDataAction | LoadInjuredPersonDataCompleteAction;