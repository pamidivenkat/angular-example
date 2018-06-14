import { RouteParams } from './../../../shared/services/route-params';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeSliderChange } from '../../../atlas-elements/ae-slider/ae-slider.component';
import { AeTemplateComponent } from '../../../atlas-elements/ae-template/ae-template.component';
import { AeIndicatorStyle } from '../../../atlas-elements/common/ae-indicator-style.enum';
import { AeLoaderType } from '../../../atlas-elements/common/ae-loader-type.enum';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { createPopOverVm } from '../../../atlas-elements/common/models/popover-vm';
import * as fromConstants from '../../../shared/app.constants';
import { BaseComponent } from '../../../shared/base-component';
import { EnumHelper } from '../../../shared/helpers/enum-helper';
import * as fromRoot from '../../../shared/reducers';
import { LoadRiskAssessmentHazardsAction } from '../../actions/risk-assessment-actions';
import { HazardCategory } from '../../common/hazard-category-enum';
import { getPictureUrl } from '../../common/helper';
import { Matrix, RiskAssessment } from '../../models/risk-assessment';
import { RiskAssessmentHazard } from '../../models/risk-assessment-hazard';
import { RiskAssessmentService } from '../../services/risk-assessment-service';

@Component({
  selector: 'assess',
  templateUrl: './assess.component.html',
  styleUrls: ['./assess.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssessComponent extends BaseComponent implements OnInit, OnDestroy {
  private _currentRiskAssessment: RiskAssessment;
  private _chartData: Map<number, Observable<Array<number>>>;
  private _riskMatrix: Map<number, number[]>;
  private _maxRiskValue: number;
  private _hazards: RiskAssessmentHazard[];
  private _matrixOptions: Immutable.List<AeSelectItem<number>>;
  private _showOverAllAssessment: boolean;
  private _showIndividualAssessment: boolean;
  private _context: any;
  private _isUpdated: boolean;
  private _loadingHazards: boolean;
  private _squareIndicator: AeIndicatorStyle = AeIndicatorStyle.Square;
  private _legendVertical: AeIndicatorStyle = AeIndicatorStyle.Vertical;
  private _translationChangeSub: Subscription;
  // End of Private Fields

  get legendIndicatorType(): AeIndicatorStyle {
    return this._squareIndicator;
  }
  get legendTypeVertical(): AeIndicatorStyle {
    return this._legendVertical;
  }
  legendOptions: Array<{
    Text: string,
    Class: string
  }> = [];

  private _updateChart(index: number) {
    let likelihood: number;
    let severity: number;
    if (index === 999) {
      likelihood = this._currentRiskAssessment.Likelihood ? this._currentRiskAssessment.Likelihood : 1;
      severity = this._currentRiskAssessment.Severity ? this._currentRiskAssessment.Severity : 1
      this._chartData.set(index, Observable.of([likelihood * severity, this._currentRiskAssessment.Matrix]));
    } else {
      likelihood = this._hazards[index].Likelihood ? this._hazards[index].Likelihood : 1;
      severity = this._hazards[index].Severity ? this._hazards[index].Severity : 1
      this._chartData.set(index, Observable.of([likelihood * severity, this._currentRiskAssessment.Matrix]));
    }
  }

  @ViewChild('popOverTemplate')
  _popOverTemplate: AeTemplateComponent<any>;

  constructor(
    protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _riskAssessmentService: RiskAssessmentService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);

    this._chartData = new Map<number, Observable<Array<number>>>();
  }

  // Private methods
  private _createLegend() {
    return [{ Text: this._translationService.translate('RISK_LEGEND.GREEN'), Class: "cl-green" }
      , { Text: this._translationService.translate('RISK_LEGEND.YELLOW'), Class: "cl-yellow" }
      , { Text: this._translationService.translate('RISK_LEGEND.RED'), Class: "cl-red" }];
  }

  @Input('context')
  get contextObj() {
    return this._context;
  }
  set contextObj(val: any) {
    this._context = val;
  }

  loaderType(): number {
    return AeLoaderType.Bars;
  }

  chartData(index: number) {
    return this._chartData.get(index);
  }

  get loadingHazards() {
    return this._loadingHazards;
  }

  get currentRiskAssessment() {
    return this._currentRiskAssessment;
  }

  get maxRiskValue(): number {
    return this._maxRiskValue
  }

  get hazards() {
    return this._hazards;
  }

  get matrixOptions() {
    return this._matrixOptions;
  }

  get showOverAllAssessment(): boolean {
    return this._showOverAllAssessment;
  }

  get showIndividualAssessment(): boolean {
    return this._showIndividualAssessment;
  }

  private _resetAllHazardAssessments() {
    this._hazards.map((hazard, key) => {
      this._hazards[key].Likelihood = null;
      this._hazards[key].Severity = null
    })
    this._isUpdated = true;
    this._cdRef.markForCheck();
  }

  updateLikelihood(event: AeSliderChange, index: number, hazardId: string = null) {
    if (index === 999) {
      this._currentRiskAssessment.Likelihood = event.value;
    } else {
      this._hazards.find((hazard) => { return hazardId === hazard.Id }).Likelihood = event.value;
    }
    this._isUpdated = true;
    this._updateChart(index);
  }

  updateSeverity(event: AeSliderChange, index: number, hazardId: string = null) {
    if (index === 999) {
      this._currentRiskAssessment.Severity = event.value;
    } else {
      this._hazards.find((hazard) => { return hazardId === hazard.Id }).Severity = event.value;
    }
    this._isUpdated = true;
    this._updateChart(index);
  }

  getPictureUrl(pictureId: string, isSystem: boolean = true): string {
    return getPictureUrl(pictureId, this._routeParamsService.Cid, isSystem, true)
  }

  isCOSHH(): boolean {
    if (isNullOrUndefined(this._currentRiskAssessment)) return;
    return this._currentRiskAssessment.RiskAssessmentTypeId === fromConstants.coshhRiskAssessmentTypeId;
  }

  isMigrated(): boolean {
    if (isNullOrUndefined(this._currentRiskAssessment)) return;
    return this._currentRiskAssessment.RiskAssessmentTypeId === fromConstants.generalMigratedRiskAssessmentTypeId || this._currentRiskAssessment.RiskAssessmentTypeId === fromConstants.coshhMigratedRiskAssessmentTypeId;
  }

  updateMatrix(event) {
    this._currentRiskAssessment.Matrix = event.SelectedItem.Value;
    this._maxRiskValue = this._riskMatrix.get(this._currentRiskAssessment.Matrix)[3];

    // Update Likelihood and Serverity if they are beyond the scale
    if (!isNullOrUndefined(this._currentRiskAssessment.Likelihood) && !isNullOrUndefined(this._currentRiskAssessment.Severity)) {
      if (this._currentRiskAssessment.Likelihood > this._maxRiskValue) {
        this._currentRiskAssessment.Likelihood = this._maxRiskValue;
      }

      if (this._currentRiskAssessment.Severity > this._maxRiskValue) {
        this._currentRiskAssessment.Severity = this._maxRiskValue;
      }

      this._chartData.set(999,
        Observable.of([this._currentRiskAssessment.Likelihood * this._currentRiskAssessment.Severity, this._currentRiskAssessment.Matrix]));
    }

    if (!isNullOrUndefined(this._hazards)) {
      this._hazards.forEach((h, index) => {
        if (!isNullOrUndefined(h.Likelihood) && !isNullOrUndefined(h.Severity)) {
          if (h.Likelihood > this._maxRiskValue) {
            h.Likelihood = this._maxRiskValue;
          }

          if (h.Severity > this._maxRiskValue) {
            h.Severity = this._maxRiskValue;
          }

          this._chartData.set(index,
            Observable.of([h.Likelihood * h.Severity, this._currentRiskAssessment.Matrix]));
        }
      });
    }

    this.getPopOverVm();
    this._isUpdated = true;
    this._cdRef.markForCheck();
  }

  updateRatingLegend(event) {
    this._isUpdated = true;
    this._currentRiskAssessment.IncludeRatingLegend = event;
  }

  changeOverAllAssessment(event) {
    this._showOverAllAssessment = event;
  }

  changeIndividualAssessment(event) {
    this._showIndividualAssessment = event;
    this._resetAllHazardAssessments();
  }

  getPopOverVm() {
    let context;
    switch (this._currentRiskAssessment && this._currentRiskAssessment.Matrix) {
      case 0:
        context = {
          bottomLeftText: this._translationService.translate('MINOR_INJURY_HARM'),
          bottomCenterText: this._translationService.translate('MAJOR_INJURY_HARM'),
          bottomRightText: this._translationService.translate('FATALITY'),
          centerValue: 2,
          rightValue: 3,
          imgUrl: this._translationService.translate('RISK_MATRIX_IMAGE.LOW'),
        }
        break;
      case 1:
        context = {
          bottomLeftText: this._translationService.translate('MINOR_INJURY_HARM'),
          bottomCenterText: this._translationService.translate('MAJOR_INJURY_HARM'),
          bottomRightText: this._translationService.translate('FATALITY'),
          centerValue: 3,
          rightValue: 5,
          imgUrl: this._translationService.translate('RISK_MATRIX_IMAGE.MEDIUM'),
        }
        break;
      case 2:
        context = {
          bottomLeftText: this._translationService.translate('NO_INJURY_HARM'),
          bottomCenterText: this._translationService.translate('MINOR_INJURY_HARM'),
          bottomRightText: this._translationService.translate('FATALITY'),
          centerValue: 5,
          rightValue: 9,
          imgUrl: this._translationService.translate('RISK_MATRIX_IMAGE.HIGH'),
        }
    }
    this._cdRef.markForCheck();
    return createPopOverVm<any>(this._popOverTemplate, context);
  }

  getLikelihoodText(value: number): string {
    if (value < this._maxRiskValue / 2) {
      return 'HIGH_UNLIKELY';
    } else if (value >= this._maxRiskValue / 2 && value != this._maxRiskValue) {
      return 'LIKELY';
    } else {
      return 'CERTAIN'
    }
  }

  getSeverityText(value: number): string {
    if (this._currentRiskAssessment.Matrix === 2 && (value === 1 || isNullOrUndefined(value))) {
      return 'NO_INJURY_HARM';
    }
    if (value < this._maxRiskValue / 2) {
      return 'MINOR_INJURY_HARM';
    } else if (value >= this._maxRiskValue / 2 && value != this._maxRiskValue) {
      return 'MAJOR_INJURY_HARM';
    } else {
      return 'FATALITY'
    }
  }

  ngOnInit() {
    this._isUpdated = false;
    this._riskMatrix = new Map<number, number[]>();
    this._riskMatrix.set(0, [3, 5, 9, 3]); //index, [low, medium, max, size x size]
    this._riskMatrix.set(1, [4, 10, 25, 5]);
    this._riskMatrix.set(2, [10, 30, 81, 9]);
    this._matrixOptions = Immutable.List(EnumHelper.getAeSelectItems(Matrix));
    this._store.let(fromRoot.getHazardLoading).takeUntil(this._destructor$).subscribe((loading) => {
      this._loadingHazards = loading;
    });
    this._store.let(fromRoot.getCurrentRiskAssessment).takeUntil(this._destructor$).subscribe((riskAssessment) => {
      if (!isNullOrUndefined(riskAssessment)) {
        this._currentRiskAssessment = riskAssessment;
        if (isNullOrUndefined(this._currentRiskAssessment.Matrix)) {
          this._currentRiskAssessment.Matrix = 2;
        }
        this._maxRiskValue = this._riskMatrix.get(this._currentRiskAssessment.Matrix)[3]

        this._updateChart(999);
        if (!isNullOrUndefined(this._currentRiskAssessment.Likelihood) && !isNullOrUndefined(this._currentRiskAssessment.Severity)) {
          this._showOverAllAssessment = true;
        }

        this._cdRef.markForCheck();
      }
    });

    if (!(this.isCOSHH() || this.isMigrated())) {
      this._showIndividualAssessment = true;
      this._store.let(fromRoot.getCurrentRiskAssessmentHazards).takeUntil(this._destructor$).subscribe((hazards) => {
        if (!isNullOrUndefined(hazards)) {
          this._hazards = hazards.filter((item) => item.Category === HazardCategory.General);
          this._hazards.forEach((value, key) => {
            this._updateChart(key);
          })
          this._cdRef.markForCheck();
        } else {
          let apiParams = { id: this._currentRiskAssessment && this._currentRiskAssessment.Id, category: HazardCategory.General }
          this._store.dispatch(new LoadRiskAssessmentHazardsAction(apiParams));
        }
      });
    }

    this._context.submitEvent.takeUntil(this._destructor$).subscribe((value) => {
      if (this._isUpdated) {
        if (!this._showOverAllAssessment) {
          this._currentRiskAssessment.Likelihood = null;
          this._currentRiskAssessment.Severity = null;
        }
        this._riskAssessmentService._updateRiskAssessment(this._currentRiskAssessment);
      }
    });

    this.legendOptions = this._createLegend();


    this._translationChangeSub = this._translationService.translationChanged.subscribe(
      () => {
        this.legendOptions = this._createLegend();
      });
  }
  ngOnDestroy() {
    if (this._translationChangeSub) {
      this._translationChangeSub.unsubscribe();
    }
    super.ngOnDestroy();
  }
}
