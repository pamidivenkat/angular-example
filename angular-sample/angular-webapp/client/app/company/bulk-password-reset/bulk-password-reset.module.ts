import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { routes } from './bulk-password-reset.routes';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from '../../shared/localization-config';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkPasswordResetContainerComponent } from './container/bulk-password-reset-container/bulk-password-reset-container.component';
import { BulkPasswordResetListComponent } from './components/bulk-password-reset-list/bulk-password-reset-list.component';
import { BulkPasswordResetSetPwdComponent } from './components/bulk-password-reset-set-pwd/bulk-password-reset-set-pwd.component';

@NgModule({
  imports: [
    CommonModule
    , ReactiveFormsModule
    , AtlasElementsModule
    , RouterModule.forChild(routes)
    , LocalizationModule
    , AtlasSharedModule
  ]
  , declarations: [
    BulkPasswordResetContainerComponent,
    BulkPasswordResetListComponent, BulkPasswordResetSetPwdComponent
  ]
  , exports: [BulkPasswordResetContainerComponent]
  , providers: [
    LocalizationConfig
  ]
})
export class BulkPasswordResetModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {     
  }
}
