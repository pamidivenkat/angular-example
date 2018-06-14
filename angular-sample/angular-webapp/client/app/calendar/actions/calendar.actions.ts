import { CalendarFilterModel } from '../model/calendar-filter.model';
import { CalendarEvent } from '../../atlas-elements/common/models/calendar-models/calendarEvent';
import { Employee } from '../model/calendar-models';
import { type } from '../../shared/util';

import { toPayload } from '@ngrx/effects';

export const ActionTypes = {  
    SEARCH_DEPARTMENT_EMPLOYEES: type('[Employees] Search Employees'),
    SEARCH_DEPARTMENT_EMPLOYEES_COMPLETE: type('[Employees] Search Employees complete'),
    SEARCH_EVENTS: type('[Search Events] Search events'),
    SEARCH_EVENTS_COMPLETE: type('[Search Events] Search events complete'),
    REFRESH_EVENTS: type('[Refresh Events] Refresh events complete'),
    SET_SHOWPENDING : type('[SET showpending holidays] Set showpending holidays filters'),
    SET_TEAMCALENDAR : type('[SET Team calendar] Set Team calendar'),
    SET_SELECTED_EMPLOYEE : type('[SET selected employee] Set selected employee'),
}

/**
* This action is to set selected employee - employee manage
*/
export class SetSelectedEmployeeAction {
    type = ActionTypes.SET_SELECTED_EMPLOYEE;
    constructor(public payload: Employee) {
    }
}


/**
* This action is to set team calendar = true
*/
export class SetTeamCalendarAction {
    type = ActionTypes.SET_TEAMCALENDAR;
    constructor(public payload: boolean) {
    }
}

/**
* This action is to set show pending holidays
*/
export class SetShowPendingHolidaysAction {
    type = ActionTypes.SET_SHOWPENDING;
    constructor(public payload: boolean) {
    }
}



/**
* This action is to load the Employees
*/
export class SearchEmployeesAction {
    type = ActionTypes.SEARCH_DEPARTMENT_EMPLOYEES;
    constructor(public payload: any) {
    }
}


/**
* This  is complete action of load Employees
*/
export class SearchEmployeesCompleteAction {
    type = ActionTypes.SEARCH_DEPARTMENT_EMPLOYEES_COMPLETE;
    constructor(public payload: Employee[]) {

    }
}



/**
* This action is to search calendar events
*/
export class SearchEventsAction {
    type = ActionTypes.SEARCH_EVENTS;
    constructor(public payload: CalendarFilterModel) {
    }
}


/**
* This  is complete action of search calendar events
*/
export class SearchEventsCompleteAction {
    type = ActionTypes.SEARCH_EVENTS_COMPLETE;
    constructor(public payload: CalendarEvent[]) {

    }
}

/**
* This action is to search calendar events
*/
export class RefreshEventsAction {
    type = ActionTypes.REFRESH_EVENTS;
    constructor(public payload: boolean) {
    }
}


export type Actions = SearchEmployeesAction
    | SearchEmployeesCompleteAction
    | SearchEventsAction
    | SearchEventsCompleteAction
    | RefreshEventsAction;