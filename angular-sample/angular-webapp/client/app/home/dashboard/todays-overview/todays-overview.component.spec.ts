import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

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
import { AeInformationBarItem } from './../../../atlas-elements/common/models/ae-informationbar-item';
import * as Immutable from 'immutable';
import { AeInformationBarItemType } from './../../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { reducer } from './../../../shared/reducers';
import { TodaysOverviewComponent } from './todays-overview.component';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { ResponseOptions, Response } from '@angular/http';
import { TodaysOverviewLoadCompleteAction, TodaysOverviewLoadAction } from './../../actions/todays-overview.actions';
import { extractTodaysOverviewStatisticsInformation } from './../../common/extract-helpers';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { ClaimsHelperServiceStub } from './../../../shared/testing/mocks/claims-helper-service-mock';
import { StatisticsInformation } from './../../models/statistics-information';

describe('Today\'s Overview Component', () => {
  let component: TodaysOverviewComponent;
  let fixture: ComponentFixture<TodaysOverviewComponent>;
  let store: any;
  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let dispatchSpy: any;
  let items = [];
  let navigateSpy: jasmine.Spy;
  let todaysOverItems: Immutable.List<StatisticsInformation<string>>;
  let statItems: any;
  let employeeId: any;
  let claimsHelperServiceStub: any;

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
        TodaysOverviewComponent
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
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodaysOverviewComponent);
    component = fixture.componentInstance;
    component.id = 'userTodaysOverViewId';
    component.name = 'userTodaysOverViewId';
    store = fixture.debugElement.injector.get(Store);

    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    routerMock = fixture.debugElement.injector.get(Router);
    activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
    claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
    dispatchSpy = spyOn(store, 'dispatch');
    navigateSpy = spyOn(routerMock, 'navigate');
    fixture.detectChanges();
    employeeId = spyOn(claimsHelperServiceStub, 'getEmpIdOrDefault');
    employeeId.and.returnValue('B0623072-C372-4488-83A6-910E6BA434D1');
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;

  });

  it('"Todays overview" component must be launched', () => {
    expect(component).toBeTruthy();
  });

  describe('Today\'s overview component must have HTML structure according to the design system specificatuion', () => {
    beforeEach(() => {
      // jasmine.clock().install();
      dispatchSpy.and.callThrough();
      statItems = MockStoreProviderFactory.getMockTodaysOverviewItems();
      let options = new ResponseOptions({ body: statItems });
      let res = new Response(options);
      // const action = new TodaysOverviewLoadCompleteAction(extractTodaysOverviewStatisticsInformation(res));
      store.dispatch(new TodaysOverviewLoadCompleteAction(extractTodaysOverviewStatisticsInformation(res)));
      fixture.detectChanges();
    });
    // afterEach(() => {
    //   jasmine.clock().uninstall();
    // });

    it('Verify whether component container div element has element id as "userTodaysOverViewId"', () => {
      let divElement: HTMLElement = fixture.debugElement.query(By.css('#userTodaysOverViewId')).nativeElement;
      expect(divElement).toBeDefined();
    });

    it('Verify whether component has element with css class "widget__title"', () => {

      let widgetTitleElement: HTMLElement = fixture.debugElement.query(By.css('#userTodaysOverViewId'))
        .query(By.css('.widget__title')).nativeElement;
      expect(widgetTitleElement).toBeDefined();
    });

    it('Verify whether component has title named as  "Today\'s overview" or not', () => {

      let widgetTitleElement: HTMLElement = fixture.debugElement.query(By.css('#userTodaysOverViewId'))
        .query(By.css('.widget__title')).query(By.css('h2')).nativeElement;
      expect(widgetTitleElement.innerText.trim()).toBe('TODAYSOVERVIEW.Todays TODAYSOVERVIEW.Overview');
    });

    it('Verify whether simplebar scroll has applied to component or not', fakeAsync(() => {
      expect(component.hasScroll()).toBeTruthy();
      expect(component.hasScroll()).not.toBeNull();
    }));

    it('Verify whether today\'s overview items are displaying according to the design system or not', () => {
      let containerElement = fixture.debugElement.query(By.css('#userTodaysOverViewId')).query(By.css('ul.list'));
      expect(containerElement).toBeDefined();
      expect(containerElement.children.length).toBe(component.overviewList.filter(c => c.Count > 0).count());
    });
  });

  describe('Loading mask', () => {
    it('Verify whether before actual data load, loading mask must be displayed', () => {
      // fixture.detectChanges();
      let loadbarContainer = fixture.debugElement.query(By.css('.informationbar-overview')).nativeElement;
      expect(loadbarContainer).toBeDefined();
      let loaderElement = fixture.debugElement.query(By.css('.informationbar-overview'))
        .query(By.css('.h-loader.h2-loader')).nativeElement;
      expect(loaderElement).toBeDefined();
      let listloaderElement: HTMLElement = fixture.debugElement.query(By.css('.informationbar-overview'))
        .query(By.css('.list-loader')).nativeElement;
      expect(listloaderElement).toBeDefined();
      expect(listloaderElement.children.length).toBe(3);
    });

    it('Verify whether after actual data load, loading mask must be hidden', () => {
      dispatchSpy.and.callThrough();
      statItems = MockStoreProviderFactory.getMockTodaysOverviewItems();
      let options = new ResponseOptions({ body: statItems });
      let res = new Response(options);
      // const action = new TodaysOverviewLoadCompleteAction(extractTodaysOverviewStatisticsInformation(res));
      store.dispatch(new TodaysOverviewLoadCompleteAction(extractTodaysOverviewStatisticsInformation(res)));
      fixture.detectChanges();
      let loadbarContainer = fixture.debugElement.query(By.css('.informationbar-overview'));
      expect(loadbarContainer).toBeNull();
      expect(fixture.debugElement.query(By.css('#userTodaysOverViewId'))).toBeDefined();
    });
  });

  describe('No today\'s overview items', () => {
    beforeEach(() => {
      // jasmine.clock().install();
      dispatchSpy.and.callThrough();
      statItems = Array.from([]);
      let options = new ResponseOptions({ body: statItems });
      let res = new Response(options);
      // const action = new TodaysOverviewLoadCompleteAction(extractTodaysOverviewStatisticsInformation(res));
      store.dispatch(new TodaysOverviewLoadCompleteAction(extractTodaysOverviewStatisticsInformation(res)));
      fixture.detectChanges();
    });
    it('Verify whether no items are displaying in the UI, when there are no todays overview items for login user', () => {
      // fixture.detectChanges();
      let containerElement = fixture.debugElement.query(By.css('#userTodaysOverViewId')).query(By.css('.list-scroll'));
      expect(containerElement).toBeNull();
    });

    it('Verify whether looks up to date message or not, when there are no todays overview items for login user', () => {
      // fixture.detectChanges();
      let containerElement = fixture.debugElement.query(By.css('#userTodaysOverViewId')).query(By.css('.up-to-date'));
      expect(containerElement).toBeDefined();
      let titleElement = containerElement.query(By.css('.up-to-date__text')).query(By.css('p'));
      expect(titleElement).toBeDefined();
      expect((<HTMLElement>titleElement.nativeElement).innerText.trim()).toBe('SERVICE_REPORT.upto_date');

      let iconElement = containerElement.query(By.css('.up-to-date__icon')).query(By.css('div#userTodaysOverViewId_AeIcon_1'));
      expect(iconElement).toBeDefined();
      // expect((<HTMLElement>titleElement.nativeElement).innerText.trim()).toBe('div#userTodaysOverViewId_AeIcon_1');
      let iconElementTag: HTMLElement = iconElement.nativeElement;
      expect(iconElementTag.querySelector('.icon.icon--big')).toBeDefined();
      expect(iconElementTag.querySelector('use').getAttribute('xlink:href')).toContain('icon-thumbs-up');
    });
  });

  describe('Today\'s overview component - out of office', () => {
    // beforeEach(() => {
    //   dispatchSpy.and.callThrough();
    //   let statItems = MockStoreProviderFactory.getMockTodaysOverviewItems();
    //   let options = new ResponseOptions({ body: statItems });
    //   let res = new Response(options);
    //   store.dispatch(new TodaysOverviewLoadCompleteAction(extractTodaysOverviewStatisticsInformation(res)));
    //   fixture.detectChanges();
    // });

    it('Verify when the logged in User does NOT have an authorised holiday or absence with a start date of today plus 1 the message will not appear', () => {
      dispatchSpy.and.callThrough();
      statItems = MockStoreProviderFactory.getMockTodaysOverviewItems();
      let options = new ResponseOptions({ body: statItems });
      let res = new Response(options);
      store.dispatch(new TodaysOverviewLoadCompleteAction(extractTodaysOverviewStatisticsInformation(res)));
      fixture.detectChanges();

      let outofOfficeItem = component.overviewList.filter(c => c.Code === 10).first();
      expect(outofOfficeItem).toBeUndefined();
      let oofItems = fixture.debugElement.query(By.css('#userTodaysOverViewId'))
        .query(By.css('ul.list'))
        .queryAll(By.css('li.list__item')).map(c => <HTMLElement>c.nativeElement)
        .filter(c => c.innerText.trim() === 'TODAYSOVERVIEW.OOF_tomorrow!');
      expect(oofItems.length).toBe(0);
    });

    it('Verify when the logged in User has an authorised holiday or absence with a start date of today plus 1 (i.e. tomorrow)', fakeAsync(() => {
      dispatchSpy.and.callThrough();
      statItems = MockStoreProviderFactory.getMockTodaysOverviewItems();
      statItems = Array.from(statItems).map(c => {
        if (c['Code'] === 10) {
          c['Count'] = 1;
        }
        return c;
      });
      let options = new ResponseOptions({ body: statItems });
      let res = new Response(options);
      store.dispatch(new TodaysOverviewLoadCompleteAction(extractTodaysOverviewStatisticsInformation(res)));
      fixture.detectChanges();
      tick(60);
      
        let outofOfficeItem = component.overviewList.filter(c => c.Code === 10).first();
        expect(outofOfficeItem).toBeDefined();
        expect(outofOfficeItem.Count).toBe(1);
        let oofItems = fixture.debugElement.query(By.css('#userTodaysOverViewId'))
          .query(By.css('ul.list'))
          .queryAll(By.css('li.list__item')).map(c => <HTMLElement>c.nativeElement)
          .filter(c => c.innerText.trim() === 'TODAYSOVERVIEW.OOF_tomorrow!');
        expect(oofItems.length).toBeGreaterThan(0);
       
    }));

    it('Verify whether the message will read "You are out of the office tomorrow, make sure you are up to date!"', fakeAsync(() => {
      dispatchSpy.and.callThrough();
      statItems = MockStoreProviderFactory.getMockTodaysOverviewItems();
      statItems = Array.from(statItems).map(c => {
        if (c['Code'] === 10) {
          c['Count'] = 1;
        }
        return c;
      });
      let options = new ResponseOptions({ body: statItems });
      let res = new Response(options);
      store.dispatch(new TodaysOverviewLoadCompleteAction(extractTodaysOverviewStatisticsInformation(res)));
      fixture.detectChanges();
      tick(60);
      fixture.whenStable().then(() => {
        let outofOfficeItem = component.overviewList.filter(c => c.Code === 10).first();
        expect(outofOfficeItem).toBeDefined();
        expect(outofOfficeItem.Count).toBe(1);
        let oofItems = fixture.debugElement.query(By.css('#userTodaysOverViewId'))
          .query(By.css('ul.list'))
          .queryAll(By.css('li.list__item')).map(c => <HTMLElement>c.nativeElement)
          .filter(c => c.innerText.trim() === 'TODAYSOVERVIEW.OOF_tomorrow!');
        expect(oofItems.length).toBeGreaterThan(0);
        expect(oofItems[0].innerText.trim()).toBe('TODAYSOVERVIEW.OOF_tomorrow!');
      });
    }));

    it('Verify whether no action happened when user clicks on message"', fakeAsync(() => {
      dispatchSpy.and.callThrough();
      statItems = MockStoreProviderFactory.getMockTodaysOverviewItems();
      statItems = Array.from(statItems).map(c => {
        if (c['Code'] === 10) {
          c['Count'] = 1;
        }
        return c;
      });
      let options = new ResponseOptions({ body: statItems });
      let res = new Response(options);
      store.dispatch(new TodaysOverviewLoadCompleteAction(extractTodaysOverviewStatisticsInformation(res)));
      fixture.detectChanges();
      tick(60);
      fixture.whenStable().then(() => {
        let outofOfficeItem = component.overviewList.filter(c => c.Code === 10).first();
        let oofItems = fixture.debugElement.query(By.css('#userTodaysOverViewId'))
          .query(By.css('ul.list'))
          .queryAll(By.css('li.list__item')).map(c => <HTMLElement>c.nativeElement)
          .filter(c => c.innerText.trim() === 'TODAYSOVERVIEW.OOF_tomorrow!');
        oofItems[0].click();
        expect(navigateSpy).not.toHaveBeenCalled();
        expect(oofItems[0].querySelector('a')).toBeNull();
      });
    }));
  });

  describe('Team out of office', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      statItems = MockStoreProviderFactory.getAdditioanlTodaysOverviewData();
      const action = new TodaysOverviewLoadCompleteAction(statItems);
      store.dispatch(action);
      // component.todaysOverview$.subscribe((items) => {
      //   todaysOverItems = items;
      // });
      fixture.detectChanges();
    });

    it('should dispaly employee name in team out of office item', fakeAsync(() => {
      let mockOutOfOfficeEmploye = statItems.find(x => x.Code == AeInformationBarItemType.TeamOutOfOffice);
      let outOfOfficeItemText = mockOutOfOfficeEmploye.Data;
      let teamOutOfOfficeItem = component.overviewList.find(x => x.Code == AeInformationBarItemType.TeamOutOfOffice);
      let outOfOfficeEmployeeName = component.getName(teamOutOfOfficeItem.Data);
      expect(outOfOfficeItemText).toContain(outOfOfficeEmployeeName);
    }));

    it('should team out of office record contain holiday start date', fakeAsync(() => {
      let mockOutOfOfficeEmploye = statItems.find(x => x.Code == AeInformationBarItemType.TeamOutOfOffice);
      let outOfOfficeItemText = mockOutOfOfficeEmploye.Data;
      let teamOutOfOfficeItem = component.overviewList.find(x => x.Code == AeInformationBarItemType.TeamOutOfOffice);
      let holidayStartDate = component.getStartDate(teamOutOfOfficeItem.Data);
      expect(outOfOfficeItemText).toContain(holidayStartDate);
    }));

    it('should team out of office record contain holiday end date', fakeAsync(() => {
      let mockOutOfOfficeEmploye = statItems.find(x => x.Code == AeInformationBarItemType.TeamOutOfOffice);
      let outOfOfficeItemText = mockOutOfOfficeEmploye.Data;
      let teamOutOfOfficeItem = component.overviewList.find(x => x.Code == AeInformationBarItemType.TeamOutOfOffice);
      let holidayEndDate = component.getEndDate(teamOutOfOfficeItem.Data);
      expect(outOfOfficeItemText).toContain(holidayEndDate);
    }));

    it('Employee record should be clickbable', fakeAsync(() => {
      spyOn(component, 'onEmployeeRequestsClick');
      let element = fixture.debugElement.query(By.css('#userTodaysOverViewId_teamOutOffice')).nativeElement;
      element.click();
      tick(100);
      expect(component.onEmployeeRequestsClick).toHaveBeenCalled();
    }));

    it('should navigate to holidays list page on employee item click', fakeAsync(() => {
      let teamOutOfOfficeItem = component.overviewList.find(x => x.Code == AeInformationBarItemType.TeamOutOfOffice);
      let employeeName = component.getName(teamOutOfOfficeItem.Data);
      const approvedAbsenceStatusId = '2B5B7BF4-4115-4179-A9FE-90068D183EC7';
      let navigationExtras: NavigationExtras = {
        queryParams: { employee: employeeName, statusId: approvedAbsenceStatusId, range: 'ThisWeek' }
      };
      let url: string = 'absence-management/requests/' + teamOutOfOfficeItem.Id;
      routerMock.url = url;
      component.onEmployeeRequestsClick(teamOutOfOfficeItem.Id, employeeName);
      expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
    }));

    it('should not display any team out of office records if count is 0', fakeAsync(() => {
      let overViewList = MockStoreProviderFactory.getAdditionalTodaysOverviewDataWithOutInfoBarItem(AeInformationBarItemType.TeamOutOfOffice);
      const action = new TodaysOverviewLoadCompleteAction(overViewList);
      store.dispatch(action);
      fixture.detectChanges();
      tick(300);
      let element = fixture.nativeElement;
      expect(element.querySelector('#userTodaysOverViewId_teamOutOffice') === null).toBe(true);
    }));

  });

  describe('Team birthday', async () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      statItems = MockStoreProviderFactory.getAdditioanlTodaysOverviewData();
      const action = new TodaysOverviewLoadCompleteAction(statItems);
      store.dispatch(action);
      // component.todaysOverview$.subscribe((items) => {
      //   todaysOverItems = items;
      // });
      fixture.detectChanges();
    })

    it('should employee birthday record contain name of employee', fakeAsync(() => {
      let mockTeamBirthdayEmploye = statItems.find(x => x.Code == AeInformationBarItemType.TeamBirthdays);
      let birthdayStatItem = component.overviewList.find(x => x.Code == AeInformationBarItemType.TeamBirthdays);
      let employeeName = component.getName(birthdayStatItem.Data);
      expect(mockTeamBirthdayEmploye.Data).toContain(employeeName);
    }));

    it('should team birthday component record contain birthday date of employee', fakeAsync(() => {
      let mockTeamBirthdayEmploye = statItems.find(x => x.Code == AeInformationBarItemType.TeamBirthdays);
      let birthdayStatItem = component.overviewList.find(x => x.Code == AeInformationBarItemType.TeamBirthdays);
      let position = birthdayStatItem.Data.indexOf("(") + 1;
      let birthdayDate = birthdayStatItem.Data.slice(position, birthdayStatItem.Data.lastIndexOf(")"));
      expect(birthdayStatItem.Data).toContain(birthdayDate);
    }))

    it('employee birthday record should not be displayed if team birthdays count is 0', fakeAsync(() => {
      let overViewList = MockStoreProviderFactory.getAdditionalTodaysOverviewDataWithOutInfoBarItem(AeInformationBarItemType.TeamBirthdays);
      const action = new TodaysOverviewLoadCompleteAction(overViewList);
      store.dispatch(action);
      fixture.detectChanges();
      tick(300);
      let element = fixture.nativeElement;
      expect(element.querySelector('.weekTeamBirthdays') === null).toBe(true);
    }));
  });

  describe('Work Anniversary', async () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      statItems = MockStoreProviderFactory.getAdditioanlTodaysOverviewData();
      const action = new TodaysOverviewLoadCompleteAction(statItems);
      store.dispatch(action);
      // component.todaysOverview$.subscribe((items) => {
      //   todaysOverItems = items;
      // });
      fixture.detectChanges();
    })
    it('should employee work anniversary record contain company name of employee', fakeAsync(() => {
      let mockWorkAnnivarsaryEmployee = statItems.find(x => x.Code == AeInformationBarItemType.TeamWorkAnniversary);
      let workAnniversaryItem = component.overviewList.find(x => x.Code == AeInformationBarItemType.TeamWorkAnniversary);
      let position = workAnniversaryItem.Data.indexOf("with") + 4;
      let companyName = workAnniversaryItem.Data.slice(position, workAnniversaryItem.Data.lastIndexOf("on"));
      expect(mockWorkAnnivarsaryEmployee.Data).toContain(companyName);
    }))

    it('should employee work anniversary record contain work startdate of employee', fakeAsync(() => {
      let mockWorkAnnivarsaryEmployee = statItems.find(x => x.Code == AeInformationBarItemType.TeamWorkAnniversary);
      let workAnniversaryItem = component.overviewList.find(x => x.Code == AeInformationBarItemType.TeamWorkAnniversary);
      let position = workAnniversaryItem.Data.indexOf("on") + 2;
      let startDate = workAnniversaryItem.Data.slice(position, workAnniversaryItem.Data.length);
      expect(mockWorkAnnivarsaryEmployee.Data).toContain(startDate);
    }))

    it('employee work anniversary record should be clickable', fakeAsync(() => {
      spyOn(component, 'onEmployeeClick');
      let element = fixture.debugElement.query(By.css('#userTodaysOverViewId_employeeAnniversary')).nativeElement;
      element.click();
      tick(100);
      expect(component.onEmployeeClick).toHaveBeenCalled();
    }));

    it('should navigate to employee birthday details tab', fakeAsync(() => {
      let workAnnavarsaryItem = component.overviewList.find(x => x.Code == AeInformationBarItemType.TeamWorkAnniversary);
      let id = workAnnavarsaryItem.Id;
      let url: string = "employee/edit/" + id + '/job';
      routerMock.url = url;
      component.onEmployeeClick(id);
      tick(200);
      expect(navigateSpy).toHaveBeenCalledWith([url]);
    }));
  });

  describe('Overdue risk assessments', async () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      statItems = MockStoreProviderFactory.getAdditioanlTodaysOverviewData();
      const action = new TodaysOverviewLoadCompleteAction(statItems);
      store.dispatch(action);
      // component.todaysOverview$.subscribe((items) => {
      //   todaysOverItems = items;
      // });
      fixture.detectChanges();
    })

    it('should display risk assessment count in the record', fakeAsync(() => {
      let riskAssessmentItem = component.overviewList.find(x => x.Code == AeInformationBarItemType.RiskAssessmentsDueThisWeek);
      expect(riskAssessmentItem.Data).toContain(riskAssessmentItem.Count);
    }));

    it('should not display when the over due risk assessment count is zero', fakeAsync(() => {
      let overViewList = MockStoreProviderFactory.getAdditionalTodaysOverviewDataWithOutInfoBarItem(AeInformationBarItemType.RiskAssessmentsDueThisWeek);
      const action = new TodaysOverviewLoadCompleteAction(overViewList);
      store.dispatch(action);
      fixture.detectChanges();
      tick(300);
      let element = fixture.nativeElement;
      expect(element.querySelector('#userTodaysOverViewId_RAsdue') === null).toBe(true);
    }));

    it('risk assessmnet item should be clickable', fakeAsync(() => {
      spyOn(component, 'linkToRiskAssessments');
      let element = fixture.debugElement.query(By.css('#userTodaysOverViewId_RAsdue')).nativeElement;
      element.click();
      tick(100);
      expect(component.linkToRiskAssessments).toHaveBeenCalled();
    }));

    it('should navigate to risk assessment list page overdue tab', fakeAsync(() => {
      let riskAssessmentItem = component.overviewList.find(x => x.Code == AeInformationBarItemType.RiskAssessmentsDueThisWeek);
      let url: string = "risk-assessment/overdue";
      routerMock.url = url;
      component.linkToRiskAssessments();
      tick(200);
      expect(navigateSpy).toHaveBeenCalledWith([url]);
    }));
  });

  describe('Incidents component', async () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      statItems = MockStoreProviderFactory.getAdditioanlTodaysOverviewData();
      const action = new TodaysOverviewLoadCompleteAction(statItems);
      store.dispatch(action);
      component.todaysOverview$.subscribe((items) => {
        todaysOverItems = items;
      });
      fixture.detectChanges();
    })
    it('should display pending incidents count in the record', fakeAsync(() => {
      let accidentsPreviousWeek = component.overviewList.find(x => x.Code == AeInformationBarItemType.AccidentsPreviousWeek);
      expect(accidentsPreviousWeek.Data).toContain(accidentsPreviousWeek.Count);
    }));

    it('should not display when the pending incidents count is zero', fakeAsync(() => {
      let overViewList = MockStoreProviderFactory.getAdditionalTodaysOverviewDataWithOutInfoBarItem(AeInformationBarItemType.AccidentsPreviousWeek);
      const action = new TodaysOverviewLoadCompleteAction(overViewList);
      store.dispatch(action);
      fixture.detectChanges();
      tick(300);
      let element = fixture.nativeElement;
      expect(element.querySelector('.accidentsWeek') === null).toBe(true);
    }));
  });

  describe('checklists component', async () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      statItems = MockStoreProviderFactory.getAdditioanlTodaysOverviewData();
      const action = new TodaysOverviewLoadCompleteAction(statItems);
      store.dispatch(action);
      // component.todaysOverview$.subscribe((items) => {
      //   todaysOverItems = items;
      // });
      fixture.detectChanges();
    })

    it('should display current week scheduled checklists count in the record', fakeAsync(() => {
      let checklistsDueThisWeek = component.overviewList.find(x => x.Code == AeInformationBarItemType.ChecklistDueThisWeek);
      expect(checklistsDueThisWeek.Data).toContain(checklistsDueThisWeek.Count);
    }));

    it('should not display the record when the current week scheduled checklists count is zero', fakeAsync(() => {
      let overViewList = MockStoreProviderFactory.getAdditionalTodaysOverviewDataWithOutInfoBarItem(AeInformationBarItemType.ChecklistDueThisWeek);
      const action = new TodaysOverviewLoadCompleteAction(overViewList);
      store.dispatch(action);
      fixture.detectChanges();
      tick(300);
      let element = fixture.nativeElement;
      expect(element.querySelector('#userTodaysOverViewId_checklistsdue') === null).toBe(true);
    }));

    it('scheduled checklist item should be clickable', fakeAsync(() => {
      spyOn(component, 'linkToChecklists');
      let element = fixture.debugElement.query(By.css('#userTodaysOverViewId_checklistsdue')).nativeElement;
      element.click();
      tick(100);
      expect(component.linkToChecklists).toHaveBeenCalled();
    }));

    it('should navigate to checklists list page', fakeAsync(() => {
      let url: string = "checklist/company-checklists";
      routerMock.url = url;
      component.linkToChecklists();
      tick(200);
      expect(navigateSpy).toHaveBeenCalledWith([url]);
    }));
  });

  describe('Tasks component', async () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      statItems = MockStoreProviderFactory.getAdditioanlTodaysOverviewData();
      const action = new TodaysOverviewLoadCompleteAction(statItems);
      store.dispatch(action);
      // component.todaysOverview$.subscribe((items) => {
      //   todaysOverItems = items;
      // });
      fixture.detectChanges();
    })

    it('should display today tasks due', fakeAsync(() => {
      let tasksDueThisWeek = component.overviewList.find(x => x.Code == AeInformationBarItemType.TasksdueToday);
      let mokeupTaksDueThisWeek = component.overviewList.find(x => x.Code == AeInformationBarItemType.TasksdueToday);
      expect(mokeupTaksDueThisWeek.Count).toEqual(tasksDueThisWeek.Count);
    }));

    it('should not display the record when the today tasks count is zero', fakeAsync(() => {
      let overViewList = MockStoreProviderFactory.getAdditionalTodaysOverviewDataWithOutInfoBarItem(AeInformationBarItemType.TasksdueToday);
      const action = new TodaysOverviewLoadCompleteAction(overViewList);
      store.dispatch(action);
      fixture.detectChanges();
      tick(300);
      let element = fixture.nativeElement;
      expect(element.querySelector('#userTodaysOverViewId_tasksduel') === null).toBe(true);
    }));

    it('scheduled checklist item should be clickable', fakeAsync(() => {
      spyOn(component, 'onDueTaskClick');
      let element = fixture.debugElement.query(By.css('#userTodaysOverViewId_tasksduelink')).nativeElement;
      element.click();
      tick(100);
      expect(component.onDueTaskClick).toHaveBeenCalled();
    }));

    it('should navigate to taks list page', fakeAsync(() => {
      let url: string = "task/view/mine";
      routerMock.url = url;
      component.onDueTaskClick('e');
      tick(200);
      expect(navigateSpy).toHaveBeenCalledWith([url], { queryParams: { due: AeInformationBarItemType.DueTodayTask.toString() } });
    }));
  });


  describe('Joiners component', async () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      statItems = MockStoreProviderFactory.getAdditioanlTodaysOverviewData();
      const action = new TodaysOverviewLoadCompleteAction(statItems);
      store.dispatch(action);
      // component.todaysOverview$.subscribe((items) => {
      //   todaysOverItems = items;
      // });
      fixture.detectChanges();
    })

    it('should display this week Joiners', fakeAsync(() => {
      let joinersThisWeek = component.overviewList.find(x => x.Code == AeInformationBarItemType.Joiners);
      let mokeupJoinersThisWeek = component.overviewList.find(x => x.Code == AeInformationBarItemType.Joiners);
      expect(mokeupJoinersThisWeek.Data).toEqual(joinersThisWeek.Data);
    }));

  });

  describe('Document component', async () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      statItems = MockStoreProviderFactory.getAdditioanlTodaysOverviewData();
      const action = new TodaysOverviewLoadCompleteAction(statItems);
      store.dispatch(action);
      // component.todaysOverview$.subscribe((items) => {
      //   todaysOverItems = items;
      // });
      fixture.detectChanges();
    })

    it('Documents Reviews count', fakeAsync(() => {
      let joinersThisWeek = component.overviewList.find(x => x.Code == AeInformationBarItemType.Documents);
      let mokeupJoinersThisWeek = component.overviewList.find(x => x.Code == AeInformationBarItemType.Documents);
      expect(mokeupJoinersThisWeek.Count).toEqual(joinersThisWeek.Count);
    }));

    it('should not display the record when the Documents count is zero', fakeAsync(() => {
      let overViewList = MockStoreProviderFactory.getAdditionalTodaysOverviewDataWithOutInfoBarItem(AeInformationBarItemType.Documents);
      const action = new TodaysOverviewLoadCompleteAction(overViewList);
      store.dispatch(action);
      fixture.detectChanges();
      tick(300);
      let element = fixture.nativeElement;
      expect(element.querySelector('#userTodaysOverViewId_distdoclink') === null).toBe(true);
    }));

    it('Documents should be clickable', fakeAsync(() => {
      spyOn(component, 'onDocumentClick');
      let element = fixture.debugElement.query(By.css('#userTodaysOverViewId_distdoclink')).nativeElement;
      element.click();
      tick(100);
      expect(component.onDocumentClick).toHaveBeenCalled();
    }));

    it('should navigate to Documents Review page', fakeAsync(() => {
      let url: string = "/document/shared/distributed";
      routerMock.url = url;
      component.onDocumentClick('e');
      fixture.detectChanges();
      tick(200);
      expect(navigateSpy).toHaveBeenCalled();
    }));

  });
});
