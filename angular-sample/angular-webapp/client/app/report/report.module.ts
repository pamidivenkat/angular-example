import { AtlasSharedModule } from './../shared/atlas-shared.module';
import { ReportHeaderComponent } from './components/report-header/report-header.component';
import { ReportListComponent } from './components/report-list/report-list.component';
import { ReportsComponent } from './containers/reports/report-component';
import { routes } from './report.routes';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from '../atlas-elements/atlas-elements.module';
import { IBreadcrumb } from '../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../atlas-elements/common/services/breadcrumb-service';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from '../shared/localization-config';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    ReportsComponent,
    ReportHeaderComponent,
    ReportListComponent
  ],
  providers: [LocalizationConfig]
})
export class ReportModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
    const bcItem: IBreadcrumb = {
      isGroupRoot: true, group: BreadcrumbGroup.Reports,
      label: 'Reports', url: '/report'
    };
    this._breadcrumbService.add(bcItem);
  }
}
