import { DistributedDocument } from '../../models/DistributedDocument';
import { DatePipe } from '@angular/common';
import { EventListener } from '@angular/core/src/debug/debug_node';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleDatePipe, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';

import { AeDatatableComponent } from '../../../atlas-elements/ae-datatable/ae-datatable.component';
import { AeSelectComponent } from '../../../atlas-elements/ae-select/ae-select.component';
import { AtlasElementsModule } from '../../../atlas-elements/atlas-elements.module';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import * as fromRoot from '../../../shared/reducers';
import { reducer } from '../../../shared/reducers/index';
import { RouteParams } from '../../../shared/services/route-params';
import { ActivatedRouteStub } from '../../../shared/testing/mocks/activated-route-stub';
import { BreadcrumbServiceStub } from '../../../shared/testing/mocks/breadcrumb-service-mock';
import { ClaimsHelperServiceStub } from '../../../shared/testing/mocks/claims-helper-service-mock';
import { LocaleServiceStub } from '../../../shared/testing/mocks/locale-service-stub';
import { MockStoreSharedDocuments } from '../../../shared/testing/mocks/mock-store-shared-documents';
import { RouteParamsMock } from '../../../shared/testing/mocks/route-params-mock';
import { RouterMock } from '../../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../../shared/testing/mocks/translation-service-stub';
import {
    LoadCompanyUsefulDocumentsToReview,
    LoadCompanyUsefulDocumentsToReviewComplete,
} from '../../actions/shared-documents.actions';
import { processDistributedSharedDocuments } from '../../common/document-extract-helper';
import {
    CompanyDocumentsDistributedComponent,
} from '../company-documents-distributed/company-documents-distributed.component';
import { DocumentActionConfirmComponent } from '../document-action-confirm/document-action-confirm.component';
import { UsefuldocumentsDistributedComponent } from './usefuldocuments-distributed.component';


xdescribe('Useful distributed documents component', () => {
    let component: UsefuldocumentsDistributedComponent;
    let fixture: ComponentFixture<UsefuldocumentsDistributedComponent>;
    let changeSpy: jasmine.Spy;
    let store: Store<fromRoot.State>;
    let preferredParams: AtlasParams[];
    let params;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule
                , LocalizationModule
                , AtlasElementsModule
                , StoreModule.provideStore(reducer)
                , BrowserAnimationsModule
            ]
            , declarations: [
                UsefuldocumentsDistributedComponent
                , CompanyDocumentsDistributedComponent
                , DocumentActionConfirmComponent
            ]
            , providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: Router, useClass: RouterMock }
                , LocaleDatePipe
                , { provide: RouteParams, useClass: RouteParamsMock }
                , DatePipe
            ]
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UsefuldocumentsDistributedComponent);
        component = fixture.componentInstance;
        store = fixture.debugElement.injector.get(Store);

        preferredParams = [new AtlasParams('DocumentAction', '1')];
        params = new AtlasApiRequestWithParams(1, 10, "DateSent", SortDirection.Descending, preferredParams);

        store.dispatch(new LoadCompanyUsefulDocumentsToReview(params));
        fixture.detectChanges();

    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should have a filter by status ', () => {
        let filter = fixture.debugElement.query(By.directive(AeSelectComponent));
        expect(filter).toBeTruthy();

        let options = filter.queryAll(By.css('option'));
        expect(options.length).toEqual(3);
    });

    it('default set to show documents with a status of "Awaiting Action"', () => {
        let filter = fixture.debugElement.query(By.directive(AeSelectComponent));
        expect(filter.componentInstance.value).toEqual('1');
    });

    it('It should have page change and sort options', (() => {
        let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
        let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
        let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
        expect(sortEvent).toBeDefined();
        expect(pageChangeEvent).toBeDefined();
    }));

    describe('Documents are listed in the Grid, with columns', () => {
        let downloadSpy: jasmine.Spy;

        beforeEach(() => {
            store.dispatch(new LoadCompanyUsefulDocumentsToReviewComplete(processDistributedSharedDocuments(MockStoreSharedDocuments.getUsefulDocs())));
            fixture.detectChanges();
        });

        it('should have a data grid', () => {
            let dataGrid = fixture.debugElement.query(By.directive(AeDatatableComponent));
            expect(dataGrid).toBeTruthy();
        });

        it('should have the four columns Title, Service, Category, Keywords, Status', () => {
            let columns = fixture.debugElement.queryAll(By.css('.table__heading'));
            expect(columns.length).toEqual(5);

            expect(columns[0].nativeElement.innerText.trim()).toEqual('USEFULDOCS.TITILE');
            expect(columns[0].nativeElement.classList).toContain('table__heading--sortable');
            expect(columns[0].childNodes[1].nativeNode.attributes.getNamedItem('data-sortKey').value).toEqual('Title');

            expect(columns[1].nativeElement.innerText.trim()).toEqual('DocumentDetails.Service');
            expect(columns[1].nativeElement.classList).not.toContain('table__heading--sortable');

            expect(columns[2].nativeElement.innerText.trim()).toEqual('USEFULDOCS.CATEGORY');
            expect(columns[2].nativeElement.classList).toContain('table__heading--sortable');
            expect(columns[2].childNodes[1].nativeNode.attributes.getNamedItem('data-sortKey').value).toEqual('CategoryId');


            expect(columns[3].nativeElement.innerText.trim()).toEqual('USEFULDOCS.KEYWORDS');
            expect(columns[3].nativeElement.classList).toContain('table__heading--sortable');
            expect(columns[3].childNodes[1].nativeNode.attributes.getNamedItem('data-sortKey').value).toEqual('KeyWords');

            expect(columns[4].nativeElement.innerText.trim()).toEqual('CITATIONDRAFTS.STATUS');
            expect(columns[4].nativeElement.classList).not.toContain('table__heading--sortable');
        });

        it('should have downloadable document, button action for document waiting for action', () => {
            let rows = fixture.debugElement.queryAll(By.css('.table__row'));
            expect(rows.length).toEqual(10);

            let columns = rows[2].queryAll(By.css('.table__item'));
            let iconButton = columns[4].query(By.css('.button'));
            expect(iconButton).toBeTruthy();
        });

        it('should have downloadable document, no action for document actioned', () => {
            let rows = fixture.debugElement.queryAll(By.css('.table__row'));

            let columns = rows[0].queryAll(By.css('.table__item'));
            let iconButton = columns[3].query(By.css('.button'));
            expect(iconButton).not.toBeTruthy();
        });

        it('should open a model popup when action button clicked', () => {
            let actionButtons = fixture.debugElement.queryAll(By.css('.icon.button'))
            expect(actionButtons[0].nativeElement.attributes.getNamedItem('title').value).toEqual('Require read');
            expect(actionButtons[1].nativeElement.attributes.getNamedItem('title').value).toEqual('Require sign');

            actionButtons[0].nativeElement.click(event);
            fixture.detectChanges();

            let actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
            expect(actionConfirm).toBeTruthy();
        });
    });
});

xdescribe('Action document-Require read', () => {
    let component: CompanyDocumentsDistributedComponent;
    let fixture: ComponentFixture<CompanyDocumentsDistributedComponent>;
    let claimsHelperServiceMock;
    let store: Store<fromRoot.State>;
    let changeSpy: jasmine.Spy;
    let params: AtlasApiRequestWithParams;
    let downloadSpy: jasmine.Spy;
    let documentToAction: DistributedDocument;
    let preferredParams: AtlasParams[];
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule
                , LocalizationModule
                , AtlasElementsModule
                , StoreModule.provideStore(reducer)
                , BrowserAnimationsModule
            ]
            , declarations: [
                CompanyDocumentsDistributedComponent
                , DocumentActionConfirmComponent
            ]
            , providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', ['']) }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: Router, useClass: RouterMock }
                , LocaleDatePipe
                , { provide: RouteParams, useClass: RouteParamsMock }
                , DatePipe
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsDistributedComponent);
        component = fixture.componentInstance;
        store = fixture.debugElement.injector.get(Store);

        preferredParams = [new AtlasParams('DocumentAction', '1')];
        params = new AtlasApiRequestWithParams(1, 10, "DateSent", SortDirection.Descending, preferredParams);
        store.dispatch(new LoadCompanyUsefulDocumentsToReview(params));
        fixture.detectChanges();
        changeSpy = spyOn(component, 'onDocumentActionChanged');
    })
    beforeEach(() => {
        let documentResp = processDistributedSharedDocuments(MockStoreSharedDocuments.getUsefulDocs());
        store.dispatch(new LoadCompanyUsefulDocumentsToReviewComplete(documentResp));
        documentToAction = documentResp.Entities[2];
        component.onDocumentAction(documentToAction);
        fixture.detectChanges();
        downloadSpy = spyOn(window, 'open');
    });

    it('click on the pencil icon (hover over of require read) then require read confirmation message will be displayed', () => {
        let actionButtons = fixture.debugElement.queryAll(By.css('.icon.button'))
        expect(actionButtons[0].nativeElement.attributes.getNamedItem('title').value).toEqual('Require read');
        actionButtons[0].nativeElement.click(event);
        fixture.detectChanges();
        let actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
        expect(actionConfirm).toBeTruthy();
    })

    it('click on the View button a copy will be downloaded', () => {
        let actionButtons = fixture.debugElement.queryAll(By.css('.icon.button'))
        expect(actionButtons[0].nativeElement.attributes.getNamedItem('title').value).toEqual('Require read');
        actionButtons[0].nativeElement.click();
        fixture.detectChanges();
        let actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
        expect(actionConfirm).toBeTruthy();
        let viewButton = actionConfirm.query(By.css('#confirmView_aeButton_1'));
        expect(viewButton).not.toBeUndefined();
        viewButton.nativeElement.click();
        fixture.detectChanges();
        let downloadUrl = '/filedownload?sharedDocumentId=' + documentToAction.SharedDocumentId;
        expect(downloadSpy).toHaveBeenCalledWith(downloadUrl);
    });

    it('click on the Discard button should close the require read confirmation message', () => {
        let actionButtons = fixture.debugElement.queryAll(By.css('.icon.button'))
        expect(actionButtons[0].nativeElement.attributes.getNamedItem('title').value).toEqual('Require read');
        actionButtons[0].nativeElement.click();
        fixture.detectChanges();
        let actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
        expect(actionConfirm).toBeTruthy();
        let discardButton = actionConfirm.query(By.css('#confirmNo_aeButton_1'));
        expect(discardButton).not.toBeUndefined();
        discardButton.nativeElement.click("discard");
        fixture.detectChanges();
        actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
        expect(actionConfirm).toBeNull();
    });
    it('click on the close icon should close the require read confirmation message', () => {
        let actionButtons = fixture.debugElement.queryAll(By.css('.icon.button'))
        expect(actionButtons[0].nativeElement.attributes.getNamedItem('title').value).toEqual('Require read');
        actionButtons[0].nativeElement.click();
        fixture.detectChanges();
        let actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
        expect(actionConfirm).toBeTruthy();
        let closeIcon = fixture.debugElement.query(By.css('.button--close'));
        expect(closeIcon).not.toBeUndefined();
        closeIcon.nativeElement.click("discard");
        fixture.detectChanges();
        actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
        expect(actionConfirm).toBeNull();
    });
});
xdescribe('Action document-Require sign', () => {
    let component: CompanyDocumentsDistributedComponent;
    let fixture: ComponentFixture<CompanyDocumentsDistributedComponent>;
    let claimsHelperServiceMock;
    let store: Store<fromRoot.State>;
    let changeSpy: jasmine.Spy;
    let downloadSpy: jasmine.Spy;
    let documentToAction: DistributedDocument;
    let preferredParams: AtlasParams[];
    let params;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule
                , LocalizationModule
                , AtlasElementsModule
                , StoreModule.provideStore(reducer)
                , BrowserAnimationsModule
            ]
            , declarations: [
                CompanyDocumentsDistributedComponent
                , DocumentActionConfirmComponent
            ]
            , providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', ['']) }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: Router, useClass: RouterMock }
                , LocaleDatePipe
                , { provide: RouteParams, useClass: RouteParamsMock }
                , DatePipe
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDocumentsDistributedComponent);
        component = fixture.componentInstance;
        store = fixture.debugElement.injector.get(Store);

        preferredParams = [new AtlasParams('DocumentAction', '1')];
        params = new AtlasApiRequestWithParams(1, 10, "DateSent", SortDirection.Descending, preferredParams);
        store.dispatch(new LoadCompanyUsefulDocumentsToReview(params));
        fixture.detectChanges();
        changeSpy = spyOn(component, 'onDocumentActionChanged');
    })
    beforeEach(() => {
        let documentResp = processDistributedSharedDocuments(MockStoreSharedDocuments.getUsefulDocs());
        store.dispatch(new LoadCompanyUsefulDocumentsToReviewComplete(documentResp));
        documentToAction = documentResp.Entities[3];
        component.onDocumentAction(documentToAction);
        fixture.detectChanges();
        downloadSpy = spyOn(window, 'open');
    });

    it('click on the pencil icon (hover over of require sign) then a signature confirmation message will be displayed', () => {
        let actionButtons = fixture.debugElement.queryAll(By.css('.icon.button'))
        expect(actionButtons[1].nativeElement.attributes.getNamedItem('title').value).toEqual('Require sign');
        actionButtons[1].nativeElement.click(event);
        fixture.detectChanges();
        let actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
        expect(actionConfirm).toBeTruthy();
    })

    it('click on the View button a copy will be downloaded', () => {
        let actionButtons = fixture.debugElement.queryAll(By.css('.icon.button'))
        expect(actionButtons[1].nativeElement.attributes.getNamedItem('title').value).toEqual('Require sign');
        actionButtons[1].nativeElement.click();
        fixture.detectChanges();
        let actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
        expect(actionConfirm).toBeTruthy();
        let viewButton = actionConfirm.query(By.css('#confirmView_aeButton_1'));
        expect(viewButton).not.toBeUndefined();
        viewButton.nativeElement.click();
        fixture.detectChanges();
        let downloadUrl = '/filedownload?sharedDocumentId=' + documentToAction.SharedDocumentId;
        expect(downloadSpy).toHaveBeenCalledWith(downloadUrl);
    });

    it('click on the Discard button should close the signature confirmation message', () => {
        let actionButtons = fixture.debugElement.queryAll(By.css('.icon.button'))
        expect(actionButtons[1].nativeElement.attributes.getNamedItem('title').value).toEqual('Require sign');
        actionButtons[1].nativeElement.click();
        fixture.detectChanges();
        let actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
        expect(actionConfirm).toBeTruthy();
        let discardButton = actionConfirm.query(By.css('#confirmNo_aeButton_1'));
        expect(discardButton).not.toBeUndefined();
        discardButton.nativeElement.click("discard");
        fixture.detectChanges();
        actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
        expect(actionConfirm).toBeNull();
    });
    it('click on the close icon should close the signature confirmation message', () => {
        let actionButtons = fixture.debugElement.queryAll(By.css('.icon.button'))
        expect(actionButtons[1].nativeElement.attributes.getNamedItem('title').value).toEqual('Require sign');
        actionButtons[1].nativeElement.click();
        fixture.detectChanges();
        let actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
        expect(actionConfirm).toBeTruthy();
        let closeIcon = fixture.debugElement.query(By.css('.button--close'));
        expect(closeIcon).not.toBeUndefined();
        closeIcon.nativeElement.click("discard");
        fixture.detectChanges();
        actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
        expect(actionConfirm).toBeNull();
    });
});