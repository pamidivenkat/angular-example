import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';

import { AtlasElementsModule } from '../../../atlas-elements/atlas-elements.module';
import { AeSelectEvent } from '../../../atlas-elements/common/ae-select.event';
import { AtlasSharedModule } from '../../../shared/atlas-shared.module';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { DateTimeHelper } from '../../../shared/helpers/datetime-helper';
import { LocalizationConfig } from '../../../shared/localization-config';
import * as fromRoot from '../../../shared/reducers';
import { reducer } from '../../../shared/reducers/index';
import { FormBuilderService } from '../../../shared/services/form-builder.service';
import { ClaimsHelperServiceStub } from '../../../shared/testing/mocks/claims-helper-service-mock';
import { LocaleServiceStub } from '../../../shared/testing/mocks/locale-service-stub';
import { MockStoreProviderFactory } from '../../../shared/testing/mocks/mock-store-provider-factory';
import { TaskMocStoreProviderFactory } from '../../../shared/testing/mocks/task-moc-store-provider-factory';
import { TranslationServiceStub } from '../../../shared/testing/mocks/translation-service-stub';
import { LoadAssignUserComplete, LoadAssignUsers } from '../../actions/task-add.actions';
import { LoadTaskCategories, LoadTaskCategoriesComplete } from '../../actions/task.list.actions';
import { extractAssignUsers } from '../../common/task-extract-helper';
import { User } from '../../models/task-activity';
import { TaskCategory } from '../../models/task-categoy';
import { TaskCategoryService } from '../../services/task-category.service';
import { TaskService } from '../../services/task-service';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbServiceStub } from './../../../shared/testing/mocks/breadcrumb-service-mock';
import { TaskAddComponent } from './task-add.component';

let findField = function (debugElement: DebugElement, identifier: string): DebugElement {
    return debugElement.query(By.css(identifier));
}

let findFields = function (debugElement: DebugElement, identifier: string): DebugElement[] {
    return debugElement.queryAll(By.css(identifier));
}

let fieldAssertFun = function (field: DebugElement, label: DebugElement, labelText: string, isRequired: boolean = false) {
    expect(field).toBeDefined();
    expect(label).toBeDefined();
    expect(label.nativeElement.innerText.trim()).toBe(labelText);
    if (isRequired) {
        expect(labelText).toContain('*');
    }
};

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

let validationAssertFun = function (fixture: ComponentFixture<TaskAddComponent>, index: number, message: string, status: boolean = true) {
    let formInputFields: DebugElement[] = findFields(fixture.debugElement, '.form__input');
    let validationMsgField = findField(formInputFields[index], '.form__input__error');
    if (status) {
        expect(validationMsgField.nativeElement.innerText).toBe(message);
    } else {
        expect(validationMsgField).toBeNull();
    }
}

let otherCategoryFieldsAssertFun = function (fixture: ComponentFixture<TaskAddComponent>) {
    let formInputFields: DebugElement[] = findFields(fixture.debugElement, '.form__input');
    //Category fields
    let categoryField = findField(fixture.debugElement, '#TaskCategoryId');
    let categoryFieldLabel: DebugElement = findField(formInputFields[0], 'label');
    //Title fields
    let titleField = findField(fixture.debugElement, '#Title');
    let titleFieldLabel: DebugElement = findField(formInputFields[1], 'label');
    //Description fields
    let descriptionField = findField(fixture.debugElement, '#Description');
    let descriptionLabelField: DebugElement = findField(formInputFields[2], 'label');
    //Priority fields
    let priorityField = findField(fixture.debugElement, '#taskPriority');
    let priorityLabelField: DebugElement = findField(formInputFields[3], 'label');
    //Deadline Date fields
    let deadLineDateField = findField(fixture.debugElement, '#DueDate');
    let deadLineDateLabelField: DebugElement = findField(formInputFields[4], 'label');
    //Assigned To fields
    let assignToField = findField(fixture.debugElement, '#taskAssignedUsers');
    let assignToLabelField: DebugElement = findField(formInputFields[5], 'label');
    //Assign To Me fields
    let assignToMeField = findField(fixture.debugElement, '#_assignToMe');
    let assignToMeLabelField: DebugElement = findField(formInputFields[6], 'a');
    //Assign To All fields
    let assignToAllField = findField(fixture.debugElement, '#AssignToAll');
    let assignToAllLabelField: DebugElement = findField(formInputFields[6], 'label');

    //Category  assertions
    fieldAssertFun(categoryField, categoryFieldLabel, 'ADD_TASK_FORM.TASK_CATEGORY *', true);

    //Title  assertions
    fieldAssertFun(titleField, titleFieldLabel, 'ADD_TASK_FORM.TITLE *', true);

    //Description assertions
    fieldAssertFun(descriptionField, descriptionLabelField, 'ADD_TASK_FORM.DESCRIPTION');
    //Priority assertions
    fieldAssertFun(priorityField, priorityLabelField, 'ADD_TASK_FORM.PRIORITY *', true);

    //Deadline Date assertions
    fieldAssertFun(deadLineDateField, deadLineDateLabelField, 'ADD_TASK_FORM.DEDLINE_DATE');

    //Assigned to field assertions
    fieldAssertFun(assignToField, assignToLabelField, 'ADD_TASK_FORM.ASSIGNED_TO');

    //Assign to me field assertions
    fieldAssertFun(assignToMeField, assignToMeLabelField, 'ADD_TASK_FORM.ASSIGN_TO_ME');

    //Assign to all field assertions
    fieldAssertFun(assignToAllField, assignToAllLabelField, 'ADD_TASK_FORM.ASSIGN_TO_ALL');
}

let sitevisitCategoryFieldsAssertFun = function (fixture: ComponentFixture<TaskAddComponent>) {
    let formInputFields: DebugElement[] = findFields(fixture.debugElement, '.form__input');
    //Category fields
    let categoryField = findField(fixture.debugElement, '#TaskCategoryId');
    let categoryFieldLabel: DebugElement = findField(formInputFields[0], 'label');
    //Title fields
    let titleField = findField(fixture.debugElement, '#Observation');
    let titleFieldLabel: DebugElement = findField(formInputFields[1], 'label');
    //Description fields
    let descriptionField = findField(fixture.debugElement, '#Description');
    let descriptionLabelField: DebugElement = findField(formInputFields[2], 'label');
    //Cost of rectification fields
    let costOfRectificationField = findField(fixture.debugElement, '#CostOfRectification');
    let costOfRectificationLabelField: DebugElement = findField(formInputFields[3], 'label');
    //Percentage completed fields
    let percentageCompletedField = findField(fixture.debugElement, '#PercentageCompleted');
    let percentageCompletedLabelField: DebugElement = findField(formInputFields[4], 'label');

    //Priority fields
    let priorityField = findField(fixture.debugElement, '#taskPriority');
    let priorityLabelField: DebugElement = findField(formInputFields[5], 'label');
    //Deadline Date fields
    let deadLineDateField = findField(fixture.debugElement, '#DueDate');
    let deadLineDateLabelField: DebugElement = findField(formInputFields[6], 'label');
    //Assigned To fields
    let assignToField = findField(fixture.debugElement, '#taskAssignedUsers');
    let assignToLabelField: DebugElement = findField(formInputFields[7], 'label');
    //Assign To Me fields
    let assignToMeField = findField(fixture.debugElement, '#_assignToMe');
    let assignToMeLabelField: DebugElement = findField(formInputFields[8], 'a');
    //Assign To All fields
    let assignToAllField = findField(fixture.debugElement, '#AssignToAll');
    let assignToAllLabelField: DebugElement = findField(formInputFields[8], 'label');

    //Category  assertions
    fieldAssertFun(categoryField, categoryFieldLabel, 'ADD_TASK_FORM.TASK_CATEGORY *', true);

    //Title  assertions
    fieldAssertFun(titleField, titleFieldLabel, 'ADD_TASK_FORM.OBSERVATION *', true);

    //Description assertions
    fieldAssertFun(descriptionField, descriptionLabelField, 'ADD_TASK_FORM.RECOMMENDATION');

    //Cost of rectification assertions
    fieldAssertFun(costOfRectificationField, costOfRectificationLabelField, 'ADD_TASK_FORM.COST_RECTIFICATION');

    //Percentage completed fields
    fieldAssertFun(percentageCompletedField, percentageCompletedLabelField, 'ADD_TASK_FORM.PERCENTAGE_COMPLETED');

    //Priority assertions
    fieldAssertFun(priorityField, priorityLabelField, 'ADD_TASK_FORM.PRIORITY *', true);

    //Deadline Date assertions
    fieldAssertFun(deadLineDateField, deadLineDateLabelField, 'ADD_TASK_FORM.DEDLINE_DATE');

    //Assigned to field assertions
    fieldAssertFun(assignToField, assignToLabelField, 'ADD_TASK_FORM.ASSIGNED_TO');

    //Assign to me field assertions
    fieldAssertFun(assignToMeField, assignToMeLabelField, 'ADD_TASK_FORM.ASSIGN_TO_ME');

    //Assign to all field assertions
    fieldAssertFun(assignToAllField, assignToAllLabelField, 'ADD_TASK_FORM.ASSIGN_TO_ALL');
}

let notificationAssert = function (fixture) {
    //Send Notification fields
    let formInputFields: DebugElement[] = findFields(fixture.debugElement, '.form__input');
    let SendNotificationField = findField(fixture.debugElement, '#SendNotification');
    let SendNotificationLabelField: DebugElement = findField(formInputFields[7], 'label');
    //Send notification field assertions
    fieldAssertFun(SendNotificationField, SendNotificationLabelField, 'ADD_TASK_FORM.SEND_EMAIL_NOTIFICATION');
}

describe('Add Task', () => {
    let component: TaskAddComponent;
    let fixture: ComponentFixture<TaskAddComponent>;
    let store: Store<fromRoot.State>;
    let taskCategories: Array<TaskCategory>;
    let siteVisitCategoryId: string;
    let generalCategoryId: string;
    let taskCancelSpy: jasmine.Spy;
    let taskServiceSpy: jasmine.Spy;
    let taskService: any;
    let loggedInUser: any;
    // let claimsgetCompanyIdSpy: jasmine.Spy;
    let claimsgetUserIdSpy: jasmine.Spy;
    let claimsgetUserFullNameSpy: jasmine.Spy;
    let claimsHelperStub: any;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule
                , AtlasElementsModule
                , ReactiveFormsModule
                , LocalizationModule
                , AtlasSharedModule
                , StoreModule.provideStore(reducer)
                , BrowserAnimationsModule
            ],
            declarations: [
                TaskAddComponent
            ],
            providers: [
                InjectorRef
                , FormBuilderService
                , TaskService
                , TaskCategoryService
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , LocalizationConfig
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .overrideComponent(TaskAddComponent, { set: { host: { '(click)': 'dummy' } } })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(TaskAddComponent);
        component = fixture.componentInstance;
        store = fixture.debugElement.injector.get(Store);
        taskService = fixture.debugElement.injector.get(TaskService);
        let users = extractAssignUsers(MockStoreProviderFactory.getUsersStub());
        loggedInUser = users[0];
        claimsHelperStub = fixture.debugElement.injector.get(ClaimsHelperService);
        claimsgetUserIdSpy = spyOn(claimsHelperStub, 'getUserId');
        claimsgetUserFullNameSpy = spyOn(claimsHelperStub, 'getUserFullName');
        claimsgetUserFullNameSpy.and.returnValue(loggedInUser.FullName);
        claimsgetUserIdSpy.and.returnValue(loggedInUser.Id);
        store.dispatch(new LoadTaskCategories(true));
        store.dispatch(new LoadAssignUsers(true));
        taskCategories = TaskMocStoreProviderFactory.getTaskCategories();
        store.dispatch(new LoadTaskCategoriesComplete(taskCategories));
        store.dispatch(new LoadAssignUserComplete(users));
        taskCancelSpy = spyOn(component, 'onTaskCancel');
        taskServiceSpy = spyOn(taskService, '_addNewTask');
        siteVisitCategoryId = taskCategories.find(c => c.Name === "Site Visit").Id;
        generalCategoryId = taskCategories.find(c => c.Name === "General").Id;
        fixture.detectChanges();
    });

    it('component should be launched', () => {
        expect(component).toBeTruthy();
    });
    it('should display title', () => {
        let formTitleField: DebugElement = findField(fixture.debugElement, '.so-panel__title');
        expect(formTitleField).toBeDefined();
        expect(formTitleField.nativeElement.innerText.trim()).toBe('ADD_TASK');
    });
    it('should show all fields', () => {
        otherCategoryFieldsAssertFun(fixture);
    });
    it('should have "CLOSE" and "ADD" buttons', () => {
        let buttons = findFields(findField(fixture.debugElement, '.so-panel__footer'), 'li');
        expect(buttons).toBeDefined();
        expect(buttons.length).toEqual(2);
        fieldAssertFun(buttons[0], findField(buttons[0], 'label'), 'BUTTONS.SLIDE_CLOSE');
        fieldAssertFun(buttons[1], findField(buttons[1], 'a'), 'BUTTONS.ADD');
    });

    it('category field should show all task categories and should default to "General"', () => {
        let categotryField = findField(fixture.debugElement, '#TaskCategoryId').nativeElement;
        expect(categotryField.children.length).toEqual(taskCategories.length);
        expect(component.addTaskForm.get('TaskCategoryId').value).toEqual(generalCategoryId);
    });

    it('priority field should show all priorities and should default to "Please select"', () => {
        let priorityField = findField(fixture.debugElement, '#taskPriority').nativeElement;
        expect(priorityField.children.length).toEqual(component.taskPriorities.size);
        expect(component.addTaskForm.get('Priority').value).toEqual('');
    });

    it('Deadline date should default to today', () => {
        let deadLineDateField = findField(fixture.debugElement, '#DueDate_ae-input_3');
        expect(deadLineDateField).toBeDefined();
        let today = DateTimeHelper.formatDate(new Date(), false);
        expect(deadLineDateField.nativeElement.value).toBe(today);
    });
    it('should close the "Add Task" modal when "CLOSE" button clicked', () => {
        let buttons = findFields(findField(fixture.debugElement, '.so-panel__footer'), 'li');
        let closeButton = findField(buttons[0], 'label').nativeElement;
        let closeEvent = new Event('close');
        closeButton.click(closeEvent);
        expect(taskCancelSpy).toHaveBeenCalled();
    });
    it('Verify validations when clicked on "ADD" with invalid data', () => {
        let buttons = findFields(findField(fixture.debugElement, '.so-panel__footer'), 'li');
        let addButton = findField(buttons[1], 'a').nativeElement;
        let addEvent = new Event('submit');
        addButton.click(addEvent);
        fixture.detectChanges();
        fixture.debugElement.triggerEventHandler('click', null);
        validationAssertFun(fixture, 1, 'VALIDATION_ERRORS.TITLE_REQUIRED');
        validationAssertFun(fixture, 3, 'VALIDATION_ERRORS.SELECT_PRIORITY');
        validationAssertFun(fixture, 5, 'VALIDATION_ERRORS.SELECT_ASSIGNEE', false);
    });

    it('should add task when clicked on "ADD" with valid data', () => {
        let buttons = findFields(findField(fixture.debugElement, '.so-panel__footer'), 'li');
        let addButton = findField(buttons[1], 'a').nativeElement;
        let addEvent = new Event('submit');
        //provide valid data and click on 'Add'
        setFieldValue(component.addTaskForm, 'Title', 'AUT task');
        setFieldValue(component.addTaskForm, 'Priority', '1');

        let assignToMeField = findField(fixture.debugElement, '#_assignToMe').nativeElement;
        assignToMeField.click();
        addButton.click(addEvent);
        fixture.detectChanges();
        expect(taskServiceSpy).toHaveBeenCalled();
    });

    describe('When selected category is "Site Visit"', () => {
        beforeEach(() => {
            component.addTaskForm.get('TaskCategoryId').setValue(siteVisitCategoryId);
            let aeSelectEvent: AeSelectEvent<string> = {
                Event: new Event('change-category'),
                SelectedValue: siteVisitCategoryId,
                SelectedItem: component.categoryList.get(9)
            };
            component.onCategoryChange(aeSelectEvent);
            fixture.detectChanges();
            fixture.debugElement.triggerEventHandler('click', null);
        });
        it('should show "Observation","Recommendation" fields ', () => {
            sitevisitCategoryFieldsAssertFun(fixture);
        });
        it('"Percentage completed" should not exceed 100', () => {
            let buttons = findFields(findField(fixture.debugElement, '.so-panel__footer'), 'li');
            let addButton = findField(buttons[1], 'a').nativeElement;
            let addEvent = new Event('submit');
            setFieldValue(component.addTaskForm, 'Title', 'AUT task');
            setFieldValue(component.addTaskForm, 'Priority', '1');
            setFieldValue(component.addTaskForm, 'PercentageCompleted', '200');
            let assignToMeField = findField(fixture.debugElement, '#_assignToMe').nativeElement;
            assignToMeField.click();
            addButton.click(addEvent);
            fixture.detectChanges();
            validationAssertFun(fixture, 4, 'VALIDATION_ERRORS.PERCENTAGE_COMPLETED_MESSAGE');
        });
        it('Verify validations when clicked on "ADD" with invalid data', () => {
            let buttons = findFields(findField(fixture.debugElement, '.so-panel__footer'), 'li');
            let addButton = findField(buttons[1], 'a').nativeElement;
            let addEvent = new Event('submit');
            addButton.click(addEvent);
            fixture.detectChanges();
            fixture.debugElement.triggerEventHandler('click', null);
            validationAssertFun(fixture, 1, 'VALIDATION_ERRORS.OBSERVATION_REQUIRED');
            validationAssertFun(fixture, 5, 'VALIDATION_ERRORS.SELECT_PRIORITY');
            validationAssertFun(fixture, 7, 'VALIDATION_ERRORS.SELECT_ASSIGNEE', false);
        });
        it('should add task when clicked on "ADD" with valid data', () => {
            let buttons = findFields(findField(fixture.debugElement, '.so-panel__footer'), 'li');
            let addButton = findField(buttons[1], 'a').nativeElement;
            let addEvent = new Event('submit');
            //provide valid data and click on 'Add'
            setFieldValue(component.addTaskForm, 'Title', 'AUT task');
            setFieldValue(component.addTaskForm, 'Priority', '1');

            let assignToMeField = findField(fixture.debugElement, '#_assignToMe').nativeElement;
            assignToMeField.click();
            addButton.click(addEvent);
            fixture.detectChanges();
            expect(taskServiceSpy).toHaveBeenCalled();
        });
    });
    describe('Verify "Assigned To" field validations', () => {
        beforeEach(() => {
            setFieldValue(component.addTaskForm, 'Title', 'AUT task');
            setFieldValue(component.addTaskForm, 'Priority', '1');
            fixture.detectChanges();
            fixture.debugElement.triggerEventHandler('click', null);
        });
        it('should show validation message for "Assigned To" when "Assignee" not selected', () => {
            let buttons = findFields(findField(fixture.debugElement, '.so-panel__footer'), 'li');
            let addButton = findField(buttons[1], 'a').nativeElement;
            let addEvent = new Event('submit');
            addButton.click(addEvent);
            fixture.detectChanges();
            fixture.debugElement.triggerEventHandler('click', null);
            validationAssertFun(fixture, 5, 'VALIDATION_ERRORS.SELECT_ASSIGNEE', false);
        });
        it('should be able to assign task to logged in user by clicking "Assign To Me" button', () => {
            let assignToMeField = findField(fixture.debugElement, '#_assignToMe').nativeElement;
            assignToMeField.click();
            fixture.detectChanges();
            let loggedUser = new User(loggedInUser.Id, loggedInUser.FullName);
            expect(getFieldValue(component.addTaskForm, 'AssignToAll')).toBeFalsy();
            expect(getFieldValue(component.addTaskForm, 'AssignedUsers')).toBeDefined();
            expect(getFieldValue(component.addTaskForm, 'AssignedUsers')).toContain(loggedUser);

            notificationAssert(fixture);
        });
        it('should be able to assign task to all users by clicking "Assign to all users" checkbox', () => {
            setFieldValue(component.addTaskForm, 'AssignToAll', 'true');
            component.onChangeAllCheckbox(new Event('changed'));
            fixture.detectChanges();
            expect(getFieldValue(component.addTaskForm, 'AssignToAll')).toBeTruthy();
            expect(getFieldValue(component.addTaskForm, 'AssignedUsers')).toBeDefined();
            expect(getFieldValue(component.addTaskForm, 'AssignedUsers').length).toEqual(0);

            notificationAssert(fixture);
        });
        it('should be able to assign task by selecting from autocomplete list', () => {
            component.onAssignUserChanged([{ Value: loggedInUser.Id, Text: loggedInUser.FullName }]);
            fixture.detectChanges();
            let selectedUser = new User(loggedInUser.Id, loggedInUser.FullName);
            expect(getFieldValue(component.addTaskForm, 'AssignToAll')).toBeFalsy();
            expect(getFieldValue(component.addTaskForm, 'AssignedUsers')).toBeDefined();
            expect(getFieldValue(component.addTaskForm, 'AssignedUsers').length).toEqual(1);
            expect(getFieldValue(component.addTaskForm, 'AssignedUsers')).toContain(selectedUser);

            notificationAssert(fixture);
        });
        it('should clear assignee from autocomplete when clicked on "Assign To All" checkbox', () => {
            component.onAssignUserChanged([{ Value: loggedInUser.Id, Text: loggedInUser.FullName }]);
            fixture.detectChanges();
            let selectedUser = new User(loggedInUser.Id, loggedInUser.FullName);

            expect(getFieldValue(component.addTaskForm, 'AssignToAll')).toBeFalsy();
            expect(getFieldValue(component.addTaskForm, 'AssignedUsers')).toBeDefined();
            expect(getFieldValue(component.addTaskForm, 'AssignedUsers').length).toEqual(1);
            expect(getFieldValue(component.addTaskForm, 'AssignedUsers')).toContain(selectedUser);

            setFieldValue(component.addTaskForm, 'AssignToAll', 'true');
            component.onChangeAllCheckbox(new Event('changed'));
            fixture.detectChanges();

            expect(getFieldValue(component.addTaskForm, 'AssignToAll')).toBeTruthy();
            expect(getFieldValue(component.addTaskForm, 'AssignedUsers')).toBeDefined();
            expect(getFieldValue(component.addTaskForm, 'AssignedUsers').length).toEqual(0);

            notificationAssert(fixture);
        });
    });
});