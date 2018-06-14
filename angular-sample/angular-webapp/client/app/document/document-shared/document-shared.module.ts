import {
  DocumentContentReviewComponent
} from './components/document-content-review/document-content-review.component';
import { ContractDistributeActionComponent } from './components/contract-distribute-action/contract-distribute-action.component';
import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from './../../atlas-elements/common/services/breadcrumb-service';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from './../../shared/localization-config';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentUploadComponent } from './components/document-upload/document-upload.component';
import { DocumentSelectorComponent } from './components/document-selector/document-selector.component';
import { DocumentReviewDistributeComponenet } from "./components/document-review-distribute/document-review-distribute.component";
import { DocumentExporttocqcComponent } from "../document-shared/components/document-export-to-cqc/document-export-to-cqc.component";
import { DocumentDetailsService } from "../document-details/services/document-details.service";
import { DocumentExporttocqcService } from "../document-details/services/document-export-to-cqc.service";
import { CkEditorModule } from './../../atlas-elements/ck-editor/ck-editor.module';
import { BlockCheckedPipe } from './../common/block-checked.pipe';
import { DocumentUpdateComponent } from './components/document-update/document-update.component';
import { DocumentSignatureViewComponent } from './components/document-signature-view/document-signature-view.component';

@NgModule({
  imports: [
    CommonModule
    , ReactiveFormsModule
    , AtlasElementsModule
    , AtlasSharedModule
    , RouterModule.forChild([])
    , LocalizationModule,
    CkEditorModule
  ],
  declarations: [
    DocumentUploadComponent
    , ContractDistributeActionComponent
    , DocumentContentReviewComponent
    , DocumentSelectorComponent
    , DocumentReviewDistributeComponenet
    , BlockCheckedPipe
    , DocumentExporttocqcComponent
    , DocumentUpdateComponent
    , DocumentSignatureViewComponent
  ],
  exports: [
    DocumentUploadComponent
    , ContractDistributeActionComponent
    , DocumentContentReviewComponent
    , DocumentSelectorComponent
    , DocumentReviewDistributeComponenet
    , BlockCheckedPipe
    , DocumentExporttocqcComponent
    , DocumentUpdateComponent
    , DocumentSignatureViewComponent
  ],
  providers: [
    LocalizationConfig,
    DocumentDetailsService,
    DocumentExporttocqcService
  ]
})
export class DocumentSharedModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
  }
}
