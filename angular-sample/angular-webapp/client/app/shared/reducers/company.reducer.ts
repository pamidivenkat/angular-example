import { EmployeeGroup } from './../models/company.models';
import { getAtlasParamValueByKey } from '../../root-module/common/extract-helpers';
import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { isNullOrUndefined } from 'util';
import { Country, County, EmployeeRelations, UserProfile } from '../models/lookup.models';
import { Observable } from 'rxjs/Rx';
import { Action, ActionReducer, combineReducers } from '@ngrx/store';
import * as commonActions from '../actions/company.actions';
import { compose } from '@ngrx/core';
import { Department } from '../../calendar/model/calendar-models';
import { EmployeeSettings, FiscalYear, AbsenceType, AbsenceSubType, JobTitle } from '../models/company.models';
import * as Immutable from 'immutable';
import { PagingInfo } from './../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from './../../atlas-elements/common/models/ae-datatable-options';
import { extractDataTableOptions, mapSiteLookupTableToAeSelectItems, addOtherOptions, removeDuplicateAbsenceTypes } from './../helpers/extract-helpers';
import { AtlasApiRequestWithParams, AtlasParams } from './../models/atlas-api-response';
import { CommonHelpers } from './../helpers/common-helpers'
import { Site } from './../models/site.model';
import { HWPShortModel } from '../../company/nonworkingdaysandbankholidays/models/nonworkingdays-model';
import { User } from "../../email-shared/models/email.model";

export interface CompanyState {
    Status: boolean,
    SiteData: Array<Site>,
    SiteWithAddressData: Array<Site>,
    DepartmentsData: Department[],
    hasSiteDataLoaded: boolean,
    EmployeeSettings: EmployeeSettings,
    hasEmployeeSettingsLoaded: boolean,
    FiscalYears: Array<FiscalYear>,
    hasFiscalYearsLoaded: boolean,
    AbsenceTypes: Array<AbsenceType>,
    hasAbsencetypesLoaded: boolean,

    AbsenceTypeList: AbsenceType[];
    AbsenceTypePagingInfo: PagingInfo;
    AbsenceTypeListTotalCount: number;
    currentApiRequest: AtlasApiRequestWithParams;

    AbsenceSubTypes: Array<AbsenceSubType>,
    hasAbsenceSubtypesLoaded: boolean,
    JobTitleOptionList: AeSelectItem<string>[];
    HasJobTitleOptionListLoaded: boolean;
    UserProfiles: Array<UserProfile>,
    UserProfileOptionsList: Immutable.List<AeSelectItem<string>>,
    HasUserProfilesLoaded: boolean,
    EmployeeGroup: Array<EmployeeGroup>

    // export to cqc  
    hasCQCPruchaseDetailsLoaded: boolean;
    IsCQCPurchased: boolean;
    CQCSites: Site[];

    NonWorkingDayProfilesList: Array<HWPShortModel>;
    Users: User[];
    IsUsersLoaded: boolean;

    JobTitleDetails: JobTitle
}

const initialState = {
    Status: false,
    SiteData: null,
    SiteWithAddressData: null,
    DepartmentsData: null,
    EmployeeSettings: null,
    hasEmployeeSettingsLoaded: false,
    hasSiteDataLoaded: false,
    FiscalYears: null,
    hasFiscalYearsLoaded: false,
    AbsenceTypes: null,

    AbsenceTypeList: null,
    AbsenceTypePagingInfo: null,
    AbsenceTypeListTotalCount: null,
    currentApiRequest:null,

    hasAbsencetypesLoaded: false,
    AbsenceSubTypes: null,
    hasAbsenceSubtypesLoaded: false,
    JobTitleOptionList: null,
    HasJobTitleOptionListLoaded: false,


    UserProfiles: null,
    UserProfileOptionsList: null,
    HasUserProfilesLoaded: false,
    EmployeeGroup: null,

    hasCQCPruchaseDetailsLoaded: false,
    IsCQCPurchased: false,
    CQCSites: null,

    NonWorkingDayProfilesList: null,
    Users: null,
    IsUsersLoaded: false,

    JobTitleDetails: null
}

export function companyReducer(state = initialState, action: Action): CompanyState {
    switch (action.type) {
        case commonActions.ActionTypes.LOAD_SITES:
            {
                return Object.assign({}, state, { hasSiteDataLoaded: false });
            }

        case commonActions.ActionTypes.LOAD_SITES_COMPLETE:
            {
                return Object.assign({}, state, { hasSiteDataLoaded: true, SiteData: action.payload });
            }
        case commonActions.ActionTypes.LOAD_SITES_WITH_ADDRESS:
            {
                return Object.assign({}, state, {});
            }

        case commonActions.ActionTypes.LOAD_SITES_WITH_ADDRESS_COMPLETE:
            {
                return Object.assign({}, state, { SiteWithAddressData: action.payload });
            }

        case commonActions.ActionTypes.LOAD_EMPLOYEE_SETTINGS:
            {
                return Object.assign({}, state, { hasEmployeeSettingsLoaded: false });
            }

        case commonActions.ActionTypes.LOAD_EMPLOYEE_SETTINGS_COMPLETE:
            {
                return Object.assign({}, state, { hasEmployeeSettingsLoaded: true, EmployeeSettings: action.payload });
            }
        case commonActions.ActionTypes.LOAD_FISCAL_YEARS:
            {
                return Object.assign({}, state, { hasFiscalYearsLoaded: false });
            }

        case commonActions.ActionTypes.LOAD_FISCAL_YEARS_COMPLETE:
            {
                return Object.assign({}, state, { hasFiscalYearsLoaded: true, FiscalYears: action.payload });
            }
        case commonActions.ActionTypes.LOAD_ABSENCE_TYPE:
            {
                return Object.assign({}, state, { hasAbsencetypesLoaded: false });
            }

        case commonActions.ActionTypes.LOAD_ABSENCE_TYPE_COMPLETE:
            {
                return Object.assign({}, state, { hasAbsencetypesLoaded: true, AbsenceTypes: action.payload });
            }
        case commonActions.ActionTypes.LOAD_ABSENCE_SUBTYPE:
            {
                return Object.assign({}, state, { hasAbsenceSubtypesLoaded: false });
            }

        case commonActions.ActionTypes.LOAD_ABSENCE_SUBTYPE_COMPLETE:
            {
                return Object.assign({}, state, { hasAbsenceSubtypesLoaded: true, AbsenceSubTypes: action.payload });
            }


        case commonActions.ActionTypes.JOB_TITLE_OPTION_LOAD:
            {
                return Object.assign({}, state, { HasJobTitleOptionListLoaded: false });
            }

        case commonActions.ActionTypes.JOB_TITLE_OPTION_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { HasJobTitleOptionListLoaded: true, JobTitleOptionList: action.payload });
            }
        case commonActions.ActionTypes.LOAD_ALL_DEPARTMENTS_COMPLETE: {
            return Object.assign({}, state, { DepartmentsData: action.payload });
        }
        case commonActions.ActionTypes.LOAD_EMPLOYEE_GROUP:
            {
                return Object.assign({}, state);
            }
        case commonActions.ActionTypes.LOAD_EMPLOYEE_GROUP_COMPLETE: {
            return Object.assign({}, state, { EmployeeGroup: action.payload });
        }

        case commonActions.ActionTypes.LOAD_ABSENCE_TYPE_LIST_DATA: {
            let request = <AtlasApiRequestWithParams>action.payload;
            let modifiedState: CompanyState = Object.assign({}, state);
            let params = <AtlasParams[]>request.Params;
            modifiedState.currentApiRequest = request;
            let companyId: string = getAtlasParamValueByKey(params, 'CompanyId').toString().toLowerCase();
            let absenceTypeAfterFilter = modifiedState.AbsenceTypes.filter(ma => ma.CompanyId == companyId);
            let absenceTotalCount = absenceTypeAfterFilter.length;
            absenceTypeAfterFilter = CommonHelpers.sortArray(absenceTypeAfterFilter, request.SortBy.SortField, request.SortBy.Direction);
            let startPage = (request.PageNumber * request.PageSize) - request.PageSize;
            let endPage = (request.PageNumber * request.PageSize);
            let slicedAbsenceType = absenceTypeAfterFilter.slice(startPage, endPage);
            modifiedState.AbsenceTypeList = slicedAbsenceType;
            modifiedState.AbsenceTypePagingInfo = new PagingInfo(request.PageSize, absenceTotalCount, request.PageNumber, request.PageSize);
            return modifiedState;
        }

        case commonActions.ActionTypes.LOAD_USER_PROFILES: {
            return Object.assign({}, state, { HasUserProfilesLoaded: false });
        }
        case commonActions.ActionTypes.LOAD_USER_PROFILES_COMPLETE: {
            return Object.assign({}, state, {
                HasUserProfilesLoaded: true,
                UserProfiles: action.payload.UserProfiles,
                UserProfileOptionsList: action.payload.UserProfileOptionsList
            });
        }
        case commonActions.ActionTypes.GET_CQCPRO_PURCHASED_DETAILS:
            {
                return Object.assign({}, state, { hasCQCPruchaseDetailsLoaded: false });
            }
        case commonActions.ActionTypes.GET_CQCPRO_PURCHASED_DETAILS_COMPLETE:
            {
                return Object.assign({}, state, { hasCQCPruchaseDetailsLoaded: true, IsCQCPurchased: action.payload.IsCQCProPurchased, CQCSites: action.payload.Sites });
            }

        case commonActions.ActionTypes.RESET_COMPANY_STATE_ON_COMPANY_CHANGE: {
            return Object.assign(state, initialState);
        }
        case commonActions.ActionTypes.LOAD_ALL_NONWORKING_DAY_PROFILES_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.NonWorkingDayProfilesList = action.payload;
                return modifiedState;
            }
        case commonActions.ActionTypes.LOAD_USERS:
            {
                return Object.assign({}, state, { IsUsersLoaded: false, Users: null });
            }
        case commonActions.ActionTypes.LOAD_USERS_COMPLETE:
            {
                return Object.assign({}, state, { IsUsersLoaded: true, Users: action.payload });
            }
        case commonActions.ActionTypes.ADD_JOB_TITLE:
            {
                return Object.assign({}, state, { JobTitleDetails: null });
            }

        case commonActions.ActionTypes.ADD_JOB_TITLE_COMPLETE:
            {
                return Object.assign({}, state, { JobTitleDetails: action.payload });
            }
        case commonActions.ActionTypes.CLEAR_JOB_TITLE:
            {
                return Object.assign({}, state, { JobTitleDetails: null });
            }

        default:
            return state;
    }
}

export function sitesData(state$: Observable<CompanyState>): Observable<Site[]> {
    return state$.select(s => s.SiteData);
}

export function sitesWithAddressData(state$: Observable<CompanyState>): Observable<Site[]> {
    return state$.select(s => s.SiteWithAddressData);
}

export function sitesImmutableData(state$: Observable<CompanyState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.SiteData && Immutable.List(s.SiteData).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }).toList());
}
export function sitesWithOtherOptions(state$: Observable<CompanyState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.SiteData && Immutable.List(addOtherOptions(s.SiteData)).map(<site>(keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }).toList());

}
export function getsitesForMultiSelect(state$: Observable<CompanyState>): Observable<AeSelectItem<string>[]> {
    return state$.select(s => s.SiteData && (s.SiteData).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.SiteNameAndPostcode, keyValuePair.Id);
        return aeSelectItem;
    }));
}

export function sitesForClientsImmutable(state$: Observable<CompanyState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.SiteData && mapSiteLookupTableToAeSelectItems(s.SiteData));
}
export function getsitesClientsForMultiSelect(state$: Observable<CompanyState>): Observable<AeSelectItem<string>[]> {
    return state$.select(s => s.SiteData && (s.SiteData).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }));
}

export function activeSitesData(state$: Observable<CompanyState>): Observable<Site[]> {
    return state$.select(state => state.SiteData && state.SiteData.filter(state => state.IsActive === true));
}

export function siteDataLoadStatus(state$: Observable<CompanyState>): Observable<boolean> {
    return state$.select(s => s.hasSiteDataLoaded);
}

export function employeeSettingsData(state$: Observable<CompanyState>): Observable<EmployeeSettings> {
    return state$.select(s => s.EmployeeSettings);
}

export function employeeSettingsLoadStatus(state$: Observable<CompanyState>): Observable<boolean> {
    return state$.select(s => s.hasEmployeeSettingsLoaded);
}

export function fiscalYearsData(state$: Observable<CompanyState>): Observable<Array<FiscalYear>> {
    return state$.select(s => s.FiscalYears);
}

export function fiscalYearsLoadStatus(state$: Observable<CompanyState>): Observable<boolean> {
    return state$.select(s => s.hasFiscalYearsLoaded);
}

export function absenceTypesData(state$: Observable<CompanyState>): Observable<Array<AbsenceType>> {
    return state$.select(s => s.AbsenceTypes);
}

export function absenceTypesWithoutDuplicates(state$: Observable<CompanyState>): Observable<Array<AbsenceType>> {
    return state$.select(s => s.AbsenceTypes && removeDuplicateAbsenceTypes(s.AbsenceTypes));
}

/**AbsenceType DataList Start**/
export function getAbsenceTypeList(state$: Observable<CompanyState>): Observable<Immutable.List<AbsenceType>> {
    return state$.select(s => s.AbsenceTypeList && Immutable.List<AbsenceType>(s.AbsenceTypeList));
}

export function getAbsenceTypeListTotalCount(state$: Observable<CompanyState>): Observable<number> {
    return state$.select(state => state.AbsenceTypePagingInfo && state.AbsenceTypePagingInfo.TotalCount);
}

export function getAbsenceTypeListDataTableOptions(state$: Observable<CompanyState>): Observable<DataTableOptions> {
    return state$.select(s => s.AbsenceTypeList && s.AbsenceTypePagingInfo && s.currentApiRequest && extractDataTableOptions(s.AbsenceTypePagingInfo,s.currentApiRequest.SortBy));
}
/**AbsenceType DataList End**/


export function absenceTypesLoadStatus(state$: Observable<CompanyState>): Observable<boolean> {
    return state$.select(s => s.hasAbsencetypesLoaded);
}

export function absenceSubtypesData(state$: Observable<CompanyState>): Observable<Array<AbsenceSubType>> {
    return state$.select(s => s.AbsenceSubTypes);
}

export function absenceSubtypesLoadStatus(state$: Observable<CompanyState>): Observable<boolean> {
    return state$.select(s => s.hasAbsenceSubtypesLoaded);
}

export function getCommonState(state$: Observable<CompanyState>): Observable<CompanyState> {
    return state$;
}

export function canAddMyHoliday(state$: Observable<CompanyState>): Observable<boolean> {
    return state$.select(state => state && state.EmployeeSettings && state.EmployeeSettings.CanEmployeeAddHolidays);
}

export function getJobTitleOptionListData(state$: Observable<CompanyState>): Observable<AeSelectItem<string>[]> {
    return state$.filter(s => !isNullOrUndefined(s.JobTitleOptionList)).select(s => s.JobTitleOptionList);
}

export function getJobTitleOptionListDataStatus(state$: Observable<CompanyState>): Observable<boolean> {
    return state$.select(s => s.HasJobTitleOptionListLoaded);
}

export function canEmployeeViewAbsenceHistory(state$: Observable<CompanyState>): Observable<boolean> {
    return state$.select(state => state && state.EmployeeSettings && state.EmployeeSettings.CanEmployeeViewAbsenceHistory);
}

export function getAllDepartmentsData(state$: Observable<CompanyState>): Observable<Department[]> {
    return state$.select(state => state && state.DepartmentsData);
}
export function getAllEmployeeGroupsData(state$: Observable<CompanyState>): Observable<EmployeeGroup[]> {
    return state$.select(state => state && state.EmployeeGroup);
}

export function getAllDepartmentsImmutableData(state$: Observable<CompanyState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.DepartmentsData && Immutable.List(s.DepartmentsData).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }).toList());
}

export function getAllDepartmentsForMultiSelect(state$: Observable<CompanyState>): Observable<AeSelectItem<string>[]> {
    return state$.select(s => s.DepartmentsData && (s.DepartmentsData).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }));
}

export function getEmployeeGroups(state$: Observable<CompanyState>): Observable<EmployeeGroup[]> {
    return state$.select(state => state && state.EmployeeGroup);
}

export function getEmployeeGroupsImmutable(state$: Observable<CompanyState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.EmployeeGroup && Immutable.List(s.EmployeeGroup).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }).toList());
}

export function getEmployeeGroupsForMultiSelect(state$: Observable<CompanyState>): Observable<AeSelectItem<string>[]> {
    return state$.select(s => s.EmployeeGroup && (s.EmployeeGroup).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }));
}

export function getUserProfilesLoaded(state$: Observable<CompanyState>): Observable<boolean> {
    return state$.select(state => state && state.HasUserProfilesLoaded);
}

export function getUserProfilesOptionsList(state$: Observable<CompanyState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(state => state && state.UserProfileOptionsList);
}

export function getUserProfilesData(state$: Observable<CompanyState>): Observable<Array<UserProfile>> {
    return state$.select(state => state && state.UserProfiles);
}

// cqc funtions

export function getCQCPurchaseDetailsLoadingStatus(state$: Observable<CompanyState>): Observable<boolean> {
    return state$.select(s => s.hasCQCPruchaseDetailsLoaded);
}

export function getCQCPurchaseStatus(state$: Observable<CompanyState>): Observable<boolean> {
    return state$.select(s => s.IsCQCPurchased);
}

export function getCQCSites(state$: Observable<CompanyState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.CQCSites && Immutable.List(s.CQCSites).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.SiteNameAndPostcode, keyValuePair.Id);
        return aeSelectItem;
    }).toList());
}

export function getNonWorkingDayProfiles(state$: Observable<CompanyState>): Observable<Array<HWPShortModel>> {
    return state$.select(s => s.NonWorkingDayProfilesList);
};

export function getUsersData(state$: Observable<CompanyState>): Observable<User[]> {
    return state$.select(s => s.Users);
}

export function getUsersLoadingStatus(state$: Observable<CompanyState>): Observable<boolean> {
    return state$.select(s => s.IsUsersLoaded);
}

export function jobTitleData(state$: Observable<CompanyState>): Observable<JobTitle> {
    return state$.select(s => s.JobTitleDetails);
}