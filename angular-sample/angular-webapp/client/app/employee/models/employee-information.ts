export class EmployeeInformation {
    Id: string;
    FirstName: string;
    Surname: string;
    DOB: Date;
    HasEmail: boolean;
    Email: string;
    MobilePhone: string;
    StartDate: Date;
    JobTitle: string;
    PictureId: string;
    IsLeaver : boolean;
    UserId : string;
    UserName : string;
    

    constructor() {
        this.Id = "";
        this.FirstName = "";
        this.Surname = "";
        this.DOB = new Date();
        this.HasEmail = false;
        this.Email = "";
        this.MobilePhone = "";
        this.StartDate = new Date();
        this.JobTitle = "";
        this.PictureId = "";
        this.IsLeaver = false;
        this.UserId = '';
        this.UserName = '';
    }
}