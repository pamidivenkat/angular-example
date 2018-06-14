import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import * as informationbarActions from '../actions/information-bar.actions';
import { isNullOrUndefined } from 'util';

export interface InformationBarState {
    status: boolean,
    entities: AeInformationBarItem[]
}

const initialInfoBarState: InformationBarState = {
    status: false,
    entities: []
}


export function informationBarReducer(state = initialInfoBarState, action: Action): InformationBarState {
    switch (action.type) {
        case informationbarActions.ActionTypes.LOAD_INFORMATIONBAR:
            {
                return Object.assign({}, state, { status: false });
            }

        case informationbarActions.ActionTypes.LOAD_INFORMATIONBAR_COMPLETE:
            {
                return Object.assign({}, state, { status: true, entities: action.payload });
            }
        default:
            return state;
    }
}

// Start of selectors

export function getInformationBarData(state$: Observable<InformationBarState>): Observable<AeInformationBarItem[]> {
    return state$.select(s => {
        if (!isNullOrUndefined(s)) {
            return s.entities;
        }
        return [];
    });
}


export function infoBarLoadStatus(state$: Observable<InformationBarState>): Observable<boolean> {
    return state$.select(s => s.status);
}



// Emd of selectors