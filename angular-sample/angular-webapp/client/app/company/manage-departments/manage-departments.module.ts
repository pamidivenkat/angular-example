import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageDepartmentsContainerComponent } from './containers/manage-departments-container/manage-departments-container.component';
import { EmployeeFilterComponent } from './components/employee-filter/employee-filter.component';
import {
  LocalizationConfig
  , initLocalizationWithAdditionProviders
} from '../../shared/localization-config';
import { LocaleService, TranslationService, LocalizationModule } from 'angular-l10n';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ManageDepartmentRoutes } from './manage-departments.routes';
import { CompanyOrgStructureComponent } from './components/company-org-structure/company-org-structure.component';
import { AddUpdateDepartmentComponent } from './components/add-update-department/add-update-department.component';
import { EmployeeBasicInfoComponent } from './components/employee-basic-info/employee-basic-info.component';
import { ManageDepartmentsService } from './services/manage-departments.service';
import { AeDragDropModule } from '../../atlas-elements/ae-drag-drop/ae-drag-drop.module';

@NgModule({
  imports: [
    CommonModule
    , AtlasElementsModule
    , RouterModule.forChild(ManageDepartmentRoutes)
    , LocalizationModule
    , ReactiveFormsModule
    , AeDragDropModule
    , AtlasSharedModule
  ],
  declarations: [
    ManageDepartmentsContainerComponent
    , EmployeeFilterComponent
    , CompanyOrgStructureComponent
    , AddUpdateDepartmentComponent
    , EmployeeBasicInfoComponent
  ],
  exports: [ManageDepartmentsContainerComponent],
  providers: [
    LocalizationConfig,
    ManageDepartmentsService
  ]
})
export class ManageDepartmentsModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {   
  }
}
