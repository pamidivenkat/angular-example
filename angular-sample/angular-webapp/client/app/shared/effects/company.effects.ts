import { extractEmployeeSalarySelectOptionListData } from '../../employee/common/extract-helpers';
import { EmployeeSettings, JobTitle } from '../models/company.models';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as companyActions from '../actions/company.actions';
import { Department } from '../../calendar/model/calendar-models';
import { extractEmployeeSettings, extractFiscalYears, extractAbsenceTypes } from '../../holiday-absence/common/extract-helpers';
import { ObjectHelper } from './../helpers/object-helper';
import { MessengerService } from './../services/messenger.service';
import * as errorActions from './../actions/error.actions';
import { AtlasApiError } from './../error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { LoadEmployeeSettingsAction } from './../actions/company.actions';
import {
    extractUserProfiles
    , extractUserProfilesOptions
    , extractHWPShortModel
    , extractUsersData
    , extractHWPShortModels
} from '../helpers/extract-helpers';
import { RouteParams } from '../services/route-params';
import { Site } from './../models/site.model';
import { isNullOrUndefined } from 'util';
import { SystemTenantId } from '../../shared/app.constants';
import { CatchErrorAction } from "./../actions/error.actions";

@Injectable()
export class CompanyEffects {

    /**
     * This effect used to load the site drowdown data by sending required parameters to api
     *
     */
    @Effect()
    loadSites$: Observable<Action> = this._actions$.ofType(companyActions.ActionTypes.LOAD_SITES)
        .map(toPayload)
        .switchMap((payload) => {
            return this._getSites()
                .map((res) => new companyActions.LoadSitesCompleteAction(res))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Sites', null)));
                });
        });


    @Effect()
    loadEmployeeSettings$: Observable<Action> = this._actions$.ofType(companyActions.ActionTypes.LOAD_EMPLOYEE_SETTINGS)
        .switchMap(() => {
            return this._data.get('EmployeeHolidaySettings', { search: null })
                .map((res) => new companyActions.LoadEmployeeSettingsCompleteAction(extractEmployeeSettings(res)))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee settings', null)));
                });
        });

    @Effect()
    updateEmployeeSettings$: Observable<Action> = this._actions$.ofType(companyActions.ActionTypes.EMPLOYEE_SETTINGS_UPDATE)
        .map(toPayload)
        .switchMap((payload: EmployeeSettings) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Employee holiday settings', '', payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post(`EmployeeHolidaySettings`, payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Employee holiday settings', '', payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new LoadEmployeeSettingsAction(true)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Employee holiday settings', '', payload.Id)));
                });
        });

    @Effect()
    loadAbsenceTypes$: Observable<Action> = this._actions$.ofType(companyActions.ActionTypes.LOAD_ABSENCE_TYPE)
        .switchMap(() => {
            let params: URLSearchParams = new URLSearchParams();
            //Below is commented by srinivas d on 24/04/2017 since its not fetching all absence types as in 1.x, so replacing this call with same as that of 1.x call
            // params.set('pageSize', '0');
            // params.set('pageNumber', '0');
            // params.set('sortField', 'TypeName');
            // params.set('direction', 'asc');           
            // params.set('fields', `Id,TypeName,Color,PictureId,IsExample,AbsenceCode.Id as CodeId,AbsenceCode.Name as CodeName, AbsenceCode.Code as AbsenceCode, AbsenceSubType`);
            return this._data.get('AbsenceType', { search: params })
                .map((res) => new companyActions.LoadAbsenceTypeCompleteAction(extractAbsenceTypes(res)))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Absence types', null)));
                });
        });


    @Effect()
    loadFiscalYears$: Observable<Action> = this._actions$.ofType(companyActions.ActionTypes.LOAD_FISCAL_YEARS)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('startDate', payload.startDate);
            params.set('endDate', payload.endDate);
            return this._data.get('FiscalYear/GetFiscalYears', { search: params })
                .map((res) => new companyActions.LoadFiscalYearsCompleteAction(extractFiscalYears(res)))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Fiscal years', null)));
                });
        });

    @Effect()
    JobTitleOptionList$: Observable<Action> = this._actions$.ofType(companyActions.ActionTypes.JOB_TITLE_OPTION_LOAD)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            //param
            params.set('direction', 'asc');
            params.set('fields', 'Id,Name');
            params.set('pagenumber', '0');
            params.set('pagesize', '0');
            params.set('sortField', 'Name');
            //End of params           
            return this._data.get('jobtitle/getspecificfields', { search: params })
                .map((res) => {
                    return new companyActions.LoadJobTitleOptionCompleteAction(extractEmployeeSalarySelectOptionListData(res));
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Job titles', null)));
                });
        });

    @Effect()
    jobTitleCreate$: Observable<Action> = this._actions$.ofType(companyActions.ActionTypes.ADD_JOB_TITLE)
        .map(toPayload)
        .switchMap((pl) => {

            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Jobtitle', pl.Name);
            this._messenger.publish('snackbar', vm);
            return this._data.put(`JobTitle`, pl)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Jobtitle', pl.Name);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new companyActions.AddJobTitleCompleteAction(<JobTitle>(res.json())),
                        new companyActions.LoadJobTitleOptioAction(true)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error, MessageEvent.Create, 'Jobtitle', pl.Name, null)));
                })
        });

    @Effect()
    loadAllDepartments$: Observable<Action> = this._actions$.ofType(companyActions.ActionTypes.LOAD_ALL_DEPARTMENTS)
        .map(toPayload)
        .switchMap((payload) => {
            return this._getAllDepartments()
                .map((res) => new companyActions.LoadAllDepartmentsCompleteAction(res))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Departments', null)));
                });
        });


    @Effect()
    loadUserProfiles$: Observable<Action> = this._actions$.ofType(companyActions.ActionTypes.LOAD_USER_PROFILES)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            let cid: string = this._routeParams.Cid;
            params.set('isImport', 'true');
            params.set('action', 'GetAllProfiles');
            params.set('cid', cid)
            return this._data.get('UserProfile', { search: params })
                .map((res) => new companyActions.LoadUserProfilesCompleteAction({ UserProfiles: extractUserProfiles(res), UserProfileOptionsList: extractUserProfilesOptions(res) }))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'User profiles', null)));
                });
        });


    private _getSites(): Observable<Site[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('pageSize', '99999');
        params.set('pageNumber', '1');
        params.set('sortField', 'Name');
        params.set('direction', 'asc');
        params.set('filterSiteView', 'active');
        params.set('fields', 'Id,SiteNameAndPostcode,IsActive,Name');
        return this._data.get('Site', { search: params }).map((res) => res.json().Entities);

    }
    /**
     * 
     * @private
     * @returns {Observable<Department[]>} 
     * 
     * @memberOf CompanyEffects
     */
    private _getAllDepartments(): Observable<Department[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('pageSize', '99999');
        params.set('pageNumber', '1');
        params.set('sortField', 'Name');
        params.set('direction', 'asc');
        params.set('fields', 'Id,Name');
        return this._data.get('department', { search: params }).map((res) => { return res.json().Entities; });
    }
    @Effect()
    loadEmployeeGroup$: Observable<Action> = this._actions$.ofType(companyActions.ActionTypes.LOAD_EMPLOYEE_GROUP)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('direction', 'asc');
            params.set('fields', 'Id,Name,IsContractualGroup');
            params.set('pagenumber', '0');
            params.set('pagesize', '0');
            params.set('sortField', 'Name');
            //End of params           
            return this._data.get('employeegroup/getspecificfields', { search: params })
                .map((res) => new companyActions.LoadEmployeeGroupCompleteAction(res.json().Entities))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee groups', null)));
                })
        });

    @Effect()
    cqcPurchaseDetails$: Observable<Action> = this._actions$.ofType(companyActions.ActionTypes.GET_CQCPRO_PURCHASED_DETAILS)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('CompanyId', this._claimsHelper.getCompanyIdOrCid())
            return this._data.post('site/IsCQCProPurchased', null, { search: params })
                .map((res) => {
                    return new companyActions.CompanyCQCPurchasedDetailsByIdCompleteAction(res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'CQC purchase details', null)));
                })
        });

    @Effect()
    getSitesWithAddressDetails$: Observable<Action> = this._actions$.ofType(companyActions.ActionTypes.LOAD_SITES_WITH_ADDRESS)
        .map(toPayload)
        .switchMap((payload) => {

            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Name,Id,Address,Address.County,IsHeadOffice');
            params.set('pageNumber', '0');
            params.set('pageSize', '0');

            return this._data.get(`Site`, { search: params })
                .map((res) => <Site[]>(res.json().Entities))
                .mergeMap((sitesWithAddressDetails: Site[]) => {
                    return [
                        new companyActions.LoadSitesWithAddressCompleteAction(sitesWithAddressDetails),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Sites', null)));
                });
        });

    @Effect()
    nonWorkingDayProfilesList$: Observable<Action> =
    this._actions$.ofType(companyActions.ActionTypes.LOAD_ALL_NONWORKING_DAY_PROFILES)
        .map(toPayload)
        .switchMap((requestParms) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('direction', 'asc');
            params.set('pagenumber', '0');
            params.set('pagesize', '0');
            params.set('sortField', 'Name');
            params.set('isexample', 'false');
            params.set('fields', 'Id,Name,IsExample,CompanyId');
            return this._data
                .get('HolidayWorkingProfile/GetSpecificFields', { search: params })
                .map((res) => extractHWPShortModels(res))
                .switchMap((customProfiles) => {
                    params.set('isexample', 'true');
                    return this._data
                        .get('HolidayWorkingProfile/GetSpecificFields', { search: params })
                        .map((sRes) => {
                            let standardProfiles = extractHWPShortModels(sRes);
                            if (!isNullOrUndefined(standardProfiles) &&
                                standardProfiles.length > 0) {
                                standardProfiles = standardProfiles
                                    .filter(c => c.CompanyId.toLowerCase() === SystemTenantId.toLowerCase())
                            }
                            if (isNullOrUndefined(customProfiles)) {
                                customProfiles = [];
                            }
                            let profileList = customProfiles.concat(standardProfiles);
                            return new companyActions.LoadAllNonWorkingDayProfilesCompleteAction(profileList);
                        });
                });
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(
                new AtlasApiError(error, MessageEvent.Load, 'Non-Workingday', 'Non-Workingday', '')));
        });

    @Effect()
    loadUsers$: Observable<Action> = this._actions$.ofType(companyActions.ActionTypes.LOAD_USERS)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,FirstName,LastName,HasEmail,Email');
            //Paging
            params.set('pageNumber', '0');
            params.set('pageSize', '0');
            //End of Paging
            return this._data.get('users', { search: params })
                .map((res) => {
                    return new companyActions.LoadUsersCompleteAction(extractUsersData(res));
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Users', null)));
                });
        });

    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService
        , private _routeParams: RouteParams) {
    }
}
