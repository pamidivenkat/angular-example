import { Actions, toPayload } from '@ngrx/effects';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { EmployeeFullEntity } from './../../../employee/models/employee-full.model';
import { Action } from '@ngrx/store';
import { type } from './../../../shared/util';
import * as Immutable from 'immutable';

export const ActionTypes = {
    EMPLOYEE_DETAILS_ADD: type('[EMPLOYEE] add employee details'),
    EMPLOYEE_DETAILS_ADD_COMPLETE: type('[EMPLOYEE] add employee details complete'),
    SET_EMPLOYEE_FIRSTNAMESURNAME :  type('[EMPLOYEE] set employee first name and surname'),
}

/* Employee Details Actions - Start */
export class EmployeeDetailsAddAction implements Action {
    type = ActionTypes.EMPLOYEE_DETAILS_ADD;
    constructor(public payload: EmployeeFullEntity) {

    }
}
export class EmployeeDetailsAddCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_DETAILS_ADD_COMPLETE;
    constructor(public payload: string) {

    }
}

export class SetEmployeeFirstNameAndSurName implements Action {
    type = ActionTypes.SET_EMPLOYEE_FIRSTNAMESURNAME;
    constructor(public payload: string) {

    }
}
/* Employee Details Actions - End */

export type Actions = EmployeeDetailsAddAction | EmployeeDetailsAddCompleteAction | SetEmployeeFirstNameAndSurName;
  