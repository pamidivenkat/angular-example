import { Action } from '@ngrx/store';
import { toPayload } from '@ngrx/effects';
import { ActionPayloadModel } from '../models/action-payload-model';

export class EffectsHelper {
    static toActionPayload(action: Action): ActionPayloadModel {
        let payload = toPayload(action);
        return Object.create({
            actionType: action.type,
            payload: payload
        });
    }
}
