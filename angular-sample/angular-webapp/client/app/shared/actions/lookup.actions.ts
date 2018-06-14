import { Workspace } from '../../checklist/models/workspace.model';
import { ProcedureGroup } from './../models/proceduregroup';
import { AtlasApiResponse } from '../models/atlas-api-response';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { AbsenceStatus, Country, County, EmployeeRelations, EthnicGroup, UserList, UserProfile, IncidentCategory, AbsenceCode, AdditionalService, WorkspaceTypes, GeoLocation, LocalAuthority, Responsiblity, IncidentType, InjuryType, InjuredPart, WorkProcess, MainFactor } from '../models/lookup.models';
import { EntityReference } from '../../document/models/document';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';
import { DisciplinaryOutcome, EventType, Outcome, EmployeeLeavingReason, EmployeeLeavingSubReason } from '../../employee/models/timeline';
import * as Immutable from 'immutable';
import { PPECategory, PPECategoryGroup } from './../models/lookup.models';
import { HelpArea } from "../../help/models/helpArea";

export const ActionTypes = {
    COUNTY_LOAD: type('[LOOKUP] Load county'),
    COUNTY_LOAD_COMPLETE: type('[LOOKUP] Load county complete'),
    COUNTRY_LOAD: type('[LOOKUP] Load country'),
    COUNTRY_LOAD_COMPLETE: type('[LOOKUP] Load country complete'),
    USER_LOAD: type('[LOOKUP] Load user'),
    USER_LOAD_COMPLETE: type('[LOOKUP] Load user complete'),
    EMPLOYEE_RELATIONS_LOAD: type('[LOOKUP] Load employee relations'),
    EMPLOYEE_RELATIONS_LOAD_COMPLETE: type('[LOOKUP] Load employee relations complete'),
    EMPLOYEE_ETHINICGROUP_LOAD: type('[LOOKUP] load employee ethinicgroup'),
    EMPLOYEE_ETHINICGROUP_LOAD_COMPLETE: type('[LOOKUP] load employee ethinicgroup complete'),
    LOAD_ABSENCE_STATUS: type('[LOOKUP] Load absence status'),
    LOAD_ABSENCE_STATUS_COMPLETE: type('[LOOKUP] Load absence status complete'),
    LOAD_OTC_ENTITIES: type('[OTCENTITY] Meta Data Load'),
    LOAD_OTC_ENTITIES_COMPLETE: type('[OTCENTITY] Meta Data Load Complete'),
    LOAD_PERIOD_OPTION: type('[LOOKUP] Load period option'),
    LOAD_PERIOD_OPTION_COMPLETE: type('[LOOKUP] Load period option complete'),
    WORKSPACE_TYPE_LOAD: type('[LOOKUP] load workspace type'),
    WORKSPACE_TYPE_LOAD_COMPLETE: type('[LOOKUP] load workspace type complete'),
    EMPLOYMENT_STATUS_LOAD: type('[LOOKUP] load employment status'),
    EMPLOYMENT_STATUS_LOAD_COMPLETE: type('[LOOKUP] load employment status complete'),
    EMPLOYMENT_TYPE_LOAD: type('[LOOKUP] load employment type'),
    EMPLOYMENT_TYPE_LOAD_COMPLETE: type('[LOOKUP] load employment type complete'),
    EMPLOYEE_TIMELINE_EVENT_TYPES_LOAD: type('[LOOKUP] Load employeee timeline events data'),
    EMPLOYEE_TIMELINE_EVENT_TYPES_LOAD_COMPLETE: type('[LOOKUP] Load employeee timeline events data complete'),
    EMPLOYEE_TIMELINE_EVENT_OUTCOME: type('[LOOKUP] Load employee timeline event outcome'),
    EMPLOYEE_TIMELINE_EVENT_OUTCOME_COMPLETE: type('[LOOKUP] Load employee timeline event outcome complete'),
    EMPLOYEE_TIMELINE_EVENT_DISCIPLINARY_OUTCOME: type('[LOOKUP] Load employee timeline event disciplinary outcome'),
    EMPLOYEE_TIMELINE_EVENT_DISCIPLINARY_OUTCOME_COMPLETE: type('[LOOKUP] Load employee timeline event disciplinary outcome complete'),
    REPORT_CATEGORIES: type('[LOOKUP] load report categories'),
    REPORT_CATEGORIES_COMPLETE: type('[LOOKUP] load report categories complete'),
    LOAD_INCIDENT_CATEGORIES: type('[LOOKUP] load incident categories'),
    LOAD_INCIDENT_CATEGORIES_COMPLETE: type('[LOOKUP] load incident categories complete'),
    EMPLOYEE_TIMELINE_EVENT_REASONSFORLEAVING_LOAD: type('[LOOKUP] load reasons for leaving'),
    EMPLOYEE_TIMELINE_EVENT_REASONSFORLEAVING_LOAD_COMPLETE: type('[LOOKUP] load reasons for leaving complete'),
    EMPLOYEE_TIMELINE_EVENT_SUB_REASON_LOAD: type('[LOOKUP] load sub-reasons'),
    EMPLOYEE_TIMELINE_EVENT_SUB_REASON_LOAD_COMPLETE: type('[LOOKUP] load sub-reasons complete'),
    USERPROFILE_LOAD: type('[LOOKUP] load user profile'),
    USERPROFILE_LOAD_COMPLETE: type('[LOOKUP] load user profile complete'),
    LOAD_ABSENCE_CODE: type('[Absence Code] load absence codes'),
    LOAD_ABSENCE_CODE_COMPLETE: type('[Absence Code] load absence codes complete'),
    LOAD_PROCEDURE_GROUPS: type('[Procedure Group] load procedure groups'),
    LOAD_PROCEDURE_GROUPS_COMPLETE: type('[Procedure Group] load procedure groups complete'),
    LOAD_ADDITIONAL_SERVICE: type('[Additional Service] load additional services'),
    LOAD_ADDITIONAL_SERVICE_COMPLETE: type('[Additional Service] load additional services complete'),
    LOAD_SECTORS: type('[Checklist],load sectors data'),
    LOAD_SECTORS_COMPLETE: type('[Checklist],load sectors data complete'),
    LOAD_MAIN_INDUSTRY: type('[Main Industry] load main industry data'),
    LOAD_MAIN_INDUSTRY_COMPLETE: type('[Main Industry] load main industry data complete'),
    LOAD_MAIN_ACTIVITY: type('[Main Activity] load main activity data'),
    LOAD_MAIN_ACTIVITY_COMPLETE: type('[Main Activity] load main activity data complete'),
    LOAD_SUB_ACTIVITY: type('[Sub Activity] load sub activity data'),
    LOAD_SUB_ACTIVITY_COMPLETE: type('[Sub Activity] sub main activity data complete'),
    LOAD_GEO_LOCATIONS: type('[Geo Location] load geo location data'),
    LOAD_GEO_LOCATIONS_COMPLETE: type('[Geo Location] load geo location data complete'),
    LOAD_LOCAL_AUTHORITIES: type('[Local Authority] load local authorities data'),
    LOAD_LOCAL_AUTHORITIES_COMPLETE: type('[Local Authority] load local authorities data complete'),
    LOAD_RESPONSIBILITIES: type('[Responsibilties],load responsibilities'),
    LOAD_RESPONSIBILITIES_COMPLETE: type('[Checklist],load responsibilities complete'),
    LOAD_PPECATEGORY_GROUPS: type('[PPECategoryGroup],load ppe category groups'),
    LOAD_PPECATEGORY_GROUPS_COMPLETE: type('[PPECategoryGroup],load ppe category groups complete'),
    INCIDENT_TYPE_LOAD: type('[IncidentType] Load incident type'),
    INCIDENT_TYPE_LOAD_COMPLETE: type('[IncidentType] Load incident type complete'),
    INJURY_TYPE_LOAD: type('[InjuryType] Load injury type'),
    INJURY_TYPE_LOAD_COMPLETE: type('[InjuryType] Load injury type complete'),
    INJURED_PART_LOAD: type('[InjuredPart] Load injured part'),
    INJURED_PART_LOAD_COMPLETE: type('[InjuredPart] Load injured part complete'),
    WORK_PROCESS_LOAD: type('[WorkProcess] Load work process'),
    WORK_PROCESS_LOAD_COMPLETE: type('[WorkProcess] Load work process complete'),
    MAIN_FACTOR_LOAD: type('[MainFactor] Load main factor type'),
    MAIN_FACTOR_LOAD_COMPLETE: type('[MainFactor] Load main factor complete'),
    LOAD_PPECATEGORY: type('[PPECategory],load ppe groups'),
    LOAD_PPECATEGORY_COMPLETE: type('[PPECategory],load ppe category complete'),
    LOAD_RISK_ASSESSMENT_TYPES: type('[RiskAssessmentType] Load risk assessment types'),
    LOAD_RISK_ASSESSMENT_TYPES_COMPLETE: type('[RiskAssessmentType] Load risk assessment types complete'),
    LOAD_HELP_AREAS: type('[Help] load help areas'),
    LOAD_HELP_AREAS_COMPLETE: type('[Help] load help areas complete')
    , LOAD_STANDARD_ICONS: type('[Document] Load standard icons')
    , LOAD_STANDARD_ICONS_COMPLETE: type('[Document] Load standard icons complete')
    , LOAD_STANDARD_CONTROL_ICONS_COMPLETE: type('[Document] Load standard control icons complete')
    , LOAD_STANDARD_CONTROL_ICONS: type('[Document] Load standard control icons')
}

export class UserProfileLoadAction implements Action {
    type = ActionTypes.USERPROFILE_LOAD;
    constructor(public payload: any) {

    }
}

export class UserProfileLoadCompleteAction implements Action {
    type = ActionTypes.USERPROFILE_LOAD_COMPLETE;
    constructor(public payload: UserProfile[]) {

    }
}

export class CountyLoadAction implements Action {
    type = ActionTypes.COUNTY_LOAD;
    constructor(public payload: any) {

    }
}

export class CountyLoadCompleteAction implements Action {
    type = ActionTypes.COUNTY_LOAD_COMPLETE;
    constructor(public payload: Array<County>) {

    }
}

export class CountryLoadAction implements Action {
    type = ActionTypes.COUNTRY_LOAD;
    constructor(public payload: any) {

    }
}

export class CountryLoadCompleteAction implements Action {
    type = ActionTypes.COUNTRY_LOAD_COMPLETE;
    constructor(public payload: Array<Country>) {

    }
}

export class UserLoadAction implements Action {
    type = ActionTypes.USER_LOAD;
    constructor(public payload: any) {

    }
}

export class UserLoadCompleteAction implements Action {
    type = ActionTypes.USER_LOAD_COMPLETE;
    constructor(public payload: AeSelectItem<string>[]) {

    }
}


export class EmployeeRelationsLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_RELATIONS_LOAD;
    constructor(public payload: any) {

    }
}

export class EmployeeRelationsLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_RELATIONS_LOAD_COMPLETE;
    constructor(public payload: Array<EmployeeRelations>) {

    }
}

export class AbsenceStatusLoadAction implements Action {
    type = ActionTypes.LOAD_ABSENCE_STATUS;
    constructor(public payload: boolean) {
    }
}

export class LoadPeriodOptionCompleteAction implements Action {
    type = ActionTypes.LOAD_PERIOD_OPTION_COMPLETE;
    constructor(public payload: AeSelectItem<string>[]) {

    }
}

export class WorkSpaceTypeLoadAction implements Action {
    type = ActionTypes.WORKSPACE_TYPE_LOAD;
    constructor(public payload: boolean) {
    }
}

export class WorkSpaceTypeLoadCompleteAction implements Action {
    type = ActionTypes.WORKSPACE_TYPE_LOAD_COMPLETE;
    constructor(public payload: Workspace[]) {
    }
}

export class LoadPeriodOptionAction implements Action {
    type = ActionTypes.LOAD_PERIOD_OPTION;
    constructor(public payload: boolean) {
    }
}

export class EmploymentStatusLoadAction implements Action {
    type = ActionTypes.EMPLOYMENT_STATUS_LOAD;
    constructor(public payload: boolean) {
    }
}

export class EmploymentStatusLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYMENT_STATUS_LOAD_COMPLETE;
    constructor(public payload: AeSelectItem<string>[]) {
    }
}

export class EmploymentTypeLoadAction implements Action {
    type = ActionTypes.EMPLOYMENT_TYPE_LOAD;
    constructor(public payload: boolean) {
    }
}


export class EmploymentTypeLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYMENT_TYPE_LOAD_COMPLETE;
    constructor(public payload: AeSelectItem<string>[]) {
    }
}

export class EmployeeEthinicGroupLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_ETHINICGROUP_LOAD;
    // payload is employee id
    constructor(public payload: any) {
    }
}

export class EmployeeEthinicGroupLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_ETHINICGROUP_LOAD_COMPLETE;
    constructor(public payload: EthnicGroup[]) {

    }
}

export class AbsenceStatusLoadCompleteAction implements Action {
    type = ActionTypes.LOAD_ABSENCE_STATUS_COMPLETE;
    constructor(public payload: Array<AbsenceStatus>) {

    }
}

export class LoadOTCEntities implements Action {
    type = ActionTypes.LOAD_OTC_ENTITIES;
    constructor() {

    }
}

export class LoadOTCEntitiesComplete implements Action {
    type = ActionTypes.LOAD_OTC_ENTITIES_COMPLETE;
    constructor(public payload: Array<EntityReference>) {

    }
}

export class EmployeeTimelineEventTypesLoad implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_EVENT_TYPES_LOAD;
    constructor(public payload: any) { }
}

export class EmployeeTimelineEventTypesLoadComplete implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_EVENT_TYPES_LOAD_COMPLETE;
    constructor(public payload: Array<EventType>) { }
}

export class EmployeeTimelineEventDisciplinaryOutcome implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_EVENT_DISCIPLINARY_OUTCOME;
    constructor(public payload: any) { }
}

export class EmployeeTimelineEventDisciplinaryOutcomeComplete implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_EVENT_DISCIPLINARY_OUTCOME_COMPLETE;
    constructor(public payload: Array<DisciplinaryOutcome>) { }
}

export class EmployeeTimelineEventOutcome implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_EVENT_OUTCOME;
    constructor(public payload: any) { }
}

export class EmployeeTimelineEventOutcomeComplete implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_EVENT_OUTCOME_COMPLETE;
    constructor(public payload: Array<Outcome>) { }
}
export class LoadReportCategories implements Action {
    type = ActionTypes.REPORT_CATEGORIES;
    constructor(public payload: boolean) {

    }
}

export class LoadReportCategoriesComplete implements Action {
    type = ActionTypes.REPORT_CATEGORIES_COMPLETE;
    constructor(public payload: Immutable.List<AeSelectItem<string>>) {

    }
}

export class LoadIncidentCategories implements Action {
    type = ActionTypes.LOAD_INCIDENT_CATEGORIES;

    constructor(public payload: boolean) {

    }
}

export class EmployeeTimelineLoadReasonsForLeaving implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_EVENT_REASONSFORLEAVING_LOAD;
    constructor(public payload: boolean) {

    }
}

export class LoadIncidentCategoriesComplete implements Action {
    type = ActionTypes.LOAD_INCIDENT_CATEGORIES_COMPLETE;
    constructor(public payload: Array<IncidentCategory>) {

    }
}

export class EmployeeTimelineLoadReasonsForLeavingComplete implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_EVENT_REASONSFORLEAVING_LOAD_COMPLETE;
    constructor(public payload: Array<EmployeeLeavingReason>) {

    }
}

export class EmployeeTimelineLoadSubReasons implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_EVENT_SUB_REASON_LOAD;
    constructor(public payload: boolean) {
    }
}

/**
* This action is to load the absence codes
*/
export class LoadAbsenceCodeAction {
    type = ActionTypes.LOAD_ABSENCE_CODE;
    constructor(public payload: boolean) {
    }
}


export class EmployeeTimelineLoadSubReasonsComplete implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_EVENT_SUB_REASON_LOAD_COMPLETE;
    constructor(public payload: Array<EmployeeLeavingSubReason>) {
    }
}
/**
* This  is complete action of load absence codes
*/
export class LoadAbsenceCodeCompleteAction {
    type = ActionTypes.LOAD_ABSENCE_CODE_COMPLETE;
    constructor(public payload: AbsenceCode) {

    }
}

export class LoadProcedureGroupAction {
    type = ActionTypes.LOAD_PROCEDURE_GROUPS;
    constructor() {

    }
}

export class LoadProcedureGroupCompleteAction {
    type = ActionTypes.LOAD_PROCEDURE_GROUPS_COMPLETE;
    constructor(public payload: Array<ProcedureGroup>) {
    }
}

export class LoadAdditionalServiceAction implements Action {
    type = ActionTypes.LOAD_ADDITIONAL_SERVICE;
    constructor(public payload: boolean) {
    }
}
export class LoadAdditionalServiceCompleteAction implements Action {
    type = ActionTypes.LOAD_ADDITIONAL_SERVICE_COMPLETE;
    constructor(public payload: AdditionalService) {

    }
}

export class LoadSectorsAction implements Action {
    type = ActionTypes.LOAD_SECTORS;
    constructor(public payload: boolean) {

    }
}

export class LoadSectorsActionComplete implements Action {
    type = ActionTypes.LOAD_SECTORS_COMPLETE;
    constructor(public payload: any) {

    }
}

export class LoadMainIndustryAction implements Action {
    type = ActionTypes.LOAD_MAIN_INDUSTRY;
    constructor(public payload: boolean) {

    }
}

export class LoadMainIndustryCompleteAction implements Action {
    type = ActionTypes.LOAD_MAIN_INDUSTRY_COMPLETE;
    constructor(public payload: any) {
    }
}

export class LoadResponsibilitiesAction implements Action {
    type = ActionTypes.LOAD_RESPONSIBILITIES;
    constructor() {

    }
}

export class LoadMainActivityAction implements Action {
    type = ActionTypes.LOAD_MAIN_ACTIVITY;
    constructor(public payload: string) {
    }
}

export class LoadResponsibilitiesCompleteAction implements Action {
    type = ActionTypes.LOAD_RESPONSIBILITIES_COMPLETE;
    constructor(public payload: Responsiblity[]) {

    }
}

export class LoadMainActivityCompleteAction implements Action {
    type = ActionTypes.LOAD_MAIN_ACTIVITY_COMPLETE;
    constructor(public payload: any) {
    }
}

export class LoadPPECategoryGroupsAction implements Action {
    type = ActionTypes.LOAD_PPECATEGORY_GROUPS;
    constructor() {

    }
}

export class LoadSubActivityAction implements Action {
    type = ActionTypes.LOAD_SUB_ACTIVITY;
    constructor(public payload: string) {
    }
}
export class LoadPPECategoryGroupsCompleteAction implements Action {
    type = ActionTypes.LOAD_PPECATEGORY_GROUPS_COMPLETE;
    constructor(public payload: PPECategoryGroup[]) {

    }
}

export class IncidentTypeLoadAction implements Action {
    type = ActionTypes.INCIDENT_TYPE_LOAD;
    constructor() {

    }
}
export class IncidentTypeLoadCompleteAction implements Action {
    type = ActionTypes.INCIDENT_TYPE_LOAD_COMPLETE;
    constructor(public payload: Array<IncidentType>) {

    }
}

export class InjuryTypeLoadAction implements Action {
    type = ActionTypes.INJURY_TYPE_LOAD;
    constructor() {

    }
}
export class InjuryTypeLoadCompleteAction implements Action {
    type = ActionTypes.INJURY_TYPE_LOAD_COMPLETE;
    constructor(public payload: Array<InjuryType>) {

    }
}

export class InjuredPartLoadAction implements Action {
    type = ActionTypes.INJURED_PART_LOAD;
    constructor() {

    }
}
export class InjuredPartLoadCompleteAction implements Action {
    type = ActionTypes.INJURED_PART_LOAD_COMPLETE;
    constructor(public payload: Array<InjuredPart>) {

    }
}

export class WorkProcessLoadAction implements Action {
    type = ActionTypes.WORK_PROCESS_LOAD;
    constructor() {

    }
}
export class WorkProcessLoadCompleteAction implements Action {
    type = ActionTypes.WORK_PROCESS_LOAD_COMPLETE;
    constructor(public payload: Array<WorkProcess>) {

    }
}

export class MainFactorLoadAction implements Action {
    type = ActionTypes.MAIN_FACTOR_LOAD;
    constructor() {

    }
}
export class MainFactorLoadCompleteAction implements Action {
    type = ActionTypes.MAIN_FACTOR_LOAD_COMPLETE;
    constructor(public payload: Array<MainFactor>) {

    }
}


export class LoadPPECategoryAction implements Action {
    type = ActionTypes.LOAD_PPECATEGORY;
    constructor() {

    }
}

export class LoadPPECategoryCompleteAction implements Action {
    type = ActionTypes.LOAD_PPECATEGORY_COMPLETE;
    constructor(public payload: PPECategory[]) {

    }
}

export class LoadSubActivityCompleteAction implements Action {
    type = ActionTypes.LOAD_SUB_ACTIVITY_COMPLETE;
    constructor(public payload: any) {

    }
}

export class LoadGeoLocationsAction implements Action {
    type = ActionTypes.LOAD_GEO_LOCATIONS;
    constructor(public payload: string) {

    }
}

export class LoadGeoLocationsCompleteAction implements Action {
    type = ActionTypes.LOAD_GEO_LOCATIONS_COMPLETE;
    constructor(public payload: any) {
    }
}

export class LoadLocalAuthoritiesAction implements Action {
    type = ActionTypes.LOAD_LOCAL_AUTHORITIES;
    constructor(public payload: string) {

    }
}

export class LoadLocalAuthoritiesCompleteAction implements Action {
    type = ActionTypes.LOAD_LOCAL_AUTHORITIES_COMPLETE;
    constructor(public payload: any) {
    }
}

export class LoadRiskAssessmentTypesAction implements Action {
    type = ActionTypes.LOAD_RISK_ASSESSMENT_TYPES;
    constructor(public payload: boolean) {

    }
}


export class LoadRiskAssessmentTypesCompleteAction implements Action {
    type = ActionTypes.LOAD_RISK_ASSESSMENT_TYPES_COMPLETE;
    constructor(public payload: Immutable.List<AeSelectItem<string>>) {
    }
}
export class LoadHelpAreasAction implements Action {
    type = ActionTypes.LOAD_HELP_AREAS;
    constructor(public payload: any) {
    }
}
export class LoadHelpAreasActionCompleteAction implements Action {
    type = ActionTypes.LOAD_HELP_AREAS_COMPLETE;
    constructor(public payload: Array<HelpArea>) {
    }
}

export class LoadStandardIconsAction implements Action {
    type = ActionTypes.LOAD_STANDARD_ICONS;
    constructor(public payload: boolean) {
    }
}
export class LoadStandardIconsCompleteAction implements Action {
    type = ActionTypes.LOAD_STANDARD_ICONS_COMPLETE;
    constructor(public payload: Array<Document>) {
    }
}

export class LoadStandardControlIconsAction implements Action {
    type = ActionTypes.LOAD_STANDARD_CONTROL_ICONS;
    constructor(public payload: boolean) {
    }
}
export class LoadStandardControlIconsCompleteAction implements Action {
    type = ActionTypes.LOAD_STANDARD_CONTROL_ICONS_COMPLETE;
    constructor(public payload: Array<Document>) {
    }
}

export type Actions = CountyLoadAction | CountyLoadCompleteAction
    | LoadStandardControlIconsAction | LoadStandardControlIconsCompleteAction
    | LoadStandardIconsAction | LoadStandardIconsCompleteAction
    | CountryLoadAction | CountryLoadCompleteAction
    | EmployeeRelationsLoadAction | EmployeeRelationsLoadCompleteAction
    | AbsenceStatusLoadCompleteAction | AbsenceStatusLoadAction
    | EmployeeEthinicGroupLoadAction | EmployeeEthinicGroupLoadCompleteAction
    | LoadPeriodOptionAction | LoadPeriodOptionCompleteAction
    | UserLoadAction | UserLoadCompleteAction
    | WorkSpaceTypeLoadAction | WorkSpaceTypeLoadCompleteAction
    | EmploymentStatusLoadAction | EmploymentStatusLoadCompleteAction
    | EmploymentTypeLoadAction | EmploymentTypeLoadCompleteAction
    | LoadOTCEntities | LoadOTCEntitiesComplete
    | EmployeeTimelineEventTypesLoad | EmployeeTimelineEventTypesLoadComplete
    | EmployeeTimelineEventDisciplinaryOutcome | EmployeeTimelineEventDisciplinaryOutcomeComplete
    | EmployeeTimelineEventOutcome | EmployeeTimelineEventOutcomeComplete
    | LoadReportCategories | LoadReportCategoriesComplete | LoadIncidentCategoriesComplete | LoadIncidentCategories
    | LoadReportCategories | LoadReportCategoriesComplete
    | EmployeeTimelineLoadReasonsForLeaving | EmployeeTimelineLoadReasonsForLeavingComplete
    | EmployeeTimelineLoadSubReasons | EmployeeTimelineLoadSubReasonsComplete
    | UserProfileLoadAction | UserProfileLoadCompleteAction
    | LoadReportCategories | LoadReportCategoriesComplete
    | LoadAbsenceCodeAction | LoadAbsenceCodeCompleteAction
    | LoadProcedureGroupAction | LoadProcedureGroupCompleteAction
    | LoadAdditionalServiceAction | LoadAdditionalServiceCompleteAction
    | LoadSectorsAction | LoadSectorsActionComplete
    | LoadMainIndustryAction | LoadMainIndustryCompleteAction
    | LoadMainActivityAction | LoadMainActivityCompleteAction
    | LoadSubActivityAction | LoadSubActivityCompleteAction
    | LoadGeoLocationsAction | LoadGeoLocationsCompleteAction
    | LoadLocalAuthoritiesAction | LoadLocalAuthoritiesCompleteAction
    | LoadResponsibilitiesAction | LoadResponsibilitiesCompleteAction
    | LoadPPECategoryGroupsAction | LoadPPECategoryGroupsCompleteAction
    | IncidentTypeLoadAction | IncidentTypeLoadCompleteAction
    | InjuryTypeLoadAction | InjuryTypeLoadCompleteAction
    | InjuredPartLoadAction | InjuredPartLoadCompleteAction
    | WorkProcessLoadAction | WorkProcessLoadCompleteAction
    | MainFactorLoadAction | MainFactorLoadCompleteAction
    | LoadPPECategoryAction | LoadPPECategoryCompleteAction
    | LoadRiskAssessmentTypesAction | LoadRiskAssessmentTypesCompleteAction
    | LoadHelpAreasAction | LoadHelpAreasActionCompleteAction;
