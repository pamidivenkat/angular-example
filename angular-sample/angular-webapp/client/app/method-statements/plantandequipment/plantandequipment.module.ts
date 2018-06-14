import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { PlantandequipmentsharedModule } from './plantandequipmentshared/plantandequipmentshared.module';
import { PlantandequipmentViewComponent } from './components/plantandequipment-view/plantandequipment-view.component';
import { PlantandequipmentlistComponent } from './components/plantandequipmentlist/plantandequipmentlist.component';
import { PlantandequipmentContainerComponent } from './containers/plantandequipment-container/plantandequipment-container.component';
import { IBreadcrumb } from './../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../atlas-elements/common/services/breadcrumb-service';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { RouterModule } from '@angular/router';
import { LocalizationModule, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routes } from './plantandequipment.routes';
import { PlantandequipmentService } from './services/plantandequipment.service';
import { BreadcrumbGroup } from '../../atlas-elements/common/models/ae-breadcrumb-group';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    PlantandequipmentsharedModule,
    RouterModule.forChild(routes),
    LocalizationModule,
    AtlasSharedModule
  ],
  declarations: [PlantandequipmentContainerComponent
    , PlantandequipmentlistComponent
    , PlantandequipmentViewComponent],
  exports: [PlantandequipmentContainerComponent],
  providers: [LocalizationConfig, PlantandequipmentService]
})
export class PlantAndEquipmentModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
    
    const bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.PlantEquipment, label: 'Plant & equipment', url: '/method-statement/plant-and-equipment' };
    this._breadcrumbService.add(bcItem);
  }

} 
