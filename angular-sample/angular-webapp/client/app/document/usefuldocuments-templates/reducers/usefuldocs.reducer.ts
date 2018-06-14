import { sharedDocument } from './../models/sharedDocument';
import { isNullOrUndefined } from 'util';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as usefulDocsActions from '../actions/usefuldocs.actions';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { extractDataTableOptions } from './../../../shared/helpers/extract-helpers';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import * as Immutable from 'immutable';

export interface UsefulDocsState {
    HasUsefulDocsListLoaded: boolean;
    UsefulDocsList: sharedDocument[];
    UsefulDocsPagingInfo: PagingInfo;
    apiRequestWithParams: AtlasApiRequestWithParams;
    usefulDocsCount: number;
}

const initialState: UsefulDocsState = {
    HasUsefulDocsListLoaded: false,
    UsefulDocsList: null,
    UsefulDocsPagingInfo: null,
    apiRequestWithParams: null,
    usefulDocsCount: 0,
}

export function reducer(state = initialState, action: Action): UsefulDocsState {
    switch (action.type) {
        case usefulDocsActions.ActionTypes.LOAD_USEFUL_DOCS_LIST: {
            let modifiedState = Object.assign({}, state, { HasUsefulDocsListLoaded: false, apiRequestWithParams: action.payload });
            return modifiedState;
        }
        case usefulDocsActions.ActionTypes.LOAD_USEFUL_DOCS_LIST_COMPLETE: {
            let modifiedState: UsefulDocsState = Object.assign({}, state, { HasUsefulDocsListLoaded: true, UsefulDocsList: action.payload.Entities });

            if (!isNullOrUndefined(state.UsefulDocsPagingInfo)) {
                if (action.payload.PagingInfo.PageNumber == 1) {
                    if (modifiedState.apiRequestWithParams.Params.length === 0)
                        modifiedState.usefulDocsCount = action.payload.PagingInfo.TotalCount;
                    modifiedState.UsefulDocsPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                }
                modifiedState.UsefulDocsPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                modifiedState.UsefulDocsPagingInfo.Count = action.payload.PagingInfo.Count;
            }
            else {
                modifiedState.UsefulDocsPagingInfo = action.payload.PagingInfo;
            }
            return modifiedState;
        }
        case usefulDocsActions.ActionTypes.LOAD_USEFUL_DOCS_COUNT: {
            let modifiedState = Object.assign({}, state, { usefulDocsCount: 0 });
            return modifiedState;
        }
        case usefulDocsActions.ActionTypes.LOAD_USEFUL_DOCS_COUNT_COMPLETE: {
            let modifiedState: UsefulDocsState = Object.assign({}, state, { usefulDocsCount: action.payload.PagingInfo.TotalCount });
            return modifiedState;
        }
        case usefulDocsActions.ActionTypes.USEFUL_DOCS_CLEAR: {
            return Object.assign({}, initialState);
        }
        default:
            return state;
    }
}

/*** UsefulDocs Listing Start ***/

export function getUsefulDocsCount(state$: Observable<UsefulDocsState>): Observable<number> {
    return state$.select(s => s.usefulDocsCount);
}

export function getUsefulDocsApiRequest(state$: Observable<UsefulDocsState>): Observable<AtlasApiRequestWithParams> {
    return state$.select(s => s.apiRequestWithParams);
}

export function getUsefulDocsListLoadingState(state$: Observable<UsefulDocsState>): Observable<boolean> {
    return state$.select(s => s.HasUsefulDocsListLoaded);
}
export function getUsefulDocsList(state$: Observable<UsefulDocsState>): Observable<Immutable.List<sharedDocument>> {
    return state$.select(s => s.UsefulDocsList && Immutable.List<sharedDocument>(s.UsefulDocsList));
}

export function getUsefulDocsListTotalCount(state$: Observable<UsefulDocsState>): Observable<number> {
    return state$.select(s => s && s.UsefulDocsPagingInfo && s.UsefulDocsPagingInfo.TotalCount);
}

export function getUsefulDocsListDataTableOptions(state$: Observable<UsefulDocsState>): Observable<DataTableOptions> {
    return state$.select(s => s.UsefulDocsList && s.UsefulDocsPagingInfo && s.apiRequestWithParams && extractDataTableOptions(s.UsefulDocsPagingInfo, s.apiRequestWithParams.SortBy));
}


/*** UsefulDocs Listing End ***/