import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { processDistributedDocuments, processDistributedSharedDocuments, extractEmployeeListToAeSelect } from '../common/document-extract-helper';
import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { DistributedDocument, ActionedDocument } from './../models/DistributedDocument';
import { AtlasApiRequest, AtlasApiRequestWithParams } from './../../shared/models/atlas-api-response';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { ActionTypes } from '../actions/shared-documents.actions';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { of } from 'rxjs/observable/of';
import * as companyDocumentActions from '../actions/shared-documents.actions';
import * as fromRoot from '../../shared/reducers/index';
import { Http, URLSearchParams } from '@angular/http';
import { Employee } from "../../employee/models/employee.model";
import { getAtlasParamValueByKey } from "../../root-module/common/extract-helpers";

import * as errorActions from '../../shared/actions/error.actions';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessengerService } from '../../shared/services/messenger.service';
;
@Injectable()
export class SharedDocumentsEffects {

    // constructor
    constructor(private _actions$: Actions
        , private _data: RestClientService, private _store: Store<fromRoot.State>
        , private _messenger: MessengerService
    ) {

    }
    // End of constructor

    /**
     * This effect makes use of the `startWith` operator to trigger
     * the effect immediately on startup.
     */
    @Effect()
    loadDocumentsToReview$: Observable<Action> = this._actions$.ofType(ActionTypes.LOAD_COMPANY_DOCUMENTS_TO_REVIEW)
        .switchMap((action) => {
            let apiRequest = <AtlasApiRequestWithParams>action.payload;
            let params: URLSearchParams = new URLSearchParams();
            let actionStatus = getAtlasParamValueByKey(apiRequest.Params, 'DocumentAction');
            if (actionStatus) {
                params.set('documentAction', actionStatus);
            }            
            params.set('employeeId', "00000000-0000-0000-0000-000000000000");
            params.set('documentArea', "3");
            params.set('pageNumber', apiRequest.PageNumber.toString());
            params.set('pageSize', apiRequest.PageSize.toString());
            params.set('sortField', apiRequest.SortBy.SortField);
            params.set('direction', apiRequest.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            return this._data.get('EmpDocumentsView', { search: params });
        })
        .map((res) => {
             return new companyDocumentActions.LoadCompanyDocumentsToReviewComplete(<AtlasApiResponse<DistributedDocument>>res.json());
            // return new companyDocumentActions.LoadCompanyDocumentsToReviewComplete(processDistributedDocuments(<AtlasApiResponse<DistributedDocument>>res.json()));
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "Document", null)));
        });

    @Effect()
    loadUsefulDocumentsToReview$: Observable<Action> = this._actions$.ofType(ActionTypes.LOAD_COMPANY_USEFULDOCUMENTS_TO_REVIEW)
        .switchMap((action) => {
            let apiRequest = <AtlasApiRequestWithParams>action.payload;
            let params: URLSearchParams = new URLSearchParams();
            let actionStatus = getAtlasParamValueByKey(apiRequest.Params, 'DocumentAction');
            if (actionStatus) {
                params.set('filterSharedDocByAction', actionStatus);
            }
            params.set('pageNumber', apiRequest.PageNumber.toString());
            params.set('pageSize', apiRequest.PageSize.toString());
            params.set('sortField', apiRequest.SortBy.SortField);
            params.set('direction', apiRequest.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            return this._data.get('DistributedSharedDocumentView', { search: params });
        })
        .map((res) => {
            return new companyDocumentActions.LoadCompanyUsefulDocumentsToReviewComplete(processDistributedSharedDocuments(<AtlasApiResponse<DistributedDocument>>res.json()));
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "Document", null)));
        });

    @Effect()
    actionOnDocument$: Observable<Action> = this._actions$.ofType(ActionTypes.COMPANY_DOCUMENTS_TO_REVIEW_ACTION_CONFIRM)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _sharedDocumentState: state.sharedDocuments
            };
        })
        .switchMap((inputData) => {
            let action = inputData._payload;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Document', action.Title, action.Id);
            this._messenger.publish('snackbar', vm);
            let actiondDocument = <ActionedDocument>action;
            return this._data.put('ActionedDocument', actiondDocument)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Document', action.Title, action.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new companyDocumentActions.CompanyDocumentsToReviewConfirmActionComplete(<ActionedDocument>res.json()),
                        new companyDocumentActions.LoadCompanyDocumentsToReview(inputData._sharedDocumentState.documentsToReviewRequest)
                    ];
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, "Document", action.Title, action.Id)));
                });
        });


    @Effect()
    actionOnSharedDocument$: Observable<Action> = this._actions$.ofType(ActionTypes.COMPANY_USEFULDOCUMENTS_TO_REVIEW_ACTION_CONFIRM)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _sharedDocumentState: state.sharedDocuments
            };
        })
        .switchMap((inputData) => {
            let action = inputData._payload;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Document', action.Title, action.Id);
            this._messenger.publish('snackbar', vm);
            let actiondDocument = <ActionedDocument>action;
            return this._data.put('ActionedSharedDocument', actiondDocument)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Document', action.Title, action.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new companyDocumentActions.CompanyUsefulDocumentsToReviewConfirmActionComplete(<ActionedDocument>res.json()),
                        new companyDocumentActions.LoadCompanyDocumentsToReview(inputData._sharedDocumentState.documentsToReviewRequest)
                        // new companyDocumentActions.LoadCompanyUsefulDocumentsToReview(inputData._sharedDocumentState.usefulDocumentsToReviewRequest)
                    ];
                    // return Observable.of(new companyDocumentActions.CompanyUsefulDocumentsToReviewConfirmActionComplete(<ActionedDocument>res.json()));
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, "Document", action.Title, action.Id)));
                });
        });

    @Effect()
    SearchEmployees$: Observable<Action> = this._actions$.ofType(ActionTypes.SEARCH_EMPLOYEES)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.sharedDocuments.employeeSearchListRequest }; })
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,FirstName,MiddleName,Surname,UserId,CompanyId');
            params.set('pageNumber', "0");
            params.set('pageSize', "0");
            params.set('sortField', "FirstName");
            params.set('direction', 'asc');
            params.set('employeeViewByNameOrEmailFilter', payload._payload._atlasParams[0].Value);
            params.set('employeesByLeaverFilter', 'false');
            return this._data.get('EmployeeView/getspecificfields', { search: params });
        })
        .map(res => {
            return new companyDocumentActions.SearchEmployeesComplete(extractEmployeeListToAeSelect(res.json().Entities));
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "Document", null)));
        });


}
