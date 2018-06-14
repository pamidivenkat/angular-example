import { TaskActivity } from '../../models/task-activity';
import { Subscription } from 'rxjs/Rx';
import { TaskService } from '../../services/task-service';
import { Priority } from '../../models/task-priority';
import { TaskStatus } from '../../models/task-status';
import { isNullOrUndefined } from 'util';
import { TasksView } from '../../models/task';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    Output,
    EventEmitter
} from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';

@Component({
    selector: 'task-details',
    templateUrl: './task-details.component.html',
    styleUrls: ['./task-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
    // Private Fields

    /**
     * Variable to hold the current selected task Item
     * @private
     * @type {TasksView}
     * @memberOf TaskDetailsComponent
     */
    private _selectedTask: TasksView

    /**
     * variable to hold subscribe and unsubscribe
     * @private
     * @type {Subscription}
     * @memberOf TaskDetailsComponent
     */
    private _selectedTaskSubscription: Subscription;
    // End of Private Fields

    // Public properties
    get selectedTask(): TasksView {
        return this._selectedTask;
    }
    // End of Public properties

    // Public Output bindings
    @Output('onCancel') _onCancel: EventEmitter<string> = new EventEmitter<string>();

    @Output('onUpdate') _onUpdate: EventEmitter<string> = new EventEmitter<string>();

    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    // End of Public ViewContent bidnings

    // constructor
    constructor(_localeService: LocaleService,
        _translationService: TranslationService,
        _cdRef: ChangeDetectorRef,
        private _store: Store<fromRoot.State>, private _taskService: TaskService) {
        super(_localeService, _translationService, _cdRef);
    }
    // End of constructor

    // Private methods

    /**
     * Method to cance the task slider out display
     * @param {*} event 
     * 
     * @memberOf TaskDetailsComponent
     */
    onTaskCancel(event: any) {
        this._selectedTask = null;
        this._onCancel.emit('details');
    }


    /**
     * Method to open update slider
     * 
     * 
     * @memberOf TaskDetailsComponent
     */
    onTaskUpdate($event: Event) {
        this._onUpdate.emit(this._selectedTask.Id);
        $event.preventDefault();
    }

    /**
     * Method to check site visit task
     * @returns 
     * 
     * @memberOf TaskDetailsComponent
     */
    isSiteVisitTask() {
        if (!isNullOrUndefined(this._selectedTask) && this._selectedTask.TaskCategoryName) {
            return this._selectedTask.TaskCategoryName.toLowerCase() == "site visit";
        }
        return false;
    }

    /**
     * method to return the task status
     * @param {number} status 
     * @returns 
     * 
     * @memberOf TaskDetailsComponent
     */
    getStatus(status: number) {
        return this._taskService._getStatus(status);
    }


    /**
     * method to return the task prorirty
     * @param {number} priority 
     * @returns 
     * 
     * @memberOf TaskDetailsComponent
     */
    _getPriority(priority: number) {
        return this._taskService._getPriority(priority);
    }

    /**
     * method to check whether task is immediate prorirty
     * @param {number} priority 
     * @returns 
     * 
     * @memberOf TaskDetailsComponent
     */
    isImmediatePriorityTask(priority: number) {
        return this._taskService._isImmediatePriorityTask(priority);
    }

    /**
     * method to check whether task is high prorirty
     * @param {number} priority 
     * @returns 
     * 
     * @memberOf TaskDetailsComponent
     */
    isHighPriorityTask(priority: number) {
        return this._taskService._isHighPriorityTask(priority);
    }

    /**
     * method to check whether task is medium prorirty
     * @param {number} priority 
     * @returns 
     * 
     * @memberOf TaskDetailsComponent
     */
    isMediumPriorityTask(priority: number) {
        return this._taskService._isMediumPriorityTask(priority);
    }

    /**
     * method to check whether task is low prorirty
     * @param {number} priority 
     * @returns 
     * 
     * @memberOf TaskDetailsComponent
     */
    isLowPriorityTask(priority: number) {
        return this._taskService._isLowPriorityTask(priority);
    }

    /**
     * method to select task 
     * @param {string} taskId 
     * 
     * @memberOf TaskDetailsComponent
     */
    _onTaskSelect(taskId: string) {
        this._taskService._onTaskSelect(taskId);
    }

    ngOnInit() {
        this._selectedTaskSubscription = this._store.let(fromRoot.getSelectedTaskData).subscribe((task) => {
            if (task) {
                this._selectedTask = task;
                this._cdRef.markForCheck();
            }
        });
    }

    ngOnDestroy() {
        this._selectedTaskSubscription.unsubscribe();
    }
    // End of private methods

    // Public methods
    // End of public methods

}