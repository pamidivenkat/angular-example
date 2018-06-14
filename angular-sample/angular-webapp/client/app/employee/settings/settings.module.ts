import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbGroup } from '../../atlas-elements/common/models/ae-breadcrumb-group';
import { SettingsRoutes } from './settings.routing';
import { HolidaysettingsComponent } from './components/holidaysettings/holidaysettings.component';
import { HolidaysettingsContainerComponent } from './containers/holidaysettings-container/holidaysettings-container.component';

@NgModule({
  imports: [
    CommonModule
    , AtlasElementsModule
    , RouterModule.forChild(SettingsRoutes)
    , LocalizationModule
    , AtlasSharedModule
    , ReactiveFormsModule
  ],
  declarations: [
    HolidaysettingsComponent
    , HolidaysettingsContainerComponent
  ],
  exports: [
    HolidaysettingsComponent
    , HolidaysettingsContainerComponent
  ],
  providers: [
    LocalizationConfig
  ]
})
export class SettingsModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {    
    let bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.HolidaySettings, label: 'Employee settings', url: '/employee/settings' };
    this._breadcrumbService.add(bcItem);
  }
}
