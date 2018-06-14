import { MessageType } from '../../atlas-elements/common/ae-message.enum';
import { isFunction } from 'rxjs/util/isFunction';
import { IMessageVM } from './imessage-vm';
import { MessageStatus, MessageEvent } from '../../atlas-elements/common/models/message-event.enum';

export class BaseMessageVM implements IMessageVM {

    public type: MessageType;
    public event: MessageEvent;
    public message: string;
    public status: MessageStatus;

    /**
     *
     */
    constructor(message: string, messageType: MessageType, event: MessageEvent, status: MessageStatus) {
        this.message = message;
        this.type = messageType;
        this.status = status;
        this.event = event;
    }

    getDataObject<T>(): T {
        let data: T = {} as T;

        for (let key in this) {
            if (key) {
                let val = this[key];
                if (!isFunction(val)) {
                    data[key.toString()] = val;
                }
            }
        }
        return data;
    }

    public toMessage(): string {
        return this.message;
    }
}
