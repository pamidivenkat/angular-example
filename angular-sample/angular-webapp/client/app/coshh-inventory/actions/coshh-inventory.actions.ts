import { AtlasApiResponse } from "../../shared/models/atlas-api-response";
import { Action } from '@ngrx/store';
import { type } from "../../shared/util";
import { COSHHInventory } from '../models/coshh-inventory';
import { AeSortModel } from "../../atlas-elements/common/models/ae-sort-model";
import { AtlasApiRequest, AtlasParams } from './../../shared/models/atlas-api-response';

export const ActionTypes = {
    COSHHINVENTORY_LOAD: type('[COSHHINVENTORY] load coshh inventory'),
    COSHHINVENTORY_LOAD_COMPLETE: type('[COSHHINVENTORY] load coshh inventory complete'),
    COSHHINVENTORY_ADD: type('[COSHHINVENTORY1] add coshh inventory'),
    COSHHINVENTORY_UPDATE: type('[COSHHINVENTORY] update coshh inventory record'),
    COSHHINVENTORY_DELETE: type('[COSHHINVENTORY] delete coshh inventory record'),
    COSHHINVENTORY_VIEW: type('[COSHHINVENTORY] View coshh inventory'),
    COSHHINVENTORY_VIEW_COMPLETE: type('[COSHHINVENTORY] View coshh inventory complete'),
}

export class ViewCoshhInventoryAction {
    type = ActionTypes.COSHHINVENTORY_VIEW;
    constructor(public payload: string) {
    }
}

export class ViewCoshhInventoryCompleteAction {
    type = ActionTypes.COSHHINVENTORY_VIEW_COMPLETE;
    constructor(public payload: COSHHInventory) {
    }
}


export class COSHHInventoryLoad implements Action {
    type = ActionTypes.COSHHINVENTORY_LOAD;
    constructor(public payload: AtlasApiRequest) {

    }
}
export class COSHHInventoryLoadComplete implements Action {
    type = ActionTypes.COSHHINVENTORY_LOAD_COMPLETE;
    constructor(public payload: any) {

    }
}

export class AddCOSHHInventoryAction implements Action {
    type = ActionTypes.COSHHINVENTORY_ADD;
    constructor(public payload: COSHHInventory) {

    }
}

export class UpdateCOSHHInventoryAction implements Action {
    type = ActionTypes.COSHHINVENTORY_UPDATE;
    constructor(public payload: COSHHInventory) {

    }
}

export class DeleteCOSHHInventoryAction implements Action {
    type = ActionTypes.COSHHINVENTORY_DELETE;
    constructor(public payload: COSHHInventory) {

    }
}
