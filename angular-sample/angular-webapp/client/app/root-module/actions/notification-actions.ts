import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { AtlasNotification, NotificationMarkAsReadPayLoad, NotificationMarkAsReadResponse } from './../models/notification';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';

export const ActionTypes = {
    LOAD_NOTIFICATION_UNREAD_COUNT: type('[Notification] Load Notification unread count'),
    LOAD_NOTIFICATION_UNREAD_COUNT_COMPLETE: type('[Notification] Load Notification  unread count complete'),

    LOAD_NOTIFICATION_ITEMS: type('[Notification] Load Notification items'),
    LOAD_NOTIFICATION_ITEMS_COMPLETE: type('[Notification] Load Notification items complete'),

    NOTIFICATION_ITEMS_MARK_AS_READ: type('[Notification] Notification items mark as read'),
    NOTIFICATION_ITEMS_MARK_AS_READ_COMPLETE: type('[Notification] Notification items mark as read complete')
}

export class LoadNotificationUnReadCountAction implements Action {
    type = ActionTypes.LOAD_NOTIFICATION_UNREAD_COUNT;
    constructor() {

    }
}

export class LoadNotificationUnReadCountCompleteAction implements Action {
    type = ActionTypes.LOAD_NOTIFICATION_UNREAD_COUNT_COMPLETE;
    constructor(public payload: AtlasApiResponse<AtlasNotification>) {

    }
}

export class LoadNotificationItemsAction implements Action {
    type = ActionTypes.LOAD_NOTIFICATION_ITEMS;
    constructor(public payload: PagingInfo) {

    }
}


export class LoadNotificationItemsCompleteAction implements Action {
    type = ActionTypes.LOAD_NOTIFICATION_ITEMS_COMPLETE;
    constructor(public payload: AtlasApiResponse<AtlasNotification>) {

    }
}

export class NotificationsMarkAsReadAction implements Action {
    type = ActionTypes.NOTIFICATION_ITEMS_MARK_AS_READ;
    constructor(public payload: NotificationMarkAsReadPayLoad) {

    }
}

export class NotificationsMarkAsReadCompleteAction implements Action {
    type = ActionTypes.NOTIFICATION_ITEMS_MARK_AS_READ_COMPLETE;
    constructor(public payload: NotificationMarkAsReadResponse) {

    }
}

export type Actions = LoadNotificationUnReadCountCompleteAction
    | LoadNotificationUnReadCountAction
    | LoadNotificationItemsAction
    | LoadNotificationItemsCompleteAction
    | NotificationsMarkAsReadAction
    | NotificationsMarkAsReadCompleteAction;