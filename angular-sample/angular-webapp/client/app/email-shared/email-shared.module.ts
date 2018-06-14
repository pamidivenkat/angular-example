import { AtlasSharedModule } from './../shared/atlas-shared.module';
import { IBreadcrumb } from './../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../atlas-elements/common/services/breadcrumb-service';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../shared/localization-config';
import { RouterModule } from '@angular/router';
import { LocalizationModule, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasElementsModule } from './../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailComponent } from "../email-shared/components/email.component";
import { EmailService } from "../email-shared/services/email.service";


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    LocalizationModule,
     AtlasSharedModule
  ],
  declarations: [EmailComponent],
  exports: [EmailComponent],
  providers: [EmailService]
})
export class EmailSharedModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {    
  }
}
