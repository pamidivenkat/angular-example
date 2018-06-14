import { User } from '../../shared/models/user';
export class Block {
    Id: string;
    Title: string;
    Description: string;
    Blocks: Block[];
    ParentBlockId: string;
    ClientComments: Comment[];
    Version: string;
}

export class Comment {
    ReplyComments: Comment[];
    Message: string;
    CompanyId: string;
    CreatedBy: string;
    ModifiedBy: string;
    Author: User;
    Modifier: User;
    CreatedOn: Date;
    ObjectId: string;
    Version: string;
}