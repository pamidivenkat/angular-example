import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { reducer } from '../../../shared/reducers/index';
import { PersonalDocumentsComponent } from '../personal-documents/personal-documents.component';
import { CommonModule, LocationStrategy, DatePipe, JsonPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from '../../../atlas-elements/atlas-elements.module';
import { RouterModule, ActivatedRoute, Router, RouterOutletMap } from '@angular/router';
import { LocalizationModule, LocaleService, InjectorRef, TranslationService } from 'angular-l10n';
import { CkEditorModule } from '../../../atlas-elements/ck-editor/ck-editor.module';
import { StoreModule, Store } from '@ngrx/store';
import { routes } from '../../document.routes';
import { Http, BaseRequestOptions, ResponseOptions, Response } from '@angular/http';
import { RouteParams } from '../../../shared/services/route-params';
import { DocumentDetailsService } from '../../document-details/services/document-details.service';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbServiceStub } from '../../../shared/testing/mocks/breadcrumb-service-mock';
import { LocaleServiceStub } from '../../../shared/testing/mocks/locale-service-stub';
import { TranslationServiceStub } from '../../../shared/testing/mocks/translation-service-stub';
import { LocalizationConfig } from '../../../shared/localization-config';
import { LocalizationConfigStub } from '../../../shared/testing/mocks/localization-config-stub';
import { RouterMock } from '../../../shared/testing/mocks/router-stub';
import { ActivatedRouteStub } from '../../../shared/testing/mocks/activated-route-stub';
import { ClaimsHelperServiceStub } from '../../../shared/testing/mocks/claims-helper-service-mock';
import { RouteParamsMock } from '../../../shared/testing/mocks/route-params-mock';
import { mockHttpProvider } from '../../../shared/testing/mocks/http-stub';
import * as fromRoot from '../../../shared/reducers';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { tick } from '@angular/core/testing';

import { FileUploadService } from '../../../shared/services/file-upload.service';
import { DocumentService } from '../../../document/services/document-service';
import { MessengerService } from '../../../shared/services/messenger.service';
import { DocumentListContainerComponent } from '../../../document/containers/document-list-container/document-list-container.component';
import { SharedDocumentsContainerComponent } from '../../../document/containers/shared-documents-container/shared-documents-container.component';
import { DocumentInformationbarComponent } from '../../../document/components/document-informationbar/document-informationbar.component';
import { UsefuldocumentsDistributedComponent } from '../../../document/components/usefuldocuments-distributed/usefuldocuments-distributed.component';
import { DocumentDetailsComponent } from '../../../document/components/document-details/document-details.component';
import { CompanyDocumentsDistributedComponent } from '../../../document/components/company-documents-distributed/company-documents-distributed.component';
import { DocumentActionConfirmComponent } from '../../../document/components/document-action-confirm/document-action-confirm.component';
import { AddPersonalDocumentComponent } from '../../../document/components/add-personal-document/add-personal-document.component';
import { AddDocumentToDistribute } from '../../../document/components/add-document-to-distribute/add-document-to-distribute.component';

import { PersonalDocumentsMockStoreProviderFactory } from '../../../shared/testing/mocks/personal-doc-mock-store-provider-factory';
import { LoadPersonalDocuments, LoadPersonalDocumentsComplete, LoadSelectedDocumentComplete } from '../../../document/actions/document.actions';
import { MockBackend } from '@angular/http/testing';
import { FormBuilderService } from '../../../shared/services/form-builder.service';
import { DocumentCategoryService } from '../../../document/services/document-category-service';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { OtcEntityDataService } from '../../../document/services/otc-data.service';
import { RestClientServiceStub } from '../../../shared/testing/mocks/rest-client-service-stub';
import { Document, EntityReference } from '../../../document/models/document';
import { LoadOTCEntitiesComplete } from '../../../shared/actions/lookup.actions';
import { Observable } from 'rxjs/Observable';
import { AeModalDialogComponent } from '../../../atlas-elements/ae-modal-dialog/ae-modal-dialog.component';
import { DocumentSubCategory } from '../../../document/models/documentsubcategory';
import { DocumentSignatureViewComponent } from '../../../document/document-shared/components/document-signature-view/document-signature-view.component';

describe('DocumentDetailsComponent', () => {
    let component: DocumentDetailsComponent;
    let fixture: ComponentFixture<DocumentDetailsComponent>;
    let store: Store<fromRoot.State>;
    let dispatchSpy: jasmine.Spy;
    let configLoaded: jasmine.Spy;

    let breadCumServiceStub: any;
    let localeServiceStub: any;
    let translationServiceStub: any;
    let localizationConfigStub: any;
    let routerMock: any;
    let activatedRouteStub: any;
    let claimsHelperServiceStub: any
    let routeParamsStub: any;
    let http: any;

    let fileUploadServiceStub: any;
    let documentServiceStub: any;
    let messengerServiceStub: any;
    let documents: any;
    let datePipe: any;
    let selectedDocumentData: Document;
    let restClientServiceStub;
    let OtcEntityDataServiceStub: any;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                ReactiveFormsModule,
                AtlasElementsModule,
                RouterModule.forChild(routes),
                LocalizationModule,
                StoreModule.provideStore(reducer),
                BrowserAnimationsModule
            ],
            declarations: [
                DocumentListContainerComponent
                , SharedDocumentsContainerComponent
                , DocumentInformationbarComponent
                , CompanyDocumentsDistributedComponent
                , PersonalDocumentsComponent
                , UsefuldocumentsDistributedComponent
                , DocumentDetailsComponent
                , DocumentActionConfirmComponent
                , AddPersonalDocumentComponent
                , AddDocumentToDistribute
                , DocumentSignatureViewComponent
            ],
            providers: [
                InjectorRef
                , DatePipe, JsonPipe
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
                , { provide: Router, useClass: RouterMock }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceStub', ['canAccessClientLibrary', 'getEmpIdOrDefault', 'canViewHSDocuments', 'canCreateContracts', 'canDistributeAnySharedDocument', 'canDistributeAnyDocument', 'canDistributeAnySharedDocument', 'canViewELDocuments']) }
                , { provide: RouteParams, useClass: RouteParamsMock }
                , { provide: Http, useValue: mockHttpProvider }
                , { provide: FileUploadService, useValue: jasmine.createSpyObj('fileUploadServiceStub', ['Upload']) }
                , { provide: MessengerService, useValue: jasmine.createSpyObj('messengerServiceStub', ['publish']) }
                , { provide: DocumentService, useValue: jasmine.createSpyObj('documentServiceStub', ['loadPersonalDocuments', 'loadSelectedDocument']) }
                , LocationStrategy
                , MockBackend
                , BaseRequestOptions
                , FormBuilderService
                , DocumentCategoryService
                , OtcEntityDataService
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get']) } // useClass: RestClientServiceStub 
            ]
        }).overrideComponent(PersonalDocumentsComponent, { set: { host: { "(click)": "dummy" } } })
            .compileComponents();
    }));

    beforeEach(() => {
        claimsHelperServiceStub = TestBed.get(ClaimsHelperService);

        fixture = TestBed.createComponent(DocumentDetailsComponent);
        component = fixture.componentInstance;
        component.id = "document_details_id";
        component.name = "document_details_id"
        store = fixture.debugElement.injector.get(Store);
        breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
        localeServiceStub = fixture.debugElement.injector.get(LocaleService);
        translationServiceStub = fixture.debugElement.injector.get(TranslationService);
        localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
        routerMock = fixture.debugElement.injector.get(Router);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        routeParamsStub = fixture.debugElement.injector.get(RouteParams);
        fileUploadServiceStub = fixture.debugElement.injector.get(FileUploadService);
        messengerServiceStub = fixture.debugElement.injector.get(MessengerService);
        documentServiceStub = fixture.debugElement.injector.get(DocumentService);
        OtcEntityDataServiceStub = fixture.debugElement.injector.get(OtcEntityDataService);
        restClientServiceStub = TestBed.get(RestClientService);
        datePipe = fixture.debugElement.injector.get(DatePipe);
        dispatchSpy = spyOn(store, 'dispatch');

        fixture.detectChanges();
    });


    describe('Component launch', () => {

        beforeEach(fakeAsync(() => {
            selectedDocumentData = PersonalDocumentsMockStoreProviderFactory.getSelectedPersonalDocument();
            let otcEntities = <Array<EntityReference>>PersonalDocumentsMockStoreProviderFactory.getOtcEntities();
            let Employee = PersonalDocumentsMockStoreProviderFactory.getEmployeeDetails();
            let options = new ResponseOptions({ body: JSON.stringify(Employee) });
            let response = new Response(options);
            restClientServiceStub.get.and.returnValue(Observable.of(response));
            tick(1000);
            dispatchSpy.and.callThrough();

            store.dispatch(new LoadOTCEntitiesComplete(otcEntities));
            store.dispatch(new LoadSelectedDocumentComplete(selectedDocumentData));

            fixture.detectChanges();
        }));

        it('should create document details component', () => {
            expect(component).toBeTruthy();
        });

        it('should read slide out header as `Document details`', () => {
            let headerTitle = fixture.debugElement.query(By.css('.so-panel__title')).nativeElement;
            expect(headerTitle).toBeDefined();
        });

        it('should display `File name,Category,Type,Archived,Modified on,Expire on,Description,Notes` Fields', () => {
            let FileNameField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#information-grid__item_name');
            let CategoryField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#information-grid__item_category');
            let typeField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#information-grid__item_type');
            let archiveField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#information-grid__item_archive');
            let modifiedDate = datePipe.transform(selectedDocumentData.ModifiedOn, 'dd/MM/yyyy');
            let modifiedField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#information-grid__item_modified');
            let expiryDate = datePipe.transform(selectedDocumentData.ExpiryDate, 'dd/MM/yyyy');
            let expireField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#information-grid__item_expire');
            let descriptionField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#information-grid__item_desc');
            let notesField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#information-grid__item_notes');

            expect(FileNameField.children[0]).toBeDefined();
            expect(CategoryField.children[0]).toBeDefined();
            expect(typeField.children[0]).toBeDefined();
            expect(archiveField.children[0]).toBeDefined();
            expect(modifiedField.children[0]).toBeDefined();
            expect(expireField.children[0]).toBeDefined();
            expect(descriptionField.children[0]).toBeDefined();
            expect(notesField.children[0]).toBeDefined();

            expect(FileNameField.children[1].innerHTML).toContain(selectedDocumentData.FileNameAndTitle);
            expect(CategoryField.children[1].innerHTML).toContain(selectedDocumentData.CategoryLocalizedName);
            expect(typeField.children[1].innerHTML).toContain(selectedDocumentData.UsageName);
            expect(archiveField.children[1].innerHTML).toContain('No');
            expect(modifiedField.children[1].innerHTML).toContain(modifiedDate);
            expect(expireField.children[1].innerHTML).toContain(expiryDate);
            expect(descriptionField.children[1].innerHTML).toContain(selectedDocumentData.Description);
            expect(notesField.children[1].innerHTML).toContain(selectedDocumentData.Comment);
        });

        it('should display selected document employee namein  `regardingObjectTypeName` field', () => {
            /*passing regarding object of employee type to test the data */
            let EmployeeField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#information-grid__item_regard');
            expect(EmployeeField.children[0].innerHTML).toContain(component.regardingObjectTypeName);
            expect(EmployeeField.children[1].innerHTML).toContain(component.regardingObjectTypeValue);
        });

        it('should display document subcategory name if the document is having sub category', () => {
            let subCategoryField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#information-grid__item__subCat');
            expect(subCategoryField.children[0]).toBeDefined();
            expect(subCategoryField.children[1].innerHTML).toContain(component.selectedDocument.DocumentVaultSubCategory.Name);
        });

        it('should display Download and Remove buttons', () => {
            let downloadButton: HTMLElement = fixture.debugElement.nativeElement.querySelector('#btnDownload');
            let removeButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#btnRemove');
            expect(downloadButton.innerText).toContain('DOWNLOAD');
            expect(downloadButton).toBeDefined();
            expect(removeButton.innerText).toContain('REMOVE');
            expect(removeButton).toBeDefined();
        });

        it('slideout should have Update and close buttons in the footer', () => {
            let updateButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#btnUpdate');
            let cancelButton: HTMLElement = fixture.debugElement.nativeElement.querySelector('#btnCancel');
            expect(updateButton).toBeDefined();
            expect(cancelButton).toBeDefined();
        });

        it('should open new window when Download button was clicked', () => {
            spyOn(component, 'downloadDocument').and.callThrough();
            let downloadButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#btnDownload');
            downloadButton.click();
            expect(component.downloadDocument).toHaveBeenCalled();
            fixture.detectChanges();
        });

        it('should launch popup for remove action', () => {
            spyOn(component, 'removeDocumentClick').and.callThrough();
            let removeButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#btnRemove');
            removeButton.click();
            fixture.detectChanges();
            expect(component.removeDocumentClick).toHaveBeenCalled();
        });

        it('should launch update slideout when update button was clicked', () => {
            spyOn(component, 'onDocumentEditClick').and.callThrough();
            let updateButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#btnUpdate_aeButton_1');
            updateButton.click();
            fixture.detectChanges();
            expect(component.onDocumentEditClick).toHaveBeenCalled();
        });
    });
});