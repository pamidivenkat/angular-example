import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { BaseComponent } from '../../../../shared/base-component';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';
import { addOrUpdateAtlasParamValue } from './../../../../root-module/common/extract-helpers';
import { LoadSitesAction } from './../../../../shared/actions/company.actions';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import * as fromRoot from './../../../../shared/reducers';
import { LoadContractsListAction } from './../../actions/contracts.actions';

@Component({
  selector: 'contracts-template-list',
  templateUrl: './contracts-template-list.component.html',
  styleUrls: ['./contracts-template-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ContractsTemplateListComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _contractsListLoadedSubscription: Subscription;
  private _sitesSubscription: Subscription;
  private _sites$: Observable<AeSelectItem<string>[]>;
  private _contractListForm: FormGroup;
  private _localDataSourceType: AeDatasourceType = AeDatasourceType.Local;
  private _contractsApiRequest: AtlasApiRequestWithParams;
  private _loadStatus:boolean = true;
  //public properties
  get contractListForm(): FormGroup {
    return this._contractListForm;
  }
  get sites$(): Observable<AeSelectItem<string>[]> {
    return this._sites$;
  }
  get localDataSourceType(): AeDatasourceType {
    return this._localDataSourceType;
  }
  get contractsApiRequest(): AtlasApiRequestWithParams {
    return this._contractsApiRequest;
  }
  //end of public properties
  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
    this.id = 'Contracts-template';
    this.name = 'Contracts-template';
  }

  // Private methods

  // Public methods
  public onGridPaging(pageInfo) {
    this._contractsApiRequest.PageNumber = pageInfo.pageNumber;
    this._contractsApiRequest.PageSize = pageInfo.noOfRows;
    this._store.dispatch(new LoadContractsListAction(this._contractsApiRequest));
  }
  public onGridSorting(sortInfo) {
    this._contractsApiRequest.PageNumber = 1;
    this._contractsApiRequest.SortBy.SortField = sortInfo.SortField;
    this._contractsApiRequest.SortBy.Direction = sortInfo.Direction;
    this._store.dispatch(new LoadContractsListAction(this._contractsApiRequest));
  }

  ngOnInit() {

    if (isNullOrUndefined(this._contractsApiRequest))
      this._contractsApiRequest = <AtlasApiRequestWithParams>{};

    this._contractsListLoadedSubscription = this._store.let(fromRoot.getContractsData).subscribe(contractListLoaded => {
      if (!contractListLoaded || this._loadStatus) {
        this._loadStatus= false;
        let params: AtlasParams[] = new Array();
        params.push(new AtlasParams('contractsFilter', 1))
        this._contractsApiRequest = new AtlasApiRequestWithParams(1, 10, 'Title', SortDirection.Ascending, params);
        this._store.dispatch(new LoadContractsListAction(this._contractsApiRequest));
      }
    });

    this._sites$ = this._store.let(fromRoot.getsitesClientsForMultiSelectData);
    this._sitesSubscription = this._store.let(fromRoot.getSiteData).subscribe(sites => {
      if (!sites)
        this._store.dispatch(new LoadSitesAction(false));
    });

    this._contractListForm = this._fb.group({
      site: [{ value: '', disabled: false }],
    });

    this._contractListForm.valueChanges.subscribe(data => {
      this._contractsApiRequest.PageNumber = 1;
      if (this._contractListForm.valid) {
        this._contractsApiRequest.Params = addOrUpdateAtlasParamValue(this._contractsApiRequest.Params, 'site', data.site);
      }
      this._store.dispatch(new LoadContractsListAction(this._contractsApiRequest));
    });

  }
  ngOnDestroy() {
    if (this._sitesSubscription)
      this._sitesSubscription.unsubscribe();
    if (this._contractsListLoadedSubscription)
      this._contractsListLoadedSubscription.unsubscribe();
  }
  // End of public methods

}