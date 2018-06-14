import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { extractDataTableOptions } from '../../../shared/helpers/extract-helpers';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { Action } from '@ngrx/store';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { Employee } from '../../models/employee.model';
import * as Immutable from 'immutable';
import * as employeeManageActions from '../actions/employee-manage.actions';


export interface EmployeeManageState {
    employeesList: Employee[];
    currentEmployee: Employee;
    filters: Map<string, string>;
    sortInfo: AeSortModel;
    pagingInfo: PagingInfo;
    hasEmployeesListLoaded: boolean;
}

const initialState: EmployeeManageState = {
    employeesList: null,
    currentEmployee: null,
    filters: null,
    sortInfo: null,
    pagingInfo: null,
    hasEmployeesListLoaded: false
}

export function employeeManageReducer(state = initialState, action: Action): EmployeeManageState {
    switch (action.type) {
        case employeeManageActions.ActionTypes.EMPLOYEES_LOAD:
            {
                let modifiedState = Object.assign({}, state, { hasEmployeesListLoaded: false });


                if (!isNullOrUndefined(action.payload.pageNumber)) {
                    if (isNullOrUndefined(modifiedState.pagingInfo)) {
                        modifiedState.pagingInfo = <PagingInfo>{};
                    }
                    modifiedState.pagingInfo.PageNumber = action.payload.pageNumber;
                }
                if (!isNullOrUndefined(action.payload.noOfRows)) {
                    if (isNullOrUndefined(modifiedState.pagingInfo)) {
                        modifiedState.pagingInfo = <PagingInfo>{};
                    }
                    modifiedState.pagingInfo.PageSize = action.payload.noOfRows;
                    modifiedState.pagingInfo.Count = action.payload.noOfRows;
                }
                if (!isNullOrUndefined(action.payload.SortField)) {
                    if (isNullOrUndefined(modifiedState.sortInfo)) {
                        modifiedState.sortInfo = <AeSortModel>{};
                    }
                    modifiedState.sortInfo.SortField = action.payload.SortField;


                }
                if (!isNullOrUndefined(action.payload.Direction)) {
                    if (isNullOrUndefined(modifiedState.sortInfo)) {
                        modifiedState.sortInfo = <AeSortModel>{};
                    }
                    modifiedState.sortInfo.Direction = action.payload.Direction;
                }

                return modifiedState;
            }
        case employeeManageActions.ActionTypes.EMPLOYEES_LOAD_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, { hasEmployeesListLoaded: true, employeesList: action.payload.EmployeesList });
                if (!isNullOrUndefined(modifiedState.pagingInfo)) {
                    if (action.payload.EmployeesPagingInfo.PageNumber == 1) {
                        modifiedState.pagingInfo.TotalCount = action.payload.EmployeesPagingInfo.TotalCount;
                    }
                    modifiedState.pagingInfo.PageNumber = action.payload.EmployeesPagingInfo.PageNumber;
                    modifiedState.pagingInfo.Count = action.payload.EmployeesPagingInfo.Count;
                }
                else {
                    modifiedState.pagingInfo = action.payload.EmployeesPagingInfo;
                }
               
                if (isNullOrUndefined(modifiedState.sortInfo)) {
                    modifiedState.sortInfo = <AeSortModel>{};
                    modifiedState.sortInfo.SortField = 'FullName';
                    modifiedState.sortInfo.Direction = 0;
                }
                return modifiedState;
            }
        case employeeManageActions.ActionTypes.EMPLOYEES_LOAD_ON_FILTER_CHANGE:
            {
                let modifiedState = Object.assign({}, state, { hasEmployeesListLoaded: false, filters: action.payload });

                if (!isNullOrUndefined(modifiedState.pagingInfo)) {
                    modifiedState.pagingInfo.PageNumber = 1;
                    modifiedState.pagingInfo.PageSize = 10;
                }
                return modifiedState;

            }

        default:
            return state;
    }
}

export function getEmployeesListData(state$: Observable<EmployeeManageState>): Observable<Immutable.List<Employee>> {
    return state$.select(s => Immutable.List<Employee>(!isNullOrUndefined(s.employeesList) ? s.employeesList : []));
}

export function getEmployeesTotalCount(state$: Observable<EmployeeManageState>): Observable<number> {
    return state$.select(s => s && s.pagingInfo && s.pagingInfo.TotalCount);
}

export function getEmployeesPageInfo(state$: Observable<EmployeeManageState>): Observable<DataTableOptions> {
    return state$.select(s => s && extractDataTableOptions(s.pagingInfo,s.sortInfo));
}

export function getEmployeesLoadingStatus(state$: Observable<EmployeeManageState>): Observable<boolean> {
    return state$.select(s => s && !s.hasEmployeesListLoaded);
}


export function getEmployeesFilters(state$: Observable<EmployeeManageState>): Observable<Map<string, string>> {
    return state$.select(s => s && s.filters);
}

export function getEmployeesSort(state$: Observable<EmployeeManageState>): Observable<AeSortModel> {
    return state$.select(s => s && s.sortInfo);
}
