import { IncidentStatus } from './incident-status.enum';

export class IncidentListModel {
    Id: string;
    ReferenceNumber: string;
    WhenHappened: Date;
    WhenReported: Date;
    CategoryName: string;
    ReportedUser: string;
    InjuredPersonName: string;
    StatusName: string;
    CreatedBy: string;
    CreatedUser: string;

    constructor() {
        this.Id = '';
        this.ReferenceNumber = '';
        this.WhenHappened = null;
        this.CategoryName = '';
        this.ReportedUser = '';
        this.CreatedUser = '';
        this.InjuredPersonName = '';
        this.StatusName = '';
        this.CreatedBy = '';
        this.WhenReported = null;
    }
}
