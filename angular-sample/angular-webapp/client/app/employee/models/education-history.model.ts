export class EducationDetails {
    Id: string;
    Institution: string;
    StartDate?: Date;
    EndDate?: Date;
    Qualification: string;
    CompanyId: string;
    EmployeeId: string;

    constructor() {
        this.Id = "";       
        this.Institution = "";
        this.StartDate = null;
        this.EndDate = null;
        this.Qualification = "";
        this.CompanyId = "";
        this.EmployeeId = "";
    }
}
