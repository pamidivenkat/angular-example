import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import * as coshhInventoryLogActions from '../actions/coshh-inventory.actions';
import * as Immutable from 'immutable';
import { COSHHInventory } from '../models/coshh-inventory';
import { isNullOrUndefined } from 'util';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { AeSortModel } from '../../atlas-elements/common/models/ae-sort-model';
import { DataTableOptions } from '../../atlas-elements/common/models/ae-datatable-options';
import { extractDataTableOptions } from '../../shared/helpers/extract-helpers';
import { AtlasApiRequest } from "../../shared/models/atlas-api-response";

export interface COSHHInventoryState {
    isCOSHHInventoryListLoading: boolean;
    CoshhInventoryList: Immutable.List<COSHHInventory>;
    COSHHInventoryPagingInfo: PagingInfo;
    COSHHInventorySortingInfo: AeSortModel;
    currentApiRequest: AtlasApiRequest;
    SelectedseCoshhInventory: COSHHInventory;
}

const initialState: COSHHInventoryState = {
    isCOSHHInventoryListLoading: false,
    CoshhInventoryList: null,
    COSHHInventoryPagingInfo: null,
    COSHHInventorySortingInfo: null,
    currentApiRequest: null,
    SelectedseCoshhInventory: null
}

export function coshhInventoryReducer(state = initialState, action: Action): COSHHInventoryState {
    switch (action.type) {
        case coshhInventoryLogActions.ActionTypes.COSHHINVENTORY_LOAD:
            {
                return Object.assign({}, state, {isCOSHHInventoryListLoading: true, currentApiRequest: action.payload });
            }
        case coshhInventoryLogActions.ActionTypes.COSHHINVENTORY_LOAD_COMPLETE: {
            let modifiedState: COSHHInventoryState = Object.assign({}, state, { isCOSHHInventoryListLoading: false, CoshhInventoryList: action.payload.CoshhInventoryList });

            if (!isNullOrUndefined(state.COSHHInventoryPagingInfo)) {
                if (action.payload.COSHHInventoryPagingInfo.PageNumber == 1) {
                    modifiedState.COSHHInventoryPagingInfo.TotalCount = action.payload.COSHHInventoryPagingInfo.TotalCount;
                }
                modifiedState.COSHHInventoryPagingInfo.PageNumber = action.payload.COSHHInventoryPagingInfo.PageNumber;
                modifiedState.COSHHInventoryPagingInfo.Count = action.payload.COSHHInventoryPagingInfo.Count;
            }
            else {
                modifiedState.COSHHInventoryPagingInfo = action.payload.COSHHInventoryPagingInfo;
            }
            return modifiedState;
        }
        case coshhInventoryLogActions.ActionTypes.COSHHINVENTORY_VIEW:
            {
                return Object.assign({}, state, {});
            }
        case coshhInventoryLogActions.ActionTypes.COSHHINVENTORY_VIEW_COMPLETE:
            {
                return Object.assign({}, state, { SelectedseCoshhInventory: action.payload });
            }

        default:
            return state;
    }
}


export function getCOSHHInventoryList(state$: Observable<COSHHInventoryState>): Observable<Immutable.List<COSHHInventory>> {
    return state$.select(s => s.CoshhInventoryList);
}

export function getCOSHHInventoryTotalRecords(state$: Observable<COSHHInventoryState>): Observable<number> {
    return state$.select(s => s && s.COSHHInventoryPagingInfo && s.COSHHInventoryPagingInfo.TotalCount);
}

export function getCOSHHInventoryForSelectedId(state$: Observable<COSHHInventoryState>): Observable<COSHHInventory> {
    return state$.select(s => s.SelectedseCoshhInventory);
}

export function getCOSHHInventoryListDataTableOptions(state$: Observable<COSHHInventoryState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.COSHHInventoryPagingInfo && state.currentApiRequest && extractDataTableOptions(state.COSHHInventoryPagingInfo,state.currentApiRequest.SortBy));
}

export function getCOSHHInventoryListDataLoading(state$: Observable<COSHHInventoryState>): Observable<boolean> {
    return state$.select(s => !isNullOrUndefined(s) && s.isCOSHHInventoryListLoading);
};


