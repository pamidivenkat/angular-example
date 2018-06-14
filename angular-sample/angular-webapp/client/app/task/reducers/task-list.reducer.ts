import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { extractDataTableOptions } from '../../shared/helpers/extract-helpers';
import { isNullOrUndefined } from 'util';
import { extractTaskCategorySelectItems } from '../common/task-extract-helper';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { AeSortModel } from '../../atlas-elements/common/models/ae-sort-model';
import { LoadTaskCategories } from '../actions/task.list.actions';
import { TaskCategory } from '../models/task-categoy';
import { filterStackTrace } from 'protractor/built/util';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { DataTableOptions } from '../../atlas-elements/common/models/ae-datatable-options';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import { TasksView } from '../models/task';
import * as taskListActions from '../actions/task.list.actions';
import * as Immutable from 'immutable';

export interface TasksListState {
    loading: boolean;
    loaded: boolean;
    isTaskListLoading: boolean;
    data: TasksView[];
    selectedTask: TasksView;
    filters: Map<string, string>;
    pagingInfo: PagingInfo;
    TaskCategoryState: TaskCategoryState;
    sortInfo: AeSortModel;
}

export interface TaskCategoryState {
    loadingTaskCategories: boolean;
    loadedTaskCategories: boolean;
    TaskCategories: TaskCategory[];
}

const initialState = {
    loading: false,
    loaded: false,
    isTaskListLoading: false,
    data: null,
    selectedTask: null,
    filters: null,
    pagingInfo: null,
    TaskCategoryState: {
        loadingTaskCategories: false,
        loadedTaskCategories: false, TaskCategories: null
    },
    sortInfo: null
}

export function reducer(state = initialState, action: Action): TasksListState {
    switch (action.type) {
        case taskListActions.ActionTypes.LOAD_TASKS:
            {
                return Object.assign({}, state, { loading: true, isTaskListLoading: true });
            }
        case taskListActions.ActionTypes.LOAD_TASKS_COMPLETE:
            {
                if (!isNullOrUndefined(state.pagingInfo)) {
                    if (action.payload.pagingInfo.PageNumber == 1) {
                        state.pagingInfo.TotalCount = action.payload.pagingInfo.TotalCount;
                    }
                    state.pagingInfo.PageNumber = action.payload.pagingInfo.PageNumber;
                    state.pagingInfo.Count = action.payload.pagingInfo.Count;
                }
                else {
                    state.pagingInfo = action.payload.pagingInfo;
                }
                if (isNullOrUndefined(state.sortInfo)) {
                    state.sortInfo = <AeSortModel>{};
                    state.sortInfo.SortField = 'DueDate';
                    state.sortInfo.Direction = 1;
                }
                let modifiedState = Object.assign({}, state, { loaded: true, loading: false, data: action.payload.tasksList, isTaskListLoading: false });
                return modifiedState;
            }
        case taskListActions.ActionTypes.LOAD_SELECTED_TASK:
            {
                return Object.assign({}, state, { loading: true, isTaskListLoading: false });
            }
        case taskListActions.ActionTypes.LOAD_SELECTED_TASK_COMPLETE:
            {
                return Object.assign({}, state, { loaded: true, loading: false, selectedTask: action.payload });
            }
        case taskListActions.ActionTypes.CHANGE_TASK_STATUS:
            {
                return Object.assign({}, state, { loading: false, isTaskListLoading: true });
            }
        case taskListActions.ActionTypes.CHANGE_TASK_STATUS_COMPLETE:
            {
                return Object.assign({}, state, { loading: true });
            }
        case taskListActions.ActionTypes.REMOVE_TASK:
            {
                return Object.assign({}, state, { loaded: true, loading: false, isTaskListLoading: true });
            }
        case taskListActions.ActionTypes.LOAD_TASKS_ON_PAGE_CHANGE: {
            return Object.assign({}, state, { isTaskListLoading: true, loading: true, pagingInfo: Object.assign({}, state.pagingInfo, { PageNumber: action.payload.pageNumber, Count: action.payload.noOfRows }) });
        }
        case taskListActions.ActionTypes.LOAD_TASKS_ON_FILTER_CHANGE: {
            return Object.assign({}, state, { isTaskListLoading: true, loading: true, filters: action.payload, pagingInfo: Object.assign({}, state.pagingInfo, { PageNumber: 1, Count: 10 }) });
        }

        case taskListActions.ActionTypes.LOAD_TASK_CATEGORIES: {
            return Object.assign({}, state, { TaskCategoryState: Object.assign({}, state.TaskCategoryState, { loadingTaskCategories: true }) });
        }

        case taskListActions.ActionTypes.LOAD_TASK_CATEGORIES_COMPLETE: {
            return Object.assign({}, state, { TaskCategoryState: Object.assign({}, state.TaskCategoryState, { loadingTaskCategories: false, loadedTaskCategories: true, TaskCategories: action.payload }) });
        }

        case taskListActions.ActionTypes.LOAD_TASKS_ON_SORT: {
            return Object.assign({}, state, { isTaskListLoading: true, loading: true, sortInfo: Object.assign({}, state.sortInfo, { SortField: action.payload.SortField, Direction: action.payload.Direction }) });
        }
        case taskListActions.ActionTypes.SET_DEFAULT_FILTERS: {
            return Object.assign({}, state, { filters: action.payload });
        }

        default:
            return state;
    }
}

export function getTasksListData(state$: Observable<TasksListState>): Observable<Immutable.List<TasksView>> {
    return state$.select(state => state && Immutable.List(state.data));
};

export function getTasksListTotalCount(state$: Observable<TasksListState>): Observable<number> {
    return state$.select(state => state && state.pagingInfo && state.pagingInfo.TotalCount);
}

export function getTasksListDataTableOptions(state$: Observable<TasksListState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.pagingInfo && state.sortInfo && extractDataTableOptions(state.pagingInfo, state.sortInfo));
}

export function getTasksListDataLoading(state$: Observable<TasksListState>): Observable<boolean> {
    return state$.select(s => s && s.isTaskListLoading);
};

export function getSelectedTaskData(state$: Observable<TasksListState>): Observable<TasksView> {
    return state$.select(s => s && s.selectedTask);
};


export function getTaskCategories(state$: Observable<TasksListState>): Observable<TaskCategory[]> {
    return state$.select(s => s && s.TaskCategoryState.TaskCategories);
}

export function getTaskCategorySelectItems(state$: Observable<TasksListState>): Observable<AeSelectItem<string>[]> {
    return state$.select(s => s && s.TaskCategoryState && extractTaskCategorySelectItems(s.TaskCategoryState.TaskCategories));
}