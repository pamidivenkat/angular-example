/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InformationbarComponent } from './information-bar.component';
import { StoreModule, Store } from '@ngrx/store';
import { informationBarReducer } from './../../reducers/information-bar.reducer';
import { CommonModule } from '@angular/common';
import { AtlasElementsModule } from './../../../atlas-elements/atlas-elements.module';
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasSharedModule } from './../../../shared/atlas-shared.module';
import { AeInformationbarComponent } from './../../../atlas-elements/ae-informationbar/ae-informationbar.component';
import { AeStatisticComponent } from './../../../atlas-elements/ae-statistic/ae-statistic.component';
import { AeIconComponent } from './../../../atlas-elements/ae-icon/ae-icon.component';
import { LocalizationConfig } from './../../../shared/localization-config';
import { LocaleServiceStub } from './../../../shared/testing/mocks/locale-service-stub';
import { TranslationServiceStub } from './../../../shared/testing/mocks/translation-service-stub';
import { LocalizationConfigStub } from './../../../shared/testing/mocks/localization-config-stub';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { RouterMock } from './../../../shared/testing/mocks/router-stub';
import { ActivatedRouteStub } from './../../../shared/testing/mocks/activated-route-stub';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbServiceStub } from './../../../shared/testing/mocks/breadcrumb-service-mock';
import { LoadInformationBarCompleteAction } from './../../actions/information-bar.actions';
import { AeInformationBarItem } from './../../../atlas-elements/common/models/ae-informationbar-item';
import * as Immutable from 'immutable';
import { AeInformationBarItemType } from './../../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { reducer } from './../../../shared/reducers';

describe('InformationbarComponent', () => {
  let component: InformationbarComponent;
  let fixture: ComponentFixture<InformationbarComponent>;
  let store: any;
  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let dispatchSpy: any;
  let items = [];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        AtlasElementsModule,
        LocalizationModule,
        AtlasSharedModule,
        StoreModule.provideStore(reducer),
      ],
      declarations: [
        InformationbarComponent
      ],
      providers: [
        InjectorRef
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformationbarComponent);
    component = fixture.componentInstance;

    store = fixture.debugElement.injector.get(Store);

    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    routerMock = fixture.debugElement.injector.get(Router);
    activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
    dispatchSpy = spyOn(store, 'dispatch');
    fixture.detectChanges();
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;

  });

  it('"Information bar" component must be launched', () => {
    expect(component).toBeTruthy();
  });

  describe('Loading mask in information bar component', () => {
    it('Verify whether loading mask must show when data not yet loaded into the component', () => {
      let loadElement = fixture.debugElement.query(By.css('.statistics-bar.display-flex'));
      expect(loadElement).toBeDefined();
    });

    it('Verify whether loading mask must be hidden when data not yet loaded into the component', () => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.HolidaysAvailable, 5, 'Holidays available', false, 'Click here to book a holiday', 'icon-holidays-absence', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
      let loadElement = fixture.debugElement.query(By.css('.statistics-bar.display-flex'));
      expect(loadElement).toBeNull();
    });
  });

  describe('Holidays available component', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.HolidaysAvailable, 5, 'Holidays available', false, 'Click here to book a holiday', 'icon-holidays-absence', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether "Holiday available" title is displaying for HolidayAvailable component or not', () => {

      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
      expect(iconElement.innerText.trim()).toBe('Holidays available');
    });

    it('Verify whether appropriate count is displaying for HolidayAvailable component or not', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
      expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(5);
    });

    // it('Verify whether appropriate count with 2 decimal places is displaying for HolidayAvailable component or not', () => {
    //   expect(1).toBe(1);
    // });

    it('Verify whether tooltip of HolidayAvailable component is "Click here to book a holiday" when user hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Click here to book a holiday');
    });

    it('Verify whether icon displaying for HolidaysAvailable component is matching with specified icon name in the design system', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
      expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-holidays-absence');
    });

    it('Verify whether user is able to click on HolidaysAvailable component or not.', async () => {
      let clickSpy = spyOn(component, 'onInformationBarClicked').and.callThrough();
      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(clickSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalledWith(items[0]);
      });
    });

    it('Verify whether user is able to navigate to his holidays screen when he clicks on HolidaysAvailable component or not.', fakeAsync(() => {
      // expect(1).toBe(1);
      // let statusName = component._getStatusName(selectedMethodStatementCopy);
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/absence-management/holiday/all';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Team Holidays component', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.TeamHolidays, 1245, 'Team holidays', false, 'Click here to see who\'s off this week', null, null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether "Team holidays" title is displaying for TeamHolidays component or not', () => {

      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
      expect(iconElement.innerText.trim()).toBe('Team holidays');
    });

    it('Verify whether appropriate count is displaying for TeamHolidays component or not', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
      expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(1245);
    });

    // it('Verify whether appropriate count with 2 decimal places is displaying for HolidayAvailable component or not', () => {
    //   expect(1).toBe(1);
    // });

    it('Verify whether tooltip of TeamHolidays component is "Click here to see who\'s off this week" when user hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Click here to see who\'s off this week');
    });

    it('Verify whether icon displaying for TeamHolidays component is matching with specified icon name in the design system', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
      expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-people');
    });

    it('Verify whether user is able to click on TeamHolidays component or not.', async () => {
      let clickSpy = spyOn(component, 'onInformationBarClicked').and.callThrough();
      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(clickSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalledWith(items[0]);
      });
    });

    it('Verify whether user is able to see his team calendar screen when he clicks on TeamHolidays component or not.', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/calendar/teamholidays';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Holiday countdown component', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.HolidayCountdown, 8, 'Holiday countdown', false, 'Click here to view your holidays', 'icon-case', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether "Holiday countdown" title is displaying for HolidaysCountdown component or not', () => {

      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
      expect(iconElement.innerText.trim()).toBe('Holiday countdown');
    });

    it('Verify whether appropriate count is displaying for HolidaysCountdown component or not', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
      expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(8);
    });

    // it('Verify whether appropriate count with 2 decimal places is displaying for HolidayAvailable component or not', () => {
    //   expect(1).toBe(1);
    // });

    it('Verify whether tooltip of HolidaysCountdown component is "Click here to view your holidays" when user hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Click here to view your holidays');
    });

    it('Verify whether icon displaying for HolidaysCountdown component is matching with specified icon name in the design system', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
      expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-case');
    });

    it('Verify whether user is able to click on HolidaysCountdown component or not.', async () => {
      let clickSpy = spyOn(component, 'onInformationBarClicked').and.callThrough();
      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(clickSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalledWith(items[0]);
      });
    });

    it('Verify whether user is able to navigate to his holidays screen when he clicks on HolidaysCountdown component or not.', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/absence-management/holiday/approved';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Holiday countdown component - zero value scenario', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.HolidayCountdown, 0, 'Holiday countdown', false, 'You have no holidays booked', 'icon-case', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether tooltip of HolidaysCountdown component is "You have no holidays booked" when user has countdown as zero and hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('You have no holidays booked');
    });

    it('Verify whether user is able to navigate to his holidays screen when user has countdown as zero and he clicks on HolidaysCountdown component or not.', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/absence-management/holiday/approved';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Holidays requested component', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.HolidaysRequested, 22, 'Holidays requested', false, 'Click here to view requests received', 'icon-holidays-absence', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether "Holidays requested" title is displaying for HolidaysRequested component or not', () => {

      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
      expect(iconElement.innerText.trim()).toBe('Holidays requested');
    });

    it('Verify whether appropriate count is displaying for HolidaysRequested component or not', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
      expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(22);
    });

    // it('Verify whether appropriate count with 2 decimal places is displaying for HolidayAvailable component or not', () => {
    //   expect(1).toBe(1);
    // });

    it('Verify whether tooltip of HolidaysRequested component is "Click here to view requests received" when user hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Click here to view requests received');
    });

    it('Verify whether icon displaying for HolidaysRequested component is matching with specified icon name in the design system', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
      expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-holidays-absence');
    });

    it('Verify whether user is able to click on HolidaysRequested component or not.', async () => {
      let clickSpy = spyOn(component, 'onInformationBarClicked').and.callThrough();
      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(clickSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalledWith(items[0]);
      });
    });

    it('Verify whether user is able to navigate to his holiday and absence requests screen when he clicks on HolidaysRequested component or not.', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/absence-management/requests';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Holidays requested component - zero value scenario', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.HolidaysRequested, 0, 'Holidays requested', false, 'Looks like you\'re up to date', 'icon-holidays-absence', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether tooltip of HolidaysCountdown component is "Looks like you\'re up to date" when user has countdown as zero and hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Looks like you\'re up to date');
    });

    it('Verify whether user is able to navigate to his holidays screen when user has countdown as zero and he clicks on HolidaysCountdown component or not.', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/absence-management/requests';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Manage team component', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.ManageTeam, 21, 'Manage team', false, 'Click here to view your team', 'icon-people', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether "Manage team" title is displaying for ManageTeam component or not', () => {

      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
      expect(iconElement.innerText.trim()).toBe('Manage team');
    });

    it('Verify whether appropriate count is displaying for ManageTeam component or not', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
      expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(21);
    });

    // it('Verify whether appropriate count with 2 decimal places is displaying for HolidayAvailable component or not', () => {
    //   expect(1).toBe(1);
    // });

    it('Verify whether tooltip of ManageTeam component is "Click here to view your team" when user hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Click here to view your team');
    });

    it('Verify whether icon displaying for ManageTeam component is matching with specified icon name in the design system', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
      expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-people');
    });

    it('Verify whether user is able to click on ManageTeam component or not.', async () => {
      let clickSpy = spyOn(component, 'onInformationBarClicked').and.callThrough();
      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(clickSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalledWith(items[0]);
      });
    });

    it('Verify whether user is able to navigate to his Manage employees screen when he clicks on ManageTeam component or not.', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/employee/manage';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Employees absent today component', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.EmployeesAbsentToday, 4, 'Employees absent today', false, 'Click here to view your team', 'icon-steth', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether "Employees absent today" title is displaying for EmployeesAbsentToday component or not', () => {

      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
      expect(iconElement.innerText.trim()).toBe('Employees absent today');
    });

    it('Verify whether appropriate count is displaying for EmployeesAbsentToday component or not', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
      expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(4);
    });

    // it('Verify whether appropriate count with 2 decimal places is displaying for HolidayAvailable component or not', () => {
    //   expect(1).toBe(1);
    // });

    it('Verify whether tooltip of EmployeesAbsentToday component is "Click here to view your team" when user hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Click here to view your team');
    });

    it('Verify whether icon displaying for EmployeesAbsentToday component is matching with specified icon name in the design system', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
      expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-steth');
    });

    it('Verify whether user is able to click on EmployeesAbsentToday component or not.', async () => {
      let clickSpy = spyOn(component, 'onInformationBarClicked').and.callThrough();
      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(clickSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalledWith(items[0]);
      });
    });

    it('Verify whether user is able to navigate to his Manage employees screen when he clicks on EmployeesAbsentToday component or not.', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/absence-management/requests/view/absenttoday';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Outstanding Training component', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.OutstandingTraining, 1231, 'Outstanding training', false, 'Click here to view the outstanding training courses for your company', 'icon-education', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether "Outstanding training" title is displaying for OutstandingTraining component or not', () => {

      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
      expect(iconElement.innerText.trim()).toBe('Outstanding training');
    });

    it('Verify whether appropriate count is displaying for OutstandingTraining component or not', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
      expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(1231);
    });

    // it('Verify whether appropriate count with 2 decimal places is displaying for HolidayAvailable component or not', () => {
    //   expect(1).toBe(1);
    // });

    it('Verify whether tooltip of OutstandingTraining component is "Click here to view the outstanding training courses for your company" when user hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Click here to view the outstanding training courses for your company');
    });

    it('Verify whether icon displaying for OutstandingTraining component is matching with specified icon name in the design system', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
      expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-education');
    });

    it('Verify whether user is able to click on OutstandingTraining component or not.', async () => {
      let clickSpy = spyOn(component, 'onInformationBarClicked').and.callThrough();
      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(clickSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalledWith(items[0]);
      });
    });

    it('Verify whether user is able to navigate to his outstanding trainings screen when he clicks on OutstandingTraining component or not.', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/training/report/outstanding';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Outstanding Training component - zero value scenario', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.OutstandingTraining, 0, 'Outstanding training', false, 'Looks like everything is up to date', 'icon-education', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether tooltip of OutstandingTraining component is "Looks like everything is up to date" when user has countdown as zero and hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Looks like everything is up to date');
    });

    it('Verify whether user is able to navigate to his outstanding trainings screen when user has countdown as zero and he clicks on OutstandingTraining component or not.', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/training/report/outstanding';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('My Team Tasks component', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.MyTeamTasks, 4455, 'My team tasks', false, 'Click here to view tasks assigned to your team', 'icon-tasks-team', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether "My team tasks" title is displaying for MyTeamTasks component or not', () => {

      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
      expect(iconElement.innerText.trim()).toBe('My team tasks');
    });

    it('Verify whether appropriate count is displaying for MyTeamTasks component or not', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
      expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(4455);
    });

    // it('Verify whether appropriate count with 2 decimal places is displaying for HolidayAvailable component or not', () => {
    //   expect(1).toBe(1);
    // });

    it('Verify whether tooltip of MyTeamTasks component is "Click here to view tasks assigned to your team" when user hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Click here to view tasks assigned to your team');
    });

    it('Verify whether icon displaying for MyTeamTasks component is matching with specified icon name in the design system', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
      expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-tasks-team');
    });

    it('Verify whether user is able to click on MyTeamTasks component or not.', async () => {
      let clickSpy = spyOn(component, 'onInformationBarClicked').and.callThrough();
      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(clickSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalledWith(items[0]);
      });
    });

    it('Verify whether user is able to navigate to his tasks screen when he clicks on MyTeamTasks component or not.', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/task/view/myteam';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('My Team Tasks component - zero value scenario', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.MyTeamTasks, 0, 'My team tasks', false, 'Looks like everything is up to date', 'icon-tasks-team', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether tooltip of MyTeamTasks component is "Looks like everything is up to date" when user has countdown as zero and hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Looks like everything is up to date');
    });

    it('Verify whether user is able to navigate to his tasks screen when he clicks on MyTeamTasks component or not.', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/task/view/myteam';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Risk assessments component', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.RiskAssessments, 20, 'Risk assessments', false, 'Click here to view all risk assessments for your company', 'icon-alert-triangle', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether "Risk assessments" title is displaying for RiskAssessments component or not', () => {

      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
      expect(iconElement.innerText.trim()).toBe('Risk assessments');
    });

    it('Verify whether appropriate count is displaying for RiskAssessments component or not', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
      expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(20);
    });

    // it('Verify whether appropriate count with 2 decimal places is displaying for HolidayAvailable component or not', () => {
    //   expect(1).toBe(1);
    // });

    it('Verify whether tooltip of RiskAssessments component is "Click here to view all risk assessments for your company" when user hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Click here to view all risk assessments for your company');
    });

    it('Verify whether icon displaying for RiskAssessments component is matching with specified icon name in the design system', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
      expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-alert-triangle');
    });

    it('Verify whether user is able to click on RiskAssessments component or not.', async () => {
      let clickSpy = spyOn(component, 'onInformationBarClicked').and.callThrough();
      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(clickSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalledWith(items[0]);
      });
    });

    it('Verify whether user is able to navigate to his risk assessments screen when he clicks on RiskAssessments component or not.', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/risk-assessment/live';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Risk assessments component - zero value scenario', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.RiskAssessments, 0, 'Risk assessments', false, 'Looks like you don\'t currently have any risk assessments. Go to your risk assessment library to create some.', 'icon-alert-triangle', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether tooltip of RiskAssessments component is "Looks like you don\'t currently have any risk assessments. Go to your risk assessment library to create some." when user has countdown as zero and hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Looks like you don\'t currently have any risk assessments. Go to your risk assessment library to create some.');
    });

    it('Verify whether user is able to navigate to his risk assessments screen when he clicks on RiskAssessments component or not.', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/risk-assessment/live';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Documents to action component', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.DocumentsAwaiting, 24, 'Documents to action', false, 'Click here to view documents that require action', 'icon-to-review', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether "Documents to action" title is displaying for DocumentsToAction component or not', () => {

      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
      expect(iconElement.innerText.trim()).toBe('Documents to action');
    });

    it('Verify whether appropriate count is displaying for DocumentsToAction component or not', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
      expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(24);
    });

    // it('Verify whether appropriate count with 2 decimal places is displaying for HolidayAvailable component or not', () => {
    //   expect(1).toBe(1);
    // });

    it('Verify whether tooltip of DocumentsToAction component is "Click here to view documents that require action" when user hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Click here to view documents that require action');
    });

    it('Verify whether icon displaying for DocumentsToAction component is matching with specified icon name in the design system', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
      expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-to-review');
    });

    it('Verify whether user is able to click on DocumentsToAction component or not.', async () => {
      let clickSpy = spyOn(component, 'onInformationBarClicked').and.callThrough();
      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(clickSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalledWith(items[0]);
      });
    });

    it('Verify whether user is able to navigate to his Documents Landing Page when he clicks on DocumentsToAction component or not', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/document/shared/distributed';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Documents to action component - zero value scenario', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.DocumentsAwaiting, 0, 'Documents to action', false, 'Looks like you\'re up to date', 'icon-to-review', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether tooltip of DocumentsToAction component is "Looks like you\'re up to date" when user has countdown as zero and hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Looks like you\'re up to date');
    });

    it('Verify whether user is able to navigate to his Documents Landing Page when he clicks on DocumentsToAction component or not.', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/document/shared/distributed';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Tasks to complete component', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.TasksToComplete, 496, 'Tasks to complete', false, 'Click here to view tasks due in the current week', 'icon-tasks-to-complete', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether "Tasks to complete" title is displaying for TaskstoComplete component or not', () => {

      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
      expect(iconElement.innerText.trim()).toBe('Tasks to complete');
    });

    it('Verify whether appropriate count is displaying for TaskstoComplete component or not', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
      expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(496);
    });

    // it('Verify whether appropriate count with 2 decimal places is displaying for HolidayAvailable component or not', () => {
    //   expect(1).toBe(1);
    // });

    it('Verify whether tooltip of TaskstoComplete component is "Click here to view tasks due in the current week" when user hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Click here to view tasks due in the current week');
    });

    it('Verify whether icon displaying for TaskstoComplete component is matching with specified icon name in the design system', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
      expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-tasks-to-complete');
    });

    it('Verify whether user is able to click on TaskstoComplete component or not.', async () => {
      let clickSpy = spyOn(component, 'onInformationBarClicked').and.callThrough();
      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(clickSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalledWith(items[0]);
      });
    });

    it('Verify whether user is able to navigate to his Tasks Landing Page when he clicks on TaskstoComplete component or not', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      navigationExtras.queryParams = { due: '15' };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/task/view/mine';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Tasks to complete component - zero value scenario', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.TasksToComplete, 0, 'Tasks to complete', false, 'Looks like you\'re up to date', 'icon-tasks-to-complete', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether tooltip of TaskstoComplete component is "Looks like you\'re up to date" when user has countdown as zero and hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Looks like you\'re up to date');
    });

    it('Verify whether user is able to navigate to his Tasks Landing Page when he clicks on TaskstoComplete component or not.', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      navigationExtras.queryParams = { due: '15' };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/task/view/mine';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Training courses component', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.TrainingCourses, 7, 'Training courses', false, 'Click here to view your training courses', 'icon-education', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether "Training courses" title is displaying for TrainingCourses component or not', () => {

      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
      expect(iconElement.innerText.trim()).toBe('Training courses');
    });

    it('Verify whether appropriate count is displaying for TrainingCourses component or not', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
      expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(7);
    });

    // it('Verify whether appropriate count with 2 decimal places is displaying for HolidayAvailable component or not', () => {
    //   expect(1).toBe(1);
    // });

    it('Verify whether tooltip of TrainingCourses component is "Click here to view your training courses" when user hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Click here to view your training courses');
    });

    it('Verify whether icon displaying for TrainingCourses component is matching with specified icon name in the design system', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
      expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-education');
    });

    it('Verify whether user is able to click on TrainingCourses component or not.', async () => {
      let clickSpy = spyOn(component, 'onInformationBarClicked').and.callThrough();
      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(clickSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalledWith(items[0]);
      });
    });

    it('Verify whether user is able to navigate to his Training Landing Page when he clicks on TrainingCourses component or not', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/training/status/outstanding';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });

  describe('Training courses component - zero value scenario', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      items = [];
      let item = new AeInformationBarItem(AeInformationBarItemType.TrainingCourses, 0, 'Training courses', false, 'Looks like you\'re up to date', 'icon-education', null, true);
      items.push(item);
      store.dispatch(new LoadInformationBarCompleteAction(items));
      fixture.detectChanges();
    });

    it('Verify whether tooltip of TrainingCourses component is "Looks like you\'re up to date" when user has countdown as zero and hovers on it', () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe('Looks like you\'re up to date');
    });

    it('Verify whether user is able to navigate to his Training Landing Page when he clicks on TrainingCourses component or not.', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge',
        relativeTo: activatedRouteStub
      };
      let navigateSpy = spyOn(routerMock, 'navigate');

      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      tick(100);
      fixture.detectChanges();
      tick(100);
      let url = '/training/status/outstanding';
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));
  });
});
