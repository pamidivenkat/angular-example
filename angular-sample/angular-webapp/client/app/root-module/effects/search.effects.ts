import { Observable } from 'rxjs/Rx';
import { getAtlasParamValueByKey } from '../common/extract-helpers';
import { AtlasApiRequestWithParams } from './../../shared/models/atlas-api-response';
import { SearchResult } from './../models/searchresult';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as searchActions from './../actions/search.actions';

@Injectable()
export class SearchEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>) {

    }
    @Effect()
    menus$: Observable<Action> = this._actions$.ofType(searchActions.ActionTypes.LOAD_SEARCH_RESULTS)
        .switchMap((action) => {
            let payload = <AtlasApiRequestWithParams>action.payload;
            let params: URLSearchParams = new URLSearchParams();
            params.set('searchTerm', getAtlasParamValueByKey(payload.Params,'SearchTerm'));
            params.set('sort', getAtlasParamValueByKey(payload.Params,'SortBy'));
            return this._data.get('search', { search: params });
        })
        .map((res) => {
            return new searchActions.LoadSearchResultsCompleteAction(res.json() as SearchResult[]);
        });

}