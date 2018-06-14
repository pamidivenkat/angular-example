import { TaskHeadBannerEffects } from "../../task/effects/task-information-bar.effects";
import { TestBed } from "@angular/core/testing";
import { EffectsTestingModule, EffectsRunner } from "@ngrx/effects/testing";
import { StoreModule } from "@ngrx/store";
import { reducer } from "../../shared/reducers/index";
import { RestClientService } from "../../shared/data/rest-client.service";
import { ClaimsHelperService } from "../../shared/helpers/claims-helper";
import { MessengerService } from "../../shared/services/messenger.service";
import { LoadTaskHeadBannerCompleteAction, LoadTaskHeadBannerAction } from '../actions/task-information-bar.actions';
import { Observable } from "rxjs/Observable";
import { extractInformationBarItems } from '../../shared/helpers/extract-helpers';
import { ResponseOptions, Response } from "@angular/http";

describe('Tasks informationbar items effect: ', () => {
    let runner;
    let taskHeadBannerEffects: TaskHeadBannerEffects;
    let restClientServiceStub;
    let claimsHelperStub;

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            TaskHeadBannerEffects
            , {
                provide: RestClientService
                , useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete'])
            }
            , {
                provide: ClaimsHelperService
                , useValue: jasmine.createSpyObj('claimsHelperStub', ['getEmpIdOrDefault'])
            }
            , MessengerService
        ]
        , declarations: []
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        taskHeadBannerEffects = TestBed.get(TaskHeadBannerEffects);
        restClientServiceStub = TestBed.get(RestClientService);
        claimsHelperStub = TestBed.get(ClaimsHelperService);
        claimsHelperStub.getEmpIdOrDefault.and.returnValue('0C69BD01-BAA7-4654-BD21-A569DF0A0F94');
    });

    it('Load tasks information bar items Data', () => {
        let mockInformationBarItems = getTasksInformationBarItems();
        let options = new ResponseOptions({ body: mockInformationBarItems });
        let response = new Response(options);
        let extractedDetails = extractInformationBarItems(response);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadTaskHeadBannerAction(true));
        let expt = new LoadTaskHeadBannerCompleteAction(extractedDetails);
        taskHeadBannerEffects.taskHeadBannerData$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        });
    });
});

export function getTasksInformationBarItems() {
    let res = JSON.parse('[{"Code":15,"Priority":15,"Name":"Due this week","IconName":"icon-checklist","Count":6.0,"ContextData":null},{"Code":14,"Priority":14,"Name":"Due today","IconName":"icon-alert-triangle","Count":0.0,"ContextData":null},{"Code":16,"Priority":16,"Name":"Due next week","IconName":"icon-info","Count":0.0,"ContextData":null},{"Code":12,"Priority":12,"Name":"Overdue Tasks","IconName":"icon-clock","Count":4.0,"ContextData":null},{"Code":11,"Priority":11,"Name":"New Tasks","IconName":"icon-star","Count":3.0,"ContextData":null},{"Code":13,"Priority":13,"Name":"Incomplete Tasks","IconName":"icon-hourglass","Count":1.0,"ContextData":null}]');
    return res;
}