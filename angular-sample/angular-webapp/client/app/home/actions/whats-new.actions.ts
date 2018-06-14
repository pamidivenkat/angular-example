import { Action } from '@ngrx/store';

import { type } from '../../shared/util';
import { WhatsNew, WhatsNewUserMap } from '../models/whats-new';

export const ActionTypes = {
    LOAD_WHATS_NEW_ITEMS_ACTION: type('[whatsnew] load new release items.')
    , LOAD_WHATS_NEW_ITEMS_COMPLETE_ACTION: type('[whatsnew] load new release items complete.')
    , CREATE_UPDATE_WHATS_NEW_USERMAP_ACTION: type('[whatsnew] create or update release item with user action')
    , CREATE_UPDATE_WHATS_NEW_USERMAP_COMPLETE_ACTION: type('[whatsnew] create or update release item with complete user action')
    , UPDATE_WHATS_NEW_AS_READ_ACTION: type('[WhatsNewUserMap] update whats new user map as read action')
    , UPDATE_WHATS_NEW_AS_READ_COMPETE_ACTION: type('[WhatsNewUserMap] update whats new user map as read complete action')
}

export class LoadWhatsNewItemsAction implements Action {
    type = ActionTypes.LOAD_WHATS_NEW_ITEMS_ACTION
    constructor(public payload: boolean) {
    }
}

export class LoadWhatsNewItemsCompleteAction implements Action {
    type = ActionTypes.LOAD_WHATS_NEW_ITEMS_COMPLETE_ACTION
    constructor(public payload: WhatsNew[]) {

    }
}

export class CreateUpdateWhatsNewUsermapAction implements Action {
    type = ActionTypes.CREATE_UPDATE_WHATS_NEW_USERMAP_ACTION
    constructor(public payload: WhatsNewUserMap[]) {

    }
}

export class CreateUpdateWhatsNewUsermapCompleteAction implements Action {
    type = ActionTypes.CREATE_UPDATE_WHATS_NEW_USERMAP_COMPLETE_ACTION
    constructor(public payload: any) {

    }
}

export class UpdateWhatsNewAsReadAction implements Action {
    type = ActionTypes.UPDATE_WHATS_NEW_AS_READ_ACTION
    constructor(public payload: WhatsNewUserMap[]) {

    }
}

export class UpdateWhatsNewAsReadCompleteAction implements Action {
    type = ActionTypes.UPDATE_WHATS_NEW_AS_READ_COMPETE_ACTION
    constructor(public payload: any) {

    }
}

export type Actions = LoadWhatsNewItemsAction | LoadWhatsNewItemsCompleteAction
    | UpdateWhatsNewAsReadAction | UpdateWhatsNewAsReadCompleteAction
    | CreateUpdateWhatsNewUsermapAction | CreateUpdateWhatsNewUsermapCompleteAction;