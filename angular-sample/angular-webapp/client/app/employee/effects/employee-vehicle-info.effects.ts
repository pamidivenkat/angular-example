import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { VehicleDetails } from '../models/vehicle-details';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { extractEmployeeVehicleEntities, extractEngineCCTypes, extractFuelTypes, extractPagingInfo } from '../common/extract-helpers';
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
import { MessageEvent } from './../../atlas-elements/common/models/message-event.enum';


@Injectable()
export class EmployeeVehicleInfoEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _employeeFullEntityService: EmployeeFullEntityService
        , private _messenger: MessengerService
    ) {

    }

    @Effect()
    loadEmployeeVehicleInfo$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_LOAD, employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_LOAD_ON_PAGE_CHANGE, employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_LOAD_ON_SORT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.employeeState }; })
        .switchMap((payLoad) => {
            let employeeId = payLoad._state.EmployeePersonalVM.Id;  
            let params: URLSearchParams = new URLSearchParams();
            params.set('action', 'getspecificfields');
            params.set('VehicleDetailsByEmployeeIdFilter', employeeId);
            params.set('fields', 'Id,Make,Model,InsuranceStartDate,DateIssued,ReturnDate');
            //Paging
            if (payLoad._state.VerhiclePagingInfo) {
                params.set('pageNumber', payLoad._state.VerhiclePagingInfo.PageNumber ? payLoad._state.VerhiclePagingInfo.PageNumber.toString() : '1');
                params.set('pageSize', payLoad._state.VerhiclePagingInfo.Count ? payLoad._state.VerhiclePagingInfo.Count.toString() : '10');
            }
            else {
                params.set('pageNumber', '1');
                params.set('pageSize', '10');
            }
            //End of Paging
            //Sorting
            if (payLoad._state.VehicleSortInfo) {
                params.set('sortField', payLoad._state.VehicleSortInfo.SortField);
                params.set('direction', payLoad._state.VehicleSortInfo.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            }
            else {
                params.set('sortField', 'Make');
                params.set('direction', 'desc');
            }
            //End of Sorting            
            return this._data.get('EmployeeVehicleDetail', { search: params })
                .map((res) => {
                    return new employeeActions.EmployeeVehicleInfoLoadCompleteAction({ VehiclesList: extractEmployeeVehicleEntities(res), VerhiclePagingInfo: extractPagingInfo(res) });
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Vehicle details', employeeId)));
                })
        });

    @Effect()
    loadEmployeeVehicleInfoById$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_GET_BY_ID)
        .map(toPayload)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('action', 'Getbyid');
            params.set('Id', data.Id);
            return this._data.get('EmployeeVehicleDetail', { search: params })
                .map((res) => {
                    return new employeeActions.EmployeeVehicleInfoLoadByIdCompleteAction(<AtlasApiResponse<VehicleDetails>>res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Vehicle details', data.Id)));
                })

        });

    @Effect()
    updateEmployeeVehicleInfo$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: VehicleDetails, state) => { return { _payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let data = pl._payload;
            let employeeId = pl.currentEmployee.Id;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Vehicle details', pl._payload.Model, pl._payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post('EmployeeVehicleDetail', data)
                .map((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Vehicle details', pl._payload.Model, pl._payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return new employeeActions.EmployeeVehicleInfoUpdateCompleteAction(<AtlasApiResponse<VehicleDetails>>res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Vehicle details', data.Id)));
                })
        });

    @Effect()
    deleteEmployeeVehicleInfo$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_DELETE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: VehicleDetails, state) => { return { _payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let data = pl._payload;
            let employeeId = pl.currentEmployee.Id;
            data.EmployeeId = employeeId;
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', data.Id);
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Vehicle details', pl._payload.Make, pl._payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete('EmployeeVehicleDetail', { search: params })
                .map((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Bank details', pl._payload.Make, pl._payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return new employeeActions.EmployeeVehicleInfoDeleteCompleteAction(true);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Vehicle details', pl._payload.Make, pl._payload.Id)));
                })
        })

    @Effect()
    loadVehicleEngineCCTypes$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_VEHICLE_ENGINECC_LOAD)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('action', 'getspecificfields');
            params.set('cid', '');
            params.set('fields', 'Id,EngineCC,Index');
            params.set('pagesize', '0');
            params.set('pagenumber', '0');
            params.set('sortField', 'Index');
            params.set('direction', 'asc');
            return this._data.get('VehicleEngineCC', { search: params })
                .map((res) => {
                    let result = extractEngineCCTypes(res.json().Entities);
                    return new employeeActions.EmployeeVehicleEngineCCLoadCompleteAction(result);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Engine CC', '')));
                })
        });

    @Effect()
    loadVehicleFuelTypes$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_VEHICLE_FUELTYPES_LOAD)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('action', 'getspecificfields');
            params.set('cid', '');
            params.set('fields', 'Id,FuelType,Index');
            params.set('pagesize', '0');
            params.set('pagenumber', '0');
            params.set('sortField', 'Index');
            params.set('direction', 'asc');
            return this._data.get('FuelTypes', { search: params })
                .map((res) => {
                    let result = extractFuelTypes(res.json().Entities);
                    return new employeeActions.EmployeeVehicleFuelTypesLoadCompleteAction(result);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Fuel types', '')));
                })
        })

    @Effect()
    addEmployeeVehicleInfo$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_ADD)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: VehicleDetails, state) => { return { _payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let data = pl._payload;
            data.EmployeeId = pl.currentEmployee.Id;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Vehicle details', pl._payload.Make);
            this._messenger.publish('snackbar', vm);
            return this._data.put('EmployeeVehicleDetail', data)
                .map((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Vehicle details', pl._payload.Make);
                    this._messenger.publish('snackbar', vm);
                    return new employeeActions.EmployeeVehicleInfoAddCompleteAction(<AtlasApiResponse<VehicleDetails>>res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Vehicle info', pl.currentEmployee.Id)));
                })
        });
}