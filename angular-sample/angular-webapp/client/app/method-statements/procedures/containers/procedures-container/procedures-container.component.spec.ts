import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpStub, mockHttpProvider, restClientServiceProvider } from './../../../../shared/testing/mocks/http-stub';
import { RestClientServiceStub } from './../../../../shared/testing/mocks/rest-client-service-stub';
import { AuthorizationEffectsStub } from '../../../../shared/testing/mocks/authorize-effects-stub';
import { AuthorizationEffects } from '../../../../shared/effects/authorization.effects';
import { CookieService } from 'ngx-cookie';
import { StorageService } from '../../../../shared/services/storage.service';
import { AuthorizationServiceStub, AuthorizationServiceFactory } from '../../../../shared/testing/mocks/authorization-service-mock';
import { CookieServiceStub } from '../../../../shared/testing/mocks/cookie-service-stub';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../../shared/reducers';
import { CommonModule, LocationStrategy } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { RouterModule, Router, ActivatedRoute, NavigationExtras, RouterOutletMap } from '@angular/router';
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasSharedModule } from '../../../../shared/atlas-shared.module';
import { EmailSharedModule } from '../../../../email-shared/email-shared.module';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbServiceStub } from '../../../../shared/testing/mocks/breadcrumb-service-mock';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { LocalizationConfig } from '../../../../shared/localization-config';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { LocalizationConfigStub } from '../../../../shared/testing/mocks/localization-config-stub';
import { ActivatedRouteStub } from '../../../../shared/testing/mocks/activated-route-stub';
import { ClaimsHelperServiceStub } from '../../../../shared/testing/mocks/claims-helper-service-mock';
import { RouteParamsMock } from '../../../../shared/testing/mocks/route-params-mock';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { RouteParams } from '../../../../shared/services/route-params';
import { MessengerService } from '../../../../shared/services/messenger.service';
import { ConnectionBackend, Http, HttpModule, XHRBackend, RequestOptions, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { RestClientService } from '../../../../shared/data/rest-client.service';
import { AuthorizationService } from '../../../../shared/security/authorization.service';
import { AuthConfig, authConfigServiceFactory } from '../../../../shared/security/auth-config';
import { StorageServiceStub } from '../../../../shared/testing/mocks/storage-service-mock';
import { reducer } from '../../../../shared/reducers/index';
import { By } from '@angular/platform-browser';
import { DebugElement, EventEmitter } from '@angular/core';
import { AtlasApiRequest, AtlasApiRequestWithParams, AtlasParams } from '../../../../shared/models/atlas-api-response';
import { MockStoreProviderFactory } from '../../../../shared/testing/mocks/mock-store-provider-factory';
import { BehaviorSubject } from 'rxjs';
import * as Immutable from 'immutable';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { CommonTestHelper } from '../../../../shared/testing/helpers/common-test-helper';
import { AeTabItemComponent } from '../../../../atlas-elements/ae-tab/ae-tab-item/ae-tab-item.component';
import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { routes } from './../../procedure.routes';
import { ProceduresContainerComponent } from './procedures-container.component';
import { ProcedureListComponent } from './../../components/procedure-list/procedure-list.component';
import { ProcedureAddUpdateComponent } from './../../components/procedure-add-update/procedure-add-update.component';
import { ProcedureViewComponent } from './../../components/procedure-view/procedure-view.component';
import { ProcedureCopyComponent } from './../../components/procedure-copy/procedure-copy.component';
import { ProcedureService } from '../../services/procedure.service';
import { RouterOutletMapStub } from '../../../../shared/testing/mocks/router-outlet-stub';
import { LocationStrategyStub } from './../../../../shared/testing/mocks/location-strategy-stub';
describe('ProceduresContainerComponent', () => {
  let component: ProceduresContainerComponent;
  let fixture: ComponentFixture<ProceduresContainerComponent>;
  let store: Store<fromRoot.State>;
  let dispatchSpy: jasmine.Spy;
  let configLoaded: jasmine.Spy;
  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any;
  let routeParamsStub: any;
  let _http: any;
  let exampleSpy: jasmine.Spy;
  let manageProceduresSpy: jasmine.Spy;
  let navigateSpy: jasmine.Spy;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        RouterModule.forChild(routes),
        LocalizationModule,
        AtlasSharedModule,
        EmailSharedModule,
        NoopAnimationsModule,
        StoreModule.provideStore(reducer),
      ],
      declarations: [
        ProceduresContainerComponent
        , ProcedureListComponent
        , ProcedureAddUpdateComponent
        , ProcedureViewComponent
        , ProcedureCopyComponent
      ],
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
        , { provide: Http, useValue: mockHttpProvider }
        , { provide: RestClientService, useClass: RestClientServiceStub }
        , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
        , MockBackend
        , BaseRequestOptions
        , MessengerService
        , FormBuilderService
        , ProcedureService
        , LocationStrategy
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProceduresContainerComponent);
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

  });
  beforeEach(() => {
    exampleSpy = spyOn(claimsHelperServiceStub, 'cancreateExampleProcedures');
    manageProceduresSpy = spyOn(claimsHelperServiceStub, 'cancreateProcedures');
    navigateSpy = spyOn(routerMock, 'navigate');
    dispatchSpy = spyOn(store, 'dispatch');
    dispatchSpy.and.callThrough();
  });

  beforeEach(() => {
    exampleSpy.and.returnValue(false);
    manageProceduresSpy.and.returnValue(true);
  });
  beforeEach(() => {
    fixture.detectChanges();
  });
  describe('Component launch:', () => {
    it('should create ProceduresContainerComponent', () => {
      expect(component).toBeTruthy();
    });
    describe('The Procedures are split by Tab:', () => {
      it('should have 2 tabs namely procedures and example procedures', () => {
        let tabs = fixture.debugElement.queryAll(By.css('.tabs-nav__item'));
        expect(tabs).toBeDefined();
        expect(tabs.length).toEqual(2);
      });
      it('Procedures tab name should be "Procedures"', () => {
        let titleFields = fixture.debugElement.query(By.css('#proceduresTabs_spanHeader_0'));
        expect(titleFields).toBeDefined();
        let proceduresTitleField = titleFields.nativeElement;
        expect(proceduresTitleField.innerText).toEqual('PROCEDURES');

      });
      it('Example Procedures tab name should be "Example procedures"', () => {
        let titleFields = fixture.debugElement.query(By.css('#proceduresTabs_spanHeader_1'));
        expect(titleFields).toBeDefined();
        let exampleProceduresTitleField = titleFields.nativeElement;
        expect(exampleProceduresTitleField.innerText).toEqual('EXAMPLE_PROCEDURES');
      });
      it('Procedures tab url should be  "custom"', () => {
        expect(component.getProceduresUrl()).toEqual('custom');
      });
      it('Example procedures tab url should be "example"', () => {
        expect(component.getExampleProceduresUrl()).toEqual('example');
      });

    });
  });
  describe('Adding a new Procedure to Atlas:', () => {
    it('Should have add button to add new procedure', () => {
      let addButton = fixture.debugElement.query(By.css('#btnAdd_aeButton_1'));
      expect(addButton).toBeDefined();
    });
    describe('Should open "Add procedure" slider', () => {
      beforeEach(() => {
        let addButton = fixture.debugElement.query(By.css('#btnAdd_aeButton_1')).nativeElement;
        addButton.click();
        fixture.detectChanges();
      });
      it('Should open "Add procedure" slider when clicked on "Add Procedure" button', () => {
        let addProcedureComponent = fixture.debugElement.query(By.css('#addUpdateProcedureForm'));
        expect(addProcedureComponent).toBeDefined();
      });
      it('Should close "Add procedure" slider when clicked on "CLOSE" button', () => {
        let closeButton = fixture.debugElement.query(By.css('#addUpdateProcedureForm_Label_1')).nativeElement;
        expect(closeButton).toBeDefined();
        closeButton.click();
        fixture.detectChanges();
        let addProcedureComponent = fixture.debugElement.query(By.css('#addUpdateProcedureForm'));
        expect(addProcedureComponent).toBeNull();
      });
    });
  });

  // tslint:disable-next-line:eofline
});