import { LocationStrategy } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule, RouterOutletMap } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';

import { AeNotificationComponent } from '../../../../atlas-elements/ae-notification/ae-notification.component';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { reducer } from '../../../../shared/reducers/index';
import * as fromRoot from '../../../../shared/reducers';
import { FileUploadService } from '../../../../shared/services/file-upload.service';
import { MessengerService } from '../../../../shared/services/messenger.service';
import { ActivatedRouteStub } from '../../../../shared/testing/mocks/activated-route-stub';
import { BreadcrumbServiceStub } from '../../../../shared/testing/mocks/breadcrumb-service-mock';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { MockStoreCompanyDocuments } from '../../../../shared/testing/mocks/mock-store-company-documents';
import { MockStoreProviderFactory } from '../../../../shared/testing/mocks/mock-store-provider-factory';
import { RouterOutletMapStub } from '../../../../shared/testing/mocks/router-outlet-stub';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import {
    ContractDistributeActionComponent,
} from '../../../document-shared/components/contract-distribute-action/contract-distribute-action.component';
import {
    DocumentReviewDistributeComponenet,
} from '../../../document-shared/components/document-review-distribute/document-review-distribute.component';
import { DocumentUpdateComponent } from '../../../document-shared/components/document-update/document-update.component';
import { InformationBarService } from '../../../services/information-bar-service';
import { LoadUsefulDocsCountCompleteAction } from '../../../usefuldocuments-templates/actions/usefuldocs.actions';
import { LoadCompanyDocumentsStatCompleteAction } from '../../actions/company-documents.actions';
import {
    LoadContractsTemplateCountCompleteAction,
    LoadPersonalContractsCountCompleteAction,
} from '../../actions/contracts.actions';
import { LoadHandbooksDocsCountCompleteAction } from '../../actions/handbooks.actions';
import { routes } from '../../company-documents.routes';
import { CompanyDocumentsListComponent } from '../../components/company-documents-list/company-documents-list.component';
import { ContractsListComponent } from '../../components/contracts-list/contracts-list.component';
import { ContractsTemplateListComponent } from '../../components/contracts-template-list/contracts-template-list.component';
import { HandbooksListComponent } from '../../components/handbooks-list/handbooks-list.component';
import {
    PersonalizedContractListComponent,
} from '../../components/personalized-contract-list/personalized-contract-list.component';
import { HandbookPoliciesContainerComponent } from '../handbook-policies-container/handbook-policies-container.component';
import {
    HRemployeeDocumentsContainerComponent,
} from '../hremployee-documents-container/hremployee-documents-container.component';
import { HSDocumentsContainerComponent } from '../hsdocuments-container/hsdocuments-container.component';
import { CompanyDocumentsContainerComponent } from './company-documents-container.component';

let tabsAssert = function (tabTitle, tabCount, tabName, count) {
    expect(tabTitle.nativeElement.innerText.trim()).toEqual(tabName);
    expect(tabCount.nativeElement.innerText.trim()).toEqual(count);
}


describe('Company document container component', () => {
    let component: CompanyDocumentsContainerComponent;
    let fixture: ComponentFixture<CompanyDocumentsContainerComponent>;
    let claimsHelperServiceMock;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , AtlasElementsModule
                , RouterModule.forChild(routes)
                , ReactiveFormsModule
                , StoreModule.provideStore(reducer)
            ]
            , declarations: [
                CompanyDocumentsContainerComponent
                , HSDocumentsContainerComponent
                , CompanyDocumentsListComponent
                , HandbookPoliciesContainerComponent
                , HandbooksListComponent
                , ContractsTemplateListComponent
                , PersonalizedContractListComponent
                , HRemployeeDocumentsContainerComponent
                , DocumentReviewDistributeComponenet
                , DocumentUpdateComponent
                , ContractsListComponent
                , ContractDistributeActionComponent
            ]
            , providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canViewHSDocuments'
                        , 'canViewELDocuments'
                        , 'canCreateContracts'
                    ])
                }
                , { provide: InformationBarService, useValue: jasmine.createSpyObj('informationBarServiceMock', ['']) }
                , { provide: FileUploadService, useValue: jasmine.createSpyObj('fileUploadServiceMock', ['']) }
                , { provide: Router, useClass: RouterMock }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
                , { provide: LocationStrategy, useValue: jasmine.createSpyObj('locationStrategyMock', ['prepareExternalUrl']) }
                , MessengerService
            ]
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsContainerComponent);
        component = fixture.componentInstance;
        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);

        fixture.detectChanges();
    });

    it('should be created with notification', () => {
        expect(component).toBeTruthy();

        let notification = fixture.debugElement.query(By.directive(AeNotificationComponent))
        expect(notification).toBeTruthy();
        expect(notification.nativeElement.innerText.trim()).toEqual('COMPANY_DOCUMENTS_TAB.LANDING_MSG');
    });

    it('should have no tabs with out permissions', () => {
        let tabs = fixture.debugElement.queryAll(By.css('.tabs-nav__item'))
        expect(tabs.length).toEqual(0);
    });

});

describe('user with view HS documents permissions', () => {
    let component: CompanyDocumentsContainerComponent;
    let fixture: ComponentFixture<CompanyDocumentsContainerComponent>;
    let claimsHelperServiceMock;
    let store: Store<fromRoot.State>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , AtlasElementsModule
                , RouterModule.forChild(routes)
                , ReactiveFormsModule
                , StoreModule.provideStore(reducer)
            ]
            , declarations: [
                CompanyDocumentsContainerComponent
                , HSDocumentsContainerComponent
                , CompanyDocumentsListComponent
                , HandbookPoliciesContainerComponent
                , HandbooksListComponent
                , ContractsTemplateListComponent
                , PersonalizedContractListComponent
                , HRemployeeDocumentsContainerComponent
                , DocumentReviewDistributeComponenet
                , DocumentUpdateComponent
                , ContractsListComponent
                , ContractDistributeActionComponent
            ]
            , providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canViewHSDocuments'
                        , 'canCreateContracts'
                        , 'canViewELDocuments'
                    ])
                }
                , { provide: InformationBarService, useValue: jasmine.createSpyObj('informationBarServiceMock', ['']) }
                , { provide: FileUploadService, useValue: jasmine.createSpyObj('fileUploadServiceMock', ['']) }
                , { provide: Router, useClass: RouterMock }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
                , { provide: LocationStrategy, useValue: jasmine.createSpyObj('locationStrategyMock', ['prepareExternalUrl']) }
                , MessengerService
            ]
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsContainerComponent);
        component = fixture.componentInstance;
        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        claimsHelperServiceMock.canViewHSDocuments.and.returnValue(true);
        store = fixture.debugElement.injector.get(Store);

        store.dispatch(new LoadCompanyDocumentsStatCompleteAction(MockStoreCompanyDocuments.companyDocumentStatsMock()));
        fixture.detectChanges();
    });

    it('should have 4 tabs', () => {
        let tabTitle, tabCount;
        let tabNames = ['COMPANY_DOCUMENTS_TAB.HealthAndSafetyDocuments', 'COMPANY_DOCUMENTS_TAB.HREmployeeDocuments', 'COMPANY_DOCUMENTS_TAB.CompanyPolicies', 'Other']
        let tabCounts = ['462', '162', '12', '589'];

        let tabs = fixture.debugElement.queryAll(By.css('.tabs-nav__item'));
        expect(tabs.length).toEqual(4);

        tabs.map((tab, index) => {
            tabTitle = fixture.debugElement.query(By.css('#companyDocuments_spanHeader_' + index));
            tabCount = fixture.debugElement.query(By.css('#companyDocuments_spanCount_' + index));
            tabsAssert(tabTitle, tabCount, tabNames[index], tabCounts[index]);
        });

    });



});

describe('user with View EL Documents', () => {
    let component: CompanyDocumentsContainerComponent;
    let fixture: ComponentFixture<CompanyDocumentsContainerComponent>;
    let claimsHelperServiceMock;
    let store: Store<fromRoot.State>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , AtlasElementsModule
                , RouterModule.forChild(routes)
                , ReactiveFormsModule
                , StoreModule.provideStore(reducer)
            ]
            , declarations: [
                CompanyDocumentsContainerComponent
                , HSDocumentsContainerComponent
                , CompanyDocumentsListComponent
                , HandbookPoliciesContainerComponent
                , HandbooksListComponent
                , ContractsTemplateListComponent
                , PersonalizedContractListComponent
                , HRemployeeDocumentsContainerComponent
                , DocumentReviewDistributeComponenet
                , DocumentUpdateComponent
                , ContractsListComponent
                , ContractDistributeActionComponent
            ]
            , providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canViewHSDocuments'
                        , 'canViewELDocuments'
                        , 'canCreateContracts'
                    ])
                }
                , { provide: InformationBarService, useValue: jasmine.createSpyObj('informationBarServiceMock', ['']) }
                , { provide: FileUploadService, useValue: jasmine.createSpyObj('fileUploadServiceMock', ['']) }
                , { provide: Router, useClass: RouterMock }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
                , { provide: LocationStrategy, useValue: jasmine.createSpyObj('locationStrategyMock', ['prepareExternalUrl']) }
                , MessengerService
            ]
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsContainerComponent);
        component = fixture.componentInstance;
        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        claimsHelperServiceMock.canViewELDocuments.and.returnValue(true);
        store = fixture.debugElement.injector.get(Store);

        store.dispatch(new LoadCompanyDocumentsStatCompleteAction(MockStoreCompanyDocuments.companyDocumentStatsMock()));
        fixture.detectChanges();
    });



    it('should have 3 tabs', () => {
        let tabTitle, tabCount;
        let tabNames = ['COMPANY_DOCUMENTS_TAB.HREmployeeDocuments','COMPANY_DOCUMENTS_TAB.CompanyPolicies', 'Other']
        let tabCounts = ['162','12', '589'];


        let tabs = fixture.debugElement.queryAll(By.css('.tabs-nav__item'))
        expect(tabs.length).toEqual(3);

        tabs.map((tab, index) => {
            tabTitle = fixture.debugElement.query(By.css('#companyDocuments_spanHeader_' + index));
            tabCount = fixture.debugElement.query(By.css('#companyDocuments_spanCount_' + index));
            tabsAssert(tabTitle, tabCount,  tabNames[index], tabCounts[index]);
        })

        // let tabTitles = fixture.debugElement.queryAll(By.css('#companyDocuments_spanHeader'));
        // expect(tabTitles[0].nativeElement.innerText.trim()).toEqual('COMPANY_DOCUMENTS_TAB.HREmployeeDocuments');
        // expect(tabTitles[1].nativeElement.innerText.trim()).toEqual('Other');

        // let tabCounts = fixture.debugElement.queryAll(By.css('#companyDocuments_spanCount'));
        // expect(tabCounts[0].nativeElement.innerText.trim()).toEqual('125');
        // expect(tabCounts[1].nativeElement.innerText.trim()).toEqual('589');

    });
});

describe('user with create contracts permission', () => {
    let component: CompanyDocumentsContainerComponent;
    let fixture: ComponentFixture<CompanyDocumentsContainerComponent>;
    let claimsHelperServiceMock;
    let store: Store<fromRoot.State>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , AtlasElementsModule
                , RouterModule.forChild(routes)
                , ReactiveFormsModule
                , StoreModule.provideStore(reducer)
            ]
            , declarations: [
                CompanyDocumentsContainerComponent
                , HSDocumentsContainerComponent
                , CompanyDocumentsListComponent
                , HandbookPoliciesContainerComponent
                , HandbooksListComponent
                , ContractsTemplateListComponent
                , PersonalizedContractListComponent
                , HRemployeeDocumentsContainerComponent
                , DocumentReviewDistributeComponenet
                , DocumentUpdateComponent
                , ContractsListComponent
                , ContractDistributeActionComponent
            ]
            , providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canViewHSDocuments'
                        , 'canViewELDocuments'
                        , 'canCreateContracts'
                    ])
                }
                , { provide: InformationBarService, useValue: jasmine.createSpyObj('informationBarServiceMock', ['']) }
                , { provide: FileUploadService, useValue: jasmine.createSpyObj('fileUploadServiceMock', ['']) }
                , { provide: Router, useClass: RouterMock }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
                , { provide: LocationStrategy, useValue: jasmine.createSpyObj('locationStrategyMock', ['prepareExternalUrl']) }
                , MessengerService
            ]
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsContainerComponent);
        component = fixture.componentInstance;
        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        claimsHelperServiceMock.canCreateContracts.and.returnValue(true);
        store = fixture.debugElement.injector.get(Store);

        store.dispatch(new LoadHandbooksDocsCountCompleteAction(MockStoreCompanyDocuments.handbookDocsCountMock()));
        store.dispatch(new LoadContractsTemplateCountCompleteAction(MockStoreCompanyDocuments.contractDocsCountMock()));
        store.dispatch(new LoadPersonalContractsCountCompleteAction(MockStoreCompanyDocuments.personalContractCountMock()));
        fixture.detectChanges();
    });


    it('should have one tab', () => {
        let tabs = fixture.debugElement.queryAll(By.css('.tabs-nav__item'))
        expect(tabs.length).toEqual(1);

        let tabTitle = fixture.debugElement.query(By.css('#companyDocuments_spanHeader_0'));
        expect(tabTitle.nativeElement.innerText.trim()).toEqual('COMPANY_DOCUMENTS_TAB.CONTRACTSHANDBOOKS');

        let tabCount = fixture.debugElement.query(By.css('#companyDocuments_spanCount_0'));
        expect(tabCount.nativeElement.innerText.trim()).toEqual('103');

        expect(tabs[0].nativeNode.attributes.getNamedItem('ng-reflect-router-link').value).toEqual('contracts-and-handbooks');

    });
});

describe('user with distribute any shared document permission', () => {
    let component: CompanyDocumentsContainerComponent;
    let fixture: ComponentFixture<CompanyDocumentsContainerComponent>;
    let claimsHelperServiceMock;
    let store: Store<fromRoot.State>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , AtlasElementsModule
                , RouterModule.forChild(routes)
                , ReactiveFormsModule
                , StoreModule.provideStore(reducer)
            ]
            , declarations: [
                CompanyDocumentsContainerComponent
                , HSDocumentsContainerComponent
                , CompanyDocumentsListComponent
                , HandbookPoliciesContainerComponent
                , HandbooksListComponent
                , ContractsTemplateListComponent
                , PersonalizedContractListComponent
                , HRemployeeDocumentsContainerComponent
                , DocumentReviewDistributeComponenet
                , DocumentUpdateComponent
                , ContractsListComponent
                , ContractDistributeActionComponent
            ]
            , providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canViewHSDocuments'
                        , 'canViewELDocuments'
                        , 'canCreateContracts'
                        , 'canDistributeAnySharedDocument'
                    ])
                }
                , { provide: InformationBarService, useValue: jasmine.createSpyObj('informationBarServiceMock', ['']) }
                , { provide: FileUploadService, useValue: jasmine.createSpyObj('fileUploadServiceMock', ['']) }
                , { provide: Router, useClass: RouterMock }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
                , { provide: LocationStrategy, useValue: jasmine.createSpyObj('locationStrategyMock', ['prepareExternalUrl']) }
                , MessengerService
            ]
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsContainerComponent);
        component = fixture.componentInstance;
        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        claimsHelperServiceMock.canDistributeAnySharedDocument.and.returnValue(true);
        store = fixture.debugElement.injector.get(Store);

        store.dispatch(new LoadUsefulDocsCountCompleteAction(MockStoreProviderFactory.getMockUsefulDocumentTotal()));
        fixture.detectChanges();
    });


    it('should have one tab', () => {
        let tabs = fixture.debugElement.queryAll(By.css('.tabs-nav__item'))
        expect(tabs.length).toEqual(1);

        let tabTitle = fixture.debugElement.query(By.css('#companyDocuments_spanHeader_0'));
        expect(tabTitle.nativeElement.innerText.trim()).toEqual('USEFULDOCS.HEADERTEXT');

        let tabCount = fixture.debugElement.query(By.css('#companyDocuments_spanCount_0'));
        expect(tabCount.nativeElement.innerText.trim()).toEqual('1151');

        expect(tabs[0].nativeNode.attributes.getNamedItem('ng-reflect-router-link').value).toEqual('usefultemplates');
    });
});