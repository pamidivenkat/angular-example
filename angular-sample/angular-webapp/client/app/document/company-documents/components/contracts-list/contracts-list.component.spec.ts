import { RouteParamsMock } from './../../../../shared/testing/mocks/route-params-mock';
import { RouteParams } from './../../../../shared/services/route-params';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { AeDataTableAction } from './../../../../atlas-elements/common/models/ae-data-table-action';
import { CommonTestHelper } from './../../../../shared/testing/helpers/common-test-helper';
import { LoadContractsListCompleteAction, LoadPersonalContractsListCompleteAction, LoadContractsListAction, SaveContractAsPDFAction } from './../../actions/contracts.actions';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, RouterModule, NavigationExtras } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { AeDatatableComponent } from '../../../../atlas-elements/ae-datatable/ae-datatable.component';
import { AeNavActionsComponent } from '../../../../atlas-elements/ae-nav-actions/ae-nav-actions.component';
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
import { MockStoreCompanyDocuments } from '../../../../shared/testing/mocks/mock-store-company-documents';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { DocumentSharedModule } from '../../../document-shared/document-shared.module';
import { ContractsListComponent } from './contracts-list.component';
import * as Immutable from 'immutable';
import { Document, DocumentActionType } from './../../../models/document';

describe('Company documents -> contracts-list', () => {
    let component: ContractsListComponent;
    let fixture: ComponentFixture<ContractsListComponent>;
    let store: Store<fromRoot.State>;
    let dispatchSpy: jasmine.Spy;
    let rows; let routeParamsStub: any; let claimsHelperServiceStub: any
    let routerMock: any;
    let navigateSpy: jasmine.Spy;
    let windowSpy: jasmine.Spy;
    let isCompanyId: jasmine.Spy;
    let contractsListData: Immutable.List<Document>;
    let contractsListDataTotalCount: number;
    let personalcontractsListData: Immutable.List<Document>;
    let personalcontractsListDataTotalCount: number;
    let personalisedAction: AeDataTableAction;
    let downloadAction: AeDataTableAction;
    let viewAction: AeDataTableAction;
    let downloadAsPdfAction: AeDataTableAction;
    let distributeContractAction: AeDataTableAction;
    let updateContractAction: AeDataTableAction;
    let saveAsPdfAction: AeDataTableAction;

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
                ContractsListComponent
            ]
            , providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
                , { provide: Router, useClass: RouterMock }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: RouteParams, useClass: RouteParamsMock }
            ]
        })
            .overrideComponent(ContractsListComponent, { set: { host: { '(click)': 'dummy' } } })
            .compileComponents();
    }));


    describe('When user access contract templates', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(ContractsListComponent);
            component = fixture.componentInstance;
            store = fixture.debugElement.injector.get(Store);
            routerMock = fixture.debugElement.injector.get(Router);
            dispatchSpy = spyOn(store, 'dispatch');
            navigateSpy = spyOn(routerMock, 'navigate');
            routeParamsStub = fixture.debugElement.injector.get(RouteParams);
            claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
            windowSpy = spyOn(window, 'open');
            component.contractsFilter = 1;
            isCompanyId = spyOn(claimsHelperServiceStub, 'getCompanyId');
            fixture.detectChanges();
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

        });
        it('should create', () => {
            expect(component).toBeTruthy();
        });
        beforeEach(fakeAsync(() => {
            component.ngOnInit();
            dispatchSpy.and.callThrough();
            store.dispatch(new LoadContractsListCompleteAction(MockStoreCompanyDocuments.getContractTemplates()));
            fixture.detectChanges();
            routeParamsStub.Cid = undefined;
            component.contractsRequest$.subscribe((val) => {
                contractsListData = val;
            });
            component.contractsListTotalCount$.subscribe((val) => {
                contractsListDataTotalCount = val;
            });

            rows = fixture.debugElement.queryAll(By.css('.table__row'));
            personalisedAction = CommonTestHelper.getGivenButton(component.actions.toArray(), 'Personalise');
            downloadAction = CommonTestHelper.getGivenButton(component.actions.toArray(), 'Download as word');

            fixture.detectChanges();
        }));
        it('Contract templates documents page should load the contract templates list', () => {
            let contractsData = MockStoreCompanyDocuments.getContractTemplates();
            let mockedImmutableContratcsData: Immutable.List<Document> = Immutable.List<Document>(contractsData.Entities);
            expect(contractsListData.toArray().length).toEqual(mockedImmutableContratcsData.toArray().length);
            expect(rows.length).toEqual(contractsData.PagingInfo.Count);
            expect(contractsListDataTotalCount).toEqual(contractsData.PagingInfo.TotalCount);
        });

        it('When user clicked on personolise action , he should redirected to a page where he personalises the contract', () => {
            let contractsData = MockStoreCompanyDocuments.getContractTemplates();
            personalisedAction.command.next(contractsData.Entities[0]);
            let navigationExtras: NavigationExtras = {
                queryParamsHandling: 'merge'
            };
            fixture.detectChanges();
            let url = 'document/group-contract-personalisation/' + contractsData.Entities[0].Id
            expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
        });
        it('When user clicked on Download As work action , he should download the document as word', () => {
            windowSpy.calls.reset();
            let contractsData = MockStoreCompanyDocuments.getContractTemplates();
            let doc = contractsData.Entities[0] as Document;
            let fileName = doc.Title + ".docx";
            downloadAction.command.next(doc);
            // fixture.detectChanges();
            let url = '/documentproducer/downloadword/' + doc.Id + '?filename=' + fileName + '&cid=' + routeParamsStub.Cid;
            expect(windowSpy).toHaveBeenCalledWith(url);
        });


    });
    describe('When user access persoanl contract', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(ContractsListComponent);
            component = fixture.componentInstance;
            store = fixture.debugElement.injector.get(Store);
            routerMock = fixture.debugElement.injector.get(Router);
            claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
            dispatchSpy = spyOn(store, 'dispatch');
            navigateSpy = spyOn(routerMock, 'navigate');
            routeParamsStub = fixture.debugElement.injector.get(RouteParams);
            windowSpy = spyOn(window, 'open');
            component.contractsFilter = 2;
            isCompanyId = spyOn(claimsHelperServiceStub, 'getCompanyId');
            fixture.detectChanges();
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

        });
        it('should create', () => {
            expect(component).toBeTruthy();
        });
        beforeEach(fakeAsync(() => {

            component.ngOnInit();
            dispatchSpy.and.callThrough();
            store.dispatch(new LoadPersonalContractsListCompleteAction(MockStoreCompanyDocuments.getPersonalisedContract()));
            component.contractsRequest$.subscribe((val) => {
                personalcontractsListData = val;
            });
            component.contractsListTotalCount$.subscribe((val) => {
                personalcontractsListDataTotalCount = val;
            });
            routeParamsStub.Cid = undefined;
            fixture.detectChanges();
            rows = fixture.debugElement.queryAll(By.css('.table__row'));

            viewAction = CommonTestHelper.getGivenButton(component.actions.toArray(), 'view');
            downloadAsPdfAction = CommonTestHelper.getGivenButton(component.actions.toArray(), 'download pdf');
            distributeContractAction = CommonTestHelper.getGivenButton(component.actions.toArray(), 'Distribute');
            updateContractAction = CommonTestHelper.getGivenButton(component.actions.toArray(), 'Update');
            saveAsPdfAction = CommonTestHelper.getGivenButton(component.actions.toArray(), 'Save as pdf');

        }));
        it('Personalised Contract documents page hould load the personalised contract list', fakeAsync(() => {
            let personalContractsData = MockStoreCompanyDocuments.getPersonalisedContract();
            let mockedImmutableContratcsData: Immutable.List<Document> = Immutable.List<Document>(personalContractsData.Entities);
            tick(100);
            expect(personalcontractsListData.toArray().length).toEqual(mockedImmutableContratcsData.toArray().length);
            expect(rows.length).toEqual(personalContractsData.PagingInfo.Count);
            expect(personalcontractsListDataTotalCount).toEqual(personalContractsData.PagingInfo.TotalCount);
        }));

        it('When user clicked on view action, user should can view document', () => {
            let personalContractsData = MockStoreCompanyDocuments.getPersonalisedContract();
            viewAction.command.next(personalContractsData.Entities[0]);
            fixture.detectChanges();
            expect(component.needToOpenUserVersion).toBeTruthy(true);
        });
        it('When user clicked on Download as pdf action, he should Download as pdf the document', () => {
            windowSpy.calls.reset();
            let personalContractsData = MockStoreCompanyDocuments.getPersonalisedContract();
            let doc = personalContractsData.Entities[0] as Document;
            let fileName = doc.Title + ".pdf";
            downloadAsPdfAction.command.next(doc);
            // fixture.detectChanges();
            let downloadurl = '/documentproducer/downloadpdf/' + doc.Id + '?filename=' + fileName + '&cid=' + routeParamsStub.Cid;
            expect(windowSpy).toHaveBeenCalledWith(downloadurl);
        });

        it('When user clicked on Distribute action, user should get options to Distribute document', () => {
            let personalContractsData = MockStoreCompanyDocuments.getContractTemplates();
            distributeContractAction.command.next(personalContractsData.Entities[9]);
            fixture.detectChanges();
            expect(component.showHideDocumentActionSlideOut).toBe(true);
        });
        it('When user clicked on update action, user should to redirect to update document', () => {
            let personalContractsData = MockStoreCompanyDocuments.getPersonalisedContract();
            updateContractAction.command.next(personalContractsData.Entities[0]);
            let navigationExtras: NavigationExtras = {
                queryParams: {
                    "distributionType": 2
                }
            };
            fixture.detectChanges();
            let url = 'document/group-contract-personalisation/contract-update';
            expect(navigateSpy).toHaveBeenCalledWith([url, personalContractsData.Entities[0].Id], navigationExtras);
        });
        it('When user clicked on Save as pdf As work action , he should Save as pdf the document', () => {
            let personalContractsData = MockStoreCompanyDocuments.getPersonalisedContract();
            saveAsPdfAction.command.next(personalContractsData.Entities[0]);
            let doc = personalContractsData.Entities[0] as Document;
            doc = personalContractsData.Entities.filter(x => x.Id == doc.Id)[0];
            let saveLoadAction: SaveContractAsPDFAction = (new SaveContractAsPDFAction(doc));
            expect(dispatchSpy).toHaveBeenCalledWith(saveLoadAction);
        });
    })
})