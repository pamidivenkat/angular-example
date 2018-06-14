import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';
import * as Immutable from 'immutable';
import { AbsenceType } from './../../../shared/models/company.models';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';

export const ActionTypes = {

    ABSENCE_TYPE_ADD: type('[AbsenceType] Add Absence Type'),
    ABSENCE_TYPE_ADD_COMPLETE: type('[AbsenceType] Add Absence Type Complete'),
    ABSENCE_TYPE_DETAILS_BY_ID_LOAD: type('[AbsenceType] load selected absencetype'),
    ABSENCE_TYPE_DETAILS_BY_ID_LOADCOMPLETE: type('[AbsenceType] load selected absencetype  complete'),
    ABSENCE_TYPE_UPDATE: type('[AbsenceType] Update Absence Type'),
    ABSENCE_TYPE_UPDATE_COMPLETE: type('[AbsenceType] Update Absence Type Complete'),
    ABSENCE_TYPE_REMOVE: type('[AbsenceType] Remove Absence Type'),
    ABSENCE_TYPE_REMOVE_COMPLETE: type('[AbsenceType] Remove Absence Type Complete'),
};



export class AbsenceTypeAddAction implements Action {
    type = ActionTypes.ABSENCE_TYPE_ADD;
    constructor(public payload: AbsenceType) {
    }
}

export class AbsenceTypeAddCompleteAction implements Action {
    type = ActionTypes.ABSENCE_TYPE_ADD_COMPLETE;
    constructor(public payload: boolean) {
    }
}


export class AbsenceTypeByIdLoadAction implements Action {
    type = ActionTypes.ABSENCE_TYPE_DETAILS_BY_ID_LOAD;
    constructor(public payload: any) {

    }
}
export class AbsenceTypeByIdLoadCompleteAction implements Action {
    type = ActionTypes.ABSENCE_TYPE_DETAILS_BY_ID_LOADCOMPLETE;
    constructor(public payload: AbsenceType) {

    }
}

export class AbsenceTypeUpdateAction implements Action {
    type = ActionTypes.ABSENCE_TYPE_UPDATE;
    constructor(public payload: AbsenceType) {
    }
}

export class AbsenceTypeUpdateCompleteAction implements Action {
    type = ActionTypes.ABSENCE_TYPE_UPDATE_COMPLETE;
    constructor(public payload: boolean) {
    }
}

export class AbsenceTypeDeleteAction implements Action {
    type = ActionTypes.ABSENCE_TYPE_REMOVE;
    constructor(public payload: AbsenceType) {
    }
}

export class AbsenceTypeDeleteCompleteAction implements Action {
    type = ActionTypes.ABSENCE_TYPE_REMOVE_COMPLETE;
    constructor(public payload: boolean) {
    }
}



export type Actions =  AbsenceTypeAddAction | AbsenceTypeAddCompleteAction | AbsenceTypeUpdateAction | AbsenceTypeUpdateCompleteAction | AbsenceTypeDeleteAction | AbsenceTypeDeleteCompleteAction;

