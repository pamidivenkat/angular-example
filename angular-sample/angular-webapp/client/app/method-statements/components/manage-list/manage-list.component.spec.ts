import { AeModalDialogComponent } from './../../../atlas-elements/ae-modal-dialog/ae-modal-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilderService } from './../../../shared/services/form-builder.service';
import { StringHelper } from './../../../shared/helpers/string-helper';
import { EventListener } from '@angular/core/src/debug/debug_node';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { extractDataTableOptions } from './../../../shared/helpers/extract-helpers';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { LoadMethodStatementsTabChangeAction, LoadMethodStatementsListAction, LoadMethodStatementsFiltersChangedAction, LoadMethodStatementsLiveListCompleteAction, CopyMethodStatementAction, UpdateStatusMethodStatementAction, LoadMethodStatementsPendingListCompleteAction, RemoveMethodStatementAction, LoadMethodStatementsCompletedListCompleteAction, LoadMethodStatementsExampleListCompleteAction, LoadMethodStatementsArchivedListCompleteAction } from './../../actions/methodstatements.actions';
import { addOrUpdateAtlasParamValue } from '../../../root-module/common/extract-helpers';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { CommonTestHelper } from './../../../shared/testing/helpers/common-test-helper';
import { AeDataTableAction } from './../../../atlas-elements/common/models/ae-data-table-action';
import { AtlasApiRequestWithParams, AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { UpdateStatusModel, MethodStatement, MethodStatements } from './../../models/method-statement';
import { ActivatedRouteStub } from './../../../shared/testing/mocks/activated-route-stub';
import { Router, ActivatedRoute, UrlSegment, NavigationExtras } from '@angular/router';
import { LocalizationConfigStub } from './../../../shared/testing/mocks/localization-config-stub';
import { TranslationServiceStub } from './../../../shared/testing/mocks/translation-service-stub';
import { LocaleServiceStub } from './../../../shared/testing/mocks/locale-service-stub';
import { RouteParams } from './../../../shared/services/route-params';
import { RouteParamsMock } from './../../../shared/testing/mocks/route-params-mock';
import { ClaimsHelperServiceStub } from './../../../shared/testing/mocks/claims-helper-service-mock';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { BreadcrumbServiceStub } from './../../../shared/testing/mocks/breadcrumb-service-mock';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { MethodStatementsContainerComponent } from './../../containers/method-statements-container/method-statements-container.component';
import { routes } from './../../method-statements.routes';
import { MethodStatementRouteResolve } from './../../method-statements-route-resolver';
import { LocalizationConfig } from './../../../shared/localization-config';
import { AtlasSharedModule } from './../../../shared/atlas-shared.module';
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
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from './../../../atlas-elements/atlas-elements.module';
import { MethodStatementCopyModule } from './../../method-statement-copy/method-statement-copy.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Component, ChangeDetectionStrategy } from '@angular/core';

import { ManageListComponent } from './manage-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterMock } from './../../../shared/testing/mocks/router-stub';
import { reducer } from '../../../shared/reducers/index';
import { Action, ActionReducer, StoreModule, Store } from '@ngrx/store';
import * as fromRoot from '../../../shared/reducers';
import * as Immutable from 'immutable';

let store: Store<fromRoot.State>;


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
let viewAssertFun = function (component: ManageListComponent, selectedMethodStatement: MethodStatements, selectedMethodStatementCopy: MethodStatements, routerMock: RouterMock, viewAction: AeDataTableAction, fixture: ComponentFixture<ManageListComponent>) {
  let statusName = component._getStatusName(selectedMethodStatementCopy);
  let navigationExtras: NavigationExtras = {
    queryParamsHandling: 'merge'
  };
  let navigateSpy = spyOn(routerMock, 'navigate');

  viewAction.command.next(selectedMethodStatement);
  tick(100);
  fixture.detectChanges();
  tick(100);
  let str = '/method-statement/preview/' + statusName + "/" + selectedMethodStatementCopy.Id;
  expect(navigateSpy).toHaveBeenCalledWith([str], navigationExtras);
}
let copyAssertFun = function (component: ManageListComponent, selectedMethodStatement: MethodStatements, selectedMethodStatementCopy: MethodStatements, copyAction: AeDataTableAction, dispatchSpy: jasmine.Spy, fixture: ComponentFixture<ManageListComponent>) {

  copyAction.command.next(selectedMethodStatement);
  tick(100);
  fixture.debugElement.triggerEventHandler('click', null);
  fixture.detectChanges();
  tick(100);
  expect(selectedMethodStatementCopy).toEqual(component.selectedMethodStatement);
  expect(component.ShowMSCopySlideOut).toBeTruthy();
  let msCopyForm = fixture.debugElement.query(By.css('#msCopyForm')).nativeElement;
  expect(msCopyForm).not.toBeNull();
  //triggering the onCopied event
  component.OnCopied(selectedMethodStatementCopy);
  tick(100);
  fixture.detectChanges();
  tick(100);
  expect(dispatchSpy).toHaveBeenCalledWith(new CopyMethodStatementAction({ model: (<any>selectedMethodStatementCopy), AtlasApiRequestWithParams: component.methodStatementsApiRequest, copyToDiffCompany: (<any>selectedMethodStatementCopy).copyToDifferentCompany, IsExample: (<any>selectedMethodStatementCopy).IsExample }))
  expect(component.ShowMSCopySlideOut).toBeFalsy();
  //triggering the close ms slide out event
  component.CloseMSSlideOut({});
  tick(100);
  fixture.detectChanges();
  tick(100);
  expect(component.ShowMSCopySlideOut).toBeFalsy();

}
let updateAssertFun = function (component: ManageListComponent, selectedMethodStatement: MethodStatements, selectedMethodStatementCopy: MethodStatements, routerMock: RouterMock, updatedAction: AeDataTableAction, fixture: ComponentFixture<ManageListComponent>) {
  let navigationExtras: NavigationExtras = {
    queryParamsHandling: 'merge'
  };
  let navigateSpy = spyOn(routerMock, 'navigate');
  updatedAction.command.next(selectedMethodStatement);
  tick(100);
  fixture.detectChanges();
  tick(100);
  let str = '/method-statement/edit/' + selectedMethodStatementCopy.Id
  expect(navigateSpy).toHaveBeenCalledWith([str], navigationExtras);
}
let removeAssertFun = function (component: ManageListComponent, selectedMethodStatement: MethodStatements, selectedMethodStatementCopy: MethodStatements, removeAction: AeDataTableAction, dispatchSpy: jasmine.Spy, fixture: ComponentFixture<ManageListComponent>) {
  removeAction.command.next(selectedMethodStatement);
  expect(selectedMethodStatementCopy).toEqual(component.selectedMethodStatement);
  expect(component.showMethodStatementDeleteModal).toBeTruthy();

  tick(100);
  fixture.debugElement.triggerEventHandler('click', null);
  fixture.detectChanges();
  tick(100);

  let msCopyForm = fixture.debugElement.query(By.css('#msListComp_ConfirmModal_1')).nativeElement;
  expect(msCopyForm).not.toBeNull();
  //now trigger OK event and trigger cancel event and verify respective action related things are done

  let modalDialog = fixture.debugElement.query(By.css('ae-modal-dialog'));
  let yesButton = modalDialog.query(By.css('#confirmYes_aeButton_1'));
  let noButton = modalDialog.query(By.css('#confirmNo_aeButton_1'));
  tick(100);
  yesButton.triggerEventHandler("click", 'Yes');
  fixture.detectChanges();
  tick(100);
  //now 
  expect(component.showMethodStatementDeleteModal).toBeFalsy();
  expect(dispatchSpy).toHaveBeenCalledWith(new RemoveMethodStatementAction({ MethodStatements: selectedMethodStatementCopy, AtlasApiRequestWithParams: component.methodStatementsApiRequest }))

  //now trigger NO button click and assert
  tick(100);
  noButton.triggerEventHandler("click", 'No');
  fixture.detectChanges();
  tick(100);
  expect(component.showMethodStatementDeleteModal).toBeFalsy();
}
let removeWithNoAssertFun = function (component: ManageListComponent, selectedMethodStatement: MethodStatements, selectedMethodStatementCopy: MethodStatements, removeAction: AeDataTableAction, dispatchSpy: jasmine.Spy, fixture: ComponentFixture<ManageListComponent>) {
  removeAction.command.next(selectedMethodStatement);
  expect(selectedMethodStatementCopy).toEqual(component.selectedMethodStatement);
  expect(component.showMethodStatementDeleteModal).toBeTruthy();

  tick(100);
  fixture.debugElement.triggerEventHandler('click', null);
  fixture.detectChanges();
  tick(100);

  let msCopyForm = fixture.debugElement.query(By.css('#msListComp_ConfirmModal_1')).nativeElement;
  expect(msCopyForm).not.toBeNull();
  //now trigger OK event and trigger cancel event and verify respective action related things are done

  let modalDialog = fixture.debugElement.query(By.css('ae-modal-dialog'));
  let yesButton = modalDialog.query(By.css('#confirmYes_aeButton_1'));
  let noButton = modalDialog.query(By.css('#confirmNo_aeButton_1'));
  tick(100);
  noButton.triggerEventHandler("click", 'No');
  fixture.detectChanges();
  tick(100);
  expect(component.showMethodStatementDeleteModal).toBeFalsy();
  expect(dispatchSpy).not.toHaveBeenCalled();
}

let archiveAssertFun = function (component: ManageListComponent, selectedMethodStatement: MethodStatements, selectedMethodStatementCopy: MethodStatements, archiveAction: AeDataTableAction, claimsHelperServiceStub, dispatchSpy: jasmine.Spy, fixture: ComponentFixture<ManageListComponent>) {
  let claimsHelperSpy = spyOn(claimsHelperServiceStub, 'getUserId');
  let existingAPIRequest = component.methodStatementsApiRequest;
  claimsHelperSpy.and.callFake(() => {
    return 'A32D0A6A-76B9-45F5-BFEE-1684C409F92D';
  });
  archiveAction.command.next(selectedMethodStatement);
  tick(100);
  fixture.detectChanges();
  tick(100);
  selectedMethodStatementCopy = selectedMethodStatementCopy as MethodStatements;
  let dataToSave = new UpdateStatusModel();
  dataToSave.StatusId = 4;
  dataToSave.ArchievedBy = 'A32D0A6A-76B9-45F5-BFEE-1684C409F92D'
  dataToSave.MethodStatementId = selectedMethodStatementCopy.Id;
  dataToSave.Name = selectedMethodStatementCopy.Name;
  existingAPIRequest.Params = addOrUpdateAtlasParamValue(existingAPIRequest.Params, 'ByStatusIdOnUpdate', dataToSave.StatusId);
  expect(dispatchSpy).toHaveBeenCalledWith((new UpdateStatusMethodStatementAction({ UpdateStatusModel: dataToSave, AtlasApiRequestWithParams: existingAPIRequest })));
}
let reInstateAssertFun = function (component: ManageListComponent, selectedMethodStatement: MethodStatements, selectedMethodStatementCopy: MethodStatements, archiveAction: AeDataTableAction, claimsHelperServiceStub, dispatchSpy: jasmine.Spy, fixture: ComponentFixture<ManageListComponent>) {
  let claimsHelperSpy = spyOn(claimsHelperServiceStub, 'getUserId');
  let existingAPIRequest = component.methodStatementsApiRequest;
  claimsHelperSpy.and.callFake(() => {
    return 'A32D0A6A-76B9-45F5-BFEE-1684C409F92D';
  });
  archiveAction.command.next(selectedMethodStatement);
  tick(100);
  fixture.detectChanges();
  tick(100);
  selectedMethodStatementCopy = selectedMethodStatementCopy as MethodStatements;
  let dataToSave = new UpdateStatusModel();
  dataToSave.StatusId = 0;
  dataToSave.ArchievedBy = 'A32D0A6A-76B9-45F5-BFEE-1684C409F92D'
  dataToSave.MethodStatementId = selectedMethodStatementCopy.Id;
  dataToSave.Name = selectedMethodStatementCopy.Name;
  existingAPIRequest.Params = addOrUpdateAtlasParamValue(existingAPIRequest.Params, 'ByStatusIdOnUpdate', dataToSave.StatusId);
  expect(dispatchSpy).toHaveBeenCalledWith((new UpdateStatusMethodStatementAction({ UpdateStatusModel: dataToSave, AtlasApiRequestWithParams: existingAPIRequest })));
}


describe('Method statement list', () => {
  let component: ManageListComponent;
  let fixture: ComponentFixture<ManageListComponent>;

  let dispatchSpy: jasmine.Spy;
  let configLoaded: jasmine.Spy;
  let canCreateExampleMSSpy: jasmine.Spy;

  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any
  let routeParamsStub: any;
  let expectedAPIRequest: AtlasApiRequestWithParams;
  let loadedData, loadedDataTableOptions, loadedDataCount;
  let mockedLiveMSListResponse: AtlasApiResponse<MethodStatements>;
  let dataTableElement: DebugElement;
  let items: BehaviorSubject<Immutable.List<MethodStatements>> = new BehaviorSubject<Immutable.List<MethodStatements>>(null);
  let itemsTotalCount: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        CommonModule,
        ReactiveFormsModule,
        MethodStatementCopyModule,
        AtlasElementsModule,
        RouterModule.forChild(routes),
        LocalizationModule,
        AtlasSharedModule
        , StoreModule.provideStore(reducer)
      ],
      declarations: [MethodStatementsContainerComponent, ManageListComponent],
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
      ]
    })
      .overrideComponent(ManageListComponent, { set: { host: { "(click)": "dummy" } } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageListComponent);
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
    dataTableElement = fixture.debugElement.query(By.css('ae-datatable'));   
  });

  beforeEach(() => {
    dispatchSpy = spyOn(store, 'dispatch');
    canCreateExampleMSSpy = spyOn(claimsHelperServiceStub, 'canCreateExampleMS');
  })

  describe('Component launch', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

 
  describe('Client Login - Accessing method statement list page ', () => {
    beforeEach(() => {
      routeParamsStub.Cid = null;
    });


    describe('Default Method statements list should be loaded when navigated', () => {
      beforeEach(() => {
        expectedAPIRequest = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, []);
      });


      it('Respective tab should be loaded when filters are changed', (() => {
        component.byStatusId = 1;

        expectedAPIRequest.Params = addOrUpdateAtlasParamValue(expectedAPIRequest.Params, 'ByStatusId', 1);
        expectedAPIRequest.Params = addOrUpdateAtlasParamValue(expectedAPIRequest.Params, 'isexample', '');
        expectedAPIRequest.Params = addOrUpdateAtlasParamValue(expectedAPIRequest.Params, 'ByNameOrReference', 'nametest');
        expectedAPIRequest.Params = addOrUpdateAtlasParamValue(expectedAPIRequest.Params, 'MSBySiteId', 'AB22680F-3E63-4D75-B226-8C43414D2F72');
        dispatchSpy.and.callThrough();
        store.dispatch(new LoadMethodStatementsFiltersChangedAction(expectedAPIRequest)); // just to trigger the          
        expect(dispatchSpy).toHaveBeenCalledWith(new LoadMethodStatementsListAction(expectedAPIRequest));

      }));

      it('It should have page change and sort options', (() => {
        let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
        let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
        let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
        expect(sortEvent).toBeDefined();
        expect(pageChangeEvent).toBeDefined();
      }));

    });

    describe('The actions available within each Tab, depend on the status of the Method Statement, there are also actions which can be taken against the example Method Statements.', () => {

      it('Live tab should have view, copy, archive actions', (() => {
        let array: UrlSegment[] = [];
        array.push(new UrlSegment('method-statement/live', null)); //status id = 1
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        //tick(50);
        let items: Array<AeDataTableAction> = component.actions.toArray();
        expect(items.length).toEqual(3);
        expect(CommonTestHelper.hasGivenButton(items, 'view')
          && CommonTestHelper.hasGivenButton(items, 'copy')
          && CommonTestHelper.hasGivenButton(items, 'archive')
        ).toBeTruthy();
        expect(component.byStatusId).toEqual(1);

      }));



      it('Pending tab should have View, Copy, Update, Remove actions', (() => {
        let array: UrlSegment[] = [];
        array.push(new UrlSegment('method-statement/pending', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        //tick(50);
        let items: Array<AeDataTableAction> = component.actions.toArray();
        expect(items.length).toEqual(4);
        expect(CommonTestHelper.hasGivenButton(items, 'view')
          && CommonTestHelper.hasGivenButton(items, 'copy')
          && CommonTestHelper.hasGivenButton(items, 'update')
          && CommonTestHelper.hasGivenButton(items, 'remove')
        ).toBeTruthy();
        expect(component.byStatusId).toEqual(0);
      }));

      it('Completed tab should have View, Copy, Archive actions', (() => {
        let array: UrlSegment[] = [];
        array.push(new UrlSegment('method-statement/completed', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        //tick(50);
        let items: Array<AeDataTableAction> = component.actions.toArray();
        expect(items.length).toEqual(3);
        expect(CommonTestHelper.hasGivenButton(items, 'view')
          && CommonTestHelper.hasGivenButton(items, 'copy')
          && CommonTestHelper.hasGivenButton(items, 'archive')
        ).toBeTruthy();
        expect(component.byStatusId).toEqual(3);
      }));

      it('Archived tab should have View, Reinstate actions', (() => {
        let array: UrlSegment[] = [];
        array.push(new UrlSegment('method-statement/archived', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        //tick(50);
        let items: Array<AeDataTableAction> = component.actions.toArray();
        expect(items.length).toEqual(2);
        expect(CommonTestHelper.hasGivenButton(items, 'view')
          && CommonTestHelper.hasGivenButton(items, 'reinstate')
        ).toBeTruthy();
        expect(component.byStatusId).toEqual(4);
      }));

      it('Example tab should have View, Reinstate actions', (() => {
        let array: UrlSegment[] = [];
        array.push(new UrlSegment('method-statement/example', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        //tick(50);
        let items: Array<AeDataTableAction> = component.actions.toArray();
        expect(items.length).toEqual(2);
        expect(CommonTestHelper.hasGivenButton(items, 'view')
          && CommonTestHelper.hasGivenButton(items, 'copy')
        ).toBeTruthy();
        expect(component.byStatusId).toEqual(-1);
      }));

    });

  });
});

//PLEASE NOTE THAT store variable should be available before below describe so the ABOVE major describe and this should run in parallel
describe('Live Tab Testing', () => {
  let component: ManageListComponent;
  let fixture: ComponentFixture<ManageListComponent>;

  let dispatchSpy: jasmine.Spy;
  let configLoaded: jasmine.Spy;
  let canCreateExampleMSSpy: jasmine.Spy;

  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any
  let routeParamsStub: any;
  let expectedAPIRequest: AtlasApiRequestWithParams;
  let loadedData, loadedDataTableOptions, loadedDataCount;
  let mockedLiveMSListResponse: AtlasApiResponse<MethodStatements>;
  let dataTableElement: DebugElement;
  let items: BehaviorSubject<Immutable.List<MethodStatements>> = new BehaviorSubject<Immutable.List<MethodStatements>>(null);
  let itemsTotalCount: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  let columnDivs: DebugElement[];
  let actions: Immutable.List<AeDataTableAction>;
  let viewAction: AeDataTableAction;
  let updateAction: AeDataTableAction;
  let copyAction: AeDataTableAction;
  let removeAction: AeDataTableAction;
  let archiveAction: AeDataTableAction;
  let reinstateAction: AeDataTableAction;
  let mockedLiveBindData: MethodStatements[];
  let keys: Immutable.List<string>;
  let selectedMethodStatement: MethodStatements;
  let selectedMethodStatementCopy: MethodStatements;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MethodStatementCopyModule,
        AtlasElementsModule,
        RouterModule.forChild(routes),
        LocalizationModule,
        AtlasSharedModule
        , NoopAnimationsModule
        , StoreModule.provideStore(reducer)
      ],
      declarations: [MethodStatementsContainerComponent, ManageListComponent],
      providers: [
        InjectorRef
        , FormBuilderService
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: RouteParams, useClass: RouteParamsMock }
      ]
    })
      .overrideComponent(ManageListComponent,
      {
        set: { host: { "(click)": "dummy" } }
      })
      .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(ManageListComponent);
    component = fixture.componentInstance;
    //store = fixture.debugElement.injector.get(Store);
    store = fixture.debugElement.injector.get(Store);
    //injectedStore = store;//initial store form first launch

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
    selectedMethodStatement = CommonTestHelper.prepareObjectWithGivenkeys(keys.toArray());

    // we are having issues while testing scenarios after component launch and store initialization, so preparing the store first 
    //so that component will be initialized will be initialized with all requisites to load the  live tab..
    let array: UrlSegment[] = [];
    array.push(new UrlSegment('method-statement/live', null)); //status id = 1
    (<ActivatedRouteStub>activatedRouteStub).url.next(array);
    mockedLiveMSListResponse = MockStoreProviderFactory.getTestMethodStatementResponseData();
    store.dispatch(new LoadMethodStatementsLiveListCompleteAction(mockedLiveMSListResponse)); //store is already having live data
    //now detecting the changes so that component will be subscribed to the observables which are relevant to the Live tab     
    tick(300);

    fixture.detectChanges();    
    selectedMethodStatement = CommonTestHelper.copyObject(mockedLiveMSListResponse.Entities[0], selectedMethodStatement);
    selectedMethodStatementCopy = CommonTestHelper.prepareObjectWithGivenkeys(keys.toArray());
    Object.assign(selectedMethodStatementCopy, selectedMethodStatement);
    tick(300);
    fixture.detectChanges();
  }));
  beforeEach(() => {
    dispatchSpy = spyOn(store, 'dispatch');
    canCreateExampleMSSpy = spyOn(claimsHelperServiceStub, 'canCreateExampleMS');
    let tbdElement = fixture.debugElement.query(By.css('#methodStatementList_divBody_0'));
    columnDivs = tbdElement.queryAll(By.css('.table__heading'));
    actions = component.actions;
    viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
    copyAction = CommonTestHelper.getGivenButton(actions.toArray(), 'copy');
    archiveAction = CommonTestHelper.getGivenButton(actions.toArray(), 'archive');

  });

  describe('Method Statements within the Live Tab will display Message and the following columns:', () => {
    it('Live notification message', () => {
      let spanNotify: HTMLSpanElement = fixture.debugElement.query(By.css('#incidentNotification_spanNotify_1')).nativeElement;
      expect(spanNotify.innerHTML).toEqual('METHOD_STATEMENTS_MANAGE.LIVE_TAB_MSG');
    });

    it('Name,Client name, start date, end date, site name with sort options', () => {
      assertFun(columnDivs, 0, 'METHOD_STATEMENTS_MANAGE.NAME', 'name');
      assertFun(columnDivs, 1, 'METHOD_STATEMENTS_MANAGE.CLIENTNAME', 'clientname');
      assertFun(columnDivs, 2, 'METHOD_STATEMENTS_MANAGE.START_DATE', 'startdate');
      assertFun(columnDivs, 3, 'METHOD_STATEMENTS_MANAGE.END_DATE', 'enddate');
      assertFun(columnDivs, 4, 'METHOD_STATEMENTS_MANAGE.SITENAME', 'sitename');

    });

    it('Should display the records', () => {
      let tblItemElements = fixture.debugElement.queryAll(By.css('.table__row'));
      expect(mockedLiveMSListResponse.Entities.length).toEqual(tblItemElements.length);
    });

  });

  describe('Taking action on a Method Statement:', () => {
    it('When they go to the Live Tab, and they select a Method Statement and then the Action of View, redirected to view page', fakeAsync(() => {
      //sending the selected methodstatement as next Object..
      viewAssertFun(component, selectedMethodStatement, selectedMethodStatementCopy, routerMock, viewAction, fixture);
    }));

    it('When they go to the Live Tab, and they select a Method Statement and then the Action of Copy, a Copy Method Statement slide-out will be displayed', fakeAsync(() => {
      //sending the selected methodstatement as next Object..     
      copyAssertFun(component, selectedMethodStatement, selectedMethodStatementCopy, copyAction, dispatchSpy, fixture);
    }));

    it('when they go the Live Tab, and they select a Method Statement and then the Action of Archive, the Method Statement will be Archived.', fakeAsync(() => {
      archiveAssertFun(component, selectedMethodStatement, selectedMethodStatementCopy, archiveAction, claimsHelperServiceStub, dispatchSpy, fixture);
    }));

  });
});

describe('Pending Tab Testing', () => {
  let component: ManageListComponent;
  let fixture: ComponentFixture<ManageListComponent>;

  let dispatchSpy: jasmine.Spy;
  let configLoaded: jasmine.Spy;
  let canCreateExampleMSSpy: jasmine.Spy;

  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any
  let routeParamsStub: any;
  let expectedAPIRequest: AtlasApiRequestWithParams;
  let loadedData, loadedDataTableOptions, loadedDataCount;
  let mockedLiveMSListResponse: AtlasApiResponse<MethodStatements>;
  let dataTableElement: DebugElement;
  let items: BehaviorSubject<Immutable.List<MethodStatements>> = new BehaviorSubject<Immutable.List<MethodStatements>>(null);
  let itemsTotalCount: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  let columnDivs: DebugElement[];
  let actions: Immutable.List<AeDataTableAction>;
  let viewAction: AeDataTableAction;
  let updateAction: AeDataTableAction;
  let copyAction: AeDataTableAction;
  let removeAction: AeDataTableAction;
  let archiveAction: AeDataTableAction;
  let reinstateAction: AeDataTableAction;
  let mockedLiveBindData: MethodStatements[];
  let keys: Immutable.List<string>;
  let selectedMethodStatement: MethodStatements;
  let selectedMethodStatementCopy: MethodStatements;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MethodStatementCopyModule,
        AtlasElementsModule,
        RouterModule.forChild(routes),
        LocalizationModule,
        AtlasSharedModule
        , NoopAnimationsModule
        , StoreModule.provideStore(reducer)
      ],
      declarations: [MethodStatementsContainerComponent, ManageListComponent],
      providers: [
        InjectorRef
        , FormBuilderService
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: RouteParams, useClass: RouteParamsMock }
      ]
    })
      .overrideComponent(ManageListComponent,
      {
        set: { host: { "(click)": "dummy" } }
      })
      .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(ManageListComponent);
    component = fixture.componentInstance;
    //store = fixture.debugElement.injector.get(Store);
    store = fixture.debugElement.injector.get(Store);
    //injectedStore = store;//initial store form first launch

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
    selectedMethodStatement = CommonTestHelper.prepareObjectWithGivenkeys(keys.toArray());

    // we are having issues while testing scenarios after component launch and store initialization, so preparing the store first 
    //so that component will be initialized will be initialized with all requisites to load the  live tab..
    let array: UrlSegment[] = [];
    array.push(new UrlSegment('method-statement/pending', null)); //status id = 1
    (<ActivatedRouteStub>activatedRouteStub).url.next(array);
    mockedLiveMSListResponse = MockStoreProviderFactory.getTestMethodStatementResponseData();
    store.dispatch(new LoadMethodStatementsPendingListCompleteAction(mockedLiveMSListResponse)); //store is already having live data //now detecting the changes so that component will be subscribed to the observables which are relevant to the Live tab     
    tick(300);

    fixture.detectChanges();   
    selectedMethodStatement = CommonTestHelper.copyObject(mockedLiveMSListResponse.Entities[0], selectedMethodStatement);
    selectedMethodStatementCopy = CommonTestHelper.prepareObjectWithGivenkeys(keys.toArray());
    Object.assign(selectedMethodStatementCopy, selectedMethodStatement);
    tick(300);
    fixture.detectChanges();
  }));
  beforeEach(() => {
    dispatchSpy = spyOn(store, 'dispatch');
    canCreateExampleMSSpy = spyOn(claimsHelperServiceStub, 'canCreateExampleMS');
    let tbdElement = fixture.debugElement.query(By.css('#methodStatementList_divBody_0'));
    columnDivs = tbdElement.queryAll(By.css('.table__heading'));
    actions = component.actions;
    viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
    copyAction = CommonTestHelper.getGivenButton(actions.toArray(), 'copy');
    updateAction = CommonTestHelper.getGivenButton(actions.toArray(), 'update');
    removeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'remove');

  });

  describe('Method Statements within the Pending Tab will display Message and the following columns:', () => {
    it('Pending notification message', () => {
      let spanNotify: HTMLSpanElement = fixture.debugElement.query(By.css('#incidentNotification_spanNotify_1')).nativeElement;
      expect(spanNotify.innerHTML).toEqual('METHOD_STATEMENTS_MANAGE.PENDING_TAB_MSG');
    });

    it('Name,Client name, start date, end date, site name with sort options', () => {
      assertFun(columnDivs, 0, 'METHOD_STATEMENTS_MANAGE.NAME', 'name');
      assertFun(columnDivs, 1, 'METHOD_STATEMENTS_MANAGE.CLIENTNAME', 'clientname');
      assertFun(columnDivs, 2, 'METHOD_STATEMENTS_MANAGE.START_DATE', 'startdate');
      assertFun(columnDivs, 3, 'METHOD_STATEMENTS_MANAGE.END_DATE', 'enddate');
      assertFun(columnDivs, 4, 'METHOD_STATEMENTS_MANAGE.SITENAME', 'sitename');

    });

    it('Should display the records', () => {
      let tblItemElements = fixture.debugElement.queryAll(By.css('.table__row'));
      expect(mockedLiveMSListResponse.Entities.length).toEqual(tblItemElements.length);
    });

  });

  describe('Taking action on a Method Statement:', () => {
    it('When they go to the pending Tab, and they select a Method Statement and then the Action of View, redirected to view page', fakeAsync(() => {
      //sending the selected methodstatement as next Object..
      viewAssertFun(component, selectedMethodStatement, selectedMethodStatementCopy, routerMock, viewAction, fixture);
    }));

    it('When they go to the pending Tab, and they select a Method Statement and then the Action of Copy, a Copy Method Statement slide-out will be displayed', fakeAsync(() => {
      //sending the selected methodstatement as next Object..     
      copyAssertFun(component, selectedMethodStatement, selectedMethodStatementCopy, copyAction, dispatchSpy, fixture);
    }));

    it('when they go to the Pending Tab, and they select a Method Statement and then the Action of Update, the Method Statement will open in edit mode.', fakeAsync(() => {
      updateAssertFun(component, selectedMethodStatement, selectedMethodStatementCopy, routerMock, updateAction, fixture);
    }));

    it('when they go to the Pending Tab, and they select a Method Statement and then the Action of Remove, a Remove Method Statement Confirmation message will be displayed, when yes its removed', fakeAsync(() => {
      removeAssertFun(component, selectedMethodStatement, selectedMethodStatementCopy, removeAction, dispatchSpy, fixture);
    }));

    it('when they go to the Pending Tab, and they select a Method Statement and then the Action of Remove, a Remove Method Statement Confirmation message will be displayed, when no its not removed', fakeAsync(() => {
      removeWithNoAssertFun(component, selectedMethodStatement, selectedMethodStatementCopy, removeAction, dispatchSpy, fixture);
    }));

  });
});

describe('Completed Tab Testing', () => {
  let component: ManageListComponent;
  let fixture: ComponentFixture<ManageListComponent>;

  let dispatchSpy: jasmine.Spy;
  let configLoaded: jasmine.Spy;
  let canCreateExampleMSSpy: jasmine.Spy;

  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any
  let routeParamsStub: any;
  let expectedAPIRequest: AtlasApiRequestWithParams;
  let loadedData, loadedDataTableOptions, loadedDataCount;
  let mockedLiveMSListResponse: AtlasApiResponse<MethodStatements>;
  let dataTableElement: DebugElement;
  let items: BehaviorSubject<Immutable.List<MethodStatements>> = new BehaviorSubject<Immutable.List<MethodStatements>>(null);
  let itemsTotalCount: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  let columnDivs: DebugElement[];
  let actions: Immutable.List<AeDataTableAction>;
  let viewAction: AeDataTableAction;
  let updateAction: AeDataTableAction;
  let copyAction: AeDataTableAction;
  let removeAction: AeDataTableAction;
  let archiveAction: AeDataTableAction;
  let reinstateAction: AeDataTableAction;
  let mockedLiveBindData: MethodStatements[];
  let keys: Immutable.List<string>;
  let selectedMethodStatement: MethodStatements;
  let selectedMethodStatementCopy: MethodStatements;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MethodStatementCopyModule,
        AtlasElementsModule,
        RouterModule.forChild(routes),
        LocalizationModule,
        AtlasSharedModule
        , NoopAnimationsModule
        , StoreModule.provideStore(reducer)
      ],
      declarations: [MethodStatementsContainerComponent, ManageListComponent],
      providers: [
        InjectorRef
        , FormBuilderService
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: RouteParams, useClass: RouteParamsMock }
      ]
    })
      .overrideComponent(ManageListComponent,
      {
        set: { host: { "(click)": "dummy" } }
      })
      .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(ManageListComponent);
    component = fixture.componentInstance;
    //store = fixture.debugElement.injector.get(Store);
    store = fixture.debugElement.injector.get(Store);
    //injectedStore = store;//initial store form first launch

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
    selectedMethodStatement = CommonTestHelper.prepareObjectWithGivenkeys(keys.toArray());

    // we are having issues while testing scenarios after component launch and store initialization, so preparing the store first 
    //so that component will be initialized will be initialized with all requisites to load the  live tab..
    let array: UrlSegment[] = [];
    array.push(new UrlSegment('method-statement/completed', null)); //status id = 1
    (<ActivatedRouteStub>activatedRouteStub).url.next(array);
    mockedLiveMSListResponse = MockStoreProviderFactory.getTestMethodStatementResponseData();
    store.dispatch(new LoadMethodStatementsCompletedListCompleteAction(mockedLiveMSListResponse)); //store is already having live data //now detecting the changes so that component will be subscribed to the observables which are relevant to the Live tab     
    tick(300);
    fixture.detectChanges();
    selectedMethodStatement = CommonTestHelper.copyObject(mockedLiveMSListResponse.Entities[0], selectedMethodStatement);
    selectedMethodStatementCopy = CommonTestHelper.prepareObjectWithGivenkeys(keys.toArray());
    Object.assign(selectedMethodStatementCopy, selectedMethodStatement);
    tick(300);
    fixture.detectChanges();
  }));
  beforeEach(() => {
    dispatchSpy = spyOn(store, 'dispatch');
    canCreateExampleMSSpy = spyOn(claimsHelperServiceStub, 'canCreateExampleMS');
    let tbdElement = fixture.debugElement.query(By.css('#methodStatementList_divBody_0'));
    columnDivs = tbdElement.queryAll(By.css('.table__heading'));
    actions = component.actions;
    viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
    copyAction = CommonTestHelper.getGivenButton(actions.toArray(), 'copy');
    archiveAction = CommonTestHelper.getGivenButton(actions.toArray(), 'archive');

  });

  describe('Method Statements within the Completed Tab will display Message and the following columns:', () => {
    it('Completed notification message', () => {
      let spanNotify: HTMLSpanElement = fixture.debugElement.query(By.css('#incidentNotification_spanNotify_1')).nativeElement;
      expect(spanNotify.innerHTML).toEqual('METHOD_STATEMENTS_MANAGE.COMPLETED_TAB_MSG');
    });

    it('Name,Client name, start date, end date, site name with sort options', () => {
      assertFun(columnDivs, 0, 'METHOD_STATEMENTS_MANAGE.NAME', 'name');
      assertFun(columnDivs, 1, 'METHOD_STATEMENTS_MANAGE.CLIENTNAME', 'clientname');
      assertFun(columnDivs, 2, 'METHOD_STATEMENTS_MANAGE.START_DATE', 'startdate');
      assertFun(columnDivs, 3, 'METHOD_STATEMENTS_MANAGE.END_DATE', 'enddate');
      assertFun(columnDivs, 4, 'METHOD_STATEMENTS_MANAGE.SITENAME', 'sitename');

    });

    it('Should display the records', () => {
      let tblItemElements = fixture.debugElement.queryAll(By.css('.table__row'));
      expect(mockedLiveMSListResponse.Entities.length).toEqual(tblItemElements.length);
    });

  });

  describe('Taking action on a Method Statement:', () => {
    it('When they go to the completed Tab, and they select a Method Statement and then the Action of View, redirected to view page', fakeAsync(() => {
      //sending the selected methodstatement as next Object..
      viewAssertFun(component, selectedMethodStatement, selectedMethodStatementCopy, routerMock, viewAction, fixture);
    }));

    it('When they go to the completed Tab, and they select a Method Statement and then the Action of Copy, a Copy Method Statement slide-out will be displayed', fakeAsync(() => {
      //sending the selected methodstatement as next Object..     
      copyAssertFun(component, selectedMethodStatement, selectedMethodStatementCopy, copyAction, dispatchSpy, fixture);
    }));

    it('when they go to the completed Tab, and they select a Method Statement and then the Action of Update, the Method Statement will open in edit mode.', fakeAsync(() => {
      archiveAssertFun(component, selectedMethodStatement, selectedMethodStatementCopy, archiveAction, claimsHelperServiceStub, dispatchSpy, fixture);
    }));


  });
});

describe('Examples Tab Testing', () => {
  let component: ManageListComponent;
  let fixture: ComponentFixture<ManageListComponent>;

  let dispatchSpy: jasmine.Spy;
  let configLoaded: jasmine.Spy;
  let canCreateExampleMSSpy: jasmine.Spy;

  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any
  let routeParamsStub: any;
  let expectedAPIRequest: AtlasApiRequestWithParams;
  let loadedData, loadedDataTableOptions, loadedDataCount;
  let mockedLiveMSListResponse: AtlasApiResponse<MethodStatements>;
  let dataTableElement: DebugElement;
  let items: BehaviorSubject<Immutable.List<MethodStatements>> = new BehaviorSubject<Immutable.List<MethodStatements>>(null);
  let itemsTotalCount: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  let columnDivs: DebugElement[];
  let actions: Immutable.List<AeDataTableAction>;
  let viewAction: AeDataTableAction;
  let updateAction: AeDataTableAction;
  let copyAction: AeDataTableAction;
  let removeAction: AeDataTableAction;
  let archiveAction: AeDataTableAction;
  let reinstateAction: AeDataTableAction;
  let mockedLiveBindData: MethodStatements[];
  let keys: Immutable.List<string>;
  let selectedMethodStatement: MethodStatements;
  let selectedMethodStatementCopy: MethodStatements;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MethodStatementCopyModule,
        AtlasElementsModule,
        RouterModule.forChild(routes),
        LocalizationModule,
        AtlasSharedModule
        , NoopAnimationsModule
        , StoreModule.provideStore(reducer)
      ],
      declarations: [MethodStatementsContainerComponent, ManageListComponent],
      providers: [
        InjectorRef
        , FormBuilderService
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: RouteParams, useClass: RouteParamsMock }
      ]
    })
      .overrideComponent(ManageListComponent,
      {
        set: { host: { "(click)": "dummy" } }
      })
      .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(ManageListComponent);
    component = fixture.componentInstance;
    //store = fixture.debugElement.injector.get(Store);
    store = fixture.debugElement.injector.get(Store);
    //injectedStore = store;//initial store form first launch

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
    selectedMethodStatement = CommonTestHelper.prepareObjectWithGivenkeys(keys.toArray());

    // we are having issues while testing scenarios after component launch and store initialization, so preparing the store first 
    //so that component will be initialized will be initialized with all requisites to load the  live tab..
    let array: UrlSegment[] = [];
    array.push(new UrlSegment('method-statement/examples', null)); //status id = 1
    (<ActivatedRouteStub>activatedRouteStub).url.next(array);
    mockedLiveMSListResponse = MockStoreProviderFactory.getTestMethodStatementResponseData();
    store.dispatch(new LoadMethodStatementsExampleListCompleteAction(mockedLiveMSListResponse)); //store is already having live data //now detecting the changes so that component will be subscribed to the observables which are relevant to the Live tab     
    tick(300);
    fixture.detectChanges();
    selectedMethodStatement = CommonTestHelper.copyObject(mockedLiveMSListResponse.Entities[0], selectedMethodStatement);
    selectedMethodStatementCopy = CommonTestHelper.prepareObjectWithGivenkeys(keys.toArray());
    Object.assign(selectedMethodStatementCopy, selectedMethodStatement);
    tick(300);
    fixture.detectChanges();
  }));
  beforeEach(() => {
    dispatchSpy = spyOn(store, 'dispatch');
    canCreateExampleMSSpy = spyOn(claimsHelperServiceStub, 'canCreateExampleMS');
    let tbdElement = fixture.debugElement.query(By.css('#methodStatementList_divBody_0'));
    columnDivs = tbdElement.queryAll(By.css('.table__heading'));
    actions = component.actions;
    viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
    copyAction = CommonTestHelper.getGivenButton(actions.toArray(), 'copy');
  });

  describe('Method Statements within the Examples Tab will display Message and the following columns:', () => {
    it('Example notification message', () => {
      let spanNotify: HTMLSpanElement = fixture.debugElement.query(By.css('#incidentNotification_spanNotify_1')).nativeElement;
      expect(spanNotify.innerHTML).toEqual('METHOD_STATEMENTS_MANAGE.EXAMPLES_TAB_MSG');
    });

    it('Name,Client name, description with sort options', () => {
      assertFun(columnDivs, 0, 'METHOD_STATEMENTS_MANAGE.NAME', 'name');
      assertFun(columnDivs, 1, 'METHOD_STATEMENTS_MANAGE.DESCRIPTION', 'description');
    });

    it('Should display the records', () => {
      let tblItemElements = fixture.debugElement.queryAll(By.css('.table__row'));
      expect(mockedLiveMSListResponse.Entities.length).toEqual(tblItemElements.length);
    });

  });

  describe('Taking action on a Method Statement:', () => {
    it('When they go to the completed Tab, and they select a Method Statement and then the Action of View, redirected to view page', fakeAsync(() => {
      //sending the selected methodstatement as next Object..
      viewAssertFun(component, selectedMethodStatement, selectedMethodStatementCopy, routerMock, viewAction, fixture);
    }));

    it('When they go to the completed Tab, and they select a Method Statement and then the Action of Copy, a Copy Method Statement slide-out will be displayed', fakeAsync(() => {
      //sending the selected methodstatement as next Object..     
      copyAssertFun(component, selectedMethodStatement, selectedMethodStatementCopy, copyAction, dispatchSpy, fixture);
    }));

  });
});

describe('Archived Tab Testing', () => {
  let component: ManageListComponent;
  let fixture: ComponentFixture<ManageListComponent>;

  let dispatchSpy: jasmine.Spy;
  let configLoaded: jasmine.Spy;
  let canCreateExampleMSSpy: jasmine.Spy;

  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any
  let routeParamsStub: any;
  let expectedAPIRequest: AtlasApiRequestWithParams;
  let loadedData, loadedDataTableOptions, loadedDataCount;
  let mockedLiveMSListResponse: AtlasApiResponse<MethodStatements>;
  let dataTableElement: DebugElement;
  let items: BehaviorSubject<Immutable.List<MethodStatements>> = new BehaviorSubject<Immutable.List<MethodStatements>>(null);
  let itemsTotalCount: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  let columnDivs: DebugElement[];
  let actions: Immutable.List<AeDataTableAction>;
  let viewAction: AeDataTableAction;
  let updateAction: AeDataTableAction;
  let copyAction: AeDataTableAction;
  let removeAction: AeDataTableAction;
  let archiveAction: AeDataTableAction;
  let reinstateAction: AeDataTableAction;
  let mockedLiveBindData: MethodStatements[];
  let keys: Immutable.List<string>;
  let selectedMethodStatement: MethodStatements;
  let selectedMethodStatementCopy: MethodStatements;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MethodStatementCopyModule,
        AtlasElementsModule,
        RouterModule.forChild(routes),
        LocalizationModule,
        AtlasSharedModule
        , NoopAnimationsModule
        , StoreModule.provideStore(reducer)
      ],
      declarations: [MethodStatementsContainerComponent, ManageListComponent],
      providers: [
        InjectorRef
        , FormBuilderService
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: RouteParams, useClass: RouteParamsMock }
      ]
    })
      .overrideComponent(ManageListComponent,
      {
        set: { host: { "(click)": "dummy" } }
      })
      .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(ManageListComponent);
    component = fixture.componentInstance;
    //store = fixture.debugElement.injector.get(Store);
    store = fixture.debugElement.injector.get(Store);
    //injectedStore = store;//initial store form first launch

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
    selectedMethodStatement = CommonTestHelper.prepareObjectWithGivenkeys(keys.toArray());

    // we are having issues while testing scenarios after component launch and store initialization, so preparing the store first 
    //so that component will be initialized will be initialized with all requisites to load the  live tab..
    let array: UrlSegment[] = [];
    array.push(new UrlSegment('method-statement/archived', null)); //status id = 1
    (<ActivatedRouteStub>activatedRouteStub).url.next(array);
    mockedLiveMSListResponse = MockStoreProviderFactory.getTestMethodStatementResponseData();
    store.dispatch(new LoadMethodStatementsArchivedListCompleteAction(mockedLiveMSListResponse)); //store is already having live data //now detecting the changes so that component will be subscribed to the observables which are relevant to the Live tab         tick(300);
    fixture.detectChanges();
    selectedMethodStatement = CommonTestHelper.copyObject(mockedLiveMSListResponse.Entities[0], selectedMethodStatement);
    selectedMethodStatementCopy = CommonTestHelper.prepareObjectWithGivenkeys(keys.toArray());
    Object.assign(selectedMethodStatementCopy, selectedMethodStatement);
    tick(300);
    fixture.detectChanges();
  }));
  beforeEach(() => {
    dispatchSpy = spyOn(store, 'dispatch');
    canCreateExampleMSSpy = spyOn(claimsHelperServiceStub, 'canCreateExampleMS');
    let tbdElement = fixture.debugElement.query(By.css('#methodStatementList_divBody_0'));
    columnDivs = tbdElement.queryAll(By.css('.table__heading'));
    actions = component.actions;
    viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
    reinstateAction = CommonTestHelper.getGivenButton(actions.toArray(), 'reinstate');
  });

  describe('Method Statements within the Archived Tab will display Message and the following columns:', () => {
    it('Archived notification message', () => {
      let spanNotify: HTMLSpanElement = fixture.debugElement.query(By.css('#incidentNotification_spanNotify_1')).nativeElement;
      expect(spanNotify.innerHTML).toEqual('METHOD_STATEMENTS_MANAGE.ARCHIVED_TAB_MSG');
    });

    it('Name,Client name, description with sort options', () => {
      assertFun(columnDivs, 0, 'METHOD_STATEMENTS_MANAGE.NAME', 'name');
      assertFun(columnDivs, 1, 'METHOD_STATEMENTS_MANAGE.CLIENTNAME', 'clientname');
      assertFun(columnDivs, 2, 'METHOD_STATEMENTS_MANAGE.START_DATE', 'startdate');
      assertFun(columnDivs, 3, 'METHOD_STATEMENTS_MANAGE.END_DATE', 'enddate');
      assertFun(columnDivs, 4, 'METHOD_STATEMENTS_MANAGE.SITENAME', 'sitename');
    });

    it('Should display the records', () => {
      let tblItemElements = fixture.debugElement.queryAll(By.css('.table__row'));
      expect(mockedLiveMSListResponse.Entities.length).toEqual(tblItemElements.length);
    });

  });

  describe('Taking action on a Method Statement:', () => {
    it('When they go to the archived Tab, and they select a Method Statement and then the Action of View, redirected to view page', fakeAsync(() => {
      //sending the selected methodstatement as next Object..
      viewAssertFun(component, selectedMethodStatement, selectedMethodStatementCopy, routerMock, viewAction, fixture);
    }));

    it('When they go to the archived Tab, and they select a Method Statement and then the Action of Re-instate, method statement will be re-instated', fakeAsync(() => {
      //sending the selected methodstatement as next Object..     
      reInstateAssertFun(component, selectedMethodStatement, selectedMethodStatementCopy, reinstateAction, claimsHelperServiceStub, dispatchSpy, fixture);
    }));

  });
});

