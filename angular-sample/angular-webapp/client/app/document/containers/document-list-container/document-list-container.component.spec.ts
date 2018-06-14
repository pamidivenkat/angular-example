import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { reducer } from '../../../shared/reducers/index';
import { DocumentListContainerComponent } from './document-list-container.component';
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
import { AddDocumentToDistribute } from '../../components/add-document-to-distribute/add-document-to-distribute.component';
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
import { DocumentSignatureViewComponent } from '../../document-shared/components/document-signature-view/document-signature-view.component';

describe('Document List Container Component', () => {
  let component: DocumentListContainerComponent;
  let fixture: ComponentFixture<DocumentListContainerComponent>;
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

  let documentInformationItems: AeInformationBarItem[]

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
        , DocumentSignatureViewComponent],
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
        , { provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceStub', ['CanManageEmployeeAdvanceeDetails','canManageEmployeeSensitiveDetails','canAccessClientLibrary', 'getEmpIdOrDefault', 'canViewHSDocuments', 'canCreateContracts', 'canDistributeAnySharedDocument', 'canDistributeAnyDocument', 'canDistributeAnySharedDocument', 'canViewELDocuments', 'isConsultant']) }
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
    }).overrideComponent(DocumentListContainerComponent, { set: { host: { "(click)": "dummy" } } })
      .compileComponents();
  }));

  beforeEach(() => {

    fixture = TestBed.createComponent(DocumentListContainerComponent);
    component = fixture.componentInstance;
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
    informationBarServiceStub = TestBed.get(InformationBarService);
    fileUploadServiceStub = fixture.debugElement.injector.get(FileUploadService);
    messengerServiceStub = TestBed.get(MessengerService);
    documentServiceStub = TestBed.get(DocumentService);
    otcEntityDataServiceStub = TestBed.get(OtcEntityDataService);
    draftDocumentRouteResolveStub = TestBed.get(DraftDocumentRouteResolve);

    claimsHelperServiceStub = TestBed.get(ClaimsHelperService);
    claimsHelperServiceStub.canAccessClientLibrary.and.returnValue(true);
    claimsHelperServiceStub.canViewELDocuments.and.returnValue(true);
    fixture.detectChanges();
  });


  describe('Component launch', () => {
    it('should create document list container component', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Information bar', () => {
    beforeEach(() => {
      let mockInformationItems = DocumentsMockStoreProviderFactory.getDocumentStatisticsData();
      dispatchSpy.and.callThrough();
      store.dispatch(new LoadDocumentInformationBarCompleteAction(mockInformationItems));
      component.DocumentsInformationItems$.subscribe(info => {
        documentInformationItems = info;
      });
      fixture.detectChanges();
    });

    it('Documents Information bar must display same number of ae-statistic elements as that of mocked bar items count', fakeAsync(() => {
      let statCount = fixture.debugElement.query(By.css('div.statistics-bar__inner')).queryAll(By.css('ae-statistic')).length;
      expect(statCount).toEqual(documentInformationItems.length);
    }));

    it('Verify "noaction" css class must not available for the non-clickable ae statistic item', fakeAsync(() => {
      let clickableItemCount = fixture.debugElement.queryAll(By.css('div.statistics-bar__statistic.noaction')).length;
      expect(clickableItemCount).toBe(documentInformationItems.filter(c => c.Clickable == false).length);
    }));

    it('Verify whether user is able to click on clickable ae statistic item or not', function () {
      let clickSpy = spyOn(component, 'onDocumentInformationClick').and.callThrough();
      let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
        .query(By.css('div.statistic'));
      firstStatElement.triggerEventHandler('click', null);

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('Access to create a new document', () => {

    it('Should have a clickable Add Document button ', () => {
      let btnElement = fixture.debugElement.query(By.css('#btnAdd_aeButton_1')).nativeElement;
      expect(btnElement).toBeDefined();
    });

    it('should have a landing page notification message', () => {
      let spanNotify: HTMLElement = fixture.debugElement.query(By.css('#Documents_spanNotify_1')).nativeElement;
      expect(spanNotify.innerHTML).toEqual('DOCUMENT_LANDING_MESSAGE');
    });

    it('slide out - add document opens ', () => {
      let btnElement = fixture.debugElement.query(By.css('#btnAdd_aeButton_1')).nativeElement;
      btnElement.click();
      fixture.debugElement.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(component.showAddSlideOut()).toBeTruthy();
    });

  });


  describe('Verifying the documents folders', () => {

    it('Should have Citation drafts documents folder', function () {
      let anchorElement = fixture.debugElement.query(By.css('#document-list-container_AeTabStrip_1_anchor_0')).nativeElement;
      expect(anchorElement.innerText.trim()).toEqual('DOCUMENTS_CITATION_DRAFTS');
      expect(anchorElement).toBeDefined();
    });

    it('Should have Company documents folder', function () {
      let anchorElement = fixture.debugElement.query(By.css('#document-list-container_AeTabStrip_1_anchor_1')).nativeElement;
      expect(anchorElement.innerText.trim()).toEqual('COMPANY_DOCUMENTS');
      expect(anchorElement).toBeDefined();
    });

    it('Should have Shared documents folder', function () {
      let anchorElement = fixture.debugElement.query(By.css('#document-list-container_AeTabStrip_1_anchor_2')).nativeElement;
      expect(anchorElement.innerText.trim()).toEqual('SHARED_WITH_EMP__DOCUMENTS');
      expect(anchorElement).toBeDefined();
    });

    it('Should have Personal documents folder', function () {
      let anchorElement = fixture.debugElement.query(By.css('#document-list-container_AeTabStrip_1_anchor_3')).nativeElement;
      expect(anchorElement.innerText.trim()).toEqual('PERSONAL_DOCUMENTS');
      expect(anchorElement).toBeDefined();
    });

  });

});

describe('Verifying visibility of documents folders for employee login', () => {
  let component: DocumentListContainerComponent;
  let fixture: ComponentFixture<DocumentListContainerComponent>;
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

  let documentInformationItems: AeInformationBarItem[]

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
        , DocumentSignatureViewComponent],
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
        , { provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceStub', ['canAccessClientLibrary', 'getEmpIdOrDefault', 'canViewHSDocuments', 'canCreateContracts', 'canDistributeAnySharedDocument', 'canDistributeAnyDocument', 'canDistributeAnySharedDocument', 'canViewELDocuments', 'isConsultant']) }
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
    }).overrideComponent(DocumentListContainerComponent, { set: { host: { "(click)": "dummy" } } })
      .compileComponents();
  }));

  beforeEach(() => {

    fixture = TestBed.createComponent(DocumentListContainerComponent);
    component = fixture.componentInstance;
    claimsHelperServiceStub = TestBed.get(ClaimsHelperService);
    claimsHelperServiceStub.canAccessClientLibrary.and.returnValue(false);
    claimsHelperServiceStub.canViewELDocuments.and.returnValue(false);
    claimsHelperServiceStub.canDistributeAnySharedDocument.and.returnValue(false);
    claimsHelperServiceStub.canDistributeAnyDocument.and.returnValue(false);
    claimsHelperServiceStub.canDistributeAnySharedDocument.and.returnValue(false);
    claimsHelperServiceStub.canCreateContracts.and.returnValue(false);

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
    informationBarServiceStub = TestBed.get(InformationBarService);
    fileUploadServiceStub = fixture.debugElement.injector.get(FileUploadService);
    messengerServiceStub = TestBed.get(MessengerService);
    documentServiceStub = TestBed.get(DocumentService);
    otcEntityDataServiceStub = TestBed.get(OtcEntityDataService);
    draftDocumentRouteResolveStub = TestBed.get(DraftDocumentRouteResolve);
    fixture.detectChanges();
  });

  it('Should not have a clickable Add Document button ', () => {
    let btnElement = fixture.debugElement.query(By.css('#btnAdd_aeButton_1'));
    expect(btnElement).toBeNull();
  });

  it('Should have Shared documents folder', function () {
    let anchorElement = fixture.debugElement.query(By.css('#document-list-container_AeTabStrip_1_anchor_1')).nativeElement;
    expect(anchorElement.innerText.trim()).toEqual('SHARED_WITH_EMP__DOCUMENTS');
    expect(anchorElement).toBeDefined();
  });

  it('Should have Personal documents folder', function () {
    let anchorElement = fixture.debugElement.query(By.css('#document-list-container_AeTabStrip_1_anchor_2')).nativeElement;
    expect(anchorElement.innerText.trim()).toEqual('PERSONAL_DOCUMENTS');
    expect(anchorElement).toBeDefined();
  });

});



