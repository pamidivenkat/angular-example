import { AeButtonComponent } from '../../../../atlas-elements/ae-button/ae-button.component';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';

import { AeAutocompleteComponent } from '../../../../atlas-elements/ae-autocomplete/ae-autocomplete.component';
import { AeFormComponent } from '../../../../atlas-elements/ae-form/ae-form.component';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { RestClientService } from '../../../../shared/data/rest-client.service';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../../shared/reducers';
import { reducer } from '../../../../shared/reducers/index';
import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import { BreadcrumbServiceStub } from '../../../../shared/testing/mocks/breadcrumb-service-mock';
import { ClaimsHelperServiceStub } from '../../../../shared/testing/mocks/claims-helper-service-mock';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { MockStoreProviderFactory } from '../../../../shared/testing/mocks/mock-store-provider-factory';
import { RestClientServiceStub } from '../../../../shared/testing/mocks/rest-client-service-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { LoadPlantandequipmentCompleteAction } from '../../../plantandequipment/actions/plantequipment-actions';
import {
    PlantandequipmentAddupdateComponent,
} from '../../../plantandequipment/plantandequipmentshared/components/plantandequipment-addupdate/plantandequipment-addupdate.component';
import { PlantandequipmentService } from '../../../plantandequipment/services/plantandequipment.service';
import { AddPlantEquipmentComponent } from './add-plant-equipment.component';

describe('Add Plant Equipment Component', () => {
  let component: AddPlantEquipmentComponent;
  let fixture: ComponentFixture<AddPlantEquipmentComponent>;
  let store: Store<fromRoot.State>;
  let dispatchSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AtlasElementsModule
        , LocalizationModule
        , StoreModule.provideStore(reducer)
      ]
      , declarations: [
        AddPlantEquipmentComponent
        , PlantandequipmentAddupdateComponent
      ]
      , providers: [
        InjectorRef
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , PlantandequipmentService
        , { provide: RestClientService, useClass: RestClientServiceStub }
        , FormBuilderService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPlantEquipmentComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);
    let data = MockStoreProviderFactory.getMockPlantEquipments();

    store.dispatch(new LoadPlantandequipmentCompleteAction(data)); 
    spyOn(component, 'onSubmitPlantAndEquipmentForm').and.callThrough();
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('add button at the top of the Tab ', () => {
    let addButton = fixture.debugElement.query(By.directive(AeButtonComponent));
    expect(addButton).not.toBeNull;
    expect(addButton.nativeElement.innerText).toEqual('MANAGE_METHOD_STM.PLANT-EQUIPMENT.ADD_ITEM')
  })

  it('should fire mandatory validation when submit with out element', () => {
    let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;

    form.formGroup.controls.plantAndEquipment.markAsDirty();
    form._onFormSubmit.emit();

    fixture.detectChanges();
    let error = fixture.debugElement.query(By.css('.error-text'));
    expect(error).not.toBeNull();
    expect(error.nativeElement.innerText).toEqual('Select an item from your Plant & equipment bank is required');
  });

  it('Options should match the count', () => {
    let personField = <AeAutocompleteComponent<any>>fixture.debugElement.query(By.directive(AeAutocompleteComponent)).componentInstance;
    let event = { query: 'test' };
    personField.aeOnComplete.emit(event);
    fixture.detectChanges();
    expect(personField.items.length).toEqual(19);
  })

  it('No validation when submit with value', () => {
    let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;
    let plantAndEquipment = form.formGroup.controls.plantAndEquipment;
    plantAndEquipment.setValue(['7f195f59-febf-4e34-954d-d49727999fad']);
    form._onFormSubmit.emit();
    fixture.detectChanges();
    let error = fixture.debugElement.query(By.css('.error-text'));
    expect(error).toBeNull();   

    expect(component.onSubmitPlantAndEquipmentForm).toHaveBeenCalled();

  });

  it('should call add method on submit', () => {
    let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;
    let plantAndEquipment = form.formGroup.controls.plantAndEquipment;
    plantAndEquipment.setValue(['7f195f59-febf-4e34-954d-d49727999fad']);
    form._onFormSubmit.emit();
    fixture.detectChanges();

    expect(component.onSubmitPlantAndEquipmentForm).toHaveBeenCalled();

  });

});
