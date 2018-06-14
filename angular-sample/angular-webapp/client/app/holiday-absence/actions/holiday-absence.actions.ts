import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { publishBehavior } from 'rxjs/operator/publishBehavior';
import { FiscalYear } from '../../shared/models/company.models';
import { type } from '../../shared/util';
import {
    EmployeeConfig
    , MyAbsence
    , MyAbsenceHistory
    , FiscalYearSummary
    , EmployeeHolidayWorkingProfile
    , FiscalYearSummaryModel
} from '../models/holiday-absence.model';
import { Response } from '@angular/http';
import * as Immutable from 'immutable';

export const ActionTypes = {
    LOAD_EMPLOYEE_CONFIG: type('[HOLIDAY_ABSENCE] Load employee config'),
    LOAD_EMPLOYEE_CONFIG_COMPLETE: type('[HOLIDAY_ABSENCE] Load employee config complete'),
    LOAD_EMPLOYEE_HOLIDAY_WORKING_PROFILE: type('[HOLIDAY_ABSENCE] Load Employee Holiday Working Profile'),
    LOAD_EMPLOYEE_HOLIDAY_WORKING_PROFILE_COMPLETE:
    type('[HOLIDAY_ABSENCE] Load Employee Holiday Working Profile complete'),
    LOAD_FISCAL_YEAR_DATA: type('[HOLIDAY_ABSENCE] Load Fiscal Year Summary'),
    LOAD_FISCAL_YEAR_DATA_COMPLETE: type('[HOLIDAY_ABSENCE] Fiscal Year Summary complete'),
    LOAD_EMPLOYEE_ABSENCES: type('[HOLIDAY_ABSENCE] Load Employee Absences'),
    LOAD_EMPLOYEE_ABSENCES_COMPLETE: type('[HOLIDAY_ABSENCE] Load Employee Absences complete'),
    LOAD_EMPLOYEE_ABSENCE: type('[HOLIDAY_ABSENCE] Load Employee Absence'),
    LOAD_EMPLOYEE_ABSENCE_COMPLETE: type('[HOLIDAY_ABSENCE] Load Employee Absence complete'),
    UPDATE_EMPLOYEE_ABSENCE: type('[HOLIDAY_ABSENCE] Update Employee Absence'),
    UPDATE_EMPLOYEE_ABSENCE_COMPLETE: type('[HOLIDAY_ABSENCE] Update Employee Absence complete'),
    ADD_EMPLOYEE_ABSENCE: type('[HOLIDAY_ABSENCE] Add Employee Absence'),
    ADD_EMPLOYEE_ABSENCE_COMPLETE: type('[HOLIDAY_ABSENCE] Add Employee Absence complete'),
    LOAD_EMPLOYEE_ABSENCE_HISTORY: type('[HOLIDAY_ABSENCE] Load Employee Absence History'),
    LOAD_EMPLOYEE_ABSENCE_HISTORY_COMPLETE: type('[HOLIDAY_ABSENCE] Load Absences History complete'),
    SELECT_CURRENT_ABSENCE: type('[HOLIDAY_ABSENCE] select Absence of current action'),
    CLEAR_CURRENT_ABSENCE: type('[HOLIDAY_ABSENCE] clear Absence on current action complete')
};

/**
* This action is to load the employee config
*/
export class LoadEmployeeConfigAction {
    type = ActionTypes.LOAD_EMPLOYEE_CONFIG;
    constructor(public payload: string) {
    }
}

export class LoadEmployeeConfigCompleteAction {
    type = ActionTypes.LOAD_EMPLOYEE_CONFIG_COMPLETE;
    constructor(public payload: EmployeeConfig) {
    }
}

/**
* This action is to load the employee holiday working profile
*/
export class LoadEmployeeHolidayWorkingProfileAction {
    type = ActionTypes.LOAD_EMPLOYEE_HOLIDAY_WORKING_PROFILE;
    constructor(public payload: string) {
    }
}

export class LoadEmployeeHolidayWorkingProfileCompleteAction {
    type = ActionTypes.LOAD_EMPLOYEE_HOLIDAY_WORKING_PROFILE_COMPLETE;
    constructor(public payload: EmployeeHolidayWorkingProfile) {
    }
}

/**
* This action is to load the fiscal year data
*/
export class LoadFiscalYearDataAction {
    type = ActionTypes.LOAD_FISCAL_YEAR_DATA;
    constructor(public payload: any) {
    }
}

export class LoadFiscalYearDataCompleteAction {
    type = ActionTypes.LOAD_FISCAL_YEAR_DATA_COMPLETE;
    constructor(public payload: FiscalYearSummaryModel) {
    }
}

/**
* This action is to update my absence
*/
export class UpdateEmployeeAbsenceAction {
    type = ActionTypes.UPDATE_EMPLOYEE_ABSENCE;
    constructor(public payload: MyAbsence) {
    }
}

export class UpdateEmployeeAbsenceCompleteAction {
    type = ActionTypes.UPDATE_EMPLOYEE_ABSENCE_COMPLETE;
    constructor(public payload: MyAbsence) {
    }
}

/**
* This action is to add my absence
*/
export class AddEmployeeAbsenceAction {
    type = ActionTypes.ADD_EMPLOYEE_ABSENCE;
    constructor(public payload: MyAbsence) {
    }
}

export class AddEmployeeAbsenceCompleteAction {
    type = ActionTypes.ADD_EMPLOYEE_ABSENCE_COMPLETE;
    constructor(public payload: MyAbsence) {
    }
}

/**
* This action is to add my absence
*/
export class LoadEmployeeAbsenceAction {
    type = ActionTypes.LOAD_EMPLOYEE_ABSENCE;
    constructor(public payload: string) {
    }
}

export class LoadEmployeeAbsenceCompleteAction {
    type = ActionTypes.LOAD_EMPLOYEE_ABSENCE_COMPLETE;
    constructor(public payload: MyAbsence) {
    }
}

export class LoadEmployeeAbsencesAction {
    type = ActionTypes.LOAD_EMPLOYEE_ABSENCES;
    constructor(public payload: any) {

    }
}

export class LoadEmployeeAbsencesCompleteAction {
    type = ActionTypes.LOAD_EMPLOYEE_ABSENCES_COMPLETE;
    constructor(public payload: any) {
    }
}

/**
* This action is to load my absence history
*/
export class LoadEmployeeAbsenceHistoryAction {
    type = ActionTypes.LOAD_EMPLOYEE_ABSENCE_HISTORY;
    constructor(public payload: string) {
    }
}

export class LoadEmployeeAbsenceHistoryCompleteAction {
    type = ActionTypes.LOAD_EMPLOYEE_ABSENCE_HISTORY_COMPLETE;
    constructor(public payload: Immutable.List<MyAbsenceHistory>) {
    }
}

export class LoadCurrentAbsence {
    type = ActionTypes.SELECT_CURRENT_ABSENCE;
    constructor(public payload: string) {
    }
}

export class ClearCurrentAbsence {
    type = ActionTypes.CLEAR_CURRENT_ABSENCE;
    constructor() { }
}

export type Actions = LoadEmployeeConfigAction | LoadEmployeeConfigCompleteAction
    | LoadEmployeeHolidayWorkingProfileAction | LoadEmployeeHolidayWorkingProfileCompleteAction
    | LoadFiscalYearDataAction | LoadFiscalYearDataCompleteAction
    | AddEmployeeAbsenceAction | AddEmployeeAbsenceCompleteAction
    | UpdateEmployeeAbsenceAction | UpdateEmployeeAbsenceCompleteAction
    | LoadEmployeeAbsenceAction | LoadEmployeeAbsenceCompleteAction
    | LoadEmployeeAbsenceHistoryAction | LoadEmployeeAbsenceHistoryCompleteAction
    | LoadCurrentAbsence;
