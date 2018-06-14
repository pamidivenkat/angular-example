import { LoadTaskHeadBannerAction } from './../actions/task-information-bar.actions';
import { Http, URLSearchParams } from '@angular/http';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import * as Immutable from 'immutable';
import * as fromRoot from '../../shared/reducers/index';
import * as taskUpdateActions from '../actions/task-update.actions';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessengerService } from '../../shared/services/messenger.service';
import { CatchErrorAction } from '../../shared/actions/error.actions';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { LoadTasksInfoAction } from '../../home/actions/tasks.actions';
import { RestClientService } from '../../shared/data/rest-client.service';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import * as tasklistActions from '../actions/task.list.actions';
@Injectable()
export class TaskUpdateEffects {

    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>, private _claimsHelper: ClaimsHelperService, private _messenger: MessengerService) {
    }

    @Effect()
    taskUpdateData$: Observable<Action> = this._actions$.ofType(taskUpdateActions.ActionTypes.UPDATE_TASK)
        .map(toPayload)
        .switchMap((data) => {
            let updateTaskInfo = 'Updating task is completed,the tasks will be generated soon.';
            let vm = ObjectHelper.createCustomActionCompleteSnackbarMessage(updateTaskInfo, data.Id);
            this._messenger.publish('snackbar', vm);
            let apiUrl = 'task/BulkUpdateTasks?isBulkUpdate=true';
            return this._data.post(apiUrl, data)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createCustomActionCompleteSnackbarMessage(updateTaskInfo, data.Id);
                    this._store.dispatch(new LoadTaskHeadBannerAction(true));
                    this._messenger.publish('snackbar', vm);
                    return [
                        new taskUpdateActions.UpdateTaskCompletedAction(true),
                        new tasklistActions.LoadTasksAction(true)
                    ];
                }).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Task', data.Title, data.Id)));
                });
        });
}
