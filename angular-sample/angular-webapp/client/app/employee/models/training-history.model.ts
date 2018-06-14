import { Document } from '../../document/models/document';
import { TrainingCourse } from '../../shared/models/training-course.models';
export class TrainingUserCourseModule {
    Id: string;
    CourseId: string;
    UserId: string;
    EmployeeId: string;
    ModuleId: string;
    ModuleTitle: string;
    CompanyId: string;
    Progress: string;
    StartDate?: Date;
    PassDate?: Date;
    Status: number;
    Attempts: number;
    IsEL: boolean;
    IsAtlasTraining: boolean;
    ExpiryDate?: Date;
    RefresherDate?: Date;
    CourseGrade: string;
    Provider: string;
    ExpiryRefresherTaskId: string;
    Description: string;
    SelectedCourse: TrainingCourse;
    Certificates: Document[];

    constructor() {
        this.Id = "";       
        this.CourseId = "";
        this.UserId = "";
        this.EmployeeId = "";
        this.ModuleId = "";
        this.ModuleTitle = "";
        this.CompanyId = "";
        this.Progress = "";
        this.StartDate = null;
        this.PassDate = null;
        this.Status = null;
        this.Attempts = 0;
        this.IsEL = false;
        this.IsAtlasTraining = false;
        this.ExpiryDate = null;
        this.RefresherDate = null;
        this.CourseGrade = "";
        this.Provider = "";
        this.ExpiryRefresherTaskId = "";
        this.Description = "";
        this.SelectedCourse = null;
        this.Certificates = null;
    }
}



