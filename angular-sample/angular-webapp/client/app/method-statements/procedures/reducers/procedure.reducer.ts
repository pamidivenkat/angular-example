import { isNullOrUndefined } from 'util';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { Observable } from 'rxjs/Rx';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { AeInformationBarItem } from './../../../atlas-elements/common/models/ae-informationbar-item';
import { Action } from '@ngrx/store';
import * as procedureActions from './../actions/procedure-actions';
import { extractDataTableOptions } from './../../../shared/helpers/extract-helpers';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import * as Immutable from 'immutable';
import { Procedure } from '../models/procedure';


export interface ProcedureState {
    HasProcedureListLoaded: boolean;
    CustomProcedureRequest: AtlasApiRequestWithParams;
    ProcedureList: Procedure[];
    ProcedurePagingInfo: PagingInfo;
    copiedProcedureId: string;
    HasSelectedProcedureListLoaded: boolean;
    IsSelectedProcedureAdded: boolean;
    SelectedProcedure: Procedure;
    IsSelectedProcedureUpdated: boolean;
    SelectedFullEnityProcedure: Procedure;
    exampleProceduresTotalCount: number;
    proceduresTotalCount: number;
}

const initialState: ProcedureState = {
    HasProcedureListLoaded: false,
    CustomProcedureRequest: null,
    copiedProcedureId: null,
    ProcedureList: null,
    ProcedurePagingInfo: null,
    HasSelectedProcedureListLoaded: false,
    IsSelectedProcedureAdded: false,
    SelectedProcedure: null,
    IsSelectedProcedureUpdated: false,
    SelectedFullEnityProcedure: null,
    exampleProceduresTotalCount: null,
    proceduresTotalCount: null
};

export function reducer(state = initialState, action: Action): ProcedureState {
    switch (action.type) {
        case procedureActions.ActionTypes.LOAD_PROCEDURES: {
            let requested = <AtlasApiRequestWithParams>action.payload;
            let modifiedState = Object.assign({}, state, { HasProcedureListLoaded: true, CustomProcedureRequest: action.payload });
            return modifiedState;
        }
        case procedureActions.ActionTypes.LOAD_PROCEDURES_COMPLETE: {
            let modifiedState: ProcedureState = Object.assign({}, state, { HasProcedureListLoaded: false, ProcedureList: action.payload.Entities });

            if (!isNullOrUndefined(state.ProcedurePagingInfo)) {
                if (action.payload.PagingInfo.PageNumber == 1) {
                    modifiedState.ProcedurePagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                    if (!isNullOrUndefined(action.payload.Entities) && action.payload.Entities[0]) {
                        modifiedState.exampleProceduresTotalCount = action.payload.Entities[0].IsExample ? action.payload.PagingInfo.TotalCount : modifiedState.exampleProceduresTotalCount;
                        modifiedState.proceduresTotalCount = action.payload.Entities[0].IsExample == false ? action.payload.PagingInfo.TotalCount : modifiedState.proceduresTotalCount;
                    }
                }
                modifiedState.ProcedurePagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                modifiedState.ProcedurePagingInfo.Count = action.payload.PagingInfo.Count;
            }
            else {
                modifiedState.ProcedurePagingInfo = action.payload.PagingInfo;
            }
            return modifiedState;
        }
        case procedureActions.ActionTypes.COPY_PROCEDURE: {
            let modifiedState = Object.assign({}, state);
            return modifiedState;
        }
        case procedureActions.ActionTypes.COPY_PROCEDURE_COMPLETE: {
            let modifiedState = Object.assign({}, state);
            modifiedState.copiedProcedureId = action.payload.Id;
            return modifiedState;
        }
        case procedureActions.ActionTypes.LOAD_SELECTED_PROCEDURE: {
            let modifiedState = Object.assign({}, state, { HasSelectedProcedureListLoaded: true });
            return modifiedState;
        }
        case procedureActions.ActionTypes.LOAD_SELECTED_PROCEDURE_COMPLETE: {
            let modifiedState = Object.assign({}, state, { HasSelectedProcedureListLoaded: false });
            return modifiedState;
        }
        case procedureActions.ActionTypes.ADD_PROCEDURE: {
            return Object.assign({}, state, { IsSelectedProcedureAdded: false });
        }
        case procedureActions.ActionTypes.ADD_PROCEDURE_COMPLETE: {
            let modifiedState = Object.assign({}, state, { IsSelectedProcedureAdded: true });
            modifiedState.SelectedProcedure = action.payload;
            modifiedState.proceduresTotalCount += 1;
            return modifiedState;
        }
        case procedureActions.ActionTypes.UPDATE_PROCEDURE: {
            return Object.assign({}, state, { IsSelectedProcedureUpdated: false });
        }
        case procedureActions.ActionTypes.UPDATE_PROCEDURE_COMPLETE: {
            return Object.assign({}, state, {
                IsSelectedProcedureUpdated: true, SelectedProcedure: action.payload,
                SelectedFullEnityProcedure: null
            });
        }
        case procedureActions.ActionTypes.LOAD_PROCEDURE_BY_ID_COMPLETE: {
            return Object.assign({}, state, { SelectedFullEnityProcedure: action.payload });
        }
        case procedureActions.ActionTypes.LOAD_EXAMPLE_PROCEDURES_TOTALCOUNT_COMPLETE: {
            return Object.assign({}, state, { exampleProceduresTotalCount: action.payload });
        }
        case procedureActions.ActionTypes.LOAD_PROCEDURES_TOTALCOUNT_COMPLETE: {
            return Object.assign({}, state, { proceduresTotalCount: action.payload });
        }
        default:
            return state;
    }
}

export function getProcedureListDataTotalCount(state$: Observable<ProcedureState>): Observable<number> {
    return state$.select(s => s.ProcedurePagingInfo && s.ProcedurePagingInfo.TotalCount);
}
export function getProcedureListLoadingState(state$: Observable<ProcedureState>): Observable<boolean> {
    return state$.select(s => s.HasProcedureListLoaded);
}
export function getProcedureList(state$: Observable<ProcedureState>): Observable<Immutable.List<Procedure>> {
    return state$.select(s => s.ProcedureList && Immutable.List<Procedure>(s.ProcedureList));
}

export function getProcedureListTotalCount(state$: Observable<ProcedureState>): Observable<number> {
    return state$.select(s => s && s.proceduresTotalCount);
}


export function getExampleProcedureListTotalCount(state$: Observable<ProcedureState>): Observable<number> {
    return state$.select(s => s && s.exampleProceduresTotalCount);
}

export function getProcedureListDataTableOptions(state$: Observable<ProcedureState>): Observable<DataTableOptions> {
    return state$.select(s => s.ProcedureList && s.ProcedurePagingInfo && s.CustomProcedureRequest && extractDataTableOptions(s.ProcedurePagingInfo,s.CustomProcedureRequest.SortBy));
}
export function getCopiedProcedure(state$: Observable<ProcedureState>): Observable<string> {
    return state$.select(s => s.copiedProcedureId);
};
export function getSelectedFullEnityProcedure(state$: Observable<ProcedureState>): Observable<Procedure> {
    return state$.select(s => s.SelectedFullEnityProcedure);
};
