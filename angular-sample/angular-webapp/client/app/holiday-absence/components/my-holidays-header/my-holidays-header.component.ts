import { CommonHelpers } from './../../../shared/helpers/common-helpers';
import { AbsenceType } from '../../common/absence-type.enum';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { FiscalYear, EmployeeSettings } from '../../../shared/models/company.models';
import { mapFiscalYearsToAeSelectItems } from '../../../shared/helpers/extract-helpers';
import { isNullOrUndefined } from 'util';
import { LoadEmployeeSettingsAction, LoadFiscalYearsAction } from '../../../shared/actions/company.actions';
import { Observable, Subscription, BehaviorSubject } from 'rxjs/Rx';
import { extractFiscalYears } from '../../common/extract-helpers';
import { Store } from '@ngrx/store';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import * as Immutable from 'immutable';
import * as fromRoot from '../../../shared/reducers/index';
import { BaseComponent } from '../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { OperationModes, EmployeeConfig, MyAbsenceType } from '../../models/holiday-absence.model';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { AeSelectEvent } from '../../../atlas-elements/common/ae-select.event';
import { DatePipe } from "@angular/common";
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
@Component({
    selector: 'my-holidays-header',
    templateUrl: './my-holidays-header.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class HolidaysHeader extends BaseComponent implements OnInit {
    // Private Fields
    private _fiscalYearList: Array<FiscalYear>;
    private _employeeSettings: EmployeeSettings;
    private _employeeConfig: EmployeeConfig;
    private _headerType: MyAbsenceType;
    private _fiscalYears: Immutable.List<AeSelectItem<string>>;
    private _filters: Map<string, string>;
    private _selectedFiscalYear: string;
    private _canAddHolidays: Observable<boolean>;
    // End of Private Fields

    // Public properties
    @Input('fiscalYears')
    set fiscalYears(val: Array<FiscalYear>) {
        this._fiscalYearList = val;
        this._processFiscalyears();
    }
    get fiscalYears() {
        return this._fiscalYearList;
    }
   

    @Input('employeeSettings')
    set employeeSettings(val: EmployeeSettings) {
        this._employeeSettings = val;
    }
    get employeeSettings() {
        return this._employeeSettings;
    }
   

    @Input('employeeConfig')
    set employeeConfig(val: EmployeeConfig) {
        this._employeeConfig = val;
    }
    get employeeConfig() {
        return this._employeeConfig;
    }
    

    @Input('type')
    set type(val: MyAbsenceType) {
        this._headerType = val;
    }
    get type() {
        return this._headerType;
    }
   
    get fiscalYearsImmList() {
        return this._fiscalYears;
    }
    get selectedFiscalYear() {
        return this._selectedFiscalYear;
    }
    get bcGroup(): BreadcrumbGroup {
        return this._headerType == MyAbsenceType.Holiday ? BreadcrumbGroup.Holidays : BreadcrumbGroup.Absences;
    }
    get canViewAbsenceHistory() {
        return this._employeeSettings && this._employeeSettings.CanEmployeeViewAbsenceHistory;
    }
    // End of Public properties

    // Public Output bindings
    @Output()
    fiscalYearChange: EventEmitter<string> = new EventEmitter<string>();

    @Output()
    addMyAbsence: EventEmitter<OperationModes> = new EventEmitter<OperationModes>();
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    // End of Public ViewContent bidnings

    // constructor
    constructor(private _store: Store<fromRoot.State>
        , protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _claimsHelper: ClaimsHelperService
        , private _datePipe: DatePipe
    ) {
        super(_localeService, _translationService, _cdRef);
        this._filters = new Map<string, string>();
    }
    // End of constructor
    // Private methods


    private _processFiscalyears() {
        if (!isNullOrUndefined(this._fiscalYearList)) {
            this._fiscalYears = mapFiscalYearsToAeSelectItems(this._fiscalYearList);
            this._selectedFiscalYear = this._fiscalYears.get(1).Value;
            this.fiscalYearChange.emit(this._selectedFiscalYear);
        } else {
            this._fiscalYears = Immutable.List([]);
        }
    }


    // End of private methods
    // Public methods
    canApplyAbsence() {
        return !isNullOrUndefined(this.employeeSettings)
            && this.employeeSettings.CanEmployeeAddAbsences;
    }


    /**
    * on fiscal year changes
    * @param {any} event 
    * 
    * @memberOf HolidaysHeader
    */
    public onFiscalYearChange(event: AeSelectEvent<string>) {
        this._selectedFiscalYear = event.SelectedValue;
        this.fiscalYearChange.emit(this._selectedFiscalYear);
    }

    public addedMyAbsence(e) {
        this.addMyAbsence.emit(OperationModes.Add);
    }

    public canApplyHoliday() {
        return !isNullOrUndefined(this.employeeSettings)
            && this.employeeSettings.CanEmployeeAddHolidays;
    }

    public getFullName() {
        let fullName: string = '';
        if (!isNullOrUndefined(this.employeeConfig)) {
            fullName = `${this.employeeConfig.FirstName} ${this.employeeConfig.Surname}`;
        }
        return fullName;
    }

    public isHolidayHeader() {
        return this.type === MyAbsenceType.Holiday;
    }

    public isAbsenceHeader() {
        return this.type === MyAbsenceType.Absence;
    }

    ngOnInit() {

    }
    // End of public methods
}
