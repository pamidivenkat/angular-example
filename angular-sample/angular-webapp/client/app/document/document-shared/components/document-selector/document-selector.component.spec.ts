import { isNullOrUndefined } from 'util';
import { AePageChangeEventModel } from './../../../../atlas-elements/common/Models/ae-page-change-event-model';
import { AeSortModel } from './../../../../atlas-elements/common/models/ae-sort-model';
import { AeAutocompleteComponent } from './../../../../atlas-elements/ae-autocomplete/ae-autocomplete.component';
import { addOrUpdateAtlasParamValue } from '../../../../root-module/common/extract-helpers';
import { DebugElement } from '@angular/core';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams, AtlasApiResponse } from './../../../../shared/models/atlas-api-response';
import { LoadCompanyDocumentsAction, LoadCompanyDocumentsCompleteAction } from './../../../company-documents/actions/company-documents.actions';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { MockStoreProviderFactory } from './../../../../shared/testing/mocks/mock-store-provider-factory';
import { LoadSitesAction, LoadSitesCompleteAction } from './../../../../shared/actions/company.actions';
import { LoadAuthorizedDocumentCategoriesComplete, LoadAuthorizedDocumentCategories } from './../../../../shared/actions/user.actions';
import { RouterModule } from '@angular/router';
import { BreadcrumbServiceStub } from './../../../../shared/testing/mocks/breadcrumb-service-mock';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { DocumentCategoryService } from './../../../services/document-category-service';
import { LocalizationConfigStub } from './../../../../shared/testing/mocks/localization-config-stub';
import { TranslationServiceStub } from './../../../../shared/testing/mocks/translation-service-stub';
import { LocaleServiceStub } from './../../../../shared/testing/mocks/locale-service-stub';
import { LocalizationConfig } from './../../../../shared/localization-config';
import { CkEditorModule } from './../../../../atlas-elements/ck-editor/ck-editor.module';
import { DocumentUpdateComponent } from './../document-update/document-update.component';
import { DocumentExporttocqcComponent } from './../document-export-to-cqc/document-export-to-cqc.component';
import { BlockCheckedPipe } from './../../../common/block-checked.pipe';
import { DocumentReviewDistributeComponenet } from './../document-review-distribute/document-review-distribute.component';
import { DocumentContentReviewComponent } from './../document-content-review/document-content-review.component';
import { ContractDistributeActionComponent } from './../contract-distribute-action/contract-distribute-action.component';
import { DocumentUploadComponent } from './../document-upload/document-upload.component';
import { reducer } from '../../../../shared/reducers/index';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AtlasSharedModule } from './../../../../shared/atlas-shared.module';
import { LocalizationModule, LocaleService, TranslationService, InjectorRef } from 'angular-l10n';
import { AtlasElementsModule } from './../../../../atlas-elements/atlas-elements.module';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DocumentSelectorComponent } from './document-selector.component';
import { Action, ActionReducer, StoreModule, Store } from '@ngrx/store';
import { By } from '@angular/platform-browser';
import * as fromRoot from '../../../../shared/reducers';
import * as Immutable from 'immutable';
import { mapCategoryDataToAeSelectItems } from './../../../../document/common/document-extract-helper';
import { DocumentCategory } from './../../../../document/models/document-category';
import { DocumentCategoryEnum } from './../../../../document/models/document-category-enum';
import { Document } from './../../../../document/models/document';
import { CommonTestHelper } from './../../../../shared/testing/helpers/common-test-helper';
import { EventListener } from '@angular/core/src/debug/debug_node';
import { DocumentSignatureViewComponent } from '../document-signature-view/document-signature-view.component';

let store: Store<fromRoot.State>;

describe('Document Selector Component', () => {
  let component: DocumentSelectorComponent;
  let fixture: ComponentFixture<DocumentSelectorComponent>;
  let filterFormGroup: FormGroup;
  let dispatchSpy: jasmine.Spy;
  let subscribedDocumentCategories: DocumentCategory[];
  let subscribedSites: AeSelectItem<string>[];
  let subscribedCategories: Immutable.List<AeSelectItem<string>>;
  let documentCategorySer: DocumentCategoryService;
  let mockedImmutableSitesData: AeSelectItem<string>[];
  let documentsApiRes: AtlasApiResponse<Document>;
  let columnDivArray: DebugElement[];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        RouterModule.forChild([]),
        LocalizationModule,
        AtlasSharedModule
        , NoopAnimationsModule
        , CkEditorModule
        , StoreModule.provideStore(reducer)
      ],
      declarations: [
        DocumentUploadComponent
        , ContractDistributeActionComponent
        , DocumentContentReviewComponent
        , DocumentSelectorComponent
        , DocumentReviewDistributeComponenet
        , BlockCheckedPipe
        , DocumentExporttocqcComponent
        , DocumentUpdateComponent
        , DocumentSignatureViewComponent
      ],
      providers: [
        InjectorRef
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , DocumentCategoryService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentSelectorComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);
    documentCategorySer = fixture.debugElement.injector.get(DocumentCategoryService);
    component.id = 'documentSelector';
    component.name = 'documentSelector';
    dispatchSpy = spyOn(store, 'dispatch');
    fixture.detectChanges();
    filterFormGroup = component.documentSelectorForm;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Document selector should have following filters and fields in the grid', () => {
    beforeEach(() => {

    })
    it('Should have a valid title', () => {
      let div = fixture.debugElement.query(By.css('.so-panel__title'));
      let h3 = div.query(By.css('.grey-strip')).nativeElement;
      expect(h3.innerHTML).toEqual('ADD_DOCUMENTS');
    });

    it('User can filter results by document category,site,document name. These controls should exists', () => {
      let categoryFilterFound: boolean = false;
      let siteFilterFound: boolean = false;
      let documentNameFilterFound: boolean = false;

      Object.keys(filterFormGroup.controls).forEach(key => {
        if (key == 'CategoryId')
          categoryFilterFound = true;
      });

      Object.keys(filterFormGroup.controls).forEach(key => {
        if (key == 'Site')
          siteFilterFound = true;
      });

      Object.keys(filterFormGroup.controls).forEach(key => {
        if (key == 'DocumentName')
          documentNameFilterFound = true;
      });

      expect(categoryFilterFound && siteFilterFound && documentNameFilterFound).toBeTruthy();

      //document category filter should be of drop down type
      let categoryFilterDebug = fixture.debugElement.query(By.css('#documentSelector_CategoryId_1'));
      expect(categoryFilterDebug.componentInstance.constructor.name).toEqual('AeSelectComponent');

      let siteFilterDebug = fixture.debugElement.query(By.css('#documentSelector_Site_1'));
      expect(siteFilterDebug.componentInstance.constructor.name).toEqual('AeInputComponent');

      let documentNameFilterDebug = fixture.debugElement.query(By.css('#documentSelector_documentName_1'));
      expect(documentNameFilterDebug.componentInstance.constructor.name).toEqual('AeInputComponent');

    });

    it('it should load the sites to filter', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(new LoadSitesAction(false));
    });

    it('it should load the document categories to filter', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(new LoadAuthorizedDocumentCategories(true));
    });

    it('it should load the document categories to filter', () => {
      let docSelectRequest: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'ModifiedOn', SortDirection.Ascending, [new AtlasParams('Status', '2')]);
      expect(dispatchSpy).toHaveBeenCalledWith(new LoadCompanyDocumentsAction(docSelectRequest));
    });

  });

  describe('After site, document category, documents list is loaded', () => {
    beforeEach(fakeAsync(() => {
      let mockedSites = MockStoreProviderFactory.getTestSites();
      mockedImmutableSitesData = MockStoreProviderFactory.getTestSitesImmutableMultiSelectData();
      component.sites$.subscribe((val) => {
        subscribedSites = val;
      });
      let mockedAuthDocumentCategories = MockStoreProviderFactory.getTestAuthDocumentCategories();
      subscribedDocumentCategories = documentCategorySer._getUniqueCategories(mockedAuthDocumentCategories.filter(d => d.DocumentArea === 1));
      //dispatch action to get the authorized document categories..
      subscribedCategories = mapCategoryDataToAeSelectItems(subscribedDocumentCategories);
      documentsApiRes = MockStoreProviderFactory.getTestDocumentSelectorData();

      dispatchSpy.and.callThrough();

      store.dispatch(new LoadSitesCompleteAction(mockedSites));
      store.dispatch(new LoadAuthorizedDocumentCategoriesComplete(subscribedDocumentCategories));
      store.dispatch(new LoadCompanyDocumentsCompleteAction(documentsApiRes));
      fixture.detectChanges();
      tick(100);
      let tbdElement = fixture.debugElement.query(By.css('#documentsGrid_divBody_0'));
      columnDivArray = tbdElement.queryAll(By.css('.table__heading'));
    }));

    it('Document categories should be available to filter', () => {
      let documentCategoryDebug = fixture.debugElement.query(By.css('#documentSelector_CategoryId_1'))
      let documentCategoryControl: HTMLSelectElement = documentCategoryDebug.nativeElement;
      expect(documentCategoryControl.options.length).toEqual(subscribedDocumentCategories.length + 1);
    });

    it('sites should be available to filter', () => {
      expect(subscribedSites).toEqual(mockedImmutableSitesData);
    });

    it('Documents should be listed for selection', () => {
      let tblItemElements = fixture.debugElement.queryAll(By.css('.table__row'));
      expect(tblItemElements.length).toEqual(10);
      let footer = fixture.debugElement.query(By.css('#documentsGrid_AePagination_1'));
      let footerLabel: string = footer.query(By.css('.table__rows-summary')).nativeElement.innerHTML;
      expect(footerLabel.indexOf(documentsApiRes.PagingInfo.TotalCount.toString()) >= 0).toBeTruthy();

    });

    it('This will list all documents within the Client document library, with columns for:Document name (sortable) Category (sortable) Version (sortable) Site name (sortable) Employee name (sortable) Upload date (sortable) Action (checkbox)', () => {
      expect(columnDivArray.length).toEqual(7);
      CommonTestHelper.columnAssertFun(columnDivArray, 0, 'DOCUMENT_NAME', true, 'FileNameAndTitle');
      CommonTestHelper.columnAssertFun(columnDivArray, 1, 'CATEGORY', true, 'CategoryName');
      CommonTestHelper.columnAssertFun(columnDivArray, 2, 'VERSION', true, 'Version');
      CommonTestHelper.columnAssertFun(columnDivArray, 3, 'SITE_NAME', true, 'SiteName');
      CommonTestHelper.columnAssertFun(columnDivArray, 4, 'EMPLOYEE_NAME', true, 'EmployeeName');
      CommonTestHelper.columnAssertFun(columnDivArray, 5, 'UPLOAD_DATE', true, 'ModifiedOn');
      CommonTestHelper.columnAssertFun(columnDivArray, 6, 'SELECT_COLUMN_TITLE', false, null);
    });

    it('User can filter results by document category', fakeAsync(() => {
      let currentRequest = component.docSelectRequest;
      let categoryControl = fixture.debugElement.query(By.css('#documentSelector_CategoryId_1'));
      let typeOfControl = categoryControl instanceof HTMLSelectElement;

      let objValue = { target: { value: '1cfb7f5d-e768-47cf-9d0a-f8b65dd274bd' } };
      categoryControl.triggerEventHandler('change', objValue);
      fixture.detectChanges();
      tick(200);
      currentRequest.Params = addOrUpdateAtlasParamValue(currentRequest.Params, 'DocumentCategory', '1cfb7f5d-e768-47cf-9d0a-f8b65dd274bd');
      let companyDocLoadAction: LoadCompanyDocumentsAction = (new LoadCompanyDocumentsAction(currentRequest));
      expect(dispatchSpy).toHaveBeenCalledWith(companyDocLoadAction);

    }));

    it('User can filter results by site', fakeAsync(() => {
      let currentRequest = component.docSelectRequest;
      let siteAutoCompControl: AeAutocompleteComponent<string> = fixture.debugElement.query(By.directive(AeAutocompleteComponent)).componentInstance;
      component.documentSelectorForm.patchValue({ Site: ['1cfb7f5d-e768-47cf-9d0a-f8b65dd274bd'] });
      fixture.detectChanges();
      tick(200);
      currentRequest.Params = addOrUpdateAtlasParamValue(currentRequest.Params, 'Site', '1cfb7f5d-e768-47cf-9d0a-f8b65dd274bd');
      let companyDocLoadAction: LoadCompanyDocumentsAction = (new LoadCompanyDocumentsAction(currentRequest));
      expect(dispatchSpy).toHaveBeenCalledWith(companyDocLoadAction);

    }));

    it('User can filter results by document name', fakeAsync(() => {
      let currentRequest = component.docSelectRequest;
      let nameControl = fixture.debugElement.query(By.css('#documentSelector_documentName_1'));
      let objValue = { target: { value: 'name filter Changed' } };
      nameControl.triggerEventHandler('input', objValue);
      fixture.detectChanges();
      tick(200);
      currentRequest.Params = addOrUpdateAtlasParamValue(currentRequest.Params, 'DocumentNameQuery', 'name filter Changed');
      let companyDocLoadAction: LoadCompanyDocumentsAction = (new LoadCompanyDocumentsAction(currentRequest));
      expect(dispatchSpy).toHaveBeenCalledWith(companyDocLoadAction);

    }));

  });

  describe('After the site, document categories, documents list data loaded, ', () => {
    beforeEach(fakeAsync(() => {
      let mockedSites = MockStoreProviderFactory.getTestSites();
      mockedImmutableSitesData = MockStoreProviderFactory.getTestSitesImmutableMultiSelectData();
      component.sites$.subscribe((val) => {
        subscribedSites = val;
      });
      let mockedAuthDocumentCategories = MockStoreProviderFactory.getTestAuthDocumentCategories();
      subscribedDocumentCategories = documentCategorySer._getUniqueCategories(mockedAuthDocumentCategories.filter(d => d.DocumentArea === 1));
      //dispatch action to get the authorized document categories..
      subscribedCategories = mapCategoryDataToAeSelectItems(subscribedDocumentCategories);
      documentsApiRes = MockStoreProviderFactory.getTestDocumentSelectorData();

      dispatchSpy.and.callThrough();

      store.dispatch(new LoadSitesCompleteAction(mockedSites));
      store.dispatch(new LoadAuthorizedDocumentCategoriesComplete(subscribedDocumentCategories));
      store.dispatch(new LoadCompanyDocumentsCompleteAction(documentsApiRes));
      fixture.detectChanges();
      tick(100);
      let tbdElement = fixture.debugElement.query(By.css('#documentsGrid_divBody_0'));
      columnDivArray = tbdElement.queryAll(By.css('.table__heading'));    
    }));


    it('It should have page change and sort options', (() => {      
      let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
      let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
      let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
      expect(sortEvent).toBeDefined();
      expect(pageChangeEvent).toBeDefined();
    }));

    it('Upon click on any sortable column, it should sort the documents list', (() => {   
      dispatchSpy.calls.reset();
      let existingRequest = component.docSelectRequest;
      let objAeSortModel: AeSortModel = { SortField: 'Name', Direction: SortDirection.Descending };
      component.onSort(objAeSortModel);
      existingRequest.SortBy = objAeSortModel;
      expect(dispatchSpy).toHaveBeenCalledWith(new LoadCompanyDocumentsAction(existingRequest));
    }));

    it('Upon click on any page number or pager buttons , it should load that paged documents list', (() => {  
      dispatchSpy.calls.reset()    
      let existingRequest = component.docSelectRequest;
      let objAePageChangeModel: AePageChangeEventModel = { pageNumber: 4, noOfRows: 20 };
      component.onPageChange(objAePageChangeModel);
      existingRequest.PageNumber = 4;
      existingRequest.PageSize = 20;
      expect(dispatchSpy).toHaveBeenCalledWith(new LoadCompanyDocumentsAction(existingRequest));
    }));


    it('When user selected some documents from list the selected documents should be transferred to parent component', fakeAsync(() => {
      //expect(true).toBeFalsy();
      let firstCheckbox = fixture.debugElement.query(By.css('#documentSelector_AeSelectChekbox_4e2c2bea-b43e-431b-b83d-116dd6e0279f_iChkBox'));
      let secondCheckbox = fixture.debugElement.query(By.css('#documentSelector_AeSelectChekbox_0ec232c4-f9f5-44db-acb8-d064e485385c_iChkBox'));
      let thirdCheckbox = fixture.debugElement.query(By.css('#documentSelector_AeSelectChekbox_b317dd56-9028-40e9-ae41-fa58f3ae3fae_iChkBox'));
      let toBeSelectedDocuments = documentsApiRes.Entities.filter(obj => obj.Id == '4e2c2bea-b43e-431b-b83d-116dd6e0279f' || obj.Id == '0ec232c4-f9f5-44db-acb8-d064e485385c' || obj.Id == 'b317dd56-9028-40e9-ae41-fa58f3ae3fae');

      let objValue = { target: { checked: true } };
      firstCheckbox.triggerEventHandler('change', objValue);
      secondCheckbox.triggerEventHandler('change', objValue);
      thirdCheckbox.triggerEventHandler('change', objValue);
      fixture.detectChanges();
      // tick(200);
      let selectedItemsInComponent = component.selectedDocs;
      //all the to be selected documents should be in the component selected documents list
      let allFound: boolean = true;
      toBeSelectedDocuments.forEach(toBeDoc => {
        let component = selectedItemsInComponent.find(obj => obj.Id == toBeDoc.Id);
        if (isNullOrUndefined(component)) {
          allFound = false;
        }
      });
      expect(allFound).toBeTruthy();
    }));

    it('Should show the given documents as selected and disabled', fakeAsync(() => {
      //expect(true).toBeFalsy();
      let firstCheckbox: HTMLInputElement = fixture.debugElement.query(By.css('#documentSelector_AeSelectChekbox_4e2c2bea-b43e-431b-b83d-116dd6e0279f_iChkBox')).nativeElement;
      let secondCheckbox: HTMLInputElement = fixture.debugElement.query(By.css('#documentSelector_AeSelectChekbox_0ec232c4-f9f5-44db-acb8-d064e485385c_iChkBox')).nativeElement;
      let thirdCheckbox: HTMLInputElement = fixture.debugElement.query(By.css('#documentSelector_AeSelectChekbox_b317dd56-9028-40e9-ae41-fa58f3ae3fae_iChkBox')).nativeElement;

      let changeDetectionCheckbox = fixture.debugElement.query(By.css('#documentSelector_AeSelectChekbox_3e1300e0-f29d-4985-898d-1f677cee85b2_iChkBox'));

      let toBeSelectedDocuments = documentsApiRes.Entities.filter(obj => obj.Id == '4e2c2bea-b43e-431b-b83d-116dd6e0279f' || obj.Id == '0ec232c4-f9f5-44db-acb8-d064e485385c' || obj.Id == 'b317dd56-9028-40e9-ae41-fa58f3ae3fae');
      component.selectedDocuments = toBeSelectedDocuments;

      let objValue = { target: { checked: true } };
      changeDetectionCheckbox.triggerEventHandler('change', objValue);

      fixture.detectChanges();
      tick(200);
      expect(firstCheckbox.checked).toBeTruthy();
      expect(secondCheckbox.checked).toBeTruthy();
      expect(thirdCheckbox.checked).toBeTruthy();

      expect(firstCheckbox.disabled).toBeTruthy();
      expect(secondCheckbox.disabled).toBeTruthy();
      expect(thirdCheckbox.disabled).toBeTruthy();


    }));

    it('When Add is clicked the selected documents should be emitted to the parent component', fakeAsync(() => {
      let firstCheckbox = fixture.debugElement.query(By.css('#documentSelector_AeSelectChekbox_4e2c2bea-b43e-431b-b83d-116dd6e0279f_iChkBox'));
      let secondCheckbox = fixture.debugElement.query(By.css('#documentSelector_AeSelectChekbox_0ec232c4-f9f5-44db-acb8-d064e485385c_iChkBox'));
      let thirdCheckbox = fixture.debugElement.query(By.css('#documentSelector_AeSelectChekbox_b317dd56-9028-40e9-ae41-fa58f3ae3fae_iChkBox'));
      let toBeSelectedDocuments = documentsApiRes.Entities.filter(obj => obj.Id == '4e2c2bea-b43e-431b-b83d-116dd6e0279f' || obj.Id == '0ec232c4-f9f5-44db-acb8-d064e485385c' || obj.Id == 'b317dd56-9028-40e9-ae41-fa58f3ae3fae');

      let objValue = { target: { checked: true } };
      firstCheckbox.triggerEventHandler('change', objValue);
      secondCheckbox.triggerEventHandler('change', objValue);
      thirdCheckbox.triggerEventHandler('change', objValue);
      fixture.detectChanges();
      // tick(200);     
      //all the to be selected documents should be in the component selected documents list
      let allFound: boolean = true;
      let anchorBtn: HTMLAnchorElement = fixture.debugElement.query(By.css('#documentSelector_AeAnchor_1')).nativeElement;
      let emittedDocs: Document[];
      component._selectDocuments.subscribe((emittedValues) => {
        emittedDocs = emittedValues;
      });

      anchorBtn.click();

      toBeSelectedDocuments.forEach(toBeDoc => {
        let component = emittedDocs.find(obj => obj.Id == toBeDoc.Id);
        if (isNullOrUndefined(component)) {
          allFound = false;
        }
      });
      expect(allFound).toBeTruthy();
    }));

    it('When Close is clicked the selected documents should be emitted to the parent component', fakeAsync(() => {

      //all the to be selected documents should be in the component selected documents list
      let allFound: boolean = true;
      let spanElement: HTMLSpanElement = fixture.debugElement.query(By.css('#documentSelector_AeButton_1')).nativeElement;
      let emittedClose: boolean;
      component._aeClose.subscribe((emittedValues) => {
        emittedClose = emittedValues;
      });

      spanElement.click();
      expect(emittedClose).toBeDefined();
      expect(emittedClose).toBeTruthy();
    }));


  });
});
