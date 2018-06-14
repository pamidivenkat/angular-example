import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { AeInputType } from '../../../atlas-elements/common/ae-input-type.enum';
import { AeLoaderType } from '../../../atlas-elements/common/ae-loader-type.enum';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { Document } from '../../../document/models/document';
import { MyTraining } from '../../../home/models/my-training';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../shared/reducers/index';
import { RouteParams } from '../../../shared/services/route-params';
import { ScormService } from '../../../shared/services/scorm-service';
import {
    LoadTrainingsOnFilterChangeAction,
    LoadTrainingsOnPageChangeAction,
    LoadTrainingsOnSortAction,
    UpdateTrainingCourse,
    UpdatePassedTrainings,
} from '../../actions/training-list.actions';
import { TrainingStatus } from '../../models/training-status';
import { TrainingService } from '../../services/training-service';
import { AeDatasourceType } from './../../../atlas-elements/common/ae-datasource-type';
import { getAeSelectItemsArrayFromEnum } from './../../../employee/common/extract-helpers';
import { StringHelper } from './../../../shared/helpers/string-helper';
import { getStatusText, getStatusValues } from './../../common/extract-helper';
import { TrainingReportProgress } from './../../common/training-report-view';

@Component({
    selector: 'training-list',
    templateUrl: './training-list.component.html',
    styleUrls: ['./training-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TrainingListComponent extends BaseComponent implements OnInit, OnDestroy {
    //Private variables
    private _trainings: Observable<Immutable.List<MyTraining>>;
    private _trainingsLoading: Observable<boolean>;
    private _keys = Immutable.List(['Id', 'CourseTitle', 'ModuleTitle', 'PassDate', 'StartDate', 'Status', 'Certificates', 'Link']);
    private _totalRecords: Observable<number>;
    private _dataTableOptions: Observable<DataTableOptions>;
    private _pagingInfo: PagingInfo;
    private _filters: Map<string, string>;
    private _trainingListSubscription: Subscription;
    private _statusOptions: Immutable.List<AeSelectItem<string>>;
    private _trainingStatus: Array<AeSelectItem<number>>
    private _searchDebounce: number;
    private _inputType: AeInputType;
    private _searchPlaceHolder: string;
    private _selectedStatus$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    private _lightClass: AeClassStyle = AeClassStyle.Light;
    private _currentMyTraining: MyTraining;
    private _queryParamsSubscription: Subscription;
    private _filterBy: string;
    private _filterValue: string;
    private _initialSearchText$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    private _localDataSourceType: AeDatasourceType = AeDatasourceType.Local;
    private _trainingListForm: FormGroup;
    private _showTraining: boolean;
    private _trustedUrl: SafeResourceUrl;
    private _loaderBars: AeLoaderType = AeLoaderType.Bars;

    public moduleTitle: string;
    public isCourseLoaded: boolean;
    //End of Private variables

    get loaderBars(): AeLoaderType {
        return this._loaderBars;
    }
    get trainingListForm(): FormGroup {
        return this._trainingListForm;
    }
    get localDataSourceType(): AeDatasourceType {
        return this._localDataSourceType;
    }
    get trainingStatus(): Array<AeSelectItem<number>> {
        return this._trainingStatus;
    }
    get searchPlaceHolder(): string {
        return this._searchPlaceHolder;
    }

    get searchDebounce(): number {
        return this._searchDebounce;
    }

    get inputType(): AeInputType {
        return this._inputType;
    }

    get statusOptions(): Immutable.List<AeSelectItem<string>> {
        return this._statusOptions;
    }

    get selectedStatus$(): BehaviorSubject<string> {
        return this._selectedStatus$;
    }

    get totalRecords(): Observable<number> {
        return this._totalRecords;
    }

    get dataTableOptions(): Observable<DataTableOptions> {
        return this._dataTableOptions;
    }

    get trainingsLoading(): Observable<boolean> {
        return this._trainingsLoading;
    }

    get keys(): any {
        return this._keys;
    }

    get trainings(): Observable<Immutable.List<MyTraining>> {
        return this._trainings;
    }

    get lightClass(): AeClassStyle {
        return this._lightClass;
    }
    get initialSearchText$(): BehaviorSubject<string> {
        return this._initialSearchText$;
    }
    get showTraining(): boolean {
        return this._showTraining;
    }
    get trustedUrl(): SafeResourceUrl {
        return this._trustedUrl;
    }
    private _initForm() {
        this._trainingListForm = this._fb.group({
            courseName: null,
            status: []
        });
    }
    private _patchForm(courseName: string, status: AeSelectItem<number>[]) {
        this._trainingListForm.patchValue({
            courseName: courseName,
            status: status
        });
    }
    private _updatePassedTrainings() {
        let passedTrainingIds: Array<string> = [];

        for (let key in window.localStorage) {
            if (key.indexOf('lesson_status') > 0 && window.localStorage[key].indexOf('pass') > -1) {
                passedTrainingIds.push(key.substring(0, 36))
            }
        }

        if (passedTrainingIds.length > 0) {
            this._store.dispatch(new UpdatePassedTrainings(passedTrainingIds));
        }
    }
    //Constructor
    constructor(_localeService: LocaleService,
        _translationService: TranslationService,
        _cdRef: ChangeDetectorRef,
        private _store: Store<fromRoot.State>,
        private _claimsHelper: ClaimsHelperService,
        private _trainingService: TrainingService,
        private _routeParams: RouteParams,
        private _scormService: ScormService
        , private _router: ActivatedRoute
        , private _fb: FormBuilder
        , private _sanitizer: DomSanitizer
    ) {
        super(_localeService, _translationService, _cdRef);
        this._searchDebounce = 400;
        this._inputType = AeInputType.search;
        this._searchPlaceHolder = 'Course/Module';
        this._statusOptions = Immutable.List([new AeSelectItem<string>('All Results', '', false)
            , new AeSelectItem<string>('Passed', '1', false)
            , new AeSelectItem<string>('Pending', '2', false)
            , new AeSelectItem<string>('Failed', '3', false)
            , new AeSelectItem<string>('Complete', '4', false)
            , new AeSelectItem<string>('Incomplete', '5', false)]);
        this._selectedStatus$.next('');
        this._trainingsLoading = Observable.of(true);
        //Setting default filters
        this._filters = new Map<string, string>();
        this._filters.set('MyTrainingsFilter', this._claimsHelper.getUserId());
        this._filters.set('filterOnlyInCompletedCoursesForMyTrainings', 'true');
        //End of default filters
        this._trainings = Observable.of(Immutable.List<MyTraining>([]));
        this._showTraining = false;
        this.isCourseLoaded = false;
    }
    //End of constructor

    //On Destroy
    ngOnDestroy(): void {
        if (!isNullOrUndefined(this._trainingListSubscription))
            this._trainingListSubscription.unsubscribe();
        if (this._queryParamsSubscription) {
            this._queryParamsSubscription.unsubscribe();
        }
    }
    //End of on destroy
    //On InitT
    ngOnInit(): void {
        this._updatePassedTrainings();
        this._initForm();
        this._trainingStatus = getAeSelectItemsArrayFromEnum(TrainingReportProgress).filter(obj => obj.Text.toLowerCase() != 'all');
        this._trainingsLoading = this._store.let(fromRoot.getTrainingsLoadingStatus);
        this._queryParamsSubscription = this._router.params.subscribe((queryParamList) => {
            let status = [];
            let courseName: string = null;
            this._filterBy = queryParamList['filterBy'];
            this._filterValue = queryParamList['filterValue'];
            if ((!isNullOrUndefined(this._filterBy) && !isNullOrUndefined(this._filterValue) && this._filterBy == 'byname')) {
                this._filters.set('MyTrainingsByCourseOrModuleTitle', this._filterValue);
                courseName = this._filterValue;
                //this._initialSearchText$.next(this._filterValue);
            }
            if ((!isNullOrUndefined(this._filterBy) && !isNullOrUndefined(this._filterValue) && this._filterBy == 'byid')) {
                this._filters.set('TrainingUserCourseModuleByIdFilter', this._filterValue);
            }
            if ((!isNullOrUndefined(this._filterBy) && !isNullOrUndefined(this._filterValue) && this._filterBy == 'status')) {
                if (this._filterValue == 'outstanding') {
                    let statusParam = TrainingReportProgress.Pending + ',' + TrainingReportProgress.Incomplete;
                    status = [new AeSelectItem<number>(getStatusText(TrainingReportProgress.Pending), TrainingReportProgress.Pending)
                        , new AeSelectItem<number>(getStatusText(TrainingReportProgress.Incomplete), TrainingReportProgress.Incomplete)
                    ]
                    this._filters.set('trainingReportMultiStatusFilter', statusParam);
                    //this._selectedStatus$.next(TrainingStatus.Pending.toString());
                }
            }
            this._patchForm(courseName, status);
            this._trainingService._setDefaultFilters(this._filters);
            this._trainingService._loadTrainings();
        });
        this._trainings = this._store.let(fromRoot.getTrainingsInfoData);
        this._totalRecords = this._store.let(fromRoot.getTrainingsListTotalCount);
        this._dataTableOptions = this._store.let(fromRoot.getTrainingsListDataTableOptions);
        this._trainingListSubscription = this._trainingListForm.valueChanges.subscribe(data => {
            this._setFilters('MyTrainingsByCourseOrModuleTitle', data.courseName);
            this._filters.set('trainingReportMultiStatusFilter', getStatusValues(data));

            this._store.dispatch(new LoadTrainingsOnFilterChangeAction(this._filters));
        });
    }
    //End of on init

    //Private methods
   
    /**
     * page change event
     * 
     * @private
     * @param {*} $event 
     * 
     * @memberOf TrainingListComponent
     */
    onPageChange($event: any) {
        this._store.dispatch(new LoadTrainingsOnPageChangeAction({ pageNumber: $event.pageNumber, noOfRows: $event.noOfRows }));
    }


    /**
     * sort event
     * 
     * @private
     * @param {AeSortModel} $event 
     * 
     * @memberOf TrainingListComponent
     */
    onSort($event: AeSortModel) {
        this._store.dispatch(new LoadTrainingsOnSortAction({ SortField: $event.SortField, Direction: $event.Direction }));
    }

    /**
     * set filters
     * 
     * @private
     * @param {string} key 
     * @param {string} value 
     * 
     * @memberOf TrainingListComponent
     */
    private _setFilters(key: string, value: string) {
        if (this._filters === null) {
            this._filters = new Map<string, string>();
        }
        if (this._filters.has(key)) {
            this._filters.delete(key);
        }
        this._filters.set(key, value);
    }


    /**
     * Show status name from status 
     * 
     * @private
     * @param {TrainingStatus} status 
     * @returns {string} 
     * 
     * @memberOf TrainingListComponent
     */
    getStatusText(status: TrainingStatus): string {
        switch (status) {
            case TrainingStatus.Passed:
                return 'Passed';
            case TrainingStatus.Pending:
                return 'Pending';
            case TrainingStatus.Failed:
                return 'Failed';
            case TrainingStatus.Complete:
                return 'Complete';
            case TrainingStatus.Incomplete:
                return 'Incomplete';

        }
        return '';
    }


    /**
     * Method to decide whether to show launch button or not 
     * @private
     * @param {TrainingStatus} status 
     * @returns 
     * 
     * @memberOf TrainingListComponent
     */
    showLaunchButton(status: TrainingStatus) {
        return (status !== TrainingStatus.Passed);
    }


    /**
     * method  to show download certificate or not
     * 
     * @private
     * @param {TrainingStatus} status 
     * @returns 
     * 
     * @memberOf TrainingListComponent
     */
    showDownloadCertificate(training: MyTraining) {
        return training.Status === TrainingStatus.Passed && training.Certificates.length > 0;
    }


    /**
     * Launch course click
     * 
     * @private
     * @param {MyTraining} trainingToLaunch 
     * 
     * @memberOf TrainingListComponent
     */
    onLaunchClick(trainingToLaunch: MyTraining) {
        this._currentMyTraining = trainingToLaunch;
        this._scormService.launchSCO(trainingToLaunch.Id, trainingToLaunch.Link, (id, status) => { return this._scormCallback(id, status) }, (loadStatus) => { return this._initCallback(loadStatus) });
        this._showTraining = true;
        this.moduleTitle = trainingToLaunch.ModuleTitle;
        this._trustedUrl = this._sanitizer.bypassSecurityTrustResourceUrl(trainingToLaunch.Link);
        this._cdRef.markForCheck();
    }

    private _scormCallback(id: string, status: string) {
        this.isCourseLoaded = false;
        this._showTraining = false;
        this._store.dispatch(new UpdateTrainingCourse({ id: id, status: status }));
    }

    private _initCallback(status: boolean) {
        this.isCourseLoaded = status;
        this._cdRef.markForCheck();
    }

    /**
     * Download certificate click
     * 
     * @private
     * @param {MyTraining} trainingToDownload 
     * 
     * @memberOf TrainingListComponent
     */
    onDownloadClick(trainingToDownload: MyTraining) {
        if ((trainingToDownload.Status === TrainingStatus.Passed) &&
            (!isNullOrUndefined(trainingToDownload.Certificates) && trainingToDownload.Certificates.length > 0)) {
            let certificate: Document = trainingToDownload.Certificates[0];
            if (!isNullOrUndefined(certificate)) {
                let cid = this._routeParams.Cid;
                let downloadUrl: string = (cid) ? `/filedownload?documentId=${certificate.Id}&cid=${cid}` :
                    `/filedownload?documentId=${certificate.Id}`;
                window.open(downloadUrl);
            }
        }
    }

    closeTraining() {
        this._showTraining = false;
    }

    //End of Public methods
}