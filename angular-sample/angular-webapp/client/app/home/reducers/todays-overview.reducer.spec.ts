import { Store } from '@ngrx/store';
import { fakeAsync } from '@angular/core/testing';
import { StatisticsInformation } from './../models/statistics-information';
import { TodaysOverviewState, reducer, getTodaysOverviewData, getTodaysOverviewLoadingState } from './todays-overview.reducer';
import { AtlasApiRequestWithParams } from './../../shared/models/atlas-api-response';
import { AtlasApiResponse, AtlasParams, AtlasApiRequest } from './../../shared/models/atlas-api-response';
import * as TodaysOverviewLoadAction from './../actions/todays-overview.actions';
import { TodaysOverviewLoadCompleteAction } from './../actions/todays-overview.actions';
import * as Immutable from 'immutable';
import { MockStoreProviderFactory } from './../../shared/testing/mocks/mock-store-provider-factory';
import { PagingInfo } from './../../atlas-elements/common/models/ae-paging-info';
import { Observable } from 'rxjs';
import * as fromRoot from './../../shared/reducers/index';

describe('Today Overview State', () => {
    let atlasParamsArray: Array<any>;
    let sampleApiRequestParams: AtlasApiRequestWithParams;
    let sampleApiRequest: AtlasApiRequest;

    let initialState: TodaysOverviewState<string>;
    let modifiedState: TodaysOverviewState<string>;
    let statisticsInfo: any;
    let store: Store<fromRoot.State>;
    let initialWholeState: fromRoot.State;

    beforeEach(() => {
        initialState = {
            loading: false,
            loaded: false,
            entities: null,
        };
        statisticsInfo = MockStoreProviderFactory.getMockTestTodayOverview();
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

    it('it should dispatch TODAYS_OVERVIEW_LOAD action to load the list of TODAYS OVERVIEW List screen', () => {
        const actual = reducer(initialState, { type: '[Todays Overview] Load todays overview', payload: {} });
        expect(actual.loading).toBe(true);
    });

    it('it should dispatch TODAYS_OVERVIEW_LOAD_COMPLETE action to load the list of TODAYS OVERVIEW LOAD COMPLETE  List screen', () => {
        const actual = reducer(initialState, { type: '[Todays Overview] Load todays overview complete', payload: statisticsInfo });
        expect(actual.entities).toEqual(statisticsInfo);
    });

    describe('Functions in the Today Overview reducer', () => {
        beforeEach(() => {
            store = MockStoreProviderFactory.createInitialStore();
            store.subscribe(s => { initialWholeState = s; })
            modifiedState = reducer(initialState, { type: '[Todays Overview] Load todays overview complete', payload: statisticsInfo });
            initialWholeState.todaysOverviewState = modifiedState;
        });
        it('function should return entities when getTodaysOverviewData method was called', () => {
            store.let(fromRoot.getTOData).subscribe(results => {
                expect(results).toEqual(modifiedState.entities);
            });
        });
        it('function should return Loading status when getTodaysOverviewLoadingState method was called', () => {
            store.let(fromRoot.getTOLoadingState).subscribe(status => {
                expect(status).toEqual(modifiedState.loading);
            });
        });
    });

});
