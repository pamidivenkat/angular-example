import { Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ChartData } from '../../../atlas-elements/common/ae-chart-data';
import * as Immutable from 'immutable';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'risk-chart',
  templateUrl: './risk-chart.component.html',
  styleUrls: ['./risk-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskChartComponent extends BaseComponent implements OnInit {
  private _width: number = 180;
  private _height: number = 180;
  private _chartData: Immutable.List<ChartData>;
  private _riskMatrix: Map<number, number[]>;
  private _riskData;
  private _riskValue: number;
  private _riskColor: string;

  constructor(
    protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef) {
    super(_localeService, _translationService, _cdRef);
    this._riskMatrix = new Map<number, number[]>();
    this._riskMatrix.set(0, [3, 5, 9, 3]); //[low value, medium value, max value, matrix size(3x3)]
    this._riskMatrix.set(1, [4, 10, 25, 5]);
    this._riskMatrix.set(2, [10, 30, 81, 9]);
  }

  private _roundedPercent(value, max) {
    return Math.round(value / max * 100);
  }

  // Public properties
  @Input('chartData')
  set chartData(val: Immutable.List<ChartData>) {
    this._chartData = val;
  }
  get chartData(): Immutable.List<ChartData> {
    return this._chartData;
  }
  

  @Input('riskData')
  get riskData() {
    return this._riskData;
  }
  set riskData(val) {
    if (!isNullOrUndefined(val)) {
      this.prepareChartData(val.value[0], val.value[1]);
    }
  }

  // End of Public properties

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get riskValue(): number {
    return this._riskValue;
  }

  get riskColor(): string {
    return this._riskColor;
  }

  prepareChartData(riskValue: number, matrix: number) {
    if (isNullOrUndefined(riskValue) || isNullOrUndefined(matrix) || riskValue <= 0) return;
    let chartList = [];
    let remaining: number;
    let low = this._riskMatrix.get(matrix)[0] - 1;
    let medium = this._riskMatrix.get(matrix)[1] - 1;
    let maxRisk = this._riskMatrix.get(matrix)[2] - 1;
    this._riskValue = riskValue;

    if (riskValue <= low) {
      chartList.push(new ChartData(this._roundedPercent(riskValue, maxRisk), '#7fc395', '', '#7fc395'));
      remaining = maxRisk - riskValue;
      this._riskColor = this._translationService.translate('RISK_CLASS.GREEN');
    } else {
      chartList.push(new ChartData(this._roundedPercent(low, maxRisk), '#7fc395', '', '#7fc395'));

      if (riskValue <= medium && riskValue > low) {
        chartList.push(new ChartData(this._roundedPercent(riskValue - low, maxRisk), '#fdc649', '', '#fdc649'));
        remaining = maxRisk - riskValue;
      } else {
        chartList.push(new ChartData(this._roundedPercent(medium - low, maxRisk), '#fdc649', '', '#fdc649'));
      }
      this._riskColor = this._translationService.translate('RISK_CLASS.YELLOW');
    }

    if (riskValue > medium) {
      chartList.push(new ChartData(this._roundedPercent(riskValue - medium, maxRisk), '#e51941', '', '#e51941'));
      remaining = maxRisk - riskValue;
      this._riskColor = this._translationService.translate('RISK_CLASS.RED');
    }

    chartList.push(new ChartData(this._roundedPercent(remaining, maxRisk), 'white', '', 'white'));

    this._chartData = Immutable.List(chartList);
  }

  ngOnInit() {
    //this._riskData.
  }

}
