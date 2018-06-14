import { Store } from '@ngrx/store';
import { Referral } from '../models/referral';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as referralActions from '../actions/referral.actions';

@Injectable()
export class ReferralService {
    // constructor
    constructor(private _store: Store<fromRoot.State>) {

    }
    saveReferralDetails(referral: Referral){
        this._store.dispatch(new referralActions.saveReferralAction(referral));
    }
}