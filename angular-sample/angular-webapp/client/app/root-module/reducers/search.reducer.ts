import { CommonHelpers } from './../../shared/helpers/common-helpers';
import { AeSelectItem } from './../../atlas-elements/common/models/ae-select-item';
import { SortDirection } from './../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams } from './../../shared/models/atlas-api-response';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as searchActions from '../actions/search.actions';
import { Menu } from '../models/menu';
import { SearchResult, SearchEntity } from '../models/searchresult';
import { filterSearchResults } from '../common/extract-helpers';
import * as Immutable from 'immutable';

export interface SearchState {
    searchRequest: AtlasApiRequestWithParams,
    loaded: boolean,
    results: SearchResult[],
    searchEntities: SearchEntity[],
    sortBy: Immutable.List<AeSelectItem<string>>
}

const initialState: SearchState = {
    searchRequest: null,
    loaded: false,
    results: [],
    searchEntities: [new SearchEntity('shareddocument', 'Shared Documents'), new SearchEntity('document', 'Documents'), new SearchEntity('riskassessment', 'Risk Assessments'), new SearchEntity('constructionphaseplan', 'Construction Phase Plans'), new SearchEntity('methodstatement', 'Method Statements'), new SearchEntity('employee', 'Employees'), new SearchEntity('user', 'Users'), new SearchEntity('site', 'Sites')],
    sortBy: Immutable.List<AeSelectItem<string>>([new AeSelectItem<string>('Newest first', '2', false), new AeSelectItem<string>('Oldest first', '3', false), new AeSelectItem<string>('A - Z', '4', false), new AeSelectItem<string>('Z - A', '5', false)])
}

export function reducer(state = initialState, action: Action): SearchState {
    switch (action.type) {
        case searchActions.ActionTypes.LOAD_SEARCH_RESULTS:
            {
                return Object.assign({}, state, { loaded: false, searchRequest: action.payload });
            }
        case searchActions.ActionTypes.LOAD_SEARCH_RESULTS_COMPLETE:
            {
                return Object.assign({}, state, { loaded: true, results: action.payload });
            }
        case searchActions.ActionTypes.SEARCH_RESULTS_FILTER_CHANGED:
            {
                return Object.assign({}, state, { searchRequest: action.payload });
            }
        default:
            return state;
    }
}

export function getSearchResults(state$: Observable<SearchState>): Observable<SearchResult[]> {
    return state$.select(s => s.results);
}
export function getSearchResultsTotalCount(state$: Observable<SearchState>): Observable<number> {
    return state$.select(s => s.results && s.results.length);
}

export function getSearchRequest(state$: Observable<SearchState>): Observable<AtlasApiRequestWithParams> {
    return state$.select(s => s.searchRequest);
}

export function getSortBy(state$: Observable<SearchState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.sortBy);
}


export function getSearchEntities(state$: Observable<SearchState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => Immutable.List<AeSelectItem<string>>(
        CommonHelpers.sortArray(s.searchEntities, 'Entity', SortDirection.Ascending).map((keyValuePair) => {
            let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Entity);
            return aeSelectItem;
        }
        )
    ));
}


export function getSearchResultsLoaded(state$: Observable<SearchState>): Observable<boolean> {
    return state$.select(s => s.loaded);
}

export function getSearchResultsPagedList(state$: Observable<SearchState>, request: AtlasApiRequestWithParams): Observable<Immutable.List<SearchResult>> {
    return state$.select(s =>
        s.results && Immutable.List<SearchResult>(filterSearchResults(s.results, request))
    );
}
