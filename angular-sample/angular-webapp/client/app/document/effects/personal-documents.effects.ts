import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { extractDocument, extractDocuments } from '../common/document-extract-helper';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { Document } from '../models/document';
import {
    ActionTypes,
    LoadPersonalDocumentsComplete,
    LoadSelectedDocumentComplete,
    RemoveDocumentComplete
} from '../actions/document.actions';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import { URLSearchParams } from '@angular/http';
import * as errorActions from '../../shared/actions/error.actions';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessengerService } from '../../shared/services/messenger.service';
@Injectable()
export class PersonalDocumentEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>, private _messenger: MessengerService) {
    }
    @Effect()
    personalDocuments$: Observable<Action> = this._actions$.ofType(ActionTypes.LOAD_PERSONAL_DOCUMENTS)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            let apiUrl = 'documentvault';
            params.set('pageNumber', '1');
            params.set('pageSize', '50');
            params.set('sortField', 'CreatedOn');
            params.set('sortOrder', 'DESC');
            params.set('action', 'GetDocumentsByRegardingObjectId');
            return this._data.get(apiUrl, { search: params });
        })
        .map((res) => {
            return new LoadPersonalDocumentsComplete(extractDocuments(res));
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "Personal document ", null)));
        });

    @Effect()
    selectDocument$: Observable<Action> = this._actions$.ofType(ActionTypes.SELECT_DOCUMENT)
        .switchMap((action) => {
            let apiUrl = 'document/' + action.payload;
            return this._data.get(apiUrl)
        })
        .map((res) => {
            return new LoadSelectedDocumentComplete(extractDocument(res));
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "Personal document ", null)));
        });

    @Effect()
    deleteDocument$: Observable<Action> = this._actions$.ofType(ActionTypes.REMOVE_DOCUMENT)
        .map(toPayload)
        .switchMap((action) => {
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Document', action.Title, action.Id);
            this._messenger.publish('snackbar', vm);
            let apiUrl = 'document/' + action.Id;
            return this._data.delete(apiUrl)
                .mergeMap(() => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Document', action.Title, action.Id);
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new RemoveDocumentComplete(true))
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, "Document", action.Title, action.Id)));
                });
        });
}