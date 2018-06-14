import { AeListItem } from './../../../atlas-elements/common/models/ae-list-item';
import { Employee } from './../../../calendar/model/calendar-models';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { isNullOrUndefined } from 'util';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { extractDataTableOptions } from './../../../shared/helpers/extract-helpers';
import { AeSortModel } from './../../../atlas-elements/common/models/ae-sort-model';
import { NonWorkingdaysModel, NonWorkingdaysNotesModel } from './../models/nonworkingdays-model';
import {
    AtlasApiRequest,
    AtlasApiRequestWithParams,
    AtlasApiResponse
} from './../../../shared/models/atlas-api-response';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as NonWorkingDaysActions from './../actions/nonworkingdays-actions';
import * as Immutable from 'immutable';
import { processNonWorkingDaysList } from './../common/extract-helpers';


export interface NonWorkingDaysState {
    hasStandardNonWorkingDaysLoaded: boolean,
    standardNonWorkingDaysRequest: AtlasApiRequestWithParams;
    standardNonWorkingDays: Immutable.List<NonWorkingdaysModel>;
    standardNonWorkingDaysPagingInfo: PagingInfo;
    hasCustomNonWorkingDaysLoaded: boolean;
    customNonWorkingDaysRequest: AtlasApiRequestWithParams;
    customNonWorkingDays: Immutable.List<NonWorkingdaysModel>;
    customNonWorkingDaysPagingInfo: PagingInfo;
    hasCompanyNonWorkingDayLoaded: boolean;
    companyNonWorkingDay: NonWorkingdaysModel;
    selectedStandardWorkingDayNotes: Immutable.List<NonWorkingdaysNotesModel>;
    employees: AeSelectItem<string>[];
    hasNonWorkingDayFiltersChanged: boolean;
    hasSelectedProfileNotesLoaded: boolean;
    selectedProfileNotes: NonWorkingdaysNotesModel[];
    customNonWorkingProfilesValidationData: NonWorkingdaysModel[];
    hasSelectedNonWorkingProfileFullEntityLoaded: boolean;
    selectedNonWorkingProfileFullEntity: NonWorkingdaysModel;
    IsNonWorkingdayProfileLoaded: boolean;
    IsNonWorkingdayProfileAssignSaved: boolean;
    NonWorkingdayProfile: NonWorkingdaysModel;
    IsAddNonWorkingDayProfileCompleted: boolean;
    IsUpdateNonWorkingDayProfileCompleted: boolean;
    copiedNonWorkingDayProfileId: string;
}


const initialState: NonWorkingDaysState = {
    hasStandardNonWorkingDaysLoaded: false,
    standardNonWorkingDaysRequest: null,
    standardNonWorkingDays: null,
    standardNonWorkingDaysPagingInfo: null,
    hasCustomNonWorkingDaysLoaded: false,
    customNonWorkingDaysRequest: null,
    customNonWorkingDays: null,
    customNonWorkingDaysPagingInfo: null,
    hasCompanyNonWorkingDayLoaded: false,
    companyNonWorkingDay: null,
    selectedStandardWorkingDayNotes: null,
    employees: null,
    hasNonWorkingDayFiltersChanged: false,
    hasSelectedProfileNotesLoaded: false,
    selectedProfileNotes: null,
    customNonWorkingProfilesValidationData: null,
    hasSelectedNonWorkingProfileFullEntityLoaded: false,
    selectedNonWorkingProfileFullEntity: null,
    IsNonWorkingdayProfileLoaded: null,
    IsNonWorkingdayProfileAssignSaved: null,
    NonWorkingdayProfile: null,
    IsAddNonWorkingDayProfileCompleted: null,
    IsUpdateNonWorkingDayProfileCompleted: null,
    copiedNonWorkingDayProfileId: null
};

export function reducer(state = initialState, action: Action): NonWorkingDaysState {
    switch (action.type) {
        case NonWorkingDaysActions.ActionTypes.LOAD_STANDARD_NONWORKING_DAYS:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.hasStandardNonWorkingDaysLoaded = false;
                modifiedState.standardNonWorkingDaysRequest = action.payload;
                modifiedState.hasNonWorkingDayFiltersChanged = false;
                return modifiedState;

            }
        case NonWorkingDaysActions.ActionTypes.LOAD_STANDARD_NONWORKING_DAYS_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.hasStandardNonWorkingDaysLoaded = true;
                let pl = <AtlasApiResponse<NonWorkingdaysModel>>action.payload;
                modifiedState.standardNonWorkingDays = Immutable.List<NonWorkingdaysModel>(processNonWorkingDaysList(pl.Entities, modifiedState.companyNonWorkingDay.Id));
                if (!isNullOrUndefined(modifiedState.standardNonWorkingDaysPagingInfo)) {
                    if (pl.PagingInfo.PageNumber == 1) {
                        modifiedState.standardNonWorkingDaysPagingInfo.TotalCount = pl.PagingInfo.TotalCount;
                    }
                    modifiedState.standardNonWorkingDaysPagingInfo.Count = pl.PagingInfo.Count;
                    modifiedState.standardNonWorkingDaysPagingInfo.PageNumber = pl.PagingInfo.PageNumber;
                }
                else {
                    modifiedState.standardNonWorkingDaysPagingInfo = pl.PagingInfo;
                }
                return modifiedState;
            }

        case NonWorkingDaysActions.ActionTypes.LOAD_CUSTOM_NONWORKING_DAYS:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.hasCustomNonWorkingDaysLoaded = false;
                modifiedState.customNonWorkingDaysRequest = action.payload;
                modifiedState.hasNonWorkingDayFiltersChanged = false;
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.LOAD_CUSTOM_NONWORKING_DAYS_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.hasCustomNonWorkingDaysLoaded = true;
                let pl = <AtlasApiResponse<NonWorkingdaysModel>>action.payload;
                modifiedState.customNonWorkingDays = Immutable.List<NonWorkingdaysModel>(processNonWorkingDaysList(pl.Entities, modifiedState.companyNonWorkingDay.Id));
                if (!isNullOrUndefined(modifiedState.customNonWorkingDaysPagingInfo)) {
                    if (pl.PagingInfo.PageNumber == 1) {
                        modifiedState.customNonWorkingDaysPagingInfo.TotalCount = pl.PagingInfo.TotalCount;
                    }
                    modifiedState.customNonWorkingDaysPagingInfo.Count = pl.PagingInfo.Count;
                    modifiedState.customNonWorkingDaysPagingInfo.PageNumber = pl.PagingInfo.PageNumber;
                }
                else {
                    modifiedState.customNonWorkingDaysPagingInfo = pl.PagingInfo;
                }
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.LOAD_COMPANY_NONWORKING_DAY:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.hasCompanyNonWorkingDayLoaded = false;
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.LOAD_COMPANY_NONWORKING_DAY_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.hasCompanyNonWorkingDayLoaded = true;
                modifiedState.companyNonWorkingDay = <NonWorkingdaysModel>action.payload
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.REMOVE_CUSTOM_NONWORKING_DAY:
            {
                let modifiedState = Object.assign({}, state);
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.REMOVE_CUSTOM_NONWORKING_DAY_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                if (!isNullOrUndefined(modifiedState.customNonWorkingProfilesValidationData)) {
                    modifiedState.customNonWorkingProfilesValidationData =
                        modifiedState.customNonWorkingProfilesValidationData.filter((dd) => dd.Id !== action.payload.Id);
                }
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.LOAD_NONWORKING_DAYS_EMPLOYEES:
            {
                let modifiedState = Object.assign({}, state);
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.LOAD_NONWORKING_DAYS_EMPLOYEES_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                let response = <AtlasApiResponse<Employee>>action.payload;
                modifiedState.employees = response.Entities.map((keyValuePair) => {
                    let aeSelectItem = new AeSelectItem<string>(keyValuePair.FirstName + ' ' + keyValuePair.SurName, keyValuePair.Id);
                    return aeSelectItem;
                });
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.NONWORKING_DAYS_FILTERS_CHANGED:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.standardNonWorkingDaysRequest = action.payload.standardApiRequest;
                modifiedState.customNonWorkingDaysRequest = action.payload.customApiRequest;
                modifiedState.hasNonWorkingDayFiltersChanged = true;
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.LOAD_SELECTED_NONWORKING_DAYS_NOTES:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.hasSelectedProfileNotesLoaded = false;
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.LOAD_SELECTED_NONWORKING_DAYS_NOTES_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                let response = <AtlasApiResponse<NonWorkingdaysNotesModel>>action.payload;
                modifiedState.selectedProfileNotes = response.Entities;
                modifiedState.hasSelectedProfileNotesLoaded = true;
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.LOAD_CUSTOM_NONWORKING_DAYS_VALIDATION_DATA_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                let response = <NonWorkingdaysModel[]>action.payload;
                modifiedState.customNonWorkingProfilesValidationData = response;
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.LOAD_SELECTED_NONWORKING_DAYS_FULL_ENTITY: {
            let modifiedState = Object.assign({}, state);
            modifiedState.hasSelectedNonWorkingProfileFullEntityLoaded = false;
            return modifiedState;
        }
        case NonWorkingDaysActions.ActionTypes.LOAD_SELECTED_NONWORKING_DAYS_FULL_ENTITY_COMPLETE: {
            let modifiedState = Object.assign({}, state);
            modifiedState.hasSelectedNonWorkingProfileFullEntityLoaded = true;
            modifiedState.selectedNonWorkingProfileFullEntity = action.payload;
            return modifiedState;
        }
        case NonWorkingDaysActions.ActionTypes.LOAD_NON_WORKING_DAY_PROFILE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.IsNonWorkingdayProfileLoaded = false;
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.LOAD_NON_WORKING_DAY_PROFILE_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.IsNonWorkingdayProfileLoaded = true;
                modifiedState.NonWorkingdayProfile = action.payload;
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.NONWORKING_DAYS_ASSIGN_SAVE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.IsNonWorkingdayProfileAssignSaved = false;
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.NONWORKING_DAYS_ASSIGN_SAVE_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.IsNonWorkingdayProfileAssignSaved = true;
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.ADD_NON_WORKING_DAY_PROFILE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.IsAddNonWorkingDayProfileCompleted = false;
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.ADD_NON_WORKING_DAY_PROFILE_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.IsAddNonWorkingDayProfileCompleted = true;
                if (!isNullOrUndefined(modifiedState.customNonWorkingProfilesValidationData)) {
                    modifiedState.customNonWorkingProfilesValidationData =
                        modifiedState.customNonWorkingProfilesValidationData.concat(Array.of(<NonWorkingdaysModel>({
                            Id: action.payload.Id,
                            Name: action.payload.Name
                        })));
                }
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.UPDATE_NON_WORKING_DAY_PROFILE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.IsUpdateNonWorkingDayProfileCompleted = false;
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.UPDATE_NON_WORKING_DAY_PROFILE_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.IsUpdateNonWorkingDayProfileCompleted = true;
                if (!isNullOrUndefined(modifiedState.customNonWorkingProfilesValidationData)) {
                    modifiedState.customNonWorkingProfilesValidationData =
                        modifiedState.customNonWorkingProfilesValidationData.filter((dd) => dd.Id !== action.payload.Id);
                    modifiedState.customNonWorkingProfilesValidationData =
                        modifiedState.customNonWorkingProfilesValidationData.concat(Array.of(<NonWorkingdaysModel>({
                            Id: action.payload.Id,
                            Name: action.payload.Name
                        })));
                    modifiedState.selectedNonWorkingProfileFullEntity = null;
                }
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.CLEAR_NON_WORKING_DAY_PROFILE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.IsUpdateNonWorkingDayProfileCompleted = null;
                modifiedState.IsAddNonWorkingDayProfileCompleted = null;
                modifiedState.NonWorkingdayProfile = null;
                modifiedState.IsNonWorkingdayProfileLoaded = null;
                modifiedState.IsNonWorkingdayProfileAssignSaved = null;
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.NONWORKING_DAYS_COPY:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.copiedNonWorkingDayProfileId = null;
                return modifiedState;
            }
        case NonWorkingDaysActions.ActionTypes.NONWORKING_DAYS_COPY_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.copiedNonWorkingDayProfileId = action.payload.Id;
                return modifiedState;
            }
            case NonWorkingDaysActions.ActionTypes.CLEAR_NONWORKING_DAYS_FILTERS:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.standardNonWorkingDaysRequest = null;
                modifiedState.customNonWorkingDaysRequest = null;
                modifiedState.hasStandardNonWorkingDaysLoaded = false;
                modifiedState.hasCustomNonWorkingDaysLoaded = false;
                return modifiedState;
            }
        default:
            return state;
    }

};


export function getHasStandardNonWorkingdaysLoaded(state$: Observable<NonWorkingDaysState>): Observable<boolean> {
    return state$.select(s => s.hasStandardNonWorkingDaysLoaded);
};

export function getHasFiltersChanged(state$: Observable<NonWorkingDaysState>): Observable<boolean> {
    return state$.select(s => s.hasNonWorkingDayFiltersChanged);
};


export function getStandardNonWorkingDaysApiRequest(state$: Observable<NonWorkingDaysState>): Observable<AtlasApiRequestWithParams> {
    return state$.select(s => s.standardNonWorkingDaysRequest);
};

export function getStandardNonWorkingDays(state$: Observable<NonWorkingDaysState>): Observable<Immutable.List<NonWorkingdaysModel>> {
    return state$.select(s => s.standardNonWorkingDays);
};

export function getStandardNonWorkingDaysTotalCount(state$: Observable<NonWorkingDaysState>): Observable<number> {
    return state$.select(s => s.standardNonWorkingDaysPagingInfo && s.standardNonWorkingDaysPagingInfo.TotalCount);
};

export function getStandardNonWorkingdaysDataTableOptions(state$: Observable<NonWorkingDaysState>): Observable<DataTableOptions> {
    return state$.select(state => state.standardNonWorkingDaysPagingInfo && state.standardNonWorkingDaysRequest && extractDataTableOptions(state.standardNonWorkingDaysPagingInfo,state.standardNonWorkingDaysRequest.SortBy));
};


export function getHasCustomNonWorkingdaysLoaded(state$: Observable<NonWorkingDaysState>): Observable<boolean> {
    return state$.select(s => s.hasCustomNonWorkingDaysLoaded);
};

export function getCustomNonWorkingDaysApiRequest(state$: Observable<NonWorkingDaysState>): Observable<AtlasApiRequestWithParams> {
    return state$.select(s => s.customNonWorkingDaysRequest);
};

export function getCustomNonWorkingDays(state$: Observable<NonWorkingDaysState>): Observable<Immutable.List<NonWorkingdaysModel>> {
    return state$.select(s => s.customNonWorkingDays);
};

export function getCustomNonWorkingDaysTotalCount(state$: Observable<NonWorkingDaysState>): Observable<number> {
    return state$.select(s => s.customNonWorkingDaysPagingInfo && s.customNonWorkingDaysPagingInfo.TotalCount);
};

export function getCustomNonWorkingdaysDataTableOptions(state$: Observable<NonWorkingDaysState>): Observable<DataTableOptions> {
    return state$.select(state => state.customNonWorkingDaysPagingInfo && state.customNonWorkingDaysRequest && extractDataTableOptions(state.customNonWorkingDaysPagingInfo,state.customNonWorkingDaysRequest.SortBy));
};

export function getCompanyNonWorkingDay(state$: Observable<NonWorkingDaysState>): Observable<NonWorkingdaysModel> {
    return state$.select(state => state.companyNonWorkingDay);
};

export function getHasCompanyNonWorkingdaysLoaded(state$: Observable<NonWorkingDaysState>): Observable<boolean> {
    return state$.select(s => s.hasCompanyNonWorkingDayLoaded);
};

export function getNonWorkingDaysEmployees(state$: Observable<NonWorkingDaysState>): Observable<AeSelectItem<string>[]> {
    return state$.select(s => s.employees);
};

export function getSelectedProfileNotes(state$: Observable<NonWorkingDaysState>): Observable<NonWorkingdaysNotesModel[]> {
    return state$.select(s => s.selectedProfileNotes);
};

export function getHasSelectedProfileNotesLoaded(state$: Observable<NonWorkingDaysState>): Observable<boolean> {
    return state$.select(s => s.hasSelectedProfileNotesLoaded);
};

export function getCustonNonWorkingDaysValidation(state$: Observable<NonWorkingDaysState>): Observable<NonWorkingdaysModel[]> {
    return state$.select(s => s.customNonWorkingProfilesValidationData);
};

export function getHasSelectedProfileFullEntityLoaded(state$: Observable<NonWorkingDaysState>): Observable<boolean> {
    return state$.select(s => s.hasSelectedNonWorkingProfileFullEntityLoaded);
};

export function getHasSelectedProfileFullEntity(state$: Observable<NonWorkingDaysState>): Observable<NonWorkingdaysModel> {
    return state$.select(s => s.selectedNonWorkingProfileFullEntity);
};

export function getNonWorkingdayProfileData(state$: Observable<NonWorkingDaysState>): Observable<NonWorkingdaysModel> {
    return state$.select(s => s.NonWorkingdayProfile);
};

export function getNonWorkingdayProfileLoadStatus(state$: Observable<NonWorkingDaysState>): Observable<boolean> {
    return state$.select(s => s.IsNonWorkingdayProfileLoaded);
};

export function getNonWorkingdayProfileAssignStatus(state$: Observable<NonWorkingDaysState>): Observable<boolean> {
    return state$.select(s => s.IsNonWorkingdayProfileAssignSaved);
};

export function addNonWorkingdayProfileStatus(state$: Observable<NonWorkingDaysState>): Observable<boolean> {
    return state$.select(s => s.IsAddNonWorkingDayProfileCompleted);
};

export function updateNonWorkingdayProfileStatus(state$: Observable<NonWorkingDaysState>): Observable<boolean> {
    return state$.select(s => s.IsUpdateNonWorkingDayProfileCompleted);
};

export function getCopiedWorkingdayProfile(state$: Observable<NonWorkingDaysState>): Observable<string> {
    return state$.select(s => s.copiedNonWorkingDayProfileId);
};



