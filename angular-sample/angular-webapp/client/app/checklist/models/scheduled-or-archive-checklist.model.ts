import { CheckListAssignment } from './checklist-assignment.model';
import { CheckItem } from './checkitem.model';
import { Workspace } from './workspace.model';
export class ScheduledOrArchiveChecklist {
    Id: string;
    CheckListId: string;
    Status: number;
    // AssignedToId: string;
    IsExample: boolean;
    Name: string;
    NextDueDate: string;
    Periodicity: number;
    ScheduledDate: string;
    SiteId: string;
    SiteLocation: string;
    SiteName: string;
    Workspaces: Array<Workspace>;
    firstname: string;
    lastname: string;
    // CheckItems: CheckItem[];
    // CheckListAssignments: CheckListAssignment[]
}