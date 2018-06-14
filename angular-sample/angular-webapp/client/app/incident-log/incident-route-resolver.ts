import { Observable } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import * as fromRoot from './../shared/reducers';
import { AuthGuard } from '../shared/security/auth.guard';
import { ClearIncidentStateAction } from './incident/actions/incident.actions';

@Injectable()
export class IncidentRouteResolve implements Resolve<any> {
    constructor(
        private _store: Store<fromRoot.State>
    ) {

    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        //This is used to clear off the employe state when the requested incident id does not meet state saved incident id
        let incidentIdRequested: string = route.params['id'] ? route.params['id'] : null;
        this._store.dispatch(new ClearIncidentStateAction(incidentIdRequested));
        return null;
    }
}
