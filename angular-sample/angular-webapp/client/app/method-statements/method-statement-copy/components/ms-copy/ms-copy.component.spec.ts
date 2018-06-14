import { AeAnchorComponent } from './../../../../atlas-elements/ae-anchor/ae-anchor.component';
import { AeFormComponent } from './../../../../atlas-elements/ae-form/ae-form.component';
import { addDays } from 'date-fns';
import { AeSelectComponent } from './../../../../atlas-elements/ae-select/ae-select.component';
import { AeSelectEvent } from './../../../../atlas-elements/common/ae-select.event';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { dispatchEvent } from '@angular/platform-browser/testing/src/browser_util';
import { LoadCompanyStructureAction, LoadCompanyStructureCompleteAction } from './../../../../root-module/actions/company-structure.actions';
import { isNullOrUndefined } from 'util';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { DateTimeHelper } from './../../../../shared/helpers/datetime-helper';
import { AeDatetimePickerComponent } from './../../../../atlas-elements/ae-datetime-picker/ae-datetime-picker.component';
import { FormGroup } from '@angular/forms/forms';
import { MockStoreProviderFactory } from './../../../../shared/testing/mocks/mock-store-provider-factory';
import { MethodStatement, MethodStatements } from './../../../models/method-statement';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/Models/ae-breadcrumb-group';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MsCopyComponent } from './ms-copy.component';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import * as fromRoot from '../../../../shared/reducers';
import { Action, ActionReducer, StoreModule, Store } from '@ngrx/store';
import { LocalizationConfig } from './../../../../shared/localization-config';
import { By } from '@angular/platform-browser';
import { LocalizationConfigStub } from './../../../../shared/testing/mocks/localization-config-stub';
import { TranslationServiceStub } from './../../../../shared/testing/mocks/translation-service-stub';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AtlasElementsModule } from './../../../../atlas-elements/atlas-elements.module';
import { AtlasSharedModule } from './../../../../shared/atlas-shared.module';
import { BreadcrumbServiceStub } from './../../../../shared/testing/mocks/breadcrumb-service-mock';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { LocaleServiceStub } from './../../../../shared/testing/mocks/locale-service-stub';
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
import { reducer } from '../../../../shared/reducers/index';
import { ClaimsHelperServiceStub } from './../../../../shared/testing/mocks/claims-helper-service-mock';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterMock } from './../../../../shared/testing/mocks/router-stub';
import { RouterModule } from '@angular/router';
import { routes } from './../../../method-statements.routes';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { RouteParams } from './../../../../shared/services/route-params';
import { RouteParamsMock } from './../../../../shared/testing/mocks/route-params-mock';
import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('Method statement copy ', () => {

  let fixture: ComponentFixture<MsCopyComponent>;
  let component: MsCopyComponent;
  let store: Store<fromRoot.State>;
  let localizationConfigStub: any;
  let translationServiceStub: any;
  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let claimsHelperServiceStub: any;
  let routeParamsStub: any;
  let methodStatementToCopy: MethodStatements;
  let methodStatementToCopyClone: MethodStatements;
  let methodStatementFormGroup: FormGroup;
  let dispatchSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        LocalizationModule,
        BrowserAnimationsModule,
        StoreModule.provideStore(reducer)],
      declarations: [MsCopyComponent],

      providers: [
        InjectorRef
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: RouteParams, useClass: RouteParamsMock }
        , FormBuilderService
      ]
    })
      .overrideComponent(MsCopyComponent, { set: { host: { "(click)": "dummy" } } })
      .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(MsCopyComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
    routeParamsStub = fixture.debugElement.injector.get(RouteParams);
    let mockedLiveMSListResponse = MockStoreProviderFactory.getTestMethodStatementResponseData();
    methodStatementToCopy = mockedLiveMSListResponse.Entities[0];
    component.vm = methodStatementToCopy;
    methodStatementToCopyClone = Object.assign({}, methodStatementToCopy);
    tick(100);
    dispatchSpy = spyOn(store, 'dispatch');
    fixture.detectChanges();
    tick(100);
    methodStatementFormGroup = component.msCopyForm;
  }));

  it('should be able to create component instance', () => {
    expect(component).toBeDefined();
  });
  describe('The Copy Method Statement slide-out contains a number of fields, see below', () => {

    it('It should load  sites to the sites drop down', fakeAsync(() => {
      store.dispatch(new LoadCompanyStructureCompleteAction(undefined));
      expect(dispatchSpy).toHaveBeenCalledWith(new LoadCompanyStructureAction(true));
    }));

    it('Method statement name, free type text , This is automatically populated with the name of name of the Method Statement being copied', fakeAsync(() => {
      let nameControlDebug = fixture.debugElement.query(By.css('#msCopyForm_AeInput_0'));
      let nameControl = nameControlDebug.nativeElement;
      expect(nameControlDebug.componentInstance.constructor.name).toEqual('AeInputComponent');
      // let typeOfControl = nameControl instanceof HTMLInputElement;
      // expect(typeOfControl).toBeTruthy();
      expect(methodStatementFormGroup.controls['Name']).not.toBeUndefined();
      expect(methodStatementToCopyClone.Name).toEqual((<HTMLInputElement>nameControl).value);
      // (<HTMLInputElement>nameControl).value = "Name Updated";
      // nameControlDebug.triggerEventHandler('change', { target: { value: 'Name Updated' } });
      // fixture.detectChanges();
      // tick(100);
      // expect(methodStatementFormGroup.controls['Name'].value).toEqual('Name Updated');
    }));

    it('Method Start date, Date picker , This is automatically populated with the start date of the Method Statement being copied', (() => {
      let startDateControlDebug = fixture.debugElement.query(By.css('#msCopyForm_AeDateTimePicker_1_ae-input_3'));
      let startDateControl = startDateControlDebug.nativeElement;
      let typeOfControl = startDateControl instanceof HTMLInputElement;
      expect(typeOfControl).toBeTruthy();
      expect(methodStatementFormGroup.controls['StartDate']).not.toBeUndefined();
      let givenDate: string = '';
      if (!isNullOrUndefined(methodStatementToCopyClone.StartDate))
        givenDate = DateTimeHelper.getDateTimeStringFromISO(methodStatementToCopyClone.StartDate.toString(), false);
      let controlDate = (<HTMLInputElement>startDateControl).value;
      expect(givenDate).toEqual(controlDate);
      //verify wrapper is date time picker control
      let dateTimeControl = fixture.debugElement.query(By.css('#msCopyForm_AeDateTimePicker_1'));
      expect(dateTimeControl.componentInstance.constructor.name).toEqual('AeDatetimePickerComponent');
    }));

    it('Method End date, Date picker , This is automatically populated with the end date of the Method Statement being copied', (() => {
      let endDateControlDebug = fixture.debugElement.query(By.css('#msCopyForm_AeDateTimePicker_2_ae-input_3'));
      let endDateControl = endDateControlDebug.nativeElement;
      let typeOfControl = endDateControl instanceof HTMLInputElement;
      expect(typeOfControl).toBeTruthy();
      expect(methodStatementFormGroup.controls['EndDate']).not.toBeUndefined();
      let givenDate: string = '';
      if (!isNullOrUndefined(methodStatementToCopyClone.EndDate))
        givenDate = DateTimeHelper.getDateTimeStringFromISO(methodStatementToCopyClone.EndDate.toString(), false);
      let controlDate = (<HTMLInputElement>endDateControl).value;
      expect(givenDate).toEqual(controlDate);
      let dateTimeControl = fixture.debugElement.query(By.css('#msCopyForm_AeDateTimePicker_2'));
      expect(dateTimeControl.componentInstance.constructor.name).toEqual('AeDatetimePickerComponent');
    }));

    it('Client reference, free type field ,Defaults to blank', (() => {
      let clientReferenceDebug = fixture.debugElement.query(By.css('#msCopyForm_AeInput_3'));
      let clientReferenceControl = clientReferenceDebug.nativeElement;
      let typeOfControl = clientReferenceControl instanceof HTMLInputElement;
      expect(typeOfControl).toBeTruthy();
      expect(methodStatementFormGroup.controls['ClientReference']).not.toBeUndefined();

      let controlValue = (<HTMLInputElement>clientReferenceControl).value;
      expect(controlValue).toEqual('');
      let dateTimeControl = fixture.debugElement.query(By.css('#msCopyForm_AeInput_3'));
      expect(dateTimeControl.componentInstance.constructor.name).toEqual('AeInputComponent');
    }));

    it('Project reference, free type field ,Defaults to blank', (() => {
      let clientReferenceDebug = fixture.debugElement.query(By.css('#msCopyForm_AeInput_4'));
      let clientReferenceControl = clientReferenceDebug.nativeElement;
      let typeOfControl = clientReferenceControl instanceof HTMLInputElement;
      expect(typeOfControl).toBeTruthy();
      expect(methodStatementFormGroup.controls['ClientReference']).not.toBeUndefined();

      let controlValue = (<HTMLInputElement>clientReferenceControl).value;
      expect(controlValue).toEqual('');
      let dateTimeControl = fixture.debugElement.query(By.css('#msCopyForm_AeInput_3'));
      expect(dateTimeControl.componentInstance.constructor.name).toEqual('AeInputComponent');
    }));
  });

  describe('Location of work, Drop-down, This is automatically populated with the Location of work of the Method Statement being copied', () => {
    beforeEach(fakeAsync(() => {
      //to assert any location related requirements we should load the sites first
      dispatchSpy.and.callThrough();
      let mockedCompanyViewRes = MockStoreProviderFactory.getTestCompanyStructureData();
      store.dispatch(new LoadCompanyStructureCompleteAction(mockedCompanyViewRes));
      //updating UI value so that change detection will be triggered to update the UI so that UI will bind
      let nameControlDebug = fixture.debugElement.query(By.css('#msCopyForm_AeInput_0'));
      let nameControl = nameControlDebug.nativeElement;

      (<HTMLInputElement>nameControl).value = "Name Updated";
      nameControlDebug.triggerEventHandler('change', { target: { value: 'Name Updated' } });
      fixture.detectChanges();
      tick(100);

    }));

    it('Location of work, Drop-down, This is automatically populated with the Location of work of the Method Statement being copied', (() => {
      //here the mapped site id to this copied object is present in the drop down of the test sites data so it should be default selected
      let locationDebug = fixture.debugElement.query(By.css('#msCopyForm_AeSelect_5'));
      let locationControl: HTMLSelectElement = locationDebug.nativeElement;
      expect(locationDebug.componentInstance.value).toEqual(methodStatementToCopyClone.SiteId);
    }));


    it('Location of work, When new location of site option is selected there should a free text box to capture new location of site', fakeAsync(() => {
      //Here let us find first any other option is available in the site drop down as new location of work
      //'New Location of Work'
      let locationDebug = fixture.debugElement.query(By.css('#msCopyForm_AeSelect_5'));
      let locationControl: HTMLSelectElement = locationDebug.nativeElement;
      let newLocationItem: HTMLOptionElement = locationControl.options[locationControl.options.length - 1];
      expect(newLocationItem.textContent).toEqual('New Location of Work');
      methodStatementFormGroup.patchValue({
        SiteId: '9999'
      });
      fixture.detectChanges();
      tick(100);
      //locationDebug     
      //now assert for other location field to be available which is of free type entry
      let newLocationOfWorkDebug = fixture.debugElement.query(By.css('#msCopyForm_AeInput_6'));
      let newLocationOfWork: HTMLInputElement = newLocationOfWorkDebug.nativeElement;
      expect(newLocationOfWorkDebug.componentInstance.constructor.name).toEqual('AeInputComponent');

    }));

    it('Verify the required validations around copy method statement', fakeAsync(() => {
      //patch the form with null values and trigger the change detection and verify the given validations are fired or not..
      //this._context.isValidEvent.emit(status);
      let locationDebug = fixture.debugElement.query(By.css('#msCopyForm_AeSelect_5'));
      let nameDebug = fixture.debugElement.query(By.css('#msCopyForm_AeInput_0'));
      methodStatementFormGroup.patchValue({
        Name: '',
        StartDate: '',
        EndDate: '',
        ClientReference: '',
        ProjectReference: '',
        SiteId: ''
      });
      Object.keys(methodStatementFormGroup.controls).forEach(key => {
        methodStatementFormGroup.get(key).markAsDirty();
        methodStatementFormGroup.get(key).updateValueAndValidity();
      });
      fixture.detectChanges();
      tick(100);

      expect(fixture.debugElement.query(By.css('#msCopyForm_AeInput_ErrorSpan_0'))).toBeDefined();
      expect(fixture.debugElement.query(By.css('#msCopyForm_AeDateTimePicker_ErrorSpan_1'))).toBeDefined();
      expect(fixture.debugElement.query(By.css('#msCopyForm_AeSelect_ErrorSpan_5'))).toBeDefined();

    }));

    it('Verify End date is greater than start date validation', fakeAsync(() => {
      //patch the form with null values and trigger the change detection and verify the given validations are fired or not..
      //this._context.isValidEvent.emit(status);
      let locationDebug = fixture.debugElement.query(By.css('#msCopyForm_AeSelect_5'));
      let nameDebug = fixture.debugElement.query(By.css('#msCopyForm_AeInput_0'));
      methodStatementFormGroup.patchValue({
        StartDate: addDays(new Date(), 1),
        EndDate: new Date(),

      });
      Object.keys(methodStatementFormGroup.controls).forEach(key => {
        methodStatementFormGroup.get(key).markAsDirty();
        methodStatementFormGroup.get(key).updateValueAndValidity();
      });
      fixture.detectChanges();
      tick(100);

      expect(fixture.debugElement.query(By.css('#msCopyForm_AeDateTimePicker_ErrorSpan_2'))).toBeDefined();

    }));

    it('When fields are updated in the copy slide out, the updated values needs to be saved', fakeAsync(() => {
      //patch the form with null values and trigger the change detection and verify the given validations are fired or not..

      let stDate = new Date();
      let endDate = addDays(new Date(), 5);
      let emittedObject: MethodStatement;
      let obj = new MethodStatement();


      obj.Id = component.vm.Id;
      obj.CompanyId = undefined;
      obj.IsExample = undefined;
      (<any>obj).copyToDifferentCompany = false;

      obj.Name = 'Name Updated',
        obj.StartDate = stDate,
        obj.EndDate = endDate,
        obj.ClientReference = 'Client reference given',
        obj.ProjectReference = 'Project reference given',
        obj.SiteId = 'ea995db1-f8c8-2af8-ca40-2f3cf64669a6'

      methodStatementFormGroup.patchValue(obj);

      Object.keys(methodStatementFormGroup.controls).forEach(key => {
        methodStatementFormGroup.get(key).markAsDirty();
        methodStatementFormGroup.get(key).updateValueAndValidity();
      });

      component.onCopy.subscribe((val) => {
        emittedObject = val;
      });

      fixture.detectChanges();
      tick(100);
      let aeForm = fixture.debugElement.query(By.directive(AeFormComponent));
      let divFooter = aeForm.query(By.css('.so-panel__footer'));
      let anchorComponent: AeAnchorComponent = divFooter.query(By.directive(AeAnchorComponent)).componentInstance;
      anchorComponent.aeClick.emit({});
      fixture.detectChanges();
      tick(100);


      expect(obj.Id == emittedObject.Id
        && obj.Name == emittedObject.Name
        && obj.StartDate == emittedObject.StartDate
        && obj.EndDate == emittedObject.EndDate
        && obj.ClientReference == emittedObject.ClientReference
        && obj.ProjectReference == emittedObject.ProjectReference
        && obj.SiteId == emittedObject.SiteId
        && obj.NewLocationOfWork == emittedObject.NewLocationOfWork
      ).toBeTruthy();


    }));

    it('When cancel is clicked it should emit the cancel event', fakeAsync(() => {
      //patch the form with null values and trigger the change detection and verify the given validations are fired or not..
      let eventVal;
      component.onCopyCancel.subscribe((val) => {
        eventVal = val;
      });

      let aeForm = fixture.debugElement.query(By.directive(AeFormComponent));
      let divFooter = aeForm.query(By.css('.so-panel__footer'));
      let spanElement: HTMLSpanElement = divFooter.query(By.css('#msCopyForm_Label_1')).nativeElement;
      spanElement.click();
      fixture.detectChanges();
      tick(100);
      expect(eventVal).toEqual('Cancel');


    }));


  });

});

describe('Method statement copy where source method statement has site value of other ', () => {

  let fixture: ComponentFixture<MsCopyComponent>;
  let component: MsCopyComponent;
  let store: Store<fromRoot.State>;
  let localizationConfigStub: any;
  let translationServiceStub: any;
  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let claimsHelperServiceStub: any;
  let routeParamsStub: any;
  let methodStatementToCopy: MethodStatements;
  let methodStatementToCopyClone: MethodStatements;
  let methodStatementFormGroup: FormGroup;
  let dispatchSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        LocalizationModule,
        BrowserAnimationsModule,
        StoreModule.provideStore(reducer)],
      declarations: [MsCopyComponent],

      providers: [
        InjectorRef
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: RouteParams, useClass: RouteParamsMock }
        , FormBuilderService
      ]
    })
      .overrideComponent(MsCopyComponent, { set: { host: { "(click)": "dummy" } } })
      .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(MsCopyComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
    routeParamsStub = fixture.debugElement.injector.get(RouteParams);
    let mockedLiveMSListResponse = MockStoreProviderFactory.getTestMethodStatementResponseData();
    methodStatementToCopy = mockedLiveMSListResponse.Entities[0];
    methodStatementToCopy.SiteId = null;
    methodStatementToCopy.NewLocationOfWork = "New Location Added";
    component.vm = methodStatementToCopy;
    methodStatementToCopyClone = Object.assign({}, methodStatementToCopy);
    let mockedCompanyViewRes = MockStoreProviderFactory.getTestCompanyStructureData();
    store.dispatch(new LoadCompanyStructureCompleteAction(mockedCompanyViewRes));
    tick(100);
    dispatchSpy = spyOn(store, 'dispatch');
    fixture.detectChanges();
    tick(100);
    methodStatementFormGroup = component.msCopyForm;
  }));

  describe('When Method statement with new location of site is copied, the slide out should contain new location of site', () => {

    it('It should show the component with new location of site as free text', fakeAsync(() => {
      //'New Location of Work'
      let locationDebug = fixture.debugElement.query(By.css('#msCopyForm_AeSelect_5'));
      let locationControl: HTMLSelectElement = locationDebug.nativeElement;
      expect(locationControl.options[locationControl.selectedIndex].textContent).toEqual('New Location of Work');

      //locationDebug     
      //now assert for other location field to be available which is of free type entry
      let newLocationOfWorkDebug = fixture.debugElement.query(By.css('#msCopyForm_AeInput_6'));
      let newLocationOfWork: HTMLInputElement = newLocationOfWorkDebug.nativeElement;
      expect(newLocationOfWork.value).toEqual('New Location Added');
      expect(newLocationOfWorkDebug.componentInstance.constructor.name).toEqual('AeInputComponent');

    }));


    it('When site selection is changed from other, then new location of site much be empty', fakeAsync(() => {
      //'New Location of Work'
      let locationDebug = fixture.debugElement.query(By.css('#msCopyForm_AeSelect_5'));
      let locationControl: HTMLSelectElement = locationDebug.nativeElement;

      methodStatementFormGroup.patchValue({
        SiteId: 'ea995db1-f8c8-2af8-ca40-2f3cf64669a6'
      });
      fixture.detectChanges();
      tick(100);

      //locationDebug     
      //now assert for other location field to be available which is of free type entry
      let newLocationOfWorkDebug = fixture.debugElement.query(By.css('#msCopyForm_AeInput_6'));
      expect(newLocationOfWorkDebug).toBeNull();

    }));



  });

});
