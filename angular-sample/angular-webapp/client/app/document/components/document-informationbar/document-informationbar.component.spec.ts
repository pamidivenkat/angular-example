import { DocumentInformationbarComponent } from './document-informationbar.component';
import { ComponentFixture, async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { AtlasElementsModule } from './../../../atlas-elements/atlas-elements.module';
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { StoreModule, Store } from '@ngrx/store';
import { reducer } from './../../../shared/reducers';
import { LocaleServiceStub } from './../../../shared/testing/mocks/locale-service-stub';
import { TranslationServiceStub } from './../../../shared/testing/mocks/translation-service-stub';
import { LocalizationConfig } from './../../../shared/localization-config';
import { LocalizationConfigStub } from './../../../shared/testing/mocks/localization-config-stub';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterMock } from './../../../shared/testing/mocks/router-stub';
import { ActivatedRouteStub } from './../../../shared/testing/mocks/activated-route-stub';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbServiceStub } from './../../../shared/testing/mocks/breadcrumb-service-mock';
import { ClaimsHelperServiceStub } from './../../../shared/testing/mocks/claims-helper-service-mock';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { RouteParams } from './../../../shared/services/route-params';
import { RouteParamsMock } from './../../../shared/testing/mocks/route-params-mock';
import { By } from '@angular/platform-browser';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { AeInformationBarItem } from './../../../atlas-elements/common/models/ae-informationbar-item';
import { ResponseOptions, Response } from '@angular/http';
import { extractInformationBarItems } from './../../../shared/helpers/extract-helpers';
import { DebugElement } from '@angular/core';

describe('Document Informationbar Component', () => {
    let component: DocumentInformationbarComponent;
    let fixture: ComponentFixture<DocumentInformationbarComponent>;
    let store: any;
    let breadCumServiceStub: any;
    let localeServiceStub: any;
    let translationServiceStub: any;
    let localizationConfigStub: any;
    let routerMock: any;
    let activatedRouteStub: any;
    let dispatchSpy: any;
    let routeParamsStub: any;
    let items = [];

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                AtlasElementsModule,
                LocalizationModule,
                StoreModule.provideStore(reducer),
            ],
            declarations: [
                DocumentInformationbarComponent
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
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DocumentInformationbarComponent);
        component = fixture.componentInstance;

        store = fixture.debugElement.injector.get(Store);

        breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
        localeServiceStub = fixture.debugElement.injector.get(LocaleService);
        translationServiceStub = fixture.debugElement.injector.get(TranslationService);
        localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
        routerMock = fixture.debugElement.injector.get(Router);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        routeParamsStub = fixture.debugElement.injector.get(RouteParams);
        routeParamsStub.cid = null;
        dispatchSpy = spyOn(store, 'dispatch');
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;

    });

    it('Document Informationbar Component must be launched', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('Loading mask in document information bar component', () => {
        it('should show loading mask before actual data loaded into the component', () => {
            component.DocumentsInformationBarLoaded = false;
            fixture.detectChanges();
            let loadElement = fixture.debugElement.query(By.css('.statistics-bar.display-flex'));
            expect(loadElement).toBeDefined();
        });

        it('should not show loading mask once actual data loaded into the component', () => {
            let infoItems = <AeInformationBarItem[]>MockStoreProviderFactory.getMockedDocumentInformationbarItems();
            let options = new ResponseOptions({ body: infoItems });
            let res = new Response(options);
            let obj = extractInformationBarItems(res);
            component.DocumentsInformationItems = obj;
            component.DocumentsInformationBarLoaded = true;
            fixture.detectChanges();
            let loadElement = fixture.debugElement.query(By.css('.statistics-bar.display-flex'));
            expect(loadElement).toBeNull();
        });
    });

    describe('Document informationbar items - Active risk assessments', () => {
        it('should have agreed title, tooltip, count, icon, action for "Active risk assessments" information bar item with some count', fakeAsync(() => {
            let infoItems = <AeInformationBarItem[]>MockStoreProviderFactory.getMockedDocumentInformationbarItems();
            let options = new ResponseOptions({ body: infoItems });
            let res = new Response(options);
            let obj = extractInformationBarItems(res);
            component.DocumentsInformationItems = obj;
            component.DocumentsInformationBarLoaded = true;
            fixture.detectChanges();

            let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
            expect(iconElement.innerText.trim()).toBe('Active risk assessments');

            iconElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
            expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(20);

            iconElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
                .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
            expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-notebook');

            iconElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
            expect(iconElement.getAttribute('title').trim())
                .toBe('This number shows your active risk assessments. You may see more risk assessments in this folder if you\'ve exported any that have not yet been approved.');

            let emitSpy = spyOn(component.onInformationItemSelected, 'emit');
            let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
                .query(By.css('div.statistic'));
            (<HTMLElement>firstStatElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();

            expect(emitSpy).toHaveBeenCalled();
            expect(emitSpy).toHaveBeenCalledWith(component.DocumentsInformationItems[0]);
        }));

        it('should have agreed title, tooltip, count, icon, action for "Active risk assessments" information bar item with 0 count', fakeAsync(() => {
            let infoItems = <AeInformationBarItem[]>MockStoreProviderFactory.getMockedDocumentInformationbarItems();
            let options = new ResponseOptions({ body: infoItems });
            let res = new Response(options);
            let obj = extractInformationBarItems(res);
            obj[0].Count = 0;
            component.DocumentsInformationItems = obj;
            component.DocumentsInformationBarLoaded = true;
            fixture.detectChanges();

            let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
            expect(iconElement.innerText.trim()).toBe('Active risk assessments');

            iconElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
            expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(0);

            iconElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
                .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
            expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-notebook');

            iconElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic')).nativeElement;
            expect(iconElement.getAttribute('title').trim())
                .toBe('Looks like you don\'t currently have any Risk Assessments. Go to your Risk Assessment Library to create some');

            let clickSpy = spyOn(component, 'onDocumentInformationItemSelect');
            let firstStatElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0]
                .query(By.css('div.statistic'));
            (<HTMLElement>firstStatElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();
            expect(clickSpy).toHaveBeenCalled();
            expect(clickSpy).toHaveBeenCalledWith(component.DocumentsInformationItems[0]);
        }));
    });

    describe('Document informationbar items - Employee handbooks outstanding', () => {
        it('should have agreed title, tooltip, count, icon, action for "Employee handbooks outstanding" information bar item with count greater than zero', fakeAsync(() => {
            let infoItems = <AeInformationBarItem[]>MockStoreProviderFactory.getMockedDocumentInformationbarItems();
            let options = new ResponseOptions({ body: infoItems });
            let res = new Response(options);
            let obj = extractInformationBarItems(res);
            component.DocumentsInformationItems = obj;
            component.DocumentsInformationBarLoaded = true;
            fixture.detectChanges();

            let statElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[1];
            let iconElement: HTMLElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
            expect(iconElement.innerText.trim()).toBe('Employee handbooks outstanding');

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
            expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(32);

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
            expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-notebook');

            iconElement = statElement.query(By.css('.statistic')).nativeElement;
            expect(iconElement.getAttribute('title').trim())
                .toBe('Click here to view the distributed Employee Handbook that still requires action');

            let emitSpy = spyOn(component.onInformationItemSelected, 'emit');
            let firstStatElement: DebugElement = statElement
                .query(By.css('div.statistic'));
            (<HTMLElement>firstStatElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();

            expect(emitSpy).toHaveBeenCalled();
            expect(emitSpy).toHaveBeenCalledWith(component.DocumentsInformationItems[1]);
        }));

        it('should have agreed title, tooltip, count, icon, action for "Employee handbooks outstanding" information bar item with count 0', fakeAsync(() => {
            let infoItems = <AeInformationBarItem[]>MockStoreProviderFactory.getMockedDocumentInformationbarItems();
            let options = new ResponseOptions({ body: infoItems });
            let res = new Response(options);
            let obj = extractInformationBarItems(res);
            obj[1].Count = 0;
            component.DocumentsInformationItems = obj;
            component.DocumentsInformationBarLoaded = true;
            fixture.detectChanges();

            let statElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[1];
            let iconElement: HTMLElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
            expect(iconElement.innerText.trim()).toBe('Employee handbooks outstanding');

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
            expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(0);

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
            expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-notebook');

            iconElement = statElement.query(By.css('.statistic')).nativeElement;
            expect(iconElement.getAttribute('title').trim())
                .toBe('Looks like everyone has actioned the handbook sent to them');

            let clickSpy = spyOn(component, 'onDocumentInformationItemSelect');
            let firstStatElement: DebugElement = statElement
                .query(By.css('div.statistic'));
            (<HTMLElement>firstStatElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();
            expect(clickSpy).toHaveBeenCalled();
            expect(clickSpy).toHaveBeenCalledWith(component.DocumentsInformationItems[1]);
        }));
    });

    describe('Document informationbar items - Documents to action', () => {
        it('should have agreed title, tooltip, count, icon, action for "Documents to action" information bar item with count greater than zero', fakeAsync(() => {
            let infoItems = <AeInformationBarItem[]>MockStoreProviderFactory.getMockedDocumentInformationbarItems();
            let options = new ResponseOptions({ body: infoItems });
            let res = new Response(options);
            let obj = extractInformationBarItems(res);
            component.DocumentsInformationItems = obj;
            component.DocumentsInformationBarLoaded = true;
            fixture.detectChanges();

            let statElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[2];
            let iconElement: HTMLElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
            expect(iconElement.innerText.trim()).toBe('Documents to action');

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
            expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(39);

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
            expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-to-review');

            iconElement = statElement.query(By.css('.statistic')).nativeElement;
            expect(iconElement.getAttribute('title').trim())
                .toBe('Click here to view documents that need your action');

            let emitSpy = spyOn(component.onInformationItemSelected, 'emit');
            let firstStatElement: DebugElement = statElement
                .query(By.css('div.statistic'));
            (<HTMLElement>firstStatElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();

            expect(emitSpy).toHaveBeenCalled();
            expect(emitSpy).toHaveBeenCalledWith(component.DocumentsInformationItems[2]);
        }));

        it('should have agreed title, tooltip, count, icon, action for "Documents to action" information bar item with count 0', fakeAsync(() => {
            let infoItems = <AeInformationBarItem[]>MockStoreProviderFactory.getMockedDocumentInformationbarItems();
            let options = new ResponseOptions({ body: infoItems });
            let res = new Response(options);
            let obj = extractInformationBarItems(res);
            obj[2].Count = 0;
            component.DocumentsInformationItems = obj;
            component.DocumentsInformationBarLoaded = true;
            fixture.detectChanges();

            let statElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[2];
            let iconElement: HTMLElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
            expect(iconElement.innerText.trim()).toBe('Documents to action');

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
            expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(0);

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
            expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-to-review');

            iconElement = statElement.query(By.css('.statistic')).nativeElement;
            expect(iconElement.getAttribute('title').trim())
                .toBe('Looks like you\'re up to date');

            let clickSpy = spyOn(component, 'onDocumentInformationItemSelect');
            let firstStatElement: DebugElement = statElement
                .query(By.css('div.statistic'));
            (<HTMLElement>firstStatElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();
            expect(clickSpy).toHaveBeenCalled();
            expect(clickSpy).toHaveBeenCalledWith(component.DocumentsInformationItems[2]);
        }));
    });

    describe('Document informationbar items - Training certificates', () => {
        it('should have agreed title, tooltip, count, icon, action for "Training certificates" information bar item with count greater than zero', fakeAsync(() => {
            let infoItems = <AeInformationBarItem[]>MockStoreProviderFactory.getMockedDocumentInformationbarItems();
            let options = new ResponseOptions({ body: infoItems });
            let res = new Response(options);
            let obj = extractInformationBarItems(res);
            component.DocumentsInformationItems = obj;
            component.DocumentsInformationBarLoaded = true;
            fixture.detectChanges();

            let statElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[3];
            let iconElement: HTMLElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
            expect(iconElement.innerText.trim()).toBe('Training certificates');

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
            expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(15);

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
            expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-certificate');

            iconElement = statElement.query(By.css('.statistic')).nativeElement;
            expect(iconElement.getAttribute('title').trim())
                .toBe('Click here to view your Training Certificates');

            let emitSpy = spyOn(component.onInformationItemSelected, 'emit');
            let firstStatElement: DebugElement = statElement
                .query(By.css('div.statistic'));
            (<HTMLElement>firstStatElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();

            expect(emitSpy).toHaveBeenCalled();
            expect(emitSpy).toHaveBeenCalledWith(component.DocumentsInformationItems[3]);
        }));

        it('should have agreed title, tooltip, count, icon, action for "Training certificates" information bar item with count 0', fakeAsync(() => {
            let infoItems = <AeInformationBarItem[]>MockStoreProviderFactory.getMockedDocumentInformationbarItems();
            let options = new ResponseOptions({ body: infoItems });
            let res = new Response(options);
            let obj = extractInformationBarItems(res);
            obj[3].Count = 0;
            component.DocumentsInformationItems = obj;
            component.DocumentsInformationBarLoaded = true;
            fixture.detectChanges();

            let statElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[3];
            let iconElement: HTMLElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
            expect(iconElement.innerText.trim()).toBe('Training certificates');

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
            expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(0);

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
            expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-certificate');

            iconElement = statElement.query(By.css('.statistic')).nativeElement;
            expect(iconElement.getAttribute('title').trim())
                .toBe('You have no training certificates');

            let clickSpy = spyOn(component, 'onDocumentInformationItemSelect');
            let firstStatElement: DebugElement = statElement
                .query(By.css('div.statistic'));
            (<HTMLElement>firstStatElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();
            expect(clickSpy).toHaveBeenCalled();
            expect(clickSpy).toHaveBeenCalledWith(component.DocumentsInformationItems[3]);
        }));
    });

    describe('Document informationbar items - Shared documents', () => {
        it('should have agreed title, tooltip, count, icon, action for "Shared documents" information bar item with count greater than zero', fakeAsync(() => {
            let infoItems = <AeInformationBarItem[]>MockStoreProviderFactory.getMockedDocumentInformationbarItems();
            let options = new ResponseOptions({ body: infoItems });
            let res = new Response(options);
            let obj = extractInformationBarItems(res);
            component.DocumentsInformationItems = obj;
            component.DocumentsInformationBarLoaded = true;
            fixture.detectChanges();

            let statElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[4];
            let iconElement: HTMLElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
            expect(iconElement.innerText.trim()).toBe('Shared documents');

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
            expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(41);

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
            expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-notebook');

            iconElement = statElement.query(By.css('.statistic')).nativeElement;
            expect(iconElement.getAttribute('title').trim())
                .toBe('Click here to view the documents that have been shared with you');

            let emitSpy = spyOn(component.onInformationItemSelected, 'emit');
            let firstStatElement: DebugElement = statElement
                .query(By.css('div.statistic'));
            (<HTMLElement>firstStatElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();

            expect(emitSpy).toHaveBeenCalled();
            expect(emitSpy).toHaveBeenCalledWith(component.DocumentsInformationItems[4]);
        }));

        it('should have agreed title, tooltip, count, icon, action for "Shared documents" information bar item with count 0', fakeAsync(() => {
            let infoItems = <AeInformationBarItem[]>MockStoreProviderFactory.getMockedDocumentInformationbarItems();
            let options = new ResponseOptions({ body: infoItems });
            let res = new Response(options);
            let obj = extractInformationBarItems(res);
            obj[4].Count = 0;
            component.DocumentsInformationItems = obj;
            component.DocumentsInformationBarLoaded = true;
            fixture.detectChanges();

            let statElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[4];
            let iconElement: HTMLElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
            expect(iconElement.innerText.trim()).toBe('Shared documents');

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
            expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(0);

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
            expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-notebook');

            iconElement = statElement.query(By.css('.statistic')).nativeElement;
            expect(iconElement.getAttribute('title').trim())
                .toBe('Keep an eye on this area for when documents are sent to you');

            let clickSpy = spyOn(component, 'onDocumentInformationItemSelect');
            let firstStatElement: DebugElement = statElement
                .query(By.css('div.statistic'));
            (<HTMLElement>firstStatElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();
            expect(clickSpy).toHaveBeenCalled();
            expect(clickSpy).toHaveBeenCalledWith(component.DocumentsInformationItems[4]);
        }));
    });

    describe('Document informationbar items - Personal documents', () => {
        it('should have agreed title, tooltip, count, icon, action for "Personal documents" information bar item with count greater than zero', fakeAsync(() => {
            let infoItems = <AeInformationBarItem[]>MockStoreProviderFactory.getMockedDocumentInformationbarItems();
            let options = new ResponseOptions({ body: infoItems });
            let res = new Response(options);
            let obj = extractInformationBarItems(res);
            component.DocumentsInformationItems = obj;
            component.DocumentsInformationBarLoaded = true;
            fixture.detectChanges();

            let statElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[5];
            let iconElement: HTMLElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
            expect(iconElement.innerText.trim()).toBe('Personal documents');

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
            expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(7);

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
            expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-employee');

            iconElement = statElement.query(By.css('.statistic')).nativeElement;
            expect(iconElement.getAttribute('title').trim())
                .toBe('Click here to view the documents you have uploaded');

            let emitSpy = spyOn(component.onInformationItemSelected, 'emit');
            let firstStatElement: DebugElement = statElement
                .query(By.css('div.statistic'));
            (<HTMLElement>firstStatElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();

            expect(emitSpy).toHaveBeenCalled();
            expect(emitSpy).toHaveBeenCalledWith(component.DocumentsInformationItems[5]);
        }));

        it('should have agreed title, tooltip, count, icon, action for information bar item with count 0', fakeAsync(() => {
            let infoItems = <AeInformationBarItem[]>MockStoreProviderFactory.getMockedDocumentInformationbarItems();
            let options = new ResponseOptions({ body: infoItems });
            let res = new Response(options);
            let obj = extractInformationBarItems(res);
            obj[5].Count = 0;
            component.DocumentsInformationItems = obj;
            component.DocumentsInformationBarLoaded = true;
            fixture.detectChanges();

            let statElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[5];
            let iconElement: HTMLElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
            expect(iconElement.innerText.trim()).toBe('Personal documents');

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__number')).nativeElement;
            expect(parseInt(iconElement.innerText.trim(), 10)).toEqual(0);

            iconElement = statElement.query(By.css('.statistic'))
                .query(By.css('.statistic__icon')).query(By.css('.icon.icon--medium')).nativeElement;
            expect(iconElement.querySelector('use').getAttribute('xlink:href')).toContain('icon-employee');

            iconElement = statElement.query(By.css('.statistic')).nativeElement;
            expect(iconElement.getAttribute('title').trim())
                .toBe('Looks like you haven\'t uploaded anything here yet!');

            let clickSpy = spyOn(component, 'onDocumentInformationItemSelect');
            let firstStatElement: DebugElement = statElement
                .query(By.css('div.statistic'));
            (<HTMLElement>firstStatElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();
            expect(clickSpy).toHaveBeenCalled();
            expect(clickSpy).toHaveBeenCalledWith(component.DocumentsInformationItems[5]);
        }));
    });

    describe('When cid is available', () => {
        it('should show only "Active risk assessments" "Employee handbooks outstanding" when cid is available', fakeAsync(() => {
            routeParamsStub.Cid = '5AE84046-482C-4CE3-980B-6A1F6385A8D3';
            let infoItems = <AeInformationBarItem[]>MockStoreProviderFactory.getMockedDocumentInformationbarItems();
            let options = new ResponseOptions({ body: infoItems });
            let res = new Response(options);
            let obj = extractInformationBarItems(res);
            component.DocumentsInformationItems = obj;
            component.DocumentsInformationBarLoaded = true;
            fixture.detectChanges();

            let statElementCount: number = fixture.debugElement.queryAll(By.css('ae-statistic')).length;
            expect(statElementCount).toBe(2);

            let iconElement: HTMLElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
            expect(iconElement.innerText.trim()).toBe('Active risk assessments');

            iconElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[1].query(By.css('.statistic'))
                .query(By.css('.statistic__copy')).query(By.css('.statistic__name')).nativeElement;
            expect(iconElement.innerText.trim()).toBe('Employee handbooks outstanding');
        }));
    });
});
