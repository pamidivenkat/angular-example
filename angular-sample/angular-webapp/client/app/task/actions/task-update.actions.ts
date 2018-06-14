// import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { TasksView } from '../models/task';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';

export const ActionTypes = {
    UPDATE_TASK: type('[TasksView] update form to save'),
    UPDATE_TASK_COMPLETED: type('[TasksView] updated completed'),
}
export class UpdateTaskAction implements Action {
    type = ActionTypes.UPDATE_TASK;
    constructor(public payload: TasksView) {

    }
}
export class UpdateTaskCompletedAction implements Action {
    type = ActionTypes.UPDATE_TASK_COMPLETED;
    constructor(public payload: any) {

    }
}



export type Actions = UpdateTaskAction | UpdateTaskCompletedAction;