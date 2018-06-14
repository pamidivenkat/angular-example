import { AtlasApiResponse, AtlasApiRequestWithParams } from '../../shared/models/atlas-api-response';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';
import { User } from "../../shared/models/user";
import { EmailModel } from "../../email-shared/models/email.model";

export const ActionTypes = {
    SEND_EMAIL: type('[Email] Send email'),
    SEND_EMAIL_COMPLETE: type('[Email] Send email complete')
}


export class SendEmailAction implements Action {
    type = ActionTypes.SEND_EMAIL;
    constructor(public payload: EmailModel) {
    }
}

export class SendEmailCompleteAction implements Action {
    type = ActionTypes.SEND_EMAIL_COMPLETE;
    constructor(public payload: boolean) {
    }
}


export type Actions = SendEmailAction | SendEmailCompleteAction;
