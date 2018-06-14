import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { AddUpdateEmployeeEventComponent } from './components/add-update-employee-event/add-update-employee-event.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { AtlasElementsModule } from "../../atlas-elements/atlas-elements.module";
import { RouterModule } from "@angular/router";
import { LocalizationModule, TranslationService, LocaleService } from "angular-l10n";
import { LocalizationConfig, initLocalizationWithAdditionProviders } from "../../shared/localization-config";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    LocalizationModule,
    AtlasSharedModule
  ],
  declarations: [AddUpdateEmployeeEventComponent],
  exports: [
    AddUpdateEmployeeEventComponent
  ],
  providers: [
    LocalizationConfig
  ]
})
export class EmployeeEventModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
  ) {
    
  }
}
