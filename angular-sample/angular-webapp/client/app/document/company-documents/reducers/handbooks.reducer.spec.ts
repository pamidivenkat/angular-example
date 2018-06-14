import { MockStoreCompanyDocuments } from '../../../shared/testing/mocks/mock-store-company-documents';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { MockStoreHandbookDocuments } from './../../../shared/testing/mocks/mock-store-documents-handbooks';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import { fakeAsync, tick } from '@angular/core/testing';

import {
    HandbooksState, reducer, getHandbooksDocsCount, getHandbooksDocsApiRequest, getHandbooksListTotalCount,
    getHandbooksListLoadingState, getHandbooksList, getHandbooksListDataTableOptions
} from './handbooks.reducer';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AtlasApiResponse, AtlasParams, AtlasApiRequest } from './../../../shared/models/atlas-api-response';
import * as handbooksActions from '../actions/handbooks.actions';
// import { TodaysOverviewLoadCompleteAction } from './../actions/todays-overview.actions';
import * as Immutable from 'immutable';
import { Document, DocumentActionType } from './../../models/document';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../shared/reducers/index';
import { SortDirection } from "./../../../atlas-elements/common/models/ae-sort-model";

describe('Documents Citation Drafts State', () => {
    let HasHandbooksListLoaded: boolean;
    let HandbooksList: any;
    let HandbooksPagingInfo: PagingInfo;
    let apiRequestWithParams: AtlasApiRequestWithParams;
    let handbooksDocsCount: any;
    let initialState: HandbooksState;
    let modifiedState: HandbooksState;
    let store: Store<fromRoot.State>;
    let initialWholeState: fromRoot.State;
    let handbookApiRequest = new AtlasApiRequestWithParams(1, 10, 'FileNameAndTitle', SortDirection.Ascending, [])

    beforeEach(() => {
        initialState = {
            HasHandbooksListLoaded: false,
            HandbooksList: null,
            HandbooksPagingInfo: null,
            apiRequestWithParams: null,
            handbooksDocsCount: 0,
        };
        HandbooksList = MockStoreHandbookDocuments.getHandbookDocuments();
        handbooksDocsCount = MockStoreHandbookDocuments.getHandbookStats();
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

    it('it should dispatch LOAD_HANDBOOKS_DOCS_LIST action to load the list of USEFUL DOCS LIST screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Handbooks Documents', payload: { apiRequestWithParams: handbookApiRequest } });
        expect(actual.HasHandbooksListLoaded).toBe(false);
    });

    it('it should dispatch LOAD_HANDBOOKS_DOCS_LIST_COMPLETE action to load the list of HANDBOOKS DOCS LIST COMPLETE screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Handbooks Documents Complete', payload: HandbooksList });
        expect(actual.HandbooksList).toEqual(HandbooksList.Entities);
        expect(actual.HandbooksPagingInfo.TotalCount).toEqual(HandbooksList.PagingInfo.TotalCount);
        expect(actual.HandbooksPagingInfo.PageNumber).toEqual(HandbooksList.PagingInfo.PageNumber);
        expect(actual.HandbooksPagingInfo.Count).toEqual(HandbooksList.PagingInfo.Count);
        expect(actual.HandbooksPagingInfo).toEqual(HandbooksList.PagingInfo);
    });

    it('it should dispatch LOAD_HANDBOOKS_DOCS_LIST_COMPLETE action after loading the handbook document list for page 2', () => {
        initialState.HandbooksPagingInfo = new PagingInfo(10, 77, 1, 10);
        const actual = reducer(initialState, { type: '[Document] Load Handbooks Documents Complete', payload: MockStoreCompanyDocuments.getHandbookDataPage2Mock() });
        expect(actual.HasHandbooksListLoaded).toBe(true);
        expect(actual.HandbooksPagingInfo.TotalCount).toEqual(77);
        expect(actual.HandbooksList).toEqual(MockStoreCompanyDocuments.getHandbookDataPage2Mock().Entities);
        expect(actual.handbooksDocsCount).toEqual(0);
        expect(actual.HandbooksPagingInfo.PageNumber).toEqual(2);
        expect(actual.HandbooksPagingInfo.Count).toEqual(10);
    });

    it('it should dispatch LOAD_HANDBOOKS_DOCS_COUNT action to load the list of HANDBOOKS DOCS COUNT screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Handbooks Documents Counts', payload: {} });
        expect(actual.handbooksDocsCount).toBe(0);
    });

    it('it should dispatch LOAD_HANDBOOKS_DOCS_COUNT_COMPLETE action to load the list of HANDBOOKS DOCS COUNT COMPLETE  List screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Handbooks Documents Counts Complete', payload: handbooksDocsCount });
        expect(actual.handbooksDocsCount).toEqual(handbooksDocsCount.PagingInfo.TotalCount);
    });

    it('should return new state when HANDBOOKS_DATA_CLEAR actions have been made', () => {
        const actual = reducer(initialState, { type: '[Document]  Handbooks Documents data clear', payload: {} });
        const expected = initialState;
        expect(actual).toEqual(expected);
    });

    describe('Functions in the Useful Docs reducer', () => {
        beforeEach(() => {
            store = MockStoreProviderFactory.createInitialStore();
            HandbooksList = MockStoreHandbookDocuments.getHandbookDocuments();
            store.subscribe(s => { initialWholeState = s; })
            modifiedState = reducer(initialState, { type: '[Document] Load Handbooks Documents', payload: handbookApiRequest });
            modifiedState = reducer(modifiedState, { type: '[Document] Load Handbooks Documents Complete', payload: HandbooksList });
            initialWholeState.handbooksState = modifiedState;
        });
        it('function should return api request params when getHandbooksDocsApiRequest method was called', () => {
            store.let(fromRoot.getHandbooksDocsApiRequestData).subscribe(apirequeset => {
                expect(apirequeset).toEqual(modifiedState.apiRequestWithParams);
            });
        });
        it('function should return Loading status when getHandbooksLoadingState method was called', () => {
            store.let(fromRoot.getHandbooksLoadingState).subscribe(status => {
                expect(status).toEqual(modifiedState.HasHandbooksListLoaded);
            });
        });
        it('function should return Loading status when getHandbooksData method was called', () => {
            store.let(fromRoot.getHandbooksData).subscribe(list => {
                expect(list).toEqual(Immutable.List<Document>(modifiedState.HandbooksList));
            });
        });
        it('function should return Loading status when getHandbooksListTotalCount method was called', () => {
            store.let(fromRoot.getHandbooksListTotalCount).subscribe(count => {
                expect(count).toEqual(modifiedState.HandbooksPagingInfo.TotalCount);
            });
        });
        it('function should return Loading status when getHandbooksDocsCount method was called', () => {
            store.let(fromRoot.getHandbooksDocsCount).subscribe(count => {
                expect(count).toEqual(modifiedState.handbooksDocsCount);
            });
        });
        it('function should return citation drafts list data table options when getHandbooksDataTableOptions method was called', () => {
            let pagingInformation = modifiedState.HandbooksPagingInfo;
            let dataTableOptions = new DataTableOptions(pagingInformation.PageNumber, pagingInformation.Count, handbookApiRequest.SortBy.SortField, handbookApiRequest.SortBy.Direction);
            store.let(fromRoot.getHandbooksDataTableOptions).subscribe(options => {
                expect(options).toEqual(dataTableOptions);
            });
        });
    });

});