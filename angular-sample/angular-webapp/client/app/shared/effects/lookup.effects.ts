import * as errorActions from '../../shared/actions/error.actions';
import { DocumentCategoryEnum } from '../../document/models/document-category-enum';
import { ObjectHelper } from '../helpers/object-helper';
import { Sector } from '../models/sector';
import { Workspace } from '../../checklist/models/workspace.model';
import { ProcedureGroup } from '../models/proceduregroup';
import { AtlasApiResponse } from '../models/atlas-api-response';
import { LoadProcedureGroupCompleteAction } from './../actions/lookup.actions';
import {
    extractEmployeeSalarySelectOptionListData
    , createSelectOptionFromArrayList
    , extractEventTypeSelectItems
} from '../../employee/common/extract-helpers';
import {
    extractLeavingReasonItems,
    extractReportCategories,
    extractSubReasonItems,
    extractUserSelectOptionListData
} from '../helpers/extract-helpers';
import { LoadOTCEntitiesComplete } from '../actions/lookup.actions';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams, ResponseOptions, Response } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as lookupActions from '../actions/lookup.actions';
import { EthnicGroup, IncidentCategory, WorkspaceTypes, PPECategoryGroup, MainActivity, SubActivity, GeoLocation, LocalAuthority } from '../models/lookup.models';
import {
    extractEventTypeItems
    , extractDisciplinaryOutcomeItems
    , extractOutcomeItems
    , extractIncidentCategories,
    mapToAeSelectItems,
    extractSubActivities,
    extractMainActivities,
    extractGeoLocations,
    extractLocalAuthorities,
    getRiskAssessmentTypes,
    extractProcedureGroups,
    extractUsersData
} from '../../shared/helpers/extract-helpers';
import { isNullOrUndefined } from 'util';
import { StringHelper } from '../../shared/helpers/string-helper';
import { User } from "../../email-shared/models/email.model";
import { CatchErrorAction } from '../../shared/actions/error.actions';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import { MessengerService } from '../services/messenger.service';

@Injectable()
export class LookupEffects {
    private _mainActivities: Array<MainActivity>;
    private _subActivities: Array<SubActivity>;
    private _geoLocations: Array<GeoLocation>;
    private _localAuthorities: Array<LocalAuthority>;

    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService) {

    }

    @Effect()
    countyList$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.COUNTY_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', `Id,Name`);
            params.set('pagenumber', `0`);
            params.set('pagesize', `0`);
            params.set('sortBy', `Name`);
            params.set('sortDirection', `ASC`);
            return this._data.get(`county/getspecificfields`, { search: params })
                .map((res) => new lookupActions.CountyLoadCompleteAction(res.json().Entities))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Counties', null)));
                });
        });

    @Effect()
    userListData$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.USER_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', `Id,FirstName,LastName`);
            params.set('pagenumber', `0`);
            params.set('pagesize', `0`);
            params.set('sortField', `FirstName`);
            params.set('direction', `ASC`);
            return this._data.get(`user/getspecificfields`, { search: params })
                .map((res) => new lookupActions.UserLoadCompleteAction(extractUserSelectOptionListData(res)))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Users', null)));
                });
        });


    @Effect()
    countryList$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.COUNTRY_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', `Id,Name`);
            params.set('pagenumber', `0`);
            params.set('pagesize', `0`);
            params.set('sortBy', `Name`);
            params.set('sortDirection', `ASC`);
            return this._data.get(`country/getspecificfields`, { search: params })
                .map((res) => new lookupActions.CountryLoadCompleteAction(res.json().Entities))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Countries', null)));
                });
        });

    @Effect()
    employeeRelationsList$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.EMPLOYEE_RELATIONS_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', `Id,Name`);
            params.set('pagenumber', `0`);
            params.set('pagesize', `0`);
            params.set('sortBy', `Name`);
            params.set('sortDirection', `ASC`);
            return this._data.get(`employeerelation/getspecificfields`, { search: params })
                .map((res) => new lookupActions.EmployeeRelationsLoadCompleteAction(res.json().Entities))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee Relations', null)));
                });
        });

    @Effect()
    WorkSpaceTypeOptionList$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.WORKSPACE_TYPE_LOAD)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            //param
            params.set('direction', 'asc');
            params.set('fields', 'Id,Name,PictureId');
            params.set('pagenumber', '0');
            params.set('pagesize', '0');
            //End of params           
            return this._data.get('WorkspaceType/getspecificfields', { search: params })
                .map((res) => {
                    return new lookupActions.WorkSpaceTypeLoadCompleteAction(res.json().Entities as Workspace[])
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Workspace types', null)));
                });
        });



    @Effect()
    EmploymentStatusOptionList$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.EMPLOYMENT_STATUS_LOAD)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            //param
            params.set('direction', 'asc');
            params.set('fields', 'Id,Name');
            params.set('pagenumber', '0');
            params.set('pagesize', '0');
            params.set('sortField', 'Name');
            //End of params           
            return this._data.get('employeestatus/getspecificfields', { search: params })
                .map((res) => {
                    return new lookupActions.EmploymentStatusLoadCompleteAction(extractEmployeeSalarySelectOptionListData(res))
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee status', null)));
                });
        });

    @Effect()
    EmploymentTypeOptionList$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.EMPLOYMENT_TYPE_LOAD)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            //param
            params.set('direction', 'asc');
            params.set('fields', 'Id,Name');
            params.set('pagenumber', '0');
            params.set('pagesize', '0');
            //End of params           
            return this._data.get('employmenttype/getspecificfields', { search: params })
                .map((res) => {
                    return new lookupActions.EmploymentTypeLoadCompleteAction(extractEmployeeSalarySelectOptionListData(res));
                }).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employment types', null)));
                });
        });

    @Effect()
    SalaryPeriodOptionList$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_PERIOD_OPTION)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            //param
            params.set('direction', 'asc');
            params.set('fields', 'Id,Name');
            params.set('pagenumber', '0');
            params.set('pagesize', '0');
            params.set('sortField', 'Name');
            //End of params           
            return this._data.get('EmployeePeriod/getspecificfields', { search: params })
                .map((res) => {
                    return new lookupActions.LoadPeriodOptionCompleteAction(extractEmployeeSalarySelectOptionListData(res));
                }).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee salary period', null)));
                });
        });


    @Effect()
    absenceStatusList$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_ABSENCE_STATUS)
        .switchMap(() => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', `Id,Name,Code,IsRequestedStatus`);
            params.set('pagenumber', `0`);
            params.set('pagesize', `0`);
            params.set('sortField', `Name`);
            params.set('direction', `ASC`);
            return this._data.get(`AbsenceStatus/getspecificfields`, { search: params })
                .map((res) => new lookupActions.AbsenceStatusLoadCompleteAction(res.json().Entities)).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Absence status list', null)));
                });
        });

    @Effect()
    metaData$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_OTC_ENTITIES)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('optionalParam', `true`);
            return this._data.get('EntityTemplate/GetOtcEntities', { search: params })
                .map((res) => new LoadOTCEntitiesComplete(res.json()))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Entity Template', null)));
                });
        });


    private _getEthnicGroups(): Observable<EthnicGroup[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('fields', `Id,Name,EthnicGroupTypeId,EthnicGroupValueType,SequenceId,EthnicGroupType.SequenceId as EthnicGroupTypeSequenceId,
            EthnicGroupType.Name as EthnicGroupTypeName`);
        params.set('pageNumber', '0');
        params.set('pageSize', '0');
        params.set('sortField', 'Name');
        params.set('direction', 'desc');
        return this._data.get(`ethnicgroupvalue`, { search: params }).map((res) => res.json().Entities)
    }

    @Effect()
    employeeEthinicGroups$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.EMPLOYEE_ETHINICGROUP_LOAD)
        .switchMap(() => {
            return this._getEthnicGroups();
        })
        .map((res) => new lookupActions.EmployeeEthinicGroupLoadCompleteAction(res))
        .catch((error) => {
            return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Ethnic groups', null)));
        });

    @Effect()
    ReportCategories$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.REPORT_CATEGORIES)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            //param
            params.set('direction', 'asc');
            params.set('fields', 'Id,Name');
            params.set('pagenumber', '0');
            params.set('pagesize', '0');
            //End of params           
            return this._data.get('ReportCategory/getspecificfields', { search: params });
        })
        .map((res) => {
            return new lookupActions.LoadReportCategoriesComplete(extractReportCategories(res));
        });



    @Effect()
    eventTypes$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.EMPLOYEE_TIMELINE_EVENT_TYPES_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('action', 'getspecificfields');
            params.set('fields', 'Id,Title,OrderNo,HasTaskCreation');
            return this._data.get('EventType', { search: params })
                .map((res) => new lookupActions.EmployeeTimelineEventTypesLoadComplete(extractEventTypeItems(res.json())))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Event types', null)));
                });
        });

    @Effect()
    disciplinanyOutcome$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.EMPLOYEE_TIMELINE_EVENT_DISCIPLINARY_OUTCOME)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Title,Id,OrderNo,Code');
            params.set('pageNumber', '0');
            params.set('pageSize', '0');
            return this._data.get('DisciplinaryOutcome/getspecificfields', { search: params })
                .map((res) => new lookupActions.EmployeeTimelineEventDisciplinaryOutcomeComplete(extractDisciplinaryOutcomeItems(res.json())))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Disciplinary Outcome list', null)));
                });
        });

    @Effect()
    outcome$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.EMPLOYEE_TIMELINE_EVENT_OUTCOME)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Title,Id,OrderNo');
            params.set('pageNumber', '0');
            params.set('pageSize', '0');
            params.set('sortField', 'Title');
            params.set('direction', 'ASC');
            return this._data.get('Outcome/getspecificfields', { search: params })
                .map((res) => new lookupActions.EmployeeTimelineEventOutcomeComplete(extractOutcomeItems(res.json()))).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Outcome list', null)));
                });
        });


    @Effect()
    incidentCategoies$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_INCIDENT_CATEGORIES)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', `Id,Name,Code`);
            params.set('pagenumber', `0`);
            params.set('pagesize', `0`);
            params.set('sortBy', `Name`);
            params.set('sortDirection', `ASC`);
            return this._data.get(`incidentcategory/getspecificfields`, { search: params })
                .map((res) => new lookupActions.LoadIncidentCategoriesComplete(extractIncidentCategories(res)))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Incident categories', null)));
                });
        });

    @Effect()
    leavingReason$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.EMPLOYEE_TIMELINE_EVENT_REASONSFORLEAVING_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Title,Id,OrderNo');
            params.set('pageNumber', '0');
            params.set('pageSize', '0');
            params.set('sortField', 'Title');
            params.set('direction', 'ASC');
            return this._data.get('LeavingReason/getspecificfields', { search: params })
                .map((res) => new lookupActions.EmployeeTimelineLoadReasonsForLeavingComplete(extractLeavingReasonItems(res.json())))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Leaving Reasons', null)));
                });
        });


    @Effect()
    subReason$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.EMPLOYEE_TIMELINE_EVENT_SUB_REASON_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Title,Id,OrderNo,LeavingReasonId');
            params.set('pageNumber', '0');
            params.set('pageSize', '0');
            params.set('sortField', 'Title');
            params.set('direction', 'ASC');
            return this._data.get('SubReason/getspecificfields', { search: params })
                .map((res) => new lookupActions.EmployeeTimelineLoadSubReasonsComplete(extractSubReasonItems(res.json())))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Sub Reasons', null)));
                });
        });


    @Effect()
    userProfileList$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.USERPROFILE_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', `Id,Name`);
            params.set('pagenumber', `0`);
            params.set('pagesize', `0`);
            params.set('sortBy', `Name`);
            params.set('sortDirection', `ASC`);
            params.set('isExample', this._claimsHelper.IsLoadExampleProfiles);

            return this._data.get(`UserProfile/getspecificfields`, { search: params })
                .map((res) => new lookupActions.UserProfileLoadCompleteAction(res.json().Entities)).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'User profiles', null)));
                });
        });

    @Effect()
    loadAbsenceCodes$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_ABSENCE_CODE)
        .switchMap(() => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,NameAndCode,Name');
            return this._data.get('AbsenceCode', { search: params })
                .map((res) => new lookupActions.LoadAbsenceCodeCompleteAction(res.json()))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Absence codes', null)));
                });
        });

    @Effect()
    loadProcedureGroups$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_PROCEDURE_GROUPS)
        .switchMap(() => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,Name,Code');
            params.set('pagenumber', `0`);
            params.set('pagesize', `0`);
            params.set('sortBy', `Name`);
            params.set('sortDirection', `ASC`);
            return this._data.get('ProcedureGroup', { search: params })
                .map((res) => new lookupActions.LoadProcedureGroupCompleteAction(extractProcedureGroups(res)))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Procedure Groups', null)));
                });
        });

    @Effect()
    loadAdditionalService$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_ADDITIONAL_SERVICE)
        .switchMap(() => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,Title,Code,OrderNumber');
            params.set('pagenumber', `0`);
            params.set('pagesize', `0`);
            params.set('sortBy', `Code`);
            params.set('sortDirection', `ASC`);
            return this._data.get('AdditionalService', { search: params })
                .map((res) => new lookupActions.LoadAdditionalServiceCompleteAction(res.json()))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Additional Services', null)));
                });
        });

    @Effect()
    loadSectorsData$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_SECTORS)
        .switchMap((data) => {
            return this._data.get('Sector')
                .map((res) => {
                    return new lookupActions.LoadSectorsActionComplete(res.json());
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Sectors', null)));
                });
        });


    @Effect()
    incidentTypeList$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.INCIDENT_TYPE_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            return this._data.get(`IncidentType`)
                .map((res) => new lookupActions.IncidentTypeLoadCompleteAction(res.json())).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Incident types', null)));
                });
        });

    @Effect()
    injuryTypeList$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.INJURY_TYPE_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            return this._data.get(`InjuryType`)
                .map((res) => new lookupActions.InjuryTypeLoadCompleteAction(res.json()))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Injury types', null)));
                });
        });

    @Effect()
    injuredPartList$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.INJURED_PART_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('keyValue', `true`);
            return this._data.get(`InjuredPart`, { search: params })
                .map((res) => new lookupActions.InjuredPartLoadCompleteAction(res.json()))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Injured party', null)));
                });
        });

    @Effect()
    workProcessList$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.WORK_PROCESS_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('keyValue', `true`);
            return this._data.get(`workprocess`, { search: params })
                .map((res) => new lookupActions.WorkProcessLoadCompleteAction(res.json()))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Work process list', null)));
                });
        });

    @Effect()
    mainFactorList$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.MAIN_FACTOR_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('keyValue', `true`);
            return this._data.get(`mainfactor`, { search: params })
                .map((res) => new lookupActions.MainFactorLoadCompleteAction(res.json()))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Main factors', null)));
                });
        });

    @Effect()
    ppeCategoryGroupds$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_PPECATEGORY_GROUPS)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('action', 'getspecificfields');
            params.set('fields', 'Id,Name,OrderIndex,Code,PPECategories');
            params.set('pageNumber', '0');
            params.set('pageSize', '0');
            return this._data.get('PPECategoryGroup', { search: params })
                .map((res) =>
                    new lookupActions.LoadPPECategoryGroupsCompleteAction(res.json().Entities)
                ).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'PPE Category Groups', null)));
                });
        });

    @Effect()
    loadMainIndustriesData$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_MAIN_INDUSTRY)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Name,Id');
            params.set('pageNumber', '0');
            params.set('pageSize', '0');
            params.set('sortField', 'Name');
            params.set('direction', 'ASC');
            return this._data.get('MainIndustry/getspecificfields', { search: params })
                .map((res) => {
                    return new lookupActions.LoadMainIndustryCompleteAction(mapToAeSelectItems(res, true));
                }).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Main industries', null)));
                });
        });

    @Effect()
    loadMainActivitiesData$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_MAIN_ACTIVITY)
        .map(toPayload)
        .switchMap((mainIndustryId: string) => {
            if (isNullOrUndefined(this._mainActivities)) {
                let params: URLSearchParams = new URLSearchParams();
                params.set('fields', 'Name,Id,MainIndustryId');
                params.set('pageNumber', '0');
                params.set('pageSize', '0');
                params.set('sortField', 'Name');
                params.set('direction', 'ASC');
                return this._data.get('MainActivity/getspecificfields', { search: params })
                    .map(res => {
                        this._mainActivities = extractMainActivities(res);
                        if (!StringHelper.isNullOrUndefinedOrEmpty(mainIndustryId)) {
                            return this._mainActivities.filter(c => c.MainIndustryId.toLowerCase() === mainIndustryId.toLowerCase());
                        } else {
                            return this._mainActivities;
                        }
                    });

            } else {
                return Observable.of((StringHelper.isNullOrUndefinedOrEmpty(mainIndustryId) ?
                    this._mainActivities :
                    this._mainActivities.filter(c => c.MainIndustryId.toLowerCase() ===
                        mainIndustryId.toLowerCase())));
            }
        })
        .map((items) => {
            let options = new ResponseOptions({
                body: { Entities: items }
            });
            let resp = new Response(options);
            return new lookupActions.LoadMainActivityCompleteAction(mapToAeSelectItems(resp, true));
        }).catch((error) => {
            return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Main Activites', null)));
        });;

    @Effect()
    loadSubActivitiesData$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_SUB_ACTIVITY)
        .map(toPayload)
        .switchMap((mainActivityId: string) => {
            if (isNullOrUndefined(this._subActivities)) {
                let params: URLSearchParams = new URLSearchParams();
                params.set('fields', 'Name,Id,MainActivityId');
                params.set('pageNumber', '0');
                params.set('pageSize', '0');
                params.set('sortField', 'Name');
                params.set('direction', 'ASC');
                return this._data.get('SubActivity/getspecificfields', { search: params })
                    .map(res => {
                        this._subActivities = extractSubActivities(res);
                        return StringHelper.isNullOrUndefinedOrEmpty(mainActivityId) ?
                            this._subActivities :
                            this._subActivities.filter(c => c.MainActivityId.toLowerCase() ===
                                mainActivityId.toLowerCase());
                    })

            } else {
                return Observable.of((StringHelper.isNullOrUndefinedOrEmpty(mainActivityId) ?
                    this._subActivities :
                    this._subActivities.filter(c => c.MainActivityId.toLowerCase() ===
                        mainActivityId.toLowerCase())));
            }
        })
        .map((items) => {
            let options = new ResponseOptions({
                body: { Entities: items }
            });
            let resp = new Response(options);
            return new lookupActions.LoadSubActivityCompleteAction(mapToAeSelectItems(resp, true));
        }).catch((error) => {
            return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Sub Activites', null)));
        });;

    @Effect()
    loadGeoLocationsData$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_GEO_LOCATIONS)
        .map(toPayload)
        .switchMap((countryId: string) => {
            if (isNullOrUndefined(this._geoLocations)) {
                let params: URLSearchParams = new URLSearchParams();
                params.set('fields', 'Name,Id,CountryId');
                params.set('pageNumber', '0');
                params.set('pageSize', '0');
                params.set('sortField', 'Name');
                params.set('direction', 'ASC');
                return this._data.get('GeoRegion/getspecificfields', { search: params })
                    .map(res => {
                        this._geoLocations = extractGeoLocations(res);
                        return StringHelper.isNullOrUndefinedOrEmpty(countryId) ?
                            this._geoLocations :
                            this._geoLocations.filter(c => c.CountryId.toLowerCase() ===
                                countryId.toLowerCase());
                    })

            } else {
                return Observable.of((StringHelper.isNullOrUndefinedOrEmpty(countryId) ?
                    this._geoLocations :
                    this._geoLocations.filter(c => c.CountryId.toLowerCase() ===
                        countryId.toLowerCase())));
            }
        })
        .map((items) => {
            let options = new ResponseOptions({
                body: { Entities: items }
            });
            let resp = new Response(options);
            return new lookupActions.LoadGeoLocationsCompleteAction(mapToAeSelectItems(resp, false));
        }).catch((error) => {
            return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Geo regions', null)));
        });

    @Effect()
    loadLocalAuthoritiesData$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_LOCAL_AUTHORITIES)
        .map(toPayload)
        .switchMap((geoRegionId: string) => {
            if (isNullOrUndefined(this._localAuthorities)) {
                let params: URLSearchParams = new URLSearchParams();
                params.set('fields', 'Name,Id,GeoRegionId');
                params.set('pageNumber', '0');
                params.set('pageSize', '0');
                params.set('sortField', 'Name');
                params.set('direction', 'ASC');
                return this._data.get('LocalAuthority/getspecificfields', { search: params })
                    .map(res => {
                        this._localAuthorities = extractLocalAuthorities(res);
                        return StringHelper.isNullOrUndefinedOrEmpty(geoRegionId) ?
                            this._localAuthorities :
                            this._localAuthorities.filter(c => c.GeoRegionId.toLowerCase() ===
                                geoRegionId.toLowerCase());
                    })
            } else {
                return Observable.of((StringHelper.isNullOrUndefinedOrEmpty(geoRegionId) ?
                    this._localAuthorities :
                    this._localAuthorities.filter(c => c.GeoRegionId.toLowerCase() ===
                        geoRegionId.toLowerCase())));
            }
        })
        .map((items) => {
            let options = new ResponseOptions({
                body: { Entities: items }
            });
            let resp = new Response(options);
            return new lookupActions.LoadLocalAuthoritiesCompleteAction(mapToAeSelectItems(resp, false));
        });


    @Effect()
    loadRiskAssessmentTypes$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_RISK_ASSESSMENT_TYPES)
        .switchMap((data) => {
            return this._data.get('RiskAssessmentType')
                .map((res) => {
                    return new lookupActions.LoadRiskAssessmentTypesCompleteAction(getRiskAssessmentTypes(res));
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Risk Assessment types', null)));
                });
        });

    @Effect()
    loadResponsibilities$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_RESPONSIBILITIES)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('action', 'getspecificfields');
            params.set('fields', 'Name,Id,OrderIndex,Code');
            params.set('pageNumber', '0');
            params.set('pageSize', '0');
            return this._data.get('Responsibilities', { search: params })
                .map((res) => {
                    return new lookupActions.LoadResponsibilitiesCompleteAction((res.json().Entities));
                })
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Responsibilities', null)));
                });
        });
    @Effect()
    loadHelpAreas$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_HELP_AREAS)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('currentPage', action.payload.currentPage);
            params.set('direction', action.payload.direction);
            params.set('fields', action.payload.fields);
            params.set('pageNumber', action.payload.pageNumber);
            params.set('pageSize', action.payload.pageSize);
            params.set('sortField', action.payload.sortField);
            return this._data.get('HelpArea', { search: params })
        })
        .map((res) => {
            {
                return new lookupActions.LoadHelpAreasActionCompleteAction(res.json().Entities);
            }
        }).catch((error) => {
            return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'HelpAreas', null)));
        });

    @Effect()
    loadStandardIcons$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_STANDARD_ICONS)
        .map(toPayload)
        .switchMap((_payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('category', DocumentCategoryEnum.StandardHazardIcons.toString());
            return this._data.get('documentview', { search: params })
                .mergeMap((res) => {
                    return [new lookupActions.LoadStandardIconsCompleteAction((res.json()))];
                })
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'risk assessment', 'standard hazard icons')));
        });

    @Effect()
    loadStandardControlIcons$: Observable<Action> = this._actions$.ofType(lookupActions.ActionTypes.LOAD_STANDARD_CONTROL_ICONS)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('category', DocumentCategoryEnum.StandardControlIcons.toString())
            return this._data.get('documentview', { search: params })
                .map((res) => {
                    return new lookupActions.LoadStandardControlIconsCompleteAction(res.json())
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'risk assessment', 'standard control icons')));
                })
        })
}
