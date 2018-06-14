import { Site } from '../../company/sites/models/site.model';
import { User } from '../../company/user/models/user.model';
import { Periodicity } from '../common/periodicity.enum';
export class CheckListAssignment {
    Id: string;
    CheckListId: string;
    AssignedToId: string;
    IsReccuring: string;
    Periodicity: Periodicity;
    SiteId: string;
    Site: Site;
    SiteLocation: string;
    ScheduledDate: Date;
    NextDueDate: Date;
    CompanyId: string;
    AssignedTo: User;
    DueDate: Date;
}