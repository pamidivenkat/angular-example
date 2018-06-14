import { Observable } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import * as fromRoot from './../shared/reducers';
import { AuthGuard } from '../shared/security/auth.guard';
import { ClearMethodStatementStateAction } from './manage-methodstatements/actions/manage-methodstatement.actions';

@Injectable()
export class MethodStatementRouteResolve implements Resolve<any> {
    constructor(
        private _store: Store<fromRoot.State>
    ) {

    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        //This is used to clear off the state info. when the requested method statement id does not meet state saved method statement id
        let methodStatementIdRequested: string = route.params['id'] ? route.params['id'] : null;
        this._store.dispatch(new ClearMethodStatementStateAction(methodStatementIdRequested));
        return null;
    }
}
