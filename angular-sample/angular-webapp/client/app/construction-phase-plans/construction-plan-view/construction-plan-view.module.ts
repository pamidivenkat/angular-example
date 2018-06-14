import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { ConstructionPlanViewComponent } from "./../construction-plan-view/construction-plan-view/construction-plan-view.component";
import { LocalizationConfig, initLocalizationWithAdditionProviders } from "../../shared/localization-config";
import { LocalizationModule, LocaleService, TranslationService } from "angular-l10n";
import { AtlasElementsModule } from "../../atlas-elements/atlas-elements.module";
import { RouterModule } from "@angular/router";
import { routes } from './construction-plan-view.routes';
import { EmailSharedModule } from "../../email-shared/email-shared.module";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    RouterModule.forChild(routes),
    LocalizationModule,
    EmailSharedModule,
     AtlasSharedModule
  ],
  declarations: [ConstructionPlanViewComponent],
  providers: [LocalizationConfig]
})
export class ConstructionPlanViewModule {

  constructor(private _localizationConfig: LocalizationConfig,
    private _localeService: LocaleService,
    private _translationService: TranslationService) {   
  }
}
