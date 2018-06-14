import { type } from '../../../shared/util';
import { IncidentRIDDOR } from '../models/incident-riddor.model';

export const ActionTypes = {
    LOAD_RIDDOR: type('[RIDDOR] Load incident riddor'),
    LOAD_RIDDOR_COMPLETE: type('[RIDDOR] Load incident riddor complete'),
    SAVE_RIDDOR: type('[RIDDOR] Save incident riddor'),
    SAVE_RIDDOR_COMPLETE: type('[RIDDOR] Save incident riddor complete')
};

export class LoadIncidentRIDDORAction {
    type = ActionTypes.LOAD_RIDDOR;
    constructor(public payload: string) {

    }
}
export class LoadIncidentRIDDORCompleteAction {
    type = ActionTypes.LOAD_RIDDOR_COMPLETE;
    constructor(public payload: IncidentRIDDOR) {

    }
}

export class SaveRIDDORAction {
    type = ActionTypes.SAVE_RIDDOR;
    constructor(public payload: { isEdit: boolean, RIDDOR: IncidentRIDDOR }) {

    }
}

export class SaveRIDDORCompleteAction {
    type = ActionTypes.SAVE_RIDDOR_COMPLETE;
    constructor(public payload: IncidentRIDDOR) {

    }
}

export type Actions = LoadIncidentRIDDORAction | LoadIncidentRIDDORCompleteAction |
    SaveRIDDORAction | SaveRIDDORCompleteAction;
