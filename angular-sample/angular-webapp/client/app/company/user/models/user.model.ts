import { isNullOrUndefined } from 'util';
export class User {
    AdviceCards: Array<any>;
    Email: string;
    FirstName: string;
    LastName: string;
    FullName: string;
    HasEmail: boolean;
    UserName: string;
    Password: string;
    ConfirmPassword: string;
    Id: string;
    IsActive: boolean;
    Telephone: string;
    Signature: string;
    CompanyId: string;
    CreatedOn: string;
    ACN: string;
    IsDeleted: boolean;
    SalesforceUserID: string;
    Area: UserArea;
    Qualifications: string;
}

export enum UserArea {
    General = 0,
    HealthAndSafety = 1,
    EmploymentLaw = 2
}
export enum UserAvailability {
    Available,
    UserExists,
    UserDeleted,
    NotAvailable
}

export class AdviceCardAssignment {
    UserId: string;
    AdviceCardId: string;

    constructor(id: string, adviceCardId: string) {
        this.UserId = id;
        this.AdviceCardId = adviceCardId;
    }
}

