import { MyTrainingState } from './my-training-reducer';
import { MyTraining } from './../models/my-training';
import { AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as toActions from '../actions/my-training-actions';

export interface MyTrainingState {
    isFirstTimeLoad: boolean
    loading: boolean,
    loaded: boolean,
    data: AtlasApiResponse<MyTraining>,
    myTeamTrainingTasksExist: boolean
}

const initialState: MyTrainingState = {
    isFirstTimeLoad: true,
    loading: false,
    loaded: false,
    data: new AtlasApiResponse<MyTraining>(),
    myTeamTrainingTasksExist: null
}

export function reducer(state: MyTrainingState = initialState, action: Action): MyTrainingState {
    switch (action.type) {

        case toActions.ActionTypes.MY_TRAINING_LOAD:
            {
                return Object.assign({}, state, { loading: true });
            }
        case toActions.ActionTypes.MY_TRAINING_LOAD_COMPLETE:
            {
                let newState = Object.assign({}, state, { loaded: true, isFirstTimeLoad: false, loading: false, data: action.payload });
                return newState;
            }
        case toActions.ActionTypes.MY_TEAM_TASKS_COUNT:
            {
                return Object.assign({}, state, {});
            }
        case toActions.ActionTypes.MY_TEAM_TASKS_COUNT_COMPLETE:
            {
                return Object.assign({}, state, { myTeamTrainingTasksExist: action.payload });
            }
        default:
            return state;
    }
}

export function getMyTrainingsData(state$: Observable<MyTrainingState>): Observable<AtlasApiResponse<MyTraining>> {
    return state$.select(s => s.data);
}

export function getMyTrainingsLoadingData(state$: Observable<MyTrainingState>): Observable<boolean> {
    return state$.select(s => s.loading);
}

export function getMyTrainingsIsFirstTimeLoadDta(state$: Observable<MyTrainingState>): Observable<boolean> {
    return state$.select(s => s.isFirstTimeLoad);
}

export function checkMyTeamTrainingTasksExists(state$: Observable<MyTrainingState>): Observable<boolean> {
    return state$.select(state => state.myTeamTrainingTasksExist);
}