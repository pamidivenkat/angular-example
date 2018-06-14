import { MockStoreHandbookDocuments } from './../../../shared/testing/mocks/mock-store-documents-handbooks';
import { ClaimsHelperServiceStub } from './../../../shared/testing/mocks/claims-helper-service-mock';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import * as Immutable from 'immutable';
import { Document } from './../../models/document';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { AtlasApiRequestWithParams, AtlasApiRequest, AtlasParams, AtlasApiResponse } from './../../../shared/models/atlas-api-response';
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
import {
    LoadHandbooksListAction
    , LoadHandbooksListCompleteAction
    , LoadHandbooksDocsCountAction
    , LoadHandbooksDocsCountCompleteAction
    , HandbooksListClearAction
} from './../actions/handbooks.actions';
import { HandbooksEffects } from './handbooks.effects';

describe('Handbooks effect: ', () => {
    let runner;
    let handbooksEffects: HandbooksEffects;
    let restClientServiceStub;
    //  let sharedDocument = new sharedDocument();
    let params: AtlasParams[] = new Array();
    let handbookApiRequest = new AtlasApiRequestWithParams(1, 10, 'FileNameAndTitle', SortDirection.Ascending, params);

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            HandbooksEffects
            , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete']) } // useClass: RestClientServiceStub 
            , MessengerService
            , { provide: Http, useClass: HttpStub }
            , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
            //  , DocumentCategoryService
        ]
        , declarations: [
        ]
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        handbooksEffects = TestBed.get(HandbooksEffects);
        restClientServiceStub = TestBed.get(RestClientService);

    })

    it('Handbooks List', fakeAsync(() => () => {
        let mockedHandbooks = MockStoreHandbookDocuments.getHandbookDocuments();
        let options = new ResponseOptions({ body: mockedHandbooks });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadHandbooksListAction(handbookApiRequest));
        let expt = new LoadHandbooksListCompleteAction(mockedHandbooks);

        handbooksEffects.loadHandbooks$.subscribe((result) => {
            tick(100);
            expect(result.payload).toEqual(expt.payload);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })
        restClientServiceStub.get.and.returnValue(Observable.of({}));
    }));

    it('Handbooks count', fakeAsync(() => () => {
        let mockedHandbookCount = MockStoreHandbookDocuments.getHandbookStats();
        let options = new ResponseOptions({ body: mockedHandbookCount });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadHandbooksDocsCountAction(true));
        let expt = new LoadHandbooksDocsCountCompleteAction(mockedHandbookCount);

        handbooksEffects.handbookDocsCount$.subscribe((count) => {
            tick(100);
            expect(count.payload.PagingInfo.TotalCount).toEqual(expt.payload.PagingInfo.TotalCount);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })
        restClientServiceStub.get.and.returnValue(Observable.of({}));
    }));  

})