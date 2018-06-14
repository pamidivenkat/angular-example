export class User {
    FirstName: string;
    LastName: string;
    HasEmail: boolean;
    Surname: string;
    Email: string;
    get FullName(): string {
        return this.FirstName + ' ' + this.LastName;
    }
    Id: string;
    IsManager: boolean;
    UserName: string;
    CompanyId: string;
    Signature: string;
}

export class UserChangePasswordModel {
    public UserName: string;
    public OldPassword: string;
    public NewPassword: string;
}