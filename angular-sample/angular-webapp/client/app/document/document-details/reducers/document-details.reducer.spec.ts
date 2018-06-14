import { AtlasApiRequestWithParams, AtlasApiRequest, AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { DocumentDetailsState, reducer } from './document-details.reducer';
import { DocumentDetails, ChangeHistoryModel, DistributionHistoryModel, EmployeeActionStatusModel } from './../models/document-details-model';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { ResponseOptions, Response } from '@angular/http';
import { extractDocumentDetails } from './../common/document-details-extract-helper';
import { SortDirection } from './../../../atlas-elements/common/models/ae-sort-model';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { json } from 'd3';
import { extractPagingInfo } from './../../../report/common/extract-helper';
import { DocumentsMockStoreProviderFactory } from './../../../shared/testing/mocks/documents-moc-store-provider-factory';
import { DocumentsMockStoreforCQCandDistribute } from '../../../shared/testing/mocks/mock-store-provider-CQC-distribute-doc';
import { extractCQCSelectOptionListData } from '../../../document/document-details/common/document-export-to-cqc-helper';
import { MSPreviewMockStoreProviderFactory } from '../../../shared/testing/mocks/ms-preview-mock-store-provider-factory';

describe('Document Details State', () => {
    let atlasParamsArray: Array<any>;
    let sampleApiRequestParams: AtlasApiRequestWithParams;
    let sampleApiRequest: AtlasApiRequest;

    let initialState: DocumentDetailsState;
    let modifiedState: DocumentDetailsState;
    let documentDetails: DocumentDetails;
    let documentChangeHistory: AtlasApiResponse<ChangeHistoryModel>;
    let documentDistributeHistory: DistributionHistoryModel[];
    let documentEmployeeActionStatusHistory: EmployeeActionStatusModel[];


    beforeEach(() => {
        initialState = {
            ChangeHistoryLoaded: false,
            DocumentChangeHistory: null,
            ChangeHistoryPagingInfo: null,
            ChangeHistoryListTotalCount: null,

            DistributionHistoryLoaded: false,
            DocumentDistributionHistory: null,
            DocumentDistributionHistoryList: null,
            DistributionHistoryPagingInfo: null,
            DistributionHistoryListTotalCount: null,
            CurrentDistributeDoc: null,

            EmployeeStatusLoaded: false,
            DocumentEmployeeStatus: null,
            EmployeeStatusPagingInfo: null,
            EmployeeStatusListTotalCount: null,
            EmployeeStatusSortingInfo: null,
            DocumentEmployeeStatusPagedList: null,
            apiRequestWithParams: null,

            CurrentDocument: null,
            CQCStandards: null,
            CQCCategories: null,
            CQCUsers: null,
            CQCFileTypes: null,
            DocumentDistributed: false
        };
        documentDetails = MockStoreProviderFactory.getDocumentMockData();
        documentChangeHistory = MockStoreProviderFactory.getMockedDocumentHistory();
        documentDistributeHistory = MockStoreProviderFactory.getMockedDistributionHistory();
        documentEmployeeActionStatusHistory = DocumentsMockStoreProviderFactory.getDocumentEmployeeActionStatusData();
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

    it('it should dispatch LOAD_DOCUMENT_DETAILS action to load the document details screen', () => {
        const actual = reducer(initialState, { type: '[Document] Load Document details', payload: {} });
        expect(actual.CurrentDocument).toBeNull();
    });

    it('it should dispatch LOAD_DOCUMENT_DETAILS_COMPLETE action to complete the loading of document details screen', () => {
        let response = getResponse(documentDetails);
        let docDetails = extractDocumentDetails(response);
        const actual = reducer(initialState, { type: '[Document] Load Document Details Complete', payload: docDetails });
        expect(actual.CurrentDocument).toBe(docDetails);
        expect(actual.ChangeHistoryLoaded).toBeFalsy();
        expect(actual.DistributionHistoryLoaded).toBeFalsy();
        expect(actual.EmployeeStatusLoaded).toBeFalsy();
    });

    it('it should dispatch LOAD_DOCUMENT_CHANGE_HISTORY action to load the document change history tab', () => {
        const actual = reducer(initialState, { type: '[Document] Load Document change history', payload: {} });
        expect(actual.ChangeHistoryLoaded).toBeFalsy();
    });

    it('it should dispatch LOAD_DOCUMENT_CHANGE_HISTORY action to complete the loading of document change history tab', () => {
        let response = getResponse(documentChangeHistory);
        const actual = reducer(initialState, { type: '[Document] Load Document change history Complete', payload: { DocumentChangeHistory: <AtlasApiResponse<ChangeHistoryModel>>response.json().Entities, ChangeHistoryPagingInfo: extractPagingInfo(response) } });
        expect(actual.DocumentChangeHistory).toEqual(documentChangeHistory.Entities);
        expect(actual.ChangeHistoryLoaded).toBeTruthy();
    });

    it('it should dispatch LOAD_DOCUMENT_DISTRIBUTE_HISTORY action to load the document distribution history tab', () => {
        const actual = reducer(initialState, { type: '[Document] Load document distribute history status', payload: {} });
        expect(actual.DistributionHistoryLoaded).toBeFalsy();
    });

    it('it should dispatch LOAD_DOCUMENT_DISTRIBUTE_HISTORY_COMPLETE action to complete the loading of document distribution history tab', () => {
        let response = getResponse(documentDistributeHistory);
        const actual = reducer(initialState, { type: '[Document] Load document distribute history status Complete', payload: response.json() });
        expect(actual.DocumentDistributionHistory).toEqual(documentDistributeHistory);
        expect(actual.DistributionHistoryLoaded).toBeTruthy();
    });

    it('it should dispatch LOAD_DOCUMENT_DISTRIBUTE_HISTORY_DELETE action to recall distributed document', () => {
        const actual = reducer(initialState, { type: '[Document] document distribute history delete', payload: {} });
        expect(actual.DistributionHistoryLoaded).toBeTruthy();
    });

    it('it should dispatch LOAD_DOCUMENT_DISTRIBUTE_HISTORY_DELETE_COMPLETE action to complete the recall of distributed document', () => {
        let firstRecord = documentDistributeHistory[0];
        let response = getResponse(firstRecord);
        const actual = reducer(initialState, { type: '[Document] document distribute history delete complete', payload: response.json() });
        expect(actual.CurrentDistributeDoc).toEqual(firstRecord);
        expect(actual.DistributionHistoryLoaded).toBeFalsy();
    });

    it('it should dispatch LOAD_DOCUMENT_DISTRIBUTE_HISTORY_LIST action to load document distribute history', () => {
        let moreRecords = [];
        for (let i = 0; i < 20; i++) {
            moreRecords = moreRecords.concat(documentDistributeHistory);
        }
        let slicedResponse = JSON.parse('[{"DistributedDocumentId":"d3f032c8-d35b-4f82-8f3f-85e4dd609e78","DocumentId":"6f45b11f-d948-4a62-b19f-d88ea4291d26","ActionedDate":"2017-11-13T10:04:00","RegardingObjectEntiyType":"Employee","RegardingOjbectEntityValues":" Bruce preemp","DocumentVersion":"3.0"},{"DistributedDocumentId":"d3f032c8-d35b-4f82-8f3f-85e4dd609e78","DocumentId":"6f45b11f-d948-4a62-b19f-d88ea4291d26","ActionedDate":"2017-11-13T10:04:00","RegardingObjectEntiyType":"Employee","RegardingOjbectEntityValues":" Bruce preemp","DocumentVersion":"3.0"},{"DistributedDocumentId":"d3f032c8-d35b-4f82-8f3f-85e4dd609e78","DocumentId":"6f45b11f-d948-4a62-b19f-d88ea4291d26","ActionedDate":"2017-11-13T10:04:00","RegardingObjectEntiyType":"Employee","RegardingOjbectEntityValues":" Bruce preemp","DocumentVersion":"3.0"},{"DistributedDocumentId":"d3f032c8-d35b-4f82-8f3f-85e4dd609e78","DocumentId":"6f45b11f-d948-4a62-b19f-d88ea4291d26","ActionedDate":"2017-11-13T10:04:00","RegardingObjectEntiyType":"Employee","RegardingOjbectEntityValues":" Bruce preemp","DocumentVersion":"3.0"},{"DistributedDocumentId":"d3f032c8-d35b-4f82-8f3f-85e4dd609e78","DocumentId":"6f45b11f-d948-4a62-b19f-d88ea4291d26","ActionedDate":"2017-11-13T10:04:00","RegardingObjectEntiyType":"Employee","RegardingOjbectEntityValues":" Bruce preemp","DocumentVersion":"3.0"},{"DistributedDocumentId":"d3f032c8-d35b-4f82-8f3f-85e4dd609e78","DocumentId":"6f45b11f-d948-4a62-b19f-d88ea4291d26","ActionedDate":"2017-11-13T10:04:00","RegardingObjectEntiyType":"Employee","RegardingOjbectEntityValues":" Bruce preemp","DocumentVersion":"3.0"},{"DistributedDocumentId":"d3f032c8-d35b-4f82-8f3f-85e4dd609e78","DocumentId":"6f45b11f-d948-4a62-b19f-d88ea4291d26","ActionedDate":"2017-11-13T10:04:00","RegardingObjectEntiyType":"Employee","RegardingOjbectEntityValues":" Bruce preemp","DocumentVersion":"3.0"},{"DistributedDocumentId":"d3f032c8-d35b-4f82-8f3f-85e4dd609e78","DocumentId":"6f45b11f-d948-4a62-b19f-d88ea4291d26","ActionedDate":"2017-11-13T10:04:00","RegardingObjectEntiyType":"Employee","RegardingOjbectEntityValues":" Bruce preemp","DocumentVersion":"3.0"},{"DistributedDocumentId":"d3f032c8-d35b-4f82-8f3f-85e4dd609e78","DocumentId":"6f45b11f-d948-4a62-b19f-d88ea4291d26","ActionedDate":"2017-11-13T10:04:00","RegardingObjectEntiyType":"Employee","RegardingOjbectEntityValues":" Bruce preemp","DocumentVersion":"3.0"},{"DistributedDocumentId":"d3f032c8-d35b-4f82-8f3f-85e4dd609e78","DocumentId":"6f45b11f-d948-4a62-b19f-d88ea4291d26","ActionedDate":"2017-11-13T10:04:00","RegardingObjectEntiyType":"Employee","RegardingOjbectEntityValues":" Bruce preemp","DocumentVersion":"3.0"}]');
        initialState.DocumentDistributionHistory = <DistributionHistoryModel[]>moreRecords;
        let samepleApiReqThree = new AtlasApiRequestWithParams(2, 10, 'ActionedDate', SortDirection.Descending, []);
        const actual = reducer(initialState, { type: '[Document] Load document distribute history', payload: samepleApiReqThree });
        expect(actual.DocumentDistributionHistoryList).toEqual(slicedResponse);
        let pageInfo = new PagingInfo(10, 60, 2, 10)
        expect(actual.DistributionHistoryPagingInfo).toEqual(pageInfo);
    });

    it('it should dispatch LOAD_DOCUMENT_EMPLOYEE_STATUS action to load the document employee action status history tab', () => {
        const actual = reducer(initialState, { type: '[Document] Load document employee status', payload: {} });
        expect(actual.EmployeeStatusLoaded).toBeFalsy();
    });

    it('it should dispatch LOAD_DOCUMENT_EMPLOYEE_STATUS_COMPLETE action to complete the loading of document employee action status history tab', () => {
        let response = getResponse(documentEmployeeActionStatusHistory);
        const actual = reducer(initialState, { type: '[Document] Load document employee status complete', payload: response.json() });
        expect(actual.DocumentEmployeeStatus).toEqual(documentEmployeeActionStatusHistory);
        expect(actual.EmployeeStatusLoaded).toBeTruthy();
    });

    it('it should dispatch LOAD_DOCUMENT_EMPLOYEE_STATUS_FOR_PAGING_SORTING action to load document employee action status on sort and page change', () => {
        initialState.DocumentEmployeeStatus = <EmployeeActionStatusModel[]>documentEmployeeActionStatusHistory;
        let samepleApiRequeste = new AtlasApiRequestWithParams(2, 10, 'DocumentVersion', SortDirection.Ascending, []);
        let slicedResponse = JSON.parse('[{"DistributedDocumentId":"ef380086-db83-4c67-80a1-ddad66e824dd","RegardingObjectId":"61e1c066-aac1-59dc-f382-46940e965bdf","RegardingObjectTypeCode":4,"EmployeeId":"ecd552e0-b3d9-426e-81d7-3e682996ce07","DocumentId":"ed868190-abc3-4ead-b1c3-69c7143dacc1","DocumentVersion":2.20,"DocumentVersionInfo":"2.20","ActionTaken":2,"ActionedDate":null,"EmployeeName":"Geeth employee","DocumentName":null,"DocumentAction":0,"Status":0,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","IsActive":1,"Signature":null}]');
        const actual = reducer(initialState, { type: '[Document] load document employee action status on sort and page change', payload: samepleApiRequeste });
        expect(actual.DocumentEmployeeStatusPagedList).toEqual(slicedResponse);
        let pageInfo = new PagingInfo(10, 11, 2, 10)
        expect(actual.EmployeeStatusPagingInfo).toEqual(pageInfo);
    });

    it('should dispatch DOCUMENT_DISTRIBUTE action to distribute the document', () => {
        const actual = reducer(initialState, { type: '[DocumentDistribute] Document distribute', payload: {} });
        expect(actual.DocumentDistributed).toBeFalsy();
    });

    it('should dispatch DOCUMENT_DISTRIBUTE_COMPLETE action when document distributed successfully', () => {
        const actual = reducer(initialState, { type: '[DocumentDistribute] Document distribute Complete', payload: {} });
        expect(actual.DocumentDistributed).toBeTruthy();
    });

    it('should dispatch LOAD_CQC_CATEGORIES_BY_SITEID_COMPLETE action to load CQC categories by site', () => {
        let cat = DocumentsMockStoreforCQCandDistribute.getCQCCategories();
        const actual = reducer(initialState, { type: '[CQCPRO] cqc categories complete', payload: cat });
        expect(actual.CQCCategories).toEqual(cat);
    });

    it('should dispatch LOAD_CQC_STANDARDS_BY_SITEID_COMPLETE action to load CQC standards by site', () => {
        let standards = DocumentsMockStoreforCQCandDistribute.getCQCStandards();
        const actual = reducer(initialState, { type: '[CQCPRO] cqc standards complete', payload: standards });
        expect(actual.CQCStandards).toEqual(standards);
    });

    it('should dispatch LOAD_CQC_USERS_BY_SITEID_COMPLETE action to load cqc users by site', () => {
        let users = extractCQCSelectOptionListData(getResponse(MSPreviewMockStoreProviderFactory.getUsersData()));
        const actual = reducer(initialState, { type: '[CQCPRO] cqc users complete', payload: users });
        expect(actual.CQCUsers).toEqual(users)
    });

    it('should dispatch LOAD_CQC_FILETYPES_BY_SITEID_COMPLETE action to load cqc file types by site', () => {
        let fileTypes = DocumentsMockStoreforCQCandDistribute.getCQCFileTypes();
        const actual = reducer(initialState, { type: '[CQCPRO] cqc file types complete', payload: fileTypes });
        expect(actual.CQCFileTypes).toEqual(fileTypes);
    });
});

// generates response object
function getResponse(body): Response {
    const options = new ResponseOptions({
        body: JSON.stringify(body)
    });
    return new Response(options);
}
