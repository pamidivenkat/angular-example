import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';
import * as Immutable from 'immutable';
import { AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';
import { AeSelectItem } from "../../../atlas-elements/common/models/ae-select-item";
import { CQCStandards, CQCCategories } from "../../document-details/models/export-to-cqc-model";

export const ActionTypes = {
    LOAD_CQC_CATEGORIES_BY_SITEID: type('[CQCPRO] cqc categories'),
    LOAD_CQC_CATEGORIES_BY_SITEID_COMPLETE: type('[CQCPRO] cqc categories complete'),
    LOAD_CQC_STANDARDS_BY_SITEID: type('[CQCPRO] cqc standards'),
    LOAD_CQC_STANDARDS_BY_SITEID_COMPLETE: type('[CQCPRO] cqc standards complete'),
    CQC_POLICYCHECK_BY_SITEID: type('[CQCPRO] cql policy check'),
    CQC_POLICYCHECK_BY_SITEID_COMPLETE: type('[CQCPRO] cql policy check complete'),
    ADD_CQC_PRO_DETAILS: type('[CQCPRO] add cqc pro details'),
    ADD_CQC_PRO_DETAILS_COMPLETE: type('[CQCPRO] add cqc pro details complete'),
    LOAD_CQC_USERS_BY_SITEID: type('[CQCPRO] cqc users'),
    LOAD_CQC_USERS_BY_SITEID_COMPLETE: type('[CQCPRO] cqc users complete'),
    LOAD_CQC_FILETYPES_BY_SITEID: type('[CQCPRO] cqc file types'),
    LOAD_CQC_FILETYPES_BY_SITEID_COMPLETE: type('[CQCPRO] cqc file types complete')
}

export class LoadCQCCategoriesBySiteIdAction implements Action {
    type = ActionTypes.LOAD_CQC_CATEGORIES_BY_SITEID;
    constructor(public payload: string) {
    }
}

export class LoadCQCCategoriesBySiteIdCompleteAction implements Action {
    type = ActionTypes.LOAD_CQC_CATEGORIES_BY_SITEID_COMPLETE;
    constructor(public payload: CQCCategories[]) {
    }
}

export class LoadCQCStandardsBySiteIdAction implements Action {
    type = ActionTypes.LOAD_CQC_STANDARDS_BY_SITEID;
    constructor(public payload: string) {
    }
}

export class LoadCQCStandardsBySiteIdCompleteAction implements Action {
    type = ActionTypes.LOAD_CQC_STANDARDS_BY_SITEID_COMPLETE;
    constructor(public payload: CQCStandards[]) {
    }

}

export class CQCPolicyCheckBySiteIdAction implements Action {
    type = ActionTypes.CQC_POLICYCHECK_BY_SITEID;
    constructor(public payload: string) {
    }
}

export class CQCPolicyCheckBySiteIdCompleteAction implements Action {
    type = ActionTypes.CQC_POLICYCHECK_BY_SITEID_COMPLETE;
    constructor(public payload: any) {
    }
}

export class AddCQCProDetailsAction implements Action {
    type = ActionTypes.ADD_CQC_PRO_DETAILS;
    constructor(public payload: any) {
    }
}

export class AddCQCProDetailsCompleteAction implements Action {
    type = ActionTypes.ADD_CQC_PRO_DETAILS_COMPLETE;
    constructor(public payload: any) {
    }
}


export class LoadCQCUsersBySiteIdAction implements Action {
    type = ActionTypes.LOAD_CQC_USERS_BY_SITEID;
    constructor(public payload: string) {
    }
}

export class LoadCQCUsersBySiteIdCompleteAction implements Action {
    type = ActionTypes.LOAD_CQC_USERS_BY_SITEID_COMPLETE;
    constructor(public payload: Immutable.List<AeSelectItem<string>>) {
    }
}

export class LoadCQCFiletypesBySiteIdAction implements Action {
    type = ActionTypes.LOAD_CQC_FILETYPES_BY_SITEID;
    constructor(public payload: string) {
    }
}

export class LoadCQCFiletypesBySiteIdCompleteAction implements Action {
    type = ActionTypes.LOAD_CQC_FILETYPES_BY_SITEID_COMPLETE;
    constructor(public payload: Immutable.List<AeSelectItem<string>>) {
    }
}

export type Actions =
    LoadCQCCategoriesBySiteIdAction
    | LoadCQCCategoriesBySiteIdCompleteAction
    | CQCPolicyCheckBySiteIdAction
    | CQCPolicyCheckBySiteIdCompleteAction
    | LoadCQCStandardsBySiteIdAction
    | LoadCQCStandardsBySiteIdCompleteAction
    | LoadCQCUsersBySiteIdAction | LoadCQCUsersBySiteIdCompleteAction
    | LoadCQCFiletypesBySiteIdAction | LoadCQCFiletypesBySiteIdCompleteAction;

