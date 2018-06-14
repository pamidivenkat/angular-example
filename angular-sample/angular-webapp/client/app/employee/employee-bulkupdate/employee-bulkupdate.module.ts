import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeBulkupdateContainerComponent } from './containers/employee-bulkupdate-container/employee-bulkupdate-container.component';
import { EmployeeBulkupdateComponent } from './components/employee-bulkupdate/employee-bulkupdate.component';
import { ReactiveFormsModule } from "@angular/forms";
import { AtlasElementsModule } from "../../atlas-elements/atlas-elements.module";
import { bulkUpdateRoutes } from "./employee-bulkupdate.routes";
import { LocalizationModule, LocaleService, TranslationService } from "angular-l10n";
import { LocalizationConfig, initLocalizationWithAdditionProviders } from "../../shared/localization-config";
import { RouterModule } from "@angular/router";
import { BreadcrumbService } from "../../atlas-elements/common/services/breadcrumb-service";
import { IBreadcrumb } from "../../atlas-elements/common/models/ae-ibreadcrumb.model";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    RouterModule.forChild(bulkUpdateRoutes),
    LocalizationModule,
    AtlasSharedModule
  ],
  declarations: [
    EmployeeBulkupdateContainerComponent
    , EmployeeBulkupdateComponent
  ],
  exports: [
    EmployeeBulkupdateContainerComponent
  ],
  providers: [
    LocalizationConfig
  ]
})
export class EmployeeBulkupdateModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {

  }

}
