import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import * as incidentLogActions from '../actions/incident-log.actions';
import * as Immutable from 'immutable';
import { IncidentListModel } from '../models/incident-list-model';
import { isNullOrUndefined } from 'util';
import { extractDataTableOptions } from "./../../shared/helpers/extract-helpers";
import { DataTableOptions } from "./../../atlas-elements/common/models/ae-datatable-options";
import { PagingInfo } from "./../../atlas-elements/common/models/ae-paging-info";

export interface IncidentLogState {
    StatsLoaded: boolean;
    IncidentLogStats: AeInformationBarItem[];
    IncidentsLoaded: boolean;
    Incidents: Immutable.List<IncidentListModel>;
    Filters: Map<string, string>;
    PagingInfo: Map<string, string>;
    SortingInfo: Map<string, string>;
    IncidentLogStatFilters: Map<string, string>;
}

const initialState: IncidentLogState = {
    StatsLoaded: null,
    IncidentLogStats: [],
    IncidentsLoaded: null,
    Incidents: null,
    Filters: null,
    PagingInfo: null,
    SortingInfo: null,
    IncidentLogStatFilters: null
};


export function incidentLogReducer(state = initialState, action: Action): IncidentLogState {
    switch (action.type) {
        case incidentLogActions.ActionTypes.LOAD_INCIDENT_LOG_STATS:
            {
                return Object.assign({}, state, { StatsLoaded: false });
            }
        case incidentLogActions.ActionTypes.LOAD_INCIDENT_LOG_STATS_COMPLETE:
            {
                return Object.assign({}, state, { StatsLoaded: true, IncidentLogStats: action.payload });
            }
        case incidentLogActions.ActionTypes.LOAD_INCIDENTS:
            {
                return Object.assign({}, state, { IncidentsLoaded: true });
            }
        case incidentLogActions.ActionTypes.LOAD_INCIDENTS_COMPLETE:
            {
                return Object.assign({}, state, {
                    IncidentsLoaded: false,
                    Incidents: action.payload.Incidents,
                    PagingInfo: action.payload.IncidentPagingInfo
                });
            }
        case incidentLogActions.ActionTypes.LOAD_INCIDENT_LOG_FILTERS:
            {
                return Object.assign({}, state, {
                    Filters: action.payload.Filters,
                    PagingInfo: action.payload.PagingInfo,
                    SortingInfo: action.payload.SortingInfo
                });
            }
        case incidentLogActions.ActionTypes.LOAD_INCIDENT_LOG_FILTERS:
            {
                return Object.assign({}, state, {
                    Filters: action.payload.Filters,
                    PagingInfo: action.payload.PagingInfo,
                    SortingInfo: action.payload.SortingInfo
                });
            }
        case incidentLogActions.ActionTypes.LOAD_INCIDENT_LOG_STATS_FILTERS:
            {
                return Object.assign({}, state, {
                    IncidentLogStatFilters: action.payload
                });
            }
        default:
            return state;
    }
}

// Start of selectors

export function incidentLogStatsData(state$: Observable<IncidentLogState>): Observable<AeInformationBarItem[]> {
    return state$.select(s => s.IncidentLogStats);
}

export function incidentLogStatsLoadStatus(state$: Observable<IncidentLogState>): Observable<boolean> {
    return state$.select(s => s.StatsLoaded);
}

export function incidentsData(state$: Observable<IncidentLogState>): Observable<Immutable.List<IncidentListModel>> {
    return state$.select(s => s.Incidents);
}

export function incidentsDataTableOptions(state$: Observable<IncidentLogState>): Observable<DataTableOptions> {
    return state$.select(state => state.PagingInfo && extractDataTableOptions(new PagingInfo(
        parseInt(state.PagingInfo.get('pageSize'), 10),
        parseInt(state.PagingInfo.get('TotalCount'), 10),
        parseInt(state.PagingInfo.get('pageNumber'), 10),
        parseInt(state.PagingInfo.get('pageSize'), 10))));
}
export function incidentsLoad(state$: Observable<IncidentLogState>): Observable<boolean> {
    return state$.select(s => s.IncidentsLoaded);
}

export function incidentLogFilters(state$: Observable<IncidentLogState>): Observable<Map<string, string>> {
    return state$.select(s => s.Filters);
}

export function incidentLogStatsFilters(state$: Observable<IncidentLogState>): Observable<Map<string, string>> {
    return state$.select(s => s.IncidentLogStatFilters);
}

export function incidentLogPaging(state$: Observable<IncidentLogState>): Observable<Map<string, string>> {
    return state$.select(s => s.PagingInfo);
}

export function incidentLogSorting(state$: Observable<IncidentLogState>): Observable<Map<string, string>> {
    return state$.select(s => s.SortingInfo);
}

export function incidentsTotalCount(state$: Observable<IncidentLogState>): Observable<number> {
    return state$.filter(state => !isNullOrUndefined(state.PagingInfo))
        .select(state => parseInt(state.PagingInfo.get('TotalCount'), 10));
}
