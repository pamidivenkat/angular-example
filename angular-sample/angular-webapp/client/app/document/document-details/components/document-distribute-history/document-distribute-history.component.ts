import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from "../../../../shared/base-component";
import { LocaleService, TranslationService } from 'angular-l10n';
import { Observable, Subscription } from "rxjs/Rx";
import * as Immutable from 'immutable';
import { AeSortModel, SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { DocumentDetailsService } from '../../../../document/document-details/services/document-details.service';
import { DistributionHistoryModel } from '../../../../document/document-details/models/document-details-model';
import { AePageChangeEventModel } from "../../../../atlas-elements/common/models/ae-page-change-event-model";
import { AtlasApiRequest } from "../../../..//shared/models/atlas-api-response";

@Component({
  selector: 'document-distribute-history',
  templateUrl: './document-distribute-history.component.html',
  styleUrls: ['./document-distribute-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DocumentDistributeHistoryComponent extends BaseComponent implements OnInit, OnDestroy {
  private _distributionHistoryListLoaded$: Observable<boolean>;
  private _distributionHistoryList$: Observable<Immutable.List<DistributionHistoryModel>>;
  private _recordsCount$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _keys = Immutable.List(['DocumentId', 'ActionedDate', 'DocumentVersion', 'RegardingObjectEntiyType', 'RegardingOjbectEntityValues', 'DistributedDocumentId']);
  private _pageNumber: number = 1;
  private _pageSize: number = 10;
  private _sortField: string = 'RegardingObjectEntiyType';
  private _sortDirection: SortDirection = SortDirection.Descending;
  private _distributionHistoryListLoadedSubscription: Subscription;

  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _documentDetailsService: DocumentDetailsService
  ) {
    super(_localeService, _translationService, _cdRef);
  }

  get distributionHistoryList$(): Observable<Immutable.List<DistributionHistoryModel>> {
    return this._distributionHistoryList$;
  }

  get recordsCount$(): Observable<number> {
    return this._recordsCount$;
  }

  get dataTableOptions$(): Observable<DataTableOptions> {
    return this._dataTableOptions$;
  }

  get distributionHistoryListLoaded$(): Observable<boolean> {
    return this._distributionHistoryListLoaded$;
  }

  get keys(): Immutable.List<string> {
    return this._keys;
  }

  ngOnInit() {

    this._distributionHistoryListLoaded$ = this._documentDetailsService.getDistributionHistoryLoadStatus();
    this._distributionHistoryList$ = this._documentDetailsService.loadDistributionHistoryList();
    this._recordsCount$ = this._documentDetailsService.loadDistributionHistoryTotalCount();
    this._dataTableOptions$ = this._documentDetailsService.loadDistributionHistoryDataTableOptions();

    this._distributionHistoryListLoadedSubscription = this._distributionHistoryListLoaded$.subscribe(status => {
      if (status) {
        this._documentDetailsService.dispatchDistributionHistoryList(new AtlasApiRequest(this._pageNumber, this._pageSize, this._sortField, this._sortDirection));
      }
    });
  }

  ngOnDestroy() {
    if (this._distributionHistoryListLoadedSubscription)
      this._distributionHistoryListLoadedSubscription.unsubscribe();
  }

  onGridPageChange(event: AePageChangeEventModel) {
    this._pageNumber = event.pageNumber;
    this._pageSize = event.noOfRows;
    this._documentDetailsService.dispatchDistributionHistoryList(new AtlasApiRequest(this._pageNumber, this._pageSize, this._sortField, this._sortDirection));
  }

  onGridSort(event: AeSortModel) {
    this._sortField = event.SortField;
    this._sortDirection = event.Direction;
    this._documentDetailsService.dispatchDistributionHistoryList(new AtlasApiRequest(this._pageNumber, this._pageSize, this._sortField, this._sortDirection));
  }

  removeDistributedDoc(distributedDocument) {
    this._documentDetailsService.dispatchDeleteDistributedDoc(distributedDocument);
  }

}
