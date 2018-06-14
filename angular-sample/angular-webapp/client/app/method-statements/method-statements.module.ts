import { MethodStatementCopyModule } from './method-statement-copy/method-statement-copy.module';
import { AtlasSharedModule } from './../shared/atlas-shared.module';
import { ManageListComponent } from './components/manage-list/manage-list.component';
import { IBreadcrumb } from './../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../atlas-elements/common/services/breadcrumb-service';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../shared/localization-config';
import { RouterModule } from '@angular/router';
import { LocalizationModule, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasElementsModule } from './../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MethodStatementsContainerComponent } from './containers/method-statements-container/method-statements-container.component';
import { routes } from './method-statements.routes';
import { BreadcrumbGroup } from '../atlas-elements/common/models/ae-breadcrumb-group';
import { MethodStatementRouteResolve } from './method-statements-route-resolver';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MethodStatementCopyModule,
    AtlasElementsModule,
    RouterModule.forChild(routes),
    LocalizationModule,
    AtlasSharedModule,
  ],
  declarations: [MethodStatementsContainerComponent, ManageListComponent],
  exports: [],
  providers: [
    LocalizationConfig
    , MethodStatementRouteResolve
  ]
})
export class MethodStatementsModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
    
    const bcItem: IBreadcrumb = {
      isGroupRoot: true, group: BreadcrumbGroup.MethodStatements,
      label: 'Method statements', url: '/method-statement'
    };
    this._breadcrumbService.add(bcItem);
  }

}
