import { sharedDocument } from './../../document/usefuldocuments-templates/models/sharedDocument';
import { Employee } from '../../employee/models/employee.model';
import { Department, Site } from '../../calendar/model/calendar-models';
import { passwordModel } from '../../root-module/models/password';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { Action } from '@ngrx/store';
import { DocumentCategory } from '../../document/models/document-category';

import { type } from '../util';
import * as Immutable from 'immutable';
import { User } from './../../shared/models/user';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../shared/models/atlas-api-response';

export const ActionTypes = {
    LOAD_AUTHORIZED_DOCUMENT_CATEGORIES: type('[DocumentCategory] Load Authorized Document Categories'),
    LOAD_AUTHORIZED_DOCUMENT_CATEGORIES_COMPLETE: type('[DocumentCategory] Load Authorized Document Categories Complete'),
    LOAD_AUTHORIZED_SHARED_DOCUMENT_CATEGORIES: type('[SharedDocumentCategory] Load Authorized Shared Document Categories'),
    LOAD_AUTHORIZED_SHARED_DOCUMENT_CATEGORIES_COMPLETE: type('[SharedDocumentCategory] Load Authorized Shared Document Categories Complete'),
    LOAD_DOCUMENT_SUBCATEGORIES: type('[DocumentSubCategory] Load  Document SubCategories'),
    LOAD_DOCUMENT_SUBCATEGORIES_COMPLETE: type('[DocumentSubCategory] Load  Document SubCategories Complete'),
    PASSWORD_RESET: type('[USER] Load employee old password'),
    PASSWORD_RESET_COMPLETE: type('[USER] password reset complete'),
    PASSWORD_RESET_CONFIRMATION: type('[USER] password reset confirmation'),
    PASSWORD_RESET_CANCEL: type('[USER] password reset cancel'),
    LOAD_DEPARTMENTS: type('[Departments] Load Applicable Departments'),
    LOAD_DEPARTMENTS_COMPLETE: type('[Departments] Load Applicable Departments complete'),
    LOAD_DEPTEMPLOYEES: type('[DeptEmployee] Load department employees'),
    LOAD_DEPTEMPLOYEES_COMPLETE: type('[DeptEmployee] Load department employees complete'),
    LOAD_SITES: type('[Site] Load applicable sites'),
    LOAD_SITES_COMPLETE: type('[Site] Load applicable sites complete'),
    UPDATE_USER_INFO: type('[UserInfo] Update userinformation used in profile information')
}

export class LoadAuthorizedDocumentCategories implements Action {
    type = ActionTypes.LOAD_AUTHORIZED_DOCUMENT_CATEGORIES;
    constructor(public payload: boolean) {

    }
}

export class LoadAuthorizedDocumentCategoriesComplete implements Action {
    type = ActionTypes.LOAD_AUTHORIZED_DOCUMENT_CATEGORIES_COMPLETE;
    constructor(public payload: Array<DocumentCategory>) {

    }
}

export class LoadAuthorizedSharedDocumentCategories implements Action {
    type = ActionTypes.LOAD_AUTHORIZED_SHARED_DOCUMENT_CATEGORIES;
    constructor(public payload: boolean) {

    }
}

export class LoadAuthorizedSharedDocumentCategoriesComplete implements Action {
    type = ActionTypes.LOAD_AUTHORIZED_SHARED_DOCUMENT_CATEGORIES_COMPLETE;
    constructor(public payload: Array<sharedDocument>) {

    }
}

export class LoadDocumentSubCategories implements Action {
    type = ActionTypes.LOAD_DOCUMENT_SUBCATEGORIES;
    constructor(public payload: string) {

    }
}

export class LoadDocumentSubCategoriesComplete implements Action {
    type = ActionTypes.LOAD_DOCUMENT_SUBCATEGORIES_COMPLETE;
    constructor(public payload: Immutable.List<AeSelectItem<string>>) {

    }
}


export class PasswordResetAction implements Action {
    type = ActionTypes.PASSWORD_RESET;
    constructor(public payload: passwordModel) {

    }
}

export class PasswordResetActionComplete implements Action {
    type = ActionTypes.PASSWORD_RESET_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class PasswordResetCancelAction implements Action {
    type = ActionTypes.PASSWORD_RESET_CANCEL;
    constructor() {

    }
}

export class PasswordResetConfimration implements Action {
    type = ActionTypes.PASSWORD_RESET_CONFIRMATION;
    constructor() {

    }
}


/**
* This action is to load the departments
*/
export class LoadApplicableDepartmentsAction implements Action {
    type = ActionTypes.LOAD_DEPARTMENTS;
    constructor() {
    }
}


/**
* This  is complete action of load departments
*/
export class LoadApplicableDepartmentsCompleteAction implements Action {
    type = ActionTypes.LOAD_DEPARTMENTS_COMPLETE;
    constructor(public payload: Department[]) {

    }
}


export class LoadDeptEmployeesAction implements Action {
    type = ActionTypes.LOAD_DEPTEMPLOYEES;
    constructor(public payload: string) {

    }
}

export class LoadDeptEmployeesCompleteAction implements Action {
    type = ActionTypes.LOAD_DEPTEMPLOYEES_COMPLETE;
    constructor(public payload: Employee[]) {

    }
}

/**
* This action is to load the sites
*/
export class LoadApplicableSitesAction {
    type = ActionTypes.LOAD_SITES;
    constructor(public payload: boolean) {
    }
}


/**
* This  is complete action of load sites
*/
export class LoadApplicableSitesCompleteAction {
    type = ActionTypes.LOAD_SITES_COMPLETE;
    constructor(public payload: Site[]) {

    }
}
export class UpdateUserProfileInfoAction {
    type = ActionTypes.UPDATE_USER_INFO;
    constructor(public payload: any) {

    }
}


export type Actions = LoadAuthorizedDocumentCategories
    | LoadApplicableDepartmentsAction | LoadApplicableDepartmentsCompleteAction
    | LoadAuthorizedDocumentCategoriesComplete
    | LoadDocumentSubCategories
    | LoadDocumentSubCategoriesComplete
    | PasswordResetConfimration
    | LoadAuthorizedDocumentCategoriesComplete
    | LoadDocumentSubCategories
    | LoadDocumentSubCategoriesComplete
    | LoadDeptEmployeesAction
    | LoadDeptEmployeesCompleteAction
    | LoadApplicableSitesAction
    | LoadApplicableSitesCompleteAction
    | UpdateUserProfileInfoAction;

