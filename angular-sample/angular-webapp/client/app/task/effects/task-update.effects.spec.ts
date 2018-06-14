import { fakeAsync, TestBed } from "@angular/core/testing";
import { EffectsTestingModule, EffectsRunner } from "@ngrx/effects/testing";
import { StoreModule } from "@ngrx/store";
import { TaskUpdateEffects } from "../../task/effects/task-update.effects";
import { MessengerService } from "../../shared/services/messenger.service";
import { ClaimsHelperService } from "../../shared/helpers/claims-helper";
import { ClaimsHelperServiceStub } from "../../shared/testing/mocks/claims-helper-service-mock";
import { RestClientService } from "../../shared/data/rest-client.service";
import { reducer } from "../../task/reducers/task-update.reducer";
import { TaskMocStoreProviderFactory } from "../../shared/testing/mocks/task-moc-store-provider-factory";
import { TasksView } from "../../task/models/task";
import { ResponseOptions } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { UpdateTaskAction, UpdateTaskCompletedAction } from "../../task/actions/task-update.actions";
import { LoadTasksAction } from "../../task/actions/task.list.actions";

describe('task update effect', () => {
    let taskUpdateEffects: TaskUpdateEffects;
    let runner: EffectsRunner;
    let restClientServiceStub: any;
    let taskUpdate: TasksView;

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule

            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            TaskUpdateEffects
            , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete']) } // useClass: RestClientServiceStub 
            , MessengerService
            , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        ]
        , declarations: [
        ]

    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        taskUpdateEffects = TestBed.get(TaskUpdateEffects);
        restClientServiceStub = TestBed.get(RestClientService);
    })

    it('update task effect', fakeAsync(() => {
        taskUpdate = TaskMocStoreProviderFactory.getTaskDetails();
        let options = new ResponseOptions({ body: taskUpdate });
        let response = new Response(options);
        restClientServiceStub.post.and.returnValue(Observable.of(response));
        const action = new UpdateTaskAction(taskUpdate);
        runner.queue(action);
        let expectedResult = [
            new UpdateTaskCompletedAction(true),
            new LoadTasksAction(true)
        ];
        taskUpdateEffects.taskUpdateData$.subscribe((result) => {
            expect(expectedResult).toContain(result);
        });
    }));
});