import { ClaimsHelperServiceStub } from '../../../shared/testing/mocks/claims-helper-service-mock';
import { setTimeout } from 'timers';
import { TranslationHandlerStub } from '../../../shared/testing/mocks/translation-handler-stub';
import { TranslationProviderStub } from '../../../shared/testing/mocks/translation-provider-stub';
import { Observable, Observer, TestScheduler } from 'rxjs/Rx';
import { ActionReducer, Store, StoreModule } from '@ngrx/store';
import { BaseRequestOptions, Http, HttpModule } from '@angular/http';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { GreetingComponent } from './greeting.component';
import { AeIconComponent } from '../../../atlas-elements/ae-icon/ae-icon.component';
import {
  InjectorRef,
  LocaleConfig,
  LocaleService,
  LocaleStorage,
  TranslationConfig,
  TranslationHandler,
  TranslationModule,
  TranslationProvider,
  TranslationService,
} from 'angular-l10n';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { BaseComponent } from '../../../shared/base-component';

describe('Greeting Component', () => {
  let component: GreetingComponent;
  let fixture: ComponentFixture<GreetingComponent>;
  let scheduler;
  let claimsHelperServiceStub

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GreetingComponent,
        AeIconComponent,
        TestEmptyGreeting,
        TestGreetingWithOnlyId,
        TestGreetingWithoutBannerImageUrl,
        TestGreetingWithAllParams
      ],
      providers: [
        InjectorRef,
        LocaleConfig,
        LocaleStorage,
        LocaleService,
        TranslationService,
        TranslationConfig,
        { provide: TranslationProvider, useClass: TranslationProviderStub },
        { provide: TranslationHandler, useClass: TranslationHandlerStub },
        { provide: ClaimsHelperService, useValue: jasmine.createSpyObj('çlaimsHelperServiceStub', ['getEmpDOB', 'getUserFirstName']) },
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          deps: [MockBackend, BaseRequestOptions],
          useFactory: (backendInstance: MockBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backendInstance, defaultOptions);
          }
        }
      ],
      imports: [
        TranslationModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GreetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    claimsHelperServiceStub = TestBed.get(ClaimsHelperService);
    claimsHelperServiceStub.getUserFirstName.and.returnValue('Employee Name');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not create greeting component when id is not supplied ', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestEmptyGreeting);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should not create greeting component when name is not supplied ', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestGreetingWithOnlyId);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should not create greeting component when banner image url is not supplied ', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestGreetingWithoutBannerImageUrl);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should create greeting component without throwing any error when id,name,banner image url are supplied', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestGreetingWithAllParams);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('div tag should have "banner" class', () => {
    let fixture: ComponentFixture<TestGreetingWithAllParams> = TestBed.createComponent(TestGreetingWithAllParams);
    let component: TestGreetingWithAllParams = fixture.componentInstance;
    let divEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    fixture.detectChanges();
    let hasClass: boolean = divEl.classList.contains("banner");
    expect(hasClass).toBe(true);
  });

  it('div tag should have "banner__background" class', () => {
    let fixture: ComponentFixture<TestGreetingWithAllParams> = TestBed.createComponent(TestGreetingWithAllParams);
    let component: TestGreetingWithAllParams = fixture.componentInstance;
    let divEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    fixture.detectChanges();
    let divEl2: HTMLElement = <HTMLElement>divEl.querySelectorAll('.banner__background')[0];
    let hasClass: boolean = (divEl2 != undefined);
    expect(hasClass).toBe(true);
  });

  it('div tag having "banner__background" class should have html content', () => {
    let fixture: ComponentFixture<TestGreetingWithAllParams> = TestBed.createComponent(TestGreetingWithAllParams);
    let component: TestGreetingWithAllParams = fixture.componentInstance;
    let divEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    fixture.detectChanges();
    let divEl2: HTMLElement = <HTMLElement>divEl.querySelectorAll('.banner__background')[0];
    let hasContent: boolean = (divEl2 != undefined && divEl2.children.length > 0);
    expect(hasContent).toBe(true);
  });

  it('should have span tag with id for greeting text', () => {
    let fixture: ComponentFixture<TestGreetingWithAllParams> = TestBed.createComponent(TestGreetingWithAllParams);
    let component: TestGreetingWithAllParams = fixture.componentInstance;
    let divEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    fixture.detectChanges();
    let divEl2: HTMLElement = <HTMLElement>divEl.querySelectorAll('#greetingtest_greetingText_1')[0];
    let hasClass: boolean = (divEl2 != undefined);
    expect(hasClass).toBe(true);
  });

  it('should have span tag with id for user first name', () => {
    let fixture: ComponentFixture<TestGreetingWithAllParams> = TestBed.createComponent(TestGreetingWithAllParams);
    let component: TestGreetingWithAllParams = fixture.componentInstance;
    let divEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    fixture.detectChanges();
    let divEl2: HTMLElement = <HTMLElement>divEl.querySelectorAll('#greetingtest_userFirstName_1')[0];
    let hasClass: boolean = (divEl2 != undefined);
    expect(hasClass).toBe(true);
  });

  it('span tag with id for user first name should have user first name content', () => {
    let fixture: ComponentFixture<TestGreetingWithAllParams> = TestBed.createComponent(TestGreetingWithAllParams);
    let component: TestGreetingWithAllParams = fixture.componentInstance;
    let divEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    fixture.detectChanges();
    let divEl2: HTMLElement = <HTMLElement>divEl.querySelectorAll('#greetingtest_userFirstName_1')[0];
    let hasContent: boolean = (divEl2 != undefined && divEl2.innerText.length > 0);
    expect(hasContent).toBe(true);
  });

  it('should have span tag with id for today text', () => {
    let fixture: ComponentFixture<TestGreetingWithAllParams> = TestBed.createComponent(TestGreetingWithAllParams);
    let component: TestGreetingWithAllParams = fixture.componentInstance;
    let divEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    fixture.detectChanges();
    let divEl2: HTMLElement = <HTMLElement>divEl.querySelectorAll('#greetingtest_todayText_1')[0];
    let hasClass: boolean = (divEl2 != undefined);
    expect(hasClass).toBe(true);
  });

  it('span tag with id for today text should have today content', () => {
    let fixture: ComponentFixture<TestGreetingWithAllParams> = TestBed.createComponent(TestGreetingWithAllParams);
    let component: TestGreetingWithAllParams = fixture.componentInstance;
    let divEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    fixture.detectChanges();
    let divEl2: HTMLElement = <HTMLElement>divEl.querySelectorAll('#greetingtest_todayText_1')[0];
    let hasContent: boolean = (divEl2 != undefined && divEl2.innerText.length > 0);
    expect(hasContent).toBe(true);
  });

  it('ae-icon component should render', () => {
    let fixture: ComponentFixture<TestGreetingWithAllParams> = TestBed.createComponent(TestGreetingWithAllParams);
    let component: TestGreetingWithAllParams = fixture.componentInstance;
    let divEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    fixture.detectChanges();
    let iconEl: HTMLElement = <HTMLElement>divEl.querySelectorAll('ae-icon')[0];
    expect(iconEl).toBeDefined();
  });

  it('ae-icon component should have correct id/name relative to greeting component id', () => {
    let fixture: ComponentFixture<TestGreetingWithAllParams> = TestBed.createComponent(TestGreetingWithAllParams);
    let component: TestGreetingWithAllParams = fixture.componentInstance;
    let divEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    fixture.detectChanges();
    let iconEl: HTMLElement = <HTMLElement>divEl.querySelectorAll('ae-icon > div')[0];
    expect(iconEl).toBeDefined();
    let idValue: string = iconEl.getAttribute('id');
    let greetingIdValue: string = divEl.getAttribute('id');
    expect(idValue).toEqual(`${greetingIdValue}_AeIcon_1`);
    let nameValue: string = iconEl.getAttribute('id');
    expect(nameValue).toEqual(`${greetingIdValue}_AeIcon_1`);
  });

  it('date icon size should be small', () => {
    let fixture: ComponentFixture<TestGreetingWithAllParams> = TestBed.createComponent(TestGreetingWithAllParams);
    let component: TestGreetingWithAllParams = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    fixture.detectChanges();
    let iconEl: HTMLElement = <HTMLElement>anchorEl.querySelectorAll('ae-icon > div')[0];
    expect(iconEl).toBeDefined();
    let hasClasses: boolean = iconEl.classList.contains("icon") && iconEl.classList.contains("icon--small");
    expect(hasClasses).toEqual(true);
    expect(iconEl.classList.length).toEqual(2);
  });

  it('date icon name should be "icon-date"', () => {
    let fixture: ComponentFixture<TestGreetingWithAllParams> = TestBed.createComponent(TestGreetingWithAllParams);
    let component: TestGreetingWithAllParams = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
    fixture.detectChanges();
    let iconSvgEl: HTMLElement = <HTMLElement>anchorEl.querySelectorAll('ae-icon > div > svg > use')[0];
    expect(iconSvgEl).toBeDefined();
    expect(iconSvgEl.getAttribute('xlink:href').split('#')[1]).toEqual('icon-date');
  });

  describe('Greeting text', () => {

    beforeEach(function () {
      jasmine.clock().install();
    });

    it('span tag with id for greeting text should have greeting content: Good morning', () => {

      let nowDate = new Date(2017, 10, 11, 8, 0, 0);
      jasmine.clock().mockDate(nowDate);

      let fixture = TestBed.createComponent(GreetingComponent);
      let component = fixture.componentInstance;
      let divEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
      let divEl2: HTMLElement = <HTMLElement>divEl.querySelectorAll('#Greeting_greetingText_1')[0];
      fixture.detectChanges();

      jasmine.clock().tick(100);

      expect(component.greetingText).toEqual('GREETING.GOOD MORNING');

    });

    it('span tag with id for greeting text should have greeting content: Good afternoon', () => {

      let nowDate = new Date(2017, 10, 11, 15, 0, 0);
      jasmine.clock().mockDate(nowDate);

      let fixture = TestBed.createComponent(GreetingComponent);
      let component = fixture.componentInstance;
      let divEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
      let divEl2: HTMLElement = <HTMLElement>divEl.querySelectorAll('#Greeting_greetingText_1')[0];
      fixture.detectChanges();

      jasmine.clock().tick(100);

      expect(component.greetingText).toEqual('GREETING.GOOD AFTERNOON');

    });

    it('span tag with id for greeting text should have greeting content: Good evening', () => {

      let nowDate = new Date(2017, 10, 11, 18, 0, 0);
      jasmine.clock().mockDate(nowDate);

      let fixture = TestBed.createComponent(GreetingComponent);
      let component = fixture.componentInstance;
      let divEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
      let divEl2: HTMLElement = <HTMLElement>divEl.querySelectorAll('#Greeting_greetingText_1')[0];
      fixture.detectChanges();

      jasmine.clock().tick(100);

      expect(component.greetingText).toEqual('GREETING.GOOD EVENING');

    });

    afterEach(function () {
      jasmine.clock().uninstall();
    });
  });

  describe('birth day wish test', () => {
    beforeEach(function () {
      jasmine.clock().install();
      claimsHelperServiceStub.getEmpDOB.and.returnValue(new Date(2017, 10, 11, 8, 0, 0));
    });

    it('span tag with id for greeting text should have greeting content: HAPPY BIRTHDAY', () => {

      let nowDate = new Date(2017, 10, 11, 8, 0, 0);
      jasmine.clock().mockDate(nowDate);

      let fixture = TestBed.createComponent(GreetingComponent);
      let component = fixture.componentInstance;
      let divEl: HTMLElement = fixture.debugElement.query(By.css('div')).nativeElement;
      let divEl2: HTMLElement = <HTMLElement>divEl.querySelectorAll('#Greeting_greetingText_1')[0];
      fixture.detectChanges();

      jasmine.clock().tick(100);

      expect(component.greetingText).toEqual('GREETING.HAPPY BIRTHDAY');

    });

    afterEach(function () {
      jasmine.clock().uninstall();
    });
  })

});


/**
 * Mock components for testing
 * 
 * @class BaseTestGreeting
 */
class BaseTestGreeting {
  id: string = "greetingtest";
  name: string = "greetingtest";
  _greetingText: string = "GOOD MORNING";
  _todayDay: string = "Thursday";
  _todayDate: number = 23;
  _todayMonth: string = "March";
  backgroundImage: string = '/assets/images/generic-banner-image.jpg';
}
@Component({
  template: `
  <greeting></greeting>`})
class TestEmptyGreeting extends BaseTestGreeting { }

@Component({
  template: `
  <greeting [id]="id"></greeting>`})
class TestGreetingWithOnlyId extends BaseTestGreeting { }

@Component({
  template: `
  <greeting [id]="id" [name]="name"></greeting>`})
class TestGreetingWithoutBannerImageUrl extends BaseTestGreeting { }

@Component({
  template: `
  <greeting [id]="id" [name]="name" 
[backgroundImage]="'/assets/images/generic-banner-image.jpg'"> 
</greeting>`})
class TestGreetingWithAllParams extends BaseTestGreeting { }
