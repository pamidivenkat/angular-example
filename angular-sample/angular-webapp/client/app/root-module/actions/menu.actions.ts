import { Menu } from '../models/menu';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';

export const ActionTypes = {
    LOAD_MENU: type('[Menu] Load menu'),
    LOAD_MENU_COMPLETE: type('[Menu] Load menu complete')    
}

export class LoadMenuAction implements Action {
    type = ActionTypes.LOAD_MENU;
    constructor(public payload: boolean) {

    }
}

export class LoadMenuCompleteAction implements Action {
    type = ActionTypes.LOAD_MENU_COMPLETE;
    constructor(public payload: Menu[]) {

    }
}

export type Actions = LoadMenuCompleteAction | LoadMenuAction;