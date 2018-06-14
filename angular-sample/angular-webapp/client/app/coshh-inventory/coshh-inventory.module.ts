import { AtlasSharedModule } from './../shared/atlas-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoshhInventoryListComponent } from './components/coshh-inventory-list/coshh-inventory-list.component';
import { CoshhInventoryContainerComponent } from './containers/coshh-inventory-container/coshh-inventory-container.component'
import { routes } from './coshh-inventory.routes';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from '../atlas-elements/atlas-elements.module';
import { IBreadcrumb } from '../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../atlas-elements/common/services/breadcrumb-service';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from '../shared/localization-config';
import { CoshhInventoryAddUpdateComponent } from "./components/coshh-inventory-add-update/coshh-inventory-add-update.component";
import { CoshhInventoryViewComponent } from "./components/coshh-inventory-view/coshh-inventory-view.component";
import { FileUploadService } from "../shared/services/file-upload.service";
import { DocumentService } from "../document/services/document-service";
import { BreadcrumbGroup } from '../atlas-elements/common/models/ae-breadcrumb-group';
@NgModule({
  imports: [
    CommonModule,
    AtlasElementsModule,
    RouterModule.forChild(routes),
    LocalizationModule,
     AtlasSharedModule
  ],
  declarations: [
    CoshhInventoryContainerComponent,
    CoshhInventoryListComponent,
    CoshhInventoryAddUpdateComponent,
    CoshhInventoryViewComponent
  ],
  providers: [LocalizationConfig,FileUploadService,DocumentService]
})
export class CoshhInventoryModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {    
    const bcItem: IBreadcrumb = {isGroupRoot: true, group: BreadcrumbGroup.COSHH, label: 'COSHH Inventory', url: '/coshh-inventory' };
    this._breadcrumbService.add(bcItem);
  }
}
