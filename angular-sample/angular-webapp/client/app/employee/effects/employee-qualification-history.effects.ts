import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { extractEmployeeQualificationHistoryDetails } from '../common/extract-helpers';
import { TrainingDetails } from '../models/qualification-history.model';
import { AtlasApiResponse, AtlasApiRequest } from '../../shared/models/atlas-api-response';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as employeeActions from '../actions/employee.actions';


import { ObjectHelper } from './../../shared/helpers/object-helper';
import { MessengerService } from './../../shared/services/messenger.service';
import * as errorActions from './../../shared/actions/error.actions';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';


@Injectable()
export class QualificationHistoryEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService
    ) {

    }

    @Effect()
    qualificationHistoryListDetails$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_LOAD)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { payload: payload, _empPersonal: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let payload = pl.payload;
            let params: URLSearchParams = new URLSearchParams();
            let apiRequest: AtlasApiRequest = <AtlasApiRequest>payload;
            params.set('TrainingDetailByEmployeeIdFilter', pl._empPersonal.Id)
            params.set('Direction', apiRequest.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            params.set('fields', `Id,Course,CourseCode,Qualification,ExpiryDate,DateStarted,DateCompleted`);
            params.set('pagenumber', apiRequest.PageNumber.toString());
            params.set('pagesize', apiRequest.PageSize.toString());
            params.set('SortField', apiRequest.SortBy.SortField);
            return this._data.get(`TrainingDetail/getspecificfields`, { search: params })
                .map((res) => new employeeActions.EmployeeQualificationHistoryLoadCompleteAction(<AtlasApiResponse<TrainingDetails>>res.json()))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Education history', pl._empPersonal.FirstName)));
                })
        })

    @Effect()
    qualificationHistoryCreate$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_CREATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: TrainingDetails, state) => { return { payload: payload, existingHistoryApiRequest: state.employeeState.QualificationHistoryApiRequest, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((updatedPL) => {
            let empName: string = updatedPL.currentEmployee.FirstName + ' ' + updatedPL.currentEmployee.Surname;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Qualification history', empName);
            this._messenger.publish('snackbar', vm);
            updatedPL.payload.EmployeeId = updatedPL.currentEmployee.Id;
            return this._data.put(`TrainingDetail`, updatedPL.payload)
                .mergeMap((result) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Qualification history', empName);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new employeeActions.EmployeeQualificationHistoryCreateCompleteAction(true),
                        new employeeActions.EmployeeQualificationHistoryLoadAction(updatedPL.existingHistoryApiRequest)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Qualification history', empName)));
                })
        })

    @Effect()
    qualificationHistoryUpdate$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: TrainingDetails, state) => { return { payload: payload, existingHistoryApiRequest: state.employeeState.QualificationHistoryApiRequest, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((updatedPL) => {
            let empName: string = updatedPL.currentEmployee.FirstName + ' ' + updatedPL.currentEmployee.Surname;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Qualification history', empName, updatedPL.currentEmployee.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post(`TrainingDetail`, updatedPL.payload)
                .mergeMap((result) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Qualification history', empName, updatedPL.currentEmployee.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new employeeActions.EmployeeQualificationHistoryUpdateCompleteAction(true),
                        new employeeActions.EmployeeQualificationHistoryLoadAction(updatedPL.existingHistoryApiRequest)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Qualification history', empName)));
                })
        })

    @Effect()
    qualificationHistoryDelete$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_DELETE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: TrainingDetails, state) => { return { payload: payload, existingHistoryApiRequest: state.employeeState.QualificationHistoryApiRequest, currentEmployee: state.employeeState.EmployeePersonalVM, qualificationHistoryData: state.employeeState.QualificationHistoryList.Entities }; })
        .switchMap((updatedPL) => {
            let empQualificationDetailsId: string = updatedPL.payload.Id;
            let empName: string = updatedPL.currentEmployee.FirstName + ' ' + updatedPL.currentEmployee.Surname;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Qualification history', empName, empQualificationDetailsId);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`TrainingDetail/${empQualificationDetailsId}`)
                .mergeMap((result) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Qualification history', empName, empQualificationDetailsId);
                    this._messenger.publish('snackbar', vm);
                    if (updatedPL.qualificationHistoryData.length == 1 && updatedPL.existingHistoryApiRequest.PageNumber > 1) {
                        updatedPL.existingHistoryApiRequest.PageNumber = updatedPL.existingHistoryApiRequest.PageNumber - 1;
                    }
                    return [
                        new employeeActions.EmployeeQualificationHistoryDeleteCompleteAction(true),
                        new employeeActions.EmployeeQualificationHistoryLoadAction(updatedPL.existingHistoryApiRequest)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Qualification history', empName)));
                })
        })

    @Effect()
    qualificationHistoryDetails$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_GET)
        .map(toPayload)
        .switchMap((payload) => {
            let empQualificationDetailsId: string = payload.EmployeeQualificationDetailsId;
            let params: URLSearchParams = new URLSearchParams();
            params.set('Id', empQualificationDetailsId);

            return this._data.get(`TrainingDetail/Getbyid`, { search: params })
                .map((res) => extractEmployeeQualificationHistoryDetails(res))
                .mergeMap((employeeQualificationDetails: TrainingDetails) => {
                    return [
                        new employeeActions.EmployeeQualificationHistoryGetCompleteAction(employeeQualificationDetails),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Qualification history', empQualificationDetailsId)));
                })
        })
}