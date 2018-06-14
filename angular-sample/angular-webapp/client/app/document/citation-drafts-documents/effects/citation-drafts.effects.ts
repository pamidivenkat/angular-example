import { DocumentsFolder } from '../../models/document';
import { DocumentCategoryService } from './../../services/document-category-service';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from './../../../shared/reducers/index';
import { Headers, Http, URLSearchParams } from '@angular/http';

import * as citationDraftsActions from '../actions/citation-drafts.actions';
import { SortDirection } from './../../../atlas-elements/common/models/ae-sort-model';

import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import * as errorActions from './../../../shared/actions/error.actions';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';
import { getAtlasParamValueByKey } from "./../../../root-module/common/extract-helpers";
import { StringHelper } from './../../../shared/helpers/string-helper';
import { isNullOrUndefined } from 'util';

@Injectable()
export class CitationDraftsEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
 //       , private _http: Http
        , private _documentCategoryService: DocumentCategoryService
    ) {
    }



    @Effect()
    loadCitationsDrafts$: Observable<Action> = this._actions$.ofType(citationDraftsActions.ActionTypes.LOAD_CITATION_DRAFTS_LIST)
        .map((action: citationDraftsActions.LoadCitationDraftsListAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.citationDraftsState.apiRequestWithParams }; })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            let folderCategories = this._documentCategoryService.getFolderCategories(DocumentsFolder.CitationDrafts);
            if (!isNullOrUndefined(getAtlasParamValueByKey(data._payload.Params, "category")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(data._payload.Params, "category")))) {
                params.set('multipleCategory', getAtlasParamValueByKey(data._payload.Params, "category"));
            } else {
                params.set('multipleCategory', folderCategories.join(','));
            }
            if (!isNullOrUndefined(getAtlasParamValueByKey(data._payload.Params, "site")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(data._payload.Params, "site")))) {
                params.set('site', getAtlasParamValueByKey(data._payload.Params, "site"));
            }
            if (!isNullOrUndefined(getAtlasParamValueByKey(data._payload.Params, "documentstatus")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(data._payload.Params, "documentstatus")))) {
                params.set('documentstatus', getAtlasParamValueByKey(data._payload.Params, "documentstatus"));
            }

            params.set('revieweruserPending', 'true');
            params.set('pageNumber', data._payload.PageNumber.toString());
            params.set('pageSize', data._payload.PageSize.toString());
            params.set('sortField', data._payload.SortBy.SortField);
            params.set('direction', data._payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');

            return this._data.get('DocumentView', { search: params })
                .map(res => new citationDraftsActions.LoadCitationDraftsListCompleteAction(res.json()))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Citation Drafts', '')));
                })
        });
}