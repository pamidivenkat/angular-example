import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { extractDataTableOptions } from '../../shared/helpers/extract-helpers';
import { AeSortModel } from '../../atlas-elements/common/models/ae-sort-model';
import { extractDonutChartData } from '../common/extract-helpers';
import { ChartData } from '../../atlas-elements/common/ae-chart-data';
import { State } from '../../shared/reducers';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { DataTableOptions } from '../../atlas-elements/common/models/ae-datatable-options';
import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Rx';
import { Action, ActionReducer, combineReducers } from '@ngrx/store';
import { compose } from '@ngrx/core';
import {
    EmployeeConfig,
    EmployeeHolidayWorkingProfile,
    FiscalYearSummary,
    MyAbsence,
    MyAbsenceHistory,
    MyDelegateInfo
} from '../models/holiday-absence.model';
import * as actions from '../actions/holiday-absence.actions';
import * as Immutable from 'immutable';

export interface HolidayAbsenceState {
    Loading: boolean;
    EmployeeConfiguration: EmployeeConfig;
    EmployeeHolidayWorkingProfile: EmployeeHolidayWorkingProfile;
    FiscalYearSummaryForChart: FiscalYearSummary;
    FiscalYearSummary: FiscalYearSummary;
    IsEmployeeAbsenceAdded: boolean;
    IsEmployeeAbsenceUpdated: boolean;
    IsEmployeeAbsenceListLoading: boolean;
    EmployeeAbsence: MyAbsence;
    EmployeeAbsenceHistory: Immutable.List<MyAbsenceHistory>;
    EmployeeAbsencesList: Immutable.List<MyAbsence>;
    EmployeeAbsencesPagingInfo: PagingInfo;
    EmployeeAbsencesSortInfo: AeSortModel;
    EmployeeDelegateInfo: MyDelegateInfo[];
    Filters: Map<string, string>;
}

const initialState: HolidayAbsenceState = {
    Loading: false,
    EmployeeConfiguration: null,
    EmployeeHolidayWorkingProfile: null,
    FiscalYearSummaryForChart: null,
    FiscalYearSummary: null,
    IsEmployeeAbsenceAdded: null,
    IsEmployeeAbsenceUpdated: null,
    IsEmployeeAbsenceListLoading: null,
    EmployeeAbsence: null,
    EmployeeAbsenceHistory: null,
    EmployeeAbsencesList: null,
    EmployeeAbsencesPagingInfo: null,
    EmployeeAbsencesSortInfo: null,
    EmployeeDelegateInfo: null,
    Filters: null
};

export function reducer(state: HolidayAbsenceState = initialState, action: Action): HolidayAbsenceState {
    switch (action.type) {
        case actions.ActionTypes.LOAD_EMPLOYEE_CONFIG:
            {
                return Object.assign({}, state);
            }

        case actions.ActionTypes.LOAD_EMPLOYEE_CONFIG_COMPLETE:
            {
                return Object.assign({}, state, { EmployeeConfiguration: action.payload });
            }

        case actions.ActionTypes.LOAD_EMPLOYEE_HOLIDAY_WORKING_PROFILE:
            {
                return Object.assign({}, state);
            }

        case actions.ActionTypes.LOAD_EMPLOYEE_HOLIDAY_WORKING_PROFILE_COMPLETE:
            {
                return Object.assign({}, state, { EmployeeHolidayWorkingProfile: action.payload });
            }

        case actions.ActionTypes.LOAD_FISCAL_YEAR_DATA:
            {
                return Object.assign({}, state, { Loading: true });
            };

        case actions.ActionTypes.LOAD_FISCAL_YEAR_DATA_COMPLETE:
            {
                return Object.assign({}, state, {
                    Loading: false,
                    FiscalYearSummaryForChart: action.payload.chartSummary,
                    FiscalYearSummary: action.payload.summary
                });
            }
        case actions.ActionTypes.SELECT_CURRENT_ABSENCE:
            let modifiedState = Object.assign({}, state);
            modifiedState.EmployeeAbsence = state.EmployeeAbsencesList.find(c => c.Id == action.payload);
            return modifiedState;
        case actions.ActionTypes.CLEAR_CURRENT_ABSENCE:
            return Object.assign({}, state, {
                EmployeeAbsence: null
                , IsEmployeeAbsenceAdded: null
                , IsEmployeeAbsenceUpdated: null
                , EmployeeAbsenceHistory: null
            });
        case actions.ActionTypes.LOAD_EMPLOYEE_ABSENCE:
            {
                return Object.assign({}, state);
            }

        case actions.ActionTypes.LOAD_EMPLOYEE_ABSENCE_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.EmployeeAbsence = <MyAbsence>action.payload;
                return modifiedState;
            };
        case actions.ActionTypes.LOAD_EMPLOYEE_ABSENCES: {
            if (isNullOrUndefined(state.Filters)) {
                state.Filters = action.payload;
            }
            else {
                state.Filters = Object.assign(state.Filters, action.payload);
            }
            //Always payload should contain the sorting information
            if (action.payload != null) {
                state.EmployeeAbsencesSortInfo = <AeSortModel>{};
                state.EmployeeAbsencesSortInfo.SortField = action.payload.sortField;
                state.EmployeeAbsencesSortInfo.Direction = action.payload.direction;
                return Object.assign({}, state, { IsEmployeeAbsenceListLoading: true });
            }
        }
        case actions.ActionTypes.LOAD_EMPLOYEE_ABSENCES_COMPLETE:
            {
                if (!isNullOrUndefined(state.EmployeeAbsencesPagingInfo)) {
                    if (action.payload.EmployeeAbsencesPagingInfo.PageNumber == 1) {
                        state.EmployeeAbsencesPagingInfo.TotalCount = action.payload.EmployeeAbsencesPagingInfo.TotalCount;
                    }
                    state.EmployeeAbsencesPagingInfo.PageNumber = action.payload.EmployeeAbsencesPagingInfo.PageNumber;
                    state.EmployeeAbsencesPagingInfo.Count = action.payload.EmployeeAbsencesPagingInfo.Count;
                } else {
                    state.EmployeeAbsencesPagingInfo = action.payload.EmployeeAbsencesPagingInfo;
                }
                state.EmployeeDelegateInfo = action.payload.EmployeeDelegateInfo;
                return Object.assign({}, state, {
                    IsEmployeeAbsenceListLoading: false,
                    EmployeeAbsencesList: action.payload.EmployeeAbsencesList
                });
            }

        case actions.ActionTypes.ADD_EMPLOYEE_ABSENCE:
            {
                return Object.assign({}, state, { IsEmployeeAbsenceAdded: false });
            }

        case actions.ActionTypes.ADD_EMPLOYEE_ABSENCE_COMPLETE:
            {
                return Object.assign({}, state, { IsEmployeeAbsenceAdded: true });
            }

        case actions.ActionTypes.UPDATE_EMPLOYEE_ABSENCE:
            {
                return Object.assign({}, state, { IsEmployeeAbsenceUpdated: false });
            }

        case actions.ActionTypes.UPDATE_EMPLOYEE_ABSENCE_COMPLETE:
            {
                return Object.assign({}, state, { IsEmployeeAbsenceUpdated: true });
            }

        case actions.ActionTypes.LOAD_EMPLOYEE_ABSENCE_HISTORY:
            {
                return Object.assign({}, state);
            }


        case actions.ActionTypes.LOAD_EMPLOYEE_ABSENCE_HISTORY_COMPLETE:
            {
                return Object.assign({}, state, { EmployeeAbsenceHistory: action.payload });
            }
        default:
            return state;
    }
}

// Start of selectors
export function employeeConfigurationData(state$: Observable<HolidayAbsenceState>): Observable<EmployeeConfig> {
    return state$.select(state => state && state.EmployeeConfiguration);
}

export function employeeHolidayWorkingProfile(state$: Observable<HolidayAbsenceState>): Observable<EmployeeHolidayWorkingProfile> {
    return state$.select(s => s.EmployeeHolidayWorkingProfile);
}

export function fiscalYearSummary(state$: Observable<HolidayAbsenceState>): Observable<FiscalYearSummary> {
    return state$.select(s => s.FiscalYearSummary);
}

export function fiscalYearSummaryForChart(state$: Observable<HolidayAbsenceState>): Observable<FiscalYearSummary> {
    return state$.select(s => s.FiscalYearSummaryForChart);
}

export function employeeAbsenceData(state$: Observable<HolidayAbsenceState>): Observable<MyAbsence> {
    return state$.select(s => s.EmployeeAbsence);
}

export function employeeAbsenceAddStatus(state$: Observable<HolidayAbsenceState>): Observable<boolean> {
    return state$.select(s => s.IsEmployeeAbsenceAdded);
}

export function employeeAbsenceUpdateStatus(state$: Observable<HolidayAbsenceState>): Observable<boolean> {
    return state$.select(state => state.IsEmployeeAbsenceUpdated);
}

export function employeeAbsenceHistoryData(state$: Observable<HolidayAbsenceState>): Observable<Immutable.List<MyAbsenceHistory>> {
    return state$.select(s => s.EmployeeAbsenceHistory);
}

export function holidayAbsenceState(state$: Observable<HolidayAbsenceState>): Observable<HolidayAbsenceState> {
    return state$.select(s => s);
}

export function employeeAbsencesList(state$: Observable<HolidayAbsenceState>): Observable<Immutable.List<MyAbsence>> {
    return state$.select(state => state && state.EmployeeAbsencesList);
}

export function employeeAbsencesTotalCount(state$: Observable<HolidayAbsenceState>): Observable<number> {
    return state$.select(state => state.EmployeeAbsencesPagingInfo && state.EmployeeAbsencesPagingInfo.TotalCount);
}

export function employeeAbsencesDataTAbleOption(state$: Observable<HolidayAbsenceState>): Observable<DataTableOptions> {
    return state$.select(state => state.EmployeeAbsencesPagingInfo && state.EmployeeAbsencesSortInfo && extractDataTableOptions(state.EmployeeAbsencesPagingInfo, state.EmployeeAbsencesSortInfo));
}

export function getAbsencesFilters(state$: Observable<HolidayAbsenceState>): Observable<Map<string, string>> {
    return state$.select(state => state && state.Filters);
}

export function getAbsencesDelegateInfo(state$: Observable<HolidayAbsenceState>): Observable<MyDelegateInfo[]> {
    return state$.select(state => state && state.EmployeeDelegateInfo);
}

export function currentSelectedAbsence(state$: Observable<HolidayAbsenceState>): Observable<MyAbsence> {
    return state$.select(state => state && state.EmployeeAbsence);
}

export function employeeAbsencesListLoadStatus(state$: Observable<HolidayAbsenceState>): Observable<boolean> {
    return state$.select(state => state && state.IsEmployeeAbsenceListLoading);
}
export function getLoadingStatus(state$: Observable<HolidayAbsenceState>): Observable<boolean> {
    return state$.select(state => state.Loading);
}
// Emd of selectors
