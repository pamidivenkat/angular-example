export class SalaryHistory {
    Id: string;
    IsCurrentSalary: boolean;
    JobTitleId: string;
    Pay: string;
    Period: Array<any>;
    ReasonForChange: string;
    StartDate: string;
    FinishDate: string;
    HoursAWeek: string;
    EmployeeId: string;
    CompanyId: string;
    EmployeePeriodId: string;

    constructor() {
        this.IsCurrentSalary = false,
        this.JobTitleId = "",
        this.Pay = "",
        this.Period = [],
        this.ReasonForChange = "",
        this.StartDate = "",
        this.FinishDate = "",
        this.HoursAWeek = "",
        this.EmployeeId = "",
        this.CompanyId = "",
        this.EmployeePeriodId = ""
    }

}