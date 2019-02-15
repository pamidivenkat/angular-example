import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs/Rx";

import { PostType } from "../models/post";
import { DataService } from "./data.service";

const NOTIFICATION_API = "notifications";
const NOTIFICATION_ITEMS_API = "notificationItems";

@Injectable()
export class NotificationService {
  public markRead: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private _dataService: DataService) {}

  markAllRead() {
    this.markRead.next(true);
  }

  createNotification(notification): Observable<any> {
    return this._dataService.post(NOTIFICATION_API, notification);
  }

  deleteNotification(id: string): Observable<any> {
    return this._dataService.delete(NOTIFICATION_API, id);
  }

  clearNotificationItems(userId: string): Observable<any> {
    return this._dataService.delete(`${NOTIFICATION_ITEMS_API}/byuserid`, userId);
  }

  deleteNotificationItem(id: string): Observable<any> {
    return this._dataService.delete(NOTIFICATION_ITEMS_API, id);
  }

  getItemsByUser(userId: string, params?: any): Observable<any> {
    let httpParams: HttpParams;
    if (params) {
      httpParams = new HttpParams().set("maxId", params.maxId);
    } else {
      httpParams = new HttpParams();
    }
    return this._dataService.get(`${NOTIFICATION_ITEMS_API}/byuserid/${userId}`, httpParams);
  }

  getCountByUser(userId: string): Observable<any> {
    return this._dataService.get(`${NOTIFICATION_ITEMS_API}/byuserid/${userId}/count`);
  }

  markAsRead(userId: string, lastRead: Date): Observable<any> {
    const params = new HttpParams();

    return this._dataService.put(
      `${NOTIFICATION_ITEMS_API}/markasread?createdby=${userId}&submittedon=${lastRead.toISOString()}`,
      params
    );
  }

  getNotificationIdByEntity(entityId: number, userId: string, postType: PostType): Observable<any> {
    return this._dataService.get(`notifications/byentityid/${userId}/${entityId}/${postType}`);
  }
}
