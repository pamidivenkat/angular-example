import { EmployeeImportStateClearAction } from '../employee-import/actions/employee-import.actions';
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
export class EmployeeImportRouteResolve implements Resolve<any> {
    constructor(private _employeeSecurityService: EmployeeSecurityService
        , private _claimsHelper: ClaimsHelperService
        , private _store: Store<fromRoot.State>
    ) {

    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {      
        this._store.dispatch(new EmployeeImportStateClearAction());
        return null;
    }
}
