import { Params } from '@angular/router';

import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as Immutable from 'immutable';
import * as emailActions from '../actions/email.actions';
import { User } from "../../shared/models/user";

export interface EmailState {

}

const initialState: EmailState = {
}

export function EmailReducer(state = initialState, action: Action): EmailState {
    switch (action.type) {
        default:
            return state;
    }
}