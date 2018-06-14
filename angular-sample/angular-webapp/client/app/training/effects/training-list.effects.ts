import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';

import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { extractPagingInfo } from '../../employee/common/extract-helpers';
import { CatchErrorAction } from '../../shared/actions/error.actions';
import { RestClientService } from '../../shared/data/rest-client.service';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import * as fromRoot from '../../shared/reducers/index';
import { MessengerService } from '../../shared/services/messenger.service';
import {
    ActionTypes,
    LoadTrainingsAction,
    LoadTrainingsCompleteAction,
    UpdatePassedTrainingsComplete,
} from '../actions/training-list.actions';
import { extractTrainingsList, removeUpdatedTrainingsFromLocalStorage, removePassedTrainingsFromLocalStorage } from '../common/extract-helper';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';

@Injectable()
export class TariningListEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>, private _claimsHelper: ClaimsHelperService, private _messenger: MessengerService) {

    }

    @Effect()
    trainingsInfo$: Observable<Action> = this._actions$.ofType(ActionTypes.LOAD_TRAININGS, ActionTypes.LOAD_TRAININGS_ON_FILTER_CHANGE, ActionTypes.LOAD_TRAININGS_ON_PAGE_CHANGE, ActionTypes.LOAD_TRAININGS_ON_SORT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.trainingListState }; })
        .switchMap((payLoad) => {
            let params: URLSearchParams = new URLSearchParams();

            params.set('fields', 'SelectedCourse.Title as CourseTitle,SelectedModule.Title as ModuleTitle,SelectedModule.Link as Link,Id,StartDate, PassDate,Status,Certificates');
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
                params.set('sortField', 'StartDate');
                params.set('direction', 'desc');
            }
            //End of Sorting

            return this._data.get('TrainingUserCourseModule', { search: params })
                .map((res) => {
                    return new LoadTrainingsCompleteAction({ data: extractTrainingsList(res), pagingInfo: extractPagingInfo(res) });
                }).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Trainings', null)));
                });
        });


    @Effect()
    updateTrainingCourseStatus$: Observable<Action> = this._actions$.ofType(ActionTypes.UPDATE_TRAININGCOURSE_STATUS)
        .map(trainingCourse => trainingCourse.payload)
        .switchMap((trainingCourse) => {
            let params: URLSearchParams = new URLSearchParams();
            let vm = ObjectHelper.createCustomActionInProgressSnackbarMessage('Updating training status', trainingCourse.id);
            this._messenger.publish('snackbar', vm);
            let trainingCourseId = trainingCourse.id;
            let status = trainingCourse.status;
            params.set('entityId', trainingCourseId);
            params.set('status', status);
            return this._data.post('trainingusercoursemodule', null, { search: params })
                .map((res) => {
                    let finalMsg = 'Updating training status completed';
                    if (status.toString().toLowerCase().indexOf('pass') >= 0) {
                        finalMsg = 'your certificate will be generated soon.'
                    }
                    let vm = ObjectHelper.createCustomActionCompleteSnackbarMessage(finalMsg, trainingCourse.id);
                    this._messenger.publish('snackbar', vm);
                    if (status.toString().toLowerCase().indexOf('pass') >= 0) {
                    removePassedTrainingsFromLocalStorage(trainingCourse.id);
                    }
                    return new LoadTrainingsAction(true);
                }).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Training status', null, trainingCourse.id)));
                });
        });

    @Effect()
    UpdatePassedTrainings$: Observable<Action> = this._actions$.ofType(ActionTypes.UPDATE_PASSED_TRAININGS)
        .map(toPayload)
        .switchMap((payload) => {
            return this._data.post('TrainingUserCourseModule/UpdateTrainingUserCourseModuleByGuid?isDelete=false&status=1&optional=true', payload)
                .map((response) => {
                    let res = response.json();
                    if (res.length > 0) {
                        removeUpdatedTrainingsFromLocalStorage(res);
                        return new LoadTrainingsAction(true);
                    } else {
                        return new UpdatePassedTrainingsComplete(response)
                    }
                }).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Training status update', null, null)));
                });
        })
}