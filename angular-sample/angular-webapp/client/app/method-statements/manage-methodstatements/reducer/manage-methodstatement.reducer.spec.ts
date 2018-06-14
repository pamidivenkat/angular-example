import { Store } from '@ngrx/store';
import { Procedure } from './../../procedures/models/procedure';
import { Observable } from 'rxjs/Rx';
import { MethodStatements, MethodStatement, MSProcedure, MethodStatementStat, MSOtherRiskAssessments, MSSafetyRespAssigned, MSSupportingDocuments, MSRiskAssessment } from './../../models/method-statement';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AtlasApiResponse, AtlasParams, AtlasApiRequest } from './../../../shared/models/atlas-api-response';
import * as manageMethodStatementsActions from './../actions/manage-methodstatement.actions';
import * as Immutable from 'immutable';
import {
    getMethodStatement,
    getMethodStatementId,
    ManageMethodStatementState,
    getMSSaftyResponsibilities,
    getMSSaftyResponsibilitiesTotalCount,
    getMSSaftyResponsibilitiesDataTableOptions,
    getProceduresForMS,
    getProcedureForMSTotalCount,
    getProcedureForMSDataTableOptions,
    getProceduresForMSLoadStatus,
    getMSSupportingDocs,
    getMSSupportingDocsImmutableList,
    getMethodStatementStatusUpdate,
    getMSAttachmentIds,
    getMSDocument,
    getMSRiskAssessments,
    getMSRiskAssessmentsTotalCount,
    getMSRiskAssessmentsDataTableOptions,
    getMSRiskassessmentDeleteStatus,
    getMSAttachmentOperationStatus,
    reducer
} from './manage-methodstatement.reducer';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { extractMSRiskAssessments } from '../../../method-statements/common/extract-helper';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from "../../../atlas-elements/common/models/ae-datatable-options";
import * as fromRoot from './../../../shared/reducers/index';

describe('Manage Method Statement State', () => {

    let atlasParamsArray: Array<any>;
    let sampleApiRequestParams: AtlasApiRequestWithParams;

    let sampleResponse: MethodStatement;
    let initialState: ManageMethodStatementState;
    let mockedProcedure: MSProcedure
    let supportingDocuments = MockStoreProviderFactory.getDocumnets();
    let modifiedState: ManageMethodStatementState;
    let startPageNumber = 1;
    let pageSize = 10;
    let slicedRecordsStartNumber = (startPageNumber * pageSize) - pageSize;
    let store: Store<fromRoot.State>;
    let initialWholeState: fromRoot.State;

    beforeEach(() => {
        mockedProcedure = new MSProcedure();
        initialState = {
            Id: null,
            IsExample: null,
            MethodStatement: null,
            IsMSRelatedriskassessmentInprogress: false,
            IsMSProceduceSaved: null,
            MSSaftyResponsibilitiesPagingInfo: null,
            apiRequestMSResponsibility: null,
            MSRespobsibilitiesPagedList: null,
            IsMSResponsibilityInprogress: false,
            MSRiskAssessmentsPagingInfo: null,
            apiRequestMSRiskAssessments: null,
            MSRiskAssessmentsPagedList: null,
            MSRiskAssessmentsProcessStatus: false,
            ProcedureForMSRequest: null,
            ProcedureListForMS: null,
            ProcedureForMSPagingInfo: null,
            HasProceduresForMSLoaded: null,
            MSSupportingDocs: null,
            MSSupportingDocsPagingInfo: null,
            IsMethodStatementStatusUpdated: false,
            MSAttachmentIds: null,
            MSDocument: null,
            IsMSAttachmentProcessDone: null
        }
        atlasParamsArray = [];
        sampleApiRequestParams = new AtlasApiRequestWithParams(0, 0, null, null, atlasParamsArray);
        sampleResponse = MockStoreProviderFactory.getTestMethodStatementData()
    });

    it('should return the default state', () => {
        const action = {} as any;
        const result = reducer(initialState, action);
        expect(result).toEqual(initialState);
    });

    it('should return current state when no valid actions have been made', () => {
        const actual = reducer(initialState, { type: 'INVALID_ACTION', payload: {} });
        const expected = initialState;
        expect(actual).toBe(expected);
    });

    it('should dispatch LOAD_METHOD_STATEMENT_BY_ID action to get the required method statement', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT] Method statement - load method statement by id', payload: { Id: '866fa33f-60b9-406b-b631-4d30c1e70f6c', IsExample: false } });
        expect(actual.Id).toEqual('866fa33f-60b9-406b-b631-4d30c1e70f6c');
        expect(actual.MethodStatement).toBeNull();
        expect(actual.IsExample).toBe(false);
        expect(actual.MSDocument).toBeNull();
    });

    it('should dispatch LOAD_METHOD_STATEMENT_BY_ID_COMPLETE action when method statement loaded successfully', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT] Method statement - load method statement by id complete', payload: sampleResponse });
        expect(actual.MethodStatement).toEqual(sampleResponse);
        expect(actual.MSDocument).toBeNull();
    });


    it('should dispatch UPDATE_METHOD_STATEMENT_COMPLETE action when method statement updated successfully', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  update method statement complete', payload: sampleResponse });
        expect(actual.Id).toEqual(sampleResponse.Id);
        expect(actual.IsExample).toEqual(sampleResponse.IsExample);
        expect(actual.MethodStatement).toEqual(sampleResponse);
        expect(actual.MSDocument).toBeNull();
    });

    it('should dispatch ADD_METHOD_STATEMENT_COMPLETE action when added new method statement successfully', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  add method statement complete', payload: sampleResponse });
        expect(actual.IsExample).toEqual(sampleResponse.IsExample);
        expect(actual.MethodStatement).toEqual(sampleResponse);
        expect(actual.MSDocument).toBeNull();
    });

    it('should dispatch UPDATE_MSPPE action when updating method statement personal protective equipment', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  update method statement PPE', payload: {} });
        expect(actual).toEqual(initialState);
    });

    it('should dispatch UPDATE_MSPPE_COMPLETE action action when method statement personal protective equipment updated successfully', () => {
        initialState.MethodStatement = sampleResponse;
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  update method statement PPE complete', payload: sampleResponse.MSPPE });
        expect(actual.MethodStatement.MSPPE).toEqual(sampleResponse.MSPPE);
    });

    it('should dispatch ADD_MS_PROCEDURE action when adding new method statement Procedure', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  Add method statement  procedures', payload: {} });
        expect(actual.IsMSProceduceSaved).toBe(false);
    });

    it('should dispatch UPDATE_MS_PROCEDURE action when updating method statement Procedure', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  Update method statement  procedures', payload: {} });
        expect(actual.IsMSProceduceSaved).toBe(false);
    });

    it(' should dispatch DELETE_MS_PROCEDURE action when deleting method statement Procedure', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  delete method statement  procedure', payload: {} });
        expect(actual.IsMSProceduceSaved).toBe(false);
    });

    it('should dispatch ADD_MS_PROCEDURE_COMPLETE action when added method statement Procedure successfully', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  Add method statement procedures complete', payload: {} });
        expect(actual.IsMSProceduceSaved).toBe(true);
    });

    it(' should dispatch UPDATE_MS_PROCEDURE_COMPLETE action when updated method statement Procedure successfully', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  Update method statement procedures complete', payload: {} });
        expect(actual.IsMSProceduceSaved).toBe(true);
    });

    it('should dispatch DELETE_MS_PROCEDURE_COMPLETE action when deleted method statement Procedure successfully', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  detete method statement procedure complete', payload: {} });
        expect(actual.IsMSProceduceSaved).toBe(true);
    });

    it('should dispatch LOAD_MSRESPONSIBILITIES_PAGING action to load method statement safety responsibilities', () => {
        initialState.MethodStatement = sampleResponse;
        /*    let startPageNumber = 1;
            let pageSize = 10;
            let slicedRecordsStartNumber = (startPageNumber * pageSize) - pageSize; */
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  load methodstatement responsibilities paging', payload: new AtlasApiRequest(startPageNumber, pageSize, '', null) });
        expect(actual.MSRespobsibilitiesPagedList).toEqual(initialState.MethodStatement.MSSafetyResponsibilities.slice(slicedRecordsStartNumber, pageSize));
        expect(actual.MSSaftyResponsibilitiesPagingInfo).toEqual(new PagingInfo(pageSize, sampleResponse.MSSafetyResponsibilities.length, startPageNumber, pageSize));
    });

    it('should dispatch LOAD_MSRISKASSESSMENTS_PAGING action to load method statement risk assessments', () => {
        initialState.MethodStatement = sampleResponse;

        let list = extractMSRiskAssessments(sampleResponse.MSRiskAssessmentMap, sampleResponse.MSOtherRiskAssessments);
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  load methodstatement riskassessments paging', payload: new AtlasApiRequest(startPageNumber, pageSize, '', null) });
        expect(actual.MSRiskAssessmentsPagedList).toEqual(list.slice(slicedRecordsStartNumber, pageSize));
        expect(actual.MSRiskAssessmentsPagingInfo).toEqual(new PagingInfo(pageSize, list.length, startPageNumber, pageSize));
    });

    it('should dispatch DELETE_MSRESPONSIBILITY action when deleting method statement responsibility', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  delete method statement  responsibility', payload: {} });
        expect(actual.IsMSResponsibilityInprogress).toBe(true);
    });

    it('should dispatch DELETE_MSRESPONSIBILITY_COMPLETE action when method statement responsibility deleted successfully', () => {
        initialState.MSRespobsibilitiesPagedList = sampleResponse.MSSafetyResponsibilities.slice(0, 10);
        initialState.MethodStatement = sampleResponse;
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  detete method statement responsibility complete', payload: sampleResponse.MSSafetyResponsibilities[0].Id });
        expect(actual.IsMSResponsibilityInprogress).toBe(false);
        expect(actual.MethodStatement.MSSafetyResponsibilities).toEqual(sampleResponse.MSSafetyResponsibilities);
    });

    it('should dispatch ADD_MSRESPONSIBILITY action when new method statement responsibility is added', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  add method statement responsibility', payload: {} });
        expect(actual.IsMSResponsibilityInprogress).toBe(true);
    });

    describe('should dispatch ADD_MSRESPONSIBILITY_COMPLETE action when method statement responsibility added successfully ', () => {
        it('when adding method statement responsibilities for the first time', () => {
            let mSSaftyresponsilility = sampleResponse.MSSafetyResponsibilities[0];
            initialState.MethodStatement = sampleResponse;
            initialState.MethodStatement.MSSafetyResponsibilities = null;
            const actual = reducer(initialState, { type: '[METHODSTATEMENT]  add method statement responsibility complete', payload: mSSaftyresponsilility });
            expect(actual.IsMSResponsibilityInprogress).toBe(false);
            expect(actual.MethodStatement.MSSafetyResponsibilities).toEqual(sampleResponse.MSSafetyResponsibilities);
            expect(actual.MSRespobsibilitiesPagedList).toEqual(sampleResponse.MSSafetyResponsibilities);
        });

        it('when adding method statement responsibilities not for the first time', () => {
            let mSSaftyresponsilility = sampleResponse.MSSafetyResponsibilities[0];
            initialState.MSRespobsibilitiesPagedList = sampleResponse.MSSafetyResponsibilities.slice(0, 10);
            initialState.MethodStatement = sampleResponse;
            initialState.MethodStatement.MSSafetyResponsibilities = null;
            const actual = reducer(initialState, { type: '[METHODSTATEMENT]  add method statement responsibility complete', payload: mSSaftyresponsilility });
            expect(actual.IsMSResponsibilityInprogress).toBe(false);
            expect(actual.MethodStatement.MSSafetyResponsibilities).toEqual(sampleResponse.MSSafetyResponsibilities);
            expect(actual.MSRespobsibilitiesPagedList).toContain(mSSaftyresponsilility);
        });

        it('when there is no responsibilities page information', () => {
            let mSSaftyresponsilility = sampleResponse.MSSafetyResponsibilities[0];
            initialState.MethodStatement = sampleResponse;
            const actual = reducer(initialState, { type: '[METHODSTATEMENT]  add method statement responsibility complete', payload: mSSaftyresponsilility });
            expect(actual.IsMSResponsibilityInprogress).toBe(false);
            expect(actual.MethodStatement.MSSafetyResponsibilities).toEqual(sampleResponse.MSSafetyResponsibilities);
            expect(actual.MSRespobsibilitiesPagedList).toContain(mSSaftyresponsilility);
        });

        it('when adding new method statement responsbilities to existing method statement responsibilities', () => {
            let mSSaftyresponsilility = sampleResponse.MSSafetyResponsibilities[0];
            initialState.MSRespobsibilitiesPagedList = sampleResponse.MSSafetyResponsibilities.slice(0, 10);
            initialState.MethodStatement = sampleResponse;
            const actual = reducer(initialState, { type: '[METHODSTATEMENT]  add method statement responsibility complete', payload: mSSaftyresponsilility });
            expect(actual.IsMSResponsibilityInprogress).toBe(false);
            expect(actual.MethodStatement.MSSafetyResponsibilities).toEqual(sampleResponse.MSSafetyResponsibilities);
            expect(actual.MSRespobsibilitiesPagedList).toContain(mSSaftyresponsilility);
        });
    });

    it('should dispatch UPDATE_MSRESPONSIBILITY action when updating method statement responsibility', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  update method statement responsibility', payload: {} });
        expect(actual.IsMSResponsibilityInprogress).toBe(true);
    });

    it('should dispatch UPDATE_MSRESPONSIBILITY_COMPLETE action when method statement responsibility updated successfully', () => {
        let mSSaftyresponsilility = sampleResponse.MSSafetyResponsibilities[0];
        initialState.MethodStatement = sampleResponse;
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  update method statement responsibility complete', payload: mSSaftyresponsilility });
        expect(actual.IsMSResponsibilityInprogress).toBe(false);
        expect(actual.MethodStatement.MSSafetyResponsibilities).toContain(mSSaftyresponsilility);
    });


    it('should dispatch LOAD_PROCEDURE_FOR_MS action to load procedure', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  load procedures for method statements', payload: sampleApiRequestParams });
        expect(actual.HasProceduresForMSLoaded).toBe(true);
    });

    it('should dispatch LOAD_PROCEDURE_FOR_MS_COMPLETE action when procedure loaded successfully', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  load procedures for method statements complete', payload: sampleResponse.MSProcedures });
        expect(actual.HasProceduresForMSLoaded).toBe(false);
        expect(actual.ProcedureListForMS).toBeUndefined();
        expect(actual.ProcedureForMSPagingInfo).toBeUndefined();
    });

    it('should dispatch LOAD_SUPPORTING_DOCUMENTS_BY_ID_COMPLETE action when loaded successfully', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT] Method statement - load supporting documents by id complete', payload: supportingDocuments });
        expect(actual.MSSupportingDocs).toBeTruthy();
    });

    it('should dispatch LOAD_SUPPORTING_DOCUMENTS_BY_ID_COMPLETE action with response null', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT] Method statement - load supporting documents by id complete', payload: null });
        expect(actual.MSSupportingDocs).toBeNull();
    });

    it('should dispatch UPDATE_METHOD_STATEMENT_STATUS_COMPLETE action when updated method statement successfully', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT] Method statement -update status complete', payload: true });
        expect(actual.IsMethodStatementStatusUpdated).toBe(true);
    });

    it('should dispatch GET_METHOD_STATEMENT_ATTACHMENTS_COMPLETE action when attachments are fetched successfully', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT] Method statement -get attachments complete', payload: ["d9fa2fbc-5c60-491c-90db-0c4a3edfc533"] });
        expect(actual.MSAttachmentIds).toEqual(["d9fa2fbc-5c60-491c-90db-0c4a3edfc533"]);
    });

    it('should dispatch SAVE_METHOD_STATEMENT_TO_ATLAS_COMPLETE action when exported successfully to atlas', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT] Method statement -save to atlas complete', payload: new Document() });
        expect(actual.MSDocument).toEqual(new Document());
    });

    it('should dispatch CLEAR_METHOD_STATEMENT_DOC_ID action to clear method statement document', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT] Method statement - clear document Id', payload: new Document() });
        expect(actual.MSDocument).toBeNull();
    });

    it('should dispatch MS_RESPONSIBILITY_LIST_COMPLETE action to update the method statement responsibilities in case of Add and Update', () => {
        initialState.MSRespobsibilitiesPagedList = sampleResponse.MSSafetyResponsibilities.slice(0, 10);
        let index = initialState.MSRespobsibilitiesPagedList.findIndex(f => f.Id === sampleResponse.MSSafetyResponsibilities[0].Id)
        const actual = reducer(initialState, { type: '[METHODSTATEMENT] Method statement responsibilities list complete', payload: sampleResponse.MSSafetyResponsibilities[0] });
        expect(actual.MSRespobsibilitiesPagedList[index]).toEqual(sampleResponse.MSSafetyResponsibilities[0]);
    });

    it('should dispatch MS_RESPONSIBILITY_LIST_COMPLETE action to update the state in case of Add and Update and if the method statement responsbilities page information is null', () => {
        initialState.MSRespobsibilitiesPagedList = sampleResponse.MSSafetyResponsibilities.slice(0, 10);
        let mSSaftyresponsilility = sampleResponse.MSSafetyResponsibilities[0];
        mSSaftyresponsilility.Id = 'abc234111';
        const actual = reducer(initialState, { type: '[METHODSTATEMENT] Method statement responsibilities list complete', payload: mSSaftyresponsilility });
        expect(actual.MSRespobsibilitiesPagedList).toContain(mSSaftyresponsilility);
    });

    it('should dispatch DELETE_MSOTHER_RISKASSESSMENT action when deleting other risk assessment', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  delete method statement  other risk assessment', payload: {} });
        expect(actual.MSRiskAssessmentsProcessStatus).toBe(false);
    });

    it('should dispatch DELETE_MSOTHER_RISKASSESSMENT_COMPLETE action when deleted other risk assessment successfully', () => {
        sampleResponse.MSOtherRiskAssessments = [];
        sampleResponse.MSOtherRiskAssessments.push({ Id: '12343', CompanyId: '45126', MethodStatementId: 'ABC-123-XYZ', ReferenceNumber: '2345', Name: 'TestDelete' })
        let list = extractMSRiskAssessments(sampleResponse.MSRiskAssessmentMap, sampleResponse.MSOtherRiskAssessments);
        initialState.MSRiskAssessmentsPagedList = list;
        initialState.MethodStatement = sampleResponse;
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  detete method statement  other risk assessment complete', payload: '12343' });
        expect(actual.MethodStatement.MSOtherRiskAssessments.length).toBe(0);
    });

    it('should dispatch ADD_MSOTHER_RISKASSESSMENT action when adding other risk assessment', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  add method statement other riskassessment', payload: {} });
        expect(actual).toEqual(initialState);
    });

    it('should dispatch ADD_MSOTHER_RISKASSESSMENT_COMPLETE action when added other risk assessment first time ', () => {
        initialState.MethodStatement = sampleResponse;
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  add method statement  other riskassessment complete', payload: [{ Id: '12343', CompanyId: '45126', MethodStatementId: 'ABC-123-XYZ', ReferenceNumber: '2345', Name: 'TestDelete' }] });
        expect(actual.MethodStatement.MSOtherRiskAssessments).toEqual([{ Id: '12343', CompanyId: '45126', MethodStatementId: 'ABC-123-XYZ', ReferenceNumber: '2345', Name: 'TestDelete' }])
    });

    it('should dispatch ADD_METHOD_STATEMENT_ATTACHMENT action when added attachments', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  add method statement - attachment', payload: [new Document()] });
        expect(actual.IsMSAttachmentProcessDone).toBe(false);
    });

    it('should dispatch ADD_METHOD_STATEMENT_ATTACHMENT_COMPLETE action when added attachments successfully', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  add method statement - attachment complete', payload: {} });
        expect(actual.IsMSAttachmentProcessDone).toBe(true);
    });

    it('should dispatch DELETE_METHOD_STATEMENT_ATTACHMENT action when deleted attachment', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  delete method statement - attachment', payload: new Document() });
        expect(actual.IsMSAttachmentProcessDone).toBe(false);
    });

    it('should dispatch DELETE_METHOD_STATEMENT_ATTACHMENT_COMPLETE action when deleted attachments successfully', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT]  delete method statement - attachment complete', payload: {} });
        expect(actual.IsMSAttachmentProcessDone).toBe(true);
    });

    it('should dispatch CLEAR_METHOD_STATEMENT action to clear state without passing any information ', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT] clear method statement state info', payload: undefined });
        expect(actual).toEqual(initialState);
    });

    it('should dispatch CLEAR_METHOD_STATEMENT action clear state by passing information different from the method statement information', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT] clear method statement state info', payload: '' });
        expect(actual).toEqual(initialState);
    });

    it('should dispatch CLEAR_METHOD_STATEMENT action whenever state need to be removed for particular method statement by passing method statement information', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT] clear method statement state info', payload: {} });
        expect(actual).toEqual(initialState);
    });

    it('should dispatch CLEAR_ADD_PROCEDURES_SLIDE_STATE action when add procedure slide out closed', () => {
        const actual = reducer(initialState, { type: '[METHODSTATEMENT] clear method statement add procedures state info', payload: true });
        expect(actual.ProcedureForMSPagingInfo).toBeNull();
        expect(actual.ProcedureListForMS).toBeNull();
    });



    describe('Functions in the Manage Method statements reducer', () => {
        //    let list = extractMSRiskAssessments(sampleResponse.MSRiskAssessmentMap, sampleResponse.MSOtherRiskAssessments);
        beforeEach(() => {
            store = MockStoreProviderFactory.createInitialStore();
            store.subscribe(s => { initialWholeState = s; });
            modifiedState = {
                Id: '866fa33f-60b9-406b-b631-4d30c1e70f6c',
                IsExample: false,
                MethodStatement: sampleResponse,
                IsMSRelatedriskassessmentInprogress: false,
                IsMSProceduceSaved: null,
                MSSaftyResponsibilitiesPagingInfo: new PagingInfo(pageSize, sampleResponse.MSSafetyResponsibilities.length, startPageNumber, pageSize),
                apiRequestMSResponsibility: null,
                MSRespobsibilitiesPagedList: sampleResponse.MSSafetyResponsibilities,
                IsMSResponsibilityInprogress: false,
                MSRiskAssessmentsPagingInfo: new PagingInfo(pageSize, sampleResponse.MSSafetyResponsibilities.length, startPageNumber, pageSize),
                apiRequestMSRiskAssessments: null,
                MSRiskAssessmentsPagedList: [],
                MSRiskAssessmentsProcessStatus: false,
                ProcedureForMSRequest: null,
                ProcedureListForMS: [],
                ProcedureForMSPagingInfo: new PagingInfo(pageSize, sampleResponse.MSSafetyResponsibilities.length, startPageNumber, pageSize),
                HasProceduresForMSLoaded: null,
                MSSupportingDocs: [],
                MSSupportingDocsPagingInfo: null,
                IsMethodStatementStatusUpdated: false,
                MSAttachmentIds: ["d9fa2fbc-5c60-491c-90db-0c4a3edfc533"],
                MSDocument: null,
                IsMSAttachmentProcessDone: null
            };
            initialWholeState.manageMethodStatementState = modifiedState;
        });

        it('function should return id of MS', () => {
            (store.let(fromRoot.getManageMethodStatementIdData)).subscribe(Id => {
                expect(Id).toEqual(modifiedState.Id);
            });
        });
        it('function should return methodStatement in state object', () => {
            (store.let(fromRoot.getManageMethodStatementData)).subscribe(methodStatement => {
                expect(methodStatement).toEqual(modifiedState.MethodStatement);
            });
        });
        it('function should return Immutable list of RespobsibilitiesList of the MS', () => {
            (store.let(fromRoot.getMSSaftyResponsibilities)).subscribe(msRespobsibilitiesList => {
                expect(msRespobsibilitiesList).toEqual(Immutable.List<MSSafetyRespAssigned>(modifiedState.MSRespobsibilitiesPagedList));
            });
        });
        it('function should return MSSaftyResponsibilities total count of the MS', () => {
            (store.let(fromRoot.getMSSaftyResponsibilitiesTotalCount)).subscribe(MSSaftyResponsibilitiesPagingInfoTotalCount => {
                expect(MSSaftyResponsibilitiesPagingInfoTotalCount).toEqual(modifiedState.MSSaftyResponsibilitiesPagingInfo.TotalCount);
            });
        });
        it('function should return MSSaftyResponsibilities datatable options of the MS', () => {
            let pagingInformation = new PagingInfo(modifiedState.MSSaftyResponsibilitiesPagingInfo.PageSize, modifiedState.MSSaftyResponsibilitiesPagingInfo.TotalCount, modifiedState.MSSaftyResponsibilitiesPagingInfo.PageNumber, modifiedState.MSSaftyResponsibilitiesPagingInfo.PageSize);
            let dataTableOptions = new DataTableOptions(pagingInformation.PageNumber, pagingInformation.Count);
            (store.let(fromRoot.getMSSaftyResponsibilitiesDataTableOptions)).subscribe(options => {
                expect(options).toEqual(dataTableOptions);
            });
        });
        it('function should return Immutable list of procedurelist of the MS', () => {
            (store.let(fromRoot.getProceduresForMSData)).subscribe(procedurelist => {
                expect(procedurelist).toEqual(Immutable.List<Procedure>(modifiedState.ProcedureListForMS));
            });
        });
        it('function should return Procedure total count of the MS', () => {
            (store.let(fromRoot.getProcedureForMSTotalCountNumber)).subscribe(procedureMSPagingInfoTotalCount => {
                expect(procedureMSPagingInfoTotalCount).toEqual(modifiedState.ProcedureForMSPagingInfo.TotalCount);
            });
        });
        it('function should return Procedure datatable options of the MS', () => {
            let pagingInformation = new PagingInfo(modifiedState.ProcedureForMSPagingInfo.PageSize, modifiedState.ProcedureForMSPagingInfo.TotalCount, modifiedState.ProcedureForMSPagingInfo.PageNumber, modifiedState.ProcedureForMSPagingInfo.PageSize);
            let dataTableOptions = new DataTableOptions(pagingInformation.PageNumber, pagingInformation.Count);
            (store.let(fromRoot.getProcedureForMSDataTableOptionsData)).subscribe(options => {
                expect(options).toEqual(dataTableOptions);
            });
        });
        it('function should return HasProceduresForMSLoaded of MS Procedure', () => {
            (store.let(fromRoot.getProceduresForMSLoadStatusValue)).subscribe(status => {
                expect(status).toEqual(modifiedState.HasProceduresForMSLoaded);
            });
        });
        it('function should return supportingDocs of MS', () => {
            (store.let(fromRoot.getMSSupportingDocs)).subscribe(supportingDocs => {
                expect(supportingDocs).toEqual(modifiedState.MSSupportingDocs);
            });
        });
        it('function should return Immutable list of supportingDocslist of the MS', () => {
            (store.let(fromRoot.getMSSupportingDocsImmutableList)).subscribe(supportingDocslist => {
                expect(supportingDocslist).toEqual(Immutable.List<MSSupportingDocuments>(modifiedState.MSSupportingDocs));
            });
        });
        it('function should return IsMethodStatementStatusUpdated flag of MS Status', () => {
            (store.let(fromRoot.getMethodStatementStatusUpdate)).subscribe(status => {
                expect(status).toEqual(modifiedState.IsMethodStatementStatusUpdated);
            });
        });
        it('function should return MSAttachmentIds  of MS', () => {
            (store.let(fromRoot.getMSAttachmentIds)).subscribe(ids => {
                expect(ids).toEqual(modifiedState.MSAttachmentIds);
            });
        });
        it('function should return MSDocument of MS', () => {
            (store.let(fromRoot.getMSDocument)).subscribe(ids => {
                expect(ids).toEqual(modifiedState.MSDocument);
            });
        });
       it('function should return Immutable list of RiskAssessment of the MS', () => {
            (store.let(fromRoot.getMSRiskAssessments)).subscribe(riskAssessmentlist => {
                expect(riskAssessmentlist).toEqual(Immutable.List<MSRiskAssessment>(modifiedState.MSRiskAssessmentsPagedList));
            });
        });
        it('function should return RiskAssessments total count of the MS', () => {
            (store.let(fromRoot.getMSRiskAssessmentsTotalCount)).subscribe(msRiskAssessmentsPagingInfoTotalCount => {
                expect(msRiskAssessmentsPagingInfoTotalCount).toEqual(modifiedState.MSRiskAssessmentsPagingInfo.TotalCount);
            });
        });
        it('function should return RiskAssessments datatable options of the MS', () => {
            let pagingInformation = new PagingInfo(modifiedState.MSRiskAssessmentsPagingInfo.PageSize, modifiedState.MSRiskAssessmentsPagingInfo.TotalCount, modifiedState.MSRiskAssessmentsPagingInfo.PageNumber, modifiedState.MSRiskAssessmentsPagingInfo.PageSize);
            let dataTableOptions = new DataTableOptions(pagingInformation.PageNumber, pagingInformation.Count);
            (store.let(fromRoot.getMSRiskAssessmentsDataTableOptions)).subscribe(options => {
                expect(options).toEqual(dataTableOptions);
            });
        });       
        it('function should return RiskAssessmentsProcessStatus flag status', () => {
            (store.let(fromRoot.getMSRiskassessmentDeleteStatus)).subscribe(status => {
                expect(status).toEqual(modifiedState.MSRiskAssessmentsProcessStatus);
            });
        });
        it('function should return IsMSAttachmentProcessDone flag status', () => {
            (store.let(fromRoot.getMSAttachmentOperationStatus)).subscribe(status => {
                expect(status).toEqual(modifiedState.IsMSAttachmentProcessDone);
            });
        });    

    });
});