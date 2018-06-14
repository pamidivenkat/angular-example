import { Action } from '@ngrx/store';
import { type } from './../../../shared/util';
import { Document } from './../../models/document';
import * as Immutable from 'immutable';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';

export const ActionTypes = {
    LOAD_COMPANY_DOCS_STATS: type('[CompanyDocument] Load Company Document stats'),
    LOAD_COMPANY_DOCS_STATS_COMPLETE: type('[CompanyDocument] Load Company Document stats complete'),
    LOAD_COMPANY_DOCUMENTS: type('[CompanyDocument] Load Company Documents'),
    LOAD_COMPANY_DOCUMENTS_COMPLETE: type('[CompanyDocument] Load Company Documents complete'),
    REMOVE_COMPANY_DOCUMENT: type('[CompanyDocument] Remove Company document'),
    REMOVE_COMPANY_DOCUMENT_COMPLETE: type('[CompanyDocument] Remove Company document complete'),
    RESET_DELETE_STATUS: type('[CompanyDocument] reset Company document delete status'),
    UPDATE_COMPANY_DOCUMENT: type('[CompanyDocument] Update Company document'),
    UPDATE_COMPANY_DOCUMENT_COMPLETE: type('[CompanyDocument] Update Company document complete'),
    COMPANY_DOCUMENT_CLEAR: type('[CompanyDocument] Company documents clear')
}

/** Actions for  Company Documents **/
export class CompanyDocumentsClearAction implements Action {
    type = ActionTypes.COMPANY_DOCUMENT_CLEAR;
    constructor() {
    }
}

export class UpdateCompanyDocumentCompleteAction implements Action {
    type = ActionTypes.UPDATE_COMPANY_DOCUMENT_COMPLETE;
    constructor(public payload: Document) {
    }
}

export class UpdateCompanyDocumentAction implements Action {
    type = ActionTypes.UPDATE_COMPANY_DOCUMENT;
    constructor(public payload: Document) {
    }
}


export class ResetDeleteStatusAction implements Action {
    type = ActionTypes.RESET_DELETE_STATUS;
    constructor() {
    }
}


export class RemoveCompanyDocumentCompleteAction implements Action {
    type = ActionTypes.REMOVE_COMPANY_DOCUMENT_COMPLETE;
    constructor() {
    }
}


export class RemoveCompanyDocumentAction implements Action {
    type = ActionTypes.REMOVE_COMPANY_DOCUMENT;
    constructor(public payload: Document) {
    }
}


export class LoadCompanyDocumentsStatAction implements Action {
    type = ActionTypes.LOAD_COMPANY_DOCS_STATS;
    constructor() {
    }
}

export class LoadCompanyDocumentsStatCompleteAction implements Action {
    type = ActionTypes.LOAD_COMPANY_DOCS_STATS_COMPLETE;
    constructor(public payload: AtlasApiResponse<Document>) {
    }
}

export class LoadCompanyDocumentsAction implements Action {
    type = ActionTypes.LOAD_COMPANY_DOCUMENTS;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadCompanyDocumentsCompleteAction implements Action {
    type = ActionTypes.LOAD_COMPANY_DOCUMENTS_COMPLETE;
    constructor(public payload: AtlasApiResponse<Document>) {
    }
}

export type Actions =
    LoadCompanyDocumentsStatAction
    | LoadCompanyDocumentsStatCompleteAction
    | LoadCompanyDocumentsAction
    | LoadCompanyDocumentsCompleteAction
    | RemoveCompanyDocumentAction
    | RemoveCompanyDocumentCompleteAction
    | ResetDeleteStatusAction
    | UpdateCompanyDocumentAction
    | UpdateCompanyDocumentCompleteAction
    | CompanyDocumentsClearAction;