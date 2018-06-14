import { Site } from '../../../company/sites/models/site.model';
import { By } from '@angular/platform-browser';
import { MessengerService } from './../../../shared/services/messenger.service';
import { RouterTestingModule } from '@angular/router/testing';
import { LocationStrategyStub } from './../../../shared/testing/mocks/location-strategy-stub';
import { LocationStrategy } from '@angular/common/src/location/location_strategy';
import { ActivatedRouteStub } from './../../../shared/testing/mocks/activated-route-stub';
import { BreadcrumbServiceStub } from './../../../shared/testing/mocks/breadcrumb-service-mock';
import { ManageListComponent } from './../../components/manage-list/manage-list.component';
import { addOrUpdateAtlasParamValue } from '../../../root-module/common/extract-helpers';
import { RouterMock } from './../../../shared/testing/mocks/router-stub';
import { StoreInjectorComponent } from './../../../shared/testing/mocks/components/store-injector/store-injector.component';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { isNullOrUndefined } from 'util';
import { LoadMethodStatementsStatsCompleteAction, LoadMethodStatementsStatsAction, ClearMethodStatementStateAction, LoadMethodStatementsFiltersChangedAction } from './../../actions/methodstatements.actions';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { ClaimsHelperServiceStub } from './../../../shared/testing/mocks/claims-helper-service-mock';
import { RouteParamsMock } from './../../../shared/testing/mocks/route-params-mock';
import { LoadSitesAction, LoadSitesCompleteAction } from './../../../shared/actions/company.actions';
import { SitesLoadCompleteAction } from './../../../company/sites/actions/sites.actions';
import { LocalizationConfigStub } from './../../../shared/testing/mocks/localization-config-stub';
import { InjectorStub } from './../../../shared/testing/mocks/injector-stub';
import { TranslationHandlerStub } from './../../../shared/testing/mocks/translation-handler-stub';
import { TranslationProviderStub } from './../../../shared/testing/mocks/translation-provider-stub';
import { State, reducers } from './../../../shared/reducers/index';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { TranslationServiceStub } from './../../../shared/testing/mocks/translation-service-stub';
import { LocaleServiceStub } from './../../../shared/testing/mocks/locale-service-stub';
import { RouteParams } from './../../../shared/services/route-params';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { MockStore } from './../../../shared/testing/mocks/mock-store';
import { MethodStatementsModule } from './../../method-statements.module';
import { SnackbarModel } from './../../../atlas-elements/common/models/snackbar-model';
import { MethodStatementRouteResolve } from './../../method-statements-route-resolver';
import { LocalizationConfig } from './../../../shared/localization-config';
import { AtlasSharedModule } from './../../../shared/atlas-shared.module';
import { RouterModule, ActivatedRoute, Router, NavigationExtras, RouterOutletMap } from '@angular/router';
import { AtlasElementsModule } from './../../../atlas-elements/atlas-elements.module';
import { MethodStatementCopyModule } from './../../method-statement-copy/method-statement-copy.module';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import * as Immutable from 'immutable';

import { MethodStatementsContainerComponent } from './method-statements-container.component';
import {
  LocaleConfig,
  LocaleDatePipe,
  LocaleService,
  LocaleStorage,
  TranslationConfig,
  TranslationHandler,
  TranslationModule,
  TranslationProvider,
  TranslationService,
  Localization,
  InjectorRef,
  LocalizationModule,
} from 'angular-l10n';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { routes } from './../../method-statements.routes';
import { BehaviorSubject, Subject, Subscription, Observable, Observer } from 'rxjs/Rx';
import { ChangeDetectorRef, Injector, NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import * as fromRoot from '../../../shared/reducers';
import { Store, combineReducers } from "@ngrx/store";
import { reducer } from '../../../shared/reducers/index';
import { RouterOutletMapStub } from '../../../shared/testing/mocks/router-outlet-stub';

// import {
//   L10nConfig,
//   L10nLoader,
//   LocalizationModule,
//   StorageStrategy,
//   ProviderType
// } from 'angular-l10n';


export class MockLocalizationConfig {

}
export class MockMethodStatementRouteResolve {

}

let exampleCount, pendingCount, liveCount, completedCount, archivedCount = 0;



describe('Method Statements Container Component - Isolated tests', () => {
  let component: MethodStatementsContainerComponent;
  //let injector: Injector = new InjectorStub();
  let fixture: ComponentFixture<MethodStatementsContainerComponent>;
  //TranslationService


  let changeDetectorRef: ChangeDetectorRef;
  let activatedRoute: ActivatedRoute;
  let router: any = new RouterMock();
  let fb: FormBuilder = new FormBuilder();
  let claimsHelper: any = new ClaimsHelperServiceStub();
  let breadcrumbService: any;
  let routeParams: any = new RouteParamsMock();
  let configLoaded: jasmine.Spy;
  let actions = new Subject<Action>();
  let states = new Subject<fromRoot.State>();
  let despatcher: Observer<Action> = new BehaviorSubject<any>('');

  let store: Store<fromRoot.State>;
  actions = new Subject<Action>();
  states = new Subject<fromRoot.State>();



  let exampleSpy: jasmine.Spy;
  let manageMethodStmSpy: jasmine.Spy;
  let isHSConsultantSpy: jasmine.Spy;
  let isAdminSpy: jasmine.Spy;
  let navigateSpy: jasmine.Spy;
  let cidExists: boolean = false;
  let methodStatementForm: FormGroup;
  let injectorFixture: ComponentFixture<StoreInjectorComponent>;
  let injectorComponent: StoreInjectorComponent;
  let injectedStore: Store<fromRoot.State>;
  let localeServiceStub: any = new LocaleServiceStub();
  let translationServiceStub: any = new TranslationServiceStub();
  let localizationConfigStub: any = new LocalizationConfigStub();
  let dispatchSpy: jasmine.Spy

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.provideStore(reducer)],
      declarations: [StoreInjectorComponent]
    })
      .compileComponents();
    injectorFixture = TestBed.createComponent(StoreInjectorComponent);
    injectorComponent = injectorFixture.componentInstance;
    injectedStore = injectorFixture.debugElement.injector.get(Store);
    store = injectorComponent.getStore();
  }));

  beforeEach(() => {
    actions = new Subject<Action>();
    states = new Subject<fromRoot.State>();
    configLoaded = spyOn(localizationConfigStub, 'load');
    exampleSpy = spyOn(claimsHelper, 'canCreateExampleMS');
    manageMethodStmSpy = spyOn(claimsHelper, 'canManageMethodStatements');
    isHSConsultantSpy = spyOn(claimsHelper, 'isHSConsultant');
    isAdminSpy = spyOn(claimsHelper, 'isAdministrator');
    navigateSpy = spyOn(router, 'navigate');
    dispatchSpy = spyOn(store, 'dispatch');
    component = new MethodStatementsContainerComponent(localizationConfigStub
      , localeServiceStub
      , translationServiceStub
      , changeDetectorRef
      , activatedRoute
      , router
      , fb
      , store
      , claimsHelper
      , breadcrumbService
      , routeParams
    );

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Should create with injected dependencies', () => {
    it('should localization config load', () => {
      expect(configLoaded).toHaveBeenCalled();
    });
  });
  describe('Client Login - No Cid', () => {
    beforeEach(() => {
      routeParams.Cid = null;
      exampleSpy.and.returnValue(false);
      manageMethodStmSpy.and.returnValue(true);
      isHSConsultantSpy.and.returnValue(false);
      isAdminSpy.and.returnValue(false);
      component.ngOnInit();
      methodStatementForm = component.methodStatementsFilterForm;
    });
    describe('Should trigger dependency data load on ngOnInit', () => {
      it('should load sites when no sites were found in the store', () => {
        let siteLoadActionPayLoad: LoadSitesAction = (new LoadSitesAction(false));
        expect(dispatchSpy).toHaveBeenCalledWith(siteLoadActionPayLoad);
      });
      it('Should load method statement stats', () => {
        let methodStatementsStatLoadAction: LoadMethodStatementsStatsAction = (new LoadMethodStatementsStatsAction(false));
        expect(dispatchSpy).toHaveBeenCalledWith(methodStatementsStatLoadAction);
      });
      it('Should clear method statement state', () => {
        let methodStatementsClearState: LoadMethodStatementsStatsAction = (new ClearMethodStatementStateAction(true));
        expect(dispatchSpy).toHaveBeenCalledWith(methodStatementsClearState);
      });
      describe('From within the list screen the following filtering and search functionality is required', () => {
        it('Filters count should be 2', () => {
          let count: number = 0;
          Object.keys(methodStatementForm.controls).forEach(key => { count++ });
          expect(count).toEqual(2);
        });
        it('Filter by Method Statement name or reference', () => {
          let count: number = 0;
          let searchFound: boolean;
          let sitesFound: boolean;
          Object.keys(methodStatementForm.controls).forEach(key => {
            if (key == 'search')
              searchFound = true;
          });
          expect(searchFound).toBeTruthy();
        });
        it('Filter by Site', () => {
          let count: number = 0;
          let searchFound: boolean;
          let sitesFound: boolean;
          Object.keys(methodStatementForm.controls).forEach(key => {
            if (key == 'sites')
              sitesFound = true
          });
          expect(sitesFound).toBeTruthy();
        });
        it('When Filter by Method Statement name or reference is changed, it should get matching data', () => {
          let currentRequest = component.methodStatementsApiRequest;
          let obj = { event: { target: { value: 'nameFilter' } } };
          component.onNameFilterChange(obj);
          currentRequest.Params = addOrUpdateAtlasParamValue(currentRequest.Params, 'ByNameOrReference', 'nameFilter');
          let methodStatementFilterChangedAction: LoadMethodStatementsFiltersChangedAction = (new LoadMethodStatementsFiltersChangedAction(currentRequest));
          expect(dispatchSpy).toHaveBeenCalledWith(methodStatementFilterChangedAction);
        });
        it('When Filter by Site is changed, it should get the matching data', () => {
          let currentRequest = component.methodStatementsApiRequest;
          let obj = { SelectedItem: { Value: 'D0AEB6B2-E772-47F9-9C71-BBEB5A9EE168' } };
          component.onSiteFilterChange(obj);
          currentRequest.Params = addOrUpdateAtlasParamValue(currentRequest.Params, 'MSBySiteId', 'D0AEB6B2-E772-47F9-9C71-BBEB5A9EE168');
          let methodStatementFilterChangedAction: LoadMethodStatementsFiltersChangedAction = (new LoadMethodStatementsFiltersChangedAction(currentRequest));
          expect(dispatchSpy).toHaveBeenCalledWith(methodStatementFilterChangedAction);
        });
      });
      it('Cid exists should be false', () => {
        expect(component.cidExists).toBeFalsy();
      });


      describe('Method Statements will be displayed in Tabs, a Tab for each Status, therefore Tabs will be displayed, left to right, for Method Statements with a Status of:', () => {
        it('Live tab url should be "live"', () => {
          expect(component.getLiveUrl()).toEqual('live');
        });
        it('Pending tab url should be "pending"', () => {
          expect(component.getPendingUrl()).toEqual('pending');
        });
        it('Completed tab url should be "completed"', () => {
          expect(component.getCompleteUrl()).toEqual('completed');
        });
        it('Examples tab url should be "examples"', () => {
          expect(component.getExamplesUrl()).toEqual('examples');
        });
        it('Archived tab url should be "archived"', () => {
          expect(component.getArchivedUrl()).toEqual('archived');
        });
      });
      // here component should be subscribed to store values correctly
      describe('Should be subscribed to store values', () => {
        beforeEach(() => {

        });
        it('should pick up updated sites', fakeAsync(() => {
          dispatchSpy.and.callThrough();
          let loadedSites: Immutable.List<AeSelectItem<string>> = null;
          component.sites$.subscribe((val) => {
            loadedSites = val;
          });
          let mockedSites = MockStoreProviderFactory.getTestSites();
          store.dispatch(new LoadSitesCompleteAction(mockedSites));
          let mockedImmutableSitesData: Immutable.List<AeSelectItem<string>> = MockStoreProviderFactory.getTestSitesImmutableData();
          //mockedImmutableSitesData = mockedImmutableSitesData.set(0, new AeSelectItem<string>('Testing', 'Testing-Abc'));
          tick(300);
          expect(loadedSites.toArray()).toEqual(mockedImmutableSitesData.toArray());
        }));

        it('Each Tab will display a count of the number of Method Statements with the relevant status, i.e. the number of Method Statements listed in that Tab', fakeAsync(() => {
          dispatchSpy.and.callThrough();
          let mockedStats = MockStoreProviderFactory.getTestMethodStatementStats();
          store.dispatch(new LoadMethodStatementsStatsCompleteAction(mockedStats));
          let exItem = mockedStats.find(obj => obj.StatusId == -1);
          if (!isNullOrUndefined(exItem))
            exampleCount = exItem.Count;

          let pendingItem = mockedStats.find(obj => obj.StatusId == 0);
          if (!isNullOrUndefined(pendingItem))
            pendingCount = pendingItem.Count;

          let liveItem = mockedStats.find(obj => obj.StatusId == 1);
          if (!isNullOrUndefined(liveItem))
            liveCount = liveItem.Count;



          let completedItem = mockedStats.find(obj => obj.StatusId == 3);
          if (!isNullOrUndefined(completedItem))
            completedCount = completedItem.Count;

          let archivedItem = mockedStats.find(obj => obj.StatusId == 4);
          if (!isNullOrUndefined(archivedItem))
            archivedCount = archivedItem.Count;
          tick(300);
          expect(exampleCount).toEqual(component.exampleStatsCount);
          expect(pendingCount).toEqual(component.pendingStatsCount);
          expect(liveCount).toEqual(component.liveStatsCount);
          expect(completedCount).toEqual(component.completedStatsCount);
          expect(archivedCount).toEqual(component.archivedStatsCount);

        }));

      });
    });
  });
  describe('Should redirect to default landing page', () => {
    it('Service Owner it should be land to "/method-statement/live"', () => {
      exampleSpy.and.returnValue(false);
      router.url = '/method-statement';
      component.navigateMenuUrl();
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      };
      expect(navigateSpy).toHaveBeenCalledWith(['/method-statement/live'], navigationExtras);
    });
  });
});


describe('Method Statements Container Component - Integration tests ( test bed ) ', () => {
  let component: MethodStatementsContainerComponent;
  //let injector: Injector = new InjectorStub();
  let fixture: ComponentFixture<MethodStatementsContainerComponent>;
  let changeDetectorRef: ChangeDetectorRef;
  let fb: FormBuilder = new FormBuilder();
  let configLoaded: jasmine.Spy;

  //let reducer: Observer<ActionReducer<any>> = new BehaviorSubject<ActionReducer<any>>(combineReducer)
  let store: Store<fromRoot.State>;//  = MockStoreProviderFactory.createInitialStore();

  //let store = MockStore<fromRoot.State>({ actions, states });


  let exampleSpy: jasmine.Spy;
  let manageMethodStmSpy: jasmine.Spy;
  let isHSConsultantSpy: jasmine.Spy;
  let isAdminSpy: jasmine.Spy;
  let navigateSpy: jasmine.Spy;
  let cidExists: boolean = false;
  let methodStatementForm: FormGroup;
  let injectorFixture: ComponentFixture<StoreInjectorComponent>;
  let injectorComponent: StoreInjectorComponent;
  let injectedStore: Store<fromRoot.State>;

  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any
  let routeParamsStub: any;
  let allTabs: DebugElement[];
  let mockedSites = [];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MethodStatementCopyModule,
        AtlasElementsModule,
        RouterTestingModule,
        //RouterModule.forChild(routes),        
        LocalizationModule,
        AtlasSharedModule
        , TranslationModule.forRoot()
        , StoreModule.provideStore(reducer)
      ],
      declarations: [MethodStatementsContainerComponent, ManageListComponent],
      providers: [
        InjectorRef
        , MessengerService
        // , LocalizationConfig
        // , LocaleService
        // , TranslationService
        // , LocaleConfig
        // , LocaleStorage
        // , TranslationConfig
        // , TranslationHandler
        // , TranslationProvider         
        // ,{
        //   provide: LocalizationConfig,
        //   useFactory: localizationConfigFactory,
        //   deps: []
        // },
        // , { provide: LocationStrategy, useClass: LocationStrategyStub }  
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: RouteParams, useClass: RouteParamsMock }
        , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
      ]
    })
      .overrideComponent(MethodStatementsContainerComponent, { set: { host: { "(click)": "dummy" } } })
      .compileComponents();

  }));

  beforeEach(fakeAsync(() => {

    fixture = TestBed.createComponent(MethodStatementsContainerComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);
    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    routerMock = fixture.debugElement.injector.get(Router);
    activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
    claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
    routeParamsStub = fixture.debugElement.injector.get(RouteParams);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;


    configLoaded = spyOn(localizationConfigStub, 'load');

    exampleSpy = spyOn(claimsHelperServiceStub, 'canCreateExampleMS');
    manageMethodStmSpy = spyOn(claimsHelperServiceStub, 'canManageMethodStatements');
    isHSConsultantSpy = spyOn(claimsHelperServiceStub, 'isHSConsultant');
    isAdminSpy = spyOn(claimsHelperServiceStub, 'isAdministrator');
    navigateSpy = spyOn(routerMock, 'navigate');

    routeParamsStub.Cid = null;
    exampleSpy.and.returnValue(false);
    manageMethodStmSpy.and.returnValue(true);
    isHSConsultantSpy.and.returnValue(false);
    isAdminSpy.and.returnValue(false);


    let mockedStats = MockStoreProviderFactory.getTestMethodStatementStats();
    store.dispatch(new LoadMethodStatementsStatsCompleteAction(mockedStats));
    let exItem = mockedStats.find(obj => obj.StatusId == -1);
    if (!isNullOrUndefined(exItem))
      exampleCount = exItem.Count;

    let pendingItem = mockedStats.find(obj => obj.StatusId == 0);
    if (!isNullOrUndefined(pendingItem))
      pendingCount = pendingItem.Count;

    let liveItem = mockedStats.find(obj => obj.StatusId == 1);
    if (!isNullOrUndefined(liveItem))
      liveCount = liveItem.Count;



    let completedItem = mockedStats.find(obj => obj.StatusId == 3);
    if (!isNullOrUndefined(completedItem))
      completedCount = completedItem.Count;

    let archivedItem = mockedStats.find(obj => obj.StatusId == 4);
    if (!isNullOrUndefined(archivedItem))
      archivedCount = archivedItem.Count;

    fixture.debugElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();



  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Access to create a new method statement & default filter values', () => {
    beforeEach(() => {
      methodStatementForm = component.methodStatementsFilterForm;
      fixture.detectChanges();
    });

    it('Default Name filter should be all', (() => {
      let aeInput = fixture.debugElement.query(By.css('#msList_AeInput_1')).nativeElement
      expect(aeInput.value).toBeFalsy();
    }));

    it('Default Site filter should be all', (() => {
      let aeInput = fixture.debugElement.query(By.css('#msList_AeSelect_1')).nativeElement;
      expect(aeInput.selectedValue).toBeUndefined();
    }));

    it('should have a landing page notification message', fakeAsync(() => {
      fixture.detectChanges();
      tick(100);
      let spanNotify: HTMLElement = fixture.debugElement.query(By.css('#msList_AeNotification_1_spanNotify_1')).nativeElement;
      expect(spanNotify.innerHTML).toEqual('METHOD_STATEMENTS_MANAGE.METHODSTATEMENT_LANDING_PAGE_MSG');
    }));


    it('should have option to create a new method statement', fakeAsync(() => {
      fixture.detectChanges();
      tick(100);
      let aeAnchor = fixture.debugElement.query(By.css('#msList_addNewMs_1')).nativeElement;
      expect(aeAnchor).not.toBeUndefined();
    }));

    it('when add new method statement is clicked user should be navigated to add new method statement page', fakeAsync(() => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      };
      fixture.detectChanges();
      tick(100);
      let aeAnchor: HTMLAnchorElement = fixture.debugElement.query(By.css('#msList_addNewMs_1')).nativeElement;
      expect(aeAnchor).not.toBeUndefined();
      aeAnchor.click();
      fixture.detectChanges();
      tick(100);
      expect(navigateSpy).toHaveBeenCalledWith(['/method-statement/add'], navigationExtras);
    }));

    it('should not have option to create a new method statement when no permission is given', async(() => {
      manageMethodStmSpy.and.returnValue(false);
      component.methodStatementsApiRequest.Params = Array.from(addOrUpdateAtlasParamValue(component.methodStatementsApiRequest.Params, 'ByNameOrReference', 'test-2updated'));
      fixture.debugElement.triggerEventHandler('click', null);
      fixture.detectChanges();
      fixture.whenStable().then(() => { // wait for async getQuote
        fixture.detectChanges();
        let aeAnchor = fixture.debugElement.query(By.css('#msList_addNewMs_1'));
        expect(aeAnchor).toBeNull();
      });

    }));

  });


  describe('Method Statements will be displayed in Tabs, a Tab for each Status, therefore Tabs will be displayed, left to right, for Method Statements with a Status of', () => {
    beforeEach(fakeAsync(() => {
      let tabStrip: DebugElement = fixture.debugElement.query(By.css('#msList_AeTabStrip_1'));
      allTabs = tabStrip.queryAll(By.css('.tabs-nav__item'));
    }));

    it('Should have 5 tabs', (() => {
      expect(allTabs.length).toEqual(5);
    }));

    it('First tab should be live and has count', fakeAsync(() => {

      expect(allTabs[0]).not.toBeUndefined();
      let divElement = allTabs[0].query(By.css('.tabs-with-count'));
      expect(divElement).not.toBeUndefined();
      let spans = divElement.queryAll(By.css('span'));
      expect((<HTMLSpanElement>spans[0].nativeElement).textContent.toLowerCase()).toContain('live');
      expect((<HTMLSpanElement>spans[1].nativeElement).textContent).toEqual(liveCount.toString())
    }));

    it('Second tab should be pending and has count', fakeAsync(() => {

      expect(allTabs[1]).not.toBeUndefined();
      let divElement = allTabs[1].query(By.css('.tabs-with-count'));
      expect(divElement).not.toBeUndefined();
      let spans = divElement.queryAll(By.css('span'));
      expect((<HTMLSpanElement>spans[0].nativeElement).textContent.toLowerCase()).toContain('pending');
      expect((<HTMLSpanElement>spans[1].nativeElement).textContent).toEqual(pendingCount.toString());
    }));

    it('Third tab should be completed and has count', fakeAsync(() => {

      expect(allTabs[2]).not.toBeUndefined();
      let divElement = allTabs[2].query(By.css('.tabs-with-count'));
      expect(divElement).not.toBeUndefined();
      let spans = divElement.queryAll(By.css('span'));
      expect((<HTMLSpanElement>spans[0].nativeElement).textContent.toLowerCase()).toContain('completed');
      expect((<HTMLSpanElement>spans[1].nativeElement).textContent).toEqual(completedCount.toString());
    }));

    it('Fourth tab should be examples and has count', fakeAsync(() => {

      expect(allTabs[3]).not.toBeUndefined();
      let divElement = allTabs[3].query(By.css('.tabs-with-count'));
      expect(divElement).not.toBeUndefined();
      let spans = divElement.queryAll(By.css('span'));
      expect((<HTMLSpanElement>spans[0].nativeElement).textContent.toLowerCase()).toContain('examples');
      expect((<HTMLSpanElement>spans[1].nativeElement).textContent).toEqual(exampleCount.toString());
    }));

    it('Fifth tab should be archived and has count', fakeAsync(() => {

      expect(allTabs[4]).not.toBeUndefined();
      let divElement = allTabs[4].query(By.css('.tabs-with-count'));
      expect(divElement).not.toBeUndefined();
      let spans = divElement.queryAll(By.css('span'));
      expect((<HTMLSpanElement>spans[0].nativeElement).textContent.toLowerCase()).toContain('archived');
      expect((<HTMLSpanElement>spans[1].nativeElement).textContent).toEqual(archivedCount.toString());
    }));

  });

  describe('Given a Service Owner, HS Service Owner or HS Co-ordinator wishes to filter their Method Statements by site or name , then the Method Statements for the site selected will be displayed.', () => {
    beforeEach(fakeAsync(() => {
      //despatch the event to load the sites so that component UI will be updated with sites
      mockedSites = MockStoreProviderFactory.getTestSites();
      store.dispatch(new LoadSitesCompleteAction(mockedSites));  
      let nameControl = fixture.debugElement.query(By.css('#msList_AeInput_1'));    
      let objValue = { target: { value: '' } };
      nameControl.triggerEventHandler('input', objValue);
      tick(100);
      fixture.detectChanges();
      tick(100);
    }));

    it('Sites drop down should have given sites', (() => {
      let nameControl: HTMLSelectElement = fixture.debugElement.query(By.css('#msList_AeSelect_1')).nativeElement;
      expect(nameControl.options.length).toEqual(mockedSites.length + 1);
      //now assert the drop down has all the sites values that are dispatched//we no need to assert the same items are displayed in drop down since its related to base component

    }));

    it('When Name is changed changed, it should filter the method statements by name or reference', fakeAsync(() => {
      let dispatchSpy: jasmine.Spy = spyOn(store, 'dispatch');
      let currentRequest = component.methodStatementsApiRequest;
      let nameControl = fixture.debugElement.query(By.css('#msList_AeInput_1'));
      let typeOfControl = nameControl instanceof HTMLInputElement;
      
      expect(nameControl.componentInstance.constructor.name).toEqual('AeInputComponent');
      //expect(typeOfControl).toBeTruthy();

      let objValue = { target: { value: 'name filter Changed' } };
      nameControl.triggerEventHandler('input', objValue);
      fixture.detectChanges();
      tick(200);
      currentRequest.Params = addOrUpdateAtlasParamValue(currentRequest.Params, 'ByNameOrReference', 'name filter Changed');
      let methodStatementFilterChangedAction: LoadMethodStatementsFiltersChangedAction = (new LoadMethodStatementsFiltersChangedAction(currentRequest));
      expect(dispatchSpy).toHaveBeenCalledWith(methodStatementFilterChangedAction);
    }));
    it('When site filter is changed, it should filter the method statements by site', fakeAsync(() => {
      let dispatchSpy: jasmine.Spy = spyOn(store, 'dispatch');
      let currentRequest = component.methodStatementsApiRequest;
      let nameControl = fixture.debugElement.query(By.css('#msList_AeSelect_1'));
      let typeOfControl = nameControl instanceof HTMLSelectElement;
      
      expect(nameControl.componentInstance.constructor.name).toEqual('AeSelectComponent');
      //expect(typeOfControl).toBeTruthy();
      let objValue = { target: { value: 'A5346191-DC8F-4BAD-8D98-02080AEE9A22' } };
      nameControl.triggerEventHandler('change', objValue);
      fixture.detectChanges();
      tick(200);
      currentRequest.Params = addOrUpdateAtlasParamValue(currentRequest.Params, 'MSBySiteId', 'A5346191-DC8F-4BAD-8D98-02080AEE9A22');
      let methodStatementFilterChangedAction: LoadMethodStatementsFiltersChangedAction = (new LoadMethodStatementsFiltersChangedAction(currentRequest));
      expect(dispatchSpy).toHaveBeenCalledWith(methodStatementFilterChangedAction);
    }));
  });
});

