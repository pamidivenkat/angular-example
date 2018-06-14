import { EmployeeFullEntity } from './../../employee/models/employee-full.model';
import { emptyGuid } from '../../shared/app.constants';
import { User } from '../../shared/models/user';
import { AbsenceStatus } from '../../shared/models/lookup.models';

export class EmployeeConfig {
    public Id: string;
    public FirstName: string;
    public Surname: string;
    public ManagerUserId: string;
    public UserId: string;
    public EmploymentTypeId: string;
    public HolidayWorkingProfileId: string;
    public HolidayUnitType: HolidayUnitType;
    public CarryFowardedUnits: number;
    public CarryForwardedUnitType: HolidayUnitType;
    public ExpiryCarryForwardedUnits: number;
    public CompanyId: string;
    public MiddleName: string;
    public Email: string;
    public ManagerId: string;
    public NextLevelManagerId: string;
    public NextLevelManagerUserId: string;
    public CarryForwardedUnits: number;
    public ExpiredCarryForwardedUnits: number;
}

export enum HolidayUnitType {
    Days = 1,
    Hours = 2
}

export enum HalfDayType {
    AM = 1,
    PM = 2
}

export class PublicHoliday {
    Id: string;
    Name: string;
    CountryId: string;
    Year: number;
    HolidayDate: Date;
}

export class WorkingProfile {
    Id: string;
    DayName: string;
    IsWorkingDay: boolean;
    StartTimeHours: string;
    EndTimeHours: string;
}

export class EmployeeHolidayWorkingProfile {
    Id: string;
    Name: string;
    PublicHolidays: Array<PublicHoliday>;
    WorkingProfiles: Array<WorkingProfile>;
}

export class FiscalYearSummary {
    StartDate: string;
    EndDate: string;

    TotalHolidays: number;
    TotalAvailableHolidaysDays: number;
    TotalAvailableHolidaysInHours: number;
    TotalAvailableHolidaysminutes: number;
    OverBookedHoliday: number;
    MaxHoursPerDay: number;
    IsRequestedForRunningFYYear: boolean;
    RemainingHoliDays: number;
    ApplicableHolidayUnit: string;
    UnitsTakenToDisplay: number;
    HasCarryForwardedUnitsExpired: number;
    CarryForwardedUnitsToDisplay: number;
    EntitlementUnitsToDisplay: number;
    RemainingUnitsToDisplay: number;
    ExpiredCarryForwardedUnitsToDisplay: number;
    Status: number;
    OverBookedUnitsToDisplay: number;
    ApprovedFutureUnitsToDisplay: number;
    PendingUnitsToDisplay: number;
    ApprovedFutureHoliday: number;
    ApprovedFutureHolidayInHours: number;
    CarryForwardedToNextYearDays: number;
    CarryForwardedToNextYearHours: number;
    CarryForwardedToNextYearUnitType: number;
    CarryForwardedToThisYear: number;
    CarryForwardedToThisYearDays: number;
    CarryForwardedToThisYearHours: number;
    DaysTaken: number;
    DaysTakenInHours: number;
    DaysTakenToDisplay: number;
    ExpCarryForwardedToThisYearDays: number;
    ExpCarryForwardedToThisYearHours: number;
    HolidayEntitlement: number;
    HolidayEntitlementInHours: number;
    HolidayUnitType: number;
    OverBookedHolidayInHours: number;
    PendingHoliday: number;
    PendingHolidaysInHours: number;
    TotalAvailableHolidaysDaysToShow: number;
    TotalHolidaysInHours: number;
    IsRequestedForCurrentFYYear: boolean;
    IsRequestedForSummary: boolean;

    constructor() {
        this.StartDate = null;
        this.EndDate = null;

        this.TotalHolidays = 0;
        this.TotalAvailableHolidaysDays = 0;
        this.TotalAvailableHolidaysInHours = 0;
        this.TotalAvailableHolidaysminutes = 0;
        this.OverBookedHoliday = 0;
        this.MaxHoursPerDay = 0;
        this.IsRequestedForSummary = false;
    }
}

export class MyAbsence {
    Id: string;
    CompanyId: string;
    EmployeeId: string;
    Employee: EmployeeFullEntity
    AbsenTypeId: string;
    SubtypeId: string;
    StartDate: string;
    EndDate: string;
    IsHour: boolean;
    Isongoing: boolean;
    StatusId: string;
    TypeId: number;
    SubmittedToUserId: string;
    ApprovedBy: string;
    EscalatedToUserId: string;
    DeclinedBy: string;
    CancelledBy: string;
    ResubmittedCount?: number;
    EscaltionCount?: number;
    Reason: string;
    Comment: string;
    NoOfDays?: number;
    NoOfUnits?: number;
    HolidayUnitType: number;
    MyAbsenceDetails: Array<MyAbsenceDetail>;
    HalfDayType?: number;
    SubmitedOn?: Date;
    Status: AbsenceStatus;
    IsShowDelegatedUsersGroup: boolean;
    SubmittedToUser: User;
    ApprovedByUser: User;
    DeclinedByUser: User;
    EscalatedToUser: User;
    AbsencesType: AbsencesType;
    AbsencesSubType: AbsencesSubType;
    NoOfUnitsInFraction: string;
    NeedToShowAbsencesInPopOver: boolean;
    FromDate: Date;
    ToDate: Date;
    EmployeeName: string;
    DepartmentName: string;
    ApprovedByName: string;
    DepartmentId: string;
    IsSelfLeaveRequestOfDelegatedUser: boolean;
    RequestTypeTitle: string;
    constructor() {
        this.Id = emptyGuid;
        this.CompanyId = null;
        this.EmployeeId = null;
        this.AbsenTypeId = null;
        this.SubtypeId = null;
        this.StartDate = null;
        this.EndDate = null;
        this.IsHour = false;
        this.Isongoing = false;
        this.StatusId = null;
        this.TypeId = 1;
        this.SubmittedToUserId = null;
        this.ApprovedBy = null;
        this.EscalatedToUserId = null;
        this.DeclinedBy = null;
        this.CancelledBy = null;
        this.ResubmittedCount = 0;
        this.EscaltionCount = 0;
        this.Reason = null;
        this.Comment = null;
        this.NoOfDays = 0;
        this.NoOfUnits = 0;
        this.HolidayUnitType = 1;
        this.MyAbsenceDetails = null;
        this.HalfDayType = null;
        this.SubmitedOn = null;
        this.Status = null;
        this.IsShowDelegatedUsersGroup = false;
        this.SubmittedToUser = null;
        this.EscalatedToUser = null;
        this.ApprovedByUser = null;
        this.DeclinedByUser = null;
        this.EmployeeName = '';
        this.FromDate = null;
        this.ToDate = null;
        this.IsSelfLeaveRequestOfDelegatedUser = false;
        this.RequestTypeTitle = '';
    }
}

export class MyAbsenceDetail {
    Id: string;
    CompanyId: string;
    FromHour: Date;
    ToHour: Date;
    NoOfUnits: number;
    MyAbsenceId: string;
    LunchDuration: number;
    constructor() {
        this.Id = emptyGuid;
        this.CompanyId = null;
        this.FromHour = null;
        this.ToHour = null;
        this.NoOfUnits = 0;
        this.MyAbsenceId = null;
        this.LunchDuration = 0;

    }
}

export class AbsencesSubType {
    Name: string;
}
export class AbsencesType {
    TypeName: string;
    Color: string;
}

export class MyAbsenceHistory {
    StartDate: Date;
    EndDate: Date;
    Status: string;
    NoOfUnits: number;
    RequestedUnits: string;
    RequestedBy: string;
    RequestedDate: string;
    Comments: string;
    IsHour: boolean;
    HalfDayType: HalfDayType;
    Isongoing: boolean;
    Period: string;

    constructor() {
        this.StartDate = null;
        this.EndDate = null;
        this.Status = '';
        this.NoOfUnits = 0;
        this.RequestedUnits = '';
        this.RequestedBy = '';
        this.RequestedDate = '';
        this.Comments = '';
        this.IsHour = false;
        this.HalfDayType = null;
        this.Isongoing = false;
        this.Period = '';
    }
}

export enum MyAbsenceType {
    Holiday = 1,
    Absence = 2
}

export class MyAbsenceVM {
    Id: string;
    Type: MyAbsenceType;
    UnitType: HolidayUnitType;
    StartDate: Date;
    EndDate?: Date;
    Duration: number;
    NoOfUnits: number;
    Reason: string;
    Comment: string;
    AbsenceTypeId: string;
    AbsenceSubtypeId: string;
    IsSickLeave: boolean;
    Isongoing: boolean;
    HalfDayType: HalfDayType;
    AllowExcessHolidays: boolean;
    MyAbsenceDetails: Array<MyAbsenceDetailVM>;
    ResubmittedCount: number;
    FullName: string;
    IsApproved: boolean;
    ApprovedBy: string;

    constructor() {
        this.Id = '';
        this.Type = null;
        this.UnitType = null;
        this.StartDate = null;
        this.EndDate = null;
        this.NoOfUnits = 0;
        this.Duration = 0;
        this.Reason = '';
        this.Comment = '';
        this.AbsenceSubtypeId = '';
        this.AbsenceTypeId = '';
        this.Isongoing = false;
        this.IsSickLeave = false;
        this.MyAbsenceDetails = [];
        this.HalfDayType = null;
        this.AllowExcessHolidays = false;
        this.ResubmittedCount = 0;
        this.FullName = '';
        this.IsApproved = false;
        this.ApprovedBy = '';
    }
}

export enum OperationModes {
    Add = 1,
    Update = 2
}

export class FiscalYearSummaryModel {
    public summary: FiscalYearSummary;
    public chartSummary: FiscalYearSummary;

    constructor() {
        this.summary = null;
        this.chartSummary = null;
    }
}

export class MyAbsenceDetailVM {
    public Date: Date;
    public FromHour: string;
    public ToHour: string;
    public Hours: number;
    public RemainingHours: number;
    public StartTimeHours: string;
    public EndTimeHours: string;
    public HasError: boolean;
    public Message: string;
    public Id: string;
    public IsAllApplied: boolean;
    public CanExcludeLunchDuration: boolean;
    public LunchDuration: number;
    public OriginalRemainingHours: number;

    constructor() {
        this.Id = '';
        this.Date = null;
        this.FromHour = '00:00';
        this.ToHour = '00:00';
        this.Hours = 0;
        this.RemainingHours = 0;
        this.StartTimeHours = '00:00';
        this.EndTimeHours = '00:00';
        this.HasError = false;
        this.Message = '';
        this.IsAllApplied = false;
        this.CanExcludeLunchDuration = null;
        this.LunchDuration = 0;
        this.OriginalRemainingHours = 0;
    }
}

export class WorkingDay {
    public SelectedtDate: Date;
    public FromHour: string;
    public ToHour: string;
    public Hours: number;
    public RemainingHours: number;
    public IsAllApplied: boolean;

    constructor() {
        this.SelectedtDate = null;
        this.FromHour = '';
        this.ToHour = '';
        this.Hours = 0;
        this.RemainingHours = 0;
        this.IsAllApplied = false;
    }
}

export class MyDelegateInfo {
    DelegateGroupName: string;
    Delegates: Array<string>;
    SubmittedToUserId: string;
}

export class WorkingDayValidationModel {
    startDate: string;
    endDate: string;
    ongoing: boolean;
    checkEnd: boolean;
    editObject?: MyAbsence;
    validDateTime?: WorkingDayDetailModel;
}

export class WorkingDayDetailModel {
    StartTime: string;
    EndTime: string;
    GlobalStartTime: string;
    GlobalEndTime: string;
    GlobalMaxHours: number;
}