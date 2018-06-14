import { extractPagingInfo } from '../../employee/common/extract-helpers';
import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { extractFiscalYearSummaryData, extractMyAbsencesList } from '../common/extract-helpers';
import { LoadFiscalYearDataAction } from '../actions/holiday-absence.actions';
import { AbsenceType } from '../common/absence-type.enum';
import { FiscalYearSummary, MyAbsenceType, FiscalYearSummaryModel, MyAbsence } from '../models/holiday-absence.model';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import * as fromRoot from '../../shared/reducers/index';
import * as holidayAbsenceActions from '../../holiday-absence/actions/holiday-absence.actions';
import * as yepActions from '../../company/yearendprocedures/actions/yearendprocedure-actions';
import * as errorActions from '../../shared/actions/error.actions';
import * as holidayAbsenceRequestsActions from '../../holiday-absence/actions/holiday-absence-requests.actions';
import { Http, URLSearchParams, Response, ResponseOptions } from '@angular/http';
import {
    extractFiscalYearSummary
    , extractAbsenceHistory
    , getFYSummary
    , extractDelegateInfo
    , holidayAbsenceSaveInProgressMessage
    , holidayAbsenceSaveCompleteMessage,
    prepareModel,
    reloadSummary,
    extractEmployeeAbsence
} from '../common/extract-helpers';
import { isNullOrUndefined } from 'util';
import { DateTimeHelper } from '../../shared/helpers/datetime-helper';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { EffectsHelper } from '../../shared/helpers/effects-helper';
import { HolidayAbsenceState } from '../reducers/holiday-absence.reducers';
import { ActionPayloadModel } from '../../shared/models/action-payload-model';
import { HolidayAbsenceRequestsState } from '../reducers/holiday-absence-requests.reducer';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessengerService } from '../../shared/services/messenger.service';
import { AtlasParams, AtlasApiRequestWithParams } from '../../shared/models/atlas-api-response';
import { StringHelper } from '../../shared/helpers/string-helper';

@Injectable()
export class HolidayAbsenceEffects {

    private _holidayAbsenceData: Map<string, any> = new Map();

    @Effect()
    myabsences$: Observable<Action> = this._actions$.ofType(holidayAbsenceActions.ActionTypes.LOAD_EMPLOYEE_ABSENCES)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.holidayAbsenceState }; })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('MyAbsencesApprovedOrDeclainedFilter', 'false');
            if (data._state && data._state.Filters) {
                let typeId = data._state.Filters['typeId'];
                params.set('TypeId', typeId);
                if (typeId === MyAbsenceType.Holiday.toString()) {
                    params.set('MyHolidayStatusFilter', data._state.Filters['myHolidayStatusFilter']);
                }
                params.set('empid', data._state.Filters['employeeId']);
                params.set('absenceStartYear', data._state.Filters['startDate']);
                params.set('absenceEndYear', data._state.Filters['endDate']);
                params.set('pageNumber', data._state.Filters['pageNumber']);
                params.set('pageSize', data._state.Filters['pageSize']);
                params.set('sortField', data._state.Filters['sortField']);
                params.set('direction', data._state.Filters['direction'] === SortDirection.Ascending ? 'asc' : 'desc');
            } else {
                params.set('TypeId', data._payload.typeId);
                params.set('empid', data._payload.employeeId);
                params.set('absenceStartYear', data._payload.startDate);
                params.set('absenceEndYear', data._payload.endDate);
                params.set('pageNumber', data._payload.pageNumber);
                params.set('pageSize', data._payload.pageSize);
                params.set('sortField', data._payload.sortField);
                params.set('direction', data._payload.direction === SortDirection.Ascending ? 'asc' : 'desc');
            }
            return this._data.get('MyAbsence/GetAbsences', { search: params });
        })
        .map(res => {
            return new holidayAbsenceActions.LoadEmployeeAbsencesCompleteAction({
                EmployeeAbsencesList: extractMyAbsencesList(res)
                , EmployeeAbsencesPagingInfo: extractPagingInfo(res)
                , EmployeeDelegateInfo: extractDelegateInfo(res)
            });
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee absences', null)));
        });

    @Effect()
    loadEmployeeDetails$: Observable<Action> = this._actions$.ofType(holidayAbsenceActions.ActionTypes.LOAD_EMPLOYEE_CONFIG
        , holidayAbsenceRequestsActions.ActionTypes.LOAD_SELECTED_EMPLOYEE_CONFIG)
        .map(EffectsHelper.toActionPayload)
        .switchMap((input) => {
            let params: URLSearchParams = new URLSearchParams();
            let employeeId: string = input.payload;

            params.set('fields', `Id,FirstName,Surname,ManagerUserId,UserId,EmploymentTypeId,
            HolidayUnitType,CarryForwardedUnits,CarryForwardedUnitType,ExpiredCarryForwardedUnits,CompanyId,MiddleName,Email,
            ManagerId,NextLevelManagerId,NextLevelManagerUserId`);
            return this._data.get(`employeeview/${employeeId}`, { search: params })
                .map(res => {
                    if (input.actionType === holidayAbsenceActions.ActionTypes.LOAD_EMPLOYEE_CONFIG) {
                        return new holidayAbsenceActions.LoadEmployeeConfigCompleteAction(res.json());
                    } else {
                        return new holidayAbsenceRequestsActions.LoadSelectedEmployeeConfigCompleteAction(res.json());
                    }
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee config', null)));
                });
        });

    @Effect()
    loadEmployeeHolidayWorkingProfile$: Observable<Action> =
    this._actions$.ofType(holidayAbsenceActions.ActionTypes.LOAD_EMPLOYEE_HOLIDAY_WORKING_PROFILE)
        .map(toPayload)
        .switchMap((employeeId: string) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('employeeId', employeeId);
            params.set('optionalParam', 'false');
            return this._data.get(`HolidayWorkingProfile/GetByEmployee`, { search: params });
        })
        .map((res) => new holidayAbsenceActions.LoadEmployeeHolidayWorkingProfileCompleteAction(res.json()))
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee holiday', null)));
        });

    @Effect()
    loadFiscalYearSummary$: Observable<Action> =
    this._actions$.ofType(holidayAbsenceActions.ActionTypes.LOAD_FISCAL_YEAR_DATA
        , holidayAbsenceRequestsActions.ActionTypes.LOAD_SELECTED_EMPLOYEE_SUMMARY)
        .map(EffectsHelper.toActionPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload,
                _state: state.holidayAbsenceState,
                _requestsState: state.holidayAbsenceRequestsState
            };
        })
        .switchMap((data) => {
            let startDate: string, endDate: string, employeeId: string, fromChart: boolean, forceRefresh: boolean,
                state: HolidayAbsenceState, requestsState: HolidayAbsenceRequestsState, payload, payloadModel: ActionPayloadModel,
                actionType: string, summary: FiscalYearSummary;

            let params: URLSearchParams = new URLSearchParams();
            let actionGenerators = [], myActions: any[] = [];

            state = data._state;
            requestsState = data._requestsState;
            payload = data._payload.payload;
            actionType = data._payload.actionType;
            forceRefresh = payload.forceRefresh;
            fromChart = payload.refreshSummary;
            // Always gettign the data from the payload instead of from state which is causing issues if manager accessing emp data after he has seen his holidays
            // if (state && state.Filters && payload.refreshSummary) {
            //     employeeId = data._state.Filters['employeeId'];
            //     startDate = data._state.Filters['startDate'];
            //     endDate = data._state.Filters['endDate'];
            // } else {
            employeeId = payload.employeeId;
            startDate = payload.startDate;
            endDate = payload.endDate;
            // }
            let arr = [];
            let startDtInDateFormat = DateTimeHelper.getDateFormatRequiredBySummaryAPIKey(payload.startDate);
            let endDtInDateFormat = DateTimeHelper.getDateFormatRequiredBySummaryAPIKey(payload.endDate);
            let keyName = `${startDtInDateFormat}dt${endDtInDateFormat}`;

            params.set('temp', 'true');
            params.set('TypeId', MyAbsenceType.Holiday.toString());
            params.set('employeeId', employeeId);
            params.set('absenceStartYear', startDate);
            params.set('absenceEndYear', endDate);

            if (!forceRefresh &&
                actionType === holidayAbsenceActions.ActionTypes.LOAD_FISCAL_YEAR_DATA) {
                summary = this._holidayAbsenceData.get(keyName);
                if (!isNullOrUndefined(summary)) {
                    let model = new FiscalYearSummaryModel();
                    if (fromChart) {
                        model.summary = model.chartSummary = summary;
                    } else {
                        model.summary = summary;
                        model.chartSummary = state.FiscalYearSummaryForChart;
                    }
                    actionGenerators = [
                        (mm: any) => {
                            return new holidayAbsenceActions.LoadFiscalYearDataCompleteAction(mm);
                        }
                    ];
                    myActions.push(actionGenerators[0](model));
                    return Observable.from(myActions);
                }
            }

            return this._data.get(`MyAbsence/GetMyHolidaysWorkingDays`, { search: params })
                .mergeMap((response) => {
                    summary = extractFiscalYearSummary(response
                        , DateTimeHelper.getDatePartfromString(startDate)
                        , DateTimeHelper.getDatePartfromString(endDate));

                    let model = new FiscalYearSummaryModel();
                    if (fromChart) {
                        model.summary = model.chartSummary = summary;
                    } else {
                        model.summary = summary;
                        if (actionType === holidayAbsenceActions.ActionTypes.LOAD_FISCAL_YEAR_DATA) {
                            model.chartSummary = state.FiscalYearSummaryForChart;
                        } else {
                            model.chartSummary = requestsState.selectedEmployeeHolidaySummaryForChart;
                        }
                    }

                    if (actionType === holidayAbsenceActions.ActionTypes.LOAD_FISCAL_YEAR_DATA) {
                        this._holidayAbsenceData.set(keyName, summary);
                        actionGenerators = [
                            (mm: any) => {
                                return new holidayAbsenceActions.LoadFiscalYearDataCompleteAction(mm);
                            }
                        ];
                    } else {
                        actionGenerators = [
                            (mm: any) => {
                                return new holidayAbsenceRequestsActions
                                    .LoadSelectedEmployeeSummaryCompleteAction(model);
                            }
                        ];
                    }
                    myActions.push(actionGenerators[0](model));
                    return Observable.from(myActions);
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee absences', '')));
                });
        });

    @Effect()
    loadMyAbsence$: Observable<Action> = this._actions$.ofType(holidayAbsenceActions.ActionTypes.LOAD_EMPLOYEE_ABSENCE
        , holidayAbsenceRequestsActions.ActionTypes.LOAD_SELECTED_EMPLOYEE_ABSENCE)
        .map(EffectsHelper.toActionPayload)
        .switchMap((input) => {
            let myAbsenceId: string = input.payload;
            let params: URLSearchParams = new URLSearchParams();
            params.set('type', '1');
            params.set('isforAbsence', 'true');
            return this._data.get(`MyAbsence/GetAbsenceById/${myAbsenceId}`, { search: params })
                .map((res) => {
                    if (input.actionType === holidayAbsenceActions.ActionTypes.LOAD_EMPLOYEE_ABSENCE) {
                        return new holidayAbsenceActions.LoadEmployeeAbsenceCompleteAction(extractEmployeeAbsence(res));
                    } else {
                        return new holidayAbsenceRequestsActions.LoadSelectedEmployeeAbsenceCompleteAction(extractEmployeeAbsence(res));
                    }
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee absences', '')));
                });
        });

    @Effect()
    addMyAbsence$: Observable<Action> = this._actions$.ofType(holidayAbsenceActions.ActionTypes.ADD_EMPLOYEE_ABSENCE
        , holidayAbsenceRequestsActions.ActionTypes.ADD_SELECTED_EMPLOYEE_ABSENCE)
        .map(EffectsHelper.toActionPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _lookupState: state.lookupState
                , _commonState: state.commonState
                , _empAbsenceState: state.holidayAbsenceState
                , _requestsState: state.holidayAbsenceRequestsState
            };
        })
        .switchMap((input) => {
            let lookupState = input._lookupState;
            let commonState = input._commonState;
            let empAbsenceState = input._empAbsenceState;
            let requestsState = input._requestsState;
            let payload = input._payload.payload;
            let actionType = input._payload.actionType;
            let employeeId = this._claimsHelperService.getEmpIdOrDefault();
            let showEmpName: boolean = (employeeId.toLowerCase() != payload.EmployeeId.toLowerCase() && (this._claimsHelperService.isHolidayAuthorizerOrManager() || this._claimsHelperService.canViewAllEmployees()));
            
            let statusCode = lookupState.AbsenceStatuses.filter(c => c.Id == payload.StatusId)[0].Code;
            let message = holidayAbsenceSaveInProgressMessage(payload, statusCode);
            let vm = ObjectHelper.operationInProgressSnackbarMessage(message);
            this._messenger.publish('snackbar', vm);
            return this._data.put(`myabsence`, payload)
                .mergeMap((res) => {
                    let actionGenerators = [], myActions: any[] = [], results: any[] = [];
                    let reloadSummaryInputs;

                    message = holidayAbsenceSaveCompleteMessage(payload, statusCode, showEmpName);
                    let completedVM = ObjectHelper.operationCompleteSnackbarMessage(message);
                    this._messenger.publish('snackbar', completedVM);

                    if (actionType === holidayAbsenceActions.ActionTypes.ADD_EMPLOYEE_ABSENCE) {
                        let summaryInput;
                        if (payload.TypeId == MyAbsenceType.Holiday) {
                            reloadSummaryInputs = reloadSummary(payload
                                , commonState.FiscalYears
                                , empAbsenceState.Filters['startDate']
                                , empAbsenceState.Filters['endDate']);
                            summaryInput = {
                                refreshSummary: reloadSummaryInputs.RefreshSummary,
                                forceRefresh: true,
                                startDate: reloadSummaryInputs.FYStartDate,
                                endDate: reloadSummaryInputs.FYEndDate,
                                employeeId: this._claimsHelperService.getEmpIdOrDefault()
                            };
                        }
                        results = [res.json(), null, null, summaryInput];

                        actionGenerators = [
                            (mm: any) => {
                                return new holidayAbsenceActions
                                    .AddEmployeeAbsenceCompleteAction(res.json());
                            },
                            () => {
                                return new holidayAbsenceActions.ClearCurrentAbsence();
                            },
                            () => {
                                return new holidayAbsenceActions.LoadEmployeeAbsencesAction(empAbsenceState.Filters);
                            }
                        ];
                        if (payload.TypeId == MyAbsenceType.Holiday) {
                            actionGenerators = actionGenerators.concat([
                                (dd) => {
                                    return new holidayAbsenceActions.LoadFiscalYearDataAction(summaryInput);
                                }]);
                        }
                    } else {
                        let isOneStepApproval = false;
                        let employeeAbsence = <MyAbsence>res.json();
                        if (!isNullOrUndefined(employeeAbsence) &&
                            !StringHelper.isNullOrUndefinedOrEmpty(employeeAbsence.ApprovedBy) &&
                            employeeAbsence.ApprovedBy === this._claimsHelperService.getUserId()) {
                            isOneStepApproval = true;
                        }
                        results = [res.json(), null, null];
                        actionGenerators = [
                            (mm: any) => {
                                return new holidayAbsenceRequestsActions
                                    .AddSelectedEmployeeAbsenceCompleteAction(res.json());
                            },
                            () => {
                                return new holidayAbsenceRequestsActions.ClearSelectedEmployeeAbsence();
                            }
                        ];

                        if (!isOneStepApproval) {
                            actionGenerators = actionGenerators.concat([() => {
                                let iniParamsArray: AtlasParams[] = [];
                                let newReq: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'CreatedOn'
                                    , SortDirection.Descending
                                    , iniParamsArray);
                                return new holidayAbsenceRequestsActions
                                    .LoadHolidayAbsenceRequestsAction(requestsState.apiRequestWithParams);
                            }]);
                        } else {
                            actionGenerators = actionGenerators.concat([() => {
                                return new holidayAbsenceRequestsActions.LoadOneStepApprovalAction(true);
                            }]);
                        }
                    }

                    results.forEach((v, i) => {
                        if (!isNullOrUndefined(actionGenerators[i])) {
                            myActions.push(actionGenerators[i](v));
                        }
                    });
                    return Observable.from(myActions);
                }).catch((error) => {
                    return Observable
                        .of(new errorActions
                            .CatchErrorAction(new AtlasApiError(error
                                , MessageEvent.Create
                                , 'Holidays & Absences'
                                , null)));
                });
        });

    @Effect()
    updateMyAbsence$: Observable<Action> = this._actions$.ofType(
        holidayAbsenceActions.ActionTypes.UPDATE_EMPLOYEE_ABSENCE
        , holidayAbsenceRequestsActions.ActionTypes.UPDATE_SELECTED_EMPLOYEE_ABSENCE
        , yepActions.ActionTypes.UPDATE_PENDING_HOLIDAY_ABSENCE_REQUEST)
        .map(EffectsHelper.toActionPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _lookupState: state.lookupState
                , _commonState: state.commonState
                , _empAbsenceState: state.holidayAbsenceState
                , _requestsState: state.holidayAbsenceRequestsState
                , _yepState: state.yearEndProcedureState
            };
        })
        .switchMap((input) => {
            let lookupState = input._lookupState;
            let commonState = input._commonState;
            let empAbsenceState = input._empAbsenceState;
            let requestsState = input._requestsState;
            let payload = input._payload.payload;
            let actionType = input._payload.actionType;
            let employeeId = this._claimsHelperService.getEmpId();
            let showEmpName: boolean = (employeeId.toLowerCase() != payload.EmployeeId.toLowerCase());

            let statusCode = lookupState.AbsenceStatuses.filter(c => c.Id == payload.StatusId)[0].Code;

            let absenceId = payload.Id;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Holidays & Absences', payload.startDate, absenceId);
            this._messenger.publish('snackbar', vm);
            return this._data.post(`myabsence`, payload)
                .mergeMap((res) => {
                    let actionGenerators = [], myActions: any[] = [], results: any[] = [];
                    let reloadSummaryInputs;

                    vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Holidays & Absences', payload.startDate, absenceId);
                    this._messenger.publish('snackbar', vm);

                    if (actionType === holidayAbsenceActions.ActionTypes.UPDATE_EMPLOYEE_ABSENCE) {
                        let summaryInput;
                        if (payload.TypeId == MyAbsenceType.Holiday) {
                            reloadSummaryInputs = reloadSummary(payload
                                , commonState.FiscalYears
                                , empAbsenceState.Filters['startDate']
                                , empAbsenceState.Filters['endDate']);
                            summaryInput = {
                                refreshSummary: reloadSummaryInputs.RefreshSummary,
                                forceRefresh: true,
                                startDate: reloadSummaryInputs.FYStartDate,
                                endDate: reloadSummaryInputs.FYEndDate,
                                employeeId: this._claimsHelperService.getEmpIdOrDefault()
                            };
                        }

                        results = [res.json(), null, null, summaryInput];
                        actionGenerators = [
                            (mm: any) => {
                                return new holidayAbsenceActions
                                    .UpdateEmployeeAbsenceCompleteAction(res.json());
                            },
                            () => {
                                return new holidayAbsenceActions.ClearCurrentAbsence();
                            },
                            () => {
                                return new holidayAbsenceActions.LoadEmployeeAbsencesAction(empAbsenceState.Filters);
                            }
                        ];
                        if (payload.TypeId == MyAbsenceType.Holiday) {
                            actionGenerators = actionGenerators.concat([
                                (dd) => {
                                    return new holidayAbsenceActions.LoadFiscalYearDataAction(summaryInput);
                                }]);
                        }
                    } else if (actionType === holidayAbsenceRequestsActions.ActionTypes.UPDATE_SELECTED_EMPLOYEE_ABSENCE) {
                        results = [res.json(), null, null];
                        actionGenerators = [
                            (mm: any) => {
                                return new holidayAbsenceRequestsActions
                                    .UpdateSelectedEmployeeAbsenceCompleteAction(res.json());
                            },
                            () => {
                                return new holidayAbsenceRequestsActions.ClearSelectedEmployeeAbsence();
                            },
                            () => {
                                let iniParamsArray: AtlasParams[] = [];
                                let newReq: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'CreatedOn'
                                    , SortDirection.Descending, iniParamsArray);
                                return new holidayAbsenceRequestsActions.LoadHolidayAbsenceRequestsAction(
                                    requestsState.apiRequestWithParams);
                            }
                        ];
                    } else if (actionType === yepActions.ActionTypes.UPDATE_PENDING_HOLIDAY_ABSENCE_REQUEST) {
                        results = [res.json(), null, null];
                        actionGenerators = [
                            () => {
                                let params: AtlasParams[] = input._yepState.PendingRequestsApiRequestWithParams.Params;
                                let newReq: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'StartDate'
                                    , SortDirection.Descending, params);
                                return new yepActions.LoadHolidayAbsenceRequestsAction(newReq);
                            }
                        ];
                    }

                    results.forEach((v, i) => {
                        if (!isNullOrUndefined(actionGenerators[i])) {
                            myActions.push(actionGenerators[i](v));
                        }
                    });
                    return Observable.from(myActions);
                }).catch((error) => {
                    return Observable
                        .of(new errorActions
                            .CatchErrorAction(new AtlasApiError(error
                                , MessageEvent.Update
                                , 'Holidays & Absences', payload.startDate, absenceId)));
                });
        })

    @Effect()
    loadMyAbsenceHistory$: Observable<Action> = this._actions$.ofType(holidayAbsenceActions.ActionTypes.LOAD_EMPLOYEE_ABSENCE_HISTORY
        , holidayAbsenceRequestsActions.ActionTypes.LOAD_SELECTED_EMPLOYEE_ABSENCE_HISTORY)
        .map(EffectsHelper.toActionPayload)
        .switchMap((input) => {
            let myAbsenceId: string = input.payload;
            let params: URLSearchParams = new URLSearchParams();
            params.set('absenceId', myAbsenceId);
            params.set('temp', 'false');
            params.set('temp1', 'false');
            params.set('temp2', 'false');
            return this._data.get(`MyAbsenceHistory/GetCurrentAndHistoryByAbsenceId`, { search: params })
                .map((res) => {
                    if (input.actionType === holidayAbsenceActions.ActionTypes.LOAD_EMPLOYEE_ABSENCE_HISTORY) {
                        return new holidayAbsenceActions
                            .LoadEmployeeAbsenceHistoryCompleteAction(extractAbsenceHistory(res));
                    } else {
                        return new holidayAbsenceRequestsActions
                            .LoadSelectedEmployeeAbsenceHistoryCompleteAction(extractAbsenceHistory(res));
                    }
                });
        });


    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelperService: ClaimsHelperService
        , private _messenger: MessengerService) {

    }
}
