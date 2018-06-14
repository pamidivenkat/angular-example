import { CitationDraftsClearAction } from './../citation-drafts-documents/actions/citation-drafts.actions';
import { getEmployeeState } from '../../shared/reducers';
import { Observable } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from './../../shared/helpers/claims-helper';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import * as fromRoot from './../../shared/reducers';
 

@Injectable()
export class DraftDocumentRouteResolve implements Resolve<any> {
    constructor(        
         private _claimsHelper: ClaimsHelperService
        , private _store: Store<fromRoot.State>
    ) {

    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        //This is hte best place to clear off the employe state when the requested employee id does not meet state saved employee id        
        this._store.dispatch(new CitationDraftsClearAction());
        return null;
    }
}
