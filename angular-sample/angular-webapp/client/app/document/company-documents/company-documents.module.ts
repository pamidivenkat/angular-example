import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { HankBookDocumentRouteResolve } from './services/handbooks-route-resolver';
import { DocumentSharedModule } from '../document-shared/document-shared.module';
import { DocumentCategoryService } from './../services/document-category-service';
import { ContractsListComponent } from './components/contracts-list/contracts-list.component';
import { PersonalizedContractListComponent } from './components/personalized-contract-list/personalized-contract-list.component';
import { ContractsTemplateListComponent } from './components/contracts-template-list/contracts-template-list.component';
import { HandbooksListComponent } from './components/handbooks-list/handbooks-list.component';
import { HandbookPoliciesContainerComponent } from './containers/handbook-policies-container/handbook-policies-container.component';
import { CompanyDocumentsContainerComponent } from './containers/company-documents-container/company-documents-container.component';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { routes } from './company-documents.routes';
import { CompanyDocumentsListComponent } from './components/company-documents-list/company-documents-list.component';
import { HSDocumentsContainerComponent } from './containers/hsdocuments-container/hsdocuments-container.component';
import { HRemployeeDocumentsContainerComponent } from './containers/hremployee-documents-container/hremployee-documents-container.component';
import { DocumentDetailsService } from "../document-details/services/document-details.service";

@NgModule({
  imports: [
    CommonModule
    , AtlasElementsModule
    , RouterModule.forChild(routes)
    , LocalizationModule
    , AtlasSharedModule
    , ReactiveFormsModule
    , DocumentSharedModule
  ],
  declarations: [
    CompanyDocumentsContainerComponent
    , CompanyDocumentsListComponent
    , HandbookPoliciesContainerComponent
    , HandbooksListComponent
    , ContractsTemplateListComponent
    , PersonalizedContractListComponent
    , ContractsListComponent
    , HSDocumentsContainerComponent
    , HRemployeeDocumentsContainerComponent

  ],
  exports: [
    CompanyDocumentsContainerComponent
  ],
  providers: [
    LocalizationConfig
    , HankBookDocumentRouteResolve
    , DocumentDetailsService
  ]
})
export class CompanyDocumentsModule {

  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {    
  }
}
