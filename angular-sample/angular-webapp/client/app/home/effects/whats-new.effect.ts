import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import * as errorActions from '../../shared/actions/error.actions';
import { RestClientService } from '../../shared/data/rest-client.service';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import * as whatsNewActions from '../actions/whats-new.actions';
import { extractUnreadAndUserMaps } from '../common/extract-helpers';


@Injectable()
export class WhatsNewEffects {

    constructor(
        private _actions$: Actions
        , private _data: RestClientService
        , private _claims: ClaimsHelperService
    ) {

    }

    @Effect()
    loadWhatsNewItems$: Observable<Action> = this._actions$.ofType(whatsNewActions.ActionTypes.LOAD_WHATS_NEW_ITEMS_ACTION)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('filterCommunicationsActiveForPopup', new Date().toISOString());
            return this._data.get('WhatsNew', { search: params })
        })
        .map((res) => {
            return new whatsNewActions.LoadWhatsNewItemsCompleteAction(extractUnreadAndUserMaps(res.json(), this._claims.getUserId()));
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, null, null)));
        })

    @Effect()
    createUpdateWhatsNewUserMap$: Observable<Action> = this._actions$.ofType(whatsNewActions.ActionTypes.CREATE_UPDATE_WHATS_NEW_USERMAP_ACTION)
        .map(toPayload)
        .switchMap((payload) => {
            let newItems = [];
            let existingItems = [];
            payload.forEach(item => {
                if (isNullOrUndefined(item.Id)) {
                    newItems.push(item);
                } else {
                    existingItems.push(item);
                }
            })
            if (newItems.length > 0 && existingItems.length > 0) {
                return Observable.forkJoin(this._data.put('whatsnewusermap', newItems), this._data.post('whatsnewusermap?isRead=false', existingItems))
                    .map((res) => {
                        return new whatsNewActions.CreateUpdateWhatsNewUsermapCompleteAction(payload);
                    })
            } else if (newItems.length > 0) {
                return this._data.put('whatsnewusermap', newItems)
                    .map((res) => {
                        return new whatsNewActions.CreateUpdateWhatsNewUsermapCompleteAction(payload);
                    })
            } else if (existingItems.length > 0) {
                return this._data.post('whatsnewusermap?isRead=false', existingItems)
                    .map((res) => {
                        return new whatsNewActions.CreateUpdateWhatsNewUsermapCompleteAction(payload);
                    })
            }
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, null, null)));
        })

    @Effect()
    updateWhatsNewUserMapAsRead$: Observable<Action> = this._actions$.ofType(whatsNewActions.ActionTypes.UPDATE_WHATS_NEW_AS_READ_ACTION)
        .map(toPayload)
        .switchMap(payload => {
            return this._data.post('whatsnewusermap?isRead=true', payload)
        }).map(res => {
            return new whatsNewActions.LoadWhatsNewItemsAction(true);
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, null, null)));
        })
}