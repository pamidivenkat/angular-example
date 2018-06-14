import { Document } from './../../models/document';
import { isNullOrUndefined } from 'util';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as citationDraftsActions from './../actions/citation-drafts.actions';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { extractDataTableOptions } from './../../../shared/helpers/extract-helpers';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import * as Immutable from 'immutable';


export interface CitationDraftsState {
    HasCitationDraftsListLoaded: boolean;
    CitationDraftsList: Document[];
    CitationDraftsPagingInfo: PagingInfo;
    apiRequestWithParams: AtlasApiRequestWithParams;
}

const initialState: CitationDraftsState = {
    HasCitationDraftsListLoaded: false,
    CitationDraftsList: null,
    CitationDraftsPagingInfo: null,
    apiRequestWithParams: null,
}

export function reducer(state = initialState, action: Action): CitationDraftsState {
    switch (action.type) {
        case citationDraftsActions.ActionTypes.LOAD_CITATION_DRAFTS_LIST: {
            let modifiedState = Object.assign({}, state, { HasCitationDraftsListLoaded: false, apiRequestWithParams: action.payload });
            return modifiedState;
        }
        case citationDraftsActions.ActionTypes.LOAD_CITATION_DRAFTS_LIST_COMPLETE: {
            let modifiedState = Object.assign({}, state, { HasCitationDraftsListLoaded: true, CitationDraftsList: action.payload.Entities });

            if (!isNullOrUndefined(state.CitationDraftsPagingInfo)) {
                if (action.payload.PagingInfo.PageNumber == 1) {
                    modifiedState.CitationDraftsPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                }
                modifiedState.CitationDraftsPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                modifiedState.CitationDraftsPagingInfo.Count = action.payload.PagingInfo.Count;
            }
            else {
                modifiedState.CitationDraftsPagingInfo = action.payload.PagingInfo;
            }
            return modifiedState;
        }
        case citationDraftsActions.ActionTypes.DRAFTS_DOCUMENTS_CLEAR: {
            let modifiedState = Object.assign({}, initialState);
            return modifiedState;
        }
        default:
            return state;
    }
}

/*** CitationDrafts Listing Start ***/

export function getCitationDraftsApiRequest(state$: Observable<CitationDraftsState>): Observable<AtlasApiRequestWithParams> {
    return state$.select(s => s.apiRequestWithParams);
}

export function getCitationDraftsListLoadingState(state$: Observable<CitationDraftsState>): Observable<boolean> {
    return state$.select(s => s.HasCitationDraftsListLoaded);
}
export function getCitationDraftsList(state$: Observable<CitationDraftsState>): Observable<Immutable.List<Document>> {
    return state$.select(s => s.CitationDraftsList && Immutable.List<Document>(s.CitationDraftsList));
}

export function getCitationDraftsListTotalCount(state$: Observable<CitationDraftsState>): Observable<number> {
    return state$.select(s => s && s.CitationDraftsPagingInfo && s.CitationDraftsPagingInfo.TotalCount);
}

export function getCitationDraftsListDataTableOptions(state$: Observable<CitationDraftsState>): Observable<DataTableOptions> {
    return state$.select(s => s.CitationDraftsList && s.CitationDraftsPagingInfo && s.apiRequestWithParams && extractDataTableOptions(s.CitationDraftsPagingInfo,s.apiRequestWithParams.SortBy));
}


/*** CitationDrafts Listing End ***/