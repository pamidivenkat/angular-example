import { AtlasParams } from './../../../shared/models/atlas-api-response';
import { ObjectHelper } from './../../../shared/helpers/object-helper';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequest, AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';
import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { of } from 'rxjs/observable/of';
import * as documentDetailsActions from '../../../document/document-details/actions/document-details.actions';
import * as fromRoot from '../../../shared/reducers/index';
import { Http, URLSearchParams } from '@angular/http';
import { getAtlasParamValueByKey } from "../../../root-module/common/extract-helpers";
import { ActionTypes } from '../../../document/document-details/actions/document-details.actions';
import { MessengerService } from '../../../shared/services/messenger.service';
import * as errorActions from '../../../shared/actions/error.actions';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import { DocumentDetailsType, DocumentDetails, ChangeHistoryModel, EmployeeActionStatusModel, DistributionHistoryModel } from '../../../document/document-details/models/document-details-model';
import { extractDocumentDetails } from '../../../document/document-details/common/document-details-extract-helper';
import { extractPagingInfo } from '../../../report/common/extract-helper';
;
@Injectable()
export class DocumentDetailsEffects {


    /*
    * This effect is used to get document / shared document details by Id
    */

    @Effect()
    loadDocumentDetailsById$: Observable<Action> = this._actions$.ofType(documentDetailsActions.ActionTypes.LOAD_DOCUMENT_DETAILS)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            let apiUrl: string;
            params.set('Id', payload.DocumentId);
            // Get document detials by Id
            if (payload.DocumentType === DocumentDetailsType.Document) {
                apiUrl = 'document/' + payload.DocumentId;

            } else {
                apiUrl = 'SharedDocument/' + payload.DocumentId;
            }
            // Get shared document details by Id
            return this._data.get(apiUrl)
                .map((res) => extractDocumentDetails(res))
                .mergeMap((docDetails: DocumentDetails) => {
                    return [
                        new documentDetailsActions.LoadDocumentDetailsComplete(docDetails),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Shared document details', payload.DocumentId)));
                })


        });


    /*
    * This effect is used to get the document change history
    */
    @Effect()
    getDocuemntChangeHistory$: Observable<Action> = this._actions$.ofType(documentDetailsActions.ActionTypes.LOAD_DOCUMENT_CHANGE_HISTORY)
        .map((action: documentDetailsActions.LoadDocumentChangeHistory) => action.payload)
        .switchMap((payload) => {
            let apiRequest = <AtlasApiRequestWithParams>payload;
            let documentId = getAtlasParamValueByKey(apiRequest.Params, 'DocumentId');
            let year = getAtlasParamValueByKey(apiRequest.Params, 'Year');
            let params: URLSearchParams = new URLSearchParams();
            params.set('filterDocumentVersion', documentId);
            params.set('filterDocumentVersionYear', year);
            params.set('Direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            params.set('fields', `Id,Version,CreatedOn,ChangedBy,Comment,LastChange`);
            params.set('pagenumber', payload.PageNumber.toString());
            params.set('pagesize', payload.PageSize.toString());
            params.set('SortField', payload.SortBy.SortField.toString());
            return this._data.get(`documentproducerversionhistoryview/getspecificfields`, { search: params })
                .map((res) =>
                    new documentDetailsActions.LoadDocumentChangeHistoryComplete({ DocumentChangeHistory: <AtlasApiResponse<ChangeHistoryModel>>res.json().Entities, ChangeHistoryPagingInfo: extractPagingInfo(res) }))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Document change history', documentId)));
                })
        });



    /*
       * This effect is used to get the document distribution history list
       */
    @Effect()
    getDocumentDistributionHistoryList$: Observable<Action> = this._actions$.ofType(documentDetailsActions.ActionTypes.LOAD_DOCUMENT_DISTRIBUTE_HISTORY)
        .map((action: documentDetailsActions.LoadDocumentDistributionHistory) => action.payload)
        .switchMap((payload) => {
            let apiRequest = <AtlasApiRequestWithParams>payload;
            let documentId = getAtlasParamValueByKey(apiRequest.Params, 'DocumentId');
            let params: URLSearchParams = new URLSearchParams();
            params.set('documentId', documentId)
            params.set('bypass', 'true')

            return this._data.get(`DistributedDocument`, { search: params })
                .map((res) =>
                    new documentDetailsActions.LoadDocumentDistributionHistoryComplete(<AtlasApiResponse<DistributionHistoryModel>>res.json()))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Distribution history list', documentId)));
                })
        });






    /*
     * This effect is used to get the document employee action status list
     */
    @Effect()
    getEmployeeActionStatusList$: Observable<Action> = this._actions$.ofType(documentDetailsActions.ActionTypes.LOAD_DOCUMENT_EMPLOYEE_STATUS)
        .map((action: documentDetailsActions.LoadDocumentEmployeeStatus) => action.payload)
        .switchMap((payload) => {
            let apiRequest = <AtlasApiRequestWithParams>payload;
            let documentId = getAtlasParamValueByKey(apiRequest.Params, 'DocumentId');
            let params: URLSearchParams = new URLSearchParams();
            params.set('documentId', documentId)
            params.set('employeeId', `00000000-0000-0000-0000-000000000000`)
            params.set('isForStats', `true`);

            return this._data.get(`document`, { search: params })
                .map((res) =>
                    new documentDetailsActions.LoadDocumentEmployeeStatusComplete(<AtlasApiResponse<EmployeeActionStatusModel>>res.json()))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee action status list', documentId)));
                })
        });

    @Effect()
    loadDistributeDocDelete$: Observable<Action> = this._actions$.ofType(documentDetailsActions.ActionTypes.LOAD_DOCUMENT_DISTRIBUTE_HISTORY_DELETE)
        .map(toPayload)
        .switchMap((pl: DistributionHistoryModel) => {
            let docId: string = pl.DistributedDocumentId;
            let bdocId: string = pl.DocumentId;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Distributed History Doc', pl.RegardingOjbectEntityValues, pl.DistributedDocumentId);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`DistributedDocument/${docId}`)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Distributed History Doc', pl.RegardingOjbectEntityValues, pl.DistributedDocumentId);
                    this._messenger.publish('snackbar', vm);
                    let atlasParams: AtlasParams[] = new Array();
                    atlasParams.push(new AtlasParams("DocumentId", pl.DocumentId));
                    return [
                        new documentDetailsActions.LoadDocumentDistributeHistoryDeleteComplete(true),
                        new documentDetailsActions.LoadDocumentDistributeHistoryList(new AtlasApiRequest(1, 10, 'RegardingObjectEntiyType', SortDirection.Descending)),
                        new documentDetailsActions.LoadDocumentEmployeeStatus(new AtlasApiRequestWithParams(1, 10, 'ActionedDate', SortDirection.Descending, atlasParams))
                    ];

                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Distributed History Doc', pl.RegardingOjbectEntityValues, pl.DistributedDocumentId)));
                })
        });

    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _messenger: MessengerService
    ) {

    }
    // End of constructor
}
