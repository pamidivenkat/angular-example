import { extractPreviousEmployementEntities, extractPreviousEmployementPagingInfo } from '../common/extract-helpers';
import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { PreviousEmployment } from '../models/previous-employment';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { EmployeeFullEntityService } from '../services/employee-fullentity.service';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { RestClientService } from '../../shared/data/rest-client.service';
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
export class EmployeePreviousEmploymentHistoryEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _employeeFullEntityService: EmployeeFullEntityService
        , private _messenger: MessengerService
    ) {
    }

    @Effect()
    loadEmployeePreviousEmploymentHistory$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_LOAD, employeeActions.ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_LOAD_ON_PAGE_CHANGE, employeeActions.ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_LOAD_ON_SORT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.employeeState }; })
        .switchMap((payLoad) => {
            let employeeId = payLoad._state.EmployeePersonalVM.Id;
            let params: URLSearchParams = new URLSearchParams();
            params.set('PreviousEmploymentByEmployeeIdFilter', employeeId);
            //Paging
            if (payLoad._state.PreviousEmploymentPagingInfo) {
                params.set('pageNumber', payLoad._state.PreviousEmploymentPagingInfo.PageNumber ? payLoad._state.PreviousEmploymentPagingInfo.PageNumber.toString() : '1');
                params.set('pageSize', payLoad._state.PreviousEmploymentPagingInfo.Count ? payLoad._state.PreviousEmploymentPagingInfo.Count.toString() : '10');
            }
            else {
                params.set('pageNumber', '1');
                params.set('pageSize', '10');
            }
            //End of Paging
            //Sorting
            if (payLoad._state.PreviousEmploymentSortInfo) {
                params.set('sortField', payLoad._state.PreviousEmploymentSortInfo.SortField);
                params.set('direction', payLoad._state.PreviousEmploymentSortInfo.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            }
            else {
                params.set('sortField', 'Make');
                params.set('direction', 'desc');
            }
            //End of Sorting
            return this._data.get('PreviousEmployment', { search: params })
                .map((res) => {
                    return new employeeActions.EmployeePreviousEmploymentHistoryLoadCompleteAction({ PreviousEmploymentHistoryList: extractPreviousEmployementEntities(res), PreviousEmploymentPagingInfo: extractPreviousEmployementPagingInfo(res) });
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Previous employment', employeeId)));
                })
        });

    @Effect()
    addEmployeePreviousEmploymentHistory$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_ADD)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: PreviousEmployment, state) => { return { payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let data = pl.payload;
            data.EmployeeId = pl.currentEmployee.Id;
            let empName: string = pl.currentEmployee.FirstName + ' ' + pl.currentEmployee.Surname;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Previous employment', empName);
            this._messenger.publish('snackbar', vm);
            return this._data.put('PreviousEmployment', data)
                .map((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Previous employment', empName);
                    this._messenger.publish('snackbar', vm);
                    return new employeeActions.EmployeePreviousEmploymentHistoryAddCompleteAction(<AtlasApiResponse<PreviousEmployment>>res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Previous employment', empName)));
                })
        });

    @Effect()
    updateEmployeePreviousEmploymentHistory$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: PreviousEmployment, state) => { return { payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let data = pl.payload;
            let empName: string = pl.currentEmployee.FirstName + ' ' + pl.currentEmployee.Surname;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Previous employment', empName, pl.currentEmployee.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post('PreviousEmployment', data)
                .map((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Previous employment', empName, pl.currentEmployee.Id);
                    this._messenger.publish('snackbar', vm);
                    return new employeeActions.EmployeePreviousEmploymentHistoryUpdateCompleteAction(<AtlasApiResponse<PreviousEmployment>>res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Previous employment', pl.currentEmployee.Id)));
                })
        })

    @Effect()
    REMOVEEmployeePreviousEmploymentHistory$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_REMOVE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM, previousEmpPaging: state.employeeState.PreviousEmploymentPagingInfo, previousEmpHistoryData: state.employeeState.PreviousEmploymentHistoryList }; })
        .switchMap((pl) => {
            let data = pl.payload;
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', data.Id);
            let empName: string = pl.currentEmployee.FirstName + ' ' + pl.currentEmployee.Surname;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Previous employment', empName, data.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete('PreviousEmployment', { search: params })
                .map((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Previous employment', empName, data.Id);
                    this._messenger.publish('snackbar', vm);
                    if (pl.previousEmpHistoryData.length == 1 && pl.previousEmpPaging.PageNumber > 1) {
                        pl.previousEmpPaging.PageNumber = pl.previousEmpPaging.PageNumber - 1;
                    }
                    return new employeeActions.EmployeePreviousEmploymentHistoryRemoveCompleteAction(<AtlasApiResponse<PreviousEmployment>>res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Previous employment', data.Id)));
                })
        })
}