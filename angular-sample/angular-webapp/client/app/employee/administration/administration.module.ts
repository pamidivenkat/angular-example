import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { EmployeeEventModule } from './../employee-event/employee-event.module';
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
import { adminRoutes } from './administration.routes';
import { EmployeeAdminContainerComponent } from './containers/employee-admin-container/employee-admin-container.component';
import { AdminDetailsComponent } from './components/admin-details/admin-details.component';
import { EmployeeAdminService } from './../../employee/administration/services/employee-admin.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    EmployeeSharedModule,
    RouterModule.forChild(adminRoutes),
    LocalizationModule,
    AtlasSharedModule,
    EmployeeEventModule
  ],
  exports: [
    EmployeeAdminContainerComponent
  ],
  declarations: [EmployeeAdminContainerComponent, AdminDetailsComponent],
  providers: [
    LocalizationConfig,
    EmployeeAdminService
  ]
})
export class EmployeeAdminModule {

  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
  }
}