export class AtlasNotification {
    _id: string;
    _title: string;
    _expiryDate: Date;
    _hasRead: boolean;
    _regardingObjectId: string;
    _regardingObjectOtcType: string;
    _category: NotificationCategory;
    _isClickable: boolean;

    get IsClickable(): boolean {
        return this._isClickable;
    }
     set IsClickable(value: boolean) {
        this._isClickable = value;
    }

    get Category(): NotificationCategory {
        return this._category;
    }
    set Category(value: NotificationCategory) {
        this._category = value;
    }

    get Id(): string {
        return this._id;
    }
    set Id(value: string) {
        this._id = value;
    }

    get Title(): string {
        return this._title;
    }
    set Title(value: string) {
        this._title = value;
    }

    get ExpiryDate(): Date {
        return this._expiryDate;
    }
    set ExpiryDate(value: Date) {
        this._expiryDate = value;
    }

    get HasRead(): boolean {
        return this._hasRead;
    }
    set HasRead(value: boolean) {
        this._hasRead = value;
    }

    get RegardingObjectId(): string {
        return this._regardingObjectId;
    }
    set RegardingObjectId(value: string) {
        this._regardingObjectId = value;
    }

    get RegardingObjectOtcType(): string {
        return this._regardingObjectOtcType;
    }
    set RegardingObjectOtcType(value: string) {
        this._regardingObjectOtcType = value;
    }

    constructor(id: string, title: string, expiryDate: Date, hasRead: boolean, regardingObjectId: string, regardingObjectOtcType: string) {
        this._id = id;
        this._title = title;
        this._expiryDate = expiryDate;
        this._hasRead = hasRead;
        this._regardingObjectId = regardingObjectId;
        this._regardingObjectOtcType = regardingObjectOtcType;
    }
}
export enum NotificationCategory {
    Undefined = 0,
    DocumentDistributed = 1,
    OutOfOffice = 2,
    HolidayApprovedORejected = 3,
    AbsenceApprovedORejected = 4,
    TrainingAssign = 5,
    GeneralEventNextActionDue = 6,
    PerformanceEventNextActionDue = 7,
    LeaverEventNextActionDue = 8
}
export class NotificationMarkAsReadPayLoad {
    private _notificationIds: Array<string>;
    private _markAllAsRead: boolean;

    get NotificationIds(): Array<string> {
        return this._notificationIds;
    }
    set NotificationIds(value: Array<string>) {
        this._notificationIds = value;
    }

    get MarkAllAsRead(): boolean {
        return this._markAllAsRead;
    }
    set MarkAllAsRead(value: boolean) {
        this._markAllAsRead = value;
    }
}

export class NotificationMarkAsReadResponse {
    private _readIds: Array<string>;
    private _pendingCount: number;
    private _markAllAsRead: boolean;

    get ReadIds(): Array<string> {
        return this._readIds;
    }
    set ReadIds(value: Array<string>) {
        this._readIds = value;
    }

    get PendingCount(): number {
        return this._pendingCount;
    }
    set PendingCount(value: number) {
        this._pendingCount = value;
    }

    get MarkAllAsRead(): boolean {
        return this._markAllAsRead;
    }
    set MarkAllAsRead(value: boolean) {
        this._markAllAsRead = value;
    }

    constructor(readids: Array<string>, pendingCount: number, markAllAsRead: boolean) {
        this._readIds = readids;
        this._pendingCount = pendingCount;
        this._markAllAsRead = markAllAsRead;
    }
}
