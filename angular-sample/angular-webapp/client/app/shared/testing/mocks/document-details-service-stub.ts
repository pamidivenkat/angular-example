import { AeSortModel } from './../../../atlas-elements/common/Models/ae-sort-model';
import { DistributionHistoryModel, EmployeeActionStatusModel } from './../../../document/document-details/models/document-details-model';
import { AtlasApiRequest, AtlasApiRequestWithParams } from './../../models/atlas-api-response';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import { ChangeHistoryModel, DocumentDetails } from '../../../document/document-details/models/document-details-model';
import { BehaviorSubject } from 'rxjs/Rx';
import * as Immutable from 'immutable';

export class DocumentDetailsServiceStub {
    //Start : Document details methods
    //Start : Document details methods
    public documentDetails: BehaviorSubject<DocumentDetails> = new BehaviorSubject<DocumentDetails>(null);
    public changeHistoryModel: BehaviorSubject<Immutable.List<ChangeHistoryModel>> = new BehaviorSubject<Immutable.List<ChangeHistoryModel>>(null);
    public totalChangeHistoryCount: BehaviorSubject<number> = new BehaviorSubject<number>(null);
    public changeHistoryDataTableOptions: BehaviorSubject<DataTableOptions> = new BehaviorSubject<DataTableOptions>(null);
    public totalChangeHistoryStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
    public changeHistoryList: BehaviorSubject<Immutable.List<DistributionHistoryModel>> = new BehaviorSubject<Immutable.List<DistributionHistoryModel>>(null)
    public distributionHistoryCount: BehaviorSubject<number> = new BehaviorSubject<number>(null);
    public distributionHistoryDataTableOptions: BehaviorSubject<DataTableOptions> = new BehaviorSubject<DataTableOptions>(null);
    public distributionHistoryStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

    public employeeActionStatusList: BehaviorSubject<Immutable.List<EmployeeActionStatusModel>> = new BehaviorSubject<Immutable.List<EmployeeActionStatusModel>>(null)
    public employeeActionStatusTotalCount: BehaviorSubject<number> = new BehaviorSubject<number>(null);
    public employeeActionStatusDataTableOptions: BehaviorSubject<DataTableOptions> = new BehaviorSubject<DataTableOptions>(null);
    public employeeActionLoadingStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
    public cqcPurchaseLoadingStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

    dispatchDocumentDetails() {

    }

    loadDocumentDetails(): BehaviorSubject<DocumentDetails> {
        return this.documentDetails;
    }
    //End : Document details methods


    // Start : Document change history methods 
    dispatchDocumentChangeHistoryList() {

    }

    loadDocumentChangeHistoryList(): BehaviorSubject<Immutable.List<ChangeHistoryModel>> {
        return this.changeHistoryModel;
    }

    loadChangeHistoryTotalCount(): BehaviorSubject<number> {
        return this.totalChangeHistoryCount;
    }

    loadChangeHistoryDataTableOptions(): BehaviorSubject<DataTableOptions> {
        return this.changeHistoryDataTableOptions;
    }

    getDocumentChangeHistoryLoadStatus(): BehaviorSubject<boolean> {
        return this.totalChangeHistoryStatus;
    }
    // End : Document change history methods


    // Start : Distribution history methods

    dispatchDistributionHistory(documentId: string) {

    }

    dispatchDistributionHistoryList(request: AtlasApiRequest) {

    }
    dispatchDeleteDistributedDoc(distributeDoc) {

    }

    loadDistributionHistoryList(): BehaviorSubject<Immutable.List<DistributionHistoryModel>> {
        return this.changeHistoryList;
    }

    loadDistributionHistoryTotalCount(): BehaviorSubject<number> {
        return this.distributionHistoryCount;
    }

    loadDistributionHistoryDataTableOptions(): BehaviorSubject<DataTableOptions> {
        return this.distributionHistoryDataTableOptions;
    }

    getDistributionHistoryLoadStatus(): BehaviorSubject<boolean> {
        return this.distributionHistoryStatus
    }
    // End : Distribution history methods


    // Start : Employee action status methods
    dispatchEmployeeActionStatusList(documentId: string) {
       
    }

    dispatchEmployeeActionStatusPagedList(request: AtlasApiRequestWithParams) {

    
    }


    loadEmployeeActionStatusList(): BehaviorSubject<Immutable.List<EmployeeActionStatusModel>> {
        return this.employeeActionStatusList;
    }

    loadEmployeeActionStatusTotalCount(): BehaviorSubject<number> {
        return this.employeeActionStatusTotalCount;
    }

    loadEmployeeActionStatusDataTableOptions(): BehaviorSubject<DataTableOptions> {
        return this.employeeActionStatusDataTableOptions;
    }

    getEmployeeActionStatusLoadStatus(): BehaviorSubject<boolean> {
        return this.employeeActionLoadingStatus;
    }

    dispatchEmployeeActionStatusPaging(requestData) {
        
    }

    dispatchEmployeeActionStatusForPaging($event: any) {
       
    }

    dispatchEmployeeActionStatusForSorting($event: AeSortModel) {
      

    }

    // End : Employee action status methods

    // CQC pro methods

    getCQCPurchaseDetailsLoadingStatus(): BehaviorSubject<boolean> {
        return this.cqcPurchaseLoadingStatus;
    }

    getCQCPurchaseStatusByCompanyId() {
         
    }

}
