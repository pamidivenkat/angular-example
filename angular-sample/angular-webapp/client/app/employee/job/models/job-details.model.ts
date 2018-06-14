
export class EmployeeJobDetails {
    Id: string;
    JobTitleId: string;
    JobTitleName: string;
    DepartmentId: string;
    DepartmentName: string;
    SiteId: string;
    SiteNameAndPostcode: string;
    StartDate?: Date;
    HomeBased: boolean;
    CarryForwardedUnits?: number;
    ExpiredCarryForwardedUnits?: number;
    EmployeeNumber: string;
    EmploymentTypeId: string;
    EmpTypeName: string;
    OtherEmployeeType: string;
    HoursAWeek: number;
    Days?: number;
    HolidayUnitType: string;
    HolidayEntitlement: number;
    ProbationaryPeriod: number;
    CarryForwardedUnitType: string;
    HolidayWorkingProfileName: string;
    EmployeeId: string;
    CompanyId: string;
    JobTitle: any;
    Department: any;
    HolidayWorkingProfileId: string;

    constructor() {
        this.Id = "";
        this.JobTitleId = "";
        this.JobTitleName = "";
        this.DepartmentId = "";
        this.DepartmentName = "";
        this.SiteId = "";
        this.SiteNameAndPostcode = "";
        this.StartDate = null;
        this.HomeBased = false;
        this.CarryForwardedUnits = null;
        this.ExpiredCarryForwardedUnits = null;
        this.EmployeeNumber = "";
        this.EmploymentTypeId = "";
        this.EmpTypeName = "";
        this.OtherEmployeeType = "";
        this.HoursAWeek = null;
        this.Days = null;
        this.HolidayUnitType = "";
        this.HolidayEntitlement = null;
        this.ProbationaryPeriod = null;
        this.CarryForwardedUnitType = "";
        this.HolidayWorkingProfileName = "";
        this.EmployeeId = "";
        this.CompanyId = "";
        this.JobTitle = null;
        this.Department = null;
        this.HolidayWorkingProfileId = '';
    }
}