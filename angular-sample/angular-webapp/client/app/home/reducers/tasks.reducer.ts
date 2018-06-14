import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import { TasksInfo } from '../models/tasks-info';
import * as taskActions from '../actions/tasks.actions';

export interface TasksInfoState {
    loading: boolean,
    loaded: boolean,
    entities: TasksInfo[]
}

const initialState = {
    loading: false,
    loaded: false,
    entities: []
}

export function reducer(state = initialState, action: Action): TasksInfoState {
    switch (action.type) {
        case taskActions.ActionTypes.LOAD_TASKTYPE:
            {
                return Object.assign({}, state, { loading: true });
            }
        case taskActions.ActionTypes.LOAD_TASKTYPE_COMPLETE:
            {
                return Object.assign({}, state, { loaded: true, loading: false, entities: action.payload });
            }
        default:
            return state;
    }
}

export function getTasksInfoData(state$: Observable<TasksInfoState>): Observable<TasksInfoState> {
    return state$.select(s => s);
}