import { consulantModel } from '../models/consulant-info';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';

export const ActionTypes = {
    LOAD_CONSULTANTS: type('[Consultants] Load consultants'),
    LOAD_CONSULTANTS_COMPELETE: type('[Consultants] Load consultants complete')
}

export class LoadConsultantsAction implements Action {
    type = ActionTypes.LOAD_CONSULTANTS;
    constructor(public payload: boolean) {
    }
}

export class LoadConsulantCompleteAction implements Action {
    type = ActionTypes.LOAD_CONSULTANTS_COMPELETE;
    constructor(public payload: consulantModel[]) {
    }
}

export type Actions = LoadConsulantCompleteAction | LoadConsultantsAction;