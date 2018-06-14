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
import * as fromRoot from '../../../../shared/reducers';
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
import {
    HRemployeeDocumentsContainerComponent,
} from '../hremployee-documents-container/hremployee-documents-container.component';
import { HSDocumentsContainerComponent } from './hsdocuments-container.component';


let tabsAssert = function (tab, tabTitle, tabName, tabCount, count, route) {
    expect(tabTitle.nativeElement.innerText.trim()).toEqual(tabName);
    expect(tabCount.nativeElement.innerText.trim()).toEqual(count);
    expect(tab.nativeNode.attributes.getNamedItem('ng-reflect-router-link').value).toEqual(route);
}

describe('HS document container', () => {
    let component: HSDocumentsContainerComponent;
    let fixture: ComponentFixture<HSDocumentsContainerComponent>;
    let store: Store<fromRoot.State>;

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
                HSDocumentsContainerComponent
                , CompanyDocumentsContainerComponent
                , CompanyDocumentsListComponent
                , HandbookPoliciesContainerComponent
                , HandbooksListComponent
                , ContractsTemplateListComponent
                , PersonalizedContractListComponent
                , HRemployeeDocumentsContainerComponent
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
            ]
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HSDocumentsContainerComponent);
        component = fixture.componentInstance;
        store = fixture.debugElement.injector.get(Store);

        store.dispatch(new LoadCompanyDocumentsStatCompleteAction(MockStoreCompanyDocuments.companyDocumentStatsMock()));

        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should have 3 tabs', () => {
        let tabTitle, tabCount;
        let tabNames = [
            'COMPANY_DOCUMENTS_TAB.HandbooksAndPolicies'
            , 'COMPANY_DOCUMENTS_TAB.InspectionReportsAndCertficates'
            , 'COMPANY_DOCUMENTS_TAB.HSDocumentSuite'
        ]
        let tabCounts = ['87', '55', '320'];
        let routes = ['handbooks-and-policies', 'inspection-reports', 'hs-documentsuite'];

        let tabs = fixture.debugElement.queryAll(By.css('.tabs-nav__item'));
        expect(tabs.length).toEqual(3);

        tabs.map((tab, index) => {
            tabTitle = fixture.debugElement.query(By.css('#hsDocumentList_spanHeader_' + index));
            tabCount = fixture.debugElement.query(By.css('#hsDocumentList_spanCount_' + index));
            tabsAssert(tab, tabTitle, tabNames[index], tabCount, tabCounts[index], routes[index]);
        });
    });
});