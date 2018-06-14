import { MyTrainingLoadCompleteAction } from './../actions/my-training-actions';
import { MyTraining } from './../models/my-training';
import { AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { ClaimsHelperService } from './../../shared/helpers/claims-helper';
import { RestClientService } from './../../shared/data/rest-client.service';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import * as fromRoot from './../../shared/reducers/index';
import * as MyTrainingsActions from '../actions/my-training-actions';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessengerService } from '../../shared/services/messenger.service';
import * as errorActions from '../../shared/actions/error.actions';


@Injectable()
export class MyTrainingsEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>) {
    }

    @Effect()
    myTrainings$: Observable<Action> = this._actions$.ofType(MyTrainingsActions.ActionTypes.MY_TRAINING_LOAD)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'SelectedModule.Title+as+ModuleTitle,Id');
            params.set('MyTrainingsWidgetFilter', '5,2');
            params.set('filterOnlyInCompletedCoursesForMyTrainings', 'true');
            params.set('pageNumber', '0');
            params.set('pageSize', '0');
            params.set('sortField', 'ModuleTitle');
            params.set('direction', 'desc');
            return this._data.get('TrainingUserCourseModule', { search: params })
        })
        .map((res) => {
            return new MyTrainingsActions.MyTrainingLoadCompleteAction(<AtlasApiResponse<MyTraining>>res.json());
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'My training', null)));
        });
    @Effect()
    myTeamTrainingTasks$: Observable<Action> = this._actions$.ofType(MyTrainingsActions.ActionTypes.MY_TEAM_TASKS_COUNT)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('optionalParams1', 'true');
            params.set('optionalParams2', '1');
            params.set('filterTaskView', '3');
            params.set('filterTaskStatus', '0,1');
            params.set('filterTaskCategory', action.payload);
            return this._data.get('TasksView/CheckMyTeamTrainingTasks', { search: params })
        })
        .map((res) => {
            let tasksExist = res.json();
            return new MyTrainingsActions.MyTeamTrainingTasksCountCompleteAction(tasksExist);
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'My team task', null)));
        });
}