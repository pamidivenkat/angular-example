import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobContainerComponent } from './containers/job-container/job-container.component';
import { JobDetailsComponent } from './components/job-details/job-details.component';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { LocaleService, TranslationService, LocalizationModule } from 'angular-l10n';
import { BreadcrumbService } from './../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from './../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { RouterModule } from '@angular/router';
import { jobRoutes } from './job.routes';
import { JobDetailsUpdateComponent } from './components/job-details-update/job-details-update.component';
import {
  UpdateEmployeeHolidaywokingdayprofileComponent
} from './components/update-employee-holidaywokingdayprofile/update-employee-holidaywokingdayprofile.component';
import {
  NonworkingdaysSharedModule
} from './../../company/nonworkingdays-shared/nonworkingdays-shared.module';
import { CompanySharedModule } from './../../company/company-shared/company-shared.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    CompanySharedModule,
    NonworkingdaysSharedModule,
    RouterModule.forChild(jobRoutes),
    LocalizationModule,
    AtlasSharedModule
  ],
  exports: [
    JobContainerComponent
  ],
  declarations: [JobContainerComponent
    , JobDetailsComponent
    , JobDetailsUpdateComponent
    , UpdateEmployeeHolidaywokingdayprofileComponent],
  providers: [
    LocalizationConfig
  ]
})
export class JobModule {

  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
    
  }
}
