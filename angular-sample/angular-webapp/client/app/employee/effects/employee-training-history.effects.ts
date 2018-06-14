import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiResponse, AtlasApiRequestWithParams, AtlasParams } from '../../shared/models/atlas-api-response';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as employeeActions from '../actions/employee.actions';
import { TrainingUserCourseModule } from '../models/training-history.model';
import { getAtlasParamValueByKey } from '../../../app/root-module/common/extract-helpers';
import { StringHelper } from '../../shared/helpers/string-helper';
import { extractEmployeeTrainingHistoryDetails } from '../../employee/common/extract-helpers';


import { ObjectHelper } from './../../shared/helpers/object-helper';
import { MessengerService } from './../../shared/services/messenger.service';
import * as errorActions from './../../shared/actions/error.actions';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';

@Injectable()
export class TrainingHistoryEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _claimsHelper: ClaimsHelperService
        , private _store: Store<fromRoot.State>
        , private _messenger: MessengerService
    ) {

    }

    @Effect()
    trainingHistoryListDetails$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_TRAINING_HISTORY_LOAD)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { payload: payload, _empPersonal: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let payload = pl.payload;
            let apiRequest = <AtlasApiRequestWithParams>payload;
            var IsAtlasTrainingUserCourseModule = getAtlasParamValueByKey(apiRequest.Params, "IsAtlasTrainingUserCourseModule");
            let params: URLSearchParams = new URLSearchParams();
            if (!StringHelper.isNullOrUndefinedOrEmpty(IsAtlasTrainingUserCourseModule)) {
                params.set('IsAtlasTrainingUserCourseModule', IsAtlasTrainingUserCourseModule);
            }
            params.set('TrainingUserCourseModuleByEmployeeIdFilter', pl._empPersonal.Id);
            params.set('Direction', apiRequest.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            params.set('fields', `Id,SelectedModule.Title as ModuleTitle,SelectedCourse.IsAtlasTraining,SelectedCourse.Title as CourseTitle,StartDate,PassDate,Certificates,CompanyId`);
            params.set('pagenumber', apiRequest.PageNumber.toString());
            params.set('pagesize', apiRequest.PageSize.toString());
            params.set('SortField', apiRequest.SortBy.SortField);
            return this._data.get(`TrainingUserCourseModule/getspecificfields`, { search: params })
                .map((res) => new employeeActions.EmployeeTrainingHistoryLoadCompleteAction(<AtlasApiResponse<TrainingUserCourseModule>>res.json()))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Training history', pl._empPersonal.FirstName)));
                })
        })

    @Effect()
    trainingHistoryCreate$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_TRAINING_HISTORY_CREATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: TrainingUserCourseModule, state) => { return { payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let payload = pl.payload;
            let empId = pl.currentEmployee.Id;
            let empName: string = pl.currentEmployee.FirstName + ' ' + pl.currentEmployee.Surname;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Training history', empName);
            this._messenger.publish('snackbar', vm);
            payload.EmployeeId = empId;
            payload.UserId = pl.currentEmployee.UserId;
            return this._data.put(`TrainingUserCourseModule`, payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Training history', empName);
                    this._messenger.publish('snackbar', vm);
                    let apiRequest = new AtlasApiRequestWithParams(1, 10, 'StartDate', SortDirection.Ascending, [new AtlasParams('EmployeeId', empId)]);
                    return [
                        new employeeActions.EmployeeTrainingHistoryCreateCompleteAction(true),
                        new employeeActions.EmployeeTrainingHistoryLoadAction(apiRequest)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Training history', empName)));
                })
        })

    @Effect()
    trainingHistoryUpdate$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_TRAINING_HISTORY_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: TrainingUserCourseModule, state) => { return { payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((updatedPL) => {
            let payload = updatedPL.payload;
            let empId = updatedPL.currentEmployee.Id;
            let empName: string = updatedPL.currentEmployee.FirstName + ' ' + updatedPL.currentEmployee.Surname;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Training history', empName, updatedPL.currentEmployee.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post(`TrainingUserCourseModule`, payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Training history', empName, updatedPL.currentEmployee.Id);
                    this._messenger.publish('snackbar', vm);
                    let apiRequest = new AtlasApiRequestWithParams(1, 10, 'StartDate', SortDirection.Ascending, [new AtlasParams('EmployeeId', empId)]);
                    return [
                        new employeeActions.EmployeeTrainingHistoryUpdateCompleteAction(true),
                        new employeeActions.EmployeeTrainingHistoryLoadAction(apiRequest)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Training history', empId)));
                })
        })

    @Effect()
    trainingHistoryDelete$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_TRAINING_HISTORY_DELETE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: TrainingUserCourseModule, state) => { return { payload: payload, existingHistoryApiRequest: state.employeeState.TrainingHistoryApiRequest, currentEmployee: state.employeeState.EmployeePersonalVM, trainingHistoryData: state.employeeState.TrainingHistoryList.Entities }; })
        .switchMap((updatedPL) => {
            let payload = updatedPL.payload;
            let empId = updatedPL.currentEmployee.Id;
            let empTrainingDetailsId: string = payload.Id;
            let empName: string = updatedPL.currentEmployee.FirstName + ' ' + updatedPL.currentEmployee.Surname;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Training history', empName, empTrainingDetailsId);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`TrainingUserCourseModule/${empTrainingDetailsId}`)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Training history', empName, empTrainingDetailsId);
                    this._messenger.publish('snackbar', vm);
                    if (updatedPL.trainingHistoryData.length == 1 && updatedPL.existingHistoryApiRequest.PageNumber > 1) {
                        updatedPL.existingHistoryApiRequest.PageNumber = updatedPL.existingHistoryApiRequest.PageNumber - 1;
                    }
                    return [
                        new employeeActions.EmployeeTrainingHistoryDeleteCompleteAction(true),
                        new employeeActions.EmployeeTrainingHistoryLoadAction(updatedPL.existingHistoryApiRequest),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Training history', empTrainingDetailsId)));
                })
        })

    @Effect()
    trainingHistoryDetails$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_TRAINING_HISTORY_GET)
        .map(toPayload)
        .switchMap((payload) => {
            let empTrainingDetailsId: string = payload.EmployeeTrainingDetailsId;
            let params: URLSearchParams = new URLSearchParams();
            params.set('Id', empTrainingDetailsId);

            return this._data.get(`TrainingUserCourseModule/Getbyid`, { search: params })

                .map((res) => extractEmployeeTrainingHistoryDetails(res))
                .mergeMap((employeeTrainingDetails: TrainingUserCourseModule) => {
                    return [
                        new employeeActions.EmployeeTrainingHistoryGetCompleteAction(employeeTrainingDetails),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Training history', empTrainingDetailsId)));
                })
        })

}