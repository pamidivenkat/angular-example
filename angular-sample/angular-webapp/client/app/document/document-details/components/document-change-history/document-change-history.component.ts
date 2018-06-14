import { RouteParams } from './../../../../shared/services/route-params';
import { Document } from './../../../models/Document';
import { AeDataTableAction } from './../../../../atlas-elements/common/models/ae-data-table-action';
import { isNullOrUndefined } from 'util';
import { DocumentChangesEnum } from '../../../models/document-category-enum';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from "../../../../shared/base-component";
import { LocaleService, TranslationService } from 'angular-l10n';
import { Observable, Subscription, Subject } from "rxjs/Rx";
import * as Immutable from 'immutable';
import { ChangeHistoryModel } from '../../../../document/document-details/models/document-details-model';
import { AeSortModel, SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { DocumentDetailsService } from '../../../../document/document-details/services/document-details.service';
import { AeSelectItem } from "../../../../atlas-elements/common/models/ae-select-item";
import { AtlasParams, AtlasApiRequestWithParams } from "../../../../shared/models/atlas-api-response";
import { LoadDocumentChangeHistory } from "../../../../document/document-details/actions/document-details.actions";
import { mapYearsLookupTableToAeSelectItems } from "../../../../document/document-details/common/document-details-extract-helper";
import { FormGroup, FormBuilder } from "@angular/forms";
import { addOrUpdateAtlasParamValue } from '../../../../root-module/common/extract-helpers';
@Component({
  selector: 'document-change-history',
  templateUrl: './document-change-history.component.html',
  styleUrls: ['./document-change-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DocumentChangeHistoryComponent extends BaseComponent implements OnInit, OnDestroy {
  private _changeHistoryListLoaded$: Observable<boolean>;
  private _changeHistoryList$: Observable<Immutable.List<ChangeHistoryModel>>;
  private _recordsCount$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _keys = Immutable.List(['ChangedBy', 'Comment', 'CreatedOn', 'Id', 'LastChange', 'Version']);
  private _changePeriodYears: Immutable.List<AeSelectItem<number>> = Immutable.List([]);
  private _documentId: string;
  private _pageNumber: number = 1;
  private _pageSize: number = 10;
  private _sortField: string = 'Version';
  private _sortDirection: SortDirection = SortDirection.Descending;
  private _atlasParams: AtlasParams[];
  private _documentIdSubscription: Subscription;
  private _changeHistoryListLoadedSubscription: Subscription;
  private _documentChangeHistoryForm: FormGroup
  private _changeHistoryYears: AeSelectItem<number>[];
  private _firstTimeLoad: true;
  private _actions: Immutable.List<AeDataTableAction>;
  private _downloadActionCommand = new Subject();
  private _downloadActionCommandSub: Subscription;
  private _changeHistoryStatus: boolean;
  private _changeHistoryStatusSub: Subscription;
  private _apiRequest: AtlasApiRequestWithParams;

  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }
  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _documentDetailsService: DocumentDetailsService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
  }

  onGridPageChange($event) {
    this._apiRequest.PageNumber = $event.pageNumber;
    this._apiRequest.PageSize = $event.noOfRows;
    this._documentDetailsService.dispatchDocumentChangeHistoryList(this._apiRequest);
  }

  onGridSort($event: AeSortModel) {
    this._apiRequest.SortBy.SortField = $event.SortField;
    this._apiRequest.SortBy.Direction = $event.Direction;
    this._documentDetailsService.dispatchDocumentChangeHistoryList(this._apiRequest);
  }

  get documentChangeHistoryForm(): FormGroup {
    return this._documentChangeHistoryForm;
  }

  get changePeriodYears(): Immutable.List<AeSelectItem<number>> {
    return this._changePeriodYears;
  }

  get changeHistoryList$(): Observable<Immutable.List<ChangeHistoryModel>> {
    return this._changeHistoryList$;
  }

  get recordsCount$(): Observable<number> {
    return this._recordsCount$;
  }

  get dataTableOptions$(): Observable<DataTableOptions> {
    return this._dataTableOptions$;
  }

  get changeHistoryListLoaded$(): Observable<boolean> {
    return this._changeHistoryListLoaded$;
  }

  get keys(): Immutable.List<string> {
    return this._keys;
  }

  getEntityTemplate(entityId) {
    return DocumentChangesEnum[entityId];
  }

  ngOnInit() {
    this._actions = Immutable.List([
      new AeDataTableAction("Download", this._downloadActionCommand, false),
    ]);

    this._downloadActionCommandSub = this._downloadActionCommand.subscribe(document => {
      let doc = document as ChangeHistoryModel;
      if (!isNullOrUndefined(this._documentId)) {
        let url = this._routeParamsService.Cid ? `/filedownload?documentId=${this._documentId}&?isSystem=false&version=${doc.Version}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${this._documentId}&?isSystem=false&version=${doc.Version}`
        window.open(url);
      }
    });


    this._changeHistoryListLoaded$ = this._documentDetailsService.getDocumentChangeHistoryLoadStatus();
    this._documentDetailsService.getDocumentChangeHistoryLoadStatus().subscribe((val) => {
      this._changeHistoryStatus = val;
    });

    this._documentIdSubscription = this._documentDetailsService.loadDocumentDetails().subscribe(data => {
      if (!isNullOrUndefined(data)) {
        this._documentId = data.Id;
        this._atlasParams = new Array();
        this._atlasParams.push(new AtlasParams("DocumentId", this._documentId));
        this._atlasParams.push(new AtlasParams("Year", 0));
        this._apiRequest = new AtlasApiRequestWithParams(this._pageNumber
          , this._pageSize, this._sortField, this._sortDirection, this._atlasParams);
        this._changeHistoryYears = new Array();
        this._changeHistoryYears.push(new AeSelectItem<number>('Change period all', 0));
        let beginYear: number = new Date(data.CreatedOn).getFullYear();
        let endYear: number = new Date().getFullYear();
        for (let year = beginYear; year <= endYear; year++) {
          this._changeHistoryYears.push(new AeSelectItem<number>(year.toString(), year));
        }
        this._changePeriodYears = mapYearsLookupTableToAeSelectItems(this._changeHistoryYears);        
        if (!this._changeHistoryStatus) {
          this._documentDetailsService.dispatchDocumentChangeHistoryList(this._apiRequest);
        }
      }
    });


    this._documentChangeHistoryForm = this._fb.group({
      year: [{ value: 0, disabled: false }],
    });

    this._changeHistoryListLoaded$ = this._documentDetailsService.getDocumentChangeHistoryLoadStatus();
    this._changeHistoryList$ = this._documentDetailsService.loadDocumentChangeHistoryList();
    this._recordsCount$ = this._documentDetailsService.loadChangeHistoryTotalCount();
    this._dataTableOptions$ = this._documentDetailsService.loadChangeHistoryDataTableOptions();
  }

  ngOnDestroy() {
    if (this._downloadActionCommandSub)
      this._downloadActionCommandSub.unsubscribe();

    if (this._changeHistoryListLoadedSubscription)
      this._changeHistoryListLoadedSubscription.unsubscribe();

    if (this._documentIdSubscription)
      this._documentIdSubscription.unsubscribe();

    if (!isNullOrUndefined(this._changeHistoryStatusSub)) {
      this._changeHistoryStatusSub.unsubscribe();
    }
  }

  onYearDropdownChange(event) {
    this._apiRequest.Params = addOrUpdateAtlasParamValue(this._apiRequest.Params, 'Year', event.SelectedValue);
    this._documentDetailsService.dispatchDocumentChangeHistoryList(this._apiRequest);
  }
}
