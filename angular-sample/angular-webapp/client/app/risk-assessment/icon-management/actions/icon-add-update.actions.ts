import { IconType } from '../models/icon-type.enum';
import { Action } from '@ngrx/store';
import { Icon } from '../models/icon';
import { type } from '../../../shared/util';
export const ActionTypes = {
    ADD_ICON: type('[ICON] Add icon')
    , ADD_ICON_COMPLETE: type('[ICON] Add icon complete')
    , UPDATE_ICON: type('[ICON] Update icon')
    , UPDATE_ICON_COMPLETE: type('[ICON] Update icon complete')
    , LOAD_ICON: type('[ICON] Load icon')
    , LOAD_ICON_COMPLETE: type('[ICON] Load icon complete')
}

export class AddIconAction implements Action {
    type = ActionTypes.ADD_ICON;
    constructor(public payload: { icon: Icon, type: IconType }) { }
}
export class AddIconCompleteAction implements Action {
    type = ActionTypes.ADD_ICON_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class UpdateIconAction implements Action {
    type = ActionTypes.UPDATE_ICON;
    constructor(public payload: { icon: Icon, type: IconType }) { }
}
export class UpdateIconCompleteAction implements Action {
    type = ActionTypes.UPDATE_ICON_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class LoadIconAction implements Action {
    type = ActionTypes.LOAD_ICON;
    constructor(public payload: { id: string, type: IconType }) {

    }
}
export class LoadIconCompleteAction implements Action {
    type = ActionTypes.LOAD_ICON_COMPLETE;
    constructor(public payload: Icon) {

    }
}

export type Actions =
    AddIconAction
    | AddIconCompleteAction
    | UpdateIconAction
    | UpdateIconCompleteAction;

