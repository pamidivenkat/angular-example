import { EmployeeImportHistory } from "../models/employee-import";
import { PagingInfo } from "../../../atlas-elements/common/models/ae-paging-info";
import { AeSortModel } from "../../../atlas-elements/common/models/ae-sort-model";
import { Action } from "@ngrx/store";
import * as employeeImportActions from '../actions/employee-import.actions';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from "util";
import { Observable } from "rxjs/Observable";
import { extractDataTableOptions, extractDataTotalCount } from "../../../shared/helpers/extract-helpers";
import { DataTableOptions } from "../../../atlas-elements/common/models/ae-datatable-options";
import { EmployeeImportResult } from "../models/employee-import-result";
import { AtlasApiRequestWithParams, AtlasParams } from "../../../shared/models/atlas-api-response";
import { CommonHelpers } from "../../../shared/helpers/common-helpers";
import { EmployeeImportParams } from "../models/employee-import-params";

export interface EmployeeImportState {
    status: boolean,
    ImportHistoryList: Immutable.List<EmployeeImportHistory>,
    ImportHistoryPagingInfo: PagingInfo,
    ImporthistorySortInfo: AeSortModel,
    Filters: Map<string, string>,
    ImportResult: Array<EmployeeImportResult>,
    importStatus: boolean,
    ImportResultPagingInfo: PagingInfo,
    ImportResultPagedData: Immutable.List<EmployeeImportResult>,
    ImportDescription: string,
    ImportParams: EmployeeImportParams,
    ImportEmployees: Immutable.List<any>,
    ImportEmployeesLoading: boolean,
    ImportEmployeeStatus: boolean,
    ImportEmployeePagingInfo: PagingInfo,
    ImportEmployeesTotalImportCount?: number,
    ImportEmployeesSuccessImportCount?: number,
    ImportFailedCount?: number,
    ImportMessage?: string,
    FailedImportedEmployees: Immutable.List<any>,
}

const initialState: EmployeeImportState = {
    status: false,
    ImportHistoryList: null,
    ImportHistoryPagingInfo: null,
    ImporthistorySortInfo: null,
    Filters: null,
    ImportResult: null,
    importStatus: false,
    ImportResultPagingInfo: null,
    ImportResultPagedData: null,
    ImportDescription: null,
    ImportParams: null,
    ImportEmployees: null,
    ImportEmployeesLoading: false,
    ImportEmployeeStatus: false,
    ImportEmployeePagingInfo: null,
    ImportEmployeesTotalImportCount: null,
    ImportEmployeesSuccessImportCount: null,
    ImportFailedCount: null,
    ImportMessage: null,
    FailedImportedEmployees: null
}

export function employeeImportReducer(state = initialState, action: Action): EmployeeImportState {
    switch (action.type) {
        case employeeImportActions.ActionTypes.EMPLOYEE_IMPORT_HISTORY_LOAD:
            {
                let modifiedState = Object.assign({}, state, { status: true, Filters: action.payload });
                if (isNullOrUndefined(state.Filters)) {
                    modifiedState.Filters = action.payload;
                }
                else {
                    modifiedState.Filters = Object.assign(state.Filters, action.payload);
                }
                return modifiedState;

            }

        case employeeImportActions.ActionTypes.EMPLOYEE_IMPORT_HISTORY_LOAD_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, { status: false, ImportHistoryList: action.payload.ImportHistoryList });
                if (!isNullOrUndefined(modifiedState.ImportHistoryPagingInfo)) {
                    if (action.payload.ImportHistoryPagingInfo.PageNumber == 1) {
                        modifiedState.ImportHistoryPagingInfo.TotalCount = action.payload.ImportHistoryPagingInfo.TotalCount;
                    }
                    modifiedState.ImportHistoryPagingInfo.PageNumber = action.payload.ImportHistoryPagingInfo.PageNumber;
                    modifiedState.ImportHistoryPagingInfo.Count = action.payload.ImportHistoryPagingInfo.Count;
                }
                else {
                    modifiedState.ImportHistoryPagingInfo = action.payload.ImportHistoryPagingInfo;
                }

                return modifiedState;
            }

        case employeeImportActions.ActionTypes.EMPLOYEE_IMPORT_HISTORY_LOAD_IMPORT_RESULTS: {
            let modifiedState = Object.assign({}, state, { ImportResult: null, importStatus: true });
            return modifiedState;
        }
        case employeeImportActions.ActionTypes.EMPLOYEE_IMPORT_HISTORY_LOAD_IMPORT_RESULTS_COMPLETE: {
            let totalRecords = <Array<EmployeeImportResult>>action.payload.ImportResult;
            let pageNumber = action.payload.PageNumber;
            let PageSize = action.payload.PageSize;
            let pagedData = Immutable.List<EmployeeImportResult>(totalRecords.slice(pageNumber - 1, PageSize));

            let pagingInfo = new PagingInfo(PageSize, action.payload.ImportResult.Count, pageNumber, PageSize);
            let modifiedState = Object.assign({}, state, { ImportResult: totalRecords, ImportResultPagedData: pagedData, importStatus: false });
            modifiedState.ImportResultPagingInfo = Object.assign({}, state.ImportResultPagingInfo, { Count: PageSize, PageNumber: pageNumber, TotalCount: totalRecords.length });
            return modifiedState;

        }

        case employeeImportActions.ActionTypes.EMPLOYEE_IMPORT_HISTORY_LOAD_IMPORT_PAGGING_RESULTS: {
            let totalRecords = <Array<EmployeeImportResult>>state.ImportResult;
            let pageNumber = action.payload.PageNumber;
            let PageSize = action.payload.PageSize;
            let startIndex = (pageNumber * PageSize) - PageSize;
            let endIndex = (pageNumber * PageSize);
            let pagedData = Immutable.List<EmployeeImportResult>(totalRecords.slice(startIndex, endIndex));
            let modifiedState = Object.assign({}, state, { ImportResultPagedData: pagedData });
            return modifiedState;
        }
        case employeeImportActions.ActionTypes.EMPLOYEE_IMPORT_DESCRIPTION_LOAD: {
            return state;
        }


        case employeeImportActions.ActionTypes.EMPLOYEE_IMPORT_DESCRIPTION_LOAD_COMPLETE: {
            let modifiedState = Object.assign({}, state, { ImportDescription: action.payload });
            return modifiedState;
        }
        case employeeImportActions.ActionTypes.EMPLOYEE_IMPORT_SET_IMPORT_PARAMS: {
            let modifiedState = Object.assign({}, state, {
                ImportParams: action.payload,
                ImportEmployees: null,
                ImportEmployeesLoading: false,
                ImportEmployeeStatus: false,
                ImportEmployeePagingInfo: null,
                ImportEmployeesTotalImportCount: null,
                ImportEmployeesSuccessImportCount: null,
                ImportFailedCount: null,
                ImportMessage: null,
                FailedImportedEmployees: null
            });
            return modifiedState;
        }

        case employeeImportActions.ActionTypes.EMPLOYEE_IMPORT_EMPLOYEES: {
            let modifiedState = Object.assign({}, state, { ImportEmployeesLoading: true });
            return modifiedState;
        }
        case employeeImportActions.ActionTypes.EMPLOYEE_IMPORT_EMPLOYEES_COMPLETE: {
            let totalCount = action.payload.Count;
            let importedCount = action.payload.Entities.size;
            let modifiedState = Object.assign({}, state, {
                ImportEmployeesLoading: false,
                ImportEmployees: action.payload.Entities,
                ImportEmployeesTotalImportCount: totalCount,
                ImportEmployeesSuccessImportCount: importedCount,
                ImportFailedCount: totalCount - importedCount,
                ImportEmployeeStatus: false,
                FailedImportedEmployees: null,
                ImportMessage: (totalCount === importedCount) ? "Successfully Processed" + " " + importedCount + " Record(s) out of " + totalCount + ". Please click on Add to Import." : null
            });
            modifiedState.ImportEmployeePagingInfo = Object.assign({}, state.ImportEmployeePagingInfo,
                {
                    Count: importedCount,
                    PageNumber: 1,
                    TotalCount: importedCount
                });
            return modifiedState;
        }

        case employeeImportActions.ActionTypes.EMPLOYEE_IMPORT_INSERT_EMPLOYEES: {
            let modifiedState = Object.assign({}, state, { ImportEmployeesLoading: true, ImportEmployeeStatusmportEmployeeStatus: false, ImportMessage: null });
            return modifiedState;
        }

        case employeeImportActions.ActionTypes.EMPLOYEE_IMPORT_EMPLOYEES_ONCHECKUNCHECK_CREATE_USER: {
            let modifiedState = Object.assign({}, state, { ImportEmployeeStatusmportEmployeeStatus: false, ImportMessage: null });
            var tempImportEmployees = modifiedState.ImportEmployees.toArray();
            for (var i = 0; i < tempImportEmployees.length; i++) {
                tempImportEmployees[i].CreateUser = action.payload;
            }
            modifiedState.ImportEmployees = Immutable.List(tempImportEmployees);
            return modifiedState;
        }


        case employeeImportActions.ActionTypes.EMPLOYEE_IMPORT_INSERT_EMPLOYEES_COMPLETE: {
            let count = action.payload.size;
            let totalCount = state.ImportEmployeesSuccessImportCount;
            let status = count === 0 ? true : false;
            let modifiedState = Object.assign({}, state, {
                ImportEmployeesLoading: false,
                ImportEmployeeStatus: status,
                FailedImportedEmployees: action.payload,
                ImportMessage: status === true ? "Imported Employees created Successfully." : "Unable to create some employee records." + "View the errors , amend and resave"
            });
            return modifiedState;
        }
        case employeeImportActions.ActionTypes.EMPLOYEE_IMPORT_DELETE_EMPLOYEES: {

            let modifiedState = Object.assign({}, state, { ImportEmployeeStatusmportEmployeeStatus: false, ImportMessage: null });
            //BELOW LOGIC IS WRONG ANF CAN ISSUES in FUTURE commenting
            // if (action.payload != -1)
            //     modifiedState.ImportEmployees = modifiedState.ImportEmployees.splice(action.payload, 1) as Immutable.List<any>;
            // else
            //     modifiedState.ImportEmployees = modifiedState.ImportEmployees.clear();
            return modifiedState;
        }
        case employeeImportActions.ActionTypes.EMPLOYEE_IMPORT_STATE_CLEAR: {
            let modifiedState = Object.assign({}, state, initialState);
            return modifiedState;
        }
        default:
            return state;
    }
}

export function getFailedImportedEmployees(state$: Observable<EmployeeImportState>): Observable<Immutable.List<any>> {
    return state$.select(state => state && state.FailedImportedEmployees);
}


export function getImportHistoryLoadingStatus(state$: Observable<EmployeeImportState>): Observable<boolean> {
    return state$.select(state => state && state.status);
};


export function getImportHistoryList(state$: Observable<EmployeeImportState>): Observable<Immutable.List<EmployeeImportHistory>> {
    return state$.select(state => state && state.ImportHistoryList);
};

export function getImportHistoryTotalCount(state$: Observable<EmployeeImportState>): Observable<number> {
    return state$.select(state => state && state.ImportHistoryPagingInfo && state.ImportHistoryPagingInfo.TotalCount);
};


export function getImportHistoryDataTableOptions(state$: Observable<EmployeeImportState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.ImportHistoryPagingInfo && extractDataTableOptions(state.ImportHistoryPagingInfo));
}

export function getImportResultsData(state$: Observable<EmployeeImportState>): Observable<Immutable.List<EmployeeImportResult>> {
    return state$.select(state => state && state.ImportResultPagedData);
}


export function getImportResultLoadingStatus(state$: Observable<EmployeeImportState>): Observable<boolean> {
    return state$.select(state => state && state.importStatus);
};


export function getImportResultTotalCount(state$: Observable<EmployeeImportState>): Observable<number> {
    return state$.select(state => state && state.ImportResultPagingInfo && state.ImportResultPagingInfo.TotalCount);
};



export function getImportResultDataTableOptions(state$: Observable<EmployeeImportState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.ImportResultPagingInfo && extractDataTableOptions(state.ImportResultPagingInfo));
}



export function getImportDescription(state$: Observable<EmployeeImportState>): Observable<string> {
    return state$.select(state => state && state.ImportDescription);
}

export function getImportEmployeesData(state$: Observable<EmployeeImportState>): Observable<Immutable.List<any>> {
    return state$.select(state => state && state.ImportEmployees);
}


export function getImportEmployeeLoadingStatus(state$: Observable<EmployeeImportState>): Observable<boolean> {
    return state$.select(state => state && state.ImportEmployeesLoading);
};


export function getImportEmployeeTotalCount(state$: Observable<EmployeeImportState>): Observable<number> {
    return state$.select(state => state && extractDataTotalCount(state.ImportResultPagingInfo
    ));
};



export function getImportEmployeeDataTableOptions(state$: Observable<EmployeeImportState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.ImportEmployeePagingInfo && extractDataTableOptions(state.ImportEmployeePagingInfo));
}

export function getImportStatusMessage(state$: Observable<EmployeeImportState>): Observable<string> {
    return state$.select(state => state && state.ImportMessage);
}

export function getImportStatus(state$: Observable<EmployeeImportState>): Observable<boolean> {
    return state$.select(state => state && state.ImportEmployeeStatus);
}
