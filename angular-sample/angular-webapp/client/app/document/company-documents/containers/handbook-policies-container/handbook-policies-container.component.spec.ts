import { DocumentConstants } from './../../../document-constants';
import { LoadContractsTemplateCountAction, LoadPersonalContractsCountAction, LoadContractsTemplateCountCompleteAction, LoadPersonalContractsCountCompleteAction } from './../../actions/contracts.actions';
import { LoadHandbooksDocsCountAction, LoadHandbooksDocsCountCompleteAction } from './../../actions/handbooks.actions';
import { MockStoreHandbookDocuments } from './../../../../shared/testing/mocks/mock-store-documents-handbooks';
import { LocationStrategy } from '@angular/common';
import { RouterOutletMapStub } from './../../../../shared/testing/mocks/router-outlet-stub';
import { InformationBarService } from './../../../services/information-bar-service';
import { CommonTestHelper } from './../../../../shared/testing/helpers/common-test-helper';
import { RouteParamsMock } from './../../../../shared/testing/mocks/route-params-mock';
import { RouteParams } from './../../../../shared/services/route-params';
import { MessengerService } from './../../../../shared/services/messenger.service';
import { RestClientService } from './../../../../shared/data/rest-client.service';
import { RestClientServiceStub } from './../../../../shared/testing/mocks/rest-client-service-stub';
import { Observable } from 'rxjs/Rx';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, RouterModule, NavigationExtras, RouterOutletMap, UrlSegment } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { HomeModule } from '../../../../home/home.module';
import { routes } from '../../../../home/home.routes';
import { AtlasSharedModule } from '../../../../shared/atlas-shared.module';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../../shared/reducers';
import { reducer } from '../../../../shared/reducers/index';
import { ActivatedRouteStub } from '../../../../shared/testing/mocks/activated-route-stub';
import { BreadcrumbServiceStub } from '../../../../shared/testing/mocks/breadcrumb-service-mock';
import { ClaimsHelperServiceStub } from '../../../../shared/testing/mocks/claims-helper-service-mock';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { DocumentSharedModule } from '../../../document-shared/document-shared.module';
import { HandbookPoliciesContainerComponent } from './handbook-policies-container.component';
import { ChangeDetectorRef, Injector, NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import * as Immutable from 'immutable';

describe('Company documents -> contracts & hand books', () => {
    let component: HandbookPoliciesContainerComponent;
    let fixture: ComponentFixture<HandbookPoliciesContainerComponent>;
    let store: Store<fromRoot.State>;

    let handbookListDataTotalCount: number;
    let activatedRouteStub: any;
    let dispatchSpy: jasmine.Spy;
    let allTabs: DebugElement[];
    let routeParamsStub: any;
    let routerMock: any;
    let navigateSpy: jasmine.Spy;




    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , ReactiveFormsModule
                , AtlasElementsModule
                , DocumentSharedModule
                , StoreModule.provideStore(reducer)
                , RouterModule.forChild(routes)
                , AtlasSharedModule
                , HomeModule
                , BrowserAnimationsModule
            ]
            , declarations: [
                HandbookPoliciesContainerComponent
            ]
            , providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
                , { provide: Router, useClass: RouterMock }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: InformationBarService, useValue: jasmine.createSpyObj('informationBarServiceMock', ['']) }
                , { provide: RestClientService, useClass: RestClientServiceStub }
                , { provide: MessengerService, useValue: jasmine.createSpyObj('messengerServiceMock', ['']) }
                , { provide: RouteParams, useClass: RouteParamsMock }
                , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
                , { provide: LocationStrategy, useValue: jasmine.createSpyObj('locationStrategyMock', ['prepareExternalUrl']) }
            ]
        })
            .overrideComponent(HandbookPoliciesContainerComponent, { set: { host: { '(click)': 'dummy' } } })
            .compileComponents();
    }));
    describe('Loading  contracts & hand books', () => {
        beforeEach(() => {

            fixture = TestBed.createComponent(HandbookPoliciesContainerComponent);
            routeParamsStub = fixture.debugElement.injector.get(RouteParams);
            activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
            component = fixture.componentInstance;
            store = fixture.debugElement.injector.get(Store);
            routerMock = fixture.debugElement.injector.get(Router);
            dispatchSpy = spyOn(store, 'dispatch');
            navigateSpy = spyOn(routerMock, 'navigate');

            fixture.detectChanges();

            dispatchSpy.and.callThrough();
            let mockedHandbookStats = MockStoreHandbookDocuments.getHandbookStats();
            let mockedcontratcStats = MockStoreHandbookDocuments.getContractStats();
            let mockedPersoanlStats = MockStoreHandbookDocuments.getPersonalisedStats();

            store.dispatch(new LoadHandbooksDocsCountCompleteAction(mockedHandbookStats));
            store.dispatch(new LoadContractsTemplateCountCompleteAction(mockedcontratcStats));
            store.dispatch(new LoadPersonalContractsCountCompleteAction(mockedPersoanlStats));

            jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

            fixture.detectChanges();


        });

        it('should create contracts & hand books', () => {
            expect(component).toBeTruthy();
        });
        it('Loading contracts & hand books tabs when status count of each tab not loaded', () => {
            let handbookLoadActionPayLoad: LoadHandbooksDocsCountAction = (new LoadHandbooksDocsCountAction(true));
            expect(dispatchSpy).toHaveBeenCalledWith(handbookLoadActionPayLoad);
            let contractLoadActionPayLoad: LoadContractsTemplateCountAction = (new LoadContractsTemplateCountAction(true));
            expect(dispatchSpy).toHaveBeenCalledWith(contractLoadActionPayLoad);
            let personalLoadActionPayLoad: LoadPersonalContractsCountAction = (new LoadPersonalContractsCountAction(true));
            expect(dispatchSpy).toHaveBeenCalledWith(personalLoadActionPayLoad);
        });

        it('contracts & hand books Should have 3 tabs', fakeAsync(() => {
            let tabStrip: DebugElement = fixture.debugElement.query(By.css('#handbook-policies_AeTabStrip_1'));
            allTabs = tabStrip.queryAll(By.css('.tabs-nav__item'));
            tick(200);
            expect(allTabs.length).toEqual(3);
        }));

        it('contracts & hand books tabs should be handbook list,contract templates,Personalised contracts and its count', fakeAsync(() => {
            expect(allTabs[0]).not.toBeUndefined();
            expect(allTabs[1]).not.toBeUndefined();
            expect(allTabs[2]).not.toBeUndefined();
            let divElement0 = allTabs[0].query(By.css('.tabs-with-count'));
            let divElement1 = allTabs[1].query(By.css('.tabs-with-count'));
            let divElement2 = allTabs[2].query(By.css('.tabs-with-count'));
            expect(divElement0).not.toBeUndefined();
            expect(divElement1).not.toBeUndefined();
            expect(divElement2).not.toBeUndefined();
            let spans0 = divElement0.queryAll(By.css('span'));
            let spans1 = divElement1.queryAll(By.css('span'));
            let spans2 = divElement2.queryAll(By.css('span'));
            expect((<HTMLSpanElement>spans0[0].nativeElement).textContent.toLowerCase()).toContain('handbook.handbook');
            expect((<HTMLSpanElement>spans0[1].nativeElement).textContent).toEqual(component.handbookDocsListTotalCount.toString())
            expect((<HTMLSpanElement>spans1[0].nativeElement).textContent.toLowerCase()).toContain('handbook.contract_trmplate');
            expect((<HTMLSpanElement>spans1[1].nativeElement).textContent).toEqual(component.contractDocsListTotalCount.toString());
            expect((<HTMLSpanElement>spans2[0].nativeElement).textContent.toLowerCase()).toContain('handbook.personalised_contracts');
            expect((<HTMLSpanElement>spans2[1].nativeElement).textContent).toEqual(component.personalContractTotalCount.toString());
        }));

        it('contracts & hand books tabs should navigate to handbook list,contract templates,Personalised contracts pages', fakeAsync(() => {
            expect(allTabs[0].nativeNode.attributes.getNamedItem('ng-reflect-router-link').value).toEqual('handbooks');
            expect(allTabs[1].nativeNode.attributes.getNamedItem('ng-reflect-router-link').value).toEqual('contract-templates');
            expect(allTabs[2].nativeNode.attributes.getNamedItem('ng-reflect-router-link').value).toEqual('personalised');

        }));

    })


})

