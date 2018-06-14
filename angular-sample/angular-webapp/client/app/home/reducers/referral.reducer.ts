import { Advert } from '../models/advert';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import { Referral } from '../models/referral';
import * as referralActions from '../actions/referral.actions';
import * as Immutable from 'immutable';

export interface ReferralState {
    status: boolean,
    adverts: Array<Advert>
    entities: Referral
}

const initialState = {
    status: false,
    entities: null,
    adverts: null
}

export function reducer(state = initialState, action: Action): ReferralState {
    switch (action.type) {
        case referralActions.ActionTypes.SAVE_REFERRAL_DETAILS: {
            return Object.assign({}, state, { status: true, entities: action.payload });
        }
        case referralActions.ActionTypes.LOAD_ADVERTS:
            {
                return Object.assign({}, state, { status: false });
            }
        case referralActions.ActionTypes.LOAD_ADVERTS_COMPLETE:
            {
                return Object.assign({}, state, { status: true, adverts: action.payload });
            }
        default:
            return state;
    }
}

export function saveReferral(state$: Observable<ReferralState>): Observable<Referral> {
    return state$.select(s => s.entities);
}

export function getAdverts(state$: Observable<ReferralState>): Observable<Array<Advert>> {
    return state$.select(s => s && s.adverts);
}

export function getAdvertsStatus(state$: Observable<ReferralState>) : Observable<boolean>{
    return state$.select(s => s && s.status);
}