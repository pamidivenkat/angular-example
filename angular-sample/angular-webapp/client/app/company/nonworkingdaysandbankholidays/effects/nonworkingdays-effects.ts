import { RouteParams } from './../../../shared/services/route-params';
import { Employee } from './../../../calendar/model/calendar-models';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { getAtlasParamValueByKey } from '../../../root-module/common/extract-helpers';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import {
    LoadCompanyNonWorkingDaysCompleteAction
    , LoadStandardNonWorkingDaysCompleteAction
    , LoadEmployeesAction
    , LoadCustomNonWorkingDaysCompleteAction
    , LoadSelectedProfileNotesCompleteAction
    , LoadCustomNonWorkingProfileValidationDataCompleteAction
    , LoadCustomNonWorkingDaysAction
    , LoadSelectedNonWorkingDaysProfileCompleteAction
    , NonWorkingDaysAssignSaveCompleteAction
    , LoadSelectedNonWorkingDaysProfileAction
    , NonWorkingDaysProfileCopyCompleteAction
} from './../actions/nonworkingdays-actions';
import { NonWorkingdaysModel, NonWorkingdaysNotesModel } from './../models/nonworkingdays-model';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as nonWorkingDaysActions from '../actions/nonworkingdays-actions';
import * as fromRoot from './../../../shared/reducers/index';
import { Headers, Http, URLSearchParams } from '@angular/http';
import * as errorActions from './../../../shared/actions/error.actions';
import { ObjectHelper } from './../../../shared/helpers/object-helper';
import { MessengerService } from './../../../shared/services/messenger.service';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';
import { getNonWorkingDayEntity } from './../common/extract-helpers';
import { isNullOrUndefined } from 'util';
import { LoadAllNonWorkingDayProfilesCompleteAction } from './../../../shared/actions/company.actions';
import { extractHWPShortModel } from './../../../shared/helpers/extract-helpers';

@Injectable()
export class NonworkingdaysEffects {
    @Effect()
    loadCompnayNonWorkingDay$: Observable<Action> = this._actions$.ofType(nonWorkingDaysActions.ActionTypes.LOAD_COMPANY_NONWORKING_DAY)
        .map(toPayload)
        .switchMap((payload: string) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('companyId', payload);
            params.set('optionalParam', 'true');
            params.set('optionalParamOne', 'true');
            return this._data.get('HolidayWorkingProfile/GetCompanyDefaultProfile', { search: params })
                .map((res) => {
                    return new LoadCompanyNonWorkingDaysCompleteAction(<NonWorkingdaysModel>res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Get Company Default Profile', payload)));
                })
        });

    @Effect()
    loadStandardNonWorkingDay$: Observable<Action> = this._actions$.ofType(nonWorkingDaysActions.ActionTypes.LOAD_STANDARD_NONWORKING_DAYS)
        .map(toPayload)
        .switchMap((payload: AtlasApiRequestWithParams) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('HWPByCountry', getAtlasParamValueByKey(payload.Params, 'CountryId'));
            params.set('HWPByDepartment', getAtlasParamValueByKey(payload.Params, 'DepartmentId'));
            params.set('HWPBySite', getAtlasParamValueByKey(payload.Params, 'SiteId'));
            params.set('HWPByEmployee', getAtlasParamValueByKey(payload.Params, 'EmployeeId'));
            params.set('HWPByCompany', getAtlasParamValueByKey(payload.Params, 'CompanyId'));
            params.set('isexample', 'true');
            params.set('hwpType', '1');
            params.set('fields', 'Id,Name,IsExample,Description,CountryId,Country.Name as CountryName,HWPAssignedTo,CompanyId');
            params.set('pageNumber', payload.PageNumber.toString());
            params.set('pageSize', payload.PageSize.toString());
            params.set('sortBy', payload.SortBy.SortField);
            params.set('SortField', payload.SortBy.SortField);
            params.set('sortDirection', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            params.set('Direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            return this._data.get('HolidayWorkingProfile/GetHWPByFilters', { search: params })
        })
        .map((res) => {
            return new LoadStandardNonWorkingDaysCompleteAction(<AtlasApiResponse<NonWorkingdaysModel>>res.json());
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Load standard non working days', 'standard non working days')));
        });

    @Effect()
    loadNonWorkingDaysEmployees$: Observable<Action> = this._actions$.ofType(nonWorkingDaysActions.ActionTypes.LOAD_NONWORKING_DAYS_EMPLOYEES)
        .map((action: nonWorkingDaysActions.LoadEmployeesAction) => action.payload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'FirstName,SurName as SurName,Id');
            params.set('employeesByNameOrEmailFilter', getAtlasParamValueByKey(payload.Params, 'SearchedQuery'));
            params.set('employeesByLeaverFilter', '0');
            params.set('pageNumber', '0');
            params.set('pageSize', '0');
            params.set('sortField', payload.SortBy.SortField);
            params.set('direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            return this._data.get('Employee', { search: params });
        })
        .map(res => {
            return new nonWorkingDaysActions.LoadEmployeesCompleteAction(<AtlasApiResponse<Employee>>res.json());
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Load employees in non working days filter', 'employees')));
        });

    @Effect()
    loadCustomNonWorkingDay$: Observable<Action> = this._actions$.ofType(nonWorkingDaysActions.ActionTypes.LOAD_CUSTOM_NONWORKING_DAYS)
        .map(toPayload)
        .switchMap((payload: AtlasApiRequestWithParams) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('HWPByCountry', getAtlasParamValueByKey(payload.Params, 'CountryId'));
            params.set('HWPByDepartment', getAtlasParamValueByKey(payload.Params, 'DepartmentId'));
            params.set('HWPBySite', getAtlasParamValueByKey(payload.Params, 'SiteId'));
            params.set('HWPByEmployee', getAtlasParamValueByKey(payload.Params, 'EmployeeId'));
            params.set('HWPByCompany', getAtlasParamValueByKey(payload.Params, 'CompanyId'));
            params.set('fields', 'Id,Name,Description,CountryId,Country.Name as CountryName,CompanyId');
            params.set('pageNumber', payload.PageNumber.toString());
            params.set('pageSize', payload.PageSize.toString());
            params.set('sortBy', payload.SortBy.SortField);
            params.set('SortField', payload.SortBy.SortField);
            params.set('sortDirection', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            params.set('Direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            return this._data.get('HolidayWorkingProfile/getspecificfields', { search: params })
        })
        .map((res) => {
            return new LoadCustomNonWorkingDaysCompleteAction(<AtlasApiResponse<NonWorkingdaysModel>>res.json());
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Load standard non working days', 'standard non working days')));
        });

    @Effect()
    loadSelectedProfileNotes$: Observable<Action> = this._actions$.ofType(nonWorkingDaysActions.ActionTypes.LOAD_SELECTED_NONWORKING_DAYS_NOTES)
        .map(toPayload)
        .switchMap((payload: string) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('HWPNotesByProfileId', payload);
            params.set('currentPage', '1');
            params.set('sortField', 'CreatedOn');
            params.set('direction', 'desc');
            params.set('fields', 'Notes,CreatedOn');
            params.set('isExample', 'true');
            params.set('pageNumber', '1');
            params.set('pageSize', '9999');
            return this._data.get('HolidayWorkingProfileNotes', { search: params })
                .map((res) => {
                    return new LoadSelectedProfileNotesCompleteAction(<AtlasApiResponse<NonWorkingdaysNotesModel>>res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Load standard non working day notes', payload)));
                })
        });

    @Effect()
    loadNonWorkingDayProfilesValidationData$: Observable<Action> = this._actions$.ofType(nonWorkingDaysActions.ActionTypes.LOAD_CUSTOM_NONWORKING_DAYS_VALIDATION_DATA)
        .map(toPayload)
        .switchMap((payload: string) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('keyValue', 'true');
            return this._data.get('HolidayWorkingProfile', { search: params })
                .map((res) => {
                    return new LoadCustomNonWorkingProfileValidationDataCompleteAction(<NonWorkingdaysModel[]>res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Load custom non working days validation', payload)));
                })
        });

    @Effect()
    nonWorkingDayProfilesCopy$: Observable<Action> = this._actions$.ofType(nonWorkingDaysActions.ActionTypes.NONWORKING_DAYS_COPY)
        .map((action: nonWorkingDaysActions.NonWorkingDaysProfileCopyAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload,
                _savedRequestFromState: state.nonWorkingDaysState.customNonWorkingDaysRequest,
                _hwpListFromCommonState: state.commonState.NonWorkingDayProfilesList
            };
        })
        .switchMap((pl) => {
            let payload = pl._payload;
            let params: URLSearchParams = new URLSearchParams();
            params.set('example', payload.IsExample ? 'true' : 'false');
            params.set('copy', 'true');
            let message = 'Copy of profile as ' + payload.Name;
            let vm = ObjectHelper.operationInProgressSnackbarMessage(message);
            this._messenger.publish('snackbar', vm);
            return this._data.put('HolidayWorkingProfile', payload, { search: params })
                .mergeMap((res) => {
                    if (!isNullOrUndefined(pl._hwpListFromCommonState)) {
                        let itemAdded = extractHWPShortModel(res);
                        let list = pl._hwpListFromCommonState.concat(itemAdded);
                        pl._hwpListFromCommonState = list.sort((a, b) => a.Name.localeCompare(b.Name));
                    }

                    // after copying need to refresh the custom non working data grid
                    let vm = ObjectHelper.operationCompleteSnackbarMessage(message);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new NonWorkingDaysProfileCopyCompleteAction(<NonWorkingdaysModel>res.json()),
                        new LoadAllNonWorkingDayProfilesCompleteAction(pl._hwpListFromCommonState)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Copy, 'Copy non working days profile', payload.Id)));
                })
        });

    @Effect()
    loadSelectedProfileFullEntity$: Observable<Action> = this._actions$.ofType(nonWorkingDaysActions.ActionTypes.LOAD_SELECTED_NONWORKING_DAYS_FULL_ENTITY)
        .map(toPayload)
        .switchMap((payload: NonWorkingdaysModel) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', payload.Id);
            params.set('isExample', payload.IsExample ? 'true' : 'false');
            params.set('companyId', this._routeParams.Cid ? this._routeParams.Cid : this._claimsHelper.getCompanyId());
            return this._data.get('HolidayWorkingProfile', { search: params })
                .map((res) => {

                    return new LoadSelectedNonWorkingDaysProfileCompleteAction(getNonWorkingDayEntity(res.json()));
                })
                .catch((error) => {
                    return Observable.of(
                        new errorActions.CatchErrorAction(
                            new AtlasApiError(error
                                , MessageEvent.Load
                                , 'Load non working day profile'
                                , payload.Id)));
                });
        });

    @Effect()
    NonWorkingDaysAssignSave$: Observable<Action> = this._actions$.ofType(nonWorkingDaysActions.ActionTypes.NONWORKING_DAYS_ASSIGN_SAVE)
        .map((action: nonWorkingDaysActions.NonWorkingDaysAssignSaveAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.nonWorkingDaysState.customNonWorkingDaysRequest }; })
        .switchMap((pl) => {
            let payload = pl._payload;
            let message = 'Assignment of non working days profile';
            let vm = ObjectHelper.operationInProgressSnackbarMessage(message);
            this._messenger.publish('snackbar', vm);
            return this._data.post('HWPAssignment', payload)
                .map((res) => {
                    //after copying need to refresh the custom non working data grid                   
                    let vm = ObjectHelper.operationCompleteSnackbarMessage(message);
                    this._messenger.publish('snackbar', vm);
                    this._store.dispatch(new LoadSelectedNonWorkingDaysProfileAction(payload.AssignedTo.HolidayWorkingProfile));
                    return new NonWorkingDaysAssignSaveCompleteAction(res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Assignment of non working days profile', payload.HolidayWorkingProfileMapList[0].HolidayWorkingProfileId)));
                })
        });

    @Effect()
    compnayNonWorkingDayRemove$: Observable<Action> = this._actions$.ofType(nonWorkingDaysActions.ActionTypes.NONWORKING_DAYS_ASSIGN_REMOVE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload,
                _savedRequestFromState: state.nonWorkingDaysState.customNonWorkingDaysRequest,
                _hwpListFromCommonState: state.commonState.NonWorkingDayProfilesList
            };
        })
        .switchMap((pl) => {
            let payload: NonWorkingdaysModel = pl._payload;
            let holidayProfileId = payload.Id;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Non working days profile', payload.Name, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`HolidayWorkingProfile/${holidayProfileId}`)
                .mergeMap((res) => {
                    if (!isNullOrUndefined(pl._hwpListFromCommonState)) {
                        pl._hwpListFromCommonState = pl._hwpListFromCommonState
                            .filter(c => c.Id.toLowerCase() !== holidayProfileId.toLowerCase())
                            .sort((a, b) => a.Name.localeCompare(b.Name));
                    }

                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Non working days profile', payload.Name, payload.Id);
                    this._messenger.publish('snackbar', vm);
                    if (pl._savedRequestFromState) {
                        return [new LoadCustomNonWorkingDaysAction(pl._savedRequestFromState),
                        new LoadAllNonWorkingDayProfilesCompleteAction(pl._hwpListFromCommonState)
                        ];
                    } else {
                        return [new LoadAllNonWorkingDayProfilesCompleteAction(pl._hwpListFromCommonState)];
                    }
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Remove non working days profile', payload.Id)));
                })
        });

    @Effect()
    getNonWorkingdayProfile$: Observable<Action> =
    this._actions$.ofType(nonWorkingDaysActions.ActionTypes.LOAD_NON_WORKING_DAY_PROFILE)
        .map(toPayload)
        .switchMap((payload: NonWorkingdaysModel) => {
            let params: URLSearchParams = new URLSearchParams();
            let year: number = (new Date()).getFullYear();
            params.set('id', payload.Id);
            params.set('example', payload.IsExample ? 'true' : 'false');
            params.set('HolidaysByYearFilter', year.toString());
            return this._data.get('HolidayWorkingProfile', { search: params })
                .map((res) => new nonWorkingDaysActions.LoadNonWorkingDayProfileCompleteAction(getNonWorkingDayEntity(res.json())))
                .catch((error) => {
                    return Observable.of(
                        new errorActions.CatchErrorAction(
                            new AtlasApiError(error
                                , MessageEvent.Load
                                , 'Load non-working days and bank holiday profile failed.'
                                , payload.Id)));
                });
        });

    @Effect()
    addNonWorkingdayProfile$: Observable<Action> =
    this._actions$.ofType(nonWorkingDaysActions.ActionTypes.ADD_NON_WORKING_DAY_PROFILE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _nonworkingdaysState: state.nonWorkingDaysState
                , _hwpListFromCommonState: state.commonState.NonWorkingDayProfilesList
            };
        })
        .switchMap((input) => {
            let vm = ObjectHelper.operationInProgressSnackbarMessage('Creating non-working days and bank holiday profile...');
            this._messenger.publish('snackbar', vm);
            return this._data.put(`HolidayWorkingProfile`, input._payload)
                .mergeMap((res) => {
                    let itemAdded = extractHWPShortModel(res);
                    if (!isNullOrUndefined(input._hwpListFromCommonState)) {
                        let list = input._hwpListFromCommonState.concat(itemAdded);
                        input._hwpListFromCommonState = list.sort((a, b) => a.Name.localeCompare(b.Name));
                    }

                    vm = ObjectHelper.operationCompleteSnackbarMessage('Non-working days and bank holiday profile has been created.');
                    this._messenger.publish('snackbar', vm);

                    return [new nonWorkingDaysActions.AddNonWorkingDayProfileCompleteAction(getNonWorkingDayEntity(res.json())),
                    new LoadAllNonWorkingDayProfilesCompleteAction(input._hwpListFromCommonState)];
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error
                            , MessageEvent.Load
                            , 'Create non-working days and bank holiday profile'
                            , input._payload.Id)));
                });
        });

    @Effect()
    updateNonWorkingdayProfile$: Observable<Action> =
    this._actions$.ofType(nonWorkingDaysActions.ActionTypes.UPDATE_NON_WORKING_DAY_PROFILE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _nonworkingdaysState: state.nonWorkingDaysState
                , _hwpListFromCommonState: state.commonState.NonWorkingDayProfilesList
            };
        })
        .switchMap((input) => {
            let vm = ObjectHelper.operationInProgressSnackbarMessage('Updating non-working days and bank holiday profile...');
            this._messenger.publish('snackbar', vm);
            return this._data.post(`HolidayWorkingProfile`, input._payload)
                .mergeMap((res) => {
                    if (!isNullOrUndefined(input._hwpListFromCommonState)) {
                        let hwpShortModel = extractHWPShortModel(res);
                        let list = input._hwpListFromCommonState
                            .filter(c => c.Id.toLowerCase() !== input._payload.Id.toLowerCase());
                        list = list.concat(hwpShortModel);
                        input._hwpListFromCommonState = list.sort((a, b) => a.Name.localeCompare(b.Name));
                    }

                    vm = ObjectHelper.operationCompleteSnackbarMessage('Non-working days and bank holiday profile has been updated.');
                    this._messenger.publish('snackbar', vm);
                    return [new nonWorkingDaysActions.UpdateNonWorkingDayProfileCompleteAction(getNonWorkingDayEntity(res.json())),
                    new LoadAllNonWorkingDayProfilesCompleteAction(input._hwpListFromCommonState)];
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error
                            , MessageEvent.Load
                            , 'Update non-working days and bank holiday profile'
                            , input._payload.Id)));
                });
        });


    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _http: Http
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService
        , private _routeParams: RouteParams
    ) {
    }
}
