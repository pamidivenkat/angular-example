import { Document } from './../../models/document';

import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';
import * as Immutable from 'immutable';
import { DocumentDetails, DocumentDetailsType } from '../../../document/document-details/models/document-details-model';
import { AtlasApiRequestWithParams, AtlasApiRequest } from '../../../shared/models/atlas-api-response';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { Response } from '@angular/http';

export const ActionTypes = {
    LOAD_DOCUMENT_DETAILS: type('[Document] Load Document details'),
    LOAD_DOCUMENT_DETAILS_COMPLETE: type('[Document] Load Document Details Complete'),
    LOAD_DOCUMENT_CHANGE_HISTORY: type('[Document] Load Document change history'),
    LOAD_DOCUMENT_CHANGE_HISTORY_COMPLETE: type('[Document] Load Document change history Complete'),
    LOAD_DOCUMENT_DISTRIBUTE_HISTORY: type('[Document] Load document distribute history status'),
    LOAD_DOCUMENT_DISTRIBUTE_HISTORY_COMPLETE: type('[Document] Load document distribute history status Complete'),
    LOAD_DOCUMENT_EMPLOYEE_STATUS: type('[Document] Load document employee status'),
    LOAD_DOCUMENT_EMPLOYEE_STATUS_COMPLETE: type('[Document] Load document employee status complete'),
    LOAD_DOCUMENT_DISTRIBUTE_HISTORY_LIST: type('[Document] Load document distribute history'),
    LOAD_DOCUMENT_EMPLOYEE_STATUS_FOR_PAGING_SORTING: type('[Document] load document employee action status on sort and page change'),
    LOAD_DOCUMENT_DISTRIBUTE_HISTORY_DELETE:type('[Document] document distribute history delete'),
    LOAD_DOCUMENT_DISTRIBUTE_HISTORY_DELETE_COMPLETE:type('[Document] document distribute history delete complete'),
    RESET_DOCUMENT_DETAILS: type('[Document] Reset Document details')
}

export class ResetDocumentDetails implements Action {
    type = ActionTypes.RESET_DOCUMENT_DETAILS;
    constructor(public payload: Response) {

    }
}

export class LoadEmployeeActionStatusForPagingSortingAction implements Action {
    type = ActionTypes.LOAD_DOCUMENT_EMPLOYEE_STATUS_FOR_PAGING_SORTING;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}



export class LoadDocumentDetails implements Action {
    type = ActionTypes.LOAD_DOCUMENT_DETAILS;
    constructor(public payload: { DocumentId: string, DocumentType: DocumentDetailsType }) {
    }
}

export class LoadDocumentDetailsComplete implements Action {
    type = ActionTypes.LOAD_DOCUMENT_DETAILS_COMPLETE;
    constructor(public payload: DocumentDetails) {
    }
}

export class LoadDocumentChangeHistory implements Action {
    type = ActionTypes.LOAD_DOCUMENT_CHANGE_HISTORY;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadDocumentChangeHistoryComplete implements Action {
    type = ActionTypes.LOAD_DOCUMENT_CHANGE_HISTORY_COMPLETE;
    constructor(public payload: any) {
    }
}

export class LoadDocumentDistributionHistory implements Action {
    type = ActionTypes.LOAD_DOCUMENT_DISTRIBUTE_HISTORY;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadDocumentDistributionHistoryComplete implements Action {
    type = ActionTypes.LOAD_DOCUMENT_DISTRIBUTE_HISTORY_COMPLETE;
    constructor(public payload: any) {
    }
}

export class LoadDocumentDistributeHistoryList implements Action {
    type = ActionTypes.LOAD_DOCUMENT_DISTRIBUTE_HISTORY_LIST;
    constructor(public payload: AtlasApiRequest) {
    }
}

export class LoadDocumentEmployeeStatus implements Action {
    type = ActionTypes.LOAD_DOCUMENT_EMPLOYEE_STATUS;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadDocumentEmployeeStatusComplete implements Action {
    type = ActionTypes.LOAD_DOCUMENT_EMPLOYEE_STATUS_COMPLETE;
    constructor(public payload: any) {
    }
}

export class LoadDocumentDistributeHistoryDelete implements Action{
    type = ActionTypes.LOAD_DOCUMENT_DISTRIBUTE_HISTORY_DELETE;
    constructor(public payload: AtlasApiRequest) {
    }
}

export class LoadDocumentDistributeHistoryDeleteComplete implements Action {
    type = ActionTypes.LOAD_DOCUMENT_DISTRIBUTE_HISTORY_DELETE_COMPLETE;
    constructor(public payload: boolean) {
    }
}

export type Actions = LoadDocumentDetails
    | LoadDocumentDetailsComplete
    | LoadDocumentChangeHistory
    | LoadDocumentChangeHistoryComplete
    | LoadDocumentDistributionHistory
    | LoadDocumentDistributionHistoryComplete
    | LoadDocumentEmployeeStatus
    | LoadDocumentEmployeeStatusComplete
    | LoadEmployeeActionStatusForPagingSortingAction
    | LoadDocumentDistributeHistoryDelete
    | LoadDocumentDistributeHistoryDeleteComplete
    | ResetDocumentDetails;
