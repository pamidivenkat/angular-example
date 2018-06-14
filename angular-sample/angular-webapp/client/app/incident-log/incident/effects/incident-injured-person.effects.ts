import { isNullOrUndefined } from 'util';
import { AtlasApiResponse, AtlasApiRequestWithParams, AtlasParams } from './../../../shared/models/atlas-api-response';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from './../../../shared/reducers/index';
import * as incidentInjuredPersonActions from '../actions/incident-injured-person.actions';
import { StringHelper } from './../../../shared/helpers/string-helper';
import { ObjectHelper } from './../../../shared/helpers/object-helper';
import { MessengerService } from './../../../shared/services/messenger.service';
import * as errorActions from './../../../shared/actions/error.actions';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';
import { Address } from './../../../employee/models/employee.model';
import { Site } from './../../../company/sites/models/site.model';
import { ClaimsHelperService } from "../../../shared/helpers/claims-helper";
import { extractInjuredPersonData, extractSelectedEmployeeDetailsData } from "../../../incident-log/incident/common/extract-helpers";

@Injectable()
export class InjuredPersonEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _claimsHelper: ClaimsHelperService
        , private _store: Store<fromRoot.State>
        , private _messenger: MessengerService
    ) {
    }

    @Effect()
    getInjuredPartyData$: Observable<Action> = this._actions$.ofType(incidentInjuredPersonActions.ActionTypes.LOAD_INJURED_PARTY)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('keyValue', 'true');
            return this._data.get(`injuredparty`, { search: params })
                .map((res) => new incidentInjuredPersonActions.LoadInjuredPartyCompleteAction(res.json()))
        });

    @Effect()
    getInjuredPersonDetails$: Observable<Action> = this._actions$.ofType(incidentInjuredPersonActions.ActionTypes.LOAD_INJURED_PERSON_DETAILS)
        .map(toPayload)
        .switchMap((incidentId) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('Id', incidentId);
            return this._data.get(`injuredperson`, { search: params })
                .map((res) => new incidentInjuredPersonActions.LoadInjuredPersonDataCompleteAction(res.json()));
        });

    @Effect()
    addOrUpdateInjuredPersonDetails$: Observable<Action> = this._actions$.ofType(incidentInjuredPersonActions.ActionTypes.ADD_OR_UPDATE_INJURED_PERSON_DETAILS)
        .map(toPayload)
        .switchMap((action) => {

            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Incident', 'About the affected party', action.injuredPersonDet.Id);
            this._messenger.publish('snackbar', vm);
            return (action.isEdit ? this._data.put(`injuredperson`, action.injuredPersonDet) : this._data.post(`injuredperson`, action.injuredPersonDet))
                .map((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Incident', 'About the affected party', action.injuredPersonDet.Id);
                    this._messenger.publish('snackbar', vm);
                    return new incidentInjuredPersonActions.InjuredPersonAddorUpdateCompleteAction(true);
                }).catch((error) => {
                    let body = error.json();
                    if (!isNullOrUndefined(body) && !isNullOrUndefined(body.Code) && body.Code === 5551) {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'About the affected party', 'Access denied,you dont have permissions to log incident.')));
                    }
                    else if (!isNullOrUndefined(body) && !isNullOrUndefined(body.Code) && body.Code === 5552) {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'About the affected party', 'Access denied,you dont have permissions to update incident.')));
                    }
                    else {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'About the affected party', 'Update About the affected party details')));
                    }
                });
        });

    @Effect()
    getInjuredPersonSelectedUserEmployeeDetails$: Observable<Action> = this._actions$.ofType(incidentInjuredPersonActions.ActionTypes.INJURED_PERSON_EMPLOYEE_DETAILS_BY_USER_ID_GET)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('userId', payload);
            params.set('isActive', 'true');
            params.set('isActive2', 'true');

            return this._data.get(`employee/GetEmployeebyUserId`, { search: params })
                .map((res) =>
                    new incidentInjuredPersonActions.InjuredPersonEmpDetailsByUserIdCompleteAction(extractSelectedEmployeeDetailsData(res)));
        });
}