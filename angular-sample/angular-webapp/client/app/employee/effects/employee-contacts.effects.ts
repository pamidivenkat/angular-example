import { getEmployeePersonalData } from './../../shared/reducers/index';
import { EmployeeFullEntity } from './../models/employee-full.model';
import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequest } from './../../shared/models/atlas-api-response';
import { EmployeeFullEntityService } from '../services/employee-fullentity.service';
import { EmergencyContact } from '../models/emergency-contact.model';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { EmployeeContacts, EmployeeEmergencyContacts } from '../models/employee.model';
import {
    extractCountyData,
    extractEmployeeContactsData,
    extractEmployeeContactsWithAddressData,
    extractEmployeeEmergencyContactsData,
    mapEmployeeEmergencyContacts,
    extractLastUpdatedUserInfo
} from '../common/extract-helpers';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as employeeActions from '../actions/employee.actions';

import { ObjectHelper } from './../../shared/helpers/object-helper';
import { MessengerService } from './../../shared/services/messenger.service';
import * as errorActions from './../../shared/actions/error.actions';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';


@Injectable()
export class EmployeeContactsEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _employeeFullEntityService: EmployeeFullEntityService
        , private _messenger: MessengerService
    ) {

    }

    @Effect()
    loadEmployeeContactsDetails$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_CONTACTS_LOAD)
        .map(toPayload)
        .switchMap((payload: string) => {
            let empId: string = payload; //Here Id is the employeeid
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', `Id,CompanyId,PersonalEmail,Email,Address.MobilePhone,Address.AddressLine1,Address.AddressLine2,Address.AddressLine3,Address.Town,Address.CountyId,Address.County.Name as CountyName,Address.CountryId,Address.Country.Name as CountryName,Address.Postcode,Address.HomePhone,Address.FullAddress`);

            return this._data.get(`employee/getbyid/${empId}`, { search: params })
                .map((res) => extractEmployeeContactsData(res))
                .mergeMap((employeeContacts: EmployeeContacts) => {
                    return [
                        new employeeActions.EmployeeContactsLoadCompleteAction(employeeContacts)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee', null)));
                })
        });

    @Effect()
    employeeContactsUpdate$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_CONTACTS_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _empPersonal: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let payload: EmployeeContacts = pl._payload;
            let empId: string = payload.Id;
            let empName: string = pl._empPersonal.FirstName + ' ' + pl._empPersonal.Surname;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Contact', empName, empId);
            this._messenger.publish('snackbar', vm);
            return this._employeeFullEntityService.mergeContactData(payload, empId)
                .switchMap((data) => {
                    return this._data.post(`employee`, data)
                        .mergeMap((res) => {
                            let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Contact', empName, empId);
                            this._messenger.publish('snackbar', vm);
                            this._employeeFullEntityService.updateData(res.json());
                            this._employeeFullEntityService.updateData(res.json());
                            let updatedData = extractEmployeeContactsWithAddressData(res);
                            updatedData.CountryName = payload.CountryName;
                            updatedData.CountyName = payload.CountyName;

                            let body = {
                                ModifiedOn: Date.now(),
                                ModifiedFName: this._claimsHelper.getUserFirstName(),
                                ModifiedLName: this._claimsHelper.getUserLastName()
                            };
                            return [
                                new employeeActions.EmployeeContactsUpdateCompleteAction(true),
                                new employeeActions.EmployeeContactsLoadCompleteAction(updatedData),                        
                                new employeeActions.LoadEmployeeStatCompleteAction(extractLastUpdatedUserInfo(body))  
                            ];
                        })
                        .catch((error) => {
                            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Contact', empName, empId)));
                        })
                })
        })

    @Effect()
    emergencyConatcts$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            let apiRequest: AtlasApiRequest = payload.apiRequest;
            params.set('fields', `Id,Name,EmployeeRelation.Name as EmployeeRelationName, EmployeeRelationId,Town,Email,MobilePhone,EmployeeId,IsPrimary`);
            params.set('ContactByEmployeeIdFilter', payload.EmployeeId)
            params.set('pagenumber', apiRequest.PageNumber.toString());
            params.set('pagesize', apiRequest.PageSize.toString());
            params.set('SortField', apiRequest.SortBy.SortField);
            params.set('Direction', apiRequest.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            return this._data.get(`EmergencyContact/getspecificfields`, { search: params })
                .map((res) => new employeeActions.EmployeeEmergencyContactsLoadCompleteAction(<AtlasApiResponse<EmergencyContact>>res.json()))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Contacts', null)));
                })
        })

    @Effect()
    employeeEmergencyContactCreate$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_CREATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _empPersonal: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let payload: EmployeeEmergencyContacts = pl._payload;
            let empId: string = pl._empPersonal.Id;
            let empName: string = pl._empPersonal.FirstName + ' ' + pl._empPersonal.Surname;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Emergency contact', empName);
            this._messenger.publish('snackbar', vm);
            return this._data.put(`EmergencyContact`, payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Emergency contact', empName);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new employeeActions.EmployeeEmergencyContactsCreateCompleteAction(true),
                        new employeeActions.EmployeeEmergencyContactsLoadAction({ EmployeeId: empId, apiRequest: new AtlasApiRequest(1, 10, "Name", SortDirection.Ascending) })
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Emergency contact', null)));
                })
        })

    @Effect()
    employeeEmergencyContactUpdate$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _empPersonal: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let payload: EmployeeEmergencyContacts = pl._payload;
            let empId: string = payload.EmployeeId;
            let empName: string = pl._empPersonal.FirstName + ' ' + pl._empPersonal.Surname;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Emergency contact', empName, empId);
            this._messenger.publish('snackbar', vm);
            return this._data.post(`EmergencyContact`, payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Emergency contact', empName, empId);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new employeeActions.EmployeeEmergencyContactsUpdateCompleteAction(true),
                        new employeeActions.EmployeeEmergencyContactsLoadAction({ EmployeeId: empId, apiRequest: new AtlasApiRequest(1, 10, "Name", SortDirection.Ascending) })
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Emergency contact', empName, empId)));
                })
        })

    @Effect()
    employeeEmergencyContactDelete$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_DELETE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _empPersonal: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let payload: EmergencyContact = pl._payload;
            let empEmergencyContactId: string = payload.Id;
            let employeeId = payload.EmployeeId;
            let empName: string = pl._empPersonal.FirstName + ' ' + pl._empPersonal.Surname;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Emergency contact', empName, employeeId);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`EmergencyContact/${empEmergencyContactId}`)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Emergency contact', empName, employeeId);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new employeeActions.EmployeeEmergencyContactsDeleteCompleteAction(true),
                        new employeeActions.EmployeeEmergencyContactsLoadAction({ EmployeeId: employeeId, apiRequest: new AtlasApiRequest(1, 10, "Name", SortDirection.Ascending) }),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Emergency contact', empName, employeeId)));
                })
        })

    @Effect()
    loadEmployeeEmergencyContactsDetails$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_GET)
        .map(toPayload)
        .switchMap((payload) => {
            let empEmergencyContactId: string = payload.EmployeeEmergencyContactId;
            let params: URLSearchParams = new URLSearchParams();
            params.set('Id', empEmergencyContactId);

            return this._data.get(`EmergencyContact/Getbyid`, { search: params })

                .map((res) => extractEmployeeEmergencyContactsData(res))
                .mergeMap((employeeEmergencyContacts: EmployeeEmergencyContacts) => {
                    return [
                        new employeeActions.EmployeeEmergencyContactsGetCompleteAction(employeeEmergencyContacts),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Emergency contact', null)));
                })
        })

}