import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { JobHistory } from '../models/job-history';
import { EmployeeFullEntityService } from '../services/employee-fullentity.service';
import { EmergencyContact } from '../models/emergency-contact.model';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { EmployeeContacts, EmployeeEmergencyContacts } from '../models/employee.model';
import {
    extractCountyData,
    extractEmployeeContactsData,
    extractEmployeeContactsWithAddressData,
    extractEmployeeEmergencyContactsData,
    extractEmployeeJobHistoryData,
    extractEmployeeJobHistoryPagingInfo,
    extractEmployeeSalarySelectOptionListData,
    mapEmployeeEmergencyContacts
} from '../common/extract-helpers';
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
export class EmployeeJobHistoryEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _employeeFullEntityService: EmployeeFullEntityService
        , private _messenger: MessengerService
    ) {

    }

    @Effect()
    addJobHistory$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_JOB_HISTORY_ADD)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: JobHistory, state) => { return { payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let data = pl.payload;
            let apiUrl = 'JobHistory';
            data.EmployeeId = pl.currentEmployee.Id;
            let empName: string = pl.currentEmployee.FirstName + ' ' + pl.currentEmployee.Surname;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Job history', empName);
            this._messenger.publish('snackbar', vm);
            return this._data.put(apiUrl, data)
                .map((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Job history', empName);
                    this._messenger.publish('snackbar', vm);
                    this._store.dispatch(new employeeActions.EmployeeJobHistoryLoadAction(true));
                    return new employeeActions.AddEmployeeJobHistoryCompletedAction(true);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Job history', empName)));
                })
        });

    @Effect()
    updateJobHistory$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_JOB_HISTORY_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: JobHistory, state) => { return { payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let data = pl.payload;
            let empName: string = pl.currentEmployee.FirstName + ' ' + pl.currentEmployee.Surname;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Job history', empName, pl.currentEmployee.Id);
            this._messenger.publish('snackbar', vm);
            let apiUrl = 'JobHistory';
            return this._data.post(apiUrl, data)
                .map((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Job history', empName, pl.currentEmployee.Id);
                    this._messenger.publish('snackbar', vm);
                    this._store.dispatch(new employeeActions.EmployeeJobHistoryLoadAction(true));
                    return new employeeActions.UpdateEmployeeJobHistoryCompletedAction(true);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Job history', pl.currentEmployee.Id)));
                })
        });


    @Effect()
    GetJobHistoryById$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_JOB_HISTORY_GET)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            //query param
            params.set('Id', payload.toString());
            //End of param           
            return this._data.get('JobHistory/Getbyid', { search: params })
                .map((res) => {
                    return new employeeActions.GetEmployeeJobHistoryCompletedAction(res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Job history', payload.toString())));
                })
        });

    @Effect()
    DeleteSalaryHistoryById$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_JOB_HISTORY_DELETE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: string, state) => { return { payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM, jobHistoryPaging: state.employeeState.JobHistoryPagingInfo, jobHistoryData: state.employeeState.JobHistoryList }; })
        .switchMap((pl) => {
            let payload = pl.payload;
            let empName: string = pl.currentEmployee.FirstName + ' ' + pl.currentEmployee.Surname;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Job history', empName, payload.toString());
            this._messenger.publish('snackbar', vm);
            return this._data.delete('JobHistory/' + payload.toString())
                .map((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Job history', empName, payload.toString());
                    this._messenger.publish('snackbar', vm);
                    if (pl.jobHistoryData.length == 1 && pl.jobHistoryPaging.PageNumber > 1) {
                        pl.jobHistoryPaging.PageNumber = pl.jobHistoryPaging.PageNumber - 1;
                    }
                    this._store.dispatch(new employeeActions.EmployeeJobHistoryLoadAction(true));
                    return new employeeActions.DeleteEmployeeSalaryHistoryCompletedAction(true);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Job history', payload.toString())));
                })
        });

    @Effect()
    loadEmployeeJobHistoryDetails$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_JOB_HISTORY_LOAD, employeeActions.ActionTypes.LOAD_EMPLOYEE_JOB_HISTORY_ON_PAGE_CHANGE, employeeActions.ActionTypes.LOAD_EMPLOYEE_JOB_HISTORY_ON_SORT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { toPayload: toPayload, _state: state.employeeState }; })
        .switchMap((payload) => {
            let empId: string = payload._state.EmployeePersonalVM.Id;
            let params: URLSearchParams = new URLSearchParams();
            params.set('JobHistoryByEmployeeIdFilter', empId);
            params.set('direction', "Asc");
            params.set('fields', `Id,JobTitle.Name+as+JobTitleName,Department.Name+as+DepartmentName,Site.SiteNameAndPostcode+as+SiteName,JobStartDate,JobFinishDate,IsCurrentJob`);

            //Paging
            if (payload._state.JobHistoryPagingInfo) {
                params.set('pageNumber', payload._state.JobHistoryPagingInfo.PageNumber.toString());
                params.set('pageSize', payload._state.JobHistoryPagingInfo.Count.toString());
            }
            else {
                params.set('pageNumber', '1');
                params.set('pageSize', '10');
            }
            //END OF paging

            //Sorting
            if (payload._state.JobHistorySortInfo) {
                params.set('sortField', payload._state.JobHistorySortInfo.SortField);
                params.set('direction', payload._state.JobHistorySortInfo.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            }
            else {
                params.set('sortField', 'JobStartDate');
                params.set('direction', 'desc');
            }
            //End of Sorting
            return this._data.get(`JobHistory/getspecificfields`, { search: params })
                .map((res) => new employeeActions.EmployeeJobHistoryLoadCompleteAction({ JobHistoryList: extractEmployeeJobHistoryData(res), JobHistoryPagingInfo: extractEmployeeJobHistoryPagingInfo(res) }))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Job history', empId)));
                })
        })


}