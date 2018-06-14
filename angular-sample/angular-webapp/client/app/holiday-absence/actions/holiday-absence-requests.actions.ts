import { TeamRoster } from './../models/team-roster.model';
import { FiscalYearSummaryModel } from './../models/holiday-absence.model';
import { Employee } from './../../employee/models/employee.model';
import { AtlasApiRequest, AtlasApiResponse, AtlasApiRequestWithParams } from '../../shared/models/atlas-api-response';
import { FiscalYear } from '../../shared/models/company.models';
import { type } from '../../shared/util';
import {
    EmployeeConfig
    , MyAbsence
    , MyAbsenceHistory
    , FiscalYearSummary
    , EmployeeHolidayWorkingProfile
} from '../models/holiday-absence.model';
import { Response } from '@angular/http';
import * as Immutable from 'immutable';

export const ActionTypes = {
    LOAD_HOLIDAY_ABSENCE_REQUESTS: type('[HOLIDAY_ABSENCE_REQUESTS] Load holiday absence requests'),
    LOAD_HOLIDAY_ABSENCE_REQUESTS_COMPLETE: type('[HOLIDAY_ABSENCE_REQUESTS] Load holiday absence requests complete'),
    LOAD_HOLIDAY_ABSENCE_REQUESTS_EMPLOYEES: type('[HOLIDAY_ABSENCE_REQUESTS] Load holiday absence requests employees'),
    LOAD_HOLIDAY_ABSENCE_REQUESTS_EMPLOYEES_COMPLETE: type('[HOLIDAY_ABSENCE_REQUESTS] Load holiday absence requests employees complete'),
    LOAD_HOLIDAY_ABSENCE_REQUEST_TEAM_ROSTER: type('[HOLIDAY_ABSENCE_REQUEST] Load holiday absence request team roaster'),
    LOAD_HOLIDAY_ABSENCE_REQUEST_TEAM_ROSTER_COMPLETE: type('[HOLIDAY_ABSENCE_REQUEST] Load holiday absence request team roaster complete'),
    LOAD_HOLIDAY_ABSENCE_REQUEST_TEAM_CALENDAR: type('[HOLIDAY_ABSENCE_REQUEST] Load holiday absence request team calendar'),
    LOAD_HOLIDAY_ABSENCE_REQUEST_TEAM_CALENDAR_COMPLETE: type('[HOLIDAY_ABSENCE_REQUEST] Load holiday absence request team calendar complete'),
    LOAD_SELECTED_EMPLOYEE_SUMMARY: type('[HOLIDAY_ABSENCE_REQUEST] Load selected employee summary'),
    LOAD_SELECTED_EMPLOYEE_SUMMARY_COMPLETE: type('[HOLIDAY_ABSENCE_REQUEST] Load selected employee summary complete'),
    LOAD_SELECTED_EMPLOYEE_CONFIG: type('[HOLIDAY_ABSENCE_REQUEST] Load selected employee config'),
    LOAD_SELECTED_EMPLOYEE_CONFIG_COMPLETE: type('[HOLIDAY_ABSENCE_REQUEST] Load selected employee config complete'),
    LOAD_SELECTED_EMPLOYEE_ABSENCE: type('[HOLIDAY_ABSENCE_REQUESTS] Load Selected Employee Absence'),
    LOAD_SELECTED_EMPLOYEE_ABSENCE_COMPLETE: type('[HOLIDAY_ABSENCE_REQUESTS] Load Selected Employee Absence complete'),
    UPDATE_SELECTED_EMPLOYEE_ABSENCE: type('[HOLIDAY_ABSENCE_REQUESTS] Update Selected Employee Absence'),
    UPDATE_SELECTED_EMPLOYEE_ABSENCE_COMPLETE: type('[HOLIDAY_ABSENCE_REQUESTS] Update Selected Employee Absence complete'),
    ADD_SELECTED_EMPLOYEE_ABSENCE: type('[HOLIDAY_ABSENCE_REQUESTS] Add Selected Employee Absence'),
    ADD_SELECTED_EMPLOYEE_ABSENCE_COMPLETE: type('[HOLIDAY_ABSENCE_REQUESTS] Add Selected Employee Absence complete'),
    LOAD_SELECTED_EMPLOYEE_ABSENCE_HISTORY: type('[HOLIDAY_ABSENCE_REQUESTS] Load Selected Employee Absence History'),
    LOAD_SELECTED_EMPLOYEE_ABSENCE_HISTORY_COMPLETE: type('[HOLIDAY_ABSENCE_REQUESTS] Load Selected Absences History complete'),
    CLEAR_SELECTED_EMPLOYEE_ABSENCE: type('[HOLIDAY_ABSENCE_REQUESTS] Clear Selected Employee Absence'),
    LOAD_ONE_STEP_APPROVAL: type('[HOLIDAY_ABSENCE_REQUESTS] Load one step approval'),
    CLEAR_ONE_STEP_APPROVAL: type('[HOLIDAY_ABSENCE_REQUESTS] Clear one step approval')
};

export class LoadHolidayAbsenceRequestsAction {
    type = ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUESTS;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadHolidayAbsenceRequestsCompleteAction {
    type = ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUESTS_COMPLETE;
    constructor(public payload: AtlasApiResponse<MyAbsence>) {
    }
}

export class LoadHolidayAbsenceRequestsEmployeesAction {
    type = ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUESTS_EMPLOYEES;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadHolidayAbsenceRequestsEmployeesCompleteAction {
    type = ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUESTS_EMPLOYEES_COMPLETE;
    constructor(public payload: { response: AtlasApiResponse<Employee>, currentEmployee: any }) {
    }
}


export class LoadHoliayAbsenceRequestTeamRosterAction {
    type = ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUEST_TEAM_ROSTER;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}


export class LoadHoliayAbsenceRequestTeamRosterCompleteAction {
    type = ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUEST_TEAM_ROSTER_COMPLETE;
    constructor(public payload: TeamRoster[]) {
    }
}


export class LoadHoliayAbsenceRequestTeamCalendarAction {
    type = ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUEST_TEAM_CALENDAR;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}


export class LoadHoliayAbsenceRequestTeamCalendarCompleteAction {
    type = ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUEST_TEAM_CALENDAR_COMPLETE;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}


export class LoadSelectedEmployeeSummaryAction {
    type = ActionTypes.LOAD_SELECTED_EMPLOYEE_SUMMARY;
    constructor(public payload: any) {
    }
}

export class LoadSelectedEmployeeSummaryCompleteAction {
    type = ActionTypes.LOAD_SELECTED_EMPLOYEE_SUMMARY_COMPLETE;
    constructor(public payload: FiscalYearSummaryModel) {
    }
}

export class LoadSelectedEmployeeConfigAction {
    type = ActionTypes.LOAD_SELECTED_EMPLOYEE_CONFIG;
    constructor(public payload: string) {
    }
}

export class LoadSelectedEmployeeConfigCompleteAction {
    type = ActionTypes.LOAD_SELECTED_EMPLOYEE_CONFIG_COMPLETE;
    constructor(public payload: EmployeeConfig) {
    }
}

export class UpdateSelectedEmployeeAbsenceAction {
    type = ActionTypes.UPDATE_SELECTED_EMPLOYEE_ABSENCE;
    constructor(public payload: MyAbsence) {
    }
}

export class UpdateSelectedEmployeeAbsenceCompleteAction {
    type = ActionTypes.UPDATE_SELECTED_EMPLOYEE_ABSENCE_COMPLETE;
    constructor(public payload: MyAbsence) {
    }
}

/**
* This action is to add my absence
*/
export class AddSelectedEmployeeAbsenceAction {
    type = ActionTypes.ADD_SELECTED_EMPLOYEE_ABSENCE;
    constructor(public payload: MyAbsence) {
    }
}

export class AddSelectedEmployeeAbsenceCompleteAction {
    type = ActionTypes.ADD_SELECTED_EMPLOYEE_ABSENCE_COMPLETE;
    constructor(public payload: MyAbsence) {
    }
}

/**
* This action is to add my absence
*/
export class LoadSelectedEmployeeAbsenceAction {
    type = ActionTypes.LOAD_SELECTED_EMPLOYEE_ABSENCE;
    constructor(public payload: string) {
    }
}

export class LoadSelectedEmployeeAbsenceCompleteAction {
    type = ActionTypes.LOAD_SELECTED_EMPLOYEE_ABSENCE_COMPLETE;
    constructor(public payload: MyAbsence) {
    }
}

export class LoadSelectedEmployeeAbsenceHistoryAction {
    type = ActionTypes.LOAD_SELECTED_EMPLOYEE_ABSENCE_HISTORY;
    constructor(public payload: string) {
    }
}

export class LoadSelectedEmployeeAbsenceHistoryCompleteAction {
    type = ActionTypes.LOAD_SELECTED_EMPLOYEE_ABSENCE_HISTORY_COMPLETE;
    constructor(public payload: Immutable.List<MyAbsenceHistory>) {
    }
}

export class ClearSelectedEmployeeAbsence {
    type = ActionTypes.CLEAR_SELECTED_EMPLOYEE_ABSENCE;
    constructor() { }
}

export class LoadOneStepApprovalAction {
    type = ActionTypes.LOAD_ONE_STEP_APPROVAL;
    constructor(public payload: boolean) {
    }
}

export class ClearOneStepApprovalAction {
    type = ActionTypes.CLEAR_ONE_STEP_APPROVAL;
    constructor(public payload: boolean) {
    }
}


export type Actions = LoadHolidayAbsenceRequestsAction
    | LoadHolidayAbsenceRequestsCompleteAction
    | LoadHoliayAbsenceRequestTeamRosterAction
    | LoadHoliayAbsenceRequestTeamRosterCompleteAction
    | LoadHoliayAbsenceRequestTeamCalendarAction
    | LoadHoliayAbsenceRequestTeamCalendarCompleteAction
    | LoadSelectedEmployeeSummaryAction
    | LoadSelectedEmployeeSummaryCompleteAction
    | LoadSelectedEmployeeConfigAction
    | LoadSelectedEmployeeConfigCompleteAction
    | UpdateSelectedEmployeeAbsenceAction
    | UpdateSelectedEmployeeAbsenceCompleteAction
    | AddSelectedEmployeeAbsenceAction
    | AddSelectedEmployeeAbsenceCompleteAction
    | LoadSelectedEmployeeAbsenceAction
    | LoadSelectedEmployeeAbsenceCompleteAction
    | LoadSelectedEmployeeAbsenceHistoryAction
    | LoadSelectedEmployeeAbsenceHistoryCompleteAction
    | ClearSelectedEmployeeAbsence
    | LoadOneStepApprovalAction | ClearOneStepApprovalAction;
