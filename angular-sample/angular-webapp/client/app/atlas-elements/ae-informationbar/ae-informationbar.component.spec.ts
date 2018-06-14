import { AeAnchorComponent } from '../ae-anchor/ae-anchor.component';
import { AeIconComponent } from '../ae-icon/ae-icon.component';
import { AeStatisticComponent } from '../ae-statistic/ae-statistic.component';
import { AeIconSize } from '../common/ae-icon-size.enum';
import { AeInformationBarItemType } from '../common/ae-informationbar-itemtype.enum';
import { AeInformationBarItem } from '../common/models/ae-informationbar-item';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AeInformationbarComponent } from './ae-informationbar.component';
import * as Immutable from 'immutable';
import { LocaleService, TranslationService, InjectorRef } from 'angular-l10n';
import { Http, ResponseOptions, Response } from '@angular/http';
import { LocalizationConfig } from './../../shared/localization-config';
import { LocaleServiceStub } from './../../shared/testing/mocks/locale-service-stub';
import { TranslationServiceStub } from './../../shared/testing/mocks/translation-service-stub';
import { LocalizationConfigStub } from './../../shared/testing/mocks/localization-config-stub';
import { isNullOrUndefined } from 'util';
import { StringHelper } from './../../shared/helpers/string-helper';
import { extractInformationBarItems } from './../../shared/helpers/extract-helpers';

describe('ae-informationbar component', () => {
  let component: AeInformationbarComponent;
  let fixture: ComponentFixture<AeInformationbarComponent>;
  let statComponentId: string;

  // register all needed dependencies
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AeInformationbarComponent, AeStatisticComponent, AeIconComponent, AeAnchorComponent],
      providers: [
        InjectorRef
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeInformationbarComponent);
    component = fixture.componentInstance;
    statComponentId = 'informationbar';
    component.id = statComponentId;
    component.name = statComponentId;
  });
  describe('Launch component', () => {
    beforeEach(() => {
      component.items = Immutable.List<AeInformationBarItem>([
        new AeInformationBarItem(AeInformationBarItemType.DocumentsAwaiting, 21, 'DocumentsAwaiting', true, 'Documents awaiting tool tip', null, null, true)
        , new AeInformationBarItem(AeInformationBarItemType.TasksToComplete, 19, 'TasksToComplete', false, 'Tasks to complete tool tip', null, null, false)
        , new AeInformationBarItem(AeInformationBarItemType.HolidaysAvailable, 5, 'HolidaysAvailable', false, 'Holidays available tool tip', null, null, true)
        , new AeInformationBarItem(AeInformationBarItemType.TrainingCourses, 0, 'TrainingCourses', false, 'Training courses tool tip', null, null, true)
        , new AeInformationBarItem(AeInformationBarItemType.HolidayCountdown, 50, 'HolidayCountdown', true, 'Holiday countdown tool tip', null, null, false)
        , new AeInformationBarItem(AeInformationBarItemType.TeamHolidays, 1245, 'TeamHolidays', false, 'Team holidays tool tip', null, null, true)
      ]);

      fixture.detectChanges();
    });
    it('Information bar component must be launched', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Information bar component must have agreed html structure according to the design system', () => {
    beforeEach(() => {
      component.items = Immutable.List<AeInformationBarItem>([
        new AeInformationBarItem(AeInformationBarItemType.DocumentsAwaiting, 21, 'DocumentsAwaiting', true, 'Documents awaiting tool tip', null, null, true)
        , new AeInformationBarItem(AeInformationBarItemType.TasksToComplete, 19, 'TasksToComplete', false, 'Tasks to complete tool tip', null, null, false)
        , new AeInformationBarItem(AeInformationBarItemType.HolidaysAvailable, 5, 'HolidaysAvailable', false, 'Holidays available tool tip', null, null, true)
        , new AeInformationBarItem(AeInformationBarItemType.TrainingCourses, 0, 'TrainingCourses', false, 'Training courses tool tip', null, null, true)
        , new AeInformationBarItem(AeInformationBarItemType.HolidayCountdown, 50, 'HolidayCountdown', true, 'Holiday countdown tool tip', null, null, false)
        , new AeInformationBarItem(AeInformationBarItemType.TeamHolidays, 1245, 'TeamHolidays', false, 'Team holidays tool tip', null, null, true)
      ]);

      fixture.detectChanges();
    });
    it('Information bar component must have a "section" tag with proper Id', () => {
      let inputEl: HTMLElement = fixture.debugElement.query(By.css('section')).nativeElement;
      expect(inputEl).toBeDefined();
      let sectionId = inputEl.id;
      expect(sectionId).toEqual(statComponentId + '_Sec');
    });

    it('Information bar component must have a "section" tag with proper "statistics-bar" css class', () => {
      let inputEl: HTMLElement = fixture.debugElement.query(By.css('section')).nativeElement;
      let hasClass = inputEl.classList.contains('statistics-bar');
      expect(hasClass).toBeTruthy();
    });

    it('Information bar component must have a div Tag with proper Id with in "statistics-bar" section', () => {
      let inputEl: HTMLElement = fixture.debugElement.query(By.css('section.statistics-bar'))
        .query(By.css('div#' + statComponentId + '_div')).nativeElement;
      expect(inputEl).toBeDefined();
    });

    it('Information bar component must have a div Tag with proper "statistics-bar__inner" with in "statistics-bar" section', () => {
      let inputEl: HTMLElement = fixture.debugElement.query(By.css('section.statistics-bar'))
        .query(By.css('div#' + statComponentId + '_div')).nativeElement;
      let hasClass = inputEl.classList.contains('statistics-bar__inner');
      expect(hasClass).toBeTruthy();
    });

    it('Each statistic wrapper element must have "statistics-bar__statistic" css class and proper id', () => {
      let statisticItemCount = fixture.debugElement.query(By.css('section.statistics-bar'))
        .query(By.css('div#' + statComponentId + '_div')).queryAll(By.css('div.statistics-bar__statistic')).length;
      expect(statisticItemCount).toBe(component.items.count());
      fixture.debugElement.query(By.css('section.statistics-bar'))
        .query(By.css('div#' + statComponentId + '_div')).queryAll(By.css('div.statistics-bar__statistic'))
        .forEach((item, i) => {
          expect((<HTMLElement>item.nativeElement).id).toBe(statComponentId + '_div_' + i);
        });
    });
  });

  describe('Information bar component must display stats according to the supplied data', () => {
    beforeEach(() => {
      component.items = Immutable.List<AeInformationBarItem>([
        new AeInformationBarItem(AeInformationBarItemType.DocumentsAwaiting, 21, 'DocumentsAwaiting', true, 'Documents awaiting tool tip', null, null, true)
        , new AeInformationBarItem(AeInformationBarItemType.TasksToComplete, 19, 'TasksToComplete', false, 'Tasks to complete tool tip', null, null, false)
        , new AeInformationBarItem(AeInformationBarItemType.HolidaysAvailable, 5, 'HolidaysAvailable', false, 'Holidays available tool tip', null, null, true)
        , new AeInformationBarItem(AeInformationBarItemType.TrainingCourses, 0, 'TrainingCourses', false, 'Training courses tool tip', null, null, true)
        , new AeInformationBarItem(AeInformationBarItemType.HolidayCountdown, 50, 'HolidayCountdown', true, 'Holiday countdown tool tip', null, null, false)
        , new AeInformationBarItem(AeInformationBarItemType.TeamHolidays, 1245, 'TeamHolidays', false, 'Team holidays tool tip', null, null, true)
      ]);

      fixture.detectChanges();
    });
    it('Information bar component must display same number of ae-statistic elements as that of supplied statistic bar items count', () => {
      let statCount = fixture.debugElement.query(By.css('div.statistics-bar__inner')).queryAll(By.css('ae-statistic')).length;
      expect(statCount).toEqual(component.items.count());
    });

    it('Verify whether "noaction" css class must not be available for any non-clickable ae statistic items', () => {
      let clickableItemCount = fixture.debugElement.queryAll(By.css('div.statistics-bar__statistic.noaction')).length;
      expect(clickableItemCount).toBe(component.items.filter(c => c.Clickable == false).count());
    });

    it('Verify whether "noaction" css class must be available for all clickable ae statistic items', () => {
      let nonclickableItemCount = fixture.debugElement.queryAll(By.css('div.statistics-bar__statistic'))
        .filter(c => !StringHelper.coerceBooleanProperty(c.classes['noaction'])).length;
      expect(nonclickableItemCount).toBe(component.items.filter(c => c.Clickable == true).count());
    });

    it('Verify whether user is able to click on clickable ae statistic item or not', async () => {
      let emitSpy = spyOn(component.aeClick, 'emit').and.callThrough();
      let clickSpy = spyOn(component, 'onClick').and.callThrough();
      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(clickSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalled();
      });
    });

    it('User must not able to click on non-clickable ae-statistic items', async () => {
      let emitSpy = spyOn(component.aeClick, 'emit').and.callThrough();
      let clickSpy = spyOn(component, 'onClick').and.callThrough();
      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[1]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(clickSpy).toHaveBeenCalled();
        expect(emitSpy).not.toHaveBeenCalled();
      });
    });

    it('Verify When user clicks on any statistic item, appropriate statistic item is emitted or not', async () => {
      let emitSpy = spyOn(component.aeClick, 'emit').and.callThrough();
      let clickSpy = spyOn(component, 'onClick').and.callThrough();
      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(clickSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalledWith(component.items.get(0));

        expect(emitSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith(component.items.get(0));
      });
    });
  });

  describe('Each statistic item must have design according to the design system and associated model ', () => {
    beforeEach(() => {
      component.items = Immutable.List<AeInformationBarItem>([
        new AeInformationBarItem(AeInformationBarItemType.DocumentsAwaiting, 21, 'DocumentsAwaiting', true, 'Documents awaiting tool tip', null, null, true)
        , new AeInformationBarItem(AeInformationBarItemType.TasksToComplete, 19, 'TasksToComplete', false, 'Tasks to complete tool tip', null, null, false)
        , new AeInformationBarItem(AeInformationBarItemType.HolidaysAvailable, 5, 'HolidaysAvailable', false, 'Holidays available tool tip', null, null, true)
        , new AeInformationBarItem(AeInformationBarItemType.TrainingCourses, 0, 'TrainingCourses', false, 'Training courses tool tip', null, null, true)
        , new AeInformationBarItem(AeInformationBarItemType.HolidayCountdown, 50, 'HolidayCountdown', true, 'Holiday countdown tool tip', null, null, false)
        , new AeInformationBarItem(AeInformationBarItemType.TeamHolidays, 1245, 'TeamHolidays', false, 'Team holidays tool tip', null, null, true)
      ]);

      fixture.detectChanges();
    });
    it(`Verify whether no. of items with requirenotification property true must match with 
    no. of ae-stastic items with notification icons`, () => {
        let itemsWithNotification = 0;
        fixture.debugElement.queryAll(By.css('ae-statistic')).forEach((statEle) => {
          let notificationItem = statEle.query(By.css('.statistic__icon')).query(By.css('ae-icon'))
            .query(By.css('.icon--has-notification'));
          if (!isNullOrUndefined(notificationItem)) {
            itemsWithNotification++;
          }
        });
        expect(itemsWithNotification).toBe(component.items.filter(c => c.RequireNotification == true).count());
      });

    it(`Verify whether supplied icon is displaying in statistic item or not`, () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
      expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain(component.items.get(0).IconName);

      iconElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[4].query(By.css('.statistic'))
        .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
      expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain(component.items.get(4).IconName);
    });

    it(`Verify whether supplied number/value is displaying in statistic item or not`, () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
      expect(parseFloat(iconElement.innerText.trim())).toEqual(parseFloat(component.items.get(0).Count.toString()));

      iconElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[4].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
      expect(parseFloat(iconElement.innerText.trim())).toEqual(parseFloat(component.items.get(4).Count.toString()));
    });

    it(`Verify whether supplied name is displaying in statistic item or not`, () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
      expect(iconElement.innerText.trim()).toBe(component.items.get(0).Title);

      iconElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[3].query(By.css('.statistic'))
        .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
      expect(iconElement.innerText.trim()).toBe(component.items.get(3).Title);
    });

    it(`Verify whether supplied tooltip is displaying for statistic item or not`, () => {
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe(component.items.get(0).ToolTip);

      iconElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[2].query(By.css('.statistic')).nativeElement;
      expect(iconElement.getAttribute('title').trim()).toBe(component.items.get(2).ToolTip);
    });
  });

  describe('In information bar component, stats must display based on "Priority"', () => {
    it('Verify whether stats are displaying in the order of priority or not', () => {
      let body = JSON.parse('[{"Code":2,"Priority":7,"Name":"Team holidays","IconName":null,"Count":0.0,"ContextData":null},{"Code":22,"Priority":3,"Name":"My team tasks","IconName":"icon-tasks-team","Count":4455.0,"ContextData":null},{"Code":1,"Priority":6,"Name":"Holidays available","IconName":"icon-holidays-absence","Count":0.0,"ContextData":[{"Key":"HolidayUnitType","Value":"Days"}]},{"Code":26,"Priority":7,"Name":"Outstanding training","IconName":"icon-education","Count":282.0,"ContextData":null},{"Code":5,"Priority":10,"Name":"Training courses","IconName":"icon-education","Count":7.0,"ContextData":null},{"Code":21,"Priority":2,"Name":"Manage team","IconName":"icon-people","Count":170.0,"ContextData":null},{"Code":4,"Priority":9,"Name":"Tasks to complete","IconName":"icon-tasks-to-complete","Count":496.0,"ContextData":null},{"Code":6,"Priority":5,"Name":"Holiday countdown","IconName":"icon-case","Count":0.0,"ContextData":null},{"Code":3,"Priority":8,"Name":"Documents to action","IconName":"icon-to-review","Count":24.0,"ContextData":null},{"Code":25,"Priority":6,"Name":"Risk assessments","IconName":"icon-alert-triangle","Count":20.0,"ContextData":null},{"Code":23,"Priority":4,"Name":"Employees absent today","IconName":"icon-steth","Count":0.0,"ContextData":null},{"Code":20,"Priority":1,"Name":"Holidays requested","IconName":"icon-holidays-absence","Count":7.0,"ContextData":null}]');
      let options = new ResponseOptions({ body: body });
      let response = new Response(options);
      component.items = Immutable.List(extractInformationBarItems(response));
      fixture.detectChanges();

      component.items.forEach((item, i) => {
        let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[i].query(By.css('.statistic'))
          .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
        expect(iconElement.innerText.trim()).toBe(item.Title);
      });
    });

    it('Verify whether default icon is displaying in stat, when there is no associated icon', () => {
      let body = JSON.parse('[{"Code":2,"Priority":7,"Name":"Team holidays","IconName":null,"Count":0.0,"ContextData":null},{"Code":22,"Priority":3,"Name":"My team tasks","IconName":"icon-tasks-team","Count":4455.0,"ContextData":null},{"Code":1,"Priority":6,"Name":"Holidays available","IconName":"icon-holidays-absence","Count":0.0,"ContextData":[{"Key":"HolidayUnitType","Value":"Days"}]},{"Code":26,"Priority":7,"Name":"Outstanding training","IconName":"icon-education","Count":282.0,"ContextData":null},{"Code":5,"Priority":10,"Name":"Training courses","IconName":"icon-education","Count":7.0,"ContextData":null},{"Code":21,"Priority":2,"Name":"Manage team","IconName":"icon-people","Count":170.0,"ContextData":null},{"Code":4,"Priority":9,"Name":"Tasks to complete","IconName":"icon-tasks-to-complete","Count":496.0,"ContextData":null},{"Code":6,"Priority":5,"Name":"Holiday countdown","IconName":"icon-case","Count":0.0,"ContextData":null},{"Code":3,"Priority":8,"Name":"Documents to action","IconName":"icon-to-review","Count":24.0,"ContextData":null},{"Code":25,"Priority":6,"Name":"Risk assessments","IconName":"icon-alert-triangle","Count":20.0,"ContextData":null},{"Code":23,"Priority":4,"Name":"Employees absent today","IconName":"icon-steth","Count":0.0,"ContextData":null},{"Code":20,"Priority":1,"Name":"Holidays requested","IconName":"icon-holidays-absence","Count":7.0,"ContextData":null}]');
      let options = new ResponseOptions({ body: body });
      let response = new Response(options);
      component.items = Immutable.List(extractInformationBarItems(response));
      fixture.detectChanges();
      let index = Array.from(body).findIndex(c => c['Name'] == 'Team holidays');
      expect(Array.from(body)[index]['IconName']).toBeNull();

      index = component.items.findIndex(c => c.Title == 'Team holidays');
      let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[index].query(By.css('.statistic'))
        .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
      expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-people');
    });
  });
});
