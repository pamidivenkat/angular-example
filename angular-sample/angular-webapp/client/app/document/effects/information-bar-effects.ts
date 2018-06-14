import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { extractInformationBarItems } from '../../shared/helpers/extract-helpers';
import { ActionTypes } from '../actions/information-bar-actions';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { of } from 'rxjs/observable/of';
import * as documentInformationbarActions from '../actions/information-bar-actions';
import * as fromRoot from '../../shared/reducers/index';
import { Http, URLSearchParams } from '@angular/http';
import * as errorActions from '../../shared/actions/error.actions';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
;
@Injectable()
export class DocumentInformationbarEffects {
    /**
     * This effect makes use of the `startWith` operator to trigger
     * the effect immediately on startup.
     */
    @Effect()
    loadDocumentInformationBarItems$: Observable<Action> = this._actions$.ofType(ActionTypes.LOAD_DOCUMENT_INFORMATIONBAR)
        .switchMap((action) => {
            let employeeId = <string>action.payload;
            let params: URLSearchParams = new URLSearchParams();
            params.set('EmployeeId', employeeId);
            params.set('Area', '5');
            params.set('requestedCodes', '');
            return this._data.get('Statistics', { search: params });
        })
        .map((res) => {
            return new documentInformationbarActions.LoadDocumentInformationBarCompleteAction(extractInformationBarItems(res));
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "Document information", null)));
        })

    @Effect()
    loadDocumentInformationBarSpecificItems$: Observable<Action> = this._actions$.ofType(ActionTypes.LOAD_DOCUMENT_INFORMATIONBAR_SPECIFIC_STAT)
        .switchMap((action) => {
            let payLoad = action.payload;
            let params: URLSearchParams = new URLSearchParams();
            params.set('EmployeeId', payLoad.employeeId);
            params.set('Area', '5');
            params.set('requestedCodes', payLoad.statisticIds);
            return this._data.get('Statistics', { search: params });
        })
        .map((res) => {
            return new documentInformationbarActions.LoadDocumentInformationBarSpecificStatCompleteAction(extractInformationBarItems(res));
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "Document information", null)));
        })

    // constructor
    constructor(private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _data: RestClientService
        , private _claimsHelper: ClaimsHelperService) {

    }
    // End of constructor
}
