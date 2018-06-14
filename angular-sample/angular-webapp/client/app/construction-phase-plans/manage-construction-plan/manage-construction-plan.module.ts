import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { DocumentSharedModule } from './../../document/document-shared/document-shared.module';
import { RiskAssessmentSharedModule } from './../../risk-assessment/risk-assessment-shared/risk-assessment-shared.module';
import { ClientDetailsComponent } from './components/client-details/client-details.component';
import { GeneralComponent } from './components/general/general.component';
import { ManageCppContainerComponent } from './containers/manage-cpp-container/manage-cpp-container.component';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { routes } from './manage-construction-plans.routes';
import { RouterModule } from '@angular/router';
import { IBreadcrumb } from './../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../atlas-elements/common/services/breadcrumb-service';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from './../../shared/localization-config';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddSafetyPrecautionsComponent } from './components/add-safety-precautions/add-safety-precautions.component';
import { AddSequenceEventsComponent } from './components/add-sequence-events/add-sequence-events.component';
import { SupportingEvidenceComponent } from './components/supporting-evidence/supporting-evidence.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    RiskAssessmentSharedModule,
    RouterModule.forChild(routes),
    LocalizationModule,
    AtlasSharedModule,
    DocumentSharedModule
  ],
  declarations: [
    ManageCppContainerComponent
    , GeneralComponent
    , ClientDetailsComponent, AddSafetyPrecautionsComponent, AddSequenceEventsComponent, SupportingEvidenceComponent
  ],
  providers: [LocalizationConfig]
})
export class ManageConstructionPlanModule {

  constructor(private _localizationConfig: LocalizationConfig,
    private _localeService: LocaleService,
    private _translationService: TranslationService) {    
  }
}
