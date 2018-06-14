import { DateTimeHelper } from './../../../../shared/helpers/datetime-helper';
import { AeFormComponent } from './../../../../atlas-elements/ae-form/ae-form.component';
import { LoadMethodStatementByIdCompleteAction } from './../../actions/manage-methodstatement.actions';
import { NAMED_ENTITIES } from '@angular/compiler/src/ml_parser/tags';
import { MethodStatement } from './../../../models/method-statement';
import { createSelectOptionFromArrayList } from '../../../../employee/common/extract-helpers';
import { Subject, Observer } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { MockStoreProviderFactory } from './../../../../shared/testing/mocks/mock-store-provider-factory';
import { LoadSitesAction, LoadSitesCompleteAction } from './../../../../shared/actions/company.actions';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AtlasElementsComponent } from './../../../../atlas-design/atlas-elements/atlas-elements.component';
import { mockHttpProvider } from './../../../../shared/testing/mocks/http-stub';
import { MockBackend } from '@angular/http/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import { RouteParamsMock } from './../../../../shared/testing/mocks/route-params-mock';
import { RouteParams } from './../../../../shared/services/route-params';
import { DocumentDetailsServiceStub } from './../../../../shared/testing/mocks/document-details-service-stub';
import { DocumentDetailsService } from './../../../../document/document-details/services/document-details.service';
import { UpdateMsProcedureComponent } from './../update-ms-procedure/update-ms-procedure.component';
import { MsProcedureContainerComponent } from './../../containers/ms-procedure-container/ms-procedure-container.component';
import { AddProcedureComponent } from './../add-procedure/add-procedure.component';
import { SaftyResponsibilitiesComponent } from './../safty-responsibilities/safty-responsibilities.component';
import { AddMsProcedureComponent } from './../add-ms-procedure/add-ms-procedure.component';
import { ProcedureQuickViewComponent } from './../procedure-quick-view/procedure-quick-view.component';
import { InformationFromComputerComponent } from '../information-from-computer/information-from-computer.component';
import { ActivatedRouteStub } from './../../../../shared/testing/mocks/activated-route-stub';
import { RouterMock } from './../../../../shared/testing/mocks/router-stub';
import { LocalizationConfigStub } from './../../../../shared/testing/mocks/localization-config-stub';
import { LocalizationConfig } from './../../../../shared/localization-config';
import { SafetyProceduresComponent } from './../safety-procedures/safety-procedures.component';
import { SafetyResponsibilitiesAddUpdateComponent } from './../safety-responsibilities-add-update/safety-responsibilities-add-update.component';
import { PersonalProtectiveEquipmentComponent } from './../personal-protective-equipment/personal-protective-equipment.component';
import { AddPlantEquipmentComponent } from './../add-plant-equipment/add-plant-equipment.component';
import { SupportingDocumentationComponent } from './../supporting-documentation/supporting-documentation.component';
import { FurtherInformationComponent } from './../further-information/further-information.component';
import { SafetyPrecautionsComponent } from './../safety-precautions/safety-precautions.component';
import { PlantEquipmentComponent } from './../plant-equipment/plant-equipment.component';
import { SequenceofeventsComponent } from './../sequenceofevents/sequenceofevents.component';
import { MethodstatementContainerComponent } from './../../containers/methodstatement-container/methodstatement-container.component';
import { MsCopyComponent } from './../../../method-statement-copy/components/ms-copy/ms-copy.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EmailSharedModule } from './../../../../email-shared/email-shared.module';
import { AtlasSharedModule } from './../../../../shared/atlas-shared.module';
import { DocumentSharedModule } from './../../../../document/document-shared/document-shared.module';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { RiskAssessmentSharedModule } from './../../../../risk-assessment/risk-assessment-shared/risk-assessment-shared.module';
import { PlantandequipmentsharedModule } from './../../../plantandequipment/plantandequipmentshared/plantandequipmentshared.module';
import { routes } from './../../../../atlas-design/atlas-design.routes';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormBuilderService } from './../../../../shared/services/form-builder.service';
import { ClaimsHelperServiceStub } from './../../../../shared/testing/mocks/claims-helper-service-mock';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { reducer } from './../../../../shared/reducers/index';
import { Store, StoreModule, Action } from '@ngrx/store';
import { TranslationServiceStub } from './../../../../shared/testing/mocks/translation-service-stub';
import { AtlasElementsModule } from './../../../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbServiceStub } from './../../../../shared/testing/mocks/breadcrumb-service-mock';
import { LocaleServiceStub } from './../../../../shared/testing/mocks/locale-service-stub';
import { ManageListComponent } from './../../../components/manage-list/manage-list.component';
import { MethodStatementCopyModule } from './../../../method-statement-copy/method-statement-copy.module';
import { GeneralComponent } from './general.component';
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import * as fromRoot from './../../../../shared/reducers';
import { PreviewComponent } from "./../preview/preview.component";
import { EventEmitter, ChangeDetectorRef } from '@angular/core';
import * as Immutable from 'immutable';
import { By } from '@angular/platform-browser';

describe('GeneralComponent', () => {
  let component: GeneralComponent;
  let fixture: ComponentFixture<GeneralComponent>;
  let store: Store<fromRoot.State>;
  let submitEvent: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  let isValidEvent: EventEmitter<any> = new EventEmitter<any>();

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

  let localeService: any = new LocaleServiceStub();//= new LocaleService(<LocaleConfig>{ languageCode: 'en-GB' }, <LocaleStorage>{});
  let translationService: any = new TranslationServiceStub();  //new TranslationService(localeService, <TranslationConfig>{ translationData: {}, providers: [] }, <TranslationProviderStub>{}, <TranslationHandlerStub>{});
  let localizationConfig: any = new LocalizationConfigStub(); //new LocalizationConfig(localeService, translationService, injector);
  //let combineReducer: ActionReducer<State> = combineReducers(reducers);
  let changeDetectorRef: ChangeDetectorRef;
  let activatedRoute: ActivatedRoute;
  let router: any = new RouterMock();
  let fb: FormBuilder = new FormBuilder();
  let claimsHelper: any = new ClaimsHelperServiceStub();
  let breadcrumbService: any;
  let routeParams: any = new RouteParamsMock();
  let actions = new Subject<Action>();
  let states = new Subject<fromRoot.State>();
  let despatcher: Observer<Action> = new BehaviorSubject<any>('');
  let methodStatement: MethodStatement = new MethodStatement();
  let loadedSites: Immutable.List<AeSelectItem<string>> = null;

  actions = new Subject<Action>();

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
        , AtlasElementsComponent
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
        , FormBuilderService
        , BaseRequestOptions
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);
    component.context = { submitEvent: submitEvent, isValidEvent: isValidEvent };

    fixture.detectChanges();

    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    routerMock = fixture.debugElement.injector.get(Router);
    activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
    claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
    routeParamsStub = fixture.debugElement.injector.get(RouteParams);

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

  });

  beforeEach(() => {

    states = new Subject<fromRoot.State>();
    configLoaded = spyOn(localizationConfig, 'load');
    dispatchSpy = spyOn(store, 'dispatch');
  });

  describe('GeneralComponent launch', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

  });
  // describe('Client Login - No Cid', () => {

  describe('Should trigger dependency data load on ngOnInit', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should load sites when no sites were found in the store', () => {
      let siteLoadActionPayLoad: LoadSitesAction = (new LoadSitesAction(false));
      expect(dispatchSpy).toHaveBeenCalledWith(siteLoadActionPayLoad);
    });
  });

  describe('Should be subscribed to site values', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();

      store.dispatch(new LoadSitesAction(false))
      let mockedSites = MockStoreProviderFactory.getTestSites();
      store.dispatch(new LoadSitesCompleteAction(mockedSites));

      component.siteOptions.subscribe((res => {
        loadedSites = res;
      }));
      fixture.detectChanges();
    });

    it('Site data check', fakeAsync(() => {
      let mockedImmutableSitesData: Immutable.List<AeSelectItem<string>> = MockStoreProviderFactory.getMSTestSitesImmutableData();
      tick();
      expect(loadedSites.toArray().length).toEqual(mockedImmutableSitesData.toArray().length + 1);
    }));

    it('Checking the form data', fakeAsync(() => {
      let formFields = []; let formFieldsControls = [];

      component.formFields.map((keyValuePair) => {
        formFields.push(keyValuePair.field.name);
      });
      for (let formFieldsData in component.addUpdateMsGeneralForm.controls) {
        formFieldsControls.push(formFieldsData);
      }
      tick();
      expect(formFields.length).toEqual(formFieldsControls.length + 1);
    }));

    it('check the Name fileds is mandatory', () => {
      let name = component.addUpdateMsGeneralForm.get('Name');
      name.markAsDirty();

      let nameControlDebug = fixture.debugElement.query(By.css('#addMsGeneralForm_AeInput_0'));
      let nameControl = nameControlDebug.nativeElement;
      nameControlDebug.triggerEventHandler('change', { target: { value: null } });
      fixture.detectChanges();
      expect(name.errors.required).toBeTruthy();
    });

    it('check the StartDate fileds is mandatory', () => {
      let startDate = component.addUpdateMsGeneralForm.get('StartDate');
      startDate.markAsDirty();

      let startDateControlDebug = fixture.debugElement.query(By.css('#addMsGeneralForm_AeDateTimePicker_1_ae-input_3'));
      let startDateControl = startDateControlDebug.nativeElement;
      startDateControlDebug.triggerEventHandler('change', { target: { value: null } });
      fixture.detectChanges();
      expect(startDate.errors.required).toBeTruthy();
    });

    it('check the SiteId fileds is mandatory', () => {
      expect(component.addUpdateMsGeneralForm.controls['SiteId'].value == ' ').toBe(true);
    });


    it('check the Name Field datatype', () => {
      let nameControl = fixture.debugElement.query(By.css('#addMsGeneralForm_AeInput_0')).nativeElement;
      let typeOfControl = nameControl instanceof HTMLInputElement;
      expect(typeOfControl).toBeTruthy();
    });

    it('check the SiteId Field datatype', () => {
      let siteIdControl = fixture.debugElement.query(By.css('#addMsGeneralForm_AeSelect_3')).nativeElement;
      let typeOfControl = siteIdControl instanceof HTMLSelectElement;
      expect(typeOfControl).toBeTruthy();
    });

    it('compare Enddate with StartDate validation', fakeAsync(() => {
      let startDate = component.addUpdateMsGeneralForm.get('StartDate');
      // startDate.markAsDirty();
      let startDateControlDebug = fixture.debugElement.query(By.css('#addMsGeneralForm_AeDateTimePicker_1_ae-input_3'));
      let startDateControl = startDateControlDebug.nativeElement;
      (<HTMLInputElement>startDateControl).value = "01/11/2017";
      // startDateControlDebug.triggerEventHandler('change', { target: { value: '01/11/2017' } });
      tick(100);
      let endDate = component.addUpdateMsGeneralForm.get('EndDate');
      endDate.markAsDirty();
      let endDateControlDebug = fixture.debugElement.query(By.css('#addMsGeneralForm_AeDateTimePicker_2_ae-input_3'));
      let endDateControl = endDateControlDebug.nativeElement;
      (<HTMLInputElement>endDateControl).value = "30/10/2017";
      endDateControlDebug.triggerEventHandler('change', { target: { value: '30/10/2017' } });
      fixture.detectChanges();
      expect(endDate.errors.datecompare).toBeTruthy();
    }));

    it('if "NewLocationOfWork" is selected in the site field, then NewLocationOfWork field will be displayed', () => {
      let form = component.addUpdateMsGeneralForm;
      let responsiblePerson = form.controls.SiteId;
      responsiblePerson.setValue('9999');
      fixture.detectChanges();
      expect(form.controls.NewLocationOfWork).toBeTruthy();
    });

    it('if "NewLocationOfWork" is selected in the site field, then NewLocationOfWork field has required validation', () => {
      let form = component.addUpdateMsGeneralForm;
      let responsiblePerson = form.controls.SiteId;
      responsiblePerson.setValue('9999');
      fixture.detectChanges();
      let newLocationOfWork = component.addUpdateMsGeneralForm.get('NewLocationOfWork');
      newLocationOfWork.markAsDirty();
      let newLocationOfWorkControlDebug = fixture.debugElement.query(By.css('#addMsGeneralForm_AeInput_4'));
      let newLocationOfWorkControl = newLocationOfWorkControlDebug.nativeElement;
      newLocationOfWorkControlDebug.triggerEventHandler('change', { target: { value: null } });
      fixture.detectChanges();
      expect(newLocationOfWork.errors.required).toBeTruthy();
    });


    describe('Edit Mode', () => {
      beforeEach(() => {
        methodStatement = MockStoreProviderFactory.getTestMethodStatementData();
        store.dispatch(new LoadMethodStatementByIdCompleteAction(methodStatement));
        fixture.detectChanges();
      });

      it('Checking mockup data with form data', fakeAsync(() =>{
        let msMokeupData: MethodStatement = Object.assign({}, methodStatement, <MethodStatement>methodStatement);
        let formData = component.addUpdateMsGeneralForm.value;
        let formDataValues = []; let msMokeupDataValues = [];
        for (let fieldsData in formData) {
          if(fieldsData == 'StartDate'){
            msMokeupDataValues.push(new Date(msMokeupData[fieldsData]));
          }else{
            msMokeupDataValues.push(msMokeupData[fieldsData]);
          }
          
          formDataValues.push(formData[fieldsData])
        }
        tick(200);
        fixture.detectChanges();
        //remove StartDate from formData and msMockupData since they will not match because of time adding in date time picker
        let formStartDate = DateTimeHelper.getDatePart(formDataValues['StartDate']);
        let mockUpStartDate =  DateTimeHelper.getDatePart(msMokeupDataValues['StartDate']);
        expect(formStartDate).toEqual(mockUpStartDate);
        //now remove this key from both values
        delete formDataValues['1'];
        delete msMokeupDataValues['1'];
        expect(formDataValues).toEqual(msMokeupDataValues);
      }));

      it('Updating Name value and comparing the Submitted form data', fakeAsync(() => {
        let form = component.addUpdateMsGeneralForm;
        let nameControlDebug = fixture.debugElement.query(By.css('#addMsGeneralForm_AeInput_0'));
        let nameControl = nameControlDebug.nativeElement;
        let typeOfControl = nameControl instanceof HTMLInputElement;
        expect(form.controls['Name']).not.toBeUndefined();
        expect(methodStatement.Name).toEqual((<HTMLInputElement>nameControl).value);
        (<HTMLInputElement>nameControl).value = "Name Updated";
        nameControlDebug.triggerEventHandler('change', { target: { value: 'Name Updated' } });
        fixture.detectChanges();
        tick(100);
        component._onAeSubmit.subscribe(val => {
          expect(val.Name).toEqual('Name Updated');
        });
        expect(form.controls['Name'].value).toEqual('Name Updated');
        component.context.submitEvent.next(true);
        fixture.detectChanges();
        tick(200);

      }));


    });



  });

});
