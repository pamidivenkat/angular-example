import { IncidentLogService } from './services/incident-log-service';
import { AtlasSharedModule } from './../shared/atlas-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LocalizationConfig
  , initLocalizationWithAdditionProviders
} from '../shared/localization-config';
import { LocaleService, TranslationService, LocalizationModule } from 'angular-l10n';
import { BreadcrumbService } from '../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../atlas-elements/common/models/ae-ibreadcrumb.model';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from '../atlas-elements/atlas-elements.module';
import { RouterModule } from '@angular/router';
import { routes } from './incident-log.routes';
import { IncidentLogHeaderComponent } from './components/incident-log-header/incident-log-header.component';
import { IncidentLogInformationComponent } from './components/incident-log-information/incident-log-information.component';
import { IncidentLogContainerComponent } from './containers/incident-log-container/incident-log-container.component';
import { IncidentLogListComponent } from './components/incident-log-list/incident-log-list.component';
import { BreadcrumbGroup } from '../atlas-elements/common/models/ae-breadcrumb-group';
import { IncidentRouteResolve } from './incident-route-resolver';
import { IncidentLogViewComponent } from './components/incident-log-view/incident-log-view.component';
import { FileUploadService } from "../shared/services/file-upload.service";

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
    IncidentLogHeaderComponent
    , IncidentLogInformationComponent
    , IncidentLogContainerComponent
    , IncidentLogListComponent
    , IncidentLogViewComponent
  ],
  exports: [IncidentLogContainerComponent],
  providers: [
    LocalizationConfig
    , IncidentRouteResolve
    , IncidentLogService
    , FileUploadService
  ]
})
export class IncidentLogModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
    const bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.IncidentLog, label: 'Incident log', url: '/incident' };
    this._breadcrumbService.add(bcItem);
  }
}
