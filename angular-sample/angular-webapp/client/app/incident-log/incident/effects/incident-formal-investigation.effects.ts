import { Observable } from 'rxjs/Rx';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as incidentFormalInvestigationActions from '../actions/incident-formal-investigation.actions';
import { ObjectHelper } from './../../../shared/helpers/object-helper';
import { MessengerService } from './../../../shared/services/messenger.service';
import * as errorActions from './../../../shared/actions/error.actions';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';
import { Incident } from './../models/incident.model';
import { IncidentLoadApplicableSectionsCompleteAction, IncidentLoadApplicableSectionsAction, LoadRiskAssessmentsCompleteAction, LoadMethodStatementsCompleteAction } from "../actions/incident-formal-investigation.actions";
import { RiskAssessmentStatus } from "./../../../risk-assessment/common/risk-assessment-status.enum";
import { RiskAssessment } from "./../../../risk-assessment/models/risk-assessment";
import { ConstructionPhasePlan } from "./../../../construction-phase-plans/models/construction-phase-plans";


@Injectable()
export class IncidentFormalInvestigationEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _messenger: MessengerService
    ) {

    }

    @Effect()
    updateIncidentDetails$: Observable<Action> = this._actions$.ofType(incidentFormalInvestigationActions.ActionTypes.INCIDENT_DETAILS_UPDATE)
        .map(toPayload)
        .switchMap((payload: Incident) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Incident', payload.ReferenceNumber, payload.Id);
            this._messenger.publish('snackbar', vm);

            //updating incident details
            return this._data.post(`Incident`, payload)
                .mergeMap((res) => {
                    var incidentId = res.json().Id;
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Incident', payload.ReferenceNumber, payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new incidentFormalInvestigationActions.IncidentDetailsUpdateCompleteAction(incidentId)
                    ];
                })
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Incident', 'Update Incident Details')));
        })

    @Effect()
    getSelectedIncidentDetails$: Observable<Action> = this._actions$.ofType(incidentFormalInvestigationActions.ActionTypes.INCIDENT_FORMAL_INV_DETAILS_GET)
        .map(toPayload)
        .switchMap((payload) => {

            return this._data.get(`Incident`, { params: { id: payload } })
                .map((res) => <Incident>(res.json()))
                .mergeMap((selectedIncidentDetails: Incident) => {
                    return [
                        new incidentFormalInvestigationActions.IncidentDetailsGetCompleteAction(selectedIncidentDetails),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Incident', 'Get Incident Details')));
                })
        })
    @Effect()
    loadApplicableSections$: Observable<Action> = this._actions$.ofType(incidentFormalInvestigationActions.ActionTypes.INCIDENT_FORMAL_INV_LOAD_APPLICABLE_SECTIONS)
        .map(toPayload)
        .switchMap((payload) => {
            return this._data.get(`invsection`, { params: { incidentId: payload } })
                .map((res) => {
                    return new IncidentLoadApplicableSectionsCompleteAction(res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'InvSection', 'Incident Sections')));
                })
        });

    @Effect()
    updateIncidentSections$: Observable<Action> = this._actions$.ofType(incidentFormalInvestigationActions.ActionTypes.INCIDENT_FORMAL_INV_UPDATE_SECTIONS)
        .map(toPayload)
        .switchMap((payload) => {
            return this._data.post(`InvAnswer`, payload.data, { params: { investigations: true, action: 'SaveInvestigations' } })
                .map((res) => {
                    return new IncidentLoadApplicableSectionsAction(payload.incidentId);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Incident', 'Update Incident Details')));
                })
        });

    @Effect()
    loadRiskAssessments$: Observable<Action> = this._actions$.ofType(incidentFormalInvestigationActions.ActionTypes.LOAD_RISK_ASSESSMENTS)
        .map(toPayload)
        .switchMap((payload) => {
            return this._data.get(`RiskAssessment`, { params: { statusRAFilter: RiskAssessmentStatus.Live } })
                .map((res) => {
                    return new LoadRiskAssessmentsCompleteAction(<Array<RiskAssessment>>res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'RiskAssessment', 'Risk Assessments')));
                })
        });
    @Effect()
    loadMethodStatements$: Observable<Action> = this._actions$.ofType(incidentFormalInvestigationActions.ActionTypes.LOAD_METHOD_STATEMENTS)
        .map(toPayload)
        .switchMap((payload) => {
            return this._data.get(`ConstructionPhasePlan`, { params: { statusCPPFilter: RiskAssessmentStatus.Live } })
                .map((res) => {
                    return new LoadMethodStatementsCompleteAction(<Array<ConstructionPhasePlan>>res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'ConstructionPhasePlan', 'ConstructionPhasePlan')));
                })
        });
}