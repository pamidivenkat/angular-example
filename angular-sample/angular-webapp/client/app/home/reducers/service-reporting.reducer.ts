import { StatisticsInformation } from '../models/statistics-information';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import * as serviceReportActions from '../actions/service-reporting.actions';
import * as Immutable from 'immutable';

export interface ServiceReportInformationState {
    loading: boolean,
    serviceReportInformation: Immutable.List<StatisticsInformation<string>>
}

const initialInfoBarState: ServiceReportInformationState = {
    loading: false,
    serviceReportInformation: null
}

export function reducer(state = initialInfoBarState, action: Action): ServiceReportInformationState {
    switch (action.type) {
        case serviceReportActions.ActionTypes.LOAD_SERVICE_REPORTING:
            {
                return Object.assign({}, state, { loading: true });
            }
        case serviceReportActions.ActionTypes.LOAD_SERVICE_REPORTING_COMPLETE:
            {
                let newState = Object.assign({}, state, { loading: false, serviceReportInformation: action.payload });
                return newState;
            }
        default:
            return state;
    }
}

export function getServiceReportInformation(state$: Observable<ServiceReportInformationState>): Observable<Immutable.List<StatisticsInformation<string>>> {
    return state$.select(state => state && state.serviceReportInformation);
}

export function getServiceReportInformationLoading(state$: Observable<ServiceReportInformationState>): Observable<boolean> {
    return state$.select(state => state && state.loading);
}