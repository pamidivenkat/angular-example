import { TestBed } from '@angular/core/testing';
import { Http, Response, ResponseOptions, URLSearchParams } from '@angular/http';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';

import { extractPagingInfo } from '../../employee/common/extract-helpers';
import { RestClientService } from '../../shared/data/rest-client.service';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { reducer } from '../../shared/reducers';
import { MessengerService } from '../../shared/services/messenger.service';
import { MockStoreProviderTask } from '../../shared/testing/mocks/mock-store-provider-task';
import {
    ChangeTaskAction,
    ChangeTaskCompleteAction,
    LoadSelectedTaskAction,
    LoadSelectedTaskCompleteAction,
    LoadTaskCategories,
    LoadTaskCategoriesComplete,
    LoadTasksAction,
    LoadTasksCompleteAction,
    RemoveTaskAction,
} from '../actions/task.list.actions';
import { extractTaskCategories, extractTasksList } from '../common/task-extract-helper';
import { TaskStatus } from '../models/task-status';
import { TasksListEffects } from './task.list.effects';


let paramsAssert = function (expected: any, actual: any): boolean {

    if (Array.isArray(expected) &&
        Array.from(expected).length > 0 &&
        (Array.from(expected)[0] === 'Task'
            || Array.from(expected)[0] === 'TaskCategory'
            || Array.from(expected)[0] === 'TasksView')
    ) {
        let searchIndex = expected.length - 1;
        let expectedStr = Array.from(expected)[searchIndex].search.toString();
        let valueStr = Array.from(actual)[searchIndex]['search'].toString();
        return expectedStr.trim() === valueStr.trim();
    }

    return JSON.stringify(expected).trim() === JSON.stringify(actual).trim();
}

describe('Task list effect', () => {

    let runner, effect, restClientServiceStub, store, claimsHelperServiceStub;
    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            TasksListEffects
            , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete']) }
            , { provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceStub', ['getUserId']) }
            , MessengerService
            , Http
        ]
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        effect = TestBed.get(TasksListEffects);
        restClientServiceStub = TestBed.get(RestClientService);
        claimsHelperServiceStub = TestBed.get(ClaimsHelperService);
        store = TestBed.get(Store);
    });

    it('should load the tasks with default params', () => {
        restClientServiceStub.get.and.returnValue(Observable.of(MockStoreProviderTask.getTaskListStub()));
        runner.queue(new LoadTasksAction(true));
        let expected = new LoadTasksCompleteAction({ tasksList: extractTasksList(MockStoreProviderTask.getTaskListStub()), pagingInfo: extractPagingInfo(MockStoreProviderTask.getTaskListStub()) });

        effect.tasksInfo$.subscribe((actual) => {
            expect(expected).toEqual(actual);

            let searchParams: URLSearchParams = new URLSearchParams();
            searchParams.set('fields', 'Id,Title,Status,Priority,DueDate,AssignedUserName,CreatedByUserName,TaskCategoryId,TaskCategoryName');
            searchParams.set('pageNumber', '1');
            searchParams.set('pageSize', '10');
            searchParams.set('sortField', 'DueDate');
            searchParams.set('direction', 'desc');
            jasmine.addCustomEqualityTester(paramsAssert);
            expect(restClientServiceStub.get).toHaveBeenCalledWith('TasksView', { search: searchParams });
        });
    });

    it('should load the tasks details', () => {
        let task = MockStoreProviderTask.getTaskDetailsStub();
        let options = new ResponseOptions({ body: task });
        let response = new Response(options);

        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadSelectedTaskAction(task.Id));
        let expected = new LoadSelectedTaskCompleteAction(task);

        effect.selectedTask$.subscribe((actual) => {
            expect(expected).toEqual(actual);

            let searchParams: URLSearchParams = new URLSearchParams();
            searchParams.set('fields', 'Id,Title,Status,Priority,CreatedOn,DueDate,Description,AssignedTo,AssignedUserName,CreatedBy,CreatedByUserName,TaskCategoryId,TaskCategoryName,CorrectiveActionTaken,CostOfRectification,PercentageCompleted,CompanyId,RegardingObjectId');

            expect(restClientServiceStub.get).toHaveBeenCalledWith('TasksView/' + task.Id, { search: searchParams });
        });
    });

    it('should load the tasks categories', () => {
        let options = new ResponseOptions({ body: MockStoreProviderTask.getTaskCategoriesStub() });
        let response = new Response(options);

        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadTaskCategories(true));
        let expected = new LoadTaskCategoriesComplete(extractTaskCategories(response));

        effect.taskCategories$.subscribe((actual) => {
            expect(expected).toEqual(actual);

            let searchParams: URLSearchParams = new URLSearchParams();
            searchParams.set('fields', 'Id,Name');
            searchParams.set('action', 'getspecificfields');
            //Paging
            searchParams.set('pageNumber', '0');
            searchParams.set('pageSize', '0');
            //End of Paging

            //Sorting
            searchParams.set('sortField', 'Name');
            searchParams.set('direction', 'asc');
            jasmine.addCustomEqualityTester(paramsAssert);
            expect(restClientServiceStub.get).toHaveBeenCalledWith('TaskCategory', { search: searchParams });
        });
    });

    it('should update task status', () => {
        let task = MockStoreProviderTask.getTaskDetailsStub();
        task.Status = TaskStatus.InProgress;
        let options = new ResponseOptions({ body: task });
        let response = new Response(options);

        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new ChangeTaskAction(task));
        let expected = new ChangeTaskCompleteAction(task);

        effect.updateTaskStatus$.subscribe((actual) => {
            expect(expected).toEqual(actual);

            let searchParams: URLSearchParams = new URLSearchParams();
            searchParams.set('taskId', task.Id);
            searchParams.set('status', TaskStatus.InProgress.toString());

            jasmine.addCustomEqualityTester(paramsAssert);
            expect(restClientServiceStub.post).toHaveBeenCalledWith('Task', null, { search: searchParams });
        });
    });

    it('should used delete api call for delete task', () => {
        let task = MockStoreProviderTask.getTaskDetailsStub();
        task.Status = TaskStatus.InProgress;
        let options = new ResponseOptions({ body: true });
        let response = new Response(options);

        restClientServiceStub.delete.and.returnValue(Observable.of(response));
        runner.queue(new RemoveTaskAction(task));
        let expected = new LoadTasksAction(true);

        effect.deleteTask$.subscribe((actual) => {
            expect(expected).toEqual(actual);

            let searchParams: URLSearchParams = new URLSearchParams();
            searchParams.set('id', task.Id);

            jasmine.addCustomEqualityTester(paramsAssert);
            expect(restClientServiceStub.delete).toHaveBeenCalledWith('Task', { search: searchParams });
        });
    });
});
