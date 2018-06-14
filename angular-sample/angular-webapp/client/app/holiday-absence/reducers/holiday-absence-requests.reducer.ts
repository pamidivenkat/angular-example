import { Employee } from './../../employee/models/employee.model';
import { CalendarEntityTypeModel } from './../../calendar/model/calendar-models';
import { TeamRoster } from './../models/team-roster.model';
import { extractDonutChartData, processMyAbsencesList } from './../common/extract-helpers';
import { State } from '../../shared/reducers';
import { AtlasApiResponse, AtlasApiRequestWithParams } from '../../shared/models/atlas-api-response';
import { extractDataTableOptions } from '../../shared/helpers/extract-helpers';
import { DataTableOptions } from './../../atlas-elements/common/models/ae-datatable-options';
import { PagingInfo } from './../../atlas-elements/common/models/ae-paging-info';
import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Rx';
import { Action, ActionReducer, combineReducers } from '@ngrx/store';
import { compose } from '@ngrx/core';
import {
    EmployeeConfig, EmployeeHolidayWorkingProfile,
    FiscalYearSummary, MyAbsence, MyAbsenceHistory
} from './../models/holiday-absence.model';
import * as actions from '../actions/holiday-absence-requests.actions';
import * as Immutable from 'immutable';
import { AeSelectItem } from "./../../atlas-elements/common/models/ae-select-item";

export interface HolidayAbsenceRequestsState {
    employeeSearchApiRequest: AtlasApiRequestWithParams;
    employeeSearchApiResponse: Employee[];
    apiRequestWithParams: AtlasApiRequestWithParams;
    hasHolidayAbsenceRequestsLoaded: boolean;
    holidayAbsenceRequestsPagingInfo: PagingInfo;
    holidayAbsenceRequests: MyAbsence[];
    currentHolidayAbsenceRequest: MyAbsence;
    hasTeamRosterLoaded: boolean;
    currentTeamRosterApiRequest: AtlasApiRequestWithParams;
    teamRoster: Immutable.List<TeamRoster>;
    teamRosterCount: number,
    calendarEntityType: CalendarEntityTypeModel; // Anusha please check whether this is correct state or not or should we simply load the calednar sub module in popup with sent department id(selected department id from the employee leave requets) from route params    
    selectedEmployeeHolidaySummary: FiscalYearSummary;
    selectedEmployeeHolidaySummaryForChart: FiscalYearSummary;
    selectedEmployeeConfig: EmployeeConfig;
    IsSelectedEmployeeAbsenceAdded: boolean;
    IsSelectedEmployeeAbsenceUpdated: boolean;
    SelectedEmployeeAbsence: MyAbsence;
    SelectedEmployeeAbsenceHistory: MyAbsenceHistory;
    OneStepApproval: boolean;
}

const initialState: HolidayAbsenceRequestsState = {
    employeeSearchApiRequest: null,
    employeeSearchApiResponse: null,
    apiRequestWithParams: null,
    hasHolidayAbsenceRequestsLoaded: false,
    holidayAbsenceRequestsPagingInfo: null,
    holidayAbsenceRequests: null,
    currentHolidayAbsenceRequest: null,
    currentTeamRosterApiRequest: null,
    hasTeamRosterLoaded: false,
    teamRoster: null,
    teamRosterCount: null,
    calendarEntityType: null,
    selectedEmployeeHolidaySummary: null,
    selectedEmployeeHolidaySummaryForChart: null,
    selectedEmployeeConfig: null,
    IsSelectedEmployeeAbsenceAdded: null,
    IsSelectedEmployeeAbsenceUpdated: null,
    SelectedEmployeeAbsence: null,
    SelectedEmployeeAbsenceHistory: null,
    OneStepApproval: null
};


export function reducer(state = initialState, action: Action): HolidayAbsenceRequestsState {
    switch (action.type) {
        case actions.ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUESTS:
            {
                return Object.assign({}, state, { hasHolidayAbsenceRequestsLoaded: false, apiRequestWithParams: action.payload });

            }
        case actions.ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUESTS_COMPLETE:
            {
                let pl = <AtlasApiResponse<MyAbsence>>action.payload;
                let modifiedState = Object.assign({}, state, { hasHolidayAbsenceRequestsLoaded: true });
                modifiedState.holidayAbsenceRequests = processMyAbsencesList(pl.Entities);
                if (!isNullOrUndefined(modifiedState.holidayAbsenceRequestsPagingInfo)) {
                    if (pl.PagingInfo.PageNumber == 1) {
                        modifiedState.holidayAbsenceRequestsPagingInfo.TotalCount = pl.PagingInfo.TotalCount;
                    }
                    modifiedState.holidayAbsenceRequestsPagingInfo.Count = pl.PagingInfo.Count;
                    modifiedState.holidayAbsenceRequestsPagingInfo.PageNumber = pl.PagingInfo.PageNumber;
                }
                else {
                    modifiedState.holidayAbsenceRequestsPagingInfo = pl.PagingInfo;
                }
                return modifiedState;
            }
        case actions.ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUESTS_EMPLOYEES:
            {
                return Object.assign({}, state, { employeeSearchApiRequest: action.payload });

            }
        case actions.ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUESTS_EMPLOYEES_COMPLETE:
            {
                let pl = <AtlasApiResponse<Employee>>action.payload.response;
                let currentEmpId = action.payload.currentEmployee;
                let modifiedState = Object.assign({}, state, {});
                //filtering out the logged in employee record from the response..
                let modifiedRes = pl.Entities;
                modifiedRes = modifiedRes.filter(obj => obj.Id.toLowerCase() != currentEmpId.toLowerCase());
                modifiedState.employeeSearchApiResponse = modifiedRes;
                return modifiedState;
            }
        case actions.ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUEST_TEAM_ROSTER:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.currentTeamRosterApiRequest = action.payload;
                modifiedState.hasTeamRosterLoaded = false;
                return modifiedState;
            }
        case actions.ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUEST_TEAM_ROSTER_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.hasTeamRosterLoaded = true;
                modifiedState.teamRoster = Immutable.List<TeamRoster>(action.payload);
                modifiedState.teamRosterCount = 5; //modifiedState.teamRoster.count();
                return modifiedState;
            }
        case actions.ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUEST_TEAM_CALENDAR:
            {
                let modifiedState = Object.assign({}, state);
                //TODO
                return modifiedState;
            }
        case actions.ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUEST_TEAM_CALENDAR_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                //TODO
                return modifiedState;
            }
        case actions.ActionTypes.LOAD_SELECTED_EMPLOYEE_SUMMARY:
            {
                let modifiedState = Object.assign({}, state);
                //TODO
                return modifiedState;
            }
        case actions.ActionTypes.LOAD_SELECTED_EMPLOYEE_SUMMARY_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.selectedEmployeeHolidaySummary = action.payload.summary;
                modifiedState.selectedEmployeeHolidaySummaryForChart = action.payload.chartSummary;
                return modifiedState;
            }
        case actions.ActionTypes.LOAD_SELECTED_EMPLOYEE_CONFIG:
            {
                return Object.assign({}, state, { selectedEmployeeConfig: null });
            }
        case actions.ActionTypes.LOAD_SELECTED_EMPLOYEE_CONFIG_COMPLETE:
            {
                return Object.assign({}, state, { selectedEmployeeConfig: action.payload });
            }
        case actions.ActionTypes.ADD_SELECTED_EMPLOYEE_ABSENCE:
            {
                return Object.assign({}, state, { IsSelectedEmployeeAbsenceAdded: false });
            }

        case actions.ActionTypes.ADD_SELECTED_EMPLOYEE_ABSENCE_COMPLETE:
            {
                return Object.assign({}, state, { IsSelectedEmployeeAbsenceAdded: true, SelectedEmployeeAbsence: action.payload });
            }

        case actions.ActionTypes.UPDATE_SELECTED_EMPLOYEE_ABSENCE:
            {
                return Object.assign({}, state, { IsSelectedEmployeeAbsenceUpdated: false });
            }

        case actions.ActionTypes.UPDATE_SELECTED_EMPLOYEE_ABSENCE_COMPLETE:
            {
                return Object.assign({}, state, { IsSelectedEmployeeAbsenceUpdated: true, SelectedEmployeeAbsence: action.payload });
            }
        case actions.ActionTypes.LOAD_SELECTED_EMPLOYEE_ABSENCE:
            {
                return Object.assign({}, state);
            }
        case actions.ActionTypes.LOAD_SELECTED_EMPLOYEE_ABSENCE_COMPLETE:
            {
                return Object.assign({}, state, { SelectedEmployeeAbsence: action.payload });
            }

        case actions.ActionTypes.LOAD_SELECTED_EMPLOYEE_ABSENCE_HISTORY:
            {
                return Object.assign({}, state);
            }


        case actions.ActionTypes.LOAD_SELECTED_EMPLOYEE_ABSENCE_HISTORY_COMPLETE:
            {
                return Object.assign({}, state, { SelectedEmployeeAbsenceHistory: action.payload });
            }
        case actions.ActionTypes.CLEAR_SELECTED_EMPLOYEE_ABSENCE:
            return Object.assign({}, state, {
                SelectedEmployeeAbsence: null
                , IsSelectedEmployeeAbsenceAdded: null
                , IsSelectedEmployeeAbsenceUpdated: null
                , SelectedEmployeeAbsenceHistory: null
            });
        case actions.ActionTypes.LOAD_ONE_STEP_APPROVAL:
            {
                return Object.assign({}, state, { OneStepApproval: action.payload });
            }
        case actions.ActionTypes.CLEAR_ONE_STEP_APPROVAL:
            {
                return Object.assign({}, state, { OneStepApproval: null });
            }
        default: {
            return state;
        }
    }
}

export function getHolidayAbsenceRequestsLoaded(state$: Observable<HolidayAbsenceRequestsState>): Observable<boolean> {
    return state$.select(s => s.hasHolidayAbsenceRequestsLoaded);
};

export function getHolidayAbsenceRequests(state$: Observable<HolidayAbsenceRequestsState>): Observable<Immutable.List<MyAbsence>> {
    return state$.select(s => Immutable.List<MyAbsence>(s.holidayAbsenceRequests));
};

export function oneStepApprovalStatus(state$: Observable<HolidayAbsenceRequestsState>): Observable<boolean> {
    return state$.select(s => s.OneStepApproval);
};

export function getHolidayAbsenceRequestsEmployees(state$: Observable<HolidayAbsenceRequestsState>): Observable<AeSelectItem<string>[]> {
    return state$.select(s => s.employeeSearchApiResponse &&
        (s.employeeSearchApiResponse).map((employee) => {
            let middleName = (isNullOrUndefined(employee.MiddleName) ? '' : employee.MiddleName);
            let aeSelectItem = new AeSelectItem<string>(employee.FirstName + ' ' + middleName + ' ' + employee.Surname, employee.Id);
            return aeSelectItem;
        })
    );
};

export function getHolidayAbsenceApiRequest(state$: Observable<HolidayAbsenceRequestsState>): Observable<AtlasApiRequestWithParams> {
    return state$.select(s => s.apiRequestWithParams);
}

export function getEmployeeJobHistoryDataTableOptions(state$: Observable<HolidayAbsenceRequestsState>): Observable<DataTableOptions> {
    return state$.select(state => state.holidayAbsenceRequestsPagingInfo && state.apiRequestWithParams &&
        extractDataTableOptions(state.holidayAbsenceRequestsPagingInfo,state.apiRequestWithParams.SortBy));
}

export function getHolidayAbsenceRequestsCurrentPage(state$: Observable<HolidayAbsenceRequestsState>): Observable<number> {
    return state$.select(s => s.holidayAbsenceRequestsPagingInfo ? s.holidayAbsenceRequestsPagingInfo.PageNumber : 1);
};

export function getHolidayAbsenceRequestsTotalCount(state$: Observable<HolidayAbsenceRequestsState>): Observable<number> {
    return state$.select(s => s.holidayAbsenceRequestsPagingInfo ? s.holidayAbsenceRequestsPagingInfo.TotalCount : 0);
};

export function getHolidayAbsenceRequestsCount(state$: Observable<HolidayAbsenceRequestsState>): Observable<number> {
    return state$.select(s => s.holidayAbsenceRequestsPagingInfo ? s.holidayAbsenceRequestsPagingInfo.Count : 0);
};

export function getSelectedEmployeeHolidaySummary(state$: Observable<HolidayAbsenceRequestsState>): Observable<FiscalYearSummary> {
    return state$.select(s => s.selectedEmployeeHolidaySummary);
};

export function getSelectedEmployeeHolidaySummaryForChart(state$: Observable<HolidayAbsenceRequestsState>): Observable<FiscalYearSummary> {
    return state$.select(s => s.selectedEmployeeHolidaySummaryForChart);
};

export function getSelectedEmployeeAbsenceAdded(state$: Observable<HolidayAbsenceRequestsState>): Observable<boolean> {
    return state$.select(s => s.IsSelectedEmployeeAbsenceAdded);
};

export function getSelectedEmployeeAbsenceUpdated(state$: Observable<HolidayAbsenceRequestsState>): Observable<boolean> {
    return state$.select(s => s.IsSelectedEmployeeAbsenceUpdated);
};

export function getSelectedEmployeeAbsence(state$: Observable<HolidayAbsenceRequestsState>): Observable<MyAbsence> {
    return state$.select(s => s.SelectedEmployeeAbsence);
};

export function getSelectedEmployeeAbsenceHistory(state$: Observable<HolidayAbsenceRequestsState>): Observable<MyAbsenceHistory> {
    return state$.select(s => s.SelectedEmployeeAbsenceHistory);
};

export function getSelectedEmployeeConfig(state$: Observable<HolidayAbsenceRequestsState>): Observable<EmployeeConfig> {
    return state$.select(s => s.selectedEmployeeConfig);
};

export function getTeamRosterLoaded(state$: Observable<HolidayAbsenceRequestsState>): Observable<boolean> {
    return state$.select(s => s.hasTeamRosterLoaded);
};

export function getTeamRoster(state$: Observable<HolidayAbsenceRequestsState>): Observable<Immutable.List<TeamRoster>> {
    return state$.select(s => s.teamRoster);
};

export function getTeamRosterTotalCount(state$: Observable<HolidayAbsenceRequestsState>): Observable<number> {
    return state$.select(s => s.teamRosterCount);
};


export function getTeamRosterDataTableOptions(state$: Observable<HolidayAbsenceRequestsState>): Observable<DataTableOptions> {
    return state$.select(s => new DataTableOptions(1, s.teamRosterCount))
};

