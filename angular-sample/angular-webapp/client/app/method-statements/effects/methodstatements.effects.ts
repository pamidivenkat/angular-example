import { CompanyLoadAction } from './../../company/actions/company.actions';
import { RestClientService } from './../../shared/data/rest-client.service';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from './../../shared/reducers/index';
import { Headers, Http, URLSearchParams } from '@angular/http';
import { StringHelper } from './../../shared/helpers/string-helper';
import { isNullOrUndefined } from 'util';

import * as methodStatementsActions from './../actions/methodstatements.actions';
import { SortDirection, AeSortModel } from './../../atlas-elements/common/models/ae-sort-model';
import { MethodStatements, MethodStatement,MethodStatementStat } from './../models/method-statement';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams, AtlasParams } from './../../shared/models/atlas-api-response';
import * as errorActions from './../../shared/actions/error.actions';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import { MessageEvent } from './../../atlas-elements/common/models/message-event.enum';
import { getAtlasParamValueByKey, addOrUpdateAtlasParamValue } from "./../../root-module/common/extract-helpers";
import { ObjectHelper } from './../../shared/helpers/object-helper';
import { MessengerService } from './../../shared/services/messenger.service';
import { LoadMethodStatementsStatsAction } from "./../actions/methodstatements.actions";
import { Router, NavigationExtras } from "@angular/router";
import { ClaimsHelperService } from "./../../shared/helpers/claims-helper";

@Injectable()
export class MethodStatementsEffects {

    private _objectType: string = "Method Statement";
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _messenger: MessengerService
        , private _router: Router
        , private _claimsHelper: ClaimsHelperService
    ) {
    }

    @Effect()
    loadMethodStatements$: Observable<Action> = this._actions$.ofType(methodStatementsActions.ActionTypes.LOAD_METHOD_STATEMENTS_LIST)
        .map((action: methodStatementsActions.LoadMethodStatementsListAction) => action.payload)
        .withLatestFrom(this._store, (payload) => { return { _payload: payload }; })
        .switchMap((p1) => {
            let payload = p1._payload;
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,Name,ClientName,StartDate,EndDate,Site.Name as SiteName,StatusId,Description,SiteId,IsExample,CompanyId,NewLocationOfWork');

            if (!isNullOrUndefined(getAtlasParamValueByKey(payload.Params, "ByStatusId")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(payload.Params, "ByStatusId")))) {
                params.set('ByStatusId', getAtlasParamValueByKey(payload.Params, "ByStatusId").toString());

                if (!isNullOrUndefined(getAtlasParamValueByKey(payload.Params, "MSBySiteId")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(payload.Params, "MSBySiteId")))) {
                    params.set('MSBySiteId', getAtlasParamValueByKey(payload.Params, "MSBySiteId"));
                }
            }

            if (!isNullOrUndefined(getAtlasParamValueByKey(payload.Params, "ByNameOrReference")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(payload.Params, "ByNameOrReference")))) {
                params.set('ByNameOrReference', getAtlasParamValueByKey(payload.Params, "ByNameOrReference"));
            }

            if (!isNullOrUndefined(getAtlasParamValueByKey(payload.Params, "isexample")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(payload.Params, "isexample")))) {
                params.set('isexample', getAtlasParamValueByKey(payload.Params, "isexample"));
            }

            params.set('pageNumber', payload.PageNumber.toString());
            params.set('pageSize', payload.PageSize.toString());
            params.set('sortField', payload.SortBy.SortField);
            params.set('direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');

            if (getAtlasParamValueByKey(payload.Params, "ByStatusId") === 1) {
                return this._data.get('MethodStatement', { search: params })
                    .map(res =>
                        new methodStatementsActions.LoadMethodStatementsLiveListCompleteAction(res.json())
                    )
                    .catch((error) => {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Method Statements Live Projects', '')));
                    })
            } else if (getAtlasParamValueByKey(payload.Params, "ByStatusId") === 0) {
                return this._data.get('MethodStatement', { search: params })
                    .map(res =>
                        new methodStatementsActions.LoadMethodStatementsPendingListCompleteAction(res.json())
                    )
                    .catch((error) => {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Method Statements Pending Projects', '')));
                    })
            } else if (getAtlasParamValueByKey(payload.Params, "ByStatusId") === 3) {
                return this._data.get('MethodStatement', { search: params })
                    .map(res =>
                        new methodStatementsActions.LoadMethodStatementsCompletedListCompleteAction(res.json())
                    )
                    .catch((error) => {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Method Statements Completed Projects', '')));
                    })
            } else if (getAtlasParamValueByKey(payload.Params, "ByStatusId") === 4) {
                return this._data.get('MethodStatement', { search: params })
                    .map(res =>
                        new methodStatementsActions.LoadMethodStatementsArchivedListCompleteAction(res.json())
                    )
                    .catch((error) => {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Method Statements Archived Projects', '')));
                    })
            } else {
                return this._data.get('MethodStatement', { search: params })
                    .map(res =>
                        new methodStatementsActions.LoadMethodStatementsExampleListCompleteAction(res.json())
                    )
                    .catch((error) => {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Method Statements Example Projects', '')));
                    })
            }

        });

    @Effect()
    loadMethodStatementsStats$: Observable<Action> = this._actions$.ofType(methodStatementsActions.ActionTypes.LOAD_METHOD_STATEMENTS_STATS)
        .map((action: methodStatementsActions.LoadMethodStatementsStatsAction) => action.payload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            return this._data.get('MethodStatement?forStats=true', { search: params })
                .map(res =>
                    new methodStatementsActions.LoadMethodStatementsStatsCompleteAction(<Array<MethodStatementStat>>res.json())
                )
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Method Statements Stats ', '')));
                })
        });

    @Effect()
    RemoveMethodStatementById$: Observable<Action> = this._actions$.ofType(methodStatementsActions.ActionTypes.REMOVE_METHOD_STATEMENT)
        .map(toPayload)
        .switchMap((payload) => {
            let modal = payload.MethodStatements;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._objectType, modal.Name, payload.MethodStatementsId);
            this._messenger.publish('snackbar', vm);
            return this._data.delete('MethodStatement/' + payload.MethodStatements.Id)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._objectType, modal.Name, modal.MethodStatementsId);
                    this._messenger.publish('snackbar', vm);
                    payload.AtlasApiRequestWithParams.PageNumber =1;
                    return [new methodStatementsActions.RemoveMethodStatementCompleteAction(true),
                    new methodStatementsActions.LoadMethodStatementsListAction(payload.AtlasApiRequestWithParams),
                    new LoadMethodStatementsStatsAction(false)
                    ];

                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, this._objectType, modal.Name, modal.MethodStatementsId)));
                });
        });

    @Effect()
    UpdateMethodStatementStatus$: Observable<Action> = this._actions$.ofType(methodStatementsActions.ActionTypes.UPDATE_STATUS_METHOD_STATEMENT)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            if (!isNullOrUndefined(getAtlasParamValueByKey(payload.AtlasApiRequestWithParams.Params, "isexample")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(payload.AtlasApiRequestWithParams.Params, "isexample")))) {
                params.set('example', getAtlasParamValueByKey(payload.AtlasApiRequestWithParams.Params, "isexample"));
            } else {
                params.set('example', 'false');
            }
            params.set('isApprove', 'false');
            let modal = payload.UpdateStatusModel;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, modal.Name, modal.MethodStatementsId);
            this._messenger.publish('snackbar', vm);
            return this._data.post('methodstatementstatus/UpdateStatus', modal, { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, modal.Name, modal.MethodStatementsId);
                    this._messenger.publish('snackbar', vm);
                    return [new methodStatementsActions.LoadMethodStatementsListAction(payload.AtlasApiRequestWithParams),
                    new methodStatementsActions.UpdateStatusMethodStatementCompleteAction(payload.AtlasApiRequestWithParams),
                    new LoadMethodStatementsStatsAction(false)
                    ];
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, this._objectType, modal.Name, modal.MethodStatementsId)));
                });
        });

    @Effect()
    CopyMethodStatement$: Observable<Action> = this._actions$.ofType(methodStatementsActions.ActionTypes.COPY_METHOD_STATEMENT)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('example', payload.IsExample);
            params.set('copyToDifferentCompany', payload.copyToDiffCompany);
            params.set('optionalParam', 'optional');
            let modal = payload.model;
            let vm = ObjectHelper.createCopyInProgressSnackbarMessage(this._objectType, modal.Name, modal.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post('MethodStatement', modal, { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.createCopyCompleteSnackbarMessage(this._objectType, modal.Name, modal.Id);
                    this._messenger.publish('snackbar', vm);
                    let response = res.json();

                    let path: string = (response.IsExample ? '/method-statement/edit/example/' : '/method-statement/edit/') + response.Id;
                    let companyId = this._claimsHelper.getCompanyId();
                    let navigationExtras: NavigationExtras = {
                    };
                    if (payload.copyToDiffCompany) {
                        if (modal.CompanyId.toLowerCase() != companyId.toLowerCase()) {
                            navigationExtras.queryParams = { 'cid': modal.CompanyId };
                        } //? path : (path + '?cid=' + modal.CompanyId);
                    }
                    else {
                        if (modal.CompanyId.toLowerCase() != companyId.toLowerCase()) {
                            navigationExtras.queryParams = { 'cid': modal.CompanyId };
                        } //? path : (path + '?cid=' + modal.CompanyId);
                    }

                    this._router.navigate([path], navigationExtras);
                    if (!<string>res.json().IsExample) {
                        payload.AtlasApiRequestWithParams.Params = addOrUpdateAtlasParamValue(payload.AtlasApiRequestWithParams.Params, 'ByStatusId', <string>res.json().StatusId);
                    } else {
                        payload.AtlasApiRequestWithParams.Params = addOrUpdateAtlasParamValue(payload.AtlasApiRequestWithParams.Params, 'isexample', <string>res.json().IsExample);
                    }

                    payload.AtlasApiRequestWithParams.Params = addOrUpdateAtlasParamValue(payload.AtlasApiRequestWithParams.Params, 'ByStatusIdOnUpdate', <string>res.json().StatusId);
                    if (!payload.copyToDiffCompany) {
                        this._store.dispatch(new methodStatementsActions.LoadMethodStatementsListAction(payload.AtlasApiRequestWithParams));
                        this._store.dispatch(new LoadMethodStatementsStatsAction(false));
                    }
                    return [new methodStatementsActions.CopyMethodStatementCompleteAction(payload.copyToDiffCompany)];
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, this._objectType, modal.Name)));
                });
        });
}