import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';

export const ActionTypes = {
    LOAD_TASKHEADBANNER: type('[TaskHeadBanner] Load task list'),
    LOAD_TASKHEADBANNER_COMPLETE: type('[TaskHeadBanner] Load task list complete')
}

export class LoadTaskHeadBannerAction implements Action {
    type = ActionTypes.LOAD_TASKHEADBANNER;
    constructor(public payload: boolean) {

    }
}

export class LoadTaskHeadBannerCompleteAction implements Action {
    type = ActionTypes.LOAD_TASKHEADBANNER_COMPLETE;
    constructor(public payload: AeInformationBarItem[]) {

    }
}

export type Actions = LoadTaskHeadBannerAction | LoadTaskHeadBannerCompleteAction;