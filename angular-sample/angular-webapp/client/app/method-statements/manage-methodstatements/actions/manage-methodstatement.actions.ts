import { MethodStatement, MSPPE, MSSafetyRespAssigned, MSProcedure, MSSupportingDocuments, MSOtherRiskAssessments } from './../../models/method-statement';
import { Actions, toPayload } from '@ngrx/effects';
import {
    AtlasApiResponse
    , AtlasApiRequest
    , AtlasApiRequestWithParams
} from './../../../shared/models/atlas-api-response';
import { Action } from '@ngrx/store';
import { type } from './../../../shared/util';
import * as Immutable from 'immutable';
import { Procedure } from '../../procedures/models/procedure';
import { Document } from './../../../document/models/document';

export const ActionTypes = {
    LOAD_METHOD_STATEMENT_BY_ID: type('[METHODSTATEMENT] Method statement - load method statement by id'),
    LOAD_METHOD_STATEMENT_BY_ID_COMPLETE: type('[METHODSTATEMENT] Method statement - load method statement by id complete'),
    UPDATE_METHOD_STATEMENT: type('[METHODSTATEMENT]  update method statement'),
    UPDATE_METHOD_STATEMENT_COMPLETE: type('[METHODSTATEMENT]  update method statement complete'),

    ADD_METHOD_STATEMENT: type('[METHODSTATEMENT]  add method statement'),
    ADD_METHOD_STATEMENT_COMPLETE: type('[METHODSTATEMENT]  add method statement complete'),

    UPDATE_MSPPE: type('[METHODSTATEMENT]  update method statement PPE'),
    UPDATE_MSPPE_COMPLETE: type('[METHODSTATEMENT]  update method statement PPE complete'),
    LOAD_RESPONSIBILITY_BY_ID: type('[METHODSTATEMENT] Method statement - load safty responsibility by id'),
    LOAD_RESPONSIBILITY_BY_ID_COMPLETE: type('[METHODSTATEMENT] Method statement - load safty responsibility by id complete'),
    DELETE_MSRESPONSIBILITY: type('[METHODSTATEMENT]  delete method statement  responsibility'),
    DELETE_MSRESPONSIBILITY_COMPLETE: type('[METHODSTATEMENT]  detete method statement responsibility complete'),
    ADD_MSRESPONSIBILITY: type('[METHODSTATEMENT]  add method statement responsibility'),
    ADD_MSRESPONSIBILITY_COMPLETE: type('[METHODSTATEMENT]  add method statement responsibility complete'),
    UPDATE_MSRESPONSIBILITY: type('[METHODSTATEMENT]  update method statement responsibility'),
    UPDATE_MSRESPONSIBILITY_COMPLETE: type('[METHODSTATEMENT]  update method statement responsibility complete'),
    ADD_MS_PROCEDURE: type('[METHODSTATEMENT]  Add method statement  procedures'),
    ADD_MS_PROCEDURE_COMPLETE: type('[METHODSTATEMENT]  Add method statement procedures complete'),
    UPDATE_MS_PROCEDURE: type('[METHODSTATEMENT]  Update method statement  procedures'),
    UPDATE_MS_PROCEDURE_COMPLETE: type('[METHODSTATEMENT]  Update method statement procedures complete'),
    DELETE_MS_PROCEDURE: type('[METHODSTATEMENT]  delete method statement  procedure'),
    DELETE_MS_PROCEDURE_COMPLETE: type('[METHODSTATEMENT]  detete method statement procedure complete'),
    LOAD_PROCEDURE_FOR_MS: type('[METHODSTATEMENT]  load procedures for method statements'),
    LOAD_PROCEDURE_FOR_MS_COMPLETE: type('[METHODSTATEMENT]  load procedures for method statements complete'),
    ADD_PROCEDURE_FOR_MS: type('[METHODSTATEMENT]  add procedure for method statements'),
    CLEAR_MS_PROCEDURE_SAVE_STATUS: type('[METHODSTATEMENT]  clear method statement procedure save status'),
    LOAD_MSRESPONSIBILITIES_PAGING: type('[METHODSTATEMENT]  load methodstatement responsibilities paging'),
    LOAD_SUPPORTING_DOCUMENTS_BY_ID: type('[METHODSTATEMENT] Method statement - load supporting documents by id'),
    LOAD_SUPPORTING_DOCUMENTS_BY_ID_COMPLETE: type('[METHODSTATEMENT] Method statement - load supporting documents by id complete'),
    UPDATE_METHOD_STATEMENT_STATUS: type('[METHODSTATEMENT] Method statement - update status'),
    UPDATE_METHOD_STATEMENT_STATUS_COMPLETE: type('[METHODSTATEMENT] Method statement -update status complete'),
    GET_METHOD_STATEMENT_ATTACHMENTS: type('[METHODSTATEMENT] Method statement - get attachments'),
    GET_METHOD_STATEMENT_ATTACHMENTS_COMPLETE: type('[METHODSTATEMENT] Method statement -get attachments complete'),
    SAVE_METHOD_STATEMENT_TO_ATLAS: type('[METHODSTATEMENT] Method statement - save to atlas'),
    SAVE_METHOD_STATEMENT_TO_ATLAS_COMPLETE: type('[METHODSTATEMENT] Method statement -save to atlas complete'),
    CLEAR_METHOD_STATEMENT_DOC_ID: type('[METHODSTATEMENT] Method statement - clear document Id'),
    UPDATE_MS_PROCEDURE_ORDER: type('[METHODSTATEMENT] Method statement change ms procedure order'),
    UPDATE_MS_PROCEDURE_ORDER_COMPLETE: type('[METHODSTATEMENT] Method statement change ms procedure order completed'),
    MS_RESPONSIBILITY_LIST_COMPLETE: type('[METHODSTATEMENT] Method statement responsibilities list complete'),
    LOAD_MSRISKASSESSMENTS_PAGING: type('[METHODSTATEMENT]  load methodstatement riskassessments paging'),
    DELETE_MSOTHER_RISKASSESSMENT: type('[METHODSTATEMENT]  delete method statement  other risk assessment'),
    DELETE_MSOTHER_RISKASSESSMENT_COMPLETE: type('[METHODSTATEMENT]  detete method statement  other risk assessment complete'),
    ADD_MSOTHER_RISKASSESSMENT: type('[METHODSTATEMENT]  add method statement other riskassessment'),
    ADD_MSOTHER_RISKASSESSMENT_COMPLETE: type('[METHODSTATEMENT]  add method statement  other riskassessment complete'),
    MS_RESPONSIBILITY_REMOVELIST_COMPLETE: type('[METHODSTATEMENT] delete method statements list complete'),

    ADD_METHOD_STATEMENT_ATTACHMENT: type('[METHODSTATEMENT]  add method statement - attachment'),
    ADD_METHOD_STATEMENT_ATTACHMENT_COMPLETE: type('[METHODSTATEMENT]  add method statement - attachment complete'),
    DELETE_METHOD_STATEMENT_ATTACHMENT: type('[METHODSTATEMENT]  delete method statement - attachment'),
    DELETE_METHOD_STATEMENT_ATTACHMENT_COMPLETE: type('[METHODSTATEMENT]  delete method statement - attachment complete'),

    CLEAR_METHOD_STATEMENT: type('[METHODSTATEMENT] clear method statement state info'),
    CLEAR_ADD_PROCEDURES_SLIDE_STATE: type('[METHODSTATEMENT] clear method statement add procedures state info'),
};

export class AddMSOtherRAAction implements Action {
    type = ActionTypes.ADD_MSOTHER_RISKASSESSMENT;
    constructor(public payload: MSOtherRiskAssessments[]) {

    }
}
export class AddMSOtherRACompleteAction implements Action {
    type = ActionTypes.ADD_MSOTHER_RISKASSESSMENT_COMPLETE;
    constructor(public payload: MSOtherRiskAssessments[]) {

    }
}

export class DeleteMSOtherRiskAssessmentAction implements Action {
    type = ActionTypes.DELETE_MSOTHER_RISKASSESSMENT;
    constructor(public payload: { Id: string }) {

    }
}

export class DeleteMSOtherRiskAssessmentCompleteAction implements Action {
    type = ActionTypes.DELETE_MSOTHER_RISKASSESSMENT_COMPLETE;
    constructor(public payload: string) {

    }
}

export class LoadMSRiskAssessmentsPagingSortingAction implements Action {
    type = ActionTypes.LOAD_MSRISKASSESSMENTS_PAGING;
    constructor(public payload: AtlasApiRequest) {

    }
}

export class LoadMSResponsibilitiesPagingSortingAction implements Action {
    type = ActionTypes.LOAD_MSRESPONSIBILITIES_PAGING;
    constructor(public payload: AtlasApiRequest) {

    }
}

export class LoadMethodStatementByIdAction implements Action {
    type = ActionTypes.LOAD_METHOD_STATEMENT_BY_ID;
    constructor(public payload: { Id: string, IsExample: boolean }) {

    }
}
export class LoadMethodStatementByIdCompleteAction implements Action {
    type = ActionTypes.LOAD_METHOD_STATEMENT_BY_ID_COMPLETE;
    constructor(public payload: MethodStatement) {

    }
}

export class AddMethodStatementAction implements Action {
    type = ActionTypes.ADD_METHOD_STATEMENT;
    constructor(public payload: MethodStatement) {

    }
}

export class AddMethodStatementCompleteAction implements Action {
    type = ActionTypes.ADD_METHOD_STATEMENT_COMPLETE;
    constructor(public payload: MethodStatement) {

    }
}

export class UpdateMethodStatementAction implements Action {
    type = ActionTypes.UPDATE_METHOD_STATEMENT;
    constructor(public payload: { MethodStatement: MethodStatement, portionUpdating: string }) {

    }
}
export class UpdateMethodStatementCompleteAction implements Action {
    type = ActionTypes.UPDATE_METHOD_STATEMENT_COMPLETE;
    constructor(public payload: MethodStatement) {

    }
}

export class UpdateMSPPEAction implements Action {
    type = ActionTypes.UPDATE_MSPPE;
    constructor(public payload: any) {

    }
}
export class UpdateMSPPECompleteAction implements Action {
    type = ActionTypes.UPDATE_MSPPE_COMPLETE;
    constructor(public payload: MSPPE[]) {

    }
}

export class LoadMSSaftyResponsibilityByIdAction implements Action {
    type = ActionTypes.LOAD_RESPONSIBILITY_BY_ID;
    constructor(public payload: { Id: string }) {

    }
}
export class LoadMSSaftyResponsibilityByIdCompleteAction implements Action {
    type = ActionTypes.LOAD_RESPONSIBILITY_BY_ID_COMPLETE;
    constructor(public payload: MSSafetyRespAssigned) {

    }
}


export class DeleteMSSaftyResponsibilityAction implements Action {
    type = ActionTypes.DELETE_MSRESPONSIBILITY;
    constructor(public payload: { Id: string }) {

    }
}
export class DeleteMSSaftyResponsibilityCompleteAction implements Action {
    type = ActionTypes.DELETE_MSRESPONSIBILITY_COMPLETE;
    constructor(public payload: string) {

    }
}


export class AddMSResponsibilityAction implements Action {
    type = ActionTypes.ADD_MSRESPONSIBILITY;
    constructor(public payload: MSSafetyRespAssigned) {

    }
}
export class AddMSResponsibilityCompleteAction implements Action {
    type = ActionTypes.ADD_MSRESPONSIBILITY_COMPLETE;
    constructor(public payload: MSSafetyRespAssigned) {

    }
}


export class UpdateMSResponsibilityAction implements Action {
    type = ActionTypes.UPDATE_MSRESPONSIBILITY;
    constructor(public payload: MSSafetyRespAssigned) {

    }
}
export class UpdateMSResponsibilityCompleteAction implements Action {
    type = ActionTypes.UPDATE_MSRESPONSIBILITY_COMPLETE;
    constructor(public payload: MSSafetyRespAssigned) {

    }
}

export class AddMSProcedureAction implements Action {
    type = ActionTypes.ADD_MS_PROCEDURE;
    constructor(public payload: Array<MSProcedure>) {

    }
}
export class AddMSProcedureCompleteAction implements Action {
    type = ActionTypes.ADD_MS_PROCEDURE_COMPLETE;
    constructor(public payload: MethodStatement) {

    }
}

export class UpdateMSProcedureAction implements Action {
    type = ActionTypes.UPDATE_MS_PROCEDURE;
    constructor(public payload: MSProcedure) {

    }
}
export class UpdateMSProcedureCompleteAction implements Action {
    type = ActionTypes.UPDATE_MS_PROCEDURE_COMPLETE;
    constructor(public payload: MSProcedure) {

    }
}

export class DeleteMSProcedureAction implements Action {
    type = ActionTypes.DELETE_MS_PROCEDURE;
    constructor(public payload: string) {

    }
}
export class DeleteMSProcedureCompleteAction implements Action {
    type = ActionTypes.DELETE_MS_PROCEDURE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class ClearMSProcedureSaveStatusAction implements Action {
    type = ActionTypes.CLEAR_MS_PROCEDURE_SAVE_STATUS;
    constructor(public payload: boolean) {

    }
}

export class LoadProceduresForMSAction implements Action {
    type = ActionTypes.LOAD_PROCEDURE_FOR_MS;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadProceduresForMSCompleteAction implements Action {
    type = ActionTypes.LOAD_PROCEDURE_FOR_MS_COMPLETE;
    constructor(public payload: AtlasApiResponse<Procedure>) {
    }
}

export class AddProcedureForMSAction implements Action {
    type = ActionTypes.ADD_PROCEDURE_FOR_MS;
    constructor(public payload: Procedure) {
    }
}
export class LoadSupportingDocumentsByIdAction implements Action {
    type = ActionTypes.LOAD_SUPPORTING_DOCUMENTS_BY_ID;
    constructor(public payload: { Id: string, IsExample: boolean }) {

    }
}
export class LoadSupportingDocumentsByIdCompleteAction implements Action {
    type = ActionTypes.LOAD_SUPPORTING_DOCUMENTS_BY_ID_COMPLETE;
    constructor(public payload: MSSupportingDocuments[]) {

    }
}


export class SaveMethodStatementPreviewAction implements Action {
    type = ActionTypes.SAVE_METHOD_STATEMENT_TO_ATLAS;
    constructor(public payload: any) {

    }
}
export class SaveMethodStatementPreviewCompleteAction implements Action {
    type = ActionTypes.SAVE_METHOD_STATEMENT_TO_ATLAS_COMPLETE;
    constructor(public payload: any) {

    }
}

export class ClearMethodStatementDocumentId implements Action {
    type = ActionTypes.CLEAR_METHOD_STATEMENT_DOC_ID;
    constructor(public payload: any) {

    }
}

export class GetMethodStatementAttachmentAction implements Action {
    type = ActionTypes.GET_METHOD_STATEMENT_ATTACHMENTS;
    constructor(public payload: { IsExample: boolean, Id: string }) {

    }
}
export class GetMethodStatementAttachmentCompleteAction implements Action {
    type = ActionTypes.GET_METHOD_STATEMENT_ATTACHMENTS_COMPLETE;
    constructor(public payload: string[]) {

    }
}

export class UpdateMethodStatementStatusAction implements Action {
    type = ActionTypes.UPDATE_METHOD_STATEMENT_STATUS;
    constructor(public payload: { IsExample: boolean, Data: any }) {

    }
}
export class UpdateMethodStatementStatusCompleteAction implements Action {
    type = ActionTypes.UPDATE_METHOD_STATEMENT_STATUS_COMPLETE;
    constructor(public payload: boolean) {
    }
};

export class UpdateMSProcedureOrderAction implements Action {
    type = ActionTypes.UPDATE_MS_PROCEDURE_ORDER;
    constructor(public payload: Array<MSProcedure>) {
    }
}
export class UpdateMSProcedureOrderCompleteAction implements Action {
    type = ActionTypes.UPDATE_MS_PROCEDURE_ORDER_COMPLETE;
    constructor(public payload: Array<MSProcedure>) {
    }
}
export class MSResponsibilityListCompleteAction implements Action {
    type = ActionTypes.MS_RESPONSIBILITY_LIST_COMPLETE;
    constructor(public payload: MSSafetyRespAssigned) {
    }
}
export class MSResponsibilityDeleteListAction implements Action {
    type = ActionTypes.MS_RESPONSIBILITY_REMOVELIST_COMPLETE;
    constructor(public payload: any) {
    }
}

export class AddMethodStatementAttachmentAction implements Action {
    type = ActionTypes.ADD_METHOD_STATEMENT_ATTACHMENT;
    constructor(public payload: Document[]) {

    }
}
export class AddMethodStatementAttachmentCompleteAction implements Action {
    type = ActionTypes.ADD_METHOD_STATEMENT_ATTACHMENT_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class DeleteMethodStatementAttachmentAction implements Action {
    type = ActionTypes.DELETE_METHOD_STATEMENT_ATTACHMENT;
    constructor(public payload: Document) {

    }
}
export class DeleteMethodStatementAttachmentCompleteAction implements Action {
    type = ActionTypes.DELETE_METHOD_STATEMENT_ATTACHMENT_COMPLETE;
    constructor(public payload: boolean) {

    }
};


/* Method Statement - clear state info. - Actions - Start */
export class ClearMethodStatementStateAction implements Action {
    type = ActionTypes.CLEAR_METHOD_STATEMENT;
    constructor(public payload: string) {

    }
};
/* Method Statement - clear state info. - Actions - End */

export class ClearAddProceduresSlideState implements Action {
    type = ActionTypes.CLEAR_ADD_PROCEDURES_SLIDE_STATE;
    constructor(public payload: boolean) {

    }
};

export type Actions = LoadMethodStatementByIdAction
    | LoadMethodStatementByIdCompleteAction
    | UpdateMethodStatementAction
    | UpdateMethodStatementCompleteAction
    | AddMethodStatementAction
    | AddMethodStatementCompleteAction
    | UpdateMSPPEAction
    | UpdateMSPPECompleteAction
    | LoadMSSaftyResponsibilityByIdAction
    | LoadMSSaftyResponsibilityByIdCompleteAction
    | DeleteMSSaftyResponsibilityAction
    | DeleteMSSaftyResponsibilityCompleteAction
    | AddMSResponsibilityAction
    | AddMSResponsibilityCompleteAction
    | UpdateMSResponsibilityAction
    | UpdateMSResponsibilityCompleteAction
    | UpdateMSProcedureAction | UpdateMSProcedureCompleteAction
    | DeleteMSProcedureAction | DeleteMSProcedureCompleteAction
    | AddMSProcedureAction | AddMSProcedureCompleteAction
    | ClearMSProcedureSaveStatusAction
    | LoadProceduresForMSAction | LoadProceduresForMSCompleteAction
    | LoadMSResponsibilitiesPagingSortingAction | AddProcedureForMSAction
    | UpdateMSProcedureOrderAction | UpdateMSProcedureOrderCompleteAction
    | MSResponsibilityListCompleteAction
    | DeleteMSOtherRiskAssessmentAction
    | DeleteMSOtherRiskAssessmentCompleteAction
    | AddMSOtherRAAction
    | AddMSOtherRACompleteAction
    | AddMethodStatementAttachmentAction
    | AddMethodStatementAttachmentCompleteAction
    | DeleteMethodStatementAttachmentAction
    | DeleteMethodStatementAttachmentCompleteAction
    | ClearAddProceduresSlideState
    | ClearMethodStatementStateAction;

