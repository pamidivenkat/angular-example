export class WhatsNew {
    Title: string;
    Body: string;
    PublishedDate: string;
    isActive: boolean;
    ShowAsPopup: number;
    Category: number;
    Id: string;
    WhatsNewUserMap : WhatsNewUserMap[]
}

export enum WhatsNewCategory {
    Release,
    Communication
}

export class WhatsNewUserMap {
    UserId: string;
    WhatsNewId: string;
    CompanyId: string;
    IsRead: boolean;
    ReminderCount: number;
    Id: string;
}