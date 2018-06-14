import { EmployeeJobDetails } from './../job/models/job-details.model';
import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { JobHistory } from '../models/job-history';
import { EmployeeFullEntityService } from '../services/employee-fullentity.service';
import { EmergencyContact } from '../models/emergency-contact.model';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { EmployeeContacts, EmployeeEmergencyContacts } from '../models/employee.model';
import {
    extractEmployeeJobDetails
    , extractLastUpdatedUserInfo
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
import {
    LoadSelectedNonWorkingDaysProfileCompleteAction
} from '../../company/nonworkingdaysandbankholidays/actions/nonworkingdays-actions';
import { getNonWorkingDayEntity } from '../../company/nonworkingdaysandbankholidays/common/extract-helpers';
import { isNullOrUndefined } from 'util';
import { StringHelper } from './../../shared/helpers/string-helper';

@Injectable()
export class EmployeeJobDetailsEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _claimsHelper: ClaimsHelperService
        , private _employeeFullEntityService: EmployeeFullEntityService
        , private _messenger: MessengerService
        , private _store: Store<fromRoot.State>
    ) {

    }

    @Effect()
    loadEmployeeJobDetails$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_JOB_LOAD)
        .map(toPayload)
        .switchMap((payload: string) => {
            let empId: string = payload;
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', `Id,Job.JobTitleId,Job.JobTitle.Name as JobTitleName,Job.Department==null?Guid.Empty : Job.Department.Id as DepartmentId,Job.Department==null?"":Job.Department.Name as DepartmentName,Job.Site==null?Guid.Empty : Job.Site.Id as SiteId,Job.Site==null ?"":Job.Site.SiteNameAndPostcode as SiteNameAndPostcode,Job.StartDate,Job.HomeBased,Job.CarryForwardedUnits,Job.ExpiredCarryForwardedUnits,EmployeeNumber,EmploymentTypeId,EmploymentType.Name as EmpTypeName,Job.OtherEmployeeType,Job.HoursAWeek,Job.Days,Job.HolidayUnitType,Job.HolidayEntitlement,Job.ProbationaryPeriod,Job.CarryForwardedUnitType,Job.HolidayWorkingProfileId==null?Guid.Empty:Job.HolidayWorkingProfileId as HolidayWorkingProfileId,Job.HolidayWorkingProfile==null?"":Job.HolidayWorkingProfile.Name as HolidayWorkingProfileName`);
            return this._data.get(`employee/getbyid/${empId}`, { search: params })
                .map((res) => extractEmployeeJobDetails(res))
                .switchMap((employeeJobDetails: EmployeeJobDetails) => {
                    let actionsToDispatch: any[] = [
                        new employeeActions.EmployeeJobLoadCompleteAction(employeeJobDetails)
                    ];
                    if (!isNullOrUndefined(employeeJobDetails) &&
                        (StringHelper.isNullOrUndefinedOrEmpty(employeeJobDetails.HolidayWorkingProfileId) ||
                            employeeJobDetails.HolidayWorkingProfileId == '00000000-0000-0000-0000-000000000000')) {
                        params = new URLSearchParams();
                        params.set('employeeId', empId);
                        params.set('optionalParam', 'false');
                        return this._data.get('HolidayWorkingProfile/GetByEmployee', { search: params })
                            .mergeMap((resp) => {
                                if (!isNullOrUndefined(resp) &&
                                    !isNullOrUndefined(resp.json())) {
                                    let nonWorkingDayProfile = getNonWorkingDayEntity(resp.json());
                                    employeeJobDetails.HolidayWorkingProfileId = nonWorkingDayProfile.Id;
                                    employeeJobDetails.HolidayWorkingProfileName = nonWorkingDayProfile.Name;
                                }
                                return actionsToDispatch;
                            });
                    }
                    return actionsToDispatch;
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Job', null)));
                })
        })

    @Effect()
    updateEmployeeJobDetails$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_JOB_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _empPersonal: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let payload = pl._payload;
            let empName: string = pl._empPersonal.FirstName + ' ' + pl._empPersonal.Surname;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Job', empName, payload.empId);
            this._messenger.publish('snackbar', vm);
            return this._employeeFullEntityService.mergeWithJobDetails(payload.jobDetails, payload.empId)
                .switchMap((data) => {
                    return this._data.post(`employee`, data);
                })
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Job', empName, payload.empId);
                    this._messenger.publish('snackbar', vm);

                    let body = {
                        ModifiedOn: Date.now(),
                        ModifiedFName: this._claimsHelper.getUserFirstName(),
                        ModifiedLName: this._claimsHelper.getUserLastName()
                    };
                    return [
                        new employeeActions.EmployeeJobUpdateCompleteAction(true),
                        new employeeActions.EmployeeJobLoadAction(payload.empId),                        
                        new employeeActions.LoadEmployeeStatCompleteAction(extractLastUpdatedUserInfo(body))  
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Job', empName, payload.empId)));
                })
        })


    @Effect()
    loadEmployeeHolidayWorkingProfile$: Observable<Action> =
    this._actions$.ofType(employeeActions.ActionTypes.LOAD_EMPLOYEE_HOLIDAY_WORKING_PROFILE)
        .map(toPayload)
        .switchMap((employeeId: string) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('employeeId', employeeId);
            params.set('optionalParam', 'false');
            return this._data.get(`HolidayWorkingProfile/GetByEmployee`, { search: params })
                .map((res) => {
                    return new employeeActions.LoadEmployeeHolidayWorkingProfileCompleteAction(res.json())
                }
                )
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'HolidayWorkingProfile', null)));
                })
        })
}