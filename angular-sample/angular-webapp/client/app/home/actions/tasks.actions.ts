import { TasksInfo } from '../models/tasks-info';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';

export const ActionTypes = {
    LOAD_TASKTYPE: type('[TasksInfo] Load tasks info'),
    LOAD_TASKTYPE_COMPLETE: type('[TasksInfo] Load tasks info complete')
}

export class LoadTasksInfoAction implements Action {
    type = ActionTypes.LOAD_TASKTYPE;
    constructor(public payload: boolean) {

    }
}

export class LoadTasksInfoCompleteAction implements Action {
    type = ActionTypes.LOAD_TASKTYPE_COMPLETE;
    constructor(public payload: TasksInfo[]) {
    }
}

export type Actions = LoadTasksInfoCompleteAction | LoadTasksInfoAction;