import { async, ComponentFixture, TestBed, tick, fakeAsync, ComponentFixtureNoNgZone } from "@angular/core/testing";
import { FurtherControlMeasuresComponent } from "./further-control-measures.component";
import { Store, StoreModule } from "@ngrx/store";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { AtlasElementsModule } from "../../../atlas-elements/atlas-elements.module";
import { AtlasSharedModule } from "../../../shared/atlas-shared.module";
import { RouterModule, Router, ActivatedRoute } from "@angular/router";
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from "angular-l10n";
import { CkEditorModule } from "../../../atlas-elements/ck-editor/ck-editor.module";
import { reducer } from "../../../shared/reducers";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BreadcrumbService } from "../../../atlas-elements/common/services/breadcrumb-service";
import { FormBuilderService } from "../../../shared/services/form-builder.service";
import { ClaimsHelperService } from "../../../shared/helpers/claims-helper";
import { RouteParams } from "../../../shared/services/route-params";
import { LocaleServiceStub } from "../../../shared/testing/mocks/locale-service-stub";
import { TranslationServiceStub } from "../../../shared/testing/mocks/translation-service-stub";
import { LocalizationConfigStub } from "../../../shared/testing/mocks/localization-config-stub";
import { LocalizationConfig } from "../../../shared/localization-config";
import { RiskAssessmentService } from "../../../risk-assessment/services/risk-assessment-service";
import { RouterMock } from "../../../shared/testing/mocks/router-stub";
import { RiskAssessmentsContainer } from "../../../risk-assessment/containers/risk-assessments/risk-assessments.component";
import { EmailSharedModule } from "../../../email-shared/email-shared.module";
import { DocumentSharedModule } from "../../../document/document-shared/document-shared.module";
import { RiskAssessmentHeaderComponent } from "../../../risk-assessment/components/risk-assessment-header/risk-assessment-header.component";
import { PreviewComponent } from "../../../risk-assessment/components/preview/preview.component";
import { RiskAssessmentListComponent } from "../../../risk-assessment/components/risk-assessment-list/risk-assessment-list.component";
import { AddEditComponent } from "../../../risk-assessment/components/add-edit/add-edit.component";
import { FurtherControlsComponent } from "../../../risk-assessment/components/further-controls/further-controls.component";
import { RiskAssessmentGeneralComponent } from "../../../risk-assessment/components/risk-assessment-general/risk-assessment-general.component";
import { RiskAssessmentProceduresComponent } from "../../../risk-assessment/components/risk-assessment-procedures/risk-assessment-procedures.component";
import { RiskAssessmentDetailComponent } from "../../../risk-assessment/components/risk-assessment-detail/risk-assessment-detail.component";
import { RiskAssessmentSupportingEvidenceComponent } from "../../../risk-assessment/components/risk-assessment-supporting-evidence/risk-assessment-supporting-evidence.component";
import { RiskAssessmentSupportingEvidenceAddDocumentComponent } from "../../../risk-assessment/components/risk-assessment-supporting-evidence-add-document/risk-assessment-supporting-evidence-add-document.component";
import { RoutesOfExposureComponent } from "../../../risk-assessment/components/routes-of-exposure/routes-of-exposure.component";
import { RoutesOfExposureAddUpdateComponent } from "../../../risk-assessment/components/routes-of-exposure-add-update/routes-of-exposure-add-update.component";
import { AssessComponent } from "../../../risk-assessment/components/assess/assess.component";
import { RiskAssessmentHazardComponent } from "../../../risk-assessment/components/risk-assessment-hazard/risk-assessment-hazard.component";
import { RiskChartComponent } from "../../../risk-assessment/components/risk-chart/risk-chart.component";
import { RiskAssessmentHazardAddUpdateComponent } from "../../../risk-assessment/components/risk-assessment-hazard-add-update/risk-assessment-hazard-add-update.component";
import { FurtherControlMeasuresAddUpdateComponent } from "../../../risk-assessment/components/further-control-measures-add-update/further-control-measures-add-update.component";
import { RiskAssessmentSubstanceListComponent } from "../../../risk-assessment/components/risk-assessment-substance-list/risk-assessment-substance-list.component";
import { RiskAssessmentAttachSubstanceComponent } from "../../../risk-assessment/components/risk-assessment-attach-substance/risk-assessment-attach-substance.component";
import { RiskAssessmentAddUpdateSubstanceComponent } from "../../../risk-assessment/components/risk-assessment-add-update-substance/risk-assessment-add-update-substance.component";
import { RiskAssessmentCreateHazardComponent } from "../../../risk-assessment/components/risk-assessment-create-hazard/risk-assessment-create-hazard.component";
import { RiskAssessmentCopyComponent } from "../../../risk-assessment/components/risk-assessment-copy/risk-assessment-copy.component";
import { CreateUpdateControlComponent } from "../../../risk-assessment/components/create-update-control/create-update-control.component";
import { ControlsComponent } from "../../../risk-assessment/components/controls/controls.component";
import { RiskAssessmentReviewComponent } from "../../../risk-assessment/components/risk-assessment-review/risk-assessment-review.component";
import { SelectedControlsComponent } from "../../../risk-assessment/components/selected-controls/selected-controls.component";
import { AllControlsComponent } from "../../../risk-assessment/components/all-controls/all-controls.component";
import { SuggestedControlsComponent } from "../../../risk-assessment/components/suggested-controls/suggested-controls.component";
import { ActivatedRouteStub } from "../../../shared/testing/mocks/activated-route-stub";
import { dispatch } from "d3";
import { LoadTaskCategoriesComplete } from "../../../task/actions/task.list.actions";
import { FurtherControlMeasuresMockStoreProvider } from "../../../shared/testing/mocks/mock-store-RA-FCM-provider-factory";
import { extractTaskCategories } from "../../../task/common/task-extract-helper";
import { LoadRiskAssessmentCompleteAction, LoadRiskAssessmentTasksCompleteAction, LoadRiskAssessmentTaskByIdAction, LoadRiskAssessmentTaskByIdCompleteAction, LoadRiskAssessmentTasksAction, RemoveRiskAssessmentTaskAction } from "../../../risk-assessment/actions/risk-assessment-actions";
import { TrainingCourseLoadCompleteAction } from "../../../shared/actions/training-course.actions";
import { extractTrainingCourseList, extractUserSelectOptionListData } from "../../../shared/helpers/extract-helpers";
import { AtlasApiResponse } from "../../../shared/models/atlas-api-response";
import { TrainingCourse } from "../../../shared/models/training-course.models";
import { UserLoadCompleteAction } from "../../../shared/actions/lookup.actions";
import { By } from "@angular/platform-browser";
import { AeDatatableComponent } from "../../../atlas-elements/ae-datatable/ae-datatable.component";
import { DatePipe } from "@angular/common";
import { AeNavActionsComponent } from "../../../atlas-elements/ae-nav-actions/ae-nav-actions.component";
import { CommonTestHelper } from "../../../shared/testing/helpers/common-test-helper";
import { EventListener } from '@angular/core/src/debug/debug_node';
import { AeSlideOutComponent } from "../../../atlas-elements/ae-slideout/ae-slideout.component";
import { AeButtonComponent } from "../../../atlas-elements/ae-button/ae-button.component";
import { AeAnchorComponent } from "../../../atlas-elements/ae-anchor/ae-anchor.component";
import { AeModalDialogComponent } from "../../../atlas-elements/ae-modal-dialog/ae-modal-dialog.component";
import { Component } from "@angular/core/src/metadata/directives";
import { TaskActivity, User } from "../../../task/models/task-activity";
import { MockStoreAddUpdateFurtherControls } from "../../../shared/testing/mocks/mock-store-addupdate-further-control";
import { AeDataActionTypes } from "../../../employee/models/action-types.enum";

describe('further-control-measures component', () => {
    let component: FurtherControlMeasuresComponent;
    let fixture: ComponentFixture<FurtherControlMeasuresComponent>;
    let store: any;
    let routerStub: any;
    let dispatchSpy: jasmine.Spy;
    let extractedTaskcategories: any;
    let breadCumServiceStub: any;
    let localeServiceStub: any;
    let translationServiceStub: any;
    let localizationConfigStub: any;
    let routerMock: any;
    let activatedRouteStub: any;
    let claimsHelperServiceStub: any;
    let routeParamsStub: any;
    let datePipe: DatePipe;
    let RAFurtherControlMeasuresTasks: any;
    let riskAssessmentsServiceStub: any;

    beforeEach(async(() => {
        routerStub = new RouterMock();
        TestBed.configureTestingModule({
            imports: [CommonModule
                , ReactiveFormsModule
                , AtlasElementsModule
                , AtlasSharedModule
                , RouterModule.forChild([])
                , LocalizationModule
                , CkEditorModule
                , StoreModule.provideStore(reducer)
                , BrowserAnimationsModule
                , EmailSharedModule
                , DocumentSharedModule],
            declarations: [RiskAssessmentsContainer, RiskAssessmentsContainer
                , PreviewComponent
                , RiskAssessmentHeaderComponent
                , RiskAssessmentListComponent
                , AddEditComponent
                , RiskAssessmentGeneralComponent
                , FurtherControlsComponent
                , RiskAssessmentProceduresComponent
                , RiskAssessmentDetailComponent
                , RiskAssessmentSupportingEvidenceComponent
                , RiskAssessmentSupportingEvidenceAddDocumentComponent
                , RoutesOfExposureComponent
                , RoutesOfExposureAddUpdateComponent
                , AssessComponent
                , RiskAssessmentHazardComponent
                , RiskChartComponent
                , RiskAssessmentHazardAddUpdateComponent
                , FurtherControlMeasuresComponent
                , FurtherControlMeasuresAddUpdateComponent
                , RiskAssessmentSubstanceListComponent
                , RiskAssessmentAttachSubstanceComponent
                , RiskAssessmentAddUpdateSubstanceComponent
                , RiskAssessmentCreateHazardComponent
                , RiskAssessmentCopyComponent
                , CreateUpdateControlComponent
                , ControlsComponent
                , RiskAssessmentReviewComponent
                , SelectedControlsComponent
                , AllControlsComponent
                , SuggestedControlsComponent],
            providers: [
                InjectorRef
                , DatePipe
                , BreadcrumbService
                , FormBuilderService
                , ClaimsHelperService
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: Router, useValue: routerStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
                , { provide: RiskAssessmentService, useValue: jasmine.createSpyObj('riskAssessmentsServiceStub', ['getRiskAssesments', '_loadUsersList', '_loadRiskAssessmentTasks', '_loadSelectedRATask', '_removeRATask', '_updateRATask', '_createRATask']) }
                , { provide: RouteParams, useValue: jasmine.createSpyObj('routeParamsMock', ['']) }
            ]
        }).overrideComponent(FurtherControlMeasuresComponent, { set: { host: { "(click)": "dummy" } } })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FurtherControlMeasuresComponent);
        component = fixture.componentInstance;
        component.name = "furtherControlMeasures";
        component.id = "furtherControlMeasures";
        breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
        localeServiceStub = fixture.debugElement.injector.get(LocaleService);
        translationServiceStub = fixture.debugElement.injector.get(TranslationService);
        localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
        routerMock = fixture.debugElement.injector.get(Router);
        activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
        claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
        riskAssessmentsServiceStub = fixture.debugElement.injector.get(RiskAssessmentService);
        routeParamsStub = fixture.debugElement.injector.get(RouteParams);
        store = fixture.debugElement.injector.get(Store);
        datePipe = fixture.debugElement.injector.get(DatePipe);
        dispatchSpy = spyOn(store, 'dispatch');
        dispatchSpy.and.callThrough();
        let TaskCategories = FurtherControlMeasuresMockStoreProvider.getTaskCategories();
        extractedTaskcategories = extractTaskCategories(FurtherControlMeasuresMockStoreProvider.getResponse(TaskCategories));
        let currentRiskAssessment = FurtherControlMeasuresMockStoreProvider.getCurrentRiskAssessment();
        let TrainingCoursesList = FurtherControlMeasuresMockStoreProvider.getTrainingCourseList();
        RAFurtherControlMeasuresTasks = FurtherControlMeasuresMockStoreProvider.getRAFurtherControlMeasuresTasks();
        let extratedTrainingCourseList = extractTrainingCourseList(<AtlasApiResponse<TrainingCourse>>TrainingCoursesList);
        let usersList = FurtherControlMeasuresMockStoreProvider.getUsersList();
        let extractedusersList = extractUserSelectOptionListData(FurtherControlMeasuresMockStoreProvider.getResponse(usersList));
        let RATaskApiParams = FurtherControlMeasuresMockStoreProvider.getRAtaskAPIParams();
        store.dispatch(new LoadRiskAssessmentCompleteAction(currentRiskAssessment));
        store.dispatch(new LoadTaskCategoriesComplete(extractedTaskcategories));
        store.dispatch(new TrainingCourseLoadCompleteAction(extratedTrainingCourseList));
        store.dispatch(new LoadRiskAssessmentTasksAction(RATaskApiParams));
        store.dispatch(new UserLoadCompleteAction(extractedusersList));
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
        fixture.detectChanges();
    });

    it('component launch', () => {
        expect(component).toBeTruthy();
    });

    it('should have Add Task button to add new task', () => {
        let addTaskbutton = fixture.debugElement.query(By.css('#furtherControlMeasures_AeButton_1_aeButton_1')).nativeElement;
        expect(addTaskbutton.innerText).toEqual('ADD_TASK');
    });

    it('should display information text regarding further control measures tasks', () => {
        let helptext = fixture.debugElement.query(By.css('#furtherControlMeasures_AeNotification_1_spanNotify_1')).nativeElement;
        expect(helptext.innerText).toEqual('RA_HELP_TEXT.FURTHER_CONTROL_MEASURES');
    });

    it('loading component without any data', fakeAsync(() => {
        let response = JSON.parse('{"Entities":[],"PagingInfo":{"PageNumber":1,"Count":10,"TotalCount":0},"OtherInfo":null}');
        store.dispatch(new LoadRiskAssessmentTasksCompleteAction(response));
        tick(60);
        fixture.detectChanges();
        let gridData = fixture.debugElement.query(By.css('.no--data')).nativeElement;
        expect(gridData.innerText).toEqual('There is no data to display');
    }));

    it('should open Add task slide out when clicked on Add task button', () => {
        let addTaskbutton = fixture.debugElement.query(By.css('#furtherControlMeasures_AeButton_1_aeButton_1')).nativeElement;
        addTaskbutton.click();
        fixture.detectChanges();
        let addTaskSlide = fixture.debugElement.query(By.directive(AeSlideOutComponent)).componentInstance;
        expect(addTaskSlide).toBeTruthy();
        expect(component.actionType).toEqual(AeDataActionTypes.Add);
    });

    it('should dispatch an action to save deatils of newly added task', () => {
        let addTaskbutton = fixture.debugElement.query(By.css('#furtherControlMeasures_AeButton_1_aeButton_1')).nativeElement;
        addTaskbutton.click();
        fixture.detectChanges();
        let taskDetails = FurtherControlMeasuresMockStoreProvider.getSelectedRATask() as any;
        taskDetails.DueDate = new Date(taskDetails.DueDate);
        taskDetails.AssignedUser = '46858a70-5e5e-4f93-9dc8-24a4faedaffd';
        component.saveRATask(taskDetails);
        fixture.detectChanges();
        expect(riskAssessmentsServiceStub._createRATask).toHaveBeenCalled();
    });

    describe('verify further control measures tasks data grid with some tasks details', () => {
        beforeEach(() => {
            store.dispatch(new LoadRiskAssessmentTasksCompleteAction(RAFurtherControlMeasuresTasks));
            fixture.detectChanges();
        });

        it('should have data grid', () => {
            let dataGrid = fixture.debugElement.query(By.directive(AeDatatableComponent));
            expect(dataGrid).toBeTruthy();
            let firstRow = fixture.debugElement.query(By.css('ae-datatable'))
                .query(By.css('.table__row--group'))
                .queryAll(By.css('.table__row'))[0];
            let firstCell: HTMLElement = firstRow.queryAll(By.css('.table__item'))[0].nativeElement;
            let secondCell: HTMLElement = firstRow.queryAll(By.css('.table__item'))[1].nativeElement;
            let thirdCell: HTMLElement = firstRow.queryAll(By.css('.table__item'))[2].nativeElement;
            expect(firstCell.innerText.trim()).toBe(RAFurtherControlMeasuresTasks.Entities[0].Title);
            expect(secondCell.innerText.trim()).toBe(datePipe.transform(RAFurtherControlMeasuresTasks.Entities[0].DueDate, 'dd/MM/yyyy'));
            expect(thirdCell.innerText.trim()).toBe('');
        });

        it('should have four columns Task name,Deadline,Hazrard and Actions', () => {
            let columns = fixture.debugElement.queryAll(By.css('.table__heading'));
            expect(columns.length).toEqual(4);

            expect(columns[0].nativeElement.innerText.trim()).toEqual('TASK_NAME');
            expect(columns[0].nativeElement.classList).toContain('table__heading--sortable');
            expect(columns[0].childNodes[1].nativeNode.attributes.getNamedItem('data-sortKey').value).toEqual('Title');

            expect(columns[1].nativeElement.innerText.trim()).toEqual('DEADLINE');
            expect(columns[1].nativeElement.classList).toContain('table__heading--sortable');
            expect(columns[1].childNodes[1].nativeNode.attributes.getNamedItem('data-sortKey').value).toEqual('DueDate');

            expect(columns[2].nativeElement.innerText.trim()).toEqual('HAZARD');
            expect(columns[2].nativeElement.classList).not.toContain('table__heading--sortable');

            expect(columns[3].nativeElement.innerText.trim()).toEqual('Actions');
            expect(columns[3].nativeElement.classList).not.toContain('table__heading--sortable');
        });

        it('should have two action items UPDATE and REMOVE', () => {
            let rows = fixture.debugElement.queryAll(By.css('.table__row'));
            let actionButtonitems = rows[0].query(By.css('.nav--actions')).componentInstance;
            expect(actionButtonitems instanceof AeNavActionsComponent).toBeTruthy();
            let actionButton = rows[0].query(By.css('.nav--actions')).componentInstance;
            let event = new MouseEvent('click');
            actionButton._onClick(event);           
            fixture.detectChanges();
            let actions = rows[0].queryAll(By.css('li'));
            expect(actions.length).toEqual(2);
            let FCMComponent = component;
            expect(CommonTestHelper.hasGivenButton(FCMComponent.tableActions.toArray(), 'Update')).toBeTruthy();
            expect(CommonTestHelper.hasGivenButton(FCMComponent.tableActions.toArray(), 'Remove')).toBeTruthy();
        });

        it('should have page change and sort options', (() => {
            let listeners = <EventListener[]>fixture.debugElement.query(By.css('ae-datatable')).listeners;
            let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
            let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
            expect(sortEvent).toBeDefined();
            expect(pageChangeEvent).toBeDefined();
        }));

        describe('verify update action', () => {
            beforeEach(fakeAsync(() => {
                component.updateActionCommand.next(RAFurtherControlMeasuresTasks.Entities[0]);
                let navButtons = <AeNavActionsComponent<any>>fixture.debugElement.query(By.directive(AeNavActionsComponent)).componentInstance;
                let event = new MouseEvent('click');
                navButtons._onClick(event);
                tick(100);
                fixture.detectChanges();
            }));

            it('should open update task slide out when clicked on Update action', () => {
                let updateButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#Update');
                updateButton.click();
                let selectedTask = FurtherControlMeasuresMockStoreProvider.getSelectedRATask();
                store.dispatch(new LoadRiskAssessmentTaskByIdCompleteAction(selectedTask));
                fixture.detectChanges();
                expect(component.updateFlag).toBeTruthy();
                let updateSlide = fixture.debugElement.query(By.directive(AeSlideOutComponent)).componentInstance;
                expect(updateSlide).toBeTruthy();
                expect(component.actionType).toEqual(AeDataActionTypes.Update);
            });

            it('when updated a task it should dispatch an action to save details', () => {
                let updateButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#Update');
                updateButton.click();
                let selectedTask = FurtherControlMeasuresMockStoreProvider.getSelectedRATask() as any;
                selectedTask.DueDate = new Date(selectedTask.DueDate);
                selectedTask.AssignedUser = '46858a70-5e5e-4f93-9dc8-24a4faedaffd';
                store.dispatch(new LoadRiskAssessmentTaskByIdCompleteAction(MockStoreAddUpdateFurtherControls.futherControlMeasureData()));
                fixture.detectChanges();
                component.saveRATask(selectedTask);
                fixture.detectChanges();
                expect(riskAssessmentsServiceStub._updateRATask).toHaveBeenCalled();
            });
        });

        describe('verify remove task/assignment popup', () => {
            beforeEach(fakeAsync(() => {
                component.removeActionCommand.next(RAFurtherControlMeasuresTasks.Entities[0]);
                let navButtons = <AeNavActionsComponent<any>>fixture.debugElement.query(By.directive(AeNavActionsComponent)).componentInstance;
                let event = new MouseEvent('click');
                navButtons._onClick(event);
                tick(100);
                fixture.detectChanges();
            }));

            it('should open remove confirmation popup when clicked on Remove action button', () => {
                let removeButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#Remove');
                removeButton.click();
                fixture.detectChanges();
                let confirmPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
                expect(confirmPopup).toBeTruthy();
            });

            it('verify popup data', () => {
                let removeButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#Remove');
                removeButton.click();
                fixture.detectChanges();
                let header = fixture.debugElement.query(By.css('.modal-dialog-header')).nativeElement;
                expect(header.innerText).toContain('TASK_REMOVE_DIALOG.HEADER_TEXT');
                let body = fixture.debugElement.query(By.css('.modal-dialog-body')).nativeElement;
                expect(body).toBeDefined();
                let cancelButton = fixture.debugElement.query(By.css('#furtherControlMeasures_AeButton_1_aeButton_1')).nativeElement;
                let confirmationButton = fixture.debugElement.query(By.css('#furtherControlMeasures_AeButton_2_aeButton_1')).nativeElement;
                expect(cancelButton).toBeDefined();
                expect(confirmationButton).toBeDefined();
            });

            it('should close popup on clicking `No,Keep task` button', () => {
                let removeButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#Remove');
                removeButton.click();
                fixture.detectChanges();
                spyOn(component, 'removeConfirmModalClosed').and.callThrough();
                let confirmPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent));
                let buttons = confirmPopup.queryAll(By.directive(AeButtonComponent));
                let cancelButton = <AeButtonComponent>buttons[0].componentInstance;
                cancelButton.aeClick.emit('No');
                fixture.detectChanges();
                expect(component.removeConfirmModalClosed).toHaveBeenCalled();
                expect(component.removeConfirmation).toBeFalsy();
            });

            it('should close popup and remove selected record on clicking `Yes,Remove task` button', () => {
                spyOn(component, 'removeRATask').and.callThrough();
                let confirmPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent));
                let buttons = confirmPopup.queryAll(By.directive(AeButtonComponent));
                let confirmButton = <AeButtonComponent>buttons[1].componentInstance;
                confirmButton.aeClick.emit('Yes');
                fixture.detectChanges();
                expect(component.removeRATask).toHaveBeenCalled();
                expect(component.removeConfirmation).toBeFalsy();
                expect(riskAssessmentsServiceStub._removeRATask).toHaveBeenCalled();
            });
        });
    });
});