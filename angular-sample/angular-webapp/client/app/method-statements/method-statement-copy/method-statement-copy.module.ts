import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { LocalizationModule, LocaleService, TranslationService } from 'angular-l10n';
import { BreadcrumbService } from './../../atlas-elements/common/services/breadcrumb-service';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { MsCopyComponent } from './components/ms-copy/ms-copy.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule, 
    LocalizationModule,
    AtlasSharedModule,
  ],
  declarations: [MsCopyComponent],
  exports: [MsCopyComponent],
  providers: [LocalizationConfig]
})
export class MethodStatementCopyModule {
  constructor(private _localizationConfig: LocalizationConfig
        , private _localeService: LocaleService
        , private _translationService: TranslationService
        , private _breadcrumbService: BreadcrumbService) {
        
    }
 }
