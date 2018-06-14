import { extractAssignUsers } from '../common/task-extract-helper';
import { AssignUser } from '../models/assign-user';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { MockStoreProviderFactory } from '../../shared/testing/mocks/mock-store-provider-factory';
import { ClaimsHelperServiceStub } from '../../shared/testing/mocks/claims-helper-service-mock';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { LoadAssignUsers, SaveTaskAction, LoadAssignUserComplete } from '../actions/task-add.actions';
import { LoadTasksAction } from '../actions/task.list.actions';
import { ResponseOptions, Response, URLSearchParams } from '@angular/http';
import { Priority } from '../models/task-priority';
import { TasksView } from '../models/task';
import { MessengerService } from '../../shared/services/messenger.service';
import { RestClientService } from '../../shared/data/rest-client.service';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { TestBed } from '@angular/core/testing';
import { TaskAddEffects } from './task-add.effects';
import { Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../shared/reducers';
import { reducer } from '../../shared/reducers/index';
import { Observable } from 'rxjs/Rx';
describe('Task add effects: ', () => {
    let runner;
    let taskAddEffects: TaskAddEffects;
    let restClientServiceStub;
    let store: Store<fromRoot.State>;

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            TaskAddEffects
            , MessengerService
            , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
            , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete']) }

        ]
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        taskAddEffects = TestBed.get(TaskAddEffects);
        restClientServiceStub = TestBed.get(RestClientService);
        store = TestBed.get(Store);

    })

    it('should return true  on success of add task', () => {
        let task: TasksView = new TasksView();
        task.Title = 'Aut Task';
        task.AssignToAll = true;
        task.TaskCategoryId = 'c0a7ca1e-5ee7-4bd8-b591-3ff0cc8fc03b';
        task.Priority = Priority.High;
        let options = new ResponseOptions({ body: task });
        let response = new Response(options);
        let apiUrl = 'task/BulkCreateTasks?isBulkCreate=true';
        restClientServiceStub.put.and.returnValue(Observable.of(response));
        runner.queue(new SaveTaskAction(task));
        taskAddEffects.addTaskSave$.subscribe((result) => {
            expect(true).toEqual(result.payload);
            expect(restClientServiceStub.put).toHaveBeenCalledWith(apiUrl, task);
        });
    });


    it('should return "LoadAssignUserComplete" action on success of "LoadAssignUsers"', () => {
        let mockResponse: AtlasApiResponse<AssignUser> = MockStoreProviderFactory.getUsersStub();
        let mockedExtractedData = extractAssignUsers(mockResponse);
        let params: URLSearchParams = new URLSearchParams();
        params.set('fields', 'Id,FirstName,LastName,HasEmail,Email');
        params.set('pageNumber', '0');
        params.set('pageSize', '0');
        let options = new ResponseOptions({ body: mockResponse });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadAssignUsers(true));
        let expt = new LoadAssignUserComplete(mockedExtractedData);
        taskAddEffects.taskAssignedUsers$.subscribe((result) => {
            expect(expt).toEqual(result);
            expect(restClientServiceStub.get).toHaveBeenCalledWith('users', { search: params });
        });
    });

});