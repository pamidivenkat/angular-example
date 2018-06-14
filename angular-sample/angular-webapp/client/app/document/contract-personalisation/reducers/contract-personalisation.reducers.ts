import { Block } from '../../models/block';
import { PersonalisedEmployeesInfo } from '../../models/personalised-employees-info';
import { extractDataTableOptions } from '../../../shared/helpers/extract-helpers';
import { isNullOrUndefined } from 'util';
import { Action } from '@ngrx/store';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import * as employeeContractPersonalisationActions from '../actions/contract-personalisation.actions';
import { Observable } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { AtlasApiResponse, AtlasApiRequestWithParams, AtlasParams, AtlasApiRequest } from '../../../shared/models/atlas-api-response';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { AeSelectItem } from "../../../atlas-elements/common/models/ae-select-item";
import { ContractDetails, EmployeeContractDetails } from "../../models/contract-details.model";
import { DateTimeHelper } from '../../../shared/helpers/datetime-helper';
import { CommonHelpers } from "../../../shared/helpers/common-helpers";
import { Artifact } from "../../models/artifact";

export interface EmployeeContractPersonalisationState {
    IsContractDetailsLoading: boolean;
    ContractDetails: Artifact;
    ContractEmployeesList: EmployeeContractDetails[];
    ContractEmployeesPagingInfo: PagingInfo;
    ContractEmployees: EmployeeContractDetails[];
    HasDocumentPersonalised: boolean;
    PersonalisedEmployeesInfoList: PersonalisedEmployeesInfo[];
    PersonalisedEmployees: PersonalisedEmployeesInfo[];
    SelectedEmployeesToDistribute: string[];
    PersonalisedDocument: Artifact;
    PersonalisedEmployeesPagingInfo: PagingInfo;
    hasFileIdentifier: boolean;
    ContractEmployeesApiRequest: AtlasApiRequestWithParams;
    PersonalisedEmployeesApiRequest: AtlasApiRequestWithParams;
}

const initialState: EmployeeContractPersonalisationState = {
    IsContractDetailsLoading: false,
    ContractDetails: null,
    ContractEmployeesList: null,
    ContractEmployeesPagingInfo: null,
    ContractEmployees: null,
    HasDocumentPersonalised: false,
    PersonalisedEmployees: null,
    PersonalisedEmployeesInfoList: null,
    PersonalisedEmployeesPagingInfo: null,
    PersonalisedDocument: null,
    SelectedEmployeesToDistribute: null,
    hasFileIdentifier: true,
    ContractEmployeesApiRequest: null,
    PersonalisedEmployeesApiRequest: null
}

export function reducer(state = initialState, action: Action): EmployeeContractPersonalisationState {
    switch (action.type) {
        case employeeContractPersonalisationActions.ActionTypes.EMPLOYEE_CONTRACT_PERSONALISATION_LOAD:
            {
                return Object.assign({}, state, { IsContractDetailsLoading: true, PersonalisedDocument: null, ContractDetails: null, hasFileIdentifier: true });
            }
        case employeeContractPersonalisationActions.ActionTypes.EMPLOYEE_CONTRACT_PERSONALISATION_LOAD_COMPLETE: {
            return Object.assign({}, state, { IsContractDetailsLoading: false, ContractDetails: action.payload.ContractDetails, ContractEmployees: action.payload.EmployeesContractDetails });
        }
        case employeeContractPersonalisationActions.ActionTypes.LOAD_CONTRACT_EMPLOYEES_LIST_DATA: {
            let request = <AtlasApiRequest>action.payload;
            let modifiedState: EmployeeContractPersonalisationState = Object.assign({}, state);
            let absenceTypeAfterFilter = modifiedState.ContractEmployees;
            let totalCount = modifiedState.ContractEmployees.length;
            absenceTypeAfterFilter = CommonHelpers.sortArray(modifiedState.ContractEmployees, request.SortBy.SortField, request.SortBy.Direction);
            let startPage = (request.PageNumber * request.PageSize) - request.PageSize;
            let endPage = (request.PageNumber * request.PageSize);
            let slicedAbsenceType = absenceTypeAfterFilter.slice(startPage, endPage);
            modifiedState.ContractEmployeesList = slicedAbsenceType;
            modifiedState.ContractEmployeesPagingInfo = new PagingInfo(request.PageSize, totalCount, request.PageNumber, request.PageSize);
            modifiedState.ContractEmployeesApiRequest = action.payload;
            return modifiedState;
        }
        case employeeContractPersonalisationActions.ActionTypes.PERSONALISE_DOCUMENT: {
            let modifiedState = Object.assign({}, state, {});
            modifiedState.HasDocumentPersonalised = false;
            return modifiedState;
        }
        case employeeContractPersonalisationActions.ActionTypes.PERSONALISE_DOCUMENT_COMPLETE: {

            return Object.assign({}, state, { HasDocumentPersonalised: action.payload });

        }
        case employeeContractPersonalisationActions.ActionTypes.LOAD_PERSONALDOCUMENTS_SOURCEDOCUMENT: {
            let modifiedState: EmployeeContractPersonalisationState = Object.assign({}, state);
            modifiedState.PersonalisedEmployees = [];
            modifiedState.PersonalisedEmployeesInfoList = [];
            modifiedState.PersonalisedEmployeesPagingInfo = new PagingInfo(10, modifiedState.PersonalisedEmployeesInfoList.length, 1, 10);
            return modifiedState;
        }
        case employeeContractPersonalisationActions.ActionTypes.LOAD_PERSONALDOCUMENTS_SOURCEDOCUMENT_COMPLETE: {
            let modifiedState: EmployeeContractPersonalisationState = Object.assign({}, state);           
            modifiedState.PersonalisedEmployees = action.payload; 
            let request = modifiedState.PersonalisedEmployeesPagingInfo;
            let personalisedEmployeesList = modifiedState.PersonalisedEmployees;           
            personalisedEmployeesList = CommonHelpers.sortArray(modifiedState.PersonalisedEmployees,'EmployeeName', 1);
            let startPage = (request.PageNumber * request.PageSize) - request.PageSize;
            let endPage = (request.PageNumber * request.PageSize);
            let slicedPersonalisedDocuments = personalisedEmployeesList.slice(startPage, endPage);
            modifiedState.PersonalisedEmployeesInfoList = slicedPersonalisedDocuments;
            modifiedState.PersonalisedEmployeesPagingInfo = new PagingInfo(request.PageSize, personalisedEmployeesList.length, 1, 10);
            return modifiedState;
        }
        case employeeContractPersonalisationActions.ActionTypes.LOAD_PERSONALDOCUMENTS_SOURCEDOCUMENT_LIST: {
            let request = <AtlasApiRequest>action.payload;
            let modifiedState: EmployeeContractPersonalisationState = Object.assign({}, state);
            let personalisedEmployeesList = modifiedState.PersonalisedEmployees;
            let totalCount = modifiedState.PersonalisedEmployees.length;
            personalisedEmployeesList = CommonHelpers.sortArray(modifiedState.PersonalisedEmployees, request.SortBy.SortField, request.SortBy.Direction);
            let startPage = (request.PageNumber * request.PageSize) - request.PageSize;
            let endPage = (request.PageNumber * request.PageSize);
            let slicedPersonalisedDocuments = personalisedEmployeesList.slice(startPage, endPage);
            modifiedState.PersonalisedEmployeesInfoList = slicedPersonalisedDocuments;
            modifiedState.PersonalisedEmployeesApiRequest = action.payload;
            modifiedState.PersonalisedEmployeesPagingInfo = new PagingInfo(request.PageSize, totalCount, request.PageNumber, request.PageSize);
            return modifiedState;
        }
        case employeeContractPersonalisationActions.ActionTypes.UPDATE_DOCUMENT_BLOCK: {
            let modifiedState: EmployeeContractPersonalisationState = Object.assign({}, state);
            updateBlockDescription(modifiedState.PersonalisedDocument.Blocks, action.payload)
            return modifiedState;
        }
        case employeeContractPersonalisationActions.ActionTypes.UPDATE_PERSONALISED_DOCUMENT_COMPLETE: {
            let modifiedState: EmployeeContractPersonalisationState = Object.assign({}, state);
            return modifiedState;
        }
        case employeeContractPersonalisationActions.ActionTypes.LOAD_PERSONALISED_DOCUMENT_COMPLETE: {
            let modifiedState: EmployeeContractPersonalisationState = Object.assign({}, state);
            modifiedState.IsContractDetailsLoading = false;
            if (isNullOrUndefined(action.payload)) {
                modifiedState.hasFileIdentifier = false;
            } else {
                modifiedState.hasFileIdentifier = true;
                modifiedState.PersonalisedDocument = action.payload
            }
            return modifiedState;
        }
        case employeeContractPersonalisationActions.ActionTypes.SELECTED_EMPLOYESS_DISTRIBUTE: {
            let modifiedState: EmployeeContractPersonalisationState = Object.assign({}, state);
            modifiedState.SelectedEmployeesToDistribute = action.payload
            return modifiedState;
        }
        default:
            return state;
    }
}


function updateBlockDescription(blocks: Block[], currentBlock: Block) {
    blocks.forEach(block => {
        if (block.Id === currentBlock.Id) {
            block = currentBlock;
            return;
        }
        if (block.Blocks.length > 0) {
            updateBlockDescription(block.Blocks, currentBlock);
        }
    });
    return;
}

export function getContractDetails(state$: Observable<EmployeeContractPersonalisationState>): Observable<Artifact> {
    return state$.select(s => s.ContractDetails);
};

export function getPersonalisedContractDetails(state$: Observable<EmployeeContractPersonalisationState>): Observable<Artifact> {
    return state$.select(s => s.PersonalisedDocument);
};


export function getContractEmployees(state$: Observable<EmployeeContractPersonalisationState>): Observable<EmployeeContractDetails[]> {
    return state$.select(s => s.ContractEmployees);
};

export function getContractDetailsLoadedState(state$: Observable<EmployeeContractPersonalisationState>): Observable<boolean> {
    return state$.select(s => s.IsContractDetailsLoading);
};

export function hasDocumentPersonalisedState(state$: Observable<EmployeeContractPersonalisationState>): Observable<boolean> {
    return state$.select(s => s.HasDocumentPersonalised);
};

export function getPersonalisedEmployeeDocuments(state$: Observable<EmployeeContractPersonalisationState>): Observable<Immutable.List<PersonalisedEmployeesInfo>> {
    return state$.select(s => s.PersonalisedEmployeesInfoList && Immutable.List<PersonalisedEmployeesInfo>(s.PersonalisedEmployeesInfoList));
};

export function getPersonalisedEmployeeDocumentsTotalCount(state$: Observable<EmployeeContractPersonalisationState>): Observable<number> {
    return state$.select(state => state.PersonalisedEmployeesPagingInfo && state.PersonalisedEmployeesPagingInfo.TotalCount);
}

export function getPersonalisedEmployeeDocumentsDataTableOptions(state$: Observable<EmployeeContractPersonalisationState>): Observable<DataTableOptions> {
    return state$.select(s => s.PersonalisedEmployeesInfoList && s.PersonalisedEmployeesPagingInfo && s.PersonalisedEmployeesApiRequest && extractDataTableOptions(s.PersonalisedEmployeesPagingInfo, s.PersonalisedEmployeesApiRequest.SortBy));
}

/**Employees DataList Start**/
export function getContractEmployeesList(state$: Observable<EmployeeContractPersonalisationState>): Observable<Immutable.List<EmployeeContractDetails>> {
    return state$.select(s => s.ContractEmployeesList && Immutable.List<EmployeeContractDetails>(s.ContractEmployeesList));
};

export function getContractEmployeesListTotalCount(state$: Observable<EmployeeContractPersonalisationState>): Observable<number> {
    return state$.select(state => state.ContractEmployeesPagingInfo && state.ContractEmployeesPagingInfo.TotalCount);
}

export function getContractEmployeesListDataTableOptions(state$: Observable<EmployeeContractPersonalisationState>): Observable<DataTableOptions> {
    return state$.select(s => s.ContractEmployeesList && s.ContractEmployeesPagingInfo && s.ContractEmployeesApiRequest && extractDataTableOptions(s.ContractEmployeesPagingInfo, s.ContractEmployeesApiRequest.SortBy));
}
/**Employees DataList End**/

export function getSelectedEmployeesToDistribute(state$: Observable<EmployeeContractPersonalisationState>): Observable<string[]> {
    return state$.select(s => s.SelectedEmployeesToDistribute);
};

export function getHasFileIdentifier(state$: Observable<EmployeeContractPersonalisationState>): Observable<boolean> {
    return state$.select(s => s && s.hasFileIdentifier);
}
