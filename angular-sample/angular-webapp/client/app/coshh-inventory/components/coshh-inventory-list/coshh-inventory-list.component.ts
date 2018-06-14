import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { Store } from '@ngrx/store';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { BaseElement } from '../../../atlas-elements/common/base-element';
import { BaseElementGeneric } from '../../../atlas-elements/common/base-element-generic';
import { extend } from 'webdriver-js-extender/built/lib';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { COSHHInventory } from "../../models/coshh-inventory";
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import * as fromRoot from '../../../shared/reducers';
import { LocaleService, TranslationService } from "angular-l10n";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { FormBuilder } from '@angular/forms';
import { BaseComponent } from './../../../shared/base-component';
import { AtlasApiRequest, AtlasParams } from './../../../shared/models/atlas-api-response';
import { SortDirection, AeSortModel } from './../../../atlas-elements/common/models/ae-sort-model';
import { COSHHInventoryLoad } from './../../actions/coshh-inventory.actions';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  ViewEncapsulation,
  Output,
  EventEmitter
} from '@angular/core';
import * as Immutable from 'immutable';


@Component({
  selector: "coshhinventory-list",
  templateUrl: "./coshh-inventory-list.component.html",
  styleUrls: ["./coshh-inventory-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CoshhInventoryListComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _coshhInventoryList$: Observable<Immutable.List<COSHHInventory>>;
  private _coshhInventoryDataTableOptions$: Observable<DataTableOptions>;
  private _coshhInventoryLoading$: Observable<boolean>;
  private _totalRecords$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _actions: Immutable.List<AeDataTableAction>;
  private _viewCoshhInventoryCommand = new Subject();
  private _updateCoshhInventoryCommand = new Subject();
  private _removeCoshhInventoryCommand = new Subject();
  private _slideoutState: boolean;
  private lightClass: AeClassStyle = AeClassStyle.Light;
  private darkClass: AeClassStyle = AeClassStyle.Dark;
  private _showDeleteConfirmDialog: boolean;
  private _actionType: string;
  private _coshhInventoryLoaded$: Observable<boolean>;
  private _currentCoshhInventoryApiRequest: AtlasApiRequest;

  private _viewCoshhInventorySubscription: Subscription;
  private _updateCoshhInventorySubscription: Subscription;
  private _removeCoshhInventorySubscription: Subscription;

  private _keys = Immutable.List(['Id', 'Substance', 'ReferenceNumber', 'Manufacturer', 'Quantity']);

  get coshhInventoryList$(): Observable<Immutable.List<COSHHInventory>>{
    return this._coshhInventoryList$;
  }

  get actions(): Immutable.List<AeDataTableAction>{
    return this._actions;
  }

  get totalRecords$(): Observable<number>{
    return this._totalRecords$;
  }

  get dataTableOptions$(): Observable<DataTableOptions>{
    return this._dataTableOptions$;
  }

  get coshhInventoryLoading$(): Observable<boolean>{
    return this._coshhInventoryLoading$;
  }

  get keys():any{
    return this._keys;
  }

  // output 
  @Output('onCoshhInventoryView') _onCoshhInventoryView: EventEmitter<COSHHInventory> = new EventEmitter<COSHHInventory>();
  @Output('onCoshhInventoryDelete') _onCoshhInventoryDelete: EventEmitter<COSHHInventory> = new EventEmitter<COSHHInventory>();
  @Output('onCoshhInventoryUpdate') _onCoshhInventoryUpdate: EventEmitter<COSHHInventory> = new EventEmitter<COSHHInventory>();
  // End of Private Fields

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _activatedRoute: ActivatedRoute
    , private _router: Router
    , private _fb: FormBuilder
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  private _loadInitialData() {
    this._currentCoshhInventoryApiRequest = new AtlasApiRequest(1, 10, 'Substance', SortDirection.Ascending);
    this._store.dispatch(new COSHHInventoryLoad(this._currentCoshhInventoryApiRequest));
  }
  
  onPageChange($event) {
    this._currentCoshhInventoryApiRequest.PageNumber = $event.pageNumber;
    this._currentCoshhInventoryApiRequest.PageSize = $event.noOfRows;
    this._store.dispatch(new COSHHInventoryLoad(this._currentCoshhInventoryApiRequest));
  }

onSort($event) {
    this._currentCoshhInventoryApiRequest.SortBy.SortField = $event.SortField;
    this._currentCoshhInventoryApiRequest.SortBy.Direction = $event.Direction;
    this._store.dispatch(new COSHHInventoryLoad(this._currentCoshhInventoryApiRequest));
  }

  private _setActions() {

    this._actions = Immutable.List([
      new AeDataTableAction("View", this._viewCoshhInventoryCommand, false),
      new AeDataTableAction("Update", this._updateCoshhInventoryCommand, false),
      new AeDataTableAction("Remove", this._removeCoshhInventoryCommand, false),
    ]);
  }



  ngOnInit() {
    this._loadInitialData();
    this._coshhInventoryLoading$ = this._store.let(fromRoot.getCOSHHInventoryListDataLoadingState);
    this._coshhInventoryList$ = this._store.let(fromRoot.getCOSHHInventoryListData);
    this._totalRecords$ = this._store.let(fromRoot.getCOSHHInventoryTotalRecordsCount);
    this._dataTableOptions$ = this._store.let(fromRoot.getCOSHHInventoryListDataTableOptions);

    this._viewCoshhInventorySubscription = this._viewCoshhInventoryCommand.subscribe(coshInvent => {
      this._onCoshhInventoryView.emit(coshInvent as COSHHInventory);
    });

    this._updateCoshhInventorySubscription = this._updateCoshhInventoryCommand.subscribe(coshInvent => {
      this._onCoshhInventoryUpdate.emit(coshInvent as COSHHInventory);
    });

    this._removeCoshhInventorySubscription = this._removeCoshhInventoryCommand.subscribe(coshInvent => {
      this._onCoshhInventoryDelete.emit(coshInvent as COSHHInventory);
    });
    this._setActions();
  }
  ngOnDestroy() {
    if (this._viewCoshhInventorySubscription) {
      this._viewCoshhInventorySubscription.unsubscribe();
    }
    if (this._updateCoshhInventorySubscription) {
      this._updateCoshhInventorySubscription.unsubscribe();
    }
    if (this._removeCoshhInventorySubscription) {
      this._removeCoshhInventorySubscription.unsubscribe();
    }
  }
}
