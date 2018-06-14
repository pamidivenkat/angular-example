import { TaskUpdateState, reducer } from "../../task/reducers/task-update.reducer";
import { fakeAsync, tick } from "@angular/core/testing";
import { TasksView } from "../../task/models/task";
import { TaskMocStoreProviderFactory } from "../../shared/testing/mocks/task-moc-store-provider-factory";

describe('task update reducer', () => {
    let initalState: TaskUpdateState;
    let taskUpdate: TasksView;
    let entities;

    beforeEach(() => {
        initalState = {
            taskToUpdate: null,
            updating: false,
            updated: false
        };
        taskUpdate = TaskMocStoreProviderFactory.getTaskDetails();
    });

    it('should call update task state with selected task', fakeAsync(() => {
        const actual = reducer(initalState, { type: '[TasksView] update form to save', payload: taskUpdate });
        tick();
        expect(actual.updating).toBe(true);
        expect(actual.taskToUpdate).toEqual(taskUpdate);
    }));

    it('should call update task complete state', fakeAsync(() => {
        const actual = reducer(initalState, { type: '[TasksView] updated completed', payload: true });
        tick();
        expect(actual.updated).toBe(true);
    }));

});