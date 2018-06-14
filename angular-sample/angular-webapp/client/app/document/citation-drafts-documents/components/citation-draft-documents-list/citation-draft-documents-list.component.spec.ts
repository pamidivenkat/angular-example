import { Sensitivity } from '../../../../employee/models/timeline';
import { fieldDetails } from '../../../models/document';
import { DocumentCategoryEnum } from '../../../models/document-category-enum';
import { LoadCitationDraftsListCompleteAction } from './../../actions/citation-drafts.actions';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasParams, AtlasApiRequestWithParams } from './../../../../shared/models/atlas-api-response';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { LoadAuthorizedDocumentCategories, LoadAuthorizedDocumentCategoriesComplete } from './../../../../shared/actions/user.actions';
import { LoadSitesAction, LoadSitesCompleteAction } from './../../../../shared/actions/company.actions';
import { Subject } from 'rxjs/Rx';
import { DocumentCategoryService } from './../../../services/document-category-service';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { AeAutocompleteComponent } from '../../../../atlas-elements/ae-autocomplete/ae-autocomplete.component';
import { AeDatatableComponent } from '../../../../atlas-elements/ae-datatable/ae-datatable.component';
import { AeInputComponent } from '../../../../atlas-elements/ae-input/ae-input.component';
import { AeNavActionsComponent } from '../../../../atlas-elements/ae-nav-actions/ae-nav-actions.component';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { HomeModule } from '../../../../home/home.module';
import { routes } from '../../../../home/home.routes';
import { AtlasSharedModule } from '../../../../shared/atlas-shared.module';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../../shared/reducers';
import { reducer } from '../../../../shared/reducers/index';
import { ActivatedRouteStub } from '../../../../shared/testing/mocks/activated-route-stub';
import { BreadcrumbServiceStub } from '../../../../shared/testing/mocks/breadcrumb-service-mock';
import { ClaimsHelperServiceStub } from '../../../../shared/testing/mocks/claims-helper-service-mock';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { MockStoreCitationDrafts } from '../../../../shared/testing/mocks/mock-store-citation-drafts';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { DocumentSharedModule } from '../../../document-shared/document-shared.module';
import { LoadCitationDraftsListAction } from '../../actions/citation-drafts.actions';
import { CitationDraftDocumentsListComponent } from './citation-draft-documents-list.component';
import * as Immutable from 'immutable';
import { Document, DocumentsFolder } from './../../../models/document';

describe('Citation Drafts Documents', () => {
    let component: CitationDraftDocumentsListComponent;
    let fixture: ComponentFixture<CitationDraftDocumentsListComponent>;
    let store: Store<fromRoot.State>;
    let documentCategorySer: DocumentCategoryService;
    let loadedSites: Immutable.List<AeSelectItem<string>>;
    let categoryList: Immutable.List<AeSelectItem<string>>;
    let status: Immutable.List<AeSelectItem<string>>;
    let citationDrafts: Immutable.List<Document>;
    let dispatchSpy: jasmine.Spy;
    let states = new Subject<fromRoot.State>();
    let params: AtlasParams[] = new Array();
    let columns;
    let rows;
    let citationDraftsTotalcount: number;
    let routerMock: any; let updateDoc: any;
    let draftApiRequest = new AtlasApiRequestWithParams(1, 10, 'FileNameAndTitle', SortDirection.Ascending, params);

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , ReactiveFormsModule
                , AtlasElementsModule
                , DocumentSharedModule
                , StoreModule.provideStore(reducer)
                , RouterModule.forChild(routes)
                , AtlasSharedModule
                , HomeModule
            ]
            , declarations: [
                CitationDraftDocumentsListComponent
            ]
            , providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
                , { provide: Router, useClass: RouterMock }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , DocumentCategoryService
            ]
        }).compileComponents();
    }));

    describe('Loading Citation Drafts component', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(CitationDraftDocumentsListComponent);
            component = fixture.componentInstance;
            store = fixture.debugElement.injector.get(Store);
            routerMock = fixture.debugElement.injector.get(Router);

            fixture.detectChanges();
            documentCategorySer = fixture.debugElement.injector.get(DocumentCategoryService);
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
            states = new Subject<fromRoot.State>();

            dispatchSpy = spyOn(store, 'dispatch');
            //updateDoc = spyOn(ClaimsHelperServiceStub, 'canUpdateDocumentCategory');
            // updateDoc.and.returnValue(true);
            dispatchSpy.and.callThrough();

            store.dispatch(new LoadSitesAction(false))
            let mockedSites = MockStoreCitationDrafts.getSitesLists();
            store.dispatch(new LoadSitesCompleteAction(mockedSites.Entities));

            store.dispatch(new LoadAuthorizedDocumentCategories(true))
            let mockedCategories = MockStoreCitationDrafts.getCategoryData();
            store.dispatch(new LoadAuthorizedDocumentCategoriesComplete(mockedCategories));
            fixture.detectChanges();

        });
        it('should create', () => {
            expect(component).toBeTruthy();
            let dataTable = fixture.debugElement.query(By.directive(AeDatatableComponent));
            expect(dataTable).toBeTruthy();
        });
        describe('Verfying Document service methods', () => {
            it('Unique Categories and catrgories by area', () => {
                let mockedAuthDocumentCategories = MockStoreCitationDrafts.getCategoryData();
                let subscribedDocumentCategories = documentCategorySer._getUniqueCategories(mockedAuthDocumentCategories.filter(d => d.DocumentArea === 1));
                let uniqueCategoryResult = MockStoreCitationDrafts.getUniqueCategories();
                expect(subscribedDocumentCategories).toEqual(uniqueCategoryResult);
                let documentCategoriesbyArea = documentCategorySer.getDocumentCategoriesByArea(mockedAuthDocumentCategories, 1)
                expect(documentCategoriesbyArea).toEqual(uniqueCategoryResult);
            });
            it('Document Categories For Update', () => {
                let mockedAuthDocumentCategories = MockStoreCitationDrafts.getTestDocumentCategories();
                let documentCategoriesInLibrary = documentCategorySer.getDocumentCategoriesByArea(mockedAuthDocumentCategories, 1);
                let categoryData = documentCategorySer.getDocumentCategoriesForUpdate(documentCategoriesInLibrary);
                let mokeupCategoryData = MockStoreCitationDrafts.categoriesByFolder();
                expect(categoryData).toEqual(mokeupCategoryData);
            });

            it('Document Categories by folder', () => {
                let mockedAuthDocumentCategories = MockStoreCitationDrafts.getTestDocumentCategories();
                let documentCategoriesInLibrary = documentCategorySer.getDocumentCategoriesByArea(mockedAuthDocumentCategories, 1);
                let documentCategoriesfolder = documentCategorySer.getDocumentCategoriesForUpdate(documentCategoriesInLibrary);
                let mokeupCategoryData = MockStoreCitationDrafts.getMokeupDocumentCategoriesByFolder();
                expect(documentCategoriesfolder).toEqual(mokeupCategoryData);
            });

            it('Selected category is Distribute document categories', () => {
                let distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.AccidentLogs);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.CheckList);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.ConstructionPhasePlans);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.MethodStatements);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.RiskAssessment);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.COSHH);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.CompanyPolicies);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.FireRiskAssessment);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Other);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.ComplianceCertificates);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Contract);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.DBS);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Emails);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Uploads);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Disciplinary);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.General);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Grievance);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Leaver);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.NewStarter);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Performance);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Appraisal);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.PersonalDocuments);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.ScannedDocument);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getSiteSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Certificates);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
            })

            it('Selected category is Distribute Employee', () => {
                let distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.AccidentLogs);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.CheckList);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.ConstructionPhasePlans);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.MethodStatements);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.RiskAssessment);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.COSHH);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.CompanyPolicies);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.FireRiskAssessment);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Other);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.ComplianceCertificates);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Contract);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.DBS);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Emails);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Uploads);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Disciplinary);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.General);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Grievance);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Leaver);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.NewStarter);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Performance);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Appraisal);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.PersonalDocuments);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.ScannedDocument);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeFalsy();
                distributeCat = documentCategorySer.getEmployeeSelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Certificates);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
            });

            it('Selected category is Distribute sensitivity', () => {
                let distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.AccidentLogs);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                expect(distributeCat.defaultValue).toBeNull();
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.CheckList);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                expect(distributeCat.defaultValue).toBeNull();
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.ConstructionPhasePlans);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                expect(distributeCat.defaultValue).toBeNull();
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.MethodStatements);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                expect(distributeCat.defaultValue).toBeNull();
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.RiskAssessment);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                expect(distributeCat.defaultValue).toBeNull();
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.COSHH);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                expect(distributeCat.defaultValue).toBeNull();
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.CompanyPolicies);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                expect(distributeCat.defaultValue).toBeNull();
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.FireRiskAssessment);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                expect(distributeCat.defaultValue).toBeNull();
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Other);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                expect(distributeCat.defaultValue).toBeNull();
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.ComplianceCertificates);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                expect(distributeCat.defaultValue).toBeNull();
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Contract);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                expect(distributeCat.defaultValue).toBeNull();
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.DBS);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                expect(distributeCat.defaultValue).toBeNull();
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Emails);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                expect(distributeCat.defaultValue).toBeNull();
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Uploads);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeFalsy();
                expect(distributeCat.mandatory).toBeFalsy();
                expect(distributeCat.defaultValue).toBeNull();
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Disciplinary);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                expect(distributeCat.defaultValue).toEqual(Sensitivity.Sensitive);
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.General);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                expect(distributeCat.defaultValue).toEqual(Sensitivity.Basic);
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Grievance);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                expect(distributeCat.defaultValue).toEqual(Sensitivity.Sensitive);
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Leaver);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                expect(distributeCat.defaultValue).toEqual(Sensitivity.Basic);
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.NewStarter);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                expect(distributeCat.defaultValue).toEqual(Sensitivity.Basic);
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Performance);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                expect(distributeCat.defaultValue).toEqual(Sensitivity.Advance);
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Appraisal);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                expect(distributeCat.defaultValue).toEqual(Sensitivity.Advance);
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.PersonalDocuments);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                expect(distributeCat.defaultValue).toEqual(Sensitivity.Sensitive);
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.ScannedDocument);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                expect(distributeCat.defaultValue).toEqual(Sensitivity.Basic);
                distributeCat = documentCategorySer.getSensitivitySelectionRequiredWhileAddUpdate(DocumentCategoryEnum.Certificates);
                expect(distributeCat instanceof fieldDetails).toBeTruthy();
                expect(distributeCat.visible).toBeTruthy();
                expect(distributeCat.mandatory).toBeTruthy();
                expect(distributeCat.defaultValue).toEqual(Sensitivity.Basic);
            });

            it('Category to show its site and department, Employee,Routpath,FolderCategories,Top1OrDefault', () => {

                let site1 = documentCategorySer.getSitesFilterBeShownByFolder(DocumentsFolder.HanbooksAndPolicies);
                let dept1 = documentCategorySer.getDepartmentFilterBeShownByFolder(DocumentsFolder.HanbooksAndPolicies);
                let emp1 = documentCategorySer.getEmployeeFilterBeShownByFolder(DocumentsFolder.HanbooksAndPolicies);
                let route1 = documentCategorySer.getDocumentFolderByRoutePath('handbooks-and-policies');
                
                expect(site1).toEqual(true); expect(dept1).toEqual(false);
                expect(emp1).toEqual(false); expect(route1).toEqual(DocumentsFolder.HanbooksAndPolicies);


                let site2 = documentCategorySer.getSitesFilterBeShownByFolder(DocumentsFolder.InsepectionReports);
                let dept2 = documentCategorySer.getDepartmentFilterBeShownByFolder(DocumentsFolder.InsepectionReports);
                let emp2 = documentCategorySer.getEmployeeFilterBeShownByFolder(DocumentsFolder.InsepectionReports);
                let route2 = documentCategorySer.getDocumentFolderByRoutePath('inspection-reports');

                expect(site2).toEqual(true); expect(dept2).toEqual(false);
                expect(emp2).toEqual(false); expect(route2).toEqual(DocumentsFolder.InsepectionReports);

                let site3 = documentCategorySer.getSitesFilterBeShownByFolder(DocumentsFolder.HSDocumentSuite);
                let dept3 = documentCategorySer.getDepartmentFilterBeShownByFolder(DocumentsFolder.HSDocumentSuite);
                let emp3 = documentCategorySer.getEmployeeFilterBeShownByFolder(DocumentsFolder.HSDocumentSuite);
                let route3 = documentCategorySer.getDocumentFolderByRoutePath('hs-documentsuite');

                expect(site3).toEqual(true); expect(dept3).toEqual(false);
                expect(emp3).toEqual(false); expect(route3).toEqual(DocumentsFolder.HSDocumentSuite);

                let site4 = documentCategorySer.getSitesFilterBeShownByFolder(DocumentsFolder.AppraisalReviews);
                let dept4 = documentCategorySer.getDepartmentFilterBeShownByFolder(DocumentsFolder.AppraisalReviews);
                let emp4 = documentCategorySer.getEmployeeFilterBeShownByFolder(DocumentsFolder.AppraisalReviews);
                let route4 = documentCategorySer.getDocumentFolderByRoutePath('appraisal-and-reviews');

                expect(site4).toEqual(true); expect(dept4).toEqual(true);
                expect(emp4).toEqual(true); expect(route4).toEqual(DocumentsFolder.AppraisalReviews);

                let site5 = documentCategorySer.getSitesFilterBeShownByFolder(DocumentsFolder.DisciplinaryAndGrivences);
                let dept5 = documentCategorySer.getDepartmentFilterBeShownByFolder(DocumentsFolder.DisciplinaryAndGrivences);
                let emp5 = documentCategorySer.getEmployeeFilterBeShownByFolder(DocumentsFolder.DisciplinaryAndGrivences);
                let route5 = documentCategorySer.getDocumentFolderByRoutePath('disciplinary');

                expect(site5).toEqual(true); expect(dept5).toEqual(true);
                expect(emp5).toEqual(true); expect(route5).toEqual(DocumentsFolder.DisciplinaryAndGrivences);

                let site6 = documentCategorySer.getSitesFilterBeShownByFolder(DocumentsFolder.Trainings);
                let dept6 = documentCategorySer.getDepartmentFilterBeShownByFolder(DocumentsFolder.Trainings);
                let emp6 = documentCategorySer.getEmployeeFilterBeShownByFolder(DocumentsFolder.Trainings);
                let route6 = documentCategorySer.getDocumentFolderByRoutePath('training');

                expect(site6).toEqual(true); expect(dept6).toEqual(true);
                expect(emp6).toEqual(true); expect(route6).toEqual(DocumentsFolder.Trainings);

                let site7 = documentCategorySer.getSitesFilterBeShownByFolder(DocumentsFolder.StartersAndLeavers);
                let dept7 = documentCategorySer.getDepartmentFilterBeShownByFolder(DocumentsFolder.StartersAndLeavers);
                let emp7 = documentCategorySer.getEmployeeFilterBeShownByFolder(DocumentsFolder.StartersAndLeavers);
                let route7 = documentCategorySer.getDocumentFolderByRoutePath('starters');

                expect(site7).toEqual(true); expect(dept7).toEqual(true);
                expect(emp7).toEqual(true); expect(route7).toEqual(DocumentsFolder.StartersAndLeavers);

                let site8 = documentCategorySer.getSitesFilterBeShownByFolder(DocumentsFolder.Others);
                let dept8 = documentCategorySer.getDepartmentFilterBeShownByFolder(DocumentsFolder.Others);
                let emp8 = documentCategorySer.getEmployeeFilterBeShownByFolder(DocumentsFolder.Others);
                let route8 = documentCategorySer.getDocumentFolderByRoutePath('other');

                expect(site8).toEqual(true); expect(dept8).toEqual(false);
                expect(emp8).toEqual(false); expect(route8).toEqual(DocumentsFolder.Others);

                let site12 = documentCategorySer.getSitesFilterBeShownByFolder(DocumentsFolder.CompanyPolicies);
                let dept12 = documentCategorySer.getDepartmentFilterBeShownByFolder(DocumentsFolder.CompanyPolicies);
                let emp12 = documentCategorySer.getEmployeeFilterBeShownByFolder(DocumentsFolder.CompanyPolicies);
                let route12 = documentCategorySer.getDocumentFolderByRoutePath('company-policies');
                
                expect(site12).toEqual(true); expect(dept12).toEqual(false);
                expect(emp12).toEqual(false); expect(route12).toEqual(DocumentsFolder.CompanyPolicies);

               let deptGenFilter = documentCategorySer.getDepartmentFilterBeShownByFolder(DocumentsFolder.General);
                let empGenFilter = documentCategorySer.getEmployeeFilterBeShownByFolder(DocumentsFolder.General);
                let generalRoute = documentCategorySer.getDocumentFolderByRoutePath('general');
                expect(deptGenFilter).toEqual(true);
                expect(empGenFilter).toEqual(true); expect(generalRoute).toEqual(DocumentsFolder.General);

                let defaultRoute = documentCategorySer.getDocumentFolderByRoutePath('default');
                expect(defaultRoute).toEqual(DocumentsFolder.HanbooksAndPolicies);

                let folder11Categories = documentCategorySer.getFolderCategories(DocumentsFolder.CitationDrafts); //1024, 64, 16
                let folder1Categories = documentCategorySer.getFolderCategories(DocumentsFolder.HanbooksAndPolicies); //1024, 64
                let folder2Categories = documentCategorySer.getFolderCategories(DocumentsFolder.InsepectionReports); //4096
                let folder3Categories = documentCategorySer.getFolderCategories(DocumentsFolder.HSDocumentSuite); //51200,515,65536,5120,512,514,513
                let folder4Categories = documentCategorySer.getFolderCategories(DocumentsFolder.AppraisalReviews); //9000
                let folder5Categories = documentCategorySer.getFolderCategories(DocumentsFolder.DisciplinaryAndGrivences); //9001,9003
                let folder6Categories = documentCategorySer.getFolderCategories(DocumentsFolder.Trainings); //65543
                let folder7Categories = documentCategorySer.getFolderCategories(DocumentsFolder.StartersAndLeavers); //9005,9004,256
                let folder8Categories = documentCategorySer.getFolderCategories(DocumentsFolder.Others); //9007,65545,9002,0,9006,9008,9011
                let folder12Categories = documentCategorySer.getFolderCategories(DocumentsFolder.CompanyPolicies);
                let folder13Categories = documentCategorySer.getFolderCategories(DocumentsFolder.General); //9008, 65572


                expect(folder11Categories).toEqual([DocumentCategoryEnum.ELHandbook, DocumentCategoryEnum.Handbook, DocumentCategoryEnum.Policy, DocumentCategoryEnum.ContractTemplate]);
                expect(folder1Categories).toEqual([DocumentCategoryEnum.Handbook, DocumentCategoryEnum.Policy]);
                expect(folder2Categories).toEqual([DocumentCategoryEnum.SiteVisit]);
                expect(folder3Categories).toEqual([DocumentCategoryEnum.AccidentLogs, DocumentCategoryEnum.CarePolicies, DocumentCategoryEnum.CheckList, DocumentCategoryEnum.ConstructionPhasePlans, DocumentCategoryEnum.RiskAssessment, DocumentCategoryEnum.FireRiskAssessment, DocumentCategoryEnum.MethodStatements, DocumentCategoryEnum.COSHH]);
                expect(folder4Categories).toEqual([DocumentCategoryEnum.Appraisal, DocumentCategoryEnum.Performance]);
                expect(folder5Categories).toEqual([DocumentCategoryEnum.Disciplinary, DocumentCategoryEnum.Grievance]);
                expect(folder6Categories).toEqual([DocumentCategoryEnum.Certificates]);
                expect(folder7Categories).toEqual([DocumentCategoryEnum.NewStarter, DocumentCategoryEnum.Leaver, DocumentCategoryEnum.Contract]);
                expect(folder8Categories).toEqual([DocumentCategoryEnum.Other, DocumentCategoryEnum.ComplianceCertificates, DocumentCategoryEnum.Emails, DocumentCategoryEnum.Uploads, DocumentCategoryEnum.ScannedDocument, DocumentCategoryEnum.DBS]);
                expect(folder12Categories).toEqual([DocumentCategoryEnum.CompanyPolicies]);
                expect(folder13Categories).toEqual([DocumentCategoryEnum.PersonalDocuments, DocumentCategoryEnum.General]);



                let MokeupParentDocumentFolderStat = MockStoreCitationDrafts.getMokeupParentDocumentFolderStat();
                let stats9 = documentCategorySer.getParentDocumentFolderStat(MokeupParentDocumentFolderStat, 9);
                let stats10 = documentCategorySer.getParentDocumentFolderStat(MokeupParentDocumentFolderStat, 10);
                expect(stats9.Count).toEqual(479); expect(stats9.Folder).toEqual(9);
                expect(stats10.Count).toEqual(122); expect(stats10.Folder).toEqual(10);

                expect(documentCategorySer.getAllAvailableFolders()).toEqual(MockStoreCitationDrafts.availableFolders());

            });

        });

        describe('Citation Drafts component init', () => {
            beforeEach(() => {
                component.ngOnInit();
                dispatchSpy.and.callThrough();

                component.sites$.subscribe((res => {
                    loadedSites = res;
                }));

                categoryList = component.categoryList;
                status = component.status;

                store.dispatch(new LoadCitationDraftsListAction(draftApiRequest))
                let mockedDraftsDocs = MockStoreCitationDrafts.getDraftsLists();
                store.dispatch(new LoadCitationDraftsListCompleteAction(mockedDraftsDocs));

                component.citationDraftsRequest$.subscribe((res => {
                    citationDrafts = res;
                }));

                component.citationDraftsListTotalCount$.subscribe((count => {
                    citationDraftsTotalcount = count;
                }));

                fixture.detectChanges();
                columns = fixture.debugElement.queryAll(By.css('.table__heading'));
                rows = fixture.debugElement.queryAll(By.css('.table__row'));
            });
            it('should load sites,categories,drafts when no sites,drafts,categories were found in the store', () => {
                let siteLoadActionPayLoad: LoadSitesAction = (new LoadSitesAction(false));
                expect(dispatchSpy).toHaveBeenCalledWith(siteLoadActionPayLoad);
                let categoryLoadActionPayLoad: LoadAuthorizedDocumentCategories = (new LoadAuthorizedDocumentCategories(true));
                expect(dispatchSpy).toHaveBeenCalledWith(categoryLoadActionPayLoad);
                let draftsLoadActionPayLoad: LoadCitationDraftsListAction = (new LoadCitationDraftsListAction(draftApiRequest));
                expect(dispatchSpy).toHaveBeenCalledWith(draftsLoadActionPayLoad);
            });
            it('Site data check', () => {
                let mockedImmutableSitesData: Immutable.List<AeSelectItem<string>> = MockStoreCitationDrafts.getSitesImmutableData();
                expect(loadedSites.toArray()).toEqual(mockedImmutableSitesData.toArray());
            });

            it('Category data check', () => {
                let mockedCategories = MockStoreCitationDrafts.getCategoryData();
                let mockedImmutableCategoryData: Immutable.List<AeSelectItem<string>> = MockStoreCitationDrafts.getCategoryImmutableData(mockedCategories);
                expect(categoryList.toArray()).toEqual(mockedImmutableCategoryData.toArray());
            });
            it('status data check', () => {
                let mockedImmutableStatusData: Immutable.List<AeSelectItem<string>> = MockStoreCitationDrafts.getStatusImmutableData();
                expect(status.toArray()).toEqual(mockedImmutableStatusData.toArray());
            });

            it('Drafts documents data check', () => {
                let draftsData = MockStoreCitationDrafts.getDraftsLists();
                let mockedImmutableDraftsData: Immutable.List<Document> = Immutable.List<Document>(draftsData.Entities);
                expect(citationDrafts.toArray().length).toEqual(mockedImmutableDraftsData.toArray().length);
            });
            it('Drafts documents data Page count and data Totalcount check', () => {
                let draftsData = MockStoreCitationDrafts.getDraftsLists();
                expect(rows.length).toEqual(draftsData.PagingInfo.Count);
                expect(citationDraftsTotalcount).toEqual(draftsData.PagingInfo.TotalCount);
            });


            it('Checking the draftDocumentForm data', () => {
                let formFieldsControls = [];
                for (let formFieldsData in component.draftDocumentForm.controls) {
                    formFieldsControls.push(formFieldsData);
                }
                expect(formFieldsControls.length).toEqual(3);
            });
            it('check the Category Field,Site Field,status Field datatype', () => {
                let categoryControl = fixture.debugElement.query(By.css('#citation-draft-documents-list_AeSelect_1')).nativeElement;
                let categorytypeOfControl = categoryControl instanceof HTMLSelectElement;
                expect(categorytypeOfControl).toBeTruthy();
                let siteControl = fixture.debugElement.query(By.css('#citation-draft-documents-list_AeSelect_2')).nativeElement;
                let sitetypeOfControl = siteControl instanceof HTMLSelectElement;
                expect(sitetypeOfControl).toBeTruthy();
                let statusControl = fixture.debugElement.query(By.css('#citation-draft-documents-list_AeSelect_3')).nativeElement;
                let statustypeOfControl = statusControl instanceof HTMLSelectElement;
                expect(statustypeOfControl).toBeTruthy();
            });
            it('check the Category options values', () => {
                let categoryControl = fixture.debugElement.query(By.css('#citation-draft-documents-list_AeSelect_1')).nativeElement;
                let mockedCategories = MockStoreCitationDrafts.getCategoryData();
                expect(categoryControl.children.length).toEqual(mockedCategories.length + 1);
                let mockedImmutableCategoryData: Immutable.List<AeSelectItem<string>> = MockStoreCitationDrafts.getCategoryImmutableData(mockedCategories);
                expect(categoryControl.children[1].innerText).toEqual(mockedImmutableCategoryData.toArray()[0].Text);
            });

            it('check the Site options values', () => {
                let siteControl = fixture.debugElement.query(By.css('#citation-draft-documents-list_AeSelect_2')).nativeElement;
                let mockedSites = MockStoreCitationDrafts.getSitesImmutableData();
                expect(siteControl.children.length).toEqual(mockedSites.toArray().length + 1);
                expect(siteControl.children[1].innerText).toEqual(mockedSites.toArray()[0].Text);
            });

            it('check the status options values', () => {
                let statusControl = fixture.debugElement.query(By.css('#citation-draft-documents-list_AeSelect_3')).nativeElement;
                let mockedCategories = MockStoreCitationDrafts.getStatusImmutableData();
                expect(statusControl.children.length).toEqual(mockedCategories.toArray().length + 1);
                expect(statusControl.children[1].innerText).toEqual(mockedCategories.toArray()[0].Text);
            });
            it('should have 7 columns', () => {
                expect(columns.length).toEqual(7);
            });
            it('should have a column for document name,category,version,sitename,uploaddate,status,actions with sort option', () => {
                expect(columns[0].nativeElement.innerText.trim()).toEqual('CITATIONDRAFTS.DOCUMENT_NAME');
                expect(columns[0].nativeElement.classList).toContain('js-sortable');
                expect(columns[1].nativeElement.innerText.trim()).toEqual('CITATIONDRAFTS.CATEGORY');
                expect(columns[1].nativeElement.classList).toContain('js-sortable');
                expect(columns[2].nativeElement.innerText.trim()).toEqual('CITATIONDRAFTS.VERSION');
                expect(columns[2].nativeElement.classList).toContain('js-sortable');
                expect(columns[3].nativeElement.innerText.trim()).toEqual('CITATIONDRAFTS.SITENAME');
                expect(columns[3].nativeElement.classList).toContain('js-sortable');
                expect(columns[4].nativeElement.innerText.trim()).toEqual('CITATIONDRAFTS.UPLOAD_DATE');
                expect(columns[4].nativeElement.classList).toContain('js-sortable');
                expect(columns[5].nativeElement.innerText.trim()).toEqual('CITATIONDRAFTS.STATUS');
                expect(columns[5].nativeElement.classList).toContain('js-sortable');
                expect(columns[6].nativeElement.innerText.trim()).toEqual('Actions');
                expect(columns[6].nativeElement.classList).not.toContain('js-sortable');
            });

            it('category filter applied checking Result data and Total count', () => {
                let form = component.draftDocumentForm;
                let category = form.controls.category;
                category.setValue('16384');
                let draftsData = MockStoreCitationDrafts.getDraftscategoryLists();
                store.dispatch(new LoadCitationDraftsListCompleteAction(draftsData));
                fixture.detectChanges();
                let mockedImmutableDraftsData: Immutable.List<Document> = Immutable.List<Document>(draftsData.Entities);
                expect(citationDraftsTotalcount).toEqual(draftsData.PagingInfo.TotalCount);
                expect(citationDrafts.toArray().length).toEqual(mockedImmutableDraftsData.toArray().length);
            });
            it('status filter applied checking Result data and Total count', () => {
                let form = component.draftDocumentForm;
                let category = form.controls.status;
                category.setValue('3');
                let draftsData = MockStoreCitationDrafts.getDraftsstatusLists();
                let mockedImmutableDraftsData: Immutable.List<Document> = Immutable.List<Document>(draftsData.Entities);
                store.dispatch(new LoadCitationDraftsListCompleteAction(draftsData));
                fixture.detectChanges();
                expect(citationDraftsTotalcount).toEqual(draftsData.PagingInfo.TotalCount);
                expect(citationDrafts.toArray().length).toEqual(mockedImmutableDraftsData.toArray().length);
            });
            it('site filter applied checking Result data and Total count', () => {
                let form = component.draftDocumentForm;
                let category = form.controls.sites;
                category.setValue('1969ab90-d7e9-a31b-6fa0-c48699c5b3b0');
                let draftsData = MockStoreCitationDrafts.getDraftssiteLists();
                let mockedImmutableDraftsData: Immutable.List<Document> = Immutable.List<Document>(draftsData.Entities);
                store.dispatch(new LoadCitationDraftsListCompleteAction(draftsData));
                fixture.detectChanges();
                expect(citationDraftsTotalcount).toEqual(draftsData.PagingInfo.TotalCount);
                expect(citationDrafts.toArray().length).toEqual(mockedImmutableDraftsData.toArray().length);
            });
            it('when review button clicked', fakeAsync(() => {
                let mockedDraftsDocs = MockStoreCitationDrafts.getDraftsLists();
                let navigateSpy = spyOn(routerMock, 'navigate');
                component.reviewActionCommand.next(mockedDraftsDocs.Entities[0]);
                tick(100);
                fixture.detectChanges();
                tick(100);
                expect(navigateSpy).toHaveBeenCalledWith(['document/review/' + mockedDraftsDocs.Entities[0].Id]);
            }));

        });

    });
});