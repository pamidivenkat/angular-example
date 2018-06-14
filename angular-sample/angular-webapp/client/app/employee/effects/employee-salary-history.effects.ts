import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { SalaryHistory } from '../models/salary-history';
import { EmployeeFullEntityService } from '../services/employee-fullentity.service';
import { EmergencyContact } from '../models/emergency-contact.model';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { EmployeeContacts, EmployeeEmergencyContacts } from '../models/employee.model';
import {
    extractCountyData,
    extractEmployeeContactsData,
    extractEmployeeContactsWithAddressData,
    extractEmployeeEmergencyContactsData,
    mapEmployeeEmergencyContacts,
    extractEmployeeSalaryHistoryData,
    extractEmployeeSalarySelectOptionListData,
    extractEmployeeSalaryHistoryPagingInfo
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
export class EmployeeSalaryHistoryEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _employeeFullEntityService: EmployeeFullEntityService
        , private _messenger: MessengerService
    ) {

    }

    @Effect()
    addSalary$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_SALARY_ADD)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: SalaryHistory, state) => { return { payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let data = pl.payload;
            let apiUrl = 'SalaryHistory';
            data.EmployeeId = pl.currentEmployee.Id;
            let empName: string = pl.currentEmployee.FirstName + ' ' + pl.currentEmployee.Surname;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Salary history', empName);
            this._messenger.publish('snackbar', vm);
            return this._data.put(apiUrl, data)
                .map((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Salary history', empName);
                    this._messenger.publish('snackbar', vm);
                    this._store.dispatch(new employeeActions.EmployeeSalaryHistoryLoadAction(true));
                    return new employeeActions.AddEmployeeSalaryHistoryCompletedAction(true);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Salary history', empName)));
                })
        });

    @Effect()
    updateSalary$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_SALARY_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: SalaryHistory, state) => { return { payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let data = pl.payload;
            let apiUrl = 'SalaryHistory';
            let empName: string = pl.currentEmployee.FirstName + ' ' + pl.currentEmployee.Surname;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Salary history', empName, pl.currentEmployee.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post(apiUrl, data)
                .map((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Salary history', empName, pl.currentEmployee.Id);
                    this._messenger.publish('snackbar', vm);
                    this._store.dispatch(new employeeActions.EmployeeSalaryHistoryLoadAction(true));
                    return new employeeActions.UpdateEmployeeSalaryHistoryCompletedAction(true);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Salary history', pl.currentEmployee.Id)));
                })
        });


    @Effect()
    GetSalaryHistoryById$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_SALARY_GET)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            //query param
            params.set('Id', payload.toString());
            //End of param           
            return this._data.get('SalaryHistory/Getbyid', { search: params })
                .map((res) => {
                    return new employeeActions.GetEmployeeSalaryHistoryCompletedAction(res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Salary history', payload)));
                })
        });

    @Effect()
    DeleteSalaryHistoryById$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_SALARY_DELETE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: string, state) => { return { payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM, salaryHistoryPaging: state.employeeState.SalaryHistoryPagingInfo, salaryHistoryData: state.employeeState.SalaryHistoryList }; })
        .switchMap((pl) => {
            let payload = pl.payload;
            let empName: string = pl.currentEmployee.FirstName + ' ' + pl.currentEmployee.Surname;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Salary history', empName, payload);
            this._messenger.publish('snackbar', vm);
            return this._data.delete('SalaryHistory/' + payload.toString())
                .map((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Salary history', empName, payload);
                    this._messenger.publish('snackbar', vm);
                    if (pl.salaryHistoryData.length == 1 && pl.salaryHistoryPaging.PageNumber > 1) {
                        pl.salaryHistoryPaging.PageNumber = pl.salaryHistoryPaging.PageNumber - 1;
                    }
                    this._store.dispatch(new employeeActions.EmployeeSalaryHistoryLoadAction(true));
                    return new employeeActions.DeleteEmployeeSalaryHistoryCompletedAction(true);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Salary history', payload)));
                })
        });

    @Effect()
    loadEmployeeSalaryHistoryDetails$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_SALARY_HISTORY_LOAD, employeeActions.ActionTypes.LOAD_EMPLOYEE_SALARY_HISTORY_ON_PAGE_CHANGE, employeeActions.ActionTypes.LOAD_EMPLOYEE_SALARY_HISTORY_ON_SORT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { toPayload: toPayload, _state: state.employeeState }; })
        .switchMap((payload) => {
            let empId: string = payload._state.EmployeePersonalVM.Id;
            let params: URLSearchParams = new URLSearchParams();
            params.set('action', 'getspecificfields');
            params.set('SalaryHistoryByEmployeeIdFilter', empId);
            params.set('fields', 'Id,JobTitle.Name as JobTitleName,StartDate,FinishDate,Pay,ReasonForChange,IsCurrentSalary');

            //Paging
            if (payload._state.SalaryHistoryPagingInfo) {
                params.set('pageNumber', payload._state.SalaryHistoryPagingInfo.PageNumber.toString());
                params.set('pageSize', payload._state.SalaryHistoryPagingInfo.Count.toString());
            }
            else {
                params.set('pageNumber', '1');
                params.set('pageSize', '10');
            }
            //END OF paging

            //Sorting
            if (payload._state.SalaryHistorySortInfo) {
                params.set('sortField', payload._state.SalaryHistorySortInfo.SortField);
                params.set('direction', payload._state.SalaryHistorySortInfo.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            }
            else {
                params.set('sortField', 'StartDate');
                params.set('direction', 'desc');
            }
            //End of Sorting  
            return this._data.get(`SalaryHistory`, { search: params })
                .map((res) => {
                    return new employeeActions.EmployeeSalaryHistoryLoadCompleteAction({ SalaryHistoryList: extractEmployeeSalaryHistoryData(res), SalaryHistoryPagingInfo: extractEmployeeSalaryHistoryPagingInfo(res) });
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Salary history list', payload._state.EmployeeId)));
                })
        })


}