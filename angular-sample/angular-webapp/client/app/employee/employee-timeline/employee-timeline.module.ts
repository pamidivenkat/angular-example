import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { EmployeeEventModule } from './../employee-event/employee-event.module';
import { EmployeeEventDetails } from './components/employee-event-details/employee-event-details.component';
import { employeeTimelineRoutes } from './employee-timeline.routes';
import { FormBuilderService } from '../../shared/services/form-builder.service';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from '../../shared/localization-config';
import { LocalizationModule, LocaleService, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { EmployeeTimelineComponent } from './components/employee-timeline/employee-timeline.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineComponent } from './containers/timeline/timeline.component';
import { AddUpdateEmployeeDocumentComponent } from './components/add-update-employee-document/add-update-employee-document.component';
import { EmployeeDocumentDetails } from './components/employee-document-details/employee-document-details.component';
import { DocumentService } from "../../document/services/document-service";

@NgModule({
  imports: [
    CommonModule
    , ReactiveFormsModule
    , AtlasElementsModule
    , RouterModule.forChild(employeeTimelineRoutes)
    , LocalizationModule
    , AtlasSharedModule
    , EmployeeEventModule
  ],
  declarations: [
    TimelineComponent
    , EmployeeTimelineComponent
    , AddUpdateEmployeeDocumentComponent
    , EmployeeEventDetails
    , EmployeeDocumentDetails
  ],
  exports: [TimelineComponent],
  providers: [
    LocalizationConfig
    , DocumentService
  ]
})
export class EmployeeTimelineModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
  ) {
    

  }
}
