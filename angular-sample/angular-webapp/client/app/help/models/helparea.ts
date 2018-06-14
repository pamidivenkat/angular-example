export class HelpArea {
    Id: string;
    Name: string;
    Code: number
    IconName: string
}

export class HelpContent {
    Id: string;
    HelpAreaId: string;
    Title: string;
    Body: string;
    PublishDate: Date;
    CreatedOn: Date;
}