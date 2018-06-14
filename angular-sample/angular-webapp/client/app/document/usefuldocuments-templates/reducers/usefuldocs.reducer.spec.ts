import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import { fakeAsync, tick } from '@angular/core/testing';
import { sharedDocument } from './../models/sharedDocument';
import {
    UsefulDocsState, reducer, getUsefulDocsCount, getUsefulDocsApiRequest, getUsefulDocsListTotalCount,
    getUsefulDocsListLoadingState, getUsefulDocsList, getUsefulDocsListDataTableOptions
} from './usefuldocs.reducer';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AtlasApiResponse, AtlasParams, AtlasApiRequest } from './../../../shared/models/atlas-api-response';
import * as UsefulDocsClearAction from './../actions/usefuldocs.actions';
// import { TodaysOverviewLoadCompleteAction } from './../actions/todays-overview.actions';
import * as Immutable from 'immutable';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../shared/reducers/index';
import { SortDirection } from "./../../../atlas-elements/common/models/ae-sort-model";

describe('Documents Citation Drafts State', () => {
    let HasUsefulDocsListLoaded: boolean;
    let UsefulDocsList: any;
    let UsefulDocsPagingInfo: PagingInfo;
    let apiRequestWithParams: AtlasApiRequestWithParams;
    let usefulDocsCount: any;
    let initialState: UsefulDocsState;
    let modifiedState: UsefulDocsState;
    let store: Store<fromRoot.State>;
    let initialWholeState: fromRoot.State;
    let usefuldocsApiRequest = new AtlasApiRequestWithParams(1, 10, 'Title', SortDirection.Ascending, [])

    beforeEach(() => {
        initialState = {
            HasUsefulDocsListLoaded: false,
            UsefulDocsList: null,
            UsefulDocsPagingInfo: null,
            apiRequestWithParams: null,
            usefulDocsCount: 0,
        };
        UsefulDocsList = MockStoreProviderFactory.getMockDocumentDrafts();
        usefulDocsCount = MockStoreProviderFactory.getMockUsefulDocumentTotal();
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

    it('it should dispatch LOAD_USEFUL_DOCS_LIST action to load the list of USEFUL DOCS LIST screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Useful Documents', payload: { apiRequestWithParams: usefuldocsApiRequest } });
        expect(actual.HasUsefulDocsListLoaded).toBe(false);
    });

    it('it should dispatch LOAD_USEFUL_DOCS_LIST_COMPLETE action to load the list of USEFUL DOCS LIST COMPLETE screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Useful Documents Complete', payload: UsefulDocsList });
        expect(actual.UsefulDocsList).toEqual(UsefulDocsList.Entities);
        expect(actual.UsefulDocsPagingInfo.TotalCount).toEqual(UsefulDocsList.PagingInfo.TotalCount);
        expect(actual.UsefulDocsPagingInfo.PageNumber).toEqual(UsefulDocsList.PagingInfo.PageNumber);
        expect(actual.UsefulDocsPagingInfo.Count).toEqual(UsefulDocsList.PagingInfo.Count);
        expect(actual.UsefulDocsPagingInfo).toEqual(UsefulDocsList.PagingInfo);
    });

    it('it should dispatch LOAD_USEFUL_DOCS_COUNT action to load the list of USEFUL DOCS COUNT screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Useful Documents Count', payload: {} });
        expect(actual.usefulDocsCount).toBe(0);
    });

    it('it should dispatch LOAD_USEFUL_DOCS_COUNT_COMPLETE action to load the list of USEFUL DOCS COUNT COMPLETE  List screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Useful Documents Count Complete', payload: usefulDocsCount });
        expect(actual.usefulDocsCount).toEqual(usefulDocsCount.PagingInfo.TotalCount);
    });

    it('should return new state when USEFUL_DOCS_CLEAR actions have been made', () => {
        const actual = reducer(initialState, { type: '[Document]  Useful Documents Clear', payload: {} });
        const expected = initialState;
        expect(actual).toEqual(expected);
    });

    describe('Functions in the Useful Docs reducer', () => {
        beforeEach(() => {
            store = MockStoreProviderFactory.createInitialStore();
            UsefulDocsList = MockStoreProviderFactory.getMockDocumentDrafts();
            store.subscribe(s => { initialWholeState = s; })
            modifiedState = reducer(initialState, { type: '[Document] Load Useful Documents', payload: usefuldocsApiRequest });
            modifiedState = reducer(modifiedState, { type: '[Document] Load Useful Documents Complete', payload: UsefulDocsList });
            initialWholeState.usefulDocsState = modifiedState;
        });
        it('function should return api request params when getUsefulDocsApiRequest method was called', () => {
            store.let(fromRoot.getUsefulDocsApiRequesttData).subscribe(apirequeset => {
                expect(apirequeset).toEqual(modifiedState.apiRequestWithParams);
            });
        });
        it('function should return Loading status when getUsefulDocsListLoadingState method was called', () => {
            store.let(fromRoot.getUsefulDocsLoadingState).subscribe(status => {
                expect(status).toEqual(modifiedState.HasUsefulDocsListLoaded);
            });
        });
        it('function should return Loading status when getUsefulDocsList method was called', () => {
            store.let(fromRoot.getUsefulDocsData).subscribe(list => {
                expect(list).toEqual(Immutable.List<Document>(modifiedState.UsefulDocsList));
            });
        });
        it('function should return Loading status when getUsefulDocsListTotalCount method was called', () => {
            store.let(fromRoot.getUsefulDocsListTotalCount).subscribe(count => {
                expect(count).toEqual(modifiedState.UsefulDocsPagingInfo.TotalCount);
            });
        });
        it('function should return Loading status when getUsefulDocsCount method was called', () => {
            store.let(fromRoot.getUsefulDocsCount).subscribe(count => {
                expect(count).toEqual(modifiedState.usefulDocsCount);
            });
        });
        it('function should return citation drafts list data table options when getUsefulDocsListDataTableOptions method was called', () => {
            let pagingInformation = modifiedState.UsefulDocsPagingInfo;
            let dataTableOptions = new DataTableOptions(pagingInformation.PageNumber, pagingInformation.Count, usefuldocsApiRequest.SortBy.SortField, usefuldocsApiRequest.SortBy.Direction);
            store.let(fromRoot.getUsefulDocsDataTableOptions).subscribe(options => {
                expect(options).toEqual(dataTableOptions);
            });
        });
    });

});