import { ClaimsHelperServiceStub } from './../../../shared/testing/mocks/claims-helper-service-mock';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
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
import {
    LoadContractsListAction
    , LoadContractsListCompleteAction
    , LoadPersonalContractsListCompleteAction
    , LoadContractsTemplateCountAction
    , LoadContractsTemplateCountCompleteAction
    , LoadPersonalContractsCountAction
    , LoadPersonalContractsCountCompleteAction
    , ContractsDataClearAction
    , SaveContractAsPDFAction
    , SaveContractAsPDFCompleteAction
    , UpdatePersonalisedItem
    , LoadAssociatedUserVersionDocument
    , LoadAssociatedUserVersionDocumentComplete
    , ContractsClearAction
} from './../actions/contracts.actions';
import { ContractsEffects } from './contracts.effects';

describe('Contracts Templates  effect: ', () => {
    let runner;
    let contractsEffects: ContractsEffects;
    let restClientServiceStub;
    //  let sharedDocument = new sharedDocument();
    let params: AtlasParams[] = new Array();
    params.push(new AtlasParams('contractsFilter', 1))
    let sampleContractApiRequest = new AtlasApiRequestWithParams(1, 10, 'Title', SortDirection.Ascending, params);
    let newparams: AtlasParams[] = new Array();
    newparams.push(new AtlasParams('contractsFilter', 2))
    let samplePersonalApiRequest = new AtlasApiRequestWithParams(1, 10, 'Title', SortDirection.Ascending, params);

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            ContractsEffects
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
        contractsEffects = TestBed.get(ContractsEffects);
        restClientServiceStub = TestBed.get(RestClientService);

    })

    it('Contracts Templates List', fakeAsync(() => () => {
        let mockedContractsTemplates = MockStoreProviderFactory.getMockContractTemplates();
        let options = new ResponseOptions({ body: mockedContractsTemplates });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadContractsListAction(sampleContractApiRequest));
        let expt = new LoadContractsListCompleteAction(mockedContractsTemplates);

        contractsEffects.loadContracts$.subscribe((result) => {
            tick(100);
            expect(result.payload).toEqual(expt.payload);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })
        restClientServiceStub.get.and.returnValue(Observable.of({}));
    }));

    it('Contracts Templates count', fakeAsync(() => () => {
        let mockedContractsTemplatesCount = MockStoreProviderFactory.getMockContractTemplatesCount();
        let options = new ResponseOptions({ body: mockedContractsTemplatesCount });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadContractsTemplateCountAction(true));
        let expt = new LoadContractsTemplateCountCompleteAction(mockedContractsTemplatesCount);

        contractsEffects.contractDocsCount$.subscribe((count) => {
            tick(100);
            expect(count.payload.PagingInfo.TotalCount).toEqual(expt.payload.PagingInfo.TotalCount);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })
        restClientServiceStub.get.and.returnValue(Observable.of({}));
    }));

    it('Personalised Contracts List', fakeAsync(() => () => {
        let mockedPersonalisedTemplates = MockStoreProviderFactory.getMockPersonalisedContractTemplates();
        let options = new ResponseOptions({ body: mockedPersonalisedTemplates });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadContractsListAction(samplePersonalApiRequest));
        let expt = new LoadPersonalContractsListCompleteAction(mockedPersonalisedTemplates);

        contractsEffects.loadContracts$.subscribe((result) => {
            tick(100);
            expect(result.payload).toEqual(expt.payload);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })
        restClientServiceStub.get.and.returnValue(Observable.of({}));
    }));

    it('Personalised Contracts count', fakeAsync(() => () => {
        let mockedPersonalisedTemplatesCount = MockStoreProviderFactory.getMockPersonalisedContractTemplatesCount();
        let options = new ResponseOptions({ body: mockedPersonalisedTemplatesCount });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadPersonalContractsCountAction(true));
        let expt = new LoadPersonalContractsCountCompleteAction(mockedPersonalisedTemplatesCount);

        contractsEffects.personalContractCount$.subscribe((count) => {
            tick(100);
            expect(count.payload.PagingInfo.TotalCount).toEqual(expt.payload.PagingInfo.TotalCount);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })
        restClientServiceStub.get.and.returnValue(Observable.of({}));
    }));

})