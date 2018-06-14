import { CalendarFilterModel } from '../model/calendar-filter.model';
import { CalendarEntityModel, Department, Employee, Site, CalendarEmployee } from '../model/calendar-models';
import { CalendarEvent } from '../../atlas-elements/common/models/calendar-models/calendarEvent';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as calendarActions from '../actions/calendar.actions';
import * as Immutable from 'immutable';

const initialCalendarState = {
    calendarStatus: false,
    isEmployeesLoaded: false,
    employees: [],
    events: [],
    filters: null,
    calendarSearchModel: null,
    isTeamCalendar : false,
    selectedEmployee : null
}

export interface CalendarState {
    calendarStatus: boolean,
    isEmployeesLoaded: boolean,
    employees: Employee[],
    events: CalendarEvent[],
    filters: Map<string, any>,
    calendarSearchModel: CalendarFilterModel
    isTeamCalendar : boolean,
    selectedEmployee : CalendarEmployee
}


export function reducer(state = initialCalendarState, action: Action): CalendarState {
    switch (action.type) {
      
        case calendarActions.ActionTypes.SEARCH_DEPARTMENT_EMPLOYEES:
            {
                return Object.assign({}, state, { isEmployeesLoaded: false });
            }

        case calendarActions.ActionTypes.SEARCH_DEPARTMENT_EMPLOYEES_COMPLETE:
            {
                return Object.assign({}, state, { isEmployeesLoaded: true, employees: action.payload });
            }
        case calendarActions.ActionTypes.SEARCH_EVENTS:
            {
                return Object.assign({}, state, { calendarStatus: false , calendarSearchModel: action.payload , events:[] });
            }
        case calendarActions.ActionTypes.SEARCH_EVENTS_COMPLETE:
            {
                return Object.assign({}, state, { calendarStatus: true, events: action.payload });
            }
         case calendarActions.ActionTypes.SET_TEAMCALENDAR:
            {
                return Object.assign({}, state, { isTeamCalendar: action.payload });
            }
         case calendarActions.ActionTypes.SET_SELECTED_EMPLOYEE:
            {
                let modifiedState = Object.assign({}, state, {});
                modifiedState.selectedEmployee = null;
                modifiedState.selectedEmployee = action.payload;
                return modifiedState;
            }
        default:
            return state;
    }
}

export function calendarEmployeesData(state$: Observable<CalendarState>): Observable<Employee[]> {
    return state$.select(s => s.employees);
}

export function calendarEventsData(state$: Observable<CalendarState>): Observable<CalendarEvent[]> {
    return state$.select(s => s.events);
}

export function calendarSearchData(state$: Observable<CalendarState>): Observable<CalendarFilterModel> {
    return state$.select(s => s.calendarSearchModel);
}

export function calendarEventsState(state$: Observable<CalendarState>): Observable<boolean> {
    return state$.select(s => s.calendarStatus);
}

export function isTeamCalendar(state$: Observable<CalendarState>): Observable<boolean> {
    return state$.select(s => s.isTeamCalendar);
}

export function getSelectedEmployee(state$: Observable<CalendarState>): Observable<Employee> {
    return state$.select(s => s.selectedEmployee);
}
