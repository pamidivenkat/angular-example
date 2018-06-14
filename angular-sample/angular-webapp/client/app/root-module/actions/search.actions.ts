import { AtlasApiRequestWithParams } from './../../shared/models/atlas-api-response';
import { SearchResult } from './../models/searchresult';
import { Menu } from '../models/menu';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';

export const ActionTypes = {
    LOAD_SEARCH_RESULTS: type('[SEARCH] Load search results'),
    LOAD_SEARCH_RESULTS_COMPLETE: type('[SEARCH] Load search results complete'),
    SEARCH_RESULTS_FILTER_CHANGED: type('[SEARCH] search results filter changed')
}

export class LoadSearchResultsAction implements Action {
    type = ActionTypes.LOAD_SEARCH_RESULTS;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}

export class LoadSearchResultsCompleteAction implements Action {
    type = ActionTypes.LOAD_SEARCH_RESULTS_COMPLETE;
    constructor(public payload: SearchResult[]) {

    }
}

export class SearchResultsFiltersChangedAction implements Action {
    type = ActionTypes.SEARCH_RESULTS_FILTER_CHANGED;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}

export type Actions =
    LoadSearchResultsAction
    | LoadSearchResultsCompleteAction
    | SearchResultsFiltersChangedAction