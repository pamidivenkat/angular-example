import { Advert } from '../models/advert';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { MessengerService } from '../../shared/services/messenger.service';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Referral } from '../models/referral';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as referralActions from '../actions/referral.actions';
import * as errorActions from '../../shared/actions/error.actions';
import { URLSearchParams } from '@angular/http';

@Injectable()
export class ReferralEffects {
    constructor(
        private _actions$: Actions
        , private _data: RestClientService
        , private _messenger: MessengerService
    ) { }

    @Effect()
    saveReferral$: Observable<Action> = this._actions$.ofType(referralActions.ActionTypes.SAVE_REFERRAL_DETAILS)
        .map(toPayload)
        .switchMap((data: Referral) => {
            let snackBarVM = ObjectHelper.createInsertInProgressSnackbarMessage('Referral', data.CompanyName);
            this._messenger.publish('snackbar', snackBarVM);
            return this._data.put('ReferralsLog', data).mergeMap((res) => {
                let snackBarVM = ObjectHelper.createInsertCompleteSnackbarMessage('Referral', data.CompanyName);
                this._messenger.publish('snackbar', snackBarVM);
                return Observable.of(new referralActions.saveReferralActionComplete(data));
            })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Referral', data.CompanyName)));
                });
        })

    @Effect()
    loadAdverts$: Observable<Action> = this._actions$.ofType(referralActions.ActionTypes.LOAD_ADVERTS)
        .switchMap((action) => {
            return this._data.get('AdvertApi')
        })
        .map((res) => {
            let adverts = res.json() as Advert[];
            return new referralActions.LoadAdvertsCompleteAction(adverts);
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Advert', null)));
        });
}