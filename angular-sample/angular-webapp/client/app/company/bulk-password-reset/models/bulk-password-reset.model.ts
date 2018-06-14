import { isNullOrUndefined } from 'util';
export class User {
    ACN: string;
    AdviceCards: string;
    Description: string;
    Email: string;
    FirstName: string;
    FullName: string;
    HasEmail: boolean;
    Id: string;
    IsActive: boolean;
    LastName: string;
    MobileNumber: string;
    Name: string;
    Notes: string;
    Signature: string;
    Telephone: string;
    UserName: string;
    IsSelect: boolean;
}

export class resetUsers {
    UserName: string;
    UserId: string;
}

export class resetUsersModel {
    LoginModels: Array<resetUsers>;
    IsFirstTimeLogin: boolean;
}

