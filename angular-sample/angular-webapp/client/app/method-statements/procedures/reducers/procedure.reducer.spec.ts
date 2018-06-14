import { Store } from '@ngrx/store';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AtlasApiResponse, AtlasApiRequest, AtlasParams } from './../../../shared/models/atlas-api-response';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import * as procedureActions from './../actions/procedure-actions';
import * as Immutable from 'immutable';
import { Procedure } from '../models/procedure';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import {
    reducer,
    ProcedureState,
    getProcedureListDataTotalCount,
    getProcedureListLoadingState,
    getProcedureList,
    getProcedureListTotalCount,
    getExampleProcedureListTotalCount,
    getProcedureListDataTableOptions,
    getCopiedProcedure,
    getSelectedFullEnityProcedure
} from './procedure.reducer';
import { Observable } from 'rxjs/Rx';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import * as fromRoot from './../../../shared/reducers/index';

describe('Procedure State', () => {

    let atlasParamsArray: Array<any>;
    let sampleApiRequestParams: AtlasApiRequestWithParams;
    let sampleResponse: AtlasApiResponse<Procedure>
    let initialState: ProcedureState;
    let modifiedState: ProcedureState;
    let store: Store<fromRoot.State>;
    let initialWholeState: fromRoot.State;
    
    beforeEach(() => {
        initialState = {
            HasProcedureListLoaded: false,
            CustomProcedureRequest: null,
            copiedProcedureId: null,
            ProcedureList: null,
            ProcedurePagingInfo: null,
            HasSelectedProcedureListLoaded: false,
            IsSelectedProcedureAdded: false,
            SelectedProcedure: null,
            IsSelectedProcedureUpdated: false,
            SelectedFullEnityProcedure: null,
            exampleProceduresTotalCount: null,
            proceduresTotalCount: null
        };
        sampleApiRequestParams = new AtlasApiRequestWithParams(1, 10, null, null, [new AtlasParams("example", false)]);
        sampleResponse = MockStoreProviderFactory.getTestProcedures();

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

    it('it should dispatch LOAD_PROCEDURES action to load the list of Procedures', () => {
        const actual = reducer(initialState, { type: '[PROCEDURES] Load procedures', payload: sampleApiRequestParams });
        expect(actual.HasProcedureListLoaded).toBe(true);
        expect(actual.CustomProcedureRequest).toEqual(sampleApiRequestParams);
    });

    describe('it should dispatch LOAD_PROCEDURES_COMPLETE action when successfully loaded list', () => {
        it('for the initial loading of list screen paging information is null', () => {
            const actual = reducer(initialState, { type: '[PROCEDURES] Load procedures complete', payload: sampleResponse });
            expect(actual.ProcedurePagingInfo).toEqual(sampleResponse.PagingInfo);
            expect(actual.HasProcedureListLoaded).toBe(false);
        });

        it('once the list is loaded paging information is available', () => {
            initialState.ProcedurePagingInfo = new PagingInfo(0, 0, 0, 0);
            const actual = reducer(initialState, { type: '[PROCEDURES] Load procedures complete', payload: sampleResponse });
            expect(actual.HasProcedureListLoaded).toBe(false);
            expect(actual.ProcedurePagingInfo.PageNumber).toEqual(sampleResponse.PagingInfo.PageNumber);
            expect(actual.ProcedurePagingInfo.Count).toEqual(sampleResponse.PagingInfo.Count);
            expect(actual.ProcedurePagingInfo.TotalCount).toEqual(sampleResponse.PagingInfo.TotalCount);
        });
        it('when page is changed to view records other than first page', () => {
            initialState.ProcedurePagingInfo = new PagingInfo(0, 0, 0, 0);
            const actual = reducer(initialState, { type: '[PROCEDURES] Load procedures complete', payload: sampleResponse });
            expect(actual.HasProcedureListLoaded).toBe(false);
            expect(actual.ProcedurePagingInfo.PageNumber).toEqual(sampleResponse.PagingInfo.PageNumber);
            expect(actual.ProcedurePagingInfo.Count).toEqual(sampleResponse.PagingInfo.Count);
        });
    });

    it('should dispatch COPY_PROCEDURE action when copying Procedure', () => {
        const actual = reducer(initialState, { type: '[PROCEDURES] Copy procedure', payload: new Procedure() });
        expect(actual).toEqual(initialState);
    });

    it('should dispatch COPY_PROCEDURE_COMPLETE action when Procedure copied successfully', () => {
        const actual = reducer(initialState, { type: '[PROCEDURES] Copy procedure complete', payload: sampleResponse.Entities[0] });
        expect(actual.copiedProcedureId).toEqual(sampleResponse.Entities[0].Id);
    });

    it('should dispatch ADD_PROCEDURE action to add the procedure', () => {
        const actual = reducer(initialState, { type: '[PROCEDURES] Add procedure', payload: new Procedure() });
        expect(actual.IsSelectedProcedureAdded).toBe(false);
    });

    it('should dispatch ADD_PROCEDURE_COMPLETE action when added procedure successfully', () => {
        const actual = reducer(initialState, { type: '[PROCEDURES]  Add procedure complete', payload: sampleResponse.Entities[0] });
        expect(actual.IsSelectedProcedureAdded).toBe(true);
    });

    it('should dispatch UPDATE_PROCEDURE action to update the procedure', () => {
        const actual = reducer(initialState, { type: '[PROCEDURES] Update procedure', payload: new Procedure() });
        expect(actual.IsSelectedProcedureUpdated).toBe(false);
    });

    it('should dispatch ADD_PROCEDURE_COMPLETE action when the selected procedure updated successfully', () => {
        const actual = reducer(initialState, { type: '[PROCEDURES]  Update procedure complete', payload: sampleResponse.Entities[0] });
        expect(actual.IsSelectedProcedureUpdated).toBe(true);
        expect(actual.SelectedFullEnityProcedure).toBeNull();
        expect(actual.SelectedProcedure).toEqual(sampleResponse.Entities[0]);
    });

    it('should dispatch LOAD_PROCEDURE_BY_ID_COMPLETE when selected procedure loaded successfully ', () => {
        const actual = reducer(initialState, { type: '[PROCEDURES] Load procedure by id complete', payload: sampleResponse.Entities[0] });
        expect(actual.SelectedFullEnityProcedure).toEqual(sampleResponse.Entities[0]);
    });

    it('should dispatch LOAD_EXAMPLE_PROCEDURES_TOTALCOUNT_COMPLETE action when example procedures total count loaded successfully', () => {
        const actual = reducer(initialState, { type: '[PROCEDURES] Load example procedures total count complete', payload: 10 });
        expect(actual.exampleProceduresTotalCount).toEqual(10);
    });

    it('should dispatch LOAD_PROCEDURES_TOTALCOUNT_COMPLETE action when procedures total count loaded successfully', () => {
        const actual = reducer(initialState, { type: '[PROCEDURES] Load procedures total count complete', payload: 10 });
        expect(actual.proceduresTotalCount).toEqual(10);
    });


    describe('Functions in the Procedure reducer', () => {

        beforeEach(() => {
            store = MockStoreProviderFactory.createInitialStore();
            store.subscribe(s => { initialWholeState = s; });

            modifiedState = {
                HasProcedureListLoaded: false,
                CustomProcedureRequest: sampleApiRequestParams,
                copiedProcedureId: sampleResponse.Entities[0].Id,
                ProcedureList: sampleResponse.Entities,
                ProcedurePagingInfo: sampleResponse.PagingInfo,
                HasSelectedProcedureListLoaded: true,
                IsSelectedProcedureAdded: true,
                SelectedProcedure: sampleResponse.Entities[0],
                IsSelectedProcedureUpdated: false,
                SelectedFullEnityProcedure: sampleResponse.Entities[0],
                exampleProceduresTotalCount: 10,
                proceduresTotalCount: 10
            };
            initialWholeState.procedureState = modifiedState;
        });

        it('function should return Procedure list total count when getProcedureListDataTotalCount method was called ', () => {
            (store.let(fromRoot.getProcedureListDataTotalCountData)).subscribe(val => {
                expect(val).toEqual(modifiedState.ProcedurePagingInfo.TotalCount);
            });
        });

        it('function should return Loading status of the list when getProcedureListLoadingState method was called ', () => {
            (store.let(fromRoot.getProcedureListLoadingState)).subscribe(val => {
                expect(val).toEqual(modifiedState.HasProcedureListLoaded);
            });
        });

        it('function should return Procedures list details when getProcedureList method was called ', () => {
            (store.let(fromRoot.getProcedureListData)).subscribe(val => {
                expect(val).toEqual(Immutable.List<Procedure>(modifiedState.ProcedureList));
            });
        });

        it('function should return Procedures total count when getProcedureListTotalCount method was called ', () => {
            (store.let(fromRoot.getProcedureListTotalCount)).subscribe(val => {
                expect(val).toEqual(modifiedState.proceduresTotalCount);
            });
        });

        it('function should return example Procedures total count when getExampleProcedureListTotalCount method was called ', () => {
            (store.let(fromRoot.getExampleProcedureListTotalCountData)).subscribe(val => {
                expect(val).toEqual(modifiedState.exampleProceduresTotalCount);
            });
        });

        it('function should procedure list data table options when getProcedureListDataTableOptions method was called ', () => {
            let pagingInformation = sampleResponse.PagingInfo;
            let dataTableOptions = new DataTableOptions(pagingInformation.PageNumber, pagingInformation.Count, sampleApiRequestParams.SortBy.SortField, sampleApiRequestParams.SortBy.Direction);
            (store.let(fromRoot.getProcedureListDataTableOptions)).subscribe(val => {
                expect(val).toEqual(dataTableOptions);
            });
        });

        it('function should return copied procedure Id when getCopiedProcedure method was called ', () => {
            (store.let(fromRoot.getCopiedProcedure)).subscribe(val => {
                expect(val).toEqual(modifiedState.copiedProcedureId);
            });
        });

        it('function should return the selected Full entity procedure details when getSelectedFullEnityProcedure method was called ', () => {
            (store.let(fromRoot.getSelectedFullEnityProcedureData)).subscribe(val => {
                expect(val).toEqual(modifiedState.SelectedFullEnityProcedure);
            });
        });

    });

});