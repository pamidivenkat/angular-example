export class AssignUser {
    Id: string;
    FirstName: string;
    LastName: string;
    HasEmail: boolean;
    Email: string;
    FullName: string;
    constructor(id: string, firstName: string, lastName: string, hasEmail: boolean, email: string) {
        this.Id = id;
        this.FirstName = firstName;
        this.LastName = lastName;
        this.FullName = email;
        this.HasEmail = hasEmail;
        this.FullName = this.FirstName + ' ' + this.LastName;
    }
}