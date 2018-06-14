import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { DelegationService } from './services/delegation.service';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { DelegationContainerComponent } from './containers/deligation-container/deligation-container.component';
import { DelegationListComponent } from './components/delegation-list/delegation-list.component';
import { DeligationRoutes } from './deligation.routes';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DelegationAddUpdateComponent } from './components/delegation-add-update/delegation-add-update.component';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbGroup } from '../../atlas-elements/common/models/ae-breadcrumb-group';

@NgModule({
  imports: [
    CommonModule
    , AtlasElementsModule
    , RouterModule.forChild(DeligationRoutes)
    , LocalizationModule
    , AtlasSharedModule
    , ReactiveFormsModule
  ],
  declarations: [
    DelegationContainerComponent
    , DelegationListComponent
    , DelegationAddUpdateComponent
  ],
  exports: [
    DelegationContainerComponent
    , DelegationListComponent
    , DelegationAddUpdateComponent
  ],
  providers: [
    LocalizationConfig
    , DelegationService
  ]
})
export class DelegationModule {
  constructor(private _localizationConfig: LocalizationConfig
  , private _localeService: LocaleService
  , private _translationService: TranslationService 
  , private _breadcrumbService: BreadcrumbService) {    
    let bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.Delegation, label: 'Delegation', url: '/employee/delegation' };
    this._breadcrumbService.add(bcItem);
  }
}

