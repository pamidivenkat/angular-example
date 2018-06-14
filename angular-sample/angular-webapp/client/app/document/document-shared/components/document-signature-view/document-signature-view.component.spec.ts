import { NO_ERRORS_SCHEMA } from "@angular/core";
import { DocumentSignatureViewComponent } from "./document-signature-view.component";
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
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
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
import { DocumentSelectorComponent } from "../document-selector/document-selector.component";
import { DocumentsMockStoreProviderFactory } from "../../../../shared/testing/mocks/documents-moc-store-provider-factory";
import { ReactiveFormsModule } from "@angular/forms";
import { DocumentSignatureDetails } from "../../../../document/document-shared/models/document-signature.model";

let store: Store<fromRoot.State>;

describe('Document Signature View Component', () => {
  let component: DocumentSignatureViewComponent;
  let fixture: ComponentFixture<DocumentSignatureViewComponent>;
  let mockSignatureDetails: DocumentSignatureDetails;
  let datePipe: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        CkEditorModule,
        AtlasElementsModule,
        RouterModule.forChild([]),
        LocalizationModule,
        AtlasSharedModule
        , NoopAnimationsModule
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
        , DatePipe, JsonPipe
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
    fixture = TestBed.createComponent(DocumentSignatureViewComponent);
    datePipe = fixture.debugElement.injector.get(DatePipe);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);
    component.id = 'documentSignatureView';
    component.name = 'documentSignatureView';
    mockSignatureDetails = DocumentsMockStoreProviderFactory.getDocumentSignatureDetails();
    component.documentSignatureDetails = mockSignatureDetails;
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should have `View signature` header', () => {
    let header = fixture.debugElement.query(By.css('h3')).nativeElement;
    expect(header).toBeDefined();
    expect(header.innerText).toEqual("VIEW_SIGNATURE");
  });

  it('should display Document name,Signed by,Signed date and Signature fields', () => {
    let DocumentNameField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#DocumentName');
    let SignedByField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#SignedBy');
    let SignedDateField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#SignedDate');
    let SignatureField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Signature');

    let SignedDate = datePipe.transform(mockSignatureDetails.SignedDate, 'dd/MM/yyyy');

    expect(DocumentNameField).toBeTruthy();
    expect(SignedByField).toBeTruthy();
    expect(SignedDateField).toBeTruthy();
    expect(SignatureField).toBeTruthy();

    expect(DocumentNameField.children[0].innerHTML).toEqual('DOCUMENT_NAME');
    expect(SignedByField.children[0].innerHTML).toEqual('SIGNED_BY');
    expect(SignedDateField.children[0].innerHTML).toEqual('SIGNED_DATE');
    expect(SignatureField.children[0].innerHTML).toEqual('SIGNATURE');

    expect(DocumentNameField.children[1].innerHTML).toContain(mockSignatureDetails.DocumentName);
    expect(SignedByField.children[1].innerHTML).toContain(mockSignatureDetails.SignedBy);
    expect(SignedDateField.children[1].innerHTML).toContain(SignedDate);
    expect(SignatureField.children[1].innerHTML).toContain(mockSignatureDetails.Signature);

  });

});
