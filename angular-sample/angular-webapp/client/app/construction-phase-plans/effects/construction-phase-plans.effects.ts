import { isNullOrUndefined } from 'util';
import { extractConstructionPhasePlansPagingInfo, extractConstructionPhasePlansListData } from '../common/extract-helper';
import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import * as ConstructionPhasePlanActions from '../actions/construction-phase-plans.actions';
import { Http, URLSearchParams } from '@angular/http';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import * as errorActions from '../../shared/actions/error.actions';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { ConstructionPhasePlan } from '../models/construction-phase-plans';
import { getAtlasParamValueByKey } from '../../root-module/common/extract-helpers';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';

import { MessengerService } from '../../shared/services/messenger.service';
import { ObjectHelper } from '../../shared/helpers/object-helper';

@Injectable()
export class ConstructionPhasePlanListEffects {
    private _objectType: string = "Construction phase plan";
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>, private _messenger: MessengerService) {

    }
    @Effect()
    loadConstructionPhasePlansList$: Observable<Action> = this._actions$.ofType(ConstructionPhasePlanActions.ActionTypes.CONSTRUCTION_PHASE_PLANS_LOAD)
        .map((action: ConstructionPhasePlanActions.ConstructionPhasePlansLoadAction) => action.payload)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,Name,ReferenceNumber,StartDate,ReviewDate,StatusId');
            params.set('statusCPPFilter', getAtlasParamValueByKey(data.Params, 'statusCPPFilter'));
            params.set('searchCPPFilter', getAtlasParamValueByKey(data.Params, 'searchCPPFilter'));
            params.set('pageNumber', data.PageNumber.toString());
            params.set('pageSize', data.PageSize.toString());
            params.set('sortField', data.SortBy.SortField);
            params.set('direction', data.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            return this._data.get('constructionphaseplan', { search: params })
        })
        .map((res) => {
            return new ConstructionPhasePlanActions.ConstructionPhasePlansLoadCompleteAction({ ConstructionPhasePlansList: extractConstructionPhasePlansListData(res), PagingInfo: extractConstructionPhasePlansPagingInfo(res) });
        }).catch((error) => {
            return Observable
                .of(new errorActions
                    .CatchErrorAction(new AtlasApiError(error
                        , MessageEvent.Create
                        , this._objectType
                        , null)));
        });


    @Effect()
    deleteCPP$: Observable<Action> = this._actions$.ofType(ConstructionPhasePlanActions.ActionTypes.REMOVE_CONSTRUCTION_PHASE_PLAN)
        .map((action: ConstructionPhasePlanActions.RemoveCPPAction) => action.payload)
        .withLatestFrom(this._store, (payload: ConstructionPhasePlan, state) => { return { _payload: payload, currrentRequest: state.constructionPhasePlanState.apiRequestWithParams }; })
        .switchMap((action) => {
            let apiUrl = 'constructionphaseplan/' + action._payload.Id;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._objectType, action._payload.Name, action._payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(apiUrl)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._objectType, action._payload.Name, action._payload.Id);
                    this._messenger.publish('snackbar', vm);
                    action.currrentRequest.PageNumber = 1;                
                    return [
                        new ConstructionPhasePlanActions.ConstructionPhasePlansLoadAction(action.currrentRequest),
                        new ConstructionPhasePlanActions.LoadCPPStatsAction(action.currrentRequest)
                    ];
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, this._objectType, action._payload.Name, action._payload.Id)));
                });
        });

    @Effect()
    copyCPP$: Observable<Action> = this._actions$.ofType(ConstructionPhasePlanActions.ActionTypes.COPY_CONSTRUCTION_PHASE_PLAN)
        .map((action: ConstructionPhasePlanActions.CPPCopyAction) => action.payload)
        .withLatestFrom(this._store, (payload: ConstructionPhasePlan, state) => { return { _payload: payload, currrentRequest: state.constructionPhasePlanState.apiRequestWithParams }; })
        .switchMap((action) => {
            let apiUrl = 'constructionphaseplan';
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage(this._objectType, action._payload.Name);
            let params: URLSearchParams = new URLSearchParams();
            params.set('example', action._payload.IsExample ? 'true' : 'false');
            params.set('copy', 'true');
            this._messenger.publish('snackbar', vm);
            return this._data.put(apiUrl, action._payload, { search: params })
                .map((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage(this._objectType, action._payload.Name);
                    this._messenger.publish('snackbar', vm);
                    return new ConstructionPhasePlanActions.CPPCopyCompleteAction(<string>res.json().Id);
                })
                .catch((error) => {
                    return Observable
                        .of(new errorActions
                            .CatchErrorAction(new AtlasApiError(error
                                , MessageEvent.Copy, this._objectType, action._payload.Name)));
                });
        });


    @Effect()
    approveCPPStatus$: Observable<Action> = this._actions$.ofType(ConstructionPhasePlanActions.ActionTypes.APPROVE_CONSTRUCTION_PHASE_PLAN)
        .map((action: ConstructionPhasePlanActions.CPPApproveAction) => action.payload)
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            let url = `constructionphaseplan/${pl.Id}`;
            params.set('example', pl.IsExample ? 'true' : 'false');
            params.set('status', '2');
            let vm = ObjectHelper.operationInProgressSnackbarMessage("Approving construction phase plan");
            this._messenger.publish('snackbar', vm);
            return this._data.post(url, { id: pl.Id }, { search: params });
        })
        .map((res) => {
            let vm = ObjectHelper.operationCompleteSnackbarMessage("Construction Phase Plan has been set to Live.");
            this._messenger.publish('snackbar', vm);
            return new ConstructionPhasePlanActions.CPPApproveCompleteAction(true);
        }).catch((error) => {
            return Observable
                .of(new errorActions
                    .CatchErrorAction(new AtlasApiError(error
                        , MessageEvent.Update
                        , this._objectType
                        , null)));
        });

    @Effect()
    loadCPPStats$: Observable<Action> = this._actions$.ofType(ConstructionPhasePlanActions.ActionTypes.LOAD_CONSTRUCTION_PHASE_PLAN_STATS)
        .map((action: ConstructionPhasePlanActions.LoadCPPStatsAction) => action.payload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            if (!isNullOrUndefined(payload.Params)) {
                params.set('searchCPPFilter', getAtlasParamValueByKey(payload.Params, 'searchCPPFilter'));
            }
            return this._data.get('constructionphaseplan?forStats=true', { search: params })
                .map(res =>
                    new ConstructionPhasePlanActions.LoadCPPStatsCompleteAction(res.json())
                )
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading CPP Stats ', '')));
                })
        });
}