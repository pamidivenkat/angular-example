import { Advert } from '../models/advert';
import { Referral } from '../models/referral';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';
import * as Immutable from 'immutable';

export const ActionTypes = {
    LOAD_ADVERTS: type('[advert] Load adverts'),
    LOAD_ADVERTS_COMPLETE: type('[advert] Load adverts complete'),
    SAVE_REFERRAL_DETAILS: type('[Referral] save start'),
    SAVE_REFERRAL_DETAILS_COMPLETE: type('[Referral] save completed')
}

export class saveReferralAction implements Action {
    type = ActionTypes.SAVE_REFERRAL_DETAILS;
    constructor(public payload: Referral) { }
}

export class saveReferralActionComplete implements Action {
    type = ActionTypes.SAVE_REFERRAL_DETAILS_COMPLETE;
    constructor(public payload: Referral) { }
}

export class LoadAdvertsAction implements Action {
    type = ActionTypes.LOAD_ADVERTS;
    constructor(public payload: true) { }
}

export class LoadAdvertsCompleteAction implements Action {
    type = ActionTypes.LOAD_ADVERTS_COMPLETE;
    constructor(public payload: Array<Advert>) { }
}