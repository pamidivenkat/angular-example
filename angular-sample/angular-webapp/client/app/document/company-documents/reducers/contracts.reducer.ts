import { EmployeeGroup } from './../../../shared/models/company.models';
import { Document } from './../../models/document';
import { isNullOrUndefined } from 'util';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as contractsActions from '../actions/contracts.actions';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { extractDataTableOptions } from './../../../shared/helpers/extract-helpers';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import * as Immutable from 'immutable';


export interface ContractsState {
    HasContractsListLoaded: boolean;
    HasPersonalContractsListLoaded: boolean;
    ContractsList: Document[];
    PersonalContractsList: Document[];
    ContractsPagingInfo: PagingInfo;
    PersonalContractsPagingInfo: PagingInfo;
    ContractsTemplateCount: number;
    PersonalcontractsCount: number;
    apiRequestWithParams: AtlasApiRequestWithParams;
    SelectedSystemVersionContract: string;
    AssociatedUserVersionContract: Document;
}

const initialState: ContractsState = {
    HasContractsListLoaded: false,
    HasPersonalContractsListLoaded: false,
    ContractsList: null,
    PersonalContractsList: null,
    ContractsPagingInfo: null,
    PersonalContractsPagingInfo: null,
    ContractsTemplateCount: 0,
    PersonalcontractsCount: 0,
    apiRequestWithParams: null,
    SelectedSystemVersionContract: null,
    AssociatedUserVersionContract: null
}

export function reducer(state = initialState, action: Action): ContractsState {
    switch (action.type) {
        case contractsActions.ActionTypes.LOAD_CONTRACTS_DOCS_LIST: {
            let modifiedState = Object.assign({}, state, { HasContractsListLoaded: false, apiRequestWithParams: action.payload, HasPersonalContractsListLoaded: false });
            return modifiedState;
        }

        case contractsActions.ActionTypes.LOAD_CONTRACTS_DOCS_LIST_COMPLETE: {
            let entities = <Document[]>action.payload.Entities;
            entities.forEach(gct => {
                if (isNullOrUndefined(gct.EmployeeGroup)) {
                    gct.EmployeeGroup = new EmployeeGroup();
                }
            });
            let modifiedState: ContractsState = Object.assign({}, state, { HasContractsListLoaded: true, ContractsList: entities });

            if (!isNullOrUndefined(state.ContractsPagingInfo)) {
                if (action.payload.PagingInfo.PageNumber == 1) {
                    modifiedState.ContractsPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                    if (modifiedState.apiRequestWithParams.Params.length === 0)
                        modifiedState.ContractsTemplateCount = action.payload.PagingInfo.TotalCount;
                }
                modifiedState.ContractsPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                modifiedState.ContractsPagingInfo.Count = action.payload.PagingInfo.Count;
            }
            else {
                modifiedState.ContractsPagingInfo = action.payload.PagingInfo;
            }
            return modifiedState;
        }

        case contractsActions.ActionTypes.LOAD_PERSONALISED_CONTRACTS_DOCS_LIST_COMPLETE: {
            let modifiedState: ContractsState = Object.assign({}, state, { HasContractsListLoaded: true, PersonalContractsList: action.payload.Entities });

            if (!isNullOrUndefined(state.PersonalContractsPagingInfo)) {
                if (action.payload.PagingInfo.PageNumber == 1) {
                    modifiedState.PersonalContractsPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                    if (modifiedState.apiRequestWithParams.Params.length === 0)
                        modifiedState.PersonalcontractsCount = action.payload.PagingInfo.TotalCount;
                }
                modifiedState.PersonalContractsPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                modifiedState.PersonalContractsPagingInfo.Count = action.payload.PagingInfo.Count;
            }
            else {
                modifiedState.PersonalContractsPagingInfo = action.payload.PagingInfo;
            }
            return modifiedState;
        }

        case contractsActions.ActionTypes.UPDATE_PERSONALISED_CONTRACT_ITEM: {
            let modifiedState = Object.assign({}, state, {});
            let id = action.payload;
            let contractsList = modifiedState.PersonalContractsList;
            if (!isNullOrUndefined(contractsList)) {
                contractsList.forEach(modifiedItem => {
                    if (modifiedItem.SourceDocumentId == id) {
                        modifiedItem.State = 1;
                    }
                });
            }
            return Object.assign({}, state, { PersonalContractsList: contractsList });
        }

        case contractsActions.ActionTypes.LOAD_CONTRACT_DOCS_COUNT: {
            let modifiedState = Object.assign({}, state, { ContractsTemplateCount: 0 });
            return modifiedState;
        }
        case contractsActions.ActionTypes.LOAD_CONTRACT_DOCS_COUNT_COMPLETE: {
            let modifiedState: ContractsState = Object.assign({}, state, { ContractsTemplateCount: action.payload.PagingInfo.TotalCount });
            return modifiedState;
        }

        case contractsActions.ActionTypes.LOAD_PERSONAL_CONTRACT_DOCS_COUNT: {
            let modifiedState = Object.assign({}, state, { PersonalcontractsCount: 0 });
            return modifiedState;
        }
        case contractsActions.ActionTypes.LOAD_PERSONAL_CONTRACT_DOCS_COUNT_COMPLETE: {
            let modifiedState: ContractsState = Object.assign({}, state, { PersonalcontractsCount: action.payload.PagingInfo.TotalCount });
            return modifiedState;
        }
        case contractsActions.ActionTypes.CONTRACTS_DATA_CLEAR: {
            let modifiedState: ContractsState = Object.assign({}, initialState);
            return modifiedState;
        }
        case contractsActions.ActionTypes.LOAD_ASSOCIATED_USER_VERSION_DOCUMENT: {
            let modifiedState: ContractsState = Object.assign({}, state, { SelectedSystemVersionContract: action.payload });
            return modifiedState;
        }
        case contractsActions.ActionTypes.LOAD_ASSOCIATED_USER_VERSION_DOCUMENT_COMPLETE: {
            let modifiedState: ContractsState = Object.assign({}, state, { AssociatedUserVersionContract: action.payload });
            return modifiedState;
        }
        case contractsActions.ActionTypes.CONTRACTS_CLEAR: {
            return Object.assign({}, initialState);
        }

        default:
            return state;
    }
}

/*** Contracts Start ***/
export function getAssociatedUserVersionContract(state$: Observable<ContractsState>): Observable<Document> {
    return state$.select(s => s.AssociatedUserVersionContract);
}

export function getContractsTemplateCount(state$: Observable<ContractsState>): Observable<number> {
    return state$.select(s => s.ContractsTemplateCount);
}

export function getPersonalContractsCount(state$: Observable<ContractsState>): Observable<number> {
    return state$.select(s => s.PersonalcontractsCount);
}

export function getContractsListLoadingState(state$: Observable<ContractsState>): Observable<boolean> {
    return state$.select(s => s.HasContractsListLoaded);
}

export function getPersonalContractsListLoadingState(state$: Observable<ContractsState>): Observable<boolean> {
    return state$.select(s => s.HasPersonalContractsListLoaded);
}

export function getPersonalContractsList(state$: Observable<ContractsState>): Observable<Immutable.List<Document>> {
    return state$.select(s => s.PersonalContractsList && Immutable.List<Document>(s.PersonalContractsList));
}

export function getContractsList(state$: Observable<ContractsState>): Observable<Immutable.List<Document>> {
    return state$.select(s => s.ContractsList && Immutable.List<Document>(s.ContractsList));
}

export function getContractsListTotalCount(state$: Observable<ContractsState>): Observable<number> {
    return state$.select(s => s && s.ContractsPagingInfo && s.ContractsPagingInfo.TotalCount);
}
export function getPersonalContractsListTotalCount(state$: Observable<ContractsState>): Observable<number> {
    return state$.select(s => s && s.PersonalContractsPagingInfo && s.PersonalContractsPagingInfo.TotalCount);
}

export function getContractsListDataTableOptions(state$: Observable<ContractsState>): Observable<DataTableOptions> {
    return state$.select(s => s.ContractsList && s.ContractsPagingInfo && s.apiRequestWithParams && extractDataTableOptions(s.ContractsPagingInfo, s.apiRequestWithParams.SortBy));
}

export function getPersonalContractsListDataTableOptions(state$: Observable<ContractsState>): Observable<DataTableOptions> {
    return state$.select(s => s.PersonalContractsList && s.PersonalContractsPagingInfo && s.apiRequestWithParams && extractDataTableOptions(s.PersonalContractsPagingInfo, s.apiRequestWithParams.SortBy));
}


/*** Contracts End ***/