export class TrainingDetails {
    Id: string;
    CompanyId: string;
    Course: string;
    CourseCode: string;
    Qualification: string;
    ExpiryDate?: Date;
    DateStarted?: Date;
    DateCompleted?: Date;
    TrainerName: string;
    Location: string;
    CourseGrade: string;
    Provider: string;
    IsAtlasCource: boolean;
    EmployeeId: string;
    CourseDescription: string;

    constructor() {
        this.Id = "";       
        this.CompanyId = "";
        this.Course = "";
        this.CourseCode = "";
        this.Qualification = "";
        this.ExpiryDate = null;
        this.DateStarted = null;
        this.DateCompleted = null;
        this.TrainerName = "";
        this.Location = "";
        this.CourseGrade = "";
        this.Provider = "";
        this.IsAtlasCource = false;
        this.EmployeeId = "";
        this.CourseDescription = "";
    }
}
