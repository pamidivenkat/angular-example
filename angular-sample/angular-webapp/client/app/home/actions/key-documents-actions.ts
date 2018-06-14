import { AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { ClaimsHelperService } from './../../shared/helpers/claims-helper';
import { KeyDocuments } from './../models/key-documents';
import { type } from './../../shared/util';

import { Action } from '@ngrx/store';

export const ActionTypes = {
    KEY_DOCUMENTS_LOAD: type('[Key Documents] key Documents Load'),
    KEY_DOCUMENTS_LOAD_COMPLETE: type('[Key Documents] key Documents Load Complete')
}

export class KeyDocumentsLoadAction implements Action {
    type = ActionTypes.KEY_DOCUMENTS_LOAD;
    constructor(public payload:string) {

    }
}

export class KeyDocumentsLoadCompleteAction implements Action {
    type = ActionTypes.KEY_DOCUMENTS_LOAD_COMPLETE;
    constructor(public payload: AtlasApiResponse<KeyDocuments>) {

    }
} 

export type Actions = KeyDocumentsLoadCompleteAction | KeyDocumentsLoadAction;