import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { AtlasNotification, NotificationMarkAsReadPayLoad, NotificationMarkAsReadResponse } from './../models/notification';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as notificationActions from './../actions/notification-actions';

@Injectable()
export class NotificationEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>) {

    }
    @Effect()
    notificationUnReadCount$: Observable<Action> = this._actions$.ofType(notificationActions.ActionTypes.LOAD_NOTIFICATION_UNREAD_COUNT)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('notificationsByExpiryDate', (new Date().toDateString()).toString());
            params.set('fields', 'Id,CreatedOn');
            params.set('notificationsByReadStatus', '0')
            params.set('pageNumber', '1');
            params.set('pageSize', '1');
            params.set('sortField', 'CreatedOn');
            params.set('direction', 'desc');
            return this._data.get('Notification', { search: params })
        })
        .map((res) => {
            return new notificationActions.LoadNotificationUnReadCountCompleteAction(<AtlasApiResponse<AtlasNotification>>res.json());
        });

    @Effect()
    notifications$: Observable<Action> = this._actions$.ofType(notificationActions.ActionTypes.LOAD_NOTIFICATION_ITEMS)
        .switchMap((action) => {
            let payload = <PagingInfo>action.payload;
            let params: URLSearchParams = new URLSearchParams();
            params.set('notificationsByExpiryDate', (new Date().toDateString()).toString());
            params.set('fields', 'Id,Title,ExpiryDate,HasRead,RegardingObjectId,RegardingObjectOtcType,CreatedOn,Category');
            params.set('pageNumber', payload.PageNumber.toString());
            params.set('pageSize', payload.PageSize.toString());
            params.set('sortField', 'CreatedOn');
            params.set('direction', 'desc');
            return this._data.get('Notification', { search: params })
        })
        .map((res) => {
            return new notificationActions.LoadNotificationItemsCompleteAction(<AtlasApiResponse<AtlasNotification>>res.json());
        });

    @Effect()
    notificationsmarkAsRead$: Observable<Action> = this._actions$.ofType(notificationActions.ActionTypes.NOTIFICATION_ITEMS_MARK_AS_READ)
        .switchMap((action) => {
            let payload = <NotificationMarkAsReadPayLoad>action.payload;
            let params: URLSearchParams = new URLSearchParams();
            let markAllAsRead: boolean = true;
            params.set('markAllAsRead', markAllAsRead.toString())
            return Observable.combineLatest(Observable.of(markAllAsRead), Observable.of(payload), this._data.post('Notification', payload.NotificationIds, { search: params }))
        })
        .map((result) => {
            const [markAllasRead, payload, res] = result;
            return new notificationActions.NotificationsMarkAsReadCompleteAction(new NotificationMarkAsReadResponse(payload.NotificationIds, <number>res.json(), markAllasRead));
        });

}