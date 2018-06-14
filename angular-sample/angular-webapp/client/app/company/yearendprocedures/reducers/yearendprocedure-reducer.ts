import { AeInformationBarItem } from './../../../atlas-elements/common/models/ae-informationbar-item';
import { Action } from '@ngrx/store';
import * as yepActions from '../actions/yearendprocedure-actions';
import { Observable } from 'rxjs/Observable';
import {
    YearEndProcedureModel
    , YearEndProcedureResultModel
} from './../models/yearendprocedure-model';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import { extractDataTableOptions } from './../../../shared/helpers/extract-helpers';
import * as Immutable from 'immutable';
import { MyAbsence } from './../../../holiday-absence/models/holiday-absence.model';
import { processMyAbsencesList } from './../../../holiday-absence/common/extract-helpers';

export interface YearEndProcedureState {
    PendingRequestsApiRequestWithParams: AtlasApiRequestWithParams;
    PendingRequestsLoaded: boolean;
    PendingRequestsPagingInfo: PagingInfo;
    PendingRequests: MyAbsence[];
    YearEndProcedureData: YearEndProcedureModel;
    IsYEPResultsLoaded: boolean;
    YearEndProcedureResults: Array<YearEndProcedureResultModel>;
    YEPResultRequestWithParams: AtlasApiRequestWithParams;
    YearEndResultsPagingInfo: PagingInfo;
    ZeroEntitlementEmployees: Array<string>;
}

const initialState = {
    PendingRequestsApiRequestWithParams: null,
    PendingRequestsLoaded: null,
    PendingRequestsPagingInfo: null,
    PendingRequests: null,
    YearEndProcedureData: null,
    YearEndProcedureResults: null,
    YEPResultRequestWithParams: null,
    YearEndResultsPagingInfo: null,
    IsYEPRunCompleted: null,
    IsYEPResultsLoaded: null,
    ZeroEntitlementEmployees: null
};

export function YearEndProcedureReducer(state = initialState, action: Action): YearEndProcedureState {
    switch (action.type) {
        case yepActions.ActionTypes.LOAD_PENDING_HOLIDAY_ABSENCE_REQUESTS:
            {
                state = Object.assign({}, state, {
                    PendingRequestsLoaded: false
                    , PendingRequestsApiRequestWithParams: action.payload
                });
            }
            break;
        case yepActions.ActionTypes.LOAD_PENDING_HOLIDAY_ABSENCE_REQUESTS_COMPLETE:
            {
                state = Object.assign({}, state, {
                    PendingRequestsLoaded: true
                    , PendingRequests: processMyAbsencesList(action.payload.Entities)
                });
            }
            break;
        case yepActions.ActionTypes.UPDATE_PENDING_HOLIDAY_ABSENCE_REQUESTS_PAGINGINFO:
            {
                state = Object.assign({}, state, {
                    PendingRequestsPagingInfo: action.payload
                });
            }
            break;
        case yepActions.ActionTypes.LOAD_YEAR_END_PROCEDURE_DATA:
            {
                state = Object.assign({}, state);
            }
            break;
        case yepActions.ActionTypes.LOAD_YEAR_END_PROCEDURE_DATA_COMPLETE:
            {
                state = Object.assign({}, state, { YearEndProcedureData: action.payload });
            }
            break;
        case yepActions.ActionTypes.LOAD_YEAR_END_PROCEDURE_RESULTS:
            {
                state = Object.assign({}, state, { IsYEPResultsLoaded: false, YEPResultRequestWithParams: action.payload });
            }
            break;
        case yepActions.ActionTypes.LOAD_YEAR_END_PROCEDURE_RESULTS_COMPLETE:
            {
                state = Object.assign({}, state, {
                    IsYEPResultsLoaded: true
                    , YearEndProcedureResults: action.payload
                });
            }
            break;
        case yepActions.ActionTypes.UPDATE_YEAR_END_PROCEDURE_RESULTS_PAGINGINFO:
            {
                state = Object.assign({}, state, { YearEndResultsPagingInfo: action.payload });
            }
            break;
        case yepActions.ActionTypes.LOAD_EMPLOYEES_WITH_ZERO_ENTITLEMENT_COMPLETE:
            {
                state = Object.assign({}, state, { ZeroEntitlementEmployees: action.payload });
            }
            break;
        case yepActions.ActionTypes.CLEAR_EMPLOYEE_WITH_ZERO_ENTITLEMENT:
            {
                state = Object.assign({}, state, { ZeroEntitlementEmployees: null });
            }
            break;
        case yepActions.ActionTypes.CLEAR_YEAR_END_PROCEDURE_RESULTS:
            {
                state = Object.assign({}, state, { IsYEPResultsLoaded: null, YEPResultRequestWithParams: null });
            }
            break;
    }
    return state;
}

export function getYearEndProcedure(state$: Observable<YearEndProcedureState>): Observable<YearEndProcedureModel> {
    return state$.select(s => s.YearEndProcedureData);
}

export function getYearEndProcedureResults(state$: Observable<YearEndProcedureState>):
    Observable<Immutable.List<YearEndProcedureResultModel>> {
    return state$.select(state => Immutable.List<YearEndProcedureResultModel>(state.YearEndProcedureResults));
};

export function getYearEndProcedureResultsLoaded(state$: Observable<YearEndProcedureState>): Observable<boolean> {
    return state$.select(s => s.IsYEPResultsLoaded);
};

export function getYearEndProcedureApiRequest(state$: Observable<YearEndProcedureState>): Observable<AtlasApiRequestWithParams> {
    return state$.select(s => s.YEPResultRequestWithParams);
}

export function getYEPResultDataTableOptions(state$: Observable<YearEndProcedureState>): Observable<DataTableOptions> {
    return state$.select(state => state.YearEndResultsPagingInfo &&
        extractDataTableOptions(state.YearEndResultsPagingInfo));
}

export function getYEPResultsTotalCount(state$: Observable<YearEndProcedureState>): Observable<number> {
    return state$.select(s => s.YearEndResultsPagingInfo ? s.YearEndResultsPagingInfo.TotalCount : 0);
};

export function getZeroEntitlementEmployees(state$: Observable<YearEndProcedureState>): Observable<Array<string>> {
    return state$.select(s => s.ZeroEntitlementEmployees);
};

export function getPendingHolidayAbsenceRequests(state$: Observable<YearEndProcedureState>):
    Observable<Immutable.List<MyAbsence>> {
    return state$.select(state => state.PendingRequests && Immutable.List<MyAbsence>(state.PendingRequests));
};

export function getPendingRequestsLoaded(state$: Observable<YearEndProcedureState>): Observable<boolean> {
    return state$.select(s => s.PendingRequestsLoaded);
};

export function getPendingRequestsApiRequest(state$: Observable<YearEndProcedureState>): Observable<AtlasApiRequestWithParams> {
    return state$.select(s => s.PendingRequestsApiRequestWithParams);
}

export function getPendingRequestsDataTableOptions(state$: Observable<YearEndProcedureState>): Observable<DataTableOptions> {
    return state$.select(state => state.PendingRequestsPagingInfo && state.PendingRequestsApiRequestWithParams &&
        extractDataTableOptions(state.PendingRequestsPagingInfo,state.PendingRequestsApiRequestWithParams.SortBy));
}

export function getPendingRequestsTotalCount(state$: Observable<YearEndProcedureState>): Observable<number> {
    return state$.select(s => s.PendingRequestsPagingInfo ? s.PendingRequestsPagingInfo.TotalCount : 0);
}