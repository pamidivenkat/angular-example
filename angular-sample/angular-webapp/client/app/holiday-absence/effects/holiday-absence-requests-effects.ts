import { TeamRoster } from './../models/team-roster.model';
import { DateTimeHelper } from './../../shared/helpers/datetime-helper';
import { extractFiscalYearSummary } from '../common/extract-helpers';
import { LoadHolidayAbsenceRequestsEmployeesCompleteAction } from './../actions/holiday-absence-requests.actions';
import { Employee } from './../../employee/models/employee.model';
import { AtlasApiRequestWithParams, AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { ClaimsHelperService } from './../../shared/helpers/claims-helper';
import { SortDirection } from './../../atlas-elements/common/models/ae-sort-model';
import { AbsenceType } from './../common/absence-type.enum';
import { MyAbsenceType, MyAbsence } from './../models/holiday-absence.model';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { RestClientService } from './../../shared/data/rest-client.service';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import * as fromRoot from './../../shared/reducers/index';
import * as holidayAbsenceRequestsActions from './../../holiday-absence/actions/holiday-absence-requests.actions';
import * as yearendprocedureActions from './../../company/yearendprocedures/actions/yearendprocedure-actions';
import { Http, URLSearchParams } from '@angular/http';
import { isNullOrUndefined } from "util";
import { getAtlasParamValueByKey } from "./../../root-module/common/extract-helpers";

import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessengerService } from '../../shared/services/messenger.service';
import * as errorActions from '../../shared/actions/error.actions';
import { StringHelper } from "../../shared/helpers/string-helper";
import { EffectsHelper } from '../../shared/helpers/effects-helper';


@Injectable()
export class HolidayAbsenceRequestsEffects {

    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService
    ) {

    }


    @Effect()
    loadHolidayAbsenceRequests$: Observable<Action> = this._actions$.ofType(holidayAbsenceRequestsActions.ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUESTS)
        .map(EffectsHelper.toActionPayload)
        // .map((action: holidayAbsenceRequestsActions.LoadHolidayAbsenceRequestsAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload.payload
                , _actionType: payload.actionType
                , _savedRequestFromState: state.holidayAbsenceRequestsState.apiRequestWithParams
            };
        })
        .switchMap((data) => {
            let employeeId = getAtlasParamValueByKey(data._payload.Params, 'EmployeeId');

            let params: URLSearchParams = new URLSearchParams();
            if (StringHelper.isNullOrUndefinedOrEmpty(employeeId)) {
                params.set('MyAbsenceIgnoreOngoingRequestsFilter', 'true');
                params.set('filterAbsenceByDeptManagerLevel', this._claimsHelper.getUserId()); //always of logged in userid
            }

            params.set('filterByStatus', getAtlasParamValueByKey(data._payload.Params, 'StatusId'));
            params.set('filterByEmployeeId', employeeId);
            let enddt = getAtlasParamValueByKey(data._payload.Params, 'EndDate');
            let stdt = getAtlasParamValueByKey(data._payload.Params, 'StartDate');
            params.set('filterByStartAndEndDate', stdt + "," + enddt);
            //params.set('filterByEndDate', getAtlasParamValueByKey(data._payload.Params, 'EndDate'));
            params.set('filterByAbsenceType', getAtlasParamValueByKey(data._payload.Params, 'AbsenceType'));
            params.set('filterByAbsenceTypeId', getAtlasParamValueByKey(data._payload.Params, 'AbsenceTypeId'));
            params.set('pageNumber', data._payload.PageNumber.toString());
            params.set('pageSize', data._payload.PageSize.toString());
            params.set('sortField', data._payload.SortBy.SortField);
            params.set('direction', data._payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            return this._data.get('MyAbsence', { search: params });
        })
        .map(res => {
            return new holidayAbsenceRequestsActions.LoadHolidayAbsenceRequestsCompleteAction(<AtlasApiResponse<MyAbsence>>res.json());
        }
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Holiday absence', null)));
        });

    @Effect()
    loadHolidayAbsenceRequestsEmployees$: Observable<Action> = this._actions$.ofType(holidayAbsenceRequestsActions.ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUESTS_EMPLOYEES)
        .map((action: holidayAbsenceRequestsActions.LoadHolidayAbsenceRequestsEmployeesAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _currentEmployee: state.employeeState.EmployeePersonalVM }; })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,FirstName,MiddleName,Surname,UserId,CompanyId');

            params.set('employeesByNameOrEmailFilter', getAtlasParamValueByKey(data._payload.Params, 'SearchedQuery'));
            params.set('employeesByLeaverFilter', '0');
            params.set('pageNumber', data._payload.PageNumber.toString());
            params.set('pageSize', data._payload.PageSize.toString());
            params.set('sortField', data._payload.SortBy.SortField);
            params.set('direction', data._payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');

            return this._data.get('Employee', { search: params })
                .map(res => {
                    return new holidayAbsenceRequestsActions.LoadHolidayAbsenceRequestsEmployeesCompleteAction({ response: <AtlasApiResponse<Employee>>res.json(), currentEmployee: this._claimsHelper.getEmpIdOrDefault() });
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Holiday absence', null)));
                });
        })

   

    @Effect()
    loadHolidayAbsenceRequestsTeamRoster$: Observable<Action> = this._actions$.ofType(holidayAbsenceRequestsActions.ActionTypes.LOAD_HOLIDAY_ABSENCE_REQUEST_TEAM_ROSTER)
        .map((action: holidayAbsenceRequestsActions.LoadHoliayAbsenceRequestTeamRosterAction) => action.payload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('departmentId', getAtlasParamValueByKey(payload.Params, 'departmentId'));
            params.set('managerId', getAtlasParamValueByKey(payload.Params, 'managerId'));
            params.set('startDate', getAtlasParamValueByKey(payload.Params, 'startDate'));
            params.set('endDate', getAtlasParamValueByKey(payload.Params, 'endDate'));
            return this._data.get('MyAbsence/GetEmployeeRosterByDeptId', { search: params });
        })
        .map(res => {
            return new holidayAbsenceRequestsActions.LoadHoliayAbsenceRequestTeamRosterCompleteAction(<TeamRoster[]>res.json());
        })
        .catch((error) => {
            return Observable
                .of(new errorActions
                    .CatchErrorAction(new AtlasApiError(error
                        , MessageEvent.Load
                        , 'Team roster'
                        , null)));
        });

}