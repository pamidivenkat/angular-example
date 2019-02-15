import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { Preferences } from "../models/user";
import { DataService } from "./data.service";

@Injectable({
  providedIn: "root"
})
export class UserService {
  constructor(private _dataService: DataService) {}

  public getUserList(includeItems?: boolean): Observable<any> {
    return this._dataService.get(`users`);
  }

  public getUserListWithRoles(): Observable<any> {
    return this._dataService.get(`users/alluserswithroles`);
  }

  public getUserRoles(id: string): Observable<any> {
    return this._dataService.get(`users/roles/${id}`);
  }

  public setUserRoles(userRoleMap: { id: string; roleId: string }): Observable<any> {
    return this._dataService.post(`users/updaterole/`, userRoleMap);
  }

  public getUsersByRoles(roleName: string): Observable<any> {
    return this._dataService.get(`users/allroles/${roleName}`);
  }

  public getRolesList(): Observable<any> {
    return this._dataService.get(`users/allroles`);
  }

  public getUserById(id: string): Observable<any> {
    return this._dataService.get(`users/${id}`);
  }

  public getUsersByAssociateIds(ids: string): Observable<any> {
    let params = [];
    ids.split(",").map(id => {
      params.push(`associateid=${id}`);
    });
    return this._dataService.get(`users/associateid?${params.join("&")}`);
  }

  public getUsersByName(namePart: string): Observable<any> {
    return this._dataService.get(`users/search/${namePart}`);
  }

  public getUserPreferences(userId: string): Observable<any> {
    return this._dataService.get(`emailpreferences/byuserid/${userId}?includeItems=true`);
  }

  public saveUserPreferences(preferences: Preferences, isUpdate: boolean): Observable<any> {
    if (isUpdate) {
      return this._dataService.put(`emailpreferences/${preferences.emailPreferenceId}`, preferences);
    }
    return this._dataService.post(`emailpreferences`, preferences);
  }

  public createAspNetUser(email: string, userId: string): Observable<any> {
    return this._dataService.get(`users/create?email=${email}&userId=${userId}`);
  }
}
