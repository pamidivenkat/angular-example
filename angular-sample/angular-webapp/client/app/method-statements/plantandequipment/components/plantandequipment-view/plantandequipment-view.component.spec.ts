import { MockStoreProviderFactory } from '../../../../shared/testing/mocks/mock-store-provider-factory';
import { BreadcrumbServiceStub } from '../../../../shared/testing/mocks/breadcrumb-service-mock';
import { ClaimsHelperServiceStub } from '../../../../shared/testing/mocks/claims-helper-service-mock';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { LocalizationConfigStub } from '../../../../shared/testing/mocks/localization-config-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { PlantandequipmentService } from '../../services/plantandequipment.service';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { LocalizationConfig } from '../../../../shared/localization-config';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import { PlantandequipmentlistComponent } from '../plantandequipmentlist/plantandequipmentlist.component';
import {
  PlantandequipmentContainerComponent,
} from '../../containers/plantandequipment-container/plantandequipment-container.component';
import {
  PlantandequipmentAddupdateComponent,
} from '../../plantandequipmentshared/components/plantandequipment-addupdate/plantandequipment-addupdate.component';
import { StoreModule, Store } from '@ngrx/store';
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasSharedModule } from '../../../../shared/atlas-shared.module';
import { RouterModule, Router } from '@angular/router';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { PlantandequipmentViewComponent } from './plantandequipment-view.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { reducer } from '../../../../shared/reducers/index';
import * as fromRoot from '../../../../shared/reducers/index';
import { routes } from '../../plantandequipment.routes';
import { By } from '@angular/platform-browser';

describe('PlantandequipmentViewComponent', () => {
  let component: PlantandequipmentViewComponent;
  let fixture: ComponentFixture<PlantandequipmentViewComponent>;
  let store: Store<fromRoot.State>;
  let breadcrumbService: BreadcrumbService;
  let cancelStatus: "";

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule
        , ReactiveFormsModule
        , AtlasElementsModule
        , RouterModule.forChild(routes)
        , LocalizationModule
        , AtlasSharedModule
        , BrowserAnimationsModule
        , StoreModule.provideStore(reducer)
      ],
      declarations: [
        PlantandequipmentAddupdateComponent
        , PlantandequipmentContainerComponent
        , PlantandequipmentViewComponent
        , PlantandequipmentlistComponent
      ],
      providers: [
        InjectorRef
        , FormBuilderService
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantandequipmentViewComponent);
    component = fixture.componentInstance;
    component.vm = MockStoreProviderFactory.getPlantandEquipmentData();
    breadcrumbService = fixture.debugElement.injector.get(BreadcrumbService);;
    store = fixture.debugElement.injector.get(Store);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display plant and equipment view header', fakeAsync(() => {
    let debugElement = fixture.debugElement.query(By.css('.grey-strip')).nativeElement;
    tick();
    expect(debugElement.textContent).toContain('VIEW_PLANT_EQUIPMENT');
  }))

  it('should display plant and equipment item name', fakeAsync(() => {
    let debugElement = fixture.debugElement.query(By.css('#plantAndEquipment_Name')).nativeElement;
    tick();
    expect(debugElement.textContent).toContain(component.vm.Name);
  }))
  it('should display plant and equipment item ref no', fakeAsync(() => {
    let debugElement = fixture.debugElement.query(By.css('#plantAndEquipment_refNo')).nativeElement;
    tick();
    expect(debugElement.textContent).toContain(component.vm.AssetRefNo);
  }))

  it('should display plant and equipment item used for', fakeAsync(() => {
    let debugElement = fixture.debugElement.query(By.css('#plantAndEquipment_usedFor')).nativeElement;
    tick();
    expect(debugElement.textContent).toContain(component.vm.UsedFor);
  }))

  it('should display plant and equipment item special requirements', fakeAsync(() => {
    let debugElement = fixture.debugElement.query(By.css('#plantAndEquipment_specialRequirements')).nativeElement;
    tick();
    expect(debugElement.textContent).toContain(component.vm.SpecialRequirements);
  }))
  
  beforeEach(() => {
    component.onCancel.subscribe((status) => {
      cancelStatus = status;
    });
  })

  it('cancel button should emit the status', fakeAsync(() => {
    let debugElement = fixture.debugElement.query(By.css('#submitConfirmCancel_aeButton_1')).nativeElement;
    debugElement.click();
    fixture.detectChanges();
    tick();
    expect(cancelStatus).toContain('close');
  }))
});
