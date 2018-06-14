import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceofeventsComponent } from './sequenceofevents.component';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { StoreInjectorComponent } from './../../../../shared/testing/mocks/components/store-injector/store-injector.component';
import { Store, Action, StoreModule } from '@ngrx/store';
import { LocaleServiceStub } from './../../../../shared/testing/mocks/locale-service-stub';
import { LocalizationConfigStub } from './../../../../shared/testing/mocks/localization-config-stub';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { RouterMock } from './../../../../shared/testing/mocks/router-stub';
import { ClaimsHelperServiceStub } from './../../../../shared/testing/mocks/claims-helper-service-mock';
import { RouteParamsMock } from './../../../../shared/testing/mocks/route-params-mock';
import { Subject, Observer, BehaviorSubject } from 'rxjs';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { TranslationServiceStub } from './../../../../shared/testing/mocks/translation-service-stub';
import { reducer } from './../../../../shared/reducers/index';
import { CommonModule } from '@angular/common';
import { MethodStatementCopyModule } from './../../../../method-statements/method-statement-copy/method-statement-copy.module';
import { AtlasElementsModule } from './../../../../atlas-elements/atlas-elements.module';
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasSharedModule } from './../../../../shared/atlas-shared.module';
import { routes } from './../../manage-method-statements.routes';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbServiceStub } from './../../../../shared/testing/mocks/breadcrumb-service-mock';
import { LocalizationConfig } from './../../../../shared/localization-config';
import { ActivatedRouteStub } from './../../../../shared/testing/mocks/activated-route-stub';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { RouteParams } from './../../../../shared/services/route-params';
import { MethodstatementContainerComponent } from '../../containers/methodstatement-container/methodstatement-container.component';
import { GeneralComponent } from '../../components/general/general.component';
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
import { By } from '@angular/platform-browser';
import { ManageListComponent } from './../../../../method-statements/components/manage-list/manage-list.component';
import { RiskAssessmentSharedModule } from './../../../../risk-assessment/risk-assessment-shared/risk-assessment-shared.module';
import { DocumentSharedModule } from './../../../../document/document-shared/document-shared.module';
import { PlantandequipmentsharedModule } from './../../../../method-statements/plantandequipment/plantandequipmentshared/plantandequipmentshared.module';
import { EmailSharedModule } from './../../../../email-shared/email-shared.module';
import { ManageMethodStatementsModule } from './../../manage-methodstatements.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PreviewComponent } from '../../components/preview/preview.component';
import { MsCopyComponent } from '../../../method-statement-copy/components/ms-copy/ms-copy.component';
import { DocumentDetailsService } from './../../../../document/document-details/services/document-details.service';
import { DocumentDetailsServiceStub } from './../../../../shared/testing/mocks/document-details-service-stub';
import { Http } from '@angular/http';
import { mockHttpProvider } from './../../../../shared/testing/mocks/http-stub';
import { ProcedureCode, MethodStatement } from './../../../../method-statements/models/method-statement';
import { LoadMethodStatementByIdCompleteAction } from '../../actions/manage-methodstatement.actions';
import { tick } from '@angular/core/testing';
import { MSProcedureMockData } from './../../../../shared/testing/mocks/data/msprocedure-data';
import { fakeAsync } from '@angular/core/testing';
import { ProcedureService } from './../../../../method-statements/procedures/services/procedure.service';
import { ProcedureServiceStub } from './../../../../shared/testing/mocks/procedure-service-stub';

describe('Method Statements sequence of events Component', () => {
  let component: SequenceofeventsComponent;
  let fixture: ComponentFixture<SequenceofeventsComponent>;
  let store: Store<fromRoot.State>;
  let dispatchSpy: jasmine.Spy;
  let configLoaded: jasmine.Spy;
  let dataTableElement: any;

  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any
  let routeParamsStub: any;
  let _http: any;
  let msObject: any;

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
        StoreModule.provideStore(reducer)
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
        , { provide: ProcedureService, useValue: ProcedureServiceStub}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SequenceofeventsComponent);
    component = fixture.componentInstance;
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

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
    dataTableElement = fixture.debugElement.query(By.css('ae-datatable'));
    dispatchSpy = spyOn(store, 'dispatch');

    msObject =  JSON.parse(MSProcedureMockData);
  });

  describe('Component launch', () => {
    it('Sequence of events page must be loaded without any errors', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('"Add Procedure" button', () => {
    beforeEach(() => {
      spyOn(component, 'triggerMSProcAdd').and.callThrough();
    });

    it('Verify whether "Add Procedure" button is present in the UI or not.', () => {
      let addProcedureButton = fixture.debugElement.query(By.css('#sequenceofevents_AeButton_1_aeButton_1'));
      expect(addProcedureButton).toBeDefined();
    });

    it('Verify whether user is able to click on "Add Procedure" button or not.', async(() => {
      let button = fixture.debugElement.nativeElement.querySelector('#sequenceofevents_AeButton_1_aeButton_1');
      button.click();

      fixture.whenStable().then(() => {
        expect(component.triggerMSProcAdd).toHaveBeenCalled();
        expect(component.triggerStatus).toBeTruthy();
      });
    }));

    it('When user clicks on "Add Procedure" button, slide-out to select applicable procedures must be opened.', fakeAsync(() => {
      dispatchSpy.and.callThrough();
      store.dispatch(new LoadMethodStatementByIdCompleteAction(msObject));
      tick(60);
      fixture.detectChanges();
      let button = fixture.debugElement.nativeElement.querySelector('#sequenceofevents_AeButton_1_aeButton_1');
      button.click();

      fixture.whenStable().then(() => {
        expect(component.triggerMSProcAdd).toHaveBeenCalled();
        expect(component.triggerStatus).toBeTruthy();
        fixture.detectChanges();
        expect(fixture.debugElement.nativeElement.querySelector('#add_msprocedure_slideout')).toBeDefined();
        expect((<HTMLElement>fixture.debugElement.nativeElement.querySelector('#add_msprocedure_slideout')).classList.contains('slide--animate')).toBeTruthy();
      });
    }));
  });

  describe('Initial values', () => {
    it('Verify whether procedure code/type set as "Sequence of Events" or not.', () => {
      expect(component.procedureCode).toBe(ProcedureCode.SequenceOfEvents);
    });

    it('Verify whether current method statement information loaded into the component or not.', fakeAsync(() => {
      dispatchSpy.and.callThrough();
      store.dispatch(new LoadMethodStatementByIdCompleteAction(msObject));

      tick(60);
      expect(component).not.toBeNull();
      expect(component.methodStatement).toBeDefined();
    }));
  });
});
