import { Checklist } from '../../models/checklist.model';
import { Workspace } from '../../models/workspace.model';
import { AeTemplateComponent } from '../../../atlas-elements/ae-template/ae-template.component';
import { createPopOverVm } from '../../../atlas-elements/common/models/popover-vm';
import { Site } from '../../../calendar/model/calendar-models';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { LoadSitesAction } from '../../../shared/actions/company.actions';
import { ChecklistFilterOptions } from '../../common/checklist-filter-options.enum';
import { createSelectOptionFromArrayList } from '../../../employee/common/extract-helpers';
import { ChecklistService } from '../../services/checklist.service';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { ScheduledOrArchiveChecklist } from '../../models/scheduled-or-archive-checklist.model';
import { AePageChangeEventModel } from '../../../atlas-elements/common/models/ae-page-change-event-model';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { isNullOrUndefined } from 'util';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import { MessengerService } from '../../../shared/services/messenger.service'
import { Router } from '@angular/router';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CheckListAssignment } from '../../models/checklist-assignment.model';
import { ChecklistConstants } from './../../checklist-constants';

import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import * as fromRoot from '../../../shared/reducers';
import * as Immutable from 'immutable';
import { Periodicity } from '../../common/periodicity.enum';
import { extractFrequencyOfChecklist } from "../../common/extract-helper";
@Component({
  selector: 'scheduled-checklist',
  templateUrl: './scheduled-checklist.component.html',
  styleUrls: ['./scheduled-checklist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ScheduledChecklistComponent extends BaseComponent implements OnInit, OnDestroy {
  private _list$: BehaviorSubject<Immutable.List<CheckListAssignment>>;
  private _totalCount$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _loading$: Observable<boolean>;
  private _actions: Immutable.List<AeDataTableAction>;
  private _listApiRequestParams: AtlasApiRequestWithParams;
  private _listingDataSubscription: Subscription;
  private _filterForm: FormGroup;
  private _keys = ['Id', 'Name', 'AssignedToId', 'ScheduledDate', 'NextDueDate', 'Workspaces', 'Periodicity', 'SiteId', 'SiteLocation', 'SiteName', 'firstname', 'lastname'];
  private _checklistFilterOptions: Immutable.List<AeSelectItem<string>>;
  private _siteOptionsSubscription: Subscription;
  private _siteOptionList: Immutable.List<AeSelectItem<string>>;
  private defaultSiteOptions: Immutable.List<AeSelectItem<string>>;
  private _globalFilterNameChangeSubscription: Subscription;
  private _globalFilterWorkSpaceChangeSubscription: Subscription;
  private _viewActionCommand: Subject<Checklist> = new Subject();
  private _viewRequestSubscription: Subscription;
  //bindings
  @ViewChild('popOverTemplate')
  _popOverTemplate: AeTemplateComponent<any>;
  //bindings

  get filterForm() {
    return this._filterForm;
  }

  get siteOptionList() {
    return this._siteOptionList;
  }

  get checklistFilterOptions() {
    return this._checklistFilterOptions;
  }

  get list$() {
    return this._list$;
  }

  get dataTableOptions$() {
    return this._dataTableOptions$;
  }

  get loading$() {
    return this._loading$;
  }

  get totalCount$() {
    return this._totalCount$;
  }

  get actions() {
    return this._actions;
  }

  get keys() {
    return this._keys;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilder
    , private _checklistService: ChecklistService
    , private _router: Router, private _messenger: MessengerService
    , private _claims: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
    this._list$ = new BehaviorSubject(Immutable.List([]));
    this.defaultSiteOptions = Immutable.List([
      new AeSelectItem<string>('Any', '', false),
      new AeSelectItem<string>('All Sites', '00000000-0000-0000-0000-000000000000', false)
    ]);
    if (this._claims.isHSServiceOwnerOrCoordinator()) {
      this._checklistFilterOptions = Immutable.List([
        new AeSelectItem<string>('All Checklists', '0', false),
        new AeSelectItem<string>('My Checklists', '1', false),
        new AeSelectItem<string>('My Team Checklists', '2', false)
      ]);
    }
    else if (this._claims.isHolidayAuthorizerOrManager()) {
      this._checklistFilterOptions = Immutable.List([
        new AeSelectItem<string>('My Checklists', '1', false),
        new AeSelectItem<string>('My Team Checklists', '2', false)
      ]);
    }
    else {
      this._checklistFilterOptions = Immutable.List([
        new AeSelectItem<string>('My Checklists', '1', false)
      ]);
    }
  }

  ngOnInit() {
    this._actions = Immutable.List([
      new AeDataTableAction("View", this._viewActionCommand, false)
    ]);
    this._viewRequestSubscription = this._viewActionCommand.subscribe((item) => {
      if (!isNullOrUndefined(item)) {
        if (item.IsExample) {
          if (this._claims.canCreateExampleChecklist()) {
            this._router.navigate(["/checklist/edit/example", item.CheckListId]);
          }
          else {
            this._router.navigate(["/checklist/example", item.CheckListId]);
          }
        }
        else {
          if (this._claims.canCreateChecklist()) {
            this._router.navigate(["/checklist/edit/", item.CheckListId]);
          }
          else {
            this._router.navigate(["/checklist/preview", item.CheckListId]);
          }
        }
      }
    });

    this._initialLoadScheduledOrArchiveChecklist();
    this._initForm();
    this._siteOptionsSubscription = this._store.let(fromRoot.getSiteData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._siteOptionList = Immutable.List<AeSelectItem<string>>(createSelectOptionFromArrayList(res, "Id", "SiteNameAndPostcode"));
        this._siteOptionList = Immutable.List(this.defaultSiteOptions.toArray().concat(this._siteOptionList.toArray()));
        this._cdRef.markForCheck();
      } else {
        this._store.dispatch(new LoadSitesAction(false));
      }
    });

    this._filterForm.valueChanges.subscribe(data => {
      this._listApiRequestParams.Params.forEach((element) => {
        if (element.Key == "filterAssignmentBySiteId")
          element.Value = data.filterBySiteId;
        if (element.Key == "filterScheduledChecklistsByViewType")
          element.Value = data.statusType;
      })
      this._checklistService.LoadScheduledOrArchiveChecklist(this._listApiRequestParams);
    });

    this._listingDataSubscription = this._store.let(fromRoot.getScheduledOrArchiveChecklistData).subscribe(res => {
      if (!isNullOrUndefined(res)) {
        this._list$.next(Immutable.List<CheckListAssignment>(res));
      }
    });
    this._totalCount$ = this._store.let(fromRoot.getScheduledOrArchiveChecklistTotalCount);
    this._dataTableOptions$ = this._store.let(fromRoot.getScheduledOrArchiveChecklistPageInformation);
    this._loading$ = this._store.let(fromRoot.getScheduledOrArchiveChecklistLoadingStatus);
    this._globalFilterNameChangeSubscription = this._store.let(fromRoot.getChecklistNameChange).subscribe(res => {
      if (!isNullOrUndefined(res)) {
        this._listApiRequestParams.PageNumber = 1;
        this._listApiRequestParams.PageSize = 10;
        this._checklistService.LoadScheduledOrArchiveChecklist(this._listApiRequestParams);
      }
    });
    this._globalFilterWorkSpaceChangeSubscription = this._store.let(fromRoot.getWorkSpaceChange).subscribe(res => {
      if (!isNullOrUndefined(res)) {
        this._listApiRequestParams.PageNumber = 1;
        this._listApiRequestParams.PageSize = 10;
        this._checklistService.LoadScheduledOrArchiveChecklist(this._listApiRequestParams);
      }
    });

  }

  private _initForm() {
    this._filterForm = this._fb.group({
      statusType: [{ value: 1, disabled: false }],
      filterBySiteId: [{ value: '', disabled: false }]
    })
  }

  //private method starts here
  private _initialLoadScheduledOrArchiveChecklist() {
    if (isNullOrUndefined(this._listApiRequestParams))
      this._listApiRequestParams = <AtlasApiRequestWithParams>{};
    this._listApiRequestParams.PageNumber = 1;
    this._listApiRequestParams.PageSize = 10;
    this._listApiRequestParams.SortBy = <AeSortModel>{};
    this._listApiRequestParams.SortBy.Direction = SortDirection.Ascending;
    this._listApiRequestParams.SortBy.SortField = 'Name';
    this._listApiRequestParams.Params = [];
    this._listApiRequestParams.Params.push(new AtlasParams('checklistAssignmentinclude', true));
    this._listApiRequestParams.Params.push(new AtlasParams('filterScheduledChecklistsByViewType', ChecklistFilterOptions.MyChecklists));
    this._listApiRequestParams.Params.push(new AtlasParams('filterAssignmentBySiteId', null));
    this._checklistService.LoadScheduledOrArchiveChecklist(this._listApiRequestParams);
  }

  onPageChange(pagingInfo: AePageChangeEventModel) {
    this._listApiRequestParams.PageNumber = pagingInfo.pageNumber;
    this._listApiRequestParams.PageSize = pagingInfo.noOfRows;
    this._checklistService.LoadScheduledOrArchiveChecklist(this._listApiRequestParams);
  }

  onSort(sortModel: AeSortModel) {
    this._listApiRequestParams.SortBy = sortModel;
    this._checklistService.LoadScheduledOrArchiveChecklist(this._listApiRequestParams);
  }
  private getFrequency(periodicity: Periodicity) {
    return extractFrequencyOfChecklist(periodicity);
  }

  getSiteName(siteName: string, location: string) {
    return this._checklistService.getSiteName(siteName, location);
  }

  getAssignedFullname(firstName,LastName){
    if (!isNullOrUndefined(firstName) && !isNullOrUndefined(LastName)) {
      return firstName+' '+LastName;
    }
  }

  ngOnDestroy() {
    if (this._siteOptionsSubscription)
      this._siteOptionsSubscription.unsubscribe();
    if (this._listingDataSubscription)
      this._listingDataSubscription.unsubscribe();
    if (this._globalFilterNameChangeSubscription)
      this._globalFilterNameChangeSubscription.unsubscribe();
    if (this._globalFilterWorkSpaceChangeSubscription)
      this._globalFilterWorkSpaceChangeSubscription.unsubscribe();
  }


}
