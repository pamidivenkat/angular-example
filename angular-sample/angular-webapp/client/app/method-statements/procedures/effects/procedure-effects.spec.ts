import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { AtlasApiRequestWithParams, AtlasParams, AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { RouteParams } from '../../../shared/services/route-params';
import { RouteParamsMock } from '../../../shared/testing/mocks/route-params-mock';
import { AuthConfig } from '../../../shared/security/auth-config';
import { AuthorizationServiceStub } from '../../../shared/testing/mocks/authorization-service-mock';
import { AuthorizationService } from '../../../shared/security/authorization.service';
import { HttpStub } from '../../../shared/testing/mocks/http-stub';
import { RestClientServiceStub } from '../../../shared/testing/mocks/rest-client-service-stub';
import { CatchErrorAction } from '../../../shared/actions/error.actions';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { Http, RequestOptions, Response, ResponseOptions, URLSearchParams } from '@angular/http';
import { Procedure } from '../models/procedure';
import {
    LoadProceduresAction, LoadProceduresCompleteAction, LoadProcedureByIdAction, LoadProcedureByIdCompleteAction, CopyProcedureAction,
    CopyProcedureCompleteAction, AddProcedureAction, AddProcedureCompleteAction, UpdateProcedureAction, UpdateProcedureCompleteAction,
    RemoveProcedureAction, RemoveProcedureCompleteAction, LoadExampleProceduresTotalCountAction, LoadExampleProceduresTotalCountCompleteAction,
    LoadProceduresTotalCountAction, LoadProceduresTotalCountCompleteAction
} from '../actions/procedure-actions';
import { Observable } from 'rxjs/Rx';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { reducer } from '../../../shared/reducers/index';
import { MessengerService } from '../../../shared/services/messenger.service';
import { ProcedureEffects } from './procedure-effects';
import * as errorActions from '../../../shared/actions/error.actions';
import { SortDirection } from "../../../atlas-elements/common/models/ae-sort-model";


describe('Procedure effect: ', () => {
    let runner;
    let procedureEffect: ProcedureEffects;
    let restClientServiceStub;
    let procedure: Procedure = new Procedure();
    let sampleApiRequestParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams("example", false)]);

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            ProcedureEffects
            , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete']) } // useClass: RestClientServiceStub 
            , MessengerService
        ]
        , declarations: [
        ]
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        procedureEffect = TestBed.get(ProcedureEffects);
        restClientServiceStub = TestBed.get(RestClientService);
    })

    it('complete action for the Proceudre List', () => {

        let mockedProcedures = MockStoreProviderFactory.getTestProcedures();
        let options = new ResponseOptions({ body: mockedProcedures });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadProceduresAction(sampleApiRequestParams));
        let expt = new LoadProceduresCompleteAction(<AtlasApiResponse<Procedure>>mockedProcedures);

        procedureEffect.ProcedureData$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })

        restClientServiceStub.get.and.returnValue(Observable.of({}));

    });

    it('Procedure data by ID', () => {
        let mockedProceduresById = MockStoreProviderFactory.getTestSelectedProcedureData();
        procedure.Id = '69e77d39-c6af-4cd1-a042-09cc32ea4189';
        let options = new ResponseOptions({ body: procedure });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadProcedureByIdAction(procedure));
        let expt = new LoadProcedureByIdCompleteAction(<Procedure>mockedProceduresById);

        procedureEffect.procedureDetailsLoadById$.subscribe((result) => {
            expect(result.payload.Id).toEqual(expt.payload.Id);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })
        restClientServiceStub.get.and.returnValue(Observable.of({}));

    })

    it('Copying Procedure data', fakeAsync(() => () => {
        let sampleApiRequestParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams("example", false)]);
        let mockedProceduresById = MockStoreProviderFactory.getTestSelectedProcedureData();
        mockedProceduresById.Name = '00001Procedure Copy';
        let options = new ResponseOptions({ body: mockedProceduresById });
        let response = new Response(options);
        restClientServiceStub.put.and.returnValue(Observable.of(response));
        runner.queue(new CopyProcedureAction(mockedProceduresById));
        let exp = [
            new CopyProcedureCompleteAction(<Procedure>mockedProceduresById),
            new LoadProceduresAction(sampleApiRequestParams)
        ];
        let apiParams = new URLSearchParams();

        procedureEffect.procedureCopy$.subscribe((result) => {
            tick(100);
            expect(exp).toContain(result);
            expect(restClientServiceStub.put).toHaveBeenCalledWith('procedure', procedure, { search: apiParams });
        })

    }));

    it('Procedure Adding newly', fakeAsync(() => () => {
        let sampleApiRequestParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams("example", false)]);
        let procedure: Procedure = new Procedure();
        procedure.Name = 'New procedure';
        let options = new ResponseOptions({ body: procedure });
        let response = new Response(options);

        restClientServiceStub.put.and.returnValue(Observable.of(response));
        runner.queue(new AddProcedureAction(procedure));
        let apiParams = new URLSearchParams();
        let expt = [
            new AddProcedureCompleteAction(<Procedure>procedure),
            new LoadProceduresAction(sampleApiRequestParams),
        ]

        procedureEffect.SetProcedureAdd$.subscribe((result) => {
            tick(200);
            expect(expt).toContain(result);
            expect(restClientServiceStub.put).toHaveBeenCalledWith('procedure', procedure, { search: apiParams });
        })
    }));

    it('Procedure updating existing', fakeAsync(() => () => {
        let sampleApiRequestParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams("example", false)]);
        let procedure: Procedure = new Procedure();
        procedure.Name = 'Update procedure';
        let options = new ResponseOptions({ body: procedure });
        let response = new Response(options);

        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new UpdateProcedureAction(procedure));
        let apiParams = new URLSearchParams();
        let expt = [
            new UpdateProcedureCompleteAction(<Procedure>procedure),
            new LoadProceduresAction(sampleApiRequestParams),
        ]

        procedureEffect.SetProcedureUpdate$.subscribe((result) => {
            tick(300);
            expect(expt).toContain(result);
            expect(restClientServiceStub.post).toHaveBeenCalledWith('procedure', procedure, { search: apiParams });
        })
    }));

    it('Procedure deleting', fakeAsync(() => () => {
        procedure.Id = '12345';
        let mockedProceduresById = MockStoreProviderFactory.getTestSelectedProcedureData();
        let options = new ResponseOptions({ body: mockedProceduresById });
        let response = new Response(options);
        let sampleApiRequestParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams("example", false)]);

        restClientServiceStub.delete.and.returnValue(Observable.of(response));
        runner.queue(new RemoveProcedureAction(procedure));
        let apiParams = new URLSearchParams();
        let expt = [
            new RemoveProcedureCompleteAction(true)
            , new LoadProceduresAction(sampleApiRequestParams),
        ];

        procedureEffect.procedureDetailsDelete$.subscribe((result) => {
            expect(expt).toContain(result);
            expect(restClientServiceStub.delete).toHaveBeenCalledWith('procedure/' + procedure);
        })
    }));

    it('Example Procedure Totalcount', () => {

        let mockedProcedures = MockStoreProviderFactory.getTestProcedures();
        let options = new ResponseOptions({ body: mockedProcedures });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadExampleProceduresTotalCountAction());
        let expt = new LoadExampleProceduresTotalCountCompleteAction(mockedProcedures.PagingInfo.TotalCount);

        procedureEffect.ProcedureData$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })

        restClientServiceStub.get.and.returnValue(Observable.of({}));

    });

    it('Procedure Totalcount', () => {

        let mockedProcedures = MockStoreProviderFactory.getTestProcedures();
        let options = new ResponseOptions({ body: mockedProcedures });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadProceduresTotalCountAction());
        let expt = new LoadProceduresTotalCountCompleteAction(mockedProcedures.PagingInfo.TotalCount);

        procedureEffect.ProcedureData$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })

        restClientServiceStub.get.and.returnValue(Observable.of({}));

    });


})