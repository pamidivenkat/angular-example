import { ClaimsHelperService } from './../shared/helpers/claims-helper';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class HolidayRequestsGuard implements CanActivate, CanActivateChild {
    constructor(private _claimsHelper: ClaimsHelperService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this._claimsHelper.isHolidayAuthorizerOrManager();
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this._claimsHelper.isHolidayAuthorizerOrManager();
    }
}