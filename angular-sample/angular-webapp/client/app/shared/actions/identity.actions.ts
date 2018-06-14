import { Identity } from '../models/identity';
import { Action } from '@ngrx/store';
import { type } from '../util'

export const ActionTypes = {
    SET_OAUTH_TOKEN: type('[Identity] Set Token'),
    SET_OAUTH_ID_TOKEN: type('[Identity] Set Id Token'),
    SET_OAUTH_NONCE: type('[Identity] Set Nonce'),
    SET_OAUTH_STATE: type('[Identity] Set State'),
    SET_OAUTH_REDIRECT_URL: type('[Identity] Set Redirect Url'),
    RESET_AUTH_DATA: type('[Identity] Reset Auth Data'),
    SET_INITIAL_STATE: type('[Identity] Set Initial State'),
    REFRESH_TOKEN: type('[Identity] Refresh token'),
    REFRESH_TOKEN_COMPLETE: type('[Identity] Refresh token complete')
}

export class SetOAuthTokenAction implements Action {
    type = ActionTypes.SET_OAUTH_TOKEN;

    constructor(public payload: Identity) {

    }
}

export class SetOAuthNonceAction implements Action {
    type = ActionTypes.SET_OAUTH_NONCE;

    constructor(public payload: Identity) {

    }
}

export class SetInitialStateAction implements Action {
    type = ActionTypes.SET_INITIAL_STATE;

    constructor(public payload: Identity) {

    }
}

export class ResetOAuthDataAction implements Action {
    type = ActionTypes.RESET_AUTH_DATA;

    constructor(public payload: boolean) {

    }
}

export class RefreshTokenAction implements Action {
    type = ActionTypes.REFRESH_TOKEN;

    constructor(public payload: boolean) {

    }
}

export class RefreshTokenCompleteAction implements Action {
    type = ActionTypes.REFRESH_TOKEN_COMPLETE;

    constructor(public payload: boolean) {

    }
}

export type Actions = SetInitialStateAction | SetOAuthTokenAction | SetOAuthNonceAction | ResetOAuthDataAction | RefreshTokenAction | RefreshTokenCompleteAction;

