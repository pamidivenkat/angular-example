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
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PreviewComponent } from '../preview/preview.component';
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
import { By } from '@angular/platform-browser';
import { DebugElement, EventEmitter } from '@angular/core';
import { AtlasApiRequest, AtlasApiRequestWithParams, AtlasParams } from '../../../../shared/models/atlas-api-response';
import { LoadMSRiskAssessmentsPagingSortingAction, LoadMethodStatementByIdCompleteAction, UpdateMethodStatementAction } from '../../actions/manage-methodstatement.actions';
import { MethodStatement, MSRiskAssessment, MSOtherRiskAssessments } from '../../../../method-statements/models/method-statement';
import { MockStoreProviderFactory } from '../../../../shared/testing/mocks/mock-store-provider-factory';
import { BehaviorSubject } from 'rxjs';
import * as Immutable from 'immutable';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { CommonTestHelper } from '../../../../shared/testing/helpers/common-test-helper';
import { AeTabItemComponent } from '../../../../atlas-elements/ae-tab/ae-tab-item/ae-tab-item.component';
import { RiskAssessmentSelectorComponent } from '../../../../risk-assessment/risk-assessment-shared/components/risk-assessment-selector/risk-assessment-selector.component';
import { LoadSitesCompleteAction } from '../../../../shared/actions/company.actions';
import { LoadLiveRiskAssessmentsAction, LoadLiveRiskAssessmentsCompleteAction } from '../../../../risk-assessment/risk-assessment-shared/actions/ra-shared-actions';
import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import { RiskAssessment } from '../../../../risk-assessment/models/risk-assessment';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
describe('FurtherInformationComponent', () => {
  let component: FurtherInformationComponent;
  let fixture: ComponentFixture<FurtherInformationComponent>;
  let store: Store<fromRoot.State>;
  let dispatchSpy: jasmine.Spy;
  let configLoaded: jasmine.Spy;
  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any;
  let routeParamsStub: any;
  let _http: any;
  let expectedAPIRequest: AtlasApiRequest;
  let loadedData, loadedDataTableOptions, loadedDataCount;
  let dataTableElement: any;
  let items: BehaviorSubject<Immutable.List<MSRiskAssessment>> = new BehaviorSubject<Immutable.List<MSRiskAssessment>>(null);
  let itemsTotalCount: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  let mockedMSRAResponse: Immutable.List<MSRiskAssessment>;
  let testMSData: MethodStatement;
  let tabs: AeTabItemComponent[];
  let modifiedData: MethodStatement;
  let raSelectorComponent: RiskAssessmentSelectorComponent;
  let raFixture: ComponentFixture<RiskAssessmentSelectorComponent>;
  let raInformationComponent: InformationFromComputerComponent;
  let raInfoFixture: ComponentFixture<InformationFromComputerComponent>;
  let isOtherRASlidserClosed = false;
  let otherRAData: MSOtherRiskAssessments[];
  let liveRAData: Array<RiskAssessment>;
  let oldMSRACount: number;
  let newMSRACount: number;
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
        , SafetyResponsibilitiesAddUpdateComponent
      ],
      providers: [
        InjectorRef
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
        , MockBackend
        , BaseRequestOptions
        , MessengerService
        , FormBuilderService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FurtherInformationComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);
    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    routerMock = fixture.debugElement.injector.get(Router);
    activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
    claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
    routeParamsStub = fixture.debugElement.injector.get(RouteParams);

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;

  });
  beforeEach(() => {
    dispatchSpy = spyOn(store, 'dispatch');
    testMSData = MockStoreProviderFactory.getFurtherInformationTabData();
    dispatchSpy.and.callThrough();
    store.dispatch(new LoadMethodStatementByIdCompleteAction(testMSData));
    component.methodStatement = testMSData;
    fixture.detectChanges();
  });


  describe('Component launch', () => {
    it('should create FurtherInformationComponent', () => {
      expect(component).toBeTruthy();
    });
    it('should have 4 tabs in the component', () => {
      let allTabs = fixture.debugElement.queryAll(By.css('.tabs-nav__item'));
      expect(allTabs).toBeDefined();
      expect(allTabs.length).toEqual(4);
    });
    it('by default related risk assessments tab should be opened', () => {
      let tabItems = fixture.debugElement.queryAll(By.css('.tabs-nav__item'));
      let riskassessmentsTab = tabItems[0];
      expect(riskassessmentsTab.classes.active).toBeTruthy();
    });
  });

  describe('should be able to navigate between the 4 tabs', () => {
    beforeEach(() => {
      tabs = component.tabComponent.tabs;
    });
    it('should navigate to tab 2 when clicked on 2nd tab', function () {
      let tab = tabs[1];
      component.tabComponent.tabHeaderClick(tab, 1);
      fixture.detectChanges();
      expect(component.tabComponent.getSelectedTabIndex()).toEqual(1);
    });
    it('should navigate to tab 3 when clicked on 3rd tab', function () {
      let tab = tabs[2];
      component.tabComponent.tabHeaderClick(tab, 2);
      fixture.detectChanges();
      expect(component.tabComponent.getSelectedTabIndex()).toEqual(2);
    });
    it('should navigate to tab 4 when clicked on 4th tab', function () {
      let tab = tabs[3];
      component.tabComponent.tabHeaderClick(tab, 3);
      fixture.detectChanges();
      expect(component.tabComponent.getSelectedTabIndex()).toEqual(3);
    });
    it('should navigate to tab 1 when clicked on 1st tab', function () {
      let tab = tabs[0];
      component.tabComponent.tabHeaderClick(tab, 0);
      fixture.detectChanges();
      expect(component.tabComponent.getSelectedTabIndex()).toEqual(0);
    });
  });


  describe('load relared riskassessments when navigated to risk assessments tab', () => {
    beforeEach(() => {
      expectedAPIRequest = new AtlasApiRequest(1, 10, '', null);
      store.dispatch(new LoadMSRiskAssessmentsPagingSortingAction(expectedAPIRequest));
    });

    beforeEach(() => {
      component.msRiskAssessmentsList.subscribe(values => {
        loadedData = values;
      });
      component.dataTableOptions$.subscribe(options => {
        loadedDataTableOptions = options;
      });
      component.recordsCount.subscribe(count => {
        loadedDataCount = count;
      });
    });

    it('Add button should be present in related risk assessments tab', (() => {
      fixture.detectChanges();
      let addButton = fixture.debugElement.query(By.css('a'));
      expect(addButton).toBeTruthy();
    }));

    it('data table should be loaded with related risk assessments', fakeAsync(() => {
      fixture.detectChanges();
      tick(100);
      dataTableElement = fixture.debugElement.query(By.css('#methodStatementfurtherInformation_AeDatatable_1_tblBody_0'));
      expect((<Immutable.List<MSRiskAssessment>>loadedData).count()).toEqual(loadedDataCount);
    }));

    it('remove button should be present in actions  column', fakeAsync(() => {
      fixture.detectChanges();
      tick(100);
      let actions: Array<AeDataTableAction> = component.actions.toArray();
      expect(actions.length).toEqual(1);
      expect(CommonTestHelper.hasGivenButton(actions, 'Remove')).toBeTruthy();
    }));
    it('should be able to delete risk assessment', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      let item = loadedData.get(0);
      component.removeAction.next(item);
      fixture.detectChanges();
      tick();
      expect(component.showRemoveDialog).toBeTruthy();
      expect(component.selectedRecord).toBeDefined();
      expect(component.selectedRecord.Name).toEqual((<MSRiskAssessment>item).Name)
    }));
    it('it should launch risk-assessment-selector component when clicked on from library option from add button', fakeAsync(() => {
      component.addFromLibraryCommand.next();
      fixture.detectChanges();
      tick();
      expect(component.showLibrarySlideOut).toBeTruthy();
    }));
    it('it should launch risk-assessment-selector component when clicked on from other option from add button', fakeAsync(() => {
      fixture.detectChanges();
      component.addFromComputerCommand.next();
      tick();
      expect(component.showComputerSlideOut).toBeTruthy();
    }));
  });

  describe('should be able to navigate to facilities affected by works tab', () => {
    beforeEach(() => {
      tabs = component.tabComponent.tabs;
      let tab = tabs[1];
      component.tabComponent.tabHeaderClick(tab, 1);
      fixture.detectChanges();
    });
    beforeEach(() => {
      component.tabComponent.onTabIndexChange.subscribe(index => {
        if (index) {
          fixture.detectChanges();
        }
      });
    });
    it('facilities affected by works tab should be loaded', () => {
      expect(component.tabComponent.getSelectedTabIndex()).toEqual(1);
    });
    it('should have one text area field', fakeAsync(() => {
      tick();
      let ele = fixture.debugElement.query(By.css('textarea'));
      expect(ele).toBeDefined();
    }));
    it('text area should display the previously captured value', fakeAsync(() => {
      tick();
      let previousValue = testMSData.FacilitiesEffectedByWork;
      let displayedValue = component.furtherInformationForm.get('FacilitiesAffectedText').value;
      expect(previousValue).toBeDefined(displayedValue);
    }));
  });

  describe('should be able to navigate to forseeable addverse effects tab', () => {
    beforeEach(() => {
      tabs = component.tabComponent.tabs;
      let tab = tabs[2];
      component.tabComponent.tabHeaderClick(tab, 2);
      fixture.detectChanges();
    });
    beforeEach(() => {
      component.tabComponent.onTabIndexChange.subscribe(index => {
        if (index) {
          fixture.detectChanges();
        }
      });
    });
    it('facilities affected by works tab should be loaded', () => {
      expect(component.tabComponent.getSelectedTabIndex()).toEqual(2);
    });
    it('should have one text area field', fakeAsync(() => {
      tick();
      let ele = fixture.debugElement.query(By.css('textarea'));
      expect(ele).toBeDefined();
    }));
    it('text area should display the previously captured value', fakeAsync(() => {
      tick();
      let previousValue = testMSData.ForeseeAdverseEffects;
      let displayedValue = component.furtherInformationForm.get('ForeseeableAffectsText').value;
      expect(previousValue).toBeDefined(displayedValue);
    }));
  });

  describe('should be able to navigate to Monitoring systems tab', () => {
    beforeEach(() => {
      tabs = component.tabComponent.tabs;
      let tab = tabs[3];
      component.tabComponent.tabHeaderClick(tab, 3);
      fixture.detectChanges();
    });
    beforeEach(() => {
      component.tabComponent.onTabIndexChange.subscribe(index => {
        if (index) {
          fixture.detectChanges();
        }
      });
    });
    it('facilities affected by works tab should be loaded', () => {
      expect(component.tabComponent.getSelectedTabIndex()).toEqual(3);
    });
    it('should have one text area field', fakeAsync(() => {
      tick();
      let ele = fixture.debugElement.query(By.css('textarea'));
      expect(ele).toBeDefined();
    }));
    it('text area should display the previously captured value', fakeAsync(() => {
      tick();
      let previousValue = testMSData.MonitoringSystems;
      let displayedValue = component.furtherInformationForm.get('MonitoringText').value;
      expect(previousValue).toBeDefined(displayedValue);
    }));
  });
  describe('should be able to save the data entered in all three tabs', () => {
    beforeEach(() => {
      component._savingMethodStatementObject.subscribe(val => {
        modifiedData = val;
      });
    });
    beforeEach(() => {
      let form = component.furtherInformationForm;
      form.get('FacilitiesAffectedText').setValue(testMSData.FacilitiesEffectedByWork + '_newValue');
      form.get('ForeseeableAffectsText').setValue(testMSData.ForeseeAdverseEffects + '_newValue');
      form.get('MonitoringText').setValue(testMSData.MonitoringSystems + '_newValue');
      fixture.detectChanges();
      component.submitData();
      fixture.detectChanges();
    });
    it('should be able to save the updated data', fakeAsync(() => {
      tick();
      let updatedData = component.methodStatement;
      expect(modifiedData).toBeDefined();
      expect(modifiedData).toEqual(updatedData);
    }));
  });
  describe('should be able to open risk assessment selecttor component when clicked on from library option in Add button', () => {
    beforeEach(() => {
      component.addFromLibraryCommand.next();
      fixture.detectChanges();
    });
    beforeEach(() => {
      let _raSelectRequest = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams('Status', '2')]);
      _raSelectRequest.Params.push(new AtlasParams('Example', component.methodStatement.IsExample));
      store.dispatch(new LoadLiveRiskAssessmentsAction(_raSelectRequest));
      store.dispatch(new LoadSitesCompleteAction(MockStoreProviderFactory.getTestSites()));
      store.dispatch(new LoadLiveRiskAssessmentsCompleteAction(MockStoreProviderFactory.getLiveRAs()));
    });
    beforeEach(() => {
      raFixture = TestBed.createComponent(RiskAssessmentSelectorComponent);
      raSelectorComponent = raFixture.componentInstance;
      raSelectorComponent.methodStatementExample = testMSData.IsExample;
      raSelectorComponent.selectedRiskAssessments = component.msSelectedRiskAssessments;
      raFixture.detectChanges();
    });
    beforeEach(() => {
      raSelectorComponent.liveRiskAssessments$.subscribe(ra => {
        if (ra) {
          liveRAData = ra.toArray();
        }
      });
      store.let(fromRoot.getMSRiskAssessmentsTotalCount).subscribe(count => {
        oldMSRACount = count;
      });
      raSelectorComponent._selectRA.subscribe((selected: RiskAssessment[]) => {
        if (selected) {
          newMSRACount = selected.length;
        }
      });
    });
    it('should be able to open risk assessment selector', fakeAsync(() => {
      tick();
      raSelectorComponent.ngOnInit();
      expect(component.showLibrarySlideOut).toBeTruthy();
      let raSelector = raFixture.debugElement.query(By.css('.risk-assessment-selector'));
      expect(raSelector).toBeTruthy();
    }));
    it('risk assessment selector component- should have risk assessments grid', fakeAsync(() => {
      tick();
      raSelectorComponent.ngOnInit();
      tick(100);
      let raGrid = raFixture.debugElement.query(By.css('#riskAssessmentsGrid_divBody_0'));
      expect(raGrid).toBeDefined();
    }));
    it('risk assessment selector component- risk assessments grid-sholud show live risk assessments', fakeAsync(() => {
      tick();
      expect(liveRAData.length).toBeDefined(MockStoreProviderFactory.getLiveRAs().Entities.length);
    }));
    it('risk assessment selector component- should be able to select risk assessments to add to method statement', fakeAsync(() => {
      tick();
      let raToAdd = liveRAData[0];
      raSelectorComponent.onSelectRow(true, raToAdd);
      raSelectorComponent.onRASelectorFormSubmit('submit');
      fixture.detectChanges();
      tick();
      expect(newMSRACount).toEqual(3);
    }));
  });
  describe('should be able to open add risk assessment component when clicked on from other option in Add button', () => {
    beforeEach(() => {
      component.addFromComputerCommand.next();
    });
    beforeEach(() => {
      raInfoFixture = TestBed.createComponent(InformationFromComputerComponent);
      raInformationComponent = raInfoFixture.componentInstance;
      raInformationComponent.methodstatement = testMSData;
      let contextObj = Object.create({});
      let submitEvent = new BehaviorSubject<boolean>(false);
      let isValidEvent = new EventEmitter<boolean>();
      contextObj['submitEvent'] = submitEvent;
      contextObj['isValidEvent'] = isValidEvent;
      component.otherracontext = contextObj;
      raInformationComponent.context = component.otherracontext;
      raInfoFixture.detectChanges();
      raInformationComponent.ngOnInit();
    });
    beforeEach(() => {
      raInformationComponent.onMSOtherRAFormCancel.subscribe(val => {
        isOtherRASlidserClosed = val;
      });
      raInformationComponent.onMSOtherRAFormSubmit.subscribe(val => {
        otherRAData = val;
      });
    });
    it('should be able to open Add risk assessment', fakeAsync(() => {
      tick();
      expect(component.showComputerSlideOut).toBeTruthy();
      expect(raInformationComponent).toBeTruthy();
    }));
    it('Add risk assessment- should have 20 input fields to add upto 10 risk assessments', fakeAsync(() => {
      tick();
      let raSlider = raInfoFixture.debugElement.queryAll(By.css('input'));
      expect(raSlider.length).toEqual(20);
    }));
    it('Add risk assessment- should have ADD and CLOSE buttons', fakeAsync(() => {
      tick();
      let raSlider = raInfoFixture.debugElement.queryAll(By.css('li'));
      expect(raSlider.length).toEqual(2);
      expect(raSlider[0].nativeElement.innerText).toEqual('CLOSE');
      expect(raSlider[1].nativeElement.innerText).toEqual('ADD');
    }));
    it('Add risk assessment- should be able to close when clicked on CLOSE button', fakeAsync(() => {
      tick();
      raInformationComponent.onFormCancel('cancel');
      raInfoFixture.detectChanges();
      tick();
      expect(isOtherRASlidserClosed).toBeTruthy();
    }));
    it('Add risk assessment- should be able to add risk assessmenst when submitted with proper data', fakeAsync(() => {
      tick();
      let maxFiledCount = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      for (let item of maxFiledCount) {
        raInformationComponent.msOtherRiskAssessmentsForm.get('OtherNumber' + item).setValue('otherNumber_' + item);
        raInformationComponent.msOtherRiskAssessmentsForm.get('OtherName' + item).setValue('OtherName' + item);
      }
      raInformationComponent.onMSOtherRiskAssessmentsSubmitted(true);
      raInfoFixture.detectChanges();
      tick();
      expect(otherRAData).toBeDefined();
    }));
  });

});
