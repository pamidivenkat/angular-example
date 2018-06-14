import { IconManagementViewComponent } from '../../components/icon-management-view/icon-management-view.component';
import { StoreModule } from '@ngrx/store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IconAddUpdateComponent } from '../../components/icon-add-update/icon-add-update.component';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { IconManagementListComponent } from '../../components/icon-management-list/icon-management-list.component';
import { MessengerService } from '../../../../shared/services/messenger.service';
import { routes } from '../../../icon-management/icon-management.routes';
import { RouterOutletMapStub } from '../../../../shared/testing/mocks/router-outlet-stub';
import { ActivatedRouteStub } from '../../../../shared/testing/mocks/activated-route-stub';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Location, LocationStrategy } from '@angular/common';
import { LocalizationConfig } from '../../../../shared/localization-config';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { Router, RouterModule, ActivatedRoute, RouterOutletMap } from '@angular/router';
import { LocalizationConfigStub } from '../../../../shared/testing/mocks/localization-config-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { IconManagementHeaderComponent } from '../../components/icon-management-header/icon-management-header.component';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { IconManagementContainerComponent } from './icon-management-container.component';
import { RouterTestingModule } from '@angular/router/testing';
import { reducer } from '../../../../shared/reducers/index';
describe('Icon management container component', () => {
  let component: IconManagementContainerComponent;
  let fixture: ComponentFixture<IconManagementContainerComponent>;
  let breadcrumbService: BreadcrumbService;
  let IconManagementTabs: any;
  let routerMock: any;
  let location: Location;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule
        , ReactiveFormsModule
        , AtlasElementsModule
        , LocalizationModule
        , NoopAnimationsModule
        , RouterModule.forChild(routes)
        , RouterTestingModule.withRoutes(routes)
        , StoreModule.provideStore(reducer)
      ],
      declarations: [
        IconManagementHeaderComponent
        , IconManagementContainerComponent
        , IconManagementListComponent
        , IconAddUpdateComponent
        , IconManagementViewComponent
      ],
      providers: [
        InjectorRef
        , BreadcrumbService
        , LocationStrategy
        , MessengerService
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
        , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconManagementContainerComponent);
    component = fixture.componentInstance;
    breadcrumbService = fixture.debugElement.injector.get(BreadcrumbService);
    routerMock = fixture.debugElement.injector.get(Router);
    location = fixture.debugElement.injector.get(Location);
    const breadcrumbItem: IBreadcrumb = {
      isGroupRoot: true,
      group: BreadcrumbGroup.IconManagement,
      label: 'Icon management',
      url: '/icon-management'
    };
    breadcrumbService.add(breadcrumbItem);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('icon management tabs', () => {
    beforeEach(() => {
      let tabStrip: DebugElement = fixture.debugElement.query(By.css("#AeTabStrip"));
      IconManagementTabs = tabStrip.queryAll(By.css('.tabs-nav__item'));
      fixture.detectChanges();
    });

    it('Icon management should have 2 tabs', () => {
      expect(IconManagementTabs.length).toEqual(2);
    });

    it('First tab should be hazards tab', fakeAsync(() => {
      tick();
      let controlTabElement = IconManagementTabs[0].query(By.css('.tabs-no-count'));
      let spansInsidecontrolTabElement = controlTabElement.queryAll(By.css('span'));
      let hazardsTabText = (<HTMLSpanElement>spansInsidecontrolTabElement[0].nativeElement).textContent;
      expect(hazardsTabText).toContain('ICON_MANAGEMENT.HAZARDS');
    }));

    it('Second tab should be controls tab', fakeAsync(() => {
      tick();
      let hazardTabElement = IconManagementTabs[1].query(By.css('.tabs-no-count'));
      let spanTagsInsideHazardTabElement = hazardTabElement.queryAll(By.css('span'));
      let controlsTabText = (<HTMLSpanElement>spanTagsInsideHazardTabElement[0].nativeElement).textContent;
      expect(controlsTabText).toContain('ICON_MANAGEMENT.CONTROLS');
    }));

    it('Hazards tab should navigate to /hazards', fakeAsync(() => {
      spyOn(component, 'getHazardsUrl')
      let hazardsTabAnchorElement = fixture.debugElement.query(By.css('#AeTabStrip_anchor_0')).nativeElement;
      hazardsTabAnchorElement.click();
      fixture.detectChanges()
      tick();
      expect(component.getHazardsUrl).toHaveBeenCalled();
    }));

    it('Controls tab should navigate to /controls', fakeAsync(() => {
      spyOn(component, 'getControlsUrl');
      let controlsTabAnchorElement = fixture.debugElement.query(By.css('#AeTabStrip_anchor_1')).nativeElement;
      controlsTabAnchorElement.click();
      fixture.detectChanges();
      tick();
      expect(component.getControlsUrl).toHaveBeenCalled();
    }));
  });
});