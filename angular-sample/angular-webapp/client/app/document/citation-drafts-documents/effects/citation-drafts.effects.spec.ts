import { DocumentCategoryService } from './../../services/document-category-service';
import * as Immutable from 'immutable';
import { Document } from './../../models/document';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { AtlasApiRequestWithParams, AtlasApiRequest, AtlasParams, AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { RouteParams } from './../../../shared/services/route-params';
import { RouteParamsMock } from './../../../shared/testing/mocks/route-params-mock';
import { AuthConfig } from './../../../shared/security/auth-config';
import { AuthorizationServiceStub } from './../../../shared/testing/mocks/authorization-service-mock';
import { AuthorizationService } from './../../../shared/security/authorization.service';
import { HttpStub } from './../../../shared/testing/mocks/http-stub';
import { RestClientServiceStub } from './../../../shared/testing/mocks/rest-client-service-stub';
import { CatchErrorAction } from './../../../shared/actions/error.actions';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { Http, RequestOptions, Response, ResponseOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { reducer } from './../../../shared/reducers/index';
import { MessengerService } from './../../../shared/services/messenger.service';
import * as errorActions from './../../../shared/actions/error.actions';
import { SortDirection } from "./../../../atlas-elements/common/models/ae-sort-model";
import { LoadCitationDraftsListAction, LoadCitationDraftsListCompleteAction, CitationDraftsClearAction } from  './../actions/citation-drafts.actions';
import { CitationDraftsEffects } from './citation-drafts.effects';

describe('Citation Drafts effect: ', () => {
    let runner;
    let citationDraftsEffects: CitationDraftsEffects;
    let restClientServiceStub;
    let statisticsInfo = new Document();
    let sampleApiRequest = new AtlasApiRequestWithParams(1, 10, 'FileNameAndTitle', SortDirection.Ascending, []);

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            CitationDraftsEffects
            , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete']) } // useClass: RestClientServiceStub 
            , MessengerService
            , DocumentCategoryService
        ]
        , declarations: [
        ]
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        citationDraftsEffects = TestBed.get(CitationDraftsEffects);
        restClientServiceStub = TestBed.get(RestClientService);
    })

    it('Citation Drafts List', fakeAsync(() => () => {
        let mockedCitationDrafts = MockStoreProviderFactory.getMockDocumentDrafts();
        let options = new ResponseOptions({ body: mockedCitationDrafts });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadCitationDraftsListAction(sampleApiRequest));
        let expt = new LoadCitationDraftsListCompleteAction(mockedCitationDrafts);

        citationDraftsEffects.loadCitationsDrafts$.subscribe((result) => {
            tick(100);
            expect(result.payload).toEqual(expt.payload);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })

        restClientServiceStub.get.and.returnValue(Observable.of({}));
    }));

})