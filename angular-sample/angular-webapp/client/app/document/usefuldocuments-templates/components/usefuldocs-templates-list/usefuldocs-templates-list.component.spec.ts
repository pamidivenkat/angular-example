import { addOrUpdateAtlasParamValue } from '../../../../root-module/common/extract-helpers';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NavigationExtras, Router } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { isNullOrUndefined } from 'util';
import { AeAutocompleteComponent } from '../../../../atlas-elements/ae-autocomplete/ae-autocomplete.component';
import { AeInputComponent } from '../../../../atlas-elements/ae-input/ae-input.component';
import { AeNavActionsComponent } from '../../../../atlas-elements/ae-nav-actions/ae-nav-actions.component';
import { AeSelectComponent } from '../../../../atlas-elements/ae-select/ae-select.component';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { AeAutoCompleteModel } from '../../../../atlas-elements/common/models/ae-autocomplete-model';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { LoadAdditionalServiceCompleteAction } from '../../../../shared/actions/lookup.actions';
import { RestClientService } from '../../../../shared/data/rest-client.service';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../../shared/models/atlas-api-response';
import * as fromRoot from '../../../../shared/reducers';
import { reducer } from '../../../../shared/reducers/index';
import { MessengerService } from '../../../../shared/services/messenger.service';
import { CommonTestHelper } from '../../../../shared/testing/helpers/common-test-helper';
import { DocumentDetailsServiceStub } from '../../../../shared/testing/mocks/document-details-service-stub';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { MockStoreProviderLookups } from '../../../../shared/testing/mocks/mock-store-provider-lookups';
import { MockStoreProviderUsefulDocs } from '../../../../shared/testing/mocks/mock-store-provider-useful-docs';
import { MockStoreProviderUser } from '../../../../shared/testing/mocks/mock-store-provider-user';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { DocumentDetailsType } from '../../../document-details/models/document-details-model';
import { DocumentDetailsService } from '../../../document-details/services/document-details.service';
import { LoadUsefulDocsListAction, LoadUsefulDocsListCompleteAction } from '../../actions/usefuldocs.actions';
import { sharedDocument } from '../../models/sharedDocument';
import { UsefuldocsTemplatesListComponent } from './usefuldocs-templates-list.component';


let filterAssert = function (filters, index: number, elementComponent, placeholder = null, tag = null, count = 0) {
    let filter = filters[index].query(By.directive(elementComponent));

    expect(filter).toBeTruthy();
    expect(filter.componentInstance.placeholder).toEqual(placeholder);

    if (!isNullOrUndefined(tag)) {
        let options = filter.queryAll(By.css(tag));
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
    let doc = new sharedDocument()
    doc.Id = '1234'
    viewAction.command.next(doc);
    fixture.detectChanges();
    expect(navigateSpy).toHaveBeenCalledWith(['document/shared-document-details/' + doc.Id], navigationExtras);
}

let downloadAssert = function (downloadAction, fixture) {
    let downloadSpy = spyOn(window, 'open');
    let doc = new sharedDocument()
    doc.Id = '1234'
    downloadAction.command.next(doc);

    fixture.detectChanges();
    expect(downloadSpy).toHaveBeenCalledWith('/filedownload?sharedDocumentId=' + doc.Id + '&?isShared=true');
}

let distributeAssert = function (documentDetailsServiceStub, distributeAction, fixture, distributeSpy: jasmine.Spy) {
    let doc = new sharedDocument()
    doc.Id = '1234'
    distributeAction.command.next(doc);

    fixture.detectChanges();
    expect(distributeSpy).toHaveBeenCalledWith(doc.Id, DocumentDetailsType.SharedDocument);
}


describe('Useful documents and templates list component', () => {
    let component: UsefuldocsTemplatesListComponent;
    let fixture: ComponentFixture<UsefuldocsTemplatesListComponent>;
    let store: Store<fromRoot.State>;
    let params: AtlasParams[] = new Array();
    let usefulDocApiRequestParams = new AtlasApiRequestWithParams(1, 10, 'Title', SortDirection.Ascending, params);
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
            ]
            , declarations: [
                UsefuldocsTemplatesListComponent
            ]
            , providers: [
                InjectorRef
                , BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', ['canDistributeAnySharedDocument']) }
                , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceMock', ['']) }
                , MessengerService
            ]
        }).compileComponents()
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(UsefuldocsTemplatesListComponent);
        component = fixture.componentInstance;

        store = fixture.debugElement.injector.get(Store);
        claimsHelperServiceMock = fixture.debugElement.injector.get(ClaimsHelperService);
        routerMock = fixture.debugElement.injector.get(Router);

        store.dispatch(new LoadAdditionalServiceCompleteAction(MockStoreProviderUsefulDocs.getServicesStub()));
        store.dispatch(new LoadUsefulDocsListAction(usefulDocApiRequestParams));

        component.additionalServiceList = MockStoreProviderUsefulDocs.getServicesStub().Entities;

        component.categoryList = MockStoreProviderUser.getSharedDocumentCategoriesStub().Entities;
        component.country = MockStoreProviderLookups.getCountryDataStub().Entities;

        fixture.detectChanges();
    });
    it('should be created', () => {
        expect(component).toBeTruthy();
    });
    it('should have 4 filters', fakeAsync(() => {
        let filters = fixture.debugElement.queryAll(By.css('.filter-bar__filter'));
        expect(filters.length).toEqual(4);

        tick(100);

        filterAssert(filters, 0, AeAutocompleteComponent, 'USEFULDOCS.ALL_SERVICE', 'li', 1);
        filterAssert(filters, 1, AeAutocompleteComponent, 'USEFULDOCS.ALL_CATEGORIES', 'li', 1);
        filterAssert(filters, 2, AeAutocompleteComponent, 'USEFULDOCS.SELECT_COUNTRY', 'li', 1);
        filterAssert(filters, 3, AeInputComponent, 'USEFULDOCS.TITLE_KEYWORD');

    }));

    it('should change the categories when service changes and api dispatch with new values', fakeAsync(() => {
        let dispatchSpy = spyOn(store, 'dispatch');
        let filters = fixture.debugElement.queryAll(By.directive(AeAutocompleteComponent));
        let service = MockStoreProviderUsefulDocs.getServicesStub().Entities[0];

        let item = new AeAutoCompleteModel(service.Title, service.Id, service);
        filters[0].componentInstance.value.push(item);
        filters[0].componentInstance.aeOnSelect.emit([item]);
        tick(100);
        fixture.detectChanges();
        expect(filters[1].componentInstance.items.length).toEqual(14);
        expect(dispatchSpy).toHaveBeenCalledWith(new LoadUsefulDocsListAction(usefulDocApiRequestParams));
    }));

    it('should dispatch with new values on change of category', fakeAsync(() => {
        let dispatchSpy = spyOn(store, 'dispatch');
        let filters = fixture.debugElement.queryAll(By.directive(AeAutocompleteComponent));
        let category = MockStoreProviderUser.getSharedDocumentCategoriesStub().Entities[0];
        let item = new AeAutoCompleteModel(category.Name, category.Id, category);
        component.usefulDocumentForm.get('category').setValue([item]);
        tick(100);
        fixture.detectChanges();
        usefulDocApiRequestParams.Params = addOrUpdateAtlasParamValue(usefulDocApiRequestParams.Params, 'category', item.Value);
        expect(dispatchSpy).toHaveBeenCalledWith(new LoadUsefulDocsListAction(usefulDocApiRequestParams));
    }));

    beforeEach(() => {
        actions = component.actions;
        viewAction = CommonTestHelper.getGivenButton(actions.toArray(), 'view');
        downloadAction = CommonTestHelper.getGivenButton(actions.toArray(), 'download');
        distributeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'distribute');
    });

    it('should have columns title, service, category, keywords with actions: view, download, distribute and remove', fakeAsync(() => {
        claimsHelperServiceMock.canDistributeAnySharedDocument.and.returnValue(true);
        store.dispatch(new LoadUsefulDocsListCompleteAction(MockStoreProviderUsefulDocs.getSharedDocumentsStub()));
        fixture.detectChanges();
        let columns = fixture.debugElement.queryAll(By.css('.table__heading'));

        expect(columns.length).toEqual(5);

        columnsAssert(columns, 0, 'USEFULDOCS.TITILE', true, 'Title');
        columnsAssert(columns, 1, 'USEFULDOCS.SERVICE_NAME', false);
        columnsAssert(columns, 2, 'USEFULDOCS.CATEGORY', false);
        columnsAssert(columns, 3, 'USEFULDOCS.KEYWORDS', true, 'Keywords');
        columnsAssert(columns, 4, 'Actions', false);

        actionsAssert(fixture, ['view', 'download', 'distribute']);
        viewAssert(routerMock, viewAction, fixture);
        downloadAssert(downloadAction, fixture);
        documentDetailsServiceStub = fixture.debugElement.injector.get(DocumentDetailsService);
        let dispatchSpy = spyOn(documentDetailsServiceStub, 'dispatchDocumentDetails');

        distributeAssert(documentDetailsServiceStub, distributeAction, fixture, dispatchSpy);

    }));
});