import { LoadSelectedPlantandequipmentCompleteAction } from '../../actions/plantequipment-actions';
import { PlantAndEquipment } from '../../models/plantandequipment';
import { MockStoreProviderFactory } from '../../../../shared/testing/mocks/mock-store-provider-factory';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import { PlantandequipmentService } from '../../services/plantandequipment.service';
import { PlantandequipmentsharedModule } from '../../plantandequipmentshared/plantandequipmentshared.module';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { LocalizationConfigStub } from '../../../../shared/testing/mocks/localization-config-stub';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { ActivatedRouteStub } from '../../../../shared/testing/mocks/activated-route-stub';
import { ClaimsHelperServiceStub } from '../../../../shared/testing/mocks/claims-helper-service-mock';
import { RouteParamsMock } from '../../../../shared/testing/mocks/route-params-mock';
import { RouteParams } from '../../../../shared/services/route-params';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { LocalizationConfig } from '../../../../shared/localization-config';
import { BreadcrumbServiceStub } from '../../../../shared/testing/mocks/breadcrumb-service-mock';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { PlantandequipmentViewComponent } from '../../components/plantandequipment-view/plantandequipment-view.component';
import { PlantandequipmentlistComponent } from '../../components/plantandequipmentlist/plantandequipmentlist.component';
import {
  PlantandequipmentAddupdateComponent,
} from '../../plantandequipmentshared/components/plantandequipment-addupdate/plantandequipment-addupdate.component';
import { routes } from '../../plantandequipment.routes';
import { AtlasSharedModule } from '../../../../shared/atlas-shared.module';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { PlantandequipmentContainerComponent } from './plantandequipment-container.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule, Store } from '@ngrx/store';
import { reducer } from '../../../../shared/reducers/index';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { InjectorRef, LocaleService, TranslationService, LocalizationModule } from 'angular-l10n';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import * as fromRoot from '../../../../shared/reducers/index';

describe('Plant and equipment container component', () => {
  let store: Store<fromRoot.State>;
  let component: PlantandequipmentContainerComponent;
  let fixture: ComponentFixture<PlantandequipmentContainerComponent>;
  let plantandequipmentServiceStub: PlantandequipmentService;
  let breadcrumbService: BreadcrumbService;
  let selectedPlantandEquipment: PlantAndEquipment;
  let mockPlantandEquipmentData: PlantAndEquipment;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule
        , ReactiveFormsModule
        , AtlasElementsModule
        , PlantandequipmentsharedModule
        , RouterModule.forChild(routes)
        , LocalizationModule
        , AtlasSharedModule
        , BrowserAnimationsModule
        , StoreModule.provideStore(reducer)
      ],
      declarations: [
        PlantandequipmentContainerComponent
        , PlantandequipmentViewComponent
        , PlantandequipmentlistComponent
      ],
      providers: [
        InjectorRef
        , FormBuilderService
        , BreadcrumbService
        // , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: RouteParams, useClass: RouteParamsMock }
        , PlantandequipmentService
      ]
    })
      .overrideComponent(PlantandequipmentContainerComponent, { set: { host: { "(click)": "dummy" } } })
      .compileComponents();
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantandequipmentContainerComponent);
    component = fixture.componentInstance;
    breadcrumbService = fixture.debugElement.injector.get(BreadcrumbService);;
    const bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.PlantEquipment, label: 'Plant & equipment', url: '/method-statement/plant-and-equipment' };
    breadcrumbService.add(bcItem);
    plantandequipmentServiceStub = fixture.debugElement.injector.get(PlantandequipmentService);
    store = fixture.debugElement.injector.get(Store);
    mockPlantandEquipmentData = MockStoreProviderFactory.getPlantandEquipmentData();
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('component should be created', () => {
    expect(component).toBeTruthy();//PlantAndEquipNotif
  });

  it('breadcrumb should be render correctly', () => {
    let breadCrumbAnchors = fixture.debugElement.queryAll(By.css('.breadcrumbs a')) as DebugElement[];
    let parentBreadcrumbItem = breadCrumbAnchors[0].nativeElement.text;
    let currentBreadcrumbItem = breadCrumbAnchors[1].nativeElement.text;
    expect(breadCrumbAnchors.length).toEqual(2);
    expect(parentBreadcrumbItem).toContain('Home');
    expect(currentBreadcrumbItem).toContain('Plant & equipment');
  });

  it('Banner title should be display', () => {
    let element = fixture.debugElement.query(By.css('.banner__title')).nativeElement;
    expect(element.textContent).toContain('PLANT_AND_EQUIPMENT');
  });

  it('Banner background image should be displayed', () => {
    let backgroundImage = '/assets/images/lp-plant-equipment.jpg';
    expect(component.getBackgroundImage()).toContain(backgroundImage);
  })

  it('Notification message should be display', () => {
    let element = fixture.debugElement.query(By.css('.icon-with-text__copy')).nativeElement;
    expect(element.textContent).toContain('PLANTANDEQIP_LANDING_PAGE_MSG');
  });

  it('add button should  display the title', () => {
    let element = fixture.debugElement.query(By.css('#plantAndEquip_AeAnchor')).nativeElement;
    expect(element.textContent).toContain('ADD_PLANT_AND_EQUIPMENT');
  });

  it('add button should be clickable', fakeAsync(() => {
    spyOn(component, 'addNewPlantAndEquipment');
    let debugElement = fixture.debugElement.query(By.css('#plantAndEquip_AeAnchor')).nativeElement;
    debugElement.click();
    tick();
    expect(component.addNewPlantAndEquipment).toHaveBeenCalled();
  }));

  it('add button click should open add item slide out', fakeAsync(() => {
    let debugElement = fixture.debugElement.query(By.css('#plantAndEquip_AeAnchor')).nativeElement;
    debugElement.click();
    fixture.detectChanges();
    tick();
    expect(component.showPlantEquipmentAddUpdateForm).toBe(true);
  }));

  it('slide out should be closed on cancel event', fakeAsync(() => {
    let eventData = {};
    component.onPlantAndEquipmentlideCancel(eventData);
    fixture.detectChanges();
    tick(200);
    expect(component.action.length).toEqual(0);
    expect(component.showPlantEquipmentDeleteModal).toBe(false);
    expect(component.showPlantEquipmentAddUpdateForm).toBe(false);
    expect(component.showPlantEquipmentViewSlideOut).toBe(false);
  }));

  it('Plant and equipment selected plan and equipment details should match correctly', fakeAsync(() => {
    component.onPlantEquipmentUpdate(mockPlantandEquipmentData);
    tick(100);
    fixture.detectChanges();
    expect(component.selectedPlantEquipment).toBe(mockPlantandEquipmentData);
    expect(component.action).toContain('update');
  }));

  it('slide out should display with plant and equipment details in the update', fakeAsync(() => {
    component.action = 'update';
    const action = new LoadSelectedPlantandequipmentCompleteAction(mockPlantandEquipmentData);
    store.dispatch(action);
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick(100);
    expect(component.loadedSelectedPlantEquipment).toBe(mockPlantandEquipmentData);
    expect(component.showPlantEquipmentAddUpdateForm).toBe(true);
    expect(component.showPlantEquipmentViewSlideOut).toBe(false);
  }));

  it('slide out should display with plant and equipment details in the view', fakeAsync(() => {
    component.action = 'view';
    const action = new LoadSelectedPlantandequipmentCompleteAction(mockPlantandEquipmentData);
    store.dispatch(action);
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick(100);
    expect(component.loadedSelectedPlantEquipment).toBe(mockPlantandEquipmentData);
    expect(component.showPlantEquipmentAddUpdateForm).toBe(false);
    expect(component.showPlantEquipmentViewSlideOut).toBe(true);
  }));

  describe('remove plant and equipment', () => {
    beforeEach(() => {
      component.onPlantEquipmentDelete(mockPlantandEquipmentData);
      fixture.debugElement.triggerEventHandler('click', null);
      fixture.detectChanges();
    })

    it('modal popup confirmation should be display on plant and equipment remove', fakeAsync(() => {
      tick();
      expect(component.selectedPlantEquipment).toEqual(mockPlantandEquipmentData);
      expect(component.showPlantEquipmentDeleteModal).toEqual(true);
    }));

    it('remove plant and equipment item confirmation popup header message should display correctly', fakeAsync(() => {
      tick();
      let debugElement = fixture.debugElement.query(By.css('.modal-dialog-header')).nativeElement;
      fixture.detectChanges();
      tick();
      expect(debugElement.textContent).toContain('PLANT_AND_EQUIPMENT_REMOVE_DIALOG_MSG');
    }));

    it('remove plant and equipment item confirmation popup body message should display correctly', fakeAsync(() => {
      tick();
      let debugElement = fixture.debugElement.query(By.css('.modal-dialog-body')).nativeElement;
      fixture.detectChanges();
      tick();
      expect(debugElement.textContent).toContain('PLANT_AND_EQUIPMENT_REMOVE_DIALOG_MSG_CONFIRM');
    }));
    
    it('remove plant and equipment item confirmation popup cancel button text should display correctly', fakeAsync(() => {
      tick();
      let debugElement = fixture.debugElement.query(By.css('#confirmNo_aeButton_1')).nativeElement;
      fixture.detectChanges();
      tick();
      expect(debugElement.textContent).toContain('PLANT_AND_EQUIPMENT_Dialog.Btn_No');
    }));

    it('remove plant and equipment item confirmation popup remove button text should display correctly', fakeAsync(() => {
      tick();
      let debugElement = fixture.debugElement.query(By.css('#confirmYes_aeButton_1')).nativeElement;
      fixture.detectChanges();
      tick();
      expect(debugElement.textContent).toContain('PLANT_AND_EQUIPMENT_Dialog.Btn_Yes');
    }))

    it('remove plant and equipment item confirmation popup should closed on remove action click', fakeAsync(() => {
      tick();
      let debugElement = fixture.debugElement.query(By.css('#confirmNo_aeButton_1')).nativeElement;
      debugElement.click('no');
      fixture.detectChanges();
      tick();
      expect(component.showPlantEquipmentDeleteModal).toBe(false);
    }));

    it('remove plant and equipment item confirmation popup should remove item on remove action click', fakeAsync(() => {
      tick();
      spyOn(plantandequipmentServiceStub, 'removePlantEquipment')
      let debugElement = fixture.debugElement.query(By.css('#confirmYes_aeButton_1')).nativeElement;
      debugElement.click('yes');
      fixture.detectChanges();
      tick();
      expect(component.showPlantEquipmentDeleteModal).toBe(false);
      expect(plantandequipmentServiceStub.removePlantEquipment).toHaveBeenCalledWith(component.selectedPlantEquipment)
    }))

  });

});

