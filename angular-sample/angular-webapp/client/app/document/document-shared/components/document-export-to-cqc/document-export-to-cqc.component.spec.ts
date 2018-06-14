import { DocumentExporttocqcComponent } from "../../../../document/document-shared/components/document-export-to-cqc/document-export-to-cqc.component";
import { ComponentFixture, async, TestBed, fakeAsync, tick } from "@angular/core/testing";
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
import { CompanyCQCPurchasedDetailsByIdAction, CompanyCQCPurchasedDetailsByIdCompleteAction } from "../../../../shared/actions/company.actions";
import { MockStoreCompanyDocuments } from "../../../../shared/testing/mocks/mock-store-company-documents";
import { MockStoreProviderFactory } from "../../../../shared/testing/mocks/mock-store-provider-factory";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";
import { AeSelectComponent } from "../../../../atlas-elements/ae-select/ae-select.component";
import { CQCPolicyCheckBySiteIdCompleteAction, LoadCQCStandardsBySiteIdCompleteAction, LoadCQCCategoriesBySiteIdCompleteAction, LoadCQCUsersBySiteIdCompleteAction, LoadCQCFiletypesBySiteIdAction, LoadCQCFiletypesBySiteIdCompleteAction } from "../../../../document/document-details/actions/document-export-to-cqc.actions";
import { CQCStandards, CQCCategories } from "../../../../document/document-details/models/export-to-cqc-model";
import { AeSelectItem } from "../../../../atlas-elements/common/models/ae-select-item";
import * as Immutable from 'immutable';
import { DocumentsMockStoreforCQCandDistribute } from "../../../../shared/testing/mocks/mock-store-provider-CQC-distribute-doc";
import { extractCQCStandardsData, extractCQCCategoriesData, extractCQCSelectOptionListData } from '../../../../document/document-details/common/document-export-to-cqc-helper';

describe('Document export to cqc component', () => {
    let component: DocumentExporttocqcComponent;
    let fixture: ComponentFixture<DocumentExporttocqcComponent>;
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
    let docDetailServiceDispatchSpy: any;
    let docDetailServiceLoadDetailSpy: any;
    let claimsCanDistributeAnyDoc: any;
    let claimsHelperServiceStub: any;
    let routeParamsStub: any;
    let docDetailServiceRemoveSpy: jasmine.Spy;
    let docDetailService: any;
    let docCategoryService: any;
    let locationService: any;
    let datePipe: any;
    let mockDocumentData: any;
    let CQCCategories: any;
    let CQCStandards: any;
    let CQCUsers: any;
    let CQCFileTypes: any;
    let CQCPolicyCheck: any;
    let documentExporttocqcServiceStub: any;

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
                , { provide: Router, useValue: routerStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
                , { provide: DocumentExporttocqcService, useValue: jasmine.createSpyObj('documentExporttocqcServiceStub', ['validCQCReference']) }
                , FormBuilderService
            ]
        }).overrideComponent(DocumentUpdateComponent, { set: { host: { "(click)": "dummy" } } })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DocumentExporttocqcComponent);
        component = fixture.componentInstance;
        store = fixture.debugElement.injector.get(Store);
        localeServiceStub = fixture.debugElement.injector.get(LocaleService);
        translationServiceStub = fixture.debugElement.injector.get(TranslationService);
        localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
        documentExporttocqcServiceStub = TestBed.get(DocumentExporttocqcService);
        dispatchSpy = spyOn(store, 'dispatch');
        dispatchSpy.and.callThrough();
        store.dispatch(new CompanyCQCPurchasedDetailsByIdCompleteAction({
            IsCQCProPurchased: true,
            Sites: [{
                IsCQCProPurchased: true,
                Id: 'f86ce3d4-8160-4bdb-9e24-a7b5f9ed7a44',
                SiteNameAndPostcode: 'Main Site - APB786'
            }]
        }));
        mockDocumentData = MockStoreProviderFactory.getDocumentMockData();
        component.DocumentDetails = mockDocumentData;
        CQCCategories = extractCQCCategoriesData(DocumentsMockStoreforCQCandDistribute.getCQCCategories());
        CQCStandards = extractCQCStandardsData(DocumentsMockStoreforCQCandDistribute.getCQCStandards());
        CQCUsers = extractCQCSelectOptionListData(DocumentsMockStoreforCQCandDistribute.getCQCUsersBySiteId());
        CQCFileTypes = extractCQCSelectOptionListData(DocumentsMockStoreforCQCandDistribute.getCQCFileTypes());
        CQCPolicyCheck = DocumentsMockStoreforCQCandDistribute.getCQCPolicyCheckBySiteId();
        component.id = "docExportToCQC";
        component.name = "docExportToCQC";
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
        fixture.detectChanges();
    });

    it('component must be launched', () => {
        expect(component).toBeTruthy();
    });

    it('slide out should be as per atlas design - field labels', () => {
        let slideOutTitle = fixture.debugElement.query(By.css('.so-panel__title')).nativeElement;
        let siteLable = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_label_0')).nativeElement;
        let referenceLable = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_label_1')).nativeElement;
        let fileTypeLable = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_label_2')).nativeElement;
        let titleLable = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_label_3')).nativeElement;
        let fileNameLable = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_label_4')).nativeElement;
        let descriptionLable = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_label_5')).nativeElement;
        let cqcuserLable = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_label_6')).nativeElement;
        let expiryDateLable = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_label_7')).nativeElement;
        expect(slideOutTitle.innerText).toBeDefined();
        expect(siteLable.innerText).toBeDefined();
        expect(referenceLable.innerText).toBeDefined();
        expect(fileTypeLable.innerText).toBeDefined();
        expect(titleLable.innerText).toBeDefined();
        expect(fileNameLable.innerText).toBeDefined();
        expect(descriptionLable.innerText).toBeDefined();
        expect(cqcuserLable.innerText).toBeDefined();
        expect(expiryDateLable.innerText).toBeDefined();

        expect(slideOutTitle.innerText).toContain('CQC_PRO_TITLE');
        expect(siteLable.innerText).toEqual('Site *');
        expect(referenceLable.innerText).toEqual('Reference *');
        expect(fileTypeLable.innerText).toEqual('File type');
        expect(titleLable.innerText).toEqual('Title *');
        expect(fileNameLable.innerText).toEqual('File name');
        expect(descriptionLable.innerText).toEqual('Description');
        expect(cqcuserLable.innerText).toEqual('CQC pro care user *');
        expect(expiryDateLable.innerText).toEqual('Expiry date *');
    });

    describe('verify fields', () => {

        it('Site field should be mandatory and verify field options', () => {
            let siteDropDown = <AeSelectComponent<string>>fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeSelect_0')).nativeElement;
            expect(siteDropDown.options[0].innerText).toEqual("Please select");
            expect(siteDropDown.options[1].innerText).toEqual("Main Site - APB786");
            let isSiteFieldMandatory = component.fields.find(f => f.field.name === 'SiteId').context.getContextData().get('required');
            expect(isSiteFieldMandatory).toBeTruthy();
        });

        it('Title field value should be of minimum 5 charcters length', () => {
            let CQCuserFieldMandatory = component.fields.find(f => f.field.name === 'Title').context.getContextData().get('minlength');
            expect(CQCuserFieldMandatory).toEqual(5);
        });

        describe('Reference field', () => {
            it('should be mandatory field', () => {
                let isReferenceFieldMandatory = component.fields.find(f => f.field.name === 'Reference').context.getContextData().get('required');
                expect(isReferenceFieldMandatory).toBeTruthy();
            });
            it('value length should be minimum of 5 characters  and maximum of 50 characters', () => {
                let referenceFieldMinLength = component.fields.find(f => f.field.name === 'Reference').context.getContextData().get('minlength');
                let referenceFieldMaxLength = component.fields.find(f => f.field.name === 'Reference').context.getContextData().get('maxlength');
                expect(referenceFieldMinLength).toEqual(5);
                expect(referenceFieldMaxLength).toEqual(50);
            });

        });

        it('File type field should be of type drop down', () => {
            let fileTypefield = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeSelect_2')).nativeElement;
            expect(fileTypefield instanceof HTMLSelectElement).toBeTruthy();
        });

        it('Title field should be mandatory', () => {
            let titleField = component.fields.find(f => f.field.name === 'Title').context.getContextData().get('required');
            expect(titleField).toBeTruthy();
        });

        it('document file name should be dispalyed in File name field', () => {
            let fileNameField = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_label_4')).nativeElement;
            expect(fileNameField).toBeDefined();
            let fileNameValue = component.fields.find(f => f.field.name == 'PolicyFile').context.getContextData().get('displayValue');
            fileNameValue.subscribe(val => {
                expect(val).toEqual(mockDocumentData.FileName);
            });
        });

        it('CQC pro care user field should be mandatory', () => {
            let CQCuserFieldMandatory = component.fields.find(f => f.field.name === 'OwnerId').context.getContextData().get('required');
            expect(CQCuserFieldMandatory).toBeTruthy();
        });

        it('Expiry Date field should be mandatoory', () => {
            let CQCuserFieldMandatory = component.fields.find(f => f.field.name === 'ExpiryDate').context.getContextData().get('required');
            expect(CQCuserFieldMandatory).toBeTruthy();
        });
    });

    it('should show calendar when clicked on expiry date field', () => {
        let expiryDateFieldValue = <HTMLElement>fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeDateTimePicker_7_ae-input_3')).nativeElement;
        expiryDateFieldValue.dispatchEvent(new Event('focus'));
        fixture.detectChanges();
        let datePicker = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeDateTimePicker_7_div_2')).nativeElement;
        expect(datePicker).toBeDefined();
    });

    describe('verifying fields when site is selected', () => {
        beforeEach(fakeAsync(() => {
            store.dispatch(new LoadCQCFiletypesBySiteIdCompleteAction(CQCFileTypes));
            store.dispatch(new CQCPolicyCheckBySiteIdCompleteAction(CQCPolicyCheck));
            store.dispatch(new LoadCQCStandardsBySiteIdCompleteAction(CQCStandards));
            store.dispatch(new LoadCQCCategoriesBySiteIdCompleteAction(CQCCategories));
            store.dispatch(new LoadCQCUsersBySiteIdCompleteAction(CQCUsers));
            let siteDropDown = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeSelect_0'));
            siteDropDown.componentInstance.value = 'f86ce3d4-8160-4bdb-9e24-a7b5f9ed7a44';
            siteDropDown.componentInstance.onChange();
            tick(100);
            fixture.detectChanges();
        }));

        it('should display available file types', fakeAsync(() => {
            let dropDown = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeSelect_2'));
            dropDown.componentInstance.value = 94;
            dropDown.componentInstance.onChange();
            fixture.detectChanges();
            component.cqcFileTypes$.subscribe((files) => {
                expect(files.toList().size).toEqual(CQCFileTypes.toList().size);
            });
        }));

        it('should display available CQC users of that site', () => {
            let dropDown = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeSelect_6'));
            dropDown.nativeElement.click();
            fixture.detectChanges();
            component.cqcUsers$.subscribe((users) => {
                expect(users.toList().size).toEqual(CQCUsers.toList().size);
            });
        });

        it('should display CQC standards', () => {
            let standards = fixture.debugElement.query(By.css('#docExportToCQC_form_2')).children[0].children[0].nativeElement;
            expect(standards).toBeDefined();
        });

        describe('verifying CQC standards', () => {

            it('all standard check boxes must be unchecked by default', () => {
                let standardchkBox1 = fixture.debugElement.query(By.css('#standard0_iChkBox')).componentInstance;
                let standardchkBox2 = fixture.debugElement.query(By.css('#standard1_iChkBox')).componentInstance;
                let standardchkBox3 = fixture.debugElement.query(By.css('#standard2_iChkBox')).componentInstance;
                let standardchkBox4 = fixture.debugElement.query(By.css('#standard3_iChkBox')).componentInstance;
                let standardchkBox5 = fixture.debugElement.query(By.css('#standard4_iChkBox')).componentInstance;
                let standardchkBox6 = fixture.debugElement.query(By.css('#standard5_iChkBox')).componentInstance;

                expect(standardchkBox1.value).toBeFalsy();
                expect(standardchkBox2.value).toBeFalsy();
                expect(standardchkBox3.value).toBeFalsy();
                expect(standardchkBox4.value).toBeFalsy();
                expect(standardchkBox5.value).toBeFalsy();
                expect(standardchkBox6.value).toBeFalsy();
            });

            it('verify standards data', () => {
                let standardchkBox1 = fixture.debugElement.query(By.css('#standard0')).children[1].nativeElement;
                let standardchkBox2 = fixture.debugElement.query(By.css('#standard1')).children[1].nativeElement;
                let standardchkBox3 = fixture.debugElement.query(By.css('#standard2')).children[1].nativeElement;
                let standardchkBox4 = fixture.debugElement.query(By.css('#standard3')).children[1].nativeElement;
                let standardchkBox5 = fixture.debugElement.query(By.css('#standard4')).children[1].nativeElement;
                let standardchkBox6 = fixture.debugElement.query(By.css('#standard5')).children[1].nativeElement;

                expect(standardchkBox1.innerText).toEqual(CQCStandards[0].Title);
                expect(standardchkBox2.innerText).toEqual(CQCStandards[1].Title);
                expect(standardchkBox3.innerText).toEqual(CQCStandards[2].Title);
                expect(standardchkBox4.innerText).toEqual(CQCStandards[3].Title);
                expect(standardchkBox5.innerText).toEqual(CQCStandards[4].Title);
                expect(standardchkBox6.innerText).toEqual(CQCStandards[5].Title);
            });
        });

        it('should display CQC categories', () => {
            let categories = fixture.debugElement.query(By.css('#docExportToCQC_form_2')).children[0].children[1].nativeElement;
            expect(categories).toBeDefined();
        });

        describe('verifying CQC categories', () => {

            it('all categories check boxes must be unchecked by default', () => {
                let categoryChkBox1 = fixture.debugElement.query(By.css('#category0_iChkBox')).componentInstance;
                let categoryChkBox2 = fixture.debugElement.query(By.css('#category1_iChkBox')).componentInstance;
                let categoryChkBox3 = fixture.debugElement.query(By.css('#category2_iChkBox')).componentInstance;

                expect(categoryChkBox1.value).toBeFalsy();
                expect(categoryChkBox2.value).toBeFalsy();
                expect(categoryChkBox3.value).toBeFalsy();
            });

            it('verify categories data', () => {
                let categoryChkBox1 = fixture.debugElement.query(By.css('#category0')).children[1].nativeElement;
                let categoryChkBox2 = fixture.debugElement.query(By.css('#category1')).children[1].nativeElement;
                let categoryChkBox3 = fixture.debugElement.query(By.css('#category2')).children[1].nativeElement;

                expect(categoryChkBox1.innerText).toEqual(CQCCategories[0].CatName);
                expect(categoryChkBox2.innerText).toEqual(CQCCategories[1].CatName);
                expect(categoryChkBox3.innerText).toEqual(CQCCategories[2].CatName);
            });

        });
    });

    describe('verify validations', () => {

        it('should display site required error when not selected any site', () => {
            let siteDropDown = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeSelect_0'));
            siteDropDown.componentInstance.value = 'f86ce3d4-8160-4bdb-9e24-a7b5f9ed7a44';
            siteDropDown.componentInstance.onChange();
            fixture.detectChanges();
            siteDropDown.componentInstance.value = '';
            siteDropDown.componentInstance.onChange();
            fixture.detectChanges();
            let validationMessage = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeSelect_ErrorSpan_0')).nativeElement;
            expect(validationMessage.innerText).toEqual('Site is required');
        });

        it('should display Refernce required validation message when value is cleared in Reference field', () => {
            component.addUpdateExportToCQCProForm.get('Reference').markAsTouched();
            component.addUpdateExportToCQCProForm.get('Reference').markAsDirty();
            component.addUpdateExportToCQCProForm.get('Reference').setValue('');
            fixture.detectChanges();
            let validationMessage = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeInput_ErrorSpan_1')).nativeElement;
            expect(validationMessage.innerText).toEqual('Reference is required');
        });

        it('should display help text when entered value in reference name field is less than 5 charcters', () => {
            component.addUpdateExportToCQCProForm.get('Reference').markAsTouched();
            component.addUpdateExportToCQCProForm.get('Reference').markAsDirty();
            component.addUpdateExportToCQCProForm.get('Reference').setValue("test");
            fixture.detectChanges();
            let validationMessage = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeInput_ErrorSpan_1')).nativeElement;
            expect(validationMessage.innerText).toEqual('At least 5 characters in length');
        });

        it('should display Title required validation message when value is cleared in Title field', () => {
            component.addUpdateExportToCQCProForm.get('Title').markAsTouched();
            component.addUpdateExportToCQCProForm.get('Title').markAsDirty();
            component.addUpdateExportToCQCProForm.get('Title').setValue('');
            fixture.detectChanges();
            let validationMessage = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeInput_ErrorSpan_3')).nativeElement;
            expect(validationMessage.innerText).toEqual('Title is required');
        });

        it('should display help text when entered value in Title field is less than 5 charcters', () => {
            component.addUpdateExportToCQCProForm.get('Title').markAsTouched();
            component.addUpdateExportToCQCProForm.get('Title').markAsDirty();
            component.addUpdateExportToCQCProForm.get('Title').setValue("CQC");
            fixture.detectChanges();
            let validationMessage = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeInput_ErrorSpan_3')).nativeElement;
            expect(validationMessage.innerText).toEqual('At least 5 characters in length');
        });

        it('should display CQC pro care user validation message when not selected any user', () => {
            store.dispatch(new LoadCQCUsersBySiteIdCompleteAction(CQCUsers));
            let siteDropDown = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeSelect_0'));
            siteDropDown.componentInstance.value = 'f86ce3d4-8160-4bdb-9e24-a7b5f9ed7a44';
            siteDropDown.componentInstance.onChange();
            component.addUpdateExportToCQCProForm.get('Reference').setValue('testing');
            component.addUpdateExportToCQCProForm.get('Title').setValue('CQC slideout');
            let userDropDown = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeSelect_6'));
            component.addUpdateExportToCQCProForm.get('ExpiryDate').setValue(new Date());
            userDropDown.componentInstance.onChange();
            fixture.detectChanges();
            let errorMessage = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeSelect_ErrorSpan_6')).nativeElement;
            expect(errorMessage.innerText).toEqual("CQC pro care user is required");
        });

        it('should display expiry date validation message when selected date is less than the current date', () => {
            let date = new Date();
            date.setDate(date.getDate() - 1);
            component.addUpdateExportToCQCProForm.get('ExpiryDate').markAsTouched();
            component.addUpdateExportToCQCProForm.get('ExpiryDate').markAsDirty();
            component.addUpdateExportToCQCProForm.get('ExpiryDate').setValue(date);
            fixture.detectChanges();
            let validationMessage = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeDateTimePicker_ErrorSpan_7')).nativeElement;
            expect(validationMessage.innerText).toEqual('Should be greater than or equals to today');
        });

    });

    it('should have Close and Attach buttons', () => {
        let attachButton = fixture.debugElement.query(By.css('#docExportToCQC_AeAnchor_1')).nativeElement;
        let closeButton = <HTMLElement>fixture.debugElement.query(By.css('.so-panel__footer'))
            .queryAll(By.css('li'))[0]
            .query(By.css('label.button.button--inline-block')).nativeElement;
        expect(attachButton).toBeDefined();
        expect(closeButton).toBeDefined();
    });

    it('should emit close event when close button was clicked', () => {
        spyOn(component, 'onCancel').and.callThrough();
        spyOn(component._onCQCCancel, 'emit');
        let closeButton = <HTMLButtonElement>fixture.debugElement.query(By.css('.so-panel__footer'))
            .queryAll(By.css('li'))[0]
            .query(By.css('label.button.button--inline-block')).nativeElement;
        closeButton.click();
        expect(component.onCancel).toHaveBeenCalled();
        expect(component._onCQCCancel.emit).toHaveBeenCalled();
    });

    it('`Attach` button should be disabled when mandatory fields are not filled', () => {
        let attachButton = fixture.debugElement.query(By.css('#docExportToCQC_AeAnchor_1')).componentInstance;
        expect(attachButton.disabledAnc).toBeTruthy();
    });

    it('`Attach` button should be enabled when all the mandatory fields were filled`', () => {
        spyOn(component, 'onSubmit').and.callThrough();
        spyOn(component._onCQCSubmit, 'emit');
        store.dispatch(new LoadCQCStandardsBySiteIdCompleteAction(CQCStandards));
        store.dispatch(new LoadCQCCategoriesBySiteIdCompleteAction(CQCCategories));
        store.dispatch(new LoadCQCUsersBySiteIdCompleteAction(CQCUsers));
        store.dispatch(new LoadCQCFiletypesBySiteIdCompleteAction(CQCFileTypes));
        let siteDropDown = fixture.debugElement.query(By.css('#addUpdateExportToCQCProForm_AeSelect_0'));
        siteDropDown.componentInstance.value = 'f86ce3d4-8160-4bdb-9e24-a7b5f9ed7a44';
        siteDropDown.componentInstance.onChange();
        component.addUpdateExportToCQCProForm.get('Reference').setValue('SOVLTC');
        component.addUpdateExportToCQCProForm.get('Title').setValue('CQC slideout');
        let expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 1);
        component.addUpdateExportToCQCProForm.get('ExpiryDate').setValue(expiryDate);
        component.addUpdateExportToCQCProForm.get('FileTypeId').setValue(94);
        component.addUpdateExportToCQCProForm.get('OwnerId').setValue(38);
        fixture.detectChanges();
        let standardchkBox1 = fixture.debugElement.query(By.css('#standard0_iChkBox'));
        standardchkBox1.nativeElement.click();
        fixture.detectChanges();
        let attachButton = fixture.debugElement.query(By.css('#docExportToCQC_AeAnchor_1'));
        expect(attachButton.componentInstance.disabledAnc).toBeFalsy();
        attachButton.nativeElement.click();
        fixture.detectChanges();
        expect(component.onSubmit).toHaveBeenCalled();
        expect(component._onCQCSubmit.emit).toHaveBeenCalled();
    });
});