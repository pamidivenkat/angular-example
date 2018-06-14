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
import { Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../../shared/reducers';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
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
import { PreviewComponent } from '../preview/preview.component';
import { BehaviorSubject } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { LoadPPECategoryGroupsAction, LoadPPECategoryGroupsCompleteAction } from '../../../../shared/actions/lookup.actions';
import { LoadMethodStatementByIdAction, LoadMethodStatementByIdCompleteAction } from '../../actions/manage-methodstatement.actions';
import { MethodStatement, MSPPE } from '../../../../method-statements/models/method-statement';
import { PPECategoryGroup, InjuryType, PPECategory } from '../../../../shared/models/lookup.models';
import { tick } from '@angular/core/testing';
import { fakeAsync } from '@angular/core/testing';
import { inject } from '@angular/core/testing';
import { MockStoreProviderFactory } from '../../../../shared/testing/mocks/mock-store-provider-factory';
import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import { isNullOrUndefined } from 'util';
import { By } from '@angular/platform-browser';
import { AeFormComponent } from '../../../../atlas-elements/ae-form/ae-form.component';
import { MSPPEMockStoreProviderFactory } from '../../../../shared/testing/mocks/ms-ppe-mock-store-provider-factory';

describe('PersonalProtectiveEquipmentComponent', () => {
  let component: PersonalProtectiveEquipmentComponent;
  let fixture: ComponentFixture<PersonalProtectiveEquipmentComponent>;
  let store: Store<fromRoot.State>;
  let dispatchSpy: jasmine.Spy;
  let configLoaded: jasmine.Spy;
  let submitEvent: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  let isValidEvent: EventEmitter<any> = new EventEmitter<any>();
  let formGroup: FormGroup;
  let componentInstance: SafetyPrecautionsComponent;

  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any
  let routeParamsStub: any;
  let _http: any;
  let methodStatement: MethodStatement;
  let ppeCategoryGroups: PPECategoryGroup[];

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
        , MessengerService
        , FormBuilderService
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
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalProtectiveEquipmentComponent);
    component = fixture.componentInstance;
    component.context = { submitEvent: submitEvent, isValidEvent: isValidEvent };
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
    dispatchSpy = spyOn(store, 'dispatch');
  });

  describe('Component launch', () => {
    it('should create', () => { 
      expect(component).toBeTruthy();
    });
  });

  describe('verifying form data', () => {

    beforeEach(() => {
      let statGroups = MSPPEMockStoreProviderFactory.getppeCategoryGroups();
      dispatchSpy.and.callThrough();
      store.dispatch(new LoadPPECategoryGroupsCompleteAction(statGroups.Entities));
      store.dispatch(new LoadMethodStatementByIdCompleteAction(MSPPEMockStoreProviderFactory.getMethodStatementMSPPEData()));
      component.ppeCategoryGroups.subscribe((val) => {
        ppeCategoryGroups = val;
      })
      component.methodStatementData.subscribe((val) => {
        methodStatement = val;
      });
      fixture.detectChanges();
    });

    it('ppecategory groups loaded', fakeAsync(() => {
      tick();
      let formFields = component.ppeFormVM.fieldsArray.filter(x => !x.context.getContextData().get('propertyValue'));
      expect(formFields.length).toEqual(ppeCategoryGroups.length);
    }));

    it('should have ten visible auto complete fields', () => {
      fixture.whenStable().then(() => {
        // fixture.detectChanges();
        expect(fixture.debugElement.nativeElement.getElementsByTagName('ae-autocomplete').length).toEqual(10);
      });
    });

    it('verify the count of other text fields', fakeAsync(() => {
      tick();
      let otherInputFields = component.ppeFormVM.fieldsArray.filter(x => x.context.getContextData().get('propertyValue'));
      let count = 0;
      otherInputFields.forEach(field => {
        if (field.context.getContextData().get('propertyValue').value) {
          count = count + 1;
        }
      });
      expect(count).toEqual(component.methodstatement.MSPPE.filter(x => x.PPECategory.Name == 'Other').length);
    }));


    it('check the sorting order of ppecategory groups in rendered form', fakeAsync(() => {
      tick();
      let formFields = component.ppeFormVM.fieldsArray.filter(x => !x.context.getContextData().get('propertyValue')).map(({ labelText }) => labelText);
      let categoryGroupsFields = ppeCategoryGroups.map(({ Name }) => Name);      
      expect(formFields).toEqual(categoryGroupsFields);
    }));


    it('verify whether the label names same as category groups names or not', fakeAsync(() => {
      tick();
      let id = 0;
      ppeCategoryGroups.forEach(x => {
        let labelId = '#ppeCategoryForm_label_';
        labelId = labelId + id;
        let labelField = fixture.debugElement.query(By.css(labelId)).nativeElement;
        expect(labelField.textContent.trim()).toEqual(x.Name);
        id = id + 2;
      })
    }));

    it('verify the placeholders in autocomplete fields', fakeAsync(() => {
      tick();
      let formAutoCompleteFields = component.ppeFormVM.fieldsArray.filter(x => !x.context.getContextData().get('propertyValue'));
      let id = 0;
      formAutoCompleteFields.forEach(field => {
        let inputId = '#ppeCategoryForm_AeAutoComplete_';
        inputId = inputId + id;
        let autoCompleteInputField = fixture.debugElement.query(By.css(inputId)).nativeElement;
        expect(autoCompleteInputField.placeholder).toEqual(field.context.getContextData().get('placeholder'));
        id = id + 2;
      })
    }));

    it('verify the placeholders in other text fields', fakeAsync(() => {
      tick();
      let otherInputFields = component.ppeFormVM.fieldsArray.filter(x => x.context.getContextData().get('propertyValue'));
      let id = 1;
      let isPlaceHolderValueMatching = false;
      otherInputFields.forEach(field => {
        if (field.context.getContextData().get('propertyValue').value) {
          let inputId = '#ppeCategoryForm_AeInput_';
          inputId = inputId + id;
          let otherInputField = fixture.debugElement.query(By.css(inputId)).nativeElement;
          expect(otherInputField.placeholder).toEqual(field.context.getContextData().get('placeholder'));
        }
        id = id + 2;
      })
    }));

    it('check the sorting order of items in autocomplete', fakeAsync(() => {
      let visibility = true;
      let formAutoCompleteFields = component.ppeFormVM.fieldsArray.filter(x => !x.context.getContextData().get('propertyValue'));

      formAutoCompleteFields.forEach(field => {
        let items = field.context.getContextData().get('items').value;
        let sortedItems = items.sort((a, b) => a.Name.localeCompare(b.Name));
        expect(items).toEqual(sortedItems);
      });

    }));

    it('verify the required validator for other text fields', fakeAsync(() => {

      let otherInputFields = component.ppeFormVM.fieldsArray.filter(x => x.context.getContextData().get('propertyValue'));
      otherInputFields.forEach(field => {
        expect(field.context.getContextData().get('required')).toBeTruthy();
      });

    }));

    it('verifying autocomplete fields prepopulated with existing data or not', fakeAsync(() => {
      let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;

      ppeCategoryGroups.forEach(catGroup => {
        let preselectedCategories = component.methodstatement.MSPPE.map(a => {
          return a.PPECategory;
        });
        preselectedCategories = preselectedCategories.filter(p => !isNullOrUndefined(p) && p.PPECategoryGroupId === catGroup.Id);
        let values = form.formGroup.controls[catGroup.Code].value;
        expect(values).toEqual(preselectedCategories);
      });

    }));

    it('verifying other text fields loaded with existing data or not', fakeAsync(() => {
      let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;

      let otherCategories = component.methodstatement.MSPPE.filter(x => x.PPECategory.Name == 'Other');

      otherCategories.forEach(catGroup => {
        let value = form.formGroup.controls[catGroup.PPECategory.PPECategoryGroup.Code + 'Other'].value;
        expect(value).toEqual(catGroup.PPEOtherCategoryValue);
      });

    }));


    it('check the visibility of Other text field if autocomplete has Other option selected', fakeAsync(() => {
      let visibility = true;
      let otherCategories = component.methodstatement.MSPPE.filter(x => x.PPECategory.Name == 'Other');
      otherCategories.forEach(cat => {
        visibility = component.ppeFormVM.fieldsArray.filter(x => x.field.name == cat.PPECategory.PPECategoryGroup.Code + "Other")[0].context.getContextData().get('propertyValue').value;
        expect(visibility).toBeTruthy();
      });
    }));

    it('check the visibility of Other text field when autocomplete does not have Other option selected', fakeAsync(() => {
      let visibility = false;
      let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;

      ppeCategoryGroups.forEach(catGroup => {

        let value = form.formGroup.controls[catGroup.Code].value.filter(x => x.Name == 'Other');
        visibility = component.ppeFormVM.fieldsArray.filter(x => x.field.name == catGroup.Code + "Other")[0].context.getContextData().get('propertyValue').value;
        if (value.length > 0) {
          expect(visibility).toBeTruthy();
        }
        else {
          expect(visibility).toBeFalsy();
        }
      });
    }));


    it('verify the submit event', fakeAsync(() => {
      component.context.submitEvent.next(true);
      component.context.submitEvent.subscribe((value) => {
        expect(value).toBeTruthy();
      });
    }));


    it('check the visibility of Other text field when user deselect Other category from Fall Protection autocomplete field', fakeAsync(() => {
      let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;
      let ppeCategoryGroup = ppeCategoryGroups.filter(x => x.Id == '4264b080-5ae7-4bd6-b3cc-ce141ce25f2a')[0];
      form.formGroup.controls[ppeCategoryGroup.Code].setValue(['e66ff66b-b8cb-4811-a8e5-e3e1680e68ff']);
      fixture.detectChanges();
      let visibility = component.ppeFormVM.fieldsArray.filter(x => x.field.name == ppeCategoryGroup.Code + 'Other')[0].context.getContextData().get('propertyValue').value;
      expect(visibility).toBeFalsy();
      expect(form.formGroup.controls[ppeCategoryGroup.Code + 'Other']).toBeFalsy();
    }));

    it('check the visibility of Other text field when user select Other category from Respiratory Protective Equipment (RPE) autocomplete', fakeAsync(() => {
      let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;
      let ppeCategoryGroup = ppeCategoryGroups.filter(x => x.Id == '184d62d6-a307-44a4-91d2-cbb7aa746c86')[0];
      form.formGroup.controls[ppeCategoryGroup.Code].setValue(['a33fb5d7-f0d8-4936-a5ef-f53f9920530a']);
      fixture.detectChanges();
      let visibility = component.ppeFormVM.fieldsArray.filter(x => x.field.name == ppeCategoryGroup.Code + 'Other')[0].context.getContextData().get('propertyValue').value;
      expect(visibility).toBeTruthy();
      expect(form.formGroup.controls[ppeCategoryGroup.Code + 'Other']).toBeTruthy();
    }));

    it('should have mandatory validations on form submit without values in other text fields', () => {
      let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;
      let otherField = form.formGroup.controls['10000Other']
      otherField.markAsDirty();
      form._onFormSubmit.emit();
      fixture.detectChanges();
      expect(otherField.hasError).toBeTruthy();
    })

    // it('should have mandatory validations on form submit without values', fakeAsync(() => {
    //   let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;
    //   let ppeCategoryGroup = ppeCategoryGroups.filter(x => x.Id == '184d62d6-a307-44a4-91d2-cbb7aa746c86')[0];
    //   let otherCategory = ppeCategoryGroup.PPECategories.filter(y => y.Id == 'a33fb5d7-f0d8-4936-a5ef-f53f9920530a');
    //   form.formGroup.controls[ppeCategoryGroup.Code]..setValue(otherCategory);
    //   let visibility = component.ppeFormVM.fieldsArray.filter(x => x.field.name == ppeCategoryGroup.Code + 'Other')[0].context.getContextData().get('propertyValue').value;
    //   expect(visibility).toBeTruthy();
    // }));

  });


});

