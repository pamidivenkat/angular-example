import { DistributedDocument } from './../models/document-details-model';

import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';
import * as Immutable from 'immutable';
import { DocumentDetails, DocumentDetailsType } from '../../../document/document-details/models/document-details-model';
import { AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';

export const ActionTypes = {
    DOCUMENT_DISTRIBUTE: type('[DocumentDistribute] Document distribute'),
    DOCUMENT_DISTRIBUTE_COMPLETE: type('[DocumentDistribute] Document distribute Complete')    
}

export class DistributeDocumentAction implements Action {
    type = ActionTypes.DOCUMENT_DISTRIBUTE;
    constructor(public payload:DistributedDocument) {
    }
}

export class DistributeDocumentCompleteAction implements Action {
    type = ActionTypes.DOCUMENT_DISTRIBUTE_COMPLETE;
    constructor(public payload: DistributedDocument) {
    }
}

 
export type Actions = DistributeDocumentAction 
                    | DistributeDocumentCompleteAction 
                    