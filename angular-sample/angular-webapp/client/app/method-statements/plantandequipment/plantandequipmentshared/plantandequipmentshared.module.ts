import { AtlasSharedModule } from './../../../shared/atlas-shared.module';
import { PlantandequipmentService } from './../services/plantandequipment.service';
import { PlantandequipmentAddupdateComponent } from './components/plantandequipment-addupdate/plantandequipment-addupdate.component';
import { IBreadcrumb } from './../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../../shared/localization-config';
import { RouterModule } from '@angular/router';
import { LocalizationModule, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasElementsModule } from './../../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    LocalizationModule,
    AtlasSharedModule
  ],
  declarations: [PlantandequipmentAddupdateComponent],
  exports: [PlantandequipmentAddupdateComponent],
  providers: [PlantandequipmentService]
})
export class PlantandequipmentsharedModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {

  }
}
