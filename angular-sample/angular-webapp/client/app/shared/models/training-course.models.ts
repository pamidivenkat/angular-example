export class TrainingCourse {
    Id: string;
    Title: string;
    Description: string;
    Type: string;
    IsCompleted: boolean;
    CompanyId: string;
    IsAtlasTraining: boolean;
    CourseCode: string;

    constructor() {
        this.Id = "";       
        this.Title = "";
        this.Description = "";
        this.Type = "";
        this.IsCompleted = false;
        this.CompanyId = "";
        this.IsAtlasTraining = false;
        this.CourseCode = "";
    }
}