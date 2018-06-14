import { Observable } from 'rxjs/Rx';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as incidentAboutIncidentActions from '../actions/incident-about-injury.actions';
import { ObjectHelper } from './../../../shared/helpers/object-helper';
import { MessengerService } from './../../../shared/services/messenger.service';
import * as errorActions from './../../../shared/actions/error.actions';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';
import { AboutInjury } from './../models/incident-about-injury.model';
import { isNullOrUndefined } from "util";
import { AboutIncident } from "./../models/incident-about-incident";


@Injectable()
export class IncidentAboutIncidentEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _messenger: MessengerService
    ) {

    }

    @Effect()
    addIncidentAboutIncidentDetails$: Observable<Action> = this._actions$.ofType(incidentAboutIncidentActions.ActionTypes.INCIDENT_ABOUT_INCIDENT_DETAILS_ADD)
        .map(toPayload)
        .switchMap((payload: AboutIncident) => {
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Incident', 'About the incident');
            this._messenger.publish('snackbar', vm);
            //saving incident - About the incident details
            return this._data.put(`AboutIncident`, payload)
                .mergeMap((res) => {
                    var incidentId = res.json().Id;
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Incident', 'About the incident');
                    this._messenger.publish('snackbar', vm);
                    return [
                        new incidentAboutIncidentActions.IncidentAboutIncidentDetailsAddCompleteAction(incidentId)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Incident', 'About the incident')));
                })
        })

    @Effect()
    updateIncidentAboutIncidentDetails$: Observable<Action> = this._actions$.ofType(incidentAboutIncidentActions.ActionTypes.INCIDENT_ABOUT_INCIDENT_DETAILS_UPDATE)
        .map(toPayload)
        .switchMap((payload: AboutIncident) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Incident', 'About the incident', payload.Id);
            this._messenger.publish('snackbar', vm);
            //updating incident - About the incident details
            return this._data.post(`AboutIncident`, payload)
                .mergeMap((res) => {
                    var incidentId = res.json().Id;
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Incident', 'About the incident', incidentId);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new incidentAboutIncidentActions.IncidentAboutIncidentDetailsUpdateCompleteAction(res.json())
                    ];
                })
                .catch((error) => {
                    let body = error.json();
                    if (!isNullOrUndefined(body) && !isNullOrUndefined(body.Code) && body.Code === 5552) {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'About the incident', 'Access denied,you dont have permissions to update incident.')));
                    }
                    else {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Incident', 'About the incident', payload.Id)));
                    }
                })
        })

    @Effect()
    getSelectedIncidentAboutIncidentDetails$: Observable<Action> = this._actions$.ofType(incidentAboutIncidentActions.ActionTypes.INCIDENT_ABOUT_INCIDENT_DETAILS_GET)
        .map(toPayload)
        .switchMap((payload) => {

            return this._data.get(`AboutIncident`, { params: { id: payload } })
                .map((res) => <AboutIncident>(res.json()))
                .mergeMap((selectedIncidentAboutIncidentDetails: AboutIncident) => {
                    return [
                        new incidentAboutIncidentActions.IncidentAboutIncidentDetailsGetCompleteAction(selectedIncidentAboutIncidentDetails),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Incident', 'About the incident', payload)));
                })
        })

}