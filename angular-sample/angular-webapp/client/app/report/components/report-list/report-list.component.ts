import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { AePageChangeEventModel } from '../../../atlas-elements/common/models/ae-page-change-event-model';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Rx';
import { Report } from '../../models/report';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import * as Immutable from 'immutable';

@Component({
    selector: 'report-list',
    templateUrl: './report-list.component.html',
    styleUrls: ['./report-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ReportListComponent extends BaseComponent implements OnInit, OnDestroy {
    // Private Fields
    private _reportCategories: Immutable.List<AeSelectItem<string>>;
    private _reportList$: Observable<Immutable.List<Report>>;
    private _recordsCount$: Observable<number>;
    private _dataTableOptions: DataTableOptions;
    private _onReportCategorySelect: EventEmitter<string>;
    private _pageChanged: EventEmitter<AePageChangeEventModel>;
    private _onSort: EventEmitter<AeSortModel>;
    private _reportCategory: string;
    private _currentActionItemId: string;
    private _actions: Immutable.List<AeDataTableAction>
    private _loadingStatus: boolean;
    private _keys = Immutable.List(['Id', 'Name', 'CategoryId', 'Version']);

    // End of Private Fields

    // Public properties

    get keys(): Immutable.List<string> {
        return this._keys;
    }

    get reportCategory(): string {
        return this._reportCategory;
    }

    @Input('loadingStatus')
    get loadingStatus(): boolean {
        return this._loadingStatus;
    }
    set loadingStatus(loadingStatus: boolean) {
        this._loadingStatus = loadingStatus;
    }

    @Input('categories')
    get categories() {
        return this._reportCategories;
    }
    set categories(reportCategories: Immutable.List<AeSelectItem<string>>) {
        this._reportCategories = reportCategories;
    }

    @Input('itemsList')
    get reportsList() {
        return this._reportList$;
    }
    set reportsList(reportList: Observable<Immutable.List<Report>>) {
        this._reportList$ = reportList;
    }

    @Input('totalRecords')
    get totalRecords() {
        return this._recordsCount$;
    }
    set totalRecords(recordsCount$: Observable<number>) {
        this._recordsCount$ = recordsCount$;
    }

    @Input('dataTableOptions')
    get dataTableOptions() {
        return this._dataTableOptions;
    }
    set dataTableOptions(dataTableOptions: DataTableOptions) {
        this._dataTableOptions = dataTableOptions;
    }
    @Input('actions')
    get actions() {
        return this._actions;
    }
    set actions(actions: Immutable.List<AeDataTableAction>) {
        this._actions = actions;
    }

    // Public Output bindings
    @Output('pageChanged')
    get pageChanged() {
        return this._pageChanged;
    }

    @Output('onPageSort')
    get onSort() {
        return this._onSort;
    }

    @Output('onReportCategorySelection')
    get onReportCategorySelect() {
        return this._onReportCategorySelect;
    }

    @HostListener('mouseout') onMouseOut() {
        this._currentActionItemId = null;
    }
    // End of Public Output bindings

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
        , private _claimsHelper: ClaimsHelperService
    ) {
        super(_localeService, _translationService, _cdRef);
        this._reportCategory = '';
        this._onReportCategorySelect = new EventEmitter<string>();
        this._pageChanged = new EventEmitter<AePageChangeEventModel>();
        this._onSort = new EventEmitter<AeSortModel>();
    }
    // End of constructor



    // Private methods

    /**
     * 
     * 
     * @private
     * @param {string} categoryId 
     * @returns 
     * 
     * @memberOf ReportListComponent
     */
    getCategoryName(categoryId: string): string {
        if (isNullOrUndefined(this._reportCategories)) return "";

        let reportCategory = this._reportCategories.find(x => x.Value == categoryId);
        if (!isNullOrUndefined(reportCategory))
            return reportCategory.Text;
        return "";
    }


    /**
     * 
     * 
     * @private
     * @param {AePageChangeEventModel} pageChangeEventModel 
     * 
     * @memberOf ReportListComponent
     */
    onPageChange(pageChangeEventModel: AePageChangeEventModel) {
        this._pageChanged.emit(pageChangeEventModel);

    }


    /**
     * 
     * 
     * @private
     * @param {AeSortModel} aeSortModel 
     * 
     * @memberOf ReportListComponent
     */
    onPageSort(aeSortModel: AeSortModel) {
        this._onSort.emit(aeSortModel);
    }


    /**
     * 
     * 
     * @private
     * @param {*} $event 
     * 
     * @memberOf ReportListComponent
     */
    onReportCategoryChange(selectedValue: string) {
        if (selectedValue == "Other") {
            selectedValue = 'null';
        }
        this._onReportCategorySelect.emit(selectedValue);
    }


    /**
     * 
     * 
     * @private
     * @param {Report} report 
     * 
     * @memberOf ReportListComponent
     */
    private _setCurrentItem(report: Report) {
        if (this._currentActionItemId == report.Id)
            this._currentActionItemId = null;
        else
            this._currentActionItemId = report.Id;
    }


    /**
     *
     * 
     * @private
     * @param {string} currentItemId 
     * @returns 
     * 
     * @memberOf ReportListComponent
     */
    private _viewOptions(currentItemId: string): boolean {
        if (isNullOrUndefined(this._currentActionItemId)) {
            return false;
        }
        return this._currentActionItemId == currentItemId;
    }

    // End of private methods

    // Public methods
    ngOnInit() {

    }

    ngOnDestroy() {

    }
    // End of public methods
}