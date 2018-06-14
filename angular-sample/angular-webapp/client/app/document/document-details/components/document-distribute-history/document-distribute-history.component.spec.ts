import { By } from '@angular/platform-browser';
import { isNullOrUndefined } from 'util';
import { AeNavActionsComponent } from './../../../../atlas-elements/ae-nav-actions/ae-nav-actions.component';
import { Document } from './../../../models/Document';
import { AeSelectComponent } from './../../../../atlas-elements/ae-select/ae-select.component';
import { AtlasParams, AtlasApiRequestWithParams, AtlasApiResponse } from './../../../../shared/models/atlas-api-response';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';
import { LoadCompanyDocumentsAction } from './../../../company-documents/actions/company-documents.actions';
import { DocumentDistributeHistoryComponent } from './document-distribute-history.component';
import { ComponentFixture, async, TestBed, fakeAsync } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../../shared/reducers';
import { AtlasElementsModule } from './../../../../atlas-elements/atlas-elements.module';
import { reducer } from '../../../../shared/reducers';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { RouterMock } from './../../../../shared/testing/mocks/router-stub';
import { LocaleServiceStub } from './../../../../shared/testing/mocks/locale-service-stub';
import { ActivatedRouteStub } from './../../../../shared/testing/mocks/activated-route-stub';
import { RouteParams } from './../../../../shared/services/route-params';
import { RestClientService } from './../../../../shared/data/rest-client.service';
import { MessengerService } from './../../../../shared/services/messenger.service';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { DocumentDetailsService } from './../../services/document-details.service';
import { CommonTestHelper } from './../../../../shared/testing/helpers/common-test-helper';
import {
    LoadDocumentDetailsComplete
    , LoadDocumentChangeHistory
    , LoadDocumentChangeHistoryComplete,
    LoadDocumentDistributeHistoryList,
    LoadDocumentDistributeHistoryDelete,
    LoadDocumentDistributionHistoryComplete
} from './../../actions/document-details.actions';
import { MockStoreProviderUser } from './../../../../shared/testing/mocks/mock-store-provider-user';
import { MockStoreProviderFactory } from './../../../../shared/testing/mocks/mock-store-provider-factory';
import { ResponseOptions, Response } from '@angular/http';
import { extractDocumentDetails } from './../../common/document-details-extract-helper';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslationServiceStub } from './../../../../shared/testing/mocks/translation-service-stub';
import { DocumentDetailsServiceStub } from './../../../../shared/testing/mocks/document-details-service-stub';
import { ClaimsHelperServiceStub } from './../../../../shared/testing/mocks/claims-helper-service-mock';
import { ChangeHistoryModel, DistributedDocument, DistributionHistoryModel } from './../../models/document-details-model';
import { EventListener } from '@angular/core/src/debug/debug_node';
import * as Immutable from 'immutable';
import { DatePipe } from '@angular/common';
import { AeSelectEvent } from './../../../../atlas-elements/common/ae-select.event';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { dispatch } from 'd3';
import { DistributeDocumentCompleteAction } from './../../actions/document-distribute.actions';

let columnsAssert = function (columns, index: number, title: string, sortable: boolean, sortKay: string = null) {

    expect(columns[index].nativeElement.innerText.trim()).toEqual(title);
    if (sortable) {
        expect(columns[index].nativeElement.classList).toContain('table__heading--sortable');
        expect(columns[index].childNodes[1].nativeNode.attributes.getNamedItem('data-sortKey').value).toEqual(sortKay);
    } else {
        expect(columns[index].nativeElement.classList).not.toContain('table__heading--sortable');
    }

};

describe('Document Details - Distribution history tab', () => {
    let component: DocumentDistributeHistoryComponent;
    let fixture: ComponentFixture<DocumentDistributeHistoryComponent>;
    let activatedRouteStub;
    let store: Store<fromRoot.State>;
    let claimsHelperServiceMock;
    let routerMock;
    let actions;
    let viewAction;
    let downloadAction;
    let distributeAction;
    let documentDetailsServiceStub;
    let dispatchSpy: jasmine.Spy;
    let datePipe: any;
    let gridData: any;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                AtlasElementsModule
                , LocalizationModule
                , StoreModule.provideStore(reducer)
                , NoopAnimationsModule
            ]
            , declarations: [
                DocumentDistributeHistoryComponent
            ]
            , providers: [
                InjectorRef
                , DatePipe
                , BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceMock', ['']) }
                , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
                , MessengerService
                , { provide: RouteParams, useValue: jasmine.createSpyObj('routeParamsMock', ['']) }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DocumentDistributeHistoryComponent);
        component = fixture.componentInstance;

        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        store = fixture.debugElement.injector.get(Store);
        routerMock = fixture.debugElement.injector.get(Router);
        documentDetailsServiceStub = fixture.debugElement.injector.get(DocumentDetailsService);
        datePipe = fixture.debugElement.injector.get(DatePipe);

        let array: UrlSegment[] = [];
        array.push(new UrlSegment('distribute-history', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        (<ActivatedRouteStub>activatedRouteStub).testUrl = array;

        dispatchSpy = spyOn(store, 'dispatch');

        spyOn(documentDetailsServiceStub, 'getDistributionHistoryLoadStatus').and.callFake(() => {
            return store.let(fromRoot.getDistributionHistoryLoadStatus);
        });

        spyOn(documentDetailsServiceStub, 'loadDistributionHistoryList').and.callFake(() => {
            return store.let(fromRoot.getDocumentDistributionHistory);
        });

        spyOn(documentDetailsServiceStub, 'loadDistributionHistoryTotalCount').and.callFake(() => {
            return store.let(fromRoot.getDistributionHistoryListTotalCount);
        });

        spyOn(documentDetailsServiceStub, 'loadDistributionHistoryDataTableOptions').and.callFake(() => {
            return store.let(fromRoot.getDistributionHistoryListDataTableOptions);
        });

        spyOn(documentDetailsServiceStub, 'dispatchDistributionHistoryList').and.callFake((request) => {
            return store.dispatch(new LoadDocumentDistributeHistoryList(request));
        });

        spyOn(documentDetailsServiceStub, 'dispatchDeleteDistributedDoc').and.callFake((distributeDoc) => {
            store.dispatch(new LoadDocumentDistributeHistoryDelete(distributeDoc));
        });

        dispatchSpy.and.callThrough();
        gridData = MockStoreProviderFactory.getMockedDistributionHistory();
        store.dispatch(new LoadDocumentDistributionHistoryComplete(<AtlasApiResponse<DistributionHistoryModel>>gridData));
        fixture.detectChanges();
    });

    it('page must be loaded without any errors', () => {
        expect(component).toBeTruthy();
    });

    it('distribution history tab should have agreed layout according to the design system', () => {
        // should have container element with id "distributionHistory" and class "spacer"
        let container = fixture.debugElement.query(By.css('#distributionHistory'));
        expect(container).toBeDefined();
        expect((<HTMLElement>container.nativeElement).classList.contains('document-distribute-history')).toBeTruthy();

        let notificationSection = container.query(By.css('ae-notification'))
            .query(By.css('.notification-bar.spacer'))
            .query(By.css('.icon-with-text'))
            .query(By.css('.icon-with-text__copy'));
        expect(notificationSection).toBeDefined();
        expect((<HTMLElement>notificationSection.nativeElement).innerText.trim().toLowerCase())
            .toBe('DOC_DISTRIBUTION.DISTRIBUTION_HISTORY_NOTIFICATION_MESSAGE'.toLowerCase());
    });

    it('distribution history table should have columns DistributedTo, DocumentVersion,DistributedOn, RecallDistribution with Recall button', fakeAsync(() => {
        let columns = fixture.debugElement.queryAll(By.css('.table__heading'));

        expect(columns.length).toEqual(5);

        columnsAssert(columns, 0, 'DocumentDetails.DistributedTo', true, 'RegardingObjectEntiyType');
        columnsAssert(columns, 1, '', false);
        columnsAssert(columns, 2, 'DocumentDetails.DocumentVersion', true, 'DocumentVersion');
        columnsAssert(columns, 3, 'DocumentDetails.DistributedOn', true, 'ActionedDate');
        columnsAssert(columns, 4, 'DocumentDetails.RecallDistribution', false);
    }));

    it('distribution history table should have page change and sort options', (() => {
        let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
        let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
        let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
        expect(sortEvent).toBeDefined();
        expect(pageChangeEvent).toBeDefined();
    }));

    it('verify whether user is able to click on "Recall distribution" button', () => {
        let recallSpy = spyOn(component, 'removeDistributedDoc');
        let recallButton = fixture.debugElement.query(By.css('ae-datatable'))
            .query(By.css('.table__row--group'))
            .queryAll(By.css('.table__row'))[0]
            .queryAll(By.css('.table__item'))[4]
            .query(By.css('.table__item-inner'))
            .query(By.css('span'));
        expect(recallButton).toBeDefined();
        let iconElement: HTMLElement = recallButton.query(By.css('.icon')).nativeElement;
        expect(iconElement.getAttribute('title').trim().toLowerCase()).toBe('DocumentDetails.RecallDistribution'.toLowerCase());
        expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-alert-cancel');
        let recallBtn: HTMLElement = recallButton.nativeElement;
        recallBtn.click();
        fixture.detectChanges();
        let firstRecord = gridData[0];
        firstRecord.Column = 4;
        firstRecord.Row = 0;

        expect(recallSpy).toHaveBeenCalled();
        expect(recallSpy)
            .toHaveBeenCalledWith(firstRecord);
    });

    it('details in distribution history table must match with supplied data', () => {
        let firstDistDoc = <DistributionHistoryModel>Array.from(gridData)[0];
        let firstRow = fixture.debugElement.query(By.css('ae-datatable'))
            .query(By.css('.table__row--group'))
            .queryAll(By.css('.table__row'))[0];

        let firstCell: HTMLElement = firstRow.queryAll(By.css('.table__item'))[0].nativeElement;
        expect(firstCell.innerText.trim()).toBe(firstDistDoc.RegardingObjectEntiyType.trim());

        let secondCell: HTMLElement = firstRow.queryAll(By.css('.table__item'))[1].nativeElement;
        expect(secondCell.innerText.trim()).toBe(firstDistDoc.RegardingOjbectEntityValues.trim());

        let thirdCell: HTMLElement = firstRow.queryAll(By.css('.table__item'))[2].nativeElement;
        expect(thirdCell.innerText.trim()).toBe(firstDistDoc.DocumentVersion);

        let fourthCell: HTMLElement = firstRow.queryAll(By.css('.table__item'))[3].nativeElement;
        expect(fourthCell.innerText.trim()).toBe(datePipe.transform(firstDistDoc.ActionedDate, 'dd/MM/yyyy'));
    });

    it('when user clicks on "Recall distribution" button associated distributed document must be deleted', () => {
        dispatchSpy.calls.reset();
        let recallButton = fixture.debugElement.query(By.css('ae-datatable'))
            .query(By.css('.table__row--group'))
            .queryAll(By.css('.table__row'))[0]
            .queryAll(By.css('.table__item'))[4]
            .query(By.css('.table__item-inner'))
            .query(By.css('span'));
        let recallBtn: HTMLElement = recallButton.nativeElement;
        recallBtn.click();
        fixture.detectChanges();
        let firstRecord = gridData[0];
        firstRecord.Column = 4;
        firstRecord.Row = 0;

        expect(dispatchSpy).toHaveBeenCalledWith(new LoadDocumentDistributeHistoryDelete(firstRecord));
    });
});
