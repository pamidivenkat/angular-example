import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../shared/models/atlas-api-response';
import { AeSortModel } from './../../atlas-elements/common/models/ae-sort-model';
import { DistributedDocument, ActionedDocument } from './../models/DistributedDocument';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';
import { Employee } from "../../employee/models/employee.model";
import { AeSelectItem } from "./../../atlas-elements/common/models/ae-select-item";

export const ActionTypes = {
    LOAD_COMPANY_DOCUMENTS_TO_REVIEW: type('[Document] Load company Documents to review'),
    LOAD_COMPANY_DOCUMENTS_TO_REVIEW_COMPLETE: type('[Document] Load company documents to review complete'),
    LOAD_COMPANY_USEFULDOCUMENTS_TO_REVIEW: type('[Document] Load company useful documents to review'),
    LOAD_COMPANY_USEFULDOCUMENTS_TO_REVIEW_COMPLETE: type('[Document] Load company useful documents to review complete'),
    COMPANY_DOCUMENTS_TO_REVIEW_ACTION_CONFIRM: type('[Document] Company documents to review action confirm'),
    COMPANY_DOCUMENTS_TO_REVIEW_ACTION_CONFIRM_COMPLETE: type('[Document] Company documents to review action confirm complete'),
    COMPANY_USEFULDOCUMENTS_TO_REVIEW_ACTION_CONFIRM: type('[Document] company useful documents to review'),
    COMPANY_USEFULDOCUMENTS_TO_REVIEW_ACTION_CONFIRM_COMPLETE: type('[Document] company useful documents to review complete'),
    SEARCH_EMPLOYEES: type('[Document] Load Employee Documents to review Distribute'),
    SEARCH_EMPLOYEES_COMPLETE: type('[Document] Load Employee Documents to review Distribute Complete'),
}

export class LoadCompanyDocumentsToReview implements Action {
    type = ActionTypes.LOAD_COMPANY_DOCUMENTS_TO_REVIEW;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadCompanyDocumentsToReviewComplete implements Action {
    type = ActionTypes.LOAD_COMPANY_DOCUMENTS_TO_REVIEW_COMPLETE;
    constructor(public payload: AtlasApiResponse<DistributedDocument>) {
    }
}




export class LoadCompanyUsefulDocumentsToReview implements Action {
    type = ActionTypes.LOAD_COMPANY_USEFULDOCUMENTS_TO_REVIEW;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadCompanyUsefulDocumentsToReviewComplete implements Action {
    type = ActionTypes.LOAD_COMPANY_USEFULDOCUMENTS_TO_REVIEW_COMPLETE;
    constructor(public payload: AtlasApiResponse<DistributedDocument>) {
    }
}




export class CompanyDocumentsToReviewConfirmAction implements Action {
    type = ActionTypes.COMPANY_DOCUMENTS_TO_REVIEW_ACTION_CONFIRM;
    constructor(public payload: ActionedDocument) {
    }
}


export class CompanyDocumentsToReviewConfirmActionComplete implements Action {
    type = ActionTypes.COMPANY_DOCUMENTS_TO_REVIEW_ACTION_CONFIRM_COMPLETE;
    constructor(public payload: ActionedDocument) {
    }
}

export class CompanyUsefulDocumentsToReviewConfirmAction implements Action {
    type = ActionTypes.COMPANY_USEFULDOCUMENTS_TO_REVIEW_ACTION_CONFIRM;
    constructor(public payload: ActionedDocument) {
    }
}

export class CompanyUsefulDocumentsToReviewConfirmActionComplete implements Action {
    type = ActionTypes.COMPANY_USEFULDOCUMENTS_TO_REVIEW_ACTION_CONFIRM_COMPLETE;
    constructor(public payload: ActionedDocument) {
    }
}

export class SearchEmployees implements Action {
    type = ActionTypes.SEARCH_EMPLOYEES;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}
export class SearchEmployeesComplete implements Action {
    type = ActionTypes.SEARCH_EMPLOYEES_COMPLETE;
    constructor(public payload: Array<AeSelectItem<string>>) {
    }
}
export type Actions = LoadCompanyDocumentsToReview
    | LoadCompanyDocumentsToReviewComplete
    | LoadCompanyUsefulDocumentsToReview
    | LoadCompanyUsefulDocumentsToReviewComplete
    | CompanyDocumentsToReviewConfirmAction
    | CompanyUsefulDocumentsToReviewConfirmAction
    | CompanyDocumentsToReviewConfirmActionComplete
    | CompanyUsefulDocumentsToReviewConfirmActionComplete
    | SearchEmployees
    | SearchEmployeesComplete




