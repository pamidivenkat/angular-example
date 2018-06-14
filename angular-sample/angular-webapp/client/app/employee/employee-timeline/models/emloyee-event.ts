import { FileResult } from '../../../atlas-elements/common/models/file-result';
import { Sensitivity } from '../../models/timeline';
import { Document } from '../../../document/models/document';
export class EmployeeEvent {
    Id: string;
    EventTypeId: string;
    EmployeeId: string;
    CompanyId: string;
    Sensitivity: Sensitivity;
    EventData: string;
    CreatedOn: Date;
    ModifiedOn: Date;
    CreatedBy: string;
    modifiedBy: string;
    Documents: Array<Document>

    Attachment: EventAttachment;
}

export class EventAttachment {
    File: FileResult;
    Description: string;
    Comment: string;
    ExpriryDate?: string;
    ReminderInDays?: number;
    constructor(file: FileResult, description: string, comment: string, _expDate?: string, _reminderInDays?: number) {
        this.File = file;
        this.Description = description;
        this.Comment = comment;
        this.ExpriryDate = _expDate;
        this.ReminderInDays = _reminderInDays;
    }
}