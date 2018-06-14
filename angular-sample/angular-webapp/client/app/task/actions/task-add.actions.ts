// import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { TasksView } from '../models/task';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';

import { AssignUser } from '../models/assign-user';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';

export const ActionTypes = {
    LOAD_ADD_TASK_FORM: type('[TasksForm] Load task list'),
    SAVE_TASK: type('[TasksView] saved'),
    SAVE_TASK_COMPLETED: type('[TasksView] saved completed'),
    SEND_TASK_TO_ASSIGN: type('[any] request to assign'),
    ASSIGN_TASK_TO_ME_COMPLETED: type('[any] assign task to me completed'),
    LOAD_ASSIGN_USERS: type('[AssignUser] Load assign users'),
    LOAD_ASSIGN_USERS_COMPLETE: type('[AssignUser] Load assign users complete'),
}

export class LoadAddTaskFormAction implements Action {
    type = ActionTypes.LOAD_ADD_TASK_FORM;
    constructor(public payload: boolean) {

    }
}

export class SaveTaskAction implements Action {
    type = ActionTypes.SAVE_TASK;
    constructor(public payload: TasksView) {

    }
}

export class SaveTaskCompletedAction implements Action {
    type = ActionTypes.SAVE_TASK_COMPLETED;
    constructor(public payload: TasksView) {

    }
}

//assign user list data fetch
export class LoadAssignUsers implements Action {
    type = ActionTypes.LOAD_ASSIGN_USERS;
    constructor(public payload: boolean) {

    }
}
export class LoadAssignUserComplete implements Action {
    type = ActionTypes.LOAD_ASSIGN_USERS_COMPLETE;
    constructor(public payload: Array<AssignUser>) {

    }
}


export type Actions = LoadAddTaskFormAction | SaveTaskAction | SaveTaskCompletedAction |  LoadAssignUsers | LoadAssignUserComplete;