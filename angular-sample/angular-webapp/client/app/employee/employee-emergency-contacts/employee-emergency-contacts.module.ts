import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeEmergancyContactsComponent } from './components/employee-emergancy-contacts/employee-emergancy-contacts.component';
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
  declarations: [EmployeeEmergancyContactsComponent],
  exports: [
    EmployeeEmergancyContactsComponent
  ],
  providers: [
    LocalizationConfig
  ]
})
export class EmployeeEmergencyContactsModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
  ) {

  }
}
