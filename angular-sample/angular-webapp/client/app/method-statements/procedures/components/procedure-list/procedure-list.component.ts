import { RouteParams } from '../../../../shared/services/route-params';
import { addOrUpdateAtlasParamValue } from '../../../../root-module/common/extract-helpers';
import { LoadProcedureGroupAction } from './../../../../shared/actions/lookup.actions';
import { isNullOrUndefined } from 'util';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { Observable } from "rxjs/Observable";
import { Procedure } from "../../../../method-statements/procedures/models/procedure";
import { DataTableOptions } from "../../../../atlas-elements/common/models/ae-datatable-options";
import { AeDataTableAction } from "../../../../atlas-elements/common/models/ae-data-table-action";
import { Subject } from "rxjs/Subject";
import { ProcedureService } from "../../../../method-statements/procedures/services/procedure.service";
import { Subscription } from "rxjs/Subscription";
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { SortDirection, AeSortModel } from './../../../../atlas-elements/common/models/ae-sort-model';
import { LoadProceduresAction, RemoveProcedureAction, LoadProcedureByIdAction, LoadExampleProceduresTotalCountAction } from './../../actions/procedure-actions';
import { StringHelper } from "../../../../shared/helpers/string-helper";
import { AeClassStyle } from "../../../../atlas-elements/common/ae-class-style.enum";


@Component({
  selector: 'procedure-list',
  templateUrl: './procedure-list.component.html',
  styleUrls: ['./procedure-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcedureListComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _procedurStore$: Observable<Immutable.List<Procedure>>;
  private _totalRecords$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _procedureLoading$: Observable<boolean>;
  private _actions: Immutable.List<AeDataTableAction>;
  private _keys = Immutable.List(['Id', 'Name', 'ProcedureGroupName']);
  private _viewProcedureCommand = new Subject();
  private _updateProcedureCommand = new Subject();
  private _removeProcedureCommand = new Subject();
  private _copyProcedureCommand = new Subject();
  private _currentProcedureApiRequest: AtlasApiRequestWithParams;
  private _showProcedureViewSlideOut: boolean = false;
  private _showProcedureCopySlideOut: boolean = false;
  private _showProcedureUpdateSlideOut: boolean = false;
  private _procedureSubscription: Subscription;
  private _selectedProcedure: Procedure;
  private _viewProcedureSubscription: Subscription;
  private _updateProcedureSubscription: Subscription;
  private _removeProcedureSubscription: Subscription;
  private _copyProcedureSubscription: Subscription;
  private _isExample: boolean;
  private _procedureGroupSubscription: Subscription;
  private _procedureGroups$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _procedureListForm: FormGroup;
  private _routeSubscription: Subscription;
  private _procedureForValuChangeSubscription: Subscription;
  private _loadedSelectedProcedureFullEntity: Procedure = new Procedure();
  private _action: string;
  private _loadedSelectedProcedureFullEntitySub: Subscription;
  private _showProcedureDeleteModal: boolean = false;
  private _cid: string;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _isFirstTimeLoad: boolean = true;
  // End of Private Fields

  // Public properties
  get showProcedureDeleteModal(): boolean {
    return this._showProcedureDeleteModal;
  }
  get showProcedureUpdateSlideOut(): boolean {
    return this._showProcedureUpdateSlideOut;
  }
  get showProcedureCopySlideOut(): boolean {
    return this._showProcedureCopySlideOut;
  }
  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }
  get procedureListForm(): FormGroup {
    return this._procedureListForm
  }
  get selectedProcedure(): Procedure {
    return this._selectedProcedure;
  }
  get totalRecords$(): Observable<number> {
    return this._totalRecords$;
  }
  get keys(): any {
    return this._keys;
  }

  get showProcedureViewSlideOut(): boolean {
    return this._showProcedureViewSlideOut;
  }
  get procedureLoading$() {
    return this._procedureLoading$;
  }
  get dataTableOptions$(): Observable<DataTableOptions> {
    return this._dataTableOptions$;
  }
  get procedurStore$(): Observable<Immutable.List<Procedure>> {
    return this._procedurStore$;
  }
  get loadedSelectedProcedureFullEntity(): Procedure {
    return this._loadedSelectedProcedureFullEntity;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get procedureGroups$(): Observable<Immutable.List<AeSelectItem<string>>> {
    return this._procedureGroups$;
  }

  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _activatedRoute: ActivatedRoute
    , private _router: Router
    , private _fb: FormBuilder
    , private _procedureService: ProcedureService
    , private _routeParams: RouteParams
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  // Private methods  

  private _loadInitialData() {
    if (this._claimsHelper.cancreateExampleProcedures() && !this._claimsHelper.cancreateProcedures()) {
      this._isExample = true;
      //this._router.navigate(["methodstatement/procedures/example"]);
    }
    this._currentProcedureApiRequest = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams("example", this._isExample)]);
    this._store.dispatch(new LoadProceduresAction(this._currentProcedureApiRequest));
  }

  getProceduresSlideoutState() {
    return this._showProcedureViewSlideOut || this._showProcedureCopySlideOut || this._showProcedureUpdateSlideOut ? 'expanded' : 'collapsed';
  }

  getSlideoutAnimateState() {
    return this._showProcedureViewSlideOut || this._showProcedureCopySlideOut || this._showProcedureUpdateSlideOut;

  }
  onProcedureSlideCancel(event: any) {
    this._showProcedureViewSlideOut = false;
    this._showProcedureCopySlideOut = false;
    this._showProcedureUpdateSlideOut = false;
    this._action = "";
  }

  onPageChange($event) {
    this._currentProcedureApiRequest.PageNumber = $event.pageNumber;
    this._currentProcedureApiRequest.PageSize = $event.noOfRows;
    this._store.dispatch(new LoadProceduresAction(this._currentProcedureApiRequest));
  }

  onSort($event) {
    this._currentProcedureApiRequest.SortBy.SortField = $event.SortField;
    this._currentProcedureApiRequest.SortBy.Direction = $event.Direction;
    this._store.dispatch(new LoadProceduresAction(this._currentProcedureApiRequest));
  }

  private _initForm() {
    this._procedureListForm = this._fb.group({
      proceduregroup: [{ value: '', disabled: false }]
    });
  }

  onProcedureCopy(procedureToSave: Procedure) {
    //here based on who is trying to copy example we should set the respective example flag to false
    //if someone who has can create example procedures is copying example when cid exists then example should be set as false..
    //only in the scenario where user ( who can create example procedures) is copying an example without cid.. then we should set isExample=true..
    if (!this._routeParams.Cid && this._claimsHelper.cancreateExampleProcedures() && procedureToSave.IsExample)
      procedureToSave.IsExample = true;
    else
      procedureToSave.IsExample = false;
    //now set the company id...
    procedureToSave.CompanyId = this._routeParams.Cid ? this._routeParams.Cid : this._claimsHelper.getCompanyId();
    this._procedureService.copyProcedureDetails(procedureToSave);
    this._showProcedureCopySlideOut = false;
  }

  modalClosed($event) {
    this._showProcedureDeleteModal = false;
    if ($event == 'yes') {
      this._store.dispatch(new RemoveProcedureAction(this._selectedProcedure));
    }
  }

  private _setActions() {
    if (!this._isExample) {
      this._actions = Immutable.List([
        new AeDataTableAction("View", this._viewProcedureCommand, false),
        new AeDataTableAction("Update", this._updateProcedureCommand, false),
        new AeDataTableAction("Copy", this._copyProcedureCommand, false),
        new AeDataTableAction("Remove", this._removeProcedureCommand, false)
      ]);
    } else {
      //user is viewing the examples so only user who has respective permission should see update , remove buttons 
      if (this._claimsHelper.cancreateExampleProcedures()) {
        this._actions = Immutable.List([
          new AeDataTableAction("View", this._viewProcedureCommand, false),
          new AeDataTableAction("Update", this._updateProcedureCommand, false),
          new AeDataTableAction("Copy", this._copyProcedureCommand, false),
          new AeDataTableAction("Remove", this._removeProcedureCommand, false)
        ]);
      } else {
        //not have create example permisions
        this._actions = Immutable.List([
          new AeDataTableAction("View", this._viewProcedureCommand, false),
          new AeDataTableAction("Copy", this._copyProcedureCommand, false)
        ]);
      }
    }
  }
  // End of private methods
  // Public methods
  ngOnInit(): void {
    if (this._claimsHelper.cancreateExampleProcedures() && !this._claimsHelper.cancreateProcedures())
      this._isExample = true;
    this._routeSubscription = this._activatedRoute.url.subscribe((path) => {
      if (path.find(obj => obj.path.indexOf('example') >= 0)) {
        this._isExample = true;
      } else {
        this._isExample = false;
      }
      this._procedureService.isExampleProcedure = this._isExample;
      this._setActions();
      this._loadInitialData();
    });

    this._initForm();
    this._procedureLoading$ = this._store.let(fromRoot.getProcedureListLoadingState);
    this._procedurStore$ = this._store.let(fromRoot.getProcedureListData);
    this._totalRecords$ = this._store.let(fromRoot.getProcedureListDataTotalCountData);
    this._dataTableOptions$ = this._store.let(fromRoot.getProcedureListDataTableOptions);
    this._procedureGroups$ = this._store.let(fromRoot.getProcedureGroupsData);

    this._loadedSelectedProcedureFullEntitySub = this._store.let(fromRoot.getSelectedFullEnityProcedureData).subscribe((selectedFullEntity) => {
      this._loadedSelectedProcedureFullEntity = selectedFullEntity;
      if (selectedFullEntity) {
        if (this._action == 'update') {
          this._showProcedureUpdateSlideOut = true;
        }
        else if (this._action == 'view') {
          this._showProcedureViewSlideOut = true;
        }
        else if (this._action == 'copy') {
          this._showProcedureCopySlideOut = true;
        }
      }
    })
    this._procedureGroupSubscription = this._store.let(fromRoot.getProcedureGroupsData).subscribe((groups) => {
      if (isNullOrUndefined(groups)) {
        this._store.dispatch(new LoadProcedureGroupAction());
      }
    });

    this._procedureForValuChangeSubscription = this._procedureListForm.valueChanges.subscribe(data => {
      this._currentProcedureApiRequest.PageNumber = 1;
      this._currentProcedureApiRequest.Params = addOrUpdateAtlasParamValue(this._currentProcedureApiRequest.Params, 'ProcedureGroup', data.proceduregroup);
      this._store.dispatch(new LoadProceduresAction(this._currentProcedureApiRequest));

    });

    this._viewProcedureSubscription = this._viewProcedureCommand.subscribe(procedure => {
      this._selectedProcedure = procedure as Procedure;
      this._action = 'view';
      if (isNullOrUndefined(this._loadedSelectedProcedureFullEntity) || this._selectedProcedure.Id != this._loadedSelectedProcedureFullEntity.Id) {
        //despatch the action to load the full entity
        this._store.dispatch(new LoadProcedureByIdAction(this._selectedProcedure));
      } else {
        this._showProcedureViewSlideOut = true;
      }
    });
    this._copyProcedureSubscription = this._copyProcedureCommand.subscribe(procedure => {
      this._selectedProcedure = procedure as Procedure;
      this._action = 'copy';
      if (isNullOrUndefined(this._loadedSelectedProcedureFullEntity) || this._selectedProcedure.Id != this._loadedSelectedProcedureFullEntity.Id) {
        //despatch the action to load the full entity
        this._store.dispatch(new LoadProcedureByIdAction(this._selectedProcedure));
      } else {
        this._showProcedureCopySlideOut = true;
      }
    });
    this._updateProcedureSubscription = this._updateProcedureCommand.subscribe(procedure => {
      this._selectedProcedure = procedure as Procedure;
      this._action = 'update';
      if (isNullOrUndefined(this._loadedSelectedProcedureFullEntity) || this._selectedProcedure.Id != this._loadedSelectedProcedureFullEntity.Id) {
        //despatch the action to load the full entity
        this._store.dispatch(new LoadProcedureByIdAction(this._selectedProcedure));
      } else {
        this._showProcedureUpdateSlideOut = true;
      }

    });
    this._removeProcedureSubscription = this._removeProcedureCommand.subscribe(procedure => {
      this._selectedProcedure = procedure as Procedure;
      this._showProcedureDeleteModal = true;
    });
  }

  ngOnDestroy() {
    if (this._viewProcedureSubscription) {
      this._viewProcedureSubscription.unsubscribe();
    }
    if (this._copyProcedureSubscription) {
      this._copyProcedureSubscription.unsubscribe();
    }
    if (this._procedureGroupSubscription) {
      this._procedureGroupSubscription.unsubscribe();
    }
    if (this._routeSubscription) {
      this._routeSubscription.unsubscribe();
    }
    if (this._procedureForValuChangeSubscription) {
      this._procedureForValuChangeSubscription.unsubscribe();
    }
    if (this._loadedSelectedProcedureFullEntitySub) {
      this._loadedSelectedProcedureFullEntitySub.unsubscribe();
    }
    if (this._viewProcedureSubscription) {
      this._viewProcedureSubscription.unsubscribe();
    }
    if (this._copyProcedureSubscription) {
      this._copyProcedureSubscription.unsubscribe();
    }
    if (this._updateProcedureSubscription) {
      this._updateProcedureSubscription.unsubscribe();

    }
    if (this._removeProcedureSubscription) {
      this._removeProcedureSubscription.unsubscribe();
    }
  }
  // End of public methods
}
