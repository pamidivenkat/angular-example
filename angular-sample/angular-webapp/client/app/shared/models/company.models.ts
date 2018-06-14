import { Employee } from '../../employee/models/employee.model';
export class EmployeeSettings {
    public CompanyId: string;
    public Id: string;
    public StartTimeHours: string;
    public EndTimeHours: string;
    public HolidayEntitlement: number;
    public NoOfTimesResubmit: number;
    public NoOfTimesEscalate: number;
    public FiscalStartDate?: Date;
    public FiscalEndDate?: Date;
    public CanEmployeeAddAbsences: boolean;
    public CanEmployeeAddHolidays: boolean;
    public CanEmployeeViewAbsenceHistory: boolean;
    public IsExcessHolidayAllowed: boolean;
    public HolidayUnitType: HolidayUnitType;
    public AllowCarryForwardHolidays: boolean;

    public MaxCarryForwardDays?: number;
    public MaxCarryForwardHours?: number;
    public CarryForwardExpDays?: number;

    public AllowCarryForwardExpDays: boolean;
    public AllowMaxCarryForwardDays: boolean;
    public AllowMaxCarryForwardHours: boolean;

    public DaysPerWeek: number;
    public LunchDuration: number;
    public CreatedBy: string;
    public CreatedOn: string;

    public constructor() {
        this.CompanyId = '';
        this.Id = '';
        this.StartTimeHours = '';
        this.EndTimeHours = '';
        this.HolidayEntitlement = 0;
        this.NoOfTimesEscalate = 0;
        this.NoOfTimesResubmit = 0;
        this.FiscalEndDate = null;
        this.FiscalStartDate = null;
        this.CanEmployeeAddAbsences = false;
        this.CanEmployeeAddHolidays = false;
        this.CanEmployeeViewAbsenceHistory = false;
        this.IsExcessHolidayAllowed = false;
        this.HolidayUnitType = null;
        this.AllowCarryForwardHolidays = false;
        this.MaxCarryForwardDays = 0;
        this.MaxCarryForwardHours = 0;
        this.CarryForwardExpDays = 0;
        this.DaysPerWeek = 0;
        this.LunchDuration = 0;
        this.AllowCarryForwardExpDays = false;
        this.AllowMaxCarryForwardDays = false;
        this.AllowMaxCarryForwardHours = false;
        this.CreatedBy = '';
        this.CreatedOn = '';

    }
    // constructor(daysPerWeek: number,
    //     companyId: string,
    //     holidayEntitlement: number,
    //     noOfTimesEscalate: number,
    //     noOfTimesResubmit: number,
    //     canEmployeeAddHolidays: boolean,
    //     startTimeHours: string,
    //     endTimeHours: string,
    //     fiscalStartDate: Date,
    //     fiscalEndDate: Date,
    //     allowCarryForwardHolidays: boolean) {
    //     this.DaysPerWeek = daysPerWeek;
    //     this.HolidayEntitlement = holidayEntitlement;
    //     this.CompanyId = companyId;
    //     this.NoOfTimesEscalate = noOfTimesEscalate;
    //     this.NoOfTimesResubmit = noOfTimesResubmit;
    //     this.CanEmployeeAddHolidays = canEmployeeAddHolidays;
    //     this.StartTimeHours = startTimeHours;
    //     this.EndTimeHours = endTimeHours;
    //     this.FiscalStartDate = fiscalStartDate;
    //     this.FiscalEndDate = fiscalEndDate;
    //     this.AllowCarryForwardHolidays = allowCarryForwardHolidays;
}

export enum HolidayUnitType {
    Days = 1,
    Hours = 2
}

export class FiscalYear {
    public StartDate: Date;
    public EndDate: Date;
    public DisplayName: string;
    public StartYear: number;
    public EndYear: number;
    public IsDBFiscalYear: boolean;
    public Order: number;

    constructor() {
        this.DisplayName = '';
        this.StartDate = new Date();
        this.EndDate = new Date();
        this.StartYear = 0;
        this.EndYear = 0;
        this.Order = 0;
        this.IsDBFiscalYear = false;
    }
}

export class AbsenceType {
    public Id: string;
    public CompanyId: string;
    public TypeName: string;
    public Color: string;
    public PictureId: string;
    public IsExample: boolean;
    public AbsenceCode: string;
    public AbsenceCodeId: string;
    public AbsenceSubType: Array<AbsenceSubType>;
    public CodeId: string;
    public CodeName: string;
    public NameAndCode: string;

    constructor() {
        this.Id = '';
        this.TypeName = '';
        this.CompanyId = '';
        this.Color = '';
        this.IsExample = false;
        this.PictureId = '';
        this.AbsenceCode = '';
        this.AbsenceCodeId = '';
        this.AbsenceSubType = [];
        this.CodeId = "";
        this.CodeName = "";
        this.NameAndCode = "";
    }
}

export class AbsenceSubType {
    public Id: string;
    public CompanyId: string;
    public Name: string;

    constructor() {
        this.Id = '';
        this.Name = '';
        this.CompanyId = '';
    }
}

export class EmployeeGroup {
    Id: string;
    Name: string;
    IsContractualGroup: boolean;
    Employees: Employee[];
    constructor() {
        this.Id = null;
        this.Name = null;
        this.IsContractualGroup = false;
        this.Employees = [];
    }
}

export class JobTitle {
    Id: string;
    Name: string;
    CompanyId: string;
    constructor() {
        this.Id = '';
        this.Name = '';
        this.CompanyId = '';
    }
}


