import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from "@angular/router";
import { Observable } from "rxjs";

import { PropertyService } from "../services/property.service";

@Injectable()
export class PropertyResolver implements Resolve<any> {
  constructor(private _propertyService: PropertyService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    const id = route.paramMap.get("id")
      ? +route.paramMap.get("id")
      : route.queryParams["property"];

    return id ? this._propertyService.getPropertyById(id) : null;
  }
}
