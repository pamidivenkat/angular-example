import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { providers } from 'ng2-dnd';

import { AtlasElementsModule } from '../atlas-elements/atlas-elements.module';
import { BreadcrumbGroup } from '../atlas-elements/common/models/ae-breadcrumb-group';
import { BreadcrumbService } from '../atlas-elements/common/services/breadcrumb-service';
import { DocumentService } from '../document/services/document-service';
import { EmailSharedModule } from '../email-shared/email-shared.module';
import { LocalizationConfig } from '../shared/localization-config';
import { FileUploadService } from '../shared/services/file-upload.service';
import { IBreadcrumb } from './../atlas-elements/common/models/ae-ibreadcrumb.model';
import { DocumentSharedModule } from './../document/document-shared/document-shared.module';
import { AtlasSharedModule } from './../shared/atlas-shared.module';
import { AddEditComponent } from './components/add-edit/add-edit.component';
import { AllControlsComponent } from './components/all-controls/all-controls.component';
import { AssessComponent } from './components/assess/assess.component';
import { ControlsComponent } from './components/controls/controls.component';
import { CreateUpdateControlComponent } from './components/create-update-control/create-update-control.component';
import {
    FurtherControlMeasuresAddUpdateComponent,
} from './components/further-control-measures-add-update/further-control-measures-add-update.component';
import { FurtherControlMeasuresComponent } from './components/further-control-measures/further-control-measures.component';
import { FurtherControlsComponent } from './components/further-controls/further-controls.component';
import { PreviewComponent } from './components/preview/preview.component';
import {
    RiskAssessmentAddUpdateSubstanceComponent,
} from './components/risk-assessment-add-update-substance/risk-assessment-add-update-substance.component';
import {
    RiskAssessmentAttachSubstanceComponent,
} from './components/risk-assessment-attach-substance/risk-assessment-attach-substance.component';
import { RiskAssessmentCopyComponent } from './components/risk-assessment-copy/risk-assessment-copy.component';
import {
    RiskAssessmentCreateHazardComponent,
} from './components/risk-assessment-create-hazard/risk-assessment-create-hazard.component';
import { RiskAssessmentDetailComponent } from './components/risk-assessment-detail/risk-assessment-detail.component';
import { RiskAssessmentGeneralComponent } from './components/risk-assessment-general/risk-assessment-general.component';
import {
    RiskAssessmentHazardAddUpdateComponent,
} from './components/risk-assessment-hazard-add-update/risk-assessment-hazard-add-update.component';
import { RiskAssessmentHazardComponent } from './components/risk-assessment-hazard/risk-assessment-hazard.component';
import { RiskAssessmentHeaderComponent } from './components/risk-assessment-header/risk-assessment-header.component';
import { RiskAssessmentListComponent } from './components/risk-assessment-list/risk-assessment-list.component';
import {
    RiskAssessmentProceduresComponent,
} from './components/risk-assessment-procedures/risk-assessment-procedures.component';
import { RiskAssessmentReviewComponent } from './components/risk-assessment-review/risk-assessment-review.component';
import {
    RiskAssessmentSubstanceListComponent,
} from './components/risk-assessment-substance-list/risk-assessment-substance-list.component';
import {
    RiskAssessmentSupportingEvidenceAddDocumentComponent,
} from './components/risk-assessment-supporting-evidence-add-document/risk-assessment-supporting-evidence-add-document.component';
import {
    RiskAssessmentSupportingEvidenceComponent,
} from './components/risk-assessment-supporting-evidence/risk-assessment-supporting-evidence.component';
import { RiskChartComponent } from './components/risk-chart/risk-chart.component';
import {
    RoutesOfExposureAddUpdateComponent,
} from './components/routes-of-exposure-add-update/routes-of-exposure-add-update.component';
import { RoutesOfExposureComponent } from './components/routes-of-exposure/routes-of-exposure.component';
import { SelectedControlsComponent } from './components/selected-controls/selected-controls.component';
import { RiskAssessmentsContainer } from './containers/risk-assessments/risk-assessments.component';
import { routes } from './risk-assessment.routes';
import { RiskAssessmentRouteResolver } from './services/risk-assessment-resolver';
import { RiskAssessmentSecurityService } from './services/risk-assessment-security.service';
import { RiskAssessmentService } from './services/risk-assessment-service';
import { SuggestedControlsComponent } from './components/suggested-controls/suggested-controls.component';

@NgModule({
  imports: [
    CommonModule
    , ReactiveFormsModule
    , AtlasElementsModule
    , RouterModule.forChild(routes)
    , LocalizationModule
    , AtlasSharedModule
    , EmailSharedModule
    , DocumentSharedModule
  ],
  declarations: [
    RiskAssessmentsContainer
    , PreviewComponent
    , RiskAssessmentHeaderComponent
    , RiskAssessmentListComponent
    , AddEditComponent
    , RiskAssessmentGeneralComponent
    , FurtherControlsComponent
    , RiskAssessmentProceduresComponent
    , RiskAssessmentDetailComponent
    , RiskAssessmentSupportingEvidenceComponent
    , RiskAssessmentSupportingEvidenceAddDocumentComponent
    , RoutesOfExposureComponent
    , RoutesOfExposureAddUpdateComponent
    , AssessComponent
    , RiskAssessmentHazardComponent
    , RiskChartComponent
    , RiskAssessmentHazardAddUpdateComponent
    , FurtherControlMeasuresComponent
    , FurtherControlMeasuresAddUpdateComponent
    , RiskAssessmentSubstanceListComponent
    , RiskAssessmentAttachSubstanceComponent
    , RiskAssessmentAddUpdateSubstanceComponent
    , RiskAssessmentCreateHazardComponent
    , RiskAssessmentCopyComponent
    , CreateUpdateControlComponent
    , ControlsComponent
    , RiskAssessmentReviewComponent
    , SelectedControlsComponent
    , AllControlsComponent
    , SuggestedControlsComponent],

  providers: [
    LocalizationConfig
    , RiskAssessmentService
    , FileUploadService
    , DocumentService
    , RiskAssessmentRouteResolver
    , RiskAssessmentSecurityService
  ]
})
export class RiskAssessmentModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
    const bcItem: IBreadcrumb = {
      isGroupRoot: true, group: BreadcrumbGroup.RiskAssessments,
      label: 'Risk assessments', url: '/risk-assessment'
    };
    this._breadcrumbService.add(bcItem);
  }
}
