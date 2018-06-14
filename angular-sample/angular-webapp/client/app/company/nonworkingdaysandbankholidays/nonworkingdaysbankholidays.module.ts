import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { NonworkingdaysValidationService } from './services/nonworkingdays-validation-service';
import { EmployeeSearchService } from './../../employee/services/employee-search.service';
import { NonworkingdaysContainerComponent } from './containers/nonworkingdays-container/nonworkingdays-container.component';
import { BreadcrumbService } from './../../atlas-elements/common/services/breadcrumb-service';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';

import { initLocalizationWithAdditionProviders, LocalizationConfig } from './../../shared/localization-config';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonWorkingDaysBankHolidaysRoutes } from './nonworkingdaysbankholidays.routes';
import { IBreadcrumb } from './../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { StandardNonworkingdaysComponent } from './components/standard-nonworkingdays/standard-nonworkingdays.component';
import { CustomNonworkingdaysComponent } from './components/custom-nonworkingdays/custom-nonworkingdays.component';
import { StandardNonworkingdaysNotesComponent } from './components/standard-nonworkingdays-notes/standard-nonworkingdays-notes.component';
import { NonworkingdaysCopyComponent } from './components/nonworkingdays-copy/nonworkingdays-copy.component';
import { NonworkingdaysViewComponent } from './components/nonworkingdays-view/nonworkingdays-view.component';
import { NonworkingdaysAssignComponent } from './components/nonworkingdays-assign/nonworkingdays-assign.component';
import { NonWorkingDaysAndPublicHolidayService } from './services/nonworkingdaysandbankholiday.service';
import { DuplicatePublicHolidayValidatorDirective } from './directives/duplicate-public-holiday-validator.directive';
import { NonworkingdaysSharedModule } from './../nonworkingdays-shared/nonworkingdays-shared.module';

@NgModule({
  imports: [
    CommonModule,
    AtlasElementsModule,
    RouterModule.forChild(NonWorkingDaysBankHolidaysRoutes),
    LocalizationModule,
    ReactiveFormsModule,
    NonworkingdaysSharedModule,
     AtlasSharedModule
  ],
  declarations: [
    NonworkingdaysContainerComponent
    , StandardNonworkingdaysComponent
    , CustomNonworkingdaysComponent
    , StandardNonworkingdaysNotesComponent
    , NonworkingdaysCopyComponent
    , NonworkingdaysViewComponent
    , NonworkingdaysAssignComponent],
  exports: [NonworkingdaysContainerComponent],
  providers: [LocalizationConfig, EmployeeSearchService, NonworkingdaysValidationService]
})
export class NonworkingdaysbankholidaysModule {

  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {    
    
  }
}
