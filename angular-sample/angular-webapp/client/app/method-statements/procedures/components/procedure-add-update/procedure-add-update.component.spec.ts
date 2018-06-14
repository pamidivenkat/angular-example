import { AeModalDialogComponent } from './../../../../atlas-elements/ae-modal-dialog/ae-modal-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilderService } from './../../../../shared/services/form-builder.service';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { EventListener } from '@angular/core/src/debug/debug_node';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { MockStoreProviderFactory } from './../../../../shared/testing/mocks/mock-store-provider-factory';
import { CommonTestHelper } from './../../../../shared/testing/helpers/common-test-helper';
import { ActivatedRouteStub } from './../../../../shared/testing/mocks/activated-route-stub';
import { Router, ActivatedRoute, UrlSegment, NavigationExtras } from '@angular/router';
import { LocalizationConfigStub } from './../../../../shared/testing/mocks/localization-config-stub';
import { TranslationServiceStub } from './../../../../shared/testing/mocks/translation-service-stub';
import { LocaleServiceStub } from './../../../../shared/testing/mocks/locale-service-stub';
import { RouteParams } from './../../../../shared/services/route-params';
import { RouteParamsMock } from './../../../../shared/testing/mocks/route-params-mock';
import { ClaimsHelperServiceStub } from './../../../../shared/testing/mocks/claims-helper-service-mock';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { BreadcrumbServiceStub } from './../../../../shared/testing/mocks/breadcrumb-service-mock';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { routes } from './../../procedure.routes';
import { LocalizationConfig } from './../../../../shared/localization-config';
import { AtlasSharedModule } from './../../../../shared/atlas-shared.module';
import {
  InjectorRef,
  LocaleConfig,
  LocaleService,
  LocaleStorage,
  LocalizationModule,
  TranslationConfig,
  TranslationService,
  TranslationProvider,
  TranslationHandler,
} from 'angular-l10n';
import { RouterModule, RouterOutletMap } from '@angular/router';
import { AtlasElementsModule } from './../../../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterMock } from './../../../../shared/testing/mocks/router-stub';
import { reducer } from '../../../../shared/reducers/index';
import { Action, ActionReducer, StoreModule, Store } from '@ngrx/store';
import * as fromRoot from '../../../../shared/reducers';
import * as Immutable from 'immutable';
import { ProcedureService } from '../../services/procedure.service';
import { RouterOutletMapStub } from '../../../../shared/testing/mocks/router-outlet-stub';
import { LocationStrategyStub } from './../../../../shared/testing/mocks/location-strategy-stub';
import { RestClientService } from '../../../../shared/data/rest-client.service';
import { RestClientServiceStub } from '../../../../shared/testing/mocks/rest-client-service-stub';
import { Procedure } from '../../../procedures/models/procedure';
import { ProcedureGroup } from '../../../../shared/models/proceduregroup';
import { ProcedureAddUpdateComponent } from './procedure-add-update.component';
import { ProcedureListComponent } from './../../components/procedure-list/procedure-list.component';
import { ProceduresContainerComponent } from '../../containers/procedures-container/procedures-container.component';
import { ProcedureViewComponent } from './../../components/procedure-view/procedure-view.component';
import { ProcedureCopyComponent } from './../../components/procedure-copy/procedure-copy.component';
import { AtlasApiResponse } from '../../../../shared/models/atlas-api-response';
import { AddProcedureAction, UpdateProcedureAction } from './../../actions/procedure-actions';
import { LoadProcedureGroupAction, LoadProcedureGroupCompleteAction } from '../../../../shared/actions/lookup.actions';

describe('ProcedureAddUpdateComponent', () => {
  let component: ProcedureAddUpdateComponent;
  let fixture: ComponentFixture<ProcedureAddUpdateComponent>;
  let store: Store<fromRoot.State>;
  let selectedProcedure: Procedure;
  let dispatchSpy: jasmine.Spy;
  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any;
  let routeParamsStub: any;
  let cancelEventEmittedValue: string;
  let addEventEmittedValue: string;
  let mockedProceduresResponse: AtlasApiResponse<Procedure>;
  let mockedProcedureGroups: Array<ProcedureGroup>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        RouterModule.forChild(routes),
        LocalizationModule,
        AtlasSharedModule
        , StoreModule.provideStore(reducer)
      ],
      declarations: [
        ProcedureAddUpdateComponent
        , ProceduresContainerComponent
        , ProcedureListComponent
        , ProcedureCopyComponent
        , ProcedureViewComponent
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
        , { provide: RouteParams, useClass: RouteParamsMock }
        , { provide: RestClientService, useClass: RestClientServiceStub }
        , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
        , FormBuilderService
        , ProcedureService
      ]
    })
      .overrideComponent(ProcedureAddUpdateComponent, { set: { host: { '(click)': 'dummy' } } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureAddUpdateComponent);
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
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
    dispatchSpy = spyOn(store, 'dispatch');
    mockedProceduresResponse = MockStoreProviderFactory.getMSProceduresResponseData(false);
    store.dispatch(new LoadProcedureGroupAction());
    store.dispatch(new LoadProcedureGroupCompleteAction(mockedProcedureGroups));
    mockedProcedureGroups = MockStoreProviderFactory.getProcedureGroupData();
    selectedProcedure = mockedProceduresResponse.Entities[0];
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
  describe('Add procedure', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      component.action = 'Add';
      component._onProcedureCancel.subscribe(val => {
        cancelEventEmittedValue = val;
      });
      fixture.debugElement.triggerEventHandler('click', null);
      fixture.detectChanges();
    });
    it('Should have title as "ADD_PROCEDURE"', fakeAsync(() => {
      tick();
      let titleElement = fixture.debugElement.query(By.css('.so-panel__title')).nativeElement;
      expect(titleElement).not.toBeUndefined();
      expect(titleElement.innerText).toContain('ADD_PROCEDURE');
    }));
    it('It should have 3 fileds namely "Name","Procedure group", "Description"', fakeAsync(() => {
      tick();
      let nameField = fixture.debugElement.query(By.css('#addUpdateProcedureForm_AeInput_0'));
      let procedureGroupField = fixture.debugElement.query(By.css('#addUpdateProcedureForm_AeSelect_1'));
      let descriptionField = fixture.debugElement.query(By.css('#addUpdateProcedureForm_AeRichTextEditor_2'));
      expect(nameField).not.toBeUndefined();
      expect(procedureGroupField).not.toBeUndefined();
      expect(descriptionField).not.toBeUndefined();
    }));
    it('It should have ADD and CLOSE buttons', fakeAsync(() => {
      tick();
      let closeButton = fixture.debugElement.query(By.css('#addUpdateProcedureForm_Label_1'));
      let addButton = fixture.debugElement.query(By.css('#addUpdateProcedureForm_AeAnchor_1'));
      expect(closeButton).not.toBeUndefined();
      expect(addButton).not.toBeUndefined();
    }));
    it('It should close when clicked on "CANCEL" button', fakeAsync(() => {
      tick();
      let closeButton = fixture.debugElement.query(By.css('#addUpdateProcedureForm_Label_1')).nativeElement;
      closeButton.click();
      fixture.detectChanges();
      tick();
      expect(cancelEventEmittedValue).toBe('Cancel');
    }));
    it('It should show validation messages when cliked on  "ADD" button without entering data', fakeAsync(() => {
      tick();
      let addButton = fixture.debugElement.query(By.css('#addUpdateProcedureForm_AeAnchor_1')).nativeElement;
      addButton.click();
      fixture.detectChanges();
      tick();
      let nameValidationElement = fixture.debugElement.query(By.css('#addUpdateProcedureForm_AeInput_ErrorSpan_0')).nativeElement;
      expect(nameValidationElement).not.toBeUndefined();
      expect(nameValidationElement.innerText).toBe('Name is required');
      let groupValidationElement = fixture.debugElement.query(By.css('#addUpdateProcedureForm_AeSelect_ErrorSpan_1')).nativeElement;
      expect(groupValidationElement).not.toBeUndefined();
      expect(groupValidationElement.innerText).toBe('Procedure group is required');
    }));
    it('It should add new procedure when cliked on  "ADD" button with information provided in the fields', fakeAsync(() => {
      tick();
      component.addUpdateProcedureForm.get('Name').setValue('Test');
      component.addUpdateProcedureForm.get('ProcedureGroupId').setValue(mockedProcedureGroups[0].Id);
      component.addUpdateProcedureForm.get('Description').setValue('Test description');
      let addButton = fixture.debugElement.query(By.css('#addUpdateProcedureForm_AeAnchor_1')).nativeElement;
      let _procedureToSave: Procedure = new Procedure();
      let procedureToSave: Procedure = Object.assign({}, this._procedureToSave, <Procedure>component.addUpdateProcedureForm.value);
      procedureToSave.Id = '';
      procedureToSave.IsExample = false;
      procedureToSave.ProcedureGroupName = '';
      procedureToSave.ProcedureGroup = null;
      procedureToSave.OrderIndex = null;
      procedureToSave.CompanyId = '';
      procedureToSave.IsSelected = false;
      addButton.click();
      fixture.detectChanges();
      tick();
      expect(dispatchSpy).toHaveBeenCalledWith(new AddProcedureAction(procedureToSave));
    }));
  });
  describe('Update procedure', () => {
    beforeEach(() => {
      dispatchSpy.and.callThrough();
      component.action = 'Update';
      component._onProcedureCancel.subscribe(val => {
        cancelEventEmittedValue = val;
      });
      fixture.debugElement.triggerEventHandler('click', null);
      fixture.detectChanges();
    });
    it('Should have title as "UPDATE_PROCEDURE"', fakeAsync(() => {
      tick();
      let titleElement = fixture.debugElement.query(By.css('.so-panel__title')).nativeElement;
      expect(titleElement).not.toBeUndefined();
      expect(titleElement.innerText).toContain('UPDATE_PROCEDURE');
    }));
    it('It should have 3 fileds namely "Name","Procedure group", "Description"', fakeAsync(() => {
      tick();
      let nameField = fixture.debugElement.query(By.css('#addUpdateProcedureForm_AeInput_0'));
      let procedureGroupField = fixture.debugElement.query(By.css('#addUpdateProcedureForm_AeSelect_1'));
      let descriptionField = fixture.debugElement.query(By.css('#addUpdateProcedureForm_AeRichTextEditor_2'));
      expect(nameField).not.toBeUndefined();
      expect(procedureGroupField).not.toBeUndefined();
      expect(descriptionField).not.toBeUndefined();
    }));
    it('It should have UPDATE and CLOSE buttons', fakeAsync(() => {
      tick();
      let closeButton = fixture.debugElement.query(By.css('#addUpdateProcedureForm_Label_1'));
      let updateButton = fixture.debugElement.query(By.css('#addUpdateProcedureForm_AeAnchor_1'));
      expect(closeButton).not.toBeUndefined();
      expect(updateButton).not.toBeUndefined();
    }));
    it('It should close when clicked on "CANCEL" button', fakeAsync(() => {
      tick();
      let closeButton = fixture.debugElement.query(By.css('#addUpdateProcedureForm_Label_1')).nativeElement;
      closeButton.click();
      fixture.detectChanges();
      tick();
      expect(cancelEventEmittedValue).toBe('Cancel');
    }));
    it('It should show validation messages when cliked on  "UPDATE" button without entering data', fakeAsync(() => {
      tick();
      let updateButton = fixture.debugElement.query(By.css('#addUpdateProcedureForm_AeAnchor_1')).nativeElement;
      updateButton.click();
      fixture.detectChanges();
      tick();
      let nameValidationElement = fixture.debugElement.query(By.css('#addUpdateProcedureForm_AeInput_ErrorSpan_0')).nativeElement;
      expect(nameValidationElement).not.toBeUndefined();
      expect(nameValidationElement.innerText).toBe('Name is required');
      let groupValidationElement = fixture.debugElement.query(By.css('#addUpdateProcedureForm_AeSelect_ErrorSpan_1')).nativeElement;
      expect(groupValidationElement).not.toBeUndefined();
      expect(groupValidationElement.innerText).toBe('Procedure group is required');
    }));
    describe('Update procedure - able to update existing procedure', () => {
      beforeEach(() => {
        component.SelectedProcedure = selectedProcedure;
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
      });

      it('It should update procedure when cliked on  "UPDATE" button with information provided in the fields', fakeAsync(() => {
        tick();
        component.addUpdateProcedureForm.get('Name').setValue('TestNew');
        let updateButton = fixture.debugElement.query(By.css('#addUpdateProcedureForm_AeAnchor_1')).nativeElement;
        updateButton.click();
        fixture.detectChanges();
        tick();
        expect(dispatchSpy).toHaveBeenCalled();
      }));
    });

  });

});
