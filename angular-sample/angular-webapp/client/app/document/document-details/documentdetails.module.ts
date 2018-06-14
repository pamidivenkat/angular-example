import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { LocaleService, TranslationService, LocalizationModule } from 'angular-l10n';
import { BreadcrumbService } from './../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from './../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { RouterModule } from '@angular/router';
import { documentDetailsRoutes } from './documentdetails.routes';

import { DocumentDetailsContainerComponent } from './containers/document-details-container/document-details-container.component';
import { DocumentFullDetailsComponent } from './components/document-full-details/document-full-details.component';
import { DocumentChangeHistoryComponent } from './components/document-change-history/document-change-history.component';
import { DocumentDistributeHistoryComponent } from './components/document-distribute-history/document-distribute-history.component';
import { DocumentEmployeeActionstatusComponent } from './components/document-employee-actionstatus/document-employee-actionstatus.component';
import { DocumentDetailsService } from './services/document-details.service';
import { DocumentExporttocqcService } from "./services/document-export-to-cqc.service";
import { DocumentSharedModule } from "../document-shared/document-shared.module";
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    RouterModule.forChild(documentDetailsRoutes),
    LocalizationModule,
     AtlasSharedModule,
    DocumentSharedModule
  ],
  exports: [
    DocumentDetailsContainerComponent
  ],
  declarations: [DocumentDetailsContainerComponent, DocumentFullDetailsComponent, DocumentChangeHistoryComponent, DocumentEmployeeActionstatusComponent, DocumentDistributeHistoryComponent],
  providers: [
    LocalizationConfig,
    DocumentDetailsService,
    DocumentExporttocqcService
  ]
})
export class DocumentDetailsModule {

  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {    

  }
}