import { AtlasSharedModule } from './../shared/atlas-shared.module';
import { EmployeeEventModule } from './employee-event/employee-event.module';
import { BreadcrumbGroup } from '../atlas-elements/common/models/ae-breadcrumb-group';
import { EmployeeSearchService } from './services/employee-search.service';
import { EmployeeRouteResolve } from './security/employee-route-resolver';
import { EmployeeImportRouteResolve } from './security/employee-import-route-resolver';
import { EmployeeSecurityService } from './services/employee-security-service';
import { EmployeePreviousEmploymentHistoryService } from './services/employee-previous-employment-history.service';
import { SalaryHistoryService } from './services/salary-history-service';
import { JobHistoryService } from './services/job-history-service';
import { EmployeeCalendarComponent } from '../calendar/components/employee-calendar/employee-calendar.component';
import { EmployeeVehicleService } from './services/employee-vehicle.service';
import { BreadcrumbService } from '../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../atlas-elements/common/models/ae-ibreadcrumb.model';
import { EmployeeFullEntityService } from './services/employee-fullentity.service';
import { EmployeeContainerComponent } from './containers/employee-container/employee-container.component';
import { ReactiveFormsModule } from '@angular/forms';
import { routes } from './employee.routes';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from '../atlas-elements/atlas-elements.module';
import { CommonModule } from '@angular/common';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../shared/localization-config';
import { EmployeePersonalComponent } from './components/employee-personal/employee-personal.component';
import { EmployeeSummaryComponent } from "./components/employee-summary/employee-summary.component";
import { EmployeeStatisticsComponent } from "./components/employee-statistics/employee-statistics.component";
import { EmployeeInformationComponent } from "./components/employee-information/employee-information.component";
import { EmployeePersonalUpdateComponent } from './components/employee-personal-update/employee-personal-update.component';
import { EmployeeContactsComponent } from './components/employee-contacts/employee-contacts.component';
import { EmployeeContactsUpdateComponent } from './components/employee-contacts-update/employee-contacts-update.component';
import { EducationHistoryComponent } from './components/education-history/education-history.component';
import { QualificationHistoryComponent } from './components/qualification-history/qualification-history.component';
import { TrainingHistoryComponent } from './components/training-history/training-history.component';
import { CareerTrainingContainerComponent } from './containers/career-training-container/career-training-container.component';
import { EducationHistoryAddUpdateComponent } from './components/education-history-add-update/education-history-add-update.component';
import { SalaryHistoryComponent } from './components/salary-history/salary-history.component';
import { SalaryHistoryFormComponent } from './components/salary-history-form/salary-history-form.component';
import { JobHistoryComponent } from './components/job-history/job-history.component';
import { PreviousEmploymentComponent } from './components/previous-employment/previous-employment.component';
import { EmployeeOptionsComponent } from './components/employee-options/employee-options.component';
import { EmployeeBenefitsComponent } from './benefits/components/employee-benefits/employee-benefits.component';
import { EmployeeVehicleComponent } from './components/employee-vehicle/employee-vehicle.component';
import { EmployeeVehicleAddUpdateComponent } from './components/employee-vehicle-add-update/employee-vehicle-add-update.component';
import { JobHistoryFormComponent } from './components/job-history-form/job-history-form.component';
import { QualificationHistoryAddUpdateComponent } from './components/qualification-history-add-update/qualification-history-add-update.component';
import { PreviousEmploymentAddUpdateComponent } from './components/previous-employment-add-update/previous-employment-add-update.component';
import { TrainingHistoryAddUpdateComponent } from './components/training-history-add-update/training-history-add-update.component';
import { TrainingCourseAddComponent } from './components/training-course-add/training-course-add.component';
import { BankContainerComponent } from './containers/bank-container/bank-container.component';
import { EmployeeBankAddUpdateComponent } from './components/employee-bank-add-update/employee-bank-add-update.component';
import { EmployeeBankListComponent } from "./components/employee-bank-list/employee-bank-list.component";
import { DocumentCategoryService } from '../document/services/document-category-service';
import { EmployeeTabAuthGuard } from "./../employee/security/employee-tab-guard";
import { EmployeeEmergencyContactsModule } from "./employee-emergency-contacts/employee-emergency-contacts.module";
import { CompanySharedModule } from "./../company/company-shared/company-shared.module";


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    CompanySharedModule,
    RouterModule.forChild(routes),
    LocalizationModule,
     AtlasSharedModule,
    EmployeeEmergencyContactsModule,
    EmployeeEventModule
  ],
  declarations: [
    EmployeePersonalComponent,
    EmployeeContainerComponent,
    EmployeeSummaryComponent,
    EmployeeStatisticsComponent,
    EmployeeInformationComponent,
    EmployeePersonalUpdateComponent,
    EmployeeContactsComponent,
    EmployeeContactsUpdateComponent,    
    EducationHistoryComponent,
    QualificationHistoryComponent,
    TrainingHistoryComponent,
    CareerTrainingContainerComponent,
    SalaryHistoryComponent,
    JobHistoryComponent,
    PreviousEmploymentComponent,
    SalaryHistoryFormComponent,
    EducationHistoryAddUpdateComponent,
    EmployeeOptionsComponent,
    EmployeeBankListComponent,
    EmployeeVehicleComponent,
    EmployeeVehicleAddUpdateComponent,
    JobHistoryFormComponent,
    QualificationHistoryAddUpdateComponent,
    PreviousEmploymentAddUpdateComponent,
    TrainingHistoryAddUpdateComponent,
    TrainingCourseAddComponent,
    BankContainerComponent,
    EmployeeBankAddUpdateComponent
  ],
  exports: [
    EmployeeContainerComponent    
  ],
  providers: [
    LocalizationConfig,
    EmployeeFullEntityService,
    EmployeeVehicleService,
    SalaryHistoryService,
    EmployeePreviousEmploymentHistoryService,
    JobHistoryService,
    DocumentCategoryService,
    EmployeeSecurityService,
    EmployeeTabAuthGuard,
    EmployeeRouteResolve,
    EmployeeSearchService,
    EmployeeImportRouteResolve
  ]
})
export class EmployeeModule {

  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
    
    const bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.Employees, label: 'Employees', url: '/employee/manage' };
    this._breadcrumbService.add(bcItem);
  }
}
