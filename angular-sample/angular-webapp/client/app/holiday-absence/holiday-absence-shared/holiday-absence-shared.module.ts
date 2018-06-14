import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyAbsenceDeclineComponent } from './components/my-absence-decline/my-absence-decline.component';
import { TeamRoasterComponent } from './components/team-roaster/team-roaster.component';
import { MyAbsenceManageComponent } from './components/my-absence-manage/my-absence-manage.component';
import { MyAbsenceHistoryComponent } from './components/my-absence-history/my-absence-history.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { LocalizationModule, LocaleService, TranslationService } from 'angular-l10n';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from '../../shared/localization-config';
import { HolidayAbsenceDataService } from '../services/holiday-absence-data.service';
import { HolidayAbsenceValidationService } from '../services/holiday-absence-validation.service';
import { HolidayStatusLegendComponent } from './components/holiday-status-legend/holiday-status-legend.component';
import { HolidayStatusIndicatorComponent } from './components/holiday-status-indicator/holiday-status-indicator.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    LocalizationModule,
     AtlasSharedModule
  ],
  declarations: [
    TeamRoasterComponent,
    MyAbsenceManageComponent,
    MyAbsenceHistoryComponent,
    MyAbsenceDeclineComponent,
    HolidayStatusLegendComponent,
    HolidayStatusIndicatorComponent
  ],
  exports: [
    TeamRoasterComponent,
    MyAbsenceManageComponent,
    MyAbsenceHistoryComponent,
    MyAbsenceDeclineComponent,
    HolidayStatusLegendComponent,
    HolidayStatusIndicatorComponent
  ],
  providers: [LocalizationConfig
    , HolidayAbsenceDataService
    , HolidayAbsenceValidationService]
})
export class HolidayAbsenceSharedModule { 
   constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    ) {    
  }
}
