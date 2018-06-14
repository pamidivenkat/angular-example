import { HolidayUnitType } from './../../../shared/models/company.models';

export class YearEndProcedureModel {
    public Id: string;
    public CompanyId: string;
    public FiscalYearId: string;
    public YearEndProcedureJobId: string;
    public Status: YearEndProcedureStatus;
    public ReviewAndConfirmJobId: string;
    public ExpireCarryForwardJobId: string;
    public FiscalYearData: FiscalYearModel;

    constructor() {
        this.Id = '';
        this.CompanyId = '';
        this.FiscalYearId = '';
        this.YearEndProcedureJobId = '';
        this.ReviewAndConfirmJobId = '';
        this.ExpireCarryForwardJobId = '';
        this.Status = null;
        this.FiscalYearData = null;
    }
}

export enum YearEndProcedureStatus {
    NotReachedYearEnd = -2,
    Error = -1,
    NotStarted = 0,
    InProgress = 1,
    AwaitingReview = 2,
    ReviewConfirmed = 3,
    ErrorWhileApplyingConfirmedChanges = 4,
    Completed = 5
}

export class FiscalYearModel {
    public Id: string;
    public CompanyId: string;
    public StartDate: Date;
    public EndDate: Date;
    public YearEndProcedureTriggerId: string;

    constructor() {
        this.Id = '';
        this.CompanyId = '';
        this.StartDate = null;
        this.EndDate = null;
        this.YearEndProcedureTriggerId = '';
    }
}

export class YearEndProcedureResultModel {
    public Id: string;
    public CompanyId: string;
    public YearEndProcedureId: string;
    public EmployeeId: string;
    public JobId: string;
    public CarryForwardedUnits: number;
    public CarryForwardedUnitType: HolidayUnitType;
    public ReviewedCarryForwardedUnits: number;
    public ReviewedHolidayUnitType: HolidayUnitType;
    public UtilizedHolidayUnits: number;
    public UtilizedHolidayUnitType: HolidayUnitType;
    public FullName: string;
    public DepartmentName: string;
    public StartDate: Date;
    public ReviewedHolidayEntitlement: number;
    public HolidayEntitlement: number;
    public HolidayUnitType: HolidayUnitType;

    public LengthOfService: string;
    public LastYearHolidayEntitlement: string;
    public HolidaysTaken: string;
    public ThisYearTotalHolidays: string;
    public AvailableToCarryForwardUnitType: string;
    public ThisYearHolidayEntitlementUnitType: string;

    constructor() {
        this.Id = '';
        this.CompanyId = '';
        this.YearEndProcedureId = '';
        this.EmployeeId = '';
        this.JobId = '';
        this.CarryForwardedUnits = null;
        this.CarryForwardedUnitType = null;
        this.ReviewedCarryForwardedUnits = null;
        this.ReviewedHolidayUnitType = null;
        this.UtilizedHolidayUnits = null;
        this.UtilizedHolidayUnitType = null;
        this.FullName = '';
        this.DepartmentName = '';
        this.StartDate = null;
        this.ReviewedHolidayEntitlement = null;
        this.HolidayEntitlement = null;
        this.HolidayUnitType = null;
        this.LengthOfService = '';
        this.LastYearHolidayEntitlement = '';
        this.HolidaysTaken = '';
        this.ThisYearTotalHolidays = '';
        this.AvailableToCarryForwardUnitType = '';
        this.ThisYearHolidayEntitlementUnitType = '';
    }
}
