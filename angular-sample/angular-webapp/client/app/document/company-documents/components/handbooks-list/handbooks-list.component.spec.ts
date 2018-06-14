import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, NavigationExtras, Router, RouterModule } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';

import { AeAutocompleteComponent } from '../../../../atlas-elements/ae-autocomplete/ae-autocomplete.component';
import { AeDatatableComponent } from '../../../../atlas-elements/ae-datatable/ae-datatable.component';
import { AeInputComponent } from '../../../../atlas-elements/ae-input/ae-input.component';
import { AeNavActionsComponent } from '../../../../atlas-elements/ae-nav-actions/ae-nav-actions.component';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { HomeModule } from '../../../../home/home.module';
import { routes } from '../../../../home/home.routes';
import { addOrUpdateAtlasParamValue } from '../../../../root-module/common/extract-helpers';
import { AtlasSharedModule } from '../../../../shared/atlas-shared.module';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../../shared/reducers';
import { reducer } from '../../../../shared/reducers/index';
import { ActivatedRouteStub } from '../../../../shared/testing/mocks/activated-route-stub';
import { BreadcrumbServiceStub } from '../../../../shared/testing/mocks/breadcrumb-service-mock';
import { ClaimsHelperServiceStub } from '../../../../shared/testing/mocks/claims-helper-service-mock';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { MockStoreHandbookDocuments } from '../../../../shared/testing/mocks/mock-store-documents-handbooks';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { DocumentSharedModule } from '../../../document-shared/document-shared.module';
import { AeDataTableAction } from './../../../../atlas-elements/common/models/ae-data-table-action';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { LoadSitesAction, LoadSitesCompleteAction } from './../../../../shared/actions/company.actions';
import { RestClientService } from './../../../../shared/data/rest-client.service';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { FormBuilderService } from './../../../../shared/services/form-builder.service';
import { MessengerService } from './../../../../shared/services/messenger.service';
import { RouteParams } from './../../../../shared/services/route-params';
import { CommonTestHelper } from './../../../../shared/testing/helpers/common-test-helper';
import { RestClientServiceStub } from './../../../../shared/testing/mocks/rest-client-service-stub';
import { RouteParamsMock } from './../../../../shared/testing/mocks/route-params-mock';
import { DocumentDetailsService } from './../../../document-details/services/document-details.service';
import { Document } from './../../../models/document';
import { LoadHandbooksListAction, LoadHandbooksListCompleteAction } from './../../actions/handbooks.actions';
import { HandbooksListComponent } from './handbooks-list.component';

describe('Company documents -> contracts & hand books -> handbook', () => {
    let component: HandbooksListComponent;
    let fixture: ComponentFixture<HandbooksListComponent>;
    let store: Store<fromRoot.State>;
    let loadedSites: AeSelectItem<string>[];
    let handbookListData: Immutable.List<Document>;
    let handbookListDataTotalCount: number;
    let mockedAeselectSitesData: AeSelectItem<string>[];
    let dispatchSpy: jasmine.Spy;
    let params: AtlasParams[] = new Array();
    let handbookApiRequest = new AtlasApiRequestWithParams(1, 10, 'FileNameAndTitle', SortDirection.Ascending, params);
    let rows; let actions;
    let columns; let routeParamsStub: any;
    let routerMock: any;
    let navigateSpy: jasmine.Spy;
    let windowSpy: jasmine.Spy;
    let viewAction: AeDataTableAction;
    let downloadAction: AeDataTableAction;
    let distributeAction: AeDataTableAction;


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
                HandbooksListComponent
            ]
            , providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
                , { provide: Router, useClass: RouterMock }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , DocumentDetailsService
                , { provide: RestClientService, useClass: RestClientServiceStub }
                , FormBuilderService
                , { provide: MessengerService, useValue: jasmine.createSpyObj('messengerServiceMock', ['']) }
                , { provide: RouteParams, useClass: RouteParamsMock }
            ]
        })
            .overrideComponent(HandbooksListComponent, { set: { host: { '(click)': 'dummy' } } })
            .compileComponents();
    }));

    describe('Loading handbook list with out data', () => {
        beforeEach(() => {

            fixture = TestBed.createComponent(HandbooksListComponent);
            component = fixture.componentInstance;
            store = fixture.debugElement.injector.get(Store);
            routerMock = fixture.debugElement.injector.get(Router);
            dispatchSpy = spyOn(store, 'dispatch');
            navigateSpy = spyOn(routerMock, 'navigate');
            windowSpy = spyOn(window, 'open');
            fixture.detectChanges();
            routeParamsStub = fixture.debugElement.injector.get(RouteParams);
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
            viewAction = CommonTestHelper.getGivenButton(component.actions.toArray(), 'View');
            downloadAction = CommonTestHelper.getGivenButton(component.actions.toArray(), 'Download');
            distributeAction = CommonTestHelper.getGivenButton(component.actions.toArray(), 'Distribute');

        });

        it('should create', () => {
            expect(component).toBeTruthy();
            let dataTable = fixture.debugElement.query(By.directive(AeDatatableComponent));
            expect(dataTable).toBeTruthy();
        });

        it('should have a filter by Site and have a filter by site of auto complete type', () => {
            let siteFilter = fixture.debugElement.query(By.css('#handbook-list_AeAutocomplete_1'));
            expect(siteFilter).toBeTruthy();
            expect(siteFilter.componentInstance instanceof AeInputComponent).toBeTruthy();
            let autoCompleteElement = fixture.debugElement.query(By.directive(AeAutocompleteComponent));
            expect(autoCompleteElement).toBeTruthy();
            expect(autoCompleteElement.name).toEqual('ae-autocomplete');

        });
        it('should load sites when no sites were found and load contractList when no contracts found in the store', () => {
            let siteLoadActionPayLoad: LoadSitesAction = (new LoadSitesAction(false));
            expect(dispatchSpy).toHaveBeenCalledWith(siteLoadActionPayLoad);
            let contractLoadAction: LoadHandbooksListAction = (new LoadHandbooksListAction(handbookApiRequest));
            expect(dispatchSpy).toHaveBeenCalledWith(contractLoadAction);
        });


        beforeEach(fakeAsync(() => {
            let mockedSites = MockStoreHandbookDocuments.getSiteLists();
            mockedAeselectSitesData = MockStoreHandbookDocuments.getSiteAeelement();
            component.sites$.subscribe((val) => {
                loadedSites = val;
            });
            component.handbooksRequest$.subscribe((val) => {
                handbookListData = val;
            });
            component.handbooksListTotalCount$.subscribe((val) => {
                handbookListDataTotalCount = val;
            });

            routeParamsStub.Cid = null;
            dispatchSpy.and.callThrough();

            store.dispatch(new LoadSitesCompleteAction(mockedSites.Entities));
            store.dispatch(new LoadHandbooksListCompleteAction(MockStoreHandbookDocuments.getHandbookDocuments()));
            fixture.detectChanges();


            rows = fixture.debugElement.queryAll(By.css('.table__row'));
            columns = fixture.debugElement.queryAll(By.css('.table__heading'));


            it('Load sites for filtering handbook', fakeAsync(() => {
                tick(100);
                expect(loadedSites).toEqual(mockedAeselectSitesData);
            }));
            it('Handbook documents data,data Page count,Totalcount check', () => {
                let handbookData = MockStoreHandbookDocuments.getHandbookDocuments();
                let mockedImmutableContratcsData: Immutable.List<Document> = Immutable.List<Document>(handbookData.Entities);
                expect(handbookListData.toArray().length).toEqual(mockedImmutableContratcsData.toArray().length);
                expect(rows.length).toEqual(handbookData.PagingInfo.Count);
                expect(handbookListDataTotalCount).toEqual(handbookData.PagingInfo.TotalCount);
            });



            it('handbook docs should have a column for title name,category,version,last modified date,status,actions with sort option', () => {
                expect(columns[0].nativeElement.innerText.trim()).toEqual('HANDBOOK.TITLE_FILE');
                expect(columns[0].nativeElement.classList).toContain('js-sortable');
                expect(columns[1].nativeElement.innerText.trim()).toEqual('HANDBOOK.SITE');
                expect(columns[1].nativeElement.classList).toContain('js-sortable');
                expect(columns[2].nativeElement.innerText.trim()).toEqual('HANDBOOK.CATEGORY');
                expect(columns[2].nativeElement.classList).toContain('js-sortable');
                expect(columns[3].nativeElement.innerText.trim()).toEqual('HANDBOOK.VERSION');
                expect(columns[3].nativeElement.classList).toContain('js-sortable');
                expect(columns[4].nativeElement.innerText.trim()).toEqual('HANDBOOK.LAST_MODIFY');
                expect(columns[4].nativeElement.classList).toContain('js-sortable');
                expect(columns[5].nativeElement.innerText.trim()).toEqual('HANDBOOK.STATUS');
                expect(columns[5].nativeElement.classList).toContain('js-sortable');
                expect(columns[6].nativeElement.innerText.trim()).toEqual('Actions');
                expect(columns[6].nativeElement.classList).not.toContain('js-sortable');
            });
            it('handbook docs should have 3 action items and have an action item as View and download,Distribute', () => {
                let actionButtonitems = rows[0].query(By.css('.nav--actions')).componentInstance;
                expect(actionButtonitems instanceof AeNavActionsComponent).toBeTruthy();
                let actionButton = rows[0].query(By.css('.nav--actions')).componentInstance;
                let event = new MouseEvent('click');
                actionButton._onClick(event);
                fixture.detectChanges();
                actions = rows[0].queryAll(By.css('li'));
                expect(actions.length).toEqual(3);
                expect(actions[0].nativeElement.innerText).toEqual('View');
                expect(actions[1].nativeElement.innerText).toEqual('Download');
                expect(actions[2].nativeElement.innerText).toEqual('Distribute');
            });

            it('When user clicked on View action, user should able to view the selected handbook doc', () => {
                let handbookData = MockStoreHandbookDocuments.getHandbookDocuments();
                viewAction.command.next(handbookData.Entities[0]);
                let navigationExtras: NavigationExtras = {
                    queryParamsHandling: 'merge'
                };
                fixture.detectChanges();
                let url = 'document/document-details/' + handbookData.Entities[0].Id
                expect(navigateSpy).toHaveBeenCalledWith([url], navigationExtras);
            });

            it('When user clicked on Download action, user should able to Download the selected handbook doc', () => {
                let handbookData = MockStoreHandbookDocuments.getHandbookDocuments();
                let doc = handbookData.Entities[0] as Document;
                downloadAction.command.next(doc);
                fixture.detectChanges();
                let url = routeParamsStub.Cid ? `/filedownload?documentId=${doc.Id}&?isSystem=false&version=${doc.Version}&cid=${routeParamsStub.Cid}` : `/filedownload?documentId=${doc.Id}&?isSystem=false&version=${doc.Version}`
                expect(windowSpy).toHaveBeenCalledWith(url);
            });

            it('When user clicked on Distribute action, user should able to Distribute selected handbook doc', () => {
                let handbookData = MockStoreHandbookDocuments.getHandbookDocuments();
                distributeAction.command.next(handbookData.Entities[0]);
                fixture.detectChanges();
                expect(component.showRemoveDocumentDistributeSelectSlideOut).toBe(true);
            });

            it('User selects sites filter checking data,page size and totalcount for filtered handbook docs', fakeAsync(() => {
                let currentRequest = component.handbooksApiRequest;
                let selectedSite = new AeSelectItem<string>('Site 1', '42bbe9d6-8730-29d2-7cf3-aa526e976bb5', false);
                component.handbooksListForm.patchValue({ site: [selectedSite] });
                fixture.detectChanges();
                tick(200);
                currentRequest.Params = addOrUpdateAtlasParamValue(currentRequest.Params, 'site', '42bbe9d6-8730-29d2-7cf3-aa526e976bb5');
                let companyDocLoadAction: LoadHandbooksListAction = (new LoadHandbooksListAction(currentRequest));
                expect(dispatchSpy).toHaveBeenCalledWith(companyDocLoadAction);

                store.dispatch(new LoadHandbooksListCompleteAction(MockStoreHandbookDocuments.getFilterHandbookDocuments()));
                dispatchSpy.and.callThrough();

                rows = fixture.debugElement.queryAll(By.css('.table__row'));
                fixture.detectChanges();
                let handbookData = MockStoreHandbookDocuments.getFilterHandbookDocuments();
                let mockedImmutableContratcsData: Immutable.List<Document> = Immutable.List<Document>(handbookData.Entities);
                expect(handbookListData.toArray().length).toEqual(mockedImmutableContratcsData.toArray().length);
                expect(rows.length).toEqual(handbookData.PagingInfo.Count);
                expect(handbookListDataTotalCount).toEqual(handbookData.PagingInfo.TotalCount);
            }));


        }));

    });
});