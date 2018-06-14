/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';

import { AeStatisticComponent } from './ae-statistic.component';
import { InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { LocalizationConfig } from './../../shared/localization-config';
import { LocaleServiceStub } from './../../shared/testing/mocks/locale-service-stub';
import { TranslationServiceStub } from './../../shared/testing/mocks/translation-service-stub';
import { AeIconComponent } from './../../atlas-elements/ae-icon/ae-icon.component';
import { LocalizationConfigStub } from './../../shared/testing/mocks/localization-config-stub';

describe('Ae-Statistic Component', () => {
  let component: AeStatisticComponent;
  let fixture: ComponentFixture<AeStatisticComponent>;
  let statComponentId: string;

// register all needed dependencies
beforeEach(async(() => {
  TestBed.configureTestingModule({
    declarations: [AeStatisticComponent, AeIconComponent],
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
  fixture = TestBed.createComponent(AeStatisticComponent);
  component = fixture.componentInstance;
  statComponentId = 'informationbar';
  component.id = statComponentId;
  component.name = statComponentId;
  // component.
  // component.items = Immutable.List<AeInformationBarItem>([
  //   new AeInformationBarItem(AeInformationBarItemType.DocumentsAwaiting, 21, 'DocumentsAwaiting', true, 'Documents awaiting tool tip', null, null, true)
  //   , new AeInformationBarItem(AeInformationBarItemType.TasksToComplete, 19, 'TasksToComplete', false, 'Tasks to complete tool tip', null, null, false)
  //   , new AeInformationBarItem(AeInformationBarItemType.HolidaysAvailable, 5, 'HolidaysAvailable', false, 'Holidays available tool tip', null, null, true)
  //   , new AeInformationBarItem(AeInformationBarItemType.TrainingCourses, 0, 'TrainingCourses', false, 'Training courses tool tip', null, null, true)
  //   , new AeInformationBarItem(AeInformationBarItemType.HolidayCountdown, 50, 'HolidayCountdown', true, 'Holiday countdown tool tip', null, null, false)
  //   , new AeInformationBarItem(AeInformationBarItemType.TeamHolidays, 1245, 'TeamHolidays', false, 'Team holidays tool tip', null, null, true)
  // ]);

  fixture.detectChanges();
});

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
