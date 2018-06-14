import { By } from '@angular/platform-browser';
import { isNullOrUndefined } from 'util';
import { AeNavActionsComponent } from './../../../../atlas-elements/ae-nav-actions/ae-nav-actions.component';
import { Document } from './../../../models/Document';
import { AeSelectComponent } from './../../../../atlas-elements/ae-select/ae-select.component';
import { AtlasParams, AtlasApiRequestWithParams, AtlasApiResponse } from './../../../../shared/models/atlas-api-response';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';
import { LoadCompanyDocumentsAction } from './../../../company-documents/actions/company-documents.actions';
import { DocumentChangeHistoryComponent } from './document-change-history.component';
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
    , LoadDocumentChangeHistoryComplete
} from './../../actions/document-details.actions';
import { MockStoreProviderUser } from './../../../../shared/testing/mocks/mock-store-provider-user';
import { MockStoreProviderFactory } from './../../../../shared/testing/mocks/mock-store-provider-factory';
import { ResponseOptions, Response } from '@angular/http';
import { extractDocumentDetails } from './../../common/document-details-extract-helper';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslationServiceStub } from './../../../../shared/testing/mocks/translation-service-stub';
import { DocumentDetailsServiceStub } from './../../../../shared/testing/mocks/document-details-service-stub';
import { ClaimsHelperServiceStub } from './../../../../shared/testing/mocks/claims-helper-service-mock';
import { ChangeHistoryModel } from './../../models/document-details-model';
import { EventListener } from '@angular/core/src/debug/debug_node';
import * as Immutable from 'immutable';
import { DatePipe } from '@angular/common';
import { AeSelectEvent } from './../../../../atlas-elements/common/ae-select.event';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { dispatch } from 'd3';
import { extractPagingInfo } from './../../../../report/common/extract-helper';


let filterAssert = function (fixture, directive, placeholder = null, tag = null, count = 0) {
    let filter = fixture.debugElement.query(By.directive(directive));
    expect(filter).toBeTruthy();

    expect(filter.componentInstance.value).toEqual(0);
    expect(filter.componentInstance.placeholder).toEqual(placeholder);

    if (!isNullOrUndefined(tag)) {
        let options = filter.queryAll(By.css(tag));
        expect(options.length).toEqual(count);
    }
};

let columnsAssert = function (columns, index: number, title: string, sortable: boolean, sortKay: string = null) {

    expect(columns[index].nativeElement.innerText.trim()).toEqual(title);
    if (sortable) {
        expect(columns[index].nativeElement.classList).toContain('table__heading--sortable');
        expect(columns[index].childNodes[1].nativeNode.attributes.getNamedItem('data-sortKey').value).toEqual(sortKay);
    } else {
        expect(columns[index].nativeElement.classList).not.toContain('table__heading--sortable');
    }

};

let actionsAssert = function (fixture, actionItems: Array<string>) {
    let rows = fixture.debugElement.queryAll(By.css('.table__row'));

    rows.map((row, index) => {
        expect(rows[0].query(By.directive(AeNavActionsComponent))).toBeTruthy();
    })

    let actionButton = <AeNavActionsComponent<any>>rows[0].query(By.directive(AeNavActionsComponent)).componentInstance;
    let event = new MouseEvent('click');
    actionButton._onClick(event);
    fixture.detectChanges();

    let nav = rows[0].query(By.css('.nav--actions'));
    let actions = nav.queryAll(By.css('li'));

    expect(actions.length).toEqual(actionItems.length);

    actions.map((action, index) => {
        expect(actions[index].nativeElement.innerText.toLowerCase().trim()).toEqual(actionItems[index]);
    });

};

describe('Document Details - Document change history tab', () => {
    let component: DocumentChangeHistoryComponent;
    let fixture: ComponentFixture<DocumentChangeHistoryComponent>;
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

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                AtlasElementsModule
                , LocalizationModule
                , StoreModule.provideStore(reducer)
                , NoopAnimationsModule
                , ReactiveFormsModule
            ]
            , declarations: [
                DocumentChangeHistoryComponent
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
                // , DocumentCategoryService
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceMock', ['']) }
                , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
                , MessengerService
                , { provide: RouteParams, useValue: jasmine.createSpyObj('routeParamsMock', ['']) }
                // , DocumentService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DocumentChangeHistoryComponent);
        component = fixture.componentInstance;

        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        store = fixture.debugElement.injector.get(Store);
        routerMock = fixture.debugElement.injector.get(Router);
        documentDetailsServiceStub = fixture.debugElement.injector.get(DocumentDetailsService);
        datePipe = fixture.debugElement.injector.get(DatePipe);

        let array: UrlSegment[] = [];
        array.push(new UrlSegment('change-history', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        (<ActivatedRouteStub>activatedRouteStub).testUrl = array;

        dispatchSpy = spyOn(store, 'dispatch');

        spyOn(documentDetailsServiceStub, 'loadDocumentDetails').and.callFake(() => {
            return store.let(fromRoot.getDocumentDetailsById);
        });

        spyOn(documentDetailsServiceStub, 'getDocumentChangeHistoryLoadStatus').and.callFake(() => {
            return store.let(fromRoot.getChangeHistoryLoadStatus);
        });

        spyOn(documentDetailsServiceStub, 'loadDocumentChangeHistoryList').and.callFake(() => {
            return store.let(fromRoot.getDocumentChangeHistory);
        });

        spyOn(documentDetailsServiceStub, 'loadChangeHistoryTotalCount').and.callFake(() => {
            return store.let(fromRoot.getDocumentChangeHistoryListTotalCount);
        });

        spyOn(documentDetailsServiceStub, 'loadChangeHistoryDataTableOptions').and.callFake(() => {
            return store.let(fromRoot.getDocumentChangeHistoryListDataTableOptions);
        });

        spyOn(documentDetailsServiceStub, 'dispatchDocumentChangeHistoryList').and.callFake((params) => {
            store.dispatch(new LoadDocumentChangeHistory(params));
        });
        // documentDetailsActions.LoadDocumentDetailsComplete(docDetails);
        dispatchSpy.and.callThrough();
        let data = MockStoreProviderFactory.getMockedDocumentDetails();
        let options = new ResponseOptions({ body: data });
        let res = new Response(options);
        let obj = extractDocumentDetails(res);

        store.dispatch(new LoadDocumentDetailsComplete(obj));
        let historyData = MockStoreProviderFactory.getMockedDocumentHistory();
        let historyRes = new Response(new ResponseOptions({ body: data }));
        store.dispatch(new LoadDocumentChangeHistoryComplete({ DocumentChangeHistory: <AtlasApiResponse<ChangeHistoryModel>>historyData.Entities, ChangeHistoryPagingInfo: extractPagingInfo(historyRes) }));

        fixture.detectChanges();

        actions = component.actions;
        viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
        downloadAction = CommonTestHelper.getGivenButton(actions.toArray(), 'download');
        distributeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'distribute');
    });

    it('page must be loaded without any errors', () => {
        expect(component).toBeTruthy();
    });

    it('document history tab should have agreed layout according to the design system', () => {
        // should have container element with id "documentChangeHistory" and class "spacer"
        let container = fixture.debugElement.query(By.css('#documentChangeHistory'));
        expect(container).toBeDefined();
        expect((<HTMLElement>container.nativeElement).classList.contains('spacer')).toBeTruthy();

        let filterSection = container.query(By.css('.table__filter-bar'));
        expect(filterSection).toBeDefined();
        let filterSubSection = filterSection.query(By.css('.filter-bar.holiday-filters'));
        expect(filterSubSection).toBeDefined();
        let filterLabelText = filterSubSection.query(By.css('.filter-bar__label.label'));
        expect(filterLabelText).toBeDefined();
        expect((<HTMLElement>filterLabelText.nativeElement).innerText.trim().toLowerCase()).toBe('Filter_by'.toLowerCase());

        filterAssert(fixture, AeSelectComponent, null, 'option', 3);
    });

    it('document history table should have columns Document version, changedon, changedby, comment, last change with download button', fakeAsync(() => {
        let columns = fixture.debugElement.queryAll(By.css('.table__heading'));

        expect(columns.length).toEqual(6);

        columnsAssert(columns, 0, 'DocumentDetails.Version', true, 'Version');
        columnsAssert(columns, 1, 'DocumentDetails.ChangedOn', true, 'CreatedOn');
        columnsAssert(columns, 2, 'DocumentDetails.ChangedBy', true, 'ChangedBy');
        columnsAssert(columns, 3, 'DocumentDetails.Comment', true, 'Comment');
        columnsAssert(columns, 4, 'DocumentDetails.LastChange', true, 'LastChange');
        columnsAssert(columns, 5, 'Actions', false);
    }));

    it('Document history table should have page change and sort options', (() => {
        let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
        let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
        let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
        expect(sortEvent).toBeDefined();
        expect(pageChangeEvent).toBeDefined();
    }));

    it('when user clicks on download button associated document must be downloaded', () => {
        let downloadSpy = spyOn(window, 'open');
        let downloadButton: HTMLElement = fixture.debugElement.query(By.css('ae-datatable'))
            .query(By.css('.table__row--group'))
            .queryAll(By.css('.table__row'))[0]
            .query(By.css('.table__item.table__action'))
            .query(By.css('ae-button'))
            .query(By.css('button'))
            .nativeElement;
        downloadButton.click();
        fixture.detectChanges();
        expect(downloadSpy)
            .toHaveBeenCalledWith('/filedownload?documentId=1759e131-5729-4eb4-855d-30922834c16a&?isSystem=false&version=1.0');
    });

    it('Details in document history table must match with supplied data', () => {
        let docHistory: Immutable.List<ChangeHistoryModel>;
        component.changeHistoryList$.subscribe((list) => {
            docHistory = list;
            let firstDoc = docHistory.toArray()[0];
            let firstRow = fixture.debugElement.query(By.css('ae-datatable'))
                .query(By.css('.table__row--group'))
                .queryAll(By.css('.table__row'))[0];

            let firstCell: HTMLElement = firstRow.queryAll(By.css('.table__item'))[0].nativeElement;
            expect(firstCell.innerText.trim()).toBe(firstDoc.Version);

            let secondCell: HTMLElement = firstRow.queryAll(By.css('.table__item'))[1].nativeElement;
            expect(secondCell.innerText.trim()).toBe(datePipe.transform(firstDoc.CreatedOn, 'dd/MM/yyyy, hh:mm'));

            let thirdCell: HTMLElement = firstRow.queryAll(By.css('.table__item'))[2].nativeElement;
            expect(thirdCell.innerText.trim()).toBe(firstDoc.ChangedBy);

            let fourthCell: HTMLElement = firstRow.queryAll(By.css('.table__item'))[3].nativeElement;
            expect(fourthCell.innerText.trim()).toBe(firstDoc.Comment);

            let fifthCell: HTMLElement = firstRow.queryAll(By.css('.table__item'))[4].nativeElement;
            expect(fifthCell.innerText.trim()).toBe(component.getEntityTemplate(firstDoc.LastChange));

            let actionCell: HTMLElement = firstRow.queryAll(By.css('.table__item'))[5]
                .query(By.css('.table__item-inner'))
                .query(By.css('ae-nav-actions'))
                .query(By.css('.grid-action'))
                .query(By.css('ae-button'))
                .query(By.css('button'))
                .query(By.css('.btn-text'))
                .nativeElement;
            expect(actionCell.innerText.trim().toLowerCase()).toBe('download');
        });
    });

    it('verify whether "change period all" dropdown populated based on current date', () => {
        let nowDate = new Date(2016, 10, 20, 15, 0, 0);
        jasmine.clock().mockDate(nowDate);

        dispatchSpy.and.callThrough();
        let data = MockStoreProviderFactory.getMockedDocumentDetails();
        let options = new ResponseOptions({ body: data });
        let res = new Response(options);
        let obj = extractDocumentDetails(res);
        obj.CreatedOn = new Date(2012, 8, 15, 15, 0, 0);
        store.dispatch(new LoadDocumentDetailsComplete(obj));
        fixture.detectChanges();
        filterAssert(fixture, AeSelectComponent, null, 'option', 6);
    });

    it('verify whether user is able to filter by "change period all" dropdown', () => {
        let yearChangeSpy = spyOn(component, 'onYearDropdownChange');

        let filter = fixture.debugElement.query(By.directive(AeSelectComponent));
        filter.componentInstance.value = 2016;
        let selectedItem = new AeSelectItem();
        selectedItem.Disabled = false;
        selectedItem.Text = '2016';
        selectedItem.Value = 2016;
        let aeSelectEvent = {
            Event: undefined,
            SelectedValue: '2016',
            SelectedItem: selectedItem
        };
        filter.componentInstance.onChange();
        expect(yearChangeSpy).toHaveBeenCalled();
        expect(yearChangeSpy).toHaveBeenCalledWith(aeSelectEvent);
    });

    it('verify whether document history is filtering when user filters on "change period all" dropdown', () => {
        dispatchSpy.calls.reset();
        let filter = fixture.debugElement.query(By.directive(AeSelectComponent));
        filter.componentInstance.value = '2016';
        filter.componentInstance.onChange();
        let params: AtlasParams[] = [];
        params.push(new AtlasParams('DocumentId', '1759e131-5729-4eb4-855d-30922834c16a'));
        params.push(new AtlasParams('Year', '2016'));

        let apiRequest: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'Version', SortDirection.Descending, params);
        expect(dispatchSpy).toHaveBeenCalledWith(new LoadDocumentChangeHistory(apiRequest));
    });
});
