import { addOrUpdateAtlasParamValue } from '../../../../root-module/common/extract-helpers';
import { AeSlideOutComponent } from '../../../../atlas-elements/ae-slideout/ae-slideout.component';
import { EventListener } from '@angular/core/src/debug/debug_node';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, NavigationExtras, Router, UrlSegment } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { providers } from 'ng2-dnd';
import { isNullOrUndefined } from 'util';

import { AeAutocompleteComponent } from '../../../../atlas-elements/ae-autocomplete/ae-autocomplete.component';
import { AeModalDialogComponent } from '../../../../atlas-elements/ae-modal-dialog/ae-modal-dialog.component';
import { AeNavActionsComponent } from '../../../../atlas-elements/ae-nav-actions/ae-nav-actions.component';
import { AeSelectComponent } from '../../../../atlas-elements/ae-select/ae-select.component';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { Document } from '../../../../document/models/document';
import { EmployeeSearchService } from '../../../../employee/services/employee-search.service';
import { LoadSitesCompleteAction } from '../../../../shared/actions/company.actions';
import { LoadAuthorizedDocumentCategoriesComplete } from '../../../../shared/actions/user.actions';
import { RestClientService } from '../../../../shared/data/rest-client.service';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../../shared/models/atlas-api-response';
import * as fromRoot from '../../../../shared/reducers';
import { reducer } from '../../../../shared/reducers/index';
import { MessengerService } from '../../../../shared/services/messenger.service';
import { RouteParams } from '../../../../shared/services/route-params';
import { CommonTestHelper } from '../../../../shared/testing/helpers/common-test-helper';
import { ActivatedRouteStub } from '../../../../shared/testing/mocks/activated-route-stub';
import { DocumentDetailsServiceStub } from '../../../../shared/testing/mocks/document-details-service-stub';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { MockStoreCompanyDocuments } from '../../../../shared/testing/mocks/mock-store-company-documents';
import { MockStoreProviderCompany } from '../../../../shared/testing/mocks/mock-store-provider-company';
import { MockStoreProviderUser } from '../../../../shared/testing/mocks/mock-store-provider-user';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { extractDocumentCategoryItems } from '../../../common/document-subcategory-extract-helper';
import { DocumentDetailsType } from '../../../document-details/models/document-details-model';
import { DocumentDetailsService } from '../../../document-details/services/document-details.service';
import {
    DocumentReviewDistributeComponenet,
} from '../../../document-shared/components/document-review-distribute/document-review-distribute.component';
import { DocumentUpdateComponent } from '../../../document-shared/components/document-update/document-update.component';
import { DocumentsFolder } from '../../../models/document';
import { DocumentCategoryService } from '../../../services/document-category-service';
import { DocumentService } from '../../../services/document-service';
import { LoadCompanyDocumentsAction, LoadCompanyDocumentsCompleteAction } from '../../actions/company-documents.actions';
import { CompanyDocumentsListComponent } from './company-documents-list.component';
import { AeSelectItem } from "../../../../atlas-elements/common/models/ae-select-item";



let filterAssert = function (filters, index: number, placeholder = null, value: any, tag = null, count = 0) {
    expect(filters[index]).toBeTruthy();

    expect(filters[index].componentInstance.value).toEqual(value);
    expect(filters[index].componentInstance.placeholder).toEqual(placeholder);

    if (!isNullOrUndefined(tag)) {
        let options = filters[index].queryAll(By.css(tag));
        expect(options.length).toEqual(count);
    }
}

let columnsAssert = function (columns, index: number, title: string, sortable: boolean, sortKay: string = null) {

    expect(columns[index].nativeElement.innerText.trim()).toEqual(title);
    if (sortable) {
        expect(columns[index].nativeElement.classList).toContain('table__heading--sortable');
        expect(columns[index].childNodes[1].nativeNode.attributes.getNamedItem('data-sortKey').value).toEqual(sortKay);
    } else {
        expect(columns[index].nativeElement.classList).not.toContain('table__heading--sortable');
    }

}

let actionsAssert = function (fixture, actionItems: Array<string>, rowIndex: number = 0) {
    let rows = fixture.debugElement.queryAll(By.css('.table__row'));

    rows.map((row, index) => {
        expect(rows[rowIndex].query(By.directive(AeNavActionsComponent))).toBeTruthy();
    })

    let actionButton = <AeNavActionsComponent<any>>rows[rowIndex].query(By.directive(AeNavActionsComponent)).componentInstance;
    let event = new MouseEvent('click');
    actionButton._onClick(event);
    fixture.detectChanges();

    let nav = rows[rowIndex].query(By.css('.nav--actions'));
    let actions = nav.queryAll(By.css('li'));

    expect(actions.length).toEqual(actionItems.length);

    actions.map((action, index) => {
        expect(actions[index].nativeElement.innerText.toLowerCase().trim()).toEqual(actionItems[index]);
    });

}

let viewAssert = function (routerMock, viewAction, fixture) {
    let navigateSpy = spyOn(routerMock, 'navigate');
    let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
    };
    let doc = new Document()
    doc.Id = '1234'
    viewAction.command.next(doc);
    fixture.detectChanges();
    expect(navigateSpy).toHaveBeenCalledWith(['document/document-details/' + doc.Id], navigationExtras);
}

let downloadAssert = function (downloadAction, fixture) {
    let downloadSpy = spyOn(window, 'open');
    let doc = new Document()
    doc.Id = '1234'
    downloadAction.command.next(doc);

    fixture.detectChanges();
    expect(downloadSpy).toHaveBeenCalledWith('/filedownload?documentId=' + doc.Id + '&?isSystem=false&version=undefined');
}

let distributeAssert = function (documentDetailsServiceStub, distributeAction, fixture, distributeSpy: jasmine.Spy) {
    let doc = new Document()
    doc.Id = '1234'
    distributeAction.command.next(doc);

    fixture.detectChanges();
    expect(distributeSpy).toHaveBeenCalledWith(doc.Id, DocumentDetailsType.Document);
}

let updateAssert = function (documentDetailsServiceStub, distributeAction, fixture, dispatchSpy: jasmine.Spy) {

    let doc = new Document()
    doc.Id = '1234'
    distributeAction.command.next(doc);

    fixture.detectChanges();
    expect(dispatchSpy).toHaveBeenCalledWith(doc.Id, DocumentDetailsType.Document);
    expect(fixture.componentInstance.showUpdateDocumentSlideOut).toBeTruthy();

    let slideout = fixture.debugElement.query(By.directive(AeSlideOutComponent));
    expect(slideout).toBeTruthy();
}

let removeAssert = function (removeAction, fixture) {
    let doc = new Document()
    doc.Id = '1234'
    removeAction.command.next(doc);

    let actionButton = <AeNavActionsComponent<any>>fixture.debugElement.query(By.directive(AeNavActionsComponent)).componentInstance;
    let event = new MouseEvent('click');
    actionButton._onClick(event);

    fixture.detectChanges();

    let confirm = fixture.debugElement.query(By.directive(AeModalDialogComponent));
    expect(confirm).toBeTruthy();

    let modelHeader = confirm.query(By.css('.modal-dialog-header'));
    expect(modelHeader.nativeElement.innerText.trim()).toEqual('PERSONAL_DOCUMENT_REMOVE_DIALOG.Remove_Document_Heading_text');

    let modelBody = confirm.query(By.css('.modal-dialog-body'));
    expect(modelBody.nativeElement.innerText.trim()).toEqual('PERSONAL_DOCUMENT_REMOVE_DIALOG.Info');

    let confirmButton = confirm.query(By.css('#deleteConfirmYes_aeButton_1'));

    confirmButton.nativeElement.click();
    fixture.detectChanges();

    confirm = fixture.debugElement.query(By.directive(AeModalDialogComponent));
    expect(confirm).toBeNull();
}

let filterChangeAssert = function (fixture, store, folder: number) {
    let filter = fixture.debugElement.query(By.directive(AeSelectComponent));
    let dispatchSpy = spyOn(store, 'dispatch');

    filter.componentInstance.value = 1;
    fixture.detectChanges();
    filter.componentInstance.onChange();

    let params: AtlasParams[] = [];
    params.push(new AtlasParams('DocumentFolder', folder));
    params.push(new AtlasParams('Site', null));
    params.push(new AtlasParams('DocumentCategory', ''));
    params.push(new AtlasParams('DepartmentId', null));
    params.push(new AtlasParams('EmployeeId', null));
    params.push(new AtlasParams('DocumentViewByCategoryStatus', null));

    let apiRequest: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'FileNameAndTitle', SortDirection.Ascending, params);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(new LoadCompanyDocumentsAction(apiRequest));
}

describe('Company documents > Health & safety documents > Handbook and policy folder', () => {
    let component: CompanyDocumentsListComponent;
    let fixture: ComponentFixture<CompanyDocumentsListComponent>;
    let activatedRouteStub;
    let store: Store<fromRoot.State>;
    let claimsHelperServiceMock;
    let routerMock;
    let actions;
    let viewAction;
    let downloadAction;
    let distributeAction;
    let documentDetailsServiceStub;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , ReactiveFormsModule
                , AtlasElementsModule
                , StoreModule.provideStore(reducer)
                , NoopAnimationsModule
            ]
            , declarations: [
                CompanyDocumentsListComponent
                , DocumentReviewDistributeComponenet
                , DocumentUpdateComponent
            ]
            , providers: [
                InjectorRef
                , BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canUpdateDocumentCategory'
                        , 'getUserId'
                        , 'isAdministrator'
                        , 'canDistributeAnyDocument'
                    ])
                }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , DocumentCategoryService
                , EmployeeSearchService
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceMock', ['']) }
                , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
                , MessengerService
                , { provide: RouteParams, useValue: jasmine.createSpyObj('routeParamsMock', ['']) }
                , DocumentService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsListComponent);
        component = fixture.componentInstance;

        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        store = fixture.debugElement.injector.get(Store);
        routerMock = fixture.debugElement.injector.get(Router);
        documentDetailsServiceStub = fixture.debugElement.injector.get(DocumentDetailsService);

        let array: UrlSegment[] = [];
        array.push(new UrlSegment('handbooks-and-policies', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        (<ActivatedRouteStub>activatedRouteStub).testUrl = array;

        store.dispatch(new LoadAuthorizedDocumentCategoriesComplete(extractDocumentCategoryItems(MockStoreProviderUser.getDocumentCategories())));
        store.dispatch(new LoadSitesCompleteAction(MockStoreProviderCompany.getSitesMock().Entities));
        store.dispatch(new LoadCompanyDocumentsCompleteAction(MockStoreCompanyDocuments.getHandbooksDataMock()));

        fixture.detectChanges();
    });

    beforeEach(() => {
        actions = component.actions;
        viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
        downloadAction = CommonTestHelper.getGivenButton(actions.toArray(), 'download');
        distributeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'distribute');
    })

    it('should be created', () => {
        expect(component).toBeTruthy()
    });

    it('should have 2 filters and filter change should dispatch for API with proper data', () => {
        let filters = fixture.debugElement.queryAll(By.directive(AeSelectComponent));
        filterAssert(filters, 0, 'ALL_CATEGORIES', '', 'option', 3);
        filters = fixture.debugElement.queryAll(By.directive(AeAutocompleteComponent));
        filterAssert(filters, 0, 'ALL_SITES', '');

        filterChangeAssert(fixture, store, DocumentsFolder.HanbooksAndPolicies);
    });

    it('should have columns Document name, category, version, site name, upload date with actions: view, download and distribute', fakeAsync(() => {
        let columns = fixture.debugElement.queryAll(By.css('.table__heading'));

        expect(columns.length).toEqual(6);

        columnsAssert(columns, 0, 'CITATIONDRAFTS.DOCUMENT_NAME', true, 'FileNameAndTitle');
        columnsAssert(columns, 1, 'CITATIONDRAFTS.CATEGORY', true, 'CategoryName');
        columnsAssert(columns, 2, 'CITATIONDRAFTS.VERSION', true, 'Version');
        columnsAssert(columns, 3, 'CITATIONDRAFTS.SITENAME', true, 'SiteName');
        columnsAssert(columns, 4, 'CITATIONDRAFTS.UPLOAD_DATE', true, 'ModifiedOn');
        columnsAssert(columns, 5, 'Actions', false);

        actionsAssert(fixture, ['view', 'download', 'distribute']);
        viewAssert(routerMock, viewAction, fixture);
        downloadAssert(downloadAction, fixture);
        let dispatchSpy = spyOn(documentDetailsServiceStub, 'dispatchDocumentDetails');
        distributeAssert(documentDetailsServiceStub, distributeAction, fixture, dispatchSpy);

    }));

    it('It should have page change and sort options', (() => {
        let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
        let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
        let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
        expect(sortEvent).toBeDefined();
        expect(pageChangeEvent).toBeDefined();
    }));
});

describe('Company documents > Health & safety documents > Inspection report folder', () => {
    let component: CompanyDocumentsListComponent;
    let fixture: ComponentFixture<CompanyDocumentsListComponent>;
    let activatedRouteStub;
    let store: Store<fromRoot.State>;
    let claimsHelperServiceMock;
    let routerMock;
    let actions;
    let viewAction;
    let downloadAction;
    let distributeAction;
    let documentDetailsServiceStub;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , ReactiveFormsModule
                , AtlasElementsModule
                , StoreModule.provideStore(reducer)
                , NoopAnimationsModule
            ]
            , declarations: [
                CompanyDocumentsListComponent
                , DocumentReviewDistributeComponenet
                , DocumentUpdateComponent
            ]
            , providers: [
                InjectorRef
                , BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canUpdateDocumentCategory'
                        , 'getUserId'
                        , 'isAdministrator'
                        , 'canDistributeAnyDocument'
                    ])
                }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , DocumentCategoryService
                , EmployeeSearchService
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceMock', ['']) }
                , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
                , MessengerService
                , { provide: RouteParams, useValue: jasmine.createSpyObj('routeParamsMock', ['']) }
                , DocumentService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsListComponent);
        component = fixture.componentInstance;

        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        store = fixture.debugElement.injector.get(Store);
        routerMock = fixture.debugElement.injector.get(Router);
        documentDetailsServiceStub = fixture.debugElement.injector.get(DocumentDetailsService);

        let array: UrlSegment[] = [];
        array.push(new UrlSegment('inspection-reports', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        (<ActivatedRouteStub>activatedRouteStub).testUrl = array;

        store.dispatch(new LoadAuthorizedDocumentCategoriesComplete(extractDocumentCategoryItems(MockStoreProviderUser.getDocumentCategories())));
        store.dispatch(new LoadSitesCompleteAction(MockStoreProviderCompany.getSitesMock().Entities));
        store.dispatch(new LoadCompanyDocumentsCompleteAction(MockStoreCompanyDocuments.getInspectionReportsMock()));

        fixture.detectChanges();
    });

    beforeEach(() => {
        actions = component.actions;
        viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
        downloadAction = CommonTestHelper.getGivenButton(actions.toArray(), 'download');
        distributeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'distribute');
    })

    it('should be created', () => {
        expect(component).toBeTruthy()
    });

    it('should have 2 filters and filter change should dispatch for API with proper data', () => {
        let filters = fixture.debugElement.queryAll(By.directive(AeSelectComponent));
        filterAssert(filters, 0, 'ALL_CATEGORIES', '', 'option', 2);
        filters = fixture.debugElement.queryAll(By.directive(AeAutocompleteComponent));
        filterAssert(filters, 0, 'ALL_SITES', '');
        filterChangeAssert(fixture, store, DocumentsFolder.InsepectionReports);
    });

    it('should have columns Document name, category, version, site name, upload date with actions: view, download and distribute', fakeAsync(() => {
        let columns = fixture.debugElement.queryAll(By.css('.table__heading'));

        expect(columns.length).toEqual(6);

        columnsAssert(columns, 0, 'CITATIONDRAFTS.DOCUMENT_NAME', true, 'FileNameAndTitle');
        columnsAssert(columns, 1, 'CITATIONDRAFTS.CATEGORY', true, 'CategoryName');
        columnsAssert(columns, 2, 'CITATIONDRAFTS.VERSION', true, 'Version');
        columnsAssert(columns, 3, 'CITATIONDRAFTS.SITENAME', true, 'SiteName');
        columnsAssert(columns, 4, 'CITATIONDRAFTS.UPLOAD_DATE', true, 'ModifiedOn');
        columnsAssert(columns, 5, 'Actions', false);

        actionsAssert(fixture, ['view', 'download', 'distribute']);
        viewAssert(routerMock, viewAction, fixture);
        downloadAssert(downloadAction, fixture);
        let dispatchSpy = spyOn(documentDetailsServiceStub, 'dispatchDocumentDetails');
        distributeAssert(documentDetailsServiceStub, distributeAction, fixture, dispatchSpy);

    }));

    it('It should have page change and sort options', (() => {
        let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
        let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
        let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
        expect(sortEvent).toBeDefined();
        expect(pageChangeEvent).toBeDefined();
    }));
});

describe('Company documents > Health & safety documents > H&S document suite folder', () => {
    let component: CompanyDocumentsListComponent;
    let fixture: ComponentFixture<CompanyDocumentsListComponent>;
    let activatedRouteStub;
    let store: Store<fromRoot.State>;
    let claimsHelperServiceMock;
    let routerMock;
    let actions;
    let viewAction;
    let downloadAction;
    let distributeAction;
    let documentDetailsServiceStub;
    let removeAction;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , ReactiveFormsModule
                , AtlasElementsModule
                , StoreModule.provideStore(reducer)
                , NoopAnimationsModule
            ]
            , declarations: [
                CompanyDocumentsListComponent
                , DocumentReviewDistributeComponenet
                , DocumentUpdateComponent
            ]
            , providers: [
                InjectorRef
                , BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canUpdateDocumentCategory'
                        , 'getUserId'
                        , 'isAdministrator'
                        , 'canDistributeAnyDocument'
                        , 'canFullAssignedToShown'
                    ])
                }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , DocumentCategoryService
                , EmployeeSearchService
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceMock', ['']) }
                , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
                , MessengerService
                , { provide: RouteParams, useValue: jasmine.createSpyObj('routeParamsMock', ['']) }
                , DocumentService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsListComponent);
        component = fixture.componentInstance;

        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        store = fixture.debugElement.injector.get(Store);
        routerMock = fixture.debugElement.injector.get(Router);
        documentDetailsServiceStub = fixture.debugElement.injector.get(DocumentDetailsService);

        let array: UrlSegment[] = [];
        array.push(new UrlSegment('hs-documentsuite', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        (<ActivatedRouteStub>activatedRouteStub).testUrl = array;

        store.dispatch(new LoadAuthorizedDocumentCategoriesComplete(extractDocumentCategoryItems(MockStoreProviderUser.getDocumentCategories())));
        store.dispatch(new LoadSitesCompleteAction(MockStoreProviderCompany.getSitesMock().Entities));
        store.dispatch(new LoadCompanyDocumentsCompleteAction(MockStoreCompanyDocuments.getHSSuiteMock()));

        fixture.detectChanges();
    });

    beforeEach(() => {
        actions = component.actions;
        viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
        downloadAction = CommonTestHelper.getGivenButton(actions.toArray(), 'download');
        distributeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'distribute');
        removeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'remove');
    })

    it('should be created', () => {
        expect(component).toBeTruthy()
    });

    it('should have 2 filters and filter change should dispatch for API with proper data', () => {
        let filters = fixture.debugElement.queryAll(By.directive(AeSelectComponent));
        filterAssert(filters, 0, 'ALL_CATEGORIES', '', 'option', 9);
        filters = fixture.debugElement.queryAll(By.directive(AeAutocompleteComponent));
        filterAssert(filters, 0, 'ALL_SITES', '');
        filterChangeAssert(fixture, store, DocumentsFolder.HSDocumentSuite);
    });

    it('should have columns Document name, category, version, site name, upload date with actions: view, download, distribute, remove', fakeAsync(() => {
        let columns = fixture.debugElement.queryAll(By.css('.table__heading'));

        expect(columns.length).toEqual(6);

        columnsAssert(columns, 0, 'CITATIONDRAFTS.DOCUMENT_NAME', true, 'FileNameAndTitle');
        columnsAssert(columns, 1, 'CITATIONDRAFTS.CATEGORY', true, 'CategoryName');
        columnsAssert(columns, 2, 'CITATIONDRAFTS.VERSION', true, 'Version');
        columnsAssert(columns, 3, 'CITATIONDRAFTS.SITENAME', true, 'SiteName');
        columnsAssert(columns, 4, 'CITATIONDRAFTS.UPLOAD_DATE', true, 'ModifiedOn');
        columnsAssert(columns, 5, 'Actions', false);

        actionsAssert(fixture, ['view', 'download', 'distribute', 'remove']);
        viewAssert(routerMock, viewAction, fixture);
        downloadAssert(downloadAction, fixture);
        let dispatchSpy = spyOn(documentDetailsServiceStub, 'dispatchDocumentDetails');
        distributeAssert(documentDetailsServiceStub, distributeAction, fixture, dispatchSpy);
        removeAssert(removeAction, fixture);

    }));

    it('It should have page change and sort options', (() => {
        let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
        let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
        let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
        expect(sortEvent).toBeDefined();
        expect(pageChangeEvent).toBeDefined();
    }));
});

describe('Company documents > HR & employee documents > Appraisal and reviews folder', () => {
    let component: CompanyDocumentsListComponent;
    let fixture: ComponentFixture<CompanyDocumentsListComponent>;
    let activatedRouteStub;
    let store: Store<fromRoot.State>;
    let claimsHelperServiceMock;
    let routerMock;
    let actions;
    let viewAction;
    let downloadAction;
    let distributeAction;
    let documentDetailsServiceStub;
    let removeAction;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , ReactiveFormsModule
                , AtlasElementsModule
                , StoreModule.provideStore(reducer)
                , NoopAnimationsModule
            ]
            , declarations: [
                CompanyDocumentsListComponent
                , DocumentReviewDistributeComponenet
                , DocumentUpdateComponent
            ]
            , providers: [
                InjectorRef
                , BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canUpdateDocumentCategory'
                        , 'getUserId'
                        , 'isAdministrator'
                        , 'canDistributeAnyDocument'
                        , 'canFullAssignedToShown'
                    ])
                }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , DocumentCategoryService
                , EmployeeSearchService
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceMock', ['']) }
                , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
                , MessengerService
                , { provide: RouteParams, useValue: jasmine.createSpyObj('routeParamsMock', ['']) }
                , DocumentService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsListComponent);
        component = fixture.componentInstance;

        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        store = fixture.debugElement.injector.get(Store);
        routerMock = fixture.debugElement.injector.get(Router);
        documentDetailsServiceStub = fixture.debugElement.injector.get(DocumentDetailsService);

        let array: UrlSegment[] = [];
        array.push(new UrlSegment('appraisal-and-reviews', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        (<ActivatedRouteStub>activatedRouteStub).testUrl = array;

        store.dispatch(new LoadAuthorizedDocumentCategoriesComplete(extractDocumentCategoryItems(MockStoreProviderUser.getDocumentCategories())));
        store.dispatch(new LoadSitesCompleteAction(MockStoreProviderCompany.getSitesMock().Entities));
        store.dispatch(new LoadCompanyDocumentsCompleteAction(MockStoreCompanyDocuments.getAppraisalReviewDataMock()));

        fixture.detectChanges();
    });

    beforeEach(() => {
        actions = component.actions;
        viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
        downloadAction = CommonTestHelper.getGivenButton(actions.toArray(), 'download');
        distributeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'distribute');
        removeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'remove');
    })

    it('should be created', () => {
        expect(component).toBeTruthy()
    });

    it('should have 4 filters and filter change should dispatch for API with proper data', () => {
        let filters = fixture.debugElement.queryAll(By.directive(AeSelectComponent));
        filterAssert(filters, 0, 'ALL_CATEGORIES', '', 'option', 3);
        filters = fixture.debugElement.queryAll(By.directive(AeAutocompleteComponent));
        filterAssert(filters, 0, 'ALL_SITES', '');
        filterAssert(filters, 1, 'ALL_DEPARTMENTS', '');
        filterAssert(filters, 2, 'ALL_EMPLOYEES', []);
        filterChangeAssert(fixture, store, DocumentsFolder.AppraisalReviews);
    });

    it('should have columns Document name, category, version, site name, employee name, upload date with actions: view, download, distribute and remove', fakeAsync(() => {
        claimsHelperServiceMock.getUserId.and.returnValue('c4d65343-b71e-437e-b96d-3d5f0fe1c413');

        let columns = fixture.debugElement.queryAll(By.css('.table__heading'));

        expect(columns.length).toEqual(7);

        columnsAssert(columns, 0, 'CITATIONDRAFTS.DOCUMENT_NAME', true, 'FileNameAndTitle');
        columnsAssert(columns, 1, 'CITATIONDRAFTS.CATEGORY', true, 'CategoryName');
        columnsAssert(columns, 2, 'CITATIONDRAFTS.VERSION', true, 'Version');
        columnsAssert(columns, 3, 'CITATIONDRAFTS.SITENAME', true, 'SiteName');
        columnsAssert(columns, 4, 'HANDBOOK.EMPLOYEE_NAME', true, 'EmployeeName');
        columnsAssert(columns, 5, 'CITATIONDRAFTS.UPLOAD_DATE', true, 'ModifiedOn');
        columnsAssert(columns, 6, 'Actions', false);

        actionsAssert(fixture, ['view', 'download', 'distribute', 'remove']);
        viewAssert(routerMock, viewAction, fixture);
        downloadAssert(downloadAction, fixture);
        let dispatchSpy = spyOn(documentDetailsServiceStub, 'dispatchDocumentDetails');
        distributeAssert(documentDetailsServiceStub, distributeAction, fixture, dispatchSpy);
        removeAssert(removeAction, fixture);
    }));

    it('It should have page change and sort options', (() => {
        let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
        let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
        let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
        expect(sortEvent).toBeDefined();
        expect(pageChangeEvent).toBeDefined();
    }));
});

describe('Company documents > HR & employee documents > Disciplinaries and grievances folder', () => {
    let component: CompanyDocumentsListComponent;
    let fixture: ComponentFixture<CompanyDocumentsListComponent>;
    let activatedRouteStub;
    let store: Store<fromRoot.State>;
    let claimsHelperServiceMock;
    let routerMock;
    let actions;
    let viewAction;
    let downloadAction;
    let distributeAction;
    let documentDetailsServiceStub;
    let removeAction;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , ReactiveFormsModule
                , AtlasElementsModule
                , StoreModule.provideStore(reducer)
                , NoopAnimationsModule
            ]
            , declarations: [
                CompanyDocumentsListComponent
                , DocumentReviewDistributeComponenet
                , DocumentUpdateComponent
            ]
            , providers: [
                InjectorRef
                , BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canUpdateDocumentCategory'
                        , 'getUserId'
                        , 'isAdministrator'
                        , 'canDistributeAnyDocument'
                        , 'canFullAssignedToShown'
                    ])
                }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , DocumentCategoryService
                , EmployeeSearchService
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceMock', ['']) }
                , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
                , MessengerService
                , { provide: RouteParams, useValue: jasmine.createSpyObj('routeParamsMock', ['']) }
                , DocumentService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsListComponent);
        component = fixture.componentInstance;

        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        store = fixture.debugElement.injector.get(Store);
        routerMock = fixture.debugElement.injector.get(Router);
        documentDetailsServiceStub = fixture.debugElement.injector.get(DocumentDetailsService);



        let array: UrlSegment[] = [];
        array.push(new UrlSegment('disciplinary', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        (<ActivatedRouteStub>activatedRouteStub).testUrl = array;

        store.dispatch(new LoadAuthorizedDocumentCategoriesComplete(extractDocumentCategoryItems(MockStoreProviderUser.getDocumentCategories())));
        store.dispatch(new LoadSitesCompleteAction(MockStoreProviderCompany.getSitesMock().Entities));
        store.dispatch(new LoadCompanyDocumentsCompleteAction(MockStoreCompanyDocuments.getDiscilinarisGrievancesDataMock()));

        fixture.detectChanges();
    });

    beforeEach(() => {
        actions = component.actions;
        viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
        downloadAction = CommonTestHelper.getGivenButton(actions.toArray(), 'download');
        distributeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'distribute');
        removeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'remove');
    })

    it('should be created', () => {
        expect(component).toBeTruthy()
    });

    it('should have 4 filters and filter change should dispatch for API with proper data', () => {
        let filters = fixture.debugElement.queryAll(By.directive(AeSelectComponent));
        filterAssert(filters, 0, 'ALL_CATEGORIES', '', 'option', 3);
        filters = fixture.debugElement.queryAll(By.directive(AeAutocompleteComponent));
        filterAssert(filters, 0, 'ALL_SITES', '');
        filterAssert(filters, 1, 'ALL_DEPARTMENTS', '');
        filterAssert(filters, 2, 'ALL_EMPLOYEES', []);
        filterChangeAssert(fixture, store, DocumentsFolder.DisciplinaryAndGrivences);
    });

    it('should have columns Document name, category, version, site name, employee name, upload date with actions: view, download, distribute and remove', fakeAsync(() => {
        claimsHelperServiceMock.getUserId.and.returnValue('c4d65343-b71e-437e-b96d-3d5f0fe1c413');

        let columns = fixture.debugElement.queryAll(By.css('.table__heading'));

        expect(columns.length).toEqual(7);

        columnsAssert(columns, 0, 'CITATIONDRAFTS.DOCUMENT_NAME', true, 'FileNameAndTitle');
        columnsAssert(columns, 1, 'CITATIONDRAFTS.CATEGORY', true, 'CategoryName');
        columnsAssert(columns, 2, 'CITATIONDRAFTS.VERSION', true, 'Version');
        columnsAssert(columns, 3, 'CITATIONDRAFTS.SITENAME', true, 'SiteName');
        columnsAssert(columns, 4, 'HANDBOOK.EMPLOYEE_NAME', true, 'EmployeeName');
        columnsAssert(columns, 5, 'CITATIONDRAFTS.UPLOAD_DATE', true, 'ModifiedOn');
        columnsAssert(columns, 6, 'Actions', false);

        actionsAssert(fixture, ['view', 'download', 'distribute']);
        actionsAssert(fixture, ['view', 'download', 'distribute', 'remove'], 1);
        viewAssert(routerMock, viewAction, fixture);
        downloadAssert(downloadAction, fixture);
        let dispatchSpy = spyOn(documentDetailsServiceStub, 'dispatchDocumentDetails');
        distributeAssert(documentDetailsServiceStub, distributeAction, fixture, dispatchSpy);
        removeAssert(removeAction, fixture);
    }));

    it('It should have page change and sort options', (() => {
        let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
        let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
        let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
        expect(sortEvent).toBeDefined();
        expect(pageChangeEvent).toBeDefined();
    }));
});

describe('Company documents > HR & employee documents > Training folder', () => {
    let component: CompanyDocumentsListComponent;
    let fixture: ComponentFixture<CompanyDocumentsListComponent>;
    let activatedRouteStub;
    let store: Store<fromRoot.State>;
    let claimsHelperServiceMock;
    let routerMock;
    let actions;
    let viewAction;
    let downloadAction;
    let distributeAction;
    let documentDetailsServiceStub;
    let removeAction;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , ReactiveFormsModule
                , AtlasElementsModule
                , StoreModule.provideStore(reducer)
                , NoopAnimationsModule
            ]
            , declarations: [
                CompanyDocumentsListComponent
                , DocumentReviewDistributeComponenet
                , DocumentUpdateComponent
            ]
            , providers: [
                InjectorRef
                , BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canUpdateDocumentCategory'
                        , 'getUserId'
                        , 'isAdministrator'
                        , 'canDistributeAnyDocument'
                        , 'canFullAssignedToShown'
                    ])
                }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , DocumentCategoryService
                , EmployeeSearchService
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceMock', ['']) }
                , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
                , MessengerService
                , { provide: RouteParams, useValue: jasmine.createSpyObj('routeParamsMock', ['']) }
                , DocumentService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsListComponent);
        component = fixture.componentInstance;

        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        store = fixture.debugElement.injector.get(Store);
        routerMock = fixture.debugElement.injector.get(Router);
        documentDetailsServiceStub = fixture.debugElement.injector.get(DocumentDetailsService);



        let array: UrlSegment[] = [];
        array.push(new UrlSegment('training', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        (<ActivatedRouteStub>activatedRouteStub).testUrl = array;

        store.dispatch(new LoadAuthorizedDocumentCategoriesComplete(extractDocumentCategoryItems(MockStoreProviderUser.getDocumentCategories())));
        store.dispatch(new LoadSitesCompleteAction(MockStoreProviderCompany.getSitesMock().Entities));
        store.dispatch(new LoadCompanyDocumentsCompleteAction(MockStoreCompanyDocuments.getTrainingDataMock()));

        fixture.detectChanges();
    });

    beforeEach(() => {
        actions = component.actions;
        viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
        downloadAction = CommonTestHelper.getGivenButton(actions.toArray(), 'download');
        distributeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'distribute');
        removeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'remove');
    })

    it('should be created', () => {
        expect(component).toBeTruthy()
    });

    it('should have 4 filters and filter change should dispatch for API with proper data', () => {
        let filters = fixture.debugElement.queryAll(By.directive(AeSelectComponent));
        filterAssert(filters, 0, 'ALL_CATEGORIES', '', 'option', 2);
        filters = fixture.debugElement.queryAll(By.directive(AeAutocompleteComponent));
        filterAssert(filters, 0, 'ALL_SITES', '');
        filterAssert(filters, 1, 'ALL_DEPARTMENTS', '');
        filterAssert(filters, 2, 'ALL_EMPLOYEES', []);
        filterChangeAssert(fixture, store, DocumentsFolder.Trainings);
    });

    it('should have columns Document name, category, version, site name, employee name, upload date with actions: view, download, distribute and remove', fakeAsync(() => {
        claimsHelperServiceMock.getUserId.and.returnValue('c4d65343-b71e-437e-b96d-3d5f0fe1c413');

        let columns = fixture.debugElement.queryAll(By.css('.table__heading'));

        expect(columns.length).toEqual(7);

        columnsAssert(columns, 0, 'CITATIONDRAFTS.DOCUMENT_NAME', true, 'FileNameAndTitle');
        columnsAssert(columns, 1, 'CITATIONDRAFTS.CATEGORY', true, 'CategoryName');
        columnsAssert(columns, 2, 'CITATIONDRAFTS.VERSION', true, 'Version');
        columnsAssert(columns, 3, 'CITATIONDRAFTS.SITENAME', true, 'SiteName');
        columnsAssert(columns, 4, 'HANDBOOK.EMPLOYEE_NAME', true, 'EmployeeName');
        columnsAssert(columns, 5, 'CITATIONDRAFTS.UPLOAD_DATE', true, 'ModifiedOn');
        columnsAssert(columns, 6, 'Actions', false);

        actionsAssert(fixture, ['view', 'download', 'distribute', 'remove']);
        actionsAssert(fixture, ['view', 'download', 'distribute', 'remove'], 1);
        viewAssert(routerMock, viewAction, fixture);
        downloadAssert(downloadAction, fixture);
        let dispatchSpy = spyOn(documentDetailsServiceStub, 'dispatchDocumentDetails');
        distributeAssert(documentDetailsServiceStub, distributeAction, fixture, dispatchSpy);
        removeAssert(removeAction, fixture);
    }));

    it('It should have page change and sort options', (() => {
        let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
        let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
        let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
        expect(sortEvent).toBeDefined();
        expect(pageChangeEvent).toBeDefined();
    }));
});

describe('Company documents > HR & employee documents > Starters and leavers folder', () => {
    let component: CompanyDocumentsListComponent;
    let fixture: ComponentFixture<CompanyDocumentsListComponent>;
    let activatedRouteStub;
    let store: Store<fromRoot.State>;
    let claimsHelperServiceMock;
    let routerMock;
    let actions;
    let viewAction;
    let downloadAction;
    let distributeAction;
    let documentDetailsServiceStub;
    let removeAction;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , ReactiveFormsModule
                , AtlasElementsModule
                , StoreModule.provideStore(reducer)
                , NoopAnimationsModule
            ]
            , declarations: [
                CompanyDocumentsListComponent
                , DocumentReviewDistributeComponenet
                , DocumentUpdateComponent
            ]
            , providers: [
                InjectorRef
                , BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canUpdateDocumentCategory'
                        , 'getUserId'
                        , 'isAdministrator'
                        , 'canDistributeAnyDocument'
                        , 'canFullAssignedToShown'
                    ])
                }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , DocumentCategoryService
                , EmployeeSearchService
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceMock', ['']) }
                , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
                , MessengerService
                , { provide: RouteParams, useValue: jasmine.createSpyObj('routeParamsMock', ['']) }
                , DocumentService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsListComponent);
        component = fixture.componentInstance;

        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        store = fixture.debugElement.injector.get(Store);
        routerMock = fixture.debugElement.injector.get(Router);
        documentDetailsServiceStub = fixture.debugElement.injector.get(DocumentDetailsService);



        let array: UrlSegment[] = [];
        array.push(new UrlSegment('starters', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        (<ActivatedRouteStub>activatedRouteStub).testUrl = array;

        store.dispatch(new LoadAuthorizedDocumentCategoriesComplete(extractDocumentCategoryItems(MockStoreProviderUser.getDocumentCategories())));
        store.dispatch(new LoadSitesCompleteAction(MockStoreProviderCompany.getSitesMock().Entities));
        store.dispatch(new LoadCompanyDocumentsCompleteAction(MockStoreCompanyDocuments.getStartersLeaversDataMock()));

        fixture.detectChanges();
    });

    beforeEach(() => {
        actions = component.actions;
        viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
        downloadAction = CommonTestHelper.getGivenButton(actions.toArray(), 'download');
        distributeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'distribute');
        removeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'remove');
    })

    it('should be created', () => {
        expect(component).toBeTruthy()
    });

    it('should have 4 filters and filter change should dispatch for API with proper data', () => {
        let filters = fixture.debugElement.queryAll(By.directive(AeSelectComponent));
        filterAssert(filters, 0, 'ALL_CATEGORIES', '', 'option', 4);
        filters = fixture.debugElement.queryAll(By.directive(AeAutocompleteComponent));
        filterAssert(filters, 0, 'ALL_SITES', '');
        filterAssert(filters, 1, 'ALL_DEPARTMENTS', '');
        filterAssert(filters, 2, 'ALL_EMPLOYEES', []);
        filterChangeAssert(fixture, store, DocumentsFolder.StartersAndLeavers);
    });

    it('should have columns Document name, category, version, site name, employee name, upload date with actions: view, download, distribute and remove', fakeAsync(() => {
        claimsHelperServiceMock.getUserId.and.returnValue('c4d65343-b71e-437e-b96d-3d5f0fe1c413');

        let columns = fixture.debugElement.queryAll(By.css('.table__heading'));

        expect(columns.length).toEqual(7);

        columnsAssert(columns, 0, 'CITATIONDRAFTS.DOCUMENT_NAME', true, 'FileNameAndTitle');
        columnsAssert(columns, 1, 'CITATIONDRAFTS.CATEGORY', true, 'CategoryName');
        columnsAssert(columns, 2, 'CITATIONDRAFTS.VERSION', true, 'Version');
        columnsAssert(columns, 3, 'CITATIONDRAFTS.SITENAME', true, 'SiteName');
        columnsAssert(columns, 4, 'HANDBOOK.EMPLOYEE_NAME', true, 'EmployeeName');
        columnsAssert(columns, 5, 'CITATIONDRAFTS.UPLOAD_DATE', true, 'ModifiedOn');
        columnsAssert(columns, 6, 'Actions', false);

        actionsAssert(fixture, ['view', 'download', 'distribute', 'remove']);
        actionsAssert(fixture, ['view', 'download', 'distribute', 'remove'], 1);
        viewAssert(routerMock, viewAction, fixture);
        downloadAssert(downloadAction, fixture);
        let dispatchSpy = spyOn(documentDetailsServiceStub, 'dispatchDocumentDetails');
        distributeAssert(documentDetailsServiceStub, distributeAction, fixture, dispatchSpy);
        removeAssert(removeAction, fixture);
    }));

    it('It should have page change and sort options', (() => {
        let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
        let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
        let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
        expect(sortEvent).toBeDefined();
        expect(pageChangeEvent).toBeDefined();
    }));
});

describe('Company documents > Company Policies', () => {
    let component: CompanyDocumentsListComponent;
    let fixture: ComponentFixture<CompanyDocumentsListComponent>;
    let activatedRouteStub;
    let store: Store<fromRoot.State>;
    let claimsHelperServiceMock;
    let routerMock;
    let actions;
    let viewAction;
    let downloadAction;
    let distributeAction;
    let documentDetailsServiceStub;
    let removeAction;
    let updateAction;
    let dispatchSpy: jasmine.Spy;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , ReactiveFormsModule
                , AtlasElementsModule
                , StoreModule.provideStore(reducer)
                , NoopAnimationsModule
            ]
            , declarations: [
                CompanyDocumentsListComponent
                , DocumentReviewDistributeComponenet
                , DocumentUpdateComponent
            ]
            , providers: [
                InjectorRef
                , BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canUpdateDocumentCategory'
                        , 'getUserId'
                        , 'isAdministrator'
                        , 'canDistributeAnyDocument'
                        , 'canFullAssignedToShown'
                    ])
                }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , DocumentCategoryService
                , EmployeeSearchService
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceMock', ['']) }
                , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
                , MessengerService
                , { provide: RouteParams, useValue: jasmine.createSpyObj('routeParamsMock', ['']) }
                , DocumentService
            ]
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsListComponent);
        component = fixture.componentInstance;

        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        store = fixture.debugElement.injector.get(Store);
        routerMock = fixture.debugElement.injector.get(Router);
        documentDetailsServiceStub = fixture.debugElement.injector.get(DocumentDetailsService);

        let array: UrlSegment[] = [];
        array.push(new UrlSegment('company-policies', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        (<ActivatedRouteStub>activatedRouteStub).testUrl = array;

        store.dispatch(new LoadSitesCompleteAction(MockStoreProviderCompany.getSitesMock().Entities));
        store.dispatch(new LoadCompanyDocumentsCompleteAction(MockStoreCompanyDocuments.getCompanyPoliciesDataMock()));
        dispatchSpy = spyOn(store, 'dispatch');
        fixture.detectChanges();
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
    });
    beforeEach(() => {
        actions = component.actions;
        viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
        downloadAction = CommonTestHelper.getGivenButton(actions.toArray(), 'download');
        distributeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'distribute');
        removeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'remove');
    })

    it('should be created ', () => {
        expect(component).toBeTruthy()
    });

    it('should have columns Document name, version, site name, upload date with actions: view, download, distribute and remove', fakeAsync(() => {
        let columns = fixture.debugElement.queryAll(By.css('.table__heading'));
        expect(columns.length).toEqual(5);
        columnsAssert(columns, 0, 'CITATIONDRAFTS.DOCUMENT_NAME', true, 'FileNameAndTitle');
        columnsAssert(columns, 1, 'CITATIONDRAFTS.VERSION', true, 'Version');
        columnsAssert(columns, 2, 'CITATIONDRAFTS.SITENAME', true, 'SiteName');
        columnsAssert(columns, 3, 'CITATIONDRAFTS.UPLOAD_DATE', true, 'ModifiedOn');
        columnsAssert(columns, 4, 'Actions', false);
        tick(100);
        actionsAssert(fixture, ['view', 'download', 'distribute', 'remove']);
        actionsAssert(fixture, ['view', 'download', 'distribute', 'remove'], 1);
        viewAssert(routerMock, viewAction, fixture);
        downloadAssert(downloadAction, fixture);
        let dispatchSpy = spyOn(documentDetailsServiceStub, 'dispatchDocumentDetails');
        distributeAssert(documentDetailsServiceStub, distributeAction, fixture, dispatchSpy);
        removeAssert(removeAction, fixture);
    }));

    it('It should have page change and sort options', fakeAsync(() => {
        let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
        let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
        let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
        tick(100);
        expect(sortEvent).toBeDefined();
        expect(pageChangeEvent).toBeDefined();
    }));

    it('should have site filters and filter change should dispatch for API with proper data', fakeAsync(() => {
        let filters = fixture.debugElement.queryAll(By.directive(AeAutocompleteComponent));
        filterAssert(filters, 0, 'ALL_SITES', '');
        // filterChangeAssert(fixture, store, DocumentsFolder.CompanyPolicies);
        let currentRequest = component.apiRequest;
        let selectedSite = new AeSelectItem<string>('Main Site', '0584fa4a-83ba-3084-0a0d-e42c22c0d7d4', false);
        component.companyDocumentsListForm.patchValue({ site: [selectedSite] });
        fixture.detectChanges();
        tick(200);
        currentRequest.Params = addOrUpdateAtlasParamValue(currentRequest.Params, 'site', '0584fa4a-83ba-3084-0a0d-e42c22c0d7d4');
        let companyDocLoadAction: LoadCompanyDocumentsAction = (new LoadCompanyDocumentsAction(currentRequest));
        expect(dispatchSpy).toHaveBeenCalledWith(companyDocLoadAction);
        dispatchSpy.and.callThrough();

        store.dispatch(new LoadCompanyDocumentsCompleteAction(MockStoreCompanyDocuments.getCompanyPoliciesFilterDataMock()));
        fixture.detectChanges();
    }));
})

describe('Company documents > Others folder', () => {
    let component: CompanyDocumentsListComponent;
    let fixture: ComponentFixture<CompanyDocumentsListComponent>;
    let activatedRouteStub;
    let store: Store<fromRoot.State>;
    let claimsHelperServiceMock;
    let routerMock;
    let actions;
    let viewAction;
    let downloadAction;
    let distributeAction;
    let documentDetailsServiceStub;
    let removeAction;
    let updateAction;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , ReactiveFormsModule
                , AtlasElementsModule
                , StoreModule.provideStore(reducer)
                , NoopAnimationsModule
            ]
            , declarations: [
                CompanyDocumentsListComponent
                , DocumentReviewDistributeComponenet
                , DocumentUpdateComponent
            ]
            , providers: [
                InjectorRef
                , BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canUpdateDocumentCategory'
                        , 'getUserId'
                        , 'isAdministrator'
                        , 'canDistributeAnyDocument'
                        , 'canFullAssignedToShown'
                    ])
                }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , DocumentCategoryService
                , EmployeeSearchService
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceMock', ['']) }
                , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
                , MessengerService
                , { provide: RouteParams, useValue: jasmine.createSpyObj('routeParamsMock', ['']) }
                , DocumentService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsListComponent);
        component = fixture.componentInstance;

        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        store = fixture.debugElement.injector.get(Store);
        routerMock = fixture.debugElement.injector.get(Router);
        documentDetailsServiceStub = fixture.debugElement.injector.get(DocumentDetailsService);

        let array: UrlSegment[] = [];
        array.push(new UrlSegment('other', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        (<ActivatedRouteStub>activatedRouteStub).testUrl = array;

        store.dispatch(new LoadAuthorizedDocumentCategoriesComplete(extractDocumentCategoryItems(MockStoreProviderUser.getDocumentCategories())));
        store.dispatch(new LoadSitesCompleteAction(MockStoreProviderCompany.getSitesMock().Entities));
        store.dispatch(new LoadCompanyDocumentsCompleteAction(MockStoreCompanyDocuments.getOthersDataMock()));

        fixture.detectChanges();
    });

    beforeEach(() => {
        actions = component.actions;
        viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
        downloadAction = CommonTestHelper.getGivenButton(actions.toArray(), 'download');
        distributeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'distribute');
        removeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'remove');
        updateAction = CommonTestHelper.getGivenButton(actions.toArray(), 'update');
    })

    it('should be created', () => {
        expect(component).toBeTruthy()
    });

    it('should have 2 filters and filter change should dispatch for API with proper data', () => {
        let filters = fixture.debugElement.queryAll(By.directive(AeSelectComponent));
        filterAssert(filters, 0, 'ALL_CATEGORIES', '', 'option', 7);
        filters = fixture.debugElement.queryAll(By.directive(AeAutocompleteComponent));
        filterAssert(filters, 0, 'ALL_SITES', '');

        filterChangeAssert(fixture, store, DocumentsFolder.Others);
    });

    it('should have columns Document name, category, version, site name, employee name, upload date with actions: view, download, distribute and remove', fakeAsync(() => {
        let columns = fixture.debugElement.queryAll(By.css('.table__heading'));

        expect(columns.length).toEqual(6);

        columnsAssert(columns, 0, 'CITATIONDRAFTS.DOCUMENT_NAME', true, 'FileNameAndTitle');
        columnsAssert(columns, 1, 'CITATIONDRAFTS.CATEGORY', true, 'CategoryName');
        columnsAssert(columns, 2, 'CITATIONDRAFTS.VERSION', true, 'Version');
        columnsAssert(columns, 3, 'CITATIONDRAFTS.SITENAME', true, 'SiteName');
        columnsAssert(columns, 4, 'CITATIONDRAFTS.UPLOAD_DATE', true, 'ModifiedOn');
        columnsAssert(columns, 5, 'Actions', false);

        actionsAssert(fixture, ['view', 'download', 'distribute', 'remove']);
        actionsAssert(fixture, ['view', 'download', 'distribute', 'remove'], 1);
        viewAssert(routerMock, viewAction, fixture);
        downloadAssert(downloadAction, fixture);
        let dispatchSpy = spyOn(documentDetailsServiceStub, 'dispatchDocumentDetails');
        distributeAssert(documentDetailsServiceStub, distributeAction, fixture, dispatchSpy);
        removeAssert(removeAction, fixture);
    }));

    it('should have columns Document name, category, version, site name, employee name, upload date with actions: view, download, distribute, update and remove', fakeAsync(() => {
        claimsHelperServiceMock.getUserId.and.returnValue('c4d65343-b71e-437e-b96d-3d5f0fe1c413');
        claimsHelperServiceMock.canUpdateDocumentCategory.and.returnValue(true);
        let columns = fixture.debugElement.queryAll(By.css('.table__heading'));

        expect(columns.length).toEqual(6);

        columnsAssert(columns, 0, 'CITATIONDRAFTS.DOCUMENT_NAME', true, 'FileNameAndTitle');
        columnsAssert(columns, 1, 'CITATIONDRAFTS.CATEGORY', true, 'CategoryName');
        columnsAssert(columns, 2, 'CITATIONDRAFTS.VERSION', true, 'Version');
        columnsAssert(columns, 3, 'CITATIONDRAFTS.SITENAME', true, 'SiteName');
        columnsAssert(columns, 4, 'CITATIONDRAFTS.UPLOAD_DATE', true, 'ModifiedOn');
        columnsAssert(columns, 5, 'Actions', false);

        actionsAssert(fixture, ['view', 'download', 'distribute', 'update', 'remove']);
        actionsAssert(fixture, ['view', 'download', 'distribute', 'remove'], 1);
        viewAssert(routerMock, viewAction, fixture);
        downloadAssert(downloadAction, fixture);
        let dispatchSpy = spyOn(documentDetailsServiceStub, 'dispatchDocumentDetails');
        distributeAssert(documentDetailsServiceStub, distributeAction, fixture, dispatchSpy);
        removeAssert(removeAction, fixture);
        updateAssert(documentDetailsServiceStub, updateAction, fixture, dispatchSpy);
    }));

    it('It should have page change and sort options', (() => {
        let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
        let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
        let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
        expect(sortEvent).toBeDefined();
        expect(pageChangeEvent).toBeDefined();
    }));
});

describe('Company documents > HR & employee documents > General folder', () => {
    let component: CompanyDocumentsListComponent;
    let fixture: ComponentFixture<CompanyDocumentsListComponent>;
    let activatedRouteStub;
    let store: Store<fromRoot.State>;
    let claimsHelperServiceMock;
    let routerMock;
    let actions;
    let viewAction;
    let downloadAction;
    let distributeAction;
    let documentDetailsServiceStub;
    let removeAction;
    let updateAction;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , ReactiveFormsModule
                , AtlasElementsModule
                , StoreModule.provideStore(reducer)
                , NoopAnimationsModule
            ]
            , declarations: [
                CompanyDocumentsListComponent
                , DocumentReviewDistributeComponenet
                , DocumentUpdateComponent
            ]
            , providers: [
                InjectorRef
                , BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canUpdateDocumentCategory'
                        , 'getUserId'
                        , 'isAdministrator'
                        , 'canDistributeAnyDocument'
                        , 'canFullAssignedToShown'
                    ])
                }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , DocumentCategoryService
                , EmployeeSearchService
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceMock', ['']) }
                , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
                , MessengerService
                , { provide: RouteParams, useValue: jasmine.createSpyObj('routeParamsMock', ['']) }
                , DocumentService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsListComponent);
        component = fixture.componentInstance;

        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        store = fixture.debugElement.injector.get(Store);
        routerMock = fixture.debugElement.injector.get(Router);
        documentDetailsServiceStub = fixture.debugElement.injector.get(DocumentDetailsService);

        let array: UrlSegment[] = [];
        array.push(new UrlSegment('general', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        (<ActivatedRouteStub>activatedRouteStub).testUrl = array;

        store.dispatch(new LoadAuthorizedDocumentCategoriesComplete(extractDocumentCategoryItems(MockStoreProviderUser.getDocumentCategories())));
        store.dispatch(new LoadSitesCompleteAction(MockStoreProviderCompany.getSitesMock().Entities));
        store.dispatch(new LoadCompanyDocumentsCompleteAction(MockStoreCompanyDocuments.getGeneralDataMock()));

        fixture.detectChanges();
    });

    beforeEach(() => {
        actions = component.actions;
        viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
        downloadAction = CommonTestHelper.getGivenButton(actions.toArray(), 'download');
        distributeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'distribute');
        removeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'remove');
    })

    it('should be created', () => {
        expect(component).toBeTruthy()
    });

    it('should have 3 filters and filter change should dispatch for API with proper data', () => {
        let filters = fixture.debugElement.queryAll(By.directive(AeSelectComponent));
        filterAssert(filters, 0, 'ALL_CATEGORIES', '', 'option', 3);
        filters = fixture.debugElement.queryAll(By.directive(AeAutocompleteComponent));
        filterAssert(filters, 0, 'ALL_DEPARTMENTS', '');
        filterAssert(filters, 1, 'ALL_EMPLOYEES', []);

        filterChangeAssert(fixture, store, DocumentsFolder.General);
    });

    it('should have columns Document name, category, version, employee name, upload date with actions: view, download, distribute and remove', fakeAsync(() => {
        let columns = fixture.debugElement.queryAll(By.css('.table__heading'));

        expect(columns.length).toEqual(6);

        columnsAssert(columns, 0, 'CITATIONDRAFTS.DOCUMENT_NAME', true, 'FileNameAndTitle');
        columnsAssert(columns, 1, 'CITATIONDRAFTS.CATEGORY', true, 'CategoryName');
        columnsAssert(columns, 2, 'CITATIONDRAFTS.VERSION', true, 'Version');
        columnsAssert(columns, 3, 'HANDBOOK.EMPLOYEE_NAME', true, 'EmployeeName');
        columnsAssert(columns, 4, 'CITATIONDRAFTS.UPLOAD_DATE', true, 'ModifiedOn');
        columnsAssert(columns, 5, 'Actions', false);

        actionsAssert(fixture, ['view', 'download', 'distribute', 'remove']);
        actionsAssert(fixture, ['view', 'download', 'remove'], 1);
        viewAssert(routerMock, viewAction, fixture);
        downloadAssert(downloadAction, fixture);
        let dispatchSpy = spyOn(documentDetailsServiceStub, 'dispatchDocumentDetails');
        distributeAssert(documentDetailsServiceStub, distributeAction, fixture, dispatchSpy);
        removeAssert(removeAction, fixture);
    }));

    it('It should have page change and sort options', (() => {
        let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
        let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
        let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
        expect(sortEvent).toBeDefined();
        expect(pageChangeEvent).toBeDefined();
    }));
});