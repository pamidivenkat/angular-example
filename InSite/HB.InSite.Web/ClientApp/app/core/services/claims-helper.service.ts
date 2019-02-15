import { select } from "@angular-redux/store";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { distinctUntilChanged, filter } from "rxjs/operators";

import { User, UserRole } from "../models/user";

@Injectable({
  providedIn: "root"
})
export class ClaimsHelperService {
  private _user: User;

  @select(["identity", "user"])
  user$: Observable<User>;

  constructor() {
    this.user$
      .pipe(
        distinctUntilChanged(),
        filter(u => u != null)
      )
      .subscribe(u => (this._user = u));
  }

  public isAdmin(): boolean {
    return this._user.roles.findIndex(role => role.toLowerCase() === UserRole.Administrator.toLowerCase()) !== -1;
  }

  public canEditEntity(userId: string): boolean {
    if (userId === this._user.id) {
      return true;
    }

    return (
      this._user.roles &&
      (this._user.roles.findIndex(role => role.toLowerCase() === UserRole.Moderator.toLowerCase()) !== -1 ||
        this._user.roles.findIndex(role => role.toLowerCase() === UserRole.Administrator.toLowerCase()) !== -1)
    );
  }

  public isSysAdmin(userId: string): boolean {
    return userId === "11111111-1111-1111-1111-111111111111";
  }
}
