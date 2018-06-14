import { AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { extractDataTableOptions } from '../../../shared/helpers/extract-helpers';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { AtlasApiRequest, AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Rx';
import { Action, ActionReducer, combineReducers } from '@ngrx/store';
import * as bulkPasswordResetActions from '../actions/bulk-password-reset.actions';
import { compose } from "@ngrx/core";
import * as Immutable from 'immutable';
import { User } from '../models/bulk-password-reset.model';


export interface CompanyBulkPasswordResetState {
    isUserListLoading: boolean,
    usersRequest: AtlasApiRequestWithParams;
    UserList: Immutable.List<User>,        
    UserListPagingInfo: PagingInfo,    
    isSubmitedUsersList: boolean, 
    ResetUserList: Immutable.List<any>
    filters: Map<string, string>;
}

const initialState: CompanyBulkPasswordResetState = {
    isUserListLoading: false,
    usersRequest: null,
    UserList: null,        
    UserListPagingInfo: null,    
    isSubmitedUsersList: false,    
    ResetUserList: null,
    filters: null,
}

export function userReducer(state = initialState, action: Action): CompanyBulkPasswordResetState {
    switch (action.type) {
        case bulkPasswordResetActions.ActionTypes.LOAD_USER_WITH_EMAIL:
            {
                return Object.assign({}, state, { isUserListLoading: true, usersRequest: action.payload });
            }
        case bulkPasswordResetActions.ActionTypes.LOAD_USER_WITH_EMAIL_COMPLETE:
            {
                if (!isNullOrUndefined(state.UserListPagingInfo)) {
                    if (action.payload.UserListPagingInfo.PageNumber == 1) {
                        state.UserListPagingInfo.TotalCount = action.payload.UserListPagingInfo.TotalCount;
                    }
                    state.UserListPagingInfo.PageNumber = action.payload.UserListPagingInfo.PageNumber;
                    state.UserListPagingInfo.Count = action.payload.UserListPagingInfo.Count;
                }
                else {
                    state.UserListPagingInfo = action.payload.UserListPagingInfo;
                }
                return Object.assign({}, state, { isUserListLoading: false, UserList: action.payload.UserList });
            }

        case bulkPasswordResetActions.ActionTypes.SUBMIT_BPR_REQUEST:
            {
                return Object.assign({}, state, { isSubmitedUsersList: false, ResetUserList: action.payload.UserList });
            }

        case bulkPasswordResetActions.ActionTypes.SUBMIT_BPR_REQUEST_COMPLETE:
            {
                return Object.assign({}, state, { isSubmitedUsersList: true });
            }

        case bulkPasswordResetActions.ActionTypes.SUBMIT_BPR_WITHOUT_EMAIL_REQUEST:
            {
                return Object.assign({}, state, { isSubmitedUsersList: false, ResetUserList: action.payload.UserList });
            }

        case bulkPasswordResetActions.ActionTypes.SUBMIT_BPR_WITHOUT_EMAIL_REQUEST_COMPLETE:
            {
                return Object.assign({}, state, { isSubmitedUsersList: true });
            }


        default:
            return state;
    }
}

export function getUserListingDataWithEmail(state$: Observable<CompanyBulkPasswordResetState>): Observable<Immutable.List<User>> {
    return state$.select(s => s.UserList && Immutable.List(s.UserList));
}

export function getUserTotalRecordsWithEmail(state$: Observable<CompanyBulkPasswordResetState>): Observable<number> {
    return state$.select(s => s && s.UserListPagingInfo && s.UserListPagingInfo.TotalCount);
};

export function getUserListDataLoadingWithEmail(state$: Observable<CompanyBulkPasswordResetState>): Observable<boolean> {
    return state$.select(s => !isNullOrUndefined(s) && s.isUserListLoading);
};

export function getBprUserListDataTableOptions(state$: Observable<CompanyBulkPasswordResetState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.UserListPagingInfo && extractDataTableOptions(state.UserListPagingInfo));
}

export function submitResetUsers(state$: Observable<CompanyBulkPasswordResetState>): Observable<Immutable.List<User>> {
    return state$.select(s => s.UserList && Immutable.List(s.UserList));
}

export function getIsSubmittedUsersList(state$: Observable<CompanyBulkPasswordResetState>): Observable<boolean> {
    return state$.select(s => s.isSubmitedUsersList);
};








