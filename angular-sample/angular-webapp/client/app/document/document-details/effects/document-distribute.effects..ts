import { LoadDocumentDistributionHistory, LoadDocumentEmployeeStatus } from './../actions/document-details.actions';
import { AtlasParams } from './../../../shared/models/atlas-api-response';
import { DocumentDetailsService } from './../services/document-details.service';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { DistributedDocument } from './../models/document-details-model';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequest, AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';
import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { of } from 'rxjs/observable/of';
import * as documentDistributeActions from '../../../document/document-details/actions/document-distribute.actions';
import * as fromRoot from '../../../shared/reducers/index';
import { Http, URLSearchParams } from '@angular/http';
import { getAtlasParamValueByKey } from "../../../root-module/common/extract-helpers";
import { ActionTypes } from '../../../document/document-details/actions/document-details.actions';
import { MessengerService } from '../../../shared/services/messenger.service';
import * as errorActions from '../../../shared/actions/error.actions';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { DocumentDetailsType, DocumentDetails, ChangeHistoryModel } from '../../../document/document-details/models/document-details-model';
import { extractDocumentDetails } from '../../../document/document-details/common/document-details-extract-helper';
import * as documentDetailsActions from '../../../document/document-details/actions/document-details.actions';

;
@Injectable()
export class DocumentDistributeEffects {


    /*
    * This effect is used to get document / shared document details by Id
    */

    @Effect()
    distributedDocument$: Observable<Action> = this._actions$.ofType(documentDistributeActions.ActionTypes.DOCUMENT_DISTRIBUTE)
        .map(toPayload)
        .switchMap((payload: DistributedDocument) => {
            let params: URLSearchParams = new URLSearchParams();
            let apiUrl: string = '';
            let msg: string;
            if (payload.DocumentType === DocumentDetailsType.Document) {
                apiUrl = 'DistributedDocument/';
                msg = 'Distribution of document ';
            } else {
                apiUrl = 'distributedshareddocuments/'
                msg = 'Distribution of shared document ';
            }
            let vm = ObjectHelper.operationInProgressSnackbarMessage(msg + payload.DocumentTitle);
            this._messenger.publish('snackbar', vm);
            return this._data.put(apiUrl, payload)
                .map((res) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage(msg + payload.DocumentTitle);
                    this._messenger.publish('snackbar', vm);
                    return new documentDistributeActions.DistributeDocumentCompleteAction(<DistributedDocument>res.json())
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Distribute, msg, payload.DocumentTitle)));
                })

        });




    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService

    ) {

    }
    // End of constructor
}
