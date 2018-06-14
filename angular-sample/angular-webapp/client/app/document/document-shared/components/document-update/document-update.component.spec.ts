import { DocumentExporttocqcComponent } from "../../../../document/document-shared/components/document-export-to-cqc/document-export-to-cqc.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { RouterMock } from "../../../../shared/testing/mocks/router-stub";
import { CommonModule, DatePipe } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { AtlasElementsModule } from "../../../../atlas-elements/atlas-elements.module";
import { AtlasSharedModule } from "../../../../shared/atlas-shared.module";
import { RouterModule, ActivatedRoute, Router, RouterOutletMap } from "@angular/router";
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from "angular-l10n";
import { CkEditorModule } from "../../../../atlas-elements/ck-editor/ck-editor.module";
import { DocumentUploadComponent } from "../../../../document/document-shared/components/document-upload/document-upload.component";
import { ContractDistributeActionComponent } from "../../../../document/document-shared/components/contract-distribute-action/contract-distribute-action.component";
import { DocumentContentReviewComponent } from "../../../../document/document-shared/components/document-content-review/document-content-review.component";
import { DocumentSelectorComponent } from "../../../../document/document-shared/components/document-selector/document-selector.component";
import { DocumentReviewDistributeComponenet } from "../../../../document/document-shared/components/document-review-distribute/document-review-distribute.component";
import { BlockCheckedPipe } from "../../../../document/common/block-checked.pipe";
import { DocumentUpdateComponent } from "../../../../document/document-shared/components/document-update/document-update.component";
import { LocalizationConfig } from "../../../../shared/localization-config";
import { DocumentDetailsService } from "../../../../document/document-details/services/document-details.service";
import { DocumentExporttocqcService } from "../../../../document/document-details/services/document-export-to-cqc.service";
import { StoreModule, Store } from '@ngrx/store';
import { BreadcrumbService } from "../../../../atlas-elements/common/services/breadcrumb-service";
import { ClaimsHelperService } from "../../../../shared/helpers/claims-helper";
import { DocumentCategoryService } from "../../../../document/services/document-category-service";
import { RouteParams } from "../../../../shared/services/route-params";
import { BreadcrumbServiceStub } from "../../../../shared/testing/mocks/breadcrumb-service-mock";
import { LocaleServiceStub } from "../../../../shared/testing/mocks/locale-service-stub";
import { LocationStrategyStub } from "../../../../shared/testing/mocks/location-strategy-stub";
import { TranslationServiceStub } from "../../../../shared/testing/mocks/translation-service-stub";
import { LocalizationConfigStub } from "../../../../shared/testing/mocks/localization-config-stub";
import { Observable } from "rxjs/Observable";
import { DocumentExporttocqcServiceStub } from "../../../../shared/testing/mocks/document-export-to-cqc-service-stub";
import { FormBuilderService } from "../../../../shared/services/form-builder.service";
import { EmployeeSearchService } from "../../../../employee/services/employee-search.service";
import { MessengerService } from "../../../../shared/services/messenger.service";
import { DocumentCategoryServiceStub } from "../../../../shared/testing/mocks/document-category-service-stub";
import { RouterOutletMapStub } from "../../../../shared/testing/mocks/router-outlet-stub";
import { RouteParamsMock } from "../../../../shared/testing/mocks/route-params-mock";
import { ClaimsHelperServiceStub } from "../../../../shared/testing/mocks/claims-helper-service-mock";
import { reducer } from "../../../../shared/reducers/index";
import { MockStoreProviderFactory } from "../../../../shared/testing/mocks/mock-store-provider-factory";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";
import { DocumentsMockStoreProviderFactory } from "../../../../shared/testing/mocks/documents-moc-store-provider-factory";
import * as Immutable from 'immutable';
import { extractDocumentCategorySelectItems } from "../../../../document/company-documents/common/company-document-extract-helper";
import { RestClientService } from "../../../../shared/data/rest-client.service";
import { DocumentArea } from "../../../../document/models/document-area";
import { DocumentCategory } from "../../../../document/models/document-category";
import { MockStoreProviderUser } from "../../../../shared/testing/mocks/mock-store-provider-user";
import { DocumentCategoryEnum } from "../../../../document/models/document-category-enum";
import { fakeAsync } from "@angular/core/testing";
import { tick } from "@angular/core/testing";
import { LoadAllDepartmentsAction, LoadSitesAction, LoadSitesCompleteAction } from './../../../../shared/actions/company.actions';
import { AeFormComponent } from "../../../../atlas-elements/ae-form/ae-form.component";
import { DebugElement } from "@angular/core";
import { AeSelectComponent } from "../../../../atlas-elements/ae-select/ae-select.component";
import { AeSelectItem } from "../../../../atlas-elements/common/models/ae-select-item";
import { AeAutocompleteComponent } from "../../../../atlas-elements/ae-autocomplete/ae-autocomplete.component";
import { MockStoreCompanyDocuments } from "../../../../shared/testing/mocks/mock-store-company-documents";
import { Sensitivity } from '../../../../shared/models/sensitivity';

describe('Document update component', () => {
    let component: DocumentUpdateComponent;
    let fixture: ComponentFixture<DocumentUpdateComponent>;
    let store: any;
    let breadCumServiceStub: any;
    let localeServiceStub: any;
    let translationServiceStub: any;
    let localizationConfigStub: any;
    let routerMock: RouterMock;
    let activatedRouteStub: any;
    let dispatchSpy: any;
    let items = [];
    let routerStub: any;
    let claimsHelperServiceStub: any;
    let datePipe: any;
    let mockDocumentCategories: any;
    let mockDocumentData: any;
    let mockSites: any;
    let mockEmployees: any;
    let employeeSearchServiceStub: any;

    beforeEach(async(() => {
        routerStub = new RouterMock();

        TestBed.configureTestingModule({
            imports: [
                CommonModule
                , ReactiveFormsModule
                , AtlasElementsModule
                , AtlasSharedModule
                , RouterModule.forChild([])
                , LocalizationModule
                , CkEditorModule
                , StoreModule.provideStore(reducer)
                , BrowserAnimationsModule
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
            ],
            providers: [
                InjectorRef,
                BreadcrumbService
                , DatePipe
                , DocumentCategoryService
                , { provide: EmployeeSearchService, useValue: jasmine.createSpyObj('employeeSearchServiceStub', ['getEmployeesKeyValuePair']) }
                , { provide: Router, useValue: routerStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
                , { provide: DocumentExporttocqcService, useClass: DocumentExporttocqcServiceStub }
                , { provide: RouteParams, useClass: RouteParamsMock }
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceMock', ['']) }
                , { provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceStub', ['canManageEmployeeSensitiveDetails', 'CanManageEmployeeAdvanceeDetails']) }
                , FormBuilderService
            ]
        }).overrideComponent(DocumentUpdateComponent, { set: { host: { "(click)": "dummy" } } })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DocumentUpdateComponent);
        component = fixture.componentInstance;
        store = fixture.debugElement.injector.get(Store);
        localeServiceStub = fixture.debugElement.injector.get(LocaleService);
        translationServiceStub = fixture.debugElement.injector.get(TranslationService);
        localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
        dispatchSpy = spyOn(store, 'dispatch');
        dispatchSpy.and.callThrough();
        mockDocumentCategories = MockStoreProviderUser.getDocumentCategories().filter(d => d.DocumentArea === DocumentArea.DocumentLibrary);
        component.documentCategories = MockStoreCompanyDocuments.getOtherFolderDocumentCategoriesToUpdate(mockDocumentCategories);
        mockDocumentData = MockStoreCompanyDocuments.getMockOtherDocumentData();
        mockEmployees = MockStoreCompanyDocuments.getEmployeesData();
        component.document = mockDocumentData;
        component.id = "updateDocumentDetails";
        component.name = "updateDocumentDetails";
        employeeSearchServiceStub = TestBed.get(EmployeeSearchService);
        claimsHelperServiceStub = TestBed.get(ClaimsHelperService);
        claimsHelperServiceStub.canManageEmployeeSensitiveDetails.and.returnValue(true);
        mockSites = DocumentsMockStoreProviderFactory.getSites();
        datePipe = fixture.debugElement.injector.get(DatePipe);
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;

        fixture.detectChanges();
    });

    beforeEach(() => {
        employeeSearchServiceStub.getEmployeesKeyValuePair.and.returnValue(Observable.of(mockEmployees));
        component.onFormInit(component.documentUpdateForm);
        dispatchSpy.and.callThrough();
        store.dispatch(new LoadSitesCompleteAction(mockSites));
    });

    it('component must be launched', () => {
        expect(component).toBeTruthy();
    });

    it('fileds should be displayed as per atlas design', () => {
        let slideTitle = fixture.debugElement.query(By.css('.so-panel__title')).nativeElement;
        let title = fixture.debugElement.query(By.css('#updateDocumentForm_label_0')).nativeElement;
        let description = fixture.debugElement.query(By.css('#updateDocumentForm_label_1')).nativeElement;
        let notes = fixture.debugElement.query(By.css('#updateDocumentForm_label_2')).nativeElement;
        let expiryDate = fixture.debugElement.query(By.css('#updateDocumentForm_label_3')).nativeElement;
        let category = fixture.debugElement.query(By.css('#updateDocumentForm_label_6')).nativeElement;
        expect(slideTitle.innerText).toContain("DOCUMENT_UPDATE.UPDATE");
        expect(title.innerText).toEqual("Title *");
        expect(description.innerText).toEqual("Description");
        expect(notes.innerText).toEqual("Notes");
        expect(expiryDate.innerText).toEqual("ExpiryDate");
        expect(category.innerText).toEqual("Category *");
    });

    describe('verifying fields data', () => {

        it('should display document details data in respective fields', () => {
            let titleFieldValue = fixture.debugElement.query(By.css('#updateDocumentForm_AeInput_0')).nativeElement;
            let descriptionFieldValue = fixture.debugElement.query(By.css('#updateDocumentForm_AeTextArea_1')).nativeElement;
            let notesFieldValue = fixture.debugElement.query(By.css('#updateDocumentForm_AeTextArea_2')).nativeElement;
            let expiryDateFieldValue = fixture.debugElement.query(By.css('#updateDocumentForm_AeDateTimePicker_3_ae-input_3')).nativeElement;
            let categoryFieldValue = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_6')).nativeElement;
            let documentExpiryDate = datePipe.transform(mockDocumentData.ExpiryDate, 'dd/MM/yyyy');

            expect(titleFieldValue).toBeDefined();
            expect(descriptionFieldValue).toBeDefined();
            expect(notesFieldValue).toBeDefined();
            expect(expiryDateFieldValue).toBeDefined();
            expect(categoryFieldValue).toBeDefined();

            expect(titleFieldValue.value).toEqual(mockDocumentData.Title);
            expect(descriptionFieldValue.value).toEqual(mockDocumentData.Description);
            expect(notesFieldValue.value).toEqual(mockDocumentData.Comment);
            expect(expiryDateFieldValue.value).toEqual(documentExpiryDate);
        });

        it('Description Field value should not accept more than 500 characters', () => {
            let descriptionField = component.fields.filter(f => f.field.name === 'Description')[0].context.getContextData();
            let description = <HTMLTextAreaElement>fixture.debugElement.query(By.css('#updateDocumentForm_AeTextArea_1')).nativeElement;
            expect(descriptionField.get('maxlength')).toEqual(500);
            expect(descriptionField.get('showRemainingCharacterCount')).toBe(true);
        });

        it('Document category should be dropdown type', fakeAsync(() => {
            let categoryControl = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_6'));
            expect(categoryControl.componentInstance.constructor.name).toEqual('AeSelectComponent');
        }));

        it('Verifying the options in category dropdown', () => {
            let categoryControl = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_6')).nativeElement;
            expect(categoryControl.options[0].innerText).toEqual("Please select");
            expect(categoryControl.options[1].innerText).toEqual("COSHH");
            expect(categoryControl.options[2].innerText).toEqual("Care policies");
            expect(categoryControl.options[3].innerText).toEqual("Checklists");

            expect(categoryControl.options[4].innerText).toEqual("Company policies");
            expect(categoryControl.options[5].innerText).toEqual("Construction phase plans");
            expect(categoryControl.options[6].innerText).toEqual("Contracts");
            expect(categoryControl.options[7].innerText).toEqual("Disciplinary");
            expect(categoryControl.options[8].innerText).toEqual("Emails");
            expect(categoryControl.options[9].innerText).toEqual("Files");
            expect(categoryControl.options[10].innerText).toEqual("Fire risk assessments");
            expect(categoryControl.options[11].innerText).toEqual("General");
            expect(categoryControl.options[12].innerText).toEqual("Grievance");
            expect(categoryControl.options[13].innerText).toEqual("Incident logs");
            expect(categoryControl.options[14].innerText).toEqual("Leaver");
            expect(categoryControl.options[15].innerText).toEqual("Method statements");
            expect(categoryControl.options[16].innerText).toEqual("New starter");
            expect(categoryControl.options[17].innerText).toEqual("Other");

            expect(categoryControl.options[18].innerText).toEqual("Performance");
            expect(categoryControl.options[19].innerText).toEqual("Performance reviews");
            expect(categoryControl.options[20].innerText).toEqual("Personal documents");
            expect(categoryControl.options[21].innerText).toEqual("Risk assessments");
            expect(categoryControl.options[22].innerText).toEqual("Scanned documents");

            expect(categoryControl.options[23].innerText).toEqual("Training certificates");

        });
    });

    describe('Verifying fields when value changes', () => {

        it('Description Field value should show remaining characters count', () => {
            let descriptionField = component.fields.filter(f => f.field.name === 'Description')[0].context.getContextData();
            let description = <HTMLTextAreaElement>fixture.debugElement.query(By.css('#updateDocumentForm_AeTextArea_1')).nativeElement;
            description.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            expect(descriptionField.get('showRemainingCharacterCount')).toBe(true);
        });

        it('should show calendar when clicked on expiry date field', () => {
            let expiryDateFieldValue = <HTMLElement>fixture.debugElement.query(By.css('#updateDocumentForm_AeDateTimePicker_3_ae-input_3')).nativeElement;
            expiryDateFieldValue.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            let datePicker = fixture.debugElement.query(By.css('#updateDocumentForm_AeDateTimePicker_3_div_6')).nativeElement;
            expect(datePicker).toBeDefined();
        });

        it('should show `Is reminder required` Field when clicked on Expiry date field', () => {
            let expiryDateFieldValue = <HTMLElement>fixture.debugElement.query(By.css('#updateDocumentForm_AeDateTimePicker_3_ae-input_3')).nativeElement;
            expiryDateFieldValue.dispatchEvent(new Event('blur'));
            fixture.detectChanges();
            let notification = fixture.debugElement.query(By.css('#updateDocumentForm_AeSwitch_4')).nativeElement;
            expect(notification).toBeDefined();
        });

        it('should show `Reminder in days field` when reminder is set to true', fakeAsync(() => {
            let expiryDateFieldValue = <HTMLElement>fixture.debugElement.query(By.css('#updateDocumentForm_AeDateTimePicker_3_ae-input_3')).nativeElement;
            let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;
            expiryDateFieldValue.dispatchEvent(new Event('blur'));
            fixture.detectChanges();
            let notification = fixture.debugElement.query(By.css('#updateDocumentForm_AeSwitch_4')).nativeElement;
            notification.click();
            tick(100);
            fixture.detectChanges();
            let reminderInDaysField = <HTMLElement>fixture.debugElement.query(By.css('#updateDocumentForm_AeInput_5')).nativeElement;
            expect(reminderInDaysField).toBeDefined();
        }));

        describe('in category drop down', () => {

            it('when selected COSHH category - Folder location field and Site field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.COSHH;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let siteField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_8')).nativeElement;
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                expect(folderLocatonField).toBeDefined();
                expect(folderLocatonField.innerText).toContain('DOCUMENT_CATEGORY_INFO');
                component.siteFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(siteField).toBeDefined();
            });

            it('when selected Care policies category - Folder location field and Site field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.CarePolicies;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let siteField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_8')).nativeElement;
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                expect(folderLocatonField).toBeDefined();
                component.siteFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(siteField).toBeDefined();
            });

            it('when selected CheckList category - Folder location field and Site field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.CheckList;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let siteField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_8')).nativeElement;
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                expect(folderLocatonField).toBeDefined();
                component.siteFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(siteField).toBeDefined();
            });

            it('when selected Company policies category - Folder location field and Site field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.CompanyPolicies;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let siteField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_8')).nativeElement;
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                expect(folderLocatonField).toBeDefined();
                expect(folderLocatonField.innerText).toContain('DOCUMENT_CATEGORY_INFO');
                component.siteFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(siteField).toBeDefined();
            });

            it('when selected Construction Phase Plans category - Folder location field and Site field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.ConstructionPhasePlans;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let siteField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_8')).nativeElement;
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                expect(folderLocatonField).toBeDefined();
                component.siteFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(siteField).toBeDefined();
            });

            it('when selected Contract category - Folder location field and Employee field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.Contract;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let employeeField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_9')).nativeElement;
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                expect(folderLocatonField).toBeDefined();
                component.employeeFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(employeeField).toBeDefined();
            });

            it('when selected Disciplinary category - Folder location field,Employee field and Sensitivity field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.Disciplinary;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let employeeField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_9')).nativeElement;
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                let sensitivityField = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_10')).nativeElement;
                expect(sensitivityField).toBeDefined();
                expect(folderLocatonField).toBeDefined();
                component.employeeFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(employeeField).toBeDefined();
            });

            it('when selected Disciplinary category - Employee field and Sensitivity field should be mandatory', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.Disciplinary;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let employeeField = component.fields.filter(f => f.field.name === 'Employee')[0].context.getContextData().get('requiredValue');
                let sensitivityField = component.fields.filter(f => f.field.name === 'Sensitivity')[0].context.getContextData().get('required');
                let sensitivityValue = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_10')).componentInstance;
                expect(sensitivityValue.value).toEqual(Sensitivity.Sensitive);
                expect(employeeField).toBeTruthy();
                expect(sensitivityField).toBeTruthy();
            });

            it('when selected Emails category - Folder location field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.Emails;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                expect(folderLocatonField).toBeDefined();
                component.employeeFieldVisibility$.subscribe(val => {
                    expect(val).toBe(false);
                });
                component.siteFieldVisibility$.subscribe(val => {
                    expect(val).toBe(false);
                });
            });

            it('when selected Files category - Folder location field  should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.Uploads;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                expect(folderLocatonField).toBeDefined();
                component.employeeFieldVisibility$.subscribe(val => {
                    expect(val).toBe(false);
                });
                component.siteFieldVisibility$.subscribe(val => {
                    expect(val).toBe(false);
                });
            });

            it('when selected Fire Risk Assessment category - Folder location field and Site field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.FireRiskAssessment;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                expect(folderLocatonField).toBeDefined();
                let siteField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_8')).nativeElement;
                component.siteFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(siteField).toBeDefined();
            });

            it('when selected General category - Folder location field,Employee field and Sensitivity field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.General;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let employeeField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_9')).nativeElement;
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                let sensitivityField = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_10'));
                expect(folderLocatonField).toBeDefined();
                component.employeeFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(employeeField).toBeDefined();
                expect(sensitivityField).toBeDefined();
                expect(sensitivityField.componentInstance.value).toEqual(Sensitivity.Basic);
            });

            it('when selected Grievance category - Folder location field and Employee field and sensitivity field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.Grievance;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let employeeField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_9')).nativeElement;
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                let sensitivityField = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_10')).nativeElement;
                expect(sensitivityField).toBeDefined();
                expect(folderLocatonField).toBeDefined();
                component.employeeFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(employeeField).toBeDefined();
            });

            it('when selected Grievance category - Employee field and sensitivity field should be mandatory', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.Grievance;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let employeeField = component.fields.filter(f => f.field.name === 'Employee')[0].context.getContextData().get('requiredValue');
                let sensitivityField = component.fields.filter(f => f.field.name === 'Sensitivity')[0].context.getContextData().get('required');
                let sensitivityValue = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_10')).componentInstance;
                expect(employeeField).toBeTruthy();
                expect(sensitivityField).toBeTruthy();
                expect(sensitivityValue.value).toEqual(Sensitivity.Sensitive);
            });

            it('when selected Incident logs category - Folder location field and Site field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.AccidentLogs;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let siteField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_8')).nativeElement;
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                expect(folderLocatonField).toBeDefined();
                component.siteFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(siteField).toBeDefined();
            });

            it('when selected Leaver category - Folder location field, Employee field and sensitivity field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.Leaver;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let employeeField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_9')).nativeElement;
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                let sensitivityField = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_10')).nativeElement;
                expect(sensitivityField).toBeDefined();
                expect(folderLocatonField).toBeDefined();
                component.employeeFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(employeeField).toBeDefined();
            });

            it('when selected Leaver category - Employee field and sensitivity field should be mandatory', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.Leaver;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let employeeField = component.fields.filter(f => f.field.name === 'Employee')[0].context.getContextData().get('requiredValue');
                let sensitivityField = component.fields.filter(f => f.field.name === 'Sensitivity')[0].context.getContextData().get('required');
                let sensitivityValue = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_10')).componentInstance;
                expect(employeeField).toBeTruthy();
                expect(sensitivityField).toBeTruthy();
                expect(sensitivityValue.value).toEqual(Sensitivity.Basic);
            });


            it('when selected Method statements category - Folder location field and Site field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.MethodStatements;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let siteField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_8')).nativeElement;
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                expect(folderLocatonField).toBeDefined();
                component.siteFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(siteField).toBeDefined();
            });

            it('when selected New Starter category - Folder location field, Employee field and Sensitivity field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.NewStarter;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let employeeField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_9')).nativeElement;
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                let sensitivityField = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_10'));
                let isSensitivityFieldMandatory = component.fields.filter(f => f.field.name === 'Sensitivity')[0].context.getContextData().get('required');
                expect(sensitivityField.nativeElement).toBeDefined();
                expect(folderLocatonField).toBeDefined();
                component.employeeFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(employeeField).toBeDefined();
                expect(isSensitivityFieldMandatory).toBeTruthy();
                expect(sensitivityField.componentInstance.value).toEqual(Sensitivity.Basic);
            });

            it('when selected Other category - Folder location field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.Other;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                expect(folderLocatonField).toBeDefined();
                component.employeeFieldVisibility$.subscribe(val => {
                    expect(val).toBe(false);
                });
            });

            it('when selected Performance Reviews category - Folder location field and Employee field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.Appraisal;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let employeeField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_9')).nativeElement;
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                let sensitivityField = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_10')).nativeElement;
                expect(folderLocatonField).toBeDefined();
                component.employeeFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(employeeField).toBeDefined();
                expect(sensitivityField).toBeDefined();
            });

            it('when selected Performance Reviews category - Employee field and Sensitivity field should be mandatory', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.Appraisal;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let employeeField = component.fields.filter(f => f.field.name === 'Employee')[0].context.getContextData().get('requiredValue');
                let sensitivityField = component.fields.filter(f => f.field.name === 'Sensitivity')[0].context.getContextData().get('required');
                let sensitivityValue = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_10')).componentInstance;
                expect(employeeField).toBeTruthy();
                expect(sensitivityField).toBeTruthy();
                expect(sensitivityValue.value).toEqual(Sensitivity.Advance);
            });

            it('when selected Personal Documents category - Folder location field, Employee field and Sensitivity field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.PersonalDocuments;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let employeeField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_9')).nativeElement;
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                let sensitivityField = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_10')).nativeElement;
                expect(folderLocatonField).toBeDefined();
                component.employeeFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(employeeField).toBeDefined();
                expect(sensitivityField).toBeDefined();
            });

            it('when selected Personal Documents category - Employee field and Sensitivity field should be mandatory', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.PersonalDocuments;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let employeeField = component.fields.filter(f => f.field.name === 'Employee')[0].context.getContextData().get('requiredValue');
                let sensitivityField = component.fields.filter(f => f.field.name === 'Sensitivity')[0].context.getContextData().get('required');
                let sensitivityValue = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_10')).componentInstance;
                expect(employeeField).toBeTruthy();
                expect(sensitivityField).toBeTruthy();
                expect(sensitivityValue.value).toEqual(Sensitivity.Sensitive);
            });

            it('when selected Risk Assessments category - Folder location field and Site field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.RiskAssessment;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let siteField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_8')).nativeElement;
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                expect(folderLocatonField).toBeDefined();
                component.siteFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(siteField).toBeDefined();
            });

            it('when selected Scanned Documents category - Folder location field,Employee field and Sensitivity field should be visible', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = DocumentCategoryEnum.ScannedDocument;
                dropDown.componentInstance.onChange();
                fixture.debugElement.triggerEventHandler('click', null);
                fixture.detectChanges();
                let folderLocatonField = fixture.debugElement.query(By.css('.message')).nativeElement;
                let sensitivityField = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_10'));
                expect(folderLocatonField).toBeDefined();
                component.employeeFieldVisibility$.subscribe(val => {
                    expect(val).toBe(true);
                });
                expect(sensitivityField.nativeElement).toBeDefined();
                expect(sensitivityField.componentInstance.value).toEqual(Sensitivity.Basic);
            });
        });
    });

    it('verify options in the sensitivity drop down', () => {
        let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
        dropDown.componentInstance.value = DocumentCategoryEnum.ScannedDocument;
        dropDown.componentInstance.onChange();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        let sensitivityField = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_10'));
        sensitivityField.nativeElement.dispatchEvent(new Event('focus'));
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(sensitivityField.nativeElement.options[0].innerText).toEqual('Advanced');
        expect(sensitivityField.nativeElement.options[1].innerText).toEqual('Basic');
        expect(sensitivityField.nativeElement.options[2].innerText).toEqual('Sensitive');
    });

    it('sites list should be prepopulated in `Site` Field', () => {
        let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
        dropDown.componentInstance.value = DocumentCategoryEnum.RiskAssessment;
        dropDown.componentInstance.onChange();
        fixture.detectChanges();
        let siteField = fixture.debugElement.query(By.css('#updateDocumentForm_AeAutoComplete_8'));
        siteField.nativeElement.dispatchEvent(new Event('focus'));
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        let sitesloaded = new Array<any>();
        mockSites.forEach(site => {
            sitesloaded.push(site.Name);
        });
        let prePopulatedDropDown = fixture.debugElement.query(By.css('.ui-autocomplete-panel')).children[0].nativeElement;
        expect(prePopulatedDropDown).toBeDefined();
        expect(sitesloaded).toContain(prePopulatedDropDown.children.item(0).innerText);
    });

    it('should have tow items in the Employee field list', () => {
        let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
        dropDown.componentInstance.value = DocumentCategoryEnum.Appraisal;
        dropDown.componentInstance.onChange();
        fixture.detectChanges();
        let employeeField = <AeAutocompleteComponent<any>>fixture.debugElement.query(By.directive(AeAutocompleteComponent)).componentInstance;
        let event = { query: 'test' };
        employeeField.aeOnComplete.emit(event);
        fixture.detectChanges();
        expect(employeeField.items.length).toEqual(mockEmployees.length);
    });

    it('should display Close and Update Buttons', () => {
        let updateButton = fixture.debugElement.query(By.css('#updateDocumentForm_AeAnchor_1')).nativeElement;
        let closeButton = <HTMLElement>fixture.debugElement.query(By.css('.so-panel__footer'))
            .queryAll(By.css('li'))[0]
            .query(By.css('label.button.button--inline-block')).nativeElement;
        expect(updateButton).toBeDefined();
        expect(closeButton).toBeDefined();
        expect(updateButton.innerText).toEqual('UPDATE');
        expect(closeButton.innerText).toEqual('CLOSE');
    });

    it('should emit close event when close button was clicked', () => {
        spyOn(component, 'onCancel');
        let closeButton = <HTMLButtonElement>fixture.debugElement.query(By.css('.so-panel__footer'))
            .queryAll(By.css('li'))[0]
            .query(By.css('label.button.button--inline-block')).nativeElement;
        closeButton.click();
        expect(component.onCancel).toHaveBeenCalled();
    });

    it('should fire validations if value is not provided in mandatory fields', () => {
        component.documentUpdateForm.get('Title').setValue("");
        let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
        dropDown.componentInstance.value = null;
        dropDown.componentInstance.onChange();
        let updateButton = fixture.debugElement.query(By.css('#updateDocumentForm_AeAnchor_1')).nativeElement;
        updateButton.click();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        let titleRequiredError = fixture.debugElement.query(By.css('#updateDocumentForm_AeInput_ErrorSpan_0')).nativeElement;
        let categoryRequiredError = fixture.debugElement.query(By.css('#updateDocumentForm_AeSelect_ErrorSpan_6')).nativeElement;
        expect(titleRequiredError.innerText).toEqual("Title is required");
        expect(categoryRequiredError.innerText).toEqual("Category is required");
        expect(component.documentUpdateForm.valid).toBeFalsy();
    });

    it('should update details of the document when fields are provided with valid data', () => {
        spyOn(component, 'onSubmit')
        component.documentUpdateForm.get('Title').setValue("image 1234");
        let updateButton = fixture.debugElement.query(By.css('#updateDocumentForm_AeAnchor_1')).nativeElement;
        updateButton.click();
        expect(component.onSubmit).toHaveBeenCalled();
        expect(component.documentUpdateForm.valid).toBeTruthy();
    });
});