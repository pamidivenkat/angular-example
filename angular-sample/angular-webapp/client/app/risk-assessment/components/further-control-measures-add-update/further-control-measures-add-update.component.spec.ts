import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, EventEmitter } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BaseRequestOptions, Http, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Action, Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observer, Subject } from 'rxjs/Rx';

import { extractUserSelectOptionListData } from '../../../shared/helpers/extract-helpers';
import { RiskAssessmentService } from '../../services/risk-assessment-service';
import { routes } from './../../../atlas-design/atlas-design.routes';
import { AtlasElementsComponent } from './../../../atlas-design/atlas-elements/atlas-elements.component';
import { AtlasElementsModule } from './../../../atlas-elements/atlas-elements.module';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { EmailSharedModule } from './../../../email-shared/email-shared.module';
import { AeDataActionTypes } from './../../../employee/models/action-types.enum';
import { AtlasSharedModule } from './../../../shared/atlas-shared.module';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { DateTimeHelper } from './../../../shared/helpers/datetime-helper';
import { LocalizationConfig } from './../../../shared/localization-config';
import * as fromRoot from './../../../shared/reducers';
import { reducer } from './../../../shared/reducers/index';
import { FormBuilderService } from './../../../shared/services/form-builder.service';
import { RouteParams } from './../../../shared/services/route-params';
import { ActivatedRouteStub } from './../../../shared/testing/mocks/activated-route-stub';
import { BreadcrumbServiceStub } from './../../../shared/testing/mocks/breadcrumb-service-mock';
import { ClaimsHelperServiceStub } from './../../../shared/testing/mocks/claims-helper-service-mock';
import { mockHttpProvider } from './../../../shared/testing/mocks/http-stub';
import { LocaleServiceStub } from './../../../shared/testing/mocks/locale-service-stub';
import { LocalizationConfigStub } from './../../../shared/testing/mocks/localization-config-stub';
import { MockStoreAddUpdateFurtherControls } from './../../../shared/testing/mocks/mock-store-addupdate-further-control';
import { RestClientServiceStub } from './../../../shared/testing/mocks/rest-client-service-stub';
import { RouteParamsMock } from './../../../shared/testing/mocks/route-params-mock';
import { RouterMock } from './../../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from './../../../shared/testing/mocks/translation-service-stub';
import { TaskActivity } from './../../../task/models/task-activity';
import { FurtherControlMeasuresAddUpdateComponent } from './further-control-measures-add-update.component';

describe('Further Control Measures', () => {
    let component: FurtherControlMeasuresAddUpdateComponent;
    let fixture: ComponentFixture<FurtherControlMeasuresAddUpdateComponent>;
    let store: Store<fromRoot.State>;
    let submitEvent: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    let isValidEvent: EventEmitter<any> = new EventEmitter<any>();

    let dispatchSpy: jasmine.Spy;
    let configLoaded: jasmine.Spy;

    let breadCumServiceStub: any;
    let localeServiceStub: any;
    let translationServiceStub: any;
    let localizationConfigStub: any;
    let routerMock: any;
    let activatedRouteStub: any;
    let claimsHelperServiceStub: any
    let routeParamsStub: any;
    let _http: any;

    let localeService: any = new LocaleServiceStub();//= new LocaleService(<LocaleConfig>{ languageCode: 'en-GB' }, <LocaleStorage>{});
    let translationService: any = new TranslationServiceStub();  //new TranslationService(localeService, <TranslationConfig>{ translationData: {}, providers: [] }, <TranslationProviderStub>{}, <TranslationHandlerStub>{});
    let localizationConfig: any = new LocalizationConfigStub(); //new LocalizationConfig(localeService, translationService, injector);
    //let combineReducer: ActionReducer<State> = combineReducers(reducers);
    let changeDetectorRef: ChangeDetectorRef;
    let activatedRoute: ActivatedRoute;
    let router: any = new RouterMock();
    let fb: FormBuilder = new FormBuilder();
    let claimsHelper: any = new ClaimsHelperServiceStub();
    let breadcrumbService: any;
    let routeParams: any = new RouteParamsMock();
    let actions = new Subject<Action>();
    let states = new Subject<fromRoot.State>();
    let despatcher: Observer<Action> = new BehaviorSubject<any>('');

    let loadedSites: Immutable.List<AeSelectItem<string>> = null;
    let riskAssessmentHazard: TaskActivity = new TaskActivity();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                ReactiveFormsModule,
                AtlasElementsModule,
                RouterModule.forChild(routes),
                LocalizationModule,
                AtlasSharedModule,
                EmailSharedModule,
                NoopAnimationsModule,
                StoreModule.provideStore(reducer),
            ],
            declarations: [
                FurtherControlMeasuresAddUpdateComponent
                , AtlasElementsComponent
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
                , { provide: RestClientService, useClass: RestClientServiceStub }
                , { provide: RouteParams, useClass: RouteParamsMock }
                , { provide: Http, useValue: mockHttpProvider }
                , MockBackend
                , FormBuilderService
                , BaseRequestOptions
                , RiskAssessmentService
            ]
        })
            .overrideComponent(FurtherControlMeasuresAddUpdateComponent, { set: { host: { '(click)': 'dummy' } } })
            .compileComponents();

    }));
    describe('Further Control Measures Add Mode', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(FurtherControlMeasuresAddUpdateComponent);
            component = fixture.componentInstance;
            store = fixture.debugElement.injector.get(Store);

            let userList = MockStoreAddUpdateFurtherControls.getResponsiblePerson();
            let options = new ResponseOptions({ body: userList });
            let response = new Response(options);
            component.usersList = extractUserSelectOptionListData(response);

            let trainingList = MockStoreAddUpdateFurtherControls.getTrainingCoursesData();
            // let trainingoptions = new ResponseOptions({ body: trainingList });
            // let trainingresponse = new Response(trainingoptions);

            let filterTrainingList = trainingList.Entities.filter((item) => !item.IsAtlasTraining || (item.IsAtlasTraining && !item.IsCompleted));
            component.trainingCourses = Immutable.List(filterTrainingList);

            let raData = MockStoreAddUpdateFurtherControls.getSampleRAdata();
            component.raHazards = raData;

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

        });

        beforeEach(() => {
            component.action = AeDataActionTypes.Add;
            fixture.detectChanges();
            states = new Subject<fromRoot.State>();
            configLoaded = spyOn(localizationConfig, 'load');
            dispatchSpy = spyOn(store, 'dispatch');
        });

        describe('Further Control Measures Component launch', () => {
            beforeEach(() => {
                component.ngOnInit();
                fixture.detectChanges();
            });
            it('should create', () => {
                expect(component).toBeTruthy();

            });

            it('Checking the form fields', () => {
                component.raTaskForm.get('SubActionType').setValue('true');;
                fixture.detectChanges();

                let formFields = []; let formFieldsControls = [];
                component.formFields.map((keyValuePair) => {
                    formFields.push(keyValuePair.field.name);
                });
                for (let formFieldsData in component.raTaskForm.controls) {
                    formFieldsControls.push(formFieldsData);
                }
                expect(formFields.length).toEqual(formFieldsControls.length);
            });

            it('check the Title is mandatory and Responsible person,Due for completion fields are not mandatory', () => {
                let title = component.raTaskForm.get('Title');
                title.markAsDirty();
                let titleControlDebug = fixture.debugElement.query(By.css('#undefined_AeForm_1_AeInput_0'));
                let titleControl = titleControlDebug.nativeElement;
                let typeOfControl = titleControl instanceof HTMLInputElement;
                titleControlDebug.triggerEventHandler('change', { target: { value: null } });
                fixture.detectChanges();
                expect(title.errors.required).toBeTruthy();
                expect(typeOfControl).toBeTruthy();

                let dueDate = component.raTaskForm.get('DueDate');
                dueDate.markAsDirty();
                let dueDateControlDebug = fixture.debugElement.query(By.css('#undefined_AeForm_1_AeDateTimePicker_4_ae-input_3'));
                dueDateControlDebug.triggerEventHandler('change', { target: { value: null } });
                fixture.detectChanges();
                expect(dueDate.errors).toBeNull();

                let assignedUser = component.raTaskForm.get('AssignedUser');
                assignedUser.markAsDirty();
                let assignedUserDropDown = fixture.debugElement.query(By.css('#undefined_AeForm_1_AeSelect_3'));
                assignedUserDropDown.componentInstance.value = '46858a70-5e5e-4f93-9dc8-24a4faedaffd';
                assignedUserDropDown.componentInstance.onChange();
                fixture.detectChanges();
                assignedUserDropDown.componentInstance.value = '';
                assignedUserDropDown.componentInstance.onChange();
                fixture.detectChanges();
                expect(assignedUser.errors).toBeNull();
                //  component.raTaskForm.get('AssignedUser').setValue('');;
                let assignedUserControl = fixture.debugElement.query(By.css('#undefined_AeForm_1_AeSelect_3')).nativeElement;
                let selecttypeOfControl = assignedUserControl instanceof HTMLSelectElement;
                fixture.detectChanges();
                expect(selecttypeOfControl).toBeTruthy();
            });
            it('Submit form data and Emit it', () => {
                spyOn(component, 'onUpdateFormSubmit').and.callThrough();
                spyOn(component._addUpdateRATaskSubmit, 'emit');
                let assignedUserDropDown = fixture.debugElement.query(By.css('#undefined_AeForm_1_AeSelect_3'));
                assignedUserDropDown.componentInstance.value = '46858a70-5e5e-4f93-9dc8-24a4faedaffd';
                assignedUserDropDown.componentInstance.onChange();
                component.raTaskForm.get('Title').setValue('Adding Task');
                component.raTaskForm.get('DueDate').setValue(new Date());
                component.onUpdateFormSubmit();
                fixture.detectChanges();
                expect(component.onUpdateFormSubmit).toHaveBeenCalled();
                expect(component._addUpdateRATaskSubmit.emit).toHaveBeenCalled();
            });
        });
    });
    describe('Further Control Measures Update Mode', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(FurtherControlMeasuresAddUpdateComponent);
            component = fixture.componentInstance;
            store = fixture.debugElement.injector.get(Store);


            let userList = MockStoreAddUpdateFurtherControls.getResponsiblePerson();
            let options = new ResponseOptions({ body: userList });
            let response = new Response(options);
            component.usersList = extractUserSelectOptionListData(response);

            let trainingList = MockStoreAddUpdateFurtherControls.getTrainingCoursesData();
            let filterTrainingList = trainingList.Entities.filter((item) => !item.IsAtlasTraining || (item.IsAtlasTraining && !item.IsCompleted));
            component.trainingCourses = Immutable.List(filterTrainingList);

            let raData = MockStoreAddUpdateFurtherControls.getSampleRAdata();
            component.raHazards = raData;

            let selectedRAtask = MockStoreAddUpdateFurtherControls.futherControlMeasureData();
            component.selectedTask = selectedRAtask;

            component.action = AeDataActionTypes.Update;
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

        });
        beforeEach(() => {

            fixture.detectChanges();
            states = new Subject<fromRoot.State>();
            configLoaded = spyOn(localizationConfig, 'load');
            dispatchSpy = spyOn(store, 'dispatch');
        });
        describe('Further Control Measures Component launch', () => {
            beforeEach(() => {
                component.ngOnInit();
                fixture.detectChanges();
            });
            it('should create', () => {
                expect(component).toBeTruthy();
            });
            it('Checking mockup data with form data', () => {
                let selectedRAtask = MockStoreAddUpdateFurtherControls.futherControlMeasureData();
                let msMokeupData: TaskActivity = Object.assign({}, selectedRAtask, <TaskActivity>selectedRAtask);

                let formData = component.raTaskForm.value;

                let formDueDate = DateTimeHelper.getDatePart(component.raTaskForm.get('DueDate').value);
                let mockUpDueDate = DateTimeHelper.getDatePart(new Date(msMokeupData['DueDate']));
                expect(formDueDate).toEqual(mockUpDueDate);
            });
            it('Updating and Submit form data and Emit it', () => {
                spyOn(component, 'onUpdateFormSubmit').and.callThrough();
                spyOn(component._addUpdateRATaskSubmit, 'emit');
                component.raTaskForm.get('Title').setValue('Updating Task');
                component.onUpdateFormSubmit();
                fixture.detectChanges();
                expect(component.onUpdateFormSubmit).toHaveBeenCalled();
                expect(component._addUpdateRATaskSubmit.emit).toHaveBeenCalled();
            });

        });
    });
});