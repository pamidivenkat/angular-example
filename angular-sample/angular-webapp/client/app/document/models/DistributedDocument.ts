import { DocumentActionType, DistributedDocumentsModeOfOperation } from "./document";

export class DistributedDocument {
    //Properties related to Company Documents- shared distributed document
    Id: string;
    CompanyId: string;
    DistributeDocumentId: string;
    Title: string;
    FileName: string;
    Category: DocumentCategory;
    CategoryName: string;
    KeyWords: string;
    DocumentAction: DocumentActionType;
    Action: DocumentActionType; // for shared documents
    SharedDocumentId: string;
    Services: string
    DocumentVersion: string;
    SharedDocumentVersion: string;
    ActionedDateOn: string;
    ActionTakenOn: string; // for shared documents
    //Below are related to distributed document
    ActionedDate: Date;
    DateSent: string;
    DocumentName: string;
    OperationMode: DistributedDocumentsModeOfOperation
}

export class ActionedDocument {
    CompanyId: string;
    EmployeeId: string;
    DistributedDocumentId: string;
    DocumentId: string;
    DocumentVersion: string;
    ActionTakenOn: Date;
    //required for shared document sign
    SharedDocumentId: string;
    SharedDocumentVersion: string;
    Signature: string;
}

export class DocumentCategory {
    Id: string;
    Name: string;
    Services: CitationService[];
}


export class CitationService {
    Title: string;
    Code: number;
    Id: number;
}

