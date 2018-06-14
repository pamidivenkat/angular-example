import { Address } from './../../../employee/models/employee.model';
import { Incident } from './incident.model';

export class IncidentReportedBy {
    Id: string;
    CompanyId: string;
    UserId: string;
    AddressId: string;
    Name: string;
    Address: Address;
    User: any;
    Author: any;
    Modifier: any;
    CreatedBy: string;
    CreatedOn: Date;
    IsDeleted: boolean;
    LCid: number;
    ModifiedBy: string;
    ModifiedOn: Date;
    Version: number;
    Incident: Incident;

    constructor() {
        this.Id = null;
        this.CompanyId = null;
        this.UserId = null;
        this.AddressId = null;
        this.Name = null;
        this.Address = new Address();
        this.User = null;
        this.Author = null;
        this.Modifier = null;
        this.CreatedBy = null;
        this.CreatedOn = null;
        this.IsDeleted = false;
        this.LCid = 0;
        this.ModifiedBy = null;
        this.ModifiedOn = null;
        this.Version = null;
        this.Incident = null;
    }
}
