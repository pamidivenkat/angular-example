import { consulantModel } from '../models/consulant-info';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as consultantInfoActions from '../actions/consultant-info.actions';
import { Menu } from '../models/menu';


export interface ConsultantState {
    status:boolean;
    entities: consulantModel[]
}

const initialState = {
    status: false,
    entities: []
}

export function reducer(state = initialState, action: Action): ConsultantState {
    switch (action.type) {
        case consultantInfoActions.ActionTypes.LOAD_CONSULTANTS:
            {
                return Object.assign({}, state, { status: false });
            }
        case consultantInfoActions.ActionTypes.LOAD_CONSULTANTS_COMPELETE:
            {
                return Object.assign({}, state, { status: true, entities: action.payload });
            }
        default:
            return state;
    }
}

export function getConsultantData(state$: Observable<ConsultantState>): Observable<ConsultantState> {
    return state$.select(s => s);
}