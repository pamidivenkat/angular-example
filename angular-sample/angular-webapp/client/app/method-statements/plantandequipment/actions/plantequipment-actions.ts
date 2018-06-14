import { PlantAndEquipment } from './../models/plantandequipment';
import { AtlasApiRequestWithParams, AtlasApiRequest, AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { type } from './../../../shared/util';
import { AeInformationBarItem } from './../../../atlas-elements/common/models/ae-informationbar-item';
import * as Immutable from 'immutable';

export const ActionTypes = {
    LOAD_PLANTANDEQUIPMENT: type('[PLANTANDEQUIPMENT] Load plantandequipments'),
    LOAD_PLANTANDEQUIPMENT_COMPLETE: type('[PLANTANDEQUIPMENT] Load plantandequipments complete'),
    LOAD_SELECTED_PLANTANDEQUIPMENT: type('[PLANTANDEQUIPMENT] Load selected plantandequipment'),
    LOAD_SELECTED_PLANTANDEQUIPMENT_COMPLETE: type('[PLANTANDEQUIPMENT]  Load selected plantandequipment complete'),
    ADD_PLANTANDEQUIPMENT: type('[PLANTANDEQUIPMENT] Add plantandequipment'),
    ADD_PLANTANDEQUIPMENT_COMPLETE: type('[PLANTANDEQUIPMENT]  Add plantandequipment complete'),
    UPDATE_PLANTANDEQUIPMENT: type('[PLANTANDEQUIPMENT] Update plantandequipment'),
    UPDATE_PLANTANDEQUIPMENT_COMPLETE: type('[PLANTANDEQUIPMENT]  Update plantandequipment complete'),
    REMOVE_PLANTANDEQUIPMENT: type('[PLANTANDEQUIPMENT] Remove plantandequipment'),
    REMOVE_PLANTANDEQUIPMENT_COMPLETE: type('[PLANTANDEQUIPMENT] Remove plantandequipment complete')
};

export class LoadPlantandequipmentAction {
    type = ActionTypes.LOAD_PLANTANDEQUIPMENT;
    constructor(public payload: AtlasApiRequest) {
    }
}

export class LoadPlantandequipmentCompleteAction {
    type = ActionTypes.LOAD_PLANTANDEQUIPMENT_COMPLETE;
    constructor(public payload: AtlasApiResponse<PlantAndEquipment>) {
    }
}

export class LoadSelectedPlantandequipmentAction {
    type = ActionTypes.LOAD_SELECTED_PLANTANDEQUIPMENT;
    constructor(public payload: string) {
    }
}

export class LoadSelectedPlantandequipmentCompleteAction {
    type = ActionTypes.LOAD_SELECTED_PLANTANDEQUIPMENT_COMPLETE;
    constructor(public payload: PlantAndEquipment) {
    }
}

export class AddPlantandequipmentAction {
    type = ActionTypes.ADD_PLANTANDEQUIPMENT;
    constructor(public payload: PlantAndEquipment) {
    }
}

export class AddPlantandequipmentCompleteAction {
    type = ActionTypes.ADD_PLANTANDEQUIPMENT_COMPLETE;
    constructor(public payload: PlantAndEquipment) {
    }
}

export class UpdatePlantandequipmentAction {
    type = ActionTypes.UPDATE_PLANTANDEQUIPMENT;
    constructor(public payload: PlantAndEquipment) {
    }
}

export class UpdatePlantandequipmentCompleteAction {
    type = ActionTypes.UPDATE_PLANTANDEQUIPMENT_COMPLETE;
    constructor(public payload: PlantAndEquipment) {
    }
}

export class RemovePlantandequipmentAction {
    type = ActionTypes.REMOVE_PLANTANDEQUIPMENT;
    constructor(public payload: PlantAndEquipment) {
    }
}

export class RemovePlantandequipmentCompleteAction {
    type = ActionTypes.REMOVE_PLANTANDEQUIPMENT_COMPLETE;
    constructor(public payload: boolean) {
    }
}

export type Actions =
    LoadPlantandequipmentAction
    | LoadPlantandequipmentCompleteAction
    | LoadSelectedPlantandequipmentAction
    | LoadSelectedPlantandequipmentCompleteAction
    | AddPlantandequipmentAction
    | AddPlantandequipmentCompleteAction
    | UpdatePlantandequipmentAction
    | UpdatePlantandequipmentCompleteAction
    | RemovePlantandequipmentAction
    | RemovePlantandequipmentCompleteAction
