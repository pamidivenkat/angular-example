import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeImportHistoryContainerComponent } from './containers/employee-import-history-container/employee-import-history-container.component';
import { EmployeeImportHistoryComponent } from './components/employee-import-history/employee-import-history.component';
import { EmployeeImportPreviewComponent } from './components/employee-import-preview/employee-import-preview.component';
import { EmployeeImportContainerComponent } from './containers/employee-import-container/employee-import-container.component';
import { ReactiveFormsModule } from "@angular/forms";
import { importRoutes } from "./employee-import.routes";
import { AtlasElementsModule } from "../../atlas-elements/atlas-elements.module";
import { RouterModule } from "@angular/router";
import { LocalizationModule, TranslationService, LocaleService } from "angular-l10n";
import { LocalizationConfig, initLocalizationWithAdditionProviders } from "../../shared/localization-config";
import { IBreadcrumb } from "../../atlas-elements/common/models/ae-ibreadcrumb.model";
import { BreadcrumbService } from "../../atlas-elements/common/services/breadcrumb-service";
import { EmployeeImportResultComponent } from './components/employee-import-result/employee-import-result.component';
import { EmployeeImportComponent } from "./components/employee-import/employee-import.component";
import { EmployeeEmergencyContactsModule } from "../employee-emergency-contacts/employee-emergency-contacts.module";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    RouterModule.forChild(importRoutes),
    LocalizationModule,
     AtlasSharedModule,
    EmployeeEmergencyContactsModule
  ],
  declarations: [
    EmployeeImportHistoryContainerComponent
    , EmployeeImportHistoryComponent
    , EmployeeImportComponent
    , EmployeeImportPreviewComponent
    , EmployeeImportContainerComponent
    , EmployeeImportResultComponent
  ],
  exports: [
    EmployeeImportContainerComponent
  ],
  providers: [
    LocalizationConfig    
  ]
})
export class EmployeeImportModule {

  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
    
  }
}