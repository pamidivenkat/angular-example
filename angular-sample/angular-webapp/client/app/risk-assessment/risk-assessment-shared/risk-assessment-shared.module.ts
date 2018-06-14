import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from './../../atlas-elements/common/services/breadcrumb-service';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from './../../shared/localization-config';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskAssessmentSelectorComponent } from './components/risk-assessment-selector/risk-assessment-selector.component';

@NgModule({
  imports: [
    CommonModule
    , ReactiveFormsModule
    , AtlasElementsModule
    , RouterModule.forChild([])
    , LocalizationModule
    , AtlasSharedModule
  ],
  declarations: [
    RiskAssessmentSelectorComponent
  ],
  exports: [RiskAssessmentSelectorComponent],
  providers: [
    LocalizationConfig
  ]
})

export class RiskAssessmentSharedModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {    
  }
}
