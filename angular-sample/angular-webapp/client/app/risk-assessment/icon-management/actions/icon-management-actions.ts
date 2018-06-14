import { Action } from '@ngrx/store';
import { type } from './../../../shared/util';
import * as Immutable from 'immutable';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';

export const ActionTypes = {
    LOAD_HAZARDS_OR_CONTROLS_LIST: type('[Hazard] Load hazards or controls')
    , LOAD_HAZARDS_OR_CONTROLS_LIST_COMPLETE: type('[HazardControl] Load hazards or controls list Complete')
    , REMOVE_ICON: type('[HazardControl] Remove hazard or control')
    , REMOVE_ICON_COMPLETE: type('[HazardControl] Remove hazard or control complete')
    , BULK_REMOVE_ICON: type('[HazardControl] Bulk remove hazard or control')
    , BULK_REMOVE_ICON_COMPLETE: type('[HazardControl] Bulk remove hazard or control complete')
}

/** Actions for  hazards **/
export class LoadHazardsOrControlsListAction implements Action {
    type = ActionTypes.LOAD_HAZARDS_OR_CONTROLS_LIST;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadHazardsOrControlsListCompleteAction implements Action {
    type = ActionTypes.LOAD_HAZARDS_OR_CONTROLS_LIST_COMPLETE;
    constructor(public payload: any) {
    }
}

export class RemoveIconItemAction implements Action {
    type = ActionTypes.REMOVE_ICON;
    constructor(public payload: any) { }
}

export class RemoveIconItemCompleteAction implements Action {
    type = ActionTypes.REMOVE_ICON_COMPLETE;
    constructor(public payload: any) { }
}

export class BulkRemoveIconItemAction implements Action {
    type = ActionTypes.BULK_REMOVE_ICON;
    constructor(public payload: any) { }
}

export class BulkRemoveIconItemCompleteAction implements Action {
    type = ActionTypes.BULK_REMOVE_ICON_COMPLETE;
    constructor(public payload: any) { }
}


export type Actions = LoadHazardsOrControlsListAction
    | LoadHazardsOrControlsListCompleteAction
    | RemoveIconItemAction
    | RemoveIconItemCompleteAction
    | BulkRemoveIconItemAction
    | BulkRemoveIconItemCompleteAction;