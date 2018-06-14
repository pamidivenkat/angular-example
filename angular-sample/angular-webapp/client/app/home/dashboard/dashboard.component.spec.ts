import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';

import { AeNotificationComponent } from '../../atlas-elements/ae-notification/ae-notification.component';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { AtlasSharedModule } from '../../shared/atlas-shared.module';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { LocalizationConfig } from '../../shared/localization-config';
import { reducer } from '../../shared/reducers/index';
import { ActivatedRouteStub } from '../../shared/testing/mocks/activated-route-stub';
import { BreadcrumbServiceStub } from '../../shared/testing/mocks/breadcrumb-service-mock';
import { ClaimsHelperServiceStub } from '../../shared/testing/mocks/claims-helper-service-mock';
import { LocaleServiceStub } from '../../shared/testing/mocks/locale-service-stub';
import { RouterMock } from '../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../shared/testing/mocks/translation-service-stub';
import { TaskFormsModule } from '../../task/task-forms/task-forms.module';
import { BaseDashboardComponent } from '../base-dashboard/base-dashboard.component';
import { routes } from '../home.routes';
import { ReferralService } from '../services/referral.service';
import { AdvertComponent } from './advert/advert.component';
import { DashboardComponent } from './dashboard.component';
import { GreetingComponent } from './greeting/greeting.component';
import { InformationbarComponent } from './information-bar/information-bar.component';
import { KeydocumentsComponent } from './key-documents/key-documents.component';
import { MyTrainingsComponent } from './my-training/my-training.component';
import { NewsComponent } from './news/news.component';
import { ReferralComponent } from './referral/referral.component';
import { ServiceReportingComponent } from './service-reporting/service-reporting.component';
import { TaskComponent } from './task/task.component';
import { TodaysOverviewComponent } from './todays-overview/todays-overview.component';
import { TrainingcardComponent } from './training-card/training-card.component';
import { WhatsNewComponent } from './whats-new/whats-new.component';

/* tslint:disable:no-unused-variable */
describe('Dashboard component', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule
        , AtlasElementsModule
        , TaskFormsModule
        , ReactiveFormsModule
        , RouterModule.forChild(routes)
        , LocalizationModule
        , AtlasSharedModule
        , StoreModule.provideStore(reducer)
        , BrowserAnimationsModule
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
      providers: [
        InjectorRef
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , LocalizationConfig
        , ReferralService
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
      ]

    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain information static bar', () => {
    let infoComponent = fixture.debugElement.query(By.directive(InformationbarComponent));
    expect(infoComponent).toBeTruthy();
  })

  it('should contain banner for dashboard', () => {
    let infoComponent = fixture.debugElement.query(By.css('.banner__background--dashboard')).nativeElement;
    expect(infoComponent).toBeTruthy();
  })

  it('should contain greeting', () => {
    let infoComponent = fixture.debugElement.query(By.directive(GreetingComponent));
    expect(infoComponent).toBeTruthy();
  })

  it('should contain notification icon', () => {
    let infoComponent = fixture.debugElement.query(By.directive(AeNotificationComponent));
    expect(infoComponent).toBeTruthy();
  })

  it('should contain today\'s overview section', () => {
    let infoComponent = fixture.debugElement.query(By.directive(TodaysOverviewComponent));
    expect(infoComponent).toBeTruthy();
  })

  it('should contain task due this week section', () => {
    let infoComponent = fixture.debugElement.query(By.directive(TaskComponent));
    expect(infoComponent).toBeTruthy();
  })

  it('should contain training card section', () => {
    let infoComponent = fixture.debugElement.query(By.directive(TrainingcardComponent));
    expect(infoComponent).toBeTruthy();
  })

  it('should contain advert section', () => {
    let infoComponent = fixture.debugElement.query(By.directive(AdvertComponent));
    expect(infoComponent).toBeTruthy();
  })

  it('should contain whats new', () => {
    let infoComponent = fixture.debugElement.query(By.directive(WhatsNewComponent));
    expect(infoComponent).toBeTruthy();
  })
});
