import { MockStoreAddUpdateFurtherControls } from './../../shared/testing/mocks/mock-store-addupdate-further-control';
import { isNullOrUndefined } from 'util';
import { ClaimsHelperServiceStub } from './../../shared/testing/mocks/claims-helper-service-mock';
import { ClaimsHelperService } from './../../shared/helpers/claims-helper';
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
import { RiskAssessmentEffects } from './risk-assessment-effects';
import * as errorActions from './../../shared/actions/error.actions';
import { SortDirection } from "./../../atlas-elements/common/models/ae-sort-model";
import { RouterMock } from './../../shared/testing/mocks/router-stub';
import { Router, ActivatedRoute, UrlSegment, NavigationExtras } from '@angular/router';
import { FurtherControlMeasuresMockStoreProvider } from '../../shared/testing/mocks/mock-store-RA-FCM-provider-factory';
import * as RiskAssessmentActions from './../actions/risk-assessment-actions';

describe('RiskAssesmnets effect: ', () => {
    let runner;
    let raEffects: RiskAssessmentEffects;
    let restClientServiceStub;

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule

            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            RiskAssessmentEffects
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
        raEffects = TestBed.get(RiskAssessmentEffects);
        restClientServiceStub = TestBed.get(RestClientService);
    })


    it('load Risk Assesments tasks based on Id', () => {
        let raTasksBasedID = MockStoreAddUpdateFurtherControls.futherControlMeasureData();
        let options = new ResponseOptions({ body: raTasksBasedID });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new RiskAssessmentActions.LoadRiskAssessmentTaskByIdAction('56aa0daa-d25f-4c7c-8bf9-c93554af3c2b'));
        let expt = new RiskAssessmentActions.LoadRiskAssessmentTaskByIdCompleteAction(raTasksBasedID);

        raEffects.loadRiskAssessmentTaskById$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })

        restClientServiceStub.get.and.returnValue(Observable.of({}));
    });

    it('load risk assessment further control measure tasks', () => {
        let RAFCMTasks = FurtherControlMeasuresMockStoreProvider.getRAFurtherControlMeasuresTasks();
        let apiParams = FurtherControlMeasuresMockStoreProvider.getRAtaskAPIParams();
        let options = new ResponseOptions({ body: RAFCMTasks });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new RiskAssessmentActions.LoadRiskAssessmentTasksAction(apiParams));
        let expt = new RiskAssessmentActions.LoadRiskAssessmentTasksCompleteAction(RAFCMTasks);
        raEffects.loadRiskAssessmentTasks$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        });
    });

    it('creating new further control measures task for a risk assessment', () => {
        let newRATask = MockStoreAddUpdateFurtherControls.futherControlMeasureData();
        newRATask.RegardingObjectId = '';
        let apiParams = FurtherControlMeasuresMockStoreProvider.getRAtaskAPIParams();
        let options = new ResponseOptions({ body: newRATask });
        let response = new Response(options);
        restClientServiceStub.put.and.returnValue(Observable.of(response));
        runner.queue(new RiskAssessmentActions.CreateRiskAssessmentTaskAction(newRATask));
        let expt = new RiskAssessmentActions.LoadRiskAssessmentTasksAction(apiParams);
        raEffects.createRiskAssessmentTask$.subscribe((apiParamsRequest) => {
            expect(apiParamsRequest).toEqual(expt);
            expect(restClientServiceStub.put).toHaveBeenCalled();
        });
    });

    it('updating further control measure task for a risk assessment', () => {
        let updatedTask = MockStoreAddUpdateFurtherControls.futherControlMeasureData();
        let RAFCMTasks = FurtherControlMeasuresMockStoreProvider.getRAFurtherControlMeasuresTasks();
        let options = new ResponseOptions({ body: RAFCMTasks });
        let response = new Response(options);
        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new RiskAssessmentActions.UpdateRiskAssessmentTaskAction(updatedTask));
        let expt = new RiskAssessmentActions.UpdateRiskAssessmentCompleteTaskAction(RAFCMTasks);
        raEffects.updateRiskAssessmentTask$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.post).toHaveBeenCalled();
        });
    });

    it('removing further control measure task', () => {
        let removingTask = MockStoreAddUpdateFurtherControls.futherControlMeasureData();
        removingTask.RegardingObjectId = '';
        let apiParams = FurtherControlMeasuresMockStoreProvider.getRAtaskAPIParams();
        let options = new ResponseOptions({ body: removingTask });
        let response = new Response(options);
        restClientServiceStub.delete.and.returnValue(Observable.of(response));
        runner.queue(new RiskAssessmentActions.RemoveRiskAssessmentTaskAction(removingTask));
        let expt = new RiskAssessmentActions.LoadRiskAssessmentTasksAction(apiParams);
        raEffects.removeRiskAssessmentTask$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.delete).toHaveBeenCalled();
        });
    });
});