import { StringHelper } from './../../../shared/helpers/string-helper';
import { isNullOrUndefined } from 'util';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from './../../../shared/reducers/index';
import { Headers, Http, URLSearchParams } from '@angular/http';

import * as handbooksActions from '../actions/handbooks.actions';
import { SortDirection } from './../../../atlas-elements/common/models/ae-sort-model';
import { Document } from './../../models/document';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import * as errorActions from './../../../shared/actions/error.actions';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';
import { getAtlasParamValueByKey } from "./../../../root-module/common/extract-helpers";

@Injectable()
export class HandbooksEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
    ) {
    }


    @Effect()
    loadHandbooks$: Observable<Action> = this._actions$.ofType(handbooksActions.ActionTypes.LOAD_HANDBOOKS_DOCS_LIST)
        .map((action: handbooksActions.LoadHandbooksListAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.citationDraftsState.apiRequestWithParams }; })
        .switchMap((p1) => {
            let payload = p1._payload;
            let params: URLSearchParams = new URLSearchParams();

            params.set('documentorigin', 'All');
            params.set('documentstatus', '1'); // changed the status to get only approved handbooks
            params.set('usage', '2');
            params.set('filterDocumentViewArchiveFilter', 'false');
            params.set('category', '16384');
            params.set('fields', 'Id,FileNameAndTitle,SiteName,CategoryName,Version,ModifiedOn,Status');
            if (!isNullOrUndefined(getAtlasParamValueByKey(payload.Params, "site")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(payload.Params, "site")))) {
                params.set('site', getAtlasParamValueByKey(payload.Params, "site"));
            }

            params.set('pageNumber', payload.PageNumber.toString());
            params.set('pageSize', payload.PageSize.toString());
            params.set('sortField', payload.SortBy.SortField);
            params.set('direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');

            return this._data.get('documentview', { search: params })
                .map(res => new handbooksActions.LoadHandbooksListCompleteAction(<AtlasApiResponse<Document>>res.json()))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Handbooks Documents', '')));
                })
        });

    @Effect()
    handbookDocsCount$: Observable<Action> = this._actions$.ofType(handbooksActions.ActionTypes.LOAD_HANDBOOKS_DOCS_COUNT)
        .map((action: handbooksActions.LoadHandbooksDocsCountAction) => action.payload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
             params.set('documentorigin', 'All');
            params.set('documentstatus', '1'); // changed the status to get only approved handbooks
            params.set('usage', '2');
            params.set('filterDocumentViewArchiveFilter', 'false');
            params.set('category', '16384');
            params.set('fields', 'Id,ModifiedOn');
            params.set('pageNumber', '1');
            params.set('pageSize', '1');
            params.set('sortField', 'ModifiedOn');
            params.set('direction', 'asc');
            return this._data.get(`documentview`, { search: params })
                .map((res) => new handbooksActions.LoadHandbooksDocsCountCompleteAction(res.json()))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Handbooks Documents count', '')));
                })
        });
}