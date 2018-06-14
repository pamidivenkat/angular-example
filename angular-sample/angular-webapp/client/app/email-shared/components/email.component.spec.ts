import { NO_ERRORS_SCHEMA } from "@angular/core";
import { EmailComponent } from "./email.component";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { AtlasElementsModule } from "../../atlas-elements/atlas-elements.module";
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from "angular-l10n";
import { AtlasSharedModule } from "../../shared/atlas-shared.module";
import { BreadcrumbService } from "../../atlas-elements/common/services/breadcrumb-service";
import { BreadcrumbServiceStub } from "../../shared/testing/mocks/breadcrumb-service-mock";
import { LocaleServiceStub } from "../../shared/testing/mocks/locale-service-stub";
import { TranslationServiceStub } from "../../shared/testing/mocks/translation-service-stub";
import { LocalizationConfig } from "../../shared/localization-config";
import { LocalizationConfigStub } from "../../shared/testing/mocks/localization-config-stub";
import { Router, ActivatedRoute } from "@angular/router";
import { RouterMock } from "../../shared/testing/mocks/router-stub";
import { ClaimsHelperService } from "../../shared/helpers/claims-helper";
import { ClaimsHelperServiceStub } from "../../shared/testing/mocks/claims-helper-service-mock";
import { ActivatedRouteStub } from "../../shared/testing/mocks/activated-route-stub";
import { StoreModule, Store } from "@ngrx/store";
import { reducer } from "../../shared/reducers";
import { EmailService } from "../../email-shared/services/email.service";
import { EmailServiceStub } from "../../shared/testing/mocks/email-service-stub";
import { RestClientService } from "../../shared/data/rest-client.service";
import { RestClientServiceStub } from "../../shared/testing/mocks/rest-client-service-stub";
import { FormBuilderService } from "../../shared/services/form-builder.service";
import { EmailModel, User } from "../../email-shared/models/email.model";
import { FormFieldType } from "../../shared/models/iform-builder-vm";
import * as fromRoot from '../../shared/reducers';
import { LoadUsersAction, LoadUsersCompleteAction } from "../../shared/actions/company.actions";
import { extractUsersData } from '../../shared/helpers/extract-helpers';
import { MSPreviewMockStoreProviderFactory } from "../../shared/testing/mocks/ms-preview-mock-store-provider-factory";
import { AeFormComponent } from "../../atlas-elements/ae-form/ae-form.component";
import { By } from "@angular/platform-browser";
import { AeAutocompleteComponent } from "../../atlas-elements/ae-autocomplete/ae-autocomplete.component";

describe("EmailComponent", () => {

  let fixture: ComponentFixture<EmailComponent>;
  let component: EmailComponent;
  let formFieldNames = [];
  let store: Store<fromRoot.State>;
  let dispatchSpy: jasmine.Spy;
  let users: User[];

  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any
  let routeParamsStub: any;
  let _http: any;
  let isUserId: jasmine.Spy;
  let isFirstName: jasmine.Spy;
  let isLastname: jasmine.Spy;
  let isUserEmail: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        LocalizationModule,
        AtlasSharedModule,
        StoreModule.provideStore(reducer),
      ],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [EmailComponent],
      providers: [
        InjectorRef
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub, useValue: ['getEmpEmail', 'getUserFirstName', 'getUserLastName', 'getUserId'] }
        , { provide: EmailService, useClass: EmailServiceStub }
        , { provide: RestClientService, useClass: RestClientServiceStub }
        , FormBuilderService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);
    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    routerMock = fixture.debugElement.injector.get(Router);
    activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
    claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);

    isUserEmail = spyOn(claimsHelperServiceStub, 'getEmpEmail');
    isFirstName = spyOn(claimsHelperServiceStub, 'getUserFirstName');
    isLastname = spyOn(claimsHelperServiceStub, 'getUserLastName');
    isUserId = spyOn(claimsHelperServiceStub, 'getUserId');

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
  });

  beforeEach(() => {
    dispatchSpy = spyOn(store, 'dispatch');
    users = MSPreviewMockStoreProviderFactory.getUsersData();
    dispatchSpy.and.callThrough();
    isUserEmail.and.returnValue('so@vltc1.co.uk');
    isFirstName.and.returnValue('so');
    isLastname.and.returnValue('vltc');
    isUserId.and.returnValue('abc-12345-xyz');
    store.dispatch(new LoadUsersCompleteAction(users));

  });
  it("should be able to create component instance", () => {
    expect(component).toBeDefined();
  });

  describe('Email form', () => {

    beforeEach(() => {
      component.EmailModel = new EmailModel();
      fixture.detectChanges();
    });

    it('should have `To` field ', () => {
      let ToField = component.formFields.filter(f => f.field.name == 'To');
      expect(ToField[0].field.name).toEqual('To');
    });

    it('`To` field should be of type AutoComplete', () => {
      let ToField = component.formFields.filter(f => f.field.name == 'To') as any;
      expect(ToField[0].field.type).toEqual(FormFieldType.AutoComplete);
    });

    it('`To` field should be mandatory field', () => {
      let ToField = component.formFields.filter(f => f.field.name == 'To');
      expect(ToField[0].context.getContextData().get('required')).toBe(true);
    });

    it('should have `Cc` field ', () => {
      let CcField = component.formFields.filter(f => f.field.name == 'Cc');
      expect(CcField[0].field.name).toEqual('Cc');
    });

    it('`Cc` field should be of type AutoComplete', () => {
      let CcField = component.formFields.filter(f => f.field.name == 'Cc') as any;
      expect(CcField[0].field.type).toEqual(FormFieldType.AutoComplete);
    });

    it('should have `From` field ', () => {
      let FromField = component.formFields.filter(f => f.field.name == 'From');
      expect(FromField[0].field.name).toEqual('From');
    });

    it('`From` field should be of type AutoComplete', () => {
      let FromField = component.formFields.filter(f => f.field.name == 'From') as any;
      expect(FromField[0].field.type).toEqual(FormFieldType.AutoComplete);
    });

    it('`From` field should be mandatory field', () => {
      let FromField = component.formFields.filter(f => f.field.name == 'From');
      expect(FromField[0].context.getContextData().get('required')).toBe(true);
    });

    it('should have `Subject` field', () => {
      let SubjectField = component.formFields.filter(f => f.field.name == 'Subject');
      expect(SubjectField[0].field.name).toEqual('Subject');
    });

    it('`Subject` field should be of type InputString', () => {
      let SubjectField = component.formFields.filter(f => f.field.name == 'Subject') as any;
      expect(SubjectField[0].field.type).toEqual(FormFieldType.InputString);
    });

    it('`Subject` field should be mandatory field', () => {
      let SubjectField = component.formFields.filter(f => f.field.name == 'Subject');
      expect(SubjectField[0].context.getContextData().get('required')).toBe(true);
    });

    it('should have tow items in the responsible person list', () => {
      let emailToField = <AeAutocompleteComponent<any>>fixture.debugElement.query(By.directive(AeAutocompleteComponent)).componentInstance;
      let event = { query: 'test' };
      emailToField.aeOnComplete.emit(event);
      fixture.detectChanges();
      expect(emailToField.items.length).toEqual(users.length);
    });

    it('should have mandatory validations on form submit without values', () => {
      let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;
      let emailToField = form.formGroup.controls.To;
      emailToField.markAsDirty();
      form._onFormSubmit.emit();
      fixture.detectChanges();
      expect(emailToField.hasError).toBeTruthy();
    });

  });

});
