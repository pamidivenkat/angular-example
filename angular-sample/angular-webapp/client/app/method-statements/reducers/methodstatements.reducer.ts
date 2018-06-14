import { StringHelper } from './../../shared/helpers/string-helper';
import { getAtlasParamValueByKey } from '../../root-module/common/extract-helpers';
import { Params } from '@angular/router';
import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { MethodStatements, MethodStatement, MethodStatementStat } from './../models/method-statement';
import { isNullOrUndefined } from 'util';
import { AtlasApiRequestWithParams } from './../../shared/models/atlas-api-response';
import { AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as methodStatementsActions from './../actions/methodstatements.actions';
import { PagingInfo } from './../../atlas-elements/common/models/ae-paging-info';
import { extractDataTableOptions } from './../../shared/helpers/extract-helpers';
import { DataTableOptions } from './../../atlas-elements/common/models/ae-datatable-options';
import * as Immutable from 'immutable';

export interface MethodStatementsState {
    hasMethodStatementsListLoaded: boolean;

    LiveMethodStatementsList: MethodStatements[];
    LiveMethodStatementsPagingInfo: PagingInfo;

    PendingMethodStatementsList: MethodStatements[];
    PendingMethodStatementsPagingInfo: PagingInfo;

    CompletedMethodStatementsList: MethodStatements[];
    CompletedMethodStatementsPagingInfo: PagingInfo;

    ArchivedMethodStatementsList: MethodStatements[];
    ArchivedMethodStatementsPagingInfo: PagingInfo;

    ExampleMethodStatementsList: MethodStatements[];
    ExampleMethodStatementsPagingInfo: PagingInfo;

    apiRequestWithParams: AtlasApiRequestWithParams;
    filterWithParams: AtlasApiRequestWithParams;
    hasMSFiltersChanged: boolean;
    hasMethodStatementsStatsLoaded: boolean;
    methodStatementsStats: MethodStatementStat[];
}

const initialState: MethodStatementsState = {
    hasMethodStatementsListLoaded: false,

    LiveMethodStatementsList: null,
    LiveMethodStatementsPagingInfo: null,

    PendingMethodStatementsList: null,
    PendingMethodStatementsPagingInfo: null,

    CompletedMethodStatementsList: null,
    CompletedMethodStatementsPagingInfo: null,

    ArchivedMethodStatementsList: null,
    ArchivedMethodStatementsPagingInfo: null,

    ExampleMethodStatementsList: null,
    ExampleMethodStatementsPagingInfo: null,

    apiRequestWithParams: null,
    hasMSFiltersChanged: false,
    filterWithParams: null,
    hasMethodStatementsStatsLoaded: false,
    methodStatementsStats: null,
}

export function reducer(state = initialState, action: Action): MethodStatementsState {
    switch (action.type) {
        case methodStatementsActions.ActionTypes.LOAD_METHOD_STATEMENTS_LIST: {
            let modifiedState = Object.assign({}, state, { hasMethodStatementsListLoaded: false, apiRequestWithParams: action.payload });
            return modifiedState;
        }
        case methodStatementsActions.ActionTypes.LOAD_METHOD_STATEMENTS_TAB_CHANGED: {
            let modifiedState = Object.assign({}, state, { apiRequestWithParams: action.payload });
            return modifiedState;
        }
        case methodStatementsActions.ActionTypes.LOAD_METHOD_STATEMENTS_STATS: {
            let modifiedState = Object.assign({}, state, { hasMethodStatementsStatsLoaded: false });
            return modifiedState;
        }
        case methodStatementsActions.ActionTypes.LOAD_METHOD_STATEMENTS_STATS_COMPLETE: {
            let modifiedState = Object.assign({}, state, { hasMethodStatementsStatsLoaded: true, methodStatementsStats: action.payload });
            return modifiedState;
        }

        case methodStatementsActions.ActionTypes.LOAD_LIVE_METHOD_STATEMENTS_LIST_COMPLETE: {
            let modifiedState: MethodStatementsState = Object.assign({}, state, { hasMethodStatementsListLoaded: true, hasMSFiltersChanged: false, LiveMethodStatementsList: action.payload.Entities });
            if (!isNullOrUndefined(state.LiveMethodStatementsPagingInfo)) {
                if (action.payload.PagingInfo.PageNumber == 1) {
                    modifiedState.LiveMethodStatementsPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                }
                modifiedState.LiveMethodStatementsPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                modifiedState.LiveMethodStatementsPagingInfo.Count = action.payload.PagingInfo.Count;
            }
            else {
                modifiedState.LiveMethodStatementsPagingInfo = action.payload.PagingInfo;
            }
            return modifiedState;
        }

        case methodStatementsActions.ActionTypes.LOAD_PENDING_METHOD_STATEMENTS_LIST_COMPLETE: {
            let modifiedState: MethodStatementsState = Object.assign({}, state, { hasMethodStatementsListLoaded: true, hasMSFiltersChanged: false, PendingMethodStatementsList: action.payload.Entities });
            if (!isNullOrUndefined(state.PendingMethodStatementsPagingInfo)) {
                if (action.payload.PagingInfo.PageNumber == 1) {
                    modifiedState.PendingMethodStatementsPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                }
                modifiedState.PendingMethodStatementsPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                modifiedState.PendingMethodStatementsPagingInfo.Count = action.payload.PagingInfo.Count;
            }
            else {
                modifiedState.PendingMethodStatementsPagingInfo = action.payload.PagingInfo;
            }
            return modifiedState;
        }

        case methodStatementsActions.ActionTypes.LOAD_COMPLETED_METHOD_STATEMENTS_LIST_COMPLETE: {
            let modifiedState: MethodStatementsState = Object.assign({}, state, { hasMethodStatementsListLoaded: true, hasMSFiltersChanged: false, CompletedMethodStatementsList: action.payload.Entities });
            if (!isNullOrUndefined(state.CompletedMethodStatementsPagingInfo)) {
                if (action.payload.PagingInfo.PageNumber == 1) {
                    modifiedState.CompletedMethodStatementsPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                }
                modifiedState.CompletedMethodStatementsPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                modifiedState.CompletedMethodStatementsPagingInfo.Count = action.payload.PagingInfo.Count;
            }
            else {
                modifiedState.CompletedMethodStatementsPagingInfo = action.payload.PagingInfo;
            }
            return modifiedState;
        }

        case methodStatementsActions.ActionTypes.LOAD_ARCHIEVED_METHOD_STATEMENTS_LIST_COMPLETE: {
            let modifiedState: MethodStatementsState = Object.assign({}, state, { hasMethodStatementsListLoaded: true, hasMSFiltersChanged: false, ArchivedMethodStatementsList: action.payload.Entities });
            if (!isNullOrUndefined(state.ArchivedMethodStatementsPagingInfo)) {
                if (action.payload.PagingInfo.PageNumber == 1) {
                    modifiedState.ArchivedMethodStatementsPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                }
                modifiedState.ArchivedMethodStatementsPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                modifiedState.ArchivedMethodStatementsPagingInfo.Count = action.payload.PagingInfo.Count;
            }
            else {
                modifiedState.ArchivedMethodStatementsPagingInfo = action.payload.PagingInfo;
            }
            return modifiedState;
        }
        case methodStatementsActions.ActionTypes.LOAD_EXAMPLE_METHOD_STATEMENTS_LIST_COMPLETE: {
            let modifiedState: MethodStatementsState = Object.assign({}, state, { hasMethodStatementsListLoaded: true, hasMSFiltersChanged: false, ExampleMethodStatementsList: action.payload.Entities });
            if (!isNullOrUndefined(state.ExampleMethodStatementsPagingInfo)) {
                if (action.payload.PagingInfo.PageNumber == 1) {
                    modifiedState.ExampleMethodStatementsPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                }
                modifiedState.ExampleMethodStatementsPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                modifiedState.ExampleMethodStatementsPagingInfo.Count = action.payload.PagingInfo.Count;
            }
            else {
                modifiedState.ExampleMethodStatementsPagingInfo = action.payload.PagingInfo;
            }
            return modifiedState;
        }
        case methodStatementsActions.ActionTypes.LOAD_METHOD_STATEMENTS_FILTERS_CHANGED:
            {
                let request = action.payload;
                let params = new AtlasApiRequestWithParams(request.PageNumber, request.PageSize, request.SortBy.SortField, request.SortBy.Direction, request.Params);
                let stateObject: MethodStatementsState = Object.assign({}, state, {
                    filterWithParams: params,
                    hasMSFiltersChanged: true
                });

                let filterParams = stateObject.apiRequestWithParams;
                if (!isNullOrUndefined(filterParams)) {
                    if (!isNullOrUndefined(getAtlasParamValueByKey(filterParams.Params, "ByStatusId")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(filterParams.Params, "ByStatusId")))) {
                        stateObject.ExampleMethodStatementsList = null;
                        if (getAtlasParamValueByKey(filterParams.Params, "ByStatusId") != 1) {
                            stateObject.LiveMethodStatementsList = null;
                        } if (getAtlasParamValueByKey(filterParams.Params, "ByStatusId") != 0) {
                            stateObject.PendingMethodStatementsList = null;
                        } if (getAtlasParamValueByKey(filterParams.Params, "ByStatusId") != 3) {
                            stateObject.CompletedMethodStatementsList = null;
                        } if (getAtlasParamValueByKey(filterParams.Params, "ByStatusId") != 4) {
                            stateObject.ArchivedMethodStatementsList = null;
                        }
                    }
                    if (!isNullOrUndefined(getAtlasParamValueByKey(filterParams.Params, "isexample")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(filterParams.Params, "isexample")))) {
                        stateObject.LiveMethodStatementsList = null; stateObject.PendingMethodStatementsList = null; stateObject.CompletedMethodStatementsList = null; stateObject.ArchivedMethodStatementsList = null;
                    }

                    stateObject.filterWithParams.PageSize = stateObject.apiRequestWithParams.PageSize;
                    Object.assign(stateObject.apiRequestWithParams, stateObject.filterWithParams);
                }
                return stateObject;
            }
        case methodStatementsActions.ActionTypes.UPDATE_STATUS_METHOD_STATEMENT_COMPLETE:
            {
                let request = action.payload;
                let params = new AtlasApiRequestWithParams(request.PageNumber, request.PageSize, request.SortBy.SortField, request.SortBy.Direction, request.Params);
                let stateObject: MethodStatementsState = Object.assign({}, state, {
                    filterWithParams: params,
                    hasMSFiltersChanged: true
                });

                let filterParams = stateObject.apiRequestWithParams;
                if (!isNullOrUndefined(getAtlasParamValueByKey(filterParams.Params, "ByStatusIdOnUpdate")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(filterParams.Params, "ByStatusIdOnUpdate")))) {
                    stateObject.ExampleMethodStatementsList = null;
                    if (getAtlasParamValueByKey(filterParams.Params, "ByStatusIdOnUpdate") == 4) {
                        stateObject.ArchivedMethodStatementsList = null;
                    } if (getAtlasParamValueByKey(filterParams.Params, "ByStatusIdOnUpdate") == 0) {
                        stateObject.PendingMethodStatementsList = null;
                    }
                }
                if (!isNullOrUndefined(getAtlasParamValueByKey(filterParams.Params, "isexample")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(filterParams.Params, "isexample")))) {
                    stateObject.LiveMethodStatementsList = null; stateObject.PendingMethodStatementsList = null; stateObject.CompletedMethodStatementsList = null; stateObject.ArchivedMethodStatementsList = null;
                }
                stateObject.filterWithParams.PageSize = stateObject.apiRequestWithParams.PageSize;
                Object.assign(stateObject.apiRequestWithParams, stateObject.filterWithParams);
                return stateObject;
            }
        case methodStatementsActions.ActionTypes.COPY_METHOD_STATEMENT_COMPLETE:
            {
                let copyToDiffCompany: boolean = action.payload;
                if (!copyToDiffCompany) {
                    return Object.assign({}, state, {});
                }
                else {
                    return Object.assign(state, initialState);
                }
            }
        case methodStatementsActions.ActionTypes.CLEAR_METHOD_STATEMENT_STATE:
            {
                return Object.assign(state, initialState);
            }
        case methodStatementsActions.ActionTypes.UPDATE_METHODSTATEMENT:
            {
                return Object.assign(state, {
                    PendingMethodStatementsList: null,
                    PendingMethodStatementsPagingInfo: null
                });
            }
        default:
            return state;
    }
}

export function getMethodStatementsListLoadingState(state$: Observable<MethodStatementsState>): Observable<boolean> {
    return state$.select(s => s.hasMethodStatementsListLoaded);
}

export function getHasMSFiltersChanged(state$: Observable<MethodStatementsState>): Observable<boolean> {
    return state$.select(s => s.hasMSFiltersChanged);
};

export function getMSFilterApiRequest(state$: Observable<MethodStatementsState>): Observable<AtlasApiRequestWithParams> {
    return state$.select(s => s.filterWithParams);
};

export function getMethodStatementsStats(state$: Observable<MethodStatementsState>): Observable<MethodStatementStat[]> {
    return state$.select(s => s.methodStatementsStats);
};

export function getLiveMethodStatementsList(state$: Observable<MethodStatementsState>): Observable<Immutable.List<MethodStatements>> {
    return state$.select(s => s.LiveMethodStatementsList && Immutable.List<MethodStatements>(s.LiveMethodStatementsList));
}
export function getLiveMethodStatementsListTotalCount(state$: Observable<MethodStatementsState>): Observable<number> {
    return state$.select(s => s && s.LiveMethodStatementsPagingInfo && s.LiveMethodStatementsPagingInfo.TotalCount);
}
export function getLiveMethodStatementsListDataTableOptions(state$: Observable<MethodStatementsState>): Observable<DataTableOptions> {
    return state$.select(s => s.LiveMethodStatementsList && s.LiveMethodStatementsPagingInfo && s.apiRequestWithParams && extractDataTableOptions(s.LiveMethodStatementsPagingInfo, s.apiRequestWithParams.SortBy));
}

export function getPendingMethodStatementsList(state$: Observable<MethodStatementsState>): Observable<Immutable.List<MethodStatements>> {
    return state$.select(s => s.PendingMethodStatementsList && Immutable.List<MethodStatements>(s.PendingMethodStatementsList));
}
export function getPendingMethodStatementsListTotalCount(state$: Observable<MethodStatementsState>): Observable<number> {
    return state$.select(s => s && s.PendingMethodStatementsPagingInfo && s.PendingMethodStatementsPagingInfo.TotalCount);
}
export function getPendingMethodStatementsListDataTableOptions(state$: Observable<MethodStatementsState>): Observable<DataTableOptions> {
    return state$.select(s => s.PendingMethodStatementsList && s.PendingMethodStatementsPagingInfo && s.apiRequestWithParams && extractDataTableOptions(s.PendingMethodStatementsPagingInfo, s.apiRequestWithParams.SortBy));
}

export function getCompletedMethodStatementsList(state$: Observable<MethodStatementsState>): Observable<Immutable.List<MethodStatements>> {
    return state$.select(s => s.CompletedMethodStatementsList && Immutable.List<MethodStatements>(s.CompletedMethodStatementsList));
}
export function getCompletedMethodStatementsListTotalCount(state$: Observable<MethodStatementsState>): Observable<number> {
    return state$.select(s => s && s.CompletedMethodStatementsPagingInfo && s.CompletedMethodStatementsPagingInfo.TotalCount);
}
export function getCompletedMethodStatementsListDataTableOptions(state$: Observable<MethodStatementsState>): Observable<DataTableOptions> {
    return state$.select(s => s.CompletedMethodStatementsList && s.CompletedMethodStatementsPagingInfo && s.apiRequestWithParams && extractDataTableOptions(s.CompletedMethodStatementsPagingInfo, s.apiRequestWithParams.SortBy));
}

export function getArchivedMethodStatementsList(state$: Observable<MethodStatementsState>): Observable<Immutable.List<MethodStatements>> {
    return state$.select(s => s.ArchivedMethodStatementsList && Immutable.List<MethodStatements>(s.ArchivedMethodStatementsList));
}
export function getArchivedMethodStatementsListTotalCount(state$: Observable<MethodStatementsState>): Observable<number> {
    return state$.select(s => s && s.ArchivedMethodStatementsPagingInfo && s.ArchivedMethodStatementsPagingInfo.TotalCount);
}
export function getArchivedMethodStatementsListDataTableOptions(state$: Observable<MethodStatementsState>): Observable<DataTableOptions> {
    return state$.select(s => s.ArchivedMethodStatementsList && s.ArchivedMethodStatementsPagingInfo && s.apiRequestWithParams && extractDataTableOptions(s.ArchivedMethodStatementsPagingInfo, s.apiRequestWithParams.SortBy));
}

export function getExampleMethodStatementsList(state$: Observable<MethodStatementsState>): Observable<Immutable.List<MethodStatements>> {
    return state$.select(s => s.ExampleMethodStatementsList && Immutable.List<MethodStatements>(s.ExampleMethodStatementsList));
}
export function getExampleMethodStatementsListTotalCount(state$: Observable<MethodStatementsState>): Observable<number> {
    return state$.select(s => s && s.ExampleMethodStatementsPagingInfo && s.ExampleMethodStatementsPagingInfo.TotalCount);
}
export function getExampleMethodStatementsListDataTableOptions(state$: Observable<MethodStatementsState>): Observable<DataTableOptions> {
    return state$.select(s => s.ExampleMethodStatementsList && s.ExampleMethodStatementsPagingInfo && s.apiRequestWithParams && extractDataTableOptions(s.ExampleMethodStatementsPagingInfo, s.apiRequestWithParams.SortBy));
}
