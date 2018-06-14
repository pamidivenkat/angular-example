import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { Actions, toPayload } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';

export const ActionTypes = {
    EMPLOYEES_LOAD: type('[EMPLOYEES], load list of employees'),
    EMPLOYEES_LOAD_COMPLETE: type('[EMPLOYEES], load list of employees complete'),
    EMPLOYEES_LOAD_ON_PAGE_CHANGE: type('[EMPLOYEES], load list of employees on page change'),
    EMPLOYEES_LOAD_ON_SORT: type('[EMPLOYEES], load list of employees on sort'),
    EMPLOYEES_LOAD_ON_FILTER_CHANGE: type('[EMPLOYEES], load list of employees on filter change'),
    CURRENT_EMPLOYEE_LOAD: type('[EMPLOYEES], load current employee'),
    CURRENT_EMPLOYEE_LOAD_COMPLETE: type('[EMPLOYEES], load current employee complete')
}

export class EmployeesLoadAction implements Action {
    type = ActionTypes.EMPLOYEES_LOAD;
    constructor(public payload: any) {

    }
}

export class EmployeesLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEES_LOAD_COMPLETE;
    constructor(public payload: any) {

    }
}




export class EmployeesLoadOnFiltetrChangeAction implements Action {
    type = ActionTypes.EMPLOYEES_LOAD_ON_FILTER_CHANGE;
    constructor(public payload: Map<string, string>) {

    }
}

export type Actions = EmployeesLoadAction
    | EmployeesLoadCompleteAction
    | EmployeesLoadOnFiltetrChangeAction;
