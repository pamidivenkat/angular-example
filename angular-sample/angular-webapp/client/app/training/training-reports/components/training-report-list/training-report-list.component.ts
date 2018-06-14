import { ActivatedRoute } from '@angular/router';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { RouteParams } from '../../../../shared/services/route-params';
import { StringHelper } from '../../../../shared/helpers/string-helper';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AePageChangeEventModel } from '../../../../atlas-elements/common/models/ae-page-change-event-model';
import { getAeSelectItemsFromEnum, getAeSelectItemsArrayFromEnum } from '../../../../employee/common/extract-helpers';
import { TrainingReportStatus, TrainingReportProgress } from '../../../common/training-report-view';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { AeSortModel, SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../../shared/models/atlas-api-response';
import { isNullOrUndefined } from 'util';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { TrainingReports } from '../../../models/training-reports';
import { Input } from '@angular/core';
import { TrainingReportService } from '../../services/training-report.service';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import * as Immutable from 'immutable';
import * as fromRoot from '../../../../shared/reducers';
import { Document } from '../../../../document/models/document';
import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { getStatusText } from '../../../common/extract-helper';

@Component({
    selector: 'training-reports-list',
    templateUrl: './training-report-list.component.html',
    styleUrls: ['./training-report-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TrainingReportsListComponent extends BaseComponent implements OnInit, OnDestroy {

    private _totalRecords$: Observable<number>;
    private _dataTableOptions$: Observable<DataTableOptions>;
    private _actions: Immutable.List<AeDataTableAction>;
    private _reportsList$: BehaviorSubject<Immutable.List<TrainingReports>>;
    private _loadingStatus$: Observable<boolean>;
    private _trainingReportsApiRequestParams: AtlasApiRequestWithParams;
    private _mandatoryApiRequestParams: AtlasApiRequestWithParams;
    private _statusTypes: Immutable.List<AeSelectItem<number>>;
    private _progressTypes: Immutable.List<AeSelectItem<number>>;
    private _trainingStatus: Array<AeSelectItem<number>>
    private _trainingReportListForm: FormGroup;
    private _keys = Immutable.List(['Id', 'CourseTitle', 'ModuleTitle', 'CourseVersion', 'FirstName', 'LastName', 'StartDate', 'PassDate', 'ExpiryDate', 'Status', 'CertificateCount', 'IsExample']);
    private _companyId: string;
    private _trainingReportListSubscription: Subscription;
    private _trainingReportFilterSubscription: Subscription;
    private _trainingReportCertificateSubscription: Subscription;
    private _localDataSouceType: AeDatasourceType = AeDatasourceType.Local;
    private _isFirstTimeLoad: boolean = true;

    get trainingStatus(): Array<AeSelectItem<number>> {
        return this._trainingStatus;
    }
    get localDataSouceType(): AeDatasourceType {
        return this._localDataSouceType;
    }
    get trainingReportListForm(): FormGroup {
        return this._trainingReportListForm;
    }

    get progressTypes(): Immutable.List<AeSelectItem<number>> {
        return this._progressTypes;
    }

    get statusTypes(): Immutable.List<AeSelectItem<number>> {
        return this._statusTypes;
    }

    get reportsList$(): BehaviorSubject<Immutable.List<TrainingReports>> {
        return this._reportsList$;
    }

    get totalRecords$(): Observable<number> {
        return this._totalRecords$;
    }

    get dataTableOptions$(): Observable<DataTableOptions> {
        return this._dataTableOptions$;
    }

    get loadingStatus$(): Observable<boolean> {
        return this._loadingStatus$;
    }

    get keys(): any {
        return this._keys;
    }

    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _store: Store<fromRoot.State>
        , private _trainingReportService: TrainingReportService
        , private _fb: FormBuilder
        , private _routeParams: RouteParams
        , private _claimsHelper: ClaimsHelperService
        , private _route: ActivatedRoute
    ) {
        super(_localeService, _translationService, _cdRef);
        this._reportsList$ = new BehaviorSubject(Immutable.List([]));
        if (!isNullOrUndefined(this._routeParams.Cid)) {
            this._companyId = this._routeParams.Cid;
        }
        else {
            this._companyId = this._claimsHelper.getCompanyId();
        }
    }
    //private method starts here
    private _patchForm(status: Array<AeSelectItem<number>>) {
        this._trainingReportListForm.patchValue({
            _progressType: status
        })
    }

    private _loadInitialTrainingReports(params) {
        let filterBy = params['filterBy'];
        let status: Array<AeSelectItem<number>> = [];
        if (isNullOrUndefined(this._trainingReportsApiRequestParams))
            this._trainingReportsApiRequestParams = <AtlasApiRequestWithParams>{};
        this._mandatoryApiRequestParams = <AtlasApiRequestWithParams>{};
        this._trainingReportsApiRequestParams.PageNumber = 1;
        this._trainingReportsApiRequestParams.PageSize = 10;
        this._trainingReportsApiRequestParams.SortBy = <AeSortModel>{};
        this._trainingReportsApiRequestParams.SortBy.Direction = SortDirection.Ascending;
        this._trainingReportsApiRequestParams.SortBy.SortField = 'CourseTitle';
        this._mandatoryApiRequestParams.Params = [];
        this._mandatoryApiRequestParams.Params.push(new AtlasParams('currentPage', 1));
        this._mandatoryApiRequestParams.Params.push(new AtlasParams('fields', 'SelectedCourse.Title as CourseTitle,SelectedCourse.Version as CourseVersion,AssignedUser.FirstName,AssignedUser.LastName,SelectedModule.Title as ModuleTitle,Id,StartDate,PassDate,ExpiryDate,Status,Certificates.Count as CertificateCount,SelectedCourse.IsExample as IsExample'));
        this._mandatoryApiRequestParams.Params.push(new AtlasParams('trainingReportCompanyFilter', this._companyId));
        this._mandatoryApiRequestParams.Params.push(new AtlasParams('trainingReportCourseStatusFilter', TrainingReportStatus.Active));
        this._trainingReportsApiRequestParams.Params = Array.from(this._mandatoryApiRequestParams.Params);
        if (!isNullOrUndefined(filterBy) && filterBy == 'outstanding') {
            let statusParam = TrainingReportProgress.Pending + ',' + TrainingReportProgress.Incomplete;
            this._trainingReportsApiRequestParams.Params.push(new AtlasParams('trainingReportMultiStatusFilter', statusParam));
            status = [new AeSelectItem<number>(getStatusText(TrainingReportProgress.Pending), TrainingReportProgress.Pending)
                , new AeSelectItem<number>(getStatusText(TrainingReportProgress.Incomplete), TrainingReportProgress.Incomplete)
            ]
        }
        this._trainingReportService.LoadTrainingReportsData(this._trainingReportsApiRequestParams);
        this._patchForm(status);
        this._cdRef.markForCheck();
    }

    onPageChange(pagingInfo: AePageChangeEventModel) {
        this._trainingReportsApiRequestParams.PageNumber = pagingInfo.pageNumber;
        this._trainingReportsApiRequestParams.PageSize = pagingInfo.noOfRows;
        this._trainingReportService.LoadTrainingReportsData(this._trainingReportsApiRequestParams);
    }

    onPageSort(sortModel: AeSortModel) {
        this._trainingReportsApiRequestParams.SortBy = sortModel;
        this._trainingReportService.LoadTrainingReportsData(this._trainingReportsApiRequestParams);
    }

    private _initForm() {
        this._trainingReportListForm = this._fb.group({
            _course: [],
            _fullName: [],
            _startDate: [],
            _endDate: [],
            _statusType: [TrainingReportStatus.Active],
            _progressType: [TrainingReportProgress.All]
        })

    }
    public getStatusText(status: TrainingReportProgress): string {
        return getStatusText(status);
    }
    showDownloadCertificate(status: number) {
        return status;
    }

    onDownloadClick(trainingToDownload: TrainingReports) {
        this._trainingReportService.DownLoadTrainingReport(trainingToDownload.Id);
        if (!this._trainingReportCertificateSubscription) {
            this._trainingReportCertificateSubscription = this._store.let(fromRoot.GetTrainingReportCertificateData)
                .skipWhile(certificate => isNullOrUndefined(certificate))
                .subscribe(certificate => {
                    this._downloadCertificate(certificate);
                });
        }
    }
    private _downloadCertificate(certificate: any) {
        if (!isNullOrUndefined(certificate)) {
            let cid = this._routeParams.Cid;
            if (certificate.length > 0) {
                certificate.forEach(doc => {
                    let downloadUrl: string = (cid) ? `/filedownload?documentId=${doc.Id}&cid=${cid}` :
                        `/filedownload?documentId=${doc.Id}`;
                    window.open(downloadUrl);
                });
            }
        }
    }
    courseType(isExample: boolean): string {
        return isExample ? "Standard" : "Customised";
    }
    private getProgressTypeValues(data) {
        let finalValue: string = ''
        if (!isNullOrUndefined(data._progressType) && data._progressType.length > 0) {
            if (!isNullOrUndefined((<any>data._progressType[0]).Value)) {
                <any>data._progressType.forEach(st => {
                    finalValue = finalValue + st.Value + ",";
                });
                return finalValue.substring(0, finalValue.length-1);
            }
            else
                return data._progressType.join(',');
        } else {
            return data._progressType.Value ? data._progressType.Value : data._progressType;
        }
    }
    //private method ends

    // Public Output bindings
    // Public methods
    ngOnInit() {
        this._statusTypes = getAeSelectItemsFromEnum(TrainingReportStatus);
        this._initForm();
        //this._progressTypes = getAeSelectItemsFromEnum(TrainingReportProgress);
        this._trainingStatus = getAeSelectItemsArrayFromEnum(TrainingReportProgress).filter(obj => obj.Text.toLowerCase() != 'all');
        this._trainingReportListSubscription = Observable.combineLatest(this._route.params,
            this._store.let(fromRoot.getTrainingReportsList)).subscribe(res => {
                if (res && this._isFirstTimeLoad) {
                    this._loadInitialTrainingReports(res[0]);
                    this._isFirstTimeLoad = false;
                }
                this._reportsList$.next(Immutable.List<TrainingReports>(res[1]));
            });
        this._loadingStatus$ = this._store.let(fromRoot.getTrainingReportsListDataLoading);
        this._totalRecords$ = this._store.let(fromRoot.GetTrainingReportsTotalRecords);
        this._dataTableOptions$ = this._store.let(fromRoot.getTrainingReportsListDataTableOptions);
        this._trainingReportFilterSubscription = this._trainingReportListForm.valueChanges.subscribe(data => {
            let startDate = data._startDate;
            let endDate = data._endDate;
            if (!isNullOrUndefined(data._startDate) && !StringHelper.isNullOrUndefinedOrEmpty(String(startDate))) {
                startDate = new Date(data._startDate).toDateString();
            }
            if (!isNullOrUndefined(data._endDate) && !StringHelper.isNullOrUndefinedOrEmpty(String(endDate))) {
                endDate = new Date(data._endDate).toDateString();
            }
            this._trainingReportsApiRequestParams.PageNumber = 1;
            this._trainingReportsApiRequestParams.Params = [];
            this._trainingReportsApiRequestParams.Params.push(new AtlasParams('trainingReportTraineeFnameFilter', data._fullName));
            this._trainingReportsApiRequestParams.Params.push(new AtlasParams('trainingReportCourseFilter', data._course));
            this._trainingReportsApiRequestParams.Params.push(new AtlasParams('trainingReportStartDateFilter', startDate));
            this._trainingReportsApiRequestParams.Params.push(new AtlasParams('trainingReportEndDateFilter', endDate));
            this._trainingReportsApiRequestParams.Params.push(new AtlasParams('trainingReportMultiStatusFilter', this.getProgressTypeValues(data)));
            let reportCourseStatusFilter = this._mandatoryApiRequestParams.Params.find(item => item.Key === "trainingReportCourseStatusFilter")
            if (!isNullOrUndefined(reportCourseStatusFilter)) {
                reportCourseStatusFilter.Value = data._statusType;
            }
            this._trainingReportsApiRequestParams.Params = this._trainingReportsApiRequestParams.Params.concat(this._mandatoryApiRequestParams.Params);
            this._trainingReportService.LoadTrainingReportsData(this._trainingReportsApiRequestParams);
        });
    }
    //On Destroy
    ngOnDestroy(): void {
        if (!isNullOrUndefined(this._trainingReportFilterSubscription))
            this._trainingReportFilterSubscription.unsubscribe();
        if (!isNullOrUndefined(this._trainingReportListSubscription))
            this._trainingReportListSubscription.unsubscribe();
        if (!isNullOrUndefined(this._trainingReportCertificateSubscription))
            this._trainingReportCertificateSubscription.unsubscribe();
    }
    //End of on destroy
}