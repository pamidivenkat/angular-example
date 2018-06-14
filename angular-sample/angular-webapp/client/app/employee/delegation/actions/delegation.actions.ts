import { User } from './../../../shared/models/user';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { Delegation } from '../models/delegation';
import { Actions, toPayload } from '@ngrx/effects';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';
import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';
import * as Immutable from 'immutable';


export const ActionTypes = {
    LOAD_DELEGATED_USERS_LIST: type('[Delegation] Load delegated users list '),
    LOAD_DELEGATED_USERS_LIST_COMPLETE: type('[Delegation] Load Load delegated users list complete'),
   

    LOAD_USERS:type('[Delegation] Load users'),
    LOAD_USERS_COMPLETE:type('[Delegation] Load users complete'),

    DELEGATED_USER_ADD:type('[Delegation] Delegated user add'),
    DELEGATED_USER_ADD_COMPLETE: type('[Delegation] Delegated user add complete'),

    DELEGATED_USER_UPDATE:type('[Delegation] delegated user update'),
    DELEGATED_USER_UPDATE_COMPLETE: type('[Delegation] delegated user update complete'),

    DELEGATED_USER_DELETE:type('[Delegation]  delegated user delete'),
    DELEGATED_USER_DELETE_COMPLETE: type('[Delegation] delegated user complete delete')
}

/* Employee Delegation Actions */
export class LoadDelegatedUsersListAction implements Action {
    type = ActionTypes.LOAD_DELEGATED_USERS_LIST;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadDelegatedUsersListCompleteAction implements Action {
    type = ActionTypes.LOAD_DELEGATED_USERS_LIST_COMPLETE;
    constructor(public payload: AtlasApiResponse<Delegation>) {
    }
}

 

export class LoadUsersAction {
    type = ActionTypes.LOAD_USERS;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadUsersCompleteAction {
    type = ActionTypes.LOAD_USERS_COMPLETE;
    constructor(public payload: AtlasApiResponse<User>) {
    }
}

export class DelegatedUserAddAction {
    type = ActionTypes.DELEGATED_USER_ADD;
    constructor(public payload: Delegation) {
    }
}

export class DelegatedUserAddCompleteAction {
    type = ActionTypes.DELEGATED_USER_ADD_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class DelegatedUserUpdateAction {
    type = ActionTypes.DELEGATED_USER_UPDATE;
    constructor(public payload: Delegation) {
    }
}

export class DelegatedUserUpdateCompleteAction {
    type = ActionTypes.DELEGATED_USER_UPDATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class DelegatedUserDeleteAction implements Action {
    type = ActionTypes.DELEGATED_USER_DELETE;
    constructor(public payload: Delegation) {

    }
}
export class DelegatedUserDeleteCompleteAction implements Action {
    type = ActionTypes.DELEGATED_USER_DELETE_COMPLETE;
    constructor(public payload: boolean) {

    }
}
/* Employee Delegation Actions End*/

export type Actions = LoadDelegatedUsersListAction
    | LoadDelegatedUsersListCompleteAction
    | LoadUsersAction
    | LoadUsersCompleteAction
    | DelegatedUserAddAction
    | DelegatedUserAddCompleteAction
    | DelegatedUserUpdateAction
    | DelegatedUserUpdateCompleteAction
    | DelegatedUserDeleteAction
    | DelegatedUserDeleteCompleteAction;

