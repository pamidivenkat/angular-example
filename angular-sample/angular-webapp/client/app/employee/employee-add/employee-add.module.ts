import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { EmployeeSharedModule } from './../employee-shared/employee-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { LocaleService, TranslationService, LocalizationModule } from 'angular-l10n';
import { BreadcrumbService } from './../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from './../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { RouterModule } from '@angular/router';
import { employeeAddRoutes } from './employee-add.routes';
import { EmployeeAddContainerComponent } from './containers/employee-add-container/employee-add-container.component';
import { EmployeeAddComponent } from './components/employee-add/employee-add.component';
import { EmployeeAddBannerComponent } from './components/employee-add-banner/employee-add-banner.component';
import { EmployeeAdminService } from './../../employee/administration/services/employee-admin.service';
import { CompanySharedModule } from './../../company/company-shared/company-shared.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    EmployeeSharedModule,
    CompanySharedModule,
    RouterModule.forChild(employeeAddRoutes),
    LocalizationModule,
     AtlasSharedModule
  ],
  exports: [
    EmployeeAddContainerComponent
  ],
  declarations: [EmployeeAddContainerComponent, EmployeeAddComponent, EmployeeAddBannerComponent],
  providers: [
    LocalizationConfig,
    EmployeeAdminService
  ]
})
export class EmployeeAddModule {

  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {    
    
  }
}
