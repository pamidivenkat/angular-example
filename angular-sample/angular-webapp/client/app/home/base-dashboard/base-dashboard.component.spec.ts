import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';

import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { reducer } from '../../shared/reducers/index';
import { RouteParams } from '../../shared/services/route-params';
import { LocaleServiceStub } from '../../shared/testing/mocks/locale-service-stub';
import { RouteParamsMock } from '../../shared/testing/mocks/route-params-mock';
import { RouterMock } from '../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../shared/testing/mocks/translation-service-stub';
import { TaskAddComponent } from '../../task/task-forms/task-add/task-add.component';
import { AdvertComponent } from '../dashboard/advert/advert.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { GreetingComponent } from '../dashboard/greeting/greeting.component';
import { InformationbarComponent } from '../dashboard/information-bar/information-bar.component';
import { KeydocumentsComponent } from '../dashboard/key-documents/key-documents.component';
import { MyTrainingsComponent } from '../dashboard/my-training/my-training.component';
import { NewsComponent } from '../dashboard/news/news.component';
import { ReferralComponent } from '../dashboard/referral/referral.component';
import { ServiceReportingComponent } from '../dashboard/service-reporting/service-reporting.component';
import { TaskComponent } from '../dashboard/task/task.component';
import { TodaysOverviewComponent } from '../dashboard/todays-overview/todays-overview.component';
import { TrainingcardComponent } from '../dashboard/training-card/training-card.component';
import { WhatsNewComponent } from '../dashboard/whats-new/whats-new.component';
import { routes } from '../home.routes';
import { BaseDashboardComponent } from './base-dashboard.component';

describe('Base dashboard component', () => {
  let component: BaseDashboardComponent;
  let fixture: ComponentFixture<BaseDashboardComponent>;
  let claimsHelperServiceMock;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AtlasElementsModule
        , LocalizationModule
        , RouterModule.forChild(routes)
        , ReactiveFormsModule
        , StoreModule.provideStore(reducer)
      ]
      , declarations: [
        BaseDashboardComponent
        , ServiceReportingComponent
        , NewsComponent
        , DashboardComponent
        , InformationbarComponent
        , GreetingComponent
        , TodaysOverviewComponent
        , TaskComponent
        , TrainingcardComponent
        , AdvertComponent
        , WhatsNewComponent
        , TaskAddComponent
        , MyTrainingsComponent
        , KeydocumentsComponent
        , ReferralComponent
      ]
      , providers: [
        InjectorRef
        , BreadcrumbService
        , { provide: Router, useClass: RouterMock }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub}
        , {
          provide: ClaimsHelperService
          , useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
            'isHRManagerOrServiceOwner', 
            'isHSServiceOwnerOrCoordinator', 
            'isHolidayAuthorizerOrManager',
            'getEmpIdOrDefault'
          ])
        }
        , { provide: RouteParams, useClass: RouteParamsMock }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    claimsHelperServiceMock = TestBed.get(ClaimsHelperService);

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have static bar section', () => {
    let section = fixture.debugElement.query(By.css('.statistics-bar')).nativeElement;
    expect(section).toBeTruthy();
  });

  it('should have a banner section', () => {
    let section = fixture.debugElement.query(By.css('.banner')).nativeElement;
    expect(section).toBeTruthy();
  });

  it('should have no employee record message section', () => {
    let section = fixture.debugElement.query(By.css('.no-employee-msg')).nativeElement;
    expect(section).toBeTruthy();
  });

  it('should have a section with three columns', () => {
    let section = fixture.debugElement.queryAll(By.css('.widget__item.widget__item--third'));
    expect(section.length).toEqual(3);
  });
  it('should not have a section with two columns for service reporting and news', () => {
    let section = fixture.debugElement.queryAll(By.css('.widget__item.widget__item--half'));
    expect(section.length).toEqual(0);
  });

  describe('Test for HR manager', () => {
    beforeEach(() => {
      claimsHelperServiceMock.isHRManagerOrServiceOwner.and.returnValue(true);
    });

    it('should have a section with one column for service reporting', () => {
      fixture.detectChanges();
      let section = fixture.debugElement.queryAll(By.css('.widget__item.widget__item--half'));
      expect(section.length).toEqual(1);
      let childComponent = fixture.debugElement.query(By.directive(ServiceReportingComponent))
      expect(childComponent).toBeTruthy();
      let childComponent2 = fixture.debugElement.query(By.directive(NewsComponent))
      expect(childComponent2).toBeFalsy();
    });
  });

  describe('Test for HS coordinator', () => {
    beforeEach(() => {
      claimsHelperServiceMock.isHSServiceOwnerOrCoordinator.and.returnValue(true);
    });

    it('should have a section with two columns for service reporting and news', () => {
      fixture.detectChanges();
      let section = fixture.debugElement.queryAll(By.css('.widget__item.widget__item--half'));
      expect(section.length).toEqual(2);
      let childComponent1 = fixture.debugElement.query(By.directive(ServiceReportingComponent))
      expect(childComponent1).toBeTruthy();
      let childComponent2 = fixture.debugElement.query(By.directive(NewsComponent))
      expect(childComponent2).toBeTruthy();
    });
  })

  describe('Test for holiday authorizer', () => {
    beforeEach(() => {
      claimsHelperServiceMock.isHolidayAuthorizerOrManager.and.returnValue(true);
    });

    it('should have a section with one column for news', () => {
      fixture.detectChanges();
      let section = fixture.debugElement.queryAll(By.css('.widget__item.widget__item--half'));
      expect(section.length).toEqual(1);
      let childComponent1 = fixture.debugElement.query(By.directive(ServiceReportingComponent))
      expect(childComponent1).toBeFalsy();
      let childComponent2 = fixture.debugElement.query(By.directive(NewsComponent))
      expect(childComponent2).toBeTruthy();
    });
  })
});
