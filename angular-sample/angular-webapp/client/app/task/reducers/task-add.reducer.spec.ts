import { extractAssignUsers } from '../common/task-extract-helper';
import { MockStoreProviderFactory } from '../../shared/testing/mocks/mock-store-provider-factory';
import { Priority } from '../models/task-priority';
import { TasksView } from '../models/task';
import { addTasks, getAssignUsers, loadAddTaskForm, reducer, TaskAddState } from './task-add.reducer';
import { Observable } from 'rxjs/Rx';
import * as Immutable from 'immutable';

describe('Task add state', () => {

    let modifiedState: TaskAddState;
    let initialState: TaskAddState;

    beforeEach(() => {
        initialState = {
            status: false,
            entities: null,
            AssignUserState: {
                loadingAssignUsers: false,
                loadedAssignUsers: false,
                AssignUsers: null
            }
        };
    });

    it('should return the default state', () => {
        const action = {} as any;
        const result = reducer(initialState, action);
        expect(result).toEqual(initialState);
    });

    it('should return current state when no valid actions have been made', () => {
        const actual = reducer(initialState, { type: 'INVALID_ACTION', payload: {} });
        const expected = initialState;
        expect(actual).toBe(expected);
    });

    it('when actioned save task', () => {
        let task = new TasksView();
        task.Title = 'AUT Task';
        task.DueDate = new Date();
        task.AssignToAll = true;
        task.Priority = Priority.High;
        const actual = reducer(initialState, { type: '[TasksView] saved', payload: task });
        expect(actual.status).toBe(true);
    });

    it('when actioned load task form', () => {
        const actual = reducer(initialState, { type: '[TasksForm] Load task list', payload: true });
        expect(actual.status).toBe(false);
    });

    it('when actioned load assign users', () => {
        const actual = reducer(initialState, { type: '[AssignUser] Load assign users', payload: true });
        expect(actual.AssignUserState.loadedAssignUsers).toBe(false);
        expect(actual.AssignUserState.loadingAssignUsers).toBe(true);
    });

    it('when actioned load assign users complete', () => {
        let mockData = MockStoreProviderFactory.getUsersStub();
        let mockedExtractedData = extractAssignUsers(mockData);
        const actual = reducer(initialState, { type: '[AssignUser] Load assign users complete', payload: mockedExtractedData });
        expect(actual.AssignUserState.loadedAssignUsers).toBe(true);
        expect(actual.AssignUserState.loadingAssignUsers).toBe(false);
        expect(actual.AssignUserState.AssignUsers).toBe(mockedExtractedData);
    });


    describe('Functions in add task reducer', () => {
        let mockData = MockStoreProviderFactory.getUsersStub();
        let mockedExtractedData = extractAssignUsers(mockData);
        beforeEach(() => {
            modifiedState = {
                status: false,
                entities: null,
                AssignUserState: {
                    loadingAssignUsers: false,
                    loadedAssignUsers: true,
                    AssignUsers: mockedExtractedData
                }
            }
        });

        it('"addTasks" function should return  entities', () => {
            addTasks(Observable.of(modifiedState)).subscribe(val => {
                expect(val).toBeNull();
            });
        });

        it('"loadAddTaskForm" function should return status', () => {
            loadAddTaskForm(Observable.of(modifiedState)).subscribe(val => {
                expect(val).toBeFalsy();
            });
        });

        it('"getAssignUsers" function should return assigned users', () => {
            getAssignUsers(Observable.of(modifiedState)).subscribe(val => {
                expect(val).toEqual(mockedExtractedData);
            });
        });
    });
});
