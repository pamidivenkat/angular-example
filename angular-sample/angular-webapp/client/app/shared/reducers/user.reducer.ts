import { sharedDocument } from './../../document/usefuldocuments-templates/models/sharedDocument';
import { Employee } from '../../employee/models/employee.model';
import { Department } from '../../calendar/model/calendar-models';
import { Site } from '../../shared/models/site.model';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { DocumentCategory } from '../../document/models/document-category';
import { User } from '../models/user';
import * as Immutable from 'immutable';
import * as userActions from '../actions/user.actions';
import { isNullOrUndefined } from "util";

export interface UserState {
    DocumentCategory: DocumentCategoryState;
    DocumentSubCategory: DocumentSubCategoryState;
    SharedDocumentCategory: SharedDocumentCategoryState;
    PasswordUpdated: boolean;
    DepartmentData: Array<Department>;
    hasDepartmentDataLoaded: boolean;
    EmployeesByDepartment: Array<Employee>;
    SitesData: Array<Site>;
    hasSiteDataLoaded: boolean,
    UserFullName: string;
}


export interface DocumentCategoryState {
    HasDocumentCategoriesLoaded: boolean;
    Entities: Array<DocumentCategory>;
}

export interface SharedDocumentCategoryState {
    HasSharedDocumentCategoriesLoaded: boolean;
    Entities: Array<sharedDocument>;
}

export interface DocumentSubCategoryState {
    HasDocumentSubCategoriesLoaded: boolean;
    Entities: Immutable.List<AeSelectItem<string>>;
}

const initialState = {
    DocumentCategory: {
        HasDocumentCategoriesLoaded: false,
        HasSharedDocumentCategoriesLoaded: false,
        Entities: null,
        sEntities: null
    },
    DocumentSubCategory: {
        HasDocumentSubCategoriesLoaded: false,
        Entities: null
    },
    SharedDocumentCategory: {
        HasSharedDocumentCategoriesLoaded: false,
        Entities: null
    },
    PasswordUpdated: null,
    DepartmentData: null,
    hasDepartmentDataLoaded: false,
    EmployeesByDepartment: null,
    SitesData: null,
    hasSiteDataLoaded: false,
    UserFullName: null
}



export function reducer(state = initialState, action: Action): UserState {
    switch (action.type) {

        case userActions.ActionTypes.LOAD_AUTHORIZED_DOCUMENT_CATEGORIES: {
            let newState = Object.assign({}, state, { DocumentCategory: Object.assign({ HasDocumentCategoriesLoaded: false }) });
            return newState;
        }
        case userActions.ActionTypes.LOAD_AUTHORIZED_DOCUMENT_CATEGORIES_COMPLETE: {
            let newState = Object.assign({}, state, { DocumentCategory: Object.assign({ HasDocumentCategoriesLoaded: true, Entities: action.payload }) });
            return newState;
        }

        case userActions.ActionTypes.LOAD_AUTHORIZED_SHARED_DOCUMENT_CATEGORIES: {
            let newState = Object.assign({}, state, { SharedDocumentCategory: Object.assign({ HasSharedDocumentCategoriesLoaded: false }) });
            return state;
        }
        case userActions.ActionTypes.LOAD_AUTHORIZED_SHARED_DOCUMENT_CATEGORIES_COMPLETE: {
            let newState = Object.assign({}, state, { SharedDocumentCategory: Object.assign({ HasSharedDocumentCategoriesLoaded: true, Entities: action.payload }) });
            return newState;
        }

        case userActions.ActionTypes.LOAD_DOCUMENT_SUBCATEGORIES: {
            let newState = Object.assign({}, state, { DocumentSubCategory: Object.assign({ HasDocumentSubCategoriesLoaded: false }) });
            return newState;
        }


        case userActions.ActionTypes.LOAD_DOCUMENT_SUBCATEGORIES_COMPLETE: {
            let newState = Object.assign({}, state, { DocumentSubCategory: Object.assign({ HasDocumentSubCategoriesLoaded: true, Entities: action.payload }) });
            return newState;
        }

        case userActions.ActionTypes.PASSWORD_RESET: {
            return Object.assign({}, state, { PasswordUpdated: null });
        }

        case userActions.ActionTypes.PASSWORD_RESET_COMPLETE:
            {
                return Object.assign({}, state, { PasswordUpdated: action.payload });
            }
        case userActions.ActionTypes.PASSWORD_RESET_CONFIRMATION:
            {
                return Object.assign({}, state, { PasswordUpdated: null });
            }
        case userActions.ActionTypes.PASSWORD_RESET_CANCEL:
            {
                return Object.assign({}, state, { PasswordUpdated: null });
            }

        case userActions.ActionTypes.LOAD_DEPARTMENTS:
            {
                return Object.assign({}, state, { hasDepartmentDataLoaded: false, DepartmentData: null });
            }

        case userActions.ActionTypes.LOAD_DEPARTMENTS_COMPLETE:
            {
                return Object.assign({}, state, { hasDepartmentDataLoaded: true, DepartmentData: action.payload });
            }

        case userActions.ActionTypes.LOAD_DEPTEMPLOYEES:
            {
                return Object.assign({}, state, {});
            }
        case userActions.ActionTypes.LOAD_DEPTEMPLOYEES_COMPLETE:
            {
                return Object.assign({}, state, { EmployeesByDepartment: action.payload });
            }
        case userActions.ActionTypes.LOAD_SITES:
            {
                return Object.assign({}, state, { hasSiteDataLoaded: false });
            }

        case userActions.ActionTypes.LOAD_SITES_COMPLETE:
            {
                return Object.assign({}, state, { hasSiteDataLoaded: true, SitesData: action.payload });
            }
        case userActions.ActionTypes.UPDATE_USER_INFO:
            {
                return Object.assign({}, state, { UserFullName: action.payload.FirstName + ' ' + action.payload.Surname });
            }
        default:
            return state;
    }
}

export function getUserFullName(state$: Observable<UserState>): Observable<string> {
    return state$.select(s => s.UserFullName);
}

export function getDocumentCategories(state$: Observable<DocumentCategoryState>) {
    return state$.select(s => s.Entities);
}

export function getSharedDocumentCategories(state$: Observable<SharedDocumentCategoryState>) {
    return state$.select(s => s.Entities);
}

export function sharedDocsDataLoadStatus(state$: Observable<SharedDocumentCategoryState>): Observable<boolean> {
    return state$.select(s => s.HasSharedDocumentCategoriesLoaded);
}

export function getDocumentSubCategories(state$: Observable<UserState>) {
    return state$.select(s => s.DocumentSubCategory.Entities);
}

export function getPasswordUpdatedStatus(state$: Observable<UserState>): Observable<boolean> {
    return state$.select(state => state && state.PasswordUpdated);
}

export function getPasswordUpdateCancelStatus(state$: Observable<UserState>): Observable<boolean> {
    return state$.select(state => state && state.PasswordUpdated);
}

export function getApplicableDepartmentsData(state$: Observable<UserState>): Observable<Department[]> {
    return state$.select(s => s.DepartmentData);
}

export function getApplicableDepartmentsDataForMultiSelect(state$: Observable<UserState>): Observable<AeSelectItem<string>[]> {
    return state$.select(s => s.DepartmentData && (s.DepartmentData).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }));
}

export function getApplicableSitesData(state$: Observable<UserState>): Observable<Site[]> {
    return state$.select(s => s.SitesData);
}

export function siteDataLoadStatus(state$: Observable<UserState>): Observable<boolean> {
    return state$.select(s => s.hasSiteDataLoaded);
}

export function departmentDataLoadStatus(state$: Observable<UserState>): Observable<boolean> {
    return state$.select(s => s.hasDepartmentDataLoaded);
}

export function getDeptByEmployees(state$: Observable<UserState>): Observable<Employee[]> {
    return state$.select(s => s.EmployeesByDepartment);
}
