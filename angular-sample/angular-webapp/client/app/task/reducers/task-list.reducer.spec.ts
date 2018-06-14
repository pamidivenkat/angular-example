import { Store } from '@ngrx/store';
import * as Immutable from 'immutable';

import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { extractPagingInfo } from '../../employee/common/extract-helpers';
import { extractDataTableOptions } from '../../shared/helpers/extract-helpers';
import { MockStoreProviderFactory } from '../../shared/testing/mocks/mock-store-provider-factory';
import { MockStoreProviderTask } from '../../shared/testing/mocks/mock-store-provider-task';
import { extractTaskCategorySelectItems, extractTasksList } from '../common/task-extract-helper';
import { TaskStatus } from '../models/task-status';
import { TaskViewType } from '../models/task-view-type';
import * as fromRoot from './../../shared/reducers/index';
import { TasksListState } from './task-list.reducer';
import { reducer } from './task-list.reducer';

describe('task list reducer', () => {
    let initialState: TasksListState;
    let store: Store<fromRoot.State>;
    let modifiedState: TasksListState;
    let initialWholeState: fromRoot.State;

    beforeEach(() => {
        initialState = {
            loading: false,
            loaded: false,
            isTaskListLoading: false,
            data: null,
            selectedTask: null,
            filters: null,
            pagingInfo: null,
            TaskCategoryState: {
                loadingTaskCategories: false,
                loadedTaskCategories: false,
                TaskCategories: null
            },
            sortInfo: null
        };
    });

    it('should return the default state', () => {
        const action = {} as any;
        const result = reducer(initialState, action);
        expect(result).toEqual(initialState);
    });

    it('should return current state when no valid actions have been made', () => {
        const actual = reducer(initialState, { type: 'INVALID_ACTION', payload: {} });
        const expected = initialState;
        expect(actual).toBe(expected);
    });

    it('should dispatch LOAD_TASKS action to load the tasks', () => {
        const actual = reducer(initialState, { type: '[TasksView] Load task list', payload: true });
        expect(actual.loading).toBe(true);
        expect(actual.isTaskListLoading).toBe(true);
    });

    it('should dispatch LOAD_TASKS_COMPLETE action after loading the tasks', () => {
        let list = MockStoreProviderTask.getTaskListStub();
        const actual = reducer(initialState, { type: '[TasksView] Load task list complete', payload: { tasksList: extractTasksList(list), pagingInfo: extractPagingInfo(list) } });
        expect(actual.loaded).toBe(true);
        expect(actual.loading).toBe(false);
        expect(actual.pagingInfo.Count).toEqual(10);
        expect(actual.pagingInfo.PageNumber).toEqual(1);
        expect(actual.pagingInfo.TotalCount).toEqual(2802);
        expect(actual.data).toEqual(extractTasksList(list));
        expect(actual.isTaskListLoading).toBe(false);
        expect(actual.sortInfo.SortField).toEqual('DueDate');
        expect(actual.sortInfo.Direction).toEqual(SortDirection.Descending);
    });

    it('should dispatch LOAD_SELECTED_TASK to load selected task details', () => {
        const actual = reducer(initialState, { type: '[Task] Load selected Task', payload: '1234' });
        expect(actual.loading).toBe(true);
        expect(actual.isTaskListLoading).toBe(false);
    });

    it('should dispatch LOAD_SELECTED_TASK_COMPLETE to load selected task details', () => {
        const actual = reducer(initialState, { type: '[Task] Load selected task complete', payload: MockStoreProviderTask.getTaskDetailsStub() });
        expect(actual.loaded).toBe(true);
        expect(actual.loading).toBe(false);
        expect(actual.selectedTask).toEqual(MockStoreProviderTask.getTaskDetailsStub());
    });

    it('should dispatch CHANGE_TASK_STATUS to change selected task status', () => {
        const actual = reducer(initialState, { type: '[Task] change task status', payload: MockStoreProviderTask.getTaskDetailsStub() });
        expect(actual.loading).toBe(false);
        expect(actual.isTaskListLoading).toBe(true);
    });

    it('should dispatch CHANGE_TASK_STATUS_COMPLETE to change selected task status complete', () => {
        const actual = reducer(initialState, { type: '[Task] change task status complete', payload: MockStoreProviderTask.getTaskDetailsStub() });
        expect(actual.loading).toBe(true);
    });

    it('should dispatch REMOVE_TASK to remove selected task', () => {
        const actual = reducer(initialState, { type: '[Task] remove task', payload: MockStoreProviderTask.getTaskDetailsStub() });
        expect(actual.loaded).toBe(true);
        expect(actual.loading).toBe(false);
        expect(actual.isTaskListLoading).toBe(true);
    });

    it('should dispatch LOAD_TASKS_ON_PAGE_CHANGE to load tasks on page change', () => {
        const actual = reducer(initialState, { type: '[TasksView] Load task list on page change', payload: { pageNumber: 2, noOfRows: 8 } });
        expect(actual.loading).toBe(true);
        expect(actual.isTaskListLoading).toBe(true);
        expect(actual.pagingInfo.Count).toEqual(8);
        expect(actual.pagingInfo.PageNumber).toEqual(2);
    });

    it('should dispatch LOAD_TASKS_ON_FILTER_CHANGE to load tasks on filter change', () => {
        let listFilters = new Map<string, string>();
        listFilters.set('filterTaskView', TaskViewType.MyTasks.toString());
        listFilters.set('filterTaskStatus', TaskStatus.ToDo.toString() + ',' + TaskStatus.InProgress.toString());
        listFilters.set('TaskPriorityFilter', '');
        listFilters.set('filterTasksByDeadLine', '');
        listFilters.set('filterTaskCategory', '3c1ba2c4-a32a-4428-8473-43d8b48a47bd');
        const actual = reducer(initialState, { type: '[TasksView] Load task list on filter change', payload: listFilters });
        expect(actual.loading).toBe(true);
        expect(actual.isTaskListLoading).toBe(true);
        expect(actual.filters).toEqual(listFilters);
        expect(actual.isTaskListLoading).toBe(true);
        expect(actual.pagingInfo.Count).toEqual(10);
        expect(actual.pagingInfo.PageNumber).toEqual(1);
    });

    it('should dispatch SET_DEFAULT_FILTERS to set default filters', () => {
        let listFilters = new Map<string, string>();
        listFilters.set('filterTaskView', TaskViewType.MyTasks.toString());
        listFilters.set('filterTaskStatus', TaskStatus.ToDo.toString() + ',' + TaskStatus.InProgress.toString());

        const actual = reducer(initialState, { type: '[TasksView] Set default filters', payload: listFilters });
        expect(actual.filters).toEqual(listFilters);
    });

    it('should dispatch LOAD_TASK_CATEGORIES to load task categories', () => {
        const actual = reducer(initialState, { type: '[TasksView] Load task categories', payload: true });
        expect(actual.TaskCategoryState.loadingTaskCategories).toBe(true);
    });

    it('should dispatch LOAD_TASK_CATEGORIES_COMPLETE to load task categories complete', () => {
        let categories = MockStoreProviderTask.getTaskCategoriesStub().Entities;
        const actual = reducer(initialState, { type: '[TasksView] Load task categories complete', payload: categories });
        expect(actual.TaskCategoryState.loadingTaskCategories).toBe(false);
        expect(actual.TaskCategoryState.loadedTaskCategories).toBe(true);
        expect(actual.TaskCategoryState.TaskCategories).toEqual(categories)
    });

    it('should dispatch LOAD_TASKS_ON_SORT to load tasks on sort', () => {
        const actual = reducer(initialState, { type: '[TasksView] Load task categories on sort', payload: { SortField: 'Title', Direction: SortDirection.Descending } });
        expect(actual.loading).toBe(true);
        expect(actual.isTaskListLoading).toBe(true);
        expect(actual.sortInfo.SortField).toEqual('Title');
        expect(actual.sortInfo.Direction).toEqual(SortDirection.Descending);
    });

    describe('Functions in the task list reducer', () => {
        beforeEach(() => {
            store = MockStoreProviderFactory.createInitialStore();
            store.subscribe(s => { initialWholeState = s; })
            modifiedState = reducer(initialState, { type: '[TasksView] Load task list', payload: true });
            modifiedState = reducer(initialState, { type: '[Task] Load selected Task', payload: '1234' });
            modifiedState = reducer(initialState, { type: '[TasksView] Load task categories', payload: true });
            let list = MockStoreProviderTask.getTaskListStub();
            modifiedState = reducer(initialState, { type: '[TasksView] Load task list complete', payload: { tasksList: extractTasksList(list), pagingInfo: extractPagingInfo(list) } });
            modifiedState = reducer(initialState, { type: '[Task] Load selected task complete', payload: MockStoreProviderTask.getTaskDetailsStub() });
            modifiedState = reducer(initialState, { type: '[TasksView] Load task categories complete', payload: MockStoreProviderTask.getTaskCategoriesStub().Entities });
            initialWholeState.tasksListState = modifiedState;
        });

        it('function should return list of tasks', () => {
            store.let(fromRoot.getTasksListData).subscribe(taskList => {
                expect(taskList).toEqual(Immutable.List(modifiedState.data));
            });
        });

        it('function should return total count of the task list', () => {
            store.let(fromRoot.getTasksListTotalCount).subscribe(taskList => {
                expect(taskList).toEqual(modifiedState.pagingInfo.TotalCount);
            });
        });

        it('function should return task list table options', () => {
            store.let(fromRoot.getTasksListDataTableOptions).subscribe(taskList => {
                expect(taskList).toEqual(extractDataTableOptions(modifiedState.pagingInfo, modifiedState.sortInfo));
            });
        });

        it('function should return status of loading tasks', () => {
            store.let(fromRoot.getTasksListLoadingData).subscribe(taskList => {
                expect(taskList).toEqual(modifiedState.isTaskListLoading);
            });
        });

        it('function should return selected task details', () => {
            store.let(fromRoot.getSelectedTaskData).subscribe(taskList => {
                expect(taskList).toEqual(modifiedState.selectedTask);
            });
        });

        it('function should return task categories', () => {
            store.let(fromRoot.getTaskCategoriesData).subscribe(taskList => {
                expect(taskList).toEqual(modifiedState.TaskCategoryState.TaskCategories);
            });
        });

        it('function should return selected task category', () => {
            store.let(fromRoot.getTaskCategorySelectItems).subscribe(taskList => {
                expect(taskList).toEqual(extractTaskCategorySelectItems(modifiedState.TaskCategoryState.TaskCategories));
            });
        });
    });
});