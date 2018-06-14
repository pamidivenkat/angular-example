import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import * as fromRoot from '../../../shared/reducers/index';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { ObjectHelper } from './../../../shared/helpers/object-helper';
import { MessengerService } from './../../../shared/services/messenger.service';
import * as errorActions from './../../../shared/actions/error.actions';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import * as yepActions from './../actions/yearendprocedure-actions';
import { emptyGuid } from './../../../shared/app.constants';
import {
    extractYearEndProcedureData
    , extractYearEndProcedureResultList
    , extractYearEndProcedureResult
    , extractEmployeesFromYEPResults
} from './../common/extract-helpers';
import { AtlasApiRequestWithParams, AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { SortDirection } from './../../../atlas-elements/common/models/ae-sort-model';
import { getAtlasParamValueByKey } from './../../../root-module/common/extract-helpers';
import {
    YearEndProcedureModel
    , YearEndProcedureResultModel,
    YearEndProcedureStatus
} from './../models/yearendprocedure-model';
import { isNullOrUndefined } from 'util';
import { DateTimeHelper } from './../../../shared/helpers/datetime-helper';
import { MyAbsence } from './../../../holiday-absence/models/holiday-absence.model';

@Injectable()
export class YearEndProcedureEffects {
    private _objectType = 'Year end procedure';

    @Effect()
    loadPendingHolidayAbsenceRequests$: Observable<Action>
    = this._actions$.ofType(yepActions.ActionTypes.LOAD_PENDING_HOLIDAY_ABSENCE_REQUESTS)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _yepState: state.yearEndProcedureState
            };
        })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('MyAbsenceIgnoreOngoingRequestsFilter', 'true');
            params.set('filterAbsenceByYearEndProcedure', 'true');
            params.set('filterByStatus', getAtlasParamValueByKey(data._payload.Params, 'StatusId'));
            params.set('filterByStartDate', getAtlasParamValueByKey(data._payload.Params, 'StartDate'));
            params.set('filterByEndDate', getAtlasParamValueByKey(data._payload.Params, 'EndDate'));
            params.set('pageNumber', data._payload.PageNumber.toString());
            params.set('pageSize', data._payload.PageSize.toString());
            params.set('sortField', data._payload.SortBy.SortField);
            params.set('direction', data._payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            return this._data.get('MyAbsence', { search: params })
                .mergeMap((res) => {
                    let pagingInfo = data._yepState.PendingRequestsPagingInfo;
                    let body = res.json();
                    if (!isNullOrUndefined(pagingInfo)) {
                        if (body.PagingInfo.PageNumber === 1) {
                                pagingInfo.TotalCount = body.PagingInfo.TotalCount;
                        }
                        pagingInfo.Count = body.PagingInfo.Count;
                        pagingInfo.PageNumber = body.PagingInfo.PageNumber;
                    } else {
                        pagingInfo = body.PagingInfo;
                    }
                    return [
                        new yepActions.LoadHolidayAbsenceRequestsCompleteAction(<AtlasApiResponse<MyAbsence>>res.json()),
                        new yepActions.UpdateHolidayAbsenceRequestsPagingInfoAction(pagingInfo)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error
                        , MessageEvent.Load
                        , this._objectType
                        , null)));
                });
        });

    @Effect()
    loadYearEndProcedureData$: Observable<Action> = this._actions$.ofType(yepActions.ActionTypes.LOAD_YEAR_END_PROCEDURE_DATA)
        .switchMap(() => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', emptyGuid);
            return this._data.get(`YearEndProcedure`, { search: params });
        })
        .map((res) => new yepActions.LoadYearEndProcedureDataCompleteAction(extractYearEndProcedureData(res)))
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    @Effect()
    loadYearEndProcedureResults$: Observable<Action> = this._actions$.ofType(yepActions.ActionTypes.LOAD_YEAR_END_PROCEDURE_RESULTS)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _yepState: state.yearEndProcedureState
            };
        })
        .switchMap((data) => {
            let inputData = data._payload;
            let params: URLSearchParams = new URLSearchParams();
            params.set('YearEndResultsByProcedureId', getAtlasParamValueByKey(inputData.Params, 'YearEndProcedureId'));
            params.set('fields',
                `Id,CompanyId,Employee.FirstName, Employee.Surname,Job.Department.Name as DepartmentName,Job.StartDate,
            YearEndProcedureId,UtilizedHolidayUnits,UtilizedHolidayUnitType,ReviewedHolidayEntitlement,ReviewedHolidayUnitType,
            ReviewedCarryForwardedUnits,CarryForwardedUnitType,CarryForwardedUnits,Job.HolidayEntitlement,Job.HolidayUnitType,
            EmployeeId,JobId,ModifiedOn`);
            params.set('pageNumber', inputData.PageNumber.toString());
            params.set('pageSize', inputData.PageSize.toString());
            params.set('sortField', inputData.SortBy.SortField);
            params.set('direction', inputData.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            return this._data.get(`YearEndProcedureResults/GetSpecificFields`, { search: params })
                .mergeMap((res) => {
                    let pagingInfo = data._yepState.YearEndResultsPagingInfo;
                    let body = res.json();
                    if (!isNullOrUndefined(pagingInfo)) {
                        if (body.PagingInfo.PageNumber === 1) {
                            pagingInfo.TotalCount = body.PagingInfo.TotalCount;
                        }
                        pagingInfo.Count = body.PagingInfo.Count;
                        pagingInfo.PageSize = body.PagingInfo.Count;
                        pagingInfo.PageNumber = body.PagingInfo.PageNumber;
                    } else {
                        pagingInfo = body.PagingInfo;
                        pagingInfo.PageSize = body.PagingInfo.Count;
                    }
                    return [
                        new yepActions.LoadYearEndProcedureResultsCompleteAction(extractYearEndProcedureResultList(res)),
                        new yepActions.UpdateYearEndProcedureResultsPagingAction(pagingInfo)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error
                        , MessageEvent.Load
                        , this._objectType
                        , null)));
                });
        });

    @Effect()
    updateYearEndProcedure$: Observable<Action> = this._actions$.ofType(yepActions.ActionTypes.UPDATE_YEAR_END_PROCEDURE)
        .map(toPayload)
        .switchMap((inputData: YearEndProcedureModel) => {
            let startDateText = DateTimeHelper.formatDate(inputData.FiscalYearData.StartDate, false);
            let endDateText = DateTimeHelper.formatDate(inputData.FiscalYearData.EndDate, false);

            let runText = '';
            if (inputData.Status === YearEndProcedureStatus.NotStarted) {
                runText = 'Running';
            } else {
                runText = 'Re-running';
            }

            let vm = ObjectHelper
                .operationInProgressSnackbarMessage(
                `${runText} the year end procedure for the holiday year ${startDateText} to ${endDateText}..`);
            this._messenger.publish('snackbar', vm);

            let params: URLSearchParams = new URLSearchParams();
            params.set('run', 'true');
            return this._data.post(`YearEndProcedure/Run`, null, { search: params })
                .mergeMap((res) => {
                    let yepModel = extractYearEndProcedureData(res);
                    if (yepModel.Status === YearEndProcedureStatus.Error) {
                        vm = ObjectHelper
                            .operationFailedSnackbarMessage(
                            'The year end procedure encountered some error , you can try re-run or contact atlas support.');
                        this._messenger.publish('snackbar', vm);
                    } else {
                        vm = ObjectHelper
                            .operationCompleteSnackbarMessage(
                            `The year end procedure process is in progress for the holiday year ${startDateText} to ${endDateText}.`);
                        this._messenger.publish('snackbar', vm);
                    }
                    yepModel.Status = YearEndProcedureStatus.InProgress;
                    return [
                        new yepActions.LoadYearEndProcedureDataCompleteAction(yepModel),
                        new yepActions.ClearYearEndProcedureResultsAction(true),
                        new yepActions.ClearEmployeesWithZeroEntitlementAction(true)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error, MessageEvent.Update, this._objectType, null)));
                });
        });

    @Effect()
    reviewYearEndProcedure$: Observable<Action> = this._actions$.ofType(yepActions.ActionTypes.UPDATE_YEAR_END_PROCEDURE_REVIEW_CONFIRM)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _yepState: state.yearEndProcedureState
            };
        })
        .switchMap((data) => {
            let vm = ObjectHelper
                .operationInProgressSnackbarMessage('Confirming the year end procedure review..');
            this._messenger.publish('snackbar', vm);

            let yearEndProcedureId = data._payload;
            let params: URLSearchParams = new URLSearchParams();
            params.set('yearEndProcedureId', yearEndProcedureId);
            return this._data.post(`YearEndProcedure/ReviewConfirmed`, null, { search: params })
                .map((res) => {
                    vm = ObjectHelper
                        .operationCompleteSnackbarMessage('The year end procedure review confirmed successfully.');
                    this._messenger.publish('snackbar', vm);

                    let yepModel = Object.assign({}
                        , data._yepState.YearEndProcedureData
                        , { Status: YearEndProcedureStatus.ReviewConfirmed });
                    return new yepActions.LoadYearEndProcedureDataCompleteAction(yepModel);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error, MessageEvent.Update, this._objectType, null)));
                });
        });


    @Effect()
    updateYearEndProcedureResults$: Observable<Action> =
    this._actions$.ofType(yepActions.ActionTypes.UPDATE_YEAR_END_PROCEDURE_RESULTS_AUTO_SAVE)
        .map(toPayload)
        .switchMap((inputData: YearEndProcedureResultModel) => {
            return this._data.post(`YearEndProcedureResults`, inputData);
        })
        .map((res) => new yepActions.UpdateYearEndProcedureResultsCompleteAction(extractYearEndProcedureResult(res)))
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, this._objectType, null)));
        });

    @Effect()
    employeesWithZeroEntitlement$: Observable<Action> =
    this._actions$.ofType(yepActions.ActionTypes.LOAD_EMPLOYEES_WITH_ZERO_ENTITLEMENT)
        .map(toPayload)
        .switchMap((yearEndProcedureId: string) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('YearEndResultsByProcedureId', yearEndProcedureId);
            params.set('pageNumber', '0');
            params.set('pageSize', '0');
            params.set('sortField', 'ModifiedOn');
            params.set('direction', 'desc');
            params.set('YearEndResultsByEntitlementLessThan', '1');
            params.set('fields', 'Employee.FirstName, Employee.Surname, ModifiedOn');
            return this._data.get(`YearEndProcedureResults/GetSpecificFields`, { search: params });
        })
        .map((res) => new yepActions.LoadEmployeesWithZeroEntitlementCompleteAction(extractEmployeesFromYEPResults(res)))
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    constructor(
        private _data: RestClientService,
        private _actions$: Actions,
        private _store: Store<fromRoot.State>,
        private _claimsHelper: ClaimsHelperService,
        private _messenger: MessengerService
    ) {
    }
}
