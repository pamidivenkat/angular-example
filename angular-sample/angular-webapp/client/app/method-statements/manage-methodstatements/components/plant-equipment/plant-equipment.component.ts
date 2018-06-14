import { CommonHelpers } from '../../../../shared/helpers/common-helpers';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { AeSortModel, SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import { MethodStatement } from './../../../models/method-statement';
import { PlantAndEquipment } from '../../../../method-statements/plantandequipment/models/plantandequipment';
import { AtlasApiRequestWithParams } from './../../../../shared/models/atlas-api-response';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { isNullOrUndefined } from "util";


@Component({
  selector: 'plant-equipment',
  templateUrl: './plant-equipment.component.html',
  styleUrls: ['./plant-equipment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlantEquipmentComponent extends BaseComponent implements OnInit, OnDestroy {

  private _slideoutState: boolean;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _actions: Immutable.List<AeDataTableAction>;
  private _removePlantEquipmentCommand = new Subject();
  private _methodStatementSubscription: Subscription;
  private _removePlantEquipmentSubscription: Subscription;
  private _methodStatement: MethodStatement;
  private _plantAndEquipmentData: BehaviorSubject<Immutable.List<PlantAndEquipment>>;
  private _dataTableOptions$: BehaviorSubject<DataTableOptions>;
  private _keys = Immutable.List(['Name', 'UsedFor', 'SpecialRequirements']);
  private _totalRecords$: BehaviorSubject<number>;
  private _pagingParams: Map<string, string>;
  private _sortParams: Map<string, string>;
  private _showPlantEquipmentDeleteModal: boolean = false;
  private _selectedPlantEquipment: PlantAndEquipment;
  private _methodStatementObject: MethodStatement;
  private _selectedList: Array<string>;
  private _plantAndEquipmentCompleteList: Array<PlantAndEquipment>;
  private _submitEventSubscription: Subscription;
  private _context: any;
  private _isModified: boolean = false;


  @Input('methodStatement')
  set methodStatement(val: MethodStatement) {
    this._methodStatementObject = val;
    this._loadInitialData();
  }
  get methodStatement() {
    return this._methodStatementObject;
  }

  @Input('context')
  set context(val: any) {
    this._context = val;
  }
  get context() {
    return this._context;
  }

  get lightClass() {
    return this._lightClass;
  }
  get defaultClass() {
    return AeClassStyle.Default;
  }
  get plantAndEquipmentData(): BehaviorSubject<Immutable.List<PlantAndEquipment>> {
    return this._plantAndEquipmentData;
  }

  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }

  get totalRecords$(): Observable<number> {
    return this._totalRecords$;
  }

  get dataTableOptions$(): DataTableOptions {
    return this._dataTableOptions$.getValue();
  }

  get keys(): any {
    return this._keys;
  }

  get showPlantEquipmentDeleteModal() {
    return this._showPlantEquipmentDeleteModal;
  }

  get selectedPlantEquipment() {
    return this._selectedPlantEquipment;
  }

  get slideoutState() {
    return this._slideoutState;
  }

  @Output('onPlantAndEquipmentSave')
  _savingMethodStatementObject: EventEmitter<MethodStatement>;

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this._plantAndEquipmentData = new BehaviorSubject(Immutable.List([]));
    this._dataTableOptions$ = new BehaviorSubject<DataTableOptions>(new DataTableOptions(1, 10));
    this._totalRecords$ = new BehaviorSubject(0);
    this._pagingParams = new Map<string, string>();
    this._sortParams = new Map<string, string>();
    this._selectedList = new Array();
    this._plantAndEquipmentCompleteList = new Array<PlantAndEquipment>();
    this._savingMethodStatementObject = new EventEmitter<MethodStatement>();
    this.id = 'Plant-Equipment';
    this.name = 'Plant-Equipment';
  }

  private _loadInitialData() {
    if (this._pagingParams.size <= 0) {
      this._pagingParams.set('pageNumber', '1');
      this._pagingParams.set('pageSize', '10');
    }

    if (this._sortParams.size <= 0) {
      this._sortParams.set('sortField', 'Name');
      this._sortParams.set('direction', SortDirection.Ascending.toString());
    }

    if (!isNullOrUndefined(this._methodStatementObject) &&
      !isNullOrUndefined(this._methodStatementObject.PlantEquipments)) {
      this._plantAndEquipmentCompleteList = [].splice(0).concat(this._methodStatementObject.PlantEquipments);
      this._selectedList = this._methodStatementObject.PlantEquipments.map((item) => item.Id);
    } else {
      this._plantAndEquipmentCompleteList = [].splice(0);
      this._selectedList = [];
    }
    this._loadGridData(this._plantAndEquipmentCompleteList);
  }

  private _getSortedSource(source: Array<PlantAndEquipment>
    , sortField: string
    , direction: SortDirection) {
    if (isNullOrUndefined(source) ||
      source.length < 1) {
      return source;
    }
    return CommonHelpers.sortArray(source, sortField, direction);
  }

  private _loadGridData(source: Array<PlantAndEquipment>) {
    let dataSource: Array<PlantAndEquipment> = [];

    source = source || [];

    let sortField = this._sortParams.get('sortField');
    let direction = this._sortParams.get('direction') == SortDirection.Ascending.toString()
      ? SortDirection.Ascending
      : SortDirection.Descending;
    dataSource = this._getSortedSource(source, sortField, direction);

    let pageNumber = parseInt(this._pagingParams.get('pageNumber'), 10);
    let pageSize = parseInt(this._pagingParams.get('pageSize'), 10);
    dataSource = this._getPaginatedSource(dataSource, pageSize, pageNumber);
    let count = (!isNullOrUndefined(source)
      ? source.length
      : 0);
    let datatableOptions = new DataTableOptions(pageNumber, pageSize, sortField, direction);

    this._dataTableOptions$.next(datatableOptions);
    if (pageNumber === 1) {
      this._totalRecords$.next(count);
    }
    this._plantAndEquipmentData.next(Immutable.List(dataSource));
  }

  private _getPaginatedSource(source: Array<PlantAndEquipment>
    , pageSize: number
    , pageNumber: number) {
    if (isNullOrUndefined(source) ||
      source.length < 1) {
      return source;
    }
    let currentPageNumber = pageNumber - 1;
    return source.slice(currentPageNumber * pageSize, (pageNumber) * pageSize);
  }

  onPageChange($event) {
    this._pagingParams.set('pageNumber', $event.pageNumber);
    this._pagingParams.set('pageSize', $event.noOfRows);
    this._loadGridData(this._plantAndEquipmentCompleteList);
  }

  onSort($event) {
    this._sortParams.set('sortField', $event.SortField);
    this._sortParams.set('direction', $event.Direction);
    this._pagingParams.set('pageNumber', '1');
    this._loadGridData(this._plantAndEquipmentCompleteList);
  }

  openPlantAndEquipmentSlideOut() {
    this._slideoutState = true;
  }

  getSlideoutState(): string {
    return this._slideoutState ? 'expanded' : 'collapsed';
  }

  closePlantAndEquipmentSlideOut(e) {
    this._slideoutState = false;
  }

  modalClosed(event) {
    this._showPlantEquipmentDeleteModal = false;
    if (event == 'Yes') {
      this._isModified = true;
      this._pagingParams.set('pageNumber', '1');
      this._plantAndEquipmentCompleteList = this._plantAndEquipmentCompleteList.filter((item) => {
        return item.Id.toLowerCase() !== this._selectedPlantEquipment.Id.toLowerCase();
      });

      this._selectedList = this._selectedList.filter((id) => {
        return id.toLowerCase() !== this._selectedPlantEquipment.Id.toLowerCase();
      });

      this._loadGridData(this._plantAndEquipmentCompleteList);
    }
  }


  displayGridData(data: Array<PlantAndEquipment>) {
    this._plantAndEquipmentCompleteList = this._plantAndEquipmentCompleteList.concat(data);
    this._loadGridData(this._plantAndEquipmentCompleteList);
    // this._plantAndEquipmentData.next(Immutable.List<PlantAndEquipment>(this._plantAndEquipmentCompleteList));
  }

  selectedIdList(selectedList: Array<string>) {
    if (!isNullOrUndefined(selectedList))
      this._isModified = true;
    this._selectedList = this._selectedList.concat(selectedList);
  }

  getSelectedList() {
    return this._selectedList;
  }

  ngOnInit() {
    this._methodStatementSubscription = this._store.let(fromRoot.getManageMethodStatementData).takeUntil(this._destructor$).subscribe((ms) => {
      this._methodStatement = ms;
    });

    this._actions = Immutable.List([
      new AeDataTableAction('Remove', this._removePlantEquipmentCommand, false)
    ]);

    this._removePlantEquipmentSubscription = this._removePlantEquipmentCommand.takeUntil(this._destructor$).subscribe(plantEqp => {
      this._selectedPlantEquipment = plantEqp as PlantAndEquipment;
      this._showPlantEquipmentDeleteModal = true;
      this._isModified = true;
    });

    this._submitEventSubscription = this._context.submitEvent.takeUntil(this._destructor$).subscribe((value) => {
      if (!isNullOrUndefined(this._methodStatementObject)) {
        this._methodStatementObject.PlantEquipments = this._plantAndEquipmentCompleteList;
        if (value && this._isModified === true) {
          this._savingMethodStatementObject.emit(this._methodStatementObject);
        }
      }
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

}
