import { Observable } from 'rxjs/Rx';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { MessengerService } from '../../../shared/services/messenger.service';
import { Router } from '@angular/router';
import { RouterMock } from '../../../shared/testing/mocks/router-stub';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { ClaimsHelperServiceStub } from '../../../shared/testing/mocks/claims-helper-service-mock';
import { reducer } from './../../../shared/reducers/index';

import { DistributedDocument } from '../../../document/document-details/models/document-details-model';
import { ResponseOptions, Response, URLSearchParams } from '@angular/http';
import { DocumentsMockStoreforCQCandDistribute } from '../../../shared/testing/mocks/mock-store-provider-CQC-distribute-doc';
import { DocumentExportToCQCEffects } from '../../../document/document-details/effects/document-export-to-cqc.effects';
import {
    LoadCQCCategoriesBySiteIdAction
    , LoadCQCCategoriesBySiteIdCompleteAction
    , CQCPolicyCheckBySiteIdAction
    , CQCPolicyCheckBySiteIdCompleteAction
    , LoadCQCStandardsBySiteIdAction
    , LoadCQCStandardsBySiteIdCompleteAction
    , LoadCQCUsersBySiteIdAction, LoadCQCUsersBySiteIdCompleteAction
    , LoadCQCFiletypesBySiteIdAction, LoadCQCFiletypesBySiteIdCompleteAction, AddCQCProDetailsAction, AddCQCProDetailsCompleteAction
} from '../../../document/document-details/actions/document-export-to-cqc.actions';
import { extractCQCStandardsData, extractCQCCategoriesData, extractCQCSelectOptionListData } from '../../../document/document-details/common/document-export-to-cqc-helper';

describe('document export to cqc effects :', () => {
    let runner;
    let documentExportToCQCEffects: DocumentExportToCQCEffects;
    let restClientServiceStub;


    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule

            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            DocumentExportToCQCEffects
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
        documentExportToCQCEffects = TestBed.get(DocumentExportToCQCEffects);
        restClientServiceStub = TestBed.get(RestClientService);
    });

    it('load CQC users by site', () => {
        let usersResponse = DocumentsMockStoreforCQCandDistribute.getCQCUsersBySiteId();
        let extractdetails = extractCQCSelectOptionListData(usersResponse);
        restClientServiceStub.get.and.returnValue(Observable.of(usersResponse));
        runner.queue(new LoadCQCUsersBySiteIdAction('f86ce3d4-8160-4bdb-8f86-a7b5f9ed7a44'));
        let expt = new LoadCQCUsersBySiteIdCompleteAction(extractdetails);
        documentExportToCQCEffects.loadCQCUsers$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        });
    });

    it('load CQC file types by site', () => {
        let fileTypesResponse = DocumentsMockStoreforCQCandDistribute.getCQCFileTypes();
        let extractdetails = extractCQCSelectOptionListData(fileTypesResponse);
        restClientServiceStub.get.and.returnValue(Observable.of(fileTypesResponse));
        runner.queue(new LoadCQCFiletypesBySiteIdAction('f86ce3d4-8160-4bdb-8f86-a7b5f9ed7a44'));
        let expt = new LoadCQCFiletypesBySiteIdCompleteAction(extractdetails);
        documentExportToCQCEffects.loadCQCFileTypes$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        });
    });

    it('load CQC policy check by site', () => {
        let policyResponse = DocumentsMockStoreforCQCandDistribute.getCQCPolicyCheckBySiteId();
        let response = DocumentsMockStoreforCQCandDistribute.getResponse(policyResponse);
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new CQCPolicyCheckBySiteIdAction('f86ce3d4-8160-4bdb-8f86-a7b5f9ed7a44'));
        let expt = new CQCPolicyCheckBySiteIdCompleteAction(policyResponse);
        documentExportToCQCEffects.getCQCPolicy$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        });
    });

    it('load CQC standards by site', () => {
        let standardsResponse = DocumentsMockStoreforCQCandDistribute.getCQCStandards();
        let extractdetails = extractCQCStandardsData(standardsResponse);
        restClientServiceStub.get.and.returnValue(Observable.of(standardsResponse));
        runner.queue(new LoadCQCStandardsBySiteIdAction('f86ce3d4-8160-4bdb-8f86-a7b5f9ed7a44'));
        let expt = new LoadCQCStandardsBySiteIdCompleteAction(extractdetails);
        documentExportToCQCEffects.loadCQCStandards$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        });
    });

    it('load CQC categories by site', () => {
        let categoriesResponse = DocumentsMockStoreforCQCandDistribute.getCQCCategories();
        let extractdetails = extractCQCCategoriesData(categoriesResponse);
        restClientServiceStub.get.and.returnValue(Observable.of(categoriesResponse));
        runner.queue(new LoadCQCCategoriesBySiteIdAction('f86ce3d4-8160-4bdb-8f86-a7b5f9ed7a44'));
        let expt = new LoadCQCCategoriesBySiteIdCompleteAction(extractdetails);
        documentExportToCQCEffects.loadCQCCategories$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalled();
        });
    });

    it('add CQC pro details', () => {
        let payload: any = {};
        payload.siteId = 'f86ce3d4-8160-4bdb-8f86-a7b5f9ed7a44';
        payload.policy_file = "CQC file";
        restClientServiceStub.get.and.returnValue(Observable.of(true));
        runner.queue(new AddCQCProDetailsAction(payload));
        let expt = new AddCQCProDetailsCompleteAction(true);
        documentExportToCQCEffects.loadCQCCategories$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.post).toHaveBeenCalled();
        });
    });
});