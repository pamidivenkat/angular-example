import { StatisticsInformation } from '../models/statistics-information';
import { type } from '../../shared/util';
import { Action } from '@ngrx/store';
import * as Immutable from 'immutable';

export const ActionTypes = {
    TODAYS_OVERVIEW_LOAD: type('[Todays Overview] Load todays overview'),
    TODAYS_OVERVIEW_LOAD_COMPLETE: type('[Todays Overview] Load todays overview complete')
}

export class TodaysOverviewLoadAction implements Action {
    type = ActionTypes.TODAYS_OVERVIEW_LOAD;
    constructor(public payload: any) {

    }
}

export class TodaysOverviewLoadCompleteAction implements Action {
    type = ActionTypes.TODAYS_OVERVIEW_LOAD_COMPLETE;
    constructor(public payload: Immutable.List<StatisticsInformation<string>>) {

    }
}

export type Actions = TodaysOverviewLoadCompleteAction | TodaysOverviewLoadAction;