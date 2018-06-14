import { Document } from './../../models/document';
import { isNullOrUndefined } from 'util';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as handbooksActions from '../actions/handbooks.actions';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { extractDataTableOptions } from './../../../shared/helpers/extract-helpers';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import * as Immutable from 'immutable';


export interface HandbooksState {
    HasHandbooksListLoaded: boolean;
    HandbooksList: Document[];
    HandbooksPagingInfo: PagingInfo;
    handbooksDocsCount: number;
    apiRequestWithParams: AtlasApiRequestWithParams;
}

const initialState: HandbooksState = {
    HasHandbooksListLoaded: false,
    HandbooksList: null,
    HandbooksPagingInfo: null,
    handbooksDocsCount: 0,
    apiRequestWithParams: null,
}

export function reducer(state = initialState, action: Action): HandbooksState {
    switch (action.type) {
        case handbooksActions.ActionTypes.LOAD_HANDBOOKS_DOCS_LIST: {
            let modifiedState = Object.assign({}, state, { HasHandbooksListLoaded: false, apiRequestWithParams: action.payload });
            return modifiedState;
        }
        case handbooksActions.ActionTypes.LOAD_HANDBOOKS_DOCS_LIST_COMPLETE: {
            let modifiedState: HandbooksState = Object.assign({}, state, { HasHandbooksListLoaded: true, HandbooksList: action.payload.Entities });

            if (!isNullOrUndefined(state.HandbooksPagingInfo)) {
                if (action.payload.PagingInfo.PageNumber == 1) {
                    modifiedState.HandbooksPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                    if (modifiedState.apiRequestWithParams.Params.length === 0)
                        modifiedState.handbooksDocsCount = action.payload.PagingInfo.TotalCount;
                }
                modifiedState.HandbooksPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                modifiedState.HandbooksPagingInfo.Count = action.payload.PagingInfo.Count;
            }
            else {
                modifiedState.HandbooksPagingInfo = action.payload.PagingInfo;
            }
            return modifiedState;
        }
        case handbooksActions.ActionTypes.LOAD_HANDBOOKS_DOCS_COUNT: {
            let modifiedState = Object.assign({}, state, { handbooksDocsCount: 0 });
            return modifiedState;
        }
        case handbooksActions.ActionTypes.LOAD_HANDBOOKS_DOCS_COUNT_COMPLETE: {
            let modifiedState: HandbooksState = Object.assign({}, state, { handbooksDocsCount: action.payload.PagingInfo.TotalCount });
            return modifiedState;
        }
        case handbooksActions.ActionTypes.HANDBOOKS_DATA_CLEAR: {
            let modifiedState: HandbooksState = Object.assign({}, initialState);
            return modifiedState;
        }

        default:
            return state;
    }
}

/*** Handbooks Listing Start ***/

export function getHandbooksDocsCount(state$: Observable<HandbooksState>): Observable<number> {
    return state$.select(s => s.handbooksDocsCount);
}

export function getHandbooksDocsApiRequest(state$: Observable<HandbooksState>): Observable<AtlasApiRequestWithParams> {
    return state$.select(s => s.apiRequestWithParams);
}

export function getHandbooksListLoadingState(state$: Observable<HandbooksState>): Observable<boolean> {
    return state$.select(s => s.HasHandbooksListLoaded);
}
export function getHandbooksList(state$: Observable<HandbooksState>): Observable<Immutable.List<Document>> {
    return state$.select(s => s.HandbooksList && Immutable.List<Document>(s.HandbooksList));
}

export function getHandbooksListTotalCount(state$: Observable<HandbooksState>): Observable<number> {
    return state$.select(s => s && s.HandbooksPagingInfo && s.HandbooksPagingInfo.TotalCount);
}

export function getHandbooksListDataTableOptions(state$: Observable<HandbooksState>): Observable<DataTableOptions> {
    return state$.select(s => s.HandbooksList && s.HandbooksPagingInfo && s.apiRequestWithParams && extractDataTableOptions(s.HandbooksPagingInfo,s.apiRequestWithParams.SortBy));
}


/*** Handbooks Listing End ***/