import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { routes } from './citation-drafts-documents.routing';
import { ReactiveFormsModule } from '@angular/forms';
import { CitationDraftDocumentsListComponent } from './components/citation-draft-documents-list/citation-draft-documents-list.component';

@NgModule({
  imports: [
    CommonModule
    , AtlasElementsModule
    , RouterModule.forChild(routes)
    , LocalizationModule
    ,  AtlasSharedModule
    , ReactiveFormsModule
  ],
  declarations: [
    CitationDraftDocumentsListComponent
  ],
  exports:[],
  providers: [
    LocalizationConfig
  ]
})
export class CitationDraftsDocumentsModule { 
   constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {    
  }
}
