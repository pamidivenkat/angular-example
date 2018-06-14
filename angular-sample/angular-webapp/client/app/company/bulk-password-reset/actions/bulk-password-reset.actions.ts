import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { Actions, toPayload } from '@ngrx/effects';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';
import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import {
    User,
} from '../models/bulk-password-reset.model';
import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';
import * as Immutable from 'immutable';

export const ActionTypes = {

    LOAD_USER_WITH_EMAIL: type('[User] load user with email'),
    LOAD_USER_WITH_EMAIL_COMPLETE: type('[User] load user with email complete'),

    SUBMIT_BPR_REQUEST: type('[User] Submit bulk password reset request'),
    SUBMIT_BPR_REQUEST_COMPLETE: type('[User] Submit bulk password reset request complete'),
    SUBMIT_BPR_WITHOUT_EMAIL_REQUEST: type('[User] Submit bulk password reset without email request'),
    SUBMIT_BPR_WITHOUT_EMAIL_REQUEST_COMPLETE: type('[User] Submit bulk password reset without email request complete'),

}

export class UserLoadWithEmailAction implements Action {
    type = ActionTypes.LOAD_USER_WITH_EMAIL;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class UserLoadWithEmailCompleteAction implements Action {
    type = ActionTypes.LOAD_USER_WITH_EMAIL_COMPLETE;
    constructor(public payload: any) {
    }
}
export class submitPasswordResetAction implements Action {
    type = ActionTypes.SUBMIT_BPR_REQUEST;
    constructor(public payload: any) {
    }
}

export class submitPasswordResetCompleteAction implements Action {
    type = ActionTypes.SUBMIT_BPR_REQUEST_COMPLETE;
    constructor(public payload: boolean) {
    }
}


export class submitPasswordResetWithoutEmailAction implements Action {
    type = ActionTypes.SUBMIT_BPR_WITHOUT_EMAIL_REQUEST;
    constructor(public payload: any) {
    }
}

export class submitPasswordResetWithoutEmailCompleteAction implements Action {
    type = ActionTypes.SUBMIT_BPR_WITHOUT_EMAIL_REQUEST_COMPLETE;
    constructor(public payload: boolean) {
    }
}


export type Actions = UserLoadWithEmailAction
    | UserLoadWithEmailCompleteAction

    | submitPasswordResetAction
    | submitPasswordResetCompleteAction
    | submitPasswordResetWithoutEmailAction
    | submitPasswordResetWithoutEmailCompleteAction;



