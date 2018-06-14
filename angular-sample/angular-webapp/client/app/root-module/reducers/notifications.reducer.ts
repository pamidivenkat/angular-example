import { AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { AtlasNotification, NotificationCategory, NotificationMarkAsReadResponse } from './../models/notification';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as notificationActions from './../actions/notification-actions';

export interface NotificationState {
    hasUnReadNotificationsLoaded: boolean,
    unReadNotificationsCount: number,
    loadingNotifications: boolean,
    notifications: AtlasNotification[],
    totalCount: number,
    pageNumber: number
}

const initialState: NotificationState = {
    unReadNotificationsCount: 0,
    hasUnReadNotificationsLoaded: false,
    loadingNotifications: false,
    notifications: [],
    totalCount: 0,
    pageNumber: 0
}


export function reducer(state = initialState, action: Action): NotificationState {
    switch (action.type) {
        case notificationActions.ActionTypes.LOAD_NOTIFICATION_UNREAD_COUNT:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.hasUnReadNotificationsLoaded = false;
                return modifiedState;
            }
        case notificationActions.ActionTypes.LOAD_NOTIFICATION_UNREAD_COUNT_COMPLETE:
            {
                let response = <AtlasApiResponse<AtlasNotification>>action.payload;
                let modifiedState = Object.assign({}, state);
                modifiedState.hasUnReadNotificationsLoaded = true;
                modifiedState.unReadNotificationsCount = response.PagingInfo.TotalCount;
                return modifiedState;
            }
        case notificationActions.ActionTypes.LOAD_NOTIFICATION_ITEMS:
            {
                return Object.assign({}, state, { loadingNotifications: true });
            }
        case notificationActions.ActionTypes.LOAD_NOTIFICATION_ITEMS_COMPLETE:
            {
                let response = <AtlasApiResponse<AtlasNotification>>action.payload;
                let modifiedState = Object.assign({}, state, { loadingNotifications: false });
                modifiedState.notifications = <AtlasNotification[]>response.Entities;
                if (modifiedState.notifications && modifiedState.notifications.length > 0) {
                    modifiedState.notifications.forEach(notif => {
                        if (notif.Category == NotificationCategory.OutOfOffice) {
                            notif.IsClickable = false;
                        } else {
                            notif.IsClickable = true;
                        }
                    });
                    modifiedState.notifications.sort(
                        (x, y) => { return (x.HasRead === y.HasRead) ? 0 : !x.HasRead ? -1 : 1; }
                    );
                }
                modifiedState.totalCount = response.PagingInfo.TotalCount;
                modifiedState.pageNumber = response.PagingInfo.PageNumber;
                return modifiedState;
            }
        case notificationActions.ActionTypes.NOTIFICATION_ITEMS_MARK_AS_READ:
            {
                return Object.assign({}, state, { hasUnReadNotificationsLoaded: false });
            }
        case notificationActions.ActionTypes.NOTIFICATION_ITEMS_MARK_AS_READ_COMPLETE:
            {
                let readCompleteRes = <NotificationMarkAsReadResponse>action.payload;
                let modifiedState = Object.assign({}, state, { hasUnReadNotificationsLoaded: true, unReadNotificationsCount: readCompleteRes.PendingCount });
                //Now all the responseids status should be changed as Mark as read = true for the responded ids
                if (!readCompleteRes.MarkAllAsRead) {
                    modifiedState.notifications.forEach(notification => {
                        let notif = <AtlasNotification>notification;
                        if (readCompleteRes.ReadIds.indexOf(notif.Id) >= 0) {
                            notif.HasRead = true;
                            notification = notif;
                        }
                    });
                }
                else {
                    //when all items rquested as mark as read , we will udpate all state items as mark as read
                    modifiedState.notifications.forEach(notification => {
                        notification.HasRead = true;
                    })
                }
                return modifiedState;
            }
        default:
            return state;
    }
}

export function getUnReadNotificationsData(state$: Observable<NotificationState>): Observable<number> {
    return state$.select(s => s.unReadNotificationsCount);
}

export function getHasUnReadNotificationsDataLoaded(state$: Observable<NotificationState>): Observable<boolean> {
    return state$.select(s => s.hasUnReadNotificationsLoaded);
}

export function getNotificationsData(state$: Observable<NotificationState>): Observable<AtlasNotification[]> {
    return state$.select(s => s.notifications);
}

export function getNotificationsLoadedData(state$: Observable<NotificationState>): Observable<boolean> {
    return state$.select(s => s.loadingNotifications);
}

