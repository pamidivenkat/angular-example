import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { reducer } from '../../../shared/reducers/index';
import { PersonalDocumentsComponent } from './personal-documents.component';
import { CommonModule, LocationStrategy, DatePipe, JsonPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from '../../../atlas-elements/atlas-elements.module';
import { RouterModule, ActivatedRoute, Router, RouterOutletMap } from '@angular/router';
import { LocalizationModule, LocaleService, InjectorRef, TranslationService } from 'angular-l10n';
import { CkEditorModule } from '../../../atlas-elements/ck-editor/ck-editor.module';
import { StoreModule, Store } from '@ngrx/store';
import { routes } from '../../document.routes';
import { Http, BaseRequestOptions } from '@angular/http';
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
import { AeModalDialogComponent } from '../../../atlas-elements/ae-modal-dialog/ae-modal-dialog.component';
import { Document } from '../../../document/models/document';
import { DocumentSignatureViewComponent } from '../../../document/document-shared/components/document-signature-view/document-signature-view.component';

describe('PersonalDocumnetsComponent', () => {
    let component: PersonalDocumentsComponent;
    let fixture: ComponentFixture<PersonalDocumentsComponent>;
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
    let personalDocumentsData: any;
    let selectedDocument: Document;

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
                , { provide: DocumentService, useValue: jasmine.createSpyObj('documentServiceStub', ['loadPersonalDocuments', 'loadSelectedDocument', 'removeDocument']) }
                , { provide: OtcEntityDataService, useValue: jasmine.createSpyObj('otcEntityDataServiceStub', ['loadOtcEntities']) }
                , LocationStrategy
                , MockBackend
                , BaseRequestOptions
                , FormBuilderService
                , DocumentCategoryService
                , { provide: RestClientService, useClass: RestClientServiceStub }
            ]
        }).overrideComponent(PersonalDocumentsComponent, { set: { host: { "(click)": "dummy" } } })
            .compileComponents();
    }));

    beforeEach(() => {
        claimsHelperServiceStub = TestBed.get(ClaimsHelperService);
        fixture = TestBed.createComponent(PersonalDocumentsComponent);
        component = fixture.componentInstance;
        component.id = "personal_documents_id";
        component.name = "personal_documents_id"
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
        datePipe = fixture.debugElement.injector.get(DatePipe);
        dispatchSpy = spyOn(store, 'dispatch');

        fixture.detectChanges();
    });


    describe('Component launch', () => {

        it('should create personal documents  component', () => {
            expect(component).toBeTruthy();
        });

        it('should display help text when navigated to personal documents tab', () => {
            let text: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Documents');
            expect(text.innerText).toContain('PERSONAL_DOCUMENTS_MESSAGE');
        });

    });

    describe('After loading the personal documents component', () => {

        beforeEach(() => {
            personalDocumentsData = PersonalDocumentsMockStoreProviderFactory.getPersonalDocuments();
            dispatchSpy.and.callThrough();
            store.dispatch(new LoadPersonalDocumentsComplete(personalDocumentsData));
            component.documents$.subscribe(doc => {
                documents = doc;
            });
            fixture.detectChanges();
        });
        it('should display Add button at the top to add a new document', () => {
            let addButton: HTMLElement = fixture.debugElement.nativeElement.querySelector('#personal_documents_id_AeButton_1_aeButton_1');
            expect(addButton.innerText).toEqual('ADD');
        });

        describe('Each card in the list', () => {

            it('should display the icon , document title,document category name,document updated date', () => {
                let iconElement = <HTMLElement>fixture.debugElement.nativeElement.querySelector('#personal_documents_id_AeIcon_0');
                let titleText: HTMLElement = fixture.debugElement.nativeElement.querySelector('#card__title_0');
                let dateElementText = fixture.debugElement.nativeElement.querySelector('#card__text_0').children[1].innerText;
                let transformedDate = datePipe.transform(personalDocumentsData[0].UpdatedDateTime, 'dd/MM/yyyy');
                let x = dateElementText.split(" ");
                let text = x[0];

                expect(iconElement).toBeTruthy();
                expect(titleText.innerText).toEqual(personalDocumentsData[0].FileNameAndTitle);
                expect(text).toContain(transformedDate);
            });

            it('should display the document sub category name if the document have document subcategory', () => {
                let descriptionText: HTMLElement = fixture.debugElement.nativeElement.querySelector('#card__text_0').children[0].innerText;
                expect(descriptionText).toEqual(personalDocumentsData[0].DocumentSubCategory);
            });

            it('should display the document category name if the document does not have document subcategory', () => {
                let descriptionText: HTMLElement = fixture.debugElement.nativeElement.querySelector('#card__text_2').children[0].innerText;
                expect(descriptionText).toEqual(personalDocumentsData[2].CategoryName);
            });

            it('should display the Download button in the card when the category is of type certificate', () => {
                let detailButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#btnDetails');
                expect(detailButton.innerText).toEqual('DETAILS');
            });

            it('should display Details button when the category is not of type certificate', () => {
                let downloadButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#btnDownload');
                expect(downloadButton.innerText).toEqual('DOWNLOAD');
            });
        });

        it('should open Add document Slide out when Add Button clicked', fakeAsync(() => {
            spyOn(component, 'addNewDocument').and.callThrough();
            let addButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#personal_documents_id_AeButton_1_aeButton_1');
            addButton.click();
            tick(1000);
            expect(component.addNewDocument).toHaveBeenCalled();
            expect(component.isAdd).toBeTruthy();
            fixture.detectChanges();
        }));

        it('should open details slide out when Details button was clicked', () => {
            spyOn(component, 'showDocumentDetails').and.callThrough();
            let detailButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#btnDetails');
            detailButton.click();
            expect(component.showDocumentDetails).toHaveBeenCalled();
            fixture.detectChanges();
        });

        it('should open new window when Download button was clicked', () => {
            spyOn(component, 'downloadDocument').and.callThrough();
            let downloadButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#btnDownload');
            downloadButton.click();
            expect(component.downloadDocument).toHaveBeenCalled();
            fixture.detectChanges();
        });

        describe('Removing a document', () => {
            beforeEach(() => {
                selectedDocument = PersonalDocumentsMockStoreProviderFactory.getSelectedPersonalDocument();
                dispatchSpy.and.callThrough();
                store.dispatch(new LoadSelectedDocumentComplete(selectedDocument));
                fixture.detectChanges();
            });
            it('should open popup when Remove button was clicked from details slideout', fakeAsync(() => {
                component.onDocumentDelete('delete');
                fixture.debugElement.triggerEventHandler('click', null);
                tick(200);
                fixture.detectChanges();
                let removePopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
                expect(removePopup).toBeTruthy();
            }));

            it('should close remove personal document popup on click of `No,Keep document` button', fakeAsync(() => {
                component.onDocumentDelete('delete');
                fixture.debugElement.triggerEventHandler('click', null);
                tick(200);
                fixture.detectChanges();
                let removePopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
                let cancelButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#confirmNo_aeButton_1');
                cancelButton.click();
                fixture.detectChanges();
                removePopup.cancelEvent();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                expect(removePopup.isVisible).toBeTruthy();
            }));

            it('should close popup on confirmation of Yes and should emit an event to delete', fakeAsync(() => {
                spyOn(component, 'modalClosed').and.callThrough();
                component.onDocumentDelete('delete');
                fixture.debugElement.triggerEventHandler('click', null);
                tick(200);
                fixture.detectChanges();
                let removePopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
                let confirmButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#confirmYes_aeButton_1');
                confirmButton.click();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                expect(component.modalClosed).toHaveBeenCalled();
            }));

        });
    });
});