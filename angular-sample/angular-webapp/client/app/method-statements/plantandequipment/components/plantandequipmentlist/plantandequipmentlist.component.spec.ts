import { AeSortModel, SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AePageChangeEventModel } from '../../../../atlas-elements/common/models/ae-page-change-event-model';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { CommonTestHelper } from '../../../../shared/testing/helpers/common-test-helper';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { LoadPlantandequipmentCompleteAction } from '../../actions/plantequipment-actions';
import { MockStoreProviderFactory } from '../../../../shared/testing/mocks/mock-store-provider-factory';
import { PlantAndEquipment } from '../../models/plantandequipment';
import { PlantandequipmentService } from '../../services/plantandequipment.service';
import { ClaimsHelperServiceStub } from '../../../../shared/testing/mocks/claims-helper-service-mock';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { LocalizationConfigStub } from '../../../../shared/testing/mocks/localization-config-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { BreadcrumbServiceStub } from '../../../../shared/testing/mocks/breadcrumb-service-mock';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { LocalizationConfig } from '../../../../shared/localization-config';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import { PlantandequipmentViewComponent } from '../plantandequipment-view/plantandequipment-view.component';
import {
  PlantandequipmentContainerComponent,
} from '../../containers/plantandequipment-container/plantandequipment-container.component';
import {
  PlantandequipmentAddupdateComponent,
} from '../../plantandequipmentshared/components/plantandequipment-addupdate/plantandequipment-addupdate.component';
import { AtlasSharedModule } from '../../../../shared/atlas-shared.module';
import { RouterModule, Router } from '@angular/router';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { PlantandequipmentlistComponent } from './plantandequipmentlist.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule, Store } from '@ngrx/store';
import { reducer } from '../../../../shared/reducers/index';
import * as fromRoot from '../../../../shared/reducers/index';
import { routes } from '../../plantandequipment.routes';
import * as Immutable from 'immutable';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

let assertFun = function (columnDivs: DebugElement[], columnIndex: number, columnNameKey: string, sortKey: string) {
  let divHeader = columnDivs[columnIndex];
  let spanHeader: HTMLSpanElement = divHeader.query(By.css('span')).nativeElement;
  expect(spanHeader.innerHTML).toEqual(columnNameKey);
  let divHeaderNative = <HTMLDivElement>divHeader.nativeElement;
  expect(divHeaderNative.classList).toContain('js-sortable');
  let divDataAttr: HTMLDivElement = divHeader.query(By.css('div')).nativeElement
  let att: NamedNodeMap = divDataAttr.attributes;
  expect((att.getNamedItem('data-sortable').value).trim()).toEqual('true');
  expect(att.getNamedItem('data-sortKey').value.toLowerCase()).toEqual(sortKey);
}

describe('PlantandequipmentlistComponent', () => {
  let component: PlantandequipmentlistComponent;
  let fixture: ComponentFixture<PlantandequipmentlistComponent>;
  let breadcrumbService: BreadcrumbService;
  let store: Store<fromRoot.State>;
  let plantandequipmentServiceStub: PlantandequipmentService;
  let listLoadingStatus: boolean;
  let listItems: Immutable.List<PlantAndEquipment>;
  let mockData: any;
  let listItemsCount: number;
  let dataTableOptions: DataTableOptions;
  let actions: Immutable.List<AeDataTableAction>;
  let viewAction: AeDataTableAction;
  let updateAction: AeDataTableAction;
  let removeAction: AeDataTableAction;
  let plantAndEquipmentItem: PlantAndEquipment;
  let updatePlantAndEquipmentItem: PlantAndEquipment;
  let removeplantAndEquipmentItem: PlantAndEquipment;
  let selectedPlantAndEquipment: PlantAndEquipment;
  let columnDivs: DebugElement[];

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
        , PlantandequipmentService
      ]
    })
      .overrideComponent(PlantandequipmentlistComponent, { set: { host: { "(click)": "dummy" } } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantandequipmentlistComponent);
    component = fixture.componentInstance;
    breadcrumbService = fixture.debugElement.injector.get(BreadcrumbService);
    plantandequipmentServiceStub = fixture.debugElement.injector.get(PlantandequipmentService);
    store = fixture.debugElement.injector.get(Store);
    actions = component.actions;
    viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'View');
    updateAction = CommonTestHelper.getGivenButton(actions.toArray(), 'Update');
    removeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'Remove');
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('plant and equipment list screen', () => {
    beforeEach(() => {
      mockData = MockStoreProviderFactory.getMockPlantEquipmentPageData();
      component.plantEquipmentListLoaded$.subscribe((loaded) => {
        listLoadingStatus = loaded;
      })

      component.plantEquipmentList$.subscribe((items) => {
        listItems = items;
      })

      component.recordsCount$.subscribe((itemsCount) => {
        listItemsCount = itemsCount;
      })

      component.dataTableOptions$.subscribe((options) => {
        dataTableOptions = options;
      })
    })

    it('data table should display given View,Update and Remove actions', fakeAsync(() => {
      let items: Array<AeDataTableAction> = component.actions.toArray();
      fixture.detectChanges();
      tick();
      expect(items.length).toEqual(3);
      expect(CommonTestHelper.hasGivenButton(items, 'View')
        && CommonTestHelper.hasGivenButton(items, 'Update')
        && CommonTestHelper.hasGivenButton(items, 'Remove')
      ).toBeTruthy();
    }))

    it('initial loading status should be display', fakeAsync(() => {
      tick();
      expect(listLoadingStatus).toBe(true);
    }))

    it('data should be display on load complete action dispatch', fakeAsync(() => {
      const action = new LoadPlantandequipmentCompleteAction(mockData);
      store.dispatch(action);
      fixture.detectChanges();
      tick();
      expect(listLoadingStatus).toBe(false);
      expect(listItems.count()).toEqual(10);
    }))
  })

  describe('data table with fields, sorting and paging', () => {
    beforeEach(() => {
      const action = new LoadPlantandequipmentCompleteAction(mockData);
      store.dispatch(action);
      let tbdElement = fixture.debugElement.query(By.css('#plantAndEquipmentList'));
      columnDivs = tbdElement.queryAll(By.css('.table__heading'));//AePageChangeEventModel
    })
    it('check sortable Item,Asset / reference no columns displayed correctly', fakeAsync(() => {
      assertFun(columnDivs, 0, 'PLANT_AND_EQUIPMENTS.ITEM', 'name');
      assertFun(columnDivs, 1, 'PLANT_AND_EQUIPMENTS.ASSET_REFERENCE_NO', 'assetrefno');
    }))

    it('plant and equipment data page changed call should be dispatched', fakeAsync(() => {
      spyOn(plantandequipmentServiceStub, 'loadPlantAndEquipmentList')
      let pageChangeEventModel = <AePageChangeEventModel>{ pageNumber: 2, noOfRows: 10 };
      component.onGridPageChange(pageChangeEventModel);
      fixture.detectChanges();
      tick();
      expect(plantandequipmentServiceStub.loadPlantAndEquipmentList).toHaveBeenCalled();
    }))

    it('plant and equipment data sort name data call should be dispatched', fakeAsync(() => {
      spyOn(plantandequipmentServiceStub, 'loadPlantAndEquipmentList')
      let aeSortModel = <AeSortModel>{ Direction: SortDirection.Ascending, SortField: 'name' };
      component.onGridSort(aeSortModel);
      fixture.detectChanges();
      tick();
      expect(plantandequipmentServiceStub.loadPlantAndEquipmentList).toHaveBeenCalled();
    }))

  })

  describe('plant and equipment list actions', () => {
    beforeEach(() => {
      const action = new LoadPlantandequipmentCompleteAction(mockData);
      store.dispatch(action);
      component._onPlantEquipmentView.subscribe((selectedItem) => {
        plantAndEquipmentItem = selectedItem;
      })
      component._onPlantEquipmentUpdate.subscribe((item) => {
        updatePlantAndEquipmentItem = item;
      })

      component._onPlantEquipmentDelete.subscribe((item) => {
        removeplantAndEquipmentItem = item;
      })
    })

    it('View action should emit the selected record', fakeAsync(() => {
      viewAction.command.next(selectedPlantAndEquipment);
      fixture.detectChanges();
      tick();
      expect(selectedPlantAndEquipment).toEqual(plantAndEquipmentItem);
    }))
    it('Update action should emit the selected record', fakeAsync(() => {
      updateAction.command.next(selectedPlantAndEquipment);
      fixture.detectChanges();
      tick();
      expect(updatePlantAndEquipmentItem).toEqual(plantAndEquipmentItem);
    }))

    it('Remove action should emit the selected record', fakeAsync(() => {
      removeAction.command.next(selectedPlantAndEquipment);
      fixture.detectChanges();
      tick();
      expect(removeplantAndEquipmentItem).toEqual(plantAndEquipmentItem);
    }))
  })
});
