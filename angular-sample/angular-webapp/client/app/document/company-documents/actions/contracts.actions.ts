import { Action } from '@ngrx/store';
import { type } from './../../../shared/util';
import { Document } from './../../models/document';
import * as Immutable from 'immutable';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';

export const ActionTypes = {
    LOAD_CONTRACTS_DOCS_LIST: type('[Document] Load Contracts Documents'),
    LOAD_CONTRACTS_DOCS_LIST_COMPLETE: type('[Document] Load Contracts Documents Complete'),
    LOAD_PERSONALISED_CONTRACTS_DOCS_LIST_COMPLETE: type('[Document] Load Personal Contracts Documents Complete'),
    LOAD_CONTRACT_DOCS_COUNT: type('[Document] Load Contracts Documents Count'),
    LOAD_CONTRACT_DOCS_COUNT_COMPLETE: type('[Document] Load Contracts Documents Count Complete'),
    LOAD_PERSONAL_CONTRACT_DOCS_COUNT: type('[Document] Load Personal Contracts Documents Count'),
    LOAD_PERSONAL_CONTRACT_DOCS_COUNT_COMPLETE: type('[Document] Load Personal Contracts Documents Count Complete'),
    CONTRACTS_DATA_CLEAR: type('[Document] Load Personal Contracts Documents data clear'),
    SAVE_CONTRACT_AS_PDF: type('[Document] Save Contract as pdf'),
    SAVE_CONTRACT_AS_PDF_COMPLETE: type('[Document] Save Contract as pdf Complete'),
    UPDATE_PERSONALISED_CONTRACT_ITEM: type('[Document] Update personalised contract item'),
    LOAD_ASSOCIATED_USER_VERSION_DOCUMENT:type('[Document] load associated user document'),
    LOAD_ASSOCIATED_USER_VERSION_DOCUMENT_COMPLETE:type('[Document] load associated user document complete'),
    CONTRACTS_CLEAR:type('[Document] contracts clear action')
}

/** Actions for  Contracts Documents **/
export class ContractsClearAction implements Action {
    type = ActionTypes.CONTRACTS_CLEAR;
    constructor() {
    }
}

export class LoadAssociatedUserVersionDocument implements Action {
    type = ActionTypes.LOAD_ASSOCIATED_USER_VERSION_DOCUMENT;
    constructor(public payload: string) {
    }
}
export class LoadAssociatedUserVersionDocumentComplete implements Action {
    type = ActionTypes.LOAD_ASSOCIATED_USER_VERSION_DOCUMENT_COMPLETE;
    constructor(public payload: string) {
    }
}

export class LoadContractsListAction implements Action {
    type = ActionTypes.LOAD_CONTRACTS_DOCS_LIST;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadContractsListCompleteAction implements Action {
    type = ActionTypes.LOAD_CONTRACTS_DOCS_LIST_COMPLETE;
    constructor(public payload: AtlasApiResponse<Document>) {
    }
}

export class LoadPersonalContractsListCompleteAction implements Action {
    type = ActionTypes.LOAD_PERSONALISED_CONTRACTS_DOCS_LIST_COMPLETE;
    constructor(public payload: AtlasApiResponse<Document>) {
    }
}

export class LoadContractsTemplateCountAction implements Action {
    type = ActionTypes.LOAD_CONTRACT_DOCS_COUNT;
    constructor(public payload: boolean) {

    }
}

export class LoadContractsTemplateCountCompleteAction implements Action {
    type = ActionTypes.LOAD_CONTRACT_DOCS_COUNT_COMPLETE;
    constructor(public payload: AtlasApiResponse<Document>) {

    }
}

export class LoadPersonalContractsCountAction implements Action {
    type = ActionTypes.LOAD_PERSONAL_CONTRACT_DOCS_COUNT;
    constructor(public payload: boolean) {

    }
}

export class LoadPersonalContractsCountCompleteAction implements Action {
    type = ActionTypes.LOAD_PERSONAL_CONTRACT_DOCS_COUNT_COMPLETE;
    constructor(public payload: AtlasApiResponse<Document>) {

    }
}

export class ContractsDataClearAction implements Action {
    type = ActionTypes.CONTRACTS_DATA_CLEAR;
    constructor() {
    }
}

export class SaveContractAsPDFAction implements Action {
    type = ActionTypes.SAVE_CONTRACT_AS_PDF;
    constructor(public payload: Document) {

    }
}

export class SaveContractAsPDFCompleteAction implements Action {
    type = ActionTypes.SAVE_CONTRACT_AS_PDF_COMPLETE;
    constructor() {
    }
}

export class UpdatePersonalisedItem implements Action {
    type = ActionTypes.UPDATE_PERSONALISED_CONTRACT_ITEM;
    constructor(public payload: string) {
    }
}
export type Actions = LoadContractsListAction
    | LoadContractsListCompleteAction
    | LoadPersonalContractsListCompleteAction
    | LoadContractsTemplateCountAction
    | LoadContractsTemplateCountCompleteAction
    | LoadPersonalContractsCountAction
    | LoadPersonalContractsCountCompleteAction
    | ContractsDataClearAction
    | SaveContractAsPDFAction
    | SaveContractAsPDFCompleteAction
    | UpdatePersonalisedItem
    | LoadAssociatedUserVersionDocument
    | LoadAssociatedUserVersionDocumentComplete
    | ContractsClearAction