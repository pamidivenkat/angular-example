import { select } from "@angular-redux/store";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { AdalService } from "adal-angular4";
import { Observable } from "rxjs";
import { distinctUntilChanged, filter } from "rxjs/operators";

import { User } from "../models/user";

@Injectable()
export class AuthGuardService {
  @select(["identity", "user"])
  User$: Observable<User>;

  @select(["identity", "isLoggedIn"])
  public isLoggedIn$: Observable<boolean>;

  public isLogged: boolean = false;
  private _user: User;
  private _expectedRole: any;

  constructor(private _router: Router, private _adal: AdalService) {
    this.User$.pipe(
      distinctUntilChanged(),
      filter(u => u != null)
    ).subscribe(u => (this._user = u));

    this.isLoggedIn$.pipe(distinctUntilChanged()).subscribe(isLoggedIn => (this.isLogged = isLoggedIn));
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // this will be passed from the route config
    // on the data property
    this._expectedRole = route.data.expectedRoles;

    return this._allowed(route, state);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // this will be passed from the route config
    // on the data property
    this._expectedRole = route.data.expectedRoles ? route.data.expectedRoles : route.parent.data.expectedRoles;

    if (!this.isLogged) {
      this._adal.login();
    } else {
      return this._allowed(route, state);
    }
  }

  private _allowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.isLogged && !this._expectedRole) {
      return true;
    }

    if (
      this._expectedRole &&
      this._user &&
      this._user.roles.filter(role => this._expectedRole.filter(e => e.toLowerCase() === role.toLowerCase()).length > 0)
        .length > 0
    ) {
      return true;
    }

    this._router.navigate(["signin"], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
