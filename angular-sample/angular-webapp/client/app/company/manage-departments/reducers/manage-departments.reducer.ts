import { isNullOrUndefined } from 'util';
import { DepartmentModel, DepartmentEntity } from '../models/department.model';
import { EmployeeMetadata } from '../models/employee-metadata.model';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as manageDepartmentActions from '../actions/manage-departments.actions';
import * as Immutable from 'immutable';
import { EmployeeBasicInfoModel } from '../models/employee-basic-info.model';

export interface ManageDepartmentState {
    CompanyDepartments: Array<DepartmentModel>;
    CompanyEmployees: Array<EmployeeMetadata>;
    CompanyDepartmentEmployees: Map<string, Array<EmployeeMetadata>>;
    SelectedEmployee: EmployeeBasicInfoModel;
    IsDepartmentAdded: boolean;
    IsDepartmentUpdated: boolean;
    IsDepartmentRemoved: boolean;
    Department: DepartmentModel;
    IsSiteMapping: boolean;
    SiteMappingData: any;
}


const initialState: ManageDepartmentState = {
    CompanyDepartments: null,
    CompanyEmployees: null,
    CompanyDepartmentEmployees: null,
    SelectedEmployee: null,
    IsDepartmentAdded: null,
    IsDepartmentUpdated: null,
    IsDepartmentRemoved: null,
    Department: null,
    IsSiteMapping: false,
    SiteMappingData: null,

};

export function reducer(state = initialState, action: Action): ManageDepartmentState {
    switch (action.type) {
        case manageDepartmentActions.ActionTypes.LOAD_COMPANY_DEPARTMENTS:
            {
                state = Object.assign({}, state);
            }
            break;
        case manageDepartmentActions.ActionTypes.LOAD_COMPANY_DEPARTMENTS_COMPLETE:
            {
                state = Object.assign({}, state, { CompanyDepartments: action.payload });
            }
            break;
        case manageDepartmentActions.ActionTypes.LOAD_COMPANY_EMPLOYEES:
            {
                state = Object.assign({}, state);
            }
            break;
        case manageDepartmentActions.ActionTypes.LOAD_COMPANY_EMPLOYEES_COMPLETE:
            {
                state = Object.assign({}, state, { CompanyEmployees: action.payload });
            }
            break;
        case manageDepartmentActions.ActionTypes.LOAD_COMPANY_DEPARTMENT_EMPLOYEES:
            {
                state = Object.assign({}, state, { CompanyDepartmentEmployees: action.payload });
            }
            break;
        case manageDepartmentActions.ActionTypes.ADD_COMPANY_DEPARTMENT:
            {
                state = Object.assign({}, state, { IsDepartmentAdded: false });
            }
            break;
        case manageDepartmentActions.ActionTypes.ADD_COMPANY_DEPARTMENT_COMPLETE:
            {
                state = Object.assign({}, state, { IsDepartmentAdded: true, Department: action.payload });
            }
            break;
        case manageDepartmentActions.ActionTypes.UPDATE_COMPANY_DEPARTMENT:
            {
                state = Object.assign({}, state, { IsDepartmentUpdated: false });
            }
            break;
        case manageDepartmentActions.ActionTypes.UPDATE_COMPANY_DEPARTMENT_COMPLETE:
            {
                state = Object.assign({}, state, { IsDepartmentUpdated: true, Department: action.payload });
            }
            break;
        case manageDepartmentActions.ActionTypes.ASSIGN_EMPLOYEE_TO_DEPARTMENT:
            {
                state = Object.assign({}, state, { IsDepartmentUpdated: false });
            }
            break;
        case manageDepartmentActions.ActionTypes.ASSIGN_EMPLOYEE_TO_DEPARTMENT_COMPLETE:
            {
                state = Object.assign({}, state, { IsDepartmentUpdated: true, Department: action.payload });
            }
            break;
        case manageDepartmentActions.ActionTypes.REMOVE_COMPANY_DEPARTMENT:
            {
                state = Object.assign({}, state, { IsDepartmentRemoved: false });
            }
            break;
        case manageDepartmentActions.ActionTypes.REMOVE_COMPANY_DEPARTMENT_COMPLETE:
            {
                state = Object.assign({}, state, { IsDepartmentRemoved: true, Department: action.payload });
            }
            break;
        case manageDepartmentActions.ActionTypes.LOAD_SELECTED_EMPLOYEE_BASIC_INFO:
            {
                state = Object.assign({}, state, {});
            }
            break;
        case manageDepartmentActions.ActionTypes.LOAD_SELECTED_EMPLOYEE_BASIC_INFO_COMPLETE:
            {
                state = Object.assign({}, state, { SelectedEmployee: action.payload });
            }
            break;
        case manageDepartmentActions.ActionTypes.CLEAR_SELECTED_EMPLOYEE_BASIC_INFO:
            {
                state = Object.assign({}, state, { SelectedEmployee: null });
            }
            break;
        case manageDepartmentActions.ActionTypes.CLEAR_CURRENT_COMPANY_DEPARTMENT:
            {
                state = Object.assign({}, state, {
                    IsDepartmentRemoved: null
                    , IsDepartmentUpdated: null
                    , IsDepartmentAdded: null
                    , Department: null
                });
            }
            break;

        case manageDepartmentActions.ActionTypes.UPDATE_EMP_SITE_MAPPING:
            {
                state = Object.assign({}, state, { IsSiteMapping: false });
            }
            break;
        case manageDepartmentActions.ActionTypes.UPDATE_EMP_SITE_MAPPING_COMPLETE:
            {
                state = Object.assign({}, state, { IsSiteMapping: true, SiteMappingData: action.payload });
            }
            break;

        case manageDepartmentActions.ActionTypes.UPDATE_EMPLOYEE_SITE: {
            let modifiedState = Object.assign({}, state, {});
            let data = action.payload.EmployeeList;
            let myArray = modifiedState.CompanyEmployees;
            myArray.filter(el => {
                let index = data.find(e => e.Id === el.Id);
                if (!isNullOrUndefined(index)) {
                    el.SiteName = index.Job.SiteName;
                    el.SiteId = index.Job.SiteId;
                }
            });
            return modifiedState;
        }

        default:
            {

            }
            break;
    }
    return state;
}

export function getCompanyDepartments(state$: Observable<ManageDepartmentState>): Observable<Array<DepartmentModel>> {
    return state$.select(s => s.CompanyDepartments);
};

export function getCompanyDepartmentEmployees(state$: Observable<ManageDepartmentState>): Observable<Map<string, Array<EmployeeMetadata>>> {
    return state$.select(s => s.CompanyDepartmentEmployees);
};

export function getCompanyEmployees(state$: Observable<ManageDepartmentState>): Observable<Array<EmployeeMetadata>> {
    return state$.select(s => s.CompanyEmployees);
};

export function getSelectedEmployeeBasicInfo(state$: Observable<ManageDepartmentState>): Observable<EmployeeBasicInfoModel> {
    return state$.select(s => s.SelectedEmployee);
};

export function getCompanyDepartmentAddStatus(state$: Observable<ManageDepartmentState>): Observable<boolean> {
    return state$.select(s => s.IsDepartmentAdded);
};

export function getCompanyDepartmentUpdateStatus(state$: Observable<ManageDepartmentState>): Observable<boolean> {
    return state$.select(s => s.IsDepartmentUpdated);
};

export function getCompanyDepartmentRemoveStatus(state$: Observable<ManageDepartmentState>): Observable<boolean> {
    return state$.select(s => s.IsDepartmentRemoved);
};

export function getCompanyDepartment(state$: Observable<ManageDepartmentState>): Observable<DepartmentModel> {
    return state$.select(s => s.Department);
};
