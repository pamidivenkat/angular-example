import { AtlasSharedModule } from './../shared/atlas-shared.module';
import { ReferralService } from './services/referral.service';
import { TaskFormsModule } from '../task/task-forms/task-forms.module';
import { TaskModule } from '../task/task.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TodaysOverviewComponent } from './dashboard/todays-overview/todays-overview.component';
import { AtlasElementsModule } from '../atlas-elements/atlas-elements.module';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../shared/localization-config';
import { LocaleService, Localization, LocalizationModule, TranslationModule, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { routes } from './home.routes';
import { InformationbarComponent } from './dashboard/information-bar/information-bar.component';
import { BaseDashboardComponent } from './base-dashboard/base-dashboard.component';
import { TaskComponent } from './dashboard/task/task.component';
import { KeydocumentsComponent } from './dashboard/key-documents/key-documents.component';
import { MyTrainingsComponent } from './dashboard/my-training/my-training.component';
import { TrainingcardComponent } from './dashboard/training-card/training-card.component';
import { GreetingComponent } from './dashboard/greeting/greeting.component';
import { ServiceReportingComponent } from './dashboard/service-reporting/service-reporting.component';
import { NewsComponent } from './dashboard/news/news.component';
import { AdvertComponent } from './dashboard/advert/advert.component';
import { ReferralComponent } from './dashboard/referral/referral.component';
import { WhatsNewComponent } from './dashboard/whats-new/whats-new.component';
@NgModule({
  imports: [
    CommonModule
    , AtlasElementsModule
    , TaskFormsModule
    , ReactiveFormsModule
    , RouterModule.forChild(routes)
    , LocalizationModule
    , AtlasSharedModule
  ],
  declarations: [
    DashboardComponent
    , BaseDashboardComponent
    , GreetingComponent
    , TaskComponent
    , TodaysOverviewComponent
    , KeydocumentsComponent
    , MyTrainingsComponent
    , TrainingcardComponent
    , InformationbarComponent
    , ServiceReportingComponent
    , InformationbarComponent
    , NewsComponent
    , AdvertComponent
    , ReferralComponent
    , WhatsNewComponent
  ],
  exports: [DashboardComponent],
  providers: [LocalizationConfig
  , ReferralService]
})
export class HomeModule {
  constructor(
    private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService) {    
  }
}
