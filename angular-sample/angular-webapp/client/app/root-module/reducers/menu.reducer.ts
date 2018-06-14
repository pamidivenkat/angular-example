import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as menuActions from '../actions/menu.actions';
import { Menu } from "../models/menu";

export interface MenuState {
    status: boolean,
    entities: Menu[]
}

const initialState = {
    status: false,
    entities: []
}

export function reducer(state = initialState, action: Action): MenuState {
    switch (action.type) {
        case menuActions.ActionTypes.LOAD_MENU:
            {
                return Object.assign({}, state, { status: false });
            }
        case menuActions.ActionTypes.LOAD_MENU_COMPLETE:
            {
                return Object.assign({}, state, { status: true, entities: action.payload });
            }
        default:
            return state;
    }
}

export function getMenuData(state$: Observable<MenuState>): Observable<MenuState> {
    return state$.select(s => s);
}
