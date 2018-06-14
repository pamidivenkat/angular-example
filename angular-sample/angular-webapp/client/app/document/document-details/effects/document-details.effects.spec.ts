import { DocumentDetailsEffects } from './document-details.effects';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EffectsTestingModule, EffectsRunner } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { reducer } from './../../../shared/reducers';
import { MessengerService } from './../../../shared/services/messenger.service';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { Observable } from 'rxjs';
import { ResponseOptions, Response, URLSearchParams } from '@angular/http';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { LoadDocumentDetails, LoadDocumentDetailsComplete, LoadDocumentChangeHistory, LoadDocumentChangeHistoryComplete, LoadDocumentDistributionHistory, LoadDocumentDistributionHistoryComplete, LoadDocumentDistributeHistoryDelete, LoadDocumentDistributeHistoryDeleteComplete, LoadDocumentDistributeHistoryList, LoadDocumentEmployeeStatus, LoadDocumentEmployeeStatusComplete } from './../actions/document-details.actions';
import { DocumentDetailsType } from './../models/document-details-model';
import { extractDocumentDetails } from './../common/document-details-extract-helper';
import { AtlasApiRequestWithParams, AtlasParams, AtlasApiRequest } from './../../../shared/models/atlas-api-response';
import { SortDirection } from './../../../atlas-elements/common/models/ae-sort-model';
import { DocumentsMockStoreProviderFactory } from './../../../shared/testing/mocks/documents-moc-store-provider-factory';
import { extractPagingInfo } from './../../../report/common/extract-helper';

describe('Document Details effect: ', () => {
    let runner;
    let documentDetailEffects: DocumentDetailsEffects;
    let restClientServiceStub;
    let documentId: string = '1759e131-5729-4eb4-855d-30922834c16a';

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            DocumentDetailsEffects
            , {
                provide: RestClientService
                , useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete'])
            }
            // useClass: RestClientServiceStub 
            , MessengerService
        ]
        , declarations: []
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        documentDetailEffects = TestBed.get(DocumentDetailsEffects);
        restClientServiceStub = TestBed.get(RestClientService);
    });

    it('Gets the document by id', () => {
        let mockDocument = MockStoreProviderFactory.getDocumentMockData();
        let options = new ResponseOptions({ body: mockDocument });
        let response = new Response(options);
        let extractDocDetails = extractDocumentDetails(response);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadDocumentDetails({
            DocumentId: 'f86ce3d4-8160-4bdb-8f86-a7b5f9ed7a44'
            , DocumentType: DocumentDetailsType.Document
        }));
        let expt = new LoadDocumentDetailsComplete(extractDocDetails);

        documentDetailEffects.loadDocumentDetailsById$.subscribe((result) => {
            // tick(100);
            expect(result.payload).toEqual(expt.payload);
            expect(restClientServiceStub.get).toHaveBeenCalled();
            expect(restClientServiceStub.get).toHaveBeenCalledWith('document/f86ce3d4-8160-4bdb-8f86-a7b5f9ed7a44');
        });

        restClientServiceStub.get.and.returnValue(Observable.of({}));
    });

    it('Gets the shared document by id', (() => {
        let mockDocument = MockStoreProviderFactory.getMockedSharedDocumentData();

        let options = new ResponseOptions({ body: mockDocument });
        let response = new Response(options);
        let extractDocDetails = extractDocumentDetails(response);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadDocumentDetails({
            DocumentId: 'e911ee03-f6e5-4c5f-83a6-72795baf6c22'
            , DocumentType: DocumentDetailsType.SharedDocument
        }));
        let expt = new LoadDocumentDetailsComplete(extractDocDetails);

        documentDetailEffects.loadDocumentDetailsById$.subscribe((result) => {
            expect(result.payload).toEqual(expt.payload);
            expect(restClientServiceStub.get).toHaveBeenCalled();
            expect(restClientServiceStub.get).toHaveBeenCalledWith('SharedDocument/e911ee03-f6e5-4c5f-83a6-72795baf6c22');
        });

        restClientServiceStub.get.and.returnValue(Observable.of({}));
    }));

    it('Gets the document change history by id', (() => {
        let mockDocumentHistory = MockStoreProviderFactory.getMockedDocumentHistory();

        let options = new ResponseOptions({ body: mockDocumentHistory });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        let params: AtlasParams[] = new Array();
        let param = new AtlasParams('filterDocumentVersion', documentId);
        params.push(param);
        param = new AtlasParams('filterDocumentVersionYear', '0');
        params.push(param);
        let sampleApiRequest = new AtlasApiRequestWithParams(1, 10, 'Version', SortDirection.Ascending, params);
        runner.queue(new LoadDocumentChangeHistory(sampleApiRequest));
        let expt = new LoadDocumentChangeHistoryComplete({ DocumentChangeHistory: mockDocumentHistory.Entities, ChangeHistoryPagingInfo: extractPagingInfo(response) });

        let searchParams: URLSearchParams = new URLSearchParams();
        searchParams.set('filterDocumentVersionYear', '0');
        searchParams.set('filterDocumentVersion', documentId);
        searchParams.set('pageNumber', sampleApiRequest.PageNumber.toString());
        searchParams.set('pageSize', sampleApiRequest.PageSize.toString());
        searchParams.set('sortField', sampleApiRequest.SortBy.SortField);
        searchParams.set('direction', sampleApiRequest.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');

        documentDetailEffects.getDocuemntChangeHistory$.subscribe((result) => {
            expect(result.payload).toEqual(expt.payload);
            expect(restClientServiceStub.get).toHaveBeenCalled();
            expect(restClientServiceStub.get).toHaveBeenCalledWith('documentproducerversionhistoryview/getspecificfields', { search: searchParams });
        });

        restClientServiceStub.get.and.returnValue(Observable.of({}));
    }));

    it('Gets the document distribute history by id', (() => {
        let mockDocumentDistHistory = MockStoreProviderFactory.getMockedDistributionHistory();

        let options = new ResponseOptions({ body: mockDocumentDistHistory });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        let params: AtlasParams[] = [];
        let param = new AtlasParams('DocumentId', documentId);
        params.push(param);
        let searchParams: URLSearchParams = new URLSearchParams();
        searchParams.set('bypass', 'true');
        searchParams.set('DocumentId', documentId);
        let sampleApiRequest = new AtlasApiRequestWithParams(1, 10, 'Version', SortDirection.Ascending, params);
        runner.queue(new LoadDocumentDistributionHistory(sampleApiRequest));
        let expt = new LoadDocumentDistributionHistoryComplete(mockDocumentDistHistory);

        documentDetailEffects.getDocuemntChangeHistory$.subscribe((result) => {
            expect(result.payload).toEqual(expt.payload);
            expect(restClientServiceStub.get).toHaveBeenCalled();
            expect(restClientServiceStub.get).toHaveBeenCalledWith('DistributedDocument', { search: searchParams });
        });

        restClientServiceStub.get.and.returnValue(Observable.of({}));
    }));

    it('Recalls the distributed document', (() => {
        let mockDocumentDistHistory = MockStoreProviderFactory.getMockedDistributionHistory();
        let firstRecord = Array.from(mockDocumentDistHistory)[0];
        let options = new ResponseOptions({ body: firstRecord });
        let response = new Response(options);
        restClientServiceStub.delete.and.returnValue(Observable.of(response));
        runner.queue(new LoadDocumentDistributeHistoryDelete(<AtlasApiRequestWithParams>firstRecord));
        let samepleApiReqTwo = new AtlasApiRequest(1, 10, 'RegardingObjectEntiyType', SortDirection.Descending);
        let atlasThreeParams: AtlasParams[] = [];
        atlasThreeParams.push(new AtlasParams('DocumentId', firstRecord['DocumentId']));
        let samepleApiReqThree = new AtlasApiRequestWithParams(1, 10, 'ActionedDate', SortDirection.Descending, atlasThreeParams);
        let expt = [
            new LoadDocumentDistributeHistoryDeleteComplete(true)
            , new LoadDocumentDistributeHistoryList(samepleApiReqTwo)
            , new LoadDocumentEmployeeStatus(samepleApiReqThree)
        ];

        documentDetailEffects.loadDistributeDocDelete$.subscribe((result) => {
            expect(expt).toContain(result);
            expect(restClientServiceStub.delete).toHaveBeenCalled();
            expect(restClientServiceStub.delete).toHaveBeenCalledWith('DistributedDocument/' + firstRecord['DistributedDocumentId']);
        });

        restClientServiceStub.get.and.returnValue(Observable.of({}));
    }));

    it('Load document employee action status history by id', (() => {
        let mockDocumentEmployeeActionHistory = DocumentsMockStoreProviderFactory.getDocumentEmployeeActionStatusData();

        let options = new ResponseOptions({ body: mockDocumentEmployeeActionHistory });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        let params: AtlasParams[] = [];
        let param = new AtlasParams('DocumentId', documentId);
        params.push(param);
        let searchParams: URLSearchParams = new URLSearchParams();
        searchParams.set('employeeId', `00000000-0000-0000-0000-000000000000`)
        searchParams.set('isForStats', `true`);
        let sampleApiRequest = new AtlasApiRequestWithParams(1, 10, 'DocumentVersion', SortDirection.Ascending, params);
        runner.queue(new LoadDocumentEmployeeStatus(sampleApiRequest));
        let expt = new LoadDocumentEmployeeStatusComplete(mockDocumentEmployeeActionHistory);

        documentDetailEffects.getEmployeeActionStatusList$.subscribe((result) => {
            expect(result.payload).toEqual(expt.payload);
            expect(restClientServiceStub.get).toHaveBeenCalled();
            expect(restClientServiceStub.get).toHaveBeenCalledWith('document', { search: searchParams });
        });

        restClientServiceStub.get.and.returnValue(Observable.of({}));
    }));
});
