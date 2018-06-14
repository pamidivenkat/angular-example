import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { RouterModule } from '@angular/router';
import { LocalizationModule, LocaleService, TranslationService } from 'angular-l10n';
import { ReactiveFormsModule } from '@angular/forms';
import {
  AddUpdateWorkingdayprofileContainerComponent
} from './containers/add-update-workingdayprofile-container/add-update-workingdayprofile-container.component';
import {
  AddUpdateWorkingdayprofileComponent
} from './components/add-update-workingdayprofile/add-update-workingdayprofile.component';
import { ManageWorkingDayProfileRoutes } from './manageworkingdayprofile.routes';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from '../../shared/localization-config';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { AddUpdatePublicHolidayComponent } from './components/add-update-public-holiday/add-update-public-holiday.component';
import {
  NonWorkingDaysAndPublicHolidayService
} from '../nonworkingdaysandbankholidays/services/nonworkingdaysandbankholiday.service';
import {
  DuplicatePublicHolidayValidatorDirective
} from '../nonworkingdaysandbankholidays/directives/duplicate-public-holiday-validator.directive';
import {
  DuplicateNonWorkingdayProfileDirective
} from '../nonworkingdaysandbankholidays/directives/duplicate-non-workingday-profile.directive';
import { BreadcrumbGroup } from '../../atlas-elements/common/models/ae-breadcrumb-group';

@NgModule({
  imports: [
    CommonModule
    , AtlasElementsModule
    , RouterModule.forChild(ManageWorkingDayProfileRoutes)
    , LocalizationModule
    , ReactiveFormsModule
    ,  AtlasSharedModule
  ],
  declarations: [
    AddUpdateWorkingdayprofileContainerComponent
    , AddUpdateWorkingdayprofileComponent
    , AddUpdatePublicHolidayComponent
    , DuplicatePublicHolidayValidatorDirective
    , DuplicateNonWorkingdayProfileDirective
  ],
  exports: [AddUpdateWorkingdayprofileContainerComponent],
  providers: [
    LocalizationConfig
    , NonWorkingDaysAndPublicHolidayService]
})
export class ManageworkingdayprofileModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {  

    let bcItem: IBreadcrumb = {
      isGroupRoot: true,
      group: BreadcrumbGroup.NonWorkingDays,
      label: 'Non-working days and bank holidays',
      url: 'company/non-working-days-and-bank-holidays/standard'
    };
    this._breadcrumbService.add(bcItem);
  }
}
