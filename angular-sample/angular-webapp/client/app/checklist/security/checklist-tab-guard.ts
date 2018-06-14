import { Observable } from 'rxjs/Rx';
import { ChecklistSecurityService } from '../services/cheklist-security.service';
import { ClaimsHelperService } from './../../shared/helpers/claims-helper';
import { CalendarRoutes } from './../../calendar/calendar.routes';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, CanActivateChild } from '@angular/router';

@Injectable()
export class ChecklistTabAuthGuard implements CanActivate, CanActivateChild {
    constructor(private _checklistSecurityService: ChecklistSecurityService) { }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this._validateNavigation(childRoute, state);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this._validateNavigation(route, state);
    }

    private _validateNavigation(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this._checklistSecurityService.canView(route.url[0].path);
    }

}
//implements CanActivate