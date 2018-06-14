import { APP_BASE_HREF, DatePipe } from '@angular/common';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { RouterStoreModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { LocaleDatePipe, TranslationModule } from 'angular-l10n';
import { DragulaModule } from 'ng2-dragula';
import { CookieModule } from 'ngx-cookie';

import { CalendarEffects } from '../calendar/effects/calendar.effects';
import { ChecklistEffects } from '../checklist/effects/checklist.effects';
import { BulkPasswordResetCompanyEffects } from '../company/bulk-password-reset/effects/bulk-password-reset.effects';
import { CurrentCompanyEffects } from '../company/effects/current-company.effects';
import { ManageDepartmentEffects } from '../company/manage-departments/effects/manage-departments.effects';
import { SitesEffects } from '../company/sites/effects/sites.effects';
import { CompanyUserEffects } from '../company/user/effects/user.effects';
import { YearEndProcedureEffects } from '../company/yearendprocedures/effects/yearendprocedure-effects';
import { ConstructionPhasePlanListEffects } from '../construction-phase-plans/effects/construction-phase-plans.effects';
import { COSHHInventoryEffects } from '../coshh-inventory/effects/coshh-inventory.effects';
import {
  ContractPersonalisationEffects,
} from '../document/contract-personalisation/effects/contract-personalisation.effects';
import { DocumentDetailsEffects } from '../document/document-details/effects/document-details.effects';
import { DocumentReviewEffects } from '../document/document-review/effects/document-review.effects';
import { DocumentEffects } from '../document/effects/documents.effects';
import { DocumentInformationbarEffects } from '../document/effects/information-bar-effects';
import { PersonalDocumentEffects } from '../document/effects/personal-documents.effects';
import { EmployeeDelegationEffects } from '../employee/delegation/effects/employee-delegation.effects';
import { EmployeeAdministrationDetailsEffects } from '../employee/effects/employee-administration.effects';
import { EmployeeBankDetailsEffects } from '../employee/effects/employee-bank.effects';
import { EmployeeBenefitsEffects } from '../employee/effects/employee-benefits.effects';
import { EmployeeContactsEffects } from '../employee/effects/employee-contacts.effects';
import { EducationHistoryEffects } from '../employee/effects/employee-education-history.effects';
import { EmployeeJobHistoryEffects } from '../employee/effects/employee-job-history.effects';
import { EmployeePersonalEffects } from '../employee/effects/employee-personal.effects';
import { EmployeePreviousEmploymentHistoryEffects } from '../employee/effects/employee-previous-employment-history.effects';
import { QualificationHistoryEffects } from '../employee/effects/employee-qualification-history.effects';
import { EmployeeSalaryHistoryEffects } from '../employee/effects/employee-salary-history.effects';
import { EmployeeStatisticsEffects } from '../employee/effects/employee-statistics.effects';
import { EmployeeTimelineEffects } from '../employee/effects/employee-timeline.effects';
import { TrainingHistoryEffects } from '../employee/effects/employee-training-history.effects';
import { EmployeeVehicleInfoEffects } from '../employee/effects/employee-vehicle-info.effects';
import { EmployeeEffects } from '../employee/effects/employee.effects';
import { EmployeeBulkUpdateEffects } from '../employee/employee-bulkupdate/effects/employee-bulkupdate.effects';
import { EmployeeGroupEffects } from '../employee/employee-group/effects/employee-group.effects';
import { EmployeeImportEffects } from '../employee/employee-import/effects/employee-import.effects';
import { ManageEmployeesListDataLoadEffects } from '../employee/employee-management/effects/employee-manage.effetcs';
import { EmployeeFullEntityService } from '../employee/services/employee-fullentity.service';
import { HelpEffects } from '../help/effects/help.effects';
import { AbsenceTypeEffects } from '../holiday-absence/absencetype/effects/absencetype.effects';
import { HolidayAbsenceEffects } from '../holiday-absence/effects/holiday-absence.effects';
import { InformationbarEffects } from '../home/effects/information-bar.effects';
import { NewsEffects } from '../home/effects/news.effects';
import { ReferralEffects } from '../home/effects/referral.effects';
import { ServiceReportEffects } from '../home/effects/service-reporting.effects';
import { TasksInfoEffects } from '../home/effects/tasks.effects';
import { TodaysOverviewEffects } from '../home/effects/todays-overview.effects';
import { WhatsNewEffects } from '../home/effects/whats-new.effect';
import { IncidentLogEffects } from '../incident-log/effects/incident-log.effects';
import { PlantAndEquipmentEffects } from '../method-statements/plantandequipment/effects/plantandeuipment.effects';
import { PlantandequipmentService } from '../method-statements/plantandequipment/services/plantandequipment.service';
import { ProcedureEffects } from '../method-statements/procedures/effects/procedure-effects';
import { ProcedureService } from '../method-statements/procedures/services/procedure.service';
import { ReportsEffects } from '../report/effects/report-effects';
import { RiskAssessmentEffects } from '../risk-assessment/effects/risk-assessment-effects';
import { IconManagementEffects } from '../risk-assessment/icon-management/effects/icon-management-effects';
import { CompanyStructureEffects } from '../root-module/effects/company-structure.effects';
import { ConsultantInfoEffects } from '../root-module/effects/consultant-info.effects';
import { MenuEffects } from '../root-module/effects/menu.effects';
import { RestClientService } from '../shared/data/rest-client.service';
import { AuthorizationEffects } from '../shared/effects/authorization.effects';
import { CompanyEffects } from '../shared/effects/company.effects';
import { AtlasApiErrorEffects } from '../shared/effects/error.effects';
import { LookupEffects } from '../shared/effects/lookup.effects';
import { TrainingCourseEffects } from '../shared/effects/training-course.effects';
import { UserEffects } from '../shared/effects/user.effects';
import { AtlasErrorHandler } from '../shared/error-handling/atlas-error-handler';
import { ErrorService } from '../shared/error-handling/error.service';
import { ClaimsHelperService } from '../shared/helpers/claims-helper';
import { initLocalization, LocalizationConfig } from '../shared/localization-config';
import { reducer } from '../shared/reducers';
import { AuthConfig, authConfigServiceFactory } from '../shared/security/auth-config';
import { AuthGuard } from '../shared/security/auth.guard';
import { AuthorizationService } from '../shared/security/authorization.service';
import { FormBuilderService } from '../shared/services/form-builder.service';
import { MessengerService } from '../shared/services/messenger.service';
import { RouteParams } from '../shared/services/route-params';
import { StorageService } from '../shared/services/storage.service';
import { UserService } from '../shared/services/user-services';
import { TaskAddEffects } from '../task/effects/task-add.effects';
import { TaskHeadBannerEffects } from '../task/effects/task-information-bar.effects';
import { TaskUpdateEffects } from '../task/effects/task-update.effects';
import { TasksListEffects } from '../task/effects/task.list.effects';
import { TariningListEffects } from '../training/effects/training-list.effects';
import { TrainingCourseFromTrainingsEffects } from '../training/training-courses/effects/training-courses.effects';
import { TrainingReportsFromTrainingsEffects } from '../training/training-reports/effects/training-report.effects';
import { AtlasElementsModule } from './../atlas-elements/atlas-elements.module';
import { CkEditorModule } from './../atlas-elements/ck-editor/ck-editor.module';
import { BreadcrumbService } from './../atlas-elements/common/services/breadcrumb-service';
import { CheckListPageRouteResolve } from './../checklist/services/checklist-resolver.service';
import { NonworkingdaysEffects } from './../company/nonworkingdaysandbankholidays/effects/nonworkingdays-effects';
import {
  MangeConstructionPhasePlanEffects,
} from './../construction-phase-plans/manage-construction-plan/effects/manage-cpp.effects';
import { CitationDraftsEffects } from './../document/citation-drafts-documents/effects/citation-drafts.effects';
import { CompanyDocumentsEffects } from './../document/company-documents/effects/company-documents.effects';
import { ContractsEffects } from './../document/company-documents/effects/contracts.effects';
import { HandbooksEffects } from './../document/company-documents/effects/handbooks.effects';
import { DocumentDistributeEffects } from './../document/document-details/effects/document-distribute.effects.';
import { DocumentExportToCQCEffects } from './../document/document-details/effects/document-export-to-cqc.effects';
import { SharedDocumentsEffects } from './../document/effects/shared-documents.effects';
import { DocumentCategoryService } from './../document/services/document-category-service';
import { UsefulDocsEffects } from './../document/usefuldocuments-templates/effects/usefuldocs.effects';
import { EmailEffects } from './../email-shared/effects/email.effects';
import { EmployeeJobDetailsEffects } from './../employee/effects/employee-job-details.effects';
import { EmployeeAddEffects } from './../employee/employee-add/effects/employee-add.effects';
import { EmployeeSearchService } from './../employee/services/employee-search.service';
import { HolidayAbsenceRequestsEffects } from './../holiday-absence/effects/holiday-absence-requests-effects';
import { KeyDocumentsEffects } from './../home/effects/key-documents-effects';
import { MyTrainingsEffects } from './../home/effects/my-training.effects';
import { IncidentAboutIncidentEffects } from './../incident-log/incident/effects/incident-about-injury.effects';
import {
  IncidentFormalInvestigationEffects,
} from './../incident-log/incident/effects/incident-formal-investigation.effects';
import { InjuredPersonEffects } from './../incident-log/incident/effects/incident-injured-person.effects';
import { IncidentRIDDOREffects } from './../incident-log/incident/effects/incident-riddor.effects';
import { IncidentEffects } from './../incident-log/incident/effects/incident.effects';
import { MethodStatementsEffects } from './../method-statements/effects/methodstatements.effects';
import {
  ManageMethodStatementEffects,
} from './../method-statements/manage-methodstatements/effects/manage-methodstatement-effects';
import { RiskAssessmentSharedEffects } from './../risk-assessment/risk-assessment-shared/effects/ra-shared-effects';
import { RiskAssessmentSearchService } from './../risk-assessment/services/risk-assessment-search-service';
import { FileUploadService } from './../shared/services/file-upload.service';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { BaseLayoutComponent } from './base-layout/base-layout.component';
import { ChangePasswordComponent } from './base-layout/change-password/change-password.component';
import { CompanyStructureItemComponent } from './base-layout/company-structure-item/company-structure-item.component';
import { CompanyStructureComponent } from './base-layout/company-structure/company-structure.component';
import { CompanySwitchHeaderComponent } from './base-layout/company-switch-header/company-switch-header.component';
import { MenuBottomComponent } from './base-layout/menu-bottom/menu-bottom.component';
import { MenuNavComponent } from './base-layout/menu-nav/menu-nav.component';
import { NotificationIndicatorComponent } from './base-layout/notification-indicator/notification-indicator.component';
import { OnboardingStatusComponent } from './base-layout/onboarding-status/onboarding-status.component';
import { ProfileComponent } from './base-layout/profile/profile.component';
import { SearchComponent } from './base-layout/search/search.component';
import { NotificationEffects } from './effects/notification.effects';
import { OnBoardingEffects } from './effects/onboarding.effects';
import { SearchEffects } from './effects/search.effects';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { AuthCallback } from './security/auth-callback.component';
import { LocalLogout } from './security/local-logout.component';
import { SelectivePreLoading } from './selective-preloading';

// import { StoreDevtoolsModule } from '@ngrx/store-devtools';
@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    AuthCallback,
    LocalLogout,
    ProfileComponent,
    BaseLayoutComponent,
    MenuBottomComponent,
    MenuNavComponent,
    NotificationIndicatorComponent,
    ChangePasswordComponent,
    OnboardingStatusComponent,
    SearchComponent,
    SearchResultComponent,
    CompanyStructureComponent,
    CompanyStructureItemComponent,
    CompanySwitchHeaderComponent
  ],
  entryComponents: [
    CompanyStructureItemComponent
  ],
  imports: [
    BrowserModule,
    CkEditorModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpModule,
    FormsModule,
    AtlasElementsModule,
    RouterModule,
    DragulaModule,
    RouterModule.forRoot(routes, { preloadingStrategy: SelectivePreLoading }),
    StoreModule.provideStore(reducer),
    RouterStoreModule.connectRouter(),
    // StoreDevtoolsModule.instrumentOnlyWithExtension(), // use this when you want to debug store using Redux toolbar
    EffectsModule.run(TaskHeadBannerEffects),
    CookieModule.forRoot(),
    EffectsModule.run(TaskAddEffects),
    EffectsModule.run(TaskUpdateEffects),
    EffectsModule.run(MenuEffects),
    EffectsModule.run(HolidayAbsenceEffects),
    EffectsModule.run(TodaysOverviewEffects),
    EffectsModule.run(InformationbarEffects),
    EffectsModule.run(EmployeeStatisticsEffects),
    EffectsModule.run(EmployeeEffects),
    EffectsModule.run(CompanyUserEffects),
    EffectsModule.run(BulkPasswordResetCompanyEffects),
    EffectsModule.run(EmployeeSalaryHistoryEffects),
    EffectsModule.run(EmployeeJobHistoryEffects),
    EffectsModule.run(EmployeePersonalEffects),
    EffectsModule.run(EmployeeContactsEffects),
    EffectsModule.run(ConsultantInfoEffects),
    EffectsModule.run(AuthorizationEffects),
    EffectsModule.run(CalendarEffects),
    EffectsModule.run(CompanyEffects),
    EffectsModule.run(SitesEffects),
    EffectsModule.run(ChecklistEffects),
    EffectsModule.run(TasksInfoEffects),
    EffectsModule.run(KeyDocumentsEffects),
    EffectsModule.run(MyTrainingsEffects),
    EffectsModule.run(LookupEffects),
    EffectsModule.run(NotificationEffects),
    EffectsModule.run(TasksListEffects),
    EffectsModule.run(PersonalDocumentEffects),
    EffectsModule.run(EducationHistoryEffects),
    EffectsModule.run(QualificationHistoryEffects),
    EffectsModule.run(DocumentInformationbarEffects),
    EffectsModule.run(EmployeePreviousEmploymentHistoryEffects),
    EffectsModule.run(DocumentEffects),
    EffectsModule.run(SharedDocumentsEffects),
    EffectsModule.run(TrainingHistoryEffects),
    EffectsModule.run(TrainingCourseEffects),
    EffectsModule.run(EmployeeVehicleInfoEffects),
    EffectsModule.run(UserEffects),
    EffectsModule.run(TariningListEffects),
    EffectsModule.run(EmployeeBankDetailsEffects),
    EffectsModule.run(EmployeeAdministrationDetailsEffects),
    EffectsModule.run(ManageEmployeesListDataLoadEffects),
    EffectsModule.run(EmployeeTimelineEffects),
    EffectsModule.run(EmployeeGroupEffects),
    EffectsModule.run(TrainingCourseFromTrainingsEffects),
    EffectsModule.run(TrainingReportsFromTrainingsEffects),
    EffectsModule.run(EmployeeJobDetailsEffects),
    EffectsModule.run(HolidayAbsenceRequestsEffects),
    EffectsModule.run(EmployeeDelegationEffects),
    EffectsModule.run(ReportsEffects),
    EffectsModule.run(IncidentLogEffects),
    EffectsModule.run(AtlasApiErrorEffects),
    EffectsModule.run(EmployeeAddEffects),
    EffectsModule.run(NonworkingdaysEffects),
    EffectsModule.run(ServiceReportEffects),
    EffectsModule.run(NewsEffects),
    EffectsModule.run(EmployeeImportEffects),
    EffectsModule.run(ReferralEffects),
    EffectsModule.run(AbsenceTypeEffects),
    EffectsModule.run(IncidentEffects),
    EffectsModule.run(CitationDraftsEffects),
    EffectsModule.run(UsefulDocsEffects),
    EffectsModule.run(HandbooksEffects),
    EffectsModule.run(ContractsEffects),
    EffectsModule.run(CompanyDocumentsEffects),
    EffectsModule.run(ContractPersonalisationEffects),
    EffectsModule.run(EmployeeBenefitsEffects),
    EffectsModule.run(ManageDepartmentEffects),
    EffectsModule.run(CurrentCompanyEffects),
    EffectsModule.run(DocumentReviewEffects),
    EffectsModule.run(ConstructionPhasePlanListEffects),
    EffectsModule.run(OnBoardingEffects),
    EffectsModule.run(InjuredPersonEffects),
    EffectsModule.run(ProcedureEffects),
    EffectsModule.run(EmployeeBulkUpdateEffects),
    EffectsModule.run(DocumentDetailsEffects),
    EffectsModule.run(DocumentDistributeEffects),
    EffectsModule.run(COSHHInventoryEffects),
    EffectsModule.run(IncidentRIDDOREffects),
    EffectsModule.run(PlantAndEquipmentEffects),
    EffectsModule.run(ManageMethodStatementEffects),
    EffectsModule.run(MangeConstructionPhasePlanEffects),
    EffectsModule.run(RiskAssessmentSharedEffects),
    EffectsModule.run(MethodStatementsEffects),
    EffectsModule.run(RiskAssessmentEffects),
    EffectsModule.run(IncidentFormalInvestigationEffects),
    EffectsModule.run(IncidentAboutIncidentEffects),
    EffectsModule.run(DocumentExportToCQCEffects),
    EffectsModule.run(YearEndProcedureEffects),
    EffectsModule.run(HelpEffects),
    EffectsModule.run(CompanyStructureEffects),
    EffectsModule.run(SearchEffects),
    EffectsModule.run(EmailEffects),
    EffectsModule.run(WhatsNewEffects),
    EffectsModule.run(IconManagementEffects),
    TranslationModule.forRoot()
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: ErrorHandler, useClass: AtlasErrorHandler },
    ErrorService,
    SelectivePreLoading,
    AuthorizationService,
    AuthGuard,
    StorageService,
    UserService,
    LocalizationConfig,
    PlantandequipmentService,
    {
      provide: APP_INITIALIZER,
      useFactory: initLocalization,
      deps: [LocalizationConfig],
      multi: true
    },
    RestClientService,
    {
      provide: AuthConfig,
      useFactory: authConfigServiceFactory,
      deps: []
    },
    ClaimsHelperService,
    RouteParams,
    EmployeeFullEntityService,
    DatePipe,
    MessengerService,
    LocaleDatePipe
    , FormBuilderService
    , ProcedureService
    , DocumentCategoryService
    , EmployeeSearchService
    , RiskAssessmentSearchService
    , FileUploadService
    , BreadcrumbService
    , CheckListPageRouteResolve
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }