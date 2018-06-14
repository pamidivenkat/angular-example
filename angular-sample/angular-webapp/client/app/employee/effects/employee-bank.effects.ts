import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequest, AtlasApiResponse, AtlasApiRequestWithParams, AtlasParams } from '../../shared/models/atlas-api-response';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as employeeActions from '../actions/employee.actions';
import { BankDetails } from "../../employee/models/bank-details";
import { getAtlasParamValueByKey } from "./../../root-module/common/extract-helpers";
import { extractEmployeeBankDetails } from "../../employee/common/extract-helpers";

import { ObjectHelper } from './../../shared/helpers/object-helper';
import { MessengerService } from './../../shared/services/messenger.service';

import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import { MessageEvent } from './../../atlas-elements/common/models/message-event.enum';
import { CatchErrorAction } from "./../../shared/actions/error.actions";

@Injectable()
export class EmployeeBankDetailsEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService
    ) {

    }

    /*
    * This effect is used to get the selected employee bank details list
    */
    @Effect()
    employeeBankDetailsList$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_BANK_DETAILS_LOAD)
        .map((action: employeeActions.EmployeeBankDetailsListLoadAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let payload = pl._payload;
            let employeeId = pl.currentEmployee.Id;
            let params: URLSearchParams = new URLSearchParams();
            params.set('BankDetailByEmployeeIdFilter', employeeId)
            params.set('Direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            params.set('fields', `Id,Name,AccountName,AccountNumber,BankCode,Town,IsSalaryAccount`);
            params.set('pagenumber', payload.PageNumber.toString());
            params.set('pagesize', payload.PageSize.toString());
            params.set('SortField', payload.SortBy.SortField.toString());
            return this._data.get(`BankDetail/getspecificfields`, { search: params })
                .map((res) => new employeeActions.EmployeeBankDetailsListLoadCompleteAction(<AtlasApiResponse<BankDetails>>res.json()))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Bank details', null)));
                })
        });

    /*
 * This effect is used to get the selected employee bank details 
 */

    @Effect()
    loadBankDetailsById$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_BANK_DETAILS_BY_ID_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('Id', payload.EmployeeBankDetailsId);
            return this._data.get(`BankDetail/Getbyid`, { search: params })
                .map((res) => extractEmployeeBankDetails(res))
                .mergeMap((employeeBankDetails: BankDetails) => {
                    return [
                        new employeeActions.EmployeeBankDetailsByIdLoadCompleteAction(employeeBankDetails),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Bank details', null)));
                })

        });

    /*
    * Add employee bank details effect
    *
    */

    @Effect()
    bankDetailsAdd$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_BANK_DETAILS_ADD)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: BankDetails, state) => { return { _payload: payload, bankPagingInfo: state.employeeState.BankDetailsPagingInfo, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let employeeId = pl.currentEmployee.Id;
            pl._payload.EmployeeId = employeeId;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Bank details', pl._payload.AccountName);
            this._messenger.publish('snackbar', vm);
            return this._data.put(`BankDetail`, pl._payload)
                .mergeMap((res) => {
                    let atlasParams: AtlasParams[] = new Array();
                    atlasParams.push(new AtlasParams("EmployeeId", employeeId));
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Bank details', pl._payload.AccountName);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new employeeActions.EmployeeBankDetailsAddCompleteAction(true),
                        new employeeActions.EmployeeBankDetailsListLoadAction(new AtlasApiRequestWithParams(1, pl.bankPagingInfo.Count, 'AccountName', SortDirection.Descending, atlasParams))
                    ];
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Bank details', pl._payload.AccountName)));
                })
        });

    @Effect()
    bankDetailsUpdate$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_BANK_DETAILS_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: BankDetails, state) => { return { _payload: payload, bankPagingInfo: state.employeeState.BankDetailsPagingInfo, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let employeeId = pl.currentEmployee.Id;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Bank details', pl._payload.AccountName, pl._payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post(`BankDetail`, pl._payload)
                .mergeMap((res) => {
                    let atlasParams: AtlasParams[] = new Array();
                    atlasParams.push(new AtlasParams("EmployeeId", employeeId));
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Bank details', pl._payload.AccountName, pl._payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new employeeActions.EmployeeBankDetailsUpdateCompleteAction(true),
                        new employeeActions.EmployeeBankDetailsListLoadAction(new AtlasApiRequestWithParams(1, pl.bankPagingInfo.Count, 'AccountName', SortDirection.Descending, atlasParams))
                    ];
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Bank details', pl._payload.AccountName, pl._payload.Id)));
                })
        });

    @Effect()
    bankDetailsDelete$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_BANK_DETAILS_DELETE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: BankDetails, state) => { return { _payload: payload, bankPagingInfo: state.employeeState.BankDetailsPagingInfo, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let employeeId = pl.currentEmployee.Id;
            let bankDetailsId: string = pl._payload.Id;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Bank details', pl._payload.AccountName, pl._payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`BankDetail/${bankDetailsId}`)
                .mergeMap((res) => {
                    let atlasParams: AtlasParams[] = new Array();
                    atlasParams.push(new AtlasParams("EmployeeId", employeeId));
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Bank details', pl._payload.AccountName, pl._payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new employeeActions.EmployeeBankDetailsDeleteCompleteAction(true),
                        new employeeActions.EmployeeBankDetailsListLoadAction(new AtlasApiRequestWithParams(1, 10, 'AccountName', SortDirection.Descending, atlasParams))
                    ];
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Bank details', pl._payload.AccountName, pl._payload.Id)));
                })
        });



}