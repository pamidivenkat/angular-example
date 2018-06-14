export class ExportToCQC {

    FileStorageIdentifier: string;
    SiteId: string;
    CategoryId: string;
    Description: string;
    ExpiryDate: Date;
    OutcomeId: string;
    OwnerId: number;
    PolicyFile: string;
    Reference: string;
    Title: string;
    FileTypeId: string;

    constructor() {
        this.SiteId = "";
        this.CategoryId = "";
        this.Description = "";
        this.ExpiryDate = null
        this.OutcomeId = "";
        this.OwnerId = 0;
        this.PolicyFile = "";
        this.Reference = "";
        this.Title = "";
        this.FileTypeId = "";

    }
}

export class CQCUsers {
    id: number;
    name: string;
}

export class CQCStandards {
    Id: number;
    Title: string;
    Index: string;
    IsSelected: boolean;
}


export class CQCCategories {
    CatId: number;
    CatName: string;
    CatIsSelected: boolean;
}