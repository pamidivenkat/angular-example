import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';

import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import * as errorActions from '../../shared/actions/error.actions';
import { RestClientService } from '../../shared/data/rest-client.service';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { extractInformationBarItems } from '../../shared/helpers/extract-helpers';
import * as fromRoot from '../../shared/reducers/index';
import { ActionTypes } from '../actions/information-bar.actions';
import * as informationbarActions from '../actions/information-bar.actions';

@Injectable()
export class InformationbarEffects {
    // constructor 
    constructor(private _actions$: Actions, private _store: Store<fromRoot.State>, private _data: RestClientService, private _claimsHelper: ClaimsHelperService) {

    }
    // End of constructor

    /**
     * This effect makes use of the `startWith` operator to trigger
     * the effect immediately on startup.
     */
    @Effect()
    loadInformationBarItems$: Observable<Action> = this._actions$.ofType(ActionTypes.LOAD_INFORMATIONBAR)
        .switchMap(() => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('EmployeeId', this._claimsHelper.getEmpIdOrDefault());
            params.set('Area', '1');
            return this._data.get('Statistics', { search: params })
        })
        .map((res) => {
            return new informationbarActions.LoadInformationBarCompleteAction(extractInformationBarItems(res));
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Information bar', null)));
        });




}