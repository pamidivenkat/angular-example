import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { CookieOptionsProvider } from 'ngx-cookie/src/cookie-options-provider';
import { CookieOptions, CookieService, CookieModule } from 'ngx-cookie';
import { AuthGuard } from './../../../shared/security/auth.guard';
import { StorageService } from './../../../shared/services/storage.service';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { FormBuilderService } from './../../../shared/services/form-builder.service';
import { mockHttpProvider } from './../../../shared/testing/mocks/http-stub';
import { RouteParamsMock } from './../../../shared/testing/mocks/route-params-mock';
import { RouteParams } from './../../../shared/services/route-params';
import { DocumentDetailsServiceStub } from './../../../shared/testing/mocks/document-details-service-stub';
import { DocumentDetailsService } from './../../../document/document-details/services/document-details.service';
import { ActivatedRouteStub } from './../../../shared/testing/mocks/activated-route-stub';
import { RouterMock } from './../../../shared/testing/mocks/router-stub';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { LocalizationConfigStub } from './../../../shared/testing/mocks/localization-config-stub';
import { LocalizationConfig } from './../../../shared/localization-config';
import { TranslationServiceStub } from './../../../shared/testing/mocks/translation-service-stub';
import { LocaleServiceStub } from './../../../shared/testing/mocks/locale-service-stub';
import { BreadcrumbServiceStub } from './../../../shared/testing/mocks/breadcrumb-service-mock';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { AtlasSharedModule } from './../../../shared/atlas-shared.module';
import { AuthorizationService } from './../../../shared/security/authorization.service';
import { AuthorizationEffectsStub } from './../../../shared/testing/mocks/authorize-effects-stub';
import { AuthorizationEffects } from '.././../../shared/effects/authorization.effects';
import { AuthorizationServiceStub, AuthorizationServiceFactory } from './../../../shared/testing/mocks/authorization-service-mock';
import { AuthConfig, authConfigServiceFactory } from './../../../shared/security/auth-config';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CompanyStructureItemComponent } from './../company-structure-item/company-structure-item.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AtlasElementsModule } from './../../../atlas-elements/atlas-elements.module';
import { ChangePasswordComponent } from './../change-password/change-password.component';
import { CompanyStructureComponent } from './../company-structure/company-structure.component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { ClaimsHelperServiceStub } from './../../../shared/testing/mocks/claims-helper-service-mock';
import { AeImageAvatarComponent } from '../../../atlas-elements/ae-image-avatar/ae-image-avatar.component';
import { AeIconComponent } from '../../../atlas-elements/ae-icon/ae-icon.component';
import { By } from '@angular/platform-browser';
import { Observable, Observer } from 'rxjs/Rx';
import { Store, StoreModule } from '@ngrx/store';
import { MockBackend } from '@angular/http/testing';
import { BaseRequestOptions, Http } from '@angular/http';
import { Component, ChangeDetectorRef } from '@angular/core';
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { reducer } from './../../../shared/reducers/index';
import { ProfileComponent } from './profile.component';
import { InjectorRef, LocaleService, TranslationModule, TranslationService, LocalizationModule } from 'angular-l10n';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any
  let routeParamsStub: any;
  let _http: any;

  let localeService: any = new LocaleServiceStub();
  let translationService: any = new TranslationServiceStub();
  let localizationConfig: any = new LocalizationConfigStub();
  let changeDetectorRef: ChangeDetectorRef;
  let activatedRoute: ActivatedRoute;
  let router: any = new RouterMock();
  let fb: FormBuilder = new FormBuilder();
  let claimsHelper: any = new ClaimsHelperServiceStub();
  let breadcrumbService: any;
  let routeParams: any = new RouteParamsMock();
  let isEmpId: jasmine.Spy;
  let navigateSpy: jasmine.Spy;
  let isEmpPictureUrl: jasmine.Spy;
  let isCompanyName: jasmine.Spy;
  let isHROrSO: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProfileComponent,
        CompanyStructureComponent,
        ChangePasswordComponent,
        CompanyStructureItemComponent,
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
        , { provide: AuthorizationEffects, useClass: AuthorizationEffectsStub }

        , MockBackend
        , FormBuilderService
        , AuthorizationService
        //   , CookieService,{ provide: CookieOptions, useValue: {} }
        , CookieOptionsProvider
        , RestClientService,
        {
          provide: AuthConfig,
          useFactory: authConfigServiceFactory,
          deps: []
        }
        , AuthGuard
        , StorageService
        , BaseRequestOptions
      ],
      imports: [
        TranslationModule,
        ReactiveFormsModule,
        AtlasElementsModule
        , LocalizationModule
        , AtlasSharedModule
        , StoreModule.provideStore(reducer)
        , CookieModule.forRoot()
        , BrowserAnimationsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    routerMock = fixture.debugElement.injector.get(Router);
    activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
    claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
    routeParamsStub = fixture.debugElement.injector.get(RouteParams);
    isEmpId = spyOn(claimsHelperServiceStub, 'getEmpId');
    isEmpPictureUrl = spyOn(claimsHelperServiceStub, 'getEmpPictureUrl');
    isCompanyName = spyOn(claimsHelperServiceStub, 'getCompanyName');
    isHROrSO = spyOn(claimsHelperServiceStub, 'isHRManagerOrServiceOwner');
    navigateSpy = spyOn(routerMock, 'navigate');
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('Profile of Email user Component launch', () => {

    beforeEach(() => {
      isEmpId.and.returnValue('123456');
      fixture.detectChanges();
    });

    it('Showing profile', () => {
      fixture.nativeElement.querySelector('.person__details').click();
      fixture.detectChanges();
      let dropdown = fixture.debugElement.query(By.css('.person__dropdown--open'));
      expect(dropdown).toBeTruthy();
    });

    it('Checking options avaiability', () => {
      fixture.nativeElement.querySelector('.person__details').click();
      fixture.detectChanges();
      let divEl2 = fixture.debugElement.query(By.css('.person__dropdown-inner'));
      let totalChildren: number = (divEl2 != undefined) ? divEl2.children.length : 0;
      expect(totalChildren).toEqual(3);
    });

    it('Employee Details Page', () => {
      fixture.nativeElement.querySelector('.person__details').click();
      fixture.detectChanges();
      component.gotoEmpProfile('e');
      fixture.detectChanges();
      expect(navigateSpy).toHaveBeenCalledWith(['/employee/personal']);
    });

    it('Change Passowrd Page', () => {
      fixture.nativeElement.querySelector('.person__details').click();
      fixture.detectChanges();
      component.changeUserPassword();
      expect(component.showPasswordUpdateForm).toBeTruthy();
    });

    xit('Logout Page', () => {
      fixture.nativeElement.querySelector('.person__details').click();
      fixture.detectChanges();
      component.logout();
      expect(navigateSpy).toHaveBeenCalledWith(['/identity/connect/authorize']);
    });

    it('Profile has uploaded Image', fakeAsync(() => {
      let mockedImage = MockStoreProviderFactory.getTestImage();
      component.empImageUrl = mockedImage
      fixture.detectChanges();
      let profileImage = component.getProfileImageUrl();
      let divEl2 = fixture.debugElement.query(By.css('.person__avatar'));
      let avatarEl = divEl2.children[0].nativeElement;
      expect(avatarEl).toBeDefined();
      let hasImgSrcValue: boolean = avatarEl.attributes[1].name.lastIndexOf('src') >= 0;
      let hasAltValue: boolean = avatarEl.attributes[2].name.lastIndexOf('alt') >= 0;
      expect(hasImgSrcValue).toBe(true);
      expect(hasAltValue).toBe(true);
      expect(profileImage).toEqual('/filedownload?documentId=' + mockedImage);
    }));

    it('Profile has Default Image', fakeAsync(() => {
      let mockedDefaultImage = MockStoreProviderFactory.getTestDefaultImage();
      component.empImageUrl = null;
      fixture.detectChanges();
      let profileImage = component.getProfileImageUrl();
      let divEl2 = fixture.debugElement.query(By.css('.person__avatar'));
      let avatarEl = divEl2.children[0].nativeElement;
      expect(avatarEl).toBeDefined();
      let hasImgSrcValue: boolean = avatarEl.attributes[1].name.lastIndexOf('src') >= 0;
      let hasAltValue: boolean = avatarEl.attributes[2].name.lastIndexOf('alt') >= 0;
      expect(hasImgSrcValue).toBe(true);
      expect(hasAltValue).toBe(true);
      expect(profileImage).toEqual(mockedDefaultImage);
    }));

    it('Pofile Full Name', fakeAsync(() => {
      let mockedFullName = MockStoreProviderFactory.getTestFullName();
      component.userFullName$.next(mockedFullName);
      fixture.detectChanges();
      let name = fixture.debugElement.query(By.css('.person__name'));
      let nameEle = name.children[0].nativeElement;
      expect(nameEle).toBeDefined();
      expect(nameEle.innerHTML).toEqual(mockedFullName);
    }));

    it('Pofile Company Name', fakeAsync(() => {
      let mockedCompany = MockStoreProviderFactory.getTestCompany();
      component.userCompName = mockedCompany;
      fixture.detectChanges();
      fixture.detectChanges();
      let companyName = component.getCompanyName();
      expect(companyName).toBeDefined();
      expect(companyName).toEqual(mockedCompany);
    }));

  });
});



