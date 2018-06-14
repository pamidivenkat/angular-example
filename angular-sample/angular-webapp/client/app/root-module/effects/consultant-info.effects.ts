import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { consulantModel } from '../models/consulant-info';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import * as fromRoot from '../../shared/reducers/index';
import * as consultantInfoActions from '../actions/consultant-info.actions';

@Injectable()
export class ConsultantInfoEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>,private _claimsHelper: ClaimsHelperService) {

    }
    @Effect()
    consulantInfo$: Observable<Action> = this._actions$.ofType(consultantInfoActions.ActionTypes.LOAD_CONSULTANTS)
        .switchMap(() => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('companyId', this._claimsHelper.getCompanyIdOrCid());
            let siteId=this._claimsHelper.getSiteId();
            params.set('siteId',siteId);
            params.set('checkForHeadOfficeConsulant', 'true');
            params.set('siteConsultant', 'true');
            return this._data.get('SiteAssignments', { search: params })
        })
        .map((res) => {
            return new consultantInfoActions.LoadConsulantCompleteAction(res.json() as consulantModel[]);
        });

}