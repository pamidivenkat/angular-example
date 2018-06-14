import { checklistInstanceItem } from './checklist-instance-item.model';
import { CheckListAssignment } from './checklist-assignment.model';
import { Checklist, Site } from './checklist.model';
import { CheckListInstanceStatus } from '../common/checklist-instance.status.enum';
import { Document } from '../../document/models/document';
export class CheckListInstance {
    CheckList: Checklist;
    Id: string;
    CompanyId: string;
    Status: CheckListInstanceStatus
    ScheduledDate: Date;
    CheckListId: string;
    CheckListAssignmentId: string;
    AssignedToId: string;
    SiteId: string;
    SiteLocation: string;
    CheckListAssignment: CheckListAssignment;
    InstanceItems: checklistInstanceItem[];
    Modifier: null;
    Site: Site;
    CreatedOn: Date;
    ModifiedOn: Date;
    CreatedBy: string;
    ModifiedBy: string;
    IsDeleted: boolean;
    LCid: number;
    Version: string;
    Attachments:Map<string,Document[]>;
}