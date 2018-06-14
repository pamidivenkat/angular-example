import { SetInitialState } from '../actions/risk-assessment-actions';
import { RiskAssessmentSecurityService } from './risk-assessment-security.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import * as fromRoot from './../../shared/reducers';

@Injectable()
export class RiskAssessmentRouteResolver implements Resolve<any> {
    constructor(private _checklistSecurityService: RiskAssessmentSecurityService
        , private _claimsHelper: ClaimsHelperService
        , private _store: Store<fromRoot.State>
    ) {

    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        let riskAssessmentId: string = route.params['id'] ? route.params['id'] : null;
        this._store.dispatch(new SetInitialState(riskAssessmentId));
        return null;
    }
}
