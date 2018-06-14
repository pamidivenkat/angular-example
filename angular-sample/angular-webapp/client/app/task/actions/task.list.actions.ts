import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { AeSortModel } from '../../atlas-elements/common/models/ae-sort-model';
import { TaskCategory } from '../models/task-categoy';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';
import { TasksView } from '../models/task';
import * as Immutable from 'immutable';

export const ActionTypes = {
    LOAD_TASKS: type('[TasksView] Load task list'),
    LOAD_TASKS_COMPLETE: type('[TasksView] Load task list complete'),
    LOAD_SELECTED_TASK: type('[Task] Load selected Task'),
    LOAD_SELECTED_TASK_COMPLETE: type('[Task] Load selected task complete'),
    CHANGE_TASK_STATUS: type('[Task] change task status'),
    CHANGE_TASK_STATUS_COMPLETE: type('[Task] change task status complete'),
    REMOVE_TASK: type('[Task] remove task'),
    LOAD_TASKS_ON_PAGE_CHANGE: type('[TasksView] Load task list on page change'),
    LOAD_TASKS_ON_FILTER_CHANGE: type('[TasksView] Load task list on filter change'),
    SET_DEFAULT_FILTERS: type('[TasksView] Set default filters'),
    LOAD_TASK_CATEGORIES: type('[TasksView] Load task categories'),
    LOAD_TASK_CATEGORIES_COMPLETE: type('[TasksView] Load task categories complete'),
    LOAD_TASKS_ON_SORT: type('[TasksView] Load task categories on sort')
};

export class LoadTasksAction implements Action {
    type = ActionTypes.LOAD_TASKS;
    constructor(public payload: boolean) {

    }
}

export class LoadTasksCompleteAction implements Action {
    type = ActionTypes.LOAD_TASKS_COMPLETE;
    constructor(public payload: any) {
    }
}

export class LoadSelectedTaskAction implements Action {
    type = ActionTypes.LOAD_SELECTED_TASK;
    constructor(public payload: string) {

    }
}

export class LoadSelectedTaskCompleteAction implements Action {
    type = ActionTypes.LOAD_SELECTED_TASK_COMPLETE;
    constructor(public payload: TasksView) {
    }
}

export class ChangeTaskAction implements Action {
    type = ActionTypes.CHANGE_TASK_STATUS;
    constructor(public payload: TasksView) {
    }
}

export class ChangeTaskCompleteAction implements Action {
    type = ActionTypes.CHANGE_TASK_STATUS_COMPLETE;
    constructor(public payload: TasksView) {
    }
}

export class RemoveTaskAction implements Action {
    type = ActionTypes.REMOVE_TASK;
    constructor(public payload: TasksView) {
    }
}

export class LoadTasksOnPageChangeAction implements Action {
    type = ActionTypes.LOAD_TASKS_ON_PAGE_CHANGE;
    constructor(public payload: { pageNumber: number, noOfRows: number }) {

    }
}

export class LoadTasksOnFilterChangeAction implements Action {
    type = ActionTypes.LOAD_TASKS_ON_FILTER_CHANGE;
    constructor(public payload: Map<string, string>) {

    }
}

export class SetDefaultFiltersAction implements Action {
    type = ActionTypes.SET_DEFAULT_FILTERS;
    constructor(public payload: Map<string, string>) {

    }
}


export class LoadTaskCategories implements Action {
    type = ActionTypes.LOAD_TASK_CATEGORIES;
    constructor(public payload: boolean) {

    }
}
export class LoadTaskCategoriesComplete implements Action {
    type = ActionTypes.LOAD_TASK_CATEGORIES_COMPLETE;
    constructor(public payload: TaskCategory[]) {

    }
}

export class LoadTasksOnSortAction implements Action {
    type = ActionTypes.LOAD_TASKS_ON_SORT;
    constructor(public payload: AeSortModel) {

    }
}




// tslint:disable-next-line:eofline
export type Actions = LoadTasksAction | LoadTasksCompleteAction | LoadSelectedTaskAction | LoadSelectedTaskCompleteAction | LoadTasksOnPageChangeAction | LoadTasksOnFilterChangeAction | SetDefaultFiltersAction | LoadTaskCategories | LoadTaskCategoriesComplete | LoadTasksOnSortAction | ChangeTaskAction | ChangeTaskCompleteAction;



