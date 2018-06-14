import { Employee } from '../../employee/models/employee.model';
import { Department, Site } from '../../calendar/model/calendar-models';
import { extractDocumentSubCategorySelectItems, extractDocumentCategoryItems } from '../../document/common/document-subcategory-extract-helper';
import { LoadAuthorizedDocumentCategoriesComplete, LoadDocumentSubCategoriesComplete, PasswordResetActionComplete, LoadAuthorizedSharedDocumentCategoriesComplete } from '../actions/user.actions';

import { ClaimsHelperService } from '../helpers/claims-helper';
import { Http } from '@angular/http';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../data/rest-client.service';
import * as userActions from '../actions/user.actions';
import * as fromRoot from '../reducers/index';
import { URLSearchParams } from '@angular/http';
import { isNullOrUndefined } from "util";
import { CatchErrorAction } from '../../shared/actions/error.actions';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessengerService } from '../../shared/services/messenger.service';
import { UserChangePasswordModel } from '../../shared/models/user';

@Injectable()
export class UserEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _http: Http
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService) {
    }

    @Effect()
    documentCategory$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.LOAD_AUTHORIZED_DOCUMENT_CATEGORIES)
        .map(toPayload)
        .switchMap((payload) => {
            return this._data.get('documentcategory')
                .map((res) => new LoadAuthorizedDocumentCategoriesComplete(extractDocumentCategoryItems(res.json())))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Document categories', null)));
                });
        });

    @Effect()
    sharedDocumentCategory$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.LOAD_AUTHORIZED_SHARED_DOCUMENT_CATEGORIES)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams;
            params.set('pageSize', '0');
            params.set('pageNumber', '0');
            params.set('sortField', 'Name');
            params.set('direction', 'asc');
            params.set('fields', 'Id,Name,Services');
            return this._data.get('SharedDocumentCategory', { search: params })
                .map((res) => new LoadAuthorizedSharedDocumentCategoriesComplete(res.json().Entities))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Shared document categories', null)));
                });
        });

    @Effect()
    documentSubCategory$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.LOAD_DOCUMENT_SUBCATEGORIES)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams;
            params.set('action', 'GetSubCategoriesByCategoryId');
            params.set('categoryId', payload);
            params.set('isDropdown', 'true');
            return this._data.get('documentsubcategory', { search: params })
                .map((res) => new LoadDocumentSubCategoriesComplete(extractDocumentSubCategorySelectItems(res.json())))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Document sub categories', null)));
                });
        });

    @Effect()
    updatePassword$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.PASSWORD_RESET)
        .map(toPayload)
        .switchMap((payload) => {
            let userName: string = this._claimsHelper.getUserName();
            let params: URLSearchParams = new URLSearchParams;
            let pwdChnageModel: UserChangePasswordModel = new UserChangePasswordModel();
            pwdChnageModel.UserName = userName;
            pwdChnageModel.NewPassword = payload.newPassword;
            pwdChnageModel.OldPassword = payload.oldPassword;
            params.set('updatePassword', 'true');
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('User', "Password", userName);
            this._messenger.publish('snackbar', vm);
            return this._data.post('user', pwdChnageModel, { search: params })
                .map((res) => {
                    if (res.json().status) {
                        let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('User', "Password", userName);
                        this._messenger.publish('snackbar', vm);
                    }
                    else {
                        let vm = ObjectHelper.createUpdateErrorSnackbarMessage('User', "Password", userName);
                        this._messenger.publish('snackbar', vm);
                    }
                    let passwordUpdated = res.json().status;
                    return new PasswordResetActionComplete(passwordUpdated);
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'User', userName, userName)));
                });
        });

    /**
* This effect used to load the department drowdown data by sending required parameters to api
*
*/
    @Effect()
    loadDepartments$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.LOAD_DEPARTMENTS)
        .map(toPayload)
        .switchMap((payload) => {
            return this._getApplicalbleDepartments()
                .map((res) => new userActions.LoadApplicableDepartmentsCompleteAction(res))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Departments', null)));
                });
        });


    @Effect()
    loadDeptEmployees$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.LOAD_DEPTEMPLOYEES)
        .map(toPayload)
        .switchMap((payload) => {
            return this._getDeptEmployees(payload)
                .map((res) => new userActions.LoadDeptEmployeesCompleteAction(res))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Department employees', null)));
                });
        });

    /**
        * This effect used to load the site drowdown data by sending required parameters to api
        *
        */
    @Effect()
    loadSites$: Observable<Action> = this._actions$.ofType(userActions.ActionTypes.LOAD_SITES)
        .map(toPayload)
        .switchMap((payload) => {
            return this._getSites()
                .map((res) => new userActions.LoadApplicableSitesCompleteAction(res))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'sites', null)));
                });
        });


    private _getSites(): Observable<Site[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('pageSize', '99999');
        params.set('pageNumber', '1');
        params.set('sortField', 'Name');
        params.set('direction', 'asc');
        params.set('filterSiteView', 'active');
        params.set('SitesByAccessLevel', '1');
        params.set('fields', 'Id,SiteNameAndPostcode,IsActive,Name');
        return this._data.get('Site', { search: params }).map((res) => res.json().Entities);

    }
    /**
* Fetch the department list as per empId role permission     * 
* @private
* @param {string} empId
* @returns {Observable<Department[]>}
* 
* @memberOf CompanyEffects
*/
    private _getApplicalbleDepartments(): Observable<Department[]> {
        let employeeId = this._claimsHelper.getEmpIdOrDefault();
        let params: URLSearchParams = new URLSearchParams();
        params.set('pageSize', '99999');
        params.set('pageNumber', '1');
        params.set('sortField', 'Name');
        params.set('direction', 'asc');
        params.set('ByAccessLevel', employeeId);
        params.set('fields', 'Id,Name');
        return this._data.get('department', { search: params }).map((res) => {
            return res.json().Entities;
        });
    }

    private _getDeptEmployees(deptmentIds: string): Observable<Employee[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('pageSize', '99999');
        params.set('pageNumber', '1');
        params.set('sortField', 'FirstName');
        params.set('direction', 'asc');
        params.set('employeesByDepartmentFilter', deptmentIds);
        params.set('employeesByLeaverFilter', deptmentIds);
        params.set('fields', 'Id,FirstName,Surname,UserId');
        return this._data.get('employee', { search: params }).map((res) => {
            return res.json().Entities;
        });
    }
}