import { TasksView } from '../models/task';
import { AssignUser } from '../models/assign-user';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as taskAddActions from '../actions/task-add.actions';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';

export interface TaskAddState {
    status: boolean,
    entities: TasksView,
    AssignUserState: AssignUserState;
}

export interface AssignUserState {
    loadingAssignUsers: boolean;
    loadedAssignUsers: boolean;
    AssignUsers: Array<AssignUser>
}

const initialState = {
    status: false,
    entities: null,
    AssignUserState: {
        loadingAssignUsers: false,
        loadedAssignUsers: false,
        AssignUsers: null
    }
}

export function reducer(state = initialState, action: Action): TaskAddState {
    switch (action.type) {
        case taskAddActions.ActionTypes.LOAD_ADD_TASK_FORM:
            {
                return Object.assign({}, state, { status: false });
            }
        case taskAddActions.ActionTypes.SAVE_TASK:
            {
                return Object.assign({}, state, { status: true, entities: action.payload });
            }
        case taskAddActions.ActionTypes.LOAD_ASSIGN_USERS: {
            return Object.assign({}, state, { AssignUserState: Object.assign({}, state.AssignUserState, { loadingAssignUsers: true }) });
        }

        case taskAddActions.ActionTypes.LOAD_ASSIGN_USERS_COMPLETE: {
            return Object.assign({}, state, { AssignUserState: Object.assign({}, state.AssignUserState, { loadingAssignUsers: false, loadedAssignUsers: true, AssignUsers: action.payload }) });
        }
        default:
            return state;
    }
}

export function addTasks(state$: Observable<TaskAddState>): Observable<TasksView> {
    return state$.select(s => s.entities);
}

export function loadAddTaskForm(state$: Observable<TaskAddState>): Observable<boolean> {
    return state$.select(s => s.status);
}


export function getAssignUsers(state$: Observable<TaskAddState>): Observable<AssignUser[]> {
    return state$.select(s => s && s.AssignUserState && s.AssignUserState.AssignUsers);
}