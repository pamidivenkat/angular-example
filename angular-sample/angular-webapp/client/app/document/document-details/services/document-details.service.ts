import * as fromRoot from '../../../shared/reducers/index';
import { Observable, ReplaySubject } from 'rxjs/Rx';
import { AtlasApiRequest, AtlasApiResponse, AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable, OnInit } from '@angular/core';
import { MessengerService } from '../../../shared/services/messenger.service';
import {
    DocumentDetails, DocumentDetailsType, ChangeHistoryModel,
    EmployeeActionStatusModel, DistributionHistoryModel
}
    from '../../../document/document-details/models/document-details-model';
import {
    LoadDocumentDetails, LoadDocumentChangeHistory, LoadDocumentDistributionHistory, LoadDocumentEmployeeStatus,
    LoadDocumentDistributeHistoryList, LoadEmployeeActionStatusForPagingSortingAction, LoadDocumentDistributeHistoryDelete
}
    from '../../../document/document-details/actions/document-details.actions';
import { SortDirection, AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import * as Immutable from 'immutable';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import * as DocumentExportToCQCActions from '../../../document/document-details/actions/document-export-to-cqc.actions';
import { CompanyCQCPurchasedDetailsByIdAction } from "../../../shared/actions/company.actions";

@Injectable()
export class DocumentDetailsService implements OnInit {
    private _pageNumber: number = 1;
    private _pageSize: number = 10;
    private _sortField: string = 'ActionedDate';
    private _sortDirection: SortDirection = SortDirection.Ascending;


    private _pageNumberStats: number = 1;
    private _pageSizeStats: number = 10;
    private _sortFieldStats: string = 'EmployeeName';
    private _sortDirectionStats: SortDirection = SortDirection.Descending;

    constructor(private _data: RestClientService
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService

    ) {

    }
    ngOnInit() {

    }

    //Start : Document details methods
    dispatchDocumentDetails(documentId: string, type: DocumentDetailsType) {
        this._store.dispatch(new LoadDocumentDetails({ DocumentId: documentId, DocumentType: type }));
    }

    loadDocumentDetails(): Observable<DocumentDetails> {
        return this._store.let(fromRoot.getDocumentDetailsById);
    }
    //End : Document details methods


    // Start : Document change history methods 
    dispatchDocumentChangeHistoryList(params: AtlasApiRequestWithParams) {
        this._store.dispatch(new LoadDocumentChangeHistory(params));
    }

    loadDocumentChangeHistoryList(): Observable<Immutable.List<ChangeHistoryModel>> {
        return this._store.let(fromRoot.getDocumentChangeHistory);
    }

    loadChangeHistoryTotalCount(): Observable<number> {
        return this._store.let(fromRoot.getDocumentChangeHistoryListTotalCount);
    }

    loadChangeHistoryDataTableOptions(): Observable<DataTableOptions> {
        return this._store.let(fromRoot.getDocumentChangeHistoryListDataTableOptions);
    }

    getDocumentChangeHistoryLoadStatus(): Observable<boolean> {
        return this._store.let(fromRoot.getChangeHistoryLoadStatus);
    }
    // End : Document change history methods


    // Start : Distribution history methods

    dispatchDistributionHistory(documentId: string) {
        let atlasParams: AtlasParams[] = new Array();
        atlasParams.push(new AtlasParams("DocumentId", documentId));
        this._store.dispatch(new LoadDocumentDistributionHistory(new AtlasApiRequestWithParams(this._pageNumber, this._pageSize, this._sortField, this._sortDirection, atlasParams)));
    }

    dispatchDistributionHistoryList(request: AtlasApiRequest) {
        this._store.dispatch(new LoadDocumentDistributeHistoryList(request));
    }
    dispatchDeleteDistributedDoc(distributeDoc) {
        this._store.dispatch(new LoadDocumentDistributeHistoryDelete(distributeDoc));
    }

    loadDistributionHistoryList(): Observable<Immutable.List<DistributionHistoryModel>> {
        return this._store.let(fromRoot.getDocumentDistributionHistory);
    }

    loadDistributionHistoryTotalCount(): Observable<number> {
        return this._store.let(fromRoot.getDistributionHistoryListTotalCount);
    }

    loadDistributionHistoryDataTableOptions(): Observable<DataTableOptions> {
        return this._store.let(fromRoot.getDistributionHistoryListDataTableOptions);
    }

    getDistributionHistoryLoadStatus(): Observable<boolean> {
        return this._store.let(fromRoot.getDistributionHistoryLoadStatus);
    }
    // End : Distribution history methods


    // Start : Employee action status methods
    dispatchEmployeeActionStatusList(documentId: string) {
        let atlasParams: AtlasParams[] = new Array();
        atlasParams.push(new AtlasParams("DocumentId", documentId));
        this._store.dispatch(new LoadDocumentEmployeeStatus(new AtlasApiRequestWithParams(this._pageNumber, this._pageSize, this._sortField, this._sortDirection, atlasParams)));
    }

    dispatchEmployeeActionStatusPagedList(request: AtlasApiRequestWithParams) {

        this._store.dispatch(new LoadEmployeeActionStatusForPagingSortingAction(request));
    }


    loadEmployeeActionStatusList(): Observable<Immutable.List<EmployeeActionStatusModel>> {
        return this._store.let(fromRoot.getEmployeeActionStatus);
    }

    loadEmployeeActionStatusTotalCount(): Observable<number> {
        return this._store.let(fromRoot.getEmployeeStatusListTotalCount);
    }

    loadEmployeeActionStatusDataTableOptions(): Observable<DataTableOptions> {
        return this._store.let(fromRoot.getEmployeeStatusListDataTableOptions);
    }

    getEmployeeActionStatusLoadStatus(): Observable<boolean> {
        return this._store.let(fromRoot.getEmployeeStatusLoadStatus);
    }

    dispatchEmployeeActionStatusPaging(requestData) {
        this._store.dispatch(new LoadEmployeeActionStatusForPagingSortingAction(requestData));
    }

    dispatchEmployeeActionStatusForPaging($event: any) {
        this._pageNumberStats = $event.pageNumber;
        this._pageSizeStats = $event.noOfRows;
        let atlasParams: AtlasParams[] = new Array();
        this._store.dispatch(new LoadEmployeeActionStatusForPagingSortingAction(new AtlasApiRequestWithParams(this._pageNumberStats, this._pageSizeStats, this._sortFieldStats, this._sortDirectionStats, atlasParams)));
    }

    dispatchEmployeeActionStatusForSorting($event: AeSortModel) {
        this._sortFieldStats = $event.SortField;
        this._sortDirectionStats = $event.Direction;
        let atlasParams: AtlasParams[] = new Array();
        this._store.dispatch(new LoadEmployeeActionStatusForPagingSortingAction(new AtlasApiRequestWithParams(this._pageNumberStats, this._pageSizeStats, this._sortFieldStats, this._sortDirectionStats, atlasParams)));

    }

    // End : Employee action status methods

    // CQC pro methods

    getCQCPurchaseDetailsLoadingStatus(): Observable<boolean> {
        return this._store.let(fromRoot.getCQCPurchaseDetailsLoadingStatus);
    }

    getCQCPurchaseStatusByCompanyId() {
        this._store.dispatch(new CompanyCQCPurchasedDetailsByIdAction());
    }

}