import { LogVersion } from '../models/log-version.model';
import { Permission } from '../models/permission-model';
import { AuditLog } from '../models/audit-log.model';
import { UserProfilesViewVm } from '../models/user-permissions-view-vm';
import { UserPermissionsGroup } from '../models/user-permissions-group';
// import { UserProfilesVm } from '../models/user-profiles';
// import { UserPermissions } from '../models/user-permissions';
// import { UserPermissionsViewVm } from '../models/user-permissions-view-vm';
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
import * as userActions from '../actions/user.actions';
import { compose } from "@ngrx/core";
import * as Immutable from 'immutable';
import { User } from '../models/user.model';


export interface CompanyUserState {
    isUserListLoading: boolean,
    UserList: Immutable.List<User>,
    SelectedUser: User,
    UserAddUpdateFormData: User,
    UserAddUpdateCompleted: boolean,
    UserListPagingInfo: PagingInfo,
    UserListSortingInfo: AeSortModel,
    Filters: Map<string, string>;
    AdviceCardNumberOptionList: Array<any>;
    HasAdviceCardNumberOptionListLoaded: boolean;
    UserNameValidationInProgress: boolean;
    IsUserNameValid: boolean;
    IsEmailAvailable: boolean;
    UserProfileData: UserProfilesViewVm;
    PermissionGroups: Array<UserPermissionsGroup>;
    UpdateUserPermissionFormData: any;
    AuditLogData: AuditLog[];
    CurrentPageAuditLogData: Immutable.List<AuditLog>;
    LoadingAuditData: boolean;
    AuditLogDataPagingInfo: PagingInfo;
    CurrentLogVersionData: LogVersion[];
    AllUsersList: User[];
}

const initialState: CompanyUserState = {
    isUserListLoading: false,
    UserList: null,
    SelectedUser: null,
    UserAddUpdateFormData: null,
    UserAddUpdateCompleted: null,
    UserListPagingInfo: null,
    UserListSortingInfo: null,
    Filters: null,
    AdviceCardNumberOptionList: null,
    HasAdviceCardNumberOptionListLoaded: false,
    UserNameValidationInProgress: false,
    IsUserNameValid: false,
    IsEmailAvailable: false,
    UserProfileData: null,
    PermissionGroups: null,
    UpdateUserPermissionFormData: null,
    AuditLogData: null,
    CurrentPageAuditLogData: null,
    LoadingAuditData: false,
    AuditLogDataPagingInfo: null,
    CurrentLogVersionData: null,
    AllUsersList: null
}

export function userReducer(state = initialState, action: Action): CompanyUserState {
    switch (action.type) {
        case userActions.ActionTypes.ALL_USERS_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { AllUsersList: action.payload });
            }
        case userActions.ActionTypes.USER_LOAD:
            {
                return Object.assign({}, state, { isUserListLoading: true, Filters: action.payload });
            }
        case userActions.ActionTypes.USER_LOAD_COMPLETE:
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
                if (isNullOrUndefined(state.UserListSortingInfo)) {
                    state.UserListSortingInfo = <AeSortModel>{};
                    state.UserListSortingInfo.SortField = 'FullName';
                    state.UserListSortingInfo.Direction = 0;
                }
                return Object.assign({}, state, { isUserListLoading: false, UserList: action.payload.UserList });
            }
        case userActions.ActionTypes.LOAD_USER_ON_PAGE_CHANGE: {
            return Object.assign({}, state, { isUserListLoading: true, UserListPagingInfo: Object.assign({}, state.UserListPagingInfo, { PageNumber: action.payload.pageNumber, Count: action.payload.noOfRows }) });
        }

        case userActions.ActionTypes.LOAD_USER_ON_SORT: {
            return Object.assign({}, state, { isUserListLoading: true, UserListSortingInfo: Object.assign({}, state.UserListSortingInfo, { SortField: action.payload.SortField, Direction: action.payload.Direction }) });
        }

        case userActions.ActionTypes.USER_ADD:
            {
                return Object.assign({}, state, { UserAddUpdateCompleted: false, UserAddUpdateFormData: action.payload });
            }

        case userActions.ActionTypes.USER_ADD_COMPLETED:
            {
                return Object.assign({}, state, { UserAddUpdateCompleted: true, UserAddUpdateFormData: action.payload });
            }

        case userActions.ActionTypes.USER_UPDATE:
            {
                return Object.assign({}, state, { UserAddUpdateCompleted: false, UserAddUpdateFormData: action.payload });
            }

        case userActions.ActionTypes.USER_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { UserAddUpdateCompleted: true, UserAddUpdateFormData: action.payload });
            }
        case userActions.ActionTypes.USER_REMOVE:
            {
                return Object.assign({}, state, { UserAddUpdateFormData: action.payload });
            }
        case userActions.ActionTypes.USER_REMOVE_COMPLETE:
            {
                return Object.assign({}, state, {});
            }

        case userActions.ActionTypes.USER_DISABLE:
            {
                return Object.assign({}, state, { UserAddUpdateFormData: action.payload });
            }
        case userActions.ActionTypes.USER_DISABLE_COMPLETE:
            {
                return Object.assign({}, state, {});
            }
        case userActions.ActionTypes.LOAD_USER_ON_FILTER_CHANGE: {
            return Object.assign({}, state, { isUserListLoading: true, Filters: action.payload, UserListPagingInfo: Object.assign({}, state.UserListPagingInfo, { PageNumber: 1 }) });
        }
        case userActions.ActionTypes.ADVICE_CARD_NUMBER_OPTION_LOAD:
            {
                return Object.assign({}, state, { HasAdviceCardNumberOptionListLoaded: false });
            }

        case userActions.ActionTypes.ADVICE_CARD_NUMBER_OPTION_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { HasAdviceCardNumberOptionListLoaded: true, AdviceCardNumberOptionList: action.payload });
            }
        case userActions.ActionTypes.VALIDATE_USER_NAME:
            {
                return Object.assign({}, state, { UserNameValidationInProgress: true });
            }

        case userActions.ActionTypes.VALIDATE_USER_NAME_COMPLETED:
            {
                return Object.assign({}, state, { UserNameValidationInProgress: false, IsUserNameValid: action.payload });
            }
        case userActions.ActionTypes.GET_USER_PERMISSIONS:
            {
                return Object.assign({}, state, { UserProfileData: null });
            }
        case userActions.ActionTypes.GET_USER_PERMISSIONS_COMPLETED:
            {
                return Object.assign({}, state, { UserProfileData: action.payload });
            }
        case userActions.ActionTypes.VALIDATE_EMAIL:
            {
                return Object.assign({}, state);
            }
        case userActions.ActionTypes.VALIDATE_EMAIL_COMPLETE:
            {
                return Object.assign({}, state, { IsEmailAvailable: action.payload });
            }

        case userActions.ActionTypes.SAVE_ACN_ASSIGNMENTS_COMPLETED:
            {
                return Object.assign({}, state, { UserAddUpdateCompleted: false, AdviceCardNumberOptionList: null });
            }
        case userActions.ActionTypes.GET_PERMISSIONS:
            {
                return Object.assign({}, state, { PermissionGroups: null });
            }
        case userActions.ActionTypes.GET_PERMISSIONS_COMPLETED:
            {
                return Object.assign({}, state, { PermissionGroups: action.payload });
            }

        case userActions.ActionTypes.UPDATE_USER_PERMISSIONS:
            {
                return Object.assign({}, state, { UpdateUserPermissionFormData: action.payload });
            }

        case userActions.ActionTypes.UPDATE_USER_PERMISSIONS_COMPLETED:
            {
                return Object.assign({}, state, {});
            }
        case userActions.ActionTypes.LOAD_USER_INFO_COMPLETE:
            {
                return Object.assign({}, state, { SelectedUser: action.payload });
            }
        case userActions.ActionTypes.LOAD_AUDIT_LOG_DATA:
            {
                return Object.assign({}, state, { LoadingAuditData: true });
            }
        case userActions.ActionTypes.LOAD_AUDIT_LOG_DATA_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(action.payload)) {
                    return Object.assign({}, modifiedState, {
                        AuditLogData: action.payload,
                        CurrentPageAuditLogData: action.payload.slice(0, 10),
                        LoadingAuditData: false,
                        AuditLogDataPagingInfo: new PagingInfo(0, 0, 1, 10)
                    });
                }
                return modifiedState;
            }
        case userActions.ActionTypes.LOAD_AUDIT_LOG_DATA_ON_PAGE_CHANGE:
            {
                let request = <AtlasApiRequestWithParams>action.payload;
                let modifiedState: CompanyUserState = Object.assign({}, state);
                if (isNullOrUndefined(modifiedState.AuditLogData)) return modifiedState;
                let logData = modifiedState.AuditLogData;
                let logsTotalCount = logData ? logData.length : 0;
                //logData = CommonHelpers.sortArray(logData, request.SortBy.SortField, request.SortBy.Direction);
                let startPage = (request.PageNumber * request.PageSize) - request.PageSize;
                let endPage = (request.PageNumber * request.PageSize);
                let slicedRecords = logData && logData.length > 0 ? logData.slice(startPage, endPage) : [];
                modifiedState = Object.assign({}, modifiedState, { CurrentPageAuditLogData: slicedRecords });
                //DO NOT SEND slicedRecords.length to pagingInfo count
                modifiedState.AuditLogDataPagingInfo = new PagingInfo(request.PageSize, logsTotalCount, request.PageNumber, request.PageSize);
                return modifiedState;
            }
        case userActions.ActionTypes.LOAD_AUDIT_LOG_VERSION_DATA:
            {
                return Object.assign({}, state, { CurrentLogVersionData: null });
            }
        case userActions.ActionTypes.LOAD_AUDIT_LOG_VERSION_DATA_COMPLETE:
            {
                return Object.assign({}, state, { CurrentLogVersionData: action.payload });
            }
        default:
            return state;
    }
}


export function getAllUsers(state$: Observable<CompanyUserState>): Observable<User[]> {
    return state$.select(s => s && s.AllUsersList);
};


export function getSelectedUserInfo(state$: Observable<CompanyUserState>): Observable<User> {
    return state$.select(s => s && s.SelectedUser);
};

export function getUserListingData(state$: Observable<CompanyUserState>): Observable<Immutable.List<User>> {
    return state$.select(s => s.UserList && Immutable.List(s.UserList));
}

export function getUserTotalRecords(state$: Observable<CompanyUserState>): Observable<number> {
    return state$.select(s => s && s.UserListPagingInfo && s.UserListPagingInfo.TotalCount);
};

export function CurrentUser(state$: Observable<CompanyUserState>): Observable<User> {
    return state$.select(s => s.UserAddUpdateFormData);
}

export function fetchUserForSelectedId(state$: Observable<CompanyUserState>): Observable<User> {
    return state$.select(s => s.UserAddUpdateFormData);
}

export function getUserListDataTableOptions(state$: Observable<CompanyUserState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.UserListPagingInfo && state.UserListSortingInfo && extractDataTableOptions(state.UserListPagingInfo,state.UserListSortingInfo));
}

export function getUserListDataLoading(state$: Observable<CompanyUserState>): Observable<boolean> {
    return state$.select(s => !isNullOrUndefined(s) && s.isUserListLoading);
};

export function getAdviceCardNumberOptionListData(state$: Observable<CompanyUserState>): Observable<AeSelectItem<string>[]> {
    return state$.select(s => s.AdviceCardNumberOptionList);
}

export function getAdviceCardNumberOptionListDataStatus(state$: Observable<CompanyUserState>): Observable<boolean> {
    return state$.select(s => s.HasAdviceCardNumberOptionListLoaded);
}

export function validateUserName(state$: Observable<CompanyUserState>): Observable<boolean> {
    return state$.select(s => s.IsUserNameValid);
}
export function getEmailAvailability(state$: Observable<CompanyUserState>): Observable<boolean> {
    return state$.select(s => s.IsEmailAvailable);
}
export function getSelectedUserProfile(state$: Observable<CompanyUserState>): Observable<UserProfilesViewVm> {
    return state$.select(s => s.UserProfileData);
}

export function userAddOrUpdateComplete(state$: Observable<CompanyUserState>): Observable<boolean> {
    return state$.select(s => s.UserAddUpdateCompleted);
}

export function getPermissionGroups(state$: Observable<CompanyUserState>): Observable<Array<UserPermissionsGroup>> {
    return state$.select(s => s.PermissionGroups);
}

export function getAuditLogData(state$: Observable<CompanyUserState>): Observable<Immutable.List<AuditLog>> {
    return state$.select(s => Immutable.List(s.CurrentPageAuditLogData));
}

export function getAuditLogDataPageInformation(state$: Observable<CompanyUserState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.AuditLogDataPagingInfo && new DataTableOptions(state.AuditLogDataPagingInfo.PageNumber, state.AuditLogDataPagingInfo.PageSize));
}

export function getAuditLogDataLength(state$: Observable<CompanyUserState>): Observable<number> {
    return state$.select(s => s && s.AuditLogData && s.AuditLogData.length);
}

export function getAuditLogDataLoadingStatus(state$: Observable<CompanyUserState>): Observable<boolean> {
    return state$.select(s => s.LoadingAuditData);
}

export function getCurrentLogVersionData(state$: Observable<CompanyUserState>): Observable<LogVersion[]> {
    return state$.select(s => s.CurrentLogVersionData);
}








