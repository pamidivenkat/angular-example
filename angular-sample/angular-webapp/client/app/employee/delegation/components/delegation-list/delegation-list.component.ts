import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { TranslationService, LocaleService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { AeSortModel } from './../../../../atlas-elements/common/models/ae-sort-model';
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { AeDataTableAction } from "./../../../../atlas-elements/common/models/ae-data-table-action";
import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { BaseComponent } from './../../../../shared/base-component';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import * as fromRoot from './../../../../shared/reducers/index';
import { Delegation } from '../../models/delegation';
import {
  LoadDelegatedUsersListAction,
  DelegatedUserDeleteAction,
  LoadUsersAction
} from '../../actions/delegation.actions';
import { DelegationService } from './../../services/delegation.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { getAtlasParamValueByKey } from "./../../../../root-module/common/extract-helpers";


@Component({
  selector: 'delegation-list',
  templateUrl: './delegation-list.component.html',
  styleUrls: ['./delegation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DelegationListComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private fields
  private _delegationRequests$: Observable<Immutable.List<Delegation>>;
  private _recordsCount$: Observable<number>;
  private _dataTableOptions: Observable<DataTableOptions>;
  private _delegationLoaded$: Observable<boolean>;
  private _keys = Immutable.List(["Id", "UserId", "DeligatedUserId", "FirstName", "LastName", "Email", "DeligatedHA", "DeligatedReadOnlyDE", "DeligatedManageDE", "CreatedOn", "CreatedBy"]);
  private _actions: Immutable.List<AeDataTableAction>;
  private _delegationFilterForm: FormGroup;
  private _autosuggestUserslist$: Observable<AeSelectItem<string>[]>;
  private _remoteDataSourceType: AeDatasourceType;
  private _delegationRequest: AtlasApiRequestWithParams;
  private _delegationRequestSubScription: Subscription;
  private _checkDelegationAccess: boolean;
  private _updateDelegationAction: Subject<Delegation> = new Subject();
  private _removeDelegationAction: Subject<Delegation> = new Subject();
  private _updateDelegationActionSubscription$: Subscription;
  private _removeDelegationActionSubscription$: Subscription;
  private _delegationFilterFormChangesSubScription: Subscription;

  // End of Private Fields

  // Constructor
  constructor(protected _changeDetector: ChangeDetectorRef
    , protected _store: Store<fromRoot.State>
    , _localeService: LocaleService
    , _translationService: TranslationService
    , private _delegationService: DelegationService
    , private _fb: FormBuilder
    , protected _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _changeDetector);
    this._actions = Immutable.List([
      new AeDataTableAction('Update', this._updateDelegationAction, false),
      new AeDataTableAction('Remove', this._removeDelegationAction, false)
    ]);

    this._remoteDataSourceType = AeDatasourceType.Remote;

    this._updateDelegationActionSubscription$ = this._updateDelegationAction.subscribe(_editDelegation => {
      //emiiting event to container to know the udpate is clicked and container will own the responsibility of 
      ///opening the slide out in update mode with the sent object here as payload
      this.aeDelegationSelected.emit(_editDelegation as Delegation);
    });

    this._removeDelegationActionSubscription$ = this._removeDelegationAction.subscribe(_deleteDelegation => {
      this.aeDelegationDelete.emit(_deleteDelegation as Delegation);
    });

  }
  // End of Constructor

  //get methods

  get delegationFilterForm() {
    return this._delegationFilterForm;
  }
  get checkDelegationAccess() {
    return this._checkDelegationAccess;
  }
  get remoteDataSourceType() {
    return this._remoteDataSourceType;
  }
  get delegationRequests$() {
    return this._delegationRequests$;
  }
  get recordsCount$() {
    return this._recordsCount$;
  }
  get actions() {
    return this._actions;
  }
  get dataTableOptions() {
    return this._dataTableOptions;
  }
  get keys() {
    return this._keys;
  }
  get autosuggestUserslist$() {
    return this._autosuggestUserslist$;
  }
  get delegationLoaded$(): Observable<boolean>{
    return this._delegationLoaded$;
  }


  // Private Methods

  onPageChange($event: any) {
    this._delegationRequest.PageNumber = $event.pageNumber;
    this._delegationRequest.PageSize = $event.noOfRows;
    this._store.dispatch(new LoadDelegatedUsersListAction(this._delegationRequest));
  }

  onSort($event: AeSortModel) {
    this._delegationRequest.SortBy.SortField = $event.SortField;
    this._delegationRequest.SortBy.Direction = $event.Direction;
    this._delegationRequest.PageNumber = 1;
    this._store.dispatch(new LoadDelegatedUsersListAction(this._delegationRequest));
  }



  private _initForm() {
    this._delegationFilterForm = this._fb.group({
      UserId: [{ value: null }],
    });
  }

  autoDelegationUsers(e) {
    let apiRequestWithParams: AtlasApiRequestWithParams;
    let apiParams: AtlasParams[] = [];
    apiParams.push(new AtlasParams("Permission", 'Ishoau'));
    apiParams.push(new AtlasParams("SearchedQuery", e.query));
    apiRequestWithParams = new AtlasApiRequestWithParams(0, 0, 'FirstName', SortDirection.Ascending, apiParams);
    this._store.dispatch(new LoadUsersAction(apiRequestWithParams));
  }
  // End of Private Methods

  // Public Methods
  @Output()
  private aeDelegationSelected: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  private aeDelegationDelete: EventEmitter<any> = new EventEmitter<any>();


  ngOnInit() {
    this._initForm();
    this._checkDelegationAccess = this._claimsHelper.canManageHolidayDelegation();
    this._delegationRequests$ = this._store.let(fromRoot.getDelegationRequestsData);
    this._recordsCount$ = this._store.let(fromRoot.getDelegationRequestsTotalCountData);
    this._dataTableOptions = this._store.let(fromRoot.getDelegationRequestsDataTableOptionsData);
    this._delegationLoaded$ = this._store.let(fromRoot.getDelegationRequestsLoadedData);
    this._autosuggestUserslist$ = this._store.let(fromRoot.getDelegationAutosuggestUserlistsData);


    this._delegationRequestSubScription = this._store.let(fromRoot.getDelegationApiRequestData).subscribe((initialRequest) => {
      this._delegationRequest = initialRequest;
    });

    this._delegationFilterFormChangesSubScription = this._delegationFilterForm.valueChanges.subscribe(data => {
      if (this._checkDelegationAccess) {
        let iniParamsArray: AtlasParams[] = [];
        if (data.UserId.length == 0) {
          iniParamsArray.push(new AtlasParams("UserId", this._claimsHelper.getUserId()));
        } else {
          iniParamsArray.push(new AtlasParams("UserId", data.UserId));
        }
        let newReq: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, "FirstName", SortDirection.Ascending, iniParamsArray);
        this._delegationService.loadDelegationList(newReq);
      }
    });
  }

  ngOnDestroy() {
    if (this._delegationRequestSubScription)
      this._delegationRequestSubScription.unsubscribe();
    if (this._delegationFilterFormChangesSubScription)
      this._delegationFilterFormChangesSubScription.unsubscribe();
    if (this._updateDelegationActionSubscription$)
      this._updateDelegationActionSubscription$.unsubscribe();
    if (this._removeDelegationActionSubscription$)
      this._removeDelegationActionSubscription$.unsubscribe();
  }
  // End of Public Methods
}
