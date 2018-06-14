import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { EmployeeManageService } from '../services/employee-manage.service';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../../shared/localization-config';
import { AuthGuard } from '../../shared/security/auth.guard';
import { RouterModule, Routes } from '@angular/router';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeesListComponent } from './employees-list/employees-list.component';
import { HeaderComponent } from './header/header.component';
import { EmployeemanageContainerComponent } from './container/employeemanage-container.component';



export const routes: Routes = [
  {
    path: '', component: EmployeemanageContainerComponent, canActivate: [AuthGuard]
  }
]


@NgModule({
  imports: [
    CommonModule
    , AtlasElementsModule
    , LocalizationModule
    , AtlasSharedModule
    , ReactiveFormsModule
    , RouterModule.forChild(routes),
  ],
  declarations: [EmployeesListComponent
    , HeaderComponent
    , EmployeemanageContainerComponent
  ],
  exports: [EmployeemanageContainerComponent],
  providers: [
    LocalizationConfig,
    EmployeeManageService
  ]
})
export class EmployeeManagementModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
    
  }
}
