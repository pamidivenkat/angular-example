import { EmployeePayrollDetails } from './../models/employee.model';
import { EmployeeBenefits } from '../benefits/models/employee-benefits.model';
import { User } from './../../shared/models/user';
import { EmployeeHolidayWorkingProfile } from './../../holiday-absence/models/holiday-absence.model';
import { EmployeeJobDetails } from './../job/models/job-details.model';
import { AtlasApiRequestWithParams } from './../../shared/models/atlas-api-response';
import { EmployeeEvent } from '../employee-timeline/models/emloyee-event';
import { Timeline, EventType } from '../models/timeline';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from '../../atlas-elements/common/models/ae-datatable-options';
import { getEmployeeQualificationHistoryListLoadingState } from '../../shared/reducers';
import { extractDataTableOptions } from '../../shared/helpers/extract-helpers';
import { TrainingDetails } from '../models/qualification-history.model';
import { AeSortModel } from '../../atlas-elements/common/models/ae-sort-model';
import { EducationDetails } from '../models/education-history.model';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { BankDetails } from '../models/bank-details';
import { SalaryHistory } from '../models/salary-history';
import { JobHistory } from '../models/job-history';
import { PreviousEmployment } from '../models/previous-employment';
import { VehicleDetails } from '../models/vehicle-details';
import { EmergencyContact } from '../models/emergency-contact.model';
import { AtlasApiRequest, AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { isNullOrUndefined } from 'util';
import { EmployeeStatistics } from '../models/employee-statistics';
import { EmployeeInformation } from '../models/employee-information';
import { calculateAge, mergeEmployeePersonal, extractFullAddress } from '../common/extract-helpers';
import { EmployeeFullEntity } from '../models/employee-full.model';
import {
    Employee,
    EmployeeContacts,
    EmployeeEmergencyContacts
} from '../models/employee.model';
import { Observable } from 'rxjs/Rx';
import { Action, ActionReducer, combineReducers } from '@ngrx/store';
import * as employeeActions from '../actions/employee.actions';
import { compose } from "@ngrx/core";
import * as Immutable from 'immutable';
import { TrainingUserCourseModule } from '../models/training-history.model';
import { LastUpdated, EmployeeStatType } from '../models/employee-stat';
import { UserAdminDetails } from './../../employee/administration/models/user-admin-details.model';


export interface EmployeeState {
    // employee state - start
    EmployeeId: string,
    EmployeePending: boolean,
    UpdateCompleted: boolean,
    SelectedTab: number,

    // employee personal state - start
    PersonalPending: boolean,
    EmployeePersonalVM: Employee,
    Age: string,
    // employee personal state - end

    // employee information state - start
    InformationPending: boolean,
    InformationVM: EmployeeInformation,
    // employee information state - end

    // employee statistics state - start
    StatisticsPending: boolean,
    StatisticsVM: AeInformationBarItem[]
    // employee statistics state - end
    //
    EmployeeBenefitSaved: EmployeeBenefits,
    EmployeeBenefitSchemeLoaded: boolean,
    hasEmployeePayrollLoaded: boolean;
    employeePayrollDetails: EmployeePayrollDetails,
    //

    // employee contacts state - start
    Status: boolean,
    Data: EmployeeContacts,
    ContactUpdateStatus: boolean,
    EmergencyContacts: AtlasApiResponse<EmergencyContact>,
    IsEmergencyConctactsLoaded: boolean,
    EmergencyConctactsApiRequest: AtlasApiRequest,
    EmergencyContactsTotalCount: number;
    EmergencyContactData: EmployeeEmergencyContacts,
    EmergencyContactUpdateStatus: boolean,
    EmergencyContactDeleteStatus: boolean,
    EmergencyContactGetStatus: boolean,
    // employee contacts state - end

    //career and training state start
    //TODO: here any should be replaced with appropriate domain model
    SelectedCareerAndTrainingTabIndex: number,
    HasEducationHistoryLoaded: boolean,
    EducationHistoryApiRequest: AtlasApiRequest,
    EducationHistoryList: AtlasApiResponse<EducationDetails>,
    EducationHistoryListTotalCount: number,
    CurrentEducationHistory: EducationDetails, // here add/edited object should be stored in the state which will be posted
    IsEducationHistoryAddUpdateInProgress: boolean,
    EducationHistoryGetStatus: boolean,

    HasQualificationHistoryLoaded: boolean,
    QualificationHistoryApiRequest: AtlasApiRequest
    QualificationHistoryList: AtlasApiResponse<TrainingDetails>,
    QualificationHistoryListTotalCount: number;
    CurrentQualificationHistory: TrainingDetails,
    IsQualificationHistoryAddUpdateInProgress: boolean,
    QualificationHistoryGetStatus: boolean,

    HasTrainingHistoryLoaded: boolean,
    TrainingHistoryList: AtlasApiResponse<TrainingUserCourseModule>,
    TrainingHistoryApiRequest: AtlasApiRequestWithParams,
    TrainigHistoryListTotalCount: number;
    CurrentTrainingHistory: TrainingUserCourseModule,
    IsTrainingHistoryAddUpdateInProgress: boolean,
    TrainingHistoryGetStatus: boolean,

    HasSalaryHistoryLoaded: boolean,
    SalaryHistoryList: SalaryHistory[],
    SalaryHistoryPagingInfo: PagingInfo;
    SalaryAddUpdateFormData: SalaryHistory,
    fetchSalaryHistoryDataLoading: boolean,
    CurrentSalaryHistory: SalaryHistory,
    IsSalaryHistoryAddUpdateInProgress: boolean,
    IsSalaryHistoryDeleteInProgress: boolean,
    SelectedSalaryHistoryId: String,
    SalaryHistorySortInfo: AeSortModel;

    HasJobHistoryLoaded: boolean,
    JobHistoryList: JobHistory[],
    CurrentJobHistory: JobHistory,
    JobAddUpdateFormData: JobHistory,
    fetchJobHistoryDataLoading: boolean,
    IsJobHistoryAddUpdateInProgress: boolean,
    IsJobHistoryDeleteInProgress: boolean,
    SelectedJobHistoryId: String,
    JobHistoryPagingInfo: PagingInfo,
    JobHistorySortInfo: AeSortModel,

    HasPreviousEmploymentLoaded: boolean,
    PreviousEmploymentHistoryList: PreviousEmployment[],
    PreviousEmploymentPagingInfo: PagingInfo;
    PreviousEmploymentSortInfo: AeSortModel;
    CurrentPreviousEmployment: PreviousEmployment,
    IsPreviousEmploymentAddUpdateInProgress: boolean,
    IsPreviousEmploymentRemoveInProgress: boolean,

    //career and training state end

    HasVehiclesInformationLoaded: boolean,
    VehiclesList: VehicleDetails[],
    CurrentVehicle: VehicleDetails,
    IsVehiclesInformationAddUpdateInProgress: boolean,
    DeletedVehicle: VehicleDetails,
    IsVehicleInformationDeleted: boolean,
    EngineCCTypes: Immutable.List<AeSelectItem<string>>,
    IsEngineCCTypesLoaded: boolean,
    FuelTypes: Immutable.List<AeSelectItem<string>>,
    IsFuelTypesLoaded: boolean,
    VerhiclePagingInfo: PagingInfo;
    VehicleSortInfo: AeSortModel;

    HasBankDetailsListLoaded: boolean,
    BankDetailsList: BankDetails[],
    BankDetailsPagingInfo: PagingInfo,
    BankDetailsListTotalCount: number;
    BankApiRequest: AtlasApiRequestWithParams,
    CurrentBankDetails: BankDetails,
    IsBankDetailsAddUpdateInProgress: boolean,
    BankDetailsGetStatus: boolean,
    IsBankDetailsLAddUpdateInProgress: boolean,


    HasTimelineDataLoaded: boolean,
    TimelineData: Timeline[],
    TimeLinePagingInfo: PagingInfo,
    TimeLineSortInfo: AeSortModel,
    TimelineFilters: Map<string, string>,
    SelectedEmployeeEvent: EmployeeEvent,

    HasJobDetailsLoaded: boolean,
    HasEmployeeHolidayWorkingProfileDataLoaded: boolean,
    JobDetails: EmployeeJobDetails,
    HolidayWorkingProfile: EmployeeHolidayWorkingProfile,
    IsJobDetailsUpdateInProgress: boolean,
    LastUpdated: LastUpdated,


    //Administration details

    HasAdminDetailsLoaded: boolean,
    EmployeeAdminDetails: UserAdminDetails,
    SelectedUserProfiles: Immutable.List<AeSelectItem<string>>,
    HasUserStatusUpdated: boolean,
    HasUserPasswordReset: boolean,
    IsEmployeeRemoveInProgress: boolean,
    // Email/no email users mapping

    HasUnAssociatedLoaded: boolean,
    UnAssociatedUsersList: User[],
    IsDuplicateEmail: boolean,
    IsOptionsUpdateInProgress: boolean,
    hasLeaverEventDetailLoaded: boolean,
    employeeLeaverDetails: any,

}

const initialState: EmployeeState = {
    EmployeeId: null,
    EmployeePending: false,
    UpdateCompleted: null,
    SelectedTab: 1,

    PersonalPending: false,
    EmployeePersonalVM: null,
    Age: null,

    InformationPending: false,
    InformationVM: null,

    StatisticsPending: false,
    StatisticsVM: null,

    Status: false,
    Data: null,
    ContactUpdateStatus: false,
    EmergencyContacts: null,
    IsEmergencyConctactsLoaded: false,
    EmergencyConctactsApiRequest: null,
    EmergencyContactsTotalCount: null,
    EmergencyContactData: null,
    EmergencyContactUpdateStatus: false,
    EmergencyContactDeleteStatus: false,
    EmergencyContactGetStatus: false,

    //start of careen and training state
    SelectedCareerAndTrainingTabIndex: 0,
    HasEducationHistoryLoaded: false,
    EducationHistoryApiRequest: null,
    EducationHistoryList: null,
    EducationHistoryListTotalCount: null,
    CurrentEducationHistory: null, // here add/edited object should be stored in the state which will be posted
    IsEducationHistoryAddUpdateInProgress: false,
    EducationHistoryGetStatus: false,

    HasQualificationHistoryLoaded: false,
    QualificationHistoryApiRequest: null,
    QualificationHistoryList: null,
    QualificationHistoryListTotalCount: null,
    CurrentQualificationHistory: null,
    IsQualificationHistoryAddUpdateInProgress: false,
    QualificationHistoryGetStatus: false,

    HasTrainingHistoryLoaded: false,
    TrainingHistoryList: null,
    TrainingHistoryApiRequest: null,
    TrainigHistoryListTotalCount: null,
    CurrentTrainingHistory: null,
    IsTrainingHistoryAddUpdateInProgress: false,
    TrainingHistoryGetStatus: false,

    HasSalaryHistoryLoaded: false,
    SalaryHistoryList: null,
    SalaryAddUpdateFormData: null,
    fetchSalaryHistoryDataLoading: false,
    CurrentSalaryHistory: null,
    IsSalaryHistoryAddUpdateInProgress: false,
    IsSalaryHistoryDeleteInProgress: false,
    SelectedSalaryHistoryId: "",
    SalaryHistoryPagingInfo: null,
    SalaryHistorySortInfo: null,

    HasJobHistoryLoaded: false,
    JobHistoryList: null,
    JobAddUpdateFormData: null,
    fetchJobHistoryDataLoading: false,
    CurrentJobHistory: null,
    IsJobHistoryAddUpdateInProgress: false,
    IsJobHistoryDeleteInProgress: false,
    SelectedJobHistoryId: "",
    JobHistoryPagingInfo: null,
    JobHistorySortInfo: null,


    HasPreviousEmploymentLoaded: false,
    PreviousEmploymentHistoryList: null,
    PreviousEmploymentPagingInfo: null,
    CurrentPreviousEmployment: null,
    IsPreviousEmploymentAddUpdateInProgress: false,
    IsPreviousEmploymentRemoveInProgress: false,
    PreviousEmploymentSortInfo: null,

    HasVehiclesInformationLoaded: false,
    VehiclesList: null,
    CurrentVehicle: null,
    IsVehiclesInformationAddUpdateInProgress: false,
    DeletedVehicle: null,
    IsVehicleInformationDeleted: false,
    EngineCCTypes: null,
    IsEngineCCTypesLoaded: false,
    FuelTypes: null,
    IsFuelTypesLoaded: false,
    VerhiclePagingInfo: null,
    VehicleSortInfo: null,


    HasBankDetailsListLoaded: false,
    BankDetailsList: null,
    BankDetailsPagingInfo: null,
    BankDetailsListTotalCount: null,
    BankApiRequest: null,
    CurrentBankDetails: null,
    IsBankDetailsAddUpdateInProgress: false,
    BankDetailsGetStatus: false,
    IsBankDetailsLAddUpdateInProgress: false,

    HasTimelineDataLoaded: false,
    TimelineData: null,
    TimeLinePagingInfo: null,
    TimeLineSortInfo: null,
    TimelineFilters: null,
    SelectedEmployeeEvent: null,

    HasJobDetailsLoaded: false,
    HasEmployeeHolidayWorkingProfileDataLoaded: false,
    JobDetails: null,
    HolidayWorkingProfile: null,
    IsJobDetailsUpdateInProgress: false,
    LastUpdated: null,
    EmployeeBenefitSaved: null,
    EmployeeBenefitSchemeLoaded: false,
    hasEmployeePayrollLoaded: false,
    employeePayrollDetails: null,

    //Administration details
    HasAdminDetailsLoaded: false,
    EmployeeAdminDetails: null,
    SelectedUserProfiles: null,
    HasUserStatusUpdated: false,
    HasUserPasswordReset: false,
    IsEmployeeRemoveInProgress: false,

    // Email / NoEmail users

    HasUnAssociatedLoaded: false,
    UnAssociatedUsersList: null,
    IsDuplicateEmail: false,
    IsOptionsUpdateInProgress: false,
    hasLeaverEventDetailLoaded: false,
    employeeLeaverDetails: null,

}

export function employeeReducer(state = initialState, action: Action): EmployeeState {
    switch (action.type) {
        /* employee actions - start */
        case employeeActions.ActionTypes.EMPLOYEE_LOAD:
            {
                return Object.assign({}, state, { Pending: true }); // setting the employee id to the state in employee resolver , clear method EmployeeId: action.payload.EmployeeId
            }
        case employeeActions.ActionTypes.EMPLOYEE_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { Pending: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_TAB_CHANGE:
            {
                return Object.assign({}, state, { SelectedTab: action.payload });
            }
        /* employee actions - end */

        /* employee personal actions - start */
        case employeeActions.ActionTypes.EMPLOYEE_PERSONAL_LOAD:
            {
                return Object.assign({}, state, { PersonalPending: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_PERSONAL_LOAD_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, { PersonalPending: false, EmployeePersonalVM: <Employee>action.payload });
                return modifiedState;
            }
        case employeeActions.ActionTypes.EMPLOYEE_SALARY_HISTORY_LOAD:
            {
                let modifiedState = Object.assign({}, state, { HasSalaryHistoryLoaded: false });
                return modifiedState;
            }
        case employeeActions.ActionTypes.EMPLOYEE_BENEFITS_SAVE:
            {
                return Object.assign({}, state, { EmployeeBenefitSaved: null, employeePayrollDetails: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_BENEFITS_SAVE_COMPLETE:
            {
                return Object.assign({}, state, { EmployeeBenefitSaved: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_SALARY_HISTORY_LOAD_COMPLETE:
            {
                if (!isNullOrUndefined(state.SalaryHistoryPagingInfo)) {
                    if (action.payload.SalaryHistoryPagingInfo.PageNumber == 1) {
                        state.SalaryHistoryPagingInfo.TotalCount = action.payload.SalaryHistoryPagingInfo.TotalCount;
                    }
                    state.SalaryHistoryPagingInfo.PageNumber = action.payload.SalaryHistoryPagingInfo.PageNumber;
                    state.SalaryHistoryPagingInfo.Count = action.payload.SalaryHistoryPagingInfo.Count;
                }
                else {
                    state.SalaryHistoryPagingInfo = action.payload.SalaryHistoryPagingInfo;
                }

                let modifiedState = Object.assign({}, state, { HasSalaryHistoryLoaded: true, SalaryHistoryList: action.payload.SalaryHistoryList });
                if (isNullOrUndefined(modifiedState.SalaryHistorySortInfo)) {
                    modifiedState.SalaryHistorySortInfo = <AeSortModel>{};
                    modifiedState.SalaryHistorySortInfo.SortField = 'StartDate';
                    modifiedState.SalaryHistorySortInfo.Direction = 1;
                }
                return modifiedState;
            }

        case employeeActions.ActionTypes.EMPLOYEE_JOB_HISTORY_LOAD:
            {
                return Object.assign({}, state, { HasJobHistoryLoaded: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_JOB_HISTORY_LOAD_COMPLETE:
            {
                if (!isNullOrUndefined(state.JobHistoryPagingInfo)) {
                    if (action.payload.JobHistoryPagingInfo.PageNumber == 1) {
                        state.JobHistoryPagingInfo.TotalCount = action.payload.JobHistoryPagingInfo.TotalCount;
                    }
                    state.JobHistoryPagingInfo.PageNumber = action.payload.JobHistoryPagingInfo.PageNumber;
                    state.JobHistoryPagingInfo.Count = action.payload.JobHistoryPagingInfo.Count;
                }
                else {
                    state.JobHistoryPagingInfo = action.payload.JobHistoryPagingInfo;
                }
                if (isNullOrUndefined(state.JobHistorySortInfo)) {
                    state.JobHistorySortInfo = <AeSortModel>{};
                    state.JobHistorySortInfo.SortField = 'JobStartDate';
                    state.JobHistorySortInfo.Direction = 1;
                }
                return Object.assign({}, state, { HasJobHistoryLoaded: true, JobHistoryList: action.payload.JobHistoryList });
            }

        case employeeActions.ActionTypes.EMPLOYEE_SALARY_ADD:
            {
                return Object.assign({}, state, { IsSalaryHistoryAddUpdateInProgress: true, SalaryAddUpdateFormData: action.payload });
            }

        case employeeActions.ActionTypes.EMMPLOYEE_SALARY_ADD_COMPLETE:
            {
                return Object.assign({}, state, { IsSalaryHistoryAddUpdateInProgress: false });
            }

        case employeeActions.ActionTypes.EMPLOYEE_JOB_HISTORY_ADD:
            {
                return Object.assign({}, state, { IsJobHistoryAddUpdateInProgress: true, JobAddUpdateFormData: action.payload });
            }

        case employeeActions.ActionTypes.EMPLOYEE_JOB_HISTORY_ADD_COMPLETE:
            {
                return Object.assign({}, state, { IsJobHistoryAddUpdateInProgress: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_JOB_HISTORY_UPDATE:
            {
                return Object.assign({}, state, { IsJobHistoryAddUpdateInProgress: true, JobAddUpdateFormData: action.payload });
            }

        case employeeActions.ActionTypes.EMPLOYEE_JOB_HISTORY_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { IsJobHistoryAddUpdateInProgress: false });
            }

        case employeeActions.ActionTypes.EMPLOYEE_SALARY_UPDATE:
            {
                return Object.assign({}, state, { IsSalaryHistoryAddUpdateInProgress: true, SalaryAddUpdateFormData: action.payload });
            }

        case employeeActions.ActionTypes.EMPLOYEE_SALARY_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { IsSalaryHistoryAddUpdateInProgress: false });
            }

        case employeeActions.ActionTypes.EMPLOYEE_SALARY_GET:
            {
                return Object.assign({}, state, { fetchSalaryHistoryDataLoading: true, SelectedSalaryHistoryId: action.payload });
            }

        case employeeActions.ActionTypes.EMPLOYEE_SALARY_GET_COMPLETE:
            {
                return Object.assign({}, state, { fetchSalaryHistoryDataLoading: false, SalaryAddUpdateFormData: action.payload });
            }

        case employeeActions.ActionTypes.EMPLOYEE_JOB_HISTORY_GET:
            {
                return Object.assign({}, state, { fetchJobHistoryDataLoading: true, SelectedJobHistoryId: action.payload });
            }

        case employeeActions.ActionTypes.EMPLOYEE_JOB_HISTORY_GET_COMPLETE:
            {
                return Object.assign({}, state, { fetchJobHistoryDataLoading: false, JobAddUpdateFormData: action.payload });
            }

        case employeeActions.ActionTypes.EMPLOYEE_SALARY_DELETE:
            {
                return Object.assign({}, state, { IsSalaryHistoryDeleteInProgress: true, SelectedSalaryHistoryId: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_SALARY_DELETE_COMPLETE:
            {
                return Object.assign({}, state, { IsSalaryHistoryDeleteInProgress: false, });
            }

        case employeeActions.ActionTypes.EMPLOYEE_JOB_HISTORY_DELETE:
            {
                return Object.assign({}, state, { IsJobHistoryDeleteInProgress: true, SelectedJobHistoryId: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_JOB_HISTORY_DELETE_COMPLETE:
            {
                return Object.assign({}, state, { IsJobHistoryDeleteInProgress: false, });
            }

        case employeeActions.ActionTypes.LOAD_EMPLOYEE_SALARY_HISTORY_ON_PAGE_CHANGE:
            {
                let modifiedState = Object.assign({}, state, { SalaryHistoryPagingInfo: Object.assign({}, state.SalaryHistoryPagingInfo, { PageNumber: action.payload.pageNumber, Count: action.payload.noOfRows }) });
                modifiedState.HasSalaryHistoryLoaded = false;
                return modifiedState;
            }
        case employeeActions.ActionTypes.LOAD_EMPLOYEE_SALARY_HISTORY_ON_SORT:
            {
                if (!isNullOrUndefined(state.SalaryHistoryPagingInfo)) {
                    state.SalaryHistoryPagingInfo.PageNumber = 1;
                }
                let modifiedState = Object.assign({}, state, { SalaryHistorySortInfo: Object.assign({}, state.SalaryHistorySortInfo, { SortField: action.payload.SortField, Direction: action.payload.Direction }) });
                modifiedState.HasSalaryHistoryLoaded = false;
                return modifiedState;
            }

        case employeeActions.ActionTypes.LOAD_EMPLOYEE_JOB_HISTORY_ON_PAGE_CHANGE:
            {
                let modifiedState = Object.assign({}, state, { JobHistoryPagingInfo: Object.assign({}, state.JobHistoryPagingInfo, { PageNumber: action.payload.pageNumber, Count: action.payload.noOfRows }) });
                modifiedState.HasJobHistoryLoaded = false;
                return modifiedState;
            }
        case employeeActions.ActionTypes.LOAD_EMPLOYEE_JOB_HISTORY_ON_SORT:
            {
                if (!isNullOrUndefined(state.JobHistoryPagingInfo)) {
                    state.JobHistoryPagingInfo.PageNumber = 1;
                }
                let modifiedState = Object.assign({}, state, { JobHistorySortInfo: Object.assign({}, state.JobHistorySortInfo, { SortField: action.payload.SortField, Direction: action.payload.Direction }, ) });
                modifiedState.HasJobHistoryLoaded = false;
                return modifiedState;
            }

        case employeeActions.ActionTypes.EMPLOYEE_PERSONAL_UPDATE:
            {
                return Object.assign({}, state, { UpdateCompleted: false });
            }

        case employeeActions.ActionTypes.EMPLOYEE_PERSONAL_UPDATE_COMPLETE:
            {
                let informationVm = Object.assign({}, state.InformationVM);
                let empPersonalVm = Object.assign({}, state.EmployeePersonalVM);
                for (let empkey in empPersonalVm) {
                    empPersonalVm[empkey] = action.payload[empkey];
                }
                for (var informationKey in informationVm) {
                    informationVm[informationKey] = action.payload[informationKey];
                }
                return Object.assign({}, state, { UpdateCompleted: true, EmployeePersonalVM: empPersonalVm, InformationVM: informationVm });
            }

        case employeeActions.ActionTypes.EMPLOYEE_DOB_CHANGE:
            {
                let age: string = calculateAge(action.payload)
                return Object.assign({}, state, { Age: age });
            }
        /* employee personal actions - end */

        /* employee statistics actions - start */
        case employeeActions.ActionTypes.EMPLOYEE_STATISTICS_LOAD:
            {
                return Object.assign({}, state, { StatisticsPending: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_STATISTICS_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { StatisticsPending: false, StatisticsVM: action.payload });
            }
        /* employee statistics actions - end */

        /* employee information actions - start */
        case employeeActions.ActionTypes.EMPLOYEE_INFORMATION_LOAD:
            {
                return Object.assign({}, state, { InformationPending: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_INFORMATION_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { InformationPending: false, InformationVM: action.payload });
            }
        /* employee information actions - end */

        /* employee contacts actions - start */
        case employeeActions.ActionTypes.EMPLOYEE_CONTACTS_LOAD:
            {
                return Object.assign({}, state, { Status: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_CONTACTS_LOAD_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, { Status: true, Data: <EmployeeContacts>action.payload });
                let empInfo: EmployeeInformation = new EmployeeInformation();
                modifiedState.Data.FullAddress = extractFullAddress(modifiedState.Data);//Always evaulate the full address dont get from saved value APB-19050
                Object.assign(empInfo, modifiedState.InformationVM);
                empInfo.Email = modifiedState.Data.Email;
                empInfo.MobilePhone = modifiedState.Data.MobilePhone;
                modifiedState.InformationVM = empInfo;
                return modifiedState;
            }
        case employeeActions.ActionTypes.EMPLOYEE_CONTACTS_UPDATE:
            {
                return Object.assign({}, state, { ContactUpdateStatus: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_CONTACTS_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { ContactUpdateStatus: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_LOAD:
            {
                let modifiedState: EmployeeState = Object.assign({}, state, { IsEmergencyConctactsLoaded: false, EmergencyConctactsApiRequest: action.payload.apiRequest });
                return modifiedState;
            }
        case employeeActions.ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_LOAD_COMPLETE:
            {
                let modifiedState: EmployeeState = Object.assign({}, state, { IsEmergencyConctactsLoaded: true, EmergencyContacts: action.payload });
                if (modifiedState.EmergencyContacts && modifiedState.EmergencyContacts.PagingInfo && modifiedState.EmergencyContacts.PagingInfo.PageNumber === 1) {
                    modifiedState.EmergencyContactsTotalCount = modifiedState.EmergencyContacts.PagingInfo.TotalCount;
                }
                return modifiedState;
            }
        case employeeActions.ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_CREATE:
            {
                return Object.assign({}, state, { EmergencyContactUpdateStatus: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_CREATE_COMPLETE:
            {
                return Object.assign({}, state, { EmergencyContactGetStatus: null, EmergencyContactUpdateStatus: true, EmergencyContactData: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_UPDATE:
            {
                return Object.assign({}, state, { EmergencyContactUpdateStatus: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { EmergencyContactGetStatus: null, EmergencyContactUpdateStatus: true, EmergencyContactData: null });
            }
        case employeeActions.ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_DELETE:
            {
                return Object.assign({}, state, { EmergencyContactDeleteStatus: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_DELETE_COMPLETE:
            {
                return Object.assign({}, state, { EmergencyContactDeleteStatus: true, EmergencyContactData: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_GET:
            {
                return Object.assign({}, state, { EmergencyContactGetStatus: false, EmergencyContactData: null });
            }
        case employeeActions.ActionTypes.EMPLOYEE_EMERGENCY_CONTACTS_GET_COMPLETE:
            {
                return Object.assign({}, state, { EmergencyContactGetStatus: true, EmergencyContactUpdateStatus: false, EmergencyContactData: action.payload });
            }
        /* employee contacts actions - end */

        /* employee education history actions - start */
        case employeeActions.ActionTypes.EMPLOYEE_EDUCATION_HISTORY_LOAD:
            {
                return Object.assign({}, state, { HasEducationHistoryLoaded: false, EducationHistoryApiRequest: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_EDUCATION_HISTORY_LOAD_COMPLETE:
            {
                let modifiedState: EmployeeState = Object.assign({}, state, { HasEducationHistoryLoaded: true, EducationHistoryList: action.payload });
                if (modifiedState.EducationHistoryList.PagingInfo && modifiedState.EducationHistoryList.PagingInfo.PageNumber === 1) {
                    modifiedState.EducationHistoryListTotalCount = modifiedState.EducationHistoryList.PagingInfo.TotalCount;
                }
                return modifiedState;
            }
        case employeeActions.ActionTypes.EMPLOYEE_EDUCATION_HISTORY_CREATE:
            {
                return Object.assign({}, state, { IsEducationHistoryAddUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_EDUCATION_HISTORY_CREATE_COMPLETE:
            {
                return Object.assign({}, state, { IsEducationHistoryAddUpdateInProgress: false, CurrentEducationHistory: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_EDUCATION_HISTORY_UPDATE:
            {
                return Object.assign({}, state, { IsEducationHistoryAddUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_EDUCATION_HISTORY_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { IsEducationHistoryAddUpdateInProgress: false, CurrentEducationHistory: null });
            }
        case employeeActions.ActionTypes.EMPLOYEE_EDUCATION_HISTORY_DELETE:
            {
                return Object.assign({}, state, { IsEducationHistoryAddUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_EDUCATION_HISTORY_DELETE_COMPLETE:
            {
                return Object.assign({}, state, { IsEducationHistoryAddUpdateInProgress: false, CurrentEducationHistory: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_EDUCATION_HISTORY_GET:
            {
                return Object.assign({}, state, { EducationHistoryGetStatus: false, IsEducationHistoryAddUpdateInProgress: true, CurrentEducationHistory: null });
            }
        case employeeActions.ActionTypes.EMPLOYEE_EDUCATION_HISTORY_GET_COMPLETE:
            {
                return Object.assign({}, state, { EducationHistoryGetStatus: true, IsEducationHistoryAddUpdateInProgress: false, CurrentEducationHistory: action.payload });
            }
        /* employee education history actions - end */

        /* employee qualification history actions - start */
        case employeeActions.ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_LOAD:
            {
                return Object.assign({}, state, { HasQualificationHistoryLoaded: false, QualificationHistoryApiRequest: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_LOAD_COMPLETE:
            {
                let modifiedState: EmployeeState = Object.assign({}, state, { HasQualificationHistoryLoaded: true, QualificationHistoryList: action.payload });
                if (modifiedState.QualificationHistoryList.PagingInfo && modifiedState.QualificationHistoryList.PagingInfo.PageNumber === 1) {
                    modifiedState.QualificationHistoryListTotalCount = modifiedState.QualificationHistoryList.PagingInfo.TotalCount;
                }
                return modifiedState;
            }
        case employeeActions.ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_CREATE:
            {
                return Object.assign({}, state, { IsQualificationHistoryAddUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_CREATE_COMPLETE:
            {
                return Object.assign({}, state, { IsQualificationHistoryAddUpdateInProgress: false, CurrentQualificationHistory: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_UPDATE:
            {
                return Object.assign({}, state, { IsQualificationHistoryAddUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { QualificationHistoryGetStatus: false, IsQualificationHistoryAddUpdateInProgress: false, CurrentQualificationHistory: null });
            }
        case employeeActions.ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_DELETE:
            {
                return Object.assign({}, state, { IsQualificationHistoryAddUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_DELETE_COMPLETE:
            {
                return Object.assign({}, state, { IsQualificationHistoryAddUpdateInProgress: false, CurrentQualificationHistory: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_GET:
            {
                return Object.assign({}, state, { QualificationHistoryGetStatus: false, IsQualificationHistoryAddUpdateInProgress: true, CurrentQualificationHistory: null });
            }
        case employeeActions.ActionTypes.EMPLOYEE_QUALIFICATION_HISTORY_GET_COMPLETE:
            {
                return Object.assign({}, state, { QualificationHistoryGetStatus: true, IsQualificationHistoryAddUpdateInProgress: false, CurrentQualificationHistory: action.payload });
            }
        /* employee qualification history actions - end */

        /** employee vehicle info actions start */

        case employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_ADD:
            {
                return Object.assign({}, state, { IsVehiclesInformationAddUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_ADD_COMPLETE:
            {
                return Object.assign({}, state, { CurrentVehicle: action.payload, IsVehiclesInformationAddUpdateInProgress: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_LOAD:
            {
                return Object.assign({}, state, { HasVehiclesInformationLoaded: false, IsVehiclesInformationAddUpdateInProgress: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_LOAD_COMPLTE:
            {
                if (!isNullOrUndefined(state.VerhiclePagingInfo)) {
                    if (action.payload.VerhiclePagingInfo.PageNumber == 1) {
                        state.VerhiclePagingInfo.TotalCount = action.payload.VerhiclePagingInfo.TotalCount;
                    }
                    state.VerhiclePagingInfo.PageNumber = action.payload.VerhiclePagingInfo.PageNumber;
                    state.VerhiclePagingInfo.Count = action.payload.VerhiclePagingInfo.Count;
                }
                else {
                    state.VerhiclePagingInfo = action.payload.VerhiclePagingInfo;
                }
                if (isNullOrUndefined(state.VehicleSortInfo)) {
                    state.VehicleSortInfo = <AeSortModel>{};
                    state.VehicleSortInfo.SortField = 'Make';
                    state.VehicleSortInfo.Direction = 1;
                }
                return Object.assign({}, state, { VehiclesList: action.payload.VehiclesList, HasVehiclesInformationLoaded: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_GET_BY_ID:
            {
                return Object.assign({}, state, { CurrentVehicle: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_GET_BY_ID_COMPLETE:
            {
                return Object.assign({}, state, { CurrentVehicle: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_UPDATE:
            {
                return Object.assign({}, state, { CurrentVehicle: action.payload, IsVehiclesInformationAddUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { CurrentVehicle: action.payload, IsVehiclesInformationAddUpdateInProgress: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_DELETE:
            {
                return Object.assign({}, state, { DeletedVehicle: action.payload, IsVehicleInformationDeleted: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_DELETE_COMPLETE:
            {
                return Object.assign({}, state, { IsVehicleInformationDeleted: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_VEHICLE_ENGINECC_LOAD:
            {
                return Object.assign({}, state, { IsEngineCCTypesLoaded: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_VEHICLE_ENGINECC_LOAD_COMPLTE:
            {
                return Object.assign({}, state, { EngineCCTypes: action.payload, IsEngineCCTypesLoaded: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_VEHICLE_FUELTYPES_LOAD:
            {
                return Object.assign({}, state, { IsFuelTypesLoaded: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_VEHICLE_FUELTYPES_LOAD_COMPLTE:
            {
                return Object.assign({}, state, { FuelTypes: action.payload, IsFuelTypesLoaded: true });
            }

        case employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_LOAD_ON_PAGE_CHANGE:
            {
                let modifiedState = Object.assign({}, state, { VerhiclePagingInfo: Object.assign({}, state.VerhiclePagingInfo, { PageNumber: action.payload.pageNumber, Count: action.payload.noOfRows }) });
                modifiedState.HasVehiclesInformationLoaded = false;
                return modifiedState;
            }
        case employeeActions.ActionTypes.EMPLOYEE_VEHICLE_INFO_LOAD_ON_SORT:
            {
                if (!isNullOrUndefined(state.VerhiclePagingInfo)) {
                    state.VerhiclePagingInfo.PageNumber = 1;
                }
                let modifiedState = Object.assign({}, state, { VehicleSortInfo: Object.assign({}, state.VehicleSortInfo, { SortField: action.payload.SortField, Direction: action.payload.Direction }) });
                modifiedState.HasVehiclesInformationLoaded = false;
                return modifiedState;
            }

        /** employee vehicle info actions end */

        /** employee previous employment history actions start */

        case employeeActions.ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_LOAD:
            {
                return Object.assign({}, state, { HasPreviousEmploymentLoaded: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_LOAD_COMPLETE:
            {
                if (!isNullOrUndefined(state.PreviousEmploymentPagingInfo)) {
                    if (action.payload.PreviousEmploymentPagingInfo.PageNumber == 1) {
                        state.PreviousEmploymentPagingInfo.TotalCount = action.payload.PreviousEmploymentPagingInfo.TotalCount;
                    }
                    state.PreviousEmploymentPagingInfo.PageNumber = action.payload.PreviousEmploymentPagingInfo.PageNumber;
                    state.PreviousEmploymentPagingInfo.Count = action.payload.PreviousEmploymentPagingInfo.Count;
                }
                else {
                    state.PreviousEmploymentPagingInfo = action.payload.PreviousEmploymentPagingInfo;
                }
                if (isNullOrUndefined(state.PreviousEmploymentSortInfo)) {
                    state.PreviousEmploymentSortInfo = <AeSortModel>{};
                    state.PreviousEmploymentSortInfo.SortField = 'Make';
                    state.PreviousEmploymentSortInfo.Direction = 1;
                }
                return Object.assign({}, state, { PreviousEmploymentHistoryList: action.payload.PreviousEmploymentHistoryList, HasPreviousEmploymentLoaded: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_ADD:
            {
                return Object.assign({}, state, { IsPreviousEmploymentAddUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_ADD_COMPLETE:
            {
                return Object.assign({}, state, { CurrentPreviousEmployment: action.payload, IsPreviousEmploymentAddUpdateInProgress: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_UPDATE:
            {
                return Object.assign({}, state, { CurrentPreviousEmployment: action.payload, IsPreviousEmploymentAddUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { CurrentPreviousEmployment: action.payload, IsPreviousEmploymentAddUpdateInProgress: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_REMOVE:
            {
                return Object.assign({}, state, { CurrentPreviousEmployment: action.payload, IsPreviousEmploymentRemoveInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_REMOVE_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, { CurrentPreviousEmployment: action.payload, IsPreviousEmploymentRemoveInProgress: false });
                modifiedState.HasPreviousEmploymentLoaded = false;
                return modifiedState;
            }
        case employeeActions.ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_LOAD_ON_PAGE_CHANGE:
            {
                let modifiedState = Object.assign({}, state, { PreviousEmploymentPagingInfo: Object.assign({}, state.PreviousEmploymentPagingInfo, { PageNumber: action.payload.pageNumber, Count: action.payload.noOfRows }) });
                modifiedState.HasPreviousEmploymentLoaded = false;
                return modifiedState;
            }
        case employeeActions.ActionTypes.EMPLOYEE_PREV_EMPLOYMENT_HISTORY_LOAD_ON_SORT:
            {
                if (!isNullOrUndefined(state.PreviousEmploymentPagingInfo)) {
                    state.PreviousEmploymentPagingInfo.PageNumber = 1;
                }
                return Object.assign({}, state, { PreviousEmploymentSortInfo: Object.assign({}, state.PreviousEmploymentSortInfo, { SortField: action.payload.SortField, Direction: action.payload.Direction }) });
            }

        /** employee previous employment history actions end */

        /* employee training history actions - start */
        case employeeActions.ActionTypes.EMPLOYEE_TRAINING_HISTORY_LOAD:
            {
                return Object.assign({}, state, { HasTrainingHistoryLoaded: false, TrainingHistoryApiRequest: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_TRAINING_HISTORY_LOAD_COMPLETE:
            {
                let modifiedState: EmployeeState = Object.assign({}, state, { HasTrainingHistoryLoaded: true, TrainingHistoryList: action.payload });
                if (modifiedState.TrainingHistoryList && modifiedState.TrainingHistoryList.PagingInfo && modifiedState.TrainingHistoryList.PagingInfo.PageNumber === 1) {
                    modifiedState.TrainigHistoryListTotalCount = modifiedState.TrainingHistoryList.PagingInfo.TotalCount;
                }
                return modifiedState;
            }
        case employeeActions.ActionTypes.EMPLOYEE_TRAINING_HISTORY_CREATE:
            {
                return Object.assign({}, state, { IsTrainingHistoryAddUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_TRAINING_HISTORY_CREATE_COMPLETE:
            {
                return Object.assign({}, state, { IsTrainingHistoryAddUpdateInProgress: false, CurrentTrainingHistory: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_TRAINING_HISTORY_UPDATE:
            {
                return Object.assign({}, state, { IsTrainingHistoryAddUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_TRAINING_HISTORY_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { TrainingHistoryGetStatus: false, IsTrainingHistoryAddUpdateInProgress: false, CurrentTrainingHistory: null });
            }
        case employeeActions.ActionTypes.EMPLOYEE_TRAINING_HISTORY_DELETE:
            {
                return Object.assign({}, state, { IsTrainingHistoryAddUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_TRAINING_HISTORY_DELETE_COMPLETE:
            {
                return Object.assign({}, state, { IsTrainingHistoryAddUpdateInProgress: false, CurrentTrainingHistory: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_TRAINING_HISTORY_GET:
            {
                return Object.assign({}, state, { TrainingHistoryGetStatus: false, IsTrainingHistoryAddUpdateInProgress: true, CurrentTrainingHistory: null });
            }
        case employeeActions.ActionTypes.EMPLOYEE_TRAINING_HISTORY_GET_COMPLETE:
            {
                return Object.assign({}, state, { TrainingHistoryGetStatus: true, IsTrainingHistoryAddUpdateInProgress: false, CurrentTrainingHistory: action.payload });
            }
        /* employee training history actions - end */

        /* Start :: Employee Bank actions */
        case employeeActions.ActionTypes.EMPLOYEE_BANK_DETAILS_LOAD:
            {
                let requested = <AtlasApiRequestWithParams>action.payload;
                let modifiedState = Object.assign({}, state, { HasBankDetailsListLoaded: false, BankApiRequest: action.payload });
                return modifiedState;
            }
        case employeeActions.ActionTypes.EMPLOYEE_BANK_DETAILS_LOAD_COMPLETE:
            {
                let modifiedState: EmployeeState = Object.assign({}, state, { HasBankDetailsListLoaded: true, BankDetailsList: action.payload.Entities });

                if (!isNullOrUndefined(state.BankDetailsPagingInfo)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.BankDetailsPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                    }
                    modifiedState.BankDetailsPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                    modifiedState.BankDetailsPagingInfo.Count = action.payload.PagingInfo.Count;
                }
                else {
                    modifiedState.BankDetailsPagingInfo = action.payload.PagingInfo;
                }

                return modifiedState;
            }
        case employeeActions.ActionTypes.EMPLOYEE_BANK_DETAILS_ADD:
            {
                return Object.assign({}, state, { IsBankDetailsAddUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_BANK_DETAILS_ADD_COMPLETE:
            {
                return Object.assign({}, state, { IsBankDetailsAddUpdateInProgress: false, CurrentBankDetails: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_BANK_DETAILS_UPDATE:
            {
                return Object.assign({}, state, { IsBankDetailsAddUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_BANK_DETAILS_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { BankDetailsGetStatus: false, IsBankDetailsAddUpdateInProgress: false, CurrentBankDetails: null });
            }
        case employeeActions.ActionTypes.EMPLOYEE_BANK_DETAILS_DELETE:
            {
                return Object.assign({}, state, { IsBankDetailsAddUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_BANK_DETAILS_DELETE_COMPLETE:
            {
                return Object.assign({}, state, { IsBankDetailsAddUpdateInProgress: false, CurrentBankDetails: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_BANK_DETAILS_BY_ID_LOAD:
            {
                return Object.assign({}, state, { BankDetailsGetStatus: false, IsBankDetailsAddUpdateInProgress: true, CurrentBankDetails: null });
            }
        case employeeActions.ActionTypes.EMPLOYEE_BANK_DETAILS_BY_ID_LOADCOMPLETE:
            {
                return Object.assign({}, state, { BankDetailsGetStatus: true, IsBankDetailsAddUpdateInProgress: false, CurrentBankDetails: action.payload });
            }
        // End :: Employee Bank actions

        //Employee timeline
        case employeeActions.ActionTypes.EMPLOYEE_TIMELINE_DATA_LOAD: {
            return Object.assign({}, state, { HasTimelineDataLoaded: false });
        }
        case employeeActions.ActionTypes.EMPLOYEE_TIMELINE_DATA_LOAD_COMPLETE: {
            let modifiedState = Object.assign({}, state, { HasTimelineDataLoaded: true, TimelineData: action.payload.TimelineData });

            if (!isNullOrUndefined(modifiedState.TimeLinePagingInfo)) {
                if (action.payload.TimeLinePagingInfo.PageNumber == 1) {
                    modifiedState.TimeLinePagingInfo.TotalCount = action.payload.TimeLinePagingInfo.TotalCount;
                }
                modifiedState.TimeLinePagingInfo.PageNumber = action.payload.TimeLinePagingInfo.PageNumber;
                modifiedState.TimeLinePagingInfo.Count = action.payload.TimeLinePagingInfo.Count;
            }
            else {
                modifiedState.TimeLinePagingInfo = action.payload.TimeLinePagingInfo;
            }
            if (isNullOrUndefined(modifiedState.TimeLineSortInfo)) {
                modifiedState.TimeLineSortInfo = <AeSortModel>{};
                modifiedState.TimeLineSortInfo.SortField = 'CreatedOn';
                modifiedState.TimeLineSortInfo.Direction = 1;
            }

            return modifiedState;
        }
        case employeeActions.ActionTypes.LOAD_EMPLOYEE_TIMELINE_ON_PAGE_CHANGE: {
            return Object.assign({}, state, { HasTimelineDataLoaded: false, TimeLinePagingInfo: Object.assign({}, state.TimeLinePagingInfo, { PageNumber: action.payload.pageNumber, Count: action.payload.noOfRows }) });
        }
        case employeeActions.ActionTypes.LOAD_EMPLOYEE_TIMELINE_ON_SORT: {
            return Object.assign({}, state, { HasTimelineDataLoaded: false, TimeLineSortInfo: Object.assign({}, state.TimeLineSortInfo, { SortField: action.payload.SortField, Direction: action.payload.Direction }) });
        }
        case employeeActions.ActionTypes.LOAD_EMPLOYEE_TIMELINE_ON_FILTERS_CHANGE: {
            //when filters changed we should always get the data of first page..
            let modifiedState = Object.assign({}, state, { HasTimelineDataLoaded: false, loading: true, TimelineFilters: action.payload });
            modifiedState.TimeLinePagingInfo.PageNumber = 1;
            return modifiedState;
        }

        case employeeActions.ActionTypes.EMPLOYEE_TIMELINE_LOAD_EMPLOYEE_EVENT: {
            return state;
        }
        case employeeActions.ActionTypes.EMPLOYEE_TIMELINE_LOAD_EMPLOYEE_EVENT_COMPLETE: {
            return Object.assign({}, state, { SelectedEmployeeEvent: action.payload });
        }

        case employeeActions.ActionTypes.EMPLOYEE_STATE_CLEAR: {
            //check if the cleared employee id is in the state already if does not match then clear off
            let modifiedState = state;
            if (isNullOrUndefined(state.EmployeePersonalVM) || (!isNullOrUndefined(state.EmployeePersonalVM) && action.payload != state.EmployeePersonalVM.Id)) {
                let modifiedState = Object.assign(state, initialState); //assigning initial state values  
                modifiedState.EmployeePersonalVM = new Employee();
                modifiedState.EmployeeId = <string>action.payload;
                modifiedState.EmployeePersonalVM.Id = <string>action.payload;
            }
            return modifiedState;
        }
        /* employee job actions - start */
        case employeeActions.ActionTypes.EMPLOYEE_JOB_LOAD:
            {
                return Object.assign({}, state, { HasJobDetailsLoaded: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_JOB_LOAD_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, { HasJobDetailsLoaded: true, JobDetails: <EmployeeJobDetails>action.payload });
                let empInfo: EmployeeInformation = new EmployeeInformation();
                Object.assign(empInfo, modifiedState.InformationVM);
                empInfo.JobTitle = modifiedState.JobDetails.JobTitleName;
                empInfo.StartDate = modifiedState.JobDetails.StartDate;
                modifiedState.InformationVM = empInfo;
                return modifiedState;
            }
        case employeeActions.ActionTypes.EMPLOYEE_JOB_UPDATE:
            {
                return Object.assign({}, state, { IsJobDetailsUpdateInProgress: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_JOB_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { IsJobDetailsUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.LOAD_EMPLOYEE_HOLIDAY_WORKING_PROFILE:
            {
                return Object.assign({}, state, { HasEmployeeHolidayWorkingProfileDataLoaded: false });
            }
        case employeeActions.ActionTypes.LOAD_EMPLOYEE_HOLIDAY_WORKING_PROFILE_COMPLETE:
            {
                return Object.assign({}, state, { HasEmployeeHolidayWorkingProfileDataLoaded: true, HolidayWorkingProfile: action.payload });
            }
        case employeeActions.ActionTypes.LOAD_EMPLOYEE_STAT:
            {
                return Object.assign({}, state);
            }
        case employeeActions.ActionTypes.LOAD_EMPLOYEE_STAT_COMPLETE:
            {
                let pl = action.payload;
                let modifiedState = Object.assign({}, state, {LastUpdated: pl});
                return modifiedState;
            }
        //End of employee timeline
        // Start :: Employee - Admin details
        case employeeActions.ActionTypes.EMPLOYEE_ADMINISTRATION_DETAILS:
            {
                return Object.assign({}, state, { HasAdminDetailsLoaded: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_ADMINISTRATION_DETAILS_LOADCOMPLETE:
            {
                return Object.assign({}, state, { HasAdminDetailsLoaded: true, EmployeeAdminDetails: action.payload });
            }
        case employeeActions.ActionTypes.USERPROFILE_UPDATE:
            {
                return Object.assign({}, state, {});
            }
        case employeeActions.ActionTypes.USERPROFILE_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { EmployeeAdminDetails: action.payload });
            }

        case employeeActions.ActionTypes.UPDATE_USER_STATUS: {
            return Object.assign({}, state, { HasUserStatusUpdated: false });
        }
        case employeeActions.ActionTypes.UPDATE_USER_STATUS_COMPLETE: {
            return Object.assign({}, state, { HasUserStatusUpdated: true });
        }
        case employeeActions.ActionTypes.MANUAL_PASSWORD_RESET: {
            return Object.assign({}, state, { HasUserPasswordReset: false });
        }
        case employeeActions.ActionTypes.MANUAL_PASSWORD_RESET_COMPLETE: {
            return Object.assign({}, state, { HasUserPasswordReset: action.payload });
        }
        case employeeActions.ActionTypes.LOAD_UNASSOCIATED_USERS: {
            return Object.assign({}, state, { HasUnAssociatedLoaded: false });
        }
        case employeeActions.ActionTypes.LOAD_UNASSOCIATED_USERS_COMPLETE: {
            return Object.assign({}, state, { HasUnAssociatedLoaded: true, UnAssociatedUsersList: action.payload });
        }

        case employeeActions.ActionTypes.CHECK_EMPLOYEE_DUPLICATE_EMAIL: {
            return Object.assign({}, state, { IsDuplicateEmail: null });
        }
        case employeeActions.ActionTypes.CHECK_EMPLOYEE_DUPLICATE_EMAIL_COMPLETE: {
            return Object.assign({}, state, { IsDuplicateEmail: action.payload });
        }

        case employeeActions.ActionTypes.EMPLOYEE_OPTIONS_UPDATE:
            {
                return Object.assign({}, state, { IsOptionsUpdateInProgress: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_OPTIONS_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { IsOptionsUpdateInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_REMOVE:
            {
                return Object.assign({}, state, { IsEmployeeRemoveInProgress: true });
            }
        case employeeActions.ActionTypes.EMPLOYEE_REMOVE_COMPLETE:
            {
                return Object.assign({}, state, { IsEmployeeRemoveInProgress: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_BENEFITS_LOAD_BY_ID:
            {
                return Object.assign({}, state, { hasEmployeePayrollLoaded: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_BENEFITS_LOAD_BY_ID_COMPLETE:
            {
                return Object.assign({}, state, { hasEmployeePayrollLoaded: true, employeePayrollDetails: action.payload });
            }
        case employeeActions.ActionTypes.EMPLOYEE_LEAVEREVENT_DETAILS:
            {
                return Object.assign({}, state, { hasLeaverEventDetailLoaded: false });
            }
        case employeeActions.ActionTypes.EMPLOYEE_LEAVEREVENT_DETAILS_COMPLETE:
            {
                return Object.assign({}, state, { hasLeaverEventDetailLoaded: true, employeeLeaverDetails: action.payload });
            }
        // End :: Employee - Admin details

        default:
            return state;
    }
}

// employee personal state selectors - start
export function employeePersonalData(state$: Observable<EmployeeState>): Observable<Employee> {
    return state$.select(s => s.EmployeePersonalVM);
}

export function employeeEmployeId(state$: Observable<EmployeeState>): Observable<string> {
    return state$.select(s => s.EmployeeId);
}

export function employeePersonalDataLoadStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.PersonalPending);
}

export function employeeAge(state$: Observable<EmployeeState>): Observable<string> {
    return state$.select(s => s.Age);
}
// employee personal state selectors - end

// employee information state selectors - start
export function employeeInformationData(state$: Observable<EmployeeState>): Observable<EmployeeInformation> {
    return state$.select(s => s.InformationVM);
}

export function employeeInformationLoadStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.InformationPending);
}
// employee information state selectors - end

// employee statistics state selectors - start
export function employeeStatisticsData(state$: Observable<EmployeeState>): Observable<AeInformationBarItem[]> {
    return state$.select(s => s.StatisticsVM);
}

export function employeeStatisticsLoadStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.StatisticsPending);
}
// employee statistics state selectors - end

// employee state selectors - start
export function employeePendingStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.EmployeePending);
}

export function employeeUpdateStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.UpdateCompleted);
}

export function employeeSelectedTab(state$: Observable<EmployeeState>): Observable<number> {
    return state$.select(s => s.SelectedTab);
}
// employee state selectors - end


// employee contacts state - start

export function getEmployeeContactsData(state$: Observable<EmployeeState>): Observable<EmployeeContacts> {
    return state$.select(s => s.Data);
}

export function employeeContactsDataLoadStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.Status);
}

export function getEmployeeContactUpdateStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.ContactUpdateStatus);
}

export function getEmployeeEmergencyContacts(state$: Observable<EmployeeState>): Observable<Immutable.List<EmergencyContact>> {
    return state$.select(s => s.EmergencyContacts && Immutable.List<EmergencyContact>(s.EmergencyContacts.Entities));
}

export function getEmployeeEmergencyContactsTotalCount(state$: Observable<EmployeeState>): Observable<number> {
    return state$.select(s => s && s.EmergencyContactsTotalCount);
}
export function getEmployeeBenefitsSchemeStatus(state$: Observable<EmployeeState>): Observable<EmployeeBenefits> {
    return state$.select(s => s && s.EmployeeBenefitSaved);
}
export function getEmployeeBenefitSaveStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s && s.EmployeeBenefitSchemeLoaded);
}
export function getEmployeeEmergencyContactsDataTableOptions(state$: Observable<EmployeeState>): Observable<DataTableOptions> {
    return state$.select(s => s.EmergencyContacts && s.EmergencyContacts.PagingInfo && s.EmergencyConctactsApiRequest && extractDataTableOptions(s.EmergencyContacts.PagingInfo, s.EmergencyConctactsApiRequest.SortBy));
}

export function getEmployeeEmergencyContactsData(state$: Observable<EmployeeState>): Observable<EmployeeEmergencyContacts> {
    return state$.select(s => s.EmergencyContactData);
}

export function getEmployeeEmergencyContactUpdateStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.EmergencyContactUpdateStatus);
}

export function getEmployeeEmergencyContactDeleteStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.EmergencyContactDeleteStatus);
}

export function getEmployeeEmergencyContactGetStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.EmergencyContactGetStatus);
}

export function getEmployeeEmergencyContactsLoad(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.IsEmergencyConctactsLoaded);
}


export function getEmployeeSalaryHistoryData(state$: Observable<EmployeeState>): Observable<Immutable.List<SalaryHistory>> {
    return state$.select(s => s.SalaryHistoryList && Immutable.List<SalaryHistory>(s.SalaryHistoryList));
}

export function getEmployeeSalaryHistoryDataTableOptions(state$: Observable<EmployeeState>): Observable<DataTableOptions> {
    return state$.select(state => state.SalaryHistoryPagingInfo && extractDataTableOptions(state.SalaryHistoryPagingInfo, state.SalaryHistorySortInfo));
}

export function getEmployeeSalaryHistoryTotalCount(state$: Observable<EmployeeState>): Observable<number> {
    return state$.select(state => state.SalaryHistoryPagingInfo && state.SalaryHistoryPagingInfo.TotalCount);
}

export function getEmployeeSalaryHistoryLoaded(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.HasSalaryHistoryLoaded);
}



export function getEmployeeJobHistoryData(state$: Observable<EmployeeState>): Observable<Immutable.List<JobHistory>> {
    return state$.select(state => state.JobHistoryList && Immutable.List<JobHistory>(state.JobHistoryList));
}

export function getEmployeeJobHistoryDataTableOptions(state$: Observable<EmployeeState>): Observable<DataTableOptions> {
    return state$.select(state => state.JobHistoryPagingInfo && extractDataTableOptions(state.JobHistoryPagingInfo, state.JobHistorySortInfo));
}

export function getEmployeeJobHistoryTotalCount(state$: Observable<EmployeeState>): Observable<number> {
    return state$.select(state => state.JobHistoryPagingInfo && state.JobHistoryPagingInfo.TotalCount);
}


export function getEmployeeJobHistoryLoaded(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.HasJobHistoryLoaded);
}


// export function getEmployeeJobHistoryRowsCount(state$: Observable<EmployeeState>): Observable<number> {
//     return state$.select(state => state.JobHistoryPagingInfo && state.JobHistoryPagingInfo.Count);
// }

// export function getEmployeeJobHistoryCurrentPage(state$: Observable<EmployeeState>): Observable<number> {
//     return state$.select(state => state.JobHistoryPagingInfo && state.JobHistoryPagingInfo.PageNumber);
// }

export function saveEmployeeSalary(state$: Observable<EmployeeState>): Observable<SalaryHistory> {
    return state$.select(s => s.SalaryAddUpdateFormData);
}

export function getEmployeeSalaryHistoryForSelectedId(state$: Observable<EmployeeState>): Observable<SalaryHistory> {
    return state$.select(s => s.SalaryAddUpdateFormData);
}

export function saveEmployeeJob(state$: Observable<EmployeeState>): Observable<JobHistory> {
    return state$.select(s => s.JobAddUpdateFormData);
}

export function getEmployeeJobHistoryForSelectedId(state$: Observable<EmployeeState>): Observable<JobHistory> {
    return state$.select(s => s.JobAddUpdateFormData);
}

export function getDeleteEmployeeSalaryHistoryStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.IsSalaryHistoryDeleteInProgress);
}

export function getDeleteEmployeeJobHistoryStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.IsJobHistoryDeleteInProgress);
}

export function getSalaryHistoryAddUpdateInProgressStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.IsSalaryHistoryAddUpdateInProgress);
}

export function getJobHistoryAddUpdateInProgressStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.IsJobHistoryAddUpdateInProgress);
}

export function populateSalaryHistoryDateForUpdateStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.fetchSalaryHistoryDataLoading);
}

export function populateJobHistoryDateForUpdateStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.fetchJobHistoryDataLoading);
}

// employee contacts state - end

// employee education history - start
export function educationHistoryListDataLoadStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.HasEducationHistoryLoaded);
}
export function getEmployeeEducationHistoryList(state$: Observable<EmployeeState>): Observable<Immutable.List<EducationDetails>> {
    return state$.select(s => s.EducationHistoryList && Immutable.List<EducationDetails>(s.EducationHistoryList.Entities));
}
export function getEmployeeEducationHistoryListTotalCount(state$: Observable<EmployeeState>): Observable<number> {
    return state$.select(s => s && s.EducationHistoryListTotalCount);
}
export function getEmployeeEducationHistoryListDataTableOptions(state$: Observable<EmployeeState>): Observable<DataTableOptions> {
    return state$.select(s => s.EducationHistoryList && s.EducationHistoryList.PagingInfo && s.EducationHistoryApiRequest && extractDataTableOptions(s.EducationHistoryList.PagingInfo, s.EducationHistoryApiRequest.SortBy));
}
export function getEmployeeEducationHistoryProgressStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.IsEducationHistoryAddUpdateInProgress);
}
export function getEmployeeEducationHistoryGetStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.EducationHistoryGetStatus);
}
// employee education history - end

// employee education history - start
export function qualificationHistoryListDataLoadStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.HasQualificationHistoryLoaded);
}
export function getEmployeeQualificationHistoryList(state$: Observable<EmployeeState>): Observable<Immutable.List<TrainingDetails>> {
    return state$.select(s => s.QualificationHistoryList && Immutable.List<TrainingDetails>(s.QualificationHistoryList.Entities));
}
export function getEmployeeQualificationHistoryListTotalCount(state$: Observable<EmployeeState>): Observable<number> {
    return state$.select(s => s && s.QualificationHistoryListTotalCount);
}
export function getEmployeeQualificationHistoryListDataTableOptions(state$: Observable<EmployeeState>): Observable<DataTableOptions> {
    return state$.select(s => s.QualificationHistoryList && s.QualificationHistoryApiRequest && extractDataTableOptions(s.QualificationHistoryList.PagingInfo, s.QualificationHistoryApiRequest.SortBy));
}
export function getEmployeeQualificationHistoryProgressStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.IsQualificationHistoryAddUpdateInProgress);
}
export function getEmployeeQualificationHistoryGetStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.QualificationHistoryGetStatus);
}
// employee education history - end

// employee vehicle info state selectors - start

export function getEmployeeVehiclesList(state$: Observable<EmployeeState>): Observable<Immutable.List<VehicleDetails>> {
    return state$.select(s => s.VehiclesList && Immutable.List<VehicleDetails>(s.VehiclesList));
}

export function getEmployeeVehiclesCount(state$: Observable<EmployeeState>): Observable<number> {
    return state$.select(s => s.VehiclesList && s.VerhiclePagingInfo.TotalCount);
}

export function getEmployeeVehiclesDataTableOptions(state$: Observable<EmployeeState>): Observable<DataTableOptions> {
    return state$.select(s => s.VerhiclePagingInfo && s.VehicleSortInfo && extractDataTableOptions(s.VerhiclePagingInfo, s.VehicleSortInfo));
}

export function getEmployeeVehicleInfoGetById(state$: Observable<EmployeeState>): Observable<VehicleDetails> {
    return state$.select(s => s.CurrentVehicle);
}

export function addOrUpdateEmployeeVehicleInfo(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.IsVehiclesInformationAddUpdateInProgress);
}

export function getHasVehiclesInformationLoaded(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.HasVehiclesInformationLoaded);
}

export function deleteEmployeeVehicleInfo(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.IsVehicleInformationDeleted);
}

export function getVehicleEngineCCTypes(state$: Observable<EmployeeState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.EngineCCTypes);
}

export function getVehicleFuelTypes(state$: Observable<EmployeeState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.FuelTypes);
}


// employee vehicle info state selectors - end

// employee previous employment history state selectors - start

export function getEmployeePreviousEmploymentHistory(state$: Observable<EmployeeState>): Observable<Immutable.List<PreviousEmployment>> {
    return state$.select(s => s && Immutable.List<PreviousEmployment>(s.PreviousEmploymentHistoryList));
}

export function getEmployeePreviousEmploymentHistoryDataTableOptions(state$: Observable<EmployeeState>): Observable<DataTableOptions> {
    return state$.select(state => state.PreviousEmploymentPagingInfo && state.PreviousEmploymentSortInfo && extractDataTableOptions(state.PreviousEmploymentPagingInfo, state.PreviousEmploymentSortInfo));
}

export function getEmployeePreviousEmploymentLoaded(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(state => state.HasPreviousEmploymentLoaded);
}


// export function getEmployeePreviousEmploymentHistoryRowsCount(state$: Observable<EmployeeState>): Observable<number> {
//     return state$.select(s => s && s.PreviousEmploymentPagingInfo && s.PreviousEmploymentPagingInfo.Count);
// }

// export function getEmployeePreviousEmploymentHistoryCurrentPage(state$: Observable<EmployeeState>): Observable<number> {
//     return state$.select(s => s && s.PreviousEmploymentPagingInfo && s.PreviousEmploymentPagingInfo.PageNumber);
// }

export function getEmployeePreviousEmploymentHistoryTotalCount(state$: Observable<EmployeeState>): Observable<number> {
    return state$.select(s => s && s.PreviousEmploymentPagingInfo && s.PreviousEmploymentPagingInfo.TotalCount);
}

export function addOrUpdateEmployeePreviousEmploymentHistory(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.IsPreviousEmploymentAddUpdateInProgress);
}

export function removeEmployeePreviousEmploymentHistory(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.IsPreviousEmploymentRemoveInProgress);
}

// employee previous employment history state selectors - end

// employee training history - start
export function trainingHistoryListDataLoadStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.HasTrainingHistoryLoaded);
}
export function getEmployeeTrainingHistoryList(state$: Observable<EmployeeState>): Observable<Immutable.List<TrainingUserCourseModule>> {
    return state$.select(s => s.TrainingHistoryList && Immutable.List<TrainingUserCourseModule>(s.TrainingHistoryList.Entities));
}

export function getEmployeeTrainingHistoryListTotalCount(state$: Observable<EmployeeState>): Observable<number> {
    return state$.select(s => s && s.TrainigHistoryListTotalCount);
}

export function getEmployeeTrainingHistoryListDataTableOptions(state$: Observable<EmployeeState>): Observable<DataTableOptions> {
    return state$.select(s => s.TrainingHistoryList && s.TrainingHistoryList.PagingInfo && extractDataTableOptions(s.TrainingHistoryList.PagingInfo, s.TrainingHistoryApiRequest.SortBy));
}

export function getEmployeeTrainingHistoryProgressStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.IsTrainingHistoryAddUpdateInProgress);
}
export function getEmployeeTrainingHistoryGetStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.TrainingHistoryGetStatus);
}
// employee training history - end

// bank details : start

export function getEmployeeBankDetailsListDataLoadStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.HasBankDetailsListLoaded);
}
export function getEmployeeBankDetailsList(state$: Observable<EmployeeState>): Observable<Immutable.List<BankDetails>> {
    return state$.select(s => s.BankDetailsList && Immutable.List<BankDetails>(s.BankDetailsList));
}

export function getEmployeeBankDetailsListTotalCount(state$: Observable<EmployeeState>): Observable<number> {
    return state$.select(s => s && s.BankDetailsListTotalCount);
}

export function getEmployeeBankDetailsListDataTableOptions(state$: Observable<EmployeeState>): Observable<DataTableOptions> {
    return state$.select(s => s.BankDetailsList && s.BankDetailsPagingInfo && s.BankApiRequest && extractDataTableOptions(s.BankDetailsPagingInfo, s.BankApiRequest.SortBy));
}

export function getEmployeeBankDetailsProgressStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.IsBankDetailsAddUpdateInProgress);
}
export function getEmployeeBankDetailsGetStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.BankDetailsGetStatus);
}

// bank details : end

//Employee timeline
export function timelineDataLoadStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.HasTimelineDataLoaded);
}
export function getEmployeeTimelineData(state$: Observable<EmployeeState>): Observable<Immutable.List<Timeline>> {
    return state$.select(state => state && Immutable.List(state.TimelineData));
}

export function getSelectedEmployeeEvent(state$: Observable<EmployeeState>): Observable<EmployeeEvent> {
    return state$.select(s => s.SelectedEmployeeEvent);
}
export function getEmployeeTimelineTotalCount(state$: Observable<EmployeeState>): Observable<number> {
    return state$.select(state => state.TimeLinePagingInfo && state.TimeLinePagingInfo.TotalCount);
}

export function getEmployeeTimelineDataTableOption(state$: Observable<EmployeeState>): Observable<DataTableOptions> {
    return state$.select(state => state.TimeLinePagingInfo && state.TimeLineSortInfo && extractDataTableOptions(state.TimeLinePagingInfo,state.TimeLineSortInfo));
}
//End of employee timeline 

// employee job details - start
export function getEmployeeJobDetailsDataLoadStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.HasJobDetailsLoaded);
}

export function employeeHolidayWorkingProfileLoadStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.HasEmployeeHolidayWorkingProfileDataLoaded);
}

export function employeeHolidayWorkingProfile(state$: Observable<EmployeeState>): Observable<EmployeeHolidayWorkingProfile> {
    return state$.select(s => s.HolidayWorkingProfile);
}


export function getEmployeeJobDetails(state$: Observable<EmployeeState>): Observable<EmployeeJobDetails> {
    return state$.select(s => s.JobDetails);
}
export function getEmployeeJobDetailsProgressStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.IsJobDetailsUpdateInProgress);
}

export function getEmployeeOptionsProgressStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.IsOptionsUpdateInProgress);
}

export function getEmployeeLastUpdated(state$: Observable<EmployeeState>): Observable<LastUpdated> {
    return state$.select(s => s.LastUpdated);
}


export function getSelectedEmployeeAdminDetails(state$: Observable<EmployeeState>): Observable<UserAdminDetails> {
    return state$.select(s => s && s.EmployeeAdminDetails);
}

export function getUserStatusUpdateResult(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(state => state && state.HasUserStatusUpdated);
}

export function getEmployeeRemovalProgressStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.IsEmployeeRemoveInProgress);
}

export function checkIsDuplicateEmail(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(state => state && state.IsDuplicateEmail);
}

export function getUnAssociatedUsers(state$: Observable<EmployeeState>): Observable<User[]> {
    return state$.select(state => state && state.UnAssociatedUsersList);
}


export function getEmployeeAdminDetailsStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s.HasAdminDetailsLoaded);
}

export function getPayrollLoaded(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(s => s && s.hasEmployeePayrollLoaded);
}

export function getPayRoll(state$: Observable<EmployeeState>): Observable<EmployeePayrollDetails> {
    return state$.select(state => state && state.employeePayrollDetails);
}

export function employeeLeaverEventDetailsLoadStatus(state$: Observable<EmployeeState>): Observable<boolean> {
    return state$.select(state => state && state.hasLeaverEventDetailLoaded);
}

export function employeeLeaverEventDetails(state$: Observable<EmployeeState>): Observable<any> {
    return state$.select(state => state && state.employeeLeaverDetails);
}
