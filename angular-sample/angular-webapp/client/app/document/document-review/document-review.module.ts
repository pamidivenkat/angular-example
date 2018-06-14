import { AtlasSharedModule } from '../../shared/atlas-shared.module';
import { DocumentSharedModule } from '../document-shared/document-shared.module';
import { routes } from './document-review.routes';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from '../../shared/localization-config';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentReviewComponent } from './container/document-review/document-review.component';
import { DocumentReviewStructureComponent } from './components/document-review-structure/document-review-structure.component';
import { DocumentReviewCommentsComponent } from './components/document-review-comments/document-review-comments.component';
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  imports: [
    CommonModule,
    AtlasElementsModule,
    ReactiveFormsModule,
    DocumentSharedModule,
     AtlasSharedModule,
    RouterModule.forChild(routes),
    LocalizationModule     
  ],
  declarations: [
    DocumentReviewComponent,
    DocumentReviewStructureComponent,
    DocumentReviewCommentsComponent,
  ],
  providers: [
    LocalizationConfig
  ]
})
export class DocumentReviewModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {    
  }
}
