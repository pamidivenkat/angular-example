import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, HostListener, OnInit, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { AdalService } from "adal-angular4";
import { Observable, Subscription } from "rxjs";
import { distinctUntilChanged, filter, map, switchMap, takeUntil } from "rxjs/operators";

import * as constants from "../../app.constants";
import { User } from "../../core/models/user";
import { IdentityActions } from "../../core/redux/actions/identity.actions";
import { LayoutActions } from "../../core/redux/actions/layout.actions";
import { ILayoutState } from "../../core/redux/reducers/layout.reducer";
import { NotificationService } from "../../core/services/notification.service";
import { PostService } from "../../core/services/post.service";
import { NativeScriptInterfaceService } from "../services/native-script-interface.service";

@Component({
  selector: "app-layout",
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class LayoutComponent implements OnInit {
  @select(["identity", "user"])
  private _user$: Observable<User>;

  @select(["identity", "expiringCount"])
  private _expiringCount$: Observable<number>;

  @select(["identity", "notificationCount"])
  private _notificationCount$: Observable<number>;

  private _intervalSubscription: Subscription;

  title = "HB InSite";
  showHomeButton: boolean;
  snackbarMessage: string[];
  publishedDate: string;
  containerHeight: string = "720px";

  public isAdminLayout: boolean = false;

  @select(["layout"])
  layout$: Observable<ILayoutState>;
  menu$ = this.layout$.pipe(map(l => l.menu));
  showHeader$ = this.layout$.pipe(map(l => l.showHeader));
  side$ = this.layout$.pipe(
    map(l => l.side),
    distinctUntilChanged()
  );

  minHeight$ = this.layout$.pipe(map(l => l.minHeight));

  menuIsOpen: boolean;

  static isMobileCalc(width: number): boolean {
    return width < 1024;
  }

  private _notificationCount: number;
  private _expiringCount: number;

  get expiringContent(): number {
    return this._expiringCount;
  }

  get notifications(): number {
    return this._notificationCount;
  }

  private _user: User;
  get user(): User {
    return this._user;
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    const isMobileDisplay = LayoutComponent.isMobileCalc(event.target.innerWidth);
    this._layoutActions.toggleMobile(isMobileDisplay);
  }

  constructor(
    private _router: Router,
    private _layoutActions: LayoutActions,
    private _identityActions: IdentityActions,
    private nsInterfaceService: NativeScriptInterfaceService,
    private _notificationService: NotificationService,
    private _postService: PostService,
    private _adal: AdalService
  ) {
    this.showHomeButton = false;
    this.publishedDate = constants.publishedDate;
    this._layoutActions.initLayout(LayoutComponent.isMobileCalc(window.innerWidth));

    this.menu$.pipe(map(m => m.isOpen)).subscribe(isOpen => (this.menuIsOpen = isOpen));

    this.minHeight$.pipe(distinctUntilChanged()).subscribe(minHeight => {
      if (+minHeight.replace("px", "") > +this.containerHeight.replace("px", "")) {
        this.containerHeight = minHeight;
      }
    });
    this._getNotificationCount();
  }

  private _getNotificationCount() {
    this._user$
      .pipe(
        distinctUntilChanged(),
        filter(user => {
          return user !== null;
        }),
        switchMap(user => {
          let expSubscription = this._postService.getExpiringCount(user.id);
          let notifySubscription = this._notificationService.getCountByUser(user ? user.id : null);

          return Observable.combineLatest(expSubscription, notifySubscription);
        })
      )
      .subscribe(([expResponse, notifyResponse]) => {
        this._identityActions.userLastRead(new Date());
        this._expiringCount = expResponse instanceof HttpErrorResponse ? 0 : expResponse;
        this._notificationCount = notifyResponse instanceof HttpErrorResponse ? 0 : notifyResponse;

        this._identityActions.userExpCount(this._expiringCount);
        this._identityActions.userNotifyCount(this._notificationCount);

        this.nsInterfaceService.nsEventEmitter({
          type: "headerCounts",
          object: {
            notifications: this._notificationCount,
            expiringContent: this._expiringCount
          }
        });
      });

    this._user$
      .pipe(
        distinctUntilChanged(),
        filter(user => {
          return user === null;
        })
      )
      .subscribe(() => {
        if (this._intervalSubscription) {
          this._intervalSubscription.unsubscribe();
        }
      });
  }

  private _showHideHomeButton() {
    if (this._router.url == "/" || this._router.url.substr(0, 9) == "/property") {
      this.showHomeButton = true;
    } else {
      this.showHomeButton = false;
    }
  }

  ngOnInit() {
    this._showHideHomeButton();
    this._router.events.subscribe(event => {
      this._showHideHomeButton();
    });

    this._expiringCount$.pipe(distinctUntilChanged()).subscribe(count => (this._expiringCount = count));
    this._notificationCount$.pipe(distinctUntilChanged()).subscribe(count => (this._notificationCount = count));

    this.isAdminLayout = this._router.url.indexOf("admin") > 0;

    //TODO: Notification timer update with const
    this._intervalSubscription = Observable.interval(5 * 60 * 1000).subscribe(() => {
      this._getNotificationCount();
    });
  }

  menuOpenEvent(event) {
    if (!event && this.menuIsOpen) {
      this._layoutActions.toggleMenu();
    }
  }

  changeOfRoutes() {
    this._adal.refreshDataFromCache();
  }
}
