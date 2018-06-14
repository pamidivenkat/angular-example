import { DocumentState } from '../common/document-state.enum';
import { User } from '../../company/user/models/user.model';
import { Block } from './block';
import { ResourceUsage } from './Document';
import { EmployeeGroup } from './../../shared/models/company.models';

export class Artifact {
    Id: string;
    Title: string;
    Description: string;
    Blocks: Block[];
    ModifiedOn: Date;
    CreatedOn: Date;
    CreatedBy: User;
    ModifiedBy: User;
    IsAmendAccept: boolean;
    State: DocumentState;
    Version: string;
    Category: number;
    Comment: string;
    CompanyId: string;
    FileStorageIdentifier: string;
    RegardingObjectId: string;
    RegardingObjectTypeCode: number;
    FileNameAndTitle: string;
    TemplateId: string;
    CountryId: string;
    SectorId: string;
    NamedDataSetId: string;
    EmployeeGroupId: string;
    Usage: ResourceUsage;
    IsActive: boolean;
    SourceDocumentId: string;
    EmployeeGroup: EmployeeGroup;
    ArtifactList: Artifact[]
} 