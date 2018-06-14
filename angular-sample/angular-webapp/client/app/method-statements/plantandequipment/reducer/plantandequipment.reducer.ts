import { AtlasApiRequestWithParams, AtlasApiRequest } from './../../../shared/models/atlas-api-response';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { AeInformationBarItem } from './../../../atlas-elements/common/models/ae-informationbar-item';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { PlantAndEquipment } from './../models/plantandequipment';
import { isNullOrUndefined } from 'util';
import * as plantAndEquipmentActions from '../actions/plantequipment-actions';
import { DataTableOptions } from "../../../atlas-elements/common/models/ae-datatable-options";
import { extractDataTableOptions } from "../../../shared/helpers/extract-helpers";

export interface PlantAndEquipmentState {
    plantandequipmentsLoaded: boolean;
    currentApiRequest: AtlasApiRequest;
    plantandequipments: PlantAndEquipment[];
    selectedPlantandequipment: PlantAndEquipment;
    pagingInfo: PagingInfo;
}

const initialState: PlantAndEquipmentState = {
    plantandequipmentsLoaded: false,
    currentApiRequest: null,
    plantandequipments: null,
    selectedPlantandequipment: null,
    pagingInfo: null,
};


export function plantAndEquipmentReducer(state = initialState, action: Action): PlantAndEquipmentState {
    switch (action.type) {
        case plantAndEquipmentActions.ActionTypes.LOAD_PLANTANDEQUIPMENT:
            {
                return Object.assign({}, state, { plantandequipmentsLoaded: true, currentApiRequest: action.payload });
            }
        case plantAndEquipmentActions.ActionTypes.LOAD_PLANTANDEQUIPMENT_COMPLETE:
            {
                let modifiedState: PlantAndEquipmentState = Object.assign({}, state, { plantandequipmentsLoaded: false, plantandequipments: action.payload.Entities });

                if (!isNullOrUndefined(state.pagingInfo)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.pagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                    }
                    modifiedState.pagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                    modifiedState.pagingInfo.Count = action.payload.PagingInfo.Count;
                }
                else {
                    modifiedState.pagingInfo = action.payload.PagingInfo;
                }
                return modifiedState;
            }
        case plantAndEquipmentActions.ActionTypes.LOAD_SELECTED_PLANTANDEQUIPMENT:
            {
                return Object.assign({}, state, {});
            }
        case plantAndEquipmentActions.ActionTypes.LOAD_SELECTED_PLANTANDEQUIPMENT_COMPLETE:
            {
                return Object.assign({}, state, { selectedPlantandequipment: action.payload });
            }
        case plantAndEquipmentActions.ActionTypes.ADD_PLANTANDEQUIPMENT:
            {
                return Object.assign({}, state, {});
            }
        case plantAndEquipmentActions.ActionTypes.ADD_PLANTANDEQUIPMENT_COMPLETE: {
            return Object.assign({}, state, { selectedPlantandequipment: action.payload });
        }
        case plantAndEquipmentActions.ActionTypes.UPDATE_PLANTANDEQUIPMENT: {
            return Object.assign({}, state, {});
        }
        case plantAndEquipmentActions.ActionTypes.UPDATE_PLANTANDEQUIPMENT_COMPLETE: {
            return Object.assign({}, state, { selectedPlantandequipment: action.payload });
        }
        default:
            return state;
    }
}



export function getPlantAndEquipmentLoadStatus(state$: Observable<PlantAndEquipmentState>): Observable<boolean> {
    return state$.select(s => s.plantandequipmentsLoaded);
};
export function getPlantAndEquipmentList(state$: Observable<PlantAndEquipmentState>): Observable<Immutable.List<PlantAndEquipment>> {  // TODO type here
    return state$.select(s => s.plantandequipments && Immutable.List<PlantAndEquipment>(s.plantandequipments));
};
export function getPlantAndEquipmentListTotalCount(state$: Observable<PlantAndEquipmentState>): Observable<number> {
    return state$.select(s => s.pagingInfo && s.pagingInfo.TotalCount);
}
export function getPlantAndEquipmentListListDataTableOptions(state$: Observable<PlantAndEquipmentState>): Observable<DataTableOptions> {
    return state$.select(s => s.plantandequipments && s.pagingInfo && s.currentApiRequest && extractDataTableOptions(s.pagingInfo,s.currentApiRequest.SortBy));
}

export function getSelectedPlantAndEquipment(state$: Observable<PlantAndEquipmentState>): Observable<PlantAndEquipment> {
    return state$.select(s => s.selectedPlantandequipment);
}