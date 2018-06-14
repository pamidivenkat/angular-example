import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import * as coshhInventoryActions from '../actions/coshh-inventory.actions';
import { Http, URLSearchParams } from '@angular/http';
import { AtlasApiResponse, AtlasApiRequestWithParams } from '../../shared/models/atlas-api-response';
import * as errorActions from '../../shared/actions/error.actions';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { COSHHInventory } from '../models/coshh-inventory';

import { MessengerService } from '../../shared/services/messenger.service';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { extractPagingInfo, extractCoshhInventoryList } from '../common/extract-helper';

@Injectable()
export class COSHHInventoryEffects {
    private _objectType: string = "COSHH Inventory";
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>, private _messenger: MessengerService) {

    }

    @Effect()
    COSHHInventoryListData$: Observable<Action> = this._actions$.ofType(coshhInventoryActions.ActionTypes.COSHHINVENTORY_LOAD)
        .map(toPayload)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id, Substance, ReferenceNumber, Manufacturer, Quantity');
            params.set('isExample', 'false');
            params.set('pageNumber', data.PageNumber.toString());
            params.set('pageSize', data.PageSize.toString());
            params.set('sortField', data.SortBy.SortField);
            params.set('direction', data.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            return this._data.get('coshhinventory', { search: params })
        })
        .map(res => {
            return new coshhInventoryActions.COSHHInventoryLoadComplete({ CoshhInventoryList: extractCoshhInventoryList(res), COSHHInventoryPagingInfo: extractPagingInfo(res) });
        }
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    @Effect()
    addCoshhInventory$: Observable<Action> = this._actions$.ofType(coshhInventoryActions.ActionTypes.COSHHINVENTORY_ADD)
        .map((action: coshhInventoryActions.AddCOSHHInventoryAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.coshhInventoryState.currentApiRequest }; })
        .switchMap((pl) => {
            let payload = pl._payload;
            let vm = ObjectHelper.operationInProgressSnackbarMessage("Creating Coshh inventory item" + pl._payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.put(`coshhinventory`, payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage("Coshh inventory item created successfully" + pl._payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new coshhInventoryActions.COSHHInventoryLoad(pl._savedRequestFromState)
                    ]
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'COSHH INVENTORY', null, payload.Id)));
                })
        });

    @Effect()
    updateCoshhInventory$: Observable<Action> = this._actions$.ofType(coshhInventoryActions.ActionTypes.COSHHINVENTORY_UPDATE)
        .map((action: coshhInventoryActions.AddCOSHHInventoryAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.coshhInventoryState.currentApiRequest }; })
        .switchMap((pl) => {
            let payload = pl._payload;
            let vm = ObjectHelper.operationInProgressSnackbarMessage("Updating Coshh inventory item");
            this._messenger.publish('snackbar', vm);
            return this._data.post(`coshhinventory`, payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage("Coshh inventory item updated successfully");
                    this._messenger.publish('snackbar', vm);
                    return [
                        new coshhInventoryActions.COSHHInventoryLoad(pl._savedRequestFromState)
                    ]
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'COSHH INVENTORY',null, payload.Id)));
                })
        });

    @Effect()
    DeleteCoshInventory$: Observable<Action> = this._actions$.ofType(coshhInventoryActions.ActionTypes.COSHHINVENTORY_DELETE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.coshhInventoryState.currentApiRequest }; })
        .switchMap((pl) => {
            let Id = pl._payload.Id;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Coshh Inventory ', pl._payload.Substance, pl._payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`coshhinventory/${Id}`)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Coshh Inventory ', pl._payload.Substance, pl._payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new coshhInventoryActions.COSHHInventoryLoad(pl._savedRequestFromState)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'COSHH INVENTORY', pl._payload.Name, pl._payload.Id)));
                })
        });

    @Effect()
    getSelectedCoshhInventory$: Observable<Action> = this._actions$.ofType(coshhInventoryActions.ActionTypes.COSHHINVENTORY_VIEW)
        .map((action: coshhInventoryActions.ViewCoshhInventoryAction) => action.payload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('Id', payload);
            return this._data.get(`coshhinventory`, { search: params })
                .map((res) =>
                    new coshhInventoryActions.ViewCoshhInventoryCompleteAction(res.json()))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, '')));
                });
        });
}