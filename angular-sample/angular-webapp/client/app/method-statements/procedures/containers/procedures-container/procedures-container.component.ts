import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from './../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { LoadExampleProceduresTotalCountAction, LoadProceduresTotalCountAction } from './../../actions/procedure-actions';
import { Procedure } from '../../models/procedure';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute, NavigationExtras } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { SortDirection, AeSortModel } from './../../../../atlas-elements/common/models/ae-sort-model';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from "util";
import { ProcedureService } from '../../services/procedure.service';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
  selector: 'procedures-container',
  templateUrl: './procedures-container.component.html',
  styleUrls: ['./procedures-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ProceduresContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _showProcedureAddUpdateForm: boolean = false;
  private _operationMode: string = "add";
  private _selectedProcedure: Procedure;
  private _procedureCountSubscription: Subscription;
  private _exampleProcedureCountSubscription: Subscription;
  private _count: { procedure: number, exampleProcedure: number };
  private _routeSubscription: Subscription;
  private _isExampleFirstTimeLoad: boolean = true;
  private _isFirstTimeLoad: boolean = true;
  // End of Private Fields

  // Public properties
  get showProcedureAddUpdateForm(): boolean {
    return this._showProcedureAddUpdateForm;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Procedures;
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
    , private _activatedRoute: ActivatedRoute
    , private _router: Router
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _procedureService: ProcedureService
    , private _breadcrumbService: BreadcrumbService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  // Private methods
  canCreateProcedures(): boolean {
    if (this._claimsHelper.cancreateProcedures() == false && (this._router.url === '/method-statement/procedure/custom' || this._claimsHelper.HasCid)) {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      };
       this._router.navigate(['/method-statement/procedure/example'], navigationExtras);
    } else {
      return this._claimsHelper.cancreateProcedures();
    }
  }

  hasCid(): boolean {
    return this._claimsHelper.HasCid;
  }

  getProceduresUrl(): string {
    return 'custom';
  }
  getExampleProceduresUrl(): string {
    return 'example';
  }

  getProcedureCount() {
    if (!isNullOrUndefined(this._count)) {
      return this._count.procedure;
    }
  }

  getExampleProcedureCount() {
    if (!isNullOrUndefined(this._count)) {
      return this._count.exampleProcedure;
    }
  }

  isExampleProcedure() {
    return this._procedureService.isExampleProcedure;
  }

  getSlideoutState(): string {
    return (this._showProcedureAddUpdateForm) ? 'expanded' : 'collapsed';
  }

  addNewProcedure() {
    this._selectedProcedure = new Procedure();
    this._operationMode = 'add';
    this._showProcedureAddUpdateForm = true;
  }

  onProcedureAdd(e: any) {
    this._showProcedureAddUpdateForm = false;
  }

  onProcedureAddOrUpdateCancel(e: any) {
    this._showProcedureAddUpdateForm = false;
  }
  // End of private methods

  // Public methods
  public canCreateExampleProcedures(): boolean {
    return this._claimsHelper.cancreateExampleProcedures();
  }
  ngOnInit() {
    // const bcItem: IBreadcrumb = { label: 'Procedures', url: '/method-statement/procedures/' };
    // this._breadcrumbService.add(bcItem);
    super.ngOnInit();

    // if (this._claimsHelper.cancreateExampleProcedures()) {
    //   this._router.navigate(["methodstatements/procedures/example"]);
    // }

    this._procedureCountSubscription = this._store.let(fromRoot.getProcedureListTotalCount)
      .subscribe(data => {
        if (data) {
          this._count = Object.assign({}, this._count, { procedure: data });
        } else {
          if (this._isFirstTimeLoad) {
            this._isFirstTimeLoad = false;
            this._store.dispatch(new LoadProceduresTotalCountAction());
          }
        }
      });

    this._exampleProcedureCountSubscription = this._store.let(fromRoot.getExampleProcedureListTotalCountData)
      .subscribe(data => {
        if (data) {
          this._count = Object.assign({}, this._count, { exampleProcedure: data });
        } else {
          //load action to get the example total count...
          if (this._isExampleFirstTimeLoad) {
            this._isExampleFirstTimeLoad = false;
            this._store.dispatch(new LoadExampleProceduresTotalCountAction());
          }
        }
      });
  }
  ngOnDestroy() {
    this._procedureCountSubscription.unsubscribe();
    if (this._exampleProcedureCountSubscription) {
      this._exampleProcedureCountSubscription.unsubscribe();
    }
  }
  // End of public methods

}

