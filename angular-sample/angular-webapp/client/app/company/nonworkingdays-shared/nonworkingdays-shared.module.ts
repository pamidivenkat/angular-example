import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NonworkingdaysPublicholidayProfileViewComponent
} from './components/nonworkingdays-publicholiday-profile-view/nonworkingdays-publicholiday-profile-view.component';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { LocalizationModule, LocaleService, TranslationService } from 'angular-l10n';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';

@NgModule({
  imports: [
    CommonModule,
    AtlasElementsModule,
    LocalizationModule,
     AtlasSharedModule
  ],
  declarations: [NonworkingdaysPublicholidayProfileViewComponent],
  exports: [NonworkingdaysPublicholidayProfileViewComponent],
  providers: [
    LocalizationConfig
  ]
})
export class NonworkingdaysSharedModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService) {   
  }
}
