import { TestBed } from '@angular/core/testing';
import { Response, ResponseOptions } from '@angular/http';
import { URLSearchParams } from '@angular/http';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';

import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { getAtlasParamValueByKey } from '../../root-module/common/extract-helpers';
import { RestClientService } from '../../shared/data/rest-client.service';
import { AtlasApiRequestWithParams, AtlasParams } from '../../shared/models/atlas-api-response';
import { reducer } from '../../shared/reducers/index';
import { MessengerService } from '../../shared/services/messenger.service';
import { MockStoreSharedDocuments } from '../../shared/testing/mocks/mock-store-shared-documents';
import {
    CompanyDocumentsToReviewConfirmAction,
    CompanyDocumentsToReviewConfirmActionComplete,
    CompanyUsefulDocumentsToReviewConfirmAction,
    CompanyUsefulDocumentsToReviewConfirmActionComplete,
    LoadCompanyDocumentsToReview,
    LoadCompanyDocumentsToReviewComplete,
    LoadCompanyUsefulDocumentsToReview,
    LoadCompanyUsefulDocumentsToReviewComplete,
} from '../actions/shared-documents.actions';
import { processDistributedDocuments, processDistributedSharedDocuments } from '../common/document-extract-helper';
import { ActionedDocument } from '../models/DistributedDocument';
import { SharedDocumentsEffects } from './shared-documents.effects';

describe('Shared document effect', () => {
    let runner, effect, restClientServiceStub, store;
    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            SharedDocumentsEffects
            , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete']) }
            , MessengerService
        ]
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        effect = TestBed.get(SharedDocumentsEffects);
        restClientServiceStub = TestBed.get(RestClientService);
        store = TestBed.get(Store);
    });

    it('should return complete action on success of getting company distributed documents', () => {
        let docs = MockStoreSharedDocuments.getCompanyDistributedDocs();
        let params: Array<AtlasParams> = [new AtlasParams('DocumentAction', '1')];
        let apiParams: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'DataSent', SortDirection.Ascending, params);
        let options = new ResponseOptions({ body: processDistributedDocuments(docs) });
        let response = new Response(options);

        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadCompanyDocumentsToReview(apiParams));
        let expected = new LoadCompanyDocumentsToReviewComplete(processDistributedDocuments(docs));
        let actionStatus = getAtlasParamValueByKey(params, 'DocumentAction');

        let searchParams: URLSearchParams = new URLSearchParams();
        if (actionStatus) {
            searchParams.set('documentAction', actionStatus);
        }
        searchParams.set('employeeId', "00000000-0000-0000-0000-000000000000");
        searchParams.set('documentArea', "3");
        searchParams.set('pageNumber', apiParams.PageNumber.toString());
        searchParams.set('pageSize', apiParams.PageSize.toString());
        searchParams.set('sortField', apiParams.SortBy.SortField);
        searchParams.set('direction', apiParams.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
        effect.loadDocumentsToReview$.subscribe((result) => {
            expect(expected).toEqual(result);
            expect(restClientServiceStub.get).toHaveBeenCalledWith('EmpDocumentsView', { search: searchParams });
        });
    });

    it('company documents to review confirm action complete', () => {
        let params: Array<AtlasParams> = [new AtlasParams('DocumentAction', '1')];
        let apiParams: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'DataSent', SortDirection.Ascending, params);

        store.dispatch(new LoadCompanyDocumentsToReview(apiParams));

        let doc = new ActionedDocument();
        doc.ActionTakenOn = new Date();
        doc.DistributedDocumentId = '1234';
        doc.DocumentId = '7890';
        doc.DocumentVersion = '1.0';
        doc.EmployeeId = '3456';

        let options = new ResponseOptions({ body: doc });
        let response = new Response(options);

        restClientServiceStub.put.and.returnValue(Observable.of(response));
        runner.queue(new CompanyDocumentsToReviewConfirmAction(doc));

        let expected = [
            new CompanyDocumentsToReviewConfirmActionComplete(doc)
            , new LoadCompanyDocumentsToReview(apiParams)
        ]

        effect.actionOnDocument$.subscribe((result) => {
            expect(expected).toContain(result);
            expect(restClientServiceStub.put).toHaveBeenCalledWith('ActionedDocument', doc);
        })

    });

    it('should return complete action on success of getting useful documents and templates', () => {
        let docs = MockStoreSharedDocuments.getUsefulDocs();
        let params: Array<AtlasParams> = [new AtlasParams('DocumentAction', '1')];
        let apiParams: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'DataSent', SortDirection.Ascending, params);
        let options = new ResponseOptions({ body: processDistributedSharedDocuments(docs) });
        let response = new Response(options);

        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadCompanyUsefulDocumentsToReview(apiParams));
        let expected = new LoadCompanyUsefulDocumentsToReviewComplete(processDistributedSharedDocuments(docs));
        let actionStatus = getAtlasParamValueByKey(params, 'DocumentAction');

        let searchParams: URLSearchParams = new URLSearchParams();

        if (actionStatus) {
            searchParams.set('filterSharedDocByAction', actionStatus);
        }
        searchParams.set('pageNumber', apiParams.PageNumber.toString());
        searchParams.set('pageSize', apiParams.PageSize.toString());
        searchParams.set('sortField', apiParams.SortBy.SortField);
        searchParams.set('direction', apiParams.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');

        effect.loadUsefulDocumentsToReview$.subscribe((result) => {
            expect(expected).toEqual(result);
            expect(restClientServiceStub.get).toHaveBeenCalledWith('DistributedSharedDocumentView', { search: searchParams });
        });
    });

})