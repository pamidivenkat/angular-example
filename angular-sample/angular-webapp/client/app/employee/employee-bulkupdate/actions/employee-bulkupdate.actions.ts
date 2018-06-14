import { type } from "../../../shared/util";
import { Action } from "@ngrx/store";

export const ActionTypes = {
    EMPLOYEE_BULK_UPDATE_LOAD_EMPLOYEES: type('[EMPLOYEE] load employees for bulk update'),
    EMPLOYEE_BULK_UPDATE_LOAD_EMPLOYEES_COMPLETE: type('[EMPLOYEE] load employees for bulk update complete'),
    EMPLOYEE_BULK_UPDATE_UPDATE_EMPLOYEES: type('[EMPLOYEE] bulk update employees'),
    EMPLOYEE_BULK_UPDATE_UPDATE_EMPLOYEES_COMPLETE: type('[EMPLOYEE] bulk update employees complete'),
    EMPLOYEE_BULK_UPDATE_AUTO_SAVE: type('[EMPLOYEE] bulk update employees auto save'),
    EMPLOYEE_BULK_UPDATE_AUTO_SAVE_COMPLETE: type('[EMPLOYEE] bulk update employees auto save complete'),
}

export class EmployeeBulkUpdateLoadEmployeesAction implements Action {
    type = ActionTypes.EMPLOYEE_BULK_UPDATE_LOAD_EMPLOYEES;
    constructor(public payload: any) {

    }
}

export class EmployeeBulkUpdateLoadEmployeesCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_BULK_UPDATE_LOAD_EMPLOYEES_COMPLETE;
    constructor(public payload: any) {

    }
}

export class EmployeeBulkUpdateAction implements Action {
    type = ActionTypes.EMPLOYEE_BULK_UPDATE_UPDATE_EMPLOYEES;
    constructor(public payload: any) {

    }
}



export class EmployeeBulkUpdateCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_BULK_UPDATE_UPDATE_EMPLOYEES_COMPLETE;
    constructor(public payload: any) {

    }
}

export class EmployeeBulkUpdateAutoSaveAction implements Action {
    type = ActionTypes.EMPLOYEE_BULK_UPDATE_AUTO_SAVE;
    constructor(public payload: any) {

    }
}


export class EmployeeBulkUpdateAutoSaveCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_BULK_UPDATE_AUTO_SAVE_COMPLETE;
    constructor(public payload: any) {

    }
}