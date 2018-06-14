import { User } from '../../../shared/models/user';
import { Site } from '../models/site.model';

export class SiteAssignment {
    Id: string;
    Site: Site;
    User:User;
}