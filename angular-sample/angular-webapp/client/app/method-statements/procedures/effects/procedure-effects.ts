import { Procedure } from '../models/procedure';
import { getAtlasParamValueByKey } from '../../../root-module/common/extract-helpers';
import { extractPagingInfo } from '../../../employee/common/extract-helpers';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Http, URLSearchParams } from '@angular/http';
import { AtlasApiResponse, AtlasParams } from '../../../shared/models/atlas-api-response';
import * as errorActions from '../../../shared/actions/error.actions';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import { MessengerService } from '../../../shared/services/messenger.service';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import * as ProcedureActions from '../actions/procedure-actions';
import * as ManageMSActions from '../../manage-methodstatements/actions/manage-methodstatement.actions';
import { ProcedureSnackBarVm } from '../common/procedure-snack-bar-vm';
import { isNullOrUndefined } from 'util';
import { EffectsHelper } from '../../../shared/helpers/effects-helper';


@Injectable()
export class ProcedureEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>, private _messenger: MessengerService) {

    }

    @Effect()
    ProcedureData$: Observable<Action> = this._actions$.ofType(ProcedureActions.ActionTypes.LOAD_PROCEDURES)
        .map((action: ProcedureActions.LoadProceduresAction) => action.payload)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,Name,ProcedureGroup.Name as ProcedureGroupName,ProcedureGroupId,Description,IsExample');
            params.set('ProcedureByGroupId', getAtlasParamValueByKey(data.Params, "ProcedureGroup"));
            params.set('isExample', getAtlasParamValueByKey(data.Params, "example"));
            params.set('pageNumber', data.PageNumber.toString());
            params.set('pageSize', data.PageSize.toString());
            params.set('sortField', data.SortBy.SortField);
            params.set('direction', data.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            return this._data.get('Procedure', { search: params })
        })
        .map((res) => {
            return new ProcedureActions.LoadProceduresCompleteAction(<AtlasApiResponse<Procedure>>res.json());
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Procedure', '')));
        });


    @Effect()
    procedureCopy$: Observable<Action> = this._actions$.ofType(ProcedureActions.ActionTypes.COPY_PROCEDURE)
        .map((action: ProcedureActions.CopyProcedureAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _procedureState: state.procedureState }; })
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            let vm = ObjectHelper.createInsertInProgressSnackbarMessageGeneric<ProcedureSnackBarVm>(ProcedureSnackBarVm, 'Procedure', pl._payload.Name);
            this._messenger.publish('snackbar', vm);
            pl._payload.Id = '';
            return this._data.put('Procedure', pl._payload, { search: params })
                .mergeMap((res) => {
                    //after copying need to refresh procedure data grid                   
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessageGeneric<ProcedureSnackBarVm>(ProcedureSnackBarVm, 'Procedure', pl._payload.Name);
                    this._messenger.publish('snackbar', vm);

                    if (!isNullOrUndefined(pl._procedureState) &&
                        !isNullOrUndefined(pl._procedureState.CustomProcedureRequest)) {
                        pl._procedureState.CustomProcedureRequest.PageNumber = 1;
                    }

                    return [
                        new ProcedureActions.CopyProcedureCompleteAction(<Procedure>res.json()),
                        new ProcedureActions.LoadProceduresAction(pl._procedureState.CustomProcedureRequest)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Copy, 'Copy procedure', '')));
                })
        });

    @Effect()
    SetProcedureAdd$: Observable<Action> = this._actions$.ofType(ProcedureActions.ActionTypes.ADD_PROCEDURE
        , ManageMSActions.ActionTypes.ADD_PROCEDURE_FOR_MS)
        .map(EffectsHelper.toActionPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _procedureState: state.procedureState
                , _savedRequestFromMSState: state.manageMethodStatementState.ProcedureForMSRequest
            };
        })
        .switchMap((pl) => {
            let payload = pl._payload.payload;
            let params: URLSearchParams = new URLSearchParams();
            let message = "Adding Procedure as " + payload.Name;
            if (isNullOrUndefined(payload.Description))
                payload.Description = ""; // saving empty description
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Procedure', payload.Name);
            this._messenger.publish('snackbar', vm);
            return this._data.put('Procedure', payload)
                .mergeMap((res) => {
                    vm = ObjectHelper.createInsertCompleteSnackbarMessage('Procedure', payload.Name);
                    this._messenger.publish('snackbar', vm);
                    if (pl._payload.actionType === ProcedureActions.ActionTypes.ADD_PROCEDURE) {
                        if (!isNullOrUndefined(pl._procedureState) &&
                            !isNullOrUndefined(pl._procedureState.CustomProcedureRequest)) {
                            pl._procedureState.CustomProcedureRequest.PageNumber = 1;
                        }
                        return [
                            new ProcedureActions.AddProcedureCompleteAction(<Procedure>res.json()),
                            new ProcedureActions.LoadProceduresAction(pl._procedureState.CustomProcedureRequest)
                        ];
                    } else {
                        return [
                            new ManageMSActions.LoadProceduresForMSAction(pl._savedRequestFromMSState)
                        ];
                    }
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Procedure', payload.Name)));
                })
        });

    @Effect()
    SetProcedureUpdate$: Observable<Action> = this._actions$.ofType(ProcedureActions.ActionTypes.UPDATE_PROCEDURE)
        .map((action: ProcedureActions.UpdateProcedureAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.procedureState.CustomProcedureRequest }; })
        .switchMap((pl) => {
            let payload = pl._payload;
            let params: URLSearchParams = new URLSearchParams();
            let message = "Updating Procedure as " + payload.Name;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Procedure', payload.Name, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post('Procedure', payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Procedure', payload.Name, payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new ProcedureActions.UpdateProcedureCompleteAction(<Procedure>res.json()),
                        new ProcedureActions.LoadProceduresAction(pl._savedRequestFromState)
                    ]
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Procedure', payload.Name, payload.Id)));
                })
        });


    @Effect()
    procedureDetailsDelete$: Observable<Action> = this._actions$.ofType(ProcedureActions.ActionTypes.REMOVE_PROCEDURE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _procedureState: state.procedureState }; })
        .switchMap((pl) => {
            let Id = pl._payload.Id;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Procedure', pl._payload.Name, pl._payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`Procedure/${Id}`)
                .mergeMap((res) => {
                    let atlasParams: AtlasParams[] = new Array();
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Procedure', pl._payload.Name, pl._payload.Id);
                    this._messenger.publish('snackbar', vm);
                    if (!isNullOrUndefined(pl._procedureState) &&
                        !isNullOrUndefined(pl._procedureState.CustomProcedureRequest)) {
                        pl._procedureState.CustomProcedureRequest.PageNumber = 1;
                    }
                    return [

                        new ProcedureActions.RemoveProcedureCompleteAction(true),
                        new ProcedureActions.LoadProceduresAction(pl._procedureState.CustomProcedureRequest)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Procedure', pl._payload.Name, pl._payload.Id)));
                })
        });

    @Effect()
    procedureDetailsLoadById$: Observable<Action> = this._actions$.ofType(ProcedureActions.ActionTypes.LOAD_PROCEDURE_BY_ID)
        .map((action: ProcedureActions.LoadProcedureByIdAction) => action.payload)
        .switchMap((pl) => {
            let url: string = 'Procedure/' + pl.Id;
            if (pl.IsExample) {
                url += "?example=true";
            }
            return this._data.get(url)
                .map((res) => {
                    return new ProcedureActions.LoadProcedureByIdCompleteAction(<Procedure>res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Load Procedure', pl.Id)));
                })
        });

    @Effect()
    loadExampleProceduresTotalCount$: Observable<Action> = this._actions$.ofType(ProcedureActions.ActionTypes.LOAD_EXAMPLE_PROCEDURES_TOTALCOUNT)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id');
            params.set('isExample', 'true');
            params.set('pageNumber', '1');
            params.set('pageSize', '1');
            params.set('sortField', 'Id');
            params.set('direction', 'asc');
            return this._data.get('Procedure', { search: params })
        })
        .map((res) => {
            let response = <AtlasApiResponse<Procedure>>res.json();
            return new ProcedureActions.LoadExampleProceduresTotalCountCompleteAction(response.PagingInfo.TotalCount);
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Example Procedure', '')));
        })

    @Effect()
    loadProceduresTotalCount$: Observable<Action> = this._actions$.ofType(ProcedureActions.ActionTypes.LOAD_PROCEDURES_TOTALCOUNT)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id');
            params.set('isExample', 'false');
            params.set('pageNumber', '1');
            params.set('pageSize', '1');
            params.set('sortField', 'Id');
            params.set('direction', 'asc');
            return this._data.get('Procedure', { search: params })
        })
        .map((res) => {
            let response = <AtlasApiResponse<Procedure>>res.json();
            return new ProcedureActions.LoadProceduresTotalCountCompleteAction(response.PagingInfo.TotalCount);
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Procedures Count', '')));
        })
}