import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as trainingCourseActions from '../actions/training-course.actions';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { TrainingCourse } from '../../shared/models/training-course.models';
import { extractTrainingCourseList, extractTrainingCourseDetails } from '../../shared/helpers/extract-helpers';
import { CatchErrorAction } from '../../shared/actions/error.actions';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessengerService } from '../../shared/services/messenger.service';

@Injectable()
export class TrainingCourseEffects {

    @Effect()
    trainingCourseList$: Observable<Action> = this._actions$.ofType(trainingCourseActions.ActionTypes.TRAINING_COURSE_LOAD)
        .map(toPayload)
        .switchMap((payload: boolean) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', `Id,Title,CourseCode,IsAtlasTraining,IsCompleted`);
            params.set('pagenumber', `0`);
            params.set('pagesize', `0`);
            params.set('TrainingCourseIsCompleteFilter', '0');
            return this._data.get(`TrainingCourse`, { search: params })
                .map((res) => {
                    return new trainingCourseActions.TrainingCourseLoadCompleteAction(extractTrainingCourseList(<AtlasApiResponse<TrainingCourse>>res.json()));
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Training Courses', null)));
                });
        });


    @Effect()
    trainingCourseCreate$: Observable<Action> = this._actions$.ofType(trainingCourseActions.ActionTypes.TRAINING_COURSE_CREATE)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Training course', payload.Title);
            this._messenger.publish('snackbar', vm);
            return this._data.put(`TrainingCourse`, payload)
                .map((res) => extractTrainingCourseDetails(res))
                .mergeMap((trainingCourseDetails: TrainingCourse) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Training course', payload.Title);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new trainingCourseActions.TrainingCourseGetCompleteAction(trainingCourseDetails),
                        new trainingCourseActions.TrainingCourseLoadAction(null)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Training Course', payload.Title)));
                });;
        });

    @Effect()
    trainingCourseDetails$: Observable<Action> = this._actions$.ofType(trainingCourseActions.ActionTypes.TRAINING_COURSE_GET)
        .map(toPayload)
        .switchMap((payload) => {
            let trainingCourseId: string = payload.Id;
            let params: URLSearchParams = new URLSearchParams();
            params.set('Id', trainingCourseId);
            return this._data.get(`TrainingCourse/Getbyid`, { search: params })
                .map((res) => extractTrainingCourseDetails(res))
                .mergeMap((trainingCourseDetails: TrainingCourse) => {
                    return [
                        new trainingCourseActions.TrainingCourseGetCompleteAction(trainingCourseDetails),
                    ];
                }).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Training Course', null)));
                });
        });

    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _messenger: MessengerService) {

    }
}
