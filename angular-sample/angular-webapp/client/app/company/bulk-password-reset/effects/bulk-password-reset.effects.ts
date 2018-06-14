import { ResetPasswordVM } from './../models/reset-password-vm.model';
import { UserLoadWithEmailAction } from './../actions/bulk-password-reset.actions';
import { getAtlasParamValueByKey } from '../../../root-module/common/extract-helpers';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { extractUserList, extractUserPagingInfo } from '../common/extract-helpers';
import { State } from '../../../shared/reducers';
import { isNullOrUndefined } from 'util';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import * as bulkPasswordResetActions from '../actions/bulk-password-reset.actions';

import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';

import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { MessengerService } from '../../../shared/services/messenger.service';
import * as errorActions from '../../../shared/actions/error.actions';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import { User } from '../models/bulk-password-reset.model';


@Injectable()
export class BulkPasswordResetCompanyEffects {
    private _objectType: string = "User";
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>, private _messenger: MessengerService) {

    }


    @Effect()
    selectedUsers$: Observable<Action> = this._actions$.ofType(bulkPasswordResetActions.ActionTypes.SUBMIT_BPR_REQUEST)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.companyBulkPasswordResetState }; })
        .switchMap((data) => {
            let message = "Reset password link will be generated and sent to selected users";
            let vm = ObjectHelper.operationInProgressSnackbarMessage(message);
            this._messenger.publish('snackbar', vm);
            return this._data.post('resetpassword', data._payload)
                .map(res => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage(message);
                    this._messenger.publish('snackbar', vm);
                    return new bulkPasswordResetActions.submitPasswordResetCompleteAction(true);
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, this._objectType, 'Bulk reset password')));
                });
        });

    @Effect()
    selectedUsersWithouEmail$: Observable<Action> = this._actions$.ofType(bulkPasswordResetActions.ActionTypes.SUBMIT_BPR_WITHOUT_EMAIL_REQUEST)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: ResetPasswordVM, state) => { return { _payload: payload, _state: state.companyBulkPasswordResetState }; })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('password', data._payload.password);
            let ids: string = '';
            data._payload.ids.forEach(id => {
                if (id && id.UserId) {
                    ids = ids + id.UserId + ','
                }
            });
            ids = ids.substring(0, ids.length - 1);
            let postedBody = ids.split(',');
            params.set('ids', ids);
            let message = "Bulk reset password for no email users";
            let vm = ObjectHelper.operationInProgressSnackbarMessage(message);
            this._messenger.publish('snackbar', vm);
            return this._data.post('user', postedBody, { search: params })
                .map(res => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage(message);
                    this._messenger.publish('snackbar', vm);
                    return new bulkPasswordResetActions.submitPasswordResetWithoutEmailCompleteAction(true);
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, this._objectType, 'Bulk reset password')));
                });
        });

    @Effect()
    users$: Observable<Action> = this._actions$.ofType(bulkPasswordResetActions.ActionTypes.LOAD_USER_WITH_EMAIL)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: AtlasApiRequestWithParams, state) => { return { _payload: payload, _state: state.companyBulkPasswordResetState }; })
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('pageSize', '9999999');
            params.set('pageNumber', pl._payload.PageNumber.toString());
            params.set('sortField', pl._payload.SortBy.SortField);
            params.set('direction', pl._payload.SortBy.Direction == SortDirection.Ascending ? 'asc' : 'desc');
            params.set('fields', 'Id,FirstName,LastName,Email,UserName,HasEmail');
            params.set('UserHasEmailFilter', getAtlasParamValueByKey(pl._payload.Params, 'UserHasEmailFilter'));
            params.set('filterViewByUserNameOrEmail', getAtlasParamValueByKey(pl._payload.Params, 'filterViewByUserNameOrEmail'));
            return this._data.get('users', { search: params });
        })
        .map(res => {
            return new bulkPasswordResetActions.UserLoadWithEmailCompleteAction({ UserList: extractUserList(res), UserListPagingInfo: extractUserPagingInfo(res) });
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });



}

