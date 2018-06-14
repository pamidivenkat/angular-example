import { Sensitivity } from '../../../employee/models/timeline';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { reducer } from '../../../shared/reducers/index';
import { AddDocumentToDistribute } from './add-document-to-distribute.component';
import { CommonModule, LocationStrategy, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from '../../../atlas-elements/atlas-elements.module';
import { RouterModule, ActivatedRoute, Router, RouterOutletMap, UrlSegment } from '@angular/router';
import { LocalizationModule, LocaleService, InjectorRef, TranslationService } from 'angular-l10n';
import { FileUploadModule } from 'ng2-file-upload';
import { AtlasSharedModule } from '../../../shared/atlas-shared.module';
import { CkEditorModule } from '../../../atlas-elements/ck-editor/ck-editor.module';
import { StoreModule, Store } from '@ngrx/store';
import { routes } from '../../document.routes';
import { SharedDocumentsContainerComponent } from '../../containers/shared-documents-container/shared-documents-container.component';
import { DocumentInformationbarComponent } from '../../components/document-informationbar/document-informationbar.component';
import { CompanyDocumentsDistributedComponent } from '../../components/company-documents-distributed/company-documents-distributed.component';
import { PersonalDocumentsComponent } from '../../components/personal-documents/personal-documents.component';
import { UsefuldocumentsDistributedComponent } from '../../components/usefuldocuments-distributed/usefuldocuments-distributed.component';
import { DocumentActionConfirmComponent } from '../../components/document-action-confirm/document-action-confirm.component';
import { DocumentDetailsComponent } from '../../components/document-details/document-details.component';
import { AddPersonalDocumentComponent } from '../../components/add-personal-document/add-personal-document.component';
import { Http } from '@angular/http';
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
import { DocumentDetailsServiceStub } from '../../../shared/testing/mocks/document-details-service-stub';
import { RouteParamsMock } from '../../../shared/testing/mocks/route-params-mock';
import { mockHttpProvider } from '../../../shared/testing/mocks/http-stub';
import * as fromRoot from '../../../shared/reducers';
import { InformationBarService } from '../../../document/services/information-bar-service';
import { FileUploadService } from '../../../shared/services/file-upload.service';
import { MessengerService } from '../../../shared/services/messenger.service';
import { DocumentService } from '../../../document/services/document-service';
import { DraftDocumentRouteResolve } from '../../../document/services/draft-document-route-resolver';
import { OtcEntityDataService } from '../../../document/services/otc-data.service';
import { RouterOutletMapStub } from '../../../shared/testing/mocks/router-outlet-stub';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DocumentsMockStoreProviderFactory } from '../../../shared/testing/mocks/documents-moc-store-provider-factory';
import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { LoadDocumentInformationBarSpecificStatCompleteAction, LoadDocumentInformationBarCompleteAction } from '../../../document/actions/information-bar-actions';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { tick } from '@angular/core/testing';
import { FormBuilderService } from '../../../shared/services/form-builder.service';
import { DocumentCategoryService } from '../../../document/services/document-category-service';
import { DocumentListContainerComponent } from '../../containers/document-list-container/document-list-container.component';
import { DocumentCategory } from '../../../document/models/document-category';
import { Site } from '../../../calendar/model/calendar-models';
import { LoadApplicableSitesCompleteAction, LoadAuthorizedDocumentCategoriesComplete } from '../../../shared/actions/user.actions';
import { SearchEmployees } from '../../../document/actions/shared-documents.actions';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { FileResult } from '../../../atlas-elements/common/models/file-result';
import { addDays } from 'date-fns';
import { DocumentSignatureViewComponent } from '../../../document/document-shared/components/document-signature-view/document-signature-view.component';

let messageAssertFun = function (component: AddDocumentToDistribute, fixture: ComponentFixture<AddDocumentToDistribute>, folderName: string, isDistributable: boolean = true) {
    expect(component.uploadDocFolder).toEqual(folderName);
    let catInfo = fixture.debugElement.query(By.css('.slideout-msg div')).nativeElement.innerText;
    let canDistributeInfo = fixture.debugElement.query(By.css('.slideout-msg span')).nativeElement.innerText;
    expect(catInfo).toEqual("DOCUMENT_CATEGORY_INFO");
    if (isDistributable) {
        expect(canDistributeInfo).toEqual("DOCUMENT_CANBE_DISTRIBUTE");
    } else {
        expect(canDistributeInfo).toEqual("DOCUMENT_CANT_DISTRIBUTE");
    }
}

describe('Add Document Component', () => {
    let component: AddDocumentToDistribute;
    let fixture: ComponentFixture<AddDocumentToDistribute>;
    let store: Store<fromRoot.State>;
    let dispatchSpy: jasmine.Spy;

    let breadCumServiceStub: any;
    let localeServiceStub: any;
    let translationServiceStub: any;
    let localizationConfigStub: any;
    let routerMock: any;
    let activatedRouteStub: any;
    let claimsHelperServiceStub: any
    let routeParamsStub: any;
    let http: any;
    let informationBarServiceStub: any;
    let fileUploadServiceStub: any;
    let messengerServiceStub: any;
    let documentServiceStub: any;
    let otcEntityDataServiceStub: any;
    let draftDocumentRouteResolveStub: any;

    let mockDocumentCategories: DocumentCategory[];
    let mockSites: Site[]

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
                , FormBuilderService
                , DocumentCategoryService
                , DatePipe
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
                , { provide: Router, useClass: RouterMock }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
                , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
                , { provide: RouteParams, useClass: RouteParamsMock }
                , { provide: Http, useValue: mockHttpProvider }
                , { provide: InformationBarService, useValue: jasmine.createSpyObj('informationBarServiceStub', ['GetTheSelectedTabRoute']) }
                , { provide: FileUploadService, useValue: fileUploadServiceStub }
                , { provide: MessengerService, useValue: jasmine.createSpyObj('messengerServiceStub', ['publish']) }
                , { provide: DocumentService, useValue: jasmine.createSpyObj('documentServiceStub', ['loadPersonalDocuments']) }
                , { provide: OtcEntityDataService, useValue: jasmine.createSpyObj('otcEntityDataServiceStub', ['loadOtcEntities']) }
                , { provide: DraftDocumentRouteResolve, useValue: jasmine.createSpyObj('draftDocumentRouteResolveStub', ['resolve']) }
                , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
                , LocationStrategy
            ]
        }).overrideComponent(AddDocumentToDistribute, { set: { host: { "(click)": "dummy" } } })
            .compileComponents();
    }));


    beforeEach(() => {

        fixture = TestBed.createComponent(AddDocumentToDistribute);
        component = fixture.componentInstance;
        component.Action = 'Add';
        store = fixture.debugElement.injector.get(Store);
        dispatchSpy = spyOn(store, 'dispatch');
        breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
        localeServiceStub = fixture.debugElement.injector.get(LocaleService);
        translationServiceStub = fixture.debugElement.injector.get(TranslationService);
        localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
        routerMock = fixture.debugElement.injector.get(Router);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);

        routeParamsStub = fixture.debugElement.injector.get(RouteParams);
        http = fixture.debugElement.injector.get(Http);
        claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
        informationBarServiceStub = TestBed.get(InformationBarService);
        fileUploadServiceStub = fixture.debugElement.injector.get(FileUploadService);
        messengerServiceStub = TestBed.get(MessengerService);
        documentServiceStub = TestBed.get(DocumentService);
        otcEntityDataServiceStub = TestBed.get(OtcEntityDataService);
        draftDocumentRouteResolveStub = TestBed.get(DraftDocumentRouteResolve);
        mockDocumentCategories = DocumentsMockStoreProviderFactory.getDocumentCategories();
        mockSites = DocumentsMockStoreProviderFactory.getSites();
        component.id = 'addDocumentToDistribute';

        component.name = 'addDocumentToDistribute';
        fixture.detectChanges();


    });

    describe('Component launch', () => {

        it('should launch add document component', fakeAsync(() => {
            expect(component).toBeTruthy();
        }));
    });

    describe('Verifying the fields', () => {
        beforeEach(fakeAsync(() => {
            dispatchSpy.and.callThrough();
            store.dispatch(new LoadApplicableSitesCompleteAction(mockSites));
            store.dispatch(new LoadAuthorizedDocumentCategoriesComplete(mockDocumentCategories));
            tick(100);
            fixture.detectChanges();

        }));
        it('Title should be input type and non manadatory field', fakeAsync(() => {
            let titleControl = fixture.debugElement.query(By.css('#txtTitle'));
            expect(component.documentForm.controls['Title'].validator).toBeNull();
            expect(titleControl.componentInstance.constructor.name).toEqual('AeInputComponent');
        }));

        it('By default it should display Please select in the category field', () => {
            let doccategoryDropDown = fixture.debugElement.nativeElement.querySelector('#DocumentCategoryId');
            expect(doccategoryDropDown).toBeDefined();
            let dropdownValue = component.documentForm.get('Category').value;
            expect(dropdownValue).toEqual('');
        });

        it('Document category should be dropdown type and manadatory field', fakeAsync(() => {
            let categoryControl = fixture.debugElement.query(By.css('#DocumentCategoryId'));
            expect(component.documentForm.controls['Category'].validator).toBeDefined();
            expect(categoryControl.componentInstance.constructor.name).toEqual('AeSelectComponent');
        }));

        it('Verifying the options in Document category dropdown type', () => {
            let categoryControl = fixture.debugElement.query(By.css('#DocumentCategoryId')).nativeElement;
            expect(categoryControl.options.length).toEqual(25);
            expect(categoryControl.options[0].innerText).toEqual("PLEASE_SELECT");
            expect(categoryControl.options[1].innerText).toEqual("COSHH");
            expect(categoryControl.options[2].innerText).toEqual("Checklists");
            expect(categoryControl.options[3].innerText).toEqual("Company policies");
            expect(categoryControl.options[4].innerText).toEqual("Compliance certificates");
            expect(categoryControl.options[5].innerText).toEqual("Construction phase plans");
            expect(categoryControl.options[6].innerText).toEqual("Contracts");
            expect(categoryControl.options[7].innerText).toEqual("DBS");
            expect(categoryControl.options[8].innerText).toEqual("Disciplinary");
            expect(categoryControl.options[9].innerText).toEqual("Emails");
            expect(categoryControl.options[10].innerText).toEqual("Files");
            expect(categoryControl.options[11].innerText).toEqual("Fire risk assessments");
            expect(categoryControl.options[12].innerText).toEqual("General");
            expect(categoryControl.options[13].innerText).toEqual("Grievance");
            expect(categoryControl.options[14].innerText).toEqual("Incident logs");
            expect(categoryControl.options[15].innerText).toEqual("Leaver");
            expect(categoryControl.options[16].innerText).toEqual("Method statements");
            expect(categoryControl.options[17].innerText).toEqual("New Starter");
            expect(categoryControl.options[18].innerText).toEqual("Other");
            expect(categoryControl.options[19].innerText).toEqual("Performance");
            expect(categoryControl.options[20].innerText).toEqual("Performance reviews");
            expect(categoryControl.options[21].innerText).toEqual("Personal Documents");
            expect(categoryControl.options[22].innerText).toEqual("Risk assessments");
            expect(categoryControl.options[23].innerText).toEqual("Scanned Document");
            expect(categoryControl.options[24].innerText).toEqual("Training Certificates");
        });


        it('Should display Site field based on selected category and display Please select by default', fakeAsync(() => {
            component.documentForm.get('Category').setValue('1cfb7f5d-e768-47cf-9d0a-f8b65dd274bd');
            fixture.detectChanges();
            let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
            expect(siteControl).not.toBeNull();

            expect(siteControl.componentInstance.constructor.name).toEqual('AeSelectComponent');
            expect(component.documentForm.controls['DocumentSite'].value).toEqual('');
        }));


        it('Site field should have equal number of options as number of sites', fakeAsync(() => {
            component.documentForm.get('Category').setValue('1cfb7f5d-e768-47cf-9d0a-f8b65dd274bd');
            fixture.detectChanges();
            let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
            expect(siteControl.nativeElement.options.length).toEqual(mockSites.length + 1);
        }));

        it('Should have employee field when Contract option selected from category dropdown', () => {
            component.documentForm.get('Category').setValue('c1d1fc6f-3073-4de2-9938-00d91c65e421');
            fixture.detectChanges();
            let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
            expect(employeeControl.componentInstance.constructor.name).toEqual('AeInputComponent');
            expect(employeeControl).not.toBeNull();
        });

        it('Should have a file upload button', () => {
            let uploadControl = fixture.debugElement.query(By.css('#fileUpload'));
            expect(uploadControl.componentInstance.constructor.name).toEqual('AeFileComponent');
            expect(uploadControl).toBeDefined();
        });

        it('should display `Description and Notes` Fields when a file uploaded', () => {
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

        it('Should have a Document expiry date field', () => {
            let dateControl = fixture.debugElement.query(By.css('#expiry-date'));
            expect(dateControl.componentInstance.constructor.name).toEqual('AeDatetimePickerComponent');
            expect(dateControl).not.toBeNull()
        });

        it('When expiry date is selected, Is notification required before expiry? field should be displayed and defaults to off mode ', () => {
            component.documentForm.get('ExpiryDate').setValue(new Date());
            component.isValidDate(true);
            fixture.detectChanges();
            let notificationControl = fixture.debugElement.query(By.css('#reminder'));
            expect(notificationControl).not.toBeNull();
            expect(notificationControl.componentInstance.constructor.name).toEqual('AeSwitchComponent');
            expect(notificationControl.componentInstance.value).toBeFalsy();
        });

        it('Should display Notification before expiry date filed when sliding to yes from Is notification required before expiry? field', () => {
            component.documentForm.get('ExpiryDate').setValue(new Date());
            component.isValidDate(true);
            fixture.detectChanges();
            component.documentForm.get('IsReminderRequired').setValue(true);
            fixture.detectChanges();
            let reminderControl = fixture.debugElement.query(By.css('#remainderInDays'));
            expect(reminderControl).not.toBeNull();
            expect(reminderControl.componentInstance.constructor.name).toEqual('AeInputComponent');
        });

        describe('Verifying Hover over texts', () => {
            beforeEach(fakeAsync(() => {
                component.documentForm.get('Category').setValue('1cfb7f5d-e768-47cf-9d0a-f8b65dd274bd');
                component.documentForm.get('ExpiryDate').setValue(new Date());
                component.isValidDate(true);
                component.documentForm.get('IsReminderRequired').setValue(true);
                fixture.detectChanges();
            }));

            it('Verifying Hover over text for Title, Document category, Site, Is notification required before expiry? and Notification before expiry date fields', fakeAsync(() => {
                let titleIcon = fixture.debugElement.query(By.css('#addDocumentToDistribute_AeIcon_1')).nativeElement;

                let categoryIcon = fixture.debugElement.query(By.css('#addDocumentToDistribute_AeIcon_2')).nativeElement;
                let siteIcon = fixture.debugElement.query(By.css('#addDocumentToDistribute_AeIcon_3')).nativeElement;
                let notificationIcon = fixture.debugElement.query(By.css('#addDocumentToDistribute_AeIcon_4')).nativeElement;
                let reminderIcon = fixture.debugElement.query(By.css('#addDocumentToDistribute_AeIcon_5')).nativeElement;

                expect(titleIcon.title).toEqual('TITLE_HELP');
                expect(categoryIcon.title).toEqual('DOCUMENT_CATEGORY_HELP');

                expect(siteIcon.title).toEqual('SITE_HELP');
                expect(notificationIcon.title).toEqual('IS_NOTIFICATION_HELP');
                expect(reminderIcon.title).toEqual('DOCUMENT_EXPIRY_NOTIFICATION_TEXT_HELP');

            }));

        });

        it('slide out form should have add button', () => {

            let addButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#addDocumentToDistribute_AeAnchor_1');
            expect(addButton.innerText).toContain('ADD');
            expect(addButton).toBeDefined();
        });

        it('should have close button and on click emit event to close slideout', () => {
            let closebtnSpy = spyOn(component, 'onAddCancel');
            let closeBtn = <HTMLElement>fixture.debugElement.query(By.css('.so-panel__footer'))
                .queryAll(By.css('li'))[0]
                .query(By.css('label.button.button--inline-block')).nativeElement;
            expect(closeBtn).toBeDefined();
            closeBtn.click();
            fixture.detectChanges();
            expect(closebtnSpy).toHaveBeenCalled();
        });

        it('Verify whether user is able to click on "Add" button or not', () => {
            let addbtnSpy = spyOn(component, 'onAddFormSubmit');
            let title = component.documentForm.controls['Title'];
            title.setValue('test document');
            component.documentForm.markAsDirty();
            let addButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#addDocumentToDistribute_AeAnchor_1');
            addButton.click();
            fixture.detectChanges();
            expect(addbtnSpy).toHaveBeenCalled();
        });

        it('should raise required field error on form submit when data doesnot provided in mandatory fields', () => {
            let title = component.documentForm.controls['Title'];
            title.setValue('test document');
            component.documentForm.markAsDirty();
            component.onAddFormSubmit();
            fixture.detectChanges();
            let categoryErrorField = fixture.debugElement.query(By.css('#categoryRequiredError')).nativeElement;
            let fileErrorField = fixture.debugElement.query(By.css('#fileRequiredError')).nativeElement;
            expect(categoryErrorField.innerText).toEqual("DOCUMENT_CATEGORY IS_REQUIRED");
            expect(fileErrorField.innerText).toEqual("FILE_REQUIRED_ERROR_MESSAGE");
        });

        it('should raise required field error when category of DBS is selected and Employee value is not provided', () => {
            let title = component.documentForm.controls['Title'];
            title.setValue('test document');
            component.documentForm.get('Category').setValue('2d6fbaad-6f0f-428f-a178-c36b46293b31');
            component.onAddFormSubmit();
            fixture.detectChanges();
            let employeeMandatoryField = fixture.debugElement.query(By.css('#employeeRequiredError')).nativeElement;
            expect(employeeMandatoryField.innerText).toEqual("EMPLOYEE_LABEL IS_REQUIRED");
        });

        it('should raise required field error when category of FRA is selected and Site value is not provided', () => {
            let title = component.documentForm.controls['Title'];
            title.setValue('test document');
            component.documentForm.get('Category').setValue('dacfebcb-dd4e-481a-9d1f-b9cd4a15e418');
            component.onAddFormSubmit();
            fixture.detectChanges();
            let siteMandatoryField = fixture.debugElement.query(By.css('#siteRequiredError')).nativeElement;
            expect(siteMandatoryField.innerText).toEqual("Site IS_REQUIRED");
        });

        describe('Verifying expiry date related validations', () => {
            beforeEach(fakeAsync(() => {
                component.documentForm.get('Category').setValue('1cfb7f5d-e768-47cf-9d0a-f8b65dd274bd');
                component.documentForm.get('ExpiryDate').setValue(addDays(new Date(), 1));
                component.isValidDate(true);
                component.documentForm.get('IsReminderRequired').setValue(true);
                fixture.detectChanges();
            }));

            it('Should display validation message at "Notification before expiry date" field when days less than the days difference between current and expiry dates', () => {
                component.documentForm.controls['ReminderInDays'].setValue(3);
                fixture.detectChanges();
                let reminderError = fixture.debugElement.query(By.css('#reminderError')).nativeElement;
                expect(component.showerrorMessage).toBeTruthy();
                expect(component.showReminderInDaysField).toBeTruthy();
                expect(reminderError.innerText).toEqual(component.errorMessage);
            });

            it('Should not display validation message at "Notification before expiry date" field when provided days more than the days difference between current and expiry dates', () => {
                component.documentForm.controls['ReminderInDays'].setValue(1);
                fixture.detectChanges();
                let reminderError = fixture.debugElement.query(By.css('#reminderError'));
                expect(component.showerrorMessage).toBeFalsy();
                expect(component.showReminderInDaysField).toBeTruthy();
                expect(reminderError).toBeNull();
            });

        });

        describe('Based on category selected, verify the message to be displayed below category field and visibility of site dropdown', () => {

            describe("Should display required fields", () => {

                it('When selected Incident Logs category - Verify message and should have only Site field ', () => {
                    component.documentForm.get('Category').setValue('1cfb7f5d-e768-47cf-9d0a-f8b65dd274bd');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "H&S document suite");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    expect(siteControl).not.toBeNull();
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).toBeNull();
                });

                it('When selected Checklist category - Verify message and should have only Site field ', () => {
                    component.documentForm.get('Category').setValue('bb11937f-c468-473c-a502-4453c57384d8');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "H&S document suite");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).toBeNull();
                    expect(siteControl).not.toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).toBeNull();
                });

                it('When selected Construction Phase Plans category - Verify message and should have only Site field ', () => {
                    component.documentForm.get('Category').setValue('c25d1771-9210-4e70-a33f-fe9596e4262a');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "H&S document suite");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).toBeNull();
                    expect(siteControl).not.toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).toBeNull();
                });

                it('When selected Method Statements category - Verify message and should have only Site field ', () => {
                    component.documentForm.get('Category').setValue('83924bee-f983-4bfe-94c3-8ecab3217b44');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "H&S document suite");

                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).toBeNull();
                    expect(siteControl).not.toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).toBeNull();
                });

                it('When selected Risk Assessment category - Verify message and should have only Site field ', () => {
                    component.documentForm.get('Category').setValue('eda29884-02b7-4540-b547-f41f5a7051a6');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "H&S document suite");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).toBeNull();
                    expect(siteControl).not.toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).toBeNull();
                });

                it('When selected COSHH category - Verify message and should  have only Site field ', () => {
                    component.documentForm.get('Category').setValue('b31f3870-6048-4c06-94ec-8f2dcb238f3a');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "H&S document suite");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).toBeNull();
                    expect(siteControl).not.toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).toBeNull();
                });
                it('When selected Company policies category - Verify message and should have only Site field ', () => {
                    component.documentForm.get('Category').setValue("9f38bdb8-df3a-4f16-8c3c-7cea2f0e8c8a");
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "Company policies");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).toBeNull();
                    expect(siteControl).not.toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).toBeNull();
                });
                it('When selected Fire risk assessment category - Verify message and should have Site field ', () => {
                    component.documentForm.get('Category').setValue("dacfebcb-dd4e-481a-9d1f-b9cd4a15e418");
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "H&S document suite");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).toBeNull();
                    expect(siteControl).not.toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).toBeNull();
                });

                it('When selected Other category - verify message and should not have site, employee and sensitive fields', () => {
                    component.documentForm.get('Category').setValue('0dfafbe4-db13-4289-a20d-68f087dc491b');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "Other");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).toBeNull();
                    expect(siteControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).toBeNull();
                });

                it('When selected Compliance Certificates category - Verify message and should not have site, employee and sensitive fields ', () => {
                    component.documentForm.get('Category').setValue('b19cc380-558e-49ad-a631-0f657644f03d');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "Other");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).toBeNull();
                    expect(siteControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).toBeNull();
                });

                it('When selected Contracts category - Verify message and should not have site, employee and sensitive fields ', () => {
                    component.documentForm.get('Category').setValue('c1d1fc6f-3073-4de2-9938-00d91c65e421');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "Starters & leavers");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).not.toBeNull();
                    expect(siteControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).toBeNull();
                });

                it('When selected DBS category - Verify message and should not have site, employee and sensitive fields ', () => {
                    component.documentForm.get('Category').setValue('2d6fbaad-6f0f-428f-a178-c36b46293b31');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "Other");

                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).not.toBeNull();
                    expect(siteControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).toBeNull();
                });

                it('When selected Emails category - Verify message and should not have site, employee and sensitive fields ', () => {
                    component.documentForm.get('Category').setValue('d7810525-d190-4d4c-880f-86b154eec6b2');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "Other");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).toBeNull();
                    expect(siteControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).toBeNull();
                });

                it('When selected File category - Verify message and should not have site, employee and sensitive fields ', () => {
                    component.documentForm.get('Category').setValue('c0afd827-f9e7-44c8-9189-572efccadcf8');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "Other");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).toBeNull();
                    expect(siteControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).toBeNull();
                });

                it('When selected Disciplinary category - Verify message and should have employee and sensitive as sensitive by default ', () => {
                    component.documentForm.get('Category').setValue('f288a642-153e-412f-ae21-5008b74e3607');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "Disciplinaries & grievances");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).not.toBeNull();
                    expect(siteControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).not.toBeNull();
                    expect(sensitiveControl.componentInstance.value).toEqual(Sensitivity.Sensitive);
                });

                it('When selected General category - Verify message and should have employee and sensitive as basic by default ', () => {
                    component.documentForm.get('Category').setValue('9f9f9b82-81a4-4158-87af-64d4a62fe935');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "General");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).not.toBeNull();
                    expect(siteControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).not.toBeNull();
                    expect(sensitiveControl.componentInstance.value).toEqual(Sensitivity.Basic);
                });

                it('When selected Grievance category - Verify message and should have employee and sensitive as sensitive by default ', () => {
                    component.documentForm.get('Category').setValue('76051ed8-de8f-44ac-8aeb-415c63a2338b');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "Disciplinaries & grievances");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).not.toBeNull();
                    expect(siteControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).not.toBeNull();
                    expect(sensitiveControl.componentInstance.value).toEqual(Sensitivity.Sensitive);
                });

                it('When selected Leaver category - Verify message and should have employee and sensitive as basic by default ', () => {
                    component.documentForm.get('Category').setValue('8b15270a-74d2-45c5-8584-0be9b1ee81b6');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "Starters & leavers");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).not.toBeNull();
                    expect(siteControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).not.toBeNull();
                    expect(sensitiveControl.componentInstance.value).toEqual(Sensitivity.Basic);
                });

                it('When selected New Starter category - Verify message and should have employee and sensitive as basic by default ', () => {
                    component.documentForm.get('Category').setValue('4e5b17d7-cf3d-4a40-9d9e-061c5a355620');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "Starters & leavers");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).not.toBeNull();
                    expect(siteControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).not.toBeNull();
                    expect(sensitiveControl.componentInstance.value).toEqual(Sensitivity.Basic);
                });

                it('When selected Performance category - Verify message and should have employee and sensitive as advance by default ', () => {
                    component.documentForm.get('Category').setValue('b5af21a7-20d1-4930-b33b-9fdf145307f3');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "Appraisal & reviews");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).not.toBeNull();
                    expect(siteControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).not.toBeNull();
                    expect(sensitiveControl.componentInstance.value).toEqual(Sensitivity.Advance);
                });

                it('When selected Performance reviews category - Verify message and should have employee and sensitive as advance by default ', () => {
                    component.documentForm.get('Category').setValue('91ec134f-c806-423d-b3bb-169ef9f257d7');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "Appraisal & reviews");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).not.toBeNull();
                    expect(siteControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).not.toBeNull();
                    expect(sensitiveControl.componentInstance.value).toEqual(Sensitivity.Advance);
                });

                it('When selected Personal Documents category - Verify message and should have employee and sensitive as sensitive by default ', () => {
                    component.documentForm.get('Category').setValue('920d8c4e-3fe0-4814-b76f-012059feaec4');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "General", false);
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).not.toBeNull();
                    expect(employeeControl.componentInstance.value).toEqual('user name');
                    expect(siteControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).not.toBeNull();
                    expect(sensitiveControl.componentInstance.value).toEqual(Sensitivity.Sensitive);
                });

                it('When selected Scanned Document category - Verify message and should have employee and sensitive as basic by default ', () => {
                    component.documentForm.get('Category').setValue('4c4ccb1f-5701-4f0c-ae15-ee8d5903e7dc');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "Other");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).not.toBeNull();
                    expect(siteControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).not.toBeNull();
                    expect(sensitiveControl.componentInstance.value).toEqual(Sensitivity.Basic);
                });

                it('When selected Training Certificates category - Verify message and should have employee and sensitive as basic by default ', () => {
                    component.documentForm.get('Category').setValue('65a57257-59d5-493a-aa48-b97b22787a06');
                    fixture.detectChanges();
                    messageAssertFun(component, fixture, "Training");
                    let siteControl = fixture.debugElement.query(By.css('#DocumentSiteId'));
                    let employeeControl = fixture.debugElement.query(By.css('#addDocumentToDistribute_employeeSelected_1'));
                    expect(employeeControl).not.toBeNull();
                    expect(employeeControl.componentInstance.value).toEqual('');
                    expect(siteControl).toBeNull();
                    let sensitiveControl = fixture.debugElement.query(By.css('#sensitivity'));
                    expect(sensitiveControl).not.toBeNull();
                    expect(sensitiveControl.componentInstance.value).toEqual(Sensitivity.Basic);
                });
            });
        });
    });
});

