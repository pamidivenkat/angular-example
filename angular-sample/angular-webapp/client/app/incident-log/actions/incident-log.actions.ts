import { type } from '../../shared/util';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import * as Immutable from 'immutable';
import { IncidentListModel } from '../models/incident-list-model';
import { IncidentStatus } from '../models/incident-status.enum';

export const ActionTypes = {
    LOAD_INCIDENT_LOG_STATS: type('[INCIDENT_LOG] Load incident log stats'),
    LOAD_INCIDENT_LOG_STATS_COMPLETE: type('[INCIDENT_LOG] Load incident log stats complete'),
    LOAD_INCIDENTS: type('[INCIDENT_LOG] Load incidents'),
    LOAD_INCIDENTS_COMPLETE: type('[INCIDENT_LOG] Load incidents complete'),
    LOAD_INCIDENT_LOG_FILTERS: type('[INCIDENT_LOG] Load incident log filters'),
    LOAD_INCIDENT_LOG_STATS_FILTERS: type('[INCIDENT_LOG] Load incident log stats filters')
};

/**
* This action is to load the incident log stats
*/
export class LoadIncidentLogStatsAction {
    type = ActionTypes.LOAD_INCIDENT_LOG_STATS;
    constructor(public payload: boolean) {
    }
}

export class LoadIncidentLogStatsCompleteAction {
    type = ActionTypes.LOAD_INCIDENT_LOG_STATS_COMPLETE;
    constructor(public payload: AeInformationBarItem[]) {
    }
}

export class LoadIncidentsAction {
    type = ActionTypes.LOAD_INCIDENTS;
    constructor(public payload: any) {
    }
}

export class LoadIncidentsCompleteAction {
    type = ActionTypes.LOAD_INCIDENTS_COMPLETE;
    constructor(public payload: any) {
    }
}

export class LoadIncidentLogFiltersAction {
    type = ActionTypes.LOAD_INCIDENT_LOG_FILTERS;
    constructor(public payload: any) {
    }
}

export class LoadIncidentLogStatsFiltersAction {
    type = ActionTypes.LOAD_INCIDENT_LOG_STATS_FILTERS;
    constructor(public payload: Map<string, string>) {
    }
}

export type Actions = LoadIncidentLogStatsAction | LoadIncidentLogStatsCompleteAction |
    LoadIncidentsAction | LoadIncidentsCompleteAction | LoadIncidentLogFiltersAction |
    LoadIncidentLogStatsFiltersAction;
