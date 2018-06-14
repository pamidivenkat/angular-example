import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, EventEmitter, Input, Output } from '@angular/core';
import { BaseComponent } from "../../../../shared/base-component";
import { LocaleService, TranslationService } from "angular-l10n";
import { ClaimsHelperService } from "../../../../shared/helpers/claims-helper";
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../../shared/reducers';
import { Observable } from "rxjs/Observable";
import * as Immutable from 'immutable';
import { EmployeeImportResult } from "../../models/employee-import-result";
import { DataTableOptions } from "../../../../atlas-elements/common/models/ae-datatable-options";
import { isNullOrUndefined } from "util";
import { AtlasParams, AtlasApiRequestWithParams } from "../../../../shared/models/atlas-api-response";
import { EmployeeImportHistoryLoadImportResultsAction, EmployeeImportHistoryLoadImportPaggingResultsAction } from "../../../../employee/employee-import/actions/employee-import.actions";
import { SortDirection } from "../../../../atlas-elements/common/models/ae-sort-model";
@Component({
  selector: 'employee-import-result',
  templateUrl: './employee-import-result.component.html',
  styleUrls: ['./employee-import-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeImportResultComponent extends BaseComponent implements OnInit {
    
  private _importResultList$: Observable<Immutable.List<EmployeeImportResult>>;
  private _recordsCount$: Observable<number>;
  private _dataTableOptions: DataTableOptions;
  private _loadingStatus: boolean;
  private _keys = Immutable.List(['FirstName', 'EmailorUsername', 'Errors']);
  private _pageNumber: number = 1;
  private _pageSize: number = 10;
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
  }

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
  set importHistoryList(importResultlist: Observable<Immutable.List<EmployeeImportResult>>) {
    this._importResultList$ = importResultlist;
  }
  get importHistoryList() {
    return this._importResultList$;
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
  

  get importResultList$(){
    return this._importResultList$;
  }

  get loadingStatus$(){
    return this._loadingStatus;
  }

  get dataTableOptions$(){
    return this._dataTableOptions;
  }

  get recordsCount$ (){
    return this._recordsCount$;
  }

get keys(){
  return this._keys;
}
  //End of Public properties

  //Public Output Bindings
  @Output('onClose') _onClose: EventEmitter<string> = new EventEmitter<string>();
  
  
//Public method

onViewResultsCancel() {
    this._onClose.emit('close');
  }

formatError = function (errors: Array<string>): string {
    if (!isNullOrUndefined(errors)) return '';
    let error = "<ul style='list-style: inherit !important; padding-left:20px;'>";

    errors.forEach((err) => {
      error = error + "<li style='list-style: inherit !important;'>" + err + "</li>";
    });
    error = error + "</ul>";
    return error;
  }
   onGridPaging($event) {
    this._pageNumber = $event.pageNumber;
    this._pageSize = $event.noOfRows;
    let atlasParams: AtlasParams[] = new Array();
    this._store.dispatch(new EmployeeImportHistoryLoadImportPaggingResultsAction(new AtlasApiRequestWithParams(this._pageNumber, this._pageSize, "", SortDirection.Descending, atlasParams)));
  }
//End of public methods

  ngOnInit() {
  }


}
