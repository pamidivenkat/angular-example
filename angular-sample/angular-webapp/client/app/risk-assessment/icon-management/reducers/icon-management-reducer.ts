import { Icon } from '../models/icon';
import { PagingInfo } from "../../../atlas-elements/common/models/ae-paging-info";
import { AtlasApiRequestWithParams } from "../../../shared/models/atlas-api-response";
import { Action } from "@ngrx/store";
import * as iconManagementActions from '../actions/icon-management-actions';
import { isNullOrUndefined } from "util";
import * as Immutable from 'immutable';
import { Observable } from "rxjs/Observable";
import { DataTableOptions } from "../../../atlas-elements/common/models/ae-datatable-options";
import { extractDataTableOptions } from "../../../shared/helpers/extract-helpers";
import { Hazard } from "../../../risk-assessment/models/hazard";
import * as iconAddUpdateActions from '../actions/icon-add-update.actions';

export interface IconManagementState {
    HasHazardsOrControlsListLoaded: boolean;
    HazardsOrControlsList: Immutable.List<Hazard>;
    HazardsOrControlsListPagingInfo: PagingInfo;
    apiRequestWithParams: AtlasApiRequestWithParams;
    selectedIcon: Icon;
    RemoveActionStatus: boolean;
    BulkRemoveActionStatus: boolean;
    IconAddUpdateCompleteStatus: boolean;
}

const initialState: IconManagementState = {
    HasHazardsOrControlsListLoaded: false,
    HazardsOrControlsList: null,
    HazardsOrControlsListPagingInfo: null,
    apiRequestWithParams: null,
    selectedIcon: null,
    RemoveActionStatus: false,
    BulkRemoveActionStatus: false,
    IconAddUpdateCompleteStatus: false
}


export function reducer(state = initialState, action: Action): IconManagementState {
    switch (action.type) {
        case iconManagementActions.ActionTypes.LOAD_HAZARDS_OR_CONTROLS_LIST: {
            let modifiedState = Object.assign({}, state, { HasHazardsOrControlsListLoaded: false, apiRequestWithParams: action.payload, selectedIcon: null });
            return modifiedState;
        }
        case iconManagementActions.ActionTypes.LOAD_HAZARDS_OR_CONTROLS_LIST_COMPLETE: {
            let modifiedState = Object.assign({}, state, { HasHazardsOrControlsListLoaded: true });

            if (!isNullOrUndefined(state.HazardsOrControlsListPagingInfo)) {
                if (action.payload.HazardsOrControlsListPagingInfo.PageNumber == 1) {
                    modifiedState.HazardsOrControlsListPagingInfo.TotalCount = action.payload.HazardsOrControlsListPagingInfo.TotalCount;
                }
                modifiedState.HazardsOrControlsListPagingInfo.PageNumber = action.payload.HazardsOrControlsListPagingInfo.PageNumber;
                modifiedState.HazardsOrControlsListPagingInfo.Count = action.payload.HazardsOrControlsListPagingInfo.Count;
            }
            else {
                modifiedState.HazardsOrControlsListPagingInfo = action.payload.HazardsOrControlsListPagingInfo;
            }
            modifiedState.HazardsOrControlsList = Immutable.List<any>(action.payload.HazardsOrControlsList);
            return modifiedState;
        }
        case iconAddUpdateActions.ActionTypes.LOAD_ICON: {
            let modifiedState = Object.assign({}, state, { selectedIcon: null });
            return modifiedState;
        }
        case iconAddUpdateActions.ActionTypes.LOAD_ICON_COMPLETE: {
            let modifiedState = Object.assign({}, state, { selectedIcon: action.payload });
            return modifiedState;
        }

        case iconManagementActions.ActionTypes.REMOVE_ICON: {
            let modifiedState = Object.assign({}, state, { RemoveActionStatus: false });
            return modifiedState;
        }

        case iconManagementActions.ActionTypes.REMOVE_ICON_COMPLETE: {
            let modifiedState = Object.assign({}, state, { RemoveActionStatus: true });
            return modifiedState;
        }

        case iconManagementActions.ActionTypes.BULK_REMOVE_ICON:
            {
                let modifiedState = Object.assign({}, state, { BulkRemoveActionStatus: false });
                return modifiedState;
            }

        case iconManagementActions.ActionTypes.BULK_REMOVE_ICON_COMPLETE: {
            let modifiedState = Object.assign({}, state, { BulkRemoveActionStatus: true });
            return modifiedState;
        }
        case iconAddUpdateActions.ActionTypes.ADD_ICON: {
            let modifiedState = Object.assign({}, state, { IconAddUpdateCompleteStatus: false });
            return modifiedState;
        }
        case iconAddUpdateActions.ActionTypes.ADD_ICON_COMPLETE: {
            let modifiedState = Object.assign({}, state, { IconAddUpdateCompleteStatus: true });
            return modifiedState;
        }
        case iconAddUpdateActions.ActionTypes.UPDATE_ICON: {
            let modifiedState = Object.assign({}, state, { IconAddUpdateCompleteStatus: false });
            return modifiedState;
        }
        case iconAddUpdateActions.ActionTypes.UPDATE_ICON_COMPLETE: {
            let modifiedState = Object.assign({}, state, { IconAddUpdateCompleteStatus: true });
            return modifiedState;
        }
        default:
            return state;
    }
}

/*** Hazards Or Controls Listing Start ***/

export function getHazardsOrControlsApiRequest(state$: Observable<IconManagementState>): Observable<AtlasApiRequestWithParams> {
    return state$.select(s => s.apiRequestWithParams);
}

export function getHazardsOrControlsListLoadingState(state$: Observable<IconManagementState>): Observable<boolean> {
    return state$.select(s => s.HasHazardsOrControlsListLoaded);
}
export function getHazardsOrControlsList(state$: Observable<IconManagementState>): Observable<Immutable.List<Hazard>> {
    return state$.select(s => s.HazardsOrControlsList && Immutable.List<any>(s.HazardsOrControlsList));
}

export function getHazardsOrControlsListTotalCount(state$: Observable<IconManagementState>): Observable<number> {
    return state$.select(s => s && s.HazardsOrControlsListPagingInfo && s.HazardsOrControlsListPagingInfo.TotalCount);
}

export function getHazardsOrControlsListDataTableOptions(state$: Observable<IconManagementState>): Observable<DataTableOptions> {
    return state$.select(s => s.HazardsOrControlsList && s.HazardsOrControlsListPagingInfo && s.apiRequestWithParams && extractDataTableOptions(s.HazardsOrControlsListPagingInfo, s.apiRequestWithParams.SortBy));
}

export function getRemoveActionStatus(state$: Observable<IconManagementState>): Observable<boolean> {
    return state$.select(s => s && s.RemoveActionStatus);
}
export function getSelectedIcon(state$: Observable<IconManagementState>): Observable<Icon> {
    return state$.select(s => s.selectedIcon);
}

export function getBulkRemoveActionStatus(state$: Observable<IconManagementState>): Observable<boolean> {
    return state$.select(state => state && state.BulkRemoveActionStatus);
}

export function getIconAddUpdateCompleteStatus(state$: Observable<IconManagementState>): Observable<boolean> {
    return state$.select(state => state && state.IconAddUpdateCompleteStatus);
}
/*** Hazards Or Controls Listing End ***/

