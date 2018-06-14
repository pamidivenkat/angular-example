import { Observable } from 'rxjs/Rx';
import { TaskInformationBannerState } from './task-information-bar.reducer';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { reducer } from './task-information-bar.reducer';
import { LoadTaskHeadBannerAction, LoadTaskHeadBannerCompleteAction } from '../actions/task-information-bar.actions';
import { getTasksInformationBarItems } from '../../task/effects/task-information-bar.effects.spec';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../shared/reducers/index';
import { MockStoreProviderFactory } from '../../shared/testing/mocks/mock-store-provider-factory';

describe('task-head-banner-reducer', () => {
    let initalState: TaskInformationBannerState;
    let mockPayload;
    let store: Store<fromRoot.State>;
    let modifiedState: TaskInformationBannerState;
    let initialWholeState: fromRoot.State;
    beforeEach(() => {
        mockPayload = getTasksInformationBarItems();
        initalState = {
            status: false,
            entities: []
        };
    });

    it('should return the default state', () => {
        const action = {} as any;
        const result = reducer(initalState, action);
        expect(result).toEqual(initalState);
    });

    it('should return current state when no valid actions have been made', () => {
        const actual = reducer(initalState, { type: 'INVALID_ACTION', payload: {} });
        const expected = initalState;
        expect(actual).toBe(expected);
    });

    it('should return status false after first store action LOAD_TASKHEADBANNER is dispatched', () => {
        const actual = reducer(initalState, { type: '[TaskHeadBanner] Load task list' });
        expect(actual.status).toBe(false);
    });

    it('should return status true, after first store action LOAD_TASKHEADBANNER_COMPLETE is dispatched', () => {
        const actual = reducer(initalState, { type: '[TaskHeadBanner] Load task list complete', payload: mockPayload });
        expect(actual.status).toBe(true);
        expect(actual.entities).toEqual(mockPayload);
    });

    it('function should return tasks information bar items when getTaskHeadBannerData method was called', () => {
        store = MockStoreProviderFactory.createInitialStore();
        store.subscribe(s => { initialWholeState = s; })
        modifiedState = reducer(initalState, { type: '[TaskHeadBanner] Load task list complete', payload: mockPayload });
        initialWholeState.taskInformationBannerState = modifiedState;
        (store.let(fromRoot.getTaskHeadBannerData)).subscribe(val => {
            expect(val).toEqual(modifiedState.entities);
        });
    });
});
