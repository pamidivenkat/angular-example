import { CitationService } from './../../models/DistributedDocument';

export class sharedDocument {
    //Properties related to Company Documents- shared distributed document
    Id: string;
    Title: string;
    Name: string;
    Code: number;
    KeyWords: string;
    CreatedOn: Date;
    ModifiedOn: Date;
    CategoryName: string;
    Services: CitationService[];
    Categories: sharedDocument[];
    ServiceName: string;
}
