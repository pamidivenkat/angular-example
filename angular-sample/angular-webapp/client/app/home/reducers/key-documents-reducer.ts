import { AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { KeyDocuments } from '../models/key-documents';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as toActions from '../actions/key-documents-actions';

export interface KeyDocumentsState {
    isFirstTimeLoad: boolean
    loading: boolean,
    loaded: boolean,
    data: AtlasApiResponse<KeyDocuments>
}

const initialState: KeyDocumentsState = {
    isFirstTimeLoad:true,
    loading: false,
    loaded: false,
    data: new AtlasApiResponse<KeyDocuments>()
}

export function reducer(state: KeyDocumentsState = initialState, action: Action): KeyDocumentsState {
    switch (action.type) {

        case toActions.ActionTypes.KEY_DOCUMENTS_LOAD:
            {
                return Object.assign({}, state, { loading: true });
            }
        case toActions.ActionTypes.KEY_DOCUMENTS_LOAD_COMPLETE:
            {
                let newState = Object.assign({}, state, { loaded: true, isFirstTimeLoad:false, loading: false, data: action.payload });
                return newState;
            }
        default:
            return state;
    }
}

export function getkeyDocumentsData(state$: Observable<KeyDocumentsState>): Observable<AtlasApiResponse<KeyDocuments>> {
    return state$.select(s => s.data);
}

export function getkeyDocumentsLoadingData(state$: Observable<KeyDocumentsState>): Observable<boolean> {
    return state$.select(s => s.loading);
}

export function getkeyDocumentsIsFirstTimeLoadDta(state$: Observable<KeyDocumentsState>): Observable<boolean> {
    return state$.select(s => s.isFirstTimeLoad);
}