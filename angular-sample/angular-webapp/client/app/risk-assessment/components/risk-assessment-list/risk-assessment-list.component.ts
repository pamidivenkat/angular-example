import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { AeInputType } from '../../../atlas-elements/common/ae-input-type.enum';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { AePageChangeEventModel } from '../../../atlas-elements/common/models/ae-page-change-event-model';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { AeSortModel, SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { Tristate } from '../../../atlas-elements/common/tristate.enum';
import * as fromConstants from '../../../shared/app.constants';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import * as fromRoot from '../../../shared/reducers';
import { MessengerService } from '../../../shared/services/messenger.service';
import { RouteParams } from '../../../shared/services/route-params';
import { RiskAssessmentStatus } from '../../common/risk-assessment-status.enum';
import { RiskAssessment } from '../../models/risk-assessment';
import { RiskAssessmentConstants } from '../../risk-assessment-constants';
import { RiskAssessmentService } from '../../services/risk-assessment-service';


@Component({
  selector: 'risk-assessment-list',
  templateUrl: './risk-assessment-list.component.html',
  styleUrls: ['./risk-assessment-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RiskAssessmentListComponent extends BaseComponent implements OnInit, OnDestroy {
  private _list$: Observable<Immutable.List<RiskAssessment>>;
  private _totalCount$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _loading$: Observable<boolean>;
  private _actions: Immutable.List<AeDataTableAction>;
  private _listApiRequestParams: AtlasApiRequestWithParams;
  private _commonFilterParams: AtlasApiRequestWithParams;
  private _listingDataSubscription: Subscription;
  private _keys = ['Id', 'Name', 'IsExample', 'ReferenceNumber', 'CompanyId', 'Assessor', 'ApprovedUser', 'StatusId', 'ReviewPeriod', 'Description', 'AssessmentDate', 'ReviewDate', 'StatusId', 'RiskAssessmentTypeId', 'SiteId', 'Site', 'SiteLocation', 'ApprovedDate', 'RiskAssessmentType', 'RiskAssessmentSectors', 'RiskAssessmentWorkspaceTypes', 'ModifiedOn', 'Assessor_Name'];
  private _ctrlTypeSearch: AeInputType = AeInputType.search;
  private _siteOptionList: Immutable.List<AeSelectItem<string>>;
  private _defaultSiteOptions: Immutable.List<AeSelectItem<string>>;
  private _isOverDueTabActive: boolean = false;
  private _isPendingTabActive: boolean = false;
  private _isLiveTabActive: boolean = false;
  private _isExampleTabActive: boolean = false;
  private _isArchivedTabActive: boolean = false;
  private _globalFilterChangeSubscription: Subscription;
  private _totalCount: number;
  private _statusRAFilter: number;
  private _isListPage: boolean;
  private _deleteRiskAssessmentSubscription: Subscription;
  private _deleteActionCommand: Subject<RiskAssessment> = new Subject();
  private _archivedRiskAssessmentSubscription: Subscription;
  private _archivedActionCommand: Subject<RiskAssessment> = new Subject();
  private _approveRiskAssessmentSubscription: Subscription;
  private _raReviewStatusSubScription: Subscription;
  private _viewRiskAssessmentSubscription: Subscription;
  private _copyRiskAssessmentSubscription: Subscription;
  private _copyActionCommand: Subject<RiskAssessment> = new Subject();
  private _viewActionCommand: Subject<RiskAssessment> = new Subject();
  private _reviewRiskAssessmentSubscription: Subscription;
  private _reviewActionCommand: Subject<RiskAssessment> = new Subject();
  private _showConfirmDialog: boolean = false;
  private _dialogHeading: string;
  private _dialogInfo: string;
  private _btnYesText: string;
  private _btnNoText: string;
  private _selectedRiskAssessment: RiskAssessment;
  private _selectedActionType: string;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _iconSize: AeIconSize = AeIconSize.medium;
  private _isDetails: boolean = false;
  private _detailData: RiskAssessment;
  private _legendOptions: any;
  private _showReviewSlideout: boolean = false;
  private _copyRASlideOut: boolean;
  private _getCurrentRASubscription: Subscription;
  private _reloadRAListSubscription: Subscription;
  private _navigationExtras: NavigationExtras;

  get list(): Observable<Immutable.List<RiskAssessment>> {
    return this._list$;
  }
  get totalCount(): Observable<number> {
    return this._totalCount$;
  }
  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }
  get dataTableOptions(): Observable<DataTableOptions> {
    return this._dataTableOptions$;
  }
  get loading(): Observable<boolean> {
    return this._loading$;
  }
  get isOverDueTabActive(): boolean {
    return this._isOverDueTabActive;
  }
  get isArchivedTabActive(): boolean {
    return this._isArchivedTabActive;
  }
  get isExampleTabActive(): boolean {
    return this._isExampleTabActive;
  }
  get legendOptions(): any {
    return this._legendOptions;
  }
  get showConfirmDialog() {
    return this._showConfirmDialog;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get isDetails(): boolean {
    return this._isDetails;
  }
  get detailData(): RiskAssessment {
    return this._detailData;
  }
  get iconSize(): AeIconSize {
    return this._iconSize;
  }
  get keys() {
    return this._keys;
  }
  get dialogHeading(): string {
    return this._dialogHeading;
  }
  get dialogInfo(): string {
    return this._dialogInfo;
  }
  get btnYesText() {
    return this._btnYesText;
  }
  get showReviewSlideout() {
    return this._showReviewSlideout;
  }
  get selectedRiskAssessment(): RiskAssessment {
    return this._selectedRiskAssessment;
  }
  get copyRASlideOut(): boolean {
    return this._copyRASlideOut;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , private _datePipe: DatePipe
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _riskAssessmentService: RiskAssessmentService
    , private _router: Router
    , private _routeParams: RouteParams
    , private _messenger: MessengerService
    , private _claims: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _cdRef);
    this._isListPage = true;
    this._isOverDueTabActive = false;
    this._isPendingTabActive = false;
    this._isLiveTabActive = false
    this._isExampleTabActive = false;
    this._isArchivedTabActive = false;
    this._legendOptions = [
      { Text: 'General', IconName: "icon-alert-triangle" },
      { Text: 'COSHH', IconName: "icon-coshh" },
    ];
    this._navigationExtras = { queryParamsHandling: 'merge' };
    this.id = 'risk-assessment-list';
    this.name = 'risk-assessment-list';
  }

  ngOnInit() {

    this._setActiveTabStatus();
    this._initialLoadRiskAssessmentlist();
    this._list$ = this._store.let(fromRoot.getRiskAssessmentListData);
    this._totalCount$ = this._store.let(fromRoot.getRiskAssessmentTotalCount);
    this._dataTableOptions$ = this._store.let(fromRoot.getRiskAssessmentPageInformation);
    this._loading$ = this._store.let(fromRoot.getRiskAssessmentLoadingStatus);

    this._reloadRAListSubscription =
      this._riskAssessmentService.reloadRAListEvent.subscribe((value) => {
        if (!isNullOrUndefined(value) && value === true) {
          this._listApiRequestParams.PageNumber = 1;
          this._listApiRequestParams.PageSize = 10;
          this._riskAssessmentService._loadRiskAssessmentList(this._listApiRequestParams);
          this._riskAssessmentService.reloadRAListEvent.emit(false);
        }
      });

    this._actions = Immutable.List([
      new AeDataTableAction("View", this._viewActionCommand, false),
      new AeDataTableAction("Copy", this._copyActionCommand, false),
      new AeDataTableAction("Review", this._reviewActionCommand, false, (item) => { return this._showReviewAction(item) }),
      new AeDataTableAction("Remove", this._deleteActionCommand, false, (item) => { return this._showDeleteAction(item) }),
      new AeDataTableAction("Archive", this._archivedActionCommand, false, (item) => { return this._showArchivedAction(item) })
    ]);

    this._copyRiskAssessmentSubscription = this._copyActionCommand.subscribe((item) => {
      if (!isNullOrUndefined(item)) {
        this._selectedRiskAssessment = item;
        this._copyRASlideOut = true;
      }
    });

    this._viewRiskAssessmentSubscription = this._viewActionCommand.subscribe((item) => {
      if (!isNullOrUndefined(item)) {
        if (item.StatusId === RiskAssessmentStatus.Pending) {
          this._router.navigate(['risk-assessment/edit', item.Id], this._navigationExtras);
        }
        else {
          if (item.IsExample) {
            if (this._claims.canCreateExampleRiskAssessments() && item.StatusId === RiskAssessmentStatus.Example && isNullOrUndefined(this._routeParams.Cid)) {
              this._router.navigate(['risk-assessment/edit/example/', item.Id], this._navigationExtras);
            } else {
              this._router.navigate(['risk-assessment/example/', item.Id], this._navigationExtras);
            }
          }
          else {
            this._router.navigate(['risk-assessment', item.Id], this._navigationExtras);
          }
        }
      }
    });

    this._reviewRiskAssessmentSubscription = this._reviewActionCommand.subscribe((item) => {
      if (!isNullOrUndefined(item)) {
        this._selectedRiskAssessment = item;
        this._showReviewSlideout = true;
      }
    });
    this._deleteRiskAssessmentSubscription = this._deleteActionCommand.subscribe((item) => {
      if (!isNullOrUndefined(item)) {
        this._selectedRiskAssessment = item;
        this._selectedActionType = "DELETE";
        this._showConfirmDialog = true;
        this.setDialogText('REMOVE_RISKASSESSMENT_DIALOG', this._selectedRiskAssessment);
      }
    });
    this._archivedRiskAssessmentSubscription = this._archivedActionCommand.subscribe((item) => {
      if (!isNullOrUndefined(item)) {
        this._selectedRiskAssessment = item;
        this._selectedActionType = "ARCHIVED";
        this._showConfirmDialog = true;
        this.setDialogText('ARCHIVED_DIALOG', this._selectedRiskAssessment);
      }
    });

    this._raReviewStatusSubScription = this._store.let(fromRoot.geRiskAssessmentReviewStatus).subscribe((val) => {
      if (val) {
        this._initialLoadRiskAssessmentlist();
      }
    });

  }

  public getSlideoutState(): string {
    return this._isDetails || this._showReviewSlideout ? 'expanded' : 'collapsed';
  }

  public getSlideoutAnimateState(): boolean {
    return this._isDetails || this._showReviewSlideout ? true : false;
  }

  public onRADetails(item) {
    this._isDetails = true;
    this._detailData = item;
  }
  public onDetailCancel(event) {
    this._isDetails = false;
    this._showReviewSlideout = false;
  }

  getHelpText() {
    if (this._isOverDueTabActive) {
      return 'RA_HELP_TEXT.OVERDUE'
    } else if (this._isPendingTabActive) {
      return 'RA_HELP_TEXT.PENDING'
    } else if (this._isLiveTabActive) {
      return 'RA_HELP_TEXT.LIVE'
    } else if (this._isExampleTabActive) {
      return 'RA_HELP_TEXT.EXAMPLE'
    } else if (this._isArchivedTabActive) {
      return 'RA_HELP_TEXT.ARCHIVED'
    }
  }

  onReviewSubmit(event) {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    this._showReviewSlideout = false;
    this._getCurrentRASubscription = this._store.let(fromRoot.getCurrentRiskAssessment).subscribe((data) => {
      if (!isNullOrUndefined(data)) {
        this._router.navigate(["/risk-assessment/edit/", data.Id], navigationExtras);
      }
    });
  }

  //private method starts here
  private _initialLoadRiskAssessmentlist() {
    if (isNullOrUndefined(this._listApiRequestParams))
      this._listApiRequestParams = <AtlasApiRequestWithParams>{};
    this._commonFilterParams = <AtlasApiRequestWithParams>{};
    this._listApiRequestParams.PageNumber = 1;
    this._listApiRequestParams.PageSize = 10;
    this._listApiRequestParams.SortBy = <AeSortModel>{};
    this._listApiRequestParams.SortBy.Direction = SortDirection.Ascending;
    this._listApiRequestParams.SortBy.SortField = 'Name';
    this._commonFilterParams.Params = [];
    this._commonFilterParams.Params.push(new AtlasParams('statusRAFilter', this._statusRAFilter));
    if (this._isExampleTabActive || (this._claims.canCreateExampleRiskAssessments() && isNullOrUndefined(this._routeParams.Cid))) {
      this._commonFilterParams.Params.push(new AtlasParams('isExample', 'true'));
      // this._commonFilterParams.Params.push(new AtlasParams('sectorRAFilter', ''));
    }
    this._listApiRequestParams.Params = this._commonFilterParams.Params;
    this._riskAssessmentService._loadRiskAssessmentList(this._listApiRequestParams);
  }


  private _showReviewAction(item: RiskAssessment): Tristate {
    if (this._isOverDueTabActive || this._isLiveTabActive) {
      return Tristate.True;
    }
    else {
      return Tristate.False;
    }
  }
  private _showDeleteAction(item: RiskAssessment): Tristate {
    if (this._isPendingTabActive) {
      return Tristate.True;
    }
    else {
      return Tristate.False;
    }
  }

  private _showArchivedAction(item: RiskAssessment): Tristate {
    if (this._isLiveTabActive || (this._isExampleTabActive && this._claims.canCreateExampleRiskAssessments() && this._claims.getCompanyId() === this._claims.getCompanyIdOrCid())) {
      return Tristate.True;
    }
    else {
      return Tristate.False;
    }
  }

  private _showApproveAction(item: RiskAssessment): Tristate {
    if (this._isPendingTabActive) {
      return Tristate.True;
    }
    else {
      return Tristate.False;
    }
  }

  modalClosed(event) {
    this._showConfirmDialog = false;
  }

  doAction(event) {
    this._showConfirmDialog = false;
    if (this._selectedActionType === 'DELETE') {
      this._riskAssessmentService._deleteRiskAssessment(this._selectedRiskAssessment);
    } else if (this._selectedActionType === 'ARCHIVED') {
      this._riskAssessmentService._archivedRiskAssessment(this._selectedRiskAssessment);
      this._router.navigate(['/risk-assessment/archived'], this._navigationExtras);
    } else { //APPROVE
      this._riskAssessmentService._approveRiskAssessment(this._selectedRiskAssessment);
    }
    this._riskAssessmentService._loadRiskAssessmentList(this._listApiRequestParams);

  }

  private setDialogText(dialogType: string, item): void {
    this._dialogHeading = this._translationService.translate(dialogType + '.Heading_text');
    this._dialogInfo = this._translationService.translate(dialogType + '.Info', { riskAssessmentName: item.Name });
    this._btnYesText = this._translationService.translate(dialogType + '.Btn_Yes');
    this._btnNoText = this._translationService.translate(dialogType + '.Btn_No');
  }

  onPageChange(pagingInfo: AePageChangeEventModel) {
    this._listApiRequestParams.PageNumber = pagingInfo.pageNumber;
    this._listApiRequestParams.PageSize = pagingInfo.noOfRows;
    this._riskAssessmentService._loadRiskAssessmentList(this._listApiRequestParams);
  }

  onSort(sortModel: AeSortModel) {
    this._listApiRequestParams.SortBy = sortModel;
    this._riskAssessmentService._loadRiskAssessmentList(this._listApiRequestParams);
  }

  getCopySlideoutState(): string {
    return this._copyRASlideOut ? 'expanded' : 'collapsed';
  }

  closeCopySlideOut() {
    this._copyRASlideOut = false;
  }

  copyRiskAssessmentSubmit(riskAssessment) {
    this._copyRASlideOut = false;
    this._riskAssessmentService._copyRiskAssessment(riskAssessment);
  }

  private _setActiveTabStatus(): void {
    let currentUrl = this._router.url;
    if (currentUrl.indexOf(RiskAssessmentConstants.Routes.OverDue) !== -1) {
      this._isOverDueTabActive = true;
      this._statusRAFilter = 3;
    } else if (currentUrl.indexOf(RiskAssessmentConstants.Routes.Pending) !== -1) {
      this._isPendingTabActive = true;
      this._statusRAFilter = 1;
    } else if (currentUrl.indexOf(RiskAssessmentConstants.Routes.Live) !== -1) {
      this._isLiveTabActive = true;
      this._statusRAFilter = 2;
    } else if (currentUrl.indexOf(RiskAssessmentConstants.Routes.Archived) !== -1) {
      this._isArchivedTabActive = true;
      this._statusRAFilter = 4;
    } else {
      this._isExampleTabActive = true;
      this._statusRAFilter = 0;
    }
  }

  getAssessmentIcon(id): string {
    switch (id) {
      case fromConstants.generalRiskAssessmentTypeId:
      case fromConstants.generalMigratedRiskAssessmentTypeId:
        return 'icon-alert-triangle';
      case fromConstants.coshhRiskAssessmentTypeId:
      case fromConstants.coshhMigratedRiskAssessmentTypeId:
        return 'icon-coshh';
    }
  }
  getAssesssorName(context: RiskAssessment): string {
    let assessorName = '';
    switch (context.RiskAssessmentTypeId) {
      case fromConstants.generalRiskAssessmentTypeId:
      case fromConstants.coshhRiskAssessmentTypeId:
        if (!isNullOrUndefined(context.Assessor)) {
          assessorName = context.Assessor.FullName;
        }
        break;
      case fromConstants.generalMigratedRiskAssessmentTypeId:
      case fromConstants.coshhMigratedRiskAssessmentTypeId:
        assessorName = context.Assessor_Name;
        break;
    }
    return assessorName;
  }
  ngOnDestroy() {
    if (this._getCurrentRASubscription) {
      this._getCurrentRASubscription.unsubscribe();
    }
    if (this._raReviewStatusSubScription) {
      this._raReviewStatusSubScription.unsubscribe();
    }
    if (this._globalFilterChangeSubscription)
      this._globalFilterChangeSubscription.unsubscribe();
    if (this._listingDataSubscription)
      this._listingDataSubscription.unsubscribe();
    if (this._deleteRiskAssessmentSubscription)
      this._deleteRiskAssessmentSubscription.unsubscribe();
    if (this._archivedRiskAssessmentSubscription)
      this._archivedRiskAssessmentSubscription.unsubscribe();
    if (this._approveRiskAssessmentSubscription)
      this._approveRiskAssessmentSubscription.unsubscribe();
    if (this._copyRiskAssessmentSubscription)
      this._copyRiskAssessmentSubscription.unsubscribe();
    if (this._reviewRiskAssessmentSubscription)
      this._reviewRiskAssessmentSubscription.unsubscribe();
    if (this._viewRiskAssessmentSubscription) {
      this._viewRiskAssessmentSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._reloadRAListSubscription)) {
      this._reloadRAListSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

}
