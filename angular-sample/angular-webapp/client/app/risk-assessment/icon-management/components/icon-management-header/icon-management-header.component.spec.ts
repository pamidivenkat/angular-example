import { IconAddUpdateComponent } from '../icon-add-update/icon-add-update.component';
import { IconManagementViewComponent } from '../icon-management-view/icon-management-view.component';
import { IconType } from '../../models/icon-type.enum';
import { Subscription } from 'rxjs/Rx';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { Router } from '@angular/router';
import { BreadcrumbServiceStub } from '../../../../shared/testing/mocks/breadcrumb-service-mock';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { LocalizationConfigStub } from '../../../../shared/testing/mocks/localization-config-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { LocalizationConfig } from '../../../../shared/localization-config';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { LocaleService, TranslationService, InjectorRef, LocalizationModule } from 'angular-l10n';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { IconManagementHeaderComponent } from './icon-management-header.component';
import { IconManagementListComponent } from '../../../../risk-assessment/icon-management/components/icon-management-list/icon-management-list.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('Icon management header component', () => {
  let component: IconManagementHeaderComponent;
  let fixture: ComponentFixture<IconManagementHeaderComponent>;
  let breadcrumbService: BreadcrumbService;
  let notificationSub: Subscription;
  let notificationMessage: { type: IconType, action: string };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IconManagementHeaderComponent
        , IconManagementListComponent
        , IconManagementViewComponent
        , IconAddUpdateComponent
      ],
      imports: [
        AtlasElementsModule
        , LocalizationModule
        , ReactiveFormsModule
      ],
      providers: [
        InjectorRef
        , BreadcrumbService
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconManagementHeaderComponent);
    component = fixture.componentInstance;
    breadcrumbService = fixture.debugElement.injector.get(BreadcrumbService);
    const bcItem: IBreadcrumb = {
      isGroupRoot: true,
      group: BreadcrumbGroup.IconManagement,
      label: 'Icon management',
      url: '/icon-management'
    };
    breadcrumbService.add(bcItem);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('breadcrumb should be displayed', fakeAsync(() => {
    tick();
    let breadCrumbAnchors = fixture.debugElement.queryAll(By.css('.breadcrumbs a')) as DebugElement[];
    let parentBreadcrumbItem = breadCrumbAnchors[0].nativeElement.text;
    let currentBreadcrumbItem = breadCrumbAnchors[1].nativeElement.text;
    expect(breadCrumbAnchors.length).toEqual(2);
    expect(parentBreadcrumbItem).toContain('Home');
    expect(currentBreadcrumbItem).toContain('Icon management');
  }));

  it('Banner title should be display', fakeAsync(() => {
    let element = fixture.debugElement.query(By.css('.banner__title')).nativeElement;
    expect(element.textContent).toContain('ICON_MANAGEMENT.ICONMANAGEMENT');
  }));

  it('Notification message should display', fakeAsync(() => {
    tick();
    let element = fixture.debugElement.query(By.css('.icon-with-text__copy')).nativeElement;
    expect(element.textContent).toContain('ICON_MANAGEMENT.NOTIFICATION');
  }));

  it('Split button should display', fakeAsync(() => {
    tick();
    let element = fixture.debugElement.queryAll(By.css(".nav--dropdown a")) as DebugElement[];
    let addButtonText = element[0].nativeElement.text;
    expect(addButtonText).toContain('ICON_MANAGEMENT.ADD');
  }));

  it('Split button should clickable', fakeAsync(() => {
    spyOn(component, 'onSplitBtnClick');
    let element = fixture.debugElement.query(By.css('.button--cta')).nativeElement;
    element.click();
    fixture.detectChanges();
    tick();
    expect(component.onSplitBtnClick).toHaveBeenCalled();
  }));

  it('Hazards,Controls button should display on Split button click', fakeAsync(() => {
    let element = fixture.debugElement.query(By.css('.button--cta')).nativeElement;
    element.click();
    fixture.detectChanges();
    tick();
    let anchorElements = fixture.debugElement.queryAll(By.css('.list--dropdowns a')) as DebugElement[];
    let hazardElementText = anchorElements[0].nativeElement.text;
    let controlElementText = anchorElements[1].nativeElement.text;
    expect(anchorElements.length).toEqual(2);
    expect(hazardElementText).toContain('Hazard');
    expect(controlElementText).toContain('Control');
  }));
  describe('When clicked on "Add Icon" should emit notification to container', () => {
    beforeEach(() => {
      component.onAddIcon.subscribe(val => {
        notificationMessage = val;
      });
    });
    it('When clicked on "Hazard" button should emit add hazard icon notification to container', fakeAsync(() => {
      let element = fixture.debugElement.query(By.css('.button--cta')).nativeElement;
      element.click();
      fixture.detectChanges();
      tick();
      let anchorElements = fixture.debugElement.queryAll(By.css('.list--dropdowns a')) as DebugElement[];
      anchorElements[0].nativeElement.click();
      fixture.detectChanges();
      tick(100);
      expect(notificationMessage).toEqual({ type: IconType.Hazard, action: 'Add' });
    }));
    it('When clicked on "Control" button should emit add icon icon notification to container', fakeAsync(() => {
      let element = fixture.debugElement.query(By.css('.button--cta')).nativeElement;
      element.click();
      fixture.detectChanges();
      tick();
      let anchorElements = fixture.debugElement.queryAll(By.css('.list--dropdowns a')) as DebugElement[];
      anchorElements[1].nativeElement.click();
      fixture.detectChanges();
      tick(100);
      expect(notificationMessage).toEqual({ type: IconType.Control, action: 'Add' });
    }));
  });

});