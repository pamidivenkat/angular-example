import { TrainingCourseSnackbarMessage } from '../../common/traninig-course-snackbar-message';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { isNullOrUndefined } from 'util';

import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import * as TrainingCourseActions from '../actions/training-courses.actions';
import { Http, URLSearchParams } from '@angular/http';
import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import * as errorActions from '../../../shared/actions/error.actions';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import { TrainingCourse } from '../../models/training-course';

import { MessengerService } from '../../../shared/services/messenger.service';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { extractTrainingCourseList, extractTrainingCoursePagingInfo, extractTrainingCourseModulesList, extractTrainingCourseSelectedModulesList } from "../../common/extract-helper";

@Injectable()
export class TrainingCourseFromTrainingsEffects {
    private _objectType: string = "Training Course";
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>, private _messenger: MessengerService) {

    }
    @Effect()
    updateTrainingCourse$: Observable<Action> = this._actions$.ofType(TrainingCourseActions.ActionTypes.TRAINING_COURSES_UPDATE)
        .map(toPayload)
        .switchMap((data) => {
            let modal = <TrainingCourse>data;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, modal.Title, modal.Id);
            this._messenger.publish('snackbar', vm);
            let apiUrl = 'TrainingCourse';
            return this._data.post(apiUrl, data)
                .mergeMap((res) => {
                    let trainingCourse = res.json() as TrainingCourse;
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, trainingCourse.Title, modal.Id);
                    this._messenger.publish('snackbar', vm);
                    this._store.dispatch(new TrainingCourseActions.TrainingCoursesLoad(true)); // refresh the grid listing
                    return Observable.of(new TrainingCourseActions.UpdateTrainingCoursesCompletedAction(true));
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, this._objectType, modal.Title, modal.Id)));
                });
        });


    @Effect()
    addTrainingCourse$: Observable<Action> = this._actions$.ofType(TrainingCourseActions.ActionTypes.TRAINING_COURSES_ADD)
        .map(toPayload)
        .switchMap((data) => {
            let modal = <TrainingCourse>data;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage(this._objectType, modal.Title);
            this._messenger.publish('snackbar', vm);
            let apiUrl = 'TrainingCourse';
            return this._data.put(apiUrl, data)
                .mergeMap((res) => {
                    let trainingCourse = res.json() as TrainingCourse;
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage(this._objectType, trainingCourse.Title);
                    this._messenger.publish('snackbar', vm);
                    this._store.dispatch(new TrainingCourseActions.TrainingCoursesLoad(true)); // refresh the grid listing
                    return Observable.of(new TrainingCourseActions.AddTrainingCoursesCompletedAction(true));
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, this._objectType, modal.Title)));
                });
        });

    @Effect()
    loadTrainingModiles$: Observable<Action> = this._actions$.ofType(TrainingCourseActions.ActionTypes.TRAINING_MODULE_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,Title');
            params.set('sortField', 'Title');
            params.set('direction', 'asc');
            params.set('pageNumber', '0');
            params.set('pageSize', '0');
            params.set('TrainingModulesByCompanyIdFilter', payload);
            return this._data.get('TrainingModule', { search: params })
                .map((res) =>
                    new TrainingCourseActions.LoadTrainingModuleComplete(extractTrainingCourseModulesList(res)))
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Training Modules', null)));
        });


    @Effect()
    loadTrainingSelectedModiles$: Observable<Action> = this._actions$.ofType(TrainingCourseActions.ActionTypes.TRAINING_SELECTED_MODULE)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            let courseId = payload.Params[0].Value;
            let courseType = payload.Params.find((data) => data.Key === "example");
            if (!isNullOrUndefined(courseType))
                params.set(courseType.Key, courseType.Value);
            let apiUrl = 'TrainingCourse/' + courseId;
            return this._data.get(apiUrl, { search: params });
        })
        .map((res) =>
            new TrainingCourseActions.LoadTrainingSelectedModuleComplete(extractTrainingCourseSelectedModulesList(res))
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });


    @Effect()
    DeleteTrainingCourse$: Observable<Action> = this._actions$.ofType(TrainingCourseActions.ActionTypes.TRAINING_COURSES_DELETE)
        .map(toPayload)
        .switchMap((data) => {
            let modal = <TrainingCourse>data;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._objectType, modal.Title, modal.Id);
            this._messenger.publish('snackbar', vm);
            let apiUrl = 'TrainingCourse/' + data.Id;
            return this._data.delete(apiUrl)
                .map(res => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._objectType, modal.Title, modal.Id);
                    this._messenger.publish('snackbar', vm);
                    this._store.dispatch(new TrainingCourseActions.TrainingCoursesLoad(true)); // refresh the grid listing
                    return new TrainingCourseActions.LoadTrainingCoursesOnstatusChangeComplete(res);
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, this._objectType, modal.Title, modal.Id)));
                });
        });


    @Effect()
    UpdateStatusTrainingCourse$: Observable<Action> = this._actions$.ofType(TrainingCourseActions.ActionTypes.TRAINING_COURSE_ON_STATUS_CHANGE)
        .map(toPayload)
        .switchMap((data) => {
            let modal = <TrainingCourse>data;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, modal.Title, modal.Id);
            this._messenger.publish('snackbar', vm);
            let params: URLSearchParams = new URLSearchParams();
            params.set('trainingCourseId', data.Id);
            params.set('status', modal.IsCompleted + '');
            return this._data.post('TrainingCourse/UpdateTrainingCourseStatus', null, { search: params }).map(res => {
                let trainingCourse = res.json() as TrainingCourse;
                let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, trainingCourse.Title, trainingCourse.Id);
                this._messenger.publish('snackbar', vm);
                this._store.dispatch(new TrainingCourseActions.TrainingCoursesLoad(true)); // refresh the grid listing
                return new TrainingCourseActions.LoadTrainingCoursesOnstatusChangeComplete(res);
            }).catch((error) => {
                return Observable
                    .of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, this._objectType, modal.Title, modal.Id)));
            });
        });


    @Effect()
    TrainingCourses$: Observable<Action> = this._actions$.ofType(TrainingCourseActions.ActionTypes.TRAINING_COURSES_LOAD, TrainingCourseActions.ActionTypes.TRAINING_COURSE_ON_FILTERS_CHANGE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.trainingCourseFromTrainingsState }; })
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            //Filtering
            if (payload._state.filters && payload._state.filters.size > 0) {
                payload._state.filters.forEach((value: string, key: string) => {
                    params.set(key, value);
                });
            }
            // End of Filtering
            if (payload._state && payload._state.TrainingCoursePagingInfo) {
                params.set('pageNumber', payload._state.TrainingCoursePagingInfo.PageNumber ? payload._state.TrainingCoursePagingInfo.PageNumber.toString() : '1');
                params.set('pageSize', payload._state.TrainingCoursePagingInfo.Count ? payload._state.TrainingCoursePagingInfo.Count.toString() : '10');
            }
            else {
                params.set('pageNumber', '1');
                params.set('pageSize', '10');
            }
            //End of Paging

            //Sorting
            if (payload._state && payload._state.TrainingCourseSortingInfo) {
                params.set('sortField', payload._state.TrainingCourseSortingInfo.SortField);
                params.set('direction', payload._state.TrainingCourseSortingInfo.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            }
            else {
                params.set('sortField', 'Title');
                params.set('direction', 'asc');
            }
            params.set('IsAtlasTraining', 'true');
            return this._data.get('TrainingCourse', { search: params })
                .map(res => {
                    return new TrainingCourseActions.TrainingCoursesLoadComplete({ TrainingCourseList: extractTrainingCourseList(res), TrainingCoursesPagingInfo: extractTrainingCoursePagingInfo(res) });
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "Training Courses", null)));
                });
        });


    @Effect()
    loadTrainingUserCourseModule$: Observable<Action> = this._actions$.ofType(TrainingCourseActions.ActionTypes.LOAD_TRAINING_COURSE_INVITEES)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            params.set('pageNumber', payload.PageNumber.toString());
            params.set('pageSize', payload.PageSize.toString());
            params.set('sortField', payload.SortBy.SortField);
            params.set('currentPage', payload.PageNumber.toString());
            payload.Params.forEach((element) => {
                if (!isNullOrUndefined(element.Value) && !StringHelper.isNullOrUndefinedOrEmpty(String(element.Value)))
                    params.append(element.Key, element.Value);
            });
            return this._data.get('TrainingUserCourseModule', { search: params })
                .map((res) =>
                    new TrainingCourseActions.LoadTrainingCourseUserModuleComplete(res.json())).catch((error) => {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "Trainings", null)));
                    });
        });

    @Effect()
    sendInviteForSelectedUsers$: Observable<Action> = this._actions$.ofType(TrainingCourseActions.ActionTypes.SEND_INVITE_FOR_SELECTED_COURSE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.trainingCourseFromTrainingsState.SelectedTrainingModuleList }; })
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            let trainingCourseId = payload._state.Id;
            params.set('trainingCourseId', trainingCourseId);
            params.set('isExample', payload._state.IsExample.toString());
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, "Assigning users", trainingCourseId);
            this._messenger.publish('snackbar', vm);
            return this._data.post('TrainingCourse/SendInvitees', payload._payload, { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, "Assigning users", trainingCourseId);
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new TrainingCourseActions.SendInviteForSelectedCourseCompleteAction(res));
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, this._objectType, "Assigning users", trainingCourseId)));
                });
        });

        
    @Effect()
    sendInviteForSelectedRegardingObjects$: Observable<Action> = this._actions$.ofType(TrainingCourseActions.ActionTypes.SEND_INVITE_FOR_SELECTED_COURSE_REGARDINGOBJECTS)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.trainingCourseFromTrainingsState.SelectedTrainingModuleList }; })
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            let trainingCourseId = payload._state.Id;
            params.set('trainingCourseId', trainingCourseId);
            params.set('isExample', payload._state.IsExample.toString());
             params.set('regardingObjectTypeCode', payload._payload.regardingObjectTypeCode);
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, "Assigning users", trainingCourseId);
            this._messenger.publish('snackbar', vm);
            return this._data.post('TrainingCourse/SendInviteesToRegardingObjects', payload._payload.regardingObjects, { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, "Assigning users", trainingCourseId);
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new TrainingCourseActions.SendInviteForSelectedCourseRegardingObjectsCompleteAction(res));
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, this._objectType, "Assigning users", trainingCourseId)));
                });
        });

    @Effect()
    InvitePublicUser$: Observable<Action> = this._actions$.ofType(TrainingCourseActions.ActionTypes.INVITE_PUBLIC_USER_FOR_TRAINING_COURSE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.trainingCourseFromTrainingsState.SelectedTrainingModuleList }; })
        .switchMap((payload) => {
            let modal = payload._payload;
            let userName = modal.firstName + ' ' + modal.lastName;
            let params: URLSearchParams = new URLSearchParams();
            let courseID: string = payload._state.Id;
            params.set('isExample', payload._state.IsExample.toString());
            params.set('trainingCourseId', courseID);
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage(this._objectType, "Invite public user");
            this._messenger.publish('snackbar', vm);
            return this._data.put('TrainingCourse/CreatePublicUser', payload._payload, { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage(this._objectType, "Invite public user");
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new TrainingCourseActions.InvitePublicUserCompleteAction(res));
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, this._objectType, "Invite public user")));
                });
        });

    @Effect()
    RemoveOrReinviteAssignedUsers$: Observable<Action> = this._actions$.ofType(TrainingCourseActions.ActionTypes.REMOVE_OR_REINVITE_ASSIGNED_USERS_ACTION)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            let user = payload[0];
            let userName = user.FirstName + ' ' + user.LastName;
            let actionType = payload.pop();
            if (actionType == "reinvite") {
                params.set('isDelete', 'false');
                params.set('status', '2');
                let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, userName + ' Reinvite', user.Id);
                this._messenger.publish('snackbar', vm);
            }
            if (actionType == "delete") {
                params.set('isDelete', 'true');
                params.set('status', '0');
                let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._objectType, userName, user.Id);
                this._messenger.publish('snackbar', vm);
            }
            payload.pop();
            let userIdArray: Array<string> = [];
            userIdArray.push(user.Id);
            params.set('optional', 'true');
            return this._data.post('TrainingUserCourseModule/UpdateTrainingUserCourseModuleByGuid', userIdArray, { search: params })
                .mergeMap((res) => {
                    if (actionType == "reinvite") {
                        let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, userName + ' Reinvite', user.Id);
                        this._messenger.publish('snackbar', vm);
                    }
                    if (actionType == "delete") {
                        let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._objectType, userName, user.Id);
                        this._messenger.publish('snackbar', vm);
                    }
                    return [new TrainingCourseActions.RemoveOrReInviteAssignedUsersCompleteAction(res)];
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, this._objectType, userName, user.Id)));
                });
        });
}