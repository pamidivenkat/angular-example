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
import { LoadAuthorizedDocumentCategoriesComplete, LoadDocumentSubCategoriesComplete, LoadDocumentSubCategories } from '../../../shared/actions/user.actions';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { FileResult } from '../../../atlas-elements/common/models/file-result';
import { DocumentSignatureViewComponent } from '../../../document/document-shared/components/document-signature-view/document-signature-view.component';

describe('AddPersonalDocumentComponent', () => {
    let component: AddPersonalDocumentComponent;
    let fixture: ComponentFixture<AddPersonalDocumentComponent>;
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
    let datePipe: any;
    let restClientServiceStub;
    let OtcEntityDataServiceStub: any;
    let subCategories: any;

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
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get']) }
            ]
        }).overrideComponent(AddPersonalDocumentComponent, { set: { host: { "(click)": "dummy" } } })
            .compileComponents();
    }));

    beforeEach(() => {
        claimsHelperServiceStub = TestBed.get(ClaimsHelperService);

        fixture = TestBed.createComponent(AddPersonalDocumentComponent);
        component = fixture.componentInstance;
        component.id = "Add_personal_document_id";
        component.name = "Add_personal_document_id";
        component.Action = 'Add';
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


    describe('Add personal document Component launch', () => {

        beforeEach(fakeAsync(() => {
            let categories = PersonalDocumentsMockStoreProviderFactory.getAutorizedCategories();
            dispatchSpy.and.callThrough();
            store.dispatch(new LoadAuthorizedDocumentCategoriesComplete(categories));
            tick(100);
            fixture.detectChanges();
        }));

        it('should create Add personal Document component', () => {
            expect(component).toBeTruthy();
        });
        describe('`Document category Field`', () => {
            it('By default it should display Please select in the field', () => {
                let doccategoryDropDown = fixture.debugElement.nativeElement.querySelector('#DocumentCategoryId');
                expect(doccategoryDropDown).toBeDefined();
                let dropdownValue = component.documentForm.get('Category').value;
                expect(dropdownValue).toEqual('');
            });

            it('drop down should have 3 values', () => {
                let doccategoryDropDown = fixture.debugElement.nativeElement.querySelector('#DocumentCategoryId');
                expect(doccategoryDropDown.options.length).toEqual(3);
            });
        });

        it('should dispatch an action to get document types based on document category', fakeAsync(() => {
            let doccategoryDropDown = fixture.debugElement.query(By.css('#DocumentCategoryId'));
            let isDropdown = doccategoryDropDown.nativeElement instanceof HTMLSelectElement;
            expect(isDropdown).toBe(true);
            expect(doccategoryDropDown.componentInstance.constructor.name).toEqual('AeSelectComponent');
            component.documentForm.get('Category').setValue('920d8c4e-3fe0-4814-b76f-012059feaec4');
            dispatchSpy.and.callThrough();
            tick(100);
            fixture.detectChanges();
            let loadDocumentSubCategoriesAction: LoadDocumentSubCategories = (new LoadDocumentSubCategories('920d8c4e-3fe0-4814-b76f-012059feaec4'));
            expect(dispatchSpy).toHaveBeenCalledWith(loadDocumentSubCategoriesAction);
        }));

        describe('`Document Type field` should have values based on the document category', () => {

            it('when document category is of `Personal Documents` it should display `Driving License,Other,Passport,Visa` options in drop down', fakeAsync(() => {
                dispatchSpy.and.callThrough();
                subCategories = PersonalDocumentsMockStoreProviderFactory.getDocumentSubcategories();
                store.dispatch(new LoadDocumentSubCategoriesComplete(subCategories));
                tick(100);
                fixture.detectChanges();
                component.documentSubCategoryDropDownList$.subscribe(res => {
                    expect(res).toEqual(subCategories);
                });
            }));

            it('when document category is of `TrainingCertificate` it should display only `Certificate` option in drop down', fakeAsync(() => {

                dispatchSpy.and.callThrough();
                subCategories = subCategories = PersonalDocumentsMockStoreProviderFactory.getDocumentSubCategoriesForTraining();
                store.dispatch(new LoadDocumentSubCategoriesComplete(subCategories));
                tick(100);
                fixture.detectChanges();
                component.documentSubCategoryDropDownList$.subscribe(res => {
                    expect(res).toEqual(subCategories);
                });
            }));
        });

        it('should have Upload File Button to upload file', () => {
            let fileUploadField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#fileUpload');
            fileUploadField.click();
            fixture.debugElement.triggerEventHandler('click', null);
            expect(fileUploadField.title).toEqual('Upload a file');
        });

        it('should display `Description and Notes` Fields a when file was uploaded', () => {
            let fileUploadField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#fileUpload');        //
            let object: any = {};
            object.lastModifiedDate = new Date();
            object.name = "fileName";
            let fileResult = [new FileResult(new File([object], "fileName"), "ffd8ffe0", true)];
            component.onFilesSelected(fileResult);
            fixture.debugElement.triggerEventHandler('click', null);
            fixture.detectChanges();
            expect(component.showDesciptionAndNotes).toBe(true);
        });

        it('should display Expiry date Field', () => {
            let expiryDateField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#expiry-date_ae-input_3');
            expect(expiryDateField).toBeDefined();
        });

        it('should display `Is notification required before expiry?` field when valid date was selected', fakeAsync(() => {
            component.documentForm.get('ExpiryDate').setValue(new Date());
            component.isValidDate(true);
            fixture.detectChanges();
            tick(200);
            let notificationField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#reminder');
            expect(notificationField).toBeDefined();
        }));

        it('By default toggle must be disabled', () => {
            expect(component.showReminderInDaysField).toBe(false);
        });

        it('should display `Notification before expiry date` field when toggle is enabled', () => {
            component.documentForm.get('ExpiryDate').setValue(new Date());
            component.isValidDate(true);
            component.documentForm.get('IsReminderRequired').setValue(true);
            fixture.detectChanges();
            expect(component.showReminderInDaysField).toBe(true);
        });

        it('slide out form should have close and Add Buttons', () => {
            let closeButton = <HTMLElement>fixture.debugElement.query(By.css('.so-panel__footer'))
                .queryAll(By.css('li'))[0]
                .query(By.css('label.button.button--inline-block')).nativeElement;
            let addButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#Add_personal_document_id_Aebutton_1_aeButton_1');
            expect(closeButton).toBeDefined();
            expect(addButton.innerText).toContain('ADD');
            expect(addButton).toBeDefined();
        });

        it('should fire validations if the mandatory fields are not filled', () => {
            let categoryfield = component.documentForm.controls['Category'];
            categoryfield.setValue(null);
            component.documentForm.markAsDirty();
            component.onAddFormSubmit();
            fixture.detectChanges();
            expect(component.documentForm.valid).toBeFalsy();
        });

        it('should emit event to close slideout', () => {
            spyOn(component, 'onAddCancel');
            let closeButton = <HTMLElement>fixture.debugElement.query(By.css('.so-panel__footer'))
                .queryAll(By.css('li'))[0]
                .query(By.css('label.button.button--inline-block')).nativeElement;
            closeButton.click();
            fixture.debugElement.triggerEventHandler('click', null);
            fixture.detectChanges();
            expect(component.onAddCancel).toHaveBeenCalled();
        });
    });
});

describe('AddPersonalDocumentComponent', () => {
    let component: AddPersonalDocumentComponent;
    let fixture: ComponentFixture<AddPersonalDocumentComponent>;
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
    let datePipe: any;
    let restClientServiceStub;
    let OtcEntityDataServiceStub: any;
    let subCategories: any;
    let document: Document;

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
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get']) }
            ]
        }).overrideComponent(AddPersonalDocumentComponent, { set: { host: { "(click)": "dummy" } } })
            .compileComponents();
    }));

    beforeEach(() => {
        claimsHelperServiceStub = TestBed.get(ClaimsHelperService);

        fixture = TestBed.createComponent(AddPersonalDocumentComponent);
        component = fixture.componentInstance;
        component.id = "Update_personal_document_id";
        component.name = "Update_personal_document_id";
        component.Action = 'Update';
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


    describe('Update personal document Component launch', () => {

        beforeEach(fakeAsync(() => {
            subCategories = PersonalDocumentsMockStoreProviderFactory.getDocumentSubcategories();
            document = PersonalDocumentsMockStoreProviderFactory.getSelectedPersonalDocument();
            dispatchSpy.and.callThrough();
            store.dispatch(new LoadSelectedDocumentComplete(document));
            store.dispatch(new LoadDocumentSubCategoriesComplete(subCategories));
            tick(100);
            fixture.detectChanges();
        }));

        it('should create Update personal Document component', () => {
            expect(component).toBeTruthy();
        });

        it('should dispatch an action to get document types based on the selected document category', fakeAsync(() => {
            let docSubcategoryDropDown = fixture.debugElement.query(By.css('#DocumentSubCategoryId'));
            let typeOfControl = docSubcategoryDropDown.nativeElement instanceof HTMLSelectElement;
            expect(docSubcategoryDropDown.componentInstance.constructor.name).toEqual('AeSelectComponent');
            dispatchSpy.and.callThrough();
            tick(100);
            fixture.detectChanges();
            let loadDocumentSubCategoriesAction: LoadDocumentSubCategories = (new LoadDocumentSubCategories('920d8c4e-3fe0-4814-b76f-012059feaec4'));
            expect(dispatchSpy).toHaveBeenCalledWith(loadDocumentSubCategoriesAction);
        }));


        it('`Document Type field`,`If document has expiry date please select it`,`Is notification required before expiry?` fields should be dispalyed', () => {
            let documentTypeField = fixture.debugElement.nativeElement.querySelector('#DocumentSubCategoryId') as DebugElement;
            let ExpirydateField = fixture.debugElement.nativeElement.querySelector('#expiry-date_ae-input_3');
            let reminderExpiryField = fixture.debugElement.nativeElement.querySelector('#remainderInDays');
            let toggleSwitchField = fixture.debugElement.query(By.css('.toggle-switch__input'));
            component.documentSubCategoryDropDownList$.subscribe(res => {
                expect(res).toEqual(subCategories);
            });
            let date = datePipe.transform(document.ExpiryDate, 'dd/MM/yyyy');
            expect(documentTypeField).toBeDefined();
            expect(ExpirydateField).toBeDefined();
            expect(toggleSwitchField).toBeDefined();
            expect(reminderExpiryField).toBeDefined();

            expect(ExpirydateField.value).toEqual(date);
            expect(toggleSwitchField.componentInstance.value).toBe(true);
            expect(reminderExpiryField.value).toEqual(document.ReminderInDays.toString());
        });

        it('should not display `Notification before expiry date` field when toggle is disabled', () => {
            component.documentForm.get('IsReminderRequired').setValue(false);
            fixture.detectChanges();
            let toggleSwitchField = fixture.debugElement.query(By.css('.toggle-switch__input'));
            expect(toggleSwitchField.componentInstance.value).toBe(false);
        });

        it('slide out form should have close and Save Buttons', () => {
            let closeButton = <HTMLElement>fixture.debugElement.query(By.css('.so-panel__footer'))
                .queryAll(By.css('li'))[0]
                .query(By.css('label.button.button--inline-block')).nativeElement;
            let saveButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#Update_personal_document_id_Aebutton_1_aeButton_1');

            expect(closeButton).toBeDefined();
            expect(saveButton.innerText).toContain('SAVE');
            expect(saveButton).toBeDefined();
        });

        it('should fire validations if the mandatory fields are not filled', () => {//           
            component.documentForm.get('DocumentVaultSubCategory').setValue(null);
            component.documentForm.markAsDirty();
            component.onAddFormSubmit();
            fixture.detectChanges();
            expect(component.documentForm.valid).toBeFalsy();
        });

        it('should emit event to close slideout', () => {
            spyOn(component, 'onAddCancel');
            let closeButton = <HTMLElement>fixture.debugElement.query(By.css('.so-panel__footer'))
                .queryAll(By.css('li'))[0]
                .query(By.css('label.button.button--inline-block')).nativeElement;
            closeButton.click();
            fixture.debugElement.triggerEventHandler('click', null);
            fixture.detectChanges();
            expect(component.onAddCancel).toHaveBeenCalled();
        });
    });
});