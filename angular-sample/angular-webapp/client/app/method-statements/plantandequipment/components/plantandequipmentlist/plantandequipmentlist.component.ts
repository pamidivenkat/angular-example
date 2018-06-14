import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { Observable } from "rxjs/Rx";
import { PlantAndEquipment } from "./../../models/plantandequipment";
import { DataTableOptions } from "../../../../atlas-elements/common/models/ae-datatable-options";
import { SortDirection, AeSortModel } from "../../../../atlas-elements/common/models/ae-sort-model";
import { AtlasParams, AtlasApiRequest } from "../../../../shared/models/atlas-api-response";
import { Subscription } from "rxjs/Subscription";
import { AeDataTableAction } from "../../../../atlas-elements/common/models/ae-data-table-action";
import { Subject } from "rxjs/Subject";
import { LoadSelectedPlantandequipmentAction, LoadPlantandequipmentAction } from "./../../actions/plantequipment-actions";
import { isNullOrUndefined } from "util";
import { PlantandequipmentService } from "./../../services/plantandequipment.service";

@Component({
  selector: 'plantandequipmentlist',
  templateUrl: './plantandequipmentlist.component.html',
  styleUrls: ['./plantandequipmentlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlantandequipmentlistComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _plantEquipmentListLoaded$: Observable<boolean>;
  private _plantEquipmentList$: Observable<Immutable.List<PlantAndEquipment>>;
  private _recordsCount$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _keys = Immutable.List(['Id', 'Name', 'AssetRefNo', 'UsedFor', 'SpecialRequirements']);
  private _pageNumber: number = 1;
  private _pageSize: number = 10;
  private _sortField: string = 'Name';
  private _sortDirection: SortDirection = SortDirection.Ascending;
  private _atlasParams: AtlasParams[];
  private _actions: Immutable.List<AeDataTableAction>;
  private _updatePlantEquipmentCommand = new Subject();
  private _removePlantEquipmentCommand = new Subject();
  private _viewPlantEquipmentCommand = new Subject();
  private _viewPlantEquipmentSubscription: Subscription;
  private _updatePlantEquipmentSubscription: Subscription;
  private _removePlantEquipmentSubscription: Subscription;

  // End of Private Fields

  get plantEquipmentListLoaded$(): Observable<boolean> {
    return this._plantEquipmentListLoaded$;
  }

  get keys(): any {
    return this._keys;
  }

  get plantEquipmentList$(): Observable<Immutable.List<PlantAndEquipment>>{
    return this._plantEquipmentList$;
  }

  get actions(): Immutable.List<AeDataTableAction>{
    return this._actions;
  }

  get recordsCount$(): Observable<number>{
    return this._recordsCount$;
  }

  get dataTableOptions$(): Observable<DataTableOptions>{
    return this._dataTableOptions$;
  }

  // output 

  @Output('onPlantEquipmentView') _onPlantEquipmentView: EventEmitter<PlantAndEquipment> = new EventEmitter<PlantAndEquipment>();
  @Output('onPlantEquipmentDelete') _onPlantEquipmentDelete: EventEmitter<PlantAndEquipment> = new EventEmitter<PlantAndEquipment>();
  @Output('onPlantEquipmentUpdate') _onPlantEquipmentUpdate: EventEmitter<PlantAndEquipment> = new EventEmitter<PlantAndEquipment>();


  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _plantEquipmentService: PlantandequipmentService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this._actions = Immutable.List([
      new AeDataTableAction("View", this._viewPlantEquipmentCommand, false),
      new AeDataTableAction("Update", this._updatePlantEquipmentCommand, false),
      new AeDataTableAction("Remove", this._removePlantEquipmentCommand, false)
    ]);

  }
  // End of constructor

  // Private methods  
  private _loadInitialData() {
    this._plantEquipmentService.loadPlantAndEquipmentList(new AtlasApiRequest(this._pageNumber, this._pageSize, this._sortField, this._sortDirection));
  }

  onGridPageChange($event) {
    this._pageNumber = $event.pageNumber;
    this._pageSize = $event.noOfRows;
    this._plantEquipmentService.loadPlantAndEquipmentList(new AtlasApiRequest(this._pageNumber, this._pageSize, this._sortField, this._sortDirection));
  }

  onGridSort($event: AeSortModel) {
    this._sortField = $event.SortField;
    this._sortDirection = $event.Direction;
    this._plantEquipmentService.loadPlantAndEquipmentList(new AtlasApiRequest(this._pageNumber, this._pageSize, this._sortField, this._sortDirection));
  }


  // End of private methods

  // Public methods
  ngOnInit() {

    this._loadInitialData();

    this._plantEquipmentListLoaded$ = this._store.let(fromRoot.getPlantAndEquipmentLoadStatus);
    this._plantEquipmentList$ = this._store.let(fromRoot.getPlantAndEquipmentList);
    this._recordsCount$ = this._store.let(fromRoot.getPlantAndEquipmentListTotalCount)
    this._dataTableOptions$ = this._store.let(fromRoot.getPlantAndEquipmentListListDataTableOptions);

    this._viewPlantEquipmentSubscription = this._viewPlantEquipmentCommand.subscribe(plantEqp => {
      this._onPlantEquipmentView.emit(plantEqp as PlantAndEquipment);
    });

    this._updatePlantEquipmentSubscription = this._updatePlantEquipmentCommand.subscribe(plantEqp => {
      this._onPlantEquipmentUpdate.emit(plantEqp as PlantAndEquipment);
    });

    this._removePlantEquipmentSubscription = this._removePlantEquipmentCommand.subscribe(plantEqp => {
      this._onPlantEquipmentDelete.emit(plantEqp as PlantAndEquipment);
    });
  }


  ngOnDestroy() {
    if (this._removePlantEquipmentSubscription) {
      this._removePlantEquipmentSubscription.unsubscribe();
    }
    if (this._updatePlantEquipmentSubscription) {
      this._updatePlantEquipmentSubscription.unsubscribe();
    }
    if (this._viewPlantEquipmentSubscription) {
      this._viewPlantEquipmentSubscription.unsubscribe();
    }
  }
  // End of public methods

}
