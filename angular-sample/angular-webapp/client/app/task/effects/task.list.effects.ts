import { extractPagingInfo } from '../../employee/common/extract-helpers';
import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { extractTaskCategories, extractTasksList } from '../common/task-extract-helper';
import { LoadTaskHeadBannerAction } from '../actions/task-information-bar.actions';
import { TaskCategory } from '../models/task-categoy';
import { ExtractionResult } from '@angular/compiler/src/i18n/extractor_merger';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { TasksView } from '../models/task';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import { CatchErrorAction } from '../../shared/actions/error.actions';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessengerService } from '../../shared/services/messenger.service';

import {
    ActionTypes,
    ChangeTaskCompleteAction,
    LoadSelectedTaskCompleteAction,
    LoadTaskCategoriesComplete,
    LoadTasksAction,
    LoadTasksCompleteAction
} from '../actions/task.list.actions';

@Injectable()
export class TasksListEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>, private _claimsHelper: ClaimsHelperService, private _messenger: MessengerService) {

    }

    // tslint:disable-next-line:member-ordering
    @Effect()
    tasksInfo$: Observable<Action> = this._actions$.ofType(ActionTypes.LOAD_TASKS, ActionTypes.LOAD_TASKS_ON_PAGE_CHANGE, ActionTypes.LOAD_TASKS_ON_FILTER_CHANGE, ActionTypes.LOAD_TASKS_ON_SORT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.tasksListState }; })
        .switchMap((payLoad) => {
            let params: URLSearchParams = new URLSearchParams();
            // tslint:disable-next-line:max-line-length
            params.set('fields', 'Id,Title,Status,Priority,DueDate,AssignedUserName,CreatedByUserName,TaskCategoryId,TaskCategoryName');
            //Paging
            if (payLoad._state.pagingInfo) {
                params.set('pageNumber', payLoad._state.pagingInfo.PageNumber.toString());
                params.set('pageSize', payLoad._state.pagingInfo.Count.toString());
            }
            else {
                params.set('pageNumber', '1');
                params.set('pageSize', '10');
            }
            //End of Paging

            //Filtering
            if (payLoad._state.filters && payLoad._state.filters.size > 0) {
                payLoad._state.filters.forEach((value: string, key: string) => {
                    params.set(key, value);
                });
            }

            // End of Filtering

            //Sorting
            if (payLoad._state.sortInfo) {
                params.set('sortField', payLoad._state.sortInfo.SortField);
                params.set('direction', payLoad._state.sortInfo.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            }
            else {
                params.set('sortField', 'DueDate');
                params.set('direction', 'desc');
            }

            //End of Sorting

            return this._data.get('TasksView', { search: params })
                .map((res) => {
                    return new LoadTasksCompleteAction({ tasksList: extractTasksList(res), pagingInfo: extractPagingInfo(res) });
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Tasks', null)));
                });
        });

    @Effect()
    selectedTask$: Observable<Action> = this._actions$.ofType(ActionTypes.LOAD_SELECTED_TASK)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            let taskId = action.payload;
            let apiUrl = 'TasksView/' + taskId;
            params.set('fields', 'Id,Title,Status,Priority,CreatedOn,DueDate,Description,AssignedTo,AssignedUserName,CreatedBy,CreatedByUserName,TaskCategoryId,TaskCategoryName,CorrectiveActionTaken,CostOfRectification,PercentageCompleted,CompanyId,RegardingObjectId');
            return this._data.get(apiUrl, { search: params })
                .map((res) => {
                    return new LoadSelectedTaskCompleteAction(res.json());
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Task', null)));
                });
        });

    @Effect()
    taskCategories$: Observable<Action> = this._actions$.ofType(ActionTypes.LOAD_TASK_CATEGORIES)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,Name');
            params.set('action', 'getspecificfields');
            //Paging
            params.set('pageNumber', '0');
            params.set('pageSize', '0');
            //End of Paging

            //Sorting
            params.set('sortField', 'Name');
            params.set('direction', 'asc');
            //End of Sorting           
            return this._data.get('TaskCategory', { search: params })
                .map((res) => {
                    return new LoadTaskCategoriesComplete(extractTaskCategories(res.json().Entities));
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Task Categories', null)));
                });
        });

    @Effect()
    updateTaskStatus$: Observable<Action> = this._actions$.ofType(ActionTypes.CHANGE_TASK_STATUS)
        .map(task => task.payload)
        .switchMap((task) => {
            let params: URLSearchParams = new URLSearchParams();
            let taskId = task.Id;
            const status = task.Status;
            params.set('taskId', taskId);
            params.set('status', status);
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Task Status', task.Title, task.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post('Task', null, { search: params }).map((res) => {
                let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Task Status', task.Title, task.Id);
                this._messenger.publish('snackbar', vm);
                this._store.dispatch(new LoadTaskHeadBannerAction(true));
                this._store.dispatch(new LoadTasksAction(true));
                return new ChangeTaskCompleteAction(res.json());
            }).catch((error) => {
                return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, task.Title, task.Id)));
            });
        });

    @Effect()
    deleteTask$: Observable<Action> = this._actions$.ofType(ActionTypes.REMOVE_TASK)
        .map(task => task.payload)
        .switchMap((task) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', task.Id);
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Task', task.Title, task.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete('Task', { search: params }).map((result) => {
                let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Task', task.Title, task.Id);
                this._messenger.publish('snackbar', vm);
                this._store.dispatch(new LoadTaskHeadBannerAction(true));
                return new LoadTasksAction(true);
            }).catch((error) => {
                return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Task', task.Title, task.Id)));
            });
        });
}