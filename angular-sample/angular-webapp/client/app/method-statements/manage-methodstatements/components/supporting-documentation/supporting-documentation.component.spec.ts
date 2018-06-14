import {
  DocumentUploadComponent,
} from '../../../../document/document-shared/components/document-upload/document-upload.component';
import { AeButtonComponent } from '../../../../atlas-elements/ae-button/ae-button.component';
import {
  DocumentSelectorComponent,
} from '../../../../document/document-shared/components/document-selector/document-selector.component';
import { DocumentCategoryService } from '../../../../document/services/document-category-service';
import { AeSplitbuttonComponent } from '../../../../atlas-elements/ae-splitbutton/ae-splitbutton.component';
import { AeNavActionsComponent } from '../../../../atlas-elements/ae-nav-actions/ae-nav-actions.component';
import { AeModalDialogComponent } from '../../../../atlas-elements/ae-modal-dialog/ae-modal-dialog.component';
import { CommonTestHelper } from '../../../../shared/testing/helpers/common-test-helper';
import { AeDataTableAction } from '../../../../atlas-elements/common/Models/ae-data-table-action';
import { MSSupportingDocuments, MethodStatement } from '../../../models/method-statement';
import { AtlasApiRequest, AtlasApiResponse } from '../../../../shared/models/atlas-api-response';
import {
  AddMethodStatementAttachmentAction,
  LoadMethodStatementByIdCompleteAction,
  LoadMSResponsibilitiesPagingSortingAction,
  LoadSupportingDocumentsByIdCompleteAction,
} from '../../actions/manage-methodstatement.actions';
import { MockStoreProviderFactory } from '../../../../shared/testing/mocks/mock-store-provider-factory';
import { FileUploadService } from '../../../../shared/services/file-upload.service';
import { PreviewComponent } from '../preview/preview.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DocumentDetailsServiceStub } from './../../../../shared/testing/mocks/document-details-service-stub';
import { DocumentDetailsService } from './../../../../document/document-details/services/document-details.service';
import { HttpStub, mockHttpProvider, restClientServiceProvider } from './../../../../shared/testing/mocks/http-stub';
import { RestClientServiceStub } from './../../../../shared/testing/mocks/rest-client-service-stub';
import { AuthorizationEffectsStub } from '../../../../shared/testing/mocks/authorize-effects-stub';
import { AuthorizationEffects } from '../../../../shared/effects/authorization.effects';
import { CookieService } from 'ngx-cookie';
import { StorageService } from '../../../../shared/services/storage.service';
import { AuthorizationServiceStub, AuthorizationServiceFactory } from '../../../../shared/testing/mocks/authorization-service-mock';
import { CookieServiceStub } from '../../../../shared/testing/mocks/cookie-service-stub';
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../../shared/reducers';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { routes } from '../../manage-method-statements.routes';
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasSharedModule } from '../../../../shared/atlas-shared.module';
import { EmailSharedModule } from '../../../../email-shared/email-shared.module';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbServiceStub } from '../../../../shared/testing/mocks/breadcrumb-service-mock';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { LocalizationConfig } from '../../../../shared/localization-config';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { LocalizationConfigStub } from '../../../../shared/testing/mocks/localization-config-stub';
import { ActivatedRouteStub } from '../../../../shared/testing/mocks/activated-route-stub';
import { ClaimsHelperServiceStub } from '../../../../shared/testing/mocks/claims-helper-service-mock';
import { RouteParamsMock } from '../../../../shared/testing/mocks/route-params-mock';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { RouteParams } from '../../../../shared/services/route-params';
import { MethodstatementContainerComponent } from '../../containers/methodstatement-container/methodstatement-container.component';
import { GeneralComponent } from '../../components/general/general.component';
import { SequenceofeventsComponent } from '../../components/sequenceofevents/sequenceofevents.component';
import { PlantEquipmentComponent } from '../../components/plant-equipment/plant-equipment.component';
import { SafetyPrecautionsComponent } from '../../components/safety-precautions/safety-precautions.component';
import { FurtherInformationComponent } from '../../components/further-information/further-information.component';
import { SupportingDocumentationComponent } from '../../components/supporting-documentation/supporting-documentation.component';
import { AddPlantEquipmentComponent } from '../../components/add-plant-equipment/add-plant-equipment.component';
import { SaftyResponsibilitiesComponent } from '../../components/safty-responsibilities/safty-responsibilities.component';
import { PersonalProtectiveEquipmentComponent } from '../../components/personal-protective-equipment/personal-protective-equipment.component';
import { MsProcedureContainerComponent } from '../../containers/ms-procedure-container/ms-procedure-container.component';
import { AddProcedureComponent } from '../../components/add-procedure/add-procedure.component';
import { AddMsProcedureComponent } from '../../components/add-ms-procedure/add-ms-procedure.component';
import { ProcedureQuickViewComponent } from '../../components/procedure-quick-view/procedure-quick-view.component';
import { UpdateMsProcedureComponent } from '../../components/update-ms-procedure/update-ms-procedure.component';
import { SafetyProceduresComponent } from '../../components/safety-procedures/safety-procedures.component';
import { SafetyResponsibilitiesAddUpdateComponent } from '../../components/safety-responsibilities-add-update/safety-responsibilities-add-update.component';
import { InformationFromComputerComponent } from '../../components/information-from-computer/information-from-computer.component';
import { RiskAssessmentSharedModule } from '../../../../risk-assessment/risk-assessment-shared/risk-assessment-shared.module';
import { DocumentSharedModule } from '../../../../document/document-shared/document-shared.module';
import { PlantandequipmentsharedModule } from '../../../../method-statements/plantandequipment/plantandequipmentshared/plantandequipmentshared.module';
import { MsCopyComponent } from '../../../../method-statements/method-statement-copy/components/ms-copy/ms-copy.component';
import { MessengerService } from '../../../../shared/services/messenger.service';
import { ConnectionBackend, Http, HttpModule, XHRBackend, RequestOptions, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { RestClientService } from '../../../../shared/data/rest-client.service';
import { AuthorizationService } from '../../../../shared/security/authorization.service';
import { AuthConfig, authConfigServiceFactory } from '../../../../shared/security/auth-config';
import { StorageServiceStub } from '../../../../shared/testing/mocks/storage-service-mock';
import { reducer } from '../../../../shared/reducers/index';
import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { tick } from '@angular/core/testing';
import { Document, ResourceUsage } from './../../../../document/models/document';

describe('SupportingDocumentationComponent', () => {
  let component: SupportingDocumentationComponent;
  let fixture: ComponentFixture<SupportingDocumentationComponent>;
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
  let _http: any;
  let fileUploadServiceStub: any
  let dataTableElement: DebugElement;
  let columnDivs: DebugElement[];
  let mockedMSSupportingDocsResponse: MSSupportingDocuments[];
  let mockedSelectedDocsResponse: Document[];
  let documentCategoryServiceStub: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        RiskAssessmentSharedModule,
        DocumentSharedModule,
        PlantandequipmentsharedModule,
        RouterModule.forChild(routes),
        LocalizationModule,
        AtlasSharedModule,
        EmailSharedModule,
        NoopAnimationsModule,
        StoreModule.provideStore(reducer),
      ],
      declarations: [
        MsCopyComponent
        , MethodstatementContainerComponent
        , GeneralComponent
        , SequenceofeventsComponent
        , PlantEquipmentComponent
        , SafetyPrecautionsComponent
        , FurtherInformationComponent
        , SupportingDocumentationComponent        
        , AddPlantEquipmentComponent
        , PersonalProtectiveEquipmentComponent
        , SaftyResponsibilitiesComponent
        , MsProcedureContainerComponent
        , AddMsProcedureComponent
        , AddProcedureComponent
        , UpdateMsProcedureComponent
        , ProcedureQuickViewComponent
        , InformationFromComputerComponent
        , SafetyProceduresComponent
        , PreviewComponent
        , SafetyResponsibilitiesAddUpdateComponent],
      providers: [
        InjectorRef
        , MessengerService
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
        , { provide: FileUploadService, userClass: fileUploadServiceStub }
        , { provide: DocumentCategoryService, userClass: documentCategoryServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(SupportingDocumentationComponent);
    component = fixture.componentInstance;
    component.id = "supportingDocList";
    component.name = "supportingDocList";
    store = fixture.debugElement.injector.get(Store);
    fixture.detectChanges();

    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    routerMock = fixture.debugElement.injector.get(Router);
    activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
    claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
    routeParamsStub = fixture.debugElement.injector.get(RouteParams);
    fileUploadServiceStub = fixture.debugElement.injector.get(FileUploadService);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
    dataTableElement = fixture.debugElement.query(By.css('ae-datatable'));

    let tbdElement = fixture.debugElement.query(By.css('#supportingDocList_AeDatatable_1_divBody_0'));
    columnDivs = tbdElement.queryAll(By.css('.table__heading'));

    store = fixture.debugElement.injector.get(Store);
    let methodStatement = new MethodStatement();
    methodStatement.Id = '99a5d85a-f97d-4e12-9a6f-de5afbb63717';
    methodStatement.StatusId = 0;
    store.dispatch(new LoadMethodStatementByIdCompleteAction(methodStatement));
    let actionApiRequest: AtlasApiRequest = new AtlasApiRequest(1, 10, '', null);
    store.dispatch(new LoadMSResponsibilitiesPagingSortingAction(actionApiRequest));

    spyOn(component, 'onSelectDocuments').and.callThrough();
    mockedMSSupportingDocsResponse = MockStoreProviderFactory.getTestSupportingDocumentsResponseData();
    store.dispatch(new LoadSupportingDocumentsByIdCompleteAction(mockedMSSupportingDocsResponse));
    tick(300);
    fixture.detectChanges();
  }));

  let assertFun = function (columnDivs: DebugElement[], columnIndex: number, columnNameKey: string, sortKey: string) {
    let divHeader = columnDivs[columnIndex];
    let spanHeader: HTMLSpanElement = divHeader.query(By.css('span')).nativeElement;
    expect(spanHeader.innerHTML).toEqual(columnNameKey);
    let divHeaderNative = <HTMLDivElement>divHeader.nativeElement;
    expect(divHeaderNative.classList).toContain('js-sortable');
    let divDataAttr: HTMLDivElement = divHeader.query(By.css('div')).nativeElement
    let att: NamedNodeMap = divDataAttr.attributes;
    expect((att.getNamedItem('data-sortable').value).trim()).toEqual('true');
    expect(att.getNamedItem('data-sortKey').value.toLowerCase()).toEqual(sortKey);
  }

  describe('Component launch', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Supporting documentation grid will display the following columns and actions:', () => {
    it('should have a table to show the data', () => {
      expect(fixture.debugElement.nativeElement.querySelector('#supportingDocList_AeDatatable_1_divBody_0')).not.toBeNull();
    });

    it('should have document Name,title, description with sort options', () => {
      assertFun(columnDivs, 0, 'MANAGE_METHOD_STM.SUPPORTING_DOCUMENTATION.DOCUMENT_NAME', 'filename');
      assertFun(columnDivs, 1, 'MANAGE_METHOD_STM.SUPPORTING_DOCUMENTATION.DOCUMENT_TITLE', 'title');
      assertFun(columnDivs, 2, 'MANAGE_METHOD_STM.SUPPORTING_DOCUMENTATION.DOCUMENT_DESCRIPTION', 'description');
    });
    //no--data
    it('grid defaults to blank until an item is added', () => {
      let cells = fixture.debugElement.nativeElement.querySelectorAll('.no--data');
      expect(cells).not.toBeNull();
    });

    it('should have add button at the top of the page ', () => {
      expect(fixture.debugElement.nativeElement.getElementsByTagName("button")).not.toBeNull();
    });

    it('should have two records', () => {
      let rows = fixture.debugElement.nativeElement.querySelectorAll('.table__row');
      expect(rows.length).toEqual(2);
    });

    it('grid should have Download and Remove actions', (() => {
      let items: Array<AeDataTableAction> = component.supportingEvidenceActions.toArray();
      expect(items.length).toEqual(2);
      expect(CommonTestHelper.hasGivenButton(items, 'download')
        && CommonTestHelper.hasGivenButton(items, 'remove')
      ).toBeTruthy();
    }));

    it('should launch popup for remove action', () => {
      let navButtons = <AeNavActionsComponent<any>>fixture.debugElement.query(By.directive(AeNavActionsComponent)).componentInstance;
      let event = new MouseEvent('click');
      navButtons._onClick(event);
      fixture.detectChanges();
      let removeButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#Remove');
      removeButton.click();
      fixture.detectChanges();
      let confirmPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
      expect(confirmPopup).toBeTruthy();
    });

    it('should close the model popup on cancel', () => {
      let navButtons = <AeNavActionsComponent<any>>fixture.debugElement.query(By.directive(AeNavActionsComponent)).componentInstance;
      let event = new MouseEvent('click');
      navButtons._onClick(event);
      fixture.detectChanges();

      let removeButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#Remove');
      removeButton.click();
      fixture.detectChanges();

      let confirmPopup = <AeModalDialogComponent>fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
      confirmPopup.cancelEvent();
      expect(confirmPopup.isVisible).toBeTruthy();
      fixture.detectChanges();
    });

    it('add button should contains ATLAS LIBRARY and FROM OTHER actions', (() => {
      let items: any[] = component.splitButtonOptions;
      expect(items.length).toEqual(2);
      expect(items[0].Text).toEqual('ATLAS LIBRARY');
      expect(items[1].Text).toEqual('FROM OTHER');

    }));

    it('should have a clickable Atlas library button', async(() => {
      let navButtons = <AeSplitbuttonComponent>fixture.debugElement.query(By.directive(AeSplitbuttonComponent)).componentInstance;
      let event = new MouseEvent('click');
      navButtons._onClick(event);
      fixture.detectChanges();
    }));

    describe('should display Add Documents slide-out:', () => {
      it('should open a slide-out for add document from ATLAS LIBRARY', () => {
        let navButtons = <AeSplitbuttonComponent>fixture.debugElement.query(By.directive(AeSplitbuttonComponent)).componentInstance;
        let event = new MouseEvent('click');
        navButtons._onClick(event);
        fixture.detectChanges();

        let atlasLibraryLink = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#ae-anchor0');
        atlasLibraryLink.click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(fixture.debugElement.nativeElement.querySelector('#documentsGrid_divBody_0')).not.toBeNull();
        });
      });

      it('should display selected documents from ATLAS LIBRARY slide-out', fakeAsync(() => {
        let navButtons = <AeSplitbuttonComponent>fixture.debugElement.query(By.directive(AeSplitbuttonComponent)).componentInstance;
        let event = new MouseEvent('click');
        navButtons._onClick(event);
        fixture.detectChanges();

        let atlasLibraryLink = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#ae-anchor0');
        atlasLibraryLink.click();
        fixture.detectChanges();

        let childComponent = <DocumentSelectorComponent>fixture.debugElement.query(By.directive(DocumentSelectorComponent)).componentInstance;
        mockedSelectedDocsResponse = MockStoreProviderFactory.getTestSelectedDocuments();
        childComponent._selectDocuments.emit(mockedSelectedDocsResponse);
        expect(component.onSelectDocuments).toHaveBeenCalled();
      }));

      it('should close the ATLAS LIBRARY slide-out', fakeAsync(() => {
        fixture.whenStable().then(() => {
          let navButtons = <AeSplitbuttonComponent>fixture.debugElement.query(By.directive(AeSplitbuttonComponent)).componentInstance;
          let event = new MouseEvent('click');
          navButtons._onClick(event);
          fixture.detectChanges();

          let atlasLibraryLink = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#ae-anchor0');
          atlasLibraryLink.click();
          fixture.detectChanges();

          let closeButton = <DocumentSelectorComponent>fixture.debugElement.query(By.directive(DocumentSelectorComponent)).componentInstance;
          closeButton.onDocSelectorFormClosed(true);
          fixture.detectChanges();

          expect(fixture.debugElement.nativeElement.querySelector('#documentsGrid_divBody_0')).toBeNull();
        });
      }));
    });
    describe('should display Upload document slide-out:', () => {
      it('should close the FROM OTHER slide-out', fakeAsync(() => {
        fixture.whenStable().then(() => {
          let navButtons = <AeSplitbuttonComponent>fixture.debugElement.query(By.directive(AeSplitbuttonComponent)).componentInstance;
          let event = new MouseEvent('click');
          navButtons._onClick(event);
          fixture.detectChanges();

          let atlasOtherLink = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#ae-anchor1');
          atlasOtherLink.click();
          fixture.detectChanges();
          tick(200);
          let closeButton = <DocumentUploadComponent>fixture.debugElement.query(By.directive(DocumentUploadComponent)).componentInstance;
          closeButton.onAddCancel();
          fixture.detectChanges();
          expect(fixture.debugElement.nativeElement.querySelector('.ae-file')).toBeNull();
        });
      }));
    });
  });
});