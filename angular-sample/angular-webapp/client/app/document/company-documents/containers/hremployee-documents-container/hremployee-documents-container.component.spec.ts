import { MockStoreCompanyDocuments } from '../../../../shared/testing/mocks/mock-store-company-documents';
import { LoadCompanyDocumentsStatCompleteAction } from '../../actions/company-documents.actions';
import { LocationStrategy } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule, RouterOutletMap } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';

import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../../shared/reducers/index';
import { reducer } from '../../../../shared/reducers/index';
import { MessengerService } from '../../../../shared/services/messenger.service';
import { ActivatedRouteStub } from '../../../../shared/testing/mocks/activated-route-stub';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { RouterOutletMapStub } from '../../../../shared/testing/mocks/router-outlet-stub';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { DocumentSharedModule } from '../../../document-shared/document-shared.module';
import { routes } from '../../company-documents.routes';
import { CompanyDocumentsListComponent } from '../../components/company-documents-list/company-documents-list.component';
import { ContractsListComponent } from '../../components/contracts-list/contracts-list.component';
import { ContractsTemplateListComponent } from '../../components/contracts-template-list/contracts-template-list.component';
import { HandbooksListComponent } from '../../components/handbooks-list/handbooks-list.component';
import {
    PersonalizedContractListComponent,
} from '../../components/personalized-contract-list/personalized-contract-list.component';
import { CompanyDocumentsContainerComponent } from '../company-documents-container/company-documents-container.component';
import { HandbookPoliciesContainerComponent } from '../handbook-policies-container/handbook-policies-container.component';
import { HSDocumentsContainerComponent } from '../hsdocuments-container/hsdocuments-container.component';
import { HRemployeeDocumentsContainerComponent } from './hremployee-documents-container.component';

let tabsAssert = function (tab, tabTitle, tabName, tabCount, count, route) {
    expect(tabTitle.nativeElement.innerText.trim()).toEqual(tabName);
    expect(tabCount.nativeElement.innerText.trim()).toEqual(count);
    expect(tab.nativeNode.attributes.getNamedItem('ng-reflect-router-link').value).toEqual(route);
}

describe('HR employee document container', () => {
    let component: HRemployeeDocumentsContainerComponent;
    let fixture: ComponentFixture<HRemployeeDocumentsContainerComponent>;
    let store: Store<fromRoot.State>;
    let claimsHelperServiceMock;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                AtlasElementsModule
                , LocalizationModule
                , RouterModule.forChild(routes)
                , ReactiveFormsModule
                , DocumentSharedModule
                , StoreModule.provideStore(reducer)
            ]
            , declarations: [
                HRemployeeDocumentsContainerComponent
                , CompanyDocumentsContainerComponent
                , HSDocumentsContainerComponent
                , CompanyDocumentsListComponent
                , HandbookPoliciesContainerComponent
                , HandbooksListComponent
                , ContractsTemplateListComponent
                , PersonalizedContractListComponent
                , ContractsListComponent
            ]
            , providers: [
                BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , InjectorRef
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
                , { provide: LocationStrategy, useValue: jasmine.createSpyObj('locationStrategyMock', ['prepareExternalUrl']) }
                , MessengerService
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canViewELDocuments'
                        , 'canViewHSDocuments'
                    ])
                }
            ]
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HRemployeeDocumentsContainerComponent);
        component = fixture.componentInstance;
        store = fixture.debugElement.injector.get(Store);

        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        claimsHelperServiceMock.canViewELDocuments.and.returnValue(false);
        claimsHelperServiceMock.canViewHSDocuments.and.returnValue(false);

        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should have no tabs with out permissions', () => {
        let tabs = fixture.debugElement.queryAll(By.css('.tabs-nav__item'));
        expect(tabs.length).toEqual(0);
    });

});

describe('user with view EL documents permissions', () => {
    let component: HRemployeeDocumentsContainerComponent;
    let fixture: ComponentFixture<HRemployeeDocumentsContainerComponent>;
    let store: Store<fromRoot.State>;
    let claimsHelperServiceMock;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                AtlasElementsModule
                , LocalizationModule
                , RouterModule.forChild(routes)
                , ReactiveFormsModule
                , DocumentSharedModule
                , StoreModule.provideStore(reducer)
            ]
            , declarations: [
                HRemployeeDocumentsContainerComponent
                , CompanyDocumentsContainerComponent
                , HSDocumentsContainerComponent
                , CompanyDocumentsListComponent
                , HandbookPoliciesContainerComponent
                , HandbooksListComponent
                , ContractsTemplateListComponent
                , PersonalizedContractListComponent
                , ContractsListComponent
            ]
            , providers: [
                BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , InjectorRef
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
                , { provide: LocationStrategy, useValue: jasmine.createSpyObj('locationStrategyMock', ['prepareExternalUrl']) }
                , MessengerService
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canViewELDocuments'
                        , 'canViewHSDocuments'
                    ])
                }
            ]
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HRemployeeDocumentsContainerComponent);
        component = fixture.componentInstance;
        store = fixture.debugElement.injector.get(Store);
        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        claimsHelperServiceMock.canViewELDocuments.and.returnValue(true);
        claimsHelperServiceMock.canViewHSDocuments.and.returnValue(false);

        store.dispatch(new LoadCompanyDocumentsStatCompleteAction(MockStoreCompanyDocuments.companyDocumentStatsMock()));

        fixture.detectChanges();
    });

    it('should have 5 tabs with permissions', () => {
        let tabTitle, tabCount;
        let tabNames = [
            'COMPANY_DOCUMENTS_TAB.AppraisalAndReviews'
            , 'COMPANY_DOCUMENTS_TAB.DisciplinariesAndGrievances'
            , 'COMPANY_DOCUMENTS_TAB.TrainigCertificates'
            , 'COMPANY_DOCUMENTS_TAB.StartersAndLeavers'
            , 'COMPANY_DOCUMENTS_TAB.GENERAL'
        ]
        let tabCounts = ['7', '6', '107', '5', '37'];
        let routes = ['appraisal-and-reviews', 'disciplinary', 'training', 'starters', 'general'];

        let tabs = fixture.debugElement.queryAll(By.css('.tabs-nav__item'));
        expect(tabs.length).toEqual(5);

        tabs.map((tab, index) => {
            tabTitle = fixture.debugElement.query(By.css('#hrDocumentList_spanHeader_' + index));
            tabCount = fixture.debugElement.query(By.css('#hrDocumentList_spanCount_' + index));
            tabsAssert(tab, tabTitle, tabNames[index], tabCount, tabCounts[index], routes[index]);
        });
    });
});

describe('user with view HS documents permissions', () => {
    let component: HRemployeeDocumentsContainerComponent;
    let fixture: ComponentFixture<HRemployeeDocumentsContainerComponent>;
    let store: Store<fromRoot.State>;
    let claimsHelperServiceMock;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                AtlasElementsModule
                , LocalizationModule
                , RouterModule.forChild(routes)
                , ReactiveFormsModule
                , DocumentSharedModule
                , StoreModule.provideStore(reducer)
            ]
            , declarations: [
                HRemployeeDocumentsContainerComponent
                , CompanyDocumentsContainerComponent
                , HSDocumentsContainerComponent
                , CompanyDocumentsListComponent
                , HandbookPoliciesContainerComponent
                , HandbooksListComponent
                , ContractsTemplateListComponent
                , PersonalizedContractListComponent
                , ContractsListComponent
            ]
            , providers: [
                BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , InjectorRef
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
                , { provide: LocationStrategy, useValue: jasmine.createSpyObj('locationStrategyMock', ['prepareExternalUrl']) }
                , MessengerService
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canViewELDocuments'
                        , 'canViewHSDocuments'
                    ])
                }
            ]
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HRemployeeDocumentsContainerComponent);
        component = fixture.componentInstance;
        store = fixture.debugElement.injector.get(Store);
        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        claimsHelperServiceMock.canViewELDocuments.and.returnValue(false);
        claimsHelperServiceMock.canViewHSDocuments.and.returnValue(true);

        store.dispatch(new LoadCompanyDocumentsStatCompleteAction(MockStoreCompanyDocuments.companyDocumentStatsMock()));

        fixture.detectChanges();
    });

    it('should have two tab with permission', () => {
        let tabTitle, tabCount;
        let tabNames = [
            'COMPANY_DOCUMENTS_TAB.TrainigCertificates'
            , 'COMPANY_DOCUMENTS_TAB.GENERAL'
        ]
        let tabCounts = ['107', '37'];
        let routes = ['training', 'general']

        let tabs = fixture.debugElement.queryAll(By.css('.tabs-nav__item'));
        expect(tabs.length).toEqual(2);

        tabs.map((tab, index) => {
            tabTitle = fixture.debugElement.query(By.css('#hrDocumentList_spanHeader_' + index));
            tabCount = fixture.debugElement.query(By.css('#hrDocumentList_spanCount_' + index));
            tabsAssert(tab, tabTitle, tabNames[index], tabCount, tabCounts[index], routes[index]);
        });
    });

});