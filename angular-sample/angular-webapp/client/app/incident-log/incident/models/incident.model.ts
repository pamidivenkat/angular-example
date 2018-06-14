import { IncidentStatus } from './../../models/incident-status.enum';
import { IncidentReportedBy } from './incident-reported-by.model';

export class Incident {
    Id: string;
    CompanyId: string;
    StatusId: IncidentStatus;
    ApprovedDate?: Date;
    ApprovedBy: string;
    ReferenceNumber: string;
    UniqueId: string;
    IsInvestigationRequired: boolean;
    IncidentReportedBy: IncidentReportedBy;
    Author: any;
    Modifier: any;
    CreatedBy: string;
    CreatedOn: Date;
    IsDeleted: boolean;
    LCid: number;
    ModifiedBy: string;
    ModifiedOn: Date;
    Version: number;
    IsNotificationRequired : boolean;
    Comments : string;
    IsKeyFieldsNotificationRequired : boolean;
    IsApprovedNotificationRequired : boolean;
    constructor() {
        this.Id = null;
        this.CompanyId = null;
        this.StatusId = null;
        this.ApprovedDate = null;
        this.ApprovedBy = null;
        this.ReferenceNumber = null;
        this.UniqueId = null;
        this.IsInvestigationRequired = false;
        this.IncidentReportedBy = new IncidentReportedBy();
        this.Author = null;
        this.Modifier = null;
        this.CreatedBy = null;
        this.CreatedOn = null;
        this.IsDeleted = false;
        this.LCid = 0;
        this.ModifiedBy = null;
        this.ModifiedOn = null;
        this.Version = null;
        this.IsNotificationRequired = false;
        this.Comments = null;
        this.IsKeyFieldsNotificationRequired = false;
    }
}
