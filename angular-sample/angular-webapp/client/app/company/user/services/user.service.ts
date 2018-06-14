import {
    AddUserAction,
    DisableUserAction,
    GetPermisssionsAction,
    GetUserPermisssionsAction,
    LoadAdviceCardNumberOptionAction,
    RemoveUserAction,
    SaveAdviceCardAssignments,
    UpdateUserAction,
    UpdateUserPermisssionsAction,
    UserLoadAction,
    ValidateEmailAction,
    ValidateUserNameAction,
    LoadUserInfoAction
} from '../actions/user.actions';

import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import { User } from "../models/user.model";


@Injectable()
export class UserService implements OnInit {
    constructor(private _store: Store<fromRoot.State>) {
    }

    ngOnInit() {

    }


    /**
     * load user list data
     * @memberOf UserService
     */
    LoadUsers(filter) {
        this._store.dispatch(new UserLoadAction(filter));
    }

    _onUserDelete(userModal: User) {
        this._store.dispatch(new RemoveUserAction(userModal));
    }
    _onUserDisable(userModal: User) {
        this._store.dispatch(new DisableUserAction(userModal));
    }

    /**
 * to dispatch event to add new User
 * 
 * @memberOf UserService
 */
    _createUser(FormObj) {
        this._store.dispatch(new AddUserAction(FormObj));
    }

    /**
    * to dispatch event to update User
    * 
    * @memberOf UserService
    */
    _updateUser(FormObj) {
        this._store.dispatch(new UpdateUserAction(FormObj));
    }

    _loadAdviceCardNumberOption() {
        this._store.dispatch(new LoadAdviceCardNumberOptionAction(true));
    }

    _validateUserName(userName: string) {
        this._store.dispatch(new ValidateUserNameAction(userName));
    }

    _saveAssignments(adviceCardAssignments: any) {
        this._store.dispatch(new SaveAdviceCardAssignments(adviceCardAssignments));
    }

    _validateEmail(email: string) {
        this._store.dispatch(new ValidateEmailAction(email));
    }
    _getUserPermissions(userId: string) {
        this._store.dispatch(new GetUserPermisssionsAction(userId));
    }
    _getUserInfo(userId: string) {
        this._store.dispatch(new LoadUserInfoAction(userId));
    }
    _getPermissions() {
        this._store.dispatch(new GetPermisssionsAction(true));
    }

    _updateUserPermission(_formDataToSave) {
        this._store.dispatch(new UpdateUserPermisssionsAction(_formDataToSave));
    }

}