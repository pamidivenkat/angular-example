import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeBenefitsComponent } from './components/employee-benefits/employee-benefits.component';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { LocaleService, TranslationService, LocalizationModule } from 'angular-l10n';
import { BreadcrumbService } from './../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from './../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { RouterModule } from '@angular/router';
import { benefitsRoutes } from './benefits.routes';
import { EmployeeBenefitsUpdateComponent } from './components/employee-benefits-update/employee-benefits-update.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    RouterModule.forChild(benefitsRoutes),
    LocalizationModule,
     AtlasSharedModule
  ],
  exports: [
    EmployeeBenefitsComponent
  ],
  declarations: [EmployeeBenefitsComponent, EmployeeBenefitsUpdateComponent],
   providers: [
    LocalizationConfig
   ]
})
export class BenefitsModule {

  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {    
  }
}
