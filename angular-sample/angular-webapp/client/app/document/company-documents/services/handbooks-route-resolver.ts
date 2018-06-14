import { HandbooksListClearAction } from './../actions/handbooks.actions';
import { ContractsDataClearAction } from './../actions/contracts.actions';
import { Observable } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import * as fromRoot from './../../../shared/reducers';
 

@Injectable()
export class HankBookDocumentRouteResolve implements Resolve<any> {
    constructor(        
         private _claimsHelper: ClaimsHelperService
        , private _store: Store<fromRoot.State>
    ) {

    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {        
        this._store.dispatch(new ContractsDataClearAction());
        this._store.dispatch(new HandbooksListClearAction());
        return null;
    }
}
