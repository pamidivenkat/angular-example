import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasApiResponse, AtlasParams } from '../../shared/models/atlas-api-response';
import { MockStoreSharedDocuments } from '../../shared/testing/mocks/mock-store-shared-documents';
import { ActionedDocument, DistributedDocument } from '../models/DistributedDocument';
import { reducer, SharedDocumentsState } from './shared-documents.reducer';

describe('Shared document state', () => {
    let initialState: SharedDocumentsState;
    beforeEach(() => {
        initialState = {
            hasDocumentsToReivewLoaded: false,
            documentsToReview: new AtlasApiResponse<DistributedDocument>(),
            documentsToReviewRequest: null,// new AtlasApiRequest(1, 10, "DateSent", "desc"),
            totalDocumentsToReviewCount: 0,
            hasDocumentsToReviewActionConfirmCompleted: false,
            hasUsefulDocumentsToReivewLoaded: false,
            usefulDocumentsToReview: new AtlasApiResponse<DistributedDocument>(),
            usefulDocumentsToReviewRequest: null,//new AtlasApiRequest(1, 10, "CreatedOn", "desc"),
            totalUsefulDocumentsToReviewCount: 0,
            hasUsefulDocumentsToReviewActionConfirmCompleted: false,
            actionedDocument: null,
            actionedUsefulDocument: null,
            employeeSearchListRequest: null,
            employeeSearchListResponse: null
        }
    })
    it('should return default state', () => {
        const action = {} as any;
        const result = reducer(initialState, action);
        expect(result).toEqual(initialState);
    });

    it('should return current state when no valid actions have been made', () => {
        const actual = reducer(initialState, { type: 'INVALID_ACTION', payload: {} });
        const expected = initialState;
        expect(actual).toBe(expected);
    });

    it('should return hasStatisticsDataLoaded false after first store action LOAD_COMPANY_DOCUMENTS_TO_REVIEW is despatched', () => {
        let params: Array<AtlasParams> = [new AtlasParams('DocumentAction', '1')];
        let apiParams: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'DataSent', SortDirection.Ascending, params);

        const actual = reducer(initialState, { type: '[Document] Load company Documents to review', payload: apiParams });
        expect(actual.hasDocumentsToReivewLoaded).toBe(false);
        expect(actual.documentsToReviewRequest).toEqual(apiParams);
    });

    it('should return hasStatisticsDataLoaded true after first store action LOAD_COMPANY_DOCUMENTS_TO_REVIEW_COMPLETE is despatched', () => {
        let params: Array<AtlasParams> = [new AtlasParams('DocumentAction', '1')];
        let apiParams: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'DataSent', SortDirection.Ascending, params);

        const actual = reducer(initialState, { type: '[Document] Load company documents to review complete', payload: MockStoreSharedDocuments.getCompanyDistributedDocs() });
        expect(actual.hasDocumentsToReivewLoaded).toBe(true);
        expect(actual.documentsToReview).toEqual(MockStoreSharedDocuments.getCompanyDistributedDocs());
        expect(actual.totalDocumentsToReviewCount).toEqual(MockStoreSharedDocuments.getCompanyDistributedDocs().PagingInfo.TotalCount);
    });

    it('should return hasUsefulDocumentsToReivewLoaded false after first store action LOAD_COMPANY_USEFULDOCUMENTS_TO_REVIEW is despatched', () => {
        let params: Array<AtlasParams> = [new AtlasParams('DocumentAction', '1')];
        let apiParams: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'DataSent', SortDirection.Ascending, params);

        const actual = reducer(initialState, { type: '[Document] Load company useful documents to review', payload: apiParams });
        expect(actual.hasUsefulDocumentsToReivewLoaded).toBe(false);
        expect(actual.usefulDocumentsToReviewRequest).toEqual(apiParams);
    });

    it('should return hasUsefulDocumentsToReivewLoaded true after first store action LOAD_COMPANY_USEFULDOCUMENTS_TO_REVIEW_COMPLETE is despatched', () => {
        let params: Array<AtlasParams> = [new AtlasParams('DocumentAction', '1')];
        let apiParams: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'DataSent', SortDirection.Ascending, params);

        const actual = reducer(initialState, { type: '[Document] Load company useful documents to review complete', payload: MockStoreSharedDocuments.getUsefulDocs() });
        expect(actual.hasUsefulDocumentsToReivewLoaded).toBe(true);
        expect(actual.usefulDocumentsToReview).toEqual(MockStoreSharedDocuments.getUsefulDocs());
        expect(actual.totalUsefulDocumentsToReviewCount).toEqual(10);
    });
    it('should return hasDocumentsToReviewActionConfirmCompleted true after  action COMPANY_DOCUMENTS_TO_REVIEW_ACTION_CONFIRM_COMPLETE is dispatched', () => {
        let actionedDocument = new ActionedDocument;
        const actual = reducer(initialState, { type: '[Document] Company documents to review action confirm complete', payload: actionedDocument });
        expect(actual.hasDocumentsToReviewActionConfirmCompleted).toBe(true);
    });
})