import { Artifact } from '../../models/artifact';
import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';
import { Document } from '../../models/document';
import { Block } from "../../models/block";

export const ActionTypes = {
    LOAD_REVIEW_DOCUMENT: type('[Artifact] Load Review Document'),
    LOAD_REVIEW_DOCUMENT_COMPLETE: type('[Artifact] Load Review Document Complete'),
    SAVE_REVIEW_DOCUMENT: type('[Artifact] Save Review Document'),
    SAVE_REVIEW_DOCUMENT_COMPLETE: type('[Artifact] Save Review Document Complete'),
    GET_DOCUMENT_PREVIOUS_VERSION: type('[Artifact] Get previous version of document'),
    GET_DOCUMENT_PREVIOUS_VERSION_COMPLETE: type('[Artifact] Get previous version of document complete'),
    SELECT_CURRENT_BLOCK: type('[Block] Select current block')
}


export class LoadReviewDocument implements Action {
    type = ActionTypes.LOAD_REVIEW_DOCUMENT;
    constructor(public payload: string) {
    }
}

export class LoadReviewDocumentComplete implements Action {
    type = ActionTypes.LOAD_REVIEW_DOCUMENT_COMPLETE;
    constructor(public payload: Artifact) {
    }
}

export class SaveReviewDocument implements Action {
    type = ActionTypes.SAVE_REVIEW_DOCUMENT;
    constructor(public payload: Artifact) {

    }
}

export class SaveReviewDocumentComplete implements Action {
    type = ActionTypes.SAVE_REVIEW_DOCUMENT_COMPLETE;
    constructor(public payload: Artifact) {

    }
}

export class GetDocumentPreviousVersion implements Action {
    type = ActionTypes.GET_DOCUMENT_PREVIOUS_VERSION;
    constructor(public payload: string) {

    }
}

export class GetDocumentPreviousVersionComplete implements Action {
    type = ActionTypes.GET_DOCUMENT_PREVIOUS_VERSION_COMPLETE;
    constructor(public payload: Document) {
    }

}

export class SelectCurrentBlock implements Action {
    type = ActionTypes.SELECT_CURRENT_BLOCK;
    constructor(public payload: Block) {
    }
}

export type Actions = LoadReviewDocument
    | LoadReviewDocumentComplete
    | SaveReviewDocument
    | SaveReviewDocumentComplete
    | GetDocumentPreviousVersion
    | GetDocumentPreviousVersionComplete
    | SelectCurrentBlock;