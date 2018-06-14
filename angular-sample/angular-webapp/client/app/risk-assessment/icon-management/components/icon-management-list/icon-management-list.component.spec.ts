import { Icon } from '../../models/icon';
import { LoadIconCompleteAction } from '../../actions/icon-add-update.actions';
import { RouterOutletMapStub } from '../../../../shared/testing/mocks/router-outlet-stub';
import { AuthorizationServiceStub } from '../../../../shared/testing/mocks/authorization-service-mock';
import { AuthorizationService } from '../../../../shared/security/authorization.service';
import { RestClientServiceStub } from '../../../../shared/testing/mocks/rest-client-service-stub';
import { RestClientService } from '../../../../shared/data/rest-client.service';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { FileUploadService } from '../../../../shared/services/file-upload.service';
import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IconAddUpdateComponent } from '../icon-add-update/icon-add-update.component';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { IconManagementListComponent } from './icon-management-list.component';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { LocalizationConfig } from '../../../../shared/localization-config';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { ActivatedRoute, Router, RouterOutletMap, UrlSegment } from '@angular/router';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { LocalizationConfigStub } from '../../../../shared/testing/mocks/localization-config-stub';
import { StoreModule, Store } from '@ngrx/store';
import { reducer } from '../../../../shared/reducers/index';
import { ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { ActivatedRouteStub } from '../../../../shared/testing/mocks/activated-route-stub';
import { RouteParams } from '../../../../shared/services/route-params';
import { Http } from '@angular/http';
import { RouteParamsMock } from '../../../../shared/testing/mocks/route-params-mock';
import { mockHttpProvider } from '../../../../shared/testing/mocks/http-stub';
import { IconManagementMockStoreProviderFactory } from '../../../../shared/testing/mocks/icon-mgmt-mock-store-provider-factory';
import * as fromRoot from '../../../../shared/reducers';
import { LoadHazardsOrControlsListCompleteAction, LoadHazardsOrControlsListAction } from '../../../../risk-assessment/icon-management/actions/icon-management-actions';
import { EventListener } from '@angular/core/src/debug/debug_node';
import { AeDatatableComponent } from '../../../../atlas-elements/ae-datatable/ae-datatable.component';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { CommonTestHelper } from '../../../../shared/testing/helpers/common-test-helper';
import { fakeAsync } from '@angular/core/testing';
import { addOrUpdateAtlasParamValue } from '../../../../root-module/common/extract-helpers';
import { tick } from '@angular/core/testing';
import { dispatch } from 'd3';
import { ClaimsHelperServiceStub } from '../../../../shared/testing/mocks/claims-helper-service-mock';

import { IconManagementViewComponent } from '../../../../risk-assessment/icon-management/components/icon-management-view/icon-management-view.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AtlasSharedModule } from '../../../../shared/atlas-shared.module';
import * as Immutable from 'immutable';
describe('Icon Management Hazards List', () => {
  let component: IconManagementListComponent;
  let fixture: ComponentFixture<IconManagementListComponent>;
  let store: Store<fromRoot.State>;
  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any
  let routeParamsStub: any;
  let http: any;
  let viewAction: AeDataTableAction;
  let removeAction: AeDataTableAction;
  let updateAction: AeDataTableAction;
  let dispatchSpy: jasmine.Spy;
  let actions: Immutable.List<AeDataTableAction>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IconManagementListComponent
        , IconAddUpdateComponent
        , IconManagementViewComponent
      ],
      imports: [
        AtlasElementsModule
        , LocalizationModule
        , NoopAnimationsModule
        , StoreModule.provideStore(reducer)
        , ReactiveFormsModule
        , BrowserAnimationsModule
        , AtlasSharedModule

      ],
      providers: [
        InjectorRef
        , BreadcrumbService
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ActivatedRoute, useValue: { snapshot: { url: [{ path: 'hazards' }] } } }
        , { provide: RouteParams, useClass: RouteParamsMock }
        , { provide: Http, useValue: mockHttpProvider }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: RestClientService, useClass: RestClientServiceStub }
        , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
        , { provide: AuthorizationService, useClass: AuthorizationServiceStub }
        , FormBuilderService
        , FileUploadService

      ]
    })
      .overrideComponent(IconManagementListComponent, { set: { host: { "(click)": "dummy" } } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconManagementListComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);

    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    routerMock = fixture.debugElement.injector.get(Router);
    activatedRouteStub = TestBed.get(ActivatedRoute);
    routeParamsStub = fixture.debugElement.injector.get(RouteParams);
    http = fixture.debugElement.injector.get(Http);
    dispatchSpy = spyOn(store, 'dispatch');
    component.ngOnInit();
    actions = component.actions;
    removeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'Remove');
    fixture.detectChanges();

  });

  it('should launch component', () => {
    expect(component).toBeTruthy();
  });

  it('Should have 2 filters', (() => {
    let filters = fixture.debugElement.nativeElement.getElementsByClassName('filter-bar__filter');
    expect(filters.length).toEqual(2);
  }));

  it('Default category filter should be all categories', (() => {
    let aeInput = fixture.debugElement.query(By.css('#icon-management-list_AeSelect_1')).nativeElement;
    expect(aeInput.selectedValue).toBeUndefined();
  }));

  it('Verify place holder in search by hazard name filter', (() => {
    let aeInput = fixture.debugElement.query(By.css('#icon-management-list_AeInput_1')).nativeElement;
    expect(aeInput).toBeDefined();
    expect(aeInput.placeholder).toEqual("ICON_MANAGEMENT.SEARCH_HAZARD_TEXT");

  }));


  it('Should have 4 options in category dropdown', (() => {
    let aeInput = fixture.debugElement.query(By.css('#icon-management-list_AeSelect_1')).nativeElement;
    expect(aeInput.childElementCount).toEqual(4);
  }));

  it('It should have page change and sort options', (() => {
    let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
    let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
    let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
    expect(sortEvent).toBeDefined();
    expect(pageChangeEvent).toBeDefined();
  }));

  it('When category filter is changed, it should filter the list by category', fakeAsync(() => {
    let currentRequest = component.iconsApiRequest;
    let categoryControl = fixture.debugElement.query(By.css('#icon-management-list_AeSelect_1'));
    let typeOfControl = categoryControl instanceof HTMLSelectElement;

    expect(categoryControl.componentInstance.constructor.name).toEqual('AeSelectComponent');
    let objValue = { target: { value: '0' } };
    categoryControl.triggerEventHandler('change', objValue);
    dispatchSpy.and.callThrough();
    fixture.detectChanges();
    tick(200);
    currentRequest.Params = addOrUpdateAtlasParamValue(currentRequest.Params, 'category', '0');
    let loadHazardsOrControlsListAction: LoadHazardsOrControlsListAction = (new LoadHazardsOrControlsListAction(currentRequest));
    expect(dispatchSpy).toHaveBeenCalledWith(loadHazardsOrControlsListAction);
  }));


  it('When name filter is changed, it should filter the list by name', fakeAsync(() => {
    let currentRequest = component.iconsApiRequest;
    let nameControl = fixture.debugElement.query(By.css('#icon-management-list_AeInput_1'));
    let typeOfControl = nameControl instanceof HTMLInputElement;

    expect(nameControl.componentInstance.constructor.name).toEqual('AeInputComponent');
    let objValue = { target: { value: 'test' } };

    nameControl.triggerEventHandler('input', objValue);
    fixture.detectChanges();
    tick(200);
    currentRequest.Params = addOrUpdateAtlasParamValue(currentRequest.Params, 'searchText', 'test');
    let loadHazardsOrControlsListAction: LoadHazardsOrControlsListAction = (new LoadHazardsOrControlsListAction(currentRequest));
    expect(dispatchSpy).toHaveBeenCalledWith(loadHazardsOrControlsListAction);
  }));


  describe('verify data grid', () => {

    beforeEach(() => {
      let mockHazardIcons = IconManagementMockStoreProviderFactory.GetMockHazardIconsList();
      dispatchSpy.and.callThrough();

      store.dispatch(new LoadHazardsOrControlsListCompleteAction({ HazardsOrControlsList: mockHazardIcons.HazardsOrControlsList, HazardsOrControlsListPagingInfo: mockHazardIcons.HazardsOrControlsListPagingInfo }));

      fixture.detectChanges();
    });


    it('should have a data grid', () => {
      let dataGrid = fixture.debugElement.query(By.directive(AeDatatableComponent));
      expect(dataGrid).toBeTruthy();
    });

    it('should have the five columns Icon, Name, Description, Category, Created by', () => {
      let columns = fixture.debugElement.queryAll(By.css('.table__heading'));
      expect(columns.length).toEqual(7);

      expect(columns[0].nativeElement.innerText.trim()).toEqual('ICON_MANAGEMENT.ICON');
      expect(columns[1].nativeElement.innerText.trim()).toEqual('ICON_MANAGEMENT.NAME');
      expect(columns[2].nativeElement.innerText.trim()).toEqual('ICON_MANAGEMENT.DESCRIPTION');
      expect(columns[3].nativeElement.innerText.trim()).toEqual('ICON_MANAGEMENT.CATEGORY');
      expect(columns[4].nativeElement.innerText.trim()).toEqual('ICON_MANAGEMENT.CREATEDBY');

      expect(columns[0].nativeElement.classList).not.toContain('table__heading--sortable');
      expect(columns[1].nativeElement.classList).toContain('table__heading--sortable');
      expect(columns[2].nativeElement.classList).not.toContain('table__heading--sortable');
      expect(columns[3].nativeElement.classList).toContain('table__heading--sortable');
      expect(columns[4].nativeElement.classList).toContain('table__heading--sortable');

    });



    it('should have View, Update, Remove actions', (() => {

      let items: Array<AeDataTableAction> = component.actions.toArray();
      expect(items.length).toEqual(3);
      expect(CommonTestHelper.hasGivenButton(items, 'view')
        && CommonTestHelper.hasGivenButton(items, 'update')
        && CommonTestHelper.hasGivenButton(items, 'remove')
      ).toBeTruthy();
    }));

    describe('Verify update action', () => {
      beforeEach(() => {
        let selectedIcon: Icon = IconManagementMockStoreProviderFactory.getIcon();
        store.dispatch(new LoadIconCompleteAction(selectedIcon));
      });
      it('should open icon update when clicked on update acion', fakeAsync(() => {
        let iconActions: Array<AeDataTableAction> = component.actions.toArray();
        let mockHazardIcons = IconManagementMockStoreProviderFactory.GetMockHazardIconsList();
        iconActions[1].command.next(mockHazardIcons.HazardsOrControlsList.get(0));
        tick();
        fixture.detectChanges();
        let updateIconForm = fixture.debugElement.query(By.css('#icon-add-update'));
        expect(updateIconForm).toBeDefined();
      }));
    });
    
    it('should open view slideout when view action clicked', fakeAsync(() => {
      let selectedHazard = IconManagementMockStoreProviderFactory.GetMockHazardIconsList().HazardsOrControlsList.toArray()[0];
      component.viewDocumentCommand.next(selectedHazard);
      fixture.detectChanges();
      tick(1000);
      expect(component.showDetails).toBe(true);
    }));

    it('should remove dialog open when remove action clicked', fakeAsync(() => {
      let selectedHazard = IconManagementMockStoreProviderFactory.GetMockHazardIconsList().HazardsOrControlsList.toArray()[0];
      removeAction.command.next(selectedHazard);
      fixture.debugElement.triggerEventHandler('click', null);
      fixture.detectChanges();
      tick();
      expect(component.showRemoveIconDialog).toBe(true);
    }))

    describe('remove dialog hazard', () => {
      beforeEach(() => {
        let selectedHazard = IconManagementMockStoreProviderFactory.GetMockHazardIconsList().HazardsOrControlsList.toArray()[0];
        removeAction.command.next(selectedHazard);
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
      })

      it('remove dialog popup header text should be dispalyed correctly', fakeAsync(() => {
        let removeDialogDialogDivElements = fixture.debugElement.queryAll(By.css('#icon-management-list_removeDialog_1 .modal-dialog-header')) as DebugElement[];
        let headerElementContent = removeDialogDialogDivElements[0].nativeElement.textContent.trim();
        tick();
        expect(headerElementContent).toContain('ICON_MANAGEMENT.REMOVE_ICON.Heading_text');
      }))

      it('remove dialog body text should displayed correctly', fakeAsync(() => {
        let removeDialogDialogDivElements = fixture.debugElement.queryAll(By.css('#icon-management-list_removeDialog_1 .modal-dialog-body')) as DebugElement[];
        let bodyElementContent = removeDialogDialogDivElements[0].nativeElement.textContent.trim();
        tick();
        expect(bodyElementContent).toContain('ICON_MANAGEMENT.REMOVE_ICON.Info');
      }));

      it('remove dialog footer buttons should be displayed correctly', fakeAsync(() => {
        let removeDialogDialogDivElements = fixture.debugElement.queryAll(By.css('#icon-management-list_removeDialog_1 .modal-dialog-footer button')) as DebugElement[];
        let removeDialogNoButtonContent = removeDialogDialogDivElements[0].nativeElement.textContent.trim();
        let removeDialogYesButtonContent = removeDialogDialogDivElements[1].nativeElement.textContent.trim();
        expect(removeDialogNoButtonContent).toContain('ICON_MANAGEMENT.REMOVE_ICON.Btn_No');
        expect(removeDialogYesButtonContent).toContain('ICON_MANAGEMENT.REMOVE_ICON.Btn_Yes');
      }))

      it('should remove dialog dispatch remove icon action when yes button click', fakeAsync(() => {
        spyOn(component, 'removeIcon');
        let removeDialogYesElement = fixture.debugElement.query(By.css('#icon-management-list_ConfirmYes_1_aeButton_1')).nativeElement;
        removeDialogYesElement.click();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        tick();
        expect(component.removeIcon).toHaveBeenCalled();
      }))

      it('should remove dialog close when header cancel click', fakeAsync(() => {
        let removeDialogHedaerCancelElement = fixture.debugElement.query(By.css('#close')).nativeElement;
        removeDialogHedaerCancelElement.click();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        tick();
        expect(component.showRemoveIconDialog).toBe(false);
      }))

      it('should remove dialog close when no button clicked', fakeAsync(() => {
        let removeDialogCancelElement = fixture.debugElement.query(By.css('#icon-management-list_ConfirmNo_1_aeButton_1')).nativeElement;
        removeDialogCancelElement.click();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        tick();
        expect(component.showRemoveIconDialog).toBe(false);
      }));
    });
   

    it('by default bulk remove button should be disabled', fakeAsync(() => {
      let bulkRemoveButtonElement = fixture.debugElement.query(By.css('#icon-management-list_bulkRemove_1_aeButton_1')).nativeElement;
      tick();
      expect(bulkRemoveButtonElement.disabled).toBe(true);
    }));

    it('bulk remove button should be enabled on selected rows count is greater than zero', fakeAsync(() => {
      let bulkRemoveButtonElement = fixture.debugElement.query(By.css('#icon-management-list_bulkRemove_1_aeButton_1')).nativeElement;
      let checkedRows: Array<string> = ['3ce19d3a-404e-4852-8ccb-9ad762e8c1c2', '19c2bc7c-e597-4438-8b89-dd12f228604f'];
      component.onSelectedRows(checkedRows);
      fixture.debugElement.triggerEventHandler('click', null);
      fixture.detectChanges();
      tick();
      expect(bulkRemoveButtonElement.disabled).toBe(false);
    }));


    describe('bulk remove dialog hazard', () => {
      beforeEach(() => {
        let checkedRows: Array<string> = ['3ce19d3a-404e-4852-8ccb-9ad762e8c1c2', '19c2bc7c-e597-4438-8b89-dd12f228604f'];
        let bulkRemoveButtonElement = fixture.debugElement.query(By.css('#icon-management-list_bulkRemove_1_aeButton_1')).nativeElement;
        component.onSelectedRows(checkedRows);
        component.bulkRowsRemoveClick();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
      })

      it('remove dialog popup header text should be dispalyed correctly', fakeAsync(() => {
        let removeDialogDialogDivElements = fixture.debugElement.queryAll(By.css('#icon-management-list_removeDialog_2 .modal-dialog-header')) as DebugElement[];
        let headerElementContent = removeDialogDialogDivElements[0].nativeElement.textContent.trim();
        tick();
        expect(headerElementContent).toContain('ICON_MANAGEMENT.BULK_REMOVE_ICON.Heading_text');
      }))

      it('remove dialog body text should displayed correctly', fakeAsync(() => {
        let removeDialogDialogDivElements = fixture.debugElement.queryAll(By.css('#icon-management-list_removeDialog_2 .modal-dialog-body')) as DebugElement[];
        let bodyElementContent = removeDialogDialogDivElements[0].nativeElement.textContent.trim();
        tick();
        expect(bodyElementContent).toContain('ICON_MANAGEMENT.BULK_REMOVE_ICON.Info');
      }));

      it('remove dialog footer buttons should be displayed correctly', fakeAsync(() => {
        let removeDialogDialogDivElements = fixture.debugElement.queryAll(By.css('#icon-management-list_removeDialog_2 .modal-dialog-footer button')) as DebugElement[];
        let removeDialogNoButtonContent = removeDialogDialogDivElements[0].nativeElement.textContent.trim();
        let removeDialogYesButtonContent = removeDialogDialogDivElements[1].nativeElement.textContent.trim();
        expect(removeDialogNoButtonContent).toContain('ICON_MANAGEMENT.BULK_REMOVE_ICON.Btn_No');
        expect(removeDialogYesButtonContent).toContain('ICON_MANAGEMENT.BULK_REMOVE_ICON.Btn_Yes');
      }))

      it('should bulk remove dialog dispatch remove icon action when yes button click', fakeAsync(() => {
        spyOn(component, 'bulkRemoveIcons');
        let removeDialogYesElement = fixture.debugElement.query(By.css('#icon-management-list_ConfirmYes_2_aeButton_1')).nativeElement;
        removeDialogYesElement.click();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        tick();
        expect(component.bulkRemoveIcons).toHaveBeenCalled();
      }))

      it('should bulk remove dialog close when header cancel click', fakeAsync(() => {
        let removeDialogHedaerCancelElement = fixture.debugElement.query(By.css('#close')).nativeElement;
        removeDialogHedaerCancelElement.click();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        tick();
        expect(component.showBulkRemoveIconDialog).toBe(false);
      }))

      it('should bulk remove dialog close when no button clicked', fakeAsync(() => {
        let removeDialogCancelElement = fixture.debugElement.query(By.css('#icon-management-list_ConfirmNo_2_aeButton_1')).nativeElement;
        removeDialogCancelElement.click();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        tick();
        expect(component.showBulkRemoveIconDialog).toBe(false);
      }));

    })
  });

});

describe('Icon Management Controls List', () => {
  let component: IconManagementListComponent;
  let fixture: ComponentFixture<IconManagementListComponent>;
  let store: Store<fromRoot.State>;
  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any
  let routeParamsStub: any;
  let http: any;
  let actions: Immutable.List<AeDataTableAction>;
  let removeAction: AeDataTableAction;
  let dispatchSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IconManagementListComponent
        , IconManagementViewComponent
        , IconAddUpdateComponent
      ],
      imports: [
        AtlasElementsModule
        , LocalizationModule
        , StoreModule.provideStore(reducer)
        , ReactiveFormsModule
        , NoopAnimationsModule
        , BrowserAnimationsModule
        , AtlasSharedModule

      ],
      providers: [
        InjectorRef
        , BreadcrumbService
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ActivatedRoute, useValue: { snapshot: { url: [{ path: 'controls' }] } } }
        , { provide: RouteParams, useClass: RouteParamsMock }
        , { provide: Http, useValue: mockHttpProvider }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: RestClientService, useClass: RestClientServiceStub }
        , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
        , { provide: AuthorizationService, useClass: AuthorizationServiceStub }
        , FormBuilderService
        , FileUploadService

      ]
    })
      .overrideComponent(IconManagementListComponent, { set: { host: { "(click)": "dummy" } } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconManagementListComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);

    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    routerMock = fixture.debugElement.injector.get(Router);
    activatedRouteStub = TestBed.get(ActivatedRoute);
    routeParamsStub = fixture.debugElement.injector.get(RouteParams);
    http = fixture.debugElement.injector.get(Http);
    component.ngOnInit();
    actions = component.actions;
    removeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'Remove');
    dispatchSpy = spyOn(store, 'dispatch');

    fixture.detectChanges();

  });

  it('should launch component', () => {
    expect(component).toBeTruthy();
  });

  it('Should have 2 filters', (() => {
    let filters = fixture.debugElement.nativeElement.getElementsByClassName('filter-bar__filter');
    expect(filters.length).toEqual(2);
  }));

  it('Default category filter should be all categories', (() => {
    let aeInput = fixture.debugElement.query(By.css('#icon-management-list_AeSelect_1')).nativeElement;
    expect(aeInput.selectedValue).toBeUndefined();
  }));


  it('Verify place holder in search by control name filter', (() => {
    let aeInput = fixture.debugElement.query(By.css('#icon-management-list_AeInput_1')).nativeElement;
    expect(aeInput).toBeDefined();
    expect(aeInput.placeholder).toEqual("ICON_MANAGEMENT.SEARCH_CONTROLS_TEXT");

  }));

  it('Should have 6 options in category dropdown', (() => {
    let aeInput = fixture.debugElement.query(By.css('#icon-management-list_AeSelect_1')).nativeElement;
    expect(aeInput.childElementCount).toEqual(6);
  }));

  it('It should have page change and sort options', (() => {
    let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
    let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
    let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
    expect(sortEvent).toBeDefined();
    expect(pageChangeEvent).toBeDefined();
  }));

  it('When category filter is changed, it should filter the list by category', fakeAsync(() => {
    let currentRequest = component.iconsApiRequest;
    let categoryControl = fixture.debugElement.query(By.css('#icon-management-list_AeSelect_1'));
    let typeOfControl = categoryControl instanceof HTMLSelectElement;

    expect(categoryControl.componentInstance.constructor.name).toEqual('AeSelectComponent');
    let objValue = { target: { value: '0' } };
    categoryControl.triggerEventHandler('change', objValue);
    dispatchSpy.and.callThrough();
    fixture.detectChanges();
    tick(200);
    currentRequest.Params = addOrUpdateAtlasParamValue(currentRequest.Params, 'category', '0');
    let loadHazardsOrControlsListAction: LoadHazardsOrControlsListAction = (new LoadHazardsOrControlsListAction(currentRequest));
    expect(dispatchSpy).toHaveBeenCalledWith(loadHazardsOrControlsListAction);
  }));


  it('When name filter is changed, it should filter the list by name', fakeAsync(() => {
    let currentRequest = component.iconsApiRequest;
    let nameControl = fixture.debugElement.query(By.css('#icon-management-list_AeInput_1'));
    let typeOfControl = nameControl instanceof HTMLInputElement;

    expect(nameControl.componentInstance.constructor.name).toEqual('AeInputComponent');
    let objValue = { target: { value: 'test' } };

    nameControl.triggerEventHandler('input', objValue);
    fixture.detectChanges();
    tick(200);
    currentRequest.Params = addOrUpdateAtlasParamValue(currentRequest.Params, 'searchText', 'test');
    let loadHazardsOrControlsListAction: LoadHazardsOrControlsListAction = (new LoadHazardsOrControlsListAction(currentRequest));
    expect(dispatchSpy).toHaveBeenCalledWith(loadHazardsOrControlsListAction);
  }));


  describe('verify data grid', () => {

    beforeEach(() => {
      let mockHazardIcons = IconManagementMockStoreProviderFactory.GetMockControlIconsList();
      dispatchSpy.and.callThrough();

      store.dispatch(new LoadHazardsOrControlsListCompleteAction({ HazardsOrControlsList: mockHazardIcons.HazardsOrControlsList, HazardsOrControlsListPagingInfo: mockHazardIcons.HazardsOrControlsListPagingInfo }));

      fixture.detectChanges();
    });


    it('should have a data grid', () => {
      let dataGrid = fixture.debugElement.query(By.directive(AeDatatableComponent));
      expect(dataGrid).toBeTruthy();
    });

    it('should have the five columns Icon, Name, Description, Category, Created by', () => {
      let columns = fixture.debugElement.queryAll(By.css('.table__heading'));
      expect(columns.length).toEqual(7);

      expect(columns[0].nativeElement.innerText.trim()).toEqual('ICON_MANAGEMENT.ICON');
      expect(columns[1].nativeElement.innerText.trim()).toEqual('ICON_MANAGEMENT.NAME');
      expect(columns[2].nativeElement.innerText.trim()).toEqual('ICON_MANAGEMENT.DESCRIPTION');
      expect(columns[3].nativeElement.innerText.trim()).toEqual('ICON_MANAGEMENT.CATEGORY');
      expect(columns[4].nativeElement.innerText.trim()).toEqual('ICON_MANAGEMENT.CREATEDBY');

      expect(columns[0].nativeElement.classList).not.toContain('table__heading--sortable');
      expect(columns[1].nativeElement.classList).toContain('table__heading--sortable');
      expect(columns[2].nativeElement.classList).not.toContain('table__heading--sortable');
      expect(columns[3].nativeElement.classList).toContain('table__heading--sortable');
      expect(columns[4].nativeElement.classList).toContain('table__heading--sortable');

    });

    it('should have View, Update, Remove actions', (() => {

      let items: Array<AeDataTableAction> = component.actions.toArray();
      expect(items.length).toEqual(3);
      expect(CommonTestHelper.hasGivenButton(items, 'view')
        && CommonTestHelper.hasGivenButton(items, 'update')
        && CommonTestHelper.hasGivenButton(items, 'remove')
      ).toBeTruthy();
    }));
    describe('Verify update action', () => {
      beforeEach(() => {
        let selectedIcon: Icon = IconManagementMockStoreProviderFactory.getIcon();
        store.dispatch(new LoadIconCompleteAction(selectedIcon));
      });
      it('should open icon update when cliced on update acion', fakeAsync(() => {
        let iconActions: Array<AeDataTableAction> = component.actions.toArray();
        let mockHazardIcons = IconManagementMockStoreProviderFactory.GetMockHazardIconsList();
        iconActions[1].command.next(mockHazardIcons.HazardsOrControlsList.get(0));
        tick();
        fixture.detectChanges();
        let updateIconForm = fixture.debugElement.query(By.css('#icon-add-update'));
        expect(updateIconForm).toBeDefined();
      }));
    });

    it('should open view slideout when view action clicked', fakeAsync(() => {
      let selectedHazard = IconManagementMockStoreProviderFactory.GetMockHazardIconsList().HazardsOrControlsList.toArray()[0];
      component.viewDocumentCommand.next(selectedHazard);
      tick(1000);
      fixture.detectChanges();
      expect(component.showDetails).toBe(true);
    }));

    it('should remove dialog open when remove action clicked', fakeAsync(() => {
      let selectedControl = IconManagementMockStoreProviderFactory.GetMockControlIconsList().HazardsOrControlsList.toArray()[0];
      removeAction.command.next(selectedControl);
      fixture.debugElement.triggerEventHandler('click', null);
      fixture.detectChanges();
      tick();
      expect(component.showRemoveIconDialog).toBe(true);
    }))

    describe('remove dialog control', () => {
      beforeEach(() => {
        let selectedControl = IconManagementMockStoreProviderFactory.GetMockControlIconsList().HazardsOrControlsList.toArray()[0];
        removeAction.command.next(selectedControl);
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
      })

      it('remove dialog popup header text should be dispalyed correctly', fakeAsync(() => {
        let removeDialogDialogDivElements = fixture.debugElement.queryAll(By.css('#icon-management-list_removeDialog_1 .modal-dialog-header')) as DebugElement[];
        let headerElementContent = removeDialogDialogDivElements[0].nativeElement.textContent.trim();
        tick();
        expect(headerElementContent).toContain('ICON_MANAGEMENT.REMOVE_ICON.Heading_text');
      }))

      it('remove dialog body text should displayed correctly', fakeAsync(() => {
        let removeDialogDialogDivElements = fixture.debugElement.queryAll(By.css('#icon-management-list_removeDialog_1 .modal-dialog-body')) as DebugElement[];
        let bodyElementContent = removeDialogDialogDivElements[0].nativeElement.textContent.trim();
        tick();
        expect(bodyElementContent).toContain('ICON_MANAGEMENT.REMOVE_ICON.Info');
      }));

      it('remove dialog footer buttons should be displayed correctly', fakeAsync(() => {
        let removeDialogDialogDivElements = fixture.debugElement.queryAll(By.css('#icon-management-list_removeDialog_1 .modal-dialog-footer button')) as DebugElement[];
        let removeDialogNoButtonContent = removeDialogDialogDivElements[0].nativeElement.textContent.trim();
        let removeDialogYesButtonContent = removeDialogDialogDivElements[1].nativeElement.textContent.trim();
        expect(removeDialogNoButtonContent).toContain('ICON_MANAGEMENT.REMOVE_ICON.Btn_No');
        expect(removeDialogYesButtonContent).toContain('ICON_MANAGEMENT.REMOVE_ICON.Btn_Yes');
      }))

      it('should remove dialog dispatch remove icon action when yes button click', fakeAsync(() => {
        spyOn(component, 'removeIcon');
        let removeDialogYesElement = fixture.debugElement.query(By.css('#icon-management-list_ConfirmYes_1_aeButton_1')).nativeElement;
        removeDialogYesElement.click();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        tick();
        expect(component.showBulkRemoveIconDialog).toBe(false);
        expect(component.removeIcon).toHaveBeenCalled();
      }))

      it('should remove dialog close when header cancel click', fakeAsync(() => {
        let removeDialogHedaerCancelElement = fixture.debugElement.query(By.css('#close')).nativeElement;
        removeDialogHedaerCancelElement.click();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        tick();
        expect(component.showBulkRemoveIconDialog).toBe(false);
      }))

      it('should remove dialog close when no button clicked', fakeAsync(() => {
        let removeDialogCancelElement = fixture.debugElement.query(By.css('#icon-management-list_ConfirmNo_1_aeButton_1')).nativeElement;
        removeDialogCancelElement.click();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        tick();
        expect(component.showBulkRemoveIconDialog).toBe(false);
      }));

    })

    it('by default bulk remove button should be disabled', fakeAsync(() => {
      let bulkRemoveButtonElement = fixture.debugElement.query(By.css('#icon-management-list_bulkRemove_1_aeButton_1')).nativeElement;
      tick();
      expect(bulkRemoveButtonElement.disabled).toBe(true);
    }));

    it('bulk remove button should be enabled on selected rows count is greater than zero', fakeAsync(() => {
      let bulkRemoveButtonElement = fixture.debugElement.query(By.css('#icon-management-list_bulkRemove_1_aeButton_1')).nativeElement;
      let checkedRows: Array<string> = ['3ce19d3a-404e-4852-8ccb-9ad762e8c1c2', '19c2bc7c-e597-4438-8b89-dd12f228604f'];
      component.onSelectedRows(checkedRows);
      fixture.debugElement.triggerEventHandler('click', null);
      fixture.detectChanges();
      tick();
      expect(bulkRemoveButtonElement.disabled).toBe(false);
    }));


    describe('bulk remove dialog hazard', () => {
      beforeEach(() => {
        let checkedRows: Array<string> = ['3ce19d3a-404e-4852-8ccb-9ad762e8c1c2', '19c2bc7c-e597-4438-8b89-dd12f228604f'];
        let bulkRemoveButtonElement = fixture.debugElement.query(By.css('#icon-management-list_bulkRemove_1_aeButton_1')).nativeElement;
        component.onSelectedRows(checkedRows);
        component.bulkRowsRemoveClick();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
      })

      it('remove dialog popup header text should be dispalyed correctly', fakeAsync(() => {
        let removeDialogDialogDivElements = fixture.debugElement.queryAll(By.css('#icon-management-list_removeDialog_2 .modal-dialog-header')) as DebugElement[];
        let headerElementContent = removeDialogDialogDivElements[0].nativeElement.textContent.trim();
        tick();
        expect(headerElementContent).toContain('ICON_MANAGEMENT.BULK_REMOVE_ICON.Heading_text');
      }))

      it('remove dialog body text should displayed correctly', fakeAsync(() => {
        let removeDialogDialogDivElements = fixture.debugElement.queryAll(By.css('#icon-management-list_removeDialog_2 .modal-dialog-body')) as DebugElement[];
        let bodyElementContent = removeDialogDialogDivElements[0].nativeElement.textContent.trim();
        tick();
        expect(bodyElementContent).toContain('ICON_MANAGEMENT.BULK_REMOVE_ICON.Info');
      }));

      it('remove dialog footer buttons should be displayed correctly', fakeAsync(() => {
        let removeDialogDialogDivElements = fixture.debugElement.queryAll(By.css('#icon-management-list_removeDialog_2 .modal-dialog-footer button')) as DebugElement[];
        let removeDialogNoButtonContent = removeDialogDialogDivElements[0].nativeElement.textContent.trim();
        let removeDialogYesButtonContent = removeDialogDialogDivElements[1].nativeElement.textContent.trim();
        expect(removeDialogNoButtonContent).toContain('ICON_MANAGEMENT.BULK_REMOVE_ICON.Btn_No');
        expect(removeDialogYesButtonContent).toContain('ICON_MANAGEMENT.BULK_REMOVE_ICON.Btn_Yes');
      }))

      it('should bulk remove dialog dispatch remove icon action when yes button click', fakeAsync(() => {
        spyOn(component, 'bulkRemoveIcons');
        let removeDialogYesElement = fixture.debugElement.query(By.css('#icon-management-list_ConfirmYes_2_aeButton_1')).nativeElement;
        removeDialogYesElement.click();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        tick();
        expect(component.bulkRemoveIcons).toHaveBeenCalled();
      }))

      it('should bulk remove dialog close when header cancel click', fakeAsync(() => {
        let removeDialogHedaerCancelElement = fixture.debugElement.query(By.css('#close')).nativeElement;
        removeDialogHedaerCancelElement.click();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        tick();
        expect(component.showBulkRemoveIconDialog).toBe(false);
      }))

      it('should bulk remove dialog close when no button clicked', fakeAsync(() => {
        let removeDialogCancelElement = fixture.debugElement.query(By.css('#icon-management-list_ConfirmNo_2_aeButton_1')).nativeElement;
        removeDialogCancelElement.click();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        tick();
        expect(component.showBulkRemoveIconDialog).toBe(false);
      }));

    })

  });

});