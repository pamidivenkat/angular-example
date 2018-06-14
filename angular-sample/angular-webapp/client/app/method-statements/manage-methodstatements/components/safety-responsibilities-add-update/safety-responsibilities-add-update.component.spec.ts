import { UserServiceStub } from '../../../../shared/testing/mocks/user-services-stub';
import { AeAutocompleteComponent } from '../../../../atlas-elements/ae-autocomplete/ae-autocomplete.component';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { MockStoreProviderFactory } from '../../../../shared/testing/mocks/mock-store-provider-factory';
import { EventEmitter } from '@angular/core';
import { AeFormComponent } from '../../../../atlas-elements/ae-form/ae-form.component';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, TranslationService } from 'angular-l10n';

import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { RestClientService } from '../../../../shared/data/rest-client.service';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../../shared/reducers';
import { reducer } from '../../../../shared/reducers/index';
import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import { UserService } from '../../../../shared/services/user-services';
import { ActivatedRouteStub } from '../../../../shared/testing/mocks/activated-route-stub';
import { BreadcrumbServiceStub } from '../../../../shared/testing/mocks/breadcrumb-service-mock';
import { ClaimsHelperServiceStub } from '../../../../shared/testing/mocks/claims-helper-service-mock';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { RestClientServiceStub } from '../../../../shared/testing/mocks/rest-client-service-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { MethodStatement, MSSafetyRespAssigned } from './../../../../method-statements/models/method-statement';
import { SafetyResponsibilitiesAddUpdateComponent } from './safety-responsibilities-add-update.component';

describe('Safety Responsibilities Add/Update Component: ', () => {
  let component: SafetyResponsibilitiesAddUpdateComponent;
  let fixture: ComponentFixture<SafetyResponsibilitiesAddUpdateComponent>;
  let store: Store<fromRoot.State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AtlasElementsModule
        , StoreModule.provideStore(reducer)
      ]
      , declarations: [
        SafetyResponsibilitiesAddUpdateComponent
      ]
      , providers: [
        InjectorRef
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
        , { provide: RestClientService, useClass: RestClientServiceStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: UserService, useClass: UserServiceStub }
        , FormBuilderService

      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SafetyResponsibilitiesAddUpdateComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);

    let methodStatement = new MethodStatement();
    methodStatement.Id = '99a5d85a-f97d-4e12-9a6f-de5afbb63717';
    methodStatement.MSSafetyResponsibilities = [];
    component.methodstatement = methodStatement;
    component.selectedRecord = new MSSafetyRespAssigned();

    component.responsibilities = MockStoreProviderFactory.getResponsibilitiesStub();
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('there are two fields within this slide-out', () => {
    expect(fixture.debugElement.nativeElement.getElementsByTagName('ae-autocomplete').length).toEqual(2);
  });

  it('should have an auto complete filed for responsible person', () => {
    expect(fixture.debugElement.nativeElement.querySelector('#responsibilitiesForm_AeAutoComplete_0')).toBeTruthy();
    let components = fixture.debugElement.nativeElement.getElementsByTagName('ae-autocomplete');
    expect(components[0].attributes[1].value).toEqual('ResponsiblePerson')
  });

  it('should have an auto complete filed for responsibility', () => {
    expect(fixture.debugElement.nativeElement.querySelector('#responsibilitiesForm_AeAutoComplete_2')).toBeTruthy();
    let components = fixture.debugElement.nativeElement.getElementsByTagName('ae-autocomplete');
    expect(components[1].attributes[1].value).toEqual('ResponsibilityAssigned')
  });

  it('should have mandatory validations on form submit without values', () => {
    let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;
    let responsibilityAssigned = form.formGroup.controls.ResponsibilityAssigned;
    let responsiblePerson = form.formGroup.controls.ResponsiblePerson
    responsibilityAssigned.markAsDirty();
    responsiblePerson.markAsDirty();
    form._onFormSubmit.emit();
    fixture.detectChanges();
    expect(responsibilityAssigned.hasError).toBeTruthy();
    expect(responsiblePerson.hasError).toBeTruthy();
  })

  it('should have tow items in the responsible person list', () => {
    let personField = <AeAutocompleteComponent<any>>fixture.debugElement.query(By.directive(AeAutocompleteComponent)).componentInstance;
    let event = { query: 'test' };
    personField.aeOnComplete.emit(event);
    fixture.detectChanges();
    expect(personField.items.length).toEqual(2);
  });

  it('if "Other" is selected in the responsible person field, then Other responsible person name field will be displayed', () => {   
    let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;
    let responsiblePerson = form.formGroup.controls.ResponsiblePerson;
    let item = new AeSelectItem('Other', null, false);
    responsiblePerson.setValue([item]);

    fixture.detectChanges();
    expect(form.formGroup.controls.NameOfResponsible).toBeTruthy();
  });

  it('if "Other" is selected in the responsibility field, then Other responsibility field will be displayed', () => {   
    let form = <AeFormComponent>fixture.debugElement.query(By.directive(AeFormComponent)).componentInstance;
    let responsibilityAssigned = form.formGroup.controls.ResponsibilityAssigned;
    responsibilityAssigned.setValue(['27fded68-fdd6-4307-b0d2-f0c3f3596ae8']);
    
    fixture.detectChanges();
    expect(form.formGroup.controls.OtherResponsibilityValue).toBeTruthy();
  });

});
