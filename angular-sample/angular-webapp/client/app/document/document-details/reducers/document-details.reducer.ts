import { DistributeDocumentCompleteAction } from './../actions/document-distribute.actions';
import { StringHelper } from './../../../shared/helpers/string-helper';
import { isNullOrUndefined } from 'util';
import { getAtlasParamValueByKey } from '../../../root-module/common/extract-helpers';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as DocumentDetailActions from '../../../document/document-details/actions/document-details.actions';
import * as DocumentDistributeActions from '../../../document/document-details/actions/document-distribute.actions';
import * as DocumentExportToCQCActions from '../../../document/document-details/actions/document-export-to-cqc.actions';

import * as Immutable from 'immutable';
import { DocumentDetails, ChangeHistoryModel, DistributionHistoryModel, EmployeeActionStatusModel } from '../../../document/document-details/models/document-details-model';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { extractDataTableOptions } from '../../../shared/helpers/extract-helpers';
import { AeSortModel, SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequest, AtlasApiRequestWithParams } from "../../../shared/models/atlas-api-response";
import { CommonHelpers } from "../../../shared/helpers/common-helpers";
import { Site } from "../../../calendar/model/calendar-models";
import { AeSelectItem } from "../../../atlas-elements/common/models/ae-select-item";
import { CQCStandards, CQCCategories } from "../../document-details/models/export-to-cqc-model";
import { extractDocumentDetails } from "../../document-details/common/document-details-extract-helper";

export interface DocumentDetailsState {

    ChangeHistoryLoaded: boolean,
    DocumentChangeHistory: ChangeHistoryModel[],
    ChangeHistoryPagingInfo: PagingInfo,
    ChangeHistoryListTotalCount: number,

    DistributionHistoryLoaded: boolean,
    DocumentDistributionHistory: DistributionHistoryModel[],
    DistributionHistoryPagingInfo: PagingInfo,
    DistributionHistoryListTotalCount: number,
    DocumentDistributionHistoryList: DistributionHistoryModel[],
    CurrentDistributeDoc: DistributionHistoryModel,

    EmployeeStatusLoaded: boolean,
    DocumentEmployeeStatus: EmployeeActionStatusModel[],
    EmployeeStatusPagingInfo: PagingInfo,
    EmployeeStatusListTotalCount: number,
    EmployeeStatusSortingInfo: AeSortModel,
    DocumentEmployeeStatusPagedList: EmployeeActionStatusModel[],

    CurrentDocument: DocumentDetails,
    apiRequestWithParams: AtlasApiRequestWithParams,

    // export to cqc  
    CQCStandards: CQCStandards[];
    CQCCategories: CQCCategories[];
    CQCUsers: Immutable.List<AeSelectItem<string>>;
    CQCFileTypes: Immutable.List<AeSelectItem<string>>;
    DocumentDistributed: boolean;
}


const initialState: DocumentDetailsState = {
    ChangeHistoryLoaded: false,
    DocumentChangeHistory: null,
    ChangeHistoryPagingInfo: null,
    ChangeHistoryListTotalCount: null,

    DistributionHistoryLoaded: false,
    DocumentDistributionHistory: null,
    DocumentDistributionHistoryList: null,
    DistributionHistoryPagingInfo: null,
    DistributionHistoryListTotalCount: null,
    CurrentDistributeDoc: null,

    EmployeeStatusLoaded: false,
    DocumentEmployeeStatus: null,
    EmployeeStatusPagingInfo: null,
    EmployeeStatusListTotalCount: null,
    EmployeeStatusSortingInfo: null,
    DocumentEmployeeStatusPagedList: null,
    apiRequestWithParams: null,

    CurrentDocument: null,
    CQCStandards: null,
    CQCCategories: null,
    CQCUsers: null,
    CQCFileTypes: null,
    DocumentDistributed: false

}

export function reducer(state = initialState, action: Action): DocumentDetailsState {
    switch (action.type) {
        case DocumentDetailActions.ActionTypes.LOAD_DOCUMENT_DETAILS: {
            return Object.assign({}, state, { CurrentDocument: null });
        }
        case DocumentDetailActions.ActionTypes.LOAD_DOCUMENT_DETAILS_COMPLETE: {

            return Object.assign({}, state, { CurrentDocument: action.payload, ChangeHistoryLoaded: false, DistributionHistoryLoaded: false, EmployeeStatusLoaded: false });
        }
        case DocumentDetailActions.ActionTypes.LOAD_DOCUMENT_CHANGE_HISTORY: {
            return Object.assign({}, state, { ChangeHistoryLoaded: false });
        }
        case DocumentDetailActions.ActionTypes.LOAD_DOCUMENT_CHANGE_HISTORY_COMPLETE: {

            let modifiedState = Object.assign({}, state, { ChangeHistoryLoaded: true });

            if (!isNullOrUndefined(state.ChangeHistoryPagingInfo)) {
                if (action.payload.ChangeHistoryPagingInfo.PageNumber == 1) {
                    modifiedState.ChangeHistoryPagingInfo.TotalCount = action.payload.ChangeHistoryPagingInfo.TotalCount;
                }
                modifiedState.ChangeHistoryPagingInfo.PageNumber = action.payload.ChangeHistoryPagingInfo.PageNumber;
                modifiedState.ChangeHistoryPagingInfo.Count = action.payload.ChangeHistoryPagingInfo.Count;
            }
            else {
                modifiedState.ChangeHistoryPagingInfo = action.payload.ChangeHistoryPagingInfo;
            }
            modifiedState.DocumentChangeHistory = action.payload.DocumentChangeHistory;
            return modifiedState;
        }
        case DocumentDetailActions.ActionTypes.LOAD_DOCUMENT_DISTRIBUTE_HISTORY: {
            return Object.assign({}, state, { DistributionHistoryLoaded: false });
        }
        case DocumentDetailActions.ActionTypes.LOAD_DOCUMENT_DISTRIBUTE_HISTORY_COMPLETE: {
            return Object.assign({}, state, { DistributionHistoryLoaded: true, DocumentDistributionHistory: action.payload });
        }
        case DocumentDetailActions.ActionTypes.LOAD_DOCUMENT_DISTRIBUTE_HISTORY_LIST: {
            let request = <AtlasApiRequest>action.payload;
            let modifiedState: DocumentDetailsState = Object.assign({}, state);
            let historyData = modifiedState.DocumentDistributionHistory;
            let totalCount = modifiedState.DocumentDistributionHistory.length;
            historyData = CommonHelpers.sortArray(modifiedState.DocumentDistributionHistory, request.SortBy.SortField, request.SortBy.Direction);
            let startPage = (request.PageNumber * request.PageSize) - request.PageSize;
            let endPage = (request.PageNumber * request.PageSize);
            let slicedAbsenceType = historyData.slice(startPage, endPage);
            modifiedState.DocumentDistributionHistoryList = slicedAbsenceType;
            modifiedState.DistributionHistoryPagingInfo = new PagingInfo(request.PageSize, totalCount, request.PageNumber, request.PageSize);
            return modifiedState;
        }
        case DocumentDetailActions.ActionTypes.LOAD_DOCUMENT_EMPLOYEE_STATUS_FOR_PAGING_SORTING: {
            let request = <AtlasApiRequestWithParams>action.payload;
            let modifiedState: DocumentDetailsState = Object.assign({}, state, { apiRequestWithParams: action.payload });
            let statsEmp = modifiedState.DocumentEmployeeStatus;
            let totalCount = modifiedState.DocumentEmployeeStatus.length;
            if (!isNullOrUndefined(request.Params) && request.Params.length > 0) {
                let filterArray = [];
                let version = getAtlasParamValueByKey(request.Params, 'DocumentVersionInfo');
                let status: number = <number>getAtlasParamValueByKey(request.Params, 'Status');
                if (StringHelper.isNullOrUndefinedOrEmpty(String(version)) && StringHelper.isNullOrUndefinedOrEmpty(String(status))) {
                    filterArray = modifiedState.DocumentEmployeeStatus;
                } else {
                    modifiedState.DocumentEmployeeStatus.map((data) => {
                        if (!isNullOrUndefined(version) && !StringHelper.isNullOrUndefinedOrEmpty(String(version)) && !isNullOrUndefined(status) && !StringHelper.isNullOrUndefinedOrEmpty(String(status))) {
                            if (data.DocumentVersionInfo == version && data.Status == status) {
                                filterArray.push(data);
                            }
                        } else if (!isNullOrUndefined(version) && !StringHelper.isNullOrUndefinedOrEmpty(String(version))) {
                            if (data.DocumentVersionInfo == version) {
                                filterArray.push(data);
                            }
                        } else if (!isNullOrUndefined(status) && !StringHelper.isNullOrUndefinedOrEmpty(String(status))) {
                            if (data.Status == status) {
                                filterArray.push(data);
                            }
                        }
                    })
                }
                statsEmp = CommonHelpers.sortArray(filterArray, request.SortBy.SortField, request.SortBy.Direction);
                totalCount = filterArray.length;
            } else {
                statsEmp = CommonHelpers.sortArray(modifiedState.DocumentEmployeeStatus, request.SortBy.SortField, request.SortBy.Direction);
            }
            let startPage = (request.PageNumber * request.PageSize) - request.PageSize;
            let endPage = (request.PageNumber * request.PageSize);
            let slicedRecords = statsEmp.slice(startPage, endPage);
            modifiedState.DocumentEmployeeStatusPagedList = slicedRecords;
            modifiedState.EmployeeStatusPagingInfo = new PagingInfo(request.PageSize, totalCount, request.PageNumber, request.PageSize);
            return modifiedState;
        }

        case DocumentDetailActions.ActionTypes.LOAD_DOCUMENT_EMPLOYEE_STATUS: {
            return Object.assign({}, state, { EmployeeStatusLoaded: false });
        }
        case DocumentDetailActions.ActionTypes.LOAD_DOCUMENT_EMPLOYEE_STATUS_COMPLETE: {
            return Object.assign({}, state, { EmployeeStatusLoaded: true, DocumentEmployeeStatus: action.payload });
        }
        case DocumentDetailActions.ActionTypes.LOAD_DOCUMENT_DISTRIBUTE_HISTORY_DELETE:
            {
                return Object.assign({}, state, { DistributionHistoryLoaded: true });
            }
        case DocumentDetailActions.ActionTypes.LOAD_DOCUMENT_DISTRIBUTE_HISTORY_DELETE_COMPLETE:
            {
                return Object.assign({}, state, { DistributionHistoryLoaded: false, CurrentDistributeDoc: action.payload });
            }
        case DocumentExportToCQCActions.ActionTypes.LOAD_CQC_USERS_BY_SITEID_COMPLETE:
            {
                return Object.assign({}, state, { CQCUsers: action.payload });
            }
        case DocumentExportToCQCActions.ActionTypes.LOAD_CQC_FILETYPES_BY_SITEID_COMPLETE:
            {
                return Object.assign({}, state, { CQCFileTypes: action.payload });
            }
        case DocumentExportToCQCActions.ActionTypes.LOAD_CQC_STANDARDS_BY_SITEID_COMPLETE:
            {
                return Object.assign({}, state, { CQCStandards: action.payload });
            }
        case DocumentExportToCQCActions.ActionTypes.LOAD_CQC_CATEGORIES_BY_SITEID_COMPLETE:
            {
                return Object.assign({}, state, { CQCCategories: action.payload });
            }
        case DocumentDistributeActions.ActionTypes.DOCUMENT_DISTRIBUTE:
            {
                return Object.assign({}, state, { DocumentDistributed: false });
            }
        case DocumentDistributeActions.ActionTypes.DOCUMENT_DISTRIBUTE_COMPLETE:
            {
                return Object.assign({}, state, { DocumentDistributed: true });
            }
        case DocumentDetailActions.ActionTypes.RESET_DOCUMENT_DETAILS:
            {
                let newDocumentDetails = extractDocumentDetails(action.payload);
                return Object.assign({}, state, { CurrentDocument: newDocumentDetails });
            }
        default:
            return state;
    }
}
// document details

export function getDocumentDetailsById(state$: Observable<DocumentDetailsState>): Observable<DocumentDetails> {
    return state$.select(s => s.CurrentDocument);
};


// Change history
export function getDocumentDistributedStatus(state$: Observable<DocumentDetailsState>): Observable<boolean> {
    return state$.select(s => s.DocumentDistributed);
};

export function getChangeHistoryLoadStatus(state$: Observable<DocumentDetailsState>): Observable<boolean> {
    return state$.select(s => s.ChangeHistoryLoaded);
};
export function getDocumentChangeHistory(state$: Observable<DocumentDetailsState>): Observable<Immutable.List<ChangeHistoryModel>> {  // TODO type here
    return state$.select(s => s.DocumentChangeHistory && Immutable.List<ChangeHistoryModel>(s.DocumentChangeHistory));
};
export function getDocumentChangeHistoryListTotalCount(state$: Observable<DocumentDetailsState>): Observable<number> {
    return state$.select(s => s.ChangeHistoryPagingInfo && s.ChangeHistoryPagingInfo.TotalCount);
}
export function getDocumentChangeHistoryListDataTableOptions(state$: Observable<DocumentDetailsState>): Observable<DataTableOptions> {
    return state$.select(s => s.DocumentChangeHistory && s.ChangeHistoryPagingInfo && extractDataTableOptions(s.ChangeHistoryPagingInfo));
}


// Distribution history
export function getDocumentDistributionHistory(state$: Observable<DocumentDetailsState>): Observable<Immutable.List<DistributionHistoryModel>> {  // TODO type here
    return state$.select(s => s.DocumentDistributionHistoryList && Immutable.List<DistributionHistoryModel>(s.DocumentDistributionHistoryList));
};
export function getDistributionHistoryLoadStatus(state$: Observable<DocumentDetailsState>): Observable<boolean> {
    return state$.select(s => s.DistributionHistoryLoaded);
};
export function getDistributionHistoryListTotalCount(state$: Observable<DocumentDetailsState>): Observable<number> {
    return state$.select(s => s.DistributionHistoryPagingInfo && s.DistributionHistoryPagingInfo.TotalCount);
}
export function getDistributionHistoryListDataTableOptions(state$: Observable<DocumentDetailsState>): Observable<DataTableOptions> {
    return state$.select(s => s.DocumentDistributionHistory && s.DistributionHistoryPagingInfo && extractDataTableOptions(s.DistributionHistoryPagingInfo));
}


// Employee document action status
export function getEmployeeActionStatus(state$: Observable<DocumentDetailsState>): Observable<Immutable.List<EmployeeActionStatusModel>> {
    return state$.select(s => s.DocumentEmployeeStatusPagedList && Immutable.List<EmployeeActionStatusModel>(s.DocumentEmployeeStatusPagedList));
};
export function getEmployeeStatusLoadStatus(state$: Observable<DocumentDetailsState>): Observable<boolean> {
    return state$.select(s => s.EmployeeStatusLoaded);
};
export function getEmployeeStatusList(state$: Observable<DocumentDetailsState>): Observable<Array<EmployeeActionStatusModel>> {
    return state$.select(s => s.DocumentEmployeeStatus);
};
export function getEmployeeStatusListTotalCount(state$: Observable<DocumentDetailsState>): Observable<number> {
    return state$.select(s => s && s.EmployeeStatusPagingInfo && s.EmployeeStatusPagingInfo.TotalCount);
}
export function getEmployeeStatusListDataTableOptions(state$: Observable<DocumentDetailsState>): Observable<DataTableOptions> {
    return state$.select(s => s.DocumentEmployeeStatus && s.EmployeeStatusPagingInfo && extractDataTableOptions(s.EmployeeStatusPagingInfo));
}

// cqc functions

export function getCQCStandardsBySiteId(state$: Observable<DocumentDetailsState>): Observable<CQCStandards[]> {
    return state$.select(s => s.CQCStandards);
}
export function getCQCCategoriesBySiteId(state$: Observable<DocumentDetailsState>): Observable<CQCCategories[]> {
    return state$.select(s => s.CQCCategories);
}

export function getCQCUsersBySiteId(state$: Observable<DocumentDetailsState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.CQCUsers);
}

export function getCQCFileTypesBySiteId(state$: Observable<DocumentDetailsState>): Observable<Immutable.List<AeSelectItem<string>>> {
    return state$.select(s => s.CQCFileTypes);
}