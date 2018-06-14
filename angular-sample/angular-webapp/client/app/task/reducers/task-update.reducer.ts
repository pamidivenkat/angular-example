import { TasksView } from '../models/task';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as taskUpdateActions from '../actions/task-update.actions';

export interface TaskUpdateState {
    taskToUpdate: TasksView;
    updating: boolean;
    updated: boolean;
}

const initialState = {
    taskToUpdate: null,
    updating: false,
    updated: false
}

export function reducer(state = initialState, action: Action): TaskUpdateState {
    switch (action.type) {
        case taskUpdateActions.ActionTypes.UPDATE_TASK:
            {
                return Object.assign({}, state, { updating: true, taskToUpdate: action.payload });
            }
        case taskUpdateActions.ActionTypes.UPDATE_TASK_COMPLETED:
            {
                return Object.assign({}, state, { updated: true });
            }

        default:
            return state;
    }
}
