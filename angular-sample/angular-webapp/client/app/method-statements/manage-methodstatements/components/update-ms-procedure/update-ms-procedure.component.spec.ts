import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceofeventsComponent } from '../../components/sequenceofevents/sequenceofevents.component';
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
import { FormBuilderService } from './../../../../shared/services/form-builder.service';
import { AeFormComponent } from './../../../../atlas-elements/ae-form/ae-form.component';
import { CkEditorModule } from './../../../../atlas-elements/ck-editor/ck-editor.module';
import { AeInputComponent } from './../../../../atlas-elements/ae-input/ae-input.component';

describe('Method Statements update ms procedure Component', () => {
  let component: UpdateMsProcedureComponent;
  let fixture: ComponentFixture<UpdateMsProcedureComponent>;
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
        StoreModule.provideStore(reducer),
        CkEditorModule
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
        , { provide: ProcedureService, useValue: ProcedureServiceStub }
        , FormBuilderService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateMsProcedureComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);
    msObject = JSON.parse(MSProcedureMockData);
    component.msProcedure = msObject.MSProcedures[0];

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
  });

  describe('Component launch', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('Update MS Procedure slideout-panel must be loaded without any errors', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Update MS Procedure form', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('Verify whether Update MS Procedure slideout-panel title is "Update procedure" or not.', () => {
      let titleElement = <HTMLElement>fixture.debugElement.query(By.css('#updatemsprocedure_AeForm_2'))
        .query(By.css('.so-panel__title'))
        .query(By.css('h3')).nativeElement;
      expect(titleElement.innerText.trim()).toBe('MANAGE_METHOD_STM.SEQUENCE_OF_EVENTS.UPDATE_PROCEDURE');
    });

    it('Verify whether Update MS Procedure slideout-panel has agreed field names or not.', () => {
      let nameElement = <HTMLElement>fixture.debugElement.query(By.css('#updatemsprocedure_AeForm_2'))
        .query(By.css('.so-panel__content'))
        .queryAll(By.css('.information-grid__item--input'))[0]
        .query(By.css('#updatemsprocedure_AeForm_2_label_0'))
        .nativeElement;
      let nameText = nameElement.innerText.trim();
      expect(nameText).toBe('Name *');

      let descriptionElement = <HTMLElement>fixture.debugElement.query(By.css('#updatemsprocedure_AeForm_2'))
        .query(By.css('.so-panel__content'))
        .queryAll(By.css('.information-grid__item--input'))[1]
        .query(By.css('#updatemsprocedure_AeForm_2_label_1'))
        .nativeElement;
      let descText = descriptionElement.innerText.trim();
      expect(descText).toBe('Description');
    });

    it('Verify whether Update MS Procedure slideout-panel has agreed field types.', () => {
      let nameElement = <HTMLElement>fixture.debugElement.query(By.css('#updatemsprocedure_AeForm_2'))
        .query(By.css('.so-panel__content'))
        .queryAll(By.css('.information-grid__item--input'))[0]
        .query(By.css('#updatemsprocedure_AeForm_2_AeInput_0'))
        .nativeElement;
      let typeOfControl = nameElement instanceof HTMLInputElement;
      expect(typeOfControl).toBeTruthy();

      let descriptionElement = <HTMLElement>fixture.debugElement.query(By.css('#updatemsprocedure_AeForm_2'))
        .query(By.css('.so-panel__content'))
        .queryAll(By.css('.information-grid__item--input'))[1]
        .query(By.css('#updatemsprocedure_AeForm_2_AeRichTextEditor_1'))
        .nativeElement;
      typeOfControl = descriptionElement instanceof HTMLTextAreaElement;
      expect(typeOfControl).toBeTruthy();
    });

    it('Verify whether provided procedure information is appearing in fields or not', () => {
      let nameElement = <HTMLInputElement>fixture.debugElement.query(By.css('#updatemsprocedure_AeForm_2'))
        .query(By.css('.so-panel__content'))
        .queryAll(By.css('.information-grid__item--input'))[0]
        .query(By.css('#updatemsprocedure_AeForm_2_AeInput_0'))
        .nativeElement;
      expect(nameElement.value).toBe(component.msProcedure.Name);
    });

    it('Verify whether "Update" button is appearning in UI or not', () => {
      let updateBtn = <HTMLElement>fixture.debugElement.query(By.css('#updatemsprocedure_AeForm_2'))
        .query(By.css('.so-panel__footer'))
        .queryAll(By.css('li'))[1]
        .query(By.css('a#updatemsprocedure_AeForm_2_AeAnchor_1')).nativeElement;
      expect(updateBtn).toBeDefined();
    });

    it('Verify whether user is able to click on "Update" button or not', () => {
      let updatebtnSpy = spyOn(component, 'onSubmit');
      let closeBtn = <HTMLElement>fixture.debugElement.query(By.css('#updatemsprocedure_AeForm_2'))
        .query(By.css('.so-panel__footer'))
        .queryAll(By.css('li'))[1]
        .query(By.css('a#updatemsprocedure_AeForm_2_AeAnchor_1')).nativeElement;
      closeBtn.click();
      fixture.whenStable().then(() => {
        expect(updatebtnSpy).toHaveBeenCalled();
      });
    });

    it('Verify whether "Close" button is appearning in UI or not', () => {
      let closeBtn = <HTMLElement>fixture.debugElement.query(By.css('#updatemsprocedure_AeForm_2'))
        .query(By.css('.so-panel__footer'))
        .queryAll(By.css('li'))[0]
        .query(By.css('label.button.button--inline-block')).nativeElement;
      expect(closeBtn).toBeDefined();
    });

    it('Verify whether user is able to click on "Close" button or not', () => {
      let closebtnSpy = spyOn(component, 'onCancel');
      let closeBtn = <HTMLElement>fixture.debugElement.query(By.css('#updatemsprocedure_AeForm_2'))
        .query(By.css('.so-panel__footer'))
        .queryAll(By.css('li'))[0]
        .query(By.css('label.button.button--inline-block')).nativeElement;
      closeBtn.click();
      fixture.whenStable().then(() => {
        expect(closebtnSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Update MS Procedure slide-out panel save', () => {
    it('Verify whether validation messages are appearing under agreed fields or not', fakeAsync(() => {
      component.msProcedure.Name = '';
      tick();
      fixture.whenStable().then(() => {
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;
        let personName = form.formGroup.controls.Name;
        personName.markAsDirty();
        form._onFormSubmit.emit();
        fixture.detectChanges();
        expect(personName.hasError).toBeTruthy();

        let nameElement = <HTMLElement>fixture.debugElement.query(By.css('#updatemsprocedure_AeForm_2'))
          .query(By.css('.so-panel__content'))
          .queryAll(By.css('.information-grid__item--input'))[0]
          .query(By.css('.information-grid__item-value'))
          .query(By.css('span.error-text'))
          .nativeElement;
        expect(nameElement.innerText.trim()).toBe('Name is required');
      });
    }));

    it('Verify whether form is getting submitted with provided values of fields or not', fakeAsync(() => {
      let updatebtnSpy = spyOn(component, 'onSubmit');
      component.msProcedure.Name = 'AUT test procedure';
      component.msProcedure.Description = '<h1>AUT test procedure</h1>';
      tick();
      fixture.whenStable().then(() => {
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;
        form._onFormSubmit.emit();
        expect(updatebtnSpy).toHaveBeenCalled();
      });
    }));
  });
});
