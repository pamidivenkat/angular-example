import { Block } from '../../models/block';
import { DistributeModel } from '../../document-details/models/document-details-model';
import { PersonalisedEmployeesInfo } from '../../models/personalised-employees-info';
import { AtlasApiResponse, AtlasApiRequestWithParams, AtlasApiRequest } from '../../../shared/models/atlas-api-response';
import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';
import { AeSortModel } from "../../../atlas-elements/common/models/ae-sort-model";
import { ContractDetails } from "../../../document/models/contract-details.model";
import { Artifact } from "../../models/artifact";
//import { Employee } from '../../models/employee.model';

export const ActionTypes = {
    EMPLOYEE_CONTRACT_PERSONALISATION_LOAD: type('[EMPLOYEECONTRACTPERSONALISATION] load employee contract personalisation'),
    EMPLOYEE_CONTRACT_PERSONALISATION_LOAD_COMPLETE: type('[EMPLOYEECONTRACTPERSONALISATION] load employee contract personalisation complete'),
    LOAD_CONTRACT_EMPLOYEES_LIST_DATA: type('[EMPLOYEECONTRACTPERSONALISATION] load contract employees list'),
    PERSONALISE_DOCUMENT: type('[EMPLOYEECONTRACTPERSONALISATION] personalise selected employees'),
    PERSONALISE_DOCUMENT_COMPLETE: type('[EMPLOYEECONTRACTPERSONALISATION] personalise selected employees complete'),
    LOAD_PERSONALDOCUMENTS_SOURCEDOCUMENT: type('[EMPLOYEECONTRACTPERSONALISATION] load personalised documents by source id'),
    LOAD_PERSONALDOCUMENTS_SOURCEDOCUMENT_LIST: type('[EMPLOYEECONTRACTPERSONALISATION] personalised documents list'),
    LOAD_PERSONALDOCUMENTS_SOURCEDOCUMENT_COMPLETE: type('[EMPLOYEECONTRACTPERSONALISATION] load personalised documents by source complete'),
    DOCUMENT_BULK_DISTRIBUTE_ACTION: type('[EMPLOYEECONTRACTPERSONALISATION] personalised employees distribution'),
    DOCUMENT_BULK_DISTRIBUTE_ACTION_COMPLETE: type('[EMPLOYEECONTRACTPERSONALISATION] personalised employees distribution complete'),
    UPDATE_DOCUMENT_BLOCK: type('[EMPLOYEECONTRACTPERSONALISATION] update document block'),
    LOAD_PERSONALISED_DOCUMENT_COMPLETE: type('[EMPLOYEECONTRACTPERSONALISATION] load personalised document complete'),
    UPDATE_PERSONALISED_DOCUMENT: type('[EMPLOYEECONTRACTPERSONALISATION] update personlised document'),
    UPDATE_PERSONALISED_DOCUMENT_COMPLETE: type('[EMPLOYEECONTRACTPERSONALISATION] update personlised document complete'),
    SELECTED_EMPLOYESS_DISTRIBUTE: type('[EMPLOYEECONTRACTPERSONALISATION] selected employees to distribute')
}

export class EmployeeContractPersonalisationLoad implements Action {
    type = ActionTypes.EMPLOYEE_CONTRACT_PERSONALISATION_LOAD;
    constructor(public payload: any) {
    }
}

export class EmployeeContractPersonalisationLoadComplete implements Action {
    type = ActionTypes.EMPLOYEE_CONTRACT_PERSONALISATION_LOAD_COMPLETE;
    constructor(public payload: any) {
    }
}

export class LoadContractEmployeesListData implements Action {
    type = ActionTypes.LOAD_CONTRACT_EMPLOYEES_LIST_DATA;
    constructor(public payload: AtlasApiRequest) {
    }
}

export class PersonliseDocumentAction implements Action {
    type = ActionTypes.PERSONALISE_DOCUMENT;
    constructor(public payload: Artifact) {
    }
}

export class PersonaliseDocumentCompleteAction implements Action {
    type = ActionTypes.PERSONALISE_DOCUMENT_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class LoadPersonalisedDocumentsBySource implements Action {
    type = ActionTypes.LOAD_PERSONALDOCUMENTS_SOURCEDOCUMENT;
    constructor(public payload: any) {
    }
}

export class LoadPersonalisedDocumentsBySourceComplete implements Action {
    type = ActionTypes.LOAD_PERSONALDOCUMENTS_SOURCEDOCUMENT_COMPLETE;
    constructor(public payload: PersonalisedEmployeesInfo[]) {
    }
}

export class PersonalisedEmployeesListData implements Action {
    type = ActionTypes.LOAD_PERSONALDOCUMENTS_SOURCEDOCUMENT_LIST;
    constructor(public payload: AtlasApiRequest) {

    }
}

export class DocumentBulkDistributionAction implements Action {
    type = ActionTypes.DOCUMENT_BULK_DISTRIBUTE_ACTION;
    constructor(public payload: DistributeModel) {

    }
}

export class DocumentBulkDistributionCompleteAction implements Action {
    type = ActionTypes.DOCUMENT_BULK_DISTRIBUTE_ACTION_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class UpdateDocumentBlock implements Action {
    type = ActionTypes.UPDATE_DOCUMENT_BLOCK;
    constructor(public payload: Block) {

    }
}

export class LoadPersonalisedDocumentComplete implements Action {
    type = ActionTypes.LOAD_PERSONALISED_DOCUMENT_COMPLETE;
    constructor(public payload: Artifact) {

    }
}

export class UpdatePersonalisedDocument implements Action {
    type = ActionTypes.UPDATE_PERSONALISED_DOCUMENT;
    constructor(public payload: Artifact) {

    }
}

export class UpdatePersonalisedDocumentComplete implements Action {
    type = ActionTypes.UPDATE_PERSONALISED_DOCUMENT_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class SelectedEmployeesToDistribute implements Action {
    type = ActionTypes.SELECTED_EMPLOYESS_DISTRIBUTE;
    constructor(public payload: string[]) {

    }
}