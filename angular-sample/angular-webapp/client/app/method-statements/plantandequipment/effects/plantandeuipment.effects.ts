import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequest, AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';
import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { of } from 'rxjs/observable/of';
import * as plantAndEquipmentActions from '../actions/plantequipment-actions';
import * as fromRoot from '../../../shared/reducers/index';
import { Http, URLSearchParams } from '@angular/http';
import { getAtlasParamValueByKey } from "../../../root-module/common/extract-helpers";
import { ActionTypes } from '../../../document/document-details/actions/document-details.actions';
import { MessengerService } from '../../../shared/services/messenger.service';
import * as errorActions from '../../../shared/actions/error.actions';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import { extractDocumentDetails } from '../../../document/document-details/common/document-details-extract-helper';
import { PlantAndEquipment } from "./../models/plantandequipment";
import { ObjectHelper } from '../../../shared/helpers/object-helper';

@Injectable()
export class PlantAndEquipmentEffects {

    /*
    * This effect is used to get the plant and equipment list
    */
    @Effect()
    getPlantAndEquipmentList$: Observable<Action> = this._actions$.ofType(plantAndEquipmentActions.ActionTypes.LOAD_PLANTANDEQUIPMENT)
        .map((action: plantAndEquipmentActions.LoadPlantandequipmentAction) => action.payload)
        .switchMap((payload) => {
            let apiRequest = <AtlasApiRequestWithParams>payload;
            let params: URLSearchParams = new URLSearchParams();
            params.set('Direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            params.set('fields', `Id,Name,AssetRefNo,UsedFor,SpecialRequirements`);
            params.set('pagenumber', payload.PageNumber.toString());
            params.set('pagesize', payload.PageSize.toString());
            params.set('SortField', payload.SortBy.SortField.toString());
            return this._data.get(`plantequipment`, { search: params })
                .map((res) =>
                    new plantAndEquipmentActions.LoadPlantandequipmentCompleteAction(res.json()));

        });

    @Effect()
    getSelectedPlantAndEquipment$: Observable<Action> = this._actions$.ofType(plantAndEquipmentActions.ActionTypes.LOAD_SELECTED_PLANTANDEQUIPMENT)
        .map((action: plantAndEquipmentActions.LoadSelectedPlantandequipmentAction) => action.payload)
        .switchMap((payload) => {
            let plantAndEquipmentId = payload;
            let params: URLSearchParams = new URLSearchParams();
            params.set('Id', plantAndEquipmentId);
            return this._data.get(`plantequipment`, { search: params })
                .map((res) =>
                    new plantAndEquipmentActions.LoadSelectedPlantandequipmentCompleteAction(res.json()))

        });

    @Effect()
    addPlantAndEquipment$: Observable<Action> = this._actions$.ofType(plantAndEquipmentActions.ActionTypes.ADD_PLANTANDEQUIPMENT)
        .map((action: plantAndEquipmentActions.AddPlantandequipmentAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.plantAndEquipmentState.currentApiRequest }; })
        .switchMap((pl) => {
            let payload = pl._payload;
            let vm = ObjectHelper.operationInProgressSnackbarMessage("Adding plant & equipment " + pl._payload.Name);
            this._messenger.publish('snackbar', vm);
            return this._data.put(`plantequipment`, payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage("Adding plant & equipment " + pl._payload.Name);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new plantAndEquipmentActions.AddPlantandequipmentCompleteAction(<PlantAndEquipment>res.json()),
                        new plantAndEquipmentActions.LoadPlantandequipmentAction(pl._savedRequestFromState)
                    ]
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Procedure', payload.Id)));
                })
        });


    @Effect()
    updatePlantAndEquipment$: Observable<Action> = this._actions$.ofType(plantAndEquipmentActions.ActionTypes.UPDATE_PLANTANDEQUIPMENT)
        .map((action: plantAndEquipmentActions.UpdatePlantandequipmentAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.plantAndEquipmentState.currentApiRequest }; })
        .switchMap((pl) => {
            let payload = pl._payload;
            let vm = ObjectHelper.operationInProgressSnackbarMessage("Updating plant & equipment " + pl._payload.Name);
            this._messenger.publish('snackbar', vm);
            return this._data.post(`plantequipment`, payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage("Updating plant & equipment " + pl._payload.Name);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new plantAndEquipmentActions.UpdatePlantandequipmentCompleteAction(<PlantAndEquipment>res.json()),
                        new plantAndEquipmentActions.LoadPlantandequipmentAction(pl._savedRequestFromState)
                    ]
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Procedure', payload.Id)));
                })
        });

    @Effect()
    plantEquipmentDelete$: Observable<Action> = this._actions$.ofType(plantAndEquipmentActions.ActionTypes.REMOVE_PLANTANDEQUIPMENT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.plantAndEquipmentState.currentApiRequest }; })
        .switchMap((pl) => {
            let Id = pl._payload.Id;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Plant & Equipment ', pl._payload.Name, pl._payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`plantequipment/${Id}`)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Plant & Equipment ', pl._payload.Name, pl._payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new plantAndEquipmentActions.RemovePlantandequipmentCompleteAction(true),
                        new plantAndEquipmentActions.LoadPlantandequipmentAction(pl._savedRequestFromState)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Plant & Equipment', pl._payload.Name, pl._payload.Id)));
                })
        });

    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _messenger: MessengerService
    ) {

    }
    // End of constructor
}
