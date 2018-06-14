import { AtlasApiRequest, AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { isNullOrUndefined } from 'util';
import { EmployeeFullEntity } from './../../../employee/models/employee-full.model';
import { Observable } from 'rxjs/Rx';
import { Action, ActionReducer, combineReducers } from '@ngrx/store';
import * as employeeActions from '../actions/employee-add.actions';
import { compose } from "@ngrx/core";
import * as Immutable from 'immutable';

export interface EmployeeAddState {
    NewEmployeeId: string,
    IsEmployeeDetailsAddInProgress: boolean,
    EmployeeFirstNameAndSurname: string
}

const initialState: EmployeeAddState = {
    NewEmployeeId: null,
    IsEmployeeDetailsAddInProgress: false,
    EmployeeFirstNameAndSurname: ''
}

export function employeeAddReducer(state = initialState, action: Action): EmployeeAddState {
    switch (action.type) {
        case employeeActions.ActionTypes.EMPLOYEE_DETAILS_ADD:
            {
                return Object.assign({}, state, { IsEmployeeDetailsAddInProgress: true, NewEmployeeId: null });
            }
        case employeeActions.ActionTypes.EMPLOYEE_DETAILS_ADD_COMPLETE:
            {
                return Object.assign({}, state, { IsEmployeeDetailsAddInProgress: false, NewEmployeeId: action.payload });
            }
        case employeeActions.ActionTypes.SET_EMPLOYEE_FIRSTNAMESURNAME:
            {
                return Object.assign({}, state, { EmployeeFirstNameAndSurname : action.payload });
            }
        default:
            return state;
    }
}

export function getNewEmployeeId(state$: Observable<EmployeeAddState>): Observable<string> {
    return state$.select(s => s.NewEmployeeId);
}
export function getEmployeeDetailsAddProgressStatus(state$: Observable<EmployeeAddState>): Observable<boolean> {
    return state$.select(s => s.IsEmployeeDetailsAddInProgress);
}
export function getEmployeeFirstNameAndSurname(state$: Observable<EmployeeAddState>): Observable<string> {
    return state$.select(s => s.EmployeeFirstNameAndSurname);
}