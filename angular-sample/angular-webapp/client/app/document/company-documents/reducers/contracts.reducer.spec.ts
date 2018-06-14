import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import { fakeAsync, tick } from '@angular/core/testing';
import { Document } from './../../models/document';
import {
    ContractsState, reducer, getAssociatedUserVersionContract, getContractsTemplateCount, getPersonalContractsCount, getPersonalContractsListTotalCount, getContractsListTotalCount,
    getContractsListLoadingState, getPersonalContractsListLoadingState, getPersonalContractsList, getContractsList, getContractsListDataTableOptions, getPersonalContractsListDataTableOptions
} from './contracts.reducer';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AtlasApiResponse, AtlasParams, AtlasApiRequest } from './../../../shared/models/atlas-api-response';
import * as contractsActions from './../actions/contracts.actions';
// import { TodaysOverviewLoadCompleteAction } from './../actions/todays-overview.actions';
import * as Immutable from 'immutable';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { Observable } from 'rxjs';
import { SortDirection } from "./../../../atlas-elements/common/models/ae-sort-model";
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../shared/reducers/index';

describe('Contracts State', () => {
    let HasContractsListLoaded: boolean;
    let HasPersonalContractsListLoaded: boolean;
    let ContractsList: AtlasApiResponse<Document>;
    let PersonalContractsList: AtlasApiResponse<Document>;
    let ContractsPagingInfo: PagingInfo;
    let PersonalContractsPagingInfo: PagingInfo;
    let apiRequestWithParams: AtlasApiRequestWithParams;
    let ContractsTemplateCount: AtlasApiResponse<number>;
    let PersonalcontractsCount: AtlasApiResponse<number>;
    let initialState: ContractsState;
    let modifiedState: ContractsState;
    let SelectedSystemVersionContract: string;
    let AssociatedUserVersionContract: Document;
    let params: AtlasParams[] = new Array();
    params.push(new AtlasParams('contractsFilter', 1))
    let sampleContractApiRequest = new AtlasApiRequestWithParams(1, 10, 'Title', SortDirection.Ascending, params);
    let newparams: AtlasParams[] = new Array();
    newparams.push(new AtlasParams('contractsFilter', 2))
    let samplePersonalApiRequest = new AtlasApiRequestWithParams(1, 10, 'Title', SortDirection.Ascending, newparams);
    let store: Store<fromRoot.State>;
    let initialWholeState: fromRoot.State;

    beforeEach(() => {
        initialState = {
            HasContractsListLoaded: false,
            HasPersonalContractsListLoaded: false,
            ContractsList: null,
            PersonalContractsList: null,
            ContractsPagingInfo: null,
            PersonalContractsPagingInfo: null,
            apiRequestWithParams: null,
            ContractsTemplateCount: 0,
            PersonalcontractsCount: 0,
            SelectedSystemVersionContract: null,
            AssociatedUserVersionContract: null
        };
        ContractsList = MockStoreProviderFactory.getMockContractTemplates();
        PersonalContractsList = MockStoreProviderFactory.getMockPersonalisedContractTemplates();
        ContractsTemplateCount = MockStoreProviderFactory.getMockContractTemplatesCount();
        PersonalcontractsCount = MockStoreProviderFactory.getMockPersonalisedContractTemplatesCount();

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

    it('it should dispatch LOAD_CONTRACTS_DOCS_LIST action to load the list of CONTRACTS DOCS LIST screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Contracts Documents', payload: { apiRequestWithParams: sampleContractApiRequest } });
        expect(actual.HasContractsListLoaded).toBe(false);
    });

    it('it should dispatch LOAD_CONTRACTS_DOCS_LIST_COMPLETE action to load the list of CONTRACTS DOCS LIST COMPLETE screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Contracts Documents Complete', payload: ContractsList });
        expect(actual.ContractsList).toEqual(ContractsList.Entities);
        expect(actual.ContractsPagingInfo.TotalCount).toEqual(ContractsList.PagingInfo.TotalCount);
        expect(actual.ContractsPagingInfo.PageNumber).toEqual(ContractsList.PagingInfo.PageNumber);
        expect(actual.ContractsPagingInfo.Count).toEqual(ContractsList.PagingInfo.Count);
        expect(actual.ContractsPagingInfo).toEqual(ContractsList.PagingInfo);
    });

    it('it should dispatch LOAD_CONTRACT_DOCS_COUNT action to load the list of CONTRACT DOCS COUNT screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Contracts Documents Count', payload: {} });
        expect(actual.ContractsTemplateCount).toBe(0);
    });

    it('it should dispatch LOAD_CONTRACT_DOCS_COUNT_COMPLETE action to load the list of CONTRACT DOCS COUNT COMPLETE List screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Contracts Documents Count Complete', payload: ContractsTemplateCount });
        expect(actual.ContractsTemplateCount).toEqual(ContractsTemplateCount.PagingInfo.TotalCount);
    });

    it('it should dispatch LOAD_CONTRACTS_DOCS_LIST action to load the list of PERSONAL CONTRACTS DOCS LIST screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Contracts Documents', payload: { apiRequestWithParams: samplePersonalApiRequest } });
        expect(actual.HasPersonalContractsListLoaded).toBe(false);
    });

    it('it should dispatch LOAD_PERSONALISED_CONTRACTS_DOCS_LIST_COMPLETE action to load the list of PERSONALISED DOCS LIST COMPLETE screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Personal Contracts Documents Complete', payload: PersonalContractsList });
        expect(actual.PersonalContractsList).toEqual(PersonalContractsList.Entities);
        expect(actual.PersonalContractsPagingInfo.TotalCount).toEqual(PersonalContractsList.PagingInfo.TotalCount);
        expect(actual.PersonalContractsPagingInfo.PageNumber).toEqual(PersonalContractsList.PagingInfo.PageNumber);
        expect(actual.PersonalContractsPagingInfo.Count).toEqual(PersonalContractsList.PagingInfo.Count);
        expect(actual.PersonalContractsPagingInfo).toEqual(PersonalContractsList.PagingInfo);
    });

    it('it should dispatch LOAD_PERSONAL_CONTRACT_DOCS_COUNT action to load the list of PERSONAL CONTRACT DOCS COUNT screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Personal Contracts Documents Count', payload: {} });
        expect(actual.PersonalcontractsCount).toBe(0);
    });

    it('it should dispatch LOAD_PERSONAL_CONTRACT_DOCS_COUNT_COMPLETE action to load the list of PERSONAL CONTRACT DOCS COUNT COMPLETE List screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Personal Contracts Documents Count Complete', payload: PersonalcontractsCount });
        expect(actual.PersonalcontractsCount).toEqual(PersonalcontractsCount.PagingInfo.TotalCount);
    });

    it('should return new state when CONTRACTS_CLEAR actions have been made', () => {
        const actual = reducer(initialState, { type: '[Document] contracts clear action', payload: {} });
        const expected = initialState;
        expect(actual).toEqual(expected);
    });

    describe('Functions in the Contract Templates reducer', () => {
        beforeEach(() => {
            store = MockStoreProviderFactory.createInitialStore();
            ContractsList = MockStoreProviderFactory.getMockContractTemplates();
            store.subscribe(s => { initialWholeState = s; })
            modifiedState = reducer(initialState, { type: '[Document] Load Contracts Documents Complete', payload: ContractsList });
            initialWholeState.contractsState = modifiedState;
        });
        it('function should return Loading status when getContractsListLoadingState method was called', () => {
            store.let(fromRoot.getContractsLoadingState).subscribe(status => {
                expect(status).toEqual(modifiedState.HasContractsListLoaded);
            });
        });

        it('function should return Loading status when getContractsList method was called', () => {
            store.let(fromRoot.getContractsData).subscribe(list => {
                expect(list).toEqual(Immutable.List<Document>(modifiedState.ContractsList));
            });
        });
        it('function should return count when getContractsTemplateCount method was called', () => {
            store.let(fromRoot.getContractsTemplateCount).subscribe(count => {
                expect(count).toEqual(modifiedState.ContractsTemplateCount);
            });
        });
        it('function should return count when getContractsListTotalCount method was called', () => {
            store.let(fromRoot.getContractsListTotalCount).subscribe(count => {
                expect(count).toEqual(modifiedState.ContractsPagingInfo.TotalCount);
            });
        });
        xit('function should return contracts list data table options when getContractsListDataTableOptions method was called', () => {
            let pagingInformation = modifiedState.ContractsPagingInfo;
            let dataTableOptions = new DataTableOptions(pagingInformation.PageNumber, pagingInformation.Count, sampleContractApiRequest.SortBy.SortField, sampleContractApiRequest.SortBy.Direction);
            store.let(fromRoot.getContractsDataTableOptions).subscribe(options => {
                expect(options).toEqual(dataTableOptions);
            });
        });

    });

     describe('Functions in the Personal Contract Templates reducer', () => {
        beforeEach(() => {
            store = MockStoreProviderFactory.createInitialStore();
            ContractsList = MockStoreProviderFactory.getMockContractTemplates();
            store.subscribe(s => { initialWholeState = s; })
            modifiedState = reducer(initialState, { type: '[Document] Load Personal Contracts Documents Complete', payload: PersonalContractsList });
            initialWholeState.contractsState = modifiedState;
        });
        it('function should return Loading status when getPersonalContractsListLoadingState method was called', () => {
            store.let(fromRoot.getPersonalContractsLoadingState).subscribe(status => {
                expect(status).toEqual(modifiedState.HasPersonalContractsListLoaded);
            });
        });

        it('function should return Loading status when getPersonalContractsList method was called', () => {
            store.let(fromRoot.getPersonalContractsData).subscribe(list => {
                expect(list).toEqual(Immutable.List<Document>(modifiedState.PersonalContractsList));
            });
        });
        it('function should return count when getPersonalContractsCount method was called', () => {
            store.let(fromRoot.getPersonalContractsCount).subscribe(count => {
                expect(count).toEqual(modifiedState.PersonalcontractsCount);
            });
        });
        it('function should return count when getPersonalContractsListTotalCount method was called', () => {
            store.let(fromRoot.getPersonalContractsListTotalCount).subscribe(count => {
                expect(count).toEqual(modifiedState.PersonalContractsPagingInfo.TotalCount);
            });
        });
        xit('function should return contracts list data table options when getPersonalContractsListDataTableOptions method was called', () => {
            let pagingInformation = modifiedState.ContractsPagingInfo;
            let dataTableOptions = new DataTableOptions(pagingInformation.PageNumber, pagingInformation.Count, sampleContractApiRequest.SortBy.SortField, sampleContractApiRequest.SortBy.Direction);
            store.let(fromRoot.getPersonalContractsDataTableOptions).subscribe(options => {
                expect(options).toEqual(dataTableOptions);
            });
        });
    });

});