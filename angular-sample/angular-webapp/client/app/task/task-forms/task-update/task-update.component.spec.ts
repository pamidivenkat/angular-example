import { async, TestBed, ComponentFixture, fakeAsync, tick } from "@angular/core/testing";
import { TaskUpdateComponent } from "../task-update/task-update.component";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { routes } from "../../task.routes";
import { StoreModule, Store } from "@ngrx/store";
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from "angular-l10n";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ReactiveFormsModule, FormGroup } from "@angular/forms";
import { AtlasElementsModule } from "../../../atlas-elements/atlas-elements.module";
import { TaskFormsModule } from "../../task-forms/task-forms.module";
import { AtlasSharedModule } from "../../../shared/atlas-shared.module";
import { LocalizationConfig } from "../../../shared/localization-config";
import { BreadcrumbService } from "../../../atlas-elements/common/services/breadcrumb-service";
import { LocaleServiceStub } from "../../../shared/testing/mocks/locale-service-stub";
import { ClaimsHelperService } from "../../../shared/helpers/claims-helper";
import { BreadcrumbServiceStub } from "../../../shared/testing/mocks/breadcrumb-service-mock";
import { TranslationServiceStub } from "../../../shared/testing/mocks/translation-service-stub";
import { ClaimsHelperServiceStub } from "../../../shared/testing/mocks/claims-helper-service-mock";
import { CurrencyPipe } from "@angular/common";
import { FormBuilderService } from "../../../shared/services/form-builder.service";
import { TaskService } from "../../../task/services/task-service";
import { TaskListComponent } from "../../../task/task-list/task-list.component";
import { TaskInformationBarComponent } from "../../../task/task-information-bar/task-information-bar.component";
import { TaskDetailsComponent } from "../../../task/task-forms/task-details/task-details.component";
import { TaskAddComponent } from "../../../task/task-forms/task-add/task-add.component";
import { By } from "@angular/platform-browser";
import { TaskMocStoreProviderFactory } from "../../../shared/testing/mocks/task-moc-store-provider-factory";
import { LoadSelectedTaskCompleteAction, LoadTaskCategoriesComplete } from "../../../task/actions/task.list.actions";
import { reducer } from "../../../shared/reducers";
import { extractTaskCategories } from "../../../task/common/task-extract-helper";
import { TasksView } from "../../../task/models/task";
import { TaskStatus } from "../../../task/models/task-status";
import { DebugElement } from "@angular/core";

let setFieldValue = function (form: FormGroup, fieldName: string, value: string) {
    if (form.get(fieldName)) {
        form.get(fieldName).setValue(value);
    }
}
let getFieldValue = function (form: FormGroup, fieldName: string) {
    if (form.get(fieldName)) {
        return form.get(fieldName).value;
    }
    return null;
}

let validationAssertFun = function (fixture: ComponentFixture<TaskUpdateComponent>, index: number, message: string) {
    let formInputFields: DebugElement[] = fixture.debugElement.queryAll(By.css('.information-grid__item'));
    let validationMsgField = formInputFields[index].query(By.css('.form__input__error'));
    expect(validationMsgField.nativeElement.innerText).toBe(message);
}

describe('task update component', () => {
    let component: TaskUpdateComponent;
    let fixture: ComponentFixture<TaskUpdateComponent>;
    let store: any;
    let selectedTask: TasksView
    let claimsHelperServiceStub: any;
    let claimsgetUserIdSpy: any;
    let claimsgetUserFullNameSpy: any;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule
                , AtlasElementsModule
                , TaskFormsModule
                , ReactiveFormsModule
                , RouterModule.forChild(routes)
                , LocalizationModule
                , AtlasSharedModule
                , StoreModule.provideStore(reducer)
                , BrowserAnimationsModule
            ],
            declarations: [
                TaskListComponent
                , TaskInformationBarComponent
            ],
            providers: [
                InjectorRef
                , CurrencyPipe
                , FormBuilderService
                , TaskService
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , LocalizationConfig
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
            ]
        })
            .overrideComponent(TaskUpdateComponent, { set: { host: { "(click)": "dummy" } } })
            .compileComponents();
    }))

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskUpdateComponent);
        component = fixture.componentInstance;
        component.id = "taskUpdate";
        component.name = "taskUpdate";
        store = fixture.debugElement.injector.get(Store);
        claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
        let taskCategories = TaskMocStoreProviderFactory.getTaskCategories();
        const categoryAction = new LoadTaskCategoriesComplete(extractTaskCategories(taskCategories));
        store.dispatch(categoryAction);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('update title should be displayed', fakeAsync(() => {
        let updateTitleNode = fixture.debugElement.query(By.css('.so-panel__title')).nativeElement;
        let updateTitle = updateTitleNode.textContent.trim();
        tick();
        expect(updateTitle).toContain('ADD_TASK_FORM.UPDATE_TASK');
    }));

    it('close button should be defined', fakeAsync(() => {
        let closeButtonNode = fixture.nativeElement.querySelector('#taskUpdate_label_1');
        tick();
        expect(closeButtonNode === null).toBe(false);
    }));

    it('close button title should be correct', fakeAsync(() => {
        let closeButton = fixture.debugElement.query(By.css('#taskUpdate_label_1')).nativeElement;
        let labelTitle = closeButton.textContent.trim();
        tick();
        expect(labelTitle).toEqual('BUTTONS.SLIDE_CLOSE');
    }));

    it('update button should be defined', fakeAsync(() => {
        let updateButtonNode = fixture.nativeElement.querySelector('#taskUpdate_AeAnchor_1');
        tick();
        expect(updateButtonNode === null).toBe(false);
    }));

    it('update button title should be correct', fakeAsync(() => {
        let updateButtonNode = fixture.nativeElement.querySelector('#taskUpdate_AeAnchor_1');
        let updateButtonTitle = updateButtonNode.textContent.trim();
        tick();
        expect(updateButtonTitle).toEqual('BUTTONS.UPDATE');
    }));

    describe('update task details', () => {
        beforeEach(() => {
            let selectedTask = TaskMocStoreProviderFactory.getTaskDetails();
            const selectedAction = new LoadSelectedTaskCompleteAction(selectedTask);
            store.dispatch(selectedAction);
            fixture.detectChanges();
        });

        it('site visit category should set to false', fakeAsync(() => {
            tick();
            expect(component.siteVisitCategory).toBe(false);
        }));

        it('title label should be displayed', fakeAsync(() => {
            let taskTitleNode = fixture.nativeElement.querySelector('#taskTitle');
            let taskTitleText = taskTitleNode.textContent.trim();
            tick();
            expect(taskTitleText).toContain('ADD_TASK_FORM.TITLE');
        }));

        it('description label should be displayed', fakeAsync(() => {
            let taskDescriptionNode = fixture.nativeElement.querySelector('#taskDescription');
            let taskDescriptionTitle = taskDescriptionNode.textContent.trim();
            tick();
            expect(taskDescriptionTitle).toContain('ADD_TASK_FORM.DESCRIPTION');
        }));

        it('cost of rectification should not be visible', fakeAsync(() => {
            let costOfRectificationInput = fixture.nativeElement.querySelector('#CostOfRectification');
            tick();
            expect(costOfRectificationInput === null).toBe(true);
        }));

        it('percentage of completed should not be visible', fakeAsync(() => {
            let percentageCompletedInput = fixture.nativeElement.querySelector('#PercentageCompleted');
            tick();
            expect(percentageCompletedInput === null).toBe(true);
        }));

        it('check all the fields data displayed correctly', fakeAsync(() => {
            selectedTask = component.task;
            tick(200);
            let categoryId = getFieldValue(component.updateTaskForm, 'TaskCategoryId');
            let title = getFieldValue(component.updateTaskForm, 'Title');
            let description = getFieldValue(component.updateTaskForm, 'Description');
            let priority = getFieldValue(component.updateTaskForm, 'Priority');
            let dueDate = getFieldValue(component.updateTaskForm, 'DueDate');
            let selectedDate = new Date(selectedTask.DueDate);
            let dueDateFormat = dueDate.toLocaleDateString();
            let selectedDateFormat = selectedDate.toLocaleDateString();
            let assignedUsers = getFieldValue(component.updateTaskForm, 'AssignedUsers');
            let sendNotification = getFieldValue(component.updateTaskForm, 'SendNotification');
            let costOfRectification = getFieldValue(component.updateTaskForm, 'CostOfRectification');
            let percentageCompleted = getFieldValue(component.updateTaskForm, 'PercentageCompleted');
            let correctActionTaken = getFieldValue(component.updateTaskForm, 'CorrectActionTaken');
            let status = getFieldValue(component.updateTaskForm, 'Status');
            let assignToAll = getFieldValue(component.updateTaskForm, 'AssignToAll');

            expect(selectedTask.TaskCategoryId).toEqual(categoryId);
            expect(selectedTask.Title).toEqual(title);
            expect(selectedTask.Description).toContain(description);
            expect(selectedTask.Priority).toEqual(Number(priority));
            expect(selectedDateFormat).toContain(dueDateFormat);
            expect(selectedTask.AssignedUsersList).toEqual(assignedUsers);
            expect(component.sendEmailNotification).toEqual(sendNotification);
            expect(selectedTask.CostOfRectification).toEqual(costOfRectification);
            expect(selectedTask.PercentageCompleted).toEqual(percentageCompleted);
            expect(selectedTask.CorrectiveActionTaken).toEqual(correctActionTaken);
            expect(selectedTask.Status).toEqual(Number(status));
            expect(component.assignToAll).toEqual(assignToAll);
        }));

        it('assigned all should be checked', fakeAsync(() => {
            setFieldValue(component.updateTaskForm, 'AssignToAll', 'true');
            component.onChangeAllCheckbox(new Event('changed'));
            fixture.detectChanges();
            expect(getFieldValue(component.updateTaskForm, 'AssignToAll')).toBeTruthy();
            expect(getFieldValue(component.updateTaskForm, 'AssignedUsers')).toBeDefined();
            expect(getFieldValue(component.updateTaskForm, 'AssignedUsers').length).toEqual(0);
        }));

        it('assigned to me should select logged in user', fakeAsync(() => {
            let checkBoxElementNode = fixture.debugElement.query(By.css('#_assignToMe')).nativeElement;
            checkBoxElementNode.click();
            fixture.detectChanges();
            fixture.debugElement.triggerEventHandler('click', null);
            tick(200);
            let assingedUsers = getFieldValue(component.updateTaskForm, 'AssignedUsers');
            expect(assingedUsers[0].Id).toEqual(claimsHelperServiceStub.getUserId());
            expect(assingedUsers[0].FullName).toEqual(claimsHelperServiceStub.getUserFullName());
        }));

        it('update submit should be called', fakeAsync(() => {
            spyOn(component, 'onUpdateFormSubmit');
            let updateButtonNode = fixture.nativeElement.querySelector('#taskUpdate_AeAnchor_1');
            updateButtonNode.click();
            fixture.detectChanges();
            tick();
            expect(component.onUpdateFormSubmit).toHaveBeenCalled();
        }));
    });

    describe('update sitevisit task details', () => {
        beforeEach(() => {
            let selectedTask = TaskMocStoreProviderFactory.getSitevisitTaskDetails();
            const selectedAction = new LoadSelectedTaskCompleteAction(selectedTask);
            store.dispatch(selectedAction);
            fixture.detectChanges();
        });

        it('site visit category should set to true', fakeAsync(() => {
            tick();
            expect(component.siteVisitCategory).toBe(true);
        }));

        it('observation label should be displayed', fakeAsync(() => {
            let taskObservationNode = fixture.nativeElement.querySelector('#taskObservation');
            let taskObservationTitle = taskObservationNode.textContent.trim();
            tick();
            expect(taskObservationTitle).toContain('ADD_TASK_FORM.OBSERVATION');
        }));

        it('Recommendation label should be displayed', fakeAsync(() => {
            let taskRecommendationNode = fixture.nativeElement.querySelector('#taskRecommendation');
            let taskRecommendationTitle = taskRecommendationNode.textContent.trim();
            tick();
            expect(taskRecommendationTitle).toContain('ADD_TASK_FORM.RECOMMENDATION');
        }));

        it('cost of rectification should be visible', fakeAsync(() => {
            let costOfRectificationInput = fixture.nativeElement.querySelector('#CostOfRectification');
            tick();
            expect(costOfRectificationInput === null).toBe(false);
        }));

        it('percentage of completed should be visible', fakeAsync(() => {
            let percentageCompletedInput = fixture.nativeElement.querySelector('#PercentageCompleted');
            tick();
            expect(percentageCompletedInput === null).toBe(false);
        }));

        it('task status should be completed when percentage 100', fakeAsync(() => {
            setFieldValue(component.updateTaskForm, 'PercentageCompleted', '100');
            fixture.detectChanges();
            tick();
            let taskStatus = getFieldValue(component.updateTaskForm, 'Status');
            let taskStatusValue = Number(taskStatus);
            expect(taskStatusValue).toEqual(2);
        }));

        it('error message should be displayed task status is not completed when percentage 100', fakeAsync(() => {
            setFieldValue(component.updateTaskForm, 'PercentageCompleted', '100');
            let taskStatus = TaskStatus.ToDo.toString();
            setFieldValue(component.updateTaskForm, 'Status', taskStatus);
            fixture.detectChanges();
            tick();
            validationAssertFun(fixture, 6, 'VALIDATION_ERRORS.SITEVISIT_STATUS_MESSAGE');
        }));

        it('percentage should be 100 when task status completed', fakeAsync(() => {
            let taskStatus = TaskStatus.Complete.toString();
            setFieldValue(component.updateTaskForm, 'Status', taskStatus);
            fixture.detectChanges();
            tick();
            let percentageCompleted = getFieldValue(component.updateTaskForm, 'PercentageCompleted');
            expect(percentageCompleted).toEqual(100);
        }));
    })
})