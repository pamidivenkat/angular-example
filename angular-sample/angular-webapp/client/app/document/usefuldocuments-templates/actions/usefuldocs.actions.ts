import { Action } from '@ngrx/store';
import { type } from './../../../shared/util';
import { sharedDocument } from './../models/sharedDocument';
import * as Immutable from 'immutable';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';

export const ActionTypes = {
    LOAD_USEFUL_DOCS_LIST: type('[Document] Load Useful Documents'),
    LOAD_USEFUL_DOCS_LIST_COMPLETE: type('[Document] Load Useful Documents Complete'),
    LOAD_USEFUL_DOCS_COUNT:type('[Document] Load Useful Documents Count'),
    LOAD_USEFUL_DOCS_COUNT_COMPLETE: type('[Document] Load Useful Documents Count Complete'),
    USEFUL_DOCS_CLEAR: type('[Document]  Useful Documents Clear')
}

/** Actions for  Useful Documents **/
export class UsefulDocsClearAction implements Action {
    type = ActionTypes.USEFUL_DOCS_CLEAR;
    constructor() {
    }
}

export class LoadUsefulDocsListAction implements Action {
    type = ActionTypes.LOAD_USEFUL_DOCS_LIST;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadUsefulDocsCountAction implements Action {
    type =ActionTypes.LOAD_USEFUL_DOCS_COUNT;
    constructor(public payload: boolean){

    }
}

export class LoadUsefulDocsCountCompleteAction implements Action {
    type =ActionTypes.LOAD_USEFUL_DOCS_COUNT_COMPLETE;
    constructor(public payload: AtlasApiResponse<sharedDocument>){

    }
}

export class LoadUsefulDocsListCompleteAction implements Action {
    type = ActionTypes.LOAD_USEFUL_DOCS_LIST_COMPLETE;
    constructor(public payload: AtlasApiResponse<sharedDocument>) {
    }
}

export type Actions = LoadUsefulDocsListAction | LoadUsefulDocsListCompleteAction | LoadUsefulDocsCountAction | LoadUsefulDocsCountCompleteAction | UsefulDocsClearAction;