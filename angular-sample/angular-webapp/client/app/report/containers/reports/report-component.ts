import { Tristate } from '../../../atlas-elements/common/tristate.enum';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { isNullOrUndefined } from 'util';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { AePageChangeEventModel } from '../../../atlas-elements/common/models/ae-page-change-event-model';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { LoadReportCategories } from '../../../shared/actions/lookup.actions';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { Report } from '../../models/report';
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import {
    LoadReportsAction,
    LoadReportsInformationComponentAction,
    PublishReport,
    RemoveReport
} from '../../actions/report-actions';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import * as fromRoot from '../../../shared/reducers';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import * as Immutable from 'immutable';
import * as fromConstants from '../../../shared/app.constants';

@Component({
    selector: 'report',
    templateUrl: './report-component.html',
    styleUrls: ['./report-component.scss']
})
export class ReportsComponent extends BaseComponent implements OnInit, OnDestroy {
    // Private Fields
    private _reportsInformationBarItems$: Observable<AeInformationBarItem[]>;
    private _reportsList$: Observable<Immutable.List<Report>>;
    private _reportCategories$: Observable<Immutable.List<AeSelectItem<string>>>;
    private _totalRecords$: Observable<number>;
    private _dataTableOptions$: Observable<DataTableOptions>;
    private _actions: Immutable.List<AeDataTableAction>;
    private _viewReport: Subject<Report> = new Subject();
    private _viewDesigner: Subject<Report> = new Subject();
    private _removeReport: Subject<Report> = new Subject();
    private _publishReport: Subject<Report> = new Subject();
    private _showRemoveDialog: boolean = false;
    private _currentReportItem: Report;
    private _viewReportSubscription$: Subscription;
    private _viewDesignerSubscription$: Subscription;
    private _removeReportSubscription$: Subscription;
    private _publishReportSubscription$: Subscription;
    private _loadingStatus$: Observable<boolean>;
    // End of Private Fields

    // Public properties
    get showRemoveDialog(): boolean {
        return this._showRemoveDialog;
    }
    get loadingStatus$(): Observable<boolean> {
        return this._loadingStatus$;
    }
    get dataTableOptions$(): Observable<DataTableOptions> {
        return this._dataTableOptions$;
    }
    get reportsList$(): Observable<Immutable.List<Report>> {
        return this._reportsList$;
    }
    get totalRecords$(): Observable<number> {
        return this._totalRecords$;
    }
    get actions(): Immutable.List<AeDataTableAction> {
        return this._actions;
    }
    get reportsInformationBarItems$(): Observable<AeInformationBarItem[]> {
        return this._reportsInformationBarItems$;
    }

    get reportCategories$(): Observable<Immutable.List<AeSelectItem<string>>> {
        return this._reportCategories$;
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
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService) {
        super(_localeService, _translationService, _cdRef);
    }
    // End of constructor

    // Private methods

    /**
     * 
     * 
     * @private
     * @param {AeSortModel} $event 
     * 
     * @memberOf ReportsComponent
     */
    onPageSort(sortModel: AeSortModel) {
        this._store.dispatch(new LoadReportsAction({ sortField: sortModel.SortField, direction: sortModel.Direction }));
    }


    /**
     * 
     * 
     * @private
     * @param {AePageChangeEventModel} $event 
     * 
     * @memberOf ReportsComponent
     */
    onPageChanged($event: AePageChangeEventModel) {
        this._store.dispatch(new LoadReportsAction({ pageNumber: $event.pageNumber, pageSize: $event.noOfRows }));
    }


    /**
     * 
     * 
     * @private
     * @param {string} $event 
     * 
     * @memberOf ReportsComponent
     */
    onReportCategorySelection($event: string) {
        this._store.dispatch(new LoadReportsAction({
            'reportCategoryFilter': $event,
            pageNumber: 1,
            pageSize: 10,
            sortField: 'Name',
            direction: SortDirection.Ascending
        }));
    }

    /**
    * 
    * 
    * @private
    * @returns 
    * 
    * @memberOf ReportListComponent
    */
    private _showViewReport(): boolean {
        return this._claimsHelper.canDesignAtlasReports();
    }


    /**
     * opens the reporting app URL in new window
     * 
     * @private
     * @param {Report} report 
     * 
     * @memberOf ReportListComponent
     */
    private _viewReportB(report: Report) {
        const reportURL = fromConstants.reportingURL + "/reporting/report/viewreport/" + report.Id + '?version=' + report.Version;
        window.open(reportURL, "_blank");
    }


    /**
     * 
     * opens the reporting app URL designer in new window
     * @private
     * @param {Report} report 
     * 
     * @memberOf ReportListComponent
     */
    private _reportDesigner(report: Report) {
        const reportingURL = fromConstants.reportingURL + "/reporting/report/design/" + report.Id;
        window.open(reportingURL, "_blank");
    }

    /**
        * 
        * 
        * @private
        * @param {*} $event 
        * 
        * @memberOf ReportListComponent
        */
    private closeReportModal() {
        this._currentReportItem = null;
        this._showRemoveDialog = false;
    }


    /**
     * 
     * 
     * @private
     * 
     * @memberOf ReportListComponent
     */
    removeReportOnConfirmation() {
        if (!isNullOrUndefined(this._currentReportItem)) {
            this._store.dispatch(new RemoveReport(this._currentReportItem.Id));
        }
        this._currentReportItem = null;
        this._showRemoveDialog = false;
    }

    // End of private methods

    // Public methods
    ngOnInit() {
        if (this._showViewReport()) {
            this._actions = Immutable.List([
                new AeDataTableAction("View", this._viewReport, false),
                new AeDataTableAction("Design", this._viewDesigner, false),
                new AeDataTableAction("Publish", this._publishReport, false, (item) => { return this._showPublishReportAction(item) }),
                new AeDataTableAction("Remove", this._removeReport, false)

            ]);
        }
        else {
            this._actions = Immutable.List([
                new AeDataTableAction("View", this._viewReport, false)
            ]);
        }
        const employeeId = this._claimsHelper.getEmpIdOrDefault();
        this._store.dispatch(new LoadReportsInformationComponentAction(employeeId));
        this._store.dispatch(new LoadReportCategories(true));
        this._store.dispatch(new LoadReportsAction({
            pageNumber: 1,
            pageSize: 10,
            sortField: 'Name',
            direction: SortDirection.Ascending
        }));
        this._reportsInformationBarItems$ = this._store.let(fromRoot.getReportsInformationItems);
        this._reportsList$ = this._store.let(fromRoot.getReportsList);
        this._reportCategories$ = this._store.let(fromRoot.getReportCategories);
        this._totalRecords$ = this._store.let(fromRoot.getReportsTotalCount);
        this._dataTableOptions$ = this._store.let(fromRoot.getReportsDataTableOptions);
        this._loadingStatus$ = this._store.let(fromRoot.getReportsLoadingStatus);
        this._viewReportSubscription$ = this._viewReport.subscribe(report => {
            if (!isNullOrUndefined(report)) {
                const reportURL = fromConstants.reportingURL + "/reporting/report/viewreport/" + report.Id + '?version=' + report.Version;
                window.open(reportURL, "_blank");
            }
        });

        this._viewDesignerSubscription$ = this._viewDesigner.subscribe((report) => {
            if (!isNullOrUndefined(report)) {
                const reportingURL = fromConstants.reportingURL + "/reporting/report/design/" + report.Id;
                window.open(reportingURL, "_blank");
            }
        });

        this._removeReportSubscription$ = this._removeReport.subscribe((report) => {
            if (!isNullOrUndefined(report)) {
                this._currentReportItem = report;
                this._showRemoveDialog = true;
            }
        });

        this._publishReportSubscription$ = this._publishReport.subscribe((report) => {
            if (!isNullOrUndefined(report)) {
                this._store.dispatch(new PublishReport(report.Id));
            }
        });
    }

    private _showPublishReportAction(report: Report): Tristate {
        if (report.IsPublished) {
            return Tristate.False;
        }
        return Tristate.True;
    }

    ngOnDestroy(): void {
        if (!isNullOrUndefined(this._viewReportSubscription$)) {
            this._viewReportSubscription$.unsubscribe();
        }

        if (!isNullOrUndefined(this._viewDesignerSubscription$)) {
            this._viewDesignerSubscription$.unsubscribe();
        }

        if (!isNullOrUndefined(this._removeReportSubscription$)) {
            this._removeReportSubscription$.unsubscribe();
        }

        if (!isNullOrUndefined(this._publishReportSubscription$)) {
            this._publishReportSubscription$.unsubscribe();
        }
    }
    // End of public methods

}