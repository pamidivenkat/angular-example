import { By } from '@angular/platform-browser';
import { isNullOrUndefined } from 'util';
import { AeSelectComponent } from './../../../../atlas-elements/ae-select/ae-select.component';
import { AtlasParams, AtlasApiRequestWithParams, AtlasApiResponse } from './../../../../shared/models/atlas-api-response';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';
import { DocumentEmployeeActionstatusComponent } from './document-employee-actionstatus.component';
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
import {
    LoadEmployeeActionStatusForPagingSortingAction, LoadDocumentDetailsComplete, LoadDocumentEmployeeStatusComplete
} from './../../actions/document-details.actions';
import { MockStoreProviderUser } from './../../../../shared/testing/mocks/mock-store-provider-user';
import { ResponseOptions, Response } from '@angular/http';
import { extractDocumentDetails } from './../../common/document-details-extract-helper';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslationServiceStub } from './../../../../shared/testing/mocks/translation-service-stub';
import { DocumentDetailsServiceStub } from './../../../../shared/testing/mocks/document-details-service-stub';
import { ClaimsHelperServiceStub } from './../../../../shared/testing/mocks/claims-helper-service-mock';
import { EmployeeActionStatusModel } from './../../models/document-details-model';
import { EventListener } from '@angular/core/src/debug/debug_node';
import * as Immutable from 'immutable';
import { dispatch } from 'd3';
import { DocumentsMockStoreProviderFactory } from '../../../../shared/testing/mocks/documents-moc-store-provider-factory';
import { DatePipe } from '@angular/common';
import { addOrUpdateAtlasParamValue } from '../../../../root-module/common/extract-helpers';
import { DocumentSignatureViewComponent } from '../../../../document/document-shared/components/document-signature-view/document-signature-view.component';


let columnsAssert = function (columns, index: number, title: string, sortable: boolean, sortKay: string = null) {

    expect(columns[index].nativeElement.innerText.trim()).toEqual(title);
    if (sortable) {
        expect(columns[index].nativeElement.classList).toContain('table__heading--sortable');
        expect(columns[index].childNodes[1].nativeNode.attributes.getNamedItem('data-sortKey').value).toEqual(sortKay);
    } else {
        expect(columns[index].nativeElement.classList).not.toContain('table__heading--sortable');
    }
};


describe('Document Details - Employee action status tab', () => {
    let component: DocumentEmployeeActionstatusComponent;
    let fixture: ComponentFixture<DocumentEmployeeActionstatusComponent>;
    let activatedRouteStub;
    let store: Store<fromRoot.State>;
    let claimsHelperServiceMock;
    let routerMock;
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
                DocumentEmployeeActionstatusComponent
                , DocumentSignatureViewComponent
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
        fixture = TestBed.createComponent(DocumentEmployeeActionstatusComponent);
        component = fixture.componentInstance;

        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        store = fixture.debugElement.injector.get(Store);
        routerMock = fixture.debugElement.injector.get(Router);
        documentDetailsServiceStub = fixture.debugElement.injector.get(DocumentDetailsService);
        datePipe = fixture.debugElement.injector.get(DatePipe);

        component.id = "document-employee-actionstatus";
        component.name = "document-employee-actionstatus";

        let array: UrlSegment[] = [];
        array.push(new UrlSegment('employee-action-status', null));
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        (<ActivatedRouteStub>activatedRouteStub).testUrl = array;

        dispatchSpy = spyOn(store, 'dispatch');

        spyOn(documentDetailsServiceStub, 'loadEmployeeActionStatusList').and.callFake(() => {
            return store.let(fromRoot.getEmployeeActionStatus);
        });

        spyOn(documentDetailsServiceStub, 'getEmployeeActionStatusLoadStatus').and.callFake(() => {
            return store.let(fromRoot.getEmployeeStatusLoadStatus);
        });

        spyOn(documentDetailsServiceStub, 'loadEmployeeActionStatusTotalCount').and.callFake(() => {
            return store.let(fromRoot.getEmployeeStatusListTotalCount);
        });

        spyOn(documentDetailsServiceStub, 'loadEmployeeActionStatusDataTableOptions').and.callFake(() => {
            return store.let(fromRoot.getEmployeeStatusListDataTableOptions);
        });

        spyOn(documentDetailsServiceStub, 'dispatchEmployeeActionStatusPaging').and.callFake((params) => {
            store.dispatch(new LoadEmployeeActionStatusForPagingSortingAction(params));
        });

        dispatchSpy.and.callThrough();
        let data = DocumentsMockStoreProviderFactory.getDocumentDetails();
        let options = new ResponseOptions({ body: data });
        let res = new Response(options);
        let obj = extractDocumentDetails(res);

        store.dispatch(new LoadDocumentDetailsComplete(obj));
        let empActionStatusData = DocumentsMockStoreProviderFactory.getDocumentEmployeeActionStatusData();
        store.dispatch(new LoadDocumentEmployeeStatusComplete(<AtlasApiResponse<EmployeeActionStatusModel>>empActionStatusData));

        fixture.detectChanges();
    });

    it('Should launch employee action status component', () => {
        expect(component).toBeTruthy();
    });

    it('document employee action status tab should have agreed layout according to the design system', () => {
        let container = fixture.debugElement.query(By.css('.spacer'));
        expect(container).toBeDefined();

        let filterSection = container.query(By.css('.table__filter-bar'));
        expect(filterSection).toBeDefined();
        let filterSubSection = filterSection.query(By.css('.filter-bar'));
        expect(filterSubSection).toBeDefined();
        let filterLabelText = filterSubSection.query(By.css('.filter-bar__label.label'));
        expect(filterLabelText).toBeDefined();
        expect((<HTMLElement>filterLabelText.nativeElement).innerText.trim().toLowerCase()).toBe('Filter_by'.toLowerCase());
    });

    it('Should have 2 filters', (() => {
        let filters = fixture.debugElement.nativeElement.getElementsByClassName('filter-bar__filter');
        expect(filters.length).toEqual(2);
    }));

    it("Default 'All versions' should be selected in version filter", (() => {
        let aeInput = fixture.debugElement.query(By.css('#document-employee-actionstatus_AeSelect_1')).nativeElement;
        expect(aeInput.selectedValue).toBeUndefined();
    }));

    it("Verifying the options in version filter", (() => {
        let aeInput = fixture.debugElement.query(By.css('#document-employee-actionstatus_AeSelect_1')).nativeElement;
        expect(aeInput.options[0].text).toEqual("DocumentDetails.ALL_Version");
        expect(aeInput.options[1].text).toEqual("2.20");
        expect(aeInput.options[2].text).toEqual("1.00");
        expect(aeInput.options.length).toEqual(3);
    }));

    it("Default 'All Status' should be selected in status filter", (() => {
        let aeInput = fixture.debugElement.query(By.css('#document-employee-actionstatus_AeSelect_2')).nativeElement;
        expect(aeInput.selectedValue).toBeUndefined();
    }));

    it("Verifying the options in status filter", (() => {
        let aeInput = fixture.debugElement.query(By.css('#document-employee-actionstatus_AeSelect_2')).nativeElement;
        expect(aeInput.options[0].text).toEqual("DocumentDetails.ALL_STATUS");
        expect(aeInput.options[1].text).toEqual("Actioned");
        expect(aeInput.options[2].text).toEqual("To Be Actioned");
        expect(aeInput.options.length).toEqual(3);
    }));


    it('document employee action grid should have columns Name, Action taken, Acknowledgement date , Document version', fakeAsync(() => {
        let columns = fixture.debugElement.queryAll(By.css('.table__heading'));

        expect(columns.length).toEqual(4);
        columnsAssert(columns, 0, 'DocumentDetails.Name', true, 'EmployeeName');
        columnsAssert(columns, 1, 'DocumentDetails.ActionTaken', true, 'ActionTaken');
        columnsAssert(columns, 2, 'DocumentDetails.AcknowledgementDate', true, 'ActionedDate');
        columnsAssert(columns, 3, 'DocumentDetails.DocumentVersion', true, 'DocumentVersion');
    }));

    it('Document employee action status grid should have paging and sort options', (() => {
        let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
        let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
        let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
        expect(sortEvent).toBeDefined();
        expect(pageChangeEvent).toBeDefined();
    }));


    it('Details in document history table must match with supplied data', () => {
        let docHistory: Immutable.List<EmployeeActionStatusModel>;
        component.employeeActionStatusList$.subscribe((list) => {
            docHistory = list;
            let firstItem = docHistory.toArray()[0];
            let firstRow = fixture.debugElement.query(By.css('ae-datatable'))
                .query(By.css('.table__row--group'))
                .queryAll(By.css('.table__row'))[0];

            let firstCell: HTMLElement = firstRow.queryAll(By.css('.table__item span'))[0].nativeElement;
            expect(firstCell.innerText.trim()).toBe(firstItem.EmployeeName);

            let secondCell: HTMLElement = firstRow.queryAll(By.css('.table__item span'))[1].nativeElement;
            expect(secondCell.innerText.trim()).toBe(component.getActionStatus(firstItem.ActionTaken));

            let thirdCell: HTMLElement = firstRow.queryAll(By.css('.table__item span'))[2].nativeElement;
            let acknowledgementDate = datePipe.transform(firstItem.ActionedDate, 'dd/MM/yyyy');
            expect(thirdCell.innerText.trim()).toBe(acknowledgementDate ? acknowledgementDate : '');

            let fourthCell: HTMLElement = firstRow.queryAll(By.css('.table__item span'))[3].nativeElement;
            expect(fourthCell.innerText.trim()).toBe(firstItem.DocumentVersionInfo);

        });
    });

    it('Verifying whether user able to filter grid data by selecting version from filter', fakeAsync(() => {
        dispatchSpy.calls.reset();
        let currentRequest = component.actionApiRequest;
        let versionFilter = fixture.debugElement.query(By.css('#document-employee-actionstatus_AeSelect_1'));
        let typeOfControl = versionFilter instanceof HTMLSelectElement;
        expect(versionFilter.componentInstance.constructor.name).toEqual('AeSelectComponent');
        let objValue = { target: { value: '1.00' } };
        versionFilter.triggerEventHandler('change', objValue);
        fixture.detectChanges();
        currentRequest.Params = addOrUpdateAtlasParamValue(currentRequest.Params, 'DocumentVersionInfo', '1.00');
        let employeeActionStatusForPagingSortingAction: LoadEmployeeActionStatusForPagingSortingAction = (new LoadEmployeeActionStatusForPagingSortingAction(currentRequest));
        expect(dispatchSpy).toHaveBeenCalledWith(employeeActionStatusForPagingSortingAction);
    }));


    it('Verifying whether user able to filter grid data by selecting status from filter', fakeAsync(() => {
        dispatchSpy.calls.reset();
        let currentRequest = component.actionApiRequest;
        let versionFilter = fixture.debugElement.query(By.css('#document-employee-actionstatus_AeSelect_2'));
        expect(versionFilter.componentInstance.constructor.name).toEqual('AeSelectComponent');
        let objValue = { target: { value: '0' } };
        versionFilter.triggerEventHandler('change', objValue);
        fixture.detectChanges();
        currentRequest.Params = addOrUpdateAtlasParamValue(currentRequest.Params, 'Status', '0');
        let employeeActionStatusForPagingSortingAction: LoadEmployeeActionStatusForPagingSortingAction = (new LoadEmployeeActionStatusForPagingSortingAction(currentRequest));
        expect(dispatchSpy).toHaveBeenCalledWith(employeeActionStatusForPagingSortingAction);
    }));

    it('should open signature view modal when user clicks on actioned date of document who', () => {
        let signedDocumentRow = fixture.debugElement.query(By.css('ae-datatable'))
            .query(By.css('.table__row--group'))
            .queryAll(By.css('.table__row'))[5];
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
            .queryAll(By.css('.table__row'))[5];
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
