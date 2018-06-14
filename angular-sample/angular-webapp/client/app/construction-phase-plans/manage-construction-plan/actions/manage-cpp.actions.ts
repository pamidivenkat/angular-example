import { AtlasApiResponse, AtlasApiRequestWithParams, AtlasApiRequest } from './../../../shared/models/atlas-api-response';
import { Action } from '@ngrx/store';
import { type } from './../../../shared/util';
import { ConstructionPhasePlan, CPPAdditionalInfo } from './../../models/construction-phase-plans';
import { AeSortModel } from './../../../atlas-elements/common/models/ae-sort-model';
import { Document } from './../../../document/models/document';

export const ActionTypes = {
    LOAD_CPP_BY_ID: type('[CONSTRUCTIONPHASEPLANS] load cpp by id'),
    LOAD_CPP_BY_ID_COMPLETE: type('[CONSTRUCTIONPHASEPLANS] load cpp by id complete'),
    CLEAR_CPP: type('[CONSTRUCTIONPHASEPLANS] clear cpp'),
    ADD_CPP: type('[CONSTRUCTIONPHASEPLANS] add cpp'),
    ADD_CPP_COMPLETE: type('[CONSTRUCTIONPHASEPLANS] add cpp complete'),
    UPDATE_CPP: type('[CONSTRUCTIONPHASEPLANS] update cpp'),
    UPDATE_CPP_COMPLETE: type('[CONSTRUCTIONPHASEPLANS] update cpp complete'),
    LOAD_CPP_CLIENT_DETAILS_ID: type('[CONSTRUCTIONPHASEPLANS] load cpp client details by id'),
    LOAD_CPP_CLIENT_DETAILS_ID_COMPLETE: type('[CONSTRUCTIONPHASEPLANS] load cpp client details by id complete'),
    ADD_CPP_CLIENT_DETAILS: type('[CONSTRUCTIONPHASEPLANS] add cpp client details'),
    ADD_CPP_CLIENT_DETAILS_COMPLETE: type('[CONSTRUCTIONPHASEPLANS] add cpp client details complete'),
    UPDATE_CPP_CLIENT_DETAILS: type('[CONSTRUCTIONPHASEPLANS] update cpp client details'),
    UPDATE_CPP_CLIENT_DETAILS_COMPLETE: type('[CONSTRUCTIONPHASEPLANS] update cpp client details complete'),
    SAVE_CPP_TO_ATLAS: type('[CONSTRUCTIONPHASEPLANS] save cpp to atlas'),
    SAVE_CPP_TO_ATLAS_COMPLETE: type('[CONSTRUCTIONPHASEPLANS] save cpp to atlas complete'),
    REMOVE_DOCUMENT: type('[CONSTRUCTIONPHASEPLANS] delete document'),
    REMOVE_DOCUMENT_COMPLETE: type('[CONSTRUCTIONPHASEPLANS] delete document complete')
}

export class LoadCPPByIdAction implements Action {
    type = ActionTypes.LOAD_CPP_BY_ID;
    constructor(public payload: { Id: string, IsExample: boolean }) {

    }
}

export class LoadCPPByIdCompleteAction implements Action {
    type = ActionTypes.LOAD_CPP_BY_ID_COMPLETE;
    constructor(public payload: ConstructionPhasePlan) {

    }
}

export class LoadCPPClientDetailsByIdAction implements Action {
    type = ActionTypes.LOAD_CPP_CLIENT_DETAILS_ID;
    constructor(public payload: { Id: string, IsExample: boolean }) {

    }
}

export class LoadCPPClientDetailsByIdCompleteAction implements Action {
    type = ActionTypes.LOAD_CPP_CLIENT_DETAILS_ID_COMPLETE;
    constructor(public payload: CPPAdditionalInfo) {

    }
}

export class ClearCPPAction implements Action {
    type = ActionTypes.CLEAR_CPP;
    constructor(public payload: string) {

    }
}

export class AddCPPAction implements Action {
    type = ActionTypes.ADD_CPP;
    constructor(public payload: ConstructionPhasePlan) {

    }
}

export class AddCPPCompleteAction implements Action {
    type = ActionTypes.ADD_CPP_COMPLETE;
    constructor(public payload: ConstructionPhasePlan) {

    }
}

export class UpdateCPPAction implements Action {
    type = ActionTypes.UPDATE_CPP;
    constructor(public payload: ConstructionPhasePlan) {

    }
}

export class UpdateCPPCompleteAction implements Action {
    type = ActionTypes.UPDATE_CPP_COMPLETE;
    constructor(public payload: ConstructionPhasePlan) {

    }
}

export class AddCPPClientDetailsAction implements Action {
    type = ActionTypes.ADD_CPP_CLIENT_DETAILS;
    constructor(public payload: CPPAdditionalInfo) {

    }
}

export class AddCPPClientDetailsCompleteAction implements Action {
    type = ActionTypes.ADD_CPP_CLIENT_DETAILS_COMPLETE;
    constructor(public payload: CPPAdditionalInfo) {

    }
}

export class UpdateCPPClientDetailsAction implements Action {
    type = ActionTypes.UPDATE_CPP_CLIENT_DETAILS;
    constructor(public payload: CPPAdditionalInfo) {

    }
}

export class UpdateCPPClientDetailsCompleteAction implements Action {
    type = ActionTypes.UPDATE_CPP_CLIENT_DETAILS_COMPLETE;
    constructor(public payload: CPPAdditionalInfo) {

    }
}

export class SaveCPPtoAtlasAction implements Action {
    type = ActionTypes.SAVE_CPP_TO_ATLAS;
    constructor(public payload: any) {

    }
}
    
export class RemoveDocumentAction implements Action {
    type = ActionTypes.REMOVE_DOCUMENT;
    constructor(public payload: Document) {

    }
}


export class RemoveDocumentCompleteAction implements Action {
    type = ActionTypes.REMOVE_DOCUMENT_COMPLETE;
    constructor() {

    }
}

export class SaveCPPtoAtlasCompleteAction implements Action {
    type = ActionTypes.SAVE_CPP_TO_ATLAS_COMPLETE;
    constructor(public payload: string) {

    }
}

export type Actions = LoadCPPByIdAction
    | LoadCPPByIdCompleteAction
    | ClearCPPAction
    | AddCPPAction
    | AddCPPCompleteAction
    | UpdateCPPAction
    | UpdateCPPCompleteAction
    | LoadCPPClientDetailsByIdAction
    | LoadCPPClientDetailsByIdCompleteAction
    | AddCPPClientDetailsAction
    | AddCPPClientDetailsCompleteAction
    | UpdateCPPClientDetailsAction
    | UpdateCPPClientDetailsCompleteAction
    | SaveCPPtoAtlasAction
    | SaveCPPtoAtlasCompleteAction
    | RemoveDocumentAction
    | RemoveDocumentCompleteAction;



