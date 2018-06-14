import { CheckListAnswer } from './answer.enum';
import { Document } from '../../document/models/document';
export class checklistInstanceItem {
    Attachments: Document[];
    Author: string
    Modifier: string;
    ItemText: string
    CorrectiveActionText: string
    UnExpectedAnswer: number;
    CompanyId: string;
    YesNoAnswer: string
    Answer: CheckListAnswer;
    CheckListInstanceId: string;
    OrderIndex: number;
    Id: string;
    CreatedOn: Date;
    ModifiedOn: Date;
    CreatedBy: string;
    ModifiedBy: string;
    IsDeleted: boolean
    LCid: number
    Version: string
}