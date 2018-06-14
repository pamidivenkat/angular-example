import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequest, AtlasApiResponse, AtlasApiRequestWithParams, AtlasParams } from '../../shared/models/atlas-api-response';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as employeeActions from '../actions/employee.actions';
import { getAtlasParamValueByKey } from "./../../root-module/common/extract-helpers";

import { ObjectHelper } from './../../shared/helpers/object-helper';
import { MessengerService } from './../../shared/services/messenger.service';
import * as errorActions from './../../shared/actions/error.actions';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import { MessageEvent } from './../../atlas-elements/common/models/message-event.enum';
import { User } from './../../shared/models/user';
import { UserAdminDetails } from './../../employee/administration/models/user-admin-details.model';
import * as lookupActions from './../../shared/actions/lookup.actions';
import { mapEmployeeAdminDetails } from './../../employee/common/extract-helpers';
import { isNullOrUndefined } from "util";
import { EmployeeFullEntityService } from './../../employee/services/employee-fullentity.service';

@Injectable()
export class EmployeeAdministrationDetailsEffects {
    private _objectType: string = "Employee";

    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService
        , private _employeeFullEntityService: EmployeeFullEntityService
    ) {

    }

    /*
    * This effect is used to get employee admin tab details
    */
    @Effect()
    employeeAdministrationDetails$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_ADMINISTRATION_DETAILS)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .skipWhile((payload) => { return isNullOrUndefined(payload.currentEmployee.UserId); })
        .switchMap((pl) => {
            if (!isNullOrUndefined(pl.currentEmployee.UserId)) { //skipWhile is not working properly
                let payload = pl._payload;
                let employeeId = pl.currentEmployee.Id;
                let userId = pl.currentEmployee.UserId;
                let params: URLSearchParams = new URLSearchParams();
                params.set('id', userId);
                params.set('includeRoles', userId);
                return this._data.get(`users/getbyid`, { search: params })
                    .map((res) => new employeeActions.LoadEmployeeAdministrationDetailsCompleteAction(mapEmployeeAdminDetails(res)))
                    .catch((error) => {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee administration details', null)));
                    })
            } else {
                return Observable.of(<Action>{})
            }

        });



    /*
    * This effect is used to update user profiles for selected employee
    */
    @Effect()
    updateUserProfiles$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.USERPROFILE_UPDATE)
        .map((action: employeeActions.UpdateEmployeeUserProfileAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let payload = pl._payload;
            let userId = pl.currentEmployee.UserId;
            let params: URLSearchParams = new URLSearchParams();
            let profile: any = {};
            profile.UserId = userId;
            profile.UserProfileIds = payload;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('employee profiles', pl.currentEmployee.FirstName, pl.currentEmployee.Id);

            this._messenger.publish('snackbar', vm);
            return this._data.post(`UserProfileUpdate/UpdateUserProfiles`, profile)
                .map((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('employee profiles', pl.currentEmployee.FirstName, pl.currentEmployee.Id);
                    this._messenger.publish('snackbar', vm);
                    return new employeeActions.UpdateEmployeeUserProfileCompleteAction(<UserAdminDetails>res.json())
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'employee profiles', pl.currentEmployee.Id)));
                })
        });

    /*
    * This effect is used to update selected employee user stauts - access to atlas (Active/InActive)
    */
    @Effect()
    updateUserStatus$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.UPDATE_USER_STATUS)
        .map((action: employeeActions.UpdateUserStatusAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams;
            params.set('id', payload._payload.userId);
            params.set('status', payload._payload.status);
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Admin details : user atlas acces', payload.currentEmployee.FullName, payload._payload.userId);
            this._messenger.publish('snackbar', vm);
            return this._data.post(`Users/UpdateStatus`, null, { search: params }).map((res) => {
                let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Admin details : user atlas acces', payload.currentEmployee.FullName, payload._payload.userId);
                this._messenger.publish('snackbar', vm);
                return new employeeActions.UpdateUserStatusCompleteAction(res.json().IsActive);
            }).catch((error) => {
                return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Admin details : user atlas acces', payload._payload.userId)));
            });
        })



    @Effect()
    manualResetPassword$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.MANUAL_PASSWORD_RESET)
        .map(toPayload)
        .switchMap((payload) => {
            // Reset password : Email user
            if (!isNullOrUndefined(payload) && payload.IsEmailUser) {
                var loginModel = { UserName: payload.Email };
                let vm = ObjectHelper.operationInProgressSnackbarMessage('Generating reset password link for the user');
                this._messenger.publish('snackbar', vm);
                return this._data.put(`resetpassword`, loginModel).map((res) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Reset password link has been generated and sent to user email.');
                    this._messenger.publish('snackbar', vm);
                    if (!isNullOrUndefined(res.json().UserName) || res.json().status) {
                        return new employeeActions.ManualResetPasswordCompleteAction(true);
                    }
                    else {
                        return new employeeActions.ManualResetPasswordCompleteAction(false);
                    }
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Reset password', null)));
                });;
            } else {
                // Reset password : NoEmail user
                let params: URLSearchParams = new URLSearchParams;
                params.set('id', payload.UserId);
                params.set('password', payload.NewPassword);
                let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Reset password', payload.Email, payload.userId);
                this._messenger.publish('snackbar', vm);
                return this._data.post(`user/ManualResetPassword`, null, { search: params }).map((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Reset password', payload.Email, payload.userId);
                    this._messenger.publish('snackbar', vm);
                    if (!isNullOrUndefined(res.json().UserName) || res.json().status) {
                        return new employeeActions.ManualResetPasswordCompleteAction(true);
                    }
                    else {
                        return new employeeActions.ManualResetPasswordCompleteAction(false);
                    }

                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Reset password', payload.userId)));
                });
            }

        })



    /*
    * To get Unassociated Users for atlas user association functionality
    */
    @Effect()
    getUnAssociatedUsers$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.LOAD_UNASSOCIATED_USERS)
        .map(toPayload)

        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams;
            params.set('temp1', `false`);
            params.set('temp2', `false`);
            params.set('temp3', `false`);

            return this._data.get(`employee/GetUnassociatedUsers`, { search: params }).map((res) => {
                return new employeeActions.LoadUnAssociatedUsersCompleteAction(res.json());
            }).catch((error) => {
                return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Get unassociated users', null)));
            });
        })


    /*
   * To check duplicate employee email address
   */
    @Effect()
    checkDuplicateEmployeeEmail$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.CHECK_EMPLOYEE_DUPLICATE_EMAIL)
        .map((action: employeeActions.CheckEmployeeDuplidateEmailAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams;
            params.set('email', payload._payload.Email);
            params.set('cid', `00000000-0000-0000-0000-000000000000`);
            params.set('temp1', `false`);
            params.set('temp2', `false`);
            params.set('temp3', `false`);
            params.set('temp4', `false`);
            params.set('temp5', `false`);

            return this._data.get(`employee/CheckDuplicateEmployeeEmail`, { search: params }).map((res) => {
                return new employeeActions.CheckEmployeeDuplidateEmailCompleteAction(res.json().Success);
            }).catch((error) => {
                return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee Admin details - Check duplicate employee email', null)));
            });
        })


    @Effect()
    updateEmployeeOptions$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_OPTIONS_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _empPersonal: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let payload = pl._payload;
            let empName: string = pl._empPersonal.FirstName + ' ' + pl._empPersonal.Surname;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Admin-Options', empName, payload.empId);
            this._messenger.publish('snackbar', vm);
            return this._employeeFullEntityService.mergeWithAdminOptionsDetails(payload.adminOptions, payload.empId)
                .switchMap((data) => {
                    return this._data.post(`employee`, data);
                })
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Admin-Options', empName, payload.empId);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new employeeActions.EmployeOptionsUpdateCompleteAction(true),
                        new employeeActions.LoadEmployeeAdministrationDetailsAction()
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Admin-Options', payload.empId)));
                })
        })

    @Effect()
    RemoveEmployeeById$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_REMOVE)
        .map(toPayload)
        .switchMap((payload) => {
            //inprogrss snackbar msg
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._objectType, payload.FirstName + ' ' + payload.Surname, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete('employee/' + payload.Id)
                .map(() => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._objectType, payload.FirstName + ' ' + payload.Surname, payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return new employeeActions.EmployeeRemoveCompletedAction();
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, this._objectType, payload.FirstName + ' ' + payload.Surname, payload.Id)));
                });
        })

    @Effect()
    LoadEmployeeLeaverEventDetails$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_LEAVEREVENT_DETAILS)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _employeeId: state.employeeState.EmployeeId
                , _eventTypes: state.lookupState.EventTypesData
            };
        })
        .switchMap((inputData) => {
            let payload = inputData._payload;
            let leaverCategoryId = null;
            if (!isNullOrUndefined(inputData._eventTypes)) {
                let leaverCategory = inputData._eventTypes.find(c => c.Code === 5);
                if (!isNullOrUndefined(leaverCategory)) {
                    leaverCategoryId = leaverCategory.Id;
                }
            }
            let params = new URLSearchParams();
            params.set('fields', 'Id,CreatedOn,LeaverTerminationDate');
            params.set('employeeTimelineViewByCategory', leaverCategoryId);
            params.set('employeeTimelineViewByEmpId', inputData._employeeId);
            params.set('pageNumber', '1');
            params.set('pageSize', '1');
            params.set('sortField', 'CreatedOn');
            params.set('direction', 'desc');
            return this._data.get('EmployeeTimelineView/getspecificfields', { search: params })
                .map((res) => {
                    return new employeeActions.LoadEmployeeLeaverEventDetailsComplete(res.json().Entities);
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error, MessageEvent.Load, this._objectType, null, inputData._employeeId)));
                });
        });

}