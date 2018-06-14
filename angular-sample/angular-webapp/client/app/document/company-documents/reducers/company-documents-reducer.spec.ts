import * as Immutable from 'immutable';

import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { MockStoreCompanyDocuments } from '../../../shared/testing/mocks/mock-store-company-documents';
import { Document, DocumentFolderStat } from '../../models/document';
import { CompanyDocumentsState, reducer } from './company-documents-reducer';

describe('Company documents State', () => {
    let initialState: CompanyDocumentsState;
    let params: AtlasParams[] = [];
    params.push(new AtlasParams('DocumentFolder', 1))
    let apiRequest = new AtlasApiRequestWithParams(1, 10, 'FileNameAndTitle', SortDirection.Ascending, params);

    beforeEach(() => {
        initialState = {
            hasCompanyDocumentsStatLoaded: false,
            CompanyDocumentStats: null,
            hasCompanyDocumentsLoaded: false,
            companyDocumentsApiRequest: null,
            companyDocuments: null,
            companyDocumentsPagingInfo: null,
            IsDeleteDocumentCompleted: false
        }
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

    it('it should dispatch LOAD_COMPANY_DOCS_STATS action to load the company document stats', () => {
        const actual = reducer(initialState, { type: '[CompanyDocument] Load Company Document stats', payload: {} });
        expect(actual.hasCompanyDocumentsStatLoaded).toBe(false);
    });

    it('it should dispatch LOAD_COMPANY_DOCS_STATS_COMPLETE action after loading the company document stats', () => {
        const actual = reducer(initialState, { type: '[CompanyDocument] Load Company Document stats complete', payload: MockStoreCompanyDocuments.companyDocumentStatsMock() });
        expect(actual.hasCompanyDocumentsStatLoaded).toBe(true);
        let allDocumentStats: DocumentFolderStat[] = [];
        let folder1 = new DocumentFolderStat();
        folder1.Count = 87;
        folder1.Folder = 1;
        expect(actual.CompanyDocumentStats[0]).toEqual(folder1);
    });

    it('it should dispatch LOAD_COMPANY_DOCUMENTS action to load the company documents', () => {
        const actual = reducer(initialState, { type: '[CompanyDocument] Load Company Documents', payload: apiRequest });
        expect(actual.hasCompanyDocumentsLoaded).toBe(false);
        expect(actual.companyDocumentsApiRequest).toEqual(apiRequest);
    });

    it('it should dispatch LOAD_COMPANY_DOCUMENTS_COMPLETE action to load the company documents complete', () => {
        const actual = reducer(initialState, { type: '[CompanyDocument] Load Company Documents complete', payload: MockStoreCompanyDocuments.getHandbooksDataMock() });
        expect(actual.hasCompanyDocumentsLoaded).toBe(true);
        expect(actual.companyDocumentsPagingInfo.TotalCount).toEqual(77);
        expect(actual.companyDocumentsPagingInfo.PageNumber).toEqual(1);
        expect(actual.companyDocumentsPagingInfo.Count).toEqual(10);
        expect(actual.companyDocuments).toEqual(Immutable.List(MockStoreCompanyDocuments.getHandbooksDataMock().Entities));
    });

    it('it should dispatch REMOVE_COMPANY_DOCUMENT_COMPLETE action', () => {
        const actual = reducer(initialState, { type: '[CompanyDocument] Remove Company document complete', payload: {} });
        expect(actual.IsDeleteDocumentCompleted).toBe(true);
    });

    it('it should dispatch RESET_DELETE_STATUS action', () => {
        const actual = reducer(initialState, { type: '[CompanyDocument] reset Company document delete status', payload: {} });
        expect(actual.IsDeleteDocumentCompleted).toBe(false);
    });

    it('it should dispatch UPDATE_COMPANY_DOCUMENT_COMPLETE action', () => {
        let doc = new Document();
        doc.Id = '1234'
        const actual = reducer(initialState, { type: '[CompanyDocument] Update Company document complete', payload: doc });
        expect(actual.companyDocuments).toBeNull();
    });

    it('it should dispatch COMPANY_DOCUMENT_CLEAR action', () => {
        const actual = reducer(initialState, { type: '[CompanyDocument] Company documents clear', payload: {} });
        expect(actual.hasCompanyDocumentsStatLoaded).toBe(false);
        expect(actual.CompanyDocumentStats).toBeNull();
        expect(actual.hasCompanyDocumentsLoaded).toBe(false);
        expect(actual.companyDocumentsApiRequest).toBeNull();
        expect(actual.companyDocuments).toBeNull();
        expect(actual.companyDocumentsPagingInfo).toBeNull();
        expect(actual.IsDeleteDocumentCompleted).toBe(false);
    });

});