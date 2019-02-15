import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { combineLatest as observableCombineLatest, Observable } from "rxjs";
import { distinctUntilChanged, filter, takeUntil } from "rxjs/operators";

import * as constants from "../../../app.constants";
import { User } from "../../../core/models/user";
import { IdentityActions } from "../../../core/redux/actions/identity.actions";
import { LayoutActions } from "../../../core/redux/actions/layout.actions";
import { PostService } from "../../../core/services/post.service";
import { BaseComponent } from "../../base-component";
import { NativeScriptInterfaceService } from "../../services/native-script-interface.service";

@Component({
  selector: "app-admin-menu",
  templateUrl: "./admin-menu.component.html",
  styleUrls: ["./admin-menu.component.scss"]
})
export class AdminMenuComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _expiringContent: number;
  private _open: boolean = true;
  private _user: User;

  @select(["identity", "user"])
  private _user$: Observable<User>;
  // End of Private Fields

  // Public properties
  public publishedDate: string;
  public showSubMenu = false; // store state

  public showSearchModel: boolean;
  public mode: string = "side";
  public consts;

  @select(["theme", "menu"])
  menuOpen$: Observable<boolean>;

  @select(["layout", "isMobile"])
  isMobile$: Observable<boolean>;

  @Input()
  set expiringContent(value: number) {
    this.nsInterfaceService.nsEventEmitter({
      type: "expiringContent",
      object: value
    });
    this._expiringContent = value;
  }
  get expiringContent(): number {
    return this._expiringContent;
  }

  @Input()
  set open(value: boolean) {
    this._open = value;
  }
  get open(): boolean {
    return this._open;
  }

  get user(): User {
    return this._user;
  }

  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings

  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private _identityActions: IdentityActions,
    private _router: Router,
    private nsInterfaceService: NativeScriptInterfaceService,
    private _layoutActions: LayoutActions,
    private _postService: PostService
  ) {
    super();
    this.consts = constants;
    this.publishedDate = constants.publishedDate;
    this._user = new User();
  }

  // End of constructor

  // Private methods
  // End of private methods

  // Public methods
  ngOnInit() {
    this._user$
      .pipe(
        distinctUntilChanged(),
        filter(user => user !== null)
      )
      .map(user => {
        this._user = user;
        this._user.location = [user.businessCity, user.businessState, user.country].filter(loc => loc).join(", ");
        this.nsInterfaceService.nsEventEmitter({
          type: "loadSettingsNS",
          object: this._user
        });
        this.nsInterfaceService.nsEventEmitter({
          type: "getUserNS",
          object: this._user
        });
      })
      .switchMap(() => {
        if (this._user.id) {
          return this._postService.getExpiringCount(this._user.id).pipe(takeUntil(this._destructor$));
        }
      })
      .subscribe(response => {
        if (response instanceof HttpErrorResponse) {
          this._expiringContent = 0;
        } else {
          this._expiringContent = response;
        }
      });

    observableCombineLatest(this._router.events, this.isMobile$)
      .pipe(takeUntil(this._destructor$))
      .subscribe(([event, isMobile]) => {
        if (isMobile) {
          this._layoutActions.toggleMenu(false);
        }
      });

    this.nsInterfaceService.nsEventEmitter({
      type: "publishedDate",
      object: this.publishedDate
    });
    this.nsInterfaceService.nsEventLister(
      {
        type: "nsLogout",
        object: this
      },
      function(that, event) {
        that.logout();
      },
      function(that, error) {
        console.log("nsLogoutEventLister ERROR: ", error);
      }
    );
  }

  logout() {
    this._identityActions.logoutUserIdentity();
    console.log("User had successfully logout ");
  }

  // End of public methods
}
