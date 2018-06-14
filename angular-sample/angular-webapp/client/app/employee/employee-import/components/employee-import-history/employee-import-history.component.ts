import { RouteParams } from './../../../../shared/services/route-params';
import { Component, ChangeDetectorRef, EventEmitter, Input, Output, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from "../../../../shared/base-component";
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { ClaimsHelperService } from "../../../../shared/helpers/claims-helper";
import * as fromRoot from '../../../../shared/reducers';
import { Observable } from "rxjs/Observable";
import { DataTableOptions } from "../../../../atlas-elements/common/models/ae-datatable-options";
import { AePageChangeEventModel } from "../../../../atlas-elements/common/models/ae-page-change-event-model";
import * as Immutable from 'immutable';
import { AeSortModel } from "../../../../atlas-elements/common/models/ae-sort-model";
import { AeDataTableAction } from "../../../../atlas-elements/common/models/ae-data-table-action";
import { EmployeeImportHistory } from "../../models/employee-import";
import { AeClassStyle } from "../../../../atlas-elements/common/ae-class-style.enum";
import { isNullOrUndefined } from "util";
@Component({
  selector: 'employee-import-history',
  templateUrl: './employee-import-history.component.html',
  styleUrls: ['./employee-import-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeImportHistoryComponent extends BaseComponent {
  // Private Fields
  private _importHistorytList$: Observable<Immutable.List<EmployeeImportHistory>>;
  private _recordsCount$: Observable<number>;
  private _dataTableOptions: DataTableOptions;
  private _pageChanged: EventEmitter<AePageChangeEventModel>;
  private _onSort: EventEmitter<AeSortModel>;
  private _currentActionItemId: string;
  private _loadingStatus: boolean;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _onViewResultsClick: EventEmitter<any>;

  private _keys = Immutable.List(['Id', 'FileName', 'CreatedOn', 'FirstName', 'LastName', 'IsBackgroundJob', 'Status', 'FileStorageId']);


  // End of Private Fields

  //Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    this._pageChanged = new EventEmitter<AePageChangeEventModel>();
    this._onSort = new EventEmitter<AeSortModel>();
    this._onViewResultsClick = new EventEmitter<any>();
  }

  //End of Constructor

  // Public properties


  /**
   * loading status to show loader
   * 
   * @readonly
   * @type {boolean}
   * @memberof EmployeeImportHistoryComponent
   */
  @Input('loadingStatus')
  get loadingStatus(): boolean {
    return this._loadingStatus;
  }
  set loadingStatus(loadingStatus: boolean) {
    this._loadingStatus = loadingStatus;
  }


  /**
   * List of items to be shown in table
   * 
   * @readonly
   * 
   * @memberof EmployeeImportHistoryComponent
   */
  @Input('itemsList')
  set importHistoryList(importHistoryItemsList: Observable<Immutable.List<EmployeeImportHistory>>) {
    this._importHistorytList$ = importHistoryItemsList;
  }
  get importHistoryList() {
    return this._importHistorytList$;
  }
 


  /**
   * total records based on which paging is displayed
   * 
   * @readonly
   * 
   * @memberof EmployeeImportHistoryComponent
   */
  @Input('totalRecords')
  get totalRecords() {
    return this._recordsCount$;
  }
  set totalRecords(recordsCount$: Observable<number>) {
    this._recordsCount$ = recordsCount$;
  }

  get loadingStatus$() {
    return this._loadingStatus;
  }

  get dataTableOptions$() {
    return this._dataTableOptions;
  }
  /**
   * data table options
   * 
   * @readonly
   * 
   * @memberof EmployeeImportHistoryComponent
   */
  @Input('dataTableOptions')
  set dataTableOptions(dataTableOptions: DataTableOptions) {
    this._dataTableOptions = dataTableOptions;
  }
  get dataTableOptions() {
    return this._dataTableOptions;
  }
  
  get keys() {
    return this._keys;
  }

  get importHistorytList$() {
    return this._importHistorytList$;
  }

  get recordsCount$() {
    return this._recordsCount$;
  }

  get lightClass() {
    return this._lightClass;
  }
  //End of Public properties

  // Public Output bindings


  /**
   * page change event
   * 
   * @readonly
   * 
   * @memberof EmployeeImportHistoryComponent
   */
  @Output('pageChanged')
  get pageChanged() {
    return this._pageChanged;
  }


  /**
   * on sort change event
   * 
   * @readonly
   * 
   * @memberof EmployeeImportHistoryComponent
   */
  @Output('onPageSort')
  get onSort() {
    return this._onSort;
  }


  @Output('onViewResults')
  get onViewResults() {
    return this._onViewResultsClick;
  }
  //End of public Output bindings

  //Private methods
  private _getDownloadUrl(fileStorageId: string, fileName: string) {
    if (isNullOrUndefined(fileStorageId))
      return null;
    if (this._routeParamsService.Cid) {
      return `employeeexport?fileStorageId=${fileStorageId}&fileName=${fileName}&cid=${this._routeParamsService.Cid}`;
    } else {
      return `employeeexport?fileStorageId=${fileStorageId}&fileName=${fileName}`;
    }
  }

  //End of  Private methods


  //Public methods
  /**
    * emit event on page change
    * 
    * @public
    * @param {AePageChangeEventModel} pageChangeEventModel 
    * 
    * @memberof EmployeeImportHistoryComponent
    */
  onPageChange(pageChangeEventModel: AePageChangeEventModel) {
    this._pageChanged.emit(pageChangeEventModel);
  }


  /**
   * emit event on sort change
   * 
   * @public
   * @param {AeSortModel} aeSortModel 
   * 
   * @memberof EmployeeImportHistoryComponent
   */
  onPageSort(aeSortModel: AeSortModel) {
    this._onSort.emit(aeSortModel);
  }

  /**
  * method to display full name
  * 
  * @public
  * @param {string} firstName 
  * @param {string} lastName 
  * @returns {string} 
  * 
  * @memberof EmployeeImportHistoryComponent
  */
  getFullName(firstName: string, lastName: string): string {
    return firstName + ' ' + lastName;
  }

  /**
   * Show yes no based on isbackgrounnd job field
   * 
   * @public
   * @param {any} isBackgroundJob 
   * @returns {string} 
   * 
   * @memberof EmployeeImportHistoryComponent
   */
  getIsBackgroundJobText(isBackgroundJob): string {
    return isBackgroundJob ? 'Yes' : 'No';
  }

  /**
    * show status text based on status field
    * 
    * @public
    * @param {number} status 
    * @returns {string} 
    * 
    * @memberof EmployeeImportHistoryComponent
    */
  getStatusText(status: number): string {
    switch (status) {
      case 0:
        return 'Failed';
      case 1:
        return 'Completed';
      case 2:
        return 'Not Imported';
    }
    return '';
  }

  /**
  * method to show view results icon based on status
  * 
  * @public
  * @param {number} status 
  * @returns {boolean} 
  * 
  * @memberof EmployeeImportHistoryComponent
  */
  showViewResults(status: number): boolean {
    return status !== 2;
  }


  /**
  * method to show import results
  * 
  * @public
  * @param {string} id 
  * 
  * @memberof EmployeeImportHistoryComponent
  */
  onViewImportResultsClick(item: EmployeeImportHistory) {
    this._onViewResultsClick.emit(item);
  }
  downloadDocument(fileStorageId: string, fileName: string) {
    window.open(this._getDownloadUrl(fileStorageId, fileName));
  }

  //End of public methods

}
