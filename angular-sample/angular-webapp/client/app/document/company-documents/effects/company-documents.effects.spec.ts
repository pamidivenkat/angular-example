import { CompanyDocumentsState } from '../reducers/company-documents-reducer';
import { TestBed } from '@angular/core/testing';
import { Http, Response, ResponseOptions, URLSearchParams } from '@angular/http';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';

import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { Document } from '../../../document/models/document';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { reducer } from '../../../shared/reducers/index';
import { MessengerService } from '../../../shared/services/messenger.service';
import { MockStoreCompanyDocuments } from '../../../shared/testing/mocks/mock-store-company-documents';
import { DocumentCategoryService } from '../../services/document-category-service';
import {
    LoadCompanyDocumentsAction,
    LoadCompanyDocumentsCompleteAction,
    LoadCompanyDocumentsStatAction,
    LoadCompanyDocumentsStatCompleteAction,
    RemoveCompanyDocumentAction,
    RemoveCompanyDocumentCompleteAction,
    UpdateCompanyDocumentAction,
    UpdateCompanyDocumentCompleteAction,
} from '../actions/company-documents.actions';
import { CompanyDocumentsEffects } from './company-documents.effects';


describe('Company document effect', () => {
    let runner, effect, restClientServiceStub, store;
    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            CompanyDocumentsEffects
            , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete']) }
            , MessengerService
            , Http
            , DocumentCategoryService
        ]
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        effect = TestBed.get(CompanyDocumentsEffects);
        restClientServiceStub = TestBed.get(RestClientService);
        store = TestBed.get(Store);
    });

    it('should load document stats', () => {
        let options = new ResponseOptions({ body: MockStoreCompanyDocuments.companyDocumentStatsMock() });
        let response = new Response(options);

        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadCompanyDocumentsStatAction());
        let expected = new LoadCompanyDocumentsStatCompleteAction(MockStoreCompanyDocuments.companyDocumentStatsMock());

        effect.loadDocumentStats$.subscribe((result) => {
            expect(expected).toEqual(result);
            let searchParams: URLSearchParams = new URLSearchParams();
            searchParams.set('isDocumentStats', 'true');
            searchParams.set('temp1', 'true');
            expect(restClientServiceStub.get).toHaveBeenCalledWith('DocumentView', { search: searchParams });
        });
    });

    it('should load documents', () => {
        let options = new ResponseOptions({ body: MockStoreCompanyDocuments.getHandbooksDataMock() });
        let response = new Response(options);
        let params: AtlasParams[] = [];
        params.push(new AtlasParams('DocumentFolder', 1))
        let apiRequest = new AtlasApiRequestWithParams(1, 10, 'FileNameAndTitle', SortDirection.Ascending, params);

        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadCompanyDocumentsAction(apiRequest));
        let expected = new LoadCompanyDocumentsCompleteAction(MockStoreCompanyDocuments.getHandbooksDataMock());

        effect.loadDocuments$.subscribe((result) => {
            expect(expected).toEqual(result);
            let searchParams: URLSearchParams = new URLSearchParams();
            searchParams.set('isDocumentStats', 'true');
            searchParams.set('temp1', 'true');
            expect(restClientServiceStub.get).toHaveBeenCalledWith('DocumentView', { search: searchParams });
        });
    });

    it('should delete company document', () => {
        let options = new ResponseOptions({ body: '1234' });
        let response = new Response(options);

        let doc = new Document();
        doc.Id = '1234';
        restClientServiceStub.delete.and.returnValue(Observable.of(response));
        runner.queue(new RemoveCompanyDocumentAction(doc));
        let expected = new RemoveCompanyDocumentCompleteAction();

        effect.deleteCompanyDocument$.subscribe((result) => {
            expect(expected).toEqual(result);

            expect(restClientServiceStub.delete).toHaveBeenCalledWith('document/' + doc.Id);
        });

    });

    it('should update company document', () => {
        let doc = new Document();
        doc.Id = '1234';
        doc.FileName = 'test';
        doc.ShouldReloadList = true;

        let data = {
            payload: doc
            , companyDocumentState: Object.assign({})
        }

        let options = new ResponseOptions({ body: doc });
        let response = new Response(options);

        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new UpdateCompanyDocumentAction(doc));

        let expected = new UpdateCompanyDocumentCompleteAction(doc);

        effect.updateCompanyDocument$.subscribe((result) => {
            expect(expected).toEqual(result);

            // expect(restClientServiceStub.post).toHaveBeenCalledWith('document', doc);
        });
    });
});