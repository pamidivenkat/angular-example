import { StringHelper } from './../../../shared/helpers/string-helper';
import { isNullOrUndefined } from 'util';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import * as errorActions from '../../../shared/actions/error.actions';
import { MessengerService } from '../../../shared/services/messenger.service';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { getAtlasParamValueByKey } from '../../../root-module/common/extract-helpers';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { extractSiteAssignmentsData, extractSitesListData, extractSitesPagingInfo } from '../common/extract-helper';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { _stateFactory, Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import * as siteActions from '../actions/sites.actions';
import { Site } from '../models/site.model';

@Injectable()
export class SitesEffects {
    private _objectType: string = "Site";
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService) {
    }

    @Effect()
    loadSitesList$: Observable<Action> = this._actions$.ofType(siteActions.ActionTypes.SITES_LIST_LOAD)
        .map((action: siteActions.SitesLoadAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.siteState.apiRequestWithParams }; })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();

            if (!isNullOrUndefined(getAtlasParamValueByKey(data._payload.Params, "cid")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(data._savedRequestFromState.Params, "cid")))) {
                params.set('cid', getAtlasParamValueByKey(data._payload.Params, "cid"));
            }
            params.set('filterSiteView', getAtlasParamValueByKey(data._payload.Params, 'filterSiteView'));
            params.set('pageNumber', data._payload.PageNumber.toString());
            params.set('pageSize', data._payload.PageSize.toString());
            params.set('sortField', data._payload.SortBy.SortField);
            params.set('direction', data._payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');

            return this._data.get('site', { search: params })
        })
        .map((res) => {
            return new siteActions.SitesLoadCompleteAction({ SitesList: extractSitesListData(res), PagingInfo: extractSitesPagingInfo(res) });
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    @Effect()
    loadSiteAssignments$: Observable<Action> = this._actions$.ofType(siteActions.ActionTypes.SITE_ASSIGNMENTS_LOAD)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.siteState }; })
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('action', 'GetCompanySiteAssignedUsers');
            params.set('id', this._claimsHelper.getCompanyIdOrCid());
            params.set('consultants', 'true');
            params.set('pageNumber', '0');
            params.set('pageSize', '0');
            return this._data.get('SiteAssignments', { search: params })
        })
        .map((res) => {
            return new siteActions.SiteAssignmentsLoadCompleteAction({ SiteAssignments: extractSiteAssignmentsData(res) });
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Site assignment', null)));
        });

    @Effect()
    loadSiteById$: Observable<Action> = this._actions$.ofType(siteActions.ActionTypes.SITES_BY_ID_LOAD)
        .map(toPayload)
        .switchMap((payload: string) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', payload);
            return this._data.get('site/getbyId', { search: params });
        })
        .map((res) => {
            return new siteActions.SiteLoadByIdCompleteAction(<Site>res.json());
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Load site', null)));
        });

    @Effect()
    removeSite$: Observable<Action> = this._actions$.ofType(siteActions.ActionTypes.REMOVE_SITE)
        .map((action: siteActions.RemoveSiteAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.siteState.apiRequestWithParams }; })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('cid', data._payload.CompanyId);
            params.set('id', data._payload.Id);
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._objectType, data._payload.Name, data._payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete('site', { search: params })
                .map((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._objectType, data._payload.Name, data._payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return new siteActions.SitesLoadAction(data._savedRequestFromState);
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, this._objectType, data._payload.Id)));
                });
        });

    @Effect()
    updateSite$: Observable<Action> = this._actions$.ofType(siteActions.ActionTypes.UPDATE_SITE)
        .map((action: siteActions.UpdateSiteAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.siteState.apiRequestWithParams }; })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            let vm = ObjectHelper.operationInProgressSnackbarMessage('Site updating...');
            this._messenger.publish('snackbar', vm);
            return this._data.post('site', data._payload)
                .map((res) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Site updated.');
                    this._messenger.publish('snackbar', vm);
                    return new siteActions.SitesLoadAction(data._savedRequestFromState);
                }).catch((error) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Site updated.');
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Site', data._payload.Name, data._payload.Id)));
                });
        });
    @Effect()
    loadSitesWithHO$: Observable<Action> = this._actions$.ofType(siteActions.ActionTypes.COMPANY_HO_ADDRESS)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('action', "GetHeadOfficeSites");
            params.set('p1', "site");
            params.set('p2', "site");
            return this._data.get('site', { search: params })
        })
        .map((res) => {
            return new siteActions.CompanyHOAddressCompleteAction(!isNullOrUndefined(res.json()[0]) ? res.json()[0].AddressLine : null);
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });
}
