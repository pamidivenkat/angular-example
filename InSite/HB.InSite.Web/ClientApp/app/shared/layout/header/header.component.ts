import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { distinctUntilChanged, takeUntil } from "rxjs/operators";

import * as constants from "../../../app.constants";
import { User } from "../../../core/models/user";
import { LayoutActions } from "../../../core/redux/actions/layout.actions";
import { NotificationService } from "../../../core/services/notification.service";
import { BaseComponent } from "../../base-component";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent extends BaseComponent implements OnInit {
  isAdminLayout: boolean;
  private _notifications: number;
  private _expiringContent: number;
  private _isMobile: boolean;
  private _user: User;
  private _lastRead: Date;

  @select(["identity", "user"])
  private _user$: Observable<User>;

  @select(["identity", "lastRead"])
  private _lastRead$: Observable<Date>;

  @select(["identity", "expiringCount"])
  private _expiringCount$: Observable<number>;

  @select(["identity", "notifyCount"])
  private _notificationCount$: Observable<number>;

  title = "HB InSite";
  isAddOrUpdatePost: boolean;
  snackbarMessage: string[];
  publishedDate: string;

  @select(["layout", "isMobile"])
  isMobile$: Observable<boolean>;

  get expiringContent(): number {
    return this._expiringContent;
  }

  get notifications(): number {
    return this._notifications;
  }

  get user(): User {
    return this._user;
  }

  constructor(
    private _router: Router,
    private _layoutActions: LayoutActions,
    private _notificationService: NotificationService
  ) {
    super();
    this._isMobile = false;
    this.isAddOrUpdatePost = false;
    this._notifications = 0;
    this._expiringContent = 0;
    this.publishedDate = constants.publishedDate;

    this._user$.pipe(takeUntil(this._destructor$)).subscribe(user => {
      this._user = user ? user : new User();
    });
  }

  ngOnInit() {
    this.isMobile$.pipe(distinctUntilChanged()).subscribe(value => {
      this._isMobile = value ? true : false;
    });
    this.isAdminLayout = this._router.url.indexOf("admin") > 0;
    this._lastRead$.pipe(distinctUntilChanged()).subscribe(readTime => (this._lastRead = readTime));
    this._expiringCount$.pipe(distinctUntilChanged()).subscribe(count => {
      this._expiringContent = count;
    });
    this._notificationCount$.pipe(distinctUntilChanged()).subscribe(count => {
      this._notifications = count;
    });
  }

  hasNotifications(): boolean {
    return this._notifications > 0;
  }

  hasExpiringContent(): boolean {
    return this._expiringContent > 0;
  }

  goToNotifications() {
    if (this._notifications > 0) {
      this._notifications = 0;
      this._notificationService
        .markAsRead(this._user.id, this._lastRead)
        .pipe(distinctUntilChanged())
        .subscribe(response => {
          if (!(response instanceof HttpErrorResponse)) {
            this._notificationService.markAllRead();
          }
        });
    }
    if (this._isMobile) {
      this._router.navigateByUrl("notifications");
    }
  }

  toggleNav() {
    this._layoutActions.toggleMenu();
  }

  //Reload if root page
  gotoHome() {
    if (this._router.url === "/") {
      window.location.reload();
    } else {
      this._router.navigateByUrl("/");
    }
  }
}
