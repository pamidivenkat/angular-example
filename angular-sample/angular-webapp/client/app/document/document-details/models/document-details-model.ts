import { DocumentActionType } from '../../models/document';

export class DocumentDetails {
    Id: string;
    FileName: string;
    Category: any;
    Type: number;
    Archived: string;
    ModifiedOn: string;
    ExpiryDate: string;
    Description: string;
    Notes: string;
    Title: string;
    Service: string;
    Sector: string;
    Country: string;
    Keywords: string;
    IsDistributable: boolean;
    IsArchived: boolean;
    Usage: number;
    UsageName: string;
    ModifiedByName: string;
    LastUpdatedDays: number;
    Version: string;
    CreatedOn: Date;
    SiteId: string;
    FileStorageIdentifier: string;
    CategoryLocalizedName: string;
    RegardingObjectId : string;

    constructor() {
        this.Id = '';
        this.FileName = '';
        this.Category = 0;
        this.Type = 0;
        this.Archived = '';
        this.ModifiedOn = '';
        this.ExpiryDate = '';
        this.Description = '';
        this.Notes = '';
        this.Title = '';
        this.Service = '';
        this.Sector = '';
        this.Country = '';
        this.Keywords = '';
        this.IsDistributable = false;
        this.IsArchived = false;
        this.Usage = 0;
        this.UsageName = '';
        this.ModifiedByName = '';
        this.LastUpdatedDays = 0;
        this.CreatedOn = null;
        this.SiteId = '';
        this.FileStorageIdentifier = "";
        this.CategoryLocalizedName = "";
        this.RegardingObjectId = "";
    }
}

export enum DocumentDetailsType {
    Document = 1,
    SharedDocument = 2
}

export class DistributedDocument {
    Id: string;
    DocumentId: string;
    SharedDocumentId: string;
    DocumentVersion: string;
    DocumentTitle: string;
    RegardingObjectTypeCode: string;
    Action: DocumentActionType;
    IsActive: boolean;
    RegardingObjects: string[];
    DocumentType: DocumentDetailsType;
}

export class DistributedDocumentDetails {
    Id: string;
    RegardingObjectId: string;
}

export class ChangeHistoryModel {
    ChangedBy: string;
    Comment: string;
    CreatedOn: Date;
    Id: string;
    LastChange: number;
    Version: string;

}

export class DistributionHistoryModel {
    ActionedDate: Date;
    DistributedDocumentId: string;
    DocumentId: string;
    DocumentVersion: string;
    RegardingObjectEntiyType: string;
    RegardingOjbectEntityValues: string;
}

export class EmployeeActionStatusModel {
    ActionTaken: number;
    ActionedDate: Date;
    CompanyId: string;
    DistributedDocumentId: string;
    DocumentId: string;
    EmployeeName: string;
    EmployeeId: string;
    DocumentAction: number;
    DocumentActionName: string;
    DocumentVersion: number;
    DocumentVersionInfo: string;
    IsActive: boolean;
    RegardingObjectId: string;
    RegardingObjectTypeCode: number;
    Status: number;

    constructor() {

    }

}

export class DistributeModel {
    employees: string;
    DocumentAction: DocumentActionType;
    sourceId: string;
    CompanyId: string;
    EmployeeGroup: string;
}