import { AeModalDialogComponent } from './../../../../atlas-elements/ae-modal-dialog/ae-modal-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilderService } from './../../../../shared/services/form-builder.service';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { EventListener } from '@angular/core/src/debug/debug_node';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { extractDataTableOptions } from './../../../../shared/helpers/extract-helpers';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { MockStoreProviderFactory } from './../../../../shared/testing/mocks/mock-store-provider-factory';
import { addOrUpdateAtlasParamValue } from '../../../../root-module/common/extract-helpers';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { CommonTestHelper } from './../../../../shared/testing/helpers/common-test-helper';
import { AeDataTableAction } from './../../../../atlas-elements/common/models/ae-data-table-action';
import { AtlasApiRequestWithParams, AtlasApiResponse, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { ActivatedRouteStub } from './../../../../shared/testing/mocks/activated-route-stub';
import { Router, ActivatedRoute, UrlSegment, NavigationExtras } from '@angular/router';
import { LocalizationConfigStub } from './../../../../shared/testing/mocks/localization-config-stub';
import { TranslationServiceStub } from './../../../../shared/testing/mocks/translation-service-stub';
import { LocaleServiceStub } from './../../../../shared/testing/mocks/locale-service-stub';
import { RouteParams } from './../../../../shared/services/route-params';
import { RouteParamsMock } from './../../../../shared/testing/mocks/route-params-mock';
import { ClaimsHelperServiceStub } from './../../../../shared/testing/mocks/claims-helper-service-mock';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { BreadcrumbServiceStub } from './../../../../shared/testing/mocks/breadcrumb-service-mock';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { routes } from './../../procedure.routes';
import { LocalizationConfig } from './../../../../shared/localization-config';
import { AtlasSharedModule } from './../../../../shared/atlas-shared.module';
import {
  InjectorRef,
  LocaleConfig,
  LocaleService,
  LocaleStorage,
  LocalizationModule,
  TranslationConfig,
  TranslationService,
  TranslationProvider,
  TranslationHandler,
} from 'angular-l10n';
import { RouterModule, RouterOutletMap } from '@angular/router';
import { AtlasElementsModule } from './../../../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterMock } from './../../../../shared/testing/mocks/router-stub';
import { reducer } from '../../../../shared/reducers/index';
import { Action, ActionReducer, StoreModule, Store } from '@ngrx/store';
import * as fromRoot from '../../../../shared/reducers';
import * as Immutable from 'immutable';
import { ProcedureListComponent } from './procedure-list.component';
import { ProceduresContainerComponent } from '../../containers/procedures-container/procedures-container.component';
import { ProcedureAddUpdateComponent } from './../../components/procedure-add-update/procedure-add-update.component';
import { ProcedureViewComponent } from './../../components/procedure-view/procedure-view.component';
import { ProcedureCopyComponent } from './../../components/procedure-copy/procedure-copy.component';
import { ProcedureService } from '../../services/procedure.service';
import { RouterOutletMapStub } from '../../../../shared/testing/mocks/router-outlet-stub';
import { LocationStrategyStub } from './../../../../shared/testing/mocks/location-strategy-stub';
import { RestClientService } from '../../../../shared/data/rest-client.service';
import { RestClientServiceStub } from '../../../../shared/testing/mocks/rest-client-service-stub';
import { Procedure } from '../../../procedures/models/procedure';
import {
  LoadProceduresCompleteAction
  , CopyProcedureAction
  , LoadProcedureByIdCompleteAction,
  RemoveProcedureAction,
  LoadProceduresAction
} from '../../../procedures/actions/procedure-actions';
import { LoadProcedureGroupAction, LoadProcedureGroupCompleteAction } from '../../../../shared/actions/lookup.actions';
import { ProcedureGroup } from '../../../../shared/models/proceduregroup';

let store: Store<fromRoot.State>;
let selectedProcedure: Procedure;
let selectedProcedureCopy: Procedure;
let selectedProcedureFullEntity: Procedure;
let assertFun = function (columnDivs: DebugElement[]
  , columnIndex: number
  , columnNameKey: string
  , sortKey: string) {
  let divHeader = columnDivs[columnIndex];
  let spanHeader: HTMLSpanElement = divHeader.query(By.css('span')).nativeElement;
  expect(spanHeader.innerHTML).toEqual(columnNameKey);
  let divHeaderNative = <HTMLDivElement>divHeader.nativeElement;
  expect(divHeaderNative.classList).toContain('js-sortable');
  let divDataAttr: HTMLDivElement = divHeader.query(By.css('div')).nativeElement;
  let att: NamedNodeMap = divDataAttr.attributes;
  expect((att.getNamedItem('data-sortable').value).trim()).toEqual('true');
  expect(att.getNamedItem('data-sortKey').value.toLowerCase()).toEqual(sortKey);
};

let viewAssertFun = function (component: ProcedureListComponent,
  procedure: Procedure,
  viewAction: AeDataTableAction,
  fixture: ComponentFixture<ProcedureListComponent>) {
  store.dispatch(new LoadProcedureByIdCompleteAction(selectedProcedureFullEntity));
  viewAction.command.next(procedure);
  tick(100);
  fixture.debugElement.triggerEventHandler('click', null);
  fixture.detectChanges();
  tick(100);
  expect(procedure).toEqual(component.selectedProcedure);
  expect(component.showProcedureViewSlideOut).toBeTruthy();
  let viewElement = fixture.debugElement.query(By.css('procedure-view')).nativeElement;
  expect(viewElement).not.toBeNull();
  tick(100);
  component.onProcedureSlideCancel({});
  fixture.debugElement.triggerEventHandler('click', null);
  fixture.detectChanges();
  tick(100);
  expect(component.showProcedureViewSlideOut).toBeFalsy();
};

let copyAssertFun = function (component: ProcedureListComponent
  , _selectedProcedure: Procedure
  , _selectedProcedureCopy: Procedure
  , copyAction: AeDataTableAction
  , dispatchSpy: jasmine.Spy
  , fixture: ComponentFixture<ProcedureListComponent>) {
  store.dispatch(new LoadProcedureByIdCompleteAction(selectedProcedureFullEntity));
  copyAction.command.next(_selectedProcedure);
  tick(100);
  fixture.debugElement.triggerEventHandler('click', null);
  fixture.detectChanges();
  tick(100);
  expect(_selectedProcedure).toEqual(component.selectedProcedure);
  expect(component.showProcedureCopySlideOut).toBeTruthy();
  // triggering the onCopied event
  component.onProcedureCopy(_selectedProcedureCopy);
  tick(100);
  fixture.detectChanges();
  tick(100);
  expect(dispatchSpy).toHaveBeenCalledWith(new CopyProcedureAction(selectedProcedureCopy));
  expect(component.showProcedureCopySlideOut).toBeFalsy();
  // triggering the close ms slide out event
  component.onProcedureSlideCancel({});
  tick(100);
  fixture.detectChanges();
  tick(100);
  expect(component.showProcedureCopySlideOut).toBeFalsy();
};

let removeAssertFun = function (component: ProcedureListComponent
  , _selectedProcedure: Procedure
  , removeAction: AeDataTableAction
  , dispatchSpy: jasmine.Spy
  , fixture: ComponentFixture<ProcedureListComponent>) {
  removeAction.command.next(_selectedProcedure);
  expect(_selectedProcedure).toEqual(component.selectedProcedure);
  expect(component.showProcedureDeleteModal).toBeTruthy();
  tick(100);
  fixture.debugElement.triggerEventHandler('click', null);
  fixture.detectChanges();
  tick(100);

  let msCopyForm = fixture.debugElement.query(By.css('#confirmModal')).nativeElement;
  expect(msCopyForm).not.toBeNull();
  //now trigger OK event and trigger cancel event and verify respective action related things are done

  let modalDialog = fixture.debugElement.query(By.css('ae-modal-dialog'));
  let yesButton = modalDialog.query(By.css('#confirmYes_aeButton_1'));
  let noButton = modalDialog.query(By.css('#confirmNo_aeButton_1'));
  tick(100);
  yesButton.triggerEventHandler('click', 'Yes');
  fixture.detectChanges();
  tick(100);
  //now 
  expect(component.showProcedureDeleteModal).toBeFalsy();
  expect(dispatchSpy).toHaveBeenCalledWith(new RemoveProcedureAction(_selectedProcedure));
  //now trigger NO button click and assert
  tick(100);
  noButton.triggerEventHandler("click", 'No');
  fixture.detectChanges();
  tick(100);
  expect(component.showProcedureDeleteModal).toBeFalsy();
};

let removeWithNoAssertFun = function (component: ProcedureListComponent
  , _selectedProcedure: Procedure
  , removeAction: AeDataTableAction
  , dispatchSpy: jasmine.Spy
  , fixture: ComponentFixture<ProcedureListComponent>) {
  removeAction.command.next(_selectedProcedure);
  expect(_selectedProcedure).toEqual(component.selectedProcedure);
  expect(component.showProcedureDeleteModal).toBeTruthy();

  tick(100);
  fixture.debugElement.triggerEventHandler('click', null);
  fixture.detectChanges();
  tick(100);

  let msCopyForm = fixture.debugElement.query(By.css('#confirmModal')).nativeElement;
  expect(msCopyForm).not.toBeNull();
  //now trigger OK event and trigger cancel event and verify respective action related things are done

  let modalDialog = fixture.debugElement.query(By.css('ae-modal-dialog'));
  let yesButton = modalDialog.query(By.css('#confirmYes_aeButton_1'));
  let noButton = modalDialog.query(By.css('#confirmNo_aeButton_1'));
  tick(100);
  noButton.triggerEventHandler('click', 'No');
  fixture.detectChanges();
  tick(100);
  expect(component.showProcedureDeleteModal).toBeFalsy();
  expect(dispatchSpy).not.toHaveBeenCalled();
};

let updateAssertFun = function (component: ProcedureListComponent
  , _selectedProcedure: Procedure
  , updatedAction: AeDataTableAction,
  fixture: ComponentFixture<ProcedureListComponent>) {
  store.dispatch(new LoadProcedureByIdCompleteAction(selectedProcedureFullEntity));
  updatedAction.command.next(_selectedProcedure);
  tick(100);
  fixture.debugElement.triggerEventHandler('click', null);
  fixture.detectChanges();
  tick(100);
  expect(_selectedProcedure).toEqual(component.selectedProcedure);
  expect(component.showProcedureUpdateSlideOut).toBeTruthy();
  let updateElement = fixture.debugElement.query(By.css('.procedure-add-update')).nativeElement;
  expect(updateElement).not.toBeNull();
  tick(100);
  component.onProcedureSlideCancel({});
  fixture.debugElement.triggerEventHandler('click', null);
  fixture.detectChanges();
  tick(100);
  expect(component.showProcedureUpdateSlideOut).toBeFalsy();
};


describe('ProcedureListComponent', () => {
  let component: ProcedureListComponent;
  let fixture: ComponentFixture<ProcedureListComponent>;
  let dispatchSpy: jasmine.Spy;
  let configLoaded: jasmine.Spy;
  let canCreateExampleProcedureSpy: jasmine.Spy;
  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any;
  let routeParamsStub: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        RouterModule.forChild(routes),
        LocalizationModule,
        AtlasSharedModule
        , StoreModule.provideStore(reducer)
        , NoopAnimationsModule
      ],
      declarations: [ProcedureListComponent
        , ProceduresContainerComponent
        , ProcedureAddUpdateComponent
        , ProcedureViewComponent
        , ProcedureCopyComponent],
      providers: [
        InjectorRef
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: RouteParams, useClass: RouteParamsMock }
        , { provide: RestClientService, useClass: RestClientServiceStub }
        , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
        , FormBuilderService
        , ProcedureService
      ]
    })
      .overrideComponent(ProcedureListComponent, { set: { host: { '(click)': 'dummy' } } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixture.detectChanges();
    store = fixture.debugElement.injector.get(Store);

    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    routerMock = fixture.debugElement.injector.get(Router);
    activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
    claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
    routeParamsStub = fixture.debugElement.injector.get(RouteParams);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
  });
  beforeEach(() => {
    dispatchSpy = spyOn(store, 'dispatch');
    canCreateExampleProcedureSpy = spyOn(claimsHelperServiceStub, 'cancreateExampleProcedures');
  });

  describe('Component launch', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
});

describe('Procedures List', () => {
  let component: ProcedureListComponent;
  let fixture: ComponentFixture<ProcedureListComponent>;
  let dispatchSpy: jasmine.Spy;
  let configLoaded: jasmine.Spy;
  let canCreateExampleProcedureSpy: jasmine.Spy;
  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any;
  let routeParamsStub: any;
  let actions: Immutable.List<AeDataTableAction>;
  let viewAction: AeDataTableAction;
  let updateAction: AeDataTableAction;
  let copyAction: AeDataTableAction;
  let removeAction: AeDataTableAction;
  let keys: Immutable.List<string>;
  let currentProcedureApiRequest: AtlasApiRequestWithParams;
  let columnDivs: DebugElement[];
  let mockedProceduresResponse: AtlasApiResponse<Procedure>;
  let mockedProcedureGroups: Array<ProcedureGroup>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        NoopAnimationsModule,
        RouterModule.forChild(routes),
        LocalizationModule,
        AtlasSharedModule
        , StoreModule.provideStore(reducer)
      ],
      declarations: [ProcedureListComponent
        , ProceduresContainerComponent
        , ProcedureAddUpdateComponent
        , ProcedureViewComponent
        , ProcedureCopyComponent],
      providers: [
        InjectorRef
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: RouteParams, useClass: RouteParamsMock }
        , { provide: RestClientService, useClass: RestClientServiceStub }
        , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
        , FormBuilderService
        , ProcedureService
      ]
    })
      .overrideComponent(ProcedureListComponent, { set: { host: { '(click)': 'dummy' } } })
      .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(ProcedureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = fixture.debugElement.injector.get(Store);
    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    routerMock = fixture.debugElement.injector.get(Router);
    activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
    claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
    routeParamsStub = fixture.debugElement.injector.get(RouteParams);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
    keys = component.keys;
    selectedProcedure = CommonTestHelper.prepareObjectWithGivenkeys(keys.toArray());
    let array: UrlSegment[] = [];
    array.push(new UrlSegment('method-statement/procedure/custom', null));
    (<ActivatedRouteStub>activatedRouteStub).url.next(array);
    currentProcedureApiRequest = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams('example', false)]);
    mockedProceduresResponse = MockStoreProviderFactory.getMSProceduresResponseData(false);
    mockedProcedureGroups = MockStoreProviderFactory.getProcedureGroupData();
    store.dispatch(new LoadProceduresCompleteAction(mockedProceduresResponse));
    store.dispatch(new LoadProcedureGroupAction());
    store.dispatch(new LoadProcedureGroupCompleteAction(mockedProcedureGroups));
    fixture.detectChanges();
    selectedProcedure = CommonTestHelper.copyObject(mockedProceduresResponse.Entities[0], selectedProcedure);
    selectedProcedureFullEntity = mockedProceduresResponse.Entities[0];
    selectedProcedureCopy = CommonTestHelper.prepareObjectWithGivenkeys(keys.toArray());
    Object.assign(selectedProcedureCopy, selectedProcedure);
    tick(300);
    fixture.detectChanges();
  }));
  beforeEach(() => {
    dispatchSpy = spyOn(store, 'dispatch');
    dispatchSpy.and.callThrough();
    let tbdElement = fixture.debugElement.query(By.css('#procedureTable_divBody_0'));
    columnDivs = tbdElement.queryAll(By.css('.table__heading'));
    actions = component.actions;
    viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
    copyAction = CommonTestHelper.getGivenButton(actions.toArray(), 'copy');
    removeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'remove');
    updateAction = CommonTestHelper.getGivenButton(actions.toArray(), 'update');
  });

  describe('Procedures table should have the following columns:', () => {
    it('Name,Group,Actions with sort options', () => {
      assertFun(columnDivs, 0, 'PROCEDURE_NAME', 'name');
      assertFun(columnDivs, 1, 'GROUP', 'proceduregroupname');
    });

    it('Should display the records', () => {
      let tblItemElements = fixture.debugElement.queryAll(By.css('.table__row'));
      expect(mockedProceduresResponse.Entities.length).toEqual(tblItemElements.length);
    });
    it('Should display pagination and row selector', () => {
      let paginationElememnt = fixture.debugElement.queryAll(By.css('#procedureTable_AePagination_1'));
      expect(paginationElememnt).not.toBeUndefined();
    });
  });

  describe('Taking actions on a Procedure:', () => {
    it('Select a Procedure and then the Action of View', fakeAsync(() => {
      viewAssertFun(component, selectedProcedure, viewAction, fixture);
    }));
    it('Select a Procedure and then the Action of Copy', fakeAsync(() => {
      copyAssertFun(component, selectedProcedure, selectedProcedureCopy, copyAction, dispatchSpy, fixture);
    }));
    it('Select a Procedure and then the Action of Remove, a Remove Procedure Confirmation message will be displayed, when yes its removed', fakeAsync(() => {
      removeAssertFun(component, selectedProcedure, removeAction, dispatchSpy, fixture);
    }));

    it('Select a Procedure and then the Action of Remove, a Remove Procedure Confirmation message will be displayed, when no its not removed', fakeAsync(() => {
      removeWithNoAssertFun(component, selectedProcedure, removeAction, dispatchSpy, fixture);
    }));
    it('Select a Procedure and then the Action of Remove, the Procedure will open in edit mode.', fakeAsync(() => {
      updateAssertFun(component, selectedProcedure, updateAction, fixture);
    }));
  });
  describe('Procedures - filter by procedure groups', () => {
    it('Should have procedures filter with valid procedure groups', fakeAsync(() => {
      tick();
      fixture.debugElement.triggerEventHandler('click', null);
      fixture.detectChanges();
      tick();
      let filterElement = fixture.debugElement.query(By.css('#ddlProcedureGroup'));
      expect(filterElement).not.toBeNull();
    }));
    it('Should be able to filter by selected option', fakeAsync(() => {
      tick();
      let selectedFilterValue = mockedProcedureGroups[0].Id;
      currentProcedureApiRequest.PageNumber = 1;
      currentProcedureApiRequest.Params = addOrUpdateAtlasParamValue(currentProcedureApiRequest.Params
        , 'ProcedureGroup', selectedFilterValue);
      component.procedureListForm.get('proceduregroup').setValue(selectedFilterValue);
      store.dispatch(new LoadProceduresCompleteAction(mockedProceduresResponse));
      fixture.detectChanges();
      tick();
      expect(dispatchSpy).toHaveBeenCalledWith(new LoadProceduresAction(currentProcedureApiRequest));
    }));
  });

  describe('Procedures - Should be able to filter data by page size and page number', () => {
    it('Should load data by selected page size', fakeAsync(() => {
      tick();
      let pageSize = 20;
      let pageNumber = 1;
      currentProcedureApiRequest.PageNumber = pageNumber;
      currentProcedureApiRequest.PageSize = pageSize;
      component.onPageChange({ pageNumber: pageNumber, noOfRows: pageSize });
      store.dispatch(new LoadProceduresCompleteAction(mockedProceduresResponse));
      fixture.detectChanges();
      tick();
      expect(dispatchSpy).toHaveBeenCalledWith(new LoadProceduresAction(currentProcedureApiRequest));
    }));
    it('Should load data by selected page number', fakeAsync(() => {
      tick();
      let pageSize = 10;
      let pageNumber = 2;
      currentProcedureApiRequest.PageNumber = pageNumber;
      currentProcedureApiRequest.PageSize = pageSize;
      component.onPageChange({ pageNumber: pageNumber, noOfRows: pageSize });
      store.dispatch(new LoadProceduresCompleteAction(mockedProceduresResponse));
      fixture.detectChanges();
      tick();
      expect(dispatchSpy).toHaveBeenCalledWith(new LoadProceduresAction(currentProcedureApiRequest));
    }));
  });
});


describe('Example Procedures List', () => {
  let component: ProcedureListComponent;
  let fixture: ComponentFixture<ProcedureListComponent>;
  let dispatchSpy: jasmine.Spy;
  let configLoaded: jasmine.Spy;
  let canCreateExampleProcedureSpy: jasmine.Spy;
  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any;
  let routeParamsStub: any;
  let actions: Immutable.List<AeDataTableAction>;
  let viewAction: AeDataTableAction;
  let updateAction: AeDataTableAction;
  let copyAction: AeDataTableAction;
  let removeAction: AeDataTableAction;
  let keys: Immutable.List<string>;
  let currentProcedureApiRequest: AtlasApiRequestWithParams;
  let columnDivs: DebugElement[];
  let mockedProceduresResponse: AtlasApiResponse<Procedure>;
  let mockedProcedureGroups: Array<ProcedureGroup>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        NoopAnimationsModule,
        RouterModule.forChild(routes),
        LocalizationModule,
        AtlasSharedModule
        , StoreModule.provideStore(reducer)
      ],
      declarations: [ProcedureListComponent
        , ProceduresContainerComponent
        , ProcedureAddUpdateComponent
        , ProcedureViewComponent
        , ProcedureCopyComponent],
      providers: [
        InjectorRef
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: RouteParams, useClass: RouteParamsMock }
        , { provide: RestClientService, useClass: RestClientServiceStub }
        , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
        , FormBuilderService
        , ProcedureService
      ]
    })
      .overrideComponent(ProcedureListComponent, { set: { host: { '(click)': 'dummy' } } })
      .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(ProcedureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = fixture.debugElement.injector.get(Store);
    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    routerMock = fixture.debugElement.injector.get(Router);
    activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
    claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
    routeParamsStub = fixture.debugElement.injector.get(RouteParams);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
    keys = component.keys;
    selectedProcedure = CommonTestHelper.prepareObjectWithGivenkeys(keys.toArray());
    let array: UrlSegment[] = [];
    array.push(new UrlSegment('method-statement/procedure/example', null));
    (<ActivatedRouteStub>activatedRouteStub).url.next(array);
    currentProcedureApiRequest = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams('example', true)]);
    mockedProceduresResponse = MockStoreProviderFactory.getMSProceduresResponseData(true);
    mockedProcedureGroups = MockStoreProviderFactory.getProcedureGroupData();
    store.dispatch(new LoadProceduresCompleteAction(mockedProceduresResponse));
    store.dispatch(new LoadProcedureGroupAction());
    store.dispatch(new LoadProcedureGroupCompleteAction(mockedProcedureGroups));
    fixture.detectChanges();
    selectedProcedure = CommonTestHelper.copyObject(mockedProceduresResponse.Entities[0], selectedProcedure);
    selectedProcedureFullEntity = mockedProceduresResponse.Entities[0];
    selectedProcedureCopy = CommonTestHelper.prepareObjectWithGivenkeys(keys.toArray());
    Object.assign(selectedProcedureCopy, selectedProcedure);
    tick(300);
    fixture.detectChanges();
  }));
  beforeEach(() => {
    dispatchSpy = spyOn(store, 'dispatch');
    dispatchSpy.and.callThrough();
    let tbdElement = fixture.debugElement.query(By.css('#procedureTable_divBody_0'));
    columnDivs = tbdElement.queryAll(By.css('.table__heading'));
    actions = component.actions;
    viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
    copyAction = CommonTestHelper.getGivenButton(actions.toArray(), 'copy');
  });

  describe('Procedures table should have the following columns:', () => {
    it('Name,Group,Actions with sort options', () => {
      assertFun(columnDivs, 0, 'PROCEDURE_NAME', 'name');
      assertFun(columnDivs, 1, 'GROUP', 'proceduregroupname');
    });

    it('Should display the records', () => {
      let tblItemElements = fixture.debugElement.queryAll(By.css('.table__row'));
      expect(mockedProceduresResponse.Entities.length).toEqual(tblItemElements.length);
    });
    it('Should display pagination and row selector', () => {
      let paginationElememnt = fixture.debugElement.queryAll(By.css('#procedureTable_AePagination_1'));
      expect(paginationElememnt).not.toBeUndefined();
    });
  });
  describe('Taking actions on a Example Procedure:', () => {
    it('Select a Procedure and then the Action of View', fakeAsync(() => {
      viewAssertFun(component, selectedProcedure, viewAction, fixture);
    }));
    it('Select a Procedure and then the Action of Copy', fakeAsync(() => {
      copyAssertFun(component, selectedProcedure, selectedProcedureCopy, copyAction, dispatchSpy, fixture);
    }));
  });
  describe('Example Procedures - filter by procedure groups', () => {
    it('Should have procedures filter with valid procedure groups', fakeAsync(() => {
      tick();
      fixture.debugElement.triggerEventHandler('click', null);
      fixture.detectChanges();
      tick();
      let filterElement = fixture.debugElement.query(By.css('#ddlProcedureGroup'));
      expect(filterElement).not.toBeNull();
    }));
    it('Should be able to filter by selected option', fakeAsync(() => {
      tick();
      let selectedFilterValue = mockedProcedureGroups[0].Id;
      currentProcedureApiRequest.PageNumber = 1;
      currentProcedureApiRequest.Params = addOrUpdateAtlasParamValue(currentProcedureApiRequest.Params
        , 'ProcedureGroup', selectedFilterValue);
      component.procedureListForm.get('proceduregroup').setValue(selectedFilterValue);
      store.dispatch(new LoadProceduresCompleteAction(mockedProceduresResponse));
      fixture.detectChanges();
      tick();
      expect(dispatchSpy).toHaveBeenCalledWith(new LoadProceduresAction(currentProcedureApiRequest));
    }));
  });
  describe('Procedures - Should be able to filter data by page size and page number', () => {
    it('Should load data by selected page size', fakeAsync(() => {
      tick();
      let pageSize = 20;
      let pageNumber = 1;
      currentProcedureApiRequest.PageNumber = pageNumber;
      currentProcedureApiRequest.PageSize = pageSize;
      component.onPageChange({ pageNumber: pageNumber, noOfRows: pageSize });
      store.dispatch(new LoadProceduresCompleteAction(mockedProceduresResponse));
      fixture.detectChanges();
      tick();
      expect(dispatchSpy).toHaveBeenCalledWith(new LoadProceduresAction(currentProcedureApiRequest));
    }));
    it('Should load data by selected page number', fakeAsync(() => {
      tick();
      let pageSize = 10;
      let pageNumber = 2;
      currentProcedureApiRequest.PageNumber = pageNumber;
      currentProcedureApiRequest.PageSize = pageSize;
      component.onPageChange({ pageNumber: pageNumber, noOfRows: pageSize });
      store.dispatch(new LoadProceduresCompleteAction(mockedProceduresResponse));
      fixture.detectChanges();
      tick();
      expect(dispatchSpy).toHaveBeenCalledWith(new LoadProceduresAction(currentProcedureApiRequest));
    }));
  });
});
