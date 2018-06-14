import {
    AtlasApiResponse
    , AtlasApiRequestWithParams
    , AtlasParams
} from './../../../shared/models/atlas-api-response';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from './../../../shared/reducers/index';
import * as incidentRIDDORActions from '../actions/incident-riddor.actions';
import { StringHelper } from './../../../shared/helpers/string-helper';
import { ObjectHelper } from './../../../shared/helpers/object-helper';
import { MessengerService } from './../../../shared/services/messenger.service';
import * as errorActions from './../../../shared/actions/error.actions';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { extractRIDDOR } from '../common/extract-helpers';
import { isNullOrUndefined } from 'util';
import { IncidentRIDDOR } from '../models/incident-riddor.model';

@Injectable()
export class IncidentRIDDOREffects {
    @Effect()
    getRIDDORData$: Observable<Action> = this._actions$.ofType(incidentRIDDORActions.ActionTypes.LOAD_RIDDOR)
        .map(toPayload)
        .switchMap((incidentId) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('Id', incidentId);
            return this._data.get(`IncidentReportedTo`, { search: params })
                .map((res) => {
                    let data = res.json();
                    if (isNullOrUndefined(data)) {
                        data = new IncidentRIDDOR();
                    }
                    return new incidentRIDDORActions.LoadIncidentRIDDORCompleteAction(data);
                });
        });

    @Effect()
    addOrUpdateIncidentReportedTo$: Observable<Action> = this._actions$.ofType(incidentRIDDORActions.ActionTypes.SAVE_RIDDOR)
        .map(toPayload)
        .switchMap((inputModel) => {
            let vm;
            if (inputModel.isEdit) {
                vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Incident', 'RIDDOR', inputModel.RIDDOR.Id);
            } else {
                vm = ObjectHelper.createInsertInProgressSnackbarMessage('Incident', 'RIDDOR');
            }
            this._messenger.publish('snackbar', vm);
            return (inputModel.isEdit ?
                this._data.post(`IncidentReportedTo`, inputModel.RIDDOR) :
                this._data.put(`IncidentReportedTo`, inputModel.RIDDOR))
                .map((res) => {
                    if (inputModel.isEdit) {
                        vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Incident', 'RIDDOR', inputModel.RIDDOR.Id);
                    } else {
                        vm = ObjectHelper.createInsertCompleteSnackbarMessage('Incident', 'RIDDOR');
                    }
                    this._messenger.publish('snackbar', vm);
                    return new incidentRIDDORActions.SaveRIDDORCompleteAction(res.json());
                }).catch((error) => {
                    let body = error.json();
                    if (!isNullOrUndefined(body) && !isNullOrUndefined(body.Code) && body.Code === 5551) {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'RIDDOR', 'Access denied,you dont have permissions to log incident.')));
                    }
                    else if (!isNullOrUndefined(body) && !isNullOrUndefined(body.Code) && body.Code === 5552) {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'RIDDOR', 'Access denied,you dont have permissions to update incident.')));
                    }
                    else {
                        return Observable.of(
                            new errorActions.CatchErrorAction(
                                new AtlasApiError(error
                                    , MessageEvent.Update
                                    , 'Incident'
                                    , 'save incident riddor')));
                    }
                });
        });

    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _claimsHelper: ClaimsHelperService
        , private _store: Store<fromRoot.State>
        , private _messenger: MessengerService
    ) {

    }
}
