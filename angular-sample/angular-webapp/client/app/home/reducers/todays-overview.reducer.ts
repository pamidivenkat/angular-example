import { StatisticsInformation } from '../models/statistics-information';
import { TodaysOverviewLoadCompleteAction } from '../actions/todays-overview.actions';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as toActions from '../actions/todays-overview.actions';
import * as Immutable from 'immutable';

export interface TodaysOverviewState<T> {
    loading: boolean,
    loaded: boolean,
    entities: Immutable.List<StatisticsInformation<T>>
}

const initialState: TodaysOverviewState<string> = {
    loading: true,
    loaded: false,
    entities: null
}

export function reducer(state: TodaysOverviewState<string> = initialState, action: Action): TodaysOverviewState<string> {
    switch (action.type) {
        case toActions.ActionTypes.TODAYS_OVERVIEW_LOAD:
            {
                return Object.assign({}, state, { loading: true });
            }
        case toActions.ActionTypes.TODAYS_OVERVIEW_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { loaded: true, loading: false, entities: (<TodaysOverviewLoadCompleteAction>action).payload });
            }
        default:
            return state;
    }
}

export function getTodaysOverviewData(state$: Observable<TodaysOverviewState<string>>): Observable<Immutable.List<StatisticsInformation<string>>> {
    return state$.select(s => s.entities);
}

export function getTodaysOverviewLoadingState(state$: Observable<TodaysOverviewState<string>>): Observable<boolean> {
    return state$.select(s => s.loading);
}