import { LocalizationConfig, initLocalizationWithAdditionProviders } from './../../../shared/localization-config';
import { select } from '@ngrx/core/operator/select';
import { addOrUpdateAtlasParamValue } from '../../../root-module/common/extract-helpers';
import { isNullOrUndefined } from 'util';
import { LoadMethodStatementsListAction, LoadMethodStatementsTabChangeAction, RemoveMethodStatementAction, UpdateStatusMethodStatementAction, CopyMethodStatementAction } from './../../actions/methodstatements.actions';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../shared/models/atlas-api-response';
import { RouteParams } from './../../../shared/services/route-params';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import * as fromRoot from './../../../shared/reducers';
import * as Immutable from 'immutable';
import { Store } from "@ngrx/store";
import { Subscription, Observable, Subject } from 'rxjs/Rx';
import { MethodStatements, UpdateStatusModel, MethodStatement, MethodStatementStatus } from './../../models/method-statement';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import { AeDataTableAction } from './../../../atlas-elements/common/models/ae-data-table-action';
import { AeClassStyle } from './../../../atlas-elements/common/ae-class-style.enum';
import { RiskAssessmentStatus } from './../../../risk-assessment/common/risk-assessment-status.enum';

@Component({
  selector: 'manage-list',
  templateUrl: './manage-list.component.html',
  styleUrls: ['./manage-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageListComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _getHasMSFiltersChangedDataSub: Subscription;
  private _routeSubscription: Subscription;
  private _byStatusId: number;
  private _methodStatementsApiRequest: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, []);
  private _methodStatementsListSubscription: Subscription;
  private _methodStatementsList$: Observable<Immutable.List<MethodStatements>>;
  private _methodStatementsListDataTableOptions$: Observable<DataTableOptions>;
  private _methodStatementsListTotalCount$: Observable<number>;
  private _keys = Immutable.List(['Id', 'Name', 'Description', 'ClientName', 'SiteName', 'StatusId', 'StartDate', 'EndDate', 'CompanyId', 'NewLocationOfWork']);
  private _actions: Immutable.List<AeDataTableAction>;
  private _viewMethodStatements = new Subject();
  private _updateMethodStatementsCommand = new Subject();
  private _removeMethodStatementSubscription: Subscription;
  private _archieveMethodStatementSubscription: Subscription;
  private _reinstateMethodStatementSubscription: Subscription;
  private _removeMethodStatementCommand = new Subject();
  private _archieveMethodStatementsCommand = new Subject();
  private _reinstateMethodStatementsCommand = new Subject();
  private _selectedMethodStatement: MethodStatements;
  private _showMethodStatementDeleteModal: boolean = false;
  private _dataToSave: UpdateStatusModel;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _darkClass: AeClassStyle = AeClassStyle.Dark;
  private _copyMethodStatementCommand = new Subject();
  private _copyMethodStatementSubscription: Subscription;
  private _showMSCopySlideOut: boolean;
  private _copiedMethodStatementSubscription: Subscription;
  private _updateMethodStatementsSubscription: Subscription;
  private _updateExampleMethodStatementsCommand = new Subject();
  private _updateExampleMethodStatementsSubscription: Subscription;
  private _cidExists: boolean;
  private _viewMethodStatementsSubscription: Subscription;
  private _tabName: string;


  // End of Private Fields

  // Public properties
  get methodStatementsApiRequest() {
    return this._methodStatementsApiRequest;
  }
  get dataToSave() {
    return this._dataToSave;
  }
  get cidExists(): boolean {
    return this._cidExists;
  }
  get tabName(): string {
    return this._tabName;
  }

  get methodStatementsList$(): Observable<Immutable.List<MethodStatements>> {
    return this._methodStatementsList$;
  }
  set methodStatementsList$(val: Observable<Immutable.List<MethodStatements>>) {
    this._methodStatementsList$ = val;
  }
  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }

  get methodStatementsListTotalCount$(): Observable<number> {
    return this._methodStatementsListTotalCount$;
  }
  set methodStatementsListTotalCount$(val: Observable<number>) {
    this._methodStatementsListTotalCount$ = val;
  }
  get methodStatementsListDataTableOptions$(): Observable<DataTableOptions> {
    return this._methodStatementsListDataTableOptions$;
  }
  set methodStatementsListDataTableOptions$(val: Observable<DataTableOptions>) {
    this._methodStatementsListDataTableOptions$ = val;
  }
  get keys(): any {
    return this._keys;
  }

  get lightClass() {
    return this._lightClass;
  }

  get darkClass() {
    return this._darkClass;
  }
  set byStatusId(val: number) {
    this._byStatusId = 1;
  }
  get byStatusId() {
    return this._byStatusId;
  }
  get ShowMSCopySlideOut() {
    return this._showMSCopySlideOut;
  }
  // End of Public properties

  // Public Output bindings
  @Output('copy')
  copy: EventEmitter<MethodStatements> = new EventEmitter<MethodStatements>();

  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(
    protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _activatedRoute: ActivatedRoute
    , private _router: Router
    , private _routeParams: RouteParams
  ) {   
    super(_localeService, _translationService, _changeDetectordRef);
    this.id='msListComp';
    this.name='msListComp';
    this._dataToSave = new UpdateStatusModel();
  }
  // End of constructor

  // Private methods  
  _getStatusName(ms: MethodStatements) {
    let statusName: string;
    if (ms.IsExample) {
      statusName = 'example';
    } else {
      switch (ms.StatusId) {
        case MethodStatementStatus.Live:
          statusName = 'live';
          break;
        case MethodStatementStatus.Pending:
          statusName = 'pending';
          break;
        case MethodStatementStatus.Completed:
          statusName = 'completed';
          break;
        case MethodStatementStatus.Archieved:
          statusName = 'archived';
          break;
        case MethodStatementStatus.Example:
          statusName = 'example';
          break;
        default:
          statusName = 'pending';
          break;
      }
    }
    return statusName;
  }

  onGridPaging(pageinfo) {
    this._methodStatementsApiRequest.PageNumber = pageinfo.pageNumber;
    this._methodStatementsApiRequest.PageSize = pageinfo.noOfRows;
    this._store.dispatch(new LoadMethodStatementsListAction(this._methodStatementsApiRequest));
  }

  onGridSorting(sortInfo) {
    this._methodStatementsApiRequest.SortBy.SortField = sortInfo.SortField;
    this._methodStatementsApiRequest.SortBy.Direction = sortInfo.Direction;
    this._store.dispatch(new LoadMethodStatementsListAction(this._methodStatementsApiRequest));
  }

  private _loadInitialData() {

    if (this._byStatusId === -1) {
      this._methodStatementsApiRequest.Params = addOrUpdateAtlasParamValue(this._methodStatementsApiRequest.Params, 'ByStatusId', '');
      this._methodStatementsApiRequest.Params = addOrUpdateAtlasParamValue(this._methodStatementsApiRequest.Params, 'isexample', 'true');
    } else {
      this._methodStatementsApiRequest.Params = addOrUpdateAtlasParamValue(this._methodStatementsApiRequest.Params, 'ByStatusId', this._byStatusId);
      this._methodStatementsApiRequest.Params = addOrUpdateAtlasParamValue(this._methodStatementsApiRequest.Params, 'isexample', '');
    }
    this._store.dispatch(new LoadMethodStatementsTabChangeAction(this._methodStatementsApiRequest));

    if (this._byStatusId == 1) {
      if (isNullOrUndefined(this._methodStatementsListSubscription)) {
        this._methodStatementsListSubscription = this._store.let(fromRoot.getLiveMethodStatementsList).takeUntil(this._destructor$).subscribe(methodStatements => {
          if (!methodStatements) {
            this._store.dispatch(new LoadMethodStatementsListAction(this._methodStatementsApiRequest));
          }
        });
      }
      this._methodStatementsList$ = this._store.let(fromRoot.getLiveMethodStatementsList);
      this._methodStatementsListDataTableOptions$ = this._store.let(fromRoot.getLiveMethodStatementsListDataTableOptions);
      this._methodStatementsListTotalCount$ = this._store.let(fromRoot.getLiveMethodStatementsListTotalCount);

    } else if (this._byStatusId == 0) {
      if (isNullOrUndefined(this._methodStatementsListSubscription)) {
        this._methodStatementsListSubscription = this._store.let(fromRoot.getPendingMethodStatementsList).takeUntil(this._destructor$).subscribe(methodStatements => {
          if (!methodStatements) {
            this._store.dispatch(new LoadMethodStatementsListAction(this._methodStatementsApiRequest));
          }
        });
      }
      this._methodStatementsList$ = this._store.let(fromRoot.getPendingMethodStatementsList);
      this._methodStatementsListDataTableOptions$ = this._store.let(fromRoot.getPendingMethodStatementsListDataTableOptions);
      this._methodStatementsListTotalCount$ = this._store.let(fromRoot.getPendingMethodStatementsListTotalCount);

    } else if (this._byStatusId == 3) {
      if (isNullOrUndefined(this._methodStatementsListSubscription)) {
        this._methodStatementsListSubscription = this._store.let(fromRoot.getCompletedMethodStatementsList).takeUntil(this._destructor$).subscribe(methodStatements => {
          if (!methodStatements) {
            this._store.dispatch(new LoadMethodStatementsListAction(this._methodStatementsApiRequest));
          }
        });
      }
      this._methodStatementsList$ = this._store.let(fromRoot.getCompletedMethodStatementsList);
      this._methodStatementsListDataTableOptions$ = this._store.let(fromRoot.getCompletedMethodStatementsListDataTableOptions);
      this._methodStatementsListTotalCount$ = this._store.let(fromRoot.getCompletedMethodStatementsListTotalCount);

    } else if (this._byStatusId == 4) {
      if (isNullOrUndefined(this._methodStatementsListSubscription)) {
        this._methodStatementsListSubscription = this._store.let(fromRoot.getArchivedMethodStatementsList).takeUntil(this._destructor$).subscribe(methodStatements => {
          if (!methodStatements) {
            this._store.dispatch(new LoadMethodStatementsListAction(this._methodStatementsApiRequest));
          }
        });
      }
      this._methodStatementsList$ = this._store.let(fromRoot.getArchivedMethodStatementsList);
      this._methodStatementsListDataTableOptions$ = this._store.let(fromRoot.getArchivedMethodStatementsListDataTableOptions);
      this._methodStatementsListTotalCount$ = this._store.let(fromRoot.getArchivedMethodStatementsListTotalCount);
    } else {
      if (isNullOrUndefined(this._methodStatementsListSubscription)) {
        this._methodStatementsListSubscription = this._store.let(fromRoot.getExampleMethodStatementsList).takeUntil(this._destructor$).subscribe(methodStatements => {
          if (!methodStatements) {
            this._store.dispatch(new LoadMethodStatementsListAction(this._methodStatementsApiRequest));
          }
        });
      }

      this._methodStatementsList$ = this._store.let(fromRoot.getExampleMethodStatementsList);
      this._methodStatementsListDataTableOptions$ = this._store.let(fromRoot.getExampleMethodStatementsListDataTableOptions);
      this._methodStatementsListTotalCount$ = this._store.let(fromRoot.getExampleMethodStatementsListTotalCount);
    }
  }

  // End of private methods
  // Public methods
  get showMethodStatementDeleteModal() {
    return this._showMethodStatementDeleteModal;
  }

  get selectedMethodStatement() {
    return this._selectedMethodStatement;
  }

  modalClosed(event) {
    this._showMethodStatementDeleteModal = false;
    if (event == 'Yes')
      this._store.dispatch(new RemoveMethodStatementAction({ MethodStatements: this._selectedMethodStatement, AtlasApiRequestWithParams: this._methodStatementsApiRequest }));
  }


  ngOnInit() {

    this._cidExists = !(isNullOrUndefined(this._routeParams.Cid));
    if (isNullOrUndefined(this._methodStatementsApiRequest))
      this._methodStatementsApiRequest = <AtlasApiRequestWithParams>{};

    this._routeSubscription = this._activatedRoute.url.takeUntil(this._destructor$).subscribe((path) => {
      if (path.find(obj => obj.path.indexOf('live') >= 0)) {
        this._tabName = 'METHOD_STATEMENTS_MANAGE.LIVE_TAB_MSG';
        this._byStatusId = 1;
        this._actions = Immutable.List([
          new AeDataTableAction("View", this._viewMethodStatements, false),
          new AeDataTableAction("Copy", this._copyMethodStatementCommand, false),
          new AeDataTableAction("Archive", this._archieveMethodStatementsCommand, false),
        ]);
      } else if (path.find(obj => obj.path.indexOf('pending') >= 0)) {
        this._tabName = 'METHOD_STATEMENTS_MANAGE.PENDING_TAB_MSG';
        this._byStatusId = 0;
        this._actions = Immutable.List([
          new AeDataTableAction("View", this._viewMethodStatements, false),
          new AeDataTableAction("Copy", this._copyMethodStatementCommand, false),
          new AeDataTableAction("Update", this._updateMethodStatementsCommand, false),
          new AeDataTableAction("Remove", this._removeMethodStatementCommand, false),
        ]);
      } else if (path.find(obj => obj.path.indexOf('completed') >= 0)) {
        this._tabName = 'METHOD_STATEMENTS_MANAGE.COMPLETED_TAB_MSG';
        this._byStatusId = 3;
        this._actions = Immutable.List([
          new AeDataTableAction("View", this._viewMethodStatements, false),
          new AeDataTableAction("Copy", this._copyMethodStatementCommand, false),
          new AeDataTableAction("Archive", this._archieveMethodStatementsCommand, false),
        ]);
      } else if (path.find(obj => obj.path.indexOf('archived') >= 0)) {
        this._tabName = 'METHOD_STATEMENTS_MANAGE.ARCHIVED_TAB_MSG';
        this._byStatusId = 4;
        this._actions = Immutable.List([
          new AeDataTableAction("View", this._viewMethodStatements, false),
          new AeDataTableAction("Reinstate", this._reinstateMethodStatementsCommand, false),
        ]);
      } else {
        this._tabName = 'METHOD_STATEMENTS_MANAGE.EXAMPLES_TAB_MSG';
        this._byStatusId = -1;
        if (this._claimsHelper.canCreateExampleMS()) {
          this._actions = Immutable.List([
            new AeDataTableAction("View", this._viewMethodStatements, false),
            new AeDataTableAction("Copy", this._copyMethodStatementCommand, false),
            new AeDataTableAction("Update", this._updateExampleMethodStatementsCommand, false),
            new AeDataTableAction("Remove", this._removeMethodStatementCommand, false)
          ]);
        } else {
          this._actions = Immutable.List([
            new AeDataTableAction("View", this._viewMethodStatements, false),
            new AeDataTableAction("Copy", this._copyMethodStatementCommand, false),
          ]);
        }
      }
    });

    this._getHasMSFiltersChangedDataSub = this._store.let(fromRoot.getMSFilterApiRequest)
      .combineLatest(this._store.let(fromRoot.getHasMSFiltersChangedData)
      , (initialRequest$, filterChange$
      ) => {
        return { savedRequest: initialRequest$, filterChange: filterChange$ };
      }).takeUntil(this._destructor$).subscribe((vl) => {
        if (!isNullOrUndefined(vl.savedRequest)) {
          Object.assign(this._methodStatementsApiRequest, vl.savedRequest);
        }
        if (vl.filterChange) {
          this._store.dispatch(new LoadMethodStatementsListAction(this._methodStatementsApiRequest));
        }
        this._loadInitialData();
      });

    this._removeMethodStatementSubscription = this._removeMethodStatementCommand.takeUntil(this._destructor$).subscribe(methodStatement => {
      this._selectedMethodStatement = methodStatement as MethodStatements;
      this._showMethodStatementDeleteModal = true;
    });

    this._archieveMethodStatementSubscription = this._archieveMethodStatementsCommand.takeUntil(this._destructor$).subscribe(methodStatement => {
      this._selectedMethodStatement = methodStatement as MethodStatements;
      if (!isNullOrUndefined(this._selectedMethodStatement)) {
        this._dataToSave.StatusId = 4;
        this._dataToSave.ArchievedBy = this._claimsHelper.getUserId();
        this._dataToSave.MethodStatementId = this._selectedMethodStatement.Id;
        this._dataToSave.Name = this._selectedMethodStatement.Name;
        this._methodStatementsApiRequest.Params = addOrUpdateAtlasParamValue(this._methodStatementsApiRequest.Params, 'ByStatusIdOnUpdate', this._dataToSave.StatusId);
        this._store.dispatch(new UpdateStatusMethodStatementAction({ UpdateStatusModel: this._dataToSave, AtlasApiRequestWithParams: this._methodStatementsApiRequest }));
      }
    });

    this._reinstateMethodStatementSubscription = this._reinstateMethodStatementsCommand.takeUntil(this._destructor$).subscribe(methodStatement => {
      this._selectedMethodStatement = methodStatement as MethodStatements;
      if (!isNullOrUndefined(this._selectedMethodStatement)) {
        this._dataToSave.StatusId = 0;
        this._dataToSave.ArchievedBy = this._claimsHelper.getUserId();
        this._dataToSave.MethodStatementId = this._selectedMethodStatement.Id;
        this._dataToSave.Name = this._selectedMethodStatement.Name;
        this._methodStatementsApiRequest.Params = addOrUpdateAtlasParamValue(this._methodStatementsApiRequest.Params, 'ByStatusIdOnUpdate', this._dataToSave.StatusId);
        this._store.dispatch(new UpdateStatusMethodStatementAction({ UpdateStatusModel: this._dataToSave, AtlasApiRequestWithParams: this._methodStatementsApiRequest }));
      }
    });

    this._copyMethodStatementSubscription = this._copyMethodStatementCommand.takeUntil(this._destructor$).subscribe(methodStatement => {
      this._selectedMethodStatement = methodStatement as MethodStatements;
      this._showMSCopySlideOut = true;
    });

    this._viewMethodStatementsSubscription = this._viewMethodStatements.takeUntil(this._destructor$).subscribe(ms => {
      let selectedMS = ms as MethodStatements;
      let statusName = this._getStatusName(selectedMS);
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      };
      this._router.navigate(['/method-statement/preview/' + statusName + "/" + selectedMS.Id], navigationExtras);
    });


    this._updateMethodStatementsSubscription = this._updateMethodStatementsCommand.takeUntil(this._destructor$).subscribe(ms => {
      let selectedMS = ms as MethodStatements;
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      };
      if (this._cidExists) {
        this._router.navigate(['/method-statement/edit/' + selectedMS.Id], navigationExtras);
      }
      else {
        this._router.navigate(['/method-statement/edit/' + selectedMS.Id], navigationExtras);
      }
    });


    this._updateExampleMethodStatementsSubscription = this._updateExampleMethodStatementsCommand.takeUntil(this._destructor$).subscribe(ms => {
      let selectedMS = ms as MethodStatements;
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      };
      this._router.navigate(['/method-statement/edit/example/' + selectedMS.Id], navigationExtras);
    });

  }

  OnCopied(data: any) {
    // here need to raise on copied...  

    this._store.dispatch(new CopyMethodStatementAction({ model: data, AtlasApiRequestWithParams: this._methodStatementsApiRequest, copyToDiffCompany: data.copyToDifferentCompany, IsExample: this._selectedMethodStatement.IsExample }));
    this._showMSCopySlideOut = false;
  }

  CloseMSSlideOut($event) {
    this._showMSCopySlideOut = false;
  }

  GetMSCopySlideoutState() {
    return this._showMSCopySlideOut ? 'expand' : 'collapse';
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
  // End of public methods
}