import { Store } from '@ngrx/store';



import { MethodStatements, MethodStatement, MethodStatementStat } from './../models/method-statement';
import { AtlasApiRequestWithParams } from './../../shared/models/atlas-api-response';
import { AtlasApiResponse, AtlasParams } from './../../shared/models/atlas-api-response';
import * as methodStatementsActions from './../actions/methodstatements.actions';
import * as Immutable from 'immutable';
import {
    reducer,
    MethodStatementsState,
    getMethodStatementsListLoadingState,
    getHasMSFiltersChanged,
    getMSFilterApiRequest,
    getMethodStatementsStats,
    getLiveMethodStatementsList,
    getLiveMethodStatementsListTotalCount,
    getLiveMethodStatementsListDataTableOptions,
    getPendingMethodStatementsList,
    getPendingMethodStatementsListTotalCount,
    getPendingMethodStatementsListDataTableOptions,
    getCompletedMethodStatementsList,
    getCompletedMethodStatementsListTotalCount,
    getCompletedMethodStatementsListDataTableOptions,
    getArchivedMethodStatementsList,
    getArchivedMethodStatementsListTotalCount,
    getArchivedMethodStatementsListDataTableOptions,
    getExampleMethodStatementsList, getExampleMethodStatementsListTotalCount,
    getExampleMethodStatementsListDataTableOptions
} from './methodstatements.reducer';
import { MockStoreProviderFactory } from './../../shared/testing/mocks/mock-store-provider-factory';
import { DataTableOptions } from './../../atlas-elements/common/models/ae-datatable-options';
import { Observable } from 'rxjs/Rx';
import * as fromRoot from './../../shared/reducers/index';

describe('Method Statements State', () => {

    let atlasParamsArray: Array<any>;
    let sampleApiRequestParams: AtlasApiRequestWithParams;
    let mockedMethodStatementStats = MockStoreProviderFactory.getTestMethodStatementStats();
    let modifiedState: MethodStatementsState;

    let sampleResponse: AtlasApiResponse<MethodStatements> = MockStoreProviderFactory.getTestMethodStatementResponseData();

    let initialState: MethodStatementsState;

    let statsPayload = [{ "StatusId": -1, "Count": 272 }, { "StatusId": 0, "Count": 38 }, { "StatusId": 1, "Count": 2 }, { "StatusId": 4, "Count": 1 }];
    let store: Store<fromRoot.State>;
    let initialWholeState: fromRoot.State;

    beforeEach(() => {
        initialState = {
            hasMethodStatementsListLoaded: false,

            LiveMethodStatementsList: null,
            LiveMethodStatementsPagingInfo: null,

            PendingMethodStatementsList: null,
            PendingMethodStatementsPagingInfo: null,

            CompletedMethodStatementsList: null,
            CompletedMethodStatementsPagingInfo: null,

            ArchivedMethodStatementsList: null,
            ArchivedMethodStatementsPagingInfo: null,

            ExampleMethodStatementsList: null,
            ExampleMethodStatementsPagingInfo: null,

            apiRequestWithParams: null,
            hasMSFiltersChanged: false,
            filterWithParams: null,
            hasMethodStatementsStatsLoaded: false,
            methodStatementsStats: null
        }
        atlasParamsArray = [];
        sampleApiRequestParams = new AtlasApiRequestWithParams(0, 0, null, null, atlasParamsArray);
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

    it('should dispatch LOAD_METHOD_STATEMENTS_LIST action load method statements list ', () => {
        atlasParamsArray.push(new AtlasParams('ByStatusId', ''));
        atlasParamsArray.push(new AtlasParams('isexample', 'true'));
        const actual = reducer(initialState, { type: '[Method Statements] Load Projects List', payload: new AtlasApiRequestWithParams(0, 0, null, null, atlasParamsArray) });
        expect(actual.hasMethodStatementsListLoaded).toBe(false);
    });

    describe('it should dispatch LOAD_LIVE_METHOD_STATEMENTS_LIST_COMPLETE action  when loaded method statementlist successfully', () => {
        it('for the initial load Live method statements list paging information is null', () => {
            const actual = reducer(initialState, { type: '[Method Statements] Load Live Projects List Complete', payload: sampleResponse });
            expect(actual.hasMethodStatementsListLoaded).toBe(true);
            expect(actual.hasMSFiltersChanged).toBe(false);
            expect(actual.LiveMethodStatementsPagingInfo).toEqual(sampleResponse.PagingInfo);
            expect(actual.LiveMethodStatementsList).toEqual(sampleResponse.Entities);
        });

        it('after pending method statement list load complete', () => {
            initialState.LiveMethodStatementsPagingInfo = sampleResponse.PagingInfo;
            const actual = reducer(initialState, { type: '[Method Statements] Load Live Projects List Complete', payload: sampleResponse });
            expect(actual.hasMethodStatementsListLoaded).toBe(true);
            expect(actual.hasMSFiltersChanged).toBe(false);
            expect(actual.LiveMethodStatementsPagingInfo.PageNumber).toEqual(sampleResponse.PagingInfo.PageNumber);
            expect(actual.LiveMethodStatementsPagingInfo.Count).toEqual(sampleResponse.PagingInfo.Count);
            expect(actual.LiveMethodStatementsPagingInfo.TotalCount).toEqual(sampleResponse.PagingInfo.TotalCount);
            expect(actual.LiveMethodStatementsList).toEqual(sampleResponse.Entities);
        });


        it('when viewing records in other than first page ', () => {
            initialState.LiveMethodStatementsPagingInfo = sampleResponse.PagingInfo;
            let livePayload = sampleResponse;
            livePayload.PagingInfo.PageNumber = 2;
            const actual = reducer(initialState, { type: '[Method Statements] Load Live Projects List Complete', payload: livePayload });
            expect(actual.hasMethodStatementsListLoaded).toBe(true);
            expect(actual.hasMSFiltersChanged).toBe(false);
            expect(actual.LiveMethodStatementsPagingInfo.PageNumber).toEqual(livePayload.PagingInfo.PageNumber);
            expect(actual.LiveMethodStatementsPagingInfo.Count).toEqual(livePayload.PagingInfo.Count);
            expect(actual.LiveMethodStatementsList).toEqual(sampleResponse.Entities);
        });
    });

    describe('it should dispatch LOAD_PENDING_METHOD_STATEMENTS_LIST_COMPLETE action when loaded method statementlist successfully', () => {

        it('for the initial load pending method statements list paging information is null', () => {
            const actual = reducer(initialState, { type: '[Method Statements] Load Pending Projects List Complete', payload: sampleResponse });
            expect(actual.hasMethodStatementsListLoaded).toBe(true);
            expect(actual.hasMSFiltersChanged).toBe(false);
            expect(actual.PendingMethodStatementsPagingInfo).toEqual(sampleResponse.PagingInfo);
            expect(actual.PendingMethodStatementsList).toEqual(sampleResponse.Entities);
        });

        it('after pending method statement list load complete ', () => {
            initialState.PendingMethodStatementsPagingInfo = sampleResponse.PagingInfo;
            const actual = reducer(initialState, { type: '[Method Statements] Load Pending Projects List Complete', payload: sampleResponse });
            expect(actual.hasMethodStatementsListLoaded).toBe(true);
            expect(actual.hasMSFiltersChanged).toBe(false);
            expect(actual.PendingMethodStatementsPagingInfo.PageNumber).toEqual(sampleResponse.PagingInfo.PageNumber);
            expect(actual.PendingMethodStatementsPagingInfo.Count).toEqual(sampleResponse.PagingInfo.Count);
            expect(actual.PendingMethodStatementsPagingInfo.TotalCount).toEqual(sampleResponse.PagingInfo.TotalCount);
            expect(actual.PendingMethodStatementsList).toEqual(sampleResponse.Entities);
        });

        it('when viewing records in other than first page', () => {
            initialState.PendingMethodStatementsPagingInfo = sampleResponse.PagingInfo;
            let pendingPayload = sampleResponse;
            pendingPayload.PagingInfo.PageNumber = 2;
            const actual = reducer(initialState, { type: '[Method Statements] Load Pending Projects List Complete', payload: pendingPayload });
            expect(actual.hasMethodStatementsListLoaded).toBe(true);
            expect(actual.hasMSFiltersChanged).toBe(false);
            expect(actual.PendingMethodStatementsPagingInfo.PageNumber).toEqual(pendingPayload.PagingInfo.PageNumber);
            expect(actual.PendingMethodStatementsPagingInfo.Count).toEqual(pendingPayload.PagingInfo.Count);
            expect(actual.PendingMethodStatementsList).toEqual(sampleResponse.Entities);
        });

    });

    describe('it should dispatch LOAD_COMPLETED_METHOD_STATEMENTS_LIST_COMPLETE action when loaded method statementlist successfully', () => {

        it('for the initial load completed method statements list paging information is null', () => {
            const actual = reducer(initialState, { type: '[Method Statements] Load Completed Projects List Complete', payload: sampleResponse });
            expect(actual.hasMethodStatementsListLoaded).toBe(true);
            expect(actual.hasMSFiltersChanged).toBe(false);
            expect(actual.CompletedMethodStatementsList).toEqual(sampleResponse.Entities);
        });

        it('after completed method statement list load complete ', () => {
            initialState.CompletedMethodStatementsPagingInfo = sampleResponse.PagingInfo;
            const actual = reducer(initialState, { type: '[Method Statements] Load Completed Projects List Complete', payload: sampleResponse });
            expect(actual.hasMethodStatementsListLoaded).toBe(true);
            expect(actual.hasMSFiltersChanged).toBe(false);
            expect(actual.CompletedMethodStatementsPagingInfo.PageNumber).toEqual(sampleResponse.PagingInfo.PageNumber);
            expect(actual.CompletedMethodStatementsPagingInfo.Count).toEqual(sampleResponse.PagingInfo.Count);
            expect(actual.CompletedMethodStatementsPagingInfo.TotalCount).toEqual(sampleResponse.PagingInfo.TotalCount);
            expect(actual.CompletedMethodStatementsList).toEqual(sampleResponse.Entities);
        });

        it('when viewing records in other than first page', () => {
            initialState.CompletedMethodStatementsPagingInfo = sampleResponse.PagingInfo;
            let completedPayload = sampleResponse;
            completedPayload.PagingInfo.PageNumber = 2;
            const actual = reducer(initialState, { type: '[Method Statements] Load Completed Projects List Complete', payload: completedPayload });
            expect(actual.hasMethodStatementsListLoaded).toBe(true);
            expect(actual.hasMSFiltersChanged).toBe(false);
            expect(actual.CompletedMethodStatementsPagingInfo.PageNumber).toEqual(completedPayload.PagingInfo.PageNumber);
            expect(actual.CompletedMethodStatementsPagingInfo.Count).toEqual(completedPayload.PagingInfo.Count);
            expect(actual.CompletedMethodStatementsList).toEqual(sampleResponse.Entities);
        });

    });

    describe('it should dispatch LOAD_ARCHIEVED_METHOD_STATEMENTS_LIST_COMPLETE action when loaded method statementlist successfully', () => {

        it('for the initial load archived method statements list paging information is null', () => {
            const actual = reducer(initialState, { type: '[Method Statements] Load Archieved Projects List Complete', payload: sampleResponse });
            expect(actual.hasMethodStatementsListLoaded).toBe(true);
            expect(actual.hasMSFiltersChanged).toBe(false);
            expect(actual.ArchivedMethodStatementsList).toEqual(sampleResponse.Entities);
        });

        it('after archived method statement list load complete ', () => {
            initialState.ArchivedMethodStatementsPagingInfo = sampleResponse.PagingInfo;
            const actual = reducer(initialState, { type: '[Method Statements] Load Archieved Projects List Complete', payload: sampleResponse });
            expect(actual.hasMethodStatementsListLoaded).toBe(true);
            expect(actual.hasMSFiltersChanged).toBe(false);
            expect(actual.ArchivedMethodStatementsPagingInfo.PageNumber).toEqual(sampleResponse.PagingInfo.PageNumber);
            expect(actual.ArchivedMethodStatementsPagingInfo.Count).toEqual(sampleResponse.PagingInfo.Count);
            expect(actual.ArchivedMethodStatementsPagingInfo.TotalCount).toEqual(sampleResponse.PagingInfo.TotalCount);
            expect(actual.ArchivedMethodStatementsList).toEqual(sampleResponse.Entities);
        });

        it('when viewing records in other than first page', () => {
            initialState.ArchivedMethodStatementsPagingInfo = sampleResponse.PagingInfo;
            let archivedPayload = sampleResponse;
            archivedPayload.PagingInfo.PageNumber = 2;
            const actual = reducer(initialState, { type: '[Method Statements] Load Archieved Projects List Complete', payload: archivedPayload });
            expect(actual.hasMethodStatementsListLoaded).toBe(true);
            expect(actual.hasMSFiltersChanged).toBe(false);
            expect(actual.ArchivedMethodStatementsPagingInfo.PageNumber).toEqual(archivedPayload.PagingInfo.PageNumber);
            expect(actual.ArchivedMethodStatementsPagingInfo.Count).toEqual(archivedPayload.PagingInfo.Count);
            expect(actual.ArchivedMethodStatementsList).toEqual(sampleResponse.Entities);
        });

    });


    describe('it should dispatch LOAD_EXAMPLE_METHOD_STATEMENTS_LIST_COMPLETE action when loaded method statementlist successfully', () => {

        it('for the initial load example method statements list paging information is null', () => {
            const actual = reducer(initialState, { type: '[Method Statements] Load Example Projects List Complete', payload: sampleResponse });
            expect(actual.hasMethodStatementsListLoaded).toBe(true);
            expect(actual.hasMSFiltersChanged).toBe(false);
            expect(actual.ExampleMethodStatementsList).toEqual(sampleResponse.Entities);
        });

        it('after example method statement list load complete ', () => {
            initialState.ExampleMethodStatementsPagingInfo = sampleResponse.PagingInfo;
            const actual = reducer(initialState, { type: '[Method Statements] Load Example Projects List Complete', payload: sampleResponse });
            expect(actual.hasMethodStatementsListLoaded).toBe(true);
            expect(actual.hasMSFiltersChanged).toBe(false);
            expect(actual.ExampleMethodStatementsPagingInfo.PageNumber).toEqual(sampleResponse.PagingInfo.PageNumber);
            expect(actual.ExampleMethodStatementsPagingInfo.Count).toEqual(sampleResponse.PagingInfo.Count);
            expect(actual.ExampleMethodStatementsPagingInfo.TotalCount).toEqual(sampleResponse.PagingInfo.TotalCount);
            expect(actual.ExampleMethodStatementsList).toEqual(sampleResponse.Entities);
        });

        it('when viewing records in other than first page', () => {
            initialState.ExampleMethodStatementsPagingInfo = sampleResponse.PagingInfo;
            let ExamplePayload = sampleResponse;
            ExamplePayload.PagingInfo.PageNumber = 2;
            const actual = reducer(initialState, { type: '[Method Statements] Load Example Projects List Complete', payload: ExamplePayload });
            expect(actual.hasMethodStatementsListLoaded).toBe(true);
            expect(actual.hasMSFiltersChanged).toBe(false);
            expect(actual.ExampleMethodStatementsPagingInfo.PageNumber).toEqual(ExamplePayload.PagingInfo.PageNumber);
            expect(actual.ExampleMethodStatementsPagingInfo.Count).toEqual(ExamplePayload.PagingInfo.Count);
            expect(actual.ExampleMethodStatementsList).toEqual(sampleResponse.Entities);
        });

    });

    it('should dispatch LOAD_METHOD_STATEMENTS_FILTERS_CHANGED action when filters are changed when in Live Tab', () => {
        atlasParamsArray.push(new AtlasParams('ByStatusId', 1));
        atlasParamsArray.push(new AtlasParams('isexample', false));
        atlasParamsArray.push(new AtlasParams('ByNameOrReference', 'nametest'));
        atlasParamsArray.push(new AtlasParams('MSBySiteId', 'AB22680F-3E63-4D75-B226-8C43414D2F72'));
        sampleApiRequestParams.Params = atlasParamsArray;

        initialState.apiRequestWithParams = sampleApiRequestParams;
        const actual = reducer(initialState, { type: '[Method Statements] Load Filter Changed', payload: sampleApiRequestParams });
        expect(actual.hasMSFiltersChanged).toBe(true);
        expect(actual.ExampleMethodStatementsList).toBeNull();
        expect(actual.PendingMethodStatementsList).toBeNull();
        expect(actual.ArchivedMethodStatementsList).toBeNull();
        expect(actual.CompletedMethodStatementsList).toBeNull();
        expect(actual.filterWithParams).toEqual(sampleApiRequestParams);
    });

    it('should dispatch LOAD_METHOD_STATEMENTS_FILTERS_CHANGED action when filters are changed when in Pending Tab', () => {
        atlasParamsArray.push(new AtlasParams('ByStatusId', 0));
        atlasParamsArray.push(new AtlasParams('isexample', false));
        atlasParamsArray.push(new AtlasParams('ByNameOrReference', 'nametest'));
        atlasParamsArray.push(new AtlasParams('MSBySiteId', 'AB22680F-3E63-4D75-B226-8C43414D2F72'));
        sampleApiRequestParams.Params = atlasParamsArray;

        initialState.apiRequestWithParams = sampleApiRequestParams;
        const actual = reducer(initialState, { type: '[Method Statements] Load Filter Changed', payload: sampleApiRequestParams });
        expect(actual.hasMSFiltersChanged).toBe(true);
        expect(actual.ExampleMethodStatementsList).toBeNull();
        expect(actual.LiveMethodStatementsList).toBeNull();
        expect(actual.ArchivedMethodStatementsList).toBeNull();
        expect(actual.CompletedMethodStatementsList).toBeNull();
        expect(actual.filterWithParams).toEqual(sampleApiRequestParams);
    });


    it('should dispatch LOAD_METHOD_STATEMENTS_FILTERS_CHANGED action when filters are changed when in Completed tab', () => {
        atlasParamsArray.push(new AtlasParams('ByStatusId', 3));
        atlasParamsArray.push(new AtlasParams('isexample', false));
        atlasParamsArray.push(new AtlasParams('ByNameOrReference', 'nametest'));
        atlasParamsArray.push(new AtlasParams('MSBySiteId', 'AB22680F-3E63-4D75-B226-8C43414D2F72'));
        sampleApiRequestParams.Params = atlasParamsArray;

        initialState.apiRequestWithParams = sampleApiRequestParams;
        const actual = reducer(initialState, { type: '[Method Statements] Load Filter Changed', payload: sampleApiRequestParams });
        expect(actual.hasMSFiltersChanged).toBe(true);
        expect(actual.ExampleMethodStatementsList).toBeNull();
        expect(actual.LiveMethodStatementsList).toBeNull();
        expect(actual.ArchivedMethodStatementsList).toBeNull();
        expect(actual.PendingMethodStatementsList).toBeNull();
        expect(actual.filterWithParams).toEqual(sampleApiRequestParams);
    });

    it('should dispatch LOAD_METHOD_STATEMENTS_FILTERS_CHANGED action when filters are changed when in Archived Tab', () => {
        atlasParamsArray.push(new AtlasParams('ByStatusId', 4));
        atlasParamsArray.push(new AtlasParams('isexample', false));
        atlasParamsArray.push(new AtlasParams('ByNameOrReference', 'nametest'));
        atlasParamsArray.push(new AtlasParams('MSBySiteId', 'AB22680F-3E63-4D75-B226-8C43414D2F72'));
        sampleApiRequestParams.Params = atlasParamsArray;

        initialState.apiRequestWithParams = sampleApiRequestParams;
        const actual = reducer(initialState, { type: '[Method Statements] Load Filter Changed', payload: sampleApiRequestParams });
        expect(actual.hasMSFiltersChanged).toBe(true);
        expect(actual.ExampleMethodStatementsList).toBeNull();
        expect(actual.LiveMethodStatementsList).toBeNull();
        expect(actual.CompletedMethodStatementsList).toBeNull();
        expect(actual.PendingMethodStatementsList).toBeNull();
        expect(actual.filterWithParams).toEqual(sampleApiRequestParams);
    });

    it('should dispatch LOAD_METHOD_STATEMENTS_FILTERS_CHANGED action when filters are changed when in Example Tab', () => {
        atlasParamsArray.push(new AtlasParams('ByStatusId', 4));
        atlasParamsArray.push(new AtlasParams('isexample', true));
        atlasParamsArray.push(new AtlasParams('ByNameOrReference', 'nametest'));
        atlasParamsArray.push(new AtlasParams('MSBySiteId', 'AB22680F-3E63-4D75-B226-8C43414D2F72'));
        sampleApiRequestParams.Params = atlasParamsArray;

        initialState.apiRequestWithParams = sampleApiRequestParams;
        const actual = reducer(initialState, { type: '[Method Statements] Load Filter Changed', payload: sampleApiRequestParams });
        expect(actual.hasMSFiltersChanged).toBe(true);
        expect(actual.ArchivedMethodStatementsList).toBeNull();
        expect(actual.LiveMethodStatementsList).toBeNull();
        expect(actual.CompletedMethodStatementsList).toBeNull();
        expect(actual.PendingMethodStatementsList).toBeNull();
    });



    it('should dispatch LOAD_METHOD_STATEMENTS_STATS action to load Method statement Stats ', () => {
        const actual = reducer(initialState, { type: '[Method Statements] Load Projects Count', payload: {} });
        expect(actual.hasMethodStatementsStatsLoaded).toBe(false);
    });

    it('should dispatch LOAD_METHOD_STATEMENTS_STATS_COMPLETE action when method statements stats loaded successfully', () => {
        const actual = reducer(initialState, { type: '[Method Statements] Load Live Projects Count Complete', payload: statsPayload });
        expect(actual.hasMethodStatementsStatsLoaded).toBe(true);
        expect(actual.methodStatementsStats).toEqual(statsPayload);
    });

    it('should dispatch LOAD_METHOD_STATEMENTS_TAB_CHANGED action when navigated from one tab to Other ', () => {
        atlasParamsArray.push(new AtlasParams('ByStatusId', ''));
        atlasParamsArray.push(new AtlasParams('isexample', 'true'));
        sampleApiRequestParams.Params = atlasParamsArray;
        const actual = reducer(initialState, { type: '[Method Statements] Load Tab Changed', payload: sampleApiRequestParams });
        expect(actual.apiRequestWithParams).toEqual(sampleApiRequestParams);
    });



    it('should dispatch UPDATE_STATUS_METHOD_STATEMENT_COMPLETE action when method statement Archived in Live Tab ', () => {
        initialState.apiRequestWithParams = sampleApiRequestParams;
        atlasParamsArray.push(new AtlasParams('ByStatusId', 1));
        atlasParamsArray.push(new AtlasParams('isexample', false));
        atlasParamsArray.push(new AtlasParams('ByStatusIdOnUpdate', 1));

        const actual = reducer(initialState, { type: '[Method Statements]  update particular status in method statement complete', payload: new AtlasApiRequestWithParams(0, 0, null, null, atlasParamsArray) });
        expect(actual.hasMSFiltersChanged).toEqual(true);
        expect(actual.ExampleMethodStatementsList).toBeNull();
    });

    it('should dispatch UPDATE_STATUS_METHOD_STATEMENT_COMPLETE action when method statement Archived in completed Tab ', () => {
        initialState.apiRequestWithParams = sampleApiRequestParams;
        atlasParamsArray.push(new AtlasParams('ByStatusId', 3));
        atlasParamsArray.push(new AtlasParams('isexample', false));
        atlasParamsArray.push(new AtlasParams('ByStatusIdOnUpdate', 3));

        const actual = reducer(initialState, { type: '[Method Statements]  update particular status in method statement complete', payload: new AtlasApiRequestWithParams(0, 0, null, null, atlasParamsArray) });
        expect(actual.hasMSFiltersChanged).toEqual(true);
        expect(actual.ExampleMethodStatementsList).toBeNull();
    });

    it('should dispatch UPDATE_STATUS_METHOD_STATEMENT_COMPLETE action when method statement re-instated in Archived TAb ', () => {
        initialState.apiRequestWithParams = sampleApiRequestParams;
        atlasParamsArray.push(new AtlasParams('ByStatusId', 4));
        atlasParamsArray.push(new AtlasParams('isexample', false));
        atlasParamsArray.push(new AtlasParams('ByStatusIdOnUpdate', 4));

        const actual = reducer(initialState, { type: '[Method Statements]  update particular status in method statement complete', payload: new AtlasApiRequestWithParams(0, 0, null, null, atlasParamsArray) });
        expect(actual.hasMSFiltersChanged).toEqual(true);
        expect(actual.ExampleMethodStatementsList).toBeNull();
        expect(actual.ArchivedMethodStatementsList).toBeNull();
    });

    it('should dispatch COPY_METHOD_STATEMENT_COMPLETE action when method statement is copied successfully', () => {
        const actual = reducer(initialState, { type: '[Method Statements]  copy method statement complete', payload: true });
        expect(actual).toEqual(initialState);
    });

    it('should dispatch COPY_METHOD_STATEMENT_COMPLETE action when method statement is not copied successfully', () => {
        const actual = reducer(initialState, { type: '[Method Statements]  copy method statement complete', payload: false });
        expect(actual).toEqual(initialState);
    });

    it('should dispatch CLEAR_METHOD_STATEMENT_STATE action to clear state', () => {
        const actual = reducer(initialState, { type: '[Method Statements]  clear method statement after approve', payload: false });
        expect(actual).toEqual(initialState);
    });

    it('should dispatch UPDATE_METHODSTATEMENT action when updating method statement in Pending Tab', () => {
        const actual = reducer(initialState, { type: '[Method Statements]  update method statement', payload: false });
        expect(actual.PendingMethodStatementsList).toBeNull();
        expect(actual.PendingMethodStatementsPagingInfo).toBeNull();
    });

    describe('Functions in the Method Statement reducer', () => {

        beforeEach(() => {
            store = MockStoreProviderFactory.createInitialStore();
            store.subscribe(s => { initialWholeState = s; });

            modifiedState = {
                hasMethodStatementsListLoaded: true,

                LiveMethodStatementsList: sampleResponse.Entities,
                LiveMethodStatementsPagingInfo: sampleResponse.PagingInfo,

                PendingMethodStatementsList: sampleResponse.Entities,
                PendingMethodStatementsPagingInfo: sampleResponse.PagingInfo,

                CompletedMethodStatementsList: sampleResponse.Entities,
                CompletedMethodStatementsPagingInfo: sampleResponse.PagingInfo,

                ArchivedMethodStatementsList: sampleResponse.Entities,
                ArchivedMethodStatementsPagingInfo: sampleResponse.PagingInfo,

                ExampleMethodStatementsList: sampleResponse.Entities,
                ExampleMethodStatementsPagingInfo: sampleResponse.PagingInfo,

                apiRequestWithParams: sampleApiRequestParams,
                hasMSFiltersChanged: true,
                filterWithParams: sampleApiRequestParams,
                hasMethodStatementsStatsLoaded: true,
                methodStatementsStats: statsPayload,
            };
            initialWholeState.methodStatementsState = modifiedState;
        });

        it('function should return loading state of method statement list when getMethodStatementsListLoadingState method was called', () => {
            (store.let(fromRoot.getMethodStatementsListLoadingState)).subscribe(val => {
                expect(val).toEqual(modifiedState.hasMethodStatementsListLoaded);
            });
        });

        it('function should return filter changed status when getHasMSFiltersChanged method was called', () => {
            (store.let(fromRoot.getHasMSFiltersChangedData)).subscribe(val => {
                expect(val).toEqual(modifiedState.hasMSFiltersChanged);
            });
        });

        it('function should return filter changed status when getMSFilterApiRequest method was called', () => {
            (store.let(fromRoot.getMSFilterApiRequest)).subscribe(val => {
                expect(val).toEqual(modifiedState.filterWithParams);
            });
        });

        it('function should return method statement stats when getMethodStatementsStats method was called', () => {
            (store.let(fromRoot.getMethodStatementsStats)).subscribe(val => {
                expect(val).toEqual(modifiedState.methodStatementsStats);
            });
        });

        it('function should return live method statements list  when getLiveMethodStatementsList method was called', () => {
            (store.let(fromRoot.getLiveMethodStatementsList)).subscribe(val => {
                expect(val).toEqual(Immutable.List<MethodStatements>((modifiedState.LiveMethodStatementsList)));
            });
        });

        it('function should return live method statements list total count when getLiveMethodStatementsListTotalCount method was called', () => {
            (store.let(fromRoot.getLiveMethodStatementsListTotalCount)).subscribe(val => {
                expect(val).toEqual(modifiedState.LiveMethodStatementsPagingInfo.TotalCount);
            });
        });

        it('function should return live method statements list data table options when getLiveMethodStatementsListDataTableOptions method was called', () => {
            let pagingInformation = modifiedState.LiveMethodStatementsPagingInfo;
            let dataTableOptions = new DataTableOptions(pagingInformation.PageNumber, pagingInformation.Count, sampleApiRequestParams.SortBy.SortField, sampleApiRequestParams.SortBy.Direction);
            (store.let(fromRoot.getLiveMethodStatementsListDataTableOptions)).subscribe(val => {
                expect(val).toEqual(dataTableOptions);
            });
        });

        it('function should return pending method statements list  when getPendingMethodStatementsList method was called', () => {
            (store.let(fromRoot.getLiveMethodStatementsList)).subscribe(val => {
                expect(val).toEqual(Immutable.List<MethodStatements>((modifiedState.PendingMethodStatementsList)));
            });
        });

        it('function should return pending method statements list total count when getPendingMethodStatementsListTotalCount method was called', () => {
            (store.let(fromRoot.getPendingMethodStatementsListTotalCount)).subscribe(val => {
                expect(val).toEqual(modifiedState.PendingMethodStatementsPagingInfo.TotalCount);
            });
        });

        it('function should return pending method statements list data table options when getPendingMethodStatementsListDataTableOptions method was called', () => {
            let pagingInformation = modifiedState.PendingMethodStatementsPagingInfo;
            let dataTableOptions = new DataTableOptions(pagingInformation.PageNumber, pagingInformation.Count, sampleApiRequestParams.SortBy.SortField, sampleApiRequestParams.SortBy.Direction);
            (store.let(fromRoot.getPendingMethodStatementsListDataTableOptions)).subscribe(val => {
                expect(val).toEqual(dataTableOptions);
            });
        });

        it('function should return completed method statements list  when getCompletedMethodStatementsList method was called', () => {
            (store.let(fromRoot.getCompletedMethodStatementsList)).subscribe(val => {
                expect(val).toEqual(Immutable.List<MethodStatements>((modifiedState.CompletedMethodStatementsList)));
            });
        });

        it('function should return completed method statements list total count when getCompletedMethodStatementsListTotalCount method was called', () => {
            (store.let(fromRoot.getCompletedMethodStatementsListTotalCount)).subscribe(val => {
                expect(val).toEqual(modifiedState.CompletedMethodStatementsPagingInfo.TotalCount);
            });
        });

        it('function should return completed method statements list data table options when getCompletedMethodStatementsListDataTableOptions method was called', () => {
            let pagingInformation = modifiedState.CompletedMethodStatementsPagingInfo;
            let dataTableOptions = new DataTableOptions(pagingInformation.PageNumber, pagingInformation.Count, sampleApiRequestParams.SortBy.SortField, sampleApiRequestParams.SortBy.Direction);
            (store.let(fromRoot.getCompletedMethodStatementsListDataTableOptions)).subscribe(val => {
                expect(val).toEqual(dataTableOptions);
            });
        });

        it('function should return archived method statements list  when getArchivedMethodStatementsList method was called', () => {
            (store.let(fromRoot.getArchivedMethodStatementsList)).subscribe(val => {
                expect(val).toEqual(Immutable.List<MethodStatements>((modifiedState.ArchivedMethodStatementsList)));
            });
        });

        it('function should return archived method statements list total count when getArchivedMethodStatementsListTotalCount method was called', () => {
            (store.let(fromRoot.getArchivedMethodStatementsListTotalCount)).subscribe(val => {
                expect(val).toEqual(modifiedState.ArchivedMethodStatementsPagingInfo.TotalCount);
            });
        });

        it('function should return archived method statements list data table options when getArchivedMethodStatementsListDataTableOptions method was called', () => {
            let pagingInformation = modifiedState.ArchivedMethodStatementsPagingInfo;
            let dataTableOptions = new DataTableOptions(pagingInformation.PageNumber, pagingInformation.Count, sampleApiRequestParams.SortBy.SortField, sampleApiRequestParams.SortBy.Direction);
            (store.let(fromRoot.getArchivedMethodStatementsListDataTableOptions)).subscribe(val => {
                expect(val).toEqual(dataTableOptions);
            });
        });

        it('function should return example method statements list  when getExampleMethodStatementsList method was called', () => {
            (store.let(fromRoot.getExampleMethodStatementsList)).subscribe(val => {
                expect(val).toEqual(Immutable.List<MethodStatements>((modifiedState.ExampleMethodStatementsList)));
            });
        });

        it('function should return example method statements list total count when getExampleMethodStatementsListTotalCount method was called', () => {
            (store.let(fromRoot.getExampleMethodStatementsListTotalCount)).subscribe(val => {
                expect(val).toEqual(modifiedState.ExampleMethodStatementsPagingInfo.TotalCount);
            });
        });

        it('function should return example method statements list data table options when getExampleMethodStatementsListDataTableOptions method was called', () => {
            let pagingInformation = modifiedState.ExampleMethodStatementsPagingInfo;
            let dataTableOptions = new DataTableOptions(pagingInformation.PageNumber, pagingInformation.Count, sampleApiRequestParams.SortBy.SortField, sampleApiRequestParams.SortBy.Direction);
            (store.let(fromRoot.getExampleMethodStatementsListDataTableOptions)).subscribe(val => {
                expect(val).toEqual(dataTableOptions);
            });
        });

    });
});







