import * as Immutable from 'immutable';
import { sharedDocument } from './../models/sharedDocument';
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
import { LoadUsefulDocsListAction, LoadUsefulDocsListCompleteAction, LoadUsefulDocsCountAction, LoadUsefulDocsCountCompleteAction, UsefulDocsClearAction } from  './../actions/usefuldocs.actions';
import { UsefulDocsEffects } from './usefuldocs.effects';

describe('Useful Documents  effect: ', () => {
    let runner;
    let usefulDocsEffects: UsefulDocsEffects;
    let restClientServiceStub;
  //  let sharedDocument = new sharedDocument();
    let sampleApiRequest = new AtlasApiRequestWithParams(1, 10, 'Title', SortDirection.Ascending, [])

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            UsefulDocsEffects
            , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete']) } // useClass: RestClientServiceStub 
            , MessengerService
          //  , DocumentCategoryService
        ]
        , declarations: [
        ]
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        usefulDocsEffects = TestBed.get(UsefulDocsEffects);
        restClientServiceStub = TestBed.get(RestClientService);
    })

    it('Useful docs List', fakeAsync(() => () => {
        let mockedUsefulDocs = MockStoreProviderFactory.getMockUsefulDocument();
        let options = new ResponseOptions({ body: mockedUsefulDocs });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadUsefulDocsListAction(sampleApiRequest));
        let expt = new LoadUsefulDocsListCompleteAction(mockedUsefulDocs);

        usefulDocsEffects.loadUsefulDocs$.subscribe((result) => {
            tick(100);
            expect(result.payload).toEqual(expt.payload);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })
        restClientServiceStub.get.and.returnValue(Observable.of({}));
    }));

    it('Useful docs count', fakeAsync(() => () => {
        let mockedUsefulDocsCount = MockStoreProviderFactory.getMockUsefulDocumentTotal();
        let options = new ResponseOptions({ body: mockedUsefulDocsCount });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadUsefulDocsCountAction(true));
        let expt = new LoadUsefulDocsCountCompleteAction(mockedUsefulDocsCount);

        usefulDocsEffects.usefulDocsCount$.subscribe((count) => {
            tick(100);
            expect(count.payload.PagingInfo.TotalCount).toEqual(expt.payload.PagingInfo.TotalCount);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })
        restClientServiceStub.get.and.returnValue(Observable.of({}));
    }));


})