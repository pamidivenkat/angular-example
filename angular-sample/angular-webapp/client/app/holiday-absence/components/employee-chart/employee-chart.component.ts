import { AeIndicatorStyle } from '../../../atlas-elements/common/ae-indicator-style.enum';
import { extractDonutChartData } from '../../common/extract-helpers';
import { FiscalYearSummary } from '../../models/holiday-absence.model';
import { EmployeeSettings, FiscalYear } from '../../../shared/models/company.models';
import { isNullOrUndefined } from 'util';
import { Store } from '@ngrx/store';
import { ChartData } from '../../../atlas-elements/common/ae-chart-data';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation, Input, OnChanges } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { LocaleService, TranslationService } from "angular-l10n";
import { BaseComponent } from "../../../shared/base-component";

@Component({
    selector: 'employee-chart',
    templateUrl: './employee-chart.component.html',
    styleUrls: ['./employee-chart.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeChartComponent extends BaseComponent implements OnInit, OnChanges {
    // Private Fields
    private _width: number = 300;
    private _height: number = 300;
    private _chartData: Immutable.List<ChartData> = Immutable.List<ChartData>();
    _squareIndicator: AeIndicatorStyle = AeIndicatorStyle.Square;
    _legendVertical: AeIndicatorStyle = AeIndicatorStyle.Vertical;
    // End of Private Fields

    // Public properties
    @Input('chartData')
    set chartData(val: Immutable.List<ChartData>) {
        this._chartData = val;
    }
    get chartData(): Immutable.List<ChartData> {
        return this._chartData;
    }
    
    get width(){
        return this._width
    }
    get height(){
        return this._height;
    }
    get squareIndicator(){
        return this._squareIndicator;
    }
    get legendVertical(){
        return this._legendVertical;
    }
    // End of Public properties

    // Public Output bindings
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    // End of Public ViewContent bidnings

    // constructor
    constructor(private _store: Store<fromRoot.State>
        , protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef) {
        super(_localeService, _translationService, _cdRef);

    }
    // End of constructor

    // Private methods
    // End of private methods
    // Public methods

    ngOnInit() {

    }
    ngOnChanges() {
    }
    // End of public methods
}
