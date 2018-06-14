import { SiteAssignment } from '../models/site-assignments.model';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { AtlasApiResponse, AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';
import { Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { Action } from '@ngrx/store';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { Site } from '../models/site.model';
import * as siteActions from '../actions/sites.actions';
import * as Immutable from 'immutable';
import { extractDataTableOptions } from '../../../shared/helpers/extract-helpers';

export interface SiteState {
    sitesList: Array<Site>,
    apiRequestWithParams: AtlasApiRequestWithParams,
    sitesListTotalCount: number;
    siteAssignMents: Array<SiteAssignment>,
    companyAddress: string,
    loading: boolean;
    selectedSite: Site;
}

const initialState: SiteState = {
    sitesList: null,
    apiRequestWithParams: null,
    sitesListTotalCount: null,
    siteAssignMents: null,
    companyAddress: null,
    loading: false,
    selectedSite: null
}

export function reducer(state = initialState, action: Action): SiteState {
    switch (action.type) {
        case siteActions.ActionTypes.SITES_LIST_LOAD:
            {
                return Object.assign({}, state, { loading: true, apiRequestWithParams: action.payload });
            }
        case siteActions.ActionTypes.SITES_LIST_LOAD_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.apiRequestWithParams)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.sitesListTotalCount = action.payload.PagingInfo.TotalCount;
                    }
                }

                return Object.assign({}, modifiedState, { sitesList: action.payload.SitesList, loading: false });
            }
        case siteActions.ActionTypes.SITE_ASSIGNMENTS_LOAD:
            {
                return Object.assign({}, state, {});
            }
        case siteActions.ActionTypes.SITE_ASSIGNMENTS_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { siteAssignMents: action.payload.SiteAssignments });
            }
        case siteActions.ActionTypes.REMOVE_SITE:
            {
                return Object.assign({}, state, {});
            }
        case siteActions.ActionTypes.UPDATE_SITE:
            {
                return Object.assign({}, state, {});
            }
        case siteActions.ActionTypes.COMPANY_HO_ADDRESS:
            {
                return Object.assign({});
            }
        case siteActions.ActionTypes.COMPANY_HO_ADDRESS_COMPLETE:
            {
                return Object.assign({}, state, { companyAddress: action.payload });
            }
        case siteActions.ActionTypes.SITES_BY_ID_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { selectedSite: action.payload });
            }
        case siteActions.ActionTypes.SITES_SELECTED_SITE_CLEAR: {
            let modifiedState: SiteState = Object.assign({}, state, {});
            let id = action.payload;
            if (isNullOrUndefined(id)) {
                modifiedState.selectedSite = null;
            } else if (!isNullOrUndefined(modifiedState.selectedSite) && modifiedState.selectedSite.Id != id) {
                modifiedState.selectedSite = null;
            }
        }
        default:
            return state;
    }
}


export function getSelectedSite(state$: Observable<SiteState>): Observable<Site> {
    return state$.select(s => s && s.selectedSite);
}

export function getSitesListData(state$: Observable<SiteState>): Observable<Array<Site>> {
    return state$.select(s => s && s.sitesList);
}
export function getCompanyHOAddress(state$: Observable<SiteState>): Observable<string> {
    return state$.select(s => s && s.companyAddress);
}

export function getSitesTotalCount(state$: Observable<SiteState>): Observable<number> {
    return state$.select(s => s && s.sitesListTotalCount);
}

export function getSitesPageInformation(state$: Observable<SiteState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.apiRequestWithParams && new DataTableOptions(state.apiRequestWithParams.PageNumber, state.apiRequestWithParams.PageSize,state.apiRequestWithParams.SortBy.SortField,state.apiRequestWithParams.SortBy.Direction));
}

export function getSitesLoadingStatus(state$: Observable<SiteState>): Observable<boolean> {
    return state$.select(s => s && s.loading);
}

export function getSiteAssignmentsData(state$: Observable<SiteState>): Observable<Array<SiteAssignment>> {
    return state$.select(s => s && s.siteAssignMents);
}
