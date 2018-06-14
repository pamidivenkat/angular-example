import { AtlasSharedModule } from './../shared/atlas-shared.module';
import { CalendarComponent } from './components/calendar/calendar.component';
import { EmployeeCalendarComponent } from './components/employee-calendar/employee-calendar.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from '../atlas-elements/atlas-elements.module';

import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../shared/localization-config';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarRoutes } from './calendar.routes';
import { TeamCalendarComponent } from './components/team-calendar/team-calendar.component';

@NgModule({
  imports: [
    CommonModule,
    AtlasElementsModule,
    RouterModule.forChild(CalendarRoutes),
    LocalizationModule,
    AtlasSharedModule,
    ReactiveFormsModule
  ],
  declarations: [
    CalendarComponent,
    EmployeeCalendarComponent,
    TeamCalendarComponent
  ],
  exports: [
    CalendarComponent,
    EmployeeCalendarComponent,
    TeamCalendarComponent
  ],
  providers: [LocalizationConfig]
})
export class CalendarModule {
  constructor(private _localizationConfig: LocalizationConfig, private _localeService: LocaleService, private _translationService: TranslationService) {    
  }
}
