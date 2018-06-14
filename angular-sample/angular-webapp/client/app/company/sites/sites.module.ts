import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { AssociateEmployeesSitesComponent } from './components/associate-employees-sites/associate-employees-sites.component';
import { SitesService } from './services/sites.service';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from '../../shared/localization-config';
import { routes } from './sites.routes';
import { RouterModule } from '@angular/router';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SitesContainerComponent } from './container/sites-container/sites-container.component';
import { SitesListComponent } from './components/sites-list/sites-list.component';
import { SitesHeaderComponent } from './components/sites-header/sites-header.component';
import { SitesDetailsComponent } from './components/sites-details/sites-details.component';

@NgModule({
  imports: [
    CommonModule
    , ReactiveFormsModule
    , AtlasElementsModule
    , RouterModule.forChild(routes)
    , LocalizationModule
    , AtlasSharedModule
  ],
  declarations: [SitesContainerComponent
    , SitesListComponent
    , SitesHeaderComponent, SitesDetailsComponent
    , AssociateEmployeesSitesComponent
  ]
  , exports: [SitesContainerComponent]
  , providers: [
    LocalizationConfig,
    SitesService    
  ]
})
export class SitesModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {  
    
  }
}
