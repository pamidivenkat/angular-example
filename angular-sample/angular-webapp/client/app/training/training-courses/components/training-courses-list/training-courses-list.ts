import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { AePageChangeEventModel } from '../../../../atlas-elements/common/models/ae-page-change-event-model';
import { AeSortModel } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AeInputType } from '../../../../atlas-elements/common/ae-input-type.enum';
import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Rx';
import { TrainingCourse } from '../../../models/training-course';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
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
import { ActivatedRoute } from '@angular/router';
import * as fromRoot from '../../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { TrainingCourseService } from '../../services/training-courses.service';
import { Subscription } from "rxjs/Rx";

@Component({
    selector: 'training-courses-list',
    templateUrl: './training-courses-list.html',
    styleUrls: ['./training-courses-list.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TrainingCourseListComponent extends BaseComponent implements OnInit, OnDestroy {
    // Private Fields
    private _trainingCourseCategories: Immutable.List<AeSelectItem<string>>;
    private _trainingCourseList$: Observable<Immutable.List<TrainingCourse>>;
    private _statusTypes: Immutable.List<AeSelectItem<string>>;
    private _recordsCount$: Observable<number>;
    private _dataTableOptions: DataTableOptions;
    private _pageChanged: EventEmitter<AePageChangeEventModel>;
    private _onSort: EventEmitter<AeSortModel>;
    private _actions: Immutable.List<AeDataTableAction>
    private _loadingStatus: boolean;
    private _filters: Map<string, string>;
    private _searchDebounce: number;
    private _inputType: AeInputType;
    private _keys = Immutable.List(['Id', 'Title', 'Description', 'Version', 'Type', 'CreatedOn', 'IsCompleted', 'IsExample']);
    private _defaultCourseSearch = "";
    private _queryParamsSubscription: Subscription;
    // End of Private Fields

    // Public properties
    get defaultCourseSearch(): string {
        return this._defaultCourseSearch;
    }
    get searchDebounce(): number {
        return this._searchDebounce;
    }

    get inputType(): AeInputType {
        return this._inputType;
    }

    get statusTypes(): Immutable.List<AeSelectItem<string>> {
        return this._statusTypes;
    }

    get keys(): any {
        return this._keys;
    }

    get recordsCount$(): Observable<number> {
        return this._recordsCount$;
    }

    @Input('loadingStatus')
    get loadingStatus(): boolean {
        return this._loadingStatus;
    }
    set loadingStatus(loadingStatus: boolean) {
        this._loadingStatus = loadingStatus;
    }
    @Input('trainingCourses')
    get trainingCourseList() {
        return this._trainingCourseList$;
    }
    set trainingCourseList(trainingCourseList: Observable<Immutable.List<TrainingCourse>>) {
        this._trainingCourseList$ = trainingCourseList;
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
    // constructor
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _TrainingCourseService: TrainingCourseService
        , private _router: ActivatedRoute) {
        super(_localeService, _translationService, _cdRef);
        this._pageChanged = new EventEmitter<AePageChangeEventModel>();
        this._onSort = new EventEmitter<AeSortModel>();
        this._searchDebounce = 400;
        this._inputType = AeInputType.search;
    }
    // End of constructor
    private _setFilters(key: string, value: string) {
        if (this._filters === null) {
            this._filters = new Map<string, string>();
        }
        if (this._filters.has(key)) {
            this._filters.delete(key);
        }
        this._filters.set(key, value);
        this._TrainingCourseService.LoadTrainingCourseOnFilterChange(this._filters);
    }
    // Private methods
    /**
     * 
     * 
     * @private
     * @param {AePageChangeEventModel} pageChangeEventModel 
     * 
     * @memberOf TrainingCourseListComponent
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
     * @memberOf TrainingCourseListComponent
     */
    onPageSort(aeSortModel: AeSortModel) {
        this._onSort.emit(aeSortModel);
    }


    courseType(isExample: boolean): string {
        return isExample ? "Standard" : "Customised";
    }

    // Public methods
    ngOnInit() {
        this._filters = new Map<string, string>();
        this._filters.set('TrainingCourseIsCompleteFilter', '0');
        this._queryParamsSubscription = this._router.queryParams.subscribe((queryParamList) => {
            this._defaultCourseSearch = queryParamList['course'];
            if (isNullOrUndefined(this._defaultCourseSearch)) {
                this._defaultCourseSearch = "";
            }
            this._setFilters('TrainingCourseTitleFilter', this._defaultCourseSearch);
        })
        this._statusTypes = Immutable.List([new AeSelectItem<string>('All status', ''),
        new AeSelectItem<string>('Active', '0'), new AeSelectItem<string>('In-Active', '1')]);
    }
    onSearchTextChange($event: any) {
        if (!isNullOrUndefined($event.event.target.value && $event.event.target.value !== "")) {
            this._setFilters('TrainingCourseTitleFilter', $event.event.target.value);
        }
        else {
            this._filters.delete('TrainingCourseTitleFilter');
            this._TrainingCourseService.LoadTrainingCourseOnFilterChange(this._filters);
        }
    }
    onStatusTypeChange($event: any) {
        if (!isNullOrUndefined($event.SelectedValue) && $event.SelectedValue !== "") {
            this._setFilters('TrainingCourseIsCompleteFilter', $event.SelectedValue.toString());
        }

        else {
            this._filters.delete('TrainingCourseIsCompleteFilter');
            this._TrainingCourseService.LoadTrainingCourseOnFilterChange(this._filters);
        }
    }

    ngOnDestroy() {
        this._queryParamsSubscription.unsubscribe();
    }
    // End of public methods
}