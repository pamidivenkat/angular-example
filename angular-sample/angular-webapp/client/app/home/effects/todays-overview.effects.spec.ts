import * as Immutable from 'immutable';
import { StatisticsInformation } from './../models/statistics-information';
import { MockStoreProviderFactory } from './../../shared/testing/mocks/mock-store-provider-factory';
import { AtlasApiRequestWithParams, AtlasApiRequest, AtlasParams, AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { RouteParams } from './../../shared/services/route-params';
import { RouteParamsMock } from './../../shared/testing/mocks/route-params-mock';
import { AuthConfig } from './../../shared/security/auth-config';
import { AuthorizationServiceStub } from './../../shared/testing/mocks/authorization-service-mock';
import { AuthorizationService } from './../../shared/security/authorization.service';
import { HttpStub } from './../../shared/testing/mocks/http-stub';
import { RestClientServiceStub } from './../../shared/testing/mocks/rest-client-service-stub';
import { CatchErrorAction } from './../../shared/actions/error.actions';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import { Http, RequestOptions, Response, ResponseOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { RestClientService } from './../../shared/data/rest-client.service';
import { reducer } from './../../shared/reducers/index';
import { MessengerService } from './../../shared/services/messenger.service';
import * as errorActions from './../../shared/actions/error.actions';
import { SortDirection } from "./../../atlas-elements/common/models/ae-sort-model";
// import { PlantAndEquipment } from "./../models/plantandequipment";
import { TodaysOverviewLoadAction, TodaysOverviewLoadCompleteAction } from '../actions/todays-overview.actions';
import { TodaysOverviewEffects } from './todays-overview.effects';

describe('Todays Overview effect: ', () => {
    let runner;
    let todaysOverviewEffects: TodaysOverviewEffects;
    let restClientServiceStub;
    let statisticsInfo = new StatisticsInformation();
    let sampleApiRequest = new AtlasApiRequest(1, 10, 'Name', SortDirection.Ascending);

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            TodaysOverviewEffects
            , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete']) } // useClass: RestClientServiceStub 
            , MessengerService
        ]
        , declarations: [
        ]
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        todaysOverviewEffects = TestBed.get(TodaysOverviewEffects);
        restClientServiceStub = TestBed.get(RestClientService);
    })

    it('Today Overview List', fakeAsync(() => () => {
        let mockedTodayOverview = MockStoreProviderFactory.getMockTestTodayOverview();
        // let todayOverviewData = getResponse(mockedTodayOverview);
        let options = new ResponseOptions({ body: mockedTodayOverview });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new TodaysOverviewLoadAction({ EmployeeId: '1234567890' }));        
        let expt = new TodaysOverviewLoadCompleteAction(mockedTodayOverview);

        todaysOverviewEffects.todaysOverview$.subscribe((result) => {
            tick(100);
            expect(result.payload).toEqual(expt.payload);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })

        restClientServiceStub.get.and.returnValue(Observable.of({}));
    }));

});
