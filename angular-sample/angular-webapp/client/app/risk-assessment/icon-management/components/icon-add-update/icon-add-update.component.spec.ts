import {
  IconManagementMockStoreProviderFactory,
} from '../../../../shared/testing/mocks/icon-mgmt-mock-store-provider-factory';
import { LoadIconAction, LoadIconCompleteAction } from '../../actions/icon-add-update.actions';
import { ControlIconCategory } from '../../models/control-icon-category.enum';
import { HazardIconCategory } from '../../models/hazard-icon-category.enum';
import { FileUploadService } from '../../../../shared/services/file-upload.service';
import { IconType } from '../../models/icon-type.enum';
import { RestClientServiceStub } from '../../../../shared/testing/mocks/rest-client-service-stub';
import { RouteParamsMock } from '../../../../shared/testing/mocks/route-params-mock';
import { RestClientService } from '../../../../shared/data/rest-client.service';
import { RouteParams } from '../../../../shared/services/route-params';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { LocalizationConfig } from '../../../../shared/localization-config';
import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import { RouterOutletMapStub } from '../../../../shared/testing/mocks/router-outlet-stub';
import { ActivatedRoute, Router, RouterOutletMap } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { AtlasSharedModule } from '../../../../shared/atlas-shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { CommonModule } from '@angular/common';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { IconAddUpdateComponent } from './icon-add-update.component';
import * as fromRoot from '../../../../shared/reducers';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbServiceStub } from '../../../../shared/testing/mocks/breadcrumb-service-mock';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { LocalizationConfigStub } from '../../../../shared/testing/mocks/localization-config-stub';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { ActivatedRouteStub } from '../../../../shared/testing/mocks/activated-route-stub';
import { ClaimsHelperServiceStub } from '../../../../shared/testing/mocks/claims-helper-service-mock';
import { AuthorizationServiceStub } from '../../../../shared/testing/mocks/authorization-service-mock';
import { AuthorizationService } from '../../../../shared/security/authorization.service';
import { reducer } from '../../../../shared/reducers/index';
import { Icon } from '../../models/icon';
import * as fromConstants from '../../../../shared/app.constants';
describe('Add Hazard Icon', () => {
  let component: IconAddUpdateComponent;
  let fixture: ComponentFixture<IconAddUpdateComponent>;
  let store: Store<fromRoot.State>;
  let dispatchSpy: jasmine.Spy;
  let submitIconData: Icon;
  let submitEmittedIconData: Icon;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        LocalizationModule,
        AtlasSharedModule,
        StoreModule.provideStore(reducer)],
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
        , { provide: AuthorizationService, useClass: AuthorizationServiceStub }
        , FormBuilderService
        , FileUploadService
      ],
      declarations: [IconAddUpdateComponent]
    })
      .overrideComponent(IconAddUpdateComponent, { set: { host: { '(click)': 'dummy' } } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconAddUpdateComponent);
    component = fixture.componentInstance;
    component.type = IconType.Hazard;
    component.action = 'Add';
    component.id = 'icon-add-update';
    component.name = 'icon-add-update';
    store = fixture.debugElement.injector.get(Store);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
    dispatchSpy = spyOn(store, 'dispatch');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('it should have below fields', () => {
    it('should have title as "Add icon"', () => {
      var titleElement: HTMLElement = fixture.debugElement.query(By.css('.so-panel__title')).nativeElement;
      expect(titleElement).not.toBeNull();
      expect(titleElement.innerText.trim()).toBe('Add icon');
    });

    it('should have icon preview panel', () => {
      var previewElement: DebugElement = fixture.debugElement.query(By.css('.card'));
      expect(previewElement).not.toBeNull();
    });
    it('should have file upload button to upload icon', () => {
      var uploadButton: DebugElement = fixture.debugElement.query(By.css('#fileUpload'));
      expect(uploadButton).not.toBeNull();
    });
    it('should have clear button to clear uploaded icon', () => {
      var clearButton: DebugElement = fixture.debugElement.query(By.css('#icon-add-update_AeButton_1_aeButton_1'));
      expect(clearButton).not.toBeNull();
    });
    it('should have category dropdown and to be filled with hazard icon categories', () => {
      var categoryDropdown: DebugElement = fixture.debugElement.query(By.css('#icon-form_AeSelect_1'));
      expect(categoryDropdown).not.toBeNull();
      let options = categoryDropdown.nativeElement.children;
      expect(options[0].innerText).toBe('Please select');
      expect(options[1].innerText).toBe('General');
      expect(options[2].innerText).toBe('Routes of exposure');
      expect(options[3].innerText).toBe('Control of substances hazardous to health');     
    });
    it('should have name field', () => {
      var nameField: DebugElement = fixture.debugElement.query(By.css('#icon-form_AeInput_2'));
      expect(nameField).not.toBeNull();
    });
    it('should have description field', () => {
      var descriptionField: DebugElement = fixture.debugElement.query(By.css('#icon-form_AeTextArea_3'));
      expect(descriptionField).not.toBeNull();
    });
    it('should have cancel button', () => {
      var cancelButton: DebugElement = fixture.debugElement.query(By.css('#icon-form_Label_1'));
      expect(cancelButton).not.toBeNull();
    });
    it('should have add button', () => {
      var addButton: DebugElement = fixture.debugElement.query(By.css('#icon-form_AeAnchor_1'));
      expect(addButton).not.toBeNull();
    });

  });

  describe('it should show validation messages when clicked on "Add" without giving required data', () => {
    beforeEach(() => {
      var addButton: HTMLElement = fixture.debugElement.query(By.css('#icon-form_AeAnchor_1')).nativeElement;
      addButton.click();
      fixture.detectChanges();
    });
    it('should show "Icon is required" validation message', () => {
      var iconFieldErrorElement: HTMLElement = fixture.debugElement.query(By.css('#icon-form_AeFile_ErrorSpan_1')).nativeElement;
      expect(iconFieldErrorElement).not.toBeNull();
      expect(iconFieldErrorElement.innerText.trim()).toBe('VALIDATION_ERRORS.ICON_REQUIRED');
    });
    it('should show "Caategory is required" validation message', () => {
      var categoryFieldErrorElement: HTMLElement = fixture.debugElement.query(By.css('#icon-form_AeSelect_ErrorSpan_1')).nativeElement;
      expect(categoryFieldErrorElement).not.toBeNull();
      expect(categoryFieldErrorElement.innerText.trim()).toBe('Category is required');
    });
    it('should show "Name is required" validation message', () => {
      var nameFieldErrorElement: HTMLElement = fixture.debugElement.query(By.css('#icon-form_AeInput_ErrorSpan_2')).nativeElement;
      expect(nameFieldErrorElement).not.toBeNull();
      expect(nameFieldErrorElement.innerText.trim()).toBe('Name is required');
    });
    it('should show "Description is required" validation message', () => {
      var descriptionFieldErrorElement: HTMLElement = fixture.debugElement.query(By.css('#icon-form_AeTextArea_ErrorSpan_3')).nativeElement;
      expect(descriptionFieldErrorElement).not.toBeNull();
      expect(descriptionFieldErrorElement.innerText.trim()).toBe('Description is required');
    });

  });

  describe('it should create hazard icon when clicked on  "Add" with required data', () => {
    beforeEach(() => {
      submitIconData = new Icon();
      submitIconData.PictureId = 'BD12E17F-DED6-07F5-34F7-94CFDA33FBD0';
      submitIconData.Category = HazardIconCategory.General;
      submitIconData.Name = 'test';
      submitIconData.Description = 'test';

      component.iconForm.get('Name').setValue(submitIconData.Name);
      component.iconForm.get('Description').setValue(submitIconData.Description);
      component.iconForm.get('Category').setValue(submitIconData.Category);
      component.iconForm.get('PictureId').setValue(submitIconData.PictureId);

      fixture.debugElement.triggerEventHandler('click', null);
      fixture.detectChanges();
      component.onSubmit.subscribe(val => {
        submitEmittedIconData = val;
      });

    });
    it('should create hazard icon', fakeAsync(() => {
      var addButton: HTMLElement = fixture.debugElement.query(By.css('#icon-form_AeAnchor_1')).nativeElement;
      addButton.click();
      tick(250);
      expect(submitIconData.Name).toEqual((<Icon>submitEmittedIconData).Name);
      expect(submitIconData.Description).toEqual((<Icon>submitEmittedIconData).Description);
      expect(submitIconData.Category).toEqual((<Icon>submitEmittedIconData).Category);
      expect(submitIconData.PictureId).toEqual((<Icon>submitEmittedIconData).PictureId);
    }));
  });

});

describe('Add Control Icon', () => {
  let component: IconAddUpdateComponent;
  let fixture: ComponentFixture<IconAddUpdateComponent>;
  let store: Store<fromRoot.State>;
  let dispatchSpy: jasmine.Spy;
  let submitIconData: Icon;
  let submitEmittedIconData: Icon;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        LocalizationModule,
        AtlasSharedModule,
        StoreModule.provideStore(reducer)],
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
        , { provide: AuthorizationService, useClass: AuthorizationServiceStub }
        , FormBuilderService
        , FileUploadService
      ],
      declarations: [IconAddUpdateComponent]
    })
      .overrideComponent(IconAddUpdateComponent, { set: { host: { '(click)': 'dummy' } } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconAddUpdateComponent);
    component = fixture.componentInstance;
    component.type = IconType.Control;
    component.action = 'Add';
    component.id = 'icon-add-update';
    component.name = 'icon-add-update';
    store = fixture.debugElement.injector.get(Store);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
    dispatchSpy = spyOn(store, 'dispatch');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('it should have below fields', () => {
    it('should have title as "Add icon"', () => {
      var titleElement: HTMLElement = fixture.debugElement.query(By.css('.so-panel__title')).nativeElement;
      expect(titleElement).not.toBeNull();
      expect(titleElement.innerText.trim()).toBe('Add icon');
    });

    it('should have icon preview panel', () => {
      var previewElement: DebugElement = fixture.debugElement.query(By.css('.card'));
      expect(previewElement).not.toBeNull();
    });
    it('should have file upload button to upload icon', () => {
      var uploadButton: DebugElement = fixture.debugElement.query(By.css('#fileUpload'));
      expect(uploadButton).not.toBeNull();
    });
    it('should have clear button to clear uploaded icon', () => {
      var clearButton: DebugElement = fixture.debugElement.query(By.css('#icon-add-update_AeButton_1_aeButton_1'));
      expect(clearButton).not.toBeNull();
    });
    it('should have category dropdown and to be filled with hazard icon categories', () => {
      var categoryDropdown: DebugElement = fixture.debugElement.query(By.css('#icon-form_AeSelect_1'));
      expect(categoryDropdown).not.toBeNull();
      let options = categoryDropdown.nativeElement.children;
      expect(options[0].innerText).toBe('Please select');
      expect(options[1].innerText).toBe('General');
      expect(options[2].innerText).toBe('Control of substances hazardous to health');
      expect(options[3].innerText).toBe('Fire and first aid');
      expect(options[4].innerText).toBe('Storage disposal and spilloge');
      expect(options[5].innerText).toBe('Personal protective equipment');
    });
    it('should have name field', () => {
      var nameField: DebugElement = fixture.debugElement.query(By.css('#icon-form_AeInput_2'));
      expect(nameField).not.toBeNull();
    });
    it('should have description field', () => {
      var descriptionField: DebugElement = fixture.debugElement.query(By.css('#icon-form_AeTextArea_3'));
      expect(descriptionField).not.toBeNull();
    });
    it('should have cancel button', () => {
      var cancelButton: DebugElement = fixture.debugElement.query(By.css('#icon-form_Label_1'));
      expect(cancelButton).not.toBeNull();
    });
    it('should have add button', () => {
      var addButton: DebugElement = fixture.debugElement.query(By.css('#icon-form_AeAnchor_1'));
      expect(addButton).not.toBeNull();
    });

  });

  describe('it should show validation messages when clicked on "Add" without giving required data', () => {
    beforeEach(() => {
      var addButton: HTMLElement = fixture.debugElement.query(By.css('#icon-form_AeAnchor_1')).nativeElement;
      addButton.click();
      fixture.detectChanges();
    });
    it('should show "Icon is required" validation message', () => {
      var iconFieldErrorElement: HTMLElement = fixture.debugElement.query(By.css('#icon-form_AeFile_ErrorSpan_1')).nativeElement;
      expect(iconFieldErrorElement).not.toBeNull();
      expect(iconFieldErrorElement.innerText.trim()).toBe('VALIDATION_ERRORS.ICON_REQUIRED');
    });
    it('should show "Caategory is required" validation message', () => {
      var categoryFieldErrorElement: HTMLElement = fixture.debugElement.query(By.css('#icon-form_AeSelect_ErrorSpan_1')).nativeElement;
      expect(categoryFieldErrorElement).not.toBeNull();
      expect(categoryFieldErrorElement.innerText.trim()).toBe('Category is required');
    });
    it('should show "Name is required" validation message', () => {
      var nameFieldErrorElement: HTMLElement = fixture.debugElement.query(By.css('#icon-form_AeInput_ErrorSpan_2')).nativeElement;
      expect(nameFieldErrorElement).not.toBeNull();
      expect(nameFieldErrorElement.innerText.trim()).toBe('Name is required');
    });
    it('should show "Description is required" validation message', () => {
      var descriptionFieldErrorElement: HTMLElement = fixture.debugElement.query(By.css('#icon-form_AeTextArea_ErrorSpan_3')).nativeElement;
      expect(descriptionFieldErrorElement).not.toBeNull();
      expect(descriptionFieldErrorElement.innerText.trim()).toBe('Description is required');
    });

  });

  describe('it should create hazard icon when clicked on  "Add" with required data', () => {
    beforeEach(() => {
      submitIconData = new Icon();
      submitIconData.PictureId = 'BD12E17F-DED6-07F5-34F7-94CFDA33FBD0';
      submitIconData.Category = ControlIconCategory.General;
      submitIconData.Name = 'test';
      submitIconData.Description = 'test';

      component.iconForm.get('Name').setValue(submitIconData.Name);
      component.iconForm.get('Description').setValue(submitIconData.Description);
      component.iconForm.get('Category').setValue(submitIconData.Category);
      component.iconForm.get('PictureId').setValue(submitIconData.PictureId);

      fixture.debugElement.triggerEventHandler('click', null);
      fixture.detectChanges();
      component.onSubmit.subscribe(val => {
        submitEmittedIconData = val;
      });

    });
    it('should create hazard icon', fakeAsync(() => {
      var addButton: HTMLElement = fixture.debugElement.query(By.css('#icon-form_AeAnchor_1')).nativeElement;
      addButton.click();
      tick(250);
      expect(submitIconData.Name).toEqual((<Icon>submitEmittedIconData).Name);
      expect(submitIconData.Description).toEqual((<Icon>submitEmittedIconData).Description);
      expect(submitIconData.Category).toEqual((<Icon>submitEmittedIconData).Category);
      expect(submitIconData.PictureId).toEqual((<Icon>submitEmittedIconData).PictureId);
    }));
  });

});



describe('Update Hazard Icon', () => {
  let component: IconAddUpdateComponent;
  let fixture: ComponentFixture<IconAddUpdateComponent>;
  let store: Store<fromRoot.State>;
  let dispatchSpy: jasmine.Spy;
  let selectedIcon: Icon;
  let updatedIcon: Icon;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        LocalizationModule,
        AtlasSharedModule,
        StoreModule.provideStore(reducer)],
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
        , { provide: AuthorizationService, useClass: AuthorizationServiceStub }
        , FormBuilderService
        , FileUploadService
      ],
      declarations: [IconAddUpdateComponent]
    })
      .overrideComponent(IconAddUpdateComponent, { set: { host: { '(click)': 'dummy' } } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconAddUpdateComponent);
    component = fixture.componentInstance;
    component.type = IconType.Hazard;
    component.action = 'Update';
    component.id = 'icon-add-update';
    component.name = 'icon-add-update';
    store = fixture.debugElement.injector.get(Store);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
    dispatchSpy = spyOn(store, 'dispatch');
    dispatchSpy.and.callThrough();
    selectedIcon = IconManagementMockStoreProviderFactory.getIcon();
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('it should have below fields', () => {
    it('should have title as "Update icon"', () => {
      var titleElement: HTMLElement = fixture.debugElement.query(By.css('.so-panel__title')).nativeElement;
      expect(titleElement).not.toBeNull();
      expect(titleElement.innerText.trim()).toBe('Update icon');
    });

    it('should have icon preview panel', () => {
      var previewElement: DebugElement = fixture.debugElement.query(By.css('.card'));
      expect(previewElement).not.toBeNull();
    });
    it('should have file upload button to upload icon', () => {
      var uploadButton: DebugElement = fixture.debugElement.query(By.css('#fileUpload'));
      expect(uploadButton).not.toBeNull();
    });
    it('should have clear button to clear uploaded icon', () => {
      var clearButton: DebugElement = fixture.debugElement.query(By.css('#icon-add-update_AeButton_1_aeButton_1'));
      expect(clearButton).not.toBeNull();
    });
    it('should have category dropdown and to be filled with hazard icon categories', () => {
      var categoryDropdown: DebugElement = fixture.debugElement.query(By.css('#icon-form_AeSelect_1'));
      expect(categoryDropdown).not.toBeNull();
      let options = categoryDropdown.nativeElement.children;
      expect(options[0].innerText).toBe('Please select');
      expect(options[1].innerText).toBe('General');
      expect(options[2].innerText).toBe('Routes of exposure');
      expect(options[3].innerText).toBe('Control of substances hazardous to health');    
    });
    it('should have name field', () => {
      var nameField: DebugElement = fixture.debugElement.query(By.css('#icon-form_AeInput_2'));
      expect(nameField).not.toBeNull();
    });
    it('should have description field', () => {
      var descriptionField: DebugElement = fixture.debugElement.query(By.css('#icon-form_AeTextArea_3'));
      expect(descriptionField).not.toBeNull();
    });
    it('should have cancel button', () => {
      var cancelButton: DebugElement = fixture.debugElement.query(By.css('#icon-form_Label_1'));
      expect(cancelButton).not.toBeNull();
    });
    it('should have update button', () => {
      var updateButton: DebugElement = fixture.debugElement.query(By.css('#icon-form_AeAnchor_1'));
      expect(updateButton).not.toBeNull();
    });

  });

  describe('should display the icon details in edit mode', () => {
    beforeEach(() => {
      component.icon = selectedIcon;
      fixture.detectChanges();
    });
    it('should show icon name in name field', () => {
      expect(component.iconForm.get('Name').value).toEqual(selectedIcon.Name);
    });
    it('should show icon category in category field', () => {
      expect(component.iconForm.get('Category').value).toEqual(selectedIcon.Category);
    });
    it('should show icon description in description field', () => {
      expect(component.iconForm.get('Description').value).toEqual(selectedIcon.Description);
    });
    describe('should update icon details when clicked on "Update" with required data', () => {
      beforeEach(() => {
        component.iconForm.get('Name').setValue(selectedIcon.Name + '-updated');
        component.iconForm.get('Description').setValue(selectedIcon.Description + '-updated');
        component.iconForm.get('Category').setValue(HazardIconCategory.General);
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        component.onSubmit.subscribe(val => {
          updatedIcon = val;
        });
      });
      it('should update hazard icon', fakeAsync(() => {
        var updateButton: HTMLElement = fixture.debugElement.query(By.css('#icon-form_AeAnchor_1')).nativeElement;
        updateButton.click();
        tick(250);
        let newName = selectedIcon.Name + '-updated';
        let newDescription = selectedIcon.Description + '-updated';
        expect(updatedIcon.Name).toEqual(newName);
        expect(updatedIcon.Description).toEqual(newDescription);
      }));
    });
  });
});


describe('Update Control Icon', () => {
  let component: IconAddUpdateComponent;
  let fixture: ComponentFixture<IconAddUpdateComponent>;
  let store: Store<fromRoot.State>;
  let dispatchSpy: jasmine.Spy;
  let selectedIcon: Icon;
  let updatedIcon: Icon;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        LocalizationModule,
        AtlasSharedModule,
        StoreModule.provideStore(reducer)],
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
        , { provide: AuthorizationService, useClass: AuthorizationServiceStub }
        , FormBuilderService
        , FileUploadService
      ],
      declarations: [IconAddUpdateComponent]
    })
      .overrideComponent(IconAddUpdateComponent, { set: { host: { '(click)': 'dummy' } } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconAddUpdateComponent);
    component = fixture.componentInstance;
    component.type = IconType.Control;
    component.action = 'Update';
    component.id = 'icon-add-update';
    component.name = 'icon-add-update';
    store = fixture.debugElement.injector.get(Store);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
    dispatchSpy = spyOn(store, 'dispatch');
    dispatchSpy.and.callThrough();
    selectedIcon = IconManagementMockStoreProviderFactory.getIcon();
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('it should have below fields', () => {
    it('should have title as "Update icon"', () => {
      var titleElement: HTMLElement = fixture.debugElement.query(By.css('.so-panel__title')).nativeElement;
      expect(titleElement).not.toBeNull();
      expect(titleElement.innerText.trim()).toBe('Update icon');
    });

    it('should have icon preview panel', () => {
      var previewElement: DebugElement = fixture.debugElement.query(By.css('.card'));
      expect(previewElement).not.toBeNull();
    });
    it('should have file upload button to upload icon', () => {
      var uploadButton: DebugElement = fixture.debugElement.query(By.css('#fileUpload'));
      expect(uploadButton).not.toBeNull();
    });
    it('should have clear button to clear uploaded icon', () => {
      var clearButton: DebugElement = fixture.debugElement.query(By.css('#icon-add-update_AeButton_1_aeButton_1'));
      expect(clearButton).not.toBeNull();
    });
    it('should have category dropdown and to be filled with hazard icon categories', () => {
      var categoryDropdown: DebugElement = fixture.debugElement.query(By.css('#icon-form_AeSelect_1'));
      expect(categoryDropdown).not.toBeNull();
      let options = categoryDropdown.nativeElement.children;
      expect(options[0].innerText).toBe('Please select');
      expect(options[1].innerText).toBe('General');
      expect(options[2].innerText).toBe('Control of substances hazardous to health');
      expect(options[3].innerText).toBe('Fire and first aid');
      expect(options[4].innerText).toBe('Storage disposal and spilloge');
      expect(options[5].innerText).toBe('Personal protective equipment');
    });
    it('should have name field', () => {
      var nameField: DebugElement = fixture.debugElement.query(By.css('#icon-form_AeInput_2'));
      expect(nameField).not.toBeNull();
    });
    it('should have description field', () => {
      var descriptionField: DebugElement = fixture.debugElement.query(By.css('#icon-form_AeTextArea_3'));
      expect(descriptionField).not.toBeNull();
    });
    it('should have cancel button', () => {
      var cancelButton: DebugElement = fixture.debugElement.query(By.css('#icon-form_Label_1'));
      expect(cancelButton).not.toBeNull();
    });
    it('should have update button', () => {
      var updateButton: DebugElement = fixture.debugElement.query(By.css('#icon-form_AeAnchor_1'));
      expect(updateButton).not.toBeNull();
    });

  });

  describe('should display the icon details in edit mode', () => {
    beforeEach(() => {
      component.icon = selectedIcon;
      fixture.detectChanges();
    });
    it('should show icon name in name field', () => {
      expect(component.iconForm.get('Name').value).toEqual(selectedIcon.Name);
    });
    it('should show icon category in category field', () => {
      expect(component.iconForm.get('Category').value).toEqual(selectedIcon.Category);
    });
    it('should show icon description in description field', () => {
      expect(component.iconForm.get('Description').value).toEqual(selectedIcon.Description);
    });
    describe('should update icon details when clicked on "Update" with required data', () => {
      beforeEach(() => {
        component.iconForm.get('Name').setValue(selectedIcon.Name + '-updated');
        component.iconForm.get('Description').setValue(selectedIcon.Description + '-updated');
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        component.onSubmit.subscribe(val => {
          updatedIcon = val;
        });
      });
      it('should update control icon', fakeAsync(() => {
        var updateButton: HTMLElement = fixture.debugElement.query(By.css('#icon-form_AeAnchor_1')).nativeElement;
        updateButton.click();
        tick(250);
        let newName = selectedIcon.Name + '-updated';
        let newDescription = selectedIcon.Description + '-updated';
        expect(updatedIcon.Name).toEqual(newName);
        expect(updatedIcon.Description).toEqual(newDescription);
      }));
    });
  });
});