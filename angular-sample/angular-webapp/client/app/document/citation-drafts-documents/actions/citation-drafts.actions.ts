import { Action } from '@ngrx/store';
import { type } from './../../../shared/util';
import { Document } from './../../models/document';
import * as Immutable from 'immutable';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';

export const ActionTypes = {
    LOAD_CITATION_DRAFTS_LIST: type('[Document] Load Citation Drafts'),
    LOAD_CITATION_DRAFTS_LIST_COMPLETE: type('[Document] Load Citation Drafts Complete'),
    DRAFTS_DOCUMENTS_CLEAR: type('[Document] Citation Drafts clear complete')
}

/** Actions for  Citation Drafts **/
export class LoadCitationDraftsListAction implements Action {
    type = ActionTypes.LOAD_CITATION_DRAFTS_LIST;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadCitationDraftsListCompleteAction implements Action {
    type = ActionTypes.LOAD_CITATION_DRAFTS_LIST_COMPLETE;
    constructor(public payload: AtlasApiResponse<Document>) {
    }
}

export class CitationDraftsClearAction implements Action {
    type = ActionTypes.DRAFTS_DOCUMENTS_CLEAR;
    constructor() {
    }
}

export type Actions = LoadCitationDraftsListAction 
    | LoadCitationDraftsListCompleteAction
    | CitationDraftsClearAction;