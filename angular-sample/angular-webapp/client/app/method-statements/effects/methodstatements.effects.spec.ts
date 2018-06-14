import { isNullOrUndefined } from 'util';
import { ClaimsHelperServiceStub } from './../../shared/testing/mocks/claims-helper-service-mock';
import { ClaimsHelperService } from './../../shared/helpers/claims-helper';
import { MockStoreProviderFactory } from './../../shared/testing/mocks/mock-store-provider-factory';
import { AtlasApiRequestWithParams, AtlasParams, AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { RouteParams } from '../../shared/services/route-params';
import { RouteParamsMock } from './../../shared/testing/mocks/route-params-mock';
import { AuthConfig } from './../../shared/security/auth-config';
import { AuthorizationServiceStub } from './../../shared/testing/mocks/authorization-service-mock';
import { AuthorizationService } from './../../shared/security/authorization.service';
import { HttpStub } from './../../shared/testing/mocks/http-stub';
import { RestClientServiceStub } from './../../shared/testing/mocks/rest-client-service-stub';
import { CatchErrorAction } from './../../shared/actions/error.actions';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import { Http, RequestOptions, Response, ResponseOptions, URLSearchParams } from '@angular/http';
import { MethodStatements, MethodStatement, MethodStatementStat, UpdateStatusModel } from './../models/method-statement';
import {
    LoadMethodStatementsStatsAction, LoadMethodStatementsListAction, LoadMethodStatementsStatsCompleteAction
    , RemoveMethodStatementAction, RemoveMethodStatementCompleteAction, UpdateStatusMethodStatementAction
    , UpdateStatusMethodStatementCompleteAction, CopyMethodStatementAction
} from "./../actions/methodstatements.actions";
import { Observable } from 'rxjs/Rx';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { RestClientService } from './../../shared/data/rest-client.service';
import { reducer } from './../../shared/reducers/index';
import { MessengerService } from './../../shared/services/messenger.service';
import { MethodStatementsEffects } from './methodstatements.effects';
import * as errorActions from './../../shared/actions/error.actions';
import { SortDirection } from "./../../atlas-elements/common/models/ae-sort-model";
import { RouterMock } from './../../shared/testing/mocks/router-stub';
import { Router, ActivatedRoute, UrlSegment, NavigationExtras } from '@angular/router';

describe('MethodStatemnt effect: ', () => {
    let runner;
    let msEffects: MethodStatementsEffects;
    let restClientServiceStub;
    let methodStatements: MethodStatements = new MethodStatements();
    let methodStatement: MethodStatement = new MethodStatement();
    let methodStatementStat: UpdateStatusModel = new UpdateStatusModel();

    let sampleApiRequestParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, []);


    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule

            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            MethodStatementsEffects
            , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete']) } // useClass: RestClientServiceStub 
            , MessengerService
            , { provide: Router, useClass: RouterMock }
            , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        ]
        , declarations: [
        ]
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        msEffects = TestBed.get(MethodStatementsEffects);
        restClientServiceStub = TestBed.get(RestClientService);
    })

    it('Checking the Ms status count of Live,Pending,Archieve,Completed,Examples', fakeAsync(() => () => {
        let msStats = MockStoreProviderFactory.getTestMethodStatementStats();
        let options = new ResponseOptions({ body: msStats });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadMethodStatementsListAction(sampleApiRequestParams));

        let expt = new LoadMethodStatementsStatsCompleteAction(msStats);

        msEffects.loadMethodStatements$.subscribe((result) => {
            tick(300);
            expect(result.payload.find(obj => obj.StatusId == -1)).toEqual(expt.payload.find(obj => obj.StatusId == -1));
            expect(result.payload.find(obj => obj.StatusId == 0)).toEqual(expt.payload.find(obj => obj.StatusId == 0));
            expect(result.payload.find(obj => obj.StatusId == 1)).toEqual(expt.payload.find(obj => obj.StatusId == 1));
            expect(result.payload.find(obj => obj.StatusId == 3)).toEqual(expt.payload.find(obj => obj.StatusId == 3));
            expect(result.payload.find(obj => obj.StatusId == 4)).toEqual(expt.payload.find(obj => obj.StatusId == 4));
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })

        restClientServiceStub.get.and.returnValue(Observable.of({}));
    }));

    it('Loadeding MS stats', () => {

        let mockedmsStats = MockStoreProviderFactory.getTestMSStats();
        let options = new ResponseOptions({ body: mockedmsStats });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadMethodStatementsStatsAction(true));
        let expt = new LoadMethodStatementsStatsCompleteAction(<Array<MethodStatementStat>>mockedmsStats);

        msEffects.loadMethodStatementsStats$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })

        restClientServiceStub.get.and.returnValue(Observable.of({}));

    });

    it('Method Statement deleting', fakeAsync(() => () => {
        methodStatements.Id = '12345';
        let msById = MockStoreProviderFactory.getTestMethodStatementData();
        let options = new ResponseOptions({ body: msById });
        let response = new Response(options);
        let sampleApiRequestParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams("example", false)]);

        restClientServiceStub.delete.and.returnValue(Observable.of(response));
        runner.queue(new RemoveMethodStatementAction({ MethodStatements: methodStatements, AtlasApiRequestWithParams: sampleApiRequestParams }));
        let apiParams = new URLSearchParams();
        let expt = [
            new RemoveMethodStatementCompleteAction(true)
            , new LoadMethodStatementsListAction(sampleApiRequestParams)
            , new LoadMethodStatementsStatsAction(false)
        ];
        msEffects.RemoveMethodStatementById$.subscribe((result) => {
            expect(expt).toContain(result);
            expect(restClientServiceStub.delete).toHaveBeenCalledWith('methodStatements/' + methodStatements);
        })
    }));

    it('Update MS stats', fakeAsync(() => () => {
        let sampleApiRequestParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams("example", false)]);
        let dataToSave = new UpdateStatusModel();
        dataToSave.StatusId = 4;
        let options = new ResponseOptions({ body: dataToSave });
        let response = new Response(options);

        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new UpdateStatusMethodStatementAction({ UpdateStatusModel: dataToSave, AtlasApiRequestWithParams: sampleApiRequestParams }));
        let apiParams = new URLSearchParams();
        let expt = [
            new LoadMethodStatementsListAction(sampleApiRequestParams),
            new UpdateStatusMethodStatementCompleteAction(true),
            new LoadMethodStatementsStatsAction(false)
        ]

        msEffects.UpdateMethodStatementStatus$.subscribe((result) => {
            tick(300);
            expect(expt).toContain(result);
            expect(restClientServiceStub.post).toHaveBeenCalledWith('MS stats', dataToSave, { search: apiParams });
        })
    }));

    it('Copying Method Statement', fakeAsync(() => () => {
        let sampleApiRequestParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams("example", false)]);
        let mockedProceduresById = MockStoreProviderFactory.getTestMethodStatementData();
        mockedProceduresById.Name = '00001MS Copy';
        let options = new ResponseOptions({ body: mockedProceduresById });
        let response = new Response(options);
        restClientServiceStub.put.and.returnValue(Observable.of(response));
        runner.queue(new CopyMethodStatementAction({model:mockedProceduresById,AtlasApiRequestWithParams:sampleApiRequestParams,copyToDiffCompany:false,IsExample:false}));
        let exp = [
            new LoadMethodStatementsListAction(sampleApiRequestParams),
            new LoadMethodStatementsStatsAction(false)
        ];
        let apiParams = new URLSearchParams();

        msEffects.CopyMethodStatement$.subscribe((result) => {
            tick(100);
            expect(exp).toContain(result);
            expect(restClientServiceStub.put).toHaveBeenCalledWith('method-statement', methodStatements, { search: apiParams });
        })

    }));

})