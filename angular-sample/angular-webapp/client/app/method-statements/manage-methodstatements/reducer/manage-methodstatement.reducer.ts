import { RiskAssessment } from './../../../risk-assessment/models/risk-assessment';

import {
    AddCQCProDetailsCompleteAction
} from '../../../document/document-details/actions/document-export-to-cqc.actions';
import { MethodStatement, MSSafetyRespAssigned, MSSupportingDocuments, MSRiskAssessment } from '../../models/method-statement';
import { AtlasApiRequest, AtlasApiResponse, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Rx';
import { Action, ActionReducer, combineReducers } from '@ngrx/store';
import * as methodStatementActions from './../actions/manage-methodstatement.actions';
import { compose } from '@ngrx/core';
import * as Immutable from 'immutable';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { extractDataTableOptions } from '../../../shared/helpers/extract-helpers';
import { CommonHelpers } from '../../../shared/helpers/common-helpers';
import { Procedure } from './../../procedures/models/procedure';
import { extractMSRiskAssessments } from '../../../method-statements/common/extract-helper';
import { Document } from '../../../document/models/document';

export interface ManageMethodStatementState {
    Id: string;
    IsExample: boolean;
    MethodStatement: MethodStatement;
    IsMSRelatedriskassessmentInprogress: boolean,
    IsMSProceduceSaved: boolean;
    MSSaftyResponsibilitiesPagingInfo: PagingInfo;
    apiRequestMSResponsibility: AtlasApiRequest;
    MSRespobsibilitiesPagedList: MSSafetyRespAssigned[];
    IsMSResponsibilityInprogress: boolean;
    MSRiskAssessmentsPagingInfo: PagingInfo;
    apiRequestMSRiskAssessments: AtlasApiRequest;
    MSRiskAssessmentsPagedList: MSRiskAssessment[];
    MSRiskAssessmentsProcessStatus: boolean
    MSSupportingDocs: MSSupportingDocuments[];
    MSSupportingDocsPagingInfo: PagingInfo;
    IsMethodStatementStatusUpdated: boolean;
    MSAttachmentIds: string[];
    MSDocument: Document;
    HasProceduresForMSLoaded: boolean;
    ProcedureForMSRequest: AtlasApiRequestWithParams;
    ProcedureListForMS: Procedure[];
    ProcedureForMSPagingInfo: PagingInfo;
    IsMSAttachmentProcessDone: boolean;
}

const initialState: ManageMethodStatementState = {
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

export function reducer(state = initialState, action: Action): ManageMethodStatementState {
    switch (action.type) {
        case methodStatementActions.ActionTypes.LOAD_METHOD_STATEMENT_BY_ID:
            {
                //making the methodstatement as null when this call is raised 
                return Object.assign({}, state, { Id: action.payload.Id, IsExample: action.payload.IsExample, MethodStatement: null, MSDocument: null });
            }
        case methodStatementActions.ActionTypes.LOAD_METHOD_STATEMENT_BY_ID_COMPLETE:
            {
                return Object.assign({}, state, { MethodStatement: action.payload, MSDocument: null });
            }
        case methodStatementActions.ActionTypes.UPDATE_METHOD_STATEMENT_COMPLETE:
            {
                return Object.assign({}, state, { MethodStatement: action.payload, Id: action.payload.Id, IsExample: action.payload.IsExample, MSDocument: null });
            }

        case methodStatementActions.ActionTypes.ADD_METHOD_STATEMENT_COMPLETE: {
            return Object.assign({}, state, { MethodStatement: action.payload, IsExample: action.payload.IsExample });
        }

        case methodStatementActions.ActionTypes.UPDATE_MSPPE:
            {
                return Object.assign({}, state, {});
            }
        case methodStatementActions.ActionTypes.UPDATE_MSPPE_COMPLETE:
            {
                let modifiedState: ManageMethodStatementState = Object.assign({}, state, {});
                modifiedState.MethodStatement.MSPPE = action.payload;
                return modifiedState;
            }
        case methodStatementActions.ActionTypes.ADD_MS_PROCEDURE:
        case methodStatementActions.ActionTypes.UPDATE_MS_PROCEDURE:
        case methodStatementActions.ActionTypes.DELETE_MS_PROCEDURE:
            {
                return Object.assign({}, state, { IsMSProceduceSaved: false });
            }
        case methodStatementActions.ActionTypes.ADD_MS_PROCEDURE_COMPLETE:
        case methodStatementActions.ActionTypes.UPDATE_MS_PROCEDURE_COMPLETE:
        case methodStatementActions.ActionTypes.DELETE_MS_PROCEDURE_COMPLETE:
            {
                return Object.assign({}, state, { IsMSProceduceSaved: true });
            }
        case methodStatementActions.ActionTypes.LOAD_MSRESPONSIBILITIES_PAGING: {
            let request = <AtlasApiRequest>action.payload;
            let modifiedState: ManageMethodStatementState = Object.assign({}, state, { apiRequestMSResponsibility: action.payload });
            let stateList = modifiedState.MethodStatement.MSSafetyResponsibilities;
            let totalCount = modifiedState.MethodStatement.MSSafetyResponsibilities ? modifiedState.MethodStatement.MSSafetyResponsibilities.length : 0;

            let startPage = (request.PageNumber * request.PageSize) - request.PageSize;
            let endPage = (request.PageNumber * request.PageSize);
            let slicedRecords = stateList && stateList.length > 0 ? stateList.slice(startPage, endPage) : [];
            modifiedState.MSRespobsibilitiesPagedList = slicedRecords;
            //DO NOT SEND slicedRecords.length to pagingInfo count
            modifiedState.MSSaftyResponsibilitiesPagingInfo = new PagingInfo(request.PageSize, totalCount, request.PageNumber, request.PageSize);
            return modifiedState;
        }
        case methodStatementActions.ActionTypes.LOAD_MSRISKASSESSMENTS_PAGING: {
            let request = <AtlasApiRequest>action.payload;
            let modifiedState: ManageMethodStatementState = Object.assign({}, state, { apiRequestMSRiskAssessments: action.payload });
            let list = extractMSRiskAssessments(modifiedState.MethodStatement.MSRiskAssessmentMap, modifiedState.MethodStatement.MSOtherRiskAssessments);

            let totalCount = list.length;

            let startPage = (request.PageNumber * request.PageSize) - request.PageSize;
            let endPage = (request.PageNumber * request.PageSize);
            let slicedRecords = list.slice(startPage, endPage);
            modifiedState.MSRiskAssessmentsPagedList = slicedRecords;
            //DO NOT SEND slicedRecords.length to pagingInfo count
            modifiedState.MSRiskAssessmentsPagingInfo = new PagingInfo(request.PageSize, totalCount, request.PageNumber, request.PageSize);
            return modifiedState;
        }
        case methodStatementActions.ActionTypes.DELETE_MSRESPONSIBILITY:
            {
                return Object.assign({}, state, { IsMSResponsibilityInprogress: true });
            }
        case methodStatementActions.ActionTypes.DELETE_MSRESPONSIBILITY_COMPLETE:
            {
                let modifiedState: ManageMethodStatementState = Object.assign({}, state, { IsMSResponsibilityInprogress: false });
                modifiedState.MSRespobsibilitiesPagedList = modifiedState.MSRespobsibilitiesPagedList.filter(p => p.Id !== action.payload);
                modifiedState.MethodStatement.MSSafetyResponsibilities = modifiedState.MethodStatement.MSSafetyResponsibilities.filter(p => p.Id !== action.payload);
                return modifiedState;
            }
        case methodStatementActions.ActionTypes.ADD_MSRESPONSIBILITY:
            {
                return Object.assign({}, state, { IsMSResponsibilityInprogress: true });
            }
        case methodStatementActions.ActionTypes.ADD_MSRESPONSIBILITY_COMPLETE:
            {
                let modifiedState: ManageMethodStatementState = Object.assign({}, state, { IsMSResponsibilityInprogress: false });
                if (isNullOrUndefined(modifiedState.MethodStatement.MSSafetyResponsibilities)) {
                    modifiedState.MethodStatement.MSSafetyResponsibilities = [];
                }
                if (isNullOrUndefined(modifiedState.MSRespobsibilitiesPagedList)) {
                    modifiedState.MSRespobsibilitiesPagedList = [];
                }
                let modifiedMsResponsibilities = Array.from(modifiedState.MethodStatement.MSSafetyResponsibilities);
                modifiedMsResponsibilities.push(action.payload);
                modifiedState.MethodStatement.MSSafetyResponsibilities = modifiedMsResponsibilities;
                let modifiedMSPagedResponsibilities = Array.from(modifiedState.MSRespobsibilitiesPagedList);
                modifiedMSPagedResponsibilities.push(action.payload);
                modifiedState.MSRespobsibilitiesPagedList = modifiedMSPagedResponsibilities;
                return modifiedState;
            }
        case methodStatementActions.ActionTypes.UPDATE_MSRESPONSIBILITY:
            {
                return Object.assign({}, state, { IsMSResponsibilityInprogress: true });
            }
        case methodStatementActions.ActionTypes.UPDATE_MSRESPONSIBILITY_COMPLETE:
            {
                let modifiedState: ManageMethodStatementState = Object.assign({}, state, { IsMSResponsibilityInprogress: false });
                if (isNullOrUndefined(modifiedState.MethodStatement.MSSafetyResponsibilities)) {
                    modifiedState.MethodStatement.MSSafetyResponsibilities = [];
                }
                let modifiedMsSafetyResp = [];
                modifiedState.MethodStatement.MSSafetyResponsibilities.forEach(resp => {
                    if (resp.Id == action.payload.Id) {
                        let existingResponsibilities = Array.from(resp.Responsibilities);
                        resp = Object.assign({}, resp, action.payload);
                        resp.Responsibilities = existingResponsibilities;
                    }
                    modifiedMsSafetyResp.push(resp);
                });
                modifiedState.MethodStatement.MSSafetyResponsibilities = modifiedMsSafetyResp;
                return modifiedState;

            }
        case methodStatementActions.ActionTypes.LOAD_PROCEDURE_FOR_MS: {
            return Object.assign({}, state, { HasProceduresForMSLoaded: true, ProcedureForMSRequest: action.payload });
        }
        case methodStatementActions.ActionTypes.LOAD_PROCEDURE_FOR_MS_COMPLETE: {
            let modifiedState: ManageMethodStatementState = Object.assign({}
                , state
                , {
                    HasProceduresForMSLoaded: false,
                    ProcedureListForMS: action.payload.Entities
                });

            if (!isNullOrUndefined(state.ProcedureForMSPagingInfo)) {
                if (action.payload.PagingInfo.PageNumber == 1) {
                    modifiedState.ProcedureForMSPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                }
                modifiedState.ProcedureForMSPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                modifiedState.ProcedureForMSPagingInfo.Count = action.payload.PagingInfo.Count;
            } else {
                modifiedState.ProcedureForMSPagingInfo = action.payload.PagingInfo;
            }
            return modifiedState;
        }
        case methodStatementActions.ActionTypes.LOAD_SUPPORTING_DOCUMENTS_BY_ID_COMPLETE:
            {
                let modifiedState: ManageMethodStatementState = Object.assign({}, state, { MSSupportingDocs: action.payload });
                return modifiedState;
            }
        case methodStatementActions.ActionTypes.UPDATE_METHOD_STATEMENT_STATUS_COMPLETE:
            {
                return Object.assign({}, state, { IsMethodStatementStatusUpdated: action.payload });
            }
        case methodStatementActions.ActionTypes.GET_METHOD_STATEMENT_ATTACHMENTS_COMPLETE:
            {
                return Object.assign({}, state, { MSAttachmentIds: action.payload });
            }
        case methodStatementActions.ActionTypes.SAVE_METHOD_STATEMENT_TO_ATLAS_COMPLETE:
            {
                return Object.assign({}, state, { MSDocument: action.payload });
            }
        case methodStatementActions.ActionTypes.CLEAR_METHOD_STATEMENT_DOC_ID:
            {
                return Object.assign({}, state, { MSDocument: null });
            }
        case methodStatementActions.ActionTypes.MS_RESPONSIBILITY_LIST_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                let id = action.payload.Id;
                let selectedResponsibility = modifiedState.MSRespobsibilitiesPagedList;
                let selectedHazard = selectedResponsibility.find(s => s.Id === id);
                if (isNullOrUndefined(selectedHazard)) {
                    modifiedState.MSRespobsibilitiesPagedList.push(action.payload);
                }
                else {
                    let index = selectedResponsibility.findIndex(f => f.Id === id);
                    if (index !== -1) {
                        modifiedState.MSRespobsibilitiesPagedList[index] = action.payload;
                    }
                }
                return modifiedState;
            }
        case methodStatementActions.ActionTypes.MS_RESPONSIBILITY_REMOVELIST_COMPLETE: {
            let modifiedState = Object.assign({}, state, {});
            let responsibilityId = action.payload.Id;
            let selectedResponsibility = modifiedState.MSRespobsibilitiesPagedList;
            let index = selectedResponsibility.findIndex(f => f.Id === responsibilityId);
            if (index !== -1) {
                modifiedState.MSRespobsibilitiesPagedList.splice(index, 1);
            }
            return modifiedState;
        }
        case methodStatementActions.ActionTypes.DELETE_MSOTHER_RISKASSESSMENT:
            {
                return Object.assign({}, state, { MSRiskAssessmentsProcessStatus: false });
            }
        case methodStatementActions.ActionTypes.DELETE_MSOTHER_RISKASSESSMENT_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, { MSRiskAssessmentsProcessStatus: true });
                let list = modifiedState.MSRiskAssessmentsPagedList;
                let listIndex = list.findIndex(f => f.Id === action.payload);
                let msOtherIndex = modifiedState.MethodStatement.MSOtherRiskAssessments.findIndex(f => f.Id === action.payload);
                if (listIndex !== -1) {
                    modifiedState.MSRiskAssessmentsPagedList.splice(listIndex, 1);
                }
                if (msOtherIndex !== -1) {
                    modifiedState.MethodStatement.MSOtherRiskAssessments.splice(msOtherIndex, 1);
                }
                return modifiedState;
            }
        case methodStatementActions.ActionTypes.ADD_MSOTHER_RISKASSESSMENT:
            {
                return Object.assign({}, state, {});
            }
        case methodStatementActions.ActionTypes.ADD_MSOTHER_RISKASSESSMENT_COMPLETE:
            {
                let newState = Object.assign({}, state, {});
                if (isNullOrUndefined(newState.MethodStatement.MSOtherRiskAssessments)) {
                    newState.MethodStatement.MSOtherRiskAssessments = [];
                }
                newState.MethodStatement.MSOtherRiskAssessments = action.payload;
                newState.MSRiskAssessmentsPagedList = extractMSRiskAssessments(newState.MethodStatement.MSRiskAssessmentMap, newState.MethodStatement.MSOtherRiskAssessments);
                return Object.assign({}, newState, {});
            }

        case methodStatementActions.ActionTypes.ADD_METHOD_STATEMENT_ATTACHMENT:
            {
                return Object.assign({}, state, { IsMSAttachmentProcessDone: false });
            }
        case methodStatementActions.ActionTypes.ADD_METHOD_STATEMENT_ATTACHMENT_COMPLETE:
            {
                return Object.assign({}, state, { IsMSAttachmentProcessDone: true });
            }
        case methodStatementActions.ActionTypes.DELETE_METHOD_STATEMENT_ATTACHMENT:
            {
                return Object.assign({}, state, { IsMSAttachmentProcessDone: false });
            }
        case methodStatementActions.ActionTypes.DELETE_METHOD_STATEMENT_ATTACHMENT_COMPLETE:
            {
                return Object.assign({}, state, { IsMSAttachmentProcessDone: true });
            }

        case methodStatementActions.ActionTypes.CLEAR_METHOD_STATEMENT:
            {
                let modifiedState: ManageMethodStatementState;
                let pl = action.payload;
                if (isNullOrUndefined(pl)) {
                    //clear is requestd in add mode so we need to clear straight away...
                    modifiedState = Object.assign({}, initialState, {});
                } else {
                    //payload is requested with one method statement id
                    if (pl != state.Id) {
                        //when requested id is not matching with that of state id then clear it off..
                        modifiedState = Object.assign({}, initialState, {});
                    } else {
                        //assign existing state  
                        modifiedState = Object.assign({}, state, {});
                    }
                }
                return modifiedState;
            }
        case methodStatementActions.ActionTypes.CLEAR_ADD_PROCEDURES_SLIDE_STATE:
            {
                return Object.assign({}, state, { ProcedureForMSPagingInfo: null, ProcedureListForMS: null });
            }

        default:
            {
                return state;
            }
    }
}

export function getMethodStatementId(state$: Observable<ManageMethodStatementState>): Observable<string> {
    return state$.select(s => s.Id);
}

export function getMethodStatement(state$: Observable<ManageMethodStatementState>): Observable<MethodStatement> {
    return state$.select(s => s.MethodStatement);
}

export function getMSRiskAssessmentMap(state$: Observable<ManageMethodStatementState>): Observable<RiskAssessment[]> {
    return state$.select(s => s.MethodStatement && s.MethodStatement.MSRiskAssessmentMap);
}
export function getMSSaftyResponsibilities(state$: Observable<ManageMethodStatementState>): Observable<Immutable.List<MSSafetyRespAssigned>> {
    return state$.select(s => s.MSRespobsibilitiesPagedList && Immutable.List<MSSafetyRespAssigned>(s.MSRespobsibilitiesPagedList));
}


export function getMSSaftyResponsibilitiesTotalCount(state$: Observable<ManageMethodStatementState>): Observable<number> {
    return state$.select(s => s.MSSaftyResponsibilitiesPagingInfo && s.MSSaftyResponsibilitiesPagingInfo.TotalCount);
}
export function getMSSaftyResponsibilitiesDataTableOptions(state$: Observable<ManageMethodStatementState>): Observable<DataTableOptions> {
    return state$.select(s => s.MethodStatement && s.MethodStatement.MSSafetyResponsibilities && s.MSSaftyResponsibilitiesPagingInfo && extractDataTableOptions(s.MSSaftyResponsibilitiesPagingInfo));
}

export function getProceduresForMS(state$: Observable<ManageMethodStatementState>): Observable<Immutable.List<Procedure>> {
    return state$.select(s => s.ProcedureListForMS && Immutable.List<Procedure>(s.ProcedureListForMS));
}

export function getProcedureForMSTotalCount(state$: Observable<ManageMethodStatementState>): Observable<number> {
    return state$.select(s => s && s.ProcedureForMSPagingInfo && s.ProcedureForMSPagingInfo.TotalCount);
}

export function getProcedureForMSDataTableOptions(state$: Observable<ManageMethodStatementState>): Observable<DataTableOptions> {
    return state$.select(s => s.ProcedureListForMS &&
        s.ProcedureForMSPagingInfo &&
        extractDataTableOptions(s.ProcedureForMSPagingInfo));
}

export function getProceduresForMSLoadStatus(state$: Observable<ManageMethodStatementState>): Observable<boolean> {
    return state$.select(c => c.HasProceduresForMSLoaded);
}
export function getMSSupportingDocs(state$: Observable<ManageMethodStatementState>): Observable<MSSupportingDocuments[]> {
    return state$.select(s => s.MSSupportingDocs);
}
export function getMSSupportingDocsImmutableList(state$: Observable<ManageMethodStatementState>): Observable<Immutable.List<MSSupportingDocuments>> {
    return state$.select(s => s.MSSupportingDocs && Immutable.List<MSSupportingDocuments>(s.MSSupportingDocs));
}

export function getMethodStatementStatusUpdate(state$: Observable<ManageMethodStatementState>): Observable<boolean> {
    return state$.select(s => s.IsMethodStatementStatusUpdated);
}

export function getMSAttachmentIds(state$: Observable<ManageMethodStatementState>): Observable<string[]> {
    return state$.select(s => s.MSAttachmentIds);
}
export function getMSDocument(state$: Observable<ManageMethodStatementState>): Observable<Document> {
    return state$.select(s => s.MSDocument);
}

export function getMSRiskAssessments(state$: Observable<ManageMethodStatementState>): Observable<Immutable.List<MSRiskAssessment>> {
    return state$.select(s => s.MSRiskAssessmentsPagedList && Immutable.List<MSRiskAssessment>(s.MSRiskAssessmentsPagedList));
}


export function getMSRiskAssessmentsTotalCount(state$: Observable<ManageMethodStatementState>): Observable<number> {
    return state$.select(s => s.MSRiskAssessmentsPagingInfo && s.MSRiskAssessmentsPagingInfo.TotalCount);
}
export function getMSRiskAssessmentsDataTableOptions(state$: Observable<ManageMethodStatementState>): Observable<DataTableOptions> {
    return state$.select(s => s.MSRiskAssessmentsPagedList && s.MSRiskAssessmentsPagingInfo && extractDataTableOptions(s.MSRiskAssessmentsPagingInfo));
}

export function getMSRiskassessmentDeleteStatus(state$: Observable<ManageMethodStatementState>): Observable<boolean> {
    return state$.select(s => s.MSRiskAssessmentsProcessStatus);
}

export function getMSAttachmentOperationStatus(state$: Observable<ManageMethodStatementState>): Observable<boolean> {
    return state$.select(s => s.IsMSAttachmentProcessDone);
}