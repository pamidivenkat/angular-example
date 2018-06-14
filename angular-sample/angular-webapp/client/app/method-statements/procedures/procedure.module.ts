import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { ProceduresContainerComponent } from './containers/procedures-container/procedures-container.component';
import { IBreadcrumb } from './../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../atlas-elements/common/services/breadcrumb-service';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { RouterModule } from '@angular/router';
import { LocalizationModule, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routes } from './procedure.routes';
import { ProcedureListComponent } from './components/procedure-list/procedure-list.component';
import { ProcedureAddUpdateComponent } from './components/procedure-add-update/procedure-add-update.component';
import { ProcedureViewComponent } from './components/procedure-view/procedure-view.component';
import { ProcedureCopyComponent } from './components/procedure-copy/procedure-copy.component';
import { ProcedureService } from '../../method-statements/procedures/services/procedure.service';
import { BreadcrumbGroup } from '../../atlas-elements/common/models/ae-breadcrumb-group';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    RouterModule.forChild(routes),
    LocalizationModule,
    AtlasSharedModule
  ],
  declarations: [ProceduresContainerComponent, ProcedureListComponent, ProcedureAddUpdateComponent, ProcedureViewComponent, ProcedureCopyComponent],
  exports: [ProceduresContainerComponent],
  providers: [LocalizationConfig, ProcedureService]
})
export class ProcedureModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {    
    const bcItem: IBreadcrumb = {
      isGroupRoot: true, group: BreadcrumbGroup.Procedures,
      label: 'Procedures', url: '/method-statement/procedure/custom'
    };
    this._breadcrumbService.add(bcItem);
  }
}
