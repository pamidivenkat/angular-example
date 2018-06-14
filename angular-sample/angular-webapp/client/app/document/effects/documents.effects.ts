import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { LoadPersonalDocuments } from '../actions/document.actions';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as documentActions from '../actions/document.actions';
import * as fromRoot from '../../shared/reducers/index';
import { Headers, Http, URLSearchParams } from '@angular/http';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessengerService } from '../../shared/services/messenger.service';
import { DocumentService } from '../services/document-service';
import * as errorActions from '../../shared/actions/error.actions';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
@Injectable()
export class DocumentEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _http: Http
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService
    ) {
    }

    @Effect()
    updateDocument$: Observable<Action> = this._actions$.ofType(documentActions.ActionTypes.UPDATE_DOCUMENT)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Document personlise', payload.Title, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post('document', payload)
                .mergeMap(() => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Document personlise', payload.Title, payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new LoadPersonalDocuments(true));
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, "Document personlise", payload.Title, payload.Id)));
                })
        });
}