import { select } from "@angular-redux/store";
import { Injectable } from "@angular/core";
import { AdalService } from "adal-angular4";
import { Observable } from "rxjs/Observable";
import { distinctUntilChanged } from "rxjs/operators";

import { AADUser } from "../models/user";
import { IdentityActions } from "../redux/actions/identity.actions";
import * as constants from "./../../app.constants";

@Injectable()
export class AuthenticationService {
  @select(["identity", "user"])
  adalUser$: Observable<AADUser>;
  private _aadUser: AADUser = null;
  private _config = {
    // Directory: rmcbridetoplinestrategies.onmicrosoft.com
    tenant: constants.activeDirectory.tenant,
    clientId: constants.activeDirectory.clientId,
    redirectUri: constants.activeDirectory.redirectUri,
    postLogoutRedirectUri: constants.activeDirectory.postLogoutRedirectUri,
    cacheLocation: "localStorage",
    expireOffsetSeconds: 600
  };

  constructor(private _adal: AdalService, private _identityActions: IdentityActions) {
    this._adal.init(this._config);
    this.adalUser$.subscribe(adu => (this._aadUser = adu));
  }

  public isLoggedIn(): boolean {
    return this._adal.userInfo.authenticated;
  }

  public logout(): void {
    localStorage.removeItem("currentUser");
    this._adal.logOut();
  }

  public startAuthentication(): any {
    this._adal.login();
  }

  public getName(): string {
    return this._aadUser.name;
  }

  private getUser(): AADUser {
    return this._aadUser;
  }

  public completeAuthentication(): void {
    this._adal.handleWindowCallback();

    this._adal
      .getUser()
      .pipe(distinctUntilChanged())
      .subscribe(user => {
        if (user) {
          this._identityActions.loginAdalUserIdentity(user);
        }
      });
  }
}
