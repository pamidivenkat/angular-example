import { ClearCPPAction } from './manage-construction-plan/actions/manage-cpp.actions';
import { Observable } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import * as fromRoot from './../shared/reducers';
import { AuthGuard } from '../shared/security/auth.guard';

@Injectable()
export class CPPRouteResolve implements Resolve<any> {
    constructor(
        private _store: Store<fromRoot.State>
    ) {

    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        //This is hte best place to clear off the employe state when the requested employee id does not meet state saved employee id
        let cppIdRequested: string = route.params['id'] ? route.params['id'] : null;
        this._store.dispatch(new ClearCPPAction(cppIdRequested));
        return null;
    }
}
