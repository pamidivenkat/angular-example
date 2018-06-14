import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as companyStructureActions from '../actions/company-structure.actions';
import * as errorActions from '../../shared/actions/error.actions';
import { AtlasApiError } from "../../shared/error-handling/atlas-api-error";
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
@Injectable()
export class CompanyStructureEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>) {
    }
    @Effect()
    loadCompanyStructure$: Observable<Action> = this._actions$.ofType(companyStructureActions.ActionTypes.LOAD_COMPANY_STRUCTURE)
        .switchMap((action) => {
            return this._data.get('companysiteview');
        })
        .map((res) => {
            return new companyStructureActions.LoadCompanyStructureCompleteAction(res.json());
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'CompanyStructure', 'Company Structure')));
        });
}
