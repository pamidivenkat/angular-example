import { KeyDocuments } from './../models/key-documents';
import { AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { KeyDocumentsLoadCompleteAction } from './../actions/key-documents-actions';
import { RestClientService } from './../../shared/data/rest-client.service';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import * as fromRoot from './../../shared/reducers/index';
import * as KeyDocumentsActions from '../actions/key-documents-actions';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessengerService } from '../../shared/services/messenger.service';
import * as errorActions from '../../shared/actions/error.actions';

@Injectable()
export class KeyDocumentsEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>) {
    }

    @Effect()
    keyDocuments$: Observable<Action> = this._actions$.ofType(KeyDocumentsActions.ActionTypes.KEY_DOCUMENTS_LOAD)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('employeeId', action.payload);
            params.set('documentArea', '3');
            params.set('pageNumber', '0');
            params.set('pageSize', '0');
            params.set('sortField', 'DateSent');
            params.set('direction', 'desc');
            params.set('categoriesToConsider', '16384,1024,128,64');
            params.set('requireToGroupByCategory', 'true');
            return this._data.get('EmpDocumentsView', { search: params })
        })
        .map((res) => {
            return new KeyDocumentsActions.KeyDocumentsLoadCompleteAction(<AtlasApiResponse<KeyDocuments>>res.json());
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Document', null)));
        });
}