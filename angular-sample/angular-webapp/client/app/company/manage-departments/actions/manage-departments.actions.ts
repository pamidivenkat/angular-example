import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';
import { DepartmentModel, DepartmentEntity } from '../models/department.model';
import { EmployeeMetadata } from '../models/employee-metadata.model';
import { EmployeeBasicInfoModel } from "../models/employee-basic-info.model";

export const ActionTypes = {
    LOAD_COMPANY_DEPARTMENTS: type('[CompanyOrgStructure] Load company departments'),
    LOAD_COMPANY_DEPARTMENTS_COMPLETE: type('[CompanyOrgStructure] Load company departments completed'),
    LOAD_COMPANY_EMPLOYEES: type('[CompanyOrgStructure] Load company employees'),
    LOAD_COMPANY_EMPLOYEES_COMPLETE: type('[CompanyOrgStructure] Load company employees completed'),
    LOAD_COMPANY_DEPARTMENT_EMPLOYEES: type('[CompanyOrgStructure] Load company department employees'),
    LOAD_COMPANY_DEPARTMENT: type('[CompanyOrgStructure] Load company department'),
    LOAD_COMPANY_DEPARTMENT_COMPLETE: type('[CompanyOrgStructure] Load company department completed.'),
    ADD_COMPANY_DEPARTMENT: type('[CompanyOrgStructure] Add company department'),
    ADD_COMPANY_DEPARTMENT_COMPLETE: type('[CompanyOrgStructure] Add company department completed'),
    UPDATE_COMPANY_DEPARTMENT: type('[CompanyOrgStructure] Update company department'),
    UPDATE_COMPANY_DEPARTMENT_COMPLETE: type('[CompanyOrgStructure] Update company department completed'),
    REMOVE_COMPANY_DEPARTMENT: type('[CompanyOrgStructure] Remove company department'),
    REMOVE_COMPANY_DEPARTMENT_COMPLETE: type('[CompanyOrgStructure] Remove company department completed'),
    CLEAR_CURRENT_COMPANY_DEPARTMENT: type('[CompanyOrgStructure] Clear current company department'),
    LOAD_SELECTED_EMPLOYEE_BASIC_INFO: type('[CompanyOrgStructure] Load selected employee basic info'),
    LOAD_SELECTED_EMPLOYEE_BASIC_INFO_COMPLETE: type('[CompanyOrgStructure] Load selected employee basic info completed'),
    CLEAR_SELECTED_EMPLOYEE_BASIC_INFO: type('[CompanyOrgStructure] Clear selected employee basic info'),
    ASSIGN_EMPLOYEE_TO_DEPARTMENT: type('[CompanyOrgStructure] Assign employee to department'),
    ASSIGN_EMPLOYEE_TO_DEPARTMENT_COMPLETE: type('[CompanyOrgStructure] Assign employee to department completed'),
    UPDATE_EMP_SITE_MAPPING:type('[SITES],update Emp Site Mapping'),
    UPDATE_EMP_SITE_MAPPING_COMPLETE:type('[SITES],update Emp Site Mapping complete'),
    UPDATE_EMPLOYEE_SITE:type('[SITES] update Employee')
};

export class LoadCompanyDepartmentsAction implements Action {
    type = ActionTypes.LOAD_COMPANY_DEPARTMENTS;
    constructor(public payload: string) {
    }
}

export class LoadCompanyDepartmentsCompleteAction implements Action {
    type = ActionTypes.LOAD_COMPANY_DEPARTMENTS_COMPLETE;
    constructor(public payload: Array<DepartmentModel>) {
    }
}

export class LoadCompanyEmployeesAction implements Action {
    type = ActionTypes.LOAD_COMPANY_EMPLOYEES;
    constructor(public payload: boolean) {
    }
}

export class LoadCompanyEmployeesCompleteAction implements Action {
    type = ActionTypes.LOAD_COMPANY_EMPLOYEES_COMPLETE;
    constructor(public payload: Array<EmployeeMetadata>) {
    }
}

export class LoadCompanyDepartmentEmployeesAction implements Action {
    type = ActionTypes.LOAD_COMPANY_DEPARTMENT_EMPLOYEES;
    constructor(public payload: Map<string, Array<EmployeeMetadata>>) {
    }
}

export class LoadCompanyDepartmentAction implements Action {
    type = ActionTypes.LOAD_COMPANY_DEPARTMENT;
    constructor(public payload: string) {
    }
}

export class LoadCompanyDepartmentCompleteAction implements Action {
    type = ActionTypes.LOAD_COMPANY_DEPARTMENT_COMPLETE;
    constructor(public payload: DepartmentEntity) {
    }
}

export class RemoveCompanyDepartmentAction implements Action {
    type = ActionTypes.REMOVE_COMPANY_DEPARTMENT;
    constructor(public payload: DepartmentModel) {
    }
}

export class RemoveCompanyDepartmentCompleteAction implements Action {
    type = ActionTypes.REMOVE_COMPANY_DEPARTMENT_COMPLETE;
    constructor(public payload: DepartmentModel) {
    }
}

export class AddCompanyDepartmentAction implements Action {
    type = ActionTypes.ADD_COMPANY_DEPARTMENT;
    constructor(public payload: DepartmentModel) {
    }
}

export class AddCompanyDepartmentCompleteAction implements Action {
    type = ActionTypes.ADD_COMPANY_DEPARTMENT_COMPLETE;
    constructor(public payload: DepartmentModel) {
    }
}

export class UpdateCompanyDepartmentAction implements Action {
    type = ActionTypes.UPDATE_COMPANY_DEPARTMENT;
    constructor(public payload: DepartmentModel) {
    }
}

export class UpdateCompanyDepartmentCompleteAction implements Action {
    type = ActionTypes.UPDATE_COMPANY_DEPARTMENT_COMPLETE;
    constructor(public payload: DepartmentModel) {
    }
}

export class ClearCurrentCompanyDepartmentAction implements Action {
    type = ActionTypes.CLEAR_CURRENT_COMPANY_DEPARTMENT;
    constructor(public payload: boolean) {
    }
}

export class LoadSelectedEmployeeBasicInfoAction implements Action {
    type = ActionTypes.LOAD_SELECTED_EMPLOYEE_BASIC_INFO;
    constructor(public payload: string) {
    }
}

export class LoadSelectedEmployeeBasicInfoCompleteAction implements Action {
    type = ActionTypes.LOAD_SELECTED_EMPLOYEE_BASIC_INFO_COMPLETE;
    constructor(public payload: EmployeeBasicInfoModel) {
    }
}

export class ClearSelectedEmployeeBasicInfoCompleteAction implements Action {
    type = ActionTypes.CLEAR_SELECTED_EMPLOYEE_BASIC_INFO;
    constructor(public payload: boolean) {
    }
}

export class AssignEmployeeToDepartmentAction implements Action {
    type = ActionTypes.ASSIGN_EMPLOYEE_TO_DEPARTMENT;
    constructor(public payload: {
        EmployeeId: string,
        DepartmentId: string
    }) {
    }
}

export class AssignEmployeeToDepartmentCompleteAction implements Action {
    type = ActionTypes.ASSIGN_EMPLOYEE_TO_DEPARTMENT_COMPLETE;
    constructor(public payload: DepartmentModel) {
    }
}

/** MApping site to Employee Start */
export class UpdateEmpSiteMappingAction implements Action{
    type = ActionTypes.UPDATE_EMP_SITE_MAPPING;
    constructor(public payload: any) {

    }
}

export class UpdateEmpSiteMappingActionComplete implements Action{
    type = ActionTypes.UPDATE_EMP_SITE_MAPPING_COMPLETE;
    constructor(public payload: any) {

    }
}
/** MApping site to Employee End */
/** Updating the Employee with site Mapped data */
export class UpdateEmployeeSitesAction implements Action{
    type = ActionTypes.UPDATE_EMPLOYEE_SITE;
    constructor(public payload: any) {

    }
}

export type Actions =
    LoadCompanyDepartmentsAction | LoadCompanyDepartmentsCompleteAction
    | LoadCompanyEmployeesAction | LoadCompanyEmployeesCompleteAction
    | LoadCompanyDepartmentAction | LoadCompanyDepartmentCompleteAction
    | AddCompanyDepartmentAction | AddCompanyDepartmentCompleteAction
    | UpdateCompanyDepartmentAction | UpdateCompanyDepartmentCompleteAction
    | RemoveCompanyDepartmentAction | RemoveCompanyDepartmentCompleteAction
    | LoadSelectedEmployeeBasicInfoCompleteAction | LoadSelectedEmployeeBasicInfoAction
    | ClearCurrentCompanyDepartmentAction | ClearSelectedEmployeeBasicInfoCompleteAction
    | UpdateEmpSiteMappingAction     | UpdateEmpSiteMappingActionComplete
    | UpdateEmployeeSitesAction;
