import { extractDataTableOptions } from '../../shared/helpers/extract-helpers';
import { AeSortModel } from './../../atlas-elements/common/models/ae-sort-model';
import { DistributedDocument, ActionedDocument } from './../models/DistributedDocument';
import {
    AtlasApiRequest,
    AtlasApiResponse,
    AtlasApiRequestWithParams
} from './../../shared/models/atlas-api-response';
import { DataTableOptions } from '../../atlas-elements/common/models/ae-datatable-options';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as CompanyDocumentActions from '../actions/shared-documents.actions';
import * as Immutable from 'immutable';
import { Employee } from "../../employee/models/employee.model";
import { AeSelectItem } from "./../../atlas-elements/common/models/ae-select-item";
import { isNullOrUndefined } from "util";


export interface SharedDocumentsState {
    hasDocumentsToReivewLoaded: boolean,
    documentsToReview: AtlasApiResponse<DistributedDocument>,
    documentsToReviewRequest: AtlasApiRequestWithParams,
    totalDocumentsToReviewCount: number;
    hasDocumentsToReviewActionConfirmCompleted: boolean;
    hasUsefulDocumentsToReivewLoaded: boolean,
    usefulDocumentsToReview: AtlasApiResponse<DistributedDocument>,
    usefulDocumentsToReviewRequest: AtlasApiRequestWithParams,
    totalUsefulDocumentsToReviewCount: number,
    hasUsefulDocumentsToReviewActionConfirmCompleted: boolean,
    //Maintaining the same object for both document, shared document
    actionedDocument: ActionedDocument,
    actionedUsefulDocument: ActionedDocument
    employeeSearchListRequest: AtlasApiRequestWithParams,
    employeeSearchListResponse: Array<AeSelectItem<string>>;
}


const initialState: SharedDocumentsState = {
    hasDocumentsToReivewLoaded: false,
    documentsToReview: new AtlasApiResponse<DistributedDocument>(),
    documentsToReviewRequest: null,// new AtlasApiRequest(1, 10, "DateSent", "desc"),
    totalDocumentsToReviewCount: 0,
    hasDocumentsToReviewActionConfirmCompleted: false,
    hasUsefulDocumentsToReivewLoaded: false,
    usefulDocumentsToReview: new AtlasApiResponse<DistributedDocument>(),
    usefulDocumentsToReviewRequest: null,//new AtlasApiRequest(1, 10, "CreatedOn", "desc"),
    totalUsefulDocumentsToReviewCount: 0,
    hasUsefulDocumentsToReviewActionConfirmCompleted: false,
    actionedDocument: null,
    actionedUsefulDocument: null,
    employeeSearchListRequest: null,
    employeeSearchListResponse: null,
}




export function reducer(state = initialState, action: Action): SharedDocumentsState {
    switch (action.type) {
        case CompanyDocumentActions.ActionTypes.LOAD_COMPANY_DOCUMENTS_TO_REVIEW:
            {
                let docsToReviewPayLoad = <AtlasApiRequest>action.payload;
                let modifiedState = Object.assign({}, state, { hasDocumentsToReivewLoaded: false, documentsToReviewRequest: docsToReviewPayLoad });
                return modifiedState;

            }
        case CompanyDocumentActions.ActionTypes.LOAD_COMPANY_DOCUMENTS_TO_REVIEW_COMPLETE:
            {
                let docsToReview = <AtlasApiResponse<DistributedDocument>>action.payload;
                //here update the state paging and sort information              
                let modifiedState = Object.assign({}, state, { hasDocumentsToReivewLoaded: true, documentsToReview: docsToReview })
                if (docsToReview.PagingInfo.PageNumber == 1)
                    modifiedState.totalDocumentsToReviewCount = docsToReview.PagingInfo.TotalCount;
                return modifiedState;
            }

        case CompanyDocumentActions.ActionTypes.LOAD_COMPANY_USEFULDOCUMENTS_TO_REVIEW:
            {
                let usefulDocsToReviewPayLoad = <AtlasApiRequest>action.payload;
                let modifiedState = Object.assign({}, state, { hasUsefulDocumentsToReivewLoaded: false, usefulDocumentsToReviewRequest: usefulDocsToReviewPayLoad });
                return modifiedState;
            }
        case CompanyDocumentActions.ActionTypes.LOAD_COMPANY_USEFULDOCUMENTS_TO_REVIEW_COMPLETE:
            {
                let usefulDocsToReview = <AtlasApiResponse<DistributedDocument>>action.payload;
                let modifiedState = Object.assign({}, state, { hasUsefulDocumentsToReivewLoaded: true, usefulDocumentsToReview: usefulDocsToReview })
                if (usefulDocsToReview.PagingInfo.PageNumber == 1)
                    modifiedState.totalUsefulDocumentsToReviewCount = usefulDocsToReview.PagingInfo.TotalCount;
                return modifiedState;
            }
        case CompanyDocumentActions.ActionTypes.COMPANY_DOCUMENTS_TO_REVIEW_ACTION_CONFIRM:
            {
                return Object.assign({}, state, { hasDocumentsToReviewActionConfirmCompleted: false })
            }
        case CompanyDocumentActions.ActionTypes.COMPANY_DOCUMENTS_TO_REVIEW_ACTION_CONFIRM_COMPLETE:
            {
                let actionedDoc = <ActionedDocument>action.payload
                return Object.assign({}, state, { hasDocumentsToReviewActionConfirmCompleted: true, actionedDocument: actionedDoc })
            }
        case CompanyDocumentActions.ActionTypes.COMPANY_USEFULDOCUMENTS_TO_REVIEW_ACTION_CONFIRM:
            {
                return Object.assign({}, state, { hasDocumentsToReviewActionConfirmCompleted: false })
            }
        case CompanyDocumentActions.ActionTypes.COMPANY_USEFULDOCUMENTS_TO_REVIEW_ACTION_CONFIRM_COMPLETE:
            {
                let actionedDoc = <ActionedDocument>action.payload
                return Object.assign({}, state, { hasDocumentsToReviewActionConfirmCompleted: true, actionedUsefulDocument: actionedDoc })
            }
        case CompanyDocumentActions.ActionTypes.SEARCH_EMPLOYEES:
            {
                return Object.assign({}, state)
            }
        case CompanyDocumentActions.ActionTypes.SEARCH_EMPLOYEES_COMPLETE:
            {
                return Object.assign({}, state,{employeeSearchListResponse:action.payload})
            }
        default:
            return state;
    }

};


export function getHasDocumentsToReviewLoaded(state$: Observable<SharedDocumentsState>): Observable<boolean> {
    return state$.select(s => s.hasDocumentsToReivewLoaded);
};

export function getDocumentsToReview(state$: Observable<SharedDocumentsState>): Observable<Immutable.List<DistributedDocument>> {
    return state$.select(s => Immutable.List<DistributedDocument>(s.documentsToReview.Entities));
};


export function getDocumentsToReviewCurrentPage(state$: Observable<SharedDocumentsState>): Observable<number> {
    return state$.select(s => s.documentsToReview.PagingInfo.PageNumber);
};

export function getDocumentsToReviewTotalCount(state$: Observable<SharedDocumentsState>): Observable<number> {
    return state$.select(s => s.totalDocumentsToReviewCount);
};

export function getDocumentsToReviewItemsCount(state$: Observable<SharedDocumentsState>): Observable<number> {
    return state$.select(s => s.documentsToReview.PagingInfo.Count);
};

export function getDocumentsToReviewDataTableOptions(state$: Observable<SharedDocumentsState>): Observable<DataTableOptions> {
    return state$.select(state => state.documentsToReview && state.documentsToReviewRequest && extractDataTableOptions(state.documentsToReview.PagingInfo,state.documentsToReviewRequest.SortBy));
};

export function getHasDocumentsToReviewActionConfirmCompleted(state$: Observable<SharedDocumentsState>): Observable<boolean> {
    return state$.select(s => s.hasDocumentsToReviewActionConfirmCompleted);
};


export function getHasUsefulDocumentsToReivewLoadedLoaded(state$: Observable<SharedDocumentsState>): Observable<boolean> {
    return state$.select(s => s.hasUsefulDocumentsToReivewLoaded);
};

export function getUsefulDocumentsToReview(state$: Observable<SharedDocumentsState>): Observable<Immutable.List<DistributedDocument>> {
    return state$.select(s => Immutable.List<DistributedDocument>(s.usefulDocumentsToReview.Entities));
};

export function getUsefulDocumentsToReviewCurrentPage(state$: Observable<SharedDocumentsState>): Observable<number> {
    return state$.select(s => s.usefulDocumentsToReview.PagingInfo.PageNumber);
};

export function getUsefulDocumentsToReviewDataTableOptions(state$: Observable<SharedDocumentsState>): Observable<DataTableOptions> {
    return state$.select(state => state.usefulDocumentsToReview && state.usefulDocumentsToReviewRequest && extractDataTableOptions(state.usefulDocumentsToReview.PagingInfo,state.usefulDocumentsToReviewRequest.SortBy));
};

export function getUsefulDocumentsToReviewItemsCount(state$: Observable<SharedDocumentsState>): Observable<number> {
    return state$.select(s => s.usefulDocumentsToReview.PagingInfo.Count);
};


export function getUsefulDocumentsToReviewTotalCount(state$: Observable<SharedDocumentsState>): Observable<number> {
    return state$.select(s => s.totalUsefulDocumentsToReviewCount);
};

export function geHasUsefulDocumentsToReviewActionConfirmCompleted(state$: Observable<SharedDocumentsState>): Observable<boolean> {
    return state$.select(s => s.hasUsefulDocumentsToReviewActionConfirmCompleted);
};

export function getDocumentsToReviewAPIRequest(state$: Observable<SharedDocumentsState>): Observable<AtlasApiRequestWithParams> {
    return state$.select(s => s.documentsToReviewRequest);
};

export function getUsefulDocumentsToReviewAPIRequest(state$: Observable<SharedDocumentsState>): Observable<AtlasApiRequestWithParams> {
    return state$.select(s => s.usefulDocumentsToReviewRequest);
};

export function getDocumentReviewRequestsEmployees(state$: Observable<SharedDocumentsState>): Observable<AeSelectItem<string>[]> {
    return state$.select(s => s.employeeSearchListResponse && s.employeeSearchListResponse);
};




