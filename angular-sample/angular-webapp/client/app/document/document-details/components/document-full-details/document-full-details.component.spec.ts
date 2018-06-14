import { DocumentFullDetailsComponent } from './document-full-details.component';
import { ComponentFixture } from '@angular/core/testing';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule, LocationStrategy } from '@angular/common';
import { AtlasElementsModule } from './../../../../atlas-elements/atlas-elements.module';
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasSharedModule } from './../../../../shared/atlas-shared.module';
import { StoreModule, Store } from '@ngrx/store';
import { reducer } from './../../../../shared/reducers';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbServiceStub } from './../../../../shared/testing/mocks/breadcrumb-service-mock';
import { LocaleServiceStub } from './../../../../shared/testing/mocks/locale-service-stub';
import { TranslationServiceStub } from './../../../../shared/testing/mocks/translation-service-stub';
import { LocalizationConfig } from './../../../../shared/localization-config';
import { LocalizationConfigStub } from './../../../../shared/testing/mocks/localization-config-stub';
import { Router, ActivatedRoute, RouterModule, RouterOutletMap } from '@angular/router';
import { RouterMock } from './../../../../shared/testing/mocks/router-stub';
import { ActivatedRouteStub } from './../../../../shared/testing/mocks/activated-route-stub';
import { ReactiveFormsModule } from '@angular/forms';
import { DocumentSharedModule } from './../../../document-shared/document-shared.module';
import { DocumentDetailsService } from './../../services/document-details.service';
import { DocumentDetailsServiceStub } from './../../../../shared/testing/mocks/document-details-service-stub';
import { DocumentExporttocqcService } from './../../services/document-export-to-cqc.service';
import { DocumentExporttocqcServiceStub } from './../../../../shared/testing/mocks/document-export-to-cqc-service-stub';
import { DocumentChangeHistoryComponent } from './../../components/document-change-history/document-change-history.component';
import { DocumentEmployeeActionstatusComponent } from './../../components/document-employee-actionstatus/document-employee-actionstatus.component';
import { DocumentDistributeHistoryComponent } from './../../components/document-distribute-history/document-distribute-history.component';
import { documentDetailsRoutes } from './../../documentdetails.routes';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { ClaimsHelperServiceStub } from './../../../../shared/testing/mocks/claims-helper-service-mock';
import { LocationStrategyStub } from './../../../../shared/testing/mocks/location-strategy-stub';
import { RouteParams } from './../../../../shared/services/route-params';
import { RouteParamsMock } from './../../../../shared/testing/mocks/route-params-mock';
import { RouterOutletMapStub } from './../../../../shared/testing/mocks/router-outlet-stub';
import { RouterTestingModule } from '@angular/router/testing';
import { DocumentCategoryService } from './../../../services/document-category-service';
import { DocumentCategoryServiceStub } from './../../../../shared/testing/mocks/document-category-service-stub';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { DocumentDetailsType } from './../../models/document-details-model';
import { LoadDocumentDetailsComplete } from './../../actions/document-details.actions';
import { extractDocumentDetails } from './../../common/document-details-extract-helper';
import { MockStoreProviderFactory } from './../../../../shared/testing/mocks/mock-store-provider-factory';
import { ResponseOptions, Response } from '@angular/http';
import { MessengerService } from './../../../../shared/services/messenger.service';
import { DocumentDetailsContainerComponent } from './../../containers/document-details-container/document-details-container.component';
import { DocumentCategoryEnum } from './../../../models/document-category-enum';
import { CompanyCQCPurchasedDetailsByIdCompleteAction, LoadSitesCompleteAction } from './../../../../shared/actions/company.actions';
import { environment } from './../../../../../environments/environment';
import { RemoveCompanyDocumentCompleteAction } from './../../../company-documents/actions/company-documents.actions';
import { SpyLocation } from '@angular/common/testing';
import { Location, DatePipe } from '@angular/common';
import { DocumentUpdateComponent } from './../../../document-shared/components/document-update/document-update.component';
import { EmployeeSearchService } from './../../../../employee/services/employee-search.service';
import { FormBuilderService } from './../../../../shared/services/form-builder.service';

describe('Document details container component', () => {
    let component: DocumentFullDetailsComponent;
    let fixture: ComponentFixture<DocumentFullDetailsComponent>;
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

    beforeEach(async(() => {
        routerStub = new RouterMock();
        routerStub.url = '/document/document-details/f86ce3d4-8160-4bdb-8f86-a7b5f9ed7a44';

        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                AtlasElementsModule,
                LocalizationModule,
                AtlasSharedModule,
                ReactiveFormsModule,
                DocumentSharedModule,
                StoreModule.provideStore(reducer),
                RouterTestingModule,
                NoopAnimationsModule
            ],
            declarations: [
                DocumentDetailsContainerComponent
                , DocumentFullDetailsComponent
                , DocumentChangeHistoryComponent
                , DocumentEmployeeActionstatusComponent
                , DocumentDistributeHistoryComponent
            ],
            providers: [
                InjectorRef
                , DatePipe
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: Location, useClass: LocationStrategyStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
                , { provide: Router, useValue: routerStub }
                , {
                    provide: ActivatedRoute, useValue: {
                        params: Observable.of({ id: 'f86ce3d4-8160-4bdb-8f86-a7b5f9ed7a44' })
                    }
                }
                , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
                , { provide: DocumentExporttocqcService, useClass: DocumentExporttocqcServiceStub }
                , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
                , { provide: RouteParams, useClass: RouteParamsMock }
                , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
                , { provide: DocumentCategoryService, useClass: DocumentCategoryServiceStub }
                , { provide: MessengerService, useValue: jasmine.createSpyObj('MessengerServiceStub', ['publish']) }
                , {
                    provide: EmployeeSearchService
                    , useValue: jasmine.createSpyObj('EmployeeSearchServiceStub', ['getEmployeesKeyValuePair'])
                }
                , FormBuilderService
                // , { provide: Window, useValue: window }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DocumentFullDetailsComponent);
        component = fixture.componentInstance;
        store = fixture.debugElement.injector.get(Store);
        breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
        localeServiceStub = fixture.debugElement.injector.get(LocaleService);
        translationServiceStub = fixture.debugElement.injector.get(TranslationService);
        localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
        docDetailService = fixture.debugElement.injector.get(DocumentDetailsService);
        docCategoryService = fixture.debugElement.injector.get(DocumentCategoryService);
        routeParamsStub = fixture.debugElement.injector.get(RouteParams);
        locationService = fixture.debugElement.injector.get(Location);
        datePipe = fixture.debugElement.injector.get(DatePipe);
        dispatchSpy = spyOn(store, 'dispatch');
        dispatchSpy.and.callThrough();
        claimsCanDistributeAnyDoc = spyOn(claimsHelperServiceStub, 'canDistributeAnyDocument');
        claimsCanDistributeAnyDoc.and.returnValue(true);
        docDetailServiceRemoveSpy = spyOn(docCategoryService, 'getIsDocumentCanbeDeleted')
        docDetailServiceRemoveSpy.and
            .returnValue(true);
        docDetailServiceRemoveSpy = spyOn(docCategoryService, 'getIsDocumentCanBeUpdated')
        docDetailServiceRemoveSpy.and
            .returnValue(true);
        routeParamsStub.Cid = null;

        jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
    });

    it('component must be launched', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('Loading spinner must be displayed before actual data loads', () => {
        fixture.detectChanges();
        let loaderElement = fixture.debugElement.query(By.css('.loader'));
        expect(loaderElement.nativeElement).toBeDefined();
        expect(loaderElement.queryAll(By.css('.loading__circle-container')).length).toBe(2);
    });

    it('Document details page should have agreed layout according to the design system', () => {
        let data = MockStoreProviderFactory.getDocumentMockData();
        let options = new ResponseOptions({ body: data });
        let res = new Response(options);
        let obj = extractDocumentDetails(res);

        component.documentDetails = obj;
        component.documentType = DocumentDetailsType.Document;
        fixture.detectChanges();
        // After actual data loads, loading spinner must not be displayed.
        let loaderElement = fixture.debugElement.query(By.css('.loader'));
        expect(loaderElement).toBeNull();
        // container div id must be 'detailspage'
        let detailPageContainer = fixture.debugElement.query(By.css('#detailspage'));
        expect(detailPageContainer.nativeElement).toBeDefined();
        // banner must be display
        let bannerElement = detailPageContainer.query(By.css('.banner'));
        expect(bannerElement).toBeDefined();
        // breadcrumb section must be displayed
        let breadcrumbSection = bannerElement.query(By.css('.bredcrumb-section'));
        expect(breadcrumbSection).toBeDefined();
        // banner component must have required classes
        let bannerContainer = bannerElement.query(By.css('.banner__widget.banner--default'));
        expect(bannerContainer).toBeDefined();
        // banner title must match with the document title.
        let bannerTitleElement = bannerContainer.query(By.css('h1.banner__title'));
        expect(bannerTitleElement).toBeDefined();
        expect((<HTMLElement>bannerTitleElement.nativeElement).innerText.trim()).toBe(component.documentDetails.FileName);
        // banner image must be displayed.
        let bannerBGElement = bannerElement.query(By.css('.banner__background'));
        expect((<HTMLElement>bannerBGElement.nativeElement).style.backgroundImage.indexOf('/assets/images/lp-documents.jpg')).not.toBe(-1);
        // buttons container strip must be displayed.
        let buttonContainer = fixture.debugElement.query(By.css('.button-bar.button-bar--offset.spacer'));
        expect(buttonContainer).toBeDefined();
        let lastUpdateElement = buttonContainer.query(By.css('.button-bar__item#lastupdated'));
        expect(lastUpdateElement).toBeDefined();
        let lastUpdateBy = 'Last updated ' + component.document.LastUpdatedDays + ' days ago by ' + component.document.ModifiedByName;
        expect((<HTMLElement>lastUpdateElement.nativeElement).innerText.trim()).toBe(lastUpdateBy);
        let infobarContainer = detailPageContainer.query(By.css('.information-grid'));
        expect(infobarContainer.nativeElement).toBeDefined();
        let infoBarSection = detailPageContainer.query(By.css('.information-grid__section'));
        expect(infoBarSection).toBeDefined();
    });

    describe('verify whether agreed buttons displayed in buttons section appropriately or not', () => {
        it('verify whether "Export to CQC" button is displaying for allowed document categories', () => {
            let data = MockStoreProviderFactory.getDocumentMockData();
            let options = new ResponseOptions({ body: data });
            let res = new Response(options);
            let obj = extractDocumentDetails(res);
            component.documentDetails = obj;
            let categoryId = obj.Category;
            component.documentType = DocumentDetailsType.Document;
            let allowedCategories = [DocumentCategoryEnum.Uploads, DocumentCategoryEnum.Contract, DocumentCategoryEnum.SiteVisit,
            DocumentCategoryEnum.ELHandbook, DocumentCategoryEnum.Handbook, DocumentCategoryEnum.Policy,
            DocumentCategoryEnum.SiteVisitQA, DocumentCategoryEnum.ContractTemplate, DocumentCategoryEnum.RiskAssessment,
            DocumentCategoryEnum.MethodStatements, DocumentCategoryEnum.EmployeeContract
            ];
            allowedCategories.forEach(cat => {
                component.documentDetails.Category = cat;
                expect(component.canDocExportToCQC()).toBeTruthy();
            });
            component.documentDetails.Category = categoryId;

            store.dispatch(new CompanyCQCPurchasedDetailsByIdCompleteAction({
                IsCQCProPurchased: true,
                Sites: [{
                    IsCQCProPurchased: true,
                    Id: 'f86ce3d4-8160-4bdb-9e24-a7b5f9ed7a44',
                    SiteNameAndPostcode: 'Main Site - APB786'
                }]
            }));

            fixture.detectChanges();
            let cqcButton = fixture.debugElement
                .query(By.css('#detailspage'))
                .query(By.css('.button-bar.button-bar--offset.spacer'))
                .query(By.css('.button-bar__item#cqc'));
            expect(cqcButton).toBeDefined();
            let cqcButon = cqcButton.query(By.css('ae-button'));
            expect(cqcButon).toBeDefined();
            let cqcTitleElement = cqcButon.query(By.css('.button.button--cta'))
                .query(By.css('.btn-text'));
            expect((<HTMLElement>cqcTitleElement.nativeElement).innerText.trim().toLowerCase())
                .toBe('DocumentDetails.EXPORT_TO_CQC_PRO'.toLowerCase());

            store.dispatch(new CompanyCQCPurchasedDetailsByIdCompleteAction({
                IsCQCProPurchased: false,
                Sites: []
            }));

            fixture.detectChanges();
            let cqcButton1 = fixture.debugElement
                .query(By.css('#detailspage'))
                .query(By.css('.button-bar.button-bar--offset.spacer'))
                .query(By.css('.button-bar__item#cqc')).query(By.css('ae-button'));
            expect(cqcButton1).toBeNull();
        });

        it('verify whether "Distribute" button is displaying for allowed document categories', () => {
            let data = MockStoreProviderFactory.getDocumentMockData();
            let options = new ResponseOptions({ body: data });
            let res = new Response(options);
            let obj = extractDocumentDetails(res);
            component.documentDetails = obj;
            component.documentDetails.IsDistributable = true;

            fixture.detectChanges();
            // expect(claimsCanDistributeAnyDoc).toHaveBeenCalled();
            expect(component.canDistributeButtonShown()).toBeTruthy();
            let distributeButton = fixture.debugElement
                .query(By.css('#detailspage'))
                .query(By.css('.button-bar.button-bar--offset.spacer'))
                .query(By.css('.button-bar__item#distribute')).query(By.css('ae-button'));
            expect(distributeButton).toBeDefined();
            let cqcTitleElement = distributeButton.query(By.css('.button.button--cta'))
                .query(By.css('.btn-text'));
            expect((<HTMLElement>cqcTitleElement.nativeElement).innerText.trim().toLowerCase())
                .toBe('DocumentDetails.Distribute'.toLowerCase());
            let clickSpy = spyOn(component, 'onDistribute');
            (<HTMLElement>distributeButton.query(By.css('button')).nativeElement).click();
            expect(clickSpy).toHaveBeenCalled();
        });

        it('verify whether "Download" button is displaying for allowed document categories', () => {
            let data = MockStoreProviderFactory.getDocumentMockData();
            let options = new ResponseOptions({ body: data });
            let res = new Response(options);
            let obj = extractDocumentDetails(res);
            component.documentDetails = obj;
            component.documentType = DocumentDetailsType.Document;
            component.documentDetails.IsDistributable = true;

            fixture.detectChanges();
            let distributeButton = fixture.debugElement
                .query(By.css('#detailspage'))
                .query(By.css('.button-bar.button-bar--offset.spacer'))
                .query(By.css('.button-bar__item#download')).query(By.css('ae-button'));
            expect(distributeButton).toBeDefined();
            let cqcTitleElement = distributeButton.query(By.css('.button.button--cta'))
                .query(By.css('.btn-text'));
            expect((<HTMLElement>cqcTitleElement.nativeElement).innerText.trim().toLowerCase())
                .toBe('DocumentDetails.Download'.toLowerCase());
            // let clickSpy = spyOn(component, 'onView');

            spyOn(window, 'open').and.callFake(function () {
                return true;
            });

            (<HTMLElement>distributeButton.query(By.css('button')).nativeElement).click();
            // expect(clickSpy).toHaveBeenCalled();
            let url = '';
            if (routeParamsStub.Cid == null) {
                url = `/filedownload?documentId=${component.documentDetails.Id}&?isSystem=false&version=${component.documentDetails.Version}`;
            }
            expect(window.open).toHaveBeenCalled();
            expect(window.open).toHaveBeenCalledWith(url);
        });

        it('verify whether "Remove" button is displaying for allowed document categories', () => {
            let data = MockStoreProviderFactory.getDocumentMockData();
            let options = new ResponseOptions({ body: data });
            let res = new Response(options);
            let obj = extractDocumentDetails(res);
            component.documentDetails = obj;
            component.documentType = DocumentDetailsType.Document;
            component.documentDetails.IsDistributable = true;
            fixture.detectChanges();

            expect(docCategoryService.getIsDocumentCanbeDeleted).toHaveBeenCalled();
            let distributeButton = fixture.debugElement
                .query(By.css('#detailspage'))
                .query(By.css('.button-bar.button-bar--offset.spacer'))
                .query(By.css('.button-bar__item#remove')).query(By.css('ae-button'));
            expect(distributeButton).toBeDefined();
            let cqcTitleElement = distributeButton.query(By.css('.button.button--cta'))
                .query(By.css('.btn-text'));
            expect((<HTMLElement>cqcTitleElement.nativeElement).innerText.trim().toLowerCase())
                .toBe('DocumentDetails.REMOVE'.toLowerCase());
            let removespy = spyOn(component, 'onRemove');
            let btnRemove: HTMLElement = distributeButton.query(By.css('.button.button--cta')).nativeElement;
            btnRemove.click();
            expect(removespy).toHaveBeenCalled();

        });

        it('When user clicks on "Remove" button, document should be removed', fakeAsync(() => {
            let data = MockStoreProviderFactory.getDocumentMockData();
            let options = new ResponseOptions({ body: data });
            let res = new Response(options);
            let obj = extractDocumentDetails(res);
            component.documentDetails = obj;
            component.documentType = DocumentDetailsType.Document;
            component.documentDetails.IsDistributable = true;
            fixture.detectChanges();

            let removeButton: HTMLElement = fixture.debugElement
                .query(By.css('#detailspage'))
                .query(By.css('.button-bar.button-bar--offset.spacer'))
                .query(By.css('.button-bar__item#remove')).query(By.css('ae-button'))
                .query(By.css('button')).nativeElement;
            removeButton.click();

            expect(component.showRemovDocumentConfirm).toBeTruthy();
            fixture.detectChanges();
            tick(60);
            // fixture.whenStable().then(() => {
            let dialog = fixture.debugElement.query(By.css('ae-modal-dialog'));
            expect(dialog).toBeDefined();
            let header = dialog.query(By.css('.dialog'))
                .query(By.css('.modal-dialog-header'))
                .query(By.css('h3'));
            expect(header).toBeDefined();
            expect((<HTMLElement>header.nativeElement).innerText.trim().toLowerCase())
                .toBeDefined('PERSONAL_DOCUMENT_REMOVE_DIALOG.Remove_Document_Heading_text'.toLowerCase());

            let body = dialog.query(By.css('.dialog'))
                .query(By.css('.modal-dialog-body'))
                .query(By.css('p'));
            expect(body).toBeDefined();
            expect((<HTMLElement>body.nativeElement).innerText.trim().toLowerCase())
                .toBeDefined('PERSONAL_DOCUMENT_REMOVE_DIALOG.Info'.toLowerCase());

            let footer = dialog.query(By.css('.dialog'))
                .query(By.css('.modal-dialog-footer'))
            expect(footer).toBeDefined();
            let footerButtons = footer.queryAll(By.css('ae-button'));
            expect(footerButtons.length).toBe(2);
            let closeButton = footerButtons[0].query(By.css('.button'));
            expect(closeButton).toBeDefined();
            let closeBtnText: HTMLElement = closeButton.query(By.css('.btn-text')).nativeElement;
            expect(closeBtnText.innerText.trim().toLowerCase()).toBe('PERSONAL_DOCUMENT_REMOVE_DIALOG.Btn_No'.toLowerCase());

            let yesButton = footerButtons[1].query(By.css('.button'));
            expect(yesButton).toBeDefined();
            let yesBtnText: HTMLElement = yesButton.query(By.css('.btn-text')).nativeElement;
            expect(yesBtnText.innerText.trim().toLowerCase()).toBe('PERSONAL_DOCUMENT_REMOVE_DIALOG.Btn_Yes'.toLowerCase());

            // let confirmSpy = spyOn(component, 'deleteConfirmModalClosed').and.callFake((''));
            (<HTMLElement>closeButton.nativeElement).click();
            // expect(confirmSpy).toHaveBeenCalled();
            expect(component.showRemovDocumentConfirm).toBeFalsy();
            fixture.detectChanges();
            tick(60);
            // fixture.whenStable().then(() => {
            expect(fixture.debugElement.query(By.css('ae-modal-dialog'))).toBeNull();
            // });
            // });

        }));

        it('verify whether user is navigating to documents list page after remove confirmation', fakeAsync(() => {
            let data = MockStoreProviderFactory.getDocumentMockData();
            let options = new ResponseOptions({ body: data });
            let res = new Response(options);
            let obj = extractDocumentDetails(res);
            component.documentDetails = obj;
            component.documentType = DocumentDetailsType.Document;
            component.documentDetails.IsDistributable = true;
            fixture.detectChanges();

            let removeButton: HTMLElement = fixture.debugElement
                .query(By.css('#detailspage'))
                .query(By.css('.button-bar.button-bar--offset.spacer'))
                .query(By.css('.button-bar__item#remove')).query(By.css('ae-button'))
                .query(By.css('button')).nativeElement;
            removeButton.click();

            expect(component.showRemovDocumentConfirm).toBeTruthy();
            fixture.detectChanges();
            tick(60);
            // fixture.whenStable().then(() => {
            let dialog = fixture.debugElement.query(By.css('ae-modal-dialog'));

            let footer = dialog.query(By.css('.dialog'))
                .query(By.css('.modal-dialog-footer'));
            let footerButtons = footer.queryAll(By.css('ae-button'));
            let yesButton = footerButtons[1].query(By.css('.button'));

            // let confirmSpy = spyOn(component, 'deleteConfirmModalClosed');
            yesButton.nativeElement.click();
            expect(component.showRemovDocumentConfirm).toBeFalsy();
            fixture.detectChanges();
            //expect(confirmSpy).toHaveBeenCalled();
            // expect(confirmSpy).toHaveBeenCalledWith('Yes');

            tick(60);
            // fixture.whenStable().then(() => {

            let locationSpy = spyOn(locationService, 'back');
            expect(fixture.debugElement.query(By.css('ae-modal-dialog'))).toBeNull();
            store.dispatch(new RemoveCompanyDocumentCompleteAction());
            expect(locationSpy).toHaveBeenCalled();
            // });
            // });

        }));

        it('verify whether "Update" button is displaying for allowed document categories', fakeAsync(() => {
            let data = MockStoreProviderFactory.getDocumentMockData();
            let options = new ResponseOptions({ body: data });
            let res = new Response(options);
            let obj = extractDocumentDetails(res);
            component.documentDetails = obj;
            component.documentType = DocumentDetailsType.Document;
            component.documentDetails.IsDistributable = true;
            fixture.detectChanges();

            expect(docCategoryService.getIsDocumentCanBeUpdated).toHaveBeenCalled();
            let distributeButton = fixture.debugElement
                .query(By.css('#detailspage'))
                .query(By.css('.button-bar.button-bar--offset.spacer'))
                .query(By.css('.button-bar__item#update')).query(By.css('ae-button'));
            expect(distributeButton).toBeDefined();
            let cqcTitleElement = distributeButton.query(By.css('.button.button--cta'))
                .query(By.css('.btn-text'));
            expect((<HTMLElement>cqcTitleElement.nativeElement).innerText.trim().toLowerCase())
                .toBe('DocumentDetails.UPDATE'.toLowerCase());
            // let updatespy = spyOn(component, 'onUpdate');
            let btnRemove: HTMLElement = distributeButton.query(By.css('.button.button--cta')).nativeElement;
            btnRemove.click();
            // expect(updatespy).toHaveBeenCalled();
            fixture.detectChanges();
            tick(60);
            let slideout = fixture.debugElement.query(By.directive(DocumentUpdateComponent))
            expect(slideout).toBeDefined();
        }));

        it('verify whether "Previous" button is displaying for allowed document categories', fakeAsync(() => {
            let data = MockStoreProviderFactory.getDocumentMockData();
            let options = new ResponseOptions({ body: data });
            let res = new Response(options);
            let obj = extractDocumentDetails(res);
            component.documentDetails = obj;
            component.documentType = DocumentDetailsType.Document;
            component.documentDetails.IsDistributable = true;
            fixture.detectChanges();

            let distributeButton = fixture.debugElement
                .query(By.css('#detailspage'))
                .query(By.css('.button-bar.button-bar--offset.spacer'))
                .query(By.css('.button-bar__item#previous')).query(By.css('ae-button'));
            expect(distributeButton).toBeDefined();
            let cqcTitleElement = distributeButton.query(By.css('.button'))
                .query(By.css('.btn-text'));
            expect((<HTMLElement>cqcTitleElement.nativeElement).innerText.trim().toLowerCase())
                .toBe('Previous'.toLowerCase());
            // let prevspy = spyOn(component, 'onPreviousClick');

            let locationSpy = spyOn(locationService, 'back');
            let btnPrevious: HTMLElement = distributeButton.query(By.css('.button')).nativeElement;
            btnPrevious.click();
            // expect(prevspy).toHaveBeenCalled();
            fixture.detectChanges();
            tick(60);
            expect(locationSpy).toHaveBeenCalled();
        }));

        it('When document type is "Document", agreed field names must be displayed', () => {
            let mockedSites = MockStoreProviderFactory.getTestSites();
            store.dispatch(new LoadSitesCompleteAction(mockedSites));

            let data = MockStoreProviderFactory.getDocumentMockData();
            let options = new ResponseOptions({ body: data });
            let res = new Response(options);
            let obj = extractDocumentDetails(res);
            obj.IsDistributable = true;
            obj.Category = DocumentCategoryEnum.Disciplinary;
            obj.SiteId = 'C9287A39-3D70-4C0D-BD1C-2632B615896B';
            component.documentDetails = obj;
            component.documentType = DocumentDetailsType.Document;

            fixture.detectChanges();

            let documentDetailsection = fixture.debugElement
                .query(By.css('.information-grid'))
                .query(By.css('.information-grid__section'));
            expect(documentDetailsection).toBeDefined();
            let fields = documentDetailsection.queryAll(By.css('.information-grid__item'));

            let fileName: HTMLElement = fields[0].query(By.css('.information-grid__item-label')).nativeElement;
            expect(fileName.innerText.trim().toLowerCase()).toBe('DocumentDetails.FileName'.toLowerCase());

            let category: HTMLElement = fields[1].query(By.css('.information-grid__item-label')).nativeElement;
            expect(category.innerText.trim().toLowerCase()).toBe('DocumentDetails.Category'.toLowerCase());

            let site: HTMLElement = fields[2].query(By.css('.information-grid__item-label')).nativeElement;
            expect(site.innerText.trim().toLowerCase()).toBe('DocumentDetails.Site'.toLowerCase());

            let docType: HTMLElement = fields[3].query(By.css('.information-grid__item-label')).nativeElement;
            expect(docType.innerText.trim().toLowerCase()).toBe('DocumentDetails.Type'.toLowerCase());

            let archived: HTMLElement = fields[4].query(By.css('.information-grid__item-label')).nativeElement;
            expect(archived.innerText.trim().toLowerCase()).toBe('DocumentDetails.Archived'.toLowerCase());

            let modifiedOn: HTMLElement = fields[5].query(By.css('.information-grid__item-label')).nativeElement;
            expect(modifiedOn.innerText.trim().toLowerCase()).toBe('DocumentDetails.ModifiedOn'.toLowerCase());

            let expiredOn: HTMLElement = fields[6].query(By.css('.information-grid__item-label')).nativeElement;
            expect(expiredOn.innerText.trim().toLowerCase()).toBe('DocumentDetails.ExpireOn'.toLowerCase());

            let description: HTMLElement = fields[7].query(By.css('.information-grid__item-label')).nativeElement;
            expect(description.innerText.trim().toLowerCase()).toBe('DocumentDetails.Description'.toLowerCase());

            let note: HTMLElement = fields[8].query(By.css('.information-grid__item-label')).nativeElement;
            expect(note.innerText.trim().toLowerCase()).toBe('DocumentDetails.Notes'.toLowerCase());
        });

        it('When document type is "Shared Document", agreed field names must be displayed', () => {
            let mockedSites = MockStoreProviderFactory.getTestSites();
            store.dispatch(new LoadSitesCompleteAction(mockedSites));

            let data = MockStoreProviderFactory.getDocumentMockData();
            let options = new ResponseOptions({ body: data });
            let res = new Response(options);
            let obj = extractDocumentDetails(res);
            obj.IsDistributable = true;
            // obj.Category = DocumentCategoryEnum.Disciplinary;
            // obj.SiteId = 'C9287A39-3D70-4C0D-BD1C-2632B615896B';
            component.documentDetails = obj;
            component.documentType = DocumentDetailsType.SharedDocument;
            fixture.detectChanges();

            let documentDetailsection = fixture.debugElement
                .query(By.css('.information-grid'))
                .query(By.css('.information-grid__section'));
            expect(documentDetailsection).toBeDefined();
            let fields = documentDetailsection.queryAll(By.css('.information-grid__item'));

            let title: HTMLElement = fields[0].query(By.css('.information-grid__item-label')).nativeElement;
            expect(title.innerText.trim().toLowerCase()).toBe('DocumentDetails.Title'.toLowerCase());

            let service: HTMLElement = fields[1].query(By.css('.information-grid__item-label')).nativeElement;
            expect(service.innerText.trim().toLowerCase()).toBe('DocumentDetails.Service'.toLowerCase());

            let category: HTMLElement = fields[2].query(By.css('.information-grid__item-label')).nativeElement;
            expect(category.innerText.trim().toLowerCase()).toBe('DocumentDetails.Category'.toLowerCase());

            let sector: HTMLElement = fields[3].query(By.css('.information-grid__item-label')).nativeElement;
            expect(sector.innerText.trim().toLowerCase()).toBe('DocumentDetails.Sector'.toLowerCase());

            let country: HTMLElement = fields[4].query(By.css('.information-grid__item-label')).nativeElement;
            expect(country.innerText.trim().toLowerCase()).toBe('DocumentDetails.Country'.toLowerCase());

            let keywords: HTMLElement = fields[5].query(By.css('.information-grid__item-label')).nativeElement;
            expect(keywords.innerText.trim().toLowerCase()).toBe('DocumentDetails.Keywords'.toLowerCase());
        });

        it('When document type is "Document", actual  document info. must be displayed', () => {
            let mockedSites = MockStoreProviderFactory.getTestSites();
            store.dispatch(new LoadSitesCompleteAction(mockedSites));

            let data = MockStoreProviderFactory.getDocumentMockData();
            let options = new ResponseOptions({ body: data });
            let res = new Response(options);
            let obj = extractDocumentDetails(res);
            obj.IsDistributable = true;
            obj.Category = DocumentCategoryEnum.Disciplinary;
            obj.SiteId = 'C9287A39-3D70-4C0D-BD1C-2632B615896B';
            component.documentDetails = obj;
            component.documentType = DocumentDetailsType.Document;

            fixture.detectChanges();

            let documentDetailsection = fixture.debugElement
                .query(By.css('.information-grid'))
                .query(By.css('.information-grid__section'));
            expect(documentDetailsection).toBeDefined();
            let fields = documentDetailsection.queryAll(By.css('.information-grid__item'));

            let fileName: HTMLElement = fields[0].query(By.css('.information-grid__item-value')).nativeElement;
            expect(fileName.innerText.trim()).toBe(component.document.FileName);

            let category: HTMLElement = fields[1].query(By.css('.information-grid__item-value')).nativeElement;
            expect(category.innerText.trim()).toBe(component.document.CategoryLocalizedName);

            let site: HTMLElement = fields[2].query(By.css('.information-grid__item-value')).nativeElement;
            expect(site.innerText.trim()).toBe(component.siteName.getValue());

            let docType: HTMLElement = fields[3].query(By.css('.information-grid__item-value')).nativeElement;
            expect(docType.innerText.trim()).toBe(component.document.UsageName);

            let archived: HTMLElement = fields[4].query(By.css('.information-grid__item-value')).nativeElement;
            expect(archived.innerText.trim()).toBe(component.document.Archived);

            let modifiedOn: HTMLElement = fields[5].query(By.css('.information-grid__item-value')).nativeElement;
            let modifiedOnDate = component.document.ModifiedOn ? datePipe.transform(component.document.ModifiedOn, 'dd/MM/yyyy') : '';
            expect(modifiedOn.innerText.trim()).toBe(modifiedOnDate);

            let expiredOn: HTMLElement = fields[6].query(By.css('.information-grid__item-value')).nativeElement;
            let expiredOnDate = component.document.ExpiryDate ?
                datePipe.transform(component.document.ExpiryDate, 'dd/MM/yyyy') :
                'Not mentioned';
            expect(expiredOn.innerText.trim()).toBe(expiredOnDate);

            let description: HTMLElement = fields[7].query(By.css('.information-grid__item-value')).nativeElement;
            expect(description.innerText.trim()).toBe(component.document.Description);

            let note: HTMLElement = fields[8].query(By.css('.information-grid__item-value')).nativeElement;
            expect(note.innerText.trim()).toBe(component.document.Notes);
        });

        it('When document type is "Shared Document", actual shared document info. must be displayed', () => {
            let mockedSites = MockStoreProviderFactory.getTestSites();
            store.dispatch(new LoadSitesCompleteAction(mockedSites));

            let data = MockStoreProviderFactory.getMockedSharedDocumentData();
            let options = new ResponseOptions({ body: data });
            let res = new Response(options);
            let obj = extractDocumentDetails(res);
            obj.IsDistributable = true;
            // obj.Category = DocumentCategoryEnum.Disciplinary;
            // obj.SiteId = 'C9287A39-3D70-4C0D-BD1C-2632B615896B';
            component.documentDetails = obj;
            component.documentType = DocumentDetailsType.SharedDocument;
            fixture.detectChanges();

            let documentDetailsection = fixture.debugElement
                .query(By.css('.information-grid'))
                .query(By.css('.information-grid__section'));
            expect(documentDetailsection).toBeDefined();
            let fields = documentDetailsection.queryAll(By.css('.information-grid__item'));

            let title: HTMLElement = fields[0].query(By.css('.information-grid__item-value')).nativeElement;
            expect(title.innerText.trim()).toBe(component.document.Title);

            let service: HTMLElement = fields[1].query(By.css('.information-grid__item-value')).nativeElement;
            expect(service.innerText.trim()).toBe(component.document.Service);

            let category: HTMLElement = fields[2].query(By.css('.information-grid__item-value')).nativeElement;
            expect(category.innerText.trim()).toBe(component.document.CategoryLocalizedName);

            let sector: HTMLElement = fields[3].query(By.css('.information-grid__item-value')).nativeElement;
            expect(sector.innerText.trim()).toBe(component.document.Sector);

            let country: HTMLElement = fields[4].query(By.css('.information-grid__item-value')).nativeElement;
            expect(country.innerText.trim()).toBe(component.document.Country);

            let keywords: HTMLElement = fields[5].query(By.css('.information-grid__item-value')).nativeElement;
            expect(keywords.innerText.trim()).toBe(component.document.Keywords);
        });

        it('Document - verify whether default text labels are displaying when associated data is not available', () => {
            let mockedSites = MockStoreProviderFactory.getTestSites();
            store.dispatch(new LoadSitesCompleteAction(mockedSites));

            let data = MockStoreProviderFactory.getDocumentMockData();
            let options = new ResponseOptions({ body: data });
            let res = new Response(options);
            let obj = extractDocumentDetails(res);
            obj.IsDistributable = true;
            obj.FileName = null;
            obj.CategoryLocalizedName = null;
            obj.UsageName = null;
            obj.Archived = null;
            obj.SiteId = '00000000-0000-0000-0000-000000000000';
            obj.ModifiedOn = null;
            obj.ExpiryDate = null;
            obj.Description = null;
            obj.Notes = null;
            component.documentDetails = obj;
            component.documentType = DocumentDetailsType.Document;

            fixture.detectChanges();

            let documentDetailsection = fixture.debugElement
                .query(By.css('.information-grid'))
                .query(By.css('.information-grid__section'));
            expect(documentDetailsection).toBeDefined();
            let fields = documentDetailsection.queryAll(By.css('.information-grid__item'));

            let fileName: HTMLElement = fields[0].query(By.css('.information-grid__item-value')).nativeElement;
            expect(fileName.innerText.trim()).toBe('');

            let category: HTMLElement = fields[1].query(By.css('.information-grid__item-value')).nativeElement;
            expect(category.innerText.trim()).toBe('');

            let site: HTMLElement = fields[2].query(By.css('.information-grid__item-value')).nativeElement;
            expect(site.innerText.trim()).toBe('All');

            let docType: HTMLElement = fields[3].query(By.css('.information-grid__item-value')).nativeElement;
            expect(docType.innerText.trim()).toBe('');

            let archived: HTMLElement = fields[4].query(By.css('.information-grid__item-value')).nativeElement;
            expect(archived.innerText.trim()).toBe('');

            let modifiedOn: HTMLElement = fields[5].query(By.css('.information-grid__item-value')).nativeElement;
            let modifiedOnDate = component.document.ModifiedOn ? datePipe.transform(component.document.ModifiedOn, 'dd/MM/yyyy') : '';
            expect(modifiedOn.innerText.trim()).toBe('Not mentioned');

            let expiredOn: HTMLElement = fields[6].query(By.css('.information-grid__item-value')).nativeElement;
            let expiredOnDate = component.document.ExpiryDate ?
                datePipe.transform(component.document.ExpiryDate, 'dd/MM/yyyy') :
                'Not mentioned';
            expect(expiredOn.innerText.trim()).toBe(expiredOnDate);

            let description: HTMLElement = fields[7].query(By.css('.information-grid__item-value')).nativeElement;
            expect(description.innerText.trim()).toBe('Not mentioned');

            let note: HTMLElement = fields[8].query(By.css('.information-grid__item-value')).nativeElement;
            expect(note.innerText.trim()).toBe('');
        });

        it('Shared Document - verify whether default text labels are displaying when associated data is not available', () => {

            let data = MockStoreProviderFactory.getMockedSharedDocumentData();
            let options = new ResponseOptions({ body: data });
            let res = new Response(options);
            let obj = extractDocumentDetails(res);
            obj.Title = null;
            obj.Service = null;
            obj.CategoryLocalizedName = null;
            obj.Country = null;
            obj.Sector = null;
            obj.Keywords = null;
            // obj.Category = DocumentCategoryEnum.Disciplinary;
            // obj.SiteId = 'C9287A39-3D70-4C0D-BD1C-2632B615896B';
            component.documentDetails = obj;
            component.documentType = DocumentDetailsType.SharedDocument;
            fixture.detectChanges();

            let documentDetailsection = fixture.debugElement
                .query(By.css('.information-grid'))
                .query(By.css('.information-grid__section'));
            expect(documentDetailsection).toBeDefined();
            let fields = documentDetailsection.queryAll(By.css('.information-grid__item'));

            let title: HTMLElement = fields[0].query(By.css('.information-grid__item-value')).nativeElement;
            expect(title.innerText.trim()).toBe('');

            let service: HTMLElement = fields[1].query(By.css('.information-grid__item-value')).nativeElement;
            expect(service.innerText.trim()).toBe('');

            let category: HTMLElement = fields[2].query(By.css('.information-grid__item-value')).nativeElement;
            expect(category.innerText.trim()).toBe('');

            let sector: HTMLElement = fields[3].query(By.css('.information-grid__item-value')).nativeElement;
            expect(sector.innerText.trim()).toBe('');

            let country: HTMLElement = fields[4].query(By.css('.information-grid__item-value')).nativeElement;
            expect(country.innerText.trim()).toBe('');

            let keywords: HTMLElement = fields[5].query(By.css('.information-grid__item-value')).nativeElement;
            expect(keywords.innerText.trim()).toBe('');
        });

        it('Document - verify whether site name field is displaying for appropriate categories', fakeAsync(() => {
            let mockedSites = MockStoreProviderFactory.getTestSites();
            store.dispatch(new LoadSitesCompleteAction(mockedSites));

            let data = MockStoreProviderFactory.getDocumentMockData();
            let options = new ResponseOptions({ body: data });
            let res = new Response(options);
            let obj = extractDocumentDetails(res);
            obj.IsDistributable = true;
            obj.Category = DocumentCategoryEnum.Disciplinary;
            obj.RegardingObjectId = null;
            component.documentDetails = obj;
            component.documentType = DocumentDetailsType.Document;

            fixture.detectChanges();
            let siteElement = fixture.debugElement
                .query(By.css('.information-grid'))
                .query(By.css('.information-grid__section'))
                .query(By.css('.site'));
            expect(siteElement).toBeNull();
            obj = extractDocumentDetails(res);
            obj.IsDistributable = true;
            obj.Category = DocumentCategoryEnum.Disciplinary;
            obj.SiteId = '00000000-0000-0000-0000-000000000000';
            component.documentDetails = JSON.parse(JSON.stringify(obj));
            component.documentType = DocumentDetailsType.Document;

            fixture.detectChanges();
            tick(60);
            siteElement = fixture.debugElement
                .query(By.css('.information-grid'))
                .query(By.css('.information-grid__section'))
                .query(By.css('.site'));
            expect(siteElement).toBeDefined();

            obj = extractDocumentDetails(res);
            obj.IsDistributable = true;
            obj.Category = DocumentCategoryEnum.Contract;
            obj.SiteId = 'C9287A39-3D70-4C0D-BD1C-2632B615896B';
            component.documentDetails = JSON.parse(JSON.stringify(obj));
            component.documentType = DocumentDetailsType.Document;

            fixture.detectChanges();
            tick(60);
            siteElement = fixture.debugElement
                .query(By.css('.information-grid'))
                .query(By.css('.information-grid__section'))
                .query(By.css('.site'));
            expect(siteElement).toBeDefined();
            let siteNameLabel: HTMLElement = siteElement.query(By.css('.information-grid__item-label')).nativeElement;
            expect(siteNameLabel.innerText.trim().toLowerCase()).toBe('DocumentDetails.Employee'.toLowerCase());

            obj = extractDocumentDetails(res);
            obj.IsDistributable = true;
            obj.Category = DocumentCategoryEnum.Policy;
            obj.SiteId = 'C9287A39-3D70-4C0D-BD1C-2632B615896B';
            component.documentDetails = JSON.parse(JSON.stringify(obj));
            component.documentType = DocumentDetailsType.Document;

            fixture.detectChanges();
            tick(60);
            siteElement = fixture.debugElement
                .query(By.css('.information-grid'))
                .query(By.css('.information-grid__section'))
                .query(By.css('.site'));
            expect(siteElement).toBeDefined();
            siteNameLabel = siteElement.query(By.css('.information-grid__item-label')).nativeElement;
            expect(siteNameLabel.innerText.trim().toLowerCase()).toBe('DocumentDetails.Site'.toLowerCase());
        }));
    });
});
