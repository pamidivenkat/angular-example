import { SnackbarMessageVM } from "../../../shared/models/snackbar-message-vm";
import { MessageStatus } from "../../../atlas-elements/common/models/message-event.enum";

export class ProcedureSnackBarVm extends SnackbarMessageVM {
    public customMessage: string;
    public toMessage(): string {
        return `Copy of ${this.message}  ${MessageStatus[this.status]}`;
    }
}
