import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { Identity } from '../models/identity';
import * as userIdentityActions from '../actions/identity.actions';
import '@ngrx/core/add/operator/select';

const initialstate: Identity = {
    token: null,
    idToken: null,
    nonce: null,
    state: null,
    url: '',
    isRefreshing: false
}

export function reducer(state = initialstate, action: Action): Identity {
    switch (action.type) {
        case userIdentityActions.ActionTypes.SET_OAUTH_TOKEN:
            {
                let newState = Object.assign({}, state, { token: action.payload.token, idToken: action.payload.idToken });
                newState.token = action.payload.token;
                return newState;
            }
        case userIdentityActions.ActionTypes.SET_OAUTH_NONCE:
            {
                let newState = Object.assign({}, state, { nonce: action.payload.nonce, state: action.payload.state, url: action.payload.url });
                newState.nonce = action.payload.nonce;
                return newState;
            }
        case userIdentityActions.ActionTypes.RESET_AUTH_DATA:
            {
                return Object.assign({}, new Identity(), { url: state.url });
            }
        case userIdentityActions.ActionTypes.SET_INITIAL_STATE:
            {
                return Object.assign({}, action.payload);
            }
        case userIdentityActions.ActionTypes.REFRESH_TOKEN:
        case userIdentityActions.ActionTypes.REFRESH_TOKEN_COMPLETE:
            {
                return Object.assign({}, new Identity(), { isRefreshing: action.payload });
            }

        default:
            return state;
    }
}

export function getToken(state$: Observable<Identity>) {
    return state$.select(s => s.token);
}