import { TasksInfo } from '../models/tasks-info';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as tasksInfoActions from '../actions/tasks.actions';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessengerService } from '../../shared/services/messenger.service';
import * as errorActions from '../../shared/actions/error.actions';

@Injectable()
export class TasksInfoEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>) {

    }

    @Effect()
    tasksInfo$: Observable<Action> = this._actions$.ofType(tasksInfoActions.ActionTypes.LOAD_TASKTYPE)
        .switchMap(() => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('action', 'GetTasksStats');
            params.set('isForV1', 'false');
            params.set('temp1', 'false');
            params.set('isTaskStats', 'false');
            return this._data.get('tasksview', { search: params });
        })
        .map((res) => {
            return new tasksInfoActions.LoadTasksInfoCompleteAction(res.json());
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Task', null)));
        });

}