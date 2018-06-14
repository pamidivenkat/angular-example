import { AtlasApiRequestWithParams } from "../../../shared/models/atlas-api-response";
import * as Immutable from 'immutable';
import { Action } from "@ngrx/store";
import * as bulkUpdateActions from '../actions/employee-bulkupdate.actions';
import { isNullOrUndefined } from "util";
import { Observable } from "rxjs/Observable";
import { DataTableOptions } from "../../../atlas-elements/common/models/ae-datatable-options";
export interface EmployeeBulkUpdateState {
    ApiRequestWithParams: AtlasApiRequestWithParams,
    EmployeeData: Immutable.List<any>,
    LoadingEmployees: boolean;
    TotalEmployeesCount: number,
    BulkUpdateStatus: boolean,
    BulkUpdateMessage: string,
    CurrentEmployee: {
        Id: string,
        Status: boolean
    }

}
const initialState: EmployeeBulkUpdateState = {
    ApiRequestWithParams: null,
    EmployeeData: null,
    LoadingEmployees: false,
    TotalEmployeesCount: null,
    BulkUpdateStatus: null,
    BulkUpdateMessage: null,
    CurrentEmployee: null
}


export function employeeBulkUpdateReducer(state = initialState, action: Action): EmployeeBulkUpdateState {
    switch (action.type) {
        case bulkUpdateActions.ActionTypes.EMPLOYEE_BULK_UPDATE_LOAD_EMPLOYEES:
            {
                return Object.assign({}, state, { LoadingEmployees: true, ApiRequestWithParams: action.payload });
            }
        case bulkUpdateActions.ActionTypes.EMPLOYEE_BULK_UPDATE_LOAD_EMPLOYEES_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.ApiRequestWithParams)) {
                    if (action.payload.PagingInfo.PageNumber === 1) {
                        modifiedState.TotalEmployeesCount = action.payload.PagingInfo.TotalCount;
                    }
                }

                return Object.assign({}, modifiedState, { EmployeeData: action.payload.Entities, LoadingEmployees: false });
            }

        case bulkUpdateActions.ActionTypes.EMPLOYEE_BULK_UPDATE_UPDATE_EMPLOYEES: {
            let modifiedState = Object.assign({}, state, { BulkUpdateStatus: null });
            return modifiedState;
        }

        case bulkUpdateActions.ActionTypes.EMPLOYEE_BULK_UPDATE_UPDATE_EMPLOYEES_COMPLETE: {
            let status = action.payload.successCount === state.EmployeeData.size ? true : false;
            let errorData = (<Array<any>>action.payload.Entities).filter((emp) => !isNullOrUndefined(emp.Errors) && (emp.Errors.length > 0));
            let employeeData: Immutable.List<any>;
            if (!isNullOrUndefined(errorData)) {
                employeeData = Immutable.List<any>(errorData);
            }
            else {
                employeeData = state.EmployeeData;
            }
            let modifiedState = Object.assign({}, state, {
                EmployeeData: employeeData,
                BulkUpdateStatus: status,
                BulkUpdateMessage: status === true ? "Updated employees successfully." : "Unable to update some employee records." + "View the errors , amend and resave."
            });
            return modifiedState;
        }
        case bulkUpdateActions.ActionTypes.EMPLOYEE_BULK_UPDATE_AUTO_SAVE: {
            let modifiedState = Object.assign({}, state, { CurrentEmployee: null });
            return modifiedState;
        }


        case bulkUpdateActions.ActionTypes.EMPLOYEE_BULK_UPDATE_AUTO_SAVE_COMPLETE: {
            let modifiedState = Object.assign({}, state, { CurrentEmployee: action.payload });
            return modifiedState;
        }

        default:
            return state;
    }
}



export function getBulkUpdateEmployees(state$: Observable<EmployeeBulkUpdateState>): Observable<Immutable.List<any>> {
    return state$.select(s => s && s.EmployeeData);
}

export function getBulkUpdateEmployeesCount(state$: Observable<EmployeeBulkUpdateState>): Observable<number> {
    return state$.select(s => s && s.TotalEmployeesCount);
}

export function getBulkUpdateEmployeesDataTableOptions(state$: Observable<EmployeeBulkUpdateState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.ApiRequestWithParams && new DataTableOptions(state.ApiRequestWithParams.PageNumber, state.ApiRequestWithParams.PageSize));
}

export function getBulkUpdateEmployeesLoadingStatus(state$: Observable<EmployeeBulkUpdateState>): Observable<boolean> {
    return state$.select(s => s && s.LoadingEmployees);
}

export function getBulkUpdateStatusMessage(state$: Observable<EmployeeBulkUpdateState>): Observable<string> {
    return state$.select(state => state && state.BulkUpdateMessage);
}

export function getBulkUpdateStatus(state$: Observable<EmployeeBulkUpdateState>): Observable<boolean> {
    return state$.select(state => state && state.BulkUpdateStatus);
}

export function getAutoSaveStatus(state$: Observable<EmployeeBulkUpdateState>): Observable<any> {
    return state$.select(state => state && state.CurrentEmployee);
}