import { LoadAssignUsers } from '../actions/task-add.actions';
import { Subject } from 'rxjs/Rx';
import { TasksView } from '../models/task';
import {
    ChangeTaskAction,
    LoadSelectedTaskAction,
    LoadTasksAction,
    RemoveTaskAction,
    SetDefaultFiltersAction
} from '../actions/task.list.actions';
import * as addAction from '../actions/task-add.actions';
import { Store } from '@ngrx/store';
import { TaskStatus } from '../models/task-status';
import { Priority } from '../models/task-priority';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';

@Injectable()
export class TaskService implements OnInit {
    // Private Fields
    // End of Private Fields

    // Public properties
    // End of Public properties

    // constructor
    constructor(private _store: Store<fromRoot.State>) {

    }
    // End of constructor

    ngOnInit() {

    }

    // Private methods

    /**
     * to dispatch event to load tasks list
     * 
     * @memberOf TaskService
     */
    _loadTasks() {
        this._store.dispatch(new LoadTasksAction(true));
    }

    // Private methods

    /**
     * to dispatch event to populate user autocomplete list
     * 
     * @memberOf TaskService
     */
    _populateUserAutocompleteList() {
        // this._store.dispatch(new LoadTasksAction(true));
        this._store.dispatch(new addAction.LoadAssignUsers(true));
    }

    // Private methods

    /**
     * to dispatch event to add new task
     * 
     * @memberOf TaskService
     */
    _addNewTask(taskFormObj) {
        // this._store.dispatch(new LoadTasksAction(true));
        this._store.dispatch(new addAction.SaveTaskAction(taskFormObj));
    }

    /**
     * to dispatch event to select the task
     * @param {string} taskId 
     * 
     * @memberOf TaskService
     */
    _onTaskSelect(taskId: string) {
        this._store.dispatch(new LoadSelectedTaskAction(taskId));
    }

    /**
     * to dispatch event to change the task status
     * @param {TasksView} taskView 
     * 
     * @memberOf TaskService
     */
    _changeTaskStatus(taskView: TasksView) {
        this._store.dispatch(new ChangeTaskAction(taskView));
    }

    /**
     * to dispatch event to remove the task
     * @param {TasksView} taskView 
     * 
     * @memberOf TaskService
     */
    _removeTask(taskView: TasksView) {
        this._store.dispatch(new RemoveTaskAction(taskView));
    }

    /**
     * to dispatch event to set default filters
     * @param {Map<string, string>} filters 
     * 
     * @memberOf TaskService
     */
    _setDefaultFitlers(filters: Map<string, string>) {
        this._store.dispatch(new SetDefaultFiltersAction(filters));
    }

    /**
     * method to return the task status
     * @param {number} status 
     * @returns 
     * 
     * @memberOf TaskService
     */
    _getStatus(status: number) {
        switch (status) {
            case TaskStatus.Complete:
                return "Complete";
            case TaskStatus.InProgress:
                return "In progress";
            case TaskStatus.ToDo:
                return "To do";
        }
    }

    /**
        * method to return the task prority text
        * @param {number} priority 
        * @returns 
        * 
        * @memberOf TaskService
        */
    _getPriority(priority: number) {
        switch (priority) {
            case Priority.Immediate:
                return "Immediate";
            case Priority.High:
                return "High";
            case Priority.Medium:
                return "Medium";
            case Priority.Low:
                return "Low";
        }
    }

    /**
     * method to check the whether task is immediate priority
     * @param {number} priority 
     * @returns 
     * 
     * @memberOf TaskService
     */
    _isImmediatePriorityTask(priority: number) {
        return priority == Priority.Immediate;
    }

    /**
     * method to check the whether task is High priority
     * @param {number} priority 
     * @returns 
     * 
     * @memberOf TaskService
     */
    _isHighPriorityTask(priority: number) {
        return priority == Priority.High;
    }

    /**
     * method to check the whether task is Medium priority
     * @param {number} priority 
     * @returns 
     * 
     * @memberOf TaskService
     */
    _isMediumPriorityTask(priority: number) {
        return priority == Priority.Medium;
    }

    /**
     * method to check the whether task is Low priority
     * @param {number} priority 
     * @returns 
     * 
     * @memberOf TaskService
     */
    _isLowPriorityTask(priority: number) {
        return priority == Priority.Low;
    }

    // End of private methods

    // Public methods
    // End of public methods

}