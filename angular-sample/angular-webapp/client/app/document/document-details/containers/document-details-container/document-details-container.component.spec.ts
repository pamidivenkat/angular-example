import { DocumentDetailsContainerComponent } from './document-details-container.component';
import { ComponentFixture } from '@angular/core/testing';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { AtlasElementsModule } from './../../../../atlas-elements/atlas-elements.module';
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasSharedModule } from './../../../../shared/atlas-shared.module';
import { StoreModule, Store } from '@ngrx/store';
import { reducer } from './../../../../shared/reducers';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbServiceStub } from './../../../../shared/testing/mocks/breadcrumb-service-mock';
import { LocaleServiceStub } from './../../../../shared/testing/mocks/locale-service-stub';
import { TranslationServiceStub } from './../../../../shared/testing/mocks/translation-service-stub';
import { LocalizationConfig } from './../../../../shared/localization-config';
import { LocalizationConfigStub } from './../../../../shared/testing/mocks/localization-config-stub';
import { Router, ActivatedRoute, RouterModule, RouterOutletMap } from '@angular/router';
import { RouterMock } from './../../../../shared/testing/mocks/router-stub';
import { ActivatedRouteStub } from './../../../../shared/testing/mocks/activated-route-stub';
import { ReactiveFormsModule } from '@angular/forms';
import { DocumentSharedModule } from './../../../document-shared/document-shared.module';
import { DocumentDetailsService } from './../../services/document-details.service';
import { DocumentDetailsServiceStub } from './../../../../shared/testing/mocks/document-details-service-stub';
import { DocumentExporttocqcService } from './../../services/document-export-to-cqc.service';
import { DocumentExporttocqcServiceStub } from './../../../../shared/testing/mocks/document-export-to-cqc-service-stub';
import { DocumentFullDetailsComponent } from './../../components/document-full-details/document-full-details.component';
import { DocumentChangeHistoryComponent } from './../../components/document-change-history/document-change-history.component';
import { DocumentEmployeeActionstatusComponent } from './../../components/document-employee-actionstatus/document-employee-actionstatus.component';
import { DocumentDistributeHistoryComponent } from './../../components/document-distribute-history/document-distribute-history.component';
import { documentDetailsRoutes } from './../../documentdetails.routes';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { ClaimsHelperServiceStub } from './../../../../shared/testing/mocks/claims-helper-service-mock';
import { LocationStrategyStub } from './../../../../shared/testing/mocks/location-strategy-stub';
import { RouteParams } from './../../../../shared/services/route-params';
import { RouteParamsMock } from './../../../../shared/testing/mocks/route-params-mock';
import { RouterOutletMapStub } from './../../../../shared/testing/mocks/router-outlet-stub';
import { RouterTestingModule } from '@angular/router/testing';
import { DocumentCategoryService } from './../../../services/document-category-service';
import { DocumentCategoryServiceStub } from './../../../../shared/testing/mocks/document-category-service-stub';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { DocumentDetailsType } from './../../models/document-details-model';
import { LoadDocumentDetailsComplete } from './../../actions/document-details.actions';
import { extractDocumentDetails } from './../../common/document-details-extract-helper';
import { MockStoreProviderFactory } from './../../../../shared/testing/mocks/mock-store-provider-factory';
import { ResponseOptions, Response } from '@angular/http';
import { MessengerService } from './../../../../shared/services/messenger.service';

describe('Document details container component', () => {
    let component: DocumentDetailsContainerComponent;
    let fixture: ComponentFixture<DocumentDetailsContainerComponent>;
    let store: any;
    let breadCumServiceStub: any;
    let localeServiceStub: any;
    let translationServiceStub: any;
    let localizationConfigStub: any;
    let routerMock: any;
    let activatedRouteStub: any;
    let dispatchSpy: any;
    let items = [];
    let routerStub: any;
    let docDetailServiceDispatchSpy: any;
    let docDetailServiceLoadDetailSpy: any;
    let docDetailServiceCQCStatusSpy: any;
    let docDetailServiceCQCComanySpy: any;
    let docDetailService: any;

    beforeEach(async(() => {
        routerStub = new RouterMock();
        routerStub.url = '/document/document-details/f86ce3d4-8160-4bdb-8f86-a7b5f9ed7a44';

        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                AtlasElementsModule,
                LocalizationModule,
                AtlasSharedModule,
                ReactiveFormsModule,
                DocumentSharedModule,
                StoreModule.provideStore(reducer),
                RouterTestingModule,
                NoopAnimationsModule
            ],
            declarations: [
                DocumentDetailsContainerComponent
                , DocumentFullDetailsComponent
                , DocumentChangeHistoryComponent
                , DocumentEmployeeActionstatusComponent
                , DocumentDistributeHistoryComponent
            ],
            providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
                , {
                    provide: ActivatedRoute
                    // , useClass: ActivatedRouteStub
                    , useValue: {
                        params: Observable.of({ id: 'f86ce3d4-8160-4bdb-8f86-a7b5f9ed7a44' })
                    }
                }
                , { provide: Router, useValue: routerStub }
                , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
                , { provide: DocumentExporttocqcService, useClass: DocumentExporttocqcServiceStub }
                , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
                , { provide: RouteParams, useClass: RouteParamsMock }
                , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
                , { provide: DocumentCategoryService, useClass: DocumentCategoryServiceStub }
                , { provide: MessengerService, useValue: jasmine.createSpyObj('MessengerServiceStub', ['publish']) }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DocumentDetailsContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        store = fixture.debugElement.injector.get(Store);
        breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
        localeServiceStub = fixture.debugElement.injector.get(LocaleService);
        translationServiceStub = fixture.debugElement.injector.get(TranslationService);
        localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
        routerMock = fixture.debugElement.injector.get(Router);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        docDetailService = fixture.debugElement.injector.get(DocumentDetailsService);
        dispatchSpy = spyOn(store, 'dispatch');
        dispatchSpy.and.callThrough();

        jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
    });

    it('component must be launched', () => {
        expect(component).toBeTruthy();
    });

    it('Document details container page should have agreed layout according to the design system', () => {
        let docFullDetail = fixture.debugElement.query(By.css('document-full-details')).nativeElement;
        expect(docFullDetail).toBeDefined();
        expect(docFullDetail).not.toBeNull();

        let docContentArea: HTMLElement = fixture.debugElement.query(By.css('#contentArea')).nativeElement;
        expect(docContentArea).toBeDefined();
        expect(docContentArea).not.toBeNull();
        expect(docContentArea.classList.contains('tab-content')).toBeTruthy();
    });

    it('verify whether fetching of document details initiated or not', fakeAsync(() => {
        expect(component.documentType).toBe(DocumentDetailsType.Document);
        expect(component.documentId).toBe('f86ce3d4-8160-4bdb-8f86-a7b5f9ed7a44');

        let data = MockStoreProviderFactory.getDocumentMockData();
        let options = new ResponseOptions({ body: data });
        let res = new Response(options);
        let obj = extractDocumentDetails(res);
        store.dispatch(new LoadDocumentDetailsComplete(obj));
        fixture.detectChanges();
        tick(60);
        // fixture.whenStable().then(() => {
        component.documentDetails$.subscribe(c => {
            expect(c).toBe(obj);
        });
        // });
    }));
});
