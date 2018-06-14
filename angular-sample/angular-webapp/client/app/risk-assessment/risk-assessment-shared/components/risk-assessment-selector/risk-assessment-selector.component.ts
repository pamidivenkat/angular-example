import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { EventEmitter, ViewEncapsulation } from '@angular/core';
import { Output } from '@angular/core';
import { AeSortModel } from './../../../../atlas-elements/common/models/ae-sort-model';
import { AePageChangeEventModel } from './../../../../atlas-elements/common/models/ae-page-change-event-model';
import { LoadLiveRiskAssessmentsAction } from './../../actions/ra-shared-actions';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { RiskAssessment } from './../../../models/risk-assessment';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { FormBuilder } from '@angular/forms';
import { LoadSitesAction } from './../../../../shared/actions/company.actions';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { isNullOrUndefined } from 'util';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subscription, Observable } from 'rxjs/Rx';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from './../../../../shared/base-component';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, Input } from '@angular/core';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';
import { AeDatasourceType } from './../../../../atlas-elements/common/ae-datasource-type';
import { MSRiskAssessment } from './../../../../method-statements/models/method-statement';

@Component({
  selector: 'risk-assessment-selector',
  templateUrl: './risk-assessment-selector.component.html',
  styleUrls: ['./risk-assessment-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RiskAssessmentSelectorComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _riskAssessmentSelectorForm: FormGroup;
  private _sites$: Observable<AeSelectItem<string>[]>;
  private _sitesSubscription: Subscription;
  private _raSelectRequest: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams('Status', '2')]);
  private _liveRiskAssessments$: Observable<Immutable.List<RiskAssessment>>;
  private _liveRiskAssessmentSubscription: Subscription;
  private _liveRAs: RiskAssessment[];
  private _recordsCount$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>
  private _liveRALoading$: Observable<boolean>;
  private _localDataSourceType: AeDatasourceType = AeDatasourceType.Local;
  private _keys = Immutable.List(['Id', 'Name', 'ReferenceNumber', 'SiteName']);
  private _selectedRAs: RiskAssessment[] = []; //TODO:this needs to be populated from data grid select event firing....  
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _selectedRows: Map<string, RiskAssessment> = new Map<string, RiskAssessment>();
  private _msRiskAssessment: MSRiskAssessment;
  private _methodStatementExample: boolean;

  // End of Private Fields

  // Public properties


  @Input('selectedRiskAssessments')
  set selectedRiskAssessments(val: any) {
    this._selectedRAs = val;
  }
  get selectedRiskAssessments() {
    return this._selectedRAs;
  }
  

  @Input('methodStatementExample')
  get methodStatementExample() {
    return this._methodStatementExample;
  }
  set methodStatementExample(val: boolean) {
    this._methodStatementExample = val;
  }



  // End of Public properties   
  // Public Output bindings
  @Output('selectRA')
  _selectRA: EventEmitter<RiskAssessment[]> = new EventEmitter<RiskAssessment[]>();

  @Output('aeClose')
  private _aeClose: EventEmitter<boolean> = new EventEmitter<boolean>();
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
    , private _fb: FormBuilder
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  // Private methods
  onRASelectorFormClosed($event) {
    this._aeClose.emit(true);
  }
  onRASelectorFormSubmit($event) {
    this._selectRA.emit(this._selectedRAs);
    this._aeClose.emit(true);
  }
  private _initForm() {
    this._riskAssessmentSelectorForm = this._fb.group({
      Site: [{ value: '', disabled: false }],
      Name: [{ value: '', disabled: false }]
    }
    );
  }
  onPageChange(page: AePageChangeEventModel) {
    this._raSelectRequest.PageNumber = page.pageNumber;
    this._raSelectRequest.PageSize = page.noOfRows;
    this._store.dispatch(new LoadLiveRiskAssessmentsAction(this._raSelectRequest));
  }
  onSort(sort: AeSortModel) {
    this._raSelectRequest.SortBy.SortField = sort.SortField;
    this._raSelectRequest.SortBy.Direction = sort.Direction;
    this._store.dispatch(new LoadLiveRiskAssessmentsAction(this._raSelectRequest));
  }
  // End of private methods

  // Public methods
  get keys() {
    return this._keys;
  }

  get liveRALoading$() {
    return this._liveRALoading$;
  }

  get recordsCount$() {
    return this._recordsCount$;
  }

  get liveRiskAssessments$() {
    return this._liveRiskAssessments$;
  }

  get sites$() {
    return this._sites$;
  }

  get dataTableOptions$() {
    return this._dataTableOptions$;
  }

  get lightClass() {
    return this._lightClass;
  }

  get riskAssessmentSelectorForm() {
    return this._riskAssessmentSelectorForm;
  }

  get localDataSourceType() {
    return this._localDataSourceType;
  }

  public onSelectRow(checked: boolean, item: RiskAssessment) {
    if (checked) {
      this._selectedRows.set(item.Id, item);
    }
    else {
      this._selectedRAs = this._selectedRAs.filter(x=>x.Id != item.Id);
      this._selectedRows.delete(item.Id);
    }
    this.updateSelectedRiskAssessments(this._selectedRows);
  }


  public updateSelectedRiskAssessments(selectedRows: Map<string, RiskAssessment>) {
    //this._selectedRAs = [];
    selectedRows.forEach((value: RiskAssessment, key: string) => {
      if (this._selectedRAs.findIndex(c => c.Id.toLowerCase() === value.Id.toLowerCase()) === -1) {
        this._selectedRAs.push(value);
      }
    });
  }
  public checkIfSelected(item: any): boolean {
    if (!isNullOrUndefined(item)) {
      if (this._selectedRAs && this._selectedRAs.find(p => p.Id === item.Id)) {
        return true;
      } else {
        return false;
      }
    }
  }

  ngOnInit(): void {
    this._initForm();
    this._sites$ = this._store.let(fromRoot.getsitesClientsForMultiSelectData);
    this._sitesSubscription = this._store.let(fromRoot.getSiteData).subscribe(sites => {
      if (!sites)
        this._store.dispatch(new LoadSitesAction(false));
    });
    // by default depatch to load the initial data
    this._raSelectRequest.Params.push(new AtlasParams('Example', this._methodStatementExample));
    this._store.dispatch(new LoadLiveRiskAssessmentsAction(this._raSelectRequest));

    this._liveRiskAssessments$ = this._store.let(fromRoot.getLiveRiskAssesmentsListData);
    this._recordsCount$ = this._store.let(fromRoot.getLiveRiskAssesmentsTotalCountData);
    this._dataTableOptions$ = this._store.let(fromRoot.getLiveRiskAssessmentsDataTableOptions);
    this._liveRALoading$ = this._store.let(fromRoot.getLiveRALoadedData);

    this._liveRiskAssessmentSubscription = this._store.let(fromRoot.getLiveRiskAssesmentsListData).subscribe(res => {
      if (res) {
        this._liveRAs = res.toArray();
      }
    });

    this._riskAssessmentSelectorForm.valueChanges.subscribe(data => {
      this._raSelectRequest.Params = [];
      this._raSelectRequest.Params.push(new AtlasParams('Status', '2'));//fetch only live...
      this._raSelectRequest.Params.push(new AtlasParams('Name', data.Name));
      this._raSelectRequest.Params.push(new AtlasParams('Example', this._methodStatementExample));
      this._raSelectRequest.Params.push(new AtlasParams('SiteId', !isNullOrUndefined(data.Site) && data.Site.length > 0 && !StringHelper.isNullOrUndefinedOrEmpty(data.Site[0]) ? data.Site[0] : null));
      this._raSelectRequest.PageNumber = 1;
      this._store.dispatch(new LoadLiveRiskAssessmentsAction(this._raSelectRequest));
    });

  }
  ngOnDestroy(): void {
    if (this._sitesSubscription) {
      this._sitesSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._liveRiskAssessmentSubscription)) {
      this._liveRiskAssessmentSubscription.unsubscribe();
    }
  }
  // End of public methods

}
