import { endDateAfterOrEqualValidator } from './../../../employee/common/employee-validators';
import { DatePipe } from '@angular/common';
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
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeTemplateComponent } from '../../../atlas-elements/ae-template/ae-template.component';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { AeDatasourceType } from '../../../atlas-elements/common/ae-datasource-type';
import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { AeInputType } from '../../../atlas-elements/common/ae-input-type.enum';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { AePageChangeEventModel } from '../../../atlas-elements/common/models/ae-page-change-event-model';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { Document } from '../../../document/models/document';
import { createSelectOptionFromArrayList } from '../../../employee/common/extract-helpers';
import { LoadSitesAction } from '../../../shared/actions/company.actions';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import * as fromRoot from '../../../shared/reducers';
import { MessengerService } from '../../../shared/services/messenger.service';
import { LoadAssignUsers } from '../../../task/actions/task-add.actions';
import { AssignUser } from '../../../task/models/assign-user';
import { ChecklistConstants } from '../../checklist-constants';
import { extractFrequencyOfChecklist } from '../../common/extract-helper';
import { Periodicity } from '../../common/periodicity.enum';
import { CheckListInstance } from '../../models/checklist-instance.model';
import { Checklist } from '../../models/checklist.model';
import { ChecklistService } from '../../services/checklist.service';
import { DateTimeHelper } from './../../../shared/helpers/datetime-helper';

@Component({
  selector: 'todays-checklist',
  templateUrl: './todays-or-complete-incomplete-checklist.component.html',
  styleUrls: ['./todays-or-complete-incomplete-checklist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TodaysOrCompleteIncompleteChecklistComponent extends BaseComponent implements OnInit, OnDestroy {
  private _sartdatePlaceholder: string = 'Scheduled start (dd/mm/yyyy)';
  private _enddatePlaceholder: string = 'Scheduled end (dd/mm/yyyy)';

  private _list$: BehaviorSubject<Immutable.List<Checklist>>;
  private _totalCount$: Observable<number>;
  private _totalCountSubscription: Subscription;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _loading$: Observable<boolean>;
  private _actions: Immutable.List<AeDataTableAction>;
  private _listApiRequestParams: AtlasApiRequestWithParams;
  private _commonFilterParams: AtlasApiRequestWithParams;
  private _listingDataSubscription: Subscription;
  private _filterForm: FormGroup;
  private _keys = ['Id', 'Name', 'AssignedToId', 'NextDueDate', 'SiteId', 'SiteLocation', 'SiteName', 'Workspaces', 'Periodicity', 'firstname', 'lastname', 'ScheduledDate', 'Status'];
  private _ctrlTypeSearch: AeInputType = AeInputType.search;
  private _siteOptionsSubscription: Subscription;
  private _siteOptionList: Immutable.List<AeSelectItem<string>>;
  private _defaultSiteOptions: Immutable.List<AeSelectItem<string>>;
  private _isTodaysChecklistActive: boolean = false;
  private _isCompleteIncompleteChecklistActive: boolean = false;
  private _filterStatusOptions: Immutable.List<AeSelectItem<string>>;
  private _assignUsersOptions$: BehaviorSubject<AssignUser[]> = new BehaviorSubject<AssignUser[]>([]);
  private _dataSouceType: AeDatasourceType;
  private _globalFilterNameChangeSubscription: Subscription;
  private _globalFilterWorkSpaceChangeSubscription: Subscription;
  private _checklistFilterOptions: Immutable.List<AeSelectItem<string>>;
  private _iconOneSize: AeIconSize = AeIconSize.big;
  private _totalCount: number;
  private _isFilterDirty: boolean;
  private _checklistItemActionRequestSubscription: Subscription;
  private _isChecklistAction: boolean = false;
  private _checklistItemId: string;
  private _showDeleteConfirmDialog: boolean = false;
  private _selectedAttachmentToRemove: Document;
  private _selectedInstanceActionItemId: string;
  private _checklistActionItems$: Observable<CheckListInstance>;
  private _checkListInstance: CheckListInstance;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _routeParamsSub: Subscription;
  private _firstTimeNameLoad: boolean = true;
  private _firstTimeWorkSpaceLoad: boolean = true;
  private _formChangesSub: Subscription;
  private _assignedUsersSub: Subscription;
  private _formValueChangesSub: Subscription;
  //End of Private Fields
  get buttonLightClass(): AeClassStyle {
    return this._lightClass;
  }
  //bindings
  @ViewChild('popOverTemplate')
  _popOverTemplate: AeTemplateComponent<any>;
  //bindings

  get startDate() { return this._sartdatePlaceholder; }

  get endDate() { return this._enddatePlaceholder; }

  get filterForm() {
    return this._filterForm;
  }

  get isTodaysChecklistActive() {
    return this._isTodaysChecklistActive;
  }

  get siteOptionList() {
    return this._siteOptionList;
  }

  get checklistFilterOptions() {
    return this._checklistFilterOptions;
  }

  get isCompleteIncompleteChecklistActive() {
    return this._isCompleteIncompleteChecklistActive;
  }

  get filterStatusOptions() {
    return this._filterStatusOptions;
  }

  get assignUsersOptions$() {
    return this._assignUsersOptions$;
  }

  get dataSouceType() {
    return this._dataSouceType;
  }

  get list$() {
    return this._list$;
  }

  get totalCount$() {
    return this._totalCount$;
  }

  get actions() {
    return this._actions;
  }

  get dataTableOptions$() {
    return this._dataTableOptions$;
  }

  get loading$() {
    return this._loading$;
  }

  get keys() {
    return this._keys;
  }

  get iconOneSize() {
    return this._iconOneSize;
  }

  get isChecklistAction() {
    return this._isChecklistAction;
  }

  get checklistActionItems$() {
    return this._checklistActionItems$;
  }

  get showDeleteConfirmDialog() {
    return this._showDeleteConfirmDialog;
  }

  getHelpText() {
    if (this.isTodaysChecklistActive) {
      return 'CHECKLIST_HELP_TEXT.TODAYS'
    } else if (this.isCompleteIncompleteChecklistActive) {
      return 'CHECKLIST_HELP_TEXT.COMPLETE_INCOMPLETE'
    }
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , private _datePipe: DatePipe
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilder
    , private _checklistService: ChecklistService
    , private _router: Router
    , private _messenger: MessengerService
    , private _claims: ClaimsHelperService
    , private _route: ActivatedRoute
    , protected _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _cdRef);
    this._isFilterDirty = false;
    this._list$ = new BehaviorSubject(Immutable.List([]));
    this._dataSouceType = AeDatasourceType.Local;
    this._filterStatusOptions = Immutable.List([
      new AeSelectItem<string>('All statuses', 'All', false),
      new AeSelectItem<string>('Incomplete', '1', false),
      new AeSelectItem<string>('Complete', '2', false)
    ]);
    this._defaultSiteOptions = Immutable.List([
      new AeSelectItem<string>('Any', '', false),
      new AeSelectItem<string>('All sites', '00000000-0000-0000-0000-000000000000', false)
    ]);
    if (this._claims.isHSServiceOwnerOrCoordinator()) {
      this._checklistFilterOptions = Immutable.List([
        new AeSelectItem<string>('All checklists', '0', false),
        new AeSelectItem<string>('My checklists', '1', false),
        new AeSelectItem<string>('My team checklists', '2', false)
      ]);
    }
    else if (this._claims.isHolidayAuthorizerOrManager()) {
      this._checklistFilterOptions = Immutable.List([
        new AeSelectItem<string>('My checklists', '1', false),
        new AeSelectItem<string>('My team checklists', '2', false)
      ]);
    }
    else {
      this._checklistFilterOptions = Immutable.List([
        new AeSelectItem<string>('My checklists', '1', false)
      ]);
    }
  }
  public viewOrActionActionCommand(itemId: string) {
    this._isChecklistAction = true;
    this._checklistService.loadChecklistActions(itemId);
  }

  ngOnInit() {
    this._isFilterDirty = false;
    this._checklistActionItems$ = this._store.let(fromRoot.getChecklistActionItemInstances);

    this._setActiveTabStatus();
    this._initForm();
    if (this._isCompleteIncompleteChecklistActive) {
      this._assignedUsersSub = this._store.let(fromRoot.getAssignUsersData).subscribe((val) => {
        if (!isNullOrUndefined(val)) {
          this._assignUsersOptions$.next(val);
        } else {
          this._store.dispatch(new LoadAssignUsers(true));
        }
      });
    }
    //Subscription to get Site Location Option Data, using existing effect
    this._siteOptionsSubscription = this._store.let(fromRoot.getSiteData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._siteOptionList = Immutable.List<AeSelectItem<string>>(createSelectOptionFromArrayList(res, "Id", "SiteNameAndPostcode")); // from api
        this._siteOptionList = Immutable.List(this._defaultSiteOptions.toArray().concat(this._siteOptionList.toArray()));
        this._cdRef.markForCheck();
      } else {
        this._store.dispatch(new LoadSitesAction(false));
      }
    });

    this._formValueChangesSub = this._filterForm.valueChanges.subscribe(data => {
      if (this._filterForm.valid) {
        this._isFilterDirty = true;
        this._listApiRequestParams.Params = [];
        this._listApiRequestParams.PageNumber = 1;
        this._listApiRequestParams.PageSize = 10;
        let _vm = this;
        if (!isNullOrUndefined(data)) {
          Object.keys(data).forEach(function (key) {
            if (data.hasOwnProperty(key)) {
              if (key === 'startDate') {
                let startDate = !!data['startDate'] ? _vm._datePipe.transform(data['startDate'], 'd/M/y') : "";
                let endDate = !!data['endDate'] ? _vm._datePipe.transform(data['endDate'], 'd/M/y') : "";
                let dateFilterValue = _vm.createDateFilterParams(startDate, endDate);
                _vm._listApiRequestParams.Params.push(new AtlasParams('filterInstanceByDate', dateFilterValue));
              } else {
                if (key !== 'endDate' && !(key == 'filterInstanceByStatus' && _vm._isTodaysChecklistActive))
                  _vm._listApiRequestParams.Params.push(new AtlasParams(key, data[key]));
              }
            }
          });
        }
        _vm._commonFilterParams.Params.forEach((element) => {
          if (element.Key == 'filterTodaysInstanceBySiteId') {
            element.Value = data.filterTodaysInstanceBySiteId;
          }
          if (_vm._isTodaysChecklistActive) {
            if (element.Key == 'filterTodaysCheckListsView') {
              element.Value = data.filterTodaysCheckListsView;
            }
          }
          if (_vm._isCompleteIncompleteChecklistActive) {
            if (element.Key == 'filterInstanceByUser') {
              element.Value = data.filterInstanceByUser;
            }

            if (element.Key == 'filterInstanceByStatus') {
              element.Value = data.filterInstanceByStatus;
            }
          }
        });
        this._listApiRequestParams.Params = this._commonFilterParams.Params.concat(this._listApiRequestParams.Params);
        this._checklistService.LoadTodaysChecklist(this._listApiRequestParams);
      }
    });

    this._initialLoadTodaysChecklist();
    this._listingDataSubscription = this._store.let(fromRoot.getChecklistListData).subscribe(res => {
      if (!isNullOrUndefined(res)) {
        this._list$.next(Immutable.List<Checklist>(res));
      }
    });

    this._totalCount$ = this._store.let(fromRoot.getChecklistTotalCount);
    this._totalCountSubscription = this._totalCount$.subscribe(val => {
      if (!isNullOrUndefined(val)) {
        this._totalCount = val;
        this._cdRef.markForCheck();
      }
    });

    this._dataTableOptions$ = this._store.let(fromRoot.getChecklistPageInformation);
    this._loading$ = this._store.let(fromRoot.getChecklistLoadingStatus);

    this._globalFilterNameChangeSubscription = this._store.let(fromRoot.getChecklistNameChange).subscribe(res => {
      if (!isNullOrUndefined(res) && !this._firstTimeNameLoad) {
        this._isFilterDirty = true;
        this._listApiRequestParams.PageNumber = 1;
        this._listApiRequestParams.PageSize = 10;
        this._checklistService.LoadTodaysChecklist(this._listApiRequestParams);
      }
      if (this._firstTimeNameLoad) {
        this._firstTimeNameLoad = false;
      }
    });
    this._globalFilterWorkSpaceChangeSubscription = this._store.let(fromRoot.getWorkSpaceChange).subscribe(res => {
      if (!isNullOrUndefined(res) && !this._firstTimeWorkSpaceLoad) {
        this._isFilterDirty = true;
        this._listApiRequestParams.PageNumber = 1;
        this._listApiRequestParams.PageSize = 10;
        this._checklistService.LoadTodaysChecklist(this._listApiRequestParams);// here we should call same service where for which we are calling name change
      }
      if (this._firstTimeWorkSpaceLoad) {
        this._firstTimeWorkSpaceLoad = false;
      }
    });

  }

  ngAfterContentInit() {
    this._isFilterDirty = false;
  }

  isRecordsEmpty(): boolean {
    if (this._totalCount === 0 && this._isTodaysChecklistActive && !this._isFilterDirty) {
      return true;
    }
    return false;
  }

  private createDateFilterParams(startDate: string, endDate: string): string {
    let separatorString = "";
    if (!StringHelper.isNullOrUndefinedOrEmpty(startDate) && !StringHelper.isNullOrUndefinedOrEmpty(endDate)) {
      separatorString = ", ";
    }
    return startDate + separatorString + endDate;
  }

  //private method starts here
  private _initialLoadTodaysChecklist() {
    this._commonFilterParams = <AtlasApiRequestWithParams>{};
    this._commonFilterParams.Params = [];
    let filterByStatus = 'All';
    let _vm = this;
    let startDate: string;
    let endDate: string;
    this._routeParamsSub = this._route.params.subscribe((params) => {
      let filterBy = params['filterby'];
      if (!isNullOrUndefined(filterBy) && filterBy == 'duethisweek') {
        filterByStatus = '1';
        let thisWeek = DateTimeHelper.getWeek(new Date());
        startDate = thisWeek.StartDate.toString();
        endDate = thisWeek.EndDate.toString();

        let dateFilterValue = _vm.createDateFilterParams(startDate, endDate);
        this._commonFilterParams.Params.push(new AtlasParams('filterInstanceByDate', dateFilterValue));
      }
      if (isNullOrUndefined(this._listApiRequestParams))
        this._listApiRequestParams = <AtlasApiRequestWithParams>{};

      this._listApiRequestParams.PageNumber = 1;
      this._listApiRequestParams.PageSize = 10;
      this._listApiRequestParams.SortBy = <AeSortModel>{};
      this._listApiRequestParams.SortBy.Direction = SortDirection.Ascending;
      this._listApiRequestParams.SortBy.SortField = 'Name';
      this._commonFilterParams.Params.push(new AtlasParams('filterTodaysInstanceBySiteId', 1));
      if (this._isTodaysChecklistActive) {
        this._commonFilterParams.Params.push(new AtlasParams('filterTodaysCheckListsView', 1));
        this._commonFilterParams.Params.push(new AtlasParams('filterTodaysCheckList', true));
      } else if (this._isCompleteIncompleteChecklistActive) {
        this._commonFilterParams.Params.push(new AtlasParams('filterInstanceByStatus', filterByStatus));
        this._commonFilterParams.Params.push(new AtlasParams('filterInstanceByUser', 1));
      }
      this._listApiRequestParams.Params = this._commonFilterParams.Params;
      //this._checklistService.LoadTodaysChecklist(this._listApiRequestParams); 
      //patch value is called and it triggers form changes and it will call api so commenting below
      //patch the form with values of the API request..
      this._patchForm(filterByStatus, (startDate ? new Date(startDate) : null), (endDate ? new Date(endDate) : null));
    });
  }
  private _patchForm(status: string, startDate: Date, endDate: Date) {
    this._filterForm.patchValue({
      filterInstanceByStatus: status,
      startDate: startDate,
      endDate: endDate
    });
  }
  private _initForm() {
    this._filterForm = this._fb.group({
      filterTodaysCheckListsView: [{ value: this._isTodaysChecklistActive ? 1 : '', disabled: false }],
      filterTodaysInstanceBySiteId: [{ value: '', disabled: false }],
      filterInstanceByUser: [{ value: this._isCompleteIncompleteChecklistActive ? 1 : '', disabled: false }],
      filterInstanceByStatus: [{ value: this._isCompleteIncompleteChecklistActive ? 'All' : '', disabled: false }],
      startDate: [{ value: '', disabled: false }],
      endDate: [{ value: '', disabled: false }],
      filterInstanceByAssignee: [{ value: '', disabled: false }]
    },
      { validator: endDateAfterOrEqualValidator }
    )
  }

  formHasError(errorName: string): boolean {
    return !StringHelper.isNullOrUndefined(this._filterForm.get('startDate').value)
      && !StringHelper.isNullOrUndefined(this._filterForm.get('endDate').value)
      &&
      this._filterForm.errors && !this._filterForm.errors["endDateLessThanStartDate"]
  }

  onPageChange(pagingInfo: AePageChangeEventModel) {
    this._listApiRequestParams.PageNumber = pagingInfo.pageNumber;
    this._listApiRequestParams.PageSize = pagingInfo.noOfRows;
    this._checklistService.LoadTodaysChecklist(this._listApiRequestParams);
  }

  onSort(sortModel: AeSortModel) {
    this._listApiRequestParams.SortBy = sortModel;
    this._checklistService.LoadTodaysChecklist(this._listApiRequestParams);
  }

  private _setActiveTabStatus(): void {
    let currentUrl = this._router.url;
    if (currentUrl.indexOf(ChecklistConstants.Routes.TodaysChecklist) !== -1) {
      this._isTodaysChecklistActive = true;
      this._isCompleteIncompleteChecklistActive = false;
    } else if (currentUrl.indexOf(ChecklistConstants.Routes.CompleteIncompleteStatus) !== -1) {
      this._isCompleteIncompleteChecklistActive = true;
      this._isTodaysChecklistActive = false;
    } else {
      this._isTodaysChecklistActive = false;
      this._isCompleteIncompleteChecklistActive = false;
    }
  }
  getChecklistStatus(status): string {
    let outputStatus = 'Incomplete';
    if (status === 2) {
      outputStatus = 'Complete';
    }
    return outputStatus;
  }
  getAssignedFullname(firstName,LastName){
    if (!isNullOrUndefined(firstName) && !isNullOrUndefined(LastName)) {
      return firstName+' '+LastName;
    }
  }
  private getFrequency(periodicity: Periodicity) {
    return extractFrequencyOfChecklist(periodicity);
  }

  getSiteName(siteName: string, location: string) {
    return this._checklistService.getSiteName(siteName, location);
  }
  getSlideoutAnimateState(): boolean {
    return this._isChecklistAction;
  }
  get SelectedAttachmentToRemove() {
    return this._selectedAttachmentToRemove;
  }
  get checkListInstance() {
    return this._checkListInstance;
  }
  getSlideoutState(): string {
    return this._isChecklistAction ? 'expanded' : 'collapsed';
  }
  onChecklistActionItemsCancel(event: any) {
    this._isChecklistAction = false;
    this._checklistService.checklistActionItemsDestroy();
  }
  onChecklistActionItemsSaveComplete(event: any) {
    this._isChecklistAction = false;
    this._checklistService.LoadTodaysChecklist(this._listApiRequestParams);
  }
  onChecklistActionItemsDocumentRemove(event$) {
    this._showDeleteConfirmDialog = true;
    this._selectedAttachmentToRemove = event$.Attachments;
    this._selectedInstanceActionItemId = event$.InstanceActionItemId;
  }
  removeActionItemDocumentClosed(event$) {
    this._showDeleteConfirmDialog = false;
  }
  removeActionItemDocumentConfirmed(event$) {
    this._checklistService.checklistActionItemsDocumentStartRemove({ "Id": this._selectedAttachmentToRemove.Id, "Name": this._selectedAttachmentToRemove.FileName, "InstanceActionId": this._selectedInstanceActionItemId });
    this._showDeleteConfirmDialog = false;
  }
  //Private Methods
  public getChecklistActionItemsStatus(item) {
    if (!isNullOrUndefined(item)) {
      let ViewingOwnChecklist = this._claimsHelper.getUserId() == item.AssignedToId;
      if (!item || item.Status == 2) {
        return false;
      }
      var isDueToday = (new Date(item.ScheduledDate)).getDate() == (new Date()).getDate();
      return ((ViewingOwnChecklist) && isDueToday);
    }
    else
      return false;

  }
  ngOnDestroy() {
    if (this._assignedUsersSub) {
      this._assignedUsersSub.unsubscribe();
    }
    if (this._formChangesSub) {
      this._formChangesSub.unsubscribe();
    }
    if (this._formValueChangesSub) {
      this._formValueChangesSub.unsubscribe();
    }
    if (this._listingDataSubscription)
      this._listingDataSubscription.unsubscribe();
    if (this._siteOptionsSubscription)
      this._siteOptionsSubscription.unsubscribe();
    if (this._globalFilterNameChangeSubscription)
      this._globalFilterNameChangeSubscription.unsubscribe();
    if (this._globalFilterWorkSpaceChangeSubscription)
      this._globalFilterWorkSpaceChangeSubscription.unsubscribe();
    if (this._totalCountSubscription)
      this._totalCountSubscription.unsubscribe();
    if (this._checklistItemActionRequestSubscription)
      this._checklistItemActionRequestSubscription.unsubscribe();
    if (this._routeParamsSub) {
      this._routeParamsSub.unsubscribe();
    }
  }

}
