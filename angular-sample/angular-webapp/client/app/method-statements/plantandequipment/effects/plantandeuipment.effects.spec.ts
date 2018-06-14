import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { AtlasApiRequestWithParams, AtlasApiRequest, AtlasParams, AtlasApiResponse } from './../../../shared/models/atlas-api-response';
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
import { Observable } from 'rxjs/Rx';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { reducer } from '../../../shared/reducers/index';
import { MessengerService } from '../../../shared/services/messenger.service';
import * as errorActions from '../../../shared/actions/error.actions';
import { SortDirection } from "../../../atlas-elements/common/models/ae-sort-model";
import { PlantAndEquipment } from "./../models/plantandequipment";
import {
    LoadPlantandequipmentAction, LoadPlantandequipmentCompleteAction, LoadSelectedPlantandequipmentAction, LoadSelectedPlantandequipmentCompleteAction,
    AddPlantandequipmentAction, AddPlantandequipmentCompleteAction, UpdatePlantandequipmentAction, UpdatePlantandequipmentCompleteAction, RemovePlantandequipmentAction, RemovePlantandequipmentCompleteAction
} from '../actions/plantequipment-actions';
import { PlantAndEquipmentEffects } from './plantandeuipment.effects';

describe('Procedure effect: ', () => {
    let runner;
    let plantAndEquipmentEffects: PlantAndEquipmentEffects;
    let restClientServiceStub;
    let plantAndEquipment: PlantAndEquipment = new PlantAndEquipment();
    let sampleApiRequest = new AtlasApiRequest(1, 10, 'Name', SortDirection.Ascending);

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            PlantAndEquipmentEffects
            , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete']) } // useClass: RestClientServiceStub 
            , MessengerService
        ]
        , declarations: [
        ]
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        plantAndEquipmentEffects = TestBed.get(PlantAndEquipmentEffects);
        restClientServiceStub = TestBed.get(RestClientService);
    })

    it('Plant And Equipment List', () => {
        let mockedPlantEquipment = MockStoreProviderFactory.getTestPlantEquipmentData();
        let options = new ResponseOptions({ body: mockedPlantEquipment });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadPlantandequipmentAction(sampleApiRequest));
        let expt = new LoadPlantandequipmentCompleteAction(<AtlasApiResponse<PlantAndEquipment>>mockedPlantEquipment);

        plantAndEquipmentEffects.getPlantAndEquipmentList$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })

        restClientServiceStub.get.and.returnValue(Observable.of({}));
    });

    it('Plant And Equipment data by ID', () => {
        let mockedPlantEquipmentById = MockStoreProviderFactory.getTestSelectedPlantAndEquipmentData();
        plantAndEquipment.Id = '468f3783-522e-4ce0-85ac-8c8d274050e2';
        let options = new ResponseOptions({ body: plantAndEquipment });
        let response = new Response(options);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadSelectedPlantandequipmentAction(plantAndEquipment.Id));
        let expt = new LoadSelectedPlantandequipmentCompleteAction(<PlantAndEquipment>mockedPlantEquipmentById);

        plantAndEquipmentEffects.getSelectedPlantAndEquipment$.subscribe((result) => {
            expect(result.payload.Id).toEqual(expt.payload.Id);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        })
        restClientServiceStub.get.and.returnValue(Observable.of({}));

    })

    it('Plant And Equipment Adding newly', fakeAsync(() => () => {
        //   let sampleApiRequestParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams("example", false)]);
        let plantAndEquipment: PlantAndEquipment = new PlantAndEquipment();
        plantAndEquipment.Name = 'New PlantAndEquipment';
        let options = new ResponseOptions({ body: plantAndEquipment });
        let response = new Response(options);

        restClientServiceStub.put.and.returnValue(Observable.of(response));
        runner.queue(new AddPlantandequipmentAction(plantAndEquipment));
        let apiParams = new URLSearchParams();
        let expt = [
            new AddPlantandequipmentCompleteAction(<PlantAndEquipment>plantAndEquipment),
            new LoadPlantandequipmentAction(sampleApiRequest),
        ]

        plantAndEquipmentEffects.addPlantAndEquipment$.subscribe((result) => {
            tick(200);
            expect(expt).toContain(result);
            expect(restClientServiceStub.put).toHaveBeenCalledWith('PlantAndEquipment', plantAndEquipment, { search: apiParams });
        })
    }));

    it('Plant And Equipment updating existing', fakeAsync(() => () => {
        let plantAndEquipment: PlantAndEquipment = new PlantAndEquipment();
        plantAndEquipment.Name = 'Update procedure';
        let options = new ResponseOptions({ body: plantAndEquipment });
        let response = new Response(options);

        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new UpdatePlantandequipmentAction(plantAndEquipment));
        let apiParams = new URLSearchParams();
        let expt = [
            new UpdatePlantandequipmentCompleteAction(<PlantAndEquipment>plantAndEquipment),
            new LoadPlantandequipmentAction(sampleApiRequest),
        ]

        plantAndEquipmentEffects.updatePlantAndEquipment$.subscribe((result) => {
            tick(300);
            expect(expt).toContain(result);
            expect(restClientServiceStub.post).toHaveBeenCalledWith('procedure', plantAndEquipment, { search: apiParams });
        })
    }));

    it('Plant And Equipment deleting', fakeAsync(() => () => {
        plantAndEquipment.Id = '12345';
        let mockedProceduresById = MockStoreProviderFactory.getTestSelectedProcedureData();
        let options = new ResponseOptions({ body: mockedProceduresById });
        let response = new Response(options);

        restClientServiceStub.delete.and.returnValue(Observable.of(response));
        runner.queue(new RemovePlantandequipmentAction(plantAndEquipment));
        let apiParams = new URLSearchParams();
        let expt = [
            new RemovePlantandequipmentCompleteAction(true)
            , new LoadPlantandequipmentAction(sampleApiRequest),
        ];

        plantAndEquipmentEffects.plantEquipmentDelete$.subscribe((result) => {
            expect(expt).toContain(result);
            expect(restClientServiceStub.delete).toHaveBeenCalledWith('plantequipment/' + plantAndEquipment);
        })
    }));

})

