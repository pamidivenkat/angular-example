import { type } from "../../../shared/util";
import { Action } from "@ngrx/store";
import { AtlasApiResponse, AtlasApiRequestWithParams } from "../../../shared/models/atlas-api-response";
import { EmployeeImportHistory } from "../models/employee-import";
import { EmployeeImportParams } from "../models/employee-import-params";

export const ActionTypes = {
    EMPLOYEE_IMPORT_HISTORY_LOAD: type('[EMPLOYEE] load employee import history'),
    EMPLOYEE_IMPORT_HISTORY_LOAD_COMPLETE: type('[EMPLOYEE] load employee import history complete'),
    EMPLOYEE_IMPORT_HISTORY_LOAD_IMPORT_RESULTS: type('[EMPLOYEE] load employee import results load'),
    EMPLOYEE_IMPORT_HISTORY_LOAD_IMPORT_RESULTS_COMPLETE: type('[EMPLOYEE] load employee import results load complete'),
    EMPLOYEE_IMPORT_HISTORY_LOAD_IMPORT_PAGGING_RESULTS: type('[EMPLOYEE] load employee import results pagging load '),
    EMPLOYEE_IMPORT_DESCRIPTION_LOAD: type('[EMPLOYEE] load  import description'),
    EMPLOYEE_IMPORT_DESCRIPTION_LOAD_COMPLETE: type('[EMPLOYEE] load  import description complete'),
    EMPLOYEE_IMPORT_SET_IMPORT_PARAMS: type('[EMPLOYEE] set  import params'),
    EMPLOYEE_IMPORT_EMPLOYEES: type('[EMPLOYEE] import employees'),
    EMPLOYEE_IMPORT_EMPLOYEES_COMPLETE: type('[EMPLOYEE] import employees complete'),
    EMPLOYEE_IMPORT_INSERT_EMPLOYEES: type('[EMPLOYEE] insert import employees'),
    EMPLOYEE_IMPORT_INSERT_EMPLOYEES_COMPLETE: type('[EMPLOYEE] insert import employees complete'),
    EMPLOYEE_IMPORT_DELETE_EMPLOYEES: type('[EMPLOYEE] delete import employees'),
    EMPLOYEE_IMPORT_EMPLOYEES_ONCHECKUNCHECK_CREATE_USER: type('[EMPLOYEE] on check or uncheck create user import employees'),
    EMPLOYEE_IMPORT_STATE_CLEAR: type('[EMPLOYEE] employee import state clear')
}

export class EmployeeImportStateClearAction implements Action {
    type = ActionTypes.EMPLOYEE_IMPORT_STATE_CLEAR;
    constructor() {

    }
}

export class EmployeeImportHistoryLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_IMPORT_HISTORY_LOAD;
    constructor(public payload: any) {

    }
}

export class EmployeeImportHistoryLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_IMPORT_HISTORY_LOAD_COMPLETE;
    constructor(public payload: any) {

    }
}


export class EmployeeImportHistoryLoadImportResultsAction implements Action {
    type = ActionTypes.EMPLOYEE_IMPORT_HISTORY_LOAD_IMPORT_RESULTS;
    constructor(public payload: any) {

    }
}



export class EmployeeImportHistoryLoadImportResultsCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_IMPORT_HISTORY_LOAD_IMPORT_RESULTS_COMPLETE;
    constructor(public payload: any) {
    }
}
export class EmployeeImportHistoryLoadImportPaggingResultsAction implements Action {
    type = ActionTypes.EMPLOYEE_IMPORT_HISTORY_LOAD_IMPORT_PAGGING_RESULTS;
    constructor(public payload: any) {
    }
}

export class EmployeeImportDescriptionLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_IMPORT_DESCRIPTION_LOAD;
    constructor(public payload: boolean) {

    }
}



export class EmployeeImportDescriptionLoadCompleteAction {
    type = ActionTypes.EMPLOYEE_IMPORT_DESCRIPTION_LOAD_COMPLETE;
    constructor(public payload: string) {

    }
}

export class EmployeeImportSetImportParamsAction implements Action {
    type = ActionTypes.EMPLOYEE_IMPORT_SET_IMPORT_PARAMS;
    constructor(public payload: EmployeeImportParams) {

    }
}

export class EmployeeImportAction implements Action {
    type = ActionTypes.EMPLOYEE_IMPORT_EMPLOYEES;
    constructor(public payload: boolean) {

    }
}



export class EmployeeImportCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_IMPORT_EMPLOYEES_COMPLETE;
    constructor(public payload: any) {
    }
}

export class EmployeeBulkInsertAction implements Action {
    type = ActionTypes.EMPLOYEE_IMPORT_INSERT_EMPLOYEES;
    constructor(public payload: Array<any>) {
    }

}


export class EmployeeBulkInsertActionComplete implements Action {
    type = ActionTypes.EMPLOYEE_IMPORT_INSERT_EMPLOYEES_COMPLETE;
    constructor(public payload: any) {
    }
}

export class EmployeeImportDeleteAction implements Action {
    type = ActionTypes.EMPLOYEE_IMPORT_DELETE_EMPLOYEES;
    constructor(public payload: number) {
    }

}
export class EmployeeImportCheckUncheckCreateUsereAction implements Action {
    type = ActionTypes.EMPLOYEE_IMPORT_EMPLOYEES_ONCHECKUNCHECK_CREATE_USER;
    constructor(public payload: boolean) {
    }

}


