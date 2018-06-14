import { getEmployeeState } from '../../shared/reducers';
import { Observable } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from './../../shared/helpers/claims-helper';
import { EmployeeSecurityService } from './../services/employee-security-service';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import * as fromRoot from './../../shared/reducers';
import { EmployeeStateClearAction } from "./../actions/employee.actions";

@Injectable()
export class EmployeeRouteResolve implements Resolve<any> {
    constructor(private _employeeSecurityService: EmployeeSecurityService
        , private _claimsHelper: ClaimsHelperService
        , private _store: Store<fromRoot.State>
    ) {

    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        //This is hte best place to clear off the employe state when the requested employee id does not meet state saved employee id
        let employeeIdRequested: string = route.params['id'] ? route.params['id'] : this._claimsHelper.getEmpIdOrDefault();
        this._store.dispatch(new EmployeeStateClearAction(employeeIdRequested));
        return null;
    }
}
