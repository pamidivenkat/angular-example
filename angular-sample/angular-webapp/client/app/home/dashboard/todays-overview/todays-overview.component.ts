import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { Observable } from 'rxjs/Rx';

import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { AeInformationBarItemType } from '../../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { StringHelper } from '../../../shared/helpers/string-helper';
import * as fromRoot from '../../../shared/reducers/index';
import { TodaysOverviewLoadAction } from '../../actions/todays-overview.actions';
import { StatisticsInformation } from '../../models/statistics-information';
import { approvedAbsenceStatusId } from './../../../shared/app.constants';

@Component({
    selector: 'todays-overview',
    templateUrl: './todays-overview.component.html',
    styleUrls: ['./todays-overview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodaysOverviewComponent extends BaseComponent implements OnInit {
    // Private Fields
    private _statisticCodeRef = AeInformationBarItemType;
    private _companyName: string;
    private _isLoading: boolean = true;
    private _overviewList: Immutable.List<StatisticsInformation<string>>;
    private _linkStyle: AeClassStyle = AeClassStyle.NavLink;
    private _todaysOverview$: Observable<Immutable.List<StatisticsInformation<string>>>;
    private _isLoading$: Observable<boolean>;
    private _docReviewText: string;
    private _taskDueTodayText: string;
    private _applyScroll: boolean = true;
    private _maxHeight: string = '20em';
    private _iconBig: AeIconSize = AeIconSize.big;
    // End of Private Fields

    // Public properties
    get todaysOverview$(): Observable<Immutable.List<StatisticsInformation<string>>> {
        return this._todaysOverview$;
    }
    get statisticCodeRef(): typeof AeInformationBarItemType {
        return this._statisticCodeRef;
    }
    get overviewList(): Immutable.List<StatisticsInformation<string>> {
        return this._overviewList;
    }
    set overviewList(val: Immutable.List<StatisticsInformation<string>>) {
        this._overviewList = val;
    }
    get companyName(): string {
        return this._companyName;
    }
    get linkStyle(): AeClassStyle {
        return this._linkStyle;
    }
    get isLoading(): boolean {
        return this._isLoading;
    }
    set isLoading(val: boolean) {
        this._isLoading = true;
    }
    // End of Public properties

    // Constructor
    constructor(_localeService: LocaleService
        , _translationService: TranslationService
        , _cdRef: ChangeDetectorRef
        , private _store: Store<fromRoot.State>
        , private _router: Router
        , private _claimsHelper: ClaimsHelperService
    ) {
        super(_localeService, _translationService, _cdRef);
    }
    // End of constructor  

    // Private methods
    getTasksText(tasksCount: number): string {
        return tasksCount > 1 ? this._taskDueTodayText = this.translation.translate('TODAYSOVERVIEW.Tasks_due_today') : this.translation.translate('TODAYSOVERVIEW.Task_due_today');
    }

    getDocsText(): string {
        return this.translation.translate('TODAYSOVERVIEW.Documents_to_review');
    }

    hasOverviewItems() {
        return this._overviewList && this._overviewList.count() > 0;
    }

    onEmployeeRequestsClick(id: string, employeeName: string) {
        let url: string = 'absence-management/requests/' + id;
        this._router.navigate([url], { queryParams: { employee: employeeName, statusId: approvedAbsenceStatusId, range: 'ThisWeek' } });
    }

    onEmployeeClick(id: string) {
        let url: string = "employee/edit/" + id + '/job';
        this._router.navigate([url]);
    }

    linkToRiskAssessments() {
        let url: string = "risk-assessment/overdue";
        this._router.navigate([url]);
    }

    linkToChecklists() {
        let url: string = "checklist/company-checklists";
        this._router.navigate([url]);
    }

    onDueTaskClick(e) {
        this._router.navigate(['task/view/mine'], { queryParams: { due: AeInformationBarItemType.DueTodayTask.toString() } });
    }

    onDocumentClick(e) {
        this._router.navigate(['/document/shared/distributed']);
    }

    getChildOfTasksDue() {
        return `${this.id}_tasksduelink`;
    }

    getChildOfDocuments() {
        return `${this.id}_distdoclink`;
    }

    getChildWorkAnniversary(): string {
        return `${this.id}_employeeAnniversary`;
    }

    getChildChecklistDueThisWeek(): string {
        return `${this.id}_checklistsdue`;
    }

    getChildRADueThisWeek(): string {
        return `${this.id}_RAsdue`;
    }

    getChildOfTeamOutOffice(): string {
        return `${this.id}_teamOutOffice`;
    }

    // End of Private methods

    // Public methods
    getName(data: string): string {
        return data.split('#')[0];
    }

    getDepartmentOrCompany(data: string) {
        let deptName = '';
        if (data.split('#').length > 1) {
            deptName = data.split('#')[1].trim();
        } else {
            deptName = data.split('#')[1];
        }
        return StringHelper.isNullOrUndefinedOrEmpty(deptName) ? this._companyName : deptName;
    }

    getStartDate(data: string): string {
        let parts = data.split('#');
        return parts[1].substr(0, 10);
    }
    getEndDate(data: string): string {
        let parts = data.split('#');
        return parts[2].substr(0, 10);
    }

    ngOnInit() {
        this._companyName = this._claimsHelper.getCompanyName();
        this._store.dispatch(new TodaysOverviewLoadAction({ EmployeeId: this._claimsHelper.getEmpIdOrDefault() }));
        this._todaysOverview$ = this._store.let(fromRoot.getTOData);
        this._isLoading$ = this._store.let(fromRoot.getTOLoadingState);

        this._isLoading$.subscribe(loading => {
            this._isLoading = loading;
            this._cdRef.markForCheck();
        });

        this._todaysOverview$.subscribe(todayOverviewItems => {
            this._overviewList = todayOverviewItems;
            this._cdRef.markForCheck();
        });
    }
    // End of public methods

    getMaxHeight(): string {
        if (this._applyScroll && !StringHelper.isNullOrUndefinedOrEmpty(this._maxHeight)) {
            return this._maxHeight;
        }
        return null;
    }

    hasScroll(): boolean {
        if (this._applyScroll) {
            return true;
        }
        return null;
    }
}
