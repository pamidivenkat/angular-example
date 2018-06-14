import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeChangeEvent } from '../../../atlas-elements/common/models/ae-change-event';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { BaseComponent } from '../../../shared/base-component';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import * as fromRoot from '../../../shared/reducers';
import { AddControl, LoadAllControls } from '../../actions/risk-assessment-actions';
import { ControlsCategory } from '../../common/controls-category-enum';
import { RiskAssessment } from '../../models/risk-assessment';
import { RiskAssessmentControl } from '../../models/risk-assessment-control';
import { RiskAssessmentService } from '../../services/risk-assessment-service';

@Component({
  selector: 'all-controls',
  templateUrl: './all-controls.component.html',
  styleUrls: ['./all-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AllControlsComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _searchText: string;
  private _currentRiskAssessment: RiskAssessment;
  private _exampleControlsApiRequestParams: AtlasApiRequestWithParams;
  private _isSearch: boolean;
  private _allControls$: BehaviorSubject<Immutable.List<RiskAssessmentControl>>;
  private _allControlsCount: number;
  private _selectedHazardId: string;
  private _defaultNumber = 20;
  private _lastpage: number = -1;
  // End of Private Fields

  // Public properties
  @Input('currentRiskAssessment')
  get currentRiskAssessment(): RiskAssessment {
    return this._currentRiskAssessment;
  }
  set currentRiskAssessment(value: RiskAssessment) {
    this._currentRiskAssessment = value;
  }

  @Input('selectedHazardId')
  get selectedHazardId(): string {
    return this._selectedHazardId;
  }
  set selectedHazardId(val: string) {
    this._selectedHazardId = val;
  }

  get isSearch(): boolean {
    return this._isSearch;
  }

  get allControls(): BehaviorSubject<Immutable.List<RiskAssessmentControl>> {
    return this._allControls$;
  }

  get exampleControlsCount(): number {
    return this._allControlsCount
  }

  get searchText(): string {
    return this._searchText;
  }

  get defaultNumber() {
    return this._defaultNumber;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _riskAssessmentService: RiskAssessmentService) {
    super(_localeService, _translationService, _cdRef);
    this._isSearch = false;
    this._allControls$ = new BehaviorSubject<Immutable.List<RiskAssessmentControl>>(null);
  }
  // End of constructor

  // Private methods
  private _isCOSHH(): boolean {
    return this._riskAssessmentService.isCOSHH(this._currentRiskAssessment);
  }
  private _raControlsCategoryType(): number {
    return this._isCOSHH() ? ControlsCategory['COSHH Control'] : ControlsCategory['General Control'];
  }

  private _initialLoadControls() {
    let params = new Array<AtlasParams>();
    params.push(new AtlasParams('searchControlFilter', this._searchText));
    params.push(new AtlasParams('ControlsByCategoryFilter', this._raControlsCategoryType()));
    this._exampleControlsApiRequestParams = new AtlasApiRequestWithParams(1, 50, 'Name', SortDirection.Ascending, params);
    this._store.dispatch(new LoadAllControls(this._exampleControlsApiRequestParams));
  }
  // End of private methods

  // Public methods
  getPictureUrl(id: string, isSharedDocument: boolean = false, isHazard: boolean = false) {
    return this._riskAssessmentService.getPictureUrl(id, isSharedDocument, isHazard)
  }
  onChange(event: AeChangeEvent) {
    if (!isNullOrUndefined(this._allControlsCount) && this._allControlsCount > 0) {
      let currentLoadedExampleItems = this._exampleControlsApiRequestParams.PageNumber * this._exampleControlsApiRequestParams.PageSize;
      if (currentLoadedExampleItems < this._allControlsCount) {
        this._exampleControlsApiRequestParams.PageNumber += 1;
        this._store.dispatch(new LoadAllControls(this._exampleControlsApiRequestParams));
      }
    }
  }

  searchAllHazards($event: any) {
    this._searchText = $event.event.target.value;
    this._isSearch = true;
    this._lastpage = 0;
    this._cdRef.markForCheck();
    this._initialLoadControls();
  }

  addControlToRiskAssessment(control: RiskAssessmentControl) {
    let controlToAdd = new RiskAssessmentControl();

    controlToAdd.Name = control.Name;
    controlToAdd.PictureId = control.PictureId;
    controlToAdd.Description = control.Description;
    controlToAdd.PrototypeId = control.Id;
    controlToAdd.IsSharedPrototype = control.IsExample
    controlToAdd.RiskAssessmentId = this._currentRiskAssessment.Id;
    controlToAdd.RiskAssessmentHazardId = this._selectedHazardId;
    controlToAdd.Category = this._raControlsCategoryType();
    this._store.dispatch(new AddControl(controlToAdd))
  }

  ngOnInit() {
    this._searchText = '';
    this._initialLoadControls();

    this._store.let(fromRoot.getAllControls).takeUntil(this._destructor$).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        let data = res.data;
        let isLoading = res.allControlsLoading;
        if (!isNullOrUndefined(data) && !isNullOrUndefined(isLoading) && isLoading == false) {
          if (this._lastpage < this._exampleControlsApiRequestParams.PageNumber) {
            if (data.count() > 0) {
              this._lastpage = this._exampleControlsApiRequestParams.PageNumber;
            }
            this._allControls$.next(data);
          }
        }
      }
    });


    this._store.let(fromRoot.getAllControlsCount).takeUntil(this._destructor$).subscribe((count) => {
      this._allControlsCount = count;
    })
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
  // End of public methods 

}
