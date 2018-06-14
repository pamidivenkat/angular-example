import { CheckListClearAction, NullifyCheckLisGlobalFilterParams } from '../actions/checklist.actions';
import { Observable } from 'rxjs/Rx';
import { ChecklistSecurityService } from './cheklist-security.service';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from "@angular/router";
import * as fromRoot from './../../shared/reducers';

@Injectable()
export class CheckListRouteResolve implements Resolve<any> {
    constructor(private _checklistSecurityService: ChecklistSecurityService
        , private _claimsHelper: ClaimsHelperService
        , private _store: Store<fromRoot.State>
    ) {

    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        let checklistId: string = route.params['id'] ? route.params['id'] : null;
        this._store.dispatch(new CheckListClearAction(checklistId));
        return null;
    }
}

@Injectable()
export class CheckListPageRouteResolve implements Resolve<any> {
    constructor(private _store: Store<fromRoot.State>
    ) {

    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {      
        this._store.dispatch(new NullifyCheckLisGlobalFilterParams());
        return null;
    }
}

