import { StringHelper } from './../../../shared/helpers/string-helper';
import { isNullOrUndefined } from 'util';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from './../../../shared/reducers/index';
import { Headers, Http, URLSearchParams } from '@angular/http';

import * as usefulDocsActions from '../actions/usefuldocs.actions';
import { SortDirection } from './../../../atlas-elements/common/models/ae-sort-model';

import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import * as errorActions from './../../../shared/actions/error.actions';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';
import { getAtlasParamValueByKey } from "./../../../root-module/common/extract-helpers";

@Injectable()
export class UsefulDocsEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
    //    , private _http: Http
    ) {
    }



    @Effect()
    loadUsefulDocs$: Observable<Action> = this._actions$.ofType(usefulDocsActions.ActionTypes.LOAD_USEFUL_DOCS_LIST)
        .map((action: usefulDocsActions.LoadUsefulDocsListAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.usefulDocsState.apiRequestWithParams }; })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            if (!isNullOrUndefined(getAtlasParamValueByKey(data._payload.Params, "additionalService")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(data._payload.Params, "additionalService")))) {
                params.set('filterSharedDocumentsByService', getAtlasParamValueByKey(data._payload.Params, "additionalService"));
            }
            if (!isNullOrUndefined(getAtlasParamValueByKey(data._payload.Params, "category")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(data._payload.Params, "category")))) {
                params.set('filterSharedDocumentsByCategory', getAtlasParamValueByKey(data._payload.Params, "category"));
            }
            if (!isNullOrUndefined(getAtlasParamValueByKey(data._payload.Params, "country")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(data._payload.Params, "country")))) {
                params.set('filterSharedDocumentsByCountry', getAtlasParamValueByKey(data._payload.Params, "country"));
            }
            if (!isNullOrUndefined(getAtlasParamValueByKey(data._payload.Params, "search")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(data._payload.Params, "search")))) {
                params.set('FilterSharedDocumentsByKeywordOrTitle', getAtlasParamValueByKey(data._payload.Params, "search"));
            }

            params.set('pageNumber', data._payload.PageNumber.toString());
            params.set('pageSize', data._payload.PageSize.toString());
            params.set('sortField', data._payload.SortBy.SortField);
            params.set('direction', data._payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');

            return this._data.get('shareddocument', { search: params })
                .map(res => new usefulDocsActions.LoadUsefulDocsListCompleteAction(res.json()))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading useful documents', '')));
                })
        });

    @Effect()
    usefulDocsCount$: Observable<Action> = this._actions$.ofType(usefulDocsActions.ActionTypes.LOAD_USEFUL_DOCS_COUNT)
        .map((action: usefulDocsActions.LoadUsefulDocsCountAction) => action.payload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', `Id,ModifiedOn`);
            params.set('pageNumber', '1');
            params.set('pageSize', '1');
            params.set('sortField', 'ModifiedOn');
            params.set('direction', 'asc');
            return this._data.get(`shareddocument`, { search: params })
                .map((res) => new usefulDocsActions.LoadUsefulDocsCountCompleteAction(res.json()))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading useful documents count', '')));
                })
        });

}