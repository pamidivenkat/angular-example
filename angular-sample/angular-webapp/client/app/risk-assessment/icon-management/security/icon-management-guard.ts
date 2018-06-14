import { IconManagementSecurityService } from '../services/icon-management-security-service';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
@Injectable()
export class IconManagementGuard implements CanActivate {
    constructor(private _iconManagementSecurityService: IconManagementSecurityService) {

    }
    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this._iconManagementSecurityService.canView();
    }
}