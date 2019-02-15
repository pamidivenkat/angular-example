import { ActionReducer, ActionReducerMap, createFeatureSelector, } from '@ngrx/store';
import * as fromConfig from './config.reducer';


export interface State {
    config: fromConfig.State;
}

export const reducers: ActionReducerMap<State> = {
    config: fromConfig.reducer
};

export function logger(reducer: ActionReducer<State>): ActionReducer<State> {
    return function(state: State, action: any): State {
        console.log('state', state);
        console.log('action', action);
        return reducer(state, action);
    };
}

export const getConfigState = createFeatureSelector<State, fromConfig.State>(
    'config'
);