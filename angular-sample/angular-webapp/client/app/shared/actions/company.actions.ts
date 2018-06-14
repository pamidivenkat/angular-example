import { EmployeeGroup } from './../models/company.models';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';
import { Department } from '../../calendar/model/calendar-models';
import { EmployeeSettings, FiscalYear, AbsenceType, AbsenceSubType, JobTitle } from '../models/company.models';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../models/atlas-api-response';
import { Site } from './../models/site.model';
import { HWPShortModel } from '../../company/nonworkingdaysandbankholidays/models/nonworkingdays-model';
import { User } from '../../email-shared/models/email.model';

export const ActionTypes = {
    LOAD_SITES: type('[Sites] Load sites'),
    LOAD_SITES_COMPLETE: type('[Sites] Load sites complete'),
    LOAD_SITES_WITH_ADDRESS: type('[Sites] Load sites with address'),
    LOAD_SITES_WITH_ADDRESS_COMPLETE: type('[Sites] Load sites with address complete'),
    LOAD_ALL_DEPARTMENTS: type('[Department] Load all departments'),
    LOAD_ALL_DEPARTMENTS_COMPLETE: type('[Department] Load all departments complete'),
    LOAD_EMPLOYEE_SETTINGS: type('[Employee Settings] load employee settings'),
    LOAD_EMPLOYEE_SETTINGS_COMPLETE: type('[Employee Settings] load employee settings complete'),
    LOAD_FISCAL_YEARS: type('[Fiscal years] load fiscal years'),
    LOAD_FISCAL_YEARS_COMPLETE: type('[Fiscal years] load fiscal years complete'),
    LOAD_ABSENCE_TYPE: type('[Absence Type] load absence types'),
    LOAD_ABSENCE_TYPE_COMPLETE: type('[Absence Type] load absence types complete'),
    JOB_TITLE_OPTION_LOAD: type('[Absence Type] load job title option'),
    JOB_TITLE_OPTION_LOAD_COMPLETE: type('[Absence Type] load job title option complete'),
    LOAD_ABSENCE_SUBTYPE: type('[Absence Sub Type] load absence sub types'),
    LOAD_ABSENCE_SUBTYPE_COMPLETE: type('[Absence Sub Type] load absence sub types complete'),
    EMPLOYEE_SETTINGS_UPDATE: type('[HolidaySettings] of employee update'),
    LOAD_ABSENCE_TYPE_LIST_DATA: type('[Absence Type] load absence types list data'),
    LOAD_USER_PROFILES: type('[UserProfile] load user profiles'),
    LOAD_USER_PROFILES_COMPLETE: type('[UserProfile] load user profiles complete'),
    LOAD_EMPLOYEE_GROUP: type('[EmployeeGroup] load Employee Group '),
    LOAD_EMPLOYEE_GROUP_COMPLETE: type('[UserProfile] load Employee Group complete'),
    GET_CQCPRO_PURCHASED_DETAILS: type('[CQCPRO] cqc pro purchased details'),
    GET_CQCPRO_PURCHASED_DETAILS_COMPLETE: type('[CQCPRO] cqc pro purchased details complete'),
    LOAD_ALL_NONWORKING_DAY_PROFILES: type('[NonWorkingDays] All non working day profiles'),
    LOAD_ALL_NONWORKING_DAY_PROFILES_COMPLETE: type('[NonWorkingDays] All non working day profiles complete'),
    LOAD_USERS: type('[Email] Load users'),
    LOAD_USERS_COMPLETE: type('[Email] Load users complete'),
    RESET_COMPANY_STATE_ON_COMPANY_CHANGE: type('[Company] Reset company state on company change'),
    ADD_JOB_TITLE : type('[Jobtitle] add jobtitle'),
    ADD_JOB_TITLE_COMPLETE : type('[Jobtitle] add jobtitle complete'),
    CLEAR_JOB_TITLE : type('[Jobtitle] clear current jobtitle')
};

/**
* This action is to load the sites
*/
export class LoadSitesAction {
    type = ActionTypes.LOAD_SITES;
    constructor(public payload: boolean) {
    }
}


/**
* This  is complete action of load sites
*/
export class LoadSitesCompleteAction {
    type = ActionTypes.LOAD_SITES_COMPLETE;
    constructor(public payload: Site[]) {

    }
}

/**
* This action is to load the sites with address
*/
export class LoadSitesWithAddressAction {
    type = ActionTypes.LOAD_SITES_WITH_ADDRESS;
    constructor() {
    }
}


/**
* This  is complete action of load sites with address
*/
export class LoadSitesWithAddressCompleteAction {
    type = ActionTypes.LOAD_SITES_WITH_ADDRESS_COMPLETE;
    constructor(public payload: Site[]) {

    }
}


/**
* This action is to load the employee settings
*/
export class LoadEmployeeSettingsAction {
    type = ActionTypes.LOAD_EMPLOYEE_SETTINGS;
    constructor(public payload: boolean) {
    }
}


/**
* This  is complete action of load employee settings
*/
export class LoadEmployeeSettingsCompleteAction {
    type = ActionTypes.LOAD_EMPLOYEE_SETTINGS_COMPLETE;
    constructor(public payload: EmployeeSettings) {

    }
}

/**
* This action is to load the fiscal years
*/
export class LoadFiscalYearsAction {
    type = ActionTypes.LOAD_FISCAL_YEARS;
    constructor(public payload: any) {
    }
}


/**
* This  is complete action of load fiscal years
*/
export class LoadFiscalYearsCompleteAction {
    type = ActionTypes.LOAD_FISCAL_YEARS_COMPLETE;
    constructor(public payload: Array<FiscalYear>) {

    }
}

/**
* This action is to load the absence types
*/
export class LoadAbsenceTypeAction {
    type = ActionTypes.LOAD_ABSENCE_TYPE;
    constructor(public payload: boolean) {
    }
}


/**
* This  is complete action of load absence types
*/
export class LoadAbsenceTypeCompleteAction {
    type = ActionTypes.LOAD_ABSENCE_TYPE_COMPLETE;
    constructor(public payload: Array<AbsenceType>) {

    }
}

export class LoadAbsenceTypeListDataAction {
    type = ActionTypes.LOAD_ABSENCE_TYPE_LIST_DATA;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}


/**
* This action is to load job title
*/
export class LoadJobTitleOptioAction {
    type = ActionTypes.JOB_TITLE_OPTION_LOAD;
    constructor(public payload: boolean) {
    }
}

/**
* 
*/
export class LoadJobTitleOptionCompleteAction {
    type = ActionTypes.JOB_TITLE_OPTION_LOAD_COMPLETE;
    constructor(public payload: AeSelectItem<string>[]) {

    }
}

/**
* This action is to load absence sub types
*/
export class LoadAbsenceSubtypeAction {
    type = ActionTypes.LOAD_ABSENCE_SUBTYPE;
    constructor(public payload: boolean) {
    }
}

/* Employee Holiday Settings Actions */
export class EmployeeSettingsUpdateAction {
    type = ActionTypes.EMPLOYEE_SETTINGS_UPDATE;
    constructor(public payload: EmployeeSettings) {
    }
}

/**
* This  is complete action of load absence sub types
*/
export class LoadAbsenceSubtypeCompleteAction {
    type = ActionTypes.LOAD_ABSENCE_SUBTYPE_COMPLETE;
    constructor(public payload: Array<AbsenceSubType>) {

    }
}

export class LoadAllDepartmentsAction implements Action {
    type = ActionTypes.LOAD_ALL_DEPARTMENTS;
    constructor() {
    }
}

export class LoadAllDepartmentsCompleteAction implements Action {
    type = ActionTypes.LOAD_ALL_DEPARTMENTS_COMPLETE;
    constructor(public payload: Department[]) {
    }
}



export class LoadUserProfilesAction implements Action {
    type = ActionTypes.LOAD_USER_PROFILES;
    constructor(public payload: boolean) {

    }
}


export class LoadUserProfilesCompleteAction implements Action {
    type = ActionTypes.LOAD_USER_PROFILES_COMPLETE;
    constructor(public payload: any) {

    }
}
export class LoadEmployeeGroupAction implements Action {
    type = ActionTypes.LOAD_EMPLOYEE_GROUP;
    constructor() {

    }
}
export class LoadEmployeeGroupCompleteAction implements Action {
    type = ActionTypes.LOAD_EMPLOYEE_GROUP_COMPLETE;
    constructor(public payload: any) {

    }
}

export class CompanyCQCPurchasedDetailsByIdAction implements Action {
    type = ActionTypes.GET_CQCPRO_PURCHASED_DETAILS;
    constructor() {
    }
}

export class CompanyCQCPurchasedDetailsByIdCompleteAction implements Action {
    type = ActionTypes.GET_CQCPRO_PURCHASED_DETAILS_COMPLETE;
    constructor(public payload: any) {
    }
}

export class LoadAllNonWorkingDayProfilesAction implements Action {
    type = ActionTypes.LOAD_ALL_NONWORKING_DAY_PROFILES;
    constructor(public payload: boolean) {
    }
}
export class ResetCompanyStateOnCompanyChange implements Action {
    type = ActionTypes.RESET_COMPANY_STATE_ON_COMPANY_CHANGE;
    constructor(public payload: boolean) {
    }
}

export class LoadAllNonWorkingDayProfilesCompleteAction implements Action {
    type = ActionTypes.LOAD_ALL_NONWORKING_DAY_PROFILES_COMPLETE;
    constructor(public payload: Array<HWPShortModel>) {
    }
}

export class LoadUsersAction implements Action {
    type = ActionTypes.LOAD_USERS;
    constructor(public payload: boolean) {
    }
}

export class LoadUsersCompleteAction implements Action {
    type = ActionTypes.LOAD_USERS_COMPLETE;
    constructor(public payload: Array<User>) {
    }
}

export class AddJobTitleAction implements Action {
    type = ActionTypes.ADD_JOB_TITLE;
    constructor(public payload: JobTitle) {
    }
}

export class ClearJobTitleAction implements Action {
    type = ActionTypes.CLEAR_JOB_TITLE;
    constructor(public payload: boolean) {
    }
}

export class AddJobTitleCompleteAction implements Action {
    type = ActionTypes.ADD_JOB_TITLE_COMPLETE;
    constructor(public payload: JobTitle) {
    }
}

export type Actions = LoadSitesAction | LoadSitesCompleteAction
    | LoadSitesWithAddressAction | LoadSitesWithAddressCompleteAction
    | LoadEmployeeSettingsAction | LoadEmployeeSettingsCompleteAction
    | LoadFiscalYearsCompleteAction | LoadFiscalYearsAction
    | LoadAbsenceSubtypeAction | LoadAbsenceSubtypeCompleteAction
    | LoadAbsenceTypeAction | LoadAbsenceTypeCompleteAction
    | LoadJobTitleOptioAction | LoadJobTitleOptionCompleteAction
    | LoadAllDepartmentsAction | LoadAllDepartmentsCompleteAction
    | EmployeeSettingsUpdateAction | LoadAbsenceTypeListDataAction
    | LoadUserProfilesAction | LoadUserProfilesCompleteAction
    | LoadEmployeeGroupAction | LoadEmployeeGroupCompleteAction
    | CompanyCQCPurchasedDetailsByIdAction | CompanyCQCPurchasedDetailsByIdCompleteAction
    | LoadAllNonWorkingDayProfilesAction | LoadAllNonWorkingDayProfilesCompleteAction
    | LoadUsersAction | LoadUsersCompleteAction
    | ResetCompanyStateOnCompanyChange
    | AddJobTitleAction
    | AddJobTitleCompleteAction
    | ClearJobTitleAction;
