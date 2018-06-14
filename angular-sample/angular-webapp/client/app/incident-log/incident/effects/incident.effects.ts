import { isNullOrUndefined } from 'util';
import { AtlasApiResponse, AtlasApiRequestWithParams, AtlasParams } from './../../../shared/models/atlas-api-response';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from './../../../shared/reducers/index';
import * as incidentActions from '../actions/incident.actions';
import { StringHelper } from './../../../shared/helpers/string-helper';
import { ObjectHelper } from './../../../shared/helpers/object-helper';
import { MessengerService } from './../../../shared/services/messenger.service';
import * as errorActions from './../../../shared/actions/error.actions';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';
import { IncidentReportedBy } from './../models/incident-reported-by.model';
import { Incident } from './../models/incident.model';
import { Address } from './../../../employee/models/employee.model';
import { Site } from './../../../company/sites/models/site.model';
import { extractHeadOfficeSiteData, extractSelectedUserEmployeeData, extractSelectedIncidentReportedByData } from './../common/extract-helpers';
import { EmployeeFullEntity } from './../../../employee/models/employee-full.model';

@Injectable()
export class IncidentEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _claimsHelper: ClaimsHelperService
        , private _store: Store<fromRoot.State>
        , private _messenger: MessengerService
    ) {

    }

    @Effect()
    getCompanyAddressDetails$: Observable<Action> = this._actions$.ofType(incidentActions.ActionTypes.INCIDENT_COMPANY_ADDRESS_DETAILS_GET)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('p1', 'site');
            params.set('p2', 'site');
            return this._data.get(`Site/GetHeadOfficeSites`, { search: params })

                .map((res) => extractHeadOfficeSiteData(res))
                .mergeMap((headOfficeSiteData: Site) => {
                    return [
                        new incidentActions.IncidentCompanyAddressDetailsGetCompleteAction(headOfficeSiteData),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Site', 'Head Office Site')));
                })
        })

    @Effect()
    getSelectedUserEmployeeDetails$: Observable<Action> = this._actions$.ofType(incidentActions.ActionTypes.INCIDENT_EMPLOYEE_DETAILS_BY_USER_ID_GET)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('filterAddressByUserId', payload);
            return this._data.get(`address`, { search: params })
                .map((res) => extractSelectedUserEmployeeData(res))
                .mergeMap((selectedUserEmpDetails: Address) => {
                    return [
                        new incidentActions.IncidentEmployeeDetailsByUserIdGetCompleteAction(selectedUserEmpDetails),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Site', 'Head Office Site')));
                })
        })

    @Effect()
    addIncidentAboutYouDetails$: Observable<Action> = this._actions$.ofType(incidentActions.ActionTypes.INCIDENT_ABOUT_YOU_DETAILS_ADD)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: IncidentReportedBy, state) => { return { payload: payload }; })
        .switchMap((pl) => {
            let payload = pl.payload;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Incident', 'Person reporting');
            this._messenger.publish('snackbar', vm);
            //saving incident details
            let newIncident = new Incident();
            newIncident.StatusId = 1;
            newIncident.IncidentReportedBy = null;
            return this._data.put(`Incident`, newIncident)
                .mergeMap((res) => {
                    let newIncidentReportedBy = payload;
                    newIncidentReportedBy.Id = res.json().Id;
                    if (newIncidentReportedBy.AddressId != null) {
                        newIncidentReportedBy.Address = null;
                        //saving incident-reported-by details with old/selected user address
                        return this._data.put(`IncidentReportedBy`, newIncidentReportedBy)
                            .mergeMap((res) => {
                                var newIncidentReportedById = res.json().Id;
                                vm = ObjectHelper.createInsertCompleteSnackbarMessage('Incident', 'Person reporting');
                                this._messenger.publish('snackbar', vm);
                                return [
                                    new incidentActions.IncidentAboutYouDetailsAddCompleteAction(newIncidentReportedById)
                                ];
                            })
                    }
                    else {
                        //saving address details
                        return this._data.put(`Address`, payload.Address)
                            .mergeMap((res) => {
                                var newAddressId = res.json().Id;
                                newIncidentReportedBy.AddressId = newAddressId;
                                newIncidentReportedBy.Address = null;
                                //saving incident-reported-by details with new address
                                return this._data.put(`IncidentReportedBy`, newIncidentReportedBy)
                                    .mergeMap((res) => {
                                        var newIncidentReportedById = res.json().Id;
                                        let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Incident', 'Person reporting');
                                        this._messenger.publish('snackbar', vm);
                                        return [
                                            new incidentActions.IncidentAboutYouDetailsAddCompleteAction(newIncidentReportedById)
                                        ];
                                    })
                            })
                    }
                })
                .catch((error) => {
                    let body = error.json();
                    if (!isNullOrUndefined(body) && !isNullOrUndefined(body.Code) && body.Code === 5551) {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Incident', 'Access denied,you dont have permissions to log incident.')));
                    }
                    else {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'IncidentReportedBy', 'Add IncidentReportedBy')));
                    }
                });

        })

    @Effect()
    updateIncidentAboutYouDetails$: Observable<Action> = this._actions$.ofType(incidentActions.ActionTypes.INCIDENT_ABOUT_YOU_DETAILS_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: IncidentReportedBy, state) => { return { payload: payload }; })
        .switchMap((pl) => {
            let payload = pl.payload;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Incident', 'Person reporting', payload.Id);
            this._messenger.publish('snackbar', vm);

            if (payload.AddressId != null) {
                payload.Address = null;
                //updating incident-reported-by details with old/selected user address
                return this._data.post(`IncidentReportedBy`, payload)
                    .mergeMap((res) => {
                        var incidentReportedById = res.json().Id;
                        vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Incident', 'Person reporting', incidentReportedById);
                        this._messenger.publish('snackbar', vm);
                        return [
                            new incidentActions.IncidentAboutYouDetailsUpdateCompleteAction(incidentReportedById)
                        ];
                    })
            }
            else {
                //saving address details
                return this._data.put(`Address`, payload.Address)
                    .mergeMap((res) => {
                        var newAddressId = res.json().Id;
                        payload.AddressId = newAddressId;
                        payload.Address = null;
                        //updating incident-reported-by details with new address
                        return this._data.post(`IncidentReportedBy`, payload)
                            .mergeMap((res) => {
                                var incidentReportedById = res.json().Id;
                                vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Incident', 'Person reporting', incidentReportedById);
                                this._messenger.publish('snackbar', vm);
                                return [
                                    new incidentActions.IncidentAboutYouDetailsUpdateCompleteAction(incidentReportedById)
                                ];
                            })
                    })
            }
        })
        .catch((error) => {
            let body = error.json();
            if (!isNullOrUndefined(body) && !isNullOrUndefined(body.Code) && body.Code === 5552) {
                return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Incident', 'Access denied,you dont have permissions to update incident.')));
            }
            else {
                return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'IncidentReportedBy', 'Update IncidentReportedBy')));
            }
        })

    @Effect()
    getSelectedIncidentReportedByDetails$: Observable<Action> = this._actions$.ofType(incidentActions.ActionTypes.INCIDENT_ABOUT_YOU_DETAILS_GET)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', payload);
            return this._data.get(`IncidentReportedBy`, { search: params })
                .map((res) => extractSelectedIncidentReportedByData(res))
                .mergeMap((selectedIncidentReportedByDetails: IncidentReportedBy) => {
                    return [
                        new incidentActions.IncidentAboutYouDetailsGetCompleteAction(selectedIncidentReportedByDetails),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Site', 'Head Office Site')));
                })
        })

}