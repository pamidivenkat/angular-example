import { Action } from '@ngrx/store';
import * as Immutable from 'immutable';
import { Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import * as whatsNewActions from '../actions/whats-new.actions';
import { WhatsNew, WhatsNewUserMap } from '../models/whats-new';

export interface WhatsNewState {
    whatsNewItems: WhatsNew[];
    whatsNewUserMaps : WhatsNewUserMap[];
    canWhatsNewPopupVisible: boolean;
}

const initialState: WhatsNewState = {
    whatsNewItems: null,
    whatsNewUserMaps: null,
    canWhatsNewPopupVisible: true
}

export function reducer(state: WhatsNewState = initialState, action: Action): WhatsNewState {
    switch (action.type) {
        case whatsNewActions.ActionTypes.LOAD_WHATS_NEW_ITEMS_ACTION: {
            return Object.assign({}, state);
        }
        case whatsNewActions.ActionTypes.LOAD_WHATS_NEW_ITEMS_COMPLETE_ACTION: {
            let modifiedState = Object.assign([], state.whatsNewItems);
            if (!isNullOrUndefined(modifiedState)) {
                modifiedState = action.payload
            }
            state.canWhatsNewPopupVisible = false;
            state.whatsNewItems = modifiedState;
            return Object.assign({}, state);
        }
        case whatsNewActions.ActionTypes.UPDATE_WHATS_NEW_AS_READ_COMPETE_ACTION: {
            state.whatsNewItems = [];
            return Object.assign({}, state);
        }
        case whatsNewActions.ActionTypes.CREATE_UPDATE_WHATS_NEW_USERMAP_COMPLETE_ACTION: {
            state.whatsNewUserMaps = action.payload;
            return Object.assign({}, state);
        }
        default:
            return state;
    }
}

export function getWhatsNewItems(state$: Observable<WhatsNewState>): Observable<Immutable.List<WhatsNew>> {
    return state$.select(s => s && s.whatsNewItems && Immutable.List(s.whatsNewItems));
}

export function getWhatsNewUserMaps(state$: Observable<WhatsNewState>): Observable<WhatsNewUserMap[]>{
    return state$.select(s => s && s.whatsNewUserMaps);
}

export function getWhatsNewPopupStatus(state$: Observable<WhatsNewState>): Observable<boolean> { 
    return state$.select(s => s && s.canWhatsNewPopupVisible) 
}