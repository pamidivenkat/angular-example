import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { UsefuldocsTemplatesListComponent } from './components/usefuldocs-templates-list/usefuldocs-templates-list.component';
import { UsefuldocsTemplatesContainerComponent } from './containers/usefuldocs-templates-container/usefuldocs-templates-container.component';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { routes } from './usefuldocuments-templates.routes';
import { DocumentDetailsService } from "../../document/document-details/services/document-details.service";
import { DocumentSharedModule } from "../../document/document-shared/document-shared.module";

@NgModule({
  imports: [
    CommonModule
    , AtlasElementsModule
    , RouterModule.forChild(routes)
    , LocalizationModule
    ,  AtlasSharedModule
    , ReactiveFormsModule
    , DocumentSharedModule
  ],
  declarations: [
    UsefuldocsTemplatesContainerComponent
    , UsefuldocsTemplatesListComponent
  ],
  exports: [UsefuldocsTemplatesContainerComponent],
  providers: [
    LocalizationConfig,
    DocumentDetailsService
  ]
})
export class UsefuldocumentsandtemplatesModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {    
  }
}
