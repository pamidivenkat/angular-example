import { DocumentsFolder } from '../../models/document';
import { DocumentCategoryService } from './../../services/document-category-service';
import { Document, DocumentFolderStat } from './../../models/document';
import { isNullOrUndefined } from 'util';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as companyDocumentsActions from '../actions/company-documents.actions';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { extractDataTableOptions } from './../../../shared/helpers/extract-helpers';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import * as Immutable from 'immutable';


export interface CompanyDocumentsState {
    hasCompanyDocumentsStatLoaded: boolean;
    CompanyDocumentStats: DocumentFolderStat[];
    hasCompanyDocumentsLoaded: boolean;
    companyDocumentsApiRequest: AtlasApiRequestWithParams;
    companyDocuments: Immutable.List<Document>;
    companyDocumentsPagingInfo: PagingInfo;
    IsDeleteDocumentCompleted: boolean;
}

const initialState: CompanyDocumentsState = {
    hasCompanyDocumentsStatLoaded: false,
    CompanyDocumentStats: null,
    hasCompanyDocumentsLoaded: false,
    companyDocumentsApiRequest: null,
    companyDocuments: null,
    companyDocumentsPagingInfo: null,
    IsDeleteDocumentCompleted: false
}

//filterDocumentViewHSFilter for HS Document suite

export function reducer(state = initialState, action: Action): CompanyDocumentsState {
    switch (action.type) {
        case companyDocumentsActions.ActionTypes.LOAD_COMPANY_DOCS_STATS: {
            let modifiedState = Object.assign({}, state, { hasCompanyDocumentsStatLoaded: false });
            return modifiedState;
        }

        case companyDocumentsActions.ActionTypes.LOAD_COMPANY_DOCS_STATS_COMPLETE: {
            let modifiedState: CompanyDocumentsState = Object.assign({}, state, { hasCompanyDocumentsStatLoaded: true });
            let statResponse = action.payload;
            let allDocumentStats: DocumentFolderStat[] = [];
            let allAvailableFolders = DocumentCategoryService.getAllAvailableFolders();
            allAvailableFolders.forEach(folder => {
                let statistic = new DocumentFolderStat();
                statistic.Folder = folder;
                statistic.Count = 0;
                let categoriesInFolder = DocumentCategoryService.getFolderCategories(folder);
                categoriesInFolder.forEach(category => {
                    statistic.Count += statResponse.categoryCount[category] ? statResponse.categoryCount[category] : 0
                });
                allDocumentStats.push(statistic);
            });

            //of the all statistics we have , we should add the subfolders count to form main folder counts.
            //Health and safety documents count = sum of handbooks and policies, inspection reports, hs document suit
            //HR employee documents count = sum of appriasal reviews, disciplinary&grievences,training,starters and leavers
            let healthAndSafetyDocumentsStat = DocumentCategoryService.getParentDocumentFolderStat(allDocumentStats, DocumentsFolder.HealthAndSafetyDocuments);
            let hrEmployeeDocumentsStat = DocumentCategoryService.getParentDocumentFolderStat(allDocumentStats, DocumentsFolder.HREmployeeDocuments);
            allDocumentStats.push(healthAndSafetyDocumentsStat);
            allDocumentStats.push(hrEmployeeDocumentsStat);
            modifiedState.CompanyDocumentStats = allDocumentStats;
            return modifiedState;
            //now parse the respone to get the count of documents by folder wise.
        }
        case companyDocumentsActions.ActionTypes.LOAD_COMPANY_DOCUMENTS: {
            let modifiedState = Object.assign({}, state, { hasCompanyDocumentsLoaded: false, companyDocumentsApiRequest: action.payload });
            return modifiedState;
        }
        case companyDocumentsActions.ActionTypes.LOAD_COMPANY_DOCUMENTS_COMPLETE: {
            let modifiedState = Object.assign({}, state, { hasCompanyDocumentsLoaded: true });

            if (!isNullOrUndefined(state.companyDocumentsPagingInfo)) {
                if (action.payload.PagingInfo.PageNumber == 1) {
                    modifiedState.companyDocumentsPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                }
                modifiedState.companyDocumentsPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                modifiedState.companyDocumentsPagingInfo.Count = action.payload.PagingInfo.Count;
            }
            else {
                modifiedState.companyDocumentsPagingInfo = action.payload.PagingInfo;
            }
            modifiedState.companyDocuments = Immutable.List<Document>(action.payload.Entities);
            return modifiedState;
        }
        case companyDocumentsActions.ActionTypes.REMOVE_COMPANY_DOCUMENT_COMPLETE:
            {
                return Object.assign({}, state, { IsDeleteDocumentCompleted: true });
            }
        case companyDocumentsActions.ActionTypes.RESET_DELETE_STATUS:
            {
                return Object.assign({}, state, { IsDeleteDocumentCompleted: false });
            }
        case companyDocumentsActions.ActionTypes.UPDATE_COMPANY_DOCUMENT_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                let updatedDocument: Document = <Document>action.payload
                if (!isNullOrUndefined(modifiedState.companyDocuments)) {
                    let existingDocument = modifiedState.companyDocuments.toArray().find(obj => obj.Id == updatedDocument.Id);
                    if (!isNullOrUndefined(existingDocument)) {
                        Object.assign(existingDocument, updatedDocument);
                    }
                    modifiedState.companyDocuments = Immutable.List<Document>(Array.from(modifiedState.companyDocuments.toArray()));
                }
                return modifiedState;
            }
        case companyDocumentsActions.ActionTypes.COMPANY_DOCUMENT_CLEAR:
            {
                return Object.assign({}, initialState);
            }
        default:
            return state;
    }
}

/*** Contracts Start ***/

export function getCompanyDocumentDeletedStatus(state$: Observable<CompanyDocumentsState>): Observable<boolean> {
    return state$.select(s => s.IsDeleteDocumentCompleted);
}


export function getCompanyDocumentStatsLoaded(state$: Observable<CompanyDocumentsState>): Observable<boolean> {
    return state$.select(s => s.hasCompanyDocumentsStatLoaded);
}

export function getCompanyDocumentStats(state$: Observable<CompanyDocumentsState>, docFolder: DocumentsFolder): Observable<DocumentFolderStat> {
    return state$.select(s => DocumentCategoryService.getTop1OrDefault(s.CompanyDocumentStats, docFolder));
}

export function getCompanyDocumentsLoaded(state$: Observable<CompanyDocumentsState>): Observable<boolean> {
    return state$.select(s => s.hasCompanyDocumentsLoaded);
}

export function getCompanyDocumentsApiRequest(state$: Observable<CompanyDocumentsState>): Observable<AtlasApiRequestWithParams> {
    return state$.select(s => s.companyDocumentsApiRequest);
}

export function getCompanyDocumentsList(state$: Observable<CompanyDocumentsState>): Observable<Immutable.List<Document>> {
    return state$.select(s => s.companyDocuments);
}

export function getCompanyDocumentsTotalCount(state$: Observable<CompanyDocumentsState>): Observable<number> {
    return state$.select(s => s && s.companyDocumentsPagingInfo && s.companyDocumentsPagingInfo.TotalCount);
}

export function getCompanyDocumentsDataTableOptions(state$: Observable<CompanyDocumentsState>): Observable<DataTableOptions> {
    return state$.select(s => s.companyDocuments && s.companyDocumentsPagingInfo && s.companyDocumentsApiRequest && extractDataTableOptions(s.companyDocumentsPagingInfo, s.companyDocumentsApiRequest.SortBy));
}

/*** Company documents End ***/