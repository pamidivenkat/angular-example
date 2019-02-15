import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from "@angular/router";
import { Observable } from "rxjs/Rx";

@Injectable()
export class UserResolver implements Resolve<any> {
  constructor() {}
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    return Observable.of(user);
  }
}
