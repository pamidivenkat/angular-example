import { HolidayRequestsGuard } from './holiday-requests-route-guard';
import { AtlasSharedModule } from './../shared/atlas-shared.module';
import { HolidaysSummaryComponent } from './components/my-holidays-summary/my-holidays-summary.component';
import { HolidaysHeader } from './components/my-holidays-header/my-holidays-header.component';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../shared/localization-config';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from '../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HolidayContainerComponent } from './containers/holiday-container/holiday-container.component';
import { AbsenceContainerComponent } from './containers/absence-container/absence-container.component';
import { AbsenceListComponent } from './components/absence-list/absence-list.component';
import { routes } from './holiday-absence.routes';
import { HolidayAbsenceValidationService } from './services/holiday-absence-validation.service';
import { HolidayAbsenceDataService } from './services/holiday-absence-data.service';
import { HolidaysListComponent } from './components/my-holidays-list/my-holidays-list.component';
import { EmployeeChartComponent } from './components/employee-chart/employee-chart.component';
import { CalendarModule } from '../calendar/calendar.module';
import { HolidayAbsenceRequestsComponent } from './components/holiday-absence-requests/holiday-absence-requests.component';
import { HolidayAbsencesRequestsContainerComponent } from './containers/holiday-absences-requests-container/holiday-absences-requests-container.component';
import { HolidayEntitlementSummaryComponent } from './components/holiday-entitlement-summary/holiday-entitlement-summary.component';
import { TeamCalendarLoaderComponent } from './components/team-calendar-loader/team-calendar-loader.component';
import { BreadcrumbGroup } from '../atlas-elements/common/models/ae-breadcrumb-group';
import { BreadcrumbService } from './../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from './../atlas-elements/common/models/ae-ibreadcrumb.model';
import { HolidayAbsenceSharedModule } from './holiday-absence-shared/holiday-absence-shared.module';




@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    CalendarModule,
    HolidayAbsenceSharedModule,
    RouterModule.forChild(routes),
    LocalizationModule,
    AtlasSharedModule
  ],
  declarations: [
    HolidaysListComponent
    , HolidaysHeader
    , HolidaysSummaryComponent
    , EmployeeChartComponent
    , HolidayContainerComponent
    , AbsenceContainerComponent
    , AbsenceListComponent
    , HolidayAbsenceRequestsComponent
    , HolidayAbsencesRequestsContainerComponent
    , HolidayEntitlementSummaryComponent
    , TeamCalendarLoaderComponent
  ],
  providers: [LocalizationConfig
    , HolidayAbsenceDataService
    , HolidayAbsenceValidationService
    , HolidayRequestsGuard
  ]
})
export class HolidayAbsenceModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService
  ) {
    

  }
}
