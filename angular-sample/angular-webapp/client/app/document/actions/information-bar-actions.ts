import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { type } from '../../shared/util';

import { toPayload } from '@ngrx/effects';

export const ActionTypes = {
    LOAD_DOCUMENT_INFORMATIONBAR: type('[Document Informationbar] Load Document Informationbar'),
    LOAD_DOCUMENT_INFORMATIONBAR_COMPLETE: type('[Document Informationbar] Load Document Informationbar complete'),
    LOAD_DOCUMENT_INFORMATIONBAR_SPECIFIC_STAT: type('[Document Informationbar] Load Document Informationbar specific stat'),
    LOAD_DOCUMENT_INFORMATIONBAR_SPECIFIC_STAT_COMPLETE: type('[Document Informationbar] Load Document Informationbar specific stat complete'),
}

/**
* This action is to load the information bar
*/
export class LoadDocumentInformationBarAction {
    type = ActionTypes.LOAD_DOCUMENT_INFORMATIONBAR;
    constructor(public payload: string) {
    }
}


/**
* This  is complete action of load the information bar
*/
export class LoadDocumentInformationBarCompleteAction {
    type = ActionTypes.LOAD_DOCUMENT_INFORMATIONBAR_COMPLETE;
    constructor(public payload: AeInformationBarItem[]) {

    }
}

export class LoadDocumentInformationBarSpecificStatAction {
    type = ActionTypes.LOAD_DOCUMENT_INFORMATIONBAR_SPECIFIC_STAT;
    constructor(public payload: { employeeId: string, statisticIds: string }) {
    }
}


export class LoadDocumentInformationBarSpecificStatCompleteAction {
    type = ActionTypes.LOAD_DOCUMENT_INFORMATIONBAR_SPECIFIC_STAT_COMPLETE;
    constructor(public payload: AeInformationBarItem[]) {
    }
}


export type Actions = LoadDocumentInformationBarAction | LoadDocumentInformationBarCompleteAction
    | LoadDocumentInformationBarSpecificStatAction
    | LoadDocumentInformationBarSpecificStatCompleteAction;