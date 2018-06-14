import { MessageStatus } from '../../atlas-elements/common/models/message-event.enum';
import { SnackbarMessageVM } from '../../shared/models/snackbar-message-vm';
export class TrainingCourseSnackbarMessage extends SnackbarMessageVM {
    public state: string;
    public toMessage(): string {
        return `${this.message}  ${this.state}  ${MessageStatus[this.status]}`;
    }
}


