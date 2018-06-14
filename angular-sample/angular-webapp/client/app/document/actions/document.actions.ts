import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { DocumentSubCategory } from '../models/DocumentSubCategory';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';
import { Document } from '../models/document';
import { DocumentCategory } from '../models/document-category';
import * as Immutable from 'immutable';
export const ActionTypes = {
    LOAD_PERSONAL_DOCUMENTS: type('[Document] Load Personal Documents'),
    LOAD_PERSONAL_DOCUMENTS_COMPLETE: type('[Document] Load Personal Documents Complete'),
    SELECT_DOCUMENT: type('[Document] Load Selected Document'),
    SELECT_DOCUMENT_COMPLETE: type('[Document] Load Selected Document Complete'),
    REMOVE_DOCUMENT: type('[Document] Remove Document'),
    REMOVE_DOCUMENT_COMPLETE: type('[Document] Remove Document Complete'),
    UPDATE_DOCUMENT: type('[Document] Update Document')
}

export class LoadPersonalDocuments implements Action {
    type = ActionTypes.LOAD_PERSONAL_DOCUMENTS;
    constructor(public payload: boolean) {
    }
}

export class LoadPersonalDocumentsComplete implements Action {
    type = ActionTypes.LOAD_PERSONAL_DOCUMENTS_COMPLETE;
    constructor(public payload: Array<Document>) {
    }
}

export class LoadSelectedDocument implements Action {
    type = ActionTypes.SELECT_DOCUMENT;
    constructor(public payload: string) {
    }
}

export class LoadSelectedDocumentComplete implements Action {
    type = ActionTypes.SELECT_DOCUMENT_COMPLETE;
    constructor(public payload: Document) {
    }
}

export class RemoveDocument implements Action {
    type = ActionTypes.REMOVE_DOCUMENT;
    constructor(public payload: Document) {
    }
}

export class RemoveDocumentComplete implements Action {
    type = ActionTypes.REMOVE_DOCUMENT_COMPLETE;
    constructor(public payload: boolean) {
    }
}


export class UpdateDocument implements Action {
    type = ActionTypes.UPDATE_DOCUMENT;
    constructor(public payload: Document) {
    }
}

export type Actions = LoadPersonalDocuments | LoadPersonalDocumentsComplete | LoadSelectedDocument | LoadSelectedDocumentComplete | UpdateDocument |  RemoveDocument | RemoveDocumentComplete;