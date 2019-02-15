import { Action } from '@ngrx/store';
import { State } from '~/core/redux/config.reducer';

export enum ConfigActionTypes {
    LoadConfig = '[Config] Load',
    UserLoaded = '[Config] User Loaded',
    UserUnloaded = '[Config] User Unloaded',
    ShowBack = '[Config] Show Back Button',
    NotificationCount = '[Config] Notification Count',
    ClearStatusCount = '[Config] Clear Status Count',
    ExpiringContent = '[Config] Expiring Content',
    HeaderCounts = '[Config] Header Counts',
    PublishedDate = '[Config] Published Date',
}

export class LoadConfig implements Action {
    readonly type = ConfigActionTypes.LoadConfig;
}

export class UserLoaded implements Action {
    readonly type = ConfigActionTypes.UserLoaded;

    constructor(public payload: any) {
    }

}

export class UserUnloaded implements Action {
    readonly type = ConfigActionTypes.UserUnloaded;
}

export class NotificationCount implements Action {
    readonly type = ConfigActionTypes.NotificationCount;
    public payload: State = {};

    constructor(notificationCount: number) {
        this.payload.notificationCount = notificationCount;
    }

}

export class HeaderCounts implements Action {
    readonly type = ConfigActionTypes.HeaderCounts;
    public payload: State = {};

    constructor(counts: { notifications:number; expiringContent: number;}) {
        this.payload.notificationCount = counts.notifications;
        this.payload.expiringContent = counts.expiringContent;
    }

}

export class ClearStatusCount implements Action {
    readonly type = ConfigActionTypes.ClearStatusCount;
    public payload: State = {};

    constructor(clearStatusCount: number) {
        this.payload.clearStatusCount = clearStatusCount;
    }

}

export class PublishedDate implements Action {
    readonly type = ConfigActionTypes.PublishedDate;
    public payload: State = {};

    constructor(publishedDate: string) {
        this.payload.publishedDate = publishedDate;
    }

}

export class ExpiringContent implements Action {
    readonly type = ConfigActionTypes.ExpiringContent;
    public payload: State = {};

    constructor(expiringContent: number) {
        this.payload.expiringContent = expiringContent;
    }

}


export type ConfigActionsUnion =
    LoadConfig
    | UserLoaded
    | UserUnloaded
    | ExpiringContent
    | HeaderCounts
    | PublishedDate
    | NotificationCount
    | ClearStatusCount;