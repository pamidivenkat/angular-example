import { MethodStatementCopyModule } from './../method-statement-copy/method-statement-copy.module';
import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { PlantandequipmentsharedModule } from './../plantandequipment/plantandequipmentshared/plantandequipmentshared.module';
import { MethodstatementContainerComponent } from './containers/methodstatement-container/methodstatement-container.component';
import { IBreadcrumb } from './../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../atlas-elements/common/services/breadcrumb-service';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { RouterModule } from '@angular/router';
import { LocalizationModule, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routes } from './manage-method-statements.routes';
import { GeneralComponent } from './components/general/general.component';
import { SequenceofeventsComponent } from './components/sequenceofevents/sequenceofevents.component';
import { PlantEquipmentComponent } from './components/plant-equipment/plant-equipment.component';
import { SafetyPrecautionsComponent } from './components/safety-precautions/safety-precautions.component';
import { FurtherInformationComponent } from './components/further-information/further-information.component';
import { SupportingDocumentationComponent } from './components/supporting-documentation/supporting-documentation.component';
import { PreviewComponent } from './components/preview/preview.component';
import { AddPlantEquipmentComponent } from './components/add-plant-equipment/add-plant-equipment.component';
import { RiskAssessmentHeaderComponent } from '../../risk-assessment/components/risk-assessment-header/risk-assessment-header.component';
import { RiskAssessmentSharedModule } from "../../risk-assessment/risk-assessment-shared/risk-assessment-shared.module";
import { InformationFromComputerComponent } from './components/information-from-computer/information-from-computer.component';
import { PersonalProtectiveEquipmentComponent } from './components/personal-protective-equipment/personal-protective-equipment.component';
import { SaftyResponsibilitiesComponent } from './components/safty-responsibilities/safty-responsibilities.component';
import { MsProcedureContainerComponent } from './containers/ms-procedure-container/ms-procedure-container.component';
import { AddMsProcedureComponent } from './components/add-ms-procedure/add-ms-procedure.component';
import { AddProcedureComponent } from "./components/add-procedure/add-procedure.component";
import { UpdateMsProcedureComponent } from './components/update-ms-procedure/update-ms-procedure.component';
import { ProcedureQuickViewComponent } from './components/procedure-quick-view/procedure-quick-view.component';
import { SafetyResponsibilitiesAddUpdateComponent } from './components/safety-responsibilities-add-update/safety-responsibilities-add-update.component';
import { SafetyProceduresComponent } from './components/safety-procedures/safety-procedures.component';
import { DocumentSharedModule } from './../../document/document-shared/document-shared.module';
import { EmailSharedModule } from "./../../email-shared/email-shared.module";


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,    
    RiskAssessmentSharedModule,
    DocumentSharedModule,
    PlantandequipmentsharedModule,
    RouterModule.forChild(routes),
    LocalizationModule,
    AtlasSharedModule,
    EmailSharedModule
    ,  MethodStatementCopyModule
  ],
  declarations: [MethodstatementContainerComponent
    , GeneralComponent
    , SequenceofeventsComponent
    , PlantEquipmentComponent
    , SafetyPrecautionsComponent
    , FurtherInformationComponent
    , SupportingDocumentationComponent
    , PreviewComponent    
    , AddPlantEquipmentComponent
    , PersonalProtectiveEquipmentComponent
    , SaftyResponsibilitiesComponent    
    , MsProcedureContainerComponent
    , AddMsProcedureComponent
    , AddProcedureComponent
    , UpdateMsProcedureComponent
    , ProcedureQuickViewComponent
    , InformationFromComputerComponent
    , SafetyProceduresComponent
    , SafetyResponsibilitiesAddUpdateComponent
    ],
  exports: [MethodstatementContainerComponent],
  providers: [LocalizationConfig]
})
export class ManageMethodStatementsModule {
    constructor(private _localizationConfig: LocalizationConfig
        , private _localeService: LocaleService
        , private _translationService: TranslationService
        , private _breadcrumbService: BreadcrumbService) {
        
    }

}
