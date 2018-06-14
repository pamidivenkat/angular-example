import { LogVersion } from '../models/log-version.model';
import { AuditLog } from '../models/audit-log.model';
import { ResetPasswordVM } from '../../../employee/administration/models/user-admin-details.model';
import { UserProfilesViewVm } from '../models/user-permissions-view-vm';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { Actions, toPayload } from '@ngrx/effects';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';
import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { User } from '../models/user.model';
import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';
import * as Immutable from 'immutable';

export const ActionTypes = {
    USER_LOAD: type('[User] load user'),
    USER_LOAD_COMPLETE: type('[User] load user complete'),
    USER_ADD: type('[User] add user'),
    USER_ADD_COMPLETED: type('[User] add user completed'),
    USER_UPDATE: type('[User] update user record'),
    USER_UPDATE_COMPLETE: type('[User] update user record complete'),
    USER_REMOVE: type('[User] remove user record'),
    USER_REMOVE_COMPLETE: type('[User] remove user record complete'),
    USER_DISABLE: type('[User] disable user record'),
    USER_DISABLE_COMPLETE: type('[User] disable user record complete'),
    LOAD_USER_ON_SORT: type('[User] load user on sort'),
    LOAD_USER_ON_PAGE_CHANGE: type('[User] load user on page change'),
    LOAD_USER_ON_FILTER_CHANGE: type('[User] Load user list on filter change'),
    ADVICE_CARD_NUMBER_OPTION_LOAD: type('[User] load advice card number option'),
    ADVICE_CARD_NUMBER_OPTION_LOAD_COMPLETE: type('[User] load advice card number complete'),
    VALIDATE_USER_NAME: type('[User] validate username on server side'),
    VALIDATE_USER_NAME_COMPLETED: type('[User] validate username completed'),
    GET_USER_PERMISSIONS: type('[User] get userpermissions'),
    GET_USER_PERMISSIONS_COMPLETED: type('[User] get userpermissions completed'),
    UPDATE_USER_PERMISSIONS: type('[User] update userpermissions'),
    UPDATE_USER_PERMISSIONS_COMPLETED: type('[User] update userpermissions completed'),
    SAVE_ACN_ASSIGNMENTS: type('[ACN] Advice card assignment'),
    SAVE_ACN_ASSIGNMENTS_COMPLETED: type('[ACN] Advice card assignment completed'),
    VALIDATE_EMAIL: type('[User] validate email on server side'),
    VALIDATE_EMAIL_COMPLETE: type('[User] validate email on server side completed'),
    GET_PERMISSIONS: type('[User] get permissions'),
    GET_PERMISSIONS_COMPLETED: type('[User] get permissions completed'),
    LOAD_USER_INFO: type('[User] load userinformation'),
    LOAD_USER_INFO_COMPLETE: type('[User] load userinformation completed'),
    PASSWORD_RESET: type('[User] reset password'),
    PASSWORD_RESET_COMPLETE: type('[User] reset password complete'),
    LOAD_AUDIT_LOG_DATA: type('[AuditLog] load audit log data'),
    LOAD_AUDIT_LOG_DATA_COMPLETE: type('[AuditLog] load audit log data complete'),
    LOAD_AUDIT_LOG_DATA_ON_PAGE_CHANGE: type('[AuditLog] load audit log data on page change'),
    LOAD_AUDIT_LOG_VERSION_DATA: type('[AuditLog] load audit log version data'),
    LOAD_AUDIT_LOG_VERSION_DATA_COMPLETE: type('[AuditLog] load audit log version data complete'),
    ALL_USERS_LOAD: type('[User] load all users'),
    ALL_USERS_LOAD_COMPLETE: type('[User] load all users complete')
}

export class LoadAllUsersAction implements Action {
    type = ActionTypes.ALL_USERS_LOAD;
    constructor() {
    }
}
export class LoadAllUsersCompleteAction implements Action {
    type = ActionTypes.ALL_USERS_LOAD_COMPLETE;
    constructor(public payload: User[]) {
    }
}

export class ResetPasswordCompleteAction implements Action {
    type = ActionTypes.PASSWORD_RESET_COMPLETE;
    constructor(public payload: ResetPasswordVM) {
    }
}

export class ResetPasswordAction implements Action {
    type = ActionTypes.PASSWORD_RESET;
    constructor(public payload: ResetPasswordVM) {
    }
}

export class LoadUserInfoAction implements Action {
    type = ActionTypes.LOAD_USER_INFO;
    constructor(public payload: string) {
    }
}

export class LoadUserInfoCompleteAction implements Action {
    type = ActionTypes.LOAD_USER_INFO_COMPLETE;
    constructor(public payload: User) {
    }
}


export class UserLoadAction implements Action {
    type = ActionTypes.USER_LOAD;
    constructor(public payload: any) {
    }
}

export class UserLoadCompleteAction implements Action {
    type = ActionTypes.USER_LOAD_COMPLETE;
    constructor(public payload: any) {
    }
}

export class AddUserAction implements Action {
    type = ActionTypes.USER_ADD;
    constructor(public payload: User) {

    }
}

export class AddUserCompletedAction implements Action {
    type = ActionTypes.USER_ADD_COMPLETED;
    constructor(public payload: User) {

    }
}

export class UpdateUserAction implements Action {
    type = ActionTypes.USER_UPDATE;
    constructor(public payload: User) {

    }
}

export class UpdateUserCompletedAction implements Action {
    type = ActionTypes.USER_UPDATE_COMPLETE;
    constructor(public payload: User) {

    }
}
export class RemoveUserAction implements Action {
    type = ActionTypes.USER_REMOVE;
    constructor(public payload: User) {

    }
}

export class RemoveUserCompletedAction implements Action {
    type = ActionTypes.USER_REMOVE_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class DisableUserAction implements Action {
    type = ActionTypes.USER_DISABLE;
    constructor(public payload: User) {

    }
}

export class DisableUserCompletedAction implements Action {
    type = ActionTypes.USER_DISABLE_COMPLETE;
    constructor(public payload: boolean) {

    }
}


export class LoadUserOnSortAction implements Action {
    type = ActionTypes.LOAD_USER_ON_SORT;
    constructor(public payload: AeSortModel) {

    }
}



export class LoadUserOnPageChangeAction implements Action {
    type = ActionTypes.LOAD_USER_ON_PAGE_CHANGE;
    constructor(public payload: { pageNumber: number, noOfRows: number }) {

    }
}

export class LoadUserOnFilterChangeAction implements Action {
    type = ActionTypes.LOAD_USER_ON_FILTER_CHANGE;
    constructor(public payload: Map<string, string>) {

    }
}

export class LoadAdviceCardNumberOptionAction implements Action {
    type = ActionTypes.ADVICE_CARD_NUMBER_OPTION_LOAD;
    constructor(public payload: boolean) {
    }
}

export class LoadAdviceCardNumberOptionCompleteAction {
    type = ActionTypes.ADVICE_CARD_NUMBER_OPTION_LOAD_COMPLETE;
    constructor(public payload: AeSelectItem<string>[]) {

    }
}

export class ValidateUserNameAction implements Action {
    type = ActionTypes.VALIDATE_USER_NAME;
    constructor(public payload: string) {
    }
}

export class ValidateUserNameCompletedAction implements Action {
    type = ActionTypes.VALIDATE_USER_NAME_COMPLETED;
    constructor(public payload: boolean) {
    }
}
export class GetUserPermisssionsAction implements Action {
    type = ActionTypes.GET_USER_PERMISSIONS;
    constructor(public payload: string) {
    }
}
export class GetUserPermisssionsCompleteAction implements Action {
    type = ActionTypes.GET_USER_PERMISSIONS_COMPLETED;
    constructor(public payload: UserProfilesViewVm) {
    }
}

export class UpdateUserPermisssionsAction implements Action {
    type = ActionTypes.UPDATE_USER_PERMISSIONS;
    constructor(public payload: any) {
    }
}
export class UpdateUserPermisssionsCompleteAction implements Action {
    type = ActionTypes.UPDATE_USER_PERMISSIONS_COMPLETED;
    constructor(public payload: boolean) {
    }
}
export class ValidateEmailAction implements Action {
    type = ActionTypes.VALIDATE_EMAIL;
    constructor(public payload: string) {

    }
}
export class ValidateEmailCompleteAction implements Action {
    type = ActionTypes.VALIDATE_EMAIL_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class GetPermisssionsAction implements Action {
    type = ActionTypes.GET_PERMISSIONS;
    constructor(public payload: boolean) {
    }
}
export class GetPermisssionsCompleteAction implements Action {
    type = ActionTypes.GET_PERMISSIONS_COMPLETED;
    constructor(public payload: any) {
    }
}


export class SaveAdviceCardAssignments implements Action {
    type = ActionTypes.SAVE_ACN_ASSIGNMENTS;
    constructor(public payload: any) {

    }
}

export class SaveAdviceCardAssignmentsCompleted implements Action {
    type = ActionTypes.SAVE_ACN_ASSIGNMENTS_COMPLETED;
    constructor(public payload: boolean) {

    }
}

export class LoadAuditLogDataAction implements Action {
    type = ActionTypes.LOAD_AUDIT_LOG_DATA;
    constructor(public payload: any) {

    }
}

export class LoadAuditLogDataCompleteAction implements Action {
    type = ActionTypes.LOAD_AUDIT_LOG_DATA_COMPLETE;
    constructor(public payload: AuditLog[]) {

    }
}

export class LoadAuditLogDataOnPageChangeAction implements Action {
    type = ActionTypes.LOAD_AUDIT_LOG_DATA_ON_PAGE_CHANGE;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}

export class LoadAuditLogVersionDataAction implements Action {
    type = ActionTypes.LOAD_AUDIT_LOG_VERSION_DATA;
    constructor(public payload: any) {

    }
}

export class LoadAuditLogVersionDataCompleteAction implements Action {
    type = ActionTypes.LOAD_AUDIT_LOG_VERSION_DATA_COMPLETE;
    constructor(public payload: LogVersion[]) {

    }
}

export type Actions = UserLoadAction
    | UserLoadCompleteAction
    | AddUserAction
    | AddUserCompletedAction
    | UpdateUserAction
    | UpdateUserCompletedAction
    | DisableUserAction
    | DisableUserCompletedAction
    | LoadUserOnSortAction
    | LoadUserOnPageChangeAction
    | LoadUserOnFilterChangeAction
    | LoadAdviceCardNumberOptionAction
    | LoadAdviceCardNumberOptionCompleteAction
    | ValidateUserNameAction
    | ValidateUserNameCompletedAction
    | GetUserPermisssionsAction
    | GetUserPermisssionsCompleteAction
    | GetUserPermisssionsCompleteAction
    | SaveAdviceCardAssignments
    | SaveAdviceCardAssignmentsCompleted
    | GetPermisssionsAction
    | GetPermisssionsCompleteAction
    | UpdateUserPermisssionsAction
    | UpdateUserPermisssionsCompleteAction
    | LoadUserInfoAction
    | LoadUserInfoCompleteAction
    | ResetPasswordAction
    | LoadAuditLogDataAction
    | LoadAuditLogDataCompleteAction
    | LoadAuditLogDataOnPageChangeAction
    | LoadAuditLogVersionDataAction
    | LoadAuditLogVersionDataCompleteAction
    | LoadAllUsersAction
    | LoadAllUsersCompleteAction

