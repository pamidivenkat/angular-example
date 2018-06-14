import { DocumentExporttocqcComponent } from "../../../../document/document-shared/components/document-export-to-cqc/document-export-to-cqc.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { RouterMock } from "../../../../shared/testing/mocks/router-stub";
import { CommonModule, DatePipe } from "@angular/common";
import { ReactiveFormsModule, FormBuilder } from "@angular/forms";
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
import { StoreModule, Store } from '@ngrx/store';
import { BreadcrumbService } from "../../../../atlas-elements/common/services/breadcrumb-service";
import { ClaimsHelperService } from "../../../../shared/helpers/claims-helper";
import { RouteParams } from "../../../../shared/services/route-params";
import { BreadcrumbServiceStub } from "../../../../shared/testing/mocks/breadcrumb-service-mock";
import { LocaleServiceStub } from "../../../../shared/testing/mocks/locale-service-stub";
import { LocationStrategyStub } from "../../../../shared/testing/mocks/location-strategy-stub";
import { TranslationServiceStub } from "../../../../shared/testing/mocks/translation-service-stub";
import { LocalizationConfigStub } from "../../../../shared/testing/mocks/localization-config-stub";
import { Observable } from "rxjs/Observable";
import { EmployeeSearchService } from "../../../../employee/services/employee-search.service";
import { RouterOutletMapStub } from "../../../../shared/testing/mocks/router-outlet-stub";
import { RouteParamsMock } from "../../../../shared/testing/mocks/route-params-mock";
import { ClaimsHelperServiceStub } from "../../../../shared/testing/mocks/claims-helper-service-mock";
import { reducer } from "../../../../shared/reducers/index";
import { MockStoreCompanyDocuments } from "../../../../shared/testing/mocks/mock-store-company-documents";
import { MockStoreProviderFactory } from "../../../../shared/testing/mocks/mock-store-provider-factory";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";
import { AeSelectComponent } from "../../../../atlas-elements/ae-select/ae-select.component";
import { AeSelectItem } from "../../../../atlas-elements/common/models/ae-select-item";
import * as Immutable from 'immutable';
import { LoadSitesCompleteAction, LoadEmployeeGroupCompleteAction } from "../../../../shared/actions/company.actions";
import { DocumentsMockStoreforCQCandDistribute } from "../../../../shared/testing/mocks/mock-store-provider-CQC-distribute-doc";
import { LoadApplicableDepartmentsCompleteAction } from "../../../../shared/actions/user.actions";
import { AeAutocompleteComponent } from "../../../../atlas-elements/ae-autocomplete/ae-autocomplete.component";

describe('Document review distribute component', () => {
    let component: DocumentReviewDistributeComponenet;
    let fixture: ComponentFixture<DocumentReviewDistributeComponenet>;
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
    let routeParamsStub: any;
    let datePipe: any;
    let mockDocumentData: any;
    let employeeSearchServiceStub: any;
    let mockSites: any;
    let mockDepartments: any;
    let mockEmployeeGroups: any;
    let distributeButton: any;
    let mockEmployees: any;

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
                , { provide: EmployeeSearchService, useValue: jasmine.createSpyObj('employeeSearchServiceStub', ['getEmployeesKeyValuePair']) }
                , { provide: Router, useValue: routerStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
                , { provide: RouteParams, useClass: RouteParamsMock }
                , { provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceStub', ['canFullAssignedToShown']) }
                , FormBuilder
            ]
        }).overrideComponent(DocumentUpdateComponent, { set: { host: { "(click)": "dummy" } } })
            .compileComponents();
    }));

    describe('when document is not of shared document type then', () => {

        beforeEach(() => {
            fixture = TestBed.createComponent(DocumentReviewDistributeComponenet);
            component = fixture.componentInstance;
            store = fixture.debugElement.injector.get(Store);
            localeServiceStub = fixture.debugElement.injector.get(LocaleService);
            translationServiceStub = fixture.debugElement.injector.get(TranslationService);
            localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
            claimsHelperServiceStub = TestBed.get(ClaimsHelperService);
            employeeSearchServiceStub = TestBed.get(EmployeeSearchService);
            dispatchSpy = spyOn(store, 'dispatch');
            dispatchSpy.and.callThrough();
            mockDocumentData = DocumentsMockStoreforCQCandDistribute.getMockOtherDocumentData();
            component.name = "distributeDocument";
            component.id = "distributeDocumnet";
            component.DocumentType = 1;
            component.DocumentDetails = mockDocumentData;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
            fixture.detectChanges();
        });

        it('component must be launched', () => {
            expect(component).toBeTruthy();
        });

        it('should dipslay slideout title as distribute document', () => {
            fixture.detectChanges();
            let slideTitle = fixture.debugElement.query(By.css('.so-panel__title')).nativeElement;
            expect(slideTitle.innerText).toContain("DOC_DISTRIBUTION.DISTRIBUTE_DOCUMENT");
        });


        it('verifying field labels', () => {
            let filenameLabel = fixture.debugElement.query(By.css('.so-panel__content'))
                .query(By.css('.filter-bar__filters')).nativeElement.children[0].children[0];
            let categoryLabel = fixture.debugElement.query(By.css('.so-panel__content'))
                .query(By.css('.filter-bar__filters')).nativeElement.children[0].children[1];
            let documentActions = fixture.debugElement.query(By.css('.distribute-radio-group')).nativeElement;
            let distributeTo = fixture.debugElement.query(By.css('#documentDistributeForm')).nativeElement.children[0].children[2];
            expect(filenameLabel.innerText).toContain('DocumentDetails.FileName');
            expect(categoryLabel.innerText).toContain('DocumentDetails.Category');
            expect(documentActions.innerText).toContain('DOC_DISTRIBUTION.DOCUMENT_ACTONS');
            expect(distributeTo.innerText).toContain('DOC_DISTRIBUTION.DISTRIBUTE_TO');
        });
    });

    describe('when document is of shared document type then', () => {

        beforeEach(() => {
            fixture = TestBed.createComponent(DocumentReviewDistributeComponenet);
            component = fixture.componentInstance;
            store = fixture.debugElement.injector.get(Store);
            localeServiceStub = fixture.debugElement.injector.get(LocaleService);
            translationServiceStub = fixture.debugElement.injector.get(TranslationService);
            localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
            claimsHelperServiceStub = TestBed.get(ClaimsHelperService);
            employeeSearchServiceStub = TestBed.get(EmployeeSearchService);
            dispatchSpy = spyOn(store, 'dispatch');
            dispatchSpy.and.callThrough();
            mockDocumentData = DocumentsMockStoreforCQCandDistribute.getMockOtherDocumentData();
            component.name = "distributeDocument";
            component.id = "distributeDocumnet";
            component.DocumentType = 2;
            component.DocumentDetails = mockDocumentData;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
            fixture.detectChanges();
        });

        it('component must be launched', () => {
            expect(component).toBeTruthy();
        });

        it('should dipslay slideout title as distribute shared document', () => {
            fixture.detectChanges();
            let slideTitle = fixture.debugElement.query(By.css('.so-panel__title')).nativeElement;
            expect(slideTitle.innerText).toContain("DOC_DISTRIBUTION.DISTRIBUTE_SHARED_DOCUMENT");
        });

        it('verifying field labels', () => {
            let filenameLabel = fixture.debugElement.query(By.css('.so-panel__content'))
                .query(By.css('.filter-bar__filters')).nativeElement.children[0].children[0];
            let categoryLabel = fixture.debugElement.query(By.css('.so-panel__content'))
                .query(By.css('.filter-bar__filters')).nativeElement.children[0].children[1];
            let documentActions = fixture.debugElement.query(By.css('.distribute-radio-group')).nativeElement;
            let distributeTo = fixture.debugElement.query(By.css('#documentDistributeForm')).nativeElement.children[0].children[2];
            expect(filenameLabel.innerText).toContain('DocumentDetails.Title');
            expect(categoryLabel.innerText).toContain('DocumentDetails.Category');
            expect(documentActions.innerText).toContain('DOC_DISTRIBUTION.DOCUMENT_ACTONS');
            expect(distributeTo.innerText).toContain('DOC_DISTRIBUTION.DISTRIBUTE_TO');
        });
    });

    describe('slideout should be as per atlas design', () => {

        beforeEach(() => {
            fixture = TestBed.createComponent(DocumentReviewDistributeComponenet);
            component = fixture.componentInstance;
            store = fixture.debugElement.injector.get(Store);
            localeServiceStub = fixture.debugElement.injector.get(LocaleService);
            translationServiceStub = fixture.debugElement.injector.get(TranslationService);
            localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
            claimsHelperServiceStub = TestBed.get(ClaimsHelperService);
            employeeSearchServiceStub = TestBed.get(EmployeeSearchService);
            dispatchSpy = spyOn(store, 'dispatch');
            dispatchSpy.and.callThrough();
            mockSites = MockStoreProviderFactory.getTestSites();
            mockDepartments = DocumentsMockStoreforCQCandDistribute.getDepartments();
            mockEmployeeGroups = DocumentsMockStoreforCQCandDistribute.getEmployeeGroups();
            mockDocumentData = DocumentsMockStoreforCQCandDistribute.getMockOtherDocumentData();
            mockEmployees = MockStoreCompanyDocuments.getEmployeesData();
            store.dispatch(new LoadSitesCompleteAction(mockSites));
            store.dispatch(new LoadApplicableDepartmentsCompleteAction(mockDepartments));
            store.dispatch(new LoadEmployeeGroupCompleteAction(mockEmployeeGroups));
            claimsHelperServiceStub.canFullAssignedToShown.and.returnValue(true);
            employeeSearchServiceStub.getEmployeesKeyValuePair.and.returnValue(Observable.of(mockEmployees));
            component.name = "distributeDocument";
            component.id = "distributeDocumnet";
            component.DocumentType = 1;
            component.DocumentDetails = mockDocumentData;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
            fixture.detectChanges();
        });

        it('document actions field should contain three options of type radio buttons', () => {
            let radioButton1 = fixture.debugElement.query(By.css('#distributeDocumnet_AeRadioGroup_1_AeRadiobutton-distributeDocument_AeRadioGroup_0_0')).componentInstance;
            let radioButton2 = fixture.debugElement.query(By.css('#distributeDocumnet_AeRadioGroup_1_AeRadiobutton-distributeDocument_AeRadioGroup_1_1')).componentInstance;
            let radioButton3 = fixture.debugElement.query(By.css('#distributeDocumnet_AeRadioGroup_1_AeRadiobutton-distributeDocument_AeRadioGroup_2_2')).componentInstance;
            expect(radioButton1.text).toEqual('NoActionRequired');
            expect(radioButton2.text).toEqual('RequiresRead');
            expect(radioButton3.text).toEqual('RequiresSign');
        });

        it('All radio buttons must be unchecked by default', () => {
            let radioButton1 = fixture.debugElement.query(By.css('#distributeDocumnet_AeRadioGroup_1_AeRadiobutton-distributeDocument_AeRadioGroup_0_0')).componentInstance;
            let radioButton2 = fixture.debugElement.query(By.css('#distributeDocumnet_AeRadioGroup_1_AeRadiobutton-distributeDocument_AeRadioGroup_1_1')).componentInstance;
            let radioButton3 = fixture.debugElement.query(By.css('#distributeDocumnet_AeRadioGroup_1_AeRadiobutton-distributeDocument_AeRadioGroup_2_2')).componentInstance;
            expect(radioButton1.defaultValue).toBeNull();
            expect(radioButton2.defaultValue).toBeNull();
            expect(radioButton3.defaultValue).toBeNull();
        });

        it('should display information text regarding document distribution', () => {
            let informationtext = fixture.debugElement.query(By.css('#documentDistributeForm')).nativeElement.children[0].children[1];
            expect(informationtext.children[0].innerText).toContain('DOC_DISTRIBUTION.DISTRIBUTE_SLIDE_MSG_ONE');
            expect(informationtext.children[1].innerText).toContain('DOC_DISTRIBUTION.DISTRIBUTE_SLIDE_MSG_TWO');
            expect(informationtext.children[2].innerText).toContain('DOC_DISTRIBUTION.DISTRIBUTE_SLIDE_MSG_THREE');
        });

        it('verify field options in `Distribute to` dropdown', () => {
            let dropdown = fixture.debugElement.query(By.css('#ddlDistributeTo'));
            expect(dropdown.nativeElement.options[0].innerText).toEqual('PLEASE_SELECT');
            expect(dropdown.nativeElement.options[1].innerText).toEqual('All employees in the company');
            expect(dropdown.nativeElement.options[2].innerText).toEqual('Site');
            expect(dropdown.nativeElement.options[3].innerText).toEqual('Employee group');
            expect(dropdown.nativeElement.options[4].innerText).toEqual('Department or team');
            expect(dropdown.nativeElement.options[5].innerText).toEqual('Employee');
        });

        it('when `All employees in the company` option is selected then it should not display site or employee field', () => {
            let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
            dropDown.componentInstance.value = '1';
            dropDown.componentInstance.onChange();
            fixture.detectChanges();
            let siteOrEmployeeField = fixture.debugElement.query(By.css('#distributeDocumnet_employeeSelected_1'));
            expect(siteOrEmployeeField).toBeNull();
        });

        it('when `Site` option is selected then it should display Site field', () => {
            let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
            dropDown.componentInstance.value = '3';
            dropDown.componentInstance.onChange();
            fixture.detectChanges();
            let siteField = fixture.debugElement.query(By.css('#distributeDocumnet_employeeSelected_1')).nativeElement;
            expect(siteField).toBeDefined();
        });

        it('when `Employee group` option is selected then it should display Employee group field', () => {
            let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
            dropDown.componentInstance.value = '4018';
            dropDown.componentInstance.onChange();
            fixture.detectChanges();
            let employeeGroupField = fixture.debugElement.query(By.css('#distributeDocumnet_employeeSelected_1')).nativeElement;
            expect(employeeGroupField).toBeDefined();
        });

        it('when `Department or team` option is selected then it should display Department field', () => {
            let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
            dropDown.componentInstance.value = '4';
            dropDown.componentInstance.onChange();
            fixture.detectChanges();
            let departmentField = fixture.debugElement.query(By.css('#distributeDocumnet_employeeSelected_1')).nativeElement;
            expect(departmentField).toBeDefined();
        });

        it('when `Employee` option is selected then it should display Employee field', () => {
            let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
            dropDown.componentInstance.value = '17';
            dropDown.componentInstance.onChange();
            fixture.detectChanges();
            let employeeField = fixture.debugElement.query(By.css('#distributeDocumnet_employeeSelected_1')).nativeElement;
            expect(employeeField).toBeDefined();
        });

        describe('should fire validations on distribute button click', () => {
            beforeEach(() => {
                distributeButton = fixture.debugElement.query(By.css('#distributeDocumnet_AeAnchor_1')).nativeElement;
            });

            it('when no radio buttton is selected in document actions', () => {
                distributeButton.click();
                fixture.detectChanges();
                let errorMsg = fixture.debugElement.query(By.css('#documentDistributeForm')).nativeElement.children[0].children[0].children[1];
                expect(errorMsg.innerText).toContain('DOC_DISTRIBUTION.ACTION_REQUIRED');
            });

            it('when no option is selected in distribute to drop down', () => {
                distributeButton.click();
                fixture.detectChanges();
                let errorMsg = fixture.debugElement.query(By.css('#documentDistributeForm')).nativeElement.children[0].children[2].children[1];
                expect(errorMsg.innerText).toContain('DOC_DISTRIBUTION.DISTRIBUTE_TO_REQUIRED');
            });

            it('when `Site` option is selected and not provided value in site', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = '3';
                dropDown.componentInstance.onChange();
                fixture.detectChanges();
                distributeButton.click();
                fixture.detectChanges();
                let errorMsg = fixture.debugElement.query(By.css('#documentDistributeForm')).nativeElement.children[0].children[3].children[0];
                expect(errorMsg.innerText).toContain('DOC_DISTRIBUTION.DISTRIBUTE_TO_SITE_REQUIRED');
            });

            it('when `Employee group` option is selected and not provided value in Employee group field', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = '4018';
                dropDown.componentInstance.onChange();
                fixture.detectChanges();
                distributeButton.click();
                fixture.detectChanges();
                let errorMsg = fixture.debugElement.query(By.css('#documentDistributeForm')).nativeElement.children[0].children[3];
                expect(errorMsg.innerText).toContain('DOC_DISTRIBUTION.DISTRIBUTE_TO_EMPLOYEE_GROUP_REQUIRED');
            });

            it('when `Department or team` option is selected and not provided value in Department field', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = '4';
                dropDown.componentInstance.onChange();
                fixture.detectChanges();
                distributeButton.click();
                fixture.detectChanges();
                let errorMsg = fixture.debugElement.query(By.css('#documentDistributeForm')).nativeElement.children[0].children[3];
                expect(errorMsg.innerText).toContain('DOC_DISTRIBUTION.DISTRIBUTE_TO_DEPARTMENT_REQUIRED');
            });

            it('when `Employee` option is selected and not provided value in Employee field', () => {
                let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
                dropDown.componentInstance.value = '17';
                dropDown.componentInstance.onChange();
                fixture.detectChanges();
                distributeButton.click();
                fixture.detectChanges();
                let errorMsg = fixture.debugElement.query(By.css('#documentDistributeForm')).nativeElement.children[0].children[3];
                expect(errorMsg.innerText).toContain('DOC_DISTRIBUTION.DISTRIBUTE_TO_EMPLOYEE_REQUIRED');
            });
        });

        it('should display list of sites in the site field when clicked on site field', () => {
            let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
            dropDown.componentInstance.value = '3';
            dropDown.componentInstance.onChange();
            fixture.detectChanges();
            let siteField = fixture.debugElement.query(By.css('#distributeDocumnet_employeeSelected_1')).nativeElement;
            siteField.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            let list = fixture.debugElement.query(By.css('.ui-autocomplete-panel')).nativeElement.children[0].children;
            expect(list.length).toEqual(mockSites.length);
        });

        it('should display list of employee groups when clicked on Employee group field', () => {
            let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
            dropDown.componentInstance.value = '4018';
            dropDown.componentInstance.onChange();
            fixture.detectChanges();
            let employeeGroupField = fixture.debugElement.query(By.css('#distributeDocumnet_employeeSelected_1')).nativeElement;
            employeeGroupField.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            let list = fixture.debugElement.query(By.css('.ui-autocomplete-panel')).nativeElement.children[0].children;
            expect(list.length).toEqual(mockEmployeeGroups.length);
        });

        it('should display list of departments when clicked on Department field', () => {
            let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
            dropDown.componentInstance.value = '4';
            dropDown.componentInstance.onChange();
            fixture.detectChanges();
            let departmentField = fixture.debugElement.query(By.css('#distributeDocumnet_employeeSelected_1')).nativeElement;
            departmentField.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            let list = fixture.debugElement.query(By.css('.ui-autocomplete-panel')).nativeElement.children[0].children;
            expect(list.length).toEqual(mockDepartments.length);
        });

        it('should display list of Employees when searched with employee name', () => {
            let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
            dropDown.componentInstance.value = '17';
            dropDown.componentInstance.onChange();
            fixture.detectChanges();
            let employeeField = <AeAutocompleteComponent<any>>fixture.debugElement.query(By.directive(AeAutocompleteComponent)).componentInstance;
            let event = { query: 'test' };
            employeeField.aeOnComplete.emit(event);
            fixture.detectChanges();
            expect(employeeField.items.length).toEqual(mockEmployees.length);
        });

        it('should have Close and Distribute buttons in the slideout', () => {
            let distributeButton = fixture.debugElement.query(By.css('#distributeDocumnet_AeAnchor_1')).nativeElement;
            let closeButton = <HTMLElement>fixture.debugElement.query(By.css('.so-panel__footer'))
                .queryAll(By.css('li'))[0]
                .query(By.css('label.button.button--inline-block')).nativeElement;
            expect(distributeButton).toBeDefined();
            expect(closeButton).toBeDefined();
            expect(distributeButton.innerText).toEqual('BUTTONS.DISTRIBUTE');
            expect(closeButton.innerText).toEqual('BUTTONS.SLIDE_CLOSE');
        });

        it('should emit close event when close button was clicked', () => {
            spyOn(component, 'slideClose').and.callThrough();
            spyOn(component._aeCancel, 'emit');
            let closeButton = <HTMLElement>fixture.debugElement.query(By.css('.so-panel__footer'))
                .queryAll(By.css('li'))[0]
                .query(By.css('label.button.button--inline-block')).nativeElement;
            closeButton.click();
            expect(component.slideClose).toHaveBeenCalled();
            expect(component._aeCancel.emit).toHaveBeenCalled();
        });

        it('should distribute document when all the mandatory fields were filled and distribute button was clicked', () => {
            spyOn(component, 'onAddOrUpdateFormSubmit').and.callThrough();
            spyOn(component._aeDistribute, 'emit');
            let dropDown = fixture.debugElement.query(By.directive(AeSelectComponent));
            dropDown.componentInstance.value = '1';
            dropDown.componentInstance.onChange();
            let radioButton1 = fixture.debugElement.query(By.css('#distributeDocumnet_AeRadioGroup_1_AeRadiobutton-distributeDocument_AeRadioGroup_0_0')).nativeElement;
            radioButton1.click();
            fixture.detectChanges();
            let distributeButton = fixture.debugElement.query(By.css('#distributeDocumnet_AeAnchor_1')).nativeElement;
            distributeButton.click();
            fixture.detectChanges();
            expect(component.onAddOrUpdateFormSubmit).toHaveBeenCalled();
            expect(component._aeDistribute.emit).toHaveBeenCalled();
        });
    });
});