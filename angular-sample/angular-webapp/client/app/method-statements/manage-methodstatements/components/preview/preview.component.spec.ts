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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewComponent } from './preview.component';
import { Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../../shared/reducers';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { RouterModule, Router, ActivatedRoute, UrlSegment } from '@angular/router';
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
import { LoadMethodStatementByIdAction, LoadSupportingDocumentsByIdAction, GetMethodStatementAttachmentAction, LoadSupportingDocumentsByIdCompleteAction, GetMethodStatementAttachmentCompleteAction, LoadMethodStatementByIdCompleteAction, UpdateMethodStatementStatusCompleteAction, SaveMethodStatementPreviewCompleteAction } from '../../actions/manage-methodstatement.actions';
import { LoadSitesWithAddressAction, LoadSitesWithAddressCompleteAction } from '../../../../shared/actions/company.actions';
import { CompanyLoadAction, CompanyLoadCompleteAction } from '../../../../company/actions/company.actions';
import { LoadProcedureGroupAction, LoadProcedureGroupCompleteAction } from '../../../../shared/actions/lookup.actions';
import { MockStoreProviderFactory } from '../../../../shared/testing/mocks/mock-store-provider-factory';
import { fakeAsync } from '@angular/core/testing';
import { tick } from '@angular/core/testing';
import { MethodStatement, MSSupportingDocuments, MSSafetyRespAssigned } from '../../../../method-statements/models/method-statement';
import { Company } from '../../../../company/models/company';
import { Site } from '../../../../shared/models/site.model';
import { ProcedureGroup } from '../../../../shared/models/proceduregroup';
import { By } from '@angular/platform-browser';
import { RiskAssessment } from '../../../../risk-assessment/models/risk-assessment';
import { AeModalDialogComponent } from '../../../../atlas-elements/ae-modal-dialog/ae-modal-dialog.component';
import { Observable } from 'rxjs/Observable'
import { MSPreviewMockStoreProviderFactory } from '../../../../shared/testing/mocks/ms-preview-mock-store-provider-factory';

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;
  let store: Store<fromRoot.State>;
  let dispatchSpy: jasmine.Spy;
  let configLoaded: jasmine.Spy;
  let canApproveAndArchiveMSSpy: jasmine.Spy;
  let companyNameSpy: jasmine.Spy;
  let userFullNameSpy: jasmine.Spy;

  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any
  let routeParamsStub: any;
  let http: any;
  let datePipe: any;

  let mockSupportingDocuments: MSSupportingDocuments[];
  let mockSites: Site[];
  let mockMethodStatement: MethodStatement;
  let mockCompanyData: Company;
  let mockMSAttachments: string[];
  let mockProcedureGroups: ProcedureGroup[];
  let mockMSSafetyResponsibilities: MSSafetyRespAssigned[];
  let mockRiskAssessments: RiskAssessment[];
  let templateSpy: any;

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
        MsCopyComponent,
        MethodstatementContainerComponent,
        GeneralComponent
        , SequenceofeventsComponent
        , PlantEquipmentComponent
        , SafetyPrecautionsComponent
        , FurtherInformationComponent
        , SupportingDocumentationComponent
        , PreviewComponent        
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
        , SafetyResponsibilitiesAddUpdateComponent],
      providers: [
        InjectorRef
        , DatePipe, JsonPipe
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
      ]
    }).overrideComponent(PreviewComponent, { set: { host: { "(click)": "dummy" } } })
      .compileComponents();
  }));

  beforeEach(() => {

    fixture = TestBed.createComponent(PreviewComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);
    fixture.detectChanges();
    component.id = "methodStatementPreview";
    component.name = "methodStatementPreview";

    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    routerMock = fixture.debugElement.injector.get(Router);
    activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
    claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
    routeParamsStub = fixture.debugElement.injector.get(RouteParams);
    datePipe = fixture.debugElement.injector.get(DatePipe);
    http = fixture.debugElement.injector.get(Http);

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
    canApproveAndArchiveMSSpy = spyOn(claimsHelperServiceStub, 'canApproveAndArchiveMethodStatements');
    companyNameSpy = spyOn(claimsHelperServiceStub, 'getCompanyName');
    userFullNameSpy = spyOn(claimsHelperServiceStub, 'getUserFullName');
    dispatchSpy = spyOn(store, 'dispatch');
    canApproveAndArchiveMSSpy.and.returnValue(true);
    userFullNameSpy.and.returnValue("Test Name");
    templateSpy = spyOn(component, 'getTemplateForPrintandPDF');

    canApproveAndArchiveMSSpy.and.returnValue(true);
    templateSpy.and.returnValue(Observable.of("test test tets tets"));
    dispatchSpy.and.callThrough();
    mockSupportingDocuments = MSPreviewMockStoreProviderFactory.getMSSupportingDocuments();
    mockSites = MSPreviewMockStoreProviderFactory.getSitesWithAddress().Entities;
    mockMethodStatement = MSPreviewMockStoreProviderFactory.getTestMethodStatementDataById();
    mockCompanyData = MSPreviewMockStoreProviderFactory.getCompanyData();
    mockMSAttachments = MSPreviewMockStoreProviderFactory.getMSAttachments();
    mockProcedureGroups = MSPreviewMockStoreProviderFactory.getProcedureGroups();
    mockMSSafetyResponsibilities = MSPreviewMockStoreProviderFactory.getMSSafetyRespAssigned(mockMethodStatement.MSSafetyResponsibilities);
    mockRiskAssessments = MSPreviewMockStoreProviderFactory.getMsRiskAssessments(mockMethodStatement);
    mockSupportingDocuments.forEach(x => {
      x.PictureUrl = component.getLogoUrl(x.Id);
    });
    store.dispatch(new LoadSupportingDocumentsByIdCompleteAction(mockSupportingDocuments));
    store.dispatch(new LoadSitesWithAddressCompleteAction(mockSites));
    store.dispatch(new LoadMethodStatementByIdCompleteAction(mockMethodStatement));
    store.dispatch(new CompanyLoadCompleteAction(mockCompanyData));
    store.dispatch(new GetMethodStatementAttachmentCompleteAction(mockMSAttachments));
    store.dispatch(new LoadProcedureGroupCompleteAction(mockProcedureGroups));
    companyNameSpy.and.returnValue(mockCompanyData.CompanyName);
    fixture.detectChanges();

  });

  describe('Component launch', () => {
    it('should create preview component', () => {
      expect(component).toBeTruthy();
    });

    xit('should dispatch an action to load methodstatement data when user navigated to preview tab', async () => {
      store.dispatch(new LoadMethodStatementByIdAction({ Id: "e512a372-7c39-436f-b797-bcb6ffac8ef1", IsExample: false }));
      store.dispatch(new LoadSitesWithAddressAction());
      store.dispatch(new CompanyLoadAction(claimsHelperServiceStub.getCompanyId()));
      store.dispatch(new LoadSupportingDocumentsByIdAction({ Id: "e512a372-7c39-436f-b797-bcb6ffac8ef1", IsExample: this._isExample }));
      store.dispatch(new GetMethodStatementAttachmentAction({ IsExample: this._isExample, Id: "e512a372-7c39-436f-b797-bcb6ffac8ef1" }));
      store.dispatch(new LoadProcedureGroupAction());
      expect(store.dispatch).toHaveBeenCalled();
    });

  });


  describe('preview tab', () => {

    describe('verifying buttons actions', () => {

      it('Should have print button', fakeAsync(() => {
        let aeButton = fixture.debugElement.query(By.css('#methodStatementPreview_AeButton_5_aeButton_1'));
        expect(aeButton).not.toBeNull();
      }));

      it('Should not have update button in preview tab', fakeAsync(() => {
        let array: UrlSegment[] = [];
        array.push(new UrlSegment('method-statement/edit/e512a372-7c39-436f-b797-bcb6ffac8ef1', null)); //status id = 1
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        fixture.detectChanges();
        let aeButton = fixture.debugElement.query(By.css('#methodStatementPreview_AeButton_1_aeButton_1'));
        expect(aeButton).toBeNull();
      }));


      it('Should not have copy button in preview tab', fakeAsync(() => {
        let array: UrlSegment[] = [];
        array.push(new UrlSegment('method-statement/edit/e512a372-7c39-436f-b797-bcb6ffac8ef1', null)); //status id = 1
        (<ActivatedRouteStub>activatedRouteStub).url.next(array);
        fixture.detectChanges();
        let aeButton = fixture.debugElement.query(By.css('#methodStatementPreview_AeButton_3_aeButton_1'));
        expect(aeButton).toBeNull();
      }));

      it('Should have export button', fakeAsync(() => {
        let aeButton = fixture.debugElement.query(By.css('#methodStatementPreview_AeButton_4_aeButton_1'));
        expect(aeButton).not.toBeNull();
      }));

      it('Should have email button', fakeAsync(() => {
        let aeButton = fixture.debugElement.query(By.css('#methodStatementPreview_AeButton_6_aeButton_1'));
        expect(aeButton).not.toBeNull();
      }));

      it('Should have Approve button when method statement status is pending and permission is given', fakeAsync(() => {
        fixture.detectChanges();
        let aeButton = fixture.debugElement.query(By.css('#methodStatementPreview_AeButton_2_aeButton_1'));
        expect(component.enableApproveButton).toBeTruthy();
        expect(component.MethodStatementDetails.StatusId == 0).toBeTruthy();
        expect(claimsHelperServiceStub.canApproveAndArchiveMethodStatements).toBeTruthy();
        expect(aeButton).not.toBeNull();
      }));

      it('Should not have Approve button when method statement status is in pending state but permission not given', fakeAsync(() => {
        canApproveAndArchiveMSSpy.and.returnValue(false);
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        tick(100);
        let aeButton = fixture.debugElement.query(By.css('#methodStatementPreview_AeButton_2_aeButton_1'));
        expect(aeButton).toBeNull();
        expect(component.enableApproveButton).toBeFalsy();
        expect(component.MethodStatementDetails.StatusId).toEqual(mockMethodStatement.StatusId);
        expect(component.canApproveMS()).toBeFalsy();
      }));

      it('Should not have Approve button when permission is given and method statement status is in live state', fakeAsync(() => {
        mockMethodStatement.StatusId = 1;
        store.dispatch(new LoadMethodStatementByIdCompleteAction(mockMethodStatement));
        tick(100);
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.enableApproveButton).toBeFalsy();
        expect(component.MethodStatementDetails.StatusId).toEqual(1);
        expect(component.canApproveMS()).toBeTruthy();
      }));

      it('Hide Approve button on click', fakeAsync(() => {
        let approveButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#methodStatementPreview_AeButton_2_aeButton_1');
        approveButton.click();
        expect(dispatchSpy).toHaveBeenCalled();
        dispatchSpy.and.callThrough();
        store.dispatch(new UpdateMethodStatementStatusCompleteAction(true));
        tick(100);
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.enableApproveButton).toBeFalsy();
      }));

      it('should launch export options popup on click of export button', () => {
        fixture.detectChanges();
        let exportButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#methodStatementPreview_AeButton_4_aeButton_1');
        exportButton.click();
        fixture.detectChanges();
        let optionsPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
        expect(optionsPopup).toBeTruthy();
        expect(component.showExportOrPrintOptionsModal).toBeTruthy();
        expect(component.ModalHeader).toEqual("Export options");
        expect(component.attachmentsOptions.count()).toEqual(2);
      });

      it('should close export options popup on click of cancel button', () => {
        let exportButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#methodStatementPreview_AeButton_4_aeButton_1');
        exportButton.click();
        fixture.detectChanges();
        let optionsPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
        optionsPopup.cancelEvent();
        fixture.detectChanges();
        expect(optionsPopup.isVisible).toBeTruthy();
      });

      it('If Yes is selected, and then Continue selected then the Method Statement, along with any attachments and related risk assessments (Atlas) will be downloaded', fakeAsync(() => {
        let exportButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#methodStatementPreview_AeButton_4_aeButton_1');
        exportButton.click();
        fixture.detectChanges();
        let obj = { SelectedValue: 'true' };
        component.onAttachmentsOptionsChange(obj);
        spyOn(component, "downloadAttachments").and.callThrough();
        let continueButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#confirmYes_aeButton_1');
        continueButton.click();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.selectedOption).toEqual(obj.SelectedValue);
        expect(component.downloadAttachments).toHaveBeenCalled();
      }));

      it('If No is selected, and then Continue selected, then the Method Statement, without any attachments or related risk assessments, will be downloaded', fakeAsync(() => {
        let exportButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#methodStatementPreview_AeButton_4_aeButton_1');
        exportButton.click();
        fixture.detectChanges();
        let obj = { SelectedValue: '' };
        component.onAttachmentsOptionsChange(obj);
        spyOn(component, "downloadAttachments").and.callThrough();
        let continueButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#confirmYes_aeButton_1');
        continueButton.click();
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.selectedOption).toEqual('');
        expect(component.downloadAttachments).toHaveBeenCalled();
      }));


      it('verifying on change function of Options dropdown in dialog', () => {
        let obj = { SelectedValue: 'true' };
        component.onAttachmentsOptionsChange(obj);
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.selectedOption).toEqual(obj.SelectedValue);
      });

      it('should launch print options popup on click of print button', () => {
        fixture.detectChanges();
        let printButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#methodStatementPreview_AeButton_5_aeButton_1');
        printButton.click();
        fixture.detectChanges();
        let optionsPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
        expect(optionsPopup).toBeTruthy();
        expect(component.showExportOrPrintOptionsModal).toBeTruthy();
        expect(component.ModalHeader).toEqual("Print options");
        expect(component.attachmentsOptions.count()).toEqual(2);
      });

      it('should close print options popup on click of cancel button', () => {
        let printButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#methodStatementPreview_AeButton_5_aeButton_1');
        printButton.click();
        fixture.detectChanges();
        let optionsPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
        optionsPopup.cancelEvent();
        fixture.detectChanges();
        expect(optionsPopup.isVisible).toBeTruthy();
      });

      it('should launch email options popup on click of print button', () => {
        fixture.detectChanges();
        let emailButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#methodStatementPreview_AeButton_6_aeButton_1');
        emailButton.click();
        fixture.detectChanges();
        let optionsPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
        expect(optionsPopup).toBeTruthy();
        expect(component.showExportOrPrintOptionsModal).toBeTruthy();
        expect(component.ModalHeader).toEqual("Email options");
        expect(component.attachmentsOptions.count()).toEqual(2);
      });

        it('should close email options popup on click of cancel button', () => {
          let emailButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#methodStatementPreview_AeButton_6_aeButton_1');
          emailButton.click();
          fixture.detectChanges();
          let optionsPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
          optionsPopup.cancelEvent();
          fixture.detectChanges();
          expect(component.showExportOrPrintOptionsModal).toBeFalsy();
          expect(optionsPopup.isVisible).toBeTruthy();
        });

        it('Email options - If No is selected, and then Continue selected then the Method Statement, without any attachments or related risk assessments, will be prepared to be emailed', fakeAsync(() => {
          let exportButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#methodStatementPreview_AeButton_6_aeButton_1');
          exportButton.click();
          fixture.detectChanges();
          let obj = { SelectedValue: '' };
          component.onAttachmentsOptionsChange(obj);
          let continueButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#confirmYes_aeButton_1');
          continueButton.click();
          fixture.debugElement.triggerEventHandler('click', null);
          fixture.detectChanges();
          dispatchSpy.and.callThrough();
          store.dispatch(new SaveMethodStatementPreviewCompleteAction({ Id: 'E512A372-7C39-436F-B797-BCB6FFAC8EF1' }));
          tick(100);
          expect(component.ShowEmailSlideOut).toBeTruthy();
          expect(component.EmailModel.Attachments.length).toEqual(1);
        }));

        it('Email options - If Yes is selected, and then Continue selected then the Method Statement, along with any attachments and related risk assessments (Atlas) will be prepared to be emailed', fakeAsync(() => {
          let exportButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#methodStatementPreview_AeButton_6_aeButton_1');
          exportButton.click();
          fixture.detectChanges();
          let obj = { SelectedValue: 'true' };
          component.onAttachmentsOptionsChange(obj);
          let continueButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#confirmYes_aeButton_1');
          continueButton.click();
          fixture.debugElement.triggerEventHandler('click', null);
          fixture.detectChanges();
          dispatchSpy.and.callThrough();
          store.dispatch(new SaveMethodStatementPreviewCompleteAction({ Id: 'E512A372-7C39-436F-B797-BCB6FFAC8EF1' }));
          tick(100);

          expect(component.ShowEmailSlideOut).toBeTruthy();
          expect(component.showExportOrPrintOptionsModal).toBeFalsy();
          expect(component.EmailModel.Attachments.length).toBeGreaterThan(1);
        }));

        describe('Email button actions', () => {

          beforeEach(() => {
            spyOn(component, 'OnEmail').and.callThrough();
            let emailButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#methodStatementPreview_AeButton_6_aeButton_1');
            emailButton.click();
            fixture.detectChanges();
            let continueButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#confirmYes_aeButton_1');
            continueButton.click();
            fixture.detectChanges();
            fixture.debugElement.triggerEventHandler('click', null);
            fixture.detectChanges();
          });

          it('slide-out - send us an email - opens ', () => {
            fixture.whenStable().then(() => {
              expect(component.ShowEmailSlideOut).toBeTruthy();
              fixture.detectChanges();
            });
          });

        });
    });

  });

  describe('verifying the data in sections in preview', () => {
    it('logo src should not be undefined or empty', fakeAsync(() => {
      let src = fixture.debugElement.query(By.css('.ms-preview-logo')).nativeElement.src;
      expect(src).not.toBeUndefined();
      expect(src).not.toEqual("");
    }));

    it('should have company name', fakeAsync(() => {
      // let lblCompanyName = fixture.debugElement.query(By.css('.address_block')).nativeElement;
      expect(component.companyFullName).toEqual(mockCompanyData.CompanyName);
    }));


    it('verify the address details when company does not have Head Office site', fakeAsync(() => {
      dispatchSpy.and.callThrough();
      store.dispatch(new LoadSitesWithAddressCompleteAction(new Array<Site>()));
      fixture.debugElement.triggerEventHandler('click', null);
      fixture.detectChanges();
      tick(100);
      let divCompAddress = fixture.debugElement.query(By.css('#company-address'))
      expect(divCompAddress).toBeNull();
      expect(component.hasHeadOfficeSite).toBeFalsy();
    }));

    it('verify the address details when company has Head Office site', fakeAsync(() => {
      let headOfficeAddress = mockSites.filter(x => x.IsHeadOffice == true)[0];
      let divCompAddress = fixture.debugElement.query(By.css('#company-address')).nativeElement;
      expect(divCompAddress).not.toBeNull();
      expect(component.hasHeadOfficeSite).toBeTruthy();
      expect(component.headOfficeAddress).not.toBeNull();
      expect(component.headOfficeAddress).toEqual(headOfficeAddress.Address);
    }));


    it('should have company telephone number', fakeAsync(() => {
      expect(component.Company.MainContactNo).toEqual(mockCompanyData.MainContactNo);
    }));

    it('should have company telephone number', fakeAsync(() => {
      expect(component.Company.MainContactNo).toEqual(mockCompanyData.MainContactNo);
    }));

    it('should have method statement title', fakeAsync(() => {
      let methodStatamentName = fixture.debugElement.query(By.css('h1')).nativeElement;
      expect(methodStatamentName.textContent.trim()).toEqual(mockMethodStatement.Name);
      expect(component.MethodStatementDetails.Name).toEqual(mockMethodStatement.Name);
    }));

    it('verifying the site address when method statement has site', fakeAsync(() => {
      let siteAddressField = fixture.debugElement.query(By.css('#site-address span')).nativeElement;
      expect(siteAddressField.textContent.trim()).toEqual(mockMethodStatement.Site.AddressLine);
      expect(component.MethodStatementDetails.Site.AddressLine).toEqual(mockMethodStatement.Site.AddressLine);
    }));

    it('verifying the site address when method statement created with other site', fakeAsync(() => {
      mockMethodStatement.Site = null;
      mockMethodStatement.NewLocationOfWork = "test location of work"
      dispatchSpy.and.callThrough();
      store.dispatch(new LoadMethodStatementByIdCompleteAction(mockMethodStatement));
      tick(100);

      fixture.detectChanges();
      expect(component.MethodStatementDetails.NewLocationOfWork).toEqual(mockMethodStatement.NewLocationOfWork);
    }));


    it('Should have Project reference Field', fakeAsync(() => {
      let lblField = fixture.debugElement.query(By.css('#project-reference span')).nativeElement;
      expect(lblField.textContent.trim()).toEqual(mockMethodStatement.ProjectReference);
      expect(component.MethodStatementDetails.ProjectReference).toEqual(mockMethodStatement.ProjectReference);
    }));

    it('Should have client reference Field', fakeAsync(() => {
      let lblField = fixture.debugElement.query(By.css('#client-reference span')).nativeElement;
      expect(lblField.textContent.trim()).toEqual(mockMethodStatement.ClientReference);
      expect(component.MethodStatementDetails.ClientReference).toEqual(mockMethodStatement.ClientReference);
    }));

    it('Should have client name Field', fakeAsync(() => {
      let lblField = fixture.debugElement.query(By.css('#client-name span')).nativeElement;
      expect(lblField.textContent.trim()).toEqual(mockMethodStatement.ClientName);
      expect(component.MethodStatementDetails.ClientName).toEqual(mockMethodStatement.ClientName);
    }));

    it('Should have client telephone Field', fakeAsync(() => {
      let lblField = fixture.debugElement.query(By.css('#client-telephone span')).nativeElement;
      expect(lblField.textContent.trim()).toEqual(mockMethodStatement.ClientTelephoneNumber);
      expect(component.MethodStatementDetails.ClientTelephoneNumber).toEqual(mockMethodStatement.ClientTelephoneNumber);
    }));

    it('verify client location of work field data when method statement created for existing site', fakeAsync(() => {
      let lblField = fixture.debugElement.query(By.css('#client-location span')).nativeElement;
      expect(lblField.textContent.trim()).toEqual(mockMethodStatement.Site.SiteNameAndPostcode);
      expect(component.MethodStatementDetails.Site.SiteNameAndPostcode).toEqual(mockMethodStatement.Site.SiteNameAndPostcode);
    }));

    it('verify client location of work field data when method statement created for other site', fakeAsync(() => {
      mockMethodStatement.Site = null;
      mockMethodStatement.NewLocationOfWork = "test location of work"
      dispatchSpy.and.callThrough();
      store.dispatch(new LoadMethodStatementByIdCompleteAction(mockMethodStatement));
      tick(100);
      fixture.detectChanges();  
      expect(component.MethodStatementDetails.NewLocationOfWork).toEqual(mockMethodStatement.NewLocationOfWork);
    }));

    it('Should have document created', fakeAsync(() => {
      let lblField = fixture.debugElement.query(By.css('#document-created span')).nativeElement;
      let date = datePipe.transform(mockMethodStatement.CreatedOn, 'dd/MM/yyyy');
      expect(lblField.textContent.trim()).toEqual(date);
      expect(component.MethodStatementDetails.CreatedOn).toEqual(mockMethodStatement.CreatedOn);
    }));

    it('Should have document created by', fakeAsync(() => {
      let lblField = fixture.debugElement.query(By.css('#document-createdBy span')).nativeElement;
      expect(lblField.textContent.trim()).toEqual(mockMethodStatement.Author.FullName);
      expect(component.AuthorName).toEqual(mockMethodStatement.Author.FullName);
    }));

    it('Should have document approved on', fakeAsync(() => {
      let lblField = fixture.debugElement.query(By.css('#document-apprOn span')).nativeElement;
      let date = mockMethodStatement.ApprovedDate ? datePipe.transform(mockMethodStatement.ApprovedDate, 'dd/MM/yyyy') : '';
      expect(lblField.textContent.trim()).toEqual(date);
      expect(component.MethodStatementDetails.ApprovedDate).toEqual(mockMethodStatement.ApprovedDate);
    }));

    it('Should have document approved by', fakeAsync(() => {
      let lblField = fixture.debugElement.query(By.css('#document-apprBy span')).nativeElement;
      let name = mockMethodStatement.ApprovedUser ? mockMethodStatement.ApprovedUser.FullName : null;
      expect(lblField.textContent.trim()).toEqual(name ? name : '');
      expect(component.ApprovedByName).toEqual(name);
    }));
    it('Should have client address field', fakeAsync(() => {
      let lblField = fixture.debugElement.query(By.css('#client-addr span')).nativeElement;
      let address = mockMethodStatement.ClientAddress ? mockMethodStatement.ClientAddress : '';
      expect(lblField.textContent.trim()).toEqual(address);
      expect(component.MethodStatementDetails.ClientAddress).toEqual(mockMethodStatement.ClientAddress);
    }));
    it('Should have start date field', fakeAsync(() => {
      let lblField = fixture.debugElement.query(By.css('#start-date span')).nativeElement;
      let date = mockMethodStatement.StartDate ? datePipe.transform(mockMethodStatement.StartDate, 'dd/MM/yyyy') : '';
      expect(lblField.textContent.trim()).toEqual(date);
      expect(component.MethodStatementDetails.StartDate).toEqual(mockMethodStatement.StartDate);
    }));
    it('Should have end date field', fakeAsync(() => {
      let lblField = fixture.debugElement.query(By.css('#end-date span')).nativeElement;
      let date = mockMethodStatement.EndDate ? datePipe.transform(mockMethodStatement.EndDate, 'dd/MM/yyyy') : '';
      expect(lblField.textContent.trim()).toEqual(date);
      expect(component.MethodStatementDetails.EndDate).toEqual(mockMethodStatement.EndDate);
    }));

    it('Should have Principal contractor field', fakeAsync(() => {
      let lblField = fixture.debugElement.query(By.css('#principal-contractor span')).nativeElement;
      expect(lblField.textContent.trim()).toEqual(mockMethodStatement.PrincipalContractor);
      expect(component.MethodStatementDetails.PrincipalContractor).toEqual(mockMethodStatement.PrincipalContractor);
    }));
    it('Should have Principal designer field', fakeAsync(() => {
      let lblField = fixture.debugElement.query(By.css('#principal-designer span')).nativeElement;
      expect(lblField.textContent.trim()).toEqual(mockMethodStatement.PrincipalDesigner);
      expect(component.MethodStatementDetails.PrincipalDesigner).toEqual(mockMethodStatement.PrincipalDesigner);
    }));


    it('Should have Site supervisor field', fakeAsync(() => {
      let lblField = fixture.debugElement.query(By.css('#site-supervisor span')).nativeElement;
      expect(lblField.textContent.trim()).toEqual(mockMethodStatement.SiteSupervisor);
      expect(component.MethodStatementDetails.SiteSupervisor).toEqual(mockMethodStatement.SiteSupervisor);
    }));

    it('Should have Site supervisor phone field', fakeAsync(() => {
      let lblField = fixture.debugElement.query(By.css('#site-supervisor-phone span')).nativeElement;
      expect(lblField.textContent.trim()).toEqual(mockMethodStatement.SiteSupervisorTelephone);
      expect(component.MethodStatementDetails.SiteSupervisorTelephone).toEqual(mockMethodStatement.SiteSupervisorTelephone);
    }));

    it('Should have description of work field', fakeAsync(() => {
      let divField = fixture.debugElement.query(By.css('#ms-description')).nativeElement;
      expect(divField.textContent.trim()).toEqual(mockMethodStatement.Description);
      expect(component.MethodStatementDetails.Description).toEqual(mockMethodStatement.Description);
    }));

    it('Should have sequence of events in order in which they are listed', fakeAsync(() => {
      let soeprocedureGroupId = mockProcedureGroups.filter(x => x.Name == "Sequence of Events")[0].Id;
      let mockSequenceOfEvents = mockMethodStatement.MSProcedures.filter(x => x.ProcedureGroupId == soeprocedureGroupId).sort((a, b) => {
        return a.OrderIndex.toString().localeCompare(b.OrderIndex.toString())
      });
      expect(component.MSSOE).toEqual(mockSequenceOfEvents);
    }));

    describe("verifying method statement plant & equipment section", () => {

      it('Should have plant & equipment header section', fakeAsync(() => {
        let headerField = fixture.debugElement.query(By.css('#plant-equipment')).nativeElement;
        expect(headerField.textContent).not.toBeNull();
      }));

      it('Should have table to display plant & equipment data', fakeAsync(() => {
        let tableField = fixture.debugElement.query(By.css('#tbl-plant-equipment')).nativeElement;
        expect(tableField).toBeDefined();
      }));

      it('Should have 3 columns in plant & equipment table', fakeAsync(() => {
        let column1 = fixture.debugElement.query(By.css('#plant-equip-item')).nativeElement;
        let column2 = fixture.debugElement.query(By.css('#plant-equip-usedfor')).nativeElement;
        let column3 = fixture.debugElement.query(By.css('#plant-equip-special-requirement')).nativeElement;
        expect(column1.textContent.trim()).toBeDefined();
        expect(column2.textContent.trim()).toBeDefined();
        expect(column3.textContent.trim()).toBeDefined();
        expect(fixture.debugElement.query(By.css('#tbl-plant-equipment thead tr')).children.length).toEqual(3);
      }));

      it('verifying the Plant & Equipments data ', fakeAsync(() => {
        expect(component.MethodStatementDetails.PlantEquipments).toEqual(mockMethodStatement.PlantEquipments);
      }));

    });


    describe("verifying Safety precautions section", () => {

      it('Should have ppe header section', fakeAsync(() => {
        let headerField = fixture.debugElement.query(By.css('#ppe-header')).nativeElement;
        expect(headerField.textContent).not.toBeNull();
      }));

      it('verifying the ppe data', fakeAsync(() => {
        // let sortedArray = mockMethodStatement.MSPPE.sort((a, b) => a.PPECategoryName.localeCompare(b.PPECategoryName));
        // expect(component.MSPPE).toEqual(sortedArray);
        expect(component.MSPPE.length).toEqual(mockMethodStatement.MSPPE.length);
      }));

      it('verify ppe category name when other category selected from ppe category groups ', fakeAsync(() => {
        let otherPPECategoryName = mockMethodStatement.MSPPE.filter(x => x.PPECategoryId == '1d026b43-f3d9-4aeb-8e3a-203c051f4088')[0].PPEOtherCategoryValue;
        let ppeCategoryName = component.MSPPE.filter(x => x.PPECategoryId == '1d026b43-f3d9-4aeb-8e3a-203c051f4088')[0].PPECategoryName;
        expect(ppeCategoryName).toEqual(otherPPECategoryName);
      }));

      it('Should have safety responsibilities header', fakeAsync(() => {
        let headerField = fixture.debugElement.query(By.css('#safety-responsibilities')).nativeElement;
        expect(headerField.textContent).not.toBeNull();
      }));

      it('Should have table to display safety resposbilities data', fakeAsync(() => {
        let tableField = fixture.debugElement.query(By.css('#tbl-safety-responsibilities')).nativeElement;
        expect(tableField).toBeDefined();
      }));

      it('Should have 2 columns in safety resposbilities  table', fakeAsync(() => {
        let column1 = fixture.debugElement.query(By.css('#safResp-name')).nativeElement;
        let column2 = fixture.debugElement.query(By.css('#safResp-subitemtext')).nativeElement;
        expect(column1.textContent.trim()).toBeDefined();
        expect(column2.textContent.trim()).toBeDefined();
        expect(fixture.debugElement.query(By.css('#tbl-safety-responsibilities thead tr')).children.length).toEqual(2);
      }));

      it('verifying the safety resposbilities order', fakeAsync(() => {
        expect(component.MSSafetyResponsibilities).toEqual(mockMSSafetyResponsibilities);
      }));

      it('verifying the safety resposbilities - Full name field', fakeAsync(() => {
        mockMSSafetyResponsibilities.forEach(resp => {
          let fullName = component.MSSafetyResponsibilities.filter(x => x.Id == resp.Id)[0].CombinedName;
          expect(fullName).toEqual(resp.CombinedName);
        });
      }));

      it('verifying the safety resposbilities - Responsibilities field', fakeAsync(() => {
        mockMSSafetyResponsibilities.forEach(resp => {
          let subItemText = component.MSSafetyResponsibilities.filter(x => x.Id == resp.Id)[0].SubItemText;
          expect(subItemText).toEqual(resp.SubItemText);
        });

      }));

      it('Should have safety procedures header', fakeAsync(() => {
        let headerField = fixture.debugElement.query(By.css('#safety-procedures')).nativeElement;
        expect(headerField).not.toBeNull();
        expect(headerField.textContent).toBeDefined();
      }));

      it('Should have safety procedures in order in which they are listed', fakeAsync(() => {
        let saftyprocedureGroupId = mockProcedureGroups.filter(x => x.Name != "Sequence of Events")[0].Id;
        let mockSaftyprocedures = mockMethodStatement.MSProcedures.filter(x => x.ProcedureGroupId == saftyprocedureGroupId).sort((a, b) => {
          return a.OrderIndex.toString().localeCompare(b.OrderIndex.toString())
        });
        expect(component.MSSafetyProcs).toEqual(mockSaftyprocedures);
      }));

    });

    describe("verifying Further information section", () => {

      it('Should have Further information header', fakeAsync(() => {
        let headerField = fixture.debugElement.query(By.css('#ms-futher-info')).nativeElement;
        expect(headerField.textContent).toBeDefined();
      }));

      it('Should have related risk assessments header', fakeAsync(() => {
        let headerField = fixture.debugElement.query(By.css('#ms-riskAssess-header')).nativeElement;
        expect(headerField).not.toBeNull();
        expect(headerField.textContent).toBeDefined();
      }));

      it('Should have related risk assessments header', fakeAsync(() => {
        let headerField = fixture.debugElement.query(By.css('#ms-riskAssess-header')).nativeElement;
        expect(headerField).not.toBeNull();
        expect(headerField.textContent).toBeDefined();
      }));


      it('verify count of ms related risk asssesmments data', fakeAsync(() => {
        expect(component.MSRiskAssessments.length).toEqual(mockRiskAssessments.length);
      }));

      it('verify ms related risk asssesmments data', fakeAsync(() => {
        mockRiskAssessments.forEach((riskassessment, index) => {
          let text = riskassessment.ReferenceNumber + " " + riskassessment.Name;
          let lblField = fixture.debugElement.query(By.css('#ms-risk-assess-' + index)).nativeElement;
          expect(lblField.textContent).toEqual(text);
        });
      }));

      it('Should have Facilities affected by works header', fakeAsync(() => {
        let headerField = fixture.debugElement.query(By.css('#ms-facilAffec-header')).nativeElement;
        expect(headerField.textContent).toBeDefined();
      }));

      it('verify Facilities affected by works data', fakeAsync(() => {
        let dataField = fixture.debugElement.query(By.css('#ms-facilities-affec')).nativeElement;
        expect(dataField.textContent).toBeDefined();
        expect(dataField.textContent.trim()).toEqual(mockMethodStatement.FacilitiesEffectedByWork);
        expect(component.MethodStatementDetails.FacilitiesEffectedByWork).toEqual(mockMethodStatement.FacilitiesEffectedByWork);
      }));

      it('Should have Foreseeable adverse affects and controls header', fakeAsync(() => {
        let headerField = fixture.debugElement.query(By.css('#ms-adverseEffec-header')).nativeElement;
        expect(headerField.textContent).toBeDefined();
      }));

      it('verify Foreseeable adverse affects and controls data', fakeAsync(() => {
        let dataField = fixture.debugElement.query(By.css('#ms-adverse-effects')).nativeElement;
        expect(dataField.textContent.trim()).toEqual(mockMethodStatement.ForeseeAdverseEffects);
        expect(component.MethodStatementDetails.ForeseeAdverseEffects).toEqual(mockMethodStatement.ForeseeAdverseEffects);

      }));

      it('Should have Monitoring systems header', fakeAsync(() => {
        let headerField = fixture.debugElement.query(By.css('#ms-monitorSys-header')).nativeElement;
        expect(headerField).not.toBeNull();
        expect(headerField.textContent).toBeDefined();
      }));

      it('verify Monitoring systems data', fakeAsync(() => {
        let dataField = fixture.debugElement.query(By.css('#ms-monitor-sys')).nativeElement;
        expect(dataField.textContent.trim()).toEqual(mockMethodStatement.MonitoringSystems);
        expect(component.MethodStatementDetails.MonitoringSystems).toEqual(mockMethodStatement.MonitoringSystems);
      }));

    });

    describe("verifying supporting documentation section", () => {

      it('Should have Monitoring systems header', fakeAsync(() => {
        let headerField = fixture.debugElement.query(By.css('#support-doc-header')).nativeElement;
        expect(headerField.textContent).toBeDefined();
      }));

      it('verify supporting documents data', fakeAsync(() => {
        expect(component.MSSDDocuments).toEqual(mockSupportingDocuments);
        let test = fixture.debugElement.query(By.css('#ms-suppor-docs'));
        expect(fixture.debugElement.query(By.css('#ms-suppor-docs')).children.length).toEqual(mockSupportingDocuments.length);
      }));

    });

  });


});

