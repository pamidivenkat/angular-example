import { MessageType } from '../ae-message.enum';
import { MessageStatus, MessageEvent } from './message-event.enum';
export class SnackbarModel {
    Message: string;
    MessageEvent: MessageEvent;
    MessageType: MessageType;
    MessageStatus: MessageStatus;
    Code: string;
}
