import { EmployeeHolidayWorkingProfile } from './../../holiday-absence/models/holiday-absence.model';
import { EmployeeJobDetails } from './../job/models/job-details.model';
import { EmployeeEvent } from '../employee-timeline/models/emloyee-event';
import { JobHistory } from '../models/job-history';
import { TrainingDetails } from '../models/qualification-history.model';
import { PreviousEmployment } from '../models/previous-employment';
import { AeSortModel } from '../../atlas-elements/common/models/ae-sort-model';
import { SalaryHistory } from '../models/salary-history';
import { EducationDetails } from '../models/education-history.model';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { VehicleDetails } from '../models/vehicle-details';
import { Actions, toPayload } from '@ngrx/effects';
import { EmergencyContact } from '../models/emergency-contact.model';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from '../../shared/models/atlas-api-response';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { EmployeeInformation } from '../models/employee-information';
import { EmployeeStatistics } from '../models/employee-statistics';
import { EmployeeFullEntity } from '../models/employee-full.model';
import {
    Employee,
    EmployeeContacts,
    EmployeeEmergencyContacts,
    EmployeePayrollDetails
} from '../models/employee.model';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';
import * as Immutable from 'immutable';
import { TrainingUserCourseModule } from '../models/training-history.model';
import { BankDetails } from "../models/bank-details";
import { EventType, Timeline } from '../models/timeline';
import { EmployeeBenefits } from "../benefits/models/employee-benefits.model";
import { EmployeeStatType } from '../models/employee-stat';
import { User } from "../../shared/models/user";
import { ResetPasswordVM, AdminOptions, UserAdminDetails } from './../../employee/administration/models/user-admin-details.model';
import { Document } from '../../document/models/document';

export const ActionTypes = {
    EMPLOYEE_LOAD: type('[EMPLOYEE] load employee'),
    EMPLOYEE_LOAD_COMPLETE: type('[EMPLOYEE] load employee complete'),
    EMPLOYEE_TAB_CHANGE: type('[EMPLOYEE] tab change'),

    EMPLOYEE_PERSONAL_LOAD: type('[EMPLOYEE] load employee personal'),
    EMPLOYEE_PERSONAL_LOAD_COMPLETE: type('[EMPLOYEE] Load employee personal complete'),
    EMPLOYEE_PERSONAL_UPDATE: type('[EMPLOYEE] Employee personal update'),
    EMPLOYEE_PERSONAL_UPDATE_COMPLETE: type('[EMPLOYEE] Employee personal update complete'),
    EMPLOYEE_DOB_CHANGE: type('[EMPLOYEE] employee dob selection change'),

    EMPLOYEE_INFORMATION_LOAD: type('[EmployeeInformation] Load employee information'),
    EMPLOYEE_INFORMATION_LOAD_COMPLETE: type('[EmployeeInformation] Load employee information complete'),

    EMPLOYEE_STATISTICS_LOAD: type('[EmployeeStatistics] Load employee information'),
    EMPLOYEE_STATISTICS_LOAD_COMPLETE: type('[EmployeeStatistics] Load employee information complete'),

    EMPLOYEE_CONTACTS_LOAD: type('[EMPLOYEE] load employee contacts'),
    EMPLOYEE_CONTACTS_LOAD_COMPLETE: type('[EMPLOYEE] Load employee contacts complete'),
    EMPLOYEE_CONTACTS_UPDATE: type('[EMPLOYEE] Employee contacts update'),
    EMPLOYEE_CONTACTS_UPDATE_COMPLETE: type('[EMPLOYEE] Employee contacts update complete'),
    EMPLOYEE_EMERGENCY_CONTACTS_LOAD: type('[EMPLOYEE] load employee emergency contacts'),
    EMPLOYEE_EMERGENCY_CONTACTS_LOAD_COMPLETE: type('[EMPLOYEE] load employee emergency contacts complete'),
    EMPLOYEE_EMERGENCY_CONTACTS_CREATE: type('[EMPLOYEE] create employee emergency contacts'),
    EMPLOYEE_EMERGENCY_CONTACTS_CREATE_COMPLETE: type('[EMPLOYEE] create employee emergency contacts complete'),
    EMPLOYEE_EMERGENCY_CONTACTS_UPDATE: type('[EMPLOYEE] update employee emergency contacts'),
    EMPLOYEE_EMERGENCY_CONTACTS_UPDATE_COMPLETE: type('[EMPLOYEE] update employee emergency contacts complete'),
    EMPLOYEE_EMERGENCY_CONTACTS_DELETE: type('[EMPLOYEE] delete employee emergency contacts'),
    EMPLOYEE_EMERGENCY_CONTACTS_DELETE_COMPLETE: type('[EMPLOYEE] delete employee emergency contacts complete'),
    EMPLOYEE_EMERGENCY_CONTACTS_GET: type('[EMPLOYEE] get selected employee emergency contact details'),
    EMPLOYEE_EMERGENCY_CONTACTS_GET_COMPLETE: type('[EMPLOYEE] get selected employee emergency contact details complete'),

    //start of career and training Actions
    EMPLOYEE_EDUCATION_HISTORY_LOAD: type('[EMPLOYEE] load employee education history'),
    EMPLOYEE_EDUCATION_HISTORY_LOAD_COMPLETE: type('[EMPLOYEE] load employee education history complete'),
    EMPLOYEE_EDUCATION_HISTORY_CREATE: type('[EMPLOYEE] create employee education history'),
    EMPLOYEE_EDUCATION_HISTORY_CREATE_COMPLETE: type('[EMPLOYEE] create employee education history complete'),
    EMPLOYEE_EDUCATION_HISTORY_UPDATE: type('[EMPLOYEE] update employee education history'),
    EMPLOYEE_EDUCATION_HISTORY_UPDATE_COMPLETE: type('[EMPLOYEE] update employee education history complete'),
    EMPLOYEE_EDUCATION_HISTORY_DELETE: type('[EMPLOYEE] delete employee education history'),
    EMPLOYEE_EDUCATION_HISTORY_DELETE_COMPLETE: type('[EMPLOYEE] delete employee education history complete'),
    EMPLOYEE_EDUCATION_HISTORY_GET: type('[EMPLOYEE] get selected employee education history details'),
    EMPLOYEE_EDUCATION_HISTORY_GET_COMPLETE: type('[EMPLOYEE] get selected employee education history details complete'),

    EMPLOYEE_QUALIFICATION_HISTORY_LOAD: type('[EMPLOYEE] load employee qualification history'),
    EMPLOYEE_QUALIFICATION_HISTORY_LOAD_COMPLETE: type('[EMPLOYEE] load employee qualification history complete'),
    EMPLOYEE_QUALIFICATION_HISTORY_CREATE: type('[EMPLOYEE] create employee qualification history'),
    EMPLOYEE_QUALIFICATION_HISTORY_CREATE_COMPLETE: type('[EMPLOYEE] create employee qualification history complete'),
    EMPLOYEE_QUALIFICATION_HISTORY_UPDATE: type('[EMPLOYEE] update employee qualification history'),
    EMPLOYEE_QUALIFICATION_HISTORY_UPDATE_COMPLETE: type('[EMPLOYEE] update employee qualification history complete'),
    EMPLOYEE_QUALIFICATION_HISTORY_DELETE: type('[EMPLOYEE] delete employee qualification history'),
    EMPLOYEE_QUALIFICATION_HISTORY_DELETE_COMPLETE: type('[EMPLOYEE] delete employee qualification history complete'),
    EMPLOYEE_QUALIFICATION_HISTORY_GET: type('[EMPLOYEE] get selected employee qualification history details'),
    EMPLOYEE_QUALIFICATION_HISTORY_GET_COMPLETE: type('[EMPLOYEE] get selected employee qualification history details complete'),

    EMPLOYEE_TRAINING_HISTORY_LOAD: type('[EMPLOYEE] load employee training history'),
    EMPLOYEE_TRAINING_HISTORY_LOAD_COMPLETE: type('[EMPLOYEE] load employee training history complete'),
    EMPLOYEE_TRAINING_HISTORY_CREATE: type('[EMPLOYEE] create employee training history'),
    EMPLOYEE_TRAINING_HISTORY_CREATE_COMPLETE: type('[EMPLOYEE] create employee training history complete'),
    EMPLOYEE_TRAINING_HISTORY_UPDATE: type('[EMPLOYEE] update employee training history'),
    EMPLOYEE_TRAINING_HISTORY_UPDATE_COMPLETE: type('[EMPLOYEE] update employee training history complete'),
    EMPLOYEE_TRAINING_HISTORY_DELETE: type('[EMPLOYEE] delete employee training history'),
    EMPLOYEE_TRAINING_HISTORY_DELETE_COMPLETE: type('[EMPLOYEE] delete employee training history complete'),
    EMPLOYEE_TRAINING_HISTORY_GET: type('[EMPLOYEE] get selected employee training history details'),
    EMPLOYEE_TRAINING_HISTORY_GET_COMPLETE: type('[EMPLOYEE] get selected employee training history details complete'),

    EMPLOYEE_SALARY_HISTORY_LOAD: type('[EMPLOYEE] load employee salary history'),
    EMPLOYEE_SALARY_HISTORY_LOAD_COMPLETE: type('[EMPLOYEE] load employee salary history complete'),
    LOAD_EMPLOYEE_SALARY_HISTORY_ON_PAGE_CHANGE: type('[EMPLOYEE] load employee salary history on page change'),
    LOAD_EMPLOYEE_SALARY_HISTORY_ON_SORT: type('[EMPLOYEE] load employee salary history on sort'),
    EMPLOYEE_SALARY_ADD: type('[EMPLOYEE] add salary history record'),
    EMMPLOYEE_SALARY_ADD_COMPLETE: type('[EMPLOYEE] add salary history record complete'),
    EMPLOYEE_SALARY_UPDATE: type('[EMPLOYEE] update salary history record'),
    EMPLOYEE_SALARY_UPDATE_COMPLETE: type('[EMPLOYEE] update salary history record complete'),
    EMPLOYEE_SALARY_DELETE: type('[EMPLOYEE] delete salary history record'),
    EMPLOYEE_SALARY_DELETE_COMPLETE: type('[EMPLOYEE] delete salary history record complete'),
    EMPLOYEE_SALARY_GET: type('[EMPLOYEE] get salary history record'),
    EMPLOYEE_SALARY_GET_COMPLETE: type('[EMPLOYEE] get salary history record complete'),

    EMPLOYEE_JOB_HISTORY_LOAD: type('[EMPLOYEE] load employee job history'),
    EMPLOYEE_JOB_HISTORY_LOAD_COMPLETE: type('[EMPLOYEE] load employee job history complete'),
    LOAD_EMPLOYEE_JOB_HISTORY_ON_PAGE_CHANGE: type('[EMPLOYEE] load employee job history on page change'),
    LOAD_EMPLOYEE_JOB_HISTORY_ON_SORT: type('[EMPLOYEE] load employee job history on sort'),
    EMPLOYEE_JOB_HISTORY_ADD: type('[EMPLOYEE] add employee job history record'),
    EMPLOYEE_JOB_HISTORY_ADD_COMPLETE: type('[EMPLOYEE] add employee job history record complete'),
    EMPLOYEE_JOB_HISTORY_UPDATE: type('[EMPLOYEE] update employee job history record'),
    EMPLOYEE_JOB_HISTORY_UPDATE_COMPLETE: type('[EMPLOYEE] update employee job history record complete'),
    EMPLOYEE_JOB_HISTORY_DELETE: type('[EMPLOYEE] delete job history record'),
    EMPLOYEE_JOB_HISTORY_DELETE_COMPLETE: type('[EMPLOYEE] delete job history record complete'),
    EMPLOYEE_JOB_HISTORY_GET: type('[EMPLOYEE] get job history record'),
    EMPLOYEE_JOB_HISTORY_GET_COMPLETE: type('[EMPLOYEE] get job history record complete'),

    EMPLOYEE_PREV_EMPLOYMENT_HISTORY_LOAD: type('[EMPLOYEE] load previous employement history'),
    EMPLOYEE_PREV_EMPLOYMENT_HISTORY_LOAD_COMPLETE: type('[EMPLOYEE] load previous employement complete'),
    EMPLOYEE_PREV_EMPLOYMENT_HISTORY_ADD: type('[EMPLOYEE] add previous employement record'),
    EMPLOYEE_PREV_EMPLOYMENT_HISTORY_ADD_COMPLETE: type('[EMPLOYEE] add previous employement record complete'),
    EMPLOYEE_PREV_EMPLOYMENT_HISTORY_UPDATE: type('[EMPLOYEE] update previous employment record'),
    EMPLOYEE_PREV_EMPLOYMENT_HISTORY_UPDATE_COMPLETE: type('[EMPLOYEE] update previous employment record complete'),
    EMPLOYEE_PREV_EMPLOYMENT_HISTORY_REMOVE: type('[EMPLOYEE] remove previous employment record'),
    EMPLOYEE_PREV_EMPLOYMENT_HISTORY_REMOVE_COMPLETE: type('[EMPLOYEE] remove previous employment record complete'),
    EMPLOYEE_PREV_EMPLOYMENT_HISTORY_LOAD_ON_PAGE_CHANGE: type('[EMPLOYEE] load previous employement history on page change'),
    EMPLOYEE_PREV_EMPLOYMENT_HISTORY_LOAD_ON_SORT: type('[EMPLOYEE] load previous employement history on sorting'),

    EMPLOYEE_VEHICLE_INFO_LOAD: type('[EMPLOYEE] load employee vehicle details'),
    EMPLOYEE_VEHICLE_INFO_LOAD_COMPLTE: type('[EMPLOYEE] load employee vehicle details complete'),
    EMPLOYEE_VEHICLE_INFO_ADD: type('[EMPLOYEE] add vehicle information'),
    EMPLOYEE_VEHICLE_INFO_ADD_COMPLETE: type('[EMPLOYEE] add vehicle information complete'),
    EMPLOYEE_VEHICLE_INFO_UPDATE: type('[EMPLOYEE] update vehicle information'),
    EMPLOYEE_VEHICLE_INFO_UPDATE_COMPLETE: type('[EMPLOYEE] update vehicle information complete'),
    EMPLOYEE_VEHICLE_INFO_GET_BY_ID: type('[EMPLOYEE] load employee vehicle details by id'),
    EMPLOYEE_VEHICLE_INFO_GET_BY_ID_COMPLETE: type('[EMPLOYEE] load employee vehicle details by id complete'),
    EMPLOYEE_VEHICLE_INFO_DELETE: type('[EMPLOYEE] delete vehicle information'),
    EMPLOYEE_VEHICLE_INFO_DELETE_COMPLETE: type('[EMPLOYEE] delete vehicle information complete'),
    EMPLOYEE_VEHICLE_ENGINECC_LOAD: type('[EMPLOYEE] load employee vehicle engine cc types'),
    EMPLOYEE_VEHICLE_ENGINECC_LOAD_COMPLTE: type('[EMPLOYEE] load employee vehicle engine cc types complete'),
    EMPLOYEE_VEHICLE_FUELTYPES_LOAD: type('[EMPLOYEE] load employee vehicle fuel types'),
    EMPLOYEE_VEHICLE_FUELTYPES_LOAD_COMPLTE: type('[EMPLOYEE] load employee vehicle fuel types complete'),
    EMPLOYEE_VEHICLE_INFO_LOAD_ON_PAGE_CHANGE: type('[EMPLOYEE] Load employee vehicle details on page change'),
    EMPLOYEE_VEHICLE_INFO_LOAD_ON_SORT: type('[EMPLOYEE] Load employee vehicle details on sorting'),

    EMPLOYEE_BANK_DETAILS_LOAD: type('[EMPLOYEE] load employee bank details'),
    EMPLOYEE_BANK_DETAILS_BY_ID_LOAD: type('[EMPLOYEE] load selected employee bank details'),
    EMPLOYEE_BANK_DETAILS_BY_ID_LOADCOMPLETE: type('[EMPLOYEE] load selected employee bank details complete'),
    EMPLOYEE_BANK_DETAILS_LOAD_COMPLETE: type('[EMPLOYEE] load employee bank details complete'),
    EMPLOYEE_BANK_DETAILS_ADD: type('[EMPLOYEE] add bank information'),
    EMPLOYEE_BANK_DETAILS_ADD_COMPLETE: type('[EMPLOYEE] add bank information complete'),
    EMPLOYEE_BANK_DETAILS_UPDATE: type('[EMPLOYEE] update bank details'),
    EMPLOYEE_BANK_DETAILS_UPDATE_COMPLETE: type('[EMPLOYEE] update bank details complete'),
    EMPLOYEE_BANK_DETAILS_DELETE: type('[EMPLOYEE] delete bank details'),
    EMPLOYEE_BANK_DETAILS_DELETE_COMPLETE: type('[EMPLOYEE] delete bank details complete'),

    //Employee Timeline tab Actions
    EMPLOYEE_TIMELINE_DATA_LOAD: type('[Employee] Load employee timeline data'),
    EMPLOYEE_TIMELINE_DATA_LOAD_COMPLETE: type('[Employee] Load employee timeline data complete'),
    LOAD_EMPLOYEE_TIMELINE_ON_PAGE_CHANGE: type('[Employee] Load employee timeline on page change'),
    LOAD_EMPLOYEE_TIMELINE_ON_SORT: type('[Employee] Load employee timeline on sorting'),
    LOAD_EMPLOYEE_TIMELINE_ON_FILTERS_CHANGE: type('[Employee] load employee timeline on filters change'),
    EMPLOYEE_TIMELINE_ADD_EVENT: type('[Employee] Add Employee event'),
    EMPLOYEE_TIMELINE_ADD_EVENT_Complete: type('[Employee] Add Employee event Complete'),

    EMPLOYEE_TIMELINE_LOAD_EMPLOYEE_EVENT: type('[Employee] Load Employee event'),
    EMPLOYEE_TIMELINE_LOAD_EMPLOYEE_EVENT_COMPLETE: type('[Employee] Load Employee event Complete'),

    EMPLOYEE_TIMELINE_UPDATE_EVENT: type('[Employee] Update Employee Event'),
    EMPLOYEE_TIMELINE_UPDATE_EVENT_COMPLETE: type('[Employee] Update Employee Event Complete'),
    EMPLOYEE_TIMELINE_UPDATE_DOCUMENT: type('[Employee] Update Employee Document'),

    EMPLOYEE_TIMELINE_REMOVE_EVENT: type('[Employee] Remove Employee Event'),
    EMPLOYEE_TIMELINE_REMOVE_EVENT_COMPLETE: type('[Employee] Remove Employee Event Complete'),

    EMPLOYEE_TIMELINE_REMOVE_DOCUMENT: type('[Employee] Remove Employee Document'),
    EMPLOYEE_TIMELINE_REMOVE_DOCUMENT_COMPLETE: type('[Employee] Remove Employee Document Complete'),


    EMPLOYEE_BENEFITS_SAVE: type('[Employee] employee Benefit scheme load'),
    EMPLOYEE_BENEFITS_SAVE_COMPLETE: type('[Employee] employee Benefit scheme save complete'),
    EMPLOYEE_BENEFITS_LOAD_BY_ID: type('[Employee] employee Benefit load by id'),
    EMPLOYEE_BENEFITS_LOAD_BY_ID_COMPLETE: type('[Employee] employee Benefit load by id complete'),



    //End of employee Timeline Actions
    //start of job State
    EMPLOYEE_JOB_LOAD: type('[EMPLOYEE] Load employee job details'),
    EMPLOYEE_JOB_LOAD_COMPLETE: type('[EMPLOYEE] Load employee job details complete'),
    EMPLOYEE_JOB_UPDATE: type('[EMPLOYEE] Update employee job details'),
    EMPLOYEE_JOB_UPDATE_COMPLETE: type('[EMPLOYEE] Update employee job details complete'),
    LOAD_EMPLOYEE_HOLIDAY_WORKING_PROFILE: type('[EMPLOYEE] Load employee holiday working profile'),
    LOAD_EMPLOYEE_HOLIDAY_WORKING_PROFILE_COMPLETE: type('[EMPLOYEE] Load employee holiday working profile complete'),
    //end of job state
    EMPLOYEE_STATE_CLEAR: type('[Employee] employee state clear'),

    LOAD_EMPLOYEE_STAT: type('[Employee] employee stat load'),
    LOAD_EMPLOYEE_STAT_COMPLETE: type('[Employee] employee stat load complete'),

    // Employee Administration details actions

    EMPLOYEE_ADMINISTRATION_DETAILS: type('[EMPLOYEE] load employee administration details'),
    EMPLOYEE_ADMINISTRATION_DETAILS_LOADCOMPLETE: type('[EMPLOYEE] load employee administration details complete'),
    EMPLOYEE_REMOVE: type('[EMPLOYEE] remove employee group record'),
    EMPLOYEE_REMOVE_COMPLETE: type('[EMPLOYEE] remove employee record complete'),
    USERPROFILE_UPDATE: type('[EMPLOYEE] employee user profile update'),
    USERPROFILE_UPDATE_COMPLETE: type('[EMPLOYEE] employee user profile update complete'),
    UPDATE_USER_STATUS: type('[USER] Update user status (IsActive)'),
    UPDATE_USER_STATUS_COMPLETE: type('[USER] Update user status complete'),
    MANUAL_PASSWORD_RESET: type('[USER] manual password reset'),
    MANUAL_PASSWORD_RESET_COMPLETE: type('[USER] manual password reset complete'),

    LOAD_UNASSOCIATED_USERS: type('[USER] load un-associated users'),
    LOAD_UNASSOCIATED_USERS_COMPLETE: type('[USER]  load un-associated users complete'),
    CHECK_EMPLOYEE_DUPLICATE_EMAIL: type('[Employee] check employee email duplicate'),
    CHECK_EMPLOYEE_DUPLICATE_EMAIL_COMPLETE: type('[USER] check employee email duplicate complete'),
    EMPLOYEE_OPTIONS_UPDATE: type('[EMPLOYEE] user options update'),
    EMPLOYEE_OPTIONS_UPDATE_COMPLETE: type('[EMPLOYEE]  user options update complete'),
    EMPLOYEE_PROFILE_PIC_UPDATE: type('[EMPLOYEE] employee profile picture update'),

    EMPLOYEE_LEAVEREVENT_DETAILS: type('[EMPLOYEE] load employee leaver event details'),
    EMPLOYEE_LEAVEREVENT_DETAILS_COMPLETE: type('[EMPLOYEE] load employee leaver event details complete'),
}

/* Employee Actions - Start */
export class EmployeeLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_LOAD;
    constructor(public payload: any) {

    }
}

export class EmployeeLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_LOAD_COMPLETE;
    constructor(public payload: any) {

    }
}

export class EmployeeTabChangeAction implements Action {
    type = ActionTypes.EMPLOYEE_TAB_CHANGE;
    constructor(public payload: number) {

    }
}
/* Employee Actions - End */

/* Employee Personal Actions - Start */
export class EmployeePersonalLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_PERSONAL_LOAD;
    // payload is employee id
    constructor(public payload: any) {

    }
}

export class EmployeeBenefitSaveAction implements Action {
    type = ActionTypes.EMPLOYEE_BENEFITS_SAVE;
    constructor(public payload: EmployeePayrollDetails) {
    }
}
export class EmployeeBenefitSaveCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_BENEFITS_SAVE_COMPLETE;
    constructor(public payload: any) {

    }
}

export class EmployeePersonalLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_PERSONAL_LOAD_COMPLETE;
    constructor(public payload: Employee) {

    }
}

export class EmployeePersonalUpdateAction implements Action {
    type = ActionTypes.EMPLOYEE_PERSONAL_UPDATE;
    constructor(public payload: EmployeeFullEntity) {

    }
}

export class EmployeePersonalUpdateCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_PERSONAL_UPDATE_COMPLETE;
    constructor(public payload: EmployeeFullEntity) {

    }
}

export class EmployeeDOBChangeAction implements Action {
    type = ActionTypes.EMPLOYEE_DOB_CHANGE;
    constructor(public payload: Date) {

    }
}
/* Employee Personal Actions - End */

/* Employee Statistics Actions - Start */
export class EmployeeStatisticsLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_STATISTICS_LOAD;
    constructor(public payload: any) {

    }
}

export class EmployeeStatisticsLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_STATISTICS_LOAD_COMPLETE;
    constructor(public payload: AeInformationBarItem[]) {

    }
}
/* Employee Statistics Actions - End */

/* Employee Information Actions - Start */
export class EmployeeInformationLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_INFORMATION_LOAD;
    constructor(public payload: boolean) {

    }
}

export class EmployeeInformationLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_INFORMATION_LOAD_COMPLETE;
    constructor(public payload: EmployeeInformation) {
    }
}
/* Employee Information Actions - End */


/* Employee Contacts Actions - Start */
export class EmployeeContactsLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_CONTACTS_LOAD;
    // payload is employee id
    constructor(public payload: string) {

    }
}

export class EmployeeContactsLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_CONTACTS_LOAD_COMPLETE;
    constructor(public payload: EmployeeContacts) {

    }
}

export class EmployeeContactsUpdateAction implements Action {
    type = ActionTypes.EMPLOYEE_CONTACTS_UPDATE;
    constructor(public payload: EmployeeContacts) {

    }
}

export class EmployeeContactsUpdateCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_CONTACTS_UPDATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class EmployeeEmergencyContactsLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_LOAD;
    constructor(public payload: any) {

    }
}

export class EmployeeSalaryHistoryLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_SALARY_HISTORY_LOAD;
    constructor(public payload: boolean) {
    }
}

export class EmployeeSalaryHistoryLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_SALARY_HISTORY_LOAD_COMPLETE;
    constructor(public payload: any) {
    }
}

export class EmployeeJobHistoryLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_JOB_HISTORY_LOAD;
    constructor(public payload: boolean) {
    }
}

export class EmployeeJobHistoryLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_JOB_HISTORY_LOAD_COMPLETE;
    constructor(public payload: any) {
    }
}


export class LoadEmployeeSalaryHistoryOnPageChangeAction implements Action {
    type = ActionTypes.LOAD_EMPLOYEE_SALARY_HISTORY_ON_PAGE_CHANGE;
    constructor(public payload: { pageNumber: number, noOfRows: number }) {

    }
}

export class LoadEmployeeSalaryHistoryOnSortAction implements Action {
    type = ActionTypes.LOAD_EMPLOYEE_SALARY_HISTORY_ON_SORT;
    constructor(public payload: AeSortModel) {

    }
}


export class LoadEmployeeJobHistoryOnPageChangeAction implements Action {
    type = ActionTypes.LOAD_EMPLOYEE_JOB_HISTORY_ON_PAGE_CHANGE;
    constructor(public payload: { pageNumber: number, noOfRows: number }) {

    }
}

export class LoadEmployeeJobHistoryOnSortAction implements Action {
    type = ActionTypes.LOAD_EMPLOYEE_JOB_HISTORY_ON_SORT;
    constructor(public payload: AeSortModel) {

    }
}

export class AddEmployeeJobHistoryAction implements Action {
    type = ActionTypes.EMPLOYEE_JOB_HISTORY_ADD;
    constructor(public payload: JobHistory) {

    }
}

export class AddEmployeeJobHistoryCompletedAction implements Action {
    type = ActionTypes.EMPLOYEE_JOB_HISTORY_ADD_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class UpdateEmployeeJobHistoryAction implements Action {
    type = ActionTypes.EMPLOYEE_JOB_HISTORY_UPDATE;
    constructor(public payload: JobHistory) {

    }
}

export class UpdateEmployeeJobHistoryCompletedAction implements Action {
    type = ActionTypes.EMPLOYEE_JOB_HISTORY_UPDATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class AddEmployeeSalaryHistoryAction implements Action {
    type = ActionTypes.EMPLOYEE_SALARY_ADD;
    constructor(public payload: SalaryHistory) {

    }
}

export class AddEmployeeSalaryHistoryCompletedAction implements Action {
    type = ActionTypes.EMMPLOYEE_SALARY_ADD_COMPLETE;
    constructor(public payload: boolean) {

    }
}


export class UpdateEmployeeSalaryHistoryAction implements Action {
    type = ActionTypes.EMPLOYEE_SALARY_UPDATE;
    constructor(public payload: SalaryHistory) {

    }
}

export class UpdateEmployeeSalaryHistoryCompletedAction implements Action {
    type = ActionTypes.EMPLOYEE_SALARY_UPDATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class DeleteEmployeeSalaryHistoryAction implements Action {
    type = ActionTypes.EMPLOYEE_SALARY_DELETE;
    constructor(public payload: string) {

    }
}

export class DeleteEmployeeSalaryHistoryCompletedAction implements Action {
    type = ActionTypes.EMPLOYEE_SALARY_DELETE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class DeleteEmployeeJobHistoryAction implements Action {
    type = ActionTypes.EMPLOYEE_JOB_HISTORY_DELETE;
    constructor(public payload: string) {

    }
}


export class DeleteEmployeeJobHistoryCompletedAction implements Action {
    type = ActionTypes.EMPLOYEE_JOB_HISTORY_DELETE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class GetEmployeeSalaryHistoryAction implements Action {
    type = ActionTypes.EMPLOYEE_SALARY_GET;
    constructor(public payload: String) {

    }
}

export class GetEmployeeSalaryHistoryCompletedAction implements Action {
    type = ActionTypes.EMPLOYEE_SALARY_GET_COMPLETE;
    constructor(public payload: SalaryHistory) {

    }
}

export class GetEmployeeJobHistoryAction implements Action {
    type = ActionTypes.EMPLOYEE_JOB_HISTORY_GET;
    constructor(public payload: String) {

    }
}


export class GetEmployeeJobHistoryCompletedAction implements Action {
    type = ActionTypes.EMPLOYEE_JOB_HISTORY_GET_COMPLETE;
    constructor(public payload: JobHistory) {

    }
}


export class EmployeeEmergencyContactsLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_LOAD_COMPLETE;
    constructor(public payload: AtlasApiResponse<EmergencyContact>) {

    }
}

export class EmployeeEmergencyContactsCreateAction implements Action {
    type = ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_CREATE;
    constructor(public payload: EmployeeEmergencyContacts) {

    }
}

export class EmployeeEmergencyContactsCreateCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_CREATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class EmployeeEmergencyContactsUpdateAction implements Action {
    type = ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_UPDATE;
    constructor(public payload: EmployeeEmergencyContacts) {

    }
}

export class EmployeeEmergencyContactsUpdateCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_UPDATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class EmployeeEmergencyContactsDeleteAction implements Action {
    type = ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_DELETE;
    constructor(public payload: EmergencyContact) {

    }
}

export class EmployeeEmergencyContactsDeleteCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_DELETE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class EmployeeEmergencyContactsGetAction implements Action {
    type = ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_GET;
    // payload is employee id
    constructor(public payload: any) {

    }
}

export class EmployeeEmergencyContactsGetCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_GET_COMPLETE;
    constructor(public payload: EmployeeEmergencyContacts) {

    }
}
/* Employee Contacts Actions - End */

//Education History - start
export class EmployeeEducationHistoryLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_EDUCATION_HISTORY_LOAD;
    constructor(public payload: AtlasApiRequest) {
    }
}
export class EmployeeEducationHistoryLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_EDUCATION_HISTORY_LOAD_COMPLETE;
    constructor(public payload: AtlasApiResponse<EducationDetails>) {

    }
}
export class EmployeeEducationHistoryCreateAction implements Action {
    type = ActionTypes.EMPLOYEE_EDUCATION_HISTORY_CREATE;
    constructor(public payload: EducationDetails) {

    }
}
export class EmployeeEducationHistoryCreateCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_EDUCATION_HISTORY_CREATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class EmployeeEducationHistoryUpdateAction implements Action {
    type = ActionTypes.EMPLOYEE_EDUCATION_HISTORY_UPDATE;
    constructor(public payload: EducationDetails) {

    }
}
export class EmployeeEducationHistoryUpdateCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_EDUCATION_HISTORY_UPDATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class EmployeeEducationHistoryDeleteAction implements Action {
    type = ActionTypes.EMPLOYEE_EDUCATION_HISTORY_DELETE;
    constructor(public payload: any) {

    }
}
export class EmployeeEducationHistoryDeleteCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_EDUCATION_HISTORY_DELETE_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class EmployeeEducationHistoryGetAction implements Action {
    type = ActionTypes.EMPLOYEE_EDUCATION_HISTORY_GET;
    // payload is employee id
    constructor(public payload: any) {

    }
}
export class EmployeeEducationHistoryGetCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_EDUCATION_HISTORY_GET_COMPLETE;
    constructor(public payload: EducationDetails) {

    }
}
//Education History - end

//Qualification History - start
export class EmployeeQualificationHistoryLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_LOAD;
    constructor(public payload: AtlasApiRequest) {

    }
}
export class EmployeeQualificationHistoryLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_LOAD_COMPLETE;
    constructor(public payload: AtlasApiResponse<TrainingDetails>) {

    }
}
export class EmployeeQualificationHistoryCreateAction implements Action {
    type = ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_CREATE;
    constructor(public payload: TrainingDetails) {

    }
}
export class EmployeeQualificationHistoryCreateCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_CREATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class EmployeeQualificationHistoryUpdateAction implements Action {
    type = ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_UPDATE;
    constructor(public payload: TrainingDetails) {

    }
}
export class EmployeeQualificationHistoryUpdateCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_UPDATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class EmployeeQualificationHistoryDeleteAction implements Action {
    type = ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_DELETE;
    constructor(public payload: any) {

    }
}
export class EmployeeQualificationHistoryDeleteCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_DELETE_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class EmployeeQualificationHistoryGetAction implements Action {
    type = ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_GET;
    // payload is employee id
    constructor(public payload: any) {

    }
}
export class EmployeeQualificationHistoryGetCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_GET_COMPLETE;
    constructor(public payload: TrainingDetails) {

    }
}

//Qualification History - end


/* Employee Vehicle Actions */

export class EmployeeVehicleInfoAddAction implements Action {
    type = ActionTypes.EMPLOYEE_VEHICLE_INFO_ADD;
    constructor(public payload: VehicleDetails) {
    }
}

export class EmployeeVehicleInfoAddCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_VEHICLE_INFO_ADD_COMPLETE;
    constructor(public payload: AtlasApiResponse<VehicleDetails>) {
    }
}

export class EmployeeVehicleInfoLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_VEHICLE_INFO_LOAD;
    constructor(public payload: boolean) {
    }
}

export class EmployeeVehicleInfoLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_VEHICLE_INFO_LOAD_COMPLTE;
    constructor(public payload: any) {
    }
}

export class EmployeeVehicleInfoLoadByIdAction implements Action {
    type = ActionTypes.EMPLOYEE_VEHICLE_INFO_GET_BY_ID;
    constructor(public payload: VehicleDetails) {

    }
}

export class EmployeeVehicleInfoLoadByIdCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_VEHICLE_INFO_GET_BY_ID_COMPLETE;
    constructor(public payload: AtlasApiResponse<VehicleDetails>) {

    }
}

export class EmployeeVehicleInfoUpdateAction implements Action {
    type = ActionTypes.EMPLOYEE_VEHICLE_INFO_UPDATE;
    constructor(public payload: VehicleDetails) {

    }
}

export class EmployeeVehicleInfoUpdateCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_VEHICLE_INFO_UPDATE_COMPLETE;
    constructor(public payload: AtlasApiResponse<VehicleDetails>) {

    }
}


export class EmployeeVehicleInfoDeleteAction implements Action {
    type = ActionTypes.EMPLOYEE_VEHICLE_INFO_DELETE;
    constructor(public payload: VehicleDetails) {

    }
}

export class EmployeeVehicleInfoDeleteCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_VEHICLE_INFO_DELETE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class EmployeeVehicleEngineCCLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_VEHICLE_ENGINECC_LOAD;
    constructor(public payload: boolean) {
    }
}

export class EmployeeVehicleEngineCCLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_VEHICLE_ENGINECC_LOAD_COMPLTE;
    constructor(public payload: Immutable.List<AeSelectItem<string>>) {
    }
}

export class EmployeeVehicleFuelTypesLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_VEHICLE_FUELTYPES_LOAD;
    constructor(public payload: boolean) {
    }
}

export class EmployeeVehicleFuelTypesLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_VEHICLE_FUELTYPES_LOAD_COMPLTE;
    constructor(public payload: Immutable.List<AeSelectItem<string>>) {
    }
}

export class EmployeeVehicleInfoLoadOnPageChangeAction implements Action {
    type = ActionTypes.EMPLOYEE_VEHICLE_INFO_LOAD_ON_PAGE_CHANGE;
    constructor(public payload: { pageNumber: number, noOfRows: number }) {

    }
}

export class EmployeeVehicleInfoLoadOnSortAction implements Action {
    type = ActionTypes.EMPLOYEE_VEHICLE_INFO_LOAD_ON_SORT;
    constructor(public payload: AeSortModel) {

    }
}

/* Employee Vehicle Actions End*/

/** Previous Employment Actions Start */

export class EmployeePreviousEmploymentHistoryLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_LOAD;
    constructor(public payload: boolean) {
    }
}

export class EmployeePreviousEmploymentHistoryLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_LOAD_COMPLETE;
    constructor(public payload: any) {
    }
}

export class EmployeePreviousEmploymentHistoryAddAction implements Action {
    type = ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_ADD;
    constructor(public payload: PreviousEmployment) {
    }
}

export class EmployeePreviousEmploymentHistoryAddCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_ADD_COMPLETE;
    constructor(public payload: AtlasApiResponse<PreviousEmployment>) {
    }
}

export class EmployeePreviousEmploymentHistoryUpdateAction implements Action {
    type = ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_UPDATE;
    constructor(public payload: PreviousEmployment) {

    }
}

export class EmployeePreviousEmploymentHistoryUpdateCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_UPDATE_COMPLETE;
    constructor(public payload: AtlasApiResponse<PreviousEmployment>) {

    }
}

export class EmployeePreviousEmploymentHistoryRemoveAction implements Action {
    type = ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_REMOVE;
    constructor(public payload: PreviousEmployment) {

    }
}

export class EmployeePreviousEmploymentHistoryRemoveCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_REMOVE_COMPLETE;
    constructor(public payload: AtlasApiResponse<PreviousEmployment>) {

    }
}

export class EmployeePreviousEmploymentHistoryLoadOnPageChangeAction implements Action {
    type = ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_LOAD_ON_PAGE_CHANGE;
    constructor(public payload: { pageNumber: number, noOfRows: number }) {

    }
}

export class EmployeePreviousEmploymentHistoryLoadOnSortAction implements Action {
    type = ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_LOAD_ON_SORT;
    constructor(public payload: AeSortModel) {

    }
}

/** Previous Employment Actions End */

//Training History - start
export class EmployeeTrainingHistoryLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_TRAINING_HISTORY_LOAD;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}
export class EmployeeTrainingHistoryLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_TRAINING_HISTORY_LOAD_COMPLETE;
    constructor(public payload: AtlasApiResponse<TrainingUserCourseModule>) {

    }
}
export class EmployeeTrainingHistoryCreateAction implements Action {
    type = ActionTypes.EMPLOYEE_TRAINING_HISTORY_CREATE;
    constructor(public payload: TrainingUserCourseModule) {

    }
}
export class EmployeeTrainingHistoryCreateCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_TRAINING_HISTORY_CREATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class EmployeeTrainingHistoryUpdateAction implements Action {
    type = ActionTypes.EMPLOYEE_TRAINING_HISTORY_UPDATE;
    constructor(public payload: TrainingUserCourseModule) {

    }
}
export class EmployeeTrainingHistoryUpdateCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_TRAINING_HISTORY_UPDATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class EmployeeTrainingHistoryDeleteAction implements Action {
    type = ActionTypes.EMPLOYEE_TRAINING_HISTORY_DELETE;
    constructor(public payload: any) {

    }
}
export class EmployeeTrainingHistoryDeleteCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_TRAINING_HISTORY_DELETE_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class EmployeeTrainingHistoryGetAction implements Action {
    type = ActionTypes.EMPLOYEE_TRAINING_HISTORY_GET;
    // payload is employee id
    constructor(public payload: any) {

    }
}
export class EmployeeTrainingHistoryGetCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_TRAINING_HISTORY_GET_COMPLETE;
    constructor(public payload: TrainingUserCourseModule) {

    }
}

//Training History - end


// Bank details : start

export class EmployeeBankDetailsListLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_BANK_DETAILS_LOAD;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}
export class EmployeeBankDetailsListLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_BANK_DETAILS_LOAD_COMPLETE;
    constructor(public payload: AtlasApiResponse<BankDetails>) {

    }
}

export class EmployeeBankDetailsByIdLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_BANK_DETAILS_BY_ID_LOAD;
    constructor(public payload: any) {

    }
}
export class EmployeeBankDetailsByIdLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_BANK_DETAILS_BY_ID_LOADCOMPLETE;
    constructor(public payload: BankDetails) {

    }
}

export class EmployeeBankDetailsAddAction implements Action {
    type = ActionTypes.EMPLOYEE_BANK_DETAILS_ADD;
    constructor(public payload: BankDetails) {

    }
}
export class EmployeeBankDetailsAddCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_BANK_DETAILS_ADD_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class EmployeeBankDetailsUpdateAction implements Action {
    type = ActionTypes.EMPLOYEE_BANK_DETAILS_UPDATE;
    constructor(public payload: BankDetails) {

    }
}
export class EmployeeBankDetailsUpdateCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_BANK_DETAILS_UPDATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class EmployeeBankDetailsDeleteAction implements Action {
    type = ActionTypes.EMPLOYEE_BANK_DETAILS_DELETE;
    // payload bankdetails id 
    constructor(public payload: BankDetails) {

    }
}
export class EmployeeBankDetailsDeleteCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_BANK_DETAILS_DELETE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

// Bank details : End

// Bank details : end

/* Employee Actions - End */

//Timeline

export class EmployeeLoadTimelineLoadAction {
    type = ActionTypes.EMPLOYEE_TIMELINE_DATA_LOAD;
    constructor(public payload: any) {
    }
}

export class EmployeeLoadTimelineLoadActionComplete {
    type = ActionTypes.EMPLOYEE_TIMELINE_DATA_LOAD_COMPLETE;
    constructor(public payload: any) {
    }
}

export class LoadEmployeeTimelineOnPageChangeAction implements Action {
    type = ActionTypes.LOAD_EMPLOYEE_TIMELINE_ON_PAGE_CHANGE;
    constructor(public payload: { pageNumber: number, noOfRows: number }) {
    }
}

export class LoadEmployeeTimelineOnSortAction implements Action {
    type = ActionTypes.LOAD_EMPLOYEE_TIMELINE_ON_SORT;
    constructor(public payload: AeSortModel) {
    }
}

export class LoadEmployeeTimelineOnFiltersChange implements Action {
    type = ActionTypes.LOAD_EMPLOYEE_TIMELINE_ON_FILTERS_CHANGE;
    constructor(public payload: Map<string, string>) { }
}

export class AddEmployeevent implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_ADD_EVENT;
    constructor(public payload: EmployeeEvent) { }
}

export class AddEmployeeventComplete implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_ADD_EVENT_Complete;
    constructor(public payload: boolean) { }
}


export class LoadEmployeeEvent implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_LOAD_EMPLOYEE_EVENT;
    constructor(public payload: string) { }
}

export class LoadEmployeeEventComplete implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_LOAD_EMPLOYEE_EVENT_COMPLETE;
    constructor(public payload: EmployeeEvent) { }
}


export class EmployeeStateClearAction implements Action {
    type = ActionTypes.EMPLOYEE_STATE_CLEAR;
    constructor(public payload: string) { }
}


export class UpdateEmployeeEvent implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_UPDATE_EVENT;
    constructor(public payload: EmployeeEvent) {

    }
}

export class UpdateEmployeeEventComplete implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_UPDATE_EVENT_COMPLETE;
    constructor(public payload: boolean) {

    }
}


export class RemoveEmployeeEvent implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_REMOVE_EVENT;
    constructor(public payload: Timeline) {

    }
}

export class RemoveEmployeeEventComplete implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_REMOVE_EVENT_COMPLETE;
    constructor(public payload: boolean) {

    }
}



export class RemoveEmployeeDocument implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_REMOVE_DOCUMENT;
    constructor(public payload: Timeline) {

    }
}

export class RemoveEmployeeDocumentComplete implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_REMOVE_DOCUMENT_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class EmployeeTimeLineUpdateDocument implements Action {
    type = ActionTypes.EMPLOYEE_TIMELINE_UPDATE_DOCUMENT;
    constructor(public payload: Document) {
    }
}

//End of Timeline

/* Employee Job Actions - Start */
export class EmployeeJobLoadAction implements Action {
    type = ActionTypes.EMPLOYEE_JOB_LOAD;
    constructor(public payload: string) {

    }
}
export class EmployeeJobLoadCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_JOB_LOAD_COMPLETE;
    constructor(public payload: EmployeeJobDetails) {

    }
}
export class EmployeeJobUpdateAction implements Action {
    type = ActionTypes.EMPLOYEE_JOB_UPDATE;
    constructor(public payload: { jobDetails: EmployeeJobDetails, empId: string }) {

    }
}
export class EmployeeJobUpdateCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_JOB_UPDATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class LoadEmployeeHolidayWorkingProfileAction {
    type = ActionTypes.LOAD_EMPLOYEE_HOLIDAY_WORKING_PROFILE;
    constructor(public payload: string) {
    }
}

export class LoadEmployeeHolidayWorkingProfileCompleteAction {
    type = ActionTypes.LOAD_EMPLOYEE_HOLIDAY_WORKING_PROFILE_COMPLETE;
    constructor(public payload: EmployeeHolidayWorkingProfile) {
    }
}


export class LoadEmployeeStatAction {
    type = ActionTypes.LOAD_EMPLOYEE_STAT;
    constructor(public payload: { EmployeeId: string, statType: EmployeeStatType }) {
    }
}

export class LoadEmployeeStatCompleteAction {
    type = ActionTypes.LOAD_EMPLOYEE_STAT_COMPLETE;
    constructor(public payload: { response: any, statType: EmployeeStatType }) {
    }
}


export class LoadEmployeeAdministrationDetailsAction {
    type = ActionTypes.EMPLOYEE_ADMINISTRATION_DETAILS;
    constructor() {
    }
}

export class LoadEmployeeAdministrationDetailsCompleteAction {
    type = ActionTypes.EMPLOYEE_ADMINISTRATION_DETAILS_LOADCOMPLETE;
    constructor(public payload: UserAdminDetails) {
    }
}
export class UpdateEmployeeUserProfileAction {
    type = ActionTypes.USERPROFILE_UPDATE;
    constructor(public payload: { UserProfileIds: any }) {
    }
}

export class UpdateEmployeeUserProfileCompleteAction {
    type = ActionTypes.USERPROFILE_UPDATE_COMPLETE;
    constructor(public payload: any) {
    }
}


export class ManualResetPasswordAction implements Action {
    type = ActionTypes.MANUAL_PASSWORD_RESET;
    constructor(public payload: ResetPasswordVM) {

    }
}
export class ManualResetPasswordCompleteAction implements Action {
    type = ActionTypes.MANUAL_PASSWORD_RESET_COMPLETE;
    constructor(public payload: boolean) {

    }
}

/**
* This  action is used to udpate the atlas user status  - shared.users (IsActive = true/false)
*/
export class UpdateUserStatusAction implements Action {
    type = ActionTypes.UPDATE_USER_STATUS;
    constructor(public payload: { userId: string, status: any }) {

    }
}

export class UpdateUserStatusCompleteAction implements Action {
    type = ActionTypes.UPDATE_USER_STATUS_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class LoadUnAssociatedUsersAction {
    type = ActionTypes.LOAD_UNASSOCIATED_USERS;
    constructor() {
    }
}

export class LoadUnAssociatedUsersCompleteAction {
    type = ActionTypes.LOAD_UNASSOCIATED_USERS_COMPLETE;
    constructor(public payload: User[]) {
    }
}

export class CheckEmployeeDuplidateEmailAction {
    type = ActionTypes.CHECK_EMPLOYEE_DUPLICATE_EMAIL;
    constructor(public payload: { Email: string }) {
    }
}

export class CheckEmployeeDuplidateEmailCompleteAction {
    type = ActionTypes.CHECK_EMPLOYEE_DUPLICATE_EMAIL_COMPLETE;
    constructor(public payload: boolean) {
    }
}

export class EmployeeOptionsUpdateAction implements Action {
    type = ActionTypes.EMPLOYEE_OPTIONS_UPDATE;
    constructor(public payload: { adminOptions: AdminOptions, empId: string }) {

    }
}
export class EmployeOptionsUpdateCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_OPTIONS_UPDATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class EmployeeRemoveAction implements Action {
    type = ActionTypes.EMPLOYEE_REMOVE;
    constructor(public payload: EmployeeInformation) {

    }
}

export class EmployeeRemoveCompletedAction implements Action {
    type = ActionTypes.EMPLOYEE_REMOVE_COMPLETE;
    constructor() {

    }
}

export class EmployeeLoadBenefitsByIdAction implements Action {
    type = ActionTypes.EMPLOYEE_BENEFITS_LOAD_BY_ID;
    constructor(public payload: string) {

    }
}

export class EmployeeLoadBenefitsByIdCompleteAction implements Action {
    type = ActionTypes.EMPLOYEE_BENEFITS_LOAD_BY_ID_COMPLETE;
    constructor(public payload: EmployeePayrollDetails) {

    }
}

export class EmployeeProfilePictureUpdate implements Action {
    type = ActionTypes.EMPLOYEE_PROFILE_PIC_UPDATE;
    constructor(public payload: string) {

    }
}

export class LoadEmployeeLeaverEventDetails implements Action {
    type = ActionTypes.EMPLOYEE_LEAVEREVENT_DETAILS;
    constructor(public payload: any) {

    }
}

export class LoadEmployeeLeaverEventDetailsComplete implements Action {
    type = ActionTypes.EMPLOYEE_LEAVEREVENT_DETAILS_COMPLETE;
    constructor(public payload: any) {

    }
}

export type Actions = EmployeeLoadAction
    | EmployeeLoadCompleteAction
    | EmployeeTabChangeAction
    | EmployeeStatisticsLoadAction
    | EmployeeStatisticsLoadCompleteAction
    | EmployeePersonalLoadAction
    | EmployeePersonalLoadCompleteAction
    | EmployeePersonalUpdateAction
    | EmployeePersonalUpdateCompleteAction
    | EmployeeDOBChangeAction
    | EmployeeInformationLoadAction
    | EmployeeInformationLoadCompleteAction
    | EmployeeContactsLoadAction
    | EmployeeContactsLoadCompleteAction
    | EmployeeContactsUpdateAction
    | EmployeeContactsUpdateCompleteAction
    | EmployeeEmergencyContactsLoadAction
    | EmployeeEmergencyContactsLoadCompleteAction
    | EmployeeEmergencyContactsCreateAction
    | EmployeeEmergencyContactsCreateCompleteAction
    | EmployeeEmergencyContactsUpdateAction
    | EmployeeEmergencyContactsUpdateCompleteAction
    | EmployeeEmergencyContactsDeleteAction
    | EmployeeEmergencyContactsDeleteCompleteAction
    | EmployeeEmergencyContactsGetAction
    | EmployeeEmergencyContactsGetCompleteAction
    | EmployeeEducationHistoryLoadAction
    | EmployeeEducationHistoryLoadCompleteAction
    | EmployeeEducationHistoryCreateAction
    | EmployeeEducationHistoryCreateCompleteAction
    | EmployeeEducationHistoryUpdateAction
    | EmployeeEducationHistoryUpdateCompleteAction
    | EmployeeEducationHistoryDeleteAction
    | EmployeeEducationHistoryDeleteCompleteAction
    | EmployeeEducationHistoryGetAction
    | EmployeeEducationHistoryGetCompleteAction
    | EmployeeQualificationHistoryLoadAction
    | EmployeeQualificationHistoryLoadCompleteAction
    | EmployeeQualificationHistoryCreateAction
    | EmployeeQualificationHistoryCreateCompleteAction
    | EmployeeQualificationHistoryUpdateAction
    | EmployeeQualificationHistoryUpdateCompleteAction
    | EmployeeQualificationHistoryDeleteAction
    | EmployeeQualificationHistoryDeleteCompleteAction
    | EmployeeQualificationHistoryGetAction
    | EmployeeQualificationHistoryGetCompleteAction
    | EmployeeVehicleInfoAddAction
    | EmployeeVehicleInfoAddCompleteAction
    | EmployeeVehicleInfoLoadAction
    | EmployeeVehicleInfoLoadCompleteAction
    | EmployeeVehicleInfoUpdateAction
    | EmployeeVehicleInfoUpdateCompleteAction
    | EmployeeVehicleInfoDeleteAction
    | EmployeeVehicleInfoDeleteCompleteAction
    | EmployeeVehicleEngineCCLoadAction
    | EmployeeVehicleEngineCCLoadCompleteAction
    | EmployeeVehicleFuelTypesLoadAction
    | EmployeeVehicleFuelTypesLoadCompleteAction
    | EmployeePreviousEmploymentHistoryLoadAction
    | EmployeePreviousEmploymentHistoryLoadCompleteAction
    | EmployeePreviousEmploymentHistoryAddAction
    | EmployeePreviousEmploymentHistoryAddCompleteAction
    | EmployeePreviousEmploymentHistoryUpdateAction
    | EmployeePreviousEmploymentHistoryUpdateCompleteAction
    | EmployeePreviousEmploymentHistoryRemoveAction
    | EmployeePreviousEmploymentHistoryRemoveCompleteAction
    | EmployeePreviousEmploymentHistoryLoadOnPageChangeAction
    | EmployeePreviousEmploymentHistoryLoadOnSortAction
    | EmployeeVehicleInfoLoadOnPageChangeAction
    | EmployeeVehicleInfoLoadOnSortAction
    | EmployeeSalaryHistoryLoadAction
    | EmployeeSalaryHistoryLoadCompleteAction
    | LoadEmployeeSalaryHistoryOnPageChangeAction
    | LoadEmployeeSalaryHistoryOnSortAction
    | AddEmployeeSalaryHistoryAction
    | AddEmployeeSalaryHistoryCompletedAction
    | UpdateEmployeeSalaryHistoryAction
    | UpdateEmployeeSalaryHistoryCompletedAction
    | DeleteEmployeeSalaryHistoryAction
    | DeleteEmployeeSalaryHistoryCompletedAction
    | EmployeeJobHistoryLoadAction
    | EmployeeJobHistoryLoadCompleteAction
    | LoadEmployeeJobHistoryOnPageChangeAction
    | LoadEmployeeJobHistoryOnSortAction
    | AddEmployeeJobHistoryAction
    | AddEmployeeJobHistoryCompletedAction
    | UpdateEmployeeJobHistoryAction
    | UpdateEmployeeJobHistoryCompletedAction
    | GetEmployeeJobHistoryAction
    | GetEmployeeJobHistoryCompletedAction
    | DeleteEmployeeJobHistoryAction
    | DeleteEmployeeJobHistoryCompletedAction
    | EmployeeTrainingHistoryLoadAction
    | EmployeeTrainingHistoryLoadCompleteAction
    | EmployeeTrainingHistoryCreateAction
    | EmployeeTrainingHistoryCreateCompleteAction
    | EmployeeTrainingHistoryUpdateAction
    | EmployeeTrainingHistoryUpdateCompleteAction
    | EmployeeTrainingHistoryDeleteAction
    | EmployeeTrainingHistoryDeleteCompleteAction
    | EmployeeTrainingHistoryGetAction
    | EmployeeTrainingHistoryGetCompleteAction
    | EmployeeBankDetailsListLoadAction
    | EmployeeBankDetailsListLoadCompleteAction
    | EmployeeBankDetailsAddAction
    | EmployeeBankDetailsAddCompleteAction
    | EmployeeBankDetailsUpdateAction
    | EmployeeBankDetailsUpdateCompleteAction
    | EmployeeBankDetailsDeleteAction
    | EmployeeBankDetailsDeleteCompleteAction
    | EmployeeBankDetailsByIdLoadAction
    | EmployeeBankDetailsByIdLoadCompleteAction

    | EmployeeLoadTimelineLoadAction
    | EmployeeLoadTimelineLoadActionComplete
    | LoadEmployeeTimelineOnPageChangeAction
    | LoadEmployeeTimelineOnSortAction
    | LoadEmployeeTimelineOnFiltersChange
    | AddEmployeevent
    | AddEmployeeventComplete
    | EmployeeTrainingHistoryGetCompleteAction
    | LoadEmployeeEvent
    | LoadEmployeeEventComplete

    | EmployeeStateClearAction

    | EmployeeJobLoadAction
    | EmployeeJobLoadCompleteAction
    | EmployeeJobUpdateAction
    | EmployeeJobUpdateCompleteAction
    | LoadEmployeeHolidayWorkingProfileAction
    | LoadEmployeeHolidayWorkingProfileCompleteAction

    | UpdateEmployeeEvent
    | UpdateEmployeeEventComplete
    | EmployeeTimeLineUpdateDocument
    | LoadEmployeeStatAction
    | LoadEmployeeStatCompleteAction

    | LoadEmployeeAdministrationDetailsAction
    | LoadEmployeeAdministrationDetailsCompleteAction

    | UpdateEmployeeUserProfileAction
    | UpdateEmployeeUserProfileCompleteAction

    | UpdateUserStatusAction
    | UpdateUserStatusCompleteAction
    | ManualResetPasswordAction
    | ManualResetPasswordCompleteAction
    | LoadUnAssociatedUsersAction
    | LoadUnAssociatedUsersCompleteAction
    | CheckEmployeeDuplidateEmailAction
    | CheckEmployeeDuplidateEmailCompleteAction
    | EmployeeOptionsUpdateAction
    | EmployeOptionsUpdateCompleteAction
    | EmployeeRemoveAction
    | EmployeeRemoveCompletedAction
    | EmployeeLoadBenefitsByIdAction
    | EmployeeLoadBenefitsByIdCompleteAction
    | EmployeeProfilePictureUpdate
    | LoadEmployeeLeaverEventDetails
    | LoadEmployeeLeaverEventDetailsComplete;


