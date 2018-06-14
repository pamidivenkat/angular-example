import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { ManageSiteSecurityService } from '../services/site-security-service';

import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class CompanySitesAuthGuard implements CanActivate, CanActivateChild {
    constructor(private _manageSiteSecurityService: ManageSiteSecurityService
        , private _claimsHelper: ClaimsHelperService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this._validateNavigation(route, state);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this._validateNavigation(route, state);
    }

    private _validateNavigation(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this._manageSiteSecurityService.CanManageCompany();
    }

}