
import { TestBed } from '@angular/core/testing';
import { Response, ResponseOptions } from '@angular/http';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';

import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { RestClientService } from '../../shared/data/rest-client.service';
import { AtlasApiRequestWithParams, AtlasParams } from '../../shared/models/atlas-api-response';
import { reducer } from '../../shared/reducers/index';
import {
    CompanyDocumentsToReviewConfirmAction,
    CompanyDocumentsToReviewConfirmActionComplete,
    LoadCompanyDocumentsToReview,
    LoadCompanyDocumentsToReviewComplete,
} from '../actions/shared-documents.actions';
import { PersonalDocumentEffects } from './../../document/effects/personal-documents.effects';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { MessengerService } from '../../shared/services/messenger.service';
import { PersonalDocumentsMockStoreProviderFactory } from '../../shared/testing/mocks/personal-doc-mock-store-provider-factory';
import { URLSearchParams } from '@angular/http';
import { LoadPersonalDocuments, LoadPersonalDocumentsComplete, LoadSelectedDocument, LoadSelectedDocumentComplete, RemoveDocument, RemoveDocumentComplete } from '../../document/actions/document.actions';

describe('Personal Documents effect', () => {
    let runner, effect, restClientServiceStub, store;
    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            PersonalDocumentEffects
            , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete']) }
            , MessengerService
        ]
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        effect = TestBed.get(PersonalDocumentEffects);
        restClientServiceStub = TestBed.get(RestClientService);
        store = TestBed.get(Store);
    });

    it('should return personal document complete action on success of loading personal documents', () => {
        let docs = PersonalDocumentsMockStoreProviderFactory.getPersonalDocuments();

        let options = new ResponseOptions({ body: docs });
        let response = new Response(options);

        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadPersonalDocuments(true));
        let expected = new LoadPersonalDocumentsComplete(docs);

        let params: URLSearchParams = new URLSearchParams();
        let apiUrl = 'documentvault';
        params.set('pageNumber', '1');
        params.set('pageSize', '50');
        params.set('sortField', 'CreatedOn');
        params.set('sortOrder', 'DESC');
        params.set('action', 'GetDocumentsByRegardingObjectId');

        effect.personalDocuments$.subscribe((result) => {
            expect(expected).toEqual(result);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        });
    });

    it('should return selected personal document on success of loading selected personal document', () => {

        let selectedDoc = PersonalDocumentsMockStoreProviderFactory.getPersonalDocuments()[0];
        let options = new ResponseOptions({ body: selectedDoc });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadSelectedDocument(selectedDoc.Id));
        let expected = new LoadSelectedDocumentComplete(selectedDoc);

        effect.selectDocument$.subscribe((result) => {
            expect(expected).toEqual(result);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        });
    });

    it('should return status as true on success of deleting the selected personal documnet', () => {

        let selectedDoc = PersonalDocumentsMockStoreProviderFactory.getPersonalDocuments()[0];
        let options = new ResponseOptions({ body: true });
        let response = new Response(options);
        restClientServiceStub.delete.and.returnValue(Observable.of(response));
        runner.queue(new RemoveDocument(selectedDoc));
        let expected = new RemoveDocumentComplete(true);

        effect.deleteDocument$.subscribe((result) => {
            expect(expected).toEqual(result);
            expect(restClientServiceStub.delete).toHaveBeenCalled();
        });
    });
});