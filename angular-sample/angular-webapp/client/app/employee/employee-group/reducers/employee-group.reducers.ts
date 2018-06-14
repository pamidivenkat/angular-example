import { EmployeeGroup } from './../../../shared/models/company.models';
import { extractDataTableOptions } from '../../../shared/helpers/extract-helpers';
import { isNullOrUndefined } from 'util';
import { Action } from '@ngrx/store';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import * as employeeGroupActions from '../actions/employee-group.actions';
import { Observable } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { Employee } from '../../models/employee.model';
import { AeSelectItem } from "../../../atlas-elements/common/models/ae-select-item";
import { EmployeeFullEntity } from '../../models/employee-full.model';
import { EmployeeGroupAssociation, AssociatedEmployees } from '../../../employee/models/employee-group-association.model';

export interface EmployeeGroupState {
    loading: boolean;
    isEmployeeGroupListLoading: boolean;
    EmployeeGroupList: Immutable.List<EmployeeGroup>;
    EmployeeGroupPagingInfo: PagingInfo;
    EmployeeGroupSortingInfo: AeSortModel;
    EmployeeGroupAddUpdateFormData: EmployeeGroup;
    IsEmployeeGroupAddUpdateInProgress: boolean;
    IsEmployeeGroupDeleteInProgress: boolean,
    SelectedEmployeeGroupId: String,
    isEmployeesLoading: boolean,
    employeeSearchApiResponse: AssociatedEmployees[],
    isEmployeesBySiteLoading: boolean,
    employeesBySitedata: Employee[],
    IsAssociateEMployeesToEmployeeGroupInProgress: boolean,
    AssociateEmployeeGroupData: EmployeeGroupAssociation

}


const initialState: EmployeeGroupState = {
    loading: false,
    isEmployeeGroupListLoading: false,
    EmployeeGroupList: null,
    EmployeeGroupPagingInfo: null,
    EmployeeGroupSortingInfo: null,
    EmployeeGroupAddUpdateFormData: null,
    IsEmployeeGroupAddUpdateInProgress: false,
    IsEmployeeGroupDeleteInProgress: false,
    SelectedEmployeeGroupId: "",
    isEmployeesLoading: false,
    employeeSearchApiResponse: null,
    isEmployeesBySiteLoading: false,
    employeesBySitedata: null,
    AssociateEmployeeGroupData: null,
    IsAssociateEMployeesToEmployeeGroupInProgress: false
}

export function employeeGroupreducer(state = initialState, action: Action): EmployeeGroupState {
    switch (action.type) {
        case employeeGroupActions.ActionTypes.EMPLOYEEGROUPS_LOAD:
            {
                return Object.assign({}, state, { loading: true, isEmployeeGroupListLoading: true });
            }
        case employeeGroupActions.ActionTypes.LOAD_EMPLOYEE_GROUP_ON_PAGE_CHANGE: {
            return Object.assign({}, state, { loading: true, isEmployeeGroupListLoading: true, EmployeeGroupPagingInfo: Object.assign({}, state.EmployeeGroupPagingInfo, { PageNumber: action.payload.pageNumber, Count: action.payload.noOfRows }) });
        }
        case employeeGroupActions.ActionTypes.LOAD_EMPLOYEE_GROUP_ON_SORT: {
            return Object.assign({}, state, { loading: true, isEmployeeGroupListLoading: true, EmployeeGroupSortingInfo: Object.assign({}, state.EmployeeGroupSortingInfo, { SortField: action.payload.SortField, Direction: action.payload.Direction }) });
        }

        case employeeGroupActions.ActionTypes.EMPLOYEEGROUPS_ADD:
            {
                return Object.assign({}, state, { IsEmployeeGroupAddUpdateInProgress: true, EmployeeGroupAddUpdateFormData: action.payload });
            }

        case employeeGroupActions.ActionTypes.EMPLOYEEGROUPS_ADD_COMPLETED:
            {
                return Object.assign({}, state, { IsEmployeeGroupAddUpdateInProgress: false });
            }

        case employeeGroupActions.ActionTypes.EMPLOYEEGROUPS_UPDATE:
            {
                return Object.assign({}, state, { IsEmployeeGroupAddUpdateInProgress: true, EmployeeGroupAddUpdateFormData: action.payload });
            }

        case employeeGroupActions.ActionTypes.EMPLOYEEGROUPS_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { IsEmployeeGroupAddUpdateInProgress: false });
            }

        case employeeGroupActions.ActionTypes.EMPLOYEEGROUPS_DELETE:
            {
                return Object.assign({}, state, { IsEmployeeGroupDeleteInProgress: true, EmployeeGroupAddUpdateFormData: action.payload, isEmployeeGroupListLoading: true });
            }
        case employeeGroupActions.ActionTypes.EMPLOYEEGROUPS_DELETE_COMPLETE:
            {
                return Object.assign({}, state, { IsEmployeeGroupDeleteInProgress: false, isEmployeeGroupListLoading: false });
            }
        case employeeGroupActions.ActionTypes.EMPLOYEEGROUPS_LOAD_COMPLETE: {
            if (!isNullOrUndefined(state.EmployeeGroupPagingInfo)) {
                if (action.payload.EmployeeGroupsPagingInfo.PageNumber == 1) {
                    state.EmployeeGroupPagingInfo.TotalCount = action.payload.EmployeeGroupsPagingInfo.TotalCount;
                }
                state.EmployeeGroupPagingInfo.PageNumber = action.payload.EmployeeGroupsPagingInfo.PageNumber;
                state.EmployeeGroupPagingInfo.Count = action.payload.EmployeeGroupsPagingInfo.Count;
            }
            else {
                state.EmployeeGroupPagingInfo = action.payload.EmployeeGroupsPagingInfo;
            }
            if (isNullOrUndefined(state.EmployeeGroupSortingInfo)) {
                state.EmployeeGroupSortingInfo = <AeSortModel>{};
                state.EmployeeGroupSortingInfo.SortField = 'Name';
                state.EmployeeGroupSortingInfo.Direction = 1;
            }
            return Object.assign({}, state, { isEmployeeGroupListLoading: false, EmployeeGroupList: action.payload.EmployeeGroupList });
        }
        case employeeGroupActions.ActionTypes.LOAD_EMPLOYEE_GROUPS_EMPLOYEES:
            {
                return Object.assign({}, state, { isEmployeesLoading: true });
            }
        case employeeGroupActions.ActionTypes.LOAD_EMPLOYEE_GROUPS_EMPLOYEES_COMPLETE:
            {
                return Object.assign({}, state, { isEmployeesLoading: false, employeeSearchApiResponse: action.payload });
            }
        case employeeGroupActions.ActionTypes.CLEAR_EMPLOYEES_LOADING_STATE:
            return Object.assign({}, state, {
                isEmployeesLoading: true,
                employeeSearchApiResponse: null
            });

        case employeeGroupActions.ActionTypes.ASSOCIATE_EMPLOYEES_TO_EMPLOYEEGROUP:
            {
                return Object.assign({}, state, { IsAssociateEMployeesToEmployeeGroupInProgress: true, AssociateEmployeeGroupData: action.payload });
            }

        case employeeGroupActions.ActionTypes.ASSOCIATE_EMPLOYEES_TO_EMPLOYEEGROUP_COMPLETE:
            {
                return Object.assign({}, state, { IsAssociateEMployeesToEmployeeGroupInProgress: false });
            }

        default:
            return state;
    }
}


export function getEmployeeGroupList(state$: Observable<EmployeeGroupState>): Observable<Immutable.List<EmployeeGroup>> {
    return state$.select(s => {
        if (isNullOrUndefined(s)) {
            return Immutable.List([]);
        }
        if (isNullOrUndefined(s.EmployeeGroupList)) {
            return Immutable.List([]);
        } else {
            return Immutable.List(s.EmployeeGroupList);
        }
    });
};

export function getEmployeeGroupState(state$: Observable<EmployeeGroupState>): Observable<EmployeeGroupState> {
    return state$.select(s => s);
};

export function getEmployeeGroupTotalRecords(state$: Observable<EmployeeGroupState>): Observable<number> {
    return state$.select(s => s && s.EmployeeGroupPagingInfo && s.EmployeeGroupPagingInfo.TotalCount);
};

export function gettEmployeeGroupInProgressStatus(state$: Observable<EmployeeGroupState>): Observable<boolean> {
    return state$.select(s => !isNullOrUndefined(s) && s.IsEmployeeGroupAddUpdateInProgress);
}

export function addEmployeeGroup(state$: Observable<EmployeeGroupState>): Observable<EmployeeGroup> {
    return state$.select(s => s.EmployeeGroupAddUpdateFormData);
}

export function getDeleteEmployeeGroupStatus(state$: Observable<EmployeeGroupState>): Observable<boolean> {
    return state$.select(s => !isNullOrUndefined(s) && s.IsEmployeeGroupDeleteInProgress);
}

export function getEmployeeGroupForSelectedId(state$: Observable<EmployeeGroupState>): Observable<EmployeeGroup> {
    return state$.select(s => s.EmployeeGroupAddUpdateFormData);
}

export function getEmployeeGroupListDataTableOptions(state$: Observable<EmployeeGroupState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.EmployeeGroupPagingInfo && state.EmployeeGroupSortingInfo && extractDataTableOptions(state.EmployeeGroupPagingInfo,state.EmployeeGroupSortingInfo));
}

export function getEmployeeGroupListDataLoading(state$: Observable<EmployeeGroupState>): Observable<boolean> {
    return state$.select(s => !isNullOrUndefined(s) && s.isEmployeeGroupListLoading);
};

export function getEmployeeGroupAssociationEmployees(state$: Observable<EmployeeGroupState>): Observable<AssociatedEmployees[]> {
    return state$.select(s => s.employeeSearchApiResponse);
};

export function getAssociateEmployeestoEmployeeGroupStatus(state$: Observable<EmployeeGroupState>): Observable<boolean> {
    return state$.select(s => !isNullOrUndefined(s) && s.IsAssociateEMployeesToEmployeeGroupInProgress);
}

export function getEmployeeGroupEmployeesLoading(state$: Observable<EmployeeGroupState>): Observable<boolean> {
    return state$.select(s => s.isEmployeesLoading);
};
