import { User } from '../../../shared/models/user';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { Delegation } from '../models/delegation';
import { AtlasApiResponse, AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { extractEngineCCTypes, extractFuelTypes } from '../../common/extract-helpers';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import * as delegationActions from '../actions/delegation.actions';
import {
    LoadDelegatedUsersListAction,
    LoadDelegatedUsersListCompleteAction
} from '../actions/delegation.actions';
import { getAtlasParamValueByKey } from "./../../../root-module/common/extract-helpers";
import { ObjectHelper } from './../../../shared/helpers/object-helper';
import { MessengerService } from './../../../shared/services/messenger.service';
import * as errorActions from './../../../shared/actions/error.actions';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';


@Injectable()
export class EmployeeDelegationEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService
    ) {
    }

    @Effect()
    loadDelegationRequests$: Observable<Action> = this._actions$.ofType(delegationActions.ActionTypes.LOAD_DELEGATED_USERS_LIST)
        .map((action: delegationActions.LoadDelegatedUsersListAction) => action.payload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,UserId,User.FirstName as UserFirstName,User.LastName as UserLastName,DeligatedUserId,DeligatedUser.FirstName,DeligatedUser.LastName,DeligatedUser.Email,DeligatedHA,DeligatedReadOnlyDE,DeligatedManageDE,CreatedOn,CreatedBy');

            params.set('DelegatedUsersByUserId', getAtlasParamValueByKey(payload.Params, "UserId"));
            params.set('pageNumber', payload.PageNumber.toString());
            params.set('pageSize', payload.PageSize.toString());
            params.set('sortField', payload.SortBy.SortField);
            params.set('direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');

            return this._data.get('HolidayDelegation', { search: params });
        })
        .map(res => {
            return new delegationActions.LoadDelegatedUsersListCompleteAction(<AtlasApiResponse<Delegation>>res.json());
        }
        );


    @Effect()
    addDelegation$: Observable<Action> = this._actions$.ofType(delegationActions.ActionTypes.DELEGATED_USER_ADD)
        .map(toPayload)
        .switchMap((payload: Delegation) => {
            let userName: string = payload.FullName;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Delegation', userName);
            this._messenger.publish('snackbar', vm);
            return this._data.put(`HolidayDelegation`, payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Delegation', userName);
                    this._messenger.publish('snackbar', vm);
                    let apiRequest = new AtlasApiRequestWithParams(1, 10, 'Id', SortDirection.Ascending, [new AtlasParams('UserId', payload.UserId)]);
                    return [
                        new delegationActions.DelegatedUserAddCompleteAction(true),
                        new delegationActions.LoadDelegatedUsersListAction(apiRequest)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Delegation', userName)));
                });
        });

    @Effect()
    updateDelegation$: Observable<Action> = this._actions$.ofType(delegationActions.ActionTypes.DELEGATED_USER_UPDATE)
        .map(toPayload)
        .switchMap((payload: Delegation) => {
            let userName: string = payload.FullName;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Delegation', userName, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post(`HolidayDelegation`, payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Delegation', userName, payload.Id);
                    this._messenger.publish('snackbar', vm);
                    let apiRequest = new AtlasApiRequestWithParams(1, 10, 'Id', SortDirection.Ascending, [new AtlasParams('UserId', payload.UserId)]);
                    return [
                        new delegationActions.DelegatedUserUpdateCompleteAction(true),
                        new delegationActions.LoadDelegatedUsersListAction(apiRequest)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Delegation', userName, payload.Id)));
                });
        });

    @Effect()
    deleteDelegation$: Observable<Action> = this._actions$.ofType(delegationActions.ActionTypes.DELEGATED_USER_DELETE)
        .map(toPayload)
        .switchMap((payload: Delegation) => {
            let delegationId: string = payload.Id;
            let userName: string = payload.FirstName + ' ' + payload.LastName;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Delegation', userName, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`HolidayDelegation/${delegationId}`)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Delegation', userName, payload.Id);
                    this._messenger.publish('snackbar', vm);
                    let apiRequest = new AtlasApiRequestWithParams(1, 10, 'Id', SortDirection.Ascending, [new AtlasParams('UserId', payload.UserId)]);
                    return [
                        new delegationActions.DelegatedUserDeleteCompleteAction(true),
                        new delegationActions.LoadDelegatedUsersListAction(apiRequest),
                    ];
                })

                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Delegation', userName, payload.Id)));
                });
        });

    @Effect()
    loadDelegationUserAutosuggest$: Observable<Action> = this._actions$.ofType(delegationActions.ActionTypes.LOAD_USERS)
        .map((action: delegationActions.LoadUsersAction) => action.payload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,FirstName,LastName,Email');

            if (getAtlasParamValueByKey(payload.Params, 'Permission')) {
                params.set('UserByPermissions', getAtlasParamValueByKey(payload.Params, 'Permission'));
            }
            params.set('filterViewByUserNameOrEmail', getAtlasParamValueByKey(payload.Params, 'SearchedQuery'));
            params.set('pageNumber', payload.PageNumber.toString());
            params.set('pageSize', payload.PageSize.toString());
            params.set('sortField', payload.SortBy.SortField);
            params.set('direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            return this._data.get('User', { search: params })
                .map(res => {
                    return new delegationActions.LoadUsersCompleteAction(<AtlasApiResponse<User>>res.json());
                }
                );
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Delegation', 'users')));
        });

}

