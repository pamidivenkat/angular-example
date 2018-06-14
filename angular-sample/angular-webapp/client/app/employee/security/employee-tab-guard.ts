import { ClaimsHelperService } from './../../shared/helpers/claims-helper';
import { CalendarRoutes } from './../../calendar/calendar.routes';
import { EmployeeConstants } from './../employee-constants';
import { EmployeeSecurityService } from './../services/employee-security-service';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class EmployeeTabAuthGuard implements CanActivate, CanActivateChild {
    constructor(private _employeeSecurityService: EmployeeSecurityService, private _claimsHelper: ClaimsHelperService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this._validateNavigation(route, state);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this._validateNavigation(route, state);
    }

    private _validateNavigation(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let empidFromCurrentRoute = route.params['id'];
        let empIdFromParentRoute = route.parent.params['id'];
        let empidFromRoute = empidFromCurrentRoute ? empidFromCurrentRoute : empIdFromParentRoute;
        let employeeIdRequested: string = empidFromRoute ? empidFromRoute : this._claimsHelper.getEmpIdOrDefault();
        return this._employeeSecurityService.CanView(route.url[0].path, employeeIdRequested);
    }
}