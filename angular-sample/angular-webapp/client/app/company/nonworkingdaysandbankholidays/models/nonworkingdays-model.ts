import { Site, Department } from './../../../calendar/model/calendar-models';
import { Employee } from './../../../employee/models/employee.model'
import { NonworkingdaysOperationmode } from './nonworkingdays-operationmode-enum';
import { Country } from './../../../shared/models/lookup.models';

export class NonWorkingdaysModel {
    Id: string;
    Name: string;
    Description: string;
    CountryId: string;
    CountryName: string;
    Country: Country;
    IsExample: boolean;
    CompanyId: string;
    WorkingProfileList: WorkingProfile[];
    PublicHolidayList: PublicHoliday[];
    HWPAssignedTo: HWPAssignedTo[];
    ExcludedEmployees: ExcludedEmployees[];
    HolidayWorkingProfileMapList: HolidayWorkingProfileMap[];
    ExistingProfiles: ExistingProfile[];
    Notes: string;
    CompanyNonWorkingDaysId: string;

    constructor() {
        this.Id = '';
        this.Name = '';
        this.Description = '';
        this.CountryId = '';
        this.CountryName = '';
        this.IsExample = false;
        this.WorkingProfileList = [];
        this.PublicHolidayList = [];
        this.HWPAssignedTo = [];
        this.ExcludedEmployees = [];
        this.HolidayWorkingProfileMapList = [];
        this.ExistingProfiles = [];
        this.Notes = '';
        this.CompanyNonWorkingDaysId = '';
    }
}
export class ExistingProfile {
    Id: string;
    SiteId: string;
    DepartmentId: string;
    EmployeeId: string
    SiteName: string;
    DepartmentName: string;
    EmployeeName: string;
    ProfileName: string;
}
export class NonWorkingdaysNotesModel {
    Id: string;
    Notes: string;
    HolidayWorkingProfileId: string;
    CreatedOn: Date;
}

export class NonWorkingdaysCopyModel {
    Name: string;
    Description: string;
    PrototypeId: string;
    OperationMode: NonworkingdaysOperationmode;
}

export class WorkingProfile {
    Id: string;
    HolidayWorkingProfileId: string;
    DayIndex: number;
    DayName: string;
    StartTimeHours: string;
    EndTimeHours: string;
    IsWorkingDay: boolean;

    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn: Date;
    ModifiedBy: string;
    IsDeleted: boolean;
    LCid: number;
    Version: string;
    CompanyId: string;
}
export class PublicHoliday {
    Id: string;
    Name: string;
    Year: number;
    HolidayDate: string;
    DayOfTheWeek: string;
    CountryId: string;
    HolidayWorkingProfileId: string;
    IsDeleted: boolean;

    constructor() {
        this.Id = '';
        this.Name = '';
        this.HolidayDate = null;
        this.HolidayWorkingProfileId = null;
        this.DayOfTheWeek = '';
        this.Year = null;
        this.CountryId = '';
        this.IsDeleted = false;
    }
}
export class HWPAssignedTo {
    Id: string;
    HolidayWorkingProfileId: string;
    AssignTo: string;
    AssignedToMeta: string;
    IsDefault: boolean;
    HolidayWorkingProfile: NonWorkingdaysModel
}
export class ExcludedEmployees {
    Id: string;
    HolidayWorkingProfileId: string;
    EmployeeId: string;
    Employee: Employee;
}
export class HolidayWorkingProfileMap {
    Id: string;
    HolidayWorkingProfileId: string;
    EmployeeId: string;
    SiteId: string;
    DepartmentId: string;
    Employee: Employee;
    Site: Site;
    Department: Department;
    IsDeleted: boolean;
}

export class HWPExclEmp {
    Id: string;
    HolidayWorkingProfileId: string;
    EmployeeId: string;
    Employee: Employee;
}

export class HWPAssignToModel {
    HolidayWorkingProfileMapList: HolidayWorkingProfileMap[];
    ExcludedEmployees: HWPExclEmp[];
    AssignedTo: HWPAssignedTo;
}
export class HWPShortModel {
    public Id: string;
    public Name: string;
    public IsExample: boolean;
    public CompanyId: string;

    constructor() {
        this.Id = '';
        this.Name = '';
        this.IsExample = null;
        this.CompanyId = '';
    }
}
