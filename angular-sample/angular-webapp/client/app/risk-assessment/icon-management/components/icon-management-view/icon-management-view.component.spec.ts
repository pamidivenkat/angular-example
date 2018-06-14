import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { IconManagementViewComponent } from './icon-management-view.component';
import { IconManagementMockStoreProviderFactory } from '../../../../shared/testing/mocks/icon-mgmt-mock-store-provider-factory';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { LocalizationConfig } from '../../../../shared/localization-config';
import { LocalizationConfigStub } from '../../../../shared/testing/mocks/localization-config-stub';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { RouteParams } from '../../../../shared/services/route-params';
import { RouteParamsMock } from '../../../../shared/testing/mocks/route-params-mock';
import { Http } from '@angular/http';
import { mockHttpProvider } from '../../../../shared/testing/mocks/http-stub';
import { DatePipe, JsonPipe } from '@angular/common';

describe('icon-management view details slide out', () => {
    let component: IconManagementViewComponent;
    let fixture: ComponentFixture<IconManagementViewComponent>;

    let localeServiceStub: any;
    let translationServiceStub: any;
    let datePipe: any;
    let selectedHazard: any;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IconManagementViewComponent
            ],
            imports: [
                AtlasElementsModule
                , LocalizationModule
            ],
            providers: [
                InjectorRef
                , DatePipe, JsonPipe
                , BreadcrumbService
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
                , { provide: Router, useClass: RouterMock }
                , { provide: ActivatedRoute, useValue: { snapshot: { url: [{ path: 'hazards' }] } } }
                , { provide: RouteParams, useClass: RouteParamsMock }
                , { provide: Http, useValue: mockHttpProvider }
            ]
        }).overrideComponent(IconManagementViewComponent, { set: { host: { "(click)": "dummy" } } })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IconManagementViewComponent);
        datePipe = fixture.debugElement.injector.get(DatePipe);
        component = fixture.componentInstance;
        component.id = "iconViewDetailsid";
        component.name = "iconViewDetailsidtname";
        selectedHazard = IconManagementMockStoreProviderFactory.GetMockHazardIconsList().HazardsOrControlsList.toArray()[0];
        selectedHazard.CategoryText = 'General';
        selectedHazard.CategoryType = 'hazard';
        component.iconDetails = selectedHazard;
        fixture.detectChanges();
    });

    it('should create IconManagementViewDetails component', () => {
        expect(component).toBeTruthy();
    });

    it('should display header as `Hazard details` when viewing Hazard icon details', () => {
        let slideoutTitle = fixture.debugElement.query(By.css('.so-panel__title')).nativeElement;
        expect(slideoutTitle).toBeDefined();
    });


    it('should display Preview,Name,Description,Created on,Created by,Modified on,Modified by fields When  version not equal to 1.0', () => {
        let previewField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Preview');
        let categoryField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Category');
        let nameField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Name');
        let descriptionField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Description');
        let createdOnField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#CreatedOn');
        let createdByField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#CreatedBy');
        let modifiedOnField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#ModifiedOn');
        let modifiedByField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#ModifiedBy');

        let createdOnDate = datePipe.transform(selectedHazard.CreatedOn, 'dd/MM/yyyy');
        let modifiedOnDate = datePipe.transform(selectedHazard.ModifiedOn, 'dd/MM/yyyy');

        expect(previewField).toBeTruthy();
        expect(categoryField).toBeTruthy();
        expect(nameField).toBeTruthy();
        expect(descriptionField).toBeTruthy();
        expect(createdOnField).toBeTruthy();
        expect(createdByField).toBeTruthy();
        expect(modifiedOnField).toBeTruthy();
        expect(modifiedByField).toBeTruthy();

        expect(categoryField.children[1].innerHTML).toContain(selectedHazard.CategoryText);
        expect(nameField.children[1].innerHTML).toContain(selectedHazard.Name);
        expect(descriptionField.children[1].innerHTML).toContain(selectedHazard.Description);
        expect(createdOnField.children[1].innerHTML).toContain(createdOnDate);
        expect(createdByField.children[1].innerHTML).toContain(selectedHazard.CreatedBy);
        expect(modifiedOnField.children[1].innerHTML).toContain(modifiedOnDate);
        expect(modifiedByField.children[1].innerHTML).toContain(selectedHazard.ModifiedBy);
    });
    it('should display Preview,Name,Description,Created on,Created by fields When  version equals to 1.0', () => {
        selectedHazard = IconManagementMockStoreProviderFactory.GetMockHazardIconsList().HazardsOrControlsList.toArray()[1];
        selectedHazard.CategoryText = 'General';
        selectedHazard.CategoryType = 'hazard';
        component.iconDetails = selectedHazard;
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        let previewField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Preview');
        let categoryField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Category');
        let nameField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Name');
        let descriptionField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Description');
        let createdOnField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#CreatedOn');
        let createdByField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#CreatedBy');

        let createdOnDate = datePipe.transform(selectedHazard.CreatedOn, 'dd/MM/yyyy');
        let modifiedOnDate = datePipe.transform(selectedHazard.ModifiedOn, 'dd/MM/yyyy');

        expect(previewField).toBeTruthy();
        expect(categoryField).toBeTruthy();
        expect(nameField).toBeTruthy();
        expect(descriptionField).toBeTruthy();
        expect(createdOnField).toBeTruthy();
        expect(createdByField).toBeTruthy();

        expect(categoryField.children[1].innerHTML).toContain(selectedHazard.CategoryText);
        expect(nameField.children[1].innerHTML).toContain(selectedHazard.Name);
        expect(descriptionField.children[1].innerHTML).toContain(selectedHazard.Description);
        expect(createdOnField.children[1].innerHTML).toContain(createdOnDate);
        expect(createdByField.children[1].innerHTML).toContain(selectedHazard.CreatedBy);
    });

    it('should have close button in the footer', () => {
        let cancelButton: HTMLElement = fixture.debugElement.nativeElement.querySelector('#btnCancel_aeButton_1');
        expect(cancelButton).toBeDefined();
    });

    it('should emit event to list screen when close button was clicked', () => {
        spyOn(component, 'onDetailCancel').and.callThrough();
        let cancelButton: HTMLElement = fixture.debugElement.nativeElement.querySelector('#btnCancel_aeButton_1');
        cancelButton.click();
        expect(component.onDetailCancel).toHaveBeenCalled();
    });
});

describe('icon-management view details slide out', () => {
    let component: IconManagementViewComponent;
    let fixture: ComponentFixture<IconManagementViewComponent>;

    let localeServiceStub: any;
    let translationServiceStub: any;
    let datePipe: any;
    let selectedHazard: any;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IconManagementViewComponent
            ],
            imports: [
                AtlasElementsModule
                , LocalizationModule
            ],
            providers: [
                InjectorRef
                , DatePipe, JsonPipe
                , BreadcrumbService
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
                , { provide: Router, useClass: RouterMock }
                , { provide: ActivatedRoute, useValue: { snapshot: { url: [{ path: 'controls' }] } } }
                , { provide: RouteParams, useClass: RouteParamsMock }
                , { provide: Http, useValue: mockHttpProvider }
            ]
        }).overrideComponent(IconManagementViewComponent, { set: { host: { "(click)": "dummy" } } })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IconManagementViewComponent);
        datePipe = fixture.debugElement.injector.get(DatePipe);
        component = fixture.componentInstance;
        component.id = "iconViewDetailsid";
        component.name = "iconViewDetailsidtname";
        selectedHazard = IconManagementMockStoreProviderFactory.GetMockControlIconsList().HazardsOrControlsList.toArray()[0];
        selectedHazard.CategoryText = 'General';
        component.iconDetails = selectedHazard;
        fixture.detectChanges();
    });

    it('should create IconManagementViewDetails component', () => {
        expect(component).toBeTruthy();
    });

    it('should display header as `Control details` when viewing Control icon details', () => {
        let slideoutTitle = fixture.debugElement.query(By.css('.so-panel__title')).nativeElement;
        expect(slideoutTitle).toBeDefined();
    });

    it('should display Preview,Name,Description,Created on,Created by,Modified on,Modified by fields When version not equals to 1.0', () => {
        let previewField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Preview');
        let categoryField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Category');
        let nameField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Name');
        let descriptionField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Description');
        let createdOnField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#CreatedOn');
        let createdByField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#CreatedBy');
        let modifiedOnField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#ModifiedOn');
        let modifiedByField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#ModifiedBy');

        let createdOnDate = datePipe.transform(selectedHazard.CreatedOn, 'dd/MM/yyyy');
        let modifiedOnDate = datePipe.transform(selectedHazard.ModifiedOn, 'dd/MM/yyyy');

        expect(previewField).toBeTruthy();
        expect(categoryField).toBeTruthy();
        expect(nameField).toBeTruthy();
        expect(descriptionField).toBeTruthy();
        expect(createdOnField).toBeTruthy();
        expect(createdByField).toBeTruthy();
        expect(modifiedOnField).toBeTruthy();
        expect(modifiedByField).toBeTruthy();

        expect(categoryField.children[1].innerHTML).toContain(selectedHazard.CategoryText);
        expect(nameField.children[1].innerHTML).toContain(selectedHazard.Name);
        expect(descriptionField.children[1].innerHTML).toContain(selectedHazard.Description);
        expect(createdOnField.children[1].innerHTML).toContain(createdOnDate);
        expect(createdByField.children[1].innerHTML).toContain(selectedHazard.CreatedBy);
        expect(modifiedOnField.children[1].innerHTML).toContain(modifiedOnDate);
        expect(modifiedByField.children[1].innerHTML).toContain(selectedHazard.ModifiedBy);
    });

    it('should display Preview,Name,Description,Created on,Created by fields When version  equals to 1.0', () => {
        selectedHazard = IconManagementMockStoreProviderFactory.GetMockControlIconsList().HazardsOrControlsList.toArray()[1];
        selectedHazard.CategoryText = 'General';
        component.iconDetails = selectedHazard;
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        let previewField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Preview');
        let categoryField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Category');
        let nameField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Name');
        let descriptionField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#Description');
        let createdOnField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#CreatedOn');
        let createdByField: HTMLElement = fixture.debugElement.nativeElement.querySelector('#CreatedBy');

        let createdOnDate = datePipe.transform(selectedHazard.CreatedOn, 'dd/MM/yyyy');
        let modifiedOnDate = datePipe.transform(selectedHazard.ModifiedOn, 'dd/MM/yyyy');

        expect(previewField).toBeTruthy();
        expect(categoryField).toBeTruthy();
        expect(nameField).toBeTruthy();
        expect(descriptionField).toBeTruthy();
        expect(createdOnField).toBeTruthy();
        expect(createdByField).toBeTruthy();

        expect(categoryField.children[1].innerHTML).toContain(selectedHazard.CategoryText);
        expect(nameField.children[1].innerHTML).toContain(selectedHazard.Name);
        expect(descriptionField.children[1].innerHTML).toContain(selectedHazard.Description);
        expect(createdOnField.children[1].innerHTML).toContain(createdOnDate);
        expect(createdByField.children[1].innerHTML).toContain(selectedHazard.CreatedBy);
    });

    it('should have close button in the footer', () => {
        let cancelButton: HTMLElement = fixture.debugElement.nativeElement.querySelector('#btnCancel_aeButton_1');
        expect(cancelButton).toBeDefined();
    });

    it('should emit event to list screen when close button was clicked', () => {
        spyOn(component, 'onDetailCancel').and.callThrough();
        let cancelButton: HTMLElement = fixture.debugElement.nativeElement.querySelector('#btnCancel_aeButton_1');
        cancelButton.click();
        expect(component.onDetailCancel).toHaveBeenCalled();
    });
});