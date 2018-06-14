import { EventListener } from '@angular/core/src/debug/debug_node';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { isNullOrUndefined } from 'util';

import { AeAutocompleteComponent } from '../../atlas-elements/ae-autocomplete/ae-autocomplete.component';
import { AeBannerComponent } from '../../atlas-elements/ae-banner/ae-banner.component';
import { AeIndicatorComponent } from '../../atlas-elements/ae-indicator/ae-indicator.component';
import { AeLegendComponent } from '../../atlas-elements/ae-legend/ae-legend.component';
import { AeModalDialogComponent } from '../../atlas-elements/ae-modal-dialog/ae-modal-dialog.component';
import { AeNavActionsComponent } from '../../atlas-elements/ae-nav-actions/ae-nav-actions.component';
import { AeNotificationComponent } from '../../atlas-elements/ae-notification/ae-notification.component';
import { AeSelectComponent } from '../../atlas-elements/ae-select/ae-select.component';
import { AeSlideOutComponent } from '../../atlas-elements/ae-slideout/ae-slideout.component';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { AeAutoCompleteModel } from '../../atlas-elements/common/models/ae-autocomplete-model';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { extractPagingInfo } from '../../employee/common/extract-helpers';
import {
    LoadApplicableDepartmentsCompleteAction,
    LoadApplicableSitesCompleteAction,
} from '../../shared/actions/user.actions';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import * as fromRoot from '../../shared/reducers';
import { reducer } from '../../shared/reducers/index';
import { FormBuilderService } from '../../shared/services/form-builder.service';
import { MessengerService } from '../../shared/services/messenger.service';
import { UserService } from '../../shared/services/user-services';
import { CommonTestHelper } from '../../shared/testing/helpers/common-test-helper';
import { ActivatedRouteStub } from '../../shared/testing/mocks/activated-route-stub';
import { LocaleServiceStub } from '../../shared/testing/mocks/locale-service-stub';
import { MockStoreProviderTask } from '../../shared/testing/mocks/mock-store-provider-task';
import { RouterMock } from '../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../shared/testing/mocks/translation-service-stub';
import {
    ChangeTaskAction,
    LoadSelectedTaskAction,
    LoadTaskCategoriesComplete,
    LoadTasksCompleteAction,
    LoadTasksOnFilterChangeAction,
} from '../actions/task.list.actions';
import { extractTasksList } from '../common/task-extract-helper';
import { TasksView } from '../models/task';
import { Priority } from '../models/task-priority';
import { TaskStatus } from '../models/task-status';
import { TaskViewType } from '../models/task-view-type';
import { TaskFormsModule } from '../task-forms/task-forms.module';
import { TaskInformationBarComponent } from '../task-information-bar/task-information-bar.component';
import { TaskListComponent } from './task-list.component';

let filterAssert = function (filters, index: number, placeholder = null, value: any, tag: string, count = 0, optList = []) {
    expect(filters[index]).toBeTruthy();
    if (tag === 'option') {
        expect(filters[index].componentInstance.value).toEqual(value);
        if (index === 2) {
            expect(filters[index].componentInstance.placeholder).toEqual(placeholder);
        } else {
            expect(filters[index].componentInstance.inputValue.Text).toEqual(placeholder);
        }
    } else {
        expect(filters[index].componentInstance.placeholder).toEqual(placeholder);
    }

    let options = filters[index].queryAll(By.css(tag));

    if (count > 0) {
        expect(options.length).toEqual(count);
        options.map((option, index) => {
            expect(option.nativeElement.innerText.trim()).toEqual(optList[index]);
        });
    }
}

let getNames = function (items, property, defaultValue) {
    let siteNames = [defaultValue];
    items.map((item, index) => {
        siteNames.push(item[property]);
    });

    return siteNames;
}

let columnsAssert = function (columns, index: number, title: string, sortable: boolean, sortKay: string = null) {

    expect(columns[index].nativeElement.innerText.trim()).toEqual(title);
    if (sortable) {
        expect(columns[index].nativeElement.classList).toContain('table__heading--sortable');
        expect(columns[index].childNodes[1].nativeNode.attributes.getNamedItem('data-sortKey').value).toEqual(sortKay);
    } else {
        expect(columns[index].nativeElement.classList).not.toContain('table__heading--sortable');
    }

}

let actionsAssert = function (fixture, actionItems: Array<string>, rowIndex: number = 0) {
    let rows = fixture.debugElement.queryAll(By.css('.table__row'));

    rows.map((row, index) => {
        expect(row.query(By.directive(AeNavActionsComponent))).toBeTruthy();

        let actionButton = <AeNavActionsComponent<any>>row.query(By.directive(AeNavActionsComponent)).componentInstance;
        let event = new MouseEvent('click');
        actionButton._onClick(event);
        fixture.detectChanges();

        let nav = row.query(By.css('.nav--actions'));
        let actions = nav.queryAll(By.css('li'));

        expect(actions.length).toEqual(actionItems.length);

        actions.map((action, index) => {
            expect(actions[index].nativeElement.innerText.toLowerCase().trim()).toEqual(actionItems[index]);
        });
    });
}

let actionAssert = function (actionCommand, fixture, dispatchSpy, status = TaskStatus.ToDo, isSiteVisit = false, progress = '100') {
    let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
    };
    let task = new TasksView();
    task.Id = '1234';
    task.Status = status;

    if (isSiteVisit && progress !== '100') {
        task.PercentageCompleted = progress;
        task.TaskCategoryName = 'Site Visit';
        actionCommand.command.next(task);
        fixture.detectChanges();
        expect(dispatchSpy).toHaveBeenCalledWith(new LoadSelectedTaskAction(task.Id));

        let slideout = fixture.debugElement.query(By.directive(AeSlideOutComponent));
        expect(slideout).toBeTruthy();
    } else {
        actionCommand.command.next(task);
        fixture.detectChanges();
        expect(dispatchSpy).toHaveBeenCalledWith(new ChangeTaskAction(Object.assign({}, task)));
    }

    dispatchSpy.calls.reset();
}

let updateAssert = function (store, updateAction, fixture, dispatchSpy) {

    let task = new TasksView()
    task.Id = '1234'
    updateAction.command.next(task);

    fixture.detectChanges();
    expect(dispatchSpy).toHaveBeenCalledWith(new LoadSelectedTaskAction(task.Id));
    expect(fixture.componentInstance.isUpdate).toBeTruthy();

    let slideout = fixture.debugElement.query(By.directive(AeSlideOutComponent));
    expect(slideout).toBeTruthy();
}

let removeAssert = function (removeAction, fixture) {
    let task = new TasksView()
    task.Id = '1234'
    removeAction.command.next(task);

    let actionButton = <AeNavActionsComponent<any>>fixture.debugElement.query(By.directive(AeNavActionsComponent)).componentInstance;
    let event = new MouseEvent('click');
    actionButton._onClick(event);

    fixture.detectChanges();

    let confirm = fixture.debugElement.query(By.directive(AeModalDialogComponent));
    expect(confirm).toBeTruthy();

    let modelHeader = confirm.query(By.css('.modal-dialog-header'));
    expect(modelHeader.nativeElement.innerText.trim()).toEqual('TASK_Dialog.Heading_text');

    let modelBody = confirm.query(By.css('.modal-dialog-body'));
    expect(modelBody.nativeElement.innerText.trim()).toEqual('TASK_Dialog.Info');

    let confirmButton = confirm.query(By.css('#confirmYes_aeButton_1'));

    confirmButton.nativeElement.click();
    fixture.detectChanges();

    confirm = fixture.debugElement.query(By.directive(AeModalDialogComponent));
    expect(confirm).toBeNull();
}

let paramsAssert = function (expected: any, value: any): boolean {
    // console.log('--------------');
    if (expected[0] instanceof LoadTasksOnFilterChangeAction) {
        let expectedParams: Map<string, string> = expected[0].payload;
        let valueParams: Map<string, string> = value[0].payload;
        let assert = true;
        // console.log(expectedParams.size);
        // console.log(valueParams.size);

        if (isNullOrUndefined(valueParams) || expectedParams.size !== valueParams.size) {
            assert = false;
        }
        expectedParams.forEach((param, index) => {
            // console.log(param);
            // console.log(index);
            // console.log(valueParams.get(index));
            // console.log('############');
            if (param !== valueParams.get(index) && assert === true) {
                assert = false;
            }
        });

        valueParams.forEach((param, index) => {
            // console.log(param);
            // console.log(index);
            // console.log(expectedParams.get(index));
            // console.log('----------------');
            if (param !== expectedParams.get(index) && assert === true) {
                assert = false;
            }
        });

        return assert;
    }
    return JSON.stringify(expected).trim() === JSON.stringify(value).trim();
}

describe('Task list component', () => {
    let component: TaskListComponent;
    let fixture: ComponentFixture<TaskListComponent>;
    let claimsHelperServiceMock;
    let store: Store<fromRoot.State>;
    let userServiceMock;
    let routerMock;
    let todoAction;
    let inProgressAction;
    let completeAction;
    let updateAction;
    let removeAction;
    let actions;
    let dispatchSpy: jasmine.Spy;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , AtlasElementsModule
                , StoreModule.provideStore(reducer)
                , NoopAnimationsModule
                , TaskFormsModule
            ]
            , declarations: [
                TaskListComponent
                , TaskInformationBarComponent

            ]
            , providers: [
                InjectorRef
                , BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , MessengerService
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'isHolidayAuthorizerOrManager'
                        , 'canViewCompanyAllTasks'
                        , 'isAdministrator'
                        , 'IsPublicUser'
                        , 'getUserId'
                        , 'getUserFullName'
                        , 'canViewUnassignedTasks'
                    ])
                }
                , { provide: UserService, useValue: jasmine.createSpyObj('userServiceMock', ['_getDepartmentList']) }
                , FormBuilderService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskListComponent);
        component = fixture.componentInstance;
        claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
        store = fixture.debugElement.injector.get(Store);
        routerMock = fixture.debugElement.injector.get(Router);

        store.dispatch(new LoadTaskCategoriesComplete(MockStoreProviderTask.getTaskCategoriesStub().Entities));

        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();

        let banner = fixture.debugElement.query(By.directive(AeBannerComponent));
        expect(banner).not.toBeNull();

        let title = fixture.debugElement.query(By.css('h1'));
        expect(title.nativeElement.innerText).toEqual('TASKS_TEXT');

        let notification = fixture.debugElement.query(By.directive(AeNotificationComponent))
        expect(notification).not.toBeNull();
        expect(notification.nativeElement.innerText.trim()).toEqual('ADD_TASK_FORM.BELOW_YOUR_LIST_OF_TASKS');
    });

    it('Filters for users with out holiday authorizer/manager permissions and view all tasks/admin', () => {
        //should have 2 select type filters'
        let filters = fixture.debugElement.queryAll(By.directive(AeSelectComponent));
        expect(filters.length).toEqual(2);

        //should have 2 options for type filter'
        let optList: string[] = ['My Tasks', 'Tasks I have assigned to others'];
        filterAssert(filters, 0, 'My Tasks', 0, 'option', 2, optList);

        //should have 7 options for due filter'
        optList = ['All', 'New tasks', 'Overdue tasks', 'Incomplete tasks', 'Due today', 'Due this week', 'Due next week', 'Unscheduled tasks'];
        filterAssert(filters, 1, 'All', '', 'option', 8, optList);

        filters = fixture.debugElement.queryAll(By.directive(AeAutocompleteComponent));
        expect(filters.length).toEqual(3);

        let priorityList = [{ name: 'Immediate', id: Priority.Immediate }, { name: 'High', id: Priority.High }, { name: 'Medium', id: Priority.Medium }, { name: 'Low', id: Priority.Low }];;
        filterAssert(filters, 0, 'Select priority', '', 'li');
        let defaults = [{ name: 'In Progress', id: 1 }, { name: 'To Do', id: 0 }];
        let statusList = ['In Progress', 'To Do', ''];
        filterAssert(filters, 1, 'Select status', defaults, 'li', 3, statusList);

        filterAssert(filters, 2, 'Select categories', '', 'li');
    });

    describe('With view all tasks permissions ', () => {

        beforeEach(() => {
            claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
            claimsHelperServiceMock.canViewCompanyAllTasks.and.returnValue(true);
            fixture = TestBed.createComponent(TaskListComponent);
            component = fixture.componentInstance;

            fixture.detectChanges();
        })
        it('should have three options for tasks filter', () => {
            let filters = fixture.debugElement.queryAll(By.directive(AeSelectComponent));
            let optList: string[] = ['All Tasks', 'My Tasks', 'Tasks I have assigned to others'];

            filterAssert(filters, 0, 'My Tasks', 0, 'option', 3, optList);
        });
    });

    describe('With holiday authorizer/manager permissions ', () => {
        beforeEach(() => {
            claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
            claimsHelperServiceMock.isHolidayAuthorizerOrManager.and.returnValue(true);
            claimsHelperServiceMock.canViewUnassignedTasks.and.returnValue(true);
            fixture = TestBed.createComponent(TaskListComponent);
            component = fixture.componentInstance;
            userServiceMock = TestBed.get(UserService);

            store.dispatch(new LoadApplicableDepartmentsCompleteAction(MockStoreProviderTask.getDepartmentsStub()));
            store.dispatch(new LoadApplicableSitesCompleteAction(MockStoreProviderTask.getSitesStub()));

            fixture.detectChanges();
        });

        beforeEach(() => {
            store = fixture.debugElement.injector.get(Store);
            dispatchSpy = spyOn(store, 'dispatch');
            fixture.detectChanges();
        })

        it('should have three options for tasks filter and display departments and employee filters on selecting my team tasks', fakeAsync(() => {
            let listFilters = new Map<string, string>();
            listFilters.set('filterTaskView', TaskViewType.MyTeamTasks.toString());
            listFilters.set('filterTaskStatus', TaskStatus.ToDo.toString() + ',' + TaskStatus.InProgress.toString());
            listFilters.set('TaskPriorityFilter', '');
            listFilters.set('filterTasksByDeadLine', '');

            let filters = fixture.debugElement.queryAll(By.directive(AeSelectComponent));
            let optList: string[] = ['My Tasks', 'My Team Tasks', 'Tasks I have assigned to others', 'Unassigned Tasks'];

            filterAssert(filters, 0, 'My Tasks', 0, 'option', 4, optList);
            filters[0].componentInstance.value = 3;
            tick(50);
            filters[0].componentInstance.onChange();
            fixture.detectChanges();

            jasmine.addCustomEqualityTester(paramsAssert);
            expect(dispatchSpy).toHaveBeenCalledWith(new LoadTasksOnFilterChangeAction(listFilters));
            dispatchSpy.calls.reset();

            let deptFilter = fixture.debugElement.query(By.css('#ddlDepartmentFilter'))
            expect(deptFilter).not.toBeNull();
            filters = fixture.debugElement.queryAll(By.directive(AeSelectComponent));
            filterAssert(filters, 2, 'All departments', '', 'option', 18, getNames(MockStoreProviderTask.getDepartmentsStub(), 'Name', 'All departments'));

            filters[2].componentInstance.value = 'ab577bb1-bb31-f715-1c85-e3205f98e1cc'; //{"Id":"ab577bb1-bb31-f715-1c85-e3205f98e1cc","Name":"Accounts"}
            filters[2].componentInstance.onChange();
            fixture.detectChanges();

            listFilters.set('filterTasksByDept', 'ab577bb1-bb31-f715-1c85-e3205f98e1cc');
            listFilters.set('filterTasksByDeptEmployee', '');
            jasmine.addCustomEqualityTester(paramsAssert);
            expect(dispatchSpy).toHaveBeenCalledWith(new LoadTasksOnFilterChangeAction(listFilters));
            dispatchSpy.calls.reset();

            let empFilter = fixture.debugElement.query(By.css('#ddlEmployeeFilter'))
            expect(empFilter).not.toBeNull();
        }));

        it('should have display sites filters on selecting site visit category', fakeAsync(() => {
            let listFilters = new Map<string, string>();
            listFilters.set('filterTaskView', TaskViewType.MyTasks.toString());
            listFilters.set('filterTaskStatus', TaskStatus.ToDo.toString() + ',' + TaskStatus.InProgress.toString());
            listFilters.set('TaskPriorityFilter', '');
            listFilters.set('filterTasksByDeadLine', '');
            listFilters.set('filterTaskCategory', '3c1ba2c4-a32a-4428-8473-43d8b48a47bd');

            let autoFilters = fixture.debugElement.queryAll(By.directive(AeAutocompleteComponent));

            let selectedItem = new AeAutoCompleteModel('Site Visit', '3c1ba2c4-a32a-4428-8473-43d8b48a47bd', { 'Id': '3c1ba2c4-a32a-4428-8473-43d8b48a47bd', 'Name': 'Site Visit' });
            autoFilters[2].componentInstance.selectItem(selectedItem);

            fixture.detectChanges();

            let selectFilters = fixture.debugElement.queryAll(By.directive(AeSelectComponent));
            expect(selectFilters[2]).not.toBeNull();

            filterAssert(selectFilters, 2, null, 'all', 'option', 10, getNames(MockStoreProviderTask.getSitesStub(), 'SiteNameAndPostcode', 'All'));

            jasmine.addCustomEqualityTester(paramsAssert);
            expect(dispatchSpy).toHaveBeenCalledWith(new LoadTasksOnFilterChangeAction(listFilters));
        }));

        it('should call api with proper filters when a priority changed', () => {
            let listFilters = new Map<string, string>();
            listFilters.set('filterTaskView', TaskViewType.MyTasks.toString());
            listFilters.set('filterTaskStatus', TaskStatus.ToDo.toString() + ',' + TaskStatus.InProgress.toString());
            listFilters.set('TaskPriorityFilter', '0');
            listFilters.set('filterTasksByDeadLine', '');

            let autoFilters = fixture.debugElement.queryAll(By.directive(AeAutocompleteComponent));
            let event = { name: 'Immediate', id: Priority.Immediate.toString() };
            let selectedItem = new AeAutoCompleteModel(event.name, event.id, event);
            autoFilters[0].componentInstance.selectItem(selectedItem);

            jasmine.addCustomEqualityTester(paramsAssert);
            expect(dispatchSpy).toHaveBeenCalledWith(new LoadTasksOnFilterChangeAction(listFilters));
        });

        it('should call api with proper filters when a due changed', fakeAsync(() => {
            let listFilters = new Map<string, string>();
            listFilters.set('filterTaskView', TaskViewType.MyTasks.toString());
            listFilters.set('filterTaskStatus', TaskStatus.ToDo.toString() + ',' + TaskStatus.InProgress.toString());
            listFilters.set('TaskPriorityFilter', '');
            listFilters.set('filterTasksByDeadLine', '13');

            let selectFilters = fixture.debugElement.queryAll(By.directive(AeSelectComponent));
            selectFilters[1].componentInstance.value = 13;
            tick(50);
            selectFilters[1].componentInstance.onChange();
            fixture.detectChanges();

            jasmine.addCustomEqualityTester(paramsAssert);
            expect(dispatchSpy).toHaveBeenCalledWith(new LoadTasksOnFilterChangeAction(listFilters));
        }));

    });

    describe('Load data in the grid', () => {
        beforeEach(() => {
            store = fixture.debugElement.injector.get(Store);
            store.dispatch(new LoadTasksCompleteAction({ tasksList: extractTasksList(MockStoreProviderTask.getTaskListStub()), pagingInfo: extractPagingInfo(MockStoreProviderTask.getTaskListStub()) }));
            fixture.detectChanges();
        });

        it('should have page change and sort options', (() => {
            let listeners: EventListener[] = fixture.debugElement.query(By.css('ae-datatable')).listeners;
            let sortEvent = listeners.find(obj => obj.name.toLowerCase() == 'onsort');
            let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
            expect(sortEvent).toBeDefined();
            expect(pageChangeEvent).toBeDefined();
        }));

        it('should have columns as priority, title, status, category, due date, assigned to, created by and action', () => {
            let columns = fixture.debugElement.queryAll(By.css('.table__heading'));
            expect(columns.length).toEqual(8);

            columnsAssert(columns, 0, '', false);
            columnsAssert(columns, 1, 'Title', true, 'Title');
            columnsAssert(columns, 2, 'Status', true, 'Status');
            columnsAssert(columns, 3, 'Category', true, 'TaskCategoryName');
            columnsAssert(columns, 4, 'Due date', true, 'DueDate');
            columnsAssert(columns, 5, 'Assigned to', true, 'AssignedUserName');
            columnsAssert(columns, 6, 'Created by', true, 'CreatedByUserName');
            columnsAssert(columns, 7, 'Actions', false);

            actionsAssert(fixture, ['to do', 'in progress', 'complete', 'update', 'remove']);
        });

        beforeEach(() => {
            store = fixture.debugElement.injector.get(Store);
            dispatchSpy = spyOn(store, 'dispatch');
            fixture.detectChanges();
        });
        beforeEach(() => {
            actions = component.actions;
            todoAction = CommonTestHelper.getGivenButton(actions.toArray(), 'to do');
            inProgressAction = CommonTestHelper.getGivenButton(actions.toArray(), 'in progress');
            completeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'complete');
            updateAction = CommonTestHelper.getGivenButton(actions.toArray(), 'update');
            removeAction = CommonTestHelper.getGivenButton(actions.toArray(), 'remove');
        });
        it('should have action with options to do, in progress, complete, update and remove', fakeAsync(() => {
            actionAssert(todoAction, fixture, dispatchSpy);
            actionAssert(inProgressAction, fixture, dispatchSpy, TaskStatus.InProgress);
            actionAssert(completeAction, fixture, dispatchSpy, TaskStatus.Complete);
            updateAssert(store, updateAction, fixture, dispatchSpy);
            removeAssert(removeAction, fixture);
        }));

        it('should have update slideout with error message when completing sitevisit with out 100 progress', fakeAsync(() => {
            dispatchSpy.calls.reset();
            actionAssert(completeAction, fixture, dispatchSpy, TaskStatus.Complete, true, '30');
            actionAssert(completeAction, fixture, dispatchSpy, TaskStatus.Complete, true);
        }));

        it('should have display rows as per the priority', () => {
            let rows = fixture.debugElement.queryAll(By.css('.table__row'));
            expect(rows.length).toEqual(10);

            expect(rows[0].query(By.directive(AeIndicatorComponent)).nativeElement.innerText).toEqual('Medium');
            expect(rows[3].query(By.directive(AeIndicatorComponent)).nativeElement.innerText).toEqual('High');
            expect(rows[4].query(By.directive(AeIndicatorComponent)).nativeElement.innerText).toEqual('Immediate');
            expect(rows[5].query(By.directive(AeIndicatorComponent)).nativeElement.innerText).toEqual('Low');

            let legend = fixture.debugElement.query(By.directive(AeLegendComponent));
            expect(legend).toBeTruthy();

            expect(legend.query(By.css('h4')).nativeElement.innerText).toEqual('Priorities');

            let legendOptions = legend.queryAll(By.css('.legend'));
            expect(legendOptions.length).toEqual(4);

            let descriptions = legend.queryAll(By.css('.legend__description'));
            expect(descriptions[0].nativeElement.innerText).toEqual('Immediate');
            expect(descriptions[1].nativeElement.innerText).toEqual('High');
            expect(descriptions[2].nativeElement.innerText).toEqual('Medium');
            expect(descriptions[3].nativeElement.innerText).toEqual('Low');
        })
    });
});