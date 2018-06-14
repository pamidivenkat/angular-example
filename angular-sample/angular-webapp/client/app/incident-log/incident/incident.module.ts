import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentContainerComponent } from './containers/incident-container/incident-container.component';
import { IncidentAddUpdateComponent } from './components/incident-add-update/incident-add-update.component';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { LocaleService, TranslationService, LocalizationModule } from 'angular-l10n';
import { BreadcrumbService } from './../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from './../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { RouterModule } from '@angular/router';
import { incidentRoutes } from './incident.routes';
import { IncidentReportedBySearchService } from './services/incident-reported-by-search.service';
import { IncidentInjuredPersonComponent } from './../incident/components/incident-injured-person/incident-injured-person.component';
import { IncidentBannerComponent } from './components/incident-banner/incident-banner.component';
import { IncidentFormalInvestigationComponent } from './components/incident-formal-investigation/incident-formal-investigation.component';
import { IncidentAboutInjuryComponent } from './components/incident-about-injury/incident-about-injury.component';
import { IncidentRiddorComponent } from './components/incident-riddor/incident-riddor.component';
import { RiddorOnlineFormComponent } from './components/riddor-online-form/riddor-online-form.component';
import { IncidentLogService } from './services/incident-log.service';
import { IncidentPreviewComponent } from './components/incident-preview/incident-preview.component';
import { IncidentPreviewService } from './services/incident-preview.service';
import { IncidentKeyFieldsValidationService } from "./services/incident-key-fields-validation.service";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    RouterModule.forChild(incidentRoutes),
    LocalizationModule,
    AtlasSharedModule
  ],
  exports: [
    IncidentContainerComponent
  ],
  declarations: [IncidentContainerComponent
    , IncidentAddUpdateComponent
    , IncidentInjuredPersonComponent
    , IncidentBannerComponent
    , IncidentFormalInvestigationComponent
    , IncidentAboutInjuryComponent
    , IncidentRiddorComponent
    , RiddorOnlineFormComponent
    , IncidentPreviewComponent],
  providers: [
    LocalizationConfig,
    IncidentReportedBySearchService,
    IncidentPreviewService,
    IncidentLogService,
    IncidentKeyFieldsValidationService
  ]
})
export class IncidentModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {

  }
}
