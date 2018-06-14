export class SearchResult {
    Score: string;
    Id: string
    Title: string;
    CreatedBy: string;
    CreatedOn: Date;
    Default: string;
    DepartmentTeam: string;
    Description: string;
    DocumentCategory: string;
    EntityName: string;
    FilterFields: string
    IsExamplable: boolean;
    IsSystemItem: boolean;
    Link: string;
    RegardingObjectId: string;
    RegardingObjectTypeCode: string;
    TenantId: string;
    TenantName: string;
    Usage: number;
    V2Link: string;
}

export class SearchEntity {
    Entity: string;
    Name: string;
    constructor(entity: string, name: string) {
        this.Entity = entity;
        this.Name = name;
    }
}

