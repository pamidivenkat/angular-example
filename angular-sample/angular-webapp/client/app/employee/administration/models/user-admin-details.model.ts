import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { UserProfile } from '../../../shared/models/lookup.models';

export class UserAdminDetails {
    FirstName: string;
    Surname: string;
    LastName: string;
    IsManager: boolean;
    Id: string;
    Email: string;
    UserName: string;
    IsLeaver: boolean;
    IsActive: boolean;
    UserProfiles: UserProfile[];
    AccessToAtlas: boolean;
    constructor() {
        this.UserProfiles = [];
        this.FirstName = '';
        this.Surname = '';
        this.LastName = '';
        this.IsManager = false;
        this.Id = '';
        this.Email = '';
        this.UserName = '';
        this.IsLeaver = false;
        this.IsActive = false;

    }
}

export class ResetPasswordVM {
    IsEmailUser: boolean;
    Email: string;
    UserId: string;
    NewPassword: string;


    constructor() {
        this.IsEmailUser = false;
        this.Email = '';
        this.UserId = '';
        this.NewPassword = '';
    }
}


export class AdminOptions {
    Id: string;
    HasEmail: boolean;
    HasUser?: boolean;
    CreateUser?: boolean;
    EmpEmailUser: string;
    ExistingHasEmail: boolean;
    Email: string;
    UserName: string;
    Password: string;
    ConfirmPassword: string;
    UserCreateMode: number;
    UserId: string;
    constructor() {
        this.Id = '';
        this.HasEmail = false;
        this.HasUser = false;
        this.CreateUser = false;
        this.EmpEmailUser = '';
        this.ExistingHasEmail = false;
        this.Email = '';
        this.UserName = '';
        this.Password = '';
        this.ConfirmPassword = '';
        this.UserCreateMode = 0;
        this.UserId = '';
    }
}


export enum UserCreateMode {
    ExistingUser = 0,
    NewUser = 1
}


export class UserEmailCheck {
    Availability: UserEmailAvailability;
    constructor(availibility: UserEmailAvailability) {
        this.Availability = availibility
    }

}

export enum UserEmailAvailability {
    Available = 0,
    UserExists = 1,
    UserDeleted = 2,
    NotAvailable = 3
}

