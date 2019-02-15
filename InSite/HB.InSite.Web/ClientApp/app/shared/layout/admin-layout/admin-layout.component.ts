import { select } from "@angular-redux/store";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AdalService } from "adal-angular4";
import { Observable } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";

import * as constants from "../../../app.constants";
import { User } from "../../../core/models/user";
import { LayoutActions } from "../../../core/redux/actions/layout.actions";
import { NotificationService } from "../../../core/services/notification.service";
import { BaseComponent } from "../../base-component";

@Component({
  selector: "app-admin-layout",
  templateUrl: "./admin-layout.component.html",
  styleUrls: ["./admin-layout.component.scss"]
})
export class AdminLayoutComponent extends BaseComponent implements OnInit {
  private _notifications: number;
  private _expiringContent: number;
  private _isMobile: boolean;
  private _user: User;
  private _lastRead: Date;

  @select(["identity", "user"])
  private _user$: Observable<User>;

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
    private _notificationService: NotificationService,
    private _adal: AdalService
  ) {
    super();
    this._isMobile = false;
    this.isAddOrUpdatePost = false;
    this._notifications = 0;
    this._expiringContent = 0;
    this.publishedDate = constants.publishedDate;
  }

  ngOnInit() {
    this.isMobile$.pipe(distinctUntilChanged()).subscribe(value => {
      this._isMobile = value ? true : false;
    });
  }

  changeOfRoutes() {
    this._adal.refreshDataFromCache();
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
        .subscribe(response => {});
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
