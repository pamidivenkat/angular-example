import { Employee } from './../../../calendar/model/calendar-models';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AeSortModel } from './../../../atlas-elements/common/models/ae-sort-model';
import { NonWorkingdaysModel, NonWorkingdaysNotesModel, HWPAssignToModel } from './../models/nonworkingdays-model';
import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';

export const ActionTypes = {
    LOAD_STANDARD_NONWORKING_DAYS: type('[NonWorkingDays] Load standard non working days'),
    LOAD_STANDARD_NONWORKING_DAYS_COMPLETE: type('[NonWorkingDays] Load standard non working days complete'),
    LOAD_CUSTOM_NONWORKING_DAYS: type('[NonWorkingDays] Load custom non working days'),
    LOAD_CUSTOM_NONWORKING_DAYS_COMPLETE: type('[NonWorkingDays] Load custom non working days complete'),
    LOAD_COMPANY_NONWORKING_DAY: type('[NonWorkingDays] Load company nonworking days'),
    LOAD_COMPANY_NONWORKING_DAY_COMPLETE: type('[NonWorkingDays] Load company nonworking days complete'),
    REMOVE_CUSTOM_NONWORKING_DAY: type('[NonWorkingDays] Remove custom nonworking days'),
    REMOVE_CUSTOM_NONWORKING_DAY_COMPLETE: type('[NonWorkingDays] Remove custom nonworking days complete'),
    LOAD_NONWORKING_DAYS_EMPLOYEES: type('[NonWorkingDays] Load non working days employees'),
    LOAD_NONWORKING_DAYS_EMPLOYEES_COMPLETE: type('[NonWorkingDays] Load non working days employees complete'),
    NONWORKING_DAYS_FILTERS_CHANGED: type('[NonWorkingDays] Non working days filters changed'),
    LOAD_SELECTED_NONWORKING_DAYS_NOTES: type('[NonWorkingDays] Load selected non working day profile notes'),
    LOAD_SELECTED_NONWORKING_DAYS_NOTES_COMPLETE: type('[NonWorkingDays] Load selected non working day profile notes complete'),
    LOAD_CUSTOM_NONWORKING_DAYS_VALIDATION_DATA: type('[NonWorkingDays] Load custom non working day profile Id,Name to verify the uniqueness of the copied profile name'),
    LOAD_CUSTOM_NONWORKING_DAYS_VALIDATION_DATA_COMPLETE: type('[NonWorkingDays] Load custom non working day profile Id,Name to verify the uniqueness of the copied profile name complete'),
    NONWORKING_DAYS_COPY: type('[NonWorkingDays] copy non working day profile'),
    NONWORKING_DAYS_COPY_COMPLETE: type('[NonWorkingDays] copy non working day profile complete'),
    LOAD_SELECTED_NONWORKING_DAYS_FULL_ENTITY: type('[NonWorkingDays] Load selected non working day profile full entity'),
    LOAD_SELECTED_NONWORKING_DAYS_FULL_ENTITY_COMPLETE: type('[NonWorkingDays] Load selected non working day profile full entity complete'),
    LOAD_NON_WORKING_DAY_PROFILE: type('[ManageNonWorkingDays] Load non working day profile'),
    LOAD_NON_WORKING_DAY_PROFILE_COMPLETE: type('[ManageNonWorkingDays] Load non working day profile complete'),
    ADD_NON_WORKING_DAY_PROFILE: type('[ManageNonWorkingDays] Add non working day profile'),
    ADD_NON_WORKING_DAY_PROFILE_COMPLETE: type('[ManageNonWorkingDays] Add non working day profile complete'),
    UPDATE_NON_WORKING_DAY_PROFILE: type('[ManageNonWorkingDays] Update non working day profile'),
    UPDATE_NON_WORKING_DAY_PROFILE_COMPLETE: type('[ManageNonWorkingDays] Update non working day profile complete'),
    CLEAR_NON_WORKING_DAY_PROFILE: type('[ManageNonWorkingDays] Clear non working day profile'),
    NONWORKING_DAYS_ASSIGN_SAVE: type('[NonWorkingDays] Non working day assign save'),
    NONWORKING_DAYS_ASSIGN_SAVE_COMPLETE: type('[NonWorkingDays] Non working day assign save complete'),
    NONWORKING_DAYS_ASSIGN_REMOVE: type('[NonWorkingDays] Non working day profile remove'),
    CLEAR_NONWORKING_DAYS_FILTERS: type('[NonWorkingDays] Clear non working day filters'),
}
export class ClearNonWorkingDaysFiltersAction implements Action {
    type = ActionTypes.CLEAR_NONWORKING_DAYS_FILTERS;
    constructor() {
    }
}


export class LoadStandardNonWorkingDaysAction implements Action {
    type = ActionTypes.LOAD_STANDARD_NONWORKING_DAYS;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadStandardNonWorkingDaysCompleteAction implements Action {
    type = ActionTypes.LOAD_STANDARD_NONWORKING_DAYS_COMPLETE;
    constructor(public payload: AtlasApiResponse<NonWorkingdaysModel>) {
    }
}

export class LoadCustomNonWorkingDaysAction implements Action {
    type = ActionTypes.LOAD_CUSTOM_NONWORKING_DAYS;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadCustomNonWorkingDaysCompleteAction implements Action {
    type = ActionTypes.LOAD_CUSTOM_NONWORKING_DAYS_COMPLETE;
    constructor(public payload: AtlasApiResponse<NonWorkingdaysModel>) {
    }
}

export class LoadCompanyNonWorkingDaysAction implements Action {
    type = ActionTypes.LOAD_COMPANY_NONWORKING_DAY;
    constructor(public payload: string) {
    }
}

export class LoadCompanyNonWorkingDaysCompleteAction implements Action {
    type = ActionTypes.LOAD_COMPANY_NONWORKING_DAY_COMPLETE;
    constructor(public payload: NonWorkingdaysModel) {
    }
}


export class RemoveCustomNonWorkingDaysAction implements Action {
    type = ActionTypes.REMOVE_CUSTOM_NONWORKING_DAY;
    constructor(public payload: NonWorkingdaysModel) {
    }
}

export class RemoveCustomNonWorkingDaysCompleteAction implements Action {
    type = ActionTypes.REMOVE_CUSTOM_NONWORKING_DAY_COMPLETE;
    constructor(public payload: NonWorkingdaysModel) {
    }
}

export class LoadEmployeesAction implements Action {
    type = ActionTypes.LOAD_NONWORKING_DAYS_EMPLOYEES;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadEmployeesCompleteAction implements Action {
    type = ActionTypes.LOAD_NONWORKING_DAYS_EMPLOYEES_COMPLETE;
    constructor(public payload: AtlasApiResponse<Employee>) {
    }
}

export class NonWorkingdaysFiltersChangedAction implements Action {
    type = ActionTypes.NONWORKING_DAYS_FILTERS_CHANGED;
    constructor(public payload: { standardApiRequest: AtlasApiRequestWithParams, customApiRequest: AtlasApiRequestWithParams }) {
    }
}

export class LoadSelectedProfileNotesAction implements Action {
    type = ActionTypes.LOAD_SELECTED_NONWORKING_DAYS_NOTES;
    constructor(public payload: string) {
    }
}

export class LoadSelectedProfileNotesCompleteAction implements Action {
    type = ActionTypes.LOAD_SELECTED_NONWORKING_DAYS_NOTES_COMPLETE;
    constructor(public payload: AtlasApiResponse<NonWorkingdaysNotesModel>) {
    }
}

export class LoadCustomNonWorkingProfileValidationDataAction implements Action {
    type = ActionTypes.LOAD_CUSTOM_NONWORKING_DAYS_VALIDATION_DATA;
    constructor() {
    }
}

export class LoadCustomNonWorkingProfileValidationDataCompleteAction implements Action {
    type = ActionTypes.LOAD_CUSTOM_NONWORKING_DAYS_VALIDATION_DATA_COMPLETE;
    constructor(public payload: NonWorkingdaysModel[]) {
    }
}

export class NonWorkingDaysProfileCopyAction implements Action {
    type = ActionTypes.NONWORKING_DAYS_COPY;
    constructor(public payload: NonWorkingdaysModel) {
    }
}

export class NonWorkingDaysProfileCopyCompleteAction implements Action {
    type = ActionTypes.NONWORKING_DAYS_COPY_COMPLETE;
    constructor(public payload: NonWorkingdaysModel) {
    }
}


export class LoadSelectedNonWorkingDaysProfileAction implements Action {
    type = ActionTypes.LOAD_SELECTED_NONWORKING_DAYS_FULL_ENTITY;
    constructor(public payload: NonWorkingdaysModel) {
    }
}

export class LoadSelectedNonWorkingDaysProfileCompleteAction implements Action {
    type = ActionTypes.LOAD_SELECTED_NONWORKING_DAYS_FULL_ENTITY_COMPLETE;
    constructor(public payload: NonWorkingdaysModel) {
    }
}

export class LoadNonWorkingDayProfileAction implements Action {
    type = ActionTypes.LOAD_NON_WORKING_DAY_PROFILE;
    constructor(public payload: NonWorkingdaysModel) {
    }
}

export class LoadNonWorkingDayProfileCompleteAction implements Action {
    type = ActionTypes.LOAD_NON_WORKING_DAY_PROFILE_COMPLETE;
    constructor(public payload: NonWorkingdaysModel) {
    }
}

export class AddNonWorkingDayProfileAction implements Action {
    type = ActionTypes.ADD_NON_WORKING_DAY_PROFILE;
    constructor(public payload: NonWorkingdaysModel) {
    }
}

export class AddNonWorkingDayProfileCompleteAction implements Action {
    type = ActionTypes.ADD_NON_WORKING_DAY_PROFILE_COMPLETE;
    constructor(public payload: NonWorkingdaysModel) {
    }
}

export class UpdateNonWorkingDayProfileAction implements Action {
    type = ActionTypes.UPDATE_NON_WORKING_DAY_PROFILE;
    constructor(public payload: NonWorkingdaysModel) {
    }
}

export class UpdateNonWorkingDayProfileCompleteAction implements Action {
    type = ActionTypes.UPDATE_NON_WORKING_DAY_PROFILE_COMPLETE;
    constructor(public payload: NonWorkingdaysModel) {
    }
}

export class NonWorkingDaysAssignSaveAction implements Action {
    type = ActionTypes.NONWORKING_DAYS_ASSIGN_SAVE;
    constructor(public payload: HWPAssignToModel) {
    }
}

export class NonWorkingDaysAssignSaveCompleteAction implements Action {
    type = ActionTypes.NONWORKING_DAYS_ASSIGN_SAVE_COMPLETE;
    constructor(public payload: HWPAssignToModel) {
    }
}


export class NonWorkingDaysRemoveAction implements Action {
    type = ActionTypes.NONWORKING_DAYS_ASSIGN_REMOVE;
    constructor(public payload: NonWorkingdaysModel) {
    }
}

export class ClearNonWorkingDayProfileAction implements Action {
    type = ActionTypes.CLEAR_NON_WORKING_DAY_PROFILE;
    constructor(public payload: boolean) {
    }
}

export type Actions =
    LoadStandardNonWorkingDaysAction
    | LoadStandardNonWorkingDaysCompleteAction
    | LoadCustomNonWorkingDaysAction
    | LoadCustomNonWorkingDaysCompleteAction
    | LoadCompanyNonWorkingDaysAction
    | LoadCompanyNonWorkingDaysCompleteAction
    | RemoveCustomNonWorkingDaysAction
    | RemoveCustomNonWorkingDaysCompleteAction
    | LoadEmployeesAction
    | LoadEmployeesCompleteAction
    | NonWorkingdaysFiltersChangedAction
    | LoadSelectedProfileNotesAction
    | LoadSelectedProfileNotesCompleteAction
    | LoadCustomNonWorkingProfileValidationDataAction
    | LoadCustomNonWorkingProfileValidationDataCompleteAction
    | NonWorkingDaysProfileCopyAction
    | NonWorkingDaysProfileCopyCompleteAction
    | LoadSelectedNonWorkingDaysProfileAction
    | LoadSelectedNonWorkingDaysProfileCompleteAction
    | LoadNonWorkingDayProfileAction | LoadNonWorkingDayProfileCompleteAction
    | AddNonWorkingDayProfileAction | AddNonWorkingDayProfileCompleteAction
    | UpdateNonWorkingDayProfileAction | UpdateNonWorkingDayProfileCompleteAction
    | ClearNonWorkingDayProfileAction
    | NonWorkingDaysAssignSaveAction
    | NonWorkingDaysAssignSaveCompleteAction
    | NonWorkingDaysRemoveAction
    | ClearNonWorkingDaysFiltersAction;
