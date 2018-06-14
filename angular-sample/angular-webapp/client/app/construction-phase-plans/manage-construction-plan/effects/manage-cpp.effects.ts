import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import * as fromRoot from './../../../shared/reducers/index';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import * as MangeCPPActions from '../actions/manage-cpp.actions';
import { Http, URLSearchParams } from '@angular/http';
import { AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import * as errorActions from './../../../shared/actions/error.actions';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { ConstructionPhasePlan, CPPAdditionalInfo } from './../../models/construction-phase-plans';
import { getAtlasParamValueByKey } from './../../../root-module/common/extract-helpers';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';

import { MessengerService } from './../../../shared/services/messenger.service';
import { ObjectHelper } from './../../../shared/helpers/object-helper';

@Injectable()
export class MangeConstructionPhasePlanEffects {
    private _objectType: string = "Construction Phase Plan";
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>, private _messenger: MessengerService) {

    }
    @Effect()
    loadConstructionPhasePlanById$: Observable<Action> = this._actions$.ofType(MangeCPPActions.ActionTypes.LOAD_CPP_BY_ID)
        .map((action: MangeCPPActions.LoadCPPByIdAction) => action.payload)
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            let url = 'constructionphaseplan/' + pl.Id;
            params.set('example', pl.IsExample ? 'true' : 'false');
            return this._data.get(url, { search: params });
        })
        .map((res) => {
            return new MangeCPPActions.LoadCPPByIdCompleteAction(<ConstructionPhasePlan>res.json());
        }).catch((error) => {
            return Observable
                .of(new errorActions
                    .CatchErrorAction(new AtlasApiError(error
                        , MessageEvent.Load
                        , this._objectType
                        , null)))
        });

    @Effect()
    loadCPPAdditionalInfoById$: Observable<Action> = this._actions$.ofType(MangeCPPActions.ActionTypes.LOAD_CPP_CLIENT_DETAILS_ID)
        .map((action: MangeCPPActions.LoadCPPClientDetailsByIdAction) => action.payload)
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('example', pl.IsExample ? 'true' : 'false');
            let url = 'CommercialClient/' + pl.Id;
            return this._data.get(url, { search: params });
        })
        .map((res) => {
            return new MangeCPPActions.LoadCPPClientDetailsByIdCompleteAction(<CPPAdditionalInfo>res.json());
        }).catch((error) => {
            return Observable
                .of(new errorActions
                    .CatchErrorAction(new AtlasApiError(error
                        , MessageEvent.Load
                        , this._objectType
                        , 'commercial client')))
        });

    @Effect()
    updateCPP$: Observable<Action> = this._actions$.ofType(MangeCPPActions.ActionTypes.UPDATE_CPP)
        .map((action: MangeCPPActions.UpdateCPPAction) => action.payload)
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            let url = 'constructionphaseplan';
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, pl.Name, pl.Id);
            if (pl.StatusId == 2) {
                pl.StatusId = 1; //Update live CPP to pending when updated.
            }
            this._messenger.publish('snackbar', vm);
            return this._data.post(url, pl, { search: params })
                .map((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, pl.Name, pl.Id);
                    this._messenger.publish('snackbar', vm);
                    return new MangeCPPActions.UpdateCPPCompleteAction(<ConstructionPhasePlan>res.json());
                }).catch((error) => {
                    return Observable
                        .of(new errorActions
                            .CatchErrorAction(new AtlasApiError(error
                                , MessageEvent.Update
                                , this._objectType
                                , pl.Name, pl.Id)));
                })
        });

    @Effect()
    addCPP$: Observable<Action> = this._actions$.ofType(MangeCPPActions.ActionTypes.ADD_CPP)
        .map((action: MangeCPPActions.AddCPPAction) => action.payload)
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            let url = 'constructionphaseplan';
            //params.set('example', pl.IsExample ? 'true' : 'false');
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage(this._objectType, pl.Name);
            this._messenger.publish('snackbar', vm);
            return this._data.put(url, pl, { search: params })
                .map((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage(this._objectType, pl.Name);
                    this._messenger.publish('snackbar', vm);
                    return new MangeCPPActions.AddCPPCompleteAction(<ConstructionPhasePlan>res.json());
                }).catch((error) => {
                    return Observable
                        .of(new errorActions
                            .CatchErrorAction(new AtlasApiError(error
                                , MessageEvent.Create
                                , this._objectType
                                , pl.Name)));
                })
        });

    @Effect()
    updateCommercialClient$: Observable<Action> = this._actions$.ofType(MangeCPPActions.ActionTypes.UPDATE_CPP_CLIENT_DETAILS)
        .map((action: MangeCPPActions.UpdateCPPClientDetailsAction) => action.payload)
        .switchMap((pl) => {
            let url = 'CommercialClient';
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, 'commercial client', pl.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post(url, pl)
                .map((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, '', pl.Id);
                    this._messenger.publish('snackbar', vm);
                    return new MangeCPPActions.UpdateCPPClientDetailsCompleteAction(<CPPAdditionalInfo>res.json());
                }).catch((error) => {
                    return Observable
                        .of(new errorActions
                            .CatchErrorAction(new AtlasApiError(error
                                , MessageEvent.Update
                                , this._objectType
                                , pl.Id)));
                })
        });

    @Effect()
    addCPPCommercialClientDtls$: Observable<Action> = this._actions$.ofType(MangeCPPActions.ActionTypes.ADD_CPP_CLIENT_DETAILS)
        .map((action: MangeCPPActions.AddCPPClientDetailsAction) => action.payload)
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            let url = 'CommercialClient';
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage(this._objectType, pl.Client);
            this._messenger.publish('snackbar', vm);
            return this._data.put(url, pl, { search: params })
                .map((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage(this._objectType, pl.Client);
                    this._messenger.publish('snackbar', vm);
                    return new MangeCPPActions.AddCPPClientDetailsCompleteAction(<CPPAdditionalInfo>res.json());
                }).catch((error) => {
                    return Observable
                        .of(new errorActions
                            .CatchErrorAction(new AtlasApiError(error
                                , MessageEvent.Create
                                , this._objectType
                                , pl.Client)));
                })
        });

    @Effect()
    saveCPPtoAtlas$: Observable<Action> = this._actions$.ofType(MangeCPPActions.ActionTypes.SAVE_CPP_TO_ATLAS)
        .map((action: MangeCPPActions.SaveCPPtoAtlasAction) => action.payload)
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('pdf', 'true');
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage("Construction phase plan", pl.FileName);
            this._messenger.publish('snackbar', vm);
            return this._data.post('constructionphaseplan', pl, { search: params })
                .map((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage("Construction phase plan", pl.FileName);
                    this._messenger.publish('snackbar', vm);
                    return new MangeCPPActions.SaveCPPtoAtlasCompleteAction(res.json());
                }).catch((error) => {
                    return Observable
                        .of(new errorActions
                            .CatchErrorAction(new AtlasApiError(error
                                , MessageEvent.Create
                                , 'Construction Phase Plan'
                                , pl.FileName)));
                });
        });

    @Effect()
    deleteDocument$: Observable<Action> = this._actions$.ofType(MangeCPPActions.ActionTypes.REMOVE_DOCUMENT)
        .switchMap((action) => {
            let apiUrl = 'document/' + action.payload.Id;
            return this._data.delete(apiUrl)
        })
        .map((res) => {
            return new MangeCPPActions.RemoveDocumentCompleteAction();
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, this._objectType, '')));
        });
}