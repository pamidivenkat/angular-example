import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { DocumentSharedModule } from '../document-shared/document-shared.module';
import {
  ContractBulkDistributionComponent
} from './components/contract-bulk-distribution/contract-bulk-distribution.component';
import { EmployeeSharedModule } from './../../employee/employee-shared/employee-shared.module';
import { ContractPersonalisationContainerComponent } from './container/contract-personalisation-container/contract-personalisation-container.component';
import { ContractEmployeeListComponent } from './components/contract-employee-list/contract-employee-list.component';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../../shared/localization-config';
import { routes } from './contract-personalisation.routes';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeSearchService } from '../../employee/services/employee-search.service';
import { EmployeeContractUpdateComponent } from './components/employee-contract-update/employee-contract-update.component';
import { BreadcrumbGroup } from '../../atlas-elements/common/models/ae-breadcrumb-group';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    EmployeeSharedModule,
    DocumentSharedModule,
    RouterModule.forChild(routes),
    LocalizationModule,
    AtlasSharedModule
  ],
  declarations: [
    ContractPersonalisationContainerComponent,
    ContractEmployeeListComponent,
    ContractBulkDistributionComponent,
    EmployeeContractUpdateComponent
  ],
  exports: [ContractPersonalisationContainerComponent, ContractEmployeeListComponent],
  providers: [LocalizationConfig, EmployeeSearchService]
})
export class ContractPersonalisationModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
    
    const bcItem: IBreadcrumb = new IBreadcrumb('Documents',
      'document/company/contracts-and-handbooks/contract-templates', BreadcrumbGroup.Contracts, null, true);
    this._breadcrumbService.add(bcItem);
  }
}

