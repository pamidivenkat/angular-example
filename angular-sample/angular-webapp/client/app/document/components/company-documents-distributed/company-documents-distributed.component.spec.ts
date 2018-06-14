import { processDistributedDocuments } from '../../common/document-extract-helper';
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

import { AeAnchorComponent } from '../../../atlas-elements/ae-anchor/ae-anchor.component';
import { AeDatatableComponent } from '../../../atlas-elements/ae-datatable/ae-datatable.component';
import { AeSelectComponent } from '../../../atlas-elements/ae-select/ae-select.component';
import { AtlasElementsModule } from '../../../atlas-elements/atlas-elements.module';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';
import * as fromRoot from '../../../shared/reducers';
import { reducer } from '../../../shared/reducers/index';
import { RouteParams } from '../../../shared/services/route-params';
import { ActivatedRouteStub } from '../../../shared/testing/mocks/activated-route-stub';
import { BreadcrumbServiceStub } from '../../../shared/testing/mocks/breadcrumb-service-mock';
import { LocaleServiceStub } from '../../../shared/testing/mocks/locale-service-stub';
import { MockStoreSharedDocuments } from '../../../shared/testing/mocks/mock-store-shared-documents';
import { RouteParamsMock } from '../../../shared/testing/mocks/route-params-mock';
import { RouterMock } from '../../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../../shared/testing/mocks/translation-service-stub';
import { LoadCompanyDocumentsToReview, LoadCompanyDocumentsToReviewComplete } from '../../actions/shared-documents.actions';
import { DocumentActionConfirmComponent } from '../document-action-confirm/document-action-confirm.component';
import { CompanyDocumentsDistributedComponent } from './company-documents-distributed.component';
import { DocumentSignatureViewComponent } from '../../document-shared/components/document-signature-view/document-signature-view.component';
import { DocumentSharedModule } from '../../document-shared/document-shared.module';
import * as Immutable from 'immutable';

describe('Company distributed documents', () => {
    let component: CompanyDocumentsDistributedComponent;
    let fixture: ComponentFixture<CompanyDocumentsDistributedComponent>;
    let claimsHelperServiceMock;
    let store: Store<fromRoot.State>;
    let changeSpy: jasmine.Spy;
    let params: AtlasApiRequestWithParams;
    let datePipe: any;

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
                , DocumentSignatureViewComponent
            ]
            , providers: [
                InjectorRef
                , DatePipe
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
        params = new AtlasApiRequestWithParams(1, 10, "DateSent", SortDirection.Descending, component.preferredParams);
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
        store.dispatch(new LoadCompanyDocumentsToReview(params));
        changeSpy = spyOn(component, 'onDocumentActionChanged');

        fixture.detectChanges();
    })

    it('should be created', () => {
        expect(component).toBeTruthy(); 
    });

    it('should have a filter by status ', () => {
        let filter = fixture.debugElement.query(By.directive(AeSelectComponent));
        expect(filter).toBeTruthy();
        let options = filter.queryAll(By.css('option'));
        expect(options[0].nativeElement.innerText.trim()).toEqual('ALL');
        expect(options[1].nativeElement.innerText.trim()).toEqual('Awaiting Action');
        expect(options[2].nativeElement.innerText.trim()).toEqual('Actioned');
        expect(options.length).toEqual(3);
    });

    it('default set to show documents with a status of "Awaiting Action"', () => {
        let filter = fixture.debugElement.query(By.directive(AeSelectComponent));
        expect(filter.componentInstance.value).toEqual('1');

        filter.componentInstance.onChange();
        expect(changeSpy).toHaveBeenCalled();
    })

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
            store.dispatch(new LoadCompanyDocumentsToReviewComplete(MockStoreSharedDocuments.getCompanyDistributedDocs()));
            datePipe = fixture.debugElement.injector.get(DatePipe);
            fixture.detectChanges();
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
            downloadSpy = spyOn(component, 'onDocumentDownLoad');
        });

        it('should have a data grid', () => {
            let dataGrid = fixture.debugElement.query(By.directive(AeDatatableComponent));
            expect(dataGrid).toBeTruthy();
            let gridData = MockStoreSharedDocuments.getCompanyDistributedDocs();
            let firstDistDoc = <DistributedDocument>Array.from(gridData.Entities)[0];
            let firstRow = fixture.debugElement.query(By.css('ae-datatable'))
                .query(By.css('.table__row--group'))
                .queryAll(By.css('.table__row'))[0];

            let firstCell: HTMLElement = firstRow.queryAll(By.css('.table__item'))[0].nativeElement;
            let secondCell: HTMLElement = firstRow.queryAll(By.css('.table__item'))[1].nativeElement;
            let thirdCell: HTMLElement = firstRow.queryAll(By.css('.table__item'))[2].nativeElement;

            expect(firstCell.innerText.trim()).toBe(firstDistDoc.DocumentName.trim());
            expect(secondCell.innerText.trim()).toBe(datePipe.transform(firstDistDoc.DateSent, 'dd/MM/yyyy'));
            expect(thirdCell.innerText.trim()).toBe('');
        });

        it('should have the four columns Title, Date sent, Actioned date, Status', () => {
            let columns = fixture.debugElement.queryAll(By.css('.table__heading'));
            expect(columns.length).toEqual(4);

            expect(columns[0].nativeElement.innerText.trim()).toEqual('USEFULDOCS.TITILE');
            expect(columns[0].nativeElement.classList).toContain('table__heading--sortable');
            expect(columns[0].childNodes[1].nativeNode.attributes.getNamedItem('data-sortKey').value).toEqual('DocumentName');

            expect(columns[1].nativeElement.innerText.trim()).toEqual('USEFULDOCS.DATE_SENT');
            expect(columns[1].nativeElement.classList).toContain('table__heading--sortable');
            expect(columns[1].childNodes[1].nativeNode.attributes.getNamedItem('data-sortKey').value).toEqual('DateSent');

            expect(columns[2].nativeElement.innerText.trim()).toEqual('USEFULDOCS.ACTIONED_DATE');
            expect(columns[2].nativeElement.classList).toContain('table__heading--sortable');
            expect(columns[2].childNodes[1].nativeNode.attributes.getNamedItem('data-sortKey').value).toEqual('ActionedDateOn');

            expect(columns[3].nativeElement.innerText.trim()).toEqual('CITATIONDRAFTS.STATUS');
            expect(columns[3].nativeElement.classList).not.toContain('table__heading--sortable');
        });

        it('should have downloadable document, button action for document waiting for action', () => {

            let rows = fixture.debugElement.queryAll(By.css('.table__row'));

            expect(rows.length).toEqual(10);

            let file = rows[0].query(By.directive(AeAnchorComponent)).componentInstance;
            let event = new MouseEvent('click');
            file.onClick(event);

            expect(downloadSpy).toHaveBeenCalled();

            let columns = rows[0].queryAll(By.css('.table__item'));
            let iconButton = columns[3].query(By.css('.button'));
            expect(iconButton).toBeTruthy();
        });

        it('should have downloadable document, no action for document actioned', () => {

            let rows = fixture.debugElement.queryAll(By.css('.table__row'));

            expect(rows.length).toEqual(10);

            let file = rows[9].query(By.directive(AeAnchorComponent)).componentInstance;
            let event = new MouseEvent('click');
            file.onClick(event);

            expect(downloadSpy).toHaveBeenCalled();

            let columns = rows[9].queryAll(By.css('.table__item'));
            expect(columns[2].nativeElement.innerText).not.toEqual('');
            let iconButton = columns[3].query(By.css('.button'));
            expect(iconButton).not.toBeTruthy();
        });

    it('verifying data distributed documents table must match with supplied data', () => {
        let distributedDocuments: Immutable.List<DistributedDocument>;
        component.disributedDocuments$.subscribe((list) => {
            distributedDocuments = list;
            let firstDoc = distributedDocuments.toArray()[9];
            let firstRow = fixture.debugElement.query(By.css('ae-datatable'))
                .query(By.css('.table__row--group'))
                .queryAll(By.css('.table__row'))[9];

            let firstCell: HTMLElement = firstRow.queryAll(By.css('.table__item a'))[0].nativeElement;
            expect(firstCell.innerText.trim()).toBe(firstDoc.DocumentName);

            let secondCell: HTMLElement = firstRow.queryAll(By.css('.table__item span'))[0].nativeElement;
            let dateSent = datePipe.transform(firstDoc.DateSent, 'dd/MM/yyyy');
            expect(secondCell.innerText.trim()).toBe(dateSent ? dateSent : '');

            let thirdCell: HTMLElement = firstRow.queryAll(By.css('.table__item span'))[1].nativeElement;
            let actionedDate = datePipe.transform(firstDoc.ActionedDateOn, 'dd/MM/yyyy');
            expect(thirdCell.innerText.trim()).toBe(actionedDate ? actionedDate : '');
        });
    });
});
});

describe('Filter change', () => {
    let component: CompanyDocumentsDistributedComponent;
    let fixture: ComponentFixture<CompanyDocumentsDistributedComponent>;
    let store: Store<fromRoot.State>;
    let dispatchSpy: jasmine.Spy;
    let params: AtlasApiRequestWithParams;

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
                , DocumentSignatureViewComponent
            ]
            , providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', ['getUserFullName']) }
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
        dispatchSpy = spyOn(store, 'dispatch');
        params = new AtlasApiRequestWithParams(1, 10, "DateSent", SortDirection.Descending, component.preferredParams);
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
        fixture.detectChanges();
    })

    it('should dispatch api request with changed value', () => {
        let filter = fixture.debugElement.query(By.directive(AeSelectComponent));
        expect(filter).toBeTruthy();
        filter.componentInstance.onChange();
        store.dispatch(new LoadCompanyDocumentsToReviewComplete(MockStoreSharedDocuments.getFilteredDistributedDocs()));
        fixture.detectChanges();
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
        expect(dispatchSpy).toHaveBeenCalledWith(new LoadCompanyDocumentsToReview(params));

    });

});

describe('Action document-Require sign', () => {
    let component: CompanyDocumentsDistributedComponent;
    let fixture: ComponentFixture<CompanyDocumentsDistributedComponent>;
    let claimsHelperServiceMock;
    let store: Store<fromRoot.State>;
    let changeSpy: jasmine.Spy;
    let params: AtlasApiRequestWithParams;
    let downloadSpy: jasmine.Spy;
    let documentToAction: DistributedDocument;
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
                , DocumentSignatureViewComponent
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
        params = new AtlasApiRequestWithParams(1, 10, "DateSent", SortDirection.Descending, component.preferredParams);
        store.dispatch(new LoadCompanyDocumentsToReview(params));
        changeSpy = spyOn(component, 'onDocumentActionChanged');
        fixture.detectChanges();
    })
    beforeEach(() => {
        let documentResp = processDistributedDocuments(MockStoreSharedDocuments.getCompanyDistributedDocs());
        store.dispatch(new LoadCompanyDocumentsToReviewComplete(documentResp));
        documentToAction = documentResp.Entities[8];
        component.onDocumentAction(documentToAction);
        fixture.detectChanges();
        downloadSpy = spyOn(window, 'open');
    });

    it('click on the pencil icon (hover over of require sign) then a signature confirmation message will be displayed', () => {
        let actionButtons = fixture.debugElement.queryAll(By.css('.icon.button'))
        expect(actionButtons[8].nativeElement.attributes.getNamedItem('title').value).toEqual('Require sign');
        actionButtons[8].nativeElement.click(event);
        fixture.detectChanges();
        let actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
        expect(actionConfirm).toBeTruthy();
    })

    it('click on the View button a copy will be downloaded', () => {
        let actionButtons = fixture.debugElement.queryAll(By.css('.icon.button'))
        expect(actionButtons[8].nativeElement.attributes.getNamedItem('title').value).toEqual('Require sign');
        actionButtons[8].nativeElement.click();
        fixture.detectChanges();
        let actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
        expect(actionConfirm).toBeTruthy();
        let viewButton = actionConfirm.query(By.css('#confirmView_aeButton_1'));
        expect(viewButton).not.toBeUndefined();
        viewButton.nativeElement.click();
        fixture.detectChanges();
        let downloadUrl = '/filedownload?documentId=' + documentToAction.Id + '&isSystem=false&version=' + documentToAction.DocumentVersion;
        expect(downloadSpy).toHaveBeenCalledWith(downloadUrl);
    });

    it('click on the Discard button should close the signature confirmation message', () => {
        let actionButtons = fixture.debugElement.queryAll(By.css('.icon.button'))
        expect(actionButtons[8].nativeElement.attributes.getNamedItem('title').value).toEqual('Require sign');
        actionButtons[8].nativeElement.click();
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
        expect(actionButtons[8].nativeElement.attributes.getNamedItem('title').value).toEqual('Require sign');
        actionButtons[8].nativeElement.click();
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


describe('Action document-Require read', () => {
    let component: CompanyDocumentsDistributedComponent;
    let fixture: ComponentFixture<CompanyDocumentsDistributedComponent>;
    let claimsHelperServiceMock;
    let store: Store<fromRoot.State>;
    let changeSpy: jasmine.Spy;
    let params: AtlasApiRequestWithParams;
    let downloadSpy: jasmine.Spy;
    let documentToAction: DistributedDocument;
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
                , DocumentSignatureViewComponent
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
        params = new AtlasApiRequestWithParams(1, 10, "DateSent", SortDirection.Descending, component.preferredParams);
        store.dispatch(new LoadCompanyDocumentsToReview(params));
        changeSpy = spyOn(component, 'onDocumentActionChanged');
        fixture.detectChanges();
    })
    beforeEach(() => {
        let documentResp = processDistributedDocuments(MockStoreSharedDocuments.getCompanyDistributedDocs());
        store.dispatch(new LoadCompanyDocumentsToReviewComplete(documentResp));
        documentToAction = documentResp.Entities[1];
        component.onDocumentAction(documentToAction);
        fixture.detectChanges();
        downloadSpy = spyOn(window, 'open');
    });

    it('click on the pencil icon (hover over of require read) then require read confirmation message will be displayed', () => {
        let actionButtons = fixture.debugElement.queryAll(By.css('.icon.button'))
        expect(actionButtons[1].nativeElement.attributes.getNamedItem('title').value).toEqual('Require read');
        actionButtons[1].nativeElement.click(event);
        fixture.detectChanges();
        let actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
        expect(actionConfirm).toBeTruthy();
    })

    it('click on the View button a copy will be downloaded', () => {
        let actionButtons = fixture.debugElement.queryAll(By.css('.icon.button'))
        expect(actionButtons[1].nativeElement.attributes.getNamedItem('title').value).toEqual('Require read');
        actionButtons[1].nativeElement.click();
        fixture.detectChanges();
        let actionConfirm = fixture.debugElement.query(By.directive(DocumentActionConfirmComponent));
        expect(actionConfirm).toBeTruthy();
        let viewButton = actionConfirm.query(By.css('#confirmView_aeButton_1'));
        expect(viewButton).not.toBeUndefined();
        viewButton.nativeElement.click();
        fixture.detectChanges();
        let downloadUrl = '/filedownload?documentId=' + documentToAction.Id + '&isSystem=false&version=' + documentToAction.DocumentVersion;
        expect(downloadSpy).toHaveBeenCalledWith(downloadUrl);
    });

    it('click on the Discard button should close the require read confirmation message', () => {
        let actionButtons = fixture.debugElement.queryAll(By.css('.icon.button'))
        expect(actionButtons[1].nativeElement.attributes.getNamedItem('title').value).toEqual('Require read');
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
    it('click on the close icon should close the require read confirmation message', () => {
        let actionButtons = fixture.debugElement.queryAll(By.css('.icon.button'))
        expect(actionButtons[1].nativeElement.attributes.getNamedItem('title').value).toEqual('Require read');
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

describe('View signature', () => {
    let component: CompanyDocumentsDistributedComponent;
    let fixture: ComponentFixture<CompanyDocumentsDistributedComponent>;
    let store: Store<fromRoot.State>;
    let dispatchSpy: jasmine.Spy;
    let params: AtlasApiRequestWithParams;

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
                , DocumentSignatureViewComponent
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
        dispatchSpy = spyOn(store, 'dispatch');
        dispatchSpy.and.callThrough();
        fixture.detectChanges();
        store.dispatch(new LoadCompanyDocumentsToReviewComplete(MockStoreSharedDocuments.getFilteredDistributedDocs()));
        fixture.detectChanges();
    })
    it('should open signature view modal when user clicks on actioned date of document who', () => {
        let signedDocumentRow = fixture.debugElement.query(By.css('ae-datatable'))
            .query(By.css('.table__row--group'))
            .queryAll(By.css('.table__row'))[8];
        let thirdCell: HTMLElement = signedDocumentRow.queryAll(By.css('.table__item label'))[0].nativeElement;
        thirdCell.click();
        fixture.detectChanges();
        expect(component.showSignatureDialog).toBeTruthy();
        let signatureView = fixture.debugElement.query(By.directive(DocumentSignatureViewComponent));
        expect(signatureView).toBeTruthy();
    });

    it('click on the close icon should close the signature view modal', () => {
        let signedDocumentRow = fixture.debugElement.query(By.css('ae-datatable'))
            .query(By.css('.table__row--group'))
            .queryAll(By.css('.table__row'))[8];
        let thirdCell: HTMLElement = signedDocumentRow.queryAll(By.css('.table__item label'))[0].nativeElement;
        thirdCell.click();
        fixture.detectChanges();
        let closeIcon = fixture.debugElement.query(By.css('.button--close'));
        expect(closeIcon).not.toBeUndefined();
        closeIcon.nativeElement.click("discard");
        fixture.detectChanges();
        let signatureView = fixture.debugElement.query(By.directive(DocumentSignatureViewComponent));
        expect(signatureView).toBeNull();
        expect(component.showSignatureDialog).toBeFalsy();

    });

});
