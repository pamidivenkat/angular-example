import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';
import { EmployeeGroup } from './../../../shared/models/company.models';
import { AeSortModel } from "../../../atlas-elements/common/models/ae-sort-model";
import { EmployeeGroupAssociation } from '../../../employee/models/employee-group-association.model';
import { Employee } from '../../models/employee.model';

export const ActionTypes = {
    EMPLOYEEGROUPS_LOAD: type('[EMPLOYEEGROUP] load employee group'),
    EMPLOYEEGROUPS_LOAD_COMPLETE: type('[EMPLOYEEGROUP] load employee group complete'),
    EMPLOYEEGROUPS_ADD: type('[EMPLOYEEGROUP] add employee group'),
    EMPLOYEEGROUPS_ADD_COMPLETED: type('[EMPLOYEEGROUP] add employee group completed'),
    EMPLOYEEGROUPS_UPDATE: type('[EMPLOYEEGROUP] update employee group record'),
    EMPLOYEEGROUPS_UPDATE_COMPLETE: type('[EMPLOYEEGROUP] update employee group record complete'),
    EMPLOYEEGROUPS_DELETE: type('[EMPLOYEEGROUP] delete employee group record'),
    EMPLOYEEGROUPS_DELETE_COMPLETE: type('[EMPLOYEEGROUP] delete employee group record complete'),
    LOAD_EMPLOYEE_GROUP_ON_SORT: type('[EMPLOYEEGROUP] load employee group on sort'),
    LOAD_EMPLOYEE_GROUP_ON_PAGE_CHANGE: type('[EMPLOYEEGROUP] load employee group on page change'),
    LOAD_EMPLOYEE_GROUPS_EMPLOYEES: type('[EMPLOYEEGROUP] Load employee group association employees '),
    LOAD_EMPLOYEE_GROUPS_EMPLOYEES_COMPLETE: type('[EMPLOYEEGROUP] Load employee group association employees complete'),
    CLEAR_EMPLOYEES_LOADING_STATE: type('[EMPLOYEEGROUP] clear employees loading state'),    
    ASSOCIATE_EMPLOYEES_TO_EMPLOYEEGROUP: type('[EMPLOYEEGROUP] associate employees to employee group'),
    ASSOCIATE_EMPLOYEES_TO_EMPLOYEEGROUP_COMPLETE: type('[EMPLOYEEGROUP] associate employees to employee group completed')
}

export class EmployeeGroupsLoad implements Action {
    type = ActionTypes.EMPLOYEEGROUPS_LOAD;
    constructor(public payload: boolean) {

    }
}

export class EmployeeGroupsLoadComplete implements Action {
    type = ActionTypes.EMPLOYEEGROUPS_LOAD_COMPLETE;
    constructor(public payload: any) {

    }
}

export class AddEmployeeGroupsAction implements Action {
    type = ActionTypes.EMPLOYEEGROUPS_ADD;
    constructor(public payload: EmployeeGroup) {

    }
}

export class AddEmployeeGroupsCompletedAction implements Action {
    type = ActionTypes.EMPLOYEEGROUPS_ADD_COMPLETED;
    constructor(public payload: boolean) {

    }
}

export class UpdateEmployeeGroupsAction implements Action {
    type = ActionTypes.EMPLOYEEGROUPS_UPDATE;
    constructor(public payload: EmployeeGroup) {

    }
}

export class UpdateEmployeeGroupsCompletedAction implements Action {
    type = ActionTypes.EMPLOYEEGROUPS_UPDATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class DeleteEmployeeGroupsAction implements Action {
    type = ActionTypes.EMPLOYEEGROUPS_DELETE;
    constructor(public payload: EmployeeGroup) {

    }
}

export class DeleteEmployeeGroupsCompletedAction implements Action {
    type = ActionTypes.EMPLOYEEGROUPS_DELETE_COMPLETE;
    constructor(public payload: boolean) {

    }
}


export class LoadEmployeeGroupsOnSortAction implements Action {
    type = ActionTypes.LOAD_EMPLOYEE_GROUP_ON_SORT;
    constructor(public payload: AeSortModel) {

    }
}



export class LoadEmployeeGroupsOnPageChangeAction implements Action {
    type = ActionTypes.LOAD_EMPLOYEE_GROUP_ON_PAGE_CHANGE;
    constructor(public payload: { pageNumber: number, noOfRows: number }) {

    }
}


export class LoadEmployeeGroupsEmployeesAction implements Action {
    type = ActionTypes.LOAD_EMPLOYEE_GROUPS_EMPLOYEES;
    constructor(public payload: string) {
    }
}

export class LoadEmployeeGroupsEmployeesCompleteAction implements Action {
    type = ActionTypes.LOAD_EMPLOYEE_GROUPS_EMPLOYEES_COMPLETE;
    constructor(public payload: any) {
    }


}

export class ClearEmployeesLoadingState {
    type = ActionTypes.CLEAR_EMPLOYEES_LOADING_STATE;
    constructor() { }
}

export class AssociateEmployeesToEmployeeGroupAction implements Action {
    type = ActionTypes.ASSOCIATE_EMPLOYEES_TO_EMPLOYEEGROUP;
    constructor(public payload: EmployeeGroupAssociation) {

    }
}

export class AssociateEmployeesToEmployeeGroupCompletedAction implements Action {
    type = ActionTypes.ASSOCIATE_EMPLOYEES_TO_EMPLOYEEGROUP_COMPLETE;
    constructor(public payload: boolean) {
    }
}