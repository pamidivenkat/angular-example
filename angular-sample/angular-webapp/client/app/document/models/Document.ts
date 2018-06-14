import { DocumentState } from '../../document/common/document-state.enum';
import { EmployeeGroup } from '../../shared/models/company.models';
import { DocumentSubCategory } from './documentsubcategory';


//Document model
//Extend this
export class Document {
    Id: string;
    Title: string;
    FileName: string;
    FileNameAndTitle: string;
    Category: number;
    CategoryName: string;
    CategoryLocalizedName: string;
    State: number;
    Status: DocumentState;
    Version: string;
    IsArchived: string;
    PictureId: string;
    Comment: string;
    Description: string;
    Usage: ResourceUsage;
    UsageName: string;
    ExpiryDate: string;
    ModifiedOn: string;
    RegardingObject: EntityReference;
    UpdatedDateTime: Date;
    DocumentVaultSubCategory: DocumentSubCategory;
    DocumentVaultSubCategoryId: string;
    DocumentSubCategory: string;
    CompanyId: string;
    EmployeeGroup: EmployeeGroup;
    RegardingObjectId: string;
    RegardingObjectTypeCode: number;
    ReminderInDays: number;
    LastModifiedDateTime: string;
    Sensitivity: number;
    RegardingObjectName: string;
    SiteName: string;
    FileStorageIdentifier: string;
    IsDeleted: boolean;
    IconClass: string;
    IsAttachable: boolean;
    SourceDocumentId: string;
    Tag: string;
    IsSharedPrototype: boolean;
    ModifiedBy: string;
    ShouldReloadList: boolean;
    DocumentOrigin: DocumentOrigin;
}

export enum DocumentOrigin {
    Legacy = -1,
    Atlas = 0
}
export enum DocumentActionType {
    NoActionRequired = 0,
    RequiresRead = 1,
    RequiresSign = 2
}

export class EntityReference {
    Id: string;
    Otc: number;
    Name: string;
}


export enum DistributedDocumentsModeOfOperation {
    Documents = 1,
    SharedDocuments = 2
}

export enum ResourceUsage {
    System = 1,
    User = 2
}

export enum DocumentsFolder {
    HanbooksAndPolicies = 1,
    InsepectionReports = 2,
    HSDocumentSuite = 3,
    AppraisalReviews = 4,
    DisciplinaryAndGrivences = 5,
    Trainings = 6,
    StartersAndLeavers = 7,
    Others = 8,
    CompanyPolicies = 12,
    General = 13,
    //Below are place holder parent DocumentFolderStat
    HealthAndSafetyDocuments = 9,
    HREmployeeDocuments = 10,
    CitationDrafts = 11
}

export class DocumentFolderStat {
    Folder: DocumentsFolder;
    Count: number;
    constructor() {
        this.Count = 0;
    }
}

export class fieldDetails {
    visible: boolean;
    mandatory: boolean;
    defaultValue: any;

    constructor() {
        this.visible = false;
        this.mandatory = false;
        this.defaultValue = null;
    }
}
