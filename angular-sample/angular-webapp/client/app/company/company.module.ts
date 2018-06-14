import { AtlasSharedModule } from './../shared/atlas-shared.module';
import { SitesService } from './sites/services/sites.service';
import { AtlasElementsModule } from '../atlas-elements/atlas-elements.module';
import { IBreadcrumb } from '../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../atlas-elements/common/services/breadcrumb-service';
import { routes } from './company.routes';
import { CompanyDetailsComponent } from './components/company-details/company-details.component';
import { CompanyHeaderComponent } from './components/company-header/component-header.component';
import { CompanyContainerComponent } from './containers/company-container/company-container.component';
import { CompanySitesAuthGuard } from './security/site-auth-guard';
import { ManageSiteSecurityService } from './services/site-security-service';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../shared/localization-config';
import { DocumentCategoryService } from '../document/services/document-category-service';
import { BreadcrumbGroup } from '../atlas-elements/common/models/ae-breadcrumb-group';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    RouterModule.forChild(routes),
    LocalizationModule,
    AtlasSharedModule
  ],
  declarations: [
    CompanyContainerComponent
    , CompanyHeaderComponent, CompanyDetailsComponent
  ],
  exports: [CompanyContainerComponent],
  providers: [
    LocalizationConfig,
    SitesService,
    DocumentCategoryService,
    ManageSiteSecurityService,
    CompanySitesAuthGuard
  ]
})
export class CompanyModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
    const bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.Company, label: 'Company', url: '/company' };
    this._breadcrumbService.add(bcItem);
  }
}

