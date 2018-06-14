import { IncidentCommentScreen } from './../../incident/models/incident-comment-screen.enum';

export class IncidentComment {
    Id: string;
    CompanyId: string;
    IncidentId: string;
    ScreenId: IncidentCommentScreen;
    Title: string;
    Description: string;

    constructor() {
        this.Id = null;
        this.CompanyId = null;
        this.IncidentId = null;
        this.ScreenId = null;
        this.Title = null;
        this.Description = null;
    }
}
