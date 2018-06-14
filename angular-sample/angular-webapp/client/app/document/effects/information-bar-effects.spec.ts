import { DocumentInformationbarEffects } from './information-bar-effects';
import { TestBed } from '@angular/core/testing';
import { EffectsTestingModule, EffectsRunner } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { reducer } from './../../shared/reducers';
import { RestClientService } from './../../shared/data/rest-client.service';
import { MessengerService } from './../../shared/services/messenger.service';
import { MockStoreProviderFactory } from './../../shared/testing/mocks/mock-store-provider-factory';
import { ResponseOptions, Response, URLSearchParams } from '@angular/http';
import { extractInformationBarItems } from './../../shared/helpers/extract-helpers';
import { Observable } from 'rxjs';
import {
    LoadDocumentInformationBarAction
    , LoadDocumentInformationBarCompleteAction
    , LoadDocumentInformationBarSpecificStatAction
    , LoadDocumentInformationBarSpecificStatCompleteAction
} from './../actions/information-bar-actions';
import { ClaimsHelperService } from './../../shared/helpers/claims-helper';
import { AeInformationBarItemType } from './../../atlas-elements/common/ae-informationbar-itemtype.enum';

describe('Document informationbar items effect: ', () => {
    let runner;
    let documentInformationbarEffects: DocumentInformationbarEffects;
    let restClientServiceStub;

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            DocumentInformationbarEffects
            , {
                provide: RestClientService
                , useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete'])
            }
            , {
                provide: ClaimsHelperService
                , useValue: jasmine.createSpyObj('claimshelperStub', ['getCompanyName'])
            }
            // useClass: RestClientServiceStub 
            , MessengerService
        ]
        , declarations: []
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        documentInformationbarEffects = TestBed.get(DocumentInformationbarEffects);
        restClientServiceStub = TestBed.get(RestClientService);
    });

    it('Load document information bar items', () => {
        let mockDocument = MockStoreProviderFactory.getMockedDocumentInformationbarItems();
        let options = new ResponseOptions({ body: mockDocument });
        let response = new Response(options);
        let extractDocDetails = extractInformationBarItems(response);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadDocumentInformationBarAction('fc5fad99-7976-4252-8dc9-df7c75e33421'));
        let expt = new LoadDocumentInformationBarCompleteAction(extractDocDetails);

        documentInformationbarEffects.loadDocumentInformationBarItems$.subscribe((result) => {
            // tick(100);
            expect(result.payload).toEqual(expt.payload);
            expect(restClientServiceStub.get).toHaveBeenCalled();
            let params: URLSearchParams = new URLSearchParams();
            params.set('EmployeeId', 'fc5fad99-7976-4252-8dc9-df7c75e33421');
            params.set('Area', '5');
            params.set('requestedCodes', '');
            expect(restClientServiceStub.get).toHaveBeenCalledWith('Statistics', { search: params });
        });

        restClientServiceStub.get.and.returnValue(Observable.of({}));
    });

    it('Load specific document information bar items', () => {
        jasmine.addCustomEqualityTester(customEquality);

        let mockDocument = MockStoreProviderFactory.getMockedDocumentInformationbarItems();
        mockDocument = Array.from(mockDocument).filter(c => c['Code'] == 40);
        let options = new ResponseOptions({ body: mockDocument });
        let response = new Response(options);
        let extractDocDetails = extractInformationBarItems(response);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadDocumentInformationBarSpecificStatAction(
            {
                employeeId: 'fc5fad99-7976-4252-8dc9-df7c75e33421'
                , statisticIds: AeInformationBarItemType.DocumentsAwaiting.toString()
            }));
        let expt = new LoadDocumentInformationBarSpecificStatCompleteAction(extractDocDetails);

        documentInformationbarEffects.loadDocumentInformationBarSpecificItems$.subscribe((result) => {
            // tick(100);
            expect(result.payload).toEqual(expt.payload);
            expect(restClientServiceStub.get).toHaveBeenCalled();
            let params: URLSearchParams = new URLSearchParams();
            params.set('EmployeeId', 'fc5fad99-7976-4252-8dc9-df7c75e33421');
            params.set('Area', '5');
            params.set('requestedCodes', '3');
            expect(restClientServiceStub.get).toHaveBeenCalledWith('Statistics', { search: params });
        });
    });
});

function customEquality(expected: any, value: any): boolean {
    if (Array.isArray(expected) &&
        Array.from(expected).length > 0 &&
        Array.from(expected)[0] === 'Statistics') {
        let expectedStr = Array.from(expected)[1].search.toString();
        let valueStr = Array.from(value)[1]['search'].toString();
        return expectedStr.trim() === valueStr.trim();
    }
    return JSON.stringify(expected).trim() === JSON.stringify(value).trim();
}
