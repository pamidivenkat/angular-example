import { MessageType } from '../../atlas-elements/common/ae-message.enum';
import { BaseMessageVM } from './base-message-vm';
import { MessageStatus, MessageEvent } from '../../atlas-elements/common/models/message-event.enum';

export class SnackbarMessageVM extends BaseMessageVM {
    public code: string;

    constructor(message: string, messageType: MessageType, event: MessageEvent, status: MessageStatus, code: any) {
        super(message, messageType, event, status);
        this.code = code;
    }

    public toMessage(): string {
        let actionString: string;

        switch (this.status) {
            case MessageStatus.InProgress:
                return `${this.capitalizeFirstLetter(this.getInProgressEventString(this.event))} ${this.message}`;
            case MessageStatus.Complete:
                return `${this.capitalizeFirstLetter(this.message)}  ${this.getEventCompleteString(this.event)} successfully`;
            case MessageStatus.Failed:
                return `An error occured while ${this.getInProgressEventString(this.event)} ${this.message}`;
            case MessageStatus.Custom:
                return `${this.message}`;
        }
    }

    private capitalizeFirstLetter(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    private getInProgressEventString(event: MessageEvent): string {
        let actionString: string;
        switch (event) {
            case MessageEvent.Create:
                actionString = 'creating';
                break;
            case MessageEvent.Update:
                actionString = 'updating';
                break;
            case MessageEvent.Copy:
                actionString = 'copying';
                break;
            case MessageEvent.Distribute:
                actionString = 'distributing';
                break;
            case MessageEvent.Load:
                actionString = 'loading';
                break;
            case MessageEvent.Remove:
                actionString = 'removing';
                break;
            case MessageEvent.Upload:
                actionString = 'uploading'
                break;
        }

        return actionString;
    }

    private getEventCompleteString(event: MessageEvent): string {
        let actionString: string;
        switch (event) {
            case MessageEvent.Create:
                actionString = 'created';
                break;
            case MessageEvent.Update:
                actionString = 'updated';
                break;
            case MessageEvent.Copy:
                actionString = 'copied';
                break;
            case MessageEvent.Distribute:
                actionString = 'distributed';
                break;
            case MessageEvent.Load:
                actionString = 'load';
                break;
            case MessageEvent.Remove:
                actionString = 'removed';
                break;
            case MessageEvent.Upload:
                actionString = 'uploaded'
                break;
        }

        return actionString;
    }
}
