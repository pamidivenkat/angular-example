import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { DataTableOptions } from "../../../../atlas-elements/common/models/ae-datatable-options";
import * as Immutable from 'immutable';
import { AeDataTableAction } from "../../../../atlas-elements/common/models/ae-data-table-action";
import { EmployeeImportHistory } from "../../models/employee-import";
import { BaseComponent } from "../../../../shared/base-component";
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { ClaimsHelperService } from "../../../../shared/helpers/claims-helper";
import * as fromRoot from '../../../../shared/reducers';
import { Tristate } from "../../../../atlas-elements/common/tristate.enum";
import { EmployeeImportHistoryLoadAction, EmployeeImportHistoryLoadImportResultsAction } from "../../actions/employee-import.actions";
import { SortDirection, AeSortModel } from "../../../../atlas-elements/common/models/ae-sort-model";
import { AePageChangeEventModel } from "../../../../atlas-elements/common/models/ae-page-change-event-model";
import { Subscription } from "rxjs/Subscription";
import { EmployeeImportResult } from "../../models/employee-import-result";
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
@Component({
  selector: 'employee-import-history-container',
  templateUrl: './employee-import-history-container.component.html',
  styleUrls: ['./employee-import-history-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeImportHistoryContainerComponent extends BaseComponent implements OnInit {
  //Private members
  private _importHistoryList$: Observable<Immutable.List<EmployeeImportHistory>>;
  private _totalRecords$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _loadingStatus$: Observable<boolean>;
  private _importResults$: Observable<Immutable.List<EmployeeImportResult>>;
  private _loadingImportResultStatus$: Observable<boolean>;
  private _totalImportResultRecords$: Observable<number>;
  private _importResultDataTableOptions$: Observable<DataTableOptions>;
  private _viewImportResults: boolean;
  //End of private members
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _breadcrumbService: BreadcrumbService) {
    super(_localeService, _translationService, _cdRef);
    let bcItem = new IBreadcrumb('Employee import history', '/employee/import/history', BreadcrumbGroup.Employees);
    this._breadcrumbService.add(bcItem);
  }


  // Private methods

  //Private methods
  //Public properties
  get totalRecords$() {
    return this._totalRecords$;
  }
  get importHistoryList$() {
    return this._importHistoryList$;
  }
  get dataTableOptions$() {
    return this._dataTableOptions$;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Employees;
  }

  get loadingStatus$() {
    return this._loadingStatus$;
  }

  get importResults$() {
    return this._importResults$;
  }

  get loadingImportResultStatus$() {
    return this._loadingImportResultStatus$;
  }
  get importResultDataTableOptions$() {
    return this._importResultDataTableOptions$;
  }

  get totalImportResultRecords$() {
    return this._totalImportResultRecords$;
  }
  //End of public properties

  //Public methods
  onPageSort(sortModel: AeSortModel) {
    this._store.dispatch(new EmployeeImportHistoryLoadAction({ sortField: sortModel.SortField, direction: sortModel.Direction }));
  }

  onPageChanged($event: AePageChangeEventModel) {
    this._store.dispatch(new EmployeeImportHistoryLoadAction({ pageNumber: $event.pageNumber, pageSize: $event.noOfRows }));
  }

  onViewResultsClick(importHistory: EmployeeImportHistory) {
    this._store.dispatch(new EmployeeImportHistoryLoadImportResultsAction({
      fileStorageId: importHistory.FileStorageId,
      fileName: importHistory.FileName
    }));
    this._viewImportResults = true;
  }

  getSlideoutState(): string {
    return (this._viewImportResults === true) ? 'expanded' : 'collapsed';
  }

  getSlideoutAnimateState(): boolean {
    return (this._viewImportResults === true);
  }

  closeResultsSlider(event: string) {
    this._viewImportResults = false;
  }

  //End of public methods

  ngOnInit() {
    this._store.dispatch(new EmployeeImportHistoryLoadAction({
      pageNumber: 1,
      pageSize: 10,
      sortField: 'CreatedOn',
      direction: SortDirection.Descending
    }));

    this._importHistoryList$ = this._store.let(fromRoot.getEmployeeImportHistoryList);
    this._totalRecords$ = this._store.let(fromRoot.getEmployeeImportHistoryTotalCount);
    this._dataTableOptions$ = this._store.let(fromRoot.getEmployeeImportHistoryDataTableOptions);
    this._loadingStatus$ = this._store.let(fromRoot.getEmployeeImportHistoryLoadStatus);
    this._importResults$ = this._store.let(fromRoot.getEmployeeImportResultData);
    this._loadingImportResultStatus$ = this._store.let(fromRoot.getEmployeeimportResultStatus);
    this._totalImportResultRecords$ = this._store.let(fromRoot.getEmployeeImportResultTotalCount);
    this._importResultDataTableOptions$ = this._store.let(fromRoot.getEmployeeImportResultDataTableOptions);
  }

}
