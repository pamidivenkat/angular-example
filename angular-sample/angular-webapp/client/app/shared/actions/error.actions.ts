import { AtlasApiError } from '../error-handling/atlas-api-error';
import { type } from '../../shared/util';
import { Action } from '@ngrx/store';

export const ActionTypes = {
    GLOBAL_API_ERROR: type('[ERROR] Global Error'),
    GLOBAL_API_ERROR_RESPONSE_FROM_API: type('[ERROR] Global Error with error response from API')
};


export class CatchErrorAction implements Action  {
    type = ActionTypes.GLOBAL_API_ERROR;
    constructor(public payload: AtlasApiError) {
    }
};

export class CatchAPTErrorAction implements Action  {
    type = ActionTypes.GLOBAL_API_ERROR_RESPONSE_FROM_API;
    constructor(public payload: AtlasApiError) {
    }
};

export type Actions = CatchErrorAction | CatchAPTErrorAction;