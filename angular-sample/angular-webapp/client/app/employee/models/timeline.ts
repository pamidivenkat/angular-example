export class Timeline {
    Id: string;
    CategoryCode: number;
    Category: string;
    CategoryName: string;
    Title: string;
    Sensitivity: Sensitivity;
    EmployeeId: string;
    ItemType: number;
    HasDocuments: boolean;
    CreatedOn: Date;
    FileName: string;
    CreatedBy: string;
    ExpiryDate: Date;
    ReminderInDays: number;
}

export enum Sensitivity {
    Basic = 1,
    Advance = 2,
    Sensitive = 3
}

export class EventType {
    Id: string;
    Title: string;
    OrderNo?: number;
    HasTaskCreation: boolean;
    Code: number;
    DataTemplate: string;
    UITemplate: string;
}

export class DisciplinaryOutcome {
    Code: number;
    Id: string;
    OrderNo: number;
    Title: string;
}

export class Outcome {
    Id: string;
    OrderNo: number;
    Title: string;
}

export enum ReviewType {
    PerformanceReview,
    PerformanceConcerns
}

export class EmployeeLeavingReason {
    Id: string;
    Title: string;
    OrderNo: number;
}

export class EmployeeLeavingSubReason {
    Id: string;
    Title: string;
    OrderNo: number;
    LeavingReasonId: string
}