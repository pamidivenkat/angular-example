import { isNullOrUndefined } from 'util';
import { getFlatValues } from '../../../../company/nonworkingdaysandbankholidays/common/extract-helpers';
import { mapEmployeKeyValuesToAeSelectItems } from '../../../../employee/common/extract-helpers';
import { EmployeeSearchService } from './../../../../employee/services/employee-search.service';
import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { LoadAllDepartmentsAction, LoadSitesAction } from './../../../../shared/actions/company.actions';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { subscribeOn } from 'rxjs/operator/subscribeOn';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import * as fromRoot from './../../../../shared/reducers';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import { AtlasParams, AtlasApiRequestWithParams } from './../../../../shared/models/atlas-api-response';
import { LoadContractsListAction } from './../../actions/contracts.actions';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';
import { addOrUpdateAtlasParamValue } from "./../../../../root-module/common/extract-helpers";

@Component({
  selector: 'personalized-contract-list',
  templateUrl: './personalized-contract-list.component.html',
  styleUrls: ['./personalized-contract-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PersonalizedContractListComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _personalcontractsListLoadedSubscription: Subscription;
  private _personalcontractListForm: FormGroup;

  private _localDataSourceType: AeDatasourceType = AeDatasourceType.Local;
  private _remoteDataSourceType: AeDatasourceType = AeDatasourceType.Remote;
  private _sites$: Observable<AeSelectItem<string>[]>;
  private _departments$: Observable<AeSelectItem<string>[]>;
  private _departmentsSubscription: Subscription;
  private _sitesSubscription: Subscription;
  private _employeeFilters: Map<string, string> = new Map<string, string>();
  private _searchedEmployeesSub: BehaviorSubject<AeSelectItem<string>[]> = new BehaviorSubject<AeSelectItem<string>[]>(null);
  private _personalizedApiRequest: AtlasApiRequestWithParams;
  private _loadStatus: boolean = true;

  // End of Private Fields

  // Public properties
  get personalcontractListForm(): FormGroup {
    return this._personalcontractListForm;
  }
  get localDataSourceType(): AeDatasourceType {
    return this._localDataSourceType;
  }
  get remoteDataSourceType(): AeDatasourceType {
    return this._remoteDataSourceType;
  }
  get sites$(): Observable<AeSelectItem<string>[]> {
    return this._sites$;
  }
  get departments$(): Observable<AeSelectItem<string>[]> {
    return this._departments$;
  }
  get searchedEmployeesSub(): BehaviorSubject<AeSelectItem<string>[]> {
    return this._searchedEmployeesSub;
  }
  get personalizedApiRequest(): AtlasApiRequestWithParams {
    return this._personalizedApiRequest;
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
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _employeeSearchService: EmployeeSearchService
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
    this.id = "personalized-contact-list";
    this.name = "personalized-contact-list";
  }
  // End of constructor

  // Private methods

  // End of private methods

  // Public methods
  public searchEmployees($event) {
    // add department filter      
    this._employeeFilters.set('employeesByDepartmentFilter', getFlatValues(this._personalcontractListForm.controls['department'].value));
    this._employeeSearchService.getEmployeesKeyValuePair($event.query, this._employeeFilters).first().subscribe((empData) => {
      this._searchedEmployeesSub.next(mapEmployeKeyValuesToAeSelectItems(empData));
    });
  }
  public onGridPaging(pageinfo) {
    this._personalizedApiRequest.PageNumber = pageinfo.pageNumber;
    this._personalizedApiRequest.PageSize = pageinfo.noOfRows;
    this._store.dispatch(new LoadContractsListAction(this._personalizedApiRequest));
  }
  public onGridSorting(sortInfo) {
    this._personalizedApiRequest.PageNumber = 1;
    this._personalizedApiRequest.SortBy.SortField = sortInfo.SortField;
    this._personalizedApiRequest.SortBy.Direction = sortInfo.Direction;
    this._store.dispatch(new LoadContractsListAction(this._personalizedApiRequest));
  }

  ngOnInit() {

    if (isNullOrUndefined(this._personalizedApiRequest))
      this._personalizedApiRequest = <AtlasApiRequestWithParams>{};
    this._personalcontractsListLoadedSubscription = this._store.let(fromRoot.getPersonalContractsData).subscribe(personalContractListLoaded => {
      if (!personalContractListLoaded || this._loadStatus) {
        this._loadStatus = false;
        let params: AtlasParams[] = new Array();
        params.push(new AtlasParams("contractsFilter", 2));
        this._personalizedApiRequest = new AtlasApiRequestWithParams(1, 10, 'Title', SortDirection.Ascending, params);
        this._store.dispatch(new LoadContractsListAction(this._personalizedApiRequest));
      }
    });

    this._personalcontractListForm = this._fb.group({
      site: [{ value: '', disabled: false }],
      department: [{ value: '', disabled: false }],
      employee: [{ value: [], disabled: false }],
    });

    this._departments$ = this._store.let(fromRoot.getAllDepartmentsForMultiSelectData);
    this._sites$ = this._store.let(fromRoot.getsitesClientsForMultiSelectData);
    this._departmentsSubscription = this._store.let(fromRoot.getAllDepartmentsData).subscribe(departmentsLoaded => {
      if (!departmentsLoaded)
        this._store.dispatch(new LoadAllDepartmentsAction());
    });

    this._sitesSubscription = this._store.let(fromRoot.getSiteData).subscribe(sites => {
      if (!sites)
        this._store.dispatch(new LoadSitesAction(false));
    });

    this._personalcontractListForm.valueChanges.subscribe(data => {
      this._personalizedApiRequest.PageNumber = 1;
      this._personalizedApiRequest.Params = addOrUpdateAtlasParamValue(this._personalizedApiRequest.Params, 'site', data.site);
      this._personalizedApiRequest.Params = addOrUpdateAtlasParamValue(this._personalizedApiRequest.Params, 'department', data.department);
      this._personalizedApiRequest.Params = addOrUpdateAtlasParamValue(this._personalizedApiRequest.Params, 'employee', data.employee);
      this._store.dispatch(new LoadContractsListAction(this._personalizedApiRequest));
    });

  }
  ngOnDestroy() {
    if (this._sitesSubscription)
      this._sitesSubscription.unsubscribe();
    if (this._departmentsSubscription)
      this._departmentsSubscription.unsubscribe();
    if (this._personalcontractsListLoadedSubscription)
      this._personalcontractsListLoadedSubscription.unsubscribe();
  }


  // End of public methods

}