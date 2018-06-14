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
import { Observable } from 'rxjs/Rx';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { RestClientService } from './../../shared/data/rest-client.service';
import { reducer } from './../../shared/reducers/index';
import { MessengerService } from './../../shared/services/messenger.service';
import * as errorActions from './../../shared/actions/error.actions';
import { SortDirection } from './../../atlas-elements/common/models/ae-sort-model';
import { RouterMock } from './../../shared/testing/mocks/router-stub';
import { Router, ActivatedRoute, UrlSegment, NavigationExtras } from '@angular/router';
import { InformationbarEffects } from './information-bar.effects';
import { LoadInformationBarAction, LoadInformationBarCompleteAction } from './../actions/information-bar.actions';
import { extractInformationBarItems } from './../../shared/helpers/extract-helpers';

describe('Information bar effect', () => {
    let runner;
    let infobarEffects: InformationbarEffects;
    let restClientServiceStub;

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            InformationbarEffects
            , {
                provide: RestClientService,
                useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete'])
            }
            , MessengerService
            , { provide: Router, useClass: RouterMock }
            , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        ]
        , declarations: [
        ]
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        infobarEffects = TestBed.get(InformationbarEffects);
        restClientServiceStub = TestBed.get(RestClientService);
    });

    it('Verify whether information stats for dashboard are loaded appropriately or not', () => {
        let mockedInfobarStats = MockStoreProviderFactory.getMockedInformationbarStats();
        let options = new ResponseOptions({ body: mockedInfobarStats });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadInformationBarAction(true));
        let infobarStatList = extractInformationBarItems(response);
        let expt = new LoadInformationBarCompleteAction(infobarStatList);

        infobarEffects.loadInformationBarItems$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        });
        restClientServiceStub.get.and.returnValue(Observable.of({}));
    });
});
