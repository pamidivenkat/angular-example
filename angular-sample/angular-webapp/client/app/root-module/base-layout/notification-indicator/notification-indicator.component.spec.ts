import { By } from '@angular/platform-browser';
import { AbsenceStatusLoadCompleteAction } from '../../../shared/actions/lookup.actions';
import { Component } from '@angular/core';
import { getUnReadNotificationIds } from '../../common/extract-helpers';
import { NotificationsMarkAsReadAction } from '../../actions/notification-actions';
import { MockStoreProviderFactory } from '../../../shared/testing/mocks/mock-store-provider-factory';
import { AtlasNotification, NotificationMarkAsReadPayLoad } from '../../models/notification';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DocumentDetailsServiceStub } from './../../../shared/testing/mocks/document-details-service-stub';
import { DocumentDetailsService } from './../../../document/document-details/services/document-details.service';
import { HttpStub, mockHttpProvider, restClientServiceProvider } from './../../../shared/testing/mocks/http-stub';
import { RestClientServiceStub } from './../../../shared/testing/mocks/rest-client-service-stub';
import { AuthorizationEffectsStub } from '../../../shared/testing/mocks/authorize-effects-stub';
import { AuthorizationEffects } from '../../../shared/effects/authorization.effects';
import { CookieService } from 'ngx-cookie';
import { StorageService } from '../../../shared/services/storage.service';
import { AuthorizationServiceStub, AuthorizationServiceFactory } from '../../../shared/testing/mocks/authorization-service-mock';
import { CookieServiceStub } from '../../../shared/testing/mocks/cookie-service-stub';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../shared/reducers';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from '../../../atlas-elements/atlas-elements.module';
import { ActivatedRoute, NavigationExtras, Router, RouterModule } from '@angular/router';
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasSharedModule } from '../../../shared/atlas-shared.module';
import { EmailSharedModule } from '../../../email-shared/email-shared.module';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbServiceStub } from '../../../shared/testing/mocks/breadcrumb-service-mock';
import { LocaleServiceStub } from '../../../shared/testing/mocks/locale-service-stub';
import { TranslationServiceStub } from '../../../shared/testing/mocks/translation-service-stub';
import { LocalizationConfig } from '../../../shared/localization-config';
import { RouterMock } from '../../../shared/testing/mocks/router-stub';
import { LocalizationConfigStub } from '../../../shared/testing/mocks/localization-config-stub';
import { ActivatedRouteStub } from '../../../shared/testing/mocks/activated-route-stub';
import { ClaimsHelperServiceStub } from '../../../shared/testing/mocks/claims-helper-service-mock';
import { RouteParamsMock } from '../../../shared/testing/mocks/route-params-mock';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { RouteParams } from '../../../shared/services/route-params';
import { DocumentSharedModule } from '../../../document/document-shared/document-shared.module';
import { MessengerService } from '../../../shared/services/messenger.service';
import { ConnectionBackend, Http, HttpModule, XHRBackend, RequestOptions, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { AuthorizationService } from '../../../shared/security/authorization.service';
import { AuthConfig, authConfigServiceFactory } from '../../../shared/security/auth-config';
import { StorageServiceStub } from '../../../shared/testing/mocks/storage-service-mock';
import { reducer } from '../../../shared/reducers/index';
import { NotificationIndicatorComponent } from '../../../root-module/base-layout/notification-indicator/notification-indicator.component';
import { BaseComponent } from '../../../shared/base-component';

describe('NotificationIndicatorComponent', () => {
  let component: NotificationIndicatorComponent;
  let fixture: ComponentFixture<NotificationIndicatorComponent>;
  let store: Store<fromRoot.State>;
  let dispatchSpy: jasmine.Spy;
  let configLoaded: jasmine.Spy;
  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any
  let routeParamsStub: any;
  let _http: any;
  let atlasNotifications: AtlasNotification[];
  let myAbsences: any[] = [];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        LocalizationModule,
        AtlasSharedModule,
        EmailSharedModule,
        NoopAnimationsModule,
        StoreModule.provideStore(reducer),
      ],
      declarations: [NotificationIndicatorComponent
      ],
      providers: [
        InjectorRef
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
        , { provide: RouteParams, useClass: RouteParamsMock }
        , { provide: Http, useValue: mockHttpProvider }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationIndicatorComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);


    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    routerMock = fixture.debugElement.injector.get(Router);
    activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
    claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
    routeParamsStub = fixture.debugElement.injector.get(RouteParams);
    atlasNotifications = MockStoreProviderFactory.getMockAtlasNotificationApiResponse();
    component.initialNotificationItems = atlasNotifications;
    store.dispatch(new AbsenceStatusLoadCompleteAction(myAbsences));
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('should load the notification indicator and notification items', () => {
    it('should have notification icon', () => {
      expect(fixture.debugElement.nativeElement.querySelector('#notificationIcon_notificationsCount_1')).not.toBeNull();
    });

    it('should display pending notification count', () => {
      component.noOfUnReadNotifications = 6;
      fixture.detectChanges();
      let noOfUnReadNotificationsCount = fixture.debugElement.nativeElement.querySelector('#notificationIcon_notificationsCount_1');
      expect(noOfUnReadNotificationsCount.dataset.value).toEqual('6');
    });

    it('should have notification data', () => {
      component.initialNotificationItems = atlasNotifications;
      fixture.detectChanges();
      expect(component.initialNotificationItems.length).toEqual(atlasNotifications.length);
    });

    it('should open notification slide-out when click on notification icon', () => {
      component.initialNotificationItems = atlasNotifications;
      let notificationIcon = fixture.debugElement.nativeElement.querySelector('#notificationIcon_notificationsCount_1');
      let event = new MouseEvent('click');
      component.onNotificationClick(event);
      fixture.detectChanges();

      let aeNotificationList = fixture.debugElement.nativeElement.querySelector('#notificationIcon_ae-list_1');
      expect(aeNotificationList).not.toBeNull();

    });

    it('should open notification slide-out with data', () => {
      store.dispatch(new AbsenceStatusLoadCompleteAction(myAbsences));
      let notificationIcon = fixture.debugElement.nativeElement.querySelector('#notificationIcon_notificationsCount_1');
      let event = new MouseEvent('click');
      component.onNotificationClick(event);
      fixture.detectChanges();
    });

    it('should open notification slide-out with data and action link should be clickable', () => {
      let notificationIcon = fixture.debugElement.nativeElement.querySelector('#notificationIcon_notificationsCount_1');
      let event = new MouseEvent('click');
      component.onNotificationClick(event);
      fixture.detectChanges();

      let aeNotificationLink = fixture.debugElement.nativeElement.querySelector('#notificationIcon_ae-list_1_ul_li_AeAnchor_1');
      expect(aeNotificationLink).not.toBeNull();
    });

    it('Verify user is able to navigate to distributed document screen when user clicks on distributed document notification link.', fakeAsync(() => {
      let notificationIcon = fixture.debugElement.nativeElement.querySelector('#notificationIcon_notificationsCount_1');
      let event = new MouseEvent('click');
      component.onNotificationClick(event);
      fixture.detectChanges();

      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      };
      let navigateSpy = spyOn(routerMock, 'navigate')
      let aeNotificationLink = <HTMLAnchorElement>fixture.debugElement.query(By.css('#notificationIcon_ae-list_1_ul_li_AeAnchor_4')).nativeElement;
      aeNotificationLink.click();
      fixture.detectChanges();
      tick(100);
      let url = '/document/shared/distributed';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));

    it('Verify user is able to navigate to holiday screen when user clicks on holiday notification link.', fakeAsync(() => {
      let notificationIcon = fixture.debugElement.nativeElement.querySelector('#notificationIcon_notificationsCount_1');
      let event = new MouseEvent('click');
      component.onNotificationClick(event);
      fixture.detectChanges();

      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      };
      let navigateSpy = spyOn(routerMock, 'navigate')
      let aeNotificationLink = <HTMLAnchorElement>fixture.debugElement.query(By.css('#notificationIcon_ae-list_1_ul_li_AeAnchor_13')).nativeElement;
      aeNotificationLink.click();
      fixture.detectChanges();
      tick(100);
      let url = '/absence-management/holiday/all';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));

    it('Verify user is able to navigate to training course screen when user clicks on training course notification link.', fakeAsync(() => {
      let notificationIcon = fixture.debugElement.nativeElement.querySelector('#notificationIcon_notificationsCount_1');
      let event = new MouseEvent('click');
      component.onNotificationClick(event);
      fixture.detectChanges();

      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      };
      let navigateSpy = spyOn(routerMock, 'navigate')
      let aeNotificationLink = <HTMLAnchorElement>fixture.debugElement.query(By.css('#notificationIcon_ae-list_1_ul_li_AeAnchor_0')).nativeElement;
      aeNotificationLink.click();
      fixture.detectChanges();
      tick(100);
      let url = '/training';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));

    it('Verify notification slide-out closing or not when user clicks on employee event notification link.', fakeAsync(() => {
      let notificationIcon = fixture.debugElement.nativeElement.querySelector('#notificationIcon_notificationsCount_1');
      let event = new MouseEvent('click');
      component.onNotificationClick(event);
      fixture.detectChanges();
      
      let aeNotificationLink = <HTMLAnchorElement>fixture.debugElement.query(By.css('#notificationIcon_ae-list_1_ul_li_AeAnchor_2')).nativeElement;
      aeNotificationLink.click();
      fixture.detectChanges();
      tick(100);
      let aeListSlideOut = fixture.debugElement.query(By.css('#notificationIcon_ae-list_1')).nativeElement
      expect(aeListSlideOut).not.toBeNull();
    }));
  });
});
