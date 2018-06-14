import { PlantAndEquipment } from '../../../models/plantandequipment';
import { MockStoreProviderFactory } from '../../../../../shared/testing/mocks/mock-store-provider-factory';
import { By } from '@angular/platform-browser';
import { ClaimsHelperServiceStub } from '../../../../../shared/testing/mocks/claims-helper-service-mock';
import { ClaimsHelperService } from '../../../../../shared/helpers/claims-helper';
import { RouterMock } from '../../../../../shared/testing/mocks/router-stub';
import { PlantandequipmentService } from '../../../services/plantandequipment.service';
import { LocalizationConfig } from '../../../../../shared/localization-config';
import { LocalizationConfigStub } from '../../../../../shared/testing/mocks/localization-config-stub';
import { LocaleServiceStub } from '../../../../../shared/testing/mocks/locale-service-stub';
import { TranslationServiceStub } from '../../../../../shared/testing/mocks/translation-service-stub';
import { BreadcrumbService } from '../../../../../atlas-elements/common/services/breadcrumb-service';
import { FormBuilderService } from '../../../../../shared/services/form-builder.service';
import { PlantandequipmentlistComponent } from '../../../components/plantandequipmentlist/plantandequipmentlist.component';
import { PlantandequipmentViewComponent } from '../../../components/plantandequipment-view/plantandequipment-view.component';
import {
  PlantandequipmentContainerComponent,
} from '../../../containers/plantandequipment-container/plantandequipment-container.component';
import { AtlasSharedModule } from '../../../../../shared/atlas-shared.module';
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasElementsModule } from '../../../../../atlas-elements/atlas-elements.module';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { PlantandequipmentAddupdateComponent } from './plantandequipment-addupdate.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule, Store } from '@ngrx/store';
import { RouterModule, Router } from '@angular/router';
import { routes } from '../../../plantandequipment.routes';
import { reducer } from '../../../../../shared/reducers/index';
import * as fromRoot from '../../../../../shared/reducers/index';

describe('plant and equipment add/update component', () => {
  let component: PlantandequipmentAddupdateComponent;
  let fixture: ComponentFixture<PlantandequipmentAddupdateComponent>;
  let store: Store<fromRoot.State>;
  let plantandequipmentServiceStub: PlantandequipmentService;
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
        , BreadcrumbService
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , PlantandequipmentService
      ]
    })
      .overrideComponent(PlantandequipmentAddupdateComponent, { set: { host: { "(click)": "dummy" } } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantandequipmentAddupdateComponent);
    component = fixture.componentInstance;
    component.SelectedPlantEquipment = MockStoreProviderFactory.getPlantandEquipmentData();
    component.action = 'update';
    breadcrumbService = fixture.debugElement.injector.get(BreadcrumbService);;
    plantandequipmentServiceStub = fixture.debugElement.injector.get(PlantandequipmentService);
    store = fixture.debugElement.injector.get(Store);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('Add item title should display', fakeAsync(() => {
    component.action = 'Add';
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();
    expect(component.title()).toContain('ADD_PLANT_EQUIPMENT');
  }));

  it('Update item title should display', fakeAsync(() => {
    component.action = 'Update';
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();
    expect(component.title()).toContain('UPDATE_PLANT_EQUIPMENT');
  }));

  it('add button should be when adding item', fakeAsync(() => {
    component.action = 'Add';
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();
    expect(component.formButtonNames().Submit).toContain('Add');
  }));

  it('Update button should be when updating item', fakeAsync(() => {
    component.action = 'Update';
    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();
    expect(component.formButtonNames().Submit).toContain('update');
  }));

  beforeEach(() => {
    component.action = 'Add';
    component._onPlantAndEquipmentCancel.subscribe((status) => {
      cancelStatus = status;
    });
  })

  it('cancel button should emit cancel status', fakeAsync(() => {
    let debugElement = fixture.debugElement.query(By.css('#addUpdatePlantEquipmentForm_Label_1')).nativeElement;
    debugElement.click();
    fixture.detectChanges();
    tick();
    expect(cancelStatus).toContain('Cancel');
  }));

  describe('Adding new plant and equipment item', () => {
    beforeEach(() => {
      component.action = 'Add';
      component.SelectedPlantEquipment = new PlantAndEquipment();
      let debugElement = fixture.debugElement.query(By.css('#addUpdatePlantEquipmentForm_AeAnchor_1')).nativeElement;
      debugElement.click();
      fixture.detectChanges();
    })
    it('Name field validation should fire if it is empty', fakeAsync(() => {
      let debugElement = fixture.debugElement.query(By.css('#addUpdatePlantEquipmentForm_AeInput_ErrorSpan_0')).nativeElement;
      fixture.detectChanges();
      tick();
      expect(debugElement.textContent).toContain('Name  is required');
    }));

    it('What is the item used for field validation should fire if it is empty', fakeAsync(() => {
      let validationError = "What is the item used for ?  is required";
      let debugElement = fixture.debugElement.query(By.css('#addUpdatePlantEquipmentForm_AeTextArea_ErrorSpan_2')).nativeElement;
      fixture.detectChanges();
      tick();
      expect(debugElement.textContent).toContain(validationError);
    }));

    it('form should be valid on filling all the details', fakeAsync(() => {
      spyOn(plantandequipmentServiceStub, 'savePlantEquipmentDetails')
      component.addUpdatePlantEquipmentForm.get('Name').setValue('name one');
      component.addUpdatePlantEquipmentForm.get('AssetRefNo').setValue('Ref 123');
      component.addUpdatePlantEquipmentForm.get('UsedFor').setValue('used for different things.');
      component.addUpdatePlantEquipmentForm.get('SpecialRequirements').setValue('special requirments.');
      fixture.detectChanges();
      tick();
      expect(component.addUpdatePlantEquipmentForm.valid).toBe(true);
    }));

    it('add button click should dispatch to save plant and equipment details', fakeAsync(() => {
      spyOn(plantandequipmentServiceStub, 'savePlantEquipmentDetails')
      component.addUpdatePlantEquipmentForm.get('Name').setValue('name one');
      component.addUpdatePlantEquipmentForm.get('AssetRefNo').setValue('Ref 123');
      component.addUpdatePlantEquipmentForm.get('UsedFor').setValue('used for different things.');
      component.addUpdatePlantEquipmentForm.get('SpecialRequirements').setValue('special requirments.');
      let debugElement = fixture.debugElement.query(By.css('#addUpdatePlantEquipmentForm_AeAnchor_1')).nativeElement;
      debugElement.click();
      fixture.detectChanges();
      tick();
      expect(plantandequipmentServiceStub.savePlantEquipmentDetails).toHaveBeenCalled();
    }));
  });
  describe('update plant and equipment details', () => {
    beforeEach(() => {
      component.action = 'update';
    })
    it('check all the properties data displayed correctly', fakeAsync(() => {
      tick();
      let name = component.addUpdatePlantEquipmentForm.get('Name').value;
      let assetRefNo = component.addUpdatePlantEquipmentForm.get('AssetRefNo').value;
      let usedFor = component.addUpdatePlantEquipmentForm.get('UsedFor').value;
      let specialRequirements = component.addUpdatePlantEquipmentForm.get('SpecialRequirements').value;
      expect(component.SelectedPlantEquipment.Name).toEqual(name);
      expect(component.SelectedPlantEquipment.AssetRefNo).toEqual(assetRefNo);
      expect(component.SelectedPlantEquipment.UsedFor).toEqual(usedFor);
      expect(component.SelectedPlantEquipment.SpecialRequirements).toEqual(specialRequirements);
    }))

    it('update button click should save plant and equipment edited details', fakeAsync(() => {
      spyOn(plantandequipmentServiceStub, 'updatePlantEquipmentDetails')
      let debugElement = fixture.debugElement.query(By.css('#addUpdatePlantEquipmentForm_AeAnchor_1')).nativeElement;
      debugElement.click();
      fixture.detectChanges();
      tick();
      expect(plantandequipmentServiceStub.updatePlantEquipmentDetails).toHaveBeenCalled()
    }));

  })
});
