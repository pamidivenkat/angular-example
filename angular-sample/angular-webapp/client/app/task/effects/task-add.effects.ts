import { LoadTaskHeadBannerAction } from './../actions/task-information-bar.actions';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { TasksView } from '../models/task';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessengerService } from '../../shared/services/messenger.service';
import { extractAssignUsers } from '../common/task-extract-helper';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as Immutable from 'immutable';
import * as fromRoot from '../../shared/reducers/index';
import * as taskAddActions from '../actions/task-add.actions';
import * as errorActions from '../../shared/actions/error.actions';
import { AeInformationBarItemType } from '../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { extractInformationBarItems } from '../../shared/helpers/extract-helpers';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { AssignUser } from '../models/assign-user';
import { LoadTasksInfoAction } from '../../home/actions/tasks.actions';
import * as tasklistActions from '../actions/task.list.actions';
@Injectable()
export class TaskAddEffects {
    constructor(private _data: RestClientService,
        private _actions$: Actions,
        private _store: Store<fromRoot.State>,
        private _claimsHelper: ClaimsHelperService,
        private _messenger: MessengerService) {
    }

    @Effect()
    addTaskSave$: Observable<Action> = this._actions$.ofType(taskAddActions.ActionTypes.SAVE_TASK)
        .map(toPayload)
        .switchMap((data) => {
            let employeeId = this._claimsHelper.getEmpId();
            let apiUrl = 'task/BulkCreateTasks?isBulkCreate=true';
            let updateTaskInfo = 'Adding task is completed,the tasks will be generated soon.';
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage(data.Title, '');
            this._messenger.publish('snackbar', vm);
            return this._data.put(apiUrl, data)
                .mergeMap((res) => {
                    let result = res.json();
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage(data.Title, '');
                    this._messenger.publish('snackbar', vm);
                    this._store.dispatch(new LoadTasksInfoAction(true));
                    this._store.dispatch(new LoadTaskHeadBannerAction(true)); 
                    return Observable.of(new tasklistActions.LoadTasksAction(true));
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Task', data.Title)));
                });
        });

    @Effect()
    taskAssignedUsers$: Observable<Action> = this._actions$.ofType(taskAddActions.ActionTypes.LOAD_ASSIGN_USERS)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,FirstName,LastName,HasEmail,Email');
            //Paging
            params.set('pageNumber', '0');
            params.set('pageSize', '0');
            //End of Paging
            return this._data.get('users', { search: params })
                .map((res) => {
                    return new taskAddActions.LoadAssignUserComplete(extractAssignUsers(<AtlasApiResponse<AssignUser>>res.json()))
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Task assigned users', null)));
                });
        });
}