import { EmployeeStatType } from '../models/employee-stat';
import { State } from '../../shared/reducers';
import { isNullOrUndefined } from 'util';
import { EmployeeFullEntity } from '../models/employee-full.model';
import { Employee } from '../models/employee.model';
import {
    extractEmployeeInformation,
    extractEmployeePersonalData,
    extractEmployeeSalarySelectOptionListData,
    mergeEmployeePersonal,
    extractLastUpdatedUserInfo
} from '../common/extract-helpers';

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
import { ClaimsHelperService } from "../../shared/helpers/claims-helper";
import { EmployeeBenefitSaveCompleteAction } from "../actions/employee.actions";


@Injectable()
export class EmployeeEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _messenger: MessengerService
        , private _claimsService: ClaimsHelperService
    ) {

    }

    @Effect()
    loadEmployeeDetails$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let empId: string = payload.EmployeeId;
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', `Id,FirstName,MiddleName,Surname,PictureId,Title,KnownAs,Gender,PreviousName,DOB,EthnicGroup==null?"":EthnicGroup.EthnicGroupValue.Name as EthnicGroupValueName,EthnicGroup==null?"":EthnicGroup.Name as EthnicGroupName, EthnicGroup == null? Guid.Empty:EthnicGroup.EthnicGroupValueId as EthnicGroupValueId,EthnicGroup==null?-1:EthnicGroup.EthnicGroupValueType as EthnicGroupValueType,Nationality,EmployeePayrollDetails==null?"":EmployeePayrollDetails.TaxCode as TaxCode,EmployeePayrollDetails==null?"":EmployeePayrollDetails.NINumber as NINumber,EmployeePayrollDetails==null?"":EmployeePayrollDetails.PensionScheme as PensionScheme,EmployeePayrollDetails==null?Guid.Empty:EmployeePayrollDetails.CompanyId as CompanyId,EmployeePayrollDetails==null?Guid.Empty:EmployeePayrollDetails.EmployeeId as EmployeeId,EmployeePayrollDetails==null?Guid.Empty:EmployeePayrollDetails.Id as empPayId,Email,HasEmail,Job.JobTitle.Name as JobTitle,Job.StartDate,Address.MobilePhone,UserId,IsLeaver,ModifiedOn,Modifier.FirstName as ModifiedFName,Modifier.LastName as ModifiedLName`);

            return this._data.get(`employee/getbyid/${empId}`, { search: params })
                .mergeMap((res) => {

                    return [
                        new employeeActions.EmployeeInformationLoadCompleteAction(extractEmployeeInformation(res)),
                        new employeeActions.EmployeePersonalLoadCompleteAction(extractEmployeePersonalData(res)),
                        new employeeActions.EmployeeLoadCompleteAction(true),
                        new employeeActions.LoadEmployeeStatCompleteAction(extractLastUpdatedUserInfo(res.json()))
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee', null)));
                })
        });


    @Effect()
    loadEmployeeStat$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.LOAD_EMPLOYEE_STAT)
        .map(toPayload)
        .switchMap((payload) => {
            let empId: string = payload.EmployeeId;
            let stat: EmployeeStatType = <EmployeeStatType>payload.statType;
            let params: URLSearchParams = new URLSearchParams();
            params.set('employeeId', empId);
            params.set('statType', stat.toString());
            return this._data.get(`employee`, { search: params })
                .mergeMap((res) => {
                    return [
                        new employeeActions.LoadEmployeeStatCompleteAction({ response: res.json(), statType: stat })
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee last updated', empId)));
                })
        });

    @Effect()
    saveEmployeProfilePic$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_PROFILE_PIC_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: string, state) => { return { _payload: payload, _empPersonal: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let empId: string = pl._empPersonal.Id;
            let params: URLSearchParams = new URLSearchParams();
            params.set('employeeId', empId);
            params.set('documentId', pl._payload);
            let empName: string = pl._empPersonal.FirstName + ' ' + pl._empPersonal.Surname;
            //let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Employee profile picture', empName, empId);
            //this._messenger.publish('snackbar', vm);
            return this._data.post(`employee/UpdateEmployeeProfilePicture`, null, { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Profile picture uploaded successfully.');
                    this._messenger.publish('snackbar', vm);

                    let body = {
                        ModifiedOn: Date.now(),
                        ModifiedFName: this._claimsService.getUserFirstName(),
                        ModifiedLName: this._claimsService.getUserLastName()
                    };
                    return [
                        new employeeActions.EmployeeLoadCompleteAction(true),
                        new employeeActions.LoadEmployeeStatCompleteAction(extractLastUpdatedUserInfo(body))
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Employee profile picture', empId)));
                })
        });
}

