import { AeLoaderType } from '../../../atlas-elements/common/ae-loader-type.enum';
import { extractDonutChartData } from '../../common/extract-helpers';
import { ChartData } from './../../../atlas-elements/common/ae-chart-data';
import { EmployeeSettings } from './../../../shared/models/company.models';
import { FiscalYearSummary } from '../../models/holiday-absence.model';
import { isNullOrUndefined } from 'util';
import { Observable, Subscription, BehaviorSubject } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    Input
} from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import * as Immutable from 'immutable';

@Component({
    selector: 'my-holidays-summary',
    templateUrl: './my-holidays-summary.component.html',
    styleUrls: ['./my-holidays-summary.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HolidaysSummaryComponent extends BaseComponent implements OnInit {
    // Private Fields
    private _chartData: BehaviorSubject<Immutable.List<ChartData>>;
    private _employeeSettings: EmployeeSettings;
    private _fiscalYearSummary: FiscalYearSummary;
    private _loaderType: AeLoaderType = AeLoaderType.Bars;
    private _loadingStatus: boolean = false;
    // End of Private Fields
    // Public properties
 
    get loaderType(): AeLoaderType {
        return this._loaderType;
    }

    @Input('loadingStatus')
    get loadingStatus(): boolean {
        return this._loadingStatus
    }
    set loadingStatus(loading: boolean) {
        this._loadingStatus = loading;
    }


    @Input('employeeSettings')
    set employeeSettings(val: EmployeeSettings) {
        this._employeeSettings = val;
        if (!isNullOrUndefined(val)) {
            this._prepareChartData();
        }
    }
    get employeeSettings() {
        return this._employeeSettings;
    }
   

    @Input('fiscalYearSummary')
    set fiscalYearSummary(val: FiscalYearSummary) {
        this._fiscalYearSummary = val;
        if (!isNullOrUndefined(val)) {
            this._prepareChartData();
        }
    }
    get fiscalYearSummary() {
        return this._fiscalYearSummary;
    }
    
    get chartData(){
        return this._chartData;
    }
    // End of Public properties

    // Public Output bindings
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    // End of Public ViewContent bidnings

    // constructor
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _store: Store<fromRoot.State>) {
        super(_localeService, _translationService, _cdRef);
        this._chartData = new BehaviorSubject(Immutable.List<ChartData>());
    }
    // End of constructor
    // start of private methods
    private _prepareChartData() {
        if (!isNullOrUndefined(this._employeeSettings) &&
            !isNullOrUndefined(this._fiscalYearSummary)) {
            let chartData = Immutable.List(extractDonutChartData(this._fiscalYearSummary
                , this._employeeSettings));
            if (!isNullOrUndefined(chartData)) {
                
                this._chartData.next(chartData);
            }
        }
    }
    // End of private methods

    // Public methods
    ngOnInit() {
    }
    // End of public methods
}
