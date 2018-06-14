import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';

import * as companyDocActions from '../actions/company-documents.actions';
import { SortDirection } from './../../../atlas-elements/common/models/ae-sort-model';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';
import { getAtlasParamValueByKey } from './../../../root-module/common/extract-helpers';
import * as errorActions from './../../../shared/actions/error.actions';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { ObjectHelper } from './../../../shared/helpers/object-helper';
import { StringHelper } from './../../../shared/helpers/string-helper';
import { AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import * as fromRoot from './../../../shared/reducers/index';
import { MessengerService } from './../../../shared/services/messenger.service';
import { ResetDocumentDetails } from './../../document-details/actions/document-details.actions';
import { Document, DocumentsFolder } from './../../models/document';
import { DocumentCategoryService } from './../../services/document-category-service';
import {
    LoadCompanyDocumentsAction,
    LoadCompanyDocumentsStatAction,
    RemoveCompanyDocumentCompleteAction,
    UpdateCompanyDocumentCompleteAction,
} from './../actions/company-documents.actions';



@Injectable()
export class CompanyDocumentsEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _documentCategoryService: DocumentCategoryService
        , private _messenger: MessengerService
    ) {
    }


    @Effect()
    loadDocumentStats$: Observable<Action> = this._actions$.ofType(companyDocActions.ActionTypes.LOAD_COMPANY_DOCS_STATS)
        .switchMap((p1) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('isDocumentStats', 'true');
            params.set('temp1', 'true');
            return this._data.get('DocumentView', { search: params })
                .map(res => new companyDocActions.LoadCompanyDocumentsStatCompleteAction(res.json()))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'company documents stats', '')));
                })
        });

    @Effect()
    loadDocuments$: Observable<Action> = this._actions$.ofType(companyDocActions.ActionTypes.LOAD_COMPANY_DOCUMENTS)
        .map((action: companyDocActions.LoadCompanyDocumentsAction) => action.payload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            let docFolder: DocumentsFolder = <DocumentsFolder>getAtlasParamValueByKey(payload.Params, "DocumentFolder");
            let folderCategories = this._documentCategoryService.getFolderCategories(docFolder);
            let camaCategories: string = folderCategories.join(',');
            let selectedDocCategory = getAtlasParamValueByKey(payload.Params, "DocumentCategory");
            let categoryToSendToAPI = selectedDocCategory ? selectedDocCategory : camaCategories;
            let selectedSite = getAtlasParamValueByKey(payload.Params, "Site");
            let documentCategoryStatus = getAtlasParamValueByKey(payload.Params, "DocumentViewByCategoryStatus");

            if (selectedSite && !StringHelper.isNullOrUndefinedOrEmpty(selectedSite)) {
                //here based on the type of folder that we are requesting the appropriate filter needs to be appened
                //for employee documents folders we need to append to employeeDocumentSite
                if (docFolder == DocumentsFolder.AppraisalReviews
                    || docFolder == DocumentsFolder.DisciplinaryAndGrivences
                    || docFolder == DocumentsFolder.Trainings
                    || docFolder == DocumentsFolder.StartersAndLeavers
                    || docFolder == DocumentsFolder.Others
                ) {
                    params.set('employeeDocumentSite', selectedSite);

                } else {
                    params.set('site', selectedSite);
                }
            }

            if (!StringHelper.isNullOrUndefinedOrEmpty(documentCategoryStatus))
                params.set('filterDocumentViewByCategoryStatus', documentCategoryStatus);
            //now adding some default filters based on the folder selected not sure why but 1.x has this logic
            if (docFolder == DocumentsFolder.Others) {
                params.set('filterDocumentViewOtherDocsFilterNew', 'All');
            }
            if (docFolder == DocumentsFolder.HSDocumentSuite) {
                params.set('filterDocumentViewHSFilter', 'All');
            }
            //filterDocumentViewOtherDocsFilter=All -- when other filter is selected.. and site should be the same...
            //filterDocumentViewHSFilter=All
            let selectedDepartment = getAtlasParamValueByKey(payload.Params, "DepartmentId");
            if (selectedDepartment && !StringHelper.isNullOrUndefinedOrEmpty(selectedDepartment))
                params.set('documentDepartment', selectedDepartment);

            let selectedEmployee = getAtlasParamValueByKey(payload.Params, "EmployeeId");
            if (selectedEmployee && !StringHelper.isNullOrUndefinedOrEmpty(selectedEmployee))
                params.set('documentEmployee', selectedEmployee);

            let docNameInput = getAtlasParamValueByKey(payload.Params, "DocumentNameQuery");
            if (docNameInput && !StringHelper.isNullOrUndefinedOrEmpty(docNameInput))
                params.set('documentNameFilter', docNameInput);

            params.set('multipleCategory', categoryToSendToAPI);
            params.set('pageNumber', payload.PageNumber.toString());
            params.set('pageSize', payload.PageSize.toString());
            params.set('sortField', payload.SortBy.SortField);
            params.set('direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');

            params.set('usage', '2');
            params.set('fields', 'Id,FileNameAndTitle,CategoryName,Version,SiteName,EmployeeName,ModifiedOn,Status,ModifiedBy,Sensitivity,Usage,Category,DocumentOrigin');
            return this._data.get('DocumentView', { search: params })
                .map(res => new companyDocActions.LoadCompanyDocumentsCompleteAction(<AtlasApiResponse<Document>>res.json()))
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'company documents', '')));
                })
        });

    @Effect()
    deleteCompanyDocument$: Observable<Action> = this._actions$.ofType(companyDocActions.ActionTypes.REMOVE_COMPANY_DOCUMENT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: Document, state) => { return { payload: payload, companyDocumentState: state.companyDocumentsState }; })
        .switchMap((pl) => {
            let action = pl.payload;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Document', action.FileNameAndTitle, action.Id);
            this._messenger.publish('snackbar', vm);
            let apiUrl = 'document/' + action.Id;
            return this._data.delete(apiUrl)
                .mergeMap(() => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Document', action.FileNameAndTitle, action.Id);
                    this._messenger.publish('snackbar', vm);
                    if (action.ShouldReloadList) {
                        this._store.dispatch(new LoadCompanyDocumentsAction(pl.companyDocumentState.companyDocumentsApiRequest));
                        //we should reload the document stats as well 
                        this._store.dispatch(new LoadCompanyDocumentsStatAction());
                    }
                    return Observable.of(new RemoveCompanyDocumentCompleteAction())
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, "Document", action.FileNameAndTitle, action.Id)));
                });
        });

    @Effect()
    updateCompanyDocument$: Observable<Action> = this._actions$.ofType(companyDocActions.ActionTypes.UPDATE_COMPANY_DOCUMENT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: Document, state) => { return { payload: payload, companyDocumentState: state.companyDocumentsState }; })
        .switchMap((pl) => {
            let action = <any>pl.payload;
            action.Author = null;
            action.Modifier = null;
            let title = action.FileNameAndTitle ? action.FileNameAndTitle : action.FileName;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Document', title, action.Id);
            this._messenger.publish('snackbar', vm);
            let apiUrl = 'document'
            return this._data.post(apiUrl, action)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Document', title, action.Id);
                    this._messenger.publish('snackbar', vm);
                    if (action.ShouldReloadList) {
                        this._store.dispatch(new LoadCompanyDocumentsAction(pl.companyDocumentState.companyDocumentsApiRequest));
                    } else {
                        //from document details page so despatch action to reset the document details
                        this._store.dispatch(new ResetDocumentDetails(res));
                    }
                    return Observable.of(new UpdateCompanyDocumentCompleteAction(<Document>res.json()))
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, "Document", title, action.Id)));
                });
        });
}