import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { type } from '../../shared/util';

import { toPayload } from '@ngrx/effects';

export const ActionTypes = {
    LOAD_INFORMATIONBAR: type('[Informationbar] Load Informationbar'),
    LOAD_INFORMATIONBAR_COMPLETE: type('[Informationbar] Load Informationbar complete'),
}

   /**
   * This action is to load the information bar
   */
export class LoadInformationBarAction {
    type = ActionTypes.LOAD_INFORMATIONBAR;
    constructor(public payload: boolean) {
    }
}


   /**
   * This  is complete action of load the information bar
   */
export class LoadInformationBarCompleteAction {
    type = ActionTypes.LOAD_INFORMATIONBAR_COMPLETE;
    constructor(public payload: AeInformationBarItem[]) {

    }
}


export type Actions = LoadInformationBarAction | LoadInformationBarCompleteAction;