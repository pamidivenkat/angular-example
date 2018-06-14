import { isNullOrUndefined } from 'util';
import { StringHelper } from '../helpers/string-helper';
import { Observable } from 'rxjs/Rx';
import { MessageStatus } from '../../atlas-elements/common/models/message-event.enum';
import { MessageType } from '../../atlas-elements/common/ae-message.enum';
import { SnackbarMessageVM } from '../models/snackbar-message-vm';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { CommonHelpers } from '../../shared/helpers/common-helpers';
import { AtlasApiError } from '../error-handling/atlas-api-error';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { MessengerService } from '../services/messenger.service';
import { Injectable } from '@angular/core';
import * as errorActions from '../../shared/actions/error.actions';

@Injectable()
export class AtlasApiErrorEffects {
    constructor(private _actions$: Actions, private _messenger: MessengerService) {

    }

    // tslint:disable-next-line:member-ordering
    @Effect({ dispatch: false })
    globalError$: Observable<boolean> = this._actions$.ofType(errorActions.ActionTypes.GLOBAL_API_ERROR)
        .map(toPayload)
        .map((err: AtlasApiError) => {
            let errorMsg = err.Error && err.Error.json && err.Error.json() && err.Error.json().Message ? err.Error.json().Message : StringHelper.snackbarMessage(err.Entity, err.Identifier);
            let vm = new SnackbarMessageVM(
                StringHelper.snackbarMessage(err.Entity, err.Identifier),
                MessageType.Error,
                err.Event,
                MessageStatus.Failed,
                err.Code
            );
            this._messenger.publish('snackbar', vm);
            return true;
        });
    @Effect({ dispatch: false })
    globalErrorAPIWithError$: Observable<boolean> = this._actions$.ofType(errorActions.ActionTypes.GLOBAL_API_ERROR_RESPONSE_FROM_API)
        .map(toPayload)
        .map((err: AtlasApiError) => {
            let finalMsg: string;
            let errorMsgFromDescription = err.Error && err.Error.json && err.Error.json() && err.Error.json().Message && err.Error.json().Message.hasOwnProperty('Message') && (err.Error.json().Message.Description) ? err.Error.json().Message.Description :  '';
            if (CommonHelpers.whatIsIt(errorMsgFromDescription) === 'String' && !StringHelper.isNullOrUndefinedOrEmpty(errorMsgFromDescription)) {
                finalMsg = errorMsgFromDescription;
            }
            if (isNullOrUndefined(finalMsg)) {
                finalMsg = err.Error && err.Error.json && err.Error.json() && err.Error.json().Message ? (err.Error.json().Message.hasOwnProperty('Message') ? err.Error.json().Message.Message : (CommonHelpers.whatIsIt(err.Error.json().Message) === 'String' ? err.Error.json().Message : StringHelper.snackbarMessage(err.Entity, err.Identifier))) : StringHelper.snackbarMessage(err.Entity, err.Identifier);
            }

            let vm = new SnackbarMessageVM(
                finalMsg,
                MessageType.Error,
                err.Event,
                MessageStatus.Custom,
                err.Code
            );
            this._messenger.publish('snackbar', vm);
            return true;
        });
}