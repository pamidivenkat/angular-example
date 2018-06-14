export class JobHistory {
    Id: string;
    JobTitleId: string;
    DepartmentId: string;
    SiteId: string;
    SiteName: string;
    ReportTo: string;
    JobStartDate: string;
    JobFinishDate: string;
    EmployeeStatusId: string;
    EmploymentTypeId: string;
    EmploymentGroup: string;
    WorkSpaceId: string;
    OtherEmployeeType: string;
    EmployeeId: string;
    CompanyId: string;
    IsCurrentJob: boolean;
    HomeBased: boolean;
    constructor() {
        // this.Id = "",
        this.JobTitleId = "",
            this.DepartmentId = "",
            this.SiteId = "",
            this.ReportTo = "",
            this.JobStartDate = "",
            this.JobFinishDate = "",
            this.EmployeeStatusId = "",
            this.EmploymentTypeId = "",
            this.EmploymentGroup = "",
            this.WorkSpaceId = "",
            this.OtherEmployeeType = "",
            this.EmployeeId = "",
            this.CompanyId = "",
            this.IsCurrentJob = false,
            this.HomeBased = false
    }

}