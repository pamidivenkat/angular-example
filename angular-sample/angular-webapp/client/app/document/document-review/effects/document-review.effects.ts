import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { LoadCitationDraftsListAction } from '../../citation-drafts-documents/actions/citation-drafts.actions';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasParams, AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';
import { MessengerService } from '../../../shared/services/messenger.service';
import { Artifact } from '../../models/artifact';
import { Observable } from 'rxjs/Rx';
import { Effect, Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import { ActionTypes } from '../actions/document-review.actions';
import * as fromRoot from '../../../shared/reducers/index';
import * as documentReviewAction from '../actions/document-review.actions';
import { Http, URLSearchParams } from '@angular/http';
import { Document } from '../../models/document';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import * as errorActions from '../../../shared/actions/error.actions';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';

@Injectable()
export class DocumentReviewEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _messenger: MessengerService) {
    }

    @Effect()
    loadDocumentReview$: Observable<Action> = this._actions$.ofType(ActionTypes.LOAD_REVIEW_DOCUMENT)
        .switchMap((action) => {
            let documentId = <string>action.payload;
            let apirUrl = "documentproducerapproval/" + documentId;
            return this._data.get(apirUrl);
        })
        .map((res) => {
            return new documentReviewAction.LoadReviewDocumentComplete(res.json() as Artifact);
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "Document review", '')));
        })

    @Effect()
    getPreviousVersionDocument$: Observable<Action> = this._actions$.ofType(ActionTypes.LOAD_REVIEW_DOCUMENT)
        .switchMap((action) => {
            let documentId = <string>action.payload;
            let params: URLSearchParams = new URLSearchParams();
            params.set('getPreviousVersion', 'true');
            let apirUrl = "document/GetPreviousVersionOfDocumnet/" + documentId;
            return this._data.get(apirUrl, { search: params });
        })
        .map((res) => {
            return new documentReviewAction.GetDocumentPreviousVersionComplete(res.json() as Document);
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "Document review", '')));
        })

    @Effect()
    saveReviewedDocument$: Observable<Action> = this._actions$.ofType(ActionTypes.SAVE_REVIEW_DOCUMENT)
        .switchMap((action) => {
            let artifact = <Artifact>action.payload;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Document', artifact.Title, artifact.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post('documentproducer', artifact)
        })
        .map((res) => {
            let artifact = res.json() as Artifact;
            let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Document', artifact.Title, artifact.Id);
            this._messenger.publish('snackbar', vm);
            let params: AtlasParams[] = new Array();
            let _draftApiRequest = new AtlasApiRequestWithParams(1, 10, 'ModifiedOn', SortDirection.Descending, params);
            this._store.dispatch(new LoadCitationDraftsListAction(_draftApiRequest));
            return new documentReviewAction.LoadReviewDocumentComplete(artifact);
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, "Document review", '')));
        })
}