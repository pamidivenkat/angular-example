import { AeModalDialogComponent } from '../../../../atlas-elements/ae-modal-dialog/ae-modal-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import { RestClientServiceStub } from '../../../../shared/testing/mocks/rest-client-service-stub';
import { RestClientService } from '../../../../shared/data/rest-client.service';
import { PlantandequipmentService } from '../../../plantandequipment/services/plantandequipment.service';
import { MockStoreProviderFactory } from '../../../../shared/testing/mocks/mock-store-provider-factory';
import { AeButtonComponent } from '../../../../atlas-elements/ae-button/ae-button.component';
import { DebugElement } from '@angular/core';
import { AeDatatableComponent } from '../../../../atlas-elements/ae-datatable/ae-datatable.component';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs/Rx';
import { AeWizardStep } from '../../../../atlas-elements/common/models/ae-wizard-step';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';

import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../../shared/reducers';
import { reducer } from '../../../../shared/reducers/index';
import { BreadcrumbServiceStub } from '../../../../shared/testing/mocks/breadcrumb-service-mock';
import { ClaimsHelperServiceStub } from '../../../../shared/testing/mocks/claims-helper-service-mock';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { MethodStatement } from '../../../models/method-statement';
import {
  PlantandequipmentAddupdateComponent,
} from '../../../plantandequipment/plantandequipmentshared/components/plantandequipment-addupdate/plantandequipment-addupdate.component';
import { LoadMethodStatementByIdCompleteAction } from '../../actions/manage-methodstatement.actions';
import { AddPlantEquipmentComponent } from '../add-plant-equipment/add-plant-equipment.component';
import { PlantEquipmentComponent } from './plant-equipment.component';


let assertFun = function (columnDiv: DebugElement, columnNameKey: string, sortKey: string) {
  let spanHeader: HTMLSpanElement = columnDiv.query(By.css('span')).nativeElement;
  expect(spanHeader.innerHTML).toEqual(columnNameKey);
  let divHeaderNative = <HTMLDivElement>columnDiv.nativeElement;
  expect(divHeaderNative.classList).toContain('js-sortable');
  let divDataAttr: HTMLDivElement = columnDiv.query(By.css('div')).nativeElement
  let att: NamedNodeMap = divDataAttr.attributes;
  expect((att.getNamedItem('data-sortable').value).trim()).toEqual('true');
  expect(att.getNamedItem('data-sortKey').value.toLowerCase()).toEqual(sortKey.toLowerCase());
}

describe('Plant and Equipment Component :', () => {
  let component: PlantEquipmentComponent;
  let fixture: ComponentFixture<PlantEquipmentComponent>;
  let translationServiceStub: any;
  let store: Store<fromRoot.State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AtlasElementsModule
        , LocalizationModule
        , StoreModule.provideStore(reducer)
        , BrowserAnimationsModule
      ]
      , declarations: [
        PlantEquipmentComponent
        , AddPlantEquipmentComponent
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

  describe('Loading grid with out data', () => {

    beforeEach(() => {
      fixture = TestBed.createComponent(PlantEquipmentComponent);
      component = fixture.componentInstance;
      translationServiceStub = fixture.debugElement.injector.get(TranslationService);

      store = fixture.debugElement.injector.get(Store);
      let methodStatement = new MethodStatement();
      methodStatement.Id = '99a5d85a-f97d-4e12-9a6f-de5afbb63717';

      component.methodStatement = methodStatement;
      let context = new AeWizardStep('Plant & equipment', '', 'plantAndEquipmentStep', true);
      let submitEvent = new BehaviorSubject<boolean>(false);
      component.context = context;
      context['submitEvent'] = submitEvent;
      store.dispatch(new LoadMethodStatementByIdCompleteAction(methodStatement));
      fixture.detectChanges();
    });

    it('should be created', () => {
      expect(component).toBeTruthy();
    });

    it('add button at the top of the Tab ', () => {
      let addButton = fixture.debugElement.query(By.directive(AeButtonComponent));
      expect(addButton).not.toBeNull;
      expect(addButton.nativeElement.innerText).toEqual('PLANT-EQUIPMENT.ADD')
    })

    it('plant & equipment to the Method Statement they are displayed in the grid ', () => {
      let grid = fixture.debugElement.query(By.directive(AeDatatableComponent)).componentInstance;
      expect(grid instanceof AeDatatableComponent).toBeTruthy();
      expect(grid.name).toEqual('Plant-Equipment_AeDatatable');
    });

    it('in the grid - there are four columns', () => {
      let columns = fixture.debugElement.queryAll(By.css('.table__heading'));
      expect(columns.length).toEqual(4);
    });

    it('grid defaults to blank until an item is added', () => {
      let cell = fixture.debugElement.query(By.css('.no--data'));
      expect(cell).not.toBeNull();
      expect(cell.nativeElement.innerText).toEqual('There is no data to display');
    });

    it('item name, used for, special requirement are sortable column', () => {
      let columns = fixture.debugElement.queryAll(By.css('.table__heading'));
      assertFun(columns[0], 'MANAGE_METHOD_STM.PLANT-EQUIPMENT.ITEM_NAME', 'Name');
      assertFun(columns[1], 'MANAGE_METHOD_STM.PLANT-EQUIPMENT.USED_FOR', 'UsedFor');
      assertFun(columns[2], 'MANAGE_METHOD_STM.PLANT-EQUIPMENT.SPECIAL_REQUIREMENT', 'SpecialRequirements');
    });

    it('should open a slide out when add button click', () => {

      let addButton = <AeButtonComponent>fixture.debugElement.query(By.directive(AeButtonComponent)).componentInstance;
      spyOn(component, 'openPlantAndEquipmentSlideOut').and.callThrough();
      addButton.aeClick.emit();
      expect(component.openPlantAndEquipmentSlideOut).toHaveBeenCalled();
      fixture.detectChanges();
    });

  });

  describe('Loading grid with data', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(PlantEquipmentComponent);
      component = fixture.componentInstance;
      translationServiceStub = fixture.debugElement.injector.get(TranslationService);

      store = fixture.debugElement.injector.get(Store);
      let methodStatement = MockStoreProviderFactory.getMethodStatementWithPEStub();
      store.dispatch(new LoadMethodStatementByIdCompleteAction(methodStatement));

      component.methodStatement = methodStatement;
      let context = new AeWizardStep('Plant & equipment', '', 'plantAndEquipmentStep', true);
      let submitEvent = new BehaviorSubject<boolean>(false);
      component.context = context;
      context['submitEvent'] = submitEvent;

      fixture.detectChanges();
    });

    it('view a list of any plant & equipment added to the Method Statement', () => {
      let cell = fixture.debugElement.query(By.css('.no--data'));
      expect(cell).toBeNull();
      let records = fixture.debugElement.queryAll(By.css('.table__row'));
      expect(records.length).toEqual(6);
    });

    it('Against any plant & equipment listed they have an option to remove the item if required', () => {
      let records = fixture.debugElement.queryAll(By.css('.table__row'));
      records.map((row, index) => {
        let button = row.query(By.directive(AeButtonComponent));
        expect(button).not.toBeNull();
        expect(button.nativeElement.innerText.trim()).toEqual('REMOVE');
      });
    });

    describe('Remove record from grid', ()=> {
      beforeEach(()=> {
        let records = fixture.debugElement.queryAll(By.css('.table__row'));
        let removeButton = <AeButtonComponent> records[0].query(By.directive(AeButtonComponent)).componentInstance;
        removeButton.aeClick.emit();
        fixture.detectChanges();

        spyOn(component, 'modalClosed').and.callThrough();
      })

      it('Show model popup when remove clicked', ()=> {
        let confirmPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
        expect(confirmPopup).toBeTruthy();
      });

      it('should call remove method', ()=> {
        let confirmPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent));
        let buttons = confirmPopup.queryAll(By.directive(AeButtonComponent));
        let yesButton = <AeButtonComponent> buttons[1].componentInstance;
        yesButton.aeClick.emit('Yes');

        fixture.detectChanges();
        expect(component.modalClosed).toHaveBeenCalled();
        let records = fixture.debugElement.queryAll(By.css('.table__row'));
        expect(records.length).toEqual(5);
      });
    })
  });
});
