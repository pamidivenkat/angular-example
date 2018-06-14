import { DataTableOptions } from '../../atlas-elements/common/models/ae-datatable-options';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { extractDataTableOptions } from '../../shared/helpers/extract-helpers';
import { isNullOrUndefined } from 'util';
import { AeSortModel } from '../../atlas-elements/common/models/ae-sort-model';
import { Action } from '@ngrx/store';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { Report } from '../models/report';
import * as Immutable from 'immutable';
import * as ReportActions from '../actions/report-actions';
import { Observable } from 'rxjs/Rx';

export interface ReportsState {
    status: boolean
    ReportsList: Immutable.List<Report>,
    ReportsPagingInfo: PagingInfo,
    ReportsSortInfo: AeSortModel;
    ReportInformationItems: AeInformationBarItem[],
    Filters: Map<string, string>;
}

const initialState: ReportsState = {
    status: false,
    ReportsList: null,
    ReportsPagingInfo: null,
    ReportsSortInfo: null,
    ReportInformationItems: null,
    Filters: null
}

export function reducer(state = initialState, action: Action): ReportsState {
    switch (action.type) {
        case ReportActions.ActionTypes.LOAD_INFORMATION_COMPONENT:
            {
                return Object.assign({}, state, {});
            }
        case ReportActions.ActionTypes.LOAD_INFORMATION_COMPONENT_COMPLETE:
            {
                return Object.assign({}, state, { ReportInformationItems: action.payload });
            }
        case ReportActions.ActionTypes.LOAD_REPORTS:
            {
                let modifiedState = Object.assign({}, state, { status: true, Filters: action.payload });
                if (isNullOrUndefined(state.Filters)) {
                    modifiedState.Filters = action.payload;
                }
                else {
                    modifiedState.Filters = Object.assign(state.Filters, action.payload);
                }
                if (isNullOrUndefined(modifiedState.ReportsSortInfo)) {
                    modifiedState.ReportsSortInfo = <AeSortModel>{};
                }
                modifiedState.ReportsSortInfo.SortField = action.payload.sortField;
                modifiedState.ReportsSortInfo.Direction = action.payload.direction; 
                return modifiedState;
            }
        case ReportActions.ActionTypes.LOAD_REPORTS_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, { status: false, ReportsList: action.payload.ReportsList });
                if (!isNullOrUndefined(modifiedState.ReportsPagingInfo)) {
                    if (action.payload.ReportsPagingInfo.PageNumber == 1) {
                        modifiedState.ReportsPagingInfo.TotalCount = action.payload.ReportsPagingInfo.TotalCount;
                    }
                    modifiedState.ReportsPagingInfo.PageNumber = action.payload.ReportsPagingInfo.PageNumber;
                    modifiedState.ReportsPagingInfo.Count = action.payload.ReportsPagingInfo.Count;
                }
                else {
                    modifiedState.ReportsPagingInfo = action.payload.ReportsPagingInfo;
                }
                if (isNullOrUndefined(modifiedState.ReportsSortInfo)) {
                    modifiedState.ReportsSortInfo = <AeSortModel>{};
                    modifiedState.ReportsSortInfo.SortField = 'Name';
                    modifiedState.ReportsSortInfo.Direction = 1;
                }

                return modifiedState;
            }
        case ReportActions.ActionTypes.LOAD_REPORTS_ONPAGECHANGE:
            {
                return Object.assign({}, state, { status: true, ReportsPagingInfo: Object.assign({}, state.ReportsPagingInfo, { PageNumber: action.payload.pageNumber, Count: action.payload.noOfRows }) });
            }
        case ReportActions.ActionTypes.LOAD_REPORTS_ONSORT: {
            return Object.assign({}, state, { status: true, ReportsSortInfo: Object.assign({}, state.ReportsSortInfo, { SortField: action.payload.SortField, Direction: action.payload.Direction }) });
        }
        default:
            return state;

    }
}

export function getReportsList(state$: Observable<ReportsState>): Observable<Immutable.List<Report>> {
    return state$.select(state => state && state.ReportsList);
};

export function getReportsInformationItems(state$: Observable<ReportsState>): Observable<AeInformationBarItem[]> {
    return state$.select(state => state && state.ReportInformationItems);
};

export function getReportsDataTableOptions(state$: Observable<ReportsState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.ReportsPagingInfo && state.ReportsSortInfo && extractDataTableOptions(state.ReportsPagingInfo, state.ReportsSortInfo));
}

export function getReportsLoadingStatus(state$: Observable<ReportsState>): Observable<boolean> {
    return state$.select(state => state && state.status);
};

export function getReportsTotalCount(state$: Observable<ReportsState>): Observable<number> {
    return state$.select(state => state && state.ReportsPagingInfo && state.ReportsPagingInfo.TotalCount);
};

