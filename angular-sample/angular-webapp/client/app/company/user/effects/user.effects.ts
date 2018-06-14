
import { ResetPasswordVM } from '../../../employee/administration/models/user-admin-details.model';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { RouteParams } from '../../../shared/services/route-params';

import { BaseMessageVM } from '../../../shared/models/base-message-vm';
import { UserSnackbarMessage } from '../common/user-snackbar-message';
import {
    extractAcnOptionListData,
    extractUserList,
    extractAvailability,
    extractUserPagingInfo,
    extractUserPermissionsViewVm,
    extractPermissionsData,
    extractAuditLogData
} from '../common/extract-helpers';
import { State } from '../../../shared/reducers';
import { isNullOrUndefined } from 'util';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import * as userActions from '../actions/user.actions';

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
import { User } from '../models/user.model';
import { getAtlasParamValueByKey } from '../../../root-module/common/extract-helpers';

@Injectable()
export class CompanyUserEffects {
    private _objectType: string = "User";
    private _currentUserFullEntity: any;
    private _permissionGroupsFullEntity: any

    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _messenger: MessengerService
        , private _routeParams: RouteParams
        , private _claimsHelper: ClaimsHelperService) {


    }

    @Effect()
    AdviceCardOptionList$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.ADVICE_CARD_NUMBER_OPTION_LOAD)
        .switchMap((action) => {
            let companyId: string = this._claimsHelper.getCompanyIdOrCid();
            return this._data.get('AdviceCard?filterUnAssignedAdviceCards=' + companyId);

        })
        .map((res) => {
            return new userActions.LoadAdviceCardNumberOptionCompleteAction(extractAcnOptionListData(res));
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    @Effect()
    SaveadviceAssignments$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.SAVE_ACN_ASSIGNMENTS)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.companyUserState }; })
        .switchMap((pl) => {
            let assignPl = pl._payload;
            let apiUrl = 'AdviceCardAssignments/SetAssignedAdviceCards?assigned=true';
            return this._data.post(apiUrl, assignPl)
                .map((res) => {
                    this._store.dispatch(new userActions.UserLoadAction(pl._state.Filters));
                    return new userActions.SaveAdviceCardAssignmentsCompleted(true);
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, this._objectType, null)));
                })
        });

    @Effect()
    ValidateUserName$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.VALIDATE_USER_NAME)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('chekUserName', 'true');
            params.set('userName', payload.toString())
            return this._data.get('user/UserNameAvailability/00000000-0000-0000-0000-000000000000', { search: params });
        })
        .map((res) => {
            return new userActions.ValidateUserNameCompletedAction(extractAvailability(res));
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    @Effect()
    ValidateEmail$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.VALIDATE_EMAIL)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('email', payload.toString());
            return this._data.get('user/EmailAvailability/00000000-0000-0000-0000-000000000000', { search: params })
        }).map((res) => {
            return new userActions.ValidateEmailCompleteAction(extractAvailability(res));
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    @Effect()
    addUser$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.USER_ADD)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.companyUserState }; })
        .switchMap((pl) => {
            let data = pl._payload;
            let modal = <User>data;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage(this._objectType, modal.Email ? modal.Email : modal.UserName);
            this._messenger.publish('snackbar', vm);
            let apiUrl = 'users';
            return this._data.put(apiUrl, data)
                .mergeMap((res) => {
                    let user = res.json() as User;
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage(this._objectType, modal.Email ? modal.Email : modal.UserName);
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new userActions.AddUserCompletedAction(user));
                }).catch((error) => {
                    this._store.dispatch(new userActions.UserLoadAction(pl._state.Filters)); // refresh the grid listing
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, this._objectType, modal.Email ? modal.Email : modal.UserName)));
                });
        });

    @Effect()
    updateUser$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.USER_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.companyUserState }; })
        .switchMap((pl) => {
            let data = pl._payload;
            let modal = <User>data;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, modal.Email ? modal.Email : modal.UserName, 'id111');
            this._messenger.publish('snackbar', vm);
            let apiUrl = 'users/UpdateUser?optionalParam=true';
            return this._data.post(apiUrl, data)
                .mergeMap((res) => {
                    let user = res.json() as User;
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, modal.Email ? modal.Email : modal.UserName, 'id111');
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new userActions.UpdateUserCompletedAction(user));
                }).catch((error) => {
                    this._store.dispatch(new userActions.UserLoadAction(pl._state.Filters)); // refresh the grid listing
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'User', modal.Email ? modal.Email : modal.UserName, 'id111')));
                });
        });


    @Effect()
    users$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.USER_LOAD, userActions.ActionTypes.LOAD_USER_ON_SORT, userActions.ActionTypes.LOAD_USER_ON_FILTER_CHANGE, userActions.ActionTypes.LOAD_USER_ON_PAGE_CHANGE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.companyUserState }; })
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('IsList', 'true');
            if (payload._state && payload._state.UserListPagingInfo) {
                params.set('pageNumber', payload._state.UserListPagingInfo.PageNumber ? payload._state.UserListPagingInfo.PageNumber.toString() : '1');
                params.set('pageSize', payload._state.UserListPagingInfo.Count ? payload._state.UserListPagingInfo.Count.toString() : '10');
            }
            else {
                params.set('pageNumber', '1');
                params.set('pageSize', '10');
            }
            //End of Paging

            //Sorting
            if (payload._state && payload._state.UserListSortingInfo) {
                params.set('sortField', payload._state.UserListSortingInfo.SortField);
                params.set('direction', payload._state.UserListSortingInfo.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            }
            else {
                params.set('sortField', 'FullName');
                params.set('direction', 'asc');
            }
            //Filtering
            if (payload._state.Filters && payload._state.Filters.size > 0) {
                payload._state.Filters.forEach((value: string, key: string) => {
                    params.set(key, value);
                });
            } else if (payload._payload && payload._payload.size > 0) {
                payload._payload.forEach((value: string, key: string) => {
                    params.set(key, value);
                });
            }
            // End of Filtering

            return this._data.get('users', { search: params });
        })
        .map(res => {
            return new userActions.UserLoadCompleteAction({ UserList: extractUserList(res), UserListPagingInfo: extractUserPagingInfo(res) });
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });


    @Effect()
    DeleteUserById$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.USER_REMOVE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.companyUserState }; })
        .switchMap((pl) => {
            //inprogrss snackbar msg
            let payload = pl._payload;
            let modal = payload;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._objectType, payload.Name, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete('user/' + payload.Id)
                .mergeMap((res) => {
                    this._store.dispatch(new userActions.UserLoadAction(pl._state.Filters));
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._objectType, modal.Name, modal.Id);
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new userActions.UserLoadAction(pl._state.Filters));
                }).catch((error) => {
                    this._store.dispatch(new userActions.UserLoadAction(pl._state.Filters)); // refresh the grid listing
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, this._objectType, modal.Name, modal.Id)));
                });
        });


    @Effect()
    DisableUserById$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.USER_DISABLE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.companyUserState }; })
        .switchMap((pl) => {
            let payload = pl._payload;
            let modal = payload;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessageGeneric<UserSnackbarMessage>(UserSnackbarMessage, this._objectType, modal.Name, modal.Id);
            if (payload.IsActive) {
                vm.state = "Disable";
            } else {
                vm.state = "Enable";
            }
            this._messenger.publish('snackbar', vm);
            return this._data.post('Users/' + payload.Id + '?status=' + !payload.IsActive, {})
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessageGeneric<UserSnackbarMessage>(UserSnackbarMessage, this._objectType, modal.Name, modal.Id);
                    if (res.json().IsActive) {
                        vm.state = "Enable";
                    } else {
                        vm.state = "Disable";
                    }
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new userActions.UserLoadAction(pl._state.Filters));
                }).catch((error) => {
                    this._store.dispatch(new userActions.UserLoadAction(pl._state.Filters)); // refresh the grid listing
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, this._objectType, modal.Name, modal.Id)));
                });
        })

    @Effect()
    UserPermissionsById$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.GET_USER_PERMISSIONS)
        .map(toPayload)
        .switchMap((payload) => {
            return this._data.get('users/' + 'getbyid/' + payload + '?includeRoles=' + payload);
        })
        .map((res) => {
            this._currentUserFullEntity = res.json();
            return new userActions.GetUserPermisssionsCompleteAction(extractUserPermissionsViewVm(res));
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });


    @Effect()
    updateEmployeeGroup$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.UPDATE_USER_PERMISSIONS)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('User permission', this._currentUserFullEntity.FullName, this._currentUserFullEntity.Id);
            this._messenger.publish('snackbar', vm);
            let apiUrl = 'users';
            let fullEntity = Object.create(this._currentUserFullEntity);
            fullEntity.Permissions = []; //Permissions data
            fullEntity.UserProfiles = payload['UserProfiles']; //assign profile data
            this._permissionGroupsFullEntity.forEach((group) => {
                group.Permissions.forEach((permission) => {
                    if (payload['Permissions'].indexOf(permission.Id) !== -1) {
                        fullEntity.Permissions.push(permission);
                    }
                })
            });
            let finalPostPayload = Object.assign({}, this._currentUserFullEntity, fullEntity);
            return this._data.post(apiUrl, finalPostPayload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('User permission', this._currentUserFullEntity.FullName, this._currentUserFullEntity.Id);
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new userActions.UpdateUserPermisssionsCompleteAction(true));
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'User permission', this._currentUserFullEntity.FullName, this._currentUserFullEntity.Id)));
                });
        });

    @Effect()
    GetPermissionsData$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.GET_PERMISSIONS)
        .map(toPayload)
        .switchMap((payload) => {
            let params = new URLSearchParams();
            params.set('action', 'GetPermissionsWithGroup');
            params.set('optionalParam1', 'true');
            params.set('optionalParam2', 'empty');
            return this._data.get('Permissions', { search: params })
        })
        .map((res) => {
            this._permissionGroupsFullEntity = res.json();
            return new userActions.GetPermisssionsCompleteAction(extractPermissionsData(res));
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    @Effect()
    loadUserInfo$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.LOAD_USER_INFO)
        .map(toPayload)
        .switchMap((payload: string) => {
            let params = new URLSearchParams();
            params.set('fields', 'Id,FirstName,LastName,HasEmail');
            params.set('Id', payload);
            return this._data.get('user', { search: params })
        })
        .map((res) => {
            let userInfo = <User>res.json();
            return new userActions.LoadUserInfoCompleteAction(userInfo);
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });


    @Effect()
    resetPassword$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.PASSWORD_RESET)
        .map(toPayload)
        .switchMap((payload: ResetPasswordVM) => {
            // Reset password : Email user
            if (!isNullOrUndefined(payload) && payload.IsEmailUser) {
                var loginModel = { UserName: payload.Email };
                let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Reset password', payload.Email, payload.UserId);
                this._messenger.publish('snackbar', vm);
                return this._data.put(`resetpassword`, loginModel).map((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Reset password', payload.Email, payload.UserId);
                    this._messenger.publish('snackbar', vm);
                    return new userActions.ResetPasswordCompleteAction(payload);
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Reset password', payload.UserId)));
                });;
            } else {
                // Reset password : NoEmail user
                let params: URLSearchParams = new URLSearchParams;
                params.set('id', payload.UserId);
                params.set('password', payload.NewPassword);
                let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Reset password', payload.Email, payload.UserId);
                this._messenger.publish('snackbar', vm);
                return this._data.post(`user/ManualResetPassword`, null, { search: params }).map((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Reset password', payload.Email, payload.UserId);
                    this._messenger.publish('snackbar', vm);
                    return new userActions.ResetPasswordCompleteAction(payload);
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Reset password', payload.UserId)));
                });
            }

        });

    @Effect()
    loadAllUsers$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.ALL_USERS_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params = new URLSearchParams();
            params.set('fields', 'Id,FirstName,LastName,HasEmail');
            params.set('pageNumber', '1');
            params.set('pageSize', '999999');
            params.set('sortField', 'FirstName');
            params.set('direction', 'asc');
            return this._data.get('user', { search: params })
        })
        .map((res) => {
            let userInfo = <User[]>(res.json().Entities);
            return new userActions.LoadAllUsersCompleteAction(userInfo);
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    @Effect()
    loadAuditLogInfo$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.LOAD_AUDIT_LOG_DATA)
        .map(toPayload)
        .switchMap((payload) => {
            let params = new URLSearchParams();
            let id = getAtlasParamValueByKey(payload.Params, 'id');
            params.set('startdate', getAtlasParamValueByKey(payload.Params, 'startdate'));
            params.set('enddate', getAtlasParamValueByKey(payload.Params, 'enddate'));
            params.set('pageNumber', payload.PageNumber.toString());
            params.set('pageSize', payload.PageSize.toString());
            return this._data.get('user/' + id, { search: params })
        })
        .map((res) => {
            return new userActions.LoadAuditLogDataCompleteAction(extractAuditLogData(res));
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    @Effect()
    loadAuditLogVersionInfo$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.LOAD_AUDIT_LOG_VERSION_DATA)
        .map(toPayload)
        .switchMap((payload) => {
            let params = new URLSearchParams();
            params.set('versionDate', payload.versionDate);
            return this._data.get('user/' + payload.id, { search: params })
        })
        .map((res) => {
            return new userActions.LoadAuditLogVersionDataCompleteAction(res.json());
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

}

