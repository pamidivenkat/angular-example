import { RestClientService } from '../../shared/data/rest-client.service';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import { Headers, Http, URLSearchParams } from '@angular/http';
import { isNullOrUndefined } from 'util';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from '../../shared/models/atlas-api-response';
import * as errorActions from '../../shared/actions/error.actions';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import * as emailActions from '../actions/email.actions';
import { User } from "../../shared/models/user";
import { CatchErrorAction } from "../../shared/actions/error.actions";
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { MessengerService } from '../../shared/services/messenger.service';
import { ObjectHelper } from '../../shared/helpers/object-helper';

@Injectable()
export class EmailEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _http: Http
        , private _messenger: MessengerService
    ) {
    }

    @Effect()
    sendEmail$: Observable<Action> = this._actions$.ofType(emailActions.ActionTypes.SEND_EMAIL)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage("Email", payload.Type);
            this._messenger.publish('snackbar', vm);
            let params: URLSearchParams = new URLSearchParams();
            return this._data.put('email/Send', payload, null)
                .map((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage("Email", payload.Type);
                    this._messenger.publish('snackbar', vm);
                    return new emailActions.SendEmailCompleteAction(true);
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, "Email", payload.Type)));
                });
        });
}
