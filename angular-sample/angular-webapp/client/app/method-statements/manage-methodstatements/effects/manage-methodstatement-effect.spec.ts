import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Response, ResponseOptions, URLSearchParams } from '@angular/http';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';

import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { DocumentCategoryEnum, DocumentChangesEnum } from '../../../document/models/document-category-enum';
import { getAtlasParamValueByKey } from '../../../root-module/common/extract-helpers';
import { CatchErrorAction } from '../../../shared/actions/error.actions';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { GUID } from '../../../shared/helpers/guid-helper';
import { AtlasApiRequest, AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import * as fromRoot from '../../../shared/reducers';
import { reducer } from '../../../shared/reducers/index';
import { MessengerService } from '../../../shared/services/messenger.service';
import { MockStoreProviderFactory } from '../../../shared/testing/mocks/mock-store-provider-factory';
import { ClearMethodStatementStateAction } from '../../actions/methodstatements.actions';
import { MethodStatement, MSOtherRiskAssessments, MSPPE } from '../../models/method-statement';
import {
    AddMethodStatementAction,
    AddMethodStatementAttachmentAction,
    AddMethodStatementAttachmentCompleteAction,
    AddMSOtherRAAction,
    AddMSOtherRACompleteAction,
    AddMSProcedureAction,
    AddMSProcedureCompleteAction,
    AddMSResponsibilityAction,
    AddMSResponsibilityCompleteAction,
    DeleteMSOtherRiskAssessmentAction,
    DeleteMSOtherRiskAssessmentCompleteAction,
    DeleteMSProcedureAction,
    DeleteMSProcedureCompleteAction,
    DeleteMSSaftyResponsibilityAction,
    DeleteMSSaftyResponsibilityCompleteAction,
    GetMethodStatementAttachmentAction,
    GetMethodStatementAttachmentCompleteAction,
    LoadMethodStatementByIdAction,
    LoadMethodStatementByIdCompleteAction,
    LoadMSResponsibilitiesPagingSortingAction,
    LoadMSSaftyResponsibilityByIdAction,
    LoadMSSaftyResponsibilityByIdCompleteAction,
    LoadProceduresForMSAction,
    LoadProceduresForMSCompleteAction,
    LoadSupportingDocumentsByIdAction,
    LoadSupportingDocumentsByIdCompleteAction,
    MSResponsibilityDeleteListAction,
    MSResponsibilityListCompleteAction,
    SaveMethodStatementPreviewAction,
    SaveMethodStatementPreviewCompleteAction,
    UpdateMethodStatementAction,
    UpdateMethodStatementStatusAction,
    UpdateMethodStatementStatusCompleteAction,
    UpdateMSPPEAction,
    UpdateMSPPECompleteAction,
    UpdateMSProcedureAction,
    UpdateMSProcedureCompleteAction,
    UpdateMSProcedureOrderAction,
    UpdateMSResponsibilityAction,
    UpdateMSResponsibilityCompleteAction,
} from '../actions/manage-methodstatement.actions';
import { ManageMethodStatementEffects } from './manage-methodstatement-effects';

describe('Mange method statement effect: ', () => {
    let runner;
    let manageMSEffect: ManageMethodStatementEffects;
    let restClientServiceStub;
    let methodStatement: MethodStatement = new MethodStatement();
    let store: Store<fromRoot.State>;

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            ManageMethodStatementEffects
            , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete']) }
            , MessengerService
        ]
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        manageMSEffect = TestBed.get(ManageMethodStatementEffects);
        restClientServiceStub = TestBed.get(RestClientService);
        store = TestBed.get(Store);

    })

    it('should return complete action on success of method statement get by id', () => {
        methodStatement.Id = '1234';
        let options = new ResponseOptions({ body: methodStatement });
        let response = new Response(options);

        restClientServiceStub.get.and.returnValue(Observable.of(response));
        let params = { Id: methodStatement.Id, IsExample: methodStatement.IsExample };
        runner.queue(new LoadMethodStatementByIdAction(params));
        let expt = new LoadMethodStatementByIdCompleteAction(methodStatement);

        let apiParams: URLSearchParams = new URLSearchParams();
        apiParams.set('example', 'false');
        apiParams.set('preview', 'true');

        manageMSEffect.loadMehtodStatementById$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalledWith('methodstatement/' + methodStatement.Id, { search: apiParams });
        })

        restClientServiceStub.get.and.returnValue(Observable.of({}));
    });

    it('should return error on failure of method statement get by id', () => {
        methodStatement.Id = '1234';
        restClientServiceStub.get.and.returnValue(Observable.of({}));
        let params = { Id: methodStatement.Id, IsExample: methodStatement.IsExample };
        runner.queue(new LoadMethodStatementByIdAction(params));
        manageMSEffect.loadMehtodStatementById$.subscribe((result) => {
            expect(result instanceof CatchErrorAction).toBeTruthy();
            expect(result.payload.Entity).toEqual('Method statement');
        })
    });

    it('should return complete action on success of update method statement.', () => {
        methodStatement.Id = '1234';
        let options = new ResponseOptions({ body: methodStatement });
        let response = new Response(options);

        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new UpdateMethodStatementAction({ MethodStatement: methodStatement, portionUpdating: 'generalStep' }));
        let apiParams = new URLSearchParams();

        manageMSEffect.updateMethodStatement$.subscribe((result) => {
            expect(restClientServiceStub.post).toHaveBeenCalledWith('MethodStatement', methodStatement, { search: apiParams });
        })

    });

    it('should return complete action on success of add method statement.', () => {
        methodStatement.Id = '12345';
        let options = new ResponseOptions({ body: methodStatement });
        let response = new Response(options);

        restClientServiceStub.put.and.returnValue(Observable.of(response));
        runner.queue(new AddMethodStatementAction(methodStatement));
        let apiParams = new URLSearchParams();
        let expt = new LoadMethodStatementByIdAction({ Id: methodStatement.Id, IsExample: methodStatement.IsExample });

        manageMSEffect.addMethodStatement$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.put).toHaveBeenCalledWith('MethodStatement', methodStatement, { search: apiParams });
        })
    });

    it('should return complete action on success of update PPE in method statement.', () => {
        methodStatement.Id = '12345';
        store.dispatch(new LoadMethodStatementByIdCompleteAction(methodStatement));
        let msPPE: MSPPE = MockStoreProviderFactory.getMockMSPPE();
        let options = new ResponseOptions({ body: [msPPE] });
        let response = new Response(options);

        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new UpdateMSPPEAction({ MethodStatementId: methodStatement.Id, MSPPE: [msPPE] }));
        let apiParams = new URLSearchParams();

        manageMSEffect.updateMSPPE$.subscribe((result) => {
            let newMS = Object.assign({}, methodStatement); 
            newMS.MSPPE = [msPPE];
            let expt = [
                new UpdateMSPPECompleteAction([msPPE])
                , new LoadMethodStatementByIdCompleteAction(newMS)
            ];
            expect(expt).toContain(result);
            expect(restClientServiceStub.post).toHaveBeenCalledWith('MSPPE/BulkUpdatePPE?methodStatementId=' + methodStatement.Id, [msPPE]);
        })
    });

    it('should return complete action on success of loading MS safety responsibility by id', () => {
        methodStatement.Id = '12345';
        let safetyResponsibility = MockStoreProviderFactory.getSafetyRespAssignedMock();
        let options = new ResponseOptions({ body: safetyResponsibility });
        let response = new Response(options);

        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadMSSaftyResponsibilityByIdAction({ Id: safetyResponsibility.Id }));
        let apiParams = new URLSearchParams();
        let expt = new LoadMSSaftyResponsibilityByIdCompleteAction(safetyResponsibility);

        manageMSEffect.loadMSSaftyResponsibilityById$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalledWith('MSSafetyRespAssigned/Getbyid/' + safetyResponsibility.Id, { search: apiParams });
        })
    });

    it('should return complete action on success of delete MS safety responsibility', () => {
        methodStatement.Id = '12345';
        let safetyResponsibility = MockStoreProviderFactory.getSafetyRespAssignedMock();
        let options = new ResponseOptions({ body: safetyResponsibility });
        let response = new Response(options);
        let apiRequest = new AtlasApiRequest(1, 10, 'CreatedOn', SortDirection.Ascending)

        restClientServiceStub.delete.and.returnValue(Observable.of(response));
        runner.queue(new DeleteMSSaftyResponsibilityAction({ Id: safetyResponsibility.Id }));
        let apiParams = new URLSearchParams();
        let expt = [
            new DeleteMSSaftyResponsibilityCompleteAction(safetyResponsibility.Id)
            , new MSResponsibilityDeleteListAction({ Id: '935a092f-cc6e-49e0-95a7-0688eb0ea79c' })
            , new LoadMSResponsibilitiesPagingSortingAction(apiRequest)
        ];

        manageMSEffect.msSaftyResponsibilityDelete$.subscribe((result) => {
            expect(expt).toContain(result);
            expect(restClientServiceStub.delete).toHaveBeenCalledWith('MSSafetyRespAssigned/' + safetyResponsibility.Id);
        })
    });

    it('should return complete action on success of adding a MS safety responsibility', () => {
        methodStatement.Id = '12345';
        let safetyResponsibility = MockStoreProviderFactory.getSafetyRespAssignedMock();
        let options = new ResponseOptions({ body: safetyResponsibility });
        let response = new Response(options);
        let apiRequest = new AtlasApiRequest(1, 10, 'CreatedOn', SortDirection.Ascending)

        restClientServiceStub.put.and.returnValue(Observable.of(response));
        runner.queue(new AddMSResponsibilityAction(safetyResponsibility));

        let expt = [
            new AddMSResponsibilityCompleteAction(safetyResponsibility)
            , new MSResponsibilityListCompleteAction(safetyResponsibility)
            , new LoadMSResponsibilitiesPagingSortingAction(apiRequest)
        ];

        manageMSEffect.msResponsibilityAdd$.subscribe((result) => {
            expect(expt).toContain(result);
            expect(restClientServiceStub.put).toHaveBeenCalledWith('MSSafetyRespAssigned', safetyResponsibility);
        })
    });

    it('should return complete action on success of updating a MS safety responsibility', () => {
        methodStatement.Id = '12345';
        let safetyResponsibility = MockStoreProviderFactory.getSafetyRespAssignedMock();
        let options = new ResponseOptions({ body: safetyResponsibility });
        let response = new Response(options);

        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new UpdateMSResponsibilityAction(safetyResponsibility));
        let expt = [
            new UpdateMSResponsibilityCompleteAction(safetyResponsibility)
            , new MSResponsibilityListCompleteAction(safetyResponsibility)
        ];

        manageMSEffect.msResponsibilityUpdate$.subscribe((result) => {
            expect(expt).toContain(result);
            expect(restClientServiceStub.post).toHaveBeenCalledWith('MSSafetyRespAssigned', safetyResponsibility);
        })
    });

    it('should return complete action on success of deleting a MS procedure', (fakeAsync(() => {
        methodStatement.Id = '12345';
        let msProcedure = MockStoreProviderFactory.getMSProcedureStub();
        methodStatement.MSProcedures = [msProcedure];

        store.dispatch(new LoadMethodStatementByIdCompleteAction(methodStatement));
        tick(200);
        let options = new ResponseOptions({ body: methodStatement });
        let response = new Response(options);

        restClientServiceStub.delete.and.returnValue(Observable.of(response));
        runner.queue(new DeleteMSProcedureAction(msProcedure.Id));
        let apiParams = new URLSearchParams();

        manageMSEffect.msProcedureDelete$.subscribe((result) => {
            let newMS = Object.assign({}, methodStatement);
            newMS.MSProcedures = [];
            let expt = [
                new DeleteMSProcedureCompleteAction(true)
                , new LoadMethodStatementByIdCompleteAction(newMS)
            ];
            expect(expt).toContain(result);
            expect(restClientServiceStub.delete).toHaveBeenCalledWith('MSProcedure/' + msProcedure.Id);
        })
    })));

    it('should return complete action on success of adding a MS procedure', (fakeAsync(() => {
        methodStatement.Id = '12345';
        let msProcedure = MockStoreProviderFactory.getMSProcedureStub();
        methodStatement.MSProcedures = [msProcedure];

        store.dispatch(new LoadMethodStatementByIdCompleteAction(methodStatement));
        tick(200);

        let options = new ResponseOptions({ body: methodStatement });
        let response = new Response(options);

        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new AddMSProcedureAction([msProcedure]));

        let params: URLSearchParams = new URLSearchParams();
        params.set('isCollection', 'true');
        params.set('isBulkUpdate', 'false');

        manageMSEffect.msProceduresAdd$.subscribe((result) => {
            let newMS = Object.assign({}, methodStatement);
            newMS.MSProcedures = [msProcedure];
            let expt = [
                new AddMSProcedureCompleteAction(methodStatement)
                , new LoadMethodStatementByIdCompleteAction(newMS)
            ];
            expect(expt).toContain(result);
            expect(restClientServiceStub.post).toHaveBeenCalledWith('MSProcedure/BulkUpdateProcedures', [msProcedure], { search: params });
        });
    })));

    it('should return complete action on success of updating a MS procedure', (fakeAsync(() => {
        methodStatement.Id = '12345';
        let msProcedure = MockStoreProviderFactory.getMSProcedureStub();
        methodStatement.MSProcedures = [msProcedure];

        store.dispatch(new LoadMethodStatementByIdCompleteAction(methodStatement));
        tick(200);

        let options = new ResponseOptions({ body: msProcedure });
        let response = new Response(options);

        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new UpdateMSProcedureAction(msProcedure));

        manageMSEffect.msProceduresUpdate$.subscribe((result) => {
            let newMS = Object.assign({}, methodStatement);
            newMS.MSProcedures = [msProcedure];
            let expt = [
                new UpdateMSProcedureCompleteAction(msProcedure)
                , new LoadMethodStatementByIdCompleteAction(newMS)
            ];

            expect(expt).toContain(result);
            expect(restClientServiceStub.post).toHaveBeenCalledWith('MSProcedure', msProcedure);
        })
    })));

    it('should return complete action on success of updating a MS procedure order', (fakeAsync(() => {
        methodStatement.Id = '12345';
        let msProcedure = MockStoreProviderFactory.getMSProcedureStub();
        methodStatement.MSProcedures = [msProcedure];

        store.dispatch(new LoadMethodStatementByIdCompleteAction(methodStatement));
        tick(200);

        let options = new ResponseOptions({ body: [msProcedure] });
        let response = new Response(options);

        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new UpdateMSProcedureOrderAction([msProcedure]));

        let params: URLSearchParams = new URLSearchParams();
        params.set('isCollection', 'true');
        params.set('isBulkUpdate', 'true');


        manageMSEffect.msProceduresUpdateOrder$.subscribe((result) => {
            let newMS = Object.assign({}, methodStatement);
            let expt = new LoadMethodStatementByIdCompleteAction(newMS);
            expect(expt).toEqual(result);
            expect(restClientServiceStub.post).toHaveBeenCalledWith('MSProcedure/BulkUpdateProcedures', [msProcedure], { search: params });
        })
    })));

    it('should return complete action on success of load procedure data for MS', () => {
        methodStatement.Id = '12345';
        let procedures = MockStoreProviderFactory.getTestProcedures();

        let params: Array<AtlasParams> = [];
        params.push(new AtlasParams('exampleType', 'All'));
        let apiParams: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'name', SortDirection.Ascending, params);
        let options = new ResponseOptions({ body: procedures });
        let response = new Response(options);

        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadProceduresForMSAction(apiParams));

        let resultParams: URLSearchParams = new URLSearchParams();
        resultParams.set('ProcedureByGroupId', getAtlasParamValueByKey(apiParams.Params, 'ProcedureGroup'));
        resultParams.set('pageNumber', apiParams.PageNumber.toString());
        resultParams.set('pageSize', apiParams.PageSize.toString());
        resultParams.set('sortField', apiParams.SortBy.SortField);
        resultParams.set('direction', apiParams.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');

        let expt = new LoadProceduresForMSCompleteAction(procedures);

        manageMSEffect.procedureDatsForMS$.subscribe((result) => {
            expect(expt).toEqual(result);
            expect(restClientServiceStub.get).toHaveBeenCalledWith('Procedure/GetProceduresForMS', { search: resultParams });
        })
    });

    it('should return complete action on success of getting MS supporting documents by id', () => {
        methodStatement.Id = '1234';
        let docs = MockStoreProviderFactory.getSupportingDocumentsStub();
        let options = new ResponseOptions({ body: [docs] });
        let response = new Response(options);

        restClientServiceStub.get.and.returnValue(Observable.of(response));
        let params = { Id: methodStatement.Id, IsExample: methodStatement.IsExample };
        runner.queue(new LoadSupportingDocumentsByIdAction(params));
        let expt = new LoadSupportingDocumentsByIdCompleteAction([docs]);

        let apiParams: URLSearchParams = new URLSearchParams();
        apiParams.set('objectId', methodStatement.Id);
        apiParams.set('otc', '600');
        apiParams.set('tag', "MS SD - " + methodStatement.Id);
        apiParams.set('example', methodStatement.IsExample ? 'true' : 'false');

        manageMSEffect.getMSSupportingDocumentsById$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalledWith('Attachment', { search: apiParams });
        })
    });

    it('should return complete action on success of updating method statement status', () => {
        methodStatement.Id = '1234';

        let data = {
            IsExample: methodStatement.IsExample,
            Data: {
                MethodStatementId: methodStatement.Id, StatusId: 1
            }
        }
        let options = new ResponseOptions({ body: true });
        let response = new Response(options);

        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new UpdateMethodStatementStatusAction(data));

        let params: URLSearchParams = new URLSearchParams();
        params.set('example', methodStatement.IsExample ? 'true' : 'false');
        params.set('isApprove', 'true');

        let expt = [
            new UpdateMethodStatementStatusCompleteAction(true),
            new ClearMethodStatementStateAction(true)
        ]

        manageMSEffect.updateMethodStatementStatus$.subscribe((result) => {
            expect(expt).toContain(result);
            expect(restClientServiceStub.post).toHaveBeenCalledWith('methodstatementstatus/UpdateStatus', data.Data, { search: params });
        })

    });

    it('should return complete action on success of getting MS attachments by id', () => {
        methodStatement.Id = '1234';

        let options = new ResponseOptions({ body: [] });
        let response = new Response(options);

        restClientServiceStub.get.and.returnValue(Observable.of(response));
        let params = { Id: methodStatement.Id, IsExample: methodStatement.IsExample };
        runner.queue(new GetMethodStatementAttachmentAction(params));
        let expt = new GetMethodStatementAttachmentCompleteAction([]);

        let searchParams: URLSearchParams = new URLSearchParams();
        searchParams.set('MSId', methodStatement.Id);
        searchParams.set('GetRAAttachemnts', 'true');
        searchParams.set('example', methodStatement.IsExample ? 'true' : 'false');

        manageMSEffect.getMSAttachmentsById$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.get).toHaveBeenCalledWith('methodstatement', { search: searchParams });
        })
    });

    it('should return complete action on save MS to atlas', () => {
        methodStatement.Id = '1234';
        methodStatement.Name = 'MsName';

        let model: any = new Object();
        model.AttachTo = { Id: methodStatement.Id, ObjectTypeCode: 600 }
        model.Id = methodStatement.Id;
        model.ObjectTypeCode = 600;
        model.Category = DocumentCategoryEnum.MethodStatements;
        model.Content = 'test';
        model.DocumentId = GUID.toString();
        model.FileName = methodStatement.Name + ".pdf";
        model.RegardingObject = { Id: methodStatement.Id, ObjectTypeCode: 600 }
        model.Title = methodStatement.Name;
        model.Usage = 1;
        model.Version = "1.0";
        model.LastChange = DocumentChangesEnum.ContentChanged;

        let options = new ResponseOptions({ body: model });
        let response = new Response(options);

        restClientServiceStub.post.and.returnValue(Observable.of(response));
        let params = { Id: methodStatement.Id, IsExample: methodStatement.IsExample };
        runner.queue(new SaveMethodStatementPreviewAction(model));
        let expt = new SaveMethodStatementPreviewCompleteAction(model);

        let searchParams: URLSearchParams = new URLSearchParams();


        manageMSEffect.saveMethodStatementtoAtlas$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.post).toHaveBeenCalledWith('RiskAssessment', model, { search: searchParams });
        })
    });

    it('should return complete action on success of other risk assessment delete', () => {
        methodStatement.Id = '1234';

        let options = new ResponseOptions({ body: [] });
        let response = new Response(options);

        restClientServiceStub.delete.and.returnValue(Observable.of(response));
        let params = { Id: methodStatement.Id };
        runner.queue(new DeleteMSOtherRiskAssessmentAction(params));
        let expt = new DeleteMSOtherRiskAssessmentCompleteAction(methodStatement.Id);

        manageMSEffect.msOtherRiskAssessmentDelete$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.delete).toHaveBeenCalledWith('MSOtherRiskAssessments/' + methodStatement.Id);
        })
    });

    it('should return complete action on success of other risk assessment update', () => {
        methodStatement.Id = '1234';
        let otherRiskAssessments: MSOtherRiskAssessments[] = MockStoreProviderFactory.getMockMSOtherRAs();
        let options = new ResponseOptions({ body: methodStatement });
        let response = new Response(options);

        store.dispatch(new LoadMethodStatementByIdCompleteAction(methodStatement));

        restClientServiceStub.post.and.returnValue(Observable.of(response));

        runner.queue(new AddMSOtherRAAction(otherRiskAssessments));


        manageMSEffect.updateMSOtherRA$.subscribe((result) => {
            let newMS = Object.assign({}, methodStatement);
            newMS.MSOtherRiskAssessments = otherRiskAssessments;
            let expt = [
                new AddMSOtherRACompleteAction(otherRiskAssessments),
                new LoadMethodStatementByIdCompleteAction(newMS)
            ]
            // expect(expt).toContain(result);
            expect(restClientServiceStub.post).toHaveBeenCalledWith('msotherriskassessments/BulkUpdate?isBulkUpdate=true', otherRiskAssessments);
        })
    });

    it('should return complete action on success of adding attachment to MS', () => {
        methodStatement.Id = '1234';
        let docs = MockStoreProviderFactory.getDocumentsStub();
        store.dispatch(new LoadMethodStatementByIdCompleteAction(methodStatement));

        let data = {
            Documents: docs
            , AttachmentTargetObject: methodStatement
        }
        let options = new ResponseOptions({ body: data });
        let response = new Response(options);

        restClientServiceStub.put.and.returnValue(Observable.of(response));

        runner.queue(new AddMethodStatementAttachmentAction(docs));
        let expt = new AddMethodStatementAttachmentCompleteAction(true);

        let params: URLSearchParams = new URLSearchParams();
        params.set('isAttachment', 'true');
        params.set('isBulkInsert', 'true');
        params.set('tag', 'MS SD - ' + methodStatement.Id);

        manageMSEffect.addMethodStatementAttachment$.subscribe((result) => {
            expect(result).toEqual(expt);
            expect(restClientServiceStub.put).toHaveBeenCalledWith('Attachment', data, { search: params });
        })
    });
})