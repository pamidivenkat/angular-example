import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { extractEmployeeEducationHistoryDetails } from '../common/extract-helpers';
import { EducationDetails } from '../models/education-history.model';
import { AtlasApiRequest, AtlasApiResponse } from '../../shared/models/atlas-api-response';
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
export class EducationHistoryEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService
    ) {

    }

    @Effect()
    educationHistoryListDetails$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_EDUCATION_HISTORY_LOAD)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { payload: payload, _empPersonal: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let payload = pl.payload;
            let params: URLSearchParams = new URLSearchParams();
            let apiRequest: AtlasApiRequest = <AtlasApiRequest>payload
            params.set('EducationDetailByEmployeeIdFilter', pl._empPersonal.Id)
            params.set('Direction', apiRequest.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            params.set('fields', `Id,Institution,Qualification,StartDate,EndDate`);
            params.set('pagenumber', apiRequest.PageNumber.toString());
            params.set('pagesize', apiRequest.PageSize.toString());
            params.set('SortField', apiRequest.SortBy.SortField);
            return this._data.get(`EducationDetail/getspecificfields`, { search: params })
                .map((res) => new employeeActions.EmployeeEducationHistoryLoadCompleteAction(<AtlasApiResponse<EducationDetails>>res.json()))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Education history', pl._empPersonal.FirstName)));
                })
        })

    @Effect()
    educationHistoryCreate$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_EDUCATION_HISTORY_CREATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: EducationDetails, state) => { return { payload: payload, existingHistoryApiRequest: state.employeeState.EducationHistoryApiRequest, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((updatedPL) => {
            let empName: string = updatedPL.currentEmployee.FirstName + ' ' + updatedPL.currentEmployee.Surname;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Education history', empName);
            this._messenger.publish('snackbar', vm);
            updatedPL.payload.EmployeeId = updatedPL.currentEmployee.Id;
            return this._data.put(`EducationDetail`, updatedPL.payload)
                .mergeMap((result) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Education history', empName);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new employeeActions.EmployeeEducationHistoryCreateCompleteAction(true),
                        new employeeActions.EmployeeEducationHistoryLoadAction(updatedPL.existingHistoryApiRequest)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Education history', empName)));
                })
        })


    @Effect()
    educationHistoryUpdate$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_EDUCATION_HISTORY_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { payload: payload, existingHistoryApiRequest: state.employeeState.EducationHistoryApiRequest, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((updatedPL) => {
            let empName: string = updatedPL.currentEmployee.FirstName + ' ' + updatedPL.currentEmployee.Surname;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Education history', empName, updatedPL.currentEmployee.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post(`EducationDetail`, updatedPL.payload)
                .mergeMap((result) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Education history', empName, updatedPL.currentEmployee.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new employeeActions.EmployeeEducationHistoryUpdateCompleteAction(true),
                        new employeeActions.EmployeeEducationHistoryLoadAction(updatedPL.existingHistoryApiRequest)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Education history', empName)));
                })
        })

    @Effect()
    educationHistoryDelete$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_EDUCATION_HISTORY_DELETE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { payload: payload, existingHistoryApiRequest: state.employeeState.EducationHistoryApiRequest, currentEmployee: state.employeeState.EmployeePersonalVM, educationHistoryData: state.employeeState.EducationHistoryList.Entities }; })
        .switchMap((updatedPL) => {
            let empEducationDetailsId: string = updatedPL.payload.Id;
            let empName: string = updatedPL.currentEmployee.FirstName + ' ' + updatedPL.currentEmployee.Surname;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Education history', empName, empEducationDetailsId);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`EducationDetail/${empEducationDetailsId}`)
                .mergeMap((result) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Education history', empName, empEducationDetailsId);
                    if (updatedPL.educationHistoryData.length == 1 && updatedPL.existingHistoryApiRequest.PageNumber > 1) {
                        updatedPL.existingHistoryApiRequest.PageNumber = updatedPL.existingHistoryApiRequest.PageNumber - 1;
                    }
                    this._messenger.publish('snackbar', vm);
                    return [
                        new employeeActions.EmployeeEducationHistoryDeleteCompleteAction(true),
                        new employeeActions.EmployeeEducationHistoryLoadAction(updatedPL.existingHistoryApiRequest)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Education history', empName)));
                })
        })

    @Effect()
    educationHistoryDetails$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_EDUCATION_HISTORY_GET)
        .map(toPayload)
        .switchMap((payload) => {
            let empEducationDetailsId: string = payload.EmployeeEducationDetailsId;
            let params: URLSearchParams = new URLSearchParams();
            params.set('Id', empEducationDetailsId);
            return this._data.get(`EducationDetail/Getbyid`, { search: params })
                .map((res) => extractEmployeeEducationHistoryDetails(res))
                .mergeMap((employeeEducationDetails: EducationDetails) => {
                    return [
                        new employeeActions.EmployeeEducationHistoryGetCompleteAction(employeeEducationDetails),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Education history', empEducationDetailsId)));
                })
        })

}