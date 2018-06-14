import { Action } from '@ngrx/store';
import { type } from './../../../shared/util';
import { Document } from './../../models/document';
import * as Immutable from 'immutable';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';

export const ActionTypes = {
    LOAD_HANDBOOKS_DOCS_LIST: type('[Document] Load Handbooks Documents'),
    LOAD_HANDBOOKS_DOCS_LIST_COMPLETE: type('[Document] Load Handbooks Documents Complete'),
    LOAD_HANDBOOKS_DOCS_COUNT:type('[Document] Load Handbooks Documents Counts'),
    LOAD_HANDBOOKS_DOCS_COUNT_COMPLETE:type('[Document] Load Handbooks Documents Counts Complete'),
    HANDBOOKS_DATA_CLEAR:type('[Document]  Handbooks Documents data clear')
}

/** Actions for  Handbooks Documents **/
export class LoadHandbooksListAction implements Action {
    type = ActionTypes.LOAD_HANDBOOKS_DOCS_LIST;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadHandbooksListCompleteAction implements Action {
    type = ActionTypes.LOAD_HANDBOOKS_DOCS_LIST_COMPLETE;
    constructor(public payload: AtlasApiResponse<Document>) {
    }
}

export class LoadHandbooksDocsCountAction implements Action {
    type =ActionTypes.LOAD_HANDBOOKS_DOCS_COUNT;
    constructor(public payload: boolean){

    }
}

export class LoadHandbooksDocsCountCompleteAction implements Action {
    type =ActionTypes.LOAD_HANDBOOKS_DOCS_COUNT_COMPLETE;
    constructor(public payload: AtlasApiResponse<Document>){

    }
}

export class HandbooksListClearAction implements Action {
    type = ActionTypes.HANDBOOKS_DATA_CLEAR;
    constructor() {
    }
}


export type Actions = LoadHandbooksListAction 
    | LoadHandbooksListCompleteAction 
    | LoadHandbooksDocsCountAction 
    | LoadHandbooksDocsCountCompleteAction
    | HandbooksListClearAction;