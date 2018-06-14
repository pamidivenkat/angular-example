import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YearendprocedureContainerComponent } from './containers/yearendprocedure-container/yearendprocedure-container.component';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../shared/localization-config';
import { LocaleService, TranslationService, LocalizationModule } from 'angular-l10n';
import { BreadcrumbService } from './../../atlas-elements/common/services/breadcrumb-service';
import { AtlasElementsModule } from './../../atlas-elements/atlas-elements.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { YearendProcedureRoutes } from './yearendprocedures-routes';
import { IBreadcrumb } from './../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { HolidaysettingsBasicinfoComponent } from './components/holidaysettings-basicinfo/holidaysettings-basicinfo.component';
import {
  PendingHolidayAbsenceRequestsComponent
} from './components/pending-holiday-absence-requests/pending-holiday-absence-requests.component';
import { YearendprocedureResultsComponent } from './components/yearendprocedure-results/yearendprocedure-results.component';
import { YearendprocedureStatusComponent } from './components/yearendprocedure-status/yearendprocedure-status.component';
import { YearendprocedureConfirmComponent } from './components/yearendprocedure-confirm/yearendprocedure-confirm.component';
import { HolidayAbsenceSharedModule } from './../../holiday-absence/holiday-absence-shared/holiday-absence-shared.module';
import { YearendprocedureReviewComponent } from './components/yearendprocedure-review/yearendprocedure-review.component';
import { YearendprocedureReadyComponent } from './components/yearendprocedure-ready/yearendprocedure-ready.component';
import { YearendprocedureServiceService } from './services/yearendprocedure-service.service';
import { BreadcrumbGroup } from './../../atlas-elements/common/models/ae-breadcrumb-group';
import { YepTeamCalendarLoaderComponent } from './components/yep-team-calendar-loader/yep-team-calendar-loader.component';

@NgModule({
  imports: [
    CommonModule
    , AtlasElementsModule
    , RouterModule.forChild(YearendProcedureRoutes)
    , LocalizationModule
    , AtlasSharedModule
    , ReactiveFormsModule
    , HolidayAbsenceSharedModule
  ],
  declarations: [YearendprocedureContainerComponent
    , HolidaysettingsBasicinfoComponent
    , PendingHolidayAbsenceRequestsComponent
    , YearendprocedureResultsComponent
    , YearendprocedureStatusComponent
    , YearendprocedureConfirmComponent
    , YearendprocedureReviewComponent
    , YearendprocedureReadyComponent
    , YepTeamCalendarLoaderComponent],
  providers: [
    LocalizationConfig
    , YearendprocedureServiceService
  ]
})
export class YearendproceduresModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {    
  }
}
