import { PPECategory, PPECategoryGroup } from './../models/lookup.models';
import { Sector } from '../models/sector';
import { ChecklistWorkspaceTypes } from '../../checklist/models/checklistworkspacetypes.model';
import { Workspace } from '../../checklist/models/workspace.model';
import { ProcedureGroup } from './../models/proceduregroup';
import { EntityReference } from '../../document/models/document';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { isNullOrUndefined } from 'util';
import {
    AbsenceStatus,
    AbsenceStatusCode,
    Country,
    County,
    EmployeeRelations,
    EthnicGroup,
    UserList,
    IncidentCategory,
    UserProfile,
    AbsenceCode,
    WorkspaceTypes,
    AdditionalService,
    Responsiblity,
    IncidentType,
    InjuryType,
    InjuredPart,
    WorkProcess,
    MainFactor
} from '../models/lookup.models';
import { Observable } from 'rxjs/Rx';
import { Action, ActionReducer, combineReducers } from '@ngrx/store';
import * as lookupActions from '../actions/lookup.actions';
import { compose } from '@ngrx/core';
import * as Immutable from 'immutable';
import { DisciplinaryOutcome, EventType, Outcome, EmployeeLeavingReason, EmployeeLeavingSubReason } from '../../employee/models/timeline';
import { mapIncidentCategoriesToAeSelectItems } from '../helpers/extract-helpers';
import { User } from "../../email-shared/models/email.model";
import { HelpArea } from "../../help/models/helpArea";
import { Document } from '../../document/models/Document';

export interface LookupState {
    Status: boolean;
    CountyData: Array<County>;
    CountryData: Array<Country>;
    UserListData: AeSelectItem<string>[];
    hasUserListDataLoaded: boolean;
    EmployeeRelationsData: Array<EmployeeRelations>;
    AbsenceStatuses: Array<AbsenceStatus>;
    OtcEntityData: Array<EntityReference>;
    hasCountyDataLoaded: boolean;
    hasCountryDataLoaded: boolean;
    hasEmpoyeeRelationsDataLoaded: boolean;
    hasAbsenceStatusDataLoaded: boolean;
    EthnicGroupData: EthnicGroup[],
    hasEthnicGroupDataLoaded: boolean;
    PeriodOptionList: AeSelectItem<string>[];
    HasPeriodOptionListLoaded: boolean;
    WorkSpaceTypeOptionList: Workspace[];
    HasWorkSpaceTypeOptionListLoaded: boolean;
    EmploymentStatusOptionList: Immutable.List<AeSelectItem<string>>;
    HasEmploymentStatusOptionListLoaded: boolean;
    EmploymentTypeOptionList: Immutable.List<AeSelectItem<string>>;
    HasEmploymentTypeOptionListLoaded: boolean;
    ReportCategories: Immutable.List<AeSelectItem<string>>;
    hasOtcEntityDataLoaded: boolean;
    EventTypesData: EventType[];
    DisciplinaryOutcomeData: DisciplinaryOutcome[];
    OutcomeData: Outcome[];
    IncidentCategories: Array<IncidentCategory>;
    MetaData: Immutable.List<AeSelectItem<string>>;
    EmployeeLeavingReasons: EmployeeLeavingReason[];
    EmployeeLeavingSubReasons: EmployeeLeavingSubReason[];
    UserProfiles: UserProfile[];
    hasAbsenceCodesLoaded: boolean;
    AbsenceCodes: AbsenceCode[];
    ProcedureGroups: Array<ProcedureGroup>;
    hasAdditionalServiceLoaded: boolean;
    AdditionalService: AdditionalService[];
    Sectors: Array<Sector>;
    MainIndustries: Immutable.List<AeSelectItem<string>>;
    MainActivities: Immutable.List<AeSelectItem<string>>;
    SubActivities: Immutable.List<AeSelectItem<string>>;
    GeoLocations: Immutable.List<AeSelectItem<string>>;
    LocalAuthorities: Immutable.List<AeSelectItem<string>>;
    Responsibilities: Responsiblity[];
    PPECategoryGroups: PPECategoryGroup[];
    IncidentTypeData: Array<IncidentType>;
    InjuryTypeData: Array<InjuryType>;
    InjuredPartData: Array<InjuredPart>;
    WorkProcessData: Array<WorkProcess>;
    MainFactorData: Array<MainFactor>;
    PPECategories: PPECategory[];
    RiskAssessmentTypes: Immutable.List<AeSelectItem<string>>;
    HelpAreas: Immutable.List<HelpArea>;
    standardHazardIcons: Array<Document>;
    hasStandardHazardIocnsLoaded: boolean;
    standardControlIcons: Array<Document>;
}


const initialState: LookupState = {
    Status: false,
    CountyData: null,
    CountryData: null,
    UserListData: null,
    hasUserListDataLoaded: false,
    EthnicGroupData: null,
    EmployeeRelationsData: null,
    AbsenceStatuses: null,
    OtcEntityData: null,
    hasCountyDataLoaded: false,
    hasCountryDataLoaded: false,
    hasEmpoyeeRelationsDataLoaded: false,
    hasAbsenceStatusDataLoaded: false,
    hasEthnicGroupDataLoaded: false,
    hasOtcEntityDataLoaded: false,
    PeriodOptionList: null,
    HasPeriodOptionListLoaded: false,
    WorkSpaceTypeOptionList: null,
    HasWorkSpaceTypeOptionListLoaded: false,
    EmploymentStatusOptionList: null,
    HasEmploymentStatusOptionListLoaded: false,
    EmploymentTypeOptionList: null,
    HasEmploymentTypeOptionListLoaded: false,
    EventTypesData: null,
    DisciplinaryOutcomeData: null,
    OutcomeData: null,
    ReportCategories: null,
    IncidentCategories: null,
    MetaData: Immutable.List<AeSelectItem<string>>([
        new AeSelectItem<string>('Company', '1')
        , new AeSelectItem<string>('Site', '3')
        , new AeSelectItem<string>('Department', '4')
        , new AeSelectItem<string>('Employee', '17')
    ]),
    EmployeeLeavingReasons: null,
    EmployeeLeavingSubReasons: null,
    UserProfiles: null,
    hasAbsenceCodesLoaded: false,
    AbsenceCodes: null,
    ProcedureGroups: null,
    hasAdditionalServiceLoaded: false,
    AdditionalService: null,
    Sectors: null,
    MainIndustries: null,
    MainActivities: null,
    SubActivities: null,
    GeoLocations: null,
    LocalAuthorities: null,
    Responsibilities: null,
    PPECategoryGroups: null,
    IncidentTypeData: null,
    InjuryTypeData: null,
    InjuredPartData: null,
    WorkProcessData: null,
    MainFactorData: null,
    PPECategories: null,
    RiskAssessmentTypes: null,
    HelpAreas: null,
    standardHazardIcons: null,
    hasStandardHazardIocnsLoaded: false
    , standardControlIcons: null
};

export function lookupReducer(state = initialState, action: Action): LookupState {
    let currentState: LookupState;
    switch (action.type) {
        case lookupActions.ActionTypes.COUNTY_LOAD:
            currentState = Object.assign({}, state, { Status: true });
            break;

        case lookupActions.ActionTypes.COUNTY_LOAD_COMPLETE:
            currentState = Object.assign({}, state, { Status: true, hasCountyDataLoaded: true, CountyData: action.payload });
            break;

        case lookupActions.ActionTypes.COUNTRY_LOAD:
            currentState = Object.assign({}, state, { Status: true });
            break;

        case lookupActions.ActionTypes.COUNTRY_LOAD_COMPLETE:
            currentState = Object.assign({}, state, { Status: true, hasCountryDataLoaded: true, CountryData: action.payload });
            break;

        case lookupActions.ActionTypes.USER_LOAD:
            currentState = Object.assign({}, state, { hasUserListDataLoaded: false });
            break;

        case lookupActions.ActionTypes.USER_LOAD_COMPLETE:
            currentState = Object.assign({}, state, { hasUserListDataLoaded: true, UserListData: action.payload });
            break;

        case lookupActions.ActionTypes.EMPLOYEE_RELATIONS_LOAD:
            currentState = Object.assign({}, state, { Status: true });
            break;

        case lookupActions.ActionTypes.EMPLOYEE_RELATIONS_LOAD_COMPLETE:
            {
                currentState = Object.assign({}, state, {
                    Status: true,
                    hasEmpoyeeRelationsDataLoaded: true,
                    EmployeeRelationsData: action.payload
                });
            }
            break;

        case lookupActions.ActionTypes.LOAD_ABSENCE_STATUS:
            currentState = Object.assign({}, state, { hasAbsenceStatusDataLoaded: false });
            break;

        case lookupActions.ActionTypes.LOAD_ABSENCE_STATUS_COMPLETE:
            currentState = Object.assign({}, state, { hasAbsenceStatusDataLoaded: true, AbsenceStatuses: action.payload });
            break;

        case lookupActions.ActionTypes.EMPLOYEE_ETHINICGROUP_LOAD:
            {
                return Object.assign({}, state, { hasEthnicGroupDataLoaded: false });
            }
        case lookupActions.ActionTypes.EMPLOYEE_ETHINICGROUP_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { hasEthnicGroupDataLoaded: true, EthnicGroupData: action.payload });
            }

        case lookupActions.ActionTypes.LOAD_PERIOD_OPTION:
            {
                return Object.assign({}, state, { HasPeriodOptionListLoaded: false });
            }
        case lookupActions.ActionTypes.LOAD_PERIOD_OPTION_COMPLETE:
            {
                return Object.assign({}, state, { HasPeriodOptionListLoaded: true, PeriodOptionList: action.payload });
            }

        case lookupActions.ActionTypes.WORKSPACE_TYPE_LOAD:
            {
                return Object.assign({}, state, { HasWorkSpaceTypeOptionListLoaded: false });
            }
        case lookupActions.ActionTypes.WORKSPACE_TYPE_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { WorkSpaceTypeOptionList: action.payload, HasWorkSpaceTypeOptionListLoaded: true });
            }
        case lookupActions.ActionTypes.EMPLOYMENT_STATUS_LOAD:
            {
                return Object.assign({}, state, { HasEmploymentStatusOptionListLoaded: false });
            }
        case lookupActions.ActionTypes.EMPLOYMENT_STATUS_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { EmploymentStatusOptionList: action.payload, HasEmploymentStatusOptionListLoaded: true });
            }

        case lookupActions.ActionTypes.EMPLOYMENT_TYPE_LOAD:
            {
                return Object.assign({}, state, { HasEmploymentTypeOptionListLoaded: false });
            }
        case lookupActions.ActionTypes.EMPLOYMENT_TYPE_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { EmploymentTypeOptionList: action.payload, HasEmploymentTypeOptionListLoaded: true });
            }

        /* employee contacts actions - end */
        case lookupActions.ActionTypes.LOAD_OTC_ENTITIES:
            {
                return Object.assign({}, state, { hasOtcEntityDataLoaded: false });
            }
        case lookupActions.ActionTypes.LOAD_OTC_ENTITIES_COMPLETE:
            {
                return Object.assign({}, state, { hasOtcEntityDataLoaded: true, OtcEntityData: action.payload });
            }
        case lookupActions.ActionTypes.EMPLOYEE_TIMELINE_EVENT_TYPES_LOAD:
            {
                return Object.assign({}, state);
            }
        case lookupActions.ActionTypes.EMPLOYEE_TIMELINE_EVENT_TYPES_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { EventTypesData: action.payload });
            }
        case lookupActions.ActionTypes.EMPLOYEE_TIMELINE_EVENT_DISCIPLINARY_OUTCOME:
            {
                return Object.assign({}, state);
            }
        case lookupActions.ActionTypes.EMPLOYEE_TIMELINE_EVENT_DISCIPLINARY_OUTCOME_COMPLETE:
            {
                return Object.assign({}, state, { DisciplinaryOutcomeData: action.payload });
            }

        case lookupActions.ActionTypes.EMPLOYEE_TIMELINE_EVENT_OUTCOME:
            {
                return Object.assign({}, state);
            }
        case lookupActions.ActionTypes.EMPLOYEE_TIMELINE_EVENT_OUTCOME_COMPLETE:
            {
                return Object.assign({}, state, { OutcomeData: action.payload });
            }

        case lookupActions.ActionTypes.REPORT_CATEGORIES: {
            return Object.assign({}, state, { Status: false });
        }
        case lookupActions.ActionTypes.REPORT_CATEGORIES_COMPLETE: {
            return Object.assign({}, state, { Status: true, ReportCategories: action.payload });
        }
        case lookupActions.ActionTypes.LOAD_INCIDENT_CATEGORIES:
            {
                return Object.assign({}, state);
            }
        case lookupActions.ActionTypes.LOAD_INCIDENT_CATEGORIES_COMPLETE:
            {
                return Object.assign({}, state, { IncidentCategories: action.payload });
            }
        case lookupActions.ActionTypes.EMPLOYEE_TIMELINE_EVENT_REASONSFORLEAVING_LOAD: {
            return Object.assign({}, state);
        }

        case lookupActions.ActionTypes.EMPLOYEE_TIMELINE_EVENT_REASONSFORLEAVING_LOAD_COMPLETE: {
            return Object.assign({}, state, { EmployeeLeavingReasons: action.payload });
        }

        case lookupActions.ActionTypes.EMPLOYEE_TIMELINE_EVENT_SUB_REASON_LOAD: {
            return Object.assign({}, state);
        }

        case lookupActions.ActionTypes.EMPLOYEE_TIMELINE_EVENT_SUB_REASON_LOAD_COMPLETE: {
            return Object.assign({}, state, { EmployeeLeavingSubReasons: action.payload });
        }
        case lookupActions.ActionTypes.USERPROFILE_LOAD: {
            return Object.assign({}, state);
        }

        case lookupActions.ActionTypes.USERPROFILE_LOAD_COMPLETE: {
            return Object.assign({}, state, { UserProfiles: action.payload });
        }

        case lookupActions.ActionTypes.LOAD_ABSENCE_CODE:
            {
                return Object.assign({}, state, { hasAbsenceCodesLoaded: false });
            }

        case lookupActions.ActionTypes.LOAD_ABSENCE_CODE_COMPLETE:
            {
                return Object.assign({}, state, { hasAbsenceCodesLoaded: true, AbsenceCodes: action.payload });
            }
        case lookupActions.ActionTypes.LOAD_PROCEDURE_GROUPS_COMPLETE:
            {
                return Object.assign({}, state, { ProcedureGroups: action.payload });
            }
        case lookupActions.ActionTypes.LOAD_ADDITIONAL_SERVICE:
            {
                return Object.assign({}, state, { hasAdditionalServiceLoaded: false });
            }

        case lookupActions.ActionTypes.LOAD_ADDITIONAL_SERVICE_COMPLETE:
            {
                return Object.assign({}, state, { hasAdditionalServiceLoaded: true, AdditionalService: action.payload.Entities });
            }

        case lookupActions.ActionTypes.LOAD_SECTORS:
            {
                return Object.assign({}, state, {});
            }
        case lookupActions.ActionTypes.LOAD_SECTORS_COMPLETE:
            {
                return Object.assign({}, state, { Sectors: action.payload });
            }

        case lookupActions.ActionTypes.INCIDENT_TYPE_LOAD:
            {
                return Object.assign({}, state, {});
            }
        case lookupActions.ActionTypes.INCIDENT_TYPE_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { IncidentTypeData: action.payload });
            }
        case lookupActions.ActionTypes.INJURY_TYPE_LOAD:
            {
                return Object.assign({}, state, {});
            }
        case lookupActions.ActionTypes.INJURY_TYPE_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { InjuryTypeData: action.payload });
            }
        case lookupActions.ActionTypes.INJURED_PART_LOAD:
            {
                return Object.assign({}, state, {});
            }
        case lookupActions.ActionTypes.INJURED_PART_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { InjuredPartData: action.payload });
            }
        case lookupActions.ActionTypes.WORK_PROCESS_LOAD:
            {
                return Object.assign({}, state, {});
            }
        case lookupActions.ActionTypes.WORK_PROCESS_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { WorkProcessData: action.payload });
            }
        case lookupActions.ActionTypes.MAIN_FACTOR_LOAD:
            {
                return Object.assign({}, state, {});
            }
        case lookupActions.ActionTypes.MAIN_FACTOR_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { MainFactorData: action.payload });
            }

        case lookupActions.ActionTypes.LOAD_PPECATEGORY:
            {
                return Object.assign({}, state, {});
            }
        case lookupActions.ActionTypes.LOAD_PPECATEGORY_COMPLETE:
            {
                return Object.assign({}, state, { PPECategories: action.payload });
            }
        case lookupActions.ActionTypes.LOAD_PPECATEGORY_GROUPS:
            {
                return Object.assign({}, state, {});
            }
        case lookupActions.ActionTypes.LOAD_PPECATEGORY_GROUPS_COMPLETE:
            {
                return Object.assign({}, state, { PPECategoryGroups: action.payload });
            }
        case lookupActions.ActionTypes.LOAD_MAIN_INDUSTRY_COMPLETE:
            {
                return Object.assign({}, state, { MainIndustries: action.payload });
            }
        case lookupActions.ActionTypes.LOAD_MAIN_ACTIVITY_COMPLETE:
            {
                return Object.assign({}, state, { MainActivities: action.payload });
            }
        case lookupActions.ActionTypes.LOAD_SUB_ACTIVITY_COMPLETE:
            {
                return Object.assign({}, state, { SubActivities: action.payload });
            }
        case lookupActions.ActionTypes.LOAD_GEO_LOCATIONS_COMPLETE:
            {
                return Object.assign({}, state, { GeoLocations: action.payload });
            }
        case lookupActions.ActionTypes.LOAD_LOCAL_AUTHORITIES_COMPLETE:
            {
                return Object.assign({}, state, { LocalAuthorities: action.payload });
            }
        case lookupActions.ActionTypes.LOAD_RISK_ASSESSMENT_TYPES: {
            return Object.assign({}, state, {});
        }

        case lookupActions.ActionTypes.LOAD_RISK_ASSESSMENT_TYPES_COMPLETE: {
            return Object.assign({}, state, { RiskAssessmentTypes: action.payload });
        }

        case lookupActions.ActionTypes.LOAD_RESPONSIBILITIES:
            {
                return Object.assign({}, state, {});
            }
        case lookupActions.ActionTypes.LOAD_RESPONSIBILITIES_COMPLETE:
            {
                return Object.assign({}, state, { Responsibilities: action.payload });
            }
        case lookupActions.ActionTypes.LOAD_HELP_AREAS:
            {
                return Object.assign({}, state, {});
            }
        case lookupActions.ActionTypes.LOAD_HELP_AREAS_COMPLETE:
            {
                return Object.assign({}, state, { HelpAreas: Immutable.List<HelpArea>(action.payload) });
            }
        case lookupActions.ActionTypes.LOAD_STANDARD_ICONS: {
            return Object.assign({}, state, { hasStandardHazardIocnsLoaded: false });
        }
        case lookupActions.ActionTypes.LOAD_STANDARD_ICONS_COMPLETE: {
            let modifiedState = Object.assign({}, state, {});
            modifiedState.standardHazardIcons = action.payload;
            return Object.assign({}, state, { standardHazardIcons: action.payload, hasStandardHazardIocnsLoaded: true });
        }
        case lookupActions.ActionTypes.LOAD_STANDARD_CONTROL_ICONS: {
            return Object.assign({}, state, { hasStandardControlIocnsLoaded: false });
        }
        case lookupActions.ActionTypes.LOAD_STANDARD_CONTROL_ICONS_COMPLETE: {
            let modifiedState = Object.assign({}, state, {});
            modifiedState.standardControlIcons = action.payload;
            return Object.assign({}, state, { standardControlIcons: action.payload, hasStandardControlIocnsLoaded: true });
        }
        default:
            currentState = state;
            break;
    }
    return currentState;
}


export function getCountyData(state$: Observable<LookupState>): Observable<Array<County>> {
    return state$.select(s => s.CountyData);
}

export function getCountyImmutableData(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.CountyData && Immutable.List(s.CountyData).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }).sort((a, b) => a.Text.localeCompare(b.Text)).toList());
}

export function countyDataLoadStatus(state$: Observable<LookupState>): Observable<boolean> {
    return state$.select(s => s.hasCountyDataLoaded);
}

export function getCountryData(state$: Observable<LookupState>): Observable<Array<Country>> {
    return state$.select(s => s.CountryData);
}

export function getCountryImmutableData(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.CountryData && Immutable.List(s.CountryData).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }).sort((a, b) => a.Text.localeCompare(b.Text)).toList());
}

export function getUserListData(state$: Observable<LookupState>): Observable<AeSelectItem<string>[]> {
    return state$.select(s => s.UserListData);
}

export function countryDataLoadStatus(state$: Observable<LookupState>): Observable<boolean> {
    return state$.select(s => s.hasCountryDataLoaded);
}

export function userListDataLoadStatus(state$: Observable<LookupState>): Observable<boolean> {
    return state$.select(s => s.hasUserListDataLoaded);
}

export function getEmployeeRelationsData(state$: Observable<LookupState>): Observable<Array<EmployeeRelations>> {
    return state$.select(s => s.EmployeeRelationsData);
}

export function employeeRelationsDataLoadStatus(state$: Observable<LookupState>): Observable<boolean> {
    return state$.select(s => s.hasEmpoyeeRelationsDataLoaded);
}

export function absenceStatusData(state$: Observable<LookupState>): Observable<Array<AbsenceStatus>> {
    return state$.select(s => s.AbsenceStatuses);
}

export function absenceStatusAdjustedImmutable(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    //return state$.select(s => s.AbsenceStatuses);
    return state$.select(s => s.AbsenceStatuses && Immutable.List(s.AbsenceStatuses.filter(keyValuePair => keyValuePair.Code !== AbsenceStatusCode.Resubmitted &&
        keyValuePair.Code !== AbsenceStatusCode.Requestforchange && keyValuePair.Code !== AbsenceStatusCode.Requestforcancellation).map((keyValuePair) => {
            let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
            aeSelectItem.Childrens = null;
            if (keyValuePair.Code === AbsenceStatusCode.Requested) {
                aeSelectItem.Text = "Pending";
            }
            else
                aeSelectItem.Text = keyValuePair.Name;
            aeSelectItem.Value = keyValuePair.Id;
            return aeSelectItem;
        })));
}


export function absenceStatusLoadStatus(state$: Observable<LookupState>): Observable<boolean> {
    return state$.select(s => s.hasAbsenceStatusDataLoaded);
}

export function getPeriodOptionListData(state$: Observable<LookupState>): Observable<AeSelectItem<string>[]> {
    return state$.select(s => s.PeriodOptionList);
}

export function getLookUpState(state$: Observable<LookupState>): Observable<LookupState> {
    return state$;
}

export function employeeEthnicGroupData(state$: Observable<LookupState>): Observable<EthnicGroup[]> {
    return state$.select(x => x.EthnicGroupData)
}

export function employeeEthnicGroupDataLoadStatus(state$: Observable<LookupState>): Observable<boolean> {
    return state$.select(x => x.hasEthnicGroupDataLoaded)
}



export function otcEntitiesData(state$: Observable<LookupState>): Observable<EntityReference[]> {
    return state$.select(x => x.OtcEntityData);
}

export function otcEntitiesDataLoadStatus(state$: Observable<LookupState>): Observable<boolean> {
    return state$.select(x => x.hasOtcEntityDataLoaded);
}

export function getPeriodOptionListLoadingStatus(state$: Observable<LookupState>): Observable<boolean> {
    return state$.select(x => x.HasPeriodOptionListLoaded)
}

export function getWorkSpaceTypeOptionListData(state$: Observable<LookupState>): Observable<Workspace[]> {
    return state$.select(s => s.WorkSpaceTypeOptionList);
}

export function getWorkSpaceTypeListLoadingStatus(state$: Observable<LookupState>): Observable<boolean> {
    return state$.select(s => s.HasWorkSpaceTypeOptionListLoaded);
}

export function getEmploymentStatusOptionListData(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.EmploymentStatusOptionList);
}

export function getEmploymentStatusListLoadingStatus(state$: Observable<LookupState>): Observable<boolean> {
    return state$.select(s => s.HasEmploymentStatusOptionListLoaded);
}

export function getEmploymentTypeOptionListData(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.EmploymentTypeOptionList);
}

export function getEmploymentTypeListLoadingStatus(state$: Observable<LookupState>): Observable<boolean> {
    return state$.select(s => s.HasEmploymentTypeOptionListLoaded);
}

export function getEmployeeTimelineEventTypes(state$: Observable<LookupState>): Observable<EventType[]> {
    return state$.select(s => s.EventTypesData);
}

export function getEmployeeTimelineEventDisciplinaryOutcomes(state$: Observable<LookupState>): Observable<DisciplinaryOutcome[]> {
    return state$.select(s => s.DisciplinaryOutcomeData);
}

export function getEmployeeTimelineEventOutcomes(state$: Observable<LookupState>): Observable<Outcome[]> {
    return state$.select(s => s.OutcomeData);
}
export function getReportCategories(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(state => state && state.ReportCategories);
}

export function incidentCategories(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => mapIncidentCategoriesToAeSelectItems(s.IncidentCategories));
}

export function getMetaData(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(state => state && state.MetaData);
}

export function getMetaDataExclCompany(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.MetaData && Immutable.List(s.MetaData).filter(obj => obj.Value != '1').map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Text, keyValuePair.Value);
        return aeSelectItem;
    }).sort((a, b) => a.Text.localeCompare(b.Text)).toList());

}

export function getEmployeeTimelineLeavingReasons(state$: Observable<LookupState>): Observable<EmployeeLeavingReason[]> {
    return state$.select(state => state && state.EmployeeLeavingReasons);
}

export function getEmployeeTimelineSubReasons(state$: Observable<LookupState>): Observable<EmployeeLeavingSubReason[]> {
    return state$.select(state => state && state.EmployeeLeavingSubReasons);
}

export function getUserProfiles(state$: Observable<LookupState>): Observable<UserProfile[]> {
    return state$.select(state => state && state.UserProfiles);
}

export function absenceCodesLoadStatus(state$: Observable<LookupState>): Observable<boolean> {
    return state$.select(s => s.hasAbsenceCodesLoaded);
}
export function absenceCodesData(state$: Observable<LookupState>): Observable<Array<AbsenceCode>> {
    return state$.select(s => s.AbsenceCodes);
}

export function getProcedureGroupList(state$: Observable<LookupState>): Observable<Array<ProcedureGroup>> {
    return state$.select(s => s.ProcedureGroups);
}

export function getProcedureGroups(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.ProcedureGroups && Immutable.List(s.ProcedureGroups).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }).sort((a, b) => a.Text.localeCompare(b.Text)).toList());
}

export function additionalServiceLoadStatus(state$: Observable<LookupState>): Observable<boolean> {
    return state$.select(s => s.hasAdditionalServiceLoaded);
}
export function additionalServiceData(state$: Observable<LookupState>): Observable<Array<AdditionalService>> {
    return state$.select(s => s.AdditionalService);
}

export function getsectorsData(state$: Observable<LookupState>): Observable<Sector[]> {
    return state$.select(s => s.Sectors);
}


export function getIncidentTypeData(state$: Observable<LookupState>): Observable<Array<IncidentType>> {
    return state$.select(s => s.IncidentTypeData);
}

export function getInjuryTypeData(state$: Observable<LookupState>): Observable<Array<InjuryType>> {
    return state$.select(s => s.InjuryTypeData);
}
export function getInjuryTypeImmutableData(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.InjuryTypeData && Immutable.List(s.InjuryTypeData).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }).sort((a, b) => a.Text.localeCompare(b.Text)).toList());
}
export function getInjuryTypeAutocompleteData(state$: Observable<LookupState>): Observable<AeSelectItem<string>[]> {
    return state$.select(s => s.InjuryTypeData && s.InjuryTypeData.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }).sort((a, b) => a.Text.localeCompare(b.Text)));
}

export function getInjuredPartData(state$: Observable<LookupState>): Observable<Array<InjuredPart>> {
    return state$.select(s => s.InjuredPartData);
}
export function getInjuredPartImmutableData(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.InjuredPartData && Immutable.List(s.InjuredPartData).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }).sort((a, b) => a.Text.localeCompare(b.Text)).toList());
}
export function getInjuredPartAutocompleteData(state$: Observable<LookupState>): Observable<AeSelectItem<string>[]> {
    return state$.select(s => s.InjuredPartData && s.InjuredPartData.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }).sort((a, b) => a.Text.localeCompare(b.Text)));
}

export function getWorkProcessData(state$: Observable<LookupState>): Observable<Array<WorkProcess>> {
    return state$.select(s => s.WorkProcessData);
}
export function getWorkProcessImmutableData(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.WorkProcessData && Immutable.List(s.WorkProcessData).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }).sort((a, b) => a.Text.localeCompare(b.Text)).toList());
}

export function getMainFactorData(state$: Observable<LookupState>): Observable<Array<MainFactor>> {
    return state$.select(s => s.MainFactorData);
}
export function getMainFactorImmutableData(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.MainFactorData && Immutable.List(s.MainFactorData).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
        return aeSelectItem;
    }).sort((a, b) => a.Text.localeCompare(b.Text)).toList());
}

export function getPPECategoryData(state$: Observable<LookupState>): Observable<PPECategory[]> {
    return state$.select(s => s.PPECategories);
}

export function getPPECategoryGroupData(state$: Observable<LookupState>): Observable<PPECategoryGroup[]> {
    return state$.select(s => s.PPECategoryGroups);
}

export function getriskAssessmentTypes(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.RiskAssessmentTypes);
}



export function getResponsibilities(state$: Observable<LookupState>): Observable<Responsiblity[]> {
    return state$.select(s => s.Responsibilities);
}

export function getMainIndustries(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.MainIndustries);
}

export function getMainActivities(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.MainActivities);
}

export function getSubActivities(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.SubActivities);
}

export function getGeoLocations(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.GeoLocations);
}

export function getLocalAuthorities(state$: Observable<LookupState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.LocalAuthorities);
}
export function getHelpAreas(state$: Observable<LookupState>): Observable<Immutable.List<HelpArea>> {
    return state$.select(state => state.HelpAreas);
}

export function getStandardHazardIcons(state$: Observable<LookupState>): Observable<Array<Document>> {
    return state$.select(s => s.standardHazardIcons);
}

export function getHasStandardHazardsLoaded(state$: Observable<LookupState>): Observable<boolean> {
    return state$.select(s => s.hasStandardHazardIocnsLoaded);
}

export function getStandardControlIcons(state$: Observable<LookupState>): Observable<Array<Document>> {
    return state$.select(s => s.standardControlIcons);
}