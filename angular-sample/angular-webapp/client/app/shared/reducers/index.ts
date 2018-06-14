import { compose } from '@ngrx/core/compose';
import { RouterState } from '@ngrx/router-store';
import * as fromRouter from '@ngrx/router-store';
import { ActionReducer, combineReducers } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';

import { CalendarState } from '../../calendar/reducers/calendar.reducer';
import * as fromCalendar from '../../calendar/reducers/calendar.reducer';
import { ChecklistState } from '../../checklist/reducers/checklist.reducer';
import * as fromChecklist from '../../checklist/reducers/checklist.reducer';
import { CompanyBulkPasswordResetState } from '../../company/bulk-password-reset/reducers/bulk-password-reset.reducer';
import * as fromCompanyBulkPasswordReset from '../../company/bulk-password-reset/reducers/bulk-password-reset.reducer';
import { ManageDepartmentState } from '../../company/manage-departments/reducers/manage-departments.reducer';
import * as fromManageDepartmentState from '../../company/manage-departments/reducers/manage-departments.reducer';
import * as fromSite from '../../company/sites/reducers/sites.reducer';
import { SiteState } from '../../company/sites/reducers/sites.reducer';
import { CompanyUserState } from '../../company/user/reducers/user.reducer';
import * as fromCompanyUser from '../../company/user/reducers/user.reducer';
import * as fromYearEndProcedures from '../../company/yearendprocedures/reducers/yearendprocedure-reducer';
import * as fromConstructionPhasePlan from '../../construction-phase-plans/reducers/construction-phase-plans.reducer';
import { ConstructionPhasePlanState } from '../../construction-phase-plans/reducers/construction-phase-plans.reducer';
import * as fromCoshhInventory from '../../coshh-inventory/reducers/coshh-inventory.reducers';
import { COSHHInventoryState } from '../../coshh-inventory/reducers/coshh-inventory.reducers';
import * as contractPersonalisation from '../../document/contract-personalisation/reducers/contract-personalisation.reducers';
import {
    EmployeeContractPersonalisationState,
} from '../../document/contract-personalisation/reducers/contract-personalisation.reducers';
import * as fromDocumentReview from '../../document/document-review/reducers/document-review.reducer';
import { DocumentsFolder } from '../../document/models/document';
import { DocumentsState } from '../../document/reducers/document.reducer';
import * as fromDocuments from '../../document/reducers/document.reducer';
import * as fromDocumentInformationBar from '../../document/reducers/information-bar-reducer';
import { DocumentInformationBarState } from '../../document/reducers/information-bar-reducer';
import { DelegationState } from '../../employee/delegation/reducers/delegation.reducer';
import * as fromDelegation from '../../employee/delegation/reducers/delegation.reducer';
import * as fromEmployeeBulkUpdate from '../../employee/employee-bulkupdate/reducers/employee-bulkupdate.reducer';
import { EmployeeGroupState } from '../../employee/employee-group/reducers/employee-group.reducers';
import * as fromEmployeeImport from '../../employee/employee-import/reducers/employee-import.reducer';
import * as fromEmployeeManage from '../../employee/employee-management/reducers/employee-manage.reducer';
import { EmployeeManageState } from '../../employee/employee-management/reducers/employee-manage.reducer';
import { EmployeeState } from '../../employee/reducers/employee.reducer';
import * as fromEmployee from '../../employee/reducers/employee.reducer';
import { HelpState } from '../../help/reducers/help.reducer';
import { AbsenceTypeState } from '../../holiday-absence/absencetype/reducers/absencetype.reducer';
import * as fromAbsenceType from '../../holiday-absence/absencetype/reducers/absencetype.reducer';
import * as fromHolidayAbsenceRequests from '../../holiday-absence/reducers/holiday-absence-requests.reducer';
import * as fromHolidayAbsence from '../../holiday-absence/reducers/holiday-absence.reducers';
import { InformationBarState } from '../../home/reducers/information-bar.reducer';
import * as fromInformationBar from '../../home/reducers/information-bar.reducer';
import * as fromNews from '../../home/reducers/news.reducer';
import * as fromReferral from '../../home/reducers/referral.reducer';
import * as fromServiceReport from '../../home/reducers/service-reporting.reducer';
import * as fromTasksInfo from '../../home/reducers/tasks.reducer';
import * as fromTodaysOverview from '../../home/reducers/todays-overview.reducer';
import * as fromWhatsNew from '../../home/reducers/whats-new.reducer';
import { WhatsNewState } from '../../home/reducers/whats-new.reducer';
import * as fromIncidentLog from '../../incident-log/reducers/incident-log.reducers';
import { IncidentLogState } from '../../incident-log/reducers/incident-log.reducers';
import { PlantAndEquipmentState } from '../../method-statements/plantandequipment/reducer/plantandequipment.reducer';
import * as fromPlantAndEquipmentState from '../../method-statements/plantandequipment/reducer/plantandequipment.reducer';
import * as fromProcedure from '../../method-statements/procedures/reducers/procedure.reducer';
import { ProcedureState } from '../../method-statements/procedures/reducers/procedure.reducer';
import { ReportsState } from '../../report/reducers/report-reducers';
import * as fromReports from '../../report/reducers/report-reducers';
import { ConsultantState } from '../../root-module/reducers/consultants.reducer';
import * as fromConsultantInfo from '../../root-module/reducers/consultants.reducer';
import * as fromMenu from '../../root-module/reducers/menu.reducer';
import { MenuState } from '../../root-module/reducers/menu.reducer';
import * as fromNotification from '../../root-module/reducers/notifications.reducer';
import * as fromOnBoarding from '../../root-module/reducers/onboarding.reducer';
import * as fromSearchState from '../../root-module/reducers/search.reducer';
import { SearchState } from '../../root-module/reducers/search.reducer';
import * as fromTaskAdd from '../../task/reducers/task-add.reducer';
import { TaskAddState } from '../../task/reducers/task-add.reducer';
import * as fromTaskHeadBanner from '../../task/reducers/task-information-bar.reducer';
import { TaskInformationBannerState } from '../../task/reducers/task-information-bar.reducer';
import * as fromTasksList from '../../task/reducers/task-list.reducer';
import { TaskUpdateState } from '../../task/reducers/task-update.reducer';
import * as fromTaskUpdate from '../../task/reducers/task-update.reducer';
import * as fromTrainingList from '../../training/reducers/training-list.reducer';
import { TrainingListState } from '../../training/reducers/training-list.reducer';
import * as fromTrainingCoursesFromTrainings from '../../training/training-courses/reducers/training-courses.reducer';
import { TrainingCourseState } from '../../training/training-courses/reducers/training-courses.reducer';
import * as fromTrainingReportsFromTrainings from '../../training/training-reports/reducers/training-report.reducer';
import { Identity } from '../models/identity';
import * as fromCompany from '../reducers/company.reducer';
import * as fromUserIdentity from '../reducers/identity.reducer';
import * as fromLookup from '../reducers/lookup.reducer';
import * as fromTrainingCourse from '../reducers/training-course.reducer';
import { NonWorkingDaysState } from './../../company/nonworkingdaysandbankholidays/reducers/nonworkingdays-reducer';
import * as fromNonWorkingDays from './../../company/nonworkingdaysandbankholidays/reducers/nonworkingdays-reducer';
import * as fromCurrentCompany from './../../company/reducers/current-company.reducer';
import { CurrentCompanyState } from './../../company/reducers/current-company.reducer';
import * as fromManageCPP from './../../construction-phase-plans/manage-construction-plan/reducers/mange-cpp.reducer';
import { ManageCPPState } from './../../construction-phase-plans/manage-construction-plan/reducers/mange-cpp.reducer';
import { CitationDraftsState } from './../../document/citation-drafts-documents/reducers/citation-drafts.reducer';
import * as fromCitationDrafts from './../../document/citation-drafts-documents/reducers/citation-drafts.reducer';
import { CompanyDocumentsState } from './../../document/company-documents/reducers/company-documents-reducer';
import * as fromCompanyDocuments from './../../document/company-documents/reducers/company-documents-reducer';
import { ContractsState } from './../../document/company-documents/reducers/contracts.reducer';
import * as fromContracts from './../../document/company-documents/reducers/contracts.reducer';
import * as fromHandbooks from './../../document/company-documents/reducers/handbooks.reducer';
import { HandbooksState } from './../../document/company-documents/reducers/handbooks.reducer';
import * as fromDocumentDetails from './../../document/document-details/reducers/document-details.reducer';
import { DocumentDetailsState } from './../../document/document-details/reducers/document-details.reducer';
import * as fromSharedDocuments from './../../document/reducers/shared-documents.reducer';
import { SharedDocumentsState } from './../../document/reducers/shared-documents.reducer';
import * as fromUsefulDocs from './../../document/usefuldocuments-templates/reducers/usefuldocs.reducer';
import { UsefulDocsState } from './../../document/usefuldocuments-templates/reducers/usefuldocs.reducer';
import * as fromEmployeeAdd from './../../employee/employee-add/reducers/employee-add.reducer';
import { EmployeeAddState } from './../../employee/employee-add/reducers/employee-add.reducer';
import * as fromEmployeeGroups from './../../employee/employee-group/reducers/employee-group.reducers';
import * as fromHelp from './../../help/reducers/help.reducer';
import * as fromKeyDocuments from './../../home/reducers/key-documents-reducer';
import { KeyDocumentsState } from './../../home/reducers/key-documents-reducer';
import { MyTrainingState } from './../../home/reducers/my-training-reducer';
import * as fromMyTrainings from './../../home/reducers/my-training-reducer';
import * as fromIncident from './../../incident-log/incident/reducers/incident.reducer';
import { IncidentState } from './../../incident-log/incident/reducers/incident.reducer';
import * as fromManageMethodStatements from './../../method-statements/manage-methodstatements/reducer/manage-methodstatement.reducer';
import {
    ManageMethodStatementState,
} from './../../method-statements/manage-methodstatements/reducer/manage-methodstatement.reducer';
import * as fromMethodStatementsState from './../../method-statements/reducers/methodstatements.reducer';
import { MethodStatementsState } from './../../method-statements/reducers/methodstatements.reducer';
import * as fromRiskAssessments from './../../risk-assessment/reducers/risk-assessment-reducer';
import * as fromRASharedState from './../../risk-assessment/risk-assessment-shared/reducers/ra-shared-reducer';
import { RASharedState } from './../../risk-assessment/risk-assessment-shared/reducers/ra-shared-reducer';
import * as fromCompanyStructure from './../../root-module/reducers/company-structure.reducer';
import { NotificationState } from './../../root-module/reducers/notifications.reducer';
import { AtlasApiRequest, AtlasApiRequestWithParams } from './../models/atlas-api-response';
import * as fromUser from './user.reducer';
import { IconManagementState } from './../../risk-assessment/icon-management/reducers/icon-management-reducer';
import * as fromIconManagementState from './../../risk-assessment/icon-management/reducers/icon-management-reducer';

/**
 * Each reducer is like a table in a database. This means
 * our top level state interface is just a map of keys to inner state types.
 */
export interface State {
    userIdentity: Identity;
    router: fromRouter.RouterState;
    lookupState: fromLookup.LookupState;
    commonState: fromCompany.CompanyState;
    employeeState: EmployeeState;
    todaysOverviewState: fromTodaysOverview.TodaysOverviewState<string>;
    menuState: MenuState;
    consultantState: ConsultantState;
    tasksInfoSate: fromTasksInfo.TasksInfoState;
    keyDocuments: KeyDocumentsState;
    informationBarState: InformationBarState;
    myTrainings: MyTrainingState;
    calendarState: CalendarState;
    notificationIndicator: NotificationState;
    tasksListState: fromTasksList.TasksListState;
    taskInformationBannerState: TaskInformationBannerState;
    taskAddState: TaskAddState;
    taskUpdateState: TaskUpdateState;
    documentsState: DocumentsState;
    documentInformationBar: fromDocumentInformationBar.DocumentInformationBarState;
    holidayAbsenceState: fromHolidayAbsence.HolidayAbsenceState;
    sharedDocuments: SharedDocumentsState;
    trainingCourseState: fromTrainingCourse.TrainingCourseState;
    trainingCourseFromTrainingsState: fromTrainingCoursesFromTrainings.TrainingCourseState;
    trainingReportsState: fromTrainingReportsFromTrainings.TrainingReportsState;
    employeeGroupState: EmployeeGroupState;
    companyUserState: CompanyUserState;
    userState: fromUser.UserState;
    trainingListState: TrainingListState;
    employeeManageState: EmployeeManageState;
    reportsState: ReportsState;
    delegationState: DelegationState;
    procedureState: ProcedureState;
    holidayAbsenceRequestsState: fromHolidayAbsenceRequests.HolidayAbsenceRequestsState;
    companyBulkPasswordResetState: CompanyBulkPasswordResetState;
    incidentLogState: IncidentLogState;
    nonWorkingDaysState: fromNonWorkingDays.NonWorkingDaysState;
    employeeAddState: EmployeeAddState;
    serviceReportState: fromServiceReport.ServiceReportInformationState;
    newsState: fromNews.NewsState;
    siteState: SiteState;
    checklistState: ChecklistState;
    employeeImportState: fromEmployeeImport.EmployeeImportState;
    referralState: fromReferral.ReferralState;
    absenceTypeState: AbsenceTypeState;
    incidentState: IncidentState;
    citationDraftsState: CitationDraftsState;
    usefulDocsState: UsefulDocsState;
    handbooksState: HandbooksState;
    contractsState: ContractsState;
    companyDocumentsState: CompanyDocumentsState;
    employeeContractPersonalisationState: EmployeeContractPersonalisationState;
    manageDepartmentState: ManageDepartmentState;
    currentCompanyState: CurrentCompanyState;
    documentDetailsState: DocumentDetailsState;
    documentReviewState: fromDocumentReview.ReviewDocumentState;
    constructionPhasePlanState: ConstructionPhasePlanState;
    onBoardingState: fromOnBoarding.OnBoardingState;
    employeeBulkUpdateState: fromEmployeeBulkUpdate.EmployeeBulkUpdateState;
    coshhInventoryState: COSHHInventoryState;
    methodStatementsState: MethodStatementsState;
    plantAndEquipmentState: PlantAndEquipmentState;
    manageMethodStatementState: ManageMethodStatementState;
    manageCPPState: ManageCPPState;
    riskAssessmentState: fromRiskAssessments.RiskAssessmentState;
    raSharedState: RASharedState;
    yearEndProcedureState: fromYearEndProcedures.YearEndProcedureState;
    helpState: HelpState;
    companyStructureState: fromCompanyStructure.CompanyStructureState;
    searchState: SearchState;
    whatsNewState: WhatsNewState;
    iconManagementState: IconManagementState;
}

/**
 * Because metareducers take a reducer function and return a new reducer,
 * we can use our compose helper to chain them together. Here we are
 * using combineReducers to make our top level reducer, and then
 * wrapping that in storeLogger. Remember that compose applies
 * the result from right to left.
 */
export const reducers = {
    userIdentity: fromUserIdentity.reducer,
    router: fromRouter.routerReducer,
    menuState: fromMenu.reducer,
    lookupState: fromLookup.lookupReducer,
    commonState: fromCompany.companyReducer,
    employeeState: fromEmployee.employeeReducer,
    consultantState: fromConsultantInfo.reducer,
    tasksInfoSate: fromTasksInfo.reducer,
    todaysOverviewState: fromTodaysOverview.reducer,
    taskInformationBannerState: fromTaskHeadBanner.reducer,
    taskAddState: fromTaskAdd.reducer,
    taskUpdateState: fromTaskUpdate.reducer,
    informationBarState: fromInformationBar.informationBarReducer,
    keyDocuments: fromKeyDocuments.reducer,
    calendarState: fromCalendar.reducer,
    tasksListState: fromTasksList.reducer,
    myTrainings: fromMyTrainings.reducer,
    notificationIndicator: fromNotification.reducer,
    documentsState: fromDocuments.reducer,
    documentInformationBar: fromDocumentInformationBar.reducer,
    holidayAbsenceState: fromHolidayAbsence.reducer,
    sharedDocuments: fromSharedDocuments.reducer,
    trainingCourseState: fromTrainingCourse.trainingCourseReducer,
    companyUserState: fromCompanyUser.userReducer,
    userState: fromUser.reducer,
    trainingListState: fromTrainingList.reducer,
    employeeManageState: fromEmployeeManage.employeeManageReducer,
    employeeGroupState: fromEmployeeGroups.employeeGroupreducer,
    trainingCourseFromTrainingsState: fromTrainingCoursesFromTrainings.TrainingCoursereducer,
    trainingReportsState: fromTrainingReportsFromTrainings.TrainingReportsreducer,
    reportsState: fromReports.reducer,
    holidayAbsenceRequestsState: fromHolidayAbsenceRequests.reducer,
    delegationState: fromDelegation.reducer,
    companyBulkPasswordResetState: fromCompanyBulkPasswordReset.userReducer,
    incidentLogState: fromIncidentLog.incidentLogReducer,
    nonWorkingDaysState: fromNonWorkingDays.reducer,
    employeeAddState: fromEmployeeAdd.employeeAddReducer,
    serviceReportState: fromServiceReport.reducer,
    newsState: fromNews.reducer,
    siteState: fromSite.reducer,
    checklistState: fromChecklist.reducer,
    employeeImportState: fromEmployeeImport.employeeImportReducer,
    referralState: fromReferral.reducer,
    absenceTypeState: fromAbsenceType.reducer,
    incidentState: fromIncident.incidentReducer,
    documentReviewState: fromDocumentReview.ReviewDocumentReducer,
    citationDraftsState: fromCitationDrafts.reducer,
    currentCompanyState: fromCurrentCompany.CompanyReducer,
    usefulDocsState: fromUsefulDocs.reducer,
    handbooksState: fromHandbooks.reducer,
    contractsState: fromContracts.reducer,
    companyDocumentsState: fromCompanyDocuments.reducer,
    employeeContractPersonalisationState: contractPersonalisation.reducer,
    manageDepartmentState: fromManageDepartmentState.reducer,
    documentDetailsState: fromDocumentDetails.reducer,
    procedureState: fromProcedure.reducer,
    constructionPhasePlanState: fromConstructionPhasePlan.ConstructionPhasePlanreducer,
    onBoardingState: fromOnBoarding.reducer,
    employeeBulkUpdateState: fromEmployeeBulkUpdate.employeeBulkUpdateReducer,
    coshhInventoryState: fromCoshhInventory.coshhInventoryReducer,
    plantAndEquipmentState: fromPlantAndEquipmentState.plantAndEquipmentReducer,
    methodStatementsState: fromMethodStatementsState.reducer,
    manageMethodStatementState: fromManageMethodStatements.reducer,
    manageCPPState: fromManageCPP.reducer,
    raSharedState: fromRASharedState.reducer,
    riskAssessmentState: fromRiskAssessments.reducer,
    yearEndProcedureState: fromYearEndProcedures.YearEndProcedureReducer,
    helpState: fromHelp.HelpReducer,
    companyStructureState: fromCompanyStructure.reducer,
    searchState: fromSearchState.reducer,
    whatsNewState: fromWhatsNew.reducer,
    iconManagementState: fromIconManagementState.reducer
};

const combineReducer: ActionReducer<State> = combineReducers(reducers);

export function reducer(state: any, action: any) {
    return combineReducer(state, action);
}

// UserIdentity functions
export function getUserIdentity(state$: Observable<State>) {
    return state$.select(state => state.userIdentity);
}

export const getToken = compose(fromUserIdentity.getToken, getUserIdentity);
// End of UserIdentity functions

// Menu functions
export function getMenuState(state$: Observable<State>) {
    return state$.select(state => state.menuState);
}

export const getMenuData = compose(fromMenu.getMenuData, getMenuState);
// End menu functions

// Employee personal functions


export function getEmployeeState(state$: Observable<State>) {
    return state$.select(state => state.employeeState);
}
//last updated state
export const getEmployeeLastUpdatedData = compose(fromEmployee.getEmployeeLastUpdated, getEmployeeState);
// employee personal tab states - start
export const getEmployeeId = compose(fromEmployee.employeeEmployeId, getEmployeeState);
export const getEmployeePersonalData = compose(fromEmployee.employeePersonalData, getEmployeeState);

export const getEmployeePersonalLoadingState = compose(fromEmployee.employeePersonalDataLoadStatus, getEmployeeState);

export const getEmployeeAge = compose(fromEmployee.employeeAge, getEmployeeState);
// employee personal tab states - end

// employee information states - start
export const getEmployeeInformationData = compose(fromEmployee.employeeInformationData, getEmployeeState);

export const getEmployeeInformationLoadStatus = compose(fromEmployee.employeeInformationLoadStatus, getEmployeeState);
// employee information states - end

// employee information states - start
export const getEmployeeStatisticsData = compose(fromEmployee.employeeStatisticsData, getEmployeeState);

export const getEmployeeStatisticsLoadStatus = compose(fromEmployee.employeeStatisticsLoadStatus, getEmployeeState);
// employee information states - end
//
export const getEmployeeBenefitsSchemeStatus = compose(fromEmployee.getEmployeeBenefitsSchemeStatus, getEmployeeState);
export const getEmployeeBenefitSaveStatus = compose(fromEmployee.getEmployeeBenefitSaveStatus, getEmployeeState);
export const getPayrollLoadedData = compose(fromEmployee.getPayrollLoaded, getEmployeeState);
export const getPayRollData = compose(fromEmployee.getPayRoll, getEmployeeState);
//
// employee states - end
export const getEmployeePendingStatus = compose(fromEmployee.employeePendingStatus, getEmployeeState);

export const getEmployeeUpdateStatus = compose(fromEmployee.employeeUpdateStatus, getEmployeeState);

export const getEployeeSelectedTab = compose(fromEmployee.employeeSelectedTab, getEmployeeState);
// employee states - end

// Employee contacts functions - start
export function getEmployeeContactsState(state$: Observable<State>) {
    return state$.select(state => state.employeeState);
}
export const getEmployeeContactsData = compose(fromEmployee.getEmployeeContactsData, getEmployeeContactsState);
export const getEmployeeContactsLoadingState = compose(fromEmployee.employeeContactsDataLoadStatus, getEmployeeContactsState);

export const getEmployeeContactUpdateStatus = compose(fromEmployee.getEmployeeContactUpdateStatus, getEmployeeState);

export const getEmployeeEmergencyContacts = compose(fromEmployee.getEmployeeEmergencyContacts, getEmployeeContactsState);
export const getEmployeeEmergencyContactsTotalCount = compose(fromEmployee.getEmployeeEmergencyContactsTotalCount, getEmployeeContactsState);
export const getEmployeeEmergencyContactsDataTableOptions = compose(fromEmployee.getEmployeeEmergencyContactsDataTableOptions, getEmployeeContactsState);

export const getEmployeeEmergencyContactUpdateStatus = compose(fromEmployee.getEmployeeEmergencyContactUpdateStatus, getEmployeeState);

export const getEmployeeEmergencyContactGetStatus = compose(fromEmployee.getEmployeeEmergencyContactGetStatus, getEmployeeState);
export const getEmployeeEmergencyContactsLoadData = compose(fromEmployee.getEmployeeEmergencyContactsLoad, getEmployeeState)

export const getEmployeeEmergencyContactsData = compose(fromEmployee.getEmployeeEmergencyContactsData, getEmployeeState);

// Employee contacts functions - start
export function getEmployeeSalaryHistoryState(state$: Observable<State>) {
    return state$.select(state => state.employeeState);
}
export const getEmployeeSalaryHistoryData = compose(fromEmployee.getEmployeeSalaryHistoryData, getEmployeeSalaryHistoryState);
export const getEmployeeSalaryHistoryDataTableOptions = compose(fromEmployee.getEmployeeSalaryHistoryDataTableOptions, getEmployeeSalaryHistoryState);
export const getEmployeeSalaryHistoryTotalCount = compose(fromEmployee.getEmployeeSalaryHistoryTotalCount, getEmployeeSalaryHistoryState);
export const getEmployeeSalaryHistoryLoadedData = compose(fromEmployee.getEmployeeSalaryHistoryLoaded, getEmployeeState);

//jobHistory start
export const getEmployeeJobHistoryData = compose(fromEmployee.getEmployeeJobHistoryData, getEmployeeSalaryHistoryState);
export const getEmployeeJobHistoryTotalCount = compose(fromEmployee.getEmployeeJobHistoryTotalCount, getEmployeeSalaryHistoryState);
// export const getEmployeeJobHistoryRowsCount = compose(fromEmployee.getEmployeeJobHistoryRowsCount, getEmployeeSalaryHistoryState);
// export const getEmployeeJobHistoryCurrentPage = compose(fromEmployee.getEmployeeJobHistoryCurrentPage, getEmployeeSalaryHistoryState);
export const getEmployeeJobHistoryDataTableOptions = compose(fromEmployee.getEmployeeJobHistoryDataTableOptions, getEmployeeSalaryHistoryState);
export const getEmployeeJobHistoryLoadedData = compose(fromEmployee.getEmployeeJobHistoryLoaded, getEmployeeState);

//end jobHistory
export const saveEmployeeSalary = compose(fromEmployee.saveEmployeeSalary, getEmployeeSalaryHistoryState);
export const getEmployeeSalaryHistoryForSelectedId = compose(fromEmployee.getEmployeeSalaryHistoryForSelectedId, getEmployeeSalaryHistoryState);
export const getEmployeeJobHistoryForSelectedId = compose(fromEmployee.getEmployeeJobHistoryForSelectedId, getEmployeeSalaryHistoryState);

export const getDeleteEmployeeSalaryHistoryStatus = compose(fromEmployee.getDeleteEmployeeSalaryHistoryStatus, getEmployeeSalaryHistoryState);
export const getDeleteEmployeeJobHistoryStatus = compose(fromEmployee.getDeleteEmployeeJobHistoryStatus, getEmployeeSalaryHistoryState);

export const getSalaryHistoryAddUpdateInProgressStatus = compose(fromEmployee.getSalaryHistoryAddUpdateInProgressStatus, getEmployeeSalaryHistoryState);

export const getJobHistoryAddUpdateInProgressStatus = compose(fromEmployee.getJobHistoryAddUpdateInProgressStatus, getEmployeeSalaryHistoryState);

export const populateSalaryHistoryDateForUpdateStatus = compose(fromEmployee.populateSalaryHistoryDateForUpdateStatus, getEmployeeSalaryHistoryState);
export const populateJobHistoryDateForUpdateStatus = compose(fromEmployee.populateJobHistoryDateForUpdateStatus, getEmployeeSalaryHistoryState);


//...........................

// End Employee contacts functions - end

// End employee functions

// Lookup functions
export function getLookUpState(state$: Observable<State>) {
    return state$.select(state => state.lookupState);
}

export const getCountyData = compose(fromLookup.getCountyData, getLookUpState);
export const getCountyImmutableData = compose(fromLookup.getCountyImmutableData, getLookUpState);
export const getCountyLoadingState = compose(fromLookup.countyDataLoadStatus, getLookUpState);
export const getsectorsData = compose(fromLookup.getsectorsData, getLookUpState);
export const getPPECategoryData = compose(fromLookup.getPPECategoryData, getLookUpState);
export const getPPECategoryGroups = compose(fromLookup.getPPECategoryGroupData, getLookUpState);

export const getCountryData = compose(fromLookup.getCountryData, getLookUpState);
export const getCountryImmutableData = compose(fromLookup.getCountryImmutableData, getLookUpState);
export const getCountryLoadingState = compose(fromLookup.countryDataLoadStatus, getLookUpState);

export const getUserListData = compose(fromLookup.getUserListData, getLookUpState);
export const userListDataLoadStatus = compose(fromLookup.userListDataLoadStatus, getLookUpState);


export const getEmployeeRelationsData = compose(fromLookup.getEmployeeRelationsData, getLookUpState);
export const getEmployeeRelationsLoadingState = compose(fromLookup.employeeRelationsDataLoadStatus, getLookUpState);

export const getAbsenceStatusData = compose(fromLookup.absenceStatusData, getLookUpState);

export const absenceStatusAdjustedImmutableData = compose(fromLookup.absenceStatusAdjustedImmutable, getLookUpState);

export const getAbsenceStatusDataLoadingState = compose(fromLookup.absenceStatusLoadStatus, getLookUpState);
export const getPeriodOptionListData = compose(fromLookup.getPeriodOptionListData, getLookUpState);
export const getPeriodOptionListLoadingStatus = compose(fromLookup.getPeriodOptionListLoadingStatus, getLookUpState);

export const getWorkSpaceTypeListLoadingStatus = compose(fromLookup.getWorkSpaceTypeListLoadingStatus, getLookUpState);
export const getWorkSpaceTypeOptionListData = compose(fromLookup.getWorkSpaceTypeOptionListData, getLookUpState);


export const getEmploymentStatusListLoadingStatus = compose(fromLookup.getEmploymentStatusListLoadingStatus, getLookUpState);
export const getEmploymentStatusOptionListData = compose(fromLookup.getEmploymentStatusOptionListData, getLookUpState);

export const getEmploymentTypeListLoadingStatus = compose(fromLookup.getEmploymentTypeListLoadingStatus, getLookUpState);
export const getEmploymentTypeOptionListData = compose(fromLookup.getEmploymentTypeOptionListData, getLookUpState);
export const getEthnicGroupData = compose(fromLookup.employeeEthnicGroupData, getLookUpState);
export const getEthnicGroupLoadingState = compose(fromLookup.employeeEthnicGroupDataLoadStatus, getLookUpState);


export const getOtcEntityData = compose(fromLookup.otcEntitiesData, getLookUpState);
export const getOtcEntityDataLoadingState = compose(fromLookup.otcEntitiesDataLoadStatus, getLookUpState);

export const getReportCategories = compose(fromLookup.getReportCategories, getLookUpState);

export const getIncidentCategories = compose(fromLookup.incidentCategories, getLookUpState);

export const getMetaData = compose(fromLookup.getMetaData, getLookUpState);

export const getMetaDataExclCompany = compose(fromLookup.getMetaDataExclCompany, getLookUpState);

export const getIncidentTypeData = compose(fromLookup.getIncidentTypeData, getLookUpState);
export const getInjuryTypeData = compose(fromLookup.getInjuryTypeData, getLookUpState);
export const getInjuryTypeImmutableData = compose(fromLookup.getInjuryTypeImmutableData, getLookUpState);
export const getInjuryTypeAutocompleteData = compose(fromLookup.getInjuryTypeAutocompleteData, getLookUpState);
export const getInjuredPartData = compose(fromLookup.getInjuredPartData, getLookUpState);
export const getInjuredPartImmutableData = compose(fromLookup.getInjuredPartImmutableData, getLookUpState);
export const getInjuredPartAutocompleteData = compose(fromLookup.getInjuredPartAutocompleteData, getLookUpState);
export const getWorkProcessData = compose(fromLookup.getWorkProcessData, getLookUpState);
export const getWorkProcessImmutableData = compose(fromLookup.getWorkProcessImmutableData, getLookUpState);
export const getMainFactorData = compose(fromLookup.getMainFactorData, getLookUpState);
export const getMainFactorImmutableData = compose(fromLookup.getMainFactorImmutableData, getLookUpState);

export const getMainIndustriesData = compose(fromLookup.getMainIndustries, getLookUpState);
export const getMainActivitiesData = compose(fromLookup.getMainActivities, getLookUpState);
export const getSubActivitiesData = compose(fromLookup.getSubActivities, getLookUpState);
export const getLocalAuthoritiesData = compose(fromLookup.getLocalAuthorities, getLookUpState);
export const getGeoLocationsData = compose(fromLookup.getGeoLocations, getLookUpState);
export const getHelpAreasData = compose(fromLookup.getHelpAreas, getLookUpState);

export const getStandardHazardIcons = compose(fromLookup.getStandardHazardIcons, getLookUpState);
export const getHasStandardHazardIconsLoaded = compose(fromLookup.getHasStandardHazardsLoaded, getLookUpState);
export const getStandardControlIcons = compose(fromLookup.getStandardControlIcons, getLookUpState);
// End Lookup functions

// common functions
export function getCompanyState(state$: Observable<State>) {
    return state$.select(state => state.commonState);
}

export const canEmployeeViewAbsenceHistory = compose(fromCompany.canEmployeeViewAbsenceHistory, getCompanyState);
export const getSiteData = compose(fromCompany.sitesData, getCompanyState);
export const getSiteWithAddressData = compose(fromCompany.sitesWithAddressData, getCompanyState);
export const getActiveSitesData = compose(fromCompany.activeSitesData, getCompanyState)
export const getsitesImmutableData = compose(fromCompany.sitesImmutableData, getCompanyState);
export const getSiteWithOtherOptions = compose(fromCompany.sitesWithOtherOptions, getCompanyState);
export const getsitesForMultiSelectData = compose(fromCompany.getsitesForMultiSelect, getCompanyState);
export const sitesForClientsImmutableData = compose(fromCompany.sitesForClientsImmutable, getCompanyState);
export const getsitesClientsForMultiSelectData = compose(fromCompany.getsitesClientsForMultiSelect, getCompanyState);
export const getSiteLoadingState = compose(fromCompany.siteDataLoadStatus, getCompanyState);
export const getAllDepartmentsData = compose(fromCompany.getAllDepartmentsData, getCompanyState);
export const getAllEmployeeGroupsData = compose(fromCompany.getAllEmployeeGroupsData, getCompanyState);
export const getAllDepartmentsImmutableData = compose(fromCompany.getAllDepartmentsImmutableData, getCompanyState);
export const getAllDepartmentsForMultiSelectData = compose(fromCompany.getAllDepartmentsForMultiSelect, getCompanyState);

export const getEmployeeGroupsData = compose(fromCompany.getEmployeeGroups, getCompanyState);
export const getEmployeeGroupsImmutableData = compose(fromCompany.getEmployeeGroupsImmutable, getCompanyState);
export const getEmployeeGroupsForMultiSelectData = compose(fromCompany.getEmployeeGroupsForMultiSelect, getCompanyState);


export const getEmployeeSettingsData = compose(fromCompany.employeeSettingsData, getCompanyState);
export const getEmployeeSettingsLoadingState = compose(fromCompany.employeeSettingsLoadStatus, getCompanyState);
export const canAddMyHoliday = compose(fromCompany.canAddMyHoliday, getCompanyState);
export const getFiscalYearsData = compose(fromCompany.fiscalYearsData, getCompanyState);
export const getFiscalYearsLoadingState = compose(fromCompany.fiscalYearsLoadStatus, getCompanyState);

export const getAbsenceTypesData = compose(fromCompany.absenceTypesData, getCompanyState);
export const absenceTypesWithoutDuplicatesData = compose(fromCompany.absenceTypesWithoutDuplicates, getCompanyState);
export const getAbsenceTypesLoadingState = compose(fromCompany.absenceTypesLoadStatus, getCompanyState);


export const getAbsenceTypeList = compose(fromCompany.getAbsenceTypeList, getCompanyState);
export const getAbsenceTypeListTotalCount = compose(fromCompany.getAbsenceTypeListTotalCount, getCompanyState);
export const getAbsenceTypeListDataTableOptions = compose(fromCompany.getAbsenceTypeListDataTableOptions, getCompanyState);



export const getAbsenceSubtypesData = compose(fromCompany.absenceSubtypesData, getCompanyState);
export const getAbsenceSubtypesLoadingState = compose(fromCompany.absenceSubtypesLoadStatus, getCompanyState);

export const getJobTitleOptionListData = compose(fromCompany.getJobTitleOptionListData, getCompanyState);
export const getJobTitleOptionListDataStatus = compose(fromCompany.getJobTitleOptionListDataStatus, getCompanyState);
export const getUsersData = compose(fromCompany.getUsersData, getCompanyState);
export const jobTitleData = compose(fromCompany.jobTitleData, getCompanyState);
export const getUsersLoadingStatus = compose(fromCompany.getUsersLoadingStatus, getLookUpState);


export const getAbsenceCodesData = compose(fromLookup.absenceCodesData, getLookUpState);
export const getAbsenceCodesLoadingState = compose(fromLookup.absenceCodesLoadStatus, getLookUpState);
export const getProcedureGroupsData = compose(fromLookup.getProcedureGroups, getLookUpState);
export const getProcedureGroupListData = compose(fromLookup.getProcedureGroupList, getLookUpState);

export const getAdditionalServiceData = compose(fromLookup.additionalServiceData, getLookUpState);
export const getAdditionalServiceLoadStatus = compose(fromLookup.additionalServiceLoadStatus, getLookUpState);
// End common functions

// ConsultantInfo functions

export function getConsultantInfoState(state$: Observable<State>) {
    return state$.select(state => state.consultantState);
}

export const getConsultantInfoData = compose(fromConsultantInfo.getConsultantData, getConsultantInfoState);

// End ConsultantInfo functions

// Tasks info functions
export function getTasksInfoState(state$: Observable<State>) {
    return state$.select(state => state.tasksInfoSate);
}

export const getTasksInfoData = compose(fromTasksInfo.getTasksInfoData, getTasksInfoState);
// End of Tasks info functions

// Today's Overview functions
export function getTOState(state$: Observable<State>) {
    return state$.select(state => state.todaysOverviewState);
}

export const getTOData = compose(fromTodaysOverview.getTodaysOverviewData, getTOState);

export const getTOLoadingState = compose(fromTodaysOverview.getTodaysOverviewLoadingState, getTOState);
// End Today's Overview functions



// start of key documents functions


// Informationbar functions
export function getInformationbarState(state$: Observable<State>) {
    return state$.select(state => state.informationBarState);
}

export const getInformationBarData = compose(fromInformationBar.getInformationBarData, getInformationbarState);


export const getInfoBarLoadStatus = compose(fromInformationBar.infoBarLoadStatus, getInformationbarState);

// End of information bar funcitons

// start of key documents functions
export function getKeyDocumentsState(state$: Observable<State>) {
    return state$.select(state => state.keyDocuments);
}

export const getKeyDocumentsData = compose(fromKeyDocuments.getkeyDocumentsData, getKeyDocumentsState);

export const getkeyDocumentsLoadingData = compose(fromKeyDocuments.getkeyDocumentsLoadingData, getKeyDocumentsState);

export const getkeyDocumentsIsFirstTimeLoadData = compose(fromKeyDocuments.getkeyDocumentsIsFirstTimeLoadDta, getKeyDocumentsState);

// End of key documents functions

// Start of my trainings functions
export function getMyTrainingState(state$: Observable<State>) {
    return state$.select(state => state.myTrainings);
}

export const getMyTrainingsData = compose(fromMyTrainings.getMyTrainingsData, getMyTrainingState);
export const getMyTrainingsLoadingData = compose(fromMyTrainings.getMyTrainingsLoadingData, getMyTrainingState);
export const getMyTrainingsIsFirstTimeLoadData = compose(fromMyTrainings.getMyTrainingsIsFirstTimeLoadDta, getMyTrainingState);
export const checkMyTeamTrainingTasksExists = compose(fromMyTrainings.checkMyTeamTrainingTasksExists, getMyTrainingState);
// end of my trainings functions

// holiday absence functions
export function getHolidayAbsenceState(state$: Observable<State>) {
    return state$.select(state => state.holidayAbsenceState);
}
export const getEmployeeConfigData = compose(fromHolidayAbsence.employeeConfigurationData, getHolidayAbsenceState);

export const getEmployeeHolidayWorkingProfileData = compose(fromHolidayAbsence.employeeHolidayWorkingProfile, getHolidayAbsenceState);

export const getLoadingStatus = compose(fromHolidayAbsence.getLoadingStatus, getHolidayAbsenceState);
export const getFiscalYearSummary = compose(fromHolidayAbsence.fiscalYearSummary, getHolidayAbsenceState);
export const getFiscalYearSummaryforChart = compose(fromHolidayAbsence.fiscalYearSummaryForChart, getHolidayAbsenceState);

export const getAbsencesFilters = compose(fromHolidayAbsence.getAbsencesFilters, getHolidayAbsenceState);
export const getEmployeeAbsencesList = compose(fromHolidayAbsence.employeeAbsencesList, getHolidayAbsenceState);
export const getEmployeeAbsencesTotalCount = compose(fromHolidayAbsence.employeeAbsencesTotalCount, getHolidayAbsenceState);
export const getEmployeeAbsencesDataTAbleOption = compose(fromHolidayAbsence.employeeAbsencesDataTAbleOption, getHolidayAbsenceState);
export const getAbsencesDelegateInfo = compose(fromHolidayAbsence.getAbsencesDelegateInfo, getHolidayAbsenceState);
export const getEmployeeAbsencesListLoadStatus = compose(fromHolidayAbsence.employeeAbsencesListLoadStatus, getHolidayAbsenceState);
export const getEmployeeAbsence = compose(fromHolidayAbsence.employeeAbsenceData, getHolidayAbsenceState);
export const getEmployeeAbsenceHistory = compose(fromHolidayAbsence.employeeAbsenceHistoryData, getHolidayAbsenceState);
export const getEmployeeAbsenceAddStatus = compose(fromHolidayAbsence.employeeAbsenceAddStatus, getHolidayAbsenceState);
export const getEmployeeAbsenceUpdateStatus = compose(fromHolidayAbsence.employeeAbsenceUpdateStatus, getHolidayAbsenceState);
export const getCurrentSelectedAbsence = compose(fromHolidayAbsence.currentSelectedAbsence, getHolidayAbsenceState);
// end of holiday absence functions

// start of calendar

export function getCalendarState(state$: Observable<State>) {
    return state$.select(state => state.calendarState);
}

export const getEmployeesData = compose(fromCalendar.calendarEmployeesData, getCalendarState);
export const getCalendarEventsData = compose(fromCalendar.calendarEventsData, getCalendarState);
export const getCalendarSearchData = compose(fromCalendar.calendarSearchData, getCalendarState);
export const getCalendarEventsStatus = compose(fromCalendar.calendarEventsState, getCalendarState);
export const getTeamCalendarStatus = compose(fromCalendar.isTeamCalendar, getCalendarState);
export const getCalendarSelectedEmployee = compose(fromCalendar.getSelectedEmployee, getCalendarState);
export const getEmployeeAdminDetails = compose(fromEmployee.getSelectedEmployeeAdminDetails, getEmployeeState);
export const getEmployeeOptionsProgressStatus = compose(fromEmployee.getEmployeeOptionsProgressStatus, getEmployeeState);
export const getEmployeeRemovalProgressStatus = compose(fromEmployee.getEmployeeRemovalProgressStatus, getEmployeeState);
export const getEmployeeLeaverEventDetails = compose(fromEmployee.employeeLeaverEventDetails, getEmployeeState);
export const getEmployeeLeaverEventDetailsLoadStatus = compose(fromEmployee.employeeLeaverEventDetailsLoadStatus, getEmployeeState);

// end of calendar

// Employee statistics

// Tasks list functions
export function getTasksListState(state$: Observable<State>) {
    return state$.select(state => state.tasksListState);
}

export const getTasksListLoadingData = compose(fromTasksList.getTasksListDataLoading, getTasksListState);

export const getTasksListData = compose(fromTasksList.getTasksListData, getTasksListState);

export const getSelectedTaskData = compose(fromTasksList.getSelectedTaskData, getTasksListState);

export const getTaskCategoriesData = compose(fromTasksList.getTaskCategories, getTasksListState);

export const getTaskCategorySelectItems = compose(fromTasksList.getTaskCategorySelectItems, getTasksListState);
export const getTasksListTotalCount = compose(fromTasksList.getTasksListTotalCount, getTasksListState);
export const getTasksListDataTableOptions = compose(fromTasksList.getTasksListDataTableOptions, getTasksListState);

export function getTaskHeadBannerState(state$: Observable<State>) {
    return state$.select(state => state.taskInformationBannerState);
}

export const getTaskHeadBannerData = compose(fromTaskHeadBanner.getTaskHeadBannerData, getTaskHeadBannerState);

export function loadTaskAddState(state$: Observable<State>) {
    return state$.select(state => state.taskAddState);
}

export const saveTaskAddData = compose(fromTaskAdd.addTasks, loadTaskAddState);

export function loadTaskUpdateState(state$: Observable<State>) {
    return state$.select(state => state.taskUpdateState);
}

export const getAssignUsersData = compose(fromTaskAdd.getAssignUsers, loadTaskAddState);

export function getTaskUpdateStatus(state$: Observable<State>) {
    return state$.select(state => state.taskUpdateState);
}

// export const saveTaskUpdateData = compose(fromTaskUpdate.updateTasks, loadTaskUpdateState);

// End of Tasks list functions

//start of NotificationState related functions
export function getNotificationState(state$: Observable<State>) {
    return state$.select(state => state.notificationIndicator);
}

export const getUnReadNotificationsCount = compose(fromNotification.getUnReadNotificationsData, getNotificationState);

export const getHasReadNotificationsCountLoaded = compose(fromNotification.getHasUnReadNotificationsDataLoaded, getNotificationState);

export const getNotifications = compose(fromNotification.getNotificationsData, getNotificationState);

export const getNotificationsLoaded = compose(fromNotification.getNotificationsLoadedData, getNotificationState);
// end of NotificationState related functions

// Documents section
export function getDocumentsState(state$: Observable<State>) {
    return state$.select(state => state.documentsState);
}

export function getCurrentDocument(state$: Observable<State>) {
    return state$.select(state => state.documentsState.CurrentDocument);
}

export const getPersonalDocumentsData = compose(fromDocuments.getPersonalDocumentsData, getDocumentsState);
export const getHasPersonalDocumentsLoadedData = compose(fromDocuments.getHasPersonalDocumentsLoaded, getDocumentsState);

export function getDocumentSubCategoriesState(state$: Observable<State>) {
    return state$.select(state => state.userState.DocumentSubCategory.Entities);
}

export function getUserState(state$: Observable<State>) {
    return state$.select(state => state.userState);
}

export function getDocumentCategoryState(state$: Observable<State>) {
    return state$.select(state => state.userState.DocumentCategory);
}
export function getSharedDocumentCategoryState(state$: Observable<State>) {
    return state$.select(state => state.userState.SharedDocumentCategory);
}

export const getUserFullNameData = compose(fromUser.getUserFullName, getUserState);
export const getApplicableSitesData = compose(fromUser.getApplicableSitesData, getUserState);
export const getApplicableSitesLoadingState = compose(fromUser.siteDataLoadStatus, getUserState);
export const getApplicableDepartmentsData = compose(fromUser.getApplicableDepartmentsData, getUserState);
export const getApplicableDepartmentsDataForMultiSelect = compose(fromUser.getApplicableDepartmentsDataForMultiSelect, getUserState);
export const getDepartmentLoadingState = compose(fromUser.departmentDataLoadStatus, getUserState);
export const getDocumentCategoriesData = compose(fromUser.getDocumentCategories, getDocumentCategoryState);
export const getDocumentSubCategoriesData = compose(fromUser.getDocumentSubCategories, getUserState);
export const getPasswordChangeStatus = compose(fromUser.getPasswordUpdatedStatus, getUserState);
export const getPasswordUpdateCancelStatus = compose(fromUser.getPasswordUpdateCancelStatus, getUserState);
export const getUserStatusUpdateResult = compose(fromEmployee.getUserStatusUpdateResult, getEmployeeState);
export const getDeptByEmployees = compose(fromUser.getDeptByEmployees, getUserState);
export const checkIsDuplicateEmail = compose(fromEmployee.checkIsDuplicateEmail, getEmployeeState);
export const getUnAssociatedUsers = compose(fromEmployee.getUnAssociatedUsers, getEmployeeState);

export const getSharedDocumentCategoriesData = compose(fromUser.getSharedDocumentCategories, getSharedDocumentCategoryState);
export const getSharedDocumentCategoriesStatus = compose(fromUser.sharedDocsDataLoadStatus, getSharedDocumentCategoryState);
//Documentcategories

//End of Document Categories

//End of Documents section

// region to get document inforamtion bar functions


// Employee education history functions - start
export const getEmployeeEducationHistoryListLoadingState = compose(fromEmployee.educationHistoryListDataLoadStatus, getEmployeeState);
export const getEmployeeEducationHistoryList = compose(fromEmployee.getEmployeeEducationHistoryList, getEmployeeState);
export const getEmployeeEducationHistoryListTotalCount = compose(fromEmployee.getEmployeeEducationHistoryListTotalCount, getEmployeeState);
export const getEmployeeEducationHistoryListDataTableOptions = compose(fromEmployee.getEmployeeEducationHistoryListDataTableOptions, getEmployeeState);
export const getEmployeeEducationHistoryProgressStatus = compose(fromEmployee.getEmployeeEducationHistoryProgressStatus, getEmployeeState);
export const getEmployeeEducationHistoryGetStatus = compose(fromEmployee.getEmployeeEducationHistoryGetStatus, getEmployeeState);
// Employee education history functions - end

// Employee qualification history functions - start
export const getEmployeeQualificationHistoryListLoadingState = compose(fromEmployee.qualificationHistoryListDataLoadStatus, getEmployeeState);
export const getEmployeeQualificationHistoryList = compose(fromEmployee.getEmployeeQualificationHistoryList, getEmployeeState);
export const getEmployeeQualificationHistoryListTotalCount = compose(fromEmployee.getEmployeeQualificationHistoryListTotalCount, getEmployeeState);
export const getEmployeeQualificationHistoryListDataTableOptions = compose(fromEmployee.getEmployeeQualificationHistoryListDataTableOptions, getEmployeeState);
export const getEmployeeQualificationHistoryProgressStatus = compose(fromEmployee.getEmployeeQualificationHistoryProgressStatus, getEmployeeState);
export const getEmployeeQualificationHistoryGetStatus = compose(fromEmployee.getEmployeeQualificationHistoryGetStatus, getEmployeeState);
// Employee qualification history functions - end


//region to get document inforamtion bar functions
export function getDocumentInformationBarState(state$: Observable<State>) {
    return state$.select(state => state.documentInformationBar);
}
export const getDocumentInformationBarData = compose(fromDocumentInformationBar.getDocumentInformationBar, getDocumentInformationBarState);

export const getDocumentInformationLoadedData = compose(fromDocumentInformationBar.getDocumentInformationLoaded, getDocumentInformationBarState);

// employee vehicle tab states - start
export const getEmployeeVehiclesList = compose(fromEmployee.getEmployeeVehiclesList, getEmployeeState);
export const getEmployeeVehiclesDataTableOptions = compose(fromEmployee.getEmployeeVehiclesDataTableOptions, getEmployeeState);
export const getEmployeeVehiclesCount = compose(fromEmployee.getEmployeeVehiclesCount, getEmployeeState);
export const getEmployeeVehicleInfoGetById = compose(fromEmployee.getEmployeeVehicleInfoGetById, getEmployeeState);
export const addOrUpdateEmployeeVehicleInfo = compose(fromEmployee.addOrUpdateEmployeeVehicleInfo, getEmployeeState);
export const getHasVehiclesInformationLoadedData = compose(fromEmployee.getHasVehiclesInformationLoaded, getEmployeeState);
export const deleteEmployeeVehicleInfo = compose(fromEmployee.deleteEmployeeVehicleInfo, getEmployeeState);
export const getVehicleEngineCCTypes = compose(fromEmployee.getVehicleEngineCCTypes, getEmployeeState);
export const getVehicleFuelTypes = compose(fromEmployee.getVehicleFuelTypes, getEmployeeState);

//end of document information bar functions

// get the route from the State
export function getRouterState(state$: Observable<State>) {
    return state$.select(state => state.router);
}

export function getRouterPath(state$: Observable<RouterState>): Observable<string> {
    return state$.select(state => state.path)
}

export const getRouterStatePath = compose(getRouterPath, getRouterState);
// end of getting the route from the state

// employee previous employment history states - start

export const getEmployeePreviousEmploymentHistory = compose(fromEmployee.getEmployeePreviousEmploymentHistory, getEmployeeState);
export const getEmployeePreviousEmploymentHistoryTotalCount = compose(fromEmployee.getEmployeePreviousEmploymentHistoryTotalCount, getEmployeeState);
export const getEmployeePreviousEmploymentHistoryDataTableOptions = compose(fromEmployee.getEmployeePreviousEmploymentHistoryDataTableOptions, getEmployeeState);
export const getEmployeePreviousEmploymentLoadedData = compose(fromEmployee.getEmployeePreviousEmploymentLoaded, getEmployeeState);
// export const getEmployeePreviousEmploymentHistoryRowsCount = compose(fromEmployee.getEmployeePreviousEmploymentHistoryRowsCount, getEmployeeState);
export const addOrUpdateEmployeePreviousEmploymentHistory = compose(fromEmployee.addOrUpdateEmployeePreviousEmploymentHistory, getEmployeeState);
export const removeEmployeePreviousEmploymentHistory = compose(fromEmployee.removeEmployeePreviousEmploymentHistory, getEmployeeState);

// employee previous employment history states - end
//start of functions related to company Documents
export function getSharedDocumentsState(state$: Observable<State>) {
    return state$.select(state => state.sharedDocuments);
}

export const getHasDocumentsToReviewLoadedData = compose(fromSharedDocuments.getHasDocumentsToReviewLoaded, getSharedDocumentsState);

export const getDocumentsToReviewData = compose(fromSharedDocuments.getDocumentsToReview, getSharedDocumentsState);

export const getDocumentsToReviewDataCurrentPage = compose(fromSharedDocuments.getDocumentsToReviewCurrentPage, getSharedDocumentsState);


export const getDocumentsToReviewTotalCountData = compose(fromSharedDocuments.getDocumentsToReviewTotalCount, getSharedDocumentsState);
export const getDocumentsToReviewItemsCountData = compose(fromSharedDocuments.getDocumentsToReviewItemsCount, getSharedDocumentsState);
export const getDocumentsToReviewDataTableOptions = compose(fromSharedDocuments.getDocumentsToReviewDataTableOptions, getSharedDocumentsState);

export const getHasDocumentsToReviewActionConfirmCompletedData = compose(fromSharedDocuments.getHasDocumentsToReviewActionConfirmCompleted, getSharedDocumentsState);

export const getHasUsefulDocumentsToReivewLoadedLoadedData = compose(fromSharedDocuments.getHasUsefulDocumentsToReivewLoadedLoaded, getSharedDocumentsState);

export const getUsefulDocumentsToReviewData = compose(fromSharedDocuments.getUsefulDocumentsToReview, getSharedDocumentsState);

export const getUsefulDocumentsToReviewDataCurrentPage = compose(fromSharedDocuments.getUsefulDocumentsToReviewCurrentPage, getSharedDocumentsState);

export const getUsefulDocumentsToReviewItemsCountData = compose(fromSharedDocuments.getUsefulDocumentsToReviewItemsCount, getSharedDocumentsState);

export const getUsefulDocumentsToReviewDataTableOptions = compose(fromSharedDocuments.getUsefulDocumentsToReviewDataTableOptions, getSharedDocumentsState);


export const getUsefulDocumentsToReviewTotalCountData = compose(fromSharedDocuments.getUsefulDocumentsToReviewTotalCount, getSharedDocumentsState);

export const geHasUsefulDocumentsToReviewActionConfirmCompletedData = compose(fromSharedDocuments.geHasUsefulDocumentsToReviewActionConfirmCompleted, getSharedDocumentsState);

export const getDocumentReviewRequestsEmployees = compose(fromSharedDocuments.getDocumentReviewRequestsEmployees, getSharedDocumentsState);


//end of functions related to company Documents
export const getDocumentsToReviewAPIRequestData = compose(fromSharedDocuments.getDocumentsToReviewAPIRequest, getSharedDocumentsState);

export const getUsefulDocumentsToReviewAPIRequestData = compose(fromSharedDocuments.getUsefulDocumentsToReviewAPIRequest, getSharedDocumentsState);

//end of functions related to company Documents

//Functions related to Training list

// Employee training history functions - start
export const getEmployeeTrainingHistoryListLoadingState = compose(fromEmployee.trainingHistoryListDataLoadStatus, getEmployeeState);
export const getEmployeeTrainingHistoryList = compose(fromEmployee.getEmployeeTrainingHistoryList, getEmployeeState);
export const getEmployeeTrainingHistoryListTotalCount = compose(fromEmployee.getEmployeeTrainingHistoryListTotalCount, getEmployeeState);
export const getEmployeeTrainingHistoryListDataTableOptions = compose(fromEmployee.getEmployeeTrainingHistoryListDataTableOptions, getEmployeeState);
export const getEmployeeTrainingHistoryProgressStatus = compose(fromEmployee.getEmployeeTrainingHistoryProgressStatus, getEmployeeState);
export const getEmployeeTrainingHistoryGetStatus = compose(fromEmployee.getEmployeeTrainingHistoryGetStatus, getEmployeeState);
// Employee training history functions - end

// Training Course functions - start
export function getTrainingCourseState(state$: Observable<State>) {
    return state$.select(state => state.trainingCourseState);
}
export const getNonAtlasTrainingCourseList = compose(fromTrainingCourse.getNonAtlasTrainingCourseList, getTrainingCourseState);
export const getAllTrainingCourseList = compose(fromTrainingCourse.getAllTrainingCourseList, getTrainingCourseState);
export const getTrainingCourseListDataLoadStatus = compose(fromTrainingCourse.trainingCourseListDataLoadStatus, getTrainingCourseState);
export const getTrainingCourseProgressStatus = compose(fromTrainingCourse.getTrainingCourseProgressStatus, getTrainingCourseState);
export const getTrainingCourseGetStatus = compose(fromTrainingCourse.getTrainingCourseGetStatus, getTrainingCourseState);
// Training Course functions - end

export function getTrainingListInfoState(state$: Observable<State>) {
    return state$.select(state => state.trainingListState);
}

export const getTrainingsInfoData = compose(fromTrainingList.getTrainingListData, getTrainingListInfoState);
export const getTrainingsLoadingStatus = compose(fromTrainingList.getTrainingsLoadingStatus, getTrainingListInfoState);

//End of functions related to Training list


//Employee timeline 
export const getTimelineLoadStatus = compose(fromEmployee.timelineDataLoadStatus, getEmployeeState);
export const getTimelineData = compose(fromEmployee.getEmployeeTimelineData, getEmployeeState);
export const getEmployeeTimelineTotalCount = compose(fromEmployee.getEmployeeTimelineTotalCount, getEmployeeState);
export const getEmployeeTimelineDataTableOption = compose(fromEmployee.getEmployeeTimelineDataTableOption, getEmployeeState);

export const getEmployeeTimelineEventTypeList = compose(fromLookup.getEmployeeTimelineEventTypes, getLookUpState);
export const getEmployeeTimelineEventDisciplinayOutcomeList = compose(fromLookup.getEmployeeTimelineEventDisciplinaryOutcomes, getLookUpState);
export const getEmployeeTimelineEventOutcomeList = compose(fromLookup.getEmployeeTimelineEventOutcomes, getLookUpState);
export const getSelectedEmployeeEvent = compose(fromEmployee.getSelectedEmployeeEvent, getEmployeeState);

export const getEmployeeReasonForLeaving = compose(fromLookup.getEmployeeTimelineLeavingReasons, getLookUpState);
export const getEmployeeSubReasons = compose(fromLookup.getEmployeeTimelineSubReasons, getLookUpState);
export const getUserProfiles = compose(fromLookup.getUserProfiles, getLookUpState);
//End of employee timeline

export function getEmployeeGroupState(state$: Observable<State>) {
    return state$.select(state => state.employeeGroupState);
}
export const getTrainingCourseFromTrainingList = compose(fromTrainingCoursesFromTrainings.getTrainingCourseList, getTrainingCourseFromTrainingState);
export const getTrainingCourseFromTrainingStateData = compose(fromTrainingCoursesFromTrainings.getTrainingCourseState, getTrainingCourseFromTrainingState);
export const GetTrainingCourseFromTrainingTotalRecords = compose(fromTrainingCoursesFromTrainings.getTrainingCourseTotalRecords, getTrainingCourseFromTrainingState);
export const gettTrainingCourseFromTrainingInProgressStatus = compose(fromTrainingCoursesFromTrainings.gettTrainingCourseInProgressStatus, getTrainingCourseFromTrainingState);
export const addTrainingCourseFromTraining = compose(fromTrainingCoursesFromTrainings.addTrainingCourse, getTrainingCourseFromTrainingState);
export const getDeleteTrainingCourseFromTrainingStatus = compose(fromTrainingCoursesFromTrainings.getDeleteTrainingCourseStatus, getTrainingCourseFromTrainingState);
export const getTrainingCourseFromTrainingForSelectedId = compose(fromTrainingCoursesFromTrainings.getTrainingCourseForSelectedId, getTrainingCourseFromTrainingState);
export const getTrainingCourseFromTrainingListDataTableOptions = compose(fromTrainingCoursesFromTrainings.getTrainingCourseListDataTableOptions, getTrainingCourseFromTrainingState);
export const getTrainingCourseFromTrainingListDataLoading = compose(fromTrainingCoursesFromTrainings.getTrainingCourseListDataLoading, getTrainingCourseFromTrainingState);
export const getTrainingModuleData = compose(fromTrainingCoursesFromTrainings.getTrainingModulesData, getTrainingCourseFromTrainingState);
export const getTrainingSelectedModuleData = compose(fromTrainingCoursesFromTrainings.getTrainingSelectedModulesData, getTrainingCourseFromTrainingState);
export const getTrainingCourseUserModulesData = compose(fromTrainingCoursesFromTrainings.getTrainingCourseUserModulesData, getTrainingCourseFromTrainingState);
export const getTrainingCourseUserModulesTotalRecords = compose(fromTrainingCoursesFromTrainings.getTrainingCourseUserModulesTotalRecords, getTrainingCourseFromTrainingState);
export const getTrainingCourseUserModulesDataTableoptions = compose(fromTrainingCoursesFromTrainings.getTrainingCourseUserModulesDataTableoptions, getTrainingCourseFromTrainingState);
export const getTrainingCourseUserModulesDataLoading = compose(fromTrainingCoursesFromTrainings.getTrainingCourseUserModulesDataLoading, getTrainingCourseFromTrainingState);
export const getAssignedUsersInviteStatus = compose(fromTrainingCoursesFromTrainings.getAssignedUsersInviteStatus, getTrainingCourseFromTrainingState);
export const getPublicUserInviteStatus = compose(fromTrainingCoursesFromTrainings.getPublicUserInviteStatus, getTrainingCourseFromTrainingState);
export const getRemoveOrReInviteStatus = compose(fromTrainingCoursesFromTrainings.getRemoveOrReInviteStatus, getTrainingCourseFromTrainingState);


export function getTrainingCourseFromTrainingState(state$: Observable<State>) {
    return state$.select(state => state.trainingCourseFromTrainingsState);
}

//training-report function
export const getTrainingReportsList = compose(fromTrainingReportsFromTrainings.getTrainingReportsList, getTrainingReportsFromTrainingState);
export const getTrainingReportsListDataLoading = compose(fromTrainingReportsFromTrainings.getTrainingReportsListDataLoading, getTrainingReportsFromTrainingState);
export const getTrainingReportsListDataTableOptions = compose(fromTrainingReportsFromTrainings.getTrainingReportsListPageInformation, getTrainingReportsFromTrainingState);
export const GetTrainingReportsTotalRecords = compose(fromTrainingReportsFromTrainings.getTrainingReportsTotalRecords, getTrainingReportsFromTrainingState);
export const GetTrainingReportCertificateData = compose(fromTrainingReportsFromTrainings.getTrainingReportCertificateInformation, getTrainingReportsFromTrainingState);

export function getTrainingReportsFromTrainingState(state$: Observable<State>) {
    return state$.select(state => state.trainingReportsState);
}
//end
export const getEmployeeGroupList = compose(fromEmployeeGroups.getEmployeeGroupList, getEmployeeGroupState);
export const getEmployeeGroupStateData = compose(fromEmployeeGroups.getEmployeeGroupState, getEmployeeGroupState);
export const GetEmployeeGroupTotalRecords = compose(fromEmployeeGroups.getEmployeeGroupTotalRecords, getEmployeeGroupState);
export const gettEmployeeGroupInProgressStatus = compose(fromEmployeeGroups.gettEmployeeGroupInProgressStatus, getEmployeeGroupState);
export const addEmployeeGroup = compose(fromEmployeeGroups.addEmployeeGroup, getEmployeeGroupState);
export const getDeleteEmployeeGroupStatus = compose(fromEmployeeGroups.getDeleteEmployeeGroupStatus, getEmployeeGroupState);
export const getEmployeeGroupForSelectedId = compose(fromEmployeeGroups.getEmployeeGroupForSelectedId, getEmployeeGroupState);
export const getEmployeeGroupListDataTableOptions = compose(fromEmployeeGroups.getEmployeeGroupListDataTableOptions, getEmployeeGroupState);
export const getEmployeeGroupListDataLoading = compose(fromEmployeeGroups.getEmployeeGroupListDataLoading, getEmployeeGroupState);


export const getEmployeeGroupAssociationEmployeesData = compose(fromEmployeeGroups.getEmployeeGroupAssociationEmployees, getEmployeeGroupState);
export const getEmployeeGroupEmployeesLoading = compose(fromEmployeeGroups.getEmployeeGroupEmployeesLoading, getEmployeeGroupState);
export const getAssociateEmployeestoEmployeeGroupStatus = compose(fromEmployeeGroups.getAssociateEmployeestoEmployeeGroupStatus, getEmployeeGroupState);

//End of functions related to Training list
export const getTrainingsListTotalCount = compose(fromTrainingList.getTrainingsListTotalCount, getTrainingListInfoState);
export const getTrainingsListDataTableOptions = compose(fromTrainingList.getTrainingsListDataTableOptions, getTrainingListInfoState);

//End of functions related to Training list

//Start of function related to **Company User **

export function getCompanyUserState(state$: Observable<State>) {
    return state$.select(state => state.companyUserState);
}
export const getAllUsersData = compose(fromCompanyUser.getAllUsers, getCompanyUserState);
export const getSelectedUserInfoData = compose(fromCompanyUser.getSelectedUserInfo, getCompanyUserState);
export const getUserListingData = compose(fromCompanyUser.getUserListingData, getCompanyUserState);
export const getUserTotalRecords = compose(fromCompanyUser.getUserTotalRecords, getCompanyUserState);
export const getSelectedUserProfile = compose(fromCompanyUser.getSelectedUserProfile, getCompanyUserState);
export const getUserAddOrUpdateCompleted = compose(fromCompanyUser.userAddOrUpdateComplete, getCompanyUserState);
export const CurrentUser = compose(fromCompanyUser.CurrentUser, getCompanyUserState);
export const getPermissionGroups = compose(fromCompanyUser.getPermissionGroups, getCompanyUserState)

export const fetchUserForSelectedId = compose(fromCompanyUser.fetchUserForSelectedId, getCompanyUserState);
export const getUserListDataTableOptions = compose(fromCompanyUser.getUserListDataTableOptions, getCompanyUserState);
export const getUserListDataLoading = compose(fromCompanyUser.getUserListDataLoading, getCompanyUserState);
export const getAdviceCardNumberOptionListData = compose(fromCompanyUser.getAdviceCardNumberOptionListData, getCompanyUserState);
export const getAdviceCardNumberOptionListDataStatus = compose(fromCompanyUser.getAdviceCardNumberOptionListDataStatus, getCompanyUserState);
export const validateUserName = compose(fromCompanyUser.validateUserName, getCompanyUserState);
export const getEmailAvailability = compose(fromCompanyUser.getEmailAvailability, getCompanyUserState);
export const getAuditLogData = compose(fromCompanyUser.getAuditLogData, getCompanyUserState);
export const getAuditLogDataPageInformation = compose(fromCompanyUser.getAuditLogDataPageInformation, getCompanyUserState);
export const getAuditLogDataLength = compose(fromCompanyUser.getAuditLogDataLength, getCompanyUserState);
export const getAuditLogDataLoadingStatus = compose(fromCompanyUser.getAuditLogDataLoadingStatus, getCompanyUserState);
export const getCurrentLogVersionData = compose(fromCompanyUser.getCurrentLogVersionData, getCompanyUserState);

//End of functions related to **Company User **

//Start of function related to **Company Bulk password Reset **

export function getCompanyBulkPasswordResetState(state$: Observable<State>) {
    return state$.select(state => state.companyBulkPasswordResetState);
}
export const getUserListingDataWithEmail = compose(fromCompanyBulkPasswordReset.getUserListingDataWithEmail, getCompanyBulkPasswordResetState);
export const getUserTotalRecordsWithEmail = compose(fromCompanyBulkPasswordReset.getUserTotalRecordsWithEmail, getCompanyBulkPasswordResetState);
export const getUserListDataLoadingWithEmail = compose(fromCompanyBulkPasswordReset.getUserListDataLoadingWithEmail, getCompanyBulkPasswordResetState);
export const getBprUserListDataTableOptions = compose(fromCompanyBulkPasswordReset.getBprUserListDataTableOptions, getCompanyBulkPasswordResetState);
export const submitResetUserData = compose(fromCompanyBulkPasswordReset.submitResetUsers, getCompanyBulkPasswordResetState);
export const getIsSubmittedUsersListData = compose(fromCompanyBulkPasswordReset.getIsSubmittedUsersList, getCompanyBulkPasswordResetState);

//End of functions related to **Company Bulk password Reset **

// bank details  : start

export const getEmployeeBankDetailsListLoadingState = compose(fromEmployee.getEmployeeBankDetailsListDataLoadStatus, getEmployeeState);
export const getEmployeeBankDetailsList = compose(fromEmployee.getEmployeeBankDetailsList, getEmployeeState);
export const getEmployeeBankDetailsListTotalCount = compose(fromEmployee.getEmployeeBankDetailsListTotalCount, getEmployeeState);
export const getEmployeeBankDetailsListDataTableOptions = compose(fromEmployee.getEmployeeBankDetailsListDataTableOptions, getEmployeeState);
export const getEmployeeBankDetailsProgressStatus = compose(fromEmployee.getEmployeeBankDetailsProgressStatus, getEmployeeState);
export const getEmployeeBankDetailsGetStatus = compose(fromEmployee.getEmployeeBankDetailsGetStatus, getEmployeeState);


// bank details : end

// Manage employee state start

export function getManageEmployeeState(state$: Observable<State>) {
    return state$.select(state => state.employeeManageState);
}

export const getEmployeesListData = compose(fromEmployeeManage.getEmployeesListData, getManageEmployeeState);
export const getEmployeesTotalCount = compose(fromEmployeeManage.getEmployeesTotalCount, getManageEmployeeState);
export const getEmployeesPageInformation = compose(fromEmployeeManage.getEmployeesPageInfo, getManageEmployeeState);
export const getEmployeesLoadingStatusInformation = compose(fromEmployeeManage.getEmployeesLoadingStatus, getManageEmployeeState);
export const getEmployeesFiltersInformation = compose(fromEmployeeManage.getEmployeesFilters, getManageEmployeeState);
export const getEmployeesSortInformation = compose(fromEmployeeManage.getEmployeesSort, getManageEmployeeState);

// Employee job details functions - start

export const getEmployeeJobDetailsLoadingState = compose(fromEmployee.getEmployeeJobDetailsDataLoadStatus, getEmployeeState);
export const getEmployeeHolidayWorkingProfileLoadStatus = compose(fromEmployee.employeeHolidayWorkingProfileLoadStatus, getEmployeeState);
export const getSelectedemployeeHolidayWorkingProfileData = compose(fromEmployee.employeeHolidayWorkingProfile, getEmployeeState);
export const getEmployeeJobDetails = compose(fromEmployee.getEmployeeJobDetails, getEmployeeState);
export const getEmployeeJobDetailsProgressStatus = compose(fromEmployee.getEmployeeJobDetailsProgressStatus, getEmployeeState);
// Employee job details functions - end

//Reports fuctions
export function getReportsState(state$: Observable<State>) {
    return state$.select(state => state.reportsState);
}

export const getReportsList = compose(fromReports.getReportsList, getReportsState);
export const getReportsDataTableOptions = compose(fromReports.getReportsDataTableOptions, getReportsState);
export const getReportsInformationItems = compose(fromReports.getReportsInformationItems, getReportsState);
export const getReportsLoadingStatus = compose(fromReports.getReportsLoadingStatus, getReportsState);
export const getReportsTotalCount = compose(fromReports.getReportsTotalCount, getReportsState);
//End of reports fuctions

//start of functions related to Holiday Absence requests 
export function getHolidayAbsenceRequestsState(state$: Observable<State>) {
    return state$.select(state => state.holidayAbsenceRequestsState);
}
export const getHolidayAbsenceRequestsLoadedData = compose(fromHolidayAbsenceRequests.getHolidayAbsenceRequestsLoaded
    , getHolidayAbsenceRequestsState);
export const getHolidayAbsenceRequestsData = compose(fromHolidayAbsenceRequests.getHolidayAbsenceRequests, getHolidayAbsenceRequestsState);
export const getHolidayRequestsDataTableOptionsData = compose(fromHolidayAbsenceRequests.getEmployeeJobHistoryDataTableOptions, getHolidayAbsenceRequestsState);
export const getHolidayAbsenceRequestsCurrentPageData = compose(fromHolidayAbsenceRequests.getHolidayAbsenceRequestsCurrentPage, getHolidayAbsenceRequestsState);
export const getHolidayAbsenceRequestsTotalCountData = compose(fromHolidayAbsenceRequests.getHolidayAbsenceRequestsTotalCount, getHolidayAbsenceRequestsState);
export const getHolidayAbsenceRequestsEmployeesData = compose(fromHolidayAbsenceRequests.getHolidayAbsenceRequestsEmployees, getHolidayAbsenceRequestsState);
export const getHolidayAbsenceApiRequestData = compose(fromHolidayAbsenceRequests.getHolidayAbsenceApiRequest, getHolidayAbsenceRequestsState);
export const getSelectedEmployeeHolidaySummaryData = compose(fromHolidayAbsenceRequests.getSelectedEmployeeHolidaySummary, getHolidayAbsenceRequestsState);
export const getSelectedEmployeeAbsenceAdded = compose(fromHolidayAbsenceRequests
    .getSelectedEmployeeAbsenceAdded
    , getHolidayAbsenceRequestsState);
export const getSelectedEmployeeAbsenceUpdated = compose(fromHolidayAbsenceRequests
    .getSelectedEmployeeAbsenceUpdated
    , getHolidayAbsenceRequestsState);
export const getSelectedEmployeeAbsenceHistory = compose(fromHolidayAbsenceRequests
    .getSelectedEmployeeAbsenceHistory
    , getHolidayAbsenceRequestsState);
export const getSelectedEmployeeAbsence = compose(fromHolidayAbsenceRequests
    .getSelectedEmployeeAbsence
    , getHolidayAbsenceRequestsState);
export const getSelectedEmployeeHolidaySummaryForChart = compose(fromHolidayAbsenceRequests
    .getSelectedEmployeeHolidaySummaryForChart
    , getHolidayAbsenceRequestsState);
export const getSelectedEmployeeConfig = compose(fromHolidayAbsenceRequests
    .getSelectedEmployeeConfig
    , getHolidayAbsenceRequestsState);
export const getOneStepApprovalStatus = compose(fromHolidayAbsenceRequests.oneStepApprovalStatus, getHolidayAbsenceRequestsState);


export const getTeamRosterLoadedData = compose(fromHolidayAbsenceRequests.getTeamRosterLoaded, getHolidayAbsenceRequestsState);
export const getTeamRosterData = compose(fromHolidayAbsenceRequests.getTeamRoster, getHolidayAbsenceRequestsState);
export const getTeamRosterTotalCountData = compose(fromHolidayAbsenceRequests.getTeamRosterTotalCount, getHolidayAbsenceRequestsState);
export const getTeamRosterDataTableOptionsData = compose(fromHolidayAbsenceRequests.getTeamRosterDataTableOptions, getHolidayAbsenceRequestsState);



//end of functions related to holidays absence requests

//start of functions required for delegation
export function getDelegationState(state$: Observable<State>) {
    return state$.select(state => state.delegationState);
}

export const getDelegationRequestsData = compose(fromDelegation.getDelegationRequests, getDelegationState);
export const getDelegationRequestsTotalCountData = compose(fromDelegation.getDelegationRequestsTotalCount, getDelegationState);
export const getDelegationRequestsDataTableOptionsData = compose(fromDelegation.getfromDelegationHistoryDataTableOptions, getDelegationState);
export const getDelegationRequestsLoadedData = compose(fromDelegation.getDelegationRequestsLoaded, getDelegationState);
export const getDelegationApiRequestData = compose(fromDelegation.getDelegationApiRequest, getDelegationState);
export const getDelegationUserlistsData = compose(fromDelegation.getDelegationUserlists, getDelegationState);
export const getDelegationAutosuggestUserlistsData = compose(fromDelegation.getDelegationAutosuggestUserlists, getDelegationState);
//end of functions required for delegation

// employee add states - start
export function getEmployeeAddState(state$: Observable<State>) {
    return state$.select(state => state.employeeAddState);
}
export const getNewEmployeeId = compose(fromEmployeeAdd.getNewEmployeeId, getEmployeeAddState);
export const getEmployeeDetailsProgressStatus = compose(fromEmployeeAdd.getEmployeeDetailsAddProgressStatus, getEmployeeAddState);
export const getEmployeeFirstNameAndSurname = compose(fromEmployeeAdd.getEmployeeFirstNameAndSurname, getEmployeeAddState);

// employee add states - end


//start of non working days
export function getNonWorkingDaysState(state$: Observable<State>) {
    return state$.select(state => state.nonWorkingDaysState);
}

export const getHasStandardNonWorkingdaysLoadedData = compose(fromNonWorkingDays.getHasStandardNonWorkingdaysLoaded, getNonWorkingDaysState);
export const getStandardNonWorkingDaysData = compose(fromNonWorkingDays.getStandardNonWorkingDays, getNonWorkingDaysState);
export const getStandardNonWorkingDaysTotalCountData = compose(fromNonWorkingDays.getStandardNonWorkingDaysTotalCount, getNonWorkingDaysState);
export const getStandardNonWorkingdaysDataTableOptionsData = compose(fromNonWorkingDays.getStandardNonWorkingdaysDataTableOptions, getNonWorkingDaysState);
export const getHasCustomNonWorkingdaysLoadedData = compose(fromNonWorkingDays.getHasCustomNonWorkingdaysLoaded, getNonWorkingDaysState);
export const getCustomNonWorkingDaysData = compose(fromNonWorkingDays.getCustomNonWorkingDays, getNonWorkingDaysState);
export const getCustomNonWorkingDaysTotalCountData = compose(fromNonWorkingDays.getCustomNonWorkingDaysTotalCount, getNonWorkingDaysState);
export const getCustomNonWorkingdaysDataTableOptionsData = compose(fromNonWorkingDays.getCustomNonWorkingdaysDataTableOptions, getNonWorkingDaysState);
export const getCompanyNonWorkingDayData = compose(fromNonWorkingDays.getCompanyNonWorkingDay, getNonWorkingDaysState);
export const getHasCompanyNonWorkingdaysLoadedData = compose(fromNonWorkingDays.getHasCompanyNonWorkingdaysLoaded, getNonWorkingDaysState);
export const getNonWorkingDaysEmployeesData = compose(fromNonWorkingDays.getNonWorkingDaysEmployees, getNonWorkingDaysState);
export const getStandardNonWorkingDaysApiRequestData = compose(fromNonWorkingDays.getStandardNonWorkingDaysApiRequest, getNonWorkingDaysState);
export const getCustomNonWorkingDaysApiRequestData = compose(fromNonWorkingDays.getCustomNonWorkingDaysApiRequest, getNonWorkingDaysState);
export const getHasFiltersChangedData = compose(fromNonWorkingDays.getHasFiltersChanged, getNonWorkingDaysState);
export const getSelectedProfileNotesData = compose(fromNonWorkingDays.getSelectedProfileNotes, getNonWorkingDaysState);
export const getHasSelectedProfileNotesLoadedData = compose(fromNonWorkingDays.getHasSelectedProfileNotesLoaded, getNonWorkingDaysState);
export const getCustonNonWorkingDaysValidationData = compose(fromNonWorkingDays.getCustonNonWorkingDaysValidation, getNonWorkingDaysState);
export const getHasSelectedProfileFullEntityLoadedData = compose(fromNonWorkingDays.getHasSelectedProfileFullEntityLoaded, getNonWorkingDaysState);
export const getHasSelectedProfileFullEntityData = compose(fromNonWorkingDays.getHasSelectedProfileFullEntity, getNonWorkingDaysState);
export const getAddNonWorkingdayProfileStatus = compose(fromNonWorkingDays.addNonWorkingdayProfileStatus, getNonWorkingDaysState);
export const getUpdateNonWorkingdayProfileStatus = compose(fromNonWorkingDays.updateNonWorkingdayProfileStatus, getNonWorkingDaysState);
export const getNonWorkingdayProfileLoadStatus = compose(fromNonWorkingDays.getNonWorkingdayProfileLoadStatus, getNonWorkingDaysState);
export const getNonWorkingdayProfileAssignStatus = compose(fromNonWorkingDays.getNonWorkingdayProfileAssignStatus, getNonWorkingDaysState);
export const getNonWorkingdayProfileData = compose(fromNonWorkingDays.getNonWorkingdayProfileData, getNonWorkingDaysState);
export const getCopiedWorkingdayProfileData = compose(fromNonWorkingDays.getCopiedWorkingdayProfile, getNonWorkingDaysState);
export const getNonWorkingDayProfilesList = compose(fromCompany.getNonWorkingDayProfiles, getCompanyState);

// end of start of non working days

//end of functions required for delegation




//start of functions required for service report component
export function getServiceReportState(state$: Observable<State>) {
    return state$.select(state => state.serviceReportState);
}

export const getServiceReportInformation = compose(fromServiceReport.getServiceReportInformation, getServiceReportState);
export const getServiceReportInformationLoading = compose(fromServiceReport.getServiceReportInformationLoading, getServiceReportState);

//end of functions required for service report component


// Start of news functions
export function getNewsState(state$: Observable<State>) {
    return state$.select(state => state.newsState);
}

export const getNewsData = compose(fromNews.getNews, getNewsState);
export const newsLoadingStatus = compose(fromNews.newsLoadingStatus, getNewsState);
// End of my trainings functions

//Employee Import functions
export function getImportState(state$: Observable<State>) {
    return state$.select(state => state.employeeImportState);
}
export const getFailedImportedEmployeesData = compose(fromEmployeeImport.getFailedImportedEmployees, getImportState);
export const getEmployeeImportHistoryLoadStatus = compose(fromEmployeeImport.getImportHistoryLoadingStatus, getImportState);
export const getEmployeeImportHistoryList = compose(fromEmployeeImport.getImportHistoryList, getImportState);
export const getEmployeeImportHistoryTotalCount = compose(fromEmployeeImport.getImportHistoryTotalCount, getImportState);
export const getEmployeeImportHistoryDataTableOptions = compose(fromEmployeeImport.getImportHistoryDataTableOptions, getImportState);
export const getEmployeeImportResultData = compose(fromEmployeeImport.getImportResultsData, getImportState);
export const getEmployeeimportResultStatus = compose(fromEmployeeImport.getImportResultLoadingStatus, getImportState);
export const getEmployeeImportResultTotalCount = compose(fromEmployeeImport.getImportResultTotalCount, getImportState);
export const getEmployeeImportResultDataTableOptions = compose(fromEmployeeImport.getImportResultDataTableOptions, getImportState);
export const getEmployeeImportDescription = compose(fromEmployeeImport.getImportDescription, getImportState);
export const getEmployeeImportEmployees = compose(fromEmployeeImport.getImportEmployeesData, getImportState);
export const getEmployeeImportEmployeesTotalCount = compose(fromEmployeeImport.getImportEmployeeTotalCount, getImportState);
export const getEmployeeImportEmployeesDataTableOptions = compose(fromEmployeeImport.getImportEmployeeDataTableOptions, getImportState);
export const getEmployeeImportEmployeesLoadingStatus = compose(fromEmployeeImport.getImportEmployeeLoadingStatus, getImportState);
export const getEmployeeImportStatusMessage = compose(fromEmployeeImport.getImportStatusMessage, getImportState);
export const getEmployeeImportStatus = compose(fromEmployeeImport.getImportStatus, getImportState);

//Employee Import functions

// start of functions required for sites list
export function getSiteState(state$: Observable<State>) {
    return state$.select(state => state.siteState);
}
export function getConstructionPhasePlanState(state$: Observable<State>) {
    return state$.select(state => state.constructionPhasePlanState);
}

export const getSelectedSiteData = compose(fromSite.getSelectedSite, getSiteState);
export const getSitesListData = compose(fromSite.getSitesListData, getSiteState);
export const getCompanyHOAddress = compose(fromSite.getCompanyHOAddress, getSiteState);
export const getSitesTotalCount = compose(fromSite.getSitesTotalCount, getSiteState);
export const getSitesPageInformation = compose(fromSite.getSitesPageInformation, getSiteState);
export const getSitesLoadingStatus = compose(fromSite.getSitesLoadingStatus, getSiteState);
export const getSiteAssignmentsData = compose(fromSite.getSiteAssignmentsData, getSiteState);

export const getConstructionPhasePlansStats = compose(fromConstructionPhasePlan.getCPPStats, getConstructionPhasePlanState);
export const getConstructionPhasePlansApiRequest = compose(fromConstructionPhasePlan.getCPPApiRequest, getConstructionPhasePlanState);
export const getConstructionPhasePlansListData = compose(fromConstructionPhasePlan.getConstructionPhasePlansListData, getConstructionPhasePlanState);
export const getConstructionPhasePlansTotalCount = compose(fromConstructionPhasePlan.getConstructionPhasePlansTotalCount, getConstructionPhasePlanState);
export const getConstructionPhasePlansPageInformation = compose(fromConstructionPhasePlan.getConstructionPhasePlansPageInformation, getConstructionPhasePlanState);
export const getConstructionPhasePlansLoadingStatus = compose(fromConstructionPhasePlan.getConstructionPhasePlansLoadingStatus, getConstructionPhasePlanState);
export const getConstructionPhasePlanCopyStatusData = compose(fromConstructionPhasePlan.getConstructionPhasePlanCopyStatus, getConstructionPhasePlanState);
export const getConstructionPhasePlanApproveStatus = compose(fromConstructionPhasePlan.getConstructionPhasePlanApproveStatus, getConstructionPhasePlanState);
export const getCopiedConstructionPhasePlanId = compose(fromConstructionPhasePlan.getCopiedConstructionPhasePlanId, getConstructionPhasePlanState);
// start of functions required for RiskAssessmentState
export function getRiskAssessmentStateState(state$: Observable<State>) {
    return state$.select(state => state.riskAssessmentState);
}
export const getRiskAssessmentListData = compose(fromRiskAssessments.getRiskAssessmentListData, getRiskAssessmentStateState);
export const getRiskAssessmentTotalCount = compose(fromRiskAssessments.getRiskAssessmentTotalCount, getRiskAssessmentStateState);
export const getRiskAssessmentPageInformation = compose(fromRiskAssessments.getRiskAssessmentPageInformation, getRiskAssessmentStateState);
export const getRiskAssessmentLoadingStatus = compose(fromRiskAssessments.getRiskAssessmentLoadingStatus, getRiskAssessmentStateState);
export const getRiskAssessmentNameChange = compose(fromRiskAssessments.getRiskAssessmentNameChange, getRiskAssessmentStateState);
export const getRiskAssessmentSiteChange = compose(fromRiskAssessments.getRiskAssessmentSiteChange, getRiskAssessmentStateState);
export const getRiskAssessmentTypeChange = compose(fromRiskAssessments.getRiskAssessmentTypeChange, getRiskAssessmentStateState);
export const getRiskAssessmentWorkSpaceChange = compose(fromRiskAssessments.getRiskAssessmentWorkSpaceChange, getRiskAssessmentStateState);
export const getRiskAssessmentSectorFilterChange = compose(fromRiskAssessments.getRiskAssessmentSectorFilterChange, getRiskAssessmentStateState);
// end of functions required for RiskAssessmentState

// start of functions required for check list
export function getChecklistState(state$: Observable<State>) {
    return state$.select(state => state.checklistState);
}

export const getCurrentChecklistData = compose(fromChecklist.getCurrentChecklistData, getChecklistState);
export const getChecklistListData = compose(fromChecklist.getChecklistListData, getChecklistState);
export const getChecklistTotalCount = compose(fromChecklist.getChecklistTotalCount, getChecklistState);
export const getChecklistPageInformation = compose(fromChecklist.getChecklistPageInformation, getChecklistState);
export const getChecklistLoadingStatus = compose(fromChecklist.getChecklistLoadingStatus, getChecklistState);
export const getCurrentChecklistCheckItems = compose(fromChecklist.getCurrentChecklistCheckItems, getChecklistState);
export const getCurrentChecklistCheckItemsLength = compose(fromChecklist.getCurrentChecklistCheckItemsLength, getChecklistState);
export const getCurrentChecklistLoadingStatus = compose(fromChecklist.getCurrentChecklistLoadingStatus, getChecklistState);
export const getChecklistStats = compose(fromChecklist.getChecklistStats, getChecklistState);

export const getCheckItemsData = compose(fromChecklist.getCheckItemsData, getChecklistState);
export const getCheckItemsTotalCount = compose(fromChecklist.getCheckItemsTotalCount, getChecklistState);
export const getCheckItemsPageInformation = compose(fromChecklist.getCheckItemsPageInformation, getChecklistState);
export const getCheckItemsLoadingStatus = compose(fromChecklist.getCheckItemsLoadingStatus, getChecklistState);
export const getChecklistActionItemInstances = compose(fromChecklist.getChecklistActionItemInstances, getChecklistState);
// end of functions required for check list

//ScheduledOrArchived
export const getScheduledOrArchiveChecklistData = compose(fromChecklist.getScheduledOrArchiveChecklistData, getChecklistState);
export const getScheduledOrArchiveChecklistTotalCount = compose(fromChecklist.getScheduledOrArchiveChecklistTotalCount, getChecklistState);
export const getScheduledOrArchiveChecklistPageInformation = compose(fromChecklist.getScheduledOrArchiveChecklistPageInformation, getChecklistState);
export const getScheduledOrArchiveChecklistLoadingStatus = compose(fromChecklist.getScheduledOrArchiveChecklistLoadingStatus, getChecklistState);
// end of ScheduledOrArchived

//companychecklists
export const getCompanyChecklistData = compose(fromChecklist.getCompanyChecklistData, getChecklistState);
export const getCompanyChecklistTotalCount = compose(fromChecklist.getCompanyChecklistTotalCount, getChecklistState);
export const getCompanyChecklistPageInformation = compose(fromChecklist.getCompanyChecklistPageInformation, getChecklistState);
export const getCompanyChecklistLoadingStatus = compose(fromChecklist.getCompanyChecklistLoadingStatus, getChecklistState);
//company checklists ends
//Examplechecklists

export const getExampleChecklistData = compose(fromChecklist.getExampleChecklistData, getChecklistState);
export const getExampleChecklistTotalCount = compose(fromChecklist.getExampleChecklistTotalCount, getChecklistState);
export const getExampleChecklistPageInformation = compose(fromChecklist.getExampleChecklistPageInformation, getChecklistState);
export const getExampleChecklistLoadingStatus = compose(fromChecklist.getExampleChecklistLoadingStatus, getChecklistState);

//Example checklists ends
//Archived checklists

export const getArchivedChecklistData = compose(fromChecklist.getArchivedChecklistData, getChecklistState);
export const getArchivedChecklistTotalCount = compose(fromChecklist.getArchivedChecklistTotalCount, getChecklistState);
export const getArchivedChecklistPageInformation = compose(fromChecklist.getArchivedChecklistPageInformation, getChecklistState);
export const getArchivedChecklistLoadingStatus = compose(fromChecklist.getArchivedChecklistLoadingStatus, getChecklistState);

//Archived checklists ends
export const getAssignmentsList = compose(fromChecklist.getChecklistAssignments, getChecklistState);
export const getAssignmentsTotalCount = compose(fromChecklist.getChecklistAssignmentCount, getChecklistState);
export const getAssignmentsPageInformation = compose(fromChecklist.getChecklistAssignmentPageInformation, getChecklistState);
export const getAssignmentsLoadingStatus = compose(fromChecklist.getChecklistAssignmentLoadingStatus, getChecklistState);
// end of functions required for sites list

//get name change subscription getChecklistNameChange
export const getChecklistNameChange = compose(fromChecklist.getChecklistNameChange, getChecklistState);
export const getWorkSpaceChange = compose(fromChecklist.getWorkSpaceChange, getChecklistState);
//end
//end

export function getIncidentLogState(state$: Observable<State>) {
    return state$.select(state => state.incidentLogState);
}

export const getIncidentLogStatsData = compose(fromIncidentLog.incidentLogStatsData, getIncidentLogState);
export const getIncidentLogStatsLoadStatus = compose(fromIncidentLog.incidentLogStatsLoadStatus, getIncidentLogState);
export const getIncidentsData = compose(fromIncidentLog.incidentsData, getIncidentLogState);
export const getincidentsDataTableOptions = compose(fromIncidentLog.incidentsDataTableOptions, getIncidentLogState)
export const getIncidentLogFilters = compose(fromIncidentLog.incidentLogFilters, getIncidentLogState);
export const getIncidentLogPaging = compose(fromIncidentLog.incidentLogPaging, getIncidentLogState);
export const getIncidentLogSorting = compose(fromIncidentLog.incidentLogSorting, getIncidentLogState);
export const getIncidentsDataLoad = compose(fromIncidentLog.incidentsLoad, getIncidentLogState);
export const getIncidentsTotalCount = compose(fromIncidentLog.incidentsTotalCount, getIncidentLogState);
export const getIncidentLogStatsFilters = compose(fromIncidentLog.incidentLogStatsFilters, getIncidentLogState);

// End of my trainings functions
export function getReferralState(state$: Observable<State>) {
    return state$.select(state => state.referralState);
}
export const getAdverts = compose(fromReferral.getAdverts, getReferralState);
export const getAdvertsStatus = compose(fromReferral.getAdvertsStatus, getReferralState);
// End of my trainings functions
//Current Company
export function getCurrentCompanyState(state$: Observable<State>) {
    return state$.select(state => state.currentCompanyState);
}
export const getCurrentCompanyDetails = compose(fromCurrentCompany.getCurrentCompanyDetails, getCurrentCompanyState);
export const getCurrentCompanyInformationComponent = compose(fromCurrentCompany.getCurrentCompanyInformationComponent, getCurrentCompanyState);
// AbsenceType  : start
export function getAbsenceTypeState(state$: Observable<State>) {
    return state$.select(state => state.absenceTypeState);
}

export const getAbsenceTypeProgressStatus = compose(fromAbsenceType.getAbsenceTypeProgressStatus, getAbsenceTypeState);
export const getAbsenceTypeGetStatus = compose(fromAbsenceType.getAbsenceTypeGetStatus, getAbsenceTypeState);
// AbsenceType : end


// Citation Drafts :start
export function getCitationDraftsState(state$: Observable<State>) {
    return state$.select(state => state.citationDraftsState);
}
export const getCitationDraftsData = compose(fromCitationDrafts.getCitationDraftsList, getCitationDraftsState);
export const getCitationDraftsLoadingState = compose(fromCitationDrafts.getCitationDraftsListLoadingState, getCitationDraftsState);
export const getCitationDraftsListTotalCount = compose(fromCitationDrafts.getCitationDraftsListTotalCount, getCitationDraftsState);
export const getCitationDraftsDataTableOptions = compose(fromCitationDrafts.getCitationDraftsListDataTableOptions, getCitationDraftsState);
export const getCitationDraftsApiRequestData = compose(fromCitationDrafts.getCitationDraftsApiRequest, getCitationDraftsState);
// Citation Drafts :end

// Useful Documets :start
export function getUsefulDocsState(state$: Observable<State>) {
    return state$.select(state => state.usefulDocsState);
}

export const getUsefulDocsData = compose(fromUsefulDocs.getUsefulDocsList, getUsefulDocsState);
export const getUsefulDocsLoadingState = compose(fromUsefulDocs.getUsefulDocsListLoadingState, getUsefulDocsState);
export const getUsefulDocsListTotalCount = compose(fromUsefulDocs.getUsefulDocsListTotalCount, getUsefulDocsState);
export const getUsefulDocsDataTableOptions = compose(fromUsefulDocs.getUsefulDocsListDataTableOptions, getUsefulDocsState);
export const getUsefulDocsApiRequesttData = compose(fromUsefulDocs.getUsefulDocsApiRequest, getUsefulDocsState);
export const getUsefulDocsCount = compose(fromUsefulDocs.getUsefulDocsCount, getUsefulDocsState);
// Useful Documets :end

// Handbooks :start
export function geHandbooksState(state$: Observable<State>) {
    return state$.select(state => state.handbooksState);
}
export const getHandbooksData = compose(fromHandbooks.getHandbooksList, geHandbooksState);
export const getHandbooksLoadingState = compose(fromHandbooks.getHandbooksListLoadingState, geHandbooksState);
export const getHandbooksListTotalCount = compose(fromHandbooks.getHandbooksListTotalCount, geHandbooksState);
export const getHandbooksDataTableOptions = compose(fromHandbooks.getHandbooksListDataTableOptions, geHandbooksState);
export const getHandbooksDocsCount = compose(fromHandbooks.getHandbooksDocsCount, geHandbooksState);
export const getHandbooksDocsApiRequestData = compose(fromHandbooks.getHandbooksDocsApiRequest, geHandbooksState);
// Handbooks :end

// Contracts :start
export function getContractsState(state$: Observable<State>) {
    return state$.select(state => state.contractsState);
}
export const getContractsData = compose(fromContracts.getContractsList, getContractsState);
export const getContractsLoadingState = compose(fromContracts.getContractsListLoadingState, getContractsState);
export const getPersonalContractsData = compose(fromContracts.getPersonalContractsList, getContractsState);
export const getPersonalContractsLoadingState = compose(fromContracts.getPersonalContractsListLoadingState, getContractsState);
export const getContractsListTotalCount = compose(fromContracts.getContractsListTotalCount, getContractsState);
export const getPersonalContractsListTotalCount = compose(fromContracts.getPersonalContractsListTotalCount, getContractsState);
export const getContractsDataTableOptions = compose(fromContracts.getContractsListDataTableOptions, getContractsState);
export const getPersonalContractsDataTableOptions = compose(fromContracts.getPersonalContractsListDataTableOptions, getContractsState);
export const getContractsTemplateCount = compose(fromContracts.getContractsTemplateCount, getContractsState);
export const getPersonalContractsCount = compose(fromContracts.getPersonalContractsCount, getContractsState);
export const getAssociatedUserVersionContractData = compose(fromContracts.getAssociatedUserVersionContract, getContractsState);
// Contracts :end

// Company Documents :start
export function getCompanyDocumentsState(state$: Observable<State>) {
    return state$.select(state => state.companyDocumentsState);
}
export const getCompanyDocumentDeletedStatusData = compose(fromCompanyDocuments.getCompanyDocumentDeletedStatus, getCompanyDocumentsState);
export const getCompanyDocumentStatsLoadedData = compose(fromCompanyDocuments.getCompanyDocumentStatsLoaded, getCompanyDocumentsState);
export function getCompanyDocumentStatsByFolder(docFolder: DocumentsFolder) {
    return compose((state$) => { return fromCompanyDocuments.getCompanyDocumentStats(state$, docFolder) }, getCompanyDocumentsState)
}

export const getCompanyDocumentsLoadedData = compose(fromCompanyDocuments.getCompanyDocumentsLoaded, getCompanyDocumentsState);
export const getCompanyDocumentsData = compose(fromCompanyDocuments.getCompanyDocumentsList, getCompanyDocumentsState);
export const getCompanyDocumentsTotalCountData = compose(fromCompanyDocuments.getCompanyDocumentsTotalCount, getCompanyDocumentsState);
export const getCompanyDocumentsDataTableOptionsData = compose(fromCompanyDocuments.getCompanyDocumentsDataTableOptions, getCompanyDocumentsState);
export const getCompanyDocumentsApiRequestData = compose(fromCompanyDocuments.getCompanyDocumentsApiRequest, getCompanyDocumentsState);
// Company Documents :end

// AbsenceType : end



export function getDocumentDetailsState(state$: Observable<State>) {
    return state$.select(state => state.documentDetailsState);
}
//Document details : start
export const getDocumentDetailsById = compose(fromDocumentDetails.getDocumentDetailsById, getDocumentDetailsState);

export const getDocumentChangeHistory = compose(fromDocumentDetails.getDocumentChangeHistory, getDocumentDetailsState);
export const getChangeHistoryLoadStatus = compose(fromDocumentDetails.getChangeHistoryLoadStatus, getDocumentDetailsState);
export const getDocumentDistributedStatusData = compose(fromDocumentDetails.getDocumentDistributedStatus, getDocumentDetailsState);
export const getDocumentChangeHistoryListTotalCount = compose(fromDocumentDetails.getDocumentChangeHistoryListTotalCount, getDocumentDetailsState);
export const getDocumentChangeHistoryListDataTableOptions = compose(fromDocumentDetails.getDocumentChangeHistoryListDataTableOptions, getDocumentDetailsState);


export const getDocumentDistributionHistory = compose(fromDocumentDetails.getDocumentDistributionHistory, getDocumentDetailsState);
export const getDistributionHistoryLoadStatus = compose(fromDocumentDetails.getDistributionHistoryLoadStatus, getDocumentDetailsState);
export const getDistributionHistoryListTotalCount = compose(fromDocumentDetails.getDistributionHistoryListTotalCount, getDocumentDetailsState);
export const getDistributionHistoryListDataTableOptions = compose(fromDocumentDetails.getDistributionHistoryListDataTableOptions, getDocumentDetailsState);


export const getEmployeeActionStatus = compose(fromDocumentDetails.getEmployeeActionStatus, getDocumentDetailsState);
export const getEmployeeStatusList = compose(fromDocumentDetails.getEmployeeStatusList, getDocumentDetailsState);
export const getEmployeeStatusLoadStatus = compose(fromDocumentDetails.getEmployeeStatusLoadStatus, getDocumentDetailsState);
export const getEmployeeStatusListTotalCount = compose(fromDocumentDetails.getEmployeeStatusListTotalCount, getDocumentDetailsState);
export const getEmployeeStatusListDataTableOptions = compose(fromDocumentDetails.getEmployeeStatusListDataTableOptions, getDocumentDetailsState);

export const getCQCPurchaseStatus = compose(fromCompany.getCQCPurchaseStatus, getCompanyState);
export const getCQCPurchaseDetailsLoadingStatus = compose(fromCompany.getCQCPurchaseDetailsLoadingStatus, getCompanyState);
export const getCQCSites = compose(fromCompany.getCQCSites, getCompanyState);
export const getCQCFileTypesBySiteId = compose(fromDocumentDetails.getCQCFileTypesBySiteId, getDocumentDetailsState);
export const getCQCUsersBySiteId = compose(fromDocumentDetails.getCQCUsersBySiteId, getDocumentDetailsState);
export const getCQCStandardsBySiteId = compose(fromDocumentDetails.getCQCStandardsBySiteId, getDocumentDetailsState);
export const getCQCCategoriesBySiteId = compose(fromDocumentDetails.getCQCCategoriesBySiteId, getDocumentDetailsState);


// Document detials : End


export function getDocumentReviewState(state$: Observable<State>) {
    return state$.select(state => state.documentReviewState);
}

export const getReviewDocument = compose(fromDocumentReview.getReviewDocument, getDocumentReviewState);
export const getDocumentPreviousVersion = compose(fromDocumentReview.getDocumentPreviousVersion, getDocumentReviewState);
export const getCurrentSelectedBlock = compose(fromDocumentReview.getCurrentSelectedBlock, getDocumentReviewState);

// contract personalisation  : start
export function getContractPersonalisationState(state$: Observable<State>) {
    return state$.select(state => state.employeeContractPersonalisationState);
}

export const getContractDetails = compose(contractPersonalisation.getContractDetails, getContractPersonalisationState);
export const getContractEmployees = compose(contractPersonalisation.getContractEmployees, getContractPersonalisationState);
export const getContractDetailsLoadedState = compose(contractPersonalisation.getContractDetailsLoadedState, getContractPersonalisationState);
export const getContractEmployeesList = compose(contractPersonalisation.getContractEmployeesList, getContractPersonalisationState);
export const getContractEmplogetContractEmployeesListTotalCount = compose(contractPersonalisation.getContractEmployeesListTotalCount, getContractPersonalisationState);
export const getContractEmployeesListDataTableOptions = compose(contractPersonalisation.getContractEmployeesListDataTableOptions, getContractPersonalisationState);
export const hasDocumentPersonalisedState = compose(contractPersonalisation.hasDocumentPersonalisedState, getContractPersonalisationState);
export const getPersonalisedEmployeeDocuments = compose(contractPersonalisation.getPersonalisedEmployeeDocuments, getContractPersonalisationState);
export const getPersonalisedEmployeeDocumentsTotalCount = compose(contractPersonalisation.getPersonalisedEmployeeDocumentsTotalCount, getContractPersonalisationState);
export const getPersonalisedEmployeeDocumentsDataTableOptions = compose(contractPersonalisation.getPersonalisedEmployeeDocumentsDataTableOptions, getContractPersonalisationState);
export const getPersonalisedContractDetails = compose(contractPersonalisation.getPersonalisedContractDetails, getContractPersonalisationState);
export const getSelectedEmployeesToDistribute = compose(contractPersonalisation.getSelectedEmployeesToDistribute, getContractPersonalisationState);
export const getHasFileIdentifier = compose(contractPersonalisation.getHasFileIdentifier, getContractPersonalisationState);
// contract personalisation : end


// incident details functions - start
export function getIncidentState(state$: Observable<State>) {
    return state$.select(state => state.incidentState);
}
export const getIncidentId = compose(fromIncident.getIncidentId, getIncidentState);
export const getIncidentCompanyAddress = compose(fromIncident.getIncidentCompanyAddress, getIncidentState);
export const getIncidentSelectedUserEmployeeDetails = compose(fromIncident.getIncidentSelectedUserEmployeeDetails, getIncidentState);
export const getIncidentReportedByDetails = compose(fromIncident.getIncidentReportedByDetails, getIncidentState);
export const getIncidentAboutYouDetailsProgressStatus = compose(fromIncident.getIncidentAboutYouDetailsAddUpdateProgressStatus, getIncidentState);
export const getIncidentCompanyAddressDetailsGetProgressStatus = compose(fromIncident.getIncidentCompanyAddressDetailsGetProgressStatus, getIncidentState);
export const getIncidentSelectedUserEmployeeDetailsGetProgressStatus = compose(fromIncident.getIncidentSelectedUserEmployeeDetailsGetProgressStatus, getIncidentState);
export const getInjuredPartyData = compose(fromIncident.getInjuredPartyData, getIncidentState);
export const getInjuredPersondata = compose(fromIncident.getInjuredPersondata, getIncidentState);
export const getInjuredPartyLoadedStatus = compose(fromIncident.getInjuredPartyLoadedStatus, getIncidentState);
export const getInjuredPersonSelectedUserEmpDetails = compose(fromIncident.getInjuredPersonSelectedUserEmpDetails, getIncidentState);
export const getIncidentAboutYouDetailsGetProgressStatus = compose(fromIncident.getIncidentAboutYouDetailsGetProgressStatus, getIncidentState);
export const getIncidentUpdateStatus = compose(fromIncident.getIncidentUpdateStatus, getIncidentState);
export const getIncidentDetails = compose(fromIncident.getIncidentDetails, getIncidentState);
export const getIncidentInjurePersonDetailsAddUpdateStatus = compose(fromIncident.getIncidentInjurePersonDetailsAddUpdateStatus, getIncidentState);

export const getIncidentAboutIncidentDetails = compose(fromIncident.getIncidentAboutIncidentDetails, getIncidentState);
export const getIncidentAboutIncidentDetailsAddUpdateProgressStatus = compose(fromIncident.getIncidentAboutIncidentDetailsAddUpdateProgressStatus, getIncidentState);
export const getIncidentAboutIncidentDetailsGetProgressStatus = compose(fromIncident.getIncidentAboutIncidentDetailsGetProgressStatus, getIncidentState);

export const getIncidentReportedToData = compose(fromIncident.getIncidentReportedTo, getIncidentState);
export const getIncidentRiddorSaveStatus = compose(fromIncident.getIncidentRiddorSaveStatus, getIncidentState);

export const getIncidentInvSections = compose(fromIncident.getIncidentInvSections, getIncidentState);
export const getRiskAssessments = compose(fromIncident.getRiskAssessments, getIncidentState);
export const getMethodStatements = compose(fromIncident.getMethodStatements, getIncidentState);
// incident details functions - end


export function getProcedureState(state$: Observable<State>) {
    return state$.select(state => state.procedureState);
}
export const getProcedureListData = compose(fromProcedure.getProcedureList, getProcedureState);
export const getProcedureListLoadingState = compose(fromProcedure.getProcedureListLoadingState, getProcedureState);
export const getProcedureListTotalCount = compose(fromProcedure.getProcedureListTotalCount, getProcedureState);
export const getExampleProcedureListTotalCountData = compose(fromProcedure.getExampleProcedureListTotalCount, getProcedureState);
export const getProcedureListDataTotalCountData = compose(fromProcedure.getProcedureListDataTotalCount, getProcedureState);
export const getProcedureListDataTableOptions = compose(fromProcedure.getProcedureListDataTableOptions, getProcedureState);
export const getCopiedProcedure = compose(fromProcedure.getCopiedProcedure, getProcedureState);
export const getSelectedFullEnityProcedureData = compose(fromProcedure.getSelectedFullEnityProcedure, getProcedureState);


//Bulk update : start

export function getbulkUpdateState(state$: Observable<State>) {
    return state$.select(state => state.employeeBulkUpdateState);
}

export const getBulkUpdateEmployeesData = compose(fromEmployeeBulkUpdate.getBulkUpdateEmployees, getbulkUpdateState);
export const getBulkUpdateEmployeesCount = compose(fromEmployeeBulkUpdate.getBulkUpdateEmployeesCount, getbulkUpdateState);
export const getBulkUpdateEmployeesDataTableOptions = compose(fromEmployeeBulkUpdate.getBulkUpdateEmployeesDataTableOptions, getbulkUpdateState);
export const getBulkUpdateEmployeesLoading = compose(fromEmployeeBulkUpdate.getBulkUpdateEmployeesLoadingStatus, getbulkUpdateState);
export const getEmployeeBulkUpdateStatusMessage = compose(fromEmployeeBulkUpdate.getBulkUpdateStatusMessage, getbulkUpdateState);
export const getEmployeeBulkUpdateStatus = compose(fromEmployeeBulkUpdate.getBulkUpdateStatus, getbulkUpdateState);
export const getBulkUpdateAutoSaveStatus = compose(fromEmployeeBulkUpdate.getAutoSaveStatus, getbulkUpdateState);

//Bulk update : end

//OnBoarding type : start
export function getOnBoardingState(state$: Observable<State>) {
    return state$.select(state => state.onBoardingState);
}
export const getOnBoardingSteps = compose(fromOnBoarding.getOnBoardingSteps, getOnBoardingState);
//OnBoarding type : start

//User profiles : start
export const getUserProfilesLoadedStatus = compose(fromCompany.getUserProfilesLoaded, getCompanyState);
export const getUserProfilesptionsData = compose(fromCompany.getUserProfilesOptionsList, getCompanyState);
export const getUserProfilesData = compose(fromCompany.getUserProfilesData, getCompanyState);
//User Profiles : end

// manage department functions
export function getManageDepartmentState(state$: Observable<State>) {
    return state$.select(state => state.manageDepartmentState);
}

export const getCompanyDepartmentsData = compose(fromManageDepartmentState.getCompanyDepartments, getManageDepartmentState);
export const getCompanyEmployeesData = compose(fromManageDepartmentState.getCompanyEmployees, getManageDepartmentState);
export const getCompanyDepartmentEmployeesData = compose(fromManageDepartmentState.getCompanyDepartmentEmployees, getManageDepartmentState);
export const getCompanyDepartmentAddStatus = compose(fromManageDepartmentState.getCompanyDepartmentAddStatus, getManageDepartmentState);
export const getCompanyDepartmentUpdateStatus = compose(fromManageDepartmentState.getCompanyDepartmentUpdateStatus, getManageDepartmentState);
export const getCompanyDepartmentRemoveStatus = compose(fromManageDepartmentState.getCompanyDepartmentRemoveStatus, getManageDepartmentState);
export const getSelectedEmployeeBasicInfoData = compose(fromManageDepartmentState.getSelectedEmployeeBasicInfo, getManageDepartmentState);
export const getCompanyDepartmentData = compose(fromManageDepartmentState.getCompanyDepartment, getManageDepartmentState);
// end of manage department 


//start Coshh inventory

export function getCoshhInventoryState(state$: Observable<State>) {
    return state$.select(state => state.coshhInventoryState);
}
export const getCOSHHInventoryListData = compose(fromCoshhInventory.getCOSHHInventoryList, getCoshhInventoryState);
export const getCOSHHInventoryListDataLoadingState = compose(fromCoshhInventory.getCOSHHInventoryListDataLoading, getCoshhInventoryState);
export const getCOSHHInventoryTotalRecordsCount = compose(fromCoshhInventory.getCOSHHInventoryTotalRecords, getCoshhInventoryState);
export const getCOSHHInventoryListDataTableOptions = compose(fromCoshhInventory.getCOSHHInventoryListDataTableOptions, getCoshhInventoryState);
export const getCOSHHInventoryForSelectedIdData = compose(fromCoshhInventory.getCOSHHInventoryForSelectedId, getCoshhInventoryState);

//end of coshh inventory


// Method Statements :start
export function getMethodStatementsState(state$: Observable<State>) {
    return state$.select(state => state.methodStatementsState);
}

export const getMethodStatementsListLoadingState = compose(fromMethodStatementsState.getMethodStatementsListLoadingState, getMethodStatementsState);
export const getHasMSFiltersChangedData = compose(fromMethodStatementsState.getHasMSFiltersChanged, getMethodStatementsState);
export const getMSFilterApiRequest = compose(fromMethodStatementsState.getMSFilterApiRequest, getMethodStatementsState);
export const getMethodStatementsStats = compose(fromMethodStatementsState.getMethodStatementsStats, getMethodStatementsState);

export const getLiveMethodStatementsList = compose(fromMethodStatementsState.getLiveMethodStatementsList, getMethodStatementsState);
export const getLiveMethodStatementsListTotalCount = compose(fromMethodStatementsState.getLiveMethodStatementsListTotalCount, getMethodStatementsState);
export const getLiveMethodStatementsListDataTableOptions = compose(fromMethodStatementsState.getLiveMethodStatementsListDataTableOptions, getMethodStatementsState);

export const getPendingMethodStatementsList = compose(fromMethodStatementsState.getPendingMethodStatementsList, getMethodStatementsState);
export const getPendingMethodStatementsListTotalCount = compose(fromMethodStatementsState.getPendingMethodStatementsListTotalCount, getMethodStatementsState);
export const getPendingMethodStatementsListDataTableOptions = compose(fromMethodStatementsState.getPendingMethodStatementsListDataTableOptions, getMethodStatementsState);

export const getCompletedMethodStatementsList = compose(fromMethodStatementsState.getCompletedMethodStatementsList, getMethodStatementsState);
export const getCompletedMethodStatementsListTotalCount = compose(fromMethodStatementsState.getCompletedMethodStatementsListTotalCount, getMethodStatementsState);
export const getCompletedMethodStatementsListDataTableOptions = compose(fromMethodStatementsState.getCompletedMethodStatementsListDataTableOptions, getMethodStatementsState);

export const getArchivedMethodStatementsList = compose(fromMethodStatementsState.getArchivedMethodStatementsList, getMethodStatementsState);
export const getArchivedMethodStatementsListTotalCount = compose(fromMethodStatementsState.getArchivedMethodStatementsListTotalCount, getMethodStatementsState);
export const getArchivedMethodStatementsListDataTableOptions = compose(fromMethodStatementsState.getArchivedMethodStatementsListDataTableOptions, getMethodStatementsState);

export const getExampleMethodStatementsList = compose(fromMethodStatementsState.getExampleMethodStatementsList, getMethodStatementsState);
export const getExampleMethodStatementsListTotalCount = compose(fromMethodStatementsState.getExampleMethodStatementsListTotalCount, getMethodStatementsState);
export const getExampleMethodStatementsListDataTableOptions = compose(fromMethodStatementsState.getExampleMethodStatementsListDataTableOptions, getMethodStatementsState);

export const getMSSaftyResponsibilities = compose(fromManageMethodStatements.getMSSaftyResponsibilities, getManageMethodStatementState);
export const getMSSaftyResponsibilitiesTotalCount = compose(fromManageMethodStatements.getMSSaftyResponsibilitiesTotalCount, getManageMethodStatementState);
export const getMSSaftyResponsibilitiesDataTableOptions = compose(fromManageMethodStatements.getMSSaftyResponsibilitiesDataTableOptions, getManageMethodStatementState);

export const getProceduresForMSData = compose(fromManageMethodStatements.getProceduresForMS, getManageMethodStatementState);
export const getProcedureForMSTotalCountNumber = compose(fromManageMethodStatements.getProcedureForMSTotalCount
    , getManageMethodStatementState);
export const getProcedureForMSDataTableOptionsData = compose(fromManageMethodStatements.getProcedureForMSDataTableOptions
    , getManageMethodStatementState);
export const getProceduresForMSLoadStatusValue = compose(fromManageMethodStatements.getProceduresForMSLoadStatus
    , getManageMethodStatementState);

export const getMSAttachmentOperationStatus = compose(fromManageMethodStatements.getMSAttachmentOperationStatus
    , getManageMethodStatementState);
// Method Statements :end

// plant and equipment functions
export function getPlantAndEquipmentState(state$: Observable<State>) {
    return state$.select(state => state.plantAndEquipmentState);
}

export const getPlantAndEquipmentLoadStatus = compose(fromPlantAndEquipmentState.getPlantAndEquipmentLoadStatus, getPlantAndEquipmentState);
export const getPlantAndEquipmentList = compose(fromPlantAndEquipmentState.getPlantAndEquipmentList, getPlantAndEquipmentState);
export const getPlantAndEquipmentListTotalCount = compose(fromPlantAndEquipmentState.getPlantAndEquipmentListTotalCount, getPlantAndEquipmentState);
export const getPlantAndEquipmentListListDataTableOptions = compose(fromPlantAndEquipmentState.getPlantAndEquipmentListListDataTableOptions, getPlantAndEquipmentState);
export const getSelectedPlantAndEquipment = compose(fromPlantAndEquipmentState.getSelectedPlantAndEquipment, getPlantAndEquipmentState);

// plant and equipment functions

//start of method statements

export function getManageMethodStatementState(state$: Observable<State>) {
    return state$.select(state => state.manageMethodStatementState);
}

export const getManageMethodStatementIdData = compose(fromManageMethodStatements.getMethodStatementId, getManageMethodStatementState);
export const getManageMethodStatementData = compose(fromManageMethodStatements.getMethodStatement, getManageMethodStatementState);
export const getResponsibilities = compose(fromLookup.getResponsibilities, getLookUpState);
export const getMSSupportingDocs = compose(fromManageMethodStatements.getMSSupportingDocs, getManageMethodStatementState);
export const getMSSupportingDocsImmutableList = compose(fromManageMethodStatements.getMSSupportingDocsImmutableList, getManageMethodStatementState);

export const getMethodStatementStatusUpdate = compose(fromManageMethodStatements.getMethodStatementStatusUpdate, getManageMethodStatementState);
export const getMSAttachmentIds = compose(fromManageMethodStatements.getMSAttachmentIds, getManageMethodStatementState);
export const getMSDocument = compose(fromManageMethodStatements.getMSDocument, getManageMethodStatementState);
export const getMSRiskassessmentDeleteStatus = compose(fromManageMethodStatements.getMSRiskassessmentDeleteStatus, getManageMethodStatementState);
export const getMSRiskAssessments = compose(fromManageMethodStatements.getMSRiskAssessments, getManageMethodStatementState);
export const getMSRiskAssessmentMap = compose(fromManageMethodStatements.getMSRiskAssessmentMap, getManageMethodStatementState)
export const getMSRiskAssessmentsTotalCount = compose(fromManageMethodStatements.getMSRiskAssessmentsTotalCount, getManageMethodStatementState);
export const getMSRiskAssessmentsDataTableOptions = compose(fromManageMethodStatements.getMSRiskAssessmentsDataTableOptions, getManageMethodStatementState);

//end of method statements


//start of construction phase plans
export function getManageCPPState(state$: Observable<State>) {
    return state$.select(state => state.manageCPPState);
}


export const getCPPIdData = compose(fromManageCPP.getCPPId, getManageCPPState);
export const getCPPData = compose(fromManageCPP.getCPP, getManageCPPState);
export const getCPPAdditionalInfoData = compose(fromManageCPP.getCPPAdditionalInfo, getManageCPPState);

export const getCPPDocumentsTotalCountData = compose(fromManageCPP.getCPPDocumentsTotalCount, getManageCPPState);
export const getHasCPPAdditionalInfoLoadedData = compose(fromManageCPP.getHasCPPAdditionalInfoLoaded, getManageCPPState);
export const getCPPDocumentId = compose(fromManageCPP.getCPPDocumentId, getManageCPPState);

export function getCPPDocumentsListData(request: AtlasApiRequest) {
    return compose((state$) => {
        return fromManageCPP.getCPPDocumentsListPagedList(state$, request)
    }, getManageCPPState)
}
export const getCPPSupportEvidencePageListData = compose(fromManageCPP.getCPPSupportEvidencePageList, getManageCPPState);


//end of construction phase plans

//RA Shared state

export function getRASharedState(state$: Observable<State>) {
    return state$.select(state => state.raSharedState);
}


export const getLiveRALoadedData = compose(fromRASharedState.getLiveRALoaded, getRASharedState);
export const getLiveRiskAssesmentsListData = compose(fromRASharedState.getLiveRiskAssesmentsList, getRASharedState);
export const getLiveRiskAssesmentsTotalCountData = compose(fromRASharedState.getLiveRiskAssesmentsTotalCount, getRASharedState);
export const getLiveRiskAssessmentsDataTableOptions = compose(fromRASharedState.getLiveRiskAssessmentsDataTableOptions, getRASharedState);

//End of RA shared state

//Risk Assessment Types
export const getRiskAssessmentTypesData = compose(fromLookup.getriskAssessmentTypes, getLookUpState);
//End of Risk Assessment Types


//Start of risk assessments
export function getRiskAssessmentState(state$: Observable<State>) {
    return state$.select(state => state.riskAssessmentState);
}
export const getRiskAssessmentCountByStatus = compose(fromRiskAssessments.getRiskAssessmentCountByStatus, getRiskAssessmentState);
export const getCurrentRiskAssessment = compose(fromRiskAssessments.getCurrentAssessment, getRiskAssessmentState);
export const getCurrentRiskAssessmentId = compose(fromRiskAssessments.getCurrentRiskAssessmentId, getRiskAssessmentState);
export const getCurrentRiskAssessmentMeasures = compose(fromRiskAssessments.getCurrentAssessmentMeasures, getRiskAssessmentState);
export const getCurrentRiskAssessmentDocuments = compose(fromRiskAssessments.getCurrentAssessmentDocuments, getRiskAssessmentState);
export const getCurrentRiskAssessmentDocumentsLength = compose(fromRiskAssessments.getCurrentAssessmentDocumentsLength, getRiskAssessmentState);
export const getRiskAssessmentInformationItems = compose(fromRiskAssessments.getRiskAssessmentInformationItems, getRiskAssessmentState);
export const getRiskAssessmentAdditionalControls = compose(fromRiskAssessments.getCurrentAssessmentAdditionalControls, getRiskAssessmentState);
export const getAdditionalControlsRiskAssessmentsList = compose(fromRiskAssessments.getAdditionalControlsRiskAssessmentsList, getRiskAssessmentState);
export const getRAAdditionalControlsRiskAssessmentsList = compose(fromRiskAssessments.getRAAdditionalControlsRiskAssessmentsList, getRiskAssessmentState);
export const getAdditionalControlsCategoryText = compose(fromRiskAssessments.getAdditionalControlsCategoryText, getRiskAssessmentState);
export const getHazardsData = compose(fromRiskAssessments.getAllHazardsData, getRiskAssessmentState);
export const getHazardsLoadingData = compose(fromRiskAssessments.getAllHazardsLoading, getRiskAssessmentState);
export const getHazardsCount = compose(fromRiskAssessments.getHazardCount, getRiskAssessmentState);
export const getSelectedHazards = compose(fromRiskAssessments.getSelectedHazardsData, getRiskAssessmentState);
export const getCurrentRiskAssessmentFilterDocuments = compose(fromRiskAssessments.getCurrentAssessmentFilterDocuments, getRiskAssessmentState);
export const getCurrentRiskAssessmentDocumentListDataTableOptions = compose(fromRiskAssessments.getCurrentRiskAssessmentDocumentListDataTableOptions, getRiskAssessmentState);
export const getExampleRoutesOfExposureData = compose(fromRiskAssessments.getExampleRoutesOfExposureData, getRiskAssessmentState);
export const getCurrentRiskAssessmentRoutesOfExposureData = compose(fromRiskAssessments.getCurrentRiskAssessmentRoutesOfExposureData, getRiskAssessmentState);
export const getCurrentRiskAssessmentSubstances = compose(fromRiskAssessments.getCurrentRiskAssessmentSubstances, getRiskAssessmentState);
export const getCurrentRiskAssessmentSubstancesTotalCount = compose(fromRiskAssessments.getCurrentRiskAssessmentSubstancesTotalCount, getRiskAssessmentState);
export const getCurrentRiskAssessmentSubstancesDataTableOptions = compose(fromRiskAssessments.getCurrentRiskAssessmentSubstancesDataTableOptions, getRiskAssessmentState);
export const getcoshhInventoryData = compose(fromRiskAssessments.getcoshhInventoryData, getRiskAssessmentState);
export const getcoshhInventoryList = compose(fromRiskAssessments.getcoshhInventoryList, getRiskAssessmentState);
export const getSelectedHazardsCount = compose(fromRiskAssessments.getSelectedHazardsCount, getRiskAssessmentState);
export const getRiskAssessmentName = compose(fromRiskAssessments.getRiskAssessmentName, getRiskAssessmentState);
export const getCurrentRiskAssessmentHazards = compose(fromRiskAssessments.getCurrentRiskAssessmentHazards, getRiskAssessmentState);
export const getHazardLoading = compose(fromRiskAssessments.getHazardsLoading, getRiskAssessmentState);
export const getRiskAssessmentTasksData = compose(fromRiskAssessments.getRiskAssessmentTasksData, getRiskAssessmentState);
export const getRiskAssessmentHazardsData = compose(fromRiskAssessments.getRiskAssessmentHazardsData, getRiskAssessmentState);
export const getRiskAssessmentTasksListTotalCount = compose(fromRiskAssessments.getRiskAssessmentTasksListTotalCount, getRiskAssessmentState);
export const getRiskAssessmentTasksListPageInformation = compose(fromRiskAssessments.getRiskAssessmentTasksListPageInformation, getRiskAssessmentState);
export const getRiskAssessmentTasksListLoadingStatus = compose(fromRiskAssessments.getRiskAssessmentTasksListLoadingStatus, getRiskAssessmentState);
export const getRiskAssessmentTaskById = compose(fromRiskAssessments.getRiskAssessmentTaskById, getRiskAssessmentState);
export const getRiskAssessmentTypeId = compose(fromRiskAssessments.getCurrentRiskAssessmentTypeId, getRiskAssessmentState);
export const getRiskAssessmentDocument = compose(fromRiskAssessments.getRiskAssessmentDocument, getRiskAssessmentState);
export const getCurrentRiskAssessmentControls = compose(fromRiskAssessments.getCurrentRiskAssessmentControls, getRiskAssessmentState);
export const getFrequentlyUsedControls = compose(fromRiskAssessments.getFrequentlyUsedControls, getRiskAssessmentState);
export const getSuggestedControls = compose(fromRiskAssessments.getSuggestedControls, getRiskAssessmentState);
export const getAllControls = compose(fromRiskAssessments.getAllControls, getRiskAssessmentState);
export const getAllControlsLoadingData = compose(fromRiskAssessments.getAllControlsLoading, getRiskAssessmentState);
export const getAllControlsCount = compose(fromRiskAssessments.getAllControlsCount, getRiskAssessmentState);
export const geRiskAssessmentReviewStatus = compose(fromRiskAssessments.geRiskAssessmentReviewStatus, getRiskAssessmentState);
export const getHazardNotes = compose(fromRiskAssessments.getHazardNotes, getRiskAssessmentState);
export const getROENotes = compose(fromRiskAssessments.getROENotes, getRiskAssessmentState);
export const getControlsNotes = compose(fromRiskAssessments.getControlsNotes, getRiskAssessmentState);
//End of risk assessments

// Start Help
export function getHelpState(state$: Observable<State>) {
    return state$.select(state => state.helpState);
}
export const getWhatsNewLatestReleases = compose(fromHelp.getWhatsNewLatestReleases, getHelpState);
export const getWhatsNewLatestReleasesCount = compose(fromHelp.getWhatsNewLatestReleasesCount, getHelpState);
export const getHelpAreasInfo = compose(fromHelp.getHelpAreas, getHelpState);
export const getHelpContentInfo = compose(fromHelp.getHelpContent, getHelpState);
export const getHelpAreasInfoProgressStatus = compose(fromHelp.getHelpAreasProgressStatus, getHelpState);
export const getHelpContentInfoProgressStatus = compose(fromHelp.getHelpContentProgressStatus, getHelpState);
export const getHelpContentBodyInfoProgressStatus = compose(fromHelp.getHelpContentBodyProgressStatus, getHelpState);
export const getHelpSearchContentInfo = compose(fromHelp.getHelpSearchContent, getHelpState);
export const getHelpSearchContentCount = compose(fromHelp.getHelpSearchContentCount, getHelpState);
export const getAllHelpContents = compose(fromHelp.getAllHelpContents, getHelpState);
export const getAllHelpContentsCount = compose(fromHelp.getAllHelpContentsCount, getHelpState);
export const getAllHelpContentsTableOptions = compose(fromHelp.getAllHelpContentsTableOptions, getHelpState);
export const getAllHelpContentsLoadStatus = compose(fromHelp.getAllHelpContentsLoadStatus, getHelpState);
export const getCurrentWhatsNewLatestReleases = compose(fromHelp.getCurrentWhatsNewLatestReleases, getHelpState);
export const getSelectedArticleLoadingStatus = compose(fromHelp.getSelectedArticleLoadingStatus, getHelpState);

export const getHelpSearchContentLoadingStatus = compose(fromHelp.getHelpSearchContentLoadingStatus, getHelpState);

//End Help

// company-structure
export function getCompanyStructutreState(state$: Observable<State>) {
    return state$.select(state => state.companyStructureState);
}
export const getCompanyStructureData = compose(fromCompanyStructure.getcompanyStructureData, getCompanyStructutreState);
export const getSiteStructureData = compose(fromCompanyStructure.getSiteStructureData, getCompanyStructutreState);
// end of company structure
// Search
export function getSearchState(state$: Observable<State>) {
    return state$.select(state => state.searchState);
}

export const getSearchEntitiesData = compose(fromSearchState.getSearchEntities, getSearchState);
export const getSortByData = compose(fromSearchState.getSortBy, getSearchState);
export const getSearchResultsData = compose(fromSearchState.getSearchResults, getSearchState);
export const getSearchRequestData = compose(fromSearchState.getSearchRequest, getSearchState);
export const getSearchResultsTotalCountData = compose(fromSearchState.getSearchResultsTotalCount, getSearchState);
export const getSearchResultsLoadedData = compose(fromSearchState.getSearchResultsLoaded, getSearchState);

export function getSearchResultsPagedList(request: AtlasApiRequestWithParams) {
    return compose((state$) => {
        return fromSearchState.getSearchResultsPagedList(state$, request)
    }, getSearchState)
}
//End of Search

// year end procedures start
export function getYearEndProcedureState(state$: Observable<State>) {
    return state$.select(state => state.yearEndProcedureState);
}

export const getYearEndProcedureData = compose(fromYearEndProcedures.getYearEndProcedure, getYearEndProcedureState);
export const getYearEndProcedureResultsData = compose(fromYearEndProcedures.getYearEndProcedureResults, getYearEndProcedureState);
export const getYearEndProcedureResultsLoadedState = compose(fromYearEndProcedures.getYearEndProcedureResultsLoaded
    , getYearEndProcedureState);
export const getYearEndProcedureApiRequestData = compose(fromYearEndProcedures.getYearEndProcedureApiRequest, getYearEndProcedureState);
export const getYEPResultDataTableOptionsData = compose(fromYearEndProcedures.getYEPResultDataTableOptions, getYearEndProcedureState);
export const getYEPResultsTotalCountData = compose(fromYearEndProcedures.getYEPResultsTotalCount, getYearEndProcedureState);
export const getZeroEntitlementEmployeesData = compose(fromYearEndProcedures.getZeroEntitlementEmployees, getYearEndProcedureState);
export const getPendingHolidayAbsenceRequestsData = compose(fromYearEndProcedures.getPendingHolidayAbsenceRequests
    , getYearEndProcedureState);
export const getPendingRequestsLoadedState = compose(fromYearEndProcedures.getPendingRequestsLoaded
    , getYearEndProcedureState);
export const getPendingRequestsApiRequestData = compose(fromYearEndProcedures.getPendingRequestsApiRequest, getYearEndProcedureState);
export const getPendingRequestsDataTableOptionsData = compose(fromYearEndProcedures.getPendingRequestsDataTableOptions
    , getYearEndProcedureState);
export const getPendingRequestsTotalCountData = compose(fromYearEndProcedures.getPendingRequestsTotalCount
    , getYearEndProcedureState);
// end of year end procedures

//start of whats new
export function getWhatsNewState(state$: Observable<State>) {
    return state$.select(state => state.whatsNewState)
}

export const getWhatsNewItems = compose(fromWhatsNew.getWhatsNewItems, getWhatsNewState);
export const getWhatsNewUserMaps = compose(fromWhatsNew.getWhatsNewUserMaps, getWhatsNewState);
export const getWhatsNewPopupStatus = compose(fromWhatsNew.getWhatsNewPopupStatus, getWhatsNewState);
//end of whats new


//start of Icon Management
export function getIconManagementState(state$: Observable<State>) {
    return state$.select(state => state.iconManagementState)
}

export const getHazardsOrControlsListLoadingState = compose(fromIconManagementState.getHazardsOrControlsListLoadingState, getIconManagementState);
export const getHazardsOrControlsData = compose(fromIconManagementState.getHazardsOrControlsList, getIconManagementState);
export const getHazardsOrControlsListTotalCountData = compose(fromIconManagementState.getHazardsOrControlsListTotalCount, getIconManagementState);
export const getHazardsOrControlsListDataTableOptionsData = compose(fromIconManagementState.getHazardsOrControlsListDataTableOptions, getIconManagementState);
export const getHazardsOrControlsApiRequestData = compose(fromIconManagementState.getHazardsOrControlsApiRequest, getIconManagementState);
export const getSelectedIcon = compose(fromIconManagementState.getSelectedIcon, getIconManagementState);
export const getRemoveActionStatus = compose(fromIconManagementState.getRemoveActionStatus, getIconManagementState)
export const getBulkRemoveActionStatus = compose(fromIconManagementState.getBulkRemoveActionStatus, getIconManagementState)
export const getIconAddUpdateCompleteStatus = compose(fromIconManagementState.getIconAddUpdateCompleteStatus, getIconManagementState);
//end of  Icon Management