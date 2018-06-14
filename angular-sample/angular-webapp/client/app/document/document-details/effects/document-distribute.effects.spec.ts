import { Observable } from 'rxjs/Rx';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { DocumentDistributeEffects } from '../../../document/document-details/effects/document-distribute.effects.';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { MessengerService } from '../../../shared/services/messenger.service';
import { Router } from '@angular/router';
import { RouterMock } from '../../../shared/testing/mocks/router-stub';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { ClaimsHelperServiceStub } from '../../../shared/testing/mocks/claims-helper-service-mock';
import { reducer } from './../../../shared/reducers/index';
import { DistributeDocumentAction, DistributeDocumentCompleteAction } from '../../../document/document-details/actions/document-distribute.actions';
import { DistributedDocument } from '../../../document/document-details/models/document-details-model';
import { ResponseOptions, Response, URLSearchParams } from '@angular/http';
import { DocumentsMockStoreforCQCandDistribute } from '../../../shared/testing/mocks/mock-store-provider-CQC-distribute-doc';

describe('document distribute effect :', () => {
    let runner;
    let documentDistributeEffects: DocumentDistributeEffects;
    let restClientServiceStub;
    let document: DistributedDocument;

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule

            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            DocumentDistributeEffects
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
        documentDistributeEffects = TestBed.get(DocumentDistributeEffects);
        restClientServiceStub = TestBed.get(RestClientService);
    })

    it('document distributing effect', () => {
        let document = DocumentsMockStoreforCQCandDistribute.getDistibutedDocumentResponse();
        let distributeDocument = new DistributedDocument();
        distributeDocument.DocumentType = 1;
        let options = new ResponseOptions({ body: document });
        let response = new Response(options);
        restClientServiceStub.put.and.returnValue(Observable.of(response));
        runner.queue(new DistributeDocumentAction(distributeDocument));
        let expt = new DistributeDocumentCompleteAction(document);
        documentDistributeEffects.distributedDocument$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.put).toHaveBeenCalled();
        });
    });

    it('shared document distributing effect', () => {
        let document = DocumentsMockStoreforCQCandDistribute.getDistibutedDocumentResponse();
        let distributeDocument = new DistributedDocument();
        distributeDocument.DocumentType = 2;
        let options = new ResponseOptions({ body: document });
        let response = new Response(options);
        restClientServiceStub.put.and.returnValue(Observable.of(response));
        runner.queue(new DistributeDocumentAction(distributeDocument));
        let expt = new DistributeDocumentCompleteAction(document);
        documentDistributeEffects.distributedDocument$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.put).toHaveBeenCalled();
        });
    });
});