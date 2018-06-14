import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import { fakeAsync, tick } from '@angular/core/testing';
import { Document } from './../../models/document';
import {
    CitationDraftsState, reducer, getCitationDraftsApiRequest, getCitationDraftsListLoadingState,
    getCitationDraftsList, getCitationDraftsListTotalCount, getCitationDraftsListDataTableOptions
} from './citation-drafts.reducer';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AtlasApiResponse, AtlasParams, AtlasApiRequest } from './../../../shared/models/atlas-api-response';
import * as citationDraftsActions from './../actions/citation-drafts.actions';
// import { TodaysOverviewLoadCompleteAction } from './../actions/todays-overview.actions';
import * as Immutable from 'immutable';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../shared/reducers/index';
import { SortDirection } from "./../../../atlas-elements/common/models/ae-sort-model";

describe('Documents Citation Drafts State', () => {
    let HasCitationDraftsListLoaded: boolean;
    let CitationDraftsList: Document[];
    let CitationDraftsPagingInfo: PagingInfo;
    let apiRequestWithParams: AtlasApiRequestWithParams;
    let initialState: CitationDraftsState;
    let modifiedState: CitationDraftsState;
    let DocumentDraftsList: any;
    let store: Store<fromRoot.State>;
    let initialWholeState: fromRoot.State;
    let draftApiRequest = new AtlasApiRequestWithParams(1, 10, 'FileNameAndTitle', SortDirection.Ascending, []);

    beforeEach(() => {
        initialState = {
            HasCitationDraftsListLoaded: false,
            CitationDraftsList: null,
            CitationDraftsPagingInfo: null,
            apiRequestWithParams: null,
        };
        DocumentDraftsList = MockStoreProviderFactory.getMockDocumentDrafts();
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

    it('it should dispatch LOAD_CITATION_DRAFTS_LIST action to load the list of CITATION DRAFTS LIST screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Citation Drafts', payload: { apiRequestWithParams: draftApiRequest } });
        expect(actual.HasCitationDraftsListLoaded).toBe(false);
    });

    it('it should dispatch LOAD_CITATION_DRAFTS_LIST_COMPLETE action to load the list of TODAYS OVERVIEW LOAD COMPLETE  List screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Citation Drafts Complete', payload: DocumentDraftsList });
        expect(actual.CitationDraftsList).toEqual(DocumentDraftsList.Entities);
        expect(actual.CitationDraftsPagingInfo.TotalCount).toEqual(DocumentDraftsList.PagingInfo.TotalCount);
        expect(actual.CitationDraftsPagingInfo.PageNumber).toEqual(DocumentDraftsList.PagingInfo.PageNumber);
        expect(actual.CitationDraftsPagingInfo.Count).toEqual(DocumentDraftsList.PagingInfo.Count);
        expect(actual.CitationDraftsPagingInfo).toEqual(DocumentDraftsList.PagingInfo);
    });

    it('should return new state when DRAFTS_DOCUMENTS_CLEAR actions have been made', () => {
        const actual = reducer(initialState, { type: '[Document] Citation Drafts clear complete', payload: {} });
        const expected = initialState;
        expect(actual).toEqual(expected);
    });

    describe('Functions in the Citation Drafts reducer', () => {
        beforeEach(() => {
            store = MockStoreProviderFactory.createInitialStore();
            DocumentDraftsList = MockStoreProviderFactory.getMockDocumentDrafts();
            store.subscribe(s => { initialWholeState = s; });
            modifiedState = reducer(initialState, { type: '[Document] Load Citation Drafts Complete', payload: DocumentDraftsList });
            initialWholeState.citationDraftsState = modifiedState;
        });
          it('function should return api request params when getCitationDraftsApiRequest method was called', () => {
               store.let(fromRoot.getCitationDraftsApiRequestData).subscribe(apirequeset => {
                  expect(apirequeset).toEqual(modifiedState.apiRequestWithParams);
              });
          });
          it('function should return Loading status when getCitationDraftsListLoadingState method was called', () => {
              store.let(fromRoot.getCitationDraftsLoadingState).subscribe(status => {
                  expect(status).toEqual(modifiedState.HasCitationDraftsListLoaded);
              });
          });
          it('function should return Loading status when getCitationDraftsList method was called', () => {
               store.let(fromRoot.getCitationDraftsData).subscribe(list => {
                  expect(list).toEqual(Immutable.List<Document>(modifiedState.CitationDraftsList));
              });
          });
          it('function should return Loading status when getCitationDraftsListTotalCount method was called', () => {
               store.let(fromRoot.getCitationDraftsListTotalCount).subscribe(count => {
                  expect(count).toEqual(modifiedState.CitationDraftsPagingInfo.TotalCount);
              });
          });
          xit('function should return citation drafts list data table options when getCitationDraftsListDataTableOptions method was called', () => {
              let pagingInformation = modifiedState.CitationDraftsPagingInfo;
              let dataTableOptions = new DataTableOptions(pagingInformation.PageNumber, pagingInformation.Count, draftApiRequest.SortBy.SortField, draftApiRequest.SortBy.Direction);
              store.let(fromRoot.getCitationDraftsDataTableOptions).subscribe(options => {
                  expect(options).toEqual(dataTableOptions);
              });
          });
    });

});