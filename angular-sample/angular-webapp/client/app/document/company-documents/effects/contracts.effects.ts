import { LoadAssociatedUserVersionDocumentComplete } from './../actions/contracts.actions';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from './../../../shared/reducers/index';
import { Headers, Http, URLSearchParams } from '@angular/http';
import { StringHelper } from './../../../shared/helpers/string-helper';
import { isNullOrUndefined } from 'util';

import * as contractsActions from '../actions/contracts.actions';
import { SortDirection } from './../../../atlas-elements/common/models/ae-sort-model';
import { Document } from './../../models/document';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import * as errorActions from './../../../shared/actions/error.actions';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';
import { getAtlasParamValueByKey } from "./../../../root-module/common/extract-helpers";
import { ClaimsHelperService } from "./../../../shared/helpers/claims-helper";
import { v1AppUrl } from "./../../../shared/app.constants";
import { MessengerService } from './../../../shared/services/messenger.service';
import { ObjectHelper } from './../../../shared/helpers/object-helper';

@Injectable()
export class ContractsEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _http: Http
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService) {
    }


    @Effect()
    loadContracts$: Observable<Action> = this._actions$.ofType(contractsActions.ActionTypes.LOAD_CONTRACTS_DOCS_LIST)
        .map((action: contractsActions.LoadContractsListAction) => action.payload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            let contractsFilter = getAtlasParamValueByKey(payload.Params, "contractsFilter");
            //1-for contract tempaltes
            //2-for personalized contracts
            if (!isNullOrUndefined(getAtlasParamValueByKey(payload.Params, "contractsFilter")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(payload.Params, "contractsFilter")))) {
                params.set('contractsFilter', getAtlasParamValueByKey(payload.Params, "contractsFilter"));
            }
            //based on the contractsFilter the appliable filter value will change for site,deparment,employee..

            if (!isNullOrUndefined(getAtlasParamValueByKey(payload.Params, "site")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(payload.Params, "site")))) {
                if (contractsFilter == 1) {
                    params.set('filterDocumentByRegObjId', getAtlasParamValueByKey(payload.Params, "site"));
                } else {
                    params.set('fitlerDocumentByEmpSite', getAtlasParamValueByKey(payload.Params, "site"));
                }
            }

            if (!isNullOrUndefined(getAtlasParamValueByKey(payload.Params, "department")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(payload.Params, "department")))) {
                if (contractsFilter == 2) {
                    params.set('filterDocumentByEmpDepartment', getAtlasParamValueByKey(payload.Params, "department"));
                }
            }

            if (!isNullOrUndefined(getAtlasParamValueByKey(payload.Params, "employee")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(payload.Params, "employee")))) {
                if (contractsFilter == 2) {
                    params.set('filterDocumentByEmployee', getAtlasParamValueByKey(payload.Params, "employee"));
                }
            }

            params.set('pageNumber', payload.PageNumber.toString());
            params.set('pageSize', payload.PageSize.toString());
            params.set('sortField', payload.SortBy.SortField);
            params.set('direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            if (getAtlasParamValueByKey(payload.Params, "contractsFilter") == 1) {
                return this._data.get('Document', { search: params })
                    .map(res =>
                        new contractsActions.LoadContractsListCompleteAction(res.json())
                    )
                    .catch((error) => {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Contract Documents', '')));
                    })
            } else {
                return this._data.get('Document', { search: params })
                    .map(res =>
                        new contractsActions.LoadPersonalContractsListCompleteAction(res.json())
                    )
                    .catch((error) => {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Contract Documents', '')));
                    })
            }

        });

    @Effect()
    contractDocsCount$: Observable<Action> = this._actions$.ofType(contractsActions.ActionTypes.LOAD_CONTRACT_DOCS_COUNT)
        .map((action: contractsActions.LoadContractsTemplateCountAction) => action.payload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,Title');
            params.set('contractsFilter', '1');
            params.set('pageNumber', '1');
            params.set('pageSize', '1');
            params.set('sortField', 'Title');
            params.set('direction', 'asc');
            return this._data.get(`Document`, { search: params })
                .map((res) => new contractsActions.LoadContractsTemplateCountCompleteAction(res.json()))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Contract Documents count', '')));
                })
        });
    @Effect()
    personalContractCount$: Observable<Action> = this._actions$.ofType(contractsActions.ActionTypes.LOAD_PERSONAL_CONTRACT_DOCS_COUNT)
        .map((action: contractsActions.LoadPersonalContractsCountAction) => action.payload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,Title');
            params.set('contractsFilter', '2');
            params.set('pageNumber', '1');
            params.set('pageSize', '1');
            params.set('sortField', 'Title');
            params.set('direction', 'asc');
            return this._data.get(`Document`, { search: params })
                .map((res) => new contractsActions.LoadPersonalContractsCountCompleteAction(res.json()))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Personal Contract Documents count', '')));
                })
        });
    @Effect()
    saveContractAsPDF$: Observable<Action> = this._actions$.ofType(contractsActions.ActionTypes.SAVE_CONTRACT_AS_PDF)
        .map((action: contractsActions.SaveContractAsPDFAction) => action.payload)
        .switchMap((payload) => {

            let params: URLSearchParams = new URLSearchParams();
            let version: string;
            params.set('objectId', payload.Id);
            params.set('otc', '20');
            return this._data.get(`attachment/find`, { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.operationInProgressSnackbarMessage("preparing content, please wait..");
                    this._messenger.publish('snackbar', vm);
                    let response = res.json();
                    let previewParams: URLSearchParams = new URLSearchParams();
                    if (!isNullOrUndefined(response)) {
                        var splittedVersion = response.Document && response.Document.Version ? response.Document.Version.split(".") : { 0: 1, 1: 0 };
                        version = splittedVersion.length == 0 ? '1.0' : (parseInt(splittedVersion[0]) + 1) + ".0";
                    }
                    else {
                        version = "1.0";
                    }
                    previewParams.set('version', version);
                    previewParams.set('cid', this._claimsHelper.getCompanyId());
                    previewParams.set('hash', new Date().toDateString());
                    previewParams.set('removeFormat', 'true');

                    return this._http.get(`documentproducer/preview/` + payload.Id, { search: previewParams })
                        .mergeMap((res) => {
                            let vm = ObjectHelper.operationCompleteSnackbarMessage("Generating pdf " + payload.Title);
                            this._messenger.publish('snackbar', vm);
                            let content = res.text();
                            if (!isNullOrUndefined(content)) {
                                content = content.replace(/<script type=\"text\/javascript">window.NREUM(.*)<\/script>/g, "");
                            }
                            let model: any = new Object();
                            model.AttachTo = { Id: payload.Id, ObjectTypeCode: 20 }
                            model.DocumentId = payload.Id;
                            model.Category = payload.Category;
                            model.Content = content;
                            model.FileName = payload.Title + ".pdf";
                            model.RegardingObject = payload.RegardingObject;
                            model.Title = payload.Title;
                            model.PdfContent = content;
                            model.Version = version;
                            model.Comment = payload.Comment;
                            let sm = ObjectHelper.createInsertInProgressSnackbarMessage("Document", payload.Title);
                            this._messenger.publish('snackbar', sm);
                            return this._data.post(`pdfgenerator`, model, null)
                                .mergeMap((res) => {
                                    let response = res.json();
                                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage("Document", payload.Title);
                                    this._messenger.publish('snackbar', vm);
                                    return [new contractsActions.SaveContractAsPDFCompleteAction()];
                                });
                        });
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Document', payload.Title)));
                });
        });

    @Effect()
    loadAssociatedUserVersion$: Observable<Action> = this._actions$.ofType(contractsActions.ActionTypes.LOAD_ASSOCIATED_USER_VERSION_DOCUMENT)
        .map((action: contractsActions.LoadAssociatedUserVersionDocument) => action.payload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('objectid', payload);
            params.set('otc', '20');
            params.set('action', 'find');
            return this._data.get(`Attachment`, { search: params })
                .map((res) => new contractsActions.LoadAssociatedUserVersionDocumentComplete((<any>res.json()).Document))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Document', '')));
                })
        });
}