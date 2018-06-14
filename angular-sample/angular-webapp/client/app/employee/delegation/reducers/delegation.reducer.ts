
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import { extractDelegatedUsers } from '../../common/extract-helpers';
import { User } from './../../../shared/models/user';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { extractDataTableOptions } from '../../../shared/helpers/extract-helpers';
import { Delegation } from '../models/delegation';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { isNullOrUndefined } from 'util';
import { AtlasApiResponse, AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';
import { Observable } from 'rxjs/Rx';
import { Action, ActionReducer, combineReducers } from '@ngrx/store';
import * as delegationActions from '../actions/delegation.actions';
import { compose } from "@ngrx/core";
import * as Immutable from 'immutable';


export interface DelegationState {

    // delegation state - start
    userautosuggestApiRequest: AtlasApiRequestWithParams,
    userautosuggestApiResponse: User[],
    UserId: string,
    apiRequestWithParams: AtlasApiRequestWithParams,
    hasDelegationListLoaded: boolean,
    delegationListPagingInfo: PagingInfo;
    delegationsList: Delegation[],
    pagingInfo: PagingInfo;
    sortInfo: AeSortModel;
    HasUserlistsLoaded: boolean,
    IsDelegationAdded: boolean,
    IsDelegationUpdated: boolean;
    UsersList: Immutable.List<AeSelectItem<string>>
    // delegation state - end
}

const initialState: DelegationState = {
    userautosuggestApiRequest: null,
    userautosuggestApiResponse: null,
    UserId: null,
    apiRequestWithParams: null,
    IsDelegationAdded: false,
    IsDelegationUpdated: false,
    hasDelegationListLoaded: false,
    delegationsList: null,
    delegationListPagingInfo: null,
    pagingInfo: null,
    sortInfo: null,
    HasUserlistsLoaded: false,
    UsersList: null

}

export function reducer(state = initialState, action: Action): DelegationState {
    switch (action.type) {

        case delegationActions.ActionTypes.LOAD_DELEGATED_USERS_LIST:
            {
                return Object.assign({}, state, { hasDelegationListLoaded: false, apiRequestWithParams: action.payload });
            }
        case delegationActions.ActionTypes.LOAD_DELEGATED_USERS_LIST_COMPLETE:
            {
                let pl = <AtlasApiResponse<Delegation>>action.payload;
                let modifiedState = Object.assign({}, state, { hasDelegationListLoaded: true });
                modifiedState.delegationsList = pl.Entities;
                if (!isNullOrUndefined(modifiedState.delegationListPagingInfo)) {
                    if (pl.PagingInfo.PageNumber == 1) {
                        modifiedState.delegationListPagingInfo.TotalCount = pl.PagingInfo.TotalCount;
                    }
                    modifiedState.delegationListPagingInfo.Count = pl.PagingInfo.Count;
                    modifiedState.delegationListPagingInfo.PageNumber = pl.PagingInfo.PageNumber;
                }
                else {
                    modifiedState.delegationListPagingInfo = pl.PagingInfo;
                }
                return modifiedState;
            }        
        case delegationActions.ActionTypes.LOAD_USERS:
            {
                return Object.assign({}, state, { userautosuggestApiRequest: action.payload });
            }
        case delegationActions.ActionTypes.LOAD_USERS_COMPLETE:
            {
                let pl = <AtlasApiResponse<User>>action.payload;
                let modifiedState = Object.assign({}, state, {});
                modifiedState.userautosuggestApiResponse = pl.Entities;
                return modifiedState;
            }

        case delegationActions.ActionTypes.DELEGATED_USER_ADD:
            {
                return Object.assign({}, state, { IsDelegationAdded: true });
            }

        case delegationActions.ActionTypes.DELEGATED_USER_ADD_COMPLETE:
            {
                return Object.assign({}, state, { IsDelegationUpdated: false, Delegation: action.payload });
            }

        case delegationActions.ActionTypes.DELEGATED_USER_UPDATE:
            {
                return Object.assign({}, state, { IsDelegationAdded: true, Delegation: action.payload });
            }

        case delegationActions.ActionTypes.DELEGATED_USER_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { IsDelegationUpdated: false, Delegation: action.payload });
            }

        default:
            return state;
    }
}


// employee delegation state selectors - start

export function getDelegationRequestsLoaded(state$: Observable<DelegationState>): Observable<boolean> {
    return state$.select(s => s.hasDelegationListLoaded);
};

export function getDelegationRequests(state$: Observable<DelegationState>): Observable<Immutable.List<Delegation>> {
    return state$.select(s => Immutable.List<Delegation>(s.delegationsList));
}

export function getDelegationRequestsTotalCount(state$: Observable<DelegationState>): Observable<number> {
    return state$.select(s => s.delegationListPagingInfo ? s.delegationListPagingInfo.TotalCount : 0);
};

export function getfromDelegationHistoryDataTableOptions(state$: Observable<DelegationState>): Observable<DataTableOptions> {
    return state$.select(s => s.delegationListPagingInfo && s.apiRequestWithParams && extractDataTableOptions(s.delegationListPagingInfo,s.apiRequestWithParams.SortBy));
}

export function getDelegationApiRequest(state$: Observable<DelegationState>): Observable<AtlasApiRequestWithParams> {
    return state$.select(s => s.apiRequestWithParams);
}
export function getDelegationUserlists(state$: Observable<DelegationState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.UsersList);
}


export function getDelegationAutosuggestUserlists(state$: Observable<DelegationState>): Observable<AeSelectItem<string>[]> {
    return state$.select(s => s.userautosuggestApiResponse &&
        (s.userautosuggestApiResponse).map((user) => {
            let aeSelectItem = new AeSelectItem<string>(user.FirstName + ' ' + user.LastName, user.Id);
            return aeSelectItem
        })
    );
};





// employee delegation state selectors - end

