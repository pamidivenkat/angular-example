import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { EmployeeSharedModule } from './../employee-shared/employee-shared.module';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { EmployeeGroupFormComponent } from './components/employee-group-form/employee-group-form.component';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../../shared/localization-config';
import { EmployeeGroupContainerComponent } from './employee-group/employee-group.component';
import { routes } from './employee-group.routes';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeGroupService } from './services/employee-group.service';
import { EmployeeSearchService } from '../../employee/services/employee-search.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    EmployeeSharedModule,
    RouterModule.forChild(routes),
    LocalizationModule,
     AtlasSharedModule
  ],
  declarations: [
    EmployeeGroupContainerComponent,
    EmployeeGroupFormComponent
  ],
  exports: [EmployeeGroupFormComponent],
  providers: [LocalizationConfig, EmployeeGroupService, EmployeeSearchService]
})
export class EmployeeGroupModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService) {    

  }
}
