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
import * as DocumentExportToCQCActions from '../../../document/document-details/actions/document-export-to-cqc.actions';
import * as fromRoot from '../../../shared/reducers/index';
import { Http, URLSearchParams } from '@angular/http';
import { getAtlasParamValueByKey } from "../../../root-module/common/extract-helpers";
import { ActionTypes } from '../../../document/document-details/actions/document-details.actions';
import { MessengerService } from '../../../shared/services/messenger.service';
import * as errorActions from '../../../shared/actions/error.actions';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { extractCQCStandardsData, extractCQCCategoriesData, extractCQCSelectOptionListData } from "../common/document-export-to-cqc-helper";
;
@Injectable()
export class DocumentExportToCQCEffects {

    /*
    * This effect is used to get document / shared document details by Id
    */
    @Effect()
    loadCQCUsers$: Observable<Action> = this._actions$.ofType(DocumentExportToCQCActions.ActionTypes.LOAD_CQC_USERS_BY_SITEID)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('SiteId', payload)
            return this._data.get('cqcuser', { search: params })
                .map((res) => {
                    return new DocumentExportToCQCActions.LoadCQCUsersBySiteIdCompleteAction(extractCQCSelectOptionListData(res));
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "CQC users", payload)));
                })
        });

    @Effect()
    loadCQCFileTypes$: Observable<Action> = this._actions$.ofType(DocumentExportToCQCActions.ActionTypes.LOAD_CQC_FILETYPES_BY_SITEID)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('SiteId', payload)
            return this._data.get('cqcfiletype', { search: params })
                .map((res) => {
                    return new DocumentExportToCQCActions.LoadCQCFiletypesBySiteIdCompleteAction(extractCQCSelectOptionListData(res));
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "CQC users", payload)));
                })
        });

    @Effect()
    getCQCPolicy$: Observable<Action> = this._actions$.ofType(DocumentExportToCQCActions.ActionTypes.CQC_POLICYCHECK_BY_SITEID)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('SiteId', payload)
            return this._data.get('CQCPolicy', { search: params })
                .map((res) => {
                    if (!(<boolean>res.json().success)) {
                        let vm = ObjectHelper.operationCompleteSnackbarMessage('Invalid api key for selected site.');
                        this._messenger.publish('snackbar', vm);
                    }
                    return new DocumentExportToCQCActions.CQCPolicyCheckBySiteIdCompleteAction(res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "CQC policy check", payload)));
                })
        });

    @Effect()
    loadCQCStandards$: Observable<Action> = this._actions$.ofType(DocumentExportToCQCActions.ActionTypes.LOAD_CQC_STANDARDS_BY_SITEID)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('SiteId', payload)
            return this._data.get('cqcoutcome', { search: params })
                .map((res) => {
                    return new DocumentExportToCQCActions.LoadCQCStandardsBySiteIdCompleteAction(extractCQCStandardsData(res));
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "CQC users", payload)));
                })
        });


    @Effect()
    loadCQCCategories$: Observable<Action> = this._actions$.ofType(DocumentExportToCQCActions.ActionTypes.LOAD_CQC_CATEGORIES_BY_SITEID)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('SiteId', payload)
            return this._data.get('cqccategory', { search: params })
                .map((res) => {
                    return new DocumentExportToCQCActions.LoadCQCCategoriesBySiteIdCompleteAction(extractCQCCategoriesData(res));
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "CQC users", payload)));
                })
        });


    @Effect()
    addCQCProDetails$: Observable<Action> = this._actions$.ofType(DocumentExportToCQCActions.ActionTypes.ADD_CQC_PRO_DETAILS)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('SiteId', payload.SiteId)
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Export to CQC Pro', payload.policy_file);
            this._messenger.publish('snackbar', vm);
            return this._data.post('CQCPolicy', payload, { search: params })
                .map((res) => {
                    if (<boolean>res.json().success) {
                        let vm = ObjectHelper.createInsertCompleteSnackbarMessage('File exported to CQC successfully.', payload.policy_file);
                        this._messenger.publish('snackbar', vm);
                    }
                    else {
                        let vm = ObjectHelper.createInsertErrorSnackbarMessage('An error occured, Please try again.', payload.policy_file);
                        this._messenger.publish('snackbar', vm);
                    }
                    return new DocumentExportToCQCActions.AddCQCProDetailsCompleteAction(res);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "Add CQC pro details", payload)));
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
